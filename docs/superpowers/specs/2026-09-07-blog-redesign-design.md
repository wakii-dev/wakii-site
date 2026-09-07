# Spec — Blog redesign: layout · category taxonomy · SEO · multi content type

Story: blog listing + detail redesign trên wakii.xyz. Độ hoàn thiện production-grade.
Baseline: main @ `3d9a7c3` (blog FI-339 đã merge qua PR #1) + `92cf0bf` (improvements backfill).
Spec rev 2 — áp spec-critic PASS-WITH-FIXES (2 P0 + 8 P1 + P2s, 2026-09-07).

## IDEA-BRIEF (8 chiều)

- **Task**: redesign layout blog listing + detail; thêm phân loại category (taxonomy), SEO depth, multi content type (schema).
- **Output**: listing mới (EN/VI), detail mới (EN/VI), 6 taxonomy pages mới, schema mở rộng — site vẫn static Astro 5.
- **Users**: độc giả dev/product trên wakii.xyz; Google/social crawlers.
- **Constraints (MUST)**: giữ contracts pinned — OG article contract FI-339 rev 2 (og:type=article + publishedTime + og:image absolute), RSS contract FI-339 SF-1 (bilingual, guid absolute, no language element), i18n routing LOCKED (`prefixDefaultLocale: false`), URL 10 posts hiện có KHÔNG đổi, brand tokens.css authority.
- **Input**: code as-built (đọc thật), 10 posts seed, DocsLayout as-built (direction cho detail).
- **Context**: blog vừa live qua PR #1; layout hiện tại là bản "cần thiết" chưa qua design pass; brand icon/mint đã ship.
- **Success criteria**: mọi route mới+cũ indexable đúng (canonical/hreflang/sitemap/robots verify qua view-source + JSON-LD script), category navigate end-to-end EN+VI, 10 posts render đúng schema mới không mất dữ liệu, browser walkthrough EN+VI sạch, build + parity gate pass.
- **Out-of-scope**: MDX (chưa cần — 10 posts thuần prose, thêm sau non-breaking), collection mới theo loại content (changelog/video…), feed per-category, đổi URL posts, Nav dropdown, comment system, analytics, dark/light toggle (site dark-only by design).

## DECISIONS (user chốt 2026-09-07 + rev-2 patches)

| # | Decision | Chốt |
|---|---|---|
| D1 | Category navigation | **Taxonomy routes** `/blog/category/<cat>/` + `/vi/blog/category/<cat>/` (namespace an toàn — KHÔNG dùng `/blog/<cat>/`) |
| D2 | Multi content type | **Schema extension** trong collection `blog` — KHÔNG collection mới, KHÔNG MDX |
| D3 | ~~Category enum~~ | Removed intentionally — giữ nguyên 3 giá trị là FACT đã probe (per-locale: tech×3, build-log×1, tutorial×1; tổng 10 file: tech×6, build-log×2, tutorial×2), additive-safe |
| D4 | Fields mới | `heroImage` (optional string path), `author` (optional `z.string()`, default "Wakii team" — single-author, multi-author là future union additive-safe), `readingTime` **computed** (không phải frontmatter), related posts **computed** |
| D5 | OG per-post | og:image = `heroImage` khi có, fallback `/og-default.png` — absolute qua `new URL(, Astro.site)`. **Hero spec: PNG 1200×630** (`public/blog/heroes/<slug>.png`) — khớp hardcode `og:image:width/height` 1200/630 của Base.astro, KHÔNG đụng Base cho dims. **Carve-out contract (additive)**: Base.astro thêm 1 prop optional `ogImageAlt` (default = hiện tại) — không đổi hành vi khi không truyền. **Image pipeline: string path trong `public/`** — KHÔNG astro:assets (D5 nguyên văn đúng, zero pipeline risk; astro:assets chỉ nếu sau này có bằng chứng LCP cần) |
| D6 | RSS | Giữ nguyên 1 bilingual feed (pinned) |
| D7 | Visual | Design-first qua designer cho listing (3 hướng HTML → USER GATE); detail direction = DocsLayout as-built (user chỉ định "giống /docs/faq/") |
| — | Category enum | Giữ nguyên 3 giá trị (fact đã probe, per-locale) |
| — | SEO surface | JSON-LD (BlogPosting detail · Blog+BreadcrumbList listing/category) + og per-post + related posts; canonical/hreflang/sitemap đã free từ Base.astro; **robots: `src/pages/robots.txt.ts` đã tồn tại** (emit sitemap pointer từ SITE_URL, Allow all — route mới tự được cover, không cần task) |

## Contracts PINNED (reviewer phải check)

1. OG article contract FI-339 rev 2: posts truyền `ogType="article"` + `publishedTime` + og:image absolute qua `new URL(ogImage, Astro.site)` — rev-2 carve-out: Base thêm `ogImageAlt` optional, dims giữ hardcode 1200/630.
2. RSS contract FI-339 SF-1: bilingual, NO `<language>`, `<guid>` absolute per locale.
3. i18n: `astro.config.mjs` `prefixDefaultLocale: false` — không đổi.
4. Post URLs `/blog/<slug>/` + `/vi/blog/<slug>/` — không đổi.
5. `data-astro-cid-*` khoan dung trong audit regex; reveal gotcha: element ngoài viewport opacity 0 trong headless full-page (không phải bug).

## Common rules (áp cho mọi SF — chống bug im lặng)

- **Draft filter**: MỌI query blog (pager/sidebar/related/listing/taxonomy counts) lọc `draft: false` — mirror getStaticPaths của `[slug].astro`.
- **Same-locale**: related/pager/sidebar KHÔNG bao giờ cross-locale.
- **Tags render**: plain chips (không link — không có tag pages trong scope).
- **Reading time**: computed util — WPM EN 200, VI 160; làm tròn lên; min 1 phút.

## SF breakdown (rubric C1-C5/V1-V3 · SF-SCOPE LỚN · chống duplicate)

Anti-duplicate pass (rev 2): pattern dùng chung đã TÁCH vào SF-1 tier-0 (category label map i18n, readingtime util, related util, og per-post wiring, hero assets). JSON-LD ở SF-2 (BlogPosting) vs SF-3 (Blog/BreadcrumbList) = types + pages khác nhau → không duplicate. **Parity script chạm 2 lần CỐ Ý**: SF-1 `parity-script-extend-check-schema` (schema fields mới) và SF-4 `parity-gate-extend-category-routes` (route chỉ tồn tại sau SF-3) — timing khác nhau, justify ở đây. Không SF nào ≥50% tasks cùng loại với SF khác.

### SF-1 — Schema + shared content infra (Tier 0)
**What**: nền dùng chung — schema blog mở rộng sẵn sàng (10 posts cũ không vỡ), utils dùng chung, og per-post hoạt động, hero tiles tồn tại. Demo (data-level — UI là scope SF-2): build pass + grep dist thấy og:image per-post absolute trên post có hero + og-default fallback trên post không hero; **readingTime/author verify bằng node assertion ở mức util** (script import util, assert output cho post đã biết: min 1 phút, làm tròn lên, EN 200/VI 160 WPM) — KHÔNG grep dist cho util (không route render nó ở tier này).
**Depends on**: —
**Tasks (~10)**: schema-extension-optional-defaults / category-label-map-i18n-shared-en-vi-chỉ-tạo-map / readingtime-util-wpm-en200-vi160 / related-util-fallback-chain / og-image-per-post-wiring-absolute / base-ogimagealt-prop-additive / hero-pipeline-public-path / hero-assets-mint-4-posts-1-fallback-exercise / parity-script-extend-check-schema / docs-comment-contract-update

Chi tiết pin:
- Related algorithm: same-category → fallback shared-tags (≥1 tag chung) → fallback latest-same-locale; max 3; ẩn section khi rỗng hoàn toàn.
- Hero assets: **4 hero PNG 1200×630 mint-brand** cho 4 posts (đủ 3 category), **1 post cố ý KHÔng có hero** → exercise fallback og-default. VI mirror dùng chung hero EN (4 file mint + og-default có sẵn — KHÔNG mint 10).
- Schema: `heroImage: z.string().optional()`, `author: z.string().default('Wakii team')` — mọi field mới optional/default ⇒ zero migration frontmatter.
- `category-label-map`: SF-1 CHỈ tạo shared map trong src/i18n/ — listing pages adopt map là việc SF-3 (tránh double-touch).

### SF-2 — Detail page redesign — docs shell (Tier 1)
**What**: trang bài viết (EN+VI) nhìn/act như /docs/faq/: sidebar trái danh sách posts (date desc, current highlight, draft-filtered) + LangSwitcher, prev/next pager theo ngày, meta đầy đủ (date · **category label thuần** — link wire ở SF-4 · tags chips · author · reading-time), TOC giữ nguyên (BlogToc — constraint của layout component: h2-only, ≥3 h2 gate), light reveal per prose block, heroImage hiển thị khi có (**img width=1200 height=630 explicit**), related posts cuối trang (fallback chain SF-1), after-CTA "get wakii" giữ như layout cũ. Demo: mở 1 post → shell docs-like hoàn chỉnh, prev/next chạy, related dẫn sang post khác, post không hero vẫn đẹp (fallback).
**Depends on**: SF-1
**Tasks (13 — Zweck tasks là first-class, không annotation)**: blog-detail-layout-component / sidebar-posts-list-current-highlight / prev-next-pager-by-date / langswitcher-integration / meta-row-label-tags-author-readingtime / hero-image-render-when-present-width-height / related-posts-section-fallback / jsonld-blogposting-article / light-reveal-prose-children / route-wiring-en-rewrite-slug-astro / route-wiring-vi-rewrite-slug-astro / responsive-pass / og-contract-regression-check

### SF-3 — Listing + category taxonomy redesign (Tier 1) — DESIGN-FIRST
**What**: /blog/ + /vi/blog/ redesign theo direction designer đã duyệt (user gate bắt buộc); category navigation end-to-end: chips/nav trên listing + 6 taxonomy pages `/blog/category/{tutorial,tech,build-log}/` (+VI) dùng chung component listing (pin LangSwitcher trên listing + category pages); category page rỗng (tương lai) render empty-state — **verify method: non-empty categories = dist grep; empty branch = component-level render check (code-review only, non-blocking)**; JSON-LD Blog + BreadcrumbList; listing componentize (diệt 95% duplication EN/VI). Demo: /blog/ → chọn category → taxonomy page → bấm post → đọc → breadcrumb quay lại.
**Depends on**: SF-1 (build tasks; **design phase 3-hướng có launch song song SF-1** — design không consume SF-1 output, user-gate latency chi phối)
**Design**: mock-prototype (3 hướng HTML → user pick → hand-off spec)
**Tasks (11)**: design-3-hướng-html / design-user-pick-gate / blog-listing-component-shared-langswitcher / listing-index-en-redesign / listing-index-vi-redesign / taxonomy-getstaticpaths-from-enum / category-route-en-x3-empty-state / category-route-vi-x3-empty-state / jsonld-blog-collectionpage / jsonld-breadcrumblist / responsive-pass
(i18n keys dùng category-label-map-shared từ SF-1 — không duplicate; wire category-link vào detail meta CHUYỂN sang SF-4 — cross-SF wiring)

**VI/EN strings taxonomy (pre-drafted — VI copy user-approve tại SF-3 verify gate)**:
- EN: tutorial / tech notes / build log · "Category: <label>" · "No posts yet — check back soon."
- VI: hướng dẫn / kỹ thuật / nhật ký xây dựng · "Chuyên mục: <label>" · "Chưa có bài viết — quay lại sau nhé."

### SF-4 — Convergence QA (Tier 2)
**What**: toàn site sạch mức production: hreflang không half-pair + sitemap chứa mọi route mới, JSON-LD valid cả 3 loại (validator script), og per-post absolute đúng, contracts pinned không drift (check scripted), reduced-motion sạch, perf không regression, links/locale e2e + browser walkthrough EN+VI, wire category-link vào detail meta (cross-SF wiring — chạy sau khi SF-2+SF-3 merge), release readiness. Demo: audit script + browser walkthrough full pass.
**Depends on**: SF-2, SF-3
**Tasks (10)**: wire-category-links-detail-meta / parity-gate-extend-category-routes-mode-dist-postbuild / hreflang-sitemap-full-site-audit / jsonld-validate-script-check-jsonld / og-perpost-absolute-audit / contract-regression-check-fi339-scripted / reduced-motion-audit / perf-audit-deployed-preview / link-integrity-locale-e2e-walkthrough / release-readiness-build-smoke

Chi tiết pin:
- JSON-LD validator: **`scripts/check-jsonld.mjs`** node script chạy trên `dist/` — parse mọi `<script type="application/ld+json">`, assert per-type: BlogPosting (headline/datePublished/author/@type), Blog (blogPost array), BreadcrumbList (itemListElement chain) + URLs absolute.
- Parity extend mode: **`--dist` post-build** trong SF-4 verify (không ép vào build gate — routes derive-from-enum all-or-nothing).
- Contract regression scripted: grep `dist/rss.xml` (no `<language>`, `<guid>` absolute ×10 bilingual) + grep dist OG dims hardcode 1200/630 + `ogImageAlt` additive.
- Perf: Lighthouse trên **deployed preview URL** (không local — memory: noise ±8-17 local); tiêu chí "no regression beyond noise band (±17)"; baseline đo đầu SF-4.
- Walkthrough: fold EN + VI screenshots + reduced-motion check tại viewer vào `link-integrity-locale-e2e-walkthrough`.

## Risks

1. **Hreflang half-pair** — route mới ra 1 locale thiếu locale kia → hreflang trỏ 404. Mitigation 2 lớp: route generation derive-from-enum + parity gate mở rộng (SF-4 audit).
2. **Contract drift FI-339** — og article + rss guid pinned trong comment; reviewer check 2 comment pin + carve-out ogImageAlt phải additive.
3. **Thin category content** — 1-2 posts/category: chấp nhận (indexable + empty-state được định nghĩa).
4. **Image first-use** — hero PNG 1200×630 public path, width/height attr bắt buộc trên `<img>` (không layout shift).

## Boundary (KHÔNG làm)

MDX · collection mới (changelog/video…) · feed per-category · đổi URL posts · Nav dropdown · tag pages (tags = plain chips) · multi-author · astro:assets image pipeline · comment system · analytics · dark/light toggle.
