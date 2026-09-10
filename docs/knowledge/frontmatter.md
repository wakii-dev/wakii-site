---
title: Frontmatter schema — KB authority
date: 2026-09-10
updated: 2026-09-10
status: active
visibility: internal
confidence: high
sources: [docs/superpowers/specs/2026-09-09-knowledge-base-design.md]
tags: [kb, frontmatter, schema, convention]
type: index
---

# Frontmatter schema — authority cho toàn bộ `docs/knowledge/`

File này là **nguồn duy nhất** định nghĩa frontmatter cho KB. Mọi trang KB
(README, MOC, glossary, ADR, lessons, references) link về đây thay vì copy
schema — sửa schema chỉ diễn ra ở đây, một chỗ.

## Schema (9 field bắt buộc)

```yaml
---
title: <string>
date: 2026-09-10        # ISO tạo (YYYY-MM-DD)
updated: 2026-09-10     # ISO lần sửa gần nhất
status: active           # draft | active | superseded | archived (ADR dùng: accepted | superseded)
visibility: internal     # LUÔN internal cho toàn KB
confidence: high         # high | medium | low
sources: [<relative path hoặc URL>]   # ít nhất 1 nguồn pin (BẮT BUỘC cho ADR)
tags: [...]
type: adr | digest | landscape | lesson | glossary | index
---
```

**Quy tắc:** mọi file `.md` trong `docs/knowledge/` phải có đủ 9 field ở trên.
Thiếu field = không hợp lệ (khi lên mức Full sẽ có script check — spec KB D4
chọn convention-only cho đợt này).

## Ngữ nghĩa từng field

| Field | Ngữ nghĩa | Ghi chú |
|---|---|---|
| `title` | Tên hiển thị của trang, VI-first kèm thuật ngữ EN | trùng H1 hoặc gần nghĩa |
| `date` | Ngày tạo file (ISO) | cố định sau khi tạo |
| `updated` | Ngày sửa nội dung gần nhất (ISO) | bump khi đổi thân bài |
| `status` | Vòng đời: `draft` (đang viết, chưa ổn) → `active` (đang hiệu lực) → `superseded` (đã thay bằng trang khác — ghi trang thay thế trong thân bài) → `archived` (ngừng dùng, giữ để tra cứu) | ADR dùng bộ riêng: `accepted` / `superseded` theo MADR |
| `visibility` | **LUÔN `internal`** cho toàn KB | xem giải thích bên dưới (D6) |
| `confidence` | Độ tin của nội dung: `high` = restatement trung thành từ nguồn đã public trong repo; `medium` = tổng hợp từ nhiều nguồn, có khía cạnh diễn giải; `low` = quan điểm sớm/chưa verify | ADR mặc định `high` vì mỗi ADR có nguồn pin |
| `sources` | Danh sách path relative hoặc URL — nguồn pin của trang | **bắt buộc ≥1 cho mọi ADR** (restatement phải truy được); trang index/glossary có thể trỏ spec KB |
| `tags` | Tự do, kebab-case, VI hoặc EN | dùng nhất quán với glossary |
| `type` | 1 trong 6 giá trị enum: `adr` (10 file trong `adr/`) · `digest` (bản tóm tắt 1 artifact — chưa dùng ở SF-1, dành cho bài tóm tắt tương lai) · `landscape` (`references.md`) · `lesson` (`lessons/index.md`) · `glossary` (`glossary.md`) · `index` (README, MOC, frontmatter — trang điều hướng) | chọn đúng để agent parse được |

## `visibility: internal` là marker thông tin — KHÔNG bảo vệ (D6)

Repo `wakii-dev/wakii-site` **đã public** (verified khi viết spec KB). Vì vậy
`visibility: internal` không cơ chế chặn ai đọc — nó là **marker thông tin**
báo cho người + agent biết: trang này chứa phân tích nội bộ (grading đối thủ,
tổng hợp cạnh tranh từ research đã public trong repo), đọc với ngữ cảnh đó.
Quy tắc tương ứng (spec KB D6): KB chỉ chứa restatement từ nguồn đã public
trong repo; phân tích chưa publish không đưa vào KB.

## Vì sao README không chứa schema

README chỉ **link** về file này (một nguồn sự thật). Trước đây các repo dính
drift khi schema copy ở nhiều chỗ rồi lệch nhau — quy tắc một-authority tránh
đúng lỗi đó. Xem [README — conventions](README.md).
