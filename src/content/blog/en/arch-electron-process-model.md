---
title: "Wakii's Electron process model"
description: "How Wakii splits main, preload and renderer, seen in real code: where the sandbox flags live, what the 79 bridge contracts expose, and why renderer code has no Node.js."
pubDate: "2026-09-24"
category: "tech"
tags: ["architecture", "electron"]
draft: false
heroImage: "/blog/heroes/arch-electron-process-model.png"
---

Every Electron app runs at least three processes in parallel: a main process that holds OS privileges, a renderer that draws the UI, and a preload script standing between them. Most Electron security stories start from the same mistake: the renderer is given too much power. Wakii runs the other direction — the renderer lives in a sandbox with no Node.js, privileges are consolidated in the main process, and the path between the two sides is a typed contract you can read. This post walks each boundary with the actual code from the public repo `wakii-dev/wakii`; every path cited below points to a real file you can open and check line by line.

TL;DR:

- The main process holds every OS privilege — files, shell, keychain, child processes; the renderer is just a sandboxed web page.
- The main window is created with `sandbox: true`; guest windows (embedded web content) spell out the full contextIsolation, nodeIntegration, sandbox set.
- The renderer never imports `electron` — it calls `window.api`, an object the preload exposes via `contextBridge`, made of 79 bridges split by domain.
- Both sides of the IPC share one set of TypeScript types in `src/shared`, with the preload side pinned by `satisfies PreloadApi`.

## Three processes, three levels of privilege

The main process is a real Node.js program: it reads and writes files, spawns child processes, talks to the keychain, opens sockets, creates windows. The renderer is Chromium — in privilege terms it is no more than a sandboxed browser tab: what it can touch on the system is close to nothing. The preload is special: a script that runs inside the renderer process, before the web page, with exactly one narrow privilege — access to a few Electron APIs so it can translate, but still no Node.js.

Calls move in one controlled direction. UI code never opens a file by itself; it calls a function on `window.api`, the preload turns that into an IPC message, the main process receives it, decides, and resolves a Promise back.

```ascii
        ┌───────────────────────────────────────────────┐
        │                PROCESS MAIN                   │
        │  Full Node.js: files · shell ·                │
        │  keychain · child processes · network         │
        │  ipcMain.handle("domain:action", ...)         │
        └───────────────────▲───────────────────────────┘
                            │  IPC (invoke / reply)
┌───────────────────────────┴───────────────────────────┐
│                PROCESS RENDERER                       │
│  Chromium sandbox — no Node.js                        │
│                                                       │
│   UI code ──calls──▶ window.api ──▶ preload (translates)
│              window.api = contextBridge               │
└───────────────────────────────────────────────────────┘
```
*Diagram summarizes `src/main/index.ts` (main process) and `src/preload/index.ts` (exposing `window.api`) — public repo `wakii-dev/wakii`, captured 2026-09-08.*

The most important part of the diagram is the arrow's direction: from the renderer there is no path to OS resources — files, shell, keychain — that does not pass through a handler the main process registered itself. A web page in the renderer can fetch from the internet like any web page, but opening a file on your machine requires asking.

## The main window: security flags right where the window is created

`src/main/window/createMainWindow.ts` is where everything starts. The `webPreferences` of the main window, verbatim:

```ts
// src/main/window/createMainWindow.ts
webPreferences: {
  preload: join(__dirname, '../preload/index.js'),
  sandbox: true,
  webviewTag: true,
  // Why an argument and not an IPC read: this is the window whose webviews host browser guests,
  // and it has to know that before it interprets its first session snapshot — earlier than any
  // handler registration it could wait on.
  additionalArguments: [formatBrowserClientHostIdArgument(getBrowserClientHostId())]
}
```
*Source: public repo `wakii-dev/wakii`, captured 2026-09-08.*

`sandbox: true` is the line worth staring at. Since Electron 20, renderers are sandboxed by default, and Wakii runs on Electron 43 — so why write it out? Because a default is a default: an explicit line does not depend on whether the default changes in a future Electron release. It is the same spirit as the "defensive by design" habits [covered in an earlier post](/blog/defensive-by-design/).

Right below that block sits a second, subtler boundary: after the window is created, the code calls `setTrustedUIRendererWebContentsId`, passing it the main window's `rendererWebContentsId` — with the original comment "native paste fallback is privileged IPC; only the top-level renderer may request it". Even among privileged IPCs there is a finer tier: only the main window's webContents — not a child webview — may ask.

Guest windows declare things even more bluntly, all six flags:

```ts
// src/main/browser/browser-manager-types.ts
// Why: Electron applies these before createWindow; feature strings/opener inheritance
// must not relax the child's isolation.
webPreferences: {
  allowRunningInsecureContent: false,
  contextIsolation: true,
  nodeIntegration: false,
  nodeIntegrationInSubFrames: false,
  sandbox: true,
  webviewTag: false
}
```
*Source: public repo `wakii-dev/wakii`, captured 2026-09-08.*

Even the origin bar — the strip of UI drawn on top of popup content — carries its own `contextIsolation`, `nodeIntegration`, `sandbox` set in `src/main/browser/popup-origin-bar-window.ts`, so the app's own display data never shares a context with arbitrary web content underneath.

## Preload: a contract, not a back door

If the preload just exposed the raw `ipcRenderer`, the boundary above would be cosmetic. `src/preload/index.ts` does not do that: it assembles `api` from 79 bridges split by domain (count: `grep -c "from './api/" src/preload/index.ts`, captured 2026-09-08) — git, Linear, filesystem, update and so on — then exposes exactly two objects:

```ts
// src/preload/index.ts (end of file)
} satisfies PreloadApi

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
```
*Source: public repo `wakii-dev/wakii`, captured 2026-09-08.*

Two small details carry a lot of weight. First, `satisfies PreloadApi`: the `api` object is forced to match an aggregate type defined in `src/preload/api-types.ts` — exposing a function without declaring its type breaks the build, before anything runs. Second, the renderer never sees `ipcRenderer`; it only sees typed functions, each one turning into a named invoke call. A mistyped function name is a compile error, not a runtime failure at midnight.

## One set of shared types for both ends of the wire

IPC is, underneath, strings on a wire — no compiler checks that two processes agree, unless both import the same type file. Wakii keeps that shared set in `src/shared`: 1,595 .ts files at the time of writing, including tests (counting command: `ls src/shared | grep -c '\.ts$'`, captured 2026-09-08).

| Contract | File (under `src/`) | Travels from where to where |
| --- | --- | --- |
| `UpdateStatus` | `shared/update-status-types.ts` | main process pushes update state → renderer draws the card |
| `ReleaseChannel` | `shared/release-channel.ts` | main ↔ renderer: stable / rc / hourly / daily / adhoc channel choice |
| `PreloadApi` | `preload/api-types.ts` | preload → renderer: the type of the whole `window.api` |

*Source: public repo `wakii-dev/wakii`, captured 2026-09-08.*

The first row of the table travels the full lifecycle: when an update is found, the main process sends an `UpdateStatus` object to the renderer; both sides import the type from exactly one file. Change the type's shape and both break at compile time — breaking exactly where it should. The main-process side of that update flow deserves its own post: [the auto-update feed, from release to your machine](/blog/arch-auto-update-feed/).

## Beyond three processes: daemon, sidecar, worker

The three processes in the title are just the base; the entry list in `electron.vite.config.ts` is much longer:

```ts
// electron.vite.config.ts (excerpt)
input: {
  index: resolve('src/main/index.ts'),
  'daemon-entry': resolve('src/main/daemon/daemon-entry.ts'),
  'computer-sidecar': resolve('src/main/computer/sidecar-entry.ts'),
  'stt-worker': resolve('src/main/speech/stt-worker.ts'),
  // Why: forked with ELECTRON_RUN_AS_NODE so @parcel/watcher faults
  // can't take down the main process (issue #7547).
  'parcel-watcher-process-entry': resolve('src/main/ipc/parcel-watcher-process-entry.ts'),
  // Why: a worker thread survives the macOS 26 AppKit main-thread deadlock
  // without paying for another Electron process.
  'main-thread-hang-watchdog-entry': resolve(
    'src/main/hang-watchdog/main-thread-hang-watchdog-entry.ts'
  )
}
```
*Source: public repo `wakii-dev/wakii`, captured 2026-09-08.*

Each entry solves a specific problem. The daemon is built outside app.asar (asar-unpacked) because Node's `child_process.fork()` cannot execute a file inside an asar archive — the comment in the config spells this out. The parcel watcher is forked with `ELECTRON_RUN_AS_NODE` so a fault in the file-watching library cannot take down the main process. The hang watchdog runs in a worker thread so it can survive exactly the thing it watches for: the main process's event loop freezing — that mechanism has [its own post](/blog/watchdog-idle-is-not-dead/).

And the relay — the remote-control channel this series keeps returning to — is not a separate process at all: it runs inside the main process. `src/main/runtime/runtime-rpc/runtime-rpc-state.ts` imports `RelayRevokeOutbox` from `../relay/relay-revoke-outbox` — the runtime-level relay module under `src/main/runtime/relay`, not the top-level `src/relay` directory. Running in main means the relay inherits exactly the main process's privilege level, and is fenced behind the same preload/renderer boundary this post just walked.

For the product-level questions — what Wakii is, how it differs from upstream Orca, how it is licensed — the [FAQ](/docs/faq/) holds the short answers. To browse the full bridge list yourself, open `src/preload/api/` in the public repo — one file per contract. And to see the three processes cooperate in one real flow, [the auto-update lifecycle post](/blog/arch-auto-update-feed/) goes from GitHub Releases to the relaunch button inside the app.
