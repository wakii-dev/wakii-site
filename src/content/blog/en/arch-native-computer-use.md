---
title: "Computer-use architecture: from intent to UI action"
description: "This post dissects Wakii's computer-use pipeline in the public repo: an agent decides an action, something validates its parameters, an OS-specific native module executes it, and the outcome is evidenced before it travels back to the agent."
pubDate: "2026-09-25"
category: "tech"
tags: ["architecture", "agents", "electron"]
draft: false
---

When an agent decides to "click button X" on your desktop, that decision is not a click. Between the intent and the pixel sits a whole pipeline: parameters must pass validation, a provider must be selected for the operating system, a native module must execute in its own process, and the outcome must be evidenced before it is reported back. This post walks that pipeline through the real code in the public `wakii-dev/wakii` repo — the `src/main/computer/` and `native/` directories — so you can see exactly which boundary sits where.

TL;DR:

- Every action passes a parameter-validation layer before touching the UI: click needs `elementIndex` or an `x`/`y` pair, and you may not pass both `windowId` and `windowIndex`.
- The provider is chosen per OS: Swift on macOS 14+, PowerShell with UIAutomation on Windows, Python with AT-SPI on Linux.
- The native module runs in a separate process and speaks over a Unix socket with a token — the app's main process never touches the OS accessibility API itself.
- Every action result carries a verification label: `verified` when evidence can be read back, or `unverified` with a specific reason.

## The first layer: validation

The entry point of the pipeline is not an OS API but a plain TypeScript function. `validateComputerProviderActionParams` in `src/main/computer/computer-provider-action-validation.ts` takes a method and a raw parameter dict, and refuses to return when something is missing. Its rules are concrete per case:

| Method | Required validation |
| --- | --- |
| `click`, `scroll` | `elementIndex` or a complete `x`/`y` pair — half of either is rejected |
| `typeText` | `text` is a non-empty string |
| `pasteText` | paste content goes through dedicated checks (`computer-clipboard-paste-validation.ts`) |
| `pressKey`, `hotkey` | key combos validated against a shared key spec |
| `setValue` | `elementIndex` ≥ 0 and a `value` string (empty allowed) |
| all methods | `windowId` and `windowIndex` may not both be present |

*Source: src/main/computer/computer-provider-action-validation.ts, public repo wakii-dev/wakii, retrieved 2026-09-08.*

Errors are not thrown as generic exceptions but as `RuntimeClientError` with the code `invalid_argument` and a message naming the violated case. Placing validation at the head of the pipeline has a design consequence: the provider below never has to defend against junk parameters, and the agent above receives a structured error it can read to repair its own intent.

## Choosing a provider per operating system

Next, `ComputerProviderLifecycle` decides who executes. The selection logic fits in one availability function:

```ts
export function shouldUseMacOSNativeProvider(): boolean {
  return (
    process.platform === 'darwin' &&
    isMacOS14OrNewer() &&
    resolveMacOSComputerUseExecutablePath() !== null
  )
}
```

*Source: src/main/computer/macos-native-provider-availability.ts, retrieved 2026-09-08.*

The macOS native provider activates only when all three conditions hold: running on darwin, OS version macOS 14 or newer (darwin major ≥ 23), and a signed helper executable exists at the known path. Failing that — or on Linux and Windows — the lifecycle falls back to the desktop-script provider. A provider, once created, is cached, and `shutdown()` cleans up both streams when the app quits.

## The process boundary: sidecar and Unix socket

This is the architecturally decisive part. The native module does not run inside the Electron main process — it is a separate process speaking over a controlled interface:

```ascii
agent decides the action (intent: click / hotkey / setValue …)
   │  method + params
   ▼
main process — src/main/computer/
   validation: computer-provider-action-validation.ts
   provider choice: computer-provider-lifecycle.ts
   ▼
process boundary
   macOS:   spawn Swift helper → Unix socket in a 0o700 directory
            + 0o600 token file (macos-native-provider-transport.ts)
   Linux:   Node sidecar (sidecar-entry.ts) → runtime.py (AT-SPI)
   Windows: runtime.ps1 (UIAutomation)
   ▼
native/computer-use-<os>/ executes against the real UI
   ▼
result with verification label → normalized → returned to the agent
```

*Source: src/main/computer/ and native/, retrieved 2026-09-08.*

On macOS, the transport narrows its own opening in a notable way: the socket directory is created with `mkdtempSync` at mode `0o700`, a random token is written to a `0o600` file, the connect has a 10-second limit, and data follows a line-based protocol — one JSON line per request. A code comment explains why the helper must be a separately signed executable: if the helper were launched through LaunchServices, macOS TCC would hold Orca.app responsible; the signed helper owns its own Accessibility grant instead.

On Linux, `runtime.py` describes itself in one docstring sentence: this process is a small AT-SPI adapter that reads one JSON operation file, executes it in the user's desktop session, and prints one JSON response. `sidecar-entry.ts` is the child Node process receiving requests shaped `{id, method, params}` and dispatching to the current provider — with cleanup hooks on `SIGTERM`, `SIGINT`, and `beforeExit`.

## Verification: how an action is evidenced

The result of an action is not just "done" or "failed". Each action metadata carries a `verification` field, and its content follows an explicit rule set:

| Situation | Verification label |
| --- | --- |
| `setValue` and the re-read element value matches | `verified`, with `property: 'value'`, the expected value and an actual preview |
| `typeText`, `pressKey`, `hotkey` | `unverified`, reason `synthetic_input` |
| `pasteText` | `unverified`, reason `clipboard_paste` |
| actions on the accessibility path | `unverified`, reason `accessibility_action_unasserted` |

*Source: src/main/computer/desktop-script-action.ts (`verifyDesktopAction`) and computer-action-verification-normalization.ts, retrieved 2026-09-08.*

Read the table honestly: only `setValue` produces direct evidence — after setting, the pipeline refreshes the snapshot and re-reads the value of that exact element to compare. Synthetic input has no reliable way to be read back, so it is labeled `unverified` with a reason instead of pretending to be confirmed. `normalizeComputerActionResult` makes sure the reason cannot go missing: if a result arrives without verification while its path is one of the known ones, the label is attached automatically. The agent receives a closed loop: intent → result → evidence (or an explicit admission that there is none).

## Why a native module per OS

The three accessibility APIs are not different at the "rename a function" level — they differ in model. macOS uses the AX API with TCC permissions and a signed helper; Windows uses UIAutomation plus Win32 via `Add-Type` in `runtime.ps1`; Linux uses AT-SPI through GObject introspection in `runtime.py`. Wrapping all three in a pure-JS layer would both lose the system grants and create a leaky abstraction.

```text
native/
  computer-use-macos/     Package.swift — Swift
                          Sources/OrcaComputerUseMacOSCore/
                          (ActionArgumentValidation, KeyboardInputSafety,
                           UnixSocketPathSafety, SyntheticMouseClickDelivery …)
  computer-use-windows/   runtime.ps1 — PowerShell + UIAutomation
  computer-use-linux/     runtime.py — Python + AT-SPI
  keyboard-layout-macos/  main.swift
  notification-status-macos/ main.swift
```

*Source: native/ in the public wakii-dev/wakii repo, retrieved 2026-09-08.*

Each native module is small, independent, and declares its own capabilities: over the handshake, the provider returns `ComputerProviderCapabilities` — a `supports` structure stating which actions work — and the main process checks the capability before each call (`assertMacOSProviderCapability` in `macos-native-provider-contract.ts`). A new module needs nobody's permission: it only has to honor the contract.

The feature has already shipped: the v1.4.198 release notes state that macOS arm64 is being rebuilt to include the computer-use native module, and all of `src/main/computer/` is on the public repo. For the agent doing the deciding, the kit's separation of powers — which agent decides, which agent checks — is covered in [nine agents, separated powers](/blog/nine-agents-separated-powers/); the defend-at-the-boundary philosophy running through this pipeline is in [defensive by design](/blog/defensive-by-design/).

## Wrap-up

The [agents and kit](/docs/agents-and-kit/) page describes the agent kit this pipeline serves: the agent decides the intent, and the rest of the system validates, executes, and evidences. Every path cited here is on the `wakii-dev/wakii` repo (MIT) — if you want to see the boundary with your own eyes, open `src/main/computer/` and follow one method from validation to the native module. And if you want an agent working on your desktop itself, download Wakii and try computer use in your first agent session.
