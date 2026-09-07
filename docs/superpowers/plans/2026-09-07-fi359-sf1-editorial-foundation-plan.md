# Plan: FI-359 SF-1 — Editorial foundation + pilot (FI-360)

Date: 2026-09-07 | Linear: FI-360 | Worktree: `wakii-dev/sf-1-editorial-foundation`
Dest branch: `story/fi359-blog-longform-20` | Spec: `docs/superpowers/specs/2026-09-07-blog-longform-20-posts-spec.md` | Context pack: `docs/superpowers/contexts/fi359-longform-sf-1.md`

## 0. Root cause analysis (WHY — before "what")

### Root cause
Story viết 20 bài × 2 locale = 40 file do 3 SF song song thực thi. Không có lớp nền dùng chung thì mỗi SF tự chế: format frontmatter, cách đếm từ, cụm claim được phép, target link docs — drift mù (risk #1 của epic spec: accuracy drift ở scale ×20, FI-341 đã dính thật). Nguyên nhân gốc: **pattern dùng chung chưa được tách ra tier 0 trước khi chia việc content**.

### Current state (before feature)
Blog có 10 seed posts (5 slug × 2 locale, FI-341) — mỗi bài tự do về độ dài/claim/link; lint duy nhất trong build là slug parity. Không có ma trận bài viết, không có registry claim máy-kiểm-được, không có chuẩn độ dài.

### Expected outcome
Bộ máy editorial sống trong repo (`docs/superpowers/editorial/2026-blog-longform/`) + lint máy trong build + 1 pilot đi hết pipeline. SF-2/3/4 đọc 5 file này và chỉ viết content — mọi bài mới cùng format, cùng band 900-1400 từ VI, cùng ràng buộc claim, link docs đúng locale.

### Constraints & hardships
- Schema LOCKED (6 field frontmatter, category enum 3 giá trị) — lint chỉ ĐỌC schema, không đổi.
- Seeds miễn chuẩn mới (band 350-500 từ là chuẩn FI-341 đã duyệt) → lint scope CHỈ 20 slug mới, danh sách seed frozen trong script làm exclusion.
- Build phải xanh ở worktree giữa-chừng (partial pass đúng thiết kế) — lint chỉ kiểm slug CÓ TRONG cây.
- Story redesign FI-349 chạy song song có thể đụng `package.json` → giữ diff của mình đúng 1 dòng.

### High-level strategy
Foundation-first (tier 0): toàn bộ pattern dùng chung cấp phát sẵn từ SF-1, content SF chỉ tiêu thụ. Máy hóa phần kiểm được (lint: band/link/frontmatter/forbidden-phrase); phán định chất lượng (tone, trùng góc nhìn) để review + SF-5.

## 1. Problem (intent, NOT solution)

19 bài viết còn lại của epic sẽ nhờ bộ máy soạn thảo dùng chung này — SF-1 sai thì 19 bài sau sai theo. Ai mở `pnpm build` phải thấy bài lệch chuẩn bị chặn bằng máy, không phải bằng mắt.

## 2. Scope

- **In scope:** 5 file editorial (topic-matrix 20 hàng · claims-registry greppable · style-guide + frontmatter template + tags vocab · evidence-pack + snapshot D8 + hub-store digest · runbook); lint script `scripts/check-blog-content.mjs` (scope 20 slug mới, seed exempt, draft skip); wiring 1 dòng `package.json` sau parity; pilot `zero-setup-agent-team` VI+EN đi hết pipeline.
- **Out of scope:** 19 bài còn lại (SF-2/3/4); seeds/schema/pages/RSS/sitemap/i18n/parity script/bare `sf-N.md` packs; taxonomy/hero/readingTime/JSON-LD (FI-349); deploy; matrix-completeness check trong lint (việc SF-5); đổi category enum.
- **Success criteria (observable — từ context pack ACCEPTANCE):**
  1. Preview build: `/blog/` + `/vi/blog/` thấy 11 bài (10 seed + pilot ngày 20-08 đầu danh sách), badge + mô tả đúng.
  2. Pilot 2 locale: 900-1400 từ prose (D1), TOC anchors, ASCII diagram, link docs đúng locale, tone như seed.
  3. `pnpm build` xanh (parity + lint mới PASS); bài test sai band/thiếu link/claim cấm → lint CHẶN đúng file (test xong xóa).
  4. Thư mục editorial đủ 5 file: registry phân biệt ALLOWED/FORBIDDEN greppable, matrix 20 hàng đủ cột có angle, snapshot D8 có output lệnh thật.

## 3. Touch map

- **Tạo:** `docs/superpowers/editorial/2026-blog-longform/{topic-matrix,claims-registry,style-guide,evidence-pack,runbook}.md`; `scripts/check-blog-content.mjs`; `src/content/blog/{en,vi}/zero-setup-agent-team.md`
- **Sửa 1 dòng:** `package.json` — `build` thành `node scripts/check-blog-slug-parity.mjs && node scripts/check-blog-content.mjs && astro build`
- **Consumers/regression:** build chain (mọi SF sau + CI kiểu chạy `pnpm build`); SF-2/3/4 đọc 5 file editorial; BlogToc (≥3 h2) — pilot có 4 h2 là render.
- **Shared surfaces (READ-ONLY):** `src/content.config.ts` (schema), `src/config.ts` (`DOC_SLUGS`), `scripts/check-blog-slug-parity.mjs` (mẫu phong cách), seeds.

## 4. Design

- **Approach:** lint là Node ESM script thuần (không dependency mới), cùng phong cách parity script — root từ `fileURLToPath`, `readdirSync`, console + `process.exit(1)`. Registry format greppable: `## ALLOWED` / `## FORBIDDEN`, mỗi cụm 1 dòng `- ...` — lint parse trực tiếp section FORBIDDEN (single source of truth, không nhân bản list vào script).
- **Thuật toán đếm D1 (PIN):** body sau frontmatter → bỏ fenced code-block (```...```) → split `/\s+/` → count. VI [900,1400] (warn >1400, hard-fail >1470); EN floor ≥800 (không trần cứng — style guide ghi trần mềm ~1400 để mirror cân đối).
- **FORBIDDEN greppable (canonical):** `stories tab` · `pairing persist` · `mọi state` · `every state` · `worktree from your phone` · `worktrees from your phone` · `worktree từ phone` · `worktrees từ phone` (case-insensitive, literal — số nhiều liệt kê thành dòng riêng, lint vẫn match literal thuần). **Section contract (PIN):** lintable literals = chính xác các dòng `- ...` trong section `## FORBIDDEN` (parse dừng ở heading `##` kế tiếp); guidance biến thể review-level nằm section riêng `## FORBIDDEN — variants (review-only)` mà lint BỎ QUA — không đưa biến thể mở vào section greppable để tránh literal-chết-tiếng. Biến thể rộng hơn = SF-5 sweep + review bắt nốt; không đưa vào lint để tránh false-positive trên prose chính đáng (vd "resolve gates from your phone" là claim ALLOWED).
- **Draft semantics (PIN):** `draft:true` → skip band + skip docs-link check (D7 fallback SF trễ không được hard-fail build vì thiếu link); VẪN kiểm frontmatter 6 field + kebab + forbidden + type checks (claim bẩn bị chặn bất kể draft). In ra `skipped-draft`. SF-5 sweep sẽ bắt docs-link thiếu ở thời điểm live.
- **Links:** EN `](/docs/<slug>/)`, VI `](/vi/docs/<slug>/)`, slug ∈ `DOC_SLUGS` (hardcode 5 slugs frozen trong script kèm comment trỏ `src/config.ts` — script không import TS được; parity script cũng hardcode-free nhưng nó không cần data từ config). KHÔNG link `#anchor` cross-file.
- **pubDate/category:** cứng theo ma trận epic (D2/D6) — liệt kê trong topic-matrix.md; lint KHÔNG đối chiếu matrix (matrix-completeness = SF-5), chỉ kiểm parse được + enum hợp lệ.
- **Alternatives considered:** (a) lint vi-by-python/third-party markdown parser — bỏ, thêm dependency cho việc regex đủ làm; (b) registry JSON — bỏ, spec D5 yêu cầu greppable 1 cụm/dòng; (c) lint đọc matrix file để đối chiếu pubDate — bỏ, spec D5 liệt kê rõ checks, matrix-completeness là SF-5.
- **Edge cases:** `draft:true` → in `skipped-draft`, bỏ qua band (vẫn kiểm frontmatter + forbidden); bài mới chỉ có 1 locale (giữa-chừng) → parity script đã chặn trước lint; fenced block lồng `~~~` — không hỗ trợ (repo dùng ``` thuần); CRLF — split `/\s+/` ăn cả.
- **Non-functional:** i18n — band VI/EN khác chuẩn (900-1400 vs ≥800); security — script chỉ đọc `src/content/blog`, không exec; perf — 60 file max, O(n) vô hại.

## 5. Implementation outline

**8 execution tasks (phủ đủ 12 bracket tasks — cùng-file gộp 1 commit atomic):**

| # | Task (commit) | Bracket tasks phủ | File | Exit criteria (verifiable) |
|---|---|---|---|---|
| T1 | Topic matrix 20 hàng chốt | topic-matrix-20-committed + pubdate-map-pinned-d2 + category-tags-distribution-d6 | `editorial/2026-blog-longform/topic-matrix.md` | 20 hàng × 8 cột (slug · title hướng · category · pubDate · evidence chính · docs-link target · tags đề xuất · angle ≥2 H2 mới); slug/ngày/category khớp MA TRẬN epic verbatim (gồm `shipping-cadence-two-releases-one-day`, `building-wakii-in-the-open-log-2`); distribution tổng 3 tutorial/13 tech/4 build-log; ghi chú double-day 08-31 & 09-07 |
| T2 | Claims registry greppable | claims-registry-greppable-allow-forbidden | `editorial/2026-blog-longform/claims-registry.md` | `## ALLOWED` + `## FORBIDDEN` mỗi cụm 1 dòng `- ...`; đủ mục context pack mục 3; D8 rule ghi rõ; seeds grandfathered ghi chú |
| T3 | Style guide + frontmatter + tags vocab | style-guide-long-form-structure-wordcount-algo + frontmatter-template-tags-vocab | `editorial/2026-blog-longform/style-guide.md` | Cấu trúc hook→TL;DR→3-5 H2 (mỗi section ≥1 evidence block)→docs→CTA; thuật toán D1 PIN kèm pseudo-code; template frontmatter 6 field; tags vocab 14 cũ + 10 mới có kiểm; quy tắc link D4 + cấm anchor |
| T4 | Evidence pack + snapshot D8 + hub-store digest | evidence-pack-real-materials-numbers-snapshot | `editorial/2026-blog-longform/evidence-pack.md` | Section "Numbers snapshot (D8)" ĐẦU file: ngày chụp + giá trị + output lệnh thật (skills 21/14 · releases v1.4.198+199+mobile · agents 9 · CLIs 24 · posts 10); section "hub-store artifacts": brackets + specs/plans nổi bật, GitHub URL + SF count + quote (re-verify `gh repo view wakii-dev/hub-store` public + `gh api contents` TRƯỚC khi ghi từng link — fi338 bracket local-only chưa lên GH main thì ghi rõ); mọi item ghi nguồn lệnh + ngày |
| T5 | Lint script (deps T2; T3 advisory) | lint-script-band-links-frontmatter-seed-exempt | `scripts/check-blog-content.mjs` | Đúng 6 nhóm check (scope/band+draft/docs-link/frontmatter/kebab/forbidden); frontmatter type checks: title/description non-empty string, tags array-of-strings, pubDate parse được, draft boolean, category ∈ enum; fence không đóng (lẻ ``` ) → lỗi rõ ràng; docs-link check chạy TRÊN body đã bỏ fenced; **test 2 CHIỀU 2 MODE**: (a) gọi trực tiếp `node scripts/check-blog-content.mjs` cả pass + block (bài test sai band/thiếu link/claim cấm → fail đúng file → xóa; pass-case rẻ = bài `draft:true` minimal chứng minh scope+skip), (b) demo chặn ở mức `pnpm build` dùng cặp lỗi CẢ HAI locale (parity pass → lint là gate fail, nêu đúng tên file) |
| T6 | Wiring build (deps T5) | lint-wiring-build-after-parity | `package.json` | `pnpm build` chạy parity → lint → astro build; diff đúng 1 dòng |
| T7 | Runbook (deps T1-T4) | writer-runbook-checklist + d4-rule-in-runbook | `editorial/2026-blog-longform/runbook.md` | Checklist per-post đủ 8 bước (matrix row → evidence+snapshot → outline angle → VI draft band → EN mirror cùng commit → self-lint → claims-check → cross-link ≥1 bài đã tồn tại); D4 rule; D7 draft fallback (flip CẢ HAI locale cùng lượt; draft:true = skip band + docs-link, vẫn frontmatter/kebab/forbidden) |
| T8 | Pilot zero-setup (deps T3,T4,T6) | pilot-post-zero-setup-full-pipeline + d4-rule-and-pilot (phần thực hành) | `src/content/blog/{en,vi}/zero-setup-agent-team.md` | VI 900-1400 (D1) + EN ≥800 cùng commit; tutorial/2026-08-20; ASCII diagram; ≥1 link docs đúng locale; 4 h2 (BlogToc render); lint xanh; `pnpm build` xanh 11 slug × 2; evidence = kit §5 getting-started + paths `~/.claude/bin/story-*` |

**File structure:** editorial content vào `docs/superpowers/editorial/2026-blog-longform/` (spec chỉ định); script vào `scripts/` cạnh parity script; pilot vào `src/content/blog/{en,vi}/` theo collection pattern.

**Testing strategy:** lint two-way test (thủ công theo spec — tạo/sửa/xóa bài test); `pnpm build` xanh làm gate máy; browser verify 3 tầng (listing count + pilot EN/VI render + TOC jump + docs-link locale + về listing, lặp /vi/blog/); code-reviewer độc lập trên diff SF; verifier per-ACCEPTANCE.

## 6. Risks & unknowns

- **Must verify (đã probe Phase 0):** schema/enum ✓ · DOC_SLUGS 5 slugs ✓ · parity script phong cách ✓ · seeds 5 slug ✓ · skills 21/14 ✓ · releases v1.4.198+199 ✓ · hub-store public ✓ · sibling 7 brackets ✓
- **Unverified assumptions:** (1) ngày listing sort theo pubDate desc — pilot 08-20 phải đầu danh sách (build verify sẽ chứng minh); (2) lint chỉ chạy khi slug có trong cả 2 locale? — KHÔNG: lint chạy per-file trên slug ∈ 20 mới; parity chạy trước đã bảo đảm pairs, nên bài nửa-cặp không bao giờ tới lint; (3) VI docs trang tồn tại cho cả 5 DOC_SLUGS (context pack khẳng định, SF-5 re-check resolve).
- **Rollback:** mỗi task 1 commit — revert đơn lẻ được; lint hỏng build thì gỡ 1 dòng wiring là build sạch lại.

## Execution tracker (tick sau mỗi commit)

- [x] T1 topic-matrix.md (20 hàng × 8 cột, D2 pubDate, D6 3/13/4)
- [x] T2 claims-registry.md (ALLOWED/FORBIDDEN greppable + variants review-only + D8)
- [x] T3 style-guide.md (structure + D1 PIN + frontmatter template + tags vocab)
- [x] T4 evidence-pack.md (snapshot D8 đầu file + hub-store digest verified)
- [x] T5 scripts/check-blog-content.mjs (6 nhóm check + test 2 chiều 2 mode)
- [x] T6 package.json wiring 1 dòng sau parity
- [ ] T7 runbook.md (8 bước per-post + D4 + D7)
- [ ] T8 pilot zero-setup-agent-team VI+EN (lint xanh + build xanh)
