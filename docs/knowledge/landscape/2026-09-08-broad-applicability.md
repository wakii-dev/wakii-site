# Wakii applicability — broad scan — 2026-09-08 (vòng 2)

> So với vòng 1 (sáng nay): **MCP chưa từng được grade — giờ là entry mạnh nhất**.
> Các grade cũ (nightly ADOPT / manifest DIRECTION / ACP WATCH) không đổi, MCP bổ sung
> làm bằng chứng ecosystem cho hướng platform.

| # | Pattern (nguồn) | Đề xuất cho Wakii | Mức | Landed ở đâu |
|---|---|---|---|---|
| B1 | **MCP là lingua franca** — awesome-mcp-servers 94.6k★, Microsoft làm curriculum, registry chính thức (08-09) | Expose **story-workflow qua MCP server**: 24 story-* CLI + bracket/gates/watchdog thành tools mà BẤT KỲ MCP client nào gọi được (claude-code, zed, cursor…) — cùng hướng với ACP nhưng ecosystem lớn hơn nhiều (ACP = editors; MCP = mọi client). Thắt chặt với issue #4: MCP nên là phương án "platform play" cụ thể hơn ACP | **DIRECTION (nâng từ WATCH)** | product repo (một wrapper MCP quanh CLI — CLI đã có, rẻ hơn tưởng tượng) |
| B2 | **Codebase memory as MCP** — codebase-memory-mcp 42.6k★ | story-memory của Wakii (lessons có provenance) expose theo cùng kiểu → memory dùng chéo harness | WATCH | product repo |
| B3 | **Skills-as-content nảy nở** — ASu-skills 3.9k★ (job-hunting), unlazy 3.1k★ (anti-laziness) chỉ sau 1 tháng | Kit Wakii đã skills-shaped → **nhận skills từ bên ngoài** (import chuẩn Claude-skill) + xuất kit ra community = 2 chiều distribution. Manifest (#3) là điều kiện | **DIRECTION** | product repo (kit) |
| B4 | **Computer-use coworker** — CopilotKit/OpenBot "mỗi AI một máy" | Wakii có computer-use skill sẵn; trend xác nhận hướng. Chỉ là content angle lúc này | N/A (content) | blog |
| B5 | **Local-first inference** — ollama 180k★ / llama.cpp 127k★ | Agentic IDE chạy model local = câu hỏi privacy/product thật (provider strategy của Wakii hiện thế nào → cần fact-check repo product trước đề xuất) | WATCH (cần fact-check) | product repo |
| B6 | **Agent-team UI** — cumora chat-first vs Wakii bracket canvas | Bracket canvas (graph) vs chat (thread): canvas là differentiator, giữ | N/A (khẳng định hiện trạng) | — |

## Drift so vòng 1 (sáng 08-09)
- MCP: **mới xuất hiện ở grade DIRECTION** — ecosystem evidence (94.6k★ list + registry +
  MS curriculum) đủ mạnh để cụ thể hóa "platform play" trong issue #4: **MCP trước ACP**.
- Không grade nào bị phản bác. Nightly (#2 issue) vẫn ADOPT — và đã ship workflow
  (iteration issue-fix-loop 08-09).

## Đề xuất actionable mới → issue
- **"Expose story-workflow as MCP server"** — tạo issue trên `wakii-dev/wakii` (evidence
  inline: bảng MCP ecosystem + CLI inventory đã có). Tạo theo chỉ thị standing của owner.
