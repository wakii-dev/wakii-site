---
title: "DeepSeek Harness: the agent architecture inside an open model"
description: "Dissect the everything-is-a-plugin architecture of DeepSeek Harness — 55 Cordis packages, twelve releases in 25 days — and the patterns Wakii is taking from it."
pubDate: "2026-10-01"
category: "tech"
tags: ["agents", "architecture", "oss"]
draft: false
heroImage: "/blog/heroes/deep-dive-deepseek-ai-deepseek-harness.png"
---

On 2026-08-13, DeepSeek AI published the deepseek-harness repository. Twenty-six days later it crossed 215,800 stars (per the GitHub API on 2026-09-08). But the star count is not the most interesting part. The interesting part is the repo's own tagline: "Everything is a Plugin" — the entire agent harness, including the agent loop, the tool registry, and the session log, is built as plugins replaceable from configuration, running on the Cordis microkernel. This article reads the repo's actual code and architecture docs to show how that design works in practice, and what anyone building agents can borrow from it.

**TL;DR**

- No privileged core: the model adapter, tool registry, session log, and agent loop are all plugins; a `dsh` profile is just an ordered list of bundles, each layer patchable by the next.
- The "model-visible means logged" invariant: anything that reaches a model request must be reconstructable from the session log — a runtime assertion enforces it.
- Guards run advisory: detect a model repeating the same tool call, then remind it in context — no call is vetoed.
- Shipping pace: 12 releases in 25 days, all alpha/rc, none stable — backed by a per-file 100% coverage gate and public postmortems.
- What Wakii borrows: the advisory guard for its watchdog, and the log-first invariant as a direction for evidence.

## No privileged core — everything is a plugin

Cordis — the framework dsh vendors directly into the repo — provides three things: plugins contribute services, typed events, and reversible effects to a shared context. The repo's architecture doc states the principle in one sentence: "Every part of the product is a plugin, including the model adapter, the tool registry, the session log, and the agent loop itself" (DeepSeek Harness, [docs/architecture.md](https://github.com/deepseek-ai/deepseek-harness/blob/c389f96/docs/architecture.md)). There is no privileged core to patch — because there is no core; to extend dsh you mount a plugin beside the others, and when a plugin unloads, its registrations unwind.

The runtime configuration is a plugin tree composed at boot from ordered layers. A profile (`web`, `headless`, `sdk`, `sdk-minimal`, `acp`) lists the bundles it stacks; each bundle declares itself in `package.json` under a `dsh` field; each layer patches lower layers' config rows by id. The table below shows how far the idea reaches (source: [AGENTS.md](https://github.com/deepseek-ai/deepseek-harness/blob/c389f96/AGENTS.md) @ `c389f96`, per the GitHub API on 2026-09-08):

| Package group | Owns |
|---|---|
| `core/` — session, system-prompt, tools, agent, agent-loop | the product spine: event log, prompt assembly, tool registry, the loop |
| `guard/` | loop hygiene: repeat-call detection, timeout policy |
| `plan/`, `todo/`, `goal/` | plan mode as logged state; the `todo_write` tool; per-session objectives |
| `skill/`, `mcp/`, `acp/` | skill registry; the MCP protocol; an automation-only ACP server |
| `subagent/`, `workflow/`, `jobs/` | delegation to child agents; background workflows on worker threads |
| `sandbox/`, `fs/`, `shell/` | the execution world: native Landlock, filesystem policy, bash |

`packages/` holds 55 entries split into functional groups like these — each group a seam swappable from configuration. One provider swap changes the whole product: point filesystem and subprocess at a remote sandbox, and Bash, PTY, and LSP move into that same execution world with no provider forks.

## What events carry a turn

dsh defines a step as one model request plus the tools it calls; a turn is zero or more steps. The whole lifecycle is a chain of named events — this diagram condenses the [architecture doc](https://github.com/deepseek-ai/deepseek-harness/blob/c389f96/docs/architecture.md):

```text
turn/start
  agent/pre-step        # rejects or rewrites messages before the model sees them
  step/start
    agent/request → llm/stream → agent/assistant-stream
    tool/call → tools/pre-execute → tools/execute → tools/post-execute
  step/end
  agent/turn-stopping   # serial, no next()
turn/end
```

Three events — `agent/pre-step`, `agent/request`, `llm/stream` — are waterfalls: a listener must call `next()` to pass control on, and holds it to intercept. `agent/pre-step` may also rewrite the claimed messages before the model sees them — exactly where the guard in the next section takes its stand.

## If the model can see it, the log must have it

The session log is append-only; `deriveMessages()` projects model history from the log — no parallel history exists. The invariant is stated in one sentence in the docs: "Anything that reaches a model request must be reconstructable from the log" — and the repo ships a runtime assertion to watch itself ([docs/architecture.md](https://github.com/deepseek-ai/deepseek-harness/blob/c389f96/docs/architecture.md)). The design consequence: to add any new model-visible input you must add a new session event — there is no shortcut.

Session data persists as versioned JSONL (`session.vN.jsonl`, zstd-compressed); committed generations are never renamed, overwritten, or deleted — migrating means adding a successor file, not editing the old one. Transparency comes with it: four public postmortems live in `docs/postmortem/`, number 0004 documenting a misclassification of child-process failures in the Landlock sandbox.

## Guards that watch the loop without vetoing it

`guard/repeat-tool-reminder` is the tightest example of the philosophy. The package counts consecutive repeats of the same tool call; when a threshold is crossed — 3, then 5, then 8 by default — it injects a reminder into the next request's context (short excerpt for analysis, [source @ `c389f96`](https://github.com/deepseek-ai/deepseek-harness/blob/c389f96/packages/guard/repeat-tool-reminder/src/index.ts)):

```ts
export interface Config {
  /** Consecutive-repeat counts that trigger a reminder (default `[3, 5, 8]`). */
  thresholds?: number[]
  /** Tool-name patterns to track; empty means every tool is tracked. */
  include?: string[]
  /** Tool-name patterns transparent to the chain (neither count nor reset). */
  exclude?: string[]
}

const PLUGIN_SOURCE: MessageSource = { kind: 'plugin', plugin: 'repeat-tool-reminder' }
```

Three details matter. One: the detector only enriches post-execute decisions — no veto, no rewriting of any call. Two: the reminder carries a plugin source label; the code comment explains the label is load-bearing, because unlabeled context would render as a user prompt in derived history. Three: a misconfiguration fails at plugin load time — "never a silent fall-back", in the author's own comment. Guarding without seizing the model's decision rights, and loud rather than silent when configured wrong.

## Twelve releases in 25 days — none stable

The repo was created on 08-13; by 09-08 it had 12 releases per the GitHub API on 2026-09-08, densest in late August:

| Tag | Published |
|---|---|
| `dsh-v0.1.1-rc.1` | 2026-08-21 |
| `dsh-v0.1.2-alpha.1` | 2026-08-27 |
| `dsh-v0.1.2-alpha.3` | 2026-08-31 |
| `dsh-v0.1.2-alpha.5` | 2026-09-01 |
| `dsh-v0.1.2-rc.1` | 2026-09-03 |
| `dsh-v0.1.3-alpha.1` | 2026-09-04 |
| `dsh-v0.1.3-alpha.2` | 2026-09-07 |

One-line read: a release every few days, exactly what a developer preview looks like — and all 12 tags are alpha or rc; GitHub's `releases/latest` endpoint returns 404 because no non-prerelease exists. The README says it plainly: compatibility-breaking changes are coming.

That pace holds quality because of the discipline recorded in [AGENTS.md @ `c389f96`](https://github.com/deepseek-ai/deepseek-harness/blob/c389f96/AGENTS.md): a CI gate requires per-file 100% coverage across every package, `benchmarks/` is labeled "performance gates", and `.agents/notes` holds roughly 100 dated decision notes with i18n translations. The repo also ships skills for the agents that develop it — `dsh-code-review`, `dsh-pre-push-checks`, `dsh-ci-test-reliability` — agents building a harness with the same mechanisms the harness gives agents. This mirrors an observation from the [50-project agentic coding map](/blog/agentic-landscape-50-projects/): release cadence mirrors the process behind it, not the commit count.

Wakii does not use a plugin microkernel, but it applies the same principle to its agent team: every role is separated from the one that writes code, and every gate demands evidence. The nine-agent team, gates B0–B5, and the watchdog are described in [agents & kit](/docs/agents-and-kit/) and [story workflow](/docs/story-workflow/).

## What Wakii learns

- **ADOPT — the advisory guard that reminds instead of blocking.** `repeat-tool-reminder` detects repeated tool calls (thresholds 3-5-8) and injects a labeled reminder into context without vetoing anything. Wakii already has loop caps for its task-executor; the concrete proposal: have story-watchdog count consecutive same-tool calls from the transcript and inject a similar warning before declaring a stall — fewer mistakes confusing "running long" with "actually stuck".
- **DIRECTION — the "model-visible means logged" invariant.** Every input reaching a model must be reconstructable from the session log, enforced by a runtime assertion. Wakii has an evidence pack and Rule 0 but no automated invariant of the form "every context an agent receives must trace back to an artifact" — a reasonable direction for the next generation of story-* CLIs.
- **WATCH — self-modification and agent teams.** The `self-modification/` package lets an agent mount its own plugins; the agent-teams seam (roster, task board, mailbox) is still private opt-in, and the repo itself warns of breaking API changes during preview — track until stable, then reconsider.

Building agents, or running an agent team? Read deepseek-harness the way the repo recommends — let an agent explore the code — then try Wakii's built-in team: install via [getting started](/docs/getting-started/) and open the ⚡ Superpowers panel.
