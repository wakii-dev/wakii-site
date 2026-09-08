---
title: "Aider: git-native AI pair programming in your terminal"
description: "Aider turns each AI edit into a diffable, revertable git commit, compresses the codebase into a ~1,000-token repo map, and forces models to emit code in a fixed format — three mechanisms worth studying in any agent harness."
pubDate: "2026-10-08"
category: "tech"
tags: ["cli", "git", "agents"]
draft: false
---

Before dozens of AI coding agents appeared and vanished, there was aider: an LLM pair programming tool that runs directly in your terminal, past 48,827 stars per the GitHub API on 2026-09-08. The repo publishes a metric few tools would dare to print: a "Singularity 88%" badge on its README — the percentage of new code in its latest release written by aider itself. The reason to read about aider today is not the ranking, though. It is how the repo designs its harness: aider never lets the model touch a codebase like a stranger. It wires the entire edit lifecycle into the git model every developer already knows — commit, diff, undo.

TL;DR:

- Each aider edit round ends in its own commit, with a message written by an LLM from the chat history, flagged as an AI commit — diff and revert with ordinary git tools.
- Before applying edits, aider commits the file's dirty state first — because the /undo command needs a committed anchor point.
- The repo map compresses the whole codebase into a map of about 1,000 tokens: tree-sitter tags + PageRank, biased toward files you mention in chat.
- Edit formats (SEARCH/REPLACE blocks, udiff, whole file) are output contracts the model must obey, chosen per model capability.
- Development has slowed sharply: last release in August 2025, last small commit on 2026-05-22 (per the GitHub API on 2026-09-08).

## Every AI change lands as its own commit

The core mechanism lives in `base_coder.py`: after each chat round, the `auto_commit` function collects the files the model touched and calls `self.repo.commit(fnames=edited, context=context, aider_edits=True, coder=self)` — the commit message is written by an LLM from the conversation history, and the `aider_edits` flag marks it as an AI commit, separate from human ones (see [base_coder.py @ 5dc9490](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/coders/base_coder.py)).

The more interesting detail sits before the first edit. `check_for_dirty_commit` inspects each file about to be modified: if it carries uncommitted changes, aider commits the old state before the model touches anything, logging "Committing <path> before applying edits." The reason is right there in the source comment:

```python
def check_for_dirty_commit(self, path):
    ...
    if not self.repo.is_dirty(path):
        return
    # We need a committed copy of the file in order to /undo, so skip this
    ...
    self.io.tool_output(f"Committing {path} before applying edits.")
    self.need_commit_before_edits.add(path)
```

(aider/coders/base_coder.py, quoted from the tree at commit `5dc9490`, probed 2026-09-08 — [link](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/coders/base_coder.py))

The README sums up the philosophy: "Aider automatically commits changes with sensible commit messages. Use familiar git tools to easily diff, manage and undo AI changes." (README of Aider-AI/aider, [source](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/README.md)). This contract changes the review question too: instead of asking "did the AI edit this correctly", you ask "what did the AI change since the last commit" — and `git diff` answers, because the anchor exists.

## Repo map: the whole codebase in about 1,000 tokens

Context windows are finite; codebases are not. Aider's answer is `RepoMap` — a class in `repomap.py`, defaulting to `map_tokens=1024`:

```text
source files
   |  tree-sitter tags (definitions + references)
   v
MultiDiGraph: file -> definition -> identifier
   |  personalization: files mentioned in chat get extra weight
   v
nx.pagerank(G, weight="weight")
   |  cut off at map_tokens (default 1024)
   v
repo map goes into the prompt
```

The line that decides the ranking:

```python
ranked = nx.pagerank(G, weight="weight", **pers_args)
```

(aider/repomap.py, quoted from the tree at commit `5dc9490` — [link](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/repomap.py))

Three details worth noting. One: the tags come from tree-sitter via the grep-ast library, cached on disk at `.aider.tags.cache.v4`, so later runs do not rescan from scratch. Two: the graph is directed — definitions point to the identifiers they use, so files referenced by many important files rise to the top of the map. Three: `pers_args` carries the personalization — files appearing in the conversation, or matching mentioned identifiers, start with higher weight, tilting the map toward what you are working on. Context, in aider's design, is not a repo dump into the prompt; it is a ranked list with the current chat as the ranking signal.

## Edit formats are the model's output contract

Aider does not let the model choose freely how to return code. Each way of returning code is its own class under `aider/coders/`: `editblock_coder.py` (SEARCH/REPLACE blocks), `wholefile_coder.py` (rewrite the whole file), `udiff_coder.py` (unified diff), `patch_coder.py`, and `architect_coder.py` — a two-step model where one model proposes the change and another writes the code. The prompt of the most common format states the requirement plainly:

"All changes to files must use this *SEARCH/REPLACE block* format. ONLY EVER RETURN CODE IN A *SEARCH/REPLACE BLOCK*!" — aider's prompt in `editblock_prompts.py` ([source](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/coders/editblock_prompts.py)).

The format example ships inside that same prompt:

```text
mathweb/flask/app.py
<<<<<<< SEARCH
from flask import Flask
=======
import math
from flask import Flask
>>>>>>> REPLACE
```

(quoted from `example_messages` in editblock_prompts.py at commit `5dc9490` — [link](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/coders/editblock_prompts.py))

Turning that text into real edits happens in `search_replace.py` and the `apply_edits` function in `base_coder.py`. The design lesson sits one level up: the output format is the model's API surface. When a model is weak at one format, aider switches formats for that model — the whole family of coder classes exists to serve that switch, rather than blaming the model for "forgetting the format".

## The real cadence: slowed to a crawl since late 2025

Per the GitHub API on 2026-09-08: 48,827 stars, 4,933 forks, Apache-2.0 license, not archived. The six most recent releases:

| Release | Published (UTC) |
|---------|-----------------|
| v0.86.0 | 2025-08-09 |
| v0.85.0 | 2025-06-27 |
| v0.84.0 | 2025-05-30 |
| v0.83.0 | 2025-05-09 |
| v0.82.0 | 2025-04-14 |
| v0.81.0 | 2025-04-04 |

(source: GitHub API `repos/Aider-AI/aider/releases`, probed 2026-09-08)

The cadence was steady, about one release per month from April through August 2025 — then it stopped. As of the probe date, thirteen months have passed without a release. The default branch still breathes, but with maintenance breaths: the five most recent commits fall in the window 2026-04-23 to 2026-05-22, all small PRs — adding tree-sitter tags for bash to feed the repo map, expanding the Anthropic model list (per the GitHub API on 2026-09-08).

This is the fact to state plainly when learning from a repo: 48,827 stars do not automatically mean maintained. Before you treat a repo as a reference, check the last push date next to the star count — aider is the proof case: the architecture is still worth studying, but the development status must be read from the commit history, not from popularity.

## What Wakii learns

- **ADOPT** — Snapshot-commit before the agent applies edits to a worktree that already carries changes. The evidence is `check_for_dirty_commit` in section one: aider anchors the /undo point with a commit before the model touches anything. Wakii's docs state that the task-executor "commits atomically" in its own worktree, but do not mention a mechanism that snapshots pre-existing dirty changes before the first edit; the concrete proposal: the executor opens a task with a machine-readable labeled snapshot-commit if the worktree is dirty, so the rollback-fixer reverts exactly the labeled scope instead of counting commits by hand. The drawback is extra commit noise — Wakii's convergence rhythm, every SF merging into one destination branch and one PR per story as described in [one destination branch, one PR](/blog/one-branch-one-pr/), already absorbs that noise.
- **DIRECTION** — A computed repo map from section two: the phase0-impact-analyst builds its touch map by reading code today; a personalized PageRank map would give a ranked starting point on unfamiliar repos. Not adopted yet because hand-authored context packs at the epic level — analyze once, inherit many, per the [story workflow](/docs/story-workflow/) — already cover the main case, and an algorithmic map needs the cache and per-language parser investment aider made.
- **WATCH** — Edit formats as per-model contracts from section three: Wakii's harness already forces machine-readable structure at the workflow layer (choice/free-text gates, machine-checked lint), while aider picks formats at the layer of code text the model emits. Condition to change the grade: when Wakii runs executors on models without standard tool-call support, that is when aider's format enforcement and format-error handling become directly relevant.

Aider's three mechanisms — commits as anchors, context as a ranked map, output as a contract — share one principle: put the fence where the model cannot climb over it by itself.

To see the same guardrail thinking running in a real product — gates, a watchdog, independent review — start from [getting started](/docs/getting-started/). Wakii is an agentic IDE with a built-in superpowers team: download it, let the agents run inside the fence, and keep the deciding for yourself.
