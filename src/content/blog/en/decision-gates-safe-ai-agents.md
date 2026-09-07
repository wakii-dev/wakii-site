---
title: "Decision gates: why Wakii's AI agents always stop to ask"
description: "Inside decision gates: pending guards reject bad resolves with explicit error codes, notifications announce gate-open and gate-closed, and why supervised still beats autonomous."
pubDate: "2026-09-03"
category: "tech"
tags: ["gates", "guardrails", "supervised"]
draft: false
---

The question we hear most: "Why not just let the agent run the whole thing?" Wakii's answer: the agent runs the entire doing — but consequential decisions stop at a gate. This post dissects the machinery behind that stop.

## What a gate is

A decision gate is a structured pause between agent and human, not a random interrupt. A gate carries: compact context (where the agent is, why a decision is needed), a concrete question, and pre-built options — or a free-text field when none of the options fit. While a gate is pending, the story stands exactly there; the agent doesn't guess and doesn't press on.

## Pending guards: nobody resolves twice

Every resolve command passes a guard layer before it touches story state:

- `gate_not_pending` — the gate isn't waiting (already resolved, or closed): the command is rejected instead of applied twice.
- `gate_not_found` — the gate id doesn't exist: an immediate error, never a silent no-op.
- `invalid_resolution` — the answer is malformed or not among the valid options: the agent is asked to resend in the right shape.

The shared principle: errors must be loud. A resolve that fails silently is worse than one that fails visibly — the agent would believe it holds a decision it doesn't.

## Notifications: gate-open and gate-closed

Gate opens, you get a notification. Gate closes, you get one too. No polling, no refreshing: story progress updates at the exact moment the system changes state. Combined with the mobile app, the loop becomes: notification → read context → resolve → confirmation notification. Thirty seconds, without leaving your phone.

## Supervised still beats autonomous

Autonomous agents look impressive in demos and get expensive in production: one wrong decision at step 3 gets multiplied at step 30. Supervised flips the math: agents are good at the doing, humans keep the accountability — and thirty seconds of review at a gate is cheaper than thirty minutes of debugging after a merge.

In practice, running the story workflow, gates are not dense: they appear only at real forks in the road. Most of the time the agent runs free — which is exactly what supervised is supposed to mean.

Where gates live in the UI is covered in the [Superpowers panel docs](/docs/superpowers-panel/); the full workflow philosophy is in the [story workflow docs](/docs/story-workflow/).
