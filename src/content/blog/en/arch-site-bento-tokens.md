---
title: "Wakii site: bento layout and design tokens"
description: "Inside the design system of wakii.xyz: one token file as the contract, a 12-column bento grid in plain CSS, and the min-width: 0 lesson when a cell has to host a fixed 680px board."
pubDate: "2026-09-26"
category: "tech"
tags: ["architecture", "design", "wakii"]
draft: false
---

The homepage of wakii.xyz looks like a bento board: cells of uneven sizes, sitting next to each other yet deliberately off-rhythm. That sense of discipline does not come from a UI framework. It comes from an old systems convention: a single source of truth. For this site, that source is a token file of roughly 45 lines. This post dissects how it works: the token contract, the 12-column grid, and a real overflow lesson learned when one cell had to host a fixed 680px board.

TL;DR:

- Every color, radius and spacing rhythm on the site lives in `src/styles/tokens.css` — plain CSS variables, with a comment forbidding renames.
- The bento grid is a plain 12-column CSS grid in `src/components/landing/Bento.astro`; six cells are laid out asymmetrically using only `grid-column`.
- A cell hosting a fixed 680px board has to live inside a shrinking track: `min-width: 0` unlocks the shrink, an auto-scale script handles the picture.
- There is no dedicated 390px breakpoint: the grid collapses to one column at 1020px, and the board scales itself to whatever width remains.

## One token file, the whole site answers to it

Open `src/styles/tokens.css` and the first thing you see is not a color value — it is the header comment:

```css
/*
 * Wakii design tokens — "Modern Bento Premium" v2 (user-approved 2026-09-04).
 * Source of truth: docs/superpowers/designs/sf1-direction.md (BINDING, v2).
 * Fidelity target: docs/superpowers/designs/direction-d3-bento.html.
 * v1 Terminal Mono DNA (mono/mint/near-black) retained as identity base.
 *
 * SF-2/SF-3 consume these names — do not rename.
 */
```

*Nguồn: src/styles/tokens.css, lines 1-8, retrieved 2026-09-08.*

The contract has three layers: an approved design file (`sf1-direction.md`), a token file that pins final values, and a rename ban for every component that consumes them later. The pinned values read directly from the file:

```css
--bg: #0A0E0D;
--bg-card: #131A17; /* bento cells */
--accent: #45E0A8;
--text: #D7E2DD;
--radius-cell: 12px; /* bento cells (hand-off: 8–12px) */
--radius-btn: 6px;   /* buttons */
--bento-gap: 18px;
--wrap: 1240px;
```

*Nguồn: src/styles/tokens.css, retrieved 2026-09-08.*

The detail worth noticing is the "hand-off" comments. The design file approved a range — bento cell radius 8-12px, bento gap 16-20px — and the token file pinned one value inside that range: 12px and 18px, with the original range noted right above the line. Anyone reading the code later can trace each value back to a design decision. The site is also dark-only: there is no light/dark toggle, and the declaration sits in the first lines of the global stylesheet:

```css
html {
  scroll-behavior: smooth;
  color-scheme: dark;
}
```

*Nguồn: src/styles/global.css, lines 11-14, retrieved 2026-09-08.*

`body` takes its background from `var(--bg)` and its text color from `var(--text)` — even the `::selection` recolors to match the accent. No component gets to invent a color code.

## The bento is a 12-column CSS grid, not a framework

The landing "bento" lives in exactly one component: `src/components/landing/Bento.astro`, holding six cells — the bracket canvas, the 9-agent grid, the gates strip, the memory log, the watchdog console, and figma-to-verify. Laying them out is a plain 12-column CSS grid:

```css
.bento {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--bento-gap);
}
.bx-a { grid-column: 1 / 9; grid-row: 1 / 3; }
.bx-b { grid-column: 9 / 13; }
.bx-c { grid-column: 9 / 13; }
.bx-d { grid-column: 1 / 6; }
.bx-e { grid-column: 6 / 10; }
.bx-f { grid-column: 10 / 13; }
```

*Nguồn: src/components/landing/Bento.astro, retrieved 2026-09-08.*

Those six `grid-column` lines draw the entire layout:

```ascii
 cols →  1         5         9    12
        ┌───────────────────┬────────┐
        │                   │   B    │
        │         A         ├────────┤
        │   bracket canvas  │   C    │
        │  1/9 · rows 1→3   │  9/13  │
        ├────────┬──────────┴───┬────┤
        │   D    │      E       │ F  │
        │  1/6   │    6/10      │10/13│
        └────────┴──────────────┴────┘
```

*Nguồn: diagram built from the grid-column values in src/components/landing/Bento.astro, retrieved 2026-09-08.*

Cell A spans 8 columns and 2 rows — that is the bracket canvas, the lead character. The bottom row is split among three cells at three different widths: 5, 4 and 3 columns. No media query touches this layout layer; "deliberate asymmetry" is just arithmetic over grid tracks, and the gap between cells is literally one token: `var(--bento-gap)`.

## min-width: 0 and the 680px board

Inside cell A sits the bracket canvas — an SVG board with a fixed 680×400 coordinate space. This is where the grid hits a classic problem: by default a grid item has `min-width: auto`, meaning it never shrinks below its content. The 680px board would push its track wide and wreck the 12 columns. The fix sits right in Bento.astro:

```css
.bx {
  will-change: transform;
  /* cho phép track co dưới min-content của board 680px (scale script lo hình) */
  min-width: 0;
}
```

*Nguồn: src/components/landing/Bento.astro, lines 130-134, retrieved 2026-09-08.*

`min-width: 0` alone only unlocks shrinking — the picture would still break if nothing squeezed the content. That part belongs to BracketCanvas: a script measures the container's real width and scales the whole board by that ratio:

```ts
const s = Math.min(1, outer.clientWidth / 680);
board.style.transform = `scale(${s.toFixed(4)})`;
```

*Nguồn: src/components/mockups/BracketCanvas.astro, scaleAll function, retrieved 2026-09-08.*

That pair is why you will not find a 390px breakpoint anywhere in `src/` — grepping for `390` returns zero lines. At 1020px, the component's single media query collapses the grid to one column; below that, the board scales itself to the width left over after the 32px side padding of `.wrap`. The `min-width: 0` pattern is not unique to Bento either: a grep across `src/` counts 17 occurrences at the time of writing, from PostCard to DocsLayout. It is a lesson that was paid for with a broken layout, then written down as a repo-wide convention.

## A one-way chain: direction → tokens → components → pages

The system only works because values flow one way. No component invents a color, no page sets its own radius:

```ascii
docs/superpowers/designs/sf1-direction.md    (BINDING, approved 2026-09-04)
        │  pinned values
        ▼
src/styles/tokens.css        ← CSS variables, no UI classes
        │  var(--radius-cell), var(--bento-gap), var(--accent)…
        ▼
src/components/landing/*.astro + src/layouts/*.astro
        │  consume tokens, never hardcode values
        ▼
src/pages/index.astro (EN, 10 lines) · src/pages/vi/index.astro (VI, 9 lines)
```

*Nguồn: real paths in the public repo wakii-dev/wakii-site; line counts taken in the worktree, retrieved 2026-09-08.*

The homepage is a thin wrapper: 10 lines for EN, 9 for VI, each just wrapping the Landing component and injecting the right string pack. The same token set flows down into blog and docs — the post detail layout `src/layouts/BlogDetailLayout.astro` is among the 17 `min-width: 0` spots mentioned above. At the time of writing, the blog holds 25 slugs × 2 locales = 50 files (snapshot 2026-09-08), and all of them render on the same token foundation — a number you can recount with `ls src/content/blog/en`.

A token change therefore has no shortcut: it goes through the repo's public build chain — parity gate → content lint → astro build. The post [log 2 of the building-in-the-open series](/blog/building-wakii-in-the-open-log-2/) dissects that chain layer by layer; here it is enough to add that the one-place-ness of tokens is what keeps that chain short enough to trust.

Questions about the site and the product are collected on the [FAQ page](/docs/faq/). To see how this site itself got built, the best starting point is [case study: this blog is a running story](/blog/blog-story-case-study/).

To watch the bento cells move, open wakii.xyz and hover over them. To get a token system like this in your own project, start at the [getting started page](/docs/getting-started/) — the kit installs with one command; the rest is convention.
