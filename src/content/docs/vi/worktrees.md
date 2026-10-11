---
title: Worktree song song
description: Chia một prompt cho 5 agent — mỗi agent một git worktree cách ly — rồi so và merge bản ưng nhất.
order: 10
---

Mọi agent trong Wakii làm việc trong **git worktree cách ly riêng**. Bạn
đưa cùng một prompt cho 5 agent; mỗi agent clone repo vào worktree riêng,
sửa ở đó, không đụng vào tệp đang làm. Khi xong, bạn so diff và merge bản
ưng nhất.

## Vì sao worktree cách ly quan trọng

Agent sửa trực tiếp trên cùng thư mục sẽ giành file nhau. Refactor dở của
agent này vỡ test của agent kia. Worktree cách ly khiến công việc của mỗi
agent **revert độc lập** — bỏ một phương án mà không đụng các phương án khác.

## Tạo worktree

Từ panel Worktrees:

1. Bấm **New worktree**.
2. Chọn agent (Codex, Claude Code, OpenCode, Pi, hoặc CLI bất kỳ).
3. Dán prompt — hoặc lưu thành template dùng lại.

Hoặc từ CLI:

```bash
orca worktree create --name fix-api-timeout --agent claude \
  --prompt "Fix the API timeout in the payment service"
```

## So kết quả

Mỗi worktree hiển thị diff, terminal, và browser preview của agent. Mở hai
bên cạnh nhau, diff, và merge bản thắng.

## Mẹo

- **Một task một worktree** — trộn nhiều mối concern làm diff khó đọc.
- **Đặt tên theo kết quả** — `fix-api-timeout` hay hơn `agent-2`.
- **Bỏ thoải mái** — worktree dùng một lần; cái quan trọng là bản merge.
