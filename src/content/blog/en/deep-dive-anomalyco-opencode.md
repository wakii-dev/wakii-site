---
title: "OpenCode: a vendor-independent coding agent for your terminal"
description: "A deep dive into OpenCode's architecture — 205,815 stars, MIT: one core that runs against any model provider, per-agent permission rulesets, and measurable compaction thresholds, read straight from the code on GitHub."
pubDate: "2026-10-01"
category: "tech"
tags: ["agents", "terminal", "architecture", "oss"]
draft: false
heroImage: "/blog/heroes/deep-dive-anomalyco-opencode.png"
---

Most coding agents you meet today exist to sell a model: the harness follows a vendor, and the vendor decides what you may run. OpenCode takes the opposite route — it builds the shell, not the model: any provider plugs in, any client can drive it, and the whole architecture sits in public on GitHub where anyone can read it. Per the GitHub API on 2026-09-08, the project stands at 205,815 stars, 26,857 forks, MIT licensed, and it pushed code the same day as the probe. This post dissects that architecture from the code itself, not from press releases — the perspective of one specific repo, unlike the [50-project map](/blog/agentic-landscape-50-projects/) written earlier.

TL;DR — what you will read here:

- OpenCode is a coding agent that lives in your terminal and is vendor-independent: the model catalog comes from models.dev, with no single provider locked in
- One agent core (TypeScript, a monorepo of 30+ packages) serves three surfaces: the terminal TUI, a BETA desktop app, and ACP for editors
- Three-level allow/ask/deny permissions attach to each agent — the plan agent is read-only by default, enforced in code rather than urged in a prompt
- Context is a resource with thresholds: compaction hard-codes 20,000/40,000-token numbers right in the source
- A dense shipping cadence: 10 releases in 15 days, three of those days shipping two releases

## One core, three surfaces

Open the repo tree at commit d6855b6 and the `packages/` directory lists over 30 entries: `tui` (the terminal UI), `desktop` (a BETA app for macOS/Windows/Linux), `server`, `sdk`, `plugin`, `protocol`, `llm`... The real agent core lives in `packages/opencode/src/` — the home of the modules that decide behavior: `session`, `tool`, `skill`, `permission`, `worktree`, `mcp`, `provider`.

```
                    ┌────────────────────────────┐
                    │      agent core (TS)       │
                    │ session · tool · skill     │
                    │ permission · worktree      │
                    └─────────────┬──────────────┘
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
   TUI (terminal)          desktop app (BETA)        ACP service
   the default seat        DMG/EXE/AppImage          editors plug in
```

Three surfaces, one core: the same session-tool-permission loop runs in the terminal and in an editor alike. The third surface is the interesting one — the `acp/` directory holds a complete Agent Client Protocol service (`session.ts`, `permission.ts`, `tool.ts`, `usage.ts`), meaning OpenCode can serve as the agent backend for external editors instead of staying locked inside its own TUI. A `worktree/` module also sits at the core layer — working-tree isolation is a first-class citizen here, not a bolted-on feature.

## Vendor independence as an architectural decision

The README introduces the project in one sentence: "The open source AI coding agent." (source: README of anomalyco/opencode, retrieved 2026-09-08). Short, but the "open source" there pairs with an MIT license — per the GitHub API on 2026-09-08 — so you can read every layer, including the one most products hide: how the harness picks its model.

The answer lives in `provider/provider.ts`: the model catalog and provider metadata load through a `ModelsDev` module — an open model database at models.dev, owned by no vendor. The file even carries comments handling real-world details like region prefixes (`us.`, `eu.`) and each vendor's model naming quirks.

```
// packages/opencode/src/provider/provider.ts
import { ModelsDev } from "@opencode-ai/core/models-dev"
```

In other words: supporting a new provider is not code written in this repo, it is data updated in a shared catalog. That is how a vendor-independent terminal agent keeps its model-coverage speed without bloating the codebase — and part of why this project tops the harness group in the 50-project map.

## Permissions attach to the agent, not to pleading

This is the most interesting part for anyone building an agent system. Every agent in OpenCode is a data structure with a `permission` field of type `PermissionV1.Ruleset` — access rules sit next to the agent definition, in the same file, read by the machine before the agent runs.

Two built-in agents ship out of the box (per the README): **build** — full access for development work, and **plan** — read-only, asking permission before shell commands. A **general** subagent handles multistep searches, invoked with `@general` in a conversation. The read-only nature of plan is not a soft instruction buried in the system prompt; it is a hard ruleset in `agent/agent.ts`:

```
const readonlyExternalDirectory = {
  "*": "ask",
  ...Object.fromEntries(whitelistedDirs.map((dir) => [dir, "allow"])),
} satisfies Record<string, "allow" | "ask" | "deny">
```

(source: agent/agent.ts at commit d6855b6). Three levels — allow/ask/deny: every external directory defaults to "ask", while whitelisted areas — skill directories, the temp dir, the truncate tool's glob — are pre-"allow"ed. A role that needs to write code gets more; a role meant to only read is stopped at the permission layer, before the LLM has a chance to "forget".

| Agent | Default permissions | Used for |
|---|---|---|
| build | full access | writing code, running commands |
| plan | read-only, "ask" for shell | analysis, codebase exploration |
| general | subagent | multistep search |

## Context as a resource with thresholds

Long agent sessions fill the context window — a problem often handled by feel ("summarize when it overflows"). OpenCode hard-codes the numbers right into `session/compaction.ts`:

```
export const PRUNE_MINIMUM = 20_000
export const PRUNE_PROTECT = 40_000
const TOOL_OUTPUT_MAX_CHARS = 2_000
const PRUNE_PROTECTED_TOOLS = ["skill"]
```

(source: session/compaction.ts at commit d6855b6). Read directly: when pruning, keep at least 20,000 tokens; a protected zone of 40,000 tokens; tool output is cut at 2,000 characters; the output of the skill tool is exempt from pruning. Compaction policy becomes something you can review, argue about, and regression-test — not the emergent behavior of a long prompt.

## Shipping cadence: 10 releases in 15 days

Release cadence says more about the process inside than any manifesto does. The 10 most recent releases, per the GitHub API on 2026-09-08:

| Tag | Release date |
|---|---|
| v1.18.29 | 2026-09-04 |
| v1.18.28 | 2026-09-04 |
| v1.18.27 | 2026-09-02 |
| v1.18.26 | 2026-09-01 |
| v1.18.25 | 2026-08-28 |
| v1.18.24 | 2026-08-28 |
| v1.18.23 | 2026-08-25 |
| v1.18.22 | 2026-08-24 |
| v1.18.21 | 2026-08-21 |
| v1.18.20 | 2026-08-21 |

Ten releases from August 21 to September 4, three of those days (Aug 21, Aug 28, Sep 4) shipping two releases. For a repo at 205,815 stars (as of 2026-09-08), this cadence means the release pipeline is automated to the point of shipping on nearly every working day — the same family of cadence as claude-code at the top of the group, and the opposite of aider frozen at the bottom.

## What Wakii learns

- **ADOPT** — explicit per-agent permission profiles. Wakii already has worktree isolation and the "the doer never approves its own work" principle in its 9-agent team; the concrete proposal: declare a permission profile next to each agent definition in the kit (code-reviewer and verifier: deny edit; task-executor: allow within the worktree) so the separation of powers is machine-checkable, not only prompted. Evidence: the build/plan table and the `readonlyExternalDirectory` ruleset above.
- **DIRECTION** — measurable compaction thresholds. Wakii's watchdog auto-resumes long stories from the last good state; as multi-day stories become more common, an explicit 20,000/40,000-token compaction policy is a direction worth bringing into the kit rather than letting each agent improvise.
- **WATCH** — ACP (Agent Client Protocol). OpenCode ships a complete ACP service for external editors to plug into; this is a strategic decision under active watch. The condition to re-evaluate: once ACP covers the editor layer broadly, revisit standardizing the agent-editor interface.
- **N/A** — the BETA desktop app and a README in 22 languages: distribution problems of a 205,815-star project, not Wakii's problems at this stage.

Agent separation of powers in Wakii's kit is covered in [agents & kit](/docs/agents-and-kit/); long-running stories and the watchdog live in [story workflow](/docs/story-workflow/).

To run this do-and-decide separation on your own machine, grab Wakii and start with [getting started](/docs/getting-started/) — let the agents run, you keep the deciding.
