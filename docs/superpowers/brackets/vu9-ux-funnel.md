# Story: VU-9 — UX funnel: hiểu dự án + tải app

Destination: story/vu9-ux-funnel

## SF-1 Design direction + key store
Tier: 0
linear: VU-10
What: Phase 1/2 — foundation (design-first): designer MỘT pass 3 hướng × 2 surfaces (landing understand-layer + /download restructure) → USER GATE chọn hướng → hand-off doc binding (SUPERSEDES sf-downloads-direction.md cho /download surfaces — ghi tường minh trong hand-off); keys i18n mới pre-add EN+VI (landing group `understand` + hero keys ADD-thêm: primary-download + ghost-build-source; hero.ctaGhost GIỮ vì GetWakii:117 reuse; downloads additions version/first-run/os-detect; keys chạy SAU hand-off-doc); VI draft đăng epic — exit KHÔNG chờ ACK (draft + ACK-request posted là xong; ACK là việc checkpoint; owner im lặng → ship draft); quickstart orphan cleanup đối xứng (landing.ts :87/:274/:472 + grep consumer = 0); PLACEHOLDER note cập nhật (wording final fine-tune tại SF-2). Demo: hand-off doc + keys wire-able; trang chưa đổi look.
Depends on: —
Tasks: designer-brief / directions / user-gate / hand-off-doc / keys-landing / keys-downloads / vi-draft-ack / quickstart-cleanup / placeholder-note-update

## SF-2 Landing understand-layer + CTA funnel
Tier: 1
linear: VU-11
What: Phase 1/2 — shippable: implement hand-off SF-1 — section plain-for-devs (4 câu: Wakii là gì / mở lên thấy gì / dành cho ai / thử gì đầu) + visual slot (screenshot thật qua GAP comment lúc start — format spec trong spec rủi ro #2; timeout hết design phase → fallback mockup KHÔNG label screenshot); hero CTA split (primary → /download + microcopy "free · open source · unsigned build"; ghost MỚI → REPO_URL; ctaGhost giữ cho gw-b — ASSERT 3 href); insert qua Landing.astro, anchors intact (G-F); EN+VI wire; motion reveal + FI-304 rule re-verify; mobile-390; a11y. Demo: 5s cuộn hiểu 4 câu; ≤1 click hero → /download.
Depends on: SF-1
Tasks: section-component / screenshots-gap-integrate / hero-cta-split / landing-insert-anchors / en-wire / vi-wire / motion-reverify / mobile-390 / a11y-check / visual-qa

## SF-3 Download page upgrade
Tier: 1
linear: VU-12
What: Phase 1/2 — shippable: implement hand-off SF-1 — version resolution build-time fetch (timeout ~3s) + per-asset validation từ cùng API response + fallback pin + release-meta.json artifact; consumers-rewire (GetWakii meta-line + MobileConnect QR → resolved module; exit: grep direct consumers DOWNLOAD_URLS/MOBILE_STORE_URLS ngoài module = 0); OS-detect PE (highlight rule D6: aria-current + chip "→ cho máy bạn", không ẩn nút, Linux/unknown không highlight) + no-JS fallback đầy đủ + contract amend (motion + accuracy-gates + 2 design-binding comments → trỏ hand-off mới); macOS arm64+x64 buttons; first-run 3-step strip → getting-started; layout-restructure = SPINE (mọi task đụng DownloadPage.astro TUẦN TỰ sau nó; contract-amend CUỐI); G-I warn; README.md wording = mô tả cơ chế fetch (orca README = OWNER manual step trong release checklist — ngoài repo); EN+VI wire; mobile-390; accuracy recheck. Demo: /download hiện version thật + đúng arch, ≤1 click tới installer.
Depends on: SF-1
Tasks: version-resolution / consumers-rewire / release-meta-artifact / layout-restructure-spine / arch-buttons / os-detect-pe / first-run-strip / contract-amend / en-vi-wire / accuracy-recheck / mobile-390 / visual-qa

## SF-4 Funnel convergence QA
Tier: 2
linear: VU-13
What: Phase 2 — convergence: chain audit hero→/download→first-run→docs (≤2 click tới file; GỒM AC1 content-inspection — 4 câu trong copy section); anchors + nav/footer/blog CTA; version consistency GetWakii ↔ /download (cùng resolved data); VI parity + ACK-or-default recorded (không bao giờ chờ); mobile-390 sweep cả 2 pages; Lighthouse PROTOCOL: baseline = build MAIN (pre-story) + dest, cùng máy/cổng, median 3 runs — ≥90 VÀ ±5 baseline; a11y sweep; meta/OG consistency; release checklist (owner manual steps: orca README re-pin, deploy tay, domain wakii.xyz) + report card owner test thật.
Depends on: SF-2, SF-3
Tasks: funnel-chain-audit / anchors-nav-audit / vi-parity-ack / mobile-390-sweep / perf-budget / a11y-sweep / meta-consistency / release-checklist
