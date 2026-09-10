# SF Context Pack — FI-410: Migration research/ → docs/knowledge/

> Epic spec: `docs/superpowers/specs/2026-09-09-knowledge-base-design.md` (rev 3) — section **SF-2** + **D5**. Bracket: `docs/superpowers/brackets/fi409-knowledge-base.md`. Worktree: `sf-1-kb-migration`, base `story/fi409-knowledge-base` @ `3f35f47`.

## Spec slice (chỉ phần FI-410 chịu trách nhiệm)

1. **Move** `docs/superpowers/editorial/research/` → KB:
   - 4 file landscape top-level (`2026-09-08-digest.md`, `2026-09-08-wakii-applicability.md`, `2026-09-08-broad-digest.md`, `2026-09-08-broad-applicability.md`) → `docs/knowledge/landscape/`
   - `digests-batch3/` (51 files, flat, 0 relative link nội tại — đã verify) → `docs/knowledge/repos/` (rename thư mục)
2. **KHÔNG move** `research/adopt-drafts/` (44 files) — D5 + style-guide §10 pin. Sau move, `research/` chỉ còn `adopt-drafts/`.
3. **6 pin refs editorial kit** — đúng 6, không thừa:
   - SỬA 3 (path digests-batch3 → `docs/knowledge/repos/`): `runbook.md:122` · `topic-matrix-batch3.md:119` · `claims-registry.md:117`
   - VERIFY-ONLY 3 (trỏ adopt-drafts — path vẫn đúng, không đụng): `runbook.md:141` · `style-guide.md:158-161` (§10) · `repos/README.md:22` (file move theo, nội dung giữ)
4. **KB-internal updates** (docs/knowledge/** — story FI-409 sở hữu): glossary · README (link + ghi chú FI-410) · references.md (links + frontmatter sources + GHI CHÚ SF-2) · MOC.md · adr/0003 (sources + nguồn pin) · adr/0010 (sources + nguồn pin). Refs adopt-drafts trong KB GIỮ (path thật vẫn tồn tại).
5. Historical refs FI-383 (contexts/plans/specs cũ): stale theo thiết kế — KHÔNG sửa.

## Touch map

- M: `docs/superpowers/editorial/research/{4 file landscape, digests-batch3/}` (git mv — giữ history)
- M: 3 file editorial kit ĐÚNG 1 dòng mỗi file (pin refs)
- M: 6 file `docs/knowledge/**` (links + notes)
- READ-ONLY: `research/adopt-drafts/**` · `improvements-log.md` · editorial kit còn lại · FI-383 historical artifacts · scripts/*

## ACCEPTANCE (user-visible)

- `research/` chỉ còn `adopt-drafts/`; KB có `landscape/` (4 file) + `repos/` (51 file).
- Build xanh đủ 4 checks (parity + blog-utils + blog-content + astro) — lint scope không đổi.
- `grep -rn "editorial/research" docs/knowledge/ | grep -v adopt-drafts` = 0; mọi link KB resolve (kể cả links adopt-drafts còn lại).
- Editorial kit diff = đúng 3 dòng pin refs; 0 file khác bị đụng.
- MOC chain 4-link vẫn đi trọn: digest (repos/) → blog → issue → ADR.

## Boundary (KHÔNG làm)

- KHÔNG move/sửa `research/adopt-drafts/` · KHÔNG sửa editorial kit ngoài 3 dòng pin · KHÔNG sửa improvements-log (LINK-only) · KHÔNG sửa FI-383 historical artifacts · KHÔNG đổi lint scripts · KHÔNG đụng `src/**` (KB ngoài Astro).
