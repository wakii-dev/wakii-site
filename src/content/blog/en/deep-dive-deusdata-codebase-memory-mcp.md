---
title: "codebase-memory-mcp: long-term memory for agents that read code"
description: "A pure-C MCP server compiles your codebase into a SQLite knowledge graph; a git-aware watcher re-indexes only what changed so the memory never goes stale. We read the actual code: storage, watcher, team-shared artifact."
pubDate: "2026-10-09"
category: "tech"
tags: ["memory", "agents", "evidence"]
draft: false
---

Agents read code by opening files one at a time — and every session starts from zero. On a large repository that retains nothing: today the agent knows which function calls `ProcessOrder`, and the next session asks again as if yesterday never happened. DeusData/codebase-memory-mcp takes a different path: a pure-C MCP server that compiles the codebase into a SQLite knowledge graph that survives sessions — 42,644 stars per the GitHub API on 2026-09-08, less than seven months after the repo was created (2026-02-24). This post reads the actual code to answer three questions: what the memory holds, how it stays fresh, and how it travels with a team.

## TL;DR

- The memory is a typed graph — Function/Class/Route nodes, CALLS/IMPORTS/HTTP_CALLS edges — in SQLite, plus an ADR file recording architectural decisions next to the source.
- Staleness defense: a background watcher polls git (HEAD movement or a dirty working tree) on adaptive 5–60 second intervals; a failed re-index keeps the baseline, nothing is dropped.
- Incremental indexing compares mtime+size against stored hashes and re-parses only changed files.
- The memory travels as one zstd file committed with the repo — clone and you have it — with an honest warning about bloated git history.
- Wakii: ADOPT freshness stamps for context packs · DIRECTION a one-call repo map · WATCH binary artifacts in git.

## What the memory holds: a typed graph, not free-form notes

At the core sits a SQLite store with a node–edge schema, wrapped in `src/store/store.h`. A node carries full identity — type label, qualified name, file, start and end lines:

```c
typedef struct {
    int64_t id;
    const char *project;
    const char *label;          /* Function, Class, Method, Module, File, ... */
    const char *name;           /* short name */
    const char *qualified_name; /* full dotted path */
    const char *file_path;      /* relative file path */
    int start_line;
    int end_line;
    /* … properties_json … */
} cbm_node_t;
```

([source](https://github.com/DeusData/codebase-memory-mcp/blob/161df2bdb1f4e28734f326a73f6e7989418f1288/src/store/store.h))

Edges are typed by meaning: `CALLS`, `IMPORTS`, `HTTP_CALLS`, `DATA_FLOWS`, `SEMANTICALLY_RELATED` — per the README read on 2026-09-08. Queries therefore become structural: who calls this function, which HTTP route touches that service — not string search. All access flows through 17 tools declared in the `TOOL_ANNOTATIONS` table of `src/mcp/mcp.c` ([read at HEAD on 2026-09-08](https://github.com/DeusData/codebase-memory-mcp/blob/161df2bdb1f4e28734f326a73f6e7989418f1288/src/mcp/mcp.c)); curiously, the README advertises "15 MCP tools" — the docs trail the code by one step, one more reason to trust the annotation table over marketing numbers. The comments in that same file classify every tool as read-only or destructive, with a clear commitment: a read-only query on a corrupt DB means "a corrupt database is reported and left in place, never quarantined or rebuilt" — user data is never silently processed away.

The second memory layer lives outside the graph: the `manage_adr` tool for architecture decision records — "Outline an ADR by default; get reads it; update replaces it" (TOOLS table in `mcp.c`, link above). The ADR file sits at `.codebase-memory/adr.md` inside the repository itself — the `project_has_adr` function checks that exact path — so architectural decisions persist next to the source. `get_graph_schema` additionally returns an `adr_present` flag plus a hint nudging the agent toward `manage_adr` when no ADR exists: the memory advertises itself.

The whole picture:

```
agent (MCP client) ──MCP/JSON-RPC──▶ codebase-memory-mcp (pure C, 1 binary)
                                       │  tools: search_graph · trace_path
                                       │         get_architecture · detect_changes
                                       │         manage_adr · …
                                       ▼
             SQLite knowledge graph (~/.cache/codebase-memory-mcp/)
             nodes: Function/Class/Route…   edges: CALLS/IMPORTS/HTTP_CALLS…
                                       ▲
             background watcher: poll git (HEAD move / dirty tree) → re-index the diff
```

## Fighting staleness: the watcher treats git as ground truth

Cached memory goes stale fast: code changes daily, so yesterday's graph is wrong today. This repo handles it with a background watcher — read straight from the `src/watcher/watcher.h` header:

```
Polls indexed projects for git changes (HEAD movement or dirty working tree)
and triggers re-indexing via a callback. Uses adaptive polling intervals
based on project size (5s base + 1s per 500 files, capped at 60s).
```

([source](https://github.com/DeusData/codebase-memory-mcp/blob/161df2bdb1f4e28734f326a73f6e7989418f1288/src/watcher/watcher.h))

Three details worth stealing here. One: the change source is git — HEAD movement or a dirty working tree — not per-file mtime scans. Two: the polling interval adapts to project size, from 5 seconds up to a 60-second ceiling. Three: the baseline is committed only when the re-index succeeds — "a skipped or failed reindex keeps the change pending so it is retried, never silently lost" (#937, same file). Failure does not erase old knowledge; it defers the update.

The discipline gets sharper in cleanup: when a project root disappears, the code classifies the errno before pruning — only `ENOENT`/`ENOTDIR` may count; `EACCES`, `EIO`, or a macOS TCC revocation must not, because, as the comment puts it, "the cached DB holds user-authored data and is unrecoverable once pruned". A transient permission error must never delete a user's memory — a discipline worth copying into any cache system.

The re-index path is equally selective. The `src/pipeline/pipeline_incremental.c` header describes it: "Compares file mtime+size against stored hashes to classify changed/unchanged" — it deletes the changed files' nodes (edges cascade via DB constraints), re-parses only those files through the passes, then merges into the DB. No full re-index because a few files changed.

## Memory that travels with the repo: one zstd file instead of a re-index

Memory is usually personal — a cache under each machine's `~/.cache`. This repo turns it into a team asset: "Commit a single compressed file to your repo and your teammates skip the reindex." (README, read on 2026-09-08). The artifact `.codebase-memory/graph.db.zst` is a zstd snapshot of the graph in two tiers: Best (`zstd -9`, indexes stripped, `VACUUM INTO`) written on explicit indexing; Fast (`zstd -3`) written by the watcher for quick updates. A teammate who clones imports the artifact first, then runs incremental indexing over their local diff — the first full-index cost disappears.

The stress test is git itself. The binary artifact is rewritten on every index, and git stores each rewrite as a new blob — the README says it plainly: "one team reached ~6 GB across ~350 commits of this single path", then advises picking a cadence (a release, a milestone, a nightly job) instead of committing on every save; if it must move on every commit, put it on Git LFS from the root `.gitattributes`. And merge conflicts between two branches that both touched the artifact? An auto-created `merge=ours` line in `.codebase-memory/.gitattributes` — a binary file has no sensible merge, so a controlled overwrite is the honest option.

Release cadence says how alive the project is: the latest release is v0.10.8, published 2026-08-19, and six consecutive releases ran from August 13 to August 19, 2026 (per the GitHub API on 2026-09-08) — a near-daily cadence for a pure-C project.

## What Wakii learns

- **ADOPT** — freshness stamps for context packs. A story-workflow context pack is generated once at the epic level and inherited by every SF, but the pack cannot tell that it went stale when the destination branch moved. The codebase-memory-mcp pattern — commit the baseline only after a successful rebuild, and check the source before trusting the cache — maps onto a small convention: the pack records the destination branch's commit sha at generation time; before an executor reads the pack, compare shas, and on mismatch demand a re-sync instead of trusting blindly. This extends the merge guard (`git merge-base --is-ancestor`) story FI-373 already uses for the destination branch, applied to documents.
- **DIRECTION** — a one-call repo map. `get_architecture` returns entry points, routes, hotspots, and boundaries in a single call instead of dozens of greps — Wakii's Phase 0 impact analyst currently explores the repo with grep and file reads; a pre-generated repo map like this could seed the impact analysis. Not adopted yet because it needs an external tool, index maintenance cost, and output alignment with the current pack format.
- **WATCH** — binary artifacts in git. The "clone and you have the memory" promise is tempting for Wakii's generated artifacts (research digests, for example), but the README itself warns about 6 GB of history after 350 commits — watch until a clear commit cadence exists. Same status for the installer that auto-configures 45 client surfaces: Wakii follows an idempotent zero-setup principle that never touches existing config, so we observe how they handle config conflicts.

Memory inside the Wakii workflow lives elsewhere: context packs, an improvements log that records lessons with provenance, and Linear as external memory — the [story workflow docs](/docs/story-workflow/) describe how the "analyze once, inherit many" principle works. Read on with [the story-workflow skill](/blog/skill-story-workflow/) for the orchestration skill and [Linear as external memory](/blog/linear-as-external-memory/) for issue-based memory. If you have agents reading your code every day, download Wakii, open a story — and see how much re-asking keeping context across sessions saves you.
