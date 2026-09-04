---
title: Story workflow
description: From a one-line idea to a merged PR — impact analysis, planning, parallel sub-features, gates, and the watchdog.
order: 2
---

Wakii's story workflow turns a one-line feature idea into merged, verified
code — with a team of agents doing the work and gates keeping them honest.

## The pipeline

```
idea → impact → plan → epic + SF bracket → parallel SFs → gates → 1 PR per story
```

### 1. Idea → impact analysis

You describe the feature. A **phase-0 impact analyst** maps the blast radius
first: touch map, second-order effects across multiple dimensions, and
alternatives — before any code exists.

### 2. Plan

The plan is broken into bite-sized tasks and published to **Linear** as
subtasks, so progress is visible to the whole team — not buried in a chat
log.

### 3. Epic + SF bracket

Large features become a **story**: an epic with sub-features (SFs) arranged
in dependency tiers. The bracket canvas in the [Superpowers panel](/docs/superpowers-panel/)
draws this graph live — epic at the top, tiers below, edges showing what
depends on what.

### 4. Parallel execution

Independent sub-features run **in parallel**, each in its own isolated
worktree and branch. A dev executor implements each task; reviewers check
the diff before it counts as done.

### 5. Gates

Every sub-feature passes the [Story Ops gates](/docs/superpowers-panel/#story-ops-gates)
(B0–B5): code + tests green, plan ticked, independent review, merged, issue
done — and a real browser walkthrough of the result. Gates that only
self-approve aren't gates; the checks are adversarial by design.

### 6. Watchdog

Stories stall — an agent hits a dead end, a review loops, a merge conflicts.
The **watchdog** detects stalled sub-features and auto-resumes them from the
last good state, so a long story doesn't need a babysitter.

### 7. One PR per story

When every sub-feature's gates pass and the story verifies `COMPLETE`, the
work lands as **one clean PR** — not a dozen interleaved branches.

## Where it lives

- Launch and monitor runs in the ⚡ Workflow tab.
- Track the bracket, gates, and watchdog in the 🌳 Story tab.
- The 9-agent team behind it is described in [Agents & kit](/docs/agents-and-kit/).
