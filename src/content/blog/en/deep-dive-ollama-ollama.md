---
title: "Ollama: local LLMs in one command — then coding agents too"
description: "Behind ollama run sits a real VRAM-fitting scheduler; and since 2026, ollama launch claude wires Claude Code straight to your local model."
pubDate: "2026-10-02"
category: "tech"
tags: ["cli", "architecture", "agents", "oss"]
draft: false
heroImage: "/blog/heroes/deep-dive-ollama-ollama.png"
---

Getting an LLM to run on your own machine used to be an afternoon lost to CUDA drivers. Ollama compresses that whole ordeal into a single command — but one command does not mean a simple system. Behind `ollama run` sits a scheduler that decides which model fits in VRAM, how many models load at once, and which one gets evicted when memory runs out. And since 2026, this 180,451-star repo (per the GitHub API on 2026-09-08) does something entirely different on top: it launches coding agents — Claude Code, Codex — pointed at your local model. This post dissects both layers using the repo's actual code.

TL;DR:

- One `ollama run <model>` command pulls the whole pipeline: manifest + layers from the registry, GPU probing, VRAM fitting, and a REST API on 127.0.0.1:11434.
- The scheduler in `server/sched.go` loads one model at a time, defaults to 3 models per GPU, and on an OOM load crash evicts everything and retries — with a flag preventing an infinite loop.
- The 2026 twist: `ollama launch claude` wires Claude Code to a local model via environment variables, routing all three tiers (Opus/Sonnet/Haiku) to one model.
- Shipping is dense: 10 releases in 22 days (Aug 14 → Sep 5, 2026, per the GitHub API on 2026-09-08), and the repo is MIT open-source.

## One command, three layers underneath

Installation is one line: `curl -fsSL https://ollama.com/install.sh | sh`. The README then promises exactly what this post verifies: running `ollama` gets you "prompted to run a model or connect Ollama to your existing agents" — or you can go straight to `ollama run gemma4`. Three things happen under the hood:

```
ollama run gemma4
   |
   |-- pull manifest --> list layer blobs; reuse any blob already on disk
   |
   |-- discover/ ------> probe GPUs: CUDA, AMD, Vulkan, Metal, Jetson + free RAM
   |
   |-- server/sched.go > fit VRAM --> load via llama.cpp or MLX backend
   |
   v
REST API on 127.0.0.1:11434  (speaks both OpenAI and Anthropic dialects)
```

Model downloads follow a manifest, so layers already on disk are skipped — that logic lives in `server/images.go`, including the comment "the blob now exists on disk from the first download" ([images.go @ 83ed7d9](https://github.com/ollama/ollama/blob/83ed7d9/server/images.go)). Hardware detection lives in the `discover/` directory: one file per backend (`amd.go`, `vulkan.go`, `gpu_darwin.go` for Metal), plus a dedicated branch for Jetson devices via the `JETSON_JETPACK` environment variable — see [gpu.go @ 83ed7d9](https://github.com/ollama/ollama/blob/83ed7d9/discover/gpu.go). The default 127.0.0.1:11434 address is declared in [envconfig/config.go @ 83ed7d9](https://github.com/ollama/ollama/blob/83ed7d9/envconfig/config.go). Everything is written in Go; the repo went public on 2023-06-26 and its latest commit landed 2026-09-07 (per the GitHub API on 2026-09-08).

## The scheduler: fit VRAM first, or don't load

The most interesting part of the repo is `server/sched.go` — 1,785 lines of orchestration. First rule: each GPU hosts only a small number of models:

```go
// Default automatic value for number of models we allow per GPU
// Model will still need to fit in VRAM, but loading many small models
// on a large GPU can cause stalling
var defaultModelsPerGPU = 3
```

(excerpt from [sched.go @ 83ed7d9](https://github.com/ollama/ollama/blob/83ed7d9/server/sched.go) — the repo's own comment)

Every request passes through an `LlmRequest` struct, and the scheduler is explicit in code about what it decides on your behalf: `numCtxAuto` is true when the context window comes from "Ollama's automatic VRAM-tier default" rather than an explicit request. When a model load crashes on memory, the scheduler takes the evict-all-and-retry path: unload every loaded model and try again — with an `oomRetryAttempted` flag limiting the retry to once so it cannot loop forever. When there is no way through, it fails loudly: `ErrMaxQueue` with the message "server busy, please try again. maximum pending requests exceeded" — nothing is silently swallowed.

That is the repo's philosophy in one line: report the machine's real limits instead of promising first and hanging later.

## 2026: from model server to agent launchpad

The README describes the repo as "Get up and running with Kimi-K2.6, GLM-5.2, MiniMax, DeepSeek, gpt-oss, Qwen, Gemma and other models" — but the newest part matters most to anyone building agents. The command `ollama launch claude` does two things: if Claude Code is missing, it asks for confirmation and installs it; if present, it just sets environment variables and spawns it. The entire "wire" fits in one function:

```go
// modelEnvVars returns Claude Code env vars that route all model tiers through Ollama.
func (c *Claude) modelEnvVars(model string) []string {
	env := []string{
		"ANTHROPIC_DEFAULT_OPUS_MODEL=" + model,
		"ANTHROPIC_DEFAULT_SONNET_MODEL=" + model,
		"ANTHROPIC_DEFAULT_HAIKU_MODEL=" + model,
		"CLAUDE_CODE_SUBAGENT_MODEL=" + model,
	}
	// ...
}
```

([claude.go @ 83ed7d9](https://github.com/ollama/ollama/blob/83ed7d9/cmd/launch/claude.go))

No fork, no patching of the agent — Claude Code stays untouched, only pointed at the local server via `ANTHROPIC_BASE_URL`, with all three model tiers and the subagent model routed to a single local model. The `cmd/launch/` directory counts 18 integration files following the same pattern (Claude Code, Codex, Copilot, OpenCode, Cline, Droid, DeepSeek Harness, Kimi, Qwen…) as of the 2026-09-08 clone — the README officially lists the first six. The server also speaks the Anthropic API dialect, not just OpenAI: the `anthropic/` directory holds 1,307 lines of Go ([anthropic.go @ 83ed7d9](https://github.com/ollama/ollama/blob/83ed7d9/anthropic/anthropic.go)).

One small detail is worth remembering: when it needs the context window, `ollama launch` does not read the theoretical number from the model card — it asks the running server, because the "VRAM fit or server configuration may hold below the model's trained maximum" ([context_window.go @ 83ed7d9](https://github.com/ollama/ollama/blob/83ed7d9/cmd/launch/context_window.go)). If it cannot determine the value, it returns 0 instead of guessing.

## Shipping cadence: 10 releases in 22 days

This repo is maintained like the daily infrastructure it has become. The 10 most recent releases, per the GitHub API on 2026-09-08:

| Tag | Release date |
|---|---|
| v0.34.0-rc1 | 2026-09-05 |
| v0.33.3 | 2026-09-02 |
| v0.33.2 | 2026-08-27 |
| v0.33.1 | 2026-08-26 |
| v0.33.0 | 2026-08-21 |
| v0.32.15 | 2026-08-19 |
| v0.32.14 | 2026-08-15 |
| v0.32.13 | 2026-08-14 |
| v0.32.12 | 2026-08-14 |
| v0.32.11 | 2026-08-14 |

Three releases landed on Aug 14 alone. That cadence only holds because the inference backends are pinned like dependencies: `LLAMA_CPP_VERSION` says `b10760`, `MLX_VERSION` pins an exact commit hash ([clone 83ed7d9, 2026-09-08](https://github.com/ollama/ollama/blob/83ed7d9/LLAMA_CPP_VERSION)) — upgrading the runtime is a deliberate, testable change, not an implicit chase of upstream.

In the end, these mechanisms — fit resources before promising, report real numbers instead of theoretical ones — are the same "gates, not trust" spirit Wakii's [story workflow](/docs/story-workflow/) uses to keep agents honest.

## What Wakii learns

- **ADOPT — report the real number, return 0 when unsure**: `context_window.go` asks the running server for the actually-allocated context window and returns 0 rather than guessing when it cannot be determined. Wakii already applies this spirit in Rule 0 (the verifier measures the real dist instead of trusting the agent's word); the lesson to add is how "unknown" is handled — record it as a valid result in gate reports instead of filling in a flattering number.
- **DIRECTION — wire by configuration, not fork**: `ollama launch claude` does not modify a single line of Claude Code; it routes every tier through env vars. Wakii could do the same: one command pointing the 9-agent team (see [agents & kit](/docs/agents-and-kit/)) at a self-hosted model endpoint (Ollama/vLLM) for sensitive codebases, without building a separate harness. Not yet, because local models' agentic quality is not trustworthy enough for a multi-gate story.
- **WATCH — local inference for the agent loop**: Ollama growing its own agent runtime (the `agent/` directory with session, skills, compactor, approval — [skills.go @ 83ed7d9](https://github.com/ollama/ollama/blob/83ed7d9/agent/skills.go)) is a signal that local models are closing in on agentic workloads. Condition to upgrade to DIRECTION: a local model passing a full multi-gate story-verify end to end.
- **N/A — VRAM-fit scheduling**: evict-and-retry, per-GPU model limits, and automatic context tiers are inference-infrastructure techniques. Wakii does not run models in the app process — the agent team calls frontier APIs — so this layer never touches Wakii's orchestration.

Where does Ollama sit on the wider map? The [50-project agentic landscape](/blog/agentic-landscape-50-projects/) puts it in the local inference group, next to llama.cpp and vLLM. To run the 9-agent team on your own machine, start with [getting started](/docs/getting-started/).
