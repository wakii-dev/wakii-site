---
title: "SSH worktrees: remote code, isolated environments"
description: "Import SSH targets straight from ~/.ssh/config and keep isolation for repos on internal servers or remote dev boxes — and when a clone fails, the error says where it ran."
pubDate: "2026-09-16"
category: "tech"
tags: ["features", "cli", "worktree"]
draft: false
---

The previous post in this series ended on a physical conclusion: real parallelism starts on disk — one task, one worktree, one branch per worktree. But not every repo lives on your machine: an internal repo sits behind a jump host, a build box lives in another office, a shared box belongs to the whole team. The familiar route is to ssh in and clone manually into a shared directory — and every lesson about "the last writer overwrites the first" comes back intact. Wakii takes a different route: it treats the SSH target as the starting point of a worktree, and it handles the hard part of connectivity — authentication, aliases, clone failures — as code that must be readable.

TL;DR:

- Wakii imports SSH targets straight from `~/.ssh/config`: alias, host, port, user, jump host, proxy — an `ssh-config` target is refreshed from the config on every import, while `manual` targets are never overwritten by import.
- A remote PTY lease carries a `worktreeId` — the remote shell is attached to one specific worktree; when a target is removed, a tombstone preserves its identity so old repos/worktrees re-point to the new target.
- Commit `278f9ee876` — shipped in v1.4.198 — fixes three transport bugs: multi-stage MFA, dialling an unclaimed alias, and clone failures that never said where they ran.
- Every transcript in this post was captured from a real checkout of the product repo, on 2026-09-08.

## The repo lives elsewhere; isolation does not travel for free

Git's worktree mechanism does not care where the repo is — but bringing the repo to where the work happens does. For a public repo, cloning locally ends the story. For an internal repo, the usual route is: ssh into the team box, clone into the home directory, and every task — the bugfix, the experiment, the rerun — lives inside that one directory tree:

```ascii
repo behind a jump host — the manual route: every task shares one directory

  laptop ── ssh ──► team box (remote machine)
                      └── ~/repo/            ← a single clone
                            ├── task A: half edited, uncommitted
                            ├── task B: overwrites A's unfinished work
                            └── task C: checks out another branch, clobbers all
                          one directory tree — the last writer wins
```

*Source: conceptual diagram; the "one shared directory" failure mode is dissected with live git transcripts in the post [real parallelism through worktree isolation](/blog/parallel-worktrees-isolation/), retrieved 2026-09-08.*

The cost is not the ssh step — it is the structure. A shared directory does not allow two tasks in two different unfinished states: the later checkout clobbers the earlier one, and one task's commit drags along another's half-finished changes. Isolation on a remote machine needs exactly the mechanism proven on a local one — multiple worktrees, one branch each — except the starting point is now an SSH target.

## The alias comes from ssh config — targets born from configuration you already have

Wakii does not ask you to retype the host, port, and user already written in `~/.ssh/config`. It reads that config as the source that mints targets. Two fields on the `SshTarget` type state the living conditions of this mechanism:

```bash
$ grep -n "configHost?:\|source?: 'ssh-config'\|orphaned repos/worktrees\|worktreeId?:" src/shared/ssh-types.ts
19:  configHost?: string
43:  source?: 'ssh-config' | 'manual'
72: *  can re-point orphaned repos/worktrees from the old (deleted) target id to
76:  /** The id the removed target had — what orphaned repos/worktrees still point at. */
191:  supportsFolderDownload?: boolean
208:  worktreeId?: string
```

*Source: `grep` on src/shared/ssh-types.ts in a checkout of the orca product repo, retrieved 2026-09-08.*

Read line by line. `configHost` is the alias — "Host alias to resolve through OpenSSH config" — the name you already chose in your ssh config, not an IP to remember. `source` splits targets into two kinds: `ssh-config` targets are synced back from the config on every import — change a port, change a user, add a jump host, and the target follows; `manual` targets are never overwritten by import. Line 208 is the bridge to the previous post: a remote PTY lease carries a `worktreeId` — the remote shell is attached to one specific worktree, not floating loose.

The two middle lines answer "what happens when a target is removed". The code comment states it plainly:

> "Repos store only the target id, so without this record the old workspaces are stranded on a dead id when the target is removed."

*Source: src/shared/ssh-types.ts, the comment on the `RemovedSshTargetTombstone` type, retrieved 2026-09-08.*

The tombstone records `oldTargetId` together with `configHost` — the alias, the most stable re-adoption key — so re-adding the same host re-points the old repos and worktrees to the new target instead of stranding them on a dead id. The same thinking gives every target a `generation` that advances only on create, delete, or re-adopt — the test named "never reissues a generation an automation already captured" in src/shared/ssh-target-generation.test.ts states the purpose exactly: an automation fenced on one generation is not fooled by another target that happens to reuse the id.

## Errors must be readable: one commit, three fixes

The SSH transport is where failures turn into guesswork: authentication stalls mid-way, clones fail without saying why, connections land on the wrong host. Commit `278f9ee876` — "fix(ssh): answer every MFA stage, stop dialling an unclaimed alias, and say where a clone failed (#17946)" — targets exactly those three shapes:

```bash
$ git -C ~/Desktop/projects/orca show 278f9ee876 --stat | tail -13
 src/main/ssh/ssh-config-alias-claim.test.ts        |  80 +++++++
 src/main/ssh/ssh-config-alias-claim.ts             | 103 +++++++++
 src/main/ssh/ssh-config-parser.ts                  |  40 ++++
 src/main/ssh/ssh-connection.ts                     |  10 +-
 .../ssh/ssh-multi-factor-authentication.test.ts    | 251 +++++++++++++++++++++
 src/main/ssh/ssh-multi-key-authentication.test.ts  |  69 +++++-
 src/main/ssh/ssh-private-key-authentication.ts     |  43 +++-
 src/main/ssh/ssh-system-fallback.test.ts           |  46 ++++
 src/main/ssh/system-ssh-args.ts                    |  41 ++++
 src/shared/git-clone-failure-message.test.ts       |  55 +++++
 src/shared/git-clone-failure-message.ts            |  45 ++++
 11 files changed, 770 insertions(+), 13 deletions(-)
```

*Source: `git show` in a checkout of the orca product repo, retrieved 2026-09-08; home path shortened to `~`.*

**Multi-stage MFA.** The ssh2 library walks one flat auth-method list exactly once — `keyboard-interactive` could only ever be offered a single time. A host running `AuthenticationMethods keyboard-interactive,keyboard-interactive` partial-succeeds the first stage and then finds the list exhausted, and the user sees "All configured authentication methods failed" — the substance of issues #8622 and #16820. The fix: Orca's auth handler now runs for every target, rebuilds its queue on each partial-success failure the host reports, narrowed to the methods the host still offers. That narrowing also stops keys being re-offered after the host has moved past publickey — the re-offering that exhausted `MaxAuthTries` before the MFA challenge was ever shown. The commit includes a fixture: a real ssh2 server staging partial success, covered by the 251-line test file inside the commit itself.

**The alias nobody claims.** A wildcard `Host *` block supplies ProxyCommand/ProxyJump for every alias. If the alias's own Host block was renamed or deleted, the app still dialled that alias verbatim — no `-l`, no `-p`, no `Hostname` — and connected as the wildcard's user to the wildcard's host, silently discarding the stored endpoint (issue #11746). The fix contains a decision worth learning from: the claim check is sound in the negative direction only — an unreadable config file, any `Match` block, or any non-catch-all pattern answers "claimed", meaning "not sure". Only a proven-unclaimed alias licenses the Hostname/Port/User override — and the override states exactly those three, so the wildcard remains the route and `%h` still expands to the host we mean.

**A failed clone must say where it broke.** Clones run in a non-interactive environment: `ssh` with `BatchMode=yes` and an emptied `SSH_ASKPASS`. On a remote clone that surfaces as `fatal: Could not read from remote repository.` — while typing the very same command by hand on that very machine succeeds (issue #14533). The old message never said the clone ran on another machine, under that machine's keys, with the prompt deliberately disabled. The fix: `getGitCloneFailureMessage` appends exactly that fact and names the two recognisable shapes — a publickey refusal (load the key into an agent there) and a host-key failure (record the key in that machine's known_hosts). One builder, so both the relay path and the runtime path get the same message.

And here is the proof the three fixes reached users — the commit sits inside release tags:

```bash
$ git -C ~/Desktop/projects/orca tag --contains 278f9ee876
mobile-android-v0.0.48
v1.4.198
v1.4.199
```

*Source: `git tag --contains` in a checkout of the orca product repo, retrieved 2026-09-08.*

v1.4.198 was the first release to carry the Wakii name; the highlights line reads, verbatim: "Everything new from stablyai/orca — parallel worktrees, terminal splits, GitHub & Linear native, SSH worktrees, mobile companion."

*Source: v1.4.198 release notes, wakii-dev/wakii repo on GitHub, retrieved 2026-09-08.*

## Real limitations, read from the code

The commit's own message scopes the fixes, verbatim: "Scoped to the system-SSH transport and the connection's own command/transport path. Port-forward processes and the ssh2 transport (#11707) are unchanged." The three fixes above belong to the system-SSH path; no promises are made for the other paths. The comments in ssh-types.ts scope two more limits:

```ts
/** Whether the host's SSH config explicitly requests GSSAPIAuthentication
 *  (Kerberos). ssh2 has no gssapi-with-mic support, so these targets try the
 *  system OpenSSH transport first. */
gssapiAuthentication?: boolean
```

```ts
/** Folder downloads require ssh2 SFTP and are unavailable on system SSH. */
supportsFolderDownload?: boolean
```

*Source: src/shared/ssh-types.ts, comments on `SshTarget` and `SshConnectionState`, retrieved 2026-09-08.*

Read out, that is three honest conditions. A host that wants Kerberos goes through the system OpenSSH transport, because the ssh2 library has no gssapi-with-mic support. Folder downloads need ssh2's SFTP, so they are unavailable on the system-SSH path. And the alias mechanism depends on the machine's `~/.ssh/config` — the commit explains why `ssh -G` cannot be asked instead: it prints the merged config and answers for unknown aliases too, so it cannot serve as the signal for "is this alias still claimed". When uncertain, answer "claimed" — a deliberate design choice, more trustworthy than a confident heuristic.

## Connectivity is transport; isolation is structure

The two posts meet at one principle: isolation is a disk structure, not a UI promise — and a disk structure needs a trustworthy connection before there is anything to isolate. Local worktrees solve the half that happens in the room; SSH worktrees solve the other half: a repo on another machine still gets the one-task-one-directory rule, with a tombstone to survive the target lifecycle and a generation so automations never mistake a recycled target.

Read the local worktree mechanism first: [real parallelism through worktree isolation](/blog/parallel-worktrees-isolation/). To connect your first remote machine: the [getting started](/docs/getting-started/) page walks the first steps. Or see it for yourself: open `~/.ssh/config`, pick an alias you use every day — Wakii imports it as a target, and the first worktree on the remote machine is one add away.
