---
title: Lessons index — entry point bài học rút ra
date: 2026-09-10
updated: 2026-09-10
status: active
visibility: internal
confidence: high
sources: [docs/superpowers/improvements-log.md]
tags: [lessons, improvements, process]
type: lesson
---

# Lessons index

Index bài học đã kết luận. Vai trò hai lớp:

- **Log sống (in-flight)**: `docs/superpowers/improvements-log.md` — mọi SF
  ghi learnings thô vào đây ngay khi xong. File này thuộc superpowers,
  **LINK-only** (KHÔNG copy/move nội dung sang KB).
- **Curated entry point (file này)**: tóm tắt lại bài học đã chứng minh lặp
  lại, kèm link về section tương ứng trong log.

**Quy tắc lên lesson:** một improvement xuất hiện **≥2 lần** (2 SF khác nhau
vấp cùng bẫy, hoặc cùng fix áp cho ≥2 story) → tóm tắt 1-2 câu thành lesson ở
đây + link về section log. Bài học chỉ xuất hiện 1 lần: đọc log, chưa lên
lesson.

## Lessons (seed)

1. **Merge khi dest branch bị checkout ATTACH ở nơi khác** — `git worktree add`
   nhánh đó sẽ fatal "already used". Recipe: worktree `--detach` tại dest
   commit → merge --no-ff → build verify → push merge lên dest → `git merge
   --ff-only` dest về local checkout chính (B4 story-verify đọc LOCAL dest
   branch — push remote một mình là FAIL). Lặp: SF-6 FI-389 + các story
   verify trước đó. → log: improvements-log, section "SF-6 (FI-389) learnings
   — batch-3 convergence + ADOPT file — 2026-09-08",
   [improvements-log.md](../../superpowers/improvements-log.md).

2. **Đo tay bằng curl/grep phải cross-check audit machine trước khi tin** —
   số sai đa số do cú pháp đo (route prefix không tồn tại, regex bắt cả class
   con, `grep -c` đếm dòng không đếm occurrences), không phải do site. Mọi
   lệch giữa đo tay và audit script = nghi phép đo trước, site sau. Lặp:
   SF-6 FI-389 (DOM cross-check) + SF-3 FI-386 (astro preview giữ stale dist
   sau rebuild → restart trước khi đo). → log: sections "SF-6 (FI-389)
   learnings" và "SF-3 (FI-386) learnings — batch-3 harness+MCP 10 bài",
   [improvements-log.md](../../superpowers/improvements-log.md).

3. **Launch prompt tái sử dụng dễ stale — verify 3 nguồn trước khi chạy** —
   prompt reuse giữa các story mang issue ID/scope của story cũ (đã gặp ở
   SF-1 FI-384, SF-2 FI-385, SF-5 FI-388). Verify ĐỒNG THỜI: (1) worktree
   linkedLinearIssue, (2) context pack content, (3) `orca linear issue <id>`
   title — 3 nguồn khớp mới chạy; prompt text thua cả 3. → log: sections
   "SF-1 (FI-384) learnings", "SF-2 (FI-385) learnings — batch-3 pilot 12
   repo", "SF-5 (FI-388) learnings — batch-3 editors+terminal+misc",
   [improvements-log.md](../../superpowers/improvements-log.md).
