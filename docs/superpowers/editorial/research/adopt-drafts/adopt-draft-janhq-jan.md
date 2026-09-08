# ADOPT draft — janhq/jan (batch-3, matrix #30, SF-4/FI-387)

> Draft theo style-guide §10 — SF-6 file tập trung sau review (KHÔNG tự file
> issue từ SF). Grade nguồn: bài `deep-dive-janhq-jan` section
> "Wakii học được gì". License-safe: draft tuân scoped-FORBIDDEN của slug †
> (hai cụm bị cấm theo claims-registry §FORBIDDEN) — gọi "công khai trên
> GitHub", không tự gán nhãn license.

## 1. Pattern

**Riêng tư làm mặc định của kiến trúc, không phải tùy chọn cài đặt.** Jan
(44.380 stars, license NOASSERTION theo GitHub API ngày 2026-09-08 — công khai
trên GitHub) đóng gói engine suy luận llama.cpp ngay trong app desktop và giữ
model + dữ liệu hội thoại trên máy người dùng; khả năng chạy local là điều kiện
mặc định của thiết kế, còn cloud là lựa chọn bổ sung đứng sau.

## 2. Evidence inline

- README (tính năng xếp theo trật tự ưu tiên): mục đầu là tải và chạy model
  local từ Hugging Face; phần privacy kết bằng — "Privacy First: Everything
  runs locally when you want it to" (README của janhq/jan,
  https://github.com/janhq/jan, theo GitHub API ngày 2026-09-08).
- App đồng thời mở service chuẩn cho máy cục bộ: "OpenAI-Compatible API:
  Local server at `localhost:1337` for other applications" (cùng README) —
  riêng tư không mâu thuẫn với khả năng chia sẻ theo giao thức chuẩn.
- Đóng gói: engine chạy như plugin native của Tauri, gọi qua
  `invoke`/`listen` (`extensions/llamacpp-extension/src/index.ts` @ commit
  `dc40d7c273e74a7d079f4635d93472b7fdb4ce2b`, theo GitHub API ngày
  2026-09-08) — "cài app là có engine", không có bước cài engine riêng.

## 3. Đề xuất Wakii

- **Surface áp dụng:** checklist review tính năng mới của story-workflow
  (bước plan-review / plan-critic) và các gate kỹ thuật.
- **Wakii đã áp cùng hướng:** kit tự cài vào `~/.claude/` lần đầu chạy
  (zero-setup, idempotent), story diễn ra trong worktree cục bộ trên máy,
  không đòi server trung gian cho luồng chính.
- **Đề xuất tiếp theo:** ghi nguyên tắc "mặc định không rời máy" thành một
  câu kiểm trong checklist review tính năng mới — tính năng nào cần cloud
  phải nêu rõ vì sao trong plan (dữ liệu gì đi, đi đâu, có thể tắt không).
  Kỳ vọng hành vi: không có luồng dữ liệu nào gửi đi ngầm định; rủi ro chính
  là nguyên tắc bị đọc cứng nhắc — các tính năng backend-cần-thiết (kiểm
  update, telemetry opt-in nếu có) phải được miễn có kiểm soát bằng cách ghi
  rõ trong plan thay vì né checklist.

## 4. Upstream links

- Repo: https://github.com/janhq/jan
- Commit đọc code: https://github.com/janhq/jan/commit/dc40d7c273e74a7d079f4635d93472b7fdb4ce2b
- `llamacpp-extension/src/index.ts`: https://github.com/janhq/jan/blob/dc40d7c273e74a7d079f4635d93472b7fdb4ce2b/extensions/llamacpp-extension/src/index.ts
- `AIEngine.ts`: https://github.com/janhq/jan/blob/dc40d7c273e74a7d079f4635d93472b7fdb4ce2b/core/src/browser/extensions/engines/AIEngine.ts
- LICENSE (GitHub API hiển thị NOASSERTION): https://github.com/janhq/jan/blob/dc40d7c273e74a7d079f4635d93472b7fdb4ce2b/LICENSE
- Blog post public (sau khi story merge): `/blog/deep-dive-janhq-jan/`
