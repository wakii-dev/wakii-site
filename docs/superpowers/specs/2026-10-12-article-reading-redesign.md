# Spec — Article reading experience redesign (FI article-reading)

> Status: DRAFT (CREATE pipeline — phase 0 pending, spec-critic pending)
> Date: 2026-10-12
> Story type: vertical tier-bracket (SF-1 foundation → SF-2/3/4 affordances → SF-5 convergence)

## IDEA-BRIEF (8 chiều)

- **Task** — redesign bề mặt ĐỌC của article detail page (blog) để người dùng
  dễ đọc hơn (typography, measure, content affordances) và dễ theo dõi hơn
  (tiến độ đọc: scrollspy TOC + progress; và theo dõi blog: RSS/follow surface).
- **Output** — trang article EN (`/blog/[slug]`) + VI (`/vi/blog/[slug]`) với
  trải nghiệm đọc mới; prose layer dùng lại được (pattern cho docs sau).
- **Users** — người đọc blog Wakii: dev tìm hiểu agentic IDE, đọc bài dài
  (900-1400 từ, nhiều code + bảng), trên desktop + mobile.
- **Constraints** — MUST: static site (KHÔNG backend/email service), giữ pin
  og contract FI-339 rev 2 + JSON-LD, giữ EN/VI parity (check scripts), giữ
  design tokens (Modern Bento Premium v2), no-JS + reduced-motion graceful
  (motion.css contract), KHÔNG đụng motion.ts core (FI-349 boundary).
  MUST-NOT: đổi content schema, đổi listing/category pages, đổi DocsLayout.
- **Input** — không có Figma; direction = tokens hiện có (user quyết không
  mock-prototype 03/10/... 12/10).
- **Context** — 5 story blog trước (FI-339/349/359/373/383) đã dựng shell +
  126 bài content; bài dài nhiều code (114/126 có code fence, 44+ có bảng)
  nhưng bề mặt đọc chưa từng được nâng cấp kể từ FI-349 (shell docs-mirror).
- **Success criteria** (binary khi được):
  1. Bài có bảng render đúng cả desktop + 375px (hiện THIẾU table styles
     trong BlogDetailLayout — bug thật).
  2. Cột đọc đạt measure ~65-72ch, base ≥16px, line-height ≥1.7.
  3. Code block có language label + copy button (feedback ✓, no-JS ẩn).
  4. Heading h2/h3 có anchor link on-hover; TOC sticky có scrollspy;
     progress bar đọc; back-to-top.
  5. Follow surface: RSS link thấy được trên trang article (feed đã có ở
     /rss.xml + autodiscovery trong Base — nâng cấp thành affordance nhìn thấy).
  6. `npm run build` xanh (parity + utils + content + og checks), visual
     sign-off cả EN + VI, cả desktop + mobile.
- **Out-of-scope** — listing/category pages, PostCard, docs pages, RSS feed
  format, email/newsletter backend, tag pages, dark/light toggle, comment system.

## Quyết định đã chốt với user (2026-10-12)

| # | Quyết định |
|---|---|
| D1 | Scope = CHỈ article detail (EN+VI) + prose layer dùng lại được |
| D2 | "Theo dõi" = CẢ HAI: tiến độ đọc (scrollspy/progress/back-to-top) + theo dõi blog (RSS/follow, static-only) |
| D3 | KHÔNG design-first gate — implement theo tokens hiện có |
| D4 | Content-UX groups: code block UX + table styles + typography/measure + section anchors |
| D5 | Direction A (phase 0): in-place upgrade, KHÔNG tách shared prose layer (defer follow-up story); TOC nhúng sticky rail hiện có, KHÔNG đổi grid; follow = FollowBlock sau bài |

## Kiến trúc hướng giải quyết (từ source thật + phase 0)

- **Direction A (phase 0 recommendation) — in-place layered upgrade, shell
  grid KHÔNG đổi.** Blast radius: BlogDetailLayout + BlogToc + 1 client
  module + 2 thin routes; 240 trang article re-render; KHÔNG có regression
  surface ngoài blog. Shared prose extraction (Direction B) DEFER thành
  follow-up story — không trộn refactor site-wide vào reading-UX story.
- `BlogDetailLayout.astro` (637 dòng) owns toàn bộ shell — prose styles đang
  copy từ DocsLayout (đã drift: table styles có ở docs, thiếu ở blog).
  SF-1 sửa prose styles IN-PLACE trong BlogDetailLayout (owner mới của các
  style này; DocsLayout KHÔNG đụng). SF 2/3/4 làm việc trong COMPONENT RIÊNG
  của mình, layout chỉ nhận import + placement → tránh conflict song song.
- Code block: Astro default markdown (shiki, không markdown config) —
  **phải build 1 lần verify `data-language` attr trên `<pre>` trước khi
  chọn label CSS-only** (`pre[data-language]::before`); fallback = decode
  từ `code.language-*` class. Copy button = enhancement script (no-JS ẩn).
- **Client JS modules — MỖI SF MỘT MODULE RIÊNG (P0-2):** SF-2 →
  `code-enhancements` (copy button + anchor decoration, colocated với
  component/layout của SF-2); SF-3 → `reading-nav` (scrollspy + progress +
  back-to-top + collapse toggle). Cấm 2 SF viết chung 1 file — hết conflict
  song song by construction. Tổng JS thêm ≤120 dòng (P1-9).
- TOC: hiện inline đầu bài (BlogToc.astro, h2-only) — **cả 120 bài/locale
  đều ≥3 h2 (phase 0 đo) nên upgrade áp dụng 100% article**.
  **Dual-render architecture (P0-1, PINNED):** BlogToc.astro (SF-3 owns
  rewrite) render 2 variant — (a) RAIL variant: nav trong sticky rail hiện
  có (`bd-sidebar`, phía trên recent-posts; aside nằm ngoài `.prose` nên
  hết xung đột reveal×sticky), `display:none` ≤800px; (b) MOBILE BOX
  variant: details/summary (default COLLAPSED) ở đầu `.prose` — giữ đúng
  chỗ hiện tại, `display:none` >800px; breakpoint = 800px hiện có; render
  2 lần + CSS toggle (CSS không thể reposition child của `.prose` sang
  aside — grid siblings). 2 variant dùng chung label UI record nhưng
  aria-label KHÁC NHAU mỗi landmark (không duplicate landmark cùng tên).
  GIỮ gate ≥3 h2 trong code (240 bài hiện pass; gate cho bài tương lai).
  Scrollspy = IntersectionObserver, `aria-current`; progress bar fixed-top
  transform-only (aria-hidden, decorative, offset dưới site-nav 58px);
  back-to-top floating (no-JS ẩn).
- **Heading anchors — JS-injected enhancement (P0-3, PINNED):** `<Content />`
  opaque + markdown pipeline change bị cấm → anchor links là runtime DOM
  decoration (cùng pattern copy button, nằm trong module SF-2). No-JS
  degradation = heading trơn, TOC/pager vẫn điều hướng được — ACCEPTED.
- **Measure scope (P1-4, PINNED):** reading measure áp dụng CHO `.prose`
  thôi; h1/meta/hero/related/pager giữ full article-column width (hero
  1200×630 không co) — chấp nhận right-edge mismatch như editorial convention.
- **Slug↔id contract (P1-6):** `headings[].slug` ↔ DOM id đảm bảo bởi cùng
  1 markdown pipeline (BlogToc hiện đã link trên VI pages) — SF-3 KHÔNG phụ
  thuộc SF-2; probe VI của SF-2 chỉ verify id sanity (dấu → slug sạch).
- RSS: feed + autodiscovery ĐÃ có (rss.xml.js + Base.astro:113) → SF-4 chỉ
  thêm FollowBlock sau bài (giữa related và after-CTA — điểm kết-thúc-đọc,
  chuyển đổi follow) + strings MỚI trong UI record en+vi (KHÔNG tái dùng
  chuỗi rail `rssFeed` — ngữ cảnh khác; giọng điệu tham khảo strings.ts).

## SF breakdown (tier-bracket)

### SF-1 — Prose foundation: typography + measure + tables (Tier 0)
Behavior đầu-cuối: mở bất kỳ bài nào (EN/VI) — cột đọc hẹp vừa mắt, chữ to
dễ đọc hơn, BẢNG render đẹp cả desktop lẫn mobile (không tràn màn hình),
blockquote/callout + ảnh trong prose đồng bộ tokens.
Tasks (~10): reading measure — áp dụng CHO `.prose` (max-width ~68ch;
h1/meta/hero/related/pager giữ full width — P1-4) · typography scale
(base 15→16px, line-height 1.75, heading scale h2/h3, spacing rhythm;
**weights ⊆ {400, 500} — Inter chỉ load 2 weight này; set explicit heading
weights CHẤM DỨT faux-bold hiện tại (`.prose h2` không font-weight →
browser default 700); đụng Base font URL = out-of-scope, KHÔNG flag
mid-run** — P1-8) · port table/th/td styles từ DocsLayout vào prose layer
blog (in-place — DocsLayout READ-ONLY) · table mobile overflow CSS-only
(`table { display:block; overflow-x:auto }` — KHÔNG cần wrapper element,
~70 bài/locale có bảng) · blockquote/callout treatment (accent border +
tint) · inline code + pre tuning (size/contrast) · image treatment trong
prose (radius/border) · EN/VI parity (dấu tiếng Việt, line-height) ·
regression check JSON-LD/og (không đụng Base) · verify + merge.

### SF-2 — Code block UX + heading anchors (Tier 1, dep SF-1)
Behavior đầu-cuối: code block hiện ngôn ngữ + nút copy (bấm → ✓ feedback);
di chuột lên heading h2/h3 thấy link anchor, bấm copy URL section.
Tasks (~10): PROBE build 1 lần — verify `data-language` trên `<pre>` shiki
output (chọn label CSS-only hay decode từ class) · language label · copy
button + enhancement script (module RIÊNG của SF-2 — P0-2) · copy feedback ✓
(aria-live/text swap) · no-JS ẩn nút · keyboard a11y + i18n aria labels
(dict en/vi trong module SF-2, locale qua `<html lang>` — KHÔNG đụng UI
record) · heading anchor link h2/h3 — JS-injected DOM decoration
(P0-3: focusable anchor KHÔNG hover-only; no-JS = heading trơn, accepted) ·
anchor a11y + i18n · PROBE VI heading id sanity (dấu → slug sạch; slug↔id
đã đảm bảo bởi pipeline — P1-6) · verify + merge.

### SF-3 — Reading navigation: TOC scrollspy + progress (Tier 1, dep SF-1)
Behavior đầu-cuối: đọc bài dài, mục đang đọc tự highlight trong TOC sticky
rail (rail hiện có, không đổi grid); thanh tiến độ mỏng trên đầu trang;
nút về-đầu; mobile giữ TOC collapse ở đầu bài.
Tasks (~12, dual-render tách 3 task theo P1 plan-critic): **(3a) rewrite
BlogToc.astro** — variant prop (rail/box), gate ≥3 h2 giữ trong code,
landmark aria-label phân biệt, labels en+vi trong component (KHÔNG đụng UI
record — P0 strings rule) · **(3b) placement + CSS toggle** — rail instance
trong aside (phía trên recent-posts) + box instance đầu `.prose`; rail
`display:none` ≤800px, box `display:none` >800px; **rail container
max-height calc(100vh - 96px - margin) + overflow-y:auto — bài 10+ h2
không che recent-posts/lang switcher; verify short-viewport 375×~700**
(P1-5) · **(3c) collapse behavior** — details/summary box, default
collapsed · scrollspy IntersectionObserver + aria-current · progress bar
fixed-top (transform-only, aria-hidden, offset 58px site-nav) · back-to-top
floating (no-JS ẩn) · mobile TOC không bị revealChildren tag — **edit
call-site selector trong layout `<script>` block
(`revealChildren(article, '.prose > *:not(...)')` — dòng này THUỘC REGION
SF-3, motion.ts vẫn locked** — P1 plan-critic) · no-JS static fallback
(TOC anchor links hoạt động sẵn) · pager polish (category + date trên
pager links — trace: user chọn "Tiến độ đọc" có "pager cải tiến"; giữ
pager semantics prev=cũ/next=mới) · verify + merge (gate: behavior
đầu-cuối + `npm run build` xanh trong worktree SF).

### SF-4 — Follow surface: RSS + subscription affordances (Tier 1, dep SF-1)
Behavior đầu-cuối: cuối mỗi bài có khối follow rõ ràng — link RSS feed +
copy feed URL (static, không backend); EN + VI đúng copy.
Tasks (~8): FollowBlock component (giữa related và after-CTA) · copy feed
URL button (clipboard, no-JS fallback = link thấy sẵn) · i18n strings MỚI
(trong FollowBlock.astro en+vi — KHÔNG đụng UI record) · style theo tokens · a11y
(aria-label copy feedback) · og/JSON-LD unaffected check (không đụng
Base) · verify + merge.

### SF-5 — Convergence QA + release checkpoint (Tier 2, dep SF-2+SF-3+SF-4)
Behavior đầu-cuối: toàn bộ trải nghiệm đọc hoạt động LIỀN MẠCH trên cả
EN + VI, desktop + 375px, keyboard-only + reduced-motion; build checks xanh.
Tasks (~10): cross-SF walkthrough cả 2 locale (browser flow thật — Rule 0) ·
mobile 375px sweep (kèm short-viewport rail overflow check P1-5) · a11y
audit (keyboard-only, reduced-motion, SR labels) · perf check BINARY (P1-9:
tổng client JS thêm ≤120 dòng đếm được QUA CẢ 2 module; CLS ≤ 0.02
before/after trên 1 bài dài) · build checks (parity/utils/content/og) ·
**`npm run check:jsonld` chạy RÕ RIỆT (không nằm trong build chain — P1
plan-critic) + sitemap verify thủ công (dist `sitemap-*.xml` có blog URLs)**
· **coexistence check post-merge: 3 client module load cùng lúc, không
duplicate landmark (aria-label vẫn phân biệt), JS ≤120 dòng cross-module**
· **region-integrity diff (story branch vs từng SF branch — xác nhận rule
additive-only của SF-1 giữ nguyên vẹn)** · security-audit checkpoint ·
release checkpoint (phase-gate; visual sign-off = coordinator visual
review checklist trên cả EN+VI desktop+mobile — SC6 binary hóa).

## Phased release

- **Phase 1** = SF-1 (tier 0) — shippable độc lập (typography + tables fix).
- **Phase 2** = SF-2 + SF-3 + SF-4 (tier 1).
- **Phase 3** = SF-5 convergence → release checkpoint cuối story.

## Boundary chung (mọi SF)

- KHÔNG đổi: content schema (content.config.ts), motion.ts core (8 consumers
  site-wide — FI-349 boundary), DocsLayout + docs pages (prose extraction
  defer sang story sau), listing/category pages, Base.astro head (og pin
  FI-339 rev 2 + JSON-LD structure + `<`-escape), i18n routing lock,
  content/markdown pipeline (không markdown config change).
- Prose styles trong BlogDetailLayout: SF-1 là OWNER tới khi merge; SAU
  merge, tier-1 SF được chỉnh ADDITIVE trong các style region của layout
  (thêm rule mới) nhưng KHÔNG BAO GIỜ sửa/xóa declaration của SF-1 —
  nghi ngờ cần đổi declaration của SF-1 → flag coordinator (P1-7). Tier-1
  styles nên sống trong component `:global` block của SF đó khi được.
- Layout edits của tier-1 SF giới hạn ở region RIÊNG tên mình (P0-2):
  SF-2 = script import + style label/copy trong prose pre region (additive);
  SF-3 = aside (TOC rail) + mobile box đầu .prose + fixed chrome
  (progress/back-to-top) + pager region; SF-4 = FollowBlock placement giữa
  related và after-CTA. Merge thứ tự tier trong DAG xử lý phần còn lại.
- Client JS: mỗi SF một module riêng (code-enhancements vs reading-nav) —
  cấm chung file (P0-2).
- Mọi enhancement JS phải: no-JS graceful (ẩn/tĩnh), reduced-motion an toàn
  (early-return pattern như initMotion), transform/opacity only cho
  scroll-linked effects, scroll-behavior theo global.css kill-switch.
- **UI strings mới (P0 plan-critic): LUÔN cả en + vi, nhưng trong FILE CỦA
  SF ĐÓ — KHÔNG thêm key vào UI record của layout.** SF-2: dict en/vi trong
  `code-enhancements` (locale qua `document.documentElement.lang` —
  Base.astro:77 render `<html lang>`); SF-3: labels trong BlogToc.astro
  (prop/locale); SF-4: strings trong FollowBlock.astro. Layout UI record
  thêm 0 key mới → 0 conflict on record.
- **Merge order tier-1 (P0 plan-critic, PINNED):** SF-2 → SF-3 → SF-4 merge
  về nhánh đích THEO THỨ TỰ NÀY (code vẫn chạy song song; merge tuần tự).
  Cùng áp dụng cho mọi append-point (script block, style block).
- **Worktree base point:** tier-1 worktrees được tạo từ nhánh đích
  `story-fi63-article-reading` CHỈ SAU khi SF-1 merged vào nhánh đích —
  nếu không, rule "additive-only, không sửa declaration SF-1" không kiểm
  chứng được lúc merge (P1 plan-critic).

## Rủi ro + verify-first (từ phase 0)

1. **Shiki `data-language`** chưa verify (chưa có dist build) → SF-2 probe
   build trước, fallback decode từ `code.language-*` class.
2. **Reveal × sticky TOC** — giải bằng placement (TOC trong aside hiện có,
   ngoài `.prose`); mobile TOC box trong .prose phải exclude khỏi
   revealChildren hoặc verify animationend cleanup không phá sticky.
3. **VI heading ids với dấu** — BlogToc comment chỉ verify EN; SF-2 probe
   VI slug (diacritics → slug) trước khi làm anchor links.
4. **Wide tables mobile** — không có overflow-x wrapper cho table hiện tại
   → SF-1 bắt buộc, test 375px trên bảng rộng nhất.
5. **check-og / check-jsonld** — chỉ nhạy nếu đụng Base.astro; mọi SF cấm
   đụng Base (SF-4 follow block nằm trong layout body, không phải head).
6. **Inter chỉ load weight 400/500** (Base.astro:120-123) — typography scale
   dùng weights ⊆ {400, 500}; set explicit heading weights chấm dứt faux-bold
   hiện tại; đụng Base font URL = out-of-scope (P1-8 — KHÔNG flag mid-run).
7. **Pager semantics** — prev = cũ hơn / next = mới hơn phải giữ nguyên mọi restyle.

## Ghi chú P2 (audit log)

- Blast radius: 2 thin routes (blog/[slug].astro, vi/blog/[slug].astro)
  pass-through — KHÔNG SF nào cần đụng; không nằm trong touch map.
- Đếm bài lệch snapshot: "114/126 có code" đếm EN dir lúc CREATE; phase 0
  đo "120 bài/locale, ~114 code, ~70 bảng" — dùng số phase 0 làm chuẩn.
- SC6 "visual sign-off" = coordinator visual review checklist (SF-5) +
  NGƯỜI review tại PR — không có auto-binary.

## Success criteria bổ sung (phase 0 đo được)

- TOC upgrade áp dụng 100% article (cả 120 bài/locale ≥3 h2) — không gate
  "bài dài" nào cần.
- Blast radius đích: ~4-6 files; 2 importers của layout; motion.ts khóa 8
  consumers; KHÔNG có docs page trong regression set.
