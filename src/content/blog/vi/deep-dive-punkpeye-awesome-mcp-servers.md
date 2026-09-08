---
title: "Awesome MCP servers: bản đồ hệ sinh thái MCP"
description: "Đọc awesome-mcp-servers — 94.614★, 3.862 mục — như bảng chỉ số sức khoẻ của hệ sinh thái MCP: phân ngành nào đông, mục mới sinh nhanh thế nào, và list tự mô tả bằng icon cùng điểm tự động ra sao."
pubDate: "2026-10-04"
category: "tech"
tags: ["agents", "workflow", "oss", "evidence"]
draft: false
---

Một giao thức mới chỉ có thật khi nó có danh bạ. Với MCP (Model Context Protocol), danh bạ đó là awesome-mcp-servers của punkpeye: 94.614★, 15.881 fork, license MIT, lần push cuối 2026-09-07 (theo GitHub API ngày 2026-09-08). Phần lớn người ta mở list này để tìm đúng một server cho nhu cầu của mình. Bài này đọc nó theo cách khác: như bảng chỉ số sức khoẻ của cả hệ sinh thái — ngành nào đang đông, mục mới sinh ra nhanh thế nào, và một danh sách hàng nghìn mục liệu còn tổ chức được bằng tay hay không.

TL;DR:

- List chứa **3.862 server** chia vào 58 category (đếm từ README @ a62cced, ngày 2026-09-08); Developer Tools đông nhất với 483 mục.
- Tốc độ sinh mục: **+491 mục trong 30 ngày** (3.371 → 3.862) — trung bình khoảng 16 server mới mỗi ngày.
- Nhịp cập nhật: **1.247 commit trong 30 ngày**; riêng 30 commit gần nhất gộp trong khoảng 90 phút.
- List tự mô tả bằng hệ icon 4 nhóm, và **65% số mục** gắn sẵn badge điểm tự động từ glama.ai.

## Cấu trúc của một danh sách 1,6 MB

Điều đầu tiên gây bất ngờ: README của repo dài 1,6 MB (đo từ clone @ a62cced, ngày 2026-09-08). Không phải tài liệu đi kèm — nó là chính cái list. Toàn bộ gồm ba lớp:

```
Đầu file:   What is MCP? · Clients · Tutorials · Community · Legend
Thân file:  ## Server Implementations
              └─ 59 heading category, 3.862 mục dạng "- [Tên](link) icon — mô tả"
Cuối file:  ## Frameworks · ## Tips and Tricks · ## Star History
```

Phạm vi của list được chốt ngay từ câu đầu — README gốc viết:

> "MCP is an open protocol that enables AI models to securely interact with local and remote resources through standardized server implementations."

(punkpeye/awesome-mcp-servers, [README @ a62cced](https://github.com/punkpeye/awesome-mcp-servers/blob/a62cced/README.md), ngày 2026-09-08)

Trong bản đồ 50 dự án tháng 9 ([agentic-landscape-50-projects](/vi/blog/agentic-landscape-50-projects/)), list này đứng đầu nhóm MCP với 94,6k★. Bài đó nhìn từ trên xuống; bài này đi xuống tầng dưới — vào từng mục của chính cái list.

## Phân ngành: 3.862 server nằm ở đâu

Mỗi mục là một dòng: tên, link, icon phân loại, mô tả một câu. Chặt README theo heading category rồi đếm từng dòng mục (ngày 2026-09-08, README @ a62cced), top 10 category là:

| Category | Số mục |
|---|---|
| Developer Tools | 483 |
| Finance & Fintech | 431 |
| Knowledge & Memory | 317 |
| Search & Data Extraction | 229 |
| Security | 215 |
| Other Tools and Integrations | 202 |
| Communication | 149 |
| Databases | 132 |
| Aggregators | 126 |
| Cloud Platforms | 121 |

Top 10 chiếm 2.405 mục — 62% của cả list — trong khi còn 48 category khác chia phần còn lại. Đọc bảng này như chỉ số: MCP không còn là chuyện "nối model với database" riêng của dân dev; Finance & Fintech đứng thứ hai cho thấy phần mềm tài chính đang tích hợp giao thức này hàng loạt. Khối giữa bảng — tri thức, truy xuất dữ liệu, bảo mật — là lớp hạ tầng ngữ cảnh dùng chung cho mọi ngành.

Còn một chi tiết lộ tuổi của quy trình: category E-Commerce xuất hiện hai lần trong mục lục, một lần 33 mục và một lần 1 mục (đếm ngày 2026-09-08). Ở scale 3.862 mục, curation thủ công bắt đầu để lại vết.

## Tốc độ sinh mục: +491 mục trong 30 ngày

Lấy hai mốc README cách nhau đúng một tháng và đếm cùng một cách:

| Mốc | Commit | Số mục | Heading category |
|---|---|---|---|
| 2026-08-08 | 165f838 | 3.371 | 58 |
| 2026-09-07 | a62cced | 3.862 | 60 |
| Δ 30 ngày | — | +491 (+14,6%) | +2 |

Khoảng 16 mục mới mỗi ngày — list tăng gần 15% dung lượng chỉ trong một tháng ([README @ 165f838](https://github.com/punkpeye/awesome-mcp-servers/blob/165f838a725987afe402538f9ad0439fdfce3048/README.md) so với README @ a62cced). Nhịp commit cùng dạng: 1.247 commit trong 30 ngày tính ngược từ 2026-09-08 (GitHub API); riêng 30 commit gần nhất đều rơi trong khoảng 21:43–23:11 UTC ngày 2026-09-07 — 88 phút cho 30 merge. Đó là dáng vẻ của quy trình tự động hoá: PR được gộp dồn theo đợt thay vì theo người trực từng cái.

Với một hệ sinh thái, tốc độ sinh mục mới của danh bạ xấp xỉ tốc độ sinh sản phẩm mới. Ở mức 16 mục/ngày, MCP đã có dòng đời riêng: server ra đời, được liệt kê, được badge chấm điểm — vòng đời bắt đầu ở một dòng trong README.

## Hệ icon: list tự mô tả trong một dòng

Legend đầu list định nghĩa bốn nhóm icon: tình trạng chính thức (🎖️), ngôn ngữ (📇 TypeScript, 🐍 Python, 🏎️ Go, 🦀 Rust, và vài ngôn ngữ khác), scope (☁️ cloud, 🏠 local, 📟 embedded), và hệ điều hành (🍎 🪟 🐧). Đếm trên các dòng mục @ a62cced, ngày 2026-09-08:

| Icon | Ý nghĩa | Số mục |
|---|---|---|
| 📇 | TypeScript/JavaScript | 2.129 (55%) |
| 🐍 | Python | 1.272 (33%) |
| 🏎️ | Go | 185 |
| 🦀 | Rust | 115 |
| 🎖️ | official | 332 |

Ngoài icon do người dùng gán, 2.493 trên 3.862 mục (65%) gắn sẵn badge điểm tự động từ glama.ai — dịch vụ ngoài quét và chấm từng server, list nhúng kết quả về dưới dạng SVG. Gộp lại: trong 30 giây, bạn rút ra được "server TypeScript, chạy local, chính thức, điểm cao" mà không cần đọc một mô tả nào. Đó không còn là danh sách link — đó là schema truy vấn bằng mắt.

Wakii cũng sống trên một lớp tích hợp tương tự: agent của Wakii làm việc qua bộ kit gồm 20 skills và đội 9 agent (tại thời điểm viết, theo docs) — việc kit tự mô tả để agent chọn đúng công cụ là cùng một bài toán với legend của list này. Tổng quan kit nằm trong [agents & kit docs](/vi/docs/agents-and-kit/).

## Wakii học được gì

- **ADOPT** — quy ước legend: list mô tả 3.862 mục bằng một bảng chú giải 4 trục đặt trước danh sách; catalog skills của Wakii (13 skill public tại thời điểm viết) hiện chỉ có mô tả văn bản. Thêm nhãn một trục — scope đọc/ghi vs chạy lệnh, ngôn ngữ hay nền tảng đích — kèm legend ở đầu trang là thay đổi nhỏ nhưng đổi cách quét catalog từ "đọc từng dòng" thành "lọc bằng mắt".
- **DIRECTION** — badge điểm tự động: 65% mục được một dịch vụ ngoài chấm sẵn rồi nhúng SVG vào list. Wakii có thể làm tương tự cho catalog skills/agents dạng tín hiệu chất lượng tự động (lần chạy verified gần nhất, nguồn verify) — chưa áp ngay vì tín hiệu phải được thiết kế trung thực trước khi hiển thị, kẻo thành điểm trang trí.
- **WATCH** — tốc độ hệ sinh thái: +16 mục/ngày nghĩa là danh mục server MCP đổi nhanh hơn mọi tài liệu tĩnh. Wakii hiện chưa mở surface kết nối MCP bên ngoài (kit đi theo release, không phải marketplace) — theo dõi tốc độ này để chọn nhóm server nào đáng hỗ trợ sẵn khi surface đó hình thành; chuyển thành DIRECTION khi client MCP xuất hiện trong lộ trình.
- **N/A** — nhịp vận hành 1.247 commit/30 ngày kiểu merge-bot của một danh mục cộng đồng không áp cho repo product Wakii: release của Wakii đi qua gates có con người, và merge vào nhánh chính là human gate (nguyên tắc "Humans own the irreversibles" trong [story workflow](/vi/docs/story-workflow/)).

Bạn đang nối agent vào hệ thống thật và muốn quy trình có gates thay vì lời đảm bảo? Wakii là agentic IDE với đội agent có sẵn — bắt đầu từ [getting started](/vi/docs/getting-started/).
