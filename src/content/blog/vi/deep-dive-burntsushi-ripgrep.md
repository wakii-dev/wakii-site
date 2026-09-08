---
title: "ripgrep: công cụ tìm nhanh của cây mã nguồn"
description: "Bóc cơ chế ripgrep — tôn trọng gitignore, traversal song song work-stealing, benchmark công bố cả vách đá — và vai trò của nó trong vòng lặp ngữ cảnh của agent."
pubDate: "2026-10-19"
category: "tech"
tags: ["terminal", "cli", "evidence"]
draft: false
---

Agent không đọc một repo bằng cách mở từng file. Nó đọc bằng tìm: tìm tên hàm, tìm thông báo lỗi, tìm pattern cấu hình — rồi chỉ mở đúng những file cần mở. Trong vòng lặp đó, công cụ tìm chính là mắt. ripgrep (rg) của Andrew Gallant là con mắt đó cho rất nhiều lập trình viên và rất nhiều agent: 68.084 sao, 2.752 fork, license Unlicense (theo GitHub API ngày 2026-09-08), mô tả chính thức của repo tóm gọn mọi thứ: "ripgrep recursively searches directories for a regex pattern while respecting your gitignore" ([BurntSushi/ripgrep](https://github.com/BurntSushi/ripgrep), GitHub API ngày 2026-09-08). Nhưng con số sao chưa nói hết điều đáng học — cách repo này cân bằng giữa hiệu năng, mặc định đúng và sự trung thực về giới hạn mới là bài học.

## TL;DR

- rg mặc định tôn trọng .gitignore, bỏ file ẩn và file binary — kết quả tìm là ngữ cảnh sạch, không phải đống thư mục build.
- Tốc độ đến từ hai lớp: traversal song song theo work-stealing (crossbeam) và engine regex của Rust với literal optimization.
- README công bố cả bảng thắng lẫn bảng vách đá hiệu năng — pattern trung thực với giới hạn của chính mình.
- Codebase chia 11 crate, mỗi crate một concern; PCRE2 là feature build tùy chọn, không nhét vào core.
- Wakii áp được ngay kỷ luật benchmark trung thực; cấu trúc crate là hướng đi khi công cụ trong kit lớn lên.

## Mặc định đúng: gitignore là ngữ cảnh, không phải rào cản

Điểm khác biệt đầu tiên của rg không nằm ở tốc độ mà ở những gì nó chọn không làm. README của repo viết: "By default, ripgrep will respect gitignore rules and automatically skip hidden files/directories and binary files" ([ripgrep README](https://github.com/BurntSushi/ripgrep#readme), truy cập 2026-09-08). Muốn nhìn toàn bộ, bạn phải chủ động tháo các lớp lọc bằng `rg -uuu` — tức là trạng thái an toàn là mặc định, còn trạng thái ồn ào là ngoại lệ phải xin phép.

Điều đó thay đổi chất lượng ngữ cảnh khi một agent tìm kiếm trong repo:

```
cây repo trên đĩa              rg nhìn thấy
├── src/                       ├── src/          ✓
├── node_modules/  gitignore   │   (bỏ qua — .gitignore)
├── dist/          gitignore   │   (bỏ qua — .gitignore)
├── .git/          ẩn          │   (bỏ qua — hidden)
├── logo.psd       binary      │   (bỏ qua — binary)
└── README.md                  └── README.md     ✓
```

Không có lớp lọc đó, một lệnh tìm "config" sẽ trả về cả artifact build của ngày hôm qua — thông tin lỗi thời trá hình bằng định dạng code. Với người đọc kết quả, .gitignore là rào cản phiền; với agent lấy ngữ cảnh, nó là bộ lọc nhiễu đã có sẵn. rg lấy đúng bộ lọc đó làm hành vi mặc định, nên lệnh tìm của agent tự động nằm trong cùng một ngữ cảnh như của lập trình viên.

## Tốc độ: work-stealing traversal và engine regex

Tốc độ của rg không đến từ một thủ thuật duy nhất. Lớp thứ nhất nằm ở chỗ ít người nhìn: cách đi cây thư mục. Trong `crates/ignore/src/walk.rs`, cơ chế WalkParallel dùng deque work-stealing của crossbeam:

```rust
use crossbeam_deque::{Stealer, Worker as Deque};
```

(nguồn: [crates/ignore/src/walk.rs @ commit 3fce3b5](https://github.com/BurntSushi/ripgrep/blob/3fce3b5bb0236da2df6d99672afb8a719642eca7/crates/ignore/src/walk.rs), probe 2026-09-08)

Mỗi thread làm việc từ deque của mình; khi cạn, nó đánh cắp việc từ đuôi deque thread khác. Cây mã nguồn không cân đều — một thư mục có thể nghìn file, một thư mục chỉ vài file — nên chia việc tĩnh theo số đếm luôn lệch tải; work-stealing tự cân theo thực tế.

Lớp thứ hai là engine regex của Rust: nhóm pattern có literal (chuỗi con tường minh) được chạy qua prefilter tìm literal trước khi engine chính vào việc — chính literal optimization này tạo ra khoảng cách lớn trong benchmark của README. Còn `pcre2` là một crate riêng: dùng backreference hay lookaround thì rg phải chuyển sang PCRE2, và FAQ của repo có hẳn mục giải thích vì sao lệnh đó chậm hơn.

## Mười một crate, một concern mỗi crate

Cấu trúc `crates/` của repo (probe GitHub API ngày 2026-09-08) chia trọn vẹn theo concern:

| crate | concern |
|---|---|
| `globset` | khớp glob của .gitignore |
| `ignore` | traversal cây + áp ignore rules |
| `searcher` | đọc và khớp từng file |
| `printer` | định dạng kết quả |
| `regex`, `pcre2` | engine khớp (mặc định / tùy chọn) |

(nguồn: [thư mục crates @ commit 3fce3b5](https://github.com/BurntSushi/ripgrep/blob/3fce3b5bb0236da2df6d99672afb8a719642eca7/crates), probe 2026-09-08 — còn `cli`, `core`, `grep`, `index`, `matcher`)

Trong `searcher`, hai lựa chọn IO được tách rõ: đọc theo buffer có hạn mức (`line_buffer` với `DEFAULT_BUFFER_CAPACITY`) hoặc mmap tùy chọn (`MmapChoice`) — tái tạo nền tảng của bộ khớp: binary detection chạy heuristic riêng, không trộn vào logic khớp ([crates/searcher/src/searcher/mod.rs @ commit 3fce3b5](https://github.com/BurntSushi/ripgrep/blob/3fce3b5bb0236da2df6d99672afb8a719642eca7/crates/searcher/src/searcher/mod.rs)). Ranh giới module rõ nghĩa mỗi phần được test và tối ưu độc lập — và những crate này được dự án khác tái dùng như thư viện, không chỉ phục vụ rg.

## Benchmark thắng và vách đá được công bố

README benchmark trên cây kernel Linux (máy i9-12900K, probe nội dung 2026-09-08) cho pattern `[A-Z]+_SUSPEND`:

| công cụ | thời gian | so với rg |
|---|---|---|
| ripgrep | 0.082s | 1.00x |
| git grep -P | 0.273s | 3.34x |
| The Silver Searcher | 0.443s | 5.43x |
| ack | 2.935s | 35.94x |

(nguồn: [ripgrep README — bảng benchmark](https://github.com/BurntSushi/ripgrep#readme), truy cập 2026-09-08)

Phần đáng học hơn nằm ngay dưới bảng thắng. README viết "Beware of performance cliffs though" ([ripgrep README](https://github.com/BurntSushi/ripgrep#readme), truy cập 2026-09-08) rồi liệt kê: pattern `[A-Za-z]{30}` không có literal để tối ưu — rg phải mất 15.569s trên file 13GB, dù vẫn nhanh nhất trong bảng; lệnh `rg the` khớp 83.499.915 dòng mất 6.948s vì thời gian bị chi phối bởi xử lý kết quả, không phải bởi thuật toán phát hiện khớp. Repo công bố luôn những trường hợp mà mọi công cụ đều chậm lại, kèm giải thích cơ chế. Trung thực về giới hạn làm các con số thắng phía trên đáng tin hơn — nếu chỉ có bảng thắng, mọi benchmark đều trông như quảng cáo.

Vòng lặp làm việc của Wakii cũng bắt đầu từ tìm kiếm: agent được giao một SF sẽ rà code thật trước khi sửa, và các script lint, audit của chính blog này đều là những lệnh tìm có phạm vi — quy trình tổng thể nằm trong [docs story-workflow](/vi/docs/story-workflow/). Cách các công cụ AI khác lấy ngữ cảnh từ repo được mổ xẻ trong bài [continue: nhúng AI assistant vào IDE](/vi/blog/deep-dive-continuedev-continue/); rg là lớp nền mà những vòng lặp đó đứng trên.

## Wakii học được gì

- **ADOPT** — kỷ luật benchmark trung thực kèm vách đá: README đặt bảng thắng cạnh bảng case xấu (15.5s trên pattern không literal, 6.9s cho 83 triệu match) kèm cơ chế. Đề xuất cụ thể: mọi claim hiệu năng trong docs và blog của Wakii kèm bảng giới hạn — khi nào chậm, vì sao — cùng format với claims discipline hiện có: không chỉ cite case đẹp.
- **DIRECTION** — tách concern mức crate: 11 crate mỗi cái một vai trò, `globset` không biết `printer` tồn tại. Khi các công cụ trong kit Wakii lớn lên, tách module theo concern cho phép test và tối ưu độc lập — chưa làm ngay vì kit hiện còn gọn.
- **WATCH** — năng lực theo feature-flag: PCRE2 là build feature riêng với đánh đổi hiệu năng được ghi rõ trong FAQ. Các năng nặng của Wakii (inference cục bộ, MCP chạy local) có thể đi theo model bật-thêm thay vì nhét core — theo dõi thêm trước khi quyết.

Wakii là agentic IDE với một đội agent có sẵn, cài xong là chạy — nếu bạn muốn thấy đội đó chia việc ra sao, [docs agents-and-kit](/vi/docs/agents-and-kit/) là điểm bắt đầu.
