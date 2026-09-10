---
title: "ADR-0006: Matrix CHỐT CỨNG per batch — slug lock"
date: 2026-09-10
updated: 2026-09-10
status: accepted
visibility: internal
confidence: high
sources: [docs/superpowers/specs/2026-09-08-blog-batch2-design.md, docs/superpowers/editorial/2026-blog-longform/runbook.md]
tags: [matrix, editorial-pipeline, slug-lock, freeze]
type: adr
---

# ADR-0006: Matrix CHỐT CỨNG per batch — slug lock

## Status

accepted

## Date

2026-09-10

## Bối cảnh (Context)

Mỗi batch blog cần danh sách bài biết trước để: gán pubDate lịch đăng, chia
việc cho các SF song song, và cho lint/audit derive scope (ADR-0001). Nếu
danh sách chỉ là "~44-55 bài, xem lúc viết" thì không thể đồng thời: lịch
đăng (cần ngày cụ thể), lint manifest (cần danh sách cụ thể), và convergence
audit (cần biết thiếu bài nào). Đếm "ước lượng" cũng giấu sai lệch: ước "~55"
khi facet cộng tối đa 44 là tự dối số (P0 review batch-2 đã bắt đúng điều này).

## Quyết định (Decision)

Mỗi batch có **một bảng topic-matrix CHỐT CỨNG** commit trước khi viết: slug
+ category + pubDate + evidence + docs-link + tags + angle, từng row là hợp
đồng của một bài. Batch-2 (FI-373): "44 slug CHỐT CỨNG (bảng dưới) — không
'~55' (P0: facets cộng tối đa 44)" (DEC-1). Batch-3: 50 repo, table-format,
kèm owner range từng SF. Sau khi batch mở màn viết, editorial docs
(registry/matrix/style-guide/evidence-pack) **FROZEN**: không tự thêm row,
không tự đổi slug/pubDate — slug mới chỉ thêm qua coordinator (spec mới/amend
epic). Writer nhận đúng 1 row: pubDate CỨNG, không tự chọn (ADR-0004); angle
≥2 H2 mới so bài cùng facet — không thấy góc khác biệt thì DỪNG, không viết
cho có.

## Hệ quả (Consequences)

- Lint/audit derive manifest từ matrix (ADR-0001) → matrix là nguồn sự thật
  chung cho scope; convergence audit đếm rows thiếu file (pendingRows) theo
  owner SF.
- Executor gặp pack/matrix lệch nhau → **matrix phân xử** (bài học SF-2
  FI-385: pack viết trước spec rev 3, matrix là nguồn cuối).
- Căng thẳng "muốn thêm 1 bài nữa" xử lý qua coordinator — giá rẻ so với
  lịch đăng và audit vỡ.

## Nguồn pin

- `docs/superpowers/specs/2026-09-08-blog-batch2-design.md` — DEC-1 ("44 slug
  CHỐT CỨNG… không '~55'") + MATRIX 44 SLUG (CHỐT CỨNG — pubDate 2/ngày từ
  09-09) + consistency-pass ("cross-links CHỈ trỏ slug ∈ matrix") + ghi chú
  editorial docs FROZEN sau SF-1.
- `docs/superpowers/editorial/2026-blog-longform/runbook.md` — "Outside-matrix
  — nghĩa và cách xử lý" (editorial docs FROZEN kể từ spec FI-373; slug mới
  chỉ thêm qua coordinator; KHÔNG tự thêm row, KHÔNG tự xoá file) + checklist
  bước 1 (đọc matrix row, pubDate CỨNG, angle ≥2 H2 mới).
