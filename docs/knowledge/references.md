---
title: References — landscape/context enum (7 nguồn)
date: 2026-09-10
updated: 2026-09-10
status: active
visibility: internal
confidence: high
sources: [docs/superpowers/editorial/research/2026-09-08-digest.md, docs/superpowers/editorial/research/digests-batch3/README.md]
tags: [references, landscape, research, context]
type: landscape
---

# References — landscape/context enum

7 nguồn tham chiếu chuẩn của KB, đánh số cố định để ADR/MOC/lesson trỏ vào
hàng này thay vì lặp path. Tất cả là restatement — nội dung gốc nằm ở nguồn,
KB không copy.

1. **[Landscape digest vòng 1 — agentic coding](../superpowers/editorial/research/2026-09-08-digest.md)**
   — snapshot hệ sinh thái agentic coding theo stars (số lấy 2026-09-08 qua
   `gh` CLI, snapshot rule D8: mỗi con số kèm ngày lấy; re-extract lúc viết
   bài, không tin số trong digest cũ).

2. **[Wakii applicability review — từ digest vòng 1](../superpowers/editorial/research/2026-09-08-wakii-applicability.md)**
   — đánh giá từng pattern vòng 1 so với bề mặt Wakii HIỆN TẠI, grade
   ADOPT/DIRECTION/WATCH/N/A kèm "đề xuất cho Wakii" + "landed ở đâu";
   quyết định product thuộc user — đây là đề xuất có dẫn chứng.

3. **[Broad-scan digest — vòng 2, ngoài agentic-coding](../superpowers/editorial/research/2026-09-08-broad-digest.md)**
   — mở rộng phạm vi 5 category ngoài vòng 1 (agent frameworks Python-side,
   v.v.), cùng snapshot rule D8.

4. **[Wakii applicability — broad scan, vòng 2](../superpowers/editorial/research/2026-09-08-broad-applicability.md)**
   — grade các pattern vòng 2; kết quả nổi bật: MCP từ chưa từng được grade
   thành entry mạnh nhất (DIRECTION nâng từ WATCH) — bằng chứng ecosystem
   cho hướng platform.

5. **[Digests batch-3 — 50 repo](../superpowers/editorial/research/digests-batch3/)**
   — mỗi file 1 matrix row của `topic-matrix-batch3.md` (số liệu kèm ngày
   probe, convention trong README của thư mục). **GHI CHÚ:** SF-2 (issue
   FI-410) sẽ move thư mục này sang `docs/knowledge/repos/` sau 09-30 —
   KHÔNG move bây giờ (batch publish window; 6 pin refs sẽ sửa trong SF-2).

6. **[ADOPT drafts — grading drafts](../superpowers/editorial/research/adopt-drafts/SELECTION-fi389.md)**
   (thư mục `docs/superpowers/editorial/research/adopt-drafts/`) — draft
   ADOPT/DIRECTION/WATCH từng repo, đầu vào cho ADOPT issues. **GHI CHÚ:**
   KHÔNG move — được pin tại style-guide
   [§10 ADOPT issue body rubric](../superpowers/editorial/2026-blog-longform/style-guide.md)
   (editorial kit FROZEN, lint-pinned).

7. **[SELECTION-fi389 — selection record](../superpowers/editorial/research/adopt-drafts/SELECTION-fi389.md)**
   — record hội tụ 33 drafts → 10 ADOPT issues đã file trên `wakii-dev/wakii`
   (#14-#23), kèm mapping draft → issue và lý do các draft không file.
