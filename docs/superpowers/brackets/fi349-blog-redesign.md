# Story: FI-349 — Blog redesign — layout, category taxonomy, SEO depth, multi content type

Destination: story/fi349-blog-redesign

## SF-1 Content infra — schema + shared utils
Tier: 0
linear: FI-355
Design: none
What: nền dùng chung cho cả story — schema blog mở rộng (heroImage/author optional-default, 10 posts cũ không vỡ), readingTime + related posts computed utils, og:image per-post absolute (hero khi có, fallback og-default), 4 hero PNG 1200×630 mint-brand + 1 post fallback, category label map i18n EN/VI. Demo data-level: build pass + dist grep og per-post/fallback + node assert utils
Depends on: —
Tasks: schema-extension-optional-defaults / category-label-map-i18n-shared-en-vi-chỉ-tạo-map / readingtime-util-wpm-en200-vi160 / related-util-fallback-chain / og-image-per-post-wiring-absolute / base-ogimagealt-prop-additive / hero-pipeline-public-path / hero-assets-mint-4-posts-1-fallback-exercise / parity-script-extend-check-schema / docs-comment-contract-update

## SF-2 Detail page redesign — docs shell
Tier: 1
linear: FI-356
Design: none
What: trang bài viết EN+VI nhìn/act như /docs/faq/ — sidebar trái posts (date desc, current highlight, draft-filtered) + LangSwitcher, prev/next pager theo ngày, meta date+category-label+tags+author+reading-time, BlogToc giữ nguyên, light reveal per prose, heroImage khi có (1200×630 attrs), related posts cuối trang (fallback chain), JSON-LD BlogPosting, after-CTA giữ
Depends on: SF-1
Tasks: blog-detail-layout-component / sidebar-posts-list-current-highlight / prev-next-pager-by-date / langswitcher-integration / meta-row-label-tags-author-readingtime / hero-image-render-when-present-width-height / related-posts-section-fallback / jsonld-blogposting-article / light-reveal-prose-children / route-wiring-en-rewrite-slug-astro / route-wiring-vi-rewrite-slug-astro / responsive-pass / og-contract-regression-check

## SF-3 Listing + category taxonomy redesign
Tier: 1
linear: FI-357
Design: mock-prototype
What: /blog/ + /vi/blog/ redesign theo direction designer user-chọn (gate bắt buộc) — listing componentize dùng chung (diệt 95% mirror duplication), category chips/nav, 6 taxonomy pages /blog/category/{tutorial,tech,build-log}/ + VI (from-enum, empty-state indexable), JSON-LD Blog + BreadcrumbList, category-link vào taxonomy/được wire từ SF-4 vào detail meta. Demo: /blog/ → category → taxonomy page → post → breadcrumb về
Depends on: SF-1
Tasks: design-3-hướng-html / design-user-pick-gate / blog-listing-component-shared-langswitcher / listing-index-en-redesign / listing-index-vi-redesign / taxonomy-getstaticpaths-from-enum / category-route-en-x3-empty-state / category-route-vi-x3-empty-state / jsonld-blog-collectionpage / jsonld-breadcrumblist / responsive-pass

## SF-4 Convergence QA + cross-SF wiring
Tier: 2
linear: FI-358
Design: none
What: wire category-link vào detail meta (chạy sau SF-2+SF-3 merge), toàn site sạch production — hreflang không half-pair + sitemap đủ route mới, JSON-LD valid 3 loại qua scripts/check-jsonld.mjs, og per-post absolute, contracts FI-339 không drift (scripted), reduced-motion, perf deployed preview no-regression ±17, browser walkthrough EN+VI, release readiness
Depends on: SF-2, SF-3
Tasks: wire-category-links-detail-meta / parity-gate-extend-category-routes-mode-dist-postbuild / hreflang-sitemap-full-site-audit / jsonld-validate-script-check-jsonld / og-perpost-absolute-audit / contract-regression-check-fi339-scripted / reduced-motion-audit / perf-audit-deployed-preview / link-integrity-locale-e2e-walkthrough / release-readiness-build-smoke
