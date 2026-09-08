# lapce/lapce — research digest (batch-3, matrix #43)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: lapce/lapce
- facet: editors
- stars @ 2026-09-08: 38834
- license (GitHub API 2026-09-08): Apache-2.0
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## README notes (probe 2026-09-08)

- Tagline: "Lightning-fast And Powerful Code Editor" — "written in pure Rust, with a UI in Floem"; "designed with Rope Science from the Xi-Editor" (link xi-editor.io/docs/rope_science_00.html trong README); render bằng wgpu.
- Features (README): built-in LSP (completion/diagnostics/code actions) · modal editing first-class (Vim-like, toggleable) · built-in remote development inspired by VSCode Remote (kèm dịch vụ Lapdev của đội) · plugins viết bằng ngôn ngữ compile ra WASI (C, Rust, AssemblyScript) · built-in terminal.
- Metadata gh api 2026-09-08: 38,834★ · 1,325 forks · Apache-2.0 · Rust · pushed 2026-09-08 (cùng ngày probe) · không archived.

## Architecture (đọc code @ HEAD `b604d57de4a820006d335a3be0d7583eb8fab558`, probe 2026-09-08)

- **4 crate** (root contents): `lapce-app` (UI) · `lapce-core` (editor core) · `lapce-proxy` (backend: fs/terminal/plugin) · `lapce-rpc` (giao thức giữa UI và proxy). Proxy có `src/bin/` → chạy thành tiến trình riêng.
- **Buffer = rope + revision** (`lapce-proxy/src/buffer.rs`): struct `Buffer` có `rope: Rope` (kiểu từ `lapce_xi_rope` — rope của xi-editor được fork vào lapce) và `rev: u64`; thay đổi đi qua `RopeDelta`; import thấy `use lapce_xi_rope::{RopeDelta, interval::IntervalBounds, rope::Rope};` — di sản Rope Science nhìn thấy được ngay ở imports.
- **Plugin host WASI** (`lapce-proxy/src/plugin/`): `catalog.rs` · `dap.rs` · `lsp.rs` · `psp.rs` · `wasi.rs` + thư mục `wasi/`. `wasi.rs` imports `wasmtime_wasi::WasiCtxBuilder` + `wasi_experimental_http_wasmtime::{HttpCtx, HttpState}` + `jsonrpc_lite` + `lsp_types` — plugin chạy như module WASI trên wasmtime, quyền năng cấp qua WasiCtxBuilder (capability-based), giao tiếp RPC kiểu JSON-RPC và bridge LSP.

## Releases (gh api releases?per_page=5, probe 2026-09-08)

- nightly — 2026-09-08 · v0.4.6 — 2026-01-21 · v0.4.5 — 2025-09-05 · v0.4.4 — 2025-08-30 · v0.4.3 — 2025-06-26
- Cadence: stable ~2 lần/năm (v0.4.x), nightly build liên tục (nightly mới cùng ngày probe). Đang pre-1.0.

## Wakii grading (style-guide §8)

- **WATCH — rope + revision làm hợp đồng sửa đổi**: mô hình RopeDelta + rev xử lý sửa đổi đồng thời ở tầng dữ liệu; Wakii xử lý đồng thời ở tầng quy trình (worktree riêng mỗi agent + merge qua gate — isolation-by-worktree). Chuyển sang DIRECTION/ADOPT khi agent cần cùng chỉnh một surface/buffer (ví dụ co-edit cùng file) — lúc đó cần cấu trúc dữ liệu kiểu delta thay vì chỉ cô lập.
- **DIRECTION — sandbox capability kiểu WASI cho phần mở rộng**: Lapce không cho plugin vào process, chạy module WASI với quyền cấp tường minh. Wakii mở rộng bằng skills (nội dung, không code) — an toàn hơn theo thiết kế; nhưng nếu sau này kit cần chạy code bên thứ ba (plugin thật), WASI + capability grant là hình mẫu đáng theo thay vì process thuần.
- **N/A — wgpu GPU rendering + UI tự viết (Floem)**: Wakii là Electron (fork Orca), renderer là Chromium — đổi renderer không nằm trong khả năng kiểm soát thực tế; lợi ích không đủ bù chi phí fork.
