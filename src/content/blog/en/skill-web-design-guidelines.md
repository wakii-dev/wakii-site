---
title: "Skill /web-design-guidelines: the web rulebook at hand"
description: "Review UI code against 105 concrete rules — focus, aria, forms, animation: the failures a screenshot can't show. Rules vendored from an MIT upstream, runs offline, output is a file:line list."
pubDate: "2026-09-13"
category: "tech"
tags: ["skills", "design"]
draft: false
---

A UI page can look perfect in a screenshot and still be wrong in ways no camera captures. Focus ring deleted with `outline: none`? Screenshots can't see it — a screenshot contains no focus. An icon button missing its `aria-label`? The image looks exactly the same. A decorative animation that keeps running for users who set `prefers-reduced-motion` in their OS? A screenshot is a still frame. `/web-design-guidelines`, a skill in the design group of the Wakii kit, was built for exactly that class of failure: it reviews UI code against a list of concrete rules, each one checkable in code, no taste required.

TL;DR:

- The skill reviews UI code against 105 concrete rules (the count the kit states in its SKILL.md): accessibility, focus, forms, animation, keyboard, typography, performance.
- The rules are vendored intact from the open-source vercel-labs/web-interface-guidelines project (MIT) into the skill's `resources/` folder — it runs offline, no network dependency.
- Every rule is one line, checkable directly on code; output is normalized to a `file:line` list that jumps to the spot in your editor, not a paragraph of impressions.
- In the story workflow it is one layer of the UX review (P8.6): it runs alongside the standard captures and comparison images — it "catches the errors images can't see".

## What a screenshot can't show: focus, aria, reduced motion

The reflex is to review UI by looking at pictures. Images answer layout questions well: are the cards even, does the spacing breathe, is the color on brief. But the most expensive class of web UI bugs lives outside the frame. Focus rings only appear when a keyboard is in play; screen readers read labels from aria attributes, not from pixels; whether a page's animation respects a user's reduced-motion setting is decided in code, not in rendering. Compare two screenshots as carefully as you like — that layer stays invisible, because the image contains no keyboard, no screen reader, no OS setting.

The skill defines its own role right there, in its "when to run" section:

```
- **F7 visual review** (code-reviewer): sau khi so ảnh 2 bên, chạy rules
  này trên code của screens — bắt lỗi ảnh không thấy (aria, focus, forms,
  keyboard, reduced-motion).
```

*Nguồn: ~/.claude/skills/web-design-guidelines/SKILL.md, lấy 2026-09-08.*

Read that line from the end: aria, focus, forms, keyboard, reduced-motion — five things that live in code, not in pixels. And "sau khi so ảnh 2 bên" — after comparing the two sides — is a deliberate clause: the rules don't replace looking; they come after looking and cover what looking cannot reach.

## Where the rules come from: vendored from upstream, runs offline

The skill didn't invent its rules. The whole rulebook is vendored intact from Vercel's open-source project vercel-labs/web-interface-guidelines — MIT licensed, with the upstream license file sitting right in the folder:

```
~/.claude/skills/web-design-guidelines/
├── SKILL.md                        # the contract: when to run, how to run
└── resources/
    ├── LICENSE-upstream            # MIT, © 2025 Vercel Labs
    └── web-interface-guidelines.md # the vendored rules — the file the agent reads when reviewing
```

*Nguồn: ls ~/.claude/skills/web-design-guidelines/, lấy 2026-09-08.*

Provenance is written into the skill file itself, along with the date it was vendored:

```
- Upstream: github.com/vercel-labs/web-interface-guidelines (MIT, © 2025
  Vercel Labs) — vendored nguyên vẹn tại `resources/` kèm LICENSE-upstream.
- Vendored vào story-team-kit 2026-08-28 làm engine cho P8 F7/F8.
```

*Nguồn: ~/.claude/skills/web-design-guidelines/SKILL.md §Provenance, lấy 2026-09-08.*

The point of vendoring is that review works without a network. The SKILL.md states that condition explicitly, on the step where the agent reads the rules: "vendored — luôn sẵn, không phụ thuộc mạng" (always available, no network dependency; the SSL-filter lesson: no mandatory fetch). Upstream keeps moving on Vercel's side; the local copy captures one exact state, so a review today and a review three months from now read the same rules. Updating is a deliberate act: diff against upstream and note the change date in a NOTICE file — not a silent network request happening mid-review.

The number: two files in the kit both call this rulebook 105. The skill's frontmatter declares "105 concrete Web Interface Guidelines rules"; the workflow calls it "105 rules cụ thể trên CODE". The whole set is organized into 17 topic groups, countable with one command:

```bash
$ grep -c '^### ' ~/.claude/skills/web-design-guidelines/resources/web-interface-guidelines.md
17
```

*Nguồn: grep trên resources/web-interface-guidelines.md, lấy 2026-09-08.*

The seventeen groups run from Accessibility, Focus States, Forms, Animation, Typography, Performance, Navigation & State, Dark Mode & Theming, all the way to one group named for exactly what it is: Anti-patterns — the signatures you flag on sight.

## Reading a rule: one line, checkable on the spot

The common trait across the whole set: rules are written like check instructions, not aesthetic principles. Five representative rules, quoted verbatim:

```
- Icon-only buttons need `aria-label`
- Interactive elements need visible focus: `focus-visible:ring-*` or equivalent
- Honor `prefers-reduced-motion` (provide reduced variant or disable)
- Use correct `type` (`email`, `tel`, `url`, `number`) and `inputmode`
- Destructive actions need confirmation modal or undo window—never immediate
```

*Nguồn: ~/.claude/skills/web-design-guidelines/resources/web-interface-guidelines.md (§Accessibility, §Focus States, §Animation, §Forms, §Navigation & State), lấy 2026-09-08.*

Each line reduces to a concrete check on code: does the icon button have an `aria-label`; is the visible focus ring implemented through `focus-visible`; does the animation have a reduced variant or get disabled; does the email input use `type="email"` with the right `inputmode` for phone keyboards; does the delete action have a confirmation modal or an undo window, or does one tap destroy the data. That style is a deliberate upstream choice — the whole file is optimized for checking line by line "against rules below", as the file's own opening line says.

The output format is standardized inside the rules file too, as clickable `file:line` findings:

```text
## src/Button.tsx

src/Button.tsx:42 - icon button missing aria-label
src/Button.tsx:18 - input lacks label
src/Button.tsx:55 - animation missing prefers-reduced-motion
src/Button.tsx:67 - transition: all → list properties

…

## src/Card.tsx

✓ pass
```

*Nguồn: ~/.claude/skills/web-design-guidelines/resources/web-interface-guidelines.md §Output Format, lấy 2026-09-08.*

One finding, one line, terse enough to "sacrifice grammar for brevity" — the file's own instruction. The agent then triages: P1 for a11y blockers, missing focus, wrong form types; P2 for nice-to-haves. What you get is a task list with coordinates, not a paragraph of commentary you have to translate into work.

## The review slot: runs alongside screenshots, not instead of them

In the kit's story workflow, this skill has a named seat. The UX review — step 6 of Principle 8, running after implementation as a task in the plan — has three layers, and web-design-guidelines takes the code-checking one:

```
  · `web-design-guidelines` — 105 rules cụ thể trên CODE (a11y/focus/
    forms/animation/keyboard) — bắt lỗi ảnh không thấy được
```

*Nguồn: ~/.claude/skills/orca-superpowers-workflow/SKILL.md (F8. UX review), lấy 2026-09-08.*

That phrase — catching the errors images can't see — is a job description, not a slogan. And the two most important words in the skill live in its opening line: "Dùng cùng (không thay thế) capture chuẩn + ảnh đối chiếu" — use alongside, not instead of, standard captures and comparison images.

```
Đây là lớp HEURISTICS cụ thể cho review UI: mỗi rule kiểm được bằng code,
không cần cảm nhận. Dùng cùng (không thay thế) capture chuẩn + ảnh đối chiếu.
```

*Nguồn: ~/.claude/skills/web-design-guidelines/SKILL.md (opening line), lấy 2026-09-08.*

Alongside, not instead — that is the division of labor inside one review round. A rule can't tell whether the layout is balanced or the color matches the brief; the comparison image answers that. Conversely, an image can't tell that an icon button lost its label. The context-reading aesthetic layer belongs to the sibling skills in the same slot: gpt-taste and design-taste-frontend handle aesthetics and anti-slop — design-taste-frontend reads the brief, infers intent, and only then judges; frontend-design owns purpose when building from scratch. Three layers, three different questions: does it look right, does it escape the machine-generated look, is the code wrong — and this skill holds the third question.

Three things a review skill should have: a readable source, offline operation, and results you can re-check. web-design-guidelines has all three — the rules are a local file, the origin is written in Provenance, and every finding carries a `file:line`. The map of the full catalog is in the [skills catalog tour](/blog/skills-catalog-tour/); the context-aware aesthetic layer is told in [skill /design-taste-frontend](/blog/skill-design-taste-frontend/). For how the agent team loads these skills and when, the [agents and kit](/docs/agents-and-kit/) docs page covers the team.

The kit installs itself into `~/.claude/` on your machine — both the SKILL.md and the vendored rules file are readable in full there. Download Wakii, let the agents build your UI, then read the rulebook before you ship: those are the failures a screenshot can't show, and now a dedicated review layer checks for them.
