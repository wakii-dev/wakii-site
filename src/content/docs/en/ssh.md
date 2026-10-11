---
title: SSH worktrees
description: Run agents on a beefy remote box with full file editing, git, and terminals — auto-reconnect and port forwarding included.
order: 14
---

Run your agents on a **remote machine over SSH** — full file editing, git,
terminals, and port forwarding, with automatic reconnection when the link
drops. The local app stays your single window into everything.

## When to use a remote

- Your laptop is throttling; a desktop build box isn't.
- The target environment (docker, databases, GPU) lives on the remote.
- You want builds to continue when you close the lid.

## Setting up a remote

1. Open **Settings → Remotes** and add the SSH host (key auth
   recommended).
2. Wakii verifies connectivity and lists available project paths.
3. Pick a path — worktrees, agents, and terminals now run remotely.

## What works remotely

- **Full file editing** — the same editor, backed by remote files
- **Git operations** — commits, branches, diffs against the remote repo
- **Terminals** — real PTYs on the remote host
- **Port forwarding** — remote dev servers, forwarded and reachable from
  the embedded browser

## Reconnection

If the SSH link drops, Wakii retries automatically and reattaches your
sessions. Terminal scrollback and agent state survive the disconnect.

## Tips

- Use **key auth with an agent** (`ssh-add`) — password prompts stall
  agents.
- Keep remotes on the same git remote as local so worktrees can be handed
  between machines.
