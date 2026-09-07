---
title: "A tour of Wakii's public skills"
description: "Walk the /skills/ page and this site's own skills.ts: the public skills catalog in three groups, each card carrying its command, description, and how it works — with real grep transcripts so you can recount the numbers at reading time."
pubDate: "2026-09-07"
category: "tutorial"
tags: ["skills", "agents", "wakii"]
draft: false
---

Introductions to "AI agents with skills" usually stop at prose: name a few
skills, show a few screenshots, done. Wakii takes the more verifiable route:
every public skill in the kit sits on one static page,
[/skills/](/skills/), and that page's content is generated straight from a
single data file — `src/data/skills.ts` of this very site. This post is a tour
with a map: what a skill actually is in the agent architecture, what the three
public groups contain, and how to recount each number with two grep commands.
Because a number is only worth trusting when you can re-run it — at the exact
moment you are reading.

TL;DR:

- A skill is a process document the agent loads on demand — not preloaded;
  each skill is a `SKILL.md` file the agent reads and then follows.
- The `/skills/` page is the public face of that catalog, generated straight
  from `src/data/skills.ts`: one interface, each entry carrying a command,
  bilingual descriptions, and bilingual how-it-works text.
- As of this writing (2026-09-07): 20 skills in the data file, 13 public, in
  three groups — workflow(4), design(6), reference(3).
- The remaining 7 entries are internal machinery and platform skills: present
  in the file, deliberately off the page, so the total stays verifiable.
- The post ends with a real grep transcript — the
  read-the-number-at-writing-time rule matters more than any specific figure.

## A skill is what an agent loads on demand

A skill is not a library loaded into the runtime at startup. It is a process
document: the agent keeps a list of skill names, and when a situation calls
for one — "write a plan for this feature", "review the UI that was just
built" — it opens exactly that document, reads it, and follows the process
inside. Loading on demand means exactly that: context is paid per use, not up
front for the whole shelf. And because a skill is a document at heart, it can
be verified with the naked eye: open the file, read it.

The data file behind `/skills/` declares its own source in the first lines:

```ts
/**
 * Skills catalog data — source of truth for /skills (SF-2).
 * Source: frontmatter of the 20 skills in the ~/.claude/skills folders
 * (SKILL.md, counted 2026-09-04). Pattern follows src/i18n/landing.ts: one interface,
 * skill names + commands stay English, desc/how carried in EN + VI.
 */
```

*Source: src/data/skills.ts (header comment), retrieved 2026-09-07.*

Read the comment: each skill in the kit is a `SKILL.md` file in
`~/.claude/skills`, and this data file carries only their frontmatter. The
catalog page, in other words, is nobody's summary from memory — it copies its
structure straight from each skill's own document. That structure fits in one
interface:

```ts
export interface Skill {
  id: string;
  name: string;
  /** slash-command form */
  command: string;
  category: SkillCategory;
  public: boolean;
  /** one-sentence description */
  desc_en: string;
  desc_vi: string;
  /** how it works, 2-3 sentences */
  how_en: string;
  how_vi: string;
}
```

*Source: src/data/skills.ts, retrieved 2026-09-07.*

The last fields are exactly the three things you read on each card of
`/skills/`: the slash command (`/story-workflow`), what it does (desc, one
sentence, in two languages), and how it works (how, two to three sentences,
also in two languages). The `public` field is the gate between the data file
and the page — the subject of the next section.

## Three groups, thirteen skills

The `/skills/` page does not render all 20 entries — it takes only the public
ones, and that choice is written as a comment at the top of the page file:

```js
 * Data: src/data/skills.ts (READ-ONLY) — filter public === true → 13 skills,
 * grouped workflow(4) → design(6) → reference(3).
```

*Source: src/pages/skills.astro (header comment), retrieved 2026-09-07.*

On the data side, the public criterion is defined up front, along with the
reason the rest of the entries stay in the file:

```ts
 * Triage (SF-1, pending PM confirm — gate for SF-2 START):
 * `public: true` = catalog-worthy; false = platform-specific (Orca app
 * control) or internal (agent-facing machinery), excluded from /skills.
 * Data module still carries all 20 so the count stays verifiable.
```

*Source: src/data/skills.ts (header comment), retrieved 2026-09-07.*

The three public groups, with all thirteen names — as of this writing:

| Group | Public count | Skills |
|---|---|---|
| workflow | 4 | story-workflow · brainstorm · writing-plans-linear · orca-superpowers-workflow |
| design | 6 | frontend-design · gpt-taste · design-taste-frontend · image-to-code · mock-prototype · web-design-guidelines |
| reference | 3 | figma-orientation · graph-engineering · prompt-master |

*Source: table built from src/data/skills.ts, retrieved 2026-09-07.*

The figure 13 is not someone counting cards by eye — it is the value of the
`publicCount` variable the page computes from that filter, and the hero prints
it straight out:

```astro
<h1>The kit, cell by cell.<br /><span class="hl">{publicCount} skills</span>, fully explained</h1>
```

*Source: src/pages/skills.astro (the h1 line), retrieved 2026-09-07.*

As of this writing, that line renders as "13 skills, fully explained". Add a
skill to the kit and the number on the page follows the data file on its own —
nobody edits the copy.

A quick pass through each group with one representative. workflow —
`story-workflow`: runs large features as stories — one epic issue, one
sub-feature workflow per slice, structured as a vertical tier bracket. Its
groupmates: `brainstorm` turns a rough idea into a validated spec and
implementation plan before any code exists; `writing-plans-linear` writes
plans detailed enough for an engineer with zero context and publishes them to
Linear; `orca-superpowers-workflow` wraps the whole end-to-end pipeline into
one flow.

design — `mock-prototype`: prototypes an idea as three HTML design directions,
published as links you can open and pick from, with no production code. The
other five split the UI lifecycle between them: `frontend-design` shapes UI
that reads as intentional; `gpt-taste` breaks the statistical biases of
AI-generated design; `image-to-code` turns a reference image into a real
component; `design-taste-frontend` is an audit-first pass over UI that was
already built, before it ships; and `web-design-guidelines` reviews code
against 105 concrete web interface rules.

reference — `prompt-master`: turns a rough prompt idea into one
production-ready prompt, optimized for the specific AI tool you name;
`graph-engineering` teaches graph engineering with worked examples;
`figma-orientation` routes your intent to the right official Figma skill or
MCP call before you guess wrong.

The part off the page is exactly 7 entries, as of this writing, in two layers:
the workflow's own internal machinery (`post-task-ritual`, `execute-plan`) and
platform skills that operate the Orca app (`bridge-router`, `orca-cli`,
`orca-bridge`, `orchestration`, `computer-use`). The point worth noticing:
they are not deleted from the data file — all 20 entries stay, exactly as the
line "Data module still carries all 20 so the count stays verifiable" quoted
above says. Hidden from the page is a presentation decision; gone from the
file would be a lost definition.

## Read the number when you write, don't memorize

Numbers in a post like this have a shelf life. The kit is a growing product:
add a skill, add an entry, and both 20 and 13 move. The data file even dates
its own count — "counted 2026-09-04", right in the header. So the rule this
content story applies to itself — and the one this post suggests you apply to
your own writing — is: re-extract numbers at writing time, never quote them
from old notes; and every number that makes it into a post carries its source
and its date.

Here are the two counting commands, run for real on the machine while writing
this post:

```bash
$ grep -c "id: '" src/data/skills.ts
20
$ grep -A6 "id: '" src/data/skills.ts | grep -c "public: true"
13
```

*Source: grep on src/data/skills.ts, retrieved 2026-09-07.*

Reading the transcript: the first command counts `id: '` lines — exactly one
per entry — giving 20. The second takes the 6 lines after each `id` line, far
enough to reach the entry's `public` line since only `name`, `command`, and
`category` sit between them — then counts entries carrying `public: true`,
giving 13. The subtraction 20 − 13 = 7 matches the two off-page layers from
the previous section. If you are reading this post on a different day, do not
trust even these numbers: re-run the two commands. What is pinned here is the
read-the-number-at-writing-time rule, not any specific figure — the kit grows,
the numbers grow, the rule stands still.

## See it yourself

Three routes, depending on how deep you want to go:

```ascii
route               where                                  what you see
──────────────────────────────────────────────────────────────────────
public page         wakii.xyz/skills/                      13 cards in 3 groups, hero self-counts
kit (MIT)           github.com/wakii-dev/wakii             each skill is one SKILL.md
site data file      src/data/skills.ts (site repo public)  grep as in the section above
```

*Source: assembled from src/pages/skills.astro + src/config.ts (REPO_URL,
SITE_URL), retrieved 2026-09-07.*

The `/skills/` page states the same spirit in its own intro: "No black boxes:
git clone the source, run make, and read along" (quoted from
src/pages/skills.astro, retrieved 2026-09-07). The kit lives in the public MIT
repo `github.com/wakii-dev/wakii`; `skills.ts` lives in this site's own repo,
which is public too — both layers are readable verbatim.

Inside the app, this catalog connects to a real place: the Superpowers panel —
the ⚡ icon in the right-hand activity bar — is where you launch the agent
team, and the skills in this post are what the agents load mid-run. The
[Superpowers panel](/docs/superpowers-panel/) page describes that panel in
detail: the two tabs ⚡ Workflow and 🌳 Story. And if you want the whole kit on
your machine, the post
[your first agent team has no setup step](/blog/zero-setup-agent-team/)
covers the remaining part: the kit installs itself into `~/.claude/` — the
very `skills` folder whose frontmatter the `/skills/` data file carries.

Wakii is an agentic IDE with a built-in superpowers team. The skills catalog
is public for one simple reason: before you let an agent run on a process, you
should be able to read that process verbatim. The `/skills/` page, the
`skills.ts` file, and the two grep commands above give you all three layers —
look, count, re-run.
