# continuedev/continue — research digest (batch-3, matrix #44)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: continuedev/continue
- facet: editors
- stars @ 2026-09-08: 35832 (probe SF-1) / 35833 (re-probe bài viết 2026-09-08)
- license (GitHub API 2026-09-08): Apache-2.0
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`; re-probe `gh api repos/continuedev/continue` cùng ngày)
- ngôn ngữ: TypeScript · default branch: main · pushed_at 2026-09-08T10:01:48Z · archived: false

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## README notes

- Tự mô tả: "Pioneering open-source coding agent" (README gốc, probe 2026-09-08).
- Ba hình thức: CLI (npm `@continuedev/cli`), VS Code extension (Marketplace + OpenVSX), JetBrains plugin.
- **ĐỌNG CỬA**: README ghi chú nguyên văn ngay phần "What is Continue?":
  "Note: The `continuedev/continue` repository is no longer actively maintained
  and is read-only for all users." — kết thúc bằng "Final 2.0.0 Release"
  (gỡ anonymous telemetry, tháo authentication, squash bugs), để code lại làm
  nền cho người khác ("We hope this codebase continues to serve as a
  foundation for others.").
- Điểm khác biệt cốt lõi so với các assistant cùng thời: không dựng IDE mới —
  nhúng vào editor đang có; cấu hình tập trung vào MỘT file config (models /
  rules / context / MCP) thay vì setting rải rác.

## Architecture

- Config hub: `config.yaml` — loader nằm ở `core/config/yaml/`
  (`loadYaml.ts`, `yamlToContinueConfig.ts`, `models.ts`, …).
- Rules là DATA: mỗi rule có `globs`, `alwaysApply`, `invokable`, `name`,
  `description`, `source: "rules-block"` — xem
  `core/config/yaml/yamlToContinueConfig.ts` @ `5522c6f44ca0ac3528b37244818fbfa39b5af470`:
  https://github.com/continuedev/continue/blob/5522c6f44ca0ac3528b37244818fbfa39b5af470/core/config/yaml/yamlToContinueConfig.ts
- MCP trong cùng schema: stdio (`command`/`args`/`cwd`/`env`) và HTTP/SSE
  (`url`/`apiKey`/`requestOptions`) — cùng file trên (`convertYamlMcpConfigToInternalMcpOptions`).
- Dogfood: thư mục `.continue/` ngay ở repo gốc — `agents/`, `checks/`,
  `environment.json`, `prompts/`, `rules/` (theo GitHub API ngày 2026-09-08,
  cây contents/?ref=main @ sha trên).
- Root còn có `worktree-config.yaml` (chi tiết chưa đào — không dùng trong bài).

## Releases (gh api releases?per_page=6, ngày probe 2026-09-08)

| tag | published_at |
|-----|--------------|
| v2.1.0-vscode | 2026-06-19 |
| v2.0.0-vscode | 2026-06-19 |
| v1.3.40-vscode | 2026-06-15 |
| v1.2.24-vscode | 2026-06-15 |
| v1.2.23-vscode | 2026-06-15 |
| v1.3.38-vscode | 2026-03-27 |

- Cadence quan sát: cụm release cuối 2026-06 (khớp mốc "final release" trong
  README); trước đó giãn tháng (03-2026 → 06-2026).

## Wakii grading (draft — chốt trong bài)

- **ADOPT** — rules-as-data-blocks: rule khai bằng field có cấu trúc
  (globs/alwaysApply/invokable) thay vì prose. Đề xuất: story-workflow contract
  (context pack / guard) khai rule phạm vi file dạng block để máy lint được —
  seeding adopt-drafts/deep-dive-continuedev-continue.md.
- **DIRECTION** — consumer ngoài desktop: mobile đã chứng minh pattern consumer
  xa đọc gates; extension editor mỏng đọc cùng nguồn là hướng đi tự nhiên
  (chưa có yêu cầu user — chưa ADOPT).
- **WATCH** — vòng đời read-only của dự án 35k★: theo dõi ecosystem fork;
  đổi grade nếu xuất hiện fork duy trì config schema khỏe.
- Không dùng N/A.
