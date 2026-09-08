---
title: "Installing and updating Wakii from zero"
description: "From an empty machine to a running app: check Node 24, pnpm and git, grab the version-named prebuilt download, understand what the first launch installs by itself — and always know exactly which release you are running."
pubDate: "2026-09-19"
category: "tutorial"
tags: ["guide", "release", "wakii"]
draft: false
---

Install guides usually stop at "download and open". For a tool that runs agents
against real repositories, the useful questions come after that: what does the
machine need beforehand, where do builds live, what happens by itself on first
launch, and how do you know which release you are running when you need to
compare behavior across versions. This post walks all of it for Wakii — from
checking the environment on an empty machine to tracking new releases on GitHub
Releases — with real commands you can repeat on your own machine.

TL;DR:

- Before installing: Node.js 24, pnpm, and git — two commands, ten seconds.
- The prebuilt build comes from the download page or GitHub Releases; asset
  filenames carry the exact version, for example `Wakii-1.4.199-arm64.dmg`.
- On first launch, the workflow kit installs itself into `~/.claude/` — there
  is no step for you to type.
- To look inside: clone, `pnpm install`, `pnpm dev`. Track new releases on the
  Releases page; every number in this post was captured on 2026-09-08.

## Check first: three things the machine needs

Wakii is a desktop app, but the build-from-source path needs three things:
Node.js 24, pnpm 12, and git — exactly as the getting started page states. The
fastest check is two commands:

```bash
$ node --version
v24.10.0
$ pnpm --version
10.19.0
```

*Source: `node --version` and `pnpm --version` run on the machine this post was
written on, retrieved 2026-09-08.*

Those numbers belong to the writing machine. Yours does not have to match them —
it only has to meet the bar the docs state: Node 24, pnpm 12. How you get there
does not matter: install from nodejs.org, or use whatever version manager you
already run. git usually ships with a dev machine; `git --version` is enough to
confirm it. Ten seconds of checking is much cheaper than an afternoon of
debugging an old pnpm.

## The prebuilt install: assets named by version

The fastest path is the site's download page — it always points at the current
build. For the fuller picture, including older releases, open the GitHub
Releases of the wakii-dev/wakii repo. The current release at the time of
writing is v1.4.199 (tagged Latest), and its assets split by platform:

```bash
$ gh release view v1.4.199 --repo wakii-dev/wakii --json assets --jq '[.assets[].name]'
[
  "app-release.apk",
  "latest-mac.yml",
  "latest.yml",
  "orca-windows-setup.exe",
  "orca-windows-setup.exe.blockmap",
  "Wakii-1.4.199-arm64.dmg",
  "Wakii-1.4.199-x64.dmg"
]
```

(trimmed — the two macOS `.zip` assets omitted)

*Source: `gh release view v1.4.199 --repo wakii-dev/wakii`, retrieved 2026-09-08.*

macOS ships two DMGs split by CPU architecture — arm64 for Apple Silicon, x64
for Intel — and the filename carries the exact version. Windows uses
`orca-windows-setup.exe`. Linux has no prebuilt asset in this release — the
list above is the complete set — so Linux machines take the build-from-source
path below.

The detail worth remembering: because assets are named by version, every
release keeps its own complete set of assets on the Releases page. Need to go
back to an older build to compare behavior? That release's links still work.
The download page always points at the newest one — the two places serve two
different needs, and knowing that avoids the most common install stumble
(covered in its own section below).

## First launch: the kit installs itself, you type nothing

This is the shortest section of the post — because there is nothing to do. The
docs put it in one sentence, quoted verbatim:

> "On first launch the workflow kit — the skills, agent definitions, and
> `story-*` command-line tools — installs itself into `~/.claude/` automatically.
> It stays in sync with the app and never duplicates your local config."

*Source: getting started docs (EN), section "First run — nothing to set up",
retrieved 2026-09-08.*

The kit is idempotent: run first launch as many times as you like, nothing gets
duplicated and nothing existing gets clobbered. The mechanics behind that
self-install already have a post of their own — [your first agent team ships
with zero setup](/blog/zero-setup-agent-team/) — this post only keeps the part
you need while installing: there is no step for you.

One small note for macOS: on the very first open, the OS may ask you to confirm
before running the app — normal behavior for an Electron application, not a
sign that something is wrong.

## Building from source: clone, install, dev

When do you need this path? Three situations: you want to read or change the
source; your platform has no prebuilt asset (Linux, in the current release);
or you want the dev build with hot reload to watch changes land live. The
commands, taken from the getting started docs:

```bash
git clone <repo-url> wakii
cd wakii
pnpm install

pnpm dev        # dev build with hot reload

pnpm build      # or build for production
pnpm start      # then launch the built app
```

*Source: commands as written in the getting started docs, steps 1–3, retrieved
2026-09-08.*

The first `pnpm install` takes a few minutes because it also builds the native
modules — the terminal emulation and file watching pieces — for your platform.
Later runs are much faster. The repo URL is the GitHub link in the site footer.
Why does this project build in the open, release by release, including the
unfinished ones? [Building Wakii in the open — log
1](/blog/building-wakii-in-the-open-log-1/) starts that story from day one.

## Tracking new releases: Releases is the source of truth

Inside the app, update checking lives under Settings → General — the Check for
Updates button checks whenever you want. The source of truth for every release
is still GitHub Releases, and you do not need a browser to read it:

```bash
$ gh release list --repo wakii-dev/wakii --limit 5
Wakii 1.4.199	Latest	v1.4.199	2026-09-05T19:07:31Z
Wakii 1.4.198		v1.4.198	2026-09-05T12:47:15Z
Orca Mobile Android mobile-android-v0.0.48	Pre-release	mobile-android-v0.0.48	2026-09-05T13:00:31Z
```

*Source: `gh release list --repo wakii-dev/wakii`, retrieved 2026-09-08.*

Reading the table: the label column tells you which release is Latest; the
publish date sits in the last column. Two desktop releases landed on the same
day, 2026-09-05 — v1.4.198 at 12:47 and v1.4.199 at 19:07, a few hours apart.
Two releases in one day is not a fluke; [the post on shipping two releases in
one day](/blog/shipping-cadence-two-releases-one-day/) dissects that exact day.
The third row is the Android mobile app, tagged Pre-release — that app line
ships on its own cadence, separate from desktop.

## Three common stumbles during install

| Symptom | Cause | Fix |
|---|---|---|
| Asset link returns 404 | "latest"-style URLs must match the exact filename, and filenames carry the version — a new release breaks the old link | Take the link from the download page, or from the release page of the exact build you need |
| Unsure which release is newest | The Releases page mixes old releases and the mobile build in one list | The "Latest" label is the answer; the mobile app carries its own Pre-release tag |
| macOS asks for confirmation on first open | Normal behavior for an Electron application | Confirm and continue |

*Source: assembled from the asset list quoted above (retrieved 2026-09-08) and
the install docs, Platform notes — macOS, retrieved 2026-09-08.*

The first stumble deserves one more line: version-named assets are a feature,
not carelessness — they let every release own its asset set so old links never
get overwritten. The price is that "always newest" links must go through the
download page (which the site maintains) rather than through a hardcoded
filename URL.

The whole path — from clone to first launch — lives on the [getting
started](/docs/getting-started/) page. This post adds what the docs compress:
how to read Releases, what version-named assets mean, and the small stumbles at
the start. The steps repeat identically on each new machine — there is no
special step for anyone.

Grab the build from the [download page](/download/), open Wakii, and click the
⚡ icon in the right-side activity bar — the Superpowers panel is waiting to
run your first workflow.
