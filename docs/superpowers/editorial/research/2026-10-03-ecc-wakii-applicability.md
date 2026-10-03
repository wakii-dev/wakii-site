# Wakii applicability — affaan-m/ECC (2026-10-03)

Đối chiếu với surface hiện tại (đọc trực tiếp, không theo trí nhớ): kit.json **2.20.0**
trong wakii repo (`resources/plugins/launch/stablyai.orca-superpowers-launcher/kit/`) —
provides **73** = 6 skills (orca-superpowers-workflow, story-workflow, orca-bridge,
writing-plans-linear, mock-prototype, post-task-ritual) + 10 agents + bins/bundles, trong đó
bins đã có `story-doctor` (health check), `story-hooks-install` (merge 3 hook entries),
SessionStart hooks (`story-fact-pack` cap 2KB, `story-compact-recovery`), memory KG
(triples + provenance + fuse gate, entry 19/09).

| # | Pattern | Level | Landed-ở-đâu (nếu adopt) |
|---|---------|-------|--------------------------|
| 1 | **Skills-first + legacy command shims** — commands chỉ là shim opt-in trong giai đoạn migrate, "new workflow development lands in skills/ first", command retire không xoá khô mà nằm `legacy-command-shims/` | **DIRECTION** | Đã đi đúng hướng: kit 6 skills + bins mang cơ chế từ 2.16.0. Push tiếp = quy ước retire skill/command trong `kit/skills/` + `kit.json` provides (đánh dấu `deprecated_by` thay vì xoá) |
| 2 | **Instinct system (continuous-learning-v2)** — learned pattern chấm confidence; SessionStart inject top-6, min confidence 0.7, rank theo confidence + stack-relevance; `/evolve` cluster → skill; `/prune` hết hạn | **DIRECTION** | Wakii đã có nửa thô: SessionStart hooks (`story-fact-pack`, `story-compact-recovery`) + user memory (standings + lessons index). Push = thêm cap/injection-rank/min-confidence vào hook wrapper bins của kit; `/prune` tương ứng dọn lessons đã fence |
| 3 | **Cross-harness memory vault (`ecc memory`)** — handoff body qua file, recall từ harness khác, validate vault khi share | **WATCH** | Quyết định product: kit là Claude-first nhưng orca spawn codex/gemini…; vault chéo-harness đụng `wakii-mcp-server` (hiện read-only) + story memory KG. Cần user quyết trước khi đụng |
| 4 | **Context caps + hook profile viết thành env/config** — SessionStart additional-context cap 8000 chars + tắt được; hook strictness profile; per-hook-ID disable; session-tmp retention 30d | **ADOPT** | `story-hooks-install` + 3 hook wrapper bins của kit — thêm profile (minimal/standard) + cap env var. SessionStart context hiện tại rất dài (standings + lessons + gates + watchdog); cap/rank là config-level, rẻ, reversible |
| 5 | **AgentShield + GateGuard** — PreToolUse gate lệnh phá hoại; scan prompts/hooks/MCP/permissions/secrets; supply-chain IOC trong CI | **WATCH** | GateGuard trùng chức năng orca permission system (double-gate = friction → phần gate: N/A). Phần self-scan surfaces: phụ thuộc npm ngoài vào gate = quyết định supply-chain; kit tests (kit-verify-manifest, fingerprints) đã phủ một phần |
| 6 | **Install lifecycle: dry-run / doctor / repair / uninstall / collision preflight / install-state ownership** | **DIRECTION** | `story-doctor` bin đã có (health check). Push = dry-run + repair + uninstall cho installKit; 2 defect install 27/09 (installKit thiếu manifest merge, story-verify stub quên chmod) thuộc đúng class mà dry-run/doctor bắt được |
| 7 | **Token optimization doctrine** — sonnet default + opus escalation, thinking cap, autocompact 50%, MCP budget (<10 MCPs/<80 tools), strategic compaction tại breakpoint, agent-teams cost warning | **DIRECTION** | Kit đã chạy context economy (fact-pack ≤2KB, compact-recovery, strategic-compact tương đương). Push = ghi doctrine vào docs skills + budget MCP khi config MCP cho user (wakii-story MCP là 1 server duy nhất — đúng chiều) |
| 8 | **68 agents, cặp reviewer/build-resolver theo ngôn ngữ** (go/rust/py/java/kotlin/cpp/swift…) | **N/A** | Kit 10 agents là workflow roles theo design (executor/critic/medic); knowledge theo ngôn ngữ thuộc skill layer của upstream/user, nhét vào kit = bloat ngược doctrine |
| 9 | **Worktree lifecycle service + orchestr-\* family** (2.0: control-pane substrate, worktree lifecycle) | **DIRECTION** | story-workflow + orca worktree-SF + watchdog đã implement cùng lớp bài toán; validation độc lập cho kiến trúc. Đọc `docs/releases/2.0.0/release-notes.md` để so cách họ giải worktree lifecycle service |
| 10 | **Support-status matrix công khai + adapter capability-limited** — "see the support status matrix before assuming feature parity"; adapter chỉ thăng guided sau khi qua lifecycle matrix | **ADOPT** | Docs-level, rẻ: kit README/docs thêm matrix parity per platform (macOS/Linux/Windows/SSH/WSL/folder-workspace/mobile) — AGENTS.md đã có toàn bộ concerns, còn phân tán; matrix hoá = 1 bảng |

## Drift vs file cũ nhất (open-code-review, 18/09; + graph-memory 19/09)

- **Surface drift của Wakii**: 18/09 kit còn 2.14.0 (mới lấy 5 rules từ OCR, chưa merge);
  hôm nay 2.20.0 — provides 73, story-doctor tồn tại, memory KG đã landed đúng đề xuất
  ADOPT của entry 19/09 (component serving + fuse gate). Applicability 19/09 đã dự báo
  đúng thứ build xong.
- **Hội tụ 3/3 entries về doctrine đo-được**: OCR = benchmark công khai (18/09, WATCH #5
  mini review-bench); graph-memory = provenance audit (19/09 ADOPT #4); ECC = instinct
  confidence + eval-harness (hôm nay). Ý "biến chất lượng thành số đo được" giờ xuất
  hiện ở 3 nguồn độc lập — đủ tín hiệu để nâng từ WATCH lên đề xuất có lịch.
- **Entry mới đè entry cũ ở đúng điểm yếu**: ECC #6 (dry-run/doctor/repair lifecycle)
  mạnh hơn mọi pattern của OCR entry về tính operational — 2 kit install defects đã fix
  27/09 thuộc chính class này.
- Không entry cũ nào bị thay thế; ECC nằm ở lớp harness-economics (context/memory/install),
  OCR ở review, graph-memory ở knowledge — ba lớp khác nhau.

## Nguồn

- Repo: https://github.com/affaan-m/ECC (MIT) — retrieval 2026-10-03 qua `gh api`
  (stars/forks/releases/commits); README + catalog đọc qua zread cùng ngày (~106K chars,
  đã đọc: intro/install/catalog/key-concepts/what's-new/token-optimization/security/
  background; chưa đọc chi tiết: phần install per-harness 17k–43k, platform matrix 63k–90k)
- AgentShield: `affaan-m/agentshield` 1,247★ (search API, 2026-10-03)
- Surface Wakii: `kit.json` v2.20.0 provides 73 + `kit/skills/` + `kit/agents/` đọc
  trực tiếp trong wakii repo 2026-10-03
