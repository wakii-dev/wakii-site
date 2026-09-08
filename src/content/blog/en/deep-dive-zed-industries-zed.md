---
title: "Zed: a high-performance editor written in Rust"
description: "Zed makes performance an architectural decision: a hand-written GPU UI framework, custom buffer data structures, and collaboration built into the buffer core. This repo read shows each layer chosen for speed."
pubDate: "2026-10-05"
category: "tech"
tags: ["architecture", "license", "agents"]
draft: false
heroImage: "/blog/heroes/deep-dive-zed-industries-zed.png"
---

Most editors slow down over the years because performance is treated as a feature to optimize later: the renderer comes off the shelf, the data structures are borrowed from a library, collaboration is bolted on as an outer layer. Zed runs the other way. This repo, public on GitHub with 89,941 stars and 10,501 forks per the GitHub API on 2026-09-08, was built from one upfront decision: performance is an architectural constraint, not an optimization pass. The team behind Atom and Tree-sitter chose Rust as the substrate, wrote their own UI framework, designed the buffer's data structures from scratch, and placed collaborative editing in the core. This article walks those layers through the code itself.

TL;DR:

- Zed runs on GPUI — a hand-written, GPU-accelerated UI framework instead of a WebView or Electron; the framework is still pre-1.0 and is developed as a public project of its own.
- The buffer sits on custom data structures: sum_tree uses a fixed branching factor and parallelizes tree walks with rayon.
- Every buffer edit carries a Lamport timestamp and a version vector — CRDT-style sync infrastructure lives in the core text crate, not in an external plugin.
- The release cadence is unusually dense: 6 stable releases in 17 days (Aug 19 → Sep 4), interleaved with -pre releases, per the GitHub API on 2026-09-08.
- The license is layered: GPL-3.0-or-later primarily, Apache-2.0 for crates marked separately — the GitHub API reports NOASSERTION.

## GPUI: writing your own UI framework to buy back milliseconds

Zed's boldest decision is not the choice of Rust — it is refusing every existing UI framework. Instead, the team wrote GPUI, introduced in the crate's own README: "GPUI is a hybrid immediate and retained mode, GPU accelerated, UI framework for Rust" ([crates/gpui/README.md](https://github.com/zed-industries/zed/blob/e2534d2/crates/gpui/README.md), clone of 2026-09-08). On macOS it renders through Metal; on Linux it plugs directly into wayland or x11. Every glyph, every layout pass goes through the GPU rather than through an intermediate compositor.

The cost is stated plainly: GPUI is pre-1.0, with breaking changes between versions. For a product that is a risk; for a team that treats performance as a constraint, it is an accepted price — they buy speed by keeping the hardest part in-house. The scale of that bet is easy to see in the repo layout: 244 crates under `crates/`, 1,873 Rust files (clone of 2026-09-08).

## sum_tree: buffer data structures borrowed from no one

An editor constantly answers questions like "what is the total length of these lines" or "which text falls inside this viewport" — and it must answer fast on buffers with hundreds of thousands of lines. Zed's answer is a dedicated crate called `sum_tree`: a summarized B-tree where each node keeps an aggregate of its subtree, so aggregate queries can stop early instead of walking down to the leaves.

The instructive part is the micro-optimization discipline. In [sum_tree.rs](https://github.com/zed-industries/zed/blob/e2534d2/crates/sum_tree/src/sum_tree.rs), child nodes live in a fixed-size `heapless` array (`ArrayVec`) instead of a heap-allocating `Vec` — removing an allocator layer from the hot path. The fixed branching factor is 6 (`TREE_BASE`), and tree walks are parallelized with rayon (`ParallelIterator` sits in the crate's shared code). Small details, added up into the keystroke latency a user can feel.

## Collaboration lives in the core's Operation enum

Many editors add collaboration as an external service wrapping the editor. Zed inverts that: the sync infrastructure sits inside the `text` crate — the lowest layer of the buffer. Every edit is an `Operation`, and its signature exposes the whole model:

```rust
pub struct EditOperation {
    pub timestamp: clock::Lamport,
    pub version: clock::Global,
    pub ranges: Vec<Range<FullOffset>>,
    pub new_text: Vec<Arc<str>>,
}
```

([crates/text/src/text.rs](https://github.com/zed-industries/zed/blob/e2534d2/crates/text/src/text.rs), clone of 2026-09-08)

`Lamport` is a Lamport clock with a `replica_id` — every machine joining a session has its own identity ([crates/clock/src/clock.rs](https://github.com/zed-industries/zed/blob/e2534d2/crates/clock/src/clock.rs)). `Global` is a version vector. In other words, the buffer is born knowing how to merge two concurrent typing streams without a server arbitrating every byte: this is an operation-based CRDT model, placed at the lowest layer rather than the application layer. When two people open the same file in Zed, what runs is not a feature you invoke — it is a property the data already has.

## Release cadence: pre and stable days apart

Performance is kept by release discipline, not just by code. Per the GitHub API on 2026-09-08, Zed's stable release chain reads:

| Tag | Release date |
|---|---|
| v1.16.1 | 2026-08-19 |
| v1.16.2 | 2026-08-24 |
| v1.16.3 | 2026-08-26 |
| v1.17.2 | 2026-08-26 |
| v1.18.0 | 2026-09-02 |
| v1.18.1 | 2026-09-04 |

Six stable releases in 17 days — one every three days or less. Interleaved are `-pre` releases landing hours to days ahead (v1.17.2-pre shipped Aug 25, v1.17.2 stable Aug 26; v1.18.0-pre shipped Aug 26, v1.18.0 on Sep 2). A pre channel that short and that dense has a rarely discussed effect: stable releases carry almost no surprises — risk has already been shaved off through pre.

## One repo, two licenses

The reason the GitHub API reports `license: NOASSERTION` for this repo is simply that it does not carry a single license. At the root sit two files: `LICENSE-GPL` (GNU GPLv3) and `LICENSE-APACHE` (Apache-2.0). The README summarizes: "Zed source code is licensed primarily under GPL-3.0-or-later, with Apache-2.0 components where marked" ([README.md](https://github.com/zed-industries/zed/blob/e2534d2/README.md), as of 2026-09-08).

Reading crate by crate reveals a deliberate split: `gpui` and `sum_tree` — the two foundational, reusable layers — carry Apache-2.0 in their Cargo.toml, while `text`, `collab`, and the main `zed` crate carry GPL-3.0-or-later. This is how a repo public on GitHub can open its infrastructure to an ecosystem while keeping the product under copyleft. This article describes exactly what the repo shows, without generalizing further.

Zed brings agents into the editor through dedicated crates (`acp_thread`, `acp_tools` sit right in `crates/`) — the "editor as the place you dispatch agents" direction. Wakii starts from the opposite end: an organized agent team ships inside the kit; you can read how the roles are divided in [agents & kit](/docs/agents-and-kit/). Zed's seat in the 50-project map around agentic coding is in the [landscape piece](/blog/agentic-landscape-50-projects/).

## What Wakii learns

- **ADOPT** — a `-pre` channel ahead of each stable. The release table above is the evidence: pre lands hours to days before stable. Wakii currently ships desktop builds as stable and Android as a separate pre-release; the proposal is to also ship desktop `-pre` builds ahead of each large UI change, so users catch regressions earlier than the final gate does.
- **DIRECTION** — turn policy into a CI gate. Zed's README requires dependency license metadata to be present, or CI fails. Wakii already does exactly this for blog content (machine-enforced claim lint); the next step is bringing the same style of gate to new kit surfaces as the skill and CLI count grows.
- **WATCH** — ACP. Zed packages editor↔agent communication as a protocol and embeds it in the core repo. Per the epic's decision, Wakii goes MCP first; ACP stays on the watch list — the upgrade condition is the story-workflow MCP server landing plus demand for plugging external agents into the panel.
- **N/A** — GPUI and the CRDT buffer. Wakii does not build a rendering engine (it runs on Electron), and Wakii agents avoid conflicts through per-task worktrees rather than real-time merging on one buffer — different problems, different solutions.

Want an organized agent team running inside your editor? Grab Wakii and start from [getting started](/docs/getting-started/) — the team is preinstalled, you just decide.
