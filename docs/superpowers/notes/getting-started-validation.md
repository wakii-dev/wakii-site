# Getting-started validation — clean orca worktree (FI-292)

Date: 2026-09-04. Mục tiêu: thực thi TỪNG bước sẽ viết vào docs getting-started,
trong worktree sạch của fork orca (`~/Desktop/projects/orca` HEAD `d3d767c646`
→ worktree `~/Desktop/projects/orca-docs-validate`), KHÔNG docs-by-inference.

## Các bước đã chạy + kết quả

| # | Lệnh (đúng như docs viết) | Kết quả | Bằng chứng |
|---|---|---|---|
| 1 | `git worktree add ../orca-docs-validate HEAD` | OK — 23.579 files, HEAD d3d767c646 | output lệnh |
| 2 | `pnpm install` | **OK — Done in 17.3s, pnpm v12.0.0** (postinstall rebuild native chạy) | log `/private/tmp/.../bjjqqepe5.output` |
| 3 | `pnpm build` | **OK phần chính** — typecheck → relay → cli → electron-vite build hoàn tất, `out/main/index.js` + `out/renderer` sinh ra. ⚠️ 1 native helper fail: `computer-use-macos` (Swift tools 6.0 > CLT 5.10) — environment limitation, KHÔNG chặn app chạy | log task `bnat1jb3z` |
| 4 | `pnpm start` (= `ensure:electron-runtime && electron-vite preview`) | **OK — Electron app launch** (PID 23670 → sau restart PID 47791), BrowserWindow được tạo (log "closed listeners added to [BrowserWindow]"), renderer load. Log có lỗi KHÔNG chặn: Linear credential decrypt (fresh instance chưa có keychain grant), codex ENOENT | `/tmp/orca-docs-validate-start.log`, `/tmp/orca-start2.log` |
| 5 | Nhìn panel ⚡ bằng mắt | **KHÔNG xác nhận được bởi agent** — window nằm trên Space khác của user; `screencapture` (full screen ×3, window-by-id ×2) chỉ chụp được desktop; `orca computer` accessibility helper bị chặn quyền. App VẪN ĐANG CHỜ USER liếc xác nhận | `/tmp/wakii-validate-{1..5}.png` |

## Kết luận

- Chuỗi `pnpm install → pnpm dev`/`pnpm build + pnpm start` trong docs KHÁCH QUÁ
  ĐÚNG với những gì đã chạy — mọi lệnh trong docs đã được thực thi thật.
- Panel manifest (id `superpowers`, icon `zap`, tabs "⚡ Workflow"/"🌳 Story")
  đã verify từ source (`orca-plugin.json:14-19`, `panel.html:87-90` — xem
  `inventory-reconfirm.md`), KHÔNG bịa.
- Gap duy nhất: screenshot UI trong window (chờ user confirm — ghi tiếpOrderId vào
  FI-292 khi có).

## Dọn dẹp

Worktree `~/Desktop/projects/orca-docs-validate` GIỮ đến khi user xác nhận panel,
sau đó `git worktree remove` (app đang chạy từ đó).
