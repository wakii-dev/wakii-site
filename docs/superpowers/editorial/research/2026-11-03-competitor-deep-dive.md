# Competitor Deep-Dive 03/11/2026 — 4 đối thủ Team Chat Wakii

> Retrieval: gh api + web 03/11/2026 · số liệu tại thời điểm lấy

## 1. BloopAI/vibe-kanban — 28,579★ · Rust · ⚠️ SUNSETTING
- Created 06/2025 · releases v0.1.44 (04/2026) · đẩy mạnh "plan & review nhanh hơn"
- **ĐANG SHUT DOWN** (banner + blog shutdown trên README) — đối thủ trực tiếp lớn nhất SỤP
- Core: kanban issues (private/team) + workspaces cho agent execute + review focus
- Signal: (a) users cần nhà mới — cơ hội migration marketing; (b) cảnh báo monetization category

## 2. smtg-ai/claude-squad — 8,724★ · Go · terminal
- Quản N agent (Claude Code/Codex/Gemini/Aider) trong workspaces riêng, tmux/iTerm
- Background yolo mode · review trước apply · mỗi task 1 git workspace isolated
- v1.0.20 (08/2026) · nhịp chậm dần (push cuối 08/2026)

## 3. Conductor (closed, conductor.build) — 100k+ builders
- "Run a team of coding agents in the cloud" — Mac app + Cloud
- Vừa ra MULTIPLAYER: share workspace link, prompt agents cùng nhau real-time
- Cloud sandbox: Firecracker microVM, repos + deps pre-installed, spin up seconds
- First-party Claude Code/Codex/Cursor/OpenCode; BYO subscriptions/keys
- Đối thủ thương mại MẠNH NHẤT (scale + cloud + multiplayer)

## 4. sno-ai/sno-station — 1,093★ · TypeScript · Apache-2.0 · MỚI 6 TUẐN (19/09)
- "Squad" các agent LOCAL: Codex/Claude/Cursor/Hermes/OpenClaw dùng CHUNG memory,
  tự giao việc cho nhau, TỰ REVIEW code của nhau, "mỗi đêm dream để tiến bộ"
- Không daemon, chạy trên laptop · v1.7.3 (02/11 — release cách đây 1 ngày, cực nhanh)
- Triết lý GẦN WAKII NHẤT (agents-as-team + handoff + peer review) — nhưng KHÔNG có:
  captain-PM role · stage pipeline/gates · story workflow · IDE panel integration · mobile

## Wakii so với cả 4 — what only WE have
1. Captain-as-PM (role agent riêng) + verify gates 5 stage — 0/4 có stage pipeline
2. Story workflow epic→SF + viewer .wakii mindmap — 0/4
3. IDE-embedded Team Chat panel + mobile pairing (server cho upstream apps) — 0/4
4. E2E smoke event-driven gate trước publish — 0/4

## Learn/borrow (backlog ý tưởng)
- Conductor: multiplayer shared workspace (share link, prompt cùng nhau) — hướng product mạnh
- Conductor: cloud microVM sandbox thay local-only — tier WATCH cần quyết infra
- sno-station: shared memory giữa agents + failover khi limit (đã ADOPT ý tưởng failover trong applicability 03/11)
- vibe-kanban: migration marketing khi họ shutdown (users cần nhà mới)
