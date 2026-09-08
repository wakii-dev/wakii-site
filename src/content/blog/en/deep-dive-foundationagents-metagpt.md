---
title: "MetaGPT: a software company simulated by agents, run on SOPs"
description: "MetaGPT replaces free-form agent chat with encoded SOPs: every role hands off through structured artifacts — PRD, API design, tasks, tests — whose schema is real code. Inside the 70,263-star framework that has slowed down lies a lesson about artifact contracts for multi-agent processes."
pubDate: "2026-10-13"
category: "tech"
tags: ["agents", "workflow"]
draft: false
---

Multi-agent systems tend to collapse into one shape: a group chat, several AIs, questions bouncing back and forth, and nobody able to point at the final product. MetaGPT — a project with 70,263 stars and an MIT license (per GitHub API on 2026-09-08) — takes a different route: it simulates a software company staffed with product managers, architects, project managers, engineers and QA. What is worth learning is that conversation inside this company is nearly banned: each role communicates with the next only through structured artifacts that act as contracts between departments. This way of standardizing handoff keeps its value even now that the original project has slowed down.

TL;DR:

- MetaGPT's philosophy fits in one formula from the README: `Code = SOP(Team)` — the company process is materialized as SOPs, not stuffed into each agent's prompt.
- Every role produces exactly one kind of artifact: PRD, API design, task list, code, tests — handoff travels through documents, not free chat.
- The artifact schema is real code: ActionNode declares each PRD field with a name, an expected type, an instruction and an example.
- Roles receive work by subscription: the Engineer watches for task-typed messages without knowing who wrote them.
- Activity has clearly slowed: last release v0.8.2 in March 2025, last commit 2026-01-21 (per GitHub API on 2026-09-08).

## An SOP is a contract, not a slogan

The README describes MetaGPT as "The Multi-Agent Framework" and positions it with one sentence:

> "It provides the entire process of a software company along with carefully orchestrated SOPs" — MetaGPT README, [github.com/FoundationAgents/MetaGPT](https://github.com/FoundationAgents/MetaGPT)

Right below sits the philosophy as a formula: `Code = SOP(Team)` — good code is a byproduct of a standard process, and that process is applied to a team made of LLMs. The role-to-artifact map reads directly off the `metagpt/roles/` and `metagpt/actions/` directory structure:

| Role | Artifact produced | Corresponding actions |
| --- | --- | --- |
| ProductManager | PRD | WritePRD |
| Architect | API design + data structures | design_api |
| ProjectManager | task list | project_management |
| Engineer | code + self-review | write_code, write_code_review |
| QAEngineer | test suite | write_test |

*Source: structure of `metagpt/roles/` + `metagpt/actions/` @ commit `11cdf466`, per GitHub API on 2026-09-08.*

The difference lives at the boundary. When handoff must travel through a document, "done" gets a checkable definition: the PRD has to contain its fields, the design has to state data structures and call flow. Collaboration quality depends less on which role talks more or phrases things politely — what is protected is the shape of the artifact, not conversational style.

## The artifact schema is code, not a prompt nudge

The familiar weak point of LLM-run processes is "write it structured": the prompt suggests, the output drifts. MetaGPT pushes the schema down into code. Every PRD field is an ActionNode declaring a key, an expected type, an instruction and an example — excerpted from `metagpt/actions/write_prd_an.py` @ commit `11cdf466`:

```python
PRODUCT_GOALS = ActionNode(
    key="Product Goals",
    expected_type=List[str],
    instruction="Provide up to three clear, orthogonal product goals.",
    example=[
        "Create an engaging user experience",
        "Improve accessibility, be responsive",
        "More beautiful UI",
    ],
)
```

*Source: `metagpt/actions/write_prd_an.py` @ commit `11cdf466d042aece04fc6cfd13b28e1a70341b1f`, per GitHub API on 2026-09-08 — [github.com/FoundationAgents/MetaGPT/blob/11cdf466d042aece04fc6cfd13b28e1a70341b1f/metagpt/actions/write_prd_an.py](https://github.com/FoundationAgents/MetaGPT/blob/11cdf466d042aece04fc6cfd13b28e1a70341b1f/metagpt/actions/write_prd_an.py)*

The PM's output is forced into this frame of nodes instead of drifting as prose. The architect role works the same way: `design_api_an.py` defines the "Data Structures and Interfaces" and "Program call flow" nodes — the design document cannot skip the two contract sections the engineer will consume. When handoff is a schema, the downstream role reads a normalized structure instead of guessing intent; this is where MetaGPT parts ways with frameworks that let a free-form prompt decide the output shape.

## Handoff is a subscription, not a phone call

The mechanism connecting roles also drops direct conversation. From `metagpt/roles/product_manager.py` @ commit `11cdf466`:

```python
self.set_actions([PrepareDocuments(send_to=any_to_str(self)), WritePRD])
self._watch([UserRequirement, PrepareDocuments])
self.rc.react_mode = RoleReactMode.BY_ORDER
```

*Source: `metagpt/roles/product_manager.py` @ commit `11cdf466d042aece04fc6cfd13b28e1a70341b1f`, per GitHub API on 2026-09-08 — [github.com/FoundationAgents/MetaGPT/blob/11cdf466d042aece04fc6cfd13b28e1a70341b1f/metagpt/roles/product_manager.py](https://github.com/FoundationAgents/MetaGPT/blob/11cdf466d042aece04fc6cfd13b28e1a70341b1f/metagpt/roles/product_manager.py)*

Each role registers the message types it cares about through `_watch` and emits its artifact through the actions it has set. Assembled with one requirement as input, the chain runs like this:

```
requirement (one line)
   │
   ▼
ProductManager ──► PRD (ActionNode schema)
   │
   ▼
Architect ──► API design + data structures
   │
   ▼
ProjectManager ──► task list
   │
   ▼
Engineer ──► code + self-review
   │
   ▼
QAEngineer ──► tests
```

*Source: diagram synthesized from the `metagpt/actions/` structure @ commit `11cdf466`, per GitHub API on 2026-09-08.*

The Engineer does not need to know the PM's name: it only consumes task-typed messages. Some multi-agent frameworks pick group chat so roles can "discuss"; MetaGPT picks quiet work along the SOP — the ordering lives in the artifact, not in the model's negotiation skills.

## A project slowing down — and what that says

Current numbers, per GitHub API on 2026-09-08:

| Metric | Value |
| --- | --- |
| Stars | 70,263 |
| License | MIT |
| Latest release | v0.8.2 — 2025-03-09 |
| Latest commit | 2026-01-21 |
| Organization | moved from geekan/MetaGPT to FoundationAgents/MetaGPT |

*Source: `gh api repos/FoundationAgents/MetaGPT` + `releases` + `commits`, per GitHub API on 2026-09-08.*

The release cadence shows the busy era is behind it:

| Tag | Release date |
| --- | --- |
| v0.8.2 | 2025-03-09 |
| v0.8.1 | 2024-04-22 |
| v0.8.0 | 2024-03-29 |
| v0.7.0 | 2024-02-09 |

*Source: `gh api "repos/FoundationAgents/MetaGPT/releases?per_page=10"`, per GitHub API on 2026-09-08.*

From v0.8.2 to the research date, no release has shipped — about 18 months. The latest commit merges PR #1897 (Windows Terminal adaptation) on 2026-01-21, nearly 8 months before the research date; earlier commits thin out through 2025. The repo has moved organizations: the old link still lives via GitHub's redirect, but the install section of the README still carries a line pointing at `git+https://github.com/geekan/MetaGPT.git` — a sign of loose maintenance. The news section of the README shows the team's energy moved to the MGX (MetaGPT X) product, launched 2025-02-19 and hitting #1 Product of the Week on ProductHunt in early March 2025 (source: the repo's README). The honest read: this is a landmark of the SOP wave, but current activity is low — the star count says more about the past than the future.

Wakii uses the same structure at a different layer. The process of idea → impact → plan → epic + SF → gates is also a chain of artifact contracts: the spec gets dissected by spec-critic before planning, the plan is checked by plan-critic before tasks are cut, and the task-executor only consumes an approved plan. The full description lives in the [story-workflow docs](/docs/story-workflow/).

## What Wakii learns

- **ADOPT — role-to-role handoff through structured artifacts.** Wakii already applies the same principle: spec, plan and task are contracts between 9 agents with separated powers — the next agent only consumes the previous agent's artifact, with no free chat; the separation of powers is dissected in [Nine agents, separated powers](/blog/nine-agents-separated-powers/). MetaGPT confirms this direction at simulated-company scale.
- **DIRECTION — type the fields of each artifact.** ActionNode declares a type, instruction and example for every PRD field. Wakii already has lint checking structure (required headings, pubDate matching the matrix) but the spec/plan templates are mostly prose; adding machine-parseable fields for key sections so critics receive more uniform input is worth considering — the story's tier map, see [Brackets and tiers](/blog/long-tasks-bracket-tiers/), is a good place to try.
- **WATCH — the open-source framework has slowed.** Last release March 2025, last commit January 2026 (per GitHub API on 2026-09-08): if you need a multi-role orchestration framework as a reference point, do not default to trusting the star count. Condition to upgrade to DIRECTION: a new release or a steady recovery in commit activity.
- **N/A — simulating a whole "software company" from a one-line requirement.** Wakii's product surface is orchestrating agents with human-held gates and evidence, not generating an entire repository from a requirement.

Want to try a multi-agent process with clear gates and evidence? The [getting-started docs](/docs/getting-started/) walk you through your first story.
