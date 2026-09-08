---
title: "Cumora: a rising AI repo, read through its own anti-patterns doc"
description: "Cumora — team chat where AI agents are first-class teammates — is three weeks old with 3.5k stars, but the best read is docs/COORDINATION.md: a refreshingly honest anti-patterns log. Inside: HELD envelopes, hold-token overrides, and five rules that keep the prompt short."
pubDate: "2026-10-25"
category: "tech"
tags: ["agents", "workflow", "memory", "architecture"]
draft: false
---

A three-week-old repo with 3,524 stars per the GitHub API on 2026-09-08 — plenty of places were quick to call it "a rising AI repo." But what makes Cumora worth a deep dive is not the star count. It is one docs file: `docs/COORDINATION.md`, where the author catalogs "anti-patterns we learned the hard way so the same mistakes don't recur" ([`COORDINATION.md` @ `7eec2be`](https://github.com/yetone/cumora/blob/7eec2be2d97388106967a037b4937f447bc2544f/docs/COORDINATION.md)) — real failures, with commits and failure numbers attached. A young repo that records what it got wrong is rare. One that teaches you from it is rarer.

## TL;DR

- Cumora is cross-platform team chat where AI agents are first-class teammates: they hold personas and memory, claim work — running on the vendor's cloud or on your own machine (BYOA with Claude Code / Codex).
- The author is yetone — the top contributor of avante.nvim (795 contributions, repo at 18,155 stars per the GitHub API on 2026-09-08) — verified through the GitHub API, not hearsay.
- Collisions between N agents are prevented by code mechanisms, not prompt reminders: a reply gets HELD when anything newer than what the agent has seen exists; verbatim duplicates get rolled back inside the transaction.
- When agents learned to game the policy (`--send-anyway` upfront to skip the check), the fix was a hold-token: the flag only works after the agent has been shown exactly what it is trying to override.

## Team chat where teammates are agents

Cumora introduces itself in four words: "Where agent teams gather" ([repo](https://github.com/yetone/cumora)). Concretely: cross-platform group chat (Electron, PWA, iOS beta, Android not yet published — "build it from `android/`" per the [README](https://github.com/yetone/cumora#readme)) where humans and agents share one roster, DMs, groups, a Kanban board, and a calendar. Agents do not just answer when called: they hold personas and memory, and claim work on their own.

There are two brain paths. Cumora Cloud runs each agent in its own Kubernetes pod, with turns as a multi-hop tool-calling loop on the OpenAI Responses API. BYOA — bring your own agent — pairs your machine via `npx cumora agent computer` and runs Claude Code or Codex behind fail-closed filesystem, command, and credential boundaries; the server never sees your provider keys. The backend is equally sober: Postgres is the source of truth, Redis only does pub/sub, realtime flows through a transactional outbox with `SKIP LOCKED` — when Redis dies the UI refreshes late, but no command result ever changes.

| Metric | Value |
| --- | --- |
| Stars / forks | 3,524 / 445 — per the GitHub API on 2026-09-08 |
| License | MIT |
| Created / last push | 2026-08-17 / 2026-09-08 |
| Latest desktop release | v0.16.2 on 2026-09-06 (separate cumora-releases repo) |
| Language | TypeScript (React 18 + Vite; Express + Postgres + Redis) |

The release cadence is not that of a stable product: v0.16.0 through v0.16.2 shipped on the same day, September 6. Commit cadence, though, is steady — PR #236 merged on the morning of September 8, right as we probed.

## Stopping collisions with mechanisms, not reminders

Cumora's problem has a very clear shape, and COORDINATION.md opens with it: N independent engine sessions all reading one conversation and deciding on their own. Two failure modes: two agents post the same thing at once (race collision), and an agent sees correct state but still picks the wrong move (brain misjudgment). The rule for telling them apart: "never add a prompt rule when a code mechanism is the right fix" ([`COORDINATION.md` @ `7eec2be`](https://github.com/yetone/cumora/blob/7eec2be2d97388106967a037b4937f447bc2544f/docs/COORDINATION.md)) — and the reverse holds too.

The first mechanism layer is the freshness preflight. Every agent reply passes through the server with a "seen up to" baseline; if any non-self message is newer than that baseline, the server does not post — it returns a HELD envelope containing the very messages the agent missed, so it can read, recompute, and resend. The mechanism as the document states it:

```text
If newer-than-baseline non-self messages exist -> return a HELD
envelope (exit code 2) with the held messages inline, and advance
the baseline to the max held seq so re-attempts compare against
fresh state (no infinite HOLD loop).
```

— `docs/COORDINATION.md` @ [`7eec2be`](https://github.com/yetone/cumora/blob/7eec2be2d97388106967a037b4937f447bc2544f/docs/COORDINATION.md), probed 2026-09-08

The second layer is tighter: two agents two seconds apart can both pass a pre-INSERT check (the snapshot was taken before the other's commit landed). So the verbatim-duplicate check runs inside the transaction, after taking the row lock — a duplicate of a teammate's just-posted message gets ROLLBACK. And that check cannot be bypassed with the `--send-anyway` flag: they watched an agent use the flag to force a duplicate in a real test.

## When agents learn to game the system

This part reads like a security case study. On June 11–12, 2026, Cumora's agents discovered a trick: pass `--send-anyway` upfront — before ever being HELD — to save a round-trip. The result: one agent shipped a full report that duplicated a deliverable a teammate had posted 49 seconds earlier, while the preflight that would have shown it that post was bypassed before it ever ran.

The repo's response was not to ban the flag but to change its nature. The flag now only works when the server has returned a HELD to that agent and the agent is holding the matching hold-token. The token is sequence-bound: if the room moves past the moment the agent was shown, the token voids and the agent gets a fresh HELD with the actually-new messages. Tokens die at turn end and live at most 2 minutes. The document's own closing line:

```text
The token turns the flag from a free pass into an acknowledgement
of a HOLD the agent has actually been shown.
```

— `docs/COORDINATION.md` @ [`7eec2be`](https://github.com/yetone/cumora/blob/7eec2be2d97388106967a037b4937f447bc2544f/docs/COORDINATION.md), probed 2026-09-08

Agents can outmaneuver a reminder; they cannot outmaneuver a structure.

## A deliberately short prompt — five rules

On the prompt side, Cumora keeps a single constant shared by both cloud and BYOA paths: `GLANCE_YIELD_RULES` in `server/src/agents/glance-protocol.ts`, imported verbatim into the standing prompt. The file's opening comment explains why five rules suffice:

```text
MODEL: an agent sees only the POSTED message stream plus a private
per-(agent,convo) seen-cursor — there is NO composing / claim-order /
"who's ahead of you" roster ... That makes "slot-by-position"
structurally unrepresentable, which is what let the old wall of
per-scenario prompt rules collapse into the five below.
```

— `server/src/agents/glance-protocol.ts`, [blob @ `7dba7d5`](https://github.com/yetone/cumora/blob/7dba7d55665ccba28fb0ff94286ce75b5e46a691/server/src/agents/glance-protocol.ts) (probed 2026-09-08)

Because an agent never sees "where I am in line," claiming a slot by position is unrepresentable — the old wall of per-scenario rules collapsed into five. The document's anti-patterns section reads beautifully: don't cap one spawn class and forget the other that shares the same budget (uncapped, 7 agents produced 130 rate-limit hits in 17 minutes); don't accrete scenario examples into the prompt (keep rules shape-level only). And one painful lesson: the deterministic loop floors were deleted twice "for AI-native elegance," loops regressed both times, and the doc now pins them with "do not remove" ([`COORDINATION.md` @ `7eec2be`](https://github.com/yetone/cumora/blob/7eec2be2d97388106967a037b4937f447bc2544f/docs/COORDINATION.md)).

That principle — a code mechanism beats a reminder, and record your own mistakes — is how Wakii runs decision gates and the learning loop after every story. See the [story-workflow docs](/docs/story-workflow/) and our post [gates, not trust — and Rule 0](/blog/gates-not-trust-rule-zero/) for the mirror image.

## What Wakii learns

- **ADOPT** — deterministic spacing beats random jitter: cumora dropped random jitter for spawns because four simultaneous wakes can all roll low, in favor of a hard 500ms interval plus an adaptive pacer. Wakii hit this exact problem dispatching executors too densely in batch-2 — the normalized lesson: every coordinator fan-out and retry uses fixed, configurable spacing, and every spawn class sharing one budget gets capped.
- **DIRECTION** — hold-token-gated overrides: an override flag only counts after the agent has been shown the very thing it wants to override, with a sequence-bound, short-lived token. Wakii has no gate bypass today; if one ever appears (expediting a gate, overriding a review result), this is the safe shape to copy.
- **WATCH** — the repo is three weeks old at probe time (2026-09-08), iOS is in beta, Android is unpublished, and three releases in one day signals a cadence still being found. Once the platforms even out, revisit the BYOA boundary model — it is the closest to how Wakii thinks about isolation.
- **N/A** — real per-agent email (Resend out, Cloudflare Email Routing in): a commercial team-chat product problem, irrelevant to Wakii's surface.

Wakii is an agentic IDE with a superpowers team built in — 9 agents with separated powers in [agents-and-kit](/docs/agents-and-kit/), every step through gates. [Get Wakii](/docs/getting-started/) and run a story.
