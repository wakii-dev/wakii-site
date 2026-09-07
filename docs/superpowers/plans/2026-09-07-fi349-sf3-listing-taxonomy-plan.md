# Plan — SF-3 Listing + category taxonomy redesign (FI-357)

Spec: docs/superpowers/specs/2026-09-07-blog-redesign-design.md (rev 3, §SF-3) + bracket
docs/superpowers/brackets/fi349-blog-redesign.md + context pack docs/superpowers/contexts/sf-3.md
Design hand-off (BINDING): docs/superpowers/designs/fi349-sf3-direction.md — B+C hybrid, user pick
2026-09-07. Visual source of truth: docs/superpowers/prototypes/fi349-sf3-hybrid.html.
Branch: wakii-dev/sf-3-blog-listing → merge (update-ref) về story/fi349-blog-redesign

Scope note: SF-3 sở hữu listing + taxonomy routes + shared components. KHÔNG đụng detail
layout/pages ([slug].astro, BlogDetailLayout — SF-2), KHÔNG wire category-link vào detail meta
(SF-4), KHÔNG đổi schema/RSS/astro.config, KHÔNG đụng scripts/*.

Quyết định đã probe (recorded):
- Design tasks (bracket #1-2) HOÀN THÀNH trước code: prototypes commit `c0c4aa7` + hand-off
  `cc9a946` trên main (merged vào sf-branch đầu session); user pick B+C hybrid → design gate THOA.
- Tokens: mọi token prototype có thật trong src/styles/tokens.css (đã diff 1:1 — kể cả
  --border-strong/--accent-soft/--text-faint/--bg-deep/--panel aliases).
- JSON-LD: Base.astro KHÔNG có head slot → inject `<script type="application/ld+json" is:inline
  set:html>` trong body page (Google chấp nhận JSON-LD ở body; KHÔNG sửa Base — không thuộc SF-3).
- LangSwitcher: đã nằm trong Nav.astro (Base render) → tự động present trên cả 2 surface; shell
  không nhân bản.
- getStaticPaths "from-enum": derive từ Object.keys(CATEGORY_LABELS.en) (SF-1 map — docstring tự
  ghi "keys mirror the blog schema enum"); KHÔNG sửa content.config (SF-1 sở hữu). Schema zod vẫn
  gate giá trị category.
- Entrance motion: revealChildren + initMotion có sẵn (28px/0.55s stagger 60ms) — KHÔNG viết
  script mới (hand-off Behavior §entrance). Hover/pulse giữ CSS thuần.
- Reading time: postReadingTime (SF-1 util, WPM EN200/VI160 ceil min1) — không hardcode.
- Hero featured: post CÓ heroImage → `<img width=1200 height=630 loading="lazy">` cùng slot;
  KHÔNG có → hero-band fallback (glyph `#1`, corner tag `<label> · <YYYY-MM-DD>`). Hero CHỈ trên
  featured cell listing; category page KHÔNG hero. Featured hiện tại = building-wakii (no hero) →
  band fallback là nhánh mặc định; nhánh img = probe tạm (revert sau verify) + code-review.
- Span category page: cặp sp6; cell CUỐI sp12 `.bx--wide` khi số lẻ (N=1: 1 wide; N=3: 6+6+wide —
  đúng prototype tech; N chẵn: toàn sp6). Nhịp đều, không featured.
- VI copy (strings.ts) do Dev draft theo pattern — USER APPROVE TẠI VERIFY GATE (G-D style).
  "N min read" → "<N> phút đọc" (giữ số, mirror EN pattern) — ghi chú trong comment verify gate.

## Tasks

- [x] 1. design-3-hướng-html: 3 prototype HTML (a-ledger / b-bento / c-journal) — commit `c0c4aa7` trên main, đã đăng artifact cho user.
- [x] 2. design-user-pick-gate: user chọn B+C hybrid 2026-09-07; hand-off chính thức `fi349-sf3-direction.md` + prototype binding `fi349-sf3-hybrid.html` — commit `cc9a946` trên main.
- [ ] 3. blog-listing-component-shared: `src/components/blog/` — `BlogShell.astro` (shell grid 280px+1fr gap 64, aside.rail sticky top 92: r-title dot mint, r-sub, nav dọc 4 item all+3 cat với count phải + active ▸ accent, r-meta "updated <date>|<N> entries · newest first" + rss feed →; responsive ≤800 rail collapse chips ngang) · `PostCard.astro` (cell `.bx/.bx-in/.bx-label/.bx-body/.bx-foot`; variants: featured sp8 hero-slot + title 26px + desc clamp-3, standard sp4/sp6, wide sp12 `.bx--wide` wmeta, empty sp12 `.bx--empty` dashed; hover CSS @media(hover:hover) translate/border/glow/title accent/▸ accent/read → translateX; reading time qua postReadingTime; hero-img variant width/height attrs) · `BlogListing.astro` (stream: listing = s-head lede+head-meta; category = crumb `~/blog / <slug>`; grid 12-col sp map listing 8+4 | 4×3; motion script revealChildren + initMotion) · `strings.ts` (mọi copy EN/VI: lede, r-sub listing + descriptor 3 category, newest-first, min-read, read, empty-state, titles "Blog|Bài viết" + "Category:|Chuyên mục: <label>", meta descriptions, JSON-LD names, crumb labels) · `categories.ts` (BLOG_CATEGORIES từ CATEGORY_LABELS keys + span-rule helper).
- [ ] 4. listing-index-en-redesign: `src/pages/blog/index.astro` rewrite — load posts EN draft:false sort desc, counts per category, Base title "Blog" + description giữ, BlogShell + BlogListing, JSON-LD Blog (CollectionPage pattern: name Wakii Blog, url absolute, blogPost array headline/datePublished/url absolute) is:inline.
- [ ] 5. listing-index-vi-redesign: `src/pages/vi/blog/index.astro` — mirror qua cùng component, strings VI (title "Bài viết", lede giữ bản hiện có), href post `/vi/blog/<slug>/`, JSON-LD Blog url `/vi/blog/`.
- [ ] 6. taxonomy-getstaticpaths-from-enum + category-route-en-x3-empty-state: `src/pages/blog/category/[category].astro` — getStaticPaths map BLOG_CATEGORIES, props posts lọc + sort desc; shell rail title=<label>. + descriptor + nav active; crumb + grid sp6 cặp + wide cuối khi lẻ; empty-state indexable (KHÔNG noindex); Base title "Category: <label>" + description = descriptor; JSON-LD BreadcrumbList Home → Blog → Category absolute is:inline.
- [ ] 7. category-route-vi-x3-empty-state: `src/pages/vi/blog/category/[category].astro` — mirror VI (title "Chuyên mục: <label>", breadcrumb Home=/vi/ "Trang chủ", empty VI).
- [ ] 8. jsonld-blog-collectionpage + jsonld-breadcrumblist (assert): dist grep cả 2 type trên 8 surface (2 listing + 6 category), URL absolute, breadcrumb chain 3 node đúng thứ tự, VI mirror đúng URL locale.
- [ ] 9. responsive-pass: @390 zero-overflow bằng same-origin iframe probe (headless Chrome ngoài, window-size clamp nên iframe trong dist preview) trên /blog/ + category + VI; rail collapse @800 + span collapse @980/640 verify DOM; screenshots pixel evidence.
- [ ] 10. Final: `pnpm build` xanh (parity + utils gate + astro, 31→37 pages) + Rule 0 3 tầng demo trọn (DOM: canonical/hreflang/JSON-LD/links; VISUAL: screenshots so prototype; FLOW: /blog/ → category chip/nav → taxonomy page → post → breadcrumb về listing) + nhánh hiếm probe tạm uncommitted (featured img variant; empty-state category 0 posts) → revert sạch + code-reviewer độc lập toàn diff, fix P0/P1 trước merge.

Meta steps (không checkbox — chạy sau task 10):

- Audit comment các phase lên FI-357 (orca linear comment add --id FI-357 --body-file -)
- story-verify sf-3 sạch (B3: comment literal `VERDICT ... APPROVED` lên FI-357)
- Merge flow an toàn: merge parent story/fi349-blog-redesign vào sf-branch (resolve conflict SF-2 nếu có) → 2 ancestor guards (sf-branch chứa parent cũ + working tree sạch) → `git update-ref refs/heads/story/fi349-blog-redesign <sha>`
- Comment merge-hash lên FI-357 + `orca worktree set --worktree name:sf-3-blog-listing --comment "SF-3 merged <hash> into dest"`
- FI-357 → Done (SAU merge)
