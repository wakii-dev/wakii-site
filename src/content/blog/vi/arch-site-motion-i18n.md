---
title: "Site Wakii: motion và i18n hai locale"
description: "Hai tầng ít thấy nhưng quyết định cảm giác của wakii.xyz: một motion util data-attribute tôn trọng prefers-reduced-motion, và kiến trúc i18n hai lớp — routing prefix cùng hai bộ chuỗi typed."
pubDate: "2026-09-26"
category: "tech"
tags: ["architecture", "wakii"]
draft: false
---

Mở wakii.xyz và cuộn: các cell bento hiện dần lần lượt, nghiêng nhẹ theo con trỏ. Bấm chuyển sang tiếng Việt ở góc phải: URL nhảy thành `/vi/`, toàn bộ chữ đổi, bố cục giữ nguyên. Hai hiện tượng đó do hai hệ thống gọn đến bất ngờ gánh vác: một file motion duy nhất cho cả site, và một kiến trúc i18n hai tầng. Bài này mổ cả hai — contract data-attribute của motion, và cách EN/VI chia nhau ở tầng routing cùng tầng nội dung.

TL;DR:

- Motion của cả site gói trong `src/components/motion.ts`: `initMotion()` gọi một lần mỗi trang, điều khiển qua bốn loại data-attribute.
- `prefers-reduced-motion` hoặc pointer thô: util thoát trước khi ẩn bất cứ thứ gì — trang tĩnh vẫn đầy đủ thông tin.
- i18n tầng routing: `prefixDefaultLocale: false` — EN ở gốc domain, VI ở `/vi/`; cặp hreflang tự sinh trong `src/layouts/Base.astro`.
- i18n tầng nội dung: hai bộ chuỗi typed bơm vào cùng một cây component; set key của `downloads.ts` bị đóng băng từ story FI-300.

## Motion là một contract data-attribute

Toàn bộ chuyển động của site — reveal khi cuộn, tilt khi rê chuột, parallax giữa các cell — nằm trong đúng một file: `src/components/motion.ts`. Không thư viện animation, không runtime bên ngoài. API của file là một hàm duy nhất, `initMotion()`, gọi một lần mỗi trang; phần còn lại của hợp đồng là các data-attribute dán thẳng lên markup:

```ts
* Contract:
*   initMotion() once per page (e.g. in a component <script>).
*   [data-reveal] | .reveal        — reveal-on-scroll, 60ms stagger per batch
*   [data-tilt]                    — hover tilt-3D on the element itself
*   [data-tilt-host]               — mouse-parallax host; moves a child
*                                    matching [data-hero-term]
*   [data-parallax]                — scroll parallax container; direct
*                                    descendants with [data-depth] translate
```

*Nguồn: src/components/motion.ts, dòng 6-13, lấy 2026-09-08.*

Component muốn chuyển động chỉ cần dán attribute — không ai viết keyframe riêng cho cell của mình. Landing boot util này trong một thẻ script; các layout khác gọi `revealChildren()` để đánh dấu phần tử cần reveal trước khi init.

Điều kiện vào cửa đọc ngay dòng đầu hàm:

```ts
const RM = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
if (RM.matches || !finePointer.matches) return;
```

*Nguồn: src/components/motion.ts, dòng 23-25, lấy 2026-09-08.*

Người bật giảm chuyển động, hoặc thiết bị cảm ứng không có con trỏ mịn, nhận trang tĩnh đầy đủ. Cơ chế bảo đảm điều đó gói trong một class: `initMotion()` chỉ thêm `html.anim` khi mọi điều kiện thoả, còn `motion.css` chỉ ẩn phần tử trong phạm vi `.anim`. JavaScript không chạy thì không có `.anim`, không gì bị ẩn. Lớp chốt hạ nằm ở `global.css`: media query `prefers-reduced-motion` vô hiệu mọi animation bằng `animation: none !important`, và chính `motion.css` ghi trong chú thích rằng nó "must respect it, never override it".

## Vòng đời reveal: quan sát, lộ lần lượt, tự dọn

```ascii
initMotion()
  ├─ reduced-motion / coarse pointer? → return (không .anim — trang tĩnh)
  ├─ html.anim ON → .reveal ẩn, chờ vào viewport
  ├─ IntersectionObserver (threshold 0.15)
  │    ├─ sort phần tử theo vị trí → delay i × 60ms
  │    ├─ thêm .reveal-in → animation bxreveal 0.55s
  │    └─ animationend → xoá class + xoá data-reveal + xoá delay
  └─ scroll → rAF ticking → [data-depth] translate3d (parallax 3 tốc độ)
```

*Nguồn: sơ đồ dựng từ src/components/motion.ts + src/styles/motion.css, lấy 2026-09-08.*

Bước cuối là chỗ tinh vi nhất. Sau khi cell đã lộ, hàm dọn cả class lẫn attribute `data-reveal`. Lý do nằm trong comment của chính file: nếu chỉ xoá class mà giữ attribute, selector `.anim [data-reveal] { opacity: 0 }` áp dụng trở lại ngay sau animationend — mọi cell dựa trên attribute (download, skills bento, workflow gates, FAQ) mờ đi ngay sau lúc vừa xuất hiện. Comment ghi rõ đây là phát hiện Rule 0 của story FI-304: bug bắt được bằng click-chain thật trên trang, không phải bằng đọc code.

Nhánh tilt cũng tiết kiệm không kém: `mousemove` chỉ ghi góc mục tiêu, `requestAnimationFrame` kèm lerp 0.12 đuổi theo, rời chuột thì về 0. Toàn bộ chỉ dùng `transform` và `opacity` — hai thuộc tính không gây layout shift, đúng cam kết ghi ở đầu file.

## Tầng routing: EN gốc, VI mang prefix

Cấu hình i18n nằm trong `astro.config.mjs`, vài dòng, kèm nhãn LOCKED:

```js
i18n: {
  defaultLocale: 'en',
  locales: ['en', 'vi'],
  routing: {
    prefixDefaultLocale: false, // EN at /, VI at /vi/
  },
},
```

*Nguồn: astro.config.mjs, lấy 2026-09-08.*

Site là Astro 5 output static (phiên bản `^5.12.0` trong `package.json` tại thời điểm viết), nên cấu hình đó phân rã thành cây URL tĩnh sau build:

```ascii
wakii.xyz  (SITE_URL — src/config.ts)
├── /                        landing EN      ← src/pages/index.astro
├── /vi/                     landing VI      ← src/pages/vi/index.astro
├── /blog/<slug>/            bài EN          ← src/pages/blog/[slug].astro
├── /vi/blog/<slug>/         bài VI          ← src/pages/vi/blog/[slug].astro
├── /docs/<slug>/            docs EN (5 slug LOCKED)
└── /vi/docs/<slug>/         docs VI
```

*Nguồn: cây src/pages/ của repo, lấy 2026-09-08.*

Từ cây này, `src/layouts/Base.astro` sinh tín hiệu SEO cho từng trang: canonical tự trỏ chính nó theo từng locale, và cụm hreflang `en` / `vi` / `x-default` chéo nhau giữa cặp URL. Comment trong file ghi rõ quyết định: canonical không tự trỏ có thể khiến cả cụm hreflang bị bỏ qua. Cùng chỗ đó có một hợp đồng thú vị hơn: nếu một trang VI không tồn tại, hreflang vẫn trỏ URL VI tương ứng — vì route VI sinh từ cùng contract slug, thiếu trang VI nghĩa là thiếu slug ở cả hai locale, đó là vi phạm contract chứ không phải fallback. Domain cũng có một nguồn duy nhất: hằng `SITE_URL` trong `src/config.ts`, mà `src/pages/robots.txt.ts` dùng để sinh dòng Sitemap — không domain nào bị hardcode rải rác.

Nút chuyển EN | VI trên nav là `src/components/LangSwitcher.astro`. Nó map pathname hiện tại sang pathname của locale kia, với một prop fallback tên `viExists`: trang chưa có bản dịch trỏ về bản EN thay vì URL chết. Một script nhỏ trong component giữ anchor hash khi đổi locale — deep-link docs không vỡ khi bạn đang đứng ở một mục cụ thể.

## Tầng nội dung: hai bộ chuỗi, một cây component

Routing chỉ giải quyết URL. Chữ nằm ở chỗ khác: `src/i18n/landing.ts` xuất hai object `en` và `vi` cùng chịu ràng buộc bởi một interface `LandingStrings` — gõ sai key là gãy lúc compile, không đợi tới lúc render. Hai trang chủ là bằng chứng kiến trúc này: cùng một Landing component, khác nhau đúng một prop `strings`. Kể cả dữ liệu mockup — toạ độ node, cạnh, trạng thái của bracket canvas — nằm trong bộ chuỗi, để các component trong `src/components/mockups/` là renderer thuần nhận props.

Với trang downloads, hợp đồng chặt hơn nữa. Đầu file `src/i18n/downloads.ts`:

```
* KEY-OWNERSHIP RULE: SF-1 owns this file. After SF-1, SF-2/SF-3 must NOT
* add new keys here — a missing key is flagged to epic FI-300
```

*Nguồn: src/i18n/downloads.ts, dòng 4-5, lấy 2026-09-08.*

Set key đóng băng có lý do của nó: mỗi key gắn flag mang cả hai biến thể `live` và `notLive`, để một lần lật flag không bao giờ hiển thị copy chưa duyệt. Thêm key tuỳ tiện là phá cơ chế đó — nên việc cấm được viết thành comment trong code, không phải niềm tin.

Nội dung dài — blog và docs — đi tầng thứ ba: hai thư mục `src/content/blog/en/` và `src/content/blog/vi/` được nạp bởi cùng một glob loader, entry id mang tiền tố locale. Route VI của một bài blog là một file mỏng: `getStaticPaths` lọc entry có id bắt đầu bằng `vi/` và không draft. RSS là điểm hai tầng này gặp nhau — một feed duy nhất phát cả hai locale; bài [RSS bilingual feed anatomy](/vi/blog/rss-bilingual-feed-anatomy/) đã mổ chi tiết feed đó, kể cả quyết định bỏ thẻ `language`.

Cả hai tầng này phân rã thành HTML thuần sau build: motion là JavaScript duy nhất còn chạy khi trang mở, i18n là hai cây URL riêng biệt không dùng chung một dòng nội dung. Câu hỏi về site được gom ở [trang FAQ](/vi/docs/faq/). Muốn tự chạy story đầu tiên trên site của bạn, [trang getting started](/vi/docs/getting-started/) là điểm khởi đầu.
