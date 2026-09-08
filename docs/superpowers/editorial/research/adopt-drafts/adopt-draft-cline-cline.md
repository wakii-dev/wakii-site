# ADOPT draft — cline/cline (batch-3, matrix #12, FI-385)

> Draft theo rubric style-guide §10. SF-6 file TẬP TRUNG sau review —
> draft này là seeding, không tự post. Label dự kiến: `enhancement` trên `wakii-dev/wakii`.

## Pattern (1-2 câu)

Checkpoint per-run với restore transactional — học từ **cline/cline** (67.661★, license Apache-2.0, theo GitHub API ngày 2026-09-08). Mỗi run của agent được chụp vào một private git ref (`refs/cline/checkpoints/<sessionId>/<runCount>`, ngoài nhánh người dùng), và hoàn tác chạy qua một giao dịch stash-cả-untracked có commit/rollback thay vì `git checkout` thô.

## Evidence inline (tự đứng được nếu link chết)

- Mỗi checkpoint là `CheckpointEntry { ref, createdAt, runCount}`, được retain tại `refs/cline/checkpoints/${sessionId}/${entry.runCount}` — trích `checkpoint-hooks.ts` @ `f5af821`:
  ```
  `refs/cline/checkpoints/${sessionId}/${entry.runCount}`
  ```
  (theo GitHub API ngày 2026-09-08; blob: https://github.com/cline/cline/blob/f5af821/sdk/packages/core/src/hooks/checkpoint-hooks.ts)
- Restore bọc giao dịch — comment nguyên văn trong `checkpoint-restore.ts` @ `f5af821` (≤25 từ): "git stash create omits untracked files, but checkpoint restoration runs git clean -fd" — nên Cline dùng `stash push --include-untracked` + private ref ngắn hạn + commit/rollback. (blob: https://github.com/cline/cline/blob/f5af821/sdk/packages/core/src/session/checkpoint-restore.ts)

## Đề xuất Wakii

- **Surface**: task-executor preflight + rollback-fixer (kit `story-team-kit`, story-* CLIs).
- **Hành vi kỳ vọng**: trước mỗi nhóm thao tác ghi trong task, executor chụp một private ref trong worktree (namespace `refs/wakii/checkpoints/<taskId>/<step>`); rollback-fixer restore qua giao dịch stash-cả-untracked (không `git clean -fd` trần) — hoàn tác per-step không phá file untracked của user, thay vì chỉ per-task commit.
- **Rủi ro chính**: (1) rác ref tích tụ theo story dài — cần retention (Cline có `retainCheckpointRefs` để tham chiếu); (2) máy không có git hoặc worktree git submodule — phải degrade an toàn (skip snapshot, log WARNING) thay vì chặn task; (3) overlap với watchdog "resume from last good state" — ref phải gắn phiên bản transcript để watchdog chọn đúng mốc.

## Upstream links

- Repo: https://github.com/cline/cline
- checkpoint-hooks.ts (private refs): https://github.com/cline/cline/blob/f5af821/sdk/packages/core/src/hooks/checkpoint-hooks.ts
- checkpoint-restore.ts (transactional restore): https://github.com/cline/cline/blob/f5af821/sdk/packages/core/src/session/checkpoint-restore.ts
- Bài deep-dive: sẽ live tại `/blog/deep-dive-cline-cline/` (VI: `/vi/blog/deep-dive-cline-cline/`) sau khi story FI-383 merge.
