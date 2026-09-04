---
title: Superpowers panel
description: The mission control for your agent team — Workflow and Story tabs, bracket canvas, and Story Ops gates.
order: 1
---

The **Superpowers panel** is the mission control for Wakii's built-in agent
team. It ships bundled with the app — no setup required — and lives in the
right sidebar.

## Opening the panel

Look for the ⚡ (zap) icon in the **activity bar on the right side** of the
window. Click it to open the panel.

If the right sidebar is hidden, toggle it with `Cmd/Ctrl + L`
(**Toggle Right Sidebar**). The panel is a bundled plugin, enabled by
default — there is nothing to install.

## The two tabs

The panel has exactly two tabs: **⚡ Workflow** and **🌳 Story**.

### ⚡ Workflow tab

The Workflow tab is where you launch a run. It assembles the start prompt for
your coding agent from a few choices:

- **Intent** — what kind of work is this? *New feature*, *Continue work*, or
  *Quick fix*. The intent picks the workflow shape (and skips planning phases
  that don't apply, e.g. quick fixes).
- **Modes** — toggles that shape the run: *Autonomous* (gates self-approve
  after checkpoints), *Refine idea*, *Simplify code*, *Linear audit log*
  (reproduction-grade comments on your Linear issue), *Mindset Browser*
  (the agent works browser-first, not CLI-first), and *Plan only*.
- **Subagents** — a grid of the 9 specialist agents (P0 analyst, Designer,
  Spec critic, Plan critic, Code reviewer, Verifier, Security, Rollback
  fixer, Dev executor). All 9 are on by default; switch any off to slim the
  team down.
- **Execute (Phase 4)** — how the plan gets built: *Delegate* (a worker
  agent per task), *Inline* (the agent implements in its own session), or
  *Superpowers* (the executing-plans loop).

Hit **Start** and the assembled prompt goes to your coding agent.

### 🌳 Story tab

The Story tab tracks large features managed as **stories** — an epic broken
into sub-features with dependencies:

- **Create story** / **Approve story** / **Launch SFs** — the story
  lifecycle, from draft to parallel execution.
- **Bracket canvas** — a live SVG graph of your story: the epic node, its
  sub-features, dependency edges, and per-node status colors, with live
  agent activity and progress.
- **🛠 Story Ops** — a strip of ops actions for a running story: launch the
  next sub-feature, stats, the **watchdog** (auto-resumes stalled
  sub-features), **verify** (runs the full gate check), and attempt history.

## Story Ops gates

Story Ops checks a story against its definition-of-done, one gate at a time:

| Gate | Checks |
|---|---|
| **B0** | Browser test — the agent actually opened the app and walked the flow |
| **B1** | Code + tests pass |
| **B2** | Plan checkboxes ticked |
| **B3** | Independent review done |
| **B4** | Branch merged to the story branch |
| **B5** | Linear issue set to Done |

The verifier reports one verdict per story: `COMPLETE`, `READY-TO-DONE`,
`INCOMPLETE`, `VIOLATION`, or `NOT-LAUNCHED`.

## Next

See [Story workflow](/docs/story-workflow/) for the full epic-to-PR flow,
and [Agents & kit](/docs/agents-and-kit/) for who those 9 agents are.
