# Plan — FI-383 SF-6: Convergence — 120 slug + file ADOPT issues (FI-389)

> Worktree `sf-6-blog-b3-convergence` · branch `wakii-dev/sf-6-blog-b3-convergence` (@ 8d09b9b = dest story/fi383-blog-batch3).
> Contract: pack `docs/superpowers/contexts/fi383-sf-6.md` + spec rev 3 + bracket. Linear FI-389 đã In Progress, title verify khớp.
> Scope: READ-ONLY content/layout/component — fix-minor nhỏ + `scripts/check-jsonld.mjs` (assert mở rộng) duy nhất được sửa; bug lớn thuộc SF-2..5 → escalate KHÔNG fix thay.
> KHÔNG: viết bài mới, redesign, deploy prod, merge dest→main, đụng worktree story khác.

## Tasks — 14 (bracket SF-6), batch-audit ON (1 audit comment cuối SF)

- [ ] T1 `strict-coverage-assert-100-files-new` — assert 100 file mới (50 slug × 2 locale, nguồn = topic-matrix-batch3.md) tồn tại trong `src/content/blog/{en,vi}/` — mở rộng assert trong `scripts/check-jsonld.mjs` (pack touch map); T7 pendingRows == 0 (chạy convergence audit khẳng định NOTE pendings = 0).
- [ ] T2 `lint-parity-green-120` — `node scripts/check-blog-content.mjs` exit 0 (lint all-non-seed) + `node scripts/check-blog-slug-parity.mjs --dist` exit 0 (parity 120 slug + category routes).
- [ ] T3 `band-sweep-50-new` — T2 sweep trong `scripts/audit-blog-convergence.mjs`: 50 slug batch-3 × 2 locale trong band (VI 900-1400 WARN-1470 hard; EN ≥800), không FAIL.
- [ ] T4 `claims-sweep-third-party` — T3 sweep: FORBIDDEN literals (kể cả scoped †) + variants + snapshot D8 citations — 0 FAIL; third-party claims license-safe (tabby†/jan†/registry†/mcp-chrome†/grok-build†? đối chiếu matrix cột license).
- [ ] T5 `links-resolve-locale-e2e` — T4 sweep: mọi link trong dist resolve (docs DOC_SLUGS đúng locale, blog cross-link có route, GitHub artifacts + quote), 0 FAIL.
- [ ] T6 `rss-sitemap-hreflang-full-scale-240` — T5 RSS: items == expected-live (~240 bilingual, guid absolute per locale, no `<language>`); T6 sitemap + hreflang en/vi/x-default + canonical + og:type article + published_time + og:image per-post — 0 FAIL.
- [ ] T7 `jsonld-audit-120-slug` — `node scripts/check-jsonld.mjs` exit 0: BlogPosting/Blog/Breadcrumb đủ trên 120 slug × 2 + listing + category.
- [ ] T8 `listing-flat-120-render-en-vi` — T7 listing: /blog/ EN+VI đủ cards (derived non-draft), không dupes/draft leak, pubDate DESC, date/category khớp frontmatter.
- [ ] T9 `category-pages-audit` — T7 category: 6 category × 2 locale đúng count non-draft, không foreign/dupes/cross-locale.
- [ ] T10 `adopt-issues-file-converged` — đọc `research/adopt-drafts/` (43 drafts) + grading distribution trong bài; selection ADOPT-trước-DIRECTION (kỳ vọng ~5-10) → file issues lên `wakii-dev/wakii` label `enhancement`, body = rubric SF-1 (inline evidence + retrieval dates + upstream links + link bài post; ghi rõ window 404 ngắn trước story merge — build-in-public chấp nhận). Comment link mỗi issue lên FI-389.
- [ ] T11 `probe-recheck-gone-renamed-archived` — `bash scripts/probe-repos.sh` exit 0; GONE/renamed/archived mới → draft:true hoặc escalate coordinator note; kết quả so bản research.
- [ ] T12 `browser-walkthrough-en-vi` — Rule 0 3 tầng: DOM (listing 120 posts + JSON-LD + og per-post) / VISUAL (screenshot listing + category + detail EN+VI) / FLOW (/blog/ → category → post → related → lang-switch). Mobile-390 spot-check theo contract SF-3.
- [ ] T13 `independent-review-verdict` — code-reviewer ĐỘC LẬP trên diff SF-6 (scripts + plan + digest/adopt changes) — CHANGES-REQUESTED → fix → re-review APPROVED; security-audit surface: ADOPT issue bodies + probe-recheck + third-party claims.
- [ ] T14 `release-readiness-build-smoke` — `pnpm build` sạch exit 0 (240 post pages) + toàn bộ audits exit 0 lần cuối trên dist mới → MERGE dest `story/fi383-blog-batch3` no-ff (ancestor-guard CAS; conflict improvements-log giữ CẢ HAI) → build merged tree TRƯỚC push → audit comment merge-hash lên FI-389 → `~/.claude/bin/story-verify sf-6` sạch → FI-389 Done.

## Acceptance (từ pack)

- /blog/ EN+VI: 120 slug render newest-first; 6 category pages đúng count; RSS ~240 items; JSON-LD + og per-post + hreflang đầy đủ.
- ADOPT issues đã file trên wakii-dev/wakii kèm link bài post; probe-recheck không GONE mới.
- Browser walkthrough EN+VI pass (Rule 0); mọi script exit 0.

## Conventions

- Commit: theo nhóm task audit (`fix(batch3)/audit(batch3): ...`), git add đúng file list (quote path `[slug]` nếu có); KHÔNG `git add -A`.
- Audits chạy trên `dist/` sau build; script output có thể dài → lưu `/tmp` + đọc phần SUMMARY.
- Merge recipe: temp worktree ATTACH branch dest → merge --no-ff → `pnpm install --frozen-lockfile` + build merged → remove → push. `$?` sau pipe = exit lệnh cuối (`cmd > f; echo $?`).
