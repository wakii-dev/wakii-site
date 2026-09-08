---
title: "llama.cpp: efficient LLM inference from CPU to the edge"
description: "Inside the original C/C++ inference engine of local LLM: quantization from 1-bit to 8-bit, 17 backends from x86 CPUs to phones, and a strict AI contribution policy worth studying."
pubDate: "2026-10-03"
category: "tech"
tags: ["architecture", "oss", "release"]
draft: false
heroImage: "/blog/heroes/deep-dive-ggml-org-llama-cpp.png"
---

Running an LLM sounds like a workstation GPU problem — but most real runs happen where no GPU exists: CPU-only laptops, Macs, the phone in your pocket. The engine named most often there is llama.cpp: pure C/C++, zero dependencies — 127,477 stars, MIT license (per GitHub API on 2026-09-08). The Ollama post in this series dissected the one-command experience layer, which uses llama.cpp as its backend; this one goes a floor below: swappable backends, quantization, and the nightly cadence of an infrastructure repo.

TL;DR:

- llama.cpp is a pure C/C++ inference engine built on the ggml library, aiming for performance across a "wide range of hardware" — x86, Apple Silicon, down to phone NPUs.
- Quantization is the core philosophy: the enum in `ggml.h` spans 1-bit (IQ1_S/M), 4-bit (Q4_K, MXFP4) to 8-bit (Q8_0) — 56 type definitions in one header.
- Backends are not hardwired: the registry in `ggml/src/` scans, loads libraries, and picks the highest-scoring backend out of 18 backend directories (the README table lists 17).
- Ship cadence: stable release v0.4.0 on 2026-09-04, yet 12 nightly b108xx builds landed in ~27 hours (per GitHub API on 2026-09-08).
- The repo governs AI contributions with a "100% responsible for every line" policy and ships its own contribution-guidance skill in-tree.

## One engine, 17 backends — chosen by score

The README states the goal up front: LLM (and VLM) inference "with minimal setup and state-of-the-art performance on a wide range of hardware" ([llama.cpp README](https://github.com/ggml-org/llama.cpp/blob/1744c6b/README.md)). How does dependency-free C/C++ win on so many machines? A two-layer architecture: the [ggml](https://github.com/ggml-org/ggml) library defines tensor operations, while execution is split into swappable backends.

```
GGUF model (quantized weights)
   |
ggml: build tensor graph -> dispatch each op
   |
[cpu] [metal] [cuda] [vulkan] [hip] [sycl] [opencl] [webgpu] [rpc] ...
   |
real devices: x86, Apple Silicon, NVIDIA/AMD/Intel GPUs,
Snapdragon NPU, WebGPU browsers
```

The "Supported backends" table in the README lists 17 backends (clone of 2026-09-08) — from CUDA, Metal, Vulkan, and HIP to Hexagon for Snapdragon, WebGPU for browsers, and even IBM zDNN. The `ggml/src/` directory holds 18 matching backend directories. The instructive part is how backends are found at runtime: `ggml-backend-reg.cpp` scans directories, loads each shared library, and reads the `ggml_backend_score` symbol to score it:

```cpp
auto score_fn = (ggml_backend_score_t) dl_get_sym(handle.get(), "ggml_backend_score");
if (score_fn) {
    int s = score_fn();
    if (s > best_score) {
        best_score = s;
        best_path = entry.path();
    }
}
```

(excerpt from [ggml-backend-reg.cpp @ 1744c6b](https://github.com/ggml-org/llama.cpp/blob/1744c6b/ggml/src/ggml-backend-reg.cpp))

The backend declaring the higher score wins — each backend advertises its own capability in the same header, and the dispatcher trusts only that number. For models larger than total VRAM, the README describes a hybrid mode: part runs on GPU, the rest falls back to CPU.

## Quantization: compressing models from 1-bit to 8-bit

The other half of the performance philosophy is compression. The README lists the range — 1.5-bit, 2-bit, 3-bit, 4-bit, 5-bit, 6-bit, and 8-bit integer quantization "for faster inference and reduced memory use" ([llama.cpp README](https://github.com/ggml-org/llama.cpp/blob/1744c6b/README.md)). Not a slogan — the types sit right in the library header's public enum:

```c
GGML_TYPE_Q8_0    = 8,
GGML_TYPE_Q4_K    = 12,
GGML_TYPE_IQ1_S   = 19,
GGML_TYPE_IQ1_M   = 29,
```

(excerpt from [ggml.h @ 1744c6b](https://github.com/ggml-org/llama.cpp/blob/1744c6b/ggml/include/ggml.h) — a grep counts 56 `GGML_TYPE_*` definitions in this file at the 2026-09-08 clone, including the new MXFP4 and NVFP4 floating 4-bit types)

Most striking is IQ1_S/IQ1_M — super-block 1-bit quantization: each weight keeps roughly one bit of information, and the model still generates tokens. All compression kernels live in `ggml-quants.c` — 5,667 lines of C (2026-09-08 clone). Alongside sit the measurement tools: `tools/quantize` to compress, `tools/imatrix` to measure an importance matrix before compressing, `tools/perplexity` and `tools/llama-bench` to verify quality after — compress, then measure; never compress and trust.

The model format is the engine's own too: GGUF. The models doc says it plainly: "requires the model to be stored in the GGUF file format" — other formats must be converted with the Python scripts shipped in the repo ([docs/models.md @ 1744c6b](https://github.com/ggml-org/llama.cpp/blob/1744c6b/docs/models.md)). The key-value structure is so lean the API is declared in just 211 lines of `gguf.h` — a spec you can read in one sitting.

## Nightly cadence: 12 builds in 27 hours

Infrastructure repos live differently from app repos: the latest stable release, v0.4.0 on 2026-09-04, is the only numbered release among the last 100 (per GitHub API on 2026-09-08); everything else is b108xx nightly builds pouring out with merges:

| Tag | Released (UTC) |
|---|---|
| b10857 | 2026-09-08 11:36 |
| b10856 | 2026-09-08 10:49 |
| b10855 | 2026-09-08 10:03 |
| b10853 | 2026-09-08 03:58 |
| b10852 | 2026-09-08 00:40 |
| b10850 | 2026-09-07 20:03 |
| b10844 | 2026-09-07 19:28 |
| b10842 | 2026-09-07 18:13 |
| b10840 | 2026-09-07 14:31 |
| b10839 | 2026-09-07 11:14 |
| b10837 | 2026-09-07 08:35 |
| b10835 | 2026-09-07 08:08 |

12 builds in ~27.5 hours (per GitHub API on 2026-09-08); the repo's `pushed_at` falls in the same window — 11:36:37 UTC on 2026-09-08. A natural consequence of swappable backends: every merge may touch one of 18 backends, so the pipeline builds continuously so that whoever tests on whichever hardware gets a fresh binary. Public since 2023-03-10, and the cadence has held for over three years.

## An agent-native repo: AGENTS.md and a contribution skill

The first surprise: the tree root has an `AGENTS.md` — not instructions for the agent, but constraints for people using agents. The first principle: "AI-generated code is allowed. What is **not** allowed is submitting code you do not understand" ([AGENTS.md @ 1744c6b](https://github.com/ggml-org/llama.cpp/blob/1744c6b/AGENTS.md)). Contributors own 100% of every line, whoever typed it — because every merged line is maintained indefinitely by a small maintainer team across a vast platform-backend matrix, so "a simpler change that does 90% of the job is often preferable to a complex one that does 100%" ([AGENTS.md @ 1744c6b](https://github.com/ggml-org/llama.cpp/blob/1744c6b/AGENTS.md)).

The repo even ships a skill for contributing agents: `skills/add-new-model/SKILL.md` walks through adding a new model architecture, with memorable constraints — never write the PR description or commit message on the contributor's behalf, require disclosure of any AI-meaningful contribution, sign `Assisted-by:` instead of `Co-authored-by:`. The skill requires reading the `git log` of at least 3 recent model-adding PRs, because the log "shows current convention more reliably than the docs, which can lag behind" ([SKILL.md @ 1744c6b](https://github.com/ggml-org/llama.cpp/blob/1744c6b/skills/add-new-model/SKILL.md)). A 127k-star repo does not trust docs to describe convention — it points the agent at real data.

This reluctance to take an agent's word is familiar to Wakii: the 9-agent kit also separates PM–developer–tester powers so nobody approves their own work, as described in [agents and kit](/docs/agents-and-kit/).

## What Wakii learns

- **ADOPT — a final human owner, nobody signs on your behalf**: llama.cpp bans code "you do not understand" rather than banning AI-generated code; Wakii applies the same principle in "Humans own the irreversibles" — the agent brings the story branch to a clean state and stops, and the merge is a human gate. The 127k-star repo's policy confirms separation of powers is not conservatism — where code lives long across many backends, the person who understands it is the only guardrail.
- **ADOPT — convention from real data, not documentation**: the `add-new-model` skill requires reading the `git log` of 3 recent PRs because docs lag behind; Wakii's Rule 0 shares the spirit — the verifier measures the real dist instead of trusting narrations. Review checklists should point to recently merged examples, not doc descriptions.
- **DIRECTION — repos shipping their own onboarding skill**: `skills/add-new-model` turns repo convention into an agent-readable skill. Wakii could do the same for its product repo: a "add a new agent/skill to the kit" skill following current convention. Not done yet because the kit currently serves the runtime workflow; external contributors are not the primary use case.
- **WATCH — inference reaching the edge**: Hexagon for Snapdragon, WebGPU for browsers, 1-bit quantization — inference now reaches GPU-less places. Upgrade to DIRECTION when a local model runs a full multi-gate story on that hardware — at that point the offline agent team problem reopens.
- **N/A — quantization kernels and backend dispatch**: score-based selection, 1-bit super-blocks, hybrid CPU+GPU — this is tensor-infrastructure engineering; Wakii does not run models in-process — the agent team calls frontier APIs — so this layer never touches orchestration.

Where does llama.cpp sit on the ecosystem map? [The 50-project agentic landscape](/blog/agentic-landscape-50-projects/) lists it as the "original runtime" of local inference, next to [Ollama](/blog/deep-dive-ollama-ollama/) at the experience layer. To see the 9-agent team run on your machine, start with [getting started](/docs/getting-started/).
