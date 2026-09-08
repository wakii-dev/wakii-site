# charmbracelet/crush — research digest (batch-3, matrix #18)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: charmbracelet/crush
- facet: harness
- stars @ 2026-09-08: 27953
- license (GitHub API 2026-09-08): NOASSERTION (ngoài 6 † pinned — vẫn gọi "công khai trên GitHub", KHÔNG "open-source"; README §3)
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`)

## Probe chi tiết (gh api 2026-09-08)

- pushed @ 2026-09-08: `2026-09-08T11:20:40Z` · archived: false
- HEAD sha @ 2026-09-08: `563d658bccb56019edc1136c3c262ba0a81ccc99`
- LICENSE.md đọc trực tiếp: **Functional Source License, Version 1.1, MIT Future License (FSL-1.1-MIT)**, Copyright 2025-2026 Charmbracelet, Inc. — giải thích NOASSERTION của GitHub API. Cách gọi an toàn: "mã công khai trên GitHub, điều kiện sử dụng riêng".

## README notes

- Định vị: agent coding chạy trong terminal, từ nhà Charm (tác giả bubbletea/lipgloss).
  Tagline: "Your new coding bestie, now available in your favourite terminal."
- Features chính (README @ 09-08): multi-model (OpenAI/Anthropic-compatible APIs),
  switch model mid-session giữ context, session-based, LSP-enhanced, MCP
  (http/stdio/sse), đa nền tảng (macOS/Linux/Windows/BSD/Android), "built on the
  Charm ecosystem, powering 25k+ applications" (claim của Charm).
- Config = `crushrc` — Bash + builtins chạy trên native bash interpreter
  (`internal/shell`) → config giống nhau mọi platform kể cả Windows; JSON cũ còn
  hỗ trợ nhưng deprecated. Priority: `./.crushrc` → `./crushrc` →
  `~/.config/crush/crushrc`.
- Permissions: mặc định hỏi trước từng tool call; `permissions allow/deny`;
  `--yolo` bỏ hết prompt (README tự cảnh báo "Be very, very careful with this
  feature.").
- **Desktop notifications**: chỉ gửi khi (1) tool call cần permission hoặc agent
  xong turn, VÀ (2) terminal không focus (cần terminal hỗ trợ focus reporting).
  `option notifications auto|native|osc|bell|disabled`; `auto` = native local,
  OSC qua SSH. → pattern ADOPT cho Wakii.
- Skills: hỗ trợ chuẩn **Agent Skills** (agentskills.io); quét skills tại
  `~/.config/agents/skills`, `~/.config/crush/skills`, `~/.agents/skills/`,
  **`~/.claude/skills/`**, project: `.agents/skills`, `.crush/skills`,
  `.claude/skills`, `.cursor/skills`; `user-invocable: true` → lên commands
  palette (prefix `user:`/`project:`); `disable-model-invocation: true` → chỉ
  user gọi được. → liên quan WATCH list skills import/export của Wakii (issue #6).
- Context files: `~/.config/crush/CRUSH.md` + `~/.config/AGENTS.md`; `option
  initialize-as` đổi tên file init; `.crushignore` bổ sung cho `.gitignore`.
- Workspace sharing: `crush serve` — nhiều client cùng `--cwd` vào chung
  workspace (session list, permission queue, LSP/MCP state, history); tín hiệu
  `IsBusy` (agent turn đang chạy) + `AttachedClients` (số client đang xem);
  flags `--yolo`/`--debug` first-wins; workspace sống theo SSE stream cuối.

## Architecture (tree API @ 2026-09-08, HEAD `563d658`)

- `internal/ui` — **144 file non-test, package lớn nhất repo** (gấp đôi
  `internal/agent` 109 file). TUI là phần thân, không phải lớp vỏ:
  - `chat/` — renderer từng loại message/tool: bash, file, fetch, diagnostics,
    call_hierarchy, definition, references, replace_symbol, unified_diff,
    streaming_markdown, todos, question…
  - `dialog/` — taxonomy câu hỏi có cấu trúc: permissions, question_{yesno,
    single, multi, freetext, form, confirm, editor, choice_base}, sessions,
    models, filepicker, oauth_{copilot,hyper}, notifications.
  - `diffview/` — diff side-by-side; `split.go` chứa thuật toán gộp cặp dòng:
    `type splitLine struct { before *udiff.Line; after *udiff.Line }`,
    `hunkToSplit` pair delete↔insert cùng hàng, dòng Equal đứng cả hai cột.
  - `common/` — diff, markdown, scrollbar, highlight, chromastyle.
- `internal/agent` (109 file) — agent loop: coordinator.go, loop_detection.go,
  hooked_tool.go, templates/ (.tpl prompt), notify/, runid.go.
- `internal/lsp` (6 file) — `manager.go`: "Manager handles lazy initialization
  of LSP clients based on file types." Xây trên charmbracelet/x/powernap;
  retry delay 30s khi LSP unavailable; resolveServerName cho config sai tên.
- `internal/server` + `internal/client` + `internal/proto` + `internal/workspace`
  — kiến trúc client/server (crush serve).
- `internal/shell` + `internal/shellconfig` (28 file) — native bash interpreter
  cho crushrc.
- `internal/skills` + `.agents/skills/` (builtin-skills, shell-builtins) —
  builtin skills.
- `internal/db` (28 file) — SQLite session storage (go install Solaris cần tag
  `sqlite3_dotlk`).

## Releases (gh api releases?per_page=6 @ 2026-09-08)

| Tag | published_at (UTC) |
|---|---|
| nightly | 2026-09-08T01:01:35Z |
| v0.92.0 | 2026-08-31T20:53:04Z |
| v0.91.2 | 2026-08-26T17:03:03Z |
| v0.91.1 | 2026-08-25T20:18:11Z |
| v0.91.0 | 2026-08-22T20:56:04Z |
| v0.90.0 | 2026-08-19T21:01:49Z |

- Cadence: 4 bản versioned trong 12 ngày (08-19 → 08-31) + nightly hằng ngày.
  Vẫn v0.x — chưa cam kết 1.0.

## Wakii grading (so surface thật: docs agents-and-kit + superpowers-panel + claims registry)

- **ADOPT — notification focus-aware.** Crush chỉ gửi notification khi terminal
  KHÔNG focus. Wakii đã ship notification routing gate-open/gate-closed đủ
  routing fields + tap-to-navigate (feature-notification-keyboard, SHIPPED) —
  bổ sung điều kiện focus-state phía desktop: cửa sổ đang focus thì im (panel tự
  cập nhật), chỉ ping khi user rời đi. Mobile giữ nguyên (không có khái niệm
  focus tương đương). Rủi ro: focus reporting phụ thuộc OS → fallback "gửi luôn".
  → adopt-draft đã ghi `docs/superpowers/editorial/research/adopt-drafts/adopt-draft-charmbracelet-crush.md`.
- **DIRECTION — presence signals.** IsBusy + AttachedClients giải bài toán nhiều
  người nhìn cùng session. Story view Wakii đã có SF progress (ALLOWED mobile
  claims) nhưng chưa có "agent đang chạy turn" / "N client đang xem".
- **DIRECTION — gate multi-select.** Crush có question_multi + question_form;
  gate Wakii hiện choice + free-text + confirm (ALLOWED). Gate duyệt-nhiều-mục
  một lượt là mở rộng tự nhiên, không đổi mô hình supervised.
- **WATCH — skill đọc chéo.** Crush đọc `~/.claude/skills/` + `.cursor/skills`
  + chuẩn agentskills.io — cùng hướng với issue #6 skills import/export (chờ
  manifest). Điều kiện đổi grade: quyết định manifest skills của Wakii.

## Bài viết

- slug `deep-dive-charmbracelet-crush` · pubDate 2026-10-09 · cat tech · tags
  terminal/cli/design · hero NO · VI+EN.
- Angle độc quyền batch-3 (đối chiếu 5 bài harness SF-3 đã có): **interaction
  design TUI** — diff hai cột trong terminal, question dialogs có cấu trúc,
  workspace nhiều client + presence, LSP/skills đọc chéo. Không đụng angle
  aider (repo map, edit formats), goose (recipes, scheduler, config), openhands
  (sandbox runtime), headroom (compression), codebase-memory (typed graph).
- Cross-link: `feature-terminal-splits` + `feature-notification-keyboard`
  (cả hai tồn tại 2 locale, đã ls xác nhận).
