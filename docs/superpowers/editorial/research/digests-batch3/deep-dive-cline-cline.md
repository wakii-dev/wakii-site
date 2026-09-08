# cline/cline — research digest (batch-3, matrix #12)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: cline/cline
- facet: harness
- stars @ 2026-09-08: 67661 (probe riêng của SF-2 — skeleton cũ ghi 67660, chênh 1 sao trong cùng ngày; bài dùng 67.661)
- license (GitHub API 2026-09-08): Apache-2.0
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh` + `gh api` trực tiếp)
- forks: 7313 · open_issues: 1268 · created: 2024-07-06 · pushed: 2026-09-08T12:12:20Z (cùng ngày probe)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## README notes

- Tagline: "The open source coding agent in your IDE and terminal." (@ `f5af821`)
- Sản phẩm (bảng Index trong README): SDK · CLI (`apps/cli/`) · VS Code Extension (`/` — "WIP migrating") · JetBrains Plugin ("Currently we are not open-sourcing JetBrains plugins" — MẶT ĐÓNG) · Kanban (repo riêng `cline/kanban` — "Each card gets its own worktree, auto-commit, and dependency chains")
- Cơ chế chính theo README: checkpoints cho mọi thay đổi; Plan/Act toggle (Plan khám phá + hỏi, Act thi hành có duyệt); `.clinerules` + skills; đa provider (Anthropic/OpenAI/Google/OpenRouter/Ollama…); MCP + plugin SDK; multi-agent teams (`cline --team-name`); scheduled agents; connector Telegram/Slack/Discord; headless CLI cho CI/CD

## Architecture (đọc code @ commit `f5af821`, shallow clone)

- Clone gotcha: repo dùng Git LFS + global git config máy có `filter.lfs.required=true` nhưng git-lfs KHÔNG có mặt → checkout/archive chết giữa chừng; giải pháp `git -c filter.lfs.*=cat -c filter.lfs.required=false archive HEAD | tar -x` (chỉ 2 file .gif bị LFS-track — nguồn .ts đầy đủ 2301/2301)
- Cấu trúc: lõi agent ở `sdk/packages/core/src/` (runtime/orchestration, session, extensions/tools, hooks, services/mcp…); `apps/vscode/src/core` là mặt extension (controller/checkpoints, controller/state/togglePlanActModeProto.ts); `apps/cli`, `apps/examples/desktop-app` dùng chung lõi
- **Checkpoint engine** (`sdk/packages/core/src/session/`):
  - `checkpoint-hooks.ts` — `CheckpointEntry { ref, createdAt, runCount }`; ref giữ tại `refs/cline/checkpoints/${sessionId}/${entry.runCount}` (dòng ~286, `retainCheckpointRefs`) — private refs ngoài nhánh người dùng
  - `checkpoint-restore.ts` — `beginWorktreeRestoreTransaction`: "git stash create omits untracked files, but checkpoint restoration runs git clean -fd" → dùng `stash push --include-untracked` đẩy object vào private ref ngắn hạn, commit/rollback giao dịch
  - `session-versioning-service.ts` (328 dòng) — Service bọc restore: `applyCheckpointToWorktree`, `CheckpointRestorePlan`, trim messages theo run
- **Plan/Act guard** (`sdk/packages/core/src/extensions/tools/command-guard-extension.ts`, 89 dòng): hook `beforeTool` chạy TRƯỚC tool policy + user approval; `findFileEditingCommand` (command-guard.ts:479) chặn lệnh sửa file trong plan mode; lỗi plan-mode trả về model làm tool result (`skip` không `stop` — run tiếp tục); một hook phủ cả tool built-in lẫn host thay thế
- MCP: `apps/vscode/src/services/mcp/McpHub.ts` + `McpOAuthManager.ts`; CLI quản server bằng `cline mcp` (README)

## Releases (GitHub API 2026-09-08)

- 10 release gần nhất trải 2026-08-28 → 2026-09-03 (7 ngày, 4 dòng tag):
  desktop-v0.0.23 (09-03) · desktop-v0.0.23-beta.1 (09-03) · v4.1.17 (09-02) · sdk/sdk/v0.0.82 (09-02) · desktop-v0.0.22 (09-02) · cli-v3.0.61 (09-02) · desktop-v0.0.22-beta.1 (09-01) · desktop-v0.0.21 (08-31) · desktop-v0.0.21-beta.2 (08-31) · desktop-v0.0.20 (08-28)
- `releases/latest` = desktop-v0.0.23; desktop vẫn 0.0.x + beta đi trước bản chính
- Riêng extension: v4.1.10 (08-14) → v4.1.17 (09-02) = 8 bản/20 ngày (dữ liệu lọc từ releases?per_page=100)

## Wakii grading (đã viết vào bài)

- **ADOPT** — checkpoint per-run vào private ref + restore transactional (stash cả untracked); Wakii đang per-task commit + rollback-fixer — đề xuất preflight chụp ref trước nhóm thao tác ghi
- **DIRECTION** — ranh giới mode cứng ở tầng tool cho trạng thái chờ-duyệt-plan của task-executor (khác permission profile theo vai đã ADOPT từ opencode — đây là ràng buộc theo TRẠNG THÁI cùng một agent)
- **WATCH** — "open core, một mặt phân phối đóng" (JetBrains) có thành mặc định ngành; nếu có → Wakii giữ lõi + phân phối cùng mở
- **N/A** — scheduled agents + connector Telegram/Slack/Discord (chatops phân phối, không phải bài toán Wakii)
