---
title: "Duyệt AI agents từ điện thoại: Stories và decision gates trong túi bạn"
description: "Pair điện thoại với desktop qua mã QR, đọc tiến độ story trong tab Stories và resolve decision gates ngay trên điện thoại — agent không phải đứng chờ bạn quay lại bàn phím."
pubDate: "2026-09-06"
category: "tutorial"
tags: ["mobile", "stories", "gates"]
draft: false
---

Agent làm việc tốt nhất khi được chạy dài, nhưng quyết định có hệ quả thì vẫn cần con người. Vấn đề nằm ở đoạn nối: bạn không thể ngồi canh màn hình cả ngày, mà mỗi lần agent phải dừng đợi thì cả story chùn bước. Kể từ bản mobile, Wakii khép đúng đoạn nối đó — story view và decision gates chạy ngay trên điện thoại.

## Bước 0 — Pair điện thoại với desktop

Trước khi đọc được bất cứ thứ gì, ghép nối điện thoại với host. Mở Wakii trên desktop, vào màn pairing và quét mã QR bằng app trên điện thoại — mọi state của host (stories đang chạy, agents, gates) hiện lên trên điện thoại ngay sau khi quét. Pair một lần cho mỗi host, các lần mở sau bạn vào thẳng việc chính.

Chưa có Wakii trên máy? Hướng dẫn cài đặt chính tắc nằm trong [getting started](/docs/getting-started/) — từ clone đến khi thấy ⚡ Superpowers panel chỉ mất vài phút.

## Mở tab Stories và đọc tiến độ

Trên điện thoại: chọn host, mở tab **Stories**. Mỗi story đang chạy hiện thành một dòng gọn. Chạm vào story để vào màn detail: các sub-feature (SF) xếp theo tier, tiến độ từng SF, agent nào đang giữ worktree nào. Năm giây là biết story đang khỏe hay đang kẹt — không cần SSH, không cần mở terminal từ xa.

## Pending gates: chỗ agent dừng chờ bạn

Workflow của Wakii có cấu trúc decision gate: khi tới điểm cần con người quyết — chọn hướng tiếp cận, duyệt kết quả trước khi merge, hoặc đổi hướng giữa story — agent tạo gate rồi dừng đúng đó. Gate pending hiện nổi trong story detail, kèm đủ ngữ cảnh để bạn quyết không phải đoán.

Ngoài các điểm dừng đó, agent tự chạy hết. Đây là mô hình supervised: agent tự chủ phần việc làm, con người giữ quyền phần việc quyết.

## Resolve gate ngay trên màn hình

Mỗi gate mang theo câu hỏi cụ thể. Gate dạng choice: các phương án hiện thành danh sách, chạm để chọn. Gate dạng free-text: gõ thẳng câu trả lời. Xem xong, nhấn resolve và confirm — câu trả lời bay về agent và story chạy tiếp ngay. Resolve trùng hoặc gate đã đóng thì guard chặn lại với mã lỗi rõ ràng, không có lệnh nào bị nuốt im lặng. Notification gate-closed xác nhận vòng chờ đã khép.

## Điều gì thay đổi khi review nằm trong túi

Trước: agent dừng ở gate, story treo cho tới khi bạn quay lại desktop. Giờ: notification đến, bạn đọc ngữ cảnh trong ba mươi giây và resolve ngay trên điện thoại — kể cả khi đang đứng xếp cà phê. Story giữ được nhịp, và nhịp là thứ quyết định một story xong trong ngày hay xong trong tuần.

Cơ chế gates nhìn tổng thể nằm trong [Superpowers panel docs](/docs/superpowers-panel/). Wakii là agentic IDE với một đội superpowers có sẵn — tải về, để agent chạy, bạn chỉ cần quyết.
