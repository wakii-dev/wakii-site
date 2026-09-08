# Spec — Blog batch 2: hoàn thiện mọi facet (44 bài mới → 69 slug × 2 locales)

Umbrella: FI-365 (Blog 100 bài). Batch 2 phủ toàn bộ facet còn lại (user: "All of above" 2026-09-07).
Baseline: main @ PR #3 merge (`17ce2bf` + integration fix `42b06c1`). Nền editorial FI-359 tái dùng 100% (lint/template/claims/style-guide/evidence pattern).

## IDEA-BRIEF

- **Task**: viết ~44 bài longform mới + mở rộng hạ tầng editorial cho scope mới.
- **Output**: ~69 slug × EN/VI ≈ 138 trang bài; lint/audit phủ toàn bộ; 4 facet còn lại có nội dung.
- **Users**: độc giả dev/product; crawlers.
- **Constraints (MUST)**: giữ contracts pinned (OG article, RSS bilingual, i18n LOCKED, URL posts); style guide FI-359 (900-1400 từ VI + EN mirror cùng commit); claims registry + evidence thật; 2 bài/ngày.
- **Success criteria**: build + parity + lint xanh toàn bộ ~69 slug; mọi bài ≥1 docs link; claims không vượt snapshot mới; browser walkthrough EN+VI; listing/category/RSS/sitemap/JSON-LD phản ánh đúng số bài.
- **Out-of-scope**: MDX, collection mới, đổi URL cũ, pagination (DEC-3: giữ flat), tag pages, đa ngôn ngữ mới.

## DECISIONS (coordinator chốt theo khuyến nghị P0 — user có thể veto tại STORY-READY)

| # | Decision | Chốt |
|---|---|---|
| DEC-1 | Matrix | **44 slug CHỐT CỨNG** (bảng dưới) — không "~55" (P0: facets cộng tối đa 44) |
| DEC-2 | Category enum | **Giữ 3 giá trị** (tutorial/tech/build-log) — skills/features/arch phân vào `tech`, guides vào `tutorial`, logs vào `build-log`; chấp nhận tech chiếm đa số (honest cho dev tool) |
| DEC-3 | Listing 69 posts | **Giữ flat** — zero-JS, không pagination batch này (batch 3 xét lại nếu nặng) |
| DEC-4 | Lint/audit scope | **B1 refactor: all-non-seed** — script đọc manifest slug (seed = 5 FI-339) thay vì hard-code list; hết cảnh "quên append = bài ngoài gate" |
| DEC-5 | Hero | **10 flagship PINNED** (skill-brainstorm, skill-story-workflow, skill-orca-superpowers-workflow, skill-frontend-design, skill-mock-prototype, feature-computer-use-native, feature-terminal-splits, guide-first-story-end-to-end, arch-electron-process-model, building-wakii-in-the-open-log-3) — render do content SF sở hữu thực hiện SAU khi bài tồn tại (pipeline đọc frontmatter — render trước = ENOENT); 21/25 bài hiện có không hero, pattern fallback OK |
| DEC-6 | Cadence + future-date policy | **Giữ 2 bài/ngày**, pubDate 09-09 → 09-30 pre-assigned. **POLICY (a)**: future-date HỢP LỆ khi pubDate ∈ matrix (bài "lịch đăng" hiện đầu listing sort desc — chấp nhận, là announce schedule). SF-1 sửa audit T7: future-date chỉ FAIL khi pubDate ∉ matrix (không so `> TODAY` nữa) |
| DEC-7 | Docs-link | Chấp nhận stretch-link vào 5 DOC_SLUGS hiện có (agents-and-kit/story-workflow là target tự nhiên cho đa số) |
| DEC-8 | Verify-shipped | **BẮT BUỘC trước khi viết 8 bài features**: đối chiếu code orca local + release v1.4.199 — feature chưa ship → claim chuyển tương lai hoặc bỏ bài |
| DEC-9 | Cấu trúc | 1 story, infra-SF trước (B1), rồi 4 content SF song song + convergence |

## Claims drift phải xử lý ngay (SF-1)

- `src/data/skills.ts` hiện **20 entries / 13 public** — snapshot D8 (21/14) stale. SF-1 refresh claims-registry + evidence-pack snapshot (mọi số kèm ngày lấy), audit script `SNAPSHOT` object cập nhật theo.
- 8 features: verify-shipped pass → ghi kết quả vào claims-registry (SHIPPED trong v1.4.199 / MAIN-ONLY / ROADMAP) — bài chỉ được claim theo nhãn.

## MATRIX 44 SLUG (CHỐT CỨNG — pubDate 2/ngày từ 09-09)

**Skills ×13** (tech; hero: 5 flagship đầu): `skill-brainstorm` / `skill-writing-plans-linear` / `skill-story-workflow` / `skill-orca-superpowers-workflow` / `skill-frontend-design` / `skill-gpt-taste` / `skill-design-taste-frontend` / `skill-image-to-code` / `skill-mock-prototype` / `skill-web-design-guidelines` / `skill-figma-orientation` / `skill-graph-engineering` / `skill-prompt-master`
**Features ×8** (tech; sau verify-shipped): `feature-terminal-splits` / `feature-ssh-worktrees` / `feature-design-mode` / `feature-ai-diff-annotation` / `feature-emulator-android` / `feature-computer-use-native` / `feature-per-workspace-env` / `feature-notification-keyboard`
**Guides ×10** (tutorial): `guide-install-update` / `guide-first-story-end-to-end` / `guide-mobile-pairing` / `guide-ssh-remote` / `guide-custom-skill-101` / `guide-cloud-relay` / `guide-worktree-workflow` / `guide-linear-github-wiring` / `guide-multi-session-ports` / `guide-troubleshooting`
**Architecture ×11** (tech): `arch-electron-process-model` / `arch-relay-cloud` / `arch-native-computer-use` / `arch-site-bento-tokens` / `arch-site-motion-i18n` / `arch-auto-update-feed` / `oss-why-fork-mit` / `oss-upstream-sync` / `oss-brand-monogram` / `oss-release-roundup-14x` / `arch-ci-gates`
**Build-logs ×2** (build-log): `building-wakii-in-the-open-log-3` / `building-wakii-in-the-open-log-4`

## SF breakdown (anti-duplicate: lint/audit scope = SF-1 một lần; docs-link/en-link = Zweck mỗi bài; không SF nào ≥50% trùng loại)

**Consistency-pass exit (mọi content SF)**: (1) lint green (partial-tree-tolerant by design) (2) cross-links CHỈ trỏ slug ∈ matrix 64 (grep-local) (3) tone/structure checklist reviewer. **Audit T7 ĐỎ giữa batch là EXPECTED** (matrix slugs chưa đủ file) — chỉ SF-6 yêu cầu green toàn bộ. Intra-SF edges: matrix commit TRƯỚC audit refactor; claims-registry TRƯỚC verify-shipped; hero-render SAU flagship posts. Editorial docs (registry/matrix/style-guide/evidence-pack) FROZEN sau SF-1 — thêm mục qua coordinator.

### SF-1 Editorial infra — scope manifest + claims refresh (Tier 0)
**What**: hạ tầng phủ batch 2 — lint/audit đọc all-non-seed manifest (hết hard-code), claims-registry + evidence snapshot refresh (skills 20/13 + verify-shipped 8 features), 10 hero tiles flagship, matrix 44 slug commit kèm pubDate. Demo data-level: lint CHẶN được 1 bài batch-2 giả lập sai band; audit SNAPSHOT không còn stale; 8 feature có nhãn SHIPPED/MAIN-ONLY/ROADMAP.
**Depends on**: —
**Exit criteria (verify được)**:
- Lint manifest: bài giả lập sai band THUỘC manifest BỊ CHẶN; file lạ NGOÀI manifest bị BÁO (không skip im lặng)
- Audit T7 + matrix gate: **phủ 64/64 non-seed** (20 batch-1 + 44 batch-2 — parse CẢ HAI bảng topic-matrix.md + matrix batch-2, tổng 64 rows; KHÔNG drop matrix gate batch-1) · future-date ∈ matrix PASS, ∉ matrix FAIL · 6 hard-code điểm refactor xong: T5 expectedLive derived · T7 cards.length → live-derived · T7 rows.size → 64 · SNAPSHOT → skills 20/13 + releases mới · T3 FAMILIES + family batch-2 · T6 SAMPLES → sample theo facet batch-2 (hoặc full-sweep 64×2 — fs-read rẻ)
- Verify-shipped: 8 nhãn SHIPPED/MAIN-ONLY/ROADMAP ghi registry kèm bằng chứng (commit/release ref) — **registry + evidence-pack §Numbers refresh CÙNG commit, cùng ngày chụp** (audit T3 contract source trỏ cả hai file)
- Probe skills-drift: artifact định danh (finding + file:line) ghi vào registry drift-note — không có artifact = verifier không đóng gate
- Hero pipeline demo cụ thể: fixture post → render 1 PNG 1200×630 → assert → revert
- Lint manifest: derive từ frontmatter scan (`heroImage` frontmatter → hero slug) — KHÔNG hard-code list (diệt collision 4-SF trên render-blog-heroes.mjs)
- Hero: pipeline sẵn sàng, CHƯA render (posts chưa tồn tại — render là việc content SF)
**Tasks (10)**: lint-refactor-all-non-seed-manifest / audit-t7-future-date-matrix-policy / audit-snapshot-refresh-5-hardcode-points / claims-registry-extend-batch2 / verify-shipped-8-features-vs-release / matrix-44-commit-table-format / hero-pipeline-parameterize-derive-from-frontmatter / style-guide-tags-vocab-extend / runbook-update-batch2 / probe-skills-drift-rootcause

### SF-2 Series Skills — 13 bài (Tier 1)
**What**: 13 bài deep-dive từng public skill (đúng thứ tự category: 4 workflow → 6 design → 3 reference) — command, cách làm việc (đọc source skill thật làm evidence), khi nào dùng, ví dụ thật từ stories đã chạy. Demo: 13 bài đọc được EN+VI đúng band, mỗi bài link đúng docs/related skill.
**Depends on**: SF-1
**Tasks (15)**: 13× skill-post-<tên> (5 flagship PINNED kèm heroImage-wiring-2-locale: brainstorm, story-workflow, orca-superpowers-workflow, frontend-design, mock-prototype; 8 còn lại KHÔNG hero) / hero-render-5-flagship / series-skills-consistency-pass

### SF-3 Series Features — 8 bài (Tier 1)
**What**: 8 bài product features theo nhãn verify-shipped — mỗi bài: feature làm gì, code ở đâu (sibling orca READ-ONLY), trải nghiệm thực tế, giới hạn. Demo: 8 bài EN+VI, claims khớp 100% nhãn registry.
**Depends on**: SF-1
**Tasks (10)**: 8× feature-post-<tên> (2 flagship PINNED kèm heroImage-wiring-2-locale: computer-use-native, terminal-splits; 6 còn lại KHÔNG hero) / hero-render-2-flagship-features / series-features-consistency-pass

### SF-4 Series Guides — 10 bài (Tier 1)
**What**: 10 bài tutorial từng bước (tutorial category) — cài đặt, first story end-to-end, mobile pairing, SSH remote, custom skill 101, cloud relay, worktree workflow, Linear/GitHub wiring, multi-session ports, troubleshooting. Demo: làm theo được từ đầu đến cuối trên máy sạch.
**Depends on**: SF-1
**Tasks (12)**: 10× guide-post-<tên> (guide-first-story-end-to-end kèm heroImage-wiring-2-locale; 9 còn lại KHÔNG hero) / hero-render-1-flagship-guide / series-guides-consistency-pass
**Exit criterion guides**: mỗi guide — commands cross-check vs docs/CLI hiện hành + ≥1 lệnh dry-run thật kèm transcript; walkthrough máy sạch = user-manual gate sau merge (không verify autonomous được)

### SF-5 Series Architecture + OSS + Logs — 13 bài (Tier 1)
**What**: 11 bài arch/OSS (Electron process model, relay cloud, native computer-use, site Astro bento/motion-i18n, auto-update feed, why-fork MIT, upstream sync, brand monogram, release roundup, CI gates) + 2 build-logs (#3, #4 — evidence từ chính 2 story đang chạy). Demo: 13 bài EN+VI, claims theo snapshot mới.
**Depends on**: SF-1
**Tasks (15)**: 11× arch-oss-post-<tên> (arch-electron-process-model kèm heroImage-wiring-2-locale; 10 còn lại KHÔNG hero) / hero-render-2-flagship-arch-log / build-log-3-post / build-log-4-post-vừa-hoàn-tất-evidence / series-arch-consistency-pass
**Build-logs evidence-floor**: chỉ cite arc/SF ĐÃ hoàn tất (FI-349, FI-359 — đều STORY-COMPLETE + merged) + số từ snapshot SF-1 kèm ngày; không đủ evidence → `draft:true` (lint hỗ trợ, tự loại khỏi listing/RSS/related)

### SF-6 Convergence QA — 69 slug release-ready (Tier 2)
**What**: toàn bộ ~69 slug × 2 locales release-ready — build + parity + lint (all-non-seed) xanh, band sweep 44 bài mới, claims sweep vs snapshot SF-1, links resolve (44×≥1 docs link), RSS ~138 items bilingual, sitemap/hreflang đủ, listing flat 69×2 render + JSON-LD, browser walkthrough EN+VI mẫu mỗi facet, review độc lập + release readiness. Demo: audit end-to-end một lượt pass.
**Depends on**: SF-2, SF-3, SF-4, SF-5
**Tasks (11)**: lint-parity-green-all / word-band-sweep-44 / claims-sweep-vs-snapshot / links-resolve-locale-e2e / rss-sitemap-hreflang-full-scale / jsonld-audit-69-slug-blogposting / listing-flat-69-render-en-vi-category-pages-6-audit-count / related-posts-invariants-25-old / browser-walkthrough-en-vi-per-facet / independent-review-verdict / release-readiness-build-smoke
**Related invariants (không assert output-freeze)**: 25 bài cũ — ≥1 related không rỗng, mọi link resolve, không draft leak, cùng locale (output SẼ đổi khi 44 bài mới vào pool — đúng kỳ vọng)

## Risks

1. **Lint scope âm thầm** — đã xử lý gốc (B1 manifest) nhưng SF-1 phải verify "bài giả lập sai band BỊ CHẶN" trước khi mở khóa content SFs.
2. **Claims drift** — skills 20/13 hiện tại là ground truth; MỌI số trong bài phải tra snapshot SF-1 (kèm ngày), không dùng memory.
3. **Verify-shipped** — 8 feature posts không được viết trước khi có nhãn; feature MAIN-ONLY → claim "đang trên main, sắp ra release" hoặc bỏ bài.
4. **EN mirror workload** — 44 × 2 ngôn ngữ trong 1 story: mỗi SF tự chịu mirror cùng commit (runbook FI-359), convergence chỉ audit.
5. **Listing 69×2 flat** — chấp nhận long-page (DEC-3); đo LCP deployed tại SF-6.

## Boundary (KHÔNG làm)

Pagination · category enum thứ 4 · MDX · collection mới · hero cho mọi bài · đổi contracts pinned · tag pages · đa tác giả.
