---
title: "MCP registry: the central directory of MCP servers"
description: "Inside modelcontextprotocol/registry: server.json declares its own schema version, reverse-DNS server names require ownership proof, and the metaregistry model points at packages instead of hosting code."
pubDate: "2026-10-11"
category: "tech"
tags: ["oss", "architecture", "license"]
draft: false
---

The MCP ecosystem is growing fast: thousands of servers written by authors who have never met, and every MCP client has to answer the same question — what do you trust enough to install? modelcontextprotocol/registry is the ecosystem's official answer: a central directory where a client looks up what a server is, which versions exist, where to install from, and who owns that name. The repo's README keeps it short: an *"app store for MCP servers"* (source: [README](https://github.com/modelcontextprotocol/registry/blob/739b70e8bc1bea203c5a35ab699f1df51d091568/README.md)). Snapshot taken 2026-09-08: 7,227 stars, latest push 2026-09-05; the repo is publicly available on GitHub, and the GitHub API reports its license as NOASSERTION, so terms of use follow the LICENSE file in the repo (per the GitHub API on 2026-09-08). This post is not written from memory — it reads the README, the Go code, and the live API.

TL;DR:

- The registry is a metadata directory for MCP servers — it hosts no code; it points at npm, PyPI, OCI and other package registries.
- server.json self-declares its schema version via the `$schema` field; the validator loads the rule set matching that date, so old data never breaks when the format evolves.
- Server names follow reverse-DNS: owning a namespace must be proven with GitHub OAuth/OIDC or a DNS/HTTP challenge — self-assertion does not count.
- The forge-assigned `Repository.ID` helps detect "resurrection attacks": a repo deleted and recreated under the same name changes its ID, exposing the impersonation.
- The API has been frozen at v0.1 since 2025-10-24; the spec lets anyone run a registry of their own.

## server.json declares its own schema version

The most interesting part of the code is how the registry avoids breaking old data. Every server.json must carry a `$schema` field — a URL pointing to the schema version that document follows. The registry's validator reads that URL, extracts the version, and loads the matching embedded schema file:

```go
// extractVersionFromSchemaURL extracts the version identifier from a schema URL
// e.g., "https://static.modelcontextprotocol.io/schemas/2025-10-17/server.schema.json" -> "2025-10-17"
re := regexp.MustCompile(`/schemas/([A-Za-z0-9_~.-]+)/server\.schema\.json`)
```

(excerpt from [`internal/validators/schema.go`](https://github.com/modelcontextprotocol/registry/blob/739b70e8bc1bea203c5a35ab699f1df51d091568/internal/validators/schema.go); the code comment states *"Empty/missing schema always produces an error"* — a missing `$schema` is rejected outright.)

The `internal/validators/schemas/` folder holds schema files named by date: `2025-07-09.json`, `2025-09-16.json`, `2025-09-29.json`, `2025-10-11.json` (repo tree, per the GitHub API on 2026-09-08). The current constant in [`pkg/model/constants.go`](https://github.com/modelcontextprotocol/registry/blob/739b70e8bc1bea203c5a35ab699f1df51d091568/pkg/model/constants.go) pins `CurrentSchemaVersion = "2025-12-11"`. In practice: a document published today is checked against the 2025-12-11 rules, while a document from July 2025 keeps being read under the rules of its own day — the registry does not rewrite data history.

This runs in production, not just in code: the first record on the first page I pulled from the public API is named `ac.inference.sh/mcp`, with `$schema` pointing at `schemas/2025-12-11/server.schema.json` (per registry.modelcontextprotocol.io on 2026-09-08). Domain-based namespaces — not just GitHub — are routine in the wild.

## Namespace identity: prove it, don't claim it

A growing ecosystem means everyone wants a nice name. The registry handles name ownership by forcing server names into reverse-DNS form, then tying ownership proof to that exact namespace. The `Name` field in the ServerJSON definition:

```go
Name string `json:"name" minLength:"3" maxLength:"200" pattern:"^[a-zA-Z0-9.-]+/[a-zA-Z0-9._-]+$" doc:"Server name in reverse-DNS format. Must contain exactly one forward slash separating namespace from server name." example:"io.github.user/weather"`
```

(excerpt from [`pkg/api/v0/types.go`](https://github.com/modelcontextprotocol/registry/blob/739b70e8bc1bea203c5a35ab699f1df51d091568/pkg/api/v0/types.go), per the GitHub API on 2026-09-08)

To publish `io.github.<you>/...`, you must be logged in to GitHub as that account — or publish from GitHub Actions in your repo (GitHub OIDC). To publish `<your-domain>/...`, you must prove domain ownership via a DNS or HTTP challenge (README, probe date 2026-09-08). Four authentication methods in total: GitHub OAuth, GitHub OIDC, DNS verification, HTTP verification.

A subtler detail sits in `Repository.ID` — the identifier assigned by the forge (GitHub, GitLab). The doc comment notes it is meant to detect "resurrection attacks": if a repo is deleted and recreated under the same name, the ID changes and the impersonation is exposed. Verbatim: *"Should remain stable across repository renames and may be used to detect repository resurrection attacks"* ([pkg/model/types.go](https://github.com/modelcontextprotocol/registry/blob/739b70e8bc1bea203c5a35ab699f1df51d091568/pkg/model/types.go)).

## A metaregistry: it points, it doesn't hold

The MCP registry does not replace npm or PyPI — it sits above them. The design doc in the repo calls this kind of registry a *metaregistry*, verbatim: *"They host metadata about packages, but not the package code or binaries"* (source: [docs/design/ecosystem-vision.md](https://github.com/modelcontextprotocol/registry/blob/739b70e8bc1bea203c5a35ab699f1df51d091568/docs/design/ecosystem-vision.md)).

```
client ──lookup──▶ MCP registry   "weather-server v1.2.0 lives at npm:weather-mcp"
                        │ directs you to
                        ▼
              npm / PyPI / OCI / NuGet / Cargo  ← the actual code lives here
```

The registry accepts metadata for 6 package types: `npm`, `pypi`, `oci`, `nuget`, `mcpb`, `cargo` ([pkg/model/constants.go](https://github.com/modelcontextprotocol/registry/blob/739b70e8bc1bea203c5a35ab699f1df51d091568/pkg/model/constants.go)). The most instructive part is version discipline: the package `Version` field rejects ranges — the doc comment states *"Version ranges are rejected"* with examples `^1.2.3`, `~1.2.3`, `>=1.2.3`, `1.x` ([pkg/model/types.go](https://github.com/modelcontextprotocol/registry/blob/739b70e8bc1bea203c5a35ab699f1df51d091568/pkg/model/types.go)). A directory that wants to be trusted is not allowed to answer "any version is fine". Record lifecycle is also in the schema: `active`, `deprecated`, `deleted`, plus a registry-managed `isLatest` flag ([pkg/api/v0/types.go](https://github.com/modelcontextprotocol/registry/blob/739b70e8bc1bea203c5a35ab699f1df51d091568/pkg/api/v0/types.go)).

## One spec, many registries

The registry is not just a service — it is a spec plus one official implementation. The README notes the API entered an API freeze at v0.1 on 2025-10-24 so integrators can build without fear of breaking changes; the preview launched earlier, on 2025-09-08. The working group has 4 members from 4 different organizations: Stacklok (lead), PulseMCP, TeamSpark, Ravenmail (README, per the GitHub API on 2026-09-08). Recent release cadence:

| Tag | Release date (UTC) |
|---|---|
| v1.8.1 | 2026-08-06 |
| v1.8.0 | 2026-07-13 |
| v1.7.9 | 2026-05-12 |
| v1.7.8 | 2026-05-05 |
| v1.7.7 | 2026-05-04 |
| v1.7.6 | 2026-04-30 |

(per the GitHub API on 2026-09-08 — the early-May 2026 stretch was dense with 3 releases in 12 days, then it thinned out)

The ecosystem-vision doc calls the official instance *"the authoritative repository for publicly-available MCP servers"* ([link](https://github.com/modelcontextprotocol/registry/blob/739b70e8bc1bea203c5a35ab699f1df51d091568/docs/design/ecosystem-vision.md)) — and describes a subregistry layer: downstream registries can curate and add their own metadata without touching the canonical source.

## What Wakii learns

- **DIRECTION — namespace identity with ownership proof.** Wakii currently ships its kit with the app, so it does not need this yet; but if the skill catalog ever opens to outside contributions, the registry's reverse-DNS + GitHub OIDC pattern is a ready-made shape for "who owns a name proves they own it" (evidence: the namespace identity section).
- **DIRECTION — self-declaring versioned data contracts.** The `$schema` + validator-picks-rules-by-date pattern lets a format evolve without breaking old data — applicable to a Wakii manifest or catalog if the skill structure changes across app versions (evidence: the server.json section).
- **WATCH — the metaregistry and the MCP ecosystem.** Wakii is a potential MCP consumer; when the need to connect to MCP servers appears, discovery through a spec-compliant registry is the natural path (evidence: the one-spec section). Upgrade condition: Wakii's roadmap touching MCP clients.

Wakii takes a different distribution route: the kit installs itself on first app run, stays in sync with the app version, and needs no middleman — see the [agents and kit docs](/docs/agents-and-kit/). How a fork stays itself while an ecosystem shifts is covered in [why the fork keeps MIT](/blog/oss-why-fork-mit/); the curation mindset — a deliberate list, not an unfiltered pile — has its own tour in [skills catalog tour](/blog/skills-catalog-tour/).

Building an MCP server? Read the server.json spec and verify your assumptions against the public API — the fastest way to learn from this repo. Wakii is an agentic IDE with a built-in superpowers team — download it and let the agents run.
