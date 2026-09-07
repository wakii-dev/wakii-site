---
title: "Done means evidence, not a self-report"
description: "An agent saying done is convincing — until it breaks on first use. This post redefines done: self-reports don't count; an independent verifier reruns the acceptance criteria against a written rubric before any verdict lands."
pubDate: "2026-08-31"
category: "tech"
tags: ["qa", "evidence", "story-workflow"]
draft: false
---

An agent works fast and reports even faster: "task done, self-checked." The
report sounds very convincing — right up until the first time you trust it and
the result breaks the moment you touch it. Project history is full of tasks that
were reported "done" exactly this way, and they share one structural weakness:
the word "done" was set by the very role with an interest in it being true. The
Wakii story workflow handles this by redefining the word itself: done is not the
writer's feeling, it is the conclusion of a different role — one that reruns
everything from scratch, against measurable criteria, and produces its own
verdict. This post unpacks that definition through the docs, a real rubric, and
a real QA story.

TL;DR:

- Self-reports don't count: the executor's own checks are necessary, but
  reporting done yourself is not enough.
- The verifier is a separate role: it rebuilds the acceptance criteria, runs
  each line against the real product, and issues its own verdict.
- The rubric is written before QA runs: severities have measurable definitions —
  a verdict is a comparison, not a feeling.
- A real case: the QA tier of story FI-342 reran all of FI-339's criteria —
  7/7 PASS, 0 fix commits, story-verify exit 0.

## Self-report doesn't count

The executor's self-check is mandatory — nobody should ship code that never ran
— but it is not enough to set the word done. The reason is structural, not a
matter of goodwill: the executor checks using the very understanding that
produced the bug, so its blind spot is precisely the part that never gets
checked. The agents & kit docs dedicate an entire role to closing work, and
describe the verifier in exactly one line:

> "Independent pass/fail verdict on the finished work — self-reports don't count"

*Source: src/content/docs/en/agents-and-kit.md, "The 9-agent story team"
table, retrieved 2026-09-07.*

Both halves of that line are technical requirements, not slogans. "Independent"
means the role does not overlap with the implementing role — it does not reuse
the writer's test plan. "Self-reports don't count" means the executor's
reporting channel has no write access to the final state; it can only propose.
The docs' separated-powers principle states the reason plainly:

> "the **developer** implements but never approves its own work"

*Source: src/content/docs/en/story-workflow.md, section "A team with separated
powers", retrieved 2026-09-07.*

and the accompanying explanation: the bugs that survive a round of self-review
are exactly the ones the writer could not see. The checking sequence of a task
therefore stacks like this:

```ascii
executor  ──► "task done, self-checked"   ← necessary, not sufficient
reviewer  ──► reads the diff against its own checklist
verifier  ──► reruns the acceptance criteria from scratch
story     ──► Done only after an independent verdict + merge
```

*Source: concept diagram built from the role table in
src/content/docs/en/agents-and-kit.md, retrieved 2026-09-07.*

## The verifier starts from scratch

"Independent" in that role description has a concrete meaning: the verifier does
not read the executor's summary and nod. It rebuilds the criteria from the plan
and its ACCEPTANCE section — the criteria written down before any code existed —
then runs each line itself against the real product and records each result.
The role's starting point is something the executor cannot supply: the state of
the measurement, not the state of the feeling. The story-workflow docs put the
reason in one sentence:

> "The agent says it works" is not evidence; the gate demands evidence.

*Source: src/content/docs/en/story-workflow.md, "3. Gates, not trust",
retrieved 2026-09-07.*

The same docs, in the pipeline's gates section, add the half-sentence that gets
read the least:

> "Gates that only self-approve aren't gates; the checks are adversarial by design."

*Source: src/content/docs/en/story-workflow.md, "5. Gates", retrieved
2026-09-07.*

The word "adversarial" is the point: the checks are written to catch what was
missed, not to confirm what was done. The default assumption is that the person
who self-checked overlooked something — so the check is designed against the
person who did the work.

This gate is distinct from the other gate family in the workflow: the decision
gate stops and asks a human for a call — that mechanism has its own write-up
([decision gates: why Wakii's AI agents always stop to ask](/blog/decision-gates-safe-ai-agents/)).
The verifier's gate here asks nobody; it compares machine-readable evidence:
run results, numbers against the rubric, exit codes. The human still owns the
final call at merge — but what they receive is a verdict that can be re-checked,
not an assertion that has to be taken on faith.

## The rubric is written before the verdict

A comparison only means something if the criteria existed before the results.
When criteria are written after the fact, the net gets bent around whatever was
already caught — and "done" quietly becomes a feeling again. So in the real
workflow, the QA step starts with a rubric file, not with a test command. The QA
rubric of a real regression story on the hub-store repo opens with exactly these
two lines:

> # QA RUBRIC — hub-store regression story (FI-280)
>
> **GROUND TRUTH cho SF-2..7**

*Source: [docs/superpowers/qa-rubric.md](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/qa-rubric.md)
— github.com/wakii-dev/hub-store, retrieved 2026-09-07.*

"Ground truth" is the key phrase: criteria fixed first, every downstream SF's
results compared against them. The rubric is measurable down to severity levels
defined by concrete consequences, not by vibes:

> **P0** — chặn flow chính hoàn toàn (không login được, không tạo order, data mất)

And it carries a rule for the QA process itself: when findings exceed what the
process can absorb, the instruction is to stop — not to push harder:

> 1 SF tìm > 8 bug P2 → STOP fix, log hết lên epic + escalate coordinator trước khi fix tiếp

*Source: both quotes above from qa-rubric.md —
[github.com/wakii-dev/hub-store](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/qa-rubric.md),
retrieved 2026-09-07.*

(The two rule quotes stay in Vietnamese — they are verbatim lines from the
artifact itself: P0 means the main flow is fully blocked — cannot log in,
cannot create an order, data loss; and the escape hatch says that one SF finding
more than 8 P2 bugs stops fixing, logs everything to the epic, and escalates to
the coordinator before fixing continues.)

With a rubric like that, an SF's "done" is the output of a comparison: line by
line of criteria, result by result, severity by severity — anyone reading the
verdict can open the rubric and re-check every cell. A verdict must trace back
to its rubric row; a row with no data concludes "not verified," not "fine."

## What real done looks like

Definitions are easy to say; a real case shows the shape of it. Story FI-339 —
the story that laid the foundation for the blog you are reading — ends with a
dedicated QA tier (FI-342), where the role that wrote no code reruns all of the
story's criteria. The result:

```ascii
story FI-339 — QA convergence (FI-342)
  criteria compared  : 7/7 PASS
  fixes required     : 0 fix commits
  story-verify       : exit 0
```

*Source: Linear FI-342 verdict, quoted via the FI-359 evidence pack, retrieved
2026-09-07.*

Three lines of numbers say exactly what this post set out to redefine. "7/7"
means every criterion written at the start of the story was rerun and compared.
"0 fix commits" does not mean "there was nothing to check" — it is the output of
the comparison: the whole sheet ran, and no cell needed fixing. "exit 0" is a
number produced by a tool, not by a person — story-verify is a CLI that reads
the gates and returns an exit code, a "done" that other scripts can read too.
That is the only form of the word done this workflow accepts: real done looks
like a results sheet, not like a confident assertion.

The full chain of roles — executor, reviewer, verifier — and the B0–B5 gates
attached to each step are documented on the
[story workflow](/docs/story-workflow/) page; the complete role table of the
nine-agent team is in [agents and kit](/docs/agents-and-kit/).

If your team runs agents, try a small check: take the most recent task reported
"done" and ask whether any role outside the writer reran it against criteria
that were written down beforehand. If the answer is no, that "done" is standing
on a self-report. Wakii's workflow is one reference to compare against —
download Wakii, open the story workflow, and start demanding evidence instead
of reports.
