---
title: "Upstream sync: living with your parent project"
description: "Three remotes, a mirror branch and a dev branch, two divergence-counting commands — this post dissects how Wakii lives alongside its upstream stablyai/orca, using real git output, a timeline diagram, and a table of the conflict layers you actually hit."
pubDate: "2026-09-28"
category: "tech"
tags: ["oss", "upstream", "git"]
draft: false
---

A fork is a ship leaving port — and the upstream never waits for it. The parent project keeps committing every day, changing APIs, refactoring the very spots you just built on. "Living with your parent project" is therefore not a state but a verb, repeated forever: pull, merge, resolve, repeat. An earlier post in this blog covered the keep-up strategy at the level of principles; this one goes down to the mechanics — which remotes, which branches, which commands measure divergence, and which layers collect conflicts. Every git output in this post is real, captured on a local clone of the product repo, and you can rerun each command on a fork of your own.

TL;DR:

- Three remotes, three roles: `origin` (a personal mirror), `upstream` (the parent project stablyai/orca), `wakii-dev` (the fork's public home) — the whole map readable from one `git remote -v`.
- Two branches with two contracts: `main` is a passive mirror of upstream, `wakii-dev` is the living branch where all of Wakii's own commits land.
- Sync status is a measurable number, not a feeling: two `git rev-list --count` commands plus one `git merge-base --is-ancestor` answer it completely.
- Conflicts pile up in thin layers — the files the fork touches most often are the files that collide with upstream first.

## Three remotes, three roles

The first thing to look at is the remote map of the local clone:

```text
$ git remote -v
origin      https://github.com/VuHoi/orca-1.git (fetch)
origin      https://github.com/VuHoi/orca-1.git (push)
upstream    https://github.com/stablyai/orca.git (fetch)
upstream    https://github.com/stablyai/orca.git (push)
wakii-dev   https://github.com/wakii-dev/wakii.git (fetch)
wakii-dev   https://github.com/wakii-dev/wakii.git (push)
```

*Source: `git remote -v`, local clone of the `wakii-dev/wakii` repo, retrieved 2026-09-08.*

Three remotes, three non-overlapping roles. `upstream` is the source — where every improvement of the parent project flows in. `wakii-dev` is the public home — where users clone Wakii from. `origin` is a personal mirror for the dev machine, where experimental branches get backed up before they qualify for the public home. Separating the three roles from day one cuts out a classic beginner-fork mistake: pushing an experimental branch straight to the repo users see. With this map, that cannot happen by accident.

## Two branches, two contracts

Inside one repo, the two main branches carry different contracts — the fork's README spells them out:

```text
| Branch      | Purpose                                        |
| ----------- | ---------------------------------------------- |
| wakii-dev   | default — Wakii development happens here       |
| main        | mirrors stablyai/orca main, auto-synced daily  |
|             | by GitHub Action                               |
```

*Source: `README.md`, Branches section, repo `wakii-dev/wakii`, retrieved 2026-09-08.*

`main` has a passive contract: it only reflects upstream, never receives original commits. `wakii-dev` has an active contract: everything Wakii does happens here, including branding commits like renaming the app or replacing the icon. The two contracts enable a simple flow diagram:

```ascii
stablyai/orca main
      │  auto-sync (daily)
      ▼
wakii-dev/wakii main ────── passive mirror
      │  merge when you want upstream work
      ▼
wakii-dev/wakii wakii-dev ─ living branch
      │  branch story / feature work off it
      ▼
story branches ── short-lived, merge back to wakii-dev
```

*Source: diagram assembled from the Branches table in the README (source above) and the commit history of the `wakii-dev` branch, retrieved 2026-09-08.*

Story branches living short lives on top of `wakii-dev` is exactly how [one branch, one PR](/blog/one-branch-one-pr/) operates in a real project — the upstream-tracking branch is never where features are born.

## Divergence is a number, not a feeling

The question "is my fork still close to upstream?" usually gets answered by vibes. It should be answered by two numbers. As captured on the local clone:

```text
$ git rev-list --count refs/remotes/upstream/main..refs/heads/wakii-dev
164
$ git rev-list --count refs/heads/wakii-dev..refs/remotes/upstream/main
0
$ git merge-base --is-ancestor refs/remotes/upstream/main refs/heads/wakii-dev
$ echo $?
0
```

*Source: the three git commands run on a local clone of `wakii-dev/wakii`, local refs captured 2026-09-08.*

Read the three results as a report: the `wakii-dev` branch is 164 commits ahead of upstream — the sum of Wakii's own work (the workflow kit, branding, kit bug fixes). The other direction, upstream has zero commits the fork does not contain: the tip of upstream/main is a direct ancestor of `wakii-dev` as of the last local ref fetch. The second number depends on the most recent `git fetch` on the machine — which is why this post says "local refs captured 2026-09-08": remote-tracking refs are only as fresh as the last fetch, the command does not reach the internet by itself. A number with a source and a date — the same rule the rest of this blog runs on.

One technical detail worth recording: when a repo has both a local branch and a remote-tracking ref sharing a name (here `wakii-dev` is both a remote name and a branch name), `git rev-list wakii-dev` warns `refname 'wakii-dev' is ambiguous` and picks one by priority order. Using full refspecs — `refs/heads/...` and `refs/remotes/...` as above — is the unambiguous way to write it; sync scripts should do the same so results do not depend on each machine's configuration.

## Conflicts pile up in thin layers

When you merge upstream in, conflicts do not spread evenly — they concentrate in the files the fork touches most. The fork's own commit history points at those layers. The last eight commits on `wakii-dev` at capture time:

```text
$ git log --oneline -8
60edfd99da feat(mobile): Story mode toggle on session input — ...
0668f1cf99 fix(kit): ORCA_BIN fallback probe command -v orca ...
5a82167b46 fix(plugins): inject ORCA_BIN vào env plugin worker ...
07d1f11cd4 ci: xóa các workflow trigger pull_request trên fork ...
5a5e85adab docs(AGENTS): story PRs target wakii-dev, never main
7800bb7dd9 docs: README download table — re-pin to v1.4.199
96e3bc5862 ci: codify fork release — fork-release-cut ...
ecc798c655 ci: cut mac + windows build uploads to v1.4.199
```

*Source: `git log --oneline -8` on the `wakii-dev` branch, retrieved 2026-09-08.*

Read the list as a risk-layer table. `README.md` gets touched by the fork to re-pin the download table (`7800bb7dd9`) — and upstream edits its README almost weekly, so this is collision layer one. `package.json` is layer two: the fork adds its own scripts, upstream changes its own, one file with two owners. `pnpm-lock` is layer three — a lockfile that generates noisy conflicts but resolves mechanically: take whichever side won in `package.json`, rerun the install command to regenerate. Layer four is CI workflows: the fork deleted the triggers it does not need (`07d1f11cd4`) while upstream keeps adding new workflows — conflicts here are usually just "keep both, disable the right part."

The remaining trade-off of syncing is not about tools but about timing. Merging upstream while a feature story is mid-flight means pushing conflicts into unfinished work — you resolve one batch, the conflict shape changes. The cheaper ordering: land upstream into `wakii-dev` before cutting a new story branch, so every story is born on the freshest base and never has to fight upstream while alive. Short-lived story branches complete the solution — the shorter they live, the lower the odds upstream moves underneath them.

That is the full mechanics of living with a parent project: three remotes with named roles, two branches with contracts, divergence measured by commands, and conflicts layered by how often the fork touches a file. Wakii's story process — from idea to release — runs on top of this machinery; read the [story workflow](/docs/story-workflow/) docs for the process layer above it, or revisit the post on [forking an IDE while keeping current with upstream](/blog/forking-an-ide-keeping-current-with-upstream/) for the principles layer.

Fork a living project yourself and try the divergence commands above — the first two numbers will tell you where your ship sits on the water.
