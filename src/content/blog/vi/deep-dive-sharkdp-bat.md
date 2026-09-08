---
title: "bat: cat với syntax highlight và git"
description: "Bóc cơ chế bat — highlight bằng syntect, marker git tính trong tiến trình qua gitoxide, pipe về plain text cho agent đọc — và bài học output thích ứng theo người tiêu dùng."
pubDate: "2026-10-20"
category: "tech"
tags: ["terminal", "cli", "features"]
draft: false
---

Một transcript dài hàng nghìn dòng code trần trụi không có màu, không đánh số, không biết dòng nào vừa sửa — người đọc mỏi mắt, agent parse mỏi token. bat của David Peter giải đúng bài đó: 60.388 sao, 1.643 fork, license Apache-2.0 (theo GitHub API ngày 2026-09-08), README tự giới thiệu gọn lỏn — "A cat(1) clone with syntax highlighting and Git integration" ([sharkdp/bat](https://github.com/sharkdp/bat), GitHub API ngày 2026-09-08). Nhưng điều đáng học không phải là "in file đẹp lên"; mà là cách repo này quyết định output cho TỪNG loại người tiêu dùng: người đọc ở terminal nhận màu và pager, còn process khác cắm ống vào thì nhận plain text.

## TL;DR

- bat trang bị ba lớp cho output: syntax highlight (syntect), marker git ở cột trái (dòng nào added/modified), và paging tự động.
- Marker git không phải bằng cách gọi lệnh `git` — bat tính diff trong tiến trình qua gitoxide, feature-gated bằng `#![cfg(feature = "git")]`.
- Database syntax được serialize từ lúc build (bincode) — bat không parse cú pháp định nghĩa lúc khởi động.
- Pipe vào process khác: bat tự bỏ màu và pager, về đúng hành vi cat — hợp ngữ với agent.
- Wakii áp được ngay: CLI của kit phân biệt chế độ cho người và chế độ cho agent.

## Ba lớp của một output đáng đọc

Trên terminal tương tác, bat chồng ba lớp lên nội dung file. Lớp một: tô cú pháp cho hàng trăm ngôn ngữ và markup. Lớp hai: marker git — README mô tả "bat communicates with git to show modifications with respect to the index" ([bat README](https://github.com/sharkdp/bat#readme), truy cập 2026-09-08) — mỗi dòng hiện trạng thái so với index ở cột bên trái. Lớp ba: paging — "By default, bat pipes its own output to a pager (e.g. less) if the output is too large for one screen" (nguồn trên).

```
bat src/main.rs  (terminal tương tác)
┌──────────────────────────────
│ ~ fn main() {                 ← không đổi
│ +     let cfg = load();       ← Added    (mới so với index)
│ -     let old = load();       ← Removed
│ M     cfg.apply(old)          ← Modified
│ ~ }
└──────────────  1/180 ▸ less ── (paging khi quá một màn)
```

Ba lớp đó cùng phục vụ một mục tiêu: giảm thời gian hiểu một transcript. Màu chỉ ra cấu trúc, marker git chỉ ra lịch sử, pager giữ nhịp đọc — và cả ba đều có cờ tắt riêng cho ai muốn đọc thô.

## Marker git tính trong tiến trình, không phải subprocess

Cách cài đặt lớp marker git là phần kiến trúc đáng chú ý nhất. File `src/diff.rs` mở đầu bằng một attribute: `#![cfg(feature = "git")]` — toàn bộ tính năng là tuỳ chọn lúc build. Bên trong, không có dòng nào gọi subprocess `git`; thay vào đó là thư viện gitoxide viết thuần Rust:

```rust
pub fn get_git_diff(filename: &Path) -> Option<LineChanges> {
    let filepath_absolute = filename.canonicalize().ok()?;
    let repository = gix::discover(filepath_absolute.parent().ok()?).ok()?;
```

(nguồn: [src/diff.rs @ commit 7323a75](https://github.com/sharkdp/bat/blob/7323a7514f7601737640e7172be115127d6db08c/src/diff.rs), probe 2026-09-08)

`gix::discover` tìm repo từ thư mục file, index được nạp từ HEAD, hunks diff được đổi thành `LineChanges` — một `HashMap` từ số dòng sang enum `LineChange` với đúng bốn trạng thái: `Added`, `RemovedAbove`, `RemovedBelow`, `Modified`. Đơn giản hoá trạng thái còn lại là quyết định thiết kế: sidebar chỉ cần phân biệt được "dòng này mới/thiếu/sửa", không cần tái hiện toàn bộ ngữ nghĩa diff của git.

## Syntax set serialize từ lúc build

Lớp highlight dùng syntect — thư viện tô cú pháp của Rust. Vấn đề của syntect là database định nghĩa cú pháp nặng: parse toàn bộ lúc khởi động sẽ đốt hàng trăm millisecond trước khi in được dòng đầu. bat giải từ phía build: struct `HighlightingAssets` trong `src/assets.rs` giữ `SerializedSyntaxSet` — database được deserialize từ asset đã serialize sẵn bằng bincode, không parse YAML/plist lúc chạy ([src/assets.rs @ commit 7323a75](https://github.com/sharkdp/bat/blob/7323a7514f7601737640e7172be115127d6db08c/src/assets.rs), probe 2026-09-08). Cargo.toml còn khai hai feature chọn regex engine cho syntect — `regex-onig` (oniguruma) hoặc `regex-fancy` (thuần Rust) — khả năng đổi engine không đụng code gọi.

Chi tiết nhỏ nhưng có cùng tinh thần: Cargo.toml của bat nạp `globset` — đúng crate xử lý glob của hệ sinh thái ripgrep — cùng `content_inspector` phát hiện file binary và `clircle` chặn vòng lặp IO kiểu `bat file > file`. Từng rìa của bài toán in-file đã có thư viện chuyên trách; bat chỉ giữ phần quyết định thiết kế cho mình.

## Pipe là hợp ngữ với agent

Lớp đáng học nhất nằm ở cách bat chọn output theo ai đang đọc. README viết rõ: khi bat phát hiện non-interactive terminal — có ai đó cắm ống vào process khác hoặc ghi ra file — "bat will act as a drop-in replacement for cat and fall back to printing the plain file contents" ([bat README](https://github.com/sharkdp/bat#readme), truy cập 2026-09-08), bất kể cấu hình pager.

```
bat README.md                     → pager + màu + marker   (cho người)
bat README.md | grep "version"    → plain text, không màu  (cho process)
bat README.md > out.txt           → plain text             (cho file)
```

Đó chính là hợp đồng mà một agent cần: khi output đi vào ống — cho grep, cho script, cho một agent khác đọc — nó nhận văn bản sạch, đoán trước được. Khi output lên màn hình cho người, nó nhận phiên bản có trang trí. Một công cụ, hai hợp đồng, không cần flag nào cả. Watchdog của Wakii đọc terminal output của agent như một trong ba lớp kiểm — quy trình nằm trong [docs story-workflow](/vi/docs/story-workflow/) — và chất lượng transcript đó phụ thuộc đúng vào kiểu hợp đồng này; trải nghiệm editor chạy nơi worktree sống đã mổ xẻ trong bài [code-server: VS Code trên server](/vi/blog/deep-dive-coder-code-server/).

## Wakii học được gì

- **ADOPT** — output thích ứng theo người tiêu dùng: bat cho người đọc bản có màu, có pager; cho pipe bản plain đoán trước được. Đề xuất cụ thể: các story-* CLI trong kit Wakii chuẩn hoá hai chế độ — bảng/định dạng đẹp khi chạy tương tác, plain text hoặc `--json` khi output bị pipe — để agent parse ổn định mà không cần người gõ flag.
- **DIRECTION** — git state in-process: bat bỏ subprocess, đọc index và tính diff qua gitoxide ngay trong tiến trình. Wakii desktop đọc git state của worktree thường xuyên; hướng tương tự là đọc qua thư viện thay vì parse output lệnh `git` — cần quyết kiến trúc nên chưa phải việc ngay.
- **WATCH** — chi phí khởi động trả trước từ build: syntax set serialize từ lúc build, engine regex chọn được theo feature. Theo dõi cho app và CLI của Wakii khi tài nguyên tĩnh (catalog skill, agent definition) phình tới mức phải trả cùng loại chi phí.

Wakii là agentic IDE với một đội agent có sẵn — nếu bạn muốn thấy bộ công cụ đi kèm đội đó, [docs agents-and-kit](/vi/docs/agents-and-kit/) liệt kê đầy đủ.
