---
title: Comment trên AI diff
description: Thả comment vào bất kỳ dòng diff nào và gửi thẳng về agent — review, sửa, commit không rời app.
order: 15
---

Review code AI sinh ra như review PR của đồng nghiệp: **thả comment vào bất
kỳ dòng diff nào** và gửi thẳng về agent đã viết nó. Không cần copy-paste
feedback vào prompt mới — comment đi kèm ngữ cảnh diff.

## Cách hoạt động

1. Mở **diff view** của agent (các file thay đổi từ khi worktree bắt đầu).
2. Hover một dòng, bấm nút **+** ở gutter, gõ comment.
3. Gửi review — agent nhận comment **kèm ngữ cảnh diff** và sửa theo.
4. Diff cập nhật quay lại kèm annotation; lặp tới khi merge được.

## Vì sao comment hơn prompt mới

Prompt standalone khiến agent phải tự tìm lại thay đổi. Comment trên diff
đi kèm số dòng chính xác, đường dẫn file, và code xung quanh — agent sửa
đúng dòng ngay lần đầu.

## Mẹo

- Đánh dấu comment là **blocking** hay **nit** — blocking comment phải được
  xử lý trước khi agent báo done.
- Kết hợp **Design mode**: bấm element UI trước, rồi comment trên diff
  xuất hiện.
- Review thread gắn với diff — xem lại sau khi fix.
