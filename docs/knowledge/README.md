---
title: Knowledge Base nội bộ — index + conventions
date: 2026-09-10
updated: 2026-09-10
status: active
visibility: internal
confidence: high
sources: [docs/superpowers/specs/2026-09-09-knowledge-base-design.md, docs/superpowers/brackets/fi409-knowledge-base.md]
tags: [kb, index, conventions]
type: index
---

# Knowledge Base nội bộ (KB)

KB là nơi giữ **tri thức đã kết luận** của dự án Wakii: quyết định kiến trúc/
quy trình (ADR), thuật ngữ chung (glossary), bản đồ liên kết tri thức (MOC),
bài học rút ra (lessons) và các tham chiếu landscape. KB **link-first** — nó
không copy nội dung từ nơi khác, nó dẫn về nguồn và giữ lại phần đã kết luận.

**Ai dùng:** team Wakii (tra quyết định, thuật ngữ, chuỗi research → bài →
issue → decision) và các agent trong kit (KB parse được nhờ frontmatter chuẩn
— schema authority ở [frontmatter.md](frontmatter.md)).

## Conventions

### 1. Biên superpowers vs knowledge

- `docs/superpowers/` = **in-flight / process artifacts** — context pack,
  bracket, plan, research đang chạy; sống và chết theo story.
- `docs/knowledge/` = **finished / curated** — quyết định đã chốt, thuật ngữ
  đã ổn, bài học đã tổng hợp; sống lâu hơn story.
- Một thứ chuyển từ superpowers sang knowledge khi nó **kết luận** (vd: decision
  trong spec → ADR; improvement lặp ≥2 lần → lesson). Việc di chuyển file
  research/ sang KB là story riêng (FI-410, sau 09-30) — KHÔNG tự di chuyển.

### 2. Quy tắc LINK-only (không bao giờ sửa/move)

Ba vùng dưới đây chỉ được **link**, tuyệt đối không sửa nội dung, không di
chuyển, không copy sang KB:

- Editorial kit `docs/superpowers/editorial/2026-blog-longform/` —
  [claims-registry](../superpowers/editorial/2026-blog-longform/claims-registry.md),
  [runbook](../superpowers/editorial/2026-blog-longform/runbook.md),
  [style-guide](../superpowers/editorial/2026-blog-longform/style-guide.md),
  3 file topic-matrix — **lint-pinned** (`scripts/check-blog-content.mjs` đọc
  hard-path các file này); move = vỡ lint.
- [improvements-log.md](../superpowers/improvements-log.md) — log sống
  in-flight, đang được tham chiếu bởi memory hệ thống; KB chỉ trỏ qua
  [lessons/index.md](lessons/index.md).
- `MEMORY.md` (ngoài repo, thư mục memory của user) — không nằm trong git,
  chỉ nhắc tên, không link được và không cần link.

### 3. Frontmatter

Mọi file KB có đủ 9 field frontmatter. Schema + ngữ nghĩa từng field: xem
[frontmatter.md](frontmatter.md) (authority — README không inline schema).

### 4. Worked example — chuỗi 4-link chuẩn

Cách tra cứu một chủ đề từ đầu đến cuối trong hệ tri thức (toàn bộ link dưới
đây là link thật, đã verify tồn tại):

1. **KB entry** — hàng chủ đề trong [MOC.md](MOC.md) (vd: chủ đề "MCP platform
   play") trỏ tới ADR quyết định liên quan.
2. **Research digest** —
   [digest MCP servers](../superpowers/editorial/research/digests-batch3/deep-dive-modelcontextprotocol-servers.md)
   (số liệu kèm ngày probe).
3. **Blog post** —
   [EN](../../src/content/blog/en/deep-dive-modelcontextprotocol-servers.md) +
   [VI](../../src/content/blog/vi/deep-dive-modelcontextprotocol-servers.md)
   (bài đã publish trên site).
4. **GitHub issue** — [wakii-dev/wakii#19](https://github.com/wakii-dev/wakii/issues/19)
   (ADOPT issue học từ MCP servers memory).
5. **Claim trong claims-registry** —
   [claims-registry §Third-party claims](../superpowers/editorial/2026-blog-longform/claims-registry.md)
   (quy tắc số kèm "theo GitHub API ngày N" + scoped FORBIDDEN cho slug †).

Bài học: quyết định (ADR) → bằng chứng nghiên cứu (digest) → nội dung public
(blog) → hành động product (issue) → hợp đồng claim (registry). Một chủ đề
truy được đầy đủ chuỗi này là chuỗi khỏe.

### 5. Row template cho MOC

Khi thêm 1 entry mới vào [MOC.md](MOC.md), dùng đúng khung hàng:

```markdown
| <ADR-NNNN / slug> | <tên ngắn> | [<file>](<relative-path>) | <1 câu VI tóm tắt> |
```

Ví dụ hàng ADR:

```markdown
| ADR-0001 | Lint scope all-non-seed | [adr/0001](adr/0001-lint-scope-all-non-seed.md) | Lint đọc manifest từ mọi bảng matrix thay vì hard-code. |
```

### 6. Maintenance rule (bắt buộc)

Mọi task tạo ADR mới hoặc blog post mới **PHẢI update [MOC.md](MOC.md) trong
cùng commit** — thêm/cập nhật hàng tương ứng — và **verify link-back** (link
từ MOC tới file mới resolve; ADR có `sources` trỏ ngược nguồn). MOC thiếu hàng
= commit chưa xong.

### 7. Quy ước † (dagger) — license-claims scoped

Slug có dấu **†** = thuộc nhóm 6 slug bị **scoped FORBIDDEN license** theo
[claims-registry](../superpowers/editorial/2026-blog-longform/claims-registry.md)
(mục `## FORBIDDEN`, 2 dòng scoped): license `none`/`NOASSERTION` → chỉ được
gọi **"công khai trên GitHub"**, KHÔNG được gọi "open-source"/"mã nguồn mở".
Mọi chỗ 6 slug này xuất hiện trong KB phải kèm †. Danh sách 6 slug (từ
claims-registry, dòng scoped FORBIDDEN):

- `deep-dive-anthropics-claude-code` †
- `deep-dive-modelcontextprotocol-servers` †
- `deep-dive-modelcontextprotocol-registry` †
- `deep-dive-zed-industries-zed` †
- `deep-dive-tabbyml-tabby` †
- `deep-dive-janhq-jan` †

## Định dạng ADR (template)

ADR đặt trong `adr/`, tên file `NNNN-<tên>-kebab.md`, VI-first theo khung
MADR-ish dưới đây (frontmatter 9 field theo [frontmatter.md](frontmatter.md),
`type: adr`, `status: accepted` hoặc `superseded`):

```markdown
# ADR-NNNN: <tên quyết định>

## Status

accepted | superseded (bởi ADR-MMMM)

## Date

YYYY-MM-DD

## Bối cảnh (Context)

Vấn đề/bối cảnh buộc phải quyết định — restatement từ nguồn pin.

## Quyết định (Decision)

Quyết định đã chốt — nêu rõ ranh giới (gì được, gì không).

## Hệ quả (Consequences)

Cái được, cái đánh đổi, việc phải làm theo.

## Nguồn pin

- <path/URL nguồn đã public trong repo — restatement trung thành, không bịa>
```

Số ADR tăng dần, KHÔNG tái sử dụng số đã dùng; hủy quyết định = ADR mới
`superseded` ADR cũ, không xóa file cũ.

## Mục lục KB

| File | Nội dung |
|---|---|
| [README.md](README.md) | (file này) index + conventions |
| [frontmatter.md](frontmatter.md) | schema frontmatter — authority |
| [glossary.md](glossary.md) | thuật ngữ EN/VI chung |
| [MOC.md](MOC.md) | Map of Content — mọi chủ đề, chuỗi 4-link |
| [references.md](references.md) | 7 tham chiếu landscape/context |
| [lessons/index.md](lessons/index.md) | bài học rút ra (trỏ improvements-log) |
| [adr/0001](adr/0001-lint-scope-all-non-seed.md) · [0002](adr/0002-grading-marker-scoped-batch-3.md) · [0003](adr/0003-license-claims-scoped-forbidden.md) · [0004](adr/0004-future-date-policy-pubdate-in-matrix.md) · [0005](adr/0005-spec-first-workflow.md) · [0006](adr/0006-matrix-chot-cung-per-batch-slug-lock.md) · [0007](adr/0007-human-gates-vi-copy-flag-flips-verdict.md) · [0008](adr/0008-batch-hai-dot-pilot-first.md) · [0009](adr/0009-category-enum-3-flat-listing.md) · [0010](adr/0010-learn-in-public-third-party-dated.md) | 10 ADR nền tảng |

Điểm vào chính cho tra cứu theo chủ đề: [MOC.md](MOC.md).
