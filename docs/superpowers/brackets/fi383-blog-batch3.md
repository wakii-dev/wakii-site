# Story: FI-383 — Blog batch 3 — 50 bài deep-dive top repo GitHub (learn-in-public)

Destination: story/fi383-blog-batch3

## SF-1 Research infra — matrix + claims third-party
Tier: 0
linear:
Design: none
What: hạ tầng batch 3 — matrix 50 repo table-format commit (reconcile từ landscape 51 − watermarks-remover, pubDate 10-01→10-25 2/ngày), lint MATRIX_FILES append + lint marker check scoped batch-3 (VI `## Wakii học được gì` / EN `## What Wakii learns` — 64 bài cũ miễn) + lint scoped-FORBIDDEN mechanism (per-slug scope syntax, cả 2 scripts cùng kết quả) + lint pubDate-vs-matrix check, audit 6 điểm refresh (T7 want 20/44/50/114 + FAMILIES scope + owner mapping batch-3), claims-registry third-party convention license-safe + evidence-pack cùng commit, probe script commit vào scripts/, issue body contract rubric. Demo: lint chặn bài batch-3 thiếu marker/sai band/claim scoped; 2 chiều PASS+FAIL đều test bằng giả lập
Depends on: —
Tasks: matrix-50-table-format-commit / lint-matrix-files-append / lint-marker-check-batch3-scoped / lint-scoped-forbidden-mechanism-both-scripts / lint-pubdate-vs-matrix-check / audit-hardcode-refresh-snapshot-114-t7-want-204450114-owner-mapping / audit-families-scope-batch12-hoạt-dated-convention-dry-run-exit / claims-third-party-convention-license-safe-evidence-pack-cung-commit / probe-script-commit-scripts / style-guide-template-wakii-hoc-duoc / issue-body-contract-rubric / digest-skeleton-50-repos-path-pinned-research-digests-batch3-per-repo / runbook-update-batch3 / docs-comment-contracts
Exit edges: matrix commit TRƯỚC lint append + audit refactor; claims convention TRƯỚC content SFs; write-ownership: editorial docs CHỈ SF-1 ghi

## SF-2 PILOT — 12 repo lớn + template lock
Tier: 1
linear:
Design: none
What: 12 bài pilot đủ mọi nhóm (5 harness lớn: deepseek-harness, opencode, claude-code†, gemini-cli, cline · 2 inference: ollama, llama.cpp · 2 MCP: servers†, awesome-mcp-servers · zed†, langchain · fzf) — mỗi bài: research gh api stars/releases + đọc README/code → viết 900-1400 từ VI + EN mirror cùng commit → section "Wakii học được gì" (grading ADOPT/DIRECTION/WATCH public) → ADOPT issue DRAFT. Cuối SF: chốt template (coordinator ACK) — chuẩn SF-3/4/5. 5 flagship kèm heroImage + render. License † cấm "open-source"
Depends on: SF-1
Tasks: 12× repo-post-<tên>-full-pipeline-5-flagship-kèm-heroImage / hero-render-5-flagship / template-lock-wakii-hoc-section-ACK-coordinator / adopt-issue-drafts-12 / research-digests-commit-12-pilot-and-consistency-pass

## SF-3 Harness + MCP remainder — 10 bài
Tier: 2
linear:
Design: none
What: 10 bài theo template đã chốt: OpenHands, goose, aider, crush, grok-build (harness remainder) + registry†, mcp-for-beginners, mcp-chrome, codebase-memory-mcp, headroom (MCP remainder) — research → VI+EN mirror → grading section → ADOPT issue draft. Không có flagship hero. Demo: 10 bài EN+VI theo template
Depends on: SF-1, SF-2
Tasks: 10× repo-post-<tên>-template / series-harness-mcp-consistency-pass

## SF-4 Multi-agent + inference remainder — 14 bài
Tier: 2
linear:
Design: none
What: 14 bài theo template: langchain, MetaGPT, autogen, crewAI, nanobot, Qwen-Agent, camel, openai-agents-python, DeepCode, pydantic-ai (multi-agent ×9) + vllm, exo, jan† (inference ×3) + fzf, ast-grep (terminal ×2 — fzf kèm heroImage + render). Demo: 14 bài EN+VI theo template
Depends on: SF-1, SF-2
Tasks: 14× repo-post-<tên>-template-ollama-llama-cpp-fzf-kèm-heroImage / hero-render-2 / series-agent-inference-consistency-pass

## SF-5 Editors + terminal + misc — 14 bài
Tier: 2
linear:
Design: none
What: 14 bài theo template: continue, helix, lapce, tabby†, code-server, OpenBot, cumora (editors ×7) + ripgrep, bat, starship, yazi (terminal ×4) + dsh-desktop, ASu-skills, unlazy (misc ×3). Không flagship hero. Demo: 14 bài EN+VI theo template
Depends on: SF-1, SF-2
Tasks: 14× repo-post-<tên>-template / series-editors-terminal-consistency-pass

## SF-6 Convergence — 120 slug + file ADOPT issues
Tier: 3
linear:
Design: none
What: 120 slug × 2 locales (240 post pages) release-ready — strict coverage assert 100 file mới (chống silent scope shrink), T7 pendingRows == 0, band sweep 50 mới, claims sweep third-party, links resolve locale e2e, RSS ~240 items bilingual, sitemap/hreflang full, JSON-LD 120 slug, listing flat 120 render EN+VI, 6 category pages audit + **file TẤT CẢ ADOPT issues tập trung** (selection ADOPT-trước-DIRECTION theo grading distribution, rubric SF-1, link bài post) + probe-recheck repos GONE/renamed/archived + browser walkthrough EN+VI mỗi nhóm + review độc lập + release readiness. Demo: audits exit 0, issues đã file kèm link post, walkthrough pass
Depends on: SF-2, SF-3, SF-4, SF-5
Tasks: strict-coverage-assert-100-files-new-t7-pendingrows-0 / lint-parity-green-120 / band-sweep-50-new / claims-sweep-third-party / links-resolve-locale-e2e / rss-sitemap-hreflang-full-scale-240 / jsonld-audit-120-slug / listing-flat-120-render-en-vi / category-pages-audit / adopt-issues-file-converged-rubric-selection-adopt-first / probe-recheck-gone-renamed-archived / browser-walkthrough-en-vi / independent-review-verdict / release-readiness-build-smoke
