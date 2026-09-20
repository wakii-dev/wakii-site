# Funnel convergence crawl — SF-4 (VU-13)

dist: `dist` · release-meta: `1.4.213` (source=fetched) · 2026-09-20T11:34:53.320Z

**28 PASS · 1 WARN · 0 FAIL**

- **PASS** C1 landingEn — hero primary → /download (+ ghost → repo) — primary "download" · ghost "build from source"
- **PASS** C1 landingVi — hero primary → /vi/download (+ ghost → repo) — primary "download" · ghost "build từ mã nguồn"
- **PASS** C2 downloadEn — 4 installer href == release-meta + tag/nightly/repo links — tag:true nightly:true repo:true — ≤2 click tới file (1 click trên nút)
- **PASS** C2 downloadVi — 4 installer href == release-meta + tag/nightly/repo links — tag:true nightly:true repo:true — ≤2 click tới file (1 click trên nút)
- **PASS** C2 landingEn — GetWakii asset links cùng release-meta (macOS+Windows+Android) — 3/4 asset trùng release-meta
- **PASS** C2 landingVi — GetWakii asset links cùng release-meta (macOS+Windows+Android) — 3/4 asset trùng release-meta
- **PASS** C3 versions — mọi version string == 1.4.213 (GetWakii ↔ /download cùng resolved) — counts {"landingEn":5,"downloadEn":11,"landingVi":5,"downloadVi":11}
- **PASS** C4 downloadEn — first-run strip → getting-started ≤1 click nữa — link ✓ · dest exists:true
- **PASS** C4 downloadVi — first-run strip → getting-started ≤1 click nữa — link ✓ · dest exists:true
- **PASS** C4 landingEn — understand (q4 first-run) → getting-started — link ✓
- **PASS** C4 landingVi — understand (q4 first-run) → getting-started — link ✓
- **PASS** C5 dead-links — 27 internal hrefs resolve (file + anchor) — 0 chết trong chain
- **PASS** C6 landingEn — #get-wakii verbatim + nav anchors (#features/#workflow/#faq) — get-wakii:true nav:true
- **PASS** C6 landingVi — #get-wakii verbatim + nav anchors (#features/#workflow/#faq) — get-wakii:true nav:true
- **PASS** C7 blog-CTA — 5 posts × 2 locale có CTA → /download (agentic-landscape-50-projects, arch-auto-update-feed, arch-ci-gates, arch-electron-process-model, arch-native-computer-use) — 5/5 × 2 ✓
- **PASS** C8 landingEn — canonical + hreflang(en/vi/x-default) + desc + og/twitter — can:https://wakii.xyz/ vi:https://wakii.xyz/vi/ desc:109ch og:true tw:true
- **PASS** C8 downloadEn — canonical + hreflang(en/vi/x-default) + desc + og/twitter — can:https://wakii.xyz/download/ vi:https://wakii.xyz/vi/download/ desc:109ch og:true tw:true
- **PASS** C8 landingVi — canonical + hreflang(en/vi/x-default) + desc + og/twitter — can:https://wakii.xyz/vi/ vi:https://wakii.xyz/vi/ desc:103ch og:true tw:true
- **PASS** C8 downloadVi — canonical + hreflang(en/vi/x-default) + desc + og/twitter — can:https://wakii.xyz/vi/download/ vi:https://wakii.xyz/vi/download/ desc:96ch og:true tw:true
- **PASS** C9 landing VI — 4 kickers q1–q4 + copy VI thật — 4/4 kickers
- **PASS** C9 download VI — nhóm upgrade có bản VI (arch/phiên bản/first-run/G-I/nightly) — 6/6 markers
- **PASS** C9 placeholders — không TODO/PLACEHOLDER/lorem trên VI pages — sạch
- **PASS** C10 story-view — không "Stories tab" (dùng "story view") — sạch
- **PASS** C10 credits — footer credit orca + superpowers — ✓
- **PASS** C10 G-I warn — G-I unsigned warn per-OS (macOS Open Anyway + Windows SmartScreen) EN+VI — EN:true VI:true
- **PASS** C10 iOS-honest — iOS honest wording (EN "no installer" / VI "chưa có installer") — EN:true VI:true
- **PASS** C11 downloadEn — OS-detect highlight: aria-current="true" đúng 1 — count:1
- **PASS** C11 downloadVi — OS-detect highlight: aria-current="true" đúng 1 — count:1
- **WARN** C11 imgs — không thấy <img> trong section understand (slot/screenshot?) — verify visual ở bước browser
