---
title: "Pair your phone with the Wakii desktop over QR"
description: "Install the Android app from the APK on GitHub Releases, scan the QR your desktop shows to pair, and put four things to work right away: the tiered story view, gate resolution with free-text + confirm, gate open/closed notifications, and guard codes."
pubDate: "2026-09-20"
category: "tutorial"
tags: ["guide", "mobile"]
draft: false
---

Agents run long jobs, and you do not sit next to the machine for all of it.
The real question in your hand is not "is the agent still running" — the
watchdog owns that — but "which gate is waiting for me". This post sets up the
desktop–Android pair in a few minutes, then shows exactly what the phone can
do right after — no more, because anything beyond that is unverified and this
post does not promise it.

TL;DR:

- The Android app installs by sideloading the APK from GitHub Releases —
  release `mobile-android-v0.0.48`, tagged Pre-release.
- Pairing: the desktop shows a QR, the phone scans it — done once, the desktop
  is the source of truth.
- Four things work right away: the story view (SFs by tier + progress), gate
  resolution (option or free-text, confirmed before sending), gate
  open/closed notifications, and guard codes that block duplicate actions.
- iOS: the Wakii site has no link yet — that is all there is to say.

## What you need: a running desktop and an Android phone

Shorter to prepare than you expect. A Wakii desktop running, ideally with a
story inside — if nothing is installed yet, [installing and updating Wakii
from zero](/blog/guide-install-update/) starts from an empty machine. An
Android phone. And one thing to know up front: the Wakii mobile app is not on
a store — you install it as an APK from GitHub Releases. As for iOS: the
Wakii site has no link yet — that is the whole story.

| You need | Role in the pair |
|---|---|
| Wakii desktop running | Source of truth — everything happens on the desktop, the phone is the control |
| Android phone | The monitor screen and the place you resolve gates from |
| Same account on both | The condition for pairing to succeed |

*Source: assembled from the mobile companion docs (Pairing and Troubleshooting
sections), retrieved 2026-09-08.*

## Installing the app: the APK from GitHub Releases

Four steps, done on the phone:

1. Open the Releases page of the `wakii-dev/wakii` repo in a full browser —
   Chrome, not the webview inside some chat app.
2. Open release `mobile-android-v0.0.48` and download `app-release.apk`.
3. Open the file from Downloads (or Files → Downloads) and confirm the
   install. Android may ask you to allow the browser or Files app to install
   unknown apps — grant it for now and remember to switch it back off after.
4. Samsung Galaxy: if Auto Blocker blocks the install, open Settings →
   Security and privacy → Auto Blocker, turn it off temporarily, install, then
   turn it back on. Do not disable Play Protect.

This is the release in question, checked with a real command:

```bash
$ gh release view mobile-android-v0.0.48 --repo wakii-dev/wakii --json name,isPrerelease,publishedAt
{
  "name": "Orca Mobile Android mobile-android-v0.0.48",
  "isPrerelease": true,
  "publishedAt": "2026-09-05T13:00:31Z"
}
```

*Source: `gh release view`, retrieved 2026-09-08. The release carries exactly
one asset: `app-release.apk`.*

The Pre-release tag says exactly that: the first build of the mobile line,
usable, but not to be judged like a final stable release.

## Pairing: the desktop shows a QR, the phone scans it

Open the pairing flow from the desktop's account/status menu — the desktop
displays a one-time QR code. On the phone, open the mobile app, choose Pair,
scan the QR. There is a shortcut: a deep link from the desktop jumps straight
into the app's pairing screen. Throughout this step, keep the desktop
reachable on the path you chose — LAN or a private network.

One sentence in the docs sets expectations exactly, quoted verbatim:

> "Pairing is one-time and the desktop is always the source of truth."

*Source: mobile companion docs, opening paragraph, retrieved 2026-09-08.*

The phone is a remote control for the desktop you already have — not a second
copy running on its own. That is also why every scenario below reads the same
in reverse: the real work still happens on the desktop.

## Four things that work right away from the phone

Open the story view of the host running a story. The four abilities below are
what the phone does on day one, one scenario each.

One — see where the story stands. The story view shows progress and SFs
grouped by tier, each SF with a status chip. Three seconds of scrolling and
you know which tier the story is in, which SFs are done, which are running.

Two — resolve a gate. Pending gates appear right in the story view. Pick one
of the gate's options; if the situation fits no option, type a free-text
resolution. Confirm once before sending — the phone never fires blind.

Three — let notifications replace opening the app. Gate open and gate closed
both notify: one says there is something waiting, the other confirms the
waiting loop has closed.

Four — tap the wrong thing, nothing breaks. Resolving a gate that the desktop
already handled, or a duplicate action, is blocked by a guard with an explicit
error code instead of failing silently.

| Ability | What you do on the phone |
|---|---|
| Story view | Read progress + SFs by tier, per-SF status chips |
| Resolve a gate | Pick an option or type free-text, confirm before sending |
| Notifications | Gate open and gate closed both notify |
| Guard codes | Duplicate action / already-closed gate gets blocked with a clear error code |

*Source: mobile companion docs, the mobile decision-gates section, retrieved
2026-09-08; gate open/closed notifications per the v1.4.199 release notes
(notification routing), retrieved 2026-09-08.*

All four abilities revolve around one thing — decisions. Why gates matter
enough to reach your phone is the subject of [decision gates: safety for AI
agents](/blog/decision-gates-safe-ai-agents/). And for a first-person account
of resolving work from a phone, [reviewing AI agents from your
phone](/blog/review-ai-agents-from-your-phone/) is the record of a first time.

## When the connection drops: three situations, three fixes

| Situation | Fix |
|---|---|
| Pairing fails | Check that phone and desktop are signed into the same account |
| The QR code "died" | Pairing codes expire after a few minutes — generate a fresh one and scan again |
| Desktop closed or offline | Connection drops temporarily — reopen the desktop and the phone reconnects |

*Source: mobile companion docs, Troubleshooting section (excerpted, trimmed),
retrieved 2026-09-08.*

The most important part, quoted verbatim:

> "Pairing fails — make sure your desktop and phone are signed into the same
> Orca account. Pairing codes expire after a few minutes; generate a fresh one
> if it's been sitting on the screen. … Closing the desktop app drops the
> connection; reopen desktop and the phone reconnects automatically."

*Source: mobile companion docs, Troubleshooting section, retrieved
2026-09-08.*

Read the last line carefully: a dropped connection is a temporary state, not a
bug to reinstall anything over — reopen the desktop and the link heals itself.

The full install and first-run context for the desktop lives on the [getting
started](/docs/getting-started/) page. To run one complete loop: set up the
pair, open the story view of a running story, and let the next gate come find
you on the phone instead of you hunting for it.
