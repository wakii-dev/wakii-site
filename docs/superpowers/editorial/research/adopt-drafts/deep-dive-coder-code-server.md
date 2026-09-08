# ADOPT draft — named patch layer for fork deltas (coder/code-server)

> Draft từ bài `deep-dive-coder-code-server` (matrix #37, FI-388 SF-5).
> SF-6 file tập trung sau review — KHÔNG file issue từ SF.

## 1. Pattern

Một concern một patch có tên: giữ delta fork/fork-upstream thành các `.diff`
độc lập, tên file tự tả concern, thay vì một khối sửa lớn vô danh. Học từ
**coder/code-server** — 79.234 sao, license MIT (theo GitHub API ngày
2026-09-08). Repo vendor nguyên khối VS Code bằng submodule và duy trì lớp
`patches/` với các file như `app-name.diff`, `base-path.diff`,
`keepalive.diff`, `disable-builtin-ext-update.diff` — sync upstream mới chỉ
cần re-apply từng diff, xung đột khoanh vùng ngay tại patch đụng API.

## 2. Evidence inline

- Cấu trúc thư mục `patches/` (probe 2026-09-08) chứa ≥15 file `.diff` mỗi
  file một concern, xem tại
  `https://github.com/coder/code-server/tree/62284ed549bc41236d62c789a071120aea206a78/patches`.
- `.gitmodules` khai submodule `lib/vscode` trỏ
  `https://github.com/microsoft/vscode` — vendor nguyên khối, không fork repo
  riêng.
- Cadence chứng minh pattern sống với upstream dồn dập: 5 release gần nhất
  cách nhau 3-11 ngày (v4.131.0 ngày 30-07-2026 → v4.135.0 ngày 27-08-2026),
  theo GitHub API ngày 2026-09-08.

## 3. Đề xuất Wakii

- **Surface**: repo `wakii-dev/wakii` (fork của Orca) — tài liệu/quy trình
  sync upstream, không đụng code runtime.
- **Hành vi kỳ vọng**: một inventory delta fork theo concern (tên + lý do +
  file đụng) được cập nhật mỗi khi thêm/sửa delta; mỗi lần sync upstream chạy
  checklist re-validate từng mục — delta nào upstream đã absorb thì gỡ khỏi
  inventory. Kết quả: sync thành dây chuyền apply → build → test → lặp thay
  vì khảo cổ commit.
- **Rủi ro chính**: inventory stale nếu không gắn vào quy trình sync (cần
  gate/checklist nhắc); delta có thể phụ thuộc nhau dù tên độc lập — re-apply
  phải giữ thứ tự; chi phí ghi nhận ban đầu cho delta cũ.

## 4. Upstream links

- Repo: https://github.com/coder/code-server
- Patch layer @ SHA: https://github.com/coder/code-server/tree/62284ed549bc41236d62c789a071120aea206a78/patches
- `.gitmodules`: https://github.com/coder/code-server/blob/62284ed549bc41236d62c789a071120aea206a78/.gitmodules
- Bài deep-dive sẽ live tại `/blog/deep-dive-coder-code-server/` sau khi
  story FI-383 merge (build-in-public đã duyệt 2026-09-07).
