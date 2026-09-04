---
title: FAQ
description: What Wakii is, how it differs from upstream Orca, what you need to build it, and where the Superpowers panel lives.
order: 4
---

### What is Wakii?

Wakii is an agentic IDE — a desktop environment where a team of AI agents
plans, builds, reviews, and verifies software in parallel, under hard gates.
It is a fork of [Orca](https://github.com/stablyai/orca) (MIT) with a bundled
superpowers workflow kit on top.

### How is it different from upstream Orca?

Orca gives you parallel agentic development workspaces and orchestration.
Wakii adds the **story workflow**: impact analysis before code, specs and
plans published to Linear, a 9-agent team with adversarial review gates, a
watchdog that auto-resumes stalled sub-features, and one clean PR per story.

### What do I need to build it from source?

Node 24 and pnpm 12, plus git. Then it's `pnpm install` and `pnpm dev` —
the full walkthrough is in [Getting started](/docs/getting-started/).

### Where is the Superpowers panel?

In the app, click the ⚡ icon in the activity bar on the right side of the
window. If the sidebar is hidden, `Cmd/Ctrl + L` toggles it. The panel ships
bundled and enabled by default — nothing to install. Details in
[Superpowers panel](/docs/superpowers-panel/).

### Do I need to configure anything before my first run?

No. The workflow kit — skills, agent definitions, and the `story-*` command
line tools — installs itself into `~/.claude/` the first time the app runs,
and stays in sync afterwards.

### Is documentation available in Vietnamese?

Yes — use the **EN | VI** switcher in the docs navigation. Every page is
available in both languages.

### What's the license?

Wakii is MIT-licensed, as is the bundled superpowers kit by Jesse Vincent
([obra/superpowers](https://github.com/obra/superpowers)). Orca upstream is
MIT as well.
