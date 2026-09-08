---
title: "Goose: the agent that automates dev work on your machine"
description: "goose runs directly on your machine — desktop app, CLI, API — turns repetitive dev chores into schedulable YAML recipes and extends through MCP extensions. A deep dive into the architecture and what an agentic IDE can learn."
pubDate: "2026-10-08"
category: "tech"
tags: ["agents", "cli", "workflow"]
draft: false
---

Most dev agents live inside an editor: open the IDE, type a prompt, read the answer right there. goose takes a different road — it is a process running on your machine, with its own desktop app, CLI, and API, and its job is not limited to code. The repo sits at 54,022 stars per the GitHub API on 2026-09-08, was pushed to on that very day, and belongs to the Agentic AI Foundation at the Linux Foundation. The interesting part is not the star count but three mechanisms: repetitive work gets packaged as YAML recipes, the scheduler is exposed to the agent as an ordinary extension, and goose uses itself as the reviewer in its own CI.

TL;DR:

- goose is a general-purpose agent that runs on your machine — desktop app, CLI, API — not tied to any editor.
- Repetitive work is packaged as recipes: YAML declaring parameters, extensions, and a prompt template, machine-checked before it runs.
- The scheduler is a "platform extension": the agent creates, pauses, and resumes scheduled runs through the same tool surface as external MCP servers.
- goose reviews its own pull requests in CI, with a prompt-injection warning written at the top of the workflow.
- For Wakii: write down injection boundaries, design scheduled maintenance with gates, and watch local inference.

## An agent on your machine, not in your editor

The README introduces goose in one line: "your native open source AI agent — desktop app, CLI, and API — for code, workflows, and everything in between" (README of aaif-goose/goose, [github.com/aaif-goose/goose](https://github.com/aaif-goose/goose)). That is not the pitch for a code-completion sidebar: research, automation, and data analysis are all in scope. The core is written in Rust and ships on macOS, Linux, and Windows.

The full picture, per the GitHub API on 2026-09-08:

| Metric | Value |
|---|---|
| Stars | 54,022 |
| License | Apache-2.0 |
| Last push | 2026-09-08 |
| Archived | false |
| Latest release | v1.49.0 — 2026-09-03 |

The release rhythm is dense — six minor versions in six weeks, per the GitHub API on 2026-09-08:

```
v1.49.0  2026-09-03
v1.48.0  2026-08-27
v1.47.0  2026-08-21
v1.46.0  2026-08-12
v1.45.0  2026-07-29
v1.44.0  2026-07-23
```

A project shipping steadily at that pace is not an abandoned experiment; it is infrastructure other people rely on.

## Repetitive work, packaged as YAML recipes

The central mechanism for automation in goose is the recipe: a YAML file declaring a version, parameters, the extensions to attach, and a prompt template. This is the recipe goose uses to review its own code — two required parameters, one builtin extension, and an MCP server launched via uv ([.github/recipes/code-review.yaml](https://github.com/aaif-goose/goose/blob/5e90925962f05acf8e255032de44d16c4a7768a2/.github/recipes/code-review.yaml)):

```yaml
version: "1.0.0"
title: GitHub PR Code Review
parameters:
  - key: pr_directory
    input_type: string
    requirement: required
  - key: instructions
    input_type: string
    requirement: required
extensions:
  - type: builtin
    name: developer
  - type: stdio
    name: code_review
    cmd: uv
    args: ["run", "{{ recipe_dir }}/../scripts/pr-review-mcp.py"]
```

A recipe is an artifact: shareable, parameterizable, and — most importantly — machine-checkable before it runs. The goose CLI can even pull recipes from a GitHub repo and run them directly (the `retrieve_recipe_from_github` function in [crates/goose-cli/src/recipes/github_recipe.rs](https://github.com/aaif-goose/goose/blob/5e90925962f05acf8e255032de44d16c4a7768a2/crates/goose-cli/src/recipes/github_recipe.rs)). Repetitive dev chores — reviewing PRs, summarizing logs, running test suites — become config files instead of prompt strings you keep in your head.

## The scheduler is an extension, not a privileged feature

The most instructive architectural choice: the scheduler — a first-party goose feature — is implemented exactly like an external extension. The file [crates/goose/src/agents/platform_extensions/scheduler.rs](https://github.com/aaif-goose/goose/blob/5e90925962f05acf8e255032de44d16c4a7768a2/crates/goose/src/agents/platform_extensions/scheduler.rs) sets `EXTENSION_NAME = "scheduler"` and describes the job in the tool's own instructions: "Create, list, update, pause, resume, and remove scheduled recipe runs, and inspect the sessions they produced." The agent schedules recipe runs through the same protocol it uses to call external MCP servers:

```
model ─── one uniform tool surface ───┬─► external MCP servers
                                      ├─► builtin developer
                                      └─► scheduler (in-house, same protocol)
```

Accepting a schedule is not blind trust either. `read_schedule_recipe` in [crates/goose/src/agents/schedule_tool.rs](https://github.com/aaif-goose/goose/blob/5e90925962f05acf8e255032de44d16c4a7768a2/crates/goose/src/agents/schedule_tool.rs) canonicalizes the path, rejects unusual files, caps recipe size at exactly 1,048,576 bytes, and only then validates the template:

```rust
if opened_metadata.len() > MAX_SCHEDULE_RECIPE_BYTES {
    return Err(recipe_file_error(
        "Recipe file exceeds the 1048576 byte limit",
    ));
}
```

Scheduled agent runs are the most fragile kind of work — recipes rot, model behavior drifts — so goose guards the door where schedules are accepted: the artifact must be a regular file, within limits, and valid before it earns a place on the calendar.

## goose reviews goose's own pull requests

The two mechanisms above meet in goose's CI. The [goose-pr-reviewer.yml](https://github.com/aaif-goose/goose/blob/5e90925962f05acf8e255032de44d16c4a7768a2/.github/workflows/goose-pr-reviewer.yml) workflow triggers when someone comments "/goose" with optional instructions on a PR (OWNER/MEMBER only), injects a review recipe into the environment, and lets the agent run. The most notable part sits in a few comment lines at the top of the file:

```
# Security:
#   - PR content could prompt-inject the agent; only trigger on PRs you trust.
#   - Do not add workflow_dispatch: API calls fetch mutable data, enabling TOCTOU attacks.
```

That is culture, not paperwork: every automation entry point that ingests external content must state its trust boundary — who may trigger it, which data is untrusted, why one convenient trigger was deliberately left out. The precondition for daring to turn automation on is writing this down.

## Your machine, your configuration: providers, extensions, a foundation

Per the README (retrieved 2026-09-08), goose supports more than 15 providers — Anthropic, OpenAI, Google, Ollama, OpenRouter, Azure, Bedrock — and can use existing Claude, ChatGPT, or Gemini subscriptions via ACP; on the tool side, the README claims connections to more than 70 extensions over MCP. The source tree at commit 5e909259 (probed 2026-09-08) separates each concern into its own crate: `goose-mcp` for the protocol, `goose-local-inference` for models running locally, `goose-providers` for the provider layer, `goose-acp-macros` for ACP.

Ownership has changed layers too. Querying the GitHub API for `repos/block/goose` on 2026-09-08 returns the new identity `aaif-goose/goose` — the standard redirect GitHub issues for a repo that moved to another org; both the README and GOVERNANCE.md state that goose belongs to the Agentic AI Foundation at the Linux Foundation, with three roles: Contributors, Maintainers, Core Maintainers. The name "block/goose" still rings familiar in the community, but the title to the project today sits with a foundation, not a company.

## What Wakii learns

- **ADOPT** — write down the injection boundary at every automation entry point. goose states right inside its CI workflow that PR content could prompt-inject the agent, and deliberately refuses `workflow_dispatch` because of TOCTOU (see the goose-reviews-itself section). Wakii has equivalent entry points that ingest external content — the code-reviewer reads diffs from PRs, the watchdog auto-resumes based on Linear state — and the skills and agent definitions in the kit should carry the same kind of boundary note: which data is untrusted, who may trigger what.
- **DIRECTION** — scheduled maintenance as a first-class surface. `scheduler__manage_schedule` lets the agent create, pause, and resume scheduled runs from validated recipes (see the scheduler section); Wakii's ⚡ Workflow tab currently launches runs one at a time, on user action. The gap is not technical but contractual: a gate design for unattended runs — the "Humans own the irreversibles" principle needs its own gate before unattended schedules exist.
- **WATCH** — local inference. goose ships a dedicated `goose-local-inference` crate and an Ollama provider for running models on the machine (see the providers section); Wakii rides the Claude Code harness. Move to DIRECTION when the harness opens local providers or a concrete privacy need appears.
- **N/A** — foundation governance and custom distros. The AAIF/Linux Foundation model and white-labelling belong to multi-organization OSS projects; Wakii is a product built by one team and does not compete at the ownership layer.

goose's recipes-plus-scheduler design and Wakii's story workflow answer the same question: how do you let an agent do real work on your machine while staying in control. For the wider ecosystem picture, read [the agentic landscape — 50 projects](/blog/agentic-landscape-50-projects/); for how Wakii puts gates around automation, read [decision gates for safe AI agents](/blog/decision-gates-safe-ai-agents/). Wakii's agent team ships preinstalled with the app — start from [getting started](/docs/getting-started/), let the agents run, and keep the consequential decisions for yourself.
