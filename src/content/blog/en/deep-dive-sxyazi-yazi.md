---
title: "Yazi: a terminal file manager written in Rust"
description: "Inside Yazi's architecture — a 31-crate workspace, an async scheduler with priorities, image-protocol negotiation with a fallback chain, and Lua plugins with a package manager."
pubDate: "2026-10-21"
category: "tech"
tags: ["terminal", "architecture", "cli"]
draft: false
---

A terminal file manager sounds like a relic — until you open a directory with tens of thousands of files on a 4K screen and want to preview images, watch videos, and filter filenames without leaving the keyboard. Yazi — the name means "duck" — by sxyazi is modern in exactly that sense: 42,043 stars, 1,009 forks, MIT license (per GitHub API on 2026-09-08), with an official description of "Blazing fast terminal file manager written in Rust, based on async I/O" ([sxyazi/yazi](https://github.com/sxyazi/yazi), GitHub API 2026-09-08). The interesting part is not the speed. It is how the repo organizes a complex TUI application: looking at its workspace is like reading a complete architecture map.

## TL;DR

- The workspace has 31 `yazi-*` crates — one concern per crate: core, scheduler, plugin, adapter, dds, vfs, watcher…
- Fully async I/O; the background scheduler classifies tasks, has three priority levels, real-time progress, and cancellation.
- Image preview works by protocol negotiation: Kitty placeholders, iTerm2 inline, Sixel — falling back to Überzug++ and then Chafa ASCII.
- Plugins are "just some pieces of Lua" — reaching into UI and theme — with a one-command package manager and version pinning.
- Wakii takes a direction (priority background scheduler) and a pattern (deliberate degradation across environments).

## Thirty-one crates, one workspace

Open the repo root and the biggest architectural decision is visible at a glance: not one large crate with internal modules, but 31 `yazi-*` crates (probed via GitHub API on 2026-09-08). One concern per crate, with compile-time boundaries:

| crate group | role |
|---|---|
| `yazi-core`, `yazi-fm` | navigation core + file manager UI |
| `yazi-scheduler` | background task queue: preload, preview, fetch… |
| `yazi-plugin` + `yazi-binding` | Lua runtime for plugins |
| `yazi-adapter`, `yazi-term`, `yazi-tty` | terminal communication + image protocols |
| `yazi-dds` | cross-instance pub-sub |
| `yazi-vfs`, `yazi-sftp`, `yazi-watcher` | virtual filesystem, remote, file watching |

(source: [repo root @ commit 8c2b5f8](https://github.com/sxyazi/yazi/tree/8c2b5f8cad4a5a97cfe924419f6f3ec0cd88b609), probed 2026-09-08 — plus adapter/emulator/parser/proxy/widgets…)

These boundaries force every dependency through a declared edge: the scheduler crate cannot import the UI crate "just this once" to draw something. For a TUI that works in the background continuously — counting files, decoding images, running plugins — that separation is what makes performance measurable and regressions localizable.

## Async at every level: a scheduler with priorities

Yazi's README asserts that all I/O is async, CPU tasks spread across threads, and the task system carries "real-time progress updates, task cancellation, and internal task priority assignment" ([Yazi README](https://github.com/sxyazi/yazi#readme), accessed 2026-09-08). The code confirms the seriousness. `yazi-scheduler/src/lib.rs` at HEAD declares three priority levels driven from config:

```rust
const LOW: u8 = yazi_config::Priority::Low as u8;
const NORMAL: u8 = yazi_config::Priority::Normal as u8;
const HIGH: u8 = yazi_config::Priority::High as u8;
```

(source: [yazi-scheduler/src/lib.rs @ commit 8c2b5f8](https://github.com/sxyazi/yazi/blob/8c2b5f8cad4a5a97cfe924419f6f3ec0cd88b609/yazi-scheduler/src/lib.rs), probed 2026-09-08)

Tasks are classified by exactly what they do — `custom fetch file hook plugin preload process size` — each class with its own queue, workers, progress, and ongoing state. In practice: opening a huge directory, the file count (HIGH) never queues behind an image preview decode (lower), and a stuck task can be cancelled without blocking the others. The scheduler is not a side detail of a file manager — it is the heart of the "blazing fast" experience.

## Image preview: protocol negotiation with a fallback chain

Viewing images in a terminal has no single answer: every terminal supports a different graphics protocol. Yazi solves it with a negotiation table published right in the README: kitty, Ghostty, and Rio via Kitty unicode placeholders; iTerm2, WezTerm, Warp, Tabby, even VS Code via the inline images protocol; Konsole via the Kitty old protocol; foot and Windows Terminal via Sixel ([Yazi README — Image Preview](https://github.com/sxyazi/yazi#image-preview), accessed 2026-09-08).

```
detect terminal
   ├─ kitty/Ghostty/Rio     → Kitty unicode placeholders
   ├─ iTerm2/WezTerm/VSCode → inline images protocol
   ├─ foot/Windows Terminal → Sixel
   ├─ X11/Wayland           → Überzug++  (external dep)
   └─ everything else       → Chafa ASCII art (external dep)
```

The structure of the solution teaches more than the list: the `yazi-adapter` crate holds per-protocol drivers (the README links straight to `yazi-adapter/src/drivers/kgp_old.rs`), detects the environment, picks the best path — and the final two fallback tiers are declared as features rather than errors. Users on an unusual terminal still get a preview — a bit worse, but they get it. Deliberate degradation, not a blank failure.

## Plugins are Lua, distributed like a package

Yazi's extension layer has an equally clear opinion: plugins are "just some pieces of Lua" ([Yazi README](https://github.com/sxyazi/yazi#readme), accessed 2026-09-08) — but this embedded Lua reaches further than filename filtering: the surface exported from `yazi-plugin/src/lib.rs` includes `fs`, `keymap`, `pubsub`, `tasks`, `theme`, `ui` — plugins can rewrite most of the UI. Distribution comes with it: a package manager installs plugins and themes in one command, updating them or pinning specific versions. And `yazi-dds` tackles communication between open yazi instances: client-server without an extra server process, Lua-based pub-sub, with state persistence. A standalone file manager seriously treating the multi-instance problem — something usually seen only in IDEs.

In Wakii, the terminal is not a side tool: the panel ships terminal splits, agents run in those terminals, and you navigate several worktrees every day — the overall experience is in the [agents-and-kit docs](/docs/agents-and-kit/). How a desktop app organizes processes and IPC is dissected in [Wakii's Electron process model](/blog/arch-electron-process-model/); Yazi shows the same thinking in a pure-TUI edition.

## What Wakii learns

- **DIRECTION** — a background scheduler with priority + progress + cancel: `yazi-scheduler` classifies tasks (preload/preview/fetch), three priority levels, real-time progress — the right shape for Wakii's IDE background work (render, sync, index) as it grows. An architecture direction, not for now.
- **WATCH** — capability negotiation with a fallback chain: the image adapter detects the terminal then degrades deliberately (protocol → Überzug++ → Chafa) instead of erroring. Worth watching for Wakii's kit/app across varied environments (SSH hosts, different terminals): detect, then degrade — never fail hard.
- **WATCH** — capability as content + version pinning: Yazi plugins are small Lua files, with a package manager that pins versions. Wakii's kit already follows skills-as-content; the point worth tracking is a pinning mechanism so skill updates never break a running story.

Wakii is an agentic IDE with a built-in agent team that works after install — to get started, [getting-started docs](/docs/getting-started/) takes you from install to the first panel.
