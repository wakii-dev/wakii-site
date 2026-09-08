---
title: "DSH Desktop: a plugin-first desktop for an agent harness"
description: "DSH Desktop wraps DeepSeek Harness in a thin Electron host where the desktop shell itself is an unprivileged plugin — pinned upstream, stable/beta channels split by a fail-closed protocol, and pull requests drafted by an agent."
pubDate: "2026-10-23"
category: "tech"
tags: ["architecture", "electron", "agents", "workflow"]
draft: false
---

A repository created on August 13, 2026 reached 24,444 stars per the GitHub API on 2026-09-08 — under a month. The interesting part is not the number; it is the answer to a question every team building on an agent platform eventually faces: when the platform you wrap keeps moving, how do you extend it without hardening into a fork that drifts from upstream within months? DSH Desktop's answer fits in its own repo description: "万物皆插件" — everything is a plugin, and the desktop itself is a plugin too.

## TL;DR

- DSH Desktop is a desktop client (Windows/macOS) wrapping DeepSeek Harness (DSH): a thin Electron host launches the official upstream Host, and the Web UI runs through an HTTP/WebSocket carrier that listens on loopback by default — no homegrown renderer IPC plugin system, no Electron APIs exposed to pages.
- The desktop shell is an ordinary plugin in the upstream Cordis plugin system — it composes on the same path as third-party plugins, with no privileges.
- Upstream is pinned in the strongest sense: the vendored submodule is never modified, and stable/beta channels are split by a fail-closed update protocol — the server must echo back the exact channel and version, and any mismatch makes the client reject the response.
- The repo develops agent-first: pull-request branches named `codex/*`, architecture decisions recorded as dated ADRs under `.agents/notes/`, four stable releases in two weeks.

## A thin desktop over the harness — "host" in the literal sense

DeepSeek Harness (DSH) ships three pieces: a locally running Web UI, a Host service, and a plugin system. DSH Desktop rewrites none of them; it brings all three into a desktop app — automatically starting and managing the local Harness service, integrating the system tray and a desktop window, with no Node.js install or commands required (paraphrased from the repo's README, probed 2026-09-08). The instructive part is what the architecture doc says the desktop does NOT do: it creates no separate renderer IPC plugin system and exposes no Electron APIs to web pages — the window is just a viewport for the Host's web carrier.

| Metric | Value |
| --- | --- |
| Stars / forks | 24,444 / 1,182 — per the GitHub API on 2026-09-08 |
| License | MIT |
| Created / last push | 2026-08-13 / 2026-09-08 |
| Latest stable release | v2.0.5 on 2026-09-03 (plus v2.0.5-beta.1 the same day) |
| Stack | TypeScript, Electron host + loopback HTTP/WebSocket carrier |

The README also discloses provenance up front: this is an independent community project, not owned by, partnering with, or endorsed by DeepSeek — and the contributors shown on GitHub come from fork-inherited and synced commit history. It is a blunt warning to anyone about to read the Contributors tab as "who is behind this repo." For a fast-rising repo, saying that yourself is rare.

## "Everything is a plugin" — including the desktop shell

The repo's plugin-ecosystem doc calls the desktop shell the first exemplar of its own plugin philosophy: an ordinary DSH plugin that composes on the same path as official and third-party plugins, with no privileges — instead of hand-patching upstream source into a fixed shell. Three principles govern the ecosystem: composition first (compose through official slots, services, and patches; never assume or override other plugins' internals), clear declaration (declare the services and slots you depend on; never rely on runtime coincidence), and compatibility first (upgrades stay backward compatible).

— docs/plugin-ecosystem.md, [anywhere-labs/dsh-desktop](https://github.com/anywhere-labs/dsh-desktop/blob/main/docs/plugin-ecosystem.md) (probed 2026-09-08)

The same discipline shows at the app layer. The architecture describes a "generation" lifecycle: every profile or mode switch disposes the current generation entirely, and nothing is cached across generations — no service references, no window objects, no subprocess handles. The docs even police themselves on security: the Community Fabric draft (manifest, capabilities, host descriptor, events) is currently documentation only, and its capabilities are for compatibility checks, user confirmation, and auditing — "won't pretend same-process JavaScript is a security sandbox."

## Pinned upstream — and a fail-closed channel protocol

Upstream is pinned in the hardest sense: the vendored `deepseek-harness/` submodule keeps its own pnpm workspace untouched, neither the stable nor the beta channel modifies it, and an `upstream.json` file records the upstream version, commit, and vendored runtime manifest for both channels. Stable and beta are not even split by git branches — they are two physical npm packages and two separate applications.

The frame-worthy part is the update protocol, written as a fail-closed contract between client and server:

```text
check      :  sends header X-DSH-Desktop-Channel: stable|beta + current version
download   :  sends X-DSH-Desktop-Target-Version
contract   :  the server MUST respond with the exact requested channel + version
              → any mismatch  ⇒ the client treats the response as INVALID
              → missing header ⇒ treated as stable (safe default)
stable accepts only official SemVer  ·  beta only "-beta.N"
```

— summarized from docs/architecture.md, [anywhere-labs/dsh-desktop](https://github.com/anywhere-labs/dsh-desktop/blob/main/docs/architecture.md) (probed 2026-09-08)

There is no silent path to cross-channel downloads: beta auto-update only queries the beta channel, and "switch to stable" is a separate explicit operation that may install a lower version alongside the beta. All the verification weight sits on the server: if the server has not implemented the echo rule, the client treats the response as garbage rather than guessing.

## A repo built by agents — that still keeps decision records

The development rhythm is itself a signal. Four stable releases (v2.0.2 through v2.0.5) shipped in the last two weeks of August; on the morning of the probe, September 8, the repo had just merged PR #879 preparing the 2.0.6 release. More telling is who drafts the pull requests: proposal branches are named `codex/*` — drafted by the Codex agent and reviewed by maintainers, covering everything from a race condition on the market's Discover page (#883) to "recover blank and unresponsive runtime pages" (#880) — a watchdog for blank-frozen runtime windows.

| PR / commit (2026-09-08) | What it does |
| --- | --- |
| #883 `codex/fix-market-discover-race` | fix a race when loading the market Discover page |
| #881 `codex/move-data-directory-path-hint` | move the data-directory hint to the confirmation step |
| #880 `codex/813-runtime-blank-watchdog` | recover blank, unresponsive runtime pages |
| #879 `codex/release-2.0.6` | prepare the next release |

Major architecture decisions are recorded as dated notes under `.agents/notes/implemented/` — for example "pinned upstream and isolated Yarn workspace" (2026-08-15) or "native shell generation and platform adapters" (2026-08-19). An agent-written repo that still keeps an ADR ledger is proof that documentation discipline and agent speed do not trade off against each other.

That combination — pinned upstream, every extension through the platform's own plugin mechanism, agents shipping under supervised review — is how Wakii organizes its own work in a different shape: stories run through the [story-workflow docs](/docs/story-workflow/), and the discipline of staying current with upstream is told in [oss-upstream-sync](/blog/oss-upstream-sync/).

## What Wakii learns

- **DIRECTION** — pin-and-wrap as an alternative to fork-and-merge: wrap upstream in a vendored submodule that is never modified, build all added value through upstream's own plugin mechanism, and keep dated ADRs. Wakii forks Orca with merge-based sync and that works today; but if upstream friction grows, this is the mirrored shape worth putting on the direction board.
- **DIRECTION** — a fail-closed channel protocol for updates: the server must echo back the exact requested channel and version, any mismatch invalidates the response, and no silent cross-channel download path exists. Wakii runs no update server of its own (the feed reads GitHub releases), so this is not directly applicable yet — but the "client rejects a non-matching response" shape is worth keeping for any future distribution-channel claim.
- **WATCH** — the repo is under a month old (created 2026-08-13); four stables in two weeks is a cadence still being found, the plugin market and the Fabric contract exist only as documents, and mobile remote still carries a "coming soon" badge. Revisit when the contract becomes a working standard.
- **N/A** — the sponsor wall and API-aggregator marketing in the README: ecosystem commercialization problems, irrelevant to Wakii's product surface.

Wakii is an agentic IDE with a superpowers team built in — 9 agents with separated powers, every step through gates before it reaches you. [Get Wakii](/docs/getting-started/) and run a story.
