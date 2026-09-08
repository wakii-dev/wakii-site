---
title: "Xây Wakii ra công khai — log 3"
description: "Log thứ ba của chuỗi xây Wakii công khai: story FI-349 thiết kế lại toàn bộ blog — phân loại category, trang bài hai locale, hero tile, hreflang — và khép lại bằng một PR duy nhất. Kèm đối chiếu trước/sau bằng số có nguồn."
pubDate: "2026-09-30"
category: "build-log"
tags: ["build-log", "wakii", "release"]
draft: false
---

Log 2 khép lại bằng một lời hứa: các con số sẽ được chụp lại và đối chiếu — cái nào nhích, cái nào đứng yên. Log này giữ nhịp đó nhưng đổi góc máy: thay vì kể bài viết mới, nó kể về cái khung đang chứa các bài viết ấy. Story FI-349 đã thiết kế lại blog từ một danh sách phẳng thành một hệ thống hai locale, rồi khép lại bằng một PR duy nhất đã merged. Câu hỏi của log này: thiết kế đóng góp gì cho một sản phẩm kỹ thuật, và làm sao biết nó đã làm đúng việc thay vì chỉ đẹp?

TL;DR:

- Story FI-349 thiết kế lại blog: layout mới, phân loại category, chiều sâu SEO, bề mặt article cho mỗi bài × 2 locale — phạm vi đọc được ngay từ tiêu đề PR #2.
- PR #2 merged 16:24 UTC ngày 2026-09-07 — một story, một nhánh, một PR, đúng nguyên tắc chuỗi này đang chạy.
- Trang bài là một article surface dựng từ layout chung: hero tile, related, JSON-LD, và cặp hreflang en-vi khai báo trong head của mỗi trang.
- Trước/sau đo được: từ bộ seed 10 bài (log 2 đã kể) đến 25 slug × 2 locale = 50 file tại snapshot 2026-09-08; kế hoạch công khai kế tiếp là 69 slug × 2 = 138 trang.

## Danh sách bài phẳng chạm trần

Trước FI-349, blog này là một danh sách: mỗi bài một thẻ, xếp theo ngày đăng, hết. Với mười bài seed, danh sách đó đủ dùng. Nhưng kế hoạch của blog không dừng ở đó: chuỗi longform đang kéo đến với bài hướng dẫn từng bước, bài kỹ thuật, và log xây sản phẩm — mỗi loại cần một chỗ đứng riêng trên listing, đều có hai ngôn ngữ, và đều mang yêu cầu SEO của một bài kỹ thuật dài. Khi số bài tăng và số ngôn ngữ là hai, những câu hỏi từng nhỏ trở thành quyết định kiến trúc: một bài nằm ở đường dẫn nào khi bạn đọc bản tiếng Việt? Category nào đủ rộng mà không thành rác? Trang bài cần chứa gì ngoài văn bản?

Phân loại trả lời bằng schema, không bằng quy ước:

```ts
// src/content.config.ts
/** tutorial | tech | build-log — drives the listing badge. */
category: z.enum(['tutorial', 'tech', 'build-log']),
```

*Nguồn: src/content.config.ts, repo công khai wakii-dev/wakii-site, lấy 2026-09-08.*

Ba category — tutorial, tech, build-log — là toàn bộ taxonomy của blog. Không tự chế tên mới, không thêm ngoài enum: schema từ chối mọi giá trị khác ngay lúc build, và lint của repo giữ đúng bộ ba ấy. Taxonomy tránh phình không phải nhờ kỷ luật của người viết, mà nhờ điều kiện build.

## FI-349: phạm vi đọc được từ tiêu đề PR

Story FI-349 chạy như mọi story trong quy trình này: spec, plan, các SF song song, hội tụ về một nhánh story, khép bằng đúng một PR. Điều đáng ghi nhận nằm ở chỗ phạm vi của cả story gói gọn trong tiêu đề PR — ai đọc cũng biết nó đã làm gì mà chưa cần mở diff:

```bash
$ gh pr view 2 --repo wakii-dev/wakii-site --json state,mergedAt,title
{"mergedAt":"2026-09-07T16:24:22Z","state":"MERGED","title":"FI-349 Blog redesign — layout, category taxonomy, SEO depth, multi content type"}
```

*Nguồn: gh pr view, repo wakii-dev/wakii-site, chạy 2026-09-08.*

Bốn cụm từ khóa trong tiêu đề là bốn lớp của thiết kế lại. Layout là khung hiển thị chung của site. Category taxonomy là bộ ba ở mục trước. SEO depth là canonical, hreflang, OG card cho từng bài. Multi content type là yêu cầu cùng một khung chứa được tutorial, bài kỹ thuật và log. Và như mọi story trước, [một nhánh, một PR](/vi/blog/one-branch-one-pr/) vẫn là nguyên tắc vận hành: kể cả khi phần lớn diff là giao diện, mọi thay đổi vẫn đi qua đúng một cửa merge có review.

## Trang bài là một article surface, không phải một trang markdown

Phần việc ít nhìn thấy nhất của FI-349 nằm ở trang bài. Route của mỗi bài là một file mỏng, gần như chỉ chọn đúng bài theo locale rồi giao phần còn lại cho một layout chung:

```astro
/* src/pages/blog/[slug].astro — EN blog post — thin route (FI-349 SF-2):
   getStaticPaths (draft filter, LOCKED) + render; the docs-shell article
   surface (sidebar, pager, meta, hero, related, after-CTA, JSON-LD) lives
   in BlogDetailLayout.astro. */
```

*Nguồn: chú thích trong src/pages/blog/[slug].astro, repo công khai wakii-dev/wakii-site, lấy 2026-09-08.*

Bảy thành phần trong chú thích trên — sidebar, pager, meta, hero, related, after-CTA, JSON-LD — là thứ một bài kỹ thuật cần để tồn tại như một trang web: điều hướng giữa các bài, dữ liệu có cấu trúc cho công cụ tìm kiếm, và một hero tile 1200×630 khi bài có hình đại diện. Hợp đồng của hero cũng ghi ngay trong schema: đường dẫn PNG nằm trong public/, không qua astro:assets, và bản VI dùng chung hero của bản EN. Log 3 này là ví dụ đầu tiên ngoài bộ seed: bản tiếng Anh khai báo heroImage trong frontmatter, còn bản tiếng Việt bạn đang đọc không có trường đó — theo hợp đồng, nó kế thừa đúng tấm hình ấy.

SEO depth nằm ở head của mỗi trang. Hai dòng sau khai báo với công cụ tìm kiếm rằng bài EN và bản VI của nó là hai bản của cùng một nội dung:

```html
<link rel="alternate" hreflang="en" href={new URL(canonicalPath, Astro.site)} />
<link rel="alternate" hreflang="vi" href={new URL(viPath, Astro.site)} />
```

*Nguồn: src/layouts/Base.astro, repo công khai wakii-dev/wakii-site, lấy 2026-09-08.*

Chú thích ngay trên hai dòng ấy ghi một cái bẫy thật: nếu canonical không trỏ về chính trang đó, cả cụm hreflang có thể bị công cụ tìm kiếm bỏ qua. Chi tiết nhỏ — nhưng đó là loại chi tiết mà chữ "SEO depth" trong tiêu đề PR đã mua về, và bài [mổ xẻ hợp đồng OG article](/vi/blog/og-article-contract-anatomy/) kể tiếp phần đó nếu bạn muốn xuống tận thuộc tính meta.

## Trước và sau, bằng số

Log 2 đã kể bộ seed 10 bài và kế hoạch 30 — bạn đọc lại ở [bài log 2](/vi/blog/building-wakii-in-the-open-log-2/). Log này chỉ bổ sung nửa sau của phép đối chiếu, chụp tại snapshot 2026-09-08:

| Mốc | Số liệu | Nguồn |
| --- | --- | --- |
| Bộ seed (FI-341) | 5 slug × 2 locale = 10 bài | evidence-pack, snapshot D8 |
| Sau story longform | 25 slug × 2 locale = 50 file | evidence-pack, snapshot 2026-09-08 |
| Kế hoạch công khai kế tiếp | +44 slug → 69 slug × 2 = 138 trang | matrix batch-2 commit trong repo |

*Nguồn: evidence-pack story FI-359, §Numbers snapshot (rows 5+7), chụp 2026-09-08; topic-matrix-batch2.md trong repo công khai, lấy 2026-09-08.*

Số release cũng thuộc phép đối chiếu ấy. Log 2 chụp ba tag — v1.4.199, v1.4.198, bản Android mobile-android-v0.0.48, tất cả ngày 2026-09-05; đến snapshot 2026-09-08, lần chạy lại lệnh trả về đúng ba tag đó, không thêm và không thiếu — kể cả việc không tồn tại bản 1.4.197 nào giữa hai bản desktop. Đứng yên cũng là một kết quả đối chiếu: chuỗi này không kể release khi chưa chạy lệnh lấy số.

## Viết là một phần sản phẩm

Kết của log này ngắn hơn phần kỹ thuật, vì câu đáng nói đã hiện ra từ ba mục trên: khi blog có schema, có taxonomy, có hợp đồng hero, có cặp hreflang — thì viết cũng trở thành một phần sản phẩm, có gate và lint của riêng nó thay vì là lớp trang trí đặt lên trên. Đó là lý do log 4, bài đăng cùng ngày, không kể "chúng tôi đã viết 20 bài" mà kể bộ khung nào bảo đảm hai mươi bài ấy không nói dối: matrix khóa trước, lint đếm từ, claims registry, và một lượt integration sau merge.

```ascii
/blog/<slug>/          bài EN
/vi/blog/<slug>/       bản VI — cùng slug
hreflang en <-> vi     cặp khai báo trong <head> của cả hai
```

*Nguồn: cấu trúc src/pages/blog và src/layouts/Base.astro, repo công khai wakii-dev/wakii-site, lấy 2026-09-08.*

Muốn tự tay chạy một story với đúng hình dạng này, trang [getting started](/vi/docs/getting-started/) dẫn bạn từ clone đến ⚡ Superpowers panel trong vài phút — phần còn lại của quy trình nằm chờ trong docs.
