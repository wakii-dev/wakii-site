# google-gemini/gemini-cli — research digest (batch-3, matrix #7)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: google-gemini/gemini-cli
- facet: harness
- stars @ 2026-09-08: 106867 (probe riêng task-executor; skeleton cũ ghi 106863 — drift nhẹ cùng ngày, dùng số probe mới)
- license (GitHub API 2026-09-08): Apache-2.0 → dùng được "open-source" (slug KHÔNG thuộc 6 slug † scoped)
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh` + `gh api` trực tiếp, exit 0)
- số probe đầy đủ @ 2026-09-08: 106867★ · 14542 forks · 832 open issues · pushed 2026-09-08T01:26:08Z · created 2025-04-17
- HEAD clone (link blob): `85aca16` (85aca163f6c73ac6ce380b5447359146b8adcae4)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## README notes

- Tự giới thiệu: "An open-source AI agent that brings the power of Gemini directly
  into your terminal" + "the most direct path from your prompt to our model"
  (chữ "our model" — định vị vendor-owned, không giả trung lập).
- Điểm khác biệt cốt lõi: free tier 60 req/phút + 1.000 req/ngày (Google account
  cá nhân) · built-in tools (Search grounding, file ops, shell, web fetch) ·
  MCP support · GEMINI.md context files · GitHub Action run-gemini-cli
  (PR review, issue triage, @gemini-cli mention) · conversation checkpointing.
- README khẳng định badge "Open source: Apache 2.0 licensed".

## Architecture (đọc từ clone @ 85aca16, 2026-09-08)

- Monorepo npm workspaces, đúng 7 packages: cli (TUI React+Ink) · core (vòng lặp
  agent) · a2a-server (experimental) · sdk (nhúng) · devtools ·
  vscode-ide-companion · test-utils — mô tả lấy từ GEMINI.md tại gốc repo
  (chính mechanism context-file của tool áp cho source của nó — dogfooding nhỏ).
- packages/core/src: policy (policy-engine.ts + types.ts với enum
  PolicyDecision ALLOW/DENY/ASK_USER, priority rules, log "Forcing ASK_USER" /
  "Preserving decision" khi YOLO / "overriding ASK_USER to ALLOW") ·
  confirmation-bus (message-bus tách khỏi tool loop) · skills (skillLoader +
  skillManager + builtin) · tools/activate-skill.ts (skill là TOOL — model gọi
  activate_skill {name}, description trả từ SkillManager → activation để dấu
  vết trong transcript) · tools/mcp-client + mcp-client-manager ·
  utils/extensionLoader.ts + config/extensions (extension = dữ liệu khai báo) ·
  ngoài ra sandbox, safety, routing, scheduler, agents, voice.
- Góc bài (phân định SF): khác opencode (độc lập vendor), khác claude-code
  (Outside View, không code) — đây là harness vendor-owned nhưng mở code 100%
  Apache-2.0 + dogfooding công khai. Bằng chứng dogfooding: 7/47 workflow trong
  .github/workflows chạy run-gemini-cli (automated/scheduled issue triage ×2,
  issue dedup ×2, release-notes, docs-audit, community-report) — grep 2026-09-08.

## Releases (gh API ?per_page=100, 2026-09-08)

- Gần nhất: v0.60.0-nightly.20260908.g85aca163f @ 2026-09-08 (khớp HEAD clone).
- Cadence 3 kênh theo README: nightly 00:00 UTC mỗi ngày · preview 23:59 UTC
  thứ Ba · stable 20:00 UTC thứ Ba (promotion preview + fix). Dữ liệu khớp:
  v0.58.0 @ 2026-09-01T20:51:17Z (thứ Ba), v0.59.0-preview.0 @ 2026-09-01T20:19:07Z;
  13 nightly trong 14 đêm 08-26 → 09-08 (thiếu đúng 1 đêm 09-03).

## Wakii grading (chi tiết trong bài, tóm tắt)

- ADOPT — quyền là ruleset dữ liệu có priority được máy chấm trước khi chạy →
  đề xuất story-preflight mã hóa điều kiện cứng thay checklist văn xuôi.
- DIRECTION — dogfooding vận hành công khai (7 workflow triage/dedup issue trên
  repo chính nó) → áp cho wakii-dev/wakii khi bộ triage rule chín.
- WATCH — a2a-server tự nhãn experimental, khớp research "A2A còn sớm" của Wakii.
- N/A — free tier 1.000 req/ngày: thế mạnh vendor-owned model; Wakii bring-your-own.
