---
title: "Skill /figma-orientation: read Figma like an agent"
description: "A router skill that reads your Figma intent before the agent calls a tool: the failure class it blocks, the decision tree it walks, and the cases where a project doesn't need it."
pubDate: "2026-09-14"
category: "tech"
tags: ["skills", "design"]
draft: false
---

An agent with Figma tools in hand doesn't automatically know where to start. Before it can draw its first node, it has to answer a smaller question: what kind of task is this — reading the canvas, writing to it, translating a design into code, or generating a diagram? Pick the wrong kind and you call the wrong tool, and some wrong calls don't fail on the spot; they leave consequences that are hard to trace later. The `/figma-orientation` skill in the Wakii kit exists for exactly that moment: a thin layer that stands in front of the Figma task, reads the intent, and only then points the way.

TL;DR:

- `/figma-orientation` is a router skill: it doesn't do the work — it maps your intent to the right official Figma skill or to a direct MCP tool call.
- It blocks a named failure class: calling `use_figma` without `figma-use` loaded — the router's own docs call this the #1 hard-to-debug failure.
- The routing mechanism is a 10-question decision tree, plus a table of read operations that need no skill at all.
- At the workflow level, Principle 8 of `orca-superpowers-workflow` opens its Figma pipeline with this exact router when a description contains a figma.com URL.
- The post also covers the reverse: when a project doesn't go through Figma at all — like the site you're reading — the router stays dormant; it states the activation conditions instead of inventing a usage story.

## The classic failure: calling a tool before knowing the route

The Figma MCP toolset has two layers that are easy to confuse: tools you call directly (`use_figma`, `generate_diagram`) and their companion skills (`figma-use`, `figma-generate-diagram`) that load the controlling context before the call. The classic failure is skipping the second layer. The router states its reason to exist right in the frontmatter — it was written to prevent "calling use_figma without figma-use (common hard-to-debug failure)".

Why hard to debug? Because the call still runs and the canvas still changes. The fault isn't on the line that called the tool; it's in the controlling knowledge that should have been loaded beforehand — and by the time you notice, the canvas has drifted and the edit history has grown. The router's "Hard rules" section names the three forbidden call patterns outright:

```text
1. `use_figma` REQUIRES `figma-use` loaded first. No exceptions.
   This is the #1 Figma failure mode.
2. `generate_diagram` REQUIRES `figma-generate-diagram` loaded first.
   Routes to type-specific guidance.
3. Do NOT call write tools (use_figma, create_new_file, upload_assets)
   without confirming target file + scope with the user — writes are
   visible to teammates and hard to undo silently.
```

*Nguồn: ~/.claude/skills/figma-orientation/SKILL.md, mục "Hard rules", lấy 2026-09-08.*

Rule 3 widens the pattern. It's not just about the right skill — it's about the right sequence of asking permission: writing to the canvas is an action your teammates can see, so "confirm target file + scope with the user" is written as a hard rule, not as a courtesy. The router itself does nothing except repeat those three lines before your hand reaches the button.

## The router reads intent first; tools come second

The whole routing mechanism fits in one decision tree of ten questions (Q1–Q10), each pinned to a type of intent. Q1: is the task a canvas write — create or edit nodes, tokens, components? If yes: load `figma-use` first, then call `use_figma` — and depending on the kind of work, the router stacks a skill that teaches the "what": `figma-generate-design` when translating an app page into a Figma layout, `figma-generate-library` when building a design system, `figma-use-figjam` for FigJam. Q2: FIGMA → CODE, implementing a design as code? → `figma-implement-design`. Q3: the reverse, CODE → FIGMA? → `figma-generate-design` + `figma-use`. Q4: an architecture diagram, ERD, flowchart? → `figma-generate-diagram`. And on through Code Connect, SwiftUI, motion, slides.

Then there's a third layer newcomers often miss: read operations need no skill at all. `whoami`, `get_metadata`, `get_design_context` — the last one the router calls the "primary design-read tool" — plus `get_screenshot` and `get_variable_defs` (reads design tokens back as CSS variables) are safe to call directly because they stay off the write path. The "route" in this post therefore has three lanes: a mandatory skill, a stacked companion skill, and free read tools. The router's quick reference card draws exactly those lanes:

```text
READ Figma         → get_metadata / get_design_context / get_screenshot  (no skill)
WRITE Figma canvas → figma-use  (MANDATORY)  [+ figma-generate-* for composed tasks]
FIGMA → CODE       → figma-implement-design  [+ image-to-code for elite quality]
CODE → FIGMA       → figma-generate-design  + figma-use
DIAGRAM            → figma-generate-diagram  (MANDATORY before generate_diagram)
```

*Nguồn: ~/.claude/skills/figma-orientation/SKILL.md, mục "Quick reference card" (trích 5/12 dòng), lấy 2026-09-08.*

The line worth noticing for frontend teams: `[+ image-to-code for elite quality]`. The router knows what your kit contains, and on the FIGMA → CODE branch it cross-links to another skill of the same kit — the [image-to-code post](/blog/skill-image-to-code/) goes deep on that half.

## Why a thin orientation layer pays for itself

The cost of a wrong call isn't one retry. The router devotes an entire "Common confusions" section to recurring wrong intuitions — two of its rows capture the two distinct failure species:

```text
"I'll just call use_figma to read this node"
  → Use get_design_context or get_metadata directly — no skill needed for reads
"I want to push my React component to Figma"
  → That's CODE→FIGMA → figma-generate-design (+ figma-use),
    NOT figma-implement-design (that's the other direction).
```

*Nguồn: ~/.claude/skills/figma-orientation/SKILL.md, mục "Common confusions" (trích 2/5 hàng), lấy 2026-09-08.*

The first species is a wrong lane: reading a node while demanding the write path — one wasted call, plus a habit of routing through the write path when none is needed. The second is a wrong direction: `figma-implement-design` and `figma-generate-design` both translate between design and code, in opposite directions; pick the wrong one and the agent runs an entire process for the right verb in the wrong orientation. Neither species crashes — both drift quietly, and you pay at review time.

Scaled up to the workflow level, "going through the router" stops being personal taste. Principle 8 of `orca-superpowers-workflow` writes it as the pipeline's entry condition (quoted verbatim from the VI source file):

```text
## Principle 8: Figma Pipeline (auto-triggers khi description chứa figma.com URL)

Kích hoạt: description có `figma.com/(design|file|proto|board)/` URL
HOẶC bracket ghi `Design: figma`. Bắt đầu bằng `figma-orientation` (router).
(Activation: a figma.com URL in the story description, or `Design: figma`
in the bracket — start from `figma-orientation`, the router.)
```

*Nguồn: ~/.claude/skills/orca-superpowers-workflow/SKILL.md, Principle 8 "Figma Pipeline", lấy 2026-09-08.*

The same principle records the bill one story already paid: before everything merged into a single pipeline, Figma entered stories through seven scattered fragments — agent eyeballing instead of captures, blind numeric diffs, captures stored where links died — and the result was an app that matched the text spec but shipped the wrong design: missing a 48px sidebar, missing the header, an 80px row off. A thin layer in front doesn't do the work of the layers behind it; it keeps them from starting over because they took the wrong lane in the first second.

## When the router takes the stage — and when a project doesn't need it

The activation condition is written as plainly as the quote above: a `figma.com/(design|file|proto|board)/` URL in the description, or `Design: figma` in the bracket. With neither, the Figma pipeline doesn't run — and the router isn't loaded. That's the nature of a reference-class skill: it lives on a condition, not on a default.

And here's the truth from the repo you're reading right now: this site hasn't gone through Figma even once. Its entire design direction — from the Bento redesign to the downloads page — lives in `docs/superpowers/designs/` as HTML and markdown files:

```text
$ ls docs/superpowers/designs/
direction-a.html            direction-b.html           direction-c.html
direction-c1-tilt.html      direction-c2-scene.html    direction-c3-webgl.html
direction-d1-cinematic.html direction-d2-tour.html     direction-d3-bento.html
fi349-sf3-direction.md      sf-downloads-direction.md  sf1-direction.md
sf2-direction.md            sf3-direction.md
```

*Nguồn: ls docs/superpowers/designs/ (repo wakii-site), lấy 2026-09-08.*

So this post states it flatly: no story on this site has run `/figma-orientation`, and the post won't invent a usage anecdote. What it keeps is the activation condition. When a design team starts handing over Figma files, when a figma.com URL shows up in a description — at exactly that moment, the agent's first move is not `use_figma` or `get_screenshot`; it's opening the router. Prototyping in HTML is a different, equally valid lane; the router stays dormant until real Figma enters the lifecycle, which is why it belongs to the reference group rather than the workflow group.

`/figma-orientation` sits in the kit's reference group — alongside `graph-engineering` and `prompt-master`, three of the 13 public skills at the time of writing, 2026-09-08 (source: `src/data/skills.ts`). To see the whole shelf before opening any single book, the [skills catalog tour](/blog/skills-catalog-tour/) walks the `/skills/` page and the data file behind it. Which agent team loads these skills, and how the kit installs onto your machine — that's [agents-and-kit](/docs/agents-and-kit/).

Wakii is an agentic IDE with the superpowers kit built in — download it, and let the agent open the right book before it follows one.
