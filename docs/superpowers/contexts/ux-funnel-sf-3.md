# SF-3 Context Pack — Download page upgrade

> Đọc file này THAY VÌ tự tổng hợp từ bracket + epic + comments.
> Epic spec: `docs/superpowers/specs/2026-09-20-ux-funnel-design.md` (rev 2).
> Bracket: `docs/superpowers/brackets/vu9-ux-funnel.md` (epic VU-9).
> Tier 1 — implement theo hand-off `docs/superpowers/designs/ux-funnel-direction.md` (SF-1, binding).

## Spec slice (chỉ phần SF-3 chịu trách nhiệm)

1. **Version resolution (D5)** — module resolution build-time: fetch GitHub API `releases/latest` (timeout ~3s, 1 call/build; unauth 60/hr đủ). **Per-asset validation**: constructed URL (tag strip leading `v` → `Wakii-1.4.213-arm64.dmg` pattern) phải match asset trong CÙNG response; thiếu/rename → fallback pinned URL cho OS đó; pinned cũng thiếu → ẩn nút + honest soon (không bao giờ advertise 404). Fetch fail → toàn bộ fallback pinned. **Artifact**: resolved version + fetched-at + URLs ghi `release-meta.json` (dist hoặc nguồn sinh) — verifier kiểm internal consistency, KHÔNG so live. **Consumers-rewire (P0 plan-critic)**: GetWakii meta-line (đang derive từ DOWNLOAD_URLS) + MobileConnect QR (đang encode pinned android URL) → consume resolved module; **exit: grep direct consumers DOWNLOAD_URLS/MOBILE_STORE_URLS ngoài module = 0**. README.md deployment section: wording mô tả cơ chế fetch (KHÔNG re-pin số). **orca README ngoài repo → OWNER manual step trong release checklist (SF-4), KHÔNG phải task ở đây.**
2. **OS-detect PE (D6)** — script enhancement DUY NHẤT trên DownloadPage. **Contract amend gồm 3 nhóm comment**: (a) motion ("shared util + một PE script duy nhất với no-JS fallback"); (b) accuracy-gates dòng 12-18 ("version pill NOT rendered / no release data source" → cập nhật theo D5); (c) 2 design-binding comments (DownloadPage:5-6, GetWakii:4-5 trỏ `sf-downloads-direction.md`) → trỏ hand-off `ux-funnel-direction.md` mới. Chạy CUỐI (sau mọi task khác đụng DownloadPage). Highlight rule: OS-row (macOS visitor → macOS cell; Windows → Windows; Android → Android badge; Linux/unknown → không gì); trong macOS cell KHÔNG arch-highlight (2 nút đồng trọng lượng, arm64 trước); cue non-color: `aria-current="true"` + chip "→ cho máy bạn"; KHÔNG ẩn/đổi thứ tự nút; no-JS = tất cả nút hiện bình thường. Không fingerprinting ngoài navigator.platform/userAgentData.
2b. **Serialization PIN**: `layout-restructure-spine` là backbone — arch-buttons, os-detect-pe, first-run-strip chạy TUẦN TỰ sau nó (cùng file DownloadPage.astro — chống worker race); contract-amend CUỐI cùng.
3. **macOS arch buttons** — Apple silicon (arm64) + Intel (x64) — cả hai từ resolved data; labels theo keys.
4. **First-run strip (AC5)** — 3 bước đầu sau cài (mở app → team có sẵn → thử /superpowers) → link `/docs/getting-started/` (KHÔNG sửa docs). Keys từ SF-1.
5. **Layout restructure** — quanh 1 primary action theo hand-off; G-I unsigned-warn GIỮ ở mọi nút download sống; Nightly/MobileConnect/iOS-soon/build-from-source cells giữ logic flags (G-QR, G-A2) — chỉ re-position/nhóm theo hand-off.
6. **EN+VI wire + gates** — consume keys SF-1; accuracy recheck: version chỉ render khi có resolved/pinned (không fake), iOS honest, mobile accuracy.

## Touch map (files SF-3 tạo/sở hữu)

```
src/components/download/DownloadPage.astro    — EDIT (layout spine, cells, strip, PE script mount)
src/components/download/MobileConnect.astro   — EDIT (consumers-rewire: QR consume resolved URL — G-QR logic giữ)
src/components/landing/GetWakii.astro         — EDIT (consumers-rewire: meta-line consume resolved module)
src/config.ts                                 — EDIT (LATEST_RELEASE fallback pin + asset matrix; DOWNLOAD_URLS giữ làm fallback)
scripts/ hoặc src/utils/ release-resolution   — NEW (module + build fetch)
README.md                                     — EDIT (deployment section wording = cơ chế fetch)
```
READ-ONLY: src/i18n/* (SF-1 keys), landing components (SF-2), docs/, layouts/Base.astro (og contract pinned).

## ACCEPTANCE (user-visible)

- /download hiện version + release date thật, khớp `release-meta.json` artifact của build.
- macOS cell: 2 nút arch (arm64 trước); Windows nút riêng; Android QR + badge; OS-detect highlight đúng rule (aria-current + chip), không ẩn nút nào; tắt JS vẫn đầy đủ nút.
- ≤1 click từ /download tới installer file đúng OS/arch.
- Strip "3 bước đầu sau cài" thấy được → click ra getting-started.
- G-I warn trên mọi nút download; accuracy gates mới nhất quán trong comments.
- mobile-390 ALL-PASS; VI page đủ keys mới.

## Boundary (KHÔNG làm)

- KHÔNG đụng landing components/Hero/Landing.astro (SF-2).
- KHÔNG hardcode copy; KHÔNG tự thêm keys (gap → epic comment cho SF-1).
- KHÔNG render version khi cả resolved lẫn pinned đều không có (accuracy).
- KHÔNG đổi docs/getting-started nội dung; KHÔNG thêm analytics.
- KHÔNG đụng Base.astro og contract; KHÔNG đổi flag semantics DOWNLOADS_LIVE/MOBILE_LIVE (roadmap G-B phụ thuộc).
