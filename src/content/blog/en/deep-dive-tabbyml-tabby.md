---
title: "Tabby: self-hosted code assistant — inference on your own machine"
description: "Run a code assistant on your own infrastructure with Tabby: one binary, two commands, models running locally — and how to read a license when the GitHub API says NOASSERTION."
pubDate: "2026-10-23"
category: "tech"
tags: ["architecture", "license", "cli"]
draft: false
---

Most code assistants assume one direction of travel: your code goes up to a vendor's API, suggestions come back down. Tabby runs the opposite way — the server runs on your infrastructure, models are downloaded and executed locally, suggestions are generated inside your own network. The repository is public on GitHub with 33,869 stars per the GitHub API on 2026-09-08, but the most teachable detail sits in the LICENSE file — where the GitHub API reports NOASSERTION instead of a clean label. Reading both together is the full lesson in self-hosting a project like this.

- Tabby is a self-hosted code assistant: one Rust binary with exactly two commands — serve and download; VS Code, Vim, and IntelliJ clients connect through the API.
- Inference runs locally: pick a device (cpu/cuda/rocm/metal/vulkan), one model for completion, a different one for chat.
- The server indexes your code with a crawler and the tantivy search engine so completions carry real project context.
- The license is not one label: everything outside the ee/ directory is Apache 2.0, the ee/ directory has its own terms — which is why the GitHub API reports NOASSERTION.
- For Wakii: where inference runs is a deployment choice for the user; the story orchestration layer does not change with that choice.

## One binary, two commands, three clients

Tabby's Rust workspace holds 18 member crates, but the entry point is surprisingly lean: exactly two subcommands. serve brings up the API endpoint; download fetches models onto the machine. From the main entry point itself:

```rust
#[derive(Subcommand)]
pub enum Commands {
    /// Starts the api endpoint for IDE / Editor extensions.
    Serve(serve::ServeArgs),

    /// Download the language model for serving.
    Download(download::DownloadArgs),
}

pub enum Device {
    Cpu,
    Cuda,
    Rocm,
    Metal,
    Vulkan,
}
```

(excerpted from `crates/tabby/src/main.rs` — source: github.com/TabbyML/tabby/blob/21b29048d7bcf6b94f9f482f2d0fd05efadfd19f/crates/tabby/src/main.rs, per the GitHub API on 2026-09-08)

The doc comment states which piece does what: "Starts the api endpoint for IDE / Editor extensions". The VS Code, Vim, and IntelliJ clients — under the `clients/` directory — connect to that endpoint rather than embedding a model inside the editor. The architecture keeps three layers cleanly apart: models run on the server, the interface lives in the editor, and the contract between them is HTTP.

One small detail says a lot about the project's priorities: the main function sets 0o700 permissions on the data root before doing anything else. That directory holds the models and index data — locking it down to the owner only is the right default for a server that processes a company's private source code.

## What self-hosting actually means in practice

The project's README compresses its three headline features into a few lines, one of which reads verbatim: "Self-contained, with no need for a DBMS or cloud service." (source: the TabbyML/tabby README — github.com/TabbyML/tabby#-tabby). No external database, no mandatory cloud service — all state lives in a local data directory. The other two features: an OpenAPI interface for bolting the assistant onto existing infrastructure, and the ability to run on consumer-grade GPUs.

The sample launch command in the README says more than any description:

```bash
docker run -it \
  --gpus all -p 8080:8080 -v $HOME/.tabby:/data \
  tabbyml/tabby \
  serve --model StarCoder-1B --device cuda --chat-model Qwen2-1.5B-Instruct
```

(source: the TabbyML/tabby README — github.com/TabbyML/tabby#getting-started, quoted per the GitHub API on 2026-09-08)

One command and you have a completion-plus-chat server. Behind it, `serve.rs` shows each role gets its own model: `--model` for completion, `--chat-model` for chat — and if needed, `--chat-device` lets chat run on a different card than completion. Completion and chat have genuinely different resource profiles — one needs low latency, the other a long context window — and Tabby lets you tune each separately.

## Project context: the crawler and the index

Locally-hosted completion is only useful if it understands the codebase. Tabby solves this with two dedicated crates: `tabby-crawler` sweeps the registered repositories, and `tabby-index` builds the search index — on top of tantivy, a full-text search engine written in Rust. The whole context pipeline sits inside the workspace, not in an external service:

```
crates/
├── tabby/            # entry: serve + download
├── tabby-crawler/    # sweeps registered repos
├── tabby-index/      # search index (tantivy)
├── tabby-inference/  # completion + chat + embedding
├── llama-cpp-server/ # model backend
└── ...               # 13 more crates in the workspace
```

(source: Cargo.toml workspace + crates/ tree, per the GitHub API on 2026-09-08 — github.com/TabbyML/tabby/blob/main/Cargo.toml)

The server exposes exactly the routes you need: completions, chat completions, health, setting — with API docs auto-generated by utoipa plus a Swagger UI. That shape lets an operations team wire Tabby into an existing system through the API contract instead of adopting the project's UI wholesale.

One operational observation, dated for honesty: per the GitHub API on 2026-09-08, the last push to main landed on 2026-06-30; the latest stable release v0.32.0 shipped 2026-01-25, followed by one alpha release on 2026-02-09. Development pace has clearly slowed compared with the 2024 stretch — for anyone weighing a long-term self-hosted deployment, that belongs on the same scale as the infrastructure control this model buys you.

## Reading a license when GitHub says NOASSERTION

The GitHub API returns NOASSERTION as the license label for this repository — meaning its detector could not match a single SPDX standard. That does not mean the repo has no license; it means its license is longer than one label. The LICENSE file declares a directory-based split, quoting verbatim: "Content outside of the above mentioned directories or restrictions above is available under the 'Apache 2.0' license" — in other words, everything outside the ee/ directory is Apache 2.0, while the ee/ directory follows separate terms set out in ee/LICENSE.

(source: the TabbyML/tabby LICENSE file — github.com/TabbyML/tabby/blob/21b29048d7bcf6b94f9f482f2d0fd05efadfd19f/LICENSE, per the GitHub API on 2026-09-08)

That ee/ directory is no footnote: it contains tabby-webserver, tabby-db, and tabby-schema — the enterprise crates of the workspace — and in the code, those features are gated behind a dedicated cargo feature flag. Which is why the correct phrasing in this post is: the project is public on GitHub, with usage terms that differ by directory — not a single-label summary. The general lesson for anyone choosing tools by license: the label on the repo page is a machine's guess; when terms affect a deployment decision, read the original file.

## Where inference runs is a deployment decision, not an ideology

Back to our product: where does Wakii sit on the "where does your code travel" axis? Agents run locally through CLIs, story state lives on your machine, and under the relay model every outbound connection is a single controlled path. Tabby represents the far end of that axis: every layer — inference included — runs inside your own network. The two models are not mutually exclusive: the same story-workflow can run with an agent on a cloud API today and an on-prem endpoint tomorrow, because orchestration does not care where the model lives. If you are just starting out, [getting started](/docs/getting-started/) is where to read the default model before considering a swap.

## What Wakii learns

- **ADOPT** — local data-directory hygiene: Tabby sets 0o700 permissions on its data root at startup (evidence in the first section). Wakii keeps local state for pairing, stories, and indexing — auditing those directories to lock them down to the owner is a small, worthwhile change that alters no other behavior.
- **DIRECTION** — keep the agent layer decoupled from the model endpoint: Wakii's architecture already separates orchestration from inference; the direction worth proving is an on-premises (self-hosted) endpoint running end-to-end — with no real-world demand yet, it cannot be graded ADOPT.
- **WATCH** — development pace has slowed (last push 2026-06-30, latest stable v0.32.0 on 2026-01-25, per the GitHub API on 2026-09-08): watch another cycle; if activity returns, re-grade the above against fresh sources.
- **N/A** — directory-split licensing: Wakii keeps a single MIT license for the entire repository; the split-license pattern does not apply to our release model.

Wakii is an agentic IDE with a built-in superpowers team — disciplined agents, running on your machine, every consequential decision passing through a gate. [Download it](/docs/getting-started/) and run your first story to see the process, not just code suggestions.
