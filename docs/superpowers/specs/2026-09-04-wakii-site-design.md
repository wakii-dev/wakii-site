# Wakii Website — Epic Spec

Date: 2026-09-04
Status: DRAFT (spec-critic + plan-critic pending)
Story branch: `story/<epic-id>-wakii-site` (created at APPROVE)

## 1. Problem

Wakii — fork của stablyai/orca (Electron IDE cho parallel agentic development), đã
rebrand + bundled superpowers plugin/kit — chưa có web presence công khai. Developers
ngoài không thể discover, đánh giá, hay học workflow.

## 2. Goals / Non-goals

**Goals**
- Landing page thuyết phục giới thiệu Wakii: "Agentic IDE with a built-in superpowers team"
- Usage guide (docs) đủ để người mới tự cài + tự chạy story workflow
- Song ngữ EN (default) + VI (`/vi/`)
- Deploy Vercel tự động từ git push

**Non-goals (v1)**
- Blog, search, analytics, backend, CMS, domain riêng, i18n ngoài EN/VI
- Quảng cáo tính năng chưa ship: **Stories tab trong Linear task page KHÔNG được
  xuất hiện** (chưa port; interface thật duy nhất là Superpowers panel + bracket canvas)

## 3. Stack & architecture (user-approved)

| Decision | Value |
|---|---|
| Framework | Astro (static output) |
| i18n | Astro i18n routing: `defaultLocale: 'en'`, locales `en`, `vi`, **`prefixDefaultLocale: false`** (EN ở root `/`, VI ở `/vi/`) |
| Docs content | Astro Content Collections (Markdown/MDX), sidebar + prev/next, không search |
| Styling | Design tokens riêng (`tokens.css`), dark theme đồng bộ app Wakii |
| Deploy | Vercel (`astro build` → `dist/`), config trong SF-1 để có preview deploy |
| Repo | `~/Desktop/projects/wakii-site`, repo git riêng |

**Khóa sớm từ Phase 0 (không được đổi sau SF-1):** chiến lược map content
per-locale cho Content Collections (locale subdirectories `en/` + `vi/` — quyết
định ở SF-1, ảnh hưởng collection query + sidebar + lang-switcher URL mapping).

## 4. Content

### Landing (cả 2 locales, cùng structure)
1. **Hero** — headline + tagline + 2 CTA: "Get Wakii" (GitHub repo + build-from-source;
   repo URL là MỘT config constant duy nhất — fork hiện private, URL chốt lúc publish)
   và "Read the guide" (→ docs)
2. **Zero-setup strip** — bundled plugin + kit tự install vào `~/.claude`, bật sẵn
3. **Features grid** (6 thẻ, từ feature inventory đã research): Story system
   (epic→SF bracket) · Bracket canvas panel · 9-agent team + gates · Watchdog
   auto-complete · Memory/learning loop · Figma-to-verify pipeline
4. **Workflow diagram** — steps: Idea → Impact → Plan (Linear subtasks) → Parallel
   SFs → Verify gates → 1 PR per story
5. **Quickstart** — teaser 3 bước, link sâu sang docs getting-started (KHÔNG lặp
   full guide — copy chỉ tồn tại 1 lần ở docs, landing chỉ teaser)
6. **FAQ ngắn** + footer (link repo, credit upstream Orca MIT, license note)

### Docs (5 trang × 2 locales)
- `getting-started` — build from source, mở panel ⚡, first run
- `superpowers-panel` — Workflow tab + Story tab (bracket canvas, Story Ops gates)
- `story-workflow` — epic → bracket → SF tiers → watchdog → 1 PR/story
- `agents-and-kit` — agents/skills/CLIs reference (số liệu **lấy từ feature
  inventory đã verify, re-confirm đầu SF-3** — không hardcode trong spec)
- `faq`

**VI content:** EN là source of truth; VI copy do agent dịch từ EN đã duyệt,
**user review trước khi SF-4 convergence** (VI lỗi tạm nhìn nhận được, VI sai
nghiêm trọng chặn SF-4). Lang switcher khi trang VI chưa có → fallback EN, không 404.

**Marketing accuracy guard (acceptance criteria cho mọi content task):** mọi claim
phải map được vào feature inventory đã verify (nguồn: epic comments + context pack);
cấm mention Stories tab UI; install story chỉ mô tả bundled flow (không nói
standalone install cũ); kit license được kiểm trước khi claim "bundled zero-setup".

**DRY copy:** landing FAQ và quickstart chỉ là **teaser subset link sang docs**
(copy đầy đủ tồn tại đúng 1 lần, ở docs).

## 5. Brand

- Reuse wordmark `/Users/hoivu/Desktop/projects/orca/resources/logo.svg` — copy vào
  `public/` và **cập nhật subtitle** ("workflow cockpit" → khớp positioning mới);
  outline font trong SVG (đang dùng `<text>` hệ thống — render khác nhau per OS).
  Công việc logo này thuộc **SF-1** (design phase)
- Dark theme, accent màu Wakii riêng (định hướng cụ thể qua designer phase SF-1)

## 6. SF structure

```
SF-1 (tier 0) Design direction + scaffold + i18n + layout + deploy
SF-2 (tier 1) Landing EN+VI
SF-3 (tier 1) Docs: collections + sidebar + 5 trang × 2 locales
SF-4 (tier 2) Convergence QA: Lighthouse, cả 2 locales, link check, polish
```

- SF-1 có **Design: mock-prototype** (3 hướng HTML → user chọn → hand-off tokens);
  SF-2/SF-3 implement theo direction đã duyệt (Design: none — inherit SF-1)
- Deploy config (vercel.json) ở SF-1 → preview deploy có từ tier 1

## 7. Success criteria

- Landing + 5 docs trang render đúng cả EN/VI, lang switcher không 404 (fallback EN)
- `astro build` sạch; Lighthouse Performance/SEO ≥ 90 trên landing (docs không đặt
  ngưỡng riêng, chỉ không-regression cảm nhận)
- Deploy Vercel preview xanh trên mọi PR của story
- Content pass accuracy guard (mục 4)
- Getting-started **được validate bằng cách thực thi từng bước trong clean clone
  của fork** (worktree mới) — không viết docs-by-inference. (Build access: repo
  fork nằm local, đã build nhiều lần trong session này)
- SF-4 pre-publish checklist: responsive/mobile OK, OG preview image có trên
  landing, hreflang tags cho 2 locales, 404 page, **confirm `REPO_URL` constant
  trỏ repo công khai thật + click-through CTA ở cả 2 locales**

## 8. Risks (từ Phase 0)

1. Download CTA — fork private → copy "build from source", repo URL = 1 config
   constant `REPO_URL` (SF-1 tạo); SF-4 pre-publish gate confirm URL trước khi
   site public
2. Marketing accuracy — guard ở mục 4; re-confirm inventory trước SF-2/SF-3 content
3. i18n content mapping — khóa ở SF-1 (mục 3, gồm cả `prefixDefaultLocale: false`)
4. Kit license (superpowers origin) — verify trước khi claim bundled; nếu không rõ
   → đổi copy thành "ships with a workflow kit" (không claim licensing)
