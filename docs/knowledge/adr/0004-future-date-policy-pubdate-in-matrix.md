---
title: "ADR-0004: Future-date policy (a) — pubDate ∈ matrix là hợp lệ"
date: 2026-09-10
updated: 2026-09-10
status: accepted
visibility: internal
confidence: high
sources: [docs/superpowers/specs/2026-09-08-blog-batch2-design.md, docs/superpowers/editorial/2026-blog-longform/runbook.md]
tags: [pubdate, matrix, audit, policy]
type: adr
---

# ADR-0004: Future-date policy (a) — pubDate ∈ matrix là hợp lệ

## Status

accepted

## Date

2026-09-10

## Bối cảnh (Context)

Blog đăng theo lịch pre-assigned: cadence 2 bài/ngày, pubDate gán sẵn trong
bảng matrix của từng batch (batch-2: 09-09 → 09-30). Bài viết xong sớm sẽ có
`pubDate` trong tương lai so với ngày viết. Audit T7 thời đó so pubDate với
`> TODAY` → mọi bài lịch-đăng bị coi là FAIL future-date, dù ngày đó là đúng
kế hoạch. So `> TODAY` là sai vấn đề: cần chặn pubDate **không theo kế hoạch**,
không phải pubDate trong tương lai.

## Quyết định (Decision)

**POLICY (a)**: future-date HỢP LỆ khi `pubDate` ∈ matrix — bài "lịch đăng"
hiện đầu listing (sort desc) là hành vi chấp nhận, đó là announce schedule.
Audit T7 sửa điều kiện: future-date chỉ FAIL khi `pubDate ∉ matrix` (bỏ so
`> TODAY`). Lint tăng một check tương ứng: `pubDate` trong frontmatter phải
bằng pubDate của row matrix của slug đó (normalize YYYY-MM-DD) — lệch nhau →
FAIL `frontmatter: pubDate "X" != matrix row "Y"`, bắt ngay lúc viết thay vì
để trượt tới QA. Ngày matrix là CỨNG: writer không tự chọn ngày (runbook
checklist bước 1: "pubDate (CỨNG, không tự chọn; ngày tương lai hợp lệ khi
khớp đúng dòng matrix — policy a)").

## Hệ quả (Consequences)

- Matrix trở thành nguồn sự thật duy nhất cho lịch đăng; muốn đổi ngày = đổi
  matrix qua coordinator, không phải sửa bài.
- sai ngày = FAIL ở lint thời gian viết — không còn class lỗi "đúng lịch khi
  viết, sai khi audit".
- Listing có bài future-date là bình thường; tool/agent đọc blog không được
  coi đây là bug.

## Nguồn pin

- `docs/superpowers/specs/2026-09-08-blog-batch2-design.md` — DEC-6 (giữ 2
  bài/ngày, pubDate 09-09 → 09-30 pre-assigned; POLICY (a): future-date hợp lệ
  khi pubDate ∈ matrix; SF-1 sửa audit T7: chỉ FAIL khi pubDate ∉ matrix,
  không so `> TODAY` nữa) + SF-1 exit criteria ("future-date ∈ matrix PASS,
  ∉ matrix FAIL").
- `docs/superpowers/editorial/2026-blog-longform/runbook.md` — checklist bước 1
  (pubDate CỨNG theo matrix, ngày tương lai hợp lệ khi khớp row — policy a) +
  "Lint gates MỚI cho batch-3" (check pubDate-vs-matrix FAIL khi lệch row).
