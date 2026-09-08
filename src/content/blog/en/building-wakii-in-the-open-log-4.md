---
title: "Building Wakii in the open — log #4"
description: "The fourth log of building Wakii in the open: twenty longform posts written with their own editorial framework — a matrix locked in advance, a word-band lint, a claims registry — closed by PR #3, then an integration pass after the merge."
pubDate: "2026-09-30"
category: "build-log"
tags: ["build-log", "wakii", "evidence"]
draft: false
---

[Log #3](/blog/building-wakii-in-the-open-log-3/) covered the frame: FI-349 rebuilt the blog and closed as PR #2. This log covers what sits inside the frame — the twenty longform posts of story FI-359, each in a VI and an EN version. The interesting part is not the number twenty. It is the editorial framework built alongside them to keep those twenty posts honest: a matrix locked before writing began, a word-counting lint that accepts no excuses, and a forbidden list that ships with the build. The story closed as PR #3 — and the work did not end there: after the merge came an integration pass worth its own detail.

TL;DR:

- 20 topics had their slug, publish date, and category locked in a matrix before the first line was written; split as 3 tutorial / 13 tech / 4 build-log.
- The word band is a build condition, not a suggestion: VI 900-1400 (failing at 1470), EN floor 800 — text inside fenced code blocks never counts.
- The claims registry is the single source of truth for forbidden phrases: the lint reads the registry at run time instead of copying the list into the script.
- PR #3 merged at 00:32 UTC on 2026-09-08; after the merge the build chain gained one gate — and the lesson is that a green build must be proven on the merged result before calling the work done.

## Twenty topics, one matrix locked before writing

FI-359's earliest decision was not "what to write" but "lock everything first": twenty topics, each with a fixed slug, publish date, and category in a matrix table, committed to the repo before the first post was opened. Counting the split by category is one grep over that very table:

```bash
$ grep -o '| tutorial |\|| tech |\|| build-log |' \
    docs/superpowers/editorial/2026-blog-longform/topic-matrix.md \
  | sort | uniq -c
   4 | build-log |
  13 | tech |
   3 | tutorial |
```

*Source: grep on topic-matrix.md, public repo wakii-dev/wakii-site, run 2026-09-08.*

Four plus thirteen plus three equals twenty — matching the matrix row count. Writing against a matrix locks away the decisions most prone to drifting: no post moves its own publish date, no slug changes mid-flight on a whim. The price of that rigidity buys something repeatable: anyone who opens the matrix knows exactly what the blog will contain, before the blog contains it.

## The word-band lint: a counting algorithm with nothing to please

Every long post risks one disease: padding to hit a length. This series' lint blocks that disease with a public counting algorithm, named D1 in the style guide: take the body after the frontmatter, strip every fenced code block, then count the words of what remains. Stripping fenced blocks is the pivotal choice — an ASCII diagram or a command transcript must not count toward the band, or every post would reach "900 words" through pictures. The constants sit right in the script:

```js
/* scripts/check-blog-content.mjs — word band, decision D1 */
const VI_MIN = 900;
const VI_WARN = 1400;
const VI_HARD = 1470;
const EN_MIN = 800;
```

*Source: scripts/check-blog-content.mjs, public repo wakii-dev/wakii-site, retrieved 2026-09-08.*

VI under 900 words fails; over 1400 earns a warning; over 1470 — the hard cap — fails. The EN floor is 800. The VI and EN versions of each post share structure, date, and category; a length difference between the two languages is accepted, while a missing half of a locale pair is not — the parity gate upstream of this one already takes care of that.

## The claims registry: a forbidden list that ships with the build

Sourced numbers are one half of "not lying". The other half is product phrases that must never appear in a post. Rather than relying on writers' memories, the story built a claims registry: a markdown file with an ALLOWED section — what has been verified, with sources — and a FORBIDDEN section, one literal phrase per line. The lint reads exactly that FORBIDDEN section at run time and greps the whole file, title and description included, case-insensitively. The comment in the script is a manifesto on its own:

```js
/* The forbidden list is parsed from the registry at run time — the registry
   is the single source of truth, the script never duplicates it. */
```

*Source: scripts/check-blog-content.mjs, public repo wakii-dev/wakii-site, retrieved 2026-09-08.*

That means an unverified claim needs no one to "remember" to avoid it: it lives in the registry once, and every post after it gets blocked at build time automatically. The post [done means evidence](/blog/done-means-evidence/) dissected this principle at the story layer; the registry and the evidence pack — snapshots of numbers with their source commands and retrieval dates — are that same principle's version for prose.

## PR #3 and the integration pass after the merge

FI-359 closed in the series' exact shape: converged onto one branch, one PR. The PR transcript, run on the very day this log was written:

```bash
$ gh pr view 3 --repo wakii-dev/wakii-site --json state,mergedAt,title
{"mergedAt":"2026-09-08T00:32:26Z","state":"MERGED","title":"FI-359: Blog longform — 20 bài viết dài làm nổi bật tính năng Wakii (30 posts en/vi)"}
```

*Source: gh pr view, public repo wakii-dev/wakii-site, run 2026-09-08.*

A green merge is not the finish line. Right after the merge came the integration pass on the destination branch: when FI-349's new blog surface met 40 new post files, the build chain needed one more check in front of astro build. The post-integration build line is four commands chained with && — one red command stops the whole chain:

```json
"build": "node scripts/check-blog-slug-parity.mjs && node scripts/check-blog-utils.mjs && node scripts/check-blog-content.mjs && astro build",
```

*Source: package.json, public repo wakii-dev/wakii-site, retrieved 2026-09-08.*

Log #2 [captured the three-command build line](/blog/building-wakii-in-the-open-log-2/); it is four now, and that difference is the sourced trace of a real integration pass: the new utility gate was wired in after the two stories met, not before. The operational lesson lives exactly there — a clean merge on a story branch proves nothing about integration; the green build must be proven on the merged result before the work is called done.

## Keeping log #2's promise, with a fresh snapshot

Log #2 ended with a promise: the numbers would be captured again and compared — which moved, which held still. At the 2026-09-08 snapshot, here is the result:

| Number | Log #2 (2026-09-07) | Snapshot 2026-09-08 | Status |
| --- | --- | --- | --- |
| Desktop releases | v1.4.199 + v1.4.198, both on 2026-09-05 | re-verified: IDENTICAL | held still |
| Android | mobile-android-v0.0.48 (Pre-release) | IDENTICAL | held still |
| Blog | 10 → 30 posts (the plan) | 25 slugs × 2 locales = 50 files | landed |
| Next plan | — | +44 slugs → 69 × 2 = 138 pages | public in the matrix |

*Source: FI-359 evidence pack, §Numbers snapshot (rows 2+7), captured and re-verified 2026-09-08; topic-matrix-batch2.md committed in the repo, retrieved 2026-09-08.*

The kit's numbers — 20 total / 13 public skills and 24 story-* CLIs — were captured with their source commands [in log #2](/blog/building-wakii-in-the-open-log-2/); the 2026-09-08 re-verification returned them unchanged, so this log does not republish that table. As for 138: it is the public plan sitting in the matrix committed to the repo — a list of topics, not a work-in-progress state. This log series only tells what has closed, and promises to tell what closes next — the series continues.

To build a similar editorial framework for your own project, the [getting started](/docs/getting-started/) page is the entry point: install the kit, open the Superpowers panel, and run the first story of your own.
