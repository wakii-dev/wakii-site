# Spec — Knowledge Base nội bộ (mức Standard) — Direction C hybrid

Umbrella: FI-365 (Blog 100 bài) — KB phục vụ learning loop (research → blog → product decisions).
Baseline: main @ `d42f371` (ancestor của main hiện tại `b05781a`; HEAD thật `29d2046` = PR #7 merge).

## IDEA-BRIEF

- **Task**: tạo `docs/knowledge/` — KB nội bộ link-first (Direction B) + conventions; migration research/ để sau (SF-2 deferred, thực thi sau 09-30 khi batch-2 publish window nghỉ).
- **Output**: README index + conventions · 10 ADR (MADR-ish VI-first) · glossary EN/VI · MOC.md (map liên kết KB ↔ blog ↔ issues ↔ claims) · lessons index · 7 context/landscape references.
- **Users**: team Wakii + agents (KB parse được — frontmatter metadata).
- **Constraints (MUST)**: LINK-first — KHÔNG move/dụng file editorial kit ACTIVE (matrix/claims-registry bị lint hard-path); KHÔNG đụng improvements-log.md (living); 0 file hiện có bị sửa ngoài additions; VI-first kèm thuật ngữ EN; repo đã push GitHub — KB chứa phân tích cạnh tranh → frontmatter `visibility: internal`.
- **Success criteria**: `docs/knowledge/` có đủ cấu trúc; MOC link được mọi nguồn tri thức; 10 ADR hoàn chỉnh theo MADR-ish; glossary EN/VI; build vẫn xanh (KB ngoài Astro).
- **Out-of-scope**: MOVE research/digests (issue riêng, sau 09-30); frontmatter enforcement script (mức Full); public-facing KB (Starlight); GraphRAG; đụng editorial kit files.

## DECISIONS (coordinator theo khuyến nghị P0 — user veto tại STORY-READY)

| # | Decision | Chốt |
|---|---|---|
| D1 | Direction | **C hybrid 2 bước**: story này = **SF-1 skeleton link-first ONLY**; migration research/ = **issue Linear Tier-1 riêng** (tạo lúc STORY-READY, thực thi sau 09-30 — ngoài story closure contract) |
| D2 | Biên superpowers vs knowledge | superpowers = in-flight/process artifacts; knowledge = finished/curated — ghi cứng README conventions |
| D3 | ADR ngôn ngữ | VI-first kèm thuật ngữ EN (nhất quán văn hóa repo) |
| D4 | Frontmatter enforcement | convention-only (mức Standard); script check = mức Full sau |
| D5 | Migration scope (SF-2 deferred) | digests-batch3/ + 4 file top-level research/; KHÔNG gộp adopt-drafts (style-guide §10 pin — giữ) |
| D6 | Public-flip exposure | **repo wakii-dev/wakii-site ĐÃ PUBLIC** (verified: private=false) — `visibility: internal` chỉ là marker thông tin, KHÔNG bảo vệ. → **Sensitivity pass TRƯỚC khi merge SF-1**: mọi page KB review — ADR restatement từ specs/code đã public = OK; grading đối thủ chỉ restatement từ research đã public (morning round) = OK; Evening round (competitive deep-dive spec-kit v.v.) GIỮ local, không vào KB đợt này |
| D7 | LINK-only vĩnh viễn | editorial kit (matrix/claims-registry — lint-pinned) · improvements-log.md (living + memory-referenced) · MEMORY.md (ngoài repo) |

## Frontmatter schema (tối giản)

```yaml
---
title: <string>
date: 2026-09-08        # ISO tạo
updated: 2026-09-08
status: active           # draft | active | superseded | archived (ADR: accepted/superseded)
visibility: internal
confidence: high         # high | medium | low
sources: [<path/URL>]
tags: [...]
type: adr | digest | landscape | lesson | glossary | index
---
```

## Lưu ý cố ý (historical/by-design)

- Refs lịch sử tới `editorial/research/` trong `docs/superpowers/contexts/fi383-sf-*.md` + plans FI-383: **stale theo thiết kế** — historical artifacts không sửa (executor nhiệt tình KHÔNG đụng).
- GitHub issues gaps (#4, #8, #10-13): do issues bị hủy/transfer trước đó — không tồn tại là bình thường.
- Baseline `d42f371`: vẫn ancestor-valid của main hiện tại (`b05781a`).

## SF breakdown

### SF-1 KB skeleton — structure + conventions + 10 ADR + glossary + MOC (Tier 0)
**What**: `docs/knowledge/` hoàn chỉnh link-first — README index + conventions (biên superpowers/knowledge + LINK-only rules + frontmatter schema), 10 ADR VI-first, glossary EN/VI, MOC.md liên kết mọi nguồn (blog posts ↔ issues #3/5/6/7/9/#14-23 ↔ editorial kit ↔ research ↔ claims), lessons index trỏ improvements-log. Demo: MOC từ 1 chủ đề truy được đầy đủ chuỗi research → post → issue → decision; build vẫn xanh.
**Depends on**: —
**Tasks (14)**: knowledge-dir-skeleton-readme-conventions-kèm-worked-example-chain-4-link (README chứa ≥1 ví dụ mẫu hoàn chỉnh: KB entry → research → post → issue → claim + row template MOC) / adr-format-template-madr-vi-naming-NNNN / adr-enforcing-decisions-4 (lint-all-non-seed · grading-marker · license-scoped-† · future-date-policy-a) / adr-process-decisions-4 (spec-first-workflow · matrix-chốt-cứng · human-gates-vi-copy-flag-flips-verdict-literal · batch-2-đợt-pilot-first) / adr-platform-content-3 (category-enum-3-flat · learn-in-public-third-party-dated · hero-10-flagship-pinned) / glossary-en-vi-seed-≥15-thuật-ngữ / moc-slug-level-cùng-commit-maintenance-rule-vào-conventions / lessons-index-trỏ-improvements-log / landscape-references-4-artifacts-enum / repos-references-digests-batch3-adopt-drafts-separation / frontmatter-schema-docs-authority-task-9-chỉ-link / visibility-internal-marks-6-slug-† / sensitivity-pass-per-file-bảng-pass-fail-100%-linear-comment / build-verify-machine-checks-4: (a)-gray-matter-parse-frontmatter-mọi-file-(throwaway,-không-commit) (b)-link-check-relative-links-resolve (c)-adr-count-=-10 (d)-git-diff-baseline-exclude-knowledge-rỗng

**10 ADR seed list (CHỐT — mỗi ADR có nguồn pin):**
1. ADR-0001 Lint scope all-non-seed derived từ matrix (nguồn: check-blog-content.mjs:16-18 + FI-373 SF-1)
2. ADR-0002 Grading marker "Wakii học được gì" bắt buộc scoped batch-3 (FI-383 D4)
3. ADR-0003 License claims scoped FORBIDDEN † — NOASSERTION ≠ open-source (claims-registry scoped entries)
4. ADR-0004 Future-date policy (a): pubDate ∈ matrix hợp lệ (audit T7 policy-a)
5. ADR-0005 Spec-first workflow: specs/ + bracket + plan trước code (docs/superpowers/specs/*)
6. ADR-0006 Matrix CHỐT CỨNG per batch, slug lock (2026-09-08-blog-batch2-design.md DEC-1)
7. ADR-0007 Human gates: VI copy + flag flips user-only + VERDICT APPROVED literal (B0-B5)
8. ADR-0008 Batch structure 2-đợt pilot-first (Direction B — FI-373 D1)
9. ADR-0009 Category enum 3 giá trị + listing flat không pagination (batch2 DEC-2/3)
10. ADR-0010 Learn-in-public + third-party số kèm ngày probe (claims-registry §Third-party + digests README)

### SF-2 Migration research/ → knowledge (Tier 1 — DEFERRED, thực thi sau 09-30)
**What**: move `docs/superpowers/editorial/research/` (4 top-level + digests-batch3/) vào `docs/knowledge/landscape|repos/` + sửa ĐỦ 6 pin refs đã verify (runbook.md:122 digests · runbook.md:141 adopt-drafts-KHÔNG-move-chỉ-ghi-chú · style-guide.md:158-161 §10-chỉ-adopt-drafts-KHÔNG-move · topic-matrix-batch3.md:119-mục-6-numbered-list · claims-registry.md:115-117 · digests-batch3/README.md:22) + **task cập nhật KB-internal links** (MOC/ADR-sources/glossary trỏ path research/ cũ → path mới). CHỈ thực thi sau khi batch-2 publish window (09-09→09-30) nghỉ. Historical refs trong contexts/plans FI-383: stale theo thiết kế, KHÔNG sửa.
**Depends on**: SF-1
**Tasks (~8)**: move-4-top-level-research / move-digests-batch3-into-repos-landscape / ref-update-runbook / ref-update-style-guide-10 / ref-update-matrix-footer / ref-update-claims-registry / ref-update-digests-readme / verify-build-green-lint-scope-intact

## Risks

1. **Drift KB-vs-editorial** — LINK-first + biên frozen/superpowers-vs-knowledge trong README conventions.
2. **Accidental main merge lesson (FI-383)** — mọi git op kiểm `git branch --show-current` trước khi merge (bài học main-worktree-đang-nhầm-branch).
3. **Public-flip** — `visibility: internal` mọi page + sensitivity pass tracked.
4. **VI-first drift** — ADR/glossary VI kèm EN thuật ngữ, không EN-only.

## Boundary (KHÔNG làm)

Move research trong batch window · sửa editorial kit files · enforcement script (mức Full) · Starlight public KB · GraphRAG · đụng MEMORY.md ngoài repo.
