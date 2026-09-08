---
title: "Jan: local-first AI assistant — the desktop app ships its own engine"
description: "Jan embeds a llama.cpp engine inside a desktop app and reaches every engine — local or cloud — through a single interface. The packaging lesson: privacy is an architectural decision, not a settings toggle."
pubDate: "2026-10-15"
category: "tech"
tags: ["architecture", "cli"]
draft: false
---

Most chat-AI applications you install on your machine are shells: the intelligence lives in the cloud, losing connectivity means losing the feature, and every question leaves your machine before it gets answered. Jan runs the other direction — the engine ships inside the app, models you download sit on your own disk, and the app keeps working without internet. The project is publicly available on GitHub with 44,380 stars (per GitHub API on 2026-09-08), and it is worth reading for two architectural decisions underneath: the app hosts its own engine, and every engine — local or cloud — passes through a single interface layer.

TL;DR:

- Jan is a desktop app that runs AI models on the user's own machine: the llama.cpp engine runs as a native plugin of the app, models downloaded from Hugging Face live in the app's data folder.
- The provider abstraction layer is the most instructive part: each engine registers itself into a registry by provider name, and the UI only calls names — adding or swapping an engine never touches the UI.
- Local engines and cloud providers inherit from the same base class; the difference is confined to headers and transport.
- "Privacy by default" is an architectural decision, not a settings toggle — the app simultaneously exposes a standard API on `localhost:1337` for other applications.
- The license is a side lesson: GitHub's API does not recognize a standard license — it reports NOASSERTION (per GitHub API on 2026-09-08) — even though a LICENSE file sits right in the tree.

## The desktop app that ships its own engine

Claiming "runs locally" is easy; packaging is the hard part. The llama.cpp engine is a native program, models are gigabyte-scale files, the UI is the web — bundling all three into an app that installs on Windows, macOS, and Linux is the problem Jan solves. The app is built on Tauri: a thin webview shell, a Rust core for anything that needs system access. The engine is not rewritten — it runs as a native Tauri plugin, and the TypeScript layer talks to it through two standard calls:

```typescript
import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/core'
```

*Source: `extensions/llamacpp-extension/src/index.ts` @ commit `dc40d7c`, per GitHub API on 2026-09-08 — [github.com/janhq/jan/blob/dc40d7c273e74a7d079f4635d93472b7fdb4ce2b/extensions/llamacpp-extension/src/index.ts](https://github.com/janhq/jan/blob/dc40d7c273e74a7d079f4635d93472b7fdb4ce2b/extensions/llamacpp-extension/src/index.ts)*

The stack reads as follows:

```
Chat UI (webview)
   │  calls the engine by provider name — no idea where the engine lives
   ▼
TypeScript extensions (llamacpp · mlx · cloud providers)
   │  invoke / listen — the IPC boundary
   ▼
Tauri core (Rust) ──► native engine plugin (llama.cpp)
   │
   ▼
GGUF model files on disk — pulled from Hugging Face, stored in the app's data folder
```

*Source: diagram cross-checked against the janhq/jan tree @ commit `dc40d7c`, 2026-09-08.*

Distribution follows the standard desktop playbook: Windows (including the Microsoft Store channel), macOS (universal dmg), Linux (deb, AppImage, Flathub) — the README lists them all, plus a separate guide for Linux arm64. "The app hosts its own engine" has a practical meaning: there is no "install an engine first" step in the docs — install the app and the engine is there, matched to the app build you are running.

## One interface for every engine

The most instructive part lives in the types layer. Every engine inherits a single base class, declares its provider name, and registers itself into a registry on load:

```typescript
export abstract class AIEngine extends BaseExtension {
  abstract readonly provider: string
  registerEngine() {
    EngineManager.instance().register(this)
  }
```

The registry is a Map keyed by provider; consumers only need the name:

```typescript
public engines = new Map<string, AIEngine>()
get<T extends AIEngine>(provider: string): T | undefined {
  return this.engines.get(provider) as T | undefined
}
```

*Source: `core/src/browser/extensions/engines/AIEngine.ts` + `EngineManager.ts` @ commit `dc40d7c`, per GitHub API on 2026-09-08 — [github.com/janhq/jan/tree/dc40d7c273e74a7d079f4635d93472b7fdb4ce2b/core/src/browser/extensions/engines](https://github.com/janhq/jan/tree/dc40d7c273e74a7d079f4635d93472b7fdb4ce2b/core/src/browser/extensions/engines)*

The consequence of the design: adding an engine means adding an extension, without touching the UI or the core. In today's tree, engines are separate packages — `llamacpp-extension`, `mlx-extension` — next to non-engine extensions like download or vector-db. Cloud providers go through the same structure: `RemoteOAIEngine` extends `OAIEngine` and only overrides the headers to attach an API key.

```typescript
export abstract class RemoteOAIEngine extends OAIEngine {
```

*Source: `core/src/browser/extensions/engines/RemoteOAIEngine.ts` @ the same commit `dc40d7c`.*

From the UI's perspective, switching from local llama.cpp to a cloud provider is changing one provider string — the screens and the conversation flow stay the same. The interface every engine implements is equally minimal: one method. Its docstring sums up the role: "Inference extension. Start, stop and inference models." — [`InferenceInterface`, core/src/types/inference/inferenceInterface.ts](https://github.com/janhq/jan/blob/dc40d7c273e74a7d079f4635d93472b7fdb4ce2b/core/src/types/inference/inferenceInterface.ts).

## Privacy as the default, not an option

The README orders its feature list deliberately: the first item is downloading and running local models from Hugging Face; the cloud-integration group comes later as an optional extra; and the privacy section closes with: "Privacy First: Everything runs locally when you want it to" ([the janhq/jan README](https://github.com/janhq/jan)).

The detail that goes beyond the slogan: the app does not keep the local capability to itself. The README states: "OpenAI-Compatible API: Local server at `localhost:1337` for other applications" (same source). A desktop app that is simultaneously a local service: the chat UI is just the first client, and the standard API turns the engine inside the app into infrastructure other tools can call. That is where "privacy" graduates from slogan to API surface — the data never has to leave the machine, while the capability stays shareable through a protocol the ecosystem already knows.

## Release cadence, with main running ahead

The 10 most recent releases span v0.7.5 (2025-12-08) to v0.8.4 (2026-07-23): steady but not compressed — the v0.8.0 → v0.8.3 cluster alone fits inside roughly a month. The table shows the five most recent:

| Tag | Release date |
| --- | --- |
| v0.8.4 | 2026-07-23 |
| v0.8.3 | 2026-06-24 |
| v0.8.2 | 2026-06-01 |
| v0.8.1 | 2026-05-29 |
| v0.8.0 | 2026-05-22 |

*Source: `gh api "repos/janhq/jan/releases?per_page=10"`, per GitHub API on 2026-09-08.*

More telling than the cadence: the latest release is over six weeks behind the research date, yet the newest commit on main lands exactly on the research date (2026-09-08) — main runs ahead of releases. A desktop app that has to build for three operating systems on every release has a good reason to split "continuous main / clustered releases": a release is a packaging and testing event, not the rhythm of writing code.

## The license label and the truth in the tree

The jan tree contains a LICENSE file whose grant reads: "Licensed under the Apache License, Version 2.0 (the \"License\");" ([the LICENSE file @ commit `dc40d7c`](https://github.com/janhq/jan/blob/dc40d7c273e74a7d079f4635d93472b7fdb4ce2b/LICENSE)). Yet GitHub's API does not recognize a standard license — it reports NOASSERTION (per GitHub API on 2026-09-08), most likely because the file header was modified to name the project instead of keeping the standard template the detector matches against. This post therefore calls jan publicly available on GitHub and does not assign a license label on the platform's behalf; the safe way to read it is to check both sources — the API label and the text in the tree. This is also where Wakii chose clarity from the start: the public `wakii-dev/wakii` repo keeps the MIT inherited from its fork — the story of choosing and declaring a license where it is easy to find has [its own post](/blog/oss-why-fork-mit/).

The numbers, per GitHub API on 2026-09-08:

| Metric | Value |
| --- | --- |
| Stars | 44,380 |
| Forks | 3,012 |
| License (GitHub API) | NOASSERTION — no standard recognition |
| Latest main commit | 2026-09-08 — the research date itself |

*Source: `gh api repos/janhq/jan`, per GitHub API on 2026-09-08.*

If you want a software process with clear gates and evidence for your agent team, [Wakii's getting-started docs](/docs/getting-started/) are the place to begin.

## What Wakii learns

- **ADOPT — privacy as the architectural default.** Jan keeps the engine and conversation data inside the app; Wakii has followed the same principle from day one: the kit installs itself into `~/.claude/` on first run, stories happen in local worktrees on the machine. Concrete proposal: put "nothing leaves the machine by default" on the review checklist for new features — any feature that needs the cloud must state why in the plan.
- **DIRECTION — a provider registry keyed by name.** The EngineManager registers engines by `provider` and consumers only call the name; swapping an engine never touches the UI. Wakii currently runs a single backend family for its agents; this abstraction is worth putting on the roadmap when a second backend becomes necessary — so agent and skill definitions do not change when the model does.
- **WATCH — Tauri as an alternative packaging path.** Jan builds its desktop shell on Tauri (Rust + system webview); the Wakii desktop app uses Electron — [the process-model analysis](/blog/arch-electron-process-model/) covers that choice. The condition to promote this to DIRECTION: when Electron's bundle size or memory footprint becomes a measurable pain point.
- **N/A — maintaining an inference engine.** llama.cpp bindings, GPU offload, quantization: inference infrastructure is not Wakii's surface — Wakii orchestrates agents, it does not run models itself.

Want an agent team with gates, evidence, and a verifiable process like that? Try Wakii — the latest installers and the upgrade guide live in [the install-and-update guide](/blog/guide-install-update/).
