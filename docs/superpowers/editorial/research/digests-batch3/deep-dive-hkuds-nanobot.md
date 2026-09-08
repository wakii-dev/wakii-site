# HKUDS/nanobot — research digest (batch-3, matrix #28)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: HKUDS/nanobot
- facet: multi-agent
- stars @ 2026-09-08: 47883 (re-probe cùng ngày; skeleton SF-1 probe 47878 — drift cùng ngày, dùng số re-probe)
- license (GitHub API 2026-09-08): MIT
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh` + `gh api repos/HKUDS/nanobot`)
- pushed: 2026-09-08T10:45:45Z · archived: false
- HEAD @ research: `104917aaec8b351edcbbc87a64fa6b71eb6e096b` (2026-09-08T08:13:26Z)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## README notes

- "an ultra-lightweight, open-source, self-hosted personal AI agent framework"
  (Python) — chạy WebUI / terminal / chat apps; quote ≤25 từ, attribution + link
  README trong bài.
- Bề mặt tính năng (README "What can nanobot do?"): tools (files, shell, web
  search/fetch, MCP, cron, image generation, subagents), session history +
  long-term memory qua "Dream", scheduled automation, Python SDK +
  OpenAI-compatible API, deploy như long-running gateway.
- Install: một lệnh `install.sh` / `uv tool install nanobot-ai` / pip; có
  "Start Without Technical Background" walkthrough cho người không rành
  terminal — zero-setup ethos rõ.
- Điểm khác cốt lõi: **config-first** — toàn bộ hành vi khai báo trong
  `~/.nanobot/config.json` (JSON + pydantic schema, KHÔNG YAML — honest fix
  angle); secret qua `${ENV_VAR}`; docs khuyên WebUI trước, JSON khi cần
  "intentionally manage configuration as code".

## Architecture (đọc code thật @ `104917a`)

- **Core flow** (docs/architecture.md): Channel → MessageBus → AgentLoop
  (turn channel-facing) → AgentRunner (model/tool loop) → Provider/Tools.
  Tách AgentLoop vs AgentRunner là split chính.
- **Config-first**: `nanobot/config/loader.py` — `Path.home() / ".nanobot" /
  "config.json"`, `json.load`; `nanobot/config/schema.py` — pydantic models
  (`ChannelsConfig`, `DreamConfig`, `ModelPresetConfig`, `AgentDefaults`...).
  `AgentDefaults`: model mặc định, `fallback_models`, `max_tool_iterations:
  200`, `max_concurrent_subagents: Field(default=4, ge=1)`.
- **Đo core**: script `core_agent_lines.sh` CỦA CHÍNH REPO — định nghĩa core =
  5 package top-level (agent/bus/config/cron/session). Chạy trên tarball cùng
  commit: **core 17749 dòng** (agent 9597, bus 718, config 1356, cron 1380,
  session 4698) vs **extra 93018** (tools 12825, skills 2139, api 581, cli
  8952, channels 64193, utils 4328). Tổng package Python 155253 dòng / 393
  file → core ≈ 11%. Bucket lớn nhất: **channels 64193 dòng** (Telegram,
  Discord, Slack, email, feishu, mattermost, matrix...) — integrations nằm
  ngoài core.
- **Multi-agent quy mô nhỏ**: `nanobot/agent/tools/spawn.py` — "Spawn tool for
  creating background subagents"; `nanobot/agent/subagent.py` — subagent chạy
  lại AgentRunner trên scope riêng; `SubagentStatus` dataclass với phase có
  tên (`queued | initializing | awaiting_tools | tools_completed |
  final_response | done | error`).
- **Persona declarative**: `nanobot/templates/` — SOUL.md, USER.md, AGENTS.md,
  HEARTBEAT.md; `templates/agent/identity.md` — Jinja template, format hint
  theo kênh (telegram → đoạn ngắn, email → sections, cli → plain text);
  SOUL.md/USER.md "automatically managed by Dream — do not edit directly" →
  persona là dữ liệu sống. User skills = `skills/<tên>/SKILL.md`.
- **Cadence dev**: pushed 2026-09-08 (cùng ngày probe) — repo hoạt động động.

## Releases (gh api 2026-09-08)

- Gần nhất: **v0.3.0 @ 2026-07-25**. 10 release gần nhất trải
  2026-03-16 (v0.1.4.post5) → 2026-07-25 (v0.3.0): v0.1.4.post5 (03-16),
  v0.1.4.post6 (03-27), v0.1.5 (04-06), v0.1.5.post1 (04-14), v0.1.5.post2
  (04-21), v0.1.5.post3 (04-29), v0.2.0 (05-16), v0.2.1 (06-01), v0.2.2
  (06-23), v0.3.0 (07-25) — nhịp ~1 release/tháng, KHÔNG claim "monthly" trong
  bài, chỉ nêu mốc thật kèm ngày probe.

## Wakii grading (viết vào bài, style-guide §8)

- **ADOPT** — tự đo surface bằng script có ranh giới khai báo rõ
  (`core_agent_lines.sh`): áp vào kit — đếm skills TRONG mảng `src/data/skills.ts`
  (20/13) thay vì grep whole-file (pattern sai 21/14 đã ghi drift-note);
  một lệnh `check` in số skill/agent/CLI từ nguồn chuẩn.
- **DIRECTION** — status phase có tên (`SubagentStatus.phase`) cho runtime dài:
  story view Wakii đã có tier progress; nhãn phase đáng cân nhắc khi agent
  chạy lâu.
- **WATCH** — giá ecosystem tích hợp: channels 64k dòng > 3x core — khi Wakii
  cần thêm kênh giao tiếp ngoài phone/desktop, học cách tách bucket thay vì
  phình core.
- (không dùng N/A)

## Angle check (runbook bước 1)

- Góc: agent tối giản config-first — surface nhỏ nhất vẫn đủ cho tác vụ hằng
  ngày; minimalism vs extensibility; "ít code" là quyết định kiến trúc.
- Lệch so 3 góc cùng facet đã dùng: SOP-artifact (MetaGPT #25), actor-runtime
  (autogen #26), role-ergonomics (crewAI #27) — bài chỉ nhắc 1 câu để phân vị,
  không phát triển.
- H2 riêng: (1) config.json thay glue code, (2) core 17.749 dòng tự đo mình,
  (3) đa agent = 4 subagent nền, (4) persona Markdown do Dream chăm.
