---
title: "Skill /gpt-taste: breaking AI's statistical defaults"
description: "Why AI-built UIs all look alike: six-line headings, repeated left/right layouts, cheap meta labels. Skill /gpt-taste breaks those statistical defaults with scripted randomization and enforceable hard rules."
pubDate: "2026-09-11"
category: "tech"
tags: ["skills", "design"]
draft: false
---

Ask three agents to build the same landing page and you get back three pages that look like one. They don't share ideas — they share biases: a six-line heading squeezed into a narrow container, the same left/right layout repeated page after page, "SECTION 01" labels sprouting under every section. That's not bad taste; that's the statistical default of a language model. The Wakii kit ships one skill built specifically to fight it: /gpt-taste — and this post reads its source to see what it bans, and when it's allowed on stage.

TL;DR:

- AI-generated UIs look alike because of five statistical biases the skill names in its opening lines: six-line headings, dead bento cells, cheap meta labels, invisible button text, endlessly repeated left/right layouts.
- /gpt-taste fights back with constrained randomization: before the first line of UI code, the agent must simulate a Python script that picks layout, fonts, components, and animations from closed menus — then follow the result exactly.
- The hard rules are eyeball-checkable: H1 at most 2-3 lines, no dead cells in bento grids, meta labels banned outright, `py-32` padding between major sections.
- The skill does not load during initial build or mock-ups: in the kit's story workflow it holds exactly one slot — F8 UX review (P8.6), after an implementation exists.

## Three AI-built pages, and why they look the same

A language model generates text by probability: the next paragraph is the one most likely to follow the previous ones. Ask for a landing page and the highest-probability output converges on one average shape — and the skill names that average shape in its very first lines:

```
Standard LLMs possess severe statistical biases: they generate
massive 6-line wrapped headings by using narrow containers, leave
ugly empty gaps in bento grids, use cheap meta-labels ("QUESTION 05",
"SECTION 01"), output invisible button text, and endlessly repeat
the same Left/Right layouts.
```

*Source: ~/.claude/skills/gpt-taste/SKILL.md (CORE DIRECTIVE section), taken 2026-09-08.*

Five biases, counted: six-line headings from narrow containers; dead cells in bento grids; meta labels like "QUESTION 05" and "SECTION 01"; button text without enough contrast to read; endlessly repeating left/right layouts. What stands out is the ordering: the skill names its enemy before teaching a single rule — because a bias is a default, and an instruction like "be creative" doesn't beat probability; the model still slides back to the familiar layout in the next paragraph. To win, the act of choosing has to leave the hands of probability. That's the next section's job.

## True randomization, not vibes-based randomness

Section 1 of the skill diagnoses exactly where every "be creative" advice breaks:

```
## 1. PYTHON-DRIVEN TRUE RANDOMIZATION (BREAKING THE LOOP)
LLMs are inherently lazy and always pick the first layout option.
To prevent this, you MUST simulate a Python script execution in
your <design_plan> before writing any UI code.
```

*Source: ~/.claude/skills/gpt-taste/SKILL.md (section 1), taken 2026-09-08.*

The mechanism: before writing any UI code, the agent must simulate a Python script inside a `<design_plan>` block; the seed is deterministic — for example, the prompt's character count fed through a modulo — simulating `random.choice()` to draw from closed menus:

```
<design_plan> — mandatory before the first line of UI code

seed = prompt length → modulo            (deterministic, not vibes)
pick 1 hero layout      out of 3         (section 3 of the skill)
pick 1 typography stack out of 4         (Satoshi, Cabinet Grotesk,
                                          Outfit, Geist — Inter is off the menu)
pick 3 components       from arsenal of 4 (section 6)
pick 2 GSAP paradigms   out of 5         (section 5)
```

*Source: ~/.claude/skills/gpt-taste/SKILL.md (sections 1, 3, 5, 6), taken 2026-09-08.*

Three things make this different from a "change it up" incantation. One: selections come from closed menus — a draw from a curated list, not a free invitation. Two: an anti-repeat rule ships alongside — "You are forbidden from defaulting to the same UI twice." Three: the draw leaves an audit trail — the `<design_plan>` must print three lines of mock Python output as evidence, and the agent must follow the exact result; faking the draw and using the familiar layout anyway violates the very rule it just wrote. The deterministic seed has a side effect worth noting: the same prompt yields the same selection — the goal isn't a lucky spin, it's forcing the choice away from the "first option" the model picks out of laziness.

## The hard rules: structure, typography, bento, motion

The rest of the file is a dense list of enforced rules — dense enough that even a summary table needs trimming. In source order:

| Rule | Content | Where |
|---|---|---|
| AIDA structure | nav → Attention (hero) → Interest (bento) → Desire (GSAP) → Action (footer) | section 2 |
| Spacing | `py-32 md:py-48` between major sections — each section its own chapter | section 2 |
| Two-line H1 | H1 must not exceed 2-3 lines; 4, 5, 6 lines is a "catastrophic failure"; container `max-w-5xl` / `max-w-6xl` | section 3 |
| Clean hero | no stamp/badge icons over text, no pill-tags under the hero, no raw stats in the hero | section 3 |
| Gapless bento | `grid-flow-dense` mandatory; mathematically prove col-span/row-span interlock, zero dead cells | section 4 |
| Card restraint | 3-5 intentional cards beat 8 messy ones | section 4 |
| Strict motion | real GSAP: pinned sections, image scale 0.8→1.0, text scrub 0.1→1.0, card stacking | section 5 |
| Meta-label ban | "SECTION 01", "QUESTION 05", "ABOUT US" — "BANNED FOREVER" | section 7 |
| Pre-flight | `<design_plan>` block with 5 checks before any code ships | section 8 |

*Source: ~/.claude/skills/gpt-taste/SKILL.md (sections 2-8), taken 2026-09-08.*

The common trait of the table: every rule ships with a way to verify it. "No dead cells" is not a feeling — it's arithmetic on col-span/row-span that must interlock. "Two-line H1" is not taste — the container width determines the line count, measurably. Section 8 is the final lock: the pre-flight `<design_plan>` requires five checks — Python RNG execution, AIDA check, hero math verification, bento density verification, label sweep plus button contrast — and only after all five may the first line of code appear.

This "aesthetics as measurable constraint" mindset isn't foreign to the site you're reading: the visual direction of Wakii's landing, chosen during the FI-349 redesign, writes its grid and spacing specs as hard numbers:

```
# SF-1 Design Direction — "Modern Bento Premium" (D3 — user chose 2026-09-04…)

Structure (landing — asymmetric 12-col bento per direction-d3-bento.html)
Spacing on an 8px rhythm; section padding 96–128px; bento gap 16–20px.
```

*Source: docs/superpowers/designs/sf1-direction.md, taken 2026-09-08 — block translated from the Vietnamese original.*

An asymmetric 12-column bento, 16-20px gaps, 96-128px section padding — the same core move as /gpt-taste: aesthetics written as verifiable specs, not retrofitted inspiration.

## When this skill takes the stage

Knowing what it bans is half the story; the other half is when it runs. The answer lives in the kit's story workflow: grep for gpt-taste in the orca-superpowers-workflow file — the document describing the full pipeline — and the name appears in exactly two places. The first is the F8 slot, UX review (P8.6):

```
- **F8. UX review (P8.6)** — 3 lớp chạy như TASK trong plan (không phải
  gợi ý), so implementation lại Intent:
  · `web-design-guidelines` — 105 rules cụ thể trên CODE (a11y/focus/
    forms/animation/keyboard) — bắt lỗi ảnh không thấy được
  · `gpt-taste` + `design-taste-frontend` — thẩm mỹ + anti-slop
  · `frontend-design` — chủ đích: signature, copy-as-design, calibration
    chống 3 "AI default looks"
```

*Source: ~/.claude/skills/orca-superpowers-workflow/SKILL.md (F8. UX review — P8.6 section), taken 2026-09-08. Quoted verbatim — the workflow doc itself is written in Vietnamese.*

The second is a note classifying it as a conditional skill: if it's missing, the workflow still completes — the skipped verification step gets flagged instead of stalling the story. Both places state the same ordering: UX review runs after implementation, meaning the skill does not load during initial mock-ups and does not interfere while a prototype is taking shape. The ordering is deliberate: an anti-slop rulebook only has something to inspect once a concrete implementation exists. Same philosophy as the web-design-guidelines layer right above it: one layer checks real code, one layer judges aesthetics — both need something built first.

Using the kit outside the story workflow, the equivalent moment is: you have a finished page and want it out of AI-default looks, or you want an anti-slop review before shipping. While the idea is still a rough frame, other design-group skills handle their part — a short map of the whole catalog is in [the tour of Wakii's public skills](/blog/skills-catalog-tour/), and the pre-code phase — where aesthetics aren't the job yet — is the subject of [skill /brainstorm: from raw idea to a verified spec](/blog/skill-brainstorm/).

gpt-taste is one of six public design-group skills in the kit — 20 skills total, 13 public, at the time of writing (2026-09-08). Which agent loads which skill at which phase of a story — including the UX review slot above — is documented in full on [agents and kit](/docs/agents-and-kit/).

Wakii is an agentic IDE with a built-in superpowers kit. Download it, run a story with a UX review, and open the rulebook above in full — the skill source is a text file, and nothing stops you from reading it.
