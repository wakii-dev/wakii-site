# Topic matrix batch 3 — 50 bài deep-dive repo (story FI-383)

> **Tài sản dùng chung của toàn story.** SF-2/3/4/5 ĐỌC file này trước khi viết bất
> kỳ bài nào. Nguồn: epic spec `docs/superpowers/specs/2026-09-08-blog-batch3-repos-design.md`
> §MATRIX 50 REPO + REQUIREMENT-GAP FI-383 (SF-4 list: 9 multi-agent + vllm/exo/jan
> + ast-grep + neovim; llama.cpp → slug `deep-dive-ggml-org-llama-cpp`; flagship
> đúng 11) — slug · category · pubDate · hero là **CHỐT CỨNG**: KHÔNG đổi slug,
> KHÔNG đổi ngày, KHÔNG đổi category, KHÔNG đổi hero. Cột `facet`, `repo`,
> `Title hướng` là định hướng viết — slug/ngày/category/hero không bao giờ đổi.
> Bảng batch 1 (20 bài, `topic-matrix.md`) + batch 2 (44 bài,
> `topic-matrix-batch2.md`) — lint + audit parse CẢ BA file, tổng 114 slug non-seed.
>
> Quy tắc ngày (D7): đúng 2 bài/ngày, liên tục **2026-10-01 → 2026-10-25**
> (25 ngày × 2 bài, nối mạch batch-2 kết thúc 09-30). pubDate trong tương lai
> là HỢP LỆ khi khớp đúng dòng matrix này (policy a).
> Category (chốt): **tech cho CẢ 50 row** — enum không mở rộng.
> Hero (D9): đúng **11 flagship** đánh dấu `yes` — render do content SF sở hữu
> thực hiện SAU khi bài tồn tại (pipeline đọc frontmatter `heroImage`, khai
> CẢ HAI locale — xem runbook §Hero wiring).
> License † (D8): đúng **6 slug** (`deep-dive-anthropics-claude-code`,
> `deep-dive-modelcontextprotocol-servers`, `deep-dive-modelcontextprotocol-registry`,
> `deep-dive-zed-industries-zed`, `deep-dive-tabbyml-tabby`, `deep-dive-janhq-jan`)
> — license none/NOASSERTION → bài PHẢI gọi "công khai trên GitHub", CẤM
> "open-source"/"mã nguồn mở" (scoped FORBIDDEN trong `claims-registry.md`,
> lint + audit cùng enforce). Mọi số third-party (stars/releases) kèm
> "theo GitHub API ngày N" — xem `claims-registry.md` §Third-party claims.
> Mỗi bài batch-3 PHẢI có section marker `## Wakii học được gì` (VI) /
> `## What Wakii learns` (EN) — level `##` exact, lint-enforced scoped theo
> matrix này (spec D4). Facet phân bổ theo rows: harness 10 · multi-agent 10 ·
> mcp 7 · editors 8 · inference 5 · terminal 6 · misc 4 = 50.
> Owner: rows **1-12 → SF-2/FI-385 · 13-22 → SF-3/FI-386 · 23-36 → SF-4/FI-387 ·
> 37-50 → SF-5/FI-388**.

## SF-2 PILOT — rows 1-12

| # | slug | cat | pubDate | facet | hero | repo | Title hướng (VI) |
|---|------|-----|---------|-------|------|------|------------------|
| 1 | `deep-dive-deepseek-ai-deepseek-harness` | tech | 2026-10-01 | harness | yes | deepseek-ai/deepseek-harness | DeepSeek harness: kiến trúc agent bên trong mô hình mở |
| 2 | `deep-dive-anomalyco-opencode` | tech | 2026-10-01 | harness | yes | anomalyco/opencode | OpenCode: agent coding terminal độc lập |
| 3 | `deep-dive-ollama-ollama` | tech | 2026-10-02 | inference | yes | ollama/ollama | Ollama: chạy LLM local trong một lệnh |
| 4 | `deep-dive-langchain-ai-langchain` | tech | 2026-10-02 | multi-agent | yes | langchain-ai/langchain | LangChain: từ thư viện chains tới hệ sinh thái agent |
| 5 | `deep-dive-anthropics-claude-code` | tech | 2026-10-03 | harness | yes | anthropics/claude-code | Claude Code: agent coding của Anthropic nhìn từ ngoài (†) |
| 6 | `deep-dive-ggml-org-llama-cpp` | tech | 2026-10-03 | inference | yes | ggml-org/llama.cpp | llama.cpp: inference LLM tối ưu từ CPU tới edge |
| 7 | `deep-dive-google-gemini-gemini-cli` | tech | 2026-10-04 | harness | yes | google-gemini/gemini-cli | Gemini CLI: agent terminal của Google |
| 8 | `deep-dive-punkpeye-awesome-mcp-servers` | tech | 2026-10-04 | mcp | no | punkpeye/awesome-mcp-servers | Awesome MCP servers: bản đồ hệ sinh thái MCP |
| 9 | `deep-dive-modelcontextprotocol-servers` | tech | 2026-10-05 | mcp | yes | modelcontextprotocol/servers | MCP servers chính thức: tham chiếu chuẩn của giao thức (†) |
| 10 | `deep-dive-zed-industries-zed` | tech | 2026-10-05 | editors | yes | zed-industries/zed | Zed: editor hiệu năng cao viết bằng Rust (†) |
| 11 | `deep-dive-junegunn-fzf` | tech | 2026-10-06 | terminal | yes | junegunn/fzf | fzf: fuzzy finder định hình dòng lệnh hiện đại |
| 12 | `deep-dive-cline-cline` | tech | 2026-10-06 | harness | yes | cline/cline | Cline: agent coding sống trong VS Code |

## SF-3 — rows 13-22

| # | slug | cat | pubDate | facet | hero | repo | Title hướng (VI) |
|---|------|-----|---------|-------|------|------|------------------|
| 13 | `deep-dive-openhands-openhands` | tech | 2026-10-07 | harness | no | OpenHands/OpenHands | OpenHands: nền tảng agent developer tự vận hành |
| 14 | `deep-dive-headroomlabs-ai-headroom` | tech | 2026-10-07 | mcp | no | headroomlabs-ai/headroom | Headroom: MCP cấp ngữ cảnh cho agent code |
| 15 | `deep-dive-aaif-goose-goose` | tech | 2026-10-08 | harness | no | aaif-goose/goose | Goose: agent tự động hoá việc dev trên máy bạn |
| 16 | `deep-dive-aider-ai-aider` | tech | 2026-10-08 | harness | no | Aider-AI/aider | Aider: pair programming AI trong terminal |
| 17 | `deep-dive-deusdata-codebase-memory-mcp` | tech | 2026-10-09 | mcp | no | DeusData/codebase-memory-mcp | codebase-memory-mcp: trí nhớ dài hạn cho agent đọc code |
| 18 | `deep-dive-charmbracelet-crush` | tech | 2026-10-09 | harness | no | charmbracelet/crush | Crush: agent terminal đậm chất Charm |
| 19 | `deep-dive-xai-org-grok-build` | tech | 2026-10-10 | harness | no | xai-org/grok-build | grok-build: agent build của xAI |
| 20 | `deep-dive-microsoft-mcp-for-beginners` | tech | 2026-10-10 | mcp | no | microsoft/mcp-for-beginners | MCP for Beginners: kho học liệu chính thống về MCP |
| 21 | `deep-dive-hangwin-mcp-chrome` | tech | 2026-10-11 | mcp | no | hangwin/mcp-chrome | mcp-chrome: để agent điều khiển Chrome |
| 22 | `deep-dive-modelcontextprotocol-registry` | tech | 2026-10-11 | mcp | no | modelcontextprotocol/registry | MCP registry: danh bạ trung tâm của server MCP (†) |

## SF-4 — rows 23-36

| # | slug | cat | pubDate | facet | hero | repo | Title hướng (VI) |
|---|------|-----|---------|-------|------|------|------------------|
| 23 | `deep-dive-neovim-neovim` | tech | 2026-10-12 | editors | no | neovim/neovim | Neovim: editor mở rộng bằng Lua và cộng đồng |
| 24 | `deep-dive-vllm-project-vllm` | tech | 2026-10-12 | inference | no | vllm-project/vllm | vLLM: serving LLM thông lượng cao |
| 25 | `deep-dive-foundationagents-metagpt` | tech | 2026-10-13 | multi-agent | no | FoundationAgents/MetaGPT | MetaGPT: công ty phần mềm mô phỏng bằng agent |
| 26 | `deep-dive-microsoft-autogen` | tech | 2026-10-13 | multi-agent | no | microsoft/autogen | AutoGen: khung agent đa vai của Microsoft |
| 27 | `deep-dive-crewaiinc-crewai` | tech | 2026-10-14 | multi-agent | no | crewAIInc/crewAI | crewAI: đội agent theo vai trò |
| 28 | `deep-dive-hkuds-nanobot` | tech | 2026-10-14 | multi-agent | no | HKUDS/nanobot | Nanobot: agent tối giản cho tác vụ hằng ngày |
| 29 | `deep-dive-exo-explore-exo` | tech | 2026-10-15 | inference | no | exo-explore/exo | Exo: cụm máy cá nhân chạy mô hình lớn |
| 30 | `deep-dive-janhq-jan` | tech | 2026-10-15 | inference | no | janhq/jan | Jan: trợ lý AI chạy local (†) |
| 31 | `deep-dive-openai-openai-agents-python` | tech | 2026-10-16 | multi-agent | no | openai/openai-agents-python | OpenAI Agents SDK: agent tối giản theo kiểu OpenAI |
| 32 | `deep-dive-pydantic-pydantic-ai` | tech | 2026-10-16 | multi-agent | no | pydantic/pydantic-ai | PydanticAI: agent đánh máy chặt |
| 33 | `deep-dive-qwenlm-qwen-agent` | tech | 2026-10-17 | multi-agent | no | QwenLM/Qwen-Agent | Qwen-Agent: agent gắn chặt hệ Qwen |
| 34 | `deep-dive-camel-ai-camel` | tech | 2026-10-17 | multi-agent | no | camel-ai/camel | CAMEL: nghiên cứu agent cộng tác quy mô lớn |
| 35 | `deep-dive-hkuds-deepcode` | tech | 2026-10-18 | multi-agent | no | HKUDS/DeepCode | DeepCode: nghiên cứu code đa agent từ HKUDS |
| 36 | `deep-dive-ast-grep-ast-grep` | tech | 2026-10-18 | terminal | no | ast-grep/ast-grep | ast-grep: tìm và sửa code theo AST |

## SF-5 — rows 37-50

| # | slug | cat | pubDate | facet | hero | repo | Title hướng (VI) |
|---|------|-----|---------|-------|------|------|------------------|
| 37 | `deep-dive-coder-code-server` | tech | 2026-10-19 | editors | no | coder/code-server | code-server: VS Code trên server từ xa |
| 38 | `deep-dive-burntsushi-ripgrep` | tech | 2026-10-19 | terminal | no | BurntSushi/ripgrep | ripgrep: công cụ tìm nhanh của cây mã nguồn |
| 39 | `deep-dive-sharkdp-bat` | tech | 2026-10-20 | terminal | no | sharkdp/bat | bat: cat với syntax highlight và git |
| 40 | `deep-dive-starship-starship` | tech | 2026-10-20 | terminal | no | starship/starship | Starship: prompt shell nhanh và đa shell |
| 41 | `deep-dive-helix-editor-helix` | tech | 2026-10-21 | editors | no | helix-editor/helix | Helix: editor modal không cần cấu hình |
| 42 | `deep-dive-sxyazi-yazi` | tech | 2026-10-21 | terminal | no | sxyazi/yazi | Yazi: file manager terminal viết bằng Rust |
| 43 | `deep-dive-lapce-lapce` | tech | 2026-10-22 | editors | no | lapce/lapce | Lapce: editor Rust hướng hiệu năng |
| 44 | `deep-dive-continuedev-continue` | tech | 2026-10-22 | editors | no | continuedev/continue | Continue: trợ lý AI gắn vào IDE của bạn |
| 45 | `deep-dive-tabbyml-tabby` | tech | 2026-10-23 | editors | no | TabbyML/tabby | Tabby: trợ lý code tự host (†) |
| 46 | `deep-dive-anywhere-labs-dsh-desktop` | tech | 2026-10-23 | misc | no | anywhere-labs/dsh-desktop | DSH Desktop: điều phối agent trên desktop |
| 47 | `deep-dive-copilotkit-openbot` | tech | 2026-10-24 | editors | no | CopilotKit/OpenBot | OpenBot: chat bot mã mẫu của CopilotKit |
| 48 | `deep-dive-hisn00w-asu-skills` | tech | 2026-10-24 | misc | no | Hisn00w/ASu-skills | ASu-skills: bộ skill cộng đồng cho agent |
| 49 | `deep-dive-yetone-cumora` | tech | 2026-10-25 | misc | no | yetone/cumora | Cumora: góc nhìn một repo AI đang lên |
| 50 | `deep-dive-leonxlnx-unlazy` | tech | 2026-10-25 | misc | no | Leonxlnx/unlazy | unlazy: tối ưu lazy-load ảnh |

## Quy tắc tiêu thụ matrix (cho SF-2/3/4/5)

1. **Thứ tự viết theo SF sở hữu** (owner ranges ở header); trong SF, giữ thứ
   tự # tăng dần (đúng nhịp 2 bài/ngày 10-01 → 10-25).
2. **Mỗi bài PHẢI có section marker** `## Wakii học được gì` (VI) /
   `## What Wakii learns` (EN) — level `##` exact, nội dung = grading
   ADOPT/DIRECTION/WATCH/N/A so product surface thật (style-guide §8).
   Thiếu marker → `node scripts/check-blog-content.mjs` exit 1.
3. **pubDate PHẢI khớp dòng matrix** — lint so frontmatter vs row (sai = FAIL).
4. **6 slug †**: KHÔNG dùng "open-source"/"mã nguồn mở" — dùng "công khai trên
   GitHub" (scoped FORBIDDEN, claims-registry). Mọi số third-party kèm ngày
   probe (`theo GitHub API ngày N`); probe bằng `bash scripts/probe-repos.sh`.
5. **Hero `yes`** — sau khi bài tồn tại: thêm frontmatter
   `heroImage: "/blog/heroes/<slug>.png"` CẢ HAI locale (VI share hero EN —
   cùng giá trị với EN) rồi chạy `node scripts/render-blog-heroes.mjs`.
6. Research ghi vào `docs/superpowers/editorial/research/digests-batch3/<slug>.md`
   (skeleton có sẵn — điền TODO, không bịa số không probe).
