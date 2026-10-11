---
title: Mobile companion
description: Theo dõi và điều khiển agent team từ điện thoại — nhận thông báo khi agent xong và gửi follow-up từ bất cứ đâu.
order: 18
---

**Mobile companion** đặt agent team vào túi bạn: nhận thông báo khi agent
xong, đọc summary, và gửi follow-up instruction mà không phải quay lại bàn.

## Bắt đầu

1. Cài companion app — [iOS App
   Store](https://apps.apple.com/us/app/orca-ide/id6766130217) hoặc lấy
   [Android APK](https://github.com/wakii-dev/wakii/releases/latest) từ
   releases.
2. Trong Wakii desktop, mở **Settings → Mobile** và quét mã QR pairing.
3. Agent, notification, và prompt giờ sync vào điện thoại.

## Bạn làm được gì

- **Monitor** — live agent status, task hiện tại, output gần nhất
- **Nhận thông báo** — agent xong, cần nhập liệu, hoặc gặp lỗi
- **Gửi follow-up** — gõ follow-up prompt; nó vào queue của agent
- **Approve** — duyệt permission gate từ điện thoại

## Khi nào phát huy

- **Run dài** — bắt đầu refactor lớn trên desktop, được ping khi xong,
  đọc summary trên ghế sofa.
- **Nhiều agent song song** — 5 agent trong 5 worktree; điện thoại là
  bảng điểm.
- **Quick fix** — thấy typo trong output của agent, gửi fix từ điện
  thoại, xong trước khi bạn quay lại bàn.

## Mẹo

- Notification tôn trọng focus mode — lỗi agent **đÒI xuyên qua**,
  "done" ping chờ.
- Pairing theo máy — mỗi instance desktop app một mã QR.
