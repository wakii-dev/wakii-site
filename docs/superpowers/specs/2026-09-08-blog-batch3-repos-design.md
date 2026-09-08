# Spec — Blog batch 3: 50 bài deep-dive top repo GitHub (learn-in-public)

Umbrella: FI-365 (Blog 100 bài). User directive: "Tìm kiếm tri thức từ github để wakii học hỏi" + "xem có gì áp dụng được cho wakii thì tạo issue trên github".
Baseline: main @ `fa3e49f`/origin `bca4ea1` (batch 2 merged PR #5; 70 slugs live trên prod).
Nền editorial tái dùng 100%: lint all-non-seed (FI-373 SF-1 refactor — **batch 3 chỉ cần commit matrix mới, manifest tự phủ**), style guide, claims registry, heroes parameterize, taxonomy, JSON-LD/og.

## IDEA-BRIEF

- **Task**: 50 bài deep-dive — mỗi bài 1 repo từ landscape map: repo làm gì · architecture · release cadence · **"Wakii học được gì"** (grading ADOPT/DIRECTION/WATCH/N/A public trong bài).
- **Output**: 50 slug × EN/VI ≈ 100 trang bài mới → tổng ~120 slug × 2 = 240 trang blog. + ADOPT issues tập trung trên `wakii-dev/wakii`.
- **Users**: độc giả dev/product; maintainers của Wakii (learning loop); crawlers.
- **Constraints (MUST)**: contracts pinned; style guide FI-359 (900-1400 từ VI + EN mirror cùng commit; hard-fail 1470); **third-party claims license-safe** (paraphrase + link; stars kèm retrieval date; repo license "none/NOASSERTION" → gọi "công khai trên GitHub" KHÔNG gọi "open-source"); grading so product surface THẬT (đọc docs/config trước).
- **Success criteria**: 50 bài × 2 locale đạt band, mỗi bài có section "Wakii học được gì" + ≥1 docs link + retrieval dates trên mọi số; ADOPT issues được file tập trung; build + parity + lint (matrix batch-3) xanh; walkthrough EN+VI.
- **Out-of-scope**: đổi URL/contracts cũ, pagination, MDX, hero cho mọi bài (subset flagship), research ngoài GitHub landscape list.

## DECISIONS (P0 + user 2026-09-08)

| # | Decision | Chốt |
|---|---|---|
| D1 | Cấu trúc | **Direction B — 2 đợt trong 1 story**: PILOT 12 repo (mỗi nhóm ≥1, repo lớn dễ viết) → chốt template section "Wakii học được gì" + issue contract → 38 remainder theo template |
| D2 | Matrix | **50 repo CHỐT CỨNG** — drop `watermarks-remover` (off-topic agentic) khỏi 51 rows của landscape post. 49 còn lại alive, none archived (probe 2026-09-08, `/tmp/repos-probe-clean.txt` — số liệu copy vào matrix file) |
| D3 | Lint scope | **Commit matrix batch-3 + append `topic-matrix-batch3.md` vào `MATRIX_FILES`** trong `check-blog-content.mjs` (P0: briefing "tự phủ" là SAI — manifest derive từ matrix files, dòng 57-93) |
| D4 | Grading public | **Section "Wakii học được gì" là NỘI DUNG bài** — lint-enforced CHỈ trên slug batch-3 (scope theo matrix origin), marker: VI file `## Wakii học được gì` / EN file `## What Wakii learns`, heading level `##`; grade so product surface thật; ACP/strategic forks → ghi WATCH trong bài, decision lớn flag epic |
| D5 | ADOPT issues | **SF-6 file TẬP TRUNG** sau review (user chọn) — rubric body contract: inline evidence + retrieval dates + upstream links + link bài post (KHÔNG link path nội bộ site repo); ước 5-10 issues |
| D6 | Ngôn ngữ | VI primary (900-1400 từ) + EN mirror cùng commit — như batch 1-2 |
| D7 | Cadence | 2 bài/ngày — pubDate **10-01 → 10-25** (50 bài ÷ 2 = 25 ngày; tiếp mạch batch-2 kết thúc 09-30) |
| D8 | License claims | 6 slug license none/NOASSERTION (claude-code†, zed†, tabby†, mcp-registry†, mcp-servers†, jan†) → cấm "open-source"/"mã nguồn mở" **CHỈ trên 6 slug này** (scoped enforcement — không grep toàn cục, tránh fail 64+ bài cũ đang green); các bài khác dùng tự do |
| D9 | Hero | Subset flagship ~10 (mỗi nhóm ≥1) — render thuộc content SF sau khi bài tồn tại (pipeline FI-373) |

## MATRIX 50 REPO (CHỐT CỨng — reconcile từ landscape post: 51 rows − watermarks-remover; stars/probe 2026-09-08; pubDate 10-01→10-25, 2/ngày)

Slugs theo pattern `deep-dive-<owner>-<name>`. License `none/NOASSERTION` (†) → cấm claim "open-source", dùng "công khai trên GitHub". Cột phụ `hero` (flagship ✓/trống) — 10 flagship: 5 harness lớn + ollama + servers + zed + langchain + llama.cpp + fzf.

**Harness ×10**: deepseek-ai/deepseek-harness (215k★) · anomalyco/opencode (205k★) · anthropics/claude-code† (144k★) · google-gemini/gemini-cli (106k★) · OpenHands/OpenHands (86k★) · cline/cline (67k★) · aaif-goose/goose (54k★) · Aider-AI/aider (48k★) · charmbracelet/crush (27k★) · xai-org/grok-build (26k★)
**Multi-agent ×10**: langchain-ai/langchain (145k★) · FoundationAgents/MetaGPT (70k★) · microsoft/autogen (60k★, CC-BY-4.0) · crewAIInc/crewAI (58k★) · HKUDS/nanobot (47k★) · openai/openai-agents-python (29k★) · QwenLM/Qwen-Agent (17k★) · pydantic/pydantic-ai (19k★) · camel-ai/camel (17k★) · HKUDS/DeepCode (16k★)
**MCP ×7**: modelcontextprotocol/servers† (90k★) · punkpeye/awesome-mcp-servers (94k★) · headroomlabs-ai/headroom (70k★) · DeusData/codebase-memory-mcp (42k★) · microsoft/mcp-for-beginners (17k★) · modelcontextprotocol/registry† (7k★) · hangwin/mcp-chrome (12k★)
**Editors ×9**: zed-industries/zed† (89k★) · coder/code-server (79k★) · continuedev/continue (35k★) · helix-editor/helix (46k★, MPL) · lapce/lapce (38k★) · TabbyML/tabby† (33k★) · neovim/neovim (102k★) · CopilotKit/OpenBot (4k★) · yetone/cumora (3.5k★)
**Local inference ×5**: ollama/ollama (180k★) · ggml-org/llama.cpp (127k★) · vllm-project/vllm (91k★) · exo-explore/exo (47k★) · janhq/jan† (44k★)
**Terminal tooling ×6**: junegunn/fzf (82k★) · BurntSushi/ripgrep (68k★) · sharkdp/bat (60k★) · starship/starship (59k★) · sxyazi/yazi (42k★) · ast-grep/ast-grep (15k★)
**Misc ×3**: anywhere-labs/dsh-desktop (24k★) · Hisn00w/ASu-skills (3.9k★) · Leonxlnx/unlazy (3.1k★)
**Dropped**: guillaumemeyer/watermarks-remover (off-topic agentic)

## SF breakdown (Direction B — pilot → scale; content SFs đồng nhất post-tasks theo thiết kế — anti-duplicate áp cho RESEARCH/lint/audit, không áp cho post-tasks cùng mẫu)

### SF-1 Research infra — matrix + claims third-party (Tier 0)
**What**: hạ tầng batch 3 — matrix 50 repo table-format commit + lint `MATRIX_FILES` append, claims-registry mở rộng **third-party claims convention** (style "theo GitHub API ngày N" + license-safe rules + FORBIDDEN "open-source" cho license none/NOASSERTION), style-guide thêm template section "Wakii học được gì" + issue body contract rubric, probe script commit vào `scripts/` (probe-repos chuẩn hoá từ /tmp), research digest 50 repo skeleton. Demo data-level: lint chặn bài batch-3 giả lập sai band/claim sai; matrix parse được bởi lint + audit.
**Depends on**: —
**Tasks (13)**: matrix-50-table-format-commit / lint-matrix-files-append / lint-marker-check-batch3-scoped / lint-scoped-forbidden-mechanism-both-scripts / lint-pubdate-vs-matrix-check / audit-hardcode-refresh-snapshot-114 / audit-families-scope-batch12-or-dated-convention / claims-third-party-convention-license-safe-evidence-pack-cung-commit / style-guide-template-wakii-hoc-duoc / issue-body-contract-rubric / probe-script-commit-scripts / digest-skeleton-50-repos-path-pinned-research-digests-batch3-per-repo / runbook-update-batch3
**Exit criteria enforcement (2 chiều — mỗi cơ chế PASS + FAIL đều test bằng bài giả lập)**:
- Marker check: bài batch-3 thiếu `## Wakii học được gì` (vi/) / `## What Wakii learns` (en/) → lint exit 1; đủ → pass; 64 bài batch-1/2 KHÔNG bị yêu cầu marker (scope theo matrix origin — `planned.set(..., { file })` đã có dữ liệu nguồn)
- Scoped FORBIDDEN: dòng `- "open-source" — scope: deep-dive-anthropics-claude-code,...` (syntax per-slug trong claims-registry) → FAIL CHỈ trên †-repo giả lập; 8 bài cũ chứa "open source" vẫn xanh; **check-blog-content.mjs VÀ audit T3(a) cùng kết quả** (parser hiện dừng ở `## ` đầu tiên — phải hỗ trợ scoped entries)
- FAMILIES false-positive: nhóm `seed-posts=10`/`clis=24` giới hạn scope batch-1/2 slugs HOẶC convention "số thứ tự loạt bài kèm mốc ngày" — exit = audit dry-run trên 1 bài batch-3 giả lập chứa "50 bài" không FAIL giả
- Lint thêm check `fields.pubDate === matrix row pubDate` (bắt sai ngày ở content SF thay vì 3 tier sau)
- Write-ownership: claims-registry.md / style-guide.md / matrix files = CHỈ SF-1 ghi; content SFs READ-ONLY (tránh merge conflict Tier 2)
**Exit edges**: matrix commit TRƯỚC lint append; claims convention TRƯỚC content SFs.
**Exit criteria bổ sung (plan-critic)**: T7 want-counts mới = 20/44/50/114 (non-seed per matrix) — pin con số vào audit refactor; matrix row format khớp 4-cột prefix `| N | \`slug\` | cat | pubDate |` (lệch = "parsed 0 rows" exit 1); `owner()` mapping thêm batch-3.

### SF-2 PILOT — 12 repo lớn (Tier 1) + template lock
**What**: 12 bài pilot đủ mọi nhóm: 5 harness lớn (deepseek-harness, opencode, claude-code†, gemini-cli, cline) + 2 inference (ollama, llama.cpp) + 2 MCP (servers†, awesome-mcp-servers) + 2 (zed†, langchain) + 1 terminal (fzf). Mỗi bài: research (gh api stars/releases + đọc README/code) → viết VI+EN mirror → section "Wakii học được gì" (grading public) → ADOPT issue DRAFT (chưa file). Cuối SF: **chốt template** (section + issue draft format) — coordinator ACK (Linear comment) trước khi mở khóa SF-3/4/5. Demo: 12 bài EN+VI đúng band, mỗi bài có grading section, 12 issue draft trong `docs/superpowers/editorial/research/adopt-drafts/`.
**Depends on**: SF-1
**Tasks (15)**: 12× repo-post-<tên>-full-pipeline (5 flagship kèm heroImage-wiring-2-locale) / hero-render-5-flagship / template-lock-wakii-hoc-section-ACK-coordinator / adopt-issue-drafts-12 / research-digests-commit-12-pilot-and-consistency-pass

### SF-3 Harness + MCP remainder — 10 bài (Tier 2)
**What**: 10 bài theo template pilot: OpenHands · goose · aider · crush · grok-build (harness remainder) + registry† · mcp-for-beginners · mcp-chrome · codebase-memory-mcp · headroom (MCP remainder). Mỗi bài: research → VI+EN → grading section → ADOPT issue draft (path `docs/superpowers/editorial/research/adopt-drafts/`). Demo: 10 bài EN+VI theo template, drafts đầy đủ.
**Depends on**: SF-1, SF-2
**Tasks (11)**: 10× repo-post-<tên>-template / series-harness-mcp-consistency-pass

### SF-4 Multi-agent + inference remainder — 14 bài (Tier 2)
**What**: 14 bài theo template: langchain · autogen · crewAI · nanobot · Qwen-Agent · camel · openai-agents-python · DeepCode · pydantic-ai (multi-agent ×9) + vllm · exo · jan† (inference ×3) + fzf · ast-grep (terminal ×2). Mỗi bài: research → VI+EN → grading → ADOPT issue draft. Demo: 14 bài EN+VI theo template.
**Depends on**: SF-1, SF-2
**Tasks (15)**: 14× repo-post-<tên>-template (ollama + llama.cpp kèm heroImage-wiring-2-locale) / hero-render-2 / series-agent-inference-consistency-pass

### SF-5 Editors + terminal + misc — 14 bài (Tier 2)
**What**: 14 bài theo template: continue · helix · lapce · tabby† · code-server · OpenBot · cumora (editors ×7) · ripgrep · bat · starship · yazi (terminal ×4) · dsh-desktop · ASu-skills · unlazy (misc ×3). Mỗi bài: research → VI+EN → grading → ADOPT issue draft. Demo: 14 bài EN+VI theo template.
**Depends on**: SF-1, SF-2
**Tasks (15)**: 14× repo-post-<tên>-template (fzf kèm heroImage-wiring-2-locale) / hero-render-1 / series-editors-terminal-consistency-pass

### SF-6 Convergence — 120 slug + file ADOPT issues (Tier 3)
**What**: toàn bộ 120 slug × 2 locales (240 post pages) release-ready (build + parity + lint all-non-seed bao gồm matrix batch-3, band sweep 50 mới, claims sweep 3 registry) + **file ADOPT issues tập trung** theo rubric SF-1 (review drafts → file lên wakii-dev/wakii, label enhancement, link bài post) + browser walkthrough EN+VI mẫu mỗi nhóm repo + release readiness. Demo: audits exit 0, issues đã file kèm link, walkthrough pass.
**Depends on**: SF-2, SF-3, SF-4, SF-5
**Tasks (14)**: lint-parity-green-120 / band-sweep-50-new / claims-sweep-third-party / links-resolve-locale-e2e / rss-sitemap-hreflang-full-scale-240 / jsonld-audit-120-slug / listing-flat-120-render-en-vi / category-pages-audit / strict-coverage-assert-100-files-new-t7-pendingrows-0 / adopt-issues-file-converged-rubric-selection-adopt-first / probe-recheck-gone-renamed-archived / browser-walkthrough-en-vi / independent-review-verdict / release-readiness-build-smoke
**Exit criteria SF-6**: (a) assert 100 file mới (50×2) tồn tại — chống silent scope shrink (lint partial-by-design + T7 pendingRows chỉ NOTE) (b) ADOPT issue selection: ADOPT-trước-DIRECTION ( grading distribution review từ pilot) (c) issue link post — post lên prod khi story merge (window 404 ngắn chấp nhận build-in-public, ghi trong issue)

## Risks

1. **Research depth 50 repos** — mỗi bài cần đọc README/code thật; repo lớn dư content, repo nhỏ (3-4k★) có thể mỏng → pilot quyết drop-list trước scale (D1).
2. **Third-party claims** — stars/releases di chuyển: mọi số kèm "theo GitHub API ngày N"; license none/NOASSERTION cấm gọi open-source (D8).
3. **Repo biến mất/rename giữa research và publish** — probe lại trước merge (SF-6); GONE → draft:true hoặc bỏ.
4. **ADOPT issues public** — lộ hướng product; user đã chọn build-in-public (2026-09-07) + file tập trung ở SF-6 sau review.
5. **EN mirror 50 × ≥800 từ** — workload lớn nhất; mỗi SF tự chịu mirror cùng commit (runbook), convergence chỉ audit.

## Boundary (KHÔNG làm)

Pagination · category enum thứ 4 · MDX · hero cho mọi bài (subset ~10) · research ngoài GitHub landscape list · file ADOPT issue rải rác giữa story (SF-6 tập trung) · đổi contracts pinned.
