---
title: "Skill /design-taste-frontend: audit the built UI before it ships"
description: "An audit-first skill that only loads after the UI exists: read the brief to infer intent first, scan for named slop signals, then hold the page at a pre-flight gate before it ships."
pubDate: "2026-09-12"
category: "tech"
tags: ["skills", "design"]
draft: false
---

The worst-looking UI doesn't show up during mocking. At that stage every direction is still open, nothing is precious yet. Bad UI shows up at the end: the page is built, the tests are green, and someone notices the row of three identical cards, the headline screaming in oversized type, the testimonial customer named "John Doe". `/design-taste-frontend` exists for exactly that moment: an audit-first skill in the Wakii design kit that takes no part in building and only steps on stage once the page exists and needs to be scrutinized.

TL;DR:

- The skill declares its load condition right in the frontmatter: it loads only for post-implementation UX review (slot P8.6) or when the user asks for an "anti-slop review"; it does not load for initial building or mocking.
- Before judging a UI, the skill reads the brief: it scans 6 groups of signals and emits a one-line "Design Read" that states how it interprets the page, instead of guessing.
- Slop has a name: three equal cards, fake-perfect numbers, a fake dashboard built from divs, the em-dash. Each signal is a named ban in the source.
- The last gate is the FINAL PRE-FLIGHT CHECK: 62 checkboxes; miss one and the page is not done.

## Two moments of aesthetics: mocking and built

In the kit's design group, each skill owns a moment. When you are choosing a direction before any code exists, that is mock-prototype's job: build HTML prototypes for you to pick from. When you are building something new from a blank page, that is frontend-design's job: shape the UI with intent from the start. `/design-taste-frontend` takes the remaining part of the lifecycle: the page is already built, now it gets audited. This division of labor is not a cultural convention but a technical contract, written directly into the skill's frontmatter:

```
description: Anti-slop frontend review — LOAD ONLY khi story-workflow Principle 8 bước 6 (UX review sau implement) hoặc user nói "anti-slop review", "design review sau khi làm". KHÔNG load cho việc build/mocking ban đầu (dùng huashu/mock-prototype cho việc đó). Audit-first trên redesigns đã build, strict pre-flight check trước ship.
```

*Source: ~/.claude/skills/design-taste-frontend/SKILL.md (frontmatter), taken 2026-09-08.*

That contract has a return address. The SKILL.md of the workflow skill in the kit (`orca-superpowers-workflow`) contains the exact slot the frontmatter refers to: F8 inside Principle 8, scheduled at step 6, which is after implementation is done:

```
- **F8. UX review (P8.6)** — 3 lớp chạy như TASK trong plan (không phải
  gợi ý), so implementation lại Intent:
  · `web-design-guidelines` — 105 rules cụ thể trên CODE (a11y/focus/
    forms/animation/keyboard) — bắt lỗi ảnh không thấy được
  · `gpt-taste` + `design-taste-frontend` — thẩm mỹ + anti-slop
  · `frontend-design` — chủ đích: signature, copy-as-design, calibration
    chống 3 "AI default looks"
```

*Source: ~/.claude/skills/orca-superpowers-workflow/SKILL.md, taken 2026-09-08 — quoted verbatim; the workflow doc itself is written in Vietnamese.*

The most telling detail is in the first line: the UX review "runs as a TASK in the plan (not a suggestion)". It is a review with a slot in the plan, an owner, and a deliverable — not aesthetic advice an agent hands out when idle. This site's own blog redesign story followed that two-moment order: the design direction was locked first in a direction doc (`docs/superpowers/designs/sf1-direction.md`, still in the repo), the code was built against the chosen direction, and the aesthetic audit layer only gets loaded in the post-build review round, exactly as the LOAD ONLY clause requires. Mocking picks the direction; the audit catches the slop. Two jobs, two moments, no mixing.

## Read the brief before you judge the UI

The skill's first section is not a slop checklist; it is context reading. It opens with a blunt assessment of where bad output comes from:

```
Before touching code or tweaking dials, **infer what the user actually wants**. Most LLM design output is bad because the model jumps to a default aesthetic instead of reading the room.
```

*Source: ~/.claude/skills/design-taste-frontend/SKILL.md §0, taken 2026-09-08.*

Before scrutinizing anything, the skill reads 6 groups of signals: page kind (landing, portfolio, redesign, editorial), the vibe words the user used, reference signals the user pointed at (URLs, screenshots, named products), audience, brand assets that already exist, and quiet constraints such as accessibility-first or public-sector. Then it emits exactly one "Design Read" line in a fixed format:

```
Before any code, state in one line: **"Reading this as: \<page kind> for \<audience>, with a \<vibe> language, leaning toward \<design system or aesthetic family>."**
```

*Source: ~/.claude/skills/design-taste-frontend/SKILL.md §0.B, taken 2026-09-08.*

One example from the source reads an entire page in a single sentence:

```
- *"Reading this as: B2B SaaS landing for technical buyers, with a Linear-style minimalist language, leaning toward Tailwind utilities + Geist + restrained motion."*
```

*Source: ~/.claude/skills/design-taste-frontend/SKILL.md §0.B (example reads), taken 2026-09-08.*

For an audit round, that order determines the quality of the verdict. A dark, dense, heavily animated page can be exactly right for a "premium consumer" brief and wrong for a "trust-first public-sector" one — the two briefs sit on different rows of the skill's dial table. Auditing a UI without the brief in mind audits the wrong thing: what looks safe for one audience looks generic for another. The rule for ambiguity is equally explicit: if the design read is genuinely uncertain, ask exactly one question, never a dump of several; if the context is enough to infer confidently, do not ask at all.

## What slop looks like: named signals

Section 9 of the skill is titled "AI TELLS (Forbidden Patterns)" — the signatures of LLM-generated UI, grouped into 7 categories from 9.A (visual/CSS) to 9.G (em-dash). The whole section's principle fits in one sentence: "Avoid these signatures unless the brief explicitly asks for them." Four representative entries, quoted verbatim:

```
* **NO 3-column equal feature cards.** The generic "three identical cards horizontally" feature row is banned. Use 2-column zig-zag, asymmetric grid, scroll-pinned, or horizontal-scroll alternative.

* **NO fake-perfect numbers.** Avoid `99.99%`, `50%`, `1234567`. Use organic, messy data (`47.2%`, `+1 (312) 847-1928`).

* **NO div-based fake product UI in the hero** (fake task list, fake terminal, fake dashboard built from styled divs). It is the #1 LLM-design Tell. Use a real screenshot, a generated image, a real component preview, or none at all.
```

*Source: ~/.claude/skills/design-taste-frontend/SKILL.md §9.C, §9.D, §9.F, taken 2026-09-08.*

Then the most-violated entry of all, which gets an entire section named "EM-DASH BAN (the single most-violated Tell)":

```
**Em-dash (`—`) is COMPLETELY banned.** It is the LLM's signature stylistic crutch and it is the #1 visual Tell in production tests. There is no "limited use" allowance, no "natural language frequency" allowance, no "in body copy is fine" allowance. None.
```

*Source: ~/.claude/skills/design-taste-frontend/SKILL.md §9.G, taken 2026-09-08.*

What these entries share: each one is checkable in seconds, by eye or by a grep. Count the cards in a row; look at whether dashboard numbers are suspiciously perfect; ask whether the hero holds a real product or a fake dashboard assembled from styled divs; count em-dash characters. That is the skill's own design choice: aesthetics do not stay as a feeling of "something is off but I can't say what" — they get translated into named signals, so an agent can re-run the same check without depending on a tasteful human sitting nearby.

Read the scope correctly, too: these are tells of the built page. The principle quoted above states the exception explicitly — if the user's brief genuinely calls for one (a deliberately brutalist page, say), the entries may be waived.

## Pre-flight: 62 checkboxes at the last gate

At the end of the file, after 15 numbered sections (0 through 14) spanning more than 1,200 lines (wc -l and section count on the source file, taken 2026-09-08), comes Section 14: "FINAL PRE-FLIGHT CHECK" — a matrix of 62 checkboxes (counting the `- [ ]` lines in the section, taken 2026-09-08) to run before handing over code. Two lines frame the section's severity:

```
**THIS IS NOT OPTIONAL. Run every box. If any box fails, the output is not done.**
```

*Source: ~/.claude/skills/design-taste-frontend/SKILL.md §14 (opening), taken 2026-09-08.*

```
If a single checkbox cannot be honestly ticked, the page is not done. Fix it before delivering.
```

*Source: ~/.claude/skills/design-taste-frontend/SKILL.md §14 (section close), taken 2026-09-08.*

Three sample boxes show how mechanical the checks are:

```
- [ ] **ZERO em-dashes (`—`) anywhere on the page.** Headlines, eyebrows, pills, body, quotes, attribution, captions, buttons, alt text. Zero. (Section 9.G - non-negotiable.)
- [ ] **EYEBROW COUNT (mechanical)**: count instances of `uppercase tracking` micro-labels above section headlines across all components. Count ≤ ceil(sectionCount / 3)? Hero counts as 1.
- [ ] **No Duplicate CTA Intent**: no two CTAs with the same intent ("Get in touch" + "Let's talk" both on page = Fail)?
```

*Source: ~/.claude/skills/design-taste-frontend/SKILL.md §14, taken 2026-09-08.*

Read those three boxes and the nature of the pre-flight becomes obvious: most of it is counting or comparing. Count micro-labels against the number of sections; compare CTA text against its background at WCAG AA 4.5:1 contrast; check whether a button label wraps to two lines at desktop. The skill turns the checkable part of aesthetics into 62 checks an agent can re-run, with results that are not up for debate. The part that cannot be counted, the skill does not pretend to count: the section's closing line pushes responsibility onto honesty — whether a box can be ticked is something the runner must genuinely ask of every line, and one dishonest tick means the whole page counts as unfinished.

That is also the right way to read the phrase "machine-checkable is not the same as having taste": the skill does not replace the human eye. It moves the arguable part down into numbers that can be re-run, and leaves the human eye with the real decision.

The Wakii design kit holds six skills covering the whole UI lifecycle (at the time of writing, 2026-09-08), and this post opened one book on the shelf. The [skills catalog tour](/blog/skills-catalog-tour/) walks the full catalog; the step that happens before the audit — asking about intent before building — is told in [skill /brainstorm](/blog/skill-brainstorm/). For how the agent team loads these skills, the [agents and kit](/docs/agents-and-kit/) docs page covers the team.

Every public skill in the kit is a SKILL.md file that installs into `~/.claude/` on your machine — readable in full, including the 1,200-line file quoted throughout this post. Download Wakii, let the agent finish building your page, then read the skill's scrutiny rules before you press ship.
