# microsoft/autogen — research digest (batch-3, matrix #26)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: microsoft/autogen
- facet: multi-agent
- stars @ 2026-09-08: 60866
- license (GitHub API 2026-09-08): CC-BY-4.0
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## Research notes (probe 2026-09-08)

### README notes

- "AutoGen is a framework for creating multi-agent AI applications that can act
  autonomously or work alongside humans." (README @ sha `027ecf0a`)
- **MAINTENANCE MODE**: "AutoGen is now in maintenance mode. It will not receive new
  features or enhancements and is community managed going forward." → successor =
  Microsoft Agent Framework (`github.com/microsoft/agent-framework`), có migration
  guide riêng trên learn.microsoft.com. README liên kết migration guide v0.2→v0.4
  (microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/migration-guide.html).
- Requires Python 3.10+; install: `autogen-agentchat` + `autogen-ext[openai]`.

### License — cấu trúc kép (chi tiết đáng viết)

- Root `LICENSE` = Creative Commons Attribution 4.0 (CC-BY-4.0) → GitHub classifier
  hiển thị CC-BY-4.0 (`gh api repos/microsoft/autogen/license` → path LICENSE,
  spdx CC-BY-4.0).
- Package code khai riêng `LICENSE-CODE` = MIT ("Copyright (c) Microsoft Corporation")
  trong `pyproject.toml` (`license = {file = "LICENSE-CODE"}` + classifier
  "License :: OSI Approved :: MIT License") — verify trên `autogen-core` và
  `autogen-agentchat`.
- Tức là: code MIT, tài liệu CC-BY-4.0; số license từ dashboard nói về docs, không
  nói về code.

### Architecture (code thật @ `027ecf0a`)

- Packages trong `python/packages/`: agbench, autogen-agentchat, autogen-core,
  autogen-ext, autogen-magentic-one, autogen-studio, autogen-test-utils,
  component-schema-gen, magentic-one-cli, **pyautogen**.
- Hai lớp: `autogen-core` = runtime event-driven (actor); `autogen-agentchat` = API
  cao (README: high-level for beginners, core's "event-driven programming model" for
  advanced control).
- `SingleThreadedAgentRuntime`
  (`python/packages/autogen-core/src/autogen_core/_single_threaded_agent_runtime.py`,
  1029 dòng): 3 loại envelope (`PublishMessageEnvelope` / `SendMessageEnvelope` /
  `ResponseMessageEnvelope`) dùng chung 1 `asyncio.Queue` (`_message_queue`).
  - Publish = pub-sub: `_subscription_manager.get_subscribed_recipients(topic_id)`,
    fan-out qua `asyncio.gather`, skip sender ("Avoid sending the message back to
    the sender").
  - Send = RPC: envelope mang `Future`, `_process_response` resolves future.
  - Vòng lặp duy nhất `_process_next` dequeue + dispatch; telemetry OpenTelemetry
    import trong file.
- **pyautogen = proxy package**: pyproject v0.10.0, description "A programming
  framework for agentic AI. Proxy package for autogen-agentchat.", dependency
  `autogen-agentchat>=0.6.4`; README: "This is a proxy package for the latest version
  of autogen-agentchat. If you are looking for the 0.2.x version, please pin to
  `pyautogen~=0.2.0`." → rewrite có ranh giới: giữ tên cũ làm cổng, KHÔNG có shim
  tự động; code v0.2 pin tay hoặc migrate.

### Releases (gh api releases, probe 2026-09-08)

| Tag | published_at |
|---|---|
| python-v0.7.5 | 2025-09-30 |
| python-v0.7.4 | 2025-08-19 |
| python-v0.7.3 | 2025-08-19 |
| python-v0.7.2 | 2025-08-07 |
| python-v0.7.1 | 2025-07-28 |
| python-v0.6.4 | 2025-07-09 |
| python-v0.6.2 | 2025-07-01 |
| python-v0.6.1 | 2025-06-05 |
| python-v0.6.0 | 2025-06-05 |
| python-v0.5.7 | 2025-05-14 |

- Release cuối = python-v0.7.5 @ 2025-09-30; pushed_at main = 2026-04-15; archived
  false. Khớp maintenance mode.

### Search note

- `gh api search/code "conversation programming" repo:microsoft/autogen` = 0 kết quả
  trên tree main (thuật ngữ thuộc tài liệu v0.2, không còn trong main) → bài mô tả
  mô hình v0.2 bằng paraphrase, KHÔNG quote.

### Wakii grading (viết trong bài)

- **ADOPT** — rewrite có ranh giới: giữ tên/đường cũ làm cổng + migration guide khi
  đổi surface (pattern pyautogen proxy); Wakii có tiền lệ seeds grandfathered.
- **DIRECTION** — message passing theo topic giữa agents: 9-agent team Wakii hiện
  coordinator gọi tuần tự; pub-sub đáng thử nếu orchestration chuyển event-driven
  (gate-open, review-requested).
- **WATCH** — distributed runtime (cùng interface, nhiều host) cho task DAG: đổi khi
  task DAG vượt một máy / nhiều worktree session cần chung event stream.
