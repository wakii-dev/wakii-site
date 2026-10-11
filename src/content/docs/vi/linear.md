---
title: GitHub & Linear
description: Xem PR, issue, và project board ngay trong app — mở worktree từ bất kỳ ticket nào và review không cần chuyển ngữ cảnh.
order: 13
---

Wakii tích hợp **GitHub và Linear nguyên bản** — xem PR, issue, và project
board không cần rời app. Mở worktree thẳng từ ticket và gửi kết quả về
dưới dạng review.

## Bạn nhận được gì

- **PR review** — diff view với inline comment, cùng engine với tính năng
  Annotate AI diffs
- **Issue & board view** — Linear cycles, projects, và GitHub issues trong
  một panel
- **Worktree từ task** — bấm vào ticket, nhận worktree với agent đã được
  trỏ sẵn ngữ cảnh
- **Status sync** — tiến độ agent tự post về ticket

## Mở worktree từ ticket

1. Mở panel **Reviews** và chọn ticket.
2. Bấm **Open worktree** — Wakii tạo worktree cách ly đặt theo tên ticket
   và chạy agent mặc định kèm ngữ cảnh ticket.
3. Agent xong, review diff inline và merge.

## Status sync

Agent tự post tiến độ về ticket theo từng giai đoạn — spec, implementation,
review — để board phản ánh đúng thực tế mà không cần cập nhật tay.

## Mẹo

- Lọc board theo agent status để thấy ticket nào đang có agent chạy.
- Dùng **Assign to agent** để giao ticket cho một CLI binary cụ thể.
