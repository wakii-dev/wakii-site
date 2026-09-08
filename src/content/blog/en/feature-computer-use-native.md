---
title: "Native computer use: agents that reach the desktop"
description: "Wakii lets agents reach the real desktop: the src/main/computer/ module picks a provider per platform, validates parameters before execution and stamps explicit verification on each action. Plus the CI path that shipped it and the removal of the silent left-click fallback."
pubDate: "2026-09-18"
category: "tech"
tags: ["features", "agents", "workflow"]
draft: false
heroImage: "/blog/heroes/feature-computer-use-native.png"
---

Wakii's agents read code, run commands, open pull requests — all of it inside
the terminal and the IDE. Ask one to touch a real desktop app — press a
button, fill a form, drag a slider — and no tool in the kit covers it. Native
computer use is that missing piece: a module living inside the app that lets
an agent operate the machine like a human user would, and — just as
important — makes each action report honestly what it did. This post
dissects the module at `src/main/computer/`, the CI path that shipped it
inside a DMG, and one memorable decision: deleting a silent left-click
fallback outright.

TL;DR:

- The problem: agents live in the terminal and the IDE; desktop UI is a world
  none of their tools can reach.
- The approach: `src/main/computer/` is split into layers — platform-aware
  provider selection, parameter validation before execution, clipboard paste
  limits, and explicit verification stamped on each action result.
- The ship: CI on a GitHub-hosted runner runs the full build chain including
  `build:computer-macos`, renames the DMG and uploads it straight to release
  v1.4.198.
- The honesty: PR #14721 removed the silent left-click fallback on macOS —
  an action doing something else while reporting success is a design bug, not
  a feature.
- Every path, commit and quote in this post comes from the real product repo,
  retrieved 2026-09-08.

## The agent trapped in the terminal

An agent's tools cover the inside of the dev machine densely: read and write
files, run shell commands, run tests, open pull requests. Outside that border
lies the world users actually live in — native apps, menus, system dialogs,
input fields that belong to no terminal. The two worlds share no meeting
point:

```ascii
two working worlds — the agent on one side, the desktop on the other

  agent's world                     desktop world
  ├── read / write files            ├── native apps, menus, dialogs
  ├── run shell, run tests          ├── input fields, buttons
  └── open PRs, write docs          └── driven by mouse + keyboard

  between the two: no shared tool at all
  → an agent cannot "act like a user"
```

*Source: conceptual diagram illustrating the gap the `src/main/computer/`
module exists to close, retrieved 2026-09-08.*

The gap is not agent carelessness — it is a boundary of tooling. However
finely a team of nine agents divides its work, one kind of task stays
unclaimed: the part that means "touch the UI". Native computer use exists so
that part of the work has an owner.

## Inside the module: one responsibility per layer

`src/main/computer/` is not one large file but small layers. Six files carry
the `computer-` prefix without being tests — five of them are the layers this
post follows, and the sixth (`computer-sidecar-paste-validation.ts`) belongs
to the sidecar family:

```bash
$ ls src/main/computer/ | grep '^computer-' | grep -v '\.test\.'
computer-action-verification-normalization.ts
computer-clipboard-paste-validation.ts
computer-provider-action-validation.ts
computer-provider-lifecycle.ts
computer-provider-unavailable-message.ts
computer-sidecar-paste-validation.ts
```

*Source: `ls src/main/computer/ | grep '^computer-' | grep -v '\.test\.'`,
retrieved 2026-09-08; the same directory also hosts the `desktop-script-*`,
`macos-native-provider-*` and `sidecar-*` families.*

Reading each layer's role from the code. `computer-provider-lifecycle.ts`
picks the provider per platform: on macOS it prefers the native provider when
available, otherwise it falls back to the desktop-script provider; the
instance is cached and shutdown cleans both up.
`computer-provider-action-validation.ts` stands in front of the provider:
nine action families are enumerated explicitly in a switch — click,
performSecondaryAction, scroll, drag, typeText, pressKey, hotkey, pasteText,
setValue — while a wrong parameter type, a missing coordinate pair, or using
both windowId and windowIndex is rejected with `invalid_argument` before
anything touches the machine. `computer-clipboard-paste-validation.ts` blocks
paste text beyond the size limit; large payloads are measured with a yield so
the main process is not monopolized — the comment in the code says exactly
that. `computer-action-verification-normalization.ts` closes the final
promise: an action result lacking verification gets an explicit `unverified`
state stamped on, with the reason derived from the execution path
(`synthetic_input`, `clipboard_paste` or `accessibility_action_unasserted`).
`computer-provider-unavailable-message.ts` is the error layer that states
things plainly: no provider means the cause is named, along with the local
fix.

Data flows through the module in one direction:

```ascii
agent intent → action validation → provider → verification

  agent decides          validateComputerProviderActionParams()
  "click button X"  ───►  gate first: bad params → invalid_argument,
                           nothing touches the machine
                         ↓
                    provider chosen by the lifecycle
                    (native macOS or desktop-script)
                         ↓
                    normalizeComputerActionResult()
                    stamps an explicit verification state
                    (default: unverified + reason)
```

*Source: built from `computer-provider-action-validation.ts`,
`computer-provider-lifecycle.ts` and
`computer-action-verification-normalization.ts` in `src/main/computer/`,
retrieved 2026-09-08.*

## Shipping: full-chain CI, DMG straight to the release

The native macOS module is written in Swift and needs the Swift 6 toolchain,
which means Xcode 16 — a local build environment does not necessarily have
it. Commit `787766bfcf` adds the `.github/workflows/macos-build.yml` workflow
(71 lines) running on a GitHub macos-15 runner, selects Xcode 16, then runs
the full chain:

```bash
# Full chain — INCLUDING build:computer-macos (needs Swift 6 tools = Xcode 16)
pnpm run build:desktop
pnpm run build:computer-macos
pnpm run build:keyboard-layout-macos
pnpm run build:notification-status-macos
pnpm run ensure:electron-runtime
node config/scripts/build-mac-local.mjs
```

*Source: commit 787766bfcf, `.github/workflows/macos-build.yml`, step "Build
native helpers + app", retrieved 2026-09-08.*

The steps that follow collect the artifacts, rename `orca-macos-arm64.dmg`
to `Wakii-1.4.198-arm64.dmg`, then run
`gh release upload v1.4.198 … --clobber` — the DMG is replaced in place. The
v1.4.198 release notes document exactly this, quoted verbatim:

> **macOS arm64 is being rebuilt on a GitHub-hosted runner (Xcode 16)** to
> include the computer-use native module — the DMG will be replaced in place
> when it finishes.

*Source: v1.4.198 release notes, wakii-dev/wakii repo, retrieved 2026-09-08.*

## Removing the silent fallback: honesty as a design decision

Commit `66dfdc456f` (PR #14721, shipped since v1.4.186 and included in the
v1.4.198/v1.4.199 tags) is the textbook case for the "state your limits"
principle. On macOS, a `click --mouse-button middle` command used to read the
raw parameter string unvalidated, fall through the accessibility path, execute
as a left click — and report success with `path: "accessibility"`. The entire
fix fits in one diff line:

```bash
-        let button = params["mouseButton"]?.string ?? "left"
+        let button = try mouseButton(params["mouseButton"]?.string)
```

*Source: commit 66dfdc456f, diff of
`native/computer-use-macos/Sources/OrcaComputerUseMacOS/main.swift`,
retrieved 2026-09-08.*

Why a silent fallback is a design flaw rather than a missing feature: an
agent reasons from what tools report. An action that did something else but
reported success is wrong ground truth at the bottom layer — the layers above
trust a world that does not exist. The fix matches the module's own
philosophy: the normalization layer stamps `unverified` instead of assuming
success; the validation layer rejects early instead of swallowing errors; and
the silent fallback was deleted, not "improved". The test inside that very
commit states it plainly: "An unvalidated raw string reaches AXPress and
reports a left click as success."

Stating current limits plainly: the evidence in this post centers on macOS —
the v1.4.198 notes describe the arm64 rebuild specifically to include the
computer-use native module; a darwin machine without the native app gets an
explicit error message, quoted verbatim: "computer-use has no native provider
for darwin because Orca Computer Use.app was not found or this macOS version
is unsupported. For local development, run pnpm build:computer-macos and
restart Orca from this worktree."; and middle click on macOS rides the
`otherMouseDown`/`otherMouseUp` event family because macOS has no dedicated
middle-click events.

Reaching the desktop does not replace the nine-agent team from [Nine agents,
separated powers](/blog/nine-agents-separated-powers/) — it hands that team a
pair of hands for the part of the world living outside the editor. What each
kit component owns is listed on the [agents & kit](/docs/agents-and-kit/)
page.

To see it yourself: open Wakii, hand the team a task that touches desktop UI,
then read the action result it returns — verification state included. Or read
the diff of `66dfdc456f` to see what a single `?? "left"` cost, and why it
had to go.
