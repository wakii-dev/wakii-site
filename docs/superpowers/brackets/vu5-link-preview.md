# Story: VU-5 — Link preview đầy đủ thông tin (social unfurl card)

Destination: story/vu5-link-preview

## SF-1 OG meta contract
Tier: 0
linear:
What: Phase 1/2 — shippable: mọi page xuất đủ preview meta — og:site_name, og:locale + og:locale:alternate (derive pathname), mirror name= twitter:image + twitter:image:alt, article:author + article:tag trên post, ogImageAlt = title post (fix dead wiring), og:image:type; docs-description fallback hardening; audit description DERIVED SET mọi page (vi phạm thật hôm nay = landing EN index.astro:8 truyền SITE_TAGLINE tường minh; landing VI/roadmap/skills/download/404 đã có description riêng); apple-touch-icon 180 + favicon.ico (PNG qua Chrome + ICO wrapper node ~20 dòng, không thêm dep) + link tags. Tất cả edit chạm Base.astro gộp 1 task, tuần tự theo pack. Demo: view-source bất kỳ page thấy đủ meta; copy description landing EN đăng epic chờ owner ACK trước merge.
Depends on: —
Tasks: base-meta-contract / blog-article-props / docs-description-fallback / pages-description-audit / icons-assets / self-verify-dist

## SF-2 Hero tile toàn bộ post
Tier: 0
linear:
What: Phase 1/2 — shippable: 119/120 post có tile riêng 1200×630 (title mono + category, brand mint/dark) làm og:image + hero trong trang (pattern 25 post hiện có); wrap-guard assert thay slice cắt câm; pngquant hook + exit-99 policy (retry 50-90 1 lần → giữ gốc + WARN); render 95 tile mới + recompress 25 tile cũ + og-default.png (163KB); pin log-1 giữ og-default fallback; visual QA mẫu (title VI dấu, title dài nhất, đủ 3 category) + mobile-390 sanity. Edges nội bộ: pngquant-hook → render-95-tiles; frontmatter-batch-en → render-95-tiles; pngquant-hook → recompress-existing-tiles. Demo: card share mỗi post ảnh riêng; trang detail hiện hero.
Depends on: —
Tasks: wrap-guard-assert / pngquant-hook / frontmatter-batch-en / frontmatter-batch-vi / render-95-tiles / recompress-existing-tiles / check-full-set / visual-qa-sample / page-render-verify

## SF-3 Domain runbook + QA harness + convergence
Tier: 1
linear:
What: Phase 2 — shippable: check-og.mjs assert toàn dist (post pages path-derived, hero-less KHÔNG hardcode — og:image resolution đúng + file PNG tồn tại trong dist); check:og npm script wired build sau astro build; --live domain probe (WARN trước domain live, PASS 200 sau); runbook owner (add wakii.xyz + www vào Vercel project, FB/Zalo cache purge) vào docs/knowledge/runbooks/ + epic; RSS media:content + xmlns:media; crawler-UA probe harness; convergence audit full build; release checklist Phase 2 + card mẫu user test. Demo: npm run build xanh kèm check:og; --live in trạng thái domain thật.
Depends on: SF-1, SF-2
Tasks: check-og-assert / wire-build-chain / live-domain-probe / owner-runbook / rss-media-content / crawler-probe-harness / sitemap-robots-sanity / convergence-audit / release-checklist
