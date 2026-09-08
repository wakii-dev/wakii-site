---
title: "mcp-chrome: when the agent drives your own Chrome"
description: "mcp-chrome turns your real Chrome into an MCP server — the agent reuses your tabs, cookies and logins instead of a separate browser. A dissect of the extension + native host architecture, with the development cadence as of 2026-09-08."
pubDate: "2026-10-11"
category: "tech"
tags: ["features", "agents", "workflow"]
draft: false
---

Most browser automation tools for agents take the same road: launch a separate, pristine browser — usually headless. Clean, yes, but it is the agent's browser: no logins of yours, no session cookies, none of your configuration. hangwin/mcp-chrome picks the opposite side: instead of issuing the agent a fresh browser, it opens the Chrome you are already using to agent control. This post dissects how the repo does it with three pieces — an extension, a native host, and MCP — and reads one number that is hard to ignore: 12,393 stars on a repo whose main branch has been quiet since 2026-01-06 (per the GitHub API on 2026-09-08).

TL;DR:

- mcp-chrome is a Chrome extension that doubles as an MCP server: an AI client connects over Streamable HTTP to `127.0.0.1:12306/mcp` and drives the very Chrome you have open, reusing existing logins and configuration.
- The architecture has three hops: the client speaks MCP to a native server (the `mcp-chrome-bridge` npm package), the native server speaks native messaging to the extension, and the extension calls Chrome APIs on real tabs.
- The most teachable pattern: a recorded flow becomes a dynamic MCP tool named `flow.<slug>` with an auto-generated input schema — a recorded interaction turns into a tool the agent can call.
- The real cadence: five releases within June 2025, then v1.0.0 on 2025-12-29, and the last commit on 2026-01-06 — roughly eight months without a new commit as of the probe date.
- Wakii takes the opposite side — the embedded browser belongs to the agent — but the lessons about login sessions and action evidence apply directly.

## Your browser, not the agent's browser

The repo's README states the difference compactly: "Chrome MCP Server directly uses your daily Chrome browser, leveraging existing user habits, configurations, and login states" (hangwin/mcp-chrome, README). Translated into mechanics: the extension runs inside your Chrome, so everything Chrome already has — sessions, cookies, your profile — is available to the agent with no re-login step.

Against the familiar Playwright-style path, the difference lands on three axes:

| Axis | Separate browser (Playwright-style) | The user's Chrome (mcp-chrome) |
|---|---|---|
| Process | Launches a new browser process, ships its own binaries | Uses the Chrome already open |
| Login sessions | Re-authenticate in a clean environment | Reuses existing cookies and sessions |
| Startup | Wait for the process to boot | The extension switching on is enough |

*Source: paraphrase of the comparison table in the hangwin/mcp-chrome README, retrieved 2026-09-08.*

The price of that convenience is also built into the design: the agent acts as you — your cookies, your sessions. The trust boundary stops being "the agent's browser" and becomes "the user's browser", and every security question changes character accordingly. The probe numbers: 12,393 stars, MIT license, not archived, main branch last pushed 2026-01-06 — all per the GitHub API on 2026-09-08.

## Three hops from client to Chrome tab

The chain reads straight off the source tree, and it is exactly three hops long:

```ascii
MCP client (any AI)        native server               Chrome extension
  "click button X" ──────►  mcp-chrome-bridge pkg ───►  background script
   Streamable HTTP           (Node >= 20)                native-host.ts
   127.0.0.1:12306/mcp          │                             │
                                └──── native messaging ──────┘
                                                              ▼
                                                 chrome.* APIs on real tabs
                                                 tools/browser/* (30 modules)
```

*Source: assembled from the README and the source tree of hangwin/mcp-chrome at commit f48e717, retrieved 2026-09-08.*

The client speaks MCP over Streamable HTTP (or stdio if the client only supports that road); the native server is a globally installed npm package called `mcp-chrome-bridge`; past that point, the extension's background script receives commands, looks them up in its tool table, and calls Chrome APIs on real tabs — the `tools/browser/` directory holds 30 modules, from screenshot, interaction and keyboard through network capture and vector search, while the README advertises 20+ tools.

The detail worth attention in the middle hop: the background extension does not sit idle waiting for orders. The code keeps the native port alive with a self-healing reconnect rhythm:

```ts
const RECONNECT_BASE_DELAY_MS = 500;
const RECONNECT_MAX_DELAY_MS = 60_000;
const RECONNECT_MAX_FAST_ATTEMPTS = 8;
const RECONNECT_COOLDOWN_DELAY_MS = 5 * 60_000;
```

*Excerpt from app/chrome-extension/entrypoints/background/native-host.ts at commit f48e717: github.com/hangwin/mcp-chrome/blob/f48e71751e00bc09725c7e173423cff4f2ccd12a/app/chrome-extension/entrypoints/background/native-host.ts*

Meaning: eight fast attempts with exponential backoff starting at 500ms, capped at 60 seconds, with jitter so reconnects do not stampede in lockstep, then a 5-minute cooldown. The extension's service worker (Manifest V3) is kept alive by a separate keepalive — a code comment states the purpose outright: "keep SW alive". One operations lesson, compressed into four constants.

## A recorded flow becomes a tool for the agent

The most interesting part lives in `register-tools.ts` — where the native server answers the list-tools request. Beyond the static tool set shipped in the package, the server asks the extension back for its recorded flows, and turns each flow into an MCP tool:

```ts
const name = `flow.${item.slug}`;
```

*Excerpt from app/native-server/src/mcp/register-tools.ts at commit f48e717: github.com/hangwin/mcp-chrome/blob/f48e71751e00bc09725c7e173423cff4f2ccd12a/app/native-server/src/mcp/register-tools.ts*

The tool's schema is not hand-written. The code reads the flow's variable list — label, type string/number/boolean/enum/array, default value, required or not — and builds a matching inputSchema, plus four shared run options (tabTarget, refresh, captureNetwork, returnLogs). A procedure you record once — fill the form, press the button, wait for the result — becomes a tool the agent can call by name, with controlled parameters.

This is the "recorded interaction becomes an API" pattern: the hard part of automation (right selectors, right order) is frozen inside the flow; the flexible part (the input values) opens up as a schema. The agent does not have to look at the page and re-derive each step — it calls a tool that already has a shape.

## 12,393 stars and eight months of silence

The release timeline tells a clear story (all of it per the GitHub API on 2026-09-08):

| Tag | Release date |
|---|---|
| v0.0.2 | 2025-06-11 |
| v0.0.3 | 2025-06-16 |
| v0.0.4 | 2025-06-22 |
| v0.0.5 | 2025-06-23 |
| v0.0.6 | 2025-07-09 |
| v1.0.0 | 2025-12-29 |

Five releases inside less than a month of June 2025 — exactly the rhythm the README claims for itself: "The project is still in its early stages and is under intensive development" (hangwin/mcp-chrome, README). Then the rhythm stopped: five months later came v1.0.0, and the final commit on the main branch is the merge of PR #272 on 2026-01-06 — roughly eight months as of the 2026-09-08 probe.

The number worth reading is the ratio: 12,393 stars alongside eight months of silence. Demand, the market has confirmed — "let the agent use my real browser" is something many people want; the maintenance, nobody has visibly picked up at the origin repo. If you plan to build on it: the patterns in the code remain worth studying, because reading them is a one-time cost; but an operational dependency on a stopped repo deserves a fork plan. The open question as of the probe date: is this a mid-course pause or a full stop — no signal either way.

## What Wakii learns

- **DIRECTION** — "the user's browser" as an optional mode of the embedded browser. Wakii's B0 browser test currently runs on the agent's browser (the embedded browser described in the Design Mode post); for flows that require login, an explicit, per-use-confirmed "reuse the user's session" mode would open the class of problems a clean browser never reaches. Not applicable today because the blast radius changes completely: the agent would act with the user's cookies, which needs a consent and scope-limiting design first.
- **WATCH** — the "recorded interaction becomes a tool" pattern (`flow.<slug>` with auto-generated schemas): it matches the idea of recording a browser probe once and having the verifier replay it many times, but Wakii has no record-replay surface yet; upgrade condition: when the embedded browser gains a way to record scenarios.
- **WATCH** — maintenance status: eight months without a commit (per the GitHub API on 2026-09-08) — the patterns are readable, a live dependency is risky; upgrade condition: upstream resumes development, or a community-recognized fork emerges.

Wakii's browser strategy — the embedded browser, Design Mode, and the B0 gate — lives in the [Superpowers panel docs](/docs/superpowers-panel/). Read how Wakii lets agents reach the real desktop in [native computer use](/blog/feature-computer-use-native/), and how a single click on the UI becomes agent context in [Design Mode](/blog/feature-design-mode/). Wakii is an agentic IDE with a built-in superpowers team — download it, let the agents run, and keep the deciding to yourself.
