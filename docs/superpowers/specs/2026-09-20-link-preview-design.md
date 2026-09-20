# Spec — Link preview đầy đủ thông tin (social unfurl card)

- **Date**: 2026-09-20
- **Status**: rev 3 (spec-critic FIX-P0-FIRST applied — 2 P0 + 5 P1 + P2 mirrors; chờ plan-critic)
- **Origin**: user — "Link preview chưa hiển thị đủ thông tin"
- **Scope lock (user 2026-09-20)**: social unfurl card KHÔNG làm in-page link cards (repo links trong bài viết giữ nguyên markdown — story riêng nếu cần).
- **Hero lock (user 2026-09-20)**: commit PNG qua pipeline có sẵn (KHÔNG build-time generation).
- **Domain lock (user 2026-09-20)**: owner tự add `wakii.xyz` vào Vercel project — story giữ `SITE_URL = https://wakii.xyz` + giao runbook + check script, KHÔNG flip SITE_URL.

## IDEA-BRIEF (8 chiều)

| Chiều | Nội dung |
|---|---|
| **Task** | Sửa + hoàn thiện link preview (card khi share link wakii.xyz ra X/Facebook/Zalo/Slack/Telegram/LinkedIn): domain sống lại, og:image không còn 404, card từng post hiển thị đúng nội dung post (ảnh riêng, title, description, site name, locale) |
| **Output** | Static site wakii-site: meta contract mở rộng trong layouts, hero tile cho ~119/120 post, check script mới trong build chain, runbook domain + cache purge |
| **Users** | Chủ site share links; crawler (facebookexternalhit, Twitterbot, Slackbot, TelegramBot, Discordbot, Zalo); độc giả click card |
| **Constraints** | MUST giữ OG contract pinned FI-339 (og:image absolute, og:type article, published_time) — mở rộng ADDITIVE; MUST NOT đụng motion core / astro:assets (D5 string paths public/); VI mirror share EN hero; build chain phải xanh |
| **Input** | Repo hiện tại + pipeline `render-blog-heroes.mjs` + pattern `check-jsonld.mjs` + probe facts (mục Facts) |
| **Context** | Prod live 120 slug × 2 locale trên `wakii-site.vercel.app`; `SITE_URL = https://wakii.xyz`; FI-339/340/349 đã dựng nền OG; deploy thủ công `npx vercel deploy --prod --scope 1foxglobal` |
| **Success criteria** | (1) share link post bất kỳ → card đủ: ảnh post-specific, title, description, site name, đúng locale; (2) `wakii.xyz` trả 200 sau khi owner add domain; (3) check-og assert pass trên toàn bộ dist; (4) crawler-UA probe thấy đủ meta; (5) build chain xanh |
| **Out-of-scope** | In-page link cards cho repo links; og:video; tag pages; astro:assets migration; SEO tooling trả phí; đổi domain trong config |

## Facts đã verify (probe 2026-09-20)

1. **`https://wakii.xyz` → HTTP 404 `DEPLOYMENT_NOT_FOUND`** (server: Vercel). DNS đã trỏ Vercel nhưng domain không thuộc team nào CLI token access được (`vercel domains ls` dưới cả `1foxglobal` lẫn `vuhois-projects` = 0 domains) → mọi link share qua domain canonical để crawler fetch trang 404.
2. **og:image 404 trên cả prod đang sống**: `og:image` render absolute theo `Astro.site` = `https://wakii.xyz/og-default.png` (pinned FI-339) → URL ảnh vỡ ở mọi surface cho tới khi domain lên.
3. **25/120 EN post** khai `heroImage` (VI mirror cùng 25). 95 post còn lại rơi về `/og-default.png` chung → card giống hệt nhau, không mang thông tin post.
4. **Meta thiếu trong `Base.astro` / `BlogDetailLayout.astro`**: `og:site_name`, `og:locale` + `og:locale:alternate`, `twitter:image:alt` (BlogDetailLayout truyền `ogImage` nhưng KHÔNG bao giờ truyền `ogImageAlt` → alt ảnh card = tagline site thay vì title post), `article:author`, `article:tag`. **Page collapse về SITE_TAGLINE hôm nay: CHỈ landing EN** — `src/pages/index.astro:8` truyền tường minh `description={SITE_TAGLINE}` (landing VI, roadmap — RoadmapPage:53 truyền `c.description` per-locale, skills, download, 404, docs đều ĐÃ có description riêng; hai critic lần lượt nhầm roadmap → đã verify code trực tiếp). DocsLayout description optional là latent-only — 10/10 docs CÓ description + wire. Không có `apple-touch-icon` / `favicon.ico` (chỉ `favicon.svg`) — Zalo-style scrapers dùng những file này.
5. **Pipeline hero có sẵn**: `scripts/render-blog-heroes.mjs` — SVG template (title mono + category label + brand mint/dark, same DNA `og-default.svg`) → Chrome headless 1200×630 → `public/blog/heroes/<slug>.png` + SVG source commit cạnh. Derived set: chỉ render post có frontmatter `heroImage: "/blog/heroes/<own-slug>.png"`. `--check` đọc IHDR.
6. **PNG thật ~230KB/tile** (25 tiles = 5.8MB) → 95 tile thô ≈ 22MB repo growth. `pngquant`/`oxipng` chưa cài máy → cài `pngquant` (brew) trong SF-2, nhất quán với phụ thuộc Chrome cục bộ hiện có. Mục tiêu ≤100KB/tile → ~8-10MB.
7. **Không title nào wrap >4 dòng** (max 78 chars, mô phỏng đúng thuật toán wrap của pipeline) → guard chỉ cần assert, không cần đổi layout.
8. **Pattern assert post-build có sẵn**: `scripts/check-jsonld.mjs` (walk mọi `*.html` trong dist, assert structure, exit 1) — khuôn cho `check-og.mjs`. Build chain: `check-blog-slug-parity && check-blog-utils && check-blog-content && astro build`.
9. RSS (`src/pages/rss.xml.js`): bilingual feed, item KHÔNG có ảnh.

## Design decisions

- **D1 — Contract ADDITIVE**: mọi field mới thêm vào `Base.astro` props với default giữ nguyên hành vi cũ (pattern carve-out `ogImageAlt` của FI-349 rev 2). Không đổi ý nghĩa field cũ. `og:url`/canonical tiếp tục theo `SITE_URL`.
- **D2 — og:locale derive từ pathname** (`en-US` cho EN, `vi_VN` cho VI) + `og:locale:alternate` trang còn lại — không thêm prop mới vào từng page.
- **D3 — og:site_name = `SITE_NAME`** (‘wakii’) hardcode trong Base từ config, không prop.
- **D4 — Blog post truyền đủ**: `ogImageAlt = title` (prop ĐÃ tồn tại trong Base từ FI-349 rev 2 nhưng BlogDetailLayout chưa bao giờ truyền — dead wiring; fix thực tế 3 props: ogImageAlt + article:author + article:tag), `article:author` (author name — FB chấp nhận string dù OG spec chuộng profile URL), `article:tag` (mỗi tag 1 meta). `og:type=article` + `publishedTime` giữ nguyên. Mirror `name=` cho cặp twitter: `<meta name="twitter:image:alt">` + `<meta name="twitter:image">` song song property= og:image/og:image:alt (Twitter đọc name=, fallback property= không đảm bảo — mirror cả cặp cho nhất quán).
- **D5 — Docs + pages thường**: docs-description-fallback là HARDENING (10/10 docs có description — latent-only), KHÔNG biến thành `required` trong schema (breaking). Pages description audit theo DERIVED SET, không hand-enumerate: **việc copy mới thật = landing EN** (`index.astro:8` đang truyền SITE_TAGLINE tường minh; landing VI đã có description riêng) — còn lại sweep verify toàn page set: non-empty ∧ ≠ SITE_TAGLINE ∧ pairwise-distinct ∧ locale khớp; copy mới "có nghĩa" → owner ACK trước merge (precedent VI copy FI-300/FI-294).
- **D6 — Hero toàn bộ post**: batch thêm `heroImage: "/blog/heroes/<own-slug>.png"` vào 95 EN + 95 VI còn lại. **Ngoại lệ pin giữ nguyên**: `building-wakii-in-the-open-log-1` KHÔNG có hero — post duy nhất exercise og-default fallback (spec pin FI-349 SF-1). VI mirror path EN (convention hiện có). **Biết trước side-effect user-visible**: frontmatter mới làm `<img class="bd-hero">` xuất hiện trên trang detail của ~95 post (BlogDetailLayout render khi có heroImage) — trùng khớp pattern 25 post hero hiện có (tile cùng lúc hiện trong trang + OG card), KHÔNG tách "og-hero-without-in-page-hero" (sẽ cần manifest sinh thêm — phức tạp không cần). Flag cho owner duyệt ở STORY-READY.
- **D7 — Nén PNG (mọi tile 119, cả 25 cũ)**: render xong → `pngquant --speed 1 --quality 65-90` (cài brew trong task) → target ≤100KB/tile. **Policy exit-99** (pngquant từ chối khi không đạt quality floor): retry MỘT lần `--quality 50-90`; vẫn fail → giữ PNG gốc + WARN rõ (file + size) trong task report — KHÔNG skip âm thầm, KHÔNG abort build. Áp cho CẢ 25 tile hiện hữu (re-render deterministic từ SVG source commit cạnh) → toàn bộ 119 tile đồng nhất ≤100KB. pngquant unavailable hoàn toàn → dừng cho owner quyết (KHÔNG commit 22MB âm thầm).
- **D8 — `check-og.mjs` post-build assertion** (khuôn `check-jsonld.mjs`): mọi `dist/**/*.html` phải có og:title/og:description/og:image (absolute https trên site origin)/og:type/og:site_name/og:locale. Post pages (path-derived, khuôn `expectedTypes` check-jsonld:140 — KHÔNG hand-enumerate): twitter:image:alt chứa headline (assert CONTAINMENT — og:title thực tế là `title — wakii` fullTitle, không equality), article:published_time, og:image resolution đúng (post có heroImage → file PNG TỒN TẠI trong dist; không có → og-default absolute). **Không hardcode "duy nhất log-1"** — số post hero-less không phải build gate vĩnh viễn (editorial batch tương lai phải được phép thiếu hero mà không đỏ build); AC2 ghi 119/120 là trạng thái NGÀY STORY, không phải policy. Đăng ký `check:og` npm script + wire vào `build` chain SAU astro build. Convention: `check:jsonld` giữ nguyên vị trí manual (không wire). Mọi og thay đổi phải giữ JSON-LD image cùng origin SITE_URL (check-jsonld:89 assert absoluteSiteUrl — regression guard).
- **D9 — Domain check tách khỏi build**: `node scripts/check-og.mjs --live` probe mạng (HEAD `wakii.xyz` + og-default URL) in WARN/kết quả, KHÔNG fail build khi domain chưa lên (build phải xanh độc lập domain). Sau khi owner add domain → script là bằng chứng 200.
- **D10 — RSS item ảnh**: thêm hero URL vào mỗi item qua `customData` (`<media:content>` chuẩn RSS media) + **khai báo namespace `xmlns:media="http://search.yahoo.com/mrss/"` qua option `xmlns` của `rss()`** (không khai = malformed XML, strict readers drop element). KHÔNG đổi contract bilingual feed (không thêm `<language>`).
- **D11 — Icons**: `apple-touch-icon.png` 180×180 (Chrome headless — dependency đã có) + `favicon.ico` = node wrapper ~20 dòng bọc PNG vào header ICO (Chrome KHÔNG xuất ICO được; không thêm dependency) vào `public/` + link tags trong Base. Zalo/FB dùng cho thumbnail nhỏ.
- **D12 — Crawler probe là runbook + script local**, không thêm dịch vụ ngoài: `curl -A <crawler-UA>` qua `astro preview` + script in bảng meta từng crawler thấy. FB/Zalo cache purge ghi runbook (Sharing Debugger) — chỉ có ý nghĩa sau khi domain live.

## Acceptance (user-visible — verifier Phase 5 kiểm)

- **AC1**: Post bất kỳ (EN + VI) — dist HTML chứa đủ: og:title (chứa title post), og:description (description post), og:image (hero riêng post, absolute), og:site_name `wakii`, og:locale đúng (`en-US`/`vi_VN`) + alternate, twitter:image:alt = title post (name= mirror), article:author + article:tag.
- **AC2**: 119/120 post có tile riêng 1200×630 trong `public/blog/heroes/` (log-1 duy nhất fallback — trạng thái ngày story, không phải gate vĩnh viễn); TOÀN BỘ 119 tile (gồm 25 cũ re-render) ≤100KB/tile trừ trường hợp exit-99 policy (WARN rõ); VI + EN cùng slug dùng cùng file.
- **AC3**: Mọi page trong dist có meta description riêng: non-empty ∧ ≠ SITE_TAGLINE ∧ pairwise-distinct ∧ locale khớp (mechanical — derive page set; vi phạm thật hôm nay = landing EN); copy "có nghĩa" mới có owner ACK trước merge. Mọi page có og:site_name + og:locale.
- **AC4**: `npm run build` xanh gồm check-og assert toàn dist; `--live` in trạng thái domain (WARN khi chưa lên, PASS 200 khi lên).
- **AC5**: RSS item mỗi post có media:content trỏ hero absolute.
- **AC6**: `apple-touch-icon.png` + `favicon.ico` tồn tại + link tags trong Base; crawler-UA probe script chạy được và in meta từng crawler.
- **AC7**: Runbook domain (add wakii.xyz vào Vercel project + www redirect + FB/Zalo cache purge sau khi live) nằm trong `docs/knowledge/runbooks/` + comment hướng dẫn trên epic.

## SF split (tier-bracket)

**Rubric**: mỗi SF own outcome riêng (C1), touch map không chồng lấn file (C2), interface = OG contract pinned (C3 pinned), tests/check script là acceptance (V1-V3).

### SF-1 — OG meta contract mở rộng (tier 0)
Mọi page xuất đủ preview meta: og:site_name + og:locale/alternate (derive pathname), mirror name= twitter:image + twitter:image:alt, article:author + article:tag, ogImageAlt = title post (fix dead wiring), og:image:type; docs-description fallback hardening; description audit derived-set (vi phạm thật hôm nay = landing EN `index.astro:8`); apple-touch-icon 180 + favicon.ico (PNG qua Chrome headless + ICO wrapper node script ~20 dòng — KHÔNG thêm dep) + link tags. Tất cả edit chạm Base.astro GỘP vào 1 task + thứ tự tuần tự pin trong context pack (chống contention nhiều worker cùng file).
Tasks: base-meta-contract / blog-article-props / docs-description-fallback / pages-description-audit / icons-assets / self-verify-dist.

### SF-2 — Hero tile toàn bộ post (tier 0, song song SF-1 — khác touch map)
119/120 post có card ảnh riêng: guard wrap-title (assert không truncate — hiện slice(0,4) cắt câm), hook pngquant vào pipeline, batch frontmatter EN+VI (giữ pin log-1; pipeline DERIVED từ frontmatter nên sau batch, render + `--check` tự phủ full set), render 95 SVG+PNG, nén ≤100KB/tile + recompress 25 tile cũ + og-default.png (163KB), visual QA mẫu (title VI dấu, title dài nhất, đủ 3 category, mobile-390), listing PostCard + detail hero verify. **Edges nội bộ pin**: pngquant-hook → render-95-tiles; frontmatter-batch-en → render-95-tiles; pngquant-hook → recompress-existing-tiles (chống commit 22MB rồi viết lại).
Tasks: wrap-guard-assert / pngquant-hook / frontmatter-batch-en / frontmatter-batch-vi / render-95-tiles / recompress-existing-tiles / check-full-set / visual-qa-sample / page-render-verify.

### SF-3 — Domain runbook + QA harness + convergence (tier 1, Phase 2)
check-og.mjs assert toàn dist + wire build chain; `--live` domain probe; runbook owner (add domain + www + cache purge) vào `docs/knowledge/runbooks/` (dir mới — đăng ký KB MOC theo convention FI-409) + epic; RSS media:content (concat vào customData `<guid>` hiện có + xmlns:media); crawler-UA probe harness; sitemap-robots sanity (criteria pinned: sitemap-index parse OK + URL count khớp + robots.txt valid không đổi); convergence audit full build; release checklist Phase 2 + card mẫu cho user test.
Tasks: check-og-assert / wire-build-chain / live-domain-probe / owner-runbook / rss-media-content / crawler-probe-harness / sitemap-robots-sanity / convergence-audit / release-checklist.

**Phase** (Phased-release rule — 2 tiers): Phase 1 = tier 0 (SF-1 + SF-2) — shippable: meta đầy đủ + tile riêng, build xanh, deploy được. RELEASE CHECKPOINT. Phase 2 = tier 1 (SF-3) — harness + runbook + convergence. Mỗi phase checkpoint 1 vòng security-audit.

**Chống duplicate**: SF-1 KHÔNG viết check script (self-verify bằng build có sẵn + inspect dist thủ công); toàn bộ check/assert/harness dồn về SF-3. SF-2 không đụng layouts; SF-1 không đụng content frontmatter. Merge-to-parent là Zweck của cả 3 (không tính duplicate).

## Risks / unknowns

1. **Domain là prerequisite của card THẬT trên wakii.xyz** — mọi thay đổi code là necessary-not-sufficient cho tới khi owner add domain (dashboard Vercel, account ngoài tầm CLI). Owner action có thể chạy SONG SONG SF — không block. Xong phải chạy `--live` probe + FB Sharing Debugger 1 lần (runbook).
2. **Crawler cache**: FB/Zalo có thể phục vụ card lỗi cũ đã cache sau khi domain sống — giảm thiểu: phần lớn share cũ là fetch-fail (host 404) nên cache lỗi ngắn hạn; runbook có Sharing Debugger re-scrape; fallback cuối ?v= cache-bust trên og:image (chỉ khi cần — phá ổn định định danh ảnh).
3. **Zalo cache** khó purge programmatically — chấp nhận runbook thủ công.
4. **Repo growth ~8-10MB** (sau nén pngquant; thô là 22MB — đo thật 230KB/tile × 95) — chấp nhận được cho content site; đã có user lock commit-PNG.
5. **pngquant cài brew** — nếu không cài được → D7 dừng cho owner quyết (KHÔNG commit 22MB âm thầm).
6. **og:locale vi_VN**: Facebook chỉ nhận locale chuẩn — `vi_VN` hợp lệ; X bỏ qua og:locale (không hại).
7. **Batch frontmatter 95 file** có thể conflict với editorial đang ghi — research/ viết liên tục nhưng `src/content/blog/` là vùng batch riêng; SF-2 chạy batch 1 lượt commit riêng để conflict surface rõ.
8. **Pipeline render phụ thuộc Chrome macOS cục bộ** (hardcode path) — chấp nhận: render là dev-machine step, deploy vốn manual; `--check` IHDR vẫn chạy được mọi nơi.
9. **check-jsonld regression**: og contract đổi không được phá assert origin JSON-LD (D8 đã ghi guard).
10. **Analytics bỏ qua**: repo không có instrumentation — không có gì đo/bị vỡ (analyst verified).
11. **Perf in-page (side-effect D6)**: ~190 detail pages gained `<img class="bd-hero" loading="eager">` (~100KB sau nén) ngay dưới meta row — LCP candidate; listing featured cell chuyển band→ảnh thật (pattern 25 post hiện có). Mitigation: nén D7 + `width`/`height` đã set (CLS OK); SF-2 visual-qa-sample gồm mobile-390 sanity page-weight.
