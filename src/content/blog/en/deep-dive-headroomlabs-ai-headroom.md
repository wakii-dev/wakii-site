---
title: "Headroom: a context compression layer for coding agents"
description: "Headroom compresses the tool output, logs, and conversation history your agent reads before they reach the model — same answers, a fraction of the tokens. Inside: architecture, two safety invariants, and a public self-audit."
pubDate: "2026-10-07"
category: "tech"
tags: ["agents", "memory", "features"]
draft: false
---

Coding agents burn money not only because models are expensive, but because context is dirty. One search returns a hundred JSON results; one log dump weighs tens of thousands of tokens; most of it is repeated noise. The model reads all of it, you pay for all of it — and it can still miss the one FATAL line buried in the noise. Headroom attacks exactly that: it compresses everything an agent reads before it reaches the model, entirely on your machine.

## TL;DR

- Agents pay for context, not just for answers — raw tool output is the biggest occupant of the window.
- Headroom is a content router plus three dedicated compressors (JSON, source code, prose) and a local store that keeps originals for retrieval.
- Two invariants keep it safe: tool_use and tool_result are compressed as a pair; lines containing error keywords survive verbatim.
- Three MCP tools — headroom_compress, headroom_retrieve, headroom_stats — expose the layer to any MCP client.
- The repo has 70,491 stars and an Apache-2.0 license (per the GitHub API on 2026-09-08), and it published a public self-audit with a 9-phase rewrite plan.

## The economics of the context window

Every agent turn ships the whole context to the provider: system prompt, tool definitions, conversation history, tool results. The fastest-growing slice is raw tool output — logs, search results, JSON dumps. They enter the window once and stay for the whole session, and every later turn pays to carry them again.

```
  an agent turn's window
  +--------------------------------------------+
  | system prompt + tools        | stable      |
  | conversation history         | grows       |
  | tool output (logs, JSON)     | <<< the occupant
  | the current question         | small       |
  +--------------------------------------------+
```

The README states the scope plainly: "Headroom compresses everything your AI agent reads — tool outputs, logs, RAG chunks, files, and conversation history — before it reaches the LLM." (headroomlabs-ai/headroom README: [github.com/headroomlabs-ai/headroom](https://github.com/headroomlabs-ai/headroom)). That phrase "everything your agent reads" is the design target: the compressed object is the entire supply line into context, not just the user's messages.

There is a second side to the bill: what the model writes back — the README notes output costs 5x input on Opus-class models, and part of that output is ceremony: polite preambles and code printed straight back.

## Router, three compressors, and the original store

The core is a pipeline: ContentRouter detects the content type and picks a compressor — SmartCrusher for JSON, CodeCompressor for code via AST, Kompress-v2-base (a small local model) for prose. Ahead of the router, CacheAligner flags volatile content, the kind that busts a provider's KV-cache prefix; it never rewrites the prompt.

The most interesting piece is CCR: originals of everything compressed are cached locally, and the model can call headroom_retrieve to fetch the full text when needed. Compression, under this design, is not information loss — it moves the moment of reading to when it is actually needed.

The savings figures are published by the repo itself, from the README retrieved on 2026-09-08 (seeded offline benchmarks, measured with the provider tokenizer, reproducible with the command they ship):

| Scenario | Before | After | Saved |
|---|---:|---:|---:|
| Code search (100 results) | 17,199 | 13,597 | 21% |
| SRE incident debugging | 55,957 | 24,340 | 57% |
| Codebase exploration | 58,801 | 33,895 | 42% |
| GitHub issue triage | 46,067 | 32,429 | 30% |

Latency: 0.21 ms p50 on a 10K-token JSON result, 1.4 ms at 100K (README). Savings scale with repetition — repeated JSON arrays and log lines clear 90%, dense prose barely compresses — an honest statement you rarely see in a feature list.

## Compressing without breaking the conversation: two invariants

Compressing an agent's context fails in subtler ways than losing words: it breaks the protocol. The Rust core of headroom holds two invariants worth studying.

Invariant one: a tool_use — tool_result pair is one unit. The safety module's comment states why: "compressing one but not the other desynchronizes the conversation and a re-replay of the tool response will mismatch the call id" ([safety.rs @ e67b3c8](https://github.com/headroomlabs-ai/headroom/blob/e67b3c8a29443a60d6b0018fb22f525c5cd7e709/crates/headroom-core/src/transforms/safety.rs)). Compress one half and not the other, and the next request returns 400 upstream. Encoding that idea is just an id-matching table:

```rust
pub struct ToolPair {
    pub assistant_index: usize,
    pub response_index: usize,
}
```

Invariant two: error lines survive. The error_keywords module defines exactly 12 keywords — error, exception, failed, failure, critical, fatal, crash, panic, abort, timeout, denied, rejected — and any item containing one is preserved verbatim before the rest gets compressed. The reason sits in the comment: "better to over-preserve than to drop a real error item" ([error_keywords.rs @ e67b3c8](https://github.com/headroomlabs-ai/headroom/blob/e67b3c8a29443a60d6b0018fb22f525c5cd7e709/crates/headroom-core/src/transforms/smart_crusher/error_keywords.rs)). That philosophy explains the README's opening demo: a 10,144-token log compresses to 1,260, and the FATAL line survives byte for byte.

```rust
pub const ERROR_KEYWORDS: &[&str] = &[
    "error", "exception", "failed", "failure",
    "critical", "fatal", "crash", "panic",
    "abort", "timeout", "denied", "rejected",
];
```

## On the MCP side: three tools, one supply layer

Headroom ships in four modes — library, proxy, agent wrap, MCP server — but the MCP mode exposes the problem most clearly. The server module's docstring calls MCP tool output "the PERFECT use case for Headroom" — large, structured, mostly low-relevance data with a few critical items ([server.py @ e67b3c8](https://github.com/headroomlabs-ai/headroom/blob/e67b3c8a29443a60d6b0018fb22f525c5cd7e709/headroom/integrations/mcp/server.py)).

The server exposes three tools: headroom_compress shrinks a tool result before it enters context; headroom_retrieve fetches the original from the CCR store; headroom_stats reports savings. A host app wraps the MCP client's transport, and results from any other server — database, Slack, GitHub — pass through the compression layer before touching context. On the same layer, the repo is trying a bigger idea: cross-agent memory, one shared store for several CLIs (Claude, Codex, Gemini, Grok) with automatic dedup, instead of each agent living on its own island of context.

## A repo that audits itself in public

The rarest thing about this repo is not the star count — it is the REALIGNMENT directory at the root: a public self-audit concluding that the product itself was built on the wrong mental model. The old model treated compression as choosing what to drop from history; the audit showed it busted customers' prompt caches, listed 5 top-tier bugs and roughly 10,000 lines of over-build, and laid out a 9-phase, 40-PR plan. The new model fits in one sentence: "passthrough is sacred; compress only the live zone, type-aware, hash-keyed, position-preserving, with side-channel metadata" ([REALIGNMENT/00-overview.md @ e67b3c8](https://github.com/headroomlabs-ai/headroom/blob/e67b3c8a29443a60d6b0018fb22f525c5cd7e709/REALIGNMENT/00-overview.md)).

Shipping cadence matches the promise: 6 releases in the week of 2026-08-21 to 2026-08-27 (v0.36.1 to v0.37.0); the latest push on 2026-09-07 (per the GitHub API on 2026-09-08).

## What Wakii learns

- **ADOPT — preserve errors verbatim in story memory.** The over-preserve principle from the two-invariants section maps straight onto Wakii's post-task ritual: the "what went wrong" entry should copy the failing line and the failing command verbatim instead of paraphrasing — the next SF needs the exact string to grep and reproduce. Keep it narrow: one error line, one command per entry.
- **DIRECTION — a stable-prefix/live-tail structure for context packs.** Wakii already has context packs (analyze once, inherit many); Headroom adds one axis: the stable part of the context is never mutated, only the volatile head — the tool dumps — gets compressed. Worth trying when a pack must carry large output; the bar for promoting to ADOPT is measuring pack token cost before and after.
- **WATCH — output-side compression and cross-agent memory.** Output shaping depends on provider parameters that keep changing; memory shared across agents reaches beyond a single session. Promote to DIRECTION once the mechanism holds steady on at least two providers without breaking cache prefixes.

Wakii's workflow touches the same problem from the selection side: the context pack decides what goes into each SF's context, while Headroom decides how much each item weighs — two ends of the same scarcity problem. Read how the workflow organizes context in the [story workflow docs](/docs/story-workflow/), and see a similar loop — learning from failed sessions and writing it down — in [story memory and the learning loop](/blog/story-memory-learning-loop/). Wakii is an agentic IDE with a built-in superpowers team: download it and let the agents run on the right context.
