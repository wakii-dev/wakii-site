# vllm-project/vllm — research digest (batch-3, matrix #24)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: vllm-project/vllm
- facet: inference
- stars @ 2026-09-08: 91238 (re-probe T2 cùng ngày — skeleton probe sáng ghi 91228; drift +10 trong ngày, dùng 91238)
- license (GitHub API 2026-09-08): Apache-2.0
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh` + re-probe `gh api repos/vllm-project/vllm` T2)
- pushed @ 2026-09-08T11:33:33Z (repo active, commit trong ngày research)
- HEAD main @ 2026-09-08: `13cf9e05c1eda0bfe5cbfb9344343ca2737d0723`

## README notes (đọc 2026-09-08)

- Tagline: "Easy, fast, and cheap LLM serving for everyone"
- Gốc: Sky Computing Lab, UC Berkeley; "over 2000 contributors" (README 09-08)
- Điểm khác biệt: PagedAttention (quản lý attention key/value memory), continuous
  batching, chunked prefill, prefix caching; 200+ model architectures;
  OpenAI-compatible API server (cả Anthropic Messages API + gRPC)
- Paper: arXiv 2309.06180 — "Efficient Memory Management for Large Language Model
  Serving with PagedAttention", SOSP 2023 (citation bibtex trong README);
  abstract: throughput 2-4× vs FasterTransformer/Orca, KV-cache waste "near-zero"

## Architecture (code đọc 2026-09-08 @ sha 13cf9e0)

- `vllm/v1/core/block_pool.py` — BlockPool: "free_block_queue stores the free
  blocks in eviction order to enable allocation, free, and cache eviction";
  BlockHashToBlockMap = cache hash→block cho prefix caching (note: không
  de-dup để block table append-only)
- `vllm/v1/core/kv_cache_manager.py` — watermark: "minimum number of KV cache
  blocks to keep free when admitting waiting/preempted requests, to avoid
  frequent preemptions"; `get_computed_blocks`: prefix-cache hit block-aligned,
  recompute token cuối (max_cache_hit_length = prompt_length - 1)
- Tầng v1: scheduler (vllm/v1/core/sched) → KVCacheManager → coordinator → BlockPool

## Releases (API 2026-09-08)

- 15 releases gần nhất: v0.19.1 (2026-04-18) → v0.28.0 (2026-08-26, tag mới nhất)
- 90 ngày (2026-06-10 → 2026-09-08): **8 releases** — v0.23.0 06-15 · v0.24.0 06-29 ·
  v0.25.0 07-11 · v0.25.1 07-14 · v0.26.0 07-27 · v0.27.0 08-10 · v0.27.1 08-11 ·
  v0.28.0 08-26
- Hotfix nhanh: v0.27.1 sau v0.27.0 ~13.5 giờ (publish_at: v0.27.0 21:18 UTC 2026-08-10 → v0.27.1 10:47 UTC 2026-08-11 — số chính xác dùng trong bài EN §release rhythm)

## Wakii grading (style-guide §8)

- **ADOPT** — mượn abstraction đã kiểm chứng (vLLM lấy page-table của OS làm
  khung KV-cache; Wakii đã mượn gates từ CI + worktree từ git cho
  story-workflow — đề xuất tiếp tục quét pattern OS/DB cổ điển)
- **DIRECTION** — kỷ luật cadence: 8 releases/90 ngày, hotfix nửa ngày
  (so Wakii: hai bản cùng ngày 2026-09-05 nhưng nhịp giữa các đợt chưa đều)
- **WATCH** — vLLM là serving layer mặc định nếu Wakii cần local inference
  đa session (hiện chỉ orchestration qua API cloud; điều kiện đổi: tính năng
  local model + nhiều session đồng thời)
- **N/A** — tối ưu kernel CUDA / quantization / CUDA graph (ngoài product surface)
