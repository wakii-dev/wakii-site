---
title: "Skill /prompt-master: a prompt is a product"
description: "prompt-master turns a rough idea into one production-ready prompt: extract the intent first, identify the target tool, lock the output format up front — a single prompt that works on the first paste."
pubDate: "2026-09-15"
category: "tech"
tags: ["skills", "workflow"]
draft: false
---

You write prompts every day — for chatbots, for IDEs, for image generators — and most of the time the prompt comes from inspiration: a few vague sentences — send, wrong result, rewrite, wrong again. The Wakii skills kit contains a skill that sees this differently. prompt-master — one of the kit's 13 public skills as of this writing, 2026-09-08 — makes a one-line claim: a prompt is not a question repeated on inspiration; it is a product with a spec — extracted intent, a chosen target tool, an output format locked up front. This post reads the skill's source file to see how that claim is enforced.

TL;DR:

- Bad prompts are not random: they fall into six recognizable failure groups, and the skill ships with a checklist that scans and fixes silently.
- Before writing a word, the skill extracts nine intent dimensions; a missing critical one triggers a follow-up question — at most three.
- Each target tool has its own standard: one intent, three structures for a reasoning model, an IDE agent, and an image generator.
- The output contract: exactly one prompt, role and format locked, no unrequested explanations — the only metric is that it works on the first paste.
- The skill polices its own scope: it activates only when you explicitly ask for prompt work.

## Six failure groups of a bad prompt

The Diagnostic Checklist section of the source lists six recurring failure groups — task, context, format, scope, reasoning, agentic — with a rule of conduct: scan every rough prompt against this list and "fix silently — flag only if the fix changes the user's intent." Three representative patterns, verbatim:

```ascii
- Two tasks in one prompt → split, deliver as Prompt 1 and Prompt 2
- Implicit length ("write a summary") → add word or sentence count
- Vague aesthetic ("make it professional") → translate to concrete measurable specs
```

*Source: ~/.claude/skills/prompt-master/SKILL.md (Diagnostic Checklist section), retrieved 2026-09-08.*

Read them like compiler errors: each line is a symptom with a fix. The agentic group matters most to anyone running coding agents: an agent with no stopping point is classified as a scope failure; the fix is a stop condition plus a human checkpoint before irreversible actions.

## Extract intent first: nine dimensions, three questions at most

Before generating a single word, the skill extracts intent along a fixed table of nine dimensions — done "silently":

| Dimension | What it extracts | Required when |
|---|---|---|
| Task | a specific action — vague verbs become precise operations | always |
| Target tool | which AI system receives this prompt | always |
| Output format | shape, length, structure of the result | always |
| Constraints | what must and must not happen, scope boundaries | complex work |
| Input | what you provide alongside the prompt | if applicable |
| Context | domain, project state, prior decisions | session has history |
| Audience | who reads the output, their technical level | user-facing output |
| Success criteria | how to know it worked — binary if possible | complex work |
| Examples | input/output pairs to lock the pattern | format-critical |

*Source: ~/.claude/skills/prompt-master/SKILL.md (Intent Extraction table), retrieved 2026-09-08.*

The first three dimensions are mandatory per the source: what to do, for which tool, in what shape. The remaining seven switch on per situation. Clarifying questions are reserved for missing critical dimensions only, and the source caps them with a hard rule: "Do not ask more than 3 clarifying questions before producing a prompt". Ask little, ask precisely — the line between a skill that extracts intent and an assistant that asks five rounds of questions without ever writing. The same ask-before-writing move as [the brainstorm skill](/blog/skill-brainstorm/), at story level.

## Identify the target tool: every tool has its own standard

With intent in hand, the skill routes by target tool — implicit assumption: a universally "good prompt" does not exist. The same kind of work demands three different structures from three kinds of tools:

```ascii
tool                  the standard in the source
────────────────────────────────────────────────────────────────────
o3 / DeepSeek-R1      "SHORT clean instructions ONLY" — state the goal
(reasoning model)     and what done looks like. No CoT: the model thinks
                      internally; "think step by step" degrades output.

Cursor / Windsurf     file path + function name + current behavior + desired
(IDE agent)           change + do-not-touch list + language and version.
                      "Done when:" is required — that is the agent's stop
                      point.

Midjourney            comma-separated descriptors, NOT prose. Subject first,
(image generator)     then style/mood/lighting/composition, parameters last:
                      --ar 16:9 --v 6 --style raw
```

*Source: ~/.claude/skills/prompt-master/SKILL.md (Tool Routing section), retrieved 2026-09-08.*

The rule becomes a hard rule at the top of the source: "Do not add Chain of Thought to reasoning-native models (o3, o4-mini, DeepSeek-R1, Qwen3 thinking mode)". It is the cleanest illustration of this post's thesis: a technique praised in one place causes harm in another. Prompts have no universal standard — they have the standard of the tool receiving them. The source lists more than twenty tool groups, from Claude, ChatGPT, and Gemini to ComfyUI, video AI, and browser-controlling agents; unknown tools map to the closest category.

## A single prompt, the output contract locked up front

The output-format section of the source asks for exactly three items; item one is "A single copyable prompt block ready to paste into the target tool" — one block, copy-paste ready. Not three options to choose from, no trailing "if you'd like, I could also". Why is "one" the right number? The answer sits in the Success criteria section at the end of the document: "The user pastes the prompt into their target tool. It works on the first try. Zero re-prompts needed. That is the only metric." Three options hand the choosing back to you — the job is not done; one prompt that works on the first try is the finished product.

Before returning any result, the skill runs itself through a verification list. Two items worth remembering: are the most critical constraints in the first 30% of the generated prompt — so they survive the model's attention decay — and "Does every instruction use the strongest signal word? MUST over should. NEVER over avoid." Alongside a padding ban: "Do not pad output with explanations the user did not request" — every sentence must be load-bearing, no vague adjectives, explicit format, bounded scope.

A real example from this story: the launch prompt of FI-373 — the 44-post batch 2 you are reading a piece of — was written in exactly this spirit. Its structure, redrawn as an outline:

```ascii
structure of the FI-373 (SF-2) launch prompt, retrieved 2026-09-08 — self-drawn outline

ROLE         task-executor — one SF, one worktree, file scope fixed in advance
WHY          why the SF exists: the skills facet is the missing block; evidence =
             real skill source, not paraphrased docs
LOAD         a required skill to load before starting
READ         docs to read in a numbered order: context pack → bracket → spec
TEAM         9 agents, each with a report format — no verdict means it did not run
CREATIVITY   a hard frame: matrix pins slug/date/category · 900-1400-word band ·
             claims registry limits what may be claimed · docs link required
RUN          a numbered 1→5 checklist, "do not stop before step 4"; Done is set
             only after merge
```

*Source: structure of the story FI-373 launch prompt, retrieved 2026-09-08.*

That is a prompt designed like a product: role, constraints, output contract, stopping checkpoints — not a one-liner saying "go write 13 blog posts".

## Deliberate activation: only when your task is a prompt

The least technical part of the source says the most about the kit's philosophy: the activation boundary. The frontmatter declares the operating scope right in the description:

```yaml
Activates only when the user explicitly asks to write, fix, improve, or adapt
a prompt for a specific AI tool (LLM, Cursor, Midjourney, image AI, video AI,
coding agents, etc.). Does not activate for general conversation, coding
tasks, document writing, or other non-prompt-engineering work.
```

*Source: ~/.claude/skills/prompt-master/SKILL.md (frontmatter, version 1.7.0), retrieved 2026-09-08.*

The skill does not wake up while you are writing code or drafting documents — it operates only when your task is actually a prompt. That is a trigger contract: a narrow-scope skill that switches on at the right moment beats an all-knowing one that never learned when to stay quiet. The kit holds 20 skills as of this writing, 2026-09-08; the choice applies to every entry.

When to call it: before pasting a long prompt into an IDE agent; when adapting an existing prompt to a different tool — the source calls this Prompt Decompiler mode; when your prompt keeps failing in the same spot and you need a fault scan instead of a guess. Otherwise — don't call it. That restraint is what makes it trustworthy when you do.

prompt-master is one of the skills bundled with Wakii's built-in agent team: the nine agent roles and how skills attach to the team live on the [agents and kit](/docs/agents-and-kit/) page; for the full shelf, [the skills catalog tour](/blog/skills-catalog-tour/) walks the catalog end to end.

Wakii is an agentic IDE with a built-in superpowers team. Next time you are about to type your third prompt for the same task, try writing it like a product instead: which intent, which tool, which format — or let prompt-master write it for you.
