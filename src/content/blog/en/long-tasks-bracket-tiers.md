---
title: "Brackets and tiers: a map for long-running projects"
description: "Long projects rarely die from a shortage of work — they die from losing the map. This post puts two real brackets side by side — 3 SFs and 28 SFs — to show the same skeleton at both scales: epic on top, tiers below, dependency edges between."
pubDate: "2026-08-27"
category: "tech"
tags: ["story-workflow", "workflow", "linear"]
draft: false
---

A long project rarely dies from a shortage of work — it dies because nobody
remembers where the project stands. The finished part looks great; the
remaining part scares everyone, because it is unclear what depends on what, and
whether touching it breaks something else. A task list in an issue tracker
answers "what's left", but not the more important question: "can this start
now, or does it still have to wait?". The bracket in Wakii exists to answer
exactly that: one file that splits a project into sub-features, stacks each
sub-feature into a tier, and records every dependency edge. This post puts two
real brackets side by side — a small one with three SFs, a large one with
twenty-eight — to show that the scale changes but the skeleton does not.

TL;DR:

- A bracket is the map file of a long project: epic on top, sub-features (SFs)
  stacked in tiers, each SF recording its tier, Linear issue, dependencies, and
  task list.
- Tiers answer "when may this start": an SF only begins when everything in the
  previous tier is merged.
- Two real brackets compared: FI-339 — the story that built the foundation of
  the blog you are reading (3 SFs, 3 tiers) — and fi245-postgres-production
  from hub-store (28 SFs, many tiers). Same skeleton.
- Every tier merges into a single destination branch, `story/<epic>-<slug>`, so
  running in parallel does not mean scattered git histories.

## A bracket is the map of a long project

In Wakii, the plan is not a dead file in a docs folder. After three steps —
impact analysis, spec, plan — the result is unfolded into a bracket: one file
listing every sub-feature of the story, one short block per sub-feature.
Reading a block tells you what the sub-feature is, which tier it sits in, who
it waits for, and what counts as done.

Here is the SF-1 block of a real bracket — FI-339, the story that built the SEO
surface, the TOC, and the ten seed posts of the very blog you are reading. The
core fields of an SF block are Tier, linear, What, Depends on, and Tasks (the
`What` field describes the end result, trimmed here for brevity):

```text
## SF-1 SEO surface + TOC + assets
Tier: 0
linear: FI-340
Depends on: —
Tasks: base-og-contract / rss-feed-contract / og-default-asset / …
```

*Source: docs/superpowers/brackets/fi339-blog-features.md, retrieved
2026-09-07.*

Each line is an answer. `Tier: 0` means nobody to wait for — it starts as soon
as the story goes green. `linear: FI-340` ties the block to an issue on Linear,
so progress on the tracker and the map are not two separate truths.
`Depends on: —` is an empty edge: nothing blocks it. `Tasks` is a checklist
detailed enough for one agent to pick up and run to completion.

The part that matters more than the fields: a bracket is not descriptive
documentation — it is the coordination structure. The orchestrator reads the
bracket, builds a DAG from the `Depends on` edges, and schedules from that
graph. With a map on the wall, nobody has to ask around "what do I pick up
next".

## Three tiers in the FI-339 bracket

The small bracket of this example has exactly three SFs, stacked in three
tiers:

```ascii
FI-339 blog features — destination: story/fi339-blog-features

tier 2   SF-3 Site-wide convergence QA   (FI-342)  ← final merge, settles story
              ↑
tier 1   SF-2 Seed content, 10 posts     (FI-341)  ← needs SF-1's surface
              ↑
tier 0   SF-1 SEO surface + TOC + assets (FI-340)  ← depends on nothing
```

*Source: docs/superpowers/brackets/fi339-blog-features.md, retrieved
2026-09-07.*

Why this ordering and not another? SF-1 is tier 0 because everything after it
needs it: a post needs the OG image to share a correct card on social, needs
RSS so feed readers can subscribe, needs the TOC for long reads. SF-2 —
seeding ten posts across two locales — only makes sense once that surface has
merged, so it sits at tier 1. SF-3 is site-wide QA: it can only converge once
everything else has stopped moving, so it sits at tier 2 and depends on SF-2.

Three tiers, three merge points. SF-1 merges first; SF-2 starts only after SF-1
has landed on the destination branch; SF-3 waits for both. Each SF gets its own
agent in its own worktree. A larger bracket can hold many SFs within one tier
to run in parallel — but no SF starts before the tier beneath it has merged.

## Two real brackets, side by side

The small bracket above comes from a blog story. To check whether the skeleton
survives a scale-up, put next to it a bracket from a different production
project: the
[fi245-postgres-production bracket](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/fi245-postgres-production.md)
in the public hub-store repo — twenty-eight SFs, from Postgres infrastructure
up to a mobile app. Its first two landmarks, quoted verbatim:

```text
## SF-1 Postgres infra + seed pipeline
Tier: 0
linear: FI-246
Depends on: —
Tasks: compose-postgres / initdb-2-databases / healthcheck-wiring / …

## SF-2 Orders Java → Postgres
Tier: 1
Depends on: SF-1
```

*Source: raw.githubusercontent.com/wakii-dev/hub-store —
docs/superpowers/brackets/fi245-postgres-production.md, retrieved 2026-09-07.
The full `Tasks` line of SF-1 lists 12 tasks, from standing up a Postgres
container with two databases to the healthcheck and the seed pipeline.*

Draw both brackets in the same frame:

```ascii
        FI-339 blog features              fi245-postgres-production
        (small bracket)                   (large bracket)
        3 SFs · 3 tiers                   28 SFs · many tiers

epic ►  blog features                     postgres production
                                              ▲
        tier 2  SF-3 convergence QA       …
        tier 1  SF-2 seed 10 posts        tier 1  SF-2 Orders Java → Postgres
        tier 0  SF-1 SEO surface + TOC    tier 0  SF-1 Postgres infra + seed

        same skeleton: epic on top, SFs in tiers, "Depends on" edges
        different scale: 3 rows vs 28 — tier count and edge count grow
```

Read horizontally: the same skeleton — epic on top, SFs stacked in tiers,
dependency edges from one SF to the next. Read vertically: a different scale —
three rows versus twenty-eight, three tiers versus many more. And one detail
worth noticing: the SF-1 of both brackets is tier 0, both read `Depends on: —`,
and both are foundation layers — because at any scale, the thing that waits for
nobody is the thing that gets built first.

That is the point: a bracket has no "small mode" and "large mode". Same fields,
same tier rule, same shape of destination branch. A project scaling up adds
rows and tiers to the map — it does not change the shape of the map.

## Tiers are merge law, not advice

Tiers are easy to misread as scheduling hints: "better done after". In the
workflow, they are a start condition, written down as law in the docs — quoted
verbatim:

> "a sub-feature only starts when everything in the previous tier is merged"

And the destination of every merge is not "each person's branch" — the docs
name it directly:

> "a single destination branch — `story/<epic>-<slug>`"

*Source: src/content/docs/en/story-workflow.md, section "5. Tiers and one
destination branch", retrieved 2026-09-07.*

Those two sentences turn tiers into machine-checked law. An SF at tier 1 does
not "should" wait for the tier-0 SF — it cannot start, because the pipeline
only opens the next tier once the previous one has merged into the destination
branch. Parallelism therefore does not drift into scattered git histories that
need painful reconciliation later: integration happens continuously, at points
known since the bracket was written.

The whole lifecycle — from the moment a bracket settles to the moment a PR
opens — is walked through on a live feature in
[the story workflow: from idea to release](/blog/story-workflow-idea-to-release/).

Tiers, the destination branch, and the B0–B5 gates that settle quality are all
documented on the [story workflow](/docs/story-workflow/) page — that page is
the source of truth when your project's bracket differs from the examples here.

To draw the map for your own long project: open Wakii, describe the idea in one
line, and read the bracket before the first line of code is written.
