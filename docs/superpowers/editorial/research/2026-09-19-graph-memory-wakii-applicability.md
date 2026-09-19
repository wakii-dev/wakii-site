# Wakii applicability — graph memory (graphiti/mem0/graphrag/cognee/letta/hipporag) (2026-09-19)

Đối chiếu với surface thật: markdown-native KG trong `story-team-kit/docs/superpowers/memory/`
(ontology 506 dòng, entities, triples 295, provenance 325 + `story-memory`/`-fuse`/
`-index-hook`/`-parse`) + orchestration task DAG (FI-498 production) + fact-pack ≤2KB.

| # | Pattern (nguồn) | Level | Landed-ở-đâu (nếu adopt) |
|---|---|---|---|
| 1 | **Serving: inject triples vào agent context** (tất cả — điểm chung số 1) | **ADOPT** | `story-fact-pack` thêm component 5 "memory recall": grep triples.md theo keywords của bracket/SF hiện tại (≤5 dòng, cắt theo cap 2KB như component cũ) — KG từ "thư viện" thành "cấp dữ liệu" |
| 2 | **Auto-extraction 2 pha: extract candidate → quyết ADD/UPDATE** (mem0) | **ADOPT** | Mở rộng `story-memory-index-hook`: sau worker_done/lesson, ghi candidate triple vào `memory/inbox.md` (staging) — KHÔNG tự merge; `story-memory-fuse` là gate duy nhất được merge (LLM propose, validator chấm — đúng doctrine kit) |
| 3 | **Temporal validity: fact cũ bị invalid_at, không xoá** (graphiti) | **ADOPT** (nhẹ — convention + 1 rule fuse) | Thêm convention attr `superseded_by=<triple-id>` vào triples.md; fuse rule mới: triple mới mâu thuẫn cũ → KHÔNG refuse nữa mà append + đánh superseded_by (provenance giữ nguyên) — hợp lệ hoá việc state đổi theo thời gian (state=In Progress hôm nay, Done tháng sau) |
| 4 | **Evaluation: sample triples verify ngược provenance** (GraphRAG-Bench idea) | **ADOPT** (nhẹ) | `story-memory-parse` thêm flag `--audit N`: chọn N triple ngẫu nhiên, in provenance cạnh claim để human/agent spot-check — metric thô nhưng bắt drift sớm |
| 5 | **Multi-machine fusion qua git** (tổng hợp graphiti temporal + fuse) | **DIRECTION** | Cần cho FI-458 Phase 2: memory files sync qua git giữa 2 máy; xung đột → fuse replay (refuse vẫn hợp lệ cho conflict THẬT, superseded cho cập nhật hợp lệ). Thiết kế trong SF-4 |
| 6 | **Community summaries phân cấp** (graphrag Leiden) | **WATCH** | Chỉ đáng khi triples > vài nghìn; hiện 295 dòng — grep đủ. Re-đánh giá khi vượt mốc |
| 7 | **PPR multi-hop retrieval** (HippoRAG) | **N/A** | Graph nhỏ + markdown — keyword/grep + đủ; PPR cần index graph in-memory |
| 8 | **Self-editing memory** (letta — agent tự sửa memory blocks) | **N/A** (đúng đắn: từ chối có chủ đích) | Ngược doctrine validator-first; fuse gate là điểm bán hàng của Wakii — không mở |

## Drift vs file cũ nhất (gitdiagram, 18/09)

- Drift lớn: ngày 18/09 còn ghi "serving vào context = gap chưa ai giải"; hôm nay research
  cho thấy **4 repo ~150k★ tổng cùng giải đúng bài đó** — gap của Wakii là gap phổ biến
  của cả category, và 2/4 ADOPT đầu là chép bài có sẵn chứ không phải phát minh lại.
- Ý "mini review-bench" từ entry open-code-review (18/09) khớp pattern #4 (evaluation)
  — hai entry hội tụ về cùng nhu cầu: **đo được chất lượng thay vì cảm tính**.
- Không có entry cũ nào bị thay thế — gitdiagram (diagram) và graph memory (memory) là
  hai lớp khác nhau của cùng doctrine validator-first.

## Nguồn

- Repos: GetZep/graphiti, mem0ai/mem0, microsoft/graphrag, topoteretes/cognee, letta-ai/letta,
  OSU-NLP-Group/HippoRAG — `gh api`, retrieval 2026-09-19 (stars/cadence ghi trong digest)
- Surface Wakii: `story-team-kit/docs/superpowers/memory/` (đếm dòng thật 19/09) + kit.json
  provides (story-memory×4 bins)
