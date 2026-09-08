---
title: "Exo: an AI cluster from the devices you already own"
description: "Exo discovers devices via multicast, models the cluster as a graph, and splits models by each machine's real memory. Inside the discovery, placement, and leader election code of a p2p cluster."
pubDate: "2026-10-15"
category: "tech"
tags: ["architecture", "oss"]
draft: false
---

Running a frontier model demands memory far beyond any single personal machine: DeepSeek v3.1 at 8-bit — 671 billion parameters per the exo README benchmarks — does not fit on one device. The familiar paths are buying an expensive GPU rig, or settling for a small model on one machine. exo — repo exo-explore/exo, 47,308 stars per the GitHub API on 2026-09-08 — takes a third path: connect the devices you already have into a cluster, then split the model across them. This post reads exo's actual code to see how a peer-to-peer cluster with no fixed coordinator server organizes itself.

TL;DR:

- exo turns existing devices into a cluster that runs models larger than any single machine's memory; the shape of a "homogeneous cluster" gives way to a heterogeneous fleet.
- Discovery is self-organizing: every device emits a UDP multicast beacon, no config file required — visible in the repo's Rust module.
- The cluster's topology is a directed graph; placement picks a "cycle" of devices with enough memory and divisibility for sharding, preferring nodes that already hold the weights.
- The master is elected among peers with a three-second timeout and a deterministic tie-break — the coordinating role is owned by the cluster, not installed on one machine.
- Code still flows on main (45 commits since the last release) but the release cadence has thinned: 10 releases from January to April, then silence (per the GitHub API on 2026-09-08).

## A cluster from machines you already have

The README opens with a compact positioning line: "connects all your devices into an AI cluster" (README exo-explore/exo). Unlike serving engines housed in datacenters, exo targets personal hardware — Mac is the primary platform, with an iOS app living inside the repo. Per the README, the cluster supports RDMA over Thunderbolt 5 with a "99% reduction in latency between devices", and tensor parallelism for up to 1.8x speedup on two machines and 3.2x on four. The README's flagship benchmark: DeepSeek v3.1 671B at 8-bit on four M3 Ultra Mac Studio 512GB machines wired over Thunderbolt.

Current numbers per the GitHub API on 2026-09-08:

| Metric | Value |
| --- | --- |
| Stars | 47,308 |
| License | Apache-2.0 |
| Latest commit (pushed) | 2026-08-25 |
| HEAD of main | 21a54c5ea023 |

*Source: `gh api repos/exo-explore/exo`, fetched 2026-09-08.*

The interesting part is not the benchmark but how the cluster forms: no machine is pre-assigned a role, no hand-written node list sits in a config file. That heterogeneous fleet assembles itself through two mechanisms — discovery and placement — plus a third one that elects a coordinator when needed.

## Device discovery: multicast beacons, no config file

The first question for any p2p cluster: how do nodes find each other? exo answers at the Rust layer — the discovery module emits beacons over UDP multicast on a fixed group address, carrying a three-byte signature:

```rust
const GROUP: Ipv6Addr = Ipv6Addr::new(0xff12, 0, 0, 0, 0, 0, 0xe0a1, 0xde89);
const MAGIC: [u8; 3] = *b"EXO";
```

*Source: `rust/networking/src/discovery.rs` @ `21a54c5ea023`, per the GitHub API on 2026-09-08 — [github.com/exo-explore/exo/blob/21a54c5ea023/rust/networking/src/discovery.rs](https://github.com/exo-explore/exo/blob/21a54c5ea023/rust/networking/src/discovery.rs)*

The same file watches network interface changes through the `netwatcher` library: a machine that just joined the Wi-Fi starts beaconing; when it leaves, the beacon stops with the interface. The README's user-facing summary matches this mechanism exactly: "Devices running exo automatically discover each other - no manual configuration". There is no "add node to cluster" step — a device only needs to run exo on the same network, and the beacons do the rest.

The system-design read: the cluster moves configuration complexity away from the user and pays for it at the network layer (multicast, nonces against echo, namespaces to separate clusters). It is an explicit trade-off, and exo consistently picks the zero-config side.

## Topology as a graph, placement as cycle selection

After discovery, the cluster needs a shape. exo represents topology as a directed graph: each node is a device, each edge is a real socket or RDMA connection between two machines:

```python
@dataclass
class Topology:
    _graph: rx.PyDiGraph[NodeId, SocketConnection | RDMAConnection] = field(
        init=False, default_factory=rx.PyDiGraph
    )
```

*Source: `src/exo/shared/topology.py` @ `21a54c5ea023` — [github.com/exo-explore/exo/blob/21a54c5ea023/src/exo/shared/topology.py](https://github.com/exo-explore/exo/blob/21a54c5ea023/src/exo/shared/topology.py)*

When a model needs to run, the partitioning problem reduces to picking a "cycle" — a loop through multiple nodes — in that graph:

```python
cycles = topology.get_cycles()
candidate_cycles = list(filter(lambda it: len(it) >= command.min_nodes, cycles))
cycles_with_sufficient_memory = filter_cycles_by_memory(
    candidate_cycles, node_memory, command.model_card.storage_size
)
```

*Source: `src/exo/master/placement.py` @ `21a54c5ea023` — [github.com/exo-explore/exo/blob/21a54c5ea023/src/exo/master/placement.py](https://github.com/exo-explore/exo/blob/21a54c5ea023/src/exo/master/placement.py)*

The full pipeline inside `place_instance`: keep cycles with enough nodes → filter cycles whose total memory fits the model → for tensor parallelism, check that hidden_size and the kv_heads count divide evenly across the nodes → score cycles with `_cycle_download_score`, the sum of each node's completed weight-download fraction. A cycle that already holds the weights wins: downloading a multi-gigabyte model is the largest cost when forming a cluster, and placement respects that cost. The README summarizes the same spirit: "figures out the best way to split your model across all available devices".

```
Topology (5 nodes — edges are real connections):
   A <-> B <-> C
   |           |
   +-- D <-> E-+

place_instance picks a cycle to run the model:
   1. keep cycles with >= min_nodes nodes
   2. filter cycles whose total memory >= model storage_size
   3. tensor-parallel: hidden_size, kv_heads divisible by node count
   4. score: prefer cycles already holding the weights (download score)
```

*Source: diagram based on `place_instance` in `src/exo/master/placement.py` @ `21a54c5ea023`, fetched 2026-09-08.*

## Peer-elected master: three-second election, deterministic tie-break

If the cluster has no coordinator server, who decides? exo elects a "master" at runtime: every node sends an ElectionMessage, the highest one under a deterministic ordering wins, and the default timeout is three seconds:

```python
DEFAULT_ELECTION_TIMEOUT = 3.0

class ElectionMessage(FrozenModel):
    clock: int
    seniority: int
    proposed_session: SessionId
    commands_seen: int
```

*Source: `src/exo/shared/election.py` @ `21a54c5ea023` — [github.com/exo-explore/exo/blob/21a54c5ea023/src/exo/shared/election.py](https://github.com/exo-explore/exo/blob/21a54c5ea023/src/exo/shared/election.py)*

The ordering lives in the message's own `__lt__`: first the clock (Lamport-clock spirit — whoever has seen more events goes first), then seniority, then the number of commands seen, and finally the node id so every tie resolves deterministically. The three-second timeout has a clear operational meaning: if the master disappears, the cluster re-elects within seconds instead of freezing until a human intervenes. That is peer coordination in the true sense — the coordinating role still exists, but it is re-elected from inside the cluster rather than installed from outside.

## Release cadence: code flows, releases thin out

The ten most recent releases per the GitHub API on 2026-09-08:

| Tag | Published |
| --- | --- |
| v1.0.71 | 2026-04-23 |
| v1.0.70 | 2026-04-17 |
| v1.0.69 | 2026-03-27 |
| v1.0.68 | 2026-02-25 |
| v1.0.67 | 2026-01-28 |

*Source: `gh api "repos/exo-explore/exo/releases?per_page=10"`, fetched 2026-09-08.*

Ten releases in three and a half months from early January to late April; after that, no new release up to the research date — yet main keeps moving, with 45 commits since v1.0.71, the latest on 2026-08-25. The honest read: the project is alive, but its dense-release phase has receded, and anyone planning to depend on it long-term should note that. The repo stays under the Apache-2.0 license, with a cluster-management dashboard included (running at localhost:52415 per the README).

Wakii does not split models across machines, but the underlying problem rhymes: many agent sessions running in parallel need to coordinate without fighting over each other's resources — Wakii's idea → plan → SF → gates orchestration frame is documented in the [story-workflow docs](/docs/story-workflow/).

## What Wakii learns

- **ADOPT — self-registration instead of manual configuration for multi-session.** exo's "run it and they find each other" beacon matches the zero-setup choice Wakii already made at first run (the kit self-installs, idempotent — the [getting started docs](/docs/getting-started/)). The next surface should keep going this way: multi-worktree sessions currently claim ports via a "jump to the next one if taken" mechanism, with no introduction step between sessions — self-registration when a session opens would remove the last piece of manual configuration.
- **DIRECTION — score work by what is already there.** exo's `_cycle_download_score` prefers nodes that already hold the weights; Wakii has the same instinct when it resumes an executor session instead of starting fresh (context is kept), but it is not yet an explicit criterion when dispatching SFs — worth writing down as a rule: work that has a session with ready context gets placed there first.
- **WATCH — cluster resilience when a node drops.** exo's three-second election and graph topology are a model for the case where Wakii runs across machines: one machine fails, the role is re-elected, the work is re-placed. Wakii already has a signal-relay layer between machines (dissected in our [relay cloud architecture post](/blog/arch-relay-cloud/)) but has no role-recovery scenario when a machine disappears — the condition to promote this to DIRECTION: when multi-machine support leaves the single-machine scope.
- **N/A — the RDMA transport layer and tensor-parallel kernels.** Thunderbolt bandwidth tuning, KV-head sharding: outside Wakii's product surface, which does not run models itself.

If you want a disciplined agent team instead of a self-assembling machine cluster, grab Wakii and read the [getting-started docs](/docs/getting-started/) — your first story takes only a few minutes.
