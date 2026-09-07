# Plan: SF-5 Convergence QA — 30 posts release-ready — FI-364 (story FI-359)
Date: 2026-09-08 | Linear: FI-364 | Worktree: sf-5-convergence-qa
Spec: docs/superpowers/contexts/fi359-longform-sf-5.md (slice đã duyệt ở epic — 10 check + ACCEPTANCE + boundary)
Kit: docs/superpowers/editorial/2026-blog-longform/ (matrix · claims-registry · style-guide D1 · evidence-pack D8 · runbook)
Base: story/fi359-blog-longform-20 @ `b02979b` (đủ SF-1..4 — KHÔNG merge thêm gì)

## 0. Root cause analysis (WHY)

### Root cause
Story đã merge SF-1..4 nhưng chưa từng chứng minh trạng thái HỘI TỤ trên MỘT nhánh đích:
"30 posts build xanh, claims sạch, links resolve, RSS/sitemap đúng contract" là claim
chưa có bằng chứng. Mỗi SF chỉ tự kiểm phần của mình trên base riêng.

### Current state (before feature)
Dest @ `b02979b` chứa 30 posts (10 seed posts + 20 bài mới = 25 slug × 2 locale =
50 file) + lint/parity wire từ SF-1 +
editorial kit. Chưa có convergence audit nào chạy trên dest. 2 drift đã biết từ memory:
skills 20/13 (file thật) vs 21/14 (snapshot D8 `skills.ts`); fi338 spec hub-store cần
spot-check. 2 flag SF-3: glob-loader WARN "Duplicate id"; VI seed "tab Stories"
(grandfathered — seeds miễn theo registry).

### Expected outcome
Audit chạy end-to-end một lượt PASS trên dest: 10 check có kết quả định lượng
(bảng per-post), browser Rule 0 3 tầng thấy được, review độc lập APPROVED,
verdict READY-FOR-PR lên epic. Fail content → escalate SF sở hữu (QA không sửa).

### Constraints & hardships
- QA KHÔNG sửa content/kit — fail chuyển Dev SF sở hữu (SF-2=FI-361 A, SF-3=FI-362 B,
  SF-4=FI-363 C), re-check sau fix. FAIL đầu tiên escalate NGAY, không chờ đủ 10 check.
- D1 là thuật toán PIN: prose bỏ fenced; VI 900–1400 (>1470 hard-fail; 1400–1470 warn
  + lý do), EN ≥800.
- D8: sweep đối chiếu SNAPSHOT — drift nguồn tại QA = ghi chú, KHÔNG fail.
- D2/D6 gate máy: slug + category + pubDate khớp matrix 20/20 — sai 1 hàng = fail.
- KHÔNG deploy (CD broken), KHÔNG merge main, KHÔNG đụng redesign FI-349.
- Audit output scrub path máy cá nhân (`/Users/hoivu` → `~`) — P1 đã dính ở SF-3.

### High-level strategy
1 audit script máy duy nhất (`scripts/audit-blog-convergence.mjs` — tài sản SF-5,
chỉ ĐỌC content + dist, GHI output) chạy check 2–7 reproduce-grade sau khi `pnpm build`
(check 1) xanh; browser Rule 0 3 tầng coordinator tự nhìn (check 8); code-reviewer độc
lập trên diff toàn story (check 9); tổng hợp readiness (check 10). Merge audit-script
commit vào dest no-ff sau khi sạch; gate `story-verify sf-5`; FI-364 Done sau merge.

## 1. Problem (intent, NOT solution)
Trước khi PR, coordinator + user cần MỘT bảng kết quả duy nhất chứng minh 30 posts đủ
sạch để publish công khai (wakii.xyz) — không phải niềm tin từ self-report của 4 SF,
mà là audit máy + browser + reviewer độc lập chạy lại từ đầu trên đích merge.

## 2. Scope
- In scope: `scripts/audit-blog-convergence.mjs` (MỚI) + audit output (Linear comments
  FI-364 + epic FI-359) + plan tick. Merge commit của nhánh SF vào dest.
- Out of scope: mọi file content (50 md blog), editorial kit, lint script SF-1, pages/config,
  `package.json`, deploy, main. Thấy lỗi ngoài phạm vi → flag epic FI-359.
- **Số liệu ground truth (verified trên dest `b02979b`, plan-critic P0 xác nhận):
  25 slug × 2 locale = 50 file (20 slug mới theo matrix + 5 seed slug); parity gate
  báo "25 posts × 2 locales"; lint scope 20 slug mới = 40 file + 5 seeds exempt;
  dist listing 25/locale; RSS 50 items (1 feed bilingual).** Pack check-1 ghi
  "15 slug × 2 / 30 posts / 60 file" — lỗi số học của PACK (15 = 30/2 sai dẫn;
  60 = 30×2 double-count seed) → NOTE spec-level lên epic, KHÔNG phải content-fail.
  "30 posts" đúng theo quy ước đếm bài của story (10 seed posts + 20 bài mới).
- Success criteria = ACCEPTANCE pack, kiểm từng dòng (không process-pass) theo số
  THẬT:
  1. `pnpm build` trên dest xanh một lượt — parity exit 0 (25 slug × 2) + lint
     0 fail (40 file mới checked, 5 seeds exempt, 0 skipped-draft).
  2. Listing EN+VI đủ 25 bài live/locale, 08-20 → 09-07 xen kẽ 10 seed tự nhiên,
     không ngày tương lai, không draft lộ.
  3. 3 bài mẫu đọc mượt: TOC chạy, evidence thật, link docs đúng locale, GitHub
     hub-store spot-check 200.
  4. Epic có 1 comment tổng hợp QA: bảng 10 check × kết quả + verdict.

## 3. Touch map
- TẠO: `scripts/audit-blog-convergence.mjs` (1 file, node ≥20, zero-dependency —
  chỉ fs/path, KHÔNG thêm package). Output → **stdout only** (KHÔNG ghi file vào
  `src/` hay `dist/` — dist phải nguyên vẹn cho T5-T7).
- ĐỌC: `src/content/blog/{en,vi}/*.md` (50), `src/content/blog/en + vi` seeds,
  `dist/**` (html/xml), `src/pages/rss.xml.js`, kit 5 file, `scripts/check-blog-content.mjs`.
- Regression candidates: KHÔNG (read-only trên content; script không nằm trong build
  chain — KHÔNG đụng `package.json`).
- Shared surfaces: KHÔNG.

## 4. Design
- Approach (Direction A đã chốt Phase 0): 1 script máy cho check 2–7 thay vì lệnh rời —
  output tabular reproduce-grade, D1 implement đúng style-guide §2, scrub `os.homedir()`
  trong mọi path in ra.
- Alternatives đã loại: (b) lệnh rời ghi tay — không reproduce, D1 dễ lệch; (c) dispatch
  nhiều executor song song chạy check rời — chi phí phối hợp > lợi ích, output khó ghép
  bảng; browser Rule 0 thì LUÔN coordinator tự làm (không giao agent).
- Edge cases: draft fallback D7 (expected-live = **50 − slug-draft×2** — 1 feed
  bilingual đếm cả 2 locale; phải khớp danh sách skipped-draft được flag); double-day
  08-31 + 09-07 (2 bài/ngày — thứ tự glob cosmetic); GitHub link 404-với-quote = ghi
  chú không fail (pack check 4); **seeds: miễn band + miễn locale-link rule (VI seed
  link `/docs/` grandfathered FI-341) + miễn forbidden — sweep seeds = inventory
  read-only, lệch gì cũng chỉ là NOTE, không enforce**; anchor trong chính bài được
  nhưng phải tồn tại thật trong dist HTML (heading id).
- Non-functional: security — script không exec nội dung md, chỉ regex/fs; output scrub
  home path; KHÔNG secret trong audit comment. Perf — 1 lượt fs read 50 file + dist,
  nhỏ. Maintenance — script standalone, ghi đầu đề nguồn contract (pack + D1).

## 5. Implementation outline

Testing strategy: script tự in `CHECK n: PASS/FAIL/NOTE` + bảng chi tiết ra stdout;
audit script COMMIT ngay sau khi T2–T7 pass (trước T9) để nằm trong diff T9 review;
coordinator cross-verify ≥3 số then chốt bằng lệnh độc lập (P5) — ghim vào exit
criteria T10: (1) D1 word count của ≥2 bài đối chiếu đếm tay `awk`, (2) RSS
`grep -c '<item>' dist/rss.xml`, (3) listing card count `grep -o` href trên dist
listing; browser tự nhìn; reviewer + verifier độc lập. FAIL content → comment epic
tag SF sở hữu → tiếp tục. DAG: T2–T7 = MỘT executor chạy tuần tự (sub-step của 1
script, không spawn 6 worker); T8 ∥ T9 chạy được song song sau khi script commit.

### Tasks (ordered — map 1:1 với 10 check của pack)

- [x] **T1 — lint-parity-green-all-30** (check 1)
  `pnpm build` trên worktree (branch = base dest `b02979b`). Exit criteria: exit 0;
  parity log **"25 posts × 2 locales"**; lint **"40 new-slug files checked,
  0 skipped-draft, 5 seeds exempt"**, 0 fail, warn >1400 được phép (liệt kê nếu có);
  `ls src/content/blog/{en,vi}` = **25 file/locale (50 tổng)**; dist = 25 blog
  pages/locale. Capture WARN glob-loader "Duplicate id" nếu xuất hiện → đối chiếu
  dist unique slug (25/locale, 0 trùng) → no-op note. (Build đã chạy lúc Phase 3:
  exit 0, WARN KHÔNG tái hiện — flag SF-3 resolved-as-no-op, chốt lại lần chạy này.)

- [x] **T2 — word-band-sweep-20-new** (check 2)
  Script D1: body sau frontmatter, strip fenced (fence-lẻ = lỗi), đếm `\s+` split.
  Bảng 20 bài × 2 locale: VI 900–1400 (1400–1470 = WARN + yêu cầu lý do trong bài;
  >1470 FAIL), EN ≥800. Seeds miễn (liệt kê tên, không đếm).

- [x] **T3 — claims-sweep-vs-snapshot-d8** (check 3)
  (a) Grep FORBIDDEN literal (8 cụm) trên 40 file mới — 0 hit (lint đã chặn, sweep
  xác nhận lại); grep variants review-only (list cụm paraphrase trong registry) — 0 hit.
  (b) Số-liệu-in-bài vs snapshot D8: skills 21/14 · releases v1.4.198/199 + Android
  v0.0.48 · 9 agents · 24 CLIs · hub-store public · blog 10 seed → mỗi citation trong
  bài phải khớp snapshot + kèm "tại thời điểm viết"/ngày. (c) Drift check tại QA:
  re-extract `src/data/skills.ts` (đếm entry + public:true) và `gh api hub-store` —
  khác snapshot → GHI CHÚ drift (không fail). Kết quả: bảng claim × bài × verdict.

- [x] **T4 — links-resolve-locale-e2e-no-dead-anchor** (check 4)
  **Scope enforce = 40 FILE MỚI (20 slug × 2).** Seeds: inventory read-only — link
  nào lệch rule chỉ NOTE (VI seed `/docs/` là grandfathered FI-341, KHÔNG fail).
  Trên 40 file mới: `/docs/<slug>/` từ EN post, `/vi/docs/<slug>/` từ VI post
  (slug ∈ 5 DOC_SLUGS), cross-link `/blog/<slug>/` + `/vi/blog/<slug>/`, `/skills/`,
  `/download/` → phải có route tương ứng trong `dist/`. KHÔNG link cross-file kèm
  `#fragment`; anchor trong chính bài → script verify id tồn tại trong dist HTML của
  BÀI ĐÓ (heading id render). GitHub hub-store links: mỗi link phải có quote nguyên
  văn trong bài (điều kiện CỨNG); spot-check `gh api` HEAD 3 link mẫu (bao gồm fi338
  spec `2026-09-07-dispatch-queue-design.md` — drift memory) → 200 = PASS,
  404-có-quote = ghi chú.

- [x] **T5 — rss-expected-live-items-contract** (check 5)
  Script parse `dist/rss.xml`: item count = expected-live = **50 − slug-draft×2**
  (1 feed bilingual — mỗi slug sống contribute 2 items EN+VI; 0 draft hiện tại →
  kỳ vọng 50; ít hơn → khớp danh sách skipped-draft được flag); mỗi `<guid>`
  absolute đúng locale (`/blog/` vs `/vi/blog/`); KHÔNG có `<language>`; `<pubDate>`
  khớp frontmatter từng item. Contract FI-339 SF-1 pinned.

- [x] **T6 — sitemap-hreflang-full** (check 6)
  Script parse `dist/sitemap-*.xml`: đủ URL posts live + 2 listings; 3 slug mẫu × 2
  locale (chọn zero-setup-agent-team · convergence-qa-last-tier ·
  wakii-in-production-hub-store): hreflang pair đủ 2 chiều (en/vi) + x-default +
  canonical đúng; grep dist HTML 3 bài mới: `og:type` = article + `og:published_time`
  khớp pubDate frontmatter (contract FI-339 rev 2).

- [x] **T7 — listing-en-vi-render-live-count + frontmatter-vs-matrix 20/20** (check 7)
  Script parse `dist/blog/index.html` + `dist/vi/blog/index.html`: **25 bài live mỗi
  listing** (25 slug × 1 locale), sort pubDate desc, badge category + ngày hiển thị
  khớp frontmatter, không slug trùng, không draft lộ, không ngày tương lai. Đối chiếu
  20 bài mới vs `topic-matrix.md`: slug + category + pubDate khớp 20/20 — sai 1 hàng
  = FAIL (gate máy D2/D6).

- [x] **T8 — browser-walkthrough-en-vi-rule0** (check 8 — Rule 0 3 tầng, coordinator
  TỰ làm qua Orca browser, không giao agent)
  Serve `dist/` (preview local). Tầng 1 DOM: eval đếm card listing EN = live-count,
  VI = live-count. Tầng 2 VISUAL: screenshot 2 listing + 3 bài mẫu (pilot
  zero-setup-agent-team [mở series A] · convergence-qa-last-tier [B] ·
  wakii-in-production-hub-store [C]) — screenshot cần tab focus. Tầng 3 FLOW cả 2
  locale: listing → bài → TOC anchor jump → cross-link sang bài khác → về listing.
  Không THẤY = không xác nhận. Browser pixel: tab background làm screenshot timeout —
  cần focus; eval luôn chạy.

- [x] **T9 — independent-review-verdict** (check 9)
  Dispatch `code-reviewer` trên TOÀN BỘ diff story (dest vs main: 40 md + lint script +
  package.json wiring + **audit script SF-5** — script đã commit trước T9): bug/thể
  thức + phán định risk #4 trùng-góc-nhìn-seed (mỗi bài angle ≥2 H2 mới — cột angle
  trong matrix là đầu vào, rationale per-post) + claims sweep độc lập (đọc registry
  variants). Verdict 1 dòng APPROVED / CHANGES-REQUESTED. CHANGES-REQUESTED → comment
  epic chuyển Dev (QA không tự sửa) → re-check sau fix.

- [x] **T10 — release-readiness-build-smoke** (check 10)
  Tổng hợp: bảng 10 check × PASS/FAIL/NOTE + danh sách skipped-draft (nếu có) +
  3 cross-check độc lập của coordinator (D1 tay / RSS grep / listing grep) + build
  smoke cuối (re-run `pnpm build` nếu có fix commit giữa chừng) → verdict
  READY-FOR-PR (hoặc BLOCKED-liệt-kê) comment lên FI-364 + epic. KHÔNG deploy,
  KHÔNG merge main.

### Sau T10 (checklist chạy tiếp — ngoài 10 check)
1. Commit audit script đã commit từ sau T7 (trước T9 — nằm trong diff review);
   nếu còn chỉnh sau review-fix thì commit follow-up riêng.
2. MERGE no-ff vào `story/fi359-blog-longform-20`: guard 1 — dest tip vẫn `b02979b`
   (re-read trước merge); guard 2 — `b02979b` là ancestor của nhánh SF; merge-ngược
   an toàn (temp worktree nếu cần); KHÔNG sửa content khi merge. Comment merge-hash
   lên FI-364.
3. GATE CỨNG `~/.claude/bin/story-verify sf-5` — sạch mới qua bước Done.
4. FI-364 → Done + comment tổng hợp bảng 10 check lên FI-364 + epic FI-359.

## 6. Risks & unknowns
- Skills 20/13 (file thật) vs 21/14 (snapshot D8) — luật D8: drift tại QA = ghi chú
  trong báo cáo + epic, không fail (bài đã ghi "tại thời điểm viết" là đúng contract).
- fi338 spec trên hub-store main — pack bảo "đã có trên main"; spot-check thật ở T4,
  404-có-quote → ghi chú (không fail) + flag coordinator.
- Glob-loader WARN "Duplicate id" — verify no-op ở T1 qua dist unique slug + listing.
- VI seed "Review AI agents" còn "tab Stories" — grandfathered theo registry (seeds
  miễn), ghi chú không fail.
- node_modules vừa install lần đầu trong worktree — build lần đầu có thể chậm; không
  phải signal lỗi.
- pnpm repo: KHÔNG commit `package-lock.json` (pnpm-lock.yaml là lock thật).
