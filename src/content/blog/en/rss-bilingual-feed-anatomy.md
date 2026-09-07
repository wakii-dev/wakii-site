---
title: "Anatomy: the bilingual RSS feed"
description: "This post dissects the blog's rss.xml.js: one feed for both locales, no <language> tag, and every item carries a guid that is an absolute permalink — with a grep transcript from the built feed so you can verify it yourself."
pubDate: "2026-09-06"
category: "tech"
tags: ["rss", "wakii", "workflow"]
draft: false
---

Anyone following this blog through an RSS reader needs exactly one address:
`/rss.xml`. But the blog is not written in one language — every post ships in
two, Vietnamese and English. So what does the feed actually return: one stream
or two? How does it declare its language? Do the two versions of one post risk
being merged into a single item by a reader? All three answers fit inside one
34-line file: `src/pages/rss.xml.js`. This post dissects that file through
three decisions — one feed gathering both locales, no `<language>` tag, and
every item carrying a `<guid>` that is an absolute permalink. As with the
previous anatomy post, every quote below traces back to a real line of code,
and the end of the post carries a grep transcript from the built feed so you
can verify it yourself.

TL;DR:

- One single feed: `getCollection('blog')` pulls every published post from
  both locales, sorted newest-first by `pubDate`.
- Each item's link is locale-distinguished at generation time: VI posts get
  the `/vi` prefix, EN posts get none — same slug, two URLs.
- The feed has no `<language>` tag: a two-language feed cannot honestly
  declare a single language — the language information lives per item.
- Every item carries a `<guid>` that is an absolute URL, unique per locale;
  the two versions of one slug are two distinguishable items.
- The end of the post carries a real grep transcript from `dist/rss.xml`
  after `pnpm build`.

## One feed, two languages

The whole feed is generated from a single file. The part that builds the item
set is one `getCollection` call — no step filters by locale:

```js
  const site = context.site ?? SITE_URL;
  const posts = (await getCollection('blog', (b) => !b.data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
```

*Source: src/pages/rss.xml.js, retrieved 2026-09-07.*

Reading each part: `getCollection('blog')` pulls the entire blog collection;
the second argument is the filter that keeps non-draft posts — a
`draft: true` post never leaks into the feed; then the sort compares `b`
minus `a`, i.e. descending by `pubDate` — the newest post comes first. Nowhere
does the code ask "which language is this post in": both locales land in one
array, so the result is a single stream interleaving two languages by
publication date.

```ascii
getCollection('blog', !draft), sort DESC by pubDate
────────────────────────────────────────────────────
VI post, Sep 06   ┐
EN post, Sep 06   │   the posts array — ONE array
VI post, Sep 05   │   holding both locales
EN post, Sep 05   ┘
        │
        ▼
  one feed: /rss.xml — items interleaved by date
```

*Source: diagram built from the getCollection + sort logic in
src/pages/rss.xml.js, retrieved 2026-09-07.*

Each item's link, meanwhile, distinguishes the locale right where the link is
born:

```js
      const locale = post.id.startsWith('vi/') ? 'vi' : 'en';
      const prefix = locale === 'vi' ? '/vi' : '';
      const link = `${prefix}/blog/${blogSlug(post.id)}/`;
```

*Source: src/pages/rss.xml.js, retrieved 2026-09-07.*

A post whose id starts with `vi/` gets the `/vi` prefix, producing
`/vi/blog/<slug>/`; an EN post gets no prefix, producing `/blog/<slug>/`.
This is the design point worth noticing in this section: the feed does not
split into two channels by language. It keeps one stream and lets each item's
own link answer the question "which language is this version". Anyone who
wants to read just one language sets that filter on the reader side — the
feed side refuses to decide for them.

## The trade-off: dropping the <language> tag

RSS 2.0 lets a channel declare its language with a `<language>` tag at the
feed level — one single value for the whole channel. This feed deliberately
has no such tag, and the reason sits at the top of the file, written as a
contract comment:

```js
/**
 * RSS feed — all published posts, both locales.
 * Contract (FI-339 SF-1): bilingual feed → NO <language> element; every item
 * carries an explicit <guid> = absolute permalink URL (unique per locale).
 */
```

*Source: src/pages/rss.xml.js (header comment), retrieved 2026-09-07.*

This is a deliberate trade-off, not an omission. A feed that contains both
Vietnamese and English posts cannot honestly declare one single language:
writing `vi-vn` is wrong for the English half, `en-us` is wrong for the
Vietnamese half, and no third value represents both. Rather than emit a line
that is half wrong, the file stays silent at the channel level — the level
where it cannot be right — and moves the declaration down to the item level,
where the information is accurate: whether the link carries a prefix, the
title, the description, the body. Stated strictly at the contract level the
comment commits to, no further: the feed refuses to declare what it cannot
get right for the whole channel, and compensates with an explicit identifier
for each item. That identifier is the next section.

## The guid is an absolute permalink

Each feed item is built inside `items.map`, and the last line of the returned
object is the line that decides this whole section:

```js
      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link,
        customData: `<guid>${new URL(link, site).href}</guid>`
      };
```

*Source: src/pages/rss.xml.js (inside items.map), retrieved 2026-09-07.*

Reading that line: the item's relative link — say `/vi/blog/x/` — is resolved
by `new URL(link, site)` against the site root (`context.site`, falling back
to `SITE_URL`) into an absolute URL, then wrapped in a `<guid>` tag. Because
the link already distinguishes the locale as shown earlier, the two versions
of one slug produce two different guids — exactly what the comment promises
with the phrase "unique per locale":

```ascii
slug x — two locales
────────────────────────────────────────────────────────
EN post, id "en/x"  ──▶  /blog/x/     ──▶  https://wakii.xyz/blog/x/
VI post, id "vi/x"  ──▶  /vi/blog/x/  ──▶  https://wakii.xyz/vi/blog/x/

same slug — two different absolute URLs = two distinguishable guids
```

*Source: diagram built from the link + customData lines in
src/pages/rss.xml.js, retrieved 2026-09-07.*

Why this deserves its own section: in RSS, `<guid>` is an item's identifier —
feed-reading software relies on it to recognize "have I seen this item
before". The two versions of one slug have nearly parallel titles, the same
publication date, and descriptions with the same meaning; without a distinct
identifier they are easy to mistake for one item. With two guids that are two
different absolute URLs, the two versions are independent items from the
identification level up. And because the guid here is a real URL — pointing
at the actual post page — it doubles as a permalink: every item resolves back
to exactly its own page.

## Read the real feed

```bash
$ grep -o '<guid>[^<]*</guid>' dist/rss.xml | head -4
<guid>https://wakii.xyz/blog/building-wakii-in-the-open-log-1/</guid>
<guid>https://wakii.xyz/vi/blog/building-wakii-in-the-open-log-1/</guid>
<guid>https://wakii.xyz/blog/review-ai-agents-from-your-phone/</guid>
<guid>https://wakii.xyz/vi/blog/review-ai-agents-from-your-phone/</guid>
$ grep -o '<guid>[^<]*rss-bilingual-feed-anatomy[^<]*</guid>' dist/rss.xml
<guid>https://wakii.xyz/blog/rss-bilingual-feed-anatomy/</guid>
<guid>https://wakii.xyz/vi/blog/rss-bilingual-feed-anatomy/</guid>
$ grep -o '<item>' dist/rss.xml | wc -l
      20
```

*Source: `grep …` on `dist/rss.xml` after `pnpm build`, retrieved 2026-09-07.*

The first four guids are the feed's two newest posts at build time — each
slug appears exactly twice, the EN version comes before the VI one within the
same date (stable order for a tie), and every guid is an absolute URL on the
production domain, in descending date order overall. The second command
drills into this post's own slug: its two versions also yield two guids — EN
without the prefix, VI carrying `/vi/`. The last line counts 20 items — the
number of published posts times two locales (10 slugs × 2) at build time.
That number will grow as new posts land; what is being verified here is the
relation items = posts × 2 locales, not the specific figure.

To read this 34-line file on your own machine, the
[FAQ](/docs/faq/) page lists what you need to build the site from source
(Node 24, pnpm 12, git) — once built, both `src/pages/rss.xml.js` and
`dist/rss.xml` are yours to inspect. The post
[anatomy: the OG article contract on this blog](/blog/og-article-contract-anatomy/)
is this post's sibling in the same series: the same kind of dissecting real
code, but at the pair of `<meta>` tags in a post page's head rather than at
the distribution channel. Together the two show one contract pattern applied
to two different surfaces of the same blog.

Wakii is an agentic IDE with a built-in superpowers team. If you run a
bilingual Astro blog, two questions are worth asking about your own feed:
does it declare its language honestly, and does every item carry its own
identifier so the language versions never get merged. The `rss.xml.js` above
answers both in 34 lines.
