# Flow walkthrough + visual + a11y — SF-4 convergence QA (VU-13)

> 2026-09-20 · build dest @ `cd0346e` · preview `:4401` · orca browser (real webview, trusted input) + headless Chrome 1440 (real pixels)

## 1. FLOW — Tier 3 (chuẩn đo, click thật 2 locale)

### EN
| Bước | Hành động | Kết quả |
|---|---|---|
| 1 | Mở `/` | landing render ✓ |
| 2 | CLICK ref thật `download wakii` (hero primary, e37) | navigate → **`/download`** ✓ (≤1 click) |
| 3 | Đo tại `/download` | v1.4.213 ✓ · aria-current OS chip ✓ · 4 installer btns ✓ · first-run link ✓ |
| 4 | CLICK `read getting-started` (first-run strip, sau scroll vào viewport) | navigate → **`/docs/getting-started/`** "Getting started" ✓ |
| 5 | Console | **0 errors / 0 warnings** |

### VI
| Bước | Hành động | Kết quả |
|---|---|---|
| 1 | Mở `/vi/` | landing VI render ✓ |
| 2 | CLICK `tải wakii` (hero primary VI) | navigate → **`/vi/download`** ✓ |
| 3 | CLICK `đọc getting-started` (first-run strip VI) | navigate → **`/vi/docs/getting-started/`** "Bắt đầu" ✓ |
| 4 | Console (chuỗi VI) | **0 errors / 0 warnings** |

Gotcha ghi nhận: click link ngoài viewport = silent no-op (đã biết) — xử lý bằng scrollIntoView trước rồi click lại.

## 2. VISUAL — Tier 2 (real pixels, headless Chrome)

Desktop 1440×900 (top-of-page, animation chạy trong virtual-time OK):
- `shots/desktop-landing-en.png` — hero CTA split (primary xanh `download wakii` + ghost `build from source`) + microcopy + terminal mockup ✓
- `shots/desktop-landing-vi.png` — mirror VI đầy đủ ✓
- `shots/desktop-download-en.png` — v1.4.213 pill + version rail + arm64 btn-xl + x64 ghost + OS chip + G-I warn vàng + placeholder frame trung thực ✓
- `shots/desktop-download-vi.png` — mirror VI ("CHO MÁY BẠN", "KHUYÊN DÙNG · ĐA SỐ MAC", "phiên bản/mới nhất") ✓

Mobile-390 (iframe probe same-origin `dist/_probe390/`, window 390 clamp gotcha):
- Top views 4 trang: `shots/m390-{landing,download}-{en,vi}-top.png` — stack đúng, nút full-width, không vỡ ✓
- Overflow đo máy (scrollWidth + wide-elem scan @390): **4/4 PASS** — `scrollWidth=375, wideElems=0` mọi trang
- Section views: `shots/rm-*.png` (reduced-motion path — xem §3) — understand q1-q4 + first-run strip render đẹp cả EN lẫn VI ✓

## 3. Reveal-on-scroll — artifact automation, KHÔNG phải bug

- Hiện tượng: screenshot headless trang bị đen ở section ngoài viewport đầu.
- Root cause đo được (orca browser eval): `bxreveal` playState=`running` nhưng `currentTime` kẹt **0** qua 4s wall-clock → webview occluded đóng băng animation clock → `animationend` không fire → `.reveal-in` giữ opacity 0. Cùng class gotcha với "smooth-scroll đóng băng webview" (memory).
- Code path verify: motion.ts IO threshold 0.15 + stagger 60ms + `animationend` dọn class+attr (contract FI-304) — đúng; các element trong viewport đầu reveal hoàn tất trong shots (hero/stats opacity 1).
- Visual thay thế: `--force-prefers-reduced-motion` = mode tĩnh chính thức của page (initMotion exit sớm, không opacity:0) → ảnh thật của layout (shots/rm-*).
- **Còn lại cho owner**: liếc xác nhận reveal 0.55s trên tab foreground (report card #12).

## 4. A11y sweep

| Kiểm | Kết quả |
|---|---|
| OS-detect highlight | `aria-current="true"` đúng 1/trang download (EN+VI) + text chip "→ FOR YOUR MACHINE / CHO MÁY BẠN" ✓ |
| Keyboard focus nút tải | `.focus()` nhận + outline UA `auto 3px` còn nguyên (không bị xoá outline) ✓ |
| Reduced-motion path | render đầy đủ static (shots rm-*) — hợp đồng motion.css `html.anim` gate ✓ |
| Lighthouse a11y | landing dest **92** (base 90 — tăng), /download 90 (=base) — chi tiết perf-budget.md §A11y |
| Contrast/cap | Lighthouse a11y ~90 = systemic cap đã biết (không tụt thêm) |
