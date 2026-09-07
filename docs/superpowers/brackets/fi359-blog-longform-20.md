# Story: FI-359 — Blog longform: 20 bài viết dài làm nổi bật tính năng Wakii
Destination: story/fi359-blog-longform-20

## SF-1 Editorial foundation + pilot
Tier: 0
linear:
Design: none
What: bộ máy soạn thảo dùng chung sống trong repo — ma trận 20 bài chốt (slug · pubDate · category · evidence plan), claims registry greppable (được phép/cấm) với quy tắc snapshot D8, style guide long-form 900-1400 từ (thuật toán đếm D1), frontmatter template + tags vocab, evidence pack vật liệu thật + numbers snapshot, lint script scope CHỈ 20 slug mới (seeds miễn, draft skip) chạy trong build, 1 bài pilot đi hết pipeline VI→EN→lint→build (pilot = matrix #1, giao SF-2 tích hợp). Demo: build xanh 11 slug × 2 locales, lint CHẶN được bài sai band/thiếu link/claim cấm, pilot đọc được trên listing EN+VI đúng ngày.
Depends on: —
Tasks: topic-matrix-20-committed / claims-registry-greppable-allow-forbidden / style-guide-long-form-structure-wordcount-algo / frontmatter-template-tags-vocab / evidence-pack-real-materials-numbers-snapshot / lint-script-band-links-frontmatter-seed-exempt / lint-wiring-build-after-parity / d4-rule-in-runbook-and-pilot / pubdate-map-pinned-d2 / category-tags-distribution-d6 / pilot-post-zero-setup-full-pipeline / writer-runbook-checklist

## SF-2 Series A — Tự làm việc (6 bài + pilot tích hợp)
Tier: 1
linear:
Design: none
What: 6 bài trục "agents tự làm việc" — 9 agents tách quyền, gates + Rule 0, watchdog idle-is-not-dead, memory learning loop, defensive by design, controlled rework; pilot zero-setup (SF-1) tích hợp làm bài mở đầu series qua cross-link. Mỗi bài 900-1400 từ VI + EN mirror cùng commit, ASCII diagram/transcript thật đúng evidence plan, ≥1 link docs đúng locale, lint xanh. Demo: 7 bài series A (6 mới + pilot) đọc được cả EN+VI trên listing đúng ngày ma trận, không bài nào lặp góc nhìn của 10 seed.
Depends on: SF-1
Tasks: nine-agents-separated-powers-post / gates-not-trust-rule-zero-post / watchdog-idle-is-not-dead-post / story-memory-learning-loop-post / defensive-by-design-post / controlled-rework-rollback-post / series-a-consistency-pass

## SF-3 Series B — Tác vụ dài (7 bài)
Tier: 1
linear:
Design: none
What: 7 bài trục "hoàn thành dự án với tác vụ dài" — bracket+tier cho task dài, worktree song song isolation, Linear làm bộ nhớ ngoài, 1 nhánh đích 1 PR, done = evidence, convergence QA tier cuối, nhịp ship 2 release một ngày. Mỗi bài cùng chuẩn SF-2 (band, mirror, evidence thật, docs link, lint xanh). Demo: 7 bài đọc được cả EN+VI, evidence đúng vật liệu thật (bracket FI-339, FI-342, v1.4.198+199 cùng ngày — verify gh).
Depends on: SF-1
Tasks: long-tasks-bracket-tiers-post / parallel-worktrees-isolation-post / linear-as-external-memory-post / one-branch-one-pr-post / done-means-evidence-post / convergence-qa-last-tier-post / shipping-cadence-post / series-b-consistency-pass

## SF-4 Series C — Workflow & dẫn chứng (6 bài)
Tier: 1
linear:
Design: none
What: 6 bài trục case study + deep-dive — case story blog FI-339, case study dự án THẬT hub-store (platform vận hành kho chạy bằng workflow, link GitHub artifacts public), anatomy og article contract, anatomy rss bilingual feed, tour skills catalog, build log-2 (slug khớp họ log-1). Đọc CODE THẬT + ARTIFACT THẬT làm evidence (không paraphrase docs); bài case-study/deep-dive link thẳng artifact GitHub kèm trích dẫn trong bài. Cùng chuẩn band + mirror + lint. Demo: 6 bài đọc được cả EN+VI, claims double-pass riêng cho nhóm case-study.
Depends on: SF-1
Tasks: blog-story-case-study-post / wakii-in-production-hub-store-post / og-article-contract-anatomy-post / rss-bilingual-feed-anatomy-post / skills-catalog-tour-post / building-wakii-in-the-open-log-2-post / series-c-claims-double-pass / series-c-consistency-pass

## SF-5 Convergence QA — 30 posts release-ready
Tier: 2
linear:
Design: none
What: trạng thái 30 posts (15 slug × 2 locales) sạch mức release — build + parity + lint xanh toàn bộ, band từ đạt 20/20 theo thuật toán D1 (hard-fail >1470), claims sweep đối chiếu snapshot D8 (drift tại QA = ghi chú), mọi internal link resolve đúng locale không anchor chết, RSS đúng expected-live items + sitemap + hreflang đủ, listing EN+VI render đúng số bài live, browser walkthrough EN+VI, review độc lập kèm phán định trùng-góc-nhìn-seed + release readiness. Demo: audit chạy end-to-end một lượt pass, sẵn sàng PR.
Depends on: SF-2, SF-3, SF-4
Tasks: lint-parity-green-all-30 / word-band-sweep-20-new / claims-sweep-vs-snapshot-d8 / links-resolve-locale-e2e-no-dead-anchor / rss-expected-live-items-contract / sitemap-hreflang-full / listing-en-vi-render-live-count / browser-walkthrough-en-vi-rule0 / independent-review-verdict / release-readiness-build-smoke
