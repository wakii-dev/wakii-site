# SF-2 Landing EN+VI (FI-291) — Design Spec

Status: Approved (spec slice từ context pack sf-2.md + epic spec mục 4 + direction
sf1-direction.md v2 BINDING; epic-level questions pre-answered per story bracket)

## Problem

SF-1 dựng landing scaffold v2 "Modern Bento Premium" với copy gần-final. Đối chiếu
ACCEPTANCE của context pack sf-2.md, còn 3 gap user-visible + 1 credit thiếu:

1. **Ghost CTA sai contract** — hiện `explore the team → #features`; spec mục 4.1 +
   acceptance #4 yêu cầu "Read the guide" → `/docs/getting-started` (locale-prefixed).
2. **Features grid thiếu 1/6 inventory features** — thiếu **Figma-to-verify**;
   cell F đang là stats cell (direction md binding liệt kê figma cell, KHÔNG liệt kê
   stats cell; html prototype dùng stats). Acceptance #2: "6 thẻ map đúng feature
   inventory".
3. **FAQ thiếu teaser link** — acceptance #5 + DRY-copy rule: FAQ landing là teaser
   subset → phải có link `→ /docs/faq` (locale-prefixed), đối xứng với quickstart teaser.
4. **Footer thiếu kit-origin credit** — kit-license verdict note (docs/superpowers/notes/
   kit-license.md): credit "superpowers by Jesse Vincent (MIT)" thuộc SF-2 footer task.

## Scope

**In:**
- `src/i18n/landing.ts` — strings: ghost CTA (EN+VI), cell figma (interface + EN + VI),
  FAQ teaser, xóa `bento.stats`
- `src/components/Landing.astro` — ghost CTA href → docsHref; cell F stats →
  Figma-to-verify cell (markup + CSS, giữ grid spans `10/13`); FAQ teaser link
- `src/components/Footer.astro` — thêm dòng kit credit

**Out (boundary):**
- tokens.css / Base.astro layout / Nav.astro / i18n routing — SF-1 sở hữu (nav-cta
  "get wakii"→guide là ghi chú cho SF-4)
- docs pages — SF-3; chỉ link theo slug contract
- Không đụng mockup kit components (TerminalBoot/BracketCanvas/AgentGrid/GatesStrip)

## Design decisions

- **Figma cell thay stats (không thêm cell 7):** cùng grid span → blast radius nhỏ nhất;
  map đủ 6 inventory features: A=story system+bracket canvas, B=9-agent team,
  C=gates, D=memory loop, E=watchdog, F=figma-to-verify. Mini-visual thuần CSS
  (mock frame → verified verdict), icon mono, đúng DNA direction (không gradient/glow).
- **Copy accuracy guard:** KHÔNG "Stories tab"; zero-setup claim giữ nguyên
  (kit-license verdict MIT → claim OK); figma cell copy map feature
  "Figma-to-verify pipeline".
- **EN authored trước** trong landing.ts; VI dịch từ EN.
- **SEO meta landing:** title/description per locale đã có từ SF-1 (EN dùng
  SITE_TAGLINE, VI có description riêng) — giữ, verify ở browser pass.

## Testing / Verification

1. `pnpm build` xanh
2. Browser walkthrough 3 tầng (Rule 0):
   - DOM: 6 sections đủ cả EN/VI; links đúng slug contract (ghost CTA →
     /docs/getting-started, FAQ teaser → /docs/faq, quickstart → same, CTA → REPO_URL)
   - VISUAL: screenshot so direction-d3-bento.html (bento layout, tilt không vỡ)
   - FLOW: load → lang switch EN↔VI → CTA click → FAQ accordion open/close
3. Responsive pass (mobile 390px) + prefers-reduced-motion static render
4. Independent code-reviewer trên full diff trước merge
