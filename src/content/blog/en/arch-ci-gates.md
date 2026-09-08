---
title: "CI gates: machine-checked quality before the human gate"
description: "Before any human gate looks at anything, the machine gate chain has already run: this post reads two real chains — this site's build chain and the product's release pipeline — plus the rare spot where a workflow states what it will not do: deploy only runs when its condition is met, otherwise it no-ops."
pubDate: "2026-09-29"
category: "tech"
tags: ["architecture", "qa", "workflow"]
draft: false
---

Wakii's story process gets told mostly through its human gates — the independent stopping points before work counts as done. Less often told is the layer underneath those gates: machine gates that run by themselves, fail by themselves, and require nobody to remember to invoke them. This post reads that layer straight from the files, across two repos: the build chain of the very site you are reading, and the product's release-cut pipeline. It also points at a rare sight in a CI file — the place where a workflow states what it does not do, instead of leaving readers to guess.

TL;DR:

- The site's build chain wires four gates into one command: parity → blog-utils → content lint → astro build; one red link turns the whole chain red.
- The site's CI has exactly one job — "Build & check" — rerunning that same chain on every push to main and every pull request.
- On the product side, the release-cut pipeline is a chain of jobs wired by `needs`: blocking gates first, artifact builds after, publish last, E2E dispatched right after publishing.
- Deploy is not promised: the deploy workflow states its secret condition, and until it is met it no-ops — production stays a deliberate human action.

## One command line, four gates

The site's entire quality chain fits inside one `build` line of `package.json`:

```json
"build": "node scripts/check-blog-slug-parity.mjs && node scripts/check-blog-utils.mjs && node scripts/check-blog-content.mjs && astro build",
```

*Source: `package.json`, public repo `wakii-dev/wakii-site`, retrieved 2026-09-08.*

Four links, each blocking a different class of failure: the parity gate checks that every post has both VI+EN locale files — half a pair fails; blog-utils checks that the blog's utility layer still matches real content; the content lint checks word bands, frontmatter, and the forbidden phrases in the claims registry; and `astro build` — the most expensive link — only runs once the first three are green. The order is not decoration: cheapest first, most expensive last, so a post with a typo'd frontmatter does not have to wait for a full site build to get rejected. The post [case study: this blog is itself a story](/blog/blog-story-case-study/) dissects where each gate layer sits in the code.

One more thing worth noticing: this chain is not a frozen relic. It grows whenever a new gate proves worth blocking on — four links as of writing, while the batch-1 posts once quoted three. The post you are reading had to pass through this exact door too before it counted.

## CI reruns that same chain, on another machine

The site's workflow file — `.github/workflows/ci.yml` — is thin enough to quote almost in full:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    name: Build & check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Build site
        run: pnpm build
```

*Source: `.github/workflows/ci.yml`, repo `wakii-site`, retrieved 2026-09-08.*

The structure matters because of how thin it is: a single job, no separate test step, no quality standard defined in the YAML at all — CI simply reruns `pnpm build`, the repo's four-gate chain, on a clean machine with a frozen lockfile. The standard lives in the repo; CI is just that standard being re-executed somewhere with no cache and no local reason to grant exceptions.

One detail in the file tells a story about what a human gate caught:

```yaml
          # ≥22.18 — check-blog-utils.mjs imports src/utils/blog.ts and node
          # strips TS types natively only from 22.18 (23.6 unflagged). Pin 20
          # failed with ERR_UNKNOWN_FILE_EXTENSION (SF-1 FI-355 review P0).
          node-version: 22
```

*Source: `.github/workflows/ci.yml`, retrieved 2026-09-08.*

That comment is the record of a blocked failure: a Node 20 pin once broke the check chain with a cryptic extension error, an independent review caught it, and now the reason sits right at the config line — so nobody can "tidy it up" to a shorter version and break it again. The gate keeps the standard; the comment keeps the reason for the standard.

## On the product side: a release is an ordered chain of jobs

The product's release-cut workflow is considerably bigger: the `release-cut.yml` file runs past 2,200 lines, and the length is not ceremony — it is jobs wired together with `needs`, each job one gate:

```ascii
cut ──► create-release
  ├──► terminal-rendering-golden ───────────┐
  ├──► skill-sharing-release-gate ──────────┼──► release-preflight
  └──► skill-sharing-linux-floor-release-gate ──────┘           │
                                                build + build-mac
                                                       │
                                                publish-release
                                                       │
                                    post-release-e2e · docs · homebrew
```

*Source: `.github/workflows/release-cut.yml` (product repo), the `needs:` edges of each job, retrieved 2026-09-08.*

Reading along the `needs` edges: three gate jobs — golden rendering and two release gates — must succeed before `release-preflight` runs; that very job prints the closing line before artifacts get built:

> All blocking release gates passed; artifact builds may start.

*Source: `.github/workflows/release-cut.yml`, the "Confirm blocking release gates passed" step inside the `release-preflight` job, retrieved 2026-09-08.*

Only after preflight do `build` and `build-mac` assemble artifacts, and `publish-release` sits behind them in the chain. Two details show the pipeline is designed fail-closed. One: the comment right above `release-preflight` reads — "failure cannot create signing requests that can never be published" — the blocking gate must stand before the point where signing requests originate, not after. Two: the verify-shipped registry labels computer-use native as SHIPPED citing commit `787766bfcf` described as "CI full chain with computer-use, DMG to release" — a chain of this shape is what carries a DMG to a release, not a manual step at the end.

One more layer sits behind publishing: the `post-release-e2e` job dispatches the E2E suite against the exact tag just released. Finishing a release is not the end of checking — it is the input to another round of it.

## The place where the workflow refuses to promise

The site's deploy workflow opens with a comment rarely seen in CI files:

> Production deploy on push to main. Requires the repo secret VERCEL_TOKEN (create at https://vercel.com/account/settings/tokens with scope to the wakii-site project). Until the secret is set, the job no-ops cleanly.

*Source: `.github/workflows/deploy.yml`, repo `wakii-site`, retrieved 2026-09-08.*

And the file keeps its word: the first step checks the secret, writes `enabled=false` when it is absent, and every later step — install the CLI, pull the environment, build, deploy — is wrapped in `if: steps.check.outputs.enabled == 'true'`. So this post cannot say "CI deploys production automatically", and does not need to: what the file demonstrates is honesty in the other direction — the workflow states its condition, and while the condition is unmet it skips exactly as defined. Production, as of writing, remains a deliberate human action; the boundary between machine and human sits right there in the YAML rather than in someone's head.

## The stack: machine first, human after

Placing the two repos side by side, a common shape appears:

```ascii
commit ──► CI gates (machine, runs itself)
              │   parity · lint · build · release gates
              ▼
        green build / artifacts ready
              │
              ▼
        story gates B0–B5 (human + independent verifier)
              │
              ▼
        Done — recorded in the release notes
```

*Source: diagram synthesized from `package.json`, `ci.yml`, `release-cut.yml`, and the v1.4.198 release notes, retrieved 2026-09-08.*

The human layer of this system already has a post — [gates, not trust — and Rule 0](/blog/gates-not-trust-rule-zero/) — walking every B0–B5 gate and verdict; here one quote from the v1.4.198 release notes itself, the "Quality gates" section where the release declares which layer signed off on it, is enough:

> Every sub-feature cleared the six story gates: B0 browser walkthrough · B1 code + tests · B2 plan ticked · B3 independent review · B4 merged · B5 issue done. Verdict from an independent verifier — self-reports don't count.

*Source: `gh release view v1.4.198 --repo wakii-dev/wakii`, retrieved 2026-09-08.*

When a release says "cleared the gates", that sentence stands on two layers of evidence: the CI chain went green, and an independent verifier signed off. The two layers catch different kinds of wrong: the machine catches structural wrongness — a broken build chain, a failed gate, a drifted manifest; the human catches wrongness of intent — a feature built correctly that is not the one needed. Remove the lower layer and the upper one reviews material that cannot even build; remove the upper one and the lower proves only that code runs, not that it does the right job.

The full process from idea to release — where CI stops and the human gates pick up — lives in the [story workflow](/docs/story-workflow/) docs. To watch the machine layer operate in front of you: open a pull request against this repo, and read CI speak before any human gets the chance to comment.
