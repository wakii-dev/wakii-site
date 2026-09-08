---
title: "DeepCode: multi-agent research coding from HKUDS"
description: "DeepCode turns papers into runnable code with a seven-agent pipeline and a hard plan gate; this post reads repo health from GitHub API numbers instead of star counts."
pubDate: "2026-10-18"
category: "tech"
tags: ["agents", "oss"]
draft: false
---

A research repo approaching 16,500 stars usually carries a fixed suspicion:
high on stars, thin on activity — stars come from curiosity, commits stop when
funding does. DeepCode from the HKUDS group (University of Hong Kong) sits on
the opposite side of that suspicion, and that is exactly why it is worth
reading. This post does not tell a story about a popular repo: it reads three
layers of evidence — health numbers from the GitHub API, the multi-agent
pipeline architecture read in code, and the shipping discipline visible in the
README itself. Every number was pulled directly on research day 2026-09-08,
none from memory.

TL;DR:

- DeepCode: 16,499 stars, MIT license, pushed 2026-09-06 — a research-born repo
  with real activity (per GitHub API on 2026-09-08).
- Paper2Code: seven specialist agents under one central orchestrator, from
  paper/URL to verified runnable code.
- The pipeline has a hard gate: a missing plan file halts the whole pipeline,
  and an unreviewed plan does not reach the code-writing phase.
- The README carries a News section that reads like an engineering log per
  merge — a pattern worth bringing back to product repos.

## Health reads from numbers, not from stars

Reading the health of a research repo has to start from metadata, not from a
feeling about popularity. The probe on 2026-09-08 showed:

| Metric | Value (per GitHub API on 2026-09-08) |
| --- | --- |
| Stars | 16,499 |
| Forks | 2,151 |
| License | MIT |
| Last pushed | 2026-09-06 |
| Created | 2025-05-14 |
| Total releases | 16 (v1.0.0 through v2.2.0) |

The last two rows are the interesting part. The repo was created in May 2025
and was still pushed two days before my probe. The release cadence is
accelerating rather than fading: v1.3.0 on 2026-07-17, v2.0.0 on 2026-08-03,
v2.1.0 on 2026-08-12, v2.2.0 on 2026-09-06 — four releases in roughly seven
weeks (per GitHub API on 2026-09-08), after a gap stretching from February to
July. The HEAD commit is itself a release command: `949c688b` "release:
prepare DeepCode v2.2.0" on 2026-09-06.

So if you use the "high stars, low activity" filter to triage research repos,
DeepCode is the example that reminds you to read the numbers before ranking.
Nothing guarantees this cadence continues — but at probe time, the opening
suspicion was not confirmed.

## Seven agents turn a paper into code

Paper2Code is DeepCode's original research direction and remains a dedicated
workflow alongside the general-purpose coding agent. Reading
`workflows/agent_orchestration_engine.py` (2,407 lines at HEAD) reveals a
pipeline of explicitly numbered phases:

```
paper / URL / reference repository
  |
  v
[requirement analysis] -> [workspace] -> [document segmentation]
  |
  v
[code planning] -> [PLAN REVIEW GATE] -> [reference mining]
  |
  v
[repo acquisition] -> [code indexing] -> [implementation] -> [verification]
```

Above the pipeline sit seven specialist roles as the README describes them: a
central orchestrating agent picks the next phase, alongside six agents for
intent understanding, document parsing, code planning, reference mining, code
indexing, and code generation. Four ideas connect them: dynamic orchestration
(the orchestrator may revisit earlier phases when evidence changes, instead of
running a fixed prompt chain), document grounding into explicit implementation
requirements before code is written, memory plus CodeRAG (long documents and
reference repos are segmented, indexed, and retrieved as bounded context), and
iterative verification feeding real execution results back into planning.

The README compresses that last idea into one line: the goal is "not to
generate code that merely looks correct" (DeepCode README,
[hkuds.github.io/DeepCode](https://hkuds.github.io/DeepCode/)) — code must
run, be inspectable, and keep improving.

## The gate between plan and code

The detail I read most closely in the code sits at the planning phase. After
the planning agent finishes, the pipeline does not trust internal state; it
checks for evidence on disk
([workflows/agent_orchestration_engine.py](https://github.com/HKUDS/DeepCode/blob/949c688b13c86b1d0b27fe96cfb6cbee41ad961e/workflows/agent_orchestration_engine.py)):

```python
if not os.path.exists(dir_info["initial_plan_path"]):
    raise RuntimeError(
        "Code planning did not produce initial_plan.txt; aborting the"
        " pipeline before any subsequent phase"
    )
```

A missing plan file halts the pipeline right there — no later phase runs. Right
after that check comes a second gate for humans: `run_plan_review_gate` in
[workflows/plan_review_runtime.py](https://github.com/HKUDS/DeepCode/blob/949c688b13c86b1d0b27fe96cfb6cbee41ad961e/workflows/plan_review_runtime.py)
moves the pipeline to a `waiting_for_review` state and waits for a decision
among approve, skip, or revise with feedback; a revised plan passes a YAML
validity check before it is accepted.

The pair separates two risks that usually get mixed together: the machine gate
blocks "no artifact evidence", the human gate blocks "artifact exists but aims
the wrong way". Autonomous execution is allowed — but only after the plan has
passed both.

## A README that reads like an engineering log

DeepCode's shipping discipline is not in the release frequency; it is in how
each release is written up. The News section of the README carries one entry
per merge wave: it names the PR, describes the behavior change, and — rarely
seen — states the verification rule. The 2026-08-19 entry on session resumes
includes the sentence "A test makes the rule executable" (DeepCode README,
[github.com/HKUDS/DeepCode](https://github.com/HKUDS/DeepCode)): the invariant
"every request must be rebuildable from the session file" became a running
test instead of a doc promise.

The newest entry, shipped with v2.2.0 on 2026-09-06, is another example:
compaction leaves a note in memory, and "memory notes cannot escape their
boundary" (DeepCode README) — injected memory content is wrapped in an
`<untrusted-data>` tag with escaped closing tags, so a poisoned note cannot
forge instructions. Commit `3fab4561` updates the News section in both
languages at once.

On benchmarks: the README publishes PaperBench results self-reported in the
team's paper (arXiv 2512.07921) — 75.9% on the human-expert subset against a
72.4% baseline, and 84.8% on the commercial-agent subset. These are the team's
own numbers on one specific benchmark, not an independent product comparison;
read them at exactly that level, no higher.

Wakii walks the same road of gates and evidence — the workflow is visible
end to end on the [superpowers panel page](/docs/superpowers-panel/). Two
direct points of comparison on this blog: measuring convergence QA at the end
of a ship in
[convergence-qa-last-tier](/blog/convergence-qa-last-tier/) and a case study
of one real story in
[blog-story-case-study](/blog/blog-story-case-study/).

## What Wakii learns

- **ADOPT** — the README News log: one entry per merge naming the PR, the
  behavior change, and the verification rule ("a test turns the invariant into
  something runnable"). Wakii already has release notes, but the
  entry-per-merge pattern with PR refs and test rules belongs on the
  `wakii-dev/wakii` README — a docs surface, cheap to run, and it strengthens
  the build-in-public record.
- **DIRECTION** — the `<untrusted-data>` boundary for memory notes: memory an
  agent reads is a potential injection source; wrapping injected content in a
  boundary with escaped closing tags is a concrete measure worth putting on
  the roadmap for memory in Wakii's story workflow. Applying it requires
  two-way escape consistency between write time and read time.
- **WATCH** — dynamic orchestration that revisits earlier phases when evidence
  changes. Wakii's story pipeline is fixed by design (phase0 → spec → plan →
  execute → verify) with a rollback-fixer handling diverged runs; worth
  watching whether dynamic orchestration beats the fixed-plus-gates model on
  reliability before considering a change.
- **N/A** — Paper2Code as a product feature: Wakii is not a research
  reproduction tool and has no real paper-to-code use case to serve; the
  grounding and gate patterns transfer, the feature does not.

If you are building an agent workflow with gates and want to see a complete
one running for real, download Wakii and open the docs — the panel shows every
gate of a live story as it runs.
