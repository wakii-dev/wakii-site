---
title: "Nine agents, separated powers"
description: "A Wakii story run is staffed by nine agents — the analyst doesn't code, the writer doesn't approve its own work, the tester doesn't fix. This post dissects that separation of powers: the full role table, how information flows between roles, and a real case where a reviewer caught what the executor had signed off on."
pubDate: "2026-08-21"
category: "tech"
tags: ["agents", "supervised", "workflow"]
draft: false
---

Ask what "a team of AI agents working for you" looks like and the picture
is usually one very capable agent: takes the job, does it, checks itself,
reports done. Wakii builds it the other way around. A story run is not
carried by one strong agent doing everything — it is staffed by nine narrow
roles, each with its own power, and those powers are deliberately kept
apart. The analyst doesn't write code. The writer doesn't approve its own
work. The tester hunts for failures and never fixes them. Separation of
powers is not an organizational detail; it is how quality stops depending
on any single agent's carefulness. This post dissects the mechanism: the
full role table, how information flows between roles, and a real case where
a second pair of eyes caught what the first had signed off on.

TL;DR:

- Nine agents staff a story run: three analyze before code exists, two
  build, four check — nobody covers anybody else's job.
- Separation of powers blocks conflicts of interest: the reviewer is never
  the author of the work under review.
- The one-way information path executor → reviewer → verifier turns every
  arrow into a bug-interception point.
- Real case: the executor reported DONE, and an independent reviewer still
  caught a dead scoped-style rule and an escaping issue.

## Nine roles, nine powers

The agents & kit docs list all nine roles with a reading instruction: each
has a narrow job, and the checks-and-balances between them are the point.
The table below is copied verbatim from the docs:

| Agent | Job |
|---|---|
| **phase0-impact-analyst** | Maps blast radius before code exists — touch map, second-order effects, alternatives |
| **spec-critic** | Adversarial review of the spec: ambiguity, missing edge cases, unverifiable criteria |
| **plan-critic** | Adversarial review of the plan and its task dependency graph |
| **task-executor** | Implements tasks in isolated worktrees, commits atomically |
| **designer** | Produces high-fidelity design drafts for user review before UI gets built |
| **code-reviewer** | Reviews every diff for bugs, security issues, and scope creep |
| **verifier** | Independent pass/fail verdict on the finished work — self-reports don't count |
| **security-audit** | OWASP-focused audit when changes touch auth, input, or secrets |
| **rollback-fixer** | Reverts safely to the last known-good state when something diverges |

*Nguồn: `src/content/docs/en/agents-and-kit.md` §"The 9-agent story team", lấy 2026-09-07.*

Read the table as three groups. The first three never touch code:
phase0-impact-analyst maps the blast radius, spec-critic and plan-critic
run adversarial reviews of the spec and the plan — this group's power is
the power to ask, and nothing more. The middle two are the builders:
task-executor implements in isolated worktrees, designer produces drafts
for user review before UI gets built. The last four are the checkers:
code-reviewer reads diffs, verifier issues independent verdicts,
security-audit audits OWASP concerns, rollback-fixer reverts when something
diverges.

The checking group is the largest — four of nine — and that is not a
coincidence. The verifier's row says it directly: "self-reports don't
count". A system where the executor grades its own work is only as strong
as the executor's capacity for self-criticism; this one declines to place
that bet.

## Why the writer doesn't approve its own work

Principle 2 of the story workflow's eight principles states the problem
flatly: a developer reviewing its own code is a conflict of interest. The
bugs that survive a review pass are exactly the bugs the author cannot see
— because the author reads code with intent, not with cold eyes. The
author's "I already checked" has no blocking power; the blocking power
lives in the second pair of eyes. The docs tell one case of exactly this
shape:

> *Example: when an executor reported a task done, a separate code reviewer
> still caught a broken scoped-style rule and an escaping issue the
> executor had signed off on. Different eyes, different findings.*

*Nguồn: `src/content/docs/en/story-workflow.md` principle 2 "A team with separated powers", lấy 2026-09-07.*

The case is not an illustration. According to the audit trail of story
FI-300 — the downloads-and-mobile story of this very site — a sub-feature had been
reported DONE by its executor, and the independent reviewer still found a
dead scoped-style rule and an escaping issue in exactly that work. Both
bugs sat where authors stop looking: the style block it had just written,
the string it had just escaped. The reviewer was not smarter than the
executor; the reviewer was simply not the person who had just written the
code being read.

## Separation is not extra ceremony

The reasonable suspicion: nine roles for one story — isn't that eight extra
rounds of paperwork? The answer is in which way information moves. Reviewer
and verifier are not approval rounds for the executor to charm; they are
interception points on a one-way path:

```ascii
spec ──→ task-executor ──→ code-reviewer ──→ verifier ──→ merge
              │                  │                │
         commit + diff      reads diff       ACCEPTANCE
         (the author)   (not the author)   (reads criteria,
                                             not the summary)
```

*Nguồn: sơ đồ tự vẽ theo pipeline trong `src/content/docs/en/story-workflow.md` §"Parallel execution", lấy 2026-09-07.*

Read the diagram by information flow, not by roll call. The executor does
not narrate its work to the reviewer — the reviewer receives the diff and
reads the diff. The verifier does not read the executor's summary — the
verifier receives the ACCEPTANCE criteria and runs them against the real
product. Every arrow carries one kind of information: the result of the
work, never a claim about the result of the work. Claims are the most
slippery item in the whole chain; separation of powers means no pair of
eyes is ever required to trust one.

The added cost of separation is the time of one more read. What it blocks
is the layer of bugs an author naturally cannot see — already passed by the
person most confident about them. Against the price of one merged bug, the
math does not favor skipping review.

The full role table lives in the [agents & kit](/docs/agents-and-kit/)
docs. Which kit these nine agents come from, and how the kit installs
itself — the [zero-setup](/blog/zero-setup-agent-team/) post took that
apart; this one looks at how the team is organized so that nobody has to
trust anybody. To watch separation of powers run for real: open Wakii,
describe an idea in the ⚡ Workflow tab, and let the nine roles divide the
work.
