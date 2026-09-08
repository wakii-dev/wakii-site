---
title: "One destination branch, one PR: where a story converges"
description: "A long story leaves dozens of commits scattered across branches — what do you review, and where? This post walks through the convergence discipline of the story workflow: every sub-feature merges into one destination branch, story/<epic>-<slug>, the story closes with a single PR, and the merge commit is a milestone you can trace backward."
pubDate: "2026-08-31"
category: "tech"
tags: ["git", "story-workflow", "workflow"]
draft: false
---

A long story is never one agent's work: the bracket splits it into
sub-features that run in parallel, each in its own worktree, on its own
branch, with its own agent — and every agent leaves commits on its own branch.
When the story closes, the reviewer faces dozens of commits scattered across
branches: reading them in sequence reveals nothing about which piece of work
each one belongs to, and reading branch by branch loses the big picture. The
problem is not a shortage of things to review — it is the absence of one
review unit. The story workflow handles this with structure, not personal
discipline: the whole story converges onto a single destination branch, and
that branch closes with exactly one PR.

TL;DR:

- Running in parallel does not mean divergent history: each tier boundary is a
  merge point into a single destination branch — `story/<epic>-<slug>`, the
  story's own mainline.
- The whole story closes with exactly one PR: one diff with a narrative to
  review, instead of dozens of scattered commits.
- The PR is the aggregate evidence: the titles of the two real PRs in this
  post — in two different repositories — narrate what the story delivered
  before you even open the diff.
- The merge commit is an immutable milestone: from a SHA on main, one
  `gh pr view` command walks back to the PR, the branch, and the story that
  produced them.
- Agents stop at the PR: merging into the real mainline is a human gate —
  nothing irreversible happens without a person saying yes.

## A dozen branches in, one branch out

Parallelism at the sub-feature level is only half the story — the other half
is the point where everything meets. The bracket arranges sub-features into
tiers, and the merge order follows that map exactly (the tier map already has
its own post:
[brackets and tiers: a map for long-running projects](/blog/long-tasks-bracket-tiers/)).
Keep exactly one rule: working branches do not fan out and stay out — they
meet at one point, and the docs name that point verbatim:

> "Each tier boundary is a merge point into a single destination branch —
> `story/<epic>-<slug>` — which acts as the story's own mainline."

*Source: src/content/docs/en/story-workflow.md, section "5. Tiers and one
destination branch", retrieved 2026-09-07.*

Draw the whole branch block of a story under that rule:

```ascii
sf-1 ●───┐
sf-2 ●───┤     merge at tier boundaries
sf-3 ●───┼───► story/<epic>-<slug> ───► 1 PR ───► main
sf-4 ●───┘     the story's destination branch   one PR    the real mainline

  a dozen working branches in ─── one destination branch out ─── one PR seals it
```

*Source: conceptual diagram built from the destination-branch rule in
src/content/docs/en/story-workflow.md, retrieved 2026-09-07.*

Read it left to right: many working branches — one per agent; one destination
branch in the middle; and at the end, exactly one pull request connecting the
destination branch to the real mainline. No arrow runs directly from a
sub-feature branch to main: an agent's work enters the mainline through the
destination branch, and the destination branch enters main through the PR.

## The PR is the aggregate evidence

"One PR per story" sounds like a formatting rule — until you put it next to
how humans actually review. Approving thirty scattered commits is approving
thirty unjoined pieces; approving one PR is approving a single diff, plus the
narrative in its description. The docs do not say "one PR for tidiness" —
they say "one PR as evidence", verbatim:

> "When every sub-feature's gates pass and the story verifies `COMPLETE`, the
> work lands as **one clean PR** — not a dozen interleaved branches."

*Source: src/content/docs/en/story-workflow.md, section "7. One PR per story",
retrieved 2026-09-07.*

Two real PRs from two repositories running this workflow show what "aggregate
evidence" looks like. On Wakii's site repository:

```bash
$ gh pr list --repo wakii-dev/wakii-site --state merged
2	FI-349 Blog redesign — layout, category taxonomy, SEO depth, multi content type	story/fi349-blog-redesign	MERGED	2026-09-07 16:13:51 +0000 UTC
1	FI-339: Blog features — tutorials, tech notes, build logs (en/vi)	story/fi339-blog-features	MERGED	2026-09-07 09:17:48 +0000 UTC
```

*Source: `gh pr list --repo wakii-dev/wakii-site --state merged`, retrieved
2026-09-07.*

The PR #1 row narrates itself: story FI-339 delivered the blog with three
content types — tutorials, tech notes, build logs — in two languages. Before
opening the diff, the reviewer already knows what the story shipped; opening
it, the entire story sits in one reviewable block. The list was captured at
the time of writing; this post reads the PR #1 row — the story that laid the
foundation for the very blog you are reading.

And on the second repository — hub-store, a production project running the
same workflow:

```bash
$ gh pr list --repo wakii-dev/hub-store --state merged
1	FI-326: BFF API docs Swagger (OpenAPI) — 84 REST endpoints / 12 tags	story/fi326-api-docs-swagger	MERGED	2026-09-06 10:46:00 +0000 UTC
```

*Source: `gh pr list --repo wakii-dev/hub-store --state merged`, retrieved
2026-09-07.*

The two repositories differ at the root: one is a marketing site, the other a
production system. Yet read both transcripts and the shape of a closing story
is identical: one story (FI-339 / FI-326), one branch following the
`story/<epic>-<slug>` convention, one PR sealing the whole thing. A story can
be long, its sub-features can fan out across many branches — the final review
point is still one clean PR.

## Safe to walk backward from the merge

Once a PR merges, it leaves a merge commit on main — and the real value of
that milestone lies after the fact, when you need to trace backward. "When did
this change land on main, and from which story?" is a question that recurs in
every project. The one-PR discipline turns the answer from an act of recall
into a command:

```bash
$ gh pr view 1 --repo wakii-dev/wakii-site --json number,title,headRefName,state,mergedAt,mergeCommit
{"headRefName":"story/fi339-blog-features","mergeCommit":{"oid":"3d9a7c3255f6c80cc7e6dceed4ba208380470172"},"mergedAt":"2026-09-07T11:50:15Z","number":1,"state":"MERGED","title":"FI-339: Blog features — tutorials, tech notes, build logs (en/vi)"}
```

*Source: `gh pr view 1 --repo wakii-dev/wakii-site --json
number,title,headRefName,state,mergedAt,mergeCommit`, retrieved 2026-09-07.*

Read the `mergeCommit` field backward: the SHA `3d9a7c3…` is the merge commit
sitting on main; `headRefName` returns the source branch
`story/fi339-blog-features`; and the branch name points back to story FI-339.
Three steps — from a commit on main to the story that produced it — with no
chat log to dig through and nobody to ask. The second repository answers in
the same shape:

```bash
$ gh pr view 1 --repo wakii-dev/hub-store --json number,title,headRefName,state,mergedAt,mergeCommit
{"headRefName":"story/fi326-api-docs-swagger","mergeCommit":{"oid":"0144d8018c1c26bc66bc79009e1e121741adef5f"},"mergedAt":"2026-09-06T10:53:07Z","number":1,"state":"MERGED","title":"FI-326: BFF API docs Swagger (OpenAPI) — 84 REST endpoints / 12 tags"}
```

*Source: `gh pr view 1 --repo wakii-dev/hub-store --json
number,title,headRefName,state,mergedAt,mergeCommit`, retrieved 2026-09-07.*

"Safe" here is not a feeling: it rests on three things that do not change —
the SHA of a merge commit never changes, a PR keeps its number forever, and
the source branch is named after the `story/<epic>-<slug>` convention. While a
story runs, its state lives elsewhere — Linear acts as the agent team's
external memory, as a previous post took apart
([Linear as external memory for the agent team](/blog/linear-as-external-memory/)).
After the story ends, the memory sits on main itself: each story leaves
exactly one merge commit, traceable by command.

## The single gate where a human decides

One less-discussed consequence of "one PR per story": it creates exactly one
stopping point for a human. The last step of automation is not the merge — it
is being ready to merge. The docs state it verbatim:

> "Agents take the destination branch to a clean, verified state — one PR per
> story — and then stop. Nothing irreversible happens without a person saying
> yes."

*Source: src/content/docs/en/story-workflow.md, section "4. Humans own the
irreversibles", retrieved 2026-09-07.*

The word "stop" is the most important part of the rule. Before the PR, agents
decide a lot on their own: how to tier the work, when to run in parallel,
which gates pass, what to fix after review. After the PR, everything belongs
to a person: read one diff, read one description, say yes once. One PR per
story is one decision per story — against one body of evidence, instead of
thirty small decisions spread across history.

The full lifecycle — bracket, tiers, gates, and one PR per story — is
documented on the [story workflow](/docs/story-workflow/) page.

If your repository keeps several story branches alive at once, try imposing
exactly two conditions: one destination branch per story, one PR to close the
story. Then run `gh pr list --state merged` on main and read the PR titles —
whether a title narrates its story is the test for the branch discipline.
