# Spec — Story 3: Direct downloads + mobile connect (wakii-site)

Ngày: 2026-09-04 · Epic: (tạo ở bước 10) · Fork: SAU KHI FI-294 close, từ `story/fi294-site-content-depth` head · PM draft v3 (spec-critic + plan-critic REVISE resolved)

## IDEA-BRIEF (8 chiều)

- **Task**: (1) thêm download trực tiếp binary .dmg (macOS) / .exe (Windows) theo GitHub Releases; (2) giới thiệu tính năng connect mobile app (iOS + Android) để làm việc từ xa — QR pairing.
- **Output**: trang `/download` (EN + `/vi/download`), section Get Wakii trên landing nâng cấp (download là primary, build-from-source secondary), section/block mobile connect, nav-cta + Nav/Footer links mới.
- **Users**: người muốn cài Wakii KHÔNG qua toolchain dev (nhân khẩu rộng hơn dev); người dùng hiện tại muốn remote từ điện thoại.
- **Constraints (MUST)**: mọi URL hiển thị phải resolve tới target thật (accuracy guard — dead-link VÀ dead-claim đều cấm); build-from-source giữ làm secondary (audience dev + docs source-first); i18n keys ×2 locale; reduced-motion toàn site; design theo v2 Bento Premium binding; SEO hreflang/canonical cho route mới.
- **Input**: GitHub Releases hosting (user chốt); QR pairing flow (user chốt); REPO_URL config.
- **Context**: FI-294 đang chạy — SF-3 sở hữu GetWakii (Bento Composer); story 3 fork SAU close. Spec FI-294 ghi non-goal "binary releases" + roadmap "Next" có "GitHub Releases + binaries + changelog" → story 3 ĐẢO NGƯỢC non-goal này (user quyết) và phải cập nhật roadmap copy + live copy "No binaries yet" (user duyệt lúc APPROVE).
- **Success criteria**: visitor vào /download thấy đúng nút theo platform, click → asset thật (khi flag on); visitor landing hiểu có mobile app + connect bằng QR (khi flag on); khi flag off — KHÔNG render link/claim nào chưa tồn tại; build xanh; Lighthouse: landing ≥ baseline kế thừa FI-294, /download ≥95 tuyệt đối; links/hreflang/reduced-motion sạch.
- **Out-of-scope**: Linux builds; CI release pipeline; code signing/notarization; store submission backend; pairing backend trên site; auto-update/changelog page; analytics/tracking download clicks (chưa có infra — ghi nhận gap, không làm); account-login pairing (chỉ QR).

## Decisions đã user-chốt (2026-09-04, chat)

1. Hosting: **GitHub Releases** — desktop binary macOS (.dmg) + Windows (.exe), KHÔNG Linux.
2. Mobile app: **thật, connect được** — flow **QR pairing**; platforms **iOS + Android**.
3. UI: **/download page ×2 locales + landing section upgrade**; Get Wakii giữ làm secondary (developers).
4. Fork: **sau khi FI-294 close**, từ nhánh đích story 2.

## Accuracy gates (spec-critic v2 — resolved P0 clusters)

### G-A — Desktop binary live gate (flag-gated, 1-line flip)
- `src/config.ts` thêm: `DOWNLOAD_URLS` (platform→URL), `DOWNLOADS_LIVE: boolean` (default **false**).
- **URL format PINNED**: `https://github.com/wakii/wakii/releases/latest/download/<asset>` (pattern `latest/download` — KHÔNG version constant trong URL → flip flag thật sự là 1-line, không phải đuổi version). Asset names đề xuất: `Wakii.dmg` / `WakiiSetup.exe` — user/app-repo chốt tên thật lúc release; site dùng đúng tên đó trong map.
- **Precondition để flip = true** (ghi comment trong config): (i) repo public (hiện private — release URL sẽ 404 với anonymous), (ii) release tồn tại + asset đúng tên, (iii) binary chạy được mặc dù unsigned. Flip là thao tác USER/manual — agents KHÔNG tự flip (pattern REPO_URL confirm FI-294 SF-4).
- `DOWNLOADS_LIVE=false` → /download render: build-from-source prominent + link "Follow releases" trỏ GitHub Releases page (static, không backend, không email-form); KHÔNG render download button nào.

### G-A2 — Mobile live gate (P0-1 fix)
- `src/config.ts` thêm: `MOBILE_LIVE: boolean` (default **false**), `MOBILE_STORE_URLS: { ios: string; android: string }` (điền khi có channel).
- **Distribution channel user chốt lúc APPROVE** (repo app chưa public —渠道 chưa tồn tại): đề xuất App Store + Google Play; fallback hợp lệ: TestFlight / direct APK.
- `MOBILE_LIVE=false` → mobile block render: platform badges iOS/Android (trung thực, không store badge giả) + copy "coming soon" + link follow updates; KHÔNG render QR, KHÔNG link store nào.
- `MOBILE_LIVE=true` → badges thành link store thật + QR render (xem G-QR).

### G-QR — QR semantics (P0-2 fix)
- QR là **visual flag-gated theo `MOBILE_LIVE`** — KHÔNG bao giờ render khi flag=false.
- Nội dung QR khi flag=true: encode URL trung thực — mặc định = store page (khách quét → mở store cài app). Phương án `https://wakii.dev/app` CHỈ khả thi nếu trang đó được xây trước khi flip — **trang /app out-of-scope story này** (ghi runbook: chọn /app ⇒ phải build trang trước). **KHÔNG encode pairing endpoint/session** — site static không backend; pairing session phải do app sinh ra.
- Copy pairing: "quét QR để tải app, kết nối từ trong app" (mức claim an toàn); nâng thành "quét để kết nối" CHỈ khi app thật sự hỗ trợ scan-to-pair — user confirm lúc flip flag.

### G-B — Roadmap copy (flag-aware rendering)
- Dòng "GitHub Releases + binaries + changelog" (Next) cập nhật + render **flag-aware** (đọc `DOWNLOADS_LIVE` như mọi copy khác): flag=false → "Downloads macOS & Windows" ở Next (copy mới user duyệt); flag=true → chuyển **Now/Shipped**, "changelog page" giữ Next. Không có copy tĩnh lệch flag.

### G-C — Remote capabilities (zero-default)
- Copy mobile connect CHỈ claim capability trong danh sách user duyệt lúc APPROVE (đề xuất: xem agents chạy / duyệt gates / gửi task — user tick/sửa).
- **Zero-default**: nếu user không tick gì → copy chỉ claim generic "làm việc từ xa với agents của bạn qua mobile app" — KHÔNG liệt kê capability cụ thể nào.

### G-D — VI + cả 2 biến thể flag
- Mọi copy EN+VI mới qua gate duyệt (dồn convergence SF, như FI-294). **Phải duyệt CẢ 2 biến thể flag** (live + not-live) vì flag flip sau launch không được làm xuất hiện copy chưa duyệt.

### G-E — Docs note
- Docs getting-started (build-from-source) thêm note download ngắn (EN+VI) — landing ↔ docs không lệch có chủ ý.

### G-F — Anchor kế thừa
- Nav deep-link `${prefix}/#get-wakii` — kế thừa anchor cuối cùng story 2 quyết; audit deep-links cũ trong convergence.

### G-H — Nav-CTA theo flag
- `DOWNLOADS_LIVE` → nav-cta trỏ `/download`; false → giữ `/docs/getting-started/`. `MOBILE_LIVE` KHÔNG ảnh hưởng nav-cta.

### G-I — Unsigned binary warn copy (P1)
- Khi `DOWNLOADS_LIVE=true`, cạnh nút download có note nhỏ: macOS "app ngoài App Store cần cho phép trong System Settings → Privacy & Security" / Windows "SmartScreen có thể hiện cảnh báo — Run anyway" (EN+VI, thuộc G-D).

### P1 resolutions kèm theo
- **.dmg universal** (1 asset/platform — giữ URL pattern đơn giản); nếu sau này per-arch → chỉ đổi config map, không đổi page.
- **Lighthouse split**: landing = ≥ baseline kế thừa (đo ở SF-1); `/download` + `/vi/download` = ≥95 tuyệt đối (trang mới, không baseline riêng).
- **Flag-flip ownership**: comment trong config.ts ghi rõ flip = user/manual; kèm mini-runbook (preconditions checklist) ngay trong comment.

## SF split (rubric C1-C5/V — own outcome, touch map tách bạch, interface pinned; plan-critic v3)

### SF-1 — Releases foundation (Tier 0, Design: none)
Config + data + i18n nền dùng chung. Tasks (8): config DOWNLOAD_URLS + DOWNLOADS_LIVE + MOBILE_STORE_URLS + MOBILE_LIVE (flags default false, runbook comment) / keys EN **FULL SET** — download + mobile-connect (badges/QR/capabilities/warn G-I) + teaser, CẢ 2 biến thể flag (G-D) / keys VI FULL SET — song song keys EN, draft gate G-D / roadmap-copy-update flag-aware theo G-B (nội dung user duyệt) / docs getting-started note EN+VI (G-E) / Nav+Footer link Download / Faq + ZeroSetup copy đồng bộ theo flag / Lighthouse baseline record (landing + current pages) trước trang mới.
**Key-ownership rule**: SAU SF-1, SF-2/SF-3 KHÔNG thêm key mới vào `src/i18n/landing.ts` — thiếu key = flag lên epic (pattern pre-add story 2).

### SF-2 — /download page + mobile connect component (Tier 1, Depends: SF-1; Design: mock-prototype — design phase CHẠY PRE-LAUNCH)
Design phase (designer agent: 3 hướng HTML → user pick gate → hand-off `docs/superpowers/designs/sf-downloads-direction.md` cover TOÀN BỘ surfaces story) chạy TRƯỚC khi launch dev SF-2/SF-3 — hand-off commit lên nhánh đích; SF-2 tasks bên dưới là dev-only (design tasks của story-2 pattern: đánh dấu done khi bracket remap, hand-off file là bằng chứng).
Tasks (8): route EN / route VI / platform-manual-tabs (manual-first, no-JS fallback) / download-buttons-per-platform (DOWNLOAD_URLS + flag-aware + warn copy G-I) / mobile-connect-block-component (badges + QR flag-gated per G-QR + capabilities per G-C + store links flag-aware per G-A2) / seo-hreflang-canonical / entrance-animations-qua-util / responsive-pass.

### SF-3 — Landing Get Wakii upgrade + mobile teaser (Tier 2, Depends: SF-1 + SF-2 — cần component SF-2 + hand-off chung)
Tasks (9): get-wakii-section-restructure (download primary + source secondary) / wire keys SF-1 / download-cta-flag-aware (G-A/G-H) / nav-cta-repoint-theo-flag (G-H) / mobile-teaser-placement-trên-landing (reuse component SF-2) / anchor-sync (G-F — verify anchor THỰC story 2 để lại trước khi ghi link, không hardcode) / entrance-qua-util (wire-only — motion util có sẵn từ SF-1 story 2, không viết animation mới) / locale-switch-pass / responsive-pass.

### SF-4 — Convergence QA (Tier 3, Depends: SF-3)
Tasks (8, THỨ TỰ chạy đúng liệt kê): 1) vi-copy-gate (G-D — EN+VI, CẢ 2 biến thể flag, user duyệt) → 2) download-link-integrity (mọi URL resolve khi flag=true; flag=false → KHÔNG link nào render — test cả 2 flag groups) → 3) hreflang-locale-audit / 4) reduced-motion-audit / 5) perf-audit (2 mục tiêu: landing ≥ baseline, /download ≥95) / 6) cross-surface-visual-consistency (hand-off chung) / 7) e2e-flow (landing → /download → click platform → mobile block) / 8) release-readiness + flag-flip-runbook-drill (mock flip cả 2 flags → render đúng, copy đúng — CHẠY SAU khi copy-gate pass, không duyệt copy rồi lệch).

**Anti-duplicate check**: SEO/hreflang chỉ SF-2; config/keys chỉ SF-1 (full set, pre-add); entrance-animations viết 1 lần SF-2, SF-3 chỉ wire; responsive pass là acceptance per-surface; mobile component build 1 lần SF-2, SF-3 chỉ placement; flag-variant testing dồn SF-4.

**DAG**: T0=SF-1 → T1=SF-2 → T2=SF-3 → T3=SF-4 (serial — chính xác, không false parallelism; SF-3 tiêu thụ component SF-2).

## Boundary
- KHÔNG đụng workflow story 2 đang chạy — fork sau close.
- KHÔNG sign/notarize, KHÔNG build CI release, KHÔNG store submission, KHÔNG pairing backend (site static), KHÔNG repo app code (repo wakii/wakii — site chỉ link).
- KHÔNG analytics. KHÔNG Linux. KHÔNG account-login pairing.
- Spec khung cứng: decisions + gates + boundary KHÔNG đổi; chi tiết chưa ghi agent tự quyết hợp lý, flag quyết lớn lên epic.
