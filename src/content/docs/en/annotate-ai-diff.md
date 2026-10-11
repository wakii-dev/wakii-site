---
title: Annotate AI diffs
description: Drop comments on any diff line and ship them straight back to the agent — review, edit, and commit without leaving the app.
order: 15
---

Review AI-generated code the way you review a colleague's PR: **drop
comments on any diff line** and ship them back to the agent that wrote it.
No copy-pasting feedback into a new prompt — the comments ride along with
the diff context.

## How it works

1. Open the agent's **diff view** (files changed since the worktree started).
2. Hover a line, click the **+** gutter button, and type your comment.
3. Send the review — the agent receives your comments **plus the diff
   context** and edits accordingly.
4. The updated diff comes back annotated; repeat until it's merge-ready.

## Why comments beat new prompts

A standalone prompt makes the agent re-discover the change. Comments on
the diff arrive with exact line numbers, file paths, and the surrounding
code — the agent edits the right lines on the first try.

## Tips

- Mark comments as **blocking** or **nit** — blocking comments must be
  addressed before the agent reports done.
- Combine with **Design mode**: click the UI element first, then comment on
  the diff that appears.
- The review thread stays attached to the diff — revisit it after the fix.
