---
title: "Neovim: editor mở rộng bằng Lua và cộng đồng"
description: "Neovim tách khỏi Vim và biến editor thành platform: Lua API trong lõi, LSP client built-in, tương thích Vim giữ làm contract. Ba pattern trong bài lấy được về cho dự án bạn đang duy trì."
pubDate: "2026-10-12"
category: "tech"
tags: ["architecture", "cli", "terminal"]
draft: false
---

Editor nào cũng có plugin. Ít editor nào biến chính mình thành nền tảng mà người khác build lên được. Neovim — 102.219 sao theo GitHub API ngày 2026-09-08 — là một trong số đó: gần như toàn bộ chức năng của editor nằm sau một API có cấu trúc, và một LSP client nằm ngay trong lõi. Bài này đọc repo thật của neovim/neovim để trả lời ba câu hỏi: một fork giữ được cộng đồng của dự án cha bằng cách nào, một editor trở thành platform bằng cách nào, và máy kiểm tra thay con người ở điểm nào.

TL;DR:

- Neovim tách khỏi Vim nhưng để phần lớn plugin Vim vẫn chạy — tương thích là contract của fork, không phải ân huệ.
- Lõi là một API: 13 module C trong `src/nvim/api/` và 50 mục trong `runtime/lua/vim` (theo GitHub API ngày 2026-09-08).
- LSP client nằm sẵn trong lõi: 22 submodule `vim.lsp`, nạp muộn từng phần.
- GitHub API trả license NOASSERTION cho repo — bài này gọi Neovim là "công khai trên GitHub", không gắn nhãn license khác.
- Wakii mang về ba pattern: capability negotiation (ADOPT), API-first core (DIRECTION), kỷ luật fork (WATCH).

## Tách khỏi Vim: tương thích là API contract, không phải bề mặt

README của repo không mở đầu bằng tính năng, mà bằng một tuyên bố: "a project that seeks to aggressively refactor Vim" ([README của neovim/neovim](https://github.com/neovim/neovim/blob/b3bd442c5c3cb5f4392c7a15bff12cd412c23872/README.md), truy ngày 2026-09-08). Refactor quyết liệt một dự án cha vẫn còn hàng triệu người dùng là con dao hai lưỡi: đổi càng nhiều, càng nguy cơ đứt khỏi hệ sinh thái plugin của Vim. Neovim xử lý bằng một cơ chế có tên riêng — vim-patch: mỗi phần chép từ Vim về được đánh dấu token, nguồn gốc giữ nguyên.

Chính cấu trúc đó giải thích license "lạ" của repo trên GitHub: README ghi phần đóng góp kể từ commit b17d96 theo Apache 2.0, riêng phần chép từ Vim đi theo điều kiện của Vim; GitHub API vì thế trả license NOASSERTION (ngày 2026-09-08). Repo không thiếu giấy phép — nó mang hai dòng giấy phép của hai cộng đồng. Vì thế bài này gọi Neovim là "công khai trên GitHub" thay vì gắn nhãn license nào.

```
Vim (dự án cha)
 |
 +- vim-patch — chép patch Vim có kiểm soát, token đánh dấu nguồn
 +- tương thích — "Compatible with most Vim plugins" (README)
 +- tách mới — API subsystem (src/nvim/api/) + Lua runtime (runtime/lua/)
```

Bài học đầu: fork sống hay chết ở chỗ nó chọn định nghĩa lại contract nào. Neovim giữ contract hành vi (plugin Vim vẫn chạy) và thay contract kỹ thuật (cách mở rộng editor). Wakii cũng là một fork — cách giữ nhịp với upstream trong lúc tách dần được ghi lại ở bài [forking-an-IDE: giữ nhịp với upstream](/vi/blog/forking-an-ide-keeping-current-with-upstream/).

## Lua API: editor như một platform

Mở thư mục `runtime/lua/vim` trên cây mã hôm nay (theo GitHub API ngày 2026-09-08) thấy 50 mục — không phải tiện ích rải rác, mà một thư viện chuẩn của một platform:

| Nhóm | Module tiêu biểu | Vai trò |
|---|---|---|
| Ngôn ngữ và phân tích | `lsp`, `treesitter`, `diagnostic`, `snippet` | nền móng IDE |
| File và hệ thống | `filetype`, `fs`, `glob`, `uri`, `net` | làm việc ngoài buffer |
| UI và nhập liệu | `ui`, `keymap`, `tty`, `hl` | bề mặt tương tác |
| Hạ tầng extension | `pack`, `loader`, `health`, `secure` | cài plugin và tự chẩn đoán |

Dưới lớp Lua là lớp C: `src/nvim/api/` chứa 13 module — `buffer`, `window`, `tabpage`, `extmark`, `autocmd`, `command`, `options`, `events`, `ui` — mỗi module là một vùng nghiệm của editor được mở ra thành hàm (theo GitHub API ngày 2026-09-08). README liệt kê API client viết sẵn cho 17 dòng ngôn ngữ, từ Go, Python tới Rust ([README](https://github.com/neovim/neovim/blob/b3bd442c5c3cb5f4392c7a15bff12cd412c23872/README.md), theo GitHub API ngày 2026-09-08). Và chi tiết nói nhiều nhất: `pack.lua` — một plugin manager nằm ngay trong runtime. Nền tảng tự mang công cụ để mở rộng chính nó, không bắt người dùng tìm công cụ ngoài. Câu định vị của README khớp chính xác cấu trúc đó: "Enable advanced UIs without modifications to the core" ([README](https://github.com/neovim/neovim/blob/b3bd442c5c3cb5f4392c7a15bff12cd412c23872/README.md)) — UI chỉ là một client trong nhiều client.

## LSP client built-in: máy hỏi nguồn sự thật trước con người

Neovim không nhét tri thức ngôn ngữ vào lõi — nó nhét client. `vim.lsp`, module LSP trong stdlib, gồm 22 submodule: từ `client`, `completion`, `diagnostic` tới `semantic_tokens`, `inlay_hint` (đếm từ bảng nạp muộn trong [lsp.lua](https://github.com/neovim/neovim/blob/b3bd442c5c3cb5f4392c7a15bff12cd412c23872/runtime/lua/vim/lsp.lua), theo GitHub API ngày 2026-09-08). Chi tiết đáng học hơn cả con số là cách module được nạp:

```lua
local lsp = vim._defer_require('vim.lsp', {
  _capability = ..., --- @module 'vim.lsp._capability'
  buf = ...,         --- @module 'vim.lsp.buf'
  client = ...,      --- @module 'vim.lsp.client'
  completion = ...,  --- @module 'vim.lsp.completion'
  -- ... 22 submodule tổng cộng, mỗi module nạp ở lần dùng đầu
})
```

Platform lớn nhưng khởi động nhẹ: cái chưa dùng chưa trả giá. Còn khi một method không server nào hỗ trợ bị gọi — bởi người hoặc bởi agent — client không im lặng:

`'vim.lsp: method %q is not supported by any server activated for this buffer'`

Thông báo có tên method, có ngữ cảnh, kèm log cảnh báo (hàm `_unsupported_method` trong [lsp.lua](https://github.com/neovim/neovim/blob/b3bd442c5c3cb5f4392c7a15bff12cd412c23872/runtime/lua/vim/lsp.lua)). Đây là hình mẫu của "máy kiểm trước con người": client hỏi capability của server bằng giao thức, không đoán và không nhìn bằng mắt.

## Nhịp release: platform giữ cam kết bằng bản vá đều

Nền tảng chỉ đáng gọi là nền tảng khi người build trên đó tin được lịch phát hành. Sáu release gần nhất của repo (theo GitHub API ngày 2026-09-08):

| Tag | Publish (UTC) |
|---|---|
| `nightly` | 2026-09-08 |
| `v0.12.5` / `stable` | 2026-08-23 |
| `v0.12.4` | 2026-07-05 |
| `v0.12.3` | 2026-06-10 |
| `v0.12.2` | 2026-04-22 |
| `v0.12.0` | 2026-03-29 |

Ba bản vá v0.12.3 → v0.12.5 rơi trong khoảng 75 ngày, cách nhau 25-49 ngày; tag `nightly` được publish đúng ngày probe. Bản minor gần nhất `v0.12.0` (29-03) ra sau `v0.11.7` (28-03) đúng một ngày. Nhịp 4-7 tuần một bản vá cho hệ sinh thái plugin một thứ hiếm: khả năng lập kế hoạch.

Ba nguyên tắc vừa đọc — bề mặt nhỏ, nền tảng mở, máy kiểm trước người — là cách Wakii tổ chức đội 9 agent và kit skill của mình; chi tiết tại [agents-and-kit](/vi/docs/agents-and-kit/).

## Wakii học được gì

- **ADOPT** — capability negotiation trước khi gọi. `vim.lsp` tra capability của server và trả thông báo có tên method khi không hỗ trợ. Wakii áp cho kit: mỗi skill khai capability trong metadata, harness kiểm trước khi dispatch — thiếu gì báo rõ tên đó, thay vì agent chạy giữa đường mới gãy.
- **DIRECTION** — API-first core. 24 `story-*` CLI hiện là cổng programmatic của workflow Wakii (kiểm ngày 2026-09-07); Neovim đi xa hơn: UI chỉ là một client trong nhiều client. Hướng đáng cân nhắc là mở CLI thành bề mặt chính, để client mới — script, agent ngoài — không phải chạm lõi.
- **WATCH** — kỷ luật fork. Wakii là fork của Orca; Vim → Neovim cho thấy fork giữ được cộng đồng nhờ tương thích có kiểm soát (vim-patch). Theo dõi upstream sync; khi kit bắt đầu lệch API upstream, bài học vim-patch nâng cấp thành DIRECTION.
- **N/A** — nhúng terminal emulator hay ngôn ngữ script cho người dùng cuối. Wakii không phải editor; điểm mở rộng của Wakii là skills/agents dạng file — người dùng mở rộng bằng mô tả, không bằng code.

Đang dựng công cụ cho agent? Đọc lại neovim/neovim theo ba lăng kính trên là một giờ đầu tư tốt. Muốn thấy các nguyên tắc đó trong phiên bản Wakii, tải Wakii và chạy thử một story.
