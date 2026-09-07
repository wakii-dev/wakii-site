# Plan — SF-2 Detail page redesign: docs shell (FI-356)

Spec: docs/superpowers/specs/2026-09-07-blog-redesign-design.md (rev 3, §SF-2) + bracket
docs/superpowers/brackets/fi349-blog-redesign.md + context pack docs/superpowers/contexts/sf-2.md
Branch: wakii-dev/sf-2-blog-detail (base story/fi349-blog-redesign @ 674914b) → merge (update-ref) về story/fi349-blog-redesign

Scope note: UI tier — detail EN+VI thành docs-shell. KHÔNG đụng listing/category pages (SF-3),
KHÔNG wire category-link trong meta (SF-4 — label thuần), KHÔNG sửa DocsLayout/Base/motion.ts/
schema/RSS, KHÔNG tag pages. Contracts giữ: og article FI-339 (ogType/publishedTime/ogImage
absolute qua new URL ở Base), URL shape, getStaticPaths draft filter, BlogToc contract,
LangSwitcher hành vi.

Quyết định đã probe (recorded):
- **Layout sở hữu toàn bộ article shell** (hero/h1/meta/prose+toc/related/pager/after-CTA/
  JSON-LD), pages còn thin (getStaticPaths + render + `<Content />` slot). Alternative B
  (DocsLayout-style: layout chỉ chrome, pages render h1/meta) bị loại — mirror EN/VI ~95%
  duplicate meta/hero/related/JSON-LD, drift risk; anti-duplicate pass của spec favors shared.
  og contract comment chuyển theo wiring vào layout (wiring giữ nguyên expression
  `entry.data.heroImage ?? '/og-default.png'`).
- `entry` truyền thẳng vào layout — layout tự derive locale (blogLocale), sidebar, pager,
  related (utils SF-1), reading time (postReadingTime), viExists (probe collection thay vì
  hardcode true — post VI thiếu sau này tự fallback EN đúng contract LangSwitcher).
- Pager theo ngày: sidebar sort date-desc; prev = index+1 (older), next = index-1 (newer).
- JSON-LD đặt trong body layout (`is:inline` + `set:html` — tránh Astro bundle) — schema.org
  chấp nhận JSON-LD anywhere; KHÔNG đụng Base head.
- Mobile <800px: 1-col, sidebar XUỐNG DƯỚI article (CSS order) theo context pack
  ("sidebar xuống dưới/ẩn hợp lý") — khác DocsLayout (giữ sidebar trên) vì blog detail
  reading-first; LangSwitcher đi theo sidebar.
- UI strings EN/VI: record nội bộ trong layout (mirror EN, không claim mới): Related/
  "Bài liên quan", "N min read"/"N phút đọc"; after-CTA giữ nguyên text cũ (get wakii/tải wakii).
- Preview port 4327 (tránh va SF-3 song song ở worktree khác); verify Rule 0 bằng headless
  Chrome (screenshot) + node/DOM asserts trên dist — không đụng tab Orca dùng chung.

Plan-critic rev 2 (PROCEED, 0 P0 — applied): (a) tasks 1-9 CÙNG 1 file → execution
SERIAL strict 1→…→9 → 10∥11 → 12 → 13 (solo inline — không fanout worker); (b) after-CTA
+ BlogToc wiring pin tường minh vào task 1; (c) DOM assert "no NaN" cho reading-time;
(d) sort tiebreak slug secondary (pubDate trùng nhau trong seed); (e) tail order PIN:
prose → related → after-CTA → pager (Related = "cuối bài" theo ACCEPTANCE, pager cuối
= docs DNA; CTA vẫn trong tail — ghi nhận 2 mệnh đề "cuối" của context pack đụng nhau,
chọn 1, reviewer soi); (f) class prefix `bd-*` riêng (giữ nguyên `.prose` — reveal
selector + prose-style contract), (g) pager `aria-label` + related heading là `h2` thật.

## Tasks

- [ ] 1. blog-detail-layout-component: `src/layouts/BlogDetailLayout.astro` (MỚI) — docs-shell mirror: grid `220px + 1fr` max 1080px, sticky sidebar trái, article phải; wrap Base với title/description/ogType="article"/publishedTime/ogImage từ entry; prose styles copy theo DocsLayout (direction D7); script reveal pattern DocsLayout. Trong task 1 cũng pin: (a) **after-CTA block** 4 mảnh locale-conditional — pitch line ("Wakii is an agentic IDE…" / "Wakii là IDE agentic…"), cta "get wakii"/"tải wakii" → `/download/`//`/vi/download/`, back "← all posts"/"← tất cả bài viết" → `/blog/`//`/vi/blog/`; (b) **BlogToc wiring**: import BlogToc, render ĐẦU `.prose`, prop `headings` (từ `render()`) + label locale "Contents"/"Nội dung" — component KHÔNG đổi.
- [ ] 2. sidebar-posts-list-current-highlight: sidebar query blog same-locale + `draft:false` sort date-desc; eyebrow `~/blog` (`$` accent như docs); list `aria-current='page'` mint border-left; `nav aria-label="Blog navigation"`.
- [ ] 3. prev-next-pager-by-date: pager style `docs-pager` (← prev / next →); prev = older (ngày trước), next = newer (ngày sau); same-locale + draft-filtered; sort date-desc với tiebreak slug secondary (2 posts/ngày trong seed — deterministic); `aria-label="Blog pagination"`.
- [ ] 4. langswitcher-integration: LangSwitcher dưới sidebar (`.docs-lang` pattern); `viExists` computed từ collection (vi/ cùng slug, draft:false) — fallback EN đúng contract khi thiếu.
- [ ] 5. meta-row-label-tags-author-readingtime: meta row trên h1 — date (time datetime) · category label thuần từ `CATEGORY_LABELS[locale]` (KHÔNG link) · tags chips plain `#tag` · author · reading time `postReadingTime(entry)` ("N min read" / "N phút đọc").
- [ ] 6. hero-image-render-when-present-width-height: `heroImage` có → `<img src width={1200} height={630} loading="eager" alt={title}>` đầu article; không có → không render hero block (og fallback đã lo ở SF-1).
- [ ] 7. related-posts-section-fallback: `relatedPosts(entry, all)` util SF-1; heading `h2` thật locale ("Related posts"/"Bài liên quan") + links title+date; ẩn hoàn toàn khi rỗng; đặt ngay sau prose (trước after-CTA — tail order pin: prose → related → after-CTA → pager).
- [ ] 8. jsonld-blogposting-article: `<script type="application/ld+json" is:inline set:html>` — `@type: BlogPosting`, headline, datePublished (ISO), author `{"@type":"Organization","name":author}`, mainEntityOfPage/url + image ABSOLUTE qua `new URL(, Astro.site)`.
- [ ] 9. light-reveal-prose-children: layout `<script>` — `revealChildren(article, '.prose > *')` + `initMotion()` + import motion.css (đúng pattern DocsLayout; reduced-motion kill-switch giữ nguyên; KHÔNG đụng motion.ts).
- [ ] 10. route-wiring-en-rewrite-slug-astro: `src/pages/blog/[slug].astro` — rewrite thin: getStaticPaths giữ nguyên (draft filter) + render + `<BlogDetailLayout entry headings><Content /></BlogDetailLayout>`; og contract comment chuyển sang layout.
- [ ] 11. route-wiring-vi-rewrite-slug-astro: `src/pages/vi/blog/[slug].astro` — mirror EN (path import đúng `../../../`), layout tự xử lý locale strings.
- [ ] 12. responsive-pass: @800 1-col (sidebar xuống dưới qua order), padding mobile; verify @390 no-overflow bằng same-origin iframe probe trên dist preview.
- [ ] 13. og-contract-regression-check: sau wiring — build xanh + grep dist 10 post pages: `og:type=article`, `article:published_time` khớp pubDate, `og:image` absolute (hero URL 4 posts ×2 locale, `/og-default.png` absolute trên building-wakii ×2), `og:image:width/height` 1200/630 giữ nguyên. Evidence vào audit FI-356 (scripted checker là SF-4).

Meta steps (không checkbox — chạy sau task 13):

- `pnpm build` xanh (parity + utils gate + astro build; vẫn 31 pages — KHÔNG route mới)
- Rule 0 verify 3 tầng: DOM (node asserts trên dist HTML: aria-current đúng post, meta row đủ + **không "NaN" trên cả 10 pages** (guard entry.body cho readingTime), JSON-LD parse, pager/related/langswitcher href đúng, hero img attrs) · VISUAL (headless Chrome screenshot EN có hero + EN không hero + VI + mobile 390 probe, Read ảnh SO VỚI /docs/faq/) · FLOW (preview :4327 — /blog/ → post → prev/next → related → langswitcher EN↔VI giữ slug) + reveal lifecycle Rule 0 đầy đủ (reveal class → animationend → sau-cleanup KHÔNG còn .reveal/.reveal-in/data-reveal — kiểm 1 trang)
- code-reviewer độc lập toàn diff vs 674914b; fix P0/P1 trước merge
- story-verify sf-2 sạch (B3: comment literal `VERDICT ... APPROVED` lên FI-356)
- Merge flow an toàn: merge parent story/fi349-blog-redesign vào sf-branch → 2 ancestor guards (sf-branch chứa parent cũ + working tree sạch) → `git update-ref refs/heads/story/fi349-blog-redesign <sha>` (neu dest di chuyen do SF-3 merge: merge-nguoc dest moi vao sf-branch truoc)
- Comment merge-hash lên FI-356 + `orca worktree set --worktree name:sf-2-blog-detail --comment "SF-2 merged <hash> into dest"`
- FI-356 → Done (SAU merge)
