# CopilotKit/OpenBot — research digest (batch-3, matrix #47)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: CopilotKit/OpenBot
- facet: editors
- stars @ 2026-09-08: 4448 (probe SF-1) / 4453 (refresh `gh api repos/CopilotKit/OpenBot` cùng ngày 2026-09-08 — bài dùng 4453)
- license (GitHub API 2026-09-08): MIT
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh` + `gh api` trực tiếp cùng ngày)
- metadata thêm (gh api 2026-09-08): created 2026-08-17 · TypeScript · forks 549 · open issues 44 · homepage copilotkit.ai/openbot · topics: ag-ui, agent-governance, ai-agents, browser-automation, copilotkit, generative-ui, mcp

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## README notes (gh api repos/CopilotKit/OpenBot/readme, 2026-09-08)

- Description API: "Open-source AI coworkers that each get a computer of their own: a browser, files and tools, with every action decided before it happens and recorded after. Bring any AG-UI agent."
- Badge **Alpha** + câu chủ đạo trong README: "**A template, not a product.**" — clone về làm của mình; không có bản hosted, không publish package; workspace examples/ là tenant package thay bằng của bạn.
- Mỗi Bot có "a computer of its own": container riêng, Chromium riêng với profile/login riêng, `/workspace` volume riêng; `COMPUTER_RUNTIME=runsc` chạy gVisor nơi host hỗ trợ.
- **AG-UI protocol**: Bot = bất kỳ endpoint nào nói AG-UI (LangGraph, Mastra, CrewAI, Pydantic AI, Google ADK, hoặc viết tay) — governance đi theo protocol chứ không theo framework.
- 3 coworkers mẫu là **config chứ không code** (General Assistant / Knowledge / Risk Analyst), khai trong `agents.yaml` hoặc tạo từ `/agents`.
- Stack: Bun 1.3+, Hono API (port 3001), React/Vite app (3010), Drizzle + PostgreSQL/pgvector, Docker Compose; CopilotKit Intelligence (external) cho durable threads + memory.

## Architecture — gateway là điểm đáng học (code thật)

- `server/src/computer/gateway.ts` — header comment: "The only way an action reaches a Bot's computer." Ba việc theo thứ tự: (1) resolve ref từ snapshot server-held, KHÔNG tin label model gọi; (2) hỏi policy — **deny beats allow, absent policy denies, broken rule denies** (fail closed); (3) ghi audit row TRƯỚC khi act — "an action that was not recorded did not happen".
- Quote đáng nhớ (≤25 từ, attribution + link trong bài): "A gateway that decides on a label supplied by the model is theatre" — kèm ví dụ trong chính comment: `'never click Submit' is evaded by sending {ref: "e13", name: "Continue"}`.
- Policy CEL: inspect được `tool.name`, `intent`, `bot.id`, `page.url`, `element.*`, `key`, `file.*`, `mcp.*`. Link code: `github.com/CopilotKit/OpenBot/blob/2e1b352e9a0e7be6235d641b787aab8da10b64db/server/src/computer/gateway.ts` (last-touch commit, probe 2026-09-08).
- **Take the wheel**: Bot gặp login wall/2FA → yêu cầu giúp; control bàn giao trong cùng panel, ghi event `computer.help_requested` / `computer.control_taken` / `computer.control_released`. Khi người đang cầm lái, hành động Bot bị REFUSE chứ không xếp hàng.
- Secrets không vào transcript: trail ghi "đã request secret + độ dài", không ghi nội dung. Credentials qua `/admin/credentials`, mã hoá at-rest, không bao giờ trả lại qua API.
- **Components instead of prose** (generative UI): React components trong `app/src/components/gallery/`, author sandboxed tại `/admin/playground`; mỗi call hỏi server component có tồn tại + đã publish + không bị withhold với Bot đó; data functions grant per-component.
- Skills là instructions không phải capabilities (personal skills gắn Bot tác giả sở hữu, deployment skills admin-owned).
- Routines (chạy lịch): sàn 15 phút, cap 20 enabled, 10 fail liên tiếp → tự tắt.
- Test thật trong README "Try it": `/admin/boundaries` thêm deny rule rồi thử lại cùng hành động browser — tức là demo chính của repo là refusal.

## Releases + cadence (gh api releases?per_page=5, 2026-09-08)

- 5 releases trong ~3 tuần: v0.0.4 (2026-08-22) → v0.0.5 (08-28) → v0.0.6 + v0.0.7 (09-04) → **v0.0.8 (2026-09-06, mới nhất)**.
- v0.0.8 = desktop shell (macOS/Windows/Linux): một window tự fetch deployment, pin image theo digest, sinh secrets, raise containers, apply migrations.
- Commits: 10/10 commit gần nhất (probe 09-08) đều ngày 2026-09-06 — nhịp dồn cụm quanh release.

## Grading đề xuất cho bài

- **ADOPT** — "refusal phải nêu tên rule": `ActionRefusedError` mang `rule` để UI hiển thị đúng rule nào chặn; khớp và xác nhận pattern guard codes của Wakii (FI-341: resolve trùng/gate đóng bị chặn với mã lỗi rõ ràng) → đề xuất áp nguyên tắc này cho MỌI permission/refusal surface của agent Wakii, không chỉ gate resolve.
- **DIRECTION** — generative UI có grant (components instead of prose): agent trả lời bằng component được duyệt trước, grant per-component — hướng đáng cân nhắc cho surface watch/panel Wakii khi muốn agent render trạng thái có kiểm soát thay vì prose tự do.
- **WATCH** — repo 3 tuần tuổi (created 2026-08-17), badge Alpha tự nhận "expect rough edges"; threads/memory phụ thuộc CopilotKit Intelligence (service ngoài) — theo dõi đến khi self-host Intelligence mượt hoặc API ổn định.
- **N/A** — routines chạy lịch (15-min floor, cap 20) + SSO SAML/OIDC: đúng bài toán deployment doanh nghiệp của template này, không đụng surface Wakii hiện tại.

## Đã verify với bài (T6)

- [x] Mọi số kèm "theo GitHub API ngày 2026-09-08"
- [x] Quote ≤25 từ + attribution + link (MIT → "open-source" được phép, KHÔNG thuộc 6 slug †)
- [x] Code excerpt + link blob sha
- [x] Docs link đúng locale + cross-link chỉ bài tồn tại
