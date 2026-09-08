---
title: "AI diff annotation: reviews that carry their reasons"
description: "Pin review notes to the diff line and ship them straight back to the running agent. This post dissects what shipped in v1.4.199 — the note composer, the card pinned into the diff, GitHub comments re-attached on the PR page — straight from the code."
pubDate: "2026-09-17"
category: "tech"
tags: ["features", "qa"]
draft: false
---

An agent finishes its edits, a human opens the diff and leaves a few comments
— and the cycle repeats out of habit: the comments stay in the browser, the
agent moves on without reading them. The reason behind each change — why this
line had to change, which criterion failed — sits exactly where the agent
cannot see it. Wakii aims straight at that break point: a review note is
pinned to the diff line itself, composed against the placeholder
"Add note for the AI", then sent back to the running agent session. This post
reads that mechanism straight from the code, now that it has shipped in
v1.4.199.

TL;DR:

- A review note is not a separate tab — it is data attached to a file and a
  line: composed in a popover, displayed by a card pinned inside a Monaco view
  zone, right under the annotated line.
- The "This note" button formats a note into a prompt and sends it to the
  agent session; a note already sent is excluded from the next send
  ("Note already sent").
- On the PR page, GitHub review comments are pinned back onto the current
  lines of the code; outdated threads are dropped from the inline row so a
  comment cannot attach to the wrong line.
- Limits stated plainly: this is a mechanism for carrying reasons back to the
  agent — the card does not edit code by itself and calls no model.

## Comments live outside the agent's head

The default review loop has a structural gap, not a diligence problem. The
diff lives inside the agent's tooling; the comments live in a browser. The two
halves do not meet: the agent picks up the next fix without carrying the reason
for the previous one, and the reviewer re-types context into every fresh
prompt:

```ascii
the leaky review loop — the reason sits where the agent cannot read

  agent edits code → diff opens → human reviews
                                      │ comment lands in a browser / GitHub
                                      ▼
  agent moves on  ◄── new prompt carries no comment
                       → the fix arrives, the reason does not
```

*Source: conceptual diagram of the gap the feature-wall tile-08 caption names
("ship them back to the agent"), retrieved 2026-09-08.*

The cost does not stop at inconvenience. A review comment without context
forces the agent to guess intent, and every guess is another diff that needs
reviewing again. To cut that loop, the reason has to live in the same place as
the code — which is what the next two sections show in real code.

## Pinning a note to the diff line

Composing and displaying are two components in one directory,
`src/renderer/src/components/diff-comments/`. The composer is
`DiffCommentPopover`: a DOM overlay beside the editor (the author states the
intent in the file's first comment — to own a React auto-resizing textarea
instead of a Monaco-internal widget). The placeholder and button label are
prop defaults, not marketing copy:

```bash
# src/renderer/src/components/diff-comments/DiffCommentPopover.tsx, prop defaults
  placeholder = 'Add note for the AI',
  submitLabel = 'Add note',
```

*Source: src/renderer/src/components/diff-comments/DiffCommentPopover.tsx,
lines 42-43, tag v1.4.199, retrieved 2026-09-08.*

The popover title is computed from the selected line: "Line 42", or
"Lines 40-42" when a range is selected (`startLine` differs from
`lineNumber`). Enter submits, Shift+Enter inserts a newline, Escape cancels;
an outside click only closes the popover when the draft is empty — a draft
with text keeps it open. The display side is `DiffCommentCard`, and its
position is the core of the mechanism: the card does not open in a side panel
— it sits inside a Monaco view zone, at the exact annotated line:

```bash
# src/renderer/src/components/diff-comments/DiffCommentCard.tsx, first comment
// Why: the saved-note card lives inside a Monaco view zone's DOM node.
// useDiffCommentDecorator creates a React root per zone and renders this
// component into it so we can use normal lucide icons and JSX ...
```

*Source: src/renderer/src/components/diff-comments/DiffCommentCard.tsx, lines
8-11, tag v1.4.199, retrieved 2026-09-08.*

On the card, a quote block shows the code the note is attached to — context is
visible without scrolling up. The meta line joins the author (defaulting to
"Note"), the line label, and a "sent" marker once the note has been sent. The
card also keeps the zone height in sync through a ResizeObserver so it cannot
overlap the lines below when text wraps in a narrow pane. One naming detail
worth noticing: user-facing copy says "Note" rather than "Comment" — the
author's stated reason is to avoid confusion with GitHub PR review comments,
which some diff surfaces also render.

## On the PR page, GitHub comments pin to current lines

The other half of the mechanism lives on the PR page. The
`buildInlineReviewComments` function in
`src/renderer/src/components/pull-request-page/files/inline-comments.ts` takes
a PR's GitHub comments and returns `DecoratedDiffComment` — the data shape the
card understands: `filePath` from `comment.path`, the pinned line from
`comment.line`, `side: 'modified'`. Three kinds of comments are dropped from
the inline row, and the reason sits in the code as a comment:

```bash
# src/renderer/src/components/pull-request-page/files/inline-comments.ts
// Why: outdated threads keep originalLine for the sidebar, but rendering it
// inline can attach the comment to unrelated current code.
if (comment.isOutdated || !comment.path || typeof comment.line !== 'number') {
  return []
}
```

*Source: src/renderer/src/components/pull-request-page/files/inline-comments.ts,
tag v1.4.199, retrieved 2026-09-08.*

Read that `Why` line closely: outdated threads keep their original line number
for the sidebar, but rendered inline the comment could attach to current code
it has nothing to do with. That is the right review call: a comment pinned to
the wrong line is worse than a hidden one — the reader would trust a false
context. These GitHub comments are also read-only inside the app: they are
built with `canDelete: false` and `canEdit: false`, and the card only renders
Edit/Delete buttons when a callback exists — no callback, no button; editing
happens on GitHub through the "Open" button.

## Tile-08 and the loop that closes back to the agent

The app's feature-wall registry records the design intent as one tile:

```bash
$ grep -n "Inline review" src/shared/feature-wall-tiles.ts
144:    title: 'Inline review, back to the agent',
```

*Source: src/shared/feature-wall-tiles.ts, tile-08 (kind "media", owner
"diff-review"), caption verbatim: "Drop markdown comments on any diff line,
batch them, ship them back to the agent. Inspect CI, resolve conflicts, open
PRs - all in-app.", retrieved 2026-09-08.*

"Back to the agent" is not a slogan — it has a real button. In
`diff-comment-zone-card.tsx`, the card's action row receives `headerActions`
as a `NotesSendMenu` when the note is a local one (its author is undefined),
scoped "This note": the note is formatted into a prompt and sent to the
agent session of the running worktree. A note carrying `sentAt` is excluded
from the next send — the status tooltip reads "Note already sent" — and after
a successful delivery, `clearDeliveredDiffComments` clears the delivered note
from the diff:

```ascii
the review loop closing back to the agent

  agent edits code
       │ new diff
       ▼
  note pinned to the diff line ◄── human composes "Add note for the AI"
       │ "This note" button → prompt
       ▼
  agent session receives the prompt → fixes per the reason → new diff + notes
```

*Source: built from
src/renderer/src/components/diff-comments/diff-comment-zone-card.tsx
(NotesSendMenu, formatCommentPrompt, clearDeliveredDiffComments), retrieved
2026-09-08.*

The difference from the leaky loop at the top of this post comes down to one
thing: the reason is no longer re-typed into a fresh prompt — it travels with
the diff, as a note pinned to the line, and the agent receives exactly that
text.

## Where the loop stops

- No model appears in these files, and this post names none: the card does not
  edit code by itself, does not generate patches. It carries the reason back
  to the agent; the fixing stays the agent's job, and the verdict stays with
  the independent reviewer — [gates, not trust — and Rule 0](/blog/gates-not-trust-rule-zero/)
  covers why a green checkmark is not a substitute for opening the result.
- On the PR page, GitHub comments are read-only in the app: no Edit, no
  Delete, only an "Open" button leading back to GitHub.
- Outdated threads do not render inline — they stay in the sidebar; the inline
  row only carries comments that pin onto current code.
- This post's scope is the component layer it read: the card, the popover, the
  inline-comment builder on the PR page, and the tile registry. Send state
  lives in the `diffComments` store slice — the post does not go deeper:

```bash
$ grep -n "export type DiffCommentDeliverySnapshot" src/renderer/src/store/slices/diffComments.ts
32: export type DiffCommentDeliverySnapshot = Pick<
```

*Source: src/renderer/src/store/slices/diffComments.ts, tag v1.4.199, retrieved
2026-09-08.*

Questions about review loops, gates and other qa mechanisms are collected on
the [FAQ](/docs/faq/) page.

To see the loop yourself: open a diff in Wakii, click a line, type a note for
the AI, press "This note" — and read the agent receiving your reason in the
running session.
