---
title: "CAMEL: large-scale collaborative agent research"
description: "CAMEL turns a two-agent conversation into a data-generation pipeline with machine filters and standardized benchmarks — synthetic data is the product, and quality is measured by gates, not vibes."
pubDate: "2026-10-17"
category: "tech"
tags: ["agents", "qa"]
draft: false
---

Most multi-agent frameworks answer the same question: how do many agents coordinate to finish a task. CAMEL asks a different one: how do you get agents to produce data clean enough for research. The camel-ai/camel repo — 17,685 stars per the GitHub API on 2026-09-08, Apache-2.0 licensed — started from a paper on role-playing between two agents and grew into data-generation and benchmarking infrastructure for large-scale agent research. This post walks through three layers of the actual code: the conversation, the data filters, and the benchmarks — to see what a research repo measures quality with, instead of trusting a feeling.

TL;DR:

- `RolePlaying` is the core of the repo: two agents with two role names collaborating in a conversation with optional task-specify and critic — the conversation is a data-generation method, not a demo.
- `camel/datagen` holds 5 data-generation pipelines; machine-generated instructions must pass standard filters (length, keyword, rouge similarity) before they are allowed into the dataset.
- `camel/benchmarks` packages research benchmarks (GAIA, BrowseComp, RAGBench) inside the library itself — the measuring instrument sits next to the code, not outside in a notebook.
- The finished datasets are published openly on Hugging Face across 6 subject groups — the repo's product is data, not just a library.

## From two roles to one dataset

The file `camel/societies/role_playing.py` — 853 lines at HEAD on 2026-09-08 — defines the `RolePlaying` class, the machine that starts the whole story. Its signature says a lot:

```python
class RolePlaying:
    r"""Role playing between two agents."""

    def __init__(
        self,
        assistant_role_name: str,
        user_role_name: str,
        *,
        critic_role_name: str = "critic",
        task_prompt: str = "",
        with_task_specify: bool = True,
        with_task_planner: bool = False,
        with_critic_in_the_loop: bool = False,
        task_type: TaskType = TaskType.AI_SOCIETY,
        ...
```

Source: [camel/societies/role_playing.py](https://github.com/camel-ai/camel/blob/8c791b7b9cf7deab56cb5a92818c34499af9097f/camel/societies/role_playing.py), HEAD on 2026-09-08.

The two required parameters are two role-name strings. This is not a "declare roles to divide up work" design like application-facing frameworks — it is a recording rig: you pick two roles and a task prompt, and the rig records a controlled conversation for collection. Three switches in the signature show how much intervention you can dial in: `with_task_specify` (on by default — a helper agent rewrites a generic task into a concrete one before the conversation starts), `with_task_planner`, and `with_critic_in_the_loop` (a critic agent interjects between the two roles). The default `task_type: TaskType.AI_SOCIETY` shares its name with the AI Society dataset the repo publishes — the conversation is designed from the start to become data, not converted afterwards.

The data flow across the repo's three layers:

```
task prompt
   |
   v
[task specify agent]  rewrites task into a concrete one
   |
   v
assistant <----> user     (role-playing loop, step() each turn)
   |
   v
conversation transcript
   |
   v
camel/datagen/*  -->  filters  -->  dataset (Hugging Face)
                         |
                         v
               camel/benchmarks   (pipeline quality gauge)
```

The repo's README describes the original demo as two agents playing "a python programmer and a stock trader collaborating on developing a trading bot" ([README](https://github.com/camel-ai/camel#quick-start), retrieved 2026-09-08). Two roles, one conversation, and what remains is a structured transcript — the raw material for everything else in the repo.

## Machine filters stop bad data before it enters the store

Generating data at scale runs straight into a problem: accept everything a model produces and the dataset becomes a mixed junkyard. `SelfInstructPipeline` in `camel/datagen/self_instruct/` solves it with a loop that has a gate. The pipeline's default filters:

```python
default_config: Dict[str, Dict[str, Any]] = {
    "length": {},
    "keyword": {},
    "punctuation": {},
    "non_english": {},
    "rouge_similarity": {},
}
```

Source: [camel/datagen/self_instruct/self_instruct.py](https://github.com/camel-ai/camel/blob/8c791b7b9cf7deab56cb5a92818c34499af9097f/camel/datagen/self_instruct/self_instruct.py), HEAD on 2026-09-08.

Five filters — length, keyword, punctuation, non_english, rouge_similarity. The last one compares the new instruction against existing ones to block duplicates. The main generation loop works like this:

```python
while len(self.machine_tasks) < self.num_machine_instructions:
    prompt, instruction = self.generate_machine_instruction()
    ...
    if self.instruction_filter.filter(prompt, instruction):
        ...
    else:
        logger.warning(
            f"Instruction failed filters. Skipping instruction: "
            f"{instruction}"
        )
```

A new instruction is generated, pushed through the filter chain; it passes and enters the store, or it fails and gets logged and dropped — "Instruction failed filters. Skipping instruction" is the pipeline's own log line, not someone's turn of phrase. The `human_to_machine_ratio` parameter defaults to (6, 2), mixing human-written instructions with machine-generated ones as expansion feedstock. The lesson is not in any single filter but in their position: inside the generation loop, in front of the store. Quality here is a measurable property — every instruction passes a quantitative gate, nobody "feels" that it is fine.

## Benchmarks live inside the library, not outside in a notebook

The third layer is `camel/benchmarks` — a module at the same level as `agents` and `societies` in the code tree. Inside: `gaia.py`, `browsecomp.py`, `ragbench.py`, `apibank.py`, `apibench.py`, `nexus.py` ([code tree](https://github.com/camel-ai/camel/tree/8c791b7b9cf7deab56cb5a92818c34499af9097f/camel/benchmarks), retrieved 2026-09-08). The base class standardizes every benchmark:

```python
class BaseBenchmark(ABC):
    r"""Base class for benchmarks."""

    def __init__(
        self, name: str, data_dir: str, save_to: str, processes: int = 1
    ):
```

Source: [camel/benchmarks/base.py](https://github.com/camel-ai/camel/blob/8c791b7b9cf7deab56cb5a92818c34499af9097f/camel/benchmarks/base.py), HEAD retrieved 2026-09-08.

Four attributes: name, data directory, results destination, parallel process count. A new benchmark just plugs into this frame. For a repo whose product is generated data, the benchmark is the assembly line's gauge: a new data-generation pipeline must compare its numbers on the standard instrument, not grade itself. The README states the community's goal plainly: "finding the scaling laws of agents" ([README](https://github.com/camel-ai/camel), retrieved 2026-09-08) — a goal like that forces every experiment onto the same ruler.

## The dataset is the product, published for everyone

The README lists 6 dataset groups published on Hugging Face (retrieved 2026-09-08):

| Dataset | Chat format | Instruction format | Translated |
|---|---|---|---|
| AI Society | yes | yes | yes |
| Code | yes | yes | — |
| Math | yes | — | — |
| Physics | yes | — | — |
| Chemistry | yes | — | — |
| Biology | yes | — | — |

This is what separates CAMEL from pure agent-building frameworks: the output is not only an API for you to build agents with, but a dataset you can download to train models. The repo also spins off research projects — OWL, OASIS, CRAB, Agent Trust, Loong — per the README on 2026-09-08.

On release cadence: the latest release is v0.2.91a7 on 2026-09-03 — and on that exact day there were two consecutive alpha bumps (a6 at 05:12, a7 at 05:28 UTC). Before that, v0.2.91a5 on 2026-07-13 — releases are sparse, uneven, tied to milestones rather than the calendar (per the GitHub API on 2026-09-08). Meanwhile the master branch was last pushed on 2026-09-07: code lands daily, releases wait for milestones.

CAMEL serves research at the scale the README describes as systems of millions of agents; Wakii runs a workflow for a single developer, with real agents standing in the review loop. Different-scale problems — but the lesson about measuring quality with machines transfers directly: Wakii's B0–B5 gate pipeline in the [story-workflow docs](/docs/story-workflow/) is the same idea — quality through quantitative gates, not one reviewer's gut. The post [convergence QA last tier](/blog/convergence-qa-last-tier/) tells how these check layers stack up in the process.

## What Wakii learns

- **ADOPT** — quality is a machine filter placed in front of the store, not a feeling: SelfInstruct blocks any instruction that fails a filter inside the generation loop and logs why each one was dropped. Wakii already applies the same principle in convergence QA — a post only enters the pool after the lint + audit machine gates; the audit records pendingRows for unfinished posts. One small completion remains: log the reject reason per occurrence (which filter blocked which post) into the audit's NOTE section.
- **DIRECTION** — benchmarks as a re-runnable module: BaseBenchmark standardizes name/data_dir/save_to for every gauge. Wakii could package a fixed set of story-workflow scenarios — fixtures being real transcripts already stored in the repo — to replay every time the workflow changes. Today convergence QA runs per story; there is no fixed suite that replays independently.
- **WATCH** — synthetic traces for scale testing: CAMEL uses role-play conversations as feedstock; the matching direction is generating simulated user-agent transcripts to test story-workflow before touching a real story. Promote to DIRECTION when the need for regression faster than real runs actually appears, not when it merely sounds nice.
- **N/A** — "finding the scaling laws of agents" and simulating millions of agents is a different-order research question; Wakii runs a workflow for one dev, it does not measure scaling laws.

If you are building agent workflows and want to see machine gates running on a real product, grab Wakii and start from the [getting-started docs](/docs/getting-started/) — every gate comes with evidence.
