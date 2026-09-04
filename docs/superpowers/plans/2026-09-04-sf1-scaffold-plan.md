# Plan — SF-1 Scaffold + i18n + Design direction + Deploy nền (FI-290)

Spec: docs/superpowers/specs/2026-09-04-wakii-site-design.md (epic) + context pack docs/superpowers/contexts/sf-1.md
Design: docs/superpowers/designs/sf1-direction.md (BINDING — tokens) + docs/superpowers/designs/direction-c.html (structure/fidelity target)
Branch: sf-1-wakii-site → merge no-ff vào story/fi289-wakii-site

## Token precedence decision
`sf1-direction.md` là nguồn token duy nhất (user đã duyệt). `direction-c.html` thắng về
layout/structure/behavior. Điểm lệch (bg #0A0E0D vs #070A08, v.v.) → hand-off thắng.

## Tasks

- [x] 1. Astro scaffold: package.json, astro.config.mjs, tsconfig.json, deps (astro, @astrojs/sitemap); i18n config: defaultLocale 'en', locales ['en','vi'], prefixDefaultLocale: false; content.config.ts — docs collection, loader theo locale subdirectories (src/content/docs/en|vi/*); `astro build` xanh.
- [x] 2. Design tokens: src/styles/tokens.css — đủ 10 token theo hand-off (font-mono JetBrains Mono, font-sans Inter, bg #0A0E0D, bg-raised #101614, border #1E2A26, accent #45E0A8, accent-dim #2A6B52, text #D7E2DD, text-dim #6B7A74, warn #E8A33D) + radius/shading/spacing rules.
- [x] 3. Base.astro: html shell, font links, meta (title/description helper qua props), hreflang pair tags (EN canonical + VI alternate + x-default), slot; global styles import.
- [x] 4. Nav.astro: logo text `~/wakii.`, links (features/workflow/quickstart/faq — placeholder anchors), nav CTA; responsive ẩn links.
- [x] 5. Footer.astro: link repo (REPO_URL), `Upstream: Orca (MIT)`, © Wakii.
- [x] 6. LangSwitcher.astro: `EN | VI`, map URL hiện tại ↔ locale tương ứng; trang VI thiếu → fallback EN (không 404).
- [x] 7. REPO_URL constant: src/config.ts (1 nơi duy nhất, placeholder rõ ràng + comment SF-4 confirm).
- [x] 8. Landing placeholder EN (/) theo direction-c.html: hero terminal window (traffic lights, boot log type-in ~1.6s chạy 1 lần, skip prefers-reduced-motion, cursor blink CSS) + headline + tagline + 2 CTA + hero-meta strip; zero-setup strip 3 cột; features grid 6 hàng file-listing; workflow ASCII pipeline; quickstart teaser 3 dòng + link /docs/getting-started; FAQ accordion; thứ tự cố định.
- [x] 9. Landing VI (/vi/): cùng structure, copy tiếng VI placeholder.
- [x] 10. Doc slug contract: 5 route placeholder × 2 locales — /docs/{getting-started,superpowers-panel,story-workflow,agents-and-kit,faq} + /vi/docs/* — render qua docs layout tối thiểu (title + "coming in SF-3" + nav/footer).
- [x] 11. 404 page (/404 → 404.astro) mono style.
- [x] 12. robots.txt (public/) cho phép all + sitemap URL placeholder.
- [x] 13. Logo: copy wordmark từ orca repo resources/logo.svg → public/, subtitle đổi thành positioning mới, convert <text> → outline path (render đồng nhất cross-OS); dùng trong nav nếu kích thước phù hợp.
- [x] 14. vercel.json: buildCommand astro build, output dist/, cleanUrls; deploy preview nếu credentials có — không có → note vào FI-290 (deploy proof hoãn, không block).
- [x] 15. Kit license verify: đọc LICENSE của origin superpowers kit → verdict + bằng chứng (path + snippet) vào docs/superpowers/notes/kit-license.md.
- [x] 16. Final build + preview local + browser verify 3 tầng + code-reviewer + merge no-ff + audit comment + story-verify gate + FI-290 Done.

## v2 REWORK — Modern Bento Premium (D3, user đổi direction 2026-09-04)

- [x] 17. Tokens v2: --bg-card #131A17, --font-display, radius cells 8-12px (bento) / buttons 6px, wrap 1240px, bento gap 18px; giữ DNA v1 (mint/near-black).
- [x] 18. Mockup kit components có props: TerminalBoot, BracketCanvas (nodes/edges/tiers + auto-scale), AgentGrid, GatesStrip (src/components/mockups/).
- [x] 19. Landing v2 bento bất đối xứng 12-col: hero 2-col (text + terminal cell), features = bento showcase 6 cells (bracket canvas lớn, agents, gates, memory, watchdog, stats), zero/workflow/quickstart/FAQ giữ structure v2; tilt-3D ±4deg lerp, parallax translate3d 3 tốc độ, reveal stagger 60ms, prefers-reduced-motion tắt toàn bộ, transform/opacity only.
- [x] 20. Strings v2 (en+vi) cho bento content; build + verify + browser 3 tầng + code-reviewer + merge no-ff + gate + FI-290 Done.
