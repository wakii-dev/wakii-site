# Plan: SF-3 Series B — Tác vụ dài (7 bài) — FI-362 (story FI-359)
Date: 2026-09-07 | Linear: FI-362 | Worktree: sf-3-series-b-long-tasks
Spec: docs/superpowers/contexts/fi359-longform-sf-3.md (slice đã duyệt ở epic)
Kit: docs/superpowers/editorial/2026-blog-longform/ (matrix · claims-registry · style-guide · evidence-pack · runbook)

## 0. Root cause analysis (WHY)

### Root cause
Epic FI-359 có tiêu chí thành công "hoàn thành dự án với tác vụ dài" — nhưng 10 seed hiện có
không bài nào chứng minh cơ chế xử lý task dài (bracket+tier, worktree isolation, bộ nhớ ngoài,
1 PR, done=evidence, convergence, cadence ship). Thiếu bằng chứng published → claim workflow
không kiểm chứng được công khai.

### Current state (before feature)
`src/content/blog/` có 6 slug × 2 locale (5 seed FI-341 + pilot zero-setup-agent-team SF-1).
Listing /blog/ + /vi/blog/ render từ collection; lint `check-blog-content.mjs` + parity gate
đã wire vào `pnpm build` (SF-1). Series B chưa tồn tại.

### Expected outcome
7 slug mới × 2 locale đọc được trên listing đúng ngày matrix (#8 27-08 → #14 02-09), badge/
mô tả đúng, mỗi bài có TOC (≥3 H2), evidence thật tra cứu được (hash/release/PR public),
lint xanh, build xanh — parity 13 slug × 2 locale (5 seed + pilot + 7 mới).

### Constraints & hardships
- Band từ D1: VI 900–1400 (prose bỏ fenced; >1470 hard-fail) · EN ≥800. Fenced không đếm từ
  → diagram nhiều làm tụt band, phải bù prose.
- D2/D6 CỨNG: slug/pubDate/category không đổi. Angle: ≥2 H2/bài mà KHÔNG seed nào có.
- Cross-link chỉ trỏ bài ĐÃ commit trước đó (series A SF-2 chưa merge trên base `e99cdd0`).
- Mọi link GitHub artifact KÈM quote nguyên văn trong bài (chống link-chết).
- KHÔNG nhắc v1.4.197 (không tồn tại trên public repo). fi338 bracket hub-store local-only —
  KHÔNG link; link spec dispatch-queue trên GitHub main thay.

### High-level strategy
VI-first per post (draft trong band) → EN mirror cùng commit → self-lint → claims-check vs
registry → build xanh → commit atomic (1 commit = 1 cặp VI+EN của 1 slug). 7 bài chạy tuần tự
trong CÙNG worktree (tránh race git index), nhóm review rolling: sau T4 (T1–T4) và sau T7
(T5–T7); T8 consistency-pass tổng.

## 1. Problem (intent, NOT solution)
Độc giả blog wakii.xyz cần thấy — bằng vật liệu thật công khai, không phải lời quảng cáo —
rằng workflow agent chạy được dự án dài nhiều tuần: chiaBracket/tier, chạy song song cô lập,
nhớ ngoài, hội tụ QA và ship nhanh. Người đọc: dev đánh giá công cụ agent-team.

## 2. Scope
- In scope: đúng 14 file `src/content/blog/{en,vi}/<7 slug>.md` (matrix #8–#14) + tick plan
  file này sau mỗi task. Commit per-pair. Không file nào khác.
- Out of scope: series A/C, seeds, pilot, editorial kit, lint/pages/config, bare contexts/sf-N.md
  (của FI-349), mọi sửa code. Sai gì thấy ngoài phạm vi → flag lên epic FI-359.
- Success criteria (observable — ACCEPTANCE pack):
  1. /blog/ + /vi/blog/ thấy đủ 7 bài mới, đúng ngày 27/28/29/31-08 + 31-08 + 01-09 + 02-09,
     badge/mô tả đúng (đọc presence+ngày+badge — listing sort DESC, KHÔNG đọc vị trí).
  2. Từng bài 2 locale: band đúng, TOC render, MỖI H2 section ≥1 evidence block
     (style-guide §1.3 — diagram/transcript/bảng THẬT, mỗi block kèm dòng
     *Nguồn: <lệnh/file/URL>, lấy <ngày>.* theo format evidence-pack), ≥1 link docs
     đúng locale không #anchor, ≥1 cross-link bài đã tồn tại, không emoji trong thân
     (⚡/🌳 được vì là tên UI).
  3. `pnpm build` xanh toàn chain: parity exit 0 (13 slug sau SF-3 = 5 seed + pilot + 7 mới,
     × 2 locale = 26 file; nếu series A merge trước thì số tăng — pass là điều kiện, không
     cứng số) + content lint pass toàn bộ cây của SF-3.
  4. lint forbidden-grep 0 hit trên 7 bài mới.
  5. Mỗi bài đối chiếu claims-registry (ALLOWED + FORBIDDEN + variants) trước commit.

## 3. Touch map
- Files TẠO: `src/content/blog/en/{long-tasks-bracket-tiers, parallel-worktrees-isolation,
  linear-as-external-memory, one-branch-one-pr, done-means-evidence, convergence-qa-last-tier,
  shipping-cadence-two-releases-one-day}.md` + `src/content/blog/vi/<cùng 7 slug>.md`.
- Consumers (regression candidates): blog listing EN+VI, RSS `rss.xml.js` (tự nhặt post mới —
  pubDate phải đúng), sitemap, TOC component (≥3 H2), hreflang (parity).
- Shared surfaces: KHÔNG (không đụng API/DB/config/env — content thuần).

## 4. Design
- Approach: đúng matrix D2/D6 — 7 bài theo hàng #8–#14, VI-first + EN mirror, evidence từ
  evidence-pack + material verify-live 2026-09-07 (đã chụp, xem §5 per-task).
- Alternatives: (a) EN-first — loại, trái runbook (VI primary); (b) viết song song nhiều
  agent chung worktree — loại, race git index + commit atomic vỡ; (c) 1 commit gộp nhiều bài
  — loại, mất đơn vị rollback + review sạch (runbook: 1 bài = 1 commit).
- Edge cases: double-day 08-31 (2 bài #11 #12 — thứ tự glob chấp nhận, cosmetic); fenced
  fence-lẻ → lint báo lỗi rõ; VI quote docs PHẢI nguyên văn docs VI (bài học review SF-1).
- Non-functional: i18n = mirror cùng nghĩa, cùng ngày/category/tags, docs-link đúng locale
  (D4: VI `/vi/docs/<slug>/`, EN `/docs/<slug>/`); a11y kế thừa component; security = không
  secret, không path máy cá nhân trong evidence (chỉ `~/.claude/` + repo paths công khai).

## 5. Implementation outline

Testing strategy: sau mỗi task chạy `node scripts/check-blog-content.mjs` (exit 0) + đếm từ
band; sau T7 chạy `pnpm build` xanh toàn chain; T8 = consistency-pass (cross-read 7 bài) +
build lần cuối. Review độc lập: code-reviewer rolling trên nhóm commit (T1–T4, T5–T7).

### Tasks (ordered — mỗi task 1 commit, tick `[x]` sau khi xong)

- [x] **T1 — `long-tasks-bracket-tiers`** (tech · 2026-08-27 · docs-link story-workflow ·
  tags: story-workflow, workflow, linear)
  Angle: "Bracket là bản đồ dự án dài" · "So quy mô hai bracket thật". Evidence: bracket
  FI-339 thật trong repo `docs/superpowers/brackets/fi339-blog-features.md` (3 SF: tier 0
  SEO FI-340 / tier 1 seed FI-341 / tier 2 QA FI-342) SO QUY MÔ với bracket hub-store
  `fi245-postgres-production` 28 SF — link
  `https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/fi245-postgres-production.md`
  KÈM quote nguyên văn từ evidence-pack: "SF-1 Postgres infra + seed pipeline" (12 tasks:
  compose postgres 2 DB initdb, healthcheck, seed pipeline script…) và "SF-2 Orders Java →
  Postgres". ASCII diagram so quy mô 2 bracket + tier. Docs quote: VI nguyên văn
  "### 5. Tier và một nhánh đích duy nhất" (`src/content/docs/vi/story-workflow.md`) /
  EN "### 5. Tiers and one destination branch". Cross-link: seed
  story-workflow-idea-to-release (đúng locale).

- [x] **T2 — `parallel-worktrees-isolation`** (tech · 2026-08-28 · docs-link agents-and-kit ·
  tags: worktree, git, agents)
  Angle: "Mỗi SF một worktree" · "Commit atomic là đơn vị rollback". Evidence: transcript
  `git worktree list` THẬT — RE-CAPTURE lệnh tại thời điểm viết và paste output NGUYÊN VĂN
  vào bài (không tóm lược) + ghi "*Nguồn: git worktree list, lấy <ngày>.*". Tham chiếu:
  capture 2026-09-07 cho thấy 7 worktrees lúc 2 story chạy song song — FI-349: sf-2-blog-detail
  @099136f, sf-3-blog-listing @c441f34, sf-4-blog-convergence @7e8c286; FI-359:
  sf-2-series-a-self-working, sf-3-series-b-long-tasks, sf-4-series-c-evidence @e99cdd0 +
  main checkout @73d0e55 (danh sách thay đổi theo thời gian là expected — snapshot có ngày).
  Giải thích vì sao 2 agent không giành file (dir riêng + branch riêng + commit atomic).
  Docs-link: agents-and-kit (task-executor "Implement task trong worktree biệt lập, commit
  atomic" — VI nguyên văn bảng vai). Cross-link: bài T1.

- [x] **T3 — `linear-as-external-memory`** (tutorial · 2026-08-29 · docs-link story-workflow ·
  tags: linear, story-workflow, workflow)
  Angle: "Bộ nhớ ngoài cho đội agent" · "Audit comment tái tạo được". Evidence: cấu trúc
  body sub-issue THẬT — chép NGUYÊN VĂN field thật, KHÔNG bịa field. Hai nguồn đối chiếu:
  (1) hub-store `fi245-postgres-production` (link GitHub
  `https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/fi245-postgres-production.md`)
  — fetch raw 2026-09-07, field thật là `Tier · linear · What · Depends on · Tasks`;
  block nguyên văn dùng làm transcript: "## SF-1 Postgres infra + seed pipeline / Tier: 0 /
  linear: FI-246 / What: compose postgres (2 DB qua initdb, healthcheck, volume)… /
  Depends on: — / Tasks: compose-postgres / initdb-2-databases / …"; (2) bracket FI-339
  local `docs/superpowers/brackets/fi339-blog-features.md` — cùng khung + thêm `Design:`
  (field thật: Tier · linear · Design · What · Depends on · Tasks). Lưu ý: spec slice ghi
  "(Tier/Depends/Bracket/What/Tasks)" — KHÔNG có field "Bracket" trong body thật của cả 2
  bracket; viết theo field THẬT đã fetch (deviation này flag ở Linear comment, không sửa
  spec). Kèm quote hub-store: fi280 "SF-1 Baseline + Rubric (Tier 0)" — "Boot-verify full
  stack main @ d107f2f 7/7 ports; chạy 25 e2e specs baseline đỏ/xanh"; audit-trail "đánh
  dấu, không xoá": fi232 bracket SUPERSEDED quote "File này chỉ còn là audit trail (Linear
  FI-232 Canceled)" + link bracket fi232 GitHub. Vì sao chat log không phải memory: docs
  quote §2 Plan EN "published to Linear as subtasks, so progress is visible to the whole
  team — not buried in a chat log" (quote dạng prose — EN docs xuống dòng giữa câu) / VI
  nguyên văn "Plan được bẻ thành task nhỏ và publish lên Linear dưới dạng subtask, nên
  tiến độ cả team nhìn thấy — không chôn trong chat log." Cross-link: bài T2.

- [x] **T4 — `one-branch-one-pr`** (tech · 2026-08-31 · docs-link story-workflow · tags: git,
  story-workflow, workflow)
  Angle: "PR là bằng chứng tổng" · "Merge-ngược an toàn". Evidence: 2 PR #1 thật — wakii-site
  PR #1 "FI-339: Blog features — tutorials, tech notes, build logs (en/vi)" merge `3d9a7c3`
  (2026-09-07) + hub-store PR #1 "FI-326: BFF API docs Swagger (OpenAPI) — 84 REST endpoints
  / 12 tags" merge `0144d80` (2026-09-06, từ `story/fi326-api-docs-swagger`) — verify
  `gh pr list --repo <repo> --state merged` 2026-09-07 ✓. 1 diff tự sự vs 30 commit rải rác
  (docs P5). Docs quote §7 "Một PR cho mỗi story" / "One PR per story" ("one clean PR — not
  a dozen interleaved branches"). Cross-link: bài T3 hoặc T1.

- [x] **T5 — `done-means-evidence`** (tech · 2026-08-31 · docs-link story-workflow · tags: qa,
  evidence, story-workflow)
  Angle: "Self-report không counts" · "Verifier làm lại từ đầu". Evidence: case FI-342 7/7
  PASS + 0 fix commit + story-verify exit 0 (đúng docs mô tả, KHÔNG tô); qa-rubric hub-store
  thật — link `https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/qa-rubric.md`
  KÈM quote nguyên văn (đã fetch raw 2026-09-07): "GROUND TRUTH cho SF-2..7" + triage
  "P0 — chặn flow chính hoàn toàn (không login được, không tạo order, data mất)" + escape
  hatch "1 SF tìm > 8 bug P2 → STOP fix, log hết lên epic". Docs quote VI §3 "Gates thay vì
  niềm tin" / EN '"The agent says it works" is not evidence'. Cross-link: pilot
  zero-setup-agent-team hoặc seed decision-gates-safe-ai-agents.

- [ ] **T6 — `convergence-qa-last-tier`** (tech · 2026-09-01 · docs-link story-workflow ·
  tags: qa, story-workflow, workflow)
  Angle: "Tier cuối không viết gì mới" · "Explained diff cũng phải giải thích". Evidence:
  FI-342 explained-diff — commit `9d4d460` = SITE_URL wakii.dev→wakii.xyz (owner confirm
  2026-09-07) xuất hiện trong baseline diff và được GIẢI THÍCH theo nhóm tag (canonical/
  hreflang/noindex bất biến; og:*/rss additions = expected diff); hub-store convergence
  story thật: link spec
  `https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/specs/2026-09-03-sf11-fe-convergence-design.md`
  KÈM quote "SF-11 FE Convergence — Audit viewer + Export UI + Mobile + Harmonize — Design".
  Docs quote tier principle (tier boundary = merge point). Cross-link: bài T5.

- [ ] **T7 — `shipping-cadence-two-releases-one-day`** (build-log · 2026-09-02 · docs-link
  getting-started · tags: release, build-log, wakii)
  Angle: "Nhịp ship và giá của nó" · "Assets version-named nghĩa là gì". Evidence: releases
  verify LIVE 2026-09-07 `gh release list --repo wakii-dev/wakii`: v1.4.199 Latest
  `2026-09-05T19:07:31Z` · v1.4.198 `2026-09-05T12:47:15Z` · pre-release Android
  `mobile-android-v0.0.48` `2026-09-05T13:00:31Z` — 2 release + 1 pre-release CÙNG ngày
  09-05; KHÔNG nhắc v1.4.197. Assets version-named: comment thật trong `src/config.ts`
  ("URL pattern: v1.4.198 switched to VERSION-NAMED assets, so URLs pin an exact release —
  a version bump means updating these lines.") + URL thật pin v1.4.199. Cadence = hệ quả
  workflow (SF nhỏ merge được verify nhanh). Cross-link: seed building-wakii-in-the-open-log-1.

- [ ] **T8 — series-b consistency pass** (không file nội dung mới trừ fix nhỏ)
  Đọc chéo 7 bài × 2 locale: (1) tone nhất quán kỹ sản; (2) MỖI bài có ≥1 cross-link bài đã
  tồn tại đúng locale; (3) không 2 bài dùng cùng evidence chính (đối chiếu bảng trên);
  ngoại lệ theo matrix: FI-342 là evidence dùng chung T5 (khía cạnh verdict 7/7 PASS +
  verifier độc lập) và T6 (khía cạnh explained-diff `9d4d460`) — evidence CHÍNH của T6 là
  hub-store sf11-fe-convergence story; (4) mỗi bài ≥2 H2 mới so seed; (5) mỗi H2 có ≥1
  evidence block kèm dòng nguồn (style-guide §1.3 + evidence-pack format); (6) lint 0 hit
  toàn cây SF-3; (7) `pnpm build` xanh; (8)
  listing EN+VI đếm đủ 7 bài mới đúng ngày. Fix nhỏ (wording/link) commit riêng
  `fix(blog): series-b consistency pass`. Kết quả đối chiếu ACCEPTANCE §2 từng dòng.

## 6. Risks & unknowns
- Must verify (đã làm 2026-09-07): releases gh ✓ · 2 PR #1 + merge SHA ✓ · qa-rubric raw ✓ ·
  worktree list ✓ · config.ts comment ✓ · lint scope chứa đủ 7 slug ✓ · FI-339 bracket tồn tại ✓.
- Unverified assumptions: (a) số parity sau SF-3 = 13 slug (5 seed + pilot + 7 mới) × 2 locale —
  pack ghi "≥18/≥17 slug × 2" theo cách đếm khác (10 seed posts = 5 slug); parity exit 0 là
  điều kiện duy nhất (pack: "không cứng số"); (b)
  series A có thể merge trước khi SF-3 xong → build lúc đó parity tăng — không sao, không link
  mù sang series A; (c) worktree list trong bài T2 ghi "tại thời điểm viết 2026-09-07" —
  danh sách thay đổi theo thời gian là expected, transcript là snapshot thật.
- Claims-check bắt buộc mỗi bài trước commit (runbook bước 7): số nào không có nguồn → bỏ hoặc
  re-extract kèm nguồn+ngày. KHÔNG dùng "always/never/mọi trường hợp" không bằng chứng.
