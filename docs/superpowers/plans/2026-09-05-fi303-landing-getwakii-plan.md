# Plan — FI-303 / SF-3 Landing Get Wakii upgrade + mobile teaser

Binding: hand-off `docs/superpowers/designs/sf-downloads-direction.md` (Bento Dispatch,
Surface 3 = mini-bento 3 cells) · context pack `docs/superpowers/contexts/fi300-sf-3.md`
· spec gates G-A/G-F/G-H/G-I/G-C · bracket `fi300-downloads-mobile.md` SF-3 (9 tasks).

Constraints: KHÔNG sửa key files (`landing.ts` / `downloads.ts` — SF-1 sở hữu), KHÔNG sửa
`MobileConnect.astro` + /download routes (SF-2 sở hữu), KHÔNG viết component file mới
(teaser = markup trong GetWakii.astro), flags đọc trực tiếp từ `src/config.ts`, không flip
flag thật (mock-flip rồi REVERT). Micro-copy hand-off không có key sẵn → inline
locale-conditional trong component (pattern `guideLabel` của SF-2) = DRAFT, flag G-D cho
SF-4 copy gate trong audit comment.

## Task mapping (bracket 9 tasks → commits)

| Bracket task | Commit |
|---|---|
| get-wakii-restructure + wire-keys-SF-1 + download-cta-flag-aware (G-A) + mobile-teaser-placement + entrance-wire-only + responsive-pass (markup) | T1 |
| nav-cta-repoint-theo-flag (G-H) | T2 |
| anchor-sync-verify-thực (G-F) + locale-switch-pass + responsive-pass (bằng chứng) | T3 (verify, fix nếu cần) |

## T1 — GetWakii restructure: mini-bento gw-a/gw-b/gw-c

- [x] Section head giữ `id="get-wakii"` (G-F); kicker/title = `getWakii.kicker/title`;
      sub = flag-aware `downloads.page.live.sub` / `notLive.sub` (key sẵn, chính xác cả 2 flag)
- [x] gw-a (span 6, PRIMARY): label draft "download wakii.desktop"/VI; pill "primary";
      meta asset names (factual, từ `DOWNLOAD_URLS` — pattern SF-2, không version);
      flag=true → btn-primary `DOWNLOAD_URLS.macos` (`desktop.live.btnMacos`) +
      btn-ghost `.windows` (`btnWindows`); flag=false → btn-primary → `/download`
      (draft "all platforms → /download"/VI) + 2 btn-soon dashed không href
      (`btnMacos`/`btnWindows` text) — KHÔNG nút download chết
- [x] gw-a bx-foot: flag=true → warn `desktop.live.warnMacos` + `warnWindows` (G-I, b
      amber pattern SF-2); flag=false → không foot (note section lo)
- [x] gw-b (span 3, SECONDARY from source): label `desktop.notLive.buildFromSource`,
      meta "dev"; copy = `getWakii.sub` (key sẵn, mô tả build); ghost →
      `/docs/getting-started/` (trailing slash) text `hero.ctaGhost`
- [x] gw-c (span 3, teaser mobile): label `teaser.title`, meta "ios · android";
      copy `teaser.sub` (claim đúng G-C 3 caps); badges iOS/Android —
      `MOBILE_LIVE && storeUrl` → link store thật, else dashed soon không href
      (cùng điều kiện với MobileConnect = cùng flag state, KHÔNG QR trên landing
      theo hand-off); cta `teaser.cta` → `/download`
- [x] Note dưới bento: `DOWNLOADS_LIVE ? getWakii.noteLive : getWakii.note` (wire task)
- [x] Entrance: `.reveal` trên head + 3 cell (wire-only, initMotion() sẵn ở Landing.astro)
- [x] Responsive: @980 gw-a full + gw-b/c span 6; @720 tất cả full, `.stp`-style
      không còn; min-width:0 trên cell (grid auto-scale guard)
- [x] VI: mọi string mới drafted EN+VI song song (inline) — list vào audit comment cho G-D

Acceptance T1: build xanh; DOM EN+VI đúng 3 cell; flag=false không có `<a>` download
asset; flag=true (mock) có 2 link `releases/latest/download/…` + warn.

## T2 — Nav-cta flag-aware (G-H)

- [x] `Nav.astro`: nav-cta href = `DOWNLOADS_LIVE ? ${prefix}/download :
      ${prefix}/docs/getting-started/` (thêm trailing slash trên nhánh docs — rule
      FI-294, line đang sửa); MOBILE_LIVE KHÔNG ảnh hưởng nav-cta
- [x] Nav "download" item (SF-1) giữ nguyên → `/download`

Acceptance T2: mock-flip → nav-cta `/download` cả 2 locale; revert → docs.

## T3 — Verify passes (evidence)

- [ ] G-F: grep không có deep-link nào trỏ anchor không tồn tại; `#get-wakii` còn nguyên
- [ ] Locale-switch / ↔ /vi/ giữ nội dung tương đương (DOM both)
- [ ] Responsive @390 iframe probe (không headless screenshot ảo overflow)
- [ ] Rule 0: DOM (orca exec eval single-token JS) + VISUAL (screenshot 2 locale,
      cả 2 mock-flip states) + FLOW (nav → GetWakii → /download)
- [ ] Mock-flip DOWNLOADS_LIVE true → verify → REVERT (không commit flip)

## Process (thứ tự cố định — không checkbox)

1. pnpm install → build xanh sau mỗi commit; KHÔNG commit package-lock.json
2. Commits: `feat(landing): … (FI-303 T1/T2)`
3. Rule 0 browser-verify 3 tầng + mock-flip
4. code-reviewer agent (read-only, scope git log base..HEAD) — commit land sau review
   start → addendum re-review scoped
5. Merge no-ff về `story/fi300-downloads-mobile` (merge-ngược playbook, KHÔNG branch -f);
   conflicts improvements-log → giữ CẢ HAI
6. Post audit comment FI-303 (hash map, evidence, deviations, G-D draft list, literal
   `VERDICT: APPROVED` theo reviewer)
7. `~/.claude/bin/story-verify sf-3` PASS → `orca linear status set --id FI-303 --to Done`
   (Done SAU CUÙNG, chỉ khi merge + verify + audit xong)
8. improvements-log append 1 mục learned

## Deviations dự kiến (log vào audit comment)

1. Hand-off gw-a bx-foot "ios + android pairing — see /download" → nhiệm vụ này chuyển
   cho gw-c (teaser cell trỏ /download); foot gw-a giữ cho G-I warn khi flag=true.
2. Hand-off "reuse component SF-2" cho teaser → MobileConnect nhúng QR frame (cấm trên
   landing) + file thuộc SF-2 (không sửa được) → teaser = markup riêng trong GetWakii
   dùng teaser.* keys + cùng điều kiện flag, không QR.
3. Meta "version" bỏ (không có nguồn version — accuracy gate); meta = asset names factual.
4. `getWakii.steps/reqTitle/reqItems/repoCta` + `hero.ctaPrimary` (→ REPO_URL) không còn
   render ở section này (keys giữ nguyên trong store, không xoá) — hero CTA ngoài touch map.
