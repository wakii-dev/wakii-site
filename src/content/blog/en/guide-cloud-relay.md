---
title: "Cloud relay: agents on a server you own, UI anywhere"
description: "Pair two machines through a Remote Orca Server or orca serve — the server keeps the runtime, sessions, and agents; clients are just the UI. Plus pointing the CLI at a remote runtime and the safety rules."
pubDate: "2026-09-22"
category: "tutorial"
tags: ["guide", "architecture"]
draft: false
---

The longest-running agents stop for the silliest reason: you close the
laptop. When the runtime lives on the machine you type on, the work is tied
to that machine — it sleeps, the work stops. This post is the how-to for the
other direction: put the runtime on a machine you own, let the remaining
machines act as screens, and keep agents running through your laptop's
naps. No architecture theory — every click and every command line, including
a server with no display at all.

TL;DR:

- Three ways to move work off your laptop: SSH target, Remote Orca Server,
  per-workspace environments — they differ in who owns the runtime.
- Pairing: on the server, Settings → Remote Orca Servers → New Link; on the
  client, Add Server and paste the access link.
- Headless server: `orca serve --pairing-address <ip>` — it prints the
  pairing URL right in the terminal.
- The CLI can aim at a remote runtime too: `--environment <name>` or the
  `ORCA_ENVIRONMENT` / `ORCA_PAIRING_CODE` variables.
- The access link is a password: keep the path on a private network, never
  forward the port to the open internet.

## Three ways to put an agent on another machine

The product docs have a map page, ways to run, and it draws the line with
exactly one question: who owns the runtime? Option one is an SSH target —
your laptop keeps the runtime, the worktree and the agent run remotely.
Option two is a Remote Orca Server — a machine you control keeps the entire
runtime, and the laptop, browser, and phone are clients. The comparison table
from the docs, paraphrased:

|  | SSH worktree | Remote Orca Server |
|---|---|---|
| Runtime owner | Laptop | Remote machine (desktop app or `orca serve`) |
| Disconnect | Agents keep running on the host; laptop reattaches | Full session state lives on the server |
| Multi-client | One laptop drives the host | Laptop, web, mobile, and automation share the runtime |
| Setup | Add an SSH target, pick Run on | Share the server app or run `orca serve`, pair with a URL |

*Source: the "SSH vs Remote Orca Server" table in the ways-to-run docs,
paraphrased, retrieved 2026-09-08.*

The SSH path has its own post already — [the SSH remote
guide](/blog/guide-ssh-remote/). There is a third path, per-workspace
environments (recipe-defined VMs per worktree), but that is disposable
compute; this post goes deep on the long-lived-session path. One thing the
docs state flat, to prevent a misunderstanding: there is no hosted VPS
service here — remote modes always run on machines and cloud accounts you
control.

## Pairing through an access link

The two ends connect over a private network route:

```ascii
client machine · Wakii client          server machine · Wakii runtime
shows UI, sends input         ───────► keeps repos and worktrees
                              ◄─────── runs terminals and agents
                       (a private route you control)
```

*Source: diagram drawn from the "What runs where" section of the remote
servers docs, retrieved 2026-09-08.*

Server side, on the machine that should keep the sessions: open Settings →
Remote Orca Servers, and under Advertise this app as a server click New
Link. Choose the Tailscale address as the Connection address — it usually
starts with `100.` — then click Generate Access Link and copy the link under
Pair another Orca client. Client side: same Settings page, click Add
Server, give it a recognizable name, paste the link, click Add Server; if
the server row shows Disconnected, click Connect.

Each paired client gets its own token, revocable independently — the server
lists them under Shared Server Access. Click the trash button beside a grant
and the active client using it is disconnected immediately. Generating
another link replaces the previous unused link; clients that already paired
keep their own grants until you revoke them.

> "Keep the access link private. The pairing URL grants access to this Orca
> runtime. Treat it like a password and send it only to the client you intend
> to pair."

*Source: remote servers docs, the "Keep the access link private" callout,
retrieved 2026-09-08.*

## A headless server: `orca serve` in one command

A displayless server — headless Linux, a service-managed VM — uses `orca
serve`: it starts the runtime without opening a desktop window, runs in the
foreground until you press Ctrl-C, and prints the endpoint plus a pairing URL
to paste into a client. The key flags, quoted straight from `--help`:

```bash
$ orca serve --help                  # (excerpt)
  --port
  --pairing-address
  --mobile-pairing
Notes:
  --pairing-address changes only the client-advertised address; use a reachable LAN,
  Tailscale, SSH-forward, or reverse-proxy endpoint.
  Use --mobile-pairing to print a mobile-scoped pairing QR/link instead of the default
  runtime-environment pairing link.
Examples:
  $ orca serve --port 6768 --pairing-address 100.64.1.20
  $ orca serve --pairing-address 100.64.1.20 --mobile-pairing
```

*Source: `orca serve --help`, retrieved 2026-09-08; the full flow in the
remote servers docs.*

The docs' own example is `orca serve --pairing-address 100.64.1.20` — it
prints the pairing URL, you paste it into Settings → Remote Orca Servers →
Add Server on the client, done. Two details come up often: add `--port 6768`
when a firewall or tunnel requires a fixed port; and on Linux the CLI is
named `orca-ide` (the plain `orca` name belongs to the GNOME screen reader),
so the equivalent command is `orca-ide serve …`. Need to pair a phone as
well? `--mobile-pairing` prints a QR code and link scoped to the mobile app —
scan or paste.

## Driving the remote runtime from the CLI

It is not just the UI — the CLI can aim at a paired runtime too. Save the
remote runtime once, and every subsequent command runs against it:

```bash
$ orca environment list
No saved environments.
```

*Source: `orca environment list` on the machine this post was written on,
retrieved 2026-09-08 — a clean machine, no saved runtimes.*

The management commands and the selector, quoted from `orca --help`:

```bash
$ orca --help                        # (excerpt)
Environments:
  environment add           Save a remote Orca runtime from a pairing code
  environment list          List saved remote Orca runtimes
  environment show          Show one saved remote Orca runtime
  environment rm            Remove a saved remote Orca runtime
  --environment <selector>   Connect using a saved environment id or name
Behavior:
  Remote runtime access can also be supplied with ORCA_PAIRING_CODE or
  ORCA_ENVIRONMENT.
```

*Source: `orca --help`, retrieved 2026-09-08.*

Full syntax: `orca environment add --name <name> --pairing-code <code>`
saves a runtime from a pairing code; every command then accepts
`--environment <name|id>`, or you set the `ORCA_ENVIRONMENT` variable for the
whole session. This is exactly how an automation — or an agent on machine B —
works against a runtime living on machine A: no UI, no second login.

## Safety: four rules before you open a relay

One, the access link grants access to the runtime — send it only to the
client you intend to pair and handle it like a password; if it leaks, revoke
the matching grant under Shared Server Access. Two, keep the server and the
client on a private network path you control — the same Tailscale tailnet or
a LAN. The beta warning at the top of the remote-server docs, quoted
verbatim:

> "Remote Orca Servers are beta. Keep the server and client on a private
> network path you control, such as the same Tailscale tailnet or LAN."

Three, do not forward the Orca port directly to the public internet — the
docs list the alternatives: Tailscale, WireGuard, a trusted LAN, SSH
forwarding, an authenticated tunnel. Four, do not pick `127.0.0.1` as the
address for another machine — that address only works on the server itself.

*Source: the "Remote Orca Servers" docs — the Beta callout and the "Access
and security" section, retrieved 2026-09-08.*

The reward for this setup is exactly the situation the
[watchdog post](/blog/watchdog-idle-is-not-dead/) defends: an agent going
quiet during a long build is not dead — and when the runtime lives on a
server, no laptop falls asleep to interrupt it. Common questions about the
run modes are collected on the [FAQ](/docs/faq/) page.

One old machine running nothing but Tailscale is enough for a first try:
install the app, click New Link, pair the client — and let your agents sleep
on the server instead of next to your laptop.
