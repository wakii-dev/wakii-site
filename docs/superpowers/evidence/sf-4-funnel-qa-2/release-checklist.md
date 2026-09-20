# Release checklist + report card — VU-9 UX funnel (SF-4 convergence QA)

> dist build dest @ `cd0346e` (774b263 + F1 fix af5d5b9) · 267 pages · check:og PASS
> Ngày 2026-09-20. Audit-only SF-4 — mọi gate chi tiết trong `funnel-crawl-report.md`, `perf-budget.md`, `a11y-report.md`, `shots/`.

## A. Gate tổng hợp SF-4

| Gate | Kết quả | Evidence |
|---|---|---|
| Funnel chain hero→/download ≤1 click | PASS (click thật EN+VI) | flow-report.md · shots |
| /download → installer ≤2 click tổng | PASS (nút = 1 click thẳng file GitHub) | funnel-crawl C2 |
| Không link chết trong chain | PASS SAU FIX F1 (28 PASS · 0 FAIL) | funnel-crawl-report.md |
| AC1 — 4 câu trong copy section | PASS EN+VI | funnel-crawl C9 + rm-m390/rm-d1440 shots |
| Version consistency GetWakii ↔ /download | PASS — mọi version string = v1.4.213 (0 stale) | funnel-crawl C3 |
| first-run → docs liền mạch | PASS (click thật → "Getting started"/"Bắt đầu") | flow-report.md |
| Anchors (#get-wakii, nav, footer) | PASS | funnel-crawl C6 |
| Blog CTA → /download (5 posts × 2 locale) | PASS | funnel-crawl C7 |
| VI parity + ACK-or-default | PASS rendered; ACK = ship-draft (xử lý bên dưới) | funnel-crawl C9 + epic comment |
| mobile-390 sweep 2 pages × 2 locale | ALL-PASS (overflow 4/4 + 12 shots) | shots/m390-*, ov-* |
| Perf budget (AC7 protocol PIN) | **PASS** — warm 100=100 (delta +0.0, ≥90 ✓, ±5 ✓); cold = floor máy hit cả 2 phía (88/88.5, 91=91); CLS 0 · TBT 0 | perf-budget.md |
| A11y sweep | **PASS, KHÔNG tụt** — landing **92** (base 90, tăng), download 90 (=base, systemic cap); aria-current ✓ · focus ring ✓ · reduced-motion path ✓ | perf-budget.md (bảng a11y) + flow-visual-a11y-report.md §4 |
| Meta/OG consistency | PASS (canonical/hreflang/desc/og/twitter 4 pages) | funnel-crawl C8 |

## B. Phát hiện trong run (fix đã land / đang xử lý)

- **F1 (ĐÃ FIX)** — understand moreDocs `/docs/` + `/vi/docs/` → 404. Fix-task coordinator: `af5d5b9` (href→getting-started + labels EN/VI), merge `cd0346e` trên dest. Re-crawl: 0 dead link.
- **Reveal-on-scroll opacity (KHÔNG phải bug)** — `bxreveal` animation clock đóng băng trong webview occluded (playState running, currentTime=0); tab foreground user thật chạy 0.55s bình thường. Đã verify code path (motion.ts IO + FI-304 cleanup) + render thật bằng reduced-motion path. **Owner nên liếc xác nhận reveal trên tab foreground khi test thật.**

## C. Owner manual steps (TRƯỚC KHI DEPLOY)

1. **Merge main** — `story/vu9-ux-funnel` → `main` (human gate, sau khi 4/4 SF Done).
2. **Deploy tay**: `npx vercel deploy --prod --scope 1foxglobal --yes` (CD-on-push chưa bật — VERCEL_TOKEN chưa set; login vuhoi).
3. **Domain wakii.xyz** — nếu chưa add: runbook `docs/knowledge/runbooks/link-preview-domain.md` (canonical hiện trỏ `https://wakii.xyz/` — trang sống khi domain active).
4. **README re-pin version** — release checklist epic: bump pin khi có release mới = 2 dòng URL `src/config.ts` + README deployment + orca README (owner manual, ngoài repo). Hiện build tự fetch releases/latest (source=fetched v1.4.213) + pin fallback — không cần re-pin thủ công trừ khi GitHub API block.
5. **Screenshots thật cho slot** (SF-2/3 GAP) — owner chụp 2-4 ảnh: (a) superpowers panel sau lần mở đầu (understand q2), (b) bracket canvas / story view (understand q3), (c) main window (download page). Đang là placeholder frame có label trung thực — khôngclaim screenshot thật.
6. **orca README** (repo wakii, ngoài site) — phần install hướng dẫn khớp wording mới nếu cần.

## D. Report card — test thật cho owner (5 phút)

Share/landing/download trên mobile + desktop:

| # | Thử gì | Kỳ vọng |
|---|---|---|
| 1 | Mở `wakii.xyz` (hoặc prod URL), cuộn 5s | Hiểu 4 câu: Wakii là gì / mở lên thấy gì / dành cho ai / thử gì đầu |
| 2 | Click nút xanh hero "download wakii" | Đến `/download`, không qua bước nào khác |
| 3 | Nhìn khối macOS | Nút to "apple silicon" + ghost "mac with intel" + chip "→ FOR YOUR MACHINE" (theo OS thật) |
| 4 | Click nút tải chính | File .dmg tải về (v1.4.213), tên file khớp |
| 5 | Nhìn version rail bên phải | v1.4.213 · latest · release notes link |
| 6 | Đọc dòng vàng cuối khối | Warn "unsigned build — Open Anyway" (honest) |
| 7 | Cuối trang download → first-run strip | 3 bước sau cài + link "read getting-started" |
| 8 | Click link đó | `/docs/getting-started/` mở, không 404 |
| 9 | Quay landing, đổi VI (góc trên phải) | Toàn bộ copy VI (hero, 4 câu, download) — không còn tiếng EN lạc |
| 10 | Thu hẹp cửa sổ ~390px (mobile) | Không tràn ngang, nút full-width, dễ bấm |
| 11 | Share link landing vào Slack/Zalo (optional) | OG card đúng (đã check:og 267 pages) |
| 12 | Tab foreground: cuộn tới section 4 câu | Các khối hiện dần (reveal 0.55s) — mục B.2 |

## E. ACK-or-default (D7) — VI copy

- Landing VI: mirrors đầy đủ keys mới (hero cta-split + understand 36 keys) — ship từ SF-2.
- Downloads VI (nhóm `upgrade` SF-1/SF-3): VI là draft theo store header — **decision tại convergence gate này: SHIP-DRAFT (default theo D7 — owner không ACK trong thời gian story; không bao giờ chờ)**. Ghi epic VU-9. Owner vẫn có thể fine-tune copy VI sau — additive, không block funnel.
