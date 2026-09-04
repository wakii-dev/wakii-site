# SF-2 Landing EN+VI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đóng 3 gap acceptance của landing (ghost CTA contract, figma-to-verify cell, FAQ teaser) + footer kit credit — EN source of truth, VI dịch theo.

**Architecture:** Landing copy sống trong `src/i18n/landing.ts` (interface `LandingStrings` + `en`/`vi`); `Landing.astro` là renderer thuần consume mockup kit props. Không đụng tokens/layout/Nav/docs (boundary SF-1/SF-3/SF-4).

**Tech Stack:** Astro 5 static, scoped styles, TypeScript strings map. Không có test infra unit — verification = `astro build` + browser walkthrough 3 tầng (DOM/visual/flow) theo Rule 0.

**Linear Issue:** FI-291

---

### Task 1: CTA contract — ghost "Read the guide" → /docs/getting-started

**Files:**
- Modify: `src/i18n/landing.ts` (en.hero.ctaGhost ~line 129, vi.hero.ctaGhost ~line 271)
- Modify: `src/components/Landing.astro:48` (cta-row href)

- [x] **Step 1: Đổi string EN** — `en.hero.ctaGhost`: `'explore the team'` → `'read the guide'` (thương hiệu landing dùng lowercase mono style)
- [x] **Step 2: Đổi string VI** — `vi.hero.ctaGhost`: `'khám phá team'` → `'đọc hướng dẫn'`
- [x] **Step 3: Đổi href trong Landing.astro** — `#features` → `{docsHref}` (đã có sẵn `docsHref` = locale-prefixed `/docs/getting-started` ở frontmatter line 22)
- [x] **Step 4: Build + verify** — `pnpm build` xanh; grep dist: EN `href="/docs/getting-started"` tại hero CTA, VI `href="/vi/docs/getting-started"`
- [x] **Step 5: Commit** — `feat(landing): hero ghost CTA → read the guide → docs/getting-started (acceptance #4)`

### Task 2: Figma-to-verify cell thay stats cell (features inventory #6)

**Files:**
- Modify: `src/i18n/landing.ts` (interface `bento` — xóa `stats`, thêm `figma`; en + vi)
- Modify: `src/components/Landing.astro` (cell F markup + CSS)

- [x] **Step 1: Đổi interface** — xóa `stats: { v: string; k: string }[]`; thêm `figma: { label: string; meta: string; verdict: string; verdictOk: boolean; rows: { k: string; v: string }[]; desc: string }`
- [x] **Step 2: EN strings** — cell "figma → verify" pipeline: label `figma-to-verify`, rows mock (capture → tokens → states → browser walkthrough → verdict PASS), desc map feature "Figma-to-verify pipeline" (tránh "Stories tab"). Ví dụ:
  ```ts
  figma: {
    label: 'figma → verify pipeline',
    meta: 'design → shipped, diffed',
    rows: [
      { k: 'capture', v: 'frame + tokens, committed to repo' },
      { k: 'implement', v: 'tokens-only, component map first' },
      { k: 'verify', v: 'screenshot diff vs capture, side by side' },
    ],
    verdict: 'visual diff: 0 unexpected deltas',
    verdictOk: true,
    desc: 'SF.006 — figma-to-verify: the build is checked against the design, pixel by pixel, before merge.',
  },
  ```
- [x] **Step 3: VI strings** — dịch từ EN đã duyệt (label/meta giữ tech term khi tự nhiên)
- [x] **Step 4: Markup** — thay cell F stats bằng: bx-label (label + meta) + rows list (kiểu mem-ln: `.fv-row` k/v) + verdict footer (`.ok` mint khi verdictOk) + bx-desc; giữ `class="bx bx-f" data-depth="0.14"`, grid span `10/13` không đổi
- [x] **Step 5: CSS** — thêm `.fv-row`/`.fv-k`/`.fv-v`/`.fv-verdict` theo pattern `.mem-ln` hiện có; xóa `.stat-cell`/`.stat` CSS
- [x] **Step 6: Build + accuracy guard** — `pnpm build` xanh; grep dist KHÔNG có "Stories tab"; 6 cells map đủ inventory
- [x] **Step 7: Commit** — `feat(landing): figma-to-verify cell thay stats — đủ 6 feature inventory (acceptance #2)`

### Task 3: FAQ teaser link + footer kit credit

**Files:**
- Modify: `src/i18n/landing.ts` (faq thêm `more`/`moreLink` EN+VI)
- Modify: `src/components/Landing.astro` (FAQ section cuối — link dạng `.quick-more`)
- Modify: `src/components/Footer.astro` (thêm kit credit)

- [x] **Step 1: Strings** — interface `faq` thêm `more: string; moreLink: string; slug: '/docs/faq'` (hoặc hardcode qua faqHref như docsHref pattern — dùng helper `(t.lang === 'vi' ? '/vi' : '') + '/docs/faq'`); EN: more = `'only the short version — the'`, moreLink = `'full FAQ'`; VI: `'chỉ bản rút gọn —'` / `'toàn bộ FAQ'`
- [x] **Step 2: Markup** — sau accordion, thêm `<p class="faq-more">{t.faq.more} <a href={faqHref}>{t.faq.moreLink}</a></p>` + CSS copy `.quick-more` pattern
- [x] **Step 3: Footer credit** — thêm dòng kit origin: `superpowers kit by Jesse Vincent (obra/superpowers) (MIT)` trong `.l` hoặc links, ghi cả 2 locale dùng chung (footer chung)
- [x] **Step 4: Build + verify** — build xanh; dist có link `/docs/faq` + `/vi/docs/faq`; footer credit render
- [x] **Step 5: Commit** — `feat(landing): FAQ teaser link → docs/faq + footer superpowers kit credit (acceptance #5, kit-license verdict)`

### Task 4: Verify pass — browser walkthrough 3 tầng + responsive + reduced-motion

**Files:** (không sửa code trừ khi phát hiện lỗi)

- [x] **Step 1: Dev/preview server** — `pnpm preview` (dist build Task 3), mở Orca browser tab
- [x] **Step 2: DOM tier** — snapshot cả `/` và `/vi/`: đủ 6 sections đúng thứ tự (hero → bento/features → zero-setup → workflow → quickstart → faq); links: hero primary → REPO_URL, ghost → /docs/getting-started, quickstart more → same, FAQ more → /docs/faq, footer → REPO_URL + orca upstream
- [x] **Step 3: VISUAL tier** — screenshot EN + VI full-page, so direction-d3-bento.html: bento layout 6 cells đúng spans, tilt không vỡ, mono/mint DNA
- [x] **Step 4: FLOW tier** — load → LangSwitcher EN↔VI (không 404) → click CTA (mở REPO_URL) → FAQ accordion mở/đóng → smooth scroll #features/#workflow
- [x] **Step 5: Responsive + reduced-motion** — mobile 390px: 1-col stack, nav collapse, không overflow-x; `prefers-reduced-motion`: static render đầy đủ thông tin
- [x] **Step 6: Fix nếu phát hiện lỗi** (commit riêng `fix(landing): ...`), tick plan checkbox, ghi evidence vào audit comment — đã fix: min-width:0 bento cells (tràn mobile) + fv-k spacing
