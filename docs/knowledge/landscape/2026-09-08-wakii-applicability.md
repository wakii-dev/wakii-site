# Wakii applicability review — 2026-09-08 (từ digest vòng 1)

> "Cái mới này áp được vào Wakii không?" — đánh giá từng pattern so với bề mặt
> Wakii HIỆN TẠI (Superpowers panel 2 tabs · 9-agent kit tự cài · 24 story-* CLIs ·
> gates B0-B5 · watchdog · worktree-SF · 1 PR/story · mobile companion). Mức: **ADOPT**
> (làm được sớm) / **DIRECTION** (đang đi đúng hướng, pushing) / **WATCH** (để mắt) /
> **N/A** (không hợp). Quyết định product thuộc user — đây là đề xuất có dẫn chứng.

| # | Pattern (nguồn) | Đề xuất cho Wakii | Mức | Landed ở đâu |
|---|---|---|---|---|
| 1 | **Core mỏng, capability là plugin** — DSH trên Cordis, docs tách plugin riêng (agent-lifecycle/api-gateway/github-review/mcp-memory), có paper học thuật | Kit Wakii đã đi đúng hướng này (agents self-contained + input contract + verdict format; hướng "agents tách skills riêng, workflow giữ orchestration contracts"). Bước cụ thể tiếp: **plugin manifest chuẩn** cho từng skill/agent (version + contract + verdict schema) trong story-team-kit → version/reuse/audit độc lập | **DIRECTION** | product repo (kit) |
| 2 | **Cross-harness install** — DSH ship cùng lúc `AGENTS.md` + `CLAUDE.md` + `.agents/{notes,skills}` (chạy được nhiều harness) | Kit Wakii đã install vào `~/.claude/` (claude-shape). Mở rộng: **harness-detect** lúc cài (claude/cursor/…cùng dạng) — tăng surface không tốn logic mới | WATCH | product repo (installer) |
| 3 | **Nightly channel** — crush có nightly + stable tách bạch | Wakii release cadence nhanh (v1.4.197→199/1 ngày) nhưng chỉ có stable. **Nightly cho power users** = CI có sẵn, rẻ; giảm áp lực "release nhanh" khỏi stable channel | **ADOPT candidate** | product repo (CI/release) |
| 4 | **Agent Client Protocol (ACP)** — grok-build embed vào editors qua ACP (protocol chuẩn Zed khởi xướng) | Wakii TỰ nhúng agents vào IDE riêng — ngược chiều ACP. Nhưng ACP mở hướng ngược: **đưa story-workflow ra ngoài** (điều khiển agent Wakii từ VS Code/Zed khác) = kênh distribution mới. Cần product decision, không gấp | WATCH (strategic) | product repo (protocol) |
| 5 | **Web UI + SSH mode** — `dsh web` mở dashboard :3080, SSH in chỉ in URL (UX cho remote) | Wakii desktop-first + đã có mobile story view. Chưa hợp làm web UI riêng. Điểm đáng mượn: **UX "in URL thay vì mở browser"** khi chạy headless/remote (story runs trên CI) | N/A (mượn 1 UX nhỏ) | — |
| 6 | **Docs co-located i18n** — DSH docs mỗi file có `.i18n.yaml` + bản zh cạnh nhau | Site Wakii dịch theo i18n map tay (landing.ts/downloads.ts). Pattern co-located đáng cân nhắc khi docs site phình — hiện tại chưa đau | N/A (ghi nhớ) | site (sau) |
| 7 | **Release cadence lớn** — claude-code 3/4 ngày | Wakii 2-in-1-day đã ngang phổ đầu. Không hành động | N/A | — |

## Kết luận ngắn

- **Không có gì "phải chép ngay"** — Wakii đã tự đi được nửa đường theo pattern plugin-first
  (đúng như DSH đang 215k★ xác nhận hướng đi).
- 1 việc đáng làm sớm nhất: **#3 Nightly channel** (rẻ, CI có sẵn, giải áp lực stable).
- 1 quyết định chiến lược để đặt lên bàn: **#4 ACP** — Wakii muốn là IDE nhúng agent, hay
  agent-platform mà editor nào cũng điều khiển được (hoặc cả hai).
- Blog angle #2 (plugin-first 215k★) giờ có thêm chất liệu: so Cordis-docs-shape vs kit Wakii.
