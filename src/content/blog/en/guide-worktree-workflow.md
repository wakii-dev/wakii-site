---
title: "The worktree workflow: one task, one worktree, day to day"
description: "Create, work, review, ship, and clean up a worktree in Wakii — picking the right start-from, sharing node_modules and .env across worktrees, the CLI table, and the way back to plain git when you need it."
pubDate: "2026-09-22"
category: "tutorial"
tags: ["guide", "worktree", "git"]
draft: false
---

One worktree per task is the unit of isolation that makes parallel agents
safe — [parallel worktrees isolation](/blog/parallel-worktrees-isolation/)
already proved the mechanism. But the mechanism does not answer the everyday
questions: which start-from to pick when creating, where `.env` and
`node_modules` come from in a fresh checkout, when and how to clean up. This
post is the practical lifecycle — create, work, review, ship, archive — with
the commands you will type every day in a real project.

TL;DR:

- A five-step lifecycle: create → work → review → ship → archive; create
  runs in the background with visible progress and never locks the UI.
- Four kinds of start-from: the base ref, another local branch, a commit
  SHA, a remote branch.
- The heavy stuff is shared through three mechanisms: Worktree Shared Paths
  (per repo), `orca.yaml sharedDirectories` (symlink/share), and
  `.worktreeinclude` (copy).
- The CLI covers daily life: `orca worktree list | current | create | set |
  rm | ps`.
- Plain git still works: outside worktrees surface through a hidden
  worktrees card; a CLI-side `git worktree remove` makes Orca clean up its
  own state.

## The five-step lifecycle, with create running in the background

A worktree's whole life fits in five steps — the docs call it the
"per-feature lifecycle":

```ascii
create ────► work ────► review ────► ship ────► archive
background,  agent,      diff vs       commit,    removes folder
progress     terminals   start-from    push, PR   + branch
```

*Source: diagram drawn from the "Per-feature lifecycle" section of the
worktrees docs, retrieved 2026-09-08.*

The detail worth remembering sits at the start: create never locks the UI.
Submit the dialog and it closes immediately — `git fetch` and
`git worktree add` continue in the background while you keep using the app.
The sidebar shows a progress row for the new worktree, and its tab shows live
setup status until the checkout finishes and swaps to the terminal. You can
switch to other worktrees mid-create, watch the progress, or cancel it from
the in-tab panel; if creation fails, the panel surfaces the error with a
Retry.

## Picking the start-from: four kinds of starting point

Every repo has a base ref — usually `origin/main`; every worktree has its
own start-from — what it branches off. The docs list exactly four kinds,
verbatim:

> "The repo's base ref (the fast path).
> Another local branch — useful for stacking work on top of a PR in review.
> A specific commit SHA.
> An existing remote branch — Orca will fetch and check it out."

*Source: worktrees docs, "Start-from picker" section, retrieved
2026-09-08.*

The default branch name derives from the workspace name you type, or from
the linked item when you create from a GitHub PR or a Linear issue — for
Linear, Orca uses the very branch name Linear suggests for that issue. To
set one by hand, expand the Advanced drawer in the create dialog and fill in
Branch name. In the story workflow, a sub-feature runs in its own worktree
with the story's destination branch as start-from — the "another local
branch" kind above; the [long tasks and bracket
tiers](/blog/long-tasks-bracket-tiers/) post tells the distribution half of
that mechanism, this post is the hands-on half.

## Sharing the heavy stuff: three mechanisms, three different bargains

A fresh worktree is a clean checkout — `node_modules`, caches, and `.env`
are all missing. Wakii fills that gap with three complementary mechanisms,
and the boundary between them is the easiest part of this topic to get
wrong:

One, **Worktree Shared Paths** — a per-repo setting in Settings →
Repository. Paths materialize from the primary checkout into each new
worktree (APFS clone-copy on macOS when possible, otherwise a symlink).

Two, **`worktree.sharedDirectories` in `orca.yaml`** — a checked-in,
repo-wide list for gitignored directories, shared by symlink/share rather
than copied. Entries must exist as directories in the primary checkout and
must be gitignored; tracked or missing paths are skipped. Built for large
rebuildable trees:

```yaml
# orca.yaml (repo root)
worktree:
  sharedDirectories:
    - node_modules
    - .cache
```

Three, **`.worktreeinclude` at the repo root** — a list of gitignored files
or directories that get copied (not symlinked) into each worktree, so each
worktree owns its copy. Literal paths only — globs and negation are skipped
with a warning; paths that are tracked, missing, or not gitignored are not
copied:

```text
# .worktreeinclude (repo root)
.env
.env.local
.vscode/settings.json
```

*Source: both code blocks quoted verbatim from the worktrees docs, "Shared
directories & gitignored files" section, retrieved 2026-09-08.*

How the three relate: `orca.yaml` shared directories add to the per-user
Worktree Shared Paths list — they never replace it; paths already
shared/linked are not re-copied from `.worktreeinclude`. The quick decision
rule: something huge and rebuildable like `node_modules` → symlink;
something small that each worktree must own like `.env` → copy.

## Six CLI commands that cover daily life

The everyday commands, quoted from `orca --help`:

| Command | What it does |
|---|---|
| `orca worktree list` | list worktrees (filter with `--repo`, cap with `--limit`, `--json`) |
| `orca worktree current` | the worktree active in this session |
| `orca worktree create --name <name>` | create one — takes `--base-branch <ref>`, `--agent <id>`, `--linear-issue <id>`, `--setup inherit`… |
| `orca worktree set` | rename the display name, attach/detach issues on an existing worktree |
| `orca worktree rm` | delete a worktree (`--force` if needed; `--run-hooks` to run hooks) |
| `orca worktree ps` | live overview: which worktrees have terminals running |

*Source: quoted from `orca --help`, retrieved 2026-09-08.*

## Plain git still lives here

Every Orca worktree is a real git worktree — open a terminal in it and
`git status`, `git rebase`, `git cherry-pick` run as usual; Orca picks up
the changes on its next render. The reverse holds too: a worktree you make
yourself with `git worktree add` stays outside Orca until you show it — the
sidebar presents a hidden worktrees card; open Non-Orca worktrees and choose
Show for the ones you want in. And if you delete a worktree from the plain
CLI, the docs keep a short callout for it:

> "If you `git worktree remove` from the CLI, Orca will notice and clean up
> its own state the next time it refreshes that repo."

*Source: worktrees docs, "Using plain git" section, retrieved 2026-09-08.*

The real state on the machine this post was written on — two commands, both
sides (trimmed, paths shortened to `~`):

```bash
$ git worktree list
~/Desktop/projects/wakii-site                   3eabe17 [main]
~/orca/workspaces/wakii-site/sf-4-blog-guides   7f88a9b [wakii-dev/sf-4-blog-guides]
(trimmed — 3 more worktrees of the same repo)
$ orca worktree current
displayName: sf-4-blog-guides
branch: refs/heads/wakii-dev/sf-4-blog-guides
baseRef: story/fi373-blog-batch2
hostId: local
linkedLinearIssue: FI-377
(trimmed — id, path, and git fields omitted)
```

*Source: `git worktree list` and `orca worktree current`, retrieved
2026-09-08.*

## Cleaning up: Resource Manager and the branches that stay

Deleting a worktree removes both the directory and the branch, with a
confirmation. But when a branch may still hold unmerged commits, git refuses
to drop it — the docs describe what happens next, verbatim:

> "If git refuses to drop a local branch because it may contain unmerged
> commits, Orca keeps those branches and shows a toast such as **Review N
> Branches**. Opening it lists the kept branches so you can force-delete some
> and leave others."

*Source: the worktrees docs, "Preserved branches" section, retrieved
2026-09-08.*

Gone folders do not come back, but unmerged branches are never swallowed
silently in a bulk delete.

When many worktrees need sweeping at once, go to Resource Manager → Clean
up workspaces: the list gathers local worktrees, main worktrees, folder
workspaces, and worktrees on disconnected SSH hosts — with status, recent
activity, size, git state, and linked review so you can decide before
selecting anything for removal.

This lifecycle does not stand alone: it is the execution unit of the story
pipeline — an idea becomes an epic, the epic becomes parallel sub-features,
each in its own worktree — described in full on the [story
workflow](/docs/story-workflow/) page. Try it today on the smallest task you
have: create a worktree, walk all five steps, and let archive prove that
nothing was lost.
