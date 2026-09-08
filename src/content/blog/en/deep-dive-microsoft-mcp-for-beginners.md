---
title: "MCP for Beginners: Microsoft's official MCP curriculum"
description: "Read Microsoft's 13-module curriculum as an artifact: what it teaches, in which order, how each lesson is designed, and what that says about the maturity of the MCP ecosystem."
pubDate: "2026-10-10"
category: "tech"
tags: ["guide", "agents", "workflow"]
draft: false
---

When Microsoft builds an entire 13-module curriculum just to teach the Model Context Protocol (MCP), the signal matters more than the content: MCP is mature enough to have a canonical textbook. The microsoft/mcp-for-beginners repo has reached 17,170 stars (per the GitHub API on 2026-09-08) — not because it contains rare code (it is all learning material), but because it is the official answer to the question "where do I start with MCP". This post reads the curriculum as an artifact: what it teaches in which order, how a lesson is designed, and what that says about the maturity of the ecosystem.

TL;DR:

- The curriculum has 13 modules in four phases — foundation, building, growing, mastery — and security is module 02, taught before the first "build a server" lesson.
- Every concept ships with runnable code in 6 languages; the HEAD tree contains 45 project manifest files (per the GitHub API on 2026-09-08).
- The repo publishes no releases: updates flow through a changelog with 17 dated entries, plus a dedicated lesson teaching the 2026-07-28 spec release candidate.
- Grading for Wakii: ADOPT the "stable baseline + in-place callouts" discipline for docs changes; WATCH the automated 55-locale translation setup.

## A curriculum is an artifact: 13 modules, four phases

A learning repo is easy to skim as a pile of links. This one is not: 13 modules numbered 00 through 12, arranged in four named phases, each module opening with a README that lists its lessons (per the GitHub API on 2026-09-08). The repo was created on 2025-04-04, and the changelog recorded its first entry on 2025-04-15 — the teaching structure was shaped from day one, not accreted by accident.

```text
Foundation   00-Introduction · 01-CoreConcepts · 02-Security
Building     03-GettingStarted              — 15 lessons: server → client → deploy
Growing      04-PracticalImplementation · 05-AdvancedTopics — 17 advanced topics
Mastery      06-CommunityContributions … 11-MCPServerHandsOnLabs — 13 hands-on labs
Tooling      12-tooling
```

(source: directory structure at commit `422055c`, per the GitHub API on 2026-09-08)

The four phases are deliberate: foundation explains through analogies, building gets you writing code, growing moves into production concerns, mastery opens into community work and 13 PostgreSQL labs. The order is a map of ecosystem priorities: whatever is taught first is what the ecosystem considers foundational. As for scale: the translations directory holds 55 language folders (English included), generated automatically by a GitHub Action as the README describes (per the GitHub API on 2026-09-08).

## Security is taught before hello world

Of the 13 modules, the biggest surprise is third place: after introduction and core concepts, before the first server-building lesson, sits 02-Security.

| Order | Module | Role |
|-------|--------|------|
| 00 | Introduction to MCP | what MCP is and why it exists |
| 01 | Core Concepts | the protocol's foundational ideas |
| 02 | Security in MCP | threats and security best practices |
| 03 | Getting Started | first server and client |

(source: curriculum table in the README at commit `422055c`, per the GitHub API on 2026-09-08)

That choice carries a message: for a protocol entering enterprise environments, security is not an appendix. The trend continues in the next spec version — the lesson on the 2026-07-28 release candidate (202 lines, per the GitHub API on 2026-09-08) lists six authorization SEPs that harden OAuth 2.0 / OIDC alignment, and compresses the biggest change into one line:

"The headline change: MCP becomes stateless at the protocol layer." — from "What's Changing in MCP: The 2026-07-28 Release Candidate" ([source](https://github.com/microsoft/mcp-for-beginners/blob/422055c27bf1e0fc3b932e87c437a2bfa0cd17ae/01-CoreConcepts/mcp-2026-07-28-release-candidate.md))

A protocol going stateless at the transport layer is a protocol preparing for horizontal scale — and this lesson reached a beginners' textbook just six weeks after the release candidate was announced (2026-05-21).

## Six languages, one concept: 45 runnable projects

One rule repeats across the curriculum: no concept is merely explained — it must ship as runnable code, in your language of choice. The three basic calculator samples exist in parallel across 6 languages; counting the HEAD tree, the repo contains 45 project manifest files:

| Manifest type | Files | Languages |
|---------------|-------|-----------|
| package.json | 16 | JavaScript, TypeScript |
| .csproj | 10 | C# |
| pom.xml | 8 | Java |
| Cargo.toml | 6 | Rust |
| requirements.txt + pyproject.toml | 5 | Python |

(source: counted from the git tree at HEAD, per the GitHub API on 2026-09-08)

Maintaining that number is not cheap — every spec change means six sample suites to update. The commitment signals positioning: MCP is meant to be a common skill, not the property of one language community.

Lesson design is also more school than blog: the "first server" lesson runs 1,376 lines (per the GitHub API on 2026-09-08), opens with a TL;DR box, follows with learning objectives phrased as "By the end of this lesson, you will be able to:", and only then reaches code. The teaching voice at the central concept:

"Think of MCP like a USB-C port for AI applications" — from the Getting Started with MCP, first server lesson ([source](https://github.com/microsoft/mcp-for-beginners/blob/422055c27bf1e0fc3b932e87c437a2bfa0cd17ae/03-GettingStarted/01-first-server/README.md))

The first server you build is real and runnable, not pseudocode:

```typescript
const server = new McpServer({
  name: "Demo",
  version: "1.0.0"
});

// Add an addition tool
server.tool("add",
  { a: z.number(), b: z.number() },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }]
  })
);
```

(03-GettingStarted/01-first-server/README.md, excerpt from the tree at commit `422055c` — [link](https://github.com/microsoft/mcp-for-beginners/blob/422055c27bf1e0fc3b932e87c437a2bfa0cd17ae/03-GettingStarted/01-first-server/README.md))

## No releases, just a changelog: a textbook that lives with the spec

The most familiar item in a software repo — releases — is absent: both the releases and tags APIs return empty. The curriculum does not cut versions; it updates continuously on main, keeping the record in a 732-line changelog.md with 17 dated entries, from 2025-04-15 to 2026-07-29 (per the GitHub API on 2026-09-08).

The two most recent entries tell the whole spec-sync story. On 2026-07-02, the curriculum added a lesson teaching the 2026-07-28 RC — transport-layer sessions dropped, extensions becoming a first-class mechanism — and updated around 11 older lessons with callouts pointing to it. On 2026-07-29, one day after the spec's scheduled release date, the changelog described the new companion lesson as "aligned with the final `2026-07-28` specification" (changelog.md of microsoft/mcp-for-beginners, [source](https://github.com/microsoft/mcp-for-beginners/blob/422055c27bf1e0fc3b932e87c437a2bfa0cd17ae/changelog.md)). The baseline was not overwritten — the README states: "This curriculum is aligned with MCP Specification 2025-11-25 (the latest stable release)" ([source](https://github.com/microsoft/mcp-for-beginners/blob/422055c27bf1e0fc3b932e87c437a2bfa0cd17ae/README.md)).

That is a docs discipline worth stealing: keep the baseline stable, teach the big change in one dedicated page, attach short dated callouts to the old pages, log every milestone in the changelog.

## What Wakii learns

- **ADOPT** — The docs discipline for mechanism changes (section four): keep the baseline stable, teach the change in one dedicated page, attach dated callouts where old text is affected, log dated entries in a changelog. Real surface: Wakii's 5 docs pages change with releases (gates, story view, pairing) but are edited in place with no trail. Proposal: each time the docs change a mechanism, add a dated entry to a short docs changelog plus a callout at the affected section. Risk: a changelog neglected for a few releases becomes noise worse than having none.
- **DIRECTION** — The lesson anatomy (section three): TL;DR → learning objectives → runnable code in the first minutes. Wakii tutorials already have a TL;DR and real transcripts, but no standard objectives block for readers to self-check; worth standardizing for the tutorial category in future batches.
- **WATCH** — The automated 55-locale translation via GitHub Action (section one): Wakii is bilingual through human translation, and quality still outranks coverage; if the docs add languages, automation-with-review becomes the candidate model.
- **N/A** — Teaching MCP fundamentals: no Wakii docs page teaches MCP (neither the FAQ nor agents-and-kit mentions it), and the docs should not turn into a protocol classroom — that is this curriculum's job, not Wakii's.

A canonical curriculum is a maturity signal: a protocol with enough learners to need a textbook, and enough production scenarios to teach security before hello world. If you are weighing an agentic IDE for daily work: the [FAQ](/docs/faq/) collects the most common questions about running an agent team, and the 9 agents in the kit are described in [agents-and-kit](/docs/agents-and-kit/). A knowledge catalog organized the Wakii way: [skills-catalog-tour](/blog/skills-catalog-tour/); to write your own lesson, start from [guide-custom-skill-101](/blog/guide-custom-skill-101/). Wakii is an agentic IDE with a superpowers team built in — download it, let the agents run, and keep the deciding to yourself.
