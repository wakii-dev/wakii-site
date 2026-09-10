# sharkdp/bat — research digest (batch-3, matrix #39)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: sharkdp/bat
- facet: terminal
- stars @ 2026-09-08: 60388
- license (GitHub API 2026-09-08): Apache-2.0
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## README notes (probe 2026-09-08)

- Tagline (README): "A cat(1) clone with syntax highlighting and Git integration" (9 từ — quote-safe).
- Git integration (README): "bat communicates with git to show modifications with respect to the index (see left sidebar)" — marker Added/Removed/Modified ở cột trái.
- Paging (README): "By default, bat pipes its own output to a pager (e.g. less) if the output is too large for one screen" — tắt bằng `--paging=never`; alias `cat='bat --paging=never'` được README chính thức khuyên nếu muốn giữ hành vi cat.
- Pipe fallback (README): khi bat phát hiện non-interactive terminal (pipe vào process/file khác), "bat will act as a drop-in replacement for cat and fall back to printing the plain file contents" — bỏ màu + paging bất kể `--pager`.
- Non-printable: `-A/--show-all` hiện + highlight ký tự không in được.
- Metadata gh api 2026-09-08: 60.388★ · 1.643 forks · Apache-2.0 · Rust · pushed 2026-09-04 · không archived.

## Architecture (đọc code @ HEAD `7323a7514f7601737640e7172be115127d6db08c`, probe 2026-09-08)

- **Git markers in-process qua gitoxide**: `src/diff.rs` @ HEAD mở đầu `#![cfg(feature = "git")]` — tính năng git là feature-gated; import toàn `gix::*` (`gix::diff::blob`, `gix::discover`) — gitoxide (thư viện git Rust) đọc index + tính diff trong tiến trình bat, KHÔNG shell-out gọi lệnh `git`. Hàm `get_git_diff(filename) -> Option<LineChanges>` với `LineChange` enum 4 trạng thái: `Added | RemovedAbove | RemovedBelow | Modified`; `collect_changes_from_hunks` đổi hunks diff thành HashMap<số dòng, trạng thái>.
- **Syntax engine = syntect, syntax set serialize từ build**: `src/assets.rs` @ HEAD — struct `HighlightingAssets` giữ `OnceCell<SyntaxSet>` + `SerializedSyntaxSet` + `LazyThemeSet` — database syntax không parse lúc chạy, deserialize từ asset build sẵn (Cargo.toml dep `bincode`). Cargo.toml khai 2 feature chọn regex engine cho syntect: `regex-onig` (oniguruma) / `regex-fancy` (fancy-regex thuần Rust).
- **Dùng lại crate của hệ sinh thái ripgrep**: Cargo.toml @ HEAD có `globset = "0.4"` (cùng crate hệ grep của BurntSushi) + `grep-cli` optional; `content_inspector` phát hiện binary; `clircle` chặn circular IO (cat file vào chính nó); `minus` là pager dynamic-output option.
- `src/pager.rs`, `src/output.rs`, `src/terminal.rs` tách riêng ba mối quan tâm: chọn pager, chọn kênh output (stdout/file/pipe), render ANSI.

## Releases (gh api releases?per_page=5, probe 2026-09-08)

- v0.26.1 — 2025-12-02 · v0.26.0 — 2025-10-19 · v0.25.0 — 2025-01-07 · v0.24.0 — 2023-10-11 · v0.23.0 — 2023-03-25
- Cadence: chậm, 0.x — khoảng cách 1,5-16 tháng giữa các minor; mature/stable hơn là nhịp nhanh. Repo pushed 2026-09-04.

## Wakii grading (style-guide §8)

- **ADOPT — output thích ứng theo người tiêu dùng**: bat phát hiện interactive terminal → trang bị màu + pager; pipe → plain text cho process khác đọc. Pattern áp ngay: CLI trong kit Wakii phân biệt hai chế độ — bảng/màu cho người, plain text/JSON cho agent parse; đề xuất chuẩn hoá flag output cho các story-* CLI.
- **DIRECTION — git state in-process**: bat bỏ subprocess, dùng gitoxide đọc index + diff trong tiến trình. Wakii (desktop app đọc git state của worktree mỗi lúc) có hướng tương tự: đọc qua thư viện thay vì parse output lệnh git — cần quyết kiến trúc, chưa phải việc ngay.
- **WATCH — chi phí khởi động trả trước từ build**: syntax set serialize lúc build (bincode) + feature chọn regex engine để cắt runtime cost. Theo dõi cho electron app + CLI kit của Wakii khi tài nguyên nặng (skill catalog, agent def) phình ra.
