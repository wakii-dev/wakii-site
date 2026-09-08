# deepseek-ai/deepseek-harness — research digest (batch-3, matrix #1)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: deepseek-ai/deepseek-harness
- facet: harness
- stars @ 2026-09-08: 215738 (probe SF-1) — **re-probe SF-2 cùng ngày: 215800** (bài dùng 215800)
- license (GitHub API 2026-09-08): MIT
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`; SF-2 re-probe bằng `gh api` exit 0 cùng ngày)
- repo created: 2026-08-13 · pushed: 2026-09-07 (GitHub API 2026-09-08)
- desc (GitHub API 2026-09-08): "DeepSeek Harness: Everything is a Plugin."
- clone HEAD @ probe: `c389f96` (dùng cho mọi blob link trong bài)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## README notes

- `dsh` = open-source agent harness của DeepSeek AI (README gọi thẳng "open-source"; license MIT xác nhận bằng API + file LICENSE trong clone) — xây trên nguyên tắc **everything-is-a-plugin**, chạy trên framework **Cordis** (vendor trong `vendor/cordis/`), thiết kế được mô tả trong paper arXiv 2608.25512 "A Programming Paradigm for Spatiotemporal Composability" (link trong README).
- Trạng thái **developer preview** — README cảnh báo hoa thường "THERE WILL BE COMPATIBILITY-BREAKING CHANGES".
- Chạy: `npx @deepseek-ai/dsh web` → Web UI tại `127.0.0.1:3080`. Có desktop Electron (`apps/desktop/`), CLI, Python SDK.
- Cho ai: developer xây agent/plugin trên dsh — docs đầy đủ (architecture, subsystems ~50 file, cookbook, postmortem), bilingual EN/zh.

## Architecture (đọc code thật @ `c389f96`)

- **Microkernel Cordis**: "Every part of the product is a plugin, including the model adapter, the tool registry, the session log, and the agent loop itself" — `docs/architecture.md`. Plugin contribute service + typed event + reversible effect; unload → registration tự unwound.
- **Profiles + bundles**: `web` / `headless` / `sdk` / `sdk-minimal` / `acp`; `dsh-base` là lớp nền chung (model adapters, tools, persistence, sandbox + approval policy); mỗi lớp patch config row theo id của lớp dưới; `dsh --profile web --dump-config` in được cây boot.
- **Quy mô**: `packages/` 55 entry (~35 nhóm: core, guard, plan, todo, goal, skill, mcp, acp, subagent, workflow, jobs, sandbox, fs, shell, session, self-modification, hooks, e2b…); `apps/` cli/desktop/desktop-host/web; `python/` SDK; `native/landlock-run` (sandbox Linux kernel Landlock).
- **Turn flow** = chuỗi event tên gọi rõ (`turn/start → agent/pre-step → step/start → agent/request → llm/stream → tool/* → step/end → turn/end`); `agent/pre-step|agent/request|llm/stream` là waterfall (listener phải gọi `next()`); `agent/turn-stopping` serial.
- **Invariant "model-visible means logged"**: mọi input tới model request phải tái tạo được từ session log append-only; runtime assertion giám sát. Session JSONL versioned (`session.vN.jsonl` + zstd), committed generation không bao giờ rename/overwrite/delete; migrate = thêm successor.
- **Guard advisory**: `guard/repeat-tool-reminder` — đếm consecutive same-tool calls, ngưỡng mặc định `[3,5,8]`, inject reminder có `MessageSource{kind:'plugin'}` (nhãn load-bearing — không nhãn sẽ render thành user prompt), KHÔNG veto; misconfig fail loud lúc load. `guard/timeout-policy` cùng nhóm.
- **Kỷ luật kỹ thuật (AGENTS.md @ `c389f96`)**: CI coverage gate **per-file 100%** trên `packages/*/*/src`; `benchmarks/` = "performance gates" (active-stream-reconnect, agent-continuation, conversation-fold, long-session-browser, session-open); `scripts/` = "gates and generators".
- **Agents-first repo**: `AGENTS.md` + `CLAUDE.md` ở root; `.agents/notes/implemented/architecture/` ~300 file (≈100 dated decision note × 3 ngôn ngữ md/zh/yaml, có mẫu từ 2026-06-11); `.agents/skills/` ≥10 skill cho chính agent phát triển repo (dsh-code-review, dsh-pre-push-checks, dsh-ci-test-reliability, dsh-find-simplifications…); `docs/postmortem/` 4 bài công khai (số 0004: landlock-partial-notice-misclassified-child-failures).

## Releases (gh api releases?per_page=100 @ 2026-09-08)

- Tổng: **12 release**, toàn alpha/rc — KHÔNG có bản stable (endpoint `releases/latest` trả 404).
- Cadence: repo tạo 13-08 → 12 bản trong 25 ngày; 10 bản gần nhất: rc.1 08-21 → v0.1.2-alpha.1 08-27 → alpha.3 08-31 → alpha.5 09-01 → rc.1 09-03 → v0.1.3-alpha.1 09-04 → alpha.2 09-07 (≈2-3 bản/tuần, đúng phase developer preview).

## Wakii grading (chi tiết trong bài, tóm tắt cho SF-6)

- **ADOPT** — guard advisory nhắc-thay-vì-chặn (`repeat-tool-reminder`, thresholds 3-5-8): đề xuất story-watchdog đếm consecutive same-tool calls từ transcript + inject cảnh báo trước khi kết luận stall (giảm nhầm chạy-dài vs kẹt-thật).
- **DIRECTION** — invariant "model-visible means logged" + runtime assertion: Wakii có evidence-pack/Rule 0 nhưng chưa có invariant tự động "mọi ngữ cảnh agent nhận phải truy được về artifact" — hướng cho story-* CLIs thế hệ sau.
- **WATCH** — `self-modification/` (agent tự mount plugin) + seam agent-teams (roster/task board/mailbox, còn opt-in private): theo dõi tới khi API ổn định.
