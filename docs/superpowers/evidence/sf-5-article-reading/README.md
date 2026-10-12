# SF-5 evidence — Convergence QA + release checkpoint (FI-69)

Story: FI-63 article-reading redesign · worktree `sf-5-article-reading` ·
base `daeee71` (SF-1..SF-4 merged). SF-5 = verify + audit + checkpoint,
KHÔNG code production.

## BEFORE/AFTER

- **BEFORE** = baseline pre-story (main `781181f`) — dùng lại shot sẵn có
  trong `docs/superpowers/evidence/sf-1-article-reading/` (before-en-desktop-top.png,
  before-en-mobile-375-top.png, before-vi-*) — cùng baseline, không build lại.
- **AFTER** = convergence state ở dir này (8 shots: EN+VI desktop + 375px,
  TOC collapsed/expanded, bảng 375, follow block).

## Files

| File | Nội dung |
|---|---|
| `test-run.txt` | Full gate results + findings (đọc đầu tiên) |
| `walk-*.json` | 8 CDP walkthrough reports (console/CLS/coexistence/TOC/a11y) |
| `clip-en.json`, `clip-vi.json` | Clipboard success-path (granted permissions) |
| `after-*.png` | AFTER screenshots (CDP capture, build cục bộ) |

## Probe tooling (evidence helpers, không ship)

- `scripts/sf5-walkthrough.mjs` — 1 page load = console errors + coexistence +
  TOC visibility + scrollspy/progress/back-to-top + CLS (PerformanceObserver
  buffered) + table overflow + keyboard/reduced/no-JS modes.
- `scripts/sf5-clipboard.mjs` — grant clipboard permission → click cả 3 copy
  affordances → đọc clipboard thật + ✓ feedback.
- `scripts/sf5-shortvw.mjs` — desktop short-viewport P1-5: rail/recent-posts/
  lang trong sticky sidebar internal scroll (langVisibleAfterScroll đo thật).
- `scripts/sf3-shot.mjs` (của SF-3, reuse) — screenshots + live state.

Server: `npx astro preview --port 4400` (4399 bị preview cũ của session khác
chiếm — KHÔNG dùng, có thể serve dist stale).
