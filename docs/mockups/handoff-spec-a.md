# hero-team-workflow — Design Direction — FINAL (user-selected: hướng A "The Window")

- Prototype: `docs/mockups/hero-team-workflow-a.html` (artifact: https://share.onorca.dev/a/X3j2C7Nlp4DI — mở trực tiếp được)
- CEO selection: hướng A (room #launching — card [DESIGN], stage 3 feature "Nổi bật team workflow trên hero wakii-site", run `run_55503e0fc93c`)
- Scope gốc: `docs/mindmap.wakii` (đã duyệt stage 2) — KHÔNG đổi OG/meta, KHÔNG đổi copy headline/subtitle, KHÔNG đụng blog/docs/downloads
- Tệp đụng (tổng): `src/components/landing/Hero.astro` · `src/i18n/landing.ts` · `src/components/landing/Understand.astro` · `public/hero-team-workflow.png` (mới) · **KHÔNG đổi** `src/components/motion.ts`

## Tokens — KHÔNG token mới

Mọi giá trị dùng sẵn trong `src/styles/tokens.css` (authority — không prototype hex):

| Token | Dùng cho |
|---|---|
| `--border-strong` (#2B4234) | viền khung app, viền chip |
| `--radius-cell` (12px) | bo khung app-frame |
| `--radius` (8px) | bo chip caption |
| `--bg-raised` (#101614) | nền khung app-frame, nền chip |
| `--panel` (#0D1310) | nền app-titlebar |
| `--border` (#1E2A26) | đường phân cách titlebar |
| `--red` / `--warn` / `--accent` | traffic lights (giống TerminalBoot hiện tại) |
| `--accent` (#45E0A8) | chấm ● trong chip + chữ badge LIVE |
| `--accent-dim` (#2A6B52) | viền badge LIVE |
| `--text-faint` / `--text-dim` | chữ titlebar, chữ caption meta |
| `--font-mono` (= `--font-display`, JetBrains Mono) | toàn bộ chrome/chip — font body không đổi |

## Structure — Hero.astro thay gì

Hiện tại (`src/components/landing/Hero.astro:48-52`, cột phải của `.hero-grid`):

```astro
<div>
  <div data-hero-term>
    <TerminalBoot title={t.hero.termTitle} cmd="wakii ./my-project" lines={t.hero.boot} lastCmd={t.hero.lastCmd} />
  </div>
</div>
```

Thay bằng (giữ nguyên wrapper `data-hero-term` — tilt áp lên nó):

```astro
<div>
  <div class="hero-visual" data-hero-term>
    <figure class="app-frame">
      <div class="app-titlebar" aria-hidden="true">
        <span class="tl"></span><span class="tl"></span><span class="tl"></span>
        <span class="t">{t.hero.windowTitle}</span>
        <span class="live">{t.hero.liveBadge}</span>
      </div>
      <img
        src="/hero-team-workflow.png"
        width="1120"
        height="592"
        alt={t.hero.imgAlt}
        decoding="async"
      />
    </figure>
    <div class="hero-caption">
      <span class="chip">{t.hero.captionChip}</span>
      <span class="meta">{t.hero.shotMeta}</span>
    </div>
  </div>
</div>
```

Lưu ý markup:
- **KHÔNG** `loading="lazy"` — ảnh nằm trong first viewport, là LCP candidate; lazy làm Lighthouse tụt thật.
- `width`/`height` bắt buộc (chống CLS — mindmap "Rủi ro canh"); CSS thêm `height: auto` cho `<img>` trong `.app-frame`.
- Traffic lights + badge chỉ trang trí → `aria-hidden="true"` trên titlebar; ý nghĩa thật nằm trong `alt`.
- Import `TerminalBoot` ở đầu file bỏ đi (`Hero.astro:8`).

CSS scoped thêm vào `<style>` của Hero.astro (giá trị đúng như mockup A — đã render verify):

- `.app-frame`: border 1px `--border-strong` · radius `--radius-cell` · background `--bg-raised` · shadow `0 32px 90px rgba(0,0,0,.55), 0 0 0 1px rgba(69,224,168,.05)` · overflow hidden.
- `.app-titlebar`: flex, padding `11px 16px`, border-bottom 1px `--border`, background `--panel`; `.tl` 11×11 tròn đỏ/vàng/xanh; `.t` font 12px `--text-faint` margin-left 12px; `.live` margin-left auto, font 9.5px, letter-spacing .14em, uppercase, `--accent`, viền 1px `--accent-dim`, radius 999px, padding 2px 10px, `::before content '● '`.
- `.app-frame img`: `display:block; width:100%; height:auto;`.
- `.hero-caption`: flex space-between baseline, gap 12px, margin-top 14px.
- `.hero-caption .chip`: font 10.5px, letter-spacing .08em, uppercase, `--text-dim`, bg `--bg-raised`, viền 1px `--border-strong`, radius 999px, padding 5px 14px, `::before content '● '` màu `--accent` font-size 8px.
- `.hero-caption .meta`: font 10.5px `--text-faint`, letter-spacing .06em, `white-space: nowrap`.
- Responsive: breakpoint `≤1020px` hiện có (hero-grid đổ 1 cột) — khung + caption giữ nguyên hành vi, không cần rule mới.

## Behavior — motion giữ nguyên

- `src/components/motion.ts` **KHÔNG đổi** (diff = none).
- Cặp attribute `header[data-tilt-host]` × `div[data-hero-term]` phải còn nguyên sau swap (`motion.ts:71-99` query đúng 2 selector này; mouse-parallax rotateX ±6°/rotateY ±8°, lerp 0.08).
- `data-tilt` hover-3D của bento (`motion.ts:33-68`) không liên quan hero — không đụng.
- Caption chip + badge KHÔNG animate (không thêm transition mới).
- `prefers-reduced-motion` / coarse pointer: initMotion exit sớm → ảnh render tĩnh đầy đủ — đúng contract hiện có, không việc gì thêm.

## i18n — landing.ts (EN `en` :203-227 · VI `vi` :436-460)

**BỎ 3 keys + type defs** (orphan sau khi TerminalBoot rời hero — TerminalBoot.astro không còn consumer nào trong `src/`, đã grep):

| Key | EN dòng | VI dòng |
|---|---|---|
| `hero.termTitle` | 204 | 437 |
| `hero.boot` (4 phần tử) | 205-210 | 438-443 |
| `hero.lastCmd` | 211 | 444 |

Cộng 3 dòng type trong interface `LandingStrings['hero']` (landing.ts:36-38). Nguồn số dòng: grep thực hiện 02/11 trên worktree room.

**THÊM 5 keys mới** — đặt đúng vị trí 3 keys cũ (thay thế, giữ khối hero liền mạch). Copy chốt từ mockup A (toggle EN/VI):

```ts
// EN (sau khi thay :204-211)
windowTitle: 'Wakii — team workspace · session 3',
liveBadge: 'live',
imgAlt: 'Wakii IDE running a live team session — captain coordinating workers in team chat while agents build in parallel terminals',
captionChip: 'live session — captain + team chat · #launching',
shotMeta: 'your IDE, right now',

// VI
windowTitle: 'Wakii — team workspace · session 3',
liveBadge: 'live',
imgAlt: 'IDE Wakii đang chạy session team thật — captain điều phối workers qua team chat trong lúc các agent build song song',
captionChip: 'session thật — captain + team chat · #launching',
shotMeta: 'IDE của bạn, ngay lúc này',
```

- 5 keys trên interface (`LandingStrings['hero']`, landing.ts:36-38 vùng): `windowTitle: string; liveBadge: string; imgAlt: string; captionChip: string; shotMeta: string;`
- `liveBadge` EN=VI='live' — chủ ý giữ key riêng (không hardcode) để mọi copy user-facing đi qua store, đúng pattern understand hand-off.
- Copy hero còn lại (kicker/headline/tagline/CTA/stats) KHÔNG đổi — mindmap cấm đổi copy headline/subtitle.
- understand.q2 slot (`Understand.astro:84-86`) thay placeholder bằng shot thật (chốt 4a) — xem mục "Bento q2".

## Bento q2 (chốt 4a — Understand.astro)

- `Understand.astro:84-87`: thay `<div class="slot slot-lg">` bằng `<figure class="shot">` chứa `<img src="/hero-team-workflow.png" width="1120" height="592" alt={t.understand.q2ImgAlt} />` + figcaption nhỏ mono ("shot — real session" / "shot — session thật") → key mới `understand.q2ImgAlt` EN/VI:

```ts
// EN: 'Wakii app overview — workspace, agent terminals and team chat panel'
// VI: 'Toàn cảnh app Wakii — workspace, các terminal agent và panel team chat'
```

- Copy keys q2 khác (q2Label/q2Meta/q2Body/q2Foot) KHÔNG đổi.
- Keys `q2SlotName` + `q2SlotHint` thành orphan sau swap → xoá cả 2 locale (EN :240-241 dáng — *stage 4 grep `q2SlotName` lấy số dòng thật trước khi xoá*) + type trong interface understand.
- CSS `.shot` thêm scoped trong Understand.astro: radius `--radius`, viền 1px `--border-strong`, overflow hidden; img `display:block; width:100%; height:auto;`; figcaption chip mono 9px uppercase `--text-faint` nền `rgba(4,20,13,.82)` absolute bottom-left.
- Rule `.slot`/`.slot::before/::after` + `.slot-lg` có thể orphan nếu không còn slot khác trong Understand (q3 vẫn còn `slot slot-sm` → **giữ** `.slot` base, chỉ bỏ `.slot-lg` nếu muốn — stage 4 quyết, không bắt buộc).

## Asset pipeline (số đo THẬT 02/11, máy worker design)

1. Nguồn: `/tmp/ceo-material-hero.png` — 1920×1016 PNG RGBA 572KB (bản sao dài hạn hơn: `~/.claude/chat/media/1a197f626953d813.jpg`, cùng nội dung — **stage 4 dùng bản sao này làm nguồn vì /tmp có thể bị dọn**; CEO ACK nội dung public qua chốt 1a).
2. `sips -Z 1120 <src> --out hero-1120.png` (1120×592).
3. `pngquant --quality=8-60 --speed 1 --output hero-1120-q.png hero-1120.png` → **79.6KB** (đo thật; đạt chuẩn tile ≤100KB — self-enforced, gate check-og KHÔNG quét ảnh hero theo mindmap).
4. Đặt vào `public/hero-team-workflow.png`.
5. Backup khuyến nghị: giữ 1920×1016 gốc ở `.github/assets/` (cùng chỗ hero.png/skills.png hiện có) cho lần cần re-export — không render trên site, không tính vào chuẩn 100KB.
- Cùng 1 file phục vụ hero + bento q2 (reuse — không asset thứ 2 trong hướng A).
- Alternatives đã đo (chỉ dùng nếu CEO đổi ý sau): 1200w ~120-137KB · 1600w ~183-218KB · panel crop 492w ~40KB (không dùng trong A).

## Out of design scope (Dev tự quyết)

- Tên file asset cuối (`hero-team-workflow.png` là đề xuất; miễn path khớp `src=` và không ký tự cần escape).
- Thứ tự keys mới trong hero interface + comment style trong landing.ts (bám style xung quanh).
- Việc xoá `.slot-lg` rule như trên.
- Format JSX của figure/caption (đúng semantic + aria như spec là đủ).

## DoD — đo được (verification gate cho stage 4/5)

1. **Build xanh**: `pnpm build` exit 0 (check:og wired trong `package.json` build script — PASS).
2. **Không orphan key**: `grep -rn "termTitle\|lastCmd\|t.hero.boot" src/` → 0 match; `grep -rn "q2SlotName\|q2SlotHint" src/` → 0 match; `grep -n "TerminalBoot" src/components/landing/Hero.astro` → 0 match (import lẫn JSX).
3. **Asset đạt chuẩn**: `stat -f%z public/hero-team-workflow.png` ≤ 102400 (100KB); `sips -g pixelWidth -g pixelHeight` = 1120×592.
4. **Markup đúng**: `dist/index.html` chứa `<img src="/hero-team-workflow.png" ... width="1120" height="592"` + alt EN; `dist/vi/index.html` chứa alt VI; cặp `data-tilt-host` (header.hero) + `data-hero-term` (div.hero-visual) vẫn tồn tại trong Hero.astro.
5. **Motion nguyên vẹn**: `git diff src/components/motion.ts` rỗng.
6. **i18n hai locale**: hero EN + VI render caption chip đúng copy (EN "live session — captain + team chat · #launching" / VI "session thật — captain + team chat · #launching"); không key missing trong build (Astro fail-loud khi thiếu key type).
7. **CLS**: img có cả width + height attr (kiểm markup) — thêm eyeball resize 390px trên preview (iframe probe 390 nếu cần).
8. **LCP warm trước/sau**: đo Lighthouse mobile warm trên main (trước swap) và trên nhánh (sau swap), cùng regime — perf ≥90 chuẩn hiện có, noise ±8-17; sụt bất thường → báo lại, không tự tăng nặng ảnh.
9. **Privacy đã ACK**: nội dung chat thật trong ảnh — CEO ACK qua chốt 1a (stage 2, ghi trong mindmap) — không cần ACK lại.
