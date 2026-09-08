# anywhere-labs/dsh-desktop — research digest (batch-3, matrix #46)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: anywhere-labs/dsh-desktop
- facet: misc
- stars @ 2026-09-08: 24429 (probe SF-1) — re-probe cùng ngày bởi SF-5: 24444 (sao tăng trong ngày, hai số đều thật; bài cite 24.444 kèm ngày)
- license (GitHub API 2026-09-08): MIT
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh` + `gh api` trực tiếp của SF-5)

## Ghi chú ground-truth so với briefing

- Pack/matrix gợi ý góc "điều phối agent trên desktop". Thật: repo là **desktop
  client mỏng bọc upstream DeepSeek Harness (DSH)** — Electron host khởi động
  Host chính thức, Host phục vụ Web UI qua carrier HTTP/WebSocket (loopback),
  và toàn bộ hệ sinh thái đi qua **cơ chế plugin Cordis của upstream** —
  "万物皆插件" (mọi thứ là plugin, kể cả desktop). Góc bài viết theo SỰ THẬT:
  desktop-shell-thành-plugin + pin-upstream + kênh stable/beta + quy trình
  build bằng agent (nhánh `codex/*`), không bịa "orchestration" không có.
- README disclaimer: dự án cộng đồng ĐỘC LẬP, không thuộc/không được ủy quyền
  bởi 深度求索 (DeepSeek); contributor hiển thị trên GitHub đến từ lịch sử
  fork-inherit + sync — lưu ý khi đọc Contributors.
- Badge release/stars trong README trỏ `anywhere-labs/deepseek-harness-desktop`
  (tên khác/k.notify cũ) — releases thật nằm trên `dsh-desktop` (đã probe trực
  tiếp), không dùng badge làm nguồn số.

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

### README notes (probe 2026-09-08)

- Desktop client Windows x64 + macOS Universal cho DeepSeek Harness (DSH);
  mô tả repo: "为 DeepSeek Harness (DSH) 插件生态打造的现代化桌面端解决方案。
  万物皆「插件」，桌面本身也是「插件」." MIT, TypeScript, tạo 2026-08-13,
  pushed 2026-09-08, homepage dshdesktop.cn. 24.444★ / 1.182 fork @ 2026-09-08.
- Docs: user-guide / faq / why-desktop / plugin-ecosystem (điều phối sinh thái)
  / plugin-development / architecture; cộng dsh-community-fabric (RFC contract)
  + dsh-community-market (market đang thiết kế, chưa có trang cài).
- Mobile remote control (iOS/Android): badge "即将推出" (sắp ra).

### Architecture (docs/architecture.md, probe 2026-09-08)

- Thin Electron host: Electron main khởi động **Host DSH chính thức**; Host mở
  Web UI qua HTTP/WebSocket carrier **mặc định chỉ loopback** (LAN mở sau xác
  nhận rủi ro). "Desktop 不另造 renderer IPC 插件系统，也不把 Electron API
  暴露给页面" — không tự chế hệ plugin renderer, không expose Electron API.
- Generation: mọi switch profile/mode dispose generation hiện tại; KHÔNG cache
  gì qua generation (service ref, window object, subprocess handle).
- Pin upstream: submodule vendored `deepseek-harness/` giữ pnpm workspace riêng,
  stable lẫn beta **không sửa submodule upstream**; `upstream.json` ghi version
  + commit upstream + manifest runtime vendored cho CẢ HAI kênh.
- Stable/Beta = 2 npm package vật lý + 2 app, KHÔNG phân bằng git branch.
  Update protocol: request mang `X-DSH-Desktop-Channel` + version hiện tại;
  download mang `X-DSH-Desktop-Target-Version`; server PHẢI echo đúng channel +
  version, lệch ⇒ client coi response vô hiệu — không bao giờ tải chéo kênh
  im lặng. Stable chỉ nhận SemVer chính thức, Beta chỉ `-beta.N`.
- Quyết định kiến trúc ghi ADR dạng `.agents/notes/implemented/<area>/<date>-<topic>.md`
  (vd 2026-08-15 pinned-upstream-and-isolated-yarn-workspace).
- docs/plugin-ecosystem.md: 3 nguyên tắc — 组合优先 (compose qua slot/service/
  patch chính thức, không giả định/ghi đè nội bộ plugin khác) · 声明清晰
  (khai báo phụ thuộc, không dựa trùng hợp runtime) · 兼容优先 (upgrade giữ
  backward-compat). Desktop shell = "第一个范例": plugin thường, cùng đường
  compose, không đặc quyền. Fabric capabilities chỉ dùng cho compat/confirm/
  audit — "不会把同进程 JavaScript 伪装成安全沙箱".

### Releases + nhịp (probe 2026-09-08)

- v2.0.5 (2026-09-03, +beta.1 cùng ngày) · v2.0.4 (08-28) · v2.0.3 (08-26) ·
  v2.0.2 (08-21) — 4 stable trong ~2 tuần. Sáng 09-08 merge PR #879
  "release-2.0.6".
- Commit 09-08: #883 fix-market-discover-race, #881 move-data-directory-path-hint,
  #880 813-runtime-blank-watchdog ("recover blank and unresponsive runtime
  pages") — nhánh đề xuất đặt tên `codex/*` = PR do agent Codex soạn.

### Wakii grading (được dùng trong bài)

- DIRECTION — pin-and-wrap vs fork-and-merge: bọc upstream bằng vendored
  submodule + compose qua chính cơ chế plugin của upstream, 0 sửa upstream,
  kèm ADR có ngày. Wakii fork Orca theo merge-sync; nếu ma sát upstream tăng,
  đây là hình thế đối xứng để cân nhắc.
- DIRECTION — channel-echo update protocol (server phải echo đúng channel +
  version; lệch = response vô hiệu, không tải chéo im lặng): khuôn fail-closed
  cho mọi claim kênh cập nhật của Wakii (feed auto-update hiện đọc GitHub
  releases — không có server để echo, nên là DIRECTION chứ không ADOPT).
- WATCH — 24.4k★ < 1 tháng, 4 stable/2 tuần, market + Fabric còn ở mức tài
  liệu/mobile "sắp ra" — quay lại khi contract plugin thành chuẩn chạy được.
- N/A — sponsor dàn trải + api-aggregator marketing trong README: mảng thương
  mại hóa, không đụng bề mặt Wakii.
