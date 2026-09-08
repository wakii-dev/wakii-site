---
title: "Building Wakii in the open — log #3"
description: "The third log of building Wakii in the open: story FI-349 redesigned the entire blog — category taxonomy, a two-locale article surface, hero tiles, hreflang — and closed as a single PR. With a sourced before/after comparison."
pubDate: "2026-09-30"
category: "build-log"
tags: ["build-log", "wakii", "release"]
draft: false
heroImage: "/blog/heroes/building-wakii-in-the-open-log-3.png"
---

Log #2 closed with a promise: the numbers would be captured again and compared — which moved, which held still. This log keeps that rhythm but turns the camera. Instead of covering new posts, it covers the frame that holds them. Story FI-349 redesigned the blog from a flat list into a two-locale system, then closed as a single merged PR. The question of this log: what does design contribute to a technical product, and how do you know it did the job instead of just looking good?

TL;DR:

- Story FI-349 redesigned the blog: a new layout, a category taxonomy, SEO depth, and an article surface for every post × 2 locales — the scope readable straight from the PR #2 title.
- PR #2 merged at 16:24 UTC on 2026-09-07 — one story, one branch, one PR, the same rule this series runs on.
- A post page is an article surface built from one shared layout: hero tile, related, JSON-LD, and an en-vi hreflang pair declared in every page's head.
- Before/after is measurable: from the 10-post seed set (log #2) to 25 slugs × 2 locales = 50 files at the 2026-09-08 snapshot; the next public plan is 69 slugs × 2 = 138 pages.

## Where the flat post list hits its ceiling

Before FI-349, this blog was a list: one card per post, sorted by publish date, the end. With ten seed posts, that list was enough. But the blog's plan did not stop there: a longform series was on its way — step-by-step tutorials, tech notes, and build logs — each type needing its own place on the listing, every post existing in two languages, each one carrying the SEO expectations of a long technical article. As the post count grew and the language count became two, questions that once felt trivial turned into architecture decisions: where does a post live when you read it in Vietnamese? Which categories are broad enough without turning into junk? What does a post page need beyond the text?

The taxonomy answers by schema, not by convention:

```ts
// src/content.config.ts
/** tutorial | tech | build-log — drives the listing badge. */
category: z.enum(['tutorial', 'tech', 'build-log']),
```

*Source: src/content.config.ts, public repo wakii-dev/wakii-site, retrieved 2026-09-08.*

Three categories — tutorial, tech, build-log — are the entire taxonomy of the blog. No invented names, nothing outside the enum: the schema rejects any other value at build time, and the repo's lint pins the same trio. The taxonomy stays lean not through writer discipline but through a build condition.

## FI-349: the scope readable from the PR title

Story FI-349 ran the way every story in this process runs: spec, plan, parallel SFs, convergence onto one story branch, closing as exactly one PR. What is worth noting is that the scope of the whole story sits inside the PR title — anyone can tell what it did without opening the diff:

```bash
$ gh pr view 2 --repo wakii-dev/wakii-site --json state,mergedAt,title
{"mergedAt":"2026-09-07T16:24:22Z","state":"MERGED","title":"FI-349 Blog redesign — layout, category taxonomy, SEO depth, multi content type"}
```

*Source: gh pr view, public repo wakii-dev/wakii-site, run 2026-09-08.*

Four keyword phrases in that title are the four layers of the redesign. Layout is the shared presentation frame of the site. Category taxonomy is the trio from the previous section. SEO depth means canonical, hreflang, and an OG card per post. Multi content type is the demand that one frame carry tutorials, tech notes, and logs alike. And as with every story before it, [one branch, one PR](/blog/one-branch-one-pr/) remained the operating rule: even when most of the diff is interface, every change goes through the single reviewed merge door.

## A post page is an article surface, not a markdown page

The least visible work of FI-349 lives on the post page. The route for each post is a thin file — almost nothing but picking the right entries for the locale and handing the rest to one shared layout:

```astro
/* src/pages/blog/[slug].astro — EN blog post — thin route (FI-349 SF-2):
   getStaticPaths (draft filter, LOCKED) + render; the docs-shell article
   surface (sidebar, pager, meta, hero, related, after-CTA, JSON-LD) lives
   in BlogDetailLayout.astro. */
```

*Source: comment in src/pages/blog/[slug].astro, public repo wakii-dev/wakii-site, retrieved 2026-09-08.*

The seven components in that comment — sidebar, pager, meta, hero, related, after-CTA, JSON-LD — are what a technical post needs to exist as a web page: navigation between posts, structured data for search engines, and a 1200×630 hero tile when a post carries a lead image. The hero contract is written into the schema itself: the PNG path lives in public/, bypassing astro:assets, and the VI mirror shares the EN hero. This log is the first entry of the series beyond the seed set: both locale files declare the same heroImage path in frontmatter — the VI mirror shares the EN hero file, and the parity gate checks that presence and value stay in sync.

SEO depth sits in every page's head. The next two lines tell search engines that an EN post and its VI twin are two versions of the same content:

```html
<link rel="alternate" hreflang="en" href={new URL(canonicalPath, Astro.site)} />
<link rel="alternate" hreflang="vi" href={new URL(viPath, Astro.site)} />
```

*Source: src/layouts/Base.astro, public repo wakii-dev/wakii-site, retrieved 2026-09-08.*

The comment right above those lines records a real trap: if the canonical does not point at the page itself, the whole hreflang cluster can be ignored by search engines. A small detail — but exactly the kind of detail the phrase "SEO depth" in the PR title bought, and the post [dissecting the OG article contract](/blog/og-article-contract-anatomy/) continues that story down to the meta attributes if you want to go deeper.

## Before and after, in sourced numbers

Log #2 covered the 10-post seed set and the plan for 30 — reread it [in log #2](/blog/building-wakii-in-the-open-log-2/). This log only adds the second half of the comparison, captured at the 2026-09-08 snapshot:

| Milestone | Numbers | Source |
| --- | --- | --- |
| Seed set (FI-341) | 5 slugs × 2 locales = 10 posts | evidence pack, snapshot D8 |
| After the longform story | 25 slugs × 2 locales = 50 files | evidence pack, snapshot 2026-09-08 |
| Next public plan | +44 slugs → 69 slugs × 2 = 138 pages | batch-2 matrix committed in the repo |

*Source: FI-359 evidence pack, §Numbers snapshot (rows 5+7), captured 2026-09-08; topic-matrix-batch2.md in the public repo, retrieved 2026-09-08.*

The releases belong to the same comparison. Log #2 captured three tags — v1.4.199, v1.4.198, and the Android build mobile-android-v0.0.48, all on 2026-09-05; by the 2026-09-08 snapshot, rerunning the command returned exactly those three tags, nothing added and nothing missing — including the fact that no 1.4.197 exists between the two desktop releases. Holding still is also a comparison result: this series does not report releases without running the command that fetches them.

## Writing is part of the product

The ending of this log is shorter than its technical sections, because the sentence worth saying has already surfaced: once the blog has a schema, a taxonomy, a hero contract, and an hreflang pair, writing becomes part of the product too — with its own gates and lint, rather than a decorative layer laid on top. That is why log #4, published the same day, does not say "we wrote 20 posts" but tells which machinery keeps those twenty posts honest: a matrix locked in advance, a word-counting lint, a claims registry, and an integration pass after the merge.

```ascii
/blog/<slug>/          the EN post
/vi/blog/<slug>/       the VI twin — same slug
hreflang en <-> vi     the pair declared in both pages' <head>
```

*Source: the src/pages/blog structure and src/layouts/Base.astro, public repo wakii-dev/wakii-site, retrieved 2026-09-08.*

To run a story of this exact shape with your own hands, [getting started](/docs/getting-started/) takes you from clone to the ⚡ Superpowers panel in minutes — the rest of the process waits in the docs.
