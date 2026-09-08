# Plan — FI-373 SF-3: Series Features — 8 bài product features (FI-376)

> Spec: `docs/superpowers/specs/2026-09-08-blog-batch2-design.md` (rev 3) · Bracket:
> `docs/superpowers/brackets/fi373-blog-batch2.md` (SF-3) · Context pack:
> `docs/superpowers/contexts/fi373-sf-3.md` · Linear: FI-376. Tier Full (10 tasks).

## Phase 0-mini (impact — SF level; epic Phase 0 đã chạy ở story level)

- **Problem**: facet "features" chưa có bài nào — 8 năng lực sản phẩm (terminal
  splits → notification) chưa được kể theo evidence. Claims phải khớp 100% nhãn
  verify-shipped của SF-1 (8/8 SHIPPED, emulator có caveat desktop backend main-only).
- **Touch map (W)**: `src/content/blog/{en,vi}/feature-*.md` (16 file) ·
  `public/blog/heroes/{feature-computer-use-native,feature-terminal-splits}.{svg,png}`.
  **(R)**: sibling orca `/Users/hoivu/Desktop/projects/orca` READ-ONLY (evidence
  đã verify 2026-09-08: 8/8 commit hash tồn tại, file paths tồn tại) ·
  claims-registry/evidence-pack/style-guide/matrix (FROZEN — không sửa).
- **Second-order**: listing/RSS/related tự mở rộng khi build (output thay đổi là
  đúng kỳ vọng, SF-6 audit); lint partial-tree-tolerant (T7 đỏ giữa batch =
  EXPECTED); hero pipeline derive-from-frontmatter — chỉ render sau khi bài tồn tại.
- **Direction**: theo matrix CHỐT CỨNG (DEC-1) — không có fork hướng. Risk chính:
  claims vượt nhãn (P0 → lint verify-shipped guard + review bắt), band từ (D1),
  angle trùng trong facet (mỗi bài ≥2 H2 chưa bài nào cùng facet có).
- **Alternatives**: viết tuần tự 1 agent (chậm, không cần — 8 bài independent
  files) vs 8 task-executor song song không git-race (chọn — coordinator commit).
- **Gates**: story-preflight skip (worktree đã tồn tại, tree clean @422e86f);
  browser Rule 0 3 tầng ở bước 2 checklist; code-reviewer từng nhóm 4 bài;
  verifier Phase 5; security-audit 1 lần cuối SF (surface: claims/links/evidence).

## Tasks (10 — thứ tự DAG: T1-T8 song song → T9 (cần T1,T6) → T10)

- [x] T1 `feature-terminal-splits` EN+VI — matrix #14, pubDate 2026-09-15, tech,
      tags [features, terminal, wakii], docs-link getting-started, hero flag
      (EN frontmatter `heroImage: "/blog/heroes/feature-terminal-splits.png"`),
      cross-link parallel-worktrees-isolation. Claim scope: SHIPPED (c558d7e083
      #17601 + v1.4.198 notes).
- [x] T2 `feature-ssh-worktrees` EN+VI — matrix #15, 2026-09-16, tags [features,
      cli, worktree], docs getting-started, cross-link parallel-worktrees-isolation.
      SHIPPED (278f9ee876 #17946 MFA + ssh-config-alias.ts).
- [x] T3 `feature-design-mode` EN+VI — matrix #16, 2026-09-16, tags [features,
      design], docs faq, cross-link convergence-qa-last-tier. SHIPPED
      (design-mode.mdx + feature-wall-tiles.ts:108 + 216cabb9f0 #463).
- [x] T4 `feature-ai-diff-annotation` EN+VI — matrix #17, 2026-09-17, tags
      [features, qa], docs faq, cross-link gates-not-trust-rule-zero. SHIPPED
      (DiffCommentCard.tsx + inline-comments.ts + tile-08).
- [x] T5 `feature-emulator-android` EN+VI — matrix #18, 2026-09-17, tags
      [features, android, mobile], docs getting-started, cross-link
      shipping-cadence-two-releases-one-day. SHIPPED với caveat: CHỈ claim skill
      orca-emulator-android + emulator runtime (adb) — desktop backend KHÔNG nhắc
      như đã ship (main-only).
- [x] T6 `feature-computer-use-native` EN+VI — matrix #19, 2026-09-18, tech,
      tags [features, agents, workflow], docs agents-and-kit, hero flag (EN),
      cross-link nine-agents-separated-powers. SHIPPED (v1.4.198 notes + 
      src/main/computer/ + 787766bfcf + 66dfdc456f).
- [x] T7 `feature-per-workspace-env` EN+VI — matrix #20, 2026-09-18, tags
      [features, worktree, cli], docs getting-started, cross-link
      parallel-worktrees-isolation. SHIPPED (24d7f6b790 #7908 + skill
      orca-per-workspace-env 45370a5987).
- [x] T8 `feature-notification-keyboard` EN+VI — matrix #21, 2026-09-19, tags
      [features, mobile], docs faq, cross-link decision-gates-safe-ai-agents.
      SHIPPED (v1.4.199 notification routing + 7b9529da22 #16271 shortcut).
      Mobile claims CHỈ theo 5 APPROVED FI-341 + release notes.
- [x] T9 hero-render-2-flagship — SAU T1+T6: `node scripts/render-blog-heroes.mjs`
      (derive từ frontmatter — 2 slug mới của SF này) → commit PNG+SVG + `--check`
      1200×630. KHÔNG chạy trước khi bài tồn tại (render sớm = thiếu tile).
- [x] T10 series-features-consistency-pass — lint full (band/links/forbidden) ·
      cross-link grep resolve · claims sentence-check vs registry labels ·
      `pnpm build` xanh toàn chain · code-reviewer 2 nhóm (T1-T4, T5-T8) +
      re-review · security-audit · browser Rule 0 3 tầng (DOM listing 8 bài ·
      screenshot listing + 1 bài mở · flow đọc→related→lang-switch) · merge đích
      ancestor-guard + audit comment merge-hash · story-verify sf-3 · verifier.

## Contract mỗi bài (tóm tắt — chi tiết brief từng agent)

- Band: VI 900-1400 (hard 1470), EN ≥800 — đếm prose bỏ fenced (D1).
- Cấu trúc: hook → TL;DR → 3-5 H2 (≥1 evidence block/section, *Nguồn:* kèm ngày)
  → đoạn docs-link → CTA nhẹ. Tone seed (parallel-worktrees-isolation).
- Frontmatter 6 field schema LOCKED; VI+EN cùng title/description nghĩa, cùng
  ngày/category/tags; 1 bài = 1 commit (cặp VI+EN, `feat(blog): <slug> EN+VI`).
- Claims: CHỈ theo nhãn verify-shipped; số kèm nguồn + ngày; FORBIDDEN registry
  (lint grep case-insensitive — kể cả title/description).
- Links: docs đúng locale (`/docs/` | `/vi/docs/`, 5 DOC_SLUGS, không anchor);
  cross-link blog tới bài ĐÃ tồn tại (không anchor).
- Angle: ≥2 H2 chưa bài nào cùng facet features có — skeleton phân bổ từng bài
  trong brief agent (không trùng lặp).

## ACCEPTANCE (từ context pack — verifier đối chiếu từng dòng)

1. 8 bài đọc được EN+VI trên listing đúng matrix date; mở từng bài: demo được,
   trỏ đúng code location thật, giới hạn nói thẳng.
2. Claims 100% khớp nhãn registry; 2 flagship có hero; 6 không hero sạch.
3. Mobile 390 no-overflow; EN↔VI switch đúng bài.
4. (runbook) lint exit 0 (partial-tolerant); cross-links ∈ existing slugs;
   pnpm build xanh; story-verify sf-3 sạch trước Done.
