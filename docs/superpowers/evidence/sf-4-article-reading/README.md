# SF-4 (FI-68) — Follow surface: RSS + subscription affordances — Evidence

Build: `npm run build` EXIT 0 (285 pages) · `npm run check:jsonld` ✓ (285 pages, BlogPosting 240 — og/JSON-LD unaffected, Base.astro untouched).

Article probe: `/blog/arch-ci-gates/` + `/vi/blog/arch-ci-gates/` (EN + VI parity).

## Files

| File | What it shows |
|---|---|
| `before-en-desktop-full.png` | BEFORE (base @ 320c05a): tail order prose → related → after-CTA, no follow block |
| `before-vi-desktop-full.png` | BEFORE, VI |
| `before-en-375-full.png` | BEFORE, mobile 375px |
| `after-en-desktop-full.png` | AFTER: FollowBlock between Related and after-CTA |
| `after-en-desktop-bottom.png` | AFTER crop: follow block region — bento cell, "FOLLOW THE BLOG", `RSS feed →` + `Copy feed URL` button |
| `after-vi-desktop-full.png` / `after-vi-desktop-bottom.png` | AFTER, VI copy: "THEO DÕI BLOG" / "bản tin RSS →" / "Copy URL bản tin" |
| `after-en-375-full.png` / `after-en-375-bottom.png` | AFTER mobile 375px: block fits, no layout break |
| `after-en-nojs.png` / `after-en-nojs-bottom.png` | no-JS: copy button hidden (server-rendered `hidden`), RSS link visible + clickable |
| `cdp-copy-test.mjs` | Functional probe (CDP): click copy → clipboard holds `https://wakii.xyz/rss.xml`, status "Copied ✓" announced (`role=status`), button disabled 2s |

## Notes

- Screenshots: headless Chrome (`--headless=new`), tall window + PowerShell crop of the content tail (Orca device-emulation screenshots broken on this machine — known issue, fallback per memory).
- **no-JS capture method:** Chrome's JS-disable flags were ineffective headless (`scriptEnabled=false` produced JS-on output), so the no-JS evidence renders `dist/blog/__nojs-probe/` — a byte-copy of the built page with `<script>` elements stripped. This is exactly the DOM/CSS a no-JS browser receives: the copy button ships with the `hidden` attribute and only script removes it; the RSS link is plain static HTML.
- CDP probe result (first run): `{"clip":"https://wakii.xyz/rss.xml","statusText":"Copied ✓","btnDisabled":true,"btnLabel":"Copy feed URL"}` — real clipboard (Browser.grantPermissions clipboardReadWrite), absolute feed URL, aria-live feedback.
- i18n: strings live inside FollowBlock.astro (en+vi), 0 new keys in the layout UI record.
