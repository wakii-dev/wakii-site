# ADOPT draft — honest benchmarking with published cliffs (BurntSushi/ripgrep)

> Draft từ bài `deep-dive-burntsushi-ripgrep` (matrix #38, FI-388 SF-5).
> SF-6 file tập trung sau review — KHÔNG file issue từ SF.

## 1. Pattern

Benchmark trung thực: công bố bảng thắng CÙNG bảng giới hạn (khi nào chậm,
vì sao) kèm cơ chế, thay vì chỉ cite case đẹp. Học từ **BurntSushi/ripgrep** —
68.084 sao, license Unlicense (theo GitHub API ngày 2026-09-08). README đặt
bảng benchmark ripgrep thắng (0.082s trên kernel tree) ngay cạnh section
"Beware of performance cliffs" — pattern `[A-Za-z]{30}` mất 15.569s trên file
13GB, `rg the` với 83.499.915 match mất 6.948s — mỗi case có giải thích cơ chế
(thiếu literal optimization / thời gian bị chi phối bởi xử lý match).

## 2. Evidence inline

- "Beware of performance cliffs though" — README liệt kê cả trường hợp mọi
  công cụ chậm lại, kèm bảng đủ các đối thủ ([ripgrep README](https://github.com/BurntSushi/ripgrep#readme),
  truy cập 2026-09-08).
- Con số cliffs theo GitHub API ngày 2026-09-08 (probe nội dung README):
  `rg -w '[A-Z]\w+ Sherlock [A-Z]\w+'` 1.053s nhưng `rg '[A-Za-z]{30}'`
  15.569s — cùng file 13GB, khác biệt chỉ ở literal optimization.
- README cũng ghi "performance can drop precipitously across the board when
  searching big files for patterns without any opportunities for literal
  optimizations" — tự nhận sụt nghiêm trọng của chính mình ngay trong tài liệu
  bán tốc độ.

## 3. Đề xuất Wakii

- **Surface**: docs và blog của Wakii (wakii.dev + wakii-site repo public),
  áp cho mọi claim hiệu năng tương lai (startup time, search tốc độ, gate
  latency, RSS/sitemap build).
- **Hành vi kỳ vọng**: mỗi claim hiệu năng đi kèm một bảng/câu giới hạn —
  điều kiện chậm (repo lớn, pattern xấu, máy yếu) và vì sao. Review claims
  (claims discipline hiện có) kiểm thêm: claim không có case xấu kèm theo
  thì hỏi lại trước khi publish.
- **Rủi ro chính**: bảng giới hạn tốn công viết và có thể bị đọc nhầm thành
  điểm yếu sản phẩm nếu thiếu ngữ cảnh cơ chế; mitigated bằng cách ghi kèm
  giải thích như README ripgrep (cliffs có lý do rõ ràng, không phải bug).

## 4. Upstream links

- Repo: https://github.com/BurntSushi/ripgrep
- README (benchmark + cliffs): https://github.com/BurntSushi/ripgrep#readme
- Tree tại commit probe: https://github.com/BurntSushi/ripgrep/tree/3fce3b5bb0236da2df6d99672afb8a719642eca7
- Bài blog sẽ live tại /blog/deep-dive-burntsushi-ripgrep/ sau khi story merge.
