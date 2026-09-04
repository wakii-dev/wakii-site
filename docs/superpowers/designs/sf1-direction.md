# SF-1 Design Direction — "Modern Bento Premium" (D3 — user chọn 2026-09-04, thay thế v1 Terminal Mono)

> **v2 BINDING** (2026-09-04): thay thế hoàn toàn v1. Nguồn duyệt:
> `docs/superpowers/designs/direction-d3-bento.html` (implement theo file này +
> file nguồn, không tự biến đổi hướng). DNA v1 (mono/mint/near-black) GIỮ làm nền
> identity; v1 direction-c.html chỉ còn giá trị tham chiếu terminal boot log.

## Tokens

| Token | Value |
|---|---|
| `--font-display` | JetBrains Mono (headings, labels, UI mockups) |
| `--font-sans` | Inter (body paragraphs, FAQ/docs body) |
| `--bg` | near-black `#0A0E0D` |
| `--bg-raised` | `#101614` |
| `--bg-card` | `#131A17` (bento cells) |
| `--border` | `#1E2A26` |
| `--accent` | phosphor mint `#45E0A8` |
| `--accent-dim` | `#2A6B52` |
| `--text` | `#D7E2DD` |
| `--text-dim` | `#6B7A74` |
| `--warn` | amber `#E8A33D` (status pill phụ) |

Radius: 8–12px bento cells (vượt v1 0–4px — bento cần mềm hơn), buttons 6px.
Border 1px; shadow dùng rất tiết (depth qua parallax + border, không glow).
Spacing nhịp 8px; section padding 96–128px; bento gap 16–20px.

## Structure (landing — bento bất đối xứng 12-col theo direction-d3-bento.html)

1. **Hero** — headline + tagline + 2 CTA (`Get Wakii` solid mint / `Read the
   guide` ghost) + terminal boot log mockup đặt trong bento cell lớn bên phải,
   type-in 1 lần, cursor blink. Hero-meta strip: `0 setup · 9 agents · 1 PR per story`.
2. **Zero-setup strip** — 3 cell bento nhỏ (`[01] bundled plugin` / `[02] kit →
   ~/.claude` / `[03] enabled by default`).
3. **Features = Bento showcase chính** (đây là "làm nổi bật tính năng"):
   - Cell LỚN: **bracket canvas mockup** — nodes FI-289 (epic, mint ring) +
     SF-1..4, SVG dependency edges, tier columns, status pills (done green /
     running mint pulse / queued dim)
   - Cell: **9-agent grid** — 9 ô agent (task-executor, designer, code-reviewer,
     verifier, spec-critic, plan-critic, phase0-impact-analyst, security-audit,
     rollback-fixer), online dots mint
   - Cell: **Story Ops gates strip B0–B5** (browser test / code+tests / plan /
     review / merge / Done) dạng pipeline progress + verdict footer
   - Cell: **watchdog live console** — cycle animation (scan → detect → resume)
   - Cells nhỏ: memory/learning loop, Figma-to-verify (icon + 1 câu + mini-visual)
   - Hover tilt-3D từng cell (rotateX/Y theo mouse, lerp), parallax depth giữa
     các cell khi scroll (translate3d, tốc độ khác nhau)
4. **Workflow** — ASCII pipeline mono trong cell ngang full-width
   (`idea → impact → plan → parallel SFs → verify gates → 1 PR`)
5. **Quickstart teaser** — code block 3 dòng + link `→ full guide: /docs/getting-started`
6. **FAQ accordion + footer** (repo link, `Upstream: Orca (MIT)`, `© Wakii`)

## Behavior

- Tilt-3D: chỉ hover, transform rotateX/Y ±4deg max, lerp mượt, về 0 khi rời
- Parallax: scroll-driven translate3d giữa cells (3 tốc độ), IntersectionObserver
- Reveal-on-scroll: cells fade/slide-in lần lượt (stagger 60ms)
- Terminal type-in 1 lần (~1.6s); watchdog console loop chậm (4s/cycle)
- `prefers-reduced-motion`: TẮT toàn bộ — static render đầy đủ thông tin
- Perf: transform/opacity ONLY (không layout shift), không WebGL (D3 thuần
  CSS/JS ~4KB), LCP không bị animation block

## Mockup kit (dùng chung SF-2 — implement 1 lần ở SF-1 dưới dạng components)

Bracket canvas / agent grid / gates strip / terminal boot — viết thành Astro
components có props (SF-2 sẽ bố trí lại content, không viết lại hình).

## Docs layout (SF-3 inherit)

Sidebar trái mono-nav, headings JetBrains Mono + body Inter, code block nền
`--bg-raised`, prev/next mono-link, lang switcher `EN | VI` góc nav.

## Cấm

- Gradient tím/xanh AI-slop, glow bóng đổ lớn, stock illustration, emoji UI
- "Stories tab" trong bất kỳ copy nào (chỉ Superpowers panel + bracket canvas)
