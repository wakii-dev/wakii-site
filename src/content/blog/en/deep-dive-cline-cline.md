---
title: "Cline: the coding agent that lives inside VS Code"
description: "A deep dive into Cline's architecture — 67,661 stars, Apache-2.0: per-run checkpoints as private git refs, transactional restore, a Plan/Act boundary enforced at the tool layer, and one agent core powering CLI, desktop, and SDK."
pubDate: "2026-10-06"
category: "tech"
tags: ["agents", "architecture", "git", "oss"]
draft: false
heroImage: "/blog/heroes/deep-dive-cline-cline.png"
---

Most coding agents pick the terminal as their home: claude-code, OpenCode, and gemini-cli all live in a shell tab. Cline takes the other road — it lives inside the editor, right next to the code you have open. That sounds like a distribution detail, but the source says otherwise: living in an editor forces Cline to solve three problems terminal agents rarely face — undoing safely inside the user's own workspace, drawing a hard line between planning and acting, and extending capability without leaving the IDE window. This article dissects those three mechanisms from the code itself — 67,661 stars, Apache-2.0 licensed, still pushing code on the day of the probe, per the GitHub API on 2026-09-08.

TL;DR — what you'll read:

- Cline is an open source coding agent (Apache-2.0) born as a VS Code extension, now running on a shared agent core that serves the CLI, a desktop app, and an SDK
- Checkpoints: every agent run snapshots the workspace into a private git ref shaped like `refs/cline/checkpoints/<session>/<run>` — step-level undo that never touches your git
- Restoring a checkpoint is a transaction: untracked files get stashed before cleanup, and a failure rolls back
- Plan/Act: Plan mode blocks file-editing commands at the tool layer — before the user is even asked to approve

## Inside the editor, with the core outside it

Cline started in 2024 as a VS Code extension, and the extension remains its most familiar face. But open the repo tree at commit `f5af821` (2026-09-08) and the architecture has moved on: the agent core lives in `sdk/packages/core`, while `apps/vscode`, `apps/cli`, and `apps/examples/desktop-app` are surfaces sharing that core. The README introduces it in one line: "The open source coding agent in your IDE and terminal." (source: [README of cline/cline @ f5af821](https://github.com/cline/cline/blob/f5af821/README.md), retrieved 2026-09-08).

```
            sdk/packages/core — shared agent core
                        │
   ┌──────────────┬─────┴────────┬─────────────┐
   ▼              ▼              ▼             ▼
 VS Code       CLI            desktop        SDK
 extension     cli-v3.0.61    v0.0.23        @cline/sdk
 (apps/vscode)
```

Four open surfaces, one closed: the JetBrains plugin line states "Currently we are not open-sourcing JetBrains plugins" — same index table. That asymmetry is worth more attention than the star count: the "lives in your IDE" part is the layer Cline keeps as interface, while the machinery — checkpoints, guards, the run loop — has been pushed down into a shared core. For anyone following the [map of 50 agentic coding projects](/blog/agentic-landscape-50-projects/), this is the mirror image of claude-code: an open core with one closed distribution door.

## Checkpoints: one private git ref per run

This is the most direct answer to "how do you undo inside someone else's workspace?". A terminal agent usually works in its own tree; an agent inside the editor modifies the very tree you have open, with your own uncommitted changes sitting alongside. Cline's answer is checkpoints: before each run, the workspace state is captured as a private git ref that lives on no branch of yours. In `checkpoint-hooks.ts`, each checkpoint is an entry holding a `ref`, `createdAt`, and a `runCount`, retained at:

```
refs/cline/checkpoints/${sessionId}/${entry.runCount}
```

(source: [checkpoint-hooks.ts @ f5af821](https://github.com/cline/cline/blob/f5af821/sdk/packages/core/src/hooks/checkpoint-hooks.ts)). The refs sit under the `refs/cline/` namespace — invisible to your `git branch`, unobtrusive to normal gc, with one range per session numbered by run. Undoing means checking out an old ref, not rewriting your commit history.

The harder part is restoring without destroying user data. Cline wraps restore in a transaction with commit/rollback semantics — `beginWorktreeRestoreTransaction` in `checkpoint-restore.ts`. The author's own comment explains why: "git stash create omits untracked files, but checkpoint restoration runs git clean -fd" (source: [checkpoint-restore.ts @ f5af821](https://github.com/cline/cline/blob/f5af821/sdk/packages/core/src/session/checkpoint-restore.ts)). In other words: a plain stash misses untracked files, while a restore must run clean — so Cline uses `stash push --include-untracked`, parks the object behind a short-lived private ref, and only "commits" the transaction once the restore completes. A small detail, but exactly the kind that separates "undo works in demos" from "undo works on real workspaces".

## Plan/Act: the hard line lives at the tool layer

The second problem for an in-editor agent: when is it discussing, and when is it acting? Cline splits this into two toggleable modes — Plan to explore the codebase, ask clarifying questions, and lay out a strategy; Act to execute, with every file edit and command still passing approval (described in the [README @ f5af821](https://github.com/cline/cline/blob/f5af821/README.md)). What's worth learning is not the existence of two modes but where the boundary sits: not a line in the system prompt, but a `beforeTool` hook that runs before both the tool policy layer and the user approval layer:

```ts
if (context.tool.name !== DefaultToolNames.RUN_COMMANDS) {
	return undefined
}
// ...
const blocked = findFileEditingCommand(command)
```

(source: [command-guard-extension.ts @ f5af821](https://github.com/cline/cline/blob/f5af821/sdk/packages/core/src/extensions/tools/command-guard-extension.ts)). `findFileEditingCommand` scans shell commands for file-editing operations; when one is blocked, the model receives the plan-mode message as the tool result, and the run continues — the file header puts it plainly: "the user is never asked to approve a command that would only fail". Nobody clicks approve on a command destined to be rejected. The same hook covers both the built-in tool and host-provided replacements (like the extension's terminal-backed tool) — the policy runs in one place instead of a flag threaded through every layer.

Compare OpenCode — [analyzed earlier](/blog/deep-dive-anomalyco-opencode/) — which binds permissions to agent roles (build full-access, plan read-only). Cline binds constraints to the state of one session: you switch Plan/Act mid-flight, and the system guarantees both branches of the toggle are safe. Two different cuts, same principle: the constraint lives in code, not in promises.

## Four product lines in seven days

The release cadence continues the shared-core story: one core means several surfaces ship at once. The 10 most recent releases, per the GitHub API on 2026-09-08:

| Tag | Release date |
|---|---|
| desktop-v0.0.23 | 2026-09-03 |
| desktop-v0.0.23-beta.1 | 2026-09-03 |
| v4.1.17 | 2026-09-02 |
| sdk/sdk/v0.0.82 | 2026-09-02 |
| desktop-v0.0.22 | 2026-09-02 |
| cli-v3.0.61 | 2026-09-02 |
| desktop-v0.0.22-beta.1 | 2026-09-01 |
| desktop-v0.0.21 | 2026-08-31 |
| desktop-v0.0.21-beta.2 | 2026-08-31 |
| desktop-v0.0.20 | 2026-08-28 |

10 releases in seven days (Aug 28 → Sep 3), spread across four tag lines: desktop, extension, CLI, SDK — with the extension itself on an even steadier beat: 8 versions from v4.1.10 to v4.1.17 in 20 days (Aug 14 → Sep 2). The desktop app still sits at 0.0.x with a beta preceding every stable — exactly the "extension maturing into its own product" phase the 50-project map noted. The repo opened on 2024-07-06 (per the GitHub API on 2026-09-08); two years later, the tell is still that all four surfaces ship together, not that any one of them ships.

How Wakii organizes the "discuss — act — verify" split inside a long story — a plan approved before the executor runs, gates B0–B5 blocking before merge — is described in the [story workflow](/docs/story-workflow/) docs; the 9-agent team keeping each role on its side of the line lives in [agents & kit](/docs/agents-and-kit/).

## What Wakii learns

- **ADOPT** — Per-run checkpoints with transactional restore. Wakii already has rollback-fixer and a watchdog resuming from "last good state", but the granularity is per-task commits; Cline shows you can snapshot each run into a private ref (`refs/cline/checkpoints/...`) and wrap the restore in a stash-including-untracked transaction so undo never destroys the user's untracked files. Concrete proposal: the task-executor preflight captures a private ref before each batch of write operations, and rollback-fixer restores through exactly that kind of transaction. Evidence: the `refs/cline/checkpoints` snippet and the `stash create`/`clean -fd` comment above.
- **DIRECTION** — A hard mode boundary at the tool layer. Wakii already separates plan/execute at the story level (plan-critic approves before the executor starts), but mid-task an executor can still change course without any gate. Cline's guard suggests the direction: while a task sits in a plan-awaiting state, mutating tools are rejected at the tool layer with a named-mode error — the model reads the error and returns to the intended flow. Unlike the per-role permission profiles already ADOPTed from the OpenCode article, this is a constraint on the state of the same agent.
- **WATCH** — An open core shipping alongside one closed surface. Cline opens the core plus CLI, desktop, and SDK but keeps the JetBrains plugin out of the source; watch whether "open agent core, closed distribution" becomes an industry default — if it does, Wakii's practice of publishing both the 9-agent team and the 20 skills should keep core and distribution open together.
- **N/A** — Scheduled agents and Telegram/Slack/Discord connectors. Those are the chatops distribution problems of a standalone agent product; Wakii solves a different one — supervising stories inside the panel and on mobile, with no external chat channel needed.

Want an agent team with gates and separated review running on your real workspace? Download Wakii and start from [getting started](/docs/getting-started/) — let the agents work, keep the deciding.
