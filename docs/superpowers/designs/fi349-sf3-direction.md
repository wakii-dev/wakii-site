# FI-349 SF-3 Design Direction — FINAL (user pick 2026-09-07: **B+C hybrid**)

> Nguồn duyệt: user chọn **KẾT HỢP hướng B ("Bento Dispatch") + hướng C ("Journal Rail")** — không phải
> chọn 1 trong 2 (chat 2026-09-07, relay qua coordinator). 3 hướng draft đã đăng đầy đủ (gate đã qua):
> `../prototypes/fi349-sf3-direction-a-ledger.html` · `../prototypes/fi349-sf3-direction-b-bento.html` ·
> `../prototypes/fi349-sf3-direction-c-journal.html`.
>
> **Prototype binding (source of truth visual — implement theo file này + file nguồn, không tự biến thể):**
> `../prototypes/fi349-sf3-hybrid.html` — đã verify 390px zero-overflow (playwright), chứa cả 2 surface.
> Style authority: `src/styles/tokens.css` — BIND TOKEN TỪ tokens.css THẬT, không copy tên token từ prototype
> mà repo không có (lesson FI-296).

## Công thức hybrid (điều đầu tiên Dev cần hiểu)

```
C "Journal Rail"  →  shell layout: rail trái sticky (identity + category nav dọc + RSS)
B "Bento Dispatch" →  khu content phải: featured cell + grid 12-col (.bx kit đã ship)
```

- Category nav là **nav dọc trong rail** (C) — KHÔNG dùng chips ngang trên desktop. Mobile <800px rail
  collapse thành block trên cùng, nav xếp ngang (xem Responsive).
- Post cells dùng nguyên hệ `.bx/.bx-in/.bx-label/.bx-body/.bx-foot` của B — mirror 1:1 với bento kit đã
  ship (landing / `/download`) để tái dùng component/trước mắt là nhất quán class.

## Tokens

Bind trực tiếp từ `src/styles/tokens.css` (không định nghĩa lại giá trị):

| Token | Dùng ở đâu trong SF-3 |
|---|---|
| `--font-display` (= `--font-mono`) | rail title, nav rail, `.bx-label`, `.bx-foot`, dates, breadcrumb, head-meta — mọi chrome |
| `--font-sans` | lede, `.p-desc`, body copy |
| `--bg` / `--bg-raised` / `--bg-card` | nền trang / (reserved hover) / nền `.bx-in` |
| `--panel` | nền `.bx-label` bar |
| `--border` / `--border-strong` | hairline rail, border `.bx-label`; border `.bx-in` = `--border-strong` |
| `--accent` / `--accent-dim` | active nav, hover text, glyph stroke, `▸` prefix (dim thường → accent khi hover cell) |
| `--text` / `--text-dim` / `--text-faint` | title / label+desc-dim / counts+dates |
| `--radius-cell` 12px | `.bx-in` |
| `--radius` 8px | `.hero-band` |
| `--bento-gap` 18px | grid gap (mobile 14px) |
| `--bg-deep` | text trên nền accent (nếu có fill) |

Typography cột mốc: rail title 30px mono 700 (`-0.03em`); `.p-title` 17.5px mono 500 (featured 26px/600);
lede 16.5px sans; `.bx-label` 11.5px mono; `.bx-foot` 11.5px mono; rail nav 13.5px mono.

## Structure

### Shell chung (cả 2 surface — tách thành shared component, sf-3 yêu cầu componentize)

```
.shell  grid-template-columns: 280px minmax(0,1fr); gap 64px; max-width 1160px; padding 60px 24px 96px
├─ aside.rail   (position sticky; top 92px — dưới nav 58px + margin)
│   ├─ .r-title   h1 mono 30px "blog." / "<label>." (dot mint)
│   ├─ .r-sub     1 câu mission / category descriptor (sans 13.5px dim)
│   ├─ nav.r-nav  category nav DỌC — 4 item: all + 3 category, mỗi item:
│   │             label trái + count phải (flex space-between), padding 9px 2px 9px 22px,
│   │             active: text accent + ▸ marker absolute left (::before opacity 1)
│   │             href: /blog/category/<cat>/ (+VI) · "all" → /blog/
│   └─ .r-meta    mono 11.5px faint: "updated <date>" + link "rss feed →" (/rss.xml)
└─ main.stream  (min-width:0)
    ├─ listing:  .s-head (lede + head-meta "5 posts · newest first") + .grid
    └─ category: .crumb "~/blog / <label>" (~/blog là link về /blog/, label hiện tại accent)
                 + .grid  (KHÔNG .s-head — descriptor đã nằm ở .r-sub)
```

### Surface 1 — `/blog/` (EN) + `/vi/blog/` (VI)

Grid 12-col, gap `--bento-gap`; **newest first**; span map theo vị trí:

| # | Vai | Span | Ghi chú |
|---|-----|------|---------|
| 1 (mới nhất) | **Featured** | `sp8` | có `.hero-band` (xem Behavior) + title 26px + desc clamp-3 |
| 2 | cell | `sp4` | cùng hàng featured |
| 3–5 | cell | `sp4` ×3 | hàng 2 |

Mỗi cell (`.bx` = `<a href="/blog/<slug>/">`):
```
.bx-in (bg-card, border-strong, radius-cell 12, overflow hidden)
├─ .bx-label   ▸ <category-label>  |  <YYYY-MM-DD>   (bg panel, mono 11.5)
├─ .bx-body    .p-title + .p-desc (clamp-2; flex:1 đẩy foot xuống đáy)
└─ .bx-foot    <N min read>  |  read →   (dashed top border)
```
Category page dùng nguyên cell này —KHÔNG khác gì ngoài span.

### Surface 2 — `/blog/category/<cat>/` (×3 EN + ×3 VI)

Cùng shell; rail: title = category label + descriptor per-category; nav active đúng category;
`.r-meta` = "<N> entries · newest first" + rss. Stream: `.crumb` + grid:

| # | Span | Ghi chú |
|---|------|---------|
| 1 | `sp6` | |
| 2 | `sp6` | |
| 3 (cuối) | `sp12` **wide variant** `.bx--wide` | `.bx-body` flex row: trái title+desc, phải `.wmeta` (min read + read →); mobile stack dọc |

Nếu category có >3 posts: layout đề xuất `sp6 + sp6` cho đến 2 cell cuối, 2 cell cuối `sp6 + sp6`
hoặc cuối `sp12` wide — Dev tự quyết theo số lượng thật, giữ nhịp đều (không featured trên category page).

**Empty-state** (category 0 posts — route vẫn tồn tại, indexable): render 1 cell `sp12 .bx--empty`
(border dashed, opacity .75, text giữa): EN "No posts yet — check back soon." / VI
"Chưa có bài viết — quay lại sau nhé." (+ hint "← all posts · rss feed"). Prototype có sẵn markup
commented trong `fi349-sf3-hybrid.html` surface 2. Non-empty = dist grep verify; empty branch = code-review.

### Component (BlogListing shared — SF-3 task)

Component dùng chung EN/VI, prop-driven — gợi ý hợp đồng (Dev quyết tên chi tiết):
`posts` (đã sort desc, draft-filtered) · `locale` · `strings` (labels/lede/empty-state từ SF-1 map +
i18n keys) · `activeCategory` (null = listing) · `categoryCounts` (cho rail). Rail + cell đều render từ
props; LangSwitcher đặt ở nav site (đã có) — pin presence trên cả 2 surface, không cần thêm trong shell.

## Behavior

- **Hover cell** (chỉ `@media (hover:hover)`): `.bx-in` translateY(-3px) + border → `#35543F` + glow
  `0 14px 34px rgba(69,224,168,.10)`; `.p-title` → accent; `.bx-label .name::before` ▸ → accent;
  `.bx-foot .go` → accent + arrow `translateX(4px)`. Transition .3s ease. Pure CSS.
- **Rail nav**: hover text → accent; active giữ accent + ▸. Count luôn faint.
- **Hero band** (featured, fallback khi post KHÔNG có `heroImage`): grid-bg 56px 2 trục
  `rgba(69,224,168,.045)` trên `#0C110F`, vignette radial, glyph mono outline `#1`
  (transparent fill + `-webkit-text-stroke` 1.5px accent-dim), corner tag mono faint, pulse dot mint
  2.4s (box-shadow ripple). Khi post CÓ `heroImage`: render `<img src loading="lazy" width="1200"
  height="630">` trong cùng vị trí (radius 8px) — band dự phòng chỉ là fallback; SF-1 mới mint 4 heroes.
- **Entrance**: stagger rise (opacity 0 → translateY 14px, .5s, delay 60ms/cell) — CSS-only trong
  prototype; **production DÙNG motion util có sẵn** (`initMotion()` `data-reveal`/`revealChildren`),
  KHÔNG viết script mới. Pulse/band animation giữ CSS.
- **`prefers-reduced-motion`**: tắt toàn bộ (entrance + pulse + transition) — static render đầy đủ.
- Reading time hiển thị ".bx-foot trái" — production = computed util SF-1 (EN 200 / VI 160 WPM, ceil,
  min 1), KHÔNG hardcode như prototype.

## Responsive

| Breakpoint | Gì xảy ra |
|---|---|
| ≤980px | `sp8`/`sp12` → span 12; `sp4`/`sp6` → span 6 |
| **≤800px** | **Rail collapse**: shell 1 cột; rail static trên cùng, `.r-nav` → flex row wrap (chips ngang, gap 24px, marker ▸ giữ), `.r-meta` inline row; `.s-head` stack |
| ≤640px | mọi cell span 12; gap 14px; hero-band 160px (glyph 60px); `.bx--wide` stack; shell padding 20px |

Verify @390: đã pass zero-overflow trên prototype (playwright scrollWidth = clientWidth = 390).
Lưu ý CSS: `min-width:0` trên grid items chứa text dài (đã có trong prototype — giữ nguyên).

## i18n + SEO surfaces (khung cứng từ spec)

- Category label map (SF-1 shared): EN `tutorial / tech notes / build log` · VI
  `hướng dẫn / kỹ thuật / nhật ký xây dựng`. Rail + `.bx-label` đều dùng map, không hardcode.
- Head per route: listing title `Blog` (VI: `Bài viết`) + meta description hiện có; category title
  pattern `Category: <label>` (spec) — canonical + hreflang pair mỗi route (Base.astro lo), sitemap tự cover.
- JSON-LD: **Blog** (blogPost array, URLs absolute) trên `/blog/`; **BreadcrumbList** (Home → Blog →
  Category) trên category — sample đầy đủ trong prototype, Dev thay URL thật.
- VI copy (empty-state, descriptor .r-sub per-category, "rss feed →", "N min read" → "vài phút đọc"…
  do Dev draft theo pattern) — **chờ user-approve tại verify gate** (G-D style, như story trước).

## Out of design scope (Dev tự quyết, không phải ý nghĩa visual)

- Post URLs/slug thật, href production cho mọi link (prototype dùng `#` + title attribute gợi ý route).
- DOM chi tiết sau `.bx-in`, tên component/file, cách bẻ BlogListing props, cách mount LangSwitcher.
- Con số reading time thật (computed runtime), hero PNG thật thay band fallback.
- Fonts loading (site đã có JetBrains Mono + Inter; prototype dùng Google Fonts chỉ để standalone chạy được).
- Nav/footer là replica chrome của site — Dev dùng Nav.astro/Footer.astro thật, không copy CSS prototype.
