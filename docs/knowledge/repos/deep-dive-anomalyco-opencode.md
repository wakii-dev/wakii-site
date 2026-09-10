# anomalyco/opencode — research digest (batch-3, matrix #2)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: anomalyco/opencode
- facet: harness
- stars @ 2026-09-08: 205815
- license (GitHub API 2026-09-08): MIT
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`; verify lại bằng `gh api repos/anomalyco/opencode` exit 0 — stars 205815, forks 26857, pushed 2026-09-08T11:11:55Z, TypeScript, desc "The open source coding agent.")

## Research (đã điền SF-2, probe 2026-09-08)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
  - "The open source AI coding agent." (README, lấy 2026-09-08). Agent coding chạy
    trong terminal, MIT (GitHub API 09-08), ~16 tháng tuổi (created 2025-04-30).
  - Điểm khác biệt cốt lõi: ĐỘC LẬP VENDOR — catalog mô hình nạp từ models.dev
    (module `ModelsDev`), không khóa provider nào; một lõi phục vụ 3 mặt client
    (TUI terminal, desktop app BETA, ACP service cho editor).
  - README (250 dòng đầu): cài đa kênh (curl script, npm/bun/pnpm/yarn, brew ×2,
    scoop, choco, pacman, paru, mise, nix); README 22 ngôn ngữ; desktop BETA
    (DMG arm64/x64, EXE, deb/rpm/AppImage); 2 built-in agents **build**
    (full-access) + **plan** (read-only, xin phép trước lệnh shell, switch bằng
    Tab) + subagent **general** gọi `@general`.
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
  - Clone shallow @ commit `d6855b6`. Monorepo `packages/` 30+ mục (tui, desktop,
    server, sdk, plugin, protocol, llm, console, web...); lõi ở
    `packages/opencode/src/`: session, tool, skill, permission, worktree, mcp,
    provider, lsp, snapshot, acp.
  - Cơ chế đáng học:
    1. **Permission gắn theo agent**: `agent/agent.ts` — Agent = Schema.Struct với
       field `permission: PermissionV1.Ruleset`; 3 mức "allow"|"ask"|"deny";
       read-only plan = ruleset cứng `readonlyExternalDirectory` ("*" → ask,
       whitelist skill dirs/tmp/truncate glob → allow), KHÔNG phải lời dặn trong
       prompt. https://github.com/anomalyco/opencode/blob/d6855b6/packages/opencode/src/agent/agent.ts
    2. **Compaction ngưỡng đo được**: `session/compaction.ts` — PRUNE_MINIMUM
       20_000, PRUNE_PROTECT 40_000, TOOL_OUTPUT_MAX_CHARS 2_000,
       PRUNE_PROTECTED_TOOLS ["skill"], MIN/MAX_PRESERVE_RECENT_TOKENS 2k/15k.
       https://github.com/anomalyco/opencode/blob/d6855b6/packages/opencode/src/session/compaction.ts
    3. **Provider-agnostic**: `provider/provider.ts` import `ModelsDev` từ
       `@opencode-ai/core/models-dev` — provider mới = dữ liệu catalog, không viết
       code riêng. https://github.com/anomalyco/opencode/blob/d6855b6/packages/opencode/src/provider/provider.ts
    4. **ACP service hoàn chỉnh**: `src/acp/` (session.ts, permission.ts, tool.ts,
       usage.ts) — backend agent cho editor ngoài.
       https://github.com/anomalyco/opencode/tree/d6855b6/packages/opencode/src/acp
    5. `tool/` ~40 tools, mỗi tool 1 file .txt companion (prompt riêng);
       `worktree/` ở tầng lõi (isolation là first-class).
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
  - `gh api "repos/anomalyco/opencode/releases?per_page=10"` exit 0 @ 2026-09-08:
    v1.18.29 (09-04) · v1.18.28 (09-04) · v1.18.27 (09-02) · v1.18.26 (09-01) ·
    v1.18.25 (08-28) · v1.18.24 (08-28) · v1.18.23 (08-25) · v1.18.22 (08-24) ·
    v1.18.21 (08-21) · v1.18.20 (08-21).
  - Cadence: 10 releases / 15 ngày (08-21 → 09-04); 3 ngày có 2 release
    (21-08, 28-08, 04-09). push gần nhất 2026-09-08T11:11:55Z — active cùng ngày
    probe. (Số releases dùng trực tiếp API, không qua probe-repos.sh — ngày 09-08.)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)
  - **ADOPT — permission profile tường minh theo agent**: Wakii đã có worktree
    isolation + nguyên tắc "người làm không tự duyệt" (9-agent team); đề xuất
    khai permission profile cạnh định nghĩa từng agent trong kit (code-reviewer/
    verifier: deny edit; task-executor: allow trong worktree) để phân quyền
    machine-checkable thay vì chỉ nằm trong system prompt. Lý do trỏ evidence:
    ruleset `readonlyExternalDirectory` + bảng build/plan trong bài.
  - **DIRECTION — compaction ngưỡng đo được**: watchdog auto-resume story dài từ
    last good state; khi story multi-day phổ biến hơn, chính sách kiểu
    20_000/40_000 token tường minh là hướng đáng đưa vào kit. Lý do: hằng số
    hard-code trong compaction.ts (trích trong bài).
  - **WATCH — ACP**: OpenCode ship ACP service hoàn chỉnh cho editor cắm vào;
    quyết định strategic đang theo dõi (khớp WATCH list epic). Điều kiện đổi:
    khi ACP phủ đủ tầng editor → đánh giá lại chuẩn hoá lớp agent-editor.
  - **N/A — desktop BETA + README 22 ngôn ngữ**: bài toán phân phối đa nền tảng
    của dự án 205.8k★, chưa phải bài toán Wakii giai đoạn này.
