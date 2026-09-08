# ADOPT draft — punkpeye/awesome-mcp-servers (batch-3, matrix #8, SF-2/FI-385)

> Draft cho SF-6 file issue TẬP TRUNG sau review (style-guide §10; label
> `enhancement` trên wakii-dev/wakii). KHÔNG link path nội bộ — dẫn chứng
> bằng bài post public: "bài sẽ live tại /blog/deep-dive-punkpeye-awesome-mcp-servers/
> sau khi story merge" (build-in-public đã user duyệt 2026-09-07).

## Pattern

**"Legend schema — mô tả cả nghìn mục bằng một bảng chú giải đặt trước danh sách."**
Học từ [punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)
(94.614★, license MIT, theo GitHub API ngày 2026-09-08): list 3.862 mục không mô tả
từng mục bằng văn xuôi dài, mà định nghĩa một legend 4 trục (tình trạng official 🎖️ ·
ngôn ngữ 📇🐍🏎️🦀 · scope ☁️/🏠/📟 · OS 🍎🪟🐧) ở đầu README; mỗi mục tự khai 1 dòng
icon. Người đọc lọc 3.862 mục bằng mắt trong vài chục giây.

## Evidence inline

README @ `a62cced` (2026-09-08) — section `## Legend` định nghĩa 4 nhóm icon; đếm
trên các dòng mục (`grep '^- \[' README.md | grep -c <icon>`, ngày 2026-09-08):
📇 TypeScript ×2129 (55%) · 🐍 Python ×1272 (33%) · 🏎️ Go ×185 · 🦀 Rust ×115 ·
🎖️ official ×332. Nguồn: [README @ a62cced](https://github.com/punkpeye/awesome-mcp-servers/blob/a62cced/README.md).

Tầng 2 của cùng pattern: 2493/3862 mục (65%) gắn badge điểm tự động (SVG) từ
glama.ai — tín hiệu chất lượng được tính ngoài list rồi nhúng vào, không phải
self-report của từng server.

Quote nguyên văn (21 từ, attribution + link liền kề):

> "MCP is an open protocol that enables AI models to securely interact with local
> and remote resources through standardized server implementations."

(punkpeye/awesome-mcp-servers, README @ a62cced, link ở trên)

## Đề xuất Wakii

Áp vào **catalog skills public của Wakii** (trang /skills/ + docs agents-and-kit —
13 skill public tại thời điểm viết, hiện chỉ có mô tả văn bản): thêm nhãn một trục
mỗi skill — ví dụ scope `read-only / write / runs-commands` + nền tảng đích — và
một legend ngắn ở đầu trang giải thích các nhãn. Kỳ vọng hành vi: người (và agent)
lọc catalog theo scope trong vài giây thay vì đọc từng mô tả; agent chọn skill
đúng rủi ro trước khi chạy. Rủi ro chính: nhãn tự khai có thể lệch thực tế — đi
kèm DIRECTION bên dưới (tín hiệu tự động) thay vì chỉ nhãn tay.

Hướng kế tiếp (DIRECTION, cùng issue hoặc issue riêng): badge tín hiệu chất lượng
tự động cho từng skill (lần chạy verified gần nhất, nguồn verify) — điều kiện
tiên quyết: cơ chế verify trung thực đã tồn tại trước khi hiển thị, tránh biến
thành điểm trang trí.

## Upstream links

- Repo: https://github.com/punkpeye/awesome-mcp-servers
- README @ a62cced (Legend + entry schema): https://github.com/punkpeye/awesome-mcp-servers/blob/a62cced/README.md
- README @ 165f838 (mốc so tốc độ sinh mục +491/30 ngày): https://github.com/punkpeye/awesome-mcp-servers/blob/165f838a725987afe402538f9ad0439fdfce3048/README.md
- Bài deep-dive: sẽ live tại /blog/deep-dive-punkpeye-awesome-mcp-servers/ sau khi story merge
