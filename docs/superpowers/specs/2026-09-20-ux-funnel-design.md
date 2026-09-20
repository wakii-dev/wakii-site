# Spec — UX funnel: hiểu dự án + tải app (landing → download → first run)

- **Date**: 2026-09-20
- **Status**: rev 2 (spec-critic FIX-P0-FIRST applied — 1 P0 + 3 P1 + P2s; chờ plan-critic)
- **Origin**: user — "Tối ưu lại UX để hướng người dùng hiểu được dự án và tải app sử dụng"
- **Scope lock (user 2026-09-20)**: (1) đối tượng = **Layered — plain trước, dev sau** (plain-for-devs, KHÔNG consumer-ize — product là dev tool, analyst reframe); (2) phạm vi = **Full funnel landing + download** (docs getting-started KHÔNG đụng — strip chỉ link tới); (3) visual = **screenshot app thật** do owner cung cấp (2-4 ảnh), fallback mockup stylized nếu không kịp.

## IDEA-BRIEF (8 chiều)

| Chiều | Nội dung |
|---|---|
| **Task** | Tối ưu UX conversion funnel: (a) landing có lớp "hiểu ngay" — Wakii là gì / mở lên thấy gì / dành cho ai / thử gì đầu tiên; (b) hero CTA tách theo đường: Download (primary) vs Build from source (ghost); (c) /download: version/release thật, macOS arm64+x64, OS-detect progressive enhancement, strip "3 bước đầu sau cài" |
| **Output** | Site EN+VI: 1 section landing mới, hero CTA split, /download restructure + data thật; keys i18n mới qua key-ownership; hand-off design từ designer |
| **Users** | Dev mới ghé lần đầu (không thuộc project) cần hiểu trong ~5s cuộn + tải trong ≤1 click từ hero; dev cũ muốn build source (path giữ nguyên); độc giả blog 240 trang đổ vào /download |
| **Constraints** | Accuracy guards giữ (story view, zero-setup, credits, iOS honest soon, G-I unsigned-warn, G-QR); downloads.ts key-ownership (pre-add pattern); VI copy owner-ACK gate; brand terminal-mono (cấm generic SaaS look); static build (không runtime API); anchors #get-wakii giữ nguyên verbatim (G-F); DownloadPage "nothing custom" contract được AMEND tường minh (D6) |
| **Input** | Source code đọc thật + Phase 0 analyst + user decisions + release probe (v1.4.213 Latest hôm nay, arm64+x64 dmg đều tồn tại) |
| **Context** | Landing vẫn copy thời placeholder (landing.ts:3); prod đang quảng cáo asset v1.4.205 stale hơn Latest 8 bản; deploy thủ công; blog đã trỏ CTA → /download sẵn |
| **Success criteria** | AC1-AC8 (mục Acceptance) — heuristic kiểm được, KHÔNG thêm analytics (out-of-scope, flagged) |
| **Out-of-scope** | Full placeholder→real copy conversion (surface VI review quá lớn); docs getting-started rewrite; analytics; og:image mới (additive sau, nếu có screenshot đẹp); wakii.dev DNS |

## Facts đã verify (probe 2026-09-20)

1. **Funnel hiện tại**: Hero CTA primary = "get wakii — build from source" (`landing.ts` hero.ctaPrimary, Hero.astro:30 → REPO_URL) — dev-oriented DÙ DOWNLOADS_LIVE=true; đường download cho người thường nằm 6 sections sâu (#get-wakii); GetWakii gw-a flag-aware: biến thể live có nút macOS **và Windows** trực tiếp, link "all platforms → /download" chỉ ở biến thể notLive (GetWakii:87-93). Lưu ý consumer ẩn: GetWakii:117 reuse `t.hero.ctaGhost` cho gw-b — keys hero mới phải ADD, không được xóa ctaGhost.
2. **Copy landing nguyên Zeit placeholder** (landing.ts:3: "PLACEHOLDER copy; SF-2 owns real landing copy") — story này sở hữu SURGICAL phần mới, không convert toàn trang.
3. **Release thật (probe gh)**: Latest = **v1.4.213** (published 2026-09-20T06:01Z); v1.4.205 (đang pin) có assets: `Wakii-1.4.205-arm64.dmg` **+ `Wakii-1.4.205-x64.dmg`** (Intel!) + `orca-windows-setup.exe` + `app-release.apk`. Config hiện chỉ pin arm64 → Intel users bị phục vụ dmg sai arch nếu quảng cáo "download for macOS" không phân arch. Cadence ~3 releases/2 ngày → pin tay stale (prod đang 8 bản behind).
4. **/download không có**: version pill (accuracy gate cấm render khi không có nguồn), OS-detect, first-run guidance (guide link chỉ trong cell build-from-source). DownloadPage script contract: "consume the shared util, nothing custom" (chỉ initMotion).
5. **Nav CTA đã nhận biết cờ** → /download khi DOWNLOADS_LIVE (G-H, Nav.astro:11); blog CTA → /download mọi post (BlogDetailLayout:213); footer → /download — bề mặt trỏ đúng sẵn, đòn bẩy là landing + download page.
6. **quickstart key group trong landing.ts mồ côi** — không component nào render (GetWakii thay thế) → cleanup candidate (xóa EN+VI đối xứng).
7. Motion: shared initMotion + data-reveal (có motion-rule FI-304 cần re-verify khi thêm section); bento anatomy `.bx/.bx-in/.bx-label/.bx-body/.bx-foot` + `--radius-cell` + nút prefix `> ` là design system phải reuse; breakpoints 980/720; mobile-390 ALL-PASS là chuẩn verify.
8. Accuracy guards: "story view" (không "Stories tab"), zero-setup OK, footer credits Orca MIT + obra/superpowers MIT, iOS coming-soon honest, G-I unsigned-binary warn phải đi kèm mọi download CTA, G-QR chỉ biến thể live. Analytics: KHÔNG có gì — success = heuristic (D10), không thêm script đo.

## Design decisions

- **D1 — Plain-for-devs (user lock)**: lớp mới trả lời 4 câu bằng ngôn ngữ phẳng nhưng KHÔNG dễ hóa: "Wakii là gì (1 câu)", "Mở app lên thấy gì đầu tiên (Superpowers panel + team 9 agents)", "Dành cho ai (dev muốn delegate việc)", "Thử gì đầu tiên (/superpowers ...)". Giữ toàn bộ tầng dev/workflow bên dưới nguyên vị trí.
- **D2 — Full funnel (user lock)**: landing (hiểu + CTA split + scroll depth) + /download (version + arch + OS-detect + first-run strip). Docs getting-started KHÔNG đụng — strip chỉ link.
- **D3 — Screenshots thật (user lock) + fallback**: owner cung cấp 2-4 ảnh (⚡ Superpowers panel, bracket canvas, màn hình chính). SF-2 GAP comment lên epic khi start; fallback nếu không kịp = mockup stylized có sẵn (KHÔNG BAO GIỜ label là screenshot). Ảnh: lazy-load under-fold, explicit width/height (CLS), max 2 ảnh đầu section.
- **D4 — Copy scope SURGICAL**: chỉ section mới + hero CTA + additions /download; PLACEHOLDER note trong landing.ts cập nhật ghi rõ vùng đã-owned vs còn placeholder. KHÔNG convert toàn trang.
- **D5 — Version resolution = build-time fetch + fallback pin + per-asset validation**: build fetch GitHub API `releases/latest` (1 call/build, unauth 60/hr đủ, timeout ~3s); render version + published date + URLs construct từ version + asset matrix (macos-arm64, macos-x64, windows, android APK). **Asset-name strip rule**: bỏ leading `v` của tag → `Wakii-1.4.213-arm64.dmg`. **Validation per-asset**: constructed URL phải match 1 asset trong asset list của CÙNG API response (free, không extra call); asset thiếu/rename → fallback pinned URL cho OS đó; pinned cũng thiếu → ẩn nút đó + honest soon state (không bao giờ advertise 404). Fetch fail → fallback `LATEST_RELEASE` pin trong config. **Build persist artifact**: resolved version + fetched-at timestamp ghi vào artifact (vd `dist/release-meta.json` hoặc nguồn sinh dist) để verifier kiểm INTERNAL consistency (URLs ↔ version ↔ timestamp) — KHÔNG so với live GitHub lúc verify (cadence 5 releases/48h sẽ fail spuriously). **Consumer map (P0 plan-critic)**: shared resolution module — **GetWakii (đang derive filename từ DOWNLOAD_URLS) + MobileConnect QR (đang encode pinned android URL) + DownloadPage đều consume RESOLVED data**; exit criteria SF-3: grep direct consumers của DOWNLOAD_URLS/MOBILE_STORE_URLS ngoài resolution module = 0 (landing ↔ download version-consistent — AC8). Khắc phục class stale-pin (prod 8 bản behind; cadence thật 5 releases/48h). Re-pin in-repo: `README.md` deployment section — wording mô tả cơ chế fetch (không re-pin số version); **orca README ngoài repo → OWNER manual step trong release checklist, KHÔNG là task SF**.
- **D6 — OS-detect = progressive enhancement, contract AMEND tường minh**: no-JS = hiện CẢ HAI nút (default); JS detect (navigator.platform/userAgentData tối thiểu, không fingerprinting thêm) chỉ HIGHLIGHT (không ẩn/đổi thứ tự). **Highlight rule pin**: (a) highlight theo OS-row: macOS visitor → macOS cell, Windows visitor → Windows cell, Android visitor → Android badge (MobileConnect), Linux/unknown → không highlight; (b) trong macOS cell KHÔNG arch-highlight (D6 cấm JS arch-detect) — 2 nút arch đồng trọng lượng, arm64 xếp trước mặc định; (c) highlight cue PHẢI non-color: `aria-current="true"` + text chip "→ cho máy bạn" (a11y có criterion enforce). Contract amend gồm CẢ HAI comment: motion contract ("shared util + một PE script duy nhất với no-JS fallback") VÀ accuracy-gates list (DownloadPage:12-18 "version pill NOT rendered / no release data source exists" → cập nhật theo D5, tránh standing false comment).
- **D7 — Keys pre-add (key-ownership)**: SF-1 sở hữu keys mới (landing.ts: group mới `understand` + hero CTA keys mới ADD-thêm — `hero.ctaGhost` GIỮ NGUYÊN vì GetWakii:117 đang reuse; downloads.ts: version/first-run/os-detect additions — parallel `live`/`notLive` pattern khi flag-driven). Components KHÔNG hardcode copy. **VI ACK — MỘT rule duy nhất**: draft EN+VI render tại merge (precedent FI-300); ACK của owner ghi tại Phase-1 RELEASE CHECKPOINT (một điểm duy nhất, không per-SF); owner từ chối → SF-1 revise text-only; **owner im lặng → mặc định ship draft** (flag trên epic, owner demand post-hoc revise text — rẻ).
- **D8 — Hero CTA target = `/download` (PIN, đóng P0 fork)**: hero primary mới trỏ `/download` (KHÔNG direct-file — nếu không landing phải tự xử OS/arch + G-I warn, và tạo dependency SF-2→SF-3). G-I warn giữ ở /download nơi nút sống; hero CTA kèm microcopy nhẹ "free · open source · unsigned build" (một dòng, đúng sự thật). **Ghost semantics (P1 plan-critic)**: hero ghost MỚI = build-from-source → REPO_URL (key mới ADD; hiện ghost là "read the guide" → docs); `ctaGhost` giá trị GIỮ NGUYÊN (consumer GetWakii:117); "read the guide" hạ cấp thành text-link phụ hoặc gộp theo hand-off — exit criteria SF-2 assert CẢ 3 href (primary→/download, ghost→REPO_URL, gw-b→docs không đổi). Anchors `#get-wakii` giữ nguyên verbatim (G-F); anchors khác không bị che; iOS/G-QR logic không đụng.
- **D9 — quickstart orphan**: xóa EN+VI đối xứng trong SF-1 (nếu designer cần repurpose → decision tường minh trong hand-off).
- **D10 — Success heuristic, KHÔNG analytics**: (1) hero → installer ≤1 click; (2) 5s-comprehension: người đọc section mới trả lời được 4 câu D1; (3) mobile-390 ALL-PASS; (4) perf: Lighthouse local ≥90 heuristic không thụt; (5) a11y không thụt (cap ~90 systemic). Thêm analytics = out-of-scope, flag riêng nếu owner muốn.
- **D11 — Design-first (user chỉ thị)**: SF-1 chạy designer 3 hướng × 2 surfaces (landing understand-layer + /download restructure — MỘT design pass nhất quán), user gate chọn hướng, hand-off `docs/superpowers/designs/ux-funnel-direction.md` = binding cho SF-2/SF-3 (Design: none, implement theo hand-off).

## Acceptance (user-visible — verifier Phase 5 kiểm)

- **AC1**: Dev mới cuộn landing ~5s gặp section mới; **content-inspection**: 4 câu D1 CÓ câu trả lời trong chính copy của section (Wakii là gì / mở lên thấy gì / dành cho ai / thử gì đầu) — kèm visual (screenshot thật hoặc mockup, đúng nguồn ghi rõ).
- **AC2**: Từ hero → bề mặt tải `/download` **≤1 click**; từ /download → file installer **≤1 click nữa** (tổng ≤2 click tới file — threshold pin rõ, không đọc luân phiên). Hero CTA kèm microcopy nhẹ; warn đầy đủ sống trên /download.
- **AC3**: Đường dev giữ nguyên: build-from-source thấy rõ (hero ghost + GetWakii gw-b), không bị mờ đi.
- **AC4**: /download hiển thị version + release date từ RESOLVED data (khớp `release-meta.json` artifact của build — verifier kiểm internal consistency, KHÔNG so live GitHub); macOS có cả arm64 + x64; OS-detect chỉ highlight theo rule D6 (non-color cue); no-JS vẫn thấy đủ nút.
- **AC5**: Strip "3 bước đầu sau cài" trên /download → getting-started (không sửa docs).
- **AC6**: VI mirror đầy đủ keys mới (draft render; ACK/ship-draft theo rule D7 ghi trên epic tại checkpoint); accuracy guards nguyên (story view, zero-setup, credits, iOS honest, G-I, G-QR).
- **AC7**: mobile-390 ALL-PASS landing + download; Lighthouse local: ≥90 VÀ trong ±5 điểm so với baseline TRƯỚC story (baseline đo ở SF-4 trước khi judge — chống noise ±8-17); a11y không thụt (cap ~90 systemic).
- **AC8**: Chain không vỡ: anchors (#get-wakii…), nav CTA, footer, blog CTA → /download, GetWakii ↔ /download nhất quán CẢ flag VÀ version (cùng consume resolved data).

## SF split (tier-bracket)

**Rubric**: SF-1 own outcome = direction + keys (C1); SF-2 = {Hero.astro, section mới, Landing.astro}; SF-3 = {config, DownloadPage, MobileConnect, GetWakii (consumers-rewire), README.md} — touch map RỜI NHAU sau khi phân GetWakii rõ cho SF-3 (C2); interface = hand-off design + key store (C3); SF-4 = convergence QA (V1-V3).

### SF-1 — Design direction + key store (tier 0, Design: mock-prototype)
Designer MỘT pass 3 hướng × 2 surfaces → user gate → hand-off doc binding (**supersedes** `sf-downloads-direction.md` cho /download surfaces — ghi tường minh trong hand-off); keys mới pre-add EN+VI (landing `understand` group + hero keys ADD-thêm: primary-download + ghost-build-source; `ctaGhost` giữ cho gw-b); VI draft đăng epic (**exit KHÔNG chờ ACK** — draft + ACK-request posted là xong; ACK là việc checkpoint); quickstart orphan cleanup đối xứng (landing.ts interface :87 + EN :274 + VI :472; grep consumer = 0); PLACEHOLDER note cập nhật (wording final fine-tune tại SF-2 merge).
Tasks: designer-brief / directions / user-gate / hand-off-doc / keys-landing / keys-downloads / vi-draft-ack / quickstart-cleanup / placeholder-note-update. (keys-* chạy SAU hand-off-doc.)

### SF-2 — Landing understand-layer + CTA funnel (tier 1, Design: none — bound SF-1 hand-off)
Section mới theo hand-off (4 câu D1 + screenshots thật qua GAP, fallback mockup); hero CTA split (primary → /download + microcopy; ghost MỚI → REPO_URL; ctaGhost giữ cho gw-b — **assert 3 href**); section insert qua Landing.astro; anchors intact; EN+VI wire; motion reveal reuse + motion-rule re-verify; mobile-390; a11y.
Tasks: section-component / screenshots-gap-integrate / hero-cta-split / landing-insert-anchors / en-wire / vi-wire / motion-reverify / mobile-390 / a11y-check / visual-qa.

### SF-3 — Download page upgrade (tier 1, Design: none — bound SF-1 hand-off)
LATEST resolution build-time fetch + per-asset validation + fallback pin (D5) + `release-meta.json` artifact; **consumers-rewire** (GetWakii meta-line + MobileConnect QR → resolved module; exit: grep direct consumers DOWNLOAD_URLS/MOBILE_STORE_URLS ngoài module = 0); OS-detect PE + no-JS fallback + highlight rule D6 + contract amend (motion + accuracy-gates + 2 design-binding comments → trỏ hand-off mới); macOS arm64+x64; first-run strip; layout restructure quanh 1 primary (**spine — mọi task đụng DownloadPage.astro TUẦN TỰ sau nó; contract-amend CUỐI**); G-I warn; README.md wording = mô tả cơ chế fetch (orca README = owner manual step trong release checklist, ngoài repo); EN+VI wire; mobile-390; accuracy recheck.
Tasks: version-resolution / consumers-rewire / release-meta-artifact / layout-restructure-spine / arch-buttons / os-detect-pe / first-run-strip / contract-amend / en-vi-wire / accuracy-recheck / check-og-desc-min / mobile-390 / visual-qa. **check-og-desc-min (owner request 09-20)**: check-og thêm assert og:description ≥55 chars (ngưỡng validator share-card) — HARD-FAIL trên share surfaces (landing, /download, blog posts), WARN ngoài (docs/category có thể ngắn có chủ đích).

### SF-4 — Funnel convergence QA (tier 2)
Cross-surface audit: chain hero→download→first-run→docs (**gồm AC1 content-inspection** — 4 câu có trong copy section); anchors + nav/footer/blog CTA; version consistency GetWakii ↔ /download; VI parity + ACK-or-default recorded (không bao giờ chờ); mobile-390 sweep 2 pages; **Lighthouse protocol: baseline = build trên MAIN (pre-story) + dest, cùng máy/cổng, median 3 runs; ≥90 VÀ ±5 baseline**; a11y sweep; meta/OG consistency; release checklist (gồm owner manual steps: orca README re-pin, deploy, domain) + report card owner test thật.
Tasks: funnel-chain-audit / anchors-nav-audit / vi-parity-ack / mobile-390-sweep / perf-budget / a11y-sweep / meta-consistency / release-checklist.

**Phases**: Phase 1 = tiers 0-1 (SF-1+SF-2+SF-3 — mọi thay đổi user-visible; RELEASE CHECKPOINT = điểm ghi ACK VI + security-audit, KHÔNG phải deploy gate, KHÔNG block SF-4) → Phase 2 = SF-4 (convergence QA; deploy diễn ra SAU SF-4 bởi owner). SF-2 ∥ SF-3.

**Chống duplicate**: motion-reveal + mobile-390 + a11y xuất hiện ở SF-2/SF-3 là verify-CỦA-TỪNG-SF (Zweck riêng — không tính duplicate); sweep tổng dồn SF-4; keys chỉ SF-1 sở hữu; design chỉ SF-1. 2 SF tier-1 ≥50% cùng loại? Không — landing (section+CTA+i18n wire) vs download (data+script+strip) khác bản chất; gộp sẽ >20 tasks vi phạm 8-15.

## Risks / unknowns

1. **VI ACK gate**: draft render được với ACK flag (precedent FI-300); owner ACK tại checkpoint. Nếu owner từ chối copy → SF-1 revise (chỉ text, không architecture).
2. **Screenshots**: SF-1 thiết kế layout/direction KHÔNG cần ảnh trước (frame dành slot visual); SF-2 post GAP comment lúc start với **format spec**: PNG ≥1600px ngang, theme dark của app, full window không dữ liệu cá nhân, 16:10 khuyên dùng. **GAP timeout = hết Phase design của SF-2** → fallback mockup stylized (D3, không label screenshot). Ảnh thật: tối ưu size (WebP nếu tool sẵn, không thì PNG nén) + lazy + explicit dims.
3. **GitHub API rate limit lúc build** (60/hr unauth) — fallback pin đảm bảo build không bao giờ đỏ vì fetch; fetch timeout ngắn (~3s).
4. **Windows asset giữ tên orca** (`orca-windows-setup.exe`) — giữ nguyên hiển thị asset name thật (accuracy), không rebrand claim.
5. **Hero CTA retarget làm dev core bỡ ngỡ** — mitigated: build-from-source giữ ghost hero + gw-b nguyên; hero.ctaGhost GIỮ NGUYÊN (consumer ẩn GetWakii:117); microcopy "free · open source" trên CTA mới.
6. **Lighthouse trên landing dài + ảnh mới** — lazy + explicit dims + ≤2 ảnh section; đo trước/sau trong SF-4.
7. **quickstart xóa key**: grep consumer trước xóa (analyst xác nhận orphan — re-verify tại SF-1).
