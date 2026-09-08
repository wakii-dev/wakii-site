# BurntSushi/ripgrep — research digest (batch-3, matrix #38)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: BurntSushi/ripgrep
- facet: terminal
- stars @ 2026-09-08: 68081
- license (GitHub API 2026-09-08): Unlicense
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## README notes (probe 2026-09-08)

- Tagline (GitHub description): "ripgrep recursively searches directories for a regex pattern while respecting your gitignore" (12 từ — quote-safe).
- Defaults (README): "By default, ripgrep will respect gitignore rules and automatically skip hidden files/directories and binary files" — thoát bằng `rg -uuu`.
- License (README): "Dual-licensed under MIT or the UNLICENSE" — GitHub API spdx_id `Unlicense`.
- Benchmark README (i9-12900K, Linux kernel tree, pattern `[A-Z]+_SUSPEND`): rg 0.082s (1.00x) · hypergrep 0.167s (2.04x) · git grep -P 0.273s (3.34x) · ag 0.443s (5.43x) · ack 2.935s (35.94x).
- README CÓ section cliffs: "Beware of performance cliffs though" (pattern `[A-Za-z]{30}` trên file 13GB: rg 15.569s — vẫn thắng nhưng tuyệt đối là chậm) + "performance can drop precipitously across the board" khi pattern không có literal optimization; `rg the` (83.499.915 match) = 6.948s vì thời gian bị chi phối bởi xử lý match.
- Metadata gh api 2026-09-08: 68.084★ (drift nhẹ từ probe 68.081 sáng cùng ngày) · 2.752 forks · Rust · pushed 2026-08-04 · 190 open issues · không archived.

## Architecture (đọc code @ HEAD `3fce3b5bb0236da2df6d99672afb8a719642eca7`, probe 2026-09-08)

- **11 crate tách rõ concern** (`crates/`, gh api contents 2026-09-08): `cli`, `core`, `globset`, `grep`, `ignore`, `index`, `matcher`, `pcre2`, `printer`, `regex`, `searcher` — globset chỉ làm glob, ignore chỉ làm traversal + ignore rules, searcher chỉ làm đọc/khớp từng file, printer chỉ format output.
- **Traversal song song work-stealing**: `crates/ignore/src/walk.rs` @ HEAD import `use crossbeam_deque::{Stealer, Worker as Deque}` — WalkParallel chia cây thư mục qua deque work-stealing, mỗi thread nhặt việc khi rảnh thay vì chia tĩnh theo đếm file.
- **Searcher tách 2 lựa chọn IO**: `crates/searcher/src/searcher/mod.rs` @ HEAD có `pub use self::mmap::MmapChoice` + module `line_buffer` (`DEFAULT_BUFFER_CAPACITY`, `BufferAllocation`) — đọc theo buffer có giới hạn bộ nhớ hoặc mmap tùy chọn; binary detection heuristic tách riêng (`BinaryDetection`).
- **Regex là feature tinh chỉnh**: crate `regex` bọc engine `regex` của Rust (literal optimization là nguồn thắng benchmark); `pcre2` là crate riêng — PCRE2 là build feature tùy chọn, FAQ có mục riêng "Why does using a PCRE2 regex make ripgrep slower?" (PCRE2 chậm hơn engine mặc định).

## Releases (gh api releases?per_page=5, probe 2026-09-08)

- 15.2.0 — 2026-07-15 · 15.1.0 — 2025-10-22 · 15.0.0 — 2025-10-16 · 14.1.1 — 2024-09-09 · 14.1.0 — 2024-01-06
- Cadence: CHẬM, chủ đích — 14.1.0 → 15.2.0 trải 2,5 năm; giữa hai release có thể cách 9-11 tháng; binary tải về cho từng release trên mọi nền tảng (README). Repo pushed 2026-08-04.

## Wakii grading (style-guide §8)

- **ADOPT — kỷ luật benchmark trung thực kèm cliffs**: README đặt bảng thắng ngay cạnh bảng case xấu ("Beware of performance cliffs" — rg 15.5s trên pattern không literal, `rg the` 6.9s vì 83 triệu match). Pattern áp được ngay: mọi claim hiệu năng trong docs/blog Wakii kèm bảng giới hạn (khi nào chậm, vì sao) — cùng tinh thần claims-registry: không chỉ cite case đẹp.
- **DIRECTION — tách concern mức crate**: 11 crate mỗi cái một vai trò, import qua ranh giới rõ (`globset` không biết `printer` tồn tại). Áp cho kit Wakii khi công cụ lớn lên: tách util theo concern thay vì script monolith — chưa làm ngay vì kit hiện còn nhỏ.
- **WATCH — năng lực theo feature-flag**: PCRE2 là build feature riêng (binary có/không PCRE2), FAQ ghi rõ đánh đổi chậm hơn. Wakii: các năng nặng (inference cục bộ, MCP chạy local) có thể đi theo model "bật-thêm" thay vì nhét core — theo dõi trước khi quyết.
