---
title: "The /writing-plans-linear skill: plans that live on Linear"
description: "Turn a spec into a plan written for someone with zero context: bite-sized tasks, a silent Write mode and a Publish mode that puts the plan on Linear for whoever comes next."
pubDate: "2026-09-09"
category: "tech"
tags: ["skills", "linear", "workflow"]
draft: false
---

Hand a feature to someone — a new engineer, an agent that has never seen the repo, or yourself six weeks from now — with a few spoken sentences, and the result almost always drifts from what you pictured. The receiver is not the problem: the decisive information sits in whatever you took for granted, and none of it got written down. The `/writing-plans-linear` skill in the Wakii kit targets exactly that spot — it turns a spec into a plan for a reader with no context, then puts that plan on Linear. This post goes inside the skill, with two real plan files from the Wakii repo as proof.

TL;DR:

- Plans are written for strangers: the zero-context assumption is the differentiator — nothing gets defaulted to "everyone knows this".
- Tasks sized for one sitting: exact Files, numbered 2-5 minute steps, test commands with expected output.
- Two modes: Write stays silent on disk; Publish goes to Linear after review approval — one self-contained subtask per milestone.
- A plan is the agent's external memory: when the context gets compacted, the plan on disk and on Linear stays intact.
- Real evidence: two plan files from the blog story, in `docs/superpowers/plans/` of a public repo.

## Whoever comes next is the default reader

Plans fail exactly where nothing was written down: conventions, file order, how tests run — the things the author assumed "everyone knows". The skill flips the axis: the person who arrives later is the default reader, assumed to know nothing. The opening of the skill, verbatim:

> "Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste. Document everything they need to know: which files to touch for each task, code, testing, docs they might need to check, how to test it. Give them the whole plan as bite-sized tasks."

*Source: ~/.claude/skills/writing-plans-linear/SKILL.md, Overview section, retrieved 2026-09-08.*

"Questionable taste" is not a courtesy jab: the reader's judgment belongs in the written plan too. The big consequence: one document runs for both humans and agents — an agent is a stranger in the strict sense, so a plan good enough for an agent is good enough for a person.

The pipeline from intent to work fits in three layers:

```ascii
spec — intent: what to build, why
  |  /writing-plans-linear
plan file — small tasks, real code, real test commands    (Write)
  |  review approved
Linear subtasks — one task per milestone, self-contained  (Publish)
  |
fresh engineer / agent: open task, follow the order, tick
```

*Source: diagram built from SKILL.md (Overview + Write vs Publish + Self-Contained Subtask Format), 2026-09-08.*

## Small enough to finish in one sitting

Work size splits into two layers with two different floors. The task layer has a lower bound — too small means merge it up:

> "Each task MUST represent at least 1 hour of work. Tasks smaller than this should be merged into a larger cohesive task."

*Source: SKILL.md, Minimum Task Size, 2026-09-08.*

The too-small signs next to the proper size:

| Too-small sign | Proper size |
|---|---|
| Fewer than 4 steps | 4-8 main steps |
| Less than 50 lines of code | 100-200 lines of code |
| One thin slice: only CSS, only HTML | Substantial vertical progress, independently testable (UI + behavior + tests) |

*Source: table built from SKILL.md, Task Scope Guidelines, 2026-09-08.*

The step layer goes the other way — split all the way down, one action per step:

```text
Each step is one action (2-5 minutes):
- "Write the failing test" - step
- "Run it to make sure it fails" - step
- "Implement the minimal code to make the test pass" - step
- "Run the tests and make sure they pass" - step
- "Commit" - step
```

*Source: SKILL.md, Bite-Sized Task Granularity, 2026-09-08.*

Steps are small so the state of the work is always known — the test is written, so it must fail; the code is in, so it must pass. Tasks are large enough that finishing one leaves something actually running. Three Remember lines pin it down: "Exact file paths always" · "Complete code in every step — if a step changes code, show the code" · "Exact commands with expected output".

## Two modes: Write in silence, Publish to Linear

The skill posts nothing to Linear up front: the first invocation only writes the file; the mode flips only after review approval or an explicit command:

| Trigger | Mode | Linear operations |
|---|---|---|
| First invocation | Write | None — file only |
| After reviewer approved | Publish | Create subtasks + post summary comment |

*Source: the Mode Switching table in SKILL.md, 2026-09-08.*

That sequence puts review in the right spot: drafts get torn apart freely while they are still a file; Linear only receives plans that have been through someone else's eyes — and Publish puts a constraint back on the subtask content:

> "each subtask MUST be self-contained — the developer should be able to complete it from Linear alone, without opening the plan file or any external resource."

What may not appear in a subtask body:

```text
- "See plan file for full code"
- "Reference: docs/specs/..."
- "See Task N for similar implementation"
```

*Source: SKILL.md, Self-Contained Subtask Format, 2026-09-08.*

"See Task N" is banned because the reader may take tasks out of order — a blind reference breaks the self-containment. When no issue can be detected, the skill degrades explicitly: "No Linear issue found. Plan will be saved to file only." — the file still lands, Linear is simply skipped.

*Source: SKILL.md, Linear Integration (issue auto-detect script), 2026-09-08.*

## The context compresses, the plan stays put

A long planning session: load the spec, read the code — the context window fills up, and the system compresses older content; whatever is not on disk fades into a summary. The skill writes its plan to a file as it is written, before anyone executes it. Two lines close that loop: "Write plan to local file (always — source of truth)" and "Keep local file as backup".

*Source: SKILL.md, Recommended Approach + Remember, 2026-09-08.*

Re-reading needs no old session: the plan file sits in the repo, the subtask sits on Linear — two copies, neither owned by anyone's context. An earlier post, [Linear as the agent team's external memory](/blog/linear-as-external-memory/), covers the team's state layer — which task is where right now; this layer is the plan document, which exists before any state does. The two layers meet at Publish: the plan becomes subtasks, at once a document and state.

## Opening a real plan file in this repo

The previous batch story (FI-359) ran on exactly those plan files: 20 posts × 2 locales = 40 files across 5 SFs, with the orchestration completing 5/5 tasks. Open the SF-1 plan — the editorial foundation for the 19 posts after it — and the root-cause section puts the risk straight on the page:

> "Không có lớp nền dùng chung thì mỗi SF tự chế: format frontmatter, cách đếm từ, cụm claim được phép, target link docs — drift mù"

And the Problem section nails the consequence:

> "19 bài viết còn lại của epic sẽ nhờ bộ máy soạn thảo dùng chung này — SF-1 sai thì 19 bài sau sai theo. Ai mở `pnpm build` phải thấy bài lệch chuẩn bị chặn bằng máy, không phải bằng mắt."

*Source: docs/superpowers/plans/2026-09-07-fi359-sf1-editorial-foundation-plan.md, retrieved 2026-09-08.*

*Source: docs/superpowers/plans/2026-09-07-fi359-sf1-editorial-foundation-plan.md, sections 0 + 1, 2026-09-08.*

Whoever picks up SF-2 without reading anything else still understands why SF-1 had to go first — zero-context made visible, not just declared. The SF-2 plan — written 2026-09-08, for this very story — carries the same structure: a header with Date, Linear issue, worktree and destination branch; a section 0 root cause; a 13-row table where each row is one post with its slug, publish date, its own angle and a real story example. Its team line shows a plan written for a whole team:

> "Team: task-executor ×13 (viết) + code-reviewer (rolling theo wave) + verifier + security-audit (claims/links/evidence) + rollback-fixer (khi cần)."

Section 0 of the same file pins the evidence bar: "Mỗi bài có đúng một evidence chuẩn: source skill thật trong kit (~/.claude/skills/<name>/SKILL.md) — paraphrase docs là FAIL."

*Source: docs/superpowers/plans/2026-09-08-fi373-sf-2-series-skills-plan.md, section 0 + table §2, 2026-09-08.*

The post you are reading is row 2 of that table — one agent read one row and wrote this, with nothing passed along verbally.

A plan is one piece of the mechanism: once the plan becomes subtasks, gates B0-B5 lock quality per slice of work, a watchdog wakes stalled stories, and a nine-agent team splits the roles. The full mechanism lives on the [story workflow](/docs/story-workflow/) page; the agent team has its own post: [Nine agents, separated powers](/blog/nine-agents-separated-powers/).

Wakii is an agentic IDE with a superpowers team built in — the kit installs itself on first run, no configuration. Try it on your smallest next thing: write one plan with this skill for your next task, then re-read it a week later.
