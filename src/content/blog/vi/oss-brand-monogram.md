---
title: "Brand monogram w.: một icon, hai repo"
description: "Một chữ w. vẽ bằng hình học SVG sống ở hai repo với hai pipeline khác nhau: site dùng vector cho favicon và OG image, app desktop dựng icns/png từ Icon Composer — bài này đọc cả hai đầu để chỉ ra vì sao chỉ cần một master."
pubDate: "2026-09-28"
category: "tech"
tags: ["oss", "design", "wakii"]
draft: false
---

Icon là chi tiết dễ bị coi là vặt — cho đến khi dự án của bạn là một fork, và icon trở thành ranh giới bản sắc rõ nhất giữa bạn và dự án mẹ. Lúc đó "vẽ cái logo" không còn là chuyện thiết kế thuần: một hình phải sống ở hai repo với hai pipeline xuất khác nhau, một bên là web tiêu thụ vector, một bên là app desktop cần icns và png. Wakii giải bài đó bằng cách hàng đầu của ngành xây tường: một hình học duy nhất, mọi thứ khác sinh ra từ nó. Bài này đọc từng đầu của đường ống đó — từ file SVG trên site đến script dựng icon trong repo sản phẩm — và để chính các file tự chứng minh.

TL;DR:

- Icon "w." là hình học thuần, không phụ thuộc font — quyết định ghi thẳng trong comment của file, kèm lý do: font render khác nhau giữa các nền tảng.
- Phía site, một file master `wakii-icon.svg` phục vụ ba nơi tiêu thụ: favicon (bản twin cùng hình học), GitHub avatar, và hình gốc cho OG image.
- Phía app, icon được dựng từ một project Icon Composer (`icon.icon`) qua script `generate.sh` — ra `icon.icns` cho macOS, `icon.png` cho tray và fallback.
- Lịch sử thay đổi icon được ghi bằng commit, không bằng lời kể — ba commit thương hiệu đọc được bằng một lệnh `git log`.

## Chữ w. vẽ bằng hình học, không font

Toàn bộ bản sắc của Wakii nằm gọn trong một file SVG. Cấu trúc của nó:

```text
viewBox="0 0 128 128"
rect 128×128, rx=28, gradient #131A17 → #04140D
path "M26 42 L44 88 L64 48 L84 88 L102 42"
     stroke #45E0A8, width 13, round caps
circle cx=106 cy=86 r=8.5, fill #D7E2DD
```

*Nguồn: `public/wakii-icon.svg`, repo `wakii-dev/wakii-site`, lấy 2026-09-08.*

Ba hình: một ô vuông bo góc tối chặng gradient, một nét gấp khúc vẽ chữ w, một chấm tròn. Không có phần tử `<text>` — nghĩa là không cần font, không cần lo hệ nào thiếu glyph nào. Quyết định này có nguồn gốc được ghi lại ngay trong file favicon:

```text
<!-- wakii monogram icon — "w." drawn as geometry, no font
     dependency. Replaces the old <text>-based favicon
     (font rendering was inconsistent across platforms).
     Direction: The Monogram, 2026-09-05. -->
```

*Nguồn: `public/favicon.svg`, repo `wakii-dev/wakii-site`, lấy 2026-09-08.*

Comment ấy kể ngắn gọn một lần thất bại cũ: bản favicon trước đây dùng `<text>` và bị font render không nhất quán giữa các nền tảng. Hình học thuần là cách sửa triệt để — nét vẽ của bạn hiển thị y hệt trên mọi máy vì nó không phải nhờ font nào dựng giúp. Hướng thiết kế "The Monogram" cũng được đóng dấu ngày chọn: 2026-09-05, sau một vòng draft ba hướng.

## Một master, ba nơi tiêu thụ phía site

File `wakii-icon.svg` không phải chỉ là một icon nằm im trong `public/`. Comment đầu file tự liệt kê vai trò của nó:

```text
<!-- wakii icon symbol — "The Monogram" (chosen 2026-09-05,
     3-direction draft). Master file for reuse: favicon
     (public/favicon.svg is the small-size twin), GitHub
     avatar, og-image, Electron app icon source. -->
```

*Nguồn: `public/wakii-icon.svg`, repo `wakii-dev/wakii-site`, lấy 2026-09-08.*

Bốn nơi tiêu thụ được khai trong comment — hãy kiểm chứng từng nơi. Favicon: `favicon.svg` chứa y hệt ba hình của master (cùng `viewBox`, cùng path, cùng gradient, cùng chấm tròn), chỉ khác phần comment — đúng định nghĩa "small-size twin". Nơi gắn vào HTML:

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

*Nguồn: `src/layouts/Base.astro`, dòng 84, repo `wakii-dev/wakii-site`, lấy 2026-09-08.*

OG image — tấm card hiện khi chia sẻ link — dùng đúng bảng màu của icon, với nguồn ghi sẵn trong file: `og-default.svg` (1200×630) comment ngay dòng đầu "brand mono ~/wakii. aesthetic (tokens.css: bg #0A0E0D, accent #45E0A8, text #D7E2DD, dim #6B7A74)". Bảng màu ấy không phải chọn riêng cho tấm card: nó là cùng bộ token của toàn site — bài về [bento và tokens](/vi/blog/arch-site-bento-tokens/) đi sâu vào hệ đó, và bài về [hợp đồng OG article](/vi/blog/og-article-contract-anatomy/) mổ tấm card theo khía cạnh SEO. Một bảng màu chảy từ tokens.css qua icon, favicon, card chia sẻ — đó là điều "một master" mang lại: không phải một file duy nhất, mà là một nguồn hình học và màu duy nhất mọi nơi dẫn về.

```ascii
tokens.css (bảng màu)
   │
   ├─► wakii-icon.svg ── master hình học
   │        ├─► favicon.svg  ── trình duyệt (Base.astro)
   │        ├─► GitHub avatar ── repo công khai
   │        └─► og-default.svg ── card chia sẻ 1200×630
   │
   └─► icon.icon (Icon Composer) ── phía app
            └─► generate.sh ──► icns + png
```

*Nguồn: sơ đồ tổng hợp từ comment trong `wakii-icon.svg`, `Base.astro` dòng 84, `og-default.svg` — repo `wakii-dev/wakii-site`, lấy 2026-09-08.*

## Phía app: Icon Composer thay vì SVG

Web ăn SVG tươi, nhưng desktop không sống với vector đơn thuần — macOS cần `.icns` với các slot kích thước riêng, tray cần png đúng cỡ. Repo sản phẩm giải bằng một pipeline dựng riêng, entry point là một script trong `package.json`:

```text
"build:icons": "bash resources/icon-source/generate.sh"
```

*Nguồn: `package.json`, dòng 98, repo `wakii-dev/wakii` (bản clone cục bộ), lấy 2026-09-08.*

Đọc phần đầu `generate.sh` thì nguồn duy nhất của cả pipeline lộ ra:

```text
# Generate app icons from Icon Composer .icon project
# Produces: resources/build/icon.icns (macOS),
#           resources/build/icon.png (fallback),
#           resources/icon.png (tray)
```

*Nguồn: `resources/icon-source/generate.sh`, repo `wakii-dev/wakii`, lấy 2026-09-08.*

Thư mục `resources/icon-source/` đúng chứa hai file: `icon.icon` — project của Icon Composer, công cụ dựng icon của Apple — và script `generate.sh` chạy `actool` của Xcode để biên dịch `.icon` thành `.icns`, rồi dùng ImageMagick xử lý các slot nhỏ. Một dòng comment trong script cho biết vì sao phải làm vụ này cẩn thận: "macOS list views use the small .icns slots directly" — các khung danh sách của macOS đọc thẳng slot nhỏ trong icns, nên từng slot phải chuẩn, không thể phóng to thu nhỏ tuỳ hứng như trên web.

Đáng chú ý là kiến trúc hai nguồn: site dùng SVG thuần làm master, app dùng project Icon Composer làm master. Hai nguồn không đồng bộ tự động — chúng là hai bản thể hiện của cùng một hình học "w.", mỗi bên giữ đúng định dạng môi trường của mình cần. Khi hình học thay đổi, cả hai thay đổi bằng một commit ở mỗi repo — và lịch sử git ghi lại đúng như vậy.

## Icon đổi ở đâu, được ghi bằng commit

Ai thay đổi gì ở icon — câu trả lời không nằm trong lời kể mà trong lịch sử file. Ba commit thương hiệu gần nhất chạm `resources/icon.png` của repo sản phẩm:

```text
$ git log --oneline -3 -- resources/icon.png
b4149b602a brand: wakii monogram app icon — replace orca-era icon assets
d0d6fdefcf feat(brand): rename app display name to wakii
1cef5a2802 feat(brand): replace Orca logo/icon with HoiVu branding
```

*Nguồn: `git log --oneline -3 -- resources/icon.png` trên nhánh `wakii-dev`, bản clone cục bộ của repo `wakii-dev/wakii`, lấy 2026-09-08.*

Ba dòng ấy kể trọn một vòng đời thương hiệu: thay logo cũ bằng nhận diện HoiVu, đổi tên hiển thị thành wakii, rồi thay hẳn tài sản icon thời orca bằng monogram. Commit `b4149b602a` là mốc monogram bước vào tài sản icon của app — trên nhánh `wakii-dev`, tại thời điểm bài này đọc lịch sử; bài không khẳng định thêm về bản release nào chứa nó. Cách app tiêu thụ các icon này cũng đọc được trong code: `src/main/app-icon.ts` dựng bản đồ `APP_ICON_PATHS` với ba lựa chọn runtime — `classic` (dùng `icon.png` ở bản phát hành, `icon-dev.png` ở bản dev), cùng `watercolor` và `blue` — cho phép đổi icon ứng dụng lúc chạy, và giữ thay đổi đó bằng AppleScript gọi `NSWorkspace` của macOS.

Một hình học, hai repo, hai pipeline — và không có bước nào trong chuỗi là hộp đen: mỗi khớp nối là một file đọc được, mỗi thay đổi là một commit tra được. Câu hỏi "Wakii khác Orca ở đâu" có nhiều câu trả lời kỹ sâu; câu ngắn nhất nằm ngay tab trình duyệt của bạn — một chữ w. mint trên nền tối. Tải Wakii và xem icon đó xuất hiện ở dock của bạn, hoặc đọc [FAQ](/vi/docs/faq/) để rõ hơn quan hệ giữa Wakii và Orca.
