# ADOPT draft — ggml-org/llama.cpp (batch-3, matrix #6, SF-2/FI-385)

> Draft cho SF-6 file issue TẬP TRUNG sau review (style-guide §10; label
> `enhancement` trên wakii-dev/wakii). KHÔNG link path nội bộ — dẫn chứng
> bằng bài post public: "bài sẽ live tại /blog/deep-dive-ggml-org-llama-cpp/
> sau khi story merge" (build-in-public đã user duyệt 2026-09-07).

## Pattern

**"Understand before merge — the human owns every line, and convention comes from real data."** Học từ [ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp) (127.477★, license MIT, theo GitHub API ngày 2026-09-08): repo không cấm AI sinh code — nó cấm submit code mà người đóng góp không hiểu được, và bắt agent đọc `git log` các PR đã merged để nắm convention thay vì tin tài liệu có thể lag.

## Evidence inline

`AGENTS.md` (clone @ `1744c6b`, 2026-09-08), nguyên tắc đầu tiên:

> "AI-generated code is allowed. What is **not** allowed is submitting code you do not understand."

Và lý do kinh tế phía dưới:

> "a simpler change that does 90% of the job is often preferable to a complex one that does 100%"

`skills/add-new-model/SKILL.md` (cùng clone) bắt đọc `git log --oneline` của ít nhất 3 PR thêm model gần nhất — vì log đó "shows current convention more reliably than the docs, which can lag behind"; cấm viết hộ PR description và commit message; bắt disclosure mọi đóng góp có AI; ký `Assisted-by:` thay vì `Co-authored-by:`. Số repo: 127.477★, pushed 2026-09-08T11:36:37Z, MIT (theo GitHub API ngày 2026-09-08).

## Đề xuất Wakii

Áp vào **code-reviewer checklist + human merge gate (gates B0–B5)**:

1. Checklist review thêm 1 dòng kiểu llama.cpp: executor/reviewer phải giải thích được *vì sao* thay đổi đúng — không chỉ pass lint/test. "Agent nói nó chạy" không phải evidence — Wakii đã có nguyên tắc này (Rule 0, "Humans own the irreversibles"); llama.cpp củng cố bằng chính sách của repo hạ tầng 127k★.
2. Convention trỏ tới ví dụ đã merged gần nhất (git log), không trỏ tới mô tả trong doc — áp cho context pack của task-executor: mỗi task kèm 1-2 commit mẫu gần nhất cùng loại.
3. Cân nhắc chuẩn trailer cho commit/PR agent-tham-gia: llama.cpp dùng `Assisted-by:` (cố ý KHÔNG dùng `Co-authored-by:` vì author phải là người chịu trách nhiệm). Wakii hiện dùng `Co-Authored-By` cho Claude — đổi là quyết định convention, cần coordinator quyết, không phải thay đổi kỹ thuật.

Kỳ vọng hành vi: reviewer output có mục "vì sao đúng" trỏ evidence; context pack có commit mẫu; PR description do người duyệt viết/duyệt. Rủi ro chính: thêm friction vào review — giữ ở mức 1 dòng checklist, không thành gate mới.

## Upstream links

- Repo: https://github.com/ggml-org/llama.cpp
- AGENTS.md: https://github.com/ggml-org/llama.cpp/blob/1744c6b/AGENTS.md
- Contribution skill: https://github.com/ggml-org/llama.cpp/blob/1744c6b/skills/add-new-model/SKILL.md
- Backend registry (khối score-based): https://github.com/ggml-org/llama.cpp/blob/1744c6b/ggml/src/ggml-backend-reg.cpp
- Bài deep-dive: sẽ live tại /blog/deep-dive-ggml-org-llama-cpp/ sau khi story merge
