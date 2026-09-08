# ADOPT draft — vllm-project/vllm (batch-3, matrix #24, SF-4/FI-387)

> Draft theo style-guide §10 — SF-6 file tập trung sau review (KHÔNG tự file
> issue từ SF). Grade nguồn: bài `deep-dive-vllm-project-vllm` section
> "Wakii học được gì".

## 1. Pattern

**Mượn abstraction đã kiểm chứng thay vì phát minh từ đầu.** vLLM (91.238
stars, Apache-2.0, theo GitHub API ngày 2026-09-08) lấy page-table của hệ
điều hành làm khung cho toàn bộ tầng quản lý KV-cache — thay vì thiết kế một
cơ chế cấp phát riêng cho LLM serving, nó nhận ra bài toán đã có lời giải
chuẩn trong OS và dịch đúng khung đó sang bài toán của mình.

## 2. Evidence inline

Trích docstring của BlockPool, nơi khung "allocator của OS" hiện rõ trong
code ngày nay:

```python
"""BlockPool that manages KVCacheBlocks.
It provides methods to allocate, free and cache the kv cache blocks. The
free_block_queue stores the free blocks in eviction order to enable
allocation, free, and cache eviction."""
```

- Nguồn: `vllm/v1/core/block_pool.py` @ commit `13cf9e0`, theo GitHub API
  ngày 2026-09-08.
- Bổ sung: hai kỹ thuật mượn từ OS nữa cùng file — prefix cache (page-cache
  hit theo block-aligned) và watermark ("minimum number of KV cache blocks
  to keep free when admitting waiting/preempted requests, to avoid frequent
  preemptions", `vllm/v1/core/kv_cache_manager.py` @ cùng commit).
- Bối cảnh paper: PagedAttention, SOSP 2023 (arXiv 2309.06180) — abstract:
  throughput 2-4× so với hệ thống cùng thời, waste KV-cache "near-zero".

## 3. Đề xuất Wakii

- **Surface áp dụng:** quy trình thiết kế cơ chế mới của story-workflow —
  cụ thể là bước review plan (plan-critic) và các gate kỹ thuật.
- **Wakii đã áp cùng hướng:** gates mượn từ CI; worktree mượn từ git;
  idempotency trong first-run setup của kit.
- **Đề xuất tiếp theo:** thêm một câu kiểm vào checklist thiết kế cơ chế
  mới — "pattern cổ điển nào của OS/DB đã giải lớp bài toán này?" với danh
  sách quét ngắn: refcount (chia sẻ tài nguyên), idempotency log (retry
  an toàn), watermark (tránh thrash khi admitting), copy-on-write (fork
  trạng thái). Kỳ vọng hành vi: cơ chế mới ra đời có tên gốc truy ngược được
  trong discussion/plan thay vì mô tả ad-hoc; rủi ro chính là áp pattern
  máy móc cho bài toán không cùng lớp — checklist chỉ là gợi ý quét, không
  phải bắt buộc dùng.

## 4. Upstream links

- Repo: https://github.com/vllm-project/vllm
- Commit đọc code: https://github.com/vllm-project/vllm/commit/13cf9e05c1eda0bfe5cbfb9344343ca2737d0723
- `block_pool.py`: https://github.com/vllm-project/vllm/blob/13cf9e05c1eda0bfe5cbfb9344343ca2737d0723/vllm/v1/core/block_pool.py
- `kv_cache_manager.py`: https://github.com/vllm-project/vllm/blob/13cf9e05c1eda0bfe5cbfb9344343ca2737d0723/vllm/v1/core/kv_cache_manager.py
- Paper: https://arxiv.org/abs/2309.06180
- Blog post public (sau khi story merge): `/blog/deep-dive-vllm-project-vllm/`
