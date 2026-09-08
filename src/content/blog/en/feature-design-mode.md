---
title: "Design Mode: point at the UI, hand the agent the context"
description: "Flip the Design Mode toggle in Wakii's browser, click the broken UI element, and its DOM, computed CSS, screenshot — even the source file/line when a source map exists — land in the agent chat as one attachment."
pubDate: "2026-09-16"
category: "tech"
tags: ["features", "design"]
draft: false
---

You can see the misaligned button. The agent can read code. Between the two of
you sits a gap: you describe it in words — "that button is a bit off" — and the
agent has to guess which element, off in which direction, because of a margin or
a flex container. Every translation from pixels to prose loses information, and
the agent pays for the loss in guesses. Design Mode in Wakii's browser exists to
shrink exactly that gap: point at the UI, and the agent receives the context on
the spot.

TL;DR:

- The problem: describing a UI in words is a lossy channel — which element, how
  broken, why — and the agent starts from guesses.
- Design Mode turns the browser into a pointer-to-code tool: click one element
  and it drops into the agent chat with its DOM, computed styles, and a
  screenshot.
- Turning it on is one toggle in the browser toolbar — the cursor becomes a
  picker, and hovering highlights the element underneath.
- The limits, stated plainly: the source file/line only appears when a dev-mode
  source map is available, and this is a context-capture tool, not a visual
  editor.
- The loop closes back on the UI: the agent edits the source, Orca hot-reloads,
  and you click again to verify.

## What does the agent actually hear?

The problem sits in the channel, not in either party. Your eyes receive pixels;
the agent receives code. The bridge between them is usually one sentence of
prose — and prose is a lossy format:

```ascii
the verbal channel — every arrow loses information

  your eyes             your words                the agent
  sees the Submit ───►  "that button is ───►   which of the 14 buttons
  button sits a bit     a bit off, can you     on this page?
  too low               fix it?"               how many pixels off?
                                               margin, or the parent flex?
```

*Source: conceptual diagram illustrating the situation Design Mode in Wakii's
browser exists to fix, retrieved 2026-09-08.*

On a real page, "that button" could be one of a dozen; "a bit off" could mean
4px or 40px; the cause could live in the element itself or in its parent. The
agent has no data to tell these apart — so it asks again, or worse, guesses and
edits the wrong thing. The cost is not the question itself; it is the loop: each
round trip stalls the session while you re-translate what you see into a
language the agent can read.

## One click, context lands in the chat

Design Mode removes the translation step. The feature's own docs define it,
quoted verbatim:

> "Design Mode turns the Orca browser into a pointer-to-code tool. Toggle it
> on, click any UI element on the rendered page, and the element drops into the
> agent chat as rich context — with its DOM, computed styles, and a screenshot."

What actually travels inside that "rich context"? The docs list four items:

```bash
Click an element. Orca captures:

- The element's HTML (outer and a small neighborhood).
- Its computed CSS — colors, fonts, spacing.
- A cropped screenshot of the element.
- The source file/line if a dev-mode source map is available.
```

*Source: docs/site/content/docs/browser/design-mode.mdx, section "Drop into
chat", quoted verbatim, retrieved 2026-09-08.*

Read in order, the list is a path from pixel to source: the outer HTML plus a
small neighborhood tells the agent what the element is and what sits next to it;
the computed CSS — colors, fonts, spacing — holds post-cascade values, what is
actually rendered rather than what happens to be written in a file; the cropped
screenshot shows the agent what you are seeing; and the last item, the source
location, is the conditional one, covered in a moment. All of it ships into the
agent terminal as one attachment, and you just type what you want changed.

```ascii
one click → one attachment in the agent chat

  rendered page                        agent chat
  ┌───────────────────┐
  │  [ Submit ] ◄─click     ┌────────────────────────────────┐
  └───────────────────┘     │ attachment:                    │
        │                   │  • HTML (outer + neighborhood) │
        ▼                   │  • computed CSS: colors,       │
     capture                │    fonts, spacing              │
        │                   │  • screenshot (cropped)        │
        └──────────────────►│  • file:line — if a dev-mode   │
                            │    source map is available     │
                            └────────────────────────────────┘
```

*Source: built from the capture list in
docs/site/content/docs/browser/design-mode.mdx, retrieved 2026-09-08.*

## One toggle to turn it on

There is no configuration command to memorize. The docs, quoted verbatim:
"Click the **Design Mode** toggle in the browser toolbar. Your cursor becomes a
picker; hovering highlights the element under it." This is a selection mode, not
a drawing mode: you are still looking at the real page — each element has simply
become something you can pick up and drop into the chat.

```ascii
toolbar:  [ Design Mode ○ ] ──click──►  [ Design Mode ● ]
cursor:   default         ──────────►  picker
hover:                    ──────────►  element under the cursor highlights
click:                    ──────────►  element context → agent chat
```

*Source: built from docs/site/content/docs/browser/design-mode.mdx, sections
"Turn it on" and "Drop into chat", retrieved 2026-09-08.*

## The limits, stated plainly

Two limits deserve a read before you rely on the feature — both sit in the docs
themselves, so neither is a matter of interpretation.

One: the source location is conditional. The fourth bullet in the capture list
reads, verbatim, "The source file/line if a dev-mode source map is available" —
only when a dev-mode source map exists. Without one, you still get the DOM, the
computed CSS, and the screenshot — enough for the agent to understand how the
element renders — but no file:line coordinates to jump straight into the source.
Two: this is pointer-to-code, not a visual editor. You do not drag and drop to
reshape the UI inside the browser; you capture one element's context and
describe the change in words — the edit happens in the source, made by the
agent. The stretch between context and change is still one chat turn; that turn
just now carries complete data.

```ascii
what arrives with one click — and what is conditional

  HTML (outer + neighborhood)  ──►  in the capture list
  computed CSS
  (colors, fonts, spacing)     ──►  in the capture list
  cropped screenshot           ──►  in the capture list
  source file/line             ──►  only if a dev-mode source map exists
```

*Source: read directly from the four bullets in
docs/site/content/docs/browser/design-mode.mdx, section "Drop into chat",
retrieved 2026-09-08.*

Worth noting is where the loop closes: back on the UI. The docs write: "The
agent edits the source, Orca hot-reloads, you click again to verify." The person
who saw the problem stays the one who verifies by eye — this time with a Design
Mode click instead of a sentence of description.

## The trail in the product

This feature is not an idea on paper — it leaves a verifiable trail in the
open-source repo:

```bash
$ grep -n "Design Mode" src/shared/feature-wall-tiles.ts
108:    title: 'Embedded browser + Design Mode',

$ git show 216cabb9f0 --stat
update readme to include new browser design mode feature (#463)
 README.md            |  35 +++++++++++++++++++++++------------
 orca-design-mode.gif | Bin 0 -> 2052927 bytes
 2 files changed, 23 insertions(+), 12 deletions(-)
```

*Source: `grep` on src/shared/feature-wall-tiles.ts and `git show` on the
open-source repo, retrieved 2026-09-08.*

Read the two blocks: the grep line is the "Embedded browser + Design Mode" tile
on the feature wall — exactly where a new user meets the feature for the first
time; the git show block is commit #463, which brought Design Mode into the
README along with a demo GIF. The feature's own docs page — the source of all
four quotes in this post — lives at
docs/site/content/docs/browser/design-mode.mdx.

The cycle above — see with your eyes, point with the picker, fix in the source,
verify with your eyes — is one shape of a larger story: moving work from
"screenshot it and describe it" to "point at it, and the agent follows". The
post on [convergence QA: the last tier](/blog/convergence-qa-last-tier/) covers
the far end of that pipeline — where parallel branches get checked before they
merge; this post covers the entry point — where one element on screen becomes
actionable context. How Wakii organizes the whole agent lifecycle — from a
one-line idea to shipped product — lives on the [FAQ](/docs/faq/) page.

To see it yourself: open the browser in Wakii, flip the Design Mode toggle in
the toolbar, and click the exact button you were about to describe in words —
then read what the agent receives, next to the sentence "it looks off".
