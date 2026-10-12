# SF-3 Context Pack — Reading navigation: TOC scrollspy + progress

> Đọc file này THAY VÌ tự tổng hợp từ bracket+epic+comments.
> Epic spec: docs/superpowers/specs/2026-10-12-article-reading-redesign.md
> Epic Linear: FI-63 · Story dest: `story-fi63-article-reading`
> **Tier 1 — worktree tạo từ nhánh đích SAU KHI SF-1 merged. Merge order: SF-2 xong → SF-3.**

## Spec slice (chỉ phần SF-3 chịu trách nhiệm)

1. **(3a) Rewrite BlogToc.astro** — SF-3 OWN component này:
   - variant prop: `rail` (desktop) | `box` (mobile);
   - GIỮ gate ≥3 h2 trong code (240 bài hiện pass; gate cho bài tương lai);
   - landmark aria-label PHÂN BIỆT giữa 2 variant (không duplicate landmark
     cùng tên), labels en+vi NGAY TRONG component (prop hoặc
     `Astro.url.pathname`) — **KHÔNG thêm key vào UI record layout** (P0
     strings rule); aria-label hiện hardcode "toc" tiếng Anh phải được i18n.
2. **(3b) Placement + CSS toggle** — rail instance trong `bd-sidebar` (phía
   TRÊN recent-posts; aside nằm NGOÀI `.prose` → hết xung đột reveal×sticky),
   box instance giữ đầu `.prose`; rail `display:none` ≤800px, box
   `display:none` >800px (breakpoint 800px hiện có; render 2 lần + CSS
   toggle — CSS không reposition được child `.prose` sang aside);
   **rail container max-height `calc(100vh - 96px - margin)` +
   `overflow-y:auto`** — bài 10+ h2 không che mất recent-posts/lang
   switcher; verify short-viewport 375×~700 (P1-5).
3. **(3c) Collapse behavior** — box = details/summary, default COLLAPSED.
4. Scrollspy: IntersectionObserver, mục đang đọc `.aria-current` +
   highlight style; KHÔNG color-only (SR đọc được).
5. Progress bar: fixed-top, mỏng (2-3px), transform-only (scaleX), giảm
   reflow; aria-hidden (decorative — progress redundant cho SR); offset
   dưới site-nav 58px; reduced-motion an toàn (early-return pattern như
   initMotion).
6. Back-to-top: floating button, hiện khi cuộn quá ~1 màn hình; no-JS ẩn.
7. Mobile TOC không bị revealChildren tag: **edit call-site selector trong
   layout `<script>` block — `revealChildren(article, '.prose > *:not(...)')`
   — dòng này THUỘC REGION SF-3** (motion.ts vẫn locked — P1 plan-critic).
8. No-JS static fallback: TOC anchor links hoạt động sẵn (chỉ mất
   scrollspy/progress/back-to-top — additive enhancement, accepted).
9. Pager polish: category + date trên pager links (trace: user chọn
   "Tiến độ đọc" có "pager cải tiến"); **giữ pager semantics prev=cũ hơn /
   next=mới hơn** (BlogDetailLayout ~dòng 140-143).
10. Verify + merge (gate: behavior đầu-cuối + `npm run build` xanh) —
    merge sau SF-2 (merge order pinned).

## Touch map (files SF-3 tạo/sở hữu)

```
src/components/BlogToc.astro         ← SF-3 SỞ HỦU (rewrite)
src/layouts/BlogDetailLayout.astro   ← ADDITIVE theo region:
                                        · aside (TOC rail placement)
                                        · đầu .prose (mobile box giữ chỗ)
                                        · fixed chrome (progress/back-to-top)
                                        · pager region (polish)
                                        · 1 dòng revealChildren selector
                                          trong <script> block
                                        · script import reading-nav
                                        (KHÔNG sửa declaration SF-1)
src/scripts/blog/reading-nav.ts (hoặc colocated tương đương)
                                        ← SF-3 SỞ HỮU, SF-2 KHÔNG đụng
src/styles/tokens.css, src/components/motion.ts, src/layouts/Base.astro
                                        ← READ-ONLY / CẤM ĐỤNG
```

## ACCEPTANCE (user-visible)

- Đọc bài dài trên desktop: thấy TOC trong rail trái (trên danh sách bài
  mới), cuộn xuống mục nào thì mục đó highlight theo; TOC không che mất
  danh sách bài + lang switcher ở bài 10+ h2 (rail tự cuộn).
- Thanh tiến độ mỏng trên đầu trang chạy theo cuộn; nút "về đầu" hiện khi
  cuộn xa, bấm về đầu trang.
- Mobile 375px: TOC là box collapse ở đầu bài (mặc định đóng, mở ra được);
  KHÔNG có 2 TOC cùng lúc (desktop chỉ rail, mobile chỉ box).
- Chỉ bàn phím: mục TOC focusable, Enter nhảy đúng section.
- Reduced-motion: progress/scrollspy vẫn hoạt động (không phải animation
  trang trí) nhưng không có hiệu ứng chuyển động; no-JS: TOC tĩnh vẫn
  link đúng, trang đọc được.
- Pager hiển thị category + date; prev vẫn là bài CŨ hơn, next MỚI hơn.

## Boundary (KHÔNG làm)

- KHÔNG sửa motion.ts (chỉ call-site selector trong layout script).
- KHÔNG sửa declaration SF-1 (additive-only).
- KHÔNG đụng module code-enhancements của SF-2, pre/copy styles, after-CTA,
  FollowBlock (SF-4 — giữa related và after-CTA, cách pager ~20 dòng).
- KHÔNG đổi grid `.bd-shell` (rail dùng aside hiện có).
- KHÔNG đụng Base.astro / content schema / UI record layout.
- KHÔNG đụng BlogShell/DocsLayout (TOC blog-only).
