# Spec: Blog features — wakii-site

Date: 2026-09-07 | Repo: wakii-site (Astro 5 static, i18n en root + vi /vi/, Vercel) | Owner goals: chia sẻ kiến thức công nghệ · tăng traffic · hướng dẫn dùng Wakii
Rev 2 — áp spec-critic PASS-WITH-FIXES (P0 OG contract + 4 P1 + P2s).

## IDEA-BRIEF (8 chiều)

- **Task:** xây blog hoàn chỉnh trên wakii-site — content thật (5 bài × 2 locale) + SEO surface (OG/RSS/TOC) — không phải chỉ routing (groundwork `fae770d` + `9d4d460` SITE_URL=wakii.xyz đã có collection/pages/RSS/nav).
- **Output:** `/blog` + `/vi/blog` với 10 file markdown (5 topics × en/vi), OG tags + twitter:card trên mọi page, RSS feed hợp lệ có items + autodiscovery link, TOC trên bài dài, og-default asset.
- **Users:** dev tiếng Việt + tiếng Anh tìm hiểu agentic IDE; người dùng Wakii cần hướng dẫn.
- **Constraints:** MUST — mỗi post đủ 2 locale cùng PR (hreflang parity + build-time assertion); MUST — Base.astro blast radius toàn site → canonical/hreflang hiện tại không được regression; MUST NOT — hardcode version trong CI workflows; static only (no CMS/comments/analytics code); slugs EN cho cả 2 locale (parity contract, vĩnh viễn).
- **Input:** groundwork đã commit; phase0 report (verified build probe); spec-critic rev 1; release notes 1.4.199; session material (FI-305).
- **Context:** sitemap integration có sẵn; i18n routing LOCKED; deploy = Vercel push-to-deploy trên main; SITE_URL = `https://wakii.xyz` (owner confirm 2026-09-07).
- **Success criteria (binary, tất cả grep/browser-check được):**
  1. `pnpm build` pass.
  2. dist sitemap chứa đúng **10 URL blog: 5 × `/blog/<slug>/` + 5 × `/vi/blog/<slug>/`**.
  3. `dist/rss.xml` có 10 items, mỗi item guid = URL tuyệt đối, **KHÔNG chứa `<language>`**.
  4. Head mỗi blog post: `og:image` content là **URL tuyệt đối bắt đầu `https://wakii.xyz`** (grep bắt được relative `/og-default.png` = FAIL), `og:type=article` + `article:published_time` trên post / `og:type=website` trên listing, `twitter:card=summary_large_image`, RSS autodiscovery link present.
  5. TOC render trên ≥2 seed posts (mỗi bài ≥3 h2), anchor links khớp heading ids.
  6. **Regression baseline = dist build từ main TRƯỚC story branch** (không phải live): so sánh landing `/` + `/vi/`, `/download/` + `/vi/download/`, 1 docs page sample, 404 — canonical + hreflang en/vi/x-default **bất biến**, 404 vẫn noindex.
  7. Mỗi hreflang target trên blog pages tương ứng 1 file tồn tại trong dist (không 404).
- **Out-of-scope:** story→blog auto-pipeline (phase sau), CMS, comment system, analytics code, mobile nav hamburger (site-wide existing), category pages (defer đến ≥15 bài).

## 2. Scope

* **In:**
  1. `src/layouts/Base.astro` — OG meta contract PINNED: `og:image` **URL tuyệt đối** (`new URL(ogImage, Astro.site)` — phải bắt đầu `https://wakii.xyz`; relative bị Facebook/Twitter/Zalo bỏ qua im lặng), `og:type` = `article` trên post pages (+ `article:published_time`) / `website` trên listing, `twitter:card` = `summary_large_image`, `og:url` = canonical, `og:image:width/height/alt`; optional `ogImage` prop (iteration này mọi page dùng default — schema content KHÔNG thêm field image) + RSS autodiscovery `<link rel="alternate" type="application/rss+xml" href="/rss.xml">`.
  2. `src/pages/rss.xml.js` — **omit hoàn toàn `<language>`** (feed song ngữ), dùng helper `blogSlug`, guid tường minh (= URL tuyệt đối, tự unique giữa 2 locale).
  3. Asset `public/og-default.png` 1200×630 — **commit kèm SVG nguồn**, PNG <300KB, brand mono `~/wakii.` aesthetic.
  4. TOC component `src/components/BlogToc.astro` — từ `render().headings`, render khi ≥3 h2, áp cả 2 trang `[slug]`: chỉ h2, anchor ids khớp rehype-slug mặc định của Astro, inline box đầu article, `<nav aria-label="toc">`. **≥2 seed posts (EN) phải có ≥3 h2** để acceptance không rỗng.
  5. Build-time assertion **slug parity**: slug set EN ≡ VI trong `src/content/blog/` (script check, fail build nếu lệch).
  6. **10 seed posts** (5 topics × en/vi — bảng dưới) — frontmatter đúng schema, `draft=false`, `pubDate` quá khứ, mỗi post link sang ≥1 docs page chính tắc (anti-cannibalization).
  7. `README.md` wakii.dev → wakii.xyz (chỉ README — spec lịch sử giữ nguyên làm audit trail).
* **Out:** nêu ở Out-of-scope.

**5 seed topics** (category · slug · keywords SEO mục tiêu — slugs VĨNH VIỄN):
1. tutorial · `review-ai-agents-from-your-phone` — "duyệt AI agent từ điện thoại", "agentic IDE mobile"
2. tech · `story-workflow-idea-to-release` — "AI agent development workflow", "story-driven development"
3. tech · `decision-gates-safe-ai-agents` — "AI agent guardrails", "supervised AI coding"
4. tech · `forking-an-ide-keeping-current-with-upstream` — "forking an Electron IDE", "tracking upstream git fork"
5. build-log · `building-wakii-in-the-open-log-1` — brand "Wakii", "building an AI IDE"

Nội dung nguồn thật: FI-305 session (story workflow end-to-end, gate resolve từ phone, pairing), release 1.4.199, fork-sync practice. VI là source-first, EN translated. Anti-cannibalization: docs giữ intent "how-to chính tắc", blog giữ intent trải nghiệm/workflow. Bài 1 gộp luôn phần pairing (đủ tutorial theo goal 3).

## 3. Touch map (verified — phase0 build probe)

* **Sửa:** `src/layouts/Base.astro` (OG + RSS link + ogImage prop — blast radius toàn site, cẩn trọng canonical/hreflang); `src/pages/rss.xml.js` (omit language + helper + guid); `README.md` (domain).
* **Tạo:** `src/content/blog/en/*.md` ×5 · `src/content/blog/vi/*.md` ×5 (thư mục CHƯA tồn tại — tạo mới); `public/og-default.png` + SVG nguồn; `src/components/BlogToc.astro`; slug-parity check script.
* **Không đụng:** content.config.ts (schema đủ), astro.config.mjs (sitemap có sẵn, không thêm remark plugin), Nav.astro (blog link có sẵn), vercel.json, robots.

## 4. Second-order effects (từ phase0)

* Base.astro là layout của 21+ pages — regression surface là SEO toàn site → convergence SF phải verify canonical/hreflang trên landing/docs/download/404, không chỉ blog (baseline = dist build từ main trước story).
* Deploy ordering: SEO fix + 10 posts **cùng merge/release** — không deploy blog trống.
* Slug = vĩnh viễn (đổi sau = 404) — chốt slugs ngay trong spec này.
* Prose style trùng lặp giữa 2 trang `[slug]` — chấp nhận (scope A), debt nếu thêm reading-time sâu hơn.
* Keywords là giả thuyết chưa có search-volume data — validate qua Search Console sau khi live.

## 5. ACCEPTANCE

= Success criteria 7 dòng (binary) ở IDEA-BRIEF — từng dòng verify bằng grep trên `dist/` sau build + browser check `/blog/` + `/vi/blog/` sau deploy preview. Verifier đối chiếu từng dòng với evidence (command output), không accept "đã làm".
