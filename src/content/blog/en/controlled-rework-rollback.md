---
title: "Controlled rework — revert is a feature"
description: "Specs changing mid-story is normal; patching on top of patches is the real danger. This post covers controlled rework: revert to the last green commit, re-execute as one reviewable unit — through the real case of the landing switching from direction v1 Terminal Mono to v2 Bento Premium."
pubDate: "2026-08-26"
category: "tech"
tags: ["story-workflow", "git", "workflow"]
draft: false
---

A spec changing mid-story is the normal weather of a real project: the
user sees the first version and realizes they want something else, an
early assumption collapses, the environment moves. The abnormal thing is
not the change — it is the patch reflex: one style layer pressed over
the old one, one condition wrapped around the old condition, and every
patch a decision that never got reviewed on its own. A few patches in,
nobody can name the original shape of the decision anymore. The story
workflow has a mechanism for exactly this moment: revert to the last
green commit and re-execute — this post tells that mechanism through the
real case of this very website's landing switching its visual direction
from v1 Terminal Mono to v2 Bento Premium.

TL;DR:

- A spec changing mid-story is normal; the dangerous reflex is patching
  on top of patches — each patch one never-reviewed decision.
- The last green commit is the pivot point: revert to it, never reset
  --hard — history stays intact, including the part that was dropped.
- Real case: the landing switched direction v1 Terminal Mono → v2 Bento
  Premium mid-story — the user's decision, recorded as a new binding
  design.
- Re-execution is one review unit: the reviewer reads a single clean
  diff instead of rejecting patch layers one by one.

## The last green commit is the pivot

The central concept is the last known-good state — the last commit that
was green before the direction changed. It is a point where everything
was once right: build green, reviewed, working tree clean. When a
decision larger than an incremental improvement shows up, the workflow
does not try to patch the old decision with layers of new decisions —
it returns to the point that was once green and rebuilds from there.
The difference sits in the verb: revert, not reset --hard. A revert
records a new commit on top of history; a reset erases history up to
the checkpoint. The surface result looks identical — the working tree
is back at the old state — but a revert leaves the trace of the turn
itself:

```ascii
c1 ──→ c2 ──→ c3 ──┐   v1 — c3: last green commit under the old direction
                    ▼
      REVERT here — history intact, never reset --hard
                    │
                    ▼
       c4 ──→ c5 ──→ c6     re-execute against the new binding design
                    │
                    ▼
       review c4→c6 as ONE unit — not three patch layers
```

*Nguồn: sơ đồ tự vẽ theo case study trong `src/content/docs/en/story-workflow.md`, lấy 2026-09-07.*

The trace of the turn is not garbage to be cleaned — it is a record
line living inside history: "from here, the old direction was dropped
per decision X". Anyone reading history later sees the exact spot where
the direction changed, instead of a history tidied up as if the old
direction had never existed.

## A direction change without losing history

This mechanism ran for real on story FI-289 — the story that built this
very Wakii website. Mid-story, the landing's visual direction switched
from v1 Terminal Mono to v2 Bento Premium. The opening of the new
design document (a file in this repo, quoted verbatim, elisions
marked):

```text
# SF-1 Design Direction — "Modern Bento Premium" (D3 — user chọn 2026-09-04, thay thế v1 Terminal Mono)

> **v2 BINDING** (2026-09-04): thay thế hoàn toàn v1. […]
> DNA v1 (mono/mint/near-black) GIỮ làm nền identity; v1 direction-c.html
> chỉ còn giá trị tham chiếu terminal boot log.
```

*Nguồn: `docs/superpowers/designs/sf1-direction.md`, lấy 2026-09-07.*

In English: the heading names "Modern Bento Premium" as the user's
2026-09-04 choice replacing v1 Terminal Mono; the binding note says v2
fully replaces v1, with v1's DNA (mono/mint/near-black) kept as the
identity foundation, and the old v1 direction file left as reference
for the terminal boot log only. Three details in that excerpt tell the
whole story. First, the direction change was the user's decision — the
heading says "user chose", matching the human-gates principle:
architectural decisions are not the agent's to make. Second, v2 is
binding: not a new option to weigh further, but a contract fully
replacing v1 — the sub-feature may not keep half of v1 and half of v2
at its own discretion. Third — and this is the part few expect — v1's
DNA stays as the identity foundation. Changing direction does not mean
erasing what was already right: the identity layer of the old direction
lives on inside the new one. What was dropped is the layout of the old
direction, not the entire asset.

## Re-execute as one reviewable unit

The story workflow docs retell this exact case in their case study:

> **Controlled rework** — the visual design changed mid-story (direction
> v1 → the Bento Premium v2). Instead of patching on top, the sub-feature
> reverted to the last good state and re-executed against the new binding
> design — the rework was reviewable as one clean unit.

*Nguồn: `src/content/docs/en/story-workflow.md` case study "this very story", lấy 2026-09-07.*

The phrase "one clean unit" is what makes this mechanism strictly
better than patching. A reviewer faces two very different reading jobs.
With patches stacked on patches: one sprawling diff, every hunk the
decision of a different layer, and the reviewer must reconstruct the
layer history in their head to judge each layer — a wrong layer can
hide quite comfortably beneath the patch pressed over it. With
re-execution: a single diff, from the old green state to the new one,
written entirely against the current binding design. The reviewer reads
it like a real feature: every line speaks the same language, and no
layer has to be judged for the inheritance of the layer before it. The
price is redoing the work that was still usable — a fixed, known price
— traded for a diff that one pair of ordinary eyes can read to the end.

The full mechanism — last-green, revert instead of reset, re-execution
against the binding design — lives in the
[story workflow](/docs/story-workflow/) docs. The
[defensive by design](/blog/defensive-by-design/) post is the other
half of this same thinking: nothing deleted and everything revertable
are two faces of one promise. And for why a state gets to be called
"green" before it becomes a pivot point: the
[gates, not trust](/blog/gates-not-trust-rule-zero/) post tells the
gates a commit must pass to earn that word. To carry this thinking
elsewhere: next time you are about to press a third patch layer onto
two old ones — ask whether returning to the last green point and redoing
it once would be cheaper.
