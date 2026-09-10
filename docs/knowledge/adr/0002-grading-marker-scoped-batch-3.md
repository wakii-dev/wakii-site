---
title: "ADR-0002: Grading marker “Wakii học được gì” bắt buộc — scoped batch-3"
date: 2026-09-10
updated: 2026-09-10
status: accepted
visibility: internal
confidence: high
sources: [docs/superpowers/specs/2026-09-08-blog-batch3-repos-design.md, docs/superpowers/brackets/fi383-blog-batch3.md, docs/superpowers/editorial/2026-blog-longform/style-guide.md]
tags: [grading, learn-in-public, lint, batch-3]
type: adr
---

# ADR-0002: Grading marker "Wakii học được gì" bắt buộc — scoped batch-3

## Status

accepted

## Date

2026-09-10

## Bối cảnh (Context)

Batch 3 (FI-383) đổi angle: 50 bài deep-dive repo người khác theo tinh thần
learn-in-public — mỗi bài phải trả lời "Wakii học được gì từ repo này?" bằng
grading công khai, không chỉ tả repo. Để grading là nội dung thật chứ không
phải chú thích tùy hứng, nó phải trở thành cấu trúc bắt buộc của bài — nghĩa
là phải có máy chặn, và máy chặn phải đúng scope (không ép bài batch-1/2 cũ
sửa lại).

## Quyết định (Decision)

Mọi slug do `topic-matrix-batch3.md` lập plan **phải** có section grading với
heading: VI file `## Wakii học được gì`, EN file `## What Wakii learns` —
heading level `##` chính xác (`###` không tính), đặt cuối bài trước CTA.
Lint-enforced (`check-blog-content.mjs`): thiếu marker → exit 1, áp cả bài
`draft: true` (check cấu trúc). Scope theo **matrix origin** — bài batch-1/2
(64 slug thời điểm đó) được miễn. Nội dung section = grading
ADOPT / DIRECTION / WATCH / N/A so với product surface THẬT của Wakii (đọc
docs/config/code trước khi grade, không grade trên trí nhớ), mỗi grade ≥1 lý
do cụ thể trỏ về evidence trong bài; strategic forks/ACP → WATCH trong bài,
decision lớn flag epic.

## Hệ quả (Consequences)

- Grading trở thành hợp đồng công khai: mỗi bài batch-3 kết thúc bằng một
  đánh giá có kỷ luật — ADOPT tràn lan cho đủ ô là anti-pattern (chỉ ADOPT
  khi pattern thật sự áp được kèm đề xuất cụ thể, seeding ADOPT issue).
- Batch-3 pilot chốt template (style-guide §8.1, ACK coordinator trên FI-385)
  — SF sau viết theo đúng khung, không đổi shape.
- Sweep thống kê grading dùng prefix `**ADOPT` (marker giữa các SF không đồng
  nhất `**ADOPT**` trần vs `**ADOPT — pattern**`) — bài học improvements-log
  SF-6 FI-389.

## Nguồn pin

- `docs/superpowers/specs/2026-09-08-blog-batch3-repos-design.md` — D4
  (grading public: section là NỘI DUNG bài, lint-enforced chỉ trên slug
  batch-3, marker VI/EN level `##`, grade so product surface thật).
- `docs/superpowers/brackets/fi383-blog-batch3.md` — SF-1 infra (lint marker
  check scoped batch-3, "64 bài cũ miễn").
- `docs/superpowers/editorial/2026-blog-longform/style-guide.md` — §8 (section
  bắt buộc batch-3, FI-383 D4, template grading + kỷ luật ADOPT) và §8.1
  (template lock từ pilot).
