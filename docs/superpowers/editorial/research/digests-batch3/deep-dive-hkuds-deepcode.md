# HKUDS/DeepCode — research digest (batch-3, matrix #35)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: HKUDS/DeepCode
- facet: multi-agent
- stars @ 2026-09-08: 16499
- license (GitHub API 2026-09-08): MIT
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi

  DeepCode là coding agent "open agentic coding" của nhóm nghiên cứu HKUDS
  (HKU Data Intelligence Lab): một agent runtime, hai interface (CLI + Desktop
  Tauri). Nguồn gốc là Paper2Code — workflow chuyên biến paper/tài liệu/URL/
  repo tham chiếu thành code chạy được với verification — và section này vẫn
  giữ nguyên trong README bên cạnh agent lập trình tổng quát. Điểm khác biệt
  cốt lõi theo README: orchestration chọn/revisit phase theo task state
  (không phải prompt chain cố định), grounding tài liệu thành requirements
  trước khi viết code, memory + CodeRAG (index tham chiếu thành bounded
  context), verification lặp. Python 3.12+, arXiv paper 2512.07921.

- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm
  link commit/tree)

  Tree: `core/` (agent_runtime, harness: approval/permissions/policy/sandbox/
  command_guard/snapshot, loop, sessions, team, mcp, plugins, skills),
  `workflows/` (pipeline Paper2Code), `cli/`, `desktop/` (Tauri), `app_server/`,
  `eval/`, `prompts/`, `schema/`, `protocol/`, `tests/`.
  Pipeline chính `workflows/agent_orchestration_engine.py` (2407 dòng @ HEAD
  `949c688b13c86b1d0b27fe96cfb6cbee41ad961e`): `execute_multi_agent_research_pipeline`
  chạy phase 0→10 có % progress (Input Acquisition 25% → Workspace 40% →
  Document Segmentation 50% → Code Planning 65% → Plan Review 66% → Reference
  Intelligence 70% → Repository Acquisition 75% → Codebase Intelligence 80% →
  Code Implementation 85% → Finalization 100%). 7 agent chuyên trách theo README
  (orchestrator trung tâm + intent/document-parsing/code-planning/reference-
  mining/code-indexing/code-generation). Gate cứng: thiếu `initial_plan.txt` →
  RuntimeError abort trước mọi phase sau; `run_plan_review_gate`
  (`workflows/plan_review_runtime.py`, 569 dòng) pause chờ người duyệt
  approve/skip/revise. Head `core/harness/` có command_guard, sandbox,
  permissions — ranh giới thực thi.

- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày
  probe)

  16 releases tổng (v1.0.0 → v2.2.0, theo GitHub API ngày 2026-09-08). Gần
  nhất v2.2.0 published 2026-09-06. Cadence đang tăng tốc: v1.3.0 2026-07-17 →
  v2.0.0 2026-08-03 → v2.1.0 2026-08-12 → v2.2.0 2026-09-06 (4 bản trong ~7
  tuần); trước đó giãn (v1.1.0–v1.0.9 đầu 2026-02, v1.0.6–v1.0.8 cuối 2025-11).
  Commit HEAD `949c688b` 2026-09-06 "release: prepare DeepCode v2.2.0";
  pushed_at 2026-09-06 (2 ngày trước probe) — KHÔNG rơi vào pattern "star cao
  activity thấp" mà angle dự phòng.

- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do
  (style-guide §8)

  - **ADOPT** — nhật ký News trong README: mỗi merge một entry nêu PR #, hành
    vi đổi, quy tắc kiểm chứng (kiểu "a test makes the rule executable");
    commit `3fab4561` "docs(readme): news for the 2026-09-06 merges, in both
    languages". Áp cho README `wakii-dev/wakii` + release notes Wakii.
  - **DIRECTION** — boundary `<untrusted-data>` cho memory note (v2.2.0, #204:
    closing tags escaped để note nhiễm độc không forge được instruction) —
    áp cho memory/context mà Wakii inject vào agent.
  - **WATCH** — orchestration động "revisit phase theo task state" so với
    pipeline cố định + gates của Wakii; đổi thành DIRECTION khi có use-case
    research-reproduction thật.
  - **N/A** — Paper2Code như tính năng sản phẩm: Wakii không phải công cụ tái
    hiện nghiên cứu; học pattern (grounding + gate), không học product.

## Chú thích probe bổ sung (2026-09-08)

- Repo KHÔNG rename, KHÔNG archived, default branch `main`.
- open_issues 21 (thấp — thấy được qua probe metadata, không đưa vào bài vì
  dễ đọc sai ý nghĩa).
- PaperBench numbers (75,9% human-expert subset / 84,8% commercial / 73,5%
  scientific-coding vs PaperCoder 51,1%...) là TỰ BÁO CÁO trong paper nhóm
  (arXiv 2512.07921) — bài phải ghi rõ tính tự báo cáo.
