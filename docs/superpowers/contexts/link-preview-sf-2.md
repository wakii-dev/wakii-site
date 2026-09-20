# SF-2 Context Pack — Hero tile toàn bộ post

> Đọc file này THAY VÌ tự tổng hợp từ bracket + epic + comments.
> Epic spec: `docs/superpowers/specs/2026-09-20-link-preview-design.md` (rev 3).
> Bracket: `docs/superpowers/brackets/fi-pending-link-preview.md` (remap khi có epic ID).

## Spec slice (chỉ phần SF-2 chịu trách nhiệm)

1. **Mục tiêu (D6)** — 119/120 post có tile riêng 1200×630 làm og:image + hero trong trang (pattern 25 post hiện có: tile cùng lúc hiện `<img class="bd-hero">` trong detail + làm ảnh card share). **Pin giữ nguyên**: `building-wakii-in-the-open-log-1` KHÔNG có hero — post duy nhất exercise og-default fallback.
2. **Pipeline DERIVED** — `scripts/render-blog-heroes.mjs` derive set từ frontmatter (`heroImage: "/blog/heroes/<own-slug>.png"` strict match own slug). Sau khi batch frontmatter đầy, render + `--check` TỰ PHỦ full set — KHÔNG cần thêm mode mới.
3. **Wrap guard** — hiện `wrap()` slice(0,4) cắt câm khi title wrap >4 dòng (verified: 0/240 title hiện tại bị cắt, max 78 chars — guard là assert chống tương lai, đổi slice thành fail rõ + tên file).
4. **pngquant (D7)** — cài `brew install pngquant` (nhất quán với dependency Chrome cục bộ hiện có). Hook vào pipeline sau render. Policy exit-99 (quality floor không đạt): retry MỘT lần `--quality 50-90` → vẫn fail → giữ PNG gốc + WARN rõ (file + size) trong report — KHÔNG skip âm thầm, KHÔNG abort.
5. **Nén CẢ 25 tile cũ + og-default** — re-render deterministic từ SVG source commit cạnh + quantize → toàn bộ 119 tile đồng nhất ≤100KB (hiện 25 cũ ~230KB, tổng 5.7MB; 95 mới thô ~22MB nếu không nén). Cộng thêm `public/og-default.png` (163KB — fallback của log-1 VÀ mọi non-post page: landing/docs/listing) về ≤100KB.
6. **Edges nội bộ PIN** (thứ tự bắt buộc — chống commit 22MB rồi viết lại): `pngquant-hook` → `render-95-tiles`; `frontmatter-batch-en` → `render-95-tiles` (VI không cần — pipeline chỉ quét EN); `pngquant-hook` → `recompress-existing-tiles`. KHÔNG parallelize các cặp này.
7. **Batch frontmatter** — thêm `heroImage: "/blog/heroes/<own-slug>.png"` vào 95 EN + 95 VI còn lại (VI mirror path EN — convention hiện có). Commit batch RIÊNG 1 lượt để conflict surface rõ (editorial có thể đang ghi research/ nhưng content/blog là vùng này). Lưu ý slug chứa ký tự đặc biệt → QUOTE path khi git add.
8. **Visual QA** — sample tối thiểu: 1 title VI có dấu (wrap + glyph), title dài nhất hiện có (78 chars "Reviewing AI agents from your phone…"), đủ 3 category (tutorial/tech/build-log label); mobile-390 sanity: hero trong detail không vỡ layout, page-weight hợp lý (~100KB/tile sau nén), `width`/`height` đã set (CLS OK).
9. **Page render verify** — PostCard listing: featured cell hero slot đầy (band fallback chỉ còn log-1); detail trang hiện hero dưới meta row đúng vị trí.

## Touch map (files SF-2 tạo/sở hữu)

```
scripts/render-blog-heroes.mjs        — EDIT (wrap-guard assert + pngquant hook)
public/blog/heroes/*.png|.svg         — NEW 95×2 + RE-RENDER 25×2 (119 tiles)
src/content/blog/en/*.md              — EDIT (95 file: +heroImage)
src/content/blog/vi/*.md              — EDIT (95 file: +heroImage)
```
READ-ONLY: `src/layouts/**` (SF-1 sở hữu — KHÔNG đụng), `scripts/check-jsonld.mjs`, `src/pages/rss.xml.js`, `src/config.ts`. Chrome path hardcode macOS (`/Applications/Google Chrome.app/...`) — render là dev-machine step, chấp nhận (deploy vốn manual).

## ACCEPTANCE (user-visible)

- Share/preview card của post bất kỳ (trừ log-1) có ảnh riêng: title post trên tile mono + category label, brand mint/dark — không còn 2 post nào dùng chung ảnh.
- 119 file PNG 1200×630 trong `public/blog/heroes/`, mỗi file ≤100KB (trừ WARN exit-99 nếu có — ghi rõ trong report); `node scripts/render-blog-heroes.mjs --check` pass toàn bộ.
- Trang detail post hiện hero; listing featured cell không vỡ; log-1 vẫn dùng og-default (fallback path còn sống).
- EN + VI cùng slug dùng CÙNG file ảnh (VI frontmatter trỏ path EN).

## Boundary (KHÔNG làm)

- KHÔNG đụng layouts/Base/BlogDetailLayout/DocsLayout, icons, page descriptions (SF-1).
- KHÔNG viết check-og/assert build mới (SF-3) — verify của SF-2: `--check` + `npm run build` xanh + visual QA.
- KHÔNG đổi template SVG sang hướng khác (giữ DNA brand hiện có — đổi hướng = design gate, flag coordinator).
- KHÔNG cho log-1 có hero (pin fallback — phá pin = FAIL acceptance).
- KHÔNG compress bằng tool khác (sharp/resvg/mozjpeg) — pngquant duy nhất theo D7.
