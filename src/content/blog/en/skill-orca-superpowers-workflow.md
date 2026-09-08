---
title: "Skill /orca-superpowers-workflow: the bridge between workflow and app"
description: "One command wraps the full six-phase pipeline from idea to Linear Done — and at each transition point, the skill fires a bridge into Linear, worktrees, the task DAG and gates. This post reads the skill source to unpack the mechanism."
pubDate: "2026-09-10"
category: "tech"
tags: ["skills", "story-workflow", "agents"]
draft: false
heroImage: "/blog/heroes/skill-orca-superpowers-workflow.png"
---

Wakii's skill kit ships as separate pieces: brainstorm writes the spec, writing-plans-linear writes the plan, the orchestration layer splits tasks and raises gates. Used separately, you are the one wiring them — remembering the phase order, when to create the issue, when to open the worktree. Miss one piece and the infrastructure sits idle while the code is already moving. The `/orca-superpowers-workflow` skill collapses that wiring into a single command. This post reads the skill's own SKILL.md file to show what it wraps, where it fires, and what stops it from spinning in circles.

TL;DR:

- One command replaces the manual chain of brainstorming + writing-plans + orchestration — all six phases, from impact analysis to Done.
- Four numbered bridges fire at five transition points: the Linear issue, the worktree, the task DAG, the gates, and the final Done sync.
- Loop caps have numeric thresholds: two same-cause verify failures stop the loop, a task gets at most three retries, a gate rejected three times stops being resubmitted.
- Principles come with an explicit precedence stack: the Prime Directive "do not guess" outranks the phase map itself.
- A real example: one SF sent back three times by an independent reviewer across three groups, and a merge race caught by a guard.

## One command in place of five skills

The problem is not missing pieces — it is hand-assembly. Five operations you have to remember to invoke — brainstorming, writing-plans-linear, and three orchestration moves: execute, gate, worker-start — become one pre-routed chain, six numbered phases from 0 to 5:

```ascii
idea (one line)
    ↓
[PHASE 0] impact analysis → HARD GATE (direction approved in chat)
    ↓
[PHASE 1 / BRIDGE 5] create Linear issue + set "In Progress"
    ↓
[PHASE 2] brainstorming → spec.md → [BRIDGE 1] worktree
    ↓
[PHASE 3] writing-plans-linear → plan → [BRIDGE 3] task DAG (5+ steps)
    ↓
[PHASE 4] execute tasks → [BRIDGE 2] gates at checkpoints
    ↓
[BRIDGE 5] Linear → "Done"
    ↓
post-task-ritual (learn back into the skill)
```

*Source: ~/.claude/skills/orca-superpowers-workflow/SKILL.md, §"The Workflow" — annotations translated, structure verbatim, retrieved 2026-09-08.*

That order is not a soft convention. The skill's Phase-Ordering Invariant states that every run executes 0→5 in order, and no phase is skippable except through the tier system — Quick-fix (one file, under 10 changed lines) skips phases 0-3 entirely, Standard abbreviates phase 0, Full runs everything. Use it when: new feature work in an Orca-managed project. Skip it when: a quick fix, or you explicitly say "skip the workflow". Within the kit — 20 skills, 13 public at the time of writing (2026-09-08) — this one belongs to the workflow group, alongside story-workflow, brainstorm and writing-plans-linear.

## Five bridge firings at five transition points

A bridge, in the skill's own vocabulary, is a call into Orca infrastructure inserted at the exact moment a phase turns. The description lists them verbatim: "Automatically invokes Bridge 5 (Linear sync), Bridge 1 (worktree), Bridge 3 (task DAG), and Bridge 2 (gates) at key transition points." Four numbered bridges, five firing points — Bridge 5 fires twice, at both ends of the lifecycle:

| Transition point | Bridge | Infrastructure work |
|---|---|---|
| Direction approved (Phase 1) | 5 | Create Linear issue, set "In Progress" |
| Spec locked (end of Phase 2) | 1 | `orca worktree create` |
| Plan done, if 5+ steps (Phase 3) | 3 | `run-create` + `task-create` with deps |
| Verification checkpoint (Phase 4) | 2 | `gate-create` — work stops, awaits a decision |
| All tasks done (Phase 5) | 5 | Set Linear "Done" |

*Source: ~/.claude/skills/orca-superpowers-workflow/SKILL.md — description + Phase 1-5 sections, retrieved 2026-09-08.*

The bridges are not built for their own sake: the DAG is only created when the plan has five or more steps — shorter plans use TodoWrite instead — and DAG dependency depth is capped at 4. And if the infrastructure breaks — the Orca CLI is unreachable — the skill keeps going without bridges and states plainly which bridge failed. Missing infrastructure gets announced, not swallowed.

## Gates and loop caps: stopping is a feature, not a failure

Gates as a tool-enforced contract have their own post — [gates, not trust and Rule 0](/blog/gates-not-trust-rule-zero/) dissects each gate. Here, look at the gate as one bridge, and at what happens when a loop refuses to stop: a set of caps, all with the same shape — hit the threshold, stop, summarize what was tried, ask the human.

| Loop | Threshold | From the source |
|---|---|---|
| Verify fails, same cause, same task | 2 times | "2 failures means the cause isn't what you're patching" |
| Retry of the same task | 3 times | 4th attempt → STOP + ask |
| A gate rejected | 3 times | Stop resubmitting, ask the user |
| Critique of the same spec/plan | 2 rework cycles | 3rd critique → STOP |

*Source: ~/.claude/skills/orca-superpowers-workflow/SKILL.md — §"Loop caps", Phase 4 escape hatch, Phase 2/3 rework caps, retrieved 2026-09-08.*

The caps bind in autonomous mode too — the common misreading is that autonomous removes gates. The source says the opposite: "Phase 4 gates exist in autonomous too — autonomous self-approves after self-adversarial review; it does not delete them." Self-approval with discipline: Principle 3 requires a five-step checklist before each nod — the strongest counter-argument, the missed edge case, the dismissed alternative, a check against the codebase, and only then a decision. Alongside it, an attempt ledger per task and one evidence rule: "A DONE without evidence is not a DONE".

## Principles that bind across phases

The skill carries seven numbered principles (2-8) with two invariants above them. What separates them from wall-poster advice is two things: an explicit precedence order, and a map binding each principle to each phase — which ones hold tight, which ones fire only on a token. The precedence stack, verbatim:

> Prime Directive > Phase-Ordering Invariant > Principles (2-8) > Workflow phase instructions > Examples/templates.

*Source: ~/.claude/skills/orca-superpowers-workflow/SKILL.md §"Precedence Stack", retrieved 2026-09-08.*

The Prime Directive sits on top: "Do not guess. If anything is unclear, you MUST stop and resolve it before continuing." Just below, Phase-Ordering — which autonomous mode cannot override either: it changes who approves the gates, not whether the phases run. Five principles worth remembering:

- **Surgical Scope** — code only what the feature needs; if neighboring code looks weak, note it, do not touch it.
- **Self-Doubt Proactive** — interrogate every claim: verified this session, or pattern-matched from memory?
- **Continuous Improvement Flag** — spot a gap in the skill itself mid-task, flag it into the improvements-log, do not self-edit.
- **Multi-Dimensional Analysis** — Phase 0 examines the decision across dimensions: functional, arch, data, security, UX; every skipped dimension needs a stated reason.
- **Linear Audit Log** — every phase, every task, one comment detailed enough for a later reader to replay the workflow.

## One SF through every bridge

The example comes from the previous story: FI-359, the story that wrote this site's 20 longform blog posts; its SF-3 was a seven-post series. Review did not pile up at the end: following the rolling review the skill writes into law — split tasks into groups of four to five related items, and the moment a group finishes, an independent code-reviewer reads its diff while the executor writes the next group — the series came back CHANGES-REQUESTED three times, across three different groups. Each time: fix, re-review, and only an APPROVED group got merged. Reviewer separated from executor, doing exactly its job.

Within the same SF, the destination branch moved mid-flight twice — once another SF's merge landed first, once a docs commit touched the ref between merge and update. The next merge was blocked: the ancestor check found the destination branch was no longer an ancestor of the working branch, and the update was refused rather than overwritten. Re-merge the destination, merge again, and the merge loop ran clean. That guard lives in the story process rather than in this skill — but the philosophy is the same: check the condition before writing.

And one example in flight: this post is a task of SF-2, story FI-373 — born in its own worktree, about to go through group review, then merged after the ancestor guard. The diagram at the top is not a concept sketch; you are reading a node in the middle of it.

```ascii
SF-3 (seven-post series) inside FI-359:
own worktree → write group 1 → review: CHANGES-REQUESTED
  → fix → re-review APPROVED → write group 2 → review: CHANGES-REQUESTED
  → fix → re-review APPROVED → write group 3 → review: CHANGES-REQUESTED
  → fix → re-review APPROVED
dest moved mid-flight → ancestor check blocks → re-merge → merge clean
```

*Source: Linear FI-359 logs (SF-3 sub-issue) + story audit trail — trace reconstructed qualitatively from the logs, retrieved 2026-09-08.*

The full process lives in the [story workflow docs](/docs/story-workflow/). Two pieces of the picture have posts of their own: [gates, not trust and Rule 0](/blog/gates-not-trust-rule-zero/) for the checking layer, and [nine agents, separated powers](/blog/nine-agents-separated-powers/) for the team running inside the bridges.

Wakii is an agentic IDE with a superpowers team built in. To watch the six-phase pipeline run: describe an idea, let the skill orchestrate — and stop exactly where it needs your decision.
