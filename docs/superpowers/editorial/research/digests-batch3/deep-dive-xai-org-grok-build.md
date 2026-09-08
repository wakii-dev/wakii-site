# xai-org/grok-build — research digest (batch-3, matrix #19)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: xai-org/grok-build
- facet: harness
- stars @ 2026-09-08: 26563 (re-probe trong session T7 — skeleton SF-1 ghi 26560, stars drift theo giờ, dùng số probe session này trong bài)
- license (GitHub API 2026-09-08): Apache-2.0
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh` + `gh api` trực tiếp trong session T7)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## README notes (probe + đọc đầy đủ 2026-09-08)

- Grok Build = terminal-based AI coding agent của xAI (README ghi "SpaceXAI"), TUI full-screen viết Rust, binary artifact `xai-grok-pager` ship thành `grok`.
- Ba mode chạy: interactive TUI · headless cho scripting/CI · nhúng editor qua Agent Client Protocol (ACP).
- Repo KHÔNG nhận contribution ngoài ("External contributions are not accepted" — README). Sync định kỳ từ monorepo nội bộ; file `SOURCE_REV` ở root ghi SHA commit monorepo tương ứng (probe: `a549186d9d39311f2d3ee4208db62af8c65aa476`).
- Metadata probe @ 2026-09-08: stars 26563 · forks 4991 · created 2026-07-14 · pushed 2026-09-01 · language Rust · license Apache-2.0 · archived false.
- THIRD-PARTY-NOTICES nêu in-tree source ports của openai/codex + sst/opencode tool implementations (harness mượn lẫn nhau).

## Architecture (~75 crates workspace; tree @ HEAD 72a61251fcffb464bcc687aeb5a998e5a98ec0c9)

- Lớp chính theo README layout: xai-grok-pager-bin (composition root) · xai-grok-pager (TUI) · xai-grok-shell (agent runtime + leader/stdio/headless) · xai-grok-tools (tool impls) · xai-grok-workspace (fs, VCS, execution, checkpoints).
- Crate đáng học nhất — `xai-grok-foreign-sessions`: đọc metadata session của Claude Code / Codex (CLI, VSCode, Atlas, ChatGpt) / Cursor (Desktop, CLI). Kỷ luật bounded: MAX_SESSIONS_PER_TOOL=50, MAX_SESSION_AGE=30 ngày, MAX_TITLE_CHARS=200, read-only SQLite, ApprovedRoot check trước khi đọc. Scanner Claude Code scan `~/.claude` hoặc `CLAUDE_CONFIG_DIR`.
  - link: github.com/xai-org/grok-build/blob/72a61251fcffb464bcc687aeb5a998e5a98ec0c9/crates/codegen/xai-grok-foreign-sessions/src/lib.rs
- `xai-acp-lib` — gateway hai chiều ACP (dùng crate `agent_client_protocol`); `xai-grok-mcp` — MCP client (elicitation, credentials, liveness, acp_transport).
- `xai-grok-hooks` (dispatcher, matcher, runner shell+HTTP, trust) · plugin marketplace + git_install + trust registry · xai-grok-sandbox · xai-grok-subagent-resolution · xai-fast-worktree · xai-codebase-graph · xai-grok-memory · xai-compaction-transcript.
- Không thấy cơ chế cấu hình provider model khác ngoài Grok trong README + những gì đọc (ACP/MCP mở ra client/tools, không phải model khác).

## Releases cadence

- **GitHub Releases = 0, tags = 0** (GitHub API `releases?per_page=10` → length 0; `tags` rỗng — probe 2026-09-08). Binary phân phối qua install script x.ai/cli; changelog ở x.ai/build/changelog (ngoài GitHub).
- Cadence evidence thay thế = commits: 8 commit gần nhất 19/08→01/09, TẤT CẢ message "Synced from monorepo", nhịp ~1-3 ngày/sync (GitHub API 2026-09-08).

## Wakii grading (bài dùng WATCH + N/A — không ADOPT/DIRECTION)

- **WATCH — pattern nhà model tự viết harness**: Wakii = agentic IDE model-agnostic (team 9 agent, docs agents-and-kit); grok-build + Claude Code + Gemini CLI cho thấy nhà model biến harness thành sản phẩm first-class gắn model. Điều kiện đổi grade: ACP trưởng thành đủ để Wakii nhúng agent nhà khác như client, hoặc nhà model lớn thứ 4 xác nhận pattern → khi đó thành decision epic.
- **WATCH — kỷ luật bounded metadata-only** (50/tool, 30 ngày, ApprovedRoot): nguyên tắc dùng được nếu Wakii đọc state harness ngoài; watchdog hiện tại đọc commits/terminal/Linear của story mình — khác bản chất nhưng tinh thần "có trần, metadata-first" chuyển giao được.
- **N/A — mirror một chiều không nhận contribution**: mô hình nhà model giữ monorepo nội bộ; Wakii repo public MIT quy trình story-review riêng — không cùng ràng buộc.
- Không ADOPT vì: strategic fork (định vị model-agnostic vs model-welded) là decision lớn → style-guide §8 bắt buộc WATCH trong bài, không tự quyết; không có pattern nhỏ nào áp ngay được vào surface Wakii thật mà không cần decision trước.
