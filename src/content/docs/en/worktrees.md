---
title: Parallel worktrees
description: Fan one prompt across five agents — each in its own isolated git worktree — then compare and merge the winner.
order: 10
---

Every agent in Wakii works in its own **isolated git worktree**. You give
the same prompt to five agents; each one clones the repo into a private
worktree, edits there, and never touches your working files. When they
finish, you compare the diffs and merge the one you like.

## Why isolated worktrees matter

Agents that edit in place fight over the same files. One agent's half-done
refactor breaks another agent's test run. Isolated worktrees make every
agent's work **independently revertible** — discard one attempt without
touching the rest.

## Creating a worktree

From the Worktrees panel:

1. Click **New worktree**.
2. Pick the agent (Codex, Claude Code, OpenCode, Pi, or any CLI binary).
3. Paste the prompt — or record it as a reusable template.

Or from the CLI:

```bash
orca worktree create --name fix-api-timeout --agent claude \
  --prompt "Fix the API timeout in the payment service"
```

## Comparing results

Each worktree shows the agent's diff, its terminal, and a browser preview.
Open two side by side, diff them, and merge the winner into your branch.

## Tips

- **One task per worktree** — mixing concerns makes diffs hard to read.
- **Name by outcome** — `fix-api-timeout` beats `agent-2`.
- **Discard freely** — a worktree is disposable; the merge is the only
  thing that matters.
