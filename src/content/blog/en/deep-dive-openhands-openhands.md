---
title: "OpenHands: from research project to self-running agent platform"
description: "How OpenHands separates the agent runtime from its control center: a sandboxed agent-server behind GUI, API and CLI, architecture guarded by a CI test, and six releases in twenty days."
pubDate: "2026-10-07"
category: "tech"
tags: ["agents", "architecture", "oss"]
draft: false
---

On March 13, 2024, OpenHands appeared on GitHub as a research project about autonomous coding agents. Two and a half years later, the repo — 86,809 stars per the GitHub API on 2026-09-08 — has changed roles: it is now Agent Canvas, a self-hosted control center where you operate not only its own agent but also Claude Code, Codex, or Gemini CLI. The interesting lesson is not the star count but the split: the agent runtime is separated from the control surface — the agent runs as a service with its own address, and three entry points — GUI, API, CLI — all look down at exactly one runtime. This article dissects that architecture from real code on main, every number stamped with its pull date.

TL;DR:

- OpenHands left the research-agent role to become Agent Canvas: a control center for many agents, including third-party agents over ACP.
- Runtime is separated from interface: the agent-server runs as its own service (a container with an address); the frontend is just a client.
- GUI, API and CLI are three doors into one runtime — switching backends does not change how you operate agents.
- Architecture is enforced by a test: a CI check scans the source tree and blocks every HTTP shortcut that bypasses the sanctioned client.

## From research project to control center

OpenHands started life as OpenDevin — a research line on agents working inside sandboxes and editing real code. The README now describes it in one line: "OpenHands Agent Canvas turns your coding agents into a self-hosted, always-on engineering team" (README of OpenHands/OpenHands, [github.com/OpenHands/OpenHands](https://github.com/OpenHands/OpenHands)). That line marks the pivot: the product sells the operator's chair for many agents — its own and third-party ones.

Snapshot per the GitHub API on 2026-09-08:

| Metric | Value |
|---|---|
| Stars | 86,809 |
| Forks | 11,376 |
| License | MIT |
| Repo created | 2024-03-13 |
| Last push | 2026-09-08 |
| Latest release | v1.16.0 — 2026-08-27 |

The release rhythm is dense: six releases from v1.11.0 to v1.16.0 in twenty days (Aug 7 to Aug 27, two of them on the same day — per the GitHub API on 2026-09-08). The README wears a beta badge, yet main gets daily pushes — a platform built in public.

## GUI, API, CLI — three doors into one runtime

Agent Canvas's control design: one agent runtime, many touch points. The `agent-canvas` command launches the whole local stack; split it with `--frontend-only` (static frontend plus ingress) or `--backend-only` (agent server plus automation backend) — per the README.

The frontend is a client: point `VITE_BACKEND_BASE_URL` at any agent-server and the UI connects. A client-side backend registry tracks the active backend, checks health, and switches between local or remote ones. One small rule in the repo's spec pins the experience: "Switching backends shall redirect to the same section but on the new backend" ([specs/backend-management.md](https://github.com/OpenHands/OpenHands/blob/f7fb0c4b21f5ed726edbba8a6309634ef434b004/specs/backend-management.md)). Switch backend without leaving the page, never see stale data — a small detail that decides whether a control center deserves the name "center".

The same runtime serves automation: a separate backend runs agents on schedules or webhooks, integrating Slack, GitHub, and Linear.

```text
        GUI (Agent Canvas)      CLI (agent-canvas)      Automations
                 \                     |                     /
                  \                    |                    /
                   v                   v                   v
                +-------------------------------------------+
                |        ingress — a single local origin     |
                +---------------------+---------------------+
                                      |
                   +------------------+------------------+
                   |       agent-server — the service    |
                   |  conversations · events · tools     |
                   +------------------+------------------+
                                      |
                            sandbox (Docker / VM / cloud)
```

## Sandbox runtime: the agent as a service with an address

The most load-bearing fact: the agent does not run inside the browser tab. The repo's own AGENTS.md draws the boundary — the agent-server is a separate component that owns "Python SDK, Agent Server, agent/tool behavior, conversations, workspaces, events" (AGENTS.md of OpenHands/OpenHands, [AGENTS.md](https://github.com/OpenHands/OpenHands/blob/f7fb0c4b21f5ed726edbba8a6309634ef434b004/AGENTS.md)). The frontend renders and calls APIs; execution, workspace state, and event storage live in the service.

The canonical example: `examples/acp-docker`. One `docker compose up` brings up a `ghcr.io/openhands/agent-server` container at `localhost:8010` — the agent server as a service with an address, still boxed inside a container, not touching the host filesystem. A fresh container has no host login, so credentials come through the Canvas UI; builds stay reproducible because the image is pinned from one config file (`config/defaults.json`) — two people get the same image.

The boundary is also written down. The architecture doc lists what Agent Canvas does not do: no direct execution of agent actions, no sandbox or isolation layer, no LLM credentials outside the configured backend ([docs/architecture.md](https://github.com/OpenHands/OpenHands/blob/f7fb0c4b21f5ed726edbba8a6309634ef434b004/docs/architecture.md)). A control center that can say "this is not my job" is a control center that keeps itself from ballooning into a runtime.

## Architecture enforced by a test, not by hope

Writing the boundary into docs is half the work; the other half is making something break when someone crosses it. OpenHands picked the least forgiving option: a test in CI scans the whole `src/` tree for any direct HTTP call to the agent-server that bypasses the sanctioned client. The test name tells the whole story: "uses typed @openhands/typescript-client access instead of ad-hoc HTTP" ([src/api/no-direct-agent-server-calls.test.ts](https://github.com/OpenHands/OpenHands/blob/f7fb0c4b21f5ed726edbba8a6309634ef434b004/src/api/no-direct-agent-server-calls.test.ts)):

```ts
const violations = collectSourceFiles(SRC_ROOT).flatMap((relPath) => {
  const source = readFileSync(join(SRC_ROOT, relPath), "utf8");
```

Three files sit in a public allow-list — taking the shortcut means writing your file's name into it, a trace a reviewer sees.

Second mechanism: the host's automation UI holds no data of its own. Everything — navigation, endpoints, page substance — arrives from a manifest published by the `@openhands/extensions` package; if the manifest is missing or fails admission, routes return 404 and the nav entries do not render ([src/manifests/automation-interface.ts](https://github.com/OpenHands/OpenHands/blob/f7fb0c4b21f5ed726edbba8a6309634ef434b004/src/manifests/automation-interface.ts)). An entire feature cluster can appear or vanish with the manifest — the host does not change code.

Architecture decisions get managed as specs: numbered rules with stable IDs, one checkable acceptance line each:

```
### BM-002: Switching backends keeps the user on the same page
- [x] Switching backends shall redirect to the same section but on the new backend.
```

Three rules, BM-001 through BM-003, each one observable behavior, no decorative prose (specs/backend-management.md, linked above). Rules with IDs can be cited in review, checked by a gate, caught when they drift.

## What Wakii learns

- **ADOPT** — the "not responsible for" list in architecture docs (covered above): Wakii describes each agent by the job it does ([Agents & kit](/docs/agents-and-kit/) lists the 9 agents with their roles), but never states publicly what each one does not do — "the task-executor does not approve its own code", "the verifier does not fix bugs". One boundary line per role in the docs and in the kit's agent definitions turns the "separated powers" principle into a readable contract.
- **DIRECTION** — a multi-backend control center with a registry and health checks: Wakii's agent runtime currently runs locally; "agent-server as a service with an address, frontend as a client" is the natural path toward running stories remotely (the relay-cloud direction). Not applicable today — it needs a backend service first.
- **WATCH** — two things. ACP compatibility (running Claude Code, Codex, and Gemini in the same control center) is a strategic decision awaiting an epic-level call. And an automation backend that runs agents on schedules or webhooks: Wakii's watchdog only works within a session; scheduled runs need relay infrastructure.
- **N/A** — team-scale self-hosting (helm charts, k8s) and publishing the UI as an npm library for embedding: Wakii is a desktop IDE for one developer, and does not compete at the cluster-ops layer.

Agent Canvas's three-doors-one-runtime design mirrors Wakii's opposite bet: one runtime, authority split across nine agents instead of three interfaces — see [nine agents, separated powers](/blog/nine-agents-separated-powers/), and the preinstalled team in [zero-setup agent team](/blog/zero-setup-agent-team/). The full kit is documented in [Agents & kit](/docs/agents-and-kit/). Grab Wakii, let the agents run — the consequential decisions stay yours.
