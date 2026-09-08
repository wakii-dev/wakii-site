---
title: "AutoGen: Microsoft's multi-agent framework, disassembled"
description: "AutoGen — 60,866 stars — rewrote its entire core at v0.4: from conversation-driven orchestration to an event-driven actor runtime. This post dissects that mechanism, the boundaries of the rewrite, and the repo's two-layer licensing."
pubDate: "2026-10-13"
category: "tech"
tags: ["agents", "architecture"]
draft: false
---

AutoGen is one of Microsoft's most visible multi-agent frameworks — 60,866 stars per
the GitHub API on 2026-09-08. The star count is not the interesting part. The
interesting part is a rare decision: while the framework had thousands of real users,
the team rewrote the entire core at v0.4 — dropping conversation-driven orchestration
and rebuilding around an actor-style runtime. A large rewrite of a framework running
in production is a trade: old APIs break, but the old architecture
can no longer carry the new scale. This post dissects the event-driven mechanism of
v0.4, the boundaries the team drew around the rewrite, and a detail most people miss:
this repo has two different license layers.

TL;DR:

- v0.2 orchestrated agents through turn-taking conversations; v0.4 replaced that with
  an actor runtime: agents receive and send message envelopes through a central
  message queue.
- Two layers: `autogen-core` is the event-driven runtime, `autogen-agentchat` is the
  high-level API with teams and defaults built in.
- The rewrite had clear boundaries: the old `autogen` name became a proxy pointing to
  the new API; v0.2 code must pin manually — there is no automatic shim.
- Dual licensing: package code is MIT (the `LICENSE-CODE` files), while the repo root
  declares CC-BY-4.0 — the GitHub API shows CC-BY-4.0.
- The repo is now in maintenance mode; the last release was `python-v0.7.5` on
  2025-09-30, with Microsoft Agent Framework as the successor.

## Conversation as the orchestrator, and where it breaks under scale

The v0.2 model puts conversation at the center: a few agents talk in turns inside one
group chat, and application logic lives in how you steer the flow — who speaks next,
when to stop, who synthesizes. The developer is both the role designer and the
moderator. It is intuitive and easy to demo — the "conversation programming" style
that the documentation of that era named as such.

The break shows up as agents and sessions multiply. Control flow is scattered across
message content, so testing one role in isolation is hard: every role is welded to a
shared conversation thread; adding a role means rewriting the script rather than
adding a connection with a clear boundary. The README describes AutoGen as a
"framework for creating multi-agent AI applications"
([source](https://github.com/microsoft/autogen/blob/027ecf0a379bcc1d09956d46d12d44a3ad9cee14/README.md))
— and when "multi" grows large enough, the shared conversation becomes the bottleneck
of the thing itself.

Wakii faces the same problem at smaller scale and chose the opposite direction: a
story is staffed by nine narrow agents with one-way information flow instead of a
free-for-all conversation — see
[nine agents, separated powers](/blog/nine-agents-separated-powers/).

## The v0.4 rewrite: agents are actors, the runtime is the post office

v0.4 replaces the conversation with an actor-style runtime: agents no longer call each
other directly; they receive and send message envelopes through a central message
queue. In the source of `SingleThreadedAgentRuntime`, three envelope types share one
queue:

```python
@dataclass(kw_only=True)
class PublishMessageEnvelope:
    """A message envelope for publishing messages to all agents that can handle
    the message of the type T."""

    message: Any
    cancellation_token: CancellationToken
    sender: AgentId | None
    topic_id: TopicId
```

(Excerpt from
`python/packages/autogen-core/src/autogen_core/_single_threaded_agent_runtime.py` @
commit `027ecf0a` —
[source](https://github.com/microsoft/autogen/blob/027ecf0a379bcc1d09956d46d12d44a3ad9cee14/python/packages/autogen-core/src/autogen_core/_single_threaded_agent_runtime.py),
per the GitHub API on 2026-09-08.)

Publish follows a pub-sub model: the message carries a `topic_id`, the runtime looks
up subscriptions and delivers to every agent subscribed to that topic — except the
sender itself:

```python
recipients = await self._subscription_manager.get_subscribed_recipients(
    message_envelope.topic_id
)
for agent_id in recipients:
    # Avoid sending the message back to the sender
    if message_envelope.sender is not None and agent_id == message_envelope.sender:
        continue
```

(`_process_publish`, same file @ `027ecf0a` —
[source](https://github.com/microsoft/autogen/blob/027ecf0a379bcc1d09956d46d12d44a3ad9cee14/python/packages/autogen-core/src/autogen_core/_single_threaded_agent_runtime.py).)

Next to pub-sub there is an RPC path: `SendMessageEnvelope` carries a `Future`, and
the runtime resolves it when the target agent responds — the caller just awaits it
like a normal function call. Both paths converge in a single loop, `_process_next`,
which dequeues one envelope and dispatches it:

```
        publish (topic)                     send (RPC)
             |                                  |
             v                                  v
  +---------------------------------------------+
  |        SingleThreadedAgentRuntime           |
  |  message_queue: [envelope, envelope, ...]   |
  |       _process_next -> dispatch             |
  +---------------------------------------------+
        |              |                |
        v              v                v
   agent A         agent B          agent C
   (topic X)       (topic X)        (RPC target)
```

Why does this hold up better under scale? One: roles decouple from sessions — an agent
only needs to subscribe to the right message type. Two: concurrency is natural —
handlers run under `asyncio.gather`, and adding an agent means no script rewrite.
Three: observability — every message crosses one chokepoint, so telemetry hooks in
once (OpenTelemetry is imported straight in the runtime file).

## Two layers: event-driven at the bottom, defaults on top

The v0.4 rewrite also split the product into two package layers. `autogen-core` holds
the minimal runtime; `autogen-agentchat` is the high-level API built on top of it,
with preset-behavior agents and teams following the familiar multi-agent design
patterns. The `autogen-agentchat` README draws the line explicitly: high-level for
beginners, and the `autogen-core` "event-driven programming model"
([source](https://github.com/microsoft/autogen/blob/027ecf0a379bcc1d09956d46d12d44a3ad9cee14/python/packages/autogen-agentchat/README.md))
for those who need deeper control.

This split resolves a familiar tension: beginners need defaults, experts need control
— in the same repo. Event-driven at the bottom, defaults on top: the high-level API
does not pay the architecture tax, and the architecture is not squeezed by the
conveniences of the layer above.

## The rewrite had boundaries: the old name became a gateway to the new one

The rewrite did not abandon existing users — but the way it kept them is not an
automatic shim. The interesting part sits in the `pyautogen` package in the tree: its
[pyproject](https://github.com/microsoft/autogen/blob/027ecf0a379bcc1d09956d46d12d44a3ad9cee14/python/packages/pyautogen/pyproject.toml)
declares it a proxy package whose only dependency points straight at
`autogen-agentchat>=0.6.4` (per the GitHub API on 2026-09-08). The package README
says:

> This is a proxy package for the latest version of autogen-agentchat. If you are
> looking for the 0.2.x version, please pin to `pyautogen~=0.2.0`.
>
> — README of `pyautogen`
> ([source](https://github.com/microsoft/autogen/blob/027ecf0a379bcc1d09956d46d12d44a3ad9cee14/python/packages/pyautogen/README.md))

In other words: `pip install autogen` today installs the new API; v0.2 code must
actively pin `~=0.2.0` or follow the migration guide. The old name remains as a
gateway leading into the new architecture — there is no shim translating old calls.
That is a clear rewrite boundary: keep the asset of the name and the install path,
drop the core model.

The release history shows where the story went. After v0.4, releases shipped every
few weeks, and then the gaps widened:

| Tag | Release date |
|---|---|
| `python-v0.6.0` | 2025-06-05 |
| `python-v0.6.4` | 2025-07-09 |
| `python-v0.7.1` | 2025-07-28 |
| `python-v0.7.4` | 2025-08-19 |
| `python-v0.7.5` | 2025-09-30 |

(Tags `python-v0.6.0` through `python-v0.7.5` per the GitHub API on 2026-09-08; the
most recent push to main was 2026-04-15.)

The last release was `python-v0.7.5` on 2025-09-30 — nearly a year before the probe
date. The README today wraps the repo in a maintenance-mode caution: "AutoGen is now
in maintenance mode. It will not receive new features or enhancements and is
community managed going forward." — and points newcomers to Microsoft Agent Framework
with its own migration guide. Rewrite, compat, then sunset — three acts of one
lifecycle, and this repo leaves clear traces of all three.

## Dual licensing: MIT code, CC-BY-4.0 docs

A detail that is easy to misread: the GitHub API reports the license of
`microsoft/autogen` as CC-BY-4.0. True — but only for one layer. The `LICENSE` file at
the repo root is Creative Commons Attribution 4.0; meanwhile each code package
declares its own `LICENSE-CODE` under MIT in `pyproject.toml`, with the classifier
"License :: OSI Approved :: MIT License".

| Layer | File | License |
|---|---|---|
| Repo root | `LICENSE` | CC-BY-4.0 |
| Package code (`autogen-core`,…) | `LICENSE-CODE` | MIT |

(Recorded per the GitHub API on 2026-09-08; see the
[root LICENSE](https://github.com/microsoft/autogen/blob/027ecf0a379bcc1d09956d46d12d44a3ad9cee14/LICENSE)
and
[autogen-core's LICENSE-CODE](https://github.com/microsoft/autogen/blob/027ecf0a379bcc1d09956d46d12d44a3ad9cee14/python/packages/autogen-core/LICENSE-CODE).)

The two-file structure makes sense for a repo whose product is both code and
documentation: code keeps a standard software license (MIT), docs keep a content
license that permits free redistribution. The thing to remember: GitHub's classifier
reads the root `LICENSE`, so dashboards show CC-BY-4.0 — that number describes the
docs, not the code. Every license number copied from a dashboard deserves this
same one-layer check.

## What Wakii learns

- **ADOPT** — "bounded rewrite" as a release discipline: when Wakii changes a public
  surface (layout, page names, gate contracts), keep the old path/name as a gateway
  into the new thing, with a migration guide — the `pyautogen` proxy + migration
  guide pattern. Precedent already exists: seed posts grandfathered when copy
  changed.
- **DIRECTION** — topic-based message passing between agents: Wakii's nine-agent team
  is currently invoked sequentially by a coordinator, with one-way information flow.
  If orchestration ever moves to many agents reacting to events (gate-open,
  review-requested), the pub-sub shape of AutoGen's runtime is worth trying — not
  applied now because the coordinator-driven scale is sufficient.
- **WATCH** — distributed runtime for the task DAG: AutoGen also has a distributed
  runtime variant (same interface, multiple hosts). The condition to revisit: when
  Wakii's task DAG outgrows one machine, or multiple worktree sessions need to react
  to a shared event stream.

Wakii takes the shorter road than AutoGen: nine narrow roles inside a harness you do
not have to build, rather than assembling your own runtime — the
[agents-and-kit](/docs/agents-and-kit/) docs describe how that team divides its
powers. If you are building a multi-agent system: download Wakii, try the story
workflow, and start small — before you need a runtime actor at scale.
