---
title: "Your first custom skill: SKILL.md, try it, share it"
description: "Create a skill of your own — one directory, one SKILL.md file — verify it with orca skills installed, edit it without a build step, and share it behind a revocable unlisted link."
pubDate: "2026-09-21"
category: "tutorial"
tags: ["guide", "skills"]
draft: false
---

Your agent knows the team's commit conventions — but you repeat them every
session anyway. Or it writes tests to house style, but only when you paste
the style guide into the prompt. That is the moment a custom skill earns its
keep: packaging repeated knowledge into one Markdown file the agent reads and
applies on its own, at the right time. The kit bundled with Wakii already
does most of this for you — 20 skills total, 13 of them public in the
catalog at the time of writing (snapshot 2026-09-08) — but the most
interesting part is that you can write your own immediately, with no code.
This post walks one full loop: write, place, try, share.

TL;DR:

- A skill is a directory containing `SKILL.md`: frontmatter with `name` and
  `description`, body is the guidance.
- Drop it in `~/.claude/skills/<name>/` and the agent finds it — the UI
  already scans the skill homes.
- Verify with `orca skills installed`; editing the file is enough — no build
  step exists.
- Share it with `orca skills share` — one unlisted, revocable link; treat
  the link like a credential.

## What a skill is: one directory, one SKILL.md

A skill is not a plugin, and it needs no manifest or compilation step. It is
a directory containing exactly one file that matters: `SKILL.md`. The
frontmatter declares `name` and `description`; the Markdown body is what the
agent reads when the skill activates:

```ascii
~/.claude/skills/
└── commit-style/            ← directory name
    └── SKILL.md             ← the only required file
        ---
        name: commit-style   ← the identifier agents call by
        description: ...     ← WHEN to use it — the agent decides from this
        ---
        (Markdown body: rules, examples, checklists)
```

*Source: diagram drawn from the SKILL.md structure in the product's skills
docs, retrieved 2026-09-08.*

Most of the weight sits in the `description`: that is the sentence the agent
uses to decide when to read the skill. The [skills catalog
tour](/blog/skills-catalog-tour/) already walked through the bundled ones;
run `orca skills list` and you see the same pattern immediately — each
platform skill that ships with the CLI is one `name: when to use` line
(trimmed):

```bash
$ orca skills list                   # (trimmed: descriptions cut short)
computer-use: Use Orca's computer-use CLI for OS/window-level inspection …
orca-cli: Use the public `orca` CLI to operate Orca-managed worktrees …
orca-linear: Use Orca's Linear CLI through `orca linear ...` commands …
(8 skills bundled with the CLI at the time of the run — also: linear-tickets,
orca-emulator, orca-emulator-android, orca-per-workspace-env, orchestration)
```

*Source: `orca skills list`, retrieved 2026-09-08.*

## Where to put it so the agent picks it up

The standard location for Claude Code is `~/.claude/skills/<name>/`. The
product docs describe the discovery mechanism verbatim:

> "Orca's skill UI scans installed skill homes for Claude, Codex, Agent
> Skills, and OMP (`~/.omp/agent/skills`), so skills placed there show up
> without a manual symlink."

*Source: skills docs, "Discovery sources" section, retrieved 2026-09-08.*

In other words, you drop the file into a home the UI already scans — no
registration, no symlink. On a machine running Wakii, that directory usually
has prior residents: the kit installs itself into `~/.claude/` on the app's
first run, idempotently, without touching existing config — the zero-setup
mechanism covered in its own post.

## Writing your first skill in thirty seconds

A small example that works for real: a skill that keeps commit messages to
your repo's standard. Three steps — create the directory, write the file,
save:

```markdown
---
name: commit-style
description: Use when writing or reviewing a git commit message in this repo —
  enforces subject under 72 chars, imperative mood, and a body that explains
  why the change exists.
---

# Commit style

- Subject: imperative mood, max 72 characters, no trailing period.
- Body (when needed): explain WHY, not WHAT — the diff already shows what.
- Reference the issue id in the subject when one exists.
```

Two things trip people up. First, write the `description` as "Use when…"
with concrete conditions — it is the sentence matched against the work at
hand; a vague one leaves the skill waiting forever. Second, the body is
where real rules live, with examples of correct output — dissecting a mistake
is always more useful than listing principles.

## Try it now: installed, invoke it, edit and rerun

The fastest check: `orca skills installed` — lists every skill the UI
discovers on the machine, with its placement (this is the listing on the
machine this post was written on, including personal and plugin skills — it
is not the catalog number):

```bash
$ orca skills installed              # (trimmed: descriptions cut short)
brainstorm (943fa2a3004dab96)
  Claude home
bridge-router (3e4ef046fcbc33a4)
  Claude home
computer-use (2a6e81ddac38c33a)
  Agent skills home
```

*Source: `orca skills installed`, retrieved 2026-09-08. Real directory names
inside `~/.claude/skills/` on this machine: brainstorm, bridge-router,
computer-use, frontend-design, orchestration, prompt-master… (trimmed).*

Once the `SKILL.md` is saved, open an agent session and ask directly: "use
the commit-style skill to review the commit I just wrote". The agent reads
the `description`, matches it against the current task, and loads the skill
body into context. Want to change it? A skill is plain Markdown — save the
file and the next invocation uses the new version. No build, no restart.

## Sharing with other machines: one unlisted, revocable link

The docs have a section for exactly this, "Share private skills between
hosts": open Skills → Share skills to publish one skill or a bundle behind a
single unlisted, revocable link. Publishing requires an account; each
published version is immutable — later local edits never silently change
what recipients install. Anyone with an active link can inspect and install
the shared skills without signing in, so the docs close with exactly one
sentence: treat the link like a credential.

From the CLI, the command looks like this (first enable the default-off
permission in Settings → Share Skills):

```bash
$ orca skills share --help           # (excerpt)
Usage: orca skills share --skill <selector> [--skill <selector> ...] --bundle-name <name> [--json]
Examples:
  $ orca skills share --skill frontend --skill testing --bundle-name "Team Toolkit" --json
```

*Source: `orca skills share --help`, retrieved 2026-09-08.*

On the receiving side: pick all of the bundle or a subset, choose global or
workspace scope, then install onto this computer, a paired runtime, WSL, or
an SSH host. Revoking the link blocks future access but does not remove
copies already installed — manage installed copies via Skills → Manage
installs, and copy or revoke links via Settings → Share Skills.

## Skill not showing up: four usual causes

| Symptom | Usual cause | Fix |
|---|---|---|
| Skill missing from `orca skills installed` | Wrong location — missing parent directory or nested too deep | Match `~/.claude/skills/<name>/SKILL.md` exactly |
| Agent never activates it | Vague `description` that never says when to use it | Rewrite as "Use when…" with concrete conditions |
| Directory renamed but agent still uses the old name | The identifier is the `name` field, not the directory name | Change `name` in the frontmatter |
| Skill lives in a team repo | A repo with `skills/<name>/SKILL.md` installs via its own command | `npx skills add <repo> --skill <name> --global` |

*Source: compiled from the skills docs ("Discovery sources", "Add your own
skills" sections) and `orca skills --help`, retrieved 2026-09-08.*

The nine-agent team and the kit's skill count are described on the
[agents & kit](/docs/agents-and-kit/) page; the public part of the catalog
lives on the site's Skills page. Now try it: create one skill for a rule your
team repeats weekly — thirty seconds for the first file, and the agent will
find it exactly when it needs it.
