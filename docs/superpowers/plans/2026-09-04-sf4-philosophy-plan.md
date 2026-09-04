# SF-4 Philosophy + Landing Deepening — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Meta-steps (verify / merge / Done) dùng numbered list — KHÔNG checkbox.

**Goal:** Landing giải thích triết lý 8 trụ cột (cards rút gọn + link heading-anchor sang story-workflow.md) và cách hệ 9 agents + gates B0–B5 vận hành — visitor hiểu product trước khi download.

**Architecture:** Section components trong `src/components/landing/` (SF-4 sở hữu `Philosophy.astro` MỚI + `Workflow.astro` deepen). Copy đã pre-add từ SF-1 trong `src/i18n/landing.ts` (`philosophy` + `workflowDeep`, EN+VI đủ) — landing.ts READ-ONLY, thiếu key = flag epic FI-294. Motion: consume `src/components/motion.ts` (`initMotion()`, `.reveal` class) nguyên trạng. Design binding: docs/superpowers/designs/sf1-direction.md (v2 Bento Premium — tokens mint #45E0A8 / near-black #0A0E0D); pillar cards reuse established bento card language.

**Tech Stack:** Astro 5 static, scoped styles, TypeScript strings map. Không có test infra unit — verification = `pnpm build` + grep dist + browser walkthrough 3 tầng (DOM/visual/flow) theo Rule 0.

**Linear Issue:** FI-299 · Story: FI-294 · Nhánh đích: `story/fi294-site-content-depth`

**Verified facts (plan-time evidence):**
- Astro auto-generate heading ids: EN `<h2 id="philosophy">`, VI `<h2 id="triết-lý">` trong dist — docs md KHÔNG cần sửa (context pack acceptance #2 thỏa bằng kiến trúc hiện có).
- Docs URL: EN `/docs/story-workflow/`, VI `/vi/docs/story-workflow/` (trailing slash — memory rule).
- `LandingStrings` có `lang: 'en' | 'vi'` → component tự tính href theo locale.

**Placement decision (context pack cho phép chọn, ghi notes):** Philosophy đặt **SAU Workflow** — pipeline (#workflow) là cơ chế, 8 pillars là lý do phía sau cơ chế; đọc cơ chế trước → lý do sau = flow tự nhiên. Workflow deepen giữ stage strip, thêm agents + gates blocks bên dưới.

---

### Task 1: Anchor verification (docs md untouched) — evidence gate

**Files:** (không sửa code — verification + ghi quyết định)

- [x] **Step 1: Build baseline** — `pnpm install && pnpm build` xanh (13 pages).
- [x] **Step 2: Grep dist anchors** — EN `dist/docs/story-workflow/index.html` có `<h2 id="philosophy">`; VI `dist/vi/docs/story-workflow/index.html` có `<h2 id="triết-lý">`. → Kết luận: KHÔNG sửa `src/content/docs/**` (boundary "chỉ thêm id" → không cần vì đã có).
- [x] **Step 3: Ghi quyết định vào plan** (chính dòng này) + commit plan file — `docs(sf-4): plan + anchor evidence (FI-299)`

### Task 2: Philosophy.astro — 8 pillar cards + docLink

**Files:**
- Create: `src/components/landing/Philosophy.astro`

- [x] **Step 1: Section shell** — `<section class="philosophy" id="philosophy">` + `.wrap` + section-head (kicker/title/sub từ `t.philosophy`), style theo hệ hiện có (padding `var(--section-pad)`, kicker mono lowercase mint, như Workflow.astro).
- [x] **Step 2: Pillar cards grid** — grid 4 cột desktop (2 tablet, 1 mobile) × 8 cards từ `t.philosophy.pillars`; mỗi card: số thứ tự mono (01–08) + name (text, font hiện có) + line (dim). Card language reuse bento: `var(--panel)`, `1px solid var(--border)`, `border-radius: var(--radius-cell)`. Không tilt (không phải bento cell).
- [x] **Step 3: docLink CTA** — link "đọc đầy đủ" (`t.philosophy.docLink`) → href locale-aware: `t.lang === 'vi' ? '/vi/docs/story-workflow/#triết-lý' : '/docs/story-workflow/#philosophy'`. Pattern `.quick-more`/link mint hiện có.
- [x] **Step 4: Reveal** — section-head + cards có class `reveal` (consume `initMotion()` boot sẵn trong Landing.astro — không script mới).
- [x] **Step 5: Commit** — `feat(sf-4): Philosophy.astro — 8 pillar cards + doc link anchor (FI-299)`

### Task 3: Wire Philosophy vào Landing.astro

**Files:**
- Modify: `src/components/Landing.astro`

- [ ] **Step 1:** import Philosophy + render `<Philosophy strings={strings} />` NGAY SAU `<Workflow>` (trước GetWakii). KHÔNG đổi thứ tự/số lượng section khác (boundary).
- [ ] **Step 2:** build xanh; grep dist EN `/` + `/vi/`: section `#philosophy` tồn tại giữa `#workflow` và get-wakii; comment ownership header cập nhật (philosophy → SF-4).
- [ ] **Step 3: Commit** — `feat(sf-4): wire philosophy section sau workflow trên landing (FI-299)`

### Task 4: Workflow deepen — agents block (ai làm gì)

**Files:**
- Modify: `src/components/landing/Workflow.astro`

- [ ] **Step 1:** sau `.pipe` + legend, thêm agents block: tiêu đề mono (`t.workflowDeep.agentsTitle`) + đoạn giải thích 9 agents (`agentsIntro`) — style continuation của `.flow-note` hiện có (border-left mint).
- [ ] **Step 2:** build xanh, EN+VI render đúng keys (không key lộ raw).
- [ ] **Step 3: Commit** — `feat(sf-4): workflow deepen — 9 agents block (FI-299)`

### Task 5: Workflow deepen — gates B0–B5 block

**Files:**
- Modify: `src/components/landing/Workflow.astro`

- [ ] **Step 1:** gates block: tiêu đề (`gatesTitle`) + intro (`gatesIntro`) + grid 6 gate chips từ `t.workflowDeep.gates` — mỗi chip: id mono mint (`B0`) + label + desc dim. Grid language giống pillar cards (cùng tokens).
- [ ] **Step 2:** build xanh; reveal classes trên cả 2 blocks mới.
- [ ] **Step 3: Commit** — `feat(sf-4): workflow deepen — gates B0–B5 block (FI-299)`

### Task 6: Responsive pass — 8 cards + workflow strip mobile

**Files:**
- Modify: `src/components/landing/Philosophy.astro`, `src/components/landing/Workflow.astro`

- [ ] **Step 1:** breakpoints: pillars 4→2 (≤1024px) →1 (≤640px); gates grid 3→2→1 tương ứng. Card padding co hợp lý.
- [ ] **Step 2:** workflow strip (`.pipe`) đã có `overflow-x: auto` — kiểm mobile không vỡ; agents/gates blocks stack gọn.
- [ ] **Step 3: Commit** — `feat(sf-4): responsive 8 pillar cards + gates grid (FI-299)`

### Task 7: DOM-tier verify (dist grep)

**Files:** (verify — sửa nếu phát hiện lỗi)

- [ ] **Step 1:** `pnpm build` xanh (13 pages không đổi số).
- [ ] **Step 2:** grep dist: EN `/` + VI `/vi/` có 8 pillar names + docLink href đúng (`/docs/story-workflow/#philosophy` và `/vi/docs/story-workflow/#triết-lý`); gates B0–B5 đủ 6; section order hero→bento→zero-setup→workflow→philosophy→get-wakii→faq.
- [ ] **Step 3:** KHÔNG có "Stories tab", không key raw lộ. Evidence ghi Phase 4 audit.

### Task 8: Browser walkthrough 3 tầng + reduced-motion (Rule 0)

**Files:** (sửa nếu phát hiện lỗi — fix commit riêng)

- [ ] **Step 1: PREVIEW SERVER + browser** — `pnpm preview`, mở tab; NHÌN trước khi đo.
- [ ] **Step 2: VISUAL tier** — screenshot EN + VI full-page: philosophy section + workflow deepen so design binding (tokens mint/near-black, card language nhất quán bento).
- [ ] **Step 3: FLOW tier** — nav→scroll tới #philosophy→click "đọc đầy đủ" → docs story-workflow CUỘN ĐÚNG VỊ TRÍ triết lý (không 404, đúng locale, anchor hoạt động); lang-switch EN↔VI giữ section; quay lại landing.
- [ ] **Step 4: Responsive + reduced-motion** — iframe probe 390px (memory: tin cậy hơn screenshot clamp): 8 cards xếp gọn không overflow-x; reduced-motion → static đầy đủ.
- [ ] **Step 5: Fix nếu lỗi** (commit riêng `fix(sf-4): ...`) — nếu không xác nhận được bằng mắt → NÓI THẬT, nhờ user.

---

## Meta-steps (sau Task 8 — numbered, KHÔNG checkbox)

1. Verify Phase 5: kiểm từng dòng ACCEPTANCE context pack (4 dòng) — verifier agent độc lập.
2. Tester review độc lập: code-reviewer trên diff toàn SF (rolling: nhóm task 1-4, nhóm task 5-8) → verdict literal `VERDICT: APPROVED` post lên FI-299.
3. Merge `sf-4-philosophy` → `story/fi294-site-content-depth` (no-ff; conflict improvements-log → giữ CẢ HAI) + audit comment merge-hash.
4. Gate cứng: `~/.claude/bin/story-verify sf-4` sạch → mới Done. FAIL → quay lại bước tương ứng.
5. Set FI-299 Done (SAU merge — Linear Done trước merge = INCOMPLETE).

## Boundary (từ context pack — KHÔNG làm)

- KHÔNG sao full 8-pillar copy từ docs vào landing (DRY — rút gọn).
- KHÔNG đụng skills catalog (SF-2), get-wakii/roadmap (SF-3).
- KHÔNG sửa nội dung docs ngoài id anchor (→ thực tế không cần đụng gì).
- KHÔNG thêm motion primitive mới (SF-5).
- KHÔNG đổi thứ tự/số lượng section hiện có ngoài thêm philosophy.
- KHÔNG sửa `src/i18n/landing.ts` (thiếu key = flag epic).
