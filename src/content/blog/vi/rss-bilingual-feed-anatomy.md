---
title: "Anatomy: RSS feed song ngữ"
description: "Bài này mổ file rss.xml.js của blog: một feed gom bài cả hai locale, bỏ thẻ <language>, và mỗi item tự mang guid là permalink tuyệt đối — kèm transcript grep trên feed đã build để bạn tự kiểm."
pubDate: "2026-09-06"
category: "tech"
tags: ["rss", "wakii", "workflow"]
draft: false
---

Ai theo dõi blog này bằng reader RSS chỉ cần một địa chỉ: `/rss.xml`. Nhưng
blog không viết một thứ tiếng — mỗi bài ra hai bản, tiếng Việt và tiếng Anh.
Vậy feed trả về cái gì: một luồng hay hai? Khai báo ngôn ngữ thế nào? Hai bản
cùng một bài có bị reader gộp thành một không? Cả ba câu trả lời nằm gọn trong
một file 34 dòng: `src/pages/rss.xml.js`. Bài này mổ file đó qua ba quyết định
— một feed gom cả hai locale, không khai thẻ `<language>`, và mỗi item tự mang
`<guid>` là permalink tuyệt đối. Như bài anatomy trước, mọi trích dẫn dưới đây
truy ngược được về dòng code gốc, và cuối bài là transcript grep trên feed đã
build để bạn tự kiểm.

TL;DR:

- Một feed duy nhất: `getCollection('blog')` lấy mọi bài đã publish ở cả hai
  locale, sort mới-nhất-trước theo `pubDate`.
- Link từng item phân biệt locale ngay khi sinh: bài VI nhận prefix `/vi`, bài
  EN không — cùng slug, hai URL.
- Feed không có thẻ `<language>`: một feed hai ngôn ngữ không thể khai báo
  trung thực một ngôn ngữ duy nhất — thông tin ngôn ngữ nằm ở từng item.
- Mỗi item mang `<guid>` là URL tuyệt đối, duy nhất theo locale; hai bản của
  cùng slug là hai item phân biệt được.
- Cuối bài là transcript grep thật trên `dist/rss.xml` sau `pnpm build`.

## Một feed, hai ngôn ngữ

Toàn bộ feed sinh từ một file duy nhất. Phần tạo tập item là một lệnh
`getCollection` — không có bước nào lọc theo locale:

```js
  const site = context.site ?? SITE_URL;
  const posts = (await getCollection('blog', (b) => !b.data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
```

*Nguồn: src/pages/rss.xml.js, lấy 2026-09-07.*

Đọc từng vế: `getCollection('blog')` lấy toàn bộ collection blog; tham số thứ
hai là filter giữ lại bài không draft — bài `draft: true` không bao giờ rò vào
feed; rồi sort với hàm so sánh `b` trừ `a`, tức giảm dần theo `pubDate` — bài
mới nhất đứng đầu. Không có chỗ nào hỏi "bài này tiếng gì": cả hai locale đi
vào chung một mảng, nên kết quả là một luồng duy nhất xen kẽ hai ngôn ngữ theo
ngày xuất bản.

```ascii
getCollection('blog', !draft), sort DESC theo pubDate
────────────────────────────────────────────────────
bài EN ngày 06-09   ┐
bài VI ngày 06-09   │   mảng posts — MỘT mảng duy nhất
bài EN ngày 05-09   │   chứa cả hai locale
bài VI ngày 05-09   ┘
        │
        ▼
  một feed: /rss.xml — items xen kẽ theo ngày
```

*Nguồn: sơ đồ dựng từ logic getCollection + sort trong src/pages/rss.xml.js,
lấy 2026-09-07.*

Link của từng item thì phân biệt locale ngay tại chỗ sinh ra:

```js
      const locale = post.id.startsWith('vi/') ? 'vi' : 'en';
      const prefix = locale === 'vi' ? '/vi' : '';
      const link = `${prefix}/blog/${blogSlug(post.id)}/`;
```

*Nguồn: src/pages/rss.xml.js, lấy 2026-09-07.*

Id bài bắt đầu bằng `vi/` nhận prefix `/vi`, cho link `/vi/blog/<slug>/`; bài
EN không prefix, link `/blog/<slug>/`. Đây là điểm thiết kế đáng để ý nhất của
mục này: feed không tách thành hai kênh theo ngôn ngữ. Nó giữ một luồng và để
chính link của từng item trả lời câu hỏi "bản này tiếng gì". Ai muốn chỉ đọc
một ngôn ngữ thì đặt bộ lọc ở phía reader — phía feed không giữ quyền quyết
đó.

## Trade-off: bỏ thẻ <language>

RSS 2.0 cho phép một kênh tự khai ngôn ngữ bằng thẻ `<language>` ở cấp feed —
một giá trị duy nhất cho toàn bộ kênh. Feed này chủ động không có thẻ đó, và
lý do nằm ngay ở đầu file, viết thành comment hợp đồng:

```js
/**
 * RSS feed — all published posts, both locales.
 * Contract (FI-339 SF-1): bilingual feed → NO <language> element; every item
 * carries an explicit <guid> = absolute permalink URL (unique per locale).
 */
```

*Nguồn: src/pages/rss.xml.js (header comment), lấy 2026-09-07.*

Đây là một trade-off chọn có chủ đích, không phải thiếu sót. Một feed chứa cả
bài tiếng Việt lẫn bài tiếng Anh không thể khai báo trung thực một ngôn ngữ
duy nhất: ghi `vi-vn` là sai với nửa tiếng Anh, ghi `en-us` là sai với nửa
tiếng Việt, và không có giá trị thứ ba nào đại diện được cho cả hai. Thay vì
ghi một dòng sai nửa, file chọn im lặng ở cấp kênh — cấp mà nó không thể đúng
— và chuyển việc khai báo xuống cấp item, nơi thông tin chính xác: link có
prefix hay không, tiêu đề, mô tả, nội dung. Nói đúng ở mức contract mà comment
cam kết, không thêm: feed từ chối khai báo điều nó không thể đúng cho toàn
kênh, và đền bù bằng một định danh rõ ràng cho từng item. Định danh đó là mục
tiếp theo.

## guid là permalink tuyệt đối

Mỗi item của feed được dựng trong `items.map`, và dòng cuối cùng của object
trả về là dòng quyết định cả mục này:

```js
      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link,
        customData: `<guid>${new URL(link, site).href}</guid>`
      };
```

*Nguồn: src/pages/rss.xml.js (trong items.map), lấy 2026-09-07.*

Đọc dòng đó: link tương đối của item — ví dụ `/vi/blog/x/` — được
`new URL(link, site)` ghép với gốc site (`context.site`, fallback về
`SITE_URL`) thành URL tuyệt đối, rồi bọc trong thẻ `<guid>`. Vì link đã phân
biệt locale như mục đầu, hai bản của cùng slug cho ra hai guid khác nhau —
đúng điều comment hứa bằng cụm "unique per locale":

```ascii
slug x — hai locale
────────────────────────────────────────────────────────
bài EN, id "en/x"  ──▶  /blog/x/     ──▶  https://wakii.xyz/blog/x/
bài VI, id "vi/x"  ──▶  /vi/blog/x/  ──▶  https://wakii.xyz/vi/blog/x/

cùng slug — hai URL tuyệt đối khác nhau = hai guid phân biệt được
```

*Nguồn: sơ đồ dựng từ dòng link + customData trong src/pages/rss.xml.js, lấy
2026-09-07.*

Vì sao điều này đáng một mục riêng: trong RSS, `<guid>` là định danh của item
— phần mềm đọc feed dựa vào đó để nhận ra "item này đã thấy chưa". Hai bản
cùng slug có tiêu đề gần như song song, cùng ngày xuất bản, mô tả cùng nghĩa;
thiếu định danh riêng thì chúng dễ bị xem là một. Với hai guid là hai URL tuyệt
đối khác nhau, hai bản là hai item độc lập ngay từ cấp định danh. Và vì guid ở
đây là URL thật — trỏ đúng trang bài viết — nó vừa là định danh vừa là
permalink: item nào cũng truy về đúng trang của nó.

## Đọc feed thật

```bash
$ grep -o '<guid>[^<]*</guid>' dist/rss.xml | head -4
<guid>https://wakii.xyz/blog/building-wakii-in-the-open-log-1/</guid>
<guid>https://wakii.xyz/vi/blog/building-wakii-in-the-open-log-1/</guid>
<guid>https://wakii.xyz/blog/review-ai-agents-from-your-phone/</guid>
<guid>https://wakii.xyz/vi/blog/review-ai-agents-from-your-phone/</guid>
$ grep -o '<guid>[^<]*rss-bilingual-feed-anatomy[^<]*</guid>' dist/rss.xml
<guid>https://wakii.xyz/blog/rss-bilingual-feed-anatomy/</guid>
<guid>https://wakii.xyz/vi/blog/rss-bilingual-feed-anatomy/</guid>
$ grep -o '<item>' dist/rss.xml | wc -l
      20
```

*Nguồn: `grep …` trên `dist/rss.xml` sau `pnpm build`, lấy 2026-09-07.*

Bốn guid đầu là hai bài mới nhất của feed tại thời điểm build — mỗi slug xuất
hiện đúng hai lần, bản EN đứng trước bản VI trong cùng ngày (thứ tự ổn định
khi hai bài bằng ngày), và mọi guid đều là URL tuyệt đối trên tên miền
production, đúng thứ tự giảm dần. Lệnh thứ hai khoan đúng slug của chính bài
này: hai bản của nó cũng cho hai guid — EN không prefix, VI mang `/vi/`. Dòng
cuối đếm được 20 item — bằng số bài đã publish nhân hai locale (10 slug × 2)
tại thời điểm build. Số này sẽ tăng khi bài mới hạ cánh; cái được kiểm ở đây
là quan hệ item = bài × 2 locale, không phải con số cụ thể.

Muốn tự đọc file 34 dòng này trên máy, trang [FAQ](/vi/docs/faq/) liệt kê thứ
cần để build site từ nguồn (Node 24, pnpm 12, git) — build xong, cả
`src/pages/rss.xml.js` lẫn `dist/rss.xml` đều nằm trong tay bạn. Bài
[anatomy: hợp đồng OG article của blog](/vi/blog/og-article-contract-anatomy/)
là anh em cùng series của bài này: cùng kiểu mổ code thật, nhưng ở cặp thẻ
`<meta>` trong head của trang bài viết thay vì ở kênh phân phối. Hai bài cùng
nhau cho thấy một khuôn contract được áp lên hai mặt khác nhau của cùng một
blog.

Wakii là IDE agentic với đội superpowers dựng sẵn. Nếu bạn đang vận hành một
blog song ngữ bằng Astro, hai câu hỏi đáng tự hỏi về feed của mình: nó khai
báo trung thực về ngôn ngữ không, và mỗi item có định danh riêng để các bản
không bị gộp không. File `rss.xml.js` ở trên trả lời cả hai trong 34 dòng.
