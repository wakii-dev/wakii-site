# ADOPT draft — langchain-ai/langchain (batch-3, matrix #4)

> Draft theo rubric style-guide §10 (FI-383 D5). SF-6 file TẬP TRUNG sau review.
> Repo: langchain-ai/langchain — 145,927 stars · MIT (theo GitHub API ngày 2026-09-08).

## Pattern

**Structured human-in-the-loop stop cho tool call rủi ro** (ADOPT): LangChain v1 đặt dừng-chờ-người thành một middleware tháo lắp (`human_in_the_loop`) thay vì điều kiện trong lõi agent — agent dừng bằng `interrupt` của LangGraph và phát ra `ActionRequest` có cấu trúc: tên action, args, mô tả. Người duyệt xong, graph chạy tiếp.

## Evidence inline

- `libs/langchain_v1/langchain/agents/middleware/human_in_the_loop.py` (clone @ `e670c7a`, tree ngày 2026-09-08): import `from langgraph.types import interrupt`; định nghĩa `ActionRequest` TypedDict gồm `name: str`, `args: dict[str, Any]`, `description` — mỗi tool call rủi ro phát một yêu cầu hành động có đủ 3 trường.
- `agents/__init__.py` export đúng 2 tên (`create_agent`, `AgentState`) — surface API agent gọn, hành vi nằm ở 24 module middleware xung quanh (tree ngày 2026-09-08).
- Package split (tree ngày 2026-09-08): `langchain` 1.4.0 = 7 module agent runtime; chains cũ → `langchain-classic` 1.0.8.

## Đề xuất Wakii

- Áp vào: gate payload của kit (surface đã SHIP: gates B0–B5 trong story workflow + mobile gates choice/free-text — Wakii đã có nguyên tắc dừng-chờ-người ở tầng quy trình).
- Hành vi kỳ vọng: mọi executor trả ngữ cảnh quyết định theo một schema thống nhất (tên hành động + tham số + mô tả ngắn) — giống `ActionRequest` — để gate pending đọc được nhất quán trên desktop lẫn story view mobile, và để test gate không phụ thuộc prose tự do của từng agent.
- Rủi ro chính: schema quá cứng sẽ không đủ cho gate dạng brainstorm/hướng đi (free-text dài); cần giữ trường description mở và không ép mọi gate về 3 trường.

## Upstream links

- Repo: https://github.com/langchain-ai/langchain (MIT)
- HITL middleware: https://github.com/langchain-ai/langchain/blob/e670c7a/libs/langchain_v1/langchain/agents/middleware/human_in_the_loop.py
- Agent factory (StateGraph + traceable): https://github.com/langchain-ai/langchain/blob/e670c7a/libs/langchain_v1/langchain/agents/factory.py
- Docs: https://docs.langchain.com/oss/python/langchain/overview
- Bài post public: "bài sẽ live tại /blog/deep-dive-langchain-ai-langchain/ sau khi story merge" (build-in-public đã duyệt 2026-09-07).

## Grade khác (không file issue)

- **DIRECTION** — `init_chat_model` + model_retry/model_fallback: tách lớp gọi model cho kit Wakii (multi-provider readiness).
- **WATCH** — langchain-classic split (cắt legacy thành package riêng) + Deep Agents (planning/subagents built-in).
