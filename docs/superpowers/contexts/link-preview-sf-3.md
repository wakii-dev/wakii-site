# SF-3 Context Pack — Domain runbook + QA harness + convergence

> Đọc file này THAY VÌ tự tổng hợp từ bracket + epic + comments.
> Epic spec: `docs/superpowers/specs/2026-09-20-link-preview-design.md` (rev 3).
> Bracket: `docs/superpowers/brackets/fi-pending-link-preview.md` (remap khi có epic ID).
> Tier 1 — fork từ nhánh đích SAU khi SF-1 + SF-2 merged.

## Spec slice (chỉ phần SF-3 chịu trách nhiệm)

1. **check-og.mjs (D8)** — post-build assertion, khuôn `scripts/check-jsonld.mjs` (walk `dist/**/*.html`, extract meta, exit 1 + ✗ tên file khi vi phạm):
   - Mọi page: og:title, og:description (≠ SITE_TAGLINE), og:image absolute https trên site origin, og:type, og:site_name, og:locale.
   - Post pages (path-derived từ dist layout — khuôn `expectedTypes` check-jsonld:140, KHÔNG hand-enumerate): twitter:image:alt CHỨA headline (containment — og:title là fullTitle `title — wakii`), article:published_time, og:image resolution đúng: post khai heroImage → PNG file TỒN TẠI trong dist; không khai → og-default absolute.
   - **KHÔNG hardcode "duy nhất log-1"** — số post hero-less không phải gate vĩnh viễn (editorial batch tương lai được phép thiếu hero mà không đỏ build); assert chỉ về resolution correctness.
   - Regression guard: không phá `check-jsonld.mjs` (JSON-LD image cùng origin SITE_URL).
2. **Wire build (D8)** — `check:og` npm script + thêm vào `"build"` chain SAU `astro build`. `check:jsonld` GIỮ NGUYÊN vị trí manual (convention — không scope-creep wire thêm).
3. **--live domain probe (D9)** — `node scripts/check-og.mjs --live`: HEAD `https://wakii.xyz/` + og-default URL + 1 post URL; in PASS 200 / WARN 404 (hiện trạng: 404 DEPLOYMENT_NOT_FOUND — domain chưa attach project). KHÔNG fail build khi domain chưa lên (build xanh độc lập domain). Đây là bằng chứng 200 sau khi owner add domain.
4. **Owner runbook** — `docs/knowledge/runbooks/link-preview-domain.md` (dir mới — **đăng ký file vào KB MOC** theo maintenance rule convention FI-409): (a) add `wakii.xyz` + `www` vào project `wakii-site` trong Vercel dashboard (domain đang DNS-trỏ-Vercel nhưng không thuộc team nào CLI access được — `vercel domains ls` 0 ở cả 1foxglobal + vuhois-projects); (b) sau khi live: chạy `--live` probe + FB Sharing Debugger re-scrape + Zalo cache (thủ công — khó purge programmatically); (c) đăng bản rút gọn lên epic comment cho owner.
5. **RSS media (D10)** — `src/pages/rss.xml.js`: option `xmlns` của `rss()` khai `xmlns:media="http://search.yahoo.com/mrss/"`; **concat `<media:content url="<hero absolute>" medium="image"/>` vào CÙNG chuỗi `customData` đang chứa `<guid>`** (item đã có customData — KHÔNG phát minh trường song song); hero post, fallback og-default. KHÔNG thêm `<language>` (contract bilingual feed giữ nguyên).
6. **Crawler probe harness** — script/runbook: `curl -A <UA>` giả facebookexternalhit / Twitterbot / Slackbot / TelegramBot / Discordbot qua `astro preview`, in bảng meta từng crawler thấy (chứng minh crawler thấy meta, không chỉ browser).
7. **Sitemap/robots sanity (criteria PIN)** — `sitemap-index.xml` parse XML OK; số URL khớp kỳ vọng derived từ content collection; `robots.txt` valid và KHÔNG đổi nội dung.
8. **Convergence audit** — full `npm run build` (parity + utils + content + astro + check:og) + `npm run check:jsonld` + RSS well-formed (python parse — xmllint không chắc có máy) + đếm post page khớp derived set + kiểm og:locale trên sample EN/VI.
9. **Release checklist Phase 2** — build xanh + deploy manual `npx vercel deploy --prod --scope 1foxglobal` (nếu owner sẵn sàng) hoặc ghi rõ chờ; card mẫu cho owner test thật (share 1 link thật); checklist trong epic comment.

## Touch map (files SF-3 tạo/sở hữu)

```
scripts/check-og.mjs                — NEW
package.json                        — EDIT (check:og script + build chain)
src/pages/rss.xml.js                — EDIT (xmlns + media:content)
docs/knowledge/runbooks/link-preview-domain.md — NEW
scripts/crawler-probe.mjs (hoặc runbook command trong runbook) — NEW
```
READ-ONLY: `src/layouts/**` (SF-1), `src/content/blog/**` + `scripts/render-blog-heroes.mjs` + `public/blog/heroes/` (SF-2), `scripts/check-jsonld.mjs` (chỉ đọc làm khuôn — KHÔNG sửa), `src/config.ts`.

## ACCEPTANCE (user-visible)

- `npm run build` chạy qua check:og — assert toàn dist, đỏ rõ tên page khi vi phạm; xanh khi đủ.
- `node scripts/check-og.mjs --live` in trạng thái domain thật: WARN 404 hôm nay → PASS 200 sau khi owner add domain (bằng chứng không cần đụng dashboard).
- RSS feed parse sạch (XML well-formed + namespace media khai báo), mỗi post có ảnh trong item.
- Runbook 1 trang: owner làm theo được 5 phút (add domain) + biết purge cache FB/Zalo sau khi live.
- Crawler probe: 5 UA đều thấy đủ og meta trên preview server.
- Convergence: toàn bộ gates xanh; card mẫu sẵn sàng cho owner test share thật.

## Boundary (KHÔNG làm)

- KHÔNG sửa layouts/meta contract (SF-1 đã merge — bug thấy được → report + fix-task qua coordinator, KHÔNG tự sửa chéo).
- KHÔNG đụng content/frontmatter/heroes (SF-2).
- KHÔNG tự add domain (owner action — story chỉ giao runbook + probe).
- KHÔNG wire check:jsonld vào build (giữ convention).
- KHÔNG deploy production nếu owner chưa ACK (deploy manual — chỉ chạy khi owner yêu cầu trong epic).
