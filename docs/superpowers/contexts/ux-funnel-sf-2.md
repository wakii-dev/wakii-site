# SF-2 Context Pack — Landing understand-layer + CTA funnel

> Đọc file này THAY VÌ tự tổng hợp từ bracket + epic + comments.
> Epic spec: `docs/superpowers/specs/2026-09-20-ux-funnel-design.md` (rev 2).
> Bracket: `docs/superpowers/brackets/vu9-ux-funnel.md` (epic VU-9).
> Tier 1 — implement theo hand-off `docs/superpowers/designs/ux-funnel-direction.md` (SF-1, binding).

## Spec slice (chỉ phần SF-2 chịu trách nhiệm)

1. **Section understand (D1)** — component mới `src/components/landing/` theo section-component pattern (Hero/Bento/…): trả lời đúng 4 câu bằng copy từ keys `understand` (content-inspection AC1 — 4 câu trả lời NẰM TRONG copy section): Wakii là gì (1 câu) / mở app lên thấy gì đầu tiên (Superpowers panel + team 9 agents) / dành cho ai (dev muốn delegate việc) / thử gì đầu tiên (/superpowers "…"). Plain-for-devs — KHÔNG consumer-speak.
2. **Visual slot (D3)** — thiết kế预留 frame cho 2-4 screenshots. **Lúc start: post GAP comment lên epic** (format: PNG ≥1600px ngang, dark theme, full window không dữ liệu cá nhân). Timeout = hết design phase của SF-2 → fallback mockup stylized (mockups components có sẵn), **KHÔNG BAO GIỜ label là screenshot**. Ảnh thật: tối ưu size + lazy + explicit width/height (CLS) + ≤2 ảnh trên fold-section.
3. **Hero CTA split (D8 PIN)** — hero primary MỚI trỏ `/download` + microcopy "free · open source · unsigned build" (một dòng); **ghost MỚI = build-from-source → REPO_URL** (key mới ADD; hiện ghost là "read the guide" → docs — "read the guide" hạ cấp text-link phụ hoặc gộp theo hand-off); `ctaGhost` GIỮ NGUYÊN (consumer GetWakii:117). **Exit criteria hero-cta-split assert CẢ 3 href**: primary→/download, ghost→REPO_URL, gw-b→docs không đổi. KHÔNG direct-file từ hero (P0 spec-critic — đã đóng).
4. **Insert + anchors** — section chèn qua `Landing.astro` (một dòng, pattern section khác); vị trí theo hand-off (sau Hero, trước Bento là mặc định đề xuất); anchors `#get-wakii` verbatim + mọi anchor khác không che.
5. **EN+VI wire** — consume keys SF-1 đã pre-add; KHÔNG hardcode copy. VI draft render (ACK rule D7 — không block merge).
6. **Motion + a11y + mobile** — data-reveal theo pattern (FI-304 motion-rule re-verify: tag trước initMotion); mobile-390 (breakpoints 980/720); a11y không thụt (contrast, aria, keyboard).

## Touch map (files SF-2 tạo/sở hữu)

```
src/components/landing/Understand.astro (tên theo hand-off) — NEW
src/components/Landing.astro                               — EDIT (insert section)
src/components/landing/Hero.astro                          — EDIT (CTA split)
public/ (screenshots assets nếu owner cung cấp)            — NEW
```
READ-ONLY: src/i18n/* (SF-1 sở hữu keys — chỉ consume), src/components/landing/GetWakii.astro + các section khác (KHÔNG đụng), DownloadPage/MobileConnect (SF-3), config.ts (SF-3), docs/.

## ACCEPTANCE (user-visible)

- Cuộn landing ~5s gặp section mới; đọc copy tự trả lời được 4 câu (content-inspection pass).
- Hero có 2 CTA rõ: download (→ /download, microcopy nhẹ) + build ghost; ≤1 click từ hero tới /download.
- Ảnh trong section: screenshot thật (nếu GAP được đáp ứng) hoặc mockup — nguồn ghi đúng, không mislabel; không vỡ CLS, lazy-load.
- VI page có cùng section (draft copy); EN/VI cùng structure.
- mobile-390 ALL-PASS section mới + hero mới; reveal chạy đúng rule; a11y không regression.

## Boundary (KHÔNG làm)

- KHÔNG đụng GetWakii.astro, Bento, các section khác, Footer, Nav (nav CTA đã đúng từ trước).
- KHÔNG đụng DownloadPage/MobileConnect/config.ts (SF-3).
- KHÔNG hardcode copy (keys only — key gaps → comment epic cho SF-1, không tự thêm vào i18n).
- KHÔNG sửa docs/getting-started; KHÔNG thêm analytics; KHÔNG đổi og:image (out-of-scope).
- Label mockup là "illustration" — KHÔNG "screenshot" khi fallback.
