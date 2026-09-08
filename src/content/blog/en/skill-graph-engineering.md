---
title: "Skill /graph-engineering: turning complex systems into graphs"
description: "Graph engineering has two halves: knowledge graphs answer what an agent remembers, task graphs answer how agents coordinate — the 9-stage pipeline, the diamond pattern, and the kit's nine-agent team read as a running task graph."
pubDate: "2026-09-14"
category: "tech"
tags: ["skills", "architecture", "design"]
draft: false
---

Agents have two classic weaknesses. One: they forget everything they know about your world the moment it falls outside the context window. Two: they stumble when a big job has to be split across several hands. The two problems sound identical — "the agent isn't smart enough" — but they are different in kind, and they call for two different data structures. The `/graph-engineering` skill in the Wakii kit opens with exactly that distinction: knowledge graphs answer what an agent remembers; task graphs answer how agents coordinate. This post walks both halves in the order the skill teaches them, then reads one real story from this site backward to show the second half is not theory.

TL;DR:

- Graph engineering is the discipline of designing structures agents work through — not prompt writing: one half is memory, the other is orchestration.
- The knowledge half is a 9-stage pipeline: ontology before extraction, fusion before storage, serving to LLMs at the end. Two stages must not be skipped: ontology and fusion.
- The task half is a DAG: independent work runs in parallel as a diamond, verifiers sit in separate contexts, human gates go on expensive-to-undo edges.
- The kit's nine-agent team is a task graph that really runs, and story FI-359 of this site left 5 plan files — 5 nodes of one diamond.

## Two graphs, two different questions

The skill defines the two halves as a symmetric pair. Knowledge graph: nodes are entities and facts, edges are relationships carrying time and provenance. Task graph: nodes are jobs, edges are execution dependencies. The same word "graph", two different questions — one traces multi-hop paths through relationships, the other schedules work: what can run in parallel, what blocks what.

```ascii
  KNOWLEDGE GRAPH: what to remember     TASK GRAPH: how to coordinate
  node = entity, fact                   node = job (one assistant-sized task)
  edge = relationship (verb)            edge = execution dependency
         + time + provenance

  (B)─[ACQUIRED, 2024]→(A)             plan ─┬→ worker 1 ─┐
  (C)─[WORKED WITH]→(A)                      ├→ worker 2 ─┼→ verify → merge
                                             └→ worker 3 ─┘
  question: multi-hop queries           question: who blocks whom,
  through the relationship web                   what runs in parallel
```

*Source: drawn from the two-halves definition in ~/.claude/skills/graph-engineering/SKILL.md and references/task-graphs.md, retrieved 2026-09-08.*

Confusing the two means picking the wrong tool from the start: stuffing conversation history into a graph database does not solve coordination, and splitting work across many agents does not create long-term memory.

## The knowledge half: ontology before extraction

The central mental model, quoted verbatim: a knowledge graph is "a product with a schema, not a pile of triples" — quality comes from pipeline order. The pipeline has 9 stages:

| Stage | What it does |
|---|---|
| 1. Scope & value test | Does a graph beat a simpler structure — single-hop lookups mean use a table and stop |
| 2. Representation choice | Property graph, RDF, or typed edges in JSON |
| 3. Ontology | Entity types + relation types, defined before extraction |
| 4. Entity extraction | Dictionaries, or LLM extraction with the ontology in the prompt |
| 5. Relation extraction | Reject edges whose endpoints have incompatible types (domain/range) |
| 6. Event extraction | Events as first-class nodes, carrying time |
| 7. Quality gate | 90% precision on a 50-item sample before fusion |
| 8. Fusion | Merge duplicate entities: "SEU" = "Southeast University" |
| 9. Serve to LLMs | GraphRAG, graph-as-memory, reasoning over paths |

*Source: table distilled from "The 9-Stage Pipeline" in ~/.claude/skills/graph-engineering/SKILL.md, retrieved 2026-09-08.*

The two stages the skill says to never skip are 3 and 8 — verbatim: "they are where real-world graphs fail". Ontologies start minimal: 5-15 entity types, 10-30 relation types, every relation a precise verb name (`ACQUIRED`, not `RELATED_TO`). Fusion merges the different surface forms of the same real-world entity — skipping it is the number-one cause of useless graphs. The working rule attached: provenance on every fact — each node and edge stores its source, extraction time, and confidence. By stage 9 the graph becomes agent context: GraphRAG pulls a subgraph into the prompt, graph-as-memory lets the agent write facts back.

One easily missed detail: the skill has a teaching mode — when you want to learn rather than build, it teaches the pipeline one stage at a time, anchored in your domain, with exercises and self-generated diagram artifacts (mermaid, a single HTML page), because "concepts in this discipline are shapes; show them".

## The task half: separate verifiers, place gates where undo is expensive

The task half lives in a separate reference file. Nodes are jobs; draw an edge only when one job needs another job's result. This is a DAG — the pattern data infrastructure has run on for decades, now applied to agents. The first optimization is free: audit every "and then" in your pipeline; if the next step never reads the previous step's output, the edge is fake — delete it and the two jobs run in parallel.

The shape the reference calls "the shape serious systems converge to":

```ascii
        ┌─ worker 1 ─┐
plan ───┼─ worker 2 ─┼─→ verify ─→ merge ─→ result
        └─ worker 3 ─┘
```

*Source: "The diamond pattern", ~/.claude/skills/graph-engineering/references/task-graphs.md, retrieved 2026-09-08.*

The verify node in that diamond is non-negotiable: "a model grading its own work in its own context misses most of its own mistakes". The reference cites a Google DeepMind × MIT study (180 controlled configurations): coordinated teams beat a single agent by about 80% on work that splits into independent pieces; every multi-agent configuration lost on sequential work, degrading 39-70%; uncoordinated agents amplified each other's errors 17.2×, while a single coordinator owning the merge cut that to 4.4×. The reference's conclusion is terse: "More agents is not a strategy. The shape of the work decides."

The human is a node too — via the human gate, placed on hard-to-undo edges (send, publish, delete, deploy), not on every step: "A gate on everything makes the human the bottleneck; a gate on nothing means nobody is watching." Four guardrail caps close it out: a max-round cap for every loop, one writer per file, routing in written steps, a hard cap on spawned agents.

## Task graphs in the wild: one story and the nine-agent team

Read the kit's nine-agent team through the frame above — keeping only the frame here, not re-explaining each role:

| Task-graph frame | On the Wakii team | Docs description |
|---|---|---|
| worker node | task-executor | "Implements tasks in isolated worktrees, commits atomically" |
| verify node, separate context | code-reviewer, verifier | "Independent pass/fail verdict — self-reports don't count" |
| the node that reviews the graph itself | plan-critic | "Adversarial review of the plan and its task dependency graph" |
| human gate | designer | "Design drafts for user review before UI gets built" |
| safe backward edge | rollback-fixer | "Reverts safely to the last known-good state" |

*Source: table distilled from src/content/docs/en/agents-and-kit.md §"The 9-agent story team", retrieved 2026-09-08.*

The story workflow's gates B0–B5 are the pipeline's human gates (story-workflow docs): approve before code exists, approve before merge — the placement rule applied where a mistake is expensive to undo.

The nearest real DAG: story FI-359 — this site's 20 longform posts — split into 5 SFs and left 5 plan files in `docs/superpowers/plans/`. SF-1 built the editorial kit; three series (A/B/C) are three worker branches consuming exactly that kit; SF-5 convergence QA audits everything the branches produced, so it stands behind all of them:

```ascii
FI-359 — 5 plan files, one diamond

  sf1 editorial foundation ──┬→ sf2 series A ─┐
                             ├→ sf3 series B ─┼→ sf5 convergence QA
                             └→ sf4 series C ─┘   (verify + merge)

  each SF = one plan file + one isolated worktree
```

*Source: ls docs/superpowers/plans/ — 5 files 2026-09-07..2026-09-08, two carrying the SFs' Linear IDs (FI-362, FI-363), retrieved 2026-09-08.*

Where the nine agents come from and how the kit installs itself: the [agents & kit docs](/docs/agents-and-kit/). For the nine roles read through the lens of separated powers — why the writer never approves their own work — [Nine agents, separated powers](/blog/nine-agents-separated-powers/) covers it; the full public-skill catalog tour is in [a tour of the skills catalog](/blog/skills-catalog-tour/); how a plan file gets written for someone with no context is in [writing plans for Linear](/blog/skill-writing-plans-linear/).

The `/graph-engineering` skill ships with the Wakii kit and is readable verbatim in the source. To learn the knowledge half, ask the agent to teach the pipeline using your domain as the running example; to design the task half, draw the diamond with your own jobs as nodes. Wakii is an agentic IDE with a superpowers team built in — download it and let the graph do its part.
