---
title: "Wiring Linear and GitHub: issue to worktree, worktree to PR"
description: "Two connections in Settings → Integrations: create a worktree from an issue with a prefilled name and Linear's suggested branch name, per-team opt-in status sync, and an agent that reads Linear through orca linear."
pubDate: "2026-09-23"
category: "tutorial"
tags: ["guide", "linear", "workflow"]
draft: false
---

Your work lives in three places: issues on Linear, reviews on GitHub, code
in a worktree. Without a bridge, you are the sync layer — copying issue
titles into branch names, pasting PR links back onto issues, opening a CI
tab to see whether anything is green. Wakii wires both sources into the
worktree instead: create a worktree from an issue and it already knows which
issue it serves, and the PR finds its way back to that same place. This post
walks both connections and the spots where they stumble: tokens, scopes,
rate limits.

TL;DR:

- GitHub and Linear connect in Settings → Integrations; reviews, checks, and
  Actions surface right inside the worktree.
- Creating a worktree from an issue prefills the name and attaches the issue
  ID; when Linear suggests a branch name, that exact name becomes the branch.
- Status sync (an issue moving to In Progress when a worktree is created) is
  opt-in per team — without it, no agent changes state on your behalf.
- Agents read and write Linear through `orca linear`; attaching a PR link to
  an issue is one command.
- Expired tokens and rate limits have a three-command check that takes half
  a minute.

## Wiring GitHub: reviews, checks, and Actions inside the worktree

The point of this connection is not notifications — it is bringing the whole
review state to where you are already looking at the code. The docs state it
plainly:

> "Hosted code review is a first-class part of the worktree. Orca links
> worktrees to their pull requests or merge requests, surfaces review state
> inline, and lets you triage issues without leaving the app."

*Source: the "Hosted reviews, issues & Actions" docs, retrieved 2026-09-08.*

How to connect: open Settings → Integrations and connect the provider your
repository uses — GitHub has the deepest Actions and issue support. Once
connected, three things happen right inside the worktree. GitHub checks,
reviews, and comments open inline in a PR tab. When an Actions check fails,
the docs describe the signal:

> "Failed GitHub Actions checks show up as a red chip on the worktree. Click
> through to see the failing job logs inline."

And when you would rather not fix the failing check yourself, the **Fix
broken checks** action in the PR view hands the failed check names and links
to an agent — the rest is its job.

*Source: the two excerpts above from the "Hosted reviews, issues & Actions"
docs, retrieved 2026-09-08.*

## Wiring Linear: one API token, pick a team

The second connection is exactly three steps, quoted verbatim from the docs:

> "1. Open Settings → Integrations → Linear.
> 2. Paste a personal API token from Linear → Settings → API.
> 3. Pick the team(s) you want to see."

*Source: the "Linear items drawer" docs, Setup section, retrieved
2026-09-08.*

The personal token comes from Linear's own API settings page
(linear.app/settings/api) — Wakii only uses it to read and write on your
behalf. Picking the right team is what makes the task drawer show the right
set of issues — the drawer combines GitHub and Linear issues into one shared
view.

## From issue to worktree: the composer prefills, Linear names the branch

This is the step that saves the most clicks. Creating a worktree from an
issue does not open a blank form. The docs describe what happens:

> "Creating a worktree from a Linear issue opens the interactive workspace
> composer (same path as GitHub items) so issue-command automation, SSH, and
> folder workspaces apply. Orca pre-fills the name and attaches the issue ID.
> When Linear exposes a branch name for the issue, Orca uses that as the
> worktree branch (same naming Linear would suggest), not only a slug of the
> title. The issue detail menu can **Copy suggested branch name**."

*Source: the "Linear items drawer" docs, retrieved 2026-09-08.*

The sentence worth pausing on is the one about branch names: if Linear
already carries a branch name for the issue, Wakii uses that exact name —
the same naming Linear itself would suggest — instead of hashing the title
into a slug. The branch in git and the suggested branch in Linear have no
room to drift apart, from the second of creation.

After creation you can still swap or drop the link without recreating
anything:

> "After create, open **Edit Worktree Details** on the workspace card and use
> the **Issue** field with the **Linear** chip (or paste a Linear URL) to link
> or change the issue without recreating the worktree. GitHub and Linear share
> that one field — saving a new link replaces the previous provider link."

*Source: the "Linear items drawer" docs, retrieved 2026-09-08.*

One `Issue` field serves both GitHub and Linear — a new link replaces the old
one, never stacks on it. As for why one piece of work should have exactly one
branch and one PR, the [one branch, one PR](/blog/one-branch-one-pr/) post
argued it from the process side — the issue-to-worktree wiring here is the
first half of that rule, automated.

## Status sync is opt-in: no agent changes state on your behalf

The docs put a callout right on the Linear page:

> "Linear status sync (moving an issue to 'In Progress' when a worktree is
> created) is opt-in per team."

*Source: the "Linear items drawer" docs, retrieved 2026-09-08.*

By default, creating a worktree does not silently flip the issue's state. In
Wakii's story workflow this is deliberate: an issue moves to In Progress
when its sub-feature truly starts, and to Done when it has merged and
verified — status is part of the discipline, not a side effect. If you want
sync on for your team, enable it in the Linear section of Integrations; if
you want an explicit change, there is a command for that too —
`orca linear status set --to <state>` is a declared action.

## Giving the agent Linear access: `orca linear`

Agents do not read Linear off the screen — they have their own CLI surface.
The docs describe it:

> "Agents can read and write Linear through `orca linear` (and the
> `orca-linear` skill). That surface includes MCP-compatible create/update
> and list filters (`save-issue`, `list-issues`, relation add/remove) plus
> issue context flags such as `--activity` and `--full`."

*Source: the "Linear items drawer" docs, Agents and CLI section, retrieved
2026-09-08.*

The command I used most while writing this very post — reading the context
of an in-flight issue, piping the JSON through a three-field filter:

```bash
$ orca linear issue FI-377 --json | python3 -c "import sys,json; i=json.load(sys.stdin)['result']['issue']; print(i['identifier'], '|', i['title'], '|', i['state']['name'])"
FI-377 | [SF-4] Series Guides — 10 bài — Blog batch 2 (FI-373) | In Progress
```

*Source: command run for real on the machine this post was written on,
retrieved 2026-09-08.*

The `--current` flag lets an agent fetch the issue attached to the current
worktree — an agent working inside a worktree does not need you to paste an
ID into its prompt. The reverse direction is one command as well:
`orca linear attach <id> --url <PR-link>` attaches the PR link to the issue,
so the lifecycle closes in the place the whole team is looking at. Why
Linear was chosen as the team's shared memory in the first place is the
subject of the [Linear as external memory](/blog/linear-as-external-memory/)
post — these commands are just how agents talk to that memory.

## When the wiring breaks: tokens, scopes, and rate limits

Three common failures, in order of how often they show up.

Linear shows no issues at all: the token expired or was revoked. Paste a
fresh token from linear.app/settings/api into Settings → Integrations →
Linear — replacing the token is the whole fix, nothing else needs
reconnecting.

The PR panel or checks stop refreshing: most often a GitHub rate limit or a
`gh` auth problem. The docs keep a three-command quick check, quoted
verbatim:

```bash
gh auth status -h github.com
gh api user
gh api rate_limit --jq '.resources.core'
```

*Source: the Troubleshooting & FAQ docs, GitHub errors section, retrieved
2026-09-08.*

The last command, on the machine this post was written on, returned:

```json
{"limit":5000,"remaining":5000,"reset":1788845034,"used":0}
```

*Source: `gh api rate_limit --jq '.resources.core'`, run for real, retrieved
2026-09-08.*

`remaining` close to `limit` means you have not touched the ceiling;
`remaining` near zero is why the panel stopped refreshing — wait for the
`reset` timestamp.

The whole lifecycle — issue → worktree → review → PR — rolls up to a single
page in the [story workflow](/docs/story-workflow/) docs, where Linear is
the place plans get published and every sub-feature is an issue.

Open Settings → Integrations, wire GitHub and Linear in a few minutes, then
create your first worktree from a real issue — the name prefills, the branch
name is already there, and the PR finds its way home.
