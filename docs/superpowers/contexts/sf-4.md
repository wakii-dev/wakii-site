# SF-4 Context Pack — Convergence QA + cross-SF wiring

> Đọc file này THAY VÌ tự tổng hợp từ bracket + epic + comments. Epic spec: `docs/superpowers/specs/2026-09-07-blog-redesign-design.md`. Bracket: `docs/superpowers/brackets/fi349-blog-redesign.md`.

## Spec slice (chỉ phần SF-4 chịu trách nhiệm)

1. **Wire category-link vào detail meta** (cross-SF wiring — chạy SAU khi SF-2+SF-3 merged): trong `BlogDetailLayout`/meta-row (SF-2), biến category label thuần thành link → `/blog/category/<cat>/` (locale-aware). Đây là lý do task nằm ở SF-4: file `[slug].astro` bị SF-2 rewrite khi SF-3 còn song song.
2. **Parity gate extend — mode `--dist` post-build**: mở rộng `scripts/check-blog-slug-parity.mjs` (hoặc flag mới) kiểm category routes 6/6 tồn tại trong `dist/` (derive-from-enum all-or-nothing). KHÔNG ép vào build gate (`package.json` giữ `parity && astro build` như cũ — mode dist chỉ chạy trong verify SF-4).
3. **hreflang + sitemap full-site audit**: mọi route (cũ + 6 taxonomy + posts) — hreflang cluster đủ EN/VI/x-default không trỏ 404; `dist/sitemap-*.xml` chứa mọi URL mới.
4. **JSON-LD validator**: viết `scripts/check-jsonld.mjs` — node script parse mọi `<script type="application/ld+json">` trong `dist/`, assert: BlogPosting (headline/datePublished/author/@type), Blog (blogPost array), BreadcrumbList (itemListElement chain) + URLs absolute. Chạy pass = exit 0.
5. **OG per-post absolute audit**: grep dist — post có hero → og:image = hero absolute; post không hero → og-default; dims hardcode 1200/630 giữ nguyên.
6. **Contract regression FI-339 (scripted)**: grep `dist/rss.xml` — KHÔNG có `<language>`, `<guid>` absolute ×10 bilingual items; og:type=article trên post pages.
7. **Reduced-motion audit**: bật prefers-reduced-motion → mọi reveal mới (detail prose, listing) hiển thị static visible, không element kẹt opacity 0.
8. **Perf audit deployed preview**: Lighthouse trên preview URL (KHÔNG local — noise ±8-17); baseline đo đầu SF-4; tiêu chí no-regression beyond ±17; LCP detail với hero image chú ý width/height attrs.
9. **Link integrity + locale e2e + browser walkthrough EN+VI**: crawl links nội bộ (không 404); LangSwitcher EN↔VI trên mọi page mới; screenshots EN+VI (listing/category/detail); reduced-motion check tại viewer.
10. **Release readiness**: `astro build` sạch + parity (src) + check-jsonld + parity --dist all pass; tổng kết announce-ready.

## Touch map (files SF-4 tạo/sở hữu)

- `scripts/check-jsonld.mjs` — W (mới)
- `scripts/check-blog-slug-parity.mjs` — W (extend mode dist; SF-1 đã chạm schema — sequential theo tier, không conflict)
- `src/layouts/BlogDetailLayout.astro` hoặc meta component SF-2 — W NHỎ (wire category-link; SF-2 đã merge xong nên không race)
- `package.json` — W có thể (nếu thêm script jsonld/parity-dist)
- Mọi file khác (blog pages, layouts, components, content) — READ-ONLY (QA không fix code: bug tìm được → escalation về SF sở hữu, trừ wire task trên)

## ACCEPTANCE (user-visible)

- Bấm category label trong meta của 1 post → sang đúng trang category (wiring hoạt động end-to-end).
- Toàn bộ route (cũ + 6 taxonomy + 10 posts + 2 listing): hreflang đủ cặp, có mặt trong sitemap, canonical đúng wakii.xyz.
- `node scripts/check-jsonld.mjs` exit 0 — JSON-LD 3 loại valid trên dist.
- Share link 1 post lên social/chat: og:image riêng hiện đúng ratio (hoặc og-default với post không hero); RSS reader vẫn đọc /rss.xml đủ 10 items bilingual.
- Browser walkthrough EN+VI (listing → category → post → prev/next → về) không 404, không overflow @390, reduced-motion sạch; Lighthouse perf deployed không tụt beyond ±17 so baseline.

## Boundary (KHÔNG làm)

- KHÔNG redesign thêm UI (thuộc SF-2/3; chỉ wire + fix-minor nếu audit bắt bug thuộc SF trước → escalation).
- KHÔNG đụng contracts pinned (chỉ AUDIT — phát hiện drift = FAIL + escalate, không tự "cải tiến").
- KHÔNG thêm content mới/feed mới/collection mới (out-of-scope epic).
- KHÔNG deploy prod (deploy = owner sau STORY-COMPLETE).
