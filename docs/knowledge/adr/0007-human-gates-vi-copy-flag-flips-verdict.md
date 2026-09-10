---
title: "ADR-0007: Human gates — VI copy, flag flips user-only, VERDICT APPROVED literal"
date: 2026-09-10
updated: 2026-09-10
status: accepted
visibility: internal
confidence: high
sources: [docs/superpowers/specs/2026-09-04-site-downloads-mobile.md, docs/superpowers/editorial/2026-blog-longform/runbook.md, src/content/docs/en/story-workflow.md, docs/superpowers/specs/2026-09-09-knowledge-base-design.md]
tags: [human-gate, copy, flags, review, verdict]
type: adr
---

# ADR-0007: Human gates — VI copy, flag flips user-only, VERDICT APPROVED literal

## Status

accepted

## Date

2026-09-10

## Bối cảnh (Context)

Phần lớn quy trình đã tự động hoá (lint, audit, parity gate), nhưng có nhóm
quyết định KHÔNG để máy hay agent quyết được: giọng nói thương hiệu khi dịch
(copy VI nói về chính sản phẩm), công tắc bật tính năng ra công chúng, và kết
luận cuối cùng của một vòng review. Để mấy nhóm này không lọt qua "vì agent
thấy ổn", chúng phải thành gate tường minh — có chủ, có điều kiện, có bằng
chứng.

## Quyết định (Decision)

Ba nhóm gate là **user-only**:

1. **VI copy qua gate duyệt**: mọi copy EN+VI mới qua gate duyệt của user —
   phải duyệt CẢ 2 biến thể flag (live + not-live) để flag flip sau launch
   không lộ ra copy chưa duyệt (spec downloads-mobile G-D: task
   `vi-copy-gate` đứng TRƯỚC các task khác).
2. **Flag flips user-only**: `DOWNLOADS_LIVE` / `MOBILE_LIVE` trong
   `src/config.ts` — flip = user/manual, comment trong config ghi rõ ownership
   kèm mini-runbook preconditions; agent không tự flip.
3. **Review kết luận bằng bằng chứng literal**: gates B0–B5 (code + tests
   green, plan ticked, independent review, merged, issue done); vòng
   independent review của story kết thúc bằng literal `VERDICT … APPROVED`
   trong comment (B3) — không có chữ đó thì chưa approved, kể cả đã "sửa xong".
   Gate phụ kề: draft fallback không được merge ở trạng thái draft — PR phải
   live đủ (30/30) hoặc user sign-off rõ ràng; flip `draft: false` là commit
   của coordinator trên nhánh đích.

## Hệ quả (Consequences)

- Agent/coordinator tôn trọng vùng user-only: chuẩn bị mọi thứ (2 biến thể
  copy, preconditions, evidence) rồi DỪNG đợi — không "flip giúp cho nhanh".
- `VERDICT APPROVED` literal cho phép máy kiểm trạng thái review mà không
  phải diễn giải văn tự do.
- VI copy một đoạn docs cũ chưa re-confirm là nợ đã ghi nhận — xử lý qua
  coordinator, không phải việc executor tự duyệt.

## Nguồn pin

- `docs/superpowers/specs/2026-09-04-site-downloads-mobile.md` — vi-copy-gate
  (G-D: EN+VI, CẢ 2 biến thể flag, user duyệt; task thứ tự 1), "Mọi copy EN+VI
  mới qua gate duyệt… Phải duyệt CẢ 2 biến thể flag", "Flag-flip ownership:
  comment trong config.ts ghi rõ flip = user/manual; kèm mini-runbook".
- `docs/superpowers/editorial/2026-blog-longform/runbook.md` — D7 draft
  fallback (PR 30/30 live hoặc user sign-off rõ ràng; flip draft:false =
  coordinator trên nhánh đích).
- `src/content/docs/en/story-workflow.md` — gates B0–B5 (dòng ~44: "code +
  tests green, plan ticked, independent review, merged, issue done").
- `docs/superpowers/specs/2026-09-09-knowledge-base-design.md` — seed ADR-0007
  (human gates: VI copy + flag flips user-only + VERDICT APPROVED literal,
  B0-B5).
