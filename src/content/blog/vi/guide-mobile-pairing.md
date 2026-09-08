---
title: "Ghép đôi điện thoại với desktop Wakii bằng QR"
description: "Cài app Android qua APK từ GitHub Releases, quét QR từ desktop để ghép đôi, và dùng ngay được story view theo tier, duyệt gate với free-text + confirm, thông báo gate mở/khép và guard codes."
pubDate: "2026-09-20"
category: "tutorial"
tags: ["guide", "mobile"]
draft: false
---

Agent chạy việc dài, và bạn không ngồi cạnh máy suốt mấy tiếng đó. Câu hỏi thật
sự khi cầm điện thoại không phải "agent còn chạy không" — watchdog đã lo phần
đó — mà là "gate nào đang chờ mình duyệt". Bài này dựng cặp đôi desktop–Android
trong vài phút, rồi chỉ ra đúng những gì phone làm được ngay sau đó — không hơn,
vì phần "hơn" chưa được kiểm chứng thì không nên hứa.

TL;DR:

- App Android cài bằng APK sideload từ GitHub Releases — bản
  `mobile-android-v0.0.48`, nhãn Pre-release.
- Ghép đôi: desktop hiện QR, phone quét — làm một lần, desktop là nguồn truth.
- Bốn việc làm được ngay: story view (SF theo tier + progress), duyệt gate
  (option hoặc free-text, confirm trước khi gửi), thông báo gate mở/khép, guard
  codes chặn thao tác trùng.
- iOS: trang của Wakii chưa có link — hết, không lòng vòng.

## Bạn cần gì: một desktop đang chạy và một máy Android

Chuẩn bị ngắn hơn bạn nghĩ. Desktop Wakii đang chạy, tốt nhất là đang có story
trong đó — chưa cài thì bài [cài đặt và cập nhật Wakii từ
đầu](/vi/blog/guide-install-update/) lo từ máy trống. Một máy Android. Và một
điều cần biết trước: app mobile của Wakii chưa có trên store, cài qua APK từ
GitHub Releases. Về iOS: trang của Wakii chưa có link — chỉ vậy thôi.

| Bạn cần | Vai trò trong cặp đôi |
|---|---|
| Desktop Wakii đang chạy | Nguồn truth — mọi việc diễn ra trên desktop, phone là điều khiển |
| Máy Android | Màn hình theo dõi và nơi duyệt gate khi bạn vắng bàn |
| Cùng account trên hai máy | Điều kiện để pairing thành công |

*Nguồn: tổng theo docs mobile companion (mục Pairing và Troubleshooting), truy
2026-09-08.*

## Cài app: APK từ GitHub Releases

Bốn bước, làm trên điện thoại:

1. Mở trang Releases của repo `wakii-dev/wakii` trong trình duyệt đầy đủ —
   Chrome, không phải webview trong một app chat nào đó.
2. Chọn release `mobile-android-v0.0.48` và tải file `app-release.apk`.
3. Mở file từ Downloads (hoặc Files → Downloads), xác nhận cài. Android có thể
   hỏi cho phép trình duyệt hoặc Files cài app không rõ nguồn — cấp cho lượt
   này, nhớ tắt lại sau khi cài xong.
4. Samsung Galaxy: nếu Auto Blocker chặn, vào Settings → Security and privacy
   → Auto Blocker, tắt tạm để cài, rồi bật lại. Đừng tắt Play Protect.

Đây là bản đang nói tới, kiểm bằng lệnh thật:

```bash
$ gh release view mobile-android-v0.0.48 --repo wakii-dev/wakii --json name,isPrerelease,publishedAt
{
  "name": "Orca Mobile Android mobile-android-v0.0.48",
  "isPrerelease": true,
  "publishedAt": "2026-09-05T13:00:31Z"
}
```

*Nguồn: `gh release view`, lấy 2026-09-08. Release chứa đúng một asset:
`app-release.apk`.*

Nhãn Pre-release nói đúng điều đó: bản đầu tiên của dòng mobile, dùng được
nhưng đừng kỳ vọng như bản ổn định cuối cùng.

## Ghép đôi: desktop hiện QR, phone quét

Mở flow pairing từ menu account/trạng thái của desktop — desktop hiện mã QR
dùng một lần. Trên phone, mở app mobile, chọn Pair, quét QR. Có đường tắt:
deep link từ desktop mở thẳng vào màn pairing của app. Trong suốt bước này,
giữ desktop ở trạng thái đạt được trên đường nối bạn chọn — LAN hoặc mạng
riêng.

Một câu trong docs định hướng đúng kỳ vọng, trích nguyên văn:

> "Pairing is one-time and the desktop is always the source of truth."

*Nguồn: docs mobile companion, đoạn mở đầu, truy 2026-09-08.*

Phone là điều khiển từ xa cho desktop bạn đã có — không phải bản sao thứ hai
chạy riêng. Đó cũng là lý do mọi cảnh dùng dưới đây đều đọc được ngược lại:
việc thật vẫn xảy ra trên desktop.

## Bốn việc làm được ngay từ phone

Mở story view của host đang chạy story. Bốn năng lực sau là những gì phone làm
được ngay, mỗi cái một cảnh:

Một — nhìn story đang ở đâu. Story view hiển thị progress và các SF xếp theo
tier, từng SF một chip trạng thái. Bạn lướt ba giây là biết story đang ở tier
nào, SF nào xong, SF nào đang chạy.

Hai — duyệt gate. Gate pending hiện ngay trong story view. Chọn một trong các
option của gate; nếu tình huống không khớp option nào, gõ free-text. Confirm
một lần trước khi gửi — phone không gửi mù gì cả.

Ba — để thông báo thay việc mở app. Gate mở và gate khép đều có thông báo:
một cái báo có việc chờ, cái kia xác nhận vòng chờ đã khép.

Bốn — bấm nhầm cũng không sao. Resolve một gate đã được xử trên desktop, hoặc
thao tác trùng lặp, bị guard chặn với mã lỗi rõ ràng thay vì nuốt im lặng.

| Việc | Bạn làm gì trên phone |
|---|---|
| Story view | Xem progress + SF theo tier, chip trạng thái từng SF |
| Duyệt gate | Chọn option hoặc gõ free-text, confirm trước khi gửi |
| Thông báo | Gate mở và gate khép đều báo |
| Guard codes | Thao tác trùng / gate đã đóng bị chặn, mã lỗi rõ ràng |

*Nguồn: docs mobile companion, phần decision gates trên mobile, truy
2026-09-08; thông báo gate mở/khép theo release notes v1.4.199 (notification
routing), lấy 2026-09-08.*

Bốn năng lực này xoay quanh một việc duy nhất — quyết định. Vì sao gate quan
trọng đến mức phải đưa lên điện thoại, bài [decision gates: an toàn cho AI
agents](/vi/blog/decision-gates-safe-ai-agents/) đã giải thích từ gốc. Còn nếu
muốn đọc trải nghiệm thật của việc duyệt bằng phone, bài [review AI agents từ
điện thoại](/vi/blog/review-ai-agents-from-your-phone/) là kỷ lục của lần đầu
tiên.

## Khi nối rớt: ba tình huống, ba cách xử

| Tình huống | Xử lý |
|---|---|
| Pairing không xong | Kiểm tra phone và desktop đang đăng nhập cùng account |
| Mã QR "chết" | Pairing code hết hạn sau vài phút — tạo mã mới trên desktop và quét lại |
| Desktop đóng hoặc mất mạng | Mất nối tạm thời — mở lại desktop, phone tự nối lại |

*Nguồn: docs mobile companion, mục Troubleshooting (trích có rút gọn), truy
2026-09-08.*

Trích nguyên văn phần quan trọng nhất:

> "Pairing fails — make sure your desktop and phone are signed into the same
> Orca account. Pairing codes expire after a few minutes; generate a fresh one
> if it's been sitting on the screen. … Closing the desktop app drops the
> connection; reopen desktop and the phone reconnects automatically."

*Nguồn: docs mobile companion, mục Troubleshooting, truy 2026-09-08.*

Đọc kỹ dòng cuối: rớt nối là trạng thái tạm, không phải lỗi cần cài lại gì —
mở lại desktop là đường nối tự hồi.

Toàn bộ bối cảnh cài đặt và lần chạy đầu của desktop nằm trong trang [getting
started](/vi/docs/getting-started/). Còn để thử trọn một vòng: dựng cặp đôi,
mở story view của story đang chạy, và để gate tiếp theo đến gặp bạn trên điện
thoại thay vì bạn đi tìm nó.
