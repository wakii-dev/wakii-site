---
title: "ripgrep: the fast search that feeds agent context"
description: "How ripgrep earns its speed — gitignore-aware defaults, work-stealing parallel traversal, benchmarks that publish their own cliffs — and what it means for an agent's context loop."
pubDate: "2026-10-19"
category: "tech"
tags: ["terminal", "cli", "evidence"]
draft: false
---

An agent does not read a repository by opening every file. It reads by searching: find a function name, find an error message, find a config pattern — then open only the files that matter. In that loop, the search tool is the eye. ripgrep (rg) by Andrew Gallant is that eye for a large share of developers and agents: 68,084 stars, 2,752 forks, Unlicense license (per GitHub API on 2026-09-08), and an official description that compresses the whole story: "ripgrep recursively searches directories for a regex pattern while respecting your gitignore" ([BurntSushi/ripgrep](https://github.com/BurntSushi/ripgrep), GitHub API 2026-09-08). The star count is not the interesting part. The way this repo balances performance, correct defaults, and honesty about its own limits is.

## TL;DR

- rg respects .gitignore by default and skips hidden and binary files — search results are clean context, not build directories.
- The speed comes from two layers: work-stealing parallel traversal (crossbeam) and the Rust regex engine with literal optimizations.
- The README publishes both the winning table and the performance-cliffs table — rare honesty about limits.
- The codebase is split into 11 crates, one concern each; PCRE2 is an optional build feature, not part of the core.
- Wakii can adopt the honest-benchmark discipline right away; the crate structure is a direction for when its tooling grows.

## Right defaults: gitignore is context, not an obstacle

rg's first difference is not speed — it is what the tool chooses not to do. The README states it plainly: "By default, ripgrep will respect gitignore rules and automatically skip hidden files/directories and binary files" ([ripgrep README](https://github.com/BurntSushi/ripgrep#readme), accessed 2026-09-08). Want the noisy view? Strip the filters explicitly with `rg -uuu` — the safe state is the default, and the noisy state is an exception you have to request.

That choice changes the quality of context when an agent searches a repo:

```
repo tree on disk              what rg sees
├── src/                       ├── src/          ✓
├── node_modules/  gitignore   │   (skipped — .gitignore)
├── dist/          gitignore   │   (skipped — .gitignore)
├── .git/          hidden      │   (skipped — hidden)
├── logo.psd       binary      │   (skipped — binary)
└── README.md                  └── README.md     ✓
```

Without that filtering, a search for "config" returns yesterday's build artifacts — stale information disguised as code. For a human, .gitignore is a nuisance; for an agent gathering context, it is a noise filter that already exists. rg adopts that filter as its default behavior, so an agent's search automatically shares the same context as its developer.

## Speed: work-stealing traversal and the regex engine

rg's speed does not come from a single trick. The first layer sits where few people look: how the directory tree is walked. In `crates/ignore/src/walk.rs`, the WalkParallel machinery uses crossbeam's work-stealing deque:

```rust
use crossbeam_deque::{Stealer, Worker as Deque};
```

(source: [crates/ignore/src/walk.rs @ commit 3fce3b5](https://github.com/BurntSushi/ripgrep/blob/3fce3b5bb0236da2df6d99672afb8a719642eca7/crates/ignore/src/walk.rs), probed 2026-09-08)

Each thread works from its own deque; when it runs dry, it steals from the back of another thread's deque. Source trees are never balanced — one directory may hold a thousand files, another a handful — so static work-splitting by count always skews load; work-stealing self-balances against reality.

The second layer is the Rust regex engine: patterns containing literals get routed through a prefilter that hunts for those literal substrings before the main engine engages — that literal optimization is what produces the large gaps in the README's benchmarks. Meanwhile `pcre2` is a separate crate: use a backreference or lookaround and rg must switch to PCRE2, with the repo's FAQ carrying an entire entry on why that command is slower.

## Eleven crates, one concern each

The repo's `crates/` layout (probed via GitHub API on 2026-09-08) splits cleanly by concern:

| crate | concern |
|---|---|
| `globset` | matching .gitignore globs |
| `ignore` | tree traversal + ignore rules |
| `searcher` | reading and matching each file |
| `printer` | formatting results |
| `regex`, `pcre2` | matching engines (default / optional) |

(source: [crates directory @ commit 3fce3b5](https://github.com/BurntSushi/ripgrep/blob/3fce3b5bb0236da2df6d99672afb8a719642eca7/crates), probed 2026-09-08 — plus `cli`, `core`, `grep`, `index`, `matcher`)

Inside `searcher`, the two IO choices are cleanly separated: bounded-buffer reading (`line_buffer` with `DEFAULT_BUFFER_CAPACITY`) or optional mmap (`MmapChoice`) — while binary detection runs its own heuristic, kept apart from matching logic ([crates/searcher/src/searcher/mod.rs @ commit 3fce3b5](https://github.com/BurntSushi/ripgrep/blob/3fce3b5bb0236da2df6d99672afb8a719642eca7/crates/searcher/src/searcher/mod.rs)). Clear module boundaries mean each part is tested and optimized independently — and these crates are reused as libraries by other projects, not just in service of rg.

## Winning benchmarks — and published cliffs

The README's benchmark on the Linux kernel tree (i9-12900K machine, content probed 2026-09-08), pattern `[A-Z]+_SUSPEND`:

| tool | time | vs rg |
|---|---|---|
| ripgrep | 0.082s | 1.00x |
| git grep -P | 0.273s | 3.34x |
| The Silver Searcher | 0.443s | 5.43x |
| ack | 2.935s | 35.94x |

(source: [ripgrep README — benchmark tables](https://github.com/BurntSushi/ripgrep#readme), accessed 2026-09-08)

The more instructive part sits right below the winning table. The README says "Beware of performance cliffs though" ([ripgrep README](https://github.com/BurntSushi/ripgrep#readme), accessed 2026-09-08) and lists them: the pattern `[A-Za-z]{30}` offers no literal to optimize — rg needs 15.569s on a 13GB file, still the fastest in the table; `rg the` matches 83,499,915 lines and takes 6.948s because time is dominated by handling matches, not by the detection algorithm. The repo publishes the cases where every tool slows down, with the mechanism explained. Being honest about limits is what makes the winning numbers above believable — a benchmark with only a winning table reads as advertising.

Wakii's workflow also starts from search: an agent assigned an SF surveys the real code before touching it, and this very blog's lint and audit scripts are scoped searches — the overall process is described in the [story-workflow docs](/docs/story-workflow/). How other AI tools pull context from a repo is dissected in [continue: embedding an AI assistant in your IDE](/blog/deep-dive-continuedev-continue/); rg is the layer those loops stand on.

## What Wakii learns

- **ADOPT** — the honest-benchmark discipline with published cliffs: the README places the winning table next to the losing cases (15.5s on a literal-free pattern, 6.9s for 83 million matches) with mechanisms explained. Concrete proposal: every performance claim in Wakii's docs and blog carries a limits table — when it's slow, why — matching the existing claims discipline: no cherry-picked cases only.
- **DIRECTION** — crate-level separation of concerns: 11 crates, one role each; `globset` doesn't know `printer` exists. As Wakii's kit tooling grows, concern-based module splits allow independent testing and optimization — not now, while the kit is still small.
- **WATCH** — capability as a feature flag: PCRE2 is a separate build feature with a documented performance trade-off in the FAQ. Wakii's heavier capabilities (local inference, local MCP) could follow an opt-in model rather than landing in the core — keep watching before deciding.

Wakii is an agentic IDE with a built-in agent team that works after install — if you want to see how that team splits work, the [agents-and-kit docs](/docs/agents-and-kit/) are a good starting point.
