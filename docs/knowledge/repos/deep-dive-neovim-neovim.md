# neovim/neovim — research digest (batch-3, matrix #23)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: neovim/neovim
- facet: editors
- stars @ 2026-09-08: 102216
- license (GitHub API 2026-09-08): NOASSERTION (ngoài 6 † pinned — vẫn gọi "công khai trên GitHub", KHÔNG "open-source"; README §3)
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`)

## Research — điền 2026-09-08 (SF-4/FI-387, task T1)

- [x] README notes — Neovim tự định vị: "a project that seeks to aggressively
  refactor Vim" với 4 mục tiêu (bảo trì đơn giản · chia việc nhiều dev · advanced
  UIs không sửa lõi · tối đa extensibility). Features: API client 17 dòng ngôn ngữ,
  terminal emulator embedded, async job control, shada, XDG, "Compatible with most
  Vim plugins". License mixed: contributions kể từ commit b17d96 theo Apache 2.0,
  trừ phần chép từ Vim (token `vim-patch`) → GitHub API trả NOASSERTION. Repo
  confirm lần 2 (sau probe SF-1 sáng cùng ngày): stars 102219 · pushed
  2026-09-08T11:20:09Z · license NOASSERTION · archived=false (gh api
  repos/neovim/neovim, 2026-09-08; SF-1 probe ghi 102216 — stars trôi trong ngày).
- [x] Architecture — HEAD master `b3bd442c5c3cb5f4392c7a15bff12cd412c23872`
  (2026-09-08): `runtime/lua/vim` = 50 mục (file + thư mục con) — stdlib gồm
  `lsp`, `treesitter`, `diagnostic`, `snippet`, `filetype`, `fs`, `net`, `pack`
  (plugin manager trong runtime), `loader`, `health`, `ui`, `keymap`, `tty`…
  `src/nvim/api/` = 13 file C: autocmd, buffer, command, deprecated, events,
  extmark, options, tabpage, ui, vim, vimscript, win_config, window.
  `runtime/lua/vim/lsp.lua` nạp muộn `vim.lsp` qua `vim._defer_require` —
  22 submodule (đếm từ bảng defer_require @ sha trên); hàm
  `lsp._unsupported_method` trả thông báo có tên method +
  `'vim.lsp: method %q is not supported by any server activated for this buffer'`
  + log.warn — capability negotiation, lỗi không im lặng.
- [x] Releases — 10 release gần nhất (gh api releases?per_page=10, 2026-09-08):
  nightly 09-08 · stable + v0.12.5 08-23 · v0.12.4 07-05 · v0.12.3 06-10 ·
  v0.12.2 04-22 · v0.12.1 04-06 · v0.12.0 03-29 · v0.11.7 03-28 · v0.11.6 01-26.
  3 bản vá v0.12.3→v0.12.5 trong ~75 ngày, cách nhau 25-49 ngày; v0.12.0 ra sau
  v0.11.7 đúng 1 ngày; nightly publish đúng ngày probe.
- [x] Wakii grading (surface thật: docs agents-and-kit — 9 agent narrow-job,
  kit 20 skill load-on-demand, 24 story-* CLI trong ~/.claude/bin, kit tự cài
  idempotent): **ADOPT** capability negotiation trước dispatch (skill khai
  capability, harness kiểm trước, lỗi nói tên — seeding adopt-draft);
  **DIRECTION** API-first core (24 story-* CLI đã là cổng programmatic, UI là
  một client trong nhiều client); **WATCH** kỷ luật fork (Wakii fork Orca —
  vim-patch = tương thích có kiểm soát, đổi thành DIRECTION khi kit lệch API
  upstream); **N/A** nhúng terminal emulator / scripting language cho end-user
  (Wakii mở rộng bằng skills/agents dạng file).

Adopt-draft: `docs/superpowers/editorial/research/adopt-drafts/adopt-draft-neovim-neovim.md`
