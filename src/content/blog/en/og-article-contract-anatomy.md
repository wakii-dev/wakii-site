---
title: "Anatomy: the OG article contract on this blog"
description: "This post dissects the blog's Open Graph contract straight from the repo's source: absolute og:image, og:type article, article:published_time — with a grep transcript from a real build so you can verify it yourself."
pubDate: "2026-09-05"
category: "tech"
tags: ["og", "seo", "wakii"]
draft: false
---

Paste a link to a blog post into Facebook, X, or Zalo and you get (or don't
get) a preview with an image — decided by the `<meta>` Open Graph tags in that
page's HTML. This blog does not leave that to per-page improvisation: it has
an OG contract pinned right in the code, with three clauses — og:image is
always an absolute URL, a post page declares og:type article, and it carries
article:published_time as an ISO timestamp. This post dissects each clause
from the actual source files in the repo, then hands you one grep command to
verify the result on built HTML. Every quote below traces back to a real line
of code — nobody has to be trusted.

TL;DR:

- og:image must be absolute because social crawlers silently drop relative
  values — the comment in `Base.astro` states the reason, and the line
  `new URL(ogImage, Astro.site)` is where it is solved.
- The post page passes `ogType="article"` + `publishedTime` as props; the
  layout renders them into `og:type` and `article:published_time`, and the
  time tag only appears when the prop exists.
- Every non-post page still gets an absolute og:image for free, thanks to the
  `/og-default.png` default in the shared layout.
- The end of the post carries a real grep transcript from the `dist/` folder
  after `pnpm build` — you can re-run it on your machine.

## Why og:image must be an absolute URL

The story starts with an error that raises no error. When a social crawler
reads HTML and meets an `og:image` carrying a relative value like
`/og-default.png`, it has no site root to join it with — and per the comment
in the layout, the value is dropped silently: the page still shares, but with
no image, and no error message anywhere. Here is the full contract comment in
`Base.astro`:

```ts
  /**
   * og:image path — ALWAYS resolved against Astro.site into an absolute URL.
   * Contract PINNED (spec FI-339 rev 2): relative og:image values are dropped
   * silently by social crawlers (Facebook/X/Zalo). Default: /og-default.png.
   */
  ogImage?: string;
```

*Source: src/layouts/Base.astro (Props), retrieved 2026-09-07.*

And the line that enforces the clause — where the relative path is joined with
the site root into an absolute URL:

```astro
<meta property="og:image" content={new URL(ogImage, Astro.site)} />
```

*Source: src/layouts/Base.astro (head), retrieved 2026-09-07.*

`new URL(ogImage, Astro.site)` reads as follows: take the `ogImage` value
(default `/og-default.png`) and resolve it against `Astro.site` — the site root
configured once in `astro.config.mjs` from the constant
`SITE_URL = 'https://wakii.xyz'` in `src/config.ts`. Redrawn as the journey of
one prop:

```ascii
page passes prop                Base.astro renders <meta>
────────────────                ─────────────────────────────────────────────
ogImage="/og-default.png" ──▶   new URL(ogImage, Astro.site)
                                           │
                Astro.site = https://wakii.xyz
                                           ▼
                             <meta property="og:image"
                                  content="https://wakii.xyz/og-default.png">
```

*Source: src/layouts/Base.astro + src/config.ts, retrieved 2026-09-07.*

The most telling word in that comment is "silently": it is exactly the hardest
kind of bug to catch — no crash, no log, just a preview missing its image on a
platform that the developer has to open on another machine to see. The fix is
proportionate: force the resolution in exactly one line, in exactly one layout,
and route every page through that door.

## What og:type article and published_time mean

The second and third clauses live on the post page.
`src/pages/blog/[slug].astro` declares the contract right above the props it
passes:

```astro
{/* og contract: posts are articles — pinned in spec FI-339 rev 2 (og:type + published_time + absolute og:image) */}
<Base
  title={entry.data.title}
  description={entry.data.description}
  ogType="article"
  publishedTime={entry.data.pubDate.toISOString()}
  ogImage="/og-default.png"
>
```

*Source: src/pages/blog/[slug].astro, retrieved 2026-09-07.*

The layout takes those two props and renders them into the `<head>`:

```astro
<meta property="og:type" content={ogType} />
{publishedTime && <meta property="article:published_time" content={publishedTime} />}
```

*Source: src/layouts/Base.astro (head), retrieved 2026-09-07.*

Read at the contract level — the exact level the comment speaks at, no further
— each post page declares two things about itself: "I am an article", and "I
was published at this ISO instant". The timestamp is generated from the post's
`pubDate` via `toISOString()`, so it always carries full ISO-8601 form with a
Z timezone. The second render line has one more detail worth noticing: it is a
conditional render — `{publishedTime && …}` — a page that does not pass the
prop simply has no `article:published_time` tag in its HTML, rather than an
empty one. How each crawler platform then reads those two tags, and what it
prioritizes — that is each platform's business; the code and its comment commit
only to the declaration, and this post stops exactly there.

## One line, the whole system correct

The og:image clause does not need each page's cooperation, because the shared
layout assigns a default right where props are destructured:

```ts
const {
  title,
  description = SITE_TAGLINE,
  noindex = false,
  ogImage = '/og-default.png',
  ogType = 'website',
  publishedTime,
} = Astro.props;
```

*Source: src/layouts/Base.astro, retrieved 2026-09-07.*

`Base.astro` is the layout for the whole site — landing, docs, download,
skills, the blog listing, and each post all pass through it. The consequence of
those two defaults:

| Page type | og:type | article:published_time | og:image |
|---|---|---|---|
| Blog post | `article` (passed explicitly) | yes — ISO from pubDate | `/og-default.png` → absolute |
| Every other page | `website` (default) | not rendered | `/og-default.png` (default) → absolute |

*Source: table compiled from src/layouts/Base.astro +
src/pages/blog/[slug].astro, retrieved 2026-09-07.*

Meaning: a new docs page born tomorrow, touching nothing OG-related, already
has an absolute og:image. And the contract comment sits right on the Props
block of the layout — exactly where a developer would land when editing the
head or adding a new prop, a few lines away from the render site. Missing the
contract while editing takes deliberate effort.

## Check it on a real page

A contract should be checkable. After `pnpm build`, the static HTML sits in
`dist/`, and a few greps are enough to match the words against the code:

```bash
$ grep -o '<meta property="og:type" content="[^"]*"' dist/blog/blog-story-case-study/index.html
<meta property="og:type" content="article"
$ grep -o '<meta property="og:image" content="[^"]*"' dist/blog/blog-story-case-study/index.html
<meta property="og:image" content="https://wakii.xyz/og-default.png"
$ grep -o '<meta property="article:published_time" content="[^"]*"' dist/blog/blog-story-case-study/index.html
<meta property="article:published_time" content="2026-09-03T00:00:00.000Z"
$ grep -o '<meta property="og:type" content="[^"]*"' dist/index.html
<meta property="og:type" content="website"
```

*Source: grep on `dist/` after `pnpm build`, retrieved 2026-09-07.*

The four output lines match the contract exactly: the post page declares
`article` with an ISO timestamp and an absolute og:image on the production
domain; the homepage stays `website`. If you also grep for
`article:published_time` on `dist/index.html`, the command returns nothing —
exactly the conditional-render clause from the previous section.

To read all of this markup on your own machine, the
[FAQ](/docs/faq/) page lists what you need to build the site from source
(Node 24, pnpm 12, git) — once built, your `dist/` folder is the evidence. The
post [case study: this blog is itself a story](/blog/blog-story-case-study/)
told the story of this OG contract being pinned into the code as one detail of
the story workflow; this post dissected the contents of that contract itself.

Wakii is an agentic IDE with a built-in superpowers team. If you are building
an Astro site and your og:image is still a relative path — open the layout and
resolve it against the site root, before some crawler silently drops it.
