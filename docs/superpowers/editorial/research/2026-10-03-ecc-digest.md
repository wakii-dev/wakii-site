# Digest 2026-10-03 — affaan-m/ECC

Retrieval date: 2026-10-03 (số liệu lấy trực tiếp qua `gh api` tại thời điểm viết; cross-check 2 endpoint).

## Repo

| | |
|---|---|
| Repo | https://github.com/affaan-m/ECC |
| Stars | 271,609 (`repos` API) → 271,613 (search API, vài phút sau) — pace ~1k sao/ngày |
| Forks | 40,574 |
| Tuổi | created 2026-01-18 (~8.5 tháng) |
| Cadence | 19 releases; burst 7 bản trong 02/2026, sau đó ~1 bản/tháng; mới nhất v2.2.3 (01/10/2026) |
| Open issues | 340 |
| License | MIT |
| Ngôn ngữ | JavaScript (Node scripts) |
| Website | https://ecc.tools · npm `ecc-universal`, `ecc-agentshield` |

## Là gì

Tự mô tả: **"the agent harness performance optimization system"** — tầng nằm trên
model, biến agent CLI thành quy trình kỹ thuật có sẵn: `plan → test → implement →
review → verify → remember → improve`. Cài một lần, mọi prompt kế thừa.

| Included | Count | Nội dung |
|---|---|---|
| Agents | 68 | planner, code-reviewer, security-reviewer, build-error-resolver theo ngôn ngữ (go/rust/py/java/kotlin/cpp/swift…), loop-operator, harness-optimizer |
| Skills | 292 | TDD, security, verification-loop, eval-harness, continuous-learning-v2, strategic-compact, autonomous-loops… |
| Commands | 94 | slash shims trong giai đoạn migrate sang skills-first |
| Hooks + memory | runtime | SessionStart/Stop/PreCompact, session summaries, instincts, context caps |
| AgentShield | kèm | scan prompts, hooks, MCP config, permissions, secrets |

Install qua Claude Code native plugin marketplace (`/plugin install ecc@ecc`) hoặc
wizard `npx ecc-universal@2.2.2 setup`. Hỗ trợ chính: Claude Code ("works best
today") + Codex sync path; adapters capability-limited cho Cursor, OpenCode, Gemini,
Zed, Copilot, Antigravity, Qwen… với support-status matrix công khai — README cảnh
báo thẳng "không được giả định feature parity". 01/10/2026 retire tên cũ "Everything
Claude Code" → chỉ còn ECC (PR #3330).

Monetization: ECC Pro (hosted GitHub App cho private repo, PR-triggered audits) +
sponsors (CodeRabbit, Greptile, Moonshot AI, Itô — theo commit 02/10).

## Kiến trúc đáng học

- **Skills-first migration có kỷ**: commands chỉ là shim duy trì; repo định nghĩa rõ
  "new workflow development lands in `skills/` first"; command đã retire nằm ở
  `legacy-command-shims/` — opt-in, không xoá khô.
- **Instincts (continuous-learning-v2)**: pattern học từ session được chấm confidence;
  SessionStart chỉ inject top-6, minimum confidence 0.7, rank theo confidence + độ khớp
  project/stack; `/evolve` cluster instincts thành skill; `/prune` xoá hết hạn; có
  import/export.
- **Context economics viết thành config**: SessionStart additional-context cap 8000
  chars (tắt được), hook strictness profile, per-hook-ID disable, session-tmp retention
  30 ngày; MCP budget doctrine (<10 MCPs, <80 tools — "enable hết MCP có thể còn 70k/200k");
  strategic compaction tại breakpoint thay vì auto-compact 95%.
- **Memory vault `ecc memory`**: handoff body qua file thường, recall từ harness khác,
  validate vault trước khi share team memory — memory tách khỏi model và khỏi harness.
- **AgentShield** (repo riêng `affaan-m/agentshield`, 1,247★) + **GateGuard**: PreToolUse
  gate lệnh phá hoại (rm, force checkout, find -exec); supply-chain IOC scanner chạy trong CI.
- **Install lifecycle đủ vòng đời**: guided setup + dry-run + doctor + repair + uninstall +
  collision preflight + "install-state ownership"; docs cảnh báo "do not stack install
  methods" (cài 2 lần = duplicate hooks/skills).
- **Docs là sản phẩm**: 3 guides in-repo (Shorthand / Longform / Security), mỗi guide có
  thread X riêng; CHANGELOG + per-release notes + evidence dưới `docs/releases/`.

## Số liệu chú ý (tự công bố, chưa độc lập)

- README ghi "Current release: 2.2.2 (2026-08-31)" nhưng `gh api` cho v2.2.2 published
  30/09 và v2.2.3 01/10 — docs trailing cadence, đúng pattern repo tăng tốc.
- Backdrop của owner: thắng Anthropic x Forum Ventures hackathon 09/2025, built
  zenith.chat bằng agentic workflows.

## Post angles

1. **271k stars / 8.5 tháng — "harness" đã thành category, không còn là dotfile**
   Tầng product mới: không bán model, không bán IDE — bán *quy trình bọc quanh model*.
   Nối chuỗi landscape digest về agentic tooling cadence trước đó. Evidence: bảng số
   trên (retrieval 2026-10-03).
2. **"Optimize the context window. Persist everything else."** — một câu doctrine gói
   cả token optimization + memory vault + instincts: context là tài nguyên khan hiếm
   duy nhất, mọi thứ khác phải nằm ngoài và được inject có chọn lọc (cap, confidence,
   relevance ranking). Nối bài cost/agentic tools + entry graph-memory 19/09.
3. **Ba repo, ba tháng, một doctrine: đo được thay vì cảm tính** — open-code-review
   (benchmark công khai), graph-memory stack (provenance audit), ECC (instinct confidence
   + eval-harness + verification-loop). Hội tụ về cùng nhu cầu; nối ý mini review-bench
   từ applicability 18/09 (#5).
