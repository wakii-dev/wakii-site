---
title: "LangChain: from chains library to agent engineering platform"
description: "LangChain at 145,927 stars, MIT-licensed: version 1.x moved the old chains into langchain-classic and kept the agent runtime — create_agent, middleware, LangGraph, LangSmith. An architecture lesson in how a framework cuts itself down."
pubDate: "2026-10-02"
category: "tech"
tags: ["agents", "architecture", "oss", "workflow"]
draft: false
heroImage: "/blog/heroes/deep-dive-langchain-ai-langchain.png"
---

Few open-source projects get judged as harshly as LangChain: born in 2022 as glue between LLMs and data, saddled with the "bloated wrapper" reputation — and yet four years later it stands at 145,927 stars under the MIT license, per the GitHub API on 2026-09-08. The interesting part is not the star count. It is the repository's directory structure today: the repo itself tells the story of a chains library that cut itself down to become an agent platform. The main branch received commits on the very day of the probe (2026-09-08) — this is not an abandoned site. This post reads LangChain as a living architecture document and writes down what Wakii learns from it.

TL;DR:

- `langchain-ai/langchain`: 145,927 stars, 24,372 forks, MIT, 458 open issues — per the GitHub API on 2026-09-08; the repo was created on 2022-10-17 and still pushes commits steadily.
- Version 1.4.0: the `langchain` package is now only the agent runtime — `agents`, `chat_models`, `embeddings`, `mcp`, `tools`; all the old chains moved to a separate `langchain-classic` package.
- `create_agent` is the central API: one factory function, built on LangGraph's StateGraph, traced through LangSmith.
- 24 middleware modules turn agent behavior — human-in-the-loop, summarization, retry, PII — into a composable layer, not hard-coded core logic.
- Monorepo-style releases: each package carries its own version; `langchain` went from 1.3.16 to 1.4.0 in 14 days.

## The repo structure says it out loud

Open the `libs/` directory at commit `e670c7a` and you see a separation that most projects only describe in changelogs:

```
libs/
├── core/            → langchain-core: message schemas, runnables, old agents.py
├── langchain_v1/    → package "langchain" 1.4.0 — the agent runtime
├── langchain/       → package "langchain-classic" 1.0.8 — the old chains
├── partners/        → per-provider integrations
├── text-splitters/  → text splitting utilities
├── model-profiles/  → per-model capability profiles
└── standard-tests/  → standard test suite for every integration
```

The decisive lines live in two `pyproject.toml` files. The `libs/langchain_v1` directory declares `name = "langchain"` — version 1.4.0, holding exactly seven modules: `agents`, `chat_models`, `embeddings`, `mcp`, `messages`, `rate_limiters`, `tools`. The old `libs/langchain` directory has become `langchain-classic` 1.0.8, where the first-generation chains now reside ([langchain v1 pyproject](https://github.com/langchain-ai/langchain/blob/e670c7a/libs/langchain_v1/pyproject.toml), [classic pyproject](https://github.com/langchain-ai/langchain/blob/e670c7a/libs/langchain/pyproject.toml) — per the tree on 2026-09-08).

Which means: the package named `langchain` on PyPI today no longer contains chains. The cut is even documented inside the old code — the `agents.py` file in `langchain-core` opens with a warning that its schemas exist only for backwards compatibility, quoting verbatim: "New agents should be built using the `langchain` library" ([langchain-core/agents.py](https://github.com/langchain-ai/langchain/blob/e670c7a/libs/core/langchain_core/agents.py)). The maintainers did not quietly abandon the old path; they marked the old path clearly and moved the official API elsewhere.

## create_agent — one factory function on top of LangGraph

The 1.x agent API surface is small enough to read in one glance: the `__init__.py` of the `agents` module exports exactly two names — `create_agent` and `AgentState` ([agents/__init__.py](https://github.com/langchain-ai/langchain/blob/e670c7a/libs/langchain_v1/langchain/agents/__init__.py), tree on 2026-09-08).

The machinery lives in `factory.py`, and the import block tells you who carries the weight:

```python
from langgraph.graph.state import StateGraph
from langgraph.prebuilt.tool_node import ToolNode
from langsmith import traceable
from langchain.chat_models import init_chat_model
```

([agents/factory.py](https://github.com/langchain-ai/langchain/blob/e670c7a/libs/langchain_v1/langchain/agents/factory.py) — short excerpt for analysis, tree on 2026-09-08)

`create_agent` does not invent its own runtime: it builds a state graph on LangGraph, uses the existing ToolNode to execute tools, and wraps tracing through LangSmith's `traceable` decorator. Three products, three roles — runtime, observability, interface — instead of one monolith doing everything. The repo's README calls it, in exactly four words: "The agent engineering platform." (LangChain README, [github.com/langchain-ai/langchain](https://github.com/langchain-ai/langchain)) — and the structure above is what backs that tagline up.

## Middleware — agent behavior as a composable layer

The `agents/middleware/` directory holds 24 modules, one behavior per module, arranged around the agent core like optional layers ([agents/middleware/](https://github.com/langchain-ai/langchain/blob/e670c7a/libs/langchain_v1/langchain/agents/middleware/) — tree on 2026-09-08):

| Group | Middleware |
|---|---|
| Model steering | `model_retry`, `model_fallback`, `model_call_limit`, `provider_tool_search` |
| Context management | `summarization`, `context_editing`, `todo`, `file_search` |
| Blocking and asking humans | `human_in_the_loop`, `tool_error`, `tool_retry`, `pii`, `shell_tool` |
| Cost limiting | `tool_call_limit`, `tool_selection`, `tool_emulator` |

The clearest example is `human_in_the_loop`: it imports `interrupt` from LangGraph — the mechanism that pauses a graph mid-run to wait for input — and defines an `ActionRequest` with three fields: `name`, `args`, `description` ([human_in_the_loop.py](https://github.com/langchain-ai/langchain/blob/e670c7a/libs/langchain_v1/langchain/agents/middleware/human_in_the_loop.py)). Before a risky tool call, the agent stops, emits a structured action request, and only resumes once a human approves. That is a decision gate — placed exactly where it belongs: a swappable middleware, not an `if` buried in the agent core.

This cut has a clear architectural consequence: the core agent stays small and changes rarely; behavior lives at the edge, swappable and testable in isolation. A broken middleware is one broken file, not a broken runtime.

## The ecosystem around the runtime, and the release cadence

The README lays out the product ring around the runtime: Deep Agents — a higher-level package for agents with built-in planning, subagents, and file-system access; LangGraph — the low-level orchestration framework; LangSmith — evals, observability, and debugging; plus LangSmith Deployment for long-running stateful agents (README, [github.com/langchain-ai/langchain](https://github.com/langchain-ai/langchain), on 2026-09-08). At the model layer, `init_chat_model("openai:gpt-5.5")` speaks for itself: switching providers means changing one string, not the architecture.

The release cadence carries the same monorepo shape. Per the GitHub API on 2026-09-08, the fifteen most recent releases show `langchain` moving from 1.3.16 (2026-08-20) through 1.3.17, 1.3.18, four 1.4.0 alphas (2026-08-27 to 2026-09-02) to the official 1.4.0 (2026-09-03); `langchain-core` shipped 1.6.2 on 2026-09-04. Each package versions independently, patches land every few days, and the alpha cycle runs nearly daily before a major — this is a repository maintained like a multi-product ecosystem, not a single library.

Wakii runs on the same "behavior at the edge" principle: the 9-agent team and the gates of the [story workflow](/docs/story-workflow/) work through skills loaded on demand from the kit, rather than one bloated core ([agents-and-kit](/docs/agents-and-kit/)). LangChain v1's organization is confirmation of that pattern from a much larger codebase.

## What Wakii learns

- **ADOPT** — structured stops for human decisions: the `human_in_the_loop` middleware pauses the agent before a risky tool call via `interrupt`, carrying an `ActionRequest` (action name + args + description). Wakii already applies the same principle at the process level: gates B0–B5 in the story workflow stop the agent at every decision point, with choice and free-text gates carrying full context. Concrete proposal: adopt the `ActionRequest` shape as the reference schema for gate payloads in the kit, so every executor returns decision context in one consistent form.
- **DIRECTION** — model swapping behind a standard interface: `init_chat_model` takes a provider as one string, while `model_retry`/`model_fallback` middleware handle model-level failures at the edge. The Wakii kit is currently coupled to a single agent runtime; the direction worth exploring is extracting the model-calling layer so the kit survives a multi-provider move.
- **WATCH** — cutting legacy into its own package (`langchain-classic` 1.0.8): how to keep compatibility while moving to v1. If `langchain-classic` stays stable around 1.0.x, the "cut to move forward" lesson belongs in kit planning. Also watching Deep Agents — agents with built-in planning and subagents — because it touches exactly the layer where Wakii's story team already lives.
