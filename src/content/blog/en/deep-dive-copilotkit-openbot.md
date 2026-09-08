---
title: "OpenBot: CopilotKit's sample agent — every action through one gate"
description: "CopilotKit shipped OpenBot — a self-hosted AI coworker template: each bot gets its own computer, and every action passes a single gateway that denies first and records always. A close read of the gateway, the take-the-wheel handoff, and governed generative UI."
pubDate: "2026-10-24"
category: "tech"
tags: ["agents", "gates", "supervised", "evidence"]
draft: false
---

CopilotKit is known for the framework that embeds copilot UI into React apps. OpenBot, which they published on August 17, 2026, is something else: a complete template — a team of AI coworkers, each with a computer of its own, running on your infrastructure, where no action reaches that computer without passing a single gateway that decides and records. For anyone building agent products — ourselves included — the value of this repo is not the sample chat bot. It is how firmly the template holds the agent's hands.

## TL;DR

- OpenBot is an open-source template under the MIT license, 4,453 stars per the GitHub API on 2026-09-08 — an Alpha badge, less than a month old from its first commit, meant to be cloned and rebuilt, not operated for you.
- Every browser, file, and shell action a bot takes passes one gateway: resolve the target from a server-held snapshot, ask the policy (deny beats allow), write the audit row, and only then act. No policy means nothing is permitted.
- Take the wheel: when a bot hits a login wall or a 2FA prompt it asks a human to drive. The handover is recorded as named events, and while the human drives, bot actions are refused rather than queued.
- The agent answers with pre-approved React components instead of free-form prose — every render asks the server whether the component exists, is published, and is not withheld from that bot.

## A template, not a product — and why that matters

The repo description on GitHub calls OpenBot "Open-source AI coworkers that each get a computer of their own" ([repo description](https://github.com/CopilotKit/OpenBot)) — a team of AI colleagues, one machine each. The README's own positioning is sharper: "A template, not a product" ([README](https://github.com/CopilotKit/OpenBot#readme)). There is no hosted version to sign up for, nothing published as a package to depend on, and every workspace in the repository is private. You take the repo, replace the example tenant package under `examples/` with your own coworkers, channels, and skills, and run it yourself.

The technically interesting choice: a "bot" is any endpoint speaking [AG-UI](https://github.com/ag-ui-protocol/ag-ui), the open protocol for agent-to-user interaction. Bots built with LangGraph, Mastra, CrewAI, Pydantic AI, Google ADK, or written by hand all arrive the same way, and the governance rides the protocol rather than the framework. The three sample coworkers (General Assistant, Knowledge, Risk Analyst) are configuration in `agents.yaml`, not code.

| Metric | Value |
| --- | --- |
| Stars / forks | 4,453 / 549 — per the GitHub API on 2026-09-08 |
| License | MIT |
| Created / last push | 2026-08-17 / 2026-09-07 |
| Latest release | v0.0.8 on 2026-09-06 |
| Language | TypeScript (Bun + Hono + React/Vite + PostgreSQL/pgvector) |

Its first five releases (v0.0.4 through v0.0.8) landed inside three weeks, and the ten most recent commits we probed on 2026-09-08 all fall on a single day — September 6. This repo is moving fast and rough; its own Alpha badge warns you to "expect rough edges" ([README](https://github.com/CopilotKit/OpenBot#readme)). Read it as a blueprint, not a dependency.

## Every action goes through one gate

The heart of OpenBot is `server/src/computer/gateway.ts`, which introduces itself as "The only way an action reaches a Bot's computer" ([`gateway.ts` @ `2e1b352`](https://github.com/CopilotKit/OpenBot/blob/2e1b352e9a0e7be6235d641b787aab8da10b64db/server/src/computer/gateway.ts)). The gateway does three jobs, in order. One: resolve the ref the caller sent into the element it actually points at, from a snapshot the server fetched — never from the label the model claims it is clicking. Two: ask the policy — deny is evaluated before allow, a missing policy permits nothing, and a broken rule refuses rather than opens. Three: write the audit row, whichever way the decision went, and only then act.

The file's own header comment explains why the resolve step is the one that is easy to skip and fatal to skip:

```text
A gateway that decides on a label supplied by the model is theatre:
'never click Submit' is evaded by sending {ref: "e13", name: "Continue"}.
The refs are opaque to the caller precisely so that the server holds
the mapping.
```

— `server/src/computer/gateway.ts`, [blob @ `2e1b352`](https://github.com/CopilotKit/OpenBot/blob/2e1b352e9a0e7be6235d641b787aab8da10b64db/server/src/computer/gateway.ts) (probed 2026-09-08)

In other words, your "never click Submit" rule is meaningless if the model gets to declare what it is clicking. OpenBot keeps the refs opaque to the caller precisely so the mapping lives on the server. The same header comment has an even better line: "an action that was not recorded did not happen" ([same file](https://github.com/CopilotKit/OpenBot/blob/2e1b352e9a0e7be6235d641b787aab8da10b64db/server/src/computer/gateway.ts)) — there is no path that acts without the record existing first. Every refusal carries the rule that caused it (`ActionRefusedError` ships with a `rule` field), so the admin surface shows you why an action was blocked, not just that it was.

## Take the wheel — the handoff UX

The second thing worth studying is how OpenBot handles the moment a bot should not decide alone. Hitting a login wall or a 2FA prompt, the bot does not try to power through — it asks for help. The handover happens in the same panel and is recorded as named events:

```text
Bot hits a login wall / 2FA prompt
  └─▶ computer.help_requested     (bot asks a human to join)
        └─▶ computer.control_taken     (human drives, same panel)
              └─▶ human finishes
                    └─▶ computer.control_released  (control returns)
While the human drives: every bot action is REFUSED, not queued.
```

Source: [README, Features section](https://github.com/CopilotKit/OpenBot#features), probed 2026-09-08. The detail with taste: while the person is driving, bot actions are refused outright rather than queued to run after the human lets go — once the handover starts, there is no side door. Around it sits the observation surface: you watch the page the bot is looking at, an Activity tab lists what it ran, read, and saved with the output, and a saved file shows its path and size, never its contents. Secrets never enter the transcript — the trail records that a secret was requested and how long it was, nothing more.

## Answering with components, not prose

OpenBot's generative UI is not "let the model emit JSX and render it." React components live in the app's gallery; sandboxed ones are authored in `/admin/playground` and published with no deployment. Each time a bot answers with a component, the server checks three things before rendering:

```text
component exists?  ─▶ is published?  ─▶ not withheld from this bot?
        └─ component data functions are granted per-component
```

Source: [README, Features section](https://github.com/CopilotKit/OpenBot#features), probed 2026-09-08. The same philosophy runs down to skills: the README's line is "Skills are instructions, not capabilities" ([README](https://github.com/CopilotKit/OpenBot#features)) — personal skills attach only to bots their author owns, deployment skills are admin-owned, and a bot granted the shipped `skill-creator` skill saves a new one only when you press the button on the card. Free-form language is where agents go rogue; OpenBot clamps all three layers — actions through the gateway, interface through the component gallery, capability through skill grants.

That "actions through a gate, refusals that name their rule" principle is exactly what Wakii builds around decision gates — see the [story-workflow docs](/docs/story-workflow/) for the mirror image: the agent owns the doing, the human owns the deciding. Our post [decision gates — why Wakii's AI agents always stop to ask](/blog/decision-gates-safe-ai-agents/) covers that mechanism in detail.

## What Wakii learns

- **ADOPT** — refusals must name their rule: OpenBot's `ActionRefusedError` carries the exact rule that blocked an action so the UI can show it. Wakii already does this for gate guard codes — duplicate resolves and closed gates are rejected with explicit error codes — OpenBot confirms the pattern and suggests extending it: every agent refusal, including outside gates (a denied tool, a read-only file), should return a rule identifier instead of a generic message.
- **DIRECTION** — governed generative UI: pre-approved components, a per-render server check, per-component data grants. If Wakii ever lets agents render workflow state inside the panel instead of prose, this is the safety pattern to study first.
- **WATCH** — the repo is three weeks old at probe time (2026-09-08), wears an Alpha badge, and its threads and memory depend on CopilotKit Intelligence, a service outside the repo. Re-evaluate once self-hosting that dependency is smooth or the API surface stabilizes.
- **N/A** — scheduled routines (15-minute floor, cap of 20, auto-off after ten failures) and SAML/OIDC SSO routed by email domain: real enterprise-deployment problems for this template, irrelevant to Wakii's current surface.

Wakii is an agentic IDE with a superpowers team built in — if you want agents that run freely but stop exactly where they should, [get Wakii](/docs/getting-started/) and read the [Superpowers panel](/docs/superpowers-panel/) guide before writing your own gateway.
