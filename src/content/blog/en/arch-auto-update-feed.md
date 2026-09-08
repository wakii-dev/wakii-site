---
title: "The auto-update feed, from release to your machine"
description: "The full update lifecycle in real code: version-named release assets, a 24-hour main-process check, feed pinning to a concrete tag, and safe quit-and-install."
pubDate: "2026-09-27"
category: "tech"
tags: ["architecture", "release"]
draft: false
---

The "Download" button on this site is only the first half of the story. The other half begins once the app is on your machine: how it learns a new version exists, why a release being published mid-rollout never hands anyone a half-uploaded file, and which gates stand between "update available" and "installed". All of Wakii's auto-update code lives in the public repo `wakii-dev/wakii`; this post follows the full lifecycle of one update — from GitHub Releases to the relaunch button in the app.

TL;DR:

- Each release is a tag plus per-platform manifests (latest-mac.yml, latest.yml…) and version-named assets — the version number sits right in the file name.
- The app checks the feed every 24 hours; the timer lives in the main process, so it does not depend on the app being reopened.
- Seeing a newer tag, the updater does not follow the "latest" URL — it pins the concrete tag and probes that tag's manifest first, so nobody downloads a release that is still mid-upload.
- Installing has its own gates: macOS waits until the installer is ready before quitting; a Linux install owned by the system package manager gets its download blocked with an explicit error.

## What a release is: a tag, manifests, version-named assets

Start on the repository side. A Wakii release on GitHub Releases looks like this:

```ascii
$ gh release list --repo wakii-dev/wakii --limit 3
Wakii 1.4.199	Latest	v1.4.199	2026-09-05T19:07:31Z
Wakii 1.4.198		v1.4.198	2026-09-05T12:47:15Z
Orca Mobile Android mobile-android-v0.0.48	Pre-release	mobile-android-v0.0.48	2026-09-05T13:00:31Z

$ gh release view v1.4.199 --repo wakii-dev/wakii --json assets --jq '.assets[].name'
app-release.apk
latest-mac.yml
latest.yml
orca-windows-setup.exe
orca-windows-setup.exe.blockmap
Wakii-1.4.199-arm64.dmg
Wakii-1.4.199-local.1788637424492.96e3bc586254-arm64-mac.zip
Wakii-1.4.199-local.1788637424492.96e3bc586254-mac.zip
Wakii-1.4.199-x64.dmg
```
*Read-only `gh` commands against the public repo `wakii-dev/wakii`, captured 2026-09-08.*

Three kinds of files in that listing are worth separating. The macOS download assets carry the version in their names — `Wakii-1.4.199-x64.dmg` — while every asset URL is pinned by tag, so a link alone tells you which release it points at, no guessing. The two `.yml` files are manifests: `latest-mac.yml` for macOS, `latest.yml` for Windows. Those manifest names are not a convention someone memorized; the updater picks them by platform:

```ts
// src/main/updater-prerelease-feed.ts
function getPlatformManifestName(): string {
  if (process.platform === 'darwin') {
    return 'latest-mac.yml'
  }
  if (process.platform === 'linux') {
    return 'latest-linux.yml'
  }
  return 'latest.yml'
}
```
*Source: public repo `wakii-dev/wakii`, captured 2026-09-08.*

A manifest is the table of contents of a release: the version, the asset file name, the checksum. The updater works with the (tag, manifest) pair — not with a vague notion of "the newest one".

## A 24-hour check, living in the main process

Now the user's machine. Two constants open `src/main/updater-events.ts`:

```ts
// src/main/updater-events.ts
const AUTO_UPDATE_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000
const AUTO_UPDATE_RETRY_INTERVAL_MS = 60 * 60 * 1000
```
*Source: public repo `wakii-dev/wakii`, captured 2026-09-08.*

Once a day, and when a check fails it retries after an hour — doubling on each consecutive failure (the logic lives in `src/main/updater/updater-scheduling.ts`) until it hits the cap. Why does the timer live in the main process rather than the renderer? The comment in `updater-scheduling.ts` answers for me: "Orca runs for days, so keep the next background check scheduled in the main process rather than tying it to relaunches or renderer lifetime." People leave the app open for a week; the check has to outlive any window.

Beyond the automatic loop there is a manual check from the app menu — the handler lives in `src/main/updater/updater-menu-checks.ts`; the menu item is registered in `src/main/menu/register-app-menu.ts`, and the callback wired in `src/main/startup/main-process-i18n-menu.ts` routes the click into that handler.

## Pinning the feed to a concrete tag: the publishing window trips nobody

Here is the most interesting part: while a release is being published, the atom feed can already list the tag while its manifest is still uploading. If the updater read the feed and then followed the "latest" URL, it could read one release's manifest and download a different release's asset. The code resolves the tag itself and pins it — the verbatim docstring from `src/main/updater-prerelease-feed.ts`:

```ts
/**
 * Walks the GitHub releases atom feed and returns the tag of the newest
 * release strictly greater than `currentVersion`.
 *
 * Why: electron-updater's GitHubProvider filters the feed by channel, and
 * GitHub's /latest/download redirect can move between check and download.
 * By resolving the newest tag ourselves and pinning the generic provider at
 * `/releases/download/<tag>`, the manifest and downloaded asset stay tied to
 * the same release.
 */
```
*Source: public repo `wakii-dev/wakii`, captured 2026-09-08.*

The pinned URL is assembled from the tag: `getReleaseDownloadUrl(tag)` joins `RELEASES_DOWNLOAD_BASE` with the encoded tag — exactly `…/releases/download/v1.4.199`. Before pinning, the updater also probes that tag's manifest:

```ts
// src/main/updater-prerelease-feed.ts
export type FetchNewerReleaseTagsResult =
  | { tags: string[]; state: 'ready' }
  | { tags: string[]; state: 'no-newer' }
  | { tags: string[]; state: 'not-ready'; lastGoodTag?: string }
  | { tags: string[]; state: 'unavailable'; unavailableReason: 'feed' | 'manifest' }
```
*Source: public repo `wakii-dev/wakii`, captured 2026-09-08.*

The four states tell the whole story of the "publishing window": `ready` — the newer tag has a manifest, safe to pin; `not-ready` — the feed shows the tag but the manifest is not up yet, and the type carries `lastGoodTag` so the updater can fall back to the last known-good tag instead of erroring; `unavailable` — the feed or the manifest is broken, skip this check and try again later.

```ascii
t0   release v1.4.199 is published
     ├── atom feed lists the new tag
     └── assets mid-upload (dmg done first, manifest not yet)
                        │
t1   user machine (running v1.4.198) does its periodic check
     read atom feed → v1.4.199 is newer
     probe the tag's manifest: …/download/v1.4.199/latest-mac.yml
     ├── not ready yet → keep last-good, schedule the next check
     └── ready         → pin feed = …/download/v1.4.199 → "update available"
                        │
t2   download manifest + asset from the pinned tag → "ready"
                        │
t3   quit-and-install: renderer flushes → quit → installer → relaunch
```
*Assembled from `src/main/updater-prerelease-feed.ts`, `src/main/updater-events.ts`, `src/main/updater/updater-download-install.ts` — public repo `wakii-dev/wakii`, captured 2026-09-08.*

One honest note: Wakii is a fork, and the feed constant in the source file points at the upstream repo's atom feed — untouched since the fork, the context of which [the staying-current-with-upstream post](/blog/forking-an-ide-keeping-current-with-upstream/) already covers. The takeaway is the mechanism: a feed only has to answer with two things — tags and manifests — and every client-side decision rides on that pair, independent of any host.

## From "ready" to "installed": the gates before the app quits

A finished download does not install on the spot. The first gate is timing: instead of calling `quitAndInstall` from inside the running IPC flow, the updater defers by a tick:

```ts
// src/main/updater/updater-download-install.ts
// Why: defer the quit a tick so the renderer can flush dismissals/state before windows start closing.
this.pendingQuitAndInstallTimer = setTimeout(() => {
  void this.performQuitAndInstall()
}, QUIT_AND_INSTALL_DELAY_MS)
```
*Source: public repo `wakii-dev/wakii`, captured 2026-09-08.*

On macOS, installer state is tracked separately in `src/main/updater-mac-install.ts` (see `isMacInstallerReady`) so the app does not quit before the installer is actually ready. On Linux, when the current install is owned by the OS package manager, the updater blocks the download outright and returns a coded error — with a blunt comment:

```ts
// src/main/updater/updater-download-install.ts
// Why: main owns this verdict, not the card — an older renderer or a direct IPC call must not be
// able to spend a package download that this host could never install.
if (isExternallyManagedLinuxInstall()) {
  recordUpdaterLifecycle('linux_package_externally_managed_download_blocked', {
    version
  })
```
*Source: public repo `wakii-dev/wakii`, captured 2026-09-08.*

That comment is this whole layer's philosophy in two sentences: the verdict belongs to the main process, not to a UI card — an older renderer or a direct IPC call must not be allowed to burn a package download this machine could never install. And when the app is running in headless serve mode, the `deferHeadlessServeInstall` gate in `src/main/updater/updater-install-execution.ts` defers the install, so a running serve session is not cut mid-flight.

The gates, summarized:

| Situation | What the updater does | Where it is decided |
| --- | --- | --- |
| Renderer has an IPC reply in flight | defer quit a tick, then install | `updater-download-install.ts` |
| macOS installer not ready yet | track state, quit after | `updater-mac-install.ts` |
| Linux install owned by package manager | block download, coded error | `updater-download-install.ts` |
| App serving headless | defer install, keep the session | `updater-install-execution.ts` |

*Source: public repo `wakii-dev/wakii`, captured 2026-09-08.*

State after each step reaches the renderer as one `UpdateStatus` object — the same shared contract tabled in [the process-model post](/blog/arch-electron-process-model/); the update card even knows how many releases you are behind, via the `releasesBehind` field in that same file. Why two releases in one day is [the shipping-cadence story](/blog/shipping-cadence-two-releases-one-day/); this post only asked the other question: once a tag is published, every step on your machine has a gate. To check which version you are running, the [getting-started guide](/docs/getting-started/) walks through it — and the newest build is always on the [downloads page](/download/).
