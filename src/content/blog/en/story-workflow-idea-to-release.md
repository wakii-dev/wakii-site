---
title: "The story workflow: from a one-line idea to a merged PR"
description: "The anatomy of the Wakii story workflow: brackets split into tiers, a DAG schedules parallel SF agents, decision gates keep humans in the loop, and everything converges on one PR."
pubDate: "2026-09-04"
category: "tech"
tags: ["story-workflow", "agents", "workflow"]
draft: false
---

Every large Wakii feature runs as a story: it starts as a one-line idea and ends as a merged PR. That's not a pretty metaphor — it's a real pipeline with brackets, tiers, a DAG, an agent per sub-feature, and gates at the real forks in the road. This post walks the whole path.

## Brackets: divide and conquer

A one-line idea goes through three steps: impact analysis (what it touches, where it ripples), a spec (an explicit contract about the output), then a plan. In Wakii the plan isn't a dead file in a docs folder — it becomes a bracket: a task table split into sub-features (SFs), each SF assigned to a tier.

The bracket of this very blog story is a live example: SF-1 (the SEO surface — OG, RSS, TOC) sits at tier 0 because every post depends on it; SF-2 (seeding the ten posts) sits at tier 1 because it needs the surface ready; SF-3 (site-wide QA) sits at tier 2 because it only converges once everything else has stopped moving.

## Tiers and the DAG: what runs first

Tiers draw a DAG for free: every SF is a node, dependencies are edges. A node with no incoming edge starts immediately. The orchestrator reads the graph and dispatches — parallel is the default state, and order appears only where a real dependency exists. Nobody schedules by hand, and no two agents fight over the same file.

## SF agents work in parallel

Each SF gets its own agent, running in its own git worktree: its own branch, its own disk, atomic commits per task. The agent reads exactly its slice of the spec, implements, builds, then checks its work against the acceptance criteria before reporting done. One agent hitting trouble doesn't drag the others down — isolation is what makes parallelism real.

## Gates, merge, and the PR

At the real forks, the workflow places a decision gate: the agent stops, presents context and options, and waits for a human to resolve — from the desktop or straight from a phone. Gates are where quality is protected, not where speed dies: in practice a story meets only a handful, at the points where deciding actually matters.

Finished SFs get reviewed, then merged into the story branch — the destination branch that gathers the whole story. Once every SF has landed and verification is clean, the story branch opens a single PR: reviewers see one diff with a narrative, not thirty scattered commits.

The full process is documented in the [story workflow docs](/docs/story-workflow/); the nine-agent team behind it is listed in [agents and kit](/docs/agents-and-kit/). And the best part: Wakii builds itself with this exact process.
