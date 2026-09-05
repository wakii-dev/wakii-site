---
title: Getting started
description: Build Wakii from source and meet your agent team — from clone to the ⚡ Superpowers panel in minutes.
order: 0
---

Wakii is a desktop app. This guide takes you from an empty folder to a
running app with the **Superpowers panel** open — no configuration along
the way. Every step below is executed verbatim on a clean checkout before
it lands in these docs.

> **Downloads are live for macOS.** Grab the ready-made build from the
> [download page](/download/), or
> [follow releases on GitHub](https://github.com/wakii-dev/wakii/releases)
> to hear about new builds (Windows included) first. Building from source
> (below) still works everywhere.

## Prerequisites

- **Node.js 24** — [nodejs.org](https://nodejs.org) or your version manager
- **pnpm 12** — `corepack enable` ships it, or `npm install -g pnpm`
- **git**

Check your versions:

```bash
node --version   # v24.x
pnpm --version   # 12.x
```

## 1. Get the source

Clone the repository and enter it:

```bash
git clone <repo-url> wakii
cd wakii
```

The repo URL is the **github** link in the [site footer](/) — it points at
the Wakii fork on GitHub.

## 2. Install dependencies

```bash
pnpm install
```

This pulls the JavaScript dependencies and builds the native modules
(terminal emulation, file watching) for your platform. The first run takes
a few minutes; later runs are fast.

## 3. Run the app

Two options:

```bash
pnpm dev         # development — hot reload, quickest way to look around
```

or the production build:

```bash
pnpm build       # compile the app + native pieces
pnpm start       # launch the built desktop app
```

The Wakii window opens.

## 4. Open the Superpowers panel

In the **activity bar on the right side** of the window, click the **⚡
(zap) icon**. That's the Superpowers panel — your agent team's mission
control, bundled with the app and enabled by default.

If the right sidebar is collapsed, `Cmd/Ctrl + L` toggles it back.

You'll see two tabs:

- **⚡ Workflow** — launch a run: pick your intent, tune modes, and start
  your coding agent with a fully-assembled prompt.
- **🌳 Story** — track large features as stories: bracket canvas, Story
  Ops gates, and the watchdog.

## 5. First run — nothing to set up

There's no step 5, really. On first launch the workflow kit — the skills,
agent definitions, and `story-*` command-line tools — installs itself into
`~/.claude/` automatically. It stays in sync with the app and never
duplicates your local config.

Where to next?

- [Superpowers panel](/docs/superpowers-panel/) — what each tab and toggle does
- [Story workflow](/docs/story-workflow/) — the full idea-to-PR pipeline
- [Agents & kit](/docs/agents-and-kit/) — meet the 9 specialists
