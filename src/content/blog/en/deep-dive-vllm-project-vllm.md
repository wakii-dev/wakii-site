---
title: "vLLM: high-throughput LLM serving where memory is the bottleneck"
description: "PagedAttention manages KV-cache the way an OS manages pages. Inside vLLM: why LLM serving throughput is a memory problem, the rhythm of 8 releases in 90 days, and the road from a SOSP 2023 paper to a 91k-star serving engine."
pubDate: "2026-10-12"
category: "tech"
tags: ["architecture", "oss"]
draft: false
---

When an LLM has to serve many requests at once, the GPU is rarely short on math — it is short on room to put it. Every token being generated drags along a KV-cache: the entire "memory" of everything the model has processed so far, sitting on expensive VRAM. The previous generation of serving software allocated this memory with a familiar mistake: reserve the maximum region up front for every request and waste whatever goes unused. vLLM, which started at UC Berkeley's Sky Computing Lab, solved this by borrowing a technique operating systems have proven for decades: paging memory.

TL;DR:

- The bottleneck of LLM serving is not GPU FLOPs but VRAM for KV-cache — how memory is managed decides how many requests run in parallel.
- PagedAttention splits KV-cache into small blocks allocated on demand, like an OS page table: per the SOSP 2023 paper, 2-4x the throughput of contemporary systems with near-zero memory waste.
- Today's code still shows two techniques borrowed from operating systems: a free_block_queue kept in eviction order and a watermark against preemption.
- The release rhythm is dense and steady: 8 releases in 90 days, with the v0.27.1 patch arriving half a day after v0.27.0 (per GitHub API on 2026-09-08).
- From one SOSP 2023 paper to a 91,238-star engine: a model paper-to-production case.

## Throughput is a memory problem, not a compute problem

Decoding generates tokens sequentially: every request must hold the KV of everything processed so far, and that region grows with context length. Running one request on a personal machine rarely hits the ceiling; the problem appears when serving many requests — which is exactly what separates this post from single-user local LLM tools. The previous serving generation required each request to reserve one contiguous memory region sized for the maximum allowed length. Since real prompts are usually far shorter, the difference became dead memory; add fragmentation as requests arrive and leave unevenly, and the usable capacity for a batch shrinks — and a smaller batch means lower throughput. The original paper names the cause directly: memory wasted by fragmentation and redundant duplication.

> KV cache memory could be significantly wasted by fragmentation and redundant duplication — abstract of the PagedAttention paper, [arxiv.org/abs/2309.06180](https://arxiv.org/abs/2309.06180)

The two allocation styles, side by side:

```
Preallocation: every request holds the full max_length region
  req A  [██████████░░░░░░░]  uses 10/17 — 7 slots dead
  req B  [████░░░░░░░░░░░░░]  uses 4/17 — 13 slots dead

PagedAttention: blocks allocated on demand
  req A  [b0][b1][b2]
  req B  [b3][b4]
  req C  [b5][b6][b7][b8]
  freed blocks return to the free queue, reused across requests
```

*Source: diagram drawn by the author from the mechanism described in the SOSP 2023 paper (arXiv 2309.06180), cross-checked against the vLLM code on 2026-09-08.*

## PagedAttention: borrowing the OS page table for KV-cache

Operating-system virtual memory lets each process see a contiguous address space while the data actually sits scattered across physical pages. PagedAttention does precisely that to KV-cache: a request's token sequence looks contiguous, but the data lives in scattered physical blocks, stitched together by a block table. The direct consequences: no more reserving the maximum region — blocks are allocated when real tokens need them — and multiple sequences can point at the same block holding a shared prompt instead of duplicating it.

In today's code this lives in `vllm/v1/core/block_pool.py`, and one short docstring explains the whole mechanism:

```python
"""BlockPool that manages KVCacheBlocks.
It provides methods to allocate, free and cache the kv cache blocks. The
free_block_queue stores the free blocks in eviction order to enable
allocation, free, and cache eviction."""
```

*Source: `vllm/v1/core/block_pool.py` @ commit `13cf9e0`, per GitHub API on 2026-09-08 — [github.com/vllm-project/vllm/blob/13cf9e05c1eda0bfe5cbfb9344343ca2737d0723/vllm/v1/core/block_pool.py](https://github.com/vllm-project/vllm/blob/13cf9e05c1eda0bfe5cbfb9344343ca2737d0723/vllm/v1/core/block_pool.py)*

Anyone who has read an allocator's source will recognize the structure immediately: a free list, a hash map, an eviction order. It did not appear by accident — the original paper framed itself as "an OS for LLM serving," and the code keeps that frame.

## Two more techniques borrowed from the OS: prefix cache and watermark

The next pair sits in `vllm/v1/core/kv_cache_manager.py`. First, prefix caching: before computing, the engine looks for the longest block-aligned stretch of the prompt that already has KV in the cache — an OS page-cache hit in spirit. Requests sharing one long system prompt reuse the common part instead of recomputing it. One small note in the code shows where the mechanism stops:

```python
# NOTE: When all tokens hit the cache, we must recompute the last token
# to obtain logits. Thus, set max_cache_hit_length to prompt_length - 1.
```

*Source: `vllm/v1/core/kv_cache_manager.py` @ commit `13cf9e0`, per GitHub API on 2026-09-08 — [github.com/vllm-project/vllm/blob/13cf9e05c1eda0bfe5cbfb9344343ca2737d0723/vllm/v1/core/kv_cache_manager.py](https://github.com/vllm-project/vllm/blob/13cf9e05c1eda0bfe5cbfb9344343ca2737d0723/vllm/v1/core/kv_cache_manager.py)*

Second, the watermark: when admitting new requests, the manager keeps a minimum number of blocks free. The intent is written right into the comment:

```python
# Watermark: minimum number of KV cache blocks to keep free when
# admitting waiting/preempted requests, to avoid frequent preemptions.
```

*Source: same link as above, same file.*

Without that reserve, the system would keep admitting requests and then reclaim blocks mid-flight — thrashing, the very thing a kernel avoids when managing free pages. Two small details, one shared ancestry: operating-system resource discipline.

## The release rhythm: 8 releases in 90 days

Large projects tend to drift into sparse release schedules. vLLM runs the other way: the last 15 releases span v0.19.1 (Apr 18) to v0.28.0 (Aug 26) — 8 of them within 90 days, averaging more than one every two weeks:

| Tag | Release date |
| --- | --- |
| v0.28.0 | 2026-08-26 |
| v0.27.1 | 2026-08-11 |
| v0.27.0 | 2026-08-10 |
| v0.26.0 | 2026-07-27 |
| v0.25.1 | 2026-07-14 |
| v0.25.0 | 2026-07-11 |
| v0.24.0 | 2026-06-29 |
| v0.23.0 | 2026-06-15 |

*Source: `gh api "repos/vllm-project/vllm/releases?per_page=15"`, per GitHub API on 2026-09-08.*

The detail worth more than the count: v0.27.1 shipped half a day after v0.27.0 (21:18 UTC → 10:47 UTC the next day) — a patch cut the moment a defect surfaced, not folded into the next cycle. Wakii follows the same small-and-fast philosophy: desktop releases 1.4.198 and 1.4.199 shipped on the same day, 2026-09-05, each tied to a verified feature set — the item-by-item release inventory has [its own post](/blog/oss-release-roundup-14x/).

## From a SOSP 2023 paper to a 91k-star serving engine

The PagedAttention paper appeared at SOSP 2023 (Symposium on Operating Systems Principles), and its citation sits right in the repo's README — a rare lineage: an academic idea turned into infrastructure the ecosystem builds on. Current pulse, per GitHub API on 2026-09-08:

| Metric | Value |
| --- | --- |
| Stars | 91,238 |
| License | Apache-2.0 |
| Contributors | over 2,000 (per README) |
| Supported model architectures | over 200 (per README) |
| Latest commit | 2026-09-08 — the research day itself |

*Source: `gh api repos/vllm-project/vllm` + README, per GitHub API on 2026-09-08.*

The README opens with a one-line positioning: "Easy, fast, and cheap LLM serving for everyone" ([vllm-project/vllm](https://github.com/vllm-project/vllm)). The OpenAI-compatible API server means any client written against the OpenAI standard connects out of the box — a big part of why an engine becomes the default choice is ecosystem gravity, not a single benchmark.

Wakii runs no GPUs and serves no models, but the organizing lesson transfers: Wakii's pipeline — idea → plan → epic → SF → gates — is also designed around one scarce resource, the agent's context, with a check at every step; it is documented in [the story-workflow docs](/docs/story-workflow/).

## What Wakii learns

- **ADOPT — borrow proven abstractions instead of inventing from scratch.** vLLM took the OS page table as the frame for KV-cache; Wakii has walked the same path by borrowing gates from CI (see [the CI-gates analysis](/blog/arch-ci-gates/)) and worktrees from git for story-workflow. Concrete proposal: when designing a new mechanism, scan the classic OS/database patterns first (refcount, idempotency log, watermark) — each one is a ready answer to a class of problems that already happened.
- **DIRECTION — scheduled release discipline with fast hotfixes.** vLLM holds a better-than-one-release-per-two-weeks rhythm and cut its patch half a day after the defect surfaced; Wakii has proven it can ship two releases in one day, but the gaps between cycles are uneven. A direction worth considering: a minimum cadence for the desktop + mobile release lines instead of feature-driven batches.
- **WATCH — vLLM is the default choice if Wakii ever needs multi-session local inference.** vLLM's strength is concurrent serving; Wakii currently orchestrates agents through cloud APIs and does not touch that need. The condition to move WATCH to DIRECTION: a feature that runs local models with several concurrent sessions.
- **N/A — kernel-level optimization.** CUDA kernels, quantization, CUDA graphs: outside Wakii's product surface, which does not build GPU infrastructure.

If you are looking for a way to orchestrate AI agents with gates, evidence, and a clear process, try Wakii — or read [the getting-started docs](/docs/getting-started/) to run your first story.
