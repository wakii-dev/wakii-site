---
title: "Diagnosing Wakii failures: three layers, six situations"
description: "A diagnosis order from orca status through the terminal to logs, then the six failures you meet most: agents not starting, worktree creation failing, a missing CLI, dead SSH terminals, browser no tab, and GitHub rate limits."
pubDate: "2026-09-24"
category: "tutorial"
tags: ["guide", "wakii"]
draft: false
---

The agent says "done" but the change is nowhere. A terminal won't open on
the remote machine. Typing `orca` into a shell returns "command not found".
In moments like these the question is not "how do I fix it" but "which layer
is broken" — because the app, the agent CLIs, and git are three different
layers, and each fails in its own way. This post gives you a diagnosis
order, then walks the six situations you will meet most, with the command
that fixes each.

TL;DR:

- Diagnose in three layers: `orca status` for the overview, manual commands
  in a terminal to separate app trouble from CLI trouble, logs last.
- Agent won't start or `command not found`: run the CLI by hand first, then
  check the PATH the app sees and the registered shim; a dead SSH terminal
  on Linux means a missing toolchain — and a reconnect after installing.
- Worktree creation fails: usually a missing `git fetch origin` or a
  branch/folder that already has a worktree.
- Browser reports `browser_no_tab`: one `orca tab create` command fixes it.
- A frozen GitHub panel: check rate limits with three `gh` commands.

## Three layers of diagnosis: status, terminal, logs

The right order runs from overview to detail. Layer one: `orca status` — one
answer to "is the app alive, is the runtime reachable":

```text
$ orca status                # (trimmed — pid/runtimeId removed)
appRunning: true
desktopWindowStatus: available
runtimeState: ready
runtimeReachable: true
runtimeConnectionState: connected
graphState: ready
```

*Source: `orca status`, run for real on the machine this post was written
on, retrieved 2026-09-08.*

Layer two: run commands manually in a terminal — if a command works outside
the app but not inside it, the problem is the PATH or the configuration the
app sees, not the CLI itself. Layer three: logs — for when the first two
layers point at nothing.

And one principle that spans all three: "the agent says it's done" is not
evidence that the work runs — it is the reason the story workflow has gates
where you check real evidence. On the machine side the same spirit applies:
silence is not evidence of death — the [watchdog: idle is not
dead](/blog/watchdog-idle-is-not-dead/) post argued it for the agent layer,
and this post applies the same principle to the CLI layer.

## Agent won't start: run it by hand, then ask about PATH

The agent tab opens and then sits silent? The docs prescribe exactly one
first step:

> "Open the terminal and run the agent's CLI manually. If it fails there,
> it's an auth or install problem in the CLI itself — not Orca."

*Source: the Troubleshooting & FAQ docs, "Agent won't start" section,
retrieved 2026-09-08.*

Three steps per the docs: run the agent's CLI by hand in a terminal — if it
fails there, the CLI's own auth or install is broken; check whether the CLI
is on the `PATH` the app sees, under Settings → Agents; and use the
**Restart** chip on the tab to relaunch the agent without closing the
worktree.

## Worktree creation fails: fetch first, rename second

Failed worktree creation usually falls into one of two buckets, as the docs
list them:

> "The start-from ref may not be fetched. Open a terminal in the repo and
> run `git fetch origin`.
> The target directory may already have a worktree for that branch — delete
> it or pick a new branch name."

*Source: the Troubleshooting & FAQ docs, "Worktree creation fails" section,
retrieved 2026-09-08.*

The second case shows up most when recreating a worktree for a branch whose
old worktree was deleted — new folder, but git still remembers the branch
already had one. Pick a different branch name or delete the old worktree
cleanly. The mechanism for sharing heavy files between worktrees — the usual
next suspect — is covered in the [worktree
workflow](/blog/guide-worktree-workflow/) guide.

## "command not found" and the dead SSH terminal: two errors, one nature

Both situations are "connected, but the tool is missing".

Typing `orca` in a terminal says the command doesn't exist: the CLI shim is
not registered. The docs point at the switch:

> "Register the CLI under Settings → General → Orca CLI. On macOS it
> installs a shim into `~/.local/bin`; make sure that's on your shell's
> `PATH`."

An SSH target connects, lists files, but terminals never open: the remote is
missing the toolchain to compile the native module (make, a C++ compiler,
python3). The install commands per distro family are in the docs, along with
the most-skipped detail: "Reconnect after installing tools so Orca can
reinstall native modules." Install, then RECONNECT — nine out of ten "I
installed them and it still doesn't work" cases skipped that. The full SSH
target walkthrough is in the [SSH worktrees](/blog/guide-ssh-remote/) post.

*Source: the Troubleshooting & FAQ docs, the "Orca CLI says command not
found" and "SSH connects but remote terminals fail" sections, retrieved
2026-09-08.*

## Browser says no tab: one command to create one

An agent calls the browser and gets back `browser_no_tab`? It isn't a
failure — the current worktree simply has no browser tab open. The docs
quote the fix verbatim:

> "No tab is open in the current worktree. Open one with `orca tab create
> --url ...` or open the browser pane manually and navigate."

The command's real shape is `orca tab create --url <url>` — it opens a tab
in the current worktree. An agent can run this itself; so can you, without
touching the UI.

*Source: the Troubleshooting & FAQ docs, `browser_no_tab` section; the flag
shape cross-checked against `orca tab create --help`, retrieved 2026-09-08.*

## GitHub rate limits, logs, and when to hand evidence to someone else

The PR panel, checks, or Tasks stop refreshing — the docs fold three causes
into one line: rate limits, broken `gh` auth, missing scopes. The quick
check, quoted verbatim:

```bash
gh auth status -h github.com
gh api user
gh api rate_limit --jq '.resources.core'
```

*Source: the Troubleshooting & FAQ docs, GitHub errors section, retrieved
2026-09-08.*

`remaining` near zero in the last command's output is the culprit — the
panel hit the API ceiling and is waiting for the `reset` timestamp. Broken
auth will announce itself in `gh auth status` first.

And when the first two layers point at nothing, or you need to send the
incident to someone else: Help → Open Logs opens the app's log directory —
with a sentence attached in the docs worth keeping: "Attach these when
filing a bug". A report with logs is a different species from a report with
impressions: the recipient can reproduce the failure instead of guessing.

Platform setup and the rest of the common questions live on the
[FAQ](/docs/faq/) page — and the installer and update walkthrough is its own
post, [install and update](/blog/guide-install-update/).

Next time the app leaves you staring, don't restart it yet — run `orca
status`, run one command by hand, open the logs. Those three layers answer
most questions before you ever need the restart button.
