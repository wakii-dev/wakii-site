---
title: "Duyệt AI agents từ điện thoại: Stories và decision gates trong túi bạn"
description: "Pair điện thoại với desktop qua mã QR, đọc tiến độ story trong tab Stories và resolve decision gates ngay trên điện thoại — agent không phải đứng chờ bạn quay lại bàn phím."
pubDate: "2026-09-06"
category: "tutorial"
tags: ["mobile", "stories", "gates"]
draft: false
---

Agent làm việc tốt nhất khi được chạy dài, nhưng quyết định có hệ quả thì vẫn cần con người. Vấn đề nằm ở đoạn nối: bạn không thể canh màn hình cả ngày, mà agent dừng đợi thì cả story chùn bước. Kể từ bản mobile, Wakii khép đúng đoạn nối đó — story view và decision gates ngay trên điện thoại.

## Bước 0 — Pair điện thoại với desktop

Trước tiên, ghép nối điện thoại với host: mở Wakii trên desktop, vào màn pairing và quét mã QR bằng app trên điện thoại — mọi state của host (stories, agents, gates) hiện lên ngay sau khi quét. Pair một lần cho mỗi host, các lần mở sau vào thẳng việc chính.

Chưa có Wakii trên máy? Hướng dẫn cài đặt chính tắc nằm trong [getting started](/docs/getting-started/) — từ clone đến khi thấy ⚡ Superpowers panel chỉ mất vài phút.

## Mở tab Stories và đọc tiến độ

Trên điện thoại: chọn host, mở tab **Stories**. Mỗi story đang chạy hiện thành một dòng gọn; chạm vào để vào màn detail — sub-feature (SF) xếp theo tier, tiến độ từng SF, agent nào giữ worktree nào. Năm giây là biết story đang khỏe hay đang kẹt, không cần SSH hay terminal từ xa.

## Pending gates: chỗ agent dừng chờ bạn

Workflow của Wakii có cấu trúc decision gate: khi tới điểm cần con người quyết — chọn hướng, duyệt kết quả trước khi merge, hoặc đổi hướng giữa story — agent tạo gate rồi dừng đúng đó. Gate pending hiện nổi trong story detail, kèm đủ ngữ cảnh để bạn không phải quyết mò.

Ngoài các điểm dừng đó, agent tự chạy hết. Đây là mô hình supervised: agent tự chủ phần việc làm, con người giữ quyền phần việc quyết.

## Resolve gate ngay trên màn hình

Mỗi gate mang theo câu hỏi cụ thể. Gate dạng choice: phương án hiện thành danh sách, chạm để chọn; gate dạng free-text: gõ thẳng câu trả lời. Nhấn resolve, confirm — câu trả lời bay về agent, story chạy tiếp. Resolve trùng hoặc gate đã đóng thì guard chặn lại với mã lỗi rõ ràng, không có lệnh nào bị nuốt im lặng. Notification gate-closed xác nhận vòng chờ đã khép.

## Điều gì thay đổi khi review nằm trong túi

Trước: agent dừng ở gate, story treo cho tới khi bạn quay lại desktop. Giờ: notification đến, bạn đọc ngữ cảnh ba mươi giây và resolve ngay trên điện thoại — kể cả lúc xếp hàng cà phê. Story giữ được nhịp, và nhịp quyết định story xong trong ngày hay trong tuần.

Cơ chế gates tổng thể nằm trong [Superpowers panel docs](/docs/superpowers-panel/). Wakii là agentic IDE với một đội superpowers có sẵn — tải về, để agent chạy, bạn chỉ cần quyết.
