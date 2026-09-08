# Story: FI-373 — Blog batch 2 — hoàn thiện mọi facet: 44 bài mới (skills · features · guides · arch · logs)

Destination: story/fi373-blog-batch2

## SF-1 Editorial infra — scope manifest + claims refresh
Tier: 0
linear:
Design: none
What: mở rộng hạ tầng editorial FI-359 cho batch 2 — lint/audit đọc all-non-seed manifest (matrix gate phủ 64/64 non-seed: 20 batch-1 + 44 batch-2), audit 6 hard-code điểm refactor (T5/T7×2/SNAPSHOT skills 20-13/T3 FAMILIES/T6 SAMPLES theo facet), future-date policy matrix (a), claims-registry + evidence-pack refresh cùng commit, verify-shipped 8 features vs release v1.4.199 (nhãn SHIPPED/MAIN-ONLY/ROADMAP), hero pipeline parameterize derive-from-frontmatter (demo fixture render 1 PNG), matrix 44 slug table-format commit. Demo data-level: lint chặn bài sai band thuộc manifest + báo file lạ ngoài manifest; T7 future-date ∈ matrix PASS
Depends on: —
Tasks: lint-refactor-all-non-seed-manifest / audit-t7-future-date-matrix-policy / audit-snapshot-refresh-6-hardcode-points / claims-registry-extend-batch2-evidence-pack-cung-commit / verify-shipped-8-features-vs-release / matrix-44-commit-table-format / hero-pipeline-parameterize-derive-from-frontmatter-fixture-demo / style-guide-tags-vocab-extend / runbook-update-batch2 / probe-skills-drift-rootcause-artifact
Exit edges: matrix commit TRƯỚC audit refactor; claims-registry TRƯỚC verify-shipped; probe có artifact định danh (file:line)

## SF-2 Series Skills — 13 bài
Tier: 1
linear:
Design: none
What: 13 bài deep-dive từng public skill đúng thứ tự category (4 workflow → 6 design → 3 reference) — command, cách làm việc (đọc source skill thật), khi nào dùng, ví dụ từ stories đã chạy; 5 flagship PINNED kèm heroImage-wiring-2-locale + hero render (brainstorm, story-workflow, orca-superpowers-workflow, frontend-design, mock-prototype), 8 còn lại không hero. Demo: 13 bài EN+VI đúng band, link đúng docs/related
Depends on: SF-1
Tasks: 13× skill-post-<tên>-5-flagship-kèm-heroImage-wiring-2-locale-8-không-hero / hero-render-5-flagship-skills / series-skills-consistency-pass

## SF-3 Series Features — 8 bài
Tier: 1
linear:
Design: none
What: 8 bài product features theo nhãn verify-shipped SF-1 — feature làm gì, code ở đâu (sibling orca READ-ONLY), trải nghiệm thực tế, giới hạn; 2 flagship (computer-use-native, terminal-splits) kèm heroImage + render, 6 còn lại không hero. Demo: 8 bài EN+VI, claims khớp 100% nhãn registry
Depends on: SF-1
Tasks: 8× feature-post-<tên>-2-flagship-kèm-heroImage-wiring-6-không-hero / hero-render-2-flagship-features / series-features-consistency-pass

## SF-4 Series Guides — 10 bài
Tier: 1
linear:
Design: none
What: 10 bài tutorial từng bước (install-update, first-story, mobile-pairing, ssh-remote, custom-skill-101, cloud-relay, worktree-workflow, linear-github-wiring, multi-session-ports, troubleshooting) — guide-first-story kèm heroImage + render, 9 còn lại không hero. Mỗi guide: commands cross-check vs docs/CLI hiện hành + ≥1 dry-run thật kèm transcript; walkthrough máy sạch = user-manual gate sau merge
Depends on: SF-1
Tasks: 10× guide-post-<tên>-first-story-kèm-heroImage / hero-render-1-flagship-guide / series-guides-consistency-pass

## SF-5 Series Architecture + OSS + Logs — 13 bài
Tier: 1
linear:
Design: none
What: 11 bài arch/OSS (electron-process-model kèm hero, relay-cloud, native-computer-use, site-bento-tokens, site-motion-i18n, auto-update-feed, why-fork-mit, upstream-sync, brand-monogram, release-roundup-14x, ci-gates; 10 còn lại không hero) + 2 build-logs (log-3, log-4 — evidence chỉ cite arc ĐÃ hoàn tất FI-349/FI-359 + số snapshot kèm ngày, không đủ → draft:true). Demo: 13 bài EN+VI theo snapshot mới
Depends on: SF-1
Tasks: 11× arch-oss-post-<tên>-electron-kèm-heroImage-10-không-hero / hero-render-2-flagship-arch-log / build-log-3-post / build-log-4-post-vừa-hoàn-tất-evidence / series-arch-consistency-pass

## SF-6 Convergence QA — 69 slug release-ready
Tier: 2
linear:
Design: none
What: 69 slug × 2 locales (138 post pages) release-ready — build + parity + lint all-non-seed xanh toàn bộ, band sweep 44 mới, claims sweep vs snapshot SF-1, links resolve locale e2e, RSS ~138 items bilingual, sitemap/hreflang full, listing flat 69×2 + JSON-LD + 6 category pages audit count, related invariants 25 cũ (≥1 related, resolve, không draft leak, cùng locale — output sẽ đổi là đúng), browser walkthrough EN+VI mỗi facet, review độc lập, release readiness (LCP deployed = post-merge manual)
Depends on: SF-2, SF-3, SF-4, SF-5
Tasks: lint-parity-green-all-69-incl-check-blog-parity-dist / word-band-sweep-44 / claims-sweep-vs-snapshot-sf1 / links-resolve-locale-e2e / rss-sitemap-hreflang-full-scale / jsonld-audit-69-slug-blogposting / listing-flat-69-render-en-vi-category-pages-6-audit-count / related-posts-invariants-25-old / browser-walkthrough-en-vi-per-facet / independent-review-verdict / release-readiness-build-smoke
