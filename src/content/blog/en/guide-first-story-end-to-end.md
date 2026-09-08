---
title: "Your first story, end to end: what to click, what to type"
description: "A hands-on first run, step by step: state your idea in the ⚡ Workflow tab, watch impact and the plan land on Linear, follow SFs across the 🌳 Story bracket, answer gates B0–B5, and receive a single PR."
pubDate: "2026-09-20"
category: "tutorial"
tags: ["guide", "story-workflow", "workflow"]
draft: false
---

There are two ways to tell the story of Wakii's story workflow: retell a case
that already ran — the way [story workflow: from idea to
release](/blog/story-workflow-idea-to-release/) does — or sit next to you and
click every button, from a blank page to a pull request. This post picks the
second way: exactly the steps of a first run, each with a quote from the docs
so you know what you are looking at and why it sits where it does. No theory
up front, no architecture at the end — just the road.

TL;DR:

- Preparation: app running, repo added, the `story-*` kit already installed
  since first launch.
- Step 1: state the idea in the ⚡ Workflow tab — pick an intent, press Start.
- Steps 2–3: an agent maps impact, the plan lands on Linear, SFs fan out in
  parallel on the bracket canvas.
- Steps 4–5: you answer gates B0–B5, SFs merge into one destination branch,
  and the story ends as a single PR.

## Five minutes of preparation: app running, repo added, kit already in place

Three preconditions, all covered during install: the Wakii app is open, your
project has been added to it, and your agent CLI is installed on the machine.
Missing any of them? [Installing and updating Wakii from
zero](/blog/guide-install-update/) starts from an empty machine. The third
condition is the one people doubt most, so it deserves a command: on first
launch, the workflow kit installs itself into `~/.claude/`, including the
`story-*` command-line tools the agents lean on throughout the pipeline:

```bash
$ ls ~/.claude/bin | grep '^story-' | head -8
story-attempt
story-compact-recovery
story-dashboard-server
story-dashboard.html
story-diff-review
story-launch
story-memory
story-memory-fuse
```

*Source: `ls ~/.claude/bin` on the machine this post was written on, retrieved
2026-09-08. 25 lines match the prefix, one of them an `.html` file — 24
`story-*` tools at the time of writing.*

You do not need to know what those twenty-four tools do — the agents use them,
not you. You only need to be sure they are there: the presence of `story-*` is
the sign the kit installed correctly.

## Step 1 — State the idea in the ⚡ Workflow tab

Click the ⚡ icon in the right-side activity bar (`Cmd/Ctrl + L` brings the
sidebar back if it is hidden). The Superpowers panel has exactly two tabs; the
starting point is ⚡ Workflow — where the opening prompt for your coding agent
is assembled from a few of your choices. The first choice is the intent,
quoted verbatim from the docs:

> "Intent — what kind of work is this? *New feature*, *Continue work*, or
> *Quick fix*. The intent picks the workflow shape (and skips planning phases
> that don't apply, e.g. quick fixes)."

*Source: superpowers panel docs (EN), ⚡ Workflow tab section, retrieved
2026-09-08.*

For a first run: choose New feature, describe your idea in a few lines, keep
the modes at their defaults, and press Start. One mode is worth deliberately
leaving off this first time — Autonomous makes gates self-approve after
checkpoints, and on a first run you want gates to stop and ask you; the reason
belongs to step 4. The assembled prompt goes to your coding agent, and the
rest of the pipeline starts running on its own.

## Step 2 — Impact and plan: analyze once, publish to Linear

The first agent to touch your idea is not the one writing code. The docs say:

> "A **phase-0 impact analyst** maps the blast radius first: touch map,
> second-order effects across multiple dimensions, and alternatives — before
> any code exists."

Then the plan gets broken down and published:

> "The plan is broken into bite-sized tasks and published to **Linear** as
> subtasks, so progress is visible to the whole team — not buried in a chat
> log."

*Source: both quotes from the story workflow docs, The pipeline section
(steps 1–2), retrieved 2026-09-08.*

Everything that just happened — and everything ahead — fits in one line,
quoted verbatim from the docs:

```
idea → impact → plan → epic + SF bracket → parallel SFs → gates → 1 PR per story
```

*Source: story workflow docs, "The pipeline" section, retrieved 2026-09-08.*

Analysis runs exactly once, at story level — every SF afterwards inherits the
results through a context pack instead of asking again. The plan living on
Linear rather than inside a chat log also has a post of its own: [Linear as
external memory](/blog/linear-as-external-memory/) explains why progress has
to be visible from outside the chat session.

## Step 3 — The bracket and SFs running in parallel

Open the 🌳 Story tab and your story appears as a graph. The docs describe
exactly what is on screen: "a live SVG graph of your story: the epic node, its
sub-features, dependency edges, and per-node status colors, with live agent
activity and progress" — the epic node on top, SFs arranged into dependency
tiers, edges showing what waits on what.

How the SFs run is the most memorable part of the pipeline, quoted verbatim:

> "Independent sub-features run **in parallel**, each in its own isolated
> worktree and branch."

*Source: story workflow docs, section 4. Parallel execution, retrieved
2026-09-08.*

Translated onto disk: each SF gets its own working directory, its own branch,
its own agent. Two independent SFs never write into the same file tree, so the
conflict has no place to happen. An SF only starts when everything in the
previous tier has merged — dependency depth becomes an explicit startup order.

## Step 4 — Gates B0–B5: the gate asks, you answer

When the SFs report done, the checking begins. Story Ops checks the story
against its definition-of-done, one gate at a time:

| Gate | What it checks |
|---|---|
| **B0** | Browser test — the agent actually opened the app and walked the flow |
| **B1** | Code + tests pass |
| **B2** | Plan checkboxes ticked |
| **B3** | Independent review done |
| **B4** | Branch merged to the story branch |
| **B5** | Linear issue set to Done |

*Source: the Story Ops gates table in the superpowers panel docs, retrieved
2026-09-08.*

The spirit of all six gates fits in one sentence of docs — quoted verbatim:

> "Gates that only self-approve aren't gates; the checks are adversarial by
> design."

*Source: story workflow docs, section 5. Gates, retrieved 2026-09-08.*

That is why step 1 said to keep the default mode: gates stop and ask you
instead of approving themselves after checkpoints. And if the story goes quiet
midway — the watchdog gets involved before you start worrying: "The
**watchdog** checks three layers (recent commits, terminal state, Linear
progress) before declaring a stall" — three layers before the word stall,
because a silent agent may just be running a long build.

## Step 5 — One destination branch, one PR

Parallel does not mean the history forks apart. Every tier boundary is a merge
point into a single destination branch, quoted verbatim:

> "Each tier boundary is a merge point into a single destination branch —
> `story/<epic>-<slug>` — which acts as the story's own mainline."

And once every SF has passed its gates, the agents' part ends in exactly one
outcome:

> "When every sub-feature's gates pass and the story verifies `COMPLETE`, the
> work lands as **one clean PR** — not a dozen interleaved branches."

*Source: both quotes from the story workflow docs — section 5. Tiers and one
destination branch and section 7. One PR per story, retrieved 2026-09-08.*

The last note is yours to sign, not the machine's: merging the PR into your
real branch is a human gate — agents take the story to a clean, verified
state, then stop. The irreversible decision belongs to a person.

## What to expect from the first run

The verifier closes every story with one verdict, quoted verbatim from the
docs:

> "The verifier reports one verdict per story: `COMPLETE`, `READY-TO-DONE`,
> `INCOMPLETE`, `VIOLATION`, or `NOT-LAUNCHED`."

*Source: superpowers panel docs, end of the Story Ops gates section, retrieved
2026-09-08.*

For a first run, READY-TO-DONE is the healthiest outcome to expect: every gate
of every SF has passed, and only the human decision remains. On timing, this
post deliberately promises no numbers — it depends on the story's breadth.
What the tier structure guarantees: you wait for the slowest tier, not the sum
of every independent SF. To watch this whole pipeline run for real on a living
feature, [story workflow: from idea to
release](/blog/story-workflow-idea-to-release/) retells it from the case-study
side.

The full road — plus the eight principles behind the mechanics — lives on the
[story workflow](/docs/story-workflow/) page; every control of the panel is on
the [superpowers panel](/docs/superpowers-panel/) page.

Open Wakii, type your idea in one line, press Start — and let the gates ask
you before anything counts as done.
