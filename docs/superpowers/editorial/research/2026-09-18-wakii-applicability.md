# Wakii applicability — alibaba/open-code-review (2026-09-18)

Đối chiếu với surface hiện tại: kit (story-* bins, code-reviewer def, gates B0–B5,
watchdog), orca-superpowers-workflow P4 review phase, fork CI (.github/workflows).

**Bối cảnh quan trọng:** kit 2.14.0 (commit `d9be213225`, branch `story/gh45-kb-layer1`,
chưa merge integration) ĐÃ lấy 5 rules từ repo này: coverage pass, position-verify,
meta-test, flaky tracker, combo integration check. Bảng dưới chấm **phần còn lại**.

| # | Pattern | Level | Landed-ở-đâu (nếu adopt) |
|---|---------|-------|--------------------------|
| 1 | Business-context injection (`--background`) — reviewer nhận spec slice + verify-criteria của task trước khi đọc diff | **ADOPT** | `kit/agents/code-reviewer.md` — thêm 1 mục "Input: spec + criteria", giảm false-positive do review không biết intent |
| 2 | Deterministic findings làm INPUT (oxlint/tc output đưa thẳng vào reviewer, LLM chỉ đánh giá vượt mức) | **ADOPT** | `kit/agents/code-reviewer.md` + P4 SKILL.md — tránh trùng finding, tiết kiệm token, đúng tinh thần hybrid của OCR |
| 3 | Precision-over-recall **viết thành policy** (P2/nitpick được drop; P0/P1 bắt buộc position-verify) | **ADOPT** | `kit/agents/code-reviewer.md` — coverage pass của 2.14.0 đẩy recall; cần câu đối nhằm giữ noise thấp |
| 4 | Adaptive depth theo diff size (>50 lines mới bật risk-analysis pass) | **ADOPT** | P4 code-review phase — diff nhỏ đi light pass, đỡ đốt review token |
| 5 | Mini review-bench từ bug thật (PR đã fix P0/P1 → ground truth; chấm reviewer-def mới trước khi thăng version kit) | **WATCH** | Cần quyết định product: xây bộ ground truth trong `kit/tests/` — investment có kỷ, nhưng biến "kit 2.x review tốt hơn" thành số đo được thay vì cảm tính |
| 6 | `suggestion_code` — finding kèm diff apply-được | **ADOPT** (nice-to-have) | Gate report format: P0/P1 kèm suggestion diff để worker-start fix nhanh hơn |
| 7 | Pin CI actions by SHA (`verify-action-pins.sh` của họ; fork đang dùng `@v4` tags) | **ADOPT** cho fork CI | `.github/workflows/*` — supply-chain hardening, chuẩn OSSF Gold, config-level rẻ |
| 8 | Chạy `ocr` CLI như reviewer tier thứ 2 cạnh code-reviewer agent (so kết quả chéo) | **WATCH** | Cần cấu hình LLM endpoint riêng + quyết định có chấp nhận phụ thuộc npm package ngoài vào gate không |
| 9 | Multi-CI (gerrit/bitbucket/codeup), VSCode extension, npm multi-platform | **N/A** | Là sản phẩm của họ, không phải review doctrine |
| 10 | AACR-Bench public trên HF làm moat benchmark | **N/A** blog / **WATCH** idea | Editorial angle (xem digest); không áp trực tiếp vào product |

## drift vs lần research trước

Folder `research/` chưa có file applicability có ngày nào trước 2026-09-18
(chỉ có `adopt-drafts/` cho các repo khác) — không có baseline để so drift.
Đây là entry đầu theo format mới.

## Nguồn

- Repo: https://github.com/alibaba/open-code-review (Apache-2.0) — retrieval 2026-09-18
- SKILL.md của họ: skills/open-code-review/SKILL.md (đọc qua zread, cùng ngày)
- Kit 2.14.0 đã lấy gì: commit `d9be213225` trên `wakii-dev/wakii` branch `story/gh45-kb-layer1`
