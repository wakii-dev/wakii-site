---
title: "Android emulator: mobile ngay trong app"
description: "Kiểm tra flow mobile không còn là cầm máy thật rồi gõ adb tay ngoài vòng agent: skill orca-emulator-android để agent tự boot AVD, tap, swipe, gõ chữ, cài app, đọc logcat ngay trong phiên làm việc."
pubDate: "2026-09-17"
category: "tech"
tags: ["features", "android", "mobile"]
draft: false
---

Một flow mobile chỉ thật sự chạy khi nó chạy trên thiết bị: nút bấm nằm đúng chỗ,
màn hình chuyển đúng thứ tự, logcat không văng lỗi. Cách kiểm tra quen thuộc là
cầm máy thật hoặc mở emulator rồi tự gõ từng lệnh adb — một vòng lặp nằm trọn
ngoài tầm với của agent. Agent sửa xong code phải dừng, chờ người gõ lệnh, chờ
người đọc kết quả rồi mô tả lại. Skill `orca-emulator-android` gỡ nút thắt đó:
agent tự boot AVD, tự tap, swipe, gõ chữ, bấm Back, xoay màn hình, cài và mở app,
đọc accessibility tree và logcat — ngay trong phiên làm việc.

TL;DR:

- Skill `orca-emulator-android` cho agent điều khiển một Android emulator hoặc
  thiết bị thật đã kết nối adb: listing/booting AVDs, taps, swipes, typing,
  hardware buttons (Back, Recents), rotation, app install/launch, runtime
  permissions, accessibility tree, logcat.
- File skill là một discovery stub; guide đầy đủ khớp theo phiên bản do binary
  `orca` tự phục vụ qua lệnh `skills get`.
- Nhóm lệnh `orca emulator` không chỉ nằm trong tài liệu: start script của
  workspace mobile gọi thật `emulator attach` và `emulator tap` trong vòng lặp dev.
- Bản app mobile Android đã ship dưới dạng pre-release mobile-android-v0.0.48
  ngày 2026-09-05; giới hạn thật ghi ở cuối bài: cần adb-connected
  device/emulator, và cú pháp lệnh thay đổi theo release.

## Vòng lặp mobile dừng ở bàn tay con người

Mọi agent đều biết sửa code. Điểm gãy của mobile không nằm ở code mà ở khâu xác
minh: muốn biết nút bấm có hoạt động, phải có một thiết bị đang chạy app. Vòng
lặp kiểu cũ đặt con người ở chính giữa hai nửa của vòng đó — agent tạo ra thay
đổi, còn người cầm máy tạo ra phản hồi:

```ascii
vòng lặp mobile kiểu cũ — mắt và tay con người đứng giữa hai nửa

  agent: sửa code ──► build xong ──► DỪNG, chờ
                                       │
  con người: cầm máy / mở emulator     ▼
    ├─ gõ tay từng lệnh: adb install, adb shell input tap, …
    ├─ nhìn màn hình, đọc logcat
    └─ mô tả lại kết quả cho agent ◄── mỗi vòng lặp mất một lượt hội thoại
```

*Nguồn: sơ đồ khái niệm minh họa vòng lặp mà skill orca-emulator-android sinh ra
để rút ngắn, lấy 2026-09-08.*

Chi phí này nhân theo số vòng lặp: một lỗi UI chỉ lộ ở lần tap thứ ba nghĩa là
ba lượt người thật gõ lệnh rồi đọc màn hình. Agent không đóng được vòng lặp của
chính nó, và người dev thành một thiết bị trung chuyển có hiểu ngữ cảnh — lãng
phí cả hai phía.

## Skill orca-emulator-android: thiết bị trong tầm tay agent

Skill `orca-emulator-android` nằm trong tag v1.4.199 của repo sản phẩm, cạnh
`orca-emulator` (iOS) và `orca-cli`. Danh sách năng lực — trích nguyên văn từ
file skill:

> "Engage Orca whenever you drive an adb-connected Android emulator or device
> from inside the Orca app: listing/booting AVDs, taps, swipes, typing, hardware
> buttons (including Back and Recents), rotation, app install/launch, runtime
> permissions, the accessibility tree, and logcat. It is cross-platform
> (Windows, Linux, macOS) and complements the orca-emulator (iOS) and orca-cli
> skills."

*Nguồn: skills/orca-emulator-android/SKILL.md, tag v1.4.199 repo wakii-dev/wakii,
lấy 2026-09-08.*

Đọc danh sách theo mặt việc: chuẩn bị (liệt kê và boot AVD), thao tác (tap,
swipe, gõ chữ, nút Back và Recents, xoay màn hình), quản app (cài, mở, cấp quyền
runtime), và quan sát (accessibility tree, logcat). Hai mục cuối là phần thưởng
lớn nhất cho agent: thay vì nhìn chụp màn hình rồi đoán, agent đọc cấu trúc
widget thật của màn hình và log của thiết bị.

Agent tải guide đầy đủ bằng một lệnh — khối dưới đây chép lại từ chính file skill:

```text
ORCA skills get orca-emulator-android
```

*Nguồn: skills/orca-emulator-android/SKILL.md, mục "Load the full guide before
running Orca commands", lấy 2026-09-08.*

(`ORCA` là placeholder cho executable đã resolve — file skill dành hẳn một mục
để chỉ cách chọn đúng, vì chữ `orca` không phải lúc nào cũng trỏ về app.)

## Từ agent đến màn hình emulator

```ascii
agent ──► skill orca-emulator-android ──► binary `orca` ──► adb ──► emulator

  agent (trong phiên làm việc)
    │  "boot AVD, mở app, tap nút đăng nhập, đọc logcat"
    ▼
  skill tra guide khớp phiên bản ──► binary `orca`
    │  emulator devices --json, rồi tra lệnh cho: boot AVD, tap, swipe,
    │  type, rotation, install/launch
    │  (cú pháp cụ thể do guide theo phiên bản phục vụ — stub cấm đoán)
    ▼
  adb ── cầu nối thiết bị
    ▼
  Android emulator hoặc thiết bị thật đã kết nối
    └─ accessibility tree + logcat chảy ngược về agent
```

*Nguồn: dựng từ skills/orca-emulator-android/SKILL.md và các lời gọi thật trong
mobile/scripts/start-emulator.mjs, lấy 2026-09-08.*

Khác biệt so với gõ tay không nằm ở tốc độ từng lệnh — nằm ở chỗ kết quả quay
về. Accessibility tree và logcat đi thẳng vào ngữ cảnh agent đang làm, nên vòng
"thấy lỗi — sửa — thử lại" không còn phải đổi chủ giữa hai cái đầu.

## Vòng lặp dev mobile đã có script, bản mobile đã ship

Nhóm lệnh `orca emulator` không chỉ nằm trong tài liệu. Workspace mobile của repo
sản phẩm có script khởi động vòng lặp dev: một lệnh attach emulator qua
`orca emulator attach`, bật Metro bundler, mở app trên màn hình emulator — và cả
thao tác tap xác nhận trên màn hình cũng đi qua `orca emulator tap`:

```bash
# usage ghi trong header của script
node scripts/start-emulator.mjs [--worktree <path>] [--device <name>]

# hai lời gọi thật bên trong script (trích, tag v1.4.199):
await orca(['emulator', 'attach', device.udid, '--worktree', worktree, '--focus', '--json'], …)
await orca(['emulator', 'tap', '0.5', '0.56', '--worktree', worktree, '--json'], …)
```

*Nguồn: mobile/scripts/start-emulator.mjs — dòng usage trong header và các lời
gọi `orca emulator attach` / `orca emulator tap` (dòng 173, 516), lấy 2026-09-08.*

Asset demo đi cùng docs cũng đã nằm sẵn trong repo:

```bash
$ ls -lh docs/assets/orca-mobile-emulator.gif
-rw-r--r--  1 <user> <group>   1.8M Aug 30 23:46 docs/assets/orca-mobile-emulator.gif
```

*Nguồn: `ls -lh` trên checkout cục bộ repo wakii-dev/wakii, lấy 2026-09-08.*

Còn bản app mobile Android đã ra khỏi máy dev: release `mobile-android-v0.0.48`,
pre-release ngày 2026-09-05 — cùng ngày với hai bản desktop v1.4.198 và v1.4.199.
Nhịp ba release trong một ngày này là chủ đề của bài
[shipping cadence: hai release trong một ngày](/vi/blog/shipping-cadence-two-releases-one-day/).

*Nguồn: trang Releases repo wakii-dev/wakii — v1.4.198 (12:47 UTC),
mobile-android-v0.0.48 (13:00 UTC), v1.4.199 (19:07 UTC), đều 2026-09-05, lấy
2026-09-08.*

## Giới hạn thật

Hai giới hạn ghi thẳng trong chính file skill. Thứ nhất, file skill không phải
tài liệu tham khảo — trích nguyên văn:

> "This file is a discovery stub, not the usage guide. The full, version-matched
> Orca Android emulator reference is served by the `orca` binary itself — kept
> out of this file on purpose so it can never drift from the binary that will
> actually run your commands."

*Nguồn: skills/orca-emulator-android/SKILL.md, tag v1.4.199, lấy 2026-09-08.*

Nghĩa là bài này cố tình không liệt kê cú pháp lệnh: stub không liệt kê, vì lệnh
thay đổi theo release. Agent phải `skills get` trước rồi mới chạy; với binary cũ
không nhận `skills get`, stub cấp đúng hai lệnh định vị read-only:

```text
ORCA status --json
ORCA emulator devices --json
```

*Nguồn: skills/orca-emulator-android/SKILL.md, mục "If an older Orca does not
recognize `skills get`", lấy 2026-09-08.*

Thứ hai, phạm vi điều khiển bắt đầu ở adb: skill làm việc với "a real
adb-connected device or emulator" — không có thiết bị kết nối thì không có gì để
điều khiển. Chi tiết cross-platform cũng thật: trên Linux ngoài terminal do Orca
quản lý, chữ `orca` thường resolve thành trình đọc màn hình GNOME — file skill
dành hẳn một mục chỉ executable đúng để dùng thay vì đoán.

Bắt đầu từ một agent có tay: trang [getting started](/vi/docs/getting-started/)
hướng dẫn cài Wakii và kết nối môi trường làm việc đầu tiên. Muốn tự thấy phần
còn lại: cắm thiết bị Android, bật debugging, rồi giao thẳng việc — "boot AVD,
mở app, tap qua flow đăng nhập, đọc logcat xem có lỗi không". Phần gõ tay giao
cho máy, phần quyết định giữ lại cho bạn; còn năng lực đầy đủ của emulator
Android thì chỉ có một chỗ khớp với hiện tại — hỏi thẳng binary:
`orca skills get orca-emulator-android`.
