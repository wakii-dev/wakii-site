# ADOPT draft — Snapshot-commit trước khi agent áp edit (học từ Aider-AI/aider)

> Draft SF-3 (FI-386), matrix #16 `deep-dive-aider-ai-aider`. SF-6 file issue
> tập trung sau review — KHÔNG tự post issue.

## Pattern

Snapshot-commit: trước khi AI áp thay đổi vào một file đang có chỉnh sửa chưa
commit, harness tự commit trạng thái cũ để tạo điểm revert rõ ràng — thay đổi
của AI từ đó nằm tách biệt trong commit riêng có nhãn. Học từ Aider-AI/aider —
48.827 stars, license Apache-2.0 (theo GitHub API ngày 2026-09-08).

## Evidence inline

`check_for_dirty_commit` trong `aider/coders/base_coder.py` (tree tại commit
`5dc9490bb35f9729ef2c95d00a19ccd30c26339c`, probe ngày 2026-09-08):

```python
def check_for_dirty_commit(self, path):
    ...
    if not self.repo.is_dirty(path):
        return
    # We need a committed copy of the file in order to /undo, so skip this
    ...
    self.io.tool_output(f"Committing {path} before applying edits.")
    self.need_commit_before_edits.add(path)
```

Sau mỗi vòng edit, `auto_commit` gọi
`self.repo.commit(fnames=edited, context=context, aider_edits=True,
coder=self)` — commit AI được đánh dấu bằng cờ `aider_edits`, message do LLM
viết từ lịch sử hội thoại (cùng file, cùng commit tree, theo GitHub API ngày
2026-09-08).

Link: https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/coders/base_coder.py

## Đề xuất Wakii

- **Surface**: task-executor + rollback-fixer trong story workflow.
- **Hành vi kỳ vọng**: executor mở task, nếu worktree đang có thay đổi chưa
  commit (resume giữa chừng, phiên agent trước để lại) thì tự tạo một
  snapshot-commit với nhãn máy đọc được (ví dụ prefix `snapshot:`) TRƯỚC edit
  đầu tiên; các commit của agent về sau mang nhãn agent riêng. rollback-fixer
  khi cần revert sẽ neo theo nhãn thay vì đếm commit thủ công — đúng tinh thần
  "nothing is deleted, everything is revertable" của principle 8, nhưng ở tầm
  edit thay vì tầm task.
- **Rủi ro chính**: nhiễu lịch sử commit trong worktree — giảm bằng prefix
  chuẩn; convergence của Wakii (mọi SF hội về một nhánh đích, một PR mỗi
  story) đã hấp thụ phần nhiễu này trước khi tới review.

## Upstream links

- Repo: https://github.com/Aider-AI/aider
- Code: https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/coders/base_coder.py
- Git integration docs (link từ README tại ngày probe): https://aider.chat/docs/git.html
- Bài post public tương ứng: sẽ live tại `/blog/deep-dive-aider-ai-aider/`
  sau khi story FI-383 merge (build-in-public đã được duyệt 2026-09-07).
