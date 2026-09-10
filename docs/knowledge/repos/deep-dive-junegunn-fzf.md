# junegunn/fzf — research digest (batch-3, matrix #11)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: junegunn/fzf
- facet: terminal
- stars @ 2026-09-08: 82868 (verify lại bằng `gh api repos/junegunn/fzf` — skeleton ghi 82867, lệch 1★ cùng ngày; bài cite 82.868)
- license (GitHub API 2026-09-08): MIT
- pushed @ 2026-09-08: 2026-09-06T23:36:30Z · created 2013-10-23 · forks 2862
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh` — SF-2 verify lại bằng `gh api` trực tiếp, cùng ngày)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## README notes

- Tự định vị: "fzf is a general-purpose command-line fuzzy finder and an interactive terminal toolkit" (README @ sha `ad151d8`).
- Highlights README: Portable (single binary) · Fast ("Optimized to process millions of items in milliseconds") · Programmable ("Event-driven architecture") · Batteries-included (Bash, Zsh, Fish, Nushell, Vim, Neovim).
- Cài đặt: hơn 20 kênh (Homebrew, apt, dnf, pacman, nix, choco, winget, MSYS2…).

## Architecture (clone HEAD `ad151d8`, 2026-09-08)

- `src/*.go` tầng lõi ~21.735 dòng (wc -l); lớn nhất `terminal.go` 8.850 dòng, `options.go` 3.997 dòng; package con: `algo/`, `tui/`, `util/`, `protector/`.
- Kiến trúc 3 goroutine: reader → chunklist; matcher song song (`src/matcher.go:61` `partitions := runtime.NumCPU()`, `:175` `numWorkers := min(m.partitions, numChunks)`, chunk-pull bằng `atomic.Int32`, gom qua `resultChan`); terminal vẽ TUI. Giao tiếp qua `util.NewEventBox()` (`src/core.go:86`).
- Thuật toán: `src/algo/algo.go` — FuzzyMatchV2 = "a modified version of Smith-Waterman algorithm" (không cho phép bỏ sót ký tự pattern); FuzzyMatchV1 = đường nhanh first-occurrence; SIMD: file assembly amd64/arm64 + `SIMD.md`.
- Lớp shell: `shell/` = 10 file key-bindings + completion (bash/zsh/fish/nu) + `update.sh` — integration mỏng ngoài binary; Vim/Neovim plugin riêng.
- Test end-to-end Ruby trong `test/` (test_core.rb, test_preview.rb, test_tmux.rb…).

## Releases (gh api releases?per_page=10, ngày 2026-09-08)

- Mới nhất: v0.74.3 @ 2026-08-17. 10 bản gần nhất 2026-02-20 → 2026-08-17 = ~178 ngày ≈ 1 release/2,5 tuần.
- Chuỗi: v0.74.3 (08-17) · v0.74.2 (08-01) · v0.74.1 (07-18) · v0.74.0 (07-06) · v0.73.1 (05-25) · v0.73.0 (05-23) · v0.72.0 (04-26) · v0.71.0 (04-04) · v0.70.0 (03-02) · v0.68.0 (02-20). (Không thấy v0.69 trong list.)
- CHANGELOG trên master @ `ad151d8` đã có mục 0.74.4 (chưa release) — notes soạn trên cây source.
- Perf v0.74.3 (CHANGELOG): "ASCII queries are up to 16x faster" · non-ASCII 12x · Latin có dấu +37% đọc · CJK −29% bộ nhớ.

## Wakii grading (style-guide §8 — đã vào bài)

- ADOPT — batteries-included / tự cài / idempotent: fzf binary + 10 script shell "sống chung" 4 shell ngay sau cài ↔ Wakii kit tự cài `~/.claude/` lần chạy đầu (docs agents-and-kit).
- DIRECTION — fuzzy picker cho story-* CLI: lệnh chọn mục tiêu (story/gate/worktree) pipe qua fuzzy filter khi chạy tương tác; chưa áp ngay vì CLI phục vụ agent + gate trước.
- WATCH — server mode `--listen` (mục CHANGELOG 0.74.4 đụng status payload): điều kiện chuyển DIRECTION = Wakii có terminal surface cho bracket/gates.
- N/A — SIMD hand-tuning (assembly amd64/arm64): stack Wakii (Electron + orchestration) không có hot path tương đương.
