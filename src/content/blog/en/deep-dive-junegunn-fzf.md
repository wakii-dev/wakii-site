---
title: "fzf: the fuzzy finder that shaped the modern command line"
description: "Inside fzf, the small utility approaching 13 years of age: a Smith-Waterman variant, a matcher parallelized per CPU core, a three-goroutine architecture — and the packaging lesson of shipping one binary."
pubDate: "2026-10-06"
category: "tech"
tags: ["terminal", "cli", "oss", "architecture"]
draft: false
heroImage: "/blog/heroes/deep-dive-junegunn-fzf.png"
---

Working in a terminal means working with lists: picking one file out of thousands, one command out of history, one git branch. Every pick costs a pause or a mistyped path. fzf solves exactly this bottleneck with a single gesture — type a few characters, the list shrinks in real time, Enter commits. That sounds like a small utility, yet nearly 13 years after the repo was created on 2013-10-23, fzf holds 82,868 stars, an MIT license, and last pushed code on 2026-09-06 (per GitHub API on 2026-09-08). This post dissects the repo to answer why such a small tool lasts that long.

TL;DR:

- fzf describes itself as "a general-purpose command-line fuzzy finder and an interactive terminal toolkit" — one self-contained Go binary, MIT-licensed open source.
- Born in 2013 as a Ruby script; the Go rewrite changed the distribution channel too: a self-contained binary with zero dependencies.
- The speed core: a Smith-Waterman variant in `src/algo/` and a matcher whose worker count is derived from `runtime.NumCPU`.
- Three threads — reader → matcher → terminal — communicating through a single event box.
- What Wakii learns: batteries-included is already adopted; a fuzzy picker for story-* CLIs is a direction; SIMD hand-tuning is N/A.

## One binary, nearly thirteen years

The first line of the README stakes the position: "fzf is a general-purpose command-line fuzzy finder and an interactive terminal toolkit" ([README, clone of 2026-09-08](https://github.com/junegunn/fzf/blob/ad151d8/README.md)). Both halves explain the longevity. Fuzzy finding is a permanent terminal problem — wherever there is a list, there is a need to filter it. The "toolkit" half is why fzf never got swallowed by a single shell feature: it is a building block for menus, previews, and custom workflows.

In late 2013, fzf was a Ruby script. The Go rewrite delivered something more important than a language: a self-contained binary with no runtime and no dependencies. The README lists more than 20 installation channels — Homebrew, apt, dnf, pacman, nix, Chocolatey, Winget — and puts "Portable // Distributed as a single binary for easy installation" at the top of the highlights (same README link). A small utility that wants to live long needs distribution to be trivial; fzf settled that early.

The release cadence (last 10 releases, per GitHub API on 2026-09-08):

| Tag | Released |
|---|---|
| v0.74.3 | 2026-08-17 |
| v0.74.2 | 2026-08-01 |
| v0.74.1 | 2026-07-18 |
| v0.74.0 | 2026-07-06 |
| v0.73.1 | 2026-05-25 |
| v0.73.0 | 2026-05-23 |
| v0.72.0 | 2026-04-26 |
| v0.71.0 | 2026-04-04 |
| v0.70.0 | 2026-03-02 |
| v0.68.0 | 2026-02-20 |

Ten releases in roughly six months — one every 2-3 weeks, as steady as infrastructure, not a hobby project. Meanwhile master already carries an open CHANGELOG section for 0.74.4 ([CHANGELOG](https://github.com/junegunn/fzf/blob/ad151d8/CHANGELOG.md)): release notes are drafted on the source tree, and the release itself is just the announcement.

## Three goroutines and one event box

Reading the `src/` tree reveals a real terminal application: the core layer `src/*.go` alone is around 21,700 lines of Go (not counting the algo, tui, util subpackages; clone of 2026-09-08), with `terminal.go` the largest file at 8,850 lines. The central architecture: three threads running in parallel, meeting at a single event mailbox.

```
stdin / file list
   |
   v  reader goroutine — streams data into a chunklist
[chunk][chunk][chunk]...
   |
   v  matcher — parallel scoring, one chunk per worker
worker1  worker2  ...  workerN   (N = min(NumCPU, chunk count))
   |  resultChan collects partial results
   v
merger merges and sorts — terminal goroutine draws the TUI,
takes new queries
   |
   v  util.EventBox: shared mailbox for all three
```

In `core.go`, that mailbox is one line: `eventBox := util.NewEventBox()` ([core.go, ad151d8](https://github.com/junegunn/fzf/blob/ad151d8/src/core.go)) — the three threads never call each other directly; they register and publish events through the box. Query changes, source changes, external processes returning results: everything flows through one mechanism — the "event-driven architecture" the README advertises.

The parallelism lives in the matcher ([matcher.go, ad151d8](https://github.com/junegunn/fzf/blob/ad151d8/src/matcher.go)):

```go
partitions := runtime.NumCPU()
...
numWorkers := min(m.partitions, numChunks)
var nextChunk atomic.Int32
resultChan := make(chan partialResult, numWorkers)
```

Workers scale with CPU count, work is split by chunk, and each worker grabs the next chunk through an atomic counter — nobody waits on anybody. For lists in the millions of lines, this is the difference between "results appear" and "the machine freezes".

## The algorithm: Smith-Waterman, modified

Fuzzy scoring is not "substring search for fun". The comment in `src/algo/algo.go` is direct: FuzzyMatchV2 implements "a modified version of Smith-Waterman algorithm to find the optimal solution (highest score) according to the scoring criteria" ([algo.go, ad151d8](https://github.com/junegunn/fzf/blob/ad151d8/src/algo/algo.go)) — the classic bioinformatics pairwise-alignment algorithm, adjusted with fzf's own rule: omitting or mismatching a pattern character is not allowed. There is a faster V1 path for the first-occurrence case, plus amd64/arm64 assembly files optimizing low-level ASCII character lookup (`src/algo/SIMD.md` documents the design).

For fzf, performance is a maintained feature, not README decoration. The v0.74.3 release (2026-08-17) records in the CHANGELOG: "ASCII queries are up to 16x faster", non-ASCII queries up to 12x, accented-Latin input reading 37% faster, and CJK input memory use down by up to 29% ([CHANGELOG, ad151d8](https://github.com/junegunn/fzf/blob/ad151d8/CHANGELOG.md)). Four numbers, four different optimization layers — scoring, path, reader, memory — packed into one ordinary release.

## The shell layer: batteries-included lives outside the binary

The next interesting thing: the part that makes fzf "work out of the box" is not in Go. The repo's `shell/` directory holds 10 key-binding and fuzzy-completion files for 4 shells, plus one update script ([shell/, ad151d8](https://github.com/junegunn/fzf/tree/ad151d8/shell)):

| Shell | Key bindings | Fuzzy completion |
|---|---|---|
| bash | `key-bindings.bash` | `completion.bash` |
| zsh | `key-bindings.zsh` | `completion.zsh` |
| fish | `key-bindings.fish` | `completion.fish` |
| nushell | `key-bindings.nu` | `completion.nu` |

CTRL-T opens the file tree, CTRL-R filters history — both are thin scripts calling the binary, not logic crammed into the executable. That is a two-layer distribution model worth studying: a tight core in one binary, and the "living with the ecosystem" part as a thin integration layer, updated independently. Vim and Neovim get plugins in exactly the same spirit.

## Why a small utility lasts thirteen years

Assembled, fzf's longevity is no mystery. One: the problem never expires — picking from a list is the primitive operation of the command line. Two: it is fully composable — it filters stdin to stdout and owns nobody's pipeline; ripgrep | fzf | vim is a natural chain, and other tools "borrow" fzf as the picking UI instead of rewriting it:

```
ripgrep ──▶ fzf ──▶ Enter ──▶ vim / cd / git checkout
(every tool feeds a list in, gets exactly one selection out)
```

Three: scope discipline — no daemon, no config system of its own; the latest CHANGELOG entries are all fine-grained fixes, the kind of tool that treats stability as a feature. In the September 2026 map of 50 agentic projects, the terminal-tooling group — ripgrep, bat, starship, yazi — lives by the same logic ([see the landscape post](/blog/agentic-landscape-50-projects/)).

Wakii runs its own share of "lists to pick from": running stories, pending gates, open worktrees — the difference is that a nine-agent team processes them, not your keyboard. How the kit organizes 9 agents and 24 story-* CLIs is described in [agents and kit](/docs/agents-and-kit/).

## What Wakii learns

- **ADOPT — batteries-included, self-installing, idempotent.** fzf ships one binary plus 10 shell scripts to live with 4 shells right after install; the Wakii kit also installs itself into `~/.claude/` on first run without touching existing config (agents-and-kit docs). The pattern has been validated since 2013: installed means usable — there is no second setup step.
- **DIRECTION — fuzzy picker for story-* CLIs.** The 24 story-* CLIs in the kit (at the time of writing) take direct arguments; commands that pick a target — story, gate, worktree — could pipe their lists through a fuzzy filter in interactive runs (call fzf when present, fall back to a numbered list). Not applied yet because the kit's CLIs serve agents and gates first; an interactive mode needs its own UX design.
- **WATCH — fzf server mode (`--listen`).** The in-progress 0.74.4 CHANGELOG section touches the `--listen` status payload — a finder with an external control API is a pattern to track. Condition to promote to DIRECTION: Wakii gaining a real terminal surface for brackets and gates.
- **N/A — SIMD hand-tuning.** The amd64/arm64 assembly files in `src/algo/` serve fuzzy scoring at millions-of-lines scale. Wakii's stack (Electron + agent orchestration) has no equivalent hot path worth this complexity.

Want to see a nine-agent team run a story end-to-end while you keep every decision? Start at [getting started](/docs/getting-started/) — then read how the gates work in the [story workflow](/docs/story-workflow/).
