---
title: "The story learning loop"
description: "The next story should know what the first story paid to learn. This post walks Wakii's learning loop: the three-question post-task ritual, story memory that keeps its provenance, and how one note about a renamed CLI flag saved every later story from tripping on it."
pubDate: "2026-08-24"
category: "tech"
tags: ["memory", "story-workflow", "workflow"]
draft: false
---

A later story should know what the first story paid to learn. Not because
some agent has a great memory — an agent's memory lives and dies with its
session — but because the workflow runs a loop: capture lessons where they
arise, attach their provenance, and hand them to the next sub-feature.
Without the loop, every story re-learns the traps the previous one already
fell into; with it, the price of each fall is paid exactly once. This post
walks that loop: the three-question ritual at the end of every task, story
memory with provenance, and one real case that shows why the mechanism
earns its place.

TL;DR:

- Every task ends with a post-task ritual of three questions: what went
  wrong, what fixed it, which pattern to keep.
- Lessons do not rot in a chat log — they land in story memory with
  provenance: which task, which fix.
- Provenance turns a note into checkable knowledge: the next sub-feature
  knows where a lesson came from and in what context it still holds.
- Real case: a note about a CLI flag renamed mid-release saved every later
  story from re-tripping on it — and the improvements log in this repo
  still works exactly that way.

## Where lessons land

Principle seven of the story workflow — "Memory and the learning loop" —
answers this in its first two sentences:

> Every task ends with a deliberate **post-task ritual**: what went wrong,
> what fixed it, which pattern to keep. Lessons land in story memory with
> their provenance — which task, which fix — so the next sub-feature
> starts smarter instead of rediscovering the same trap.

*Nguồn: `src/content/docs/en/story-workflow.md` principle 7 "Memory and the learning loop", lấy 2026-09-07.*

Read the words "their provenance" closely — that is the part separating a
note from folklore. A note without provenance is hearsay: "that command
is broken, I think". Nobody knows which task hit it, which fix cleared it,
or in what context it still holds. A note with provenance is a checkable
statement: which task met it, which fix passed it — anyone who wants to
verify can reopen that exact place. Story memory picks the second kind,
because the next sub-feature will use these notes to make decisions; and
a decision built on hearsay is only as good as its narrator. This storage
style also keeps story memory from being a black box: every entry traces
back to the task that produced it, so when a note stops holding — the tool
changes again — it gets corrected at the source instead of being trusted
for one more story.

## The ritual: three questions at the end of every task

The ritual is only three questions, and the brevity is the point: short
enough that no task skips it, broad enough to catch three different layers
of value. "What went wrong" records the event. "What fixed it" records the
solution. "Which pattern to keep" promotes both into reusable knowledge —
the third question is where a single stumble becomes an asset. The whole
loop closes like this:

```ascii
   ┌────────────────────────────────────────────┐
   │                                            │
   ▼                                            │
task done ──→ post-task ritual                  │
                ├─ what went wrong?             │
                ├─ what fixed it?               │
                └─ which pattern to keep?       │
                     │                          │
                     ▼                          │
             story memory                       │
             (+ provenance: which task,         │
              which fix)                        │
                     │                          │
                     ▼                          │
     next task starts smarter ──────────────────┘
```

*Nguồn: sơ đồ tự vẽ theo `src/content/docs/en/story-workflow.md` principle 7, lấy 2026-09-07.*

The word "deliberate" matters as much as the three questions. The ritual
is not "write down whatever you remember at the end of the day" — it is a
mandatory step, run for every task the same way. Spontaneous memory drops
exactly the smallest stumbles; the ritual asks directly, so even a small
trip gets recorded before it grows into the next story's blocker.

## From a note to a shared asset

Principle 7 comes with an example of exactly this shape:

> *Example: the first story learned that a CLI flag had been renamed
> mid-release; that note saved every later story from re-tripping on it.*

*Nguồn: `src/content/docs/en/story-workflow.md` principle 7, lấy 2026-09-07.*

The same shape is alive in this site's own repo:
`docs/superpowers/improvements-log.md` — the workflow's shared improvements
log, where each entry records a symptom, a workaround, and a suggested
change. One entry, dated 2026-09-04 (quoted in the original Vietnamese):

> **`orca linear comment add` trả `ok:false` thật cho body dài (~2.3KB
> qua heredoc stdin)** — không phải false-negative như `save-issue`
> (comment KHÔNG apply). Workaround: viết body ra file rồi
> `--body-file <path>` → ok:true.

*Nguồn: `docs/superpowers/improvements-log.md`, entry 2026-09-04, lấy 2026-09-07.*

In English: the CLI reported ok:false for a long body (~2.3KB piped
through heredoc stdin) while the comment had in fact not been applied;
writing the body to a file and passing `--body-file <path>` worked. The
entry has the full anatomy of a good lesson: an observable symptom, a
concrete workaround, and enough detail that somebody a few stories later
can use it on first read — without tripping over the same thing and
re-deriving the fix from scratch. That is principle 7's "note that saved
every later story", kept alive: not a rotting chat log but a shared
document maintained across stories.

The full picture — bracket, gates, watchdog — is rendered in the
[superpowers panel](/docs/superpowers-panel/) docs; the eight principles,
with the learning loop as number seven, live in the
[story workflow](/docs/story-workflow/) docs. The mechanism that watches
stories while this loop runs is the subject of
[watchdog: idle is not dead](/blog/watchdog-idle-is-not-dead/). To see the
loop work: run a story, read its story memory, and notice how the second
sub-feature starts smarter than the first.
