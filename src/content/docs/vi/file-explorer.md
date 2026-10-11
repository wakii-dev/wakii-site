---
title: File explorer & kéo thả vào agent
description: Editor hạng VS Code với autosave mọi nơi — kéo file hoặc ảnh thẳng vào prompt của agent.
order: 16
---

File explorer và editor của Wakii là **hạng VS Code**: tree với git status
coloring, tabs, autosave, multi-cursor — mọi nơi, kể cả file remote và
worktree. Và tính năng đắt giá: **kéo file hoặc ảnh thẳng vào prompt của
agent**.

## Editor

- Tree explorer với git status coloring và folder actions
- Tabs, split editor, autosave, format-on-save
- Multi-cursor, command palette, và keybindings quen thuộc
- Hoạt động với worktree file lẫn file remote (SSH)

## Kéo thả vào agent

1. Cầm một file, một ảnh, hoặc vùng chọn từ explorer.
2. Kéo thả vào prompt của agent.
3. Agent nhận đường dẫn file (hoặc ảnh inline) kèm message.

Ảnh được paste inline — agent có vision (Claude, GPT-4o) nhìn thấy
screenshot. File được trỏ theo path để agent đọc và sửa bằng tools của nó.

## Mẹo

- Kéo **nhiều file** cùng lúc — agent nhận đủ danh sách.
- Kéo từ **ngoài Wakii** — Finder, Explorer, browser — thứ gì droppable
  đều thành input cho agent.
- Kết hợp **Design mode**: chụp UI, kéo ảnh vào prompt mới, yêu cầu cùng
  layout với theme khác.
