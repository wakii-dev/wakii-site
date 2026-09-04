# SF-3 Docs 5 trang × 2 locales — Design Spec (FI-292, story FI-289)

Date: 2026-09-04
Status: Approved (epic questions pre-answered; launch prompt pre-approves direction — design binding từ `docs/superpowers/designs/sf1-direction.md` v2)
Parent spec: `docs/superpowers/specs/2026-09-04-wakii-site-design.md` (mục 3, 4, 7)

## 1. Problem

Site Wakii chỉ có landing (SF-2) + docs placeholders (SF-1). Epic cam kết người mới
đọc getting-started là **tự build + chạy được Superpowers panel**. SF-3 là nửa
instruction: 5 trang docs × EN/VI, layout theo direction v2 đã duyệt.

## 2. Scope

**In:**
- Docs layout thật: sidebar trái mono-nav + prev/next + markdown render, cả 2 locales
- 5 trang EN authored + 5 trang VI agent-dịch (EN = source of truth)
- Getting-started VALIDATE bằng thực thi trong clean worktree của orca fork
- Inventory re-confirm note (nguồn số liệu cho agents-and-kit)
- SEO: title + description từ frontmatter cho mọi trang docs (Base đã render)

**Out (boundary):**
- Landing (SF-2), tokens/layout/i18n config (SF-1 — KHÔNG sửa `Base/Nav/LangSwitcher/tokens/content.config.ts`)
- VI user review (SF-4), Lighthouse/link-integrity toàn site (SF-4)
- Search, MDX components tùy biến, comment system

## 3. Design

### 3.1 Layout & routing

- `src/layouts/DocsLayout.astro` (mới): props `{ locale: 'en'|'vi', slug, title, description }`.
  Tự query `getCollection('docs')` theo locale, sort theo frontmatter `order` →
  render sidebar + prev/next. Wrap trong `Base.astro` (giữ Nav + Footer + LangSwitcher).
- Sidebar: mono-nav (`--font-display`), active item accent mint, links locale-aware
  (`/docs/{slug}` | `/vi/docs/{slug}`). Order: getting-started(0), superpowers-panel(1),
  story-workflow(2), agents-and-kit(3), faq(4).
- Prev/next: trong list cùng locale, mono-link, label = title trang.
- `[slug].astro` (cả 2 route files): `getStaticPaths` giữ nguyên; body render bằng
  `render(entry)` từ `astro:content` (Astro 5), truyền `Content` + metadata vào DocsLayout.
- Markdown styling scoped trong DocsLayout: headings JetBrains Mono, body Inter,
  inline/block code nền `--bg-raised` + border `--border`, links accent, lists/tables
  theo tokens. Không style toàn cục.

### 3.2 Content (EN authored)

Số liệu KHÔNG hardcode tùy tiện — lấy từ note inventory re-confirm (mục 3.3).

| Trang | Nội dung |
|---|---|
| getting-started | Build from source: clone fork (`REPO_URL` constant) → pnpm 12 + Node 24 → `pnpm install` → `pnpm dev` (hoặc `pnpm build` + `pnpm start`) → mở app → bấm icon ⚡ Superpowers ở activity bar phải → panel xuất hiện → first run. MỖI bước phải được thực thi thật trong clean worktree (mục 4) |
| superpowers-panel | Panel "Superpowers": 2 tabs thật — "⚡ Workflow" (intent, modes, 9-subagent grid, execute mode) + "🌳 Story" (Create/Approve/Launch, bracket canvas, Story Ops gates B0–B5). **CẤM** mention "Stories tab"; Stories view của Linear task page KHÔNG mô tả là surface của panel |
| story-workflow | Epic → bracket (SF tiers) → parallel SFs → gates B0–B5 → watchdog auto-resume → 1 PR per story |
| agents-and-kit | Bảng 9 agents (tên + vai trò, đúng `kit/agents/`), 17 kit skills, 23 `story-*` CLIs, bundled install vào `~/.claude` (idempotent), license MIT credit upstream |
| faq | Q&A ngắn: Wakii là gì, khác Orca upstream, cần gì để build, panel không thấy ⚡, VI ở đâu, license |

Accuracy guard (mọi trang): chỉ claim gì inventory đã verify; install story chỉ
bundled flow (không standalone install cũ); không "Stories tab".

### 3.3 Inventory note

`docs/superpowers/notes/inventory-reconfirm.md` — ghi số liệu đã verify từ orca
source với file:line evidence (build steps, panel surfaces, 9 agents, 17 skills,
23 CLIs). Đây là nguồn DUY NHẤT cho các con số trong docs.

### 3.4 VI translation

Agent dịch từ EN đã duyệt. UI terms kỹ thuật giữ EN khi dịch tự nhiên hơn
(Superpowers panel, bracket canvas, gate, sidebar, SF, PR...). Frontmatter VI:
title + description dịch, `order` giữ nguyên.

## 4. Validation (getting-started)

Tạo git worktree MỚI của `~/Desktop/projects/orca` (code sạch, không phải thư mục
đã build) → `pnpm install` → `pnpm build` → `pnpm start` → mở app desktop →
xác nhận icon ⚡ + panel Superpowers mở được. Bằng chứng: log + screenshot, ghi
vào FI-292. Docs getting-started phải khớp từng bước đã chạy (không docs-by-inference).

## 5. Acceptance (từ context pack)

1. 5 trang × 2 locales render trong docs layout (sidebar + prev/next + lang switch)
2. Getting-started: mỗi bước thực thi thành công trong clean clone (bằng chứng log → FI-292)
3. agents-and-kit số liệu khớp inventory re-confirmed; accuracy guard pass
4. VI pages đầy đủ; UI terms kỹ thuật giữ EN khi tự nhiên hơn
5. Internal links giữa docs pages không chết

## 6. Risks

1. pnpm install Electron deps trong worktree sạch tốn thời gian → budget riêng, chạy song song với viết content
2. Markdown render style lệch tokens → scoped styles theo direction v2, browser verify
3. VI dịch lệch nghĩa kỹ thuật → giữ EN terms, SF-4 user review là safety net
4. Link chết giữa docs → link integrity check trong verify (grep slugs)
