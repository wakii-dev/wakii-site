---
title: "Your first agent team has no setup step"
description: "Open Wakii for the first time and the superpowers kit installs itself into ~/.claude/ — skills, nine agents, and the story-* command-line tools — without touching your existing config. This post takes the zero-setup mechanism apart: what ships in the kit, why re-running never breaks anything, and how to verify every claim with real commands."
pubDate: "2026-08-20"
category: "tutorial"
tags: ["workflow", "agents", "autonomy"]
draft: false
---

Developer tools usually open with a three-screen README: install this dependency,
run that init script, remember to export this environment variable. Wakii runs
the other direction — the first time you open the app, the agent machinery is
pre-assembled and installs the rest onto your machine by itself. No wizard, no
confirmation steps, no config file to edit. This post goes into the mechanism:
which kit gets installed, where it lands on disk, and why running it again any
number of times never damages your existing setup.

TL;DR:

- On first launch, the workflow kit installs itself into `~/.claude/` — there is no step for you to do.
- The kit has three layers: skills (loaded on demand by agents), definitions for nine agents, and the `story-*` command-line tools.
- The kit is idempotent: re-running never duplicates anything, and it stays in sync with the app.
- Every claim below comes with a command you can run to check it on your own machine.

## First install, with no install step

The process documented in [getting started](/docs/getting-started/) has exactly
these moves: get the app, open the app, look at the activity bar on the right,
click the ⚡ icon. The "first run" section then says the one sentence worth
memorizing: "There's no step 5, really." That's not lazy documentation — there
is simply nothing left to instruct.

Concretely: the first time Wakii starts, the workflow kit — the skills, the
agent definitions, and the `story-*` command-line tools — installs itself into
`~/.claude/` on your machine. No extra permissions, no manual script, no PATH
editing. By the time you open the ⚡ Superpowers panel, everything sits where it
should: the ⚡ Workflow tab for a single run from idea to code, the 🌳 Story tab
for tracking larger projects.

Anyone who has onboarded an internal tool knows environment setup burns the
first afternoon. Here that part moved into the app's first launch — and more
importantly, it runs from the same source as the app, so there is no gap between
what the docs say and what your machine has.

For a whole team the effect is sharper: every machine gets the same kit at the
same version. The classic "works on my machine" flavor caused by a version-skewed
kit disappears — if a difference shows up, the cause lives somewhere easier to find.

## Inside the self-installing kit

The kit splits into three layers, each serving a different kind of work:

```ascii
~/.claude/
├── skills/        ← knowledge agents load on demand (workflows, checklists)
├── agents/        ← definitions for 9 specialized agents
└── bin/story-*    ← 24 command-line tools for the story lifecycle
```

The skills layer is process knowledge that agents read when they need it — never
loaded into every session, only when the work calls for it. The agents layer is
nine specialized roles, from impact analysis to code review — each with its own
powers, deliberately kept apart. The command-line layer is the `story-*` tools:
creating worktrees, raising gates, checking whether a story is alive or stalled
— operations that both humans and agents use.

You don't have to take the post's word for it. On any machine with Wakii
installed, this command shows the kit's command-line tools (real output, as of
2026-09-07):

```bash
$ ls ~/.claude/bin | grep '^story-' | head -8
story-attempt
story-compact-recovery
story-dashboard-server
story-dashboard.html
story-diff-review
story-launch
story-memory
story-memory-fuse
```

Twenty-four command-line tools is the number as of this writing — it grows with
new app features, so the rule is read-it-at-the-time, don't memorize it. The
full table of agent roles lives in [agents & kit](/docs/agents-and-kit/).

## What idempotent means in practice

"Idempotent" is the kind of word that gets skimmed past. Here it means something
concrete: run it a second time, a tenth, a hundredth — the end state is the same
as running it once. Three practical consequences.

One, restarting is safe. Your existing config in `~/.claude/` — if you have any
— doesn't get clobbered; the kit "never duplicates your local config," exactly
as getting started states.

Two, when the app updates, the kit follows. There is no separate "upgrade the
kit" step — the machinery and the app always ship as one, so the docs and your
disk never disagree about which commands exist.

Three, debugging loses a layer. A large share of "why does this behave
differently here" bugs in dev tooling comes from setup state drifting between
machines. Here, installed state is a function of the app version — same version,
same state, on every machine.

## Nine agents, one panel

The self-installing kit is just the floor. What rises above it is how the kit
shows up in the app: the ⚡ Superpowers panel with exactly two tabs. The ⚡
Workflow tab covers a single run from idea to code. The 🌳 Story tab handles
larger projects — split into sub-features, stacked in tiers, run in parallel,
settled through gates.

If you want to see this machinery working end-to-end on a real feature, the post
[story workflow: from idea to release](/blog/story-workflow-idea-to-release/)
walks the same process on a live feature. To try it yourself: open Wakii, hit
⚡, and start from a one-line idea.

The full path from install to first agent lives in
[getting started](/docs/getting-started/) — and as promised, the "install" part
is the shortest section in this post: it doesn't exist.
