---
title: File explorer & drag to agents
description: VS Code-class editor with autosave everywhere — drag files or images straight into an agent prompt.
order: 16
---

Wakii's file explorer and editor are **VS Code-class**: tree with git
status, tabs, autosave, multi-cursor — everywhere, including remote and
worktree files. And the killer feature: **drag files or images straight
into an agent's prompt**.

## The editor

- Tree explorer with git status coloring and folder actions
- Tabs, split editors, autosave, format-on-save
- Multi-cursor, command palette, and the keybindings you already know
- Works on worktree files and remote (SSH) files alike

## Drag to agents

1. Grab a file, an image, or a selection from the explorer.
2. Drag it over an agent's prompt.
3. The agent receives the file path (or the image inline) with your
   message.

Images are pasted inline — agents that accept vision (Claude, GPT-4o)
see the screenshot. Files are referenced by path so the agent can read
and edit them with its tools.

## Tips

- Drag **multiple files** at once — the agent gets the full list.
- Drag from **outside Wakii** — Finder, Explorer, a browser — anything
  droppable becomes agent input.
- Combine with **Design mode**: screenshot the UI, drag the image into a
  fresh prompt, and ask for the same layout in a new theme.
