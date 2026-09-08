---
title: "Site Wakii: bento layout và design tokens"
description: "Bên trong hệ thống thiết kế của site wakii.xyz: một file token duy nhất làm hợp đồng, bento grid 12 cột bằng CSS thuần, và bài học min-width: 0 khi một cell phải chứa bảng 680px cố định."
pubDate: "2026-09-26"
category: "tech"
tags: ["architecture", "design", "wakii"]
draft: false
---

Trang chủ của wakii.xyz trông như một chiếc bảng bento: các cell to nhỏ không đều, đặt cạnh nhau mà vẫn lệch nhịp có chủ đích. Cảm giác "đều tăm tắp" đó không đến từ một UI framework, mà từ một quy ước cũ kỹ của ngành hệ thống: một nguồn sự thật duy nhất. Với site này, nguồn đó là một file token khoảng 45 dòng. Bài này mổ cơ chế của nó: hợp đồng token, grid 12 cột, và bài học overflow thật khi một cell phải chứa một bảng vẽ 680px cố định.

TL;DR:

- Toàn bộ màu, bo góc, nhịp khoảng cách của site nằm trong `src/styles/tokens.css` — biến CSS thuần, kèm chú thích cấm đổi tên.
- Bento grid là CSS grid 12 cột trong `src/components/landing/Bento.astro`; sáu cell xếp bất đối xứng hoàn toàn bằng `grid-column`.
- Cell chứa bảng 680px cố định phải sống trong track co giãn: `min-width: 0` mở khoá việc co, script auto-scale lo hình.
- Không có breakpoint 390px riêng: grid sập một cột ở 1020px, bảng tự scale theo bề rộng còn lại.

## Một file token, toàn site trả lời

Mở `src/styles/tokens.css`, thứ đập vào mắt đầu tiên không phải giá trị màu mà là dòng chú thích đầu file:

```css
/*
 * Wakii design tokens — "Modern Bento Premium" v2 (user-approved 2026-09-04).
 * Source of truth: docs/superpowers/designs/sf1-direction.md (BINDING, v2).
 * Fidelity target: docs/superpowers/designs/direction-d3-bento.html.
 * v1 Terminal Mono DNA (mono/mint/near-black) retained as identity base.
 *
 * SF-2/SF-3 consume these names — do not rename.
 */
```

*Nguồn: src/styles/tokens.css, dòng 1-8, lấy 2026-09-08.*

Hợp đồng có ba lớp: một file thiết kế đã được duyệt (`sf1-direction.md`), một file token chốt giá trị, và một lời cấm đổi tên cho mọi component tiêu thụ về sau. Giá trị chốt đọc trực tiếp từ file:

```css
--bg: #0A0E0D;
--bg-card: #131A17; /* bento cells */
--accent: #45E0A8;
--text: #D7E2DD;
--radius-cell: 12px; /* bento cells (hand-off: 8–12px) */
--radius-btn: 6px;   /* buttons */
--bento-gap: 18px;
--wrap: 1240px;
```

*Nguồn: src/styles/tokens.css, lấy 2026-09-08.*

Chi tiết đáng nói là các comment "hand-off". File thiết kế duyệt một khoảng — bo góc cell 8-12px, gap bento 16-20px — còn file token chốt một giá trị trong khoảng đó: 12px và 18px, kèm ghi chú khoảng gốc ngay trên dòng. Ai đọc code sau này vẫn truy được mỗi giá trị đến từ quyết định thiết kế nào. Site cũng chọn dark-only: không có toggle sáng/tối, khai báo nằm ở hai dòng đầu của global stylesheet:

```css
html {
  scroll-behavior: smooth;
  color-scheme: dark;
}
```

*Nguồn: src/styles/global.css, dòng 11-14, lấy 2026-09-08.*

`body` lấy màu nền từ `var(--bg)` và màu chữ từ `var(--text)` — kể cả selector `::selection` đổi màu theo accent. Không một component nào được tự chế một mã màu.

## Bento là CSS grid 12 cột, không framework

Cái "bento" của landing nằm trong đúng một component: `src/components/landing/Bento.astro`, chứa sáu cell — bracket canvas, lưới 9 agent, dải gates, memory log, watchdog console, và figma-to-verify. Xếp chúng là một grid 12 cột CSS thuần:

```css
.bento {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--bento-gap);
}
.bx-a { grid-column: 1 / 9; grid-row: 1 / 3; }
.bx-b { grid-column: 9 / 13; }
.bx-c { grid-column: 9 / 13; }
.bx-d { grid-column: 1 / 6; }
.bx-e { grid-column: 6 / 10; }
.bx-f { grid-column: 10 / 13; }
```

*Nguồn: src/components/landing/Bento.astro, lấy 2026-09-08.*

Sáu dòng `grid-column` vẽ ra toàn bộ bố cục:

```ascii
 cột →   1         5         9    12
        ┌───────────────────┬────────┐
        │                   │   B    │
        │         A         ├────────┤
        │   bracket canvas  │   C    │
        │   1/9 · hàng 1→3  │  9/13  │
        ├────────┬──────────┴───┬────┤
        │   D    │      E       │ F  │
        │  1/6   │    6/10      │10/13│
        └────────┴──────────────┴────┘
```

*Nguồn: sơ đồ dựng từ giá trị grid-column trong src/components/landing/Bento.astro, lấy 2026-09-08.*

Cell A chiếm 8 cột và 2 hàng — đây là bracket canvas, nhân vật chính. Hàng dưới chia cho ba cell với ba bề rộng khác nhau: 5, 4 và 3 cột. Không một dòng media query nào can thiệp ở tầng bố cục này; "bất đối xứng có chủ đích" chỉ là toán học trên lưới track, và gap giữa các cell là đúng một token: `var(--bento-gap)`.

## min-width: 0 và chiếc bảng 680px

Bên trong cell A là bracket canvas — một bảng vẽ SVG cố định 680×400. Đây là chỗ grid gặp bài toán kinh điển: mặc định một grid item có `min-width: auto`, tức nó không bao giờ co nhỏ hơn nội dung. Bảng 680px sẽ đẩy track giãn ra và phá vỡ 12 cột. Cách xử lý nằm ngay trong Bento.astro:

```css
.bx {
  will-change: transform;
  /* cho phép track co dưới min-content của board 680px (scale script lo hình) */
  min-width: 0;
}
```

*Nguồn: src/components/landing/Bento.astro, dòng 130-134, lấy 2026-09-08.*

`min-width: 0` một mình mới chỉ mở khoá việc co — hình sẽ vỡ nét nếu không ai lo nén nội dung. Phần đó thuộc BracketCanvas: một script đo bề rộng thật của container rồi scale toàn bộ bảng theo tỉ lệ đó:

```ts
const s = Math.min(1, outer.clientWidth / 680);
board.style.transform = `scale(${s.toFixed(4)})`;
```

*Nguồn: src/components/mockups/BracketCanvas.astro, hàm scaleAll, lấy 2026-09-08.*

Cặp này là lý do bạn sẽ không tìm thấy breakpoint 390px nào trong `src/` — lọc file nguồn (*.astro, *.ts, *.css) ngoài `src/content/` thì grep chuỗi `390` trả về không một dòng. Ở 1020px, media query duy nhất của component cho grid sập một cột; dưới đó, bảng tự co theo bề rộng còn trừ padding 32px mỗi bên của `.wrap`. Pattern `min-width: 0` cũng không riêng Bento: grep toàn `src/` đếm được 17 chỗ tại thời điểm viết, từ PostCard tới DocsLayout. Đó là bài học được trả giá bằng layout vỡ, rồi được viết thành quy ước chung của repo.

## Chuỗi một chiều: direction → token → component → trang

Hệ thống chỉ vận hành vì giá trị chảy một chiều. Không component tự chế màu, không trang tự đặt radius:

```ascii
docs/superpowers/designs/sf1-direction.md    (BINDING, duyệt 2026-09-04)
        │  giá trị chốt
        ▼
src/styles/tokens.css        ← biến CSS, không chứa class UI
        │  var(--radius-cell), var(--bento-gap), var(--accent)…
        ▼
src/components/landing/*.astro + src/layouts/*.astro
        │  tiêu thụ token, không hardcode giá trị
        ▼
src/pages/index.astro (EN, 10 dòng) · src/pages/vi/index.astro (VI, 9 dòng)
```

*Nguồn: đường dẫn thực trong repo công khai wakii-dev/wakii-site; số dòng đếm trên worktree, lấy 2026-09-08.*

Trang chủ là wrapper mỏng: 10 dòng cho EN, 9 dòng cho VI, đều chỉ bọc Landing component và bơm đúng bộ chuỗi. Cùng bộ token đó chảy xuống cả blog lẫn docs — layout chi tiết bài viết `src/layouts/BlogDetailLayout.astro` cũng nằm trong số 17 chỗ `min-width: 0` nói trên. Tại thời điểm viết, blog có 25 slug × 2 locale = 50 file (snapshot 2026-09-08) và tất cả hiển thị trên cùng một nền token — con số bạn tự đếm lại bằng `ls src/content/blog/en`.

Một thay đổi token vì vậy không có đường tắt: nó đi qua chuỗi build công khai của repo — utility gate → parity gate → content lint → astro build. Bài [log 2 của chuỗi xây Wakii](/vi/blog/building-wakii-in-the-open-log-2/) đã mổ chuỗi đó từng lớp; ở đây chỉ cần nói thêm rằng chính tính một-một-của-token là thứ khiến chuỗi ấy đủ ngắn để tin.

Hỏi đáp về site và sản phẩm được gom ở [trang FAQ](/vi/docs/faq/). Muốn thấy quy trình dựng site này từ đầu, bài [case study: chính blog này là một story](/vi/blog/blog-story-case-study/) là chỗ hợp lý nhất để bắt đầu.

Muốn tự nhìn các cell bento chuyển động, mở wakii.xyz và rê chuột lên từng cell. Muốn một hệ thống token như vậy cho dự án của bạn, điểm khởi đầu là [trang getting started](/vi/docs/getting-started/) — kit cài một lệnh, phần còn lại là quy ước.
