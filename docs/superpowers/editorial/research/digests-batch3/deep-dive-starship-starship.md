# starship/starship — research digest (batch-3, matrix #40)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: starship/starship
- facet: terminal
- stars @ 2026-09-08: 59815
- license (GitHub API 2026-09-08): ISC
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## README notes (probe 2026-09-08)

- Tagline (README): "The minimal, blazing-fast, and infinitely customizable prompt for any shell!" (11 từ — quote-safe).
- Feature list (README bullets): Fast · Customizable ("configure every aspect of your prompt") · Universal ("works on any shell, on any operating system") · Intelligent ("shows relevant information at a glance") · Feature rich · Easy.
- Prerequisites: một Nerd Font cài trong terminal (README, ví dụ FiraCode Nerd Font).
- Cài: một binary (cargo/homebrew/…), setup = gọi `init` script trong rc của shell.
- Metadata gh api 2026-09-08: 59.816★ · 2.654 forks · ISC · Rust · pushed 2026-09-07 · không archived.

## Architecture (đọc code @ HEAD `864500b26904cd3cc01fc2a19d3ad068bd1517a2`, probe 2026-09-08)

- **Cross-shell qua init scripts mỏng**: `src/init/` @ HEAD chứa 10 script — `starship.bash`, `starship.zsh`, `starship.fish`, `starship.ps1`, `starship.nu`, `starship.tcsh`, `starship.elv`, `starship.ion`, `starship.lua`, `starship.xsh` — mỗi shell một script init mỏng hook prompt, phần logic nặng nằm trong binary Rust duy nhất.
- **Module system**: `src/module.rs` @ HEAD khai `pub const ALL_MODULES: &[&str]` — hơn 100 module (aws, git_branch, git_commit, git_metrics, git_state, git_status, directory, docker_context, claude_context, claude_cost, claude_model…); default ordering trong `configs/starship_root.rs`; mỗi module một file trong `src/modules/` trả `Option<Module>` — không áp dụng thì module tự biến mất khỏi prompt.
- **Config TOML + fallback an toàn**: `src/config.rs` @ HEAD — trait `ModuleConfig` parse TOML qua serde; `load()` bắt lỗi → `log::warn!("Failed to load config value: {e}")` → `Self::default()` — config hỏng KHÔNG làm sập prompt, degrade về mặc định.
- **git_status in-process qua gitoxide**: `src/modules/git_status.rs` @ HEAD import `gix::status` + dùng rayon (`num_rayon_threads`); doc comment liệt kê bảng symbol trạng thái: `=` merge conflict, `⇡` ahead, `⇣` behind, `⇕` diverged, `?` untracked, `$` stash, `!` modified, `+` staged, `»` renamed, `✘` deleted; `ALL_STATUS_FORMAT = "$conflicted$stashed$deleted$renamed$modified$typechanged$staged$untracked"`.
- **Module agent-context**: `src/modules/claude_context.rs` @ HEAD đọc `context.claude_code_data` — context window size + used percentage, chọn style theo ngưỡng `display` (threshold) như indicator pin; kèm `claude_cost`, `claude_model`.

## Releases (gh api releases?per_page=5, probe 2026-09-08)

- v1.26.0 — 2026-06-28 · v1.25.1 — 2026-04-30 · v1.25.0 — 2026-04-18 · v1.24.2 — 2025-12-30 · v1.24.1 — 2025-11-16
- Cadence: ~2-3 tháng một minor, patch giữa chừng khi cần. Repo pushed 2026-09-07.

## Wakii grading (style-guide §8)

- **ADOPT — config lỗi degrade, không crash**: `ModuleConfig::load` bắt lỗi TOML → warn → về default; prompt luôn render. Pattern áp ngay cho mọi chỗ load config của kit/app Wakii: config hỏng (user TOML/JSON sai) phải warn + default, không bao giờ chặn workflow.
- **DIRECTION — trạng thái agent lên bề mặt ambient**: module claude_context đưa context window % của Claude Code lên prompt theo ngưỡng màu. Wakii đã có story view tập trung; hướng tự nhiên là tín hiệu nhẹ về trạng thái agent ở các bề mặt phụ (terminal title, notification) — cần thiết kế, chưa làm ngay.
- **WATCH — một binary + init mỏng cho N host**: logic nặng một chỗ, mỗi shell/host chỉ một script init mỏng. Theo dõi cho CLI kit Wakii nếu phải chạy trên nhiều môi trường (macOS/Linux/SSH host) — pattern giữ delta tích hợp rẻ.
