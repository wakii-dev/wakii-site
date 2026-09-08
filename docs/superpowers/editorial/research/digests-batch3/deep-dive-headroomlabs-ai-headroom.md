# headroomlabs-ai/headroom — research digest (batch-3, matrix #14)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: headroomlabs-ai/headroom
- facet: mcp
- stars @ 2026-09-08: 70491 (re-probe SF-3/T2 cùng ngày — skeleton SF-1 ghi 70460, sao dao động trong ngày; bài dùng 70.491)
- license (GitHub API 2026-09-08): Apache-2.0
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`; re-probe riêng SF-3/T2: stars 70491 · pushed 2026-09-07T20:31:18Z · archived false)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## README notes (đọc 2026-09-08)

- Headroom = "context compression layer for AI agents": nén tool output, log,
  RAG chunks, files, lịch sử hội thoại TRƯỚC khi tới LLM. Chạy local, không
  gửi nội dung đi đâu để nén. Quote gốc: "Headroom compresses everything your
  AI agent reads — tool outputs, logs, RAG chunks, files, and conversation
  history — before it reaches the LLM."
- 4 mode phân phối: library (`compress(messages)` Python/TS) · proxy
  (`headroom proxy --port 8787`) · agent wrap (claude/codex/grok/copilot/
  cursor/aider/… ~18 agent) · MCP server (headroom_compress,
  headroom_retrieve, headroom_stats).
- Điểm khác biệt cốt lõi: (1) nén theo TYPE (router chọn compressor), (2) CCR
  — bản gốc lưu cục bộ, model lấy lại bằng tool khi cần (nén = dời thời điểm
  đọc, không mất thông tin), (3) CacheAligner bảo vệ KV-cache prefix của
  provider, (4) demo hero: log 10.144 → 1.260 token, dòng FATAL còn nguyên.
- Benchmark tự công bố (README, seed offline, chạy lại được, truy 2026-09-08):
  SRE incident 55.957 → 24.340 token (57%); codebase exploration 58.801 →
  33.895 (42%); GitHub issue triage 46.067 → 32.429 (30%); code search
  17.199 → 13.597 (21%). Latency 0,21 ms p50 @10K JSON. Output-side shaping
  (verbosity steering + effort routing) — off by default, estimated-with-CI.

## Architecture (đọc code @ sha e67b3c8a29443a60d6b0018fb22f525c5cd7e709)

- `crates/headroom-core/` (Rust core): transforms/smart_crusher (JSON crusher
  ~25 file: analyzer/anchors/classifier/compaction…), transforms/
  code_compressor.rs, kompress.rs, log_compressor.rs, search_compressor.rs,
  diff_compressor.rs; pipeline/orchestrator + offloads + reformats;
  tokenizer (tiktoken/hf); relevance (bm25/embedding/hybrid); CCR backends
  (in_memory/sqlite/redis).
- Hai bất biến đáng học:
  1. **Tool-pair atomicity** — `transforms/safety.rs`: tool_use và
     tool_result phải được nén như MỘT đơn vị ("compressing one but not the
     other desynchronizes the conversation…"); nhận cả shape OpenAI lẫn
     Anthropic; vi phạm → 400 upstream.
  2. **Error preservation** — `transforms/smart_crusher/error_keywords.rs`:
     đúng 12 từ khoá (error, exception, failed, failure, critical, fatal,
     crash, panic, abort, timeout, denied, rejected); item chứa từ khoá được
     giữ nguyên ("better to over-preserve than to drop a real error item").
     Có test khoá count=12 khớp port Python.
- **REALIGNMENT/** — thư mục tự audit công khai ngay gốc repo: mental model
  cũ sai ("nén = chọn cái gì bỏ khỏi lịch sử"), 5 cache-killer bug, ~10K LOC
  thừa, kế hoạch viết lại 9 phase / 40 PR; model mới: "passthrough is sacred;
  compress only the live zone, type-aware, hash-keyed, position-preserving,
  with side-channel metadata". `live_zone.rs` + pipeline/offloads trong tree
  cho thấy Phase B đã vào core.
- Python vẫn tồn tại song song (`headroom/` — CLI, integrations/mcp/server.py,
  ccr/mcp_server.py, learn, memory) — Phase H (Python retirement) chưa xong.

## Releases (gh API 2026-09-08)

| Tag | Ngày |
|---|---|
| v0.37.0 | 2026-08-27 |
| v0.36.5 | 2026-08-22 |
| v0.36.4 | 2026-08-22 |
| v0.36.3 | 2026-08-21 |
| v0.36.2 | 2026-08-21 |
| v0.36.1 | 2026-08-21 |

Cadence: 6 release trong tuần 2026-08-21 → 2026-08-27. Release gần nhất
**v0.37.0 ngày 2026-08-27**. pushed 2026-09-07 — repo đang phát triển mạnh.

## Wakii grading

- **ADOPT — bảo toàn lỗi nguyên văn trong story memory**: nguyên tắc
  over-preserve của error_keywords áp vào post-task ritual — mục "what went
  wrong" chép nguyên văn dòng lỗi + lệnh gây lỗi (không paraphrase), để SF
  kế tiếp grep/reproduce được. Biên độ hẹp: 1 dòng lỗi + 1 lệnh mỗi entry.
  → adopt-draft đã viết.
- **DIRECTION — stable-prefix/live-tail cho context pack**: Wakii có context
  pack (analyze once, inherit many); Headroom thêm trục "phần ổn định không
  bị biến đổi, chỉ nén phần đầu hay đổi". Điều kiện lên ADOPT: đo được token
  cost của pack trước/sau.
- **WATCH — output shaping + cross-agent memory**: phụ thuộc tham số provider
  đang đổi nhanh / vượt phạm vi một phiên. Lên DIRECTION khi ổn trên ≥2
  provider không vỡ cache prefix.
- N/A: proxy/wrap deployment modes (Wakii không phải proxy; người dùng tự
  chọn cho harness của họ).

## Angle đã dùng (unique vs các bài facet mcp khác)

Kinh tế học của context window + hai bất biến khi nén (tool-pair atomicity,
error preservation) + tự audit công khai (REALIGNMENT). Không đụng góc
ecosystem-map (#8), reference-impl (#9), long-term-memory (#17), học liệu
(#20), browser-control (#21), registry (#22).
