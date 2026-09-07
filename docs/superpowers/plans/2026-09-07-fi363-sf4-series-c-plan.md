# Plan: FI-359 SF-4 — Series C: Workflow & dẫn chứng (FI-363)

Date: 2026-09-07 | Linear: FI-363 | Worktree: `wakii-dev/sf-4-series-c-evidence`
Dest branch: `story/fi359-blog-longform-20` | Spec: `docs/superpowers/specs/2026-09-07-blog-longform-20-posts-spec.md` | Context pack: `docs/superpowers/contexts/fi359-longform-sf-4.md` | Kit: `docs/superpowers/editorial/2026-blog-longform/` (5 file)

## 0. Root cause analysis (WHY — before "what")

### Root cause
Epic FI-359 cần tiêu chí 'dẫn chứng minh hoạ': độc giả phải tự kiểm được lời bài viết bằng CODE/ARTIFACT THẬT, không phải tin lời kể. Series A (agents) và B (tác vụ dài) kể cơ chế; thiếu một series đọc thẳng repo + artifact công khai. Nguyên nhân gốc của loại bài này dễ hỏng: **evidence bịa hoặc paraphrase từ trí nhớ** — registry D8 + runbook double-pass sinh ra để chặn đúng cái đó.

### Current state (before feature)
Trên nhánh đích `e99cdd0`: blog có 12 post (6 slug × 2 locale = 5 seed + pilot). Series C chưa tồn tại. Các file evidence nguồn đã được SF-1 pin trong evidence-pack (digest hub-store + numbers snapshot D8).

### Expected outcome
6 slug × 2 locale đọc được trên listing (đúng ngày 03→07-09, badge đúng category), mỗi bài ≥1 evidence block có nguồn, bài case-study/deep-dive link GitHub artifact kèm quote thật. `pnpm build` xanh (parity + content lint). Claims double-pass + consistency pass riêng cho series.

### Constraints & hardships
- Slug/pubDate/category CỨNG theo matrix D2/D6 — không tự chọn.
- KHÔNG sửa file code wakii-site (file code chỉ ĐỌC làm dẫn chứng); KHÔNG đụng repo hub-store (chỉ dùng digest đã verify trong evidence-pack).
- KHÔNG link GitHub tới bracket `fi338-dispatch-queue` (local-only) — trỏ spec đã có trên main.
- Cross-link chỉ trỏ bài ĐÃ tồn tại trên nhánh (5 seed + pilot + bài series C commit trước đó — task chạy 15→20).
- Band VI 900-1400 (hard-fail 1470) / EN ≥800; prose bỏ fenced (D1); 1 commit = 1 cặp VI+EN.

### High-level strategy
Content-only, additive. Mỗi bài đi đủ 8 bước runbook (outline chốt trong plan này → task-executor chỉ viết theo outline). Máy hóa phần kiểm được (lint + parity trong build); phán định accuracy qua claims double-pass độc lập; phán định series-consistency qua pass riêng.

## 1. Problem (intent, NOT solution)

Người đọc bài case-study phải mở được link GitHub và thấy đúng đoạn được trích; người đọc bài anatomy phải dò được đúng dòng code trong repo. Bài sai một citation = cả epic mất tiêu chí 'dẫn chứng'.

## 2. Scope

- **In scope:** 12 file mới `src/content/blog/{en,vi}/{6 slug}.md`; task claims-double-pass; task consistency-pass. Nhánh chứng minh build xanh.
- **Out of scope:** mọi file khác (READ-ONLY — kể cả file code dùng làm evidence); seeds/pilot/editorial-kit/lint/pages/package.json; bài series A/B; repo hub-store; deploy.
- **Success criteria (ACCEPTANCE từ context pack — đọc theo presence + ngày + badge, KHÔNG theo vị trí vì listing sort DESC):**
  1. `/blog/` + `/vi/blog/` thấy **6 bài mới** đúng ngày 03→07-09-2026, badge/mô tả đúng.
  2. Từng bài mở được ở 2 locale: band đúng, TOC (≥3 H2), code-block trích dẫn thật, link docs đúng locale; **#16 có ≥3 link GitHub artifacts hub-store, mỗi link kèm quote thật trong bài**; #15/#17/#18 có trích code đúng file.
  3. `pnpm build` xanh: parity (số slug = điều kiện pass, không cứng số — trên nhánh này 12 slug × 2) + content lint pass toàn bộ 12 file.
  4. Lint forbidden-grep 0 hit trên 6 bài (proxy — sweep đầy đủ ở SF-5).

## 3. Touch map

- **Tạo:** `src/content/blog/en/{blog-story-case-study, wakii-in-production-hub-store, og-article-contract-anatomy, rss-bilingual-feed-anatomy, skills-catalog-tour, building-wakii-in-the-open-log-2}.md` + bản VI cùng slug.
- **Consumers/regression:** parity gate (đếm slug — commit 2 locale cùng lần nên không lệch); content lint (12 file mới nằm trong NEW_SLUGS); RSS (+12 items, sort DESC); listing EN/VI (badge + date + sort DESC); sitemap/hreflang (tự sinh từ collection).
- **READ-ONLY evidence nguồn:** `scripts/check-blog-slug-parity.mjs` · `src/pages/blog/[slug].astro` · `src/layouts/Base.astro` · `src/pages/rss.xml.js` · `src/data/skills.ts` + `src/pages/skills.astro` · `src/config.ts` · `src/content/docs/en/story-workflow.md` · seed log-1 · pilot.

## 4. Design — outline chốt từng bài (BALANCED: chi tiết tự quyết, khung = pack)

Quy ước chung mọi bài: frontmatter 6 field theo template; VI viết trước trong band → EN mirror CÙNG COMMIT (cùng ngày/category/tags, H2 EN cùng trật tự ý); mỗi section ≥1 evidence block kèm dòng *Nguồn: …, lấy 2026-09-07*; fenced block không đếm từ (chống độn); không emoji; thuật ngữ tên riêng giữ tiếng Anh; link docs chỉ tới TRANG (không #anchor cross-file); transcript/ASCII chỉ từ vật liệu thật (chạy lệnh thật khi viết, không bịa output).

### T1 — `blog-story-case-study` (build-log · 2026-09-03 · tags: build-log, story-workflow, evidence · docs: story-workflow)
- Title VI "Case study: chính blog này là một story" / EN "Case study: this blog is itself a story".
- **H2-1 "Parity gate sống trong build"** — quote header comment `check-blog-slug-parity.mjs` ("EN and VI slug sets must match 1:1 — hreflang pairs and the /vi/blog/ routes are derived from the same slugs") + dòng `build` trong `package.json` (parity → lint → astro). Evidence: code quote + ASCII chuỗi build.
- **H2-2 "Contract đọc được trong code"** — quote comment og contract trong `[slug].astro` ("posts are articles — pinned in spec FI-339 rev 2") + Props contract trong `Base.astro`. Ý: spec sống ngay nơi thay đổi xảy ra, không sống trong tài liệu rời.
- **H2-3 "Một nhánh đích, một PR"** — transcript git thật: `55e5ae1` (review-fixes FI-341) + merge PR #1 `3d9a7c3`. KHÔNG gắn mốc ngày sự kiện merge trong prose (bài backdate 09-03, merge xảy ra sau — plan-critic P1): chỉ hash + số PR, nếu cần ngữ cảnh thời gian thì dùng dạng tương đối ("về sau được merge thành PR #1"). Nguồn: `git log --all` repo này.
- **H2-4 "Tự kiểm bằng ba lệnh"** — chỉ người đọc cách tự verify: grep parity script, xem PR trên GitHub public `wakii-dev/wakii-site`, chạy `pnpm build`. Cross-link: seed `building-wakii-in-the-open-log-1` (cùng chuyện nhìn từ ngoài — bài này mổ bên trong máy).
- Claims dùng: 10 seed posts (5 slug × 2 — registry ALLOWED); PR #1 + `3d9a7c3` + `55e5ae1` (đã verify `git show`); repo public MIT (ALLOWED).

### T2 — `wakii-in-production-hub-store` (build-log · 2026-09-04 · tags: build-log, story-workflow, evidence · docs: story-workflow) — FLAGSHIP
- Title VI/EN: "Wakii in production: hub-store".
- **H2-1 "Dự án là gì"** — hub-store: platform vận hành kho — React microfrontends (Module Federation) + BFF Fastify + gRPC polyglot Java/Go/Python + Postgres/Kafka/Keycloak, Turborepo (nguồn: matrix/evidence-pack — KHÔNG thêm chi tiết kỹ thuật ngoài pack). ASCII stack diagram.
- **H2-2 "Hành trình qua các bracket"** — timeline 5 bracket đã link + 1 đang chạy, MỖI link GitHub kèm quote thật (từ evidence-pack D3, đã verify trên main 2026-09-07):
  1. `brackets/ict-service-support-rebuild.md` — quote "File này chỉ còn là audit trail (Linear FI-232 Canceled)" → luật đánh dấu-không-xoá.
  2. `brackets/fi233-polyglot-grpc-mf.md` — quote "SF-1 FE Foundation + Spikes" + "KHÔNG SF UI start trước verdict SPIKE 1-3" → spike-first.
  3. `brackets/fi245-postgres-production.md` — quote "SF-1 Postgres infra + seed pipeline" → 28 SF, hạ nền tảng dữ liệu.
  4. `brackets/fi272-minikube-deploy.md` — quote "SF-1 K8s platform foundation + Postgres + Kafka" → lên K8s/minikube.
  5. `brackets/fi280-qa-hub-store-regression.md` — quote "Boot-verify full stack main @ d107f2f 7/7 ports; chạy 25 e2e specs baseline đỏ/xanh" → QA regression tier 0.
  6. Đang chạy `fi338-dispatch-queue` → **KHÔNG link bracket (local-only)** — link spec `specs/2026-09-07-dispatch-queue-design.md`, quote "SF-1 Data & contract foundation" (Migration V15 recipient/read_at vào notification_log; permission keys `dispatch.view/assign`).
  → ASCII timeline bracket → SF.
- **H2-3 "Quy mô đọc được từ artifact"** — bảng 7 bracket × số SF (7+11+28+5+8+9+6 = **74 SF**, phép cộng từ pack — ghi nguồn); repo public verified 2026-09-07 (`gh repo view` isPrivate false — pack D8 row 6); specs 32 / plans 53 file trên main "tại thời điểm viết" (pack D3).
- **H2-4 "Vì sao đây là dẫn chứng thật"** — chống link-chết: mọi link kèm quote trong bài; người đọc diff được quote vs file trên GitHub. Cross-link: #15 (story của blog này) + seed `story-workflow-idea-to-release`.
- Cấm: không bịa thêm SF name/tier ngoài pack; không link fi338 bracket.

### T3 — `og-article-contract-anatomy` (tech · 2026-09-05 · tags: og, seo, wakii · docs: faq)
- Title VI "Anatomy: hợp đồng OG article của blog" / EN "Anatomy: the OG article contract on this blog".
- **H2-1 "Vì sao og:image phải là URL tuyệt đối"** — quote Props comment `Base.astro`: "relative og:image values are dropped silently by social crawlers (Facebook/X/Zalo)" + dòng `new URL(ogImage, Astro.site)`. ASCII: props → `<meta>` tags.
- **H2-2 "og:type article và published_time nghĩa gì"** — quote `[slug].astro` (truyền `ogType="article"` + `publishedTime`) + dòng render `article:published_time` trong Base. Ý: trang bài viết tự khai báo là article với timestamp ISO — crawler/preview dựa vào đó; đừng overclaim hành vi từng platform (chỉ nói mức contract).
- **H2-3 "Một dòng, cả hệ thống đúng"** — default `/og-default.png`; mọi trang (không chỉ blog) nhận og:image absolute miễn phí; contract comment nằm đúng chỗ dev sẽ sửa.
- **H2-4 "Tự kiểm trên trang thật"** — transcript thật từ `dist/` sau build: `<meta property="og:type" content="article">` + `og:image content="https://wakii.xyz/og-default.png"` (chạy thật, paste output, ghi nguồn + ngày).
- Docs-link faq (câu dẫn trung thực: tự build site từ nguồn để xem markup — FAQ chỉ cách). Cross-link: #15.

### T4 — `rss-bilingual-feed-anatomy` (tech · 2026-09-06 · tags: rss, wakii, workflow · docs: faq)
- Title VI "Anatomy: RSS feed song ngữ" / EN "Anatomy: the bilingual RSS feed".
- **H2-1 "Một feed, hai ngôn ngữ"** — quote `rss.xml.js`: getCollection toàn bộ, sort DESC theo pubDate; prefix `/vi` per locale. ASCII: 1 feed → items EN + VI xen kẽ theo ngày.
- **H2-2 "Trade-off: bỏ thẻ <language>"** — quote comment file: "bilingual feed → NO <language> element". Ý: một feed không thể khai báo một ngôn ngữ cho cả hai; reader dựa vào nội dung từng item. Nói mức contract, không giáo điều spec.
- **H2-3 "guid là permalink tuyệt đối"** — quote dòng `customData: <guid>${new URL(link, site).href}</guid>`; hai locale cùng slug → hai URL khác nhau → item phân biệt được. ASCII: slug `x` → `/blog/x/` + `/vi/blog/x/` → 2 guid.
- **H2-4 "Đọc feed thật"** — transcript thật: `curl -s http://localhost:4321/rss.xml | head` (hoặc grep dist) thấy 2 item cùng slug khác locale, guid absolute. Nguồn + ngày.
- Docs-link faq (build từ nguồn để đọc `rss.xml.js` trên máy bạn). Cross-link: #17 (anatomy anh em) + pilot `zero-setup-agent-team` (nếu hội dòng tự nhiên).

### T5 — `skills-catalog-tour` (tutorial · 2026-09-07 · tags: skills, agents, wakii · docs: superpowers-panel)
- Title VI "Tour kỹ năng public của Wakii" / EN "A tour of Wakii's public skills".
- **SỐ LIỆU (D8 re-extract TẠI LÚC VIẾT 2026-09-07 — đã verify, KHÔNG dùng 21/14 của pack):** module `skills.ts` định nghĩa **20 skill**; `/skills/` hiển thị **13 public** (workflow 4 → design 6 → reference 3), nhóm platform-internal không lên trang. Nguồn: `src/data/skills.ts` (20 entry `id: '…'`; 13 entry `public: true`) + comment `skills.astro` ("filter public === true → 13 skills"). Mọi con số trong bài ghi kèm "tại thời điểm viết".
- **H2-1 "Skill là thứ agent load on-demand"** — skill = tài liệu quy trình agent đọc khi cần (không nạp sẵn); catalog `/skills/` là mặt public: command + làm gì + hoạt động thế nào.
- **H2-2 "Ba nhóm, mười ba kỹ năng"** — bảng 3 nhóm (workflow/design/reference) + đếm + ví dụ tiêu biểu từng nhóm (story-workflow, brainstorm / frontend-design, mock-prototype / graph-engineering, prompt-master). Quote hero trang: "{publicCount} skills, fully explained" → 13.
- **H2-3 "Đọc số liệu lúc viết, đừng nhớ"** — bài học D8 cho người đọc: số skill tăng theo kit; quy tắc = re-extract + ghi ngày, đừng trích số nhớ-cache. Demo transcript thật: `grep -c "id: '" src/data/skills.ts` → `20`; `grep -A6 "id: '" src/data/skills.ts | grep -c "public: true"` → `13` (chạy thật khi viết).
- **H2-4 "Tự tay xem"** — mở `/skills/`, hoặc grep trực tiếp `skills.ts` từ repo public MIT. Docs-link superpowers-panel (kit tự cài — panel ⚡ là chỗ agent dùng skill). Cross-link: pilot `zero-setup-agent-team` (kit cài skills vào `~/.claude/`).

### T6 — `building-wakii-in-the-open-log-2` (build-log · 2026-09-07 · tags: build-log, wakii, release · docs: getting-started)
- Title VI "Xây Wakii công khai — log 2" / EN "Building Wakii in the open — log #2" (khớp họ log-1).
- **KHÔNG lặp log-1** (log-1: FI-305 mobile + release 1.4.199 + meta blog-is-story). Log-2 = số liệu của story blog lần này + dự án thật. KHÔNG claim v1.4.197 (forbidden — log-1 grandfathered, bài mới không được).
- **H2-1 "Blog 10 → 30"** — log-1 lúc đó 10 posts (5 slug × 2); story FI-359 viết thêm 20 slug × 2 → **30 posts** khi khép (nguồn D8 rows 5+7). Tại thời điểm viết, bài đang hạ cánh theo sub-feature.
- **H2-2 "Hai story blog, một parity gate"** — FI-339 (10 seed + SEO surface) + FI-359 (longform 20 slug) — cùng một parity gate + content lint chạy trong MỌI build, chặn cả 30; sai một nửa cặp locale = build đỏ. Quote dòng build `package.json`. Cross-link #15.
- **H2-3 "Dự án thật, artifact công khai"** — hub-store public (wakii-dev/hub-store, verified 2026-09-07), 7 bracket / 74 SF — workflow không chỉ dựng site marketing mà chạy production. Cross-link #16.
- **H2-4 "Số liệu tại ngày viết"** — bảng metrics + nguồn + ngày: releases (v1.4.199 Latest 09-05 + v1.4.198 cùng ngày + Android `mobile-android-v0.0.48` pre-release — KHÔNG nhắc 197) · 13 skills public · 24 story-* CLIs (lệnh hiệu chỉnh `ls ~/.claude/bin | grep '^story-' | grep -v '\.html' | wc -l` → 24; lệnh thô không lọc .html trả 25 — plan-critic P1) · blog 10→30.
- **H2-5 "Log kế tiếp"** — convergence QA cuối story + một PR; chuỗi log tiếp tục. Docs-link getting-started (như log-1, câu dẫn riêng — không chép câu log-1).

## 5. Tasks (DAG tuyến tính — 1 worktree, commit atomic theo cặp locale)

| # | Task | Deps | Tick | Exit criteria |
|---|------|------|------|---------------|
| T1 | post #15 `blog-story-case-study` VI+EN | — | ☐ | 2 file, band đạt, lint xanh, build xanh, commit `feat(blog): …` |
| T2 | post #16 `wakii-in-production-hub-store` VI+EN (flagship, ≥3 GitHub link + quote) | T1 | ☐ | như T1 + ACCEPTANCE #16 |
| T3 | post #17 `og-article-contract-anatomy` VI+EN | T2 | ☐ | như T1 + trích code đúng file |
| T4 | post #18 `rss-bilingual-feed-anatomy` VI+EN | T3 | ☐ | như T1 + trích code đúng file |
| T5 | post #19 `skills-catalog-tour` VI+EN (số re-extract) | T4 | ☐ | như T1 + con số kèm nguồn + ngày |
| T6 | post #20 `building-wakii-in-the-open-log-2` VI+EN | T5 | ☐ | như T1 + không lặp log-1, không 197 |
| T7 | **claims double-pass** (reviewer độc lập): từng claim/con số/link/quote trong 12 file đối chiếu registry + pack + file nguồn; scan cả variants review-only. **Ghi chú nguồn T5:** số skills dùng quy tắc đọc-tại-thời-điểm — file nguồn 09-07 = **20/13** GHI ĐÈ snapshot 21/14 trong pack (drift đã flag Linear); KHÔNG re-flag | T6 | ☐ | verdict APPROVED / CHANGES-REQUESTED (+bullet) — CR → fix (coordinator sở hữu fix loop) → re-review |
| T8 | **consistency pass** (reviewer độc lập): frontmatter parity VI/EN, ngày/category khớp matrix, ≥2 H2 mới so seed (mỗi bài), cross-link chỉ bài đã tồn tại + đúng locale, không trùng góc nhìn seed, TOC ≥3 H2, lint+build xanh, 4 dòng ACCEPTANCE | T7 | ☐ | verdict APPROVED / CHANGES-REQUESTED |

Rolling review: code-reviewer nhóm 1 (T1-T3) chạy song song khi T4-T6 thực thi; nhóm 2 (T4-T6) ngay khi xong. Mỗi task-executor: tick plan file sau task, 1 commit = 1 cặp VI+EN (`feat(blog): <slug> — series C (#N)`), KHÔNG `git add -A`.

## 6. Verification plan

1. Per-post: `node scripts/check-blog-content.mjs` exit 0 → `pnpm build` xanh → claims self-check vs registry (runbook bước 7) → commit.
2. T7 + T8 (agent độc lập, verdict 1 dòng).
3. Phase 5: verifier độc lập PASS/PARTIAL/FAIL theo 4 dòng ACCEPTANCE · security-audit surface cuối (không secrets, path/link handling) · Rule 0 browser 3 tầng (DOM listing count/TOC/meta → screenshot listing + 2 bài mẫu EN/VI → flow /blog/ → bài → TOC anchor → cross-link → về listing; lặp /vi/blog/) · consumer check (plan-critic P2): grep `dist/rss.xml` đủ 12 slug mới + đúng thứ tự DESC, hreflang/sitemap sinh đủ URL mới.
4. Merge no-ff về `story/fi359-blog-longform-20` (merge đích vào sf-branch trước; conflict improvements-log giữ CẢ HAI) → story-verify `sf-4` → FI-363 Done.

## 7. Risks

- **Skills drift** (file thật 20/13 vs snapshot 21/14): đã re-extract — bài #19 dùng 20/13 + "tại thời điểm viết"; đã flag Linear (đề nghị SF-5 sửa pack).
- **fi338 bracket local-only** → link spec thay (T2).
- **Quoting drift**: mọi transcript chạy thật khi viết, ghi nguồn + ngày; double-pass diff quote vs nguồn.
- **Band drift khi sửa bài**: lint chạy lại sau MỌI sửa (kể cả sau review-fix).
- **Cross-link mù**: chỉ link slug đã commit trên nhánh (thứ tự T1→T6 + seeds/pilot).
