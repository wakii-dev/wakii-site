---
title: "Gemini CLI: Google's agent terminal"
description: "Deep-dive Gemini CLI — 106,867 stars, Apache-2.0: a big-vendor harness that ships its entire code in the open while standing behind Google's own model, read from the policy engine to the repo's own maintenance bots."
pubDate: "2026-10-04"
category: "tech"
tags: ["agents", "cli", "terminal", "architecture"]
draft: false
heroImage: "/blog/heroes/deep-dive-google-gemini-gemini-cli.png"
---

There are three ways to build an agent terminal. The first: sell the model, hide the code, disclose architecture through a changelog — the Claude Code pattern we covered in a [previous deep-dive](/blog/deep-dive-anthropics-claude-code/). The second: build a vendor-neutral shell for every model — OpenCode's way. Google picked the third, less obvious path: write a harness born for its own model, then open the entire code under Apache-2.0 and let the world read every permission checkpoint. Gemini CLI counts 106,867 stars and 14,542 forks per the GitHub API on 2026-09-08 — just 17 months after the repo went public (2025-04-17). This post dissects how a big vendor behaves when its harness stands behind its own model, reading straight from the source.

TL;DR — what you will read:

- A monorepo of 7 packages, fully public from terminal UI to embedding SDK — no packaging layer hides the logic
- Tool-execution rights are law in code: a PolicyDecision enum with ALLOW/DENY/ASK_USER plus priority rules, not a plea inside a prompt
- A skill is a tool (activate_skill) the model must call by name; an extension is declarative data loaded by a loader
- Google uses it on its own repo: 7 of 47 GitHub workflows run run-gemini-cli for issue triage, dedup, and release notes
- Three public release channels: nightly every night, preview and stable every Tuesday — one missed nightly in the last 14 nights

## How open can a harness be when it stands behind its own model

The README introduces it plainly: "An open-source AI agent that brings the power of Gemini directly into your terminal" (source: [README of google-gemini/gemini-cli @ 85aca16](https://github.com/google-gemini/gemini-cli/blob/85aca16/README.md), retrieved 2026-09-08). The license is Apache-2.0 per the GitHub API on 2026-09-08 — and it is not a decorative badge: tool-dispatch logic, the policy engine, sandboxing, and the maintenance bots all live in the repo. The difference from Claude Code comes down to one point: you can build the tool from this very repo instead of installing a sealed installer.

At commit 85aca16, the packages/ directory holds exactly 7 entries — descriptions taken from the repo's own GEMINI.md:

```
google-gemini/gemini-cli @ 85aca16 — packages/
├── cli                   terminal UI (React + Ink)
├── core                  the agent loop: tools, policy, mcp, skills
├── a2a-server            Agent-to-Agent server (experimental)
├── sdk                   SDK to embed Gemini CLI elsewhere
├── devtools              integrated Network/Console inspector
├── vscode-ide-companion  VS Code extension pairing with the CLI
└── test-utils            shared test rig
```

(diagram from [GEMINI.md @ 85aca16](https://github.com/google-gemini/gemini-cli/blob/85aca16/GEMINI.md), read 2026-09-08)

The README also carries a surprisingly frank sentence about the harness-model relationship: "the most direct path from your prompt to our model" — "our model" is no accident ([README @ 85aca16](https://github.com/google-gemini/gemini-cli/blob/85aca16/README.md)). This harness does not pretend to be vendor-neutral the way OpenCode is with its independent model catalog; it serves Gemini first. But the price of that service is fully on display: every behavior-deciding layer — policy, sandbox, safety, routing — sits inside packages/core/src for anyone to read. The release channels are public to the same degree: the README commits to a nightly at 00:00 UTC every night from main, preview at 23:59 UTC on Tuesdays, stable at 20:00 UTC on Tuesdays — and the release data matches: v0.58.0 shipped at 20:51 UTC on Tuesday 2026-09-01, with 13 nightlies across the last 14 nights (per the GitHub API on 2026-09-08).

## Tool-execution rights are law in code, not a plea in a prompt

This is the most instructive part for anyone building an agent system. Every tool call passes through a policy engine, and every decision is an enum value — not a conversation turn:

```ts
// packages/core/src/policy/types.ts
export enum PolicyDecision {
  ALLOW = 'allow',
  DENY = 'deny',
  ASK_USER = 'ask_user',
}
```

(source: [policy/types.ts @ 85aca16](https://github.com/google-gemini/gemini-cli/blob/85aca16/packages/core/src/policy/types.ts))

The engine holds rules with priorities and overrides them through explicit law. The internal log lines of policy-engine.ts reveal the branches: a git command in an untrusted workspace triggers "Forcing ASK_USER"; a dangerous command while the fully-automated YOLO mode is on triggers "Preserving decision"; a known-safe git command triggers "overriding ASK_USER to ALLOW" (source: [policy-engine.ts @ 85aca16](https://github.com/google-gemini/gemini-cli/blob/85aca16/packages/core/src/policy/policy-engine.ts)). The second branch is the most striking: even at maximum automation, the engine does not re-judge dangerous commands itself — it keeps whatever the law decided. User confirmation flows through a dedicated confirmation-bus (the confirmation-bus directory with message-bus.ts), kept separate from the tool loop instead of mixed into the conversation.

That is a fundamental difference from the "guardrail" style many harnesses use: not a system-prompt paragraph begging the model to be careful, but rules-as-data evaluated by machine before the command runs. A model cannot talk an enum out of its value.

## A skill is a tool; an extension is data

Both extension mechanisms of Gemini CLI are designed to be observable. Skills are not text smuggled into context — they are a tool the model must call by name:

```ts
// packages/core/src/tools/activate-skill.ts
export interface ActivateSkillToolParams {
  /** The name of the skill to activate */
  name: string;
}
```

(source: [tools/activate-skill.ts @ 85aca16](https://github.com/google-gemini/gemini-cli/blob/85aca16/packages/core/src/tools/activate-skill.ts))

When the model calls activate_skill, the returned description comes from the SkillManager; every activation therefore leaves a trace in the transcript like any other tool call — you can see which skill turned on and when, instead of an invisible prompt-template swap. The skills/ directory carries its own loader and manager plus built-in skills. Extensions load from config/extensions through an extensionLoader — declarative data, not code patches (source: [utils/extensionLoader.ts @ 85aca16](https://github.com/google-gemini/gemini-cli/blob/85aca16/packages/core/src/utils/extensionLoader.ts)). MCP is a first-class citizen: mcp-client, mcp-client-manager, and list-mcp-resources live right in tools/. And a fun detail at the repo root: GEMINI.md — the very context-file mechanism the tool advertises to users — is used on its own source, from build instructions to the architecture map.

## Google uses it on its own repo, in the open

The best evidence that "this harness actually works" is not a benchmark — it is the repo's own .github/workflows/. 7 of 47 workflows run run-gemini-cli, the project's official GitHub Action, against this very repo:

```
gemini-automated-issue-triage.yml   automatic issue triage
gemini-scheduled-issue-triage.yml   scheduled issue triage
gemini-automated-issue-dedup.yml    automatic duplicate merging
gemini-scheduled-issue-dedup.yml    scheduled duplicate merging
release-notes.yml                   release notes drafting
docs-audit.yml                      docs review sweep
community-report.yml                community reporting
```

(7 of 47 workflows under [.github/workflows @ 85aca16](https://github.com/google-gemini/gemini-cli/tree/85aca16/.github/workflows), grep "run-gemini-cli" on 2026-09-08)

That is dogfooding at the operations layer: an agent handles the issue queue of the agent's own repo — on a schedule, in public, with every run's outcome visible. The README lists a free tier of 60 requests per minute and 1,000 requests per day with a personal Google account. The two pieces fit together: Google hands out its own model quota so you run its harness, and proves the harness is strong enough for real operations right in front of you. The open model and the business model do not conflict here — the harness is open and free, the model is where money changes hands.

Wakii takes a different route by putting the workflow first: a story passes through a 9-agent specialist team with B0–B5 gates at every milestone, with humans owning the irreversible decisions — see the [story workflow](/docs/story-workflow/) and the [agent team and kit](/docs/agents-and-kit/).

## What Wakii learns

- **ADOPT** — permission rules as machine-checked data before execution: the PolicyDecision-plus-priority pattern in the policy engine is a template for Wakii's gate layer — story-preflight could encode hard conditions as a prioritized ruleset (block-executor, warn, allow) instead of a prose checklist, making gates even harder to swallow silently.
- **DIRECTION** — public operational dogfooding: 7 agent workflows triaging and deduping the repo's own issues is a pattern Wakii could apply to wakii-dev/wakii, where research issues keep piling up; not now, because a mature triage rule set must exist before an agent owns the queue.
- **WATCH** — the a2a-server: GEMINI.md labels it experimental, matching Wakii's earlier research verdict that A2A is still early; switch to DIRECTION when a real editor-agnostic client ships beyond demos.
- **N/A** — the 1,000 requests/day free tier: a vendor-owned-model luxury; Wakii is an IDE for users who bring their own model, with no model quota to give away.

If you want to see that workflow running on a real story, download Wakii, open the ⚡ Superpowers panel and let the agent team run from the start — the gates will ask you exactly where they should.
