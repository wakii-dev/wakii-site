---
title: "Anatomy: hợp đồng OG article của blog"
description: "Bài này mổ hợp đồng Open Graph của blog bằng chính code trong repo: og:image tuyệt đối, og:type article, article:published_time — kèm transcript grep trên bản build thật để bạn tự kiểm."
pubDate: "2026-09-05"
category: "tech"
tags: ["og", "seo", "wakii"]
draft: false
---

Dán một link bài viết vào Facebook, X hay Zalo, bạn thấy (hoặc không thấy) một
preview kèm hình — kết quả đó do bộ thẻ `<meta>` Open Graph trong HTML của trang
quyết định. Blog này không để phần đó tuỳ cảm hứng từng trang: nó có một hợp
đồng OG ghim ngay trong code, gồm ba điều khoản — og:image luôn là URL tuyệt
đối, trang bài viết tự khai og:type là article, và kèm article:published_time
dưới dạng timestamp ISO. Bài này mổ từng điều khoản bằng chính file nguồn trong
repo, rồi chỉ bạn một lệnh grep để tự kiểm trên HTML đã build. Mọi trích dẫn
dưới đây truy ngược được về dòng code gốc — không cần tin lời ai.

TL;DR:

- og:image phải tuyệt đối vì social crawler bỏ giá trị tương đối một cách âm
  thầm — comment trong `Base.astro` ghi rõ lý do, và dòng
  `new URL(ogImage, Astro.site)` là chỗ giải quyết.
- Trang bài viết truyền `ogType="article"` + `publishedTime` qua props; layout
  render thành `og:type` và `article:published_time`, thẻ thời gian chỉ xuất
  hiện khi có prop.
- Mọi trang không phải bài viết vẫn nhận og:image tuyệt đối miễn phí nhờ default
  `/og-default.png` trong layout dùng chung.
- Cuối bài là transcript grep thật trên thư mục `dist/` sau `pnpm build` — bạn
  chạy lại được trên máy mình.

## Vì sao og:image phải là URL tuyệt đối

Chuyện bắt đầu từ một lỗi không báo lỗi. Khi crawler mạng xã hội đọc HTML và
gặp `og:image` mang giá trị tương đối kiểu `/og-default.png`, nó không có gốc
domain nào để ghép vào — và theo đúng comment trong layout, giá trị đó bị bỏ
đi im lặng: trang vẫn share được, nhưng không có hình, và không một thông báo
lỗi nào ở bất kỳ đâu. Đây là toàn bộ comment contract trong `Base.astro`:

```ts
  /**
   * og:image path — ALWAYS resolved against Astro.site into an absolute URL.
   * Contract PINNED (spec FI-339 rev 2): relative og:image values are dropped
   * silently by social crawlers (Facebook/X/Zalo). Default: /og-default.png.
   */
  ogImage?: string;
```

*Nguồn: src/layouts/Base.astro (Props), lấy 2026-09-07.*

Và dòng code thực thi điều khoản đó — nơi path tương đối được ghép với gốc site
thành URL tuyệt đối:

```astro
<meta property="og:image" content={new URL(ogImage, Astro.site)} />
```

*Nguồn: src/layouts/Base.astro (head), lấy 2026-09-07.*

`new URL(ogImage, Astro.site)` đọc như sau: lấy giá trị `ogImage` (mặc định là
`/og-default.png`), ghép với `Astro.site` — gốc site được cấu hình một lần trong
`astro.config.mjs` từ hằng số `SITE_URL = 'https://wakii.xyz'` trong
`src/config.ts`. Vẽ lại đường đi của một prop:

```ascii
trang truyền prop               Base.astro render <meta>
──────────────────              ─────────────────────────────────────────────
ogImage="/og-default.png" ──▶   new URL(ogImage, Astro.site)
                                           │
                Astro.site = https://wakii.xyz
                                           ▼
                             <meta property="og:image"
                                  content="https://wakii.xyz/og-default.png">
```

*Nguồn: src/layouts/Base.astro + src/config.ts, lấy 2026-09-07.*

Điểm đáng đọc nhất trong comment là chữ "silently": đó đúng là kiểu lỗi khó bắt
nhất — không crash, không log, chỉ là preview mất hình trên một nền tảng mà dev
phải mở máy khác mới thấy. Giải pháp cũng vừa đủ: ép resolve ở đúng một dòng,
trong đúng một layout, rồi mọi trang đều đi qua cửa đó.

## og:type article và published_time nghĩa gì

Điều khoản thứ hai và thứ ba nằm ở trang bài viết. `src/pages/blog/[slug].astro`
khai báo hợp đồng ngay phía trên chỗ truyền props:

```astro
{/* og contract: posts are articles — pinned in spec FI-339 rev 2 (og:type + published_time + absolute og:image) */}
<Base
  title={entry.data.title}
  description={entry.data.description}
  ogType="article"
  publishedTime={entry.data.pubDate.toISOString()}
  ogImage="/og-default.png"
>
```

*Nguồn: src/pages/blog/[slug].astro, lấy 2026-09-07.*

Layout nhận hai props này và render ra `<head>`:

```astro
<meta property="og:type" content={ogType} />
{publishedTime && <meta property="article:published_time" content={publishedTime} />}
```

*Nguồn: src/layouts/Base.astro (head), lấy 2026-09-07.*

Đọc ở mức contract — đúng mức mà comment nói, không thêm — mỗi trang bài viết
tự khai báo hai điều: "tôi là một article", và "tôi xuất bản tại thời điểm ISO
này". Timestamp được sinh từ `pubDate` của bài qua `toISOString()`, nên luôn đủ
dạng ISO-8601 với múi giờ Z. Dòng render thứ hai còn một chi tiết đáng nhớ: nó
là render có điều kiện — `{publishedTime && …}` — trang nào không truyền prop
này thì thẻ `article:published_time` đơn giản không xuất hiện trong HTML, chứ
không render rỗng. Còn từng crawler platform đọc hai thẻ này thế nào, ưu tiên ra
sao — đó là chuyện của từng platform; code và comment chỉ cam kết phần khai báo,
và bài này dừng đúng ở đó.

## Một dòng, cả hệ thống đúng

Điều khoản og:image không cần mỗi trang tự lo, vì layout dùng chung đã gán
default ngay khi destructure props:

```ts
const {
  title,
  description = SITE_TAGLINE,
  noindex = false,
  ogImage = '/og-default.png',
  ogType = 'website',
  publishedTime,
} = Astro.props;
```

*Nguồn: src/layouts/Base.astro, lấy 2026-09-07.*

`Base.astro` là layout của toàn site — landing, docs, download, skills, blog
listing và từng bài viết đều đi qua nó. Hệ quả của hai giá trị default đó:

| Loại trang | og:type | article:published_time | og:image |
|---|---|---|---|
| Bài viết blog | `article` (truyền tường minh) | có — ISO từ pubDate | `/og-default.png` → tuyệt đối |
| Mọi trang khác | `website` (default) | không render | `/og-default.png` (default) → tuyệt đối |

*Nguồn: bảng tổng hợp từ src/layouts/Base.astro + src/pages/blog/[slug].astro,
lấy 2026-09-07.*

Nghĩa là một trang docs mới sinh ra ngày mai, không đụng gì tới OG, vẫn có sẵn
og:image tuyệt đối. Và contract comment nằm ngay khối Props của layout — đúng
nơi developer sẽ chạm vào khi sửa head hay thêm prop mới, cách vài dòng so với
chỗ render. Ai sửa mà "không thấy" contract thì phải là người cố tình không đọc.

## Tự kiểm trên trang thật

Một contract thì phải kiểm được. Sau `pnpm build`, HTML tĩnh nằm trong `dist/`,
vài lệnh grep đủ để đối chiếu lời với code:

```bash
$ grep -o '<meta property="og:type" content="[^"]*"' dist/blog/blog-story-case-study/index.html
<meta property="og:type" content="article"
$ grep -o '<meta property="og:image" content="[^"]*"' dist/blog/blog-story-case-study/index.html
<meta property="og:image" content="https://wakii.xyz/og-default.png"
$ grep -o '<meta property="article:published_time" content="[^"]*"' dist/blog/blog-story-case-study/index.html
<meta property="article:published_time" content="2026-09-03T00:00:00.000Z"
$ grep -o '<meta property="og:type" content="[^"]*"' dist/index.html
<meta property="og:type" content="website"
```

*Nguồn: grep trên `dist/` sau `pnpm build`, lấy 2026-09-07.*

Bốn dòng output khớp đúng contract: trang bài viết khai `article` kèm timestamp
ISO, og:image tuyệt đối trên tên miền production; trang chủ vẫn là `website`.
Còn nếu bạn chạy thêm grep `article:published_time` trên `dist/index.html`, lệnh
trả về không có gì — đúng mệnh đề render có điều kiện ở mục trên.

Muốn tự đọc toàn bộ markup này trên máy, trang [FAQ](/vi/docs/faq/) liệt kê thứ
cần để build site từ nguồn (Node 24, pnpm 12, git) — build xong, thư mục
`dist/` của bạn là bản chứng cứ. Bài [case study: chính blog này là một
story](/vi/blog/blog-story-case-study/) đã kể chuyện contract OG được ghim vào
code như một chi tiết của story workflow; bài này mổ nội dung của chính hợp
đồng đó.

Wakii là IDE agentic với đội superpowers dựng sẵn. Nếu bạn đang dựng một site
Astro và og:image của mình vẫn là path tương đối — hãy mở layout ra và ghép nó
với gốc site, trước khi một crawler nào đó "im lặng" bỏ nó đi.
