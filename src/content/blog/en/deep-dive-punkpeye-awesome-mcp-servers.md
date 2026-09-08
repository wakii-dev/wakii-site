---
title: "Awesome MCP servers: a map of the MCP ecosystem"
description: "Reading awesome-mcp-servers — 94,614 stars, 3,862 entries — as a health index of the MCP ecosystem: which categories are crowded, how fast new entries appear, and how the list describes itself with icons and auto-computed scores."
pubDate: "2026-10-04"
category: "tech"
tags: ["agents", "workflow", "oss", "evidence"]
draft: false
---

A new protocol becomes real when it gets a directory. For MCP (Model Context Protocol), that directory is punkpeye's awesome-mcp-servers: 94,614 stars, 15,881 forks, MIT license, last push on 2026-09-07 (per GitHub API on 2026-09-08). Most people open this list to find one server for one need. This post reads it differently: as a health index of the whole ecosystem — which domains are crowded, how fast new entries are born, and whether a list of several thousand items can still be curated by hand.

TL;DR:

- The list holds **3,862 servers** across 58 categories (counted from README @ a62cced, 2026-09-08); Developer Tools leads with 483 entries.
- Growth: **+491 entries in 30 days** (3,371 → 3,862) — roughly 16 new servers per day.
- Update cadence: **1,247 commits in 30 days**; the last 30 commits landed within about 90 minutes.
- The list describes itself with a four-group icon system, and **65% of entries** carry an auto-computed score badge from glama.ai.

## The anatomy of a 1.6 MB list

The first surprise: the repo's README is 1.6 MB long (measured from a clone @ a62cced, 2026-09-08). It is not documentation about the list — it is the list. Three layers:

```
Top:        What is MCP? · Clients · Tutorials · Community · Legend
Body:       ## Server Implementations
              └─ 59 category headings (58 distinct — E-Commerce appears twice), 3,862 entries like "- [Name](link) icons — description"
Bottom:     ## Frameworks · ## Tips and Tricks · ## Star History
```

The scope is pinned in the very first sentence — from the original README:

> "MCP is an open protocol that enables AI models to securely interact with local and remote resources through standardized server implementations."

(punkpeye/awesome-mcp-servers, [README @ a62cced](https://github.com/punkpeye/awesome-mcp-servers/blob/a62cced/README.md), retrieved 2026-09-08)

In the September map of 50 projects ([agentic-landscape-50-projects](/blog/agentic-landscape-50-projects/)), this list topped the MCP group at 94.6k stars. That piece looked from above; this one descends into the list's own entries.

## Where 3,862 servers live

Each entry is one line: name, link, classifying icons, a one-sentence description. Splitting the README by category heading and counting entries (2026-09-08, README @ a62cced), the top 10 categories are:

| Category | Entries |
|---|---|
| Developer Tools | 483 |
| Finance & Fintech | 431 |
| Knowledge & Memory | 317 |
| Search & Data Extraction | 229 |
| Security | 215 |
| Other Tools and Integrations | 202 |
| Communication | 149 |
| Databases | 132 |
| Aggregators | 126 |
| Cloud Platforms | 121 |

The top 10 hold 2,405 entries — 62% of the list — while 48 other categories share the remainder. Read as an index, the table says MCP is no longer a "connect my model to my database" developer concern: Finance & Fintech at second place shows financial software adopting the protocol at scale. The middle band — knowledge, retrieval, security — is a shared context layer for every domain.

One detail betrays the process's age: the E-Commerce category appears twice in the list, once with 33 entries and once with 1 entry (counted 2026-09-08). At the scale of 3,862 items, manual curation starts leaving seams.

## Growth: +491 entries in 30 days

Take two README snapshots exactly a month apart and count them the same way:

| Snapshot | Commit | Entries | `###` headings (whole file) |
|---|---|---|---|
| 2026-08-08 | 165f838 | 3,371 | 58 |
| 2026-09-07 | a62cced | 3,862 | 60 |
| Δ 30 days | — | +491 (+14.6%) | +2 |

About 16 new entries per day — the list grew nearly 15% in a single month ([README @ 165f838](https://github.com/punkpeye/awesome-mcp-servers/blob/165f838a725987afe402538f9ad0439fdfce3048/README.md) vs README @ a62cced). The commit cadence matches: 1,247 commits in the 30 days counting back from 2026-09-08 (GitHub API); the last 30 of them all fall between 21:43 and 23:11 UTC on 2026-09-07 — 30 merges in 88 minutes. That is the shape of an automated process: PRs merged in bursts rather than by an on-call human one at a time.

For an ecosystem, the birth rate of directory entries approximates the birth rate of products. At 16 entries a day, MCP has developed its own lifecycle: a server is born, listed, scored by a badge — the lifecycle begins as a single line in a README.

## Icons: a list that describes itself

The Legend at the top of the list defines four icon groups: official status (🎖️), language (📇 TypeScript, 🐍 Python, 🏎️ Go, 🦀 Rust, and a few more), scope (☁️ cloud, 🏠 local, 📟 embedded), and operating system (🍎 🪟 🐧). Counted across entry lines @ a62cced, 2026-09-08:

| Icon | Meaning | Entries |
|---|---|---|
| 📇 | TypeScript/JavaScript | 2,129 (55%) |
| 🐍 | Python | 1,272 (33%) |
| 🏎️ | Go | 185 |
| 🦀 | Rust | 115 |
| 🎖️ | official | 332 |

Beyond the human-assigned icons, 2,493 of 3,862 entries (65%) carry an auto-computed score badge from glama.ai — an external service scans and scores each server, and the list embeds the result as SVG. Put together: in 30 seconds you can extract "TypeScript, local, official, high score" without reading a single description. That is no longer a link list — it is a schema you can query with your eyes.

Wakii lives on a similar integration layer: its agents work through a kit of 20 skills and a nine-agent team (at the time of writing, per the docs) — a kit describing itself so agents pick the right tool is the same problem this list's Legend solves. The kit overview lives in the [agents & kit docs](/docs/agents-and-kit/).

## What Wakii learns

- **ADOPT** — the legend convention: the list describes 3,862 entries with one four-axis key placed before the directory; Wakii's skills catalog (13 public skills at the time of writing) currently has prose descriptions only. Adding a single-axis label — read/write scope vs command execution, target language or platform — plus a legend at the top is a small change that turns catalog browsing from reading every line into filtering by eye.
- **DIRECTION** — auto-computed score badges: 65% of entries are pre-scored by an external service and embedded as SVG. Wakii could do the same for its skills/agents catalog as an automated quality signal (last verified run, verification source) — not immediately, because the signal must be designed to be honest before it is displayed, or it becomes decorative.
- **WATCH** — ecosystem velocity: +16 entries a day means the MCP server directory churns faster than any static document. Wakii does not yet expose an external MCP connection surface (the kit ships with releases, not a marketplace) — track this rate to decide which server groups deserve built-in support when that surface forms; promote to DIRECTION once an MCP client appears on the roadmap.
- **N/A** — the 1,247-commits-per-30-days merge-bot operation of a community directory does not transfer to Wakii's product repo: releases pass human gates, and merging to the mainline is a human gate (the "Humans own the irreversibles" principle in the [story workflow](/docs/story-workflow/)).

Connecting agents to real systems and wanting a process with gates instead of assurances? Wakii is an agentic IDE with a built-in agent team — start at [getting started](/docs/getting-started/).
