# ADOPT selection — SF-6 convergence (FI-389), 2026-09-08

Selection ADOPT-trước-DIRECTION theo grading distribution (50 bài batch-3:
33 ADOPT · 40 DIRECTION · 42 WATCH · 30 N/A grade-bullet EN). 33 drafts ↔
33 bài có ADOPT chính; 17 bài chỉ WATCH/N-A → không draft, không issue.
Converge 33 patterns → **10 issues** theo surface chung (spec D5 "ước 5-10");
issue body = rubric style-guide §10 (pattern + evidence inline + đề xuất +
upstream links + link bài post, không link path nội bộ). Label `enhancement`
trên `wakii-dev/wakii`.

## Đã file (mapping draft → issue)

| # | Issue | Drafts gộp |
|---|-------|-----------|
| 1 | [wakii#14](https://github.com/wakii-dev/wakii/issues/14) — Checkpoint git + rollback transactional | Aider-AI-aider · cline-cline |
| 2 | [wakii#15](https://github.com/wakii-dev/wakii/issues/15) — Permission profile máy đọc trước khi chạy | anomalyco-opencode · google-gemini-gemini-cli |
| 3 | [wakii#16](https://github.com/wakii-dev/wakii/issues/16) — Hand-off schema-validated giữa agents | pydantic-pydantic-ai · foundationagents-metagpt · langchain-ai-langchain |
| 4 | [wakii#17](https://github.com/wakii-dev/wakii/issues/17) — Memory freshness stamp + over-preserve error lines | DeusData-codebase-memory-mcp · headroomlabs-ai-headroom |
| 5 | [wakii#18](https://github.com/wakii-dev/wakii/issues/18) — Catalog integrity: chặn trùng id + capability check | qwenlm-qwen-agent · neovim-neovim |
| 6 | [wakii#19](https://github.com/wakii-dev/wakii/issues/19) — Mutation queue tuần tự cho shared state | modelcontextprotocol-servers |
| 7 | [wakii#20](https://github.com/wakii-dev/wakii/issues/20) — Notification focus-aware | charmbracelet-crush |
| 8 | [wakii#21](https://github.com/wakii-dev/wakii/issues/21) — Confidence scoring review đa agent | anthropics-claude-code |
| 9 | [wakii#22](https://github.com/wakii-dev/wakii/issues/22) — Guard advisory có nhãn + reject-reason log | deepseek-ai-deepseek-harness · camel-ai-camel |
| 10 | [wakii#23](https://github.com/wakii-dev/wakii/issues/23) — Bounded rewrite có cổng dẫn | microsoft-autogen |

## Không file (draft còn lại — lý do)

- **aaif-goose-goose** (injection boundary trong workflow docs) — docs-guardrail, tier dưới 10 đã chọn; đề xuất lẻ không gộp được.
- **anthropics-claude-code** phần silent-failure-hunter — đã trích bổ trợ trong wakii#21.
- **ast-grep-ast-grep** + **openai-openai-agents-python** (gate máy exit-code) — story-verify + audit scripts hiện có đã hiện thực pattern; không đề xuất mới đáng issue.
- **charmbracelet-crush** phần presence/multi-select gates — DIRECTION, ngoài ADOPT chính (wakii#20 chỉ ADOPT focus-aware).
- **crewaiinc-crewai** (role interpolation per-run) — lớp nội suy chưa có use case thật trong kit.
- **exo-explore-exo** (self-registration UDP) — mô hình mạng device-level, không khớp surface Wakii hiện có.
- **ggml-org-llama-cpp** (understand-before-merge convention) — nguyên tắc quy trình, đã hiện thực bằng review chain + gates.
- **hkuds-deepcode** (release notes theo merge) — đề xuất repo-ops cho wakii-dev/wakii, tier thấp; ghi nhận ở đây đủ.
- **hkuds-nanobot** (đếm surface bằng script) — audit scripts hiện có đã làm đúng pattern.
- **janhq-jan** (privacy-by-architecture) — kiến trúc local-first, không khớp product cloud IDE.
- **junegunn-fzf** (fuzzy filter contract) — CLI UX pattern, không có surface đích cụ thể trong kit hiện tại.
- **microsoft-mcp-for-beginners** (docs curriculum) — docs tier; overlap wakii#23 về surface cũ/mới.
- **microsoft-mcp-for-beginners** / **punkpeye-awesome-mcp-servers** (legend schema cho listing) — blog listing hiện dùng category filter; đề xuất trình bày, không phải enhancement product.
- **ollama-ollama** (report real number / return 0) — nguyên tắc giá trị, đã hiện thực trong audit snapshot contract (không nguồn = không đăng).
- **OpenHands-OpenHands** ("not responsible for" boundary docs) — docs-only, gọn nhưng tier dưới; có thể file sau nếu product muốn.
- **vllm-project-vllm** (speculative decoding / KV reuse) — N/A surface Wakii (không tự host model).
- **zed-industries-zed** (kênh -pre trước stable) — release-cadence cho product desktop, chưa có pipeline release đủ dày để áp.
- **anomalyco-opencode** phần subagent `@general` — gộp trong wakii#15 evidence chính.

## Kết quả

- 10 issues đã file trên `wakii-dev/wakii`, label `enhancement`, link bài post
  ghi rõ window 404 ngắn trước story merge (build-in-public đã duyệt 2026-09-07).
- Link từng issue được comment lên FI-389 (audit comment cuối SF).
