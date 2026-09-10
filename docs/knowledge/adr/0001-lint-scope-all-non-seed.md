---
title: "ADR-0001: Lint scope all-non-seed — derived từ matrix"
date: 2026-09-10
updated: 2026-09-10
status: accepted
visibility: internal
confidence: high
sources: [scripts/check-blog-content.mjs, docs/superpowers/specs/2026-09-08-blog-batch2-design.md, docs/superpowers/brackets/fi373-blog-batch2.md]
tags: [lint, editorial-pipeline, scope, matrix]
type: adr
---

# ADR-0001: Lint scope all-non-seed — derived từ matrix

## Status

accepted

## Date

2026-09-10

## Bối cảnh (Context)

Lint nội dung blog (`scripts/check-blog-content.mjs`) ban đầu giữ scope bằng
một danh sách slug hard-code — thừa hưởng từ FI-359 (D5, danh sách 20 slug).
Hệ quả: mỗi batch thêm bài đều phải nhớ append slug mới vào script; quên một
lần là bài mới nằm ngoài cổng chất lượng — lỗi âm thầm đúng loại mà lint sinh
ra để chặn. Batch 2 (FI-373) chốt refactor: scope phải **derived**, không
hard-code (spec batch2 DEC-4: "hết cảnh 'quên append = bài ngoài gate'").

## Quyết định (Decision)

Scope lint = **manifest all-non-seed**, derive lúc chạy: script parse mọi slug
từ CẢ BA bảng matrix (topic-matrix.md batch-1 + topic-matrix-batch2.md +
topic-matrix-batch3.md — cùng row regex, 114 slug tổng) thay vì giữ danh sách
trong code. Ranh giới xử lý 3 loại file:

- **Seed** (5 SEED_SLUGS frozen) → miễn, như cũ;
- **Non-seed có row matrix** → áp đầy đủ các check (band từ, docs link,
  frontmatter, FORBIDDEN, marker batch-3, kebab-case);
- **Non-seed KHÔNG có row matrix** → báo `outside-matrix` lên stdout, đếm
  trong summary, nhưng KHÔNG enforce — thêm slug là quyết định editorial qua
  coordinator, lint không bao giờ bỏ qua im lặng.

Script đọc file chỉ khi file tồn tại trong tree — giữa story, worktree một
phần vẫn xanh (partial pass by design; độ phủ matrix là việc convergence SF).

## Hệ quả (Consequences)

- Thêm batch mới = thêm bảng matrix, không đụng script.
- File lạ trong `src/content/blog/` không bao giờ lọt qua âm thầm — luôn hiện
  trong summary; ai thấy dòng `outside-matrix` phải báo coordinator, không tự
  thêm row matrix (editorial docs FROZEN sau SF-1 của từng batch).
- Cùng parser scope ở lint lẫn audit — cùng tree cho cùng kết quả.

## Nguồn pin

- `scripts/check-blog-content.mjs` — docstring scope (dòng 7-19: "Scope:
  derived, not hard-coded", planned manifest = slug từ cả ba bảng matrix,
  114 slugs; seed exempt; outside-matrix reported not enforced) và hằng số
  `SEED_SLUGS` (dòng 70).
- `docs/superpowers/specs/2026-09-08-blog-batch2-design.md` — DEC-4 (lint/audit
  scope B1 refactor: all-non-seed, script đọc manifest thay vì hard-code) và
  SF-1 exit criteria (lint manifest: bài sai band THUỘC manifest BỊ CHẶN, file
  lạ NGOÀI manifest bị BÁO không skip im lặng).
- `docs/superpowers/brackets/fi373-blog-batch2.md` — SF-1 (lint/audit đọc
  all-non-seed manifest, matrix gate phủ 64/64 non-seed thời batch-2).
