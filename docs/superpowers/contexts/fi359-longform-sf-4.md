# SF-4 Context Pack (FI-359 longform) — Series C: Workflow & dẫn chứng (6 bài)

> Đọc file này THAY VÌ tự tổng hợp từ bracket + epic + comments.
> Epic spec: `docs/superpowers/specs/2026-09-07-blog-longform-20-posts-spec.md`
> Bracket: `docs/superpowers/brackets/fi359-blog-longform-20.md`
> Bộ máy soạn thảo: `docs/superpowers/editorial/2026-blog-longform/` — ĐỌC 5 FILE
> TRƯỚC (SF-1 đã merge; evidence-pack CHỨA SẴN digest artifacts hub-store + GitHub
> links). Pilot mẫu: `src/content/blog/vi/zero-setup-agent-team.md`.

## Spec slice (chỉ phần SF-4 chịu trách nhiệm)

Viết 6 bài case study + deep-dive. ĐẶC QUYỀN series: evidence = ĐỌC CODE THẬT trong
repo + ARTIFACT THẬT (digest trong evidence-pack — nguồn `wakii-dev/hub-store`
public); bài case-study/deep-dive LINK THẲNG tới artifact GitHub
(`https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/...`) và BẮT
BUỘC kèm trích đoạn thật trong bài (chống link-chết). Chuẩn chung: VI 900-1400 từ
prose D1 + EN mirror ≥800 cùng commit, frontmatter template, ≥1 link docs đúng locale
không #anchor, lint xanh, pubDate đúng hàng. KHÔNG đổi ngày/slug/category.

| # | slug | cat | pubDate | Evidence bắt buộc (đọc thật + link) |
|---|------|-----|---------|--------------------------------------|
| 15 | blog-story-case-study | build-log | 09-03 | Story blog FI-339: parity gate là file thật `scripts/check-blog-slug-parity.mjs` trong build `package.json`; og contract comment trong `src/pages/blog/[slug].astro`; merge `55e5ae1` + PR #1 |
| 16 | wakii-in-production-hub-store | build-log | 09-04 | **FLAGSHIP case study dự án THẬT**: hub-store = platform vận hành kho (React MF + BFF Fastify + gRPC Java/Go/Python + Postgres/Kafka/Keycloak, Turborepo). Hành trình: epic `ict-service-support-rebuild` → `fi245-postgres-production` → `fi272-minikube-deploy` → `fi280-qa-hub-store-regression` → `fi338-dispatch-queue`. LINK GitHub từng bracket + trích tiêu đề SF/tier thật trong bài (digest ở evidence-pack) |
| 17 | og-article-contract-anatomy | tech | 09-05 | Đọc `src/pages/blog/[slug].astro` + `src/layouts/Base.astro`: vì sao og:image absolute qua `new URL(ogImage, Astro.site)`, og:type article + published_time nghĩa gì cho crawler |
| 18 | rss-bilingual-feed-anatomy | tech | 09-06 | Đọc `src/pages/rss.xml.js`: 1 feed 2 locale, NO `<language>`, `<guid>` absolute per locale — trade-off; đối chiếu chuẩn RSS |
| 19 | skills-catalog-tour | tutorial | 09-07 | Đọc `src/data/skills.ts` + /skills/: số public ĐỌC LÚC VIẾT (snapshot: 14/21 hôm nay), 4 categories, skills = thứ agents load on-demand |
| 20 | building-wakii-in-the-open-log-2 | build-log | 09-07 | Log-2 nối log-1: blog 10→30, 2 story blog (FI-339 + story này) + dự án thật hub-store public, parity gate chặn cả 30, số liệu tại ngày viết |

Series pass: claims DOUBLE-PASS (case-study + code-dẫn-chứng dễ sai nhất — từng
claim về đúng file/nguồn/link) + consistency pass.

## Touch map (files SF-4 tạo/sở hữu)

```
src/content/blog/en/{blog-story-case-study, wakii-in-production-hub-store,
  og-article-contract-anatomy, rss-bilingual-feed-anatomy, skills-catalog-tour,
  building-wakii-in-the-open-log-2}.md   (6 MỚI)
src/content/blog/vi/{… cùng 6 slug}.md                   (6 MỚI)
```

READ-ONLY tuyệt đối: mọi thứ khác — kể cả file code DÙNG LÀM EVIDENCE (`rss.xml.js`,
`[slug].astro`, `Base.astro`, `skills.ts`, `config.ts`, `check-blog-slug-parity.mjs`)
— đọc trích dẫn, KHÔNG sửa. KHÔNG đụng repo hub-store (chỉ dùng digest trong
evidence-pack; cần thêm chi tiết → REQUIREMENT-GAP lên epic).

## ACCEPTANCE (user-visible)

- /blog/ EN + VI thấy 6 bài mới đúng 03→07-09, badge/mô tả đúng.
- Mở từng bài 2 locale: band đúng, TOC, code-block trích dẫn thật, link docs đúng
  locale; bài #16 có ≥3 link GitHub artifacts hub-store (mỗi link kèm quote thật);
  #15/#17/#18 có trích code đúng file.
- `pnpm build` xanh: parity ≥17 slug × 2 (10 seed + pilot + 6 mới; +7/+6 nếu series
  B/A đã merge — parity pass là điều kiện, không cứng số) + lint pass.
- lint forbidden-grep 0 hit trên 6 bài (proxy; sweep + double-pass đầy đủ ở SF-5).

## Boundary (KHÔNG làm)

- KHÔNG viết bài series A/B; cross-link chỉ trỏ bài ĐÃ tồn tại.
- KHÔNG sửa file code wakii-site; KHÔNG đụng repo hub-store.
- KHÔNG clone nguyên specs/plans vào site (chỉ trích + link — bản quyền nội dung
  thuộc repo gốc, tránh trùng lặp SEO).
- KHÔNG đụng seeds/editorial-kit/lint/pages; sai gì flag lên epic.
- Commit atomic: 1 commit = 1 cặp VI+EN của 1 slug.
