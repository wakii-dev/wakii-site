# SF-2 Design Direction — FINAL (user-selected: B — Bento Catalog)

Source prototype: `/tmp/story/fi294/design/sf2-b.html` (self-contained, mở trực tiếp được).
Visual authority: `docs/superpowers/designs/sf1-direction.md` (v2 Bento Premium).
Route: `/skills` (EN) + `/vi/skills` (VI) — plain Astro pages, KHÔNG qua docs collection.

---

## 1. Direction

**Bento Catalog** — kế thừa nguyên DNA bento bất đối xứng + terminal mockup của landing v2 đã duyệt; mọi nội dung sâu (desc + how-it-works) hiển thị NGAY trong card, không accordion, không trang detail (non-goal đã chốt). Lý do: brand continuity tốt nhất cho site 13 trang + đúng mục tiêu "content depth" của FI-294 + tốt cho SEO/scanability.

## 2. Tokens

**Nguyên tắc: consume `src/styles/tokens.css` của SF-1 — KHÔNG sửa tokens.css.** Bảng dưới là giá trị prototype; nếu token tương ứng tồn tại rồi thì dùng token, giá trị literal chỉ dùng khi chưa có token tương đương (không thêm mới vào tokens.css trong SF-2 — flag PM nếu thiếu).

| Token | Giá trị | Dùng ở |
|---|---|---|
| `--bg` | `#070A08` | body background |
| `--bg-raise` | `#0B0F0C` | terminal body, card nền |
| `--panel` | `#0D1310` | term-bar, bx-label nền |
| `--panel-2` | `#101712` | (reserve, prototype không dùng trực tiếp) |
| `--line` | `#1C2B22` | border mảnh: nav, label divider, dashed how-divider |
| `--line-strong` | `#2B4234` | border chính: terminal, card, hero-stats |
| `--text` | `#D9E6DD` | body text, h3, label title |
| `--text-dim` | `#8FA697` | sub, desc, section-head p |
| `--text-faint` | `#5A7163` | kicker, how-it-works p, pill meta |
| `--accent` | `#45E0A8` | mint: `.hl`, `//`/`##`/`»`/`▸` prefix, `.v` stats, link |
| `--accent-dim` | `rgba(69,224,168,0.1)` | inline code bg, pill bg |
| selection | bg accent / text `#04140D` | `::selection` |

Typography:
- **JetBrains Mono** 400/500/700 — logo, nav, mọi heading (h1/h2/h3), kicker, label, pill, terminal, stats, footer
- **Inter** 400/500/600 — body, sub, desc, how-it-works p
- h1: `clamp(30px, 4.4vw, 54px)` / 700 / `-0.03em` / line-height 1.12, max-width 760px
- h2: `clamp(24px, 3vw, 34px)` / 700 / `-0.02em`
- h3 card: 15px / 700 mono (flagship big card: 18px)
- body base 15px / line-height 1.7; desc 13.5px (big card 14.5px); how p 12.5px (big card 13px, color text-faint — big card text-dim); kicker 12px / `letter-spacing:0.08em`

Spacing & shape:
- `.wrap` max-width 1240px, padding 0 32px (20px @≤620px)
- hero: `76px 0 60px`; section: `64px 0 8px`; section-head margin-bottom 34px
- bento gap 18px (12px @≤620px)
- radius: card 14px · terminal 10px · hero-stats 8px · pill 20px (full)
- shadow hover card: `0 24px 70px rgba(0,0,0,0.5), 0 0 40px rgba(69,224,168,0.08)`
- hero grid-background: 2 linear-gradient mint `rgba(69,224,168,0.035)` 1px, size 56px, mask radial ellipse 70%/70% tại 50% 10%

## 3. Structure

Thứ tự trang: **Nav (site hiện có, active "skills") → Hero → Install strip → 3 section bento → Footer (site hiện có)**.

**Hero**
1. `.kicker` — `## skills` (CSS `::before` content `"## "` màu accent)
2. `h1` — EN: `The kit, cell by cell.<br><span class="hl">13 skills</span>, fully explained` (số 13 DERIVE từ data, không hardcode)
3. `.sub` — đoạn dẫn với inline `<code>` mint (`git clone`, `make`)
4. `.hero-stats` — strip 3 ô viền chung (flex + border): `13 / public skills`, `3 / categories`, `MIT / license` — `.v` mono 20px 700 mint, `.k` 11px text-faint. Số derive từ filter data.

**Install strip** (id="install", ngay dưới hero, trước sections)
- Terminal mockup: `.term-bar` 3 dots (`#E5654F`, `#E0B545`, `#45E0A8`) + title `wakii — install`; `.term-body` mono 13px: `$ <command>` + link phải `→ full guide: /docs/getting-started/`
- **Lệnh install là PLACEHOLDER** trong prototype — dev LẤY TỪ `src/config.ts` REPO_URL (đã user-confirm) đúng format landing đang dùng. Link = `/docs/getting-started/` (trailing slash, KHÔNG `#get-wakii` — section đó của SF-3 chưa tồn tại).

**Category sections ×3** — thứ tự cứng: `workflow → design → reference`
- `.section-head`: `h2` với `::before` content `"// "` accent weight 400; `p` desc dưới (max-width 620px, text-dim, 14.5px)
- Category head copy (EN):
  - workflow: "From rough idea to verified merge — planning, publishing, and running entire features."
  - design: "Interfaces with intent — direction, motion, review, and translation from image to code."
  - reference: "Depth on demand — routing, graph theory, and prompt craft."

**Bento grid 12-col** (`grid-template-columns: repeat(12, 1fr); gap: 18px`) — span map:

| Section | Cell | grid-column | grid-row | Skill (id) |
|---|---|---|---|---|
| workflow | w1 | `1 / 8` | `1 / 3` | story-workflow — **flagship, class thêm `bx-big`** |
| workflow | w2 | `8 / 13` | — | brainstorm |
| workflow | w3 | `8 / 13` | — | writing-plans-linear |
| workflow | w4 | `1 / 13` | — | orca-superpowers-workflow |
| design | d1 | `1 / 7` | — | frontend-design |
| design | d2 | `7 / 13` | — | gpt-taste |
| design | d3 ×4 | `span 3` | — | design-taste-frontend, image-to-code, mock-prototype, web-design-guidelines |
| reference | r ×3 | `span 4` | — | figma-orientation, graph-engineering, prompt-master |

Outer `.bx` giữ span; inner `.bx-in` là card `height:100%`, flex column, overflow hidden.

**Card anatomy** (từ ngoài vào):
```
.bx-in
├─ .bx-label (border-bottom, nền panel, mono 12px)
│   ├─ .t  → command, `::before` "▸ " accent, 12.5px 700 text
│   └─ .pill → "flagship" (story-workflow) hoặc tên category; mono 10.5px,
│              viền rgba(69,224,168,.4), bg accent-dim, color accent
└─ .bx-body (padding 18px 20px 20px, flex column, flex:1)
    ├─ h3 → name (mono 15px 700)
    ├─ .desc → desc_* (13.5px, text-dim, lh 1.65)
    └─ .bx-how (margin-top:auto + padding-top 14px, border-top 1px DASHED --line)
        ├─ .lbl → "how it works", mono 10.5px uppercase ls .12em accent,
        │          `::before` "» "; margin-bottom 6px
        └─ p → how_* (12.5px, text-faint, lh 1.65)
```
`bx-big` overrides: h3 18px · desc 14.5px · how p 13px màu text-dim.

Heading hierarchy tóm tắt: kicker (12 mono) → h1 (mono clamp 30–54) → h2 (mono clamp 24–34, `//` prefix) → h3 card (mono 15/18). Chỉ 1 h1/trang.

## 4. Behavior

**Entrance reveal — BẮT BUỘC qua motion util SF-1, KHÔNG viết primitive mới, KHÔNG dùng script IO riêng của prototype:**
- Gọi `initMotion()` từ `src/components/motion.ts` đúng 1 lần/trang (script trong page/component).
- Đánh dấu phần tử reveal bằng class `reveal` hoặc attr `data-reveal` trên: terminal install, từng `.section-head`, từng `.bx` (outer cell — KHÔNG đặt trên `.bx-in` để không đụng hover transform).
- Contract util (đã đọc source, story branch `fi294-site-content-depth`):
  - IntersectionObserver `threshold: 0.15`; mỗi batch sort theo vị trí top→bottom, stagger **60ms/phần tử** qua `style.animationDelay = i*60+'ms'`; thêm class `reveal-in`; tự gỡ class + delay sau `animationend` (once).
  - Animation thật nằm ở `src/styles/motion.css`: `.anim .reveal {opacity:0}` + `.anim .reveal-in {animation: bxreveal 0.55s ease both}` — keyframe `translate3d(0,28px,0) → none`.
  - Class `.anim` chỉ được util thêm khi reduced-motion OFF **và** pointer fine — KHÔNG tự thêm `.anim` trong markup/CSS.

**Reduced-motion fallback (chính xác):** không cần code gì thêm — 3 lớp có sẵn: (1) `initMotion()` exit sớm khi `prefers-reduced-motion: reduce` hoặc coarse pointer → không `.anim` → mọi thứ render full-visible static; (2) kill-switch `prefers-reduced-motion` trong `global.css` nuke mọi animation/transition; (3) no-JS: không `.anim` → không opacity:0. **Verify:** bật reduce + tắt JS → trang đầy đủ, không card nào kẹt opacity 0.

**Hover states (CSS thuần, KHÔNG data-tilt cho card):**
- Card `.bx-in:hover`: `border-color: var(--accent)` + shadow trên + `translateY(-3px)`; `transition: border-color .25s ease, box-shadow .25s ease, transform .25s ease`.
- Bọc hover lift trong `@media (hover: hover) and (pointer: fine)` để touch device không kẹt sticky-hover.
- Terminal link hover: underline. Nav/footer giữ behavior site hiện có.
- KHÔNG dùng `data-tilt`/`data-parallax` trên trang này (tilt là của landing hero; SF-2 chỉ tiêu thụ reveal).

## 5. Content binding

**Nguồn: `src/data/skills.ts` — READ-ONLY (SF-1 sở hữu; thiếu sót → flag, không sửa lặng lẽ).**

- Filter: `skills.filter(s => s.public === true)` → 13 skills. `platform` category toàn `public:false` → tự loại. Render đủ 13, không thêm/bớt.
- Group: `workflow` (4: story-workflow, brainstorm, writing-plans-linear, orca-superpowers-workflow) → `design` (6) → `reference` (3). Thứ tự section cứng như §3.
- Field → UI map:

| Field | UI |
|---|---|
| `command` | `.bx-label .t` (giữ nguyên slash) |
| `id === 'story-workflow'` | pill `"flagship"` + card `bx-big` + span w1 |
| id khác | pill = tên category |
| `name` | card `h3` |
| `desc_en` / `desc_vi` | `.desc` theo locale |
| `how_en` / `how_vi` | `.bx-how p` theo locale |
| hero stats | `filter(public).length`, số category có mặt, `"MIT"` (static) |

- Copy trang (hero/kicker/sub/section-head): EN từ prototype §3. VI: dịch song song — **VI copy mới cần gate duyệt riêng** (VI-APPROVED cũ chỉ phủ landing) → dev draft VI, đưa qua gate review copy ở SF-5/PM trước merge. Skill name + command giữ nguyên tiếng Anh cả 2 locale (pattern `src/i18n/landing.ts`).
- Install command: đọc REPO_URL từ `src/config.ts` (đã comment user-confirm), KHÔNG dùng literal `github.com/wakii/wakii` trong prototype.
- SEO/hreflang: route top-level mới `/skills` + `/vi/skills` — verify `Base.astro` canonical + hreflang (en/vi/x-default nếu site đang dùng) hoạt động cho route KHÔNG phải `/docs/<slug>/`; nếu cần sửa Base thì sửa an toàn cho TẤT CẢ pages + regression-check 13 trang cũ (title pattern `skills — wakii` / VI tương ứng; og meta theo Base sẵn có). Lang switcher map 2 chiều `/skills` ↔ `/vi/skills`.
- Cross-link: thêm 1 link `/skills` vào `src/content/docs/{en,vi}/agents-and-kit.md` (trailing slash).

## 6. Responsive

Prototype đã verify @390px (same-origin iframe probe, không tin screenshot headless).

| Breakpoint | Xếp lại |
|---|---|
| > 980px | Đúng span map §3 (12-col bất đối xứng) |
| ≤ 980px | w1 → `1/13` row auto; w2, w3 → `1/7` (2 cột); w4 → `1/13`; d1, d2 → `1/13`; d3 → `span 6`; reference → `span 6` |
| ≤ 620px | TẤT CẢ cells → `1/13` (1 cột); bento gap 12px; `.wrap` pad 20px; hero-stats `.hs` min-width 96px; terminal link xuống dòng riêng (`margin-left: 0`) |
| @390px | Trùng nhánh 620px — kiểm tra: không overflow ngang (scrollWidth = 390), command dài trong `.bx-label`/terminal được wrap an toàn (mono, `overflow-wrap`/break ở terminal cmd) |

Hover lift đã bọc `@media (hover:hover)` → mobile không dính.

## 7. Acceptance hints (dev phải verify)

1. **Đúng 13 card** từ filter `public === true`, nhóm 4/6/3 theo workflow/design/reference; không xuất hiện skill `platform` nào; hero stats khớp số render thực (derive, không hardcode).
2. **Motion đúng contract**: chỉ `initMotion()` + `data-reveal`/`.reveal`; không IO/script riêng; bật `prefers-reduced-motion` VÀ tắt JS → trang hiện đầy đủ static (không card kẹt opacity 0). Đặt reveal trên outer `.bx`, hover transform không bị reveal keyframe giữ (util tự dọn class sau animationend — verify bằng hover sau khi reveal xong).
3. **SEO/lang**: view-source `/skills` + `/vi/skills` → canonical + hreflang đúng; lang switcher round-trip 2 chiều; 13 trang cũ vẫn đúng hreflang (regression nếu có đụng Base.astro).
4. **Install strip**: command dựng từ `src/config.ts` REPO_URL; link → `/docs/getting-started/` (trailing slash, đúng slug contract); KHÔNG link `#get-wakii`.
5. **Responsive + boundary**: grid đúng span @1280/1024/768/390, no horizontal overflow @390 (iframe probe); KHÔNG trang detail `/skills/<slug>`; KHÔNG sửa `tokens.css` / `skills.ts` / landing / docs collection.

---

*Bản staging — PM commit tới `docs/superpowers/designs/sf2-skills-direction.md` theo touch map context pack.*
