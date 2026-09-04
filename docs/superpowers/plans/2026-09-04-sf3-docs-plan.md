# SF-3 Docs 5 trang × 2 locales — Implementation Plan (FI-292)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Người mới đọc getting-started là tự build + chạy được Superpowers panel — 5 trang docs × EN/VI trong layout Bento v2, steps đã validate bằng thực thi thật.

**Architecture:** `DocsLayout.astro` mới (sidebar mono-nav + prev/next, tự query `getCollection('docs')` theo locale, sort theo `order`) wrap trong `Base.astro`; 2 route files render markdown bằng `render(entry)` (Astro 5). Content: EN authored từ inventory note, VI agent-dịch. Getting-started validate bằng clean worktree của orca fork.

**Tech Stack:** Astro 5.12 static, Content Collections (glob loader, locale subdirs — khóa SF-1), tokens CSS v2 Bento Premium.

**Linear Issue:** FI-292

**Spec:** `docs/superpowers/specs/2026-09-04-sf3-docs-design.md`

---

### Task 1: DocsLayout (sidebar + prev/next) + markdown render cho cả 2 route files

**Files:**
- Create: `src/layouts/DocsLayout.astro`
- Modify: `src/pages/docs/[slug].astro` (thay placeholder body)
- Modify: `src/pages/vi/docs/[slug].astro` (thay placeholder body, giữ fallback-by-construction)

- [ ] **Step 1: Tạo `src/layouts/DocsLayout.astro`**

```astro
---
/**
 * Docs layout (SF-3) — sidebar trái mono-nav + prev/next, theo direction v2
 * (docs/superpowers/designs/sf1-direction.md: sidebar mono, headings JetBrains
 * Mono, body Inter, prev/next mono-link, lang switcher trong sidebar).
 * Tự query collection theo locale — sort theo frontmatter `order`.
 */
import Base from './Base.astro';
import LangSwitcher from '../components/LangSwitcher.astro';
import { getCollection } from 'astro:content';
import { docSlug } from '../content.config';

interface Props {
  locale: 'en' | 'vi';
  slug: string;
  title: string;
  description?: string;
  viExists?: boolean;
}

const { locale, slug, title, description, viExists = true } = Astro.props;

const entries = (await getCollection('docs', (d) => d.id.startsWith(`${locale}/`)))
  .sort((a, b) => a.data.order - b.data.order);
const slugs = entries.map((e) => docSlug(e.id));
const idx = slugs.indexOf(slug);
const prev = idx > 0 ? entries[idx - 1] : null;
const next = idx >= 0 && idx < entries.length - 1 ? entries[idx + 1] : null;
const href = (s: string) => (locale === 'vi' ? `/vi/docs/${s}` : `/docs/${s}`);
---
<Base title={title} description={description}>
  <div class="docs-shell">
    <aside class="docs-sidebar">
      <div class="docs-eyebrow">~/docs</div>
      <nav aria-label="Docs navigation">
        <ul>
          {entries.map((e) => {
            const s = docSlug(e.id);
            return (
              <li>
                <a href={href(s)} aria-current={s === slug ? 'page' : undefined}>
                  <span class="idx">{String(e.data.order).padStart(2, '0')}</span>
                  {e.data.title}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      <div class="docs-lang">
        <LangSwitcher viExists={viExists} />
      </div>
    </aside>
    <article class="docs-article">
      <slot />
      <nav class="docs-pager" aria-label="Docs pagination">
        <span class="pager-cell">
          {prev && (
            <a class="pager-link" href={href(docSlug(prev.id))}>
              <span class="pager-dir">← prev</span>
              {prev.data.title}
            </a>
          )}
        </span>
        <span class="pager-cell pager-right">
          {next && (
            <a class="pager-link" href={href(docSlug(next.id))}>
              <span class="pager-dir">next →</span>
              {next.data.title}
            </a>
          )}
        </span>
      </nav>
    </article>
  </div>
</Base>

<style>
  .docs-shell {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 48px;
    max-width: 1080px;
    margin: 0 auto;
    padding: 64px 32px 128px;
  }
  .docs-sidebar {
    position: sticky;
    top: 96px;
    align-self: start;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .docs-eyebrow {
    font-family: var(--font-display);
    font-size: 11px;
    letter-spacing: 0.08em;
    color: var(--text-faint);
  }
  .docs-eyebrow::before {
    content: '$ ';
    color: var(--accent);
  }
  .docs-sidebar ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    border-left: 1px solid var(--border);
  }
  .docs-sidebar a {
    display: flex;
    align-items: baseline;
    gap: 10px;
    padding: 6px 12px;
    font-family: var(--font-display);
    font-size: 12.5px;
    color: var(--text-dim);
    text-decoration: none;
    border-left: 1px solid transparent;
    margin-left: -1px;
  }
  .docs-sidebar a:hover {
    color: var(--text);
  }
  .docs-sidebar a[aria-current='page'] {
    color: var(--accent);
    border-left-color: var(--accent);
  }
  .docs-sidebar .idx {
    font-size: 10px;
    color: var(--text-faint);
  }
  .docs-sidebar a[aria-current='page'] .idx {
    color: var(--accent-dim);
  }
  .docs-lang {
    font-family: var(--font-display);
    font-size: 11px;
  }
  .docs-article {
    min-width: 0;
  }
  .docs-pager {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-top: 64px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
  }
  .pager-cell {
    min-width: 0;
  }
  .pager-right {
    text-align: right;
  }
  .pager-link {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-family: var(--font-display);
    font-size: 13px;
    color: var(--text);
    text-decoration: none;
  }
  .pager-link:hover {
    color: var(--accent);
  }
  .pager-dir {
    font-size: 11px;
    color: var(--accent-dim);
  }
  /* Prose (markdown body) — scoped-global vì Content render vào slot */
  .docs-article :global(.prose) {
    font-family: var(--font-sans);
    font-size: 15px;
    line-height: 1.7;
    color: var(--text-dim);
  }
  .docs-article :global(.prose h2) {
    font-family: var(--font-display);
    font-size: 20px;
    color: var(--text);
    letter-spacing: -0.01em;
    margin: 40px 0 12px;
  }
  .docs-article :global(.prose h3) {
    font-family: var(--font-display);
    font-size: 15px;
    color: var(--text);
    margin: 28px 0 8px;
  }
  .docs-article :global(.prose p) {
    margin: 0 0 14px;
  }
  .docs-article :global(.prose a) {
    color: var(--accent);
    text-decoration: none;
  }
  .docs-article :global(.prose a:hover) {
    text-decoration: underline;
  }
  .docs-article :global(.prose ul),
  .docs-article :global(.prose ol) {
    margin: 0 0 14px;
    padding-left: 22px;
  }
  .docs-article :global(.prose li) {
    margin-bottom: 6px;
  }
  .docs-article :global(.prose code) {
    font-family: var(--font-display);
    font-size: 12.5px;
    background: var(--bg-raised);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 1px 6px;
    color: var(--text);
  }
  .docs-article :global(.prose pre) {
    background: var(--bg-raised);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 16px 18px;
    overflow-x: auto;
    margin: 0 0 18px;
  }
  .docs-article :global(.prose pre code) {
    background: none;
    border: none;
    padding: 0;
    font-size: 12.5px;
    line-height: 1.6;
  }
  .docs-article :global(.prose table) {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 18px;
    font-size: 13.5px;
  }
  .docs-article :global(.prose th) {
    font-family: var(--font-display);
    font-size: 11.5px;
    text-align: left;
    color: var(--text);
    border-bottom: 1px solid var(--border-strong, var(--border));
    padding: 8px 12px;
  }
  .docs-article :global(.prose td) {
    border-bottom: 1px solid var(--border);
    padding: 8px 12px;
  }
  .docs-article :global(.prose blockquote) {
    border-left: 2px solid var(--accent-dim);
    margin: 0 0 14px;
    padding-left: 14px;
    color: var(--text-faint);
  }
  .docs-article :global(.prose hr) {
    border: none;
    border-top: 1px solid var(--border);
    margin: 32px 0;
  }
  @media (max-width: 800px) {
    .docs-shell {
      grid-template-columns: 1fr;
      gap: 32px;
      padding: 48px 20px 96px;
    }
    .docs-sidebar {
      position: static;
    }
  }
</style>
```

Lưu ý token names: toàn bộ tokens dùng ở trên ĐÃ tồn tại trong `src/styles/tokens.css` (v2, SF-1 khóa) — `--font-display/--font-sans/--bg-raised/--border/--border-strong/--accent/--accent-dim/--text/--text-dim/--text-faint/--warn/--bg-card`. Dùng đúng names này, KHÔNG tạo token mới.

- [ ] **Step 2: Rewrite `src/pages/docs/[slug].astro` (EN) — render markdown qua DocsLayout**

```astro
---
/**
 * EN docs routes — slug contract LOCKED at SF-1 (src/config.ts DOC_SLUGS).
 * Render markdown content qua DocsLayout (sidebar + prev/next).
 */
import { getCollection, render } from 'astro:content';
import DocsLayout from '../../layouts/DocsLayout.astro';
import { docSlug } from '../../content.config';

export async function getStaticPaths() {
  const entries = await getCollection('docs', (d) => d.id.startsWith('en/'));
  return entries.map((entry) => ({
    params: { slug: docSlug(entry.id) },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
---
<DocsLayout
  locale="en"
  slug={docSlug(entry.id)}
  title={entry.data.title}
  description={entry.data.description}
>
  <div class="crumb">~/docs/{docSlug(entry.id)}</div>
  <h1>{entry.data.title}</h1>
  <div class="prose">
    <Content />
  </div>
</DocsLayout>

<style>
  .crumb {
    font-family: var(--font-display);
    font-size: 12px;
    color: var(--text-faint);
    margin-bottom: 20px;
  }
  .crumb::before {
    content: '$ cat ';
    color: var(--accent);
  }
  h1 {
    font-family: var(--font-display);
    font-size: clamp(26px, 3.5vw, 36px);
    letter-spacing: -0.02em;
    color: var(--text);
    margin-bottom: 28px;
  }
</style>
```

- [ ] **Step 3: Rewrite `src/pages/vi/docs/[slug].astro` (VI) — giữ fallback-by-construction**

```astro
---
/**
 * VI docs routes — fallback-by-construction (SF-1): thiếu vi/<slug>.md → render
 * EN content với fallback notice, không bao giờ 404. VI có đủ → render VI.
 */
import { getCollection, render } from 'astro:content';
import DocsLayout from '../../../layouts/DocsLayout.astro';
import { docSlug } from '../../../content.config';

export async function getStaticPaths() {
  const enEntries = await getCollection('docs', (d) => d.id.startsWith('en/'));
  const viEntries = await getCollection('docs', (d) => d.id.startsWith('vi/'));
  return enEntries.map((en) => {
    const slug = docSlug(en.id);
    const vi = viEntries.find((v) => docSlug(v.id) === slug);
    return { params: { slug }, props: { entry: vi ?? en, viExists: !!vi, isFallback: !vi } };
  });
}

const { entry, viExists, isFallback } = Astro.props;
const { Content } = await render(entry);
---
<DocsLayout
  locale="vi"
  slug={docSlug(entry.id)}
  title={entry.data.title}
  description={entry.data.description}
  viExists={viExists}
>
  <div class="crumb">~/vi/docs/{docSlug(entry.id)}</div>
  <h1>{entry.data.title}</h1>
  {isFallback && <p class="fallback-note">Bản dịch tiếng Việt chưa có — đang hiển thị nội dung tiếng Anh.</p>}
  <div class="prose">
    <Content />
  </div>
</DocsLayout>

<style>
  .crumb {
    font-family: var(--font-display);
    font-size: 12px;
    color: var(--text-faint);
    margin-bottom: 20px;
  }
  .crumb::before {
    content: '$ cat ';
    color: var(--accent);
  }
  h1 {
    font-family: var(--font-display);
    font-size: clamp(26px, 3.5vw, 36px);
    letter-spacing: -0.02em;
    color: var(--text);
    margin-bottom: 28px;
  }
  .fallback-note {
    border-left: 2px solid var(--warn);
    padding-left: 14px;
    color: var(--warn);
    font-size: 13px;
    margin-bottom: 20px;
  }
</style>
```

- [ ] **Step 4: Build xanh + placeholder render đúng**

Run: `pnpm build`
Expected: build sạch, 10 docs routes generated (`dist/docs/*/index.html` + `dist/vi/docs/*/index.html`).

- [ ] **Step 5: Commit**

```bash
git add src/layouts/DocsLayout.astro src/pages/docs/[slug].astro src/pages/vi/docs/[slug].astro
git commit -m "feat(docs): DocsLayout — sidebar mono-nav + prev/next + markdown render (EN/VI) (FI-292)"
```

### Task 2: Inventory re-confirm note (nguồn số liệu duy nhất cho docs)

**Files:**
- Create: `docs/superpowers/notes/inventory-reconfirm.md`

- [ ] **Step 1: Ghi note từ research đã verify (file:line evidence, nguồn `~/Desktop/projects/orca`)**

Ghi đúng các con số đã verify (KHÔNG thêm/bớt): build (pnpm 12 — `package.json:308`, Node 24 — `:305-307`, `pnpm install`/`pnpm dev`/`pnpm build`/`pnpm start` — `:59-60,87-88`, CONTRIBUTING.md:17-22); panel (manifest `orca-plugin.json:14-19` — id `superpowers`, title "Superpowers", icon `zap`; tabs "⚡ Workflow" + "🌳 Story" — `panel.html:87-90`; Story Ops B1–B5 + B0 browser test — `kit/bin/story-verify:5-13`; KHÔNG "Stories tab" trong panel — phrase chỉ nằm trong code comments; "Stories" view nằm ở Linear task page — `task-page-localized-options.tsx:150-161`, không phải panel); agents (đúng 9 — `kit/agents/*.md`, vai trò theo `kit/kit.json`); kit (17 skills — `kit/skills/` = 17 entries trong `kit.json`; 23 story-* CLIs — `kit/bin/`; install vào `~/.claude` idempotent — `main.mjs:443`; MIT — `docs/superpowers/notes/kit-license.md`).

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/notes/inventory-reconfirm.md
git commit -m "docs(notes): inventory reconfirm — build/panel/agents/kit facts + evidence (FI-292)"
```

### Task 3: Getting-started VALIDATION — thực thi từng bước trong clean worktree của orca

**Files:**
- Create (ngoài site repo, trong orca repo): worktree `~/Desktop/projects/orca-wakii-docs-validate` (hoặc path tương đương — worktree MỚI, không tái dùng build cũ)
- Create: `docs/superpowers/notes/getting-started-validation.md` (bằng chứng)

- [ ] **Step 1: Tạo clean worktree + pnpm install**

```bash
cd ~/Desktop/projects/orca
git worktree add ../orca-docs-validate HEAD
cd ../orca-docs-validate
pnpm install   # Node 24 + pnpm 12 — log đầy đủ
```
Expected: install thành công (postinstall rebuild native deps chạy).

- [ ] **Step 2: Build + chạy app**

```bash
pnpm build
pnpm start     # production Electron app mở
```
Expected: app desktop mở không lỗi.

- [ ] **Step 3: Xác nhận panel ⚡ bằng mắt (Rule 0)**

Mở app → nhìn right sidebar → thấy icon ⚡ Superpowers → click → panel mở với 2 tabs "⚡ Workflow" + "🌳 Story". Chụp screenshot làm bằng chứng.

- [ ] **Step 4: Ghi validation note + dọn worktree**

`docs/superpowers/notes/getting-started-validation.md`: từng lệnh đã chạy, kết quả, screenshot path, thời gian. Giữ worktree đến khi Task 4 xong rồi `git worktree remove`.

- [ ] **Step 5: Commit note**

```bash
git add docs/superpowers/notes/getting-started-validation.md
git commit -m "docs(notes): getting-started validation — steps executed in clean orca worktree (FI-292)"
```

### Task 4: getting-started EN — authored từ steps ĐÃ validate

**Files:**
- Modify: `src/content/docs/en/getting-started.md` (thay placeholder)

- [ ] **Step 1: Viết nội dung khớp 1:1 với Task 3 đã chạy**

Cấu trúc: (1) Prerequisites — Node 24, pnpm 12, git; clone từ repo URL (tham chiếu config `REPO_URL`, không hardcode URL ngoài constant); (2) `pnpm install` — lưu ý lần đầu lâu do native deps (node-pty...); (3) `pnpm dev` (dev, hot-reload) HOẶC `pnpm build` + `pnpm start` (production) — mô tả CẢ HAI như validation đã chạy; (4) Mở Superpowers panel — icon ⚡ ở activity bar phải (Mod+L toggle right sidebar); (5) First run — mô tả ngắn 2 tabs "⚡ Workflow" + "🌳 Story". Accuracy guard: KHÔNG "Stories tab"; chỉ bundled install story (kit tự cài vào `~/.claude` — enabled by default). Internal links sang `superpowers-panel` (detail) — relative `/docs/superpowers-panel/`.

- [ ] **Step 2: Frontmatter + build**

```yaml
---
title: Getting started
description: Build Wakii from source and open the Superpowers panel — from clone to ⚡ in minutes.
order: 0
---
```
Run: `pnpm build` — xanh.

- [ ] **Step 3: Commit**

```bash
git add src/content/docs/en/getting-started.md
git commit -m "feat(docs): getting-started EN — validated build-from-source steps (FI-292)"
```

### Task 5: superpowers-panel EN + story-workflow EN

**Files:**
- Modify: `src/content/docs/en/superpowers-panel.md`
- Modify: `src/content/docs/en/story-workflow.md`

- [ ] **Step 1: superpowers-panel** — mô tả đúng UI thật (theo inventory note): mở từ đâu (⚡ activity bar, Mod+L); tab "⚡ Workflow" (intent: New feature/Continue work/Quick fix; mode toggles: Autonomous, Plan only, Linear audit log...; Subagents grid 9 checkboxes default ON; Execute select: Delegate/Inline/Superpowers); tab "🌳 Story" (Create/Approve/Launch SFs; bracket canvas — epic node + SF nodes + dependency edges + state colors; Story Ops gates B0–B5 + Watchdog/Verify/Stats buttons). CẤM "Stories tab"; KHÔNG mô tả Stories view của Linear task page như một phần panel. Frontmatter order: 1.

- [ ] **Step 2: story-workflow** — luồng: idea → Phase 0 impact → plan (Linear subtasks) → epic + SF bracket (tiers, depends on) → launch SFs song song → mỗi SF: code → gates (B0 browser, B1 code+tests, B2 plan ticked, B3 review, B4 merge, B5 Done) → watchdog auto-resume khi stall → 1 PR per story. Frontmatter order: 2. Link sang `agents-and-kit`.

- [ ] **Step 3: Build + commit**

```bash
pnpm build
git add src/content/docs/en/superpowers-panel.md src/content/docs/en/story-workflow.md
git commit -m "feat(docs): superpowers-panel + story-workflow EN (FI-292)"
```

### Task 6: agents-and-kit EN (số liệu = inventory note) + faq EN

**Files:**
- Modify: `src/content/docs/en/agents-and-kit.md`
- Modify: `src/content/docs/en/faq.md`

- [ ] **Step 1: agents-and-kit** — bảng 9 agents (tên + 1 câu vai trò, đúng `kit/kit.json`); kit: 17 skills bundled, tự cài vào `~/.claude` khi app chạy đầu tiên (idempotent); 23 `story-*` CLIs trong `~/.claude/bin`; license: kit origin superpowers MIT (credit Jesse Vincent/obra — upstream credit). SỐ LIỆU CHỈ từ `docs/superpowers/notes/inventory-reconfirm.md` — không hardcode khác. Frontmatter order: 3.

- [ ] **Step 2: faq** — Q&A ngắn (≥6): Wakii là gì; khác Orca upstream thế nào (bundled superpowers kit + story workflow); cần gì để build (Node 24, pnpm 12); không thấy ⚡ panel (check right sidebar/Mod+L, plugin bundled enabled by default); docs có tiếng Việt không (lang switcher EN|VI, fallback EN); license (MIT, credit upstream). Câu nào trùng landing FAQ → docs là bản đầy đủ (DRY: landing chỉ teaser). Frontmatter order: 4.

- [ ] **Step 3: Build + commit**

```bash
pnpm build
git add src/content/docs/en/agents-and-kit.md src/content/docs/en/faq.md
git commit -m "feat(docs): agents-and-kit + faq EN — inventory-confirmed numbers (FI-292)"
```

### Task 7: VI translation batch (5 trang)

**Files:**
- Modify: `src/content/docs/vi/getting-started.md`, `superpowers-panel.md`, `story-workflow.md`, `agents-and-kit.md`, `faq.md`

- [ ] **Step 1: Dịch từng trang từ EN đã duyệt**

Quy tắc: dịch tự nhiên, UI terms kỹ thuật giữ EN (Superpowers panel, bracket canvas, gate, sidebar, worktree, SF, PR, build, bundle); commands/code KHÔNG dịch; frontmatter title + description dịch (title giữ ngắn), `order` giữ nguyên. Tên trang VI gợi ý: "Bắt đầu", "Superpowers panel", "Story workflow", "Agents & kit", "FAQ".

- [ ] **Step 2: Build + kiểm fallback không còn**

Run: `pnpm build` — 10 routes đủ; `/vi/docs/*` render VI (không fallback note).

- [ ] **Step 3: Commit**

```bash
git add src/content/docs/vi/
git commit -m "feat(docs): VI translations — 5 docs pages (FI-292)"
```

### Task 8: SEO meta + link integrity + plan tick

**Files:**
- Modify: bất kỳ content file thiếu description
- Modify: `docs/superpowers/plans/2026-09-04-sf3-docs-plan.md` (tick)

- [ ] **Step 1: SEO pass** — mọi frontmatter có `title` + `description` (Base đã render title/description/canonical/hreflang — SF-1); description ≤ 160 ký tự; không sửa Base.

- [ ] **Step 2: Link integrity** — grep toàn docs content: mọi internal link (`/docs/...`, `/vi/docs/...`) khớp slug contract (`getting-started|superpowers-panel|story-workflow|agents-and-kit|faq`); link giữa các trang dùng path có trailingslash nhất quán (`/docs/<slug>/`).

Run: `grep -oE '\]\(/(vi/)?docs/[a-z-]+' src/content/docs -r | sort -u` — mỗi link khớp 1 slug hợp lệ.

- [ ] **Step 3: Build cuối + tick plan + commit**

```bash
pnpm build
# tick các checkbox trong plan file
git add docs/superpowers/plans/2026-09-04-sf3-docs-plan.md src/content
git commit -m "docs(docs): seo meta pass + link integrity + plan tick (FI-292)"
```
