# ADOPT draft — confidence-based scoring cho review findings

> Draft do SF-2 (FI-385) viết — SF-6 file tập trung sau review (style-guide §10).
> Repo nguồn: **anthropics/claude-code** — 144.420★, license none ("công khai trên
> GitHub", không phải license chuẩn), theo GitHub API ngày 2026-09-08.
> Label đề xuất: `enhancement` trên `wakii-dev/wakii`.

## 1. Pattern

Plugin `code-review` chính thức của claude-code chạy 5 review agent song song
(CLAUDE.md compliance, bug detection, historical context, PR history, code comments),
rồi **chấm độ tin cậy (confidence) từng finding để lọc false positive** trước khi
kết quả tới người đọc. Vấn đề nó giải: review đa agent bội số hoá findings, và
false positive tràn vào review của người thật là nhiễu đắt — người duyệt ngừng tin
cảnh báo, cảnh báo thật bị bỏ lọt theo.

## 2. Evidence inline

Quote từ `plugins/README.md` @ commit `ab9b2cf` (đọc ngày 2026-09-08):

> "Automated PR code review using multiple specialized agents with confidence-based
> scoring to filter false positives"

Bổ trợ — `silent-failure-hunter` (1 trong 6 agent của `pr-review-toolkit`) mở đầu
system prompt: "Silent failures are unacceptable - Any error that occurs without
proper logging and user feedback is a critical defect" — cùng commit `ab9b2cf`.
Số repo: 144.420★, 30 release trong 30 ngày (07-08 → 06-09), theo GitHub API ngày
2026-09-08. Context Wakii: đối chiếu grading trong bài deep-dive — "bài sẽ live tại
/blog/deep-dive-anthropics-claude-code/ sau khi story merge" (VI + EN).

## 3. Đề xuất Wakii

- **Surface**: pipeline review của story workflow — agent `code-reviewer` hiện phát
  findings tới tay người duyệt (và `verifier`) ở mức trọng số gần như đồng đều.
- **Hành vi kỳ vọng**: mỗi finding kèm trường confidence (high/medium/low hoặc 0-1).
  Gate (B2/code-review) chỉ **block** ở high-confidence; medium/low render thành
  NOTE không chặn. Người duyệt vẫn thấy đủ — nhưng thứ tự và trọng số đổi theo độ
  tin cậy.
- **Rủi ro chính**: calibration sai → cảnh báo thật bị hạ thành NOTE và lọt qua gate
  (đối xứng với rủi ro false positive hiện tại). Giảm rủi ro: chỉ hạ NOT được khi
  có ≥1 tín hiệu phụ (ví dụ reviewer thứ hai hoặc verifier không xác nhận); log mọi
  finding bị hạ để QA định kỳ soát lại. Lưu ý từ quy trình Wakii: pattern này phải
  giữ nguyên tính adversarial của review — confidence là lọc hiển thị, không phải
  cơ chế tự xoá findings.

## 4. Upstream links

- Repo: https://github.com/anthropics/claude-code (public on GitHub; license none —
  dùng theo Commercial Terms of Service của Anthropic)
- plugins/README.md @ ab9b2cf: https://github.com/anthropics/claude-code/blob/ab9b2cf/plugins/README.md
- code-review plugin: https://github.com/anthropics/claude-code/tree/ab9b2cf/plugins/code-review
- silent-failure-hunter agent: https://github.com/anthropics/claude-code/blob/ab9b2cf/plugins/pr-review-toolkit/agents/silent-failure-hunter.md

---

## DIRECTION candidates (không file issue ở SF này — SF-6 cân nhắc)

- **Changelog công bố cơ chế** — v2.1.261 của claude-code giải thích cơ chế
  prompt-cache của agent teams qua một dòng fix; CHANGELOG 387 bản ghi @ `ab9b2cf`.
  Wakii release notes hiện ở mức tính năng; với 24 story-* CLIs trong kit, mỗi
  release kèm 1-2 dòng "cơ chế đã đổi" là tài liệu sống rẻ. Evidence + link trong
  bài deep-dive (§ "Một release mỗi ngày").
- **`/skill-doctor` pattern** — đo skill nào unused + tốn bao nhiêu context
  ("which loaded skills go unused and what they cost in context" — CHANGELOG
  v2.1.261 @ `ab9b2cf`), áp dụng được cho 20 skills của Wakii kit (tại thời điểm
  viết, claims-registry D8).
