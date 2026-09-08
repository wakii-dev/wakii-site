# Plan: FI-373 SF-2 — Series Skills, 13 bài deep-dive public skills (FI-375)

Date: 2026-09-08 | Linear: FI-375 | Worktree: `wakii-dev/sf-2-blog-skills`
Dest branch: `story/fi373-blog-batch2` @ `422e86f` | Spec rev 3: `docs/superpowers/specs/2026-09-08-blog-batch2-design.md` | Context pack: `docs/superpowers/contexts/fi373-sf-2.md`
Team: task-executor ×13 (viết) + code-reviewer (rolling theo wave) + verifier + security-audit (claims/links/evidence) + rollback-fixer (khi cần).

## 0. Root cause (1 đoạn)

Facet skills là khối lớn nhất còn thiếu của batch 2 (13/44). Mỗi bài có đúng một
evidence chuẩn: **source skill thật** trong kit (`~/.claude/skills/<name>/SKILL.md`)
— paraphrase docs là FAIL. Batch-1 chỉ có 1 bài chung về skills (`skills-catalog-tour`
— tour kệ sách); 13 bài này là mở từng cuốn sách → không được trùng góc.

## 1. Scope

- **In:** 26 file `src/content/blog/{en,vi}/skill-*.md` (13 slug × 2 locale, 1 commit
  = 1 cặp) · heroImage 2 locale cho đúng 5 flagship (brainstorm, story-workflow,
  orca-superpowers-workflow, frontend-design, mock-prototype) + render
  `node scripts/render-blog-heroes.mjs` SAU khi bài tồn tại (PNG+SVG cùng commit hero) ·
  1 consistency-pass commit (cross-link giữa 13 bài, chỉ sau khi cả 13 tồn tại) ·
  plan file này.
- **Out:** features/guides/arch posts (SF-3/4/5) · scripts (SF-1 frozen) · taxonomy/
  enum/pages/utils · editorial docs (FROZEN) · GitHub-link tới file chưa lên main.
- **Success (từ context pack ACCEPTANCE):** listing EN+VI đủ 13 bài đúng matrix,
  badge tech + reading-time; mở bài thấy command + cơ chế nội bộ + ví dụ story thật +
  docs-link đúng locale; 5 flagship hero 1200×630 không vỡ layout, 8 bài không hero
  sạch; EN↔VI switch giữ bài; mobile 390 no-overflow; VI band 900-1400 (hard-fail
  1470), EN ≥800; ≥1 docs link/bài; cross-links ∈ matrix 64.

## 2. 13 bài — angle RIÊNG mỗi bài (chống trùng góc trong facet)

| # | slug | pubDate | hero | Angle (H2 skeleton riêng) | Ví dụ story thật |
|---|------|---------|------|---------------------------|------------------|
| 1 | skill-brainstorm | 09-09 | YES | Câu hỏi trước câu trả lời — một-câu-hỏi-một-lần, thách giả định, spec là sản phẩm | FI-373 epic: "All of above" (09-07) → matrix 44 CHỐT CỨNG + DEC-1..9 trong spec rev 3 |
| 2 | skill-writing-plans-linear | 09-09 | no | Plan cho người KHÔNG có ngữ cảnh; publish mode → subtask Linear; plan = bộ nhớ ngoài | Plan SF-1 FI-359 trong `docs/superpowers/plans/` (root-cause "SF-1 sai thì 19 bài sau sai theo"); DAG run_f0d1d8765e24 5/5 |
| 3 | skill-story-workflow | 09-10 | YES | Một epic — nhiều SF — một đích; bracket + tier; watchdog | Bracket FI-373 (6 SF, tier 0/1/2, "editorial docs FROZEN"); FI-359 5 SF song song |
| 4 | skill-orca-superpowers-workflow | 09-10 | YES | 6 phase — 5 bridge — một lệnh; principles; loop caps | FI-359 SF-3: 3 vòng CHANGES-REQUESTED→fix→APPROVED; merge race chặn bởi CAS guard |
| 5 | skill-frontend-design | 09-11 | YES | Taste có nguyên tắc: bám thế giới chủ đề, 1 rủi ro thẩm mỹ có lý do | FI-349 redesign Bento (`designs/sf1-direction.md`), tokens.css authority, `--radius-cell` |
| 6 | skill-gpt-taste | 09-11 | no | Chống mặc định thống kê của AI (6-line wrap, layout lặp); randomization thật | Slot F8 trong orca-superpowers-workflow (trích source workflow — có thật); FI-349 bento listing |
| 7 | skill-design-taste-frontend | 09-12 | no | Audit-first SAU build; đọc brief suy intent; máy kiểm được ≠ mắt thẩm mỹ | Trigger contract của chính skill (chỉ load ở P8.6, không load khi mock); FI-349 convergence |
| 8 | skill-image-to-code | 09-12 | no | Ảnh lớn theo section → 1 component; fidelity target; anti cards-in-cards | Hero tile 1200×630 pattern + F8 slot bước 5; khi KHÔNG dùng (layout nguyên trang) |
| 9 | skill-mock-prototype | 09-13 | YES | 3 hướng HTML, link unlisted, chọn rồi mới build; zero code production | Pattern "direction doc" trong repo: `designs/sf1-direction.md` + `sf-downloads-direction.md` (AS-BUILT) |
| 10 | skill-web-design-guidelines | 09-13 | no | 105 quy tắc kiểm bằng code (a11y/focus/form/animation); vendored MIT chạy offline | Slot F8; "bắt lỗi ảnh không thấy được" — focus/focus-visible, target size |
| 11 | skill-figma-orientation | 09-14 | no | Router pattern: đúng skill/trước khi gọi tool; failure class nó chặn | Story này chưa cần Figma (prototype = HTML) — bài nói khi nào nó LÊN sân khấu; P8 golden rule |
| 12 | skill-graph-engineering | 09-14 | no | Hai nửa: knowledge graph (nhớ gì) + task graph (điều phối thế nào) | 9-agent team = task graph thật: deps cap 4, verifier tách executor; DAG FI-359/FI-373 |
| 13 | skill-prompt-master | 09-15 | no | Prompt là sản phẩm có spec: intent → tool đích → 1 prompt khóa format | Launch prompt SF (FI-373): token contract + checklist là prompt được thiết kế |

Cross-link mỗi bài (commit thời điểm đó, chỉ bài ĐÃ tồn tại): ≥1 bài batch-1/seed
(skills-catalog-tour · nine-agents-separated-powers · story-workflow-idea-to-release ·
linear-as-external-memory · done-means-evidence · gates-not-trust-rule-zero ·
long-tasks-bracket-tiers · story-memory-learning-loop) + docs-link matrix. Link chéo
giữa 13 bài chỉ trong consistency-pass (khi cả 13 đã commit).

## 3. Thực thi

- **Wave A (4 agents song song):** #1-4 workflow. **Wave B (6):** #5-10 design.
  **Wave C (3):** #11-13 reference.
- **Agent viết, coordinator commit:** agent KHÔNG commit (tránh race git index
  chung cây); DONE report → tôi lint riêng từng cặp → commit `feat(blog): <slug>
  VI+EN (matrix #N)` theo từng bài (1 bài = 1 commit, giữ parity xanh mỗi commit).
- **Rolling review:** sau mỗi wave commit xong → code-reviewer ĐỘC LẬP trên commit
  range wave đó (không đọc working tree), song song với wave kế. CHANGES-REQUESTED
  → fix → re-review trước merge.
- **Hero render:** sau khi ≥5 flagship đã commit → `node scripts/render-blog-heroes.mjs`
  (re-render mọi hero hiện có — deterministic) → `--check` → commit PNG+SVG 5 slug.

## 4. Verify + merge

1. Lint toàn bộ + `pnpm build` xanh (chain parity → blog-utils → blog-content → astro).
2. Verifier độc lập: từng dòng ACCEPTANCE context pack → PASS/PARTIAL/FAIL.
3. Rule 0 browser 3 tầng: DOM (listing 13 bài, badge/date/reading-time, đủ EN+VI) /
   VISUAL (screenshot listing + 1 bài mở, mobile 390) / FLOW (mở bài → đọc → related →
   lang-switch). Orca browser pixel timeout là gotcha đã biết → pixel qua headless
   Chrome ngoài, nói thật nếu không chụp được.
4. Security-audit scoped: frontmatter claims, links, evidence trích dẫn, path-leak
   `/Users/hoivu` (P1 precedent FI-359 `46550bb`).
5. Merge recipe (memory FI-374): temp worktree ATTACH `story/fi373-blog-batch2`
   (KHÔNG --detach) → ancestor-guard (merge-base == 422e86f; dest nhích → re-merge
   dest vào nhánh SF trước) → `git merge --no-ff` → remove worktree → push. Conflict
   improvements-log → giữ CẢ HAI.
6. 1 audit comment batch (merge hash + evidence) lên FI-375 → `~/.claude/bin/
   story-verify sf-2` sạch → FI-375 Done + task_30d0f6ec5908 completed.

## 5. Risks

Trùng góc trong facet (đã pre-assign angle) · band trượt (agent self-lint + lint
per commit) · path-leak trong transcript (brief cấm + security pass) · EN mirror
lệch cấu trúc (reviewer) · render hero trước khi bài tồn tại (ordering guard: chỉ
chạy sau commit flagship) · lint T7 đỏ giữa batch là EXPECTED (matrix chưa đủ file).
