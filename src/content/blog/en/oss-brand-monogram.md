---
title: "The w. monogram: one icon, two repos"
description: "One letter w. drawn as SVG geometry lives in two repos with two build pipelines: the site consumes vectors for favicon and OG image, the desktop app compiles icns/png from Icon Composer — this post reads both ends to show why one master suffices."
pubDate: "2026-09-28"
category: "tech"
tags: ["oss", "design", "wakii"]
draft: false
---

An icon is easy to dismiss as a detail — until your project is a fork, and the icon becomes the sharpest identity boundary between you and the parent project. At that point "draw the logo" stops being a pure design task: one shape has to live in two repos with two export pipelines, one side a web app consuming vectors, the other a desktop app needing icns and png. Wakii solves this the way wall builders always have: one geometry, everything else derived from it. This post reads both ends of that pipeline — from the SVG file on the site to the icon build script in the product repo — and lets the files make the argument themselves.

TL;DR:

- The "w." icon is pure geometry, no font dependency — the decision is written in the file's own comment, with the reason: fonts render inconsistently across platforms.
- On the site side, one master file `wakii-icon.svg` serves three consumers: the favicon (a twin with identical geometry), the GitHub avatar, and the OG image.
- On the app side, the icon is built from an Icon Composer project (`icon.icon`) through a `generate.sh` script — producing `icon.icns` for macOS and `icon.png` for tray and fallback.
- Icon history is recorded in commits, not in stories — three branding commits readable with one `git log` command.

## The letter w., drawn as geometry, not font

Wakii's entire visual identity fits in one SVG file. Its structure:

```text
viewBox="0 0 128 128"
rect 128×128, rx=28, gradient #131A17 → #04140D
path "M26 42 L44 88 L64 48 L84 88 L102 42"
     stroke #45E0A8, width 13, round caps
circle cx=106 cy=86 r=8.5, fill #D7E2DD
```

*Source: `public/wakii-icon.svg`, repo `wakii-dev/wakii-site`, retrieved 2026-09-08.*

Three shapes: a dark rounded square with a gradient, one zigzag stroke drawing the letter w, one round dot. No `<text>` element — no font needed, no worrying about missing glyphs on some system. This decision has a recorded history, written in the favicon file itself:

```text
<!-- wakii monogram icon — "w." drawn as geometry, no font
     dependency. Replaces the old <text>-based favicon
     (font rendering was inconsistent across platforms).
     Direction: The Monogram, 2026-09-05. -->
```

*Source: `public/favicon.svg`, repo `wakii-dev/wakii-site`, retrieved 2026-09-08.*

That comment briefly tells of an earlier failure: a previous favicon used `<text>` and suffered inconsistent font rendering across platforms. Pure geometry is the radical fix — your stroke renders identically everywhere because no font is asked to draw it for you. The design direction "The Monogram" also carries its selection date: 2026-09-05, after a three-direction draft.

## One master, three site-side consumers

`wakii-icon.svg` is not just an icon sitting idle in `public/`. Its opening comment declares its role:

```text
<!-- wakii icon symbol — "The Monogram" (chosen 2026-09-05,
     3-direction draft). Master file for reuse: favicon
     (public/favicon.svg is the small-size twin), GitHub
     avatar, og-image, Electron app icon source. -->
```

*Source: `public/wakii-icon.svg`, repo `wakii-dev/wakii-site`, retrieved 2026-09-08.*

Four consumers are declared in the comment — verify each. Favicon: `favicon.svg` contains the exact three shapes of the master (same `viewBox`, same path, same gradient, same dot), differing only in the comment — precisely what "small-size twin" means. Where it attaches to the HTML:

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

*Source: `src/layouts/Base.astro`, line 84, repo `wakii-dev/wakii-site`, retrieved 2026-09-08.*

The OG image — the card shown when links are shared — uses the icon's exact palette, with the source written into the file: `og-default.svg` (1200×630) comments on its first line "brand mono ~/wakii. aesthetic (tokens.css: bg #0A0E0D, accent #45E0A8, text #D7E2DD, dim #6B7A74)". That palette was not chosen for the card alone: it is the site-wide token set — the post on [bento and tokens](/blog/arch-site-bento-tokens/) goes deep into that system, and the one on the [OG article contract](/blog/og-article-contract-anatomy/) dissects the card from the SEO angle. One palette flowing from tokens.css through icon, favicon, and share card — that is what "one master" buys you: not a single file, but a single geometry and color source every surface derives from.

```ascii
tokens.css (palette)
   │
   ├─► wakii-icon.svg ── geometry master
   │        ├─► favicon.svg  ── browser (Base.astro)
   │        ├─► GitHub avatar ── public repo
   │        └─► og-default.svg ── share card 1200×630
   │
   └─► icon.icon (Icon Composer) ── app side
            └─► generate.sh ──► icns + png
```

*Source: diagram assembled from comments in `wakii-icon.svg`, `Base.astro` line 84, and `og-default.svg` — repo `wakii-dev/wakii-site`, retrieved 2026-09-08.*

## The app side: Icon Composer instead of SVG

The web eats fresh SVG, but the desktop does not live on plain vectors — macOS needs `.icns` with per-size slots, the tray needs a right-sized png. The product repo solves this with a dedicated build pipeline whose entry point sits in `package.json`:

```text
"build:icons": "bash resources/icon-source/generate.sh"
```

*Source: `package.json`, line 98, repo `wakii-dev/wakii` (local clone), retrieved 2026-09-08.*

Reading the top of `generate.sh` exposes the pipeline's single source:

```text
# Generate app icons from Icon Composer .icon project
# Produces: resources/build/icon.icns (macOS),
#           resources/build/icon.png (fallback),
#           resources/icon.png (tray)
```

*Source: `resources/icon-source/generate.sh`, repo `wakii-dev/wakii`, retrieved 2026-09-08.*

The `resources/icon-source/` directory indeed holds exactly two files: `icon.icon` — an Icon Composer project, Apple's icon-building tool — and the `generate.sh` script. The script runs Xcode's `actool` to compile the `.icon` into an `.icns`, then uses ImageMagick to trim the small slots. One comment in the script explains why this care is needed: "macOS list views use the small .icns slots directly" — macOS list views read the small slots of the icns directly, so every slot must be correct; you cannot freely scale up and down the way the web can.

The notable part is the two-master architecture: the site uses a plain SVG as its master, the app uses an Icon Composer project as its master. The two masters do not sync automatically — they are two embodiments of the same "w." geometry, each kept in the format its environment needs. When the geometry changes, both change with one commit per repo — and git history records exactly that.

## Icon changes are recorded in commits

Who changed what in the icon — the answer lives not in anyone's memory but in the file's history. The three most recent branding commits touching `resources/icon.png` in the product repo:

```text
$ git log --oneline -3 -- resources/icon.png
b4149b602a brand: wakii monogram app icon — replace orca-era icon assets
d0d6fdefcf feat(brand): rename app display name to wakii
1cef5a2802 feat(brand): replace Orca logo/icon with HoiVu branding
```

*Source: `git log --oneline -3 -- resources/icon.png` on the `wakii-dev` branch, local clone of the `wakii-dev/wakii` repo, retrieved 2026-09-08.*

Those three lines narrate a full branding lifecycle: the old logo replaced with the HoiVu identity, the display name renamed to wakii, then the orca-era icon assets replaced outright with the monogram. Commit `b4149b602a` is the moment the monogram entered the app's icon assets — on the `wakii-dev` branch, as of the date this post read the history; the post makes no further claim about which release contains it. How the app consumes these icons is also readable in code: `src/main/app-icon.ts` builds an `APP_ICON_PATHS` map with three runtime choices — `classic` (using `icon.png` in production, `icon-dev.png` in dev builds), plus `watercolor` and `blue` — allowing the app icon to switch at runtime, persisting the change through an AppleScript call into macOS `NSWorkspace`.

One geometry, two repos, two pipelines — and no link in the chain is a black box: every joint is a readable file, every change a traceable commit. "How is Wakii different from Orca" has many deep technical answers; the shortest one sits in your browser tab — a mint w. on a dark tile. Download Wakii and watch that icon land in your dock, or read the [FAQ](/docs/faq/) for more on the relationship between Wakii and Orca.
