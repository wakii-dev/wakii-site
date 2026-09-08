---
title: "SSH worktrees: keep the runtime local, run the work remote"
description: "Add an SSH target, create the worktree on the remote machine, and keep the local feel: file-event sync, status chips, sessions that survive disconnects, port forwarding, and fixing a remote missing its toolchain."
pubDate: "2026-09-21"
category: "tutorial"
tags: ["guide", "cli", "worktree"]
draft: false
---

The machine you type on is not always the right place to run the work: builds
that take forty minutes, datasets at scale, a toolchain that exists on exactly
one dedicated box. SSH worktrees solve this counterintuitively — the Wakii
runtime stays on your laptop, the UI stays the UI you know; only the heavy
work crosses the SSH link to the other machine. And this is a shipped feature,
not a roadmap line: the highlights of release 1.4.198 (published 2026-09-05)
name it outright. This
post walks from adding a host to fixing a remote that is missing its
toolchain.

TL;DR:

- SSH worktrees shipped in 1.4.198 — right in the release-notes highlights.
- Add a host: Settings → SSH → Add Target, type it in or pick it from your
  OpenSSH config, then Test and Save.
- Create a worktree choosing an SSH target instead of Local: the worktree and
  the agent live on the remote, the editor still feels local through file-event
  sync.
- Disconnects don't kill running agents — sessions are leased through a relay;
  remote ports forward to your laptop via the Ports tab.

## What an SSH target solves

There are two ways to move work to another machine. The first moves the whole
runtime: the app runs over there, your laptop is just a screen — you trade
away your entire familiar environment to borrow a stronger box. The second
keeps the runtime and moves only the work:

```ascii
your laptop                           remote machine (SSH host)
┌───────────────────────┐             ┌───────────────────────┐
│ Wakii runtime         │             │ git worktree          │
│ editor · diff · UI    │ ◄── SSH ───►│ agent runs here       │
│ status chips          │  file sync  │ host's own toolchain  │
└───────────────────────┘             └───────────────────────┘
```

*Source: diagram drawn from the mechanism described in the SSH worktrees docs,
"Use a target" section, retrieved 2026-09-08.*

The second path is the SSH worktree: your laptop keeps the runtime and the
whole experience; the remote keeps the worktree, the terminals, and the agent.
As a product matter, this is not a promise — the 1.4.198 release notes list it
next to the biggest features of that release, quoted verbatim:

> "GitHub & Linear native, SSH worktrees, mobile companion"

*Source: v1.4.198 release notes, GitHub Releases wakii-dev/wakii, retrieved
2026-09-08.*

## Adding a host: Settings → SSH → Add Target

Open Settings → SSH and click Add Target — the form opens in a modal, so even
with a long host list, the Host, Advanced, and Save controls stay reachable.
The fields to fill:

| Field | Notes |
|---|---|
| Host | hostname or IP of the remote |
| User · Port | the SSH account and the port, if not the default |
| Identity file | optional — a passphrase-protected key prompts on first connect |
| OpenSSH config picker | searches `~/.ssh/config` (including `Include`d files); picking one host prefills the form |

*Source: SSH worktrees docs, "Add an SSH target" section, retrieved
2026-09-08.*

The docs on the fast path, quoted verbatim:

> "Fill in host, user, port, and optional identity file — or open the
> **OpenSSH config** picker in the same dialog to search `~/.ssh/config`
> (including `Include`d files), pick one host, and prefill the form."

And on the last two buttons: "Click **Test** to verify connectivity, then
**Save**." Hosts already in the app show a badge saying so — no adding them
twice.

*Source: SSH worktrees docs, "Add an SSH target" section, retrieved
2026-09-08.*

On the CLI side, "machines you can aim at" has a name of its own — `host
list` shows them along with how to pass them:

```bash
$ orca host list
local       this machine  ->  --host local
```

*Source: `orca host list` on the machine this post was written on, retrieved
2026-09-08 — no hosts added here, `local` is this machine itself.*

## Creating a worktree on the host: choose the SSH target instead of Local

The worktree creation flow is the one you already know from any added repo.
The single difference is one choice, and the docs state it flat:

> "When creating a worktree, choose an SSH target instead of Local."

Once chosen, three things happen on the remote — quoted line by line:

> "Create the git worktree on the remote host.
> Run agents remotely through the SSH connection.
> Sync file events so the editor, diff, and browser still feel local."

*Source: SSH worktrees docs, "Use a target" section, retrieved 2026-09-08.*

Nothing underneath is new magic: a worktree is plain git — one repo, several
working directories. [Real parallelism through worktree
isolation](/blog/parallel-worktrees-isolation/) already showed why one
worktree per branch is a safe unit of separation — this is the same mechanism
with one extra axis: the working directory lives on a different machine.

## Still feels local: status chips and disconnects that don't kill agents

Three chip colors report the SSH connection's health, quoted verbatim from
the docs: "green connected, yellow reconnecting, red disconnected". Yellow and
red are not five-alarm fires — the most important sentence on the whole docs
page is this one:

> "Disconnects don't kill running agents."

When the link returns, the app reconnects and re-attaches to your session,
scrollback included. Remote sessions even survive closing the app on the
laptop: they are leased through a relay running on the remote host, and by
default stay alive until you end them ("Keep terminals alive until reset").
The resulting mindset, quoted verbatim:

> "Losing contact with a host is not evidence that its work stopped."

*Source: three excerpts from the SSH worktrees docs — the Status and
"Sessions across app close" sections, retrieved 2026-09-08.*

That is the same principle the [watchdog post](/blog/watchdog-idle-is-not-dead/)
argued from the story side — silence is not evidence of death, and losing
sight of work is no license to declare it lost.

## Port forwarding: the Ports tab (Cmd+Shift+I)

A dev server runs on the remote, the browser opens on the laptop — the one
missing link is the port. For SSH worktrees, the right sidebar has a Ports
tab (toggle with `Cmd+Shift+I`): the app scans `/proc/net/tcp` on the remote
and lists listening ports under Detected — one click forwards them to your
machine. Adding, editing, and removing forwards happens in the same tab.

Two details worth remembering, quoted from the docs: forwards "persist across
app restarts and SSH reconnects", and privileged remote ports are remapped
automatically when forwarded — the docs' own example is "remote 80 → local
10080" — so you don't need root to use the host's port 80.

*Source: SSH worktrees docs, "Port forwarding" section, retrieved
2026-09-08.*

## The remote has no toolchain: node-pty needs make, g++, python3

One last stumble, and it strikes exactly when everything seemed done. On
first connect, the app installs a small relay on the remote; remote terminals
need a native node-pty module, and on Linux it usually compiles right there.
Missing make, a C++ compiler, or python3? Files, git, and the editor still
work — only remote terminals won't spawn. The install commands per distro
family, quoted verbatim from the docs:

```bash
sudo apt-get install -y build-essential python3     # Debian/Ubuntu
sudo dnf install -y make gcc gcc-c++ python3        # Fedora/RHEL
sudo apk add build-base python3                     # Alpine
sudo pacman -S --needed base-devel python           # Arch
```

*Source: SSH worktrees docs, "Linux hosts without a C/C++ toolchain" section,
retrieved 2026-09-08.*

And the step most often skipped, stated plainly in the docs: "Install the
tools, then reconnect so the relay can install native modules." — after
installing, you must RECONNECT. Terminals still won't open after installing?
Nine times out of ten, you haven't reconnected yet.

The whole path — from adding a host to your first worktree on another machine
— sits alongside the platform setup on the [getting
started](/docs/getting-started/) page.

Open Settings → SSH, add the other machine, create your first worktree with a
target that isn't Local — and let the heavy work live where the toolchain is,
the decisions where you are.
