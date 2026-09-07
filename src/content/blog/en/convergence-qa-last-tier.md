---
title: "Convergence QA — the last tier proves it holds"
description: "The last tier of a story adds no features — it proves that everything already built still holds. This post dissects a real convergence QA: assemble on frozen contracts, measure regression against a tag-grouped baseline, and require every diff to trace back to a source."
pubDate: "2026-09-01"
category: "tech"
tags: ["qa", "story-workflow", "workflow"]
draft: false
---

Long projects develop a specific fear near the end: the closer to the finish
line, the less anyone dares to touch anything. Fix one spot, break ten others
— and no one can promise that the feature which ran cleanly for weeks still
runs. The familiar response is to add prohibitions: "don't touch that area",
"ask X before changing it". Wakii's workflow picks the opposite direction:
instead of banning contact, it reserves the story's last tier for touching
things safely — a tier that adds no features and has exactly one job: prove
that everything already built did not break. That is convergence QA, and this
post reads it through a real spec.

TL;DR:

- The last tier of a story is convergence QA: no new capability, only proof
  that the merged combination still holds.
- It works on a frozen surface: the previous tier's contracts are sealed
  READ-ONLY; new work only assembles on top.
- "Nothing broke" is measured against a baseline captured before the story and
  diffed by tag group: must-stay-identical groups are separated from
  allowed-to-change ones.
- A diff outside the expected group must not be swallowed — an explained diff
  has to trace back to a deliberate change.
- The frozen surface is checked by the old tests: existing specs stay green,
  unmodified.

## The last tier writes nothing new

The name "convergence QA" reads easily as "the final test run" — one more pass
for ceremony's sake. It is actually a different kind of work from every
earlier tier: middle tiers add capability — SEO surface, content,
infrastructure — while the last tier adds nothing. It takes the combination
already merged on the destination branch and asks exactly one question: when
everything stands next to everything else, does each piece that ran alone
still run?

A real convergence story in the public hub-store repo — a spec titled verbatim
"SF-11 FE Convergence — Audit viewer + Export UI + Mobile + Harmonize — Design"
([link](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/specs/2026-09-03-sf11-fe-convergence-design.md))
— defines this tier's posture in the very first line of its problem section:

> "Đây là công việc FE lắp ráp + hội tụ trên contracts BE ĐÓNG BĂNG
> (READ-ONLY services/**)."

(Translation: "This is FE assembly + convergence work on FROZEN BE contracts
(READ-ONLY services/**).")

*Source: [SF-11 FE Convergence spec](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/specs/2026-09-03-sf11-fe-convergence-design.md)
— github.com/wakii-dev/hub-store, retrieved 2026-09-07.*

Two words carry the essence of the last tier in that sentence: "assembly" and
"convergence" — and both happen on top of "FROZEN BE contracts". The tier's
new work — an audit viewer, an export button, mobile responsiveness — is not
allowed to redefine anything; it only assembles onto already-sealed parts. The
spec pins the boundary the same way:

> "KHÔNG đổi business logic / API shape / proto / compose / realm JSON
> (services/** READ-ONLY)."

(Translation: "Do not change business logic / API shape / proto / compose /
realm JSON (services/** READ-ONLY).")

*Source: same SF-11 spec, Scope Out section, retrieved 2026-09-07.*

This boundary is not administrative busywork. If the last tier may edit
contracts, it is no longer proving what was built — it is building more, and
the check loses its subject.

## Baseline captured before the story, regression measured by tag group

"Prove nothing broke" needs something to compare against. Compared to what?
Compared to expectations in someone's head, the result also lives in that
head. Convergence QA compares against a baseline: a snapshot of the product's
state captured from the main branch before the story starts, then diffed
against the post-story state.

The task list of the QA tier in bracket FI-339 — the story that built the blog
you are reading — writes this requirement as a task by name:

```text
Tasks: baseline-dist-từ-main-trước-story / regression-canonical-hreflang-noindex (landing /+/vi/, download /+vi/, docs sample, 404 — og:*/rss additions là expected diff, chỉ canonical/hreflang/noindex phải bất biến) / …
```

*Source: docs/superpowers/brackets/fi339-blog-features.md, SF-3 section,
retrieved 2026-09-07.*

A whole-site diff is a lot of change; listing it line by line is unreadable.
So the comparison is split by tag group — each group gets its own rule:

```ascii
baseline (main, before story)      dist after story      group rule
────────────────────────────      ─────────────────    ──────────────────
canonical   = A                    canonical   = A      must stay identical
hreflang    = B                    hreflang    = B      must stay identical
noindex     = C                    noindex     = C      must stay identical
(og:* / rss   not present yet)     og:image …  = NEW    expected diff
                                   rss link    = NEW    expected diff
```

*Source: diagram built from the SF-3 task list in bracket FI-339 (quoted
above), retrieved 2026-09-07.*

A tag-grouped baseline turns a feeling-level question — "did anything break?"
— into two questions a machine answers: does the must-stay-identical group
still match byte for byte, and does every remaining change fall inside the
expected group? Neither group needs anyone to "feel fine about it".

## An explained diff still has to be explained

The expected-diff group does not mean "no explanation needed". It means the
explanation existed before the diff: every change must trace back to a
deliberate source — a commit, a task written in the bracket, a recorded
decision. A diff outside those groups must not be swallowed; a diff inside the
expected group that cannot be traced to a source must not be swallowed either.

A real case from FI-339's QA: the baseline diff surfaced one change touching
the whole site — the domain wakii.dev became wakii.xyz. To the naked eye this
is exactly the "fix one spot, break ten" shape: canonical, og:url, sitemap and
RSS all changed along. But it was not a regression — the owner changed
SITE_URL deliberately, contained in a single named commit:

```ascii
detected diff                     verdict      explanation traced to source
───────────────────────────      ─────────    ─────────────────────────
og:*/rss additions                expected     added by SF-1, deliberate
canonical/hreflang/noindex        identical    regression check PASS
domain wakii.dev → wakii.xyz      explained    commit 9d4d460 — owner confirmed
```

*Source: evidence pack of story FI-359 §#13 + Linear FI-342 verdict, retrieved
2026-09-07.*

A regression is a diff nobody adopted — it appears without anyone having
called for it. An explained diff has a name and a birth record: a deliberate
commit, a task line written before the code existed. This convention changes
the psychology of review: the reviewer does not fear diffs — diffs are QA's
raw material. The reviewer fears orphan diffs.

## The frozen surface is measured by the old tests

The strongest way to prove "nothing was broken" is not to look — it is to let
the old tests themselves rule. The SF-11 spec writes its E2E section in
exactly that shape:

> "specs MỚI cho audit-viewer + export (users/dashboard/realtime specs đã có
> từ SF-8/9/10 — chỉ verify xanh); toàn bộ 15 specs hiện hữu stay green
> KHÔNG sửa."

and pins the boundary directly:

> "KHÔNG sửa specs E2E cũ (kể cả `03-audit.spec.ts` — là i18n-audit, không
> liên quan activity log)."

(The quotes from the SF-11 spec stay in Vietnamese — they are verbatim lines
from the artifact. The first says: new specs for audit-viewer and export, and
all 15 existing specs stay green without modification. The second: old E2E
specs must not be modified, including `03-audit.spec.ts` — an i18n-audit
unrelated to the activity log.)

*Source: both quotes from the [SF-11 spec](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/specs/2026-09-03-sf11-fe-convergence-design.md),
retrieved 2026-09-07.*

The "don't touch old specs" rule matters more than it looks: old specs are the
behavioral baseline of the frozen surface. If one fails and gets loosened
until it passes, the convergence check defeats itself — you just dismissed the
witness at the moment you needed one most. That is why the spec bans it by
name, including a file that seems unrelated.

```ascii
existing specs : stay green, unmodified    ← behavioral baseline of the frozen surface
new specs      : added for audit + export  ← assembly only, old ones untouched
```

*Source: diagram built from the E2E section and Scope Out of the SF-11 spec
(quoted above), retrieved 2026-09-07.*

This mechanism is not one project's habit — the workflow docs pin it as law:

> "Parallelism never means divergent histories; integration happens
> continuously at known points."

*Source: src/content/docs/en/story-workflow.md, section "5. Tiers and one
destination branch", retrieved 2026-09-07.*

The last tier is the story's final known point — where every line converges
before the story counts as closed. The bracket-and-tier structure has its own
deep dive ([brackets and tiers: the map for long projects](/blog/long-tasks-bracket-tiers/));
[done means evidence](/blog/done-means-evidence/) answers the other half of
the close-out: who rules on the verdict, and against which rubric. The full
lifecycle — tiers, destination branch, B0–B5 gates — lives on the
[story workflow](/docs/story-workflow/) page.

If your team is heading into the end of a long project, try this tier's three
rules: budget one tier for proving, capture the baseline before anyone touches
anything, and never swallow a diff that has no owner. Wakii ships that
structure — download the app, describe your idea in one line, and let the last
tier do its job.
