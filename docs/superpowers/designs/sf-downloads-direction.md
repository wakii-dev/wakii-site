# SF-2/SF-3 design hand-off — "Platform Detective" (hướng a) — FI-300

USER-PICK-APPROVED 2026-09-04 (chat: "a"). Source of truth visual: `/tmp/story/fi300/design/sf-dl-a.html` (copy tham chiếu; file /tmp không sống theo repo — hand-off này là binding). Style authority: `src/styles/tokens.css` (v2 Bento Premium) — **BIND TOKEN TỪ tokens.css THẬT, KHÔNG copy token names prototype** (prototype `--accent-dim` ≠ tokens.css — lesson FI-296: dùng đúng tên token repo, thiếu thì dùng giá trị gần nhất + note).

## Design language (kế thừa site)
- Tokens: mint accent #45E0A8, near-black bg #0A0E0D, JetBrains Mono (headings/labels/buttons) + Inter (body), cell radius 12px, btn radius 6px.
- Chrome pattern site: `## ` kicker, `// ` h2 prefix, `▸ ` panel-bar label, mono meta nhỏ.
- Buttons: `.btn` mono 13.5px, `> ` prefix; primary = mint bg + hover translateY(-1px) + glow; ghost = border; **soon = dashed border + pill "soon" amber** (flag=false).
- Warn note: amber-soft box, `⚠` prefix — bắt buộc cạnh mọi download button (unsigned).

## Surface 1 — /download (EN + /vi/download)
1. **Hero**: kicker `download` + h1 mono ("Get Wakii on your machine.") + sub trung thực unsigned.
2. **Detect card** (centerpiece): card lớn border-strong radius 12, bar đầu "▸ your platform" + meta "detected via UA · no JS? manual tabs below"; scan-line animation 2.4s (animate CHỈ dòng 2px này; respects prefers-reduced-motion qua motion util/global); body 2 cột: trái = OS logo + tên + meta asset (tên file từ DOWNLOAD_URLS asset names · size nếu có · "unsigned"); phải = primary button (flag=true) hoặc btn-soon (flag=false) + alt-links "not this? macOS (Intel) · Windows · build from source" (anchor tới tabs).
   - UA detect = progressive enhancement inline script nhỏ (navigator.userAgent → chọn tab/card active); KHÔNG JS = cả 2 panel tabs render sẵn (manual-first).
3. **Manual tabs**: tab bar macOS | Windows (mono, `.on` = accent-soft); tabpanel 2 card song song server-rendered — mỗi card: OS + ext, ver line (flag=true: "latest · <tháng>"; flag=false: "not yet released"), primary download button (href từ `DOWNLOAD_URLS`, flag=false → btn-soon KHÔNG href), ghost "follow releases" (chỉ flag=true; flag=false panel releases riêng là primary path), warn note G-I (macOS: Privacy & Security → Open Anyway; Windows: SmartScreen → More info › Run anyway — EN+VI từ downloads.ts).
4. **Two-col panels**: "▸ follow releases" (GitHub Releases link — luôn có, là primary CTA khi flag=false) + "▸ build from source" (terminal mockup `$ git clone … && make install` + link `/docs/getting-started/` — secondary).

## Surface 2 — Mobile connect block (component, SF-3 teaser reuse)
Grid 2 cột (380px | 1fr):
- **QR cell**: khung QR trắng 196px; **flag=false → overlay trắng phủ "QR goes live with v0.1.0"** (KHÔNG render QR giả scan được); caption mono nhỏ. Production QR = SVG thật generate lúc build khi MOBILE_LIVE=true, encode store URL theo platform (G-QR — KHÔNG pairing endpoint).
- **Info col**: h2 "Wakii in your pocket"; copy chính (EN page: "Scan the QR to get the app, then connect from inside the app." / VI: "Quét QR để tải app, kết nối từ trong app." — **EN/VI phân tách, VI đi gate G-D convergence**); badges iOS/Android: flag=true → link App Store / Google Play (MOBILE_STORE_URLS), flag=false → dashed "coming soon" không href; caps list ✓ 3 dòng đúng G-C: "Watch agents run / Xem agents chạy" · "Approve gates / Duyệt gates" · "Send tasks / Gửi task".

## Surface 3 — Landing Get Wakii upgrade (SF-3)
Grid 1.4fr 1fr 1fr:
- **Main cell** (download PRIMARY): glow radial mint góc; h3 "download wakii.desktop"; meta version/ext; os-chips row (macOS arm64/x64, Windows x64); primary CTA flag-aware (flag=false → "follow releases" primary + btn-soon download); **teaser mono mint**: "or pair your phone — scan & connect → /download".
- **Side 1** build-from-source (SECONDARY, ghost): label `» build from source`, copy ngắn, ghost button → `/docs/getting-started/`.
- **Side 2** stay-in-the-loop: ghost → GitHub Releases.
Anchor `#get-wakii` GIỮ NGUYÊN (G-F — verify anchor thực trước khi wire).

## Behavior contracts
- **Flag logic**: mọi điều kiện đọc 2 flags ĐỘC LẬP (DOWNLOADS_LIVE, MOBILE_LIVE) từ config — 4 tổ hợp phải render hợp lệ; KHÔNG dead link/claim ở bất kỳ tổ hợp nào.
- **Motion**: entrance qua motion util có sẵn (`data-reveal` / `revealChildren`) — KHÔNG viết animation script riêng; scan-line = CSS animation duy nhất, tôn trọng prefers-reduced-motion.
- **No-JS**: tabs + detect chỉ là enhancement; toàn bộ content + nút nhìn được không JS (tabpanel server-rendered song song).
- **Responsive**: 720px breakpoint — dc-body/tabpanel/two-col/mobile grid/gw-grid stack 1 cột; wrap 20px; h1 clamp xuống 30px. Verify @390 bằng iframe probe.
- **Content binding**: MỌI string qua `src/i18n/downloads.ts` (SF-1 đã pre-add full set — SF-2/3 KHÔNG thêm key; thiếu → flag epic FI-300). Version/size là placeholder, bind config khi flag=true.

## Content note đã PM-decide
EN page dùng EN copy riêng (không dùng VI strings làm canonical EN — designer flag); VI copy mới toàn bộ đi gate G-D ở SF-4.
