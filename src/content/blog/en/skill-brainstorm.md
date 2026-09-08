---
title: "Skill /brainstorm: from raw idea to a verified spec"
description: "/brainstorm interrogates an idea with questions before it lets any code be written: one question at a time, a six-section spec committed to the repo, two or three approaches with trade-offs — inside the mechanism, with a real example."
pubDate: "2026-09-09"
category: "tech"
tags: ["skills", "workflow", "agents"]
draft: false
heroImage: "/blog/heroes/skill-brainstorm.png"
---

Most features fail not because the code is bad, but because two parties start building before they picture the same product. The Wakii kit has a skill that blocks exactly that moment: `/brainstorm` — it refuses to write code until the idea has survived a series of questions, been closed into a structured spec, and been approved by you. This post dissects the skill's inner mechanism: why it asks exactly one question at a time, what the spec records, when you should not use it, and a real example where the vaguest possible answer still produced something usable.

TL;DR:

- `/brainstorm` runs a fixed flow: brainstorm → spec → your approval → plan → independent subagent verification → optional publish to Linear with a worktree.
- Questions come one at a time, multiple choice preferred, focused on three axes: purpose, constraints, success criteria.
- The spec is a real product: six sections, stored in the repo, guarded by rule number one — "No code until spec approved".
- The skill documents its own off-switch: skip verification when the plan is tiny, or when you say "make it quick" — process serves people, not the other way around.
- Real example: a "write more blog posts" epic went through this process and came out as a hard-locked matrix of 44 slugs plus nine numbered decisions.

## Before the first question, there is reading

Type `/brainstorm` with an idea, and the first thing it does is not ask you anything — it reads the project. The full flow is drawn right in the skill's source:

```
/brainstorm "idea"
    ↓
[Phase 1] Brainstorming → spec file → user approve
    ↓
[Phase 2] Writing plan → plan file (Linear-ready format)
    ↓
[Rethink] Subagent verify → PASS / CONCERNS → fix nếu cần
    ↓
[Gate] "Publish lên Linear?"
  [Không] → Done
  [Có]   → hỏi worktree preference
         → tạo issue (description = plan + worktree info)
         → tạo worktree linked to issue (nếu chọn tạo mới)
```

*Nguồn: ~/.claude/skills/brainstorm/SKILL.md, section "Flow" — retrieved 2026-09-08.*

Step one of Phase 1 is exploring project context, and the source states this requirement strictly: read the actual files, related code, recent git log and current architecture — and "if unsure about behavior → read the code, don't guess." The skill even names its tool for the job: codegraph, to query symbols, walk call paths and measure impact before proposing an approach. The logic is simple: good questions only come from real context. An agent that asks "where do you want the new page" without opening the router is wasting your time — asking about something it could have read itself.

## One question at a time

With context in hand, Phase 1 step two starts asking. The mechanism fits in exactly three lines of source:

```
### 2. Ask clarifying questions
One per message. Multiple choice preferred. Focus: purpose,
constraints, success criteria.
```

*Nguồn: ~/.claude/skills/brainstorm/SKILL.md, Phase 1 step 2 — retrieved 2026-09-08.*

"One per message" is not performative patience — it is a quality constraint. Fire ten questions at once and questions seven through ten are already written before question one has an answer; meanwhile every real answer changes the context for the next one. Asking one at a time forces the conversation to follow the answers, not a pre-written script. Multiple choice lowers the cost of answering: you pick instead of composing, but you still have to commit to an option. The three focus axes — purpose, constraints, success criteria — are the stopping point: enough to lock scope without interrogating. Two rules bracket the whole exchange:

```
1. **No code until spec approved**
2. **One question per message**
3. **Respect "không"** — stop that branch immediately
```

*Nguồn: ~/.claude/skills/brainstorm/SKILL.md, section "Rules" — retrieved 2026-09-08.*

Line three is worth a close read: if you answer "no", that branch stops right there — the agent does not push back or re-ask the same thing dressed differently.

## The spec is the product: six sections living in the repo

The output of the questioning round is a file, not a chat message. The spec is written to `docs/superpowers/specs/`, dated and named by topic, with a fixed structure:

```
## Goal
<1-2 sentences>

## Context
<current state, why this feature>

## Scope
<what's included>

## Non-goals
<what's excluded>

## Design
<approach chosen>

## Acceptance Criteria
- [ ] ...
```

*Nguồn: ~/.claude/skills/brainstorm/SKILL.md, Phase 1 step 5 — retrieved 2026-09-08.*

These six sections are designed to answer the questions people usually forget to ask. Non-goals is the scope-creep shield: what you will not build sits right next to what you will. Acceptance Criteria is a line-by-line checklist — the same shape as the "Done When" section the plan uses in the next phase. Context preserves the reasoning: three months later, anyone opening the file can see why this direction won. Before it reaches you, the agent self-reviews ("fix placeholders, contradictions, ambiguity inline"), and Phase 1 only closes after your approval — verbatim: "Proceed only after approved." The spec is committed straight into the repo, so the product of a brainstorming session does not live in the scroll-back of a chat window; it is a document with git history.

Before moving to the plan, the spec round adds one more layer: propose two or three approaches with trade-offs and a recommendation — so you decide among compared options, not a single take-it-or-leave-it proposal.

## When not to use it

Process dies when applied where it is not needed. A one-line bugfix, a request whose spec is already settled, a trivial change — running brainstorm on these is ceremony for ceremony's sake: spending effort answering questions everyone already knows the answer to. The valuable part: the skill documents its own limits. After writing the plan it spawns an independent verification subagent, but the "when to SKIP rethink" section says it outright:

```
### Khi nào SKIP rethink:
- Plan ≤ 2 tasks (quá nhỏ, overhead > value)
- User nói "skip review" / "nhanh đi"
```

*Nguồn: ~/.claude/skills/brainstorm/SKILL.md, section "Rethink" — retrieved 2026-09-08.*

"Overhead > value" is the right calculation for the whole `/brainstorm` command, not just the rethink step. The signals that you should invoke it: two people read the same one-liner and picture two different products; scope is still fuzzy; or the upcoming decision is expensive enough that a detailed round of questions pays for itself. Otherwise, when the idea is settled and the remaining work is typing code, go straight there — nobody needs an interview for a decision already made.

## From "write more posts" to a matrix of 44 slugs

The blog batch 2 epic — the story this post is part of — went through exactly that process. On 2026-09-07 it opened with the vaguest possible idea: "write more posts for the blog." During the questioning round, the answer to "which direction" was "All of above" — all of them. An answer like that invites arbitrary interpretation; here it was forced through impact analysis into numbered decisions in the spec. By revision 3, the matrix of 44 slugs was locked hard — no more tilde — along with nine numbered decisions, DEC-1 through DEC-9. Three rows from the DECISIONS table:

```
| DEC-1 | Matrix | **44 slug CHỐT CỨNG** (bảng dưới) — không "~55" (P0: facets cộng tối đa 44) |
| DEC-2 | Category enum | **Giữ 3 giá trị** (tutorial/tech/build-log) — skills/features/arch phân vào `tech`, guides vào `tutorial`, logs vào `build-log`; chấp nhận tech chiếm đa số (honest cho dev tool) |
| DEC-6 | Cadence + future-date policy | **Giữ 2 bài/ngày**, pubDate 09-09 → 09-30 pre-assigned. … |
```

*Nguồn: docs/superpowers/specs/2026-09-08-blog-batch2-design.md, DECISIONS table (excerpt, DEC-6 truncated) — retrieved 2026-09-08.*

That is the point of this whole post: "All of above" is the vaguest answer in the language, but because the process demands a structured spec, it cannot slide through as a vague promise — it has to become 44 concrete rows, a fixed count, a per-day publishing schedule. A written decision can be re-checked: anyone wondering "why 44" today just opens DEC-1.

The post you are reading is slug number one in that matrix. The rest of the journey — one epic split into sub-features, running in parallel, landing as a single PR — belongs to `/story-workflow`, told in [story workflow: idea to release](/blog/story-workflow-idea-to-release/). To see the whole skills shelf before opening individual books, read [the Wakii skills catalog tour](/blog/skills-catalog-tour/).

The nine-agent team that runs after a brainstorm — who stands at which phase, how they cross-check each other — is documented on the [agents and kit](/docs/agents-and-kit/) page.

Wakii is an agentic IDE with the superpowers kit preinstalled, `/brainstorm` included. The idea in your head deserves a round of questions one at a time more than a hasty "go build it" — download it, type the command, answer.
