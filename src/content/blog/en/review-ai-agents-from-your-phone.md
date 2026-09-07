---
title: "Reviewing AI agents from your phone: Stories and decision gates in your pocket"
description: "Pair your phone with your desktop over a QR code, read story progress in the Stories tab, and resolve decision gates right from your phone — agents never wait for you to come back to the keyboard."
pubDate: "2026-09-06"
category: "tutorial"
tags: ["mobile", "stories", "gates"]
draft: false
---

Agents do their best work when they can run long — but consequential decisions still need a human. The friction is in the handoff: you can't babysit a screen all day, yet every time an agent stops to wait, the whole story stalls. The Wakii mobile build closes exactly that gap — story view and decision gates, on your phone.

## Step 0 — Pair your phone with your desktop

First, pair the phone with your host: open Wakii on desktop, go to the pairing screen and scan the QR code with the mobile app — the host's full state (stories, agents, gates) shows up right after the scan. Pair once per host; the next time you open the app you go straight to the work.

No Wakii on your machine yet? The official setup guide lives in [getting started](/docs/getting-started/) — from clone to the ⚡ Superpowers panel in minutes.

## Open the Stories tab and read progress

On your phone: pick your host, open the **Stories** tab. Every running story shows up as a compact row. Tap one for the detail view: sub-features (SFs) stacked by tier, each SF's progress, which agent holds which worktree. Five seconds is enough to tell whether a story is healthy or stuck — no SSH, no remote terminal.

## Pending gates: where the agent stops for you

The Wakii workflow has structured decision gates: when the work reaches a point that needs a human — picking an approach, approving results before merge, changing course mid-story — the agent raises a gate and stops right there. Pending gates surface prominently in the story detail, with enough context that you never decide blind.

Everywhere else, the agent keeps running. That's the supervised model: the agent owns the doing, the human keeps the deciding.

## Resolve the gate on the spot

Every gate carries a concrete question. Choice gates list the options — tap to pick one. Free-text gates take a typed answer. Hit resolve, confirm — the answer flies back to the agent and the story resumes. Resolving twice, or resolving a closed gate, gets rejected by a guard with an explicit error code; nothing is silently swallowed. A gate-closed notification confirms the wait is over.

## What changes when review lives in your pocket

Before: the agent stopped at a gate and the story hung until you walked back to your desk. Now: the notification lands, you read the context in thirty seconds and resolve from your phone — including while standing in line for coffee. The story keeps its pace, and pace decides whether a story finishes in a day or in a week.

The full gate mechanics are covered in the [Superpowers panel docs](/docs/superpowers-panel/). Wakii is an agentic IDE with a built-in superpowers team — download it, let the agents run, and just decide.
