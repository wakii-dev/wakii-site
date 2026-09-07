---
title: "Building Wakii in the open — log #2"
description: "The second log of building Wakii in the open: the blog grows from 10 to 30 posts through two stories sharing one parity gate, plus the numbers as of the writing date — releases, skills, story CLIs — every number sourced so you can rerun it."
pubDate: "2026-09-07"
category: "build-log"
tags: ["build-log", "wakii", "release"]
draft: false
---

Log #1 ended with a promise: this series continues. The second log keeps it in the series' own spirit — tell what is running, and attach every number to a command you can rerun yourself. This entry covers no new feature. It covers the numbers of the very story writing this blog, a production project running the same process in another repo, and a metrics table captured on the writing date.

TL;DR:

- The blog is growing from 10 to 30 posts: 5 seed slugs × 2 locales, plus 20 new slugs × 2 locales from the story now running.
- Two blog stories (FI-339 and FI-359) flow through the same build chain: parity gate → content lint → astro build; half a locale pair fails the build.
- The process does more than build a marketing site: hub-store, a production platform, went through it with 7 brackets / 74 SFs, artifacts public on GitHub.
- A metrics table as of the writing date: releases, skills, story CLIs — each row with its source command and run date.

## Blog 10 → 30

When log #1 was published, this blog had 10 posts: 5 slugs × 2 locales — the seed set consisting of [the first log](/blog/building-wakii-in-the-open-log-1/) itself, the review of agents on your phone, the story workflow from idea to release, the decision gates post, and the IDE fork that keeps up with upstream. That set was the product of story FI-341. The story running as you read this — FI-359 — adds 20 new slugs × 2 locales: 40 files, bringing the blog to 30 posts when the story closes. At the time of writing, the posts have not landed in one shot: they land sub-feature by sub-feature, one VI+EN pair per commit, the slug count on the branch inching step by step from 5 at the start toward 25 at the finish.

```ascii
seed (FI-341)     5 slugs  × 2 locales = 10 posts
story FI-359     20 slugs  × 2 locales = 40 files
when story ends  25 slugs, counted in posts = 30 posts (10 + 20)
```

*Source: FI-359 evidence pack, §Numbers snapshot (rows 5 + 7), retrieved 2026-09-07.*

The number 30 is not decorative. It is a condition of the matrix: 20 topics had their slugs, publishing dates, and categories locked before the first line was written, and the parity gate you meet in the next section does not let half a pair exist on the branch.

## Two blog stories, one parity gate

This blog has been through two stories: FI-339 built the 10 seed posts plus the SEO surface (OG cards, RSS, a TOC for long posts), and FI-359 — the current one — writes the 20 longform posts. The two stories differ in scope but flow through exactly one build chain. The `build` line in the repo's `package.json`:

```json
"build": "node scripts/check-blog-slug-parity.mjs && node scripts/check-blog-content.mjs && astro build",
```

*Source: package.json, public repo wakii-dev/wakii-site, retrieved 2026-09-07.*

Read the chain in execution order: the parity gate checks that the EN slug set matches the VI slug set 1:1 per post; the content lint checks word bands, frontmatter, and forbidden phrases; only when both are green does `astro build` run. In practice, a commit missing half a locale pair — or one post with broken frontmatter — turns the build red. There is no "publish first, fix later" mechanism. All 10 seed posts and every new pair from the current story pass through this same door. The post [case study: this blog is itself a story](/blog/blog-story-case-study/) dissects this machinery in detail — read it to see where each gate layer sits in the code.

## A real project, public artifacts

A fair question for any developer tool: does it run outside the demo? For Wakii, the answer is readable from another repo. hub-store — a warehouse-operations platform running in production — was built with the same story workflow, and the entire process trace is public on GitHub. The project went through 7 brackets, summing to 74 sub-features:

| Bracket | SF |
| --- | --- |
| ict-service-support-rebuild | 7 |
| fi233-polyglot-grpc-mf | 11 |
| fi245-postgres-production | 28 |
| fi272-minikube-deploy | 5 |
| fi280-qa-hub-store-regression | 8 |
| fi326-api-docs-swagger | 9 |
| fi338-dispatch-queue (running) | 6 |

*Source: the public brackets on GitHub main `wakii-dev/hub-store`; the fi338 row comes from the FI-359 evidence pack, retrieved 2026-09-07.*

7 + 11 + 28 + 5 + 8 + 9 + 6 = 74 — arithmetic you can redo yourself. What matters in this log is not the number 74 but where the numbers live: brackets, specs, and plans sit next to the code, in a public repo. The process writing these lines is the same process that built a real warehouse system. The post [Wakii in production: hub-store](/blog/wakii-in-production-hub-store/) walks the full 7-bracket journey, each GitHub link carrying a verbatim quote you can diff yourself.

## The numbers as of the writing date

The rule of this post: a number must travel with its source and date — do not trust recall. Below is the re-extraction run at writing time:

```bash
$ gh release list --repo wakii-dev/wakii --limit 6
Wakii 1.4.199	Latest	v1.4.199	2026-09-05T19:07:31Z
Wakii 1.4.198		v1.4.198	2026-09-05T12:47:15Z
Orca Mobile Android mobile-android-v0.0.48	Pre-release	mobile-android-v0.0.48	2026-09-05T13:00:31Z
```

*Source: gh release list, run 2026-09-07.*

The two desktop releases 1.4.198 and 1.4.199 shipped on the same day, 2026-09-05, along with the Android build at tag `mobile-android-v0.0.48` (Pre-release) on that same day. This is the one verified case, checked with the command above; the log does not extrapolate a release cadence from a single day.

Turning to the kit's numbers, two grep commands count directly on the source file:

```bash
$ grep -c "id: '" src/data/skills.ts
20
$ grep -A6 "id: '" src/data/skills.ts | grep -c "public: true"
13
$ ls ~/.claude/bin | grep '^story-' | wc -l
25
$ ls ~/.claude/bin | grep '^story-' | grep -v '\.html' | wc -l
24
```

*Source: grep on `src/data/skills.ts` from this repo and `ls ~/.claude/bin` on the writing machine, run 2026-09-07.*

Explaining the last pair: `grep '^story-'` returns 25 matches, but one of them is `story-dashboard.html` — a documentation page, not a CLI. The command with the `.html` filter is the honest one: 24 executables. Collected into a table:

| Metric | Value as of 2026-09-07 | Source |
| --- | --- | --- |
| Latest release | v1.4.199 — Latest | `gh release list` |
| Previous release | v1.4.198 — same day 2026-09-05 | `gh release list` |
| Android | mobile-android-v0.0.48 — Pre-release | `gh release list` |
| Skills | 20 total / 13 public | `grep src/data/skills.ts` |
| story-* CLIs | 24 (25 matches − 1 .html file) | `ls ~/.claude/bin` |
| Blog | 10 → 30 posts when the story closes | FI-359 evidence pack, rows 5+7 |

*Source: the commands named in the table, run 2026-09-07; the blog row from the FI-359 evidence pack.*

## The next log

What remains of the story: QA sweeping the whole site, convergence, and the story closing as a single PR — the same shape as the first blog story. The log series continues after that; the numbers in this log will be captured again and compared — which moved, which held still.

```ascii
20 post pairs     →  site-wide QA     →  one PR
(landing now)        (convergence)        (story FI-359 closes)
```

*Source: the FI-359 story spec (`docs/superpowers/specs/2026-09-07-blog-longform-20-posts-spec.md`), retrieved 2026-09-07.*

To run the same process on your own project, the [getting started](/docs/getting-started/) page is the starting point: install the kit, open the Superpowers panel, run your first story.
