# Inventory re-confirm — SF-3 docs facts (FI-292)

Re-confirmed từ source Wakii/Orca fork (`~/Desktop/projects/orca`, HEAD `d3d767c646`),
2026-09-04, bằng direct read + grep có file:line. **Đây là nguồn DUY NHẤT cho mọi
con số trong docs — không hardcode số khác.**

## Build (getting-started)

| Fact | Evidence |
|---|---|
| pnpm 12.0.0 (`packageManager`) | `package.json:308` |
| Node 24 (`engines.node`) | `package.json:305-307`; CI pins node 24 |
| `pnpm install` → postinstall rebuild native deps | `package.json:91`; native builds: node-pty, sherpa-onnx, @parcel/watcher, esbuild, cpu-features (`pnpm-workspace.yaml:26-38`) |
| `pnpm dev` — chạy app desktop (dev) | `package.json:60`; first run chạy `ensure:electron-runtime` (`:58-60`) |
| `pnpm build` = `build:desktop` + `build:native` | `package.json:87-88` |
| `pnpm start` = `ensure:electron-runtime && electron-vite preview` (production) | `package.json:59` |
| Newcomer sequence | `.github/CONTRIBUTING.md:17-22`: `pnpm install` → `pnpm dev` |

## Superpowers panel (UI surfaces — exact labels)

| Fact | Evidence |
|---|---|
| Bundled plugin `stablyai.orca-superpowers-launcher` | `resources/plugins/launch/bundled-plugins.json` |
| Panel manifest: id `superpowers`, title "Superpowers", icon `zap` (⚡) | `orca-plugin.json:14-19` |
| Mở từ icon ở right-sidebar activity bar (không hotkey riêng); right sidebar toggle Mod+L | `plugin-panel-activity-items.ts:37-65,80-94`; `definitions-core-1.ts:188-195` |
| Đúng 2 tabs: "⚡ Workflow" + "🌳 Story" | `panel.html:87-90` |
| Workflow tab: intent radios (New feature / Continue work / Quick fix), mode toggles (Autonomous, Refine idea, Simplify code, Linear audit log, Mindset Browser, Plan only), Subagents grid 9 checkboxes "All 9 default ON", Execute select (Delegate/Inline/Superpowers) | `panel.html:201-355` |
| Story tab: Create story / Approve story / Launch SFs; bracket canvas SVG (node states colored by Linear state); "🛠 Story Ops" strip | `panel.html:93-196` |
| Story Ops gates: B0 browser test + B1 code+tests · B2 plan · B3 review · B4 merge · B5 Done; verdicts COMPLETE · READY-TO-DONE · INCOMPLETE · VIOLATION · NOT-LAUNCHED | `panel.html:165-173`; `kit/bin/story-verify:5-13` |
| **"Stories tab" KHÔNG tồn tại trong panel** — phrase chỉ trong code comments/prompt text. "Stories" là một source-mode view của Linear task page (Issues/Projects/Views/**Stories**/Has Workspace) — không phải surface của Superpowers panel | grep toàn repo; `task-page-localized-options.tsx:150-161` |

## Agents (đúng 9)

`resources/plugins/launch/stablyai.orca-superpowers-launcher/kit/agents/` — 9 file `.md`;
vai trò theo `kit/kit.json` (`agents` array); "9-agent story team" (`kit/kit.json:4`),
"All 9 default ON" (`panel.html:269`):

task-executor (green, dev) · designer (magenta, 3-direction drafts) · code-reviewer
(cyan, diff review) · verifier (orange, independent PASS/FAIL) · spec-critic (purple) ·
plan-critic (magenta, plan+DAG) · phase0-impact-analyst (blue) · security-audit (red,
OWASP) · rollback-fixer (yellow, safe revert)

Workflow tab còn có subagent input số (1-10) cho multi-dim analysis — không phải
named agent. Upstream `superpowers` plugin là external dependency, không tính vào 9.

## Kit (bundled, install vào ~/.claude)

| Fact | Evidence |
|---|---|
| Kit "story-team-kit" v2.1.0, portable install | `kit/kit.json:2-5` |
| Install: copy `skills/agents/bin` vào `~/.claude/`, idempotent theo version | `README.md:18,106`; `main.mjs:443` (KIT_BIN = ~/.claude/bin), `main.mjs:604` |
| **17 skills** | `ls kit/skills/` = 17 = 17 entries trong `kit.json`: brainstorm, bridge-router, design-taste-frontend, execute-plan, figma-orientation, frontend-design, gpt-taste, graph-engineering, image-to-code, mock-prototype, orca-bridge, orca-superpowers-workflow, post-task-ritual, prompt-master, story-workflow, web-design-guidelines, writing-plans-linear |
| **23 story-* CLIs** trong `kit/bin/` → `~/.claude/bin/` | `ls kit/bin/` = 23: story-attempt, story-compact-recovery, story-diff-review, story-launch, story-memory, story-memory-fuse, story-memory-index-hook, story-memory-parse, story-notify, story-post-merge, story-preflight, story-resume, story-skill-lint, story-snapshot-env, story-stats, story-status, story-sync-dest, story-test, story-top, story-validate, story-verify, story-visual-regress, story-watchdog |
| App bundles thêm 8 skills riêng (computer-use, orchestration, orca-cli...) | repo root `skills/` |
| Kit license: MIT (origin obra/superpowers, Jesse Vincent) | `docs/superpowers/notes/kit-license.md` |
| npm bins: `orca`, `orca-dev`; runtime binary `orcad`; 6 native helpers | `package.json:7-10,34`; `config/scripts/build-orcad.mjs:2-3`; `native/` |

## Accuracy guard rút ra

1. KHÔNG "Stories tab" trong bất kỳ copy nào — panel chỉ có "⚡ Workflow" + "🌳 Story".
2. Install story chỉ bundled flow: kit tự cài vào `~/.claude`, enabled by default.
   KHÔNG mô tả standalone install cũ.
3. Số liệu: 9 agents · 17 kit skills · 23 story-* CLIs · pnpm 12 · Node 24.
4. Story Ops gates: B0–B5 (B0 = browser test; B1 code+tests, B2 plan, B3 review,
   B4 merge, B5 Done).
