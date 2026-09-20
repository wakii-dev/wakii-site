# SF-1 Context Pack — OG meta contract

> Đọc file này THAY VÌ tự tổng hợp từ bracket + epic + comments.
> Epic spec: `docs/superpowers/specs/2026-09-20-link-preview-design.md` (rev 3).
> Bracket: `docs/superpowers/brackets/fi-pending-link-preview.md` (remap khi có epic ID).
> Pack này slice sẵn: spec phần SF-1 + touch map + acceptance + boundary.

## Spec slice (chỉ phần SF-1 chịu trách nhiệm)

1. **Contract ADDITIVE (D1)** — mọi field mới vào `src/layouts/Base.astro` props với default GIỮ nguyên hành vi cũ (khuôn carve-out `ogImageAlt` FI-349 rev 2). Không đổi ý nghĩa field cũ. `og:url`/canonical tiếp tục `SITE_URL` (wakii.xyz — KHÔNG đổi).
2. **og:site_name (D3)** — `<meta property="og:site_name" content="wakii">` từ `SITE_NAME` config, hardcode trong Base, không prop mới per-page.
3. **og:locale (D2)** — derive từ `pathname` trong Base (`isVi` đã có ở dòng ~53): EN → `en-US`, VI → `vi_VN`; + `<meta property="og:locale:alternate">` trang còn lại (`vi_VN`/`en-US`). Không prop mới.
4. **Twitter mirrors (D4)** — thêm `<meta name="twitter:image">` song song `property="og:image"` và `<meta name="twitter:image:alt">` song song `property="og:image:alt"` (Twitter đọc `name=`, fallback property= không đảm bảo).
5. **og:image:type** — `image/png` (og-default + heroes đều PNG).
6. **Blog post truyền đủ (D4)** — `src/layouts/BlogDetailLayout.astro` truyền thêm vào `<Base>`: `ogImageAlt={entry.data.title}` (prop Base đã có từ FI-349, dead wiring tới nay), `articleAuthor={entry.data.author}`, `articleTags={entry.data.tags}` → Base render `article:author` (name string) + 1 `article:tag` per tag. `og:type=article` + `publishedTime` giữ nguyên.
7. **Docs fallback hardening (D5)** — `src/layouts/DocsLayout.astro` khi `description` undefined → fallback title-based per-locale (KHÔNG rơi SITE_TAGLINE). KHÔNG đổi schema `content.config.ts` sang required. Hiện trạng: 10/10 docs CÓ description (latent-only — đây là hardening, không phải fix).
8. **Pages description audit (D5)** — DERIVED SET, không hand-enumerate. **Vi phạm thật duy nhất hôm nay: landing EN** — `src/pages/index.astro:8` truyền tường minh `description={SITE_TAGLINE}`. ĐÃ verify ổn (đừng "sửa" thêm): landing VI (`vi/index.astro:7` có description riêng), roadmap (`RoadmapPage.astro:53` truyền `c.description` per-locale — page wrapper mỏng, đừng nhầm lớp), skills, download (DownloadPage:33,49), 404, listing, category, docs ×2 locale. Sweep verify toàn page set trên dist: non-empty ∧ ≠ SITE_TAGLINE ∧ pairwise-distinct ∧ locale khớp. Copy mới "có nghĩa" (landing EN) → đăng epic comment chờ owner ACK trước merge (precedent VI copy FI-300/FI-294).
9. **Icons (D11)** — `public/apple-touch-icon.png` 180×180 (PNG qua Chrome headless screenshot — dependency sẵn có) + `public/favicon.ico`. **Lưu ý cơ chế**: Chrome `--screenshot` CHỈ xuất PNG, KHÔNG xuất ICO → favicon.ico = node script wrapper ~20 dòng bọc PNG 32×32 vào header ICO (không thêm dependency). Dùng brand `public/wakii-icon.svg` hiện có trong public/ (icon master `w.` chưa vào main). Link tags trong Base (thuộc `base-meta-contract`): `rel="apple-touch-icon"` + favicon.ico trước favicon.svg.
10. **Thứ tự tuần tự PIN (chống contention Base.astro)** — các task SF-1 chạy TUẦN TỰ theo thứ tự: `base-meta-contract` (mọi edit Base.astro gộp một: site_name + locale/alternate + twitter mirrors + og:image:type + icon link tags) → `blog-article-props` (BlogDetailLayout) → `docs-description-fallback` → `pages-description-audit` → `icons-assets` → `self-verify-dist`. KHÔNG parallelize 2 task cùng chạm Base.astro.

## Touch map (files SF-1 tạo/sở hữu)

```
src/layouts/Base.astro             — EDIT (base-meta-contract: site_name, locale, mirrors, image:type, icon links — MỘT task duy nhất)
src/layouts/BlogDetailLayout.astro — EDIT (blog-article-props: ogImageAlt + author + tags)
src/layouts/DocsLayout.astro       — EDIT (fallback description)
src/pages/index.astro              — EDIT (pages-description-audit: landing EN description mới — owner ACK)
public/apple-touch-icon.png        — NEW (180×180)
public/favicon.ico                 — NEW (PNG→ICO wrapper node ~20 dòng, KHÔNG thêm dep)
```
READ-ONLY: `src/content/blog/**` (SF-2 sở hữu), `scripts/render-blog-heroes.mjs` (SF-2), `scripts/check-jsonld.mjs` (SF-3 sở hữu pattern; SF-1 không sửa — chỉ không phá assert của nó), `src/pages/rss.xml.js` (SF-3).

## ACCEPTANCE (user-visible)

- View-source post bất kỳ (EN + VI): đủ og:title (chứa title post), og:description (description post), og:image (absolute), og:site_name `wakii`, og:locale `en-US`/`vi_VN` + alternate, twitter:image + twitter:image:alt (name=), article:author + article:tag, og:image:type.
- Mọi page trong dist: description riêng (không page nào còn meta description == SITE_TAGLINE — vi phạm duy nhất trước story này là landing EN, đã sửa).
- Browser tab bookmark iOS/Android + Zalo share thấy icon brand (apple-touch-icon + favicon.ico tồn tại, link tags đúng).
- (Sau khi domain live — ngoài scope SF-1): card share hiện đủ title/description/site name/locale.

## Boundary (KHÔNG làm)

- KHÔNG viết check script/assert mới — toàn bộ harness dồn SF-3 (chống duplicate). SF-1 self-verify: `npm run build` xanh + inspect dist thủ công + `npm run check:jsonld` không vỡ.
- KHÔNG đụng `src/content/blog/**` frontmatter, `scripts/render-blog-heroes.mjs` (SF-2).
- KHÔNG đụng `src/pages/rss.xml.js`, không tạo `scripts/check-og.mjs` (SF-3).
- KHÔNG đổi `SITE_URL`, không flip domain, không đụng og:url/canonical (pinned FI-339).
- KHÔNG biến docs description thành required trong schema.
- Copy VI mới cho pages → đăng epic chờ ACK, KHÔNG tự merge khi chưa có ACK.
