---
title: "Gates, not trust — and Rule 0"
description: "Every sub-feature passes five tool-enforced gates and the B0–B5 checks before it counts as done — and Rule 0 demands opening the browser and seeing the result. This post walks the mechanism: what each gate checks, which verdicts decide a story, and the real case where a flow check caught a stale preview server."
pubDate: "2026-08-22"
category: "tech"
tags: ["gates", "guardrails", "story-workflow"]
draft: false
---

In any agent's progress report, the most dangerous sentence is "it works
now". Not because the agent lies — because that is a claim, not evidence,
and a story that runs on claims collects every bug at the very end. The
[decision gates](/blog/decision-gates-safe-ai-agents/) post told the human
layer of the machinery fighting that — the forks where an agent stops and
waits for you to choose; this post is the machine layer: promises replaced
by gates, the gates the workflow itself raises to check a story before
anyone calls it done. Work has to pass gates — tools doing the checking,
not people doing the believing — before it counts as done. This post walks
each layer: the five gates that run on every sub-feature, the six B0–B5
checks that run on the whole story, the five verdicts that settle it, and
Rule 0 — the gate that demands opening a browser and seeing the result.

TL;DR:

- Five tool-enforced gates run on every sub-feature: preflight, diff
  review, tests, environment snapshot, post-merge.
- Six gates B0–B5 check a story against its definition-of-done — from a
  real browser test to Linear Done.
- The verifier settles every story with exactly one of five verdicts:
  COMPLETE, READY-TO-DONE, INCOMPLETE, VIOLATION, NOT-LAUNCHED.
- Rule 0: a real three-tier browser verification (DOM, screenshots, flow)
  — "the agent says it works" is not evidence.

## Gates are contracts, not trust

The story workflow docs name this principle without a word to spare: gates,
not trust. The opening of principle 3:

> Five tool-enforced gates run on every sub-feature — preflight, diff
> review, tests, environment snapshot, post-merge — plus **Rule 0**: a real
> three-tier browser verification (DOM structure, visual screenshots,
> click-through flow).

*Nguồn: `src/content/docs/en/story-workflow.md` principle 3 "Gates, not trust", lấy 2026-09-07.*

The five gates line up as a pipeline — each one blocks a different kind of
risk on the road from task to done:

```ascii
sub-feature starts
   │
   ├─[1] preflight ────────────── entry conditions
   ├─[2] diff review ──────────── another pair of eyes on every diff
   ├─[3] tests ────────────────── the suite has to be green
   ├─[4] environment snapshot ─── environment state recorded
   ├─[5] post-merge ───────────── checks after the merge
   │
   ▼
sub-feature counts as done
```

*Nguồn: sơ đồ tự vẽ theo `src/content/docs/en/story-workflow.md` principle 3, lấy 2026-09-07.*

The important part is not the number five; it is the two words
tool-enforced. A gate does not rely on somebody remembering to check. It
runs as a tool, against real artifacts — a real diff, real test logs, a
real snapshot. And when a gate cannot be satisfied, the docs script the
honest answer: "I could not verify this" — never a quiet pass. That
sentence sounds like a small detail, but it is a cultural rule: a declared
failure keeps the story salvageable; a covered failure kills it somewhere
nobody is looking.

## Six gates B0–B5 and five verdicts

The five gates above run while a sub-feature is running. The next layer
checks the whole story: the Story Ops gates — six gates B0–B5, each one a
line in the definition-of-done:

| Gate | Checks |
|---|---|
| **B0** | Browser test — the agent actually opened the app and walked the flow |
| **B1** | Code + tests pass |
| **B2** | Plan checkboxes ticked |
| **B3** | Independent review done |
| **B4** | Branch merged to the story branch |
| **B5** | Linear issue set to Done |

*Nguồn: `src/content/docs/en/superpowers-panel.md` §"Story Ops gates", lấy 2026-09-07.*

Once the six gates have run, the verifier issues a verdict — exactly one
of five: `COMPLETE`, `READY-TO-DONE`, `INCOMPLETE`, `VIOLATION`, or
`NOT-LAUNCHED`. Genuinely finished, clean and ready to close, not yet
complete, in violation, never launched — every verdict is a state that can
be re-checked; none of them is named "probably fine". COMPLETE is the
destination: the docs state that when every sub-feature's gates pass and
the story verifies COMPLETE, all the work lands as one clean PR. The other
four verdicts are the system's ways of saying no — and their existence
matters as much as COMPLETE's: a workflow with only two states, "done" and
"not done", would feel constant pressure to drag everything toward "done".
Five verdicts split not-done into degrees that can be talked about.

## Rule 0: see it, then say it's done

B0 is the hardest gate to fake, and Rule 0 is the principle behind it:
real browser verification, three tiers — DOM structure, visual
screenshots, click-through flow. Three tiers is not thoroughness theater;
each tier catches a miss the other two cannot see. A DOM sweep asserts the
structure is right; a screenshot shows what the user actually sees; a flow
click-through walks the exact path a user will walk. The docs tell one
case only the third tier could catch:

> *Example: a doc page passed its DOM sweep but the flow check found the
> preview server was serving stale content from another process. The catch
> came from looking, not from trusting the green checkmarks.*

*Nguồn: `src/content/docs/en/story-workflow.md` principle 3, lấy 2026-09-07.*

The case is worth reading slowly. The page genuinely passed its DOM sweep
— every structural assertion was green. The bug was not in the page; it
was in the world around the page: a preview server serving an old version
from another process. The first two tiers could not have caught it, because
they check exactly what they were assigned to check. The flow check walks
the full user pass — and trips over the stale content mid-path. The lesson
of Rule 0 is not "add one more test tier": evidence has to come from
watching the product run, not from reading reports about the product.

The full process — from an epic split into sub-features to gates and the
watchdog — lives in the [story workflow](/docs/story-workflow/) docs. The
team running inside these gates is the subject of
[nine agents, separated powers](/blog/nine-agents-separated-powers/). To
watch the gates run yourself: open Wakii, run a story, and read the
verdict in the 🌳 Story tab.
