---
title: "Forking an IDE while keeping up with upstream: lessons from Wakii"
description: "Wakii forks Orca: main is the release line, fork-synced ff-only every day, while story branches run parallel to upstream — and the strategy when conflicts erupt."
pubDate: "2026-09-02"
category: "tech"
tags: ["git", "fork", "upstream"]
draft: false
---

Wakii is built on Orca, an open-source agentic IDE. Forking is the easy decision; keeping the fork from rotting into a messy clone six months later is the hard part. This post shares how we keep pace with upstream while shipping our own direction non-stop.

## Why fork instead of waiting for upstream

Upstream has its own speed and its own priorities. We need our own brand, a story workflow built for teams, and our own release cadence — but we don't want to lose the bug fixes and refinements upstream ships every week. A fork with disciplined syncing answers both.

## Two streams: main and wakii-dev

The Wakii repo keeps two streams strictly separated. `main` is the release line: it only receives release-merges, and it is synced from upstream daily. `wakii-dev` is the living line: every Wakii feature starts as a story branch cut from it, running parallel to upstream without contesting any branch.

This split kills the eternal question "which branch am I coding on": features live on story branches, releases live on main, and neither stream mixes on its own.

## Fork-sync, ff-only, every day

Once a day, main syncs from upstream fast-forward only. Nothing new upstream: a no-op. New commits and a straight history: a clean fast-forward. The streams have diverged: stop and let a human handle it — never auto-merge dirty commits into the release line.

The consequence: `main` is always a pure function of upstream plus release-merges — nothing else. Anyone looking at main at any moment knows exactly what it is.

## When conflicts erupt

Conflicts, when they happen, appear on story branches — never on main, because main takes no scattered edits. Our strategy, in order:

1. **Split early.** Brand content and custom config live in their own files. Fewer shared files means fewer collision surfaces.
2. **Sync early, sync often.** A conflict aged three weeks is a project; a conflict caught after one day is a three-minute fix.
3. **Resolve on the story branch.** When upstream genuinely collides with work in flight, merge upstream into the story branch, resolve there, and only then talk about a PR.

Months in: upstream remains an asset, not a burden. For what exactly differs between Wakii and Orca, see the [FAQ](/docs/faq/); to build from source yourself, start with [getting started](/docs/getting-started/).
