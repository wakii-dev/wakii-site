# SF-4 Plan — Convergence QA + cross-SF wiring (FI-358, story FI-349)

Contract: `docs/superpowers/contexts/sf-4.md` (spec slice + ACCEPTANCE + boundary) + bracket `docs/superpowers/brackets/fi349-blog-redesign.md`. Tier Full — 10 tasks. Contracts pinned (OG FI-339 rev 2, RSS bilingual, i18n) = AUDIT ONLY — drift = FAIL + escalate.

## Tasks

- [x] 1. **wire-category-links-detail-meta** — `<span class="bd-cat">` trong `BlogDetailLayout.astro` → link locale-aware `/blog/category/<cat>/` | `/vi/blog/category/<cat>/`; hover style theo pattern `.bd-crumb a`; cập nhật comment CSS stale.
- [x] 2. **parity-gate-extend-category-routes-mode-dist-postbuild** — `check-blog-slug-parity.mjs --dist`: category routes 6/6 tồn tại trong `dist/` (derive-from-enum `BLOG_CATEGORIES`, all-or-nothing); `package.json` thêm convenience script, build gate KHÔNG đổi.
- [x] 3. **hreflang-sitemap-full-site-audit** — mọi route (cũ + 6 taxonomy + posts + listing): hreflang cluster EN/VI/x-default không trỏ 404 (half-pair = FAIL); `dist/sitemap-*.xml` đủ mọi URL; canonical self per-locale wakii.xyz.
- [x] 4. **jsonld-validate-script-check-jsonld** — `scripts/check-jsonld.mjs` mới: parse mọi ld+json trong dist; BlogPosting (headline/datePublished/author/@type), Blog (blogPost array), BreadcrumbList (itemListElement chain) + URLs absolute; expectation derive theo path (post→BlogPosting, listing→Blog, category→BreadcrumbList); exit 0 = pass.
- [x] 5. **og-perpost-absolute-audit** — post có hero → og:image = hero absolute; không hero → og-default; dims 1200/630 giữ nguyên; og:type=article + published_time.
- [x] 6. **contract-regression-check-fi339-scripted** — `dist/rss.xml`: KHÔNG `<language>`, `<guid>` absolute ×10 items bilingual; og contract per-post đúng.
- [x] 7. **reduced-motion-audit** — `--force-prefers-reduced-motion`: reveal (detail prose + listing) hiển thị static visible, không element kẹt opacity 0.
- [x] 8. **perf-audit-deployed-preview** — Lighthouse trên preview deploy (không local); baseline đo ĐẦU SF trên base commit; post-change so baseline; no-regression beyond ±17; LCP detail hero chú ý width/height attrs.
- [x] 9. **link-integrity-locale-e2e-walkthrough** — crawl links nội bộ dist (không 404); walkthrough browser EN+VI: listing → category → post → wire-link category → prev/next → lang-switch → về; screenshots EN+VI (listing/category/detail); overflow @390 (iframe probe).
- [x] 10. **release-readiness-build-smoke** — `pnpm build` sạch + parity (src) + check-jsonld + parity `--dist` all pass; tổng kết announce-ready.

## ACCEPTANCE (từ context pack — verify từng dòng ở Phase 5)

1. Bấm category label trong meta của 1 post → sang đúng trang category (end-to-end).
2. Toàn bộ route: hreflang đủ cặp, có mặt trong sitemap, canonical đúng wakii.xyz.
3. `node scripts/check-jsonld.mjs` exit 0 — JSON-LD 3 loại valid trên dist.
4. og:image per-post (hero absolute | og-default); RSS reader đọc /rss.xml đủ 10 items bilingual.
5. Walkthrough EN+VI không 404, không overflow @390, reduced-motion sạch; Lighthouse deployed không tụt beyond ±17.

## Boundary

KHÔNG redesign UI; KHÔNG đụng contracts pinned (audit only); KHÔNG thêm content/feed/collection; KHÔNG deploy prod. Touch map: `scripts/check-jsonld.mjs` (mới) · `scripts/check-blog-slug-parity.mjs` (--dist) · `BlogDetailLayout.astro` (wire) · `package.json` (scripts, có thể).
