# ADOPT draft — verbatim error preservation in story memory

> Draft bởi SF-3 (FI-386) task T2 · source: deep-dive headroomlabs-ai/headroom
> (matrix #14, slug `deep-dive-headroomlabs-ai-headroom`). SF-6 file tập trung
> sau review (rubric style-guide §10, label `enhancement` trên wakii-dev/wakii).
> KHÔNG tự file issue.

## 1. Pattern

Khi nén bất kỳ nội dung nào agent hoặc người sẽ đọc lại, bảo toàn nguyên văn
các dòng chứa tín hiệu lỗi bằng một danh sách từ khoá cố định (error,
exception, failed, failure, critical, fatal, crash, panic, abort, timeout,
denied, rejected) — triết lý "over-preserve": mất một dòng lỗi thật đắt hơn
giữ thừa vài dòng vô hại. Học từ **headroomlabs-ai/headroom** — 70.491 sao,
Apache-2.0 (theo GitHub API ngày 2026-09-08).

## 2. Evidence inline

Code comment trong `crates/headroom-core/src/transforms/smart_crusher/
error_keywords.rs` @ commit `e67b3c8`: "Intentionally broad — better to
over-preserve than to drop a real error item" — kèm test khoá
`assert_eq!(ERROR_KEYWORDS.len(), 12)` (theo GitHub API ngày 2026-09-08).
README của repo ghi demo nén log 10.144 → 1.260 token với dòng FATAL còn
nguyên ("The same FATAL found"). Số token theo README truy ngày 2026-09-08.
Bài deep-dive sẽ live tại /blog/deep-dive-headroomlabs-ai-headroom/ sau khi
story merge.

## 3. Đề xuất Wakii

- **Surface**: post-task ritual + story memory (principle 7 "Memory and the
  learning loop", docs story-workflow).
- **Hành vi kỳ vọng**: mục "what went wrong" của ritual PHẢI chép nguyên văn
  dòng lỗi và lệnh gây lỗi (verbatim — giữ đúng chuỗi, đúng exit code, đúng
  path lỗi), paraphrase chỉ áp cho phần tóm ý còn lại. Lý do: SF/agent kế
  tiếp cần chuỗi chính xác để grep trong log và tái hiện lỗi; paraphrase làm
  mất khả năng tra cứu — đúng cái giá mà error_keywords.rs được viết để tránh.
- **Rủi ro chính**: story memory phình to. Giới hạn biên độ theo đúng pattern
  upstream: MỘT dòng lỗi + MỘT lệnh mỗi entry — over-preserve có biên, không
  phải chép cả transcript.

## 4. Upstream links

- Repo: https://github.com/headroomlabs-ai/headroom
- error_keywords.rs: https://github.com/headroomlabs-ai/headroom/blob/e67b3c8a29443a60d6b0018fb22f525c5cd7e709/crates/headroom-core/src/transforms/smart_crusher/error_keywords.rs
- safety.rs (bất biến tool-pair, ngữ cảnh thiết kế): https://github.com/headroomlabs-ai/headroom/blob/e67b3c8a29443a60d6b0018fb22f525c5cd7e709/crates/headroom-core/src/transforms/safety.rs
- README (section Proof): https://github.com/headroomlabs-ai/headroom#proof
