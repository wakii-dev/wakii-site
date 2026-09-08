---
title: "Android emulator: a device inside the app"
description: "Checking a mobile flow no longer means holding a device and typing adb commands outside the agent loop: the orca-emulator-android skill lets the agent boot AVDs, tap, swipe, type, install apps and read logcat from inside the working session."
pubDate: "2026-09-17"
category: "tech"
tags: ["features", "android", "mobile"]
draft: false
---

A mobile flow only proves itself on a device: the button sits where it should,
screens move in the right order, logcat stays quiet. The familiar way to check
is to hold a phone or open an emulator and type adb commands by hand — a loop
that sits entirely outside the agent's reach. The agent finishes the code change
and then has to stop, wait for a human to type the commands, and wait again
while a human reads the result and describes it back. The `orca-emulator-android`
skill removes that bottleneck: the agent boots AVDs, taps, swipes, types, presses
Back, rotates the screen, installs and launches apps, reads the accessibility
tree and logcat — from inside the working session.

TL;DR:

- The `orca-emulator-android` skill lets the agent drive an adb-connected
  Android emulator or a real device: listing/booting AVDs, taps, swipes, typing,
  hardware buttons (Back, Recents), rotation, app install/launch, runtime
  permissions, the accessibility tree, and logcat.
- The skill file is a discovery stub; the full, version-matched guide is served
  by the `orca` binary itself via the `skills get` command.
- The `orca emulator` command family is not just documentation: the mobile
  workspace's start script calls `emulator attach` and `emulator tap` for real
  inside the dev loop.
- The Android mobile app shipped as pre-release mobile-android-v0.0.48 on
  2026-09-05; the honest limits close this post: an adb-connected
  device/emulator is required, and command syntax changes between releases.

## The mobile loop used to stop at human hands

Every agent knows how to change code. The breaking point of mobile is not the
code — it is verification: to know whether a button works, something has to run
the app. The old loop puts a human in the middle of its two halves — the agent
produces the change, the person holding the device produces the feedback:

```ascii
the old mobile loop — human eyes and hands sit between the two halves

  agent: change code ──► build done ──► STOP, wait
                                          │
  human: hold device / open emulator      ▼
    ├─ type each command by hand: adb install, adb shell input tap, …
    ├─ watch the screen, read logcat
    └─ describe the result back to the agent ◄── one conversation
                                                 turn per loop
```

*Source: conceptual diagram of the loop the orca-emulator-android skill exists
to shorten, retrieved 2026-09-08.*

The cost multiplies with the number of loops: a UI bug that only shows on the
third tap means three rounds of a human typing commands and reading a screen.
The agent cannot close its own loop, and the developer becomes a message-passing
device with context comprehension — a waste on both sides.

## The orca-emulator-android skill: a device within the agent's reach

The skill ships in tag v1.4.199 of the product repo, next to `orca-emulator`
(iOS) and `orca-cli`. The capability list, quoted verbatim from the skill file:

> "Engage Orca whenever you drive an adb-connected Android emulator or device
> from inside the Orca app: listing/booting AVDs, taps, swipes, typing, hardware
> buttons (including Back and Recents), rotation, app install/launch, runtime
> permissions, the accessibility tree, and logcat. It is cross-platform
> (Windows, Linux, macOS) and complements the orca-emulator (iOS) and orca-cli
> skills."

*Source: skills/orca-emulator-android/SKILL.md, tag v1.4.199 of the
wakii-dev/wakii repo, retrieved 2026-09-08.*

Read the list as a job breakdown: preparation (listing and booting AVDs),
manipulation (taps, swipes, typing, Back and Recents, rotation), app management
(install, launch, runtime permissions), and observation (the accessibility tree,
logcat). The last two are the biggest prize for an agent: instead of looking at
a screenshot and guessing, the agent reads the real widget structure of the
screen and the device's own log.

The agent loads the full guide with one command — the block below is reproduced
from the skill file itself:

```text
ORCA skills get orca-emulator-android
```

*Source: skills/orca-emulator-android/SKILL.md, section "Load the full guide
before running Orca commands", retrieved 2026-09-08.*

(`ORCA` is a placeholder for the resolved executable — the skill file devotes a
whole section to choosing it, because the word `orca` does not always point at
the app.)

## From agent to emulator screen

```ascii
agent ──► orca-emulator-android skill ──► `orca` binary ──► adb ──► emulator

  agent (inside the working session)
    │  "boot an AVD, open the app, tap the sign-in button, read logcat"
    ▼
  skill looks up the version-matched guide ──► `orca` binary
    │  emulator devices --json, then commands for: boot AVD, tap,
    │  swipe, type, rotation, install/launch
    │  (exact syntax served by the per-version guide — the stub
    │   forbids guessing from memory)
    ▼
  adb ── the device bridge
    ▼
  an adb-connected Android emulator or real device
    └─ accessibility tree + logcat flow back to the agent
```

*Source: built from skills/orca-emulator-android/SKILL.md and the real calls in
mobile/scripts/start-emulator.mjs, retrieved 2026-09-08.*

The difference from typing by hand is not the speed of a single command — it is
where the result lands. The accessibility tree and logcat land inside the
context the agent is already working in, so the see-bug — fix — retry loop stops
switching between two heads.

## The dev loop already has a script, and the mobile app has shipped

The `orca emulator` command family is not just documentation. The product repo's
mobile workspace has a dev-loop startup script: one command attaches the
emulator via `orca emulator attach`, starts the Metro bundler, opens the app on
the emulator screen — and even the on-screen confirmation tap goes through
`orca emulator tap`:

```bash
# usage line in the script header
node scripts/start-emulator.mjs [--worktree <path>] [--device <name>]

# two real calls inside the script (excerpt, tag v1.4.199):
await orca(['emulator', 'attach', device.udid, '--worktree', worktree, '--focus', '--json'], …)
await orca(['emulator', 'tap', '0.5', '0.56', '--worktree', worktree, '--json'], …)
```

*Source: mobile/scripts/start-emulator.mjs — the usage line in the header and
the `orca emulator attach` / `orca emulator tap` calls (lines 173, 516),
retrieved 2026-09-08.*

The demo asset ships alongside the docs, already in the repo:

```bash
$ ls -lh docs/assets/orca-mobile-emulator.gif
-rw-r--r--  1 hoivu  staff   1.8M Aug 30 23:46 docs/assets/orca-mobile-emulator.gif
```

*Source: `ls -lh` on a local checkout of the wakii-dev/wakii repo, retrieved
2026-09-08.*

The Android mobile app itself has left the dev machine: release
`mobile-android-v0.0.48`, a pre-release on 2026-09-05 — the same day as two
desktop releases, v1.4.198 and v1.4.199. That three-releases-in-one-day cadence
is the subject of [shipping cadence: two releases, one
day](/blog/shipping-cadence-two-releases-one-day/).

*Source: the Releases page of the wakii-dev/wakii repo — v1.4.198 (12:47 UTC),
mobile-android-v0.0.48 (13:00 UTC), v1.4.199 (19:07 UTC), all on 2026-09-05,
retrieved 2026-09-08.*

## The honest limits

Two limits are stated in the skill file itself. First, the file is not the
reference — quoted verbatim:

> "This file is a discovery stub, not the usage guide. The full, version-matched
> Orca Android emulator reference is served by the `orca` binary itself — kept
> out of this file on purpose so it can never drift from the binary that will
> actually run your commands."

*Source: skills/orca-emulator-android/SKILL.md, tag v1.4.199, retrieved
2026-09-08.*

Which is why this post deliberately lists no command syntax: the stub does not
list it, because commands change between releases. The agent runs `skills get`
first and only then runs commands; for an older binary that does not know
`skills get`, the stub grants exactly two read-only orientation commands:

```text
ORCA status --json
ORCA emulator devices --json
```

*Source: skills/orca-emulator-android/SKILL.md, section "If an older Orca does
not recognize `skills get`", retrieved 2026-09-08.*

Second, the control surface starts at adb: the skill drives "a real
adb-connected device or emulator" — with no device connected, there is nothing
to drive. The cross-platform detail is real too: on Linux outside an
Orca-managed terminal, the word `orca` usually resolves to the GNOME screen
reader — the skill file devotes a section to picking the right executable
instead of guessing.

It all starts from an agent with hands: the
[getting started](/docs/getting-started/) page walks through installing Wakii
and connecting a first working environment. To see the rest yourself: plug in an
Android device, enable debugging, then hand over the task outright — "boot an
AVD, open the app, tap through the sign-in flow, read logcat for errors". Leave
the typing to the machine, keep the deciding for yourself; and the full Android
emulator capability set has exactly one place that matches the current binary —
ask it directly: `orca skills get orca-emulator-android`.
