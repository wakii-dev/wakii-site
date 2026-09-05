# Plan — FI-302 SF-2: /download page + MobileConnect component

Story: FI-300 · Linear: FI-302 · Worktree: sf-2-download (base `story/fi300-downloads-mobile`)
Binding docs: context pack `docs/superpowers/contexts/fi300-sf-2.md` · design hand-off `docs/superpowers/designs/sf-downloads-direction.md` (Bento Dispatch, USER-PICK-APPROVED v2) · spec `docs/superpowers/specs/2026-09-04-site-downloads-mobile.md` (G-A..G-I)
plan-critic: FIX-P0-FIRST round 1 → fixes applied (v2). Execution = serial single-worker inline (các task đụng cùng file routes → pattern FI-294 SF-2); plan checkboxes = task DAG memory.

## Hard constraints (from context pack boundary + hand-off)
- KHÔNG thêm key vào `src/i18n/downloads.ts` (SF-1 sở hữu — thiếu key → FLAG epic FI-300).
- KHÔNG sửa GetWakii/Landing (SF-3). KHÔNG flip flags thật (trong commit; mock flip test-only + revert). KHÔNG QR pairing endpoint.
- Token bind từ `src/styles/tokens.css` THẬT (lesson FI-296: không copy token names prototype).
- Motion chỉ qua `src/components/motion.ts` (`data-reveal` + `initMotion()`), không viết animation mới.
- Accuracy gates: changelog/checksums cells KHÔNG render (không có release data source); version pill KHÔNG render (không có version field); mọi URL từ `REPO_URL`/`DOWNLOAD_URLS`/`MOBILE_STORE_URLS` constants.

## Deviations từ prototype/hand-off (tự quyết hợp lý + plan-critic sanctioned, ghi trong audit)
1. Bento 6 cells thay 8: changelog + checksums bỏ (accuracy gate — chưa có release data). Row 3 = span 6+6 thay vì sp4r+sp4 (tránh lỗ 4-col giữa grid).
2. QR overlay flag=false dùng `mobile.notLive.comingSoon` (prototype "QR goes live với vX" = fake version → dead claim cấm).
3. pill-soon "soon" + OS-head meta (SEQUOIA+/size/UNSIGNED) + iOS btn "app store": không có key → KHÔNG render, flag epic.
4. iOS soon-cell = bx-label `badgeIos` + dashed styling + `comingSoon` + `followUpdates` link (không button giả).
5. Hero h1 = `page.h2` ("get wakii") — prototype h1 không có key.
6. "full guide: /docs/getting-started/" link label hardcode per-locale (pattern skills.astro term-link).
7. @980: iOS sp4 → FULL (không span 6) — span 6 sẽ chừa 6-col lỗ vì các cell sp4 kế bên (changelog/checksums) đã bỏ. Còn lại theo hand-off: sp7/sp5/sp8 → full.
8. QR encode = store URL đầu tiên non-empty (ios ưu tiên); cả 2 URL → vẫn 1 QR (Android scanner cũng vào App Store — URL thật, caption "get the app" trung thực). Flag epic: quyết định cuối khi có URL thật.
9. Component prop contract: hand-off pin "locale + flags + store urls" — implement: prop `t` (strings) + flags/URLs import config nội bộ (single source; SF-3 reuse tự đồng bộ flag). Ghi audit.
10. EN/VI route dùng shared renderer `DownloadPage.astro` (pattern RoadmapPage.astro story FI-294) — chống CSS drift 2 locale.

## Tasks

- [x] 1. **MobileConnect component** — `src/components/download/MobileConnect.astro`, prop-driven (`t: DownloadStrings['mobile']`); flags + URLs import từ config. Jumbo cell sp8: pill "qr pairing" (design chrome), mob-grid `auto 1fr`: QR frame trắng 170px + badges + caps (G-C đúng 3, từ `caps` array) + copy. Guards per-variant: QR chỉ render khi `MOBILE_LIVE` && store URL non-empty (build-time SVG qua `qrcode` npm dep — dependency (không -D: astro cũng là prod dep, Vercel build nhất quán); import frontmatter-only, guard nhánh); từng badge: href khi URL non-empty, else dashed soon-badge không href (partial-fill an toàn). `followUpdates` link → `${REPO_URL}/releases` (pinned). Flag=false: QR frame + overlay `comingSoon`, badges dashed, followUpdates link. 4 tổ hợp render hợp lệ. Terminal cell anatomy khớp bento core (.bx/.bx-in/.bx-label/.bx-body/.bx-foot) bind tokens thật.
  Exit criteria: component import độc lập chỉ cần props (Acceptance 7); render đủ 4 tổ hợp khi nhúng trang.
- [x] 2. **Shared renderer + Route EN** — `src/components/download/DownloadPage.astro` (full bento, prop `t: DownloadStrings`) + `src/pages/download.astro` (wrapper mỏng). Base(title=`page.title`, desc=flag-conditional `page.description`); hero kicker `page.kicker` + h1 `page.h2` + sub flag-conditional; bento 12-col: macOS sp7 + Windows sp5 (cell-logo ◆/⊞; flag=false→btn-soon dashed KHÔNG href, label `btnMacos/btnWindows` — conscious cross-variant, flag epic; flag=true→btn-primary href `DOWNLOAD_URLS` + bx-foot warn G-I), MobileConnect sp8, iOS sp4 soon-cell (deviation 4), build-from-source span 6 (terminal mockup `$ git clone ${REPO_URL}` + `$ make install`, ghost → `/docs/getting-started/`, copy `sourceAlt`), follow-releases span 6 (copy `desktop.notLive.note`, btn: false→PRIMARY `followReleases` → `${REPO_URL}/releases`; true→ghost).
  Exit criteria: build xanh, route serve, title/desc/sub flag-conditional thấy trong dist HTML.
- [x] 3. **Route VI** — `src/pages/vi/download.astro`: wrapper mỏng cùng renderer, `vi` keys, link `/vi/docs/getting-started/`, Base SEO auto (pathname).
  Exit criteria: như task 2 cho /vi/download.
- [x] 4. **Manual-first / no-JS audit** — hand-off override "KHÔNG tab, KHÔNG state ẩn" (thay bracket task platform-manual-tabs; override này FLAG epic trong audit): cả 2 OS render song song; content + links static HTML (không phụ thuộc JS); DOM grep xác nhận 0 hidden state, 0 JS-only control.
- [x] 5. **SEO verify** — build → dist: cả 2 route canonical self-referencing + hreflang en/vi/x-default đối chiếu nhau (Base auto, verify output thật); title/description flag-conditional đúng; grep dist HTML trực tiếp (gotcha inlineStylesheets).
- [x] 6. **Motion wiring** — `data-reveal` trên hero + từng outer .bx; `<script> initMotion()</script>` duy nhất; không CSS animation mới ngoài hover transition (CSS thuần, gated `@media (hover:hover)`); reduced-motion: util exit + global kill-switch (không .anim → opacity 1).
- [x] 7. **Responsive pass** — @980: sp7/sp5/sp8 → full, iOS → full (deviation 7); @720: mọi cell full, gap 12px, wrap 20px, h1 30px, mob-grid stack (khớp hand-off). Verify iframe probe w=375 VÀ w=390 (gotcha clamp) + @768. (iframe probe PASS: scrollWidth==viewport, 0 overflow element @375/390/768 × 2 locale.)
- [x] 8. **Flag-matrix browser verify + Lighthouse** — mock flip 2 flags (4 tổ hợp; tổ hợp M=true điền THÊM MOBILE_STORE_URLS test URLs — test-only, REVERT sau, KHÔNG commit): cache-bust `?v=N` sau mỗi rebuild; mọi tổ hợp 0 dead link + 0 dead claim; flag=false: KHÔNG QR scan được, KHÔNG store link, KHÔNG download button; flag=true: buttons href đúng DOWNLOAD_URLS, warn G-I EN+VI, badges → store URLs, QR render. Lighthouse /download + /vi/download ≥95. (4/4 tổ hợp DOM-verify cả EN+VI sau 2 fix: iOS cell flag-aware + badge guard `MOBILE_LIVE &&`. Config REVERT xong. Lighthouse: a11y 90 = đúng baseline landing (contrast systemic site-wide 110 items — flag epic); perf 88 = đúng baseline landing cùng điều kiện (Google Fonts render-blocking site-wide, FCP 2.9s trên CẢ landing + download); heading-order P1 SF-2 ĐÃ FIX h3→h2. Gap ≥95 thuộc epic, không phải penalty SF-2 — control-run landing cùng lúc = 88.)

## Verification (Phase 5) — ACCEPTANCE context pack, từng dòng
1. `/download` + `/vi/download` render, hreflang/canonical đối chiếu
2. Flag=false: build-from-source + follow releases, 0 dead nút/QR/store link
3. Mock flip DOWNLOADS_LIVE: nút .dmg/.exe đúng DOWNLOAD_URLS + warn G-I EN+VI
4. Mock flip MOBILE_LIVE (+ test store URLs): badges → store links, QR render, caption đúng mức claim G-QR
5. No-JS: content + nút đầy đủ
6. Reduced-motion: tôn trọng (qua util)
7. MobileConnect import độc lập (prop interface rõ — SF-3 reuse)
8. Build xanh + Lighthouse ≥95 cả 2 route

## Post-execute checklist (numbered — meta-steps, không checkbox)
1. code-reviewer độc lập trên diff SF → verdict literal → post FI-302
2. merge no-ff vào `story/fi300-downloads-mobile` + audit comment (batch-audit: 1 comment cuối run, gồm epic flags)
3. `~/.claude/bin/story-verify sf-2` sạch
4. FI-302 → Done (SAU merge)
