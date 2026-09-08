---
title: "Continue: an AI assistant inside your existing IDE — the config-hub lesson"
description: "How Continue embedded an AI assistant into VS Code and JetBrains through a single config file — plus the operational lesson from a 35-thousand-star project going read-only."
pubDate: "2026-10-22"
category: "tech"
tags: ["agents", "workflow", "architecture"]
draft: false
---

While the market raced to ship brand-new AI IDEs, Continue went the other way: keep your existing VS Code or JetBrains setup, and attach an AI assistant to the editor you already use. How they did it — collecting models, rules, context, and MCP tools into one config file — is still worth reading today, even after the project stopped. Because per the GitHub API on 2026-09-08, this 35,833-star repository has switched to read-only, and the way a large project winds down gracefully is a lesson as technical as anything else in it.

- Continue ships as three surfaces: a CLI, a VS Code extension, and a JetBrains plugin — your editor stays, an AI layer gets added.
- The whole configuration lives in one config file: models, rules, context, MCP servers — one block each.
- Rules are structured data (globs, alwaysApply, invokable), not vague prose descriptions.
- The project stopped in the full sense of the word: the README states the repo is read-only, and the final v2.1.0-vscode release shipped on 2026-06-19.
- For Wakii: an assistant inside the IDE and orchestration outside the IDE are different layers — Continue teaches the inner layer, Wakii's story-workflow lives in the outer one.

## One config file instead of scattered settings

What set Continue apart from its generation of assistants was never the chat popup inside the editor. It was the centralized configuration: you declare which models are allowed, which rules apply, which context gets loaded, which tools are permitted — all in a single `config.yaml`. The practical consequence: agent behavior becomes reviewable. One pull request touching the config file shows exactly where the agent will behave differently, who approved that change, and how to roll it back.

Three fields on every rule reveal how serious this design is. From the official loader's conversion code:

```ts
export function convertYamlRuleToContinueRule(rule: Rule): RuleWithSource {
  if (typeof rule === "string") {
    return { rule: rule, source: "rules-block" };
  }
  return {
    source: "rules-block",
    rule: rule.rule,
    globs: rule.globs,
    name: rule.name,
    description: rule.description,
    alwaysApply: rule.alwaysApply,
    invokable: rule.invokable ?? false,
  };
}
```

(excerpted from [core/config/yaml/yamlToContinueConfig.ts @ 5522c6f4](https://github.com/continuedev/continue/blob/5522c6f44ca0ac3528b37244818fbfa39b5af470/core/config/yaml/yamlToContinueConfig.ts), per the GitHub API on 2026-09-08)

A rule carries `globs` — which files it applies to; `alwaysApply` — active by default or only when invoked; `invokable` — whether it counts as an action or just as context. That is the line between a "real rule" and a "wish list note": a rule that declares no scope has no authority over any code. Most agent tooling describes rules in prose; Continue forces rules into a schema, and because of that the machine can read them — check them, lint them, diff them.

## MCP inside the same schema: stdio and HTTP/SSE

Tools are config entries too, not one-off installation commands. A local MCP server is declared over stdio with `command`, `args`, `cwd`, and `env`; a remote MCP is declared over HTTP or SSE with a `url` and an `apiKey`. One structure covers both:

```ts
// Stdio
if ("command" in config) {
  const { args, command, cwd, env, type } = config;
  // ...
}
// HTTP/SSE
const { type, url, apiKey, requestOptions } = config;
```

(same file as above, excerpted — source: [yamlToContinueConfig.ts @ 5522c6f4](https://github.com/continuedev/continue/blob/5522c6f44ca0ac3528b37244818fbfa39b5af470/core/config/yaml/yamlToContinueConfig.ts))

The teachable detail here: the agent calls tools by name and never needs to know whether behind that name sits a child process on the machine or an HTTPS endpoint. The local/remote boundary becomes an operations concern — who runs it, where — rather than something the agent has to think about. When a tool changes how it is deployed, only its config entry changes; the rest of the workflow stays untouched.

## Dogfooding: the project's own config lives in its own repo

The healthiest signal for this pattern sits in the repo itself: Continue checks in a `.continue/` directory — the exact directory its tooling reads at runtime — containing `agents/`, `checks/`, `prompts/`, `rules/`, and an `environment.json`:

```
.continue/
├── agents/
├── checks/
├── environment.json
├── prompts/
└── rules/
```

(source: [repo root tree `.continue/`](https://github.com/continuedev/continue/tree/main/.continue), per the GitHub API on 2026-09-08)

Running your own invention on yourself has two consequences. First, every change to the project's own agent behavior goes through a pull request — with a diff, a reviewer, and history. Second, the config schema gets exercised continuously by the pickiest users available — the team that builds it. A tool that declares agents via files but refuses to live on those files is selling something it does not use.

## How a 35,833-star project closes shop gracefully

The README does not bury this. Right in the introduction it states verbatim: "The continuedev/continue repository is no longer actively maintained and is read-only for all users." (source: the continuedev/continue README — github.com/continuedev/continue#what-is-continue). They introduced themselves as a "Pioneering open-source coding agent", and they closed with one final release across all three surfaces: anonymous telemetry removed, authentication pulled out, remaining bugs squashed — then a stop.

The latest releases at probe time:

```
v2.1.0-vscode   2026-06-19
v2.0.0-vscode   2026-06-19
v1.3.40-vscode  2026-06-15
v1.2.24-vscode  2026-06-15
v1.2.23-vscode  2026-06-15
```

(source: GitHub API repos/continuedev/continue/releases, on 2026-09-08 — github.com/continuedev/continue/releases)

Cluster three releases into two final days is a graceful way to close: ship the version that seals the code, don't leave the repo dangling mid-episode. The README ends by handing the code back: "We hope this codebase continues to serve as a foundation for others." (source: the continuedev/continue README — github.com/continuedev/continue#readme) For a fork like Wakii — a fork of orca — an upstream that stops is not a hypothetical; branch discipline and a steady sync rhythm are the lifeboat for exactly that moment, as the post on [living with upstream](/blog/oss-upstream-sync/) documents step by step.

## Two layers: inside the IDE and outside it

Tied back to our product: the in-IDE layer Continue built and the orchestration layer Wakii chose do not replace each other. An assistant in the editor handles the moment of writing code; Wakii's story-workflow handles long chains of work — idea, impact, plan, parallel SFs, gates, review, merge — where the agent needs to run free of any specific editor. The full process lives in the [story workflow](/docs/story-workflow/) docs; Continue adds the thin layer closest to the keyboard, and the two layers meet on common ground: both want agent behavior declared explicitly as data instead of hidden configuration.

## What Wakii learns

- **ADOPT** — rules-as-data-blocks: every rule declared with `globs` + `alwaysApply` + `invokable` instead of prose. Applied to story-workflow: file-scope rules inside context packs (which role may touch which files, which rules are always on) should become schema'd blocks that guards and reviewers can machine-lint — today most of that is prose. The concrete proposal is recorded in the adopt draft.
- **DIRECTION** — a non-desktop consumer: the Wakii mobile build already proves the remote-consumer pattern — reading gates from a phone; a thin editor extension reading the same gate source is the natural next step, but with no real-world demand yet it cannot be graded ADOPT.
- **WATCH** — the read-only lifecycle: watch how the ecosystem forks Continue; if a healthy fork emerges that maintains the config schema, re-grade that pattern against the new source.

Wakii is an agentic IDE with a built-in superpowers team — if you want agents with discipline rather than agents with more features, [download it](/docs/getting-started/) and run your first story.
