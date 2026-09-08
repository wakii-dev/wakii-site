---
title: "Why fork under MIT: open source on purpose"
description: "Wakii forks Orca publicly under MIT: this post reads the LICENSE file, the site footer credit, and the README to show a public fork is a commitment — users can build from source, and every credit line has an address."
pubDate: "2026-09-27"
category: "tech"
tags: ["oss", "license", "fork"]
draft: false
---

Forking an open-source project is a three-minute operation: click the button, swap the remote, push. The part people discuss far less is the license and the publicity — why choose MIT, why keep the upstream credit lines intact, and why let the whole world read the fork's history. For Wakii this is not legal boilerplate: it is the entire promise of the project. This post does not narrate the act of forking — an earlier post already did that — but reads the files that prove it: the LICENSE, the README, the site footer, and shows that open source here is a deliberate choice you can verify with a few commands.

TL;DR:

- MIT permits everything — forking, modifying, selling, even closing the source — so the value is not in the license but in how you use it: Wakii keeps MIT and keeps upstream attribution intact.
- The MIT chain is readable from the site footer: superpowers (MIT) → orca (MIT) → wakii (MIT), each link pointing to its real repo.
- The product repo `wakii-dev/wakii` has a real LICENSE file; the site repo `wakii-dev/wakii-site` has no standalone LICENSE file yet — this post states that plainly instead of assuming.
- A public fork is a commitment: users can build from source, and every number in this post ships with a command you can rerun.

## The license permits; attribution identifies

The starting point is one file. Wakii's product repo opens with the standard lines of MIT:

```text
MIT License

Copyright (c) 2026 Lovecast Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

*Source: `LICENSE`, repo `wakii-dev/wakii` (local mirror at `/Users/hoivu/Desktop/projects/orca`, branch `wakii-dev`), retrieved 2026-09-08.*

MIT is short, and its brevity is its entire strength: it forbids no one anything. You may fork it, modify it, even close your source. Which means the license itself cannot be what makes a fork's identity — anyone could do the same. The identity lives in what you choose to keep inside it. Wakii keeps Lovecast Inc.'s copyright line in the LICENSE file instead of shaving it off, and the README states the relationship up front:

```text
Wakii is a fork of Orca (MIT) — the AI orchestrator that runs Codex,
Claude Code, OpenCode, Pi and any other CLI agent side-by-side, each
in its own isolated git worktree.
```

*Source: `README.md`, repo `wakii-dev/wakii`, retrieved 2026-09-08.*

The opening sentence of the README positions Wakii as a fork before it mentions a single custom feature. That ordering is deliberate: the first reader should know where the project came from, not have to guess.

## The MIT chain: three links, all resolvable

Attribution does not stop at one README sentence. It sits where everyone looks at the end of every page — the site footer — written out as a complete chain of links:

```text
wakii. — open-source agentic IDE, forked from
orca (MIT). Superpowers kit: superpowers by
Jesse Vincent (MIT). exit code 0. © Wakii.
```

*Source: `src/components/Footer.astro`, repo `wakii-dev/wakii-site`, retrieved 2026-09-08.*

Read that chain backwards in time and you get a family tree:

```ascii
obra/superpowers (MIT, Jesse Vincent)
        └─ the bundled "superpowers" kit
stablyai/orca (MIT, Lovecast Inc.)
        └─ platform: AI orchestrator + worktrees
wakii-dev/wakii (MIT)
        └─ Wakii: fork + rebranded workflow kit
```

*Source: `LICENSE` + `README.md` of `wakii-dev/wakii` (License section: "MIT — same as upstream Orca. The bundled story-team kit originates from superpowers (MIT) by Jesse Vincent."), retrieved 2026-09-08.*

Every link in this tree is a real repo, resolvable, with a readable license. MIT at the upper link is what lets the lower one exist; and the lower one pays for it with transparency: no erasing the line of history. This is why this post calls an MIT fork "on purpose": the license permits everything, and the intent lives in choosing to keep exactly what should be kept — the credit lines, the original LICENSE file, and the visible path from kit to platform to fork.

## Two repos, two boundaries

A project like Wakii does not live in one repo. It lives in two, and the boundary between them is worth drawing:

```ascii
wakii-dev/wakii           wakii-dev/wakii-site
(product: desktop app)    (site: wakii.xyz)
LICENSE: present (MIT)    LICENSE: no standalone file yet,
REPO_URL points here      MIT credit lives in Footer.astro
releases + assets         blog, docs, download page
```

*Source: `src/config.ts` (`REPO_URL = 'https://github.com/wakii-dev/wakii'`) and `ls LICENSE*` on the site repo (no matches at retrieval time), retrieved 2026-09-08.*

The product repo has a LICENSE file — evidenced in the previous section. The site repo, at the time of writing, has no standalone LICENSE file; the only place speaking to its licensing is the credit line in `Footer.astro`. This post records that state accurately rather than assuming every repo has complete paperwork — the same way every other number in this blog is read from a file, not recalled from intention. It is also an open item, recorded publicly right here: the site repo owes itself a LICENSE file.

Splitting the two repos also serves a practical goal: people downloading the app and people reading the blog never need to know about each other. The site config pins download URLs to the product repo — `REPO_URL` appears in every download URL — so the site is a storefront and the repo stays the warehouse.

## Public means a contract with users

MIT gives users the right to build it themselves, and a public fork must keep that promise workable. The product README records how the distributed build ships:

```text
macOS builds ship on GitHub Releases — unsigned, so
right-click → Open on first launch (or allow it in
System Settings → Privacy & Security)
```

*Source: `README.md`, repo `wakii-dev/wakii`, retrieved 2026-09-08.*

"Unsigned" is an unusually honest detail: the build is not codesigned, users decide for themselves whether to open it, and there is no dark step between source and binary. If you doubt anything in this chain — where that LICENSE file sits, what the credit line says — everything is a file in a public repo, and the verification command is a single `cat`.

The transparency extends to the process itself: the blog you are reading is the product of a story workflow run in public, every post carrying a source and retrieval date for each claim. The post on [forking an IDE while keeping up with upstream](/blog/forking-an-ide-keeping-current-with-upstream/) tells the act of forking and how the fork keeps pace; this one completes the other half — the legal reasoning and strategy behind it. At this point the three MIT links, the two repos, and the "build it yourself" promise are fully connected.

To read the sources yourself, open the [FAQ](/docs/faq/) — the page collecting common questions about Wakii and its relationship to Orca — or go straight to the product repo: the LICENSE file sits at the repo root, exactly where an MIT project should keep it.

Download Wakii from the [download page](/download/), or clone the repo and build it yourself — MIT means both paths are legitimate, and this project tries to keep both walkable.
