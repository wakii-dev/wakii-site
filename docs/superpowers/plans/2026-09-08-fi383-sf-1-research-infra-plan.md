# Plan — FI-383 SF-1 Research infra: matrix + claims third-party (FI-384)

> Plan registered post-execution: tasks đã dispatch qua context pack
> `docs/superpowers/contexts/fi383-sf-1.md` (spec slice + bracket Tasks line);
> file này chốt checklist B2 cho story-verify — mỗi tick kèm commit hash +
> evidence đã coordinator verify trực tiếp (output lint/audit/build/probe).

## Tasks (bracket Tasks line — 13 + docs-comment-contracts fold)

- [x] matrix-50-table-format-commit — `829cbb1` — 50 rows CHỐT CỨNG (verify: grep 50 rows, facet h10/ma10/mcp7/e9/i5/t6/m3 sau fixup `b3ad5e0`, hero 11, 25 ngày × 2 bài đúng)
- [x] lint-matrix-files-append — `b7199d3` — MATRIX_FILES +batch3, lint "of 114 planned slugs"
- [x] lint-marker-check-batch3-scoped — `3639a0f` — E1: fake VI thiếu `## Wakii học được gì` → exit 1 (chỉ lỗi marker); batch-1/2 không bị yêu cầu
- [x] lint-scoped-forbidden-mechanism-both-scripts — `53e58a9` — E2: fake † "open-source"/"mã nguồn mở" → lint + audit T3(a) cùng FAIL; entries scope đúng 6 slug †
- [x] lint-pubdate-vs-matrix-check — `e6a688c` — E3: pubDate sai vs matrix → exit 1 `frontmatter: pubDate ... != matrix row ...`
- [x] audit-hardcode-refresh-snapshot-114-t7-want-owner-mapping — `406fa3b` — T7 want 20/44/50/114 + owner() SF-2..5 theo row range; SNAPSHOT 20/13 giữ (live re-extract khớp); T6 SAMPLES N/A (full-sweep từ FI-373)
- [x] audit-families-scope-batch12-or-dated-convention — `3cf2f5f` — FAMILIES seed-posts/clis skip batch-3; E4: fake bài batch-3 chứa "50 bài" + dates → audit exit 0 (không FAIL giả)
- [x] claims-third-party-convention-license-safe-evidence-pack-cung-commit — `6a26d00` — convention "theo GitHub API ngày N" + license-safe + scoped FORBIDDEN; evidence-pack §Numbers batch-3 CÙNG commit
- [x] probe-script-commit-scripts — `8029088` + `0eb4c94` — probe-repos.sh (775): 50 repos, `summary: 50 repos probed | archived: 0 | license none/NOASSERTION: 8 | probe errors: 0` (E5, coordinator cross-check gh api: neovim/crush NOASSERTION là THẬT)
- [x] style-guide-template-wakii-hoc-duoc — `e0d6f23` — §8 template marker + §9 repo-quote + §10 ADOPT issue rubric
- [x] digest-skeleton-50-repos-path-pinned — `f3dc12f` + `0eb4c94` — 50 skeleton + README (51 files)
- [x] runbook-update-batch3 — `4a86596` — pipeline batch-3 + fix stale §Hero wiring (parity-gate aligned)
- [x] docs-comment-contracts — fold vào `b7199d3`/`3639a0f`/`53e58a9`/`e6a688c`/`406fa3b`/`3cf2f5f` (header JSDoc lineage FI-383 + contracts mới trong chính các commit đổi behavior)

## Exit criteria (2 chiều) — evidence

- [x] Marker: FAIL (E1) + PASS (batch-1/2 64 bài lint xanh) — scope theo matrix origin
- [x] Scoped FORBIDDEN: FAIL fake † (E2, 2 scripts cùng kết quả) + PASS 64 bài cũ (E6 lint 0 claims error)
- [x] FAMILIES dry-run: fake batch-3 "50 bài" không FAIL giả (E4 audit exit 0)
- [x] pubDate-vs-matrix: sai ngày bị bắt (E3); 64 bài cũ không false-FAIL
- [x] T7 want 20/44/50/114 — audit "matrix rows parsed 20/44/50=114"
- [x] SNAPSHOT skills 20/13 @ 2026-09-08 giữ nguyên (drift probe khớp)
- [x] probe-repos.sh chạy ra bảng 50 repo (E5)
- [x] Whole-gate trên tree thật: pnpm build 167 pages exit 0 + audit PASS exit 0 (E6, coordinator tự chạy lại)

## Coordinator fixups sau executor

- [x] `b3ad5e0` — cumora facet `misc`→`editors` (spec §MATRIX Editors ×9; brief coordinator pin nhầm) + header facet 9/3
- [x] plan file này (B2 bookkeeping)
