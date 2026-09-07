---
title: "Case study: chính blog này là một story"
description: "Blog bạn đang đọc được dựng bằng chính quy trình story workflow mà các bài trong này giới thiệu — và bằng chứng nằm công khai trong repo. Bài này tháo máy ra xem: parity gate chạy ngay trong build, contract OG ghim bằng comment tại dòng code, và một PR duy nhất khép story đầu tiên."
pubDate: "2026-09-03"
category: "build-log"
tags: ["build-log", "story-workflow", "evidence"]
draft: false
---

Thể loại case study trong bài kỹ thuật có một điểm yếu cố hữu: người viết vừa là
tác giả vừa là nhân chứng, và độc giả chỉ còn cách tin lời. Bài này chọn hướng
khác — vì chính blog bạn đang đọc được dựng bằng story workflow, nên mỗi mệnh đề
dưới đây trỏ được tới một file, một lệnh, hoặc một pull request công khai. Không
cần tin ai: mở repo, chạy lại ba lệnh ở cuối bài, tự thấy. Bài đi qua bốn chặn —
gate parity sống trong build, contract đọc được trong code, một nhánh đích khép
bằng một PR, và cách tự kiểm bằng ba lệnh.

TL;DR:

- Slug EN và VI phải khớp 1:1 — gate này chạy trước `astro build`, nửa cặp locale
  lỗi làm build đỏ ngay.
- Contract OG của trang bài viết không nằm trong tài liệu rời: nó là comment đặt
  ngay tại dòng code sẽ bị sửa.
- Story đầu tiên của blog khép bằng đúng một pull request công khai (PR #1);
  bản sửa theo review là một commit riêng, có hash, có chủ đề ghi rõ.
- Ba lệnh ở cuối bài cho phép bạn tự kiểm chứng từng mệnh đề trên máy mình.

## Parity gate sống trong build

Blog song ngữ thì mỗi bài có hai bản, EN và VI, cùng một slug. Câu hỏi kỹ thuật
đầu tiên: làm sao chắc chắn không có bài EN lên site trong khi bản VI bị bỏ sót?
Câu trả lời không phải kỷ luật con người — mà là một gate chạy trong chính lệnh
build của site:

```json
"build": "node scripts/check-blog-slug-parity.mjs && node scripts/check-blog-content.mjs && astro build",
```

*Nguồn: package.json, lấy 2026-09-07.*

Script đầu tiên trong chuỗi tự mô tả ngay ở header comment của nó:

```
The blog collection uses locale subdirectories (src/content/blog/en/*.md,
src/content/blog/vi/*.md) and the i18n contract is LOCKED: EN and VI slug
sets must match 1:1 — hreflang pairs and the /vi/blog/ routes are derived
from the same slugs. A mismatch fails the build before `astro build` runs.
```

*Nguồn: scripts/check-blog-slug-parity.mjs (header comment), lấy 2026-09-07.*

Hai dấu `&&` trong dòng build nghĩa là chuỗi dừng ngay ở gate đầu tiên đỏ. Vẽ lại
thứ tự chạy:

```ascii
pnpm build
  ├─ 1 · check-blog-slug-parity.mjs   slug EN == slug VI?
  ├─ 2 · check-blog-content.mjs       dải từ · link docs · cụm cấm
  └─ 3 · astro build                  chỉ chạy khi (1) và (2) xanh
```

*Nguồn: dòng build trong package.json, lấy 2026-09-07.*

Hệ quả thực dụng: một bài chỉ tồn tại nửa cặp locale thì không thể âm thầm lên
production. Build đỏ trước khi astro kịp sinh route, và lỗi in ra đúng tên slug
còn thiếu. Contract i18n ở đây không phải lời hứa trong tài liệu — nó là
assertion chạy trong build, thất bại thì chặn cả pipeline.

## Contract đọc được trong code

Chi tiết thứ hai nằm ở chỗ ít người để ý: vị trí của spec. Trang một bài viết
(`src/pages/blog/[slug].astro`) khai báo loại Open Graph ngay phía trên chỗ
truyền props:

```jsx
{/* og contract: posts are articles — pinned in spec FI-339 rev 2 (og:type + published_time + absolute og:image) */}
```

*Nguồn: src/pages/blog/[slug].astro, lấy 2026-09-07.*

Bên layout (`src/layouts/Base.astro`), ba props liên quan OG đều mang comment ghi
rõ hợp đồng:

```ts
  /**
   * og:image path — ALWAYS resolved against Astro.site into an absolute URL.
   * Contract PINNED (spec FI-339 rev 2): relative og:image values are dropped
   * silently by social crawlers (Facebook/X/Zalo). Default: /og-default.png.
   */
  ogImage?: string;
  /** og:type — 'website' everywhere except blog post pages, which pass 'article'. */
  ogType?: 'website' | 'article';
  /** article:published_time — ISO timestamp; blog post pages pass it. */
  publishedTime?: string;
```

*Nguồn: src/layouts/Base.astro (Props), lấy 2026-09-07.*

Điểm mấu chốt không phải nội dung contract — mà chỗ nó sống. Tài liệu rời có thể
lỗi thời mà không ai hay; comment đặt đúng dòng mà developer sẽ chạm vào thì khó
bị bỏ qua: sửa trang bài viết nghĩa là đọc contract ngay trước mắt. Nguyên văn
đầy đủ nằm trong spec FI-339 rev 2, và comment trỏ đúng tên spec đó — ai cần đối
chiếu thì tìm được, không phải đoán contract đến từ đâu.

## Một nhánh đích, một PR

Story đầu tiên dựng blog — 10 bài seed, đúng 5 slug × 2 locale — đi hết pipeline
rồi khép bằng một pull request duy nhất, công khai. Đây là output thật của git
trên repo này:

```bash
$ git show --no-patch --format='%h %s' 55e5ae1
55e5ae1 feat(FI-341): review-fixes — soften unverified mobile claims (P1, cả EN twin), vi heading + fork phrase (P2)
$ git log --all --oneline --grep='Merge pull request #1' | head -2
3d9a7c3 Merge pull request #1 from wakii-dev/story/fi339-blog-features
```

*Nguồn: git log repo wakii-site, chạy 2026-09-07.*

Đọc hai dòng đó cẩn thận thì thấy nhiều thứ. Commit `55e5ae1` là một review-fix:
reviewer độc lập bắt được claim về mobile chưa đủ bằng chứng, và bản sửa thành
một commit riêng với chủ đề ghi rõ việc "soften unverified mobile claims" cho cả
cặp EN lẫn VI — review không phải hình thức. Merge `3d9a7c3` là PR #1 từ nhánh
`story/fi339-blog-features`: nguyên một story nằm trên một nhánh đích, khép bằng
một PR — chứ không phải các commit rải rác thẳng lên main. Nhánh story này về
sau được merge thành PR #1, công khai tại
[github.com/wakii-dev/wakii-site/pull/1](https://github.com/wakii-dev/wakii-site/pull/1);
mở ra là thấy diff thật và hội thoại review thật. Bài viết ký ngày 03-09 còn
merge diễn ra về sau — nên ở đây chỉ nêu hash và số PR, còn thời điểm chính xác
thì lịch sử git đã ghi sẵn.

## Tự kiểm bằng ba lệnh

Phần quan trọng nhất của một bài có lời là cách kiểm lời đó. Ba lệnh, tăng dần
độ tốn công.

Một — grep đúng câu contract trong parity script:

```bash
$ grep -n "must match 1:1" scripts/check-blog-slug-parity.mjs
7: * sets must match 1:1 — hreflang pairs and the /vi/blog/ routes are derived
```

*Nguồn: chạy trên repo wakii-site, 2026-09-07.*

Hai — mở PR #1 trên GitHub qua liên kết ở mục trước. Đó là trang công khai, không
phải mô tả từ trí nhớ: diff, review, merge — tất cả nằm đó, đối chiếu được với
hai dòng git ở trên.

Ba — clone repo và chạy `pnpm build`. Gate parity in kết quả ngay từ dòng đầu:

```bash
$ node scripts/check-blog-slug-parity.mjs
✓ blog slug parity OK (6 posts × 2 locales)
```

*Nguồn: chạy trên nhánh đang viết bài này, 2026-09-07 — tại thời điểm đó nhánh
có 6 slug (5 seed + 1 pilot).*

Con số 6 sẽ tăng khi các bài mới của story hiện tại hạ cánh — và đây là đúng quy
tắc đọc-tại-thời-điểm: đừng tin con số trong bài, hãy tin con số máy bạn vừa in
ra. 10 bài seed gốc là 5 slug × 2 locale; phần còn lại đang theo story viết dài
hiện tại, từng cặp locale một, qua cùng một gate parity.

Đó là toàn bộ máy móc: gate trong build, contract trong code, một PR khép story.
Quy trình đầy đủ phía sau — chia sub-feature, gate, watchdog, nguyên tắc — được
mô tả từng bước trong trang [story workflow](/vi/docs/story-workflow/). Còn cùng
chủ đề này nhìn từ bên ngoài — số liệu và bản phát hành — thì seed
[xây Wakii công khai — log 1](/vi/blog/building-wakii-in-the-open-log-1/) kể phần
đó; bài này mổ phần bên trong.

Wakii là IDE agentic với đội superpowers dựng sẵn. Nếu cách vận hành trên khiến
bạn tò mò, hãy tải về và thử một story đầu tiên — rồi mở chính repo này ra, chạy
lại ba lệnh trên, và kiểm xem lời bài viết khớp tới đâu.
