---
title: "Relay cloud architecture: signals between machines"
description: "This post dissects Wakii's relay cloud architecture through the public code itself: why the phone and the desktop never connect directly, how the splice state machine pairs two sessions, and how admission budgets and close codes keep one cell from failing silently."
pubDate: "2026-09-25"
category: "tech"
tags: ["architecture", "agents"]
draft: false
---

When you open the Wakii app on your phone to follow an agent running on the machine at home, your signal does not fly straight from the phone to the desktop. Between the two machines sits a relay cloud: a server tier that accepts a connection from each side and then splices them together. What is worth discussing is not that an intermediary exists — it is how that intermediary is designed. Both the phone and the desktop only dial outward; neither side opens a port the other could touch. This post walks that relay through the public code in the `wakii-dev/wakii` repo: the handshake, the splice state machine, admission budgets, and the operations workflows.

TL;DR:

- Phone and desktop never connect directly: each opens exactly one outbound connection to a relay cell; no inbound ports, no NAT traversal.
- The desktop host must prove its identity with a signed challenge before the cell pairs the session; a nine-state splice machine blocks acknowledging a fake splice.
- Resource limits live in a public contract: a per-cell connection hard cap, splice water marks, and six close codes instead of silent disconnects.
- Operations split cleanly: one image runs both director and cell, the fence broker keeps a mutation monopoly, and the GitHub workflows default to inert on the public repo.

## Why not connect directly

A desktop behind a home router and a phone on 4G both sit behind NAT. Connecting the two machines directly means hole-punching, port forwarding, or a VPN — each with its own operational pain. The relay takes a different path: both sides dial out to an intermediary server, and that server does exactly one job — pairing two connections that already exist. Verbatim from the README of the `cloud/` directory:

```text
Phones and desktops never talk to each other directly: each opens an
outbound WebSocket to a relay cell, the relay pairs the two sessions,
and it splices frames between them. A director assigns hosts to cells
and coordinates migrations; cells carry the user connections.
```

*Source: cloud/README.md, public repo wakii-dev/wakii, retrieved 2026-09-08.*

```ascii
   mobile app                            desktop host
     (phone)                            (your dev machine)
      │                                      │
      │ 1 outbound WSS                       │ 1 outbound WSS
      │ (no inbound port)                    │ (control channel, Bearer JWT)
      ▼                                      ▼
┌─────────────────────────────────────────────────────┐
│ relay cell — cloud/apps/relay                       │
│ pairs the two sessions, splices frames between them │
│ (wire contract: cloud/packages/relay-contract)      │
└──────────────────────────┬──────────────────────────┘
                           │ heartbeat, inventory
                           ▼
          director + Cloud SQL — assigns hosts to cells,
          coordinates migrations (cloud/infra/terraform)
```

*Source: cloud/README.md and cloud/packages/relay-contract/src/, retrieved 2026-09-08.*

In exchange for one extra network hop, you get three things: no open door into your machine, one uniform place to enforce admission control, and a single point to monitor. This is the machinery underneath the [reviewing agents from your phone](/blog/review-ai-agents-from-your-phone/) experience: the phone app does not need to know where your desktop is — it only needs to reach one cell.

## The control connection and host identity

The desktop side is where the public code is most explicit. `src/main/runtime/relay/relay-control-client.ts` opens a WebSocket to the cell with exactly one set of parameters: an `authorization: Bearer <relayJwt>` header, `perMessageDeflate` disabled, a 64 KB `maxPayload`, and a 15-second deadline covering the whole connect phase. Alongside it runs a silence watchdog — if the control channel receives nothing past the limit, the socket is terminated deliberately instead of hanging.

The client manages the connection with a small state machine:

```ts
type RelayControlState =
  | 'idle' | 'opening' | 'proving' | 'active' | 'draining' | 'closed'

const RELAY_CONTROL_CONNECT_DEADLINE_MS = 15_000

// relay-host-proof.ts — tolerates routine NTP drift
const RELAY_HOST_PROOF_CLOCK_SKEW_MS = 30_000
const MAX_HOST_PROOF_CHALLENGE_WINDOW_MS = 10_000
```

*Source: src/main/runtime/relay/relay-control-client.ts and relay-host-proof.ts, public repo wakii-dev/wakii, retrieved 2026-09-08.*

The `proving` state is the interesting part: before being considered `active`, the desktop must answer a challenge. `relay-host-proof.ts` signs a transcript with an HMAC plus NaCl (the `tweetnacl` library), inside a 10-second challenge window with 30 seconds of clock skew tolerance — enough for routine NTP drift, not enough for stale replays. The host identity is not a server-assigned name: the host id is derived from the public key of the E2EE keypair the desktop holds itself (`desktop-relay-service.ts` calls `runtimeRpc.getE2EEKeypair()` right at construction). The cell does not have to trust any claim; it verifies with math.

## The splice state machine: no fake splices acknowledged

The wire contract shared by the relay, the desktop app, and the mobile app lives in one package: `cloud/packages/relay-contract`. Its core is the splice state machine — a strict definition of which states a paired session may pass through, and in which order:

```ts
export const SPLICE_STATE = {
  PRE_AUTH_ADMITTED: 'pre-auth-admitted',
  CREDENTIAL_LEASE_RESERVED: 'credential-lease-reserved',
  HOST_NOTIFIED: 'host-notified',
  ATTACH_PENDING: 'attach-pending',
  HOST_ATTACHED: 'host-attached',
  CLIENT_ACKNOWLEDGED: 'client-acknowledged',
  SPLICED: 'spliced',
  E2EE_CONFIRMABLE: 'e2ee-confirmable',
  TEARDOWN: 'teardown'
} as const
```

*Source: cloud/packages/relay-contract/src/splice-state-machine.ts, retrieved 2026-09-08.*

Read the order as one long handshake: the session is admitted before authentication, holds a credential lease, notifies the host, waits for the host to attach, waits for the client to acknowledge, and only then becomes `spliced`. From any state there are exactly two exits: advance one step, or `teardown`. No shortcuts.

My favorite detail sits in a single function: `mayAcknowledgeClient` returns true only when the machine is in `host-attached` and both forwarding handlers are installed. The code comment states the reason plainly: acknowledging success before both forwarding handlers exist can strand a client on a fake splice — the client believes it is connected while frames vanish into nowhere. That is the hardest class of bug to catch in distributed systems, and it is blocked by four lines.

## Admission budgets and close codes

One cell serves many session pairs at once, so resource limits must be published numbers, not server instinct. In `admission-budgets.ts`: each cell has a connection hard cap (600 by default, within a design range of 600–3000), part of that budget is reserved for host controls — ordinary sockets stop at a ceiling equal to the hard cap minus the reserve. The splice has low/high water marks at 64 KB / 256 KB, and a splice wedged for more than 10 seconds counts as wedged.

When a connection is rejected or cut, it does not die silently. Six close codes state the reason:

| Code | Name | Situation |
| --- | --- | --- |
| 4401 | BAD_OUTER_CREDENTIAL | wrong outer credential |
| 4404 | HOST_OFFLINE | host not online |
| 4408 | PEER_DROPPED | the other end hung up |
| 4409 | WRONG_CELL | host does not belong to this cell |
| 4429 | LIMIT_EXCEEDED | admission budget exceeded |
| 4503 | DRAINING | cell draining, no new sessions |

*Source: cloud/packages/relay-contract/src/admission-budgets.ts and close-codes.ts, retrieved 2026-09-08.*

The same contract answers the "how many regions" question: the region catalog has exactly two valid values — `us-central1` (the default) and `asia-east2` — enforced with a zod schema whose probe origins must be canonical HTTPS URLs. The choose-a-nearby-cell problem is real, but its solution space is locked inside a two-element array.

## Director, fence broker, and the workflows

One directory, `cloud/apps/relay`, builds a single image; that image runs as director or cell depending on the `ORCA_RELAY_ROLE` environment variable. The director carries no user traffic — it assigns hosts to cells and coordinates migrations between them.

Two more services split the infrastructure roles. `relay-fence-broker` is a separate service that accepts IAM-only connections; it owns the durable mutation lease and the Terraform checkout, while the workflow calling it holds read and invoke rights only — never the mutation permissions themselves. `relay-ops` is the operations console and the incident monitor behind the `pnpm ops:relay` and `pnpm incident:relay` commands.

This entire operations surface is public as GitHub workflows, and the file names tell the story themselves:

```text
.github/workflows/
  cloud-deploy-relay-fence-broker.yml       "Deploy Relay Fence Broker"
  cloud-monitor-relay-clock-skew.yml        "Monitor Relay Cell Clock Skew"
  cloud-operate-relay-production-rehome.yml "Operate Relay Production Rehome"
  … (24 cloud-*.yml workflows)
```

*Source: .github/workflows/ and cloud/README.md, retrieved 2026-09-08.*

"Deploy Relay Fence Broker" resolves the image at an exact commit and then verifies a ready singleton revision; "Monitor Relay Cell Clock Skew" measures the Date-header skew of every relay cell — which matters because the signed challenge above is clock-sensitive. The most important operational fact: every job is gated on the repository variable `ORCA_CLOUD_OPERATIONS_ENABLED == 'true'`, which is unset on the public repo, so the whole infrastructure block sits inert by default. Only "Cloud Verify" is ungated — it builds, typechecks, tests, and validates the relay Terraform on every pull request, including from forks. You can read the entire topology without being able to run a single step against the real infrastructure.

## Wrap-up

Frequently asked configuration and operations questions — including relay and device pairing — are collected on the [FAQ](/docs/faq/) page. To check the claims yourself, every path cited here is on the public `wakii-dev/wakii` repo under the MIT license: open `cloud/README.md`, then descend into `packages/relay-contract`, and you will find exactly what this post describes. To experience the mobile side connected through this relay, download Wakii and open the Superpowers panel — your signal will travel the exact path in the diagram above.
