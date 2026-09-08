# langchain-ai/langchain — research digest (batch-3, matrix #4)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: langchain-ai/langchain
- facet: multi-agent
- stars @ 2026-09-08: 145923
- license (GitHub API 2026-09-08): MIT
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`)
- re-probe 2026-09-08 (SF-2, gh api trực tiếp): stars 145927 · forks 24372 · open_issues 458 · created 2022-10-17 · pushed 2026-09-08T08:37:32Z — dùng số này trong bài

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## README notes (điền 2026-09-08, clone/tree @ e670c7a)

- Tagline README: "The agent engineering platform." — tự định vị là PLATFORM, không còn "library".
- Mô tả: framework build agents + LLM apps; "chain together interoperable components and third-party integrations"; nhấn "future-proofing decisions as the underlying technology evolves".
- Ecosystem (README section): Deep Agents (planning/subagents/file system built-in) · LangGraph (low-level orchestration) · Integrations (models/tools/vector stores) · LangSmith (evals/observability/debug) · LangSmith Deployment (long-running stateful).
- Quickstart: `uv add langchain` + `init_chat_model("openai:gpt-5.5")` — interop qua một chuỗi.
- Audience: dev build AI apps/agents; JS/TS tách repo riêng (langchainjs).

## Architecture (điền 2026-09-08, clone @ e670c7a)

- Monorepo `libs/`: `core` (langchain-core), `langchain_v1` (= package "langchain" 1.4.0), `langchain` (= package "langchain-classic" 1.0.8), `partners`, `text-splitters`, `model-profiles`, `standard-tests`.
- **Điểm cốt lõi (góc bài)**: pyproject `libs/langchain_v1` name="langchain" v1.4.0 — chỉ 7 module (agents, chat_models, embeddings, mcp, messages, rate_limiters, tools); pyproject `libs/langchain` name="langchain-classic" v1.0.8 — chains cũ gom hết vào đây. Package `langchain` trên PyPI KHÔNG còn chứa chains.
- `agents/__init__.py` export đúng 2 tên: `create_agent`, `AgentState`.
- `agents/factory.py`: import StateGraph + ToolNode từ langgraph, `traceable` từ langsmith → runtime = LangGraph, trace = LangSmith, interface = langchain. Tách 3 vai.
- `agents/middleware/` = 24 module (human_in_the_loop, summarization, context_editing, todo, model_retry, model_fallback, model_call_limit, pii, shell_tool, tool_error, tool_retry, tool_call_limit, tool_selection, tool_emulator, file_search, provider_tool_search...). HITL dùng `interrupt` từ langgraph + `ActionRequest` TypedDict (name/args/description) — decision gate dạng middleware.
- `langchain_core/agents.py` docstring: schema giữ cho backwards compatibility, quote "New agents should be built using the `langchain` library".

## Releases (gh api releases?per_page=15 @ 2026-09-08)

- `langchain`: 1.3.16 (2026-08-20) → 1.3.17 (2026-08-25) → 1.3.18 (2026-08-27) → 1.4.0a1..a4 (2026-08-27 → 2026-09-02) → **1.4.0 (2026-09-03)**.
- `langchain-core`: 1.6.1 (2026-08-27) → 1.6.2 (2026-09-04). Kèm partner packages version riêng (langchain-anthropic 1.7.1, langchain-fireworks 1.6.1, langchain-perplexity 1.4.1).
- Cadence: patch mỗi vài ngày; alpha gần như hằng ngày trước major; MỖI PACKAGE một version riêng (monorepo release train).

## Wakii grading (style-guide §8 — so surface thật: docs story-workflow + agents-and-kit)

- **ADOPT** — dừng có cấu trúc chờ người: HITL middleware (`interrupt` + `ActionRequest` name/args/description) ≈ gates B0–B5 + mobile choice/free-text gates của Wakii (đã SHIP ở tầng quy trình). Đề xuất: shape `ActionRequest` làm schema tham chiếu cho gate payload trong kit.
- **DIRECTION** — hoán đổi model qua interface chuẩn (`init_chat_model` + model_retry/model_fallback ở rìa): kit Wakii ghép chặt 1 agent runtime; hướng tách lớp gọi model.
- **WATCH** — cắt legacy thành package riêng (langchain-classic 1.0.8) + Deep Agents (planning/subagents built-in, đụng tầng story team).
- Không dùng N/A — cả 3 grade đều có evidence trong bài.
