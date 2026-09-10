# OpenHands/OpenHands — research digest (batch-3, matrix #13)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: OpenHands/OpenHands
- facet: harness
- stars @ 2026-09-08: 86809 (probe riêng lúc viết bài; skeleton SF-1 ghi 86802, launch prompt ghi 86808 — sao drift nội ngày, bài dùng số probe riêng + ngày)
- license (GitHub API 2026-09-08): MIT
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh` + `gh api` riêng: forks 11376 · created 2024-03-13 · pushed 2026-09-08T06:19:25Z · archived false)
- HEAD sha @ 2026-09-08: `f7fb0c4b21f5ed726edbba8a6309634ef434b004` (mọi link blob trong bài pin sha này)

## Research notes (đã điền — probe 2026-09-08)

### README notes

- **PIVOT LỚN**: OpenHands không còn tự mô tả là "coding agent" mà là
  **Agent Canvas** — "The self-hosted developer control center for coding
  agents and automations" (README, probe 2026-09-08). Badge status: beta.
- Điều hành NHIỀU agent: "Run OpenHands, Claude Code, Codex, Gemini, or any
  ACP-compatible agent across local, remote, and cloud backends" — tương thích
  ACP (Agent-Client Protocol) là cánh cửa cho agent bên thứ ba.
- Cài: `npm install -g @openhands/agent-canvas` → `agent-canvas` (Node 22.12+);
  tách stack: `--frontend-only` / `--backend-only`. Docker sandbox option với
  `PROJECTS_PATH`. Warning rõ khi chạy không sandbox ("full access to your
  filesystem").
- Automations: chạy theo lịch hoặc webhook, tích Slack/GitHub/Linear/Notion.
- Câu quote dùng trong bài (13 từ, ≤25): "OpenHands Agent Canvas turns your
  coding agents into a self-hosted, always-on engineering team".

### Architecture

- **Multi-repo, đường biên viết thành văn bản** (AGENTS.md @ HEAD):
  frontend (`OpenHands/OpenHands`, repo này CHỈ là Agent Canvas frontend
  React/TS) · Python SDK + agent-server (`OpenHands/software-agent-sdk`:
  agents, tools, conversations, events, REST/WebSocket) · client sinh tự động
  (`OpenHands/typescript-client` — con đường DUY NHẤT được phép tới
  agent-server) · skills/automations (`OpenHands/extensions`).
- **CI-guard kiến trúc**: `src/api/no-direct-agent-server-calls.test.ts` quét
  toàn bộ `src/`, FAIL khi gặp axios instance dùng chung / `createHttpClient(`
  ngoài 3 file allow-list công khai. Kiến trúc enforced bằng test.
- **Manifest admission seam**: `src/manifests/automation-interface.ts` — host
  giữ 0 automation data; manifest từ package `@openhands/extensions` fail
  admission → routes 404, nav không render. MOUNTED_ROUTES được admission
  đối chiếu.
- **Spec dạng quy tắc đánh số**: `specs/backend-management.md` BM-001..BM-003,
  mỗi quy tắc 1 dòng acceptance `- [x]` kiểm quan sát được (auto-switch on
  connect; đổi backend giữ nguyên trang; fallback khi xoá active backend).
- **"Not responsible for" list**: `docs/architecture.md` liệt kê thẳng cái
  Agent Canvas KHÔNG làm (chạy agent trực tiếp, sandbox/isolation, giữ
  credentials ngoài backend, automation không backend) — pattern docs đáng học.
- **Event stream**: `src/api/event-service/event-service.types.ts` —
  EventSearchOptions (limit/pageId/sortOrder/timestampGte/timestampLt/
  strictPagination); conversation events là first-class API của agent-server.
- **Agent-server như service**: `examples/acp-docker` — `docker compose up`
  bật `ghcr.io/openhands/agent-server` @ localhost:8010; credentials nhập qua
  Canvas UI (container không có host login); pin image từ
  `config/defaults.json` (single source of truth, 2 người ra cùng image).

### Releases — cadence + gần nhất

Probe `gh api repos/OpenHands/OpenHands/releases?per_page=6` ngày 2026-09-08:

| tag | published_at (UTC) |
|---|---|
| v1.16.0 | 2026-08-27T18:19:22Z |
| v1.15.0 | 2026-08-21T14:01:34Z |
| v1.14.0 | 2026-08-17T21:41:36Z |
| v1.13.0 | 2026-08-13T01:57:00Z |
| v1.12.0 | 2026-08-07T19:33:40Z |
| v1.11.0 | 2026-08-07T18:01:46Z |

- 6 releases / 20 ngày (07-08 → 27-08), 2 bản cùng ngày 07-08; release-please
  automation (`x-release-please-version` marker trong README).
- Gần nhất v1.16.0 @ 2026-08-27; push main vẫn hằng ngày tới 2026-09-08
  (release trễ 12 ngày so với push — cadence release không triệt để daily).

### Wakii grading (đã ghi trong bài — style-guide §8)

- **ADOPT** — mục "không phụ trách" (not-responsible list) trong docs kiến
  trúc: Wakii có 9-agent table với "job" từng agent nhưng chưa tả công khai
  việc gì MỖI agent KHÔNG làm; thêm 1 dòng boundary/role trong docs +
  agent definitions của kit = biến "separated powers" thành hợp đồng đọc được.
- **DIRECTION** — control center đa backend (backend registry + health store,
  agent-server như service có địa chỉ): hướng đi cho chạy story từ xa
  (relay-cloud); cần backend service trước nên chưa áp ngay.
- **WATCH** — (1) ACP compatibility (chạy agent bên thứ ba) = quyết định
  chiến lược chờ epic (khớp issue #4 wakii-dev/wakii); (2) automation backend
  chạy theo lịch/webhook — watchdog Wakii mới trong-phiên; lịch cần relay.
- **N/A** — helm/k8s team-scale + npm library embedding: IDE desktop 1 user
  không đối đầu tầng cluster-ops.

### Draft ADOPT issue

- Đã ghi: `docs/superpowers/editorial/research/adopt-drafts/adopt-draft-OpenHands-OpenHands.md`
  (pattern not-responsible boundary; SF-6 file tập trung sau review).
