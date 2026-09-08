---
title: "Notifications and shortcuts: gates without watching the screen"
description: "An agent stops at a gate awaiting your approval — you do not have to babysit the screen. This post dissects the notification loop, gate-open → deep-link → resolve → gate-closed, with real sources, plus the ⌘⇧⌫ workspace shortcut on desktop."
pubDate: "2026-09-19"
category: "tech"
tags: ["features", "mobile"]
draft: false
---

An agent partway through a pipeline stops — not because something broke, but
because it asked a question only a human can answer. The decision itself is
rarely the expensive part; picking one option takes seconds. The expensive
part surrounds the decision: open the app, find the right story, find the
right gate, keep checking whether anything changed. The gate notification
lifecycle is built to remove that surrounding work: `gate-open` comes to
where you are, a tap on the deep-link lands on the right screen, and once you
answer, `gate-closed` confirms the wait is closed.

TL;DR:

- A decision gate halts the agent until a human answers — the real cost is
  the watching, not the deciding.
- A `gate-open` notification carries full routing fields; tapping the
  deep-link opens the right story/gate screen, and older builds without the
  new fields display safely.
- Resolving happens where you land: option-style questions become choice
  buttons, free-form questions become a multiline field plus a confirm step.
- A failed resolve refreshes the screen cleanly; re-tapping has no side
  effect — once a gate is closed, further taps change nothing.
- On desktop, ⌘⇧⌫ deletes the workspace you are hovering in the sidebar —
  deliberately designed to avoid the terminal pane's D-based split shortcuts.

## The gate stops the agent; it is the screen-watching that needs removing

A gate is a safety mechanism: when an agent reaches a point that needs a
decision, it stops and asks instead of picking a risky direction on its own.
The post [decision gates: the safety brakes for AI
agents](/blog/decision-gates-safe-ai-agents/) covered why stopping to ask is
a feature, not a malfunction. This post covers the other half of the story —
the stretch of time between a gate opening and your answer. Before routing
existed, you filled that stretch yourself: keeping the app open, switching
tabs, refreshing, scanning for which gate is waiting. The full lifecycle now
looks like this:

```ascii
one gate's lifecycle — from the agent stopping to the wait closing

  agent runs ──► asks a question ──► agent halts
                                          │
                                 notification `gate-open`
                                          │
                              you receive it ──► tap the deep-link
                                          │
                                  the right story/gate screen
                                          │
                        resolve (choice buttons / free-text + confirm)
                                          │
                                 notification `gate-closed`
                                          │
                                  wait closed — the agent continues
```

*Source: built from the Mobile section of the v1.4.199 release notes,
wakii-dev/wakii repo, retrieved 2026-09-08.*

Note the two ends of the loop: the entrance is a notification instead of you
polling the screen; the exit is `gate-closed` instead of you going back to
check. In between, one tap replaces the chain of navigation steps.

## Routing fields: the notification knows which gate it is about

A gate notification is not just a line of text saying a gate opened. It
carries identifiers that the system and the app share: which gate, which
story, which worktree. The v1.4.199 release notes describe it in one line
(quoted verbatim, in the original Vietnamese):

```bash
Notification routing: `gate-open`/`gate-closed` đủ routing fields,
tap → đúng màn; old-build hiển thị an toàn
```

*Source: v1.4.199 release notes, Mobile section, wakii-dev/wakii repo,
retrieved 2026-09-08.*

("gate-open/gate-closed carry full routing fields, tap opens the right
screen; old builds display safely.")

In the source code, these fields appear exactly as the notes describe — and
they are marked optional for a reason stated right in the comment:

```bash
// Gate routing fields (gate-open/gate-closed); optional so old clients ignore them.
gateId?: string
storyId?: string
```

*Source: src/main/runtime/runtime-mobile-notification-controller.ts,
wakii-dev/wakii repo, retrieved 2026-09-08.*

The notification source is also set by transition type rather than guessed by
the UI:

```bash
source: event.kind === 'open' ? 'gate-open' : 'gate-closed'
```

*Source: src/main/runtime/runtime-gate-transition-notifications.ts,
wakii-dev/wakii repo, retrieved 2026-09-08.*

The phrase "old builds display safely" is the limitation worth stating
plainly: routing fields are an addition, and a build that predates them skips
what it cannot read while still showing the notification. In exchange, the
tap → right-screen behavior is only complete on newer builds — exactly what
the notes say, no more.

## Resolving in place: choice buttons, free-text with confirm, and the guard

Once you have landed on the right screen, the remaining work is answering.
The notes spell out that the two question shapes are handled differently:

```bash
Gate resolve: options → choice buttons; free-form → multiline + confirm;
lỗi resolve refresh sạch, re-tap không side effect
```

*Source: v1.4.199 release notes, Mobile section, wakii-dev/wakii repo,
retrieved 2026-09-08.*

(In English: "Gate resolve: options become choice buttons; free-form becomes
multiline plus confirm; a failed resolve refreshes cleanly, re-tap has no
side effect.")

Reading it clause by clause: option-style questions render as choice buttons,
with the choices already sitting on the resolve screen. Free-form questions
open a multiline field and require a confirm before the answer goes out. The
last two clauses are the guard rails: if a resolve fails, the screen
refreshes cleanly instead of half-hanging; re-tapping has no side effect —
tapping the same notification twice does not resolve twice, and a closed gate
stays closed under later taps.

And when you have answered, the loop does not go silent: `gate-closed`
arrives with the outcome attached. In the code, this notification's body is
taken from the gate's resolution:

```bash
body: event.kind === 'open' ? '' : (event.gate.resolution ?? '')
```

*Source: src/main/runtime/runtime-gate-transition-notifications.ts,
wakii-dev/wakii repo, retrieved 2026-09-08.*

So you learn both that the wait is over and what answer closed it — without
reopening the app to check.

## The desktop side: ⌘⇧⌫ deletes the workspace you hover in the sidebar

Notifications cover the waiting half; the other half of this post is a
cleanup shortcut on desktop. The commit that introduced it states both the
key and the design reasoning — an excerpt from the message:

```bash
$ git show 7b9529da22 -s --format=%B
Add keyboard shortcut for workspace deletion (#16271)

Default Mod+Shift+Backspace (⌘⇧⌫ on Mac) lets users delete the hovered
worktree or folder workspace immediately. The shortcut targets the
sidebar hover state rather than requiring focus, and avoids terminal
pane D-based split shortcuts on all platforms.
```

*Source: commit 7b9529da22 "Add keyboard shortcut for workspace deletion
(#16271)", wakii-dev/wakii repo — landed in v1.4.193, present in the v1.4.198
and v1.4.199 tags, retrieved 2026-09-08.*

Three details in that message repay reading. First, the default binding is
Mod+Shift+Backspace — ⌘⇧⌫ on a Mac — acting immediately on the hovered
worktree or folder workspace. Second, the target is the sidebar hover state,
not focus: whichever row your cursor is over is the row the shortcut acts on,
with no click-to-select first. Third, why not the letter D for delete: D is
already taken by the terminal pane's split shortcuts on all platforms, so the
binding picks another combination to stay out of that key's way. The
limitation sits right there too: the shortcut is bound to the sidebar hover
state, which makes it a workspace-list cleanup tool, not a global delete
command.

Both halves of this post serve the same habit: spend less time watching the
system, keep the time for the decision itself. The gate details live in the
[FAQ](/docs/faq/); why gates exist at all is the subject of [decision
gates](/blog/decision-gates-safe-ai-agents/). To see the lifecycle yourself:
let a pipeline run until it opens a gate, step away from the screen, and wait
for the notification instead of the screen — tap in, answer, and watch
`gate-closed` close the loop.
