# Lighthouse baseline — story FI-300 (recorded at SF-1, FI-301)

Date: 2026-09-04 · Commit: 4ab6726 (SF-1 T7, pre-SF-2 route) · Tool: `npx lighthouse@13.4.1`,
local `astro preview` (dist build), `--chrome-flags="--headless=new --disable-gpu"`,
default (mobile) emulation, categories: performance/accessibility/best-practices/seo.

## Measured (run 1)

| Page | Perf | A11y | Best-practices | SEO |
|---|---|---|---|---|
| `/` (landing EN) | 99 | 90 | 100 | 100 |
| `/vi/` (landing VI) | 96 | 90 | 100 | 100 |
| `/skills/` | 86 | 90 | 100 | 100 |
| `/roadmap/` | 82 | 90 | 100 | 100 |
| `/docs/getting-started/` | 82 | 92 | 100 | 100 |

## Variance check (run 2)

- `/roadmap/` re-run → perf **90** (run 1: 82). Perf on local preview is noisy
  (mobile throttling ±8). A11y/bp/seo stable across runs.
- `/download` + `/vi/download` (SF-2) have NO baseline — their target is the
  absolute ≥95 from the spec, measured against the deployed preview, not this
  local table.

## Targets carried into SF-4 convergence (spec "Lighthouse split")

- landing `/` + `/vi/` ≥ baseline above (perf 99 / 96).
- `/download` + `/vi/download` ≥ 95 absolute.
- Raw JSON: `/tmp/lh-fi301/*.json` (ephemeral — re-measure per runbook above).
