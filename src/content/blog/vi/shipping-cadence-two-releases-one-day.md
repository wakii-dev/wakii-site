---
title: "Hai release trong một ngày — nhịp ship đến từ quy trình"
description: "Ngày 5/9, lịch release công khai của Wakii ghi hai release và một pre-release Android trong cùng một ngày. Bài này đọc transcript thật để giải thích vì sao nhịp ship là hệ quả của quy trình, và assets version-named thay đổi gì khi bạn tải app."
pubDate: "2026-09-02"
category: "build-log"
tags: ["release", "build-log", "wakii"]
draft: false
---

Nhiều đội dùng agent AI coi "release" là sự kiện lớn: gom hàng tuần thay đổi, đóng băng code, chạy một đợt kiểm thử dài, rồi mới dám cắt bản. [Log #1](/vi/blog/building-wakii-in-the-open-log-1/) của chuỗi này cũng ghi release 1.4.199 theo kiểu đó — một dòng sự kiện trong tuần. Nhưng phía sau dòng sự kiện là một cơ chế đáng nói hơn: vì sao quy trình dồn việc cho đội agent lại cắt được hai release và một pre-release Android trong cùng một ngày mà không phải gồng. Bài này bóc cơ chế đó từ bằng chứng công khai — không kể chuyện, và không khái quát những gì lịch release chưa chứng minh.

TL;DR:

- Một lệnh `gh release list` trên repo công khai `wakii-dev/wakii` trả về đúng ba dòng — và cả ba cùng đóng dấu 2026-09-05: v1.4.198, pre-release `mobile-android-v0.0.48`, và v1.4.199 (Latest).
- Nhịp ship nhanh không phải mục tiêu đua — nó là hệ quả: công việc chia thành sub-feature nhỏ, mỗi miếng qua gate kiểm độc lập, nên khi một miếng hoàn tất thì cắt bản được ngay.
- Android đi đường riêng: tag pre-release riêng, không chờ nhịp của desktop.
- Assets version-named: URL tải pin đúng version — tăng version là phải sửa URL, đổi lại link cũ không chết khi bản mới ra.

## Toàn bộ lịch release trong một lệnh

Điểm xuất phát là một lệnh, chạy trên máy đã có `gh` và đăng nhập GitHub CLI:

```bash
$ gh release list --repo wakii-dev/wakii --limit 6
Wakii 1.4.199	Latest	v1.4.199	2026-09-05T19:07:31Z
Wakii 1.4.198		v1.4.198	2026-09-05T12:47:15Z
Orca Mobile Android mobile-android-v0.0.48	Pre-release	mobile-android-v0.0.48	2026-09-05T13:00:31Z
```

*Nguồn: `gh release list --repo wakii-dev/wakii`, lấy 2026-09-08.*

Ba dòng, bốn cột: tên hiển thị, nhãn (Latest hoặc Pre-release), tag, và timestamp theo giờ UTC. Chuyện nằm ở hai chi tiết nhỏ. Một: lệnh xin `--limit 6` mà chỉ nhận ba dòng — nghĩa là tại thời điểm lấy, đó là toàn bộ release công khai của repo, không có gì nằm ngoài trang một. Hai: cả ba timestamp đều là 2026-09-05. Hai release desktop và một pre-release Android cùng sống trong một ngày lịch.

Không cần bối cảnh nội bộ nào để xác nhận điều đó — transcript ở trên tự nó đủ. Đây cũng là lý do bài này dẫn bằng lệnh: ai nghi thì gõ lại, thấy y hệt, chỉ khác ngày lấy.

## Nhịp ship và giá của nó

Xếp ba timestamp theo thứ tự thời gian, ngày 5/9 trông như sau:

```ascii
2026-09-05  (giờ UTC)
12:47:15Z  v1.4.198                 release desktop
13:00:31Z  mobile-android-v0.0.48   pre-release Android  (+13 phút)
19:07:31Z  v1.4.199                 Latest               (+6 giờ 07 phút)
```

*Nguồn: tính từ ba timestamp trong transcript `gh release list` ở trên.*

Một điều cần nói thẳng trước: một ngày bận rộn trong lịch không chứng minh dự án ship "hàng tuần" hay theo bất kỳ tần suất chung nào. Nó chứng minh một điều kiện khả thi — khi điều kiện đó có, cắt bản nhanh là chuyện bình thường, không phải nỗ lực đặc biệt.

Điều kiện đó đến từ cấu trúc công việc, không từ ý chí. Quy trình của Wakii chia feature lớn thành các sub-feature nhỏ, mỗi miếng nằm trong worktree riêng và phải qua gate kiểm độc lập trước khi khép — chi tiết cơ chế đã có ở bài [bracket và tier](/vi/blog/long-tasks-bracket-tiers/). Khi mỗi miếng tự chứng minh mình xong, việc đóng gói một miếng thành release không cần chờ cả loạt lớn hoàn tất. Hai release trong một ngày là hình chiếu của việc có nhiều miếng nhỏ đã sẵn sàng, chứ không phải của một cuộc đua đặt mục tiêu.

Nhưng nhịp nhanh có giá, và giá đó không trả tại lúc bấm cắt bản. Release xuất hiện dày nghĩa là hạ tầng release phải nhàm chán: đặt tag nhất quán, asset đặt tên theo quy ước, link tải không sập khi bản mới ra. Mọi mắt xích đó phải đúng cả khi bản được cắt lúc nửa đêm. Chi phí này trả trước bằng quy ước — và quy ước đó ghi hẳn trong code, như hai phần cuối bài chỉ ra.

## Bản Android đi đường riêng

Dòng thứ ba của transcript đáng đọc riêng. Nó mang nhãn Pre-release, tag `mobile-android-v0.0.48`, và timestamp 13:00:31Z — chen giữa hai release desktop: sau v1.4.198 khoảng 13 phút, trước v1.4.199 khoảng 6 giờ. Mobile không bị chặn bởi nhịp của desktop; nó lên kệ khi bản dựng của nó sẵn sàng, trên một tag có không gian tên riêng.

Đường ray đó cũng tự mô tả trong config của site:

```ascii
android: github.com/wakii-dev/wakii/releases/download/mobile-android-v0.0.48/app-release.apk
```

*Nguồn: `src/config.ts` — `MOBILE_STORE_URLS.android` (repo `wakii-site`), lấy 2026-09-08.*

Comment đi kèm dòng này trong code viết thẳng: "Android ships as a GitHub-release APK (sideload, no store)". Kênh pre-release không phải phiên bản thứ cấp của desktop — nó là sản phẩm khác, phát hành theo nhịp khác, và nhãn Pre-release trên GitHub là ranh giới công khai cho điều đó.

## Assets version-named nghĩa là gì

"Version-named" là quy ước đặt tên: mỗi asset của release mang số version ngay trong tên file. Hệ quả nằm ở URL tải — chúng cũng mang theo số version. Trong `src/config.ts`, quy ước này được ghi thành comment để người sửa sau không phải đoán:

```ascii
 * URL pattern: v1.4.198 switched to VERSION-NAMED assets, so URLs pin an
 * exact release — a version bump means updating these lines.
```

*Nguồn: `src/config.ts` (repo `wakii-site`), lấy 2026-09-08.*

Hai URL tải mà site đang pin, cả hai trỏ đúng v1.4.199:

```ascii
macos:   github.com/wakii-dev/wakii/releases/download/v1.4.199/Wakii-1.4.199-arm64.dmg
windows: github.com/wakii-dev/wakii/releases/download/v1.4.199/orca-windows-setup.exe
```

*Nguồn: `src/config.ts` — `DOWNLOAD_URLS` (repo `wakii-site`), lấy 2026-09-08.*

Đây là mặt giá mà phần trước nhắc: tăng version là phải sửa các dòng URL này — công việc tường minh, nằm trong code, ai đọc cũng thấy, không có chuyện link âm thầm đổi đích. Đối trọng của cái giá đó đáng hơn tưởng tượng: link bạn tải hôm nay vẫn còn đó và vẫn trỏ đúng asset của hôm đó, kể cả khi nhiều bản mới nữa ra đời. URL version-named là link bất biến; pattern kiểu "bản mới nhất" thì ngược lại — luôn trỏ đúng bản mới, nhưng không bao giờ cho bạn đúng bản cũ.

Mỗi quy ước là một lựa chọn. Cái này chọn tính lặp lại của link đã tải hơn là sự tiện của một link duy nhất — hợp với một dự án cắt release nhanh, nơi bản cũ có thể vẫn đang chạy trên máy của ai đó.

## Tải bản phù hợp với bạn

Docs [getting started](/vi/docs/getting-started/) mở đầu bằng chuyện này: "Tải bản build hoàn chỉnh tại trang download, hoặc theo dõi releases trên GitHub để biết sớm nhất khi có bản mới (gồm cả Windows)". Còn nếu bạn muốn tự soi nhịp ship như bài này đã làm, transcript ở đầu bài là một lệnh — gõ lại là có kết quả mới nhất.

Tại thời điểm viết, bản mới nhất là v1.4.199. Trang download pin sẵn link cho macOS và Windows — bấm tải là đúng bản đó, không phải đoán.
