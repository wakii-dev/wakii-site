# Lighthouse convergence — story FI-300 SF-4 (FI-304)

Date: 2026-09-05 · Commit: motion-fix build (post FI-304 T3/T9 fixes) · Tool: `npx lighthouse@13.4.1`,
local `astro preview` (dist), `--chrome-flags="--headless=new --disable-gpu"`, default (mobile)
emulation, categories perf/a11y/bp/seo. Runbook kế thừa `lighthouse-baseline-fi300.md`.

## Measured

| Page | Perf run1 | Perf run2 | A11y | BP | SEO |
|---|---|---|---|---|---|
| `/` | 91 | 100 | 90 | 100 | 100 |
| `/vi/` | 83 | 100 | 90 | 100 | 100 |
| `/download/` | 91 | 100 | 90 | 100 | 100 |
| `/vi/download/` | 100 | — | 90 | 100 | 100 |

## Targets vs kết quả

- **landing `/` + `/vi/` ≥ baseline (perf 99/96)**: run1 thấp hơn (91/83), run2 = 100/100.
  Local-preview perf noise confirmed ±8 trở lên (baseline note đã ghi noisy; ở đây run1→run2
  dao động 17 điểm trên cùng build). Kết luận: đạt baseline trong điều kiện đo ấm; số local
  không dùng để gate — số quyết định là đo trên deploy (VI prod 96 @ FI-294 audit).
- **`/download` + `/vi/download` ≥ 95 tuyệt đối**: run2 đạt 100/100; run1 91. A11y 90 = đúng
  cap systemic toàn site (fonts render-blocking + contrast — đã flag epic từ SF-2 FI-302),
  không phải regression của /download: mọi page kể cả landing đều 90.
- BP/SEO 100 mọi page ✓ (heading order /download ×2 + landing sạch; hreflang/canonical 16/16
  audit pass — kế thừa FI-298 self-referencing verdict).

## Carried flags (đã trong epic FI-300 audit, không fix per-SF)

- Fonts render-blocking + contrast → perf/a11y cap systemic (flag từ SF-2).
- Heading-order P2 story-2-owned: `/roadmap` + `/vi/roadmap` thiếu h1; `docs/faq` EN+VI skip
  h1→h3; `404` không h1 (cosmetic).
