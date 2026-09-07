# SF-2 Context Pack (FI-359 longform) — Series A: Tự làm việc (6 bài + pilot tích hợp)

> Đọc file này THAY VÌ tự tổng hợp từ bracket + epic + comments.
> Epic spec: `docs/superpowers/specs/2026-09-07-blog-longform-20-posts-spec.md`
> Bracket: `docs/superpowers/brackets/fi359-blog-longform-20.md`
> Bộ máy soạn thảo: `docs/superpowers/editorial/2026-blog-longform/` — ĐỌC 5 FILE
> TRƯỚC (SF-1 đã merge; snapshot D8 trong evidence-pack). Pilot mẫu:
> `src/content/blog/vi/zero-setup-agent-team.md`.

## Spec slice (chỉ phần SF-2 chịu trách nhiệm)

Viết 6 bài + tích hợp pilot: mỗi bài = 1 slug × (VI 900-1400 từ prose theo thuật
toán D1 + EN mirror ≥800, cùng commit), frontmatter đúng template, ≥1 link docs
đúng locale KHÔNG kèm #anchor, ≥1 evidence block thật, lint xanh, pubDate đúng
hàng dưới. KHÔNG đổi ngày/slug/category. Pilot `zero-setup-agent-team` (SF-1, ngày
08-20) là bài mở đầu series — cross-link 6 bài mới về pilot khi hợp lý; KHÔNG viết
lại pilot.

| # | slug | cat | pubDate | Angle (≥2 H2 mà seed không có) |
|---|------|-----|---------|---------------------------------|
| 2 | nine-agents-separated-powers | tech | 08-21 | CƠ CHẾ tách quyền PM/dev/tester sinh chất lượng: bảng 9 agents (docs agents-and-kit) + case reviewer bắt scoped-style + escaping P0 sau khi executor sign-off (docs story-workflow P2) |
| 3 | gates-not-trust-rule-zero | tech | 08-22 | CƠ CHỈ 5 gates per SF + B0-B5 + verdict types; case flow-check bắt stale preview server dù DOM sweep pass (docs P3). Khác seed decision-gates (triết lý) — bài này cơ chế |
| 4 | watchdog-idle-is-not-dead | tech | 08-23 | 3-layer check (commits/terminal/Linear) trước khi kết luận chết; 2 case: SF im vì build native dài → để yên; SF kẹt gate → resume last-good (docs P6) |
| 5 | story-memory-learning-loop | tech | 08-24 | Post-task ritual + story memory có provenance; case CLI flag đổi tên giữa 2 release cứu mọi story sau (docs P7) |
| 6 | defensive-by-design | tech | 08-25 | Thiết kế cho việc MÌNH sẽ sai: dry-test lệnh mới, nothing deleted, flag-not-guess; case merge conflict giữ CẢ HAI bên (docs P8) |
| 7 | controlled-rework-rollback | tech | 08-26 | Spec đổi giữa chừng: revert last-good + re-execute như 1 đơn vị review được; case FI-289 direction v1 → v2 Bento Premium (docs case study) |

Series pass (task cuối): đọc chéo 6 bài + pilot — tone nhất quán, cross-link ≥1
bài cùng series mỗi bài, không 2 bài dùng cùng evidence block chính, mỗi bài đối
chiếu angle ≥2 H2 mới trong matrix.

## Touch map (files SF-2 tạo/sở hữu)

```
src/content/blog/en/{nine-agents-separated-powers, gates-not-trust-rule-zero,
  watchdog-idle-is-not-dead, story-memory-learning-loop, defensive-by-design,
  controlled-rework-rollback}.md   (6 MỚI)
src/content/blog/vi/{… cùng 6 slug}.md                     (6 MỚI)
```

READ-ONLY tuyệt đối: mọi thứ khác — seeds, pilot, editorial kit (thấy sai → flag
lên epic, KHÔNG tự sửa), scripts, pages, bare `sf-N.md` packs (của FI-349).

## Evidence dùng chung (đối chiếu SNAPSHOT trong evidence-pack — rule D8)

- Case study nguồn: 5 docs `src/content/docs/en/*.md` + VI twins (P2/P3/P6/P7/P8
  examples + case study section) — TRÍCH ĐÚNG, không tô thêm chi tiết.
- Số liệu: 9 agents · 24 CLIs · gates B0-B5 (bảng trong superpowers-panel docs) ·
  skills theo snapshot.
- CẤM: screenshot bịa, transcript bịa, con số không đối chiếu được với snapshot.

## ACCEPTANCE (user-visible)

- /blog/ EN + VI thấy 6 bài mới đúng 21→26-08 (pilot 08-20 có từ SF-1), badge +
  mô tả đúng, không draft sót.
- Mở từng bài 2 locale: band đúng (prose, excl. code), TOC, ≥1 diagram/transcript,
  link docs đúng locale không anchor chết, cross-link ≥1 bài series.
- `pnpm build` xanh: parity ≥17 slug × 2 (10 seed + pilot + 6 mới; số có thể lớn
  hơn nếu series khác đã merge trước — parity pass là điều kiện, không cứng số) +
  lint pass toàn bộ.
- lint forbidden-grep 0 hit trên 6 bài (proxy; sweep đầy đủ ở SF-5).

## Boundary (KHÔNG làm)

- KHÔNG viết bài series B/C; cross-link chỉ trỏ bài ĐÃ tồn tại (B/C cùng tier
  chưa chắc merge — không link mù).
- KHÔNG đụng seeds/pilot/editorial-kit/lint/pages; sai gì flag lên epic.
- KHÔNG đổi pubDate/slug/category — cần đổi = REQUIREMENT-GAP lên epic.
- Commit atomic: 1 commit = 1 cặp VI+EN của 1 slug.
