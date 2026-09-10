---
title: MOC — Map of Content (slug-level)
date: 2026-09-10
updated: 2026-09-10
status: active
visibility: internal
confidence: high
sources: [docs/superpowers/specs/2026-09-09-knowledge-base-design.md]
tags: [moc, index, knowledge-map]
type: index
---

# MOC — Map of Content

Điểm vào tra cứu theo chủ đề. Quy ước đọc hàng: ký hiệu **†** = slug license-
claims scoped (xem [README — quy ước †](README.md#7-quy-ước--dagger--license-claims-scoped));
link là path relative đến file thật trong repo.

**Maintenance rule** (bắt buộc, chi tiết ở
[README — conventions](README.md#6-maintenance-rule-bắt-buộc)): task tạo
ADR/post mới PHẢI thêm/cập nhật hàng ở đây TRONG CÙNG COMMIT + verify link-back.

## ADR index (10 ADR nền tảng)

| ADR | Tên | File | Tóm tắt 1 câu |
|---|---|---|---|
| ADR-0001 | Lint scope all-non-seed | [adr/0001](adr/0001-lint-scope-all-non-seed.md) | Lint derive manifest từ mọi bảng matrix thay vì hard-code; file lạ báo outside-matrix, không skip im lặng. |
| ADR-0002 | Grading marker scoped batch-3 | [adr/0002](adr/0002-grading-marker-scoped-batch-3.md) | Bài batch-3 bắt buộc có section "Wakii học được gì" lint-enforced, scope theo matrix origin. |
| ADR-0003 | License claims scoped † | [adr/0003](adr/0003-license-claims-scoped-forbidden.md) | 6 slug † license none/NOASSERTION chỉ được gọi "công khai trên GitHub", không "open-source". |
| ADR-0004 | Future-date policy (a) | [adr/0004](adr/0004-future-date-policy-pubdate-in-matrix.md) | pubDate trong tương lai hợp lệ khi khớp row matrix; chỉ FAIL khi pubDate ∉ matrix. |
| ADR-0005 | Spec-first workflow | [adr/0005](adr/0005-spec-first-workflow.md) | Specs + bracket + plan chốt trước code; executor làm theo slice, không tự diễn giải ý định. |
| ADR-0006 | Matrix CHỐT CỨNG per batch | [adr/0006](adr/0006-matrix-chot-cung-per-batch-slug-lock.md) | Mỗi batch một bảng matrix commit trước khi viết; editorial docs FROZEN, slug mới qua coordinator. |
| ADR-0007 | Human gates | [adr/0007](adr/0007-human-gates-vi-copy-flag-flips-verdict.md) | VI copy + flag flips là user-only; review kết luận bằng literal VERDICT APPROVED (gates B0–B5). |
| ADR-0008 | Batch 2-đợt pilot-first | [adr/0008](adr/0008-batch-hai-dot-pilot-first.md) | Đợt pilot nhỏ chốt template (ACK coordinator), đợt remainder viết theo template đã lock. |
| ADR-0009 | Category enum 3 + flat listing | [adr/0009](adr/0009-category-enum-3-flat-listing.md) | Category đúng 3 giá trị (tutorial/tech/build-log); listing flat zero-JS không pagination. |
| ADR-0010 | Learn-in-public dated | [adr/0010](adr/0010-learn-in-public-third-party-dated.md) | Grading public là nội dung bài; mọi số third-party kèm "theo GitHub API ngày N". |

## Pointer row — hero 10 flagship PINNED

| Item | Trỏ tới | Ghi chú |
|---|---|---|
| Hero 10 flagship PINNED | [batch2-design DEC-5](../superpowers/specs/2026-09-08-blog-batch2-design.md) | Danh sách 10 slug flagship + hero render sau khi bài tồn tại (pipeline đọc frontmatter). **Template-enforced — không ADR riêng** (seed list ADR CHỐT 10; hero là row này trong MOC). |

## Topic chains

### 1. MCP platform play — chuỗi 4-link đầy đủ

research digest → blog post → ADOPT issue → ADR decision:

1. Digest: [deep-dive-modelcontextprotocol-servers](repos/deep-dive-modelcontextprotocol-servers.md) †
2. Blog: [EN](../../src/content/blog/en/deep-dive-modelcontextprotocol-servers.md) · [VI](../../src/content/blog/vi/deep-dive-modelcontextprotocol-servers.md) — `deep-dive-modelcontextprotocol-servers` †
3. Issue: [wakii-dev/wakii#19 — Mutation queue tuần tự tự phục hồi cho state dùng chung](https://github.com/wakii-dev/wakii/issues/19)
4. Decision: [ADR-0010](adr/0010-learn-in-public-third-party-dated.md)

### 2. Checkpoint + rollback cho executor — chuỗi 4-link đầy đủ

1. Digests: [deep-dive-aider-ai-aider](repos/deep-dive-aider-ai-aider.md) · [deep-dive-cline-cline](repos/deep-dive-cline-cline.md)
2. Blog: [EN aider](../../src/content/blog/en/deep-dive-aider-ai-aider.md) · [VI aider](../../src/content/blog/vi/deep-dive-aider-ai-aider.md) (cline cùng shape: `deep-dive-cline-cline`)
3. Issue: [wakii-dev/wakii#14 — Checkpoint git tự động + rollback transactional cho executor](https://github.com/wakii-dev/wakii/issues/14)
4. Decisions: [ADR-0008](adr/0008-batch-hai-dot-pilot-first.md) (pilot-first sinh ra grading này) · [ADR-0010](adr/0010-learn-in-public-third-party-dated.md) (quy tắc dated cho số trong issue)

### 3. License-safe † — chuỗi 4-link đầy đủ

1. Digest: [deep-dive-anthropics-claude-code](repos/deep-dive-anthropics-claude-code.md) †
2. Blog: [EN](../../src/content/blog/en/deep-dive-anthropics-claude-code.md) · [VI](../../src/content/blog/vi/deep-dive-anthropics-claude-code.md) — `deep-dive-anthropics-claude-code` †
3. Issue: [wakii-dev/wakii#21 — Confidence scoring lọc false-positive cho review đa agent](https://github.com/wakii-dev/wakii/issues/21)
4. Decision: [ADR-0003](adr/0003-license-claims-scoped-forbidden.md)

### 4. Spec-driven process

Spec KB → bracket → ADR → product surface: [spec FI-409](../superpowers/specs/2026-09-09-knowledge-base-design.md) → [bracket FI-409](../superpowers/brackets/fi409-knowledge-base.md) → [ADR-0005](adr/0005-spec-first-workflow.md) → [ADR-0007](adr/0007-human-gates-vi-copy-flag-flips-verdict.md) → [story-workflow docs](../../src/content/docs/en/story-workflow.md).

### 5. Editorial pipeline (lint + matrix)

Bảng matrix batch-3 → runbook 8 bước → ADR scope/slug-lock/marker: [topic-matrix-batch3](../superpowers/editorial/2026-blog-longform/topic-matrix-batch3.md) → [runbook](../superpowers/editorial/2026-blog-longform/runbook.md) → [ADR-0001](adr/0001-lint-scope-all-non-seed.md) · [ADR-0006](adr/0006-matrix-chot-cung-per-batch-slug-lock.md) · [ADR-0002](adr/0002-grading-marker-scoped-batch-3.md).

### 6. Grading → ADOPT issues (learn-in-public end-to-end)

Quy tắc claim → rubric → selection record → 10 issues: [claims-registry §Third-party](../superpowers/editorial/2026-blog-longform/claims-registry.md) → [style-guide §10](../superpowers/editorial/2026-blog-longform/style-guide.md) → [SELECTION-fi389](../superpowers/editorial/research/adopt-drafts/SELECTION-fi389.md) → issues [wakii-dev/wakii #14-#23](https://github.com/wakii-dev/wakii/issues/14) → [ADR-0010](adr/0010-learn-in-public-third-party-dated.md).

## 6 slug † (license-claims scoped — luôn kèm †)

`deep-dive-anthropics-claude-code` † · `deep-dive-modelcontextprotocol-servers` † · `deep-dive-modelcontextprotocol-registry` † · `deep-dive-zed-industries-zed` † · `deep-dive-tabbyml-tabby` † · `deep-dive-janhq-jan` †

Nguồn pin: [claims-registry](../superpowers/editorial/2026-blog-longform/claims-registry.md) (## FORBIDDEN, 2 dòng scoped) — giải thích tại [ADR-0003](adr/0003-license-claims-scoped-forbidden.md).
