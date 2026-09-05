# SF-2/SF-3 design hand-off — "Bento Dispatch" (hướng b) — FI-300

USER-PICK-APPROVED 2026-09-04 (chat: "a" → **đổi sang "b"**). Source of truth visual: `/tmp/story/fi300/design/sf-dl-b.html` (tham chiếu — /tmp không sống theo repo, hand-off này là binding). Style authority: `src/styles/tokens.css` (v2 Bento Premium) — **BIND TOKEN TỪ tokens.css THẬT, KHÔNG copy token names prototype** (lesson FI-296: `--accent-dim` prototype ≠ repo → dùng token repo có sẵn).

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
