# ADOPT draft — DeusData/codebase-memory-mcp (batch-3, matrix #17)

> Draft do SF-3 (FI-386) viết — SF-6 file issue TẬP TRUNG sau review
> (runbook batch-3 bước 5; KHÔNG tự issue). Rubric: style-guide §10.
> Bài gốc sẽ live tại `/blog/deep-dive-deusdata-codebase-memory-mcp/` sau khi
> story merge (build-in-public đã duyệt 2026-09-07).

## Pattern

**Baseline chỉ ghi khi rebuild thành công + stamp freshness cho memory file:**
memory/cache phải mang mốc nguồn (commit sha / hash), mốc chỉ được ghi khi phép
rebuild thành công, và phải đối chiếu mốc trước khi tin nội dung. Học từ
DeusData/codebase-memory-mcp — MCP server code-intelligence viết bằng C thuần,
**42.644 sao, license MIT (theo GitHub API ngày 2026-09-08)**.

## Evidence inline

- Watcher nền poll đúng git change, không quét mtime loạn:
  "Polls indexed projects for git changes (HEAD movement or dirty working tree)
  and triggers re-indexing via a callback" — comment trong `src/watcher/watcher.h`
  (theo GitHub API ngày 2026-09-08):
  https://github.com/DeusData/codebase-memory-mcp/blob/161df2bdb1f4e28734f326a73f6e7989418f1288/src/watcher/watcher.h
- Baseline chỉ commit khi thành công — thất bại không xóa kiến thức cũ:
  "a skipped or failed reindex keeps the change pending so it is retried, never
  silently lost (#937)" — cùng file trên.
- Incremental index đối chiếu hash trước khi tin cache:
  "Compares file mtime+size against stored hashes to classify changed/unchanged"
  — `src/pipeline/pipeline_incremental.c` (cùng commit sha, API 2026-09-08):
  https://github.com/DeusData/codebase-memory-mcp/blob/161df2bdb1f4e28734f326a73f6e7989418f1288/src/pipeline/pipeline_incremental.c

## Đề xuất Wakii

- **Surface:** context pack của story workflow (pack sinh một lần ở epic, các
  SF kế thừa — nguyên tắc "analyze once, inherit many").
- **Hành vi kỳ vọng:** pack ghi kèm `base-sha` của nhánh đích lúc sinh; trước
  khi executor đọc pack, so sha với HEAD hiện tại của dest — lệch thì chặn bằng
  cảnh báo "pack stale — re-sync" thay vì tin mù. Cùng tinh thần merge CAS guard
  (`git merge-base --is-ancestor <dest-cũ> HEAD`) mà các SF batch trước đã dùng
  cho nhánh đích, mở rộng sang tài liệu.
- **Rủi ro chính:** thêm một phép so sánh vào đường chạy SF → friction nhỏ;
  nếu dest nhích thường xuyên (batch lớn nhiều SF merge), guard có thể kêu nhiều
  — cân nhắc chỉ cảnh báo khi pack chứa facts nhạy cảm (số liệu, inventory) hoặc
  cho phép đánh dấu "đã re-sync thủ công".

## Upstream links

- Repo: https://github.com/DeusData/codebase-memory-mcp
- watcher.h (anti-stale + baseline-on-success):
  https://github.com/DeusData/codebase-memory-mcp/blob/161df2bdb1f4e28734f326a73f6e7989418f1288/src/watcher/watcher.h
- pipeline_incremental.c (incremental re-index):
  https://github.com/DeusData/codebase-memory-mcp/blob/161df2bdb1f4e28734f326a73f6e7989418f1288/src/pipeline/pipeline_incremental.c
