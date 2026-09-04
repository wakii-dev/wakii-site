---
title: Agents and kit
description: The 9-agent story team, 17 bundled workflow skills, and 23 story CLIs — all installed for you, zero setup.
order: 3
---

Wakii bundles a complete agentic workflow kit. It installs itself the first
time the app runs — no setup, enabled by default.

## The 9-agent story team

Every story run is staffed by nine specialists. Each one has a narrow job,
and the checks-and-balances between them are the point:

| Agent | Job |
|---|---|
| **phase0-impact-analyst** | Maps blast radius before code exists — touch map, second-order effects, alternatives |
| **spec-critic** | Adversarial review of the spec: ambiguity, missing edge cases, unverifiable criteria |
| **plan-critic** | Adversarial review of the plan and its task dependency graph |
| **task-executor** | Implements tasks in isolated worktrees, commits atomically |
| **designer** | Produces high-fidelity design drafts for user review before UI gets built |
| **code-reviewer** | Reviews every diff for bugs, security issues, and scope creep |
| **verifier** | Independent pass/fail verdict on the finished work — self-reports don't count |
| **security-audit** | OWASP-focused audit when changes touch auth, input, or secrets |
| **rollback-fixer** | Reverts safely to the last known-good state when something diverges |

## The kit

The bundled kit (`story-team-kit`) carries the workflow machinery:

- **17 skills** — the process skills agents load on demand: brainstorming,
  writing plans, executing plans, code review, story management, design
  pipelines, and more.
- **23 `story-*` CLIs** — installed to `~/.claude/bin/`: `story-verify`
  (gate checks), `story-watchdog` (stall detection), `story-preflight`,
  `story-test`, and the rest of the story-ops toolbox.

Installation happens automatically the first time Wakii runs — the kit is
copied into `~/.claude/` and stays in sync with the app version. It is
idempotent: re-running never duplicates or clobbers your local config.

On top of the kit, the app itself bundles its own skills (computer use,
orchestration, Linear integration, and more) for controlling your machine
and tools.

## License

The kit originates from the open-source
[superpowers](https://github.com/obra/superpowers) project by Jesse Vincent,
released under the **MIT license** — the same license Wakii and upstream
Orca use.

## Related

- [Superpowers panel](/docs/superpowers-panel/) — where the team is commanded
- [Getting started](/docs/getting-started/) — build Wakii and meet the team
