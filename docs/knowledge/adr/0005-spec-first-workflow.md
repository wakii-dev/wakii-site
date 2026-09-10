---
title: "ADR-0005: Spec-first workflow — specs/ + bracket + plan trước code"
date: 2026-09-10
updated: 2026-09-10
status: accepted
visibility: internal
confidence: high
sources: [docs/superpowers/specs/2026-09-09-knowledge-base-design.md, docs/superpowers/brackets/fi409-knowledge-base.md, src/content/docs/en/story-workflow.md]
tags: [process, spec-first, workflow, agents]
type: adr
---

# ADR-0005: Spec-first workflow — specs/ + bracket + plan trước code

## Status

accepted

## Date

2026-09-10

## Bối cảnh (Context)

Mọi thay đổi nội dung lớn (blog batch, redesign, KB) đụng nhiều file, nhiều
SF chạy song song, nhiều agent tự chủ viết. Nếu executor tự diễn giải ý định
trong lúc gõ, hai writer viết cùng một đề tài ra hai shape khác nhau, review
phải đoán ý, và spec trôi theo hồi ức người điều phối. Cần một thứ tự cố định
giúp "hiểu trước khi làm" được ghi lại thành artifact, không nằm trong đầu.

## Quyết định (Decision)

Việc lớn đi theo thứ tự artifact: **spec trước** — `docs/superpowers/specs/`
giữ design spec có phần DECISIONS chốt trước (mỗi quyết định kèm nguồn/
lý do, user veto tại STORY-READY); **bracket kế** — `docs/superpowers/brackets/`
chia spec thành SF có What/Depends-on/Tier và exit criteria verify được;
**plan + review rồi mới code** — executor chỉ làm theo slice được giao
(context pack sinh từ spec slice), review độc lập trước khi merge. Pipeline
chuẩn: idea → impact → plan → epic + SF → parallel SFs → gates → 1 PR.
Spec frozen sau khi duyệt: phát hiện sai giữa chừng thì spec-critic mở lại,
executor không tự vá spec.

## Hệ quả (Consequences)

- Mọi quyết định trong code/docs truy được về dòng DECISIONS của một spec —
  KB (ADR) chỉ restatement lại, không tạo quyền quyết mới.
- Executor va câu hỏi chưa chốt → dừng hỏi coordinator thay vì tự chọn.
- Chi phí mặt giấy có thật (spec + bracket trước mỗi story) — chấp nhận,
  đổi lại batch nhiều SF song song không giẫm nhau.

## Nguồn pin

- `docs/superpowers/specs/` — bản thân các spec (2026-09-04-* → 2026-09-09)
  đều có cấu trúc IDEA-BRIEF + DECISIONS (coordinator chốt theo khuyến nghị
  P0 — user veto tại STORY-READY) + SF breakdown + Boundary.
- `docs/superpowers/brackets/fi409-knowledge-base.md` — ví dụ bracket đang
  sống: SF chia Tier, What, Depends on, Tasks, Exit criteria.
- `src/content/docs/en/story-workflow.md` — pipeline idea → impact → plan →
  epic + SF → parallel SFs → gates → 1 PR và gates B0–B5 (cũng pin trong
  claims-registry `## ALLOWED`).
