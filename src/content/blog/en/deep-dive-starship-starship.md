---
title: "Starship: the fast, cross-shell prompt"
description: "How Starship works — one Rust binary across ten shells, 100+ signal modules, TOML config that degrades safely — and the prompt as workspace-state signal in a multi-worktree workflow."
pubDate: "2026-10-20"
category: "tech"
tags: ["terminal", "cli", "workflow"]
draft: false
---

The shell prompt is the text you look at most in a working day — and the cheapest signal for answering a question that repeats all day long: "which repo am I in, which branch, is the tree dirty." In a workflow that runs several worktrees in parallel, the question becomes "which SF's worktree am I in" — grabbing the wrong worktree means editing the wrong branch. Starship answers with the prompt line itself: 59,816 stars, 2,654 forks, ISC license (per GitHub API on 2026-09-08), self-described in the README as "The minimal, blazing-fast, and infinitely customizable prompt for any shell!" ([starship/starship](https://github.com/starship/starship), GitHub API 2026-09-08). Behind the marketing line is an architecture worth studying: how to distribute one binary across many environments, and how to handle a user's broken config.

## TL;DR

- One Rust binary, ten shells wired through thin init scripts in `src/init/` — bash, zsh, fish, PowerShell, Nushell…
- The prompt is composed from 100+ independent modules: git branch, git status, docker context, command duration, even an agent's context window.
- Broken TOML config never crashes the prompt — `ModuleConfig::load` catches the error, warns, and falls back to defaults.
- git_status computes repo state in-process via gitoxide and renders ten status states as symbols.
- Wakii takes two lessons right away: config degrades safely, and ambient workspace-state signals work.

## One binary, ten shells

Starship's approach to "any shell" is a lesson in boundaries. All the logic — running modules, matching patterns, rendering ANSI — lives in a single Rust binary. Every shell needs exactly one thing: a thin init script that tells the shell "before printing the prompt, call starship." The `src/init/` directory (probed via GitHub API on 2026-09-08) holds exactly ten scripts:

```
src/init/
├── starship.bash    ├── starship.ps1     (PowerShell)
├── starship.zsh     ├── starship.nu      (Nushell)
├── starship.fish    ├── starship.tcsh
├── starship.elv     ├── starship.ion
├── starship.lua     └── starship.xsh     (Xonsh)
```

(source: [src/init directory @ commit 864500b](https://github.com/starship/starship/tree/864500b26904cd3cc01fc2a19d3ad068bd1517a2/src/init), probed 2026-09-08)

Each script is only a bridge: hook that shell's prompt, call the binary, receive the rendered string. The integration delta stays minimal — adding a new shell touches none of the 100+ modules; you write one more thin script and you're done. That is how a single-binary product covers many environments without ballooning into ten codebases.

## 100+ modules: one signal per module

A Starship prompt is assembled from independent modules. The file `src/module.rs` declares the `ALL_MODULES` const — a list of more than 100 names: `aws`, `docker_context`, `git_branch`, `git_commit`, `git_metrics`, `git_state`, `git_status`, `cmd_duration`, `directory`… ([src/module.rs @ commit 864500b](https://github.com/starship/starship/blob/864500b26904cd3cc01fc2a19d3ad068bd1517a2/src/module.rs), probed 2026-09-08). Each module is one file in `src/modules/`, its function returning `Option<Module>` — inapplicable to the current context means None, and the module vanishes from the prompt; no module knows any other exists.

For a worktree workflow, the most valuable block of signal is `git_status`. Its doc comment enumerates the full set of repo states as symbols: `=` merge conflict, `⇡` ahead, `⇣` behind, `?` untracked, `!` modified, `+` staged, `✘` deleted ([src/modules/git_status.rs @ commit 864500b](https://github.com/starship/starship/blob/864500b26904cd3cc01fc2a19d3ad068bd1517a2/src/modules/git_status.rs), probed 2026-09-08). Underneath, it uses gitoxide — the same pure-Rust git library bat uses — to compute status in-process, with a rayon thread pool keeping render time imperceptible. The result: jumping between six worktrees, the prompt line self-reports each tree's branch and dirtiness — no `git status` keystroke required.

## TOML config and the never-crash principle

Starship's configuration is a single `starship.toml`: each module gets its own section, with symbol, style, and display thresholds to tweak. The instructive part is how the code handles broken config. The `ModuleConfig` trait in `src/config.rs` parses TOML through serde, and the `load` function has a deliberate behavior:

```rust
fn load<V: Into<ValueRef<'a>>>(config: V) -> Self {
    match Self::from_config(config) {
        Ok(config) => config,
        Err(e) => {
            log::warn!("Failed to load config value: {e}");
            Self::default()
        }
    }
}
```

(source: [src/config.rs @ commit 864500b](https://github.com/starship/starship/blob/864500b26904cd3cc01fc2a19d3ad068bd1517a2/src/config.rs), probed 2026-09-08)

Bad config — a missing field, a wrong type, a hand-edited TOML with a stray comma — does not crash and does not blank the prompt: it logs a warning and falls back to defaults. For a component running dozens of times per minute in front of the user, that's the right priority: a stale-default prompt beats a missing one.

## The prompt becomes an agent supervision surface

Starship's module list includes a notable group: `claude_context`, `claude_cost`, `claude_model`. The `claude_context` module reads Claude Code data from its context — context window size and the used percentage — then picks a display style by threshold (`display` entries with `threshold` values), like a battery indicator: the closer to full, the louder the color ([src/modules/claude_context.rs @ commit 864500b](https://github.com/starship/starship/blob/864500b26904cd3cc01fc2a19d3ad068bd1517a2/src/modules/claude_context.rs), probed 2026-09-08). The prompt — the cheapest place to glance — now also reports the state of the agent running in that directory. Ambient signal is exactly what a multi-agent workflow needs: Wakii concentrates state into the story view and checks three layers via its watchdog — the process is in the [superpowers-panel docs](/docs/superpowers-panel/) — and the experience of splitting worktrees so agents don't collide is told in [parallel worktrees for isolation](/blog/parallel-worktrees-isolation/); Starship adds the cheapest layer of all: the prompt line right under your hands.

## What Wakii learns

- **ADOPT** — broken config degrades, never crashes: Starship's `ModuleConfig::load` catches TOML errors, warns, falls back to defaults; the prompt still renders. Concrete proposal: every config-loading path in Wakii's kit and app (user TOML/JSON, skill config) follows the same contract — warn + default, never block the workflow on bad config.
- **DIRECTION** — ambient agent-state signals: the claude_context module lifts context-window percentage onto the prompt with threshold colors. Wakii already has the concentrated story view; a direction worth exploring is lightweight signals on secondary surfaces (terminal title, notifications) for running agents — needs surface design, so not now.
- **WATCH** — one binary + thin init per host: heavy logic in one place, each shell just a bridge script. If Wakii's kit CLIs need to cover many environments (macOS, Linux, SSH hosts), this is the pattern that keeps integration cost low — watching before it's needed.

Wakii is an agentic IDE with a built-in agent team that works after install — for the tooling overview, [agents-and-kit docs](/docs/agents-and-kit/) is the place to start.
