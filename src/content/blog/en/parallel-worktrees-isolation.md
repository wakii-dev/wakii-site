---
title: "Real parallelism through worktree isolation"
description: "Running several agents on one repo while sharing a directory means fighting over files and polluting each other's history. This post dissects Wakii's isolation mechanism — one worktree per SF, one branch per worktree — with live git transcripts, and shows why the atomic commit is the unit of rollback."
pubDate: "2026-08-28"
category: "tech"
tags: ["worktree", "git", "agents"]
draft: false
---

Run two agents in parallel on the same project without splitting the working
space, and you get parallelism in name only. Agent A is halfway through editing
a file when agent B commits — carrying A's unfinished half along. Agent B
overwrites what A just wrote; A rebuilds and cannot explain why the tests went
red. On disk there is one set of files, but two hands touching it at once.
Wakii solves this with a mechanism that belongs to git rather than to a
framework: worktree isolation.

TL;DR:

- A worktree lets one repo live in several directories, each checking out its
  own branch — parallelism starts on disk, not in a promise.
- Each sub-feature (SF) of a story gets its own worktree and its own branch, so
  two agents cannot fight over files: they stand in two different directory
  trees.
- The atomic commit is the unit of rollback: one VI+EN post pair is one commit
  — reverting it takes nothing else with it.
- Every transcript in this post was captured live with `git worktree list` and
  `git log` on a real machine, on 2026-09-07.

## One shared directory, parallelism in name only

The "split the work among agents" model is often misread as "open several
agents inside the same project directory". The difference is exactly there:
splitting work splits the task list, while the write space remains a single
one. When two agents write into one directory tree, the outcome depends on
sequence — whoever writes last wins, and the commit history blends the work of
both:

```ascii
one shared directory — the last writer overwrites the first

  /project/                        agent A: editing navigation.ts (half done)
    ├── navigation.ts   ◄── A      agent B: editing navigation.ts (half done)
    ├── config.ts       ◄── B        → one file, two unfinished versions
    └── …                            → B's commit drags A's half along
                                     → reverting B's commit loses A's half
```

*Source: conceptual diagram illustrating the situation the "one worktree per
SF" rule in src/content/docs/en/story-workflow.md exists to prevent, retrieved
2026-09-07.*

The problem is not careless agents — it is structure: one shared write space
does not allow responsibility to be separated. To separate it, divide the
space first, then run in parallel. That is what the next two sections do.

## One worktree per SF

A worktree is a native git feature: one repo can have several working
directories, each sitting on a different branch. No repo copy, no submodules —
just git opening another door into the same history. Wakii takes this exact
mechanism as the unit of story isolation: the bracket splits a story into SFs,
and each SF is granted its own worktree with its own branch.

On the machine this post series is being written on, the worktree list at
capture time had four lines:

```bash
$ git worktree list
/Users/hoivu/Desktop/projects/wakii-site                           73d0e55 [main]
/Users/hoivu/orca/workspaces/wakii-site/sf-2-series-a-self-working acfa59b [wakii-dev/sf-2-series-a-self-working]
/Users/hoivu/orca/workspaces/wakii-site/sf-3-series-b-long-tasks   1462b45 [wakii-dev/sf-3-series-b-long-tasks]
/Users/hoivu/orca/workspaces/wakii-site/sf-4-series-c-evidence     0f92761 [wakii-dev/sf-4-series-c-evidence]
```

*Source: `git worktree list`, retrieved 2026-09-07.*

Read by column: each line is a directory on disk, the middle column is the
checked-out commit, the bracketed column is the branch. The first line is the
main checkout on `main`. The remaining three are three SFs of a real blog story
running right now — Series A, Series B (the worktree holding the post you are
reading) and Series C — one directory, one branch, one agent each. Earlier on
2026-09-07, this list was longer: another blog redesign story was running three
worktrees of its own on the same repo. A worktree is born when its SF starts
and leaves the list once its work has merged.

The rule lives in the docs, written as one sentence — quoted verbatim:

> "Independent sub-features run **in parallel**, each in its own isolated
> worktree and branch."

*Source: src/content/docs/en/story-workflow.md, section "4. Parallel
execution", retrieved 2026-09-07.*

And here is the answer to "why can't two agents fight over files": fighting
over a file requires the same path, and the two agents stand at two different
root paths. The SF-2 agent writes files under the SF-2 directory; the SF-3
agent writes under the SF-3 directory. There is no shared file on disk — the
conflict is not "handled", it has no place to happen.

## Two worktrees, side by side on disk

```ascii
one repo — two worktrees — two agents writing two different sets of files

~/Desktop/projects/wakii-site/         branch: main (main checkout)
orca/workspaces/wakii-site/
  ├── sf-2-series-a-self-working/      branch: wakii-dev/sf-2-series-a-self-working
  │    agent SF-2 → writes Series A posts only, inside this directory
  └── sf-3-series-b-long-tasks/        branch: wakii-dev/sf-3-series-b-long-tasks
       agent SF-3 → writes Series B posts only, inside this directory

  different directories → no shared path → no file to fight over
  different branches    → two commit histories apart until the merge point
  merge point           → both merge into the same destination branch
                          story/<epic>-<slug>
```

*Source: built from the `git worktree list` output above; the destination-branch
rule is in src/content/docs/en/story-workflow.md, retrieved 2026-09-07.*

The convergence onto the destination branch stays light here — it is the topic
of another post in this series. What matters at the physical level: the
separation happens at the filesystem layer, before git has to mediate anything
between the two agents.

## The atomic commit is the unit of rollback

Isolation settles conflicts on disk. The atomic commit settles conflicts in
history. The principle: each commit contains exactly one complete unit of work
— no bundling several ideas into one commit, no letting one idea span two
commits. On the branch this post is being written on, the six most recent
commits are a living transcript of that principle:

```bash
$ git log --oneline -6
1462b45 docs(plan): tick T1 long-tasks-bracket-tiers @480d058 (VI 1227 / EN 1141 từ, lint xanh)
480d058 feat(blog): long-tasks-bracket-tiers EN+VI (T1 — matrix #8)
eff8fc7 docs(plan): sf-3 series-b 8 tasks (7 post + consistency-pass) — plan-critic FIX-P0-FIRST resolved (T3 field thật fi245/fi339 + 3 P1 + 2 P2)
e99cdd0 fix(review): P1 code-reviewer — plan ACCEPTANCE đọc đúng hướng sort DESC (pilot cuối list) + VI pilot quote nguyên văn docs VI
62f5f69 feat(blog): pilot zero-setup-agent-team EN+VI đi hết pipeline (T8 — matrix #1)
9ce442c docs(editorial): writer runbook (T7 — checklist 8 bước per-post, D4 link locale, D7 draft fallback, case-study double-pass)
```

*Source: `git log` on the story branch, retrieved 2026-09-07.*

Read line by line: `480d058` holds exactly one post pair — the VI and EN
versions of the previous post in the series — mixed with nothing else.
`62f5f69` is the pilot pair. The `docs(plan)` and `docs(editorial)` lines are
documentation changes, kept apart from the posts. The rollback consequence: to
remove the previous post while keeping the pilot, revert exactly `480d058` —
one command, no other line touched. Under the shared-directory model, a commit
tends to gather everything sitting in the working directory — including
another agent's half-finished work — so reverting one idea drags half of the
next idea along.

This rule is not the writer's personal taste — it is a responsibility recorded
in the kit's role table, quoted verbatim:

> "Implements tasks in isolated worktrees, commits atomically"

*Source: src/content/docs/en/agents-and-kit.md, the task-executor row of the
role table, retrieved 2026-09-07.*

The two rules in this post — one worktree per SF, one commit per unit of work —
are two halves of the same promise: run in parallel without paying for it in
chaos. The previous post in the series,
[brackets and tiers: a map for long-running projects](/blog/long-tasks-bracket-tiers/),
drew the bracket and the tiers at the map level; this post steps down to the
physical level: directories on disk, branches, commits. Every role's
responsibility — including the task-executor holding both rules above — is
listed on the [agents & kit](/docs/agents-and-kit/) page, and the full story
lifecycle lives on the [story workflow](/docs/story-workflow/) page.

To see the difference yourself: open Wakii, describe the idea in one line —
the pipeline splits the story into SFs, runs them in parallel inside their own
worktrees, and converges them onto one destination branch when done. Or
simpler: run `git worktree list` on a repo where several agents are working,
and count how many lines share one history without touching each other's
files.
