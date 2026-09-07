---
title: "Watchdog: idle is not dead"
description: "A silent agent is not necessarily stuck — it might be running a long build. The watchdog checks three layers (commits, terminal, Linear) before declaring a stall: healthy silence is left alone, real wedges resume from the last green commit. This post tells both real cases and the resume mechanism that loses no work."
pubDate: "2026-08-23"
category: "tech"
tags: ["story-workflow", "workflow", "guardrails"]
draft: false
---

Watch a long story run and the question that keeps coming back is not "how
far along is it" but "is it still alive". The agent process has been silent
for ten minutes — is it thinking, building, or wedged in a dead end since
last hour? Gut-feel guessing fails in both directions: intervene too early
and you interrupt a build that was running fine; intervene too late and you
abandon a sub-feature that has been dead for a while. The story workflow
outlaws this guess: a **watchdog** has to check evidence across three
layers before it may declare a stall — and two real cases in this post
show why silence is not a diagnosis.

TL;DR:

- A silent agent is not necessarily stuck — healthy silence (a long build)
  and a real wedge (a failing gate) are different situations; tell them
  apart before intervening.
- The watchdog checks three layers before declaring a stall: recent
  commits, terminal state, Linear progress.
- Recovery means waking with input: resume from the last green commit
  instead of restarting from scratch and losing finished work.
- Atomic commits are the unit of resume — every commit is a green state
  the story can stand up from.

## Three layers before a stall verdict

Principle six of the story workflow's eight principles opens with exactly
this distinction:

> A silent agent is not necessarily a stuck one — it might be running a
> long build. The **watchdog** checks three layers (recent commits,
> terminal state, Linear progress) before declaring a stall, and recovery
> means *waking it with input*, not restarting it and losing work.

*Nguồn: `src/content/docs/en/story-workflow.md` principle 6 "Watchdog: idle is not dead", lấy 2026-09-07.*

The three layers are not thoroughness theater; each answers a question the
other two cannot see. Recent commits tell whether the work's artifacts are
moving. Terminal state tells whether the process is alive and writing
anything out. Linear progress tells whether the task is moving on the
shared board. Only when all three go quiet is there enough evidence to
declare a stall:

```ascii
agent silent
   │
   ├─ Layer 1 — recent commits?
   │     └─ a new commit exists ────→ working ──→ leave alone
   ├─ Layer 2 — terminal state?
   │     └─ build/log progressing ──→ working ──→ leave alone
   ├─ Layer 3 — Linear progress?
   │     └─ task still moving ──────→ working ──→ leave alone
   │
   └─ all three quiet ──→ declare stall ──→ intervene
```

*Nguồn: sơ đồ tự vẽ theo `src/content/docs/en/story-workflow.md` principle 6, lấy 2026-09-07.*

The order of checks is also an order of latency: the first two layers are
cheap and update continuously; the last is slower but reflects what a
story reader actually cares about — is the work moving on the board. The
watchdog walks the layers in that sequence, and the verdict is only
allowed at the end: leave alone, or intervene. No single layer may
conclude on behalf of all three.

## Healthy silence and real wedges: two real cases

The docs do not stop at the mechanism — principle 6 tells the two cases
that actually happened:

> *In practice: a sub-feature that went quiet during a long native build
> was left alone; one genuinely wedged on a failing gate was resumed from
> its last good commit instead of from scratch.*

*Nguồn: `src/content/docs/en/story-workflow.md` principle 6, lấy 2026-09-07.*

The first case is healthy silence. The sub-feature went quiet because it
was running a long native build — the kind of work that writes nothing to
chat, produces no new commits for a while, and yet the process is alive
and doing exactly its job. Intervening here is sabotage: restarting
mid-build throws away precisely the most time-expensive part. The watchdog
reads the layers, sees signs of life, and chooses to leave it alone — the
right decision in this case is the decision to do nothing.

The second case is a real wedge. The sub-feature is genuinely stuck, on a
failing gate — it will not move again, no matter how long you wait. The
two situations look identical on the surface (both silent) but call for
opposite handling; that is why the three-layer check exists: distinguish
first, intervene after. The
[gates, not trust](/blog/gates-not-trust-rule-zero/) post told the story
of the gates a sub-feature must pass — this case is the other side of that
picture: the gate itself is where a sub-feature got wedged.

## Resume from the last green commit

Principle 6 names the recovery action precisely: *waking it with input*,
not restarting it and losing the work. The difference sits in where the
next run starts. A restart from scratch throws away every green commit;
waking with input puts the agent back at the last good state and hands it
the thing it was missing — new input, information about what failed — so
it continues from there.

```ascii
c1 ──→ c2 ──→ c3 ──→ c4 (green) ──╳── stall at a gate
                       │
                       ▼
        resume from c4 — not from scratch
                       │
                       ▼
                  c5 ──→ c6 ──→ …
```

*Nguồn: sơ đồ tự vẽ theo `src/content/docs/en/story-workflow.md` principle 6, lấy 2026-09-07.*

The mechanism works because of a convention set at code-writing time:
atomic commits. Each commit stands on its own — no "half" commit that
needs a later one to run. That is what makes "the last green commit" a
trustworthy state, and resuming from it is not a patch job: it is
continuing a chain that is already green. Without atomic commits, the idea
of a last-known-good state is just a hope.

The full principle — the three-layer check, waking with input, both real
cases — lives in the [story workflow](/docs/story-workflow/) docs. The
[gates, not trust](/blog/gates-not-trust-rule-zero/) post is the remaining
piece of the picture: gates are where a sub-feature can wedge, and the
watchdog is what notices in time. And if you run long stories overnight:
the watchdog is the part of the workflow you never see, and sleep because
of.
