---
title: "Two releases in one day — cadence falls out of the process"
description: "On September 5, Wakii's public release history recorded two releases and one Android pre-release in a single day. This post reads the real transcript to explain why shipping cadence falls out of the process, and what version-named assets change when you download the app."
pubDate: "2026-09-02"
category: "build-log"
tags: ["release", "build-log", "wakii"]
draft: false
---

Many teams working with AI agents treat a release as an event: weeks of changes bundled up, code frozen, a long test pass, and only then the nerve to cut a version. [Log #1](/blog/building-wakii-in-the-open-log-1/) of this series recorded release 1.4.199 that way too — one line among the week's notes. Behind that line sits a mechanism worth examining: how a process that hands work to an agent team managed to cut two releases and one Android pre-release in a single day without strain. This post takes that mechanism apart using public evidence — no storytelling, and no generalizing beyond what the release history proves.

TL;DR:

- A single `gh release list` call against the public repo `wakii-dev/wakii` returns exactly three lines — and all three are stamped 2026-09-05: v1.4.198, pre-release `mobile-android-v0.0.48`, and v1.4.199 (Latest).
- A fast shipping cadence is not a race goal — it is a consequence: work is split into small sub-features, each passing its own review gate, so once a slice is done it can be cut into a release right away.
- Android runs on its own track: a separate pre-release tag, never blocked by the desktop cadence.
- Version-named assets: download URLs pin an exact version — a version bump means updating the URL, but in exchange old links never die when a new release ships.

## The whole release history in one command

The starting point is a single command, run on a machine with `gh` and a logged-in GitHub CLI:

```bash
$ gh release list --repo wakii-dev/wakii --limit 6
Wakii 1.4.199	Latest	v1.4.199	2026-09-05T19:07:31Z
Wakii 1.4.198		v1.4.198	2026-09-05T12:47:15Z
Orca Mobile Android mobile-android-v0.0.48	Pre-release	mobile-android-v0.0.48	2026-09-05T13:00:31Z
```

*Source: `gh release list --repo wakii-dev/wakii`, retrieved 2026-09-08.*

Three lines, four columns: display name, label (Latest or Pre-release), tag, and a UTC timestamp. Two small details carry the story. First: the command asked for `--limit 6` and got three lines back — meaning at retrieval time, that is the entire public release history of the repo, with nothing hidden on page two. Second: all three timestamps read 2026-09-05. Two desktop releases and one Android pre-release all lived within one calendar day.

No internal context is needed to confirm that — the transcript above is enough on its own. That is also why this post leads with a command: if you doubt it, retype it and you will see the same thing, minus the retrieval date.

## Shipping cadence and its price

Put the three timestamps in order and September 5th looks like this:

```ascii
2026-09-05  (UTC)
12:47:15Z  v1.4.198                 desktop release
13:00:31Z  mobile-android-v0.0.48   Android pre-release  (+13 minutes)
19:07:31Z  v1.4.199                 Latest               (+6 hours 20 minutes)
```

*Source: computed from the three timestamps in the `gh release list` transcript above.*

One thing deserves to be said plainly first: one busy day on the calendar does not prove the project ships "weekly" or on any general frequency. It proves a feasibility condition — when that condition holds, cutting a release quickly is routine, not a special effort.

The condition comes from the structure of the work, not from willpower. Wakii's process splits a large feature into small sub-features, each in its own worktree, each passing an independent review gate before it closes — the mechanism is covered in [brackets and tiers](/blog/long-tasks-bracket-tiers/). Once every slice has proven itself, packaging one slice into a release does not have to wait for a whole batch to finish. Two releases in one day is the projection of several small slices being ready at once — not of a race against a target.

But a fast cadence has a price, and the price is not paid at the moment you cut. Frequent releases mean the release infrastructure has to be boring: consistent tags, assets named by convention, download links that never break when a new version lands. Every link in that chain has to hold even when a release gets cut at midnight. That cost is paid up front in conventions — and those conventions are written into the code, as the last two sections show.

## Android runs on its own track

The third line of the transcript deserves a closer look. It carries the Pre-release label, tag `mobile-android-v0.0.48`, and timestamp 13:00:31Z — wedged between the two desktop releases: 13 minutes after v1.4.198, roughly 6 hours before v1.4.199. Mobile is not gated by the desktop cadence; it ships when its build is ready, on a tag with its own namespace.

That track describes itself in the site's config:

```ascii
android: github.com/wakii-dev/wakii/releases/download/mobile-android-v0.0.48/app-release.apk
```

*Source: `src/config.ts` — `MOBILE_STORE_URLS.android` (repo `wakii-site`), retrieved 2026-09-08.*

The comment next to that line in the code states it flat: "Android ships as a GitHub-release APK (sideload, no store)". The pre-release channel is not a secondary edition of the desktop build — it is a different product, released on a different rhythm, and the Pre-release label on GitHub is the public boundary marking that.

## What version-named assets mean

"Version-named" is a naming convention: every release asset carries the version number right in its filename. The consequence lands in the download URLs — they carry the version number too. In `src/config.ts`, this convention is written down as a comment so nobody has to guess later:

```ascii
 * URL pattern: v1.4.198 switched to VERSION-NAMED assets, so URLs pin an
 * exact release — a version bump means updating these lines.
```

*Source: `src/config.ts` (repo `wakii-site`), retrieved 2026-09-08.*

The two download URLs the site currently pins, both pointing exactly at v1.4.199:

```ascii
macos:   github.com/wakii-dev/wakii/releases/download/v1.4.199/Wakii-1.4.199-arm64.dmg
windows: github.com/wakii-dev/wakii/releases/download/v1.4.199/orca-windows-setup.exe
```

*Source: `src/config.ts` — `DOWNLOAD_URLS` (repo `wakii-site`), retrieved 2026-09-08.*

Here is the price the previous section hinted at: a version bump means editing these URL lines — explicit work, living in the code, visible to anyone who reads it, with no silent link retargeting. The counterweight is worth more than it sounds: the link you downloaded today stays put and keeps pointing at today's asset, even after many newer releases ship. A version-named URL is an immutable link; a "latest" pattern works the other way around — always pointing at the new build, but never able to hand you an old one.

Every convention is a choice. This one picks the reproducibility of an already-downloaded link over the convenience of a single permanent one — a good fit for a project that cuts releases quickly, where an older build may still be running on somebody's machine.

## Picking the right build for you

The [getting started](/docs/getting-started/) docs open with exactly this: "Grab the ready-made build from the download page, or follow releases on GitHub to hear about new builds (Windows included) first". And if you want to inspect the shipping cadence the way this post did, the transcript at the top is one command — retype it for the freshest result.

At the time of writing, the latest release is v1.4.199. The download page pins links for macOS and Windows — click and you get exactly that build, no guessing.
