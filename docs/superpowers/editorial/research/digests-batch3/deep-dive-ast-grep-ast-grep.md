# ast-grep/ast-grep — research digest (batch-3, matrix #36)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: ast-grep/ast-grep
- facet: terminal
- stars @ 2026-09-08: 15799 (probe riêng T14/SF-4 cùng ngày; SF-1 probe 15798 — drift bình thường trong ngày)
- license (GitHub API 2026-09-08): MIT
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh` + `gh api` T14)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## Research notes (T14, SF-4/FI-387 — ngày 2026-09-08)

- **Probe**: `gh api repos/ast-grep/ast-grep` → `{archived: false, license: MIT,
  pushed: 2026-09-08T03:10:55Z, stars: 15799}` — exit-status OK (bắt bằng
  `if ! out=$(gh api ...)` per gotcha pipe/exit).
- **README** (HEAD main `fc2b1530db74de49131b725221de98036a552a9f`, 2026-09-04):
  - "ast-grep(sg) is a CLI tool for code structural search, lint, and rewriting."
  - "You can write patterns as if you are writing ordinary code."
  - Ví dụ chính chủ: `ast-grep -p '$A && $A()' -l ts -r '$A?.()'` (rewrite null coalescing).
  - Key highlights: pattern isomorphic to code · jQuery-like API · YAML rules ·
    tree-sitter based + multiple cores · install npm/pip/cargo/brew.
- **Architecture** (crates listing, GitHub API 2026-09-08): cli, config, core,
  dynamic, language, lsp, napi, outline, pyo3, wasm.
  - `crates/core/src/meta_var.rs`: struct `MetaVarEnv` — 3 HashMap
    (single_matched / multi_matched / transformed_var); comment gốc
    "const a = 123 matched with const a = $A will produce env: $A => 123".
  - `crates/config/src/rule_config.rs`: enum `Severity` = Off/Hint/Info/Warning/Error,
    mô tả từng mức dạng doc-comment cạnh enum.
  - `crates/config/src/rule/`: relational_rule.rs, nth_child.rs, stop_by.rs,
    referent_rule.rs, selector.rs (+ deserialize_env, range, parameterized_util, mod).
  - `crates/cli/src/scan.rs`: `run_with_config(...) -> Result<ExitCode>`
    (`use std::process::ExitCode`) — thiết kế exit-status cho CI.
- **Releases** (`gh api releases?per_page=10`): 0.45.3 2026-08-31 · 0.45.2
  2026-08-23 · 0.45.1 2026-08-07 · 0.45.0 2026-07-23 · 0.44.1 2026-07-04 ·
  0.44.0 2026-06-22 · 0.43.0 2026-05-25 · 0.42.3 2026-05-19 · 0.42.2 2026-05-10 ·
  0.42.1 2026-04-04 → 10 release / ~5 tháng, minor ~1 tháng/lần.
- **CI action**: `ast-grep/action` tồn tại (12 sao, description null) — cite
  existence-only.
- **Liên quan markdown grammar**: tree-sitter-grammars/tree-sitter-markdown
  (MIT) tồn tại — dùng cho grade DIRECTION (AST check cho content).
- **Grading** (trong bài, `## Wakii học được gì`): ADOPT (gate máy trước gate
  người — đã áp ở build chain + gates B0-B5) · DIRECTION (AST check cho
  markdown — khả thi, chưa cần) · WATCH (scanner pattern-level cho scripts).
  → ADOPT draft: `adopt-drafts/adopt-draft-ast-grep-ast-grep.md`.
- **Cross-link**: arch-ci-gates (§sg scan CI) + watchdog-idle-is-not-dead
  (§Wakii học được gì, ADOPT bullet).
