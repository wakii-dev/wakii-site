# SF-2 Context Pack — Detail page redesign (docs shell)

> Đọc file này THAY VÌ tự tổng hợp từ bracket + epic + comments. Epic spec: `docs/superpowers/specs/2026-09-07-blog-redesign-design.md`. Bracket: `docs/superpowers/brackets/fi349-blog-redesign.md`.

## Spec slice (chỉ phần SF-2 chịu trách nhiệm)

1. Tạo **BlogDetailLayout** (`src/layouts/BlogDetailLayout.astro`) mirror DocsLayout as-built (`src/layouts/DocsLayout.astro` — READ-ONLY reference, đừng sửa nó): grid `220px + 1fr` max 1080px, sticky sidebar trái, article phải, mobile 1-col @800px.
2. Sidebar trái: danh sách posts của locale (date desc, `draft: false`, current post highlight `aria-current='page'` theo style docs: border-left accent), eyebrow `~/blog`, LangSwitcher dưới sidebar.
3. Prev/next pager theo ngày (older/newer), same-locale, draft-filtered — style như `docs-pager` (← prev / next →).
4. Meta row trên h1: date · category **label thuần** (KHÔNG link — SF-4 wire) · tags chips (plain, không link) · author · reading-time (util SF-1).
5. Hero: `heroImage` có → `<img src width=1200 height=630 loading="eager">` đầu article; không → bỏ qua hero block (fallback og đã xử lý ở SF-1).
6. BlogToc giữ nguyên (đầu vào `headings` từ `render()` — contract) trong article.
7. Related posts section cuối: util SF-1, render title+date links, ẩn khi rỗng.
8. JSON-LD `<script type="application/ld+json">` BlogPosting: headline/datePublished/author/@type + URLs absolute.
9. Light reveal per prose block: `revealChildren(article, '.prose > *')` + `initMotion()` (pattern DocsLayout script tag).
10. Route wiring EN+VI: rewrite `src/pages/blog/[slug].astro` + `vi` twin dùng layout mới; GIỮ nguyên contracts: og article FI-339 (ogType/publishedTime/ogImage từ SF-1 wiring) + URL shape + getStaticPaths draft filter.
11. After-CTA "get wakii" giữ như layout cũ (cuối article).
12. Responsive pass @390: sidebar xuống dưới/ẩn hợp lý, no overflow (iframe probe pattern).

## Touch map (files SF-2 tạo/sở hữu)

- `src/layouts/BlogDetailLayout.astro` — W (mới)
- `src/pages/blog/[slug].astro` + `src/pages/vi/blog/[slug].astro` — W (rewrite dùng layout mới)
- `src/pages/blog/index.astro`, `src/pages/vi/blog/index.astro`, `src/pages/blog/category/*` — READ-ONLY (SF-3 sở hữu)
- `src/layouts/DocsLayout.astro` — READ-ONLY (reference mẫu)
- `src/utils` (readingtime/related từ SF-1) — READ (import)
- `src/components/LangSwitcher.astro`, `BlogToc.astro` — READ (import, không sửa)

## ACCEPTANCE (user-visible)

- Mở 1 post bất kỳ (EN + VI): thấy shell giống /docs/faq/ — sidebar trái list posts (post đang đọc highlight mint), bài viết phải, light reveal khi scroll.
- Thấy đầy đủ: ngày · category · tags · author · thời gian đọc; hero ảnh hiện với post có hero; post không hero vẫn sạch.
- Bấm prev/next đọc bài liền kề; cuối bài thấy "Related" dẫn sang post cùng chủ đề; LangSwitcher EN↔VI giữ đúng bài đang đọc.
- View-source: JSON-LD BlogPosting có headline/datePublished/author; og:type=article + og:image absolute (hero hoặc og-default).
- Mobile 390px: không overflow, sidebar hợp lý.

## Boundary (KHÔNG làm)

- KHÔNG đụng listing/category pages (SF-3), KHÔNG wire category-link trong meta (SF-4 — meta chỉ label thuần).
- KHÔNG sửa DocsLayout/Base (trừ ogImageAlt SF-1 đã làm), KHÔNG đổi schema (SF-1), KHÔNG đổi RSS.
- KHÔNG thêm tag pages (tags = chips).
- KHÔNG đụng motion.ts core (dùng initMotion/revealChildren as-is).
