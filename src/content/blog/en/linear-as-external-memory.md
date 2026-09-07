---
title: "Linear as external memory for the agent team"
description: "A chat log is a timeline, not a state — once the context window runs out, the agent loses everything. This post walks through the mechanism that makes Linear the team's external memory: sub-issue bodies written in a standard field frame, state written to be reproduced, and an audit trail that marks instead of deletes."
pubDate: "2026-08-29"
category: "tutorial"
tags: ["linear", "story-workflow", "workflow"]
draft: false
---

An agent has no memory between sessions. When the context window runs out,
everything it knew about the story stays behind in the old session's log — the
next agent has to dig through it from the start, or worse, keep working without
knowing where the previous one stopped. The chat log, where all the exchanges
happened, cannot rescue the situation, because it is a timeline, not a state:
it reads sequentially, but it does not directly answer "where is the team right
now". Wakii's answer sits at the structural level: the agent team's state lives
in nobody's head — it lives outside, on Linear, where every task is an object
that exists independently of the session that created it. This post walks
through that mechanism: where the state lives, what frame it is written in, and
what that guarantees.

TL;DR:

- A chat log is a timeline: readable in order, but it does not directly answer
  "where are we" — the docs state it flatly: progress must be "not buried in a
  chat log".
- Linear is the team's external memory: every task is an object with a state,
  independent of any agent's context window.
- Sub-issue bodies follow a standard field frame — Tier, linear, What, Depends
  on, Tasks — identical across two different projects and repos.
- Written state must be reproducible: bodies contain concrete verify commands
  (commit, port count, test suite), not vague descriptions.
- The audit trail follows a mark-don't-delete rule: an abandoned plan stays in
  the repo, whole, with a SUPERSEDED label and a reason.

## A chat log is a timeline, not a state

Everything in a chat is ordered by time: later messages sit below earlier ones,
and the meaning of one line depends on the lines before it. To know "where we
are now", you have to read from where the conversation started — the later you
join, the more you read. State is the opposite: it answers what the current
situation is, directly, without the journey. That is the distinction the
workflow docs put in unusually plain words about where state should live —
quoted verbatim:

> "The plan is broken into bite-sized tasks and published to Linear as
> subtasks, so progress is visible to the whole team — not buried in a chat
> log."

*Source: src/content/docs/en/story-workflow.md, section "2. Plan", retrieved
2026-09-07.*

The phrase "not buried in a chat log" is not a dig at chat tools — it separates
two data structures, each built for a different question:

```ascii
chat log                          Linear sub-issue
timeline, read sequentially       object with state, queried directly
"where are we?" → dig from start  "where are we?" → open issue, read state
context exhausted → all lost      new session → state still outside
```

*Source: conceptual diagram built from the verbatim docs quote above, retrieved
2026-09-07.*

A log answers "what happened"; state answers "what is true now". A working
team's memory needs the second kind — because a new agent, a new human, or the
same agent after its context ran out all arrive at the second question first.

## External memory for the agent team

If state lives outside each agent's head, where exactly? In the story workflow,
the answer is the body of a sub-issue on Linear — and it is not a free-form
notes area. Bodies follow a fixed field frame. Here is the real body of one
sub-issue in the
[fi245-postgres-production](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/fi245-postgres-production.md)
bracket — a production project running in the public hub-store repo:

```text
## SF-1 Postgres infra + seed pipeline
Tier: 0
linear: FI-246
What: compose postgres (2 DB qua initdb, healthcheck, volume) + env wiring cho app services + keycloak block + wait-db.sh dùng chung…
Depends on: —
Tasks: compose-postgres / initdb-2-databases / healthcheck-wiring / app-services-env-wiring / keycloak-service-block / wait-db-script / seed-pipeline-script / reset-db-util / … (12 tasks)
```

*Source: github.com/wakii-dev/hub-store —
docs/superpowers/brackets/fi245-postgres-production.md, retrieved 2026-09-07.
The full Tasks line holds 12 tasks; the block above truncates at the …*

Each field answers one class of state question. `Tier: 0` — "when can this
start": waiting on nobody. `linear: FI-246` — links this body back to the real
issue on the tracker, so the state in the file and the state on the board are
not two separate truths. `What` — the destination of the sub-feature, including
details like "2 DB via initdb" that an agent needs before touching code.
`Depends on: —` — what it is waiting on; here, nothing. `Tasks` — twelve units
of work, each small enough to pick up and clear enough to check.

An agent assigned to this SF-1 has to guess nothing from context: it reads the
state directly from the body. More notable: this frame is not one project's
private convention. Bracket FI-339 — the story that built the foundation of the
very blog you are reading, in a different repo — uses the same Tier, linear,
What, Depends on, Tasks fields, adding one Design field. The tier map of the
two brackets is its own post:
[brackets and tiers: a map for long-running projects](/blog/long-tasks-bracket-tiers/)
— here we only care about the field frame. Two projects, two repos, two epics —
one state frame. Once the frame is standardized, external memory reads across:
whoever has read one bracket can read the next without relearning the language.

## State must be reproducible

The trap of "project memory" is that it decays into description: "the
infrastructure has been checked", "the tests ran". A week later, nobody can
reconstruct what "checked" meant — that is a trace, not state. In the workflow,
what gets written into a sub-issue must be concrete enough for someone else —
or another agent — to run again. One real body from the QA bracket
[fi280-qa-hub-store-regression](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/fi280-qa-hub-store-regression.md)
of hub-store, titled "SF-1 Baseline + Rubric (Tier 0)", contains this
boot-verification line, verbatim (the body is written in Vietnamese):

> "Boot-verify full stack main @ d107f2f 7/7 ports; chạy 25 e2e specs baseline
> đỏ/xanh"

*Source: github.com/wakii-dev/hub-store —
docs/superpowers/brackets/fi280-qa-hub-store-regression.md, retrieved
2026-09-07.*

One line, four checkable facts: the exact commit (d107f2f), the number of ports
that must come up (7/7), the test suite (25 e2e specs), and how to read the
outcome (red/green as the baseline). Hand this line to a new agent and it knows
what to boot, what to wait for, what to run — without asking anyone. That is
the boundary between memory and a description: memory lets you recreate the
state; a description only proves that someone once looked at it.

## Audit comments you can reproduce

External memory must also answer a harder question: what happens when part of
the plan gets abandoned? Deleting loses the trail — newcomers wonder "why is
this missing", or worse, rebuild exactly the direction already proven wrong.
The workflow runs the opposite rule: mark, don't delete. The
[ict-service-support-rebuild](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/ict-service-support-rebuild.md)
bracket in hub-store was replaced entirely — the file is still in the repo,
whole, and it opens with these lines (quoted verbatim from the
Vietnamese-language file):

> "SUPERSEDED 2026-08-31 — GỘP VÀO MỘT STORY: FI-233"
>
> "File này chỉ còn là audit trail (Linear FI-232 Canceled)"

*Source: github.com/wakii-dev/hub-store —
docs/superpowers/brackets/ict-service-support-rebuild.md, retrieved
2026-09-07.*

Two short lines recreate the whole situation: this bracket was once the plan of
epic FI-232, it was replaced by folding into FI-233, on 2026-08-31, and the
tracker state now reads Canceled. The principle is written out in the docs —
quoted verbatim:

> "Nothing is deleted (everything is revertable), unknowns are flagged instead
> of guessed at"

*Source: src/content/docs/en/story-workflow.md, section "8. Defensive by
design", retrieved 2026-09-07.*

The audit trail is therefore not a dead archive. It is the state of the past,
kept in a queryable format: whoever comes next — human or agent — opens the
file, reads two lines, knows exactly what happened, and continues from FI-233
instead of excavating commit history to guess.

Put the pieces together: the agent team runs like a state machine, and Linear
is where that machine keeps its state — tasks with statuses, bodies with a
frame, an audit trail with marks. The rest of the lifecycle mechanics — tiered
brackets, the B0–B5 gates, the watchdog waking stalled stories — lives on the
[story workflow](/docs/story-workflow/) page; how agents split the write space
on disk to run in parallel is its own post:
[real parallelism through worktree isolation](/blog/parallel-worktrees-isolation/).

If your team is using chat as shared memory, try flipping it: describe the idea
in one line in Wakii, and let state live where it belongs — issues with a field
frame, state written to be reproduced, an audit trail that marks instead of
deletes. When an agent's context runs out, you lose exactly one context window
— not the story.
