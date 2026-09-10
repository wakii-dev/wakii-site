# ollama/ollama — research digest (batch-3, matrix #3)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: ollama/ollama
- facet: inference
- stars @ 2026-09-08: 180451 (probe riêng của SF-2 khi viết bài; skeleton SF-1 ghi 180448 — drift sống của số GitHub API, dùng số probe kèm ngày trong bài)
- license (GitHub API 2026-09-08): MIT → bài ĐƯỢC gọi "open-source"/"mã nguồn mở" (không thuộc 6 slug † scoped-FORBIDDEN)
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh` + `gh api repos/ollama/ollama` exit 0)
- pushed @ 2026-09-08: 2026-09-07T19:23:38Z · created 2023-06-26 · language Go · homepage ollama.com
- clone @ 2026-09-08: HEAD `83ed7d9` (shallow, github.com/ollama/ollama) — mọi blob link trong bài pin sha này

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
  - README tagline: "Get up and running with Kimi-K2.6, GLM-5.2, MiniMax, DeepSeek, gpt-oss, Qwen, Gemma and other models." Install 1 dòng (curl/irm), `ollama` mở launcher "prompted to run a model or connect Ollama to your existing agents or applications such as Claude Code, OpenClaw, OpenCode, Codex, Copilot". `ollama run gemma4` chat; `ollama launch claude` wire integration; REST API localhost:11434; Python/JS SDK chính thức. Supported backends: llama.cpp (README). Community integrations: hàng trăm client (Open WebUI, Continue, Cline…).
  - Khác biệt cốt lõi: 1-lệnh trải nghiệm từ install → chạy model → wire coding agent; nói cả 2 dialect API (OpenAI + Anthropic).
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật @ 83ed7d9)
  - `server/sched.go` (1.785 dòng): scheduler — `LlmRequest`, 1 model nạp mỗi lần (`activeLoading`), `defaultModelsPerGPU = 3` kèm comment gốc ("Model will still need to fit in VRAM…"), `numCtxAuto` (VRAM-tier default), `oomRetryAttempted` chặn lặp evict-all-and-retry, `ErrMaxQueue` fail thành tiếng.
  - `cmd/launch/` — 18 file integration (claude, claude_desktop, cline, codex, codex_app, copilot, deepseek_harness, droid, hermes, kimi, muse, omp, openclaw, opencode, pi, poolside, qwen, vscode); `claude.go`: `modelEnvVars` route OPUS/SONNET/HAIKU + SUBAGENT về 1 model qua env; auto-install Claude Code có ConfirmPrompt.
  - `cmd/launch/context_window.go`: `LoadedContextWindow` hỏi `ListRunning` — context window ĐƯỢC CẤP PHÁT thật ("which VRAM fit or server configuration may hold below the model's trained maximum"), không xác định → trả 0.
  - `discover/` — GPU probe per-backend (amd, vulkan, gpu_darwin/Metal, cuda_compat, native_probe) + Jetson qua `JETSON_JETPACK`; `GetSystemInfo` trả memory cho scheduler.
  - `anthropic/anthropic.go` (1.307 dòng) — endpoint Anthropic-compatible; server còn `cloud_proxy.go`, `codex_proxy.go`.
  - `agent/` — runtime agent riêng: session, skills (skills.go 813 dòng), skill_activation, compactor, approval, tools.
  - Backend pins: `LLAMA_CPP_VERSION` = b10760; `MLX_VERSION` = 37c26e5…; `envconfig/config.go` default 127.0.0.1:11434; `server/images.go` — blob đã trên đĩa thì skip (comment dòng ~1102).
- [x] Releases — cadence + release gần nhất (API ?per_page=10, ngày probe 2026-09-08)
  - 10 releases trong 22 ngày: v0.34.0-rc1 09-05 · v0.33.3 09-02 · v0.33.2 08-27 · v0.33.1 08-26 · v0.33.0 08-21 · v0.32.15 08-19 · v0.32.14 08-15 · v0.32.13/12/11 đều 08-14 (3 releases cùng ngày). Cadence ≈ 1 release/2-3 ngày trong window.
- [x] Wakii grading — style-guide §8 (đủ lý do trỏ evidence trong bài)
  - ADOPT — báo số thật/trả 0 khi không chắc (context_window.go) ↔ Rule 0; điểm học thêm: ghi không-xác-định thành kết quả hợp lệ trong gate report.
  - DIRECTION — wire-bằng-cấu-hình thay vì fork (claude.go env routing) → 1 lệnh trỏ 9-agent về endpoint tự host cho code nhạy cảm; chờ local model đủ tin agentic.
  - WATCH — local inference cho agent loop (agent/ runtime); điều kiện: model local pass trọn story-verify đa gate.
  - N/A — scheduler fit VRAM/evict-retry: hạ tầng inference, Wakii gọi API frontier không chạy model trong app.
