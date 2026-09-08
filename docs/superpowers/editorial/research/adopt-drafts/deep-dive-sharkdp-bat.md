# ADOPT draft — output adapts to its consumer (sharkdp/bat)

> Draft từ bài `deep-dive-sharkdp-bat` (matrix #39, FI-388 SF-5).
> SF-6 file tập trung sau review — KHÔNG file issue từ SF.

## 1. Pattern

Output thích ứng theo người tiêu dùng: cùng một tool cho terminal tương tác
bản có màu/pager, còn khi bị pipe thì tự về plain text đoán trước được —
không cần flag. Học từ **sharkdp/bat** — 60.388 sao, license Apache-2.0
(theo GitHub API ngày 2026-09-08). README ghi rõ: non-interactive terminal →
"bat will act as a drop-in replacement for cat and fall back to printing the
plain file contents", bất kể cấu hình pager.

## 2. Evidence inline

- README (truy cập 2026-09-08): "Whenever bat detects a non-interactive
  terminal (i.e. when you pipe into another process or into a file), bat will
  act as a drop-in replacement for cat and fall back to printing the plain
  file contents" — [bat README](https://github.com/sharkdp/bat#readme).
- Cơ chế tương tác được tách thành module riêng: `src/pager.rs`,
  `src/output.rs`, `src/terminal.rs` trong tree
  (https://github.com/sharkdp/bat/tree/7323a7514f7601737640e7172be115127d6db08c/src),
  theo GitHub API ngày 2026-09-08.
- Mặt khác của hợp đồng: agent/script đọc output bat khi pipe luôn nhận văn
  bản sạch — không màu ANSI, không escape sequence trang trí — đủ để grep và
  parse ổn định.

## 3. Đề xuất Wakii

- **Surface**: các story-* CLI trong kit Wakii (~/.claude/bin/story-*) —
  công cụ mà cả người (terminal) và agent (script/pipe) cùng chạy.
- **Hành vi kỳ vọng**: CLI phát hiện stdout là TTY → in bảng/định dạng đẹp
  cho người; stdout bị pipe → in plain text, tùy chọn `--json` chuẩn hoá —
  agent parse không phải đoán, người không phải gõ flag.
- **Rủi ro chính**: hai chế độ output = hai code path phải test song song;
  mitigated bằng cách chỉ format màu ở lớp render cuối, phần dữ liệu giữ
  một nguồn duy nhất.

## 4. Upstream links

- Repo: https://github.com/sharkdp/bat
- README (pipe fallback + paging): https://github.com/sharkdp/bat#readme
- Tree tại commit probe: https://github.com/sharkdp/bat/tree/7323a7514f7601737640e7172be115127d6db08c
- Bài blog sẽ live tại /blog/deep-dive-sharkdp-bat/ sau khi story merge.
