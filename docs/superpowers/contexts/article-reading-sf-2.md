# SF-2 Context Pack — Code block UX + heading anchors

> Đọc file này THAY VÌ tự tổng hợp từ bracket+epic+comments.
> Epic spec: docs/superpowers/specs/2026-10-12-article-reading-redesign.md
> Epic Linear: FI-63 · Story dest: `story-fi63-article-reading`
> **Tier 1 — worktree tạo từ nhánh đích SAU KHI SF-1 merged. Merge order: SF-2 ĐẦU TIÊN.**

## Spec slice (chỉ phần SF-2 chịu trách nhiệm)

1. PROBE đầu tiên: build 1 lần (`npm run build` hoặc `astro build`), mở
   `dist/blog/<slug>/index.html`, verify `<pre data-language="...">` có
   tồn tại trong shiki output. Có → label CSS-only
   (`pre[data-language]::before { content: attr(data-language) }`).
   Không → decode từ `code.language-*` class.
2. Language label trên mỗi code block (theo probe ở mục 1).
3. Copy button + enhancement script — module RIÊNG của SF-2
   (`code-enhancements`, colocated script trong component/layout region
   SF-2). Progressive enhancement: script gắn nút vào DOM (no-JS = không
   có nút, code vẫn đọc/chéo tay được).
4. Copy feedback ✓: bấm → icon/text đổi ✓ ~2s; aria-live hoặc text swap
   (SR nghe được).
5. Keyboard a11y: nút focusable, focus-visible style, Enter/Space hoạt động.
6. i18n aria labels: dict en/vi NGAY TRONG module SF-2, locale qua
   `document.documentElement.lang` (Base.astro:77 render `<html lang>`).
   **KHÔNG thêm key vào UI record của layout** (P0 strings rule).
7. Heading anchor link h2/h3 — **JS-injected DOM decoration** (`<Content />`
   opaque + markdown pipeline cấm đổi → đây là cơ chế DUY NHẤT): chèn
   `<a>` focusable vào mỗi h2/h3, hiện on hover + focus (KHÔNG hover-only),
   bấm copy URL section (hoặc update hash — quyết trong task, ghi notes).
   No-JS degradation = heading trơn — ACCEPTED (P0-3).
8. Anchor a11y + i18n aria-label ("Link to this section" / tiếng Việt).
9. PROBE VI heading id sanity: mở 1 bài VI có dấu trong heading (vd
   "## Wakii học được gì"), verify id sinh ra sạch (slug không vỡ) —
   slug↔id đã đảm bảo bởi pipeline (BlogToc đang link trên VI pages),
   probe này chỉ sanity cho anchor links.
10. Verify + merge (gate: behavior đầu-cuối + `npm run build` xanh) —
    merge vào nhánh đích ĐẦU TIÊN trong tier (merge order pinned).

## Touch map (files SF-2 tạo/sở hữu)

```
src/layouts/BlogDetailLayout.astro   ← ADDITIVE: 1 script import/tag +
                                        style label/copy trong pre region
                                        (KHÔNG sửa declaration SF-1)
src/scripts/blog/code-enhancements.ts (hoặc colocated .ts tương đương)
                                        ← SF-2 SỞ HỮU, SF-3 KHÔNG đụng
src/styles/tokens.css                ← READ-ONLY
src/components/motion.ts             ← READ-ONLY (locked, 8 consumers)
src/layouts/Base.astro               ← CẤM ĐỤNG
dist/ (chỉ đọc khi probe)            ← build artifact, KHÔNG commit
```

## ACCEPTANCE (user-visible)

- Mở bài có code (vd deep-dive-anthropics-claude-code): mỗi code block có
  nhãn ngôn ngữ (bash/ts/...) và nút copy; bấm copy → thật sự vào clipboard,
  nút hiện ✓ rồi trở lại.
- Chỉ dùng bàn phím: Tab tới nút copy thấy focus ring, Enter copy được.
- Di chuột (hoặc Tab) tới h2/h3: hiện icon link; bấm → URL có hash section;
  mở URL mới đúng section (nếu chọn hash approach) — ghi quyết định trong
  task notes.
- Tắt JS (hoặc view-source tĩnh): heading trơn, không nút lỗi, không layout
  vỡ; bảng/ngôn ngữ vẫn đọc được (label CSS-only vẫn hiện nếu probe chọn
  CSS path).
- EN + VI labels đúng ngôn ngữ trang.

## Boundary (KHÔNG làm)

- KHÔNG đổi markdown/shiki config (astro.config.mjs) — probe-only.
- KHÔNG sửa declaration SF-1 trong prose region (additive-only).
- KHÔNG đụng module reading-nav của SF-3, aside, pager, after-CTA.
- KHÔNG đụng Base.astro / motion.ts / content schema / UI record layout.
- KHÔNG làm scrollspy/TOC/progress (SF-3) dù anchor ids phục vụ nó —
  SF-3 KHÔNG phụ thuộc SF-2 (slug↔id đảm bảo bởi pipeline).
