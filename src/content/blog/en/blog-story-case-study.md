---
title: "Case study: this blog is itself a story"
description: "The blog you are reading was built with the same story workflow its posts describe — and the evidence sits in a public repo. This post opens the machinery up: a parity gate wired into the build, an OG contract pinned as a comment on the code, and a single PR closing the first story."
pubDate: "2026-09-03"
category: "build-log"
tags: ["build-log", "story-workflow", "evidence"]
draft: false
---

The case-study genre has a built-in weak point: the writer is both author and
witness, and the reader is left with one option — take their word for it. This
post takes the other direction. Since this very blog was built with the story
workflow, every claim below points at a file, a command, or a public pull
request. Nobody has to be trusted: open the repo, re-run the three commands at
the end, and see for yourself. The post walks four stops — a parity gate living
inside the build, a contract readable in the code, one destination branch closed
by one PR, and how to verify all of it yourself.

TL;DR:

- EN and VI slugs must match 1:1 — that gate runs before `astro build`, and a
  broken half-pair turns the build red immediately.
- The OG contract for post pages does not live in a separate document: it is a
  comment placed exactly where the code would be changed.
- The blog's first story closed with a single public pull request (PR #1); the
  review fix landed as its own commit, with a hash and a descriptive subject.
- Three commands at the end of the post let you verify each claim on your own
  machine.

## The parity gate lives in the build

A bilingual blog means every post exists twice, EN and VI, under the same slug.
The first engineering question: what keeps an EN post from going live while its
VI twin was quietly forgotten? The answer is not human discipline — it is a gate
wired into the site's build command itself:

```json
"build": "node scripts/check-blog-slug-parity.mjs && node scripts/check-blog-content.mjs && astro build",
```

*Source: package.json, retrieved 2026-09-07.*

The first script in that chain describes itself right in its header comment:

```
The blog collection uses locale subdirectories (src/content/blog/en/*.md,
src/content/blog/vi/*.md) and the i18n contract is LOCKED: EN and VI slug
sets must match 1:1 — hreflang pairs and the /vi/blog/ routes are derived
from the same slugs. A mismatch fails the build before `astro build` runs.
```

*Source: scripts/check-blog-slug-parity.mjs (header comment), retrieved 2026-09-07.*

The two `&&` operators mean the chain halts at the first red gate. Re-drawn as a
sequence:

```ascii
pnpm build
  ├─ 1 · check-blog-slug-parity.mjs   slug EN == slug VI?
  ├─ 2 · check-blog-content.mjs       word band · docs links · banned phrases
  └─ 3 · astro build                  runs only when (1) and (2) pass
```

*Source: the build line in package.json, retrieved 2026-09-07.*

The practical consequence: a post that exists as only half a locale pair cannot
silently reach production. The build fails before astro generates any route, and
the error names the exact slug that is missing. The i18n contract here is not a
promise written in a document — it is an assertion that runs in the build and
blocks the whole pipeline when it fails.

## The contract is readable in code

The second detail sits where few people look: the location of the spec. The post
page (`src/pages/blog/[slug].astro`) declares its Open Graph type right above
the props it passes:

```jsx
{/* og contract: posts are articles — pinned in spec FI-339 rev 2 (og:type + published_time + absolute og:image) */}
```

*Source: src/pages/blog/[slug].astro, retrieved 2026-09-07.*

In the layout (`src/layouts/Base.astro`), each of the three OG-related props
carries a comment spelling out the contract:

```ts
  /**
   * og:image path — ALWAYS resolved against Astro.site into an absolute URL.
   * Contract PINNED (spec FI-339 rev 2): relative og:image values are dropped
   * silently by social crawlers (Facebook/X/Zalo). Default: /og-default.png.
   */
  ogImage?: string;
  /** og:type — 'website' everywhere except blog post pages, which pass 'article'. */
  ogType?: 'website' | 'article';
  /** article:published_time — ISO timestamp; blog post pages pass it. */
  publishedTime?: string;
```

*Source: src/layouts/Base.astro (Props), retrieved 2026-09-07.*

The point is not the contract's content — it is where the contract lives. A
standalone document can go stale with nobody noticing; a comment sitting on the
exact line a developer would touch is hard to skip past: changing the post page
means reading the contract right in front of you. The full wording lives in spec
FI-339 rev 2, and the comment points at that spec by name — anyone who needs to
cross-check can find it instead of guessing where the rule came from.

## One destination branch, one PR

The first story that built this blog — 10 seed posts, exactly 5 slugs × 2
locales — went through the full pipeline and closed with a single public pull
request. Here is real git output from this repo:

```bash
$ git show --no-patch --format='%h %s' 55e5ae1
55e5ae1 feat(FI-341): review-fixes — soften unverified mobile claims (P1, cả EN twin), vi heading + fork phrase (P2)
$ git log --all --oneline --grep='Merge pull request #1' | head -2
3d9a7c3 Merge pull request #1 from wakii-dev/story/fi339-blog-features
```

*Source: git log on the wakii-site repo, run 2026-09-07.*

Read those two lines closely and several things surface. Commit `55e5ae1` is a
review fix: an independent reviewer caught a mobile claim that lacked evidence,
and the correction landed as its own commit whose subject says exactly that —
"soften unverified mobile claims" for both the EN and VI twins. Review was not
ceremony. The merge `3d9a7c3` is PR #1 from the `story/fi339-blog-features`
branch: an entire story lived on one destination branch and closed as one PR —
rather than commits scattered straight onto main. That story branch was later
merged as PR #1, public at
[github.com/wakii-dev/wakii-site/pull/1](https://github.com/wakii-dev/wakii-site/pull/1);
open it and you find the real diff and the real review conversation. This post
is dated 09-03 while the merge happened later — so only the hash and the PR
number are given here, and the exact timing sits in the git history where it
belongs.

## Verify it yourself with three commands

The most important part of a post that makes claims is how to check them. Three
commands, in rising order of effort.

One — grep the exact contract sentence in the parity script:

```bash
$ grep -n "must match 1:1" scripts/check-blog-slug-parity.mjs
7: * sets must match 1:1 — hreflang pairs and the /vi/blog/ routes are derived
```

*Source: run on the wakii-site repo, 2026-09-07.*

Two — open PR #1 on GitHub via the link in the previous section. That is a
public page, not a description from memory: the diff, the review, the merge —
all of it sits there, cross-checkable against the two git lines above.

Three — clone the repo and run `pnpm build`. The parity gate prints its verdict
on the first line:

```bash
$ node scripts/check-blog-slug-parity.mjs
✓ blog slug parity OK (6 posts × 2 locales)
```

*Source: run on the branch this post was written on, 2026-09-07 — at that moment
the branch carried 6 slugs (5 seeds + 1 pilot).*

That 6 will grow as the new posts of the current story land — which is exactly
the read-it-at-the-time rule: do not trust the number printed in a post, trust
the number your machine just printed. The original 10 seed posts are 5 slugs ×
2 locales; the rest are arriving with the current longform story, one locale
pair at a time, through the same parity gate.

That is the whole machine: a gate in the build, a contract in the code, one PR
closing a story. The full process behind it — sub-feature splits, gates, the
watchdog, the principles — is described step by step on the
[story workflow](/docs/story-workflow/) page. And for the same story seen from
the outside — the numbers and the releases — the seed
[building Wakii in the open — log 1](/blog/building-wakii-in-the-open-log-1/)
covers that half; this post disassembled the inside.

Wakii is an agentic IDE with a built-in superpowers team. If the machinery
above made you curious, get the app and run your first story — then open this
repo, re-run the three commands, and check how closely the words hold up.
