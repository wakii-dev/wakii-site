# crewAIInc/crewAI — research digest (batch-3, matrix #27)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: crewAIInc/crewAI
- facet: multi-agent
- stars @ 2026-09-08: 58230
- license (GitHub API 2026-09-08): MIT
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`)
- re-probe (gh api trực tiếp, cùng ngày 2026-09-08): stars **58233** · pushed
  2026-09-08T07:22:24Z · license MIT · archived false — bài cite 58.233

## Research (đã điền — SF-4, T5, ngày 2026-09-08)

- [x] README notes — "open-source Python framework… for building
  production-ready multi-agent workflows"; hai chế độ: **Crews** ("Optimize for
  autonomy and collaborative intelligence with role-based AI agents") và
  **Flows** ("event-driven automations that combine precise workflow control,
  single LLM calls, and native support for Crews"). README dẫn ví dụ mẫu tên
  "Write Job Descriptions" — mô hình tinh thần là tuyển nhân sự, không phải
  viết kịch bản. Có CrewAI AMP Suite (commercial control plane) — không phải
  chủ đề bài.
- [x] Architecture — package tại `lib/crewai/src/crewai/` (HEAD main
  `34199c21b724d805608b59745cdb94006c8fdcd2` @ 2026-09-08):
  - `agents/agent_builder/base_agent.py` L274-276: `role` / `goal` /
    `backstory` = typed Pydantic field; L785-801 giữ `_original_*` và
    `interpolate_only(...)` nội suy inputs vào từng field trước mỗi run.
  - `agent/core.py`: field `guardrail` ("Function or string description of a
    guardrail to validate agent output") + `guardrail_max_retries` default 3.
  - `process.py`: enum `Process` = sequential | hierarchical (TODO consensual).
  - `crew.py` L164 `class Crew(FlowTrackable, BaseModel)`; validator L726-732:
    hierarchical bắt buộc `manager_llm`/`manager_agent`.
  - `flow/flow.py`: `Flow` + DSL `and_/listen/or_/router/start` từ
    `crewai.flow.dsl`; `flow/flow_definition.py` L1: "the serializable,
    declarative Flow contract"; `flow/dsl/_start.py` ("Marks a method as a
    flow's starting point") + `_listen.py` ("Creates a listener that executes
    when specified conditions are met").
- [x] Releases — 10 releases 05-08 → 04-09-2026: 1.15.11 (08-05) … 1.15.20
  (09-04); 1.15.19 + 1.15.20 cùng ngày 04-09 (gh api releases?per_page=10,
  ngày probe 2026-09-08).
- [x] Wakii grading — **ADOPT** đội agent theo vai declarative (đã áp: 9 agent
  bảng "Agent | Job" trong docs agents-and-kit; đề xuất kế: interpolate inputs
  vào role card như `interpolate_only`) · **DIRECTION** guardrail per-agent có
  trần retry (B0–B5 ở ranh giới stage; crewAI rào tại biên agent, max 3
  retries — ứng viên: task-executor tự lint/test trước review) · **WATCH**
  hierarchical manager LLM phân việc động (Wakii = DAG tĩnh trong plan; đổi
  thành DIRECTION khi cần tái phân việc giữa chừng không muốn sửa plan).
