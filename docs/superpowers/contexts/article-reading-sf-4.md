# SF-4 Context Pack — Follow surface: RSS + subscription affordances

> Đọc file này THAY VÌ tự tổng hợp từ bracket+epic+comments.
> Epic spec: docs/superpowers/specs/2026-10-12-article-reading-redesign.md
> Epic Linear: FI-63 · Story dest: `story-fi63-article-reading`
> **Tier 1 — worktree tạo từ nhánh đích SAU KHI SF-1 merged. Merge order: CUỐI (SF-2 → SF-3 → SF-4).**

## Spec slice (chỉ phần SF-4 chịu trách nhiệm)

1. FollowBlock component MỚI — đặt GIỮA related và after-CTA (điểm
   kết-thúc-đọc, chuyển đổi follow). Placement ~dòng 219-220 của
   layout hiện tại (giữa `bd-related` section và `bd-after` div).
2. Nội dung khối: link RSS feed (`/rss.xml` — feed ĐÃ TỒN TẠI:
   `src/pages/rss.xml.js` + autodiscovery `Base.astro:113` — KHÔNG tạo
   feed mới, KHÔNG đụng Base) + nút copy feed URL.
3. Copy feed URL button: clipboard API, feedback ✓; **no-JS fallback =
   link `/rss.xml` thấy sẵn** (button là enhancement, link luôn có).
4. i18n strings MỚI NGAY TRONG FollowBlock.astro (en+vi) — **KHÔNG thêm
   key vào UI record layout** (P0 strings rule); KHÔNG tái dùng chuỗi rail
   `rssFeed: 'rss feed →'` (ngữ cảnh khác); giọng điệu tham khảo
   `src/components/blog/strings.ts`.
5. Style theo tokens (bento, accent mint, mono display) — đồng bộ với
   after-CTA liền kề nhưng phân biệt rõ (đây là follow, không phải CTA mua).
6. a11y: aria-label cho copy feedback; link RSS có accessible name rõ.
7. og/JSON-LD unaffected check: FollowBlock nằm trong BODY — verify
   không đụng Base/head (chạy `npm run check:og` đủ).
8. Verify + merge (gate: behavior đầu-cuối + `npm run build` xanh) —
   merge CUỐI tier (SF-2 → SF-3 → SF-4).

## Touch map (files SF-4 tạo/sở hữu)

```
src/components/blog/FollowBlock.astro (MỚI) ← SF-4 SỞ HỮU toàn bộ
src/layouts/BlogDetailLayout.astro   ← ADDITIVE: 1 import + 1 placement
                                        giữa related và after-CTA
                                        (KHÔNG sửa declaration SF-1,
                                        KHÔNG đụng aside/pager/.prose)
src/pages/rss.xml.js                 ← READ-ONLY (feed đã đúng)
src/layouts/Base.astro               ← CẤM ĐỤNG (autodiscovery đã có :113)
src/components/blog/strings.ts       ← READ-ONLY (tham khảo giọng điệu)
src/styles/tokens.css, motion.ts     ← READ-ONLY
```

## ACCEPTANCE (user-visible)

- Đọc xong một bài (EN hoặc VI): thấy khối follow rõ ràng giữa "Related
  posts" và khối CTA — có đường link RSS feed thật (bấm mở /rss.xml) và
  nút copy feed URL (bấm → ✓, URL vào clipboard).
- Mobile 375px: khối không vỡ layout, nằm gọn giữa related và CTA.
- Tắt JS: link RSS vẫn thấy + bấm được (chỉ mất nút copy).
- EN + VI copy đúng ngôn ngữ trang; SR nghe được label của link + feedback.

## Boundary (KHÔNG làm)

- KHÔNG tạo feed mới / đổi format feed / đụng rss.xml.js logic.
- KHÔNG đụng Base.astro (autodiscovery đã có) — follow block là BODY affordance.
- KHÔNG làm email/newsletter (cần backend — MUST-NOT).
- KHÔNG đụng listing rail (BlogShell) — article page only.
- KHÔNG sửa declaration SF-1, module SF-2/SF-3, aside, pager.
- KHÔNG thêm UI strings vào layout UI record.
