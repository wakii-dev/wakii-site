# aaif-goose/goose — research digest (batch-3, matrix #15)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: aaif-goose/goose
- facet: harness
- stars @ 2026-09-08: 54022
- license (GitHub API 2026-09-08): Apache-2.0
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`)
- pushed @ 2026-09-08: 2026-09-08 · archived: false
- HEAD sha @ probe 2026-09-08: `5e90925962f05acf8e255032de44d16c4a7768a2` (dùng cho mọi link blob trong bài)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## README notes (đọc thật 2026-09-08)

- Tagline (verbatim 18 từ): "your native open source AI agent — desktop app, CLI,
  and API — for code, workflows, and everything in between" — README
  aaif-goose/goose. License Apache-2.0.
- goose = agent đa dụng chạy trên máy user: desktop app (macOS/Linux/Windows,
  Electron), CLI, API để embed. Built bằng Rust. Không chỉ code — research,
  automation, data analysis.
- Số README khai (lấy 2026-09-08): 15+ provider (Anthropic, OpenAI, Google,
  Ollama, OpenRouter, Azure, Bedrock…), subscription Claude/ChatGPT/Gemini sẵn
  có qua ACP; 70+ extension qua MCP.
- Ownership/naming: `gh api repos/block/goose` ngày 2026-09-08 trả về
  `full_name = aaif-goose/goose` (redirect chuẩn GitHub cho repo đã chuyển
  owner/org — tên cũ `block/goose` quen thuộc cộng đồng). README + GOVERNANCE.md
  ghi goose thuộc Agentic AI Foundation (AAIF) tại Linux Foundation.
  KHÔNG claim ngày transfer (không probe được) — chỉ claim redirect + AAIF.
- GOVERNANCE.md: 3 vai trò — Contributors / Maintainers / Core Maintainers;
  quote giá trị Open: "goose is open source, but we go beyond code availability".
- CUSTOM_DISTROS.md: white-labelling — preconfigure providers, bundle custom
  tools, đổi branding; kiến trúc: UIs (CLI / Desktop Electron / custom) →
  `goose serve` (ACP HTTP/WebSocket) → agent core.

## Architecture (cây source @ sha 5e909259, probe 2026-09-08)

- Rust workspace, 15 crates: `goose` (core), `goose-cli`, `goose-agent`,
  `goose-mcp`, `goose-providers`, `goose-provider-types`,
  `goose-local-inference`, `goose-acp-macros`, `goose-sdk`, `goose-sdk-types`,
  `goose-context-management`, `goose-roaming`, `goose-download-manager`,
  `goose-test`, `goose-test-support`.
- **Cơ chế #1 — uniform tool surface**: scheduler (first-party) được implement
  như một "platform extension" nói cùng MCP protocol —
  `crates/goose/src/agents/platform_extensions/scheduler.rs`:
  `EXTENSION_NAME = "scheduler"`, tool `scheduler__manage_schedule`,
  instructions (verbatim 16 từ): "Create, list, update, pause, resume, and
  remove scheduled recipe runs, and inspect the sessions they produced."
  Model nhìn thấy MỘT tool surface: MCP server ngoài = builtin developer =
  scheduler nội bộ.
- **Cơ chế #2 — validate-before-schedule**:
  `crates/goose/src/agents/schedule_tool.rs` — `read_schedule_recipe`:
  canonicalize path → chặn non-regular-file → cap
  `MAX_SCHEDULE_RECIPE_BYTES` = 1.048.576 byte (1 MB) → UTF-8 →
  `validate_recipe_template_from_content` trước khi nhận lịch. Trích code
  trong bài (4 dòng) + link blob.
- **Cơ chế #3 — recipe = YAML artifact**: version/title/parameters/extensions/
  prompt template. Recipe CI của chính goose
  `.github/recipes/code-review.yaml`: 2 tham số bắt buộc (`pr_directory`,
  `instructions`) + builtin `developer` + stdio MCP server `uv run
  pr-review-mcp.py`. goose-cli tải recipe từ GitHub repo về chạy —
  `retrieve_recipe_from_github(recipe_name, recipe_repo_full_name)` trong
  `crates/goose-cli/src/recipes/github_recipe.rs` (config key
  `GOOSE_RECIPE_GITHUB_REPO`) — đã đọc code xác nhận, không chỉ đoán từ tên file.
- **Cơ chế #4 — dogfood trong CI**: `.github/workflows/goose-pr-reviewer.yml`
  — trigger `issue_comment` "/goose [instructions]" (OWNER/MEMBER only); header
  Security (verbatim): "PR content could prompt-inject the agent; only trigger
  on PRs you trust." + "Do not add workflow_dispatch: API calls fetch mutable
  data, enabling TOCTOU attacks." — injection boundary viết ngay trong workflow.

## Releases (gh api releases?per_page=6 @ 2026-09-08)

| tag | published_at (UTC) |
|---|---|
| v1.49.0 | 2026-09-03 |
| v1.48.0 | 2026-08-27 |
| v1.47.0 | 2026-08-21 |
| v1.46.0 | 2026-08-12 |
| v1.45.0 | 2026-07-29 |
| v1.44.0 | 2026-07-23 |

- Cadence: 6 minor trong ~6 tuần (07-23 → 09-03) — 1-2 tuần/một minor.
- v1.49.0 notes đáng chú ý: auto-updater desktop; load extension nền để CLI
  prompt dùng được ngay; `on_failure` cho PreToolUse hooks; web-search +
  browser-use built-in skills; "Select saved recipes when creating a schedule"
  + scheduled job sessions accordion → scheduled jobs là surface hạng nhất.

## Wakii grading (docs đã đọc: agents-and-kit, story-workflow, getting-started)

- **ADOPT** — injection-boundary documentation tại mọi automated entry point.
  goose viết ngay trong CI workflow: nội dung PR có thể prompt-inject, từ chối
  workflow_dispatch vì TOCTOU. Wakii: các skill/agent definition nạp nội dung
  ngoài (code-reviewer đọc diff PR, watchdog resume từ state Linear) nên có
  chú thích boundary tương tự — surface: story-team-kit docs + story-workflow
  docs. Rủi ro: docs rot nếu không sync với skill.
- **DIRECTION** — scheduled maintenance hạng nhất (`scheduler__manage_schedule`:
  create/list/update/pause/resume từ recipe đã validate). Wakii ⚡ Workflow tab
  launch run theo lượt; watchdog reactive trong session. Điều kiện: thiết kế
  gate cho unattended runs (principle "Humans own the irreversibles") trước.
- **WATCH** — local inference (`goose-local-inference` + Ollama provider).
  Wakii đi trên Claude Code harness. Flip sang DIRECTION khi harness mở
  provider local hoặc nhu cầu privacy cụ thể.
- **N/A** — foundation governance (AAIF/Linux Foundation) + custom distros
  (white-labelling) — mô hình OSS đa tổ chức; Wakii là sản phẩm một team.

## Unique-H2 check (angle: local-first automation ngoài IDE)

1. "Agent chạy trên máy bạn, không trong editor" — positioning khác bài
   openhands (#14, control-center/runtime-split).
2. "Việc dev lặp lại đóng thành recipe YAML" — riêng (recipe-as-artifact).
3. "Scheduler là một extension, không phải đặc quyền" — riêng (uniform tool
   surface + validate-before-schedule).
4. "goose review PR của chính goose" — riêng (CI dogfooding + injection notes).
5. "Máy cấu hình của bạn: providers, extension, foundation" — riêng
   (providers/crates + ownership).

→ ≥2 H2 không bài harness nào có: ĐẠT.
