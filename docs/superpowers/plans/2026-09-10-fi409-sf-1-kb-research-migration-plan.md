# FI-410 KB Migration — research/ → docs/knowledge/ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move research artifacts về đúng nhà KB (`docs/knowledge/{landscape,repos}/`), sửa đúng 6 pin refs đã pin trong spec, cập nhật KB-internal links — diệt đường dẫn mồ côi, không đụng editorial kit ngoài 3 dòng pin.

**Architecture:** Pure `git mv` (giữ rename history) + surgical text edits. KB ngoài Astro build (`docs/` không serve) → build phải giữ xanh nguyên trạng. `adopt-drafts/` ở lại `research/` theo D5 + style-guide §10 pin.

**Tech Stack:** git, markdown, pnpm (astro build + 3 check scripts), throwaway python link-checker (không commit).

**Linear Issue:** FI-410 (worktree `sf-1-kb-migration`, dest `story/fi409-knowledge-base`)

**Spec:** `docs/superpowers/specs/2026-09-09-knowledge-base-design.md` §SF-2 + D5 · **Pack:** `docs/superpowers/contexts/fi409-sf-2-migration.md`

**Timing override (user chỉ thị 2026-09-09):** chạy NGAY dù batch-2 publish window (09-09→09-30) còn — an toàn vì không batch nào đang ghi research/. Nếu publish phát sinh bất ngờ → draft:true + coordinator note.

---

### Task 1: Move 4 landscape files → docs/knowledge/landscape/

**Files:**
- Move: `docs/superpowers/editorial/research/2026-09-08-digest.md` → `docs/knowledge/landscape/2026-09-08-digest.md`
- Move: `docs/superpowers/editorial/research/2026-09-08-wakii-applicability.md` → `docs/knowledge/landscape/2026-09-08-wakii-applicability.md`
- Move: `docs/superpowers/editorial/research/2026-09-08-broad-digest.md` → `docs/knowledge/landscape/2026-09-08-broad-digest.md`
- Move: `docs/superpowers/editorial/research/2026-09-08-broad-applicability.md` → `docs/knowledge/landscape/2026-09-08-broad-applicability.md`

- [x] **Step 1: Branch guard (bài học main-worktree-đang-nhầm-branch)**

Run: `git branch --show-current`
Expected: `wakii-dev/sf-1-kb-migration`. KHÔNG đúng → STOP, báo coordinator.

- [x] **Step 2: mkdir + git mv 4 files**

```bash
mkdir -p docs/knowledge/landscape
git mv docs/superpowers/editorial/research/2026-09-08-digest.md docs/knowledge/landscape/
git mv docs/superpowers/editorial/research/2026-09-08-wakii-applicability.md docs/knowledge/landscape/
git mv docs/superpowers/editorial/research/2026-09-08-broad-digest.md docs/knowledge/landscape/
git mv docs/superpowers/editorial/research/2026-09-08-broad-applicability.md docs/knowledge/landscape/
```

- [x] **Step 3: Verify moves**

Run: `ls docs/knowledge/landscape/ | wc -l && git status --short | grep -c '^R'`
Expected: `4` và `4` (4 renames, không có D/A lẻ — rename detection giữ history).

- [x] **Step 4: Commit**

```bash
git add docs/superpowers/editorial/research docs/knowledge/landscape
git commit -m "docs(kb): move 4 landscape research artifacts → docs/knowledge/landscape/ (FI-410)"
```

### Task 2: Move digests-batch3/ → docs/knowledge/repos/ (rename thư mục, flat)

**Files:**
- Move dir: `docs/superpowers/editorial/research/digests-batch3/` (51 files) → `docs/knowledge/repos/`

- [x] **Step 1: Rename dir (KHÔNG mkdir trước — git mv rename nguyên thư mục)**

```bash
git mv docs/superpowers/editorial/research/digests-batch3 docs/knowledge/repos
```

- [x] **Step 2: Verify layout**

Run: `find docs/knowledge/repos -type f | wc -l && ls docs/superpowers/editorial/research/`
Expected: `51` và chỉ còn `adopt-drafts` (research/ giữ nguyên adopt-drafts/ 44 files — KHÔNG đụng).

- [x] **Step 3: Verify 0 relative links gãy nội tại (đã pre-check, chốt lại sau move)**

Run: `grep -rn '](\.\{0,2\}/' docs/knowledge/repos/ | wc -l`
Expected: `0` (các digest không có relative md link — move flat an toàn).

- [x] **Step 4: Commit**

```bash
git add docs/superpowers/editorial/research docs/knowledge/repos
git commit -m "docs(kb): move digests-batch3 → docs/knowledge/repos/ flat (FI-410)"
```

### Task 3: Editorial-kit pin refs — đúng 3 dòng, KHÔNG thừa

**Files:**
- Modify: `docs/superpowers/editorial/2026-blog-longform/runbook.md:122`
- Modify: `docs/superpowers/editorial/2026-blog-longform/topic-matrix-batch3.md:119`
- Modify: `docs/superpowers/editorial/2026-blog-longform/claims-registry.md:117`

- [x] **Step 1: runbook.md:122 — thay path**

Old: `` `docs/superpowers/editorial/research/digests-batch3/<slug>.md` (SF-1 đã ``
New: `` `docs/knowledge/repos/<slug>.md` (SF-1 đã ``
(dùng Edit tool, old_string đủ dài để unique — lấy cả dòng 121-122 nếu cần)

- [x] **Step 2: topic-matrix-batch3.md:119 — thay path**

Old: `6. Research ghi vào \`docs/superpowers/editorial/research/digests-batch3/<slug>.md\``
New: `6. Research ghi vào \`docs/knowledge/repos/<slug>.md\``

- [x] **Step 3: claims-registry.md:117 — thay path**

Old: ``tại `docs/superpowers/editorial/research/digests-batch3/<slug>.md`).``
New: ``tại `docs/knowledge/repos/<slug>.md`).``

- [x] **Step 4: Verify-only pins — xác nhận KHÔNG đụng và vẫn đúng**

Run: `grep -n "research/adopt-drafts" docs/superpowers/editorial/2026-blog-longform/runbook.md docs/superpowers/editorial/2026-blog-longform/style-guide.md docs/knowledge/repos/README.md`
Expected: `runbook.md:141`, `style-guide.md:161`, `repos/README.md:22` — nguyên văn, không sửa (path adopt-drafts vẫn đúng sau move — D5).

- [x] **Step 5: Verify diff scope = đúng 3 file × 1 dòng**

Run: `git diff --stat -- docs/superpowers/editorial/2026-blog-longform/`
Expected: đúng 3 file, mỗi file 1 insert + 1 delete. Thừa bất kỳ → revert dòng thừa.

- [x] **Step 6: Commit**

```bash
git add docs/superpowers/editorial/2026-blog-longform
git commit -m "docs(kb): update 3 editorial-kit pin refs to new KB paths (FI-410)"
```

### Task 4: KB-internal links + ghi chú — 6 file, đúng danh sách

**Files:**
- Modify: `docs/knowledge/glossary.md` (1)
- Modify: `docs/knowledge/README.md` (2: link + ghi chú FI-410)
- Modify: `docs/knowledge/references.md` (7: frontmatter sources + 5 links + GHI CHÚ)
- Modify: `docs/knowledge/MOC.md` (4 links)
- Modify: `docs/knowledge/adr/0003-license-claims-scoped-forbidden.md` (2)
- Modify: `docs/knowledge/adr/0010-learn-in-public-third-party-dated.md` (3)

- [x] **Step 1: glossary.md:35**

Old: `` `docs/superpowers/editorial/research/digests-batch3/` (link từ ``
New: `` `docs/knowledge/repos/` (link từ ``

- [x] **Step 2: README.md:34 — flip ghi chú FI-410 (migration đã chạy — timing override)**

Old: `Việc di chuyển file
  research/ sang KB là story riêng (FI-410, sau 09-30) — KHÔNG tự di chuyển.`
New: `Research/ đã chuyển sang KB (FI-410, 2026-09-10 — chạy sớm theo chỉ thị
  user): \`landscape/\` + \`repos/\`; \`adopt-drafts/\` ở lại research/ (pin
  style-guide §10).`

- [x] **Step 3: README.md:66 — link digest**

Old: `[digest MCP servers](../superpowers/editorial/research/digests-batch3/deep-dive-modelcontextprotocol-servers.md)`
New: `[digest MCP servers](repos/deep-dive-modelcontextprotocol-servers.md)`

- [x] **Step 4: references.md — frontmatter sources (line 8)**

Old: `sources: [docs/superpowers/editorial/research/2026-09-08-digest.md, docs/superpowers/editorial/research/digests-batch3/README.md]`
New: `sources: [docs/knowledge/landscape/2026-09-08-digest.md, docs/knowledge/repos/README.md]`

- [x] **Step 5: references.md — 4 link landscape (lines 19/24/29/33)**

`(../superpowers/editorial/research/2026-09-08-digest.md)` → `(landscape/2026-09-08-digest.md)`
`(../superpowers/editorial/research/2026-09-08-wakii-applicability.md)` → `(landscape/2026-09-08-wakii-applicability.md)`
`(../superpowers/editorial/research/2026-09-08-broad-digest.md)` → `(landscape/2026-09-08-broad-digest.md)`
`(../superpowers/editorial/research/2026-09-08-broad-applicability.md)` → `(landscape/2026-09-08-broad-applicability.md)`

- [x] **Step 6: references.md — link repos + GHI CHÚ (lines 38, 40-42)**

Old link: `[Digests batch-3 — 50 repo](../superpowers/editorial/research/digests-batch3/)`
New link: `[Digests batch-3 — 50 repo](repos/)`

Old GHI CHÚ: `**GHI CHÚ:** SF-2 (issue
   FI-410) sẽ move thư mục này sang \`docs/knowledge/repos/\` sau 09-30 —
   KHÔNG move bây giờ (batch publish window; 6 pin refs sẽ sửa trong SF-2).`
New GHI CHÚ: `**GHI CHÚ:** Đã move xong vào \`docs/knowledge/repos/\` (FI-410,
   2026-09-10 — chạy sớm hơn 09-30 theo chỉ thị user); 3 pin refs digests
   trong editorial kit đã sửa, 3 pin adopt-drafts giữ nguyên (path vẫn đúng
   — D5).`

- [x] **Step 7: MOC.md — 4 link digest (lines 50, 57×2, 64) — GIỮ line 79 (adopt-drafts)**

`(../superpowers/editorial/research/digests-batch3/deep-dive-modelcontextprotocol-servers.md)` → `(repos/deep-dive-modelcontextprotocol-servers.md)`
`(../superpowers/editorial/research/digests-batch3/deep-dive-aider-ai-aider.md)` → `(repos/deep-dive-aider-ai-aider.md)`
`(../superpowers/editorial/research/digests-batch3/deep-dive-cline-cline.md)` → `(repos/deep-dive-cline-cline.md)`
`(../superpowers/editorial/research/digests-batch3/deep-dive-anthropics-claude-code.md)` → `(repos/deep-dive-anthropics-claude-code.md)`

- [x] **Step 8: adr/0003 — sources (line 8) + nguồn pin (line 67)**

Sources old: `docs/superpowers/editorial/2026-blog-longform/claims-registry.md, docs/superpowers/editorial/2026-blog-longform/runbook.md, docs/superpowers/editorial/research/digests-batch3/README.md`
Sources new: `docs/superpowers/editorial/2026-blog-longform/claims-registry.md, docs/superpowers/editorial/2026-blog-longform/runbook.md, docs/knowledge/repos/README.md`
Pin old: ``- `docs/superpowers/editorial/research/digests-batch3/README.md` — convention 3``
Pin new: ``- `docs/knowledge/repos/README.md` — convention 3``

- [x] **Step 9: adr/0010 — sources (line 8) + inline (line 44) + nguồn pin (line 65)**

Sources: `docs/superpowers/editorial/research/digests-batch3/README.md` → `docs/knowledge/repos/README.md`
Inline old: ``tại `docs/superpowers/editorial/research/digests-batch3/<slug>.md`).``
Inline new: ``tại `docs/knowledge/repos/<slug>.md`).``
Pin old: ``- `docs/superpowers/editorial/research/digests-batch3/README.md` — convention 2``
Pin new: ``- `docs/knowledge/repos/README.md` — convention 2``

- [x] **Step 10: Verify grep gate + refs adopt-drafts còn lại resolve**

Run: `grep -rn "editorial/research" docs/knowledge/ | grep -v adopt-drafts | wc -l`
Expected: `0`.
Run: `grep -rn "editorial/research" docs/knowledge/ | wc -l` → expect: `11` — toàn adopt-drafts (by-design, từng hit phải trỏ path tồn tại thật): references.md **4** (44, 45, 46, 52) · MOC.md **1** (79) · repos/README.md **1** (22) · 5 digest files **5** (deep-dive-openhands:97, pydantic-ai:75, crush:102, neovim:51, mcp-for-beginners:90).

- [x] **Step 11: Commit**

```bash
git add docs/knowledge
git commit -m "docs(kb): update KB-internal links + notes to post-migration paths (FI-410)"
```

### Task 5: Verify toàn SF — build xanh + grep gates + tree audit

**Files:** không sửa file nào (throwaway scripts không commit)

- [x] **Step 1: Build xanh đủ 4 checks**

Run: `pnpm build > /tmp/build-fi410.log 2>&1; echo $?` (KHÔNG pipe qua tail trước khi lấy exit — `$?` sau pipe = exit lệnh cuối)
Expected: `0` — check-blog-slug-parity + check-blog-utils + check-blog-content PASS + astro build hoàn tất. Lint scope all-non-seed tự phủ (matrix/claims-registry vẫn nguyên vị trí) — KHÔNG đụng scripts.

- [x] **Step 2: RULE 0 — git-level walkthrough từng lệnh, in FULL output**

1. `grep -rn "editorial/research" docs/knowledge/ | grep -v adopt-drafts | wc -l` → `0`
2. `grep -c "deep-dive" docs/superpowers/editorial/2026-blog-longform/runbook.md` → `2` (khớp before — nội dung runbook không hao hụt)
3. Link-check throwaway: python quét mọi link markdown relative trong `docs/knowledge/**/*.md` → resolve từ thư mục file → 0 broken (kể cả links `../superpowers/...` adopt-drafts + editorial kit còn lại)
4. `ls docs/superpowers/editorial/research/` → chỉ `adopt-drafts` (44 files nguyên vẹn: `find docs/superpowers/editorial/research/adopt-drafts -type f | wc -l` = 44)
5. `find docs/knowledge -type f | wc -l` → 16 (SF-1) + 55 (move) = 71

- [x] **Step 3: Tree audit — 0 file editorial kit thừa**

Run: `git diff --name-only 3f35f47 -- docs/superpowers/editorial/2026-blog-longform/`
Expected: đúng 3 file (runbook, topic-matrix-batch3, claims-registry). Kèm `git diff 3f35f47 --stat | tail -5` tổng quan toàn SF.
Known stale-by-design exceptions (report, KHÔNG sửa): `docs/superpowers/improvements-log.md:173` (bài học dated, D7 LINK-only) · `docs/superpowers/brackets/fi409-knowledge-base.md:9,11` (mô tả skeleton phase FI-411) — vẫn nhắc `digests-batch3`, đúng thiết kế.

- [x] **Step 4: Báo DONE — evidence bundle**

Báo coordinator: 4 commit hashes (Task 1-4) + output 5 lệnh Step 2 + build exit + tree audit. KHÔNG tick Done Linear (coordinator làm sau merge).

---

## Acceptance criteria SF (map checklist coordinator)

1. Code + tests pass = Task 1-4 commits + Task 5 build xanh.
2. Verify = Task 5 (a) build (b) 6 pin refs (3 sửa đúng + 3 verify-only nguyên) (c) KB-internal update đủ (d) 0 editorial kit thừa.
3. RULE 0 = git-level walkthrough Step 2 Task 5, FULL output.
4. Tester độc lập = code-reviewer dispatch (coordinator) — VERDICT APPROVED literal lên Linear FI-410 trước merge.
5. Merge no-ff vào `story/fi409-knowledge-base` + build merged tree TRƯỚC push (coordinator).
6. `~/.claude/bin/story-verify sf-1` sạch → FI-410 Done (coordinator).
