---
title: "Wakii site: motion and a two-locale i18n"
description: "The two layers that decide how wakii.xyz feels: a data-attribute motion util that respects prefers-reduced-motion, and a two-layer i18n architecture — routing prefixes plus two typed string packs."
pubDate: "2026-09-26"
category: "tech"
tags: ["architecture", "wakii"]
draft: false
---

Open wakii.xyz and scroll: the bento cells fade in one after another, tilting slightly under the cursor. Click the language switch in the top-right corner: the URL flips to `/vi/`, every word changes, the layout stays. Two surprisingly small systems carry those effects: a single motion file for the whole site, and a two-layer i18n architecture. This post dissects both — the motion util's data-attribute contract, and how EN/VI split at the routing layer and the content layer.

TL;DR:

- All site motion is packed into `src/components/motion.ts`: `initMotion()` runs once per page and is driven by four kinds of data-attributes.
- `prefers-reduced-motion` or a coarse pointer: the util exits before hiding anything — the static page still carries full information.
- The routing layer of i18n: `prefixDefaultLocale: false` — EN at the domain root, VI under `/vi/`; the hreflang pair is generated in `src/layouts/Base.astro`.
- The content layer: two typed string packs injected into one component tree; the key set of `downloads.ts` has been frozen since story FI-300.

## Motion is a data-attribute contract

All movement on the site — reveal on scroll, tilt on hover, parallax between cells — lives in exactly one file: `src/components/motion.ts`. No animation library, no external runtime. The file's API is a single function, `initMotion()`, called once per page; the rest of the contract is data-attributes stamped directly onto markup:

```ts
* Contract:
*   initMotion() once per page (e.g. in a component <script>).
*   [data-reveal] | .reveal        — reveal-on-scroll, 60ms stagger per batch
*   [data-tilt]                    — hover tilt-3D on the element itself
*   [data-tilt-host]               — mouse-parallax host; moves a child
*                                    matching [data-hero-term]
*   [data-parallax]                — scroll parallax container; direct
*                                    descendants with [data-depth] translate
```

*Source: src/components/motion.ts, lines 6-13, retrieved 2026-09-08.*

A component that wants to move just stamps an attribute — nobody writes custom keyframes for their cell. The landing page boots the util inside a script tag; other layouts call `revealChildren()` to tag elements for reveal before init.

The entry condition sits on the first lines of the function:

```ts
const RM = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
if (RM.matches || !finePointer.matches) return;
```

*Source: src/components/motion.ts, lines 23-25, retrieved 2026-09-08.*

Users with reduced motion enabled, or touch devices without a fine pointer, get a fully static page. The mechanism that guarantees this is packed into one class: `initMotion()` only adds `html.anim` when every condition passes, and `motion.css` only hides elements inside the `.anim` scope. No JavaScript means no `.anim`, and nothing gets hidden. The last line of defense is in `global.css`: a `prefers-reduced-motion` media query neutralizes all animations with `animation: none !important`, and `motion.css` itself states in its header comment that it "must respect it, never override it".

## The reveal lifecycle: observe, stagger, clean up

```ascii
initMotion()
  ├─ reduced-motion / coarse pointer? → return (no .anim — static page)
  ├─ html.anim ON → .reveal hidden, waiting to enter the viewport
  ├─ IntersectionObserver (threshold 0.15)
  │    ├─ sort elements by position → delay i × 60ms
  │    ├─ add .reveal-in → animation bxreveal 0.55s
  │    └─ animationend → remove class + remove data-reveal + remove delay
  └─ scroll → rAF ticking → [data-depth] translate3d (3-speed parallax)
```

*Source: diagram built from src/components/motion.ts + src/styles/motion.css, retrieved 2026-09-08.*

The last step is the subtle one. After a cell has revealed, the handler cleans up both the class and the `data-reveal` attribute. The reason sits in the file's own comment: if you only remove the class but keep the attribute, the selector `.anim [data-reveal] { opacity: 0 }` re-applies right after animationend — every attribute-based cell (download, skills bento, workflow gates, FAQ) fades out the moment it finished appearing. The comment credits this to a Rule 0 finding from story FI-304: a bug caught by clicking through the real page, not by reading code.

The tilt branch is just as lean: `mousemove` only records target angles, `requestAnimationFrame` with a lerp of 0.12 chases them, and leaving the mouse returns everything to zero. It uses only `transform` and `opacity` — the two properties that cannot trigger layout shift, exactly as the file header promises.

## The routing layer: EN at the root, VI under a prefix

The i18n config lives in `astro.config.mjs`, a few lines, stamped LOCKED:

```js
i18n: {
  defaultLocale: 'en',
  locales: ['en', 'vi'],
  routing: {
    prefixDefaultLocale: false, // EN at /, VI at /vi/
  },
},
```

*Source: astro.config.mjs, retrieved 2026-09-08.*

The site is Astro 5 with static output (`^5.12.0` in `package.json` at the time of writing), so that config decays into a static URL tree after build:

```ascii
wakii.xyz  (SITE_URL — src/config.ts)
├── /                        landing EN      ← src/pages/index.astro
├── /vi/                     landing VI      ← src/pages/vi/index.astro
├── /blog/<slug>/            EN post         ← src/pages/blog/[slug].astro
├── /vi/blog/<slug>/         VI post         ← src/pages/vi/blog/[slug].astro
├── /docs/<slug>/            EN docs (5 slugs LOCKED)
└── /vi/docs/<slug>/         VI docs
```

*Source: src/pages/ tree of the repo, retrieved 2026-09-08.*

From that tree, `src/layouts/Base.astro` emits the SEO signals for every page: a self-referencing canonical per locale, and an hreflang cluster — `en` / `vi` / `x-default` — cross-linking the pair. The comment in the file records the decision: a non-self canonical can cause the whole hreflang cluster to be ignored. The same file holds a sharper contract: if a VI page is missing, its hreflang still points at the mapped VI URL — because VI routes are generated from the same slug contract, a missing VI page means the slug is missing in both locales, which is a contract violation, not a fallback. The domain itself has a single source: the `SITE_URL` constant in `src/config.ts`, which `src/pages/robots.txt.ts` uses to generate the Sitemap line — no domain is hardcoded in scattered places.

The EN | VI switch in the nav is `src/components/LangSwitcher.astro`. It maps the current pathname to the other locale's pathname, with one fallback prop named `viExists`: a page without a translation yet links to the EN version instead of a dead URL. A small script in the component preserves the anchor hash across locale switches — docs deep-links do not break when you are standing on a specific section.

## The content layer: two string packs, one component tree

Routing only solves URLs. The words live elsewhere: `src/i18n/landing.ts` exports two objects, `en` and `vi`, both constrained by one `LandingStrings` interface — a wrong key breaks at compile time instead of waiting for render. The two homepages are the proof of this architecture: the same Landing component, differing by exactly one `strings` prop. Even the mockup data — the node coordinates, edges and statuses of the bracket canvas — lives inside the string packs, so the components in `src/components/mockups/` stay pure prop-driven renderers.

For the downloads page the contract tightens further. The head of `src/i18n/downloads.ts`:

```
* KEY-OWNERSHIP RULE: SF-1 owns this file. After SF-1, SF-2/SF-3 must NOT
* add new keys here — a missing key is flagged to epic FI-300
```

*Source: src/i18n/downloads.ts, lines 4-5, retrieved 2026-09-08.*

The frozen key set has a reason: every flag-conditional key carries both a `live` and a `notLive` variant, so a flag flip can never surface unreviewed copy. Adding keys casually would break that mechanism — which is why the ban is written as a code comment, not left to trust.

Long-form content — blog and docs — rides a third layer: the two directories `src/content/blog/en/` and `src/content/blog/vi/` are loaded by one glob loader, with entry ids carrying the locale prefix. The VI route of a blog post is a thin file: `getStaticPaths` filters entries whose id starts with `vi/` and that are not drafts. RSS is where the two layers meet — a single feed serving both locales; the post [RSS bilingual feed anatomy](/blog/rss-bilingual-feed-anatomy/) dissects that feed in detail, including the decision to drop the `language` tag.

Both layers decay into plain HTML after build: motion is the only JavaScript still running when a page opens, and i18n is two separate URL trees that share no copy. Questions about the site are collected on the [FAQ page](/docs/faq/). To run your first story on your own site, the [getting started page](/docs/getting-started/) is the starting point.
