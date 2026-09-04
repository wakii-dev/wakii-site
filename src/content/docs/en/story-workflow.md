---
title: Story workflow
description: From a one-line idea to a merged PR — impact analysis, planning, parallel sub-features, gates, the watchdog, and the philosophy underneath it all.
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

## Philosophy

The pipeline above is mechanics. The eight principles below are the
reasons it is built this way — they are what the story workflow is
actually about.

### 1. Analyze once, inherit many

Deep analysis is expensive, so it runs exactly once — at the epic level.
Every sub-feature inherits the results through a **context pack**: the
design decisions, the inventory facts, the boundaries. Sub-features run
plan → execute → verify; they never re-analyze and never re-ask questions
that were already answered. *Example: this documentation story inherited
its entire visual design from the landing story — no designer round-trip,
no re-litigating fonts or tokens. The docs pages just read the binding
design document and built against it.*

### 2. A team with separated powers

Three roles, deliberately kept apart: the **PM** coordinates and writes
specs but never codes; the **developer** implements but never approves its
own work; the **tester** hunts for failures but never fixes them. A
developer that reviews its own code has an conflict of interest — the bugs
that survive are exactly the ones it couldn't see. *Example: when an
executor reported a task done, a separate code reviewer still caught a
broken scoped-style rule and an escaping issue the executor had signed off
on. Different eyes, different findings.*

### 3. Gates, not trust

Five tool-enforced gates run on every sub-feature — preflight, diff
review, tests, environment snapshot, post-merge — plus **Rule 0**: a real
three-tier browser verification (DOM structure, visual screenshots,
click-through flow). "The agent says it works" is not evidence; the gate
demands evidence. If a gate can't be satisfied, the honest answer is "I
could not verify this" — never a quiet pass. *Example: a doc page passed
its DOM sweep but the flow check found the preview server was serving
stale content from another process. The catch came from looking, not from
trusting the green checkmarks.*

### 4. Humans own the irreversibles

Architecture decisions and the merge to your real branch are **human
gates**. Agents take the destination branch to a clean, verified state —
one PR per story — and then stop. Nothing irreversible happens without a
person saying yes. *Example: after all sub-feature gates pass, the story
branch sits ready; the merge into your mainline and the PR description are
yours to approve, not the machine's.*

### 5. Tiers and one destination branch

Dependency depth is made explicit as **tiers**: a sub-feature only starts
when everything in the previous tier is merged. Each tier boundary is a
merge point into a single destination branch — `story/<epic>-<slug>` —
which acts as the story's own mainline. Parallelism never means divergent
histories; integration happens continuously at known points. *Example: a
website story runs landing, docs, and QA sub-features — docs builds on the
landing's design tokens, so it lives one tier down and merges after, not
beside.*

### 6. Watchdog: idle is not dead

A silent agent is not necessarily a stuck one — it might be running a long
build. The **watchdog** checks three layers (recent commits, terminal
state, Linear progress) before declaring a stall, and recovery means
*waking it with input*, not restarting it and losing work. From there it
runs an unlimited self-check loop until the story verifies complete. *In
practice: a sub-feature that went quiet during a long native build was
left alone; one genuinely wedged on a failing gate was resumed from its
last good commit instead of from scratch.*

### 7. Memory and the learning loop

Every task ends with a deliberate **post-task ritual**: what went wrong,
what fixed it, which pattern to keep. Lessons land in story memory with
their provenance — which task, which fix — so the next sub-feature starts
smarter instead of rediscovering the same trap. *Example: the first story
learned that a CLI flag had been renamed mid-release; that note saved
every later story from re-tripping on it.*

### 8. Defensive by design

The workflow assumes **it will be the one making the mistake** — so it
makes mistakes cheap and visible. Nothing is deleted (everything is
revertable), unknowns are flagged instead of guessed at, and any new
command is dry-tested before it is trusted ("the document says it works"
≠ "it works"). *Example: when a merge conflict appeared in a shared notes
file, the resolution kept both sides rather than dropping one — the cost
of being wrong about which line mattered was higher than keeping both.*

### Case study: this very story

The documentation you are reading was built by its own subject. Story
FI-289 (the Wakii website) exercised every principle above:

- **Controlled rework** — the visual design changed mid-story (direction
  v1 → the Bento Premium v2). Instead of patching on top, the sub-feature
  reverted to the last good state and re-executed against the new binding
  design — the rework was reviewable as one clean unit.
- **Watchdog in action** — when a sub-feature stalled, the watchdog
  detected it via the three-layer check and redistributed the remaining
  work without human intervention.
- **Reviewers catching what executors miss** — independent review found
  real P0 issues (dead styles, an escaping gap) *before* merge, exactly
  the failure mode pillar 2 exists for.
- **Gates over green checkmarks** — the getting-started page was not
  written from imagination: each step was executed in a clean clone of
  the repository — install, build, launch, open the panel — and the docs
  describe what actually happened, including one environment-limited
  build step that was reported honestly rather than glossed over.

## Where it lives

- Launch and monitor runs in the ⚡ Workflow tab.
- Track the bracket, gates, and watchdog in the 🌳 Story tab.
- The 9-agent team behind it is described in [Agents & kit](/docs/agents-and-kit/).
