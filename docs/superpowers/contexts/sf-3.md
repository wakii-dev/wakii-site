# Context pack — FI-339 SF-3: Convergence QA toàn site

Source spec: `docs/superpowers/specs/2026-09-07-blog-features.md` (rev 2). SF-1 (SEO surface) + SF-2 (10 posts) đã merged vào story branch. Việc này = QA regression TOÀN SITE + blog contracts + browser check trước khi owner merge.

## Spec slice
**Baseline regression (chính xác theo nhóm tag):** build dist từ **main TRƯỚC story branch** (commit `fae770d^` tức `65715ac` — hoặc main tip trước story merge) làm baseline; so với dist story branch. Expected diff: THÊM og:*/twitter:card/article:published_time + RSS autodiscovery link trên mọi page. Bất biến (fail nếu khác): **canonical** (self-referencing per locale), **hreflang en/vi/x-default**, **noindex của 404** — trên 5 surfaces: landing `/` + `/vi/`, `/download/` + `/vi/download/`, 1 docs page sample (vd `/docs/getting-started/`), 404.
**Blog contracts 100%:** mọi 10 post pages: `og:image` absolute `https://wakii.xyz/og-default.png`, `og:type=article` + `article:published_time`, `twitter:card=summary_large_image`, `og:url`=canonical, `og:image:width/height/alt`; listing pages: `og:type=website`; RSS autodiscovery present.
**Browser check:** serve dist (`pnpm preview` hoặc tương đương) → mở `/blog/` + `/vi/blog/` + 1 post trong Orca tab — listing hiển thị 5 posts đúng badge/category, post đọc hết bài không vỡ layout, TOC box hiển thị đầu article, dark/light ổn.
**Final build:** `pnpm build` pass clean (parity script green non-vacuous 10/10).

## Touch map
- Chủ yếu ĐỌC/VERIFY: dist output, browser, git
- Fix-loop: sửa code/content phát hiện lỗi → commit vào story branch (theo đúng lỗi, atomic)
- KHÔNG đụng: content.config.ts, astro.config.mjs, Nav.astro, vercel.json

## ACCEPTANCE (evidence: diff output + browser screenshots/notes)
- Regression diff: chỉ có expected additions (og/rss lines), canonical/hreflang/noindex bất biến trên cả 5 surfaces — in diff vào report
- 10 post pages: đủ og contract (grep từng trang, 10/10 pass)
- Browser: /blog/ + /vi/blog/ + ≥1 post hiển thị đúng (dark + light, mobile width 390px check nhanh)
- `pnpm build` cuối: pass, parity 10/10, sitemap 10 URLs, RSS 10 items
- Report tổng hợp pass/fail từng dòng ACCEPTANCE spec (7 success criteria) gửi Epic comment

## Boundary
- KHÔNG tự set FI-339 Done — báo verdict, PM xử lý
- KHÔNG deploy/merge — merge là human gate
- Lỗi content (typos/facts) → list ra, fix qua SF-2 path (content commit), không sửa l Süd trong QA
- KHÔNG mở scope mới (mobile nav hamburger, category pages… = out-of-scope spec)
