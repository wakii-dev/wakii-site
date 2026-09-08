---
title: "grok-build: when a model house writes its own harness"
description: "Reading grok-build as a data point of the model-house harness pattern: a one-way mirror of an internal monorepo, a crate that reads Claude Code and Codex sessions, and ACP as the port to outside editors."
pubDate: "2026-10-10"
category: "tech"
tags: ["agents", "architecture", "cli"]
draft: false
---

The 2026 agent-CLI race keeps repeating one pattern: every large model house ends up writing its own harness for its own model. Anthropic has Claude Code, Google has Gemini CLI, and xAI has grok-build — public on GitHub since mid-July this year. This post is not a feature review; it reads grok-build as a data point of that pattern, through three questions: how is the code organized, what is welded to the house model, and which ports open to the outside world.

## TL;DR

- grok-build is xAI's Rust TUI harness for the Grok model: interactive, headless for CI, or embedded into editors via the Agent Client Protocol (ACP) — per the GitHub API on 2026-09-08.
- The repo is a one-way mirror: the 8 most recent commits all read "Synced from monorepo", external contributions are not accepted, and there are no GitHub Releases or tags.
- The rarest data point: a crate that reads Claude Code, Codex and Cursor session metadata from your machine — tightly bounded (50 sessions per tool, 30 days).
- For Wakii, the "model house ships its own harness" pattern is something to watch, not to copy hastily — graded WATCH at the end.

## One data point of the model-house harness pattern

Independent harnesses like aider or goose exist to connect many models to your terminal. A model-house harness exists for a different reason: to package the house's own model into an end-to-end product, controlling everything from the system prompt down to how files get edited. Here is grok-build at probe time:

| Property | Value (per the GitHub API on 2026-09-08) |
|---|---|
| Stars | 26,563 |
| Forks | 4,991 |
| Language | Rust |
| License | Apache-2.0 |
| Repo created | 2026-07-14 |
| Last push | 2026-09-01 |

Two numbers carry weight: 26,563 stars in roughly 8 weeks since 2026-07-14 shows real demand, and the 2026-09-01 push — 7 days before the probe — shows a steady sync cadence. Structurally, the grok-build README describes the repo as holding "the Rust source for the `grok` CLI/TUI and its agent runtime" — about 75 crates in one workspace, split into clear layers: the TUI (xai-grok-pager), the agent runtime (xai-grok-shell), tool implementations (xai-grok-tools), and a workspace layer handling filesystem, VCS and checkpoints (xai-grok-workspace).

The two harness families side by side:

```
  MODEL HOUSE                          INDEPENDENT HARNESS
  ┌─────────────────────┐              ┌─────────────────────┐
  │  model (Grok)       │              │  aider / goose /    │
  │  + harness (grok)   │              │  OpenHands          │
  │  — one vendor       │              │  —model-agnostic,   │
  │  — one-way sync     │              │   community-driven  │
  └─────────────────────┘              └─────────────────────┘
```

## A one-way mirror: synced from monorepo, no PRs

The grok-build README states the repo is "synced periodically from the SpaceXAI monorepo" (grok-build README, github.com/xai-org/grok-build). Concretely: a small `SOURCE_REV` file at the root records the internal monorepo commit SHA matching the published tree — at probe time, `a549186d9d39311f2d3ee4208db62af8c65aa476`.

The commit history confirms the mechanism. The 8 most recent commits, probed via the GitHub API on 2026-09-08:

| SHA | Date | Message |
|---|---|---|
| 72a6125 | 2026-09-01 | Synced from monorepo |
| bb7f39d | 2026-08-31 | Synced from monorepo |
| bc7f02e | 2026-08-28 | Synced from monorepo |
| 9684fa3 | 2026-08-27 | Synced from monorepo |
| 77cd7eb | 2026-08-25 | Synced from monorepo |
| c2ad97f | 2026-08-24 | Synced from monorepo |
| 07b2f71 | 2026-08-23 | Synced from monorepo |
| 19d42e3 | 2026-08-19 | Synced from monorepo |

Not a single external author, not a single feature branch. The sync cadence runs every 1-3 days across the 19/08-01/09 window. Contributing is blocked up front: "External contributions are not accepted" (grok-build README, github.com/xai-org/grok-build). GitHub Releases sit at zero, tags at zero, per the GitHub API on 2026-09-08 — the official binary ships through an install script at x.ai/cli, and the changelog lives off GitHub. The design choice: publish code for transparency, keep all write access inside the internal monorepo.

## The crate that reads Claude Code, Codex and Cursor sessions

The most interesting find lives in the `xai-grok-foreign-sessions` crate. Its own docs describe it as a "Bounded, metadata-only listing of foreign coding-agent sessions" (xai-grok-foreign-sessions, github.com/xai-org/grok-build). "Foreign" here means other houses' harnesses:

```rust
pub enum ForeignSessionTool {
    Claude,
    Codex,
    Cursor,
}
```

(From `crates/codegen/xai-grok-foreign-sessions/src/lib.rs`, commit `72a61251fcffb464bcc687aeb5a998e5a98ec0c9` — github.com/xai-org/grok-build/blob/72a61251fcffb464bcc687aeb5a998e5a98ec0c9/crates/codegen/xai-grok-foreign-sessions/src/lib.rs)

For Claude Code, the crate scans `~/.claude` (or the path in the `CLAUDE_CONFIG_DIR` environment variable when set) — here is the scanner entry point:

```rust
pub(super) fn scan(cwd: &Path, now: SystemTime) -> Vec<ForeignSessionSummary> {
    let Some(config_dir) = std::env::var_os("CLAUDE_CONFIG_DIR")
        .map(PathBuf::from)
        .or_else(|| xai_dirs::home_dir().map(|home| home.join(".claude")))
    else {
        return Vec::new();
    };
    scan_in_config_dir(&config_dir, cwd, now)
}
```

(Same file and commit)

The reading discipline is the part worth studying. Constants in the same file set hard ceilings: at most 50 sessions per tool (`MAX_SESSIONS_PER_TOOL`), sessions only within the last 30 days (`MAX_SESSION_AGE`), titles truncated to 200 characters. Reading stops at metadata (title, project path, update time, branch) — the module notes that other tools' SQLite stores are only opened read-only, and every path passes an `ApprovedRoot` check before it is touched.

The motive is easy to guess: recognizing the harness you already used means switching to grok without starting from zero.

## Ports to the outside: ACP, MCP, hooks

Welding to the house model does not mean closing the border. grok-build opens three kinds of ports, each pointing in a different direction. The first is ACP — the Agent Client Protocol: the README notes grok runs "embedded in editors via the Agent Client Protocol (ACP)" (grok-build README, github.com/xai-org/grok-build). In the code, the `xai-acp-lib` crate holds the two-way gateway between grok and outside clients, using the `agent_client_protocol` crate directly:

```rust
use agent_client_protocol as acp;
```

(From `crates/codegen/xai-acp-lib/src/gateway.rs`, same commit — github.com/xai-org/grok-build/blob/72a61251fcffb464bcc687aeb5a998e5a98ec0c9/crates/codegen/xai-acp-lib/src/gateway.rs)

The second port is MCP: the `xai-grok-mcp` crate (an MCP client with elicitation, credentials, liveness). The third is the hooks and plugin system: the `xai-grok-hooks` crate ships a dispatcher, matcher, and runners for both shell commands and HTTP, with a trust mechanism; plugins get a marketplace, git-based installs, and their own trust registry. To be precise: ACP and MCP are the only model-agnostic-facing ports; the README shows no mechanism to configure any provider other than Grok.

The vocabulary is also telling: hooks, marketplace, sandbox, subagent — the major harnesses are converging on the same concept set, learned once and used everywhere.

## What Wakii learns

- **WATCH** — the model-house harness pattern: Wakii is positioned as an agentic IDE with a 9-agent team independent of the underlying model (see agents and kit), while grok-build alongside Claude Code and Gemini CLI shows model houses turning harnesses into first-class products welded to their models. If the trend holds, the comparison shifts from "which harness is good" to "which model-welded harness fits you" — directly affecting the positioning of a model-agnostic IDE. Grade flips when: ACP matures enough for Wakii to embed another house's agent as a client, or a fourth major model house confirms the pattern — at that point it becomes an epic-level decision, not one made in a blog post.
- **WATCH** — the bounded metadata-only discipline of foreign-sessions (50/tool cap, 30 days, `ApprovedRoot` before any read): a usable principle if Wakii ever needs to read outside harness state. Wakii's watchdog currently reads recent commits, terminal output and Linear state of its own stories — a different problem, but the "hard ceilings, metadata-first" spirit carries over.
- **N/A** — the one-way mirror with no external contributions: it fits a model house keeping an internal monorepo; Wakii develops on a public repo (wakii-dev/wakii, MIT) with its own story-review process — different constraints.

Wakii's 9-agent team, skills, and 24 story CLIs are documented in [agents and kit](/docs/agents-and-kit/). To place grok-build in the bigger picture — 50 projects around agentic coding as of September 2026 — read [the landscape map](/blog/agentic-landscape-50-projects/). Wakii is an agentic IDE with a disciplined agent team built in — download it, let the team run, and keep the decisions for yourself.
