---
title: Orca CLI
description: Script every workflow — worktrees, terminals, browser, snapshots — the full Orca surface as composable commands.
order: 17
---

The **`orca` CLI** scripts the entire app: create worktrees, run terminals,
drive the embedded browser, take snapshots, and send prompts — every
workflow you click, as a composable command.

## How agents use it

The Orca CLI is how **agents drive the app back**. An agent with shell
access can:

```bash
# create a worktree and run in it
orca worktree create --name fix-api --agent claude \
  --prompt "Fix the API timeout"

# drive the embedded browser
orca snapshot            # accessibility tree of the active page
orca click --ref btn-save
orca fill --ref input-email "test@example.com"

# notify the human
orca notify --title "Agent done" --body "PR ready for review"
```

Your agents don't just run in the app — they **operate it**, turning the
IDE itself into their tool surface.

## Common commands

| Command | What it does |
| ------- | ------------ |
| `orca worktree create` | New isolated worktree + agent |
| `orca snapshot` | Accessibility tree of the active browser page |
| `orca click` / `orca fill` | Browser interaction by element ref |
| `orca terminal list` / `send` | Watch and drive terminals |
| `orca notify` | Desktop notification |
| `orca tab create` / `close` | Embedded browser tabs |

## Scripting patterns

- **Fan out**: loop `worktree create` across N agents, then diff the
  worktrees.
- **Verify**: `snapshot` → assert the expected UI state → `notify` with
  the result.
- **Hand off**: agent A creates the worktree; agent B (a different CLI)
  works in it; agent C reviews.

## Tips

- Every command supports `--json` for scriptable output.
- `orca --help` lists everything; each subcommand has its own `--help`.
- The CLI talks to the running app — start Wakii first.
