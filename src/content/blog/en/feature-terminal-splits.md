---
title: "Terminal splits: many sessions, one window"
description: "Running several agent sessions with a single terminal means waiting your turn. This post dissects Wakii's terminal splits from the code side: split as a runtime operation, a layout that survives restarts, and an activation order worth benchmarking."
pubDate: "2026-09-15"
category: "tech"
tags: ["features", "terminal", "wakii"]
draft: false
heroImage: "/blog/heroes/feature-terminal-splits.png"
---

Agents run long — fifteen minutes, half an hour — and in that time you want to
do other work in the same project. If the app gives you one terminal per
window, your options are opening another window and re-arranging your screen,
or standing by. Terminal splits solve it by declining to wait: the workspace
splits into panes running side by side inside one window, each pane its own
session. This post reads the feature from the code side — what a split actually
is in the runtime, how the layout survives a restart, and why the activation
order of a pane was worth a benchmark.

TL;DR:

- A split is not a UI drawing effect: it is a runtime operation — a new leaf in
  the tab, wired to its own PTY for the new session.
- Each pane can receive its own `command` and `env` at split time — two panes
  in one tab are not two copies of the same session.
- The post-split layout is written into the durable layout tree, so splits
  survive snapshot rebuilds — with a dedicated test guarding that behavior.
- The order — activating a split before inherited CWD resolution — is the
  subject of a dedicated e2e benchmark in commit #17601.

## One session per window, and the waiting is real

Consider the common rhythm of working with an agent: you watch the main
session run while needing a side terminal for something quick — checking logs,
running a git command, peeking at a file. With one window per session, the
sequence is: pause or shrink the main session, open a new terminal, lose the
context on screen, do the side task, come back. No single step is expensive;
the cost is the repetition, several times a day:

```ascii
one window — one session — interleaving means serial switching

  running session A (long) and side task B (short)

  serial:   [A runs ............] [pause A] [B] [reopen A] [A runs ....]
  split:    ┌────────────────────────┬──────────────┐
            │ A keeps running        │ B, as needed │
            └────────────────────────┴──────────────┘
```

*Source: conceptual diagram of the situation terminal splits exist to solve,
drawn while writing this post, retrieved 2026-09-08.*

Worktree isolation — covered in
[real parallelism through worktree isolation](/blog/parallel-worktrees-isolation/)
— solves multiple agents fighting over files. Terminal splits solve a layer
below that: several sessions inside one working space, when you actively want
two views at once. The two mechanisms stack; neither replaces the other.

## A split is a runtime operation, not a UI sketch

The most interesting part of reading the code: the split exists at the runtime
layer, before any UI. The `OrcaRuntimeWithSplitTerminal` class in
`src/main/runtime/orca-runtime-split-terminal.ts` provides a single method for
it:

```bash
async splitTerminal(handle, opts: {
  direction?: 'horizontal' | 'vertical'
  command?: string
  env?: Record<string, string>
  activate?: boolean
  ...
}): Promise<RuntimeTerminalSplit>
```

*Source: the `splitTerminal` signature in src/main/runtime/orca-runtime-split-terminal.ts,
wakii-dev/wakii repo (fork of orca), retrieved 2026-09-08.*

The signature itself carries three design decisions. One: the split takes the
original session's `handle` and returns a new one — the new session is a
first-class entity with its own PTY via `splitPtyBackedTerminal`, not a shared
stream with the originating pane. Two: `direction` is the caller's choice
(default `horizontal`), not a hard-coded app decision. Three — the part least
visible in a UI feature: each new pane can receive its own `command` and `env`.
Two panes in one tab can run two different commands in two different
environments; they share the window, not the session.

## The split layout survives a restart

Where such features usually break is a place nobody looks: closing the app and
opening it again. A split that only updates the live session snapshot would
vanish once the app rebuilds the layout from the durable snapshot. A commit in
the repo describes exactly this case, right in the explanatory comment:

```bash
// Why: a headless ("Orca server") split only updated the live session
// snapshot, never the persisted workspace-session layout, so a later
// snapshot rebuild re-derived from the stale single-leaf layout and
// collapsed the split. This builds the durable post-split layout so the
// split survives rebuilds.
```

*Source: comment in src/main/runtime/headless-terminal-split-layout.ts,
wakii-dev/wakii repo, retrieved 2026-09-08.*

In other words, after a split, the new layout tree is written into the durable
`TerminalLayoutSnapshot` — a later rebuild restores the split panes instead of
collapsing back to a single leaf. The behavior has a guard:
`persistence-split-pane-incarnation.test.ts` and
`headless-terminal-split-layout.test.ts` sit next to the runtime file. For a
feature users judge by "my screen tomorrow looks like it did today", this is
the code that decides the experience — even though none of it ever shows on
screen.

## Even the activation order got a benchmark

Commit #17601 — "Activate terminal splits before inherited CWD resolution" —
is the commit that brought splits into the v1.4.198 release tag, and its
content is more surprising than the title:

```bash
$ git -C <orca-repo> show c558d7e083 --stat --format=''
.../terminal-split-activation-latency-artifact.ts    |  53 ++
.../terminal-split-activation-latency-main-probe.ts | 193 +++++
.../e2e/terminal-split-activation-latency.spec.ts   | 730 ++++++++++++++
43 files changed, 4955 insertions(+), 419 deletions(-)
```

*Source: `git show c558d7e083 --stat`, orca repo, retrieved 2026-09-08.*

The problem being solved: a new split must be activated (focused, ready for
input) before the inherited CWD is resolved and published — with the order
flipped, the new pane could pick up directory context from an uncommitted
state. The commit does not just reorder; it ships a benchmark suite measuring
split activation latency across phases, with a 730-line e2e spec and artifacts
recorded under schema-v2. For a small UI interaction, that is unusual
discipline — and it says something about where splits live in the
architecture: not a drawn-on trait, but a runtime operation whose timing has
to be kept exact.

The limits deserve plain speech too. Splits share a window and a tab — they do
not substitute for isolation: keeping two agents off each other's files still
takes separate worktrees (see
[real parallelism through worktree isolation](/blog/parallel-worktrees-isolation/)).
And the benchmark part of #17601 is developer infrastructure — users never see
those numbers, only the consequence: the new pane appears with the right
context and does not jump directories.

To see it yourself: open Wakii, give an agent a long task, split the terminal
to do side work in the same tab, then close and reopen the app to check the
layout survived. Setup and first steps live on the
[getting started](/docs/getting-started/) page; how the system layers file
isolation and multi-session work is in
[real parallelism through worktree isolation](/blog/parallel-worktrees-isolation/).
