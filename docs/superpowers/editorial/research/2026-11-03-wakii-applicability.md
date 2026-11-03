# Wakii Applicability 2026-11-03 — Team Chat vs thị trường

> So với surface hiện tại: panel Team Chat · captain PM · 6 workers · verify gates B0-B5 · story workflow · roster per-seat · .wakii mindmap viewer · mobile pairing · e2e smoke event-driven. Retrieval: 03/11/2026.

| Đối thủ | Giống Wakii ở đâu | Khác gì | Grade |
|---|---|---|---|
| vibe-kanban (28.5k★) | Kanban quản nhiều agent song song, worktree isolation | Không có PM agent + gate pipeline + story workflow; chỉ task board | WATCH — benchmark UX kanban, học workflowstates |
| claude-squad (8.7k★) | Nhiều agent terminal song song, tmux sessions | Thuần terminal, không IDE panel, không gates | N/A — mô hình khác nền |
| Conductor | Mac app, nhiều Claude Code worktree song song | Cloud/local chỉ chạy claude, không PM agent | WATCH — UX mở nhiều worktree đẹp |
| Devin/Terragon | Cloud agent tự chạy task→PR | 1 worker, không team, không IDE panel | WATCH — pricing model tham khảo |
| CrewAI/AutoGen/LangGraph | Multi-agent roles + orchestration | Framework lib — không có UI panel cho user cuối | N/A — khác category |
| Cursor/Copilot agents | Agent trong IDE | Single-agent per task, không team hierarchy | N/A |
| sno-station | Failover giữa CLI khi limit | Không team/PM | ADOPT ý tưởng failover (cheap — ghi backlog) |

## Wakii có mà không đối thủ nào có (differentiators giữ nguyên tedge)
1. Captain là PM agent (role riêng) điều phối workers có nghề — không phải dispatcher tuỳ hứng.
2. Verify gates giữa mỗi stage (B0-B5) + e2e smoke event-driven trước publish.
3. Story workflow: epic → SF brackets → checklist → viewer .wakii mindmap.
4. Mobile pairing (server cho upstream official apps).
5. Roster per-seat (avatar/nghề) trong IDE panel.

## Landed-ở-đâu
- Panel: src/renderer (team chat UI) · roster: ~/.claude/chat/roster.json + kit captain.md · gates: story-* CLIs + release-smoke.yml (mới) · viewer: src/main/index.ts wiring + wakii-viewer.tsx.
