---
title: "Xây Wakii công khai — log #1"
description: "Log đầu tiên của hành trình xây Wakii: FI-305 mang story view và gates lên điện thoại, release 1.4.199 ra mắt, và chính blog bạn đang đọc là một story đang chạy."
pubDate: "2026-09-07"
category: "build-log"
tags: ["build-log", "release", "wakii"]
draft: false
---

Đây là log đầu tiên trong chuỗi ghi chép định kỳ về việc xây Wakii — cái đã ship, cái đang chạy, và cái sắp tới. Viết công khai để chính chúng tôi buộc phải rõ ràng.

## Đã ship: FI-305 — story ngay trên điện thoại

Tính năng lớn nhất vừa khép: story view trên bản mobile. Bạn pair điện thoại với desktop bằng mã QR, mở tab Stories và thấy mọi story đang chạy — sub-feature xếp theo tier, tiến độ từng SF, agent nào đang giữ worktree nào. Decision gates resolve được ngay trên màn hình điện thoại, kèm notification khi gate mở và khi gate đóng. Agent không còn đứng chờ bạn quay lại bàn phím.

## Release 1.4.199

Ngày 5/9 chúng tôi cắt ba release liên tiếp — 1.4.197, 1.4.198, 1.4.199 — nhịp nhỏ và thường xuyên thay vì một bản lớn phải chờ đợi. 1.4.199 là release hiện tại; bản dựng Android đi kèm ở tag `mobile-android-v0.0.48`. Nếu bạn đang dùng bản cũ, trang download có đầy đủ.

## Blog bạn đang đọc chính nó

Phần meta nhất của tuần: blog này đang được xây bằng đúng quy trình mà nó miêu tả. Story FI-339 đang chạy: SF-1 (SEO surface — OG cards, RSS, TOC cho bài dài, kiểm tra slug song ngữ) đã merged; SF-2 chính là mười bài viết bạn đang đọc — viết tiếng Việt trước, dịch sang tiếng Anh, slug khóa cứng giống hệt nhau ở hai ngôn ngữ; SF-3 sẽ quét QA toàn site trước khi story khép lại thành một PR.

## Bước tiếp theo

SF-3 hội tụ, story FI-339 khép bằng một PR duy nhất. Sau đó: chuỗi log này tiếp tục, và các story tiếp theo đã xếp hàng chờ.

Muốn thử những điều trên bằng chính tay mình, hướng dẫn [getting started](/docs/getting-started/) đưa bạn từ clone đến ⚡ Superpowers panel trong vài phút.
