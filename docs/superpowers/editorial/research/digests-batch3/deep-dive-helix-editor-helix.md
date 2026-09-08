# helix-editor/helix — research digest (batch-3, matrix #41)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: helix-editor/helix
- facet: editors
- stars @ 2026-09-08: 46133
- license (GitHub API 2026-09-08): MPL-2.0
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## README notes (probe 2026-09-08)

- Tagline (README): "A Kakoune / Neovim inspired editor, written in Rust." — mô hình edit sao chép Kakoune phần lớn (selection-first).
- Features (README liệt kê đúng 4): Vim-like modal editing · Multiple selections · Built-in language server support · Smart, incremental syntax highlighting and code editing via tree-sitter.
- Không có tính năng AI/agent nào trong README — chủ đích đáng chú ý cho facet editors (cách NHÚNG agent: không nhúng).
- Metadata gh api 2026-09-08: 46,133★ · 3,733 forks · MPL-2.0 · Rust · pushed 2026-09-01 · không archived.

## Architecture (đọc code @ HEAD `079a789e8cb08ead67f19e1971a1b7438b37354b`, probe 2026-09-08)

- **Workspace tách crate** (contents API, root): helix-core (text primitives + syntax) · helix-view (document/editor state) · helix-term (TUI runtime) · helix-lsp + helix-lsp-types (LSP client) · helix-dap + helix-dap-types (debug adapter) · helix-vcs (diff/git) · helix-event · helix-loader · helix-tui · helix-parsec · helix-stdx — 15+ crate, mỗi capability một crate.
- **syntax.rs** (`helix-core/src/syntax.rs`): dùng `tree_house` (lớp tree-sitter của họ) — imports thấy `Capture, Grammar, InactiveQueryCursor, InputEdit, Node, Query, RopeInput, Tree` + `InjectionLanguageMarker, Layer` (language injection), buffer là `ropey::RopeSlice` — highlighting incremental trực trên rope.
- **Interaction model** (book/src/usage.md): "Helix follows the `selection → action` model" — chọn đối tượng trước, hành động sau; "A cursor is simply a single width selection."; multiple selections = "a core mode of interaction".
- **Config** (book/src/configuration.md): 1 file `config.toml` trong config dir (`~/.config/helix/`), ví dụ trong docs ~10 dòng; mở bằng `:config-open` trong editor. Tutor tương tác: `hx --tutor` (runtime/tutor).

## Releases (gh api releases?per_page=5, probe 2026-09-08)

- 25.07.1 — 2025-07-18 · 25.07 — 2025-07-15 · 25.01.1 — 2025-01-19 · 25.01 — 2025-01-03 · 24.07 — 2024-07-14
- CalVer (năm.tháng), ~2 release ổn định/năm (01 + 07); master vẫn push 2026-09-01 — phát triển liên tục giữa 2 lần release, release = snapshot ổn định chứ không phải kênh tính năng mới.

## Wakii grading (style-guide §8)

- **ADOPT — tutor tương tác kèm công cụ**: `hx --tutor` mở bài học chạy ngay trong editor thật, offline, không docs ngoài. Wakii chưa thấy surface tương đương (grep getting-started + registry không có tutor; getting-started là docs đọc, không phải story chạy được). Đề xuất: kit kèm một story mẫu sandbox chạy end-to-end offline cho người mới.
- **WATCH — lập trường "editor không nhúng AI"**: 46k★ mà không có tính năng AI nào trong README; editors nhóm này học: agent để ngoài editor, editor giữ nhanh + keyboard-first. Với Wakii (agent-first IDE) điều cần theo dõi: feature agent không làm giảm độ phản hồi của editing thuần — điều kiện chuyển DIRECTION: khi có metric trải nghiệm keyboard-first bị regression bởi feature agent.
- **N/A — cadence CalVer 2 release/năm**: hợp cho editor cá nhân trưởng thành, không hợp cho agent platform — Wakii chủ đích release nhanh (2 release cùng ngày 09-05 đã verify). Không adopt.
