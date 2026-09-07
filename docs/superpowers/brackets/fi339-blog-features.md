# Story: FI-339 — Blog features: tutorials, tech notes, build logs
Destination: story/fi339-blog-features

## SF-1 SEO surface + TOC + assets
Tier: 0
linear: FI-340
Design: none
What: blog pages share đúng (OG image absolute wakii.xyz, og:type article/website theo page, twitter:card large) + RSS feed hợp lệ (guid absolute, không language tag) + og-default asset + TOC cho bài dài + slug-parity chặn build khi en/vi lệch — chia sẻ link lên social hiện đúng card, feed reader subscribe được
Depends on: —
Tasks: base-og-contract (1 diff Base.astro: og:title/desc/url/type+publishedTime-prop/og:image-absolute+width-height-alt/twitter:card/ogImage-ogType-publishedTime-props/rss-autodiscovery-link) / rss-feed-contract (rss.xml.js: omit language, refactor dùng blogSlug helper có sẵn, guid absolute) / og-default-asset (SVG nguồn commit kèm + PNG <300KB, og:image trỏ PNG) / blog-toc-component (h2 only, rehype anchors, ≥3 h2 gate, inline box, nav aria-label) / wire-toc-og-article-vào-2-slug-pages (blog/[slug] + vi/blog/[slug]: ogType=article + publishedTime + TOC) / slug-parity-build-assertion (scripts/check-blog-slug-parity.mjs chain vào pnpm build, lệch = FAIL build) / readme-domain-fix (chỉ site-domain links wakii.dev→wakii.xyz, giữ github links) / verify-sf1-og-surface (og:image absolute + twitter:card + rss link trên landing/listing/docs — article-side dời SF-3)

## SF-2 Seed content 10 posts
Tier: 1
linear: FI-341
Design: none
What: /blog + /vi/blog hiện 5 bài thật (tutorials + tech notes + build log) — đọc được nội dung đầy đủ, sitemap/RSS chứa đủ 10 URL, sharing card đúng, slug en≡vi
Depends on: SF-1
Tasks: vi-seed-5-posts / en-seed-5-posts / frontmatter-audit (draft=false, pubDate quá khứ, category enum, description, tags) / long-form-verify-≥2-posts-≥3-h2 / anti-cannibalization-links (mỗi post ≥1 link docs chính tắc) / sitemap-10-urls (grep dist/sitemap-0.xml: 5×/blog/ + 5×/vi/blog/) / rss-10-items-guid-no-language / hreflang-targets-tồn-tại-trong-dist / toc-render-≥2-posts / slug-parity-non-vacuous (10/10)

## SF-3 Convergence QA toàn site
Tier: 2
linear: FI-342
Design: none
What: SEO toàn site không regression sau khi Base.astro đổi (baseline diff chính xác theo nhóm tag) + blog contracts đúng 100% trên mọi post + browser check /blog/ + /vi/blog/ — owner duyệt merge an toàn
Depends on: SF-2
Tasks: baseline-dist-từ-main-trước-story / regression-canonical-hreflang-noindex (landing /+/vi/, download /+vi/, docs sample, 404 — og:*/rss additions là expected diff, chỉ canonical/hreflang/noindex phải bất biến) / og-absolute-check-mọi-blog-post / og-type-article-posts-website-listing + article:published_time / og-url-canonical + og-image-width-height-alt + rss-autodiscovery-present / browser-check /blog/ + /vi/blog/ (Orca tab) / toc-visual-check / final-build-fix-loop
