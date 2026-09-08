---
title: "The /story-workflow skill: an epic, many SFs, one destination"
description: "Type /story-workflow and a large feature runs as a story: one Linear epic, many sub-features in parallel, one destination branch. This post reads the skill's actual source — the entry rubric, the bracket file format, context packs, and the three-layer watchdog."
pubDate: "2026-09-10"
category: "tech"
tags: ["skills", "story-workflow", "workflow"]
draft: false
heroImage: "/blog/heroes/skill-story-workflow.png"
---

In the [tour of Wakii's public skills](/blog/skills-catalog-tour/), one skill got
named but left undecoded: story-workflow — "runs large features as a story." How
machine-readable is "large"? This post opens the skill's actual source file —
~/.claude/skills/story-workflow/SKILL.md — and answers four questions: how big a
feature must be to qualify as a story, what a bracket file looks like, how
sub-features inherit the epic's analysis, and how to tell a running agent from a
dead one. The running example is a story running right now — the one producing
this very post.

TL;DR:

- /story-workflow turns a feature into a story: one Linear epic, many
  sub-features (SFs) running in parallel, one destination branch collecting
  everything.
- The entry rubric sits verbatim in the source: split into a story when a
  feature exceeds 3 sub-features or 10 tasks.
- The bracket file is a vertical blueprint the Story panel parses directly: one
  block per SF with Tier, linear, What, Depends on, Tasks.
- Context packs turn "analyze once, inherit many" into a physical file: each SF
  reads its pack instead of re-synthesizing the epic's analysis.
- The watchdog runs a three-layer diagnosis before declaring an agent dead —
  one real story saw 4 SFs presumed dead overnight; 0 actually were.

## How big does a feature need to be? There is a rubric

The skill file opens with its description, and the activation condition is
written as a concrete number, not a hunch:

```text
or when a feature is large enough to need multiple parallel
workflows (rubric: >3 sub-features or >10 tasks)
```

*Nguồn: ~/.claude/skills/story-workflow/SKILL.md (frontmatter), lấy 2026-09-08.*

The rubric answers the question every software team runs into: at what point
should you split? Below the threshold, a single workflow is enough. Above it,
the feature becomes an epic + SFs: each SF gets its own Linear sub-issue, its
own worktree, its own agent. The skill also applies a rubric in reverse to each
SF to prevent over-splitting: the target size is 8-15 tasks per SF, and an SF
under 6 tasks gets merged into the nearest SF doing similar work. The split is
not size-driven only: the C1-C5/V1-V3 rubric asks each SF candidate three
questions — does it own an outcome, does its touch map overlap another SF's, is
the interface between them pinned. And before proposing the SF list, the skill
requires reading the actual source code: the touch map must come from code, not
memory.

## The bracket file: a vertical blueprint the machine parses

A story begins as a file. After the three analysis steps — impact, spec, plan —
the result is poured into a bracket file in a format the skill labels STRICT:

```text
Bracket file format (STRICT — the Story tab parser reads this)

## SF-1 Types + Contract
Tier: 0
linear: MY-144
What: shared carrier types + BE contract
Depends on: —
Tasks: response-types / payload-types / enums
```

*Nguồn: ~/.claude/skills/story-workflow/SKILL.md, lấy 2026-09-08.*

STRICT is not decoration: this exact file is what the Story panel parses to draw
the graph — the epic on top, SF nodes arranged by tier. Every field is a
machine-readable answer: Tier 0 means "waits for no one"; Depends on draws the
dependency edges; linear links the node to its issue on Linear. Two writing
rules show the bracket is designed to live through an entire epic: What states
end-to-end, demoable behavior rather than architectural layers; and no file
paths or line numbers are allowed, because "bracket sống cả epic, path chết sau
1 refactor" (the bracket outlives the epic; paths die after one refactor) —
verbatim from the source. The Destination: story/<epic-id>-<slug> line at the
top pins the single branch every SF forks from and merges into. The nature of
tiers and the destination branch is covered in depth in a
[dedicated post](/blog/long-tasks-bracket-tiers/) — this one only records the
file mechanism: a bracket is a vertical blueprint that both humans and the DAG
orchestrator read.

## Context packs: analyze once, every SF inherits

The core of the skill is a bolded block near the top of the file:

```text
Core principle: analyze once, inherit many times. Phase 0-2 quality
happens ONCE at epic level with ALL principles at maximum strictness;
each SF (sub-feature) then runs only Phase 3-5 (plan-detail, execute,
verify), reading the epic spec — never re-analyzing, never re-asking.
```

*Nguồn: ~/.claude/skills/story-workflow/SKILL.md, lấy 2026-09-08.*

To keep that principle off the paper and in the filesystem, the skill requires
writing a context pack per SF at CREATE time: a docs/superpowers/contexts/sf-<n>.md
file in a mandatory 4-section format — Spec slice, Touch map, ACCEPTANCE
user-visible, Boundary. The operationally crucial detail is location: the pack
lives in the main repo, so when an SF forks its worktree from the destination
branch, the pack travels with git — no dependency on any session staying alive.
SKILL.md states the purpose bluntly: "SF agent đọc file này THAY VÌ tự tổng hợp"
— the SF agent reads this file INSTEAD of re-synthesizing from bracket + epic +
comments.

Here is the real thing — the opening line of SF-2's context pack, the skills
series this post belongs to:

```text
> Đọc file này THAY VÌ tự tổng hợp. Epic spec:
> docs/superpowers/specs/2026-09-08-blog-batch2-design.md (rev 3).
> Bracket: docs/superpowers/brackets/fi373-blog-batch2.md.
```

*Nguồn: docs/superpowers/contexts/fi373-sf-2.md, lấy 2026-09-08.*

The agent writing this post received exactly that file, read exactly its spec
slice, and did not have to re-ask a single question the epic already answered.
The analysis runs once at epic level — paid once, inherited by all thirteen
posts.

## The watchdog: a silent agent is not necessarily dead

A story runs overnight; in the morning one SF still shows yellow — dead, or
working? The skill has an entire stall detection section, and its principle
number 5 is named after exactly this: "Idle ≠ chết" (idle does not mean dead).
An idle Claude session keeps its todo-list and context intact; resuming means
sending fresh input to wake it, not rebuilding the worktree from scratch. Before
concluding anything, run the three-layer diagnosis:

```text
1. git log trong worktree SF — có commit mới không?
   (có = agent đang chạy, chỉ chậm)
2. terminal list — symbol ⠂ (running) hay ✳ (idle)?
3. Chỉ khi cả hai tĩnh hoàn toàn → RESUME
```

*Nguồn: ~/.claude/skills/story-workflow/SKILL.md (mục Stall detection), lấy
2026-09-08.*

These three layers map to what the [story workflow docs](/docs/story-workflow/)
call the watchdog 3-layer check: recent commits, terminal output, Linear state.
The most valuable part is the lesson attached, quoted verbatim: "Bài học FI-151:
4 SF tưởng 'chết qua đêm' — 2 đang tự chạy, 2 idle-sống; 0 cái thật sự chết" —
four SFs presumed dead overnight: two were running on their own, two were idle
but alive, zero were actually dead. A hasty conclusion is not just wrong — it is
expensive: a duplicate worktree, interrupted state, another night of waiting for
the downstream tier. The watchdog is therefore not a monitoring tool for peace
of mind; it is the precondition that lets work split into agents running
overnight with nobody standing watch.

## A live story: the bracket this post is written inside

All of the mechanisms above are running as you read. Story FI-373 — 44 blog
posts — is managed by a real bracket file in the repo:

```text
# Story: FI-373 — Blog batch 2 — hoàn thiện mọi facet: 44 bài mới (skills · features · guides · arch · logs)

Destination: story/fi373-blog-batch2

## SF-2 Series Skills — 13 bài
Tier: 1
linear: FI-375
Depends on: SF-1
```

*Nguồn: docs/superpowers/brackets/fi373-blog-batch2.md (SF-2 What and Tasks
fields trimmed), lấy 2026-09-08.*

The story's six SFs stack into three tiers — redrawn from the Depends on
fields:

```ascii
FI-373 — destination: story/fi373-blog-batch2

tier 2        SF-6 Convergence QA (FI-379)
               ↑      ↑        ↑      ↑
tier 1  SF-2 Skills  SF-3 Features  SF-4 Guides  SF-5 Arch+OSS+Logs
        (FI-375)     (FI-376)       (FI-377)     (FI-378)
               ↑
tier 0        SF-1 Editorial infra (FI-374)
```

*Nguồn: docs/superpowers/brackets/fi373-blog-batch2.md, lấy 2026-09-08.*

Read it by the bracket's own rules: SF-1 — editorial infrastructure (lint
manifest, claims registry, hero pipeline) — is tier 0, already merged into the
destination branch on 2026-09-08. Four content series run in parallel at tier
1; the post you are reading is one of SF-2's 13 tasks. SF-6 converges at tier
2, starting only once all four series have landed on the destination branch.
The bracket is also where ordering is pinned in writing: the story's spec
states "Editorial docs (registry/matrix/style-guide/evidence-pack) FROZEN sau
SF-1 — thêm mục qua coordinator" — the floor freezes before the floors above it
start being built, so the 13 posts in flight do not have the ground swapped
underneath them. One epic, six SFs, one destination branch: exactly the
blueprint from the sections above, currently executing.

The full lifecycle of a story — from bracket approval to PR — is told in
[story workflow: idea to release](/blog/story-workflow-idea-to-release/); the
B0-B5 gates, the eight principles, and the merge topology live in the
[story workflow docs](/docs/story-workflow/). Wakii is an agentic IDE with a
built-in superpowers team — download it, describe your idea in one line, and
let the bracket handle the rest.
