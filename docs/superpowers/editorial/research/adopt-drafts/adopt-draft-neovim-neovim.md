# ADOPT draft — capability negotiation trước khi gọi (học từ neovim/neovim)

> Draft SF-4/FI-387 (matrix #23) — SF-6 file tập trung sau review. KHÔNG tự
> file issue. Bài post sẽ live tại `/blog/deep-dive-neovim-neovim/` sau khi
> story merge (build-in-public đã duyệt 2026-09-07).

## 1. Pattern

LSP client của Neovim không đoán server hỗ trợ gì — nó tra capability qua giao
thức, và khi một method không server nào hỗ trợ bị gọi, client trả thông báo
có tên method + log cảnh báo thay vì im lặng. Lỗi tự giới thiệu được chính nó.
Học từ **neovim/neovim** (102.219 sao, license NOASSERTION — công khai trên
GitHub, theo GitHub API ngày 2026-09-08).

## 2. Evidence inline

Thông báo lỗi của client khi method không hỗ trợ (hàm `lsp._unsupported_method`,
trích từ `runtime/lua/vim/lsp.lua`, theo GitHub API ngày 2026-09-08):

> 'vim.lsp: method %q is not supported by any server activated for this buffer'

Nguồn: [runtime/lua/vim/lsp.lua @ b3bd442](https://github.com/neovim/neovim/blob/b3bd442c5c3cb5f4392c7a15bff12cd412c23872/runtime/lua/vim/lsp.lua).
Bên cạnh đó, bảng nạp muộn `vim._defer_require('vim.lsp', …)` liệt kê 22
submodule (trong đó có `_capability`, `client`, `protocol`) — capability là
một khái niệm first-class của client, không phải quy ước ngoài (cùng file,
cùng sha, theo GitHub API ngày 2026-09-08).

## 3. Đề xuất Wakii

- **Surface**: story-team-kit — skills + 9 agents (kit hiện khai metadata dạng
  file; agents có bảng vai trò hẹp trong docs).
- **Hành vi kỳ vọng**: mỗi skill khai capability (ví dụ: cần CLI nào, cần
  quyền gì, cần platform nào) trong metadata; harness kiểm trước khi dispatch.
  Thiếu capability → lỗi có tên capability + tên skill, chặn trước khi agent
  chạy — thay vì agent gãy giữa đường với thông báo vô tên.
- **Rủi ro chính**: thêm một lớp metadata phải đồng bộ với hành vi thật của
  skill; capability khai sai tạo ảo giác an toàn — cần một audit đối chiếu
  metadata vs hành vi (cùng tinh thần lint scoped đã có cho blog content).

## 4. Upstream links

- Repo: https://github.com/neovim/neovim
- File evidence: https://github.com/neovim/neovim/blob/b3bd442c5c3cb5f4392c7a15bff12cd412c23872/runtime/lua/vim/lsp.lua
- README (mục tiêu + license mixed): https://github.com/neovim/neovim/blob/b3bd442c5c3cb5f4392c7a15bff12cd412c23872/README.md
