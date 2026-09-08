---
title: "50 projects shaping agentic coding — the September 2026 map"
description: "A map of 50 open-source projects around agentic coding: harnesses, multi-agent frameworks, MCP, editors, local inference, terminal — star counts pulled straight from the GitHub API on 2026-09-08."
pubDate: "2026-09-08"
category: "tech"
tags: ["landscape", "agents", "oss", "mcp", "workflow"]
draft: false
---

A year ago, "agentic coding" was a question. Today it is an industry with its own map.
We swept the GitHub API on 2026-09-08, filtered fifty projects into seven groups, and
wrote the picture down here — with star counts exactly as retrieved, because these
numbers move weekly.

TL;DR: the harness layer is racing hardest but nobody has broken away; MCP has become
the default integration layer; "skills" are turning into a new distribution unit; local
inference is no longer a fringe; terminals and editors are swapping roles.

## Harnesses and coding agents (12)

The most competitive layer. DeepSeek Harness — a newcomer in August with an
"everything is a plugin" manifesto — already sits at 215.4k★. opencode leads at 205.8k★
after roughly sixteen months. claude-code holds 144.4k★ with a three-releases-in-four-days
cadence. The counterpoint: aider, once the icon of the category, has been nearly frozen
for a year at 48.8k★.

| Project | Stars | In one line |
|---|---|---|
| [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) | 215.4k | "everything is a plugin" |
| [anomalyco/opencode](https://github.com/anomalyco/opencode) | 205.8k | open-source terminal agent |
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | 144.4k | fastest shipper in the group |
| [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) | 106.9k | Google's agent CLI |
| [OpenHands/OpenHands](https://github.com/OpenHands/OpenHands) | 86.8k | autonomous dev agent |
| [cline/cline](https://github.com/cline/cline) | 67.7k | extension → own desktop app |
| [aaif-goose/goose](https://github.com/aaif-goose/goose) | 54.0k | Block's desktop agent |
| [Aider-AI/aider](https://github.com/Aider-AI/aider) | 48.8k | pioneer, now stalling |
| [charmbracelet/crush](https://github.com/charmbracelet/crush) | 28.0k | TUI + nightly channel |
| [xai-org/grok-build](https://github.com/xai-org/grok-build) | 26.6k | embeds into editors via ACP |
| [anywhere-labs/dsh-desktop](https://github.com/anywhere-labs/dsh-desktop) | 24.3k | desktop for the DSH ecosystem |
| [HKUDS/DeepCode](https://github.com/HKUDS/DeepCode) | 16.5k | harness + multi-agent loop |

## Multi-agent frameworks (9)

The layer beneath harnesses. Model-attached frameworks (Qwen-Agent) and minimalists
(nanobot) are taking seats from the previous research generation.

| Project | Stars | In one line |
|---|---|---|
| [langchain-ai/langchain](https://github.com/langchain-ai/langchain) | 145.9k | the platform framework |
| [microsoft/autogen](https://github.com/microsoft/autogen) | 60.9k | Microsoft's multi-agent |
| [FoundationAgents/MetaGPT](https://github.com/FoundationAgents/MetaGPT) | 70.3k | "AI software company" |
| [crewAIInc/crewAI](https://github.com/crewAIInc/crewAI) | 58.2k | role-based crews |
| [HKUDS/nanobot](https://github.com/HKUDS/nanobot) | 47.9k | minimal, self-hosted |
| [openai/openai-agents-python](https://github.com/openai/openai-agents-python) | 29.3k | OpenAI's official SDK |
| [pydantic/pydantic-ai](https://github.com/pydantic/pydantic-ai) | 19.8k | type-safe agents |
| [camel-ai/camel](https://github.com/camel-ai/camel) | 17.7k | research lineage |
| [QwenLM/Qwen-Agent](https://github.com/QwenLM/Qwen-Agent) | 17.1k | the Qwen ecosystem |

## MCP — the new integration layer (7)

MCP is replaying the role HTTP once played for the web: the best-known server list sits
at 94.6k★, the official registry at 7.2k★, Microsoft wrote a curriculum. Both directions
are growing — Chrome becomes a server, codebases become memory.

| Project | Stars | In one line |
|---|---|---|
| [punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) | 94.6k | the server catalog |
| [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | 90.2k | official servers |
| [headroomlabs-ai/headroom](https://github.com/headroomlabs-ai/headroom) | 70.4k | MCP infrastructure |
| [DeusData/codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) | 42.6k | codebase as memory |
| [microsoft/mcp-for-beginners](https://github.com/microsoft/mcp-for-beginners) | 17.2k | the curriculum |
| [hangwin/mcp-chrome](https://github.com/hangwin/mcp-chrome) | 12.4k | browser as server |
| [modelcontextprotocol/registry](https://github.com/modelcontextprotocol/registry) | 7.2k | the registry |

## Editors and IDEs (7)

zed alone at 89.9k★ proves a from-scratch Rust editor has a seat. continue re-branded
itself as an "open-source coding agent" (35.8k★) — the industry's move in miniature: an
editor is no longer where you type code, it is where you dispatch agents.

| Project | Stars | In one line |
|---|---|---|
| [zed-industries/zed](https://github.com/zed-industries/zed) | 89.9k | Rust, ACP birthplace |
| [neovim/neovim](https://github.com/neovim/neovim) | 102.2k | the agent-plugin base |
| [coder/code-server](https://github.com/coder/code-server) | 79.2k | VS Code on a server |
| [continuedev/continue](https://github.com/continuedev/continue) | 35.8k | extension → agent |
| [helix-editor/helix](https://github.com/helix-editor/helix) | 46.1k | modal, minimal |
| [lapce/lapce](https://github.com/lapce/lapce) | 38.8k | Rust |
| [TabbyML/tabby](https://github.com/TabbyML/tabby) | 33.9k | self-hosted completion |

## Local inference (5)

The numbers argue before anyone does: agentic work does not have to cross the cloud,
and "my data stays on my machine" is a real pull.

| Project | Stars | In one line |
|---|---|---|
| [ollama/ollama](https://github.com/ollama/ollama) | 180.4k | easiest local models |
| [ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp) | 127.5k | the original runtime |
| [vllm-project/vllm](https://github.com/vllm-project/vllm) | 91.2k | high-performance serving |
| [exo-explore/exo](https://github.com/exo-explore/exo) | 47.3k | personal-device clusters |
| [janhq/jan](https://github.com/janhq/jan) | 44.4k | desktop local AI |

## Terminal tooling (6)

This layer explains why TUI agents win so easily: the terminal stack is already there
and very healthy. ast-grep — structural grep — is what several agent CLIs use internally.

| Project | Stars | In one line |
|---|---|---|
| [junegunn/fzf](https://github.com/junegunn/fzf) | 82.9k | fuzzy finder |
| [BurntSushi/ripgrep](https://github.com/BurntSushi/ripgrep) | 68.1k | fast grep |
| [sharkdp/bat](https://github.com/sharkdp/bat) | 60.4k | modern cat |
| [starship/starship](https://github.com/starship/starship) | 59.8k | polyglot prompt |
| [sxyazi/yazi](https://github.com/sxyazi/yazi) | 42.0k | TUI file manager |
| [ast-grep/ast-grep](https://github.com/ast-grep/ast-grep) | 15.8k | AST-aware grep |

## The one-month-old wave (5 — created after Aug 8)

Most interesting to anyone building agents: unlazy (3.2k★) packages "completion
discipline" — an acceptance ledger written first, runnable gates, reports backed by
evidence — into a single installable skill (`npx skills add`, via vercel-labs' skills
CLI). The philosophy of "gates, not self-reports" is being boxed and shipped like a
package.

| Project | Stars | In one line |
|---|---|---|
| [guillaumemeyer/watermarks-remover](https://github.com/guillaumemeyer/watermarks-remover) | 21.3k | privacy-first |
| [CopilotKit/OpenBot](https://github.com/CopilotKit/OpenBot) | 4.4k | AI coworkers with their own machine |
| [Hisn00w/ASu-skills](https://github.com/Hisn00w/ASu-skills) | 4.0k | job-specific skills |
| [yetone/cumora](https://github.com/yetone/cumora) | 3.5k | chat for agent teams |
| [Leonxlnx/unlazy](https://github.com/Leonxlnx/unlazy) | 3.2k | discipline-as-a-skill |

## Three patterns across the map

**MCP has won the integration layer** — no other protocol has a 94.6k★ catalog or a
Microsoft curriculum; every tool that wants to be callable is shipping itself as an MCP
server.

**Skills are the new packaging unit** — from job-hunting skill packs to an
"anti-laziness" skill, a small human-readable format is being distributed like packages.
Whoever owns a skill kit (like the nine-agent team in [Wakii's agents & kit](/docs/agents-and-kit/))
is standing on the fastest-growing layer.

**Release cadence mirrors process** — claude-code's three releases in four days and
aider's year-long freeze are two ends of one axis; the decision lives in the pipeline,
not the commit count.

## Questions the map leaves open

- opencode reached 205.8k★ in ~16 months with 26.8k forks — where does that velocity
  come from, and what keeps it after the novelty fades?
- `llms.txt` is starting to appear at repo roots — is "AI-friendly repo" becoming a
  documentation standard?
- Skills CLIs promise installs into "every detected agent" — who becomes the npm
  registry of skills, and where does quality control live?
- aider has been frozen for a year yet keeps 48.8k★ — is that "finished" or "lost
  momentum"?
- MCP took the integration layer, ACP targets the editor layer — which standard covers
  agents orchestrating each other, the layer where Wakii's brackets, gates, and
  watchdog live?

This map is a snapshot from 2026-09-08 — it will drift from reality within weeks. But
its shape — harnesses racing, MCP consolidating integration, skills becoming the
packaging unit, local inference big enough to be a foundation — looks like the shape of
at least the rest of 2026.

Wakii — an agentic IDE with a nine-agent team — joins this map from the editor layer,
and builds itself with the very process the harness layer is standardizing. Grab a
build at the [download page](/download/).
