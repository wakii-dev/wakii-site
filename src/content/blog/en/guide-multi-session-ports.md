---
title: "Running sessions side by side: split panes and per-worktree ports"
description: "Watch several agents at once with nested split panes, keep a dev port per worktree, drive sessions from the CLI, and clean up when the work is done."
pubDate: "2026-09-23"
category: "tutorial"
tags: ["guide", "cli"]
draft: false
---

One agent at work, and the screen has room to spare. Three agents in
parallel — three worktrees, three terminals, three open diffs — is when the
screen runs out and the real questions start: how do you watch them work
side by side, does this worktree's dev server fight that worktree's for a
port, and how do you take the seat back when one agent finishes. This post
covers all three: splitting the screen, separating ports, and cleaning up.

TL;DR:

- Every session is bound to a worktree — one folder per agent, nobody
  fights over files.
- Drag a tab to a pane edge to split; splits nest several levels deep; the
  layout is remembered per worktree.
- Dev servers run inside each worktree's own terminal, so ports don't
  collide; remote servers forward through the Ports tab.
- `orca terminal list|create|split|switch|close` drive sessions from the
  CLI; `orca worktree ps` is the live overview.
- A worktree with no active work should be closed — each one keeps its own
  file watchers alive.

## A session is a worktree: one folder per agent

The unit of parallelism in Wakii is not "a tab" — it is a worktree. Each
agent gets a worktree, meaning its own working directory of one shared
repository:

```ascii
repo wakii-site — one shared .git, several working directories
├── ~/orca/workspaces/wakii-site/sf-2-blog-skills  → agent writing skills posts
├── ~/orca/workspaces/wakii-site/sf-4-blog-guides  → agent writing guide posts
└── ~/orca/workspaces/wakii-site/sf-5-blog-arch    → agent writing arch posts
```

*Source: real worktree list from `orca worktree ps` on the machine this post
was written on, retrieved 2026-09-08 — three sub-features of one story
running in parallel.*

No agent touches another's files: one folder means one branch, one index,
one server. Why one worktree per branch is a safe unit of separation is what
the [parallel worktrees isolation](/blog/parallel-worktrees-isolation/) post
proved by experiment — this post assumes you already run several worktrees
and handles the watching part.

## Watching several agents at once: drag a tab to an edge to split

The screen-splitting move is drag and drop, and the docs describe exactly
two directions:

> "Drag a tab to the edge of a pane to create a split: **Right edge** —
> splits left/right (horizontal split). **Bottom edge** — splits top/bottom
> (vertical split)."

And splits nest, in the docs' own example:

> "Splits nest. You can have an agent terminal on the left, a diff view on
> the top-right, and a browser tab on the bottom-right — all at once."

*Source: the "Tabs, panes & split layouts" docs, retrieved 2026-09-08.*

Two details keep a layout alive for you. First, pinned boundaries: "Pane
boundaries stay where you put them" — resizing the window doesn't shuffle
the layout, and boundary positions are saved per worktree. Second, each
worktree owns its layout entirely — the docs put it this way:

> "Each worktree owns its own tab layout. Switching worktrees swaps the
> entire pane tree — your browser tab, terminal, and diff reappear exactly
> as you left them."

*Source: the "Tabs, panes & split layouts" docs, Pinned boundaries and Tab
groups across worktrees sections, retrieved 2026-09-08.*

Moving between tabs needs no mouse:

| Action | macOS | Linux / Windows |
|---|---|---|
| Next / previous tab | `Cmd+Shift+]` / `Cmd+Shift+[` | `Ctrl+Shift+]` / `Ctrl+Shift+[` |
| Next / previous tab (same type) | `Cmd+Option+]` / `Cmd+Option+[` | `Ctrl+Alt+]` / `Ctrl+Alt+[` |

*Source: default shortcuts for new installs, the "Tabs, panes & split
layouts" docs, retrieved 2026-09-08.*

## One dev port per worktree: servers step aside, never fight

Three worktrees usually means three dev servers running at once. They don't
collide because each server runs in the terminal of its own worktree — that
is, in its own folder. Common dev servers (Vite, Astro, Next) pick the next
port when the default one is taken, so the real-world picture always comes
out like this:

```ascii
worktree sf-2: astro dev  → port 4321
worktree sf-4: astro dev  → 4321 occupied → 4322
worktree sf-5: astro dev  → 4322 occupied → 4323
```

*A diagram of the common "port taken, pick the next one" behavior of dev
servers — open the URL printed by the server in that worktree's terminal.*

The thing to remember: the preview you open belongs to the worktree you
opened it from — the URL is printed right in its terminal. A worktree on a
remote machine adds one layer: the Ports tab (`Cmd+Shift+I`) detects
listening ports on the host and forwards them to your machine — the details
have their own post, [SSH worktrees](/blog/guide-ssh-remote/).

## Driving sessions from the CLI: five terminal commands and one overview

Keyboard splitting is half the story; the other half is the CLI, which you
can script. Five terminal commands from `orca --help`:

```text
terminal list       List live Orca-managed terminals
terminal create     Create a terminal session in a worktree
terminal split      Split an existing terminal pane
terminal switch     Bring a terminal tab to the foreground
terminal close      Close one terminal, its whole tab with --tab, or all in a worktree
```

*Source: excerpt from `orca --help`, retrieved 2026-09-08.*

And when you want the big picture of which worktrees are alive on this
machine — which have running terminals, which branch they're on — that is
`orca worktree ps`:

```text
$ orca worktree ps --limit 3          # (trimmed: preview column removed)
wakii-site refs/heads/wakii-dev/sf-2-blog-skills  host=local  live:1  pty:yes  unread:yes
~/orca/workspaces/wakii-site/sf-2-blog-skills
wakii-site refs/heads/wakii-dev/sf-4-blog-guides  host=local  live:1  pty:yes  unread:yes
~/orca/workspaces/wakii-site/sf-4-blog-guides

scope: local
truncated: showing 3 of 11
```

*Source: `orca worktree ps --limit 3`, run for real on the machine this post
was written on, retrieved 2026-09-08 — preview column and one worktree cut.*

One line per worktree: branch, host, number of live terminals (`live:1`),
whether a pty is attached. This is the "what is actually running on this
machine" command — run it before deciding what to close. The full lifecycle
of create → ship → reclaim is walked through step by step in the [worktree
workflow](/blog/guide-worktree-workflow/) guide.

## Cleaning up: close finished tabs, reclaim finished worktrees

Deep split layouts are the app's biggest memory consumers, the docs say so
right in the performance section:

> "Close worktrees you're not actively using. Each worktree keeps file
> watchers alive. Split layouts with many browser tabs are the biggest RAM
> users — close browsers you don't need."

*Source: the Troubleshooting & FAQ docs, Performance & memory section,
retrieved 2026-09-08.*

A sensible order: close browser tabs you no longer read first, then
terminals — `orca terminal close` with `--tab` closes the whole tab, without
the flag it closes a single terminal. Worktrees come last: a sub-feature
that has merged, its branch back on the destination, has no more use for its
file watchers. A machine that stops feeling sluggish after a parallel
session usually owes that to these two steps, not to restarting the app.

Setting the app up from scratch — first repo, first terminal — is on the
[getting started](/docs/getting-started/) page.

Open three worktrees of your project, drag tabs right and down, start three
dev servers at once — then watch which number the second port lands on.
