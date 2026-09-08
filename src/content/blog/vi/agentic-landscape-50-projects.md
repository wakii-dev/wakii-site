---
title: "50 project đang định hình agentic coding — bản đồ tháng 9/2026"
description: "Bản đồ 50 project mã nguồn mở quanh agentic coding: harness, framework multi-agent, MCP, editor, local inference, terminal — số sao lấy trực tiếp từ GitHub API ngày 08-09-2026."
pubDate: "2026-09-08"
category: "tech"
tags: ["landscape", "agents", "oss", "mcp", "workflow"]
draft: false
---

Một năm trước, "agentic coding" là một câu hỏi. Hôm nay nó là một ngành có bản đồ riêng.
Chúng tôi quét GitHub API ngày 08-09-2026, lọc 50 project thành 7 nhóm, và ghi lại ở đây
— kèm số sao đúng thời điểm lấy, vì con số này đổi từng tuần.

TL;DR: tầng harness đang đua nhanh nhất nhưng chưa ai bứt hẳn; MCP trở thành lớp
integration mặc định; "skill" đang thành đơn vị phân phối mới; local inference không còn
là hiện tượng biên; terminal và editor đang hoán đổi vai trò.

## Harness và coding agent (12)

Tầng cạnh tranh trực tiếp nhất. DeepSeek Harness — người mới tới tháng 8 với tuyên ngôn
"everything is a plugin" — đã 215,4k★. opencode dẫn đầu 205,8k★ chỉ sau ~16 tháng.
claude-code giữ 144,4k★ với nhịp ba release bốn ngày. Đối lập: aider gần như đóng băng
một năm ở 48,8k★.

| Project | Sao | Một dòng |
|---|---|---|
| [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) | 215,4k | "everything is a plugin" |
| [anomalyco/opencode](https://github.com/anomalyco/opencode) | 205,8k | agent terminal mã mở |
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | 144,4k | ship nhanh nhất nhóm |
| [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) | 106,9k | agent CLI của Google |
| [OpenHands/OpenHands](https://github.com/OpenHands/OpenHands) | 86,8k | agent dev tự vận hành |
| [cline/cline](https://github.com/cline/cline) | 67,7k | extension → desktop riêng |
| [aaif-goose/goose](https://github.com/aaif-goose/goose) | 54,0k | desktop agent của Block |
| [Aider-AI/aider](https://github.com/Aider-AI/aider) | 48,8k | tiên phong, đang chững |
| [charmbracelet/crush](https://github.com/charmbracelet/crush) | 28,0k | TUI + kênh nightly |
| [xai-org/grok-build](https://github.com/xai-org/grok-build) | 26,6k | nhúng editor qua ACP |
| [anywhere-labs/dsh-desktop](https://github.com/anywhere-labs/dsh-desktop) | 24,3k | desktop cho hệ DSH |
| [HKUDS/DeepCode](https://github.com/HKUDS/DeepCode) | 16,5k | harness + multi-agent |

## Framework multi-agent (9)

Tầng dưới harness. Khung gắn model (Qwen-Agent) và khung tối giản (nanobot) đang chiếm
chỗ của các khung nghiên cứu thế trước.

| Project | Sao | Một dòng |
|---|---|---|
| [langchain-ai/langchain](https://github.com/langchain-ai/langchain) | 145,9k | khung nền tảng |
| [microsoft/autogen](https://github.com/microsoft/autogen) | 60,9k | multi-agent Microsoft |
| [FoundationAgents/MetaGPT](https://github.com/FoundationAgents/MetaGPT) | 70,3k | "công ty phần mềm AI" |
| [crewAIInc/crewAI](https://github.com/crewAIInc/crewAI) | 58,2k | crew theo role |
| [HKUDS/nanobot](https://github.com/HKUDS/nanobot) | 47,9k | tối giản, self-hosted |
| [openai/openai-agents-python](https://github.com/openai/openai-agents-python) | 29,3k | SDK chính chủ OpenAI |
| [pydantic/pydantic-ai](https://github.com/pydantic/pydantic-ai) | 19,8k | type-safe |
| [camel-ai/camel](https://github.com/camel-ai/camel) | 17,7k | nghiên cứu |
| [QwenLM/Qwen-Agent](https://github.com/QwenLM/Qwen-Agent) | 17,1k | hệ Qwen |

## MCP — lớp integration mới (7)

MCP đang lặp lại vai trò HTTP từng chơi với web: danh mục server nổi nhất 94,6k★,
registry chính thức 7,2k★, Microsoft soạn giáo trình. Hai chiều đều nở: chrome thành
server, codebase thành memory.

| Project | Sao | Một dòng |
|---|---|---|
| [punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) | 94,6k | danh mục server |
| [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | 90,2k | server chính thức |
| [headroomlabs-ai/headroom](https://github.com/headroomlabs-ai/headroom) | 70,4k | hạ tầng MCP |
| [DeusData/codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) | 42,6k | codebase làm memory |
| [microsoft/mcp-for-beginners](https://github.com/microsoft/mcp-for-beginners) | 17,2k | giáo trình |
| [hangwin/mcp-chrome](https://github.com/hangwin/mcp-chrome) | 12,4k | browser thành server |
| [modelcontextprotocol/registry](https://github.com/modelcontextprotocol/registry) | 7,2k | registry |

## Editor và IDE (7)

zed một mình 89,9k★ chứng minh editor viết lại từ đầu bằng Rust có chỗ đứng. continue
đổi mo bụng thành "open-source coding agent" — đúng chuyển động của ngành: editor không
còn là nơi gõ code mà là nơi điều phối agent.

| Project | Sao | Một dòng |
|---|---|---|
| [zed-industries/zed](https://github.com/zed-industries/zed) | 89,9k | Rust, nguồn gốc ACP |
| [neovim/neovim](https://github.com/neovim/neovim) | 102,2k | nền agent plugin |
| [coder/code-server](https://github.com/coder/code-server) | 79,2k | VS Code trên server |
| [continuedev/continue](https://github.com/continuedev/continue) | 35,8k | extension → agent |
| [helix-editor/helix](https://github.com/helix-editor/helix) | 46,1k | modal, minimal |
| [lapce/lapce](https://github.com/lapce/lapce) | 38,8k | Rust |
| [TabbyML/tabby](https://github.com/TabbyML/tabby) | 33,9k | completion self-hosted |

## Local inference (5)

Con số nói trước lập luận: agentic không nhất thiết đi qua cloud, và "dữ liệu ở lại máy
tôi" là sức hút thật.

| Project | Sao | Một dòng |
|---|---|---|
| [ollama/ollama](https://github.com/ollama/ollama) | 180,4k | local model dễ nhất |
| [ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp) | 127,5k | runtime gốc |
| [vllm-project/vllm](https://github.com/vllm-project/vllm) | 91,2k | serving hiệu năng cao |
| [exo-explore/exo](https://github.com/exo-explore/exo) | 47,3k | cluster thiết bị cá nhân |
| [janhq/jan](https://github.com/janhq/jan) | 44,4k | desktop local AI |

## Terminal tooling (6)

Tầng này giải thích vì sao TUI agent dễ thắng: hạ tầng terminal đã sẵn và rất khỏe.
ast-grep — grep theo cấu trúc code — là công cụ mấy agent CLI đang dùng nội bộ.

| Project | Sao | Một dòng |
|---|---|---|
| [junegunn/fzf](https://github.com/junegunn/fzf) | 82,9k | fuzzy finder |
| [BurntSushi/ripgrep](https://github.com/BurntSushi/ripgrep) | 68,1k | grep nhanh |
| [sharkdp/bat](https://github.com/sharkdp/bat) | 60,4k | cat hiện đại |
| [starship/starship](https://github.com/starship/starship) | 59,8k | prompt đa shell |
| [sxyazi/yazi](https://github.com/sxyazi/yazi) | 42,0k | file manager TUI |
| [ast-grep/ast-grep](https://github.com/ast-grep/ast-grep) | 15,8k | grep theo AST |

## Làn sóng mới sau một tháng (5 — tạo từ sau 08-08)

Đáng chú ý nhất với ai xây agent: unlazy (3,2k★) gói "kỷ luật hoàn thành" — acceptance
ledger viết trước, gate chạy được, báo cáo theo bằng chứng — thành một skill cài một
lệnh (`npx skills add`, từ skills CLI của vercel-labs). Triết lý "gate, không tin lời
tự báo" đang được đóng hộp phân phối.

| Project | Sao | Một dòng |
|---|---|---|
| [guillaumemeyer/watermarks-remover](https://github.com/guillaumemeyer/watermarks-remover) | 21,3k | privacy-first |
| [CopilotKit/OpenBot](https://github.com/CopilotKit/OpenBot) | 4,4k | AI coworker có máy riêng |
| [Hisn00w/ASu-skills](https://github.com/Hisn00w/ASu-skills) | 4,0k | skills theo nghề |
| [yetone/cumora](https://github.com/yetone/cumora) | 3,5k | chat cho agent team |
| [Leonxlnx/unlazy](https://github.com/Leonxlnx/unlazy) | 3,2k | discipline-as-skill |

## Ba hiện tượng xuyên bản đồ

**MCP đã thắng lớp integration** — không protocol nào có danh mục 94,6k★ hay giáo trình
từ Microsoft; công cụ muốn được gọi tới đâu đang tự xuất thành MCP server.

**Skill là đơn vị đóng gói mới** — từ skill theo nghề tới skill "chống lười", một format
nhỏ, con người đọc được, đang phân phối như package. Ai có kit skill (như đội 9 agent
trong [agents & kit của Wakii](/vi/docs/agents-and-kit/)) đang đứng trên tầng lớn nhanh nhất.

**Nhịp phát hành phản ánh quy trình** — ba release bốn ngày của claude-code và một năm
đóng băng của aider là hai đầu một trục; quyết định nằm ở pipeline, không ở số commit.

## Câu hỏi bản đồ đang mở

- opencode đạt 205,8k★ sau ~16 tháng, fork 26,8k — tốc độ từ đâu, và gì giữ nó sau lúc
  hits chết xuống?
- `llms.txt` bắt đầu xuất hiện ở repo root — "repo thân thiện AI" có thành chuẩn tài liệu?
- Skills CLI hứa cài vào "mọi detected agent" — ai là npm registry của skill, kiểm định
  chất lượng nằm ở đâu?
- aider chững một năm vẫn giữ 48,8k★ — "hoàn thành" hay "mất động lực"?
- MCP chiếm lớp integration, ACP nhắm lớp editor — chuẩn nào cho tầng agent điều phối
  nhau, nơi bracket, gate và watchdog của Wakii đang sống?

Bản đồ này là ảnh chụp ngày 08-09-2026 — sẽ lệch thực tế sau vài tuần. Nhưng hình dạng
của nó — harness đua tốc độ, MCP gom integration, skill hóa đơn vị phân phối, local
inference đủ sức làm nền — có vẻ là hình dạng của ít nhất cả năm 2026.

Wakii — agentic IDE với đội 9 agent — tham gia bản đồ từ tầng editor, và tự xây bằng
đúng quy trình tầng harness đang chuẩn hóa. Tải bản tại [trang download](/vi/download/).
