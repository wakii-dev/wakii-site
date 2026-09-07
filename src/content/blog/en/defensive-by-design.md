---
title: "Defensive by design"
description: "Wakii's workflow assumes the agent itself will make mistakes — so it makes mistakes cheap and visible: nothing deleted, unknowns flagged instead of guessed, new commands dry-tested first. This post covers those three habits and the merge conflict resolved by keeping both sides."
pubDate: "2026-08-25"
category: "tech"
tags: ["guardrails", "workflow", "agents"]
draft: false
---

Most software defends in exactly one direction: against the user —
validation catches bad input, a dialog confirms the delete, an undo
button covers the misclick. Every defensive layer sits at the boundary
between the system and the person outside it. Wakii's story workflow
turns the arrow around: the thing most likely to break the process is
not the user but the agent running the process. So principle eight does
not say "be careful" — it assumes outright that the mistake will come
from inside, and designs so that when it arrives, it is cheap and
visible. This post walks the three habits born from that assumption —
nothing deleted, flagged instead of guessed, dry-tested before trusted —
and one merge conflict resolved the way few would choose: by keeping
both sides.

TL;DR:

- The workflow assumes the agent itself will err — the defenses wrap the
  author, not the user.
- Nothing is deleted: everything is revertable, and what gets replaced
  is marked and kept as an audit trail instead of discarded.
- Unknowns are flagged instead of guessed; new commands are dry-tested
  before they are trusted.
- A merge conflict in a shared notes file is resolved by keeping both
  sides — guessing wrong costs more than keeping both.

## An assumption is a debt

Principle eight of the story workflow packs all three habits into one
short paragraph:

> The workflow assumes **it will be the one making the mistake** — so it
> makes mistakes cheap and visible. Nothing is deleted (everything is
> revertable), unknowns are flagged instead of guessed at, and any new
> command is dry-tested before it is trusted ("the document says it works"
> ≠ "it works").

*Nguồn: `src/content/docs/en/story-workflow.md` principle 8 "Defensive by design", lấy 2026-09-07.*

The last two clauses each deserve a stop. "Flagged instead of guessed"
is about knowledge debt: a guess — filling an unknown with a plausible
sentence — is debt with no ledger; if it turns out wrong, the discovery
arrives after everything has been built on top of it. A flag is debt on
the books: it stands verbatim at the exact spot where it arose, anyone
passing by sees it, and clearing it costs exactly one edit. The
dry-test is about the distance between a claim and an observation: "the
document says it works" is somebody's assertion; "it works" is an event
that happened. Only one harmless trial run closes that gap — before the
command is used to make a real decision, not after.

## Nothing gets deleted

"Nothing is deleted" sounds like archival discipline, but the real
value sits on the far side of the revert-versus-delete comparison.
Deleting edits history until the failure disappears: files get cleaned,
commits get rewritten, and the question "what actually happened" loses
its answer. Reverting adds a new layer on top: the wrong part stays
intact in history, along with the commit that records why it was
dropped. The surface result is identical — clean code — but one side
keeps an audit trail and the other does not:

```ascii
wrong commit
   │
   ├─ delete / reset --hard ──→ the failure vanishes ──→ nothing left to reread
   │
   └─ revert + mark ──→ history stays ──→ audit trail stays ──→ lesson stays
```

*Nguồn: sơ đồ tự vẽ theo `src/content/docs/en/story-workflow.md` principle 8, lấy 2026-09-07.*

The rule is not on paper only. In hub-store — a separate production
project running on this very story workflow — a canceled story is not
deleted from the repository. Its bracket file gets a marker line at the
top and is kept as documentation (quoted in the original Vietnamese):

> SUPERSEDED 2026-08-31 — gộp vào FI-233; file còn là audit trail
> ("File này chỉ còn là audit trail (Linear FI-232 Canceled)")

*Nguồn: `docs/superpowers/editorial/2026-blog-longform/evidence-pack.md` §Hub-store artifacts — bracket `ict-service-support-rebuild`, snapshot 2026-09-07.*

In English: superseded on 2026-08-31 — merged into FI-233; the file
remains as an audit trail ("the file is now only an audit trail —
Linear FI-232 canceled"). A story was marked superseded and folded into
another one — and instead of tidying the file away, the workflow puts a
mark at the top and leaves the rest untouched. The file now has exactly
one job: to tell whoever reads later that this story existed, and where
it was folded into. That is the "visible" half of principle 8 in its
purest form: the mistake is not merely un-hidden — it is edited into a
note, placed exactly where the next person will look first.

## Keeping BOTH sides of a conflict

The last case is the smallest incident type and the most frequent one:
a merge conflict in a shared notes file — two sub-features edit the
same shared note, git asks which half to keep. Principle 8 has an
example for exactly that situation:

> *Example: when a merge conflict appeared in a shared notes
> file, the resolution kept both sides rather than dropping one — the cost
> of being wrong about which line mattered was higher than keeping both.*

*Nguồn: `src/content/docs/en/story-workflow.md` principle 8, lấy 2026-09-07.*

The resolution is worth reading as a cost table. Keeping both sides:
one extra reading pass — somebody has to read two overlapping passages
and merge them later. Dropping one side: if the guess is right, it
saves exactly that one pass; if the guess is wrong, a note without a
backup vanishes for good — and nobody ever knows it existed. The two
prices are not symmetric: one is known in advance and small, the other
is unknown in advance and potentially bottomless. The defensive choice
picks the fixed price, and the merging gets deferred until there is
enough information to do it right. (This is distinct from fork-sync
conflicts between a fork and upstream — a whole-repository git-layer
affair; this case is an internal conflict between two sub-features
writing one file.)

All eight principles — "Defensive by design" being number eight — live
in the [story workflow](/docs/story-workflow/) docs. And once a mistake
has been kept as an audit trail, it does not just sit there: the
[story learning loop](/blog/story-memory-learning-loop/) post tells the
rest — a recorded mistake is fuel for the loop. To watch these three
habits run for real: next time a new command appears in the process,
notice whether it gets one harmless trial run before being trusted.
