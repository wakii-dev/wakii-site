---
title: "OpenAI Agents SDK: minimal primitives, tracing as a feature"
description: "Reading the OpenAI Agents SDK code: one Agent dataclass, handoffs as schema-carrying tools, guardrails running in parallel, and tracing shipped as its own product feature — compared with how Wakii places machine gates before human ones."
pubDate: "2026-10-16"
category: "tech"
tags: ["agents", "workflow"]
draft: false
---

Multi-agent frameworks tend to solve orchestration by stacking layers: declarative roles, actor runtimes, or documented standard operating procedures. The OpenAI Agents SDK — 29,267 stars, MIT license, per the GitHub API on 2026-09-08 — grows the other way: it keeps the surface as small as it can. An agent is one dataclass; a handoff is a tool; a guardrail is a function that runs in parallel; tracing is built out as a product feature of its own. This post reads the real code under `src/agents` (main at commit `544b8b0`, as of 2026-09-08) to see how the four primitives fit together — and what Wakii borrows about placing machine gates before human ones.

TL;DR:

- An agent is a single dataclass: instructions, handoffs, guardrails, output_type — the conceptual surface stops there.
- A handoff is not a mysterious protocol: it is a tool with a JSON schema whose invoke function returns the next agent.
- Guardrails run in parallel with the model call; when the tripwire fires, the model task is cancelled on the spot.
- Tracing is a product category: each primitive gets its own span type — a trace is structured data, not text logs.
- Wakii recognizes its own shape in two places: machine gates run before human gates, and evidence is a product.

## Agent is one dataclass, not a framework

The entire agent definition fits in one file: `src/agents/agent.py`. Strip the docstrings and the `Agent` class reads as a six-field declaration:

```python
class Agent(AgentBase, Generic[TContext]):
    instructions: str | Callable[...] | None = None
    handoffs: list[Agent[Any] | Handoff[TContext, Any]] = field(default_factory=list)
    input_guardrails: list[InputGuardrail[TContext]] = field(default_factory=list)
    output_guardrails: list[OutputGuardrail[TContext]] = field(default_factory=list)
    output_type: type[Any] | AgentOutputSchemaBase | None = None
```

(elided) — from `src/agents/agent.py` at [commit 544b8b0](https://github.com/openai/openai-agents-python/blob/544b8b03b8cf95e62c7f5ebb89adfc4bd66c9d1f/src/agents/agent.py).

The opening docstring states the philosophy outright: "An agent is an AI model configured with instructions, tools, guardrails, handoffs and more." (from `agent.py`, same commit). Six fields, each binding exactly one kind of relationship: what to tell the model, whom to delegate to, where to block at input and output, what shape the result must take. There is no orchestration layer above it: `Runner.run_sync(agent, prompt)` is a complete run — the hello-world example in the README is two lines of code. The small surface moves fast too: 10 releases in roughly six weeks, from v0.19.0 (Jul 27) to v0.22.1 (Sep 8, 2026), per the GitHub API on 2026-09-08 — a small surface with a dense release cadence is a rare pair; frameworks that keep shipping usually balloon.

## A handoff is a tool with a schema: the model does the dispatch

Handoff is the most misleadingly named primitive in the SDK — it sounds like a dedicated coordination protocol, but under the code it is flatter than that. The `Handoff` class docstring defines it: "A handoff is when an agent delegates a task to another agent." (from `src/agents/handoffs/__init__.py` at [commit 544b8b0](https://github.com/openai/openai-agents-python/blob/544b8b03b8cf95e62c7f5ebb89adfc4bd66c9d1f/src/agents/handoffs/__init__.py)). The structure:

```python
@dataclass
class Handoff(Generic[TContext, TAgent]):
    tool_name: str
    tool_description: str
    input_json_schema: dict[str, Any]
    on_invoke_handoff: Callable[[RunContextWrapper[Any], str], Awaitable[TAgent]]
    agent_name: str
    input_filter: HandoffInputFilter | None = None
```

(same file, same commit)

A handoff appears to the model like any other tool: a name, a description, a JSON schema. To delegate, the model calls this tool like a function tool; `on_invoke_handoff` returns the next agent and the Runner transfers coordination to it. The `handoffs` field on `Agent` states the relationship: "Handoffs are sub-agents that the agent can delegate to." (from `agent.py`, same commit) — who decides to hand off? The model, but only within the declared list. The final boundary is `input_filter`: "By default, the new agent sees the entire conversation history." (from `handoffs/__init__.py`, same commit) — if you want to trim history before the baton passes, you write a filter; otherwise the full block is passed through.

Wakii cuts this differently: coordinator routing across the 9 agents is static, following the DAG in the plan — phase0 finishes analysis, spec-critic steps in; the plan is done, task-executor picks up — the model does not choose freely. The static cut loses some out-of-script flexibility, but in exchange, who hands to whom is readable straight from the plan.

## Guardrails run in parallel: the tripwire cancels the run in place

The guardrail is the most instructive primitive because of where the SDK places it: next to the model call, not before or after. The `input_guardrails` field docstring says it directly: "A list of checks that run in parallel to the agent's execution, before generating a response." (from `agent.py`, same commit):

```
                ┌── model call (main task) ──▶ final output
input ───┤
                └── input_guardrails (run in parallel)
                          └── tripwire fires → raise, cancel the model task
```

Proof of the cancellation mechanism sits right in `src/agents/run.py` — a function named `should_cancel_parallel_model_task_on_input_guardrail_trip` at [commit 544b8b0](https://github.com/openai/openai-agents-python/blob/544b8b03b8cf95e62c7f5ebb89adfc4bd66c9d1f/src/agents/run.py). The function name is the documentation: when a guardrail detects a violation, it raises `InputGuardrailTripwireTriggered` (defined in `guardrail.py`) and the parallel model task is cancelled — no waiting for the model to finish before reporting the failure. There is one clear design limit: input guardrails run only on the first agent of the chain ("Runs only if the agent is the first agent in the chain" — from `agent.py`) — check at the entrance, do not re-check every link.

Wakii places its machine checks in the same spot: lint, tests, and claims-checks run automatically and independently before the human gate (review) opens — the principle analyzed in [gates-not-trust, rule zero](/blog/gates-not-trust-rule-zero/). Both designs reach the same economic conclusion: adding machine checks is cheap, because they run alongside the main work rather than sitting on the serial critical path.

## Tracing first-class: one span type per primitive

The README lists tracing as its own core concept, not an add-on: "Built-in tracking of agent runs, allowing you to view, debug and optimize your workflows" (README, at [commit 544b8b0](https://github.com/openai/openai-agents-python/blob/544b8b03b8cf95e62c7f5ebb89adfc4bd66c9d1f/README.md)). Reading the `tracing/` package, the word "first-class" shows up in a small detail: the `create.py` module ships a dedicated factory per span type:

```
trace (one run)
 ├── agent_span        — each agent turn
 ├── handoff_span      — each delegation
 ├── guardrail_span    — each check
 ├── function_span     — each tool call
 └── generation_span   — each model call
```

(real function names from `src/agents/tracing/create.py` at [commit 544b8b0](https://github.com/openai/openai-agents-python/blob/544b8b03b8cf95e62c7f5ebb89adfc4bd66c9d1f/src/agents/tracing/create.py) — diagram shows the grouping)

`agent_span`, `handoff_span`, and `guardrail_span` existing separately is the signal: tracing was designed alongside the three primitives, not bolted on after the framework shipped. The direct consequence: a trace is structured data keyed by event type — the debug UI reads it, and so can a QA script — instead of a block of text logs to sift by eye.

Wakii's pipeline follows the same shape: idea → impact → plan → SFs → gates → one PR, with a machine gate in front of the human gate at each step — described in full in the [story-workflow](/docs/story-workflow/) docs. And for why every decision in that pipeline must lean on evidence instead of trusting the agent, see [decision gates for AI agents](/blog/decision-gates-safe-ai-agents/).

## What Wakii learns

- **ADOPT** — machine checks run in parallel and fail fast: Wakii already applies this exactly where OpenAI places its guardrails. Lint + tests + claims-checks run automatically before the human gate opens; the evidence in this post shows the value of machine checks is reporting failure the moment it is detected (canceling the in-flight task) rather than after the chain finishes — applied to story gates B0–B5: the machine gate blocks before the human gate, and reports early enough that no one reviews a build already broken.
- **DIRECTION** — structured traces keyed by event type: Wakii keeps evidence as text (gate logs, outboxes, the improvements log) — readable by people, not yet classifiable by machine. The direction worth taking: log the pipeline by step type (analysis / planning / review / verify — corresponding to agent_span / handoff_span / guardrail_span) so verify-QA can re-read it with a script. Not applied yet because current stories are already traceable as text; a shared format needs to exist before machine-readability does.
- **WATCH** — `input_filter` at handoff time: Wakii passes the full context pack between agents in a story. When a chain of SFs gets long enough that packs bloat or duplicate, filtering history before the baton passes — what OpenAI makes a default choice — becomes a DIRECTION candidate. The trigger to watch: a real story having to rebuild context because of overload.
- **N/A** — realtime, voice, and sandbox agents: the SDK's realtime-surface features do not touch the desktop coding-agent problem Wakii works on.

Wakii builds its pipeline in the same spirit: machine gate first, human gate second, and done means evidence. Download Wakii and run your first story — the whole kit ships with the install.
