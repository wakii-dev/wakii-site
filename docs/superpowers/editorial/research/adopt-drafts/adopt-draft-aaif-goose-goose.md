# ADOPT draft — injection boundary tại mọi automation entry point

> Nguồn: deep-dive aaif-goose/goose (batch-3, matrix #15). Draft cho SF-6 file
> issue tập trung (label `enhancement` trên wakii-dev/wakii) sau khi review.

## 1. Pattern

 goose (54.022 sao, Apache-2.0, theo GitHub API ngày 2026-09-08) ghi rõ biên
độ tin cậy NGAY TRONG từng workflow tự động nạp nội dung bên ngoài: ai được
kích hoạt, dữ liệu nào là untrusted, và trigger nào bị từ chối chủ động vì
lỗ hổng cụ thể (TOCTOU). Đây là kỷ luật documentation-as-guardrail: boundary
nằm cạnh code kích hoạt automation, không nằm trong tài liệu tổng.

## 2. Evidence inline

Từ `.github/workflows/goose-pr-reviewer.yml` (goose review PR của chính nó,
kích hoạt bằng comment "/goose"):

```
# Security:
#   - PR content could prompt-inject the agent; only trigger on PRs you trust.
#   - Do not add workflow_dispatch: API calls fetch mutable data, enabling TOCTOU attacks.
```

Workflow này gọi agent lên review nội dung PR do người ngoài tạo — goose
không che giấu rủi ro prompt-injection mà viết nó thành điều kiện vận hành,
cùng lý do từ chối mở thêm `workflow_dispatch` (dữ liệu mutable qua API →
TOCTOU). File đọc ngày 2026-09-08 tại HEAD `5e909259` (repo probe: stars
54.022 · pushed 2026-09-08 · Apache-2.0 · không archived, theo GitHub API
ngày 2026-09-08). Cùng kỷ luật ở tầng nhận lịch: `read_schedule_recipe`
(`crates/goose/src/agents/schedule_tool.rs`) canonicalize path, chặn file
lạ, cap 1.048.576 byte rồi mới validate template trước khi nhận schedule.

## 3. Đề xuất Wakii

- **Surface**: các skill + agent definition trong story-team-kit nạp nội dung
  bên ngoài — code-reviewer (đọc diff từ PR), verifier, watchdog (tự resume
  dựa trên state Linear), và mọi pipeline đọc issue/comment từ GitHub/Linear.
- **Hành vi kỳ vọng**: mỗi entry point đó có một chú thích boundary ngắn ở
  đầu docs/skill — (a) dữ liệu nào được coi là untrusted (diff PR, comment
  issue, nội dung web), (b) ai/cái gì được phép kích hoạt, (c) trigger nào
  bị từ chối và vì sao. Reviewer checking skill docs sẽ thấy boundary như
  một phần của contract, không phải kiến thức tribal.
- **Rủi ro chính**: docs rot — boundary phải sync khi đổi pipeline (giống
  mọi docs thuộc kit, đã có cơ chế sync theo app version); tránh biến thành
  boilerplate — chỉ entry point THẬT sự nạp nội dung ngoài mới cần.

## 4. Upstream links

- Repo: https://github.com/aaif-goose/goose
- Workflow với boundary notes: https://github.com/aaif-goose/goose/blob/5e90925962f05acf8e255032de44d16c4a7768a2/.github/workflows/goose-pr-reviewer.yml
- Validate-before-schedule: https://github.com/aaif-goose/goose/blob/5e90925962f05acf8e255032de44d16c4a7768a2/crates/goose/src/agents/schedule_tool.rs
- Recipe CI của chính goose: https://github.com/aaif-goose/goose/blob/5e90925962f05acf8e255032de44d16c4a7768a2/.github/recipes/code-review.yaml

*Draft ghi ngày 2026-09-08 — mọi số liệu kèm ngày probe trong văn bản. Bài
deep-dive sẽ live tại /blog/deep-dive-aaif-goose-goose/ sau khi story merge.*
