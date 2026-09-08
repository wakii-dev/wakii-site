---
title: "PydanticAI: agents with tight types"
description: "PydanticAI ports the FastAPI typing playbook to agents: tool args and structured output are pydantic contracts, errors caught at the boundary instead of exploding far away at runtime. This post dissects the validation-first mechanism, dependency injection, and delegation-style multi-agent."
pubDate: "2026-10-16"
category: "tech"
tags: ["agents", "architecture"]
draft: false
---

Models call tools with free-form JSON — and what breaks production is usually not
agent logic but a mistyped field name or an out-of-range number nobody checked.
PydanticAI — the agent SDK from the team behind pydantic, 19,794 stars and MIT per
GitHub API on 2026-09-08 — flips that around: every boundary between the model and
your code is a type contract. It is the recipe that already worked once on the web:
FastAPI grew on the fact that request bodies are validated before handler code runs.
This post dissects where validation-first lives in the source, how dependency
injection makes tools testable, and what kind of multi-agent this repo actually is.

TL;DR:

- Tool args are not free-form JSON: the function signature and docstring produce a
  pydantic schema; bad arguments are caught at the boundary before a single line of
  the tool runs.
- A validation error is not thrown away — it becomes a RetryPromptPart, a
  first-class message handed back to the model with enough detail to fix and retry.
- Structured output works the same way: declare output_type as a pydantic model;
  the run only completes when the result passes the validator.
- Dependency injection via RunContext: tools receive deps injected through a
  generic parameter, not module-level globals — testing a tool needs no model call.
- Multi-agent here is delegation: an agent inside another agent's tool; release
  cadence is dense — 10 releases in the 14 days before the probe date.

## Function signatures become contracts, docstrings become tool descriptions

The repo's canonical example from the README: an agent extracting review sentiment,
with the output declared as a pydantic model and the tool attached via decorator:

```python
class Sentiment(BaseModel):
    label: Literal['positive', 'negative', 'neutral']
    score: float = Field(ge=-1, le=1)


agent = Agent('openai:gpt-5.6-sol', output_type=Sentiment)


@agent.tool
def recent_reviews(ctx: RunContext[None], product: str) -> list[str]:
    """Fetch recent review snippets for a product."""
    return ['The new release fixed everything I complained about!']
```

(Excerpt from the pydantic/pydantic-ai README @ commit `62f1e830` —
[source](https://github.com/pydantic/pydantic-ai/blob/62f1e8302a356d09962c55117f41a282cf1eb243/README.md).)

The README compresses the principle into one line: "arguments are validated before
your code runs, and the run is guaranteed to return a `Sentiment`" — the rest of
the signature plus the docstring become the tool schema shown to the model
([source](https://github.com/pydantic/pydantic-ai/blob/62f1e8302a356d09962c55117f41a282cf1eb243/README.md)).
Worth noting: the one-line docstring on `recent_reviews` is not just for human
readers — it gets harvested into the description inside the JSON schema the model
sees.

In the source, that contract exists as an explicit data structure:

```python
@dataclass(kw_only=True)
class FunctionSchema:
    """Internal information about a function schema."""

    function: Callable[..., Any]
    name: str
    description: str | None
    validator: SchemaValidator
    json_schema: ObjectJsonSchema
```

(Excerpt from `pydantic_ai_slim/pydantic_ai/_function_schema.py` @ `62f1e830` —
[source link](https://github.com/pydantic/pydantic-ai/blob/62f1e8302a356d09962c55117f41a282cf1eb243/pydantic_ai_slim/pydantic_ai/_function_schema.py),
per GitHub API on 2026-09-08.)

A tool registered with an agent is more than a function — it ships with a
`SchemaValidator` to check incoming args, and a `json_schema` to describe the tool
to the model. Two halves of one contract: one half tells the model how to call, the
other stops it when the call is wrong.

## Errors caught at the boundary, turned into a repair signal for the model

Where model-produced args get checked, in the tool-management module:

```python
raw_args = args_override if args_override is not None else call.args
validator = tool.args_validator
if isinstance(raw_args, str):
    args_dict = validator.validate_json(
        raw_args or '{}', allow_partial=pyd_allow_partial, context=ctx.validation_context
    )
else:
    args_dict = validator.validate_python(
        raw_args or {}, allow_partial=pyd_allow_partial, context=ctx.validation_context
    )
```

(Excerpt from `_validate_tool_args` in
`pydantic_ai_slim/pydantic_ai/tool_manager.py` @ `62f1e830` —
[source link](https://github.com/pydantic/pydantic-ai/blob/62f1e8302a356d09962c55117f41a282cf1eb243/pydantic_ai_slim/pydantic_ai/tool_manager.py),
per GitHub API on 2026-09-08.)

`validate_json` runs before the tool is touched; bad args raise `ValidationError`
right at the boundary. What makes this more than a try/except is what happens next:

```python
def _wrap_error_as_retry(name: str, call: ToolCallPart, error: ValidationError | ModelRetry) -> ToolRetryError:
    """Convert a ValidationError or ModelRetry to a ToolRetryError with a RetryPromptPart."""
    m = RetryPromptPart.from_error(error, tool_name=name, tool_call_id=call.tool_call_id)
    return ToolRetryError(m)
```

(Excerpt from the same file @ `62f1e830` —
[source link](https://github.com/pydantic/pydantic-ai/blob/62f1e8302a356d09962c55117f41a282cf1eb243/pydantic_ai_slim/pydantic_ai/tool_manager.py).)

The `ValidationError` gets wrapped into a `RetryPromptPart` — a protocol-level
message that travels back to the model like any tool result:

```
   model                boundary (tool_manager)          your code
     |                         |                             |
     |--- tool call (JSON) --->|                             |
     |                   validate_json()                     |
     |                    |-- pass ----> tool runs --------->|
     |<-- RetryPromptPart --|-- fail                        |
     |    (which field, what was expected)                   |
     |--- retry with fixed args --->|                        |
```

Instead of a generic "tool failed" string, the model receives a detailed validation
error — which field broke, what type was expected — enough raw material to fix its
own arguments and call again, inside a per-tool retry budget. FastAPI does exactly
this for the web: a bad request body gets a detailed 422 at the door, not a
TypeError burning deep in the service layer. PydanticAI ports that principle into
the agent loop.

## Deps flow through RunContext, not module globals

The classic problem when writing tools: the function needs a DB client, an HTTP
client, config — where do those come from? Globals make tests dirty and imports
circular. PydanticAI puts the answer in the signature:

```python
@dataclasses.dataclass(repr=False, kw_only=True)
class RunContext(Generic[RunContextAgentDepsT]):
    """Information about the current call."""

    deps: RunContextAgentDepsT
    """Dependencies for the agent."""
```

(Excerpt from `pydantic_ai_slim/pydantic_ai/_run_context.py` @ `62f1e830` —
[source link](https://github.com/pydantic/pydantic-ai/blob/62f1e8302a356d09962c55117f41a282cf1eb243/pydantic_ai_slim/pydantic_ai/_run_context.py),
per GitHub API on 2026-09-08.)

The tool declares `ctx: RunContext[Deps]`, and all deps are injected when
`agent.run(..., deps=...)` is called. Swapping the DB client in a test means passing
different deps — the tool code stays untouched; testing a tool needs no model: build a
fake ctx and call the function directly. Same reason FastAPI separates `Depends`
from the handler: a dependency visible in the signature is a dependency you can
check, rather than one hidden in module-level state.

## Multi-agent is delegation, control returns to the caller

The repo docs lay out five levels of complexity: single agent → agent delegation →
programmatic hand-off → graph → deep agents
([source](https://github.com/pydantic/pydantic-ai/blob/62f1e8302a356d09962c55117f41a282cf1eb243/docs/multi-agent-applications.md),
per GitHub API on 2026-09-08). The most-used level is delegation — the docs define
it as "an agent delegates work to another agent, then takes back control" — a child
agent lives inside one of the parent agent's tools, finishes, and hands control back
to the caller. One positional contrast with the OpenAI Agents SDK: there, hand-off
moves the conversation to the target agent for good and does not come back.

The most instructive detail sits in the SubAgents capability of the Pydantic AI
Harness — the docs state: "Each delegation runs in its own run with its own message
history, so a delegate never sees the parent conversation."
([source](https://github.com/pydantic/pydantic-ai/blob/62f1e8302a356d09962c55117f41a282cf1eb243/docs/multi-agent-applications.md).)
The delegate is context-isolated; the parent only receives output that passed the
output_type validator. Usage is threaded down to the delegate via `ctx.usage` so
tokens spent inside delegation still count against the parent run's budget — tight
context boundary, but one continuous budget.

## Release cadence: 10 releases in 14 days

The last 10 releases of the repo:

| Tag | Published |
|---|---|
| v2.34.0 | 2026-08-25 |
| v2.35.0 | 2026-08-26 |
| v2.35.1 | 2026-08-27 |
| v2.35.3 | 2026-08-28 |
| v2.36.0 | 2026-08-29 |
| v2.37.0 | 2026-09-01 |
| v2.38.0 | 2026-09-03 |
| v2.39.0 | 2026-09-04 |
| v2.40.0 | 2026-09-05 |
| v2.41.0 | 2026-09-08 |

(Per GitHub API on 2026-09-08; the latest release v2.41.0 shipped on the probe date
itself, and the most recent push to main landed the same day.)

A dense cadence does not contradict type-first engineering: typed contracts catch
regressions at the boundary, the README carries a 100% coverage badge, and the pace
shows a core being turned quickly toward harness features — capabilities, durable
execution, realtime voice all appear in the current README.

Wakii runs the same playbook at its own layer: the post contract is locked in the
frontmatter schema, machine gates fire before commit — how the nine agents split
authority inside a ready-made harness is described in
[agents-and-kit](/docs/agents-and-kit/).

## What Wakii learns

- **ADOPT** — "catch errors at the boundary" is already Wakii's gate principle:
  content lint runs at writing time (word band, pubDate matching the matrix row,
  grading section), the parity gate stops half-pairs of VI/EN at build, and the
  frontmatter schema locks all six fields in content.config.ts. Same reason as the
  validator blocking bad args before the tool runs: an error close to where it was
  born is cheap. Those gates are listed in full in
  [arch-ci-gates](/blog/arch-ci-gates/).
- **DIRECTION** — output contracts between agents: the task-executor's
  DONE/BLOCKED report is markdown following an agreed format, but read by eye. A
  light output schema for reports — the way output_type forces a run through a
  validator — would let the coordinator parse them mechanically, auto-tick the plan,
  and flag reports missing fields. Not applied yet: at a few SFs per story, prose
  still reads fast enough, and schema maintenance cost does not pay for itself.
- **WATCH** — delegation with a context boundary: Wakii is coordinator-driven today;
  each agent sees exactly the context pack handed to it. If orchestration moves
  toward peer delegation, the SubAgents pattern (delegate never sees the parent
  conversation, returns only validated output) is the boundary shape to reach for.
  Switch condition: sub-agents need to run long and independently, or the agent
  count outgrows sequential dispatch.

Download Wakii and run a story — every milestone has a machine gate standing at the
boundary, instead of one big error hunt at the end of the line.
