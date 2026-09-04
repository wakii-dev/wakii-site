# Plan — FI-301 / SF-1 Releases foundation (FI-300, Tier 0)

Spec: docs/superpowers/specs/2026-09-04-site-downloads-mobile.md (§ SF-1 + gates G-A/G-A2/G-B/G-C/G-D/G-E/G-QR/G-I)
Context pack: docs/superpowers/contexts/fi300-sf-1.md
Branch: sf-1-releases → Destination: story/fi300-downloads-mobile (merge no-ff)
Rule: flag=false ⇒ KHÔNG dead-link (trừ nav/footer → /download, dead-link tạm CHẤP NHẬN trong SF window per context pack, route xuất hiện ở SF-2) và KHÔNG dead-claim.

## Tasks

- [x] 1. **config-flags-and-urls** — `src/config.ts`: thêm `DOWNLOADS_LIVE=false`, `MOBILE_LIVE=false`, `DOWNLOAD_URLS {macos, windows}` (pattern `releases/latest/download/<asset>`, KHÔNG version constant), `MOBILE_STORE_URLS {ios, android}` (placeholder rỗng — điền khi có channel). Comment runbook: flip = USER/manual + 3 preconditions (repo public / release + asset đúng tên / unsigned chạy được). KHÔNG đụng DOC_SLUGS / REPO_URL.
- [x] 2. **i18n-keys-EN-full-set** — NEW `src/i18n/downloads.ts`: interface + `en`. Surfaces: download page (title/description/kicker/h2/sub), desktop (tab labels macOS/Windows, download button, warn G-I per-OS, follow-releases, build-from-source, not-live note), mobile-connect (kicker/title/sub, badges iOS/Android, QR caption flag=true, coming-soon flag=false, follow-updates, capabilities G-C đúng 3 cái duyệt: xem phiên agents / duyệt gates / gửi task), teaser (kicker/title/sub/cta). Mọi key điều kiện có CẢ 2 biến thể flag.
- [x] 3. **i18n-keys-VI-full-set** — cùng file, export `vi` đầy đủ song song EN (draft — G-D convergence gate duyệt sau).
- [x] 4. **roadmap-copy-flag-aware (G-B)** — `src/data/roadmap.ts`: item binaries tách 2 variant (flag=false: "Downloads for macOS & Windows" giữ lane Next, copy mới; flag=true: chuyển lane Now, changelog giữ Next) + export `buildRoadmap(live)`; `RoadmapPage.astro` đọc `DOWNLOADS_LIVE`. Nội dung items khác giữ nguyên verbatim (approved FI-294).
- [x] 5. **docs-getting-started-note-EN-VI (G-E)** — `src/content/docs/{en,vi}/getting-started.md`: note download 1-2 câu đúng trạng thái flag hiện tại (chưa có installer → build from source, follow Releases page).
- [x] 6. **nav-footer-download-link** — `Nav.astro`: repoint link "download" hiện có (`#get-wakii`) → `${prefix}/download` (dead-link tạm tới SF-2 — commit message ghi rõ); `Footer.astro`: thêm link "download" `${prefix}/download`. Nav-cta "get wakii" GIỮ `/docs/getting-started` (G-H flag=false).
- [x] 7. **faq-zerosetup-flag-sync** — `src/i18n/landing.ts`: thêm `getWakii.noteLive` ×2 locale (variant flag=true của note "No binaries yet" — wiring thuộc SF-3 vì GetWakii.astro owned by SF-3). Grep-audit FAQ + ZeroSetup: không có claim "no binaries" tuyệt đối (hiện không có — xác nhận và ghi nhận). KHÔNG sửa copy khác.
- [x] 8. **lighthouse-baseline-record** — build + chạy Lighthouse landing + pages hiện có; ghi số thật vào `docs/superpowers/notes/lighthouse-baseline-fi300.md` (không fabrication).

## Meta steps (numbered — không dùng checkbox)

1. Build xanh cả 2 locale (`pnpm build`), smoke các route.
2. Browser verify Rule 0 — 3 tầng: DOM (nav/footer link, roadmap lane copy), screenshot landing/roadmap/docs, FLOW: nav → landing → nav/footer Download link → roadmap lane-read → docs getting-started note → lang-switch /vi/. Mock flip flag=true (local, không commit) → roadmap dòng chuyển Now.
3. Tester review độc lập — dispatch `code-reviewer` trên diff SF; CHANGES-REQUESTED → fix → re-review; APPROVED → post `VERDICT: APPROVED` lên FI-301.
4. Merge no-ff `sf-1-releases` → `story/fi300-downloads-mobile` (conflict improvements-log → giữ CẢ HAI) + audit comment merge-hash lên FI-301.
5. Gate cứng: `~/.claude/bin/story-verify sf-1` sạch → FI-301 Done.
