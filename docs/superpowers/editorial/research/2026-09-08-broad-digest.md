# GitHub broad-scan digest — 2026-09-08 (vòng 2, ngoài agentic-coding)

> Mọi số lấy 2026-09-08 qua `gh` CLI (snapshot rule D8). Suffix `-broad` vì trùng ngày
> với digest vòng 1. Phủ 5 category ngoài phạm vi vòng 1.

## 1. Agent frameworks (Python-side đa số)
| Repo | Stars | Ghi chú |
|---|---|---|
| FoundationAgents/MetaGPT | 70,261★ | multi-agent "AI software company" — cùng ẩn dụ với Wakii story team |
| HKUDS/nanobot | 47,870★ | ultra-lightweight self-hosted personal agent framework |
| camel-ai/camel | 17,684★ | multi-agent nghiên cứu |
| QwenLM/Qwen-Agent | 17,073★ | agent trên Qwen — hàng model-China ecosystems |
| GreyDGL/PentestGPT | 15,282★ | agentic pentest — vertical agent vertical-hóa |

## 2. MCP ecosystem — lớp integration mới của cả industry
| Repo | Stars | Ghi chú |
|---|---|---|
| punkpeye/awesome-mcp-servers | **94,599★** | danh sách MCP servers — khối lượng ecosystem |
| headroomlabs-ai/headroom | 70,361★ | — |
| DeusData/codebase-memory-mcp | 42,614★ | codebase memory qua MCP |
| microsoft/mcp-for-beginners | 17,167★ | Microsoft làm curriculum — đã chính thống |
| hangwin/mcp-chrome | 12,393★ | Chrome thành MCP server |
| modelcontextprotocol/registry | 7,227★ | registry chính thức |

## 3. Editors / IDEs
- zed-industries/zed — **89,921★** (native perf, ACP origin)
- continuedev/continue — **35,830★** — description giờ là "open-source coding agent" (từ extension → agent)

## 4. Local inference (quy mô khổng lồ)
ollama **180,445★** · llama.cpp **127,450★** · vllm **91,222★** · exo **47,304★** (lấy 08-09)

## 5. Terminal tooling (TUI stack)
junegunn/fzf 82,865★ · yazi 42,040★ · ast-grep 15,797★ · lipgloss 11,800★

## 6. Hot mới (created >08-08, stars>800)
- guillaumemeyer/watermarks-remover — 21,297★ privacy-first
- CopilotKit/OpenBot — 4,442★ "AI coworkers, mỗi con một máy"
- Hisn00w/ASu-skills — 3,982★ **bộ skills AI cho job-hunting** — skills-as-content đang nảy
- yetone/cumora — 3,520★ "Where agent teams gather" — chat UI cho agent teams
- Leonxlnx/unlazy — 3,162★ **"Anti-laziness skill"** — skill điều chỉnh hành vi agent

## Post angles (broad)
1. **"MCP đã ăn lớp integration"** — awesome-mcp-servers 94.6k★; mỗi tool đều nói MCP;
   thought experiment: 24 story-* CLI của Wakii expose thành MCP server thì ai gọi được?
   (extends: og/rss anatomy series — bài "contract" tiếp theo)
2. **"Skills là package mới của AI"** — ASu-skills (job-hunting), unlazy (anti-laziness),
   DSH `.agents/skills`, kit 20 skills của Wakii — skills-as-distribution đang thành chuẩn
   (extends: skills-catalog-tour)
3. **"Agent teams cần UI gì?"** — cumora (chat cho agent teams) vs bracket canvas của
   Wakii vs MetaGPT log-first (extends: nine-agents / superpowers-panel)
4. **"Local-first agents"** — ollama 180k★: privacy story của agentic IDE khi model chạy
   tại máy (needs product fact-check trước khi viết — Wakii dùng provider nào)
