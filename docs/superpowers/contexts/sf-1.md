# Context pack — FI-339 SF-1: SEO surface + TOC + assets

Source spec: `docs/superpowers/specs/2026-09-07-blog-features.md` (rev 2). Phase0 verified bằng build probe — routing/hreflang/sitemap đã hoạt động, work này là SEO surface + TOC + assets.

## Spec slice
Base.astro OG contract PINNED: `og:title` (theo page title), `og:description` (theo page description), `og:url` (= canonical), `og:image` = **URL tuyệt đối** `new URL(ogImage, Astro.site)` bắt đầu `https://wakii.xyz`, `og:type` qua prop (`website` mặc định / `article` khi post truyền), `article:published_time` (prop optional, post truyền), `twitter:card` = `summary_large_image`, `og:image:width=1200` + `height=630` + `alt`. Optional props: `ogImage` (default `/og-default.png`), `ogType` (default `website`), `publishedTime`. RSS autodiscovery `<link rel="alternate" type="application/rss+xml" href="/rss.xml">`. `rss.xml.js`: **omit `<language>` hoàn toàn**, refactor dùng helper `blogSlug` (đã export trong content.config.ts — file đang inline regex), guid tường minh = URL tuyệt đối (tự unique 2 locale). `og-default.png` 1200×630 <300KB (commit kèm SVG nguồn; og:image trỏ PNG). `BlogToc.astro`: từ `render().headings` lọc depth 2 (h2), render khi ≥3 items, inline box đầu article, `<nav aria-label="toc">`, anchor link khớp id Astro sinh (verified `<h2 id=` có sẵn trong dist). Slug-parity: `scripts/check-blog-slug-parity.mjs` so sánh slug set en ≡ vi trong `src/content/blog/`, chain vào `pnpm build` (`node scripts/... && astro build` — package.json chỉ có build: astro build), lệch → exit 1. README: chỉ site-domain links `wakii.dev`→`wakii.xyz`, giữ github links.

## Touch map (verified phase0)
- `src/layouts/Base.astro` — sửa head + thêm props (blast radius 21+ pages: canonical/hreflang hiện tại đã render đúng, KHÔNG được đụng logic đó)
- `src/pages/rss.xml.js` — sửa (hiện `<language>en-vi</language>` sai + inline regex + 0 items)
- `src/components/BlogToc.astro` — tạo mới (DocsLayout không có TOC — không duplicate)
- `scripts/check-blog-slug-parity.mjs` — tạo mới; `package.json` — sửa script `build`
- `public/og-default.svg` + `public/og-default.png` — tạo mới (public/ hiện chỉ có favicon/logo/wakii-icon svg)
- `README.md` — sửa domain links
- **KHÔNG đụng:** content.config.ts (schema đủ), astro.config.mjs, Nav.astro, vercel.json, robots.txt.ts, blog [slug] pages (wiring ở task riêng — og article props truyền từ page vào Base qua props)

## ACCEPTANCE (grep/browser trên dist sau build)
- `dist/index.html` + `dist/vi/index.html` + 1 docs page + `dist/blog/index.html` + `dist/vi/blog/index.html`: có `og:title/description/url/image` + `twitter:card=summary_large_image` + RSS autodiscovery link; `og:image` = `https://wakii.xyz/og-default.png` (absolute); canonical + hreflang các page này **bất biến** so với trước
- `dist/blog/index.html` + `dist/vi/blog/index.html`: `og:type=website`
- `dist/rss.xml`: không chứa `<language>`, channel valid (0 items OK — posts thuộc SF-2)
- `scripts/check-blog-slug-parity.mjs` chạy green với 0 posts; negative check: thêm slug lệch tạm → build FAIL (verify tay rồi bỏ)
- `dist/og-default.png` tồn tại <300KB; SVG nguồn trong git
- README không còn `wakii.dev` (site-domain), github links giữ nguyên

## Boundary
- KHÔNG thêm field image vào blog schema (ogImage prop là đủ — iteration này mọi page dùng default)
- KHÔNG đụng canonical/hreflang logic có sẵn của Base.astro (đã verified render đúng)
- KHÔNG đụng astro.config.mjs / Nav.astro / vercel.json
- KHÔNG wire og article props vào [slug] pages ở SF này (task `wire-...` làm — cùng SF nhưng task riêng)
- KHÔNG tạo posts (SF-2)
