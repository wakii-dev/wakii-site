---
title: "Crush: a coding agent with Charm's terminal DNA"
description: "A close read of Crush's interaction design — side-by-side diffs, structured question dialogs, shared workspaces — and what a terminal-native coding agent teaches about pairing UX."
pubDate: "2026-10-09"
category: "tech"
tags: ["terminal", "cli", "design"]
draft: false
---

Coding agents that live in the terminal are usually built in a hurry: one input box, output scrolling past, and diffs you have to open a separate editor to read properly. Crush takes the opposite approach. It comes from Charm — the team behind bubbletea and lipgloss, the TUI libraries most Go terminal apps are built on — and it brings that same standard of TUI craft to an agent tool. What is worth reading here is not the feature list but the interaction design: how diffs are rendered, how the agent asks for permission, and what changes when the terminal is treated like a product.

## TL;DR

- Crush is a coding agent that runs in the terminal, from the makers of bubbletea/lipgloss; 27,953 stars per the GitHub API on 2026-09-08, with commits pushed on the probe day itself.
- Diffs render side-by-side inside the TUI; the algorithm that pairs deleted and inserted lines fits in one Go file.
- The agent asks through structured dialogs — pick one, pick many, forms, free text — and notifications are only sent when the terminal is not focused.
- Multiple clients can attach to one workspace via crush serve, with two presence signals: IsBusy and AttachedClients.
- The license is not a standard SPDX identifier (the repo declares FSL-1.1-MIT): the code is publicly available on GitHub under its own terms.

## The numbers: what the release cadence says

Charm positions Crush in one line — the README opens with "Your new coding bestie, now available in your favourite terminal." (source: Crush's README, per the GitHub API on 2026-09-08). The numbers:

| Metric | Value @ 2026-09-08 |
|---|---|
| Stars | 27,953 (per the GitHub API on 2026-09-08) |
| Last push | 2026-09-08 — the probe day itself |
| Archived | false |
| License (GitHub API) | NOASSERTION |

On the license: the GitHub API reports NOASSERTION, meaning it does not map to a common SPDX identifier. The LICENSE.md file in the repo declares the Functional Source License 1.1 (FSL-1.1-MIT). The safe way to describe it: the code is publicly available on GitHub under its own terms — read the repo before shipping it in a product.

The release cadence is the liveliest signal:

| Tag | Published (UTC) |
|---|---|
| nightly | 2026-09-08 |
| v0.92.0 | 2026-08-31 |
| v0.91.2 | 2026-08-26 |
| v0.91.1 | 2026-08-25 |
| v0.91.0 | 2026-08-22 |
| v0.90.0 | 2026-08-19 |

Four versioned releases in 12 days, plus a nightly channel — per the GitHub API on 2026-09-08. Versions are still v0.x: fast-moving, no API stability promise yet.

## Two-column diffs: when the terminal is wide enough for both eyes

The file tree, per the GitHub API on 2026-09-08, shows where the weight sits: the `internal/ui` package has 144 files excluding tests — the largest in the repo, twice the size of `internal/agent` (109 files). The TUI is not a skin over Crush; it is the body.

One of the most instructive screens is `internal/ui/diffview`: diffs render side-by-side, before and after columns next to each other, right in the terminal. The core pairing algorithm lives in [split.go](https://github.com/charmbracelet/crush/blob/563d658bccb56019edc1136c3c262ba0a81ccc99/internal/ui/diffview/split.go):

```go
type splitLine struct {
	before *udiff.Line
	after  *udiff.Line
}
```

(excerpt at the HEAD commit on 2026-09-08)

`hunkToSplit` walks the hunk line by line: a deleted line is kept as the "before" column while an inner loop searches for its matching inserted line to fill the "after" column; context lines stand in both columns. The result reads like a diff in an IDE — while the entire screen is a grid of characters.

The point is not side-by-side itself; every IDE has it. The point is where it appears: in the same place you are talking to the agent. Read the diff, decide, keep typing — no window switching. That is the rhythm of real pair programming.

## Structured questions, well-timed pings

The `internal/ui/dialog` directory, condensed from the repo tree (per the GitHub API on 2026-09-08):

```text
internal/ui/dialog/
  permissions.go        # permission per tool call
  question_yesno.go     # quick confirm
  question_single.go    # pick one
  question_multi.go     # pick many
  question_freetext.go  # free text
  question_form.go      # multi-field form
  sessions.go           # session picker
  models.go             # model picker
```

The agent does not ask through free-form prompts; it asks through dialogs shaped to the answer. The README states the default model plainly: "By default, Crush will ask you for permission before running tool calls." (source: Crush's README, per the GitHub API on 2026-09-08). To thin out that layer there are two levers: list exceptions with `permissions allow`, or use `--yolo` — which the README itself warns about: "Be very, very careful with this feature."

In the same spirit, notifications carry one interesting constraint. The README says: "Crush sends desktop notifications when a tool call requires permission and when the agent finishes its turn." — and the very next sentence sets the condition: they are only sent when the terminal window is not focused. That treats a notification as what it really is: a way to call someone back, not a receipt for someone who is already watching.

## One session, many windows

Crush splits the client from the backend: run `crush serve` and multiple TUIs can point at the same workspace — grouped by working directory (`--cwd`), sharing the session list, the permission queue, and LSP and MCP state.

```text
TUI client A ─┐                              ┌─ session list
TUI client B ─┼── crush serve ───────────────┼─ permission queue
TUI client C ─┘   workspace (one --cwd)      └─ LSP, MCP, message history
```

The README describes two signals that reveal a session in use: "IsBusy is set while an agent turn is in flight for that session." — alongside `AttachedClients`, which counts the clients currently viewing it. Joining is silent: point another client at the same `--cwd` and you are in, but each client starts in a fresh session; to watch a live one you pick it in the session picker. Workspace-level decisions follow first-wins rules: a later client's `--yolo` or `--debug` cannot change the flags the first client set. The workspace lives as long as one event stream stays open; when the last disconnects, it is torn down. (all from the README section "Sharing a workspace across clients", per the GitHub API on 2026-09-08)

## LSP context and cross-reading skills

First, LSP. The README introduces it in exactly one line: "Crush uses LSPs for additional context, just like you do." The configuration matches that spirit — declared as commands, not JSON:

```bash
lsp add go --command "gopls" --env "GOTOOLCHAIN go1.24.5"
lsp add typescript --command "typescript-language-server" --args --stdio
```

(source: Crush's README, per the GitHub API on 2026-09-08)

On the code side, [manager.go](https://github.com/charmbracelet/crush/blob/563d658bccb56019edc1136c3c262ba0a81ccc99/internal/lsp/manager.go) initializes clients lazily — each language server only starts when needed:

```go
// Manager handles lazy initialization of LSP clients based on file types.
type Manager struct {
	clients     *csync.Map[string, *Client]
	unavailable *csync.Map[string, time.Time]
```

(excerpt at the HEAD commit on 2026-09-08)

Second, skills. Crush supports the Agent Skills standard (agentskills.io) and scans the directories other tools already use: `~/.claude/skills/`, the project-level `.claude/skills`, `.cursor/skills`, and several XDG locations. A skill marked `user-invocable: true` appears directly in the commands palette with a `user:` or `project:` prefix. One terminal agent reading another agent's skills — two systems interoperating without anyone signing a shared agreement.

## What Wakii learns

- **ADOPT — notify only when the user has left the window.** Wakii already ships notification routing for gate-open/gate-closed with full routing fields and tap-to-navigate. Crush adds a condition Wakii has not spoken to: stay silent while the window is focused. A gate closing while you are watching the panel needs no toast — the panel updates itself; ping only when you have stepped away. Minor risk: focus reporting depends on the OS, so fall back to "always send" when the state cannot be read.
- **DIRECTION — presence for sessions.** IsBusy and AttachedClients solve exactly the problem of several people looking at one session: Wakii's story view already shows per-SF progress, but not "an agent turn is running right now" or "how many clients are watching". Worth folding into the story view roadmap.
- **DIRECTION — multi-select gates.** Crush's dialog set includes multi-select and forms; Wakii's gates today are choice and free-text. A gate that approves several items at once — say, a whole batch of verification results — is a natural extension that keeps the supervised model intact.
- **WATCH — cross-tool skill discovery.** Crush reads `~/.claude/skills/` and follows the agentskills.io standard — the same direction as the skills import/export item on Wakii's watch list. The grade flips when the skills manifest decision lands: Wakii's kit should interoperate both ways with that standard.

The numbers are only the surface; what makes Crush worth studying is that every interaction — diff, question, notification, session — is designed like a real TUI product. How Wakii organizes an agent team around the terminal and the panel is covered in the [agents & kit docs](/docs/agents-and-kit/); splitting the terminal for parallel work is in [terminal splits](/blog/feature-terminal-splits/), and the notification philosophy behind the focus condition above is in [notification routing](/blog/feature-notification-keyboard/).

Wakii is an agentic IDE with a built-in superpowers team — download it, let the agents run, and just decide.
