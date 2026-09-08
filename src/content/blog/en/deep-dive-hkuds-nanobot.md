---
title: "Nanobot: when less code is an architecture decision"
description: "A deep dive into HKUDS/nanobot: a personal agent driven by a single config.json, a measurable few-thousand-line core, Markdown personas — lessons in keeping a surface small on purpose."
pubDate: "2026-10-14"
category: "tech"
tags: ["agents", "cli"]
draft: false
---

Most agent frameworks pitch you on quantity: how many roles, how many orchestration patterns, how many abstractions. HKUDS/nanobot goes the other way — a personal agent that runs in a WebUI, a terminal, or a chat app, with a very tightly wrapped core. Its README introduces it as "an ultra-lightweight, open-source, self-hosted personal AI agent framework" (repo [HKUDS/nanobot](https://github.com/HKUDS/nanobot), MIT license per GitHub API on 2026-09-08, 47,883 stars per GitHub API on 2026-09-08). What is worth learning is not the feature list but how they keep the surface small on purpose: configuration is data, persona is Markdown, and everything extensible lives outside the core. This article dissects those four architecture decisions against real code at commit `104917a`.

TL;DR:

- The agent's entire behavior is declared in one file, `~/.nanobot/config.json` — validated by a pydantic schema, with secrets pushed out of the file via `${ENV_VAR}`.
- The core runtime measures 17,749 lines of Python (running the repo's own `core_agent_lines.sh` at commit `104917a`); tools, skills, and channels are separate buckets outside the core.
- Multi-agent at a modest scale: subagents run in the background on the same runtime, 4 concurrent by default, with named status phases.
- The persona is Markdown (`SOUL.md`, `USER.md`) maintained by a mechanism called "Dream", not constants baked into code.
- Wakii can adopt this immediately: defining a core boundary and then measuring it — the same spirit as counting kit surface from the catalog instead of imprecise grep.

## One config.json replaces a whole layer of glue code

Open `nanobot/config/loader.py` and the default path fits in a single function (excerpt from [loader.py at commit 104917a](https://github.com/HKUDS/nanobot/blob/104917aaec8b351edcbbc87a64fa6b71eb6e096b/nanobot/config/loader.py)):

```python
def get_config_path() -> Path:
    """Get the configuration file path."""
    if _current_config_path:
        return _current_config_path
    return Path.home() / ".nanobot" / "config.json"
```

One file, one source of truth. Every tunable behavior — default model, fallback chain, tool limits, max subagents — is a field in a pydantic schema, not constants scattered through the code. Secrets are kept out of the config file via `${ENV_VAR}` placeholders resolved at startup (real example from [docs/configuration.md](https://github.com/HKUDS/nanobot/blob/104917aaec8b351edcbbc87a64fa6b71eb6e096b/docs/configuration.md)):

```json
{
  "channels": {
    "telegram": { "token": "${TELEGRAM_TOKEN}" }
  },
  "providers": {
    "groq": { "apiKey": "${GROQ_API_KEY}" }
  }
}
```

The documentation steers everyday use toward the WebUI and tells you to edit JSON directly only when you need an advanced field, automated deployment, or — verbatim — "intentionally manage configuration as code" (nanobot's docs/configuration.md). This is where nanobot comes closest to the zero-setup ethos Wakii described in [zero-setup agent team](/blog/zero-setup-agent-team/): regular users do not have to learn a config format, and power users get exactly one declarative language to talk to the runtime.

## A 17,749-line core that measures itself

The repo ships a script named `core_agent_lines.sh`. Its single job: define the "core" boundary as 5 specific packages (agent, bus, config, cron, session), then count lines. Output at commit `104917a` (the repo's own script, run on the tarball of the same commit):

```text
Core runtime
------------
  agent/             9597 lines
  bus/                718 lines
  config/            1356 lines
  cron/              1380 lines
  session/           4698 lines

Separate buckets
----------------
  tools/            12825 lines
  channels/         64193 lines

Totals
------
  core total        17749 lines
  extra total       93018 lines
```

The total Python package is 155,253 lines across 393 files (counted at the same commit) — the core is roughly 11%. The more telling number is the `channels/` bucket: 64,193 lines, more than 3x the core, containing all the Telegram, Discord, Slack, email, and other channel integrations. That is the architecture decision: the part that changes most and bloats fastest is pushed outside the core, while the part that changes rarely — the agent loop, configuration, sessions — stays small enough for one person to read in full. The repo's [architecture.md](https://github.com/HKUDS/nanobot/blob/104917aaec8b351edcbbc87a64fa6b71eb6e096b/docs/architecture.md) maps every runtime behavior to its exact source file — a small core is what lets this kind of documentation exist without turning into a maze. "Less code" here is not a missing feature; it is a decision about what is allowed to grow.

## Multi-agent at small scale: four background subagents

Nanobot sits in the multi-agent facet, but do not picture a simulated company or a complex actor network — those are the angles our MetaGPT and AutoGen pieces in this series covered. In nanobot, delegation is sized to one person's assistant problems: a `spawn` tool creates background subagents ("Spawn tool for creating background subagents" — [tools/spawn.py](https://github.com/HKUDS/nanobot/blob/104917aaec8b351edcbbc87a64fa6b71eb6e096b/nanobot/agent/tools/spawn.py)), and the count is capped right in the default config (excerpt from [config/schema.py](https://github.com/HKUDS/nanobot/blob/104917aaec8b351edcbbc87a64fa6b71eb6e096b/nanobot/config/schema.py)):

```python
class AgentDefaults(Base):
    """Default agent configuration."""

    workspace: str = "~/.nanobot/workspace"
    model: str = "anthropic/claude-opus-4-5"
    ...
    fallback_models: list[FallbackCandidate] = Field(default_factory=list)
    max_tool_iterations: int = 200
    max_concurrent_subagents: int = Field(default=4, ge=1)
```

A subagent is not a second runtime — it re-runs the core's `AgentRunner` on a separate scope. The subtle part is how they observe it: status has named phases instead of a busy/idle flag (excerpt from [agent/subagent.py](https://github.com/HKUDS/nanobot/blob/104917aaec8b351edcbbc87a64fa6b71eb6e096b/nanobot/agent/subagent.py)):

```python
@dataclass(slots=True)
class SubagentStatus:
    """Real-time status of a running subagent."""

    task_id: str
    label: str
    task_description: str
    started_at: float          # time.monotonic()
    # queued | initializing | awaiting_tools | tools_completed | final_response | done | error
    phase: str = "initializing"
    iteration: int = 0
```

Four concurrent subagents and seven named phases — enough for long-horizon goals, cron jobs, and one person's parallel work; not enough to simulate an organization. That is a chosen trade-off, not an accidental limit.

## Persona is Markdown, not constants in code

The agent's "soul" does not live in Python. The core ships Markdown templates: `SOUL.md` for personality, `USER.md` for user context, plus `AGENTS.md` and `HEARTBEAT.md` (the [nanobot/templates](https://github.com/HKUDS/nanobot/blob/104917aaec8b351edcbbc87a64fa6b71eb6e096b/nanobot/templates/SOUL.md) directory). `SOUL.md` opens with a very short rule about acting, for example the line: "Solve by doing, not by describing what I would do." (nanobot's SOUL.md template). Those two persona files are in turn maintained by the "Dream" memory mechanism — the [identity.md](https://github.com/HKUDS/nanobot/blob/104917aaec8b351edcbbc87a64fa6b71eb6e096b/nanobot/templates/agent/identity.md) template notes they are "automatically managed by Dream — do not edit directly". The persona is therefore living data, not a compiled constant. Rendering is declarative too: the same persona template hands Telegram clients "short paragraphs, avoid headings" and email clients "clear sections" — branching by channel inside the template itself. User skills follow the same declarative pattern: a `skills/<name>/SKILL.md` folder, the same model Wakii walked through in the [custom skill guide](/blog/guide-custom-skill-101/).

Nanobot shows that an everyday agent does not require hand-configuring every part — the same spirit as Wakii's setup: the kit installs itself on first run into `~/.claude/`, idempotently, without touching existing config. If you are just starting out, the [getting-started](/docs/getting-started/) page goes from install to a first agent in minutes.

## What Wakii learns

- **ADOPT** — measure your surface with a script that declares its boundary first. `core_agent_lines.sh` does not count vaguely: it defines the core as 5 specific packages, then counts, keeping tools/channels in separate buckets. Wakii can apply this to counting the kit's surface: the skills catalog should be counted inside the `src/data/skills.ts` array (20 total / 13 public at the time of writing) rather than by whole-file grep — the miscount pattern 21/14 is already documented in the project's claims registry. A single `check` command printing skill/agent/CLI counts from the canonical source would catch this drift early.
- **DIRECTION** — named status phases for long-running agents. `SubagentStatus` lists phases by name (`queued`, `initializing`, `awaiting_tools`, `tools_completed`, `final_response`, `done`, with errors separate) instead of a busy/idle flag. Wakii's story view already shows progress per SF tier; as worktrees and agents run longer, this kind of named phase label is worth considering so the reader knows exactly which stage an agent is in.
- **WATCH** — the cost of an integration ecosystem. The `channels/` bucket is 64,193 lines — more than 3x the 17,749-line core (running the repo's script at commit `104917a`). The core stays minimal because the Telegram/Discord/Slack integrations live entirely outside it. Wakii is watching this so that when a new communication channel is needed beyond today's phone and desktop, the lesson is to split out a bucket rather than bloat the core.

If nanobot's way of keeping a surface small appeals to you, Wakii shares that philosophy — grab the desktop or Android build and start from the getting-started page above.
