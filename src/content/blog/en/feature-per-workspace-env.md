---
title: "Per-workspace env: one environment per worktree"
description: "Multiple agents on one machine sharing an environment means fighting over env vars, dependencies, and credentials. Wakii ties the environment to the workspace instead: recipes declared in orca.yaml, on-demand disposable runtimes created fresh per workspace, base and auth snapshots reused."
pubDate: "2026-09-18"
category: "tech"
tags: ["features", "worktree", "cli"]
draft: false
---

The previous post in this series closed half of the parallelism problem: two
agents standing in two worktrees have no file left to fight over. Files are only
half of it, though — env vars, dependencies, credentials still live in exactly
one place: the machine. Agent A exports a variable and agent B inherits it
unasked; A bumps a dependency and B's build breaks although B changed nothing.
This cross-pollination needs nobody to make a mistake — sharing one machine is
enough. Per-workspace environments solve the other half: the environment
attaches to the workspace, not to the machine.

TL;DR:

- Worktree isolation separates files; per-workspace environments separate the
  rest: env vars, dependencies, credentials — one set per workspace.
- The environment is declared as a recipe in `orca.yaml` (the
  `environmentRecipes` key); an on-demand, disposable runtime is created fresh
  for each workspace — cloud sandbox, VM, or local.
- First-time setup is paid once: provider prerequisites, a reusable base
  snapshot, the coding-agent auth snapshot, credentials, state — later
  workspaces start from the snapshots.
- The toggle sits in settings (component `EphemeralVmsExperimentalSetting`),
  shipped since v1.4.130; commit #7908 aligned the toggle row's layout, and the
  skill's templates went through one round of fixes after real use (#7485).
- Recipes can break — which is why `orca vm recipe doctor` exists: a free
  static check, run before anything touches a provider.

## Files are separated; the environment is not

The worktree isolation from the previous post settles exactly one class of
conflict: two agents writing to the same file path. Give the agents two
different worktrees and file conflicts have nowhere to happen. But those same
two agents still share one thing: the machine's environment. A variable
exported in one session leaks into the next; dependencies install into one
shared location; the login token sits in a single file that both read and both
write. The environment is a quietly shared resource — exactly the class of
resource file-level isolation does not touch:

```ascii
one machine, many workspaces — the environment is a quietly shared resource

  machine
  ├── workspace A ──┐
  ├── workspace B ──┼──► one shared environment
  └── workspace C ──┘    (env vars, dependencies, credentials)

  A exports a new variable → B inherits it unasked
  A bumps dependencies     → C's build breaks, C changed nothing
  A writes a token         → B reads A's token
```

*Source: conceptual diagram illustrating the situation per-workspace
environments exist to prevent; retrieved 2026-09-08.*

This is an old problem of dev machines: many projects on one machine means a
shared env. The new part: "many projects" became "many workspaces of one repo",
run by agents that know nothing about each other.

## A recipe in orca.yaml, a fresh runtime per workspace

A workspace in Wakii holds a worktree — the previous post gave each worktree
its own branch; per-workspace environments give each workspace its own
environment, following the same logic. The description of the
`orca-per-workspace-env` skill names each part outright, quoted verbatim:

> "on-demand, disposable runtimes (cloud sandboxes, VMs, or local) created fresh
> for each workspace. Covers first-time setup (provider prerequisites, the
> reusable base snapshot, the coding-agent auth snapshot, credentials, and state),
> not just the per-workspace lifecycle scripts."

*Source: skills/orca-per-workspace-env/SKILL.md, skill description, retrieved
2026-09-08.*

Read the two phrases slowly. "created fresh for each workspace": the runtime is
created anew per workspace — each one holds its own, none borrowed from a
neighbor. "disposable": once the work is done, it is thrown away — the runtime
does not settle into leftover state on the machine. Where the runtime lives
follows the provider: cloud sandbox, VM, or local. The recipe is where all of
that gets declared, once:

```ascii
one machine → N workspaces → one environment per workspace, built from the recipe

  orca.yaml
  └── environmentRecipes: the recipe, declared once
        │
        ├─► workspace A → on-demand runtime, created fresh from the recipe
        ├─► workspace B → on-demand runtime, created fresh (its own copy)
        └─► workspace C → on-demand runtime, created fresh (its own copy)

  first time:  provider prerequisites + base snapshot + coding-agent auth snapshot
  next times:  a new workspace starts from the existing snapshots, no rebuild
  when done:   the runtime is disposable — discarded, machine back as it was
```

*Source: built from skills/orca-per-workspace-env/SKILL.md — the
`environmentRecipes` key in `orca.yaml`, the reusable base snapshot and the
coding-agent auth snapshot; retrieved 2026-09-08.*

The two snapshots are the most economical part of the design: the base snapshot
holds the heavy lifting (provider prerequisites, dependencies), the auth
snapshot holds the coding agent's logged-in state — both reused across
workspaces, the time-expensive part done once and captured.

## The toggle in settings, and one round of real dogfooding

The feature does not live in the CLI only — the per-workspace environment
toggle sits in the app's settings, inside a component with a straight-talking
name: `EphemeralVmsExperimentalSetting` (an experimental setting for ephemeral
VMs). Commit #7908 touched exactly that toggle row:

```bash
$ git show 24d7f6b790 -- src/renderer/src/components/settings/EphemeralVmsExperimentalSetting.tsx
-      <div className="flex items-start justify-between gap-4">
+      <div className="flex max-w-3xl items-start justify-between gap-4">
```

*Source: commit 24d7f6b790 "Align per-workspace environment toggle (#7908)" in
the orca repo, retrieved 2026-09-08.*

One line of diff, and it deserves a careful read: #7908 adds no feature — it
aligns the toggle row's layout, capping the width of the description block with
`max-w-3xl` so the settings row does not stretch on wide screens. A small
polishing commit, but it certifies two things: the toggle already existed in
settings, and someone was still caring for it. The toggle has shipped in
releases since v1.4.130.

In the same period, the skill's templates took one round of fixes after real
use. The commit subject, quoted verbatim:

> "fix(skill): fix 6 dogfood bugs in orca-per-workspace-env templates (#7485)"

*Source: commit 45370a5987 in the orca repo, retrieved 2026-09-08.*

Read the intent precisely: this is not a quality indictment. The commit body
shows the bugs surfaced while someone stood up a local Docker SSH per-workspace
env end to end — the agent-login check printed its result to stderr, so a
stdout-only grep wrongly reported "not logged in"; or plain OAuth login binds
an unreachable loopback callback port and hangs on headless VMs. The templates
changed because someone used them for real, all the way to where they break —
that loop is the sign of a living feature, not one sitting on a shelf.

## Real limits: recipes break, and doctor is where you check

A feature with no failure-checking command is usually a feature nobody has used
long enough to see break. `orca vm recipe doctor` existing means the opposite
is true here: recipes can break — a missing provider prerequisite, a stale
snapshot, a broken lifecycle script — and Orca keeps a place to check before
the breakage spreads to another workspace. The command appears in SKILL.md,
quoted verbatim:

```bash
ORCA vm recipe doctor <recipe-id> --repo-path <repo> --json
```

*Source: skills/orca-per-workspace-env/SKILL.md, quoted verbatim; retrieved
2026-09-08. `ORCA` is a placeholder — SKILL.md requires substituting the real
command (`orca`, `orca-dev`, or `orca-ide`) before running.*

SKILL.md calls doctor "the free static check" and builds a fence right next to
it, quoted verbatim: "Never add `--provision` without the user's explicit
approval because it creates provider resources and may spend money." A limit
written down twice in one file is a real limit: per-workspace runtimes live on
providers — real resources that can cost real money. The skill's closing
sentence is just as blunt: "you never own the user's cloud account, billing,
images, or credentials, and never spend money without an explicit user OK."

One design detail: SKILL.md is a discovery stub that deliberately does not
contain the full guide — that part is served by the binary itself via
`skills get orca-per-workspace-env`, because the docs are "kept out of this
file on purpose so it can never drift from the binary that will actually run
your commands" (quoted verbatim).

Zooming back out: [real parallelism through worktree
isolation](/blog/parallel-worktrees-isolation/) separated files between agents;
per-workspace environments separate the environment — two layers of isolation
wrapping each other, the lower one keeping the disk clean, the upper one
keeping the env clean. The recipe is declared in `orca.yaml`, the toggle sits
in settings, doctor checks for free before anything touches a provider — the
starting point is the [getting started](/docs/getting-started/) page.

To see it yourself: open Wakii's settings and find the per-workspace
environment row; or quieter — run `orca vm recipe doctor` against a recipe you
already use, and read its static report before the next workspace gets created.
