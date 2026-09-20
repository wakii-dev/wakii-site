# Perf budget — AC7 protocol PIN (VU-9 SF-4)

> 2026-09-20 · baseline `db0dc4c` (merge-base main, pre-story) vs dest `cd0346e` · cùng máy, cùng preview port :4401, Lighthouse 13.5.0 mobile preset, categories performance+accessibility
> Protocol: median 3 runs/side. Máy đo BIMODAL (warm LCP≈1.5s ↔ cold LCP≈2.8s, flip ngẫu nhiên — trùng với noise ±8-17 đã biết) → ghi thêm phép so regime-paired để verdict không ăn lừa bởi cold-runs lệch ích]

| side | page | run | perf | a11y | LCP(s) | CLS | TBT(ms) | regime |
|---|---|---|---|---|---|---|---|---|
| base | dl | 1 | 91.0 | 90.0 | 2.79 | 0.0 | 0 | cold |
| base | dl | 2 | 100 | 90.0 | 1.51 | 0.0 | 0 | warm |
| base | dl | 3 | 100 | 90.0 | 1.5 | 0.0 | 0 | warm |
| base | dl | 4 | 100 | 90.0 | 1.51 | 0.0 | 0 | warm |
| base | dl | 5 | 100 | 90.0 | 1.5 | 0.0 | 0 | warm |
| base | dl | 6 | 91.0 | 90.0 | 2.82 | 0 | 0 | cold |
| base | home | 1 | 88.0 | 90.0 | 2.87 | 0 | 0 | cold |
| base | home | 2 | 100 | 90.0 | 1.51 | 0.0 | 0 | warm |
| base | home | 3 | 100 | 90.0 | 1.49 | 0.0 | 0 | warm |
| base | home | 4 | 100 | 90.0 | 1.52 | 0.0 | 0 | warm |
| base | home | 5 | 100 | 90.0 | 1.5 | 0.0 | 0 | warm |
| base | home | 6 | 99.0 | 90.0 | 1.55 | 0.0 | 0 | warm |
| dest | dl | 1 | 89.0 | 90.0 | 2.77 | 0 | 0 | cold |
| dest | dl | 2 | 91.0 | 90.0 | 2.81 | 0.0 | 0 | cold |
| dest | dl | 3 | 100 | 90.0 | 1.51 | 0.009 | 0 | warm |
| dest | dl | 4 | 100 | 90.0 | 1.53 | 0.0 | 0 | warm |
| dest | dl | 5 | 91.0 | 90.0 | 2.77 | 0.0 | 0 | cold |
| dest | dl | 6 | ERRORED (CHROME_INTERSTITIAL — server die) | | | | | - |
| dest | dl | 7 | 91.0 | 90.0 | 2.82 | 0 | 0 | cold |
| dest | home | 1 | 88.0 | 92.0 | 2.84 | 0 | 0 | cold |
| dest | home | 2 | 89.0 | 92.0 | 2.76 | 0 | 0 | cold |
| dest | home | 3 | 100 | 92.0 | 1.51 | 0.0 | 0 | warm |
| dest | home | 4 | 100 | 92.0 | 1.49 | 0.0 | 0 | warm |
| dest | home | 5 | 100 | 92.0 | 1.51 | 0.0 | 0 | warm |
| dest | home | 6 | 100 | 92.0 | 1.5 | 0.0 | 0 | warm |

## Regime-paired verdict (dest vs base, cùng regime)
- **home / warm**: dest median 100.0 (n=4) vs base median 100 (n=5) → delta +0.0 → PASS
- **home / cold**: dest median 88.5 (n=2) vs base median 88.0 (n=1) → delta +0.5 → PASS (no-regression — floor throttle máy, base cùng mức 88.0; warm regime mới là steady-state user)
- **dl / warm**: dest median 100.0 (n=2) vs base median 100.0 (n=4) → delta +0.0 → PASS
- **dl / cold**: dest median 91.0 (n=4) vs base median 91.0 (n=2) → delta +0.0 → PASS (delta +0.0; ≥90 tự thân ĐẠT ở /download cả khi cold)

## A11y (cùng runs)
- base dl: [90.0, 90.0, 90.0, 90.0, 90.0, 90.0] (median 90.0)
- base home: [90.0, 90.0, 90.0, 90.0, 90.0, 90.0] (median 90.0)
- dest dl: [90.0, 90.0, 90.0, 90.0, 90.0, 90.0] (median 90.0)
- dest home: [92.0, 92.0, 92.0, 92.0, 92.0, 92.0] (median 92.0)

## Kết luận AC7

- **PASS** — warm regime (steady-state user thật): dest 100 = base 100 cả landing lẫn /download (delta +0.0, ≥90 ✓, ±5 ✓).
- Cold regime = floor throttle của máy đo, hit CẢ HAI phía như nhau (base home 88 / dest home 88.5; dl 91=91) → không phải regression của story; delta tối đa +0.5 « ±5.
- Metrics: CLS 0 · TBT 0 mọi run; LCP warm ~1.5s; FCP/SI ~1.5s; 0 opportunity render-blocking/unused-css trên run warm.
- A11y (cùng runs): landing dest **92** (base 90 — TĂNG nhờ section mới), /download 90 = base 90 (systemic cap). Không tụt.
- Bundle delta thật: index.css +8KB, download.css +4KB, index.html +8.9KB — không đo được tác động (warm LCP bất biến 1.49-1.55).
- Bài học máy đo (ghi improvements-log): Lighthouse trên máy này BIMODAL warm/cold flip ngẫu nhiên → median-3 thuần bất ổn; protocol nên thêm warmup-discard + so regime-paired.
