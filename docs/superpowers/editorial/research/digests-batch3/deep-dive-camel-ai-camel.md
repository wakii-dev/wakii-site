# camel-ai/camel — research digest (batch-3, matrix #34)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: camel-ai/camel
- facet: multi-agent
- stars @ 2026-09-08: 17685
- license (GitHub API 2026-09-08): Apache-2.0
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`)

## Research notes (điền 2026-09-08 — SF-4/FI-387)

- pushed_at: 2026-09-07T06:24:13Z · archived: false (GitHub API 2026-09-08)
- HEAD master: `8c791b7b9cf7deab56cb5a92818c34499af9097f` (commits API 2026-09-08)

### README notes

- README tự mô tả: community "finding the scaling laws of agents"; paper gốc
  link arXiv 2303.17760 ngay trong README nav.
- Design principles: Evolvability · Scalability ("millions of agents") ·
  Statefulness · Code-as-Prompt.
- 3 use-case chính: Data Generation (`camel/datagen/*`), Task Automation
  (`camel/societies/role_playing.py` + `workforce/`), World Simulation
  (repo rời camel-ai/oasis).
- Synthetic Datasets section: 6 nhóm dataset trên Hugging Face — AI Society
  (chat + instruction + translated), Code (chat + instruction), Math/Physics/
  Chemistry/Biology (chat). KHÔNG có số sample trong README → bài không cite số.
- Research projects rẽ nhánh: OWL, OASIS, CRAB, Loong, Agent Trust, Emos.
- Demo gốc trong README: hai agent "a python programmer and a stock trader
  collaborating on developing a trading bot" (dùng làm quote trong bài, 13 từ).

### Architecture (code đọc thật @ HEAD 8c791b7)

- `camel/societies/role_playing.py` — 853 dòng; class `RolePlaying`: 2 tham số
  bắt buộc `assistant_role_name`/`user_role_name`; optional task-specify
  (default ON), task-planner, critic-in-the-loop; default
  `task_type: TaskType.AI_SOCIETY` (trùng tên dataset → hội thoại sinh để thành
  dữ liệu ngay từ thiết kế).
- `camel/societies/workforce/` — 14 file: task_channel.py,
  workforce_metrics.py, workflow_memory_manager.py (orchestration có metrics).
- `camel/datagen/` — 5 pipeline: cot_datagen.py, evol_instruct/,
  self_improving_cot.py, self_instruct/, source2synth/.
- `SelfInstructPipeline` (self_instruct.py, 445 dòng): 5 filter mặc định
  (length, keyword, punctuation, non_english, rouge_similarity); vòng generate
  `while` + `instruction_filter.filter()` → đạt nhận, fail `logger.warning`
  "Instruction failed filters. Skipping instruction"; `human_to_machine_ratio`
  default (6, 2).
- `camel/benchmarks/` — 7 entry: gaia.py, browsecomp.py, ragbench.py,
  apibank.py, apibench.py, nexus.py, mock_website/; `BaseBenchmark(ABC)` chuẩn
  hoá name/data_dir/save_to/processes.

### Releases (GitHub API 2026-09-08)

- v0.2.91a7 2026-09-03 (cùng ngày có a6 05:12 + a7 05:28 UTC — 2 alpha bump)
- v0.2.91a5 2026-07-13 · v0.2.91a4 2026-04-30 · v0.2.90 2026-03-22
- Cadence: thưa, không đều, gắn cột mốc; code push hằng ngày (pushed 09-07).

### Wakii grading (style-guide §8)

- **ADOPT** — chất lượng là bộ lọc máy trước kho (SelfInstruct filter-chain +
  reject-log): Wakii đã áp ở convergence QA (lint + audit gates); đề xuất
  completion: log reject-reason vào NOTE của audit → adopt-draft-camel-ai-camel.
- **DIRECTION** — benchmark như module tái chạy (BaseBenchmark khuôn cố định):
  suite kịch bản story-workflow fixture replay mỗi lần sửa workflow.
- **WATCH** — synthetic role-play traces để test quy mô; promote khi cần
  regression nhanh hơn real-run thật sự xuất hiện.
- **N/A** — scaling-law / mô phỏng hàng triệu agent: khác cấp bài toán Wakii
  (workflow cho 1 dev).

### Angle đã viết (khác facet siblings)

- Data-as-product + eval-mindedness: hội thoại role-play là phương pháp sinh
  dữ liệu (không phải khai báo vai crewAI-style); filter trước kho; benchmark
  trong thư viện; dataset phát hành công khai. KHÔNG đụng góc
  declarative-roles / handoff / typed-contract / SOP-artifact.
