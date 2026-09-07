# SF-3 Context Pack (FI-359 longform) — Series B: Tác vụ dài (7 bài)

> Đọc file này THAY VÌ tự tổng hợp từ bracket + epic + comments.
> Epic spec: `docs/superpowers/specs/2026-09-07-blog-longform-20-posts-spec.md`
> Bracket: `docs/superpowers/brackets/fi359-blog-longform-20.md`
> Bộ máy soạn thảo: `docs/superpowers/editorial/2026-blog-longform/` — ĐỌC 5 FILE
> TRƯỚC (SF-1 đã merge; snapshot D8 trong evidence-pack). Pilot mẫu:
> `src/content/blog/vi/zero-setup-agent-team.md`.

## Spec slice (chỉ phần SF-3 chịu trách nhiệm)

Viết 7 bài trục "hoàn thành dự án với tác vụ dài": mỗi bài = 1 slug × (VI 900-1400
từ prose D1 + EN mirror ≥800, cùng commit), frontmatter template, ≥1 link docs đúng
locale không #anchor, ≥1 evidence block thật, lint xanh, pubDate đúng hàng dưới.
KHÔNG đổi ngày/slug/category.

| # | slug | cat | pubDate | Angle (≥2 H2 mà seed không có) |
|---|------|-----|---------|---------------------------------|
| 8 | long-tasks-bracket-tiers | tech | 08-27 | CÔNG NGHỆ chia task dài: SF theo tier, DAG tự nhiên, gate theo tier; diagram ASCII SO QUY MÔ 2 bracket thật: FI-339 (repo này, 3 SF) vs `fi245-postgres-production` hub-store (link GitHub, digest trong evidence-pack). Khác seed story-workflow (pipeline tổng) |
| 9 | parallel-worktrees-isolation | tech | 08-28 | Worktree per SF làm parallel THẬT: nhánh riêng, đĩa riêng, atomic commit; transcript `git worktree list` thật; vì sao 2 agent không giành file |
| 10 | linear-as-external-memory | tutorial | 08-29 | Epic → sub-issues trên Linear = bộ nhớ ngoài + audit trail; transcript cấu trúc body sub-issue thật (Tier/Depends/Bracket/What/Tasks) — lấy từ bracket/spec hub-store trong evidence-pack; vì sao chat log không phải memory (docs §2) |
| 11 | one-branch-one-pr | tech | 08-31 | PR merge THẬT 2 repo: wakii-site PR #1 (`story/fi339-blog-features`) + hub-store PR #1 (`story/fi326-api-docs-swagger`, merge `0144d80` — verify `gh pr list --repo wakii-dev/hub-store --state merged`); 1 diff có tự sự vs 30 commit rải rác (docs P5) |
| 12 | done-means-evidence | tech | 08-31 | "Agent báo xong" ≠ xong: verifier độc lập + verdict types + case FI-342 7/7 PASS 0 fix commit; đối chiếu QA rubric thật `qa-rubric.md` hub-store (link GitHub, digest evidence-pack); self-report không counts (docs P3) |
| 13 | convergence-qa-last-tier | tech | 09-01 | Tier cuối hội tụ: baseline immutable + explained-diff; case FI-342 explained-diff (`9d4d460` = SITE_URL wakii.xyz) + hub-store có convergence story THẬT: `fi245` sf11-fe-convergence (spec/plan trên GitHub) |
| 14 | shipping-cadence-two-releases-one-day | build-log | 09-02 | Nhịp ship là HỆ QUẢ của workflow: **v1.4.198 + v1.4.199 cùng ngày 09-05** (verify `gh release list --repo wakii-dev/wakii` + timestamps) + pre-release Android; assets version-named (comment `src/config.ts`). KHÔNG nhắc v1.4.197 — không tồn tại trên public repo |

Series pass (task cuối): đọc chéo 7 bài — tone nhất quán, cross-link ≥1 bài đã
tồn tại, không 2 bài cùng evidence chính, mỗi bài đối chiếu angle ≥2 H2 mới.

## Touch map (files SF-3 tạo/sở hữu)

```
src/content/blog/en/{long-tasks-bracket-tiers, parallel-worktrees-isolation,
  linear-as-external-memory, one-branch-one-pr, done-means-evidence,
  convergence-qa-last-tier, shipping-cadence-two-releases-one-day}.md  (7 MỚI)
src/content/blog/vi/{… cùng 7 slug}.md                                 (7 MỚI)
```

READ-ONLY tuyệt đối: mọi thứ khác (seeds, pilot, editorial kit, scripts, pages).

## Evidence dùng chung (đối chiếu SNAPSHOT — rule D8; verify git/gh trước khi ghi)

- Bracket FI-339 thật: `docs/superpowers/brackets/fi339-blog-features.md` trong
  repo (SF-1 tier 0 SEO / SF-2 tier 1 seed / SF-3 tier 2 QA).
- **hub-store artifacts (D3)**: dùng DIGEST trong evidence-pack (SF-1 đã chấm) —
  brackets/specs/plans thật + GitHub links; KHÔNG đọc trực tiếp sibling repo từ
  worktree (không thấy — sibling ngoài repo).
- Commit hashes (đã verify): `8621eb7` (readme domain fix) · `55e5ae1`
  (review-fixes FI-341) · `9d4d460` (SITE_URL wakii.xyz, owner confirm) ·
  PR #1 (merged) · hub-store merge `0144d80`.
- Releases: `gh release list --repo wakii-dev/wakii` — v1.4.198 + v1.4.199 cùng
  ngày 2026-09-05 + mobile-android pre-release; assets version-named.
- FI-342 verdict/baseline: đúng như docs story-workflow mô tả, KHÔNG tô.
- MỖI link GitHub artifact KÈM QUOTE thật trong bài (chống link-chết — spec risk
  #8).
- CẤM: screenshot bịa, transcript bịa, số không đối chiếu snapshot (kể cả
  v1.4.197 — không dùng).

## ACCEPTANCE (user-visible)

- /blog/ EN + VI thấy 7 bài mới đúng 27→31-08 + 01-09 + 02-09, badge/mô tả đúng.
- Mở từng bài 2 locale: band đúng, TOC, ≥1 diagram/transcript THẬT (hash/release
  tra cứu được), link docs đúng locale, cross-link ≥1 bài tồn tại.
- `pnpm build` xanh: parity ≥18 slug × 2 (10 seed + pilot + 7 mới; +6 nếu series A
  đã merge — parity pass là điều kiện, không cứng số) + lint pass.
- lint forbidden-grep 0 hit trên 7 bài (proxy; sweep đầy đủ ở SF-5).

## Boundary (KHÔNG làm)

- KHÔNG viết bài series A/C; cross-link chỉ trỏ bài ĐÃ tồn tại (A có thể chưa
  merge lúc bạn chạy — link seed/docs/pilot thay thế, không link mù).
- KHÔNG đụng seeds/pilot/editorial-kit/lint/pages; sai gì flag lên epic.
- KHÔNG đổi pubDate/slug/category — cần đổi = REQUIREMENT-GAP lên epic.
- Commit atomic: 1 commit = 1 cặp VI+EN của 1 slug.
