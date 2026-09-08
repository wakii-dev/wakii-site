# FoundationAgents/MetaGPT — research digest (batch-3, matrix #25)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: FoundationAgents/MetaGPT
- facet: multi-agent
- stars @ 2026-09-08: 70263
- license (GitHub API 2026-09-08): MIT
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## Research notes (probe 2026-09-08, `gh api` trực tiếp)

### Repo facts

- full_name: `FoundationAgents/MetaGPT` — `geekan/MetaGPT` probe → redirect về tên
  mới (repo đã chuyển tổ chức; README phần install vẫn còn dòng
  `git+https://github.com/geekan/MetaGPT.git`).
- stars 70,263 · license MIT · archived false · pushed_at 2026-01-21
  (theo GitHub API ngày 2026-09-08).
- README định vị: "The Multi-Agent Framework" — one line requirement →
  user stories / competitive analysis / requirements / data structures / APIs /
  documents. Triết lý: `Code = SOP(Team)` — quote README: "It provides the
  entire process of a software company along with carefully orchestrated SOPs".
- Usage: `metagpt "Create a 2048 game"` hoặc
  `from metagpt.software_company import generate_repo`.
- News README: MGX (MetaGPT X) launch 2025-02-19; #1 Product of the Week
  ProductHunt 2025-03-10 (nguồn README).

### Architecture (đọc code @ commit `11cdf466d042aece04fc6cfd13b28e1a70341b1f`)

- `metagpt/roles/`: product_manager.py, architect.py, project_manager.py,
  engineer.py, qa_engineer.py (+ role.py nền).
- `metagpt/actions/`: write_prd.py, design_api.py, project_management.py,
  write_code.py, write_code_review.py, write_test.py — mỗi action = 1 loại
  artifact; header comment cite RFC 135 / RFC 236 nội bộ.
- Schema artifact = code: `write_prd_an.py` khai ActionNode per-field
  (key/expected_type/instruction/example) — ví dụ PRODUCT_GOALS
  (expected_type List[str], "up to three clear, orthogonal product goals");
  `design_api_an.py` có DATA_STRUCTURES_AND_INTERFACES + PROGRAM_CALL_FLOW.
- Handoff = subscribe: `product_manager.py` —
  `set_actions([PrepareDocuments(...), WritePRD])` +
  `_watch([UserRequirement, PrepareDocuments])` + `RoleReactMode.BY_ORDER`.
  Vai sau tiêu thụ message theo kiểu, không gọi thẳng vai trước.

### Releases / activity

- Releases (per_page=10, API 2026-09-08): v0.8.2 2025-03-09 · v0.8.1
  2024-04-22 · v0.8.0 2024-03-29 · v0.7.7 2024-03-29 · v0.7.6 2024-03-12 ·
  v0.7.4 2024-03-07 · v0.7.3 2024-02-26 · v0.7.2 2024-02-20 · v0.7.1
  2024-02-19 · v0.7.0 2024-02-09.
- Commit gần nhất (API 2026-09-08): 11cdf466d0 2026-01-21 (merge PR #1897
  windows_terminal_adaptation) · de17c62ae8 2025-11-12 · fc6e843374 2025-10-04
  · 1dfce070d2 2025-06-30 · 5aae56e863 2025-06-30 — thưa dần qua 2025, dừng
  đầu 2026.
- Đọc: release cuối ~18 tháng trước ngày research; commit cuối ~8 tháng —
  activity thấp, nói thẳng trong bài + grading WATCH.

### Wakii grading (final trong bài)

- ADOPT — handoff giữa vai bằng artifact có cấu trúc (Wakii: spec → plan →
  task giữa 9 agents tách quyền).
- DIRECTION — schema hoá từng trường artifact kiểu ActionNode (Wakii hiện có
  lint cấu trúc, chưa có trường máy-parse được trong template spec/plan).
- WATCH — khung đã chậm (release 03-2025, commit 01-2026): không mặc định tín
  nhiệm stars; đổi thành DIRECTION khi có release mới / activity khôi phục.
- N/A — mô phỏng "công ty phần mềm" trọn gói từ 1 dòng requirement.
