# Context Pack — SF-1 Scaffold + i18n + Design direction + Deploy nền (FI-290)

## Spec slice
Từ epic spec (`docs/superpowers/specs/2026-09-04-wakii-site-design.md`):
- Astro static, i18n: `defaultLocale: 'en'`, locales `[en, vi]`, **`prefixDefaultLocale: false`** (EN root, VI `/vi/`)
- Content Collections cho docs — chiến lược map **locale subdirectories** (`en/` + `vi/`), khóa ở SF này, không đổi sau
- **Doc slug contract (SF-2/SF-3 deep-link theo — output bắt buộc):** `/docs/getting-started`, `/docs/superpowers-panel`, `/docs/story-workflow`, `/docs/agents-and-kit`, `/docs/faq`
- Design tokens + Base layout + Nav + Footer + LangSwitcher theo direction đã duyệt: `docs/superpowers/designs/sf1-direction.md` (Terminal Mono — implement đúng prototype `direction-c.html`)
- Logo: copy wordmark từ orca repo (`resources/logo.svg`), cập nhật subtitle thành positioning mới, convert `<text>` → path/outline
- `REPO_URL` constant (1 nơi duy nhất — fork private, URL chốt lúc publish; placeholder giờ)
- SEO base: per-page title/description helper, robots.txt, @astrojs/sitemap, hreflang pair tags, 404 page
- vercel.json + **first deploy proof** (preview URL serve được site)
- Kit license verify: xác định license của superpowers kit origin trước khi SF-2 claim "bundled zero-setup" → ghi kết quả vào `docs/superpowers/notes/kit-license.md`

## Touch map
- Repo `~/Desktop/projects/wakii-site` (greenfield — chỉ có `docs/` hiện tại)
- Tạo: `astro.config.mjs`, `package.json`, `src/content.config.ts`, `src/layouts/Base.astro`, `src/components/{Nav,Footer,LangSwitcher}.astro`, `src/styles/tokens.css`, `src/pages/{index,404}.astro`, `src/pages/vi/index.astro`, `public/` (logo, robots.txt), `vercel.json`, `.gitignore` (đã có)
- KHÔNG đụng: nội dung landing chi tiết (SF-2), docs content (SF-3)

## ACCEPTANCE (user-visible — Phase 5 kiểm từng dòng)
1. `pnpm build` xanh từ clean clone; `/` serve landing hero (EN) và `/vi/` serve cùng structure tiếng VI (placeholder copy được)
2. LangSwitcher chuyển EN↔VI không 404; trang VI thiếu → fallback EN
3. Landing render theo direction C (mono/mint/near-black, hero terminal type-in, skip khi prefers-reduced-motion) — user nhận ra prototype đã chọn
4. 5 doc slugs theo contract tồn tại tối thiểu là route (placeholder page) — SF-2 teaser link được
5. Preview deploy Vercel serve site (proof URL ghi vào issue)
6. `docs/superpowers/notes/kit-license.md` tồn tại với verdict license
7. robots.txt + sitemap + hreflang pair + 404 page có mặt

## Boundary
- KHÔNG viết landing copy thật (hero/features chỉ placeholder EN) — SF-2 làm
- KHÔNG viết docs content — SF-3 làm
- KHÔNG đụng Lighthouse/QA — SF-4 làm
- Vercel project import cần credentials user — nếu blocked → deploy config sẵn + ghi note vào issue, deploy proof hoãn (không block phần còn lại)
- Câu hỏi mới → REQUIREMENT-GAP comment lên epic FI-289, KHÔNG đoán
