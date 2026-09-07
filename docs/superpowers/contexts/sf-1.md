# SF-1 Context Pack — Content infra: schema + shared utils

> Đọc file này THAY VÌ tự tổng hợp từ bracket + epic + comments. Epic spec: `docs/superpowers/specs/2026-09-07-blog-redesign-design.md`. Bracket: `docs/superpowers/brackets/fi349-blog-redesign.md`.

## Spec slice (chỉ phần SF-1 chịu trách nhiệm)

1. `src/content.config.ts` schema blog mở rộng: `heroImage: z.string().optional()`, `author: z.string().default('Wakii team')` — mọi field optional/default ⇒ 10 posts cũ zero migration. KHÔNG đổi `category` enum (đã dùng đủ 3 giá trị), KHÔNG đụng docs collection.
2. `readingTime` computed util (không phải frontmatter): WPM EN 200 / VI 160; làm tròn lên; min 1 phút. Input: markdown content string; expose hàm nhận entry trả số phút.
3. `related` computed util: same-category → fallback shared-tags (≥1 tag chung) → fallback latest-same-locale; max 3; same-locale BẮT BUỘC; ẩn khi rỗng. Lọc `draft: false` ở mọi query.
4. OG per-post wiring: detail posts truyền `ogImage = heroImage` khi có, fallback `/og-default.png` — absolute qua `new URL(ogImage, Astro.site)` (contract FI-339 rev 2 — xem pin `[slug].astro` line ~22).
5. `Base.astro` thêm prop optional `ogImageAlt` (default giữ hành vi hiện tại `"${SITE_NAME} — ${SITE_TAGLINE}"`) — carve-out additive DUY NHẤT được phép trên Base; KHÔNG đụng width/height hardcode 1200/630.
6. Hero assets: 4 PNG 1200×630 mint-brand (#45E0A8 trên #0A0E0D, mono wordmark) tại `public/blog/heroes/<slug>.png` cho 4 posts (đủ 3 category); post `building-wakii-in-the-open-log-1` CỐ Ý không hero → exercise fallback. VI mirror dùng chung hero EN. Pipeline đã proven: SVG template → headless Chrome `--default-background-color=00000000` → PNG.
7. `scripts/check-blog-slug-parity.mjs`: mở rộng check schema-parity (EN/VI cùng frontmatter fields mới) — KHÔNG đụng category routes (SF-4).
8. Update comment contract trong `[slug].astro` (ghi rev-2 carve-out ogImageAlt) — docs-comment task.

## Touch map (files SF-1 tạo/sở hữu)

- `src/content.config.ts` — W (schema)
- `src/layouts/Base.astro` — W (CHỈ thêm ogImageAlt prop; còn lại READ-ONLY — contracts)
- `src/pages/blog/[slug].astro` + `src/pages/vi/blog/[slug].astro` — W nhỏ (ogImage wiring + comment) — chú ý SF-2 sẽ rewrite CHỖ LỚN còn lại, giữ wiring nhỏ và tách bạch
- `scripts/check-blog-slug-parity.mjs` — W (schema parity)
- `public/blog/heroes/*` — W (4 PNG mới)
- `src/utils/*` hoặc inline trong content.config — W (readingtime/related utils; đặt chỗ SF-2/3 import được)
- `src/pages/vi/blog/index.astro`, `src/pages/blog/index.astro` — READ-ONLY (SF-3 sở hữu)
- `src/i18n/*` — W (category label map EN/VI — CHỈ tạo map, không adopt vào pages)

## ACCEPTANCE (user-visible)

- Build pass 31→31 pages (không route mới ở tier này), parity gate pass.
- View-source 1 post có hero: `<meta property="og:image" content="https://wakii.xyz/blog/heroes/<slug>.png">` absolute; post không hero: og-default absolute.
- Node assertion utils: readingTime(vi post) > 0 và ≥ EN cùng post (WPM 160 < 200); related("Building Wakii…", build-log) rỗng → fallback latest-same-locale 3 items.
- 4 hero PNG tồn tại đúng 1200×630, đúng brand mint/dark.

## Boundary (KHÔNG làm)

- KHÔNG redesign layout detail/listing (SF-2/SF-3) — chỉ og wiring nhỏ trong [slug].astro.
- KHÔNG tạo category routes (SF-3), KHÔNG JSON-LD (SF-2/3), KHÔNG wire category-link vào meta (SF-4).
- KHÔNG astro:assets/image pipeline (Decision D5 — public path only).
- KHÔNG sửa astro.config.mjs (i18n LOCKED), KHÔNG đổi RSS.
