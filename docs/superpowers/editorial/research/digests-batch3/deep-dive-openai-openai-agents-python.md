# openai/openai-agents-python — research digest (batch-3, matrix #31)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: openai/openai-agents-python
- facet: multi-agent
- stars @ 2026-09-08: 29267 (probe riêng T9 cùng ngày; skeleton SF-1 chụp 29265 — drift 2★ trong ngày, bài dùng 29,267)
- license (GitHub API 2026-09-08): MIT
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`; T9 re-probe `gh api repos/openai/openai-agents-python` exit 0 cùng ngày)
- pushed @ 2026-09-08: 2026-09-08T11:37:26Z (repo còn hoạt động mạnh cùng ngày probe)
- HEAD main @ 2026-09-08: `544b8b03b8cf95e62c7f5ebb89adfc4bd66c9d1f` (commits API)

## Research — điền T9 2026-09-08

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
  - "lightweight yet powerful framework for building multi-agent workflows",
    provider-agnostic (Responses + Chat Completions + 100+ LLMs khác).
  - Core concepts (README): Agents / Handoffs ("Delegating to other agents for
    specific tasks") / Tools / Guardrails ("Configurable safety checks for
    input and output validation") / Sessions / Tracing ("Built-in tracking of
    agent runs, allowing you to view, debug and optimize your workflows").
  - Cài `pip install openai-agents`; 4 cách chạy: text agent, sandbox agent,
    realtime agent, voice agent. Hello-world chỉ 2 dòng: `Runner.run_sync(agent, "...")`.
- [x] Architecture — cấu trúc code (`src/agents/` @ `544b8b0`)
  - `agent.py`: `Agent` là một `@dataclass` — `instructions` / `handoffs` /
    `model` / `model_settings` / `input_guardrails` / `output_guardrails` /
    `output_type` / `hooks` / `tool_use_behavior`. Docstring: "An agent is an
    AI model configured with instructions, tools, guardrails, handoffs and more."
  - `handoffs/__init__.py`: `Handoff` dataclass = tool hoá chuyển giao:
    `tool_name` / `tool_description` / `input_json_schema` /
    `on_invoke_handoff` (trả về agent kế tiếp) / `agent_name` /
    `input_filter` (mặc định agent mới thấy toàn bộ lịch sử hội thoại) /
    `strict_json_schema=True`.
  - `guardrail.py`: `InputGuardrail` + `OutputGuardrail` dataclass, hàm check
    trả `GuardrailFunctionOutput`; tripwire = raise
    `InputGuardrailTripwireTriggered` / `OutputGuardrailTripwireTriggered`.
  - `run.py` @ `544b8b0`: hàm `should_cancel_parallel_model_task_on_input_guardrail_trip`
    — tên hàm nói cơ chế: input guardrail chạy SONG SONG với task gọi model,
    tripwire nổ thì cancel task model đang chạy.
  - `tracing/create.py`: span factory theo loại primitive — `agent_span`,
    `handoff_span`, `guardrail_span`, `function_span`, `generation_span`,
    `response_span`, `mcp_tools_span`, `custom_span`… → trace là dữ liệu có
    cấu trúc theo loại sự kiện, không phải log text.
- [x] Releases — cadence + release gần nhất
  - 10 releases gần nhất (GitHub API 2026-09-08): v0.22.1 (2026-09-08) →
    v0.19.0 (2026-07-27). Cadence ~10 releases / 6 tuần, patch nhỏ dày.
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A (style-guide §8)
  - ADOPT — guardrail song song + fail-fast: Wakii đã áp cùng pattern
    (gate máy lint/test/claims chạy trước và độc lập với gate người; nguyên
    tắc gates-not-trust). Evidence bài: docstring input_guardrails + hàm
    cancel-on-trip trong run.py.
  - DIRECTION — trace cấu trúc theo loại span: Wakii có evidence trail dạng
    văn bản (gate logs, outbox, improvements-log); hướng đi: chuẩn hoá log
    pipeline theo loại bước để QA/verify đọc lại bằng máy.
  - WATCH — handoff `input_filter`: Wakii truyền context pack đầy đủ giữa
    agents; nếu chain dài làm pack phình/trùng lặp thì filter lúc chuyển
    giao thành DIRECTION.
  - N/A — realtime/voice/sandbox agents: phần môi trường thời gian thực của
    SDK không đụng bài toán desktop coding agent của Wakii.
