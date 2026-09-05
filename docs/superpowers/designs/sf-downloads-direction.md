# SF-2/SF-3 design hand-off — "Bento Dispatch" (hướng b) — FI-300

USER-PICK-APPROVED 2026-09-04 (chat: "a" → **đổi sang "b"**). Source of truth visual: `/tmp/story/fi300/design/sf-dl-b.html` (tham chiếu — /tmp không sống theo repo, hand-off này là binding). Style authority: `src/styles/tokens.css` (v2 Bento Premium) — **BIND TOKEN TỪ tokens.css THẬT, KHÔNG copy token names prototype** (lesson FI-296: `--accent-dim` prototype ≠ repo → dùng token repo có sẵn).

> **AS-BUILT 2026-09-05:** section dưới cuối file ghi lại toàn bộ chỗ implement đã resolve khác hand-off (SF-2 `1b029c8` + SF-3 `41e1d8f`) — SF-4 đọc as-built TRƯỚC khi audit visual-consistency, đừng soi lại delta đã chốt.

## Design language (kế thừa /skills + /roadmap đã ship)
- Bento core: grid 12-col gap 18px; cell = `.bx` (min-width:0) → `.bx-in` (bg-card, border-strong, radius 12, hover lift -3px + mint glow, chỉ hover-capable pointers) → `.bx-label` (bar `▸ tên` + meta phải, bg #0D1310-ish) → `.bx-body` → `.bx-foot` (dashed top, mono 10.5px, warn `<b>` amber).
- Canvas: grid-bg 56px mask ellipse (như /skills).
- Buttons: mono 13px `> ` prefix; primary mint (hover translateY + glow) · ghost border · **soon dashed + pill "soon" amber** (flag=false).
- Pills: `.pill` mint mono nhỏ (dùng cho "qr pairing", "v0.1.0 · latest", "primary").
- Chapter chrome: `## ` kicker, `// ` h2.

## Surface 1 — /download (EN + /vi/download) = 1 bento 8 cells
| Cell | Span | Nội dung | Flag=false | Flag=true |
|---|---|---|---|---|
| macOS | sp7 | cell-logo ◆ + "Wakii for macOS" + meta SEQUOIA+ · size · UNSIGNED; btn download .dmg (href = `DOWNLOAD_URLS`) | btn-soon + pill-soon, KHÔNG href | btn-primary + pill "vX · latest" |
| Windows | sp5 | cell-logo ⊞ + "Wakii for Windows"; btn .exe | như trên | như trên |
| mobile connect | sp8 (jumbo) | pill "qr pairing"; mob-grid `auto 1fr`: QR frame trắng 170px + badges + caps + copy | **QR overlay trắng "QR goes live with vX"**; badges dashed "coming soon" không href | QR SVG thật (generate lúc build, encode store URL theo G-QR — KHÔNG pairing endpoint); badges = link App Store / Google Play (`MOBILE_STORE_URLS`) |
| iOS | sp4 | **soon-cell: border dashed + opacity .75 + logo dashed** | btn-soon "app store" + soon | Khi MOBILE_LIVE=true → cell thành link store hoặc gộp vào jumbo (agent quyết theo data thật) |
| build from source | sp4r | terminal mockup `$ git clone github.com/wakii/wakii` + `$ make install` + ghost "full guide: /docs/getting-started/" | như nhau (luôn khả dụng) | như nhau |
| follow releases | sp4 | copy + button watch releases → GitHub Releases | **btn-PRIMARY** (đây là primary path khi chưa có binary) | btn-ghost (secondary) |
| changelog | sp4 | ver + "what's new" | **ACCURACY GATE: khi chưa có release → KHÔNG render cell này** (hoặc state "no releases yet" — KHÔNG hiển thị version giả) | ver thật từ release |
| checksums | sp4 | terminal `$ shasum -a 256 …` | **ACCURACY GATE: chưa có asset → KHÔNG render cell** (hash giả = dead-claim) | hash thật từ release (SF-4 drill xác minh) |
- Warn unsigned (G-I) nằm trong `bx-foot` từng OS cell: macOS "first launch → System Settings › Privacy & Security › Open Anyway" / Windows "first launch → SmartScreen › More info › Run anyway".
- **Manual-first tuyệt đối: KHÔNG có tab, KHÔNG có state ẩn** — cả macOS/Windows render song song; không-JS = toàn trang vẫn đầy đủ (chỉ mất UA-highlight nếu có).

## Surface 2 — Mobile connect block
Chính là cell jumbo sp8 ở trên — **build thành component độc lập** (`src/components/download/MobileConnect.astro` hoặc tương đương, prop-driven: locale + flags + store urls) để SF-3 teaser reuse; render đúng cả 4 tổ hợp 2 flags.

## Surface 3 — Landing Get Wakii upgrade (SF-3) = mini-bento 3 cells
- **gw-a (6-col, PRIMARY)**: bx-label "download wakii.desktop" + pill "primary"; meta version/ext/unsigned; btn-primary flag-aware (flag=false → primary = "all platforms → /download", download btn-soon); bx-foot "ios + android pairing — see /download".
- **gw-b (3-col)**: "from source · dev" — copy ngắn + ghost → `/docs/getting-started/` (SECONDARY).
- **gw-c (3-col)**: "mobile · qr" — copy ngắn + ghost "get the app → /download" (teaser; không nhúng QR vào landing).
- Anchor `#get-wakii` GIỮ NGUYÊN (G-F — verify anchor thực trước khi wire).

## Behavior contracts
- **Flag logic**: 2 flags ĐỘC LẬP → 4 tổ hợp render hợp lệ, 0 dead link/claim (SF-4 drill xác minh).
- **Motion**: entrance qua motion util (`data-reveal` / `revealChildren` có sẵn) — KHÔNG viết script mới; hover lift = CSS transition.
- **Responsive**: @980 — sp7/sp5/sp8/sp4r → full width, sp4 → span 6, gw-a full, gw-b/c span 6; @720 — mọi cell full width, bento gap 12px, wrap 20px, h1 30px, mob-grid stack. Verify @390 bằng iframe probe.
- **Content binding**: MỌI string qua `src/i18n/downloads.ts` (SF-1 pre-add — KHÔNG thêm key; thiếu → flag epic FI-300). Version/size/hash placeholder chỉ render khi có data thật.

## Content notes PM-decided
- EN page dùng EN copy riêng ("Scan the QR to get the app, then connect from inside the app." / "Watch agents run · Approve gates · Send tasks"); VI ("Quét QR để tải app, kết nối từ trong app" / "Xem agents chạy · Duyệt gates · Gửi task") đi gate G-D convergence SF-4.
- Changelog/checksums cells chỉ render khi có release data thật (xem ACCURACY GATE ở bảng) — khác prototype (prototype hiển thị ở cả 2 bands cho minh họa layout).

---

## AS-BUILT 2026-09-05 — những chỗ đã resolve khác hand-off (binding mới)

Áp dụng sau SF-2 (merge `1b029c8`) + SF-3 (merge `41e1d8f`). Mọi deviation đều đã qua reviewer APPROVED + audit comment tương ứng (FI-302 e19112a6, FI-303 a2e8199a). Trong đây = thực tế đang ship; phần bảng phía trên giữ nguyên như direction đã duyệt để đối chiếu.

### Surface 1 — /download (`src/components/download/DownloadPage.astro`)
1. **6 cells, không phải 8**: changelog + checksums KHÔNG build (accuracy gate — chưa có nguồn release data; hash/version giả = dead-claim). Hàng 3 rebalance **sp6 + sp6** (build-from-source + follow-releases).
2. **Version pill không render** (không có field version trong config) — meta OS cell = **tên asset thật** từ `DOWNLOAD_URLS` (factual, ví dụ `WakiiSetup.exe`).
3. macOS/Windows meta KHÔNG có size/UNSIGNED khi flag=false — chỉ tên asset; warn unsigned (G-I) chỉ nằm trong `bx-foot` khi `DOWNLOADS_LIVE=true`.
4. iOS cell (sp4) resolve 2 chiều theo data thật: `MOBILE_LIVE && ios URL` → cell link store; thiếu một trong hai → soon-cell dashed + foot "follow updates" → Releases.
5. Labels/copy tiếng phần chrome lấy từ keys có sẵn (SF-1 store) + ít chrome literal locale-neutral: guide line build-from-source là **inline draft EN/VI** ("→ full guide: …" / "→ hướng dẫn đầy đủ: …") + "github releases →" — đã vào danh sách G-D SF-4.

### Surface 2 — MobileConnect (`src/components/download/MobileConnect.astro`)
- Component render **cell innards** (`.bx-in…`) — page sở hữu outer `.bx` + span. Props = `t: mobile slice`. QR = SVG build-time (`qrcode`), encode store URL đầu tiên có sẵn (ios || android), màu `#0A0E0D`/`#FFFFFF`.
- Badges **per-badge partial-fill**: điều kiện từng badge là `MOBILE_LIVE && <url tương ứng>` (không chung 1 flag cả cặp) — thiếu URL → dashed span không href.
- Caps G-C render từ mảng `caps` — rỗng → không render block (zero-default).

### Surface 3 — Landing Get Wakii (`src/components/landing/GetWakii.astro`, SF-3 FI-303)
1. **gw-a bx-foot** = warn G-I ×2 khi flag=true (KHÔNG phải "ios + android pairing — see /download") — pointer sang mobile nằm ở gw-c; flag=false → không foot.
2. **Teaser gw-c là markup riêng trong GetWakii.astro**, KHÔNG import MobileConnect: (a) hand-off cấm QR trên landing nhưng component flag=true render QR thật; (b) file thuộc SF-2 (boundary không sửa). Dùng keys `teaser.*` + badges cùng điều kiện per-badge → cùng trạng thái flag với /download. CTA = key `teaser.cta` ("about the mobile app").
3. **gw-a meta = tên asset**, bỏ "version/ext/unsigned" (không có nguồn version — accuracy).
4. gw-a flag=true = **2 nút thật** (macOS `btn-primary` + Windows `btn-ghost`), không phải 1 nút; flag=false = primary "all platforms → /download" (inline draft EN/VI, G-D list) + 2 `btn-soon` không href.
5. **Section head flag-split** (review P1 FI-303): khi `DOWNLOADS_LIVE` → kicker `dl.page.kicker` + h2 `dl.page.h2` (mirror trang /download: "download · get wakii"); flag=false → `getWakii.kicker/title` ("get wakii · build it from source"). Sub luôn flag-aware (`dl.page.live/notLive.sub`).
6. gw-b copy = key `getWakii.sub`, ghost = key `hero.ctaGhost`, meta "dev". gw-c meta "ios · android". Note: bold-lead chỉ khi key có separator " — " (`noteLive` không có → render plain).
7. `.bx-in` radius **14px** (nhất quán các section landing sibling), KHÔNG 12px — /download dùng `--radius-cell` 12px; unifying = việc SF-4 task 6, đừng "sửa" về một phía trước khi task đó chạy.
8. Keys còn trong store nhưng không render ở section: `getWakii.steps/reqTitle/reqItems/repoCta`, hero CTA vẫn trỏ REPO_URL (ngoài touch map SF-3). Anchor `#get-wakii` giữ nguyên (G-F) — hiện không có nav deep-link nào trỏ tới nó.

### Danh sách copy draft chờ G-D (SF-4 duyệt, EN+VI song song)
- Landing: "download wakii.desktop"/"tải wakii.desktop" · "all platforms → /download"/"mọi nền tảng → /download" · chrome EN-only "primary"/"dev"/"ios · android"
- /download: guide line "→ full guide: …"/"→ hướng dẫn đầy đủ: …" · "github releases →" (chrome)
