# pydantic/pydantic-ai — research digest (batch-3, matrix #32)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: pydantic/pydantic-ai
- facet: multi-agent
- stars @ 2026-09-08: 19788 (probe SF-1) — re-probe cùng ngày 2026-09-08: 19794
- license (GitHub API 2026-09-08): MIT
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## Research notes (điền 2026-09-08, @ HEAD main `62f1e8302a356d09962c55117f41a282cf1eb243`)

### README notes

- Tagline: "Every model, every interface, typed end to end." — "the Python AI SDK:
  a typed, extensible agent loop with every model a string swap away".
- Cho ai: từ data extraction typed tới coding agent dài hạn (Pydantic AI Harness
  bán riêng repo `pydantic-ai-harness`, snap-on qua capabilities: memory,
  sub-agents, context management, coder).
- Khác biệt cốt lõi: validation-first — tool args + output là hợp đồng pydantic;
  README: "arguments are validated before your code runs, and the run is
  guaranteed to return a `Sentiment`".
- Badge coverage 100% trên README (không verify pipeline — chỉ ghi nhận badge).

### Architecture (code đọc thật @ `62f1e830`)

- Package chính nằm ở `pydantic_ai_slim/pydantic_ai/` (root còn `pydantic_graph`,
  `pydantic_evals`, `clai`).
- `_function_schema.py`: `FunctionSchema` dataclass — mỗi tool = function +
  `validator: SchemaValidator` + `json_schema: ObjectJsonSchema`; docstring harvest
  qua `._griffe` thành description. Nửa mô tả cho model + nửa chặn khi gọi sai.
- `tool_manager.py` `_validate_tool_args` (dòng ~312-354): `validator.validate_json`
  / `validate_python` chạy TRƯỚC tool; lỗi bọc qua `_wrap_error_as_retry` →
  `RetryPromptPart` (message first-class đưa về model, budget retry per tool).
- `_run_context.py`: `RunContext[AgentDepsT]` dataclass với `deps` field — DI kiểu
  FastAPI Depends; test tool = ctx giả, không model.
- `docs/multi-agent-applications.md`: 5 mức phức tạp (single → delegation →
  hand-off → graph → deep agents); delegation = "an agent delegates work to another
  agent, then takes back control"; SubAgents capability: "Each delegation runs in
  its own run with its own message history, so a delegate never sees the parent
  conversation" (quote ≤25 từ, có attribution trong bài).
- So phân vị T9 (openai-agents, handoffs): pydantic-ai để agent trong tool, control
  quay về caller — 1 câu so trong bài, không lặp góc.

### Releases (theo GitHub API ngày 2026-09-08)

10 release gần nhất: v2.34.0 (08-25), v2.35.0 (08-26), v2.35.1 (08-27), v2.35.3
(08-28), v2.36.0 (08-29), v2.37.0 (09-01), v2.38.0 (09-03), v2.39.0 (09-04),
v2.40.0 (09-05), v2.41.0 (09-08) — 10 release / 14 ngày; release cuối v2.41.0 phát
đúng ngày probe; push gần nhất vào main cùng ngày 2026-09-08.

### Wakii grading (đã viết trong bài)

- ADOPT — lỗi bắt ở biên = nguyên tắc gate máy Wakii (lint lúc viết, parity lúc
  build, schema frontmatter lock) — lý do: lỗi gần chỗ sinh ra thì rẻ.
- DIRECTION — output schema nhẹ cho report DONE/BLOCKED giữa task-executor và
  coordinator (chưa áp: quy mô hiện tại prose đọc kịp).
- WATCH — delegation có biên ngữ cảnh (pattern SubAgents) nếu orchestration chuyển
  peer-delegation.

### Đã viết

- Bài: `src/content/blog/vi/deep-dive-pydantic-pydantic-ai.md` (1352 từ) + EN
  mirror (1351 từ) — lint exit 0.
- ADOPT draft: `docs/superpowers/editorial/research/adopt-drafts/adopt-draft-pydantic-pydantic-ai.md`.
