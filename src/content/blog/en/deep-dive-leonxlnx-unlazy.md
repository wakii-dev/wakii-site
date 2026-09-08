---
title: "unlazy: completion discipline for agents — runnable gates before work"
description: "unlazy is not the image lazy-loading library the brief guessed — the GitHub API confirms it is an anti-laziness skill for AI agents: write acceptance gates before the work, re-verify everything that passed, and refuse your own evidence when it does not reproduce."
pubDate: "2026-10-25"
category: "tech"
tags: ["gates", "evidence", "agents", "qa"]
draft: false
---

Start with a correction: the name "unlazy" sounds like an image lazy-loading library — and the original brief for this post guessed exactly that. The GitHub API on 2026-09-08 says otherwise: Leonxlnx/unlazy is an "Anti-laziness skill for AI agents" — 3,168 stars, MIT, created 2026-08-09. "Laziness" here has nothing to do with deferring image loads; it is the habit of finishing early — an agent reporting "done" while the work is not done. This repo pushes back against that habit with machinery: runnable gates written before the work starts, and evidence in place of confident assertions.

## TL;DR

- unlazy forces the agent to write an acceptance ledger (`GATES.md`) BEFORE implementing: each gate is one observable outcome with a `CHECK:` command and an `EXPECT:` marker — a gate passes only when the exit code is 0 AND the output matches the marker.
- Evidence written by the checker carries a SHA-256 digest of the gate's own definition: change the command or expectation and the old evidence automatically becomes stale-unmet — no silently keeping an old pass under a new definition.
- Abandonment gets an honest treatment: `ABANDON` with a required reason is a terminal handoff and the checker exits 1 — quitting is never counted as completion.
- Most admirable is the honesty about itself: the repo declares its historical six-run comparison NON-reproducible and forbids presenting it as proof of effectiveness.

## What the repo actually is — and what it sells

The product is a skill — one `SKILL.md` plus a few pure-Node scripts with zero third-party runtime packages — installed into `~/.claude/skills/unlazy` or `~/.codex/skills/unlazy`, or via the skills CLI: `npx skills add Leonxlnx/unlazy`. The main author is one person, plus one external docs PR; the last push landed 2026-09-03. The language stat reads JavaScript because of the checker scripts, not because this is a runtime library.

| Metric | Value |
| --- | --- |
| Stars / forks | 3,168 / 210 — per the GitHub API on 2026-09-08 |
| License | MIT |
| Created / last push | 2026-08-09 / 2026-09-03 |
| Releases | none — the README advises pinning an exact commit |
| Components | SKILL.md + plain Node scripts (gate-check, gate-lint, stop-hook) |

Why such a repo reaches 3k stars in under a month has an answer that lies outside it: everyone running agents has met "half-finished work reported with full confidence" — and this is one of the most popular repositories to turn that complaint into a machine-checkable problem.

## Gates first — evidence bound to its definition

The skill's timeline is: before touching the work, write `GATES.md` from a template — one observable outcome per gate:

```markdown
# Gates: pricing behavior

- [ ] G1: pricing fixtures render the expected tiers
  CHECK: node scripts/verify-pricing.mjs
  EXPECT: pricing verification passed
  EVIDENCE: pending

- [ ] G2: checkout integration succeeds from its package
  CHECK: node scripts/verify-checkout.mjs
  EXPECT: checkout verification succeeded
  CWD: packages/checkout
  EVIDENCE: pending
```

— templates/gates-leaf.md, [Leonxlnx/unlazy](https://github.com/Leonxlnx/unlazy/blob/main/templates/gates-leaf.md) (probed 2026-09-08)

A runnable gate counts as met only when the command exits 0 and the output matches `EXPECT:` — both conditions, neither substituting for the other. The subtler layer is the evidence: the checker records a versioned full SHA-256 digest of the parsed `CHECK:`/`EXPECT:`/`CWD:` — change any part of the gate's definition and the old evidence flips to stale-unmet, forcing a re-run against the new definition. The README also states its own limit precisely: this unkeyed binding detects structural drift, not ledger tampering — anyone who can edit a ledger can forge canonical-looking evidence; the real boundary is the approval step. And approval is bound exhaustively: a record under `~/.unlazy/approved` locks the ledger, gate, command, expectation, CWD, shell, timeout, platform, and the full inherited PATH — change any bound input and that input needs approval again. The README's closing line deserves framing: "Approval is consent, not a sandbox."

## Abandonment is honest — but never counted as done

Two mechanisms complete the philosophy. First, `--reverify` re-runs ALL runnable gates, including ones that already passed — the changelog states the point directly: it removes completion when the oracle no longer passes. Verification runs in four layers: leaf self-check, parent re-verify, branch integration, and an optional Stop hook that returns Claude Code's `decision: "block"` while unmet gates or open dispatch waves remain — with a progress guard that releases after six no-progress blocks so the hook cannot wedge itself into an infinite one.

Second, quitting has its own typed state: `ABANDON: <id> <reason>` goes into the ledger, the checker exits 1 with "HANDOFF REQUIRED" — a handoff, not a success — and a parent gate can never accept an abandoned child while claiming ALL MET. Alongside it sits gate-lint, which lints the ledger AT AUTHORING TIME to catch gates that cannot fail (fixed-output commands, vague success vocabulary, unmeasured manual figures) — an oracle that cannot fail should be caught at authoring, not certified at report time. And an anti-circularity rule: measure figures independently; never copy a supplied number into `EXPECT:` as its own proof.

This whole block is "gates, not trust" — the philosophy Wakii runs through B-gates; see the [story-workflow docs](/docs/story-workflow/) and the post [gates, not trust — and Rule 0](/blog/gates-not-trust-rule-zero/) — independently reinvented as a portable skill. The convergence is itself a signal: completion discipline is becoming standard agent engineering.

## A repo that refuses its own evidence

The part that makes this repo worth learning from is not the code. `research/validation-protocol.md` declares up front: the historical six-run comparison (2 tasks × 3 conditions — no skill / tree 3 / tree 6) once mentioned in earlier README versions inspired the v2 design, but the repo does NOT keep the transcripts, token logs, or calculation code from those runs, so the reported numbers "cannot be independently reproduced or audited from source." The file's own verdict: treat it as design provenance only — far too small for any model-level claim — and never describe it "as proof that unlazy causes a specific improvement or cost multiplier." It then lays out a minimum protocol for anyone to rerun the science properly: pre-register conditions, isolate every run, archive full transcripts.

A repo selling evidence discipline, taking a real loss on its own marketing, to stay honest about its own evidence — that is learn-in-public in the true sense.

## What Wakii learns

- **DIRECTION** — definition-digest evidence binding: a gate's evidence carries a digest of the gate's own definition, and any definition change makes the old evidence stale-unmet. Wakii re-verifies in a full sweep at convergence, but when a plan task changes mid-batch, the "pass under the old definition" is not explicitly marked — a digest pin would make that drift surface in audits instead of relying on scoped re-reviews to catch it by chance.
- **DIRECTION** — abandonment as a typed terminal state: `ABANDON` with a mandatory reason, exit 1 HANDOFF REQUIRED, and a parent gate cannot accept an abandoned child as ALL MET. Wakii has BLOCKED reports and a rollback-fixer; making "quit with a reason" a typed state in the bracket — impossible to swallow into Done — is the sharper version of the same idea.
- **N/A** — the Depth Tree with leases, waves, rolling dispatch, and judgment/mechanical tiers: Wakii already runs the equivalent shape (bracket tiers, wave dispatch, slot spacing) — two designs converging independently; the differences are surface, not substance.
- **WATCH** — a single maintainer, an unreleased 2.1.0 (the README advises pinning a commit), and self-declared non-reproducible comparison evidence: watch maturity and adoption before porting detailed mechanics into the product.

Wakii is an agentic IDE with a superpowers team built in — gates first, evidence after, 9 agents with separated powers. [Get Wakii](/docs/getting-started/) and run a story where nobody has to trust anyone's "done."
