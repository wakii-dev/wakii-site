# Spec — Blog longform: 20 bài viết dài làm nổi bật tính năng Wakii

Story: content layer cho wakii.xyz/blog — 20 slug mới × 2 locales (EN+VI) = 40 file `.md`,
blog 10 → 30 posts. CONTENT-ONLY: không UI, không schema, không route mới.
Baseline: main @ `14cbf97` (blog FI-339 đã merge qua PR #1; docs story redesign
FI-349 đã lên main — re-pin lại ngay trước launch nếu main tiến).

## IDEA-BRIEF (8 chiều)

- **Task**: viết 20 bài blog DÀI làm nổi bật tính năng Wakii — 3 trục chủ đề:
  (A) "tự làm việc" (agents làm việc tự động, zero-setup), (B) "hoàn thành dự án
  với tác vụ dài" (story workflow cho task dài: bracket, tier, worktree, convergence),
  (C) workflow + dẫn chứng minh hoạ (case study + contract deep-dive từ vật liệu thật).
- **Output**: 40 file markdown trong `src/content/blog/{en,vi}/`, live trên listing
  EN+VI, RSS, sitemap sau deploy (deploy là việc của user, ngoài story).
- **Users**: độc giả dev/product trên wakii.xyz; Google/social crawlers; người đang
  đánh giá Wakii trước khi tải (mỗi bài là một cửa chứng minh năng lực product).
- **Constraints (MUST)**: slug parity EN↔VI 1:1 (build gate `check-blog-slug-parity.mjs`);
  schema hiện tại KHÔNG đổi (title/description/pubDate/category enum LOCKED 3 giá trị/
  tags/draft); contracts FI-339 pinned (OG article, RSS bilingual guid absolute,
  i18n routing `prefixDefaultLocale: false`, URL posts không đổi); accuracy guards
  FI-341 (chỉ claim feature trong claims registry — KHÔNG bịa screenshot/transcript).
- **Input**: code as-built; 10 seed posts (format + tone mẫu); 5 docs slugs (nguồn
  fact); allowed-claims registry từ FI-341 review; vật liệu thật (commit hash, release
  tag, issue FI, file thật trong repo).
- **Context**: FI-339 epic Done 2026-09-07; story redesign blog FI-349 ĐANG CHẠY
  song song (epic In Progress, SF FI-355..358 — story này trực giao về code, see
  risk #6); **dự án thật hub-store (`wakii-dev/hub-store`, PUBLIC) chạy bằng
  workflow này — artifact thật ở `docs/superpowers/` trên GitHub làm dẫn chứng**;
  team Linear FI chạy song song project khác (FI-338) — không đụng chéo.
- **Success criteria**: blog 30 posts (15 slug × 2 locales) build xanh (parity
  15×2 + lint content pass); 20 bài mới đạt band 900-1400 từ VI (EN mirror ≥800
  words); claims sweep sạch so registry; mỗi post ≥1 link docs đúng locale; các
  bài case-study/deep-dive ≥1 link artifact GitHub hub-store thật (public, reader
  verify được) kèm trích dẫn; RSS 30 items + sitemap đủ; browser walkthrough EN+VI
  sạch; review APPROVED.
- **Out-of-scope**: redesign listing/detail + category taxonomy (spec draft riêng),
  heroImage/readingTime/JSON-LD (redesign territory), MDX, đổi schema/URL, deploy
  prod, feed per-category, comment system.

## DECISIONS (user chốt 2026-09-07)

| # | Decision | Chốt |
|---|---|---|
| D1 | Độ dài "dài" | **900-1400 từ VI/bài** (EN mirror cùng cấu trúc, ≥800 words). Thuật toán đếm PIN: body sau frontmatter, BỎ fenced code-block (diagram/transcript KHÔNG đếm — chặn độn bằng diagram), split `/\s+/`. Lint: warn >1400; QA hard-fail >1470 (+5%). |
| D2 | pubDate | **Backdate rải 08-20 → 09-07**, xen kẽ 10 bài cũ, tối đa 2 bài mới/ngày, ngày rơi đúng ma trận ở §Ma trận. |
| D3 | Dẫn chứng minh hoạ | **ASCII diagram trong code-block + transcript thật + artifact thật từ dự án production hub-store** (repo PUBLIC `wakii-dev/hub-store`, `docs/superpowers/` đã trên GitHub: 7 brackets · ~30 specs · ~20 plans — bài viết LINK THẲNG tới file GitHub, độc giả tự verify được; local mirror `~/Desktop/projects/service-support-clone/docs/superpowers/`). KHÔNG bịa screenshot, KHÔNG ảnh sản phẩm. Mỗi link artifact ghi kèm trích đoạn trong bài (chống link-chết sau này). |
| D4 | VI posts link docs | **`/vi/docs/<slug>/`** (docs VI tồn tại; áp flag FI-341 merge comment). EN posts giữ `/docs/<slug>/`. |
| D5 | lint content | **`scripts/check-blog-content.mjs`** mới (đây là thay đổi code DUY NHẤT của story — 1 file mới + 1 dòng `package.json`), wiring vào build SAU parity script. **Scope lint = CHỈ 20 slug mới** (danh sách 5 seed slug frozen trong script làm exclusion — seeds được miễn band/locale-link vì band seed 350-500 là chuẩn FI-341 đã duyệt); lint chỉ kiểm slug CÓ TRONG cây, worktree giữa-chừng vẫn build xanh (partial pass đúng thiết kế, giống parity script); `draft:true` → bỏ qua band (in ra "skipped-draft"); matrix-completeness (đủ 20 slug mới) KHÔNG kiểm ở lint — là việc của SF-5. Kiểm: band từ VI + EN floor (thuật toán D1), ≥1 link docs đúng locale, frontmatter hợp schema, kebab slug, **grep forbidden-phrase** từ claims-registry (file registry format greppable: mục FORBIDDEN 1 cụm/dòng). FAIL = build fail (gates not trust). |
| D6 | Category | 3 giá trị enum LOCKED — phân bổ 20 bài mới: **tutorial×3, tech×13, build-log×4** (tổng site sau story: 4/16/5). |
| D7 | Draft | Tất cả `draft: false` — 20 bài live cùng PR (không staged publishing). Fallback vận hành: nếu 1 SF trễ, bài của SF đó được phép tạm `draft:true` — **áp CẢ HAI locale cùng slug một lượt** (tránh hreflang half-pair + RSS lệch locale); fallback CHỈ gỡ block QA, KHÔNG được merge khi còn draft — PR phải 30/30 live hoặc user sign-off rõ. SF-5 tính check theo expected-live count + ghi exception. **Flip ngược `draft:false` = coordinator fix commit trên nhánh đích** (SF đã đóng, QA không sửa content). |
| D8 | Số liệu trong bài | **Snapshot + re-extract**: SF-1 chụp "numbers snapshot" vào evidence-pack (ngày + giá trị + output lệnh nguồn: `src/data/skills.ts`, `gh release list`, docs) — mọi bài viết đối chiếu snapshot; sweep ở SF-5 đối chiếu bài với SNAPSHOT (không fail vì nguồn drift sau khi viết — drift tại thời điểm QA → ghi chú, không fail). KHÔNG tin số nhớ-cache không nguồn (skills từng 13→14 — drift thật). Mỗi evidence block trong bài ghi nguồn + ngày lấy. |

## Contracts PINNED (reviewer phải check)

1. Slug parity 1:1 EN↔VI — `scripts/check-blog-slug-parity.mjs` chạy trong build, 30 posts × 2 = 60 file.
2. OG article contract FI-339 rev 2: `[slug].astro` truyền `ogType="article"` + `publishedTime` + og:image absolute — KHÔNG đụng.
3. RSS contract FI-339 SF-1: bilingual, NO `<language>`, `<guid>` absolute per locale — 30 items sau story.
4. i18n routing LOCKED `prefixDefaultLocale: false`; URL `/blog/<slug>/` + `/vi/blog/<slug>/` không đổi.
5. Accuracy registry FI-341 (allowed claims ONLY — chi tiết trong claims registry SF-1): QR pairing từ desktop; story view SF tiers/progress; gates choice/free-text+confirm; notification open/closed; guard codes. CẤM claim mobile chưa verify (pairing persistence, "mọi state", agent→worktree từ phone). KHÔNG dùng cụm "Stories tab". Skills: ghi số theo snapshot D8 tại thời điểm viết (từng là 13 public, kiểm lại hôm nay là 14 — CON SỐ KHÔNG PIN vào contract, quy tắc đọc-tại-thời-điểm là pin).
6. `data-astro-cid-*` khoan dung trong audit regex (gotcha FI-339).

## Ma trận 20 bài (slug · category · pubDate · trục · evidence bắt buộc)

Series A — Tự làm việc (07):
| # | slug | cat | pubDate | Evidence chính |
|---|------|-----|---------|----------------|
| 1 | zero-setup-agent-team | tutorial | 08-20 | kit tự cài lần đầu chạy: paths thật `~/.claude/bin/story-*`, idempotent (docs getting-started §5) |
| 2 | nine-agents-separated-powers | tech | 08-21 | bảng 9 agents (docs agents-and-kit); case thật: reviewer bắt scoped-style + escaping P0 sau khi executor sign-off |
| 3 | gates-not-trust-rule-zero | tech | 08-22 | 5 gates per SF + B0-B5; case thật: flow check bắt stale preview server dù DOM sweep pass |
| 4 | watchdog-idle-is-not-dead | tech | 08-23 | 3-layer check (commits/terminal/Linear); case thật: SF im lúc build native dài → để yên; SF kẹt gate → resume từ commit tốt |
| 5 | story-memory-learning-loop | tech | 08-24 | post-task ritual; case thật: bài học CLI flag đổi tên giữa 2 release |
| 6 | defensive-by-design | tech | 08-25 | dry-test lệnh mới, nothing deleted, flag-not-guess; case thật: merge conflict giữ CẢ HAI bên |
| 7 | controlled-rework-rollback | tech | 08-26 | revert về last-good + re-execute; case thật: FI-289 direction v1 → v2 Bento Premium |

Series B — Hoàn thành dự án với tác vụ dài (07):
| # | slug | cat | pubDate | Evidence chính |
|---|------|-----|---------|----------------|
| 8 | long-tasks-bracket-tiers | tech | 08-27 | bracket THẬT của 2 dự án: FI-339 (repo này) + `fi245-postgres-production.md` hub-store (link GitHub) — diagram ASCII so quy mô |
| 9 | parallel-worktrees-isolation | tech | 08-28 | worktree per SF, atomic commit per task; transcript: `git worktree list` thật lúc story chạy |
| 10 | linear-as-external-memory | tutorial | 08-29 | epic → sub-issues, DAG, audit comment; transcript: body sub-issue thật (Tier/Depends/What/Tasks) từ story hub-store (artifact GitHub) |
| 11 | one-branch-one-pr | tech | 08-31 | PR merge thật: wakii-site PR #1 (`story/fi339-blog-features`) + hub-store PR #1 (`story/fi326-api-docs-swagger`, merge commit `0144d80`) |
| 12 | done-means-evidence | tech | 08-31 | verifier độc lập vs self-report; case thật: FI-342 7/7 PASS + 0 fix commit, verdict exit 0; đối chiếu QA rubric thật `docs/superpowers/qa-rubric.md` hub-store (GitHub) |
| 13 | convergence-qa-last-tier | tech | 09-01 | tier cuối hội tụ; case thật: FI-342 explained-diff + hub-store có convergence story thật (`fi245` sf11-fe-convergence spec/plan trên GitHub) |
| 14 | shipping-cadence-two-releases-one-day | build-log | 09-02 | THẬT + verify `gh release list` wakii-dev/wakii: **2 release cùng một ngày** (v1.4.198 + v1.4.199, 09-05) + 1 pre-release Android; assets version-named (config.ts comment). KHÔNG claim v1.4.197 — không có tag/release 197 trên public repo |

Series C — Workflow & dẫn chứng (06):
| # | slug | cat | pubDate | Evidence chính |
|---|------|-----|---------|----------------|
| 15 | blog-story-case-study | build-log | 09-03 | chính story blog: parity gate trong build (file thật `check-blog-slug-parity.mjs`), og contract comment trong code, merge `55e5ae1` |
| 16 | wakii-in-production-hub-store | build-log | 09-04 | **Case study dự án THẬT**: hub-store — platform vận hành kho (React microfrontends Module Federation + BFF Fastify + gRPC polyglot Java/Go/Python + Postgres/Kafka/Keycloak) chạy bằng story workflow từ rebuild epic → postgres production → minikube/K8s deploy → QA regression → dispatch queue; evidence = link GitHub artifacts thật (7 brackets · specs · plans) |
| 17 | og-article-contract-anatomy | tech | 09-05 | đọc code thật `[slug].astro` + Base.astro: tại sao og absolute qua `new URL(, Astro.site)` |
| 18 | rss-bilingual-feed-anatomy | tech | 09-06 | đọc `rss.xml.js`: 1 feed 2 locale, guid absolute, no language — trade-off |
| 19 | skills-catalog-tour | tutorial | 09-07 | public skills trên /skills/ (data thật `src/data/skills.ts`, số đọc LÚC VIẾT — hôm nay 14 public), skills = thứ agents load on-demand |
| 20 | building-wakii-in-the-open-log-2 | build-log | 09-07 | log-2: blog 10→30, số liệu thật 2 story blog + parity gate; nối log-1 (`building-wakii-in-the-open-log-1`, 09-07) — slug khớp họ log-1 |

Tags: tái dùng vocab hiện có (story-workflow, agents, workflow, gates, guardrails,
build-log, release, wakii, git, fork, upstream, mobile, stories, supervised) + mới
có kiểm: autonomy, worktree, linear, qa, og, rss, seo, memory, skills, evidence.
Ghi chú ma trận: ngày double (08-31 ×2, 09-07 ×2) — thứ tự trong ngày = collection
glob order, chấp nhận (cosmetic); KHÔNG dùng link cross-file kèm `#anchor` (heading
VI/EN lệch nhau — anchor chết trên trang 200); link docs chỉ tới trang.

## SF breakdown (rubric C1-C5/V1-V3 · SF-SCOPE LỚN · chống duplicate)

**Anti-duplicate pass**: mọi pattern dùng chung TÁCH vào SF-1 tier 0 — topic matrix,
claims registry, style guide long-form, frontmatter template, lint script, evidence
pack, pilot post. Series SF-2/3/4 cùng LOẠI việc (content batch) là chủ ý: mỗi task
= 1 bài hoàn chỉnh (VI + EN mirror + evidence + lint xanh) — outcome phân biệt, KHÔNG
re-implement pattern (process đã cấp sẵn từ tier 0). Gộp 3 series = 1 SF 20 bài = 60+
tasks phá cap 8-15 + phá parallelism → giữ tách. SF-5 unique loại QA. Không SF nào
có ≥50% tasks trùng cơ chế với SF khác.

### SF-1 — Editorial foundation + pilot (Tier 0)
**What**: bộ máy soạn thảo dùng chung sống trong repo: ma trận 20 bài (slug · ngày ·
category · evidence) chốt, claims registry (được phép/cấm, greppable), style guide
long-form (cấu trúc bài 900-1400 từ + thuật toán đếm D1), frontmatter template +
tags vocab, evidence pack vật liệu thật + numbers snapshot D8, lint script chạy trong
build (scope CHỈ 20 slug mới — seeds miễn, draft skip, chi tiết D5), và 1 bài pilot
đi hết pipeline (VI→EN→lint→build xanh). **Pilot = matrix #1 (zero-setup-agent-team)
— SF-1 giao bài hoàn chỉnh; SF-2 chỉ cross-link tích hợp, không viết lại.** Demo:
`pnpm build` xanh với 11 slug × 2 locales, lint chặn được bài thiếu band/link/claim
cấm, pilot đọc được trên listing.
**Depends on**: —
**Tasks (~12)**: topic-matrix-20-committed / claims-registry-greppable-allow-forbidden / style-guide-long-form-structure-wordcount-algo / frontmatter-template-tags-vocab / evidence-pack-real-materials-numbers-snapshot / lint-script-band-links-frontmatter-seed-exempt / lint-wiring-build-after-parity / d4-rule-in-runbook-and-pilot / pubdate-map-pinned-d2 / category-tags-distribution-d6 / pilot-post-zero-setup-full-pipeline / writer-runbook-checklist

### SF-2 — Series A: Tự làm việc — 6 bài + pilot tích hợp (Tier 1)
**What**: 6 bài trục "agents tự làm việc" (9 agents tách quyền, gates + Rule 0,
watchdog, memory loop, defensive design, controlled rework) + tích hợp pilot
zero-setup (SF-1) làm bài mở đầu series qua cross-link — mỗi bài 900-1400 từ VI +
EN mirror, có ASCII diagram/transcript thật đúng evidence plan, link docs đúng
locale, lint xanh. Demo: 7 bài series A (6 mới + pilot) đọc được cả EN+VI trên
listing đúng ngày ma trận.
**Depends on**: SF-1
**Tasks (~7)**: nine-agents-separated-powers-post / gates-not-trust-rule-zero-post / watchdog-idle-is-not-dead-post / story-memory-learning-loop-post / defensive-by-design-post / controlled-rework-rollback-post / series-a-consistency-pass

### SF-3 — Series B: Tác vụ dài — 7 bài (Tier 1)
**What**: 7 bài trục "hoàn thành dự án với tác vụ dài" (bracket+tier, worktree song
song, Linear làm bộ nhớ ngoài, 1 nhánh 1 PR, done = evidence, convergence QA, nhịp
ship 2 release/ngày) — cùng chuẩn SF-2. Demo: 7 bài đọc được cả EN+VI, evidence đúng
vật liệu thật (FI-339, FI-342, v1.4.198+199 cùng ngày 09-05 — verify gh).
**Depends on**: SF-1
**Tasks (~8)**: long-tasks-bracket-tiers-post / parallel-worktrees-isolation-post / linear-as-external-memory-post / one-branch-one-pr-post / done-means-evidence-post / convergence-qa-last-tier-post / shipping-cadence-post / series-b-consistency-pass

### SF-4 — Series C: Workflow & dẫn chứng — 6 bài (Tier 1)
**What**: 6 bài trục case study + deep-dive (case story blog FI-339, **case study dự
án thật hub-store**, anatomy og contract, anatomy rss feed, tour skills catalog,
build log-2) — đọc CODE THẬT + ARTIFACT THẬT làm evidence (không paraphrase docs);
bài case-study/deep-dive link thẳng tới artifact GitHub hub-store (public) kèm trích
dẫn trong bài. Demo: 6 bài đọc được cả EN+VI, mỗi bài ≥1 trích dẫn code/hash/artifact
thật đúng nguồn.
**Depends on**: SF-1
**Tasks (~8)**: blog-story-case-study-post / wakii-in-production-hub-store-post / og-article-contract-anatomy-post / rss-bilingual-feed-anatomy-post / skills-catalog-tour-post / building-wakii-in-the-open-log-2-post / series-c-claims-double-pass / series-c-consistency-pass

### SF-5 — Convergence QA (Tier 2)
**What**: trạng thái 30 posts sạch mức release: lint + parity 15×2 xanh, band từ đạt
20/20 (thuật toán D1, hard-fail >1470), claims sweep đối chiếu **snapshot D8** (drift
nguồn tại QA = ghi chú, không fail), mọi internal link resolve đúng locale không
anchor chết (/docs/ + /vi/docs/ + cross-links), RSS đúng expected-live items +
sitemap đủ + hreflang pair đủ, listing EN+VI render đúng số bài live, browser
walkthrough EN+VI (mở listing → bài → TOC → quay liệu), review độc lập (kèm phán
định trùng-góc-nhìn-seed theo rule risk #4) + release readiness. Demo: audit chạy
end-to-end một lượt pass, sẵn sàng PR.
**Depends on**: SF-2, SF-3, SF-4
**Tasks (~10)**: lint-parity-green-all-30 / word-band-sweep-20-new / claims-sweep-vs-snapshot-d8 / links-resolve-locale-e2e-no-dead-anchor / rss-expected-live-items-contract / sitemap-hreflang-full / listing-en-vi-render-live-count / browser-walkthrough-en-vi-rule0 / independent-review-verdict / release-readiness-build-smoke

## Risks

1. **Accuracy drift ở scale ×20** — rủi ro #1 (FI-341 đã dính). Giảm: claims registry
   + evidence plan per bài NGAY trong matrix, lint máy + claims sweep ở SF-5, case
   study posts được double-pass (SF-4).
2. **Band từ phình** — 1400 từ × 20 bài dễ dài lê thê. Giảm: style guide định cấu
   trúc (hook → TL;DR → 3-5 H2 evidence → docs link → CTA), lint chặn dưới 900
   (dưới band = fail) và cảnh báo trên 1400.
3. **EN mirror tụt hậu** — parity gate bắt slug nhưng không bắt chất lượng dịch.
   Giảm: runbook "VI-first, EN mirror cùng commit", consistency-pass per series.
4. **Trùng nội dung với 10 seed** — 20 bài mới đụng chủ đề seed (gates, story flow).
   Giảm (operationalized): runbook mỗi bài có "angle" bắt buộc nêu ≥2 H2 mà KHÔNG
   seed nào có (liệt kê được); phán định trùng lặp cuối cùng = task
   `independent-review-verdict` ở SF-5 với rationale per-post (judgment có tài liệu
   đầu vào, không phải check máy).
5. **Link /vi/docs/ mới áp D4** — nếu VI docs thiếu nội dung tương ứng thì link
   vẫn resolve (trang tồn tại) nhưng lộ sai khác EN. Giảm: SF-5 kiểm resolve cả 2
   locale; viết theo docs fact đã đọc chứ không đoán. (Seed posts VI đang link
   `/docs/` — giữ nguyên, flag FI-341 epic comment lo; story này CHỈ áp D4 cho
   bài mới.)
6. **Song song với story redesign FI-349 (ĐANG CHẠY)** — redesign đã có epic +
   4 SF thật là FI-355..358 (batch đầu FI-350..354 Canceled do CLI shim bug --parent) từ session song song cùng tối 09-07. Hai story gần như trực
   giao về code (redesign: schema/pages/layouts; longform: 40 md + 1 lint script +
   1 dòng package.json). Điểm hớt: (a) `package.json` build chain — 2 story đều có
   thể thêm dòng → conflict merge trivial, rebase xử lý; (b) redesign_extend parity
   script schema-check — longform KHÔNG đụng file này; (c) **coupling convergence**:
   story nào hội tụ SAU phải re-check số liệu theo số posts thật trên nhánh mình
   (redesign mockup số 10, longform số 30 — nếu longform merge trước, redesign
   audit trên 30; ngược lại longform audit trên 10+20 của nhánh đích mình — đủ vì
   SF-5 longform tự chạy trên nhánh đích chứa đủ 30); (d) context packs DÙNG TÊN
   STORY-SCOPED (`fi359-longform-sf-N.md`) — bare `sf-N.md` đã bị 2 story giành
   nhau, bài học ghi vào spec này.
7. **Context pack collision (đã xử lý)** — packs của story này bị ghi đè 1 lần tại
   bare paths 19:38; đã khôi phục content từ phiên bản trong phiên + đổi sang tên
   story-scoped. Nếu thấy bare `sf-N.md` thuộc redesign — ĐỪNG đụng, đó là của
   FI-349.
8. **Link-chết artifact GitHub** — posts link tới file trên `wakii-dev/hub-store`
   main; nếu repo đó rename/move file sau này thì link chết. Giảm: MỖI link kèm
   trích đoạn (quote) nội dung thật trong bài — link chết vẫn còn dẫn chứng;
   artifact digest (SF-1 evidence-pack) copy nguồn vào repo này.
9. **Repo hub-store là thư mục siblings** — content SFs chạy trong worktree của
   wakii-site KHÔNG thấy `~/Desktop/projects/service-support-clone/`. Giảm: SF-1
   đọc sibling repo (read-only) và CHẤT DIGEST (excerpts + GitHub links + số liệu)
   vào editorial evidence-pack TRONG repo — content SFs chỉ dùng evidence-pack.
10. **CLI shim bug Linear `--parent` (đANG SỐNG)** — `orca linear create --parent`
    nuốt identifier (uuid hard-error) + tổ hợp `--estimate`/`--parent` sai team →
    5 issue FI-350..354 Canceled hôm 09-07 (story FI-349 dính). Mitigation bắt
    buộc lúc APPROVE story này: tạo sub-issue KHÔNG `--parent` (chỉ
    title/team/label/priority/body), link parent TAY trong Linear UI, và READ-BACK
    (`list-issues`) verify từng issue trước khi ghi `linear:` vào bracket. Epic
    create KHÔNG cần --parent (epic không có cha) — vẫn read-back.

## Boundary (KHÔNG làm)

Redesign listing/detail · taxonomy routes · heroImage/readingTime/JSON-LD (spec
draft riêng chờ approve) · MDX · đổi schema/enum/URL · feed per-category · ảnh
screenshot sản phẩm · deploy prod · comment system · dark/light toggle.
