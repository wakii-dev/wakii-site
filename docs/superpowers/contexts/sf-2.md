# Context Pack — SF-2 Landing EN+VI (FI-291)

## Spec slice
Landing 6 sections theo spec mục 4 + direction `docs/superpowers/designs/sf1-direction.md`.
EN authored trước (source of truth), VI dịch từ EN đã duyệt. Quickstart + FAQ là
TEASER link sâu sang docs theo slug contract của SF-1 — copy đầy đủ chỉ tồn tại
ở docs. `REPO_URL` constant của SF-1 là nguồn CTA hero.

## Touch map
- `src/pages/index.astro` + `src/pages/vi/index.astro` (hoặc content-driven tương đương)
- Components mới trong `src/components/landing/`; CONSUME tokens.css — KHÔNG sửa tokens (edits → SF-4)
- Copy: 1 nguồn (content collection hoặc i18n dict) map 2 locales

## ACCEPTANCE (user-visible)
1. Landing render đủ 6 sections đúng thứ tự cả EN/VI, mono/mint theo direction
2. Features grid 6 thẻ map đúng feature inventory (re-confirmed cuối SF-1) — pass accuracy guard: KHÔNG "Stories tab"
3. Zero-setup strip claim khớp kết quả kit-license verify của SF-1
4. CTA "Get Wakii" trỏ REPO_URL; "Read the guide" → /docs/getting-started (đúng slug contract)
5. Teaser quickstart/FAQ link đúng contract; VI translation đầy đủ 6 sections

## Boundary
- KHÔNG sửa tokens.css / layout / i18n config (SF-1 sở hữu)
- KHÔNG tạo/sửa docs pages (SF-3 sở hữu) — chỉ link
- KHÔNG QA toàn site (SF-4)
