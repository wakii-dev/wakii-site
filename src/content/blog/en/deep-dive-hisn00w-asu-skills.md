---
title: "ASu-skills: nine job-hunting skills and the skills-as-content wave"
description: "ASu-skills packages a job-hunting workflow into nine AI skills and distributes them to five harnesses from a single source, with a registry reconciled by CI. Inside: the skills-as-content phenomenon and the anti-drift mechanism Wakii itself needs."
pubDate: "2026-10-24"
category: "tech"
tags: ["skills", "agents", "workflow", "evidence"]
draft: false
---

A skills pack for a non-coding niche — preparing job applications in Chinese — created on August 12, 2026 reached 4,025 stars per the GitHub API on 2026-09-08, under a month. That number tells a story bigger than the repo: skills have become a distributable content format — whoever writes the content well owns the product, and the agent harness is just the runtime that runs it. Hisn00w's ASu-skills is a sample of this phenomenon done with real engineering discipline: one source of skills, many harnesses, and a catalog reconciled by machine.

## TL;DR

- ASu-skills is a Chinese job-hunting workflow plugin with nine independent skills: from making real open-source contributions and building or improving resumes, to interview prep and application tracking.
- Multi-harness distribution: one shared `skills/` source, five per-harness manifests (Codex, Claude Code, TraeWork, OpenCode, WorkBuddy); `skills.registry.json` is the single source of truth, with CI running `--check` to block catalog drift.
- The strongest part lives in the prompt content itself: "fact boundaries" — separating production from prototype, measured from estimated, your own actions from what the AI did — plus a nine-segment evidence chain with a dedicated "missing evidence" segment.
- 4k stars for a non-code skill is a demand signal: agent skills are no longer just a developer-tools story.

## Skills are content; the harness is the runtime

How the repo organizes distribution is the operational definition of skills-as-content. All content lives in three shared directories — `skills/`, `assets/`, `references/` — and each harness only needs a thin manifest pointing at them: `.codex-plugin/` for Codex, `.claude-plugin/` for Claude Code, `.trae-plugin/` for TraeWork, while `.opencode-plugin/` and `.workbuddy-plugin/` are lighter community bridges. Installing on Claude Code is the familiar two-command marketplace flow: `/plugin marketplace add Hisn00w/ASu-skills`, then `/plugin install asu-skills@asu`.

The anti-drift part is the real lesson. The README states it plainly: the catalog of entries takes `skills.registry.json` at the repo root as the single source of truth, generated and reconciled by `npm run sync:skills`, with CI re-checking via `--check`. Add a skill and forget to sync the manifests in five places, and CI goes red before merge. This is not theory: in the very first month, an outside contributor (qiyu-lu) submitted PR #136 "fix/docs-skill-catalog-sync" explicitly to stop the docs catalog from drifting — the mechanism is genuinely being used.

| Component | Role |
| --- | --- |
| `skills/` + `assets/` + `references/` | one content source shared by every harness |
| `.codex-plugin/` … `.workbuddy-plugin/` | five thin manifests, one per harness |
| `skills.registry.json` | single source of truth for the entry catalog |
| `npm run sync:skills` + CI `--check` | generates and reconciles the registry, blocks drift |

The repo has no releases or tags at all (per the GitHub API on 2026-09-08) — versions live in the plugin manifests and distribution happens through each harness's marketplace. That is a content distribution model, not a software one: no binaries to install, no update channel of its own, just text that a runtime reads.

## Nine skills, one workflow

The nine entries are not nine loose tools; they are an ordered job-hunting pipeline. `/contributor` finds open-source issues matching your target role and checks maintainer signals and contribution rules before proposing anything; `/project-guide` generates a source-reading path with study questions; `/great-resume` and `/make-resume` handle the CV itself (18 editable HTML templates — which is also why the repo's language stat reads HTML); `/job-match` compares a job description against real evidence; `/job-apply` fills application forms through a browser and stops before submitting for human review; `/interview` and `/offer` close out interview prep and application tracking.

The README chains them into scenarios: no real experience yet? Run `/contributor` first, then hand the results to `/great-resume`. Have AI-coding records? `/evidence-recap` builds the evidence chain before you decide how to tell the story. Each entry also documents when NOT to use it — the responsibility boundaries between skills are declared rather than left for the runtime to guess.

## Fact boundaries, written into the prompt

The longest read is the `/evidence-recap` skill: it turns AI-coding conversations and delivery records into a nine-segment evidence chain, in a fixed order:

```text
1 问题背景  (problem background)      6 效果证据  (effect evidence)
2 方案决策  (solution decision)       7 个人边界  (personal responsibility boundary)
3 个人动作  (personal actions)        8 待补证据  (missing evidence)
4 交付状态  (delivery status)         9 面试追问  (interview follow-up questions)
5 落地范围  (deployment scope)
```

— skills/evidence-recap/SKILL.md, [Hisn00w/ASu-skills](https://github.com/Hisn00w/ASu-skills/blob/main/skills/evidence-recap/SKILL.md) (probed 2026-09-08)

Several segments deserve to be stolen by every accomplishment-tracking system. Segment four forces an explicit status label: production, internal pilot, prototype, or merely planned. Segment six separates measured results, phase results, technical validation, and estimated gains. And segment eight is a rare design decision: a dedicated slot for "missing evidence," with inference forbidden as a filler.

The fact boundaries do not stop at one skill. `/great-resume` is required to mark gaps with 【待补】 ("to be filled") instead of inventing job titles, companies, or numbers. `/contributor` may only use strong outcome language when GitHub shows the PR merged — an unmerged PR is "submitted." And before any output, the skill runs a privacy scrub: project codenames, tokens, emails, client identifiers, and internal paths are generalized or replaced. This is anti-hallucination written as a content process, not a generic reminder to "be honest."

For Wakii, this is the "done means evidence" philosophy — already running through gates in the [story-workflow docs](/docs/story-workflow/) — seen from the content side: a non-code skill pack that makes every number justify itself before it enters a resume. And ASu-skills' catalog-drift lesson lands exactly where Wakii is exposed: Wakii's skill catalog, toured in [skills-catalog-tour](/blog/skills-catalog-tour/), lives in `skills.ts`, but hand-written derived numbers elsewhere still drift.

## What Wakii learns

- **ADOPT** — a single-source registry with machine-reconciled derived views: `skills.registry.json` generated by a script, CI `--check` blocking every catalog drift. Wakii has hit exactly this disease: the README still says "21 skills" while ground truth is 20/13 (at the time of writing), and hand-kept numbers will drift again at the next count. The right-layer fix: generate or lint-check every skills count in README/docs from `skills.ts`.
- **DIRECTION** — multi-harness distribution: one skill source, a thin manifest per harness, one reconciled registry. Wakii's kit currently targets Claude Code; if it ever opens to another harness, this is the layout to copy without rewriting content.
- **DIRECTION** — the nine-segment evidence chain with its "missing evidence" slot and human-vs-AI responsibility boundary: a sharper shape for Wakii's story memory and done-means-evidence — recording what you have not yet proven is part of the evidence, not a failure to hide.
- **WATCH** — 4k stars in under a month (created 2026-08-12) for a non-code skill proves skills-as-content demand beyond dev tools; but the five-harness coverage is young (two "lightweight" bridges), and the security story leans on third-party badges — watch as harness marketplaces standardize.

Wakii is an agentic IDE with a superpowers team built in — 20 skills at the time of writing, split by role, every step through gates. [Get Wakii](/docs/getting-started/) and let the catalog tell its own story.
