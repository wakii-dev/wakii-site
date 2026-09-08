---
title: "crewAI: role-based agent teams — role/goal/backstory as data"
description: "crewAI splits each agent's role into three declarative fields and ships two runtimes: Crew for autonomy, Flow for sequential control. Reading the real code to see why roles-as-data lowers the cost of understanding."
pubDate: "2026-10-14"
category: "tech"
tags: ["agents", "workflow"]
draft: false
---

Multi-agent frameworks tend to fail in one of two ways: agents become piles of free-form prompts nobody can review, or the pipeline gets so rigid it cannot express a mid-run judgment call. crewAI — 58,233 stars, MIT license, per the GitHub API on 2026-09-08 — takes a different path: an agent's role is declarative data, and orchestration splits across two runtimes. Crew for the parts that should run autonomously, Flow for the parts that need strict ordering. This post reads the actual code under `lib/crewai/src/crewai` (main at commit `34199c2`, on 2026-09-08) to see how they cut the problem — and why that cut lowers the cost of understanding the whole framework.

TL;DR:

- Agents in crewAI are declared through three fields: role, goal, backstory — typed data that serializes and diffs.
- Crew is the "who does what" runtime: declare tasks and agents, the framework routes; hierarchical mode forces you to declare a manager LLM explicitly.
- Flow is the "in what order" runtime: `@start`/`@listen` build an event graph, conditions compose via `or_`/`and_`.
- Guardrails attach to each Agent with a bounded retry count — validation right at the agent boundary.
- Declarative roles pay the comprehension cost upfront: reviewable like HR job specs, no run required to know who does what.

## Role, goal, backstory: three data fields, not a wall of prompt

crewAI's starting point is not a giant prompt but a Pydantic class. `BaseAgent` — the class every agent extends — declares exactly three fields that read like an HR profile:

```python
role: str = Field(description="Role of the agent")
goal: str = Field(description="Objective of the agent")
backstory: str = Field(description="Backstory of the agent")
```

From `lib/crewai/src/crewai/agents/agent_builder/base_agent.py` at [commit 34199c2](https://github.com/crewAIInc/crewAI/blob/34199c21b724d805608b59745cdb94006c8fdcd2/lib/crewai/src/crewai/agents/agent_builder/base_agent.py).

Because the agent is a `BaseModel`, these strings are not just prompt stuffing: they are validated on construction, serializable to JSON, and show up in a Git diff as plain text lines — a PR that changes an agent's role is readable without understanding the orchestration code. More interesting: crewAI keeps the original values of all three fields and interpolates run inputs into them before each execution:

```python
self._original_role = self.role
...
self.role = interpolate_only(
    input_string=self._original_role, inputs=inputs
)
```

From the same `base_agent.py` (the input interpolation method, elided).

That means a role card can carry context variables — topic, repo name, recipient — without hand-building strings. Role-as-data serves two readers at once: the LLM reads it to play the part, a human reads it to answer "who does this company hire, and what are they assigned".

## Crew: declare who does what, the runtime routes

Crew is the first mode, for work that repeats as a process. You declare the task list, the agent list, and one process:

```python
class Crew(FlowTrackable, BaseModel):
    ...
    tasks: list[Task] = Field(default_factory=list)
    ...
    process: Process = Field(default=Process.sequential)
```

From `lib/crewai/src/crewai/crew.py` at [commit 34199c2](https://github.com/crewAIInc/crewAI/blob/34199c21b724d805608b59745cdb94006c8fdcd2/lib/crewai/src/crewai/crew.py).

The process is an enum with exactly two values:

```python
class Process(str, Enum):
    sequential = "sequential"
    hierarchical = "hierarchical"
    # TODO: consensual = 'consensual'
```

From `lib/crewai/src/crewai/process.py` at [commit 34199c2](https://github.com/crewAIInc/crewAI/blob/34199c21b724d805608b59745cdb94006c8fdcd2/lib/crewai/src/crewai/process.py).

`sequential` runs tasks in declaration order. `hierarchical` hands task assignment to a manager LLM — and the framework makes you declare that explicitly: Crew's validator refuses construction with the message "Attribute `manager_llm` or `manager_agent` is required when using hierarchical process" (from `crew.py`, same commit). That error line is documentation: who decides the split sits right in the error message. The leftover `consensual` TODO shows a third mode was considered — crewAI's process space is a design surface, not an unconscious default. Maintenance cadence is strong too: 10 releases between Aug 5 and Sep 4, 2026 (1.15.11 through 1.15.20, two on the same day, per the GitHub API on 2026-09-08).

## Flow: an event graph when the problem needs order and conditions

Some steps should not be left to autonomy: calling a payment API, writing a ledger, assembling a report from a template. crewAI ships a second runtime for this class of work. The README compresses it into one line: "autonomous agent collaboration through Crews and precise, event-driven control through Flows" ([README.md, commit 34199c2](https://github.com/crewAIInc/crewAI/blob/34199c21b724d805608b59745cdb94006c8fdcd2/README.md)).

In code, Flow is the public face of a control DSL:

```python
from crewai.flow.dsl import and_, listen, or_, router, start

class Flow(_ConversationalMixin, RuntimeFlow[T]):
    """Public Flow class with conversational extension behavior."""
```

From `lib/crewai/src/crewai/flow/flow.py` at [commit 34199c2](https://github.com/crewAIInc/crewAI/blob/34199c21b724d805608b59745cdb94006c8fdcd2/lib/crewai/src/crewai/flow/flow.py).

The declaring syntax: `@start` marks the entry point — "Marks a method as a flow's starting point" (docstring, from `flow/dsl/_start.py`, same commit); `@listen` builds reactions — "Creates a listener that executes when specified conditions are met" (from `flow/dsl/_listen.py`, same commit). Complex conditions compose via `or_`/`and_`, branching via `@router`:

```
@start ──▶ fetch_data ──▶ @listen(fetch_data) ──▶ analyze
                              │
                              ▼
                          @router ──▶ branch A / branch B
```

The most instructive detail sits in the definition file: it introduces itself as "Flow Definition: the serializable, declarative Flow contract" ([flow_definition.py, commit 34199c2](https://github.com/crewAIInc/crewAI/blob/34199c21b724d805608b59745cdb94006c8fdcd2/lib/crewai/src/crewai/flow/flow_definition.py)). A serializable control graph — drawable, diffable, checkable before it runs.

## Guardrails attach to each Agent, retries capped

crewAI's quality barrier does not sit at the pipeline boundary but at the boundary of each agent:

```python
guardrail: Annotated[
    GuardrailType | None, ...
] = Field(
    default=None,
    description="Function or string description of a guardrail to validate agent output",
)
guardrail_max_retries: int = Field(
    default=3, description="Maximum number of retries when guardrail fails"
)
```

From `lib/crewai/src/crewai/agent/core.py` at [commit 34199c2](https://github.com/crewAIInc/crewAI/blob/34199c21b724d805608b59745cdb94006c8fdcd2/lib/crewai/src/crewai/agent/core.py).

Each agent carries its own output check — a Python function or a string description — applied before handoff, and the retry count is capped (default 3) so repeated failure cannot spin forever. Guarding at the agent boundary means quality ownership sits close to where the result is produced.

## Why roles-as-data lowers the cost of understanding

The biggest cost of a multi-agent framework is not runtime — it is comprehension time: a new team member must answer "who does what, in what order, who blocks mistakes" before writing their first line of code. Declarative roles pay all three upfront — each question has one explicit declaration site:

| Question | Where Crew answers it | Where Flow answers it |
|---|---|---|
| Who does what | agents list + role/goal/backstory | each method + typed state |
| In what order | process: sequential / hierarchical | event graph `@start`/`@listen` |
| Who blocks mistakes | per-agent guardrail | `@router` + `or_`/`and_` conditions |

One small detail says a lot about the mental model: the README features a sample named "Write Job Descriptions" — you write a job spec, not an acting script. Choosing Crew or Flow is itself a readable signal: the mode tells you which parts of the system may act autonomously and which are hard-wired. crewAI did not invent role-based programming, but they proved the model thrives at large community scale — and it is the shape Wakii chose too: Wakii's 9-agent team is described in a single role table, and the post [nine agents, separated powers](/blog/nine-agents-separated-powers/) analyzed why narrow roles create checks-and-balances instead of concentrated power.

How Wakii builds a role-based agent team — each role narrow, cross-checked through gates — fits on one page: [agents-and-kit](/docs/agents-and-kit/).

## What Wakii learns

- **ADOPT** — the declarative role-based team: Wakii already applies this at exactly this surface — 9 agents (phase0-impact-analyst, spec-critic, plan-critic, task-executor, designer, code-reviewer, verifier, security-audit, rollback-fixer) described in an "Agent | Job" table in the agents-and-kit docs, one narrow job each. crewAI confirms the direction at a 58,233-star community scale. Concrete next step: interpolate per-run inputs into role cards the way `interpolate_only` handles role/goal/backstory — agent definitions accept context variables (repo, story, gate list) at dispatch instead of staying static.
- **DIRECTION** — per-agent guardrail with capped retries: Wakii's B0–B5 gates sit at story-stage boundaries; crewAI adds a fence at each agent boundary — validate output before handoff, at most 3 retries. First candidate: task-executor running lint/tests before opening review. Not applied yet because story-level gates already catch enough; another layer needs a latency trade-off.
- **WATCH** — hierarchical manager LLM assigning work dynamically: Wakii assigns work through the static DAG in the plan; crewAI's manager_llm assigns dynamically from task descriptions. Watching until a need shows up for re-assigning mid-story without editing the plan — at that point dynamic dispatch becomes a DIRECTION candidate.

Want to try this 9-agent team on your own repo? Download Wakii and run your first story — the pipeline from impact analysis to review ships inside the kit.
