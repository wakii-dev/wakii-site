# SF-3 (FI-297) Design Direction — FINAL (user-selected: B — Bento Composer)

Prototype (source of truth cho mọi con số dưới đây): `/tmp/story/fi294/design/sf3-b.html`
Context pack: `docs/superpowers/contexts/fi294-sf-3.md` (branch `story/fi294-site-content-depth`)
Visual authority: `docs/superpowers/designs/sf1-direction.md` (v2 Modern Bento Premium) — direction này KHÔNG đổi tokens, chỉ áp dụng.

## 1. Direction — Bento Composer

Asymmetric bento 12-col (steps chiếm 8/4) + tilt-3D trên cell + kanban 3-lane cho roadmap.
Lý do khớp binding v2: cùng canvas near-black, cùng panel chrome (label bar + border + mono),
cùng mint accent — Get Wakii và /roadmap đọc như hai "surface" của cùng một hệ, đúng ngôn ngữ
Bento Premium đã chốt ở sf1-direction. Asymmetry tạo hierarchy tự nhiên: install steps là hero
của section, requirements/CTA là sidebar; kanban 3-lane là hình ảnh trực diện nhất của
Now/Next/Later không cần giải thích.

## 2. Tokens

### Colors
| Token | Value | Dùng |
|---|---|---|
| `--bg` | `#0A0E0D` | page canvas |
| `--bg-raise` | `#101614` | bento cell (bx-in), lane-in |
| `--panel` | `#131A17` | bx-label bar, lane-head, stp, card |
| `--line` | `#1E2A26` | border chính, divider |
| `--line-strong` | `#2B4234` | border cell ngoài, pill, ghost btn |
| `--text` | `#D7E2DD` | body |
| `--text-dim` | `#6B7A74` | desc, sub |
| `--text-faint` | `#46554E` | kicker, meta, foot |
| `--accent` | `#45E0A8` | mint — numeral, prefix, CTA, lane Now |
| `--accent-dim` | `rgba(69,224,168,0.1)` | tag-now bg |
| `--amber` | `#E8A33D` | lane Next ONLY (title, tag) |
| `--amber-dim` | `rgba(232,163,61,0.12)` | tag-next bg |
| on-accent | `#04140D` | text trên nền mint (btn-primary, selection) |
| lane borders | `rgba(69,224,168,.45)` now · `rgba(232,163,61,.4)` next · `var(--line-strong)` later | viền lane-in per lane |

Later-lane không có màu riêng: title dùng `--text-dim`, cards `opacity: .72`.

### Typography
- Font: **JetBrains Mono** (400 / 500 / 700 + italic 400), fallback monospace. Toàn site đã dùng — không thêm font.
- `h2` section: `clamp(26px, 3.5vw, 40px)` w700 ls -0.02em, prefix `// ` màu accent w400 (CSS ::before)
- kicker: 12px `--text-faint` ls 0.08em, prefix `## ` accent (CSS ::before), margin-bottom 20px
- section sub `p`: 14px `--text-dim`, max-width 640px, margin-top 14px
- bx-label: title `.t` 12.5px w700 text màu `--text`, prefix `▸ ` accent; meta phải 11.5px faint
- stp: numeral `.n` 24px w700 accent; `h3` 15px w700 + `.cmt` 10.5px italic faint; `p` 12.5px dim; `.cmd` 12.5px accent trên nền `--bg`, border line, radius 6px, prefix `$ ` faint, `white-space: nowrap; overflow-x: auto`
- req-row: 13px, name prefix `✓ ` accent; req-note 11.5px dim, border-top line, `code` 11px accent
- btn: 13.5px, prefix `> ` opacity .55; primary mint/on-accent w500; ghost border line-strong / text-dim
- lane-title 17px w700 ls -0.01em (màu theo lane), prefix `▸ ` faint w400
- lane-when: 10px ls 0.14em UPPERCASE faint, pill border line-strong radius 20px
- card: tag 9px ls 0.12em pill; `h3` 13.5px w700 lh 1.45; `p` 12px dim mt 6px
- lane-foot: 10.5px faint ls 0.06em, border-top **dashed** line
- body base: 14px / lh 1.7; `::selection` bg accent / color on-accent

### Spacing (base 4px)
- Section Get Wakii: padding `92px 0 64px`; /roadmap: `92px 0 110px` + `border-top: 1px solid var(--line)`
- bento/lanes grid gap: 18px; section-head margin-bottom 44px; wrap max-width 1240px, padding 0 32px (20px @≤720px)
- bx-body 22px 24px; bx-label 13px 18px; steps gap 14px; stp padding 18px 20px, gap 4px 18px, grid-cols `52px 1fr`
- lane-head 16px 20px; lane-body 14px, gap 12px; card padding 15px 17px; lane-foot 11px 20px
- gw-note: mt 20px, border-left 2px accent, padding 6px 0 6px 18px, max-width 820px

### Radius / Shadow
- radius: cell 14px · stp 10px · card 9px · cmd/btn 6px · pill/tag 20px
- shadow hover bx-in: `0 24px 70px rgba(0,0,0,.5), 0 0 40px rgba(69,224,168,.07)`
- shadow hover btn-primary: `0 0 32px rgba(69,224,168,.35)`

## 3. Structure

### Surface A — `src/components/landing/get-wakii.astro` (SF-3 sở hữu, THAY quickstart)
Anchor decision: **`id="get-wakii"`** (đổi từ `#quickstart`; cập nhật mọi internal anchor refs — nav, footer, landing CTA nếu có).

Grid 12 col, 2 rows, gap 18px:
- **bx-steps** — `grid-column: 1 / 9; grid-row: 1 / 3`. bx-in = bx-label (`install sequence` + meta phải `3 steps · exit 0`) + bx-body chứa 3 `.stp` xếp dọc (gap 14px). Mỗi stp: numeral | h3 (title + `.cmt` italic comment) / p desc / .cmd code.
- **bx-req** — `grid-column: 9 / 13`. bx-label (`requirements` + `pre-flight`) + req-rows (mỗi item 1 dòng flex space-between, ✓ prefix, border-bottom dashed trừ dòng cuối) + req-note (check versions + `code`).
- **bx-cta** — `grid-column: 9 / 13`. bx-label (`repository` + `github`) + cta-body (column, gap 14px): btn-primary repo → `REPO_URL`; (tuỳ binding, xem §5) btn-ghost guide → `/docs/getting-started/`.
- **gw-note** dưới grid (ngoài bento): border-left accent, nội dung = key `note`, `<b>` quanh cụm đầu.

Heading hierarchy: kicker (`getWakii.kicker`) → h2 (`getWakii.title`, prefix `//`) → p sub (`getWakii.sub`). Đây là pattern chung cho cả 2 surface.

### Surface B — `src/pages/roadmap.astro` + `src/pages/vi/roadmap.astro` (MỚI)
- section-head: kicker `roadmap` → h2 page title → p sub (mô tả "no release cadence" — page chrome, xem §5).
- `.lanes`: grid `repeat(3, 1fr)`, gap 18px, `align-items: start`, `min-width: 0` trên lane (gotcha repo).
- Mỗi **lane** (class `now` / `next` / `later` theo index 0/1/2 của `roadmap[]`):
  - `lane-in`: border tinted theo lane (bảng tokens), radius 14px, bg-raise
  - `lane-head`: lane-title (label_en/label_vi, màu theo lane) + lane-when pill (`when`)
  - `lane-body`: cards xếp dọc gap 12px — mỗi card: tag pill (text static theo lane) + h3 (item.title) + p (desc_en/desc_vi)
  - `lane-foot`: 1 dòng chrome; lane.now có `● ` accent nháy trước foot
- Card anatomy đầy đủ: `[tag] → [h3] → [p]`, padding 15px 17px, panel bg, border line, radius 9px.

## 4. Behavior

### Entrance reveal — TIÊU THỤ motion util SF-1 nguyên trạng (không viết observer riêng)
Tham số tương đương prototype (nếu util khác signature, util thắng):
- opacity 0→1 + translateY(22px)→0; duration **650ms**; easing `ease` (opacity) / `cubic-bezier(.2,.7,.3,1)` (transform)
- stagger step **70ms**; trigger IntersectionObserver threshold **0.1**, unobserve sau khi fire (chạy 1 lần)
- Thứ tự stagger Surface A: kicker → h2 → sub → steps(d1) → req(d2) → cta(d3) → note(d4)
- Thứ tự Surface B: kicker → h2 → sub → lane now(d1) → next(d2) → later(d3)

### Tilt-3D — CHỈ trên bx-in của Surface A (KHÔNG áp cho lane containers / cards)
- `perspective(900px) rotateX/rotateY`, max **±4deg** (input chuẩn hoá −0.5..0.5 × 8)
- lerp factor **0.12** qua requestAnimationFrame; về 0 rồi clear transform khi |delta| < 0.05; mouseleave → target 0
- `transform-style: preserve-3d; will-change: transform` trên bx-in; transition box-shadow/border-color 250ms ease, transform 120ms linear
- **Production bổ sung so với prototype**: guard `matchMedia('(hover: hover) and (pointer: fine)')` — tilt chỉ chạy desktop pointer, tắt hẳn trên touch.

### Hover states
- bx-in: border → accent + shadow lift (250ms ease)
- stp / card: border → accent + translateY(−2px) (200ms)
- btn-primary: translateY(−1px) + mint glow; btn-ghost: border + text → accent
- lane-foot now: `●` blink `1.4s steps(1) infinite` (`@keyframes blink { 50% { opacity: 0 } }`)

### Reduced motion (`prefers-reduced-motion: reduce`) — chính xác:
- Mọi phần tử reveal **hiển thị ngay** (opacity 1, transform none, transition none) — KHÔNG đợi observer
- Tilt script **early-return hoàn toàn** (không bind mousemove)
- Blink `●` tắt (`animation: none`)
- Nếu motion util SF-1 có reduced-handling riêng → xử lý của util thắng, miễn kết quả tương đương.

## 5. Content binding

### Surface A — keys từ `src/i18n/landing.ts` (`getWakii`, có sẵn EN+VI, KHÔNG sửa file này)
| Key | Đích render |
|---|---|
| `kicker` | kicker (prefix `## ` bằng CSS) |
| `title` | h2 (prefix `// ` bằng CSS) |
| `sub` | section-head p |
| `steps[i].n` | numeral slot của stp — render NGUYÊN CỤM (`step 01` / `bước 01`); prototype chỉ hiện "01" là shorthand, font numeral có thể giảm nếu cụm dài |
| `steps[i].comment` | `.cmt` italic sau h3 (`// clone` đã có sẵn trong data) |
| `steps[i].title` / `.desc` | stp h3 / p |
| `steps[i].cmd` | `.cmd` — data chứa literal `<repo-url>` → **interpolate `REPO_URL` lúc render** (text hiển thị lẫn mọi href) |
| `reqTitle` | bx-label `.t` của requirements cell |
| `reqItems[]` | req-row — data là flat string (`Node.js 24`), KHÔNG tách name/ver như prototype; 1 dòng + ✓ prefix |
| `repoCta` | btn-primary, href = `REPO_URL` |
| `note` | gw-note, bọc cụm đầu trong `<b>` |

- **REPO_URL**: import từ `src/config.ts` (`export const REPO_URL = 'https://github.com/wakii/wakii'`, PLACEHOLDER). PLACEHOLDER-MODE: href == constant là đủ, KHÔNG đòi URL thật, KHÔNG hardcode github URL nào trong component.
- **Ghost guide button**: prototype có "full guide: /docs/getting-started" nhưng KHÔNG có key. Quyết định: reuse `hero.ctaGhost` ("read the guide" / "đọc hướng dẫn"), href `/docs/getting-started/` (trailing slash — bắt buộc).
- **cta-sub dòng "releases are on the roadmap" trong CTA cell: DROP** — `getWakii.note` (gw-note) đã phủ thông điệp; tránh trùng lặp và tránh copy VI mới (VI gate riêng).
- **bx-label texts** ("install sequence", "3 steps · exit 0", "pre-flight", "repository", "github"): chrome terminal giữ EN nguyên trạng ở cả 2 locale (đúng pattern hero boot log EN-only của landing).
- **Accuracy guard**: verify cmd steps khớp `getting-started.md` trước merge; lệch → flag lên epic, KHÔNG tự sửa keys.
- **Nav-cta decision** (context pack §6): giữ "get wakii" → `/docs/getting-started/` như hiện tại; ghi note lên epic khi SF-3 done (chuyển sang REPO_URL là việc publish checklist story 1).

### Surface B — `src/data/roadmap.ts` (SF-1 sở hữu, READ-ONLY)
- `roadmap[]` iterate theo index → lane class `now`/`next`/`later`
- `label_en` / `label_vi` → lane-title (chọn theo locale trang)
- `when` → lane-when pill (`Q4 2026` / `2027` / `later` — giữ nguyên, intentionally fuzzy)
- `items[].title` → card h3; `items[].desc_en` / `desc_vi` → card p
- **Nội dung = verbatim từ data, KHÔNG thêm/sửa item** (đã duyệt ở spec §4). Thiếu gì → flag epic.
- **Page chrome KHÔNG có trong data** (dev hardcode trong roadmap page, EN+VI): kicker `roadmap`, h2, section sub ("Three lanes, deliberately fuzzy…"), lane-foot 3 câu, tag text (`IN FLIGHT` / `QUEUED` / `SOMEDAY`). Quyết định: **tag + lane-foot + labelschrome giữ EN cả 2 locale** (mono terminal chrome, tránh VI copy gate) — section h2/sub PHẢI có VI (là content thật, đi qua VI gate).
- SEO: `/roadmap` ↔ `/vi/roadmap` — canonical + hreflang 2 chiều + lang switcher 2 chiều, same verify pattern SF-2.

## 6. Responsive

| Breakpoint | Thay đổi |
|---|---|
| `≤980px` | bx-steps full width (col 1/13, row auto); bx-req + bx-cta side-by-side `span 6`; **lanes stack 1 col** (giữ DOM order Now → Next → Later); tilt OFF (không pointer fine) |
| `≤720px` | bx-req + bx-cta full width (col 1/13); stp về 1 col (numeral trên, p/cmd dưới); wrap padding 32→20px; nav-links ẩn (nav do SF-1 sở hữu — ghi chú tham khảo) |
| `@390px` | phải ZERO horizontal scroll: `.cmd` `white-space: nowrap` + `overflow-x: auto` (scroll nội bộ trong cmd, không đẩy layout); `min-width: 0` trên mọi grid cell; lane-when pill `white-space: nowrap` (nếu chật → cho phép lane-head wrap xuống dòng) |

Verify responsive bằng same-origin iframe probe @390 (đo scrollWidth) — không tin screenshot headless (gotcha repo).

## 7. Acceptance hints (dev phải verify)

1. Landing EN+VI: quickstart bị THAY hoàn toàn (không còn 2 section); anchor `#get-wakii` scroll đúng chỗ; steps render đúng keys verbatim và cmd hiển thị URL thật từ `REPO_URL` (không còn literal `<repo-url>`).
2. Click repo CTA → href === constant `REPO_URL` từ `src/config.ts`; grep component: zero hardcoded github URL.
3. `/roadmap` + `/vi/roadmap`: 3 lane đúng thứ tự, nội dung khớp `roadmap.ts` verbatim (đếm card: 2/3/3), lang switcher 2 chiều, canonical + hreflang đúng; VI trang không còn phrase EN nào ngoài chrome đã thoả thuận (tag/label terminal).
4. Reveal chạy qua motion util SF-1; bật `prefers-reduced-motion` → toàn bộ content visible ngay, không tilt, không blink, không transition; tilt không bind trên touch device.
5. @390px: không horizontal scroll (cmd scroll nội bộ); later-lane cards opacity .72; nav-cta vẫn trỏ `/docs/getting-started/`.

---
*Design direction by designer agent — prototype `/tmp/story/fi294/design/sf3-b.html` (mở trực tiếp được). Mọi con số layout/spacing lấy từ file này; dev implement 1:1.*
