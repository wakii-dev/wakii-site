# Spec: Blog features — wakii-site

Date: 2026-09-07 | Repo: wakii-site (Astro 5 static, i18n en root + vi /vi/, Vercel) | Owner goals: chia sẻ kiến thức công nghệ · tăng traffic · hướng dẫn dùng Wakii

## IDEA-BRIEF (8 chiều)

- **Task:** xây blog hoàn chỉnh trên wakii-site — content thật (5 bài × 2 locale) + SEO surface (OG/RSS/TOC) — không phải chỉ routing (groundwork `fae770d` + `9d4d460` đã có collection/pages/RSS/nav/SITE_URL=wakii.xyz).
- **Output:** `/blog` + `/vi/blog` với 10 file markdown (5 topics × en/vi), OG tags + twitter:card trên mọi page, RSS feed hợp lệ có items + autodiscovery link, TOC trên bài dài, og-default asset.
- **Users:** dev tiếng Việt + tiếng Anh tìm hiểu agentic IDE; người dùng Wakii cần hướng dẫn.
- **Constraints:** MUST — mỗi post đủ 2 locale cùng PR (hreflang parity); MUST — Base.astro blast radius toàn site → canonical/hreflang hiện tại không được regression; MUST NOT — hardcode version trong CI workflows; static only (no CMS/comments/analytics code); slugs EN cho cả 2 locale (parity contract).
- **Input:** groundwork đã commit; phase0 report (verified build probe); release notes 1.4.199; session material (FI-305).
- **Context:** sitemap integration có sẵn; i18n routing LOCKED; deploy = Vercel push-to-deploy trên main.
- **Success criteria (binary):** `pnpm build` pass; dist sitemap chứa 10 URL `/blog/<slug>/` + `/vi/blog/<slug>/`; `dist/rss.xml` có 10 items + language tag hợp lệ; head của mỗi blog page có og:* + twitter:card + `<link rel="alternate" type="application/rss+xml">`; TOC render trên posts ≥3 h2; hreflang en↔vi pair đúng trên mọi blog page; docs/landing canonical KHÔNG đổi.
- **Out-of-scope:** story→blog auto-pipeline (phase sau), CMS, comment system, analytics code, mobile nav hamburger (site-wide existing), category pages (defer đến ≥15 bài).

## 2. Scope

* **In:** (1) Base.astro — OG meta với contract PINNED: `og:image` **URL tuyệt đối** (`new URL(ogImage, Astro.site)` — phải bắt đầu `https://wakii.xyz`; relative bị Facebook/Twitter/Zalo bỏ qua im lặng), `og:type` = `article` trên post pages (+ `article:published_time`) / `website` trên listing, `twitter:card` = `summary_large_image`, `og:url` = canonical, `og:image:width/height/alt`; optional `ogImage` prop (iteration này mọi page dùng default — schema content KHÔNG thêm field image) + RSS autodiscovery `<link rel="alternate" type="application/rss+xml">`; (2) fix `rss.xml.js` — **omit hoàn toàn `<language>`** (feed song ngữ), dùng helper `blogSlug`, guid tường minh (= URL tuyệt đối, tự unique giữa 2 locale); (3) asset `public/og-default.png` 1200×630 — **commit kèm SVG nguồn**, PNG <300KB, brand mono ~/wakii. aesthetic; (4) 10 seed posts (5 topics × en/vi — bảng dưới) frontmatter đúng schema, `pubDate` quá khứ; (5) TOC component (từ `render().headings`, render khi ≥3 h2, áp cả 2 trang `[slug]`): chỉ h2, anchor ids khớp rehype-slug mặc định của Astro, inline box đầu article, `<nav aria-label="toc">`; **≥2 seed posts (EN) phải có ≥3 h2** để acceptance không rỗng; (6) build-time assertion **slug parity**: slug set EN ≡ VI trong `src/content/blog/` (script check, fail build nếu lệch); (7) README.md wakii.dev → wakii.xyz (chỉ README — spec lịch sử giữ nguyên làm audit trail); (8) mọi seed posts `draft=false` + mỗi post link sang ≥1 docs page chính tắc (anti-cannibalization).
* **Out:** nêu ở Out-of-scope.

**5 seed topics** (category · slug · keywords SEO mục tiêu):
1. tutorial · `review-ai-agents-from-your-phone` — "duyệt AI agent từ điện thoại", "agentic IDE mobile"
2. tech · `story-workflow-idea-to-release` — "AI agent development workflow", "story-driven development"
3. tech · `decision-gates-safe-ai-agents` — "AI agent guardrails", "supervised AI coding"
4. tech · `forking-an-ide-keeping-current-with-upstream` — "forking an Electron IDE", "tracking upstream git fork"
5. build-log · `building-wakii-in-the-open-log-1` — brand "Wakii", "building an AI IDE"

Nội dung nguồn thật: FI-305 session (story workflow end-to-end, gate resolve từ phone, pairing), release 1.4.199, fork-sync practice. VI là source-first, EN translated. Anti-cannibalization: docs giữ intent "how-to chính tắc", blog giữ intent trải nghiệm/workflow — không viết bài trùng hẹp với docs pages.

## 3. Touch map (verified — phase0 build probe)

* **Sửa:** `src/layouts/Base.astro` (OG + RSS link + ogImage prop — blast radius toàn site, cẩn trọng canonical/hreflang); `src/pages/rss.xml.js` (language + helper + guid); `README.md` (domain).
* **Tạo:** `src/content/blog/en/*.md` ×5 · `src/content/blog/vi/*.md` ×5 (thư mục CHƯA tồn tại — tạo mới); `public/og-default.png`; `src/components/BlogToc.astro` (TOC).
* **Không đụng:** content.config.ts (schema đủ), astro.config.mjs (sitemap có sẵn, không thêm remark plugin), Nav.astro (blog link có sẵn), vercel.json, robots.

## 4. Second-order effects (từ phase0)

* Base.astro là layout của 21+ pages — regression surface là SEO toàn site → convergence SF phải verify canonical/hreflang trên landing/docs/download, không chỉ blog.
* Deploy ordering: SEO fix + 10 posts **cùng merge/release** — không deploy blog trống.
* Slug = vĩnh viễn (đổi sau = 404) — chốt slugs ngay trong spec này.
* Prose style trùng lặp giữa 2 trang `[slug]` — chấp nhận (scope A), debt nếu thêm TOC/reading-time sâu hơn.
* Keywords là giả thuyết chưa có search-volume data — validate qua Search Console sau khi live.

## 5. Success = ACCEPTANCE

Xem Success criteria (binary) ở IDEA-BRIEF — từng dòng verify bằng grep trên `dist/` sau build + browser check /blog/ + /vi/blog/ sau deploy preview.
