---
title: "code-server: VS Code on a remote server"
description: "Taking apart code-server — VS Code vendored as a submodule, HTTP and WebSocket on separate channels, a heartbeat file for liveness — and the lesson of running the editor next to the worktree."
pubDate: "2026-10-19"
category: "tech"
tags: ["architecture", "worktree", "oss"]
draft: false
---

One repo lives on your company machine, another on a VPS, another on your personal laptop — the familiar routine is cloning to each machine, rebuilding the environment everywhere, then sacrificing a weekend to version drift. Coder's code-server flips the direction: the code stays on the server, and VS Code is brought to your browser. With 79,234 stars, 6,844 forks, and an MIT license (per GitHub API on 2026-09-08), this is not an experiment project — and its architecture is worth more attention than the star count.

## TL;DR

- code-server wraps VS Code as a web service: the browser is just a display, the heavy work runs on the server where the code lives.
- VS Code is vendored wholesale as a git submodule, plus a layer of named `.diff` patches — one concern per patch.
- The TypeScript server layer is thin: HTTP serves the UI, WebSocket carries the protocol, and a heartbeat file reports liveness.
- Releases ship roughly weekly: v4.131 → v4.135 in four weeks (per GitHub API on 2026-09-08).
- The lesson for Wakii: keep fork deltas small and named so upstream syncs stay cheap; running the editor next to the worktree is a natural direction.

## Flipping the editor: the code stays put, the editor travels

The usual model puts the editor on your machine and pulls the code to it. Switch machines and you rebuild the environment; get a slow machine and compiles stay slow. code-server inverts that: the repo sits on a server, the editor sits on the same server, and your browser only receives the interface and sends your input. The README puts it in one line: "Run VS Code on any machine anywhere and access it in the browser" ([coder/code-server README](https://github.com/coder/code-server#readme), accessed 2026-09-08).

The hardware requirements in the README confirm the model: a Linux machine with WebSockets enabled, 1 GB of RAM, and 2 vCPUs is enough to run a full editor — because the heavy work (compiling, testing, downloading dependencies) happens server-side and the browser only renders. That is why a thin laptop can work a large codebase as if it were sitting next to the server.

```
browser (any device)          server where code lives
┌───────────────────┐        ┌───────────────────────────────┐
│ VS Code UI shell  │◄──HTTP──│ express router → static UI    │
│ WebSocket client  │◄──WS───►│ wsRouter → editor protocol    │
└───────────────────┘        │ extensions + FS + shell       │
                             └───────────────────────────────┘
```

The two channels never mix: HTTP serves the static shell one way, WebSocket is the realtime channel carrying input down and rendered output back up. The filesystem and terminal you interact with belong to the server — exactly where the worktree is.

## Inside: two routers and a heartbeat file

code-server's server layer is a thin TypeScript wrapper around VS Code. The entry point in `src/node/app.ts` makes the two channels explicit through the `App` interface:

```ts
export interface App extends Disposable {
  /** Handles regular HTTP requests. */
  router: Express
  /** Handles websocket requests. */
  wsRouter: Express
  /** The underlying HTTP server. */
  server: http.Server
  /** Handles requests to the editor session management API. */
  editorSessionManagerServer: http.Server
}
```

(source: [src/node/app.ts @ commit 62284ed](https://github.com/coder/code-server/blob/62284ed549bc41236d62c789a071120aea206a78/src/node/app.ts), probed 2026-09-08)

The remaining question for any long-lived service is whether a session is alive or dead. code-server answers with a heartbeat file. The `Heart` class in `src/node/heart.ts` carries this verbatim comment: "Provides a heartbeat using a local file to indicate activity" ([src/node/heart.ts @ commit 62284ed](https://github.com/coder/code-server/blob/62284ed549bc41236d62c789a071120aea206a78/src/node/heart.ts)). A beat is written to the file every 60,000 ms; state moves through three stages, `alive | expired | unknown`; and any outside process — a supervisor, a cleanup script — only needs to read the file to know whether the session is active, without probing the service itself.

## Vendoring VS Code: a submodule plus a layer of named patches

VS Code has no official embedding mode for this. code-server vendors it wholesale: `.gitmodules` declares a `lib/vscode` submodule pointing straight at `https://github.com/microsoft/vscode`. On top of that base, the `patches/` directory holds `.diff` files named after their concern — the filename tells you what it changes:

| patch | concern |
|---|---|
| `app-name.diff` | rebrand the displayed name |
| `base-path.diff` | run under a sub-path |
| `keepalive.diff` | keep long connections alive |
| `csp-hashes.diff` | allow scripts under CSP |
| `disable-builtin-ext-update.diff` | stop extensions self-updating |

(source: [patches directory @ commit 62284ed](https://github.com/coder/code-server/blob/62284ed549bc41236d62c789a071120aea206a78/patches), probed 2026-09-08 — at least ten more files in the same style)

One patch per concern; no patch does several jobs. When upstream ships a new version, syncing means re-applying each diff onto the new code: conflicts are localized to the patch that touched the changed API, instead of an archaeology dig through an undifferentiated branch of edits. That is how a distribution survives years of an upstream that releases aggressively.

## Weekly releases and the price of a patch layer

The five most recent releases (per GitHub API on 2026-09-08): v4.135.0 on Aug 27, v4.134.0 on Aug 24, v4.133.0 on Aug 17, v4.132.0 on Aug 10, v4.131.0 on Jul 30 — gaps of 3 to 11 days, averaging close to one minor per week. The repo's latest push was 2026-09-06.

That weekly pace is only viable because the patch layer is small and named. If the fork delta were one large anonymous blob, every upstream sync would be a project; with the delta split into independent diffs, syncing becomes an assembly line: apply, build, run tests, repeat. The contrast worth remembering: the steady star growth is the effect, and the delta architecture is the cause.

Wakii follows a related direction — detaching the environment from any single personal machine: every SF in a story runs in its own worktree, the agent works on its branch, and merges go through gates. The process is described in the [story workflow docs](/docs/story-workflow/), with the isolation details in [parallel worktrees for change isolation](/blog/parallel-worktrees-isolation/). code-server completes the other half of the picture: the editor itself can point at the host where the worktree lives.

## What Wakii learns

- **ADOPT** — the discipline of "one concern, one named patch": code-server's `patches/` layer shows a fork delta stays cheap to maintain when each piece is small, self-describing, and independent. Wakii is a fork of Orca; the concrete proposal: keep an inventory of fork deltas by concern (name + reason + files touched) in the repo and use it as a per-item re-validation checklist on every upstream sync — instead of diffing a pile of mixed commits.
- **DIRECTION** — the editor running next to the worktree: Wakii already has SSH worktrees and story view on mobile; code-server's model suggests the completing step: point the IDE straight at the host where the worktree and the agent live. Not doing it now because it is a large surface change that needs its own decision.
- **WATCH** — a heartbeat file for liveness: a marker file beating every 60s is cheaper than polling many sources; Wakii's watchdog currently checks three layers (recent commits, terminal output, Linear state). Revisit this pattern when agent sessions run on remote hosts, where terminal polling gets expensive.

Wakii is an agentic IDE with a built-in agent team that runs right after install — if you want to see how that team divides the work, the [agents and kit docs](/docs/agents-and-kit/) are a good starting point.
