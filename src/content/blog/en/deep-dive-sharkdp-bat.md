---
title: "bat: cat with syntax highlighting and git"
description: "How bat works — syntect highlighting, in-process git markers via gitoxide, plain-text fallback when piped — and the lesson of output that adapts to its consumer."
pubDate: "2026-10-20"
category: "tech"
tags: ["terminal", "cli", "features"]
draft: false
---

A transcript of thousands of lines of bare code — no color, no line numbers, no indication of what just changed — tires human eyes and wastes agent tokens. bat by David Peter addresses exactly that: 60,388 stars, 1,643 forks, Apache-2.0 license (per GitHub API on 2026-09-08), with a README intro that keeps it brief — "A cat(1) clone with syntax highlighting and Git integration" ([sharkdp/bat](https://github.com/sharkdp/bat), GitHub API 2026-09-08). But the interesting part is not "pretty-printing files." It is how the repo decides its output for EACH kind of consumer: humans at a terminal get color and a pager, while any process that pipes bat's output gets plain text.

## TL;DR

- bat layers three things onto output: syntax highlighting (syntect), git markers in the left gutter (which lines are added/modified), and automatic paging.
- The git markers do not shell out to `git` — bat computes the diff in-process via gitoxide, feature-gated behind `#![cfg(feature = "git")]`.
- The syntax database is serialized at build time (bincode) — bat parses no syntax definitions at startup.
- Piped into another process, bat drops color and paging and reverts to cat behavior — a contract agents can rely on.
- Wakii can adopt this right away: kit CLIs should distinguish a mode for humans from a mode for agents.

## Three layers of readable output

On an interactive terminal, bat stacks three layers onto file contents. Layer one: syntax highlighting for hundreds of programming and markup languages. Layer two: git markers — the README describes how "bat communicates with git to show modifications with respect to the index" ([bat README](https://github.com/sharkdp/bat#readme), accessed 2026-09-08) — each line carries its status against the index in the left gutter. Layer three: paging — "By default, bat pipes its own output to a pager (e.g. less) if the output is too large for one screen" (same source).

```
bat src/main.rs  (interactive terminal)
┌──────────────────────────────
│ ~ fn main() {                 ← unchanged
│ +     let cfg = load();       ← Added    (new vs index)
│ -     let old = load();       ← Removed
│ M     cfg.apply(old)          ← Modified
│ ~ }
└──────────────  1/180 ▸ less ── (paging when over one screen)
```

All three layers serve one goal: cutting the time it takes to understand a transcript. Color reveals structure, git markers reveal history, paging keeps the reading rhythm — and each has its own flag for readers who want it raw.

## Git markers computed in-process, not via subprocess

The implementation of the git layer is the most instructive piece of architecture. The file `src/diff.rs` opens with a single attribute: `#![cfg(feature = "git")]` — the entire feature is optional at build time. Inside, there is no subprocess call to `git`; instead there is gitoxide, a pure-Rust git library:

```rust
pub fn get_git_diff(filename: &Path) -> Option<LineChanges> {
    let filepath_absolute = filename.canonicalize().ok()?;
    let repository = gix::discover(filepath_absolute.parent().ok()?).ok()?;
```

(source: [src/diff.rs @ commit 7323a75](https://github.com/sharkdp/bat/blob/7323a7514f7601737640e7172be115127d6db08c/src/diff.rs), probed 2026-09-08)

`gix::discover` locates the repo from the file's directory, the index is loaded from HEAD, and diff hunks are converted into `LineChanges` — a `HashMap` from line number to a `LineChange` enum with exactly four states: `Added`, `RemovedAbove`, `RemovedBelow`, `Modified`. Collapsing to those states is a design decision: the gutter only needs to distinguish "this line is new/gone/changed," not reproduce git's full diff semantics.

## The syntax set, serialized at build time

The highlighting layer uses syntect, the Rust syntax-highlighting library. Syntect's known cost is its syntax-definition database: parsing all of it at startup burns hundreds of milliseconds before the first line prints. bat pays that cost at build time instead: the `HighlightingAssets` struct in `src/assets.rs` holds a `SerializedSyntaxSet` — the database is deserialized from pre-serialized bincode assets, with no YAML/plist parsing at runtime ([src/assets.rs @ commit 7323a75](https://github.com/sharkdp/bat/blob/7323a7514f7601737640e7172be115127d6db08c/src/assets.rs), probed 2026-09-08). The Cargo.toml even declares two features for choosing syntect's regex engine — `regex-onig` (oniguruma) or `regex-fancy` (pure Rust) — a swappable engine without touching call sites.

A small detail carries the same spirit: bat's Cargo.toml pulls in `globset` — the very glob-matching crate from ripgrep's ecosystem — alongside `content_inspector` for binary detection and `clircle` to block IO loops like `bat file > file`. Every edge of the print-a-file problem already has a specialized library; bat keeps the design decisions for itself.

## Piping is a contract with agents

The most valuable layer is how bat chooses its output based on who is reading. The README is explicit: when bat detects a non-interactive terminal — something else is consuming its output, or it's writing to a file — "bat will act as a drop-in replacement for cat and fall back to printing the plain file contents" ([bat README](https://github.com/sharkdp/bat#readme), accessed 2026-09-08), regardless of the pager configuration.

```
bat README.md                     → pager + color + markers   (for humans)
bat README.md | grep "version"    → plain text, no color      (for processes)
bat README.md > out.txt           → plain text                (for files)
```

That is precisely the contract an agent needs: when output enters a pipe — toward grep, a script, another agent — it gets clean, predictable text. When output lands on a screen for a human, it gets the decorated version. One tool, two contracts, zero flags required. Wakii's watchdog reads agent terminal output as one of its three check layers — the process is described in the [story-workflow docs](/docs/story-workflow/) — and that transcript's quality depends on exactly this kind of contract; the experience of an editor living next to the worktree is dissected in [code-server: VS Code on a remote server](/blog/deep-dive-coder-code-server/).

## What Wakii learns

- **ADOPT** — output that adapts to its consumer: bat gives humans the colored, paged version; gives pipes plain, predictable text. Concrete proposal: the story-* CLIs in Wakii's kit standardize two modes — formatted tables when interactive, plain text or `--json` when piped — so agents parse reliably without anyone typing flags.
- **DIRECTION** — in-process git state: bat drops the subprocess, reading the index and computing diffs through gitoxide inside its own process. Wakii desktop reads worktree git state constantly; the analogous move is reading via a library instead of parsing `git` command output — an architecture decision, so not now.
- **WATCH** — startup cost paid at build time: the syntax set is serialized at build, the regex engine selectable by feature. Worth watching for Wakii's app and CLIs as static resources (skill catalogs, agent definitions) grow to the point of paying the same kind of cost.

Wakii is an agentic IDE with a built-in agent team — if you want the tooling that ships with that team, the [agents-and-kit docs](/docs/agents-and-kit/) list it in full.
