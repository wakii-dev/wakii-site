# SF-1 Design Direction — "Terminal Mono" (Direction C — user chọn 2026-09-04)

Nguồn: `docs/superpowers/designs/direction-c.html` (prototype đã duyệt — implement theo file này,
không tự biến đổi hướng).

## Tokens

| Token | Value |
|---|---|
| `--font-mono` (identity, toàn trang) | JetBrains Mono (400/700) — headings lẫn body |
| `--font-sans` (phụ: đoạn dài FAQ/docs body) | Inter (fallback khi mono gây mỏi mắt ở body text dài) |
| `--bg` | near-black `#0A0E0D` |
| `--bg-raised` | `#101614` |
| `--border` | `#1E2A26` |
| `--accent` | phosphor mint `#45E0A8` |
| `--accent-dim` | `#2A6B52` |
| `--text` | `#D7E2DD` |
| `--text-dim` | `#6B7A74` |
| `--warn` | amber `#E8A33D` (badge/status phụ) |

Radius: 0–4px (sắc, không bo tròn mềm). Shadows: tối thiểu — dùng border 1px +
nền raise thay cho đổ bóng. Spacing: nhịp 8px, section padding lớn (96–128px).

## Structure (landing — thứ tự cố định theo spec)

1. **Hero = terminal window thật**: khung terminal (traffic lights + title
   `wakii — ./my-project`), boot log type-in: `$ wakii ./my-project` →
   `✓ plugin loaded (stablyai.orca-superpowers-launcher)` →
   `✓ kit installed → ~/.claude` → `✓ 9 agents online` → cursor blink.
   Bên trên/dưới: headline + tagline + 2 CTA (`Get Wakii` solid mint /
   `Read the guide` ghost mono link). Hero-meta strip mono nhỏ:
   `0 setup · 9 agents · 1 PR per story`.
2. **Zero-setup strip**: 3 cột mono-annotated (`[01] bundled plugin` /
   `[02] kit → ~/.claude` / `[03] enabled by default`), 1 câu mỗi cột.
3. **Features grid = file listing**: 6 hàng dạng `sf.001 story-system` ...
   hover highlight mint; mỗi hàng: tên + 1 câu mô tả. KHÔNG card bo góc.
4. **Workflow = ASCII pipeline**: `idea → impact → plan → parallel SFs →
   verify gates → 1 PR` kiểu diagram mono (character art hoặc SVG mono-stroke).
5. **Quickstart teaser**: 3 dòng code block (`git clone …` / `pnpm i && pnpm
   build` / `mở panel ⚡`) + link `→ full guide: /docs/getting-started`.
6. **FAQ + footer**: FAQ accordion mono; footer: link repo + `Upstream: Orca
   (MIT)` + `© Wakii`.

## Behavior

- Boot log type-in CHỈ ở hero, chạy 1 lần khi load (~1.6s tổng), skip nếu
  `prefers-reduced-motion`; cursor blink CSS thuần.
- Hover states: đổi `--text-dim` → `--accent`, không transform/scale lớn.
- Không animation ngoài type-in + blink (tôn trọng prototype C).

## Docs layout (SF-3 inherit)

- Sidebar trái mono-nav (`getting-started` … `faq`), content serif-free:
  headings JetBrains Mono, body Inter. Code block nền `--bg-raised`, border
  `--border`. Prev/next footer mono-link. Lang switcher góc nav: `EN | VI`.

## Cấm

- Gradient tím/xanh AI-slop, glow bóng đổ, stock illustration, emoji trong UI.
- "Stories tab" trong bất kỳ copy nào (chưa ship — chỉ Superpowers panel).
