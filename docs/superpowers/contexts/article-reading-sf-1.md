# SF-1 Context Pack — Prose foundation: typography + measure + tables

> Đọc file này THAY VÌ tự tổng hợp từ bracket+epic+comments.
> Epic spec: docs/superpowers/specs/2026-10-12-article-reading-redesign.md
> Epic Linear: FI-63 · Story dest: `story-fi63-article-reading`

## Spec slice (chỉ phần SF-1 chịu trách nhiệm)

1. Reading measure áp dụng CHO `.prose` thôi: max-width ~68ch; h1/meta/
   hero/related/pager giữ full article-column width (hero 1200×630 không co)
   — chấp nhận right-edge mismatch như editorial convention (P1-4).
2. Typography scale: base 15→16px, line-height 1.75, heading scale h2/h3,
   spacing rhythm. **Weights ⊆ {400, 500}** — Inter chỉ load 2 weight này
   (Base.astro:120-123). Set explicit heading weights CHẤM DỨT faux-bold
   hiện tại (`.prose h2` hiện không có font-weight → browser default 700
   trên font không có weight 700). Đụng Base font URL = out-of-scope,
   KHÔNG flag mid-run (P1-8).
3. Port table/th/td styles từ `src/layouts/DocsLayout.astro:263-281` vào
   prose region của BlogDetailLayout (IN-PLACE — DocsLayout READ-ONLY,
   không tách shared layer — Direction A, D5).
4. Table mobile overflow CSS-ONLY: `table { display:block; overflow-x:auto }`
   — KHÔNG cần wrapper element (wrapper cần JS/rehype — đều bị cấm).
   ~70 bài/locale có bảng; hiện KHÔNG có rule nào cho `.prose table`.
5. Blockquote/callout treatment (accent border + tint theo tokens).
6. Inline code + pre tuning (size/contrast).
7. Image treatment trong prose (radius/border đồng bộ hero).
8. EN/VI parity pass (dấu tiếng Việt, line-height với diacritics).
9. Regression check JSON-LD/og — KHÔNG đụng Base.astro.
10. Verify + merge. Gate: behavior đầu-cuối + `npm run build` xanh trong
    worktree SF.

## Touch map (files SF-1 tạo/sở hữu)

```
src/layouts/BlogDetailLayout.astro   ← SỞ HỮU region prose styles
                                        (:global(.prose ...) ~dòng 466-543)
                                        + có thể grid/bd-shell padding nếu
                                        measure cần — additive
src/styles/tokens.css                ← READ-ONLY (token source of truth)
src/layouts/DocsLayout.astro         ← READ-ONLY (chỉ copy table styles từ đây)
src/layouts/Base.astro               ← READ-ONLY / CẤM ĐỤNG (og pin FI-339 rev 2)
src/components/motion.ts             ← READ-ONLY (FI-349 boundary, 8 consumers)
```
SF-1 merge XONG thì ownership prose styles chuyển sang "additive-only" cho
tier-1: SF-2/3/4 được THÊM rule mới nhưng không được sửa/xóa declaration
của SF-1.

## ACCEPTANCE (user-visible)

- Mở bất kỳ bài blog (EN hoặc VI): cột chữ hẹp vừa mắt (~65-72ch), chữ base
  ≥16px, line-height ≥1.7 — đọc dài không mỏi mắt.
- Bài có bảng: bảng render có header border + cell padding cả desktop; ở
  375px bảng cuộn ngang trong phạm vi cột, KHÔNG tràn màn hình.
- Blockquote có viền accent + nền tint; ảnh trong bài bo góc/đồng bộ hero.
- Không có heading nào render faux-bold (weight 700 giả trên Inter 400/500).
- VI + EN nhìn đồng nhất; `npm run build` xanh (parity/utils/content/og).

## Boundary (KHÔNG làm)

- KHÔNG tách shared prose layer / KHÔNG đụng DocsLayout (defer follow-up).
- KHÔNG đụng: Base.astro (cả font URL), motion.ts, content schema,
  listing/category pages, thin routes, markdown pipeline config.
- KHÔNG làm code block UX / anchors (SF-2), TOC/progress (SF-3), follow
  (SF-4) — kể cả "tiện tay": flag, không code.
- KHÔNG thêm key vào UI record của layout (SF-1 không cần strings mới).
