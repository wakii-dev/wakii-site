---
title: "Building Wakii in the open — log #1"
description: "The first log of building Wakii: FI-305 ships story view and gates to mobile, release 1.4.199 is out, and the blog you're reading is itself a running story."
pubDate: "2026-09-07"
category: "build-log"
tags: ["build-log", "release", "wakii"]
draft: false
---

This is the first entry in a periodic series logging the building of Wakii — what shipped, what's running, and what's next. Written in public, so we are forced to be precise.

## Shipped: FI-305 — stories on your phone

The biggest feature to close: story view on mobile. Pair your phone with the desktop over a QR code, open the Stories tab and watch every running story — sub-features stacked by tier, progress per SF. The story detail lays out the live bracket: which tiers have closed, which tier is running, which gate is waiting. Decision gates resolve right on the phone, with notifications when a gate opens and when it closes. Agents no longer stand still waiting for you to walk back to the keyboard.

## Release 1.4.199

On September 5th we cut three releases back to back — 1.4.197, 1.4.198, 1.4.199 — small, frequent steps instead of one big version you wait for. 1.4.199 is the current release; the Android build rides along at tag `mobile-android-v0.0.48`. If you're on an older version, the [download page](/download/) has everything.

## The blog you're reading is itself a running story

The most meta part of the week: this blog is being built with the exact process it describes. Story FI-339 is running: SF-1 (the SEO surface — OG cards, RSS, a TOC for long posts, bilingual slug checks) is merged; SF-2 is the ten posts you're reading right now — written in Vietnamese first, translated to English, slugs locked identical across both languages; SF-3 will sweep QA across the whole site before the story closes as a single PR.

## What's next

SF-3 converges, story FI-339 closes as one PR. After that: this log series continues, and the next stories are already in line. Topics for the coming logs are stacked and ready: the story workflow in real combat, the true cost of forking an IDE, and the numbers behind the first release.

To try all of this with your own hands, [getting started](/docs/getting-started/) takes you from clone to the ⚡ Superpowers panel in minutes.
