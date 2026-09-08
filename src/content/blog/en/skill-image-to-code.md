---
title: "Skill /image-to-code: from screenshot to component"
description: "Read a reference image like an art director: one large image per section, hierarchy – spacing – tokens extracted, then code checked against the image — plus the boundary of when not to use this skill."
pubDate: "2026-09-12"
category: "tech"
tags: ["skills", "design", "features"]
draft: false
---

You have a beautifully designed image — a hero, a form, a pricing card — and you want it as a real component. The default AI move is to glance at it and code from memory of "what good websites look like", and the result slides toward a familiar template: purple gradients, cards nested in cards, cramped spacing — exactly the slop list this skill writes down to fight. `image-to-code` in Wakii's kit flips the order: the image is the source, the code is the translation. This post reads the skill as a craft document, quotes the rules it actually sets, then draws its boundary.

TL;DR:

- `image-to-code` is a design-group skill in the kit: it loads when a component must be built new from an image or design reference — not a background UI assistant.
- The image that deserves this skill is a large, clean shot of one section; a whole-page board shrunk until its text is unreadable does not.
- The skill reads the image like an art director: hierarchy, spacing, typography, color — analysis has rules, and "vibe" analysis is banned.
- The image is the fidelity target: code matches the image, not the model's imagination.
- The boundary is explicit: initial mocks, post-build audits, and whole-page layouts belong to other skills; this repo also runs the reverse direction — code generating images.

## One large image, one section — not a whole-page board

The first thing the skill legislates is the unit of an image. In environments with image generation it requires producing reference images before writing code — and producing enough of them: one primary image per section, detail images for complex sections, a fresh cleaner regeneration when a section is still unclear. The original rule, verbatim:

```
- it is better to generate too many clear images than too few compressed images
- it is better to generate one clear image per section than one unreadable board for the whole site
- it is better to create an extra detail image than to guess details later
```

*Source: ~/.claude/skills/image-to-code/SKILL.md, §3 "Generate enough images rule", retrieved 2026-09-08.*

The reason is analytical resolution: a board that compresses many sections into one image shrinks text, spacing and buttons below the readable threshold. The same disease applies to screenshots: cropping a small region out of a full-page capture to save time breaks trust the same way — the skill lists what cropping tends to destroy: spacing accuracy, type scale relationships, clean margins, layout proportions. The image that deserves this work is a large, clean shot of exactly one section; the skill's own description pins the preference: "large section-specific images, avoid cards-in-cards, clean hero". An image full of nested layers stays hard to turn into components even when it is huge, because the image itself does not show where one layer ends and the next begins.

## Reading the image like an art director: hierarchy, spacing, tokens

The second step is analysis, and the skill bans the lazy kind in so many words: "Do not do vague vibe-only analysis. Do not jump too fast from image to code." It demands the image be treated as a specification: "Treat them like a design specification." Readable text gets extracted verbatim — headline, subheadline, CTA labels; typography is analyzed through size and weight relationships, not dismissed as "nice"; colors are extracted as an actual palette instead of being replaced by default web colors. Spacing gets a sentence that pins the whole attitude:

```
The goal is not exact pixel OCR.
The goal is faithful spacing logic.
```

*Source: ~/.claude/skills/image-to-code/SKILL.md, §23 "Spacing extraction rule", retrieved 2026-09-08.*

Along with a concrete reading list: how far the headline sits from the subheadline, text from buttons, cards from each other, the side gutters, the padding inside a card. That is where the difference lives: an image that looks "nice" and an image that yields hierarchy, spacing logic and tokens are two different materials for whoever writes the code. The skill demands the second.

## The image is the standard to match, not the inspiration

The failure mode this skill targets has a name: design drift — the images look strong, but the coded result becomes generic. The opposing principle is written as two goals set side by side:

```
The goal is not:
- inspired by the image

The goal is:
- visually faithful to the image, translated into real frontend
```

*Source: ~/.claude/skills/image-to-code/SKILL.md, §26 "Design-to-code copy discipline", retrieved 2026-09-08.*

And a shorter line at the very top of the document: "The image is the design source. The code is the translation layer." In the kit's real workflow the role is named explicitly: when a sub-feature must build a new component from a design capture, the workflow points straight at this skill.

```
Component mới: `image-to-code` với capture làm fidelity target.
```

*Source: ~/.claude/skills/orca-superpowers-workflow/SKILL.md (slot F6), retrieved 2026-09-08.*

"Fidelity target" is the phrase worth pausing on: the capture is not an opening inspiration but the standard the code will later be compared against — something like an acceptance test for the interface. The checking direction matches: a difference between code and image is data, not the implementer's license to quietly "improve" things.

## When NOT to reach for image-to-code

The skill declares its own boundary in its description — verbatim (it is written in Vietnamese, as this kit's skill descriptions are):

```
Elite image→code cho component riêng lẻ — LOAD ONLY khi story-workflow
Principle 8 bước 5 (component must-build-new từ ảnh/design reference)
hoặc user chỉ định "từ ảnh này làm component". KHÔNG load cho việc
mock/prototype ban đầu (huashu/mock-prototype lo) hay layout tổng.
Ưu tiên ảnh lớn section-specific, tránh cards-in-cards, hero sạch.
```

*Source: ~/.claude/skills/image-to-code/SKILL.md (frontmatter description), retrieved 2026-09-08.*

Read in the negative, three neighbor paths appear. Needing to explore direction before any code exists — three HTML directions, pick one, then build — is mock-prototype's job. A UI that is already built and needs an audit before shipping belongs to design-taste-frontend, the audit-first skill: it reads code and flags issues against a checklist instead of generating images ([the post on audit before build](/blog/skill-design-taste-frontend/) covers that angle). Building fresh with no reference image, when what you need is principled taste, is [frontend-design](/blog/skill-frontend-design/). And a "whole-page layout" — allocating a full page into sections — is a different question from one standalone component, which the description refuses outright.

## The reverse direction in this repo: code → image

`image-to-code` runs from image to code. Wakii's site runs the same pipeline backwards for blog hero tiles: an SVG template rendered by headless Chrome into a standard 1200×630 PNG. The script's header describes itself:

```js
/**
 * Hero tile pipeline (story FI-349 SF-1; parameterized FI-373 SF-1): SVG
 * template per post → headless Chrome screenshot → public/blog/heroes/<slug>.png
 * (1200×630, brand mint on dark — same DNA as public/og-default.svg).
```

*Source: scripts/render-blog-heroes.mjs (header comment), retrieved 2026-09-08.*

The notable part: the hero set is not hard-coded anywhere. The script scans EN post frontmatter, and any post whose declared hero path exactly matches its own PNG gets rendered — a strict value match so a copy-pasted path cannot silently render the wrong tile. This very post deliberately omits that line (the matrix marks it as having no hero), so the script simply skips it. The two directions clarify each other's boundary: the hero pipeline is code → image with deterministic output — re-render it and you get the same thing; `image-to-code` is image → code, where the image is the standard to match rather than a rendered product. Nobody screenshots a hero tile and rewrites the SVG from the screenshot — whichever direction holds the canonical source wins.

`image-to-code` is one of the public skills shipping with Wakii's kit, in the same design group as the skills covered in the [catalog tour](/blog/skills-catalog-tour/). The [agents-and-kit](/docs/agents-and-kit/) page lists the agent team and the bundled kit for reference.

Wakii is an agentic IDE with a built-in superpowers team. Next time you have a section image you want as a real component, hand it to the agent and let it read the image like an art director: one large image, one translation that matches the standard.
