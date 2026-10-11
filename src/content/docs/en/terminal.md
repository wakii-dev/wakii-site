---
title: Terminal splits
description: Ghostty-class terminals with WebGL rendering, infinite splits, and scrollback that survives restarts.
order: 11
---

Wakii ships **Ghostty-class terminals** — GPU-accelerated rendering, zero-lag
keystrokes, and splits that go as deep as your layout needs. Every agent runs
in a real terminal you can watch, scroll, and take over.

## Highlights

- **WebGL rendering** — smooth output even under heavy build logs
- **Infinite splits** — horizontal, vertical, and tabbed panes
- **Scrollback that survives restarts** — close the app, come back, your
  buffer is still there
- **Shell integration** — command titles, exit codes, and cwd tracking

## Working with splits

1. Focus a terminal and press the split shortcut (or right-click → Split).
2. Drag pane borders to resize; double-click to maximize.
3. Terminals can be attached to a worktree, so the pane sits next to the
   agent editing that code.

## Agent terminals

Every agent gets its own terminal pane next to its diff view. Watch the
agent run builds, take over interactively when it asks for input, or jump
in and type yourself — the agent sees your keystrokes.

## Tips

- Pin a build terminal at the bottom — it survives across worktree switches.
- Use **Shift+Click** to select and copy without keyboard.
- Scrollback search: `Ctrl+Shift+F` (macOS `Cmd+Shift+F`).
