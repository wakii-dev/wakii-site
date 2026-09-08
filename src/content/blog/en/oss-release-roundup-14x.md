---
title: "Release roundup 1.4.x: what actually shipped"
description: "An inventory of what the Wakii 1.4.x release line actually shipped: two desktop releases and one Android pre-release, read straight from the public release notes — every feature tied to a verbatim notes line or a commit, including the gap that is stated openly."
pubDate: "2026-09-29"
category: "tech"
tags: ["oss", "release"]
draft: false
---

Release notes are a project's most public document: anyone can read them, and precisely because of that they are also the easiest place to exaggerate — features get told from their best angle, numbers drift by unchecked. This post runs the opposite direction on the Wakii 1.4.x release line: an inventory of what actually went out, each item tied to a verbatim notes line, a commit, or a command you can rerun yourself. It does not cover release cadence — that already has [its own post](/blog/shipping-cadence-two-releases-one-day/). It covers content: which item belongs to which release, where the evidence lives, and which thing does not exist.

TL;DR:

- As of writing (2026-09-08), the public repo `wakii-dev/wakii` has exactly three releases: v1.4.199 (Latest), v1.4.198, and the Android pre-release `mobile-android-v0.0.48` — there is no v1.4.197.
- v1.4.198 is the first Wakii-branded release, synced with upstream `stablyai/orca` main plus 651 commits: parallel worktrees, terminal splits, SSH worktrees, computer-use native.
- v1.4.199 brings Superpowers to Android: story view with SF tiers and progress, gate resolve via choice or free-text with confirm, notification routing for `gate-open`/`gate-closed`.
- Every claim in this post traces back to a checkable source: a `gh` command, a verbatim notes line, or a commit recorded in the editorial kit's verify-shipped registry.

## Three rows in the list — and one empty slot

The starting point is the full list, unfiltered:

```bash
$ gh release list --repo wakii-dev/wakii --limit 10
Wakii 1.4.199	Latest	v1.4.199	2026-09-05T19:07:31Z
Wakii 1.4.198		v1.4.198	2026-09-05T12:47:15Z
Orca Mobile Android mobile-android-v0.0.48	Pre-release	mobile-android-v0.0.48	2026-09-05T13:00:31Z
```

*Source: `gh release list --repo wakii-dev/wakii --limit 10`, retrieved 2026-09-08.*

The command asked for ten rows and got three — meaning that at retrieval time, those three rows are the entire public release inventory of the repo; nothing is hiding on another page. Reading the tag sequence closely reveals a gap: the jump goes straight from v1.4.198 to v1.4.199, and there is no v1.4.197 on the public repo. Stating the gap openly is not storytelling — it saves anyone looking up that version number from searching a releases page that will never show it, and it binds this post: everything below may only discuss what sits inside those three rows. The timestamps and their cadence lesson were analyzed in the other post; here they are just the inventory to enumerate.

## v1.4.198: the first branded release, 651 commits from upstream

The opening line of the v1.4.198 notes positions the release itself:

> first Wakii-branded release, cut from `wakii-dev` and synced with upstream **stablyai/orca** `main` (+651 commits)

*Source: `gh release view v1.4.198 --repo wakii-dev/wakii --json name,publishedAt,body`, retrieved 2026-09-08.*

The highlights table lists what came in from upstream:

> Everything new from stablyai/orca — parallel worktrees, terminal splits, GitHub & Linear native, SSH worktrees, mobile companion.

*Source: as above, retrieved 2026-09-08.*

Those items do not stay at the level of a list: the editorial kit's verify-shipped registry — where a feature only earns the SHIPPED label when real code exists and it appears in release notes — cross-checks each one against a specific commit:

| Registry label | Attached evidence |
| --- | --- |
| feature-terminal-splits — SHIPPED | commit `c558d7e083` (#17601), in tags v1.4.198 + v1.4.199 |
| feature-ssh-worktrees — SHIPPED | commit `278f9ee876` (#17946 ssh MFA), in tags v1.4.198 + v1.4.199 |
| feature-computer-use-native — SHIPPED | v1.4.198 notes + module `src/main/computer/` + commit `787766bfcf` |
| feature-per-workspace-env — SHIPPED | commit `24d7f6b790` (#7908), in tags v1.4.198 + v1.4.199 |

*Source: `docs/superpowers/editorial/2026-blog-longform/claims-registry.md`, section "Verify-shipped — batch-2 features", cross-checked 2026-09-08.*

The most interesting detail in the v1.4.198 notes is actually a note about something unfinished:

> **macOS arm64 is being rebuilt on a GitHub-hosted runner (Xcode 16)** to include the computer-use native module — the DMG will be replaced in place when it finishes.

*Source: `gh release view v1.4.198`, retrieved 2026-09-08.*

The notes do not hide an in-flight build: they say the DMG will be replaced in place once it finishes. Why one module needs its own rebuild, and which layer of the app it lives in — the [computer-use architecture](/blog/arch-native-computer-use/) post dissects that; and why this project forked while keeping the license open, the [fork-MIT post](/blog/oss-why-fork-mit/) is the series opener.

## v1.4.199: Superpowers on Android

The v1.4.199 notes lead with this highlight:

> Superpowers on Android (FI-305): Mở app là thấy story list group theo worktree, vào story xem SF tiers + tiến độ; pending gates hiện rõ, resolve bằng choice buttons hoặc free-text + confirm; notification `gate-open`/`gate-closed` tap deep-link nhảy đúng màn story/gate

*Source: `gh release view v1.4.199 --repo wakii-dev/wakii`, retrieved 2026-09-08.*

The notes' Mobile section closes the loop on routing:

> Notification routing: `gate-open`/`gate-closed` đủ routing fields, tap → đúng màn; old-build hiển thị an toàn

*Source: as above, retrieved 2026-09-08.*

(The quotes stay in the original Vietnamese on purpose — these are verbatim notes lines, and translating them would make diffing against the release page harder.)

This post deliberately stops at what the notes state: story view shows SF tiers and progress, gate resolve works via choice or free-text with confirm, notifications cover the two gate states. The broader questions — whether pairing survives across sessions, whether data syncs between devices — the notes do not say, and this post will not say it for them. In a project whose rule is "claims never exceed evidence", the post's boundary is the notes' boundary.

One more v1.4.199 item sits outside mobile, worth noting because it moves where review work happens: diff annotation. The registry labels it SHIPPED with evidence being the `DiffCommentCard.tsx` component and the inline-comments files in tag v1.4.199 — review comments live directly on the diff, facing the agent, instead of being scattered in a separate UI. The notes' Fixes section also records one security-shaped fix worth trusting: "`resolveFocusedWorktreePath` tách host-internal — workspace docs không lộ path qua facade".

## The inventory table

Collected: what the 1.4.x line shipped as of writing — each row with its own source:

| Release | What shipped | Source |
| --- | --- | --- |
| v1.4.198 | First Wakii-branded release + upstream sync +651 commits | verbatim notes |
| v1.4.198 | Terminal splits · SSH worktrees · computer-use native · per-workspace env | 4 SHIPPED labels in the registry, with commits |
| v1.4.199 | Superpowers on Android: story view, gate resolve, notification routing | verbatim notes |
| v1.4.199 | Diff annotation (`DiffCommentCard.tsx`) in the tag | registry SHIPPED + tag v1.4.199 |
| mobile-android-v0.0.48 | Android pre-release on its own tag | `gh release list` |

*Source: the sources named in the table, all retrieved 2026-09-08.*

The bar for a row to enter the table: a verbatim notes line, a commit with a tag, or a SHIPPED label in the registry. No row is named "coming soon" — the inventory stops at the evidence boundary, and the rest belongs to the releases page whenever it updates. This method doubles as the reading recommendation: instead of trusting a description, open the notes, point at each bullet, and ask which commit it traces to.

Everything in the 1.4.x line runs inside the app you download from the download page; the [getting started](/docs/getting-started/) docs are the entry point: grab the build for your OS, open the Superpowers panel, run your first story. And if you want to re-inventory it the way this post did — the two `gh` commands at the top are the entire toolkit.
