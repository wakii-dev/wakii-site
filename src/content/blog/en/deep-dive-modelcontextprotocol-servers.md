---
title: "The official MCP servers: the protocol's living specification"
description: "Reading the seven reference servers of modelcontextprotocol/servers as a specification you can run: what the protocol chose to standardize, how each server's architecture contains risk, and how deprecation is actually operated."
pubDate: "2026-10-05"
category: "tech"
tags: ["agents", "workflow", "architecture", "evidence"]
draft: false
heroImage: "/blog/heroes/deep-dive-modelcontextprotocol-servers.png"
---

A protocol only matures when its stewards agree to choose: what gets held up as the model, and what gets pushed to the margins. modelcontextprotocol/servers — 90,157 stars, public on GitHub, last push 2026-09-03 (per the GitHub API on 2026-09-08) — is where the team behind the Model Context Protocol keeps its reference servers. This is not a catalog: a previous post counted [3,862 community servers in awesome-mcp-servers](/blog/deep-dive-punkpeye-awesome-mcp-servers/, counted 2026-09-08); this repo holds a deliberately small set of exemplars. Read it as a living specification — each server answers one question: if the protocol thinks this capability matters, how does it standardize it into code?

TL;DR:

- The repo keeps only **7 reference servers**; 13 older servers moved to an archived repo — each archived entry names its replacement.
- The set is polyglot on purpose: 4 TypeScript, 3 Python, illustrating the protocol's list of 10 official SDKs.
- Filesystem funnels every path through one gate: reject null bytes, normalize, then check the allowlist.
- The memory server just patched an agent-specific bug: concurrent tool calls silently overwrite each other — fixed with a single mutation queue.
- Releases are date-versioned (CalVer), with a five-month gap, then a comeback via a two-day maintenance batch.

## Seven servers kept, thirteen moved out

The README pins its scope up front: the "important" block sends server hunters to the MCP Registry, and the body states the repo exists to house "the small number of reference servers maintained by the MCP steering group" (README of modelcontextprotocol/servers, [README @ d73f99e](https://github.com/modelcontextprotocol/servers/blob/d73f99e/README.md), retrieved 2026-09-08). Those seven exemplars:

| Server | Role |
|---|---|
| Everything | test server: prompts, resources, tools |
| Fetch | web content fetching and conversion for LLMs |
| Filesystem | file operations with controlled access |
| Git | read, search, and manipulate repositories |
| Memory | long-term memory as a knowledge graph |
| Sequential Thinking | problem-solving through thought sequences |
| Time | time and timezone conversion |

Alongside the 7 active servers sit 13 moved to the `servers-archived` repo — including once-famous names: GitHub, GitLab, Slack, PostgreSQL, Puppeteer, Brave Search (per README @ d73f99e). What's worth learning is not the retiring but how it's done: Brave Search notes it was replaced by Brave's official server; Slack notes Zencoder took over maintenance. Deprecation with an address — read the archive and you always know where to go next.

The same front matter warns outright that these servers are "meant to serve as educational examples for developers building their own MCP servers, not as production-ready solutions" (README @ d73f99e). A 90k-star repo describing itself as teaching material, not a production solution — stating that plainly is the hardest part of technical writing.

## Every server is an SDK lesson

No server is a translation of another. Four are TypeScript (everything, filesystem, memory, sequentialthinking), run via `npx`; three are Python (fetch, git, time), run via `uvx` or `pip`. In parallel, the README lists 10 official SDKs: C#, Go, Java, Kotlin, PHP, Python, Ruby, Rust, Swift, TypeScript.

That is a decision only a protocol steward can make: references aren't written in one language for tidiness — they prove the protocol maps cleanly onto different type systems. The `everything` server is the purest case — its `tools/` directory is a lineup of small cases: elicitation requests, logging levels, long-running operations, structured content ([src/everything/tools/ @ d73f99e](https://github.com/modelcontextprotocol/servers/blob/d73f99e/src/everything/tools/)). If you want to write an MCP server, this is the authoritative phrasebook — one you can run, not prose.

## Filesystem: every path is stopped at the gate

Filesystem is the most interesting reference on security: let the model read and write real files, but inside a pen. The server registers 14 tools (counted in `index.ts` @ d73f99e), and all of them pass through a single gate — `path-validation.ts`, exactly 86 lines:

```ts
// Reject null bytes (forbidden in paths)
if (absolutePath.includes('\x00')) {
  return false;
}
// Normalize the input path
normalizedPath = path.resolve(path.normalize(absolutePath));
```

(excerpt from [src/filesystem/path-validation.ts @ d73f99e](https://github.com/modelcontextprotocol/servers/blob/d73f99e/src/filesystem/path-validation.ts))

The sequence: reject null bytes first, normalize and resolve, require an absolute path, and only then compare against the allowed directory list. Not a warning sentence in a README — a dedicated module, with a `__tests__` directory beside it. Security lives where data can't take shortcuts.

## Memory: when one tool call overwrites another

The memory server keeps a knowledge graph in a file and exposes 9 tools (counted @ d73f99e). In early September it received the repo's densest patch batch: counting from 2026-08-09, the GitHub API logs 30 commits in 30 days; on 2026-09-03 alone there were six `fix(memory)` commits. The biggest bug is described right in a code comment: multiple mutations dispatched from one LLM turn "each independently load the graph, mutate their own copy, and write it back — so whichever write lands last silently overwrites the other's changes" (comment in [src/memory/index.ts @ d73f99e](https://github.com/modelcontextprotocol/servers/blob/d73f99e/src/memory/index.ts), fix #1819).

The fix is the lesson: every read-modify-write is serialized behind a single queue, and the queue must recover from failure:

```ts
private mutationQueue: Promise<unknown> = Promise.resolve();

private async withLock<T>(operation: () => Promise<T>): Promise<T> {
  const result = this.mutationQueue.then(operation, operation);
  // single failed mutation doesn't permanently wedge every call after it
  this.mutationQueue = result.then(() => undefined, () => undefined);
  return result;
}
```

(condensed excerpt from [src/memory/index.ts @ d73f99e](https://github.com/modelcontextprotocol/servers/blob/d73f99e/src/memory/index.ts), commit `d73f99e` #4555)

This is a bug class that belongs to software built for agents: agents don't call tools sequentially the way people do — many calls in one turn is the common path, and whichever-write-lands-last never shows up in single-call tests.

## Release cadence: the calendar is the version number

Versions are calendar dates (CalVer) — the release table reads like a maintenance log:

| Release | Date |
|---|---|
| 2026.8.31 | 2026-08-31 |
| 2026.8.18 | 2026-08-18 |
| 2026.7.10 | 2026-07-10 |
| 2026.7.4 | 2026-07-04 |
| 2026.1.26 | 2026-01-26 |

(per the GitHub API on 2026-09-08; 10 most recent releases, table trimmed to 5 rows)

Two details expose the operation. One: between 2026-01-26 and 2026-07-04 there were no releases — a gap of almost five months — then the repo came back with 4 releases in 2 months and the dense 09-03 maintenance batch; the reason for the gap isn't in the release notes, so this post won't speculate. Two: the README points to `RELEASING.md` — packages publish from CI via OIDC trusted publishing, with no registry tokens kept ([RELEASING.md @ d73f99e](https://github.com/modelcontextprotocol/servers/blob/d73f99e/RELEASING.md)). In [the map of 50 agentic projects](/blog/agentic-landscape-50-projects/), the observation was "release cadence mirrors process" — this is the underside of that line.

The same idea, put another way: docs must match the code, evidence must replace promises — the principle Wakii builds on in its [story workflow](/docs/story-workflow/), with gates instead of self-reports.

## What Wakii learns

- **ADOPT** — a mutation queue for shared state: the memory server's fix #4555 serializes every read-modify-write through one queue, and the queue is never wedged by a single failed operation. Wakii has exactly this class of state — gate state, SF progress, story memory across parallel SFs; the "defensive by design" principle in the story workflow already recorded the shared-notes-file conflict scenario. Concretely: read-modify-write into the kit's shared state files goes through one sequential queue.
- **DIRECTION** — deprecation with an address: all 13 archived servers name their replacement (Brave Search → Brave's official server; Slack → Zencoder). Wakii's skills catalog (20 skills as of 2026-09-08) will need retirement as it grows — a pattern worth adopting: keep the entry, point to the successor, never delete silently.
- **WATCH** — MCP as an integration surface: Wakii's docs currently have no MCP client (the kit ships by release, not as a marketplace). The 7 reference servers are the first compatibility suite worth running if that surface enters the roadmap; promote to DIRECTION when an MCP client appears on the roadmap.
- **N/A** — the multi-SDK showcase (10 SDKs, 2 languages across 7 servers): that is protocol-steward work, with an ecosystem consuming it. Wakii is a single-stack product — polyglot references would only add maintenance surface.

Wiring agents into real files, git, or memory, and want a process with gates instead of assurances? Wakii is an agentic IDE with a built-in agent team — start at [getting started](/docs/getting-started/).
