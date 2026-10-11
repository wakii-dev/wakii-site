---
title: Terminal chia màn
description: Terminal hạng Ghostty — render WebGL, chia màn vô hạn, scrollback sống qua restart.
order: 11
---

Wakii đi kèm **terminal hạng Ghostty** — render GPU, phím không lag, và chia
màn sâu tùy layout. Mọi agent chạy trong terminal thật — bạn xem, scroll,
hoặc takeover khi cần.

## Điểm nổi bật

- **Render WebGL** — mượt ngay cả khi build log run ào ào
- **Chia màn vô hạn** — ngang, dọc, và tab
- **Scrollback sống qua restart** — đóng app, quay lại, buffer vẫn còn
- **Shell integration** — tiêu đề lệnh, exit code, tracking cwd

## Chia màn

1. Focus terminal, bấm phím split (hoặc chuột phải → Split).
2. Kéo viền để resize; double-click để phóng to.
3. Terminal gắn được vào worktree — pane ngồi cạnh agent đang sửa code đó.

## Terminal của agent

Mỗi agent có pane terminal riêng cạnh diff view. Xem agent chạy build,
takeover khi nó cần nhập liệu, hoặc gõ thẳng — agent thấy cả keystrokes
của bạn.

## Mẹo

- Ghim một terminal build ở dưới — sống qua mọi lần chuyển worktree.
- **Shift+Click** để select và copy không cần bàn phím.
- Tìm trong scrollback: `Ctrl+Shift+F` (macOS `Cmd+Shift+F`).
