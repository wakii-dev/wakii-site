# SF-3 (FI-67) evidence — Reading navigation: TOC scrollspy + progress + back-to-top

Worktree: `sf-3-article-reading` · Branch: `story-fi63-article-reading-sf-3`
Base: `320c05a` (chứa SF-1 merge) · Post thử nghiệm: `building-wakii-in-the-open-log-1` (EN+VI)
Method: `astro build` → `astro preview` (localhost:4321) → headless Chrome
(`--headless=new` desktop 1440×900 / mobile window 375×700) + CDP
(`scripts/sf3-shot.mjs` — scroll thật + click để bắt trạng thái runtime).

## BEFORE (base 320c05a — trước SF-3)

| File | Cho thấy |
|---|---|
| `before-en-desktop-top.png` | TOC cũ là box "CONTENTS" inline đầu `.prose`; rail trái chỉ có recent-posts; không progress/back-to-top |
| `before-en-mobile-375-top.png` | TOC box mở-toàn-đầu-bài (không collapse) |
| `before-vi-desktop-top.png` / `before-vi-mobile-375-top.png` | Parity VI trước thay đổi |

## AFTER

| File | Cho thấy |
|---|---|
| `after-en-desktop-top.png` | Rail TOC "ON THIS PAGE" trong `bd-sidebar` (trên recent-posts); box ẩn >800px; progress scaleX(0); button ẩn |
| `after-en-desktop-scrolled.png` | Cuộn 60%: mục "What's next" highlight (mint + left-bar + weight, KHÔNG color-only) qua `aria-current="location"`; progress bar mint ~60% dưới nav 58px; rail ghimsticky top:96 |
| `after-en-desktop-backtotop.png` | Cuộn ~95%: nút "↑" floating hiện (is-visible); pager hiển thị **category · date** ("build log · 2026-09-07" / "tech notes · 2026-09-08"), giữ prev=cũ / next=mới |
| `after-en-mobile-375-toc-collapsed.png` | 375px: chỉ TOC box "+ CONTENTS" đầu bài, mặc định ĐÓNG; rail ẩn ≤800px — không bao giờ 2 TOC cùng lúc |
| `after-en-mobile-375-toc-expanded.png` | Bấm summary → "− CONTENTS" mở danh mục |
| `after-vi-desktop-top.png` / `after-vi-desktop-scrolled.png` | VI: landmark "TRONG BÀI NÀY", box "NỘI DUNG"; scrollspy đang ở `#bước-tiếp-theo` (slug dấu hoạt động) |
| `after-vi-mobile-375-toc-collapsed.png` / `after-vi-mobile-375-toc-expanded.png` | Parity VI mobile |
| `after-en-desktop-short-viewport-9h2.png` | P1-5: viewport 900×600, bài 9 h2 (`agentic-landscape-50-projects`): rail + aside tự cuộn nội bộ, recent-posts/lang vẫn với tới được |

## Trạng thái runtime đo được (CDP `Runtime.evaluate`)

```
top:    {"scrollY":0,   "progress":"scaleX(0)",      "topVisible":false, "current":"#shipped-fi-305-…"}
scroll: {"scrollY":727, "progress":"scaleX(0.5998)", "topVisible":false, "current":"#whats-next"}
bottom: {"scrollY":1151,"progress":"scaleX(0.9497)", "topVisible":true,  "current":"#whats-next"}
VI:     {"scrollY":707, "progress":"scaleX(0.6002)", "current":"#bước-tiếp-theo"}
9h2:    {"scrollY":3137,"progress":"scaleX(0.5)",    "topVisible":true,  "current":"#editors-and-ides-7"}
```

## Ghi chú kỹ thuật

- **Dual-render (P0-1):** `BlogToc.astro` render 2 lần (`variant="rail"` trong
  aside / `variant="box"` đầu `.prose`), CSS toggle trong component
  (rail ẩn ≤800px, box ẩn >801px). Gate ≥3 h2 giữ nguyên. Landmark phân biệt:
  rail = `<nav aria-label="On this page|Trong bài này">`; box = `<details>` với
  summary làm tên truy cập (không duplicate landmark). Labels en+vi nằm TRONG
  component — UI record layout KHÔNG thêm key (P0 strings rule).
- **Sticky fix (region SF-3, không đụng grid `.bd-shell`):** aside cũ cao
  1220px > viewport → sticky `top:96px` trôi khỏi màn hình khi cuộn (bottom
  chạm đáy shell) → scrollspy không nhìn thấy. Fix: `.bd-sidebar`
  `max-height: calc(100vh - 128px)` + `overflow-y: auto` (thin scrollbar) —
  rail ghim xuyên suốt khi đọc; mobile ≤800px reset (static, flow tĩnh).
  `flex-shrink: 0` trên `.toc--rail` chống flex nén rail về 0 trong aside
  max-height.
- **Scrollspy:** scan rect "heading cuối trên dòng 40% viewport" chạy trong
  rAF scroll loop (idempotent, đúng cả khi jump/anchor) + IntersectionObserver
  (band -60%) làm trigger phụ cho shift không do scroll. Rail tự cuộn giữ
  mục active giữa rail (10+ h2).
- **No-JS:** 2 variant TOC là anchor list tĩnh (link + id từ markdown
  pipeline); progress/button là JS-injected → tự ẩn. Đã verify HTML tĩnh
  trong dist có đầy đủ link.
- **JS quota:** `reading-nav.ts` = 104 dòng (cả comment) — ≤120 quota chung
  SF-2/3/4.
- **reduced-motion:** scrollspy/progress/back-to-top vẫn hoạt động (chức năng,
  không phải trang trí); chỉ bỏ smooth-scroll + transition (CSS media query).
- **a11y:** TOC link là `<a href="#id">` native (Tab + Enter); `aria-current`
  đọc được bởi SR; progress `aria-hidden` (redundant); button có
  aria-label locale; nút ẩn dùng `visibility:hidden` (ra khỏi tab order);
  marker +/− là `span[aria-hidden]` (pseudo-content không vào a11y tree).

## Review round 1 (code-reviewer) — 2 P1 đã fix + verify CDP

| Finding | Fix | Verify |
|---|---|---|
| P1: media-gap (800,801) — cả 2 TOC hiện cùng lúc ở viewport lẻ | `min-width:801px` → `not all and (max-width:800px)` | CDP 799/800/801/802 → visible `.toc` = 1 |
| P1: back-to-top ẩn vẫn tab-được (WCAG 2.4.7) | `visibility:hidden` + `.is-visible{visibility:visible}` | computed hidden/0 @top · visible/1 @bottom |
| P2: scrollspy chỉ highlight rail (map last-wins) | Map slug→[links], set cả rail + box twins | CDP 375px: `.toc--box .toc-link[aria-current]` ✓ |
| P2: setActive chạy mỗi frame không guard | `if (id === currentId) return` | code |
| P2: summary `::before "+ "` vào a11y tree | marker `span[aria-hidden]` | code + SR tree |
