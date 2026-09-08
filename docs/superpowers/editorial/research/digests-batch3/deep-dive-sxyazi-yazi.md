# sxyazi/yazi — research digest (batch-3, matrix #42)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: sxyazi/yazi
- facet: terminal
- stars @ 2026-09-08: 42041
- license (GitHub API 2026-09-08): MIT
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## README notes (probe 2026-09-08)

- Tagline (GitHub description): "Blazing fast terminal file manager written in Rust, based on async I/O" — Yazi = "duck" (README).
- README dẫn bài chính chủ giải thích nội bộ: "Why is Yazi Fast?" (yazi-rs.github.io/blog/why-is-yazi-fast).
- README bullets (probe 2026-09-08): Full Asynchronous Support (I/O async, CPU task nhiều thread) · Async Task Scheduling (real-time progress, cancellation, priority) · Multi Image Protocols (kèm Überzug++ + Chafa) · Code Highlighting + Image Decoding với pre-loading · Concurrent Plugin System ("Just some pieces of Lua" — UI plugins, custom previewer/preloader/spotter/fetcher) · Virtual Filesystem · Data Distribution Service (client-server KHÔNG cần server process thêm, pub-sub Lua, cross-instance + state persistence) · Package Manager (cài plugin/theme 1 lệnh, update hoặc pin version) · tích hợp ripgrep, fd, fzf, zoxide · multi-tab.
- Image preview (bảng README): kitty + Ghostty + Rio = Kitty unicode placeholders; iTerm2/WezTerm/Warp/Tabby/VSCode = Inline images protocol; Konsole = Kitty old protocol; foot/st-patch/Windows Terminal/Black Box = Sixel; X11/Wayland = Überzug++; fallback cuối = ASCII art qua Chafa.
- Metadata gh api 2026-09-08: 42.043★ (drift nhẹ từ probe 42.041 sáng cùng ngày) · 1.009 forks · MIT · Rust · pushed 2026-09-08 · không archived.

## Architecture (đọc code @ HEAD `8c2b5f8cad4a5a97cfe924419f6f3ec0cd88b609`, probe 2026-09-08)

- **Workspace 31 crate `yazi-*`** (gh api contents 2026-09-08): actor, adapter, binding, boot, build, cli, codegen, config, core, dds, emulator, ffi, fm, fs, macro, packing, parser, plugin, proxy, runner, scheduler, sftp, shared, shim, term, tui, tty, version, vfs, watcher, widgets — mỗi concern một crate (tách bạch hơn cả ripgrep).
- **Scheduler có priority**: `yazi-scheduler/src/lib.rs` @ HEAD khai `const LOW/NORMAL/HIGH: u8` từ `yazi_config::Priority`; nhóm loại task: `custom fetch file hook plugin preload process size` kèm modules `worker progress ongoing task` — nền tảng cho progress real-time + cancellation trong README.
- **Plugin = Lua nhúng**: `yazi-plugin/src/lib.rs` @ HEAD — `LUA.init(crate::standard_lua()?)`; bề mặt plugin: `fs keymap pubsub runtime tasks theme ui utils` — plugin chạm được cả UI/theme (README: UI plugins rewrite phần lớn UI).
- **Image adapter tách crate**: `yazi-adapter/` với drivers theo protocol (README link thẳng `yazi-adapter/src/drivers/kgp_old.rs` cho Konsole) — negotiate terminal → chọn protocol → fallback chuỗi: built-in protocols → Überzug++ (X11/Wayland) → Chafa ASCII.
- **DDS (data distribution)**: crate `yazi-dds` — client-server không cần server process riêng + pub-sub Lua (README), cross-instance communication + state persistence.

## Releases (gh api releases?per_page=5, probe 2026-09-08)

- v26.9.1 — 2026-09-01 · v26.8.15 — 2026-08-15 · v26.5.6 — 2026-05-05 · v26.1.22 — 2026-01-22 (+ tag `nightly` cũ 2024-08-07)
- Versioning: **CalVer** — year.month.patch (v26.9.1 = tháng 9/2026); cadence dày: nhiều release mỗi tháng hoạt động (v26.8.15 cho thấy ≥15 patch trong tháng 8/2026). Repo pushed 2026-09-08.

## Wakii grading (style-guide §8)

- **DIRECTION — scheduler nền có priority + progress + cancel**: yazi-scheduler phân loại task (preload/preview/fetch…), 3 mức priority, progress real-time. Áp được cho các việc nền của IDE Wakii (render hero, sync, index) — hướng kiến trúc, chưa phải việc ngay.
- **WATCH — đàm phán năng lực + chuỗi fallback**: image adapter detect terminal → protocol tốt nhất → fallback Überzug++ → Chafa. Pattern đáng theo cho kit/app Wakii khi phải chạy đa môi trường (SSH host, terminal khác nhau): detect → degrade có chủ đích thay vì fail.
- **WATCH — capability là content + package manager pin version**: plugin yazi là "just some pieces of Lua", cài 1 lệnh, pin được version. Wakii kit đã theo skills-as-content; điểm cần theo dõi: cơ chế pin phiên bản để update không làm gãy story đang chạy.
