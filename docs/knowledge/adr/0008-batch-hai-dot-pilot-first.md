---
title: "ADR-0008: Batch structure 2-đợt — pilot-first"
date: 2026-09-10
updated: 2026-09-10
status: accepted
visibility: internal
confidence: high
sources: [docs/superpowers/specs/2026-09-08-blog-batch3-repos-design.md, docs/superpowers/brackets/fi383-blog-batch3.md, docs/superpowers/specs/2026-09-08-blog-batch2-design.md, docs/superpowers/editorial/2026-blog-longform/style-guide.md]
tags: [batch, pilot-first, process, template]
type: adr
---

# ADR-0008: Batch structure 2-đợt — pilot-first

## Status

accepted

## Date

2026-09-10

## Bối cảnh (Context)

Batch lớn (44-50 bài) viết bởi nhiều SF song song. Nếu mọi writer bắt đầu
đồng thời thì template — khung bài, cách grading, contract issue — sẽ được
mỗi người diễn giải một phiên bản; convergence phải sửa hàng chục bài lệch
chuẩn. Với repo third-party còn thêm ẩn số độ dài: repo lớn dư content, repo
nhỏ có thể mỏng — chỉ viết hàng loạt mới biết list có cần gọt không.

## Quyết định (Decision)

Batch theo cấu trúc **2 đợt trong 1 story** (Direction B): đợt 1 = **PILOT**
một số bài đại diện (batch-3: 12 repo, mỗi nhóm ≥1, ưu tiên repo lớn dễ viết)
để thử khung; cuối đợt pilot **chốt template** qua ACK của coordinator (hợp
đồng grading + issue contract), rồi đợt 2 = remainder viết theo template chốt
(batch-3: 38 bài còn lại). Cấu trúc tier chung của một story nội dung: infra
SF trước (matrix + lint + claims), rồi các content SF song song, rồi
convergence QA — pilot nằm ở content SF đầu tiên. Template sau khi chốt là
lock: SF sau dùng đúng khung không đổi shape (style-guide §8.1 — ba tinh chỉnh
vận hành rút từ pilot được ghi lại, không đổi cấu trúc).

## Hệ quả (Consequences)

- Lệch template chỉ xảy ra tối đa trong phạm vi pilot — sửa 12 bài rẻ hơn
  sửa 50.
- Pilot có quyền quyết drop-list trước khi scale: repo mỏng/iặt được gọt ở
  đây, không phải giữa đợt remainder.
- Đổi template sau khi ACK = quyết định coordinator mới, không phải việc
  writer "cải tiến" trong lúc viết.

## Nguồn pin

- `docs/superpowers/specs/2026-09-08-blog-batch3-repos-design.md` — D1
  ("Direction B — 2 đợt trong 1 story: PILOT 12 repo (mỗi nhóm ≥1, repo lớn
  dễ viết) → chốt template section 'Wakii học được gì' + issue contract → 38
  remainder theo template") + risk research depth (pilot quyết drop-list
  trước scale).
- `docs/superpowers/brackets/fi383-blog-batch3.md` — SF-2 pilot 12 bài
  ("Cuối SF: chốt template (coordinator ACK) — chuẩn SF-3/4/5").
- `docs/superpowers/specs/2026-09-08-blog-batch2-design.md` — DEC-9 (1 story,
  infra-SF trước rồi 4 content SF song song + convergence — tổ tier gốc).
- `docs/superpowers/editorial/2026-blog-longform/style-guide.md` — §8.1
  template lock từ pilot FI-385.
