---
title: "Zed: editor hiệu năng cao viết bằng Rust"
description: "Zed biến hiệu năng thành quyết định kiến trúc: UI framework GPU tự viết, cấu trúc dữ liệu buffer tự thiết kế, collaborative editing nằm trong lõi. Bài này đọc repo để thấy mỗi tầng được chọn vì tốc độ."
pubDate: "2026-10-05"
category: "tech"
tags: ["architecture", "license", "agents"]
draft: false
heroImage: "/blog/heroes/deep-dive-zed-industries-zed.png"
---

Phần lớn editor chậm dần theo năm dùng vì hiệu năng được xếp sau tính năng: renderer dùng cái có sẵn, cấu trúc dữ liệu mượn từ thư viện, collaboration gắn vào sau như một lớp bọc. Zed đi ngược chiều đó. Repo công khai trên GitHub này — 89.941★, 10.501 forks theo GitHub API ngày 2026-09-08 — được dựng lên từ một quyết định đầu tiên: hiệu năng là ràng buộc kiến trúc, không phải bước tối ưu về sau. Đội từng tạo ra Atom và Tree-sitter chọn Rust làm nền, tự viết UI framework, tự thiết kế cấu trúc dữ liệu của buffer, và đặt collaborative editing ngay trong lõi. Bài này đi qua từng tầng đó bằng chính code trong repo.

TL;DR:

- Zed chạy trên GPUI — UI framework tăng tốc GPU tự viết, thay vì WebView hay Electron; framework này còn pre-1.0 và chính nó cũng là một dự án đang phát triển công khai.
- Buffer nằm trên cấu trúc dữ liệu tự thiết kế: sum_tree dùng hệ số nhánh cố định và song song hoá duyệt cây bằng rayon.
- Mỗi thao tác sửa buffer mang timestamp Lamport và version vector — hạ tầng đồng bộ kiểu CRDT nằm trong lõi text crate, không phải plugin ngoài.
- Nhịp phát hành dày hiếm thấy: 6 bản stable trong 17 ngày (19/08 → 04/09), xen kẽ các bản -pre, theo GitHub API ngày 2026-09-08.
- License trộn nhiều lớp: GPL-3.0-or-later là chính, Apache-2.0 ở các crate được đánh dấu riêng — GitHub API trả về NOASSERTION.

## GPUI: tự viết UI framework để mua lại số millisecond

Quyết định táo bạo nhất của Zed không nằm ở chọn Rust, mà ở chỗ từ chối cả những framework UI hiện có. Thay vào đó, đội viết GPUI — README của crate này tự giới thiệu: "GPUI is a hybrid immediate and retained mode, GPU accelerated, UI framework for Rust" ([crates/gpui/README.md](https://github.com/zed-industries/zed/blob/e2534d2/crates/gpui/README.md), clone ngày 2026-09-08). Trên macOS nó render bằng Metal; trên Linux nó cắm thẳng vào wayland hoặc x11. Toàn bộ chữ, glyph, layout đều đi qua GPU thay vì qua một compositor trung gian.

Cái giá cũng được nói thẳng: GPUI còn pre-1.0, API vỡ liên tục giữa các phiên bản. Với một sản phẩm thì đó là rủi ro; với một đội coi hiệu năng là ràng buộc thì đó là chi phí chấp nhận được — họ mua tốc độ bằng cách tự giữ phần khó nhất. Quy mô của canh bạc này dễ thấy qua cấu trúc repo: 244 crate trong thư mục `crates/`, 1.873 file Rust (clone ngày 2026-09-08).

## sum_tree: cấu trúc dữ liệu buffer không mượn của ai

Editor cần trả lời liên tục những câu kiểu "tổng chiều dài các dòng này là bao nhiêu", "đoạn văn bản nào nằm trong viewport" — và phải trả lời nhanh trên buffer hàng trăm nghìn dòng. Zed giải bằng một crate riêng tên `sum_tree`: một dạng B-tree tổng hợp, mỗi node giữ giá trị tổng hợp của subtree bên dưới, nên truy vấn tổng không phải đi hết lá.

Điểm đáng học nằm ở cách tối ưu vi mô. Trong [sum_tree.rs](https://github.com/zed-industries/zed/blob/e2534d2/crates/sum_tree/src/sum_tree.rs), node con được chứa trong mảng kích thước cố định của `heapless` (`ArrayVec`) thay vì `Vec` cấp phát động — xoá bỏ một lớp allocator khỏi đường nóng. Hệ số nhánh cố định là 6 (`TREE_BASE`), và việc duyệt cây được song song hoá bằng rayon (`ParallelIterator` nằm ngay trong phần dùng chung của crate). Từng chi tiết nhỏ, cộng lại thành độ trễ phím mà người dùng cảm nhận được.

## Collaboration nằm trong enum Operation của lõi

Nhiều editor thêm tính năng collaborative bằng một service bọc bên ngoài. Zed làm ngược lại: hạ tầng đồng bộ nằm ngay trong `text` crate — crate cấp thấp nhất của buffer. Mỗi thao tác sửa là một `Operation`, và chữ ký của nó phơi bày toàn bộ mô hình:

```rust
pub struct EditOperation {
    pub timestamp: clock::Lamport,
    pub version: clock::Global,
    pub ranges: Vec<Range<FullOffset>>,
    pub new_text: Vec<Arc<str>>,
}
```

([crates/text/src/text.rs](https://github.com/zed-industries/zed/blob/e2534d2/crates/text/src/text.rs), clone ngày 2026-09-08)

`Lamport` là đồng hồ Lamport kèm `replica_id` — mỗi máy tham gia collaboration có định danh riêng ([crates/clock/src/clock.rs](https://github.com/zed-industries/zed/blob/e2534d2/crates/clock/src/clock.rs)). `Global` là version vector. Nói cách khác, buffer sinh ra đã biết cách hoà hai luồng gõ đồng thời mà không cần server phân xử từng byte: đây là mô hình CRDT dạng operation, đặt ở tầng thấp nhất thay vì tầng ứng dụng. Khi hai người cùng mở một file qua Zed, cái đang chạy không phải tính năng gọi ra, mà là thuộc tính sẵn có của dữ liệu.

## Nhịp phát hành: pre và stable cách nhau vài ngày

Hiệu năng được giữ bằng kỷ luật phát hành, không chỉ bằng code. Theo GitHub API ngày 2026-09-08, chuỗi bản stable của Zed chạy như sau:

| Tag | Ngày phát hành |
|---|---|
| v1.16.1 | 2026-08-19 |
| v1.16.2 | 2026-08-24 |
| v1.16.3 | 2026-08-26 |
| v1.17.2 | 2026-08-26 |
| v1.18.0 | 2026-09-02 |
| v1.18.1 | 2026-09-04 |

Sáu bản stable trong 17 ngày, trung bình một bản mỗi chưa đầy ba ngày. Xen kẽ là các bản `-pre` đi trước vài giờ đến vài ngày (v1.17.2-pre ra 25/08, v1.17.2 stable ra 26/08; v1.18.0-pre ra 26/08, v1.18.0 ra 02/09). Kênh pre ngắn và dày như vậy có một tác dụng ít được nói tới: nó biến mỗi bản stable gần như không có bất ngờ — rủi ro đã bị bóc trước đó qua pre.

## Một repo, hai giấy phép

Điểm khiến GitHub API trả `license: NOASSERTION` cho repo này đơn giản là vì nó không mang một giấy phép duy nhất. Ở gốc repo có hai file: `LICENSE-GPL` (GNU GPLv3) và `LICENSE-APACHE` (Apache-2.0). README tóm tắt: "Zed source code is licensed primarily under GPL-3.0-or-later, with Apache-2.0 components where marked" ([README.md](https://github.com/zed-industries/zed/blob/e2534d2/README.md), ngày 2026-09-08).

Đọc sâu xuống từng crate thấy sự phân chia có chủ đích: `gpui` và `sum_tree` — hai tầng nền, tái sử dụng được — mang Apache-2.0 trong Cargo.toml; còn `text`, `collab` và crate `zed` chính mang GPL-3.0-or-later. Đây là cách một repo công khai trên GitHub vừa mở hạ tầng cho hệ sinh thái, vừa giữ phần sản phẩm dưới copyleft. Bài này mô tả đúng những gì thấy trong repo, không tổng quát hoá thêm.

Zed đưa agent vào editor qua các crate riêng (`acp_thread`, `acp_tools` nằm ngay trong `crates/`) — hướng "editor là nơi điều phối agent". Wakii đi từ chiều ngược lại: đội agent có tổ chức đi kèm sẵn trong kit; bạn đọc cách đội đó được phân vai trong [agents-and-kit](/vi/docs/agents-and-kit/). Ghế của Zed trong bản đồ 50 repo quanh agentic coding nằm ở [bài landscape](/vi/blog/agentic-landscape-50-projects/).

## Wakii học được gì

- **ADOPT** — kênh `-pre` trước bản stable. Bằng chứng là bảng release ở trên: pre đi trước stable vài giờ đến vài ngày. Wakii hiện phát hành desktop bản stable và Android bản pre-release riêng lẻ; đề xuất: xuất thêm bản `-pre` của desktop trước mỗi đợt thay đổi UI lớn, để regression bị người dùng sớm bắt thay vì bị gate sau cùng bắt.
- **DIRECTION** — biến policy thành gate CI. README của Zed yêu cầu thông tin license của dependency phải đủ, nếu không CI fail. Wakii đã làm đúng kiểu này cho nội dung blog (lint machine-enforce claims); hướng tiếp theo là đem gate cùng kiểu sang các bề mặt mới của kit khi số skill và CLI tăng.
- **WATCH** — ACP. Zed đóng gói giao tiếp editor↔agent thành protocol và nhét nó vào lõi repo. Theo quyết định của epic, Wakii đi MCP trước; ACP được theo dõi — điều kiện nâng cấp là khi MCP server story-workflow lên và xuất hiện nhu cầu cắm agent bên ngoài vào panel.
- **N/A** — GPUI và buffer CRDT. Wakii không xây engine render (chạy trên nền Electron), và các agent Wakii tránh xung đột bằng worktree riêng từng tác vụ thay vì hoà tanh thời gian thực trên một buffer — hai bài toán khác nhau, hai giải pháp khác nhau.

Bạn muốn thấy một đội agent có tổ chức chạy ngay trong editor của mình? Tải Wakii và bắt đầu từ [getting started](/vi/docs/getting-started/) — đội đó được cài sẵn, bạn chỉ cần quyết.
