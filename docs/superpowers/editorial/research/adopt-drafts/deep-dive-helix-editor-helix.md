# ADOPT draft — runnable tutor shipped with the product (helix-editor/helix)

> Draft từ bài `deep-dive-helix-editor-helix` (matrix #41, FI-388 SF-5).
> SF-6 file tập trung sau review — KHÔNG file issue từ SF.

## 1. Pattern

Tutor tương tác nằm trong binary: `hx --tutor` mở bài học chạy ngay trong
editor thật, offline, không cần docs ngoài. Học từ **helix-editor/helix** —
46.133 sao, license MPL-2.0 (theo GitHub API ngày 2026-09-08). Người mới học
công cụ bằng cách DÙNG công cụ trên nội dung an toàn, thay vì đọc tài liệu
rồi tự thử trên project thật.

## 2. Evidence inline

- Book usage.md (probe 2026-09-08): tutor truy cập qua `hx --tutor` hoặc
  `:tutor`; nguồn nội dung là file `runtime/tutor` trong repo —
  https://github.com/helix-editor/helix/blob/079a789e8cb08ead67f19e1971a1b7438b37354b/book/src/usage.md
- Quote ngắn từ book: "refer to the tutor" kèm lệnh `hx --tutor` (usage.md,
  cùng link trên) — bài học là file dữ liệu, binary chỉ cần mở và hiển thị.

## 3. Đề xuất Wakii

- **Surface**: kit Wakii (skills + story-* CLIs) — thêm một story mẫu sandbox
  (`story-tutor` hoặc skill hướng dẫn tương đương) kèm bộ cài.
- **Hành vi kỳ vọng**: người mới chạy một story end-to-end trong môi trường
  an toàn (repo mẫu nhỏ, không đụng project thật), đi qua đủ vòng
  brainstorm → plan → execute → review → merge với agent thật; offline, không
  cần cấu hình thêm. Kết quả học: hiểu nhịp story trước khi thử trên việc
  thật.
- **Rủi ro chính**: nội dung tutor stale khi workflow đổi (cần gắn tutor vào
  cùng PR đổi workflow); story mẫu có thể đụng model/API cost cho người mới —
  cân nhắc chế độ chạy không tốn token cho phần demo.

## 4. Upstream links

- Repo: https://github.com/helix-editor/helix
- Tutor file: https://github.com/helix-editor/helix/blob/079a789e8cb08ead67f19e1971a1b7438b37354b/runtime/tutor
- Book usage.md: https://github.com/helix-editor/helix/blob/079a789e8cb08ead67f19e1971a1b7438b37354b/book/src/usage.md
- Bài deep-dive sẽ live tại `/blog/deep-dive-helix-editor-helix/` sau khi
  story FI-383 merge (build-in-public đã duyệt 2026-09-07).
