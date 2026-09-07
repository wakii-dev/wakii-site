# SF-3 Context Pack — Listing + category taxonomy redesign (DESIGN-FIRST)

> Đọc file này THAY VÌ tự tổng hợp từ bracket + epic + comments. Epic spec: `docs/superpowers/specs/2026-09-07-blog-redesign-design.md`. Bracket: `docs/superpowers/brackets/fi349-blog-redesign.md`.

## Spec slice (chỉ phần SF-3 chịu trách nhiệm)

0. **DESIGN-FIRST (trước mọi code)**: designer agent — 3 hướng HTML draft → USER CHỌN (gate bắt buộc, không豁免) → hand-off `docs/superpowers/designs/<sf-slug>-direction.md` (tokens/structure/behavior). Brand: dark #0A0E0D + mint #45E0A8, mono display + sans body, tokens.css authority. Chỉ sau gate mới launch dev.
1. **BlogListing component dùng chung** (`src/components/blog/BlogListing.astro` hoặc tương tự): render danh sách posts (prop: posts + locale + strings) — diệt 95% duplication giữa EN/VI index (P0 flag). Pin LangSwitcher trên listing + category pages.
2. Listing index EN+VI redesign theo direction: category chips/nav (label từ SF-1 map — tutorial/tech notes/build log · hướng dẫn/kỹ thuật/nhật ký xây dựng), link → taxonomy routes; hero/thumbnail nếu direction có (từ heroImage, fallback không hiện).
3. Taxonomy routes from-enum: `getStaticPaths` derive từ 3 category values (`tutorial|tech|build-log`) — 6 pages: `/blog/category/<cat>/` ×3 + `/vi/blog/category/<cat>/` ×3. Route rỗng (tương lai 0 posts) → empty-state "No posts yet — check back soon." / "Chưa có bài viết — quay lại sau nhé." (route vẫn tồn tại, indexable).
4. JSON-LD: `Blog` (blogPost array) trên /blog/ + `BreadcrumbList` (Home → Blog → Category) trên category pages — URLs absolute.
5. Title/description pages: "Blog" / "Chuyên mục: <label>" pattern; VI copy theo strings spec (user-approve tại verify gate).
6. Responsive pass @390 no-overflow.

## Touch map (files SF-3 tạo/sở hữu)

- `src/components/blog/*` — W (mới: listing shared component)
- `src/pages/blog/index.astro` — W (redesign, hiện sở hữu SF-3)
- `src/pages/vi/blog/index.astro` — W (redesign)
- `src/pages/blog/category/[category].astro` — W (mới, getStaticPaths from-enum)
- `src/pages/vi/blog/category/[category].astro` — W (mới)
- `docs/superpowers/designs/<sf-slug>-direction.md` — W (hand-off designer)
- `src/layouts/BlogDetailLayout.astro`, `src/pages/blog/[slug].astro` (SF-2) — READ-ONLY trong tier này; wire category-link vào detail meta = SF-4
- `src/i18n/*` category map (SF-1) — READ (adopt vào pages)
- `src/utils` readingtime/related (SF-1) — READ nếu listing hiển thị reading time

## ACCEPTANCE (user-visible)

- Vào /blog/ (EN) và /vi/blog/ (VI): thấy listing redesigned theo direction đã chọn — đủ 5 posts mới nhất, badge category nhìn được.
- Bấm category chip/nav → sang trang category (vd /blog/category/tech/) thấy đúng 3 bài tech (EN) / đúng bài VI; breadcrumb Home → Blog → Category hiển thị; bấm ngược về listing được.
- LangSwitcher trên listing + category pages chuyển EN↔VI đúng trang tương ứng.
- View-source: JSON-LD Blog trên listing, BreadcrumbList trên category; canonical/hreflang đúng mỗi route.
- Mobile 390px không overflow.

## Boundary (KHÔNG làm)

- KHÔNG wire category-link vào detail meta-row (SF-4 — cross-SF wiring, tránh collision `[slug].astro` với SF-2 đang song song).
- KHÔNG đụng detail layout/pages (SF-2 sở hữu trong tier này).
- KHÔNG đổi schema, RSS, astro.config.
- KHÔNG tự chọn direction thay user — gate bắt buộc.
- KHÔNG đụng scripts/* (SF-1/SF-4 sở hữu).
