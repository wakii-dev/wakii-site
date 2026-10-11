---
title: Design mode
description: Click any UI element in a real Chromium window to send its HTML, CSS, and a cropped screenshot straight into your agent's prompt.
order: 12
---

**Design mode** opens a real Chromium window inside Wakii. Click any element
on the page and Wakii captures its HTML, computed CSS, and a cropped
screenshot — then drops all three into the agent's prompt with your comment
attached.

## Why it beats screenshots

A screenshot shows what the page looks like. Design mode gives the agent
**what the page is made of** — exact class names, computed styles, and the
DOM structure — so it edits the right component instead of guessing.

## Using design mode

1. Open the **Browser** pane and navigate to your app.
2. Toggle **Design mode** (wand icon or `Ctrl+Shift+D`).
3. Click the element you want changed — it highlights.
4. Type what you want done: *"make this card use the dark theme tokens"*.
5. Send — the agent receives the element's HTML, CSS, screenshot, and your
   instruction.

## Tips

- Combine with **Annotate AI diffs** — click in design mode, then comment
  on the resulting diff.
- Works against `localhost` dev servers and deployed URLs alike.
- The agent sees the same page you do — no more "it works on my machine".
