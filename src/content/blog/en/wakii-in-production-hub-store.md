---
title: "Wakii in production: hub-store"
description: "hub-store, a warehouse-operations platform, is built end to end with Wakii's story workflow — and every process trace (brackets, specs, plans) is public on GitHub. This post walks the project's seven-bracket journey; each GitHub link carries a verbatim quote so you can diff the words against the real files."
pubDate: "2026-09-04"
category: "build-log"
tags: ["build-log", "story-workflow", "evidence"]
draft: false
---

Every developer-tool pitch contains the same sentence: "we use it in
production." That claim is almost never checkable — which project, run how, and
with what artifacts to show for it? This post goes the other way, with
hub-store: a warehouse-operations platform running in production, built end to
end with Wakii's story workflow. Every process trace of the project — brackets,
specs, plans — is public on GitHub, in the `wakii-dev/hub-store` repo. You do
not have to take anyone's word: open each link, read the exact passage quoted
in this post, and judge for yourself. One honest note: this post is dated
09-04 on the publishing schedule, but the quotes and the verification commands
below were run on 09-07, when the post was written. Four stops: what the
project is, the journey through its brackets, the scale readable from the
artifacts, and why this kind of evidence survives link rot.

TL;DR:

- hub-store is a warehouse-operations platform: React microfrontends (Module
  Federation), a Fastify BFF, polyglot gRPC in Java/Go/Python, and
  Postgres/Kafka/Keycloak — inside a single Turborepo monorepo.
- The project's 7 brackets sum to 74 sub-features (SFs) — a number you count
  straight from public files, not from anyone's say-so.
- Every GitHub link in this post carries a verbatim quote, retrieved
  2026-09-07: if the file changes, the mismatch is visible.
- A canceled bracket is not deleted — it becomes an audit trail, right in the
  repo.

## What hub-store is

hub-store is a warehouse-operations platform running in production. The
architecture splits into clear layers: the UI is assembled from React
microfrontends using Module Federation; behind it sits a BFF written in
Fastify; the domain services talk gRPC to each other in three languages — Java,
Go, and Python; data lives on Postgres, events flow through Kafka, and
authentication and authorization run on Keycloak. All of the source lives in a
single Turborepo monorepo. Redrawn as a diagram:

```ascii
React microfrontends (Module Federation)
        │
        ▼
   BFF · Fastify
        │   gRPC — polyglot
   ┌────┼─────┐
   ▼    ▼     ▼
 Java   Go  Python
   │    │     │
   └────┼─────┘
        ▼
Postgres · Kafka · Keycloak

all source lives in one Turborepo monorepo
```

*Source: FI-359 evidence pack (hub-store digest, cross-checked against the
public repo), retrieved 2026-09-07.*

The notable part is not any single technology — each piece is common. The
notable part is how the project was built: not as one big-bang commit, but
through 7 stories, each with its own bracket, SFs split into tiers, and
independent review gates — and every bracket sits in the repo, next to the
code, not inside a private tool.

## The journey through the brackets

In the story workflow, a bracket is the file that brings a story into
existence: the epic, the sub-features (SFs) arranged in tiers, the boundaries,
and the definition of done. hub-store has 7 brackets under
`docs/superpowers/brackets/`; six files are on GitHub main, while the running
story's bracket is not yet. Walking them in Linear-number order — each link
comes with a verbatim passage from the file, retrieved 2026-09-07:

1. [brackets/ict-service-support-rebuild.md](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/ict-service-support-rebuild.md)
   — the project's first story was canceled and folded into the next one. The
   file was not deleted; it is marked in plain text:
   "File này chỉ còn là audit trail (Linear FI-232 Canceled)"
   — Vietnamese for "this file is now only an audit trail (Linear FI-232
   Canceled)". That is the mark-don't-delete law: a decision that happened
   leaves its trace in the repo, including a decision to cancel.

2. [brackets/fi233-polyglot-grpc-mf.md](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/fi233-polyglot-grpc-mf.md)
   — the story that laid the frontend foundation along with technology spikes.
   The first SF line reads "SF-1 FE Foundation + Spikes", with the constraint
   "KHÔNG SF UI start trước verdict SPIKE 1-3"
   — Vietnamese for "no UI SF may start before the SPIKE 1-3 verdict".
   Spike-first: until the spikes return a verdict, no UI sub-feature is allowed
   to begin.

3. [brackets/fi245-postgres-production.md](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/fi245-postgres-production.md)
   — the story that laid the data platform, the deepest of the project with 28
   SFs. Its SF-1 line reads "SF-1 Postgres infra + seed pipeline" —
   infrastructure and seed data first, domain services migrated after.

4. [brackets/fi272-minikube-deploy.md](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/fi272-minikube-deploy.md)
   — the story that moved the stack onto Kubernetes via minikube, 5 SFs. Its
   SF-1 line reads "SF-1 K8s platform foundation + Postgres + Kafka" — the K8s
   platform together with Postgres and Kafka first, the application deployed
   after.

5. [brackets/fi280-qa-hub-store-regression.md](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/fi280-qa-hub-store-regression.md)
   — the QA regression story, tier 0 of the quality effort:
   "Boot-verify full stack main @ d107f2f 7/7 ports; chạy 25 e2e specs baseline đỏ/xanh"
   — boot-verify the full stack on main at commit d107f2f, all 7 ports up; run
   the 25 e2e specs to establish a red/green baseline. A valuable piece of
   evidence, because it is so specific: commit `d107f2f`, 7 of 7 ports, 25 e2e
   specs.

6. The running story is fi338-dispatch-queue. Its artifacts — both the bracket
   and the design spec — are still local files, not on GitHub main at the time
   of writing, so this post neither links nor quotes them: the post's standard
   is that every link must open and every quote must be checkable. fi338 gets
   its telling when its artifacts go public.

The timeline, redrawn from the list above:

```ascii
bracket                         story                       SF
──────────────────────────────────────────────────────────────
ict-service-support-rebuild     canceled → audit trail      7
fi233-polyglot-grpc-mf          FE foundation + spikes     11
fi245-postgres-production       data platform              28
fi272-minikube-deploy           K8s on minikube             5
fi280-qa-hub-store-regression   QA baseline tier 0          8
fi326-api-docs-swagger          OpenAPI + drift-guard       9
fi338-dispatch-queue            running                     6
                                                    ────────
                                                    74 SF
```

*Source: 6 brackets on GitHub main `wakii-dev/hub-store`, retrieved
2026-09-07.*

## Scale you can read from artifacts

The project's scale does not need to be taken on faith — count it from the
files themselves. The table below counts SFs per bracket:

| Bracket | SF |
| --- | --- |
| ict-service-support-rebuild (FI-232) | 7 |
| fi233-polyglot-grpc-mf (FI-233) | 11 |
| fi245-postgres-production (FI-245) | 28 |
| fi272-minikube-deploy (FI-272) | 5 |
| fi280-qa-hub-store-regression (FI-280) | 8 |
| fi326-api-docs-swagger (FI-326) | 9 |
| fi338-dispatch-queue (FI-338, running) | 6 |

*Source: the public brackets on GitHub main `wakii-dev/hub-store`; the fi338
row (bracket not yet public) comes from the project digest in the FI-359
evidence pack, retrieved 2026-09-07.*

The sum: 7+11+28+5+8+9+6 = 74 SFs — simple arithmetic you can redo. The one
bracket not yet shown above is fi326, and it follows the same template:
[brackets/fi326-api-docs-swagger.md](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/fi326-api-docs-swagger.md)
opens with "SF-1 Foundation — toolchain, root spec, drift-guard, Swagger UI" —
the drift-guard runs vitest and blocks adding or removing a route without
updating the spec.

One condition makes all of this evidence meaningful: the repo has to actually
be public. The check, run on 2026-09-07:

```bash
$ gh repo view wakii-dev/hub-store --json isPrivate,name,owner
{"isPrivate":false,"name":"hub-store","owner":{"id":"U_kgDOE2KJqw","login":"wakii-dev"}}
```

*Source: gh repo view, run 2026-09-07.*

On main, at the time of writing, `docs/superpowers/` holds 32 spec files and
53 plan files — each story leaves multiple layers of paper behind: bracket,
spec, plan — all sitting next to the code.

*Source: GitHub API contents/docs/superpowers/specs and /plans, counted
2026-09-07.*

## Why this is real evidence

The built-in weakness of a source link: the link dies, or the file changes
after the post is published — and the reader loses the ability to check. The
defense in this post: every GitHub link carries its verbatim quote right here
in the post. You open the file on GitHub and diff by eye: a match — the post's
words hold; a mismatch — the file changed after writing, and the mismatch
itself is information. Nothing in this post asks you to trust a "reliable
source": every claim travels with an artifact you can open in seconds.

```ascii
this post ── link ──► file on GitHub main
   │                       │
   └─ verbatim quote       │
          in the post      │
              └──── diff ──┘
      match = words hold · mismatch = file changed
```

*Source: the structure of this post itself — 6 GitHub links, 6 verbatim
quotes, 2026-09-07.*

Two posts on this blog share the same angle: [the case study of this very
blog](/blog/blog-story-case-study/) disassembles the blog with the same
evidence method, and [the story workflow from idea to
release](/blog/story-workflow-idea-to-release/) tells the process from the
top. The full process detail — brackets, tiers, gates, the watchdog — lives on
the [story workflow](/docs/story-workflow/) page.

Wakii is an agentic IDE with a built-in superpowers team. If you want the same
process for your own project: get Wakii, run your first story — then open the
hub-store repo and see what a production project looks like after passing
through it.
