---
title: Worktree qua SSH
description: Chạy agent trên máy mạnh ở xa — full file editing, git, terminal — kèm tự động reconnect và port forwarding.
order: 14
---

Chạy agent trên **máy ở xa qua SSH** — full file editing, git, terminal, và
port forwarding, kèm tự động reconnect khi kết nối rớt. App local vẫn là
cửa sổ duy nhất vào mọi thứ.

## Khi nào nên dùng máy remote

- Laptop đang throttle; máy desktop build thì không.
- Môi trường đích (docker, database, GPU) nằm trên máy remote.
- Bạn muốn build chạy tiếp cả khi gập máy.

## Thiết lập remote

1. Mở **Settings → Remotes** và thêm SSH host (khuyến nghị key auth).
2. Wakii kiểm tra kết nối và liệt kê đường dẫn project khả dụng.
3. Chọn path — worktree, agent, và terminal giờ chạy trên máy remote.

## Những gì hoạt động qua remote

- **Full file editing** — cùng editor, trỏ vào file remote
- **Git operations** — commit, branch, diff trên repo remote
- **Terminal** — PTY thật trên máy remote
- **Port forwarding** — dev server remote, forward và mở được từ browser

## Reconnect

SSH rớt, Wakii tự thử lại và gắn lại session. Terminal scrollback và agent
state sống qua lần ngắt kết nối.

## Mẹo

- Dùng **key auth kèm agent** (`ssh-add`) — password prompt làm agent kẹt.
- Giữ remote cùng git remote với local để worktree chuyển máy cho nhau.
