# Plan — SF-1 Content infra: schema + shared utils (FI-355)

Spec: docs/superpowers/specs/2026-09-07-blog-redesign-design.md (rev 3, §SF-1) + bracket
docs/superpowers/brackets/fi349-blog-redesign.md + context pack docs/superpowers/contexts/sf-1.md
Branch: wakii-dev/sf-1-blog-infra → merge (update-ref) về story/fi349-blog-redesign

Scope note: data-level tier — UI redesign là SF-2/SF-3. SF-1 chỉ og wiring nhỏ trong
[slug].astro + Base.astro carve-out `ogImageAlt`. KHÔNG tạo category routes, KHÔNG JSON-LD,
KHÔNG astro:assets, KHÔNG sửa astro.config.mjs / RSS.

Quyết định đã probe (recorded): util đặt `src/utils/blog.ts` (node 24 native TS stripping →
node script import trực tiếp được); hero = 4 posts trừ `building-wakii-in-the-open-log-1`
(context pack + spec ghi tường minh tên post fallback — "đủ 3 category" trong spec là
aspiration sai phép đếm: 4 post còn lại chỉ cover tech+tutorial; build-log post chính là
fallback post — ghi nhận là spec inconsistency, KHÔNG block).

## Tasks

- [x] 1. schema-extension-optional-defaults: `src/content.config.ts` — blog schema thêm `heroImage: z.string().optional()` + `author: z.string().default('Wakii team')`; KHÔNG đụng category enum, docs collection.
- [x] 2. category-label-map-i18n-shared: `src/i18n/categories.ts` — `CATEGORY_LABELS` EN/VI (tutorial→tutorial/hướng dẫn, tech→tech notes/kỹ thuật, build-log→build log/nhật ký xây dựng — strings pre-drafted spec SF-3); CHỈ tạo map, không adopt vào pages.
- [x] 3. readingtime-util-wpm-en200-vi160: `src/utils/blog.ts` — `readingTime(body, locale)`: đếm từ trên markdown body, WPM EN 200 / VI 160, làm tròn lên, min 1 phút.
- [x] 4. related-util-fallback-chain: `src/utils/blog.ts` — `relatedPosts(current, all, max=3)`: priority tiers same-category → shared-tags (≥1 tag chung) → latest-same-locale (fill-chain, dedupe, cap 3); draft:false + same-locale BẮT BUỘC mọi tier.
- [x] 5. utils-assertion-script: `scripts/check-blog-utils.mjs` — node assert utils trên 10 posts thật: readingTime(vi) ≥ readingTime(en) cùng post + ≥ 1 + ceil-check; related('building-wakii…') = 3 items latest-same-locale (không chứa current, same locale); author default path. npm script `check:blog-utils` + chain vào `build`.
- [ ] 6. og-image-per-post-wiring + docs-comment-contract-update: `src/pages/blog/[slug].astro` + `src/pages/vi/blog/[slug].astro` — `ogImage={entry.data.heroImage ?? '/og-default.png'}` (absolute qua new URL ở Base — contract giữ nguyên); comment contract ghi rev-2 carve-out ogImageAlt.
- [ ] 7. base-ogimagealt-prop-additive: `src/layouts/Base.astro` — CHỈ thêm prop optional `ogImageAlt`, default giữ hành vi hiện tại `"${SITE_NAME} — ${SITE_TAGLINE}"`; KHÔNG đụng width/height hardcode 1200/630 hay bất kỳ dòng nào khác.
- [ ] 8. hero-pipeline-public-path: `scripts/render-blog-heroes.mjs` — SVG template 1200×630 theo brand (nền #0A0E0D, mint #45E0A8, mono wordmark `~/wakii.` + title post + category line — cùng DNA og-default.svg) → headless Chrome `--screenshot --window-size=1200,630` → `public/blog/heroes/<slug>.png`; SVG sources commit cạnh PNG để tái tạo.
- [ ] 9. hero-assets-mint-4-posts-1-fallback: chạy pipeline → 4 PNG cho decision-gates-safe-ai-agents / forking-an-ide-keeping-current-with-upstream / review-ai-agents-from-your-phone / story-workflow-idea-to-release; `building-wakii-in-the-open-log-1` CỐ Ý KHÔNG hero (exercise fallback og-default); frontmatter `heroImage: "/blog/heroes/<slug>.png"` cho 8 md files (VI mirror dùng chung hero EN); verify `sips` đúng 1200×630.
- [ ] 10. parity-script-extend-check-schema: `scripts/check-blog-slug-parity.mjs` — thêm schema-parity cho fields mới: heroImage presence + value phải khớp EN↔VI, author presence khớp; KHÔNG đụng category routes (SF-4 sở hữu mode đó).
- [ ] 11. Final: `pnpm build` xanh (parity gate + utils gate + astro build, 31 pages không route mới) + dist asserts (og:image per-post absolute trên post có hero, og-default absolute trên building-wakii) + Rule 0 verify 3 tầng (DOM: meta og:image thật trên pages render; VISUAL: Read hero PNG + screenshot post pages; FLOW: preview server navigate /blog/ → post) + code-reviewer độc lập toàn diff, fix P0/P1 trước merge.

Meta steps (không checkbox — chạy sau task 11):

- story-verify sf-1 sạch (B3: comment literal `VERDICT ... APPROVED` lên FI-355)
- Merge flow an toàn: merge parent story/fi349-blog-redesign vào sf-branch → 2 ancestor guards (sf-branch chứa parent cũ + working tree sạch) → `git update-ref refs/heads/story/fi349-blog-redesign <sha>`
- Comment merge-hash lên FI-355 + `orca worktree set --worktree name:sf-1-blog-infra --comment "SF-1 merged <hash> into dest"`
- FI-355 → Done (SAU merge)
