---
title: "Lapce: a Rust editor built for performance"
description: "Lapce's architecture from real code: a rope buffer with revisions, a UI split into its own process over RPC, plugins running in a WASI sandbox — how an editor stays fast as features grow."
pubDate: "2026-10-22"
category: "tech"
tags: ["architecture", "features", "oss"]
draft: false
---

Every editor written in Rust promises speed; Lapce puts "Lightning-fast And Powerful Code Editor" right in its README. Anyone can print a slogan — the lesson is in the chain of architectural decisions behind it: a rope buffer with revisions, a UI split into its own process over RPC, and plugins running inside a WASI sandbox. With 38,834 stars, an Apache-2.0 license, and a fresh push on the same day as the probe (per GitHub API on 2026-09-08), the project is pre-1.0 yet its architecture is more mature than its version number.

## TL;DR

- Lapce's buffer is a rope inheriting the xi-editor's Rope Science, with a `rev: u64` — edits travel as numbered deltas, not string replacements.
- Four crates: `lapce-app` (UI) — `lapce-rpc` (protocol) — `lapce-proxy` (fs, terminal, plugins, in its own process) — `lapce-core`.
- Plugins never enter your process: they run as WASI modules on wasmtime, with capabilities granted explicitly via `WasiCtxBuilder`.
- Remote development is a built-in feature; stable releases ship about twice a year with continuous nightlies (per GitHub API on 2026-09-08).
- The lesson for Wakii: separate data from process when handling concurrent edits; capability sandboxes for anything extensible.

## The buffer is a rope, the revision is a contract

Most editors hold text as one big string: editing a single character touches a huge memory region, and two sources editing at once are a nightmare. Lapce puts the rope at the center — the README describes the project as designed with the "Rope Science" of the xi-editor ([lapce/lapce README](https://github.com/lapce/lapce#readme), accessed 2026-09-08), meaning the text-data problems xi-editor researched in public.

In the code, that is visible immediately in `lapce-proxy/src/buffer.rs`:

```rust
pub struct Buffer {
    pub language_id: &'static str,
    pub read_only: bool,
    pub id: BufferId,
    pub rope: Rope,
    pub path: PathBuf,
    pub rev: u64,
    pub mod_time: Option<SystemTime>,
}
```

(source: [lapce-proxy/src/buffer.rs @ commit b604d57](https://github.com/lapce/lapce/blob/b604d57de4a820006d335a3be0d7583eb8fab558/lapce-proxy/src/buffer.rs), probed 2026-09-08)

The `Rope` type comes from `lapce_xi_rope` — the xi-editor rope forked straight into Lapce; the same file imports `RopeDelta`. That means changes travel as deltas: which region changed, with what content — nobody copies the whole buffer. And `rev: u64` is the concurrency contract: every buffer state gets a number; the UI, language servers, and plugins all carry the rev when they talk. A change arriving with a stale rev is detected immediately instead of silently overwriting someone else. The side effects are worth having: language servers receive incremental updates, highlighting never restarts from scratch, and edit conflicts have an explicit signal.

## The UI in its own process: lapce-rpc is the boundary

The workspace splits into exactly four crates, each one a clear boundary:

| crate | role |
|---|---|
| `lapce-app` | the interface, built on Floem |
| `lapce-core` | pure editor logic |
| `lapce-proxy` | fs, terminal, plugins — runs as its own process (`src/bin/`) |
| `lapce-rpc` | the protocol joining the two sides |

(source: [root directory @ commit b604d57](https://github.com/lapce/lapce/blob/b604d57de4a820006d335a3be0d7583eb8fab558/), probed 2026-09-08)

```
lapce-app (UI, Floem)
   │   lapce-rpc — requests/notifications, rev included
   ▼
lapce-proxy (separate process)
   ├── buffer.rs    rope + rev
   ├── terminal.rs
   ├── watcher.rs   filesystem watching
   └── plugin/      WASI host
```

The RPC boundary forces every change through a rev-carrying delta instead of implicit shared state — the mechanism above, raised to the process level. Two technical properties fall out of it: the UI never waits on the filesystem or the terminal, and a broken plugin dies on the proxy side rather than taking the editing window down. For an editor advertising "lightning-fast", this is the part that makes the claim live: speed comes from never blocking the interface thread.

## Plugins run in WASI, not in your process

Lapce plugins are written in languages that compile to WASI — the README names C, Rust, and AssemblyScript. The host lives in `lapce-proxy/src/plugin/`: `catalog.rs` discovers plugins, `lsp.rs` and `dap.rs` bridge language servers and debug adapters, and `wasi.rs` is the runtime. The most instructive part is the imports of `wasi.rs`:

```rust
use wasi_experimental_http_wasmtime::{HttpCtx, HttpState};
use wasmtime_wasi::WasiCtxBuilder;
```

(source: [lapce-proxy/src/plugin/wasi.rs @ commit b604d57](https://github.com/lapce/lapce/blob/b604d57de4a820006d335a3be0d7583eb8fab558/lapce-proxy/src/plugin/wasi.rs), probed 2026-09-08)

`WasiCtxBuilder` is where permissions are granted: a plugin does not see the filesystem or the network by default — the host builds the context and hands out capabilities one by one, following WASI's capability-based model. Even outbound HTTP goes through wasmtime's experimental module instead of raw sockets. The trust boundary therefore sits in one visible place: "the project's code" and "code someone installed" are separated by a sandbox, not by the plugin author's reputation.

## Built-in remote and the pre-1.0 rhythm

The README lists built-in remote development inspired by VSCode Remote — a "local" experience on a distant machine, with Lapdev as the team's own dev-environment service. The philosophy matches code-server (the editor runs where the code lives), except it ships inside the product rather than as a separate distribution.

The release rhythm (per GitHub API on 2026-09-08): a nightly build dated 2026-09-08 itself; the most recent stable v0.4.6 on 2026-01-21, before that v0.4.5 on 2025-09-05, v0.4.4 on 2025-08-30, and v0.4.3 on 2025-06-26. Stable lands about twice a year while the nightly carries the "new" channel daily — the split between steady and fresh is declared openly instead of left for users to guess.

The concurrency that Lapce solves at the data layer (rope delta + rev), Wakii solves at the process layer: each agent gets its own worktree, and merges go through gates — that process lives in the [story workflow docs](/docs/story-workflow/), with the per-branch isolation details in [parallel worktrees for change isolation](/blog/parallel-worktrees-isolation/).

## What Wakii learns

- **WATCH** — rope + revision as an editing contract: Wakii currently handles concurrency through process isolation (one worktree per agent, merges via gates). Promote to DIRECTION or ADOPT when the need appears for several agents editing one real surface — co-editing a single file, say — because then the data structure needs rev-carrying deltas rather than branch isolation alone.
- **DIRECTION** — a WASI-style capability sandbox for extensions: Wakii currently extends through skills (content, not third-party code) and so sidesteps the problem; but if the kit ever needs to run third-party code, the model of explicit capability grants — instead of trusting a reputation — is the pattern worth following.
- **N/A** — wgpu GPU rendering and the hand-rolled UI (Floem): Wakii is Electron (a fork of Orca) with Chromium as the renderer — swapping the renderer is outside realistic control, and the fork cost would not pay for the benefit.

To see the process-side answer to the same problem — many agents working one repo without stepping on each other — read the story workflow docs linked above and then run a real story with Wakii.
