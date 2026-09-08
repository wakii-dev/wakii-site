# FI-383 SF-4 — Multi-agent + inference remainder (14 bài) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 14 bài deep-dive repo (matrix rows 23-36) × EN+VI theo template batch-3 — section grading `## Wakii học được gì` public — digests + ADOPT drafts — reviews độc lập — merge `story/fi383-blog-batch3` — FI-387 Done.

**Architecture:** Content-only SF. Mỗi bài = 1 cặp VI+EN cùng commit (executor viết file, coordinator commit — chống race git index trên cây chung). Research gh api thật kèm retrieval date; lint + parity + audit là gate máy; review nhóm + security-audit là gate người-máy; Rule 0 browser verify trên dist trước merge.

**Tech Stack:** Astro 5 static · markdown content collections · node lint scripts (check-blog-content.mjs) · gh api research · task-executor fan-out ≤3 slot.

**Linear Issue:** FI-387 ([SF-4] Multi-agent + inference remainder — 14 bài — Blog batch 3 (FI-383))

---

## Ground truth — 14 rows (matrix `topic-matrix-batch3.md` rows 23-36, CHỐT CỨNG)

| T | # | slug | facet | pubDate | repo | constraint riêng |
|---|---|------|-------|---------|------|------------------|
| T1 | 23 | `deep-dive-neovim-neovim` | editors | 2026-10-12 | neovim/neovim (102k★) | license NOASSERTION (probe 09-08) → license-safe "công khai trên GitHub", KHÔNG "open-source"/"mã nguồn mở" (review-enforced, ngoài 6 † machine-scope) |
| T2 | 24 | `deep-dive-vllm-project-vllm` | inference | 2026-10-12 | vllm-project/vllm (91k★) | Apache-2.0 |
| T3 | 25 | `deep-dive-foundationagents-metagpt` | multi-agent | 2026-10-13 | FoundationAgents/MetaGPT (70k★) | — |
| T4 | 26 | `deep-dive-microsoft-autogen` | multi-agent | 2026-10-13 | microsoft/autogen (60k★) | license CC-BY-4.0 (ghi đúng theo probe) |
| T5 | 27 | `deep-dive-crewaiinc-crewai` | multi-agent | 2026-10-14 | crewAIInc/crewAI (58k★) | — |
| T6 | 28 | `deep-dive-hkuds-nanobot` | multi-agent | 2026-10-14 | HKUDS/nanobot (47k★) | — |
| T7 | 29 | `deep-dive-exo-explore-exo` | inference | 2026-10-15 | exo-explore/exo (47k★) | — |
| T8 | 30 | `deep-dive-janhq-jan` | inference | 2026-10-15 | janhq/jan (44k★) | **† scoped FORBIDDEN machine-enforced**: "open-source" + "mã nguồn mở" CẤM ở mọi vị trí (kể cả title/description) |
| T9 | 31 | `deep-dive-openai-openai-agents-python` | multi-agent | 2026-10-16 | openai/openai-agents-python (29k★) | — |
| T10 | 32 | `deep-dive-pydantic-pydantic-ai` | multi-agent | 2026-10-16 | pydantic/pydantic-ai (19k★) | — |
| T11 | 33 | `deep-dive-qwenlm-qwen-agent` | multi-agent | 2026-10-17 | QwenLM/Qwen-Agent (17k★) | — |
| T12 | 34 | `deep-dive-camel-ai-camel` | multi-agent | 2026-10-17 | camel-ai/camel (17k★) | — |
| T13 | 35 | `deep-dive-hkuds-deepcode` | multi-agent | 2026-10-18 | HKUDS/DeepCode (16k★) | — |
| T14 | 36 | `deep-dive-ast-grep-ast-grep` | terminal | 2026-10-18 | ast-grep/ast-grep (15k★) | — |

Hero: **không có** (11 flagship đều rows 1-12, SF-2 — matrix header REQUIREMENT-GAP resolution). Facet SF-4: multi-agent ×9 · inference ×3 · editors ×1 · terminal ×1 = 14.

## Shared per-post contract (áp cho T1-T14 — executor đọc đủ 4 nguồn trước khi viết)

**Nguồn pháp lý:** style-guide.md (§1 cấu trúc · §2 band D1 · §8 template grading) · claims-registry.md (§Third-party claims — batch-3) · runbook.md (§Batch-3 quy trình 1 bài) · topic-matrix-batch3.md (row của mình).

**Quy trình 1 bài (runbook batch-3):**
1. **Research thật** (không trí nhớ): `bash scripts/probe-repos.sh` (stars/pushed/license @ ngày chạy) → `gh api repos/<o>/<r>/readme` → releases `?per_page=10` (cadence = số release 90 ngày + tag mới nhất + ngày) → 1-2 file code chính qua contents API (trích ngắn + link `github.com/<o>/<r>/blob/<sha>/<path>`, sha = HEAD default branch hôm nay). **Gotcha bắt buộc:** `if ! out=$(gh api ...) || [ -z "$out" ]; then` — gh api lỗi in JSON vào stdout KÈM exit≠0; không tin stdout không exit-status.
2. **Điền digest skeleton** `docs/superpowers/editorial/research/digests-batch3/<slug>.md` — mọi TODO, số kèm "theo GitHub API ngày 2026-09-08", KHÔNG bịa.
3. **VI draft + EN mirror** — 2 file `src/content/blog/{vi,en}/<slug>.md`:
   - Frontmatter 6 field LOCKED: `title` (<70 ký tự) · `description` (1-2 câu) · `pubDate: "<ngày matrix>"` CHÍNH XÁC · `category: "tech"` · `tags` 2-4 TỪ VOCAB style-guide §5 (thêm mới = tự chế, cấm) · `draft: false`. VI/EN cùng nghĩa, cùng ngày/category/tags.
   - Cấu trúc: hook 1 đoạn (3-5 câu, không "In today's world") → `TL;DR:` 3-5 bullet → **3-5 H2** (wording cụ thể; mỗi section ≥1 evidence block: ASCII diagram / bảng / transcript / quote có nguồn) → đoạn nối docs 1-2 câu + link → section grading (marker, dưới) → CTA nhẹ 1-2 câu.
   - Band D1 (prose bỏ fenced, split `/\s+/`): **VI 900-1400** (warn >1400, FAIL >1470) · **EN ≥800**. Fenced KHÔNG đếm — độn bằng diagram là FAIL band Intent.
   - Marker grading level `##` EXACT, đặt CUỐI bài trước CTA: VI `## Wakii học được gì` · EN `## What Wakii learns`. Nội dung = grading **ADOPT/DIRECTION/WATCH/N/A** so product surface THẬT của Wakii (docs/config trước khi grade), mỗi grade ≥1 lý do trỏ evidence trong bài. ADOPT có kỷ luật — chỉ khi đề xuất cụ thể (seeding ADOPT issue).
   - Claims: mọi số third-party kèm "theo GitHub API ngày 2026-09-08"; quote nguyên văn ≤25 từ + attribution + link cạnh; trích code ngắn + link blob; không "always/never"; không emoji thân bài; không "Stories tab" (dùng "story view").
   - Docs link đúng locale: VI `(/vi/docs/<X>/)` · EN `(/docs/<X>/)`, X ∈ getting-started · superpowers-panel · story-workflow · agents-and-kit · faq.
   - Cross-link ≥1 bài ĐÃ TỒN TẠI trên nhánh: VI `/vi/blog/<t>/` · EN `/blog/<t>/` — CHỈ từ danh sách candidates plan cấp (batch-1/2 + seeds). KHÔNG link sang deep-dive batch-3 khác (chưa tồn tại trên nhánh).
4. **ADOPT draft** (chỉ khi grade ADOPT): `docs/superpowers/editorial/research/adopt-drafts/adopt-draft-<owner>-<name>.md` (mkdir -p nếu chưa có) — rubric style-guide §10: Pattern / Evidence inline (kèm "theo GitHub API ngày N" NGAY TRONG issue) / Đề xuất Wakii / Upstream links. KHÔNG link path nội bộ site repo. KHÔNG tự file issue lên GitHub.
5. **Self-check trước khi báo xong:** `node scripts/check-blog-content.mjs` exit 0; tự đếm band bằng ĐÚNG method lint (prose bỏ fenced, split whitespace) và ghi số vào báo cáo. **KHÔNG commit** — coordinator commit (1 pair = 1 commit, `feat(blog): <slug> VI+EN (T<N> — matrix #<row>)`).

**Boundary T1-T14:** CHỈ ghi 2 file bài + digest của mình + adopt-draft (nếu có). KHÔNG: scripts, editorial docs (style-guide/claims/matrix/evidence-pack/runbook — FROZEN), posts khác, package.json, hero/frontmatter heroImage, issues GitHub, đổi matrix.

**Angle anti-duplicate (≥2 H2 không trùng bất kỳ bài cùng facet — batch-3 multi-agent có 9 bài trong SF này + langchain SF-2; inference có vllm/exo/jan vs ollama/llama.cpp SF-2):** angle cấp plan dưới từng task — executor bám angle, không đổi góc.

## Tasks

### T1: neovim — "editor như platform" (row 23)
- Files: `src/content/blog/vi/deep-dive-neovim-neovim.md` + EN mirror · digest `deep-dive-neovim-neovim.md`
- Angle: Lua API-as-platform (editor mở rộng thành IDE/agent host) + built-in LSP client + tính chủ động tách khỏi Vim quyết định "compatibility là API contract, không phải UI"; cộng đồng plugin-fork dynamics. LICENSE-SAFE (NOASSERTION) — "công khai trên GitHub", KHÔNG open-source/mã nguồn mở (review-enforced).
- Docs link: agents-and-kit (kit mở rộng như plugin hệ sinh thái). Cross-link candidates: `forking-an-ide-keeping-current-with-upstream` · `oss-why-fork-mit` · `zero-setup-agent-team`. Tags: `architecture`, `cli`, `terminal`.

### T2: vllm — "serving throughput" (row 24)
- Angle: PagedAttention/KV-cache quản lý như OS page-table cho LLM serving; cadence release dày (đếm thật); từ research → serving layer tiêu chuẩn. Docs: story-workflow (cadence/audit analogy). Cross: `oss-release-roundup-14x` · `arch-ci-gates`. Tags: `architecture`, `oss`.

### T3: MetaGPT — "SOP-encoded company" (row 25)
- Angle: chuẩn hoá handoff giữa roles bằng artifact có schema (SOP) chứ không chat tự do; so sánh mapping rule-based coordination với 9-agent team tách quyền. Docs: story-workflow. Cross: `nine-agents-separated-powers` · `long-tasks-bracket-tiers`. Tags: `agents`, `workflow`.

### T4: autogen — "conversation → actor runtime" (row 26)
- Angle: v0.4 rewrite từ conversation programming sang actor runtime event-driven — vì sao kiến trúc hướng sự sống khi scale; lesson về rewrite có ranh giới. Ghi license đúng theo probe (CC-BY-4.0). Docs: agents-and-kit. Cross: `nine-agents-separated-powers` · `watchdog-idle-is-not-dead`. Tags: `agents`, `architecture`.

### T5: crewAI — "role ergonomics" (row 27)
- Angle: ergonomics của role/goal/backstory — abstract vai trò thành dữ liệu khai báo; Crew vs Flow (điều khiển tuần tự khi cần). Docs: agents-and-kit. Cross: `story-memory-learning-loop` · `nine-agents-separated-powers`. Tags: `agents`, `workflow`.

### T6: nanobot — "minimal agent surface" (row 28)
- Angle: agent tối giản config-first (YAML) — độ phủ surface nhỏ nhất vẫn đủ cho tác vụ hằng ngày; trade-off minimalism vs extensibility. Docs: getting-started (zero-setup ethos). Cross: `zero-setup-agent-team` · `guide-custom-skill-101`. Tags: `agents`, `cli`.

### T7: exo — "cluster của thiết bị cá nhân" (row 29)
- Angle: distributed inference p2p trên Mac/iPhone sẵn có — partition model thay vì mua GPU; discovery/topology tự tổ chức. Docs: story-workflow (coordination analogy). Cross: `arch-relay-cloud` · `guide-cloud-relay`. Tags: `architecture`, `oss`.

### T8: jan — "local-first assistant" (row 30, †)
- Angle: local-first packaging (app desktop tự host engine) + provider abstraction đổi model không đổi UI; nit: privacy-as-default. **† scoped FORBIDDEN machine-enforced — KHÔNG "open-source"/"mã nguồn mở" ở BẤT KỲ vị trí nào (title/description/prose/tags).** Docs: getting-started. Cross: `oss-why-fork-mit` · `guide-install-update`. Tags: `architecture`, `cli`.

### T9: openai-agents-python — "primitives: handoffs + guardrails" (row 31)
- Angle: SDK tối giản 3 primitives (agents/handoffs/guardrails) + tracing first-class — đôn evidence trace như product feature; mapping sang gates-not-trust. Docs: story-workflow. Cross: `gates-not-trust-rule-zero` · `decision-gates-safe-ai-agents`. Tags: `agents`, `workflow`.

### T10: pydantic-ai — "type-safe agents" (row 32)
- Angle: validation-first — tool args/output là typed contract, lỗi bắt ở biên; FastAPI-philosophy mang sang agent. Docs: agents-and-kit. Cross: `decision-gates-safe-ai-agents` · `arch-ci-gates`. Tags: `agents`, `architecture`.

### T11: Qwen-Agent — "ecosystem-bound tool calling" (row 33)
- Angle: giá trị nằm ở gắn chặt hệ Qwen (function-calling templates + built-in tools browser/interpreter); bài học ecosystem coupling — khi nào bind-the-stack là feature. Docs: superpowers-panel. Cross: `skills-catalog-tour` · `wakii-in-production-hub-store`. Tags: `agents`, `oss`.

### T12: camel — "role-playing research at scale" (row 34)
- Angle: từ paper role-playing tới dataset/eval infrastructure — synthetic data như sản phẩm; eval-mindedness cho workflow regression. Docs: story-workflow. Cross: `convergence-qa-last-tier` · `story-memory-learning-loop`. Tags: `agents`, `qa`.

### T13: DeepCode — "papers-to-code pipeline" (row 35)
- Angle: research repo HKUDS — multi-agent pipeline biến tài liệu nghiên cứu thành code chạy được; nghi vấn sức khoẻ project (cadence/commit thật) nói thẳng trong grading. Docs: superpowers-panel. Cross: `convergence-qa-last-tier` · `blog-story-case-study`. Tags: `agents`, `oss`.

### T14: ast-grep — "AST-level machine check" (row 36)
- Angle: tìm/sửa theo cú pháp thay vì regex — YAML rules chạy trong CI như gate máy; mapping sang lint/audit scripts của Wakii (regex-hôm-nay, AST-là-hướng). Docs: story-workflow. Cross: `arch-ci-gates` · `watchdog-idle-is-not-dead`. Tags: `terminal`, `cli`.

- [ ] Mỗi task T1-T14: research → digest → VI+EN → self-lint exit 0 → báo cáo DONE (band counts + lint OK line + grading + evidence links). Coordinator commit từng pair.

### T15: Consistency pass (sau 14/14)
- [ ] `node scripts/check-blog-content.mjs` exit 0 toàn cây; ghi summary line (N files of 114 — N = file ×2 locale).
- [ ] Sweep 28 file: marker level `##` ×28 · pubDate = matrix row ×28 · ≥1 docs link ×28 · cross-link chỉ trỏ bài tồn tại · angle-dup check (2 H2 đầu mỗi bài pairwise trong facet).
- [ ] ADOPT drafts tồn tại cho mọi bài grade ADOPT; digests 14/14 filled (grep TODO còn sót = 0 trên file mình).
- [ ] `pnpm build` xanh toàn chain (parity → blog-utils → content lint → astro build) trên cây tích hợp.

### T16: Independent review + security (coordinator điều phối)
- [ ] 3 nhóm code-reviewer ĐỘC LẬP (commit range cố định, chỉ soi commits nhóm — không working tree): G1 = T1-T5 · G2 = T6-T10 · G3 = T11-T14+T15. VERDICT 1 dòng: CHANGES-REQUESTED (P0/P1/P2) → fix → re-review APPROVED.
- [ ] security-audit: surface = frontmatter claims, license phrasing (jan† machine + neovim review-enforced), links外, evidence trích dẫn có nguồn+ngày, quote ≤25 từ. FINDINGS 0 P0/P1 mới qua.
- [ ] Claims double-pass: từng con số trong 14 bài đối chiếu digest/probe output.

### T17: Rule 0 + merge + gate + Done (coordinator)
- [ ] RULE 0 browser verify 3 tầng trên dist (iframe-probe, port riêng ≥47361, fingerprint marker bài mình — không tin port 200): DOM listing hiện đủ 14 slug ×2 locale (badge/date/reading-time) · VISUAL screenshot listing + 1 bài mở · FLOW mở bài → related → lang-switch same-slug 2 chiều · mobile-390 `documentElement.scrollWidth <= clientWidth` (element-rect trong `pre` = thiết kế). Không thấy được → nói thật, không fallback im lặng.
- [ ] Merge: re-sync dest `story/fi383-blog-batch3` vào nhánh SF (CAS ancestor-guard), build lại trên cây tích hợp trước push, merge qua temp worktree ATTACH branch (KHÔNG --detach) `--no-ff`, push.
- [ ] `~/.claude/bin/story-verify sf-4` sạch.
- [ ] Batch-audit comment (1 comment duy nhất) lên FI-387 kèm merge hash; set FI-387 Done SAU gate.

## Risks
1. **gh api rate-limit/timeout khi chạy dồn** — executor probe 1 repo × ~4 call; stagger ≤3 executor; exit-status capture bắt lỗi, không tin stdout.
2. **Band trôi khi executor tự đếm sai phương pháp** — brief bắt đếm bằng method lint + lint là verdad cuối (coordinator re-run trước commit).
3. **Angle trùng trong 9 bài multi-agent** — angle cấp plan cố định từng bài; consistency pass check pairwise.
4. **jan† phrase lọt vào title/description** — machine-scoped FORBIDDEN bắt full-file case-insensitive; security-audit quét paraphrase.
5. **Dest nhích giữa chừng (SF-2/3/5 merge song song)** — CAS ancestor-guard + build lại trên cây tích hợp trước push (batch-2 recipe đã verify).

## Verification
- Lint: `node scripts/check-blog-content.mjs` → `✓ blog content OK (... of 114 planned slugs ...)`.
- Build: `pnpm build` xanh (4 gate chain).
- RULE 0: probe dist 3 tầng pass (số liệu dán audit comment).
- story-verify sf-4 exit 0; VERDICT APPROVED nằm trong Linear comment (B3).
