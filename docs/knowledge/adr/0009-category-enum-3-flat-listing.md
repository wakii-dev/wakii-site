---
title: "ADR-0009: Category enum 3 giá trị + listing flat không pagination"
date: 2026-09-10
updated: 2026-09-10
status: accepted
visibility: internal
confidence: high
sources: [docs/superpowers/specs/2026-09-08-blog-batch2-design.md]
tags: [category, listing, taxonomy, blog]
type: adr
---

# ADR-0009: Category enum 3 giá trị + listing flat không pagination

## Status

accepted

## Date

2026-09-10

## Bối cảnh (Context)

Khi blog lớn dần (69 slug thời batch-2, 120 slug sau batch-3), taxonomy bài
và trang listing chịu áp lực "phân loại tinh hơn" và "chia trang cho nhẹ".
Nhưng mỗi giá trị enum thêm một thì mọi nơi dùng nó phải cập nhật: frontmatter
schema, audit đếm category, trang category, và không ít claim trong bài. Còn
pagination phá một tính chất đang cố tình giữ: listing là zero-JS, render
một trang tĩnh duy nhất.

## Quyết định (Decision)

**Category enum giữ đúng 3 giá trị**: `tutorial` / `tech` / `build-log` —
skills/features/arch phân vào `tech`, guides vào `tutorial`, logs vào
`build-log`. Chấp nhận `tech` chiếm đa số bài: đó là phân bố thật của một
công cụ dev — "honest cho dev tool". KHÔNG có giá trị thứ 4 (out-of-scope
batch-2 ghi rõ: pagination · category enum thứ 4).

**Listing giữ flat, không pagination**: một trang liệt kê mọi post, zero-JS.
Batch-3 "xét lại nếu nặng" — tới thời điểm 120 slug listing vẫn flat và audit
vẫn đếm trang listing + 6 category pages theo đúng enum 3 giá trị.

## Hệ quả (Consequences)

- Frontmatter category chỉ nhận 3 giá trị; audit T6/facet theo đúng enum —
  thêm facet mới = quyết định coordinator + sửa enum có chủ đích, không phải
  chọn tự do lúc viết.
- Listing dài là đánh đổi đã chấp nhận (long-page); nếu sau này đo LCP cho
  thấy phải chia trang, làm bằng ADR mới — không pagination âm thầm.
- Số trang category cố định theo enum (3 + seed facets) — tool đếm được.

## Nguồn pin

- `docs/superpowers/specs/2026-09-08-blog-batch2-design.md` — DEC-2 ("Giữ 3
  giá trị (tutorial/tech/build-log) — skills/features/arch phân vào tech,
  guides vào tutorial, logs vào build-log; chấp nhận tech chiếm đa số
  (honest cho dev tool)") + DEC-3 ("Giữ flat — zero-JS, không pagination batch
  này (batch 3 xét lại nếu nặng)") + Out-of-scope ("Pagination · category enum
  thứ 4").
