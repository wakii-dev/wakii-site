---
title: "Exo: cụm máy cá nhân chạy mô hình lớn, không cần GPU riêng"
description: "Exo tự khám phá thiết bị qua multicast, dựng topology thành đồ thị và chia model theo bộ nhớ thật của từng máy. Bên trong cơ chế discovery, placement và leader election của một cụm p2p."
pubDate: "2026-10-15"
category: "tech"
tags: ["architecture", "oss"]
draft: false
---

Chạy một frontier model cần bộ nhớ vượt xa bất kỳ chiếc máy cá nhân nào: DeepSeek v3.1 bản 8-bit — 671 tỷ tham số theo benchmark của README exo — không chiếc máy nào nuốt nổi một mình. Hai lối quen thuộc: mua một trạm GPU đắt đỏ, hoặc bó hẹp với model nhỏ trên một máy. exo — repo exo-explore/exo, 47.308 stars theo GitHub API ngày 2026-09-08 — chọn lối thứ ba: nối những thiết bị sẵn có thành một cụm, rồi chia model cho từng máy. Bài này đọc code thật của exo để xem một cụm p2p không máy chủ điều phối cố định tự tổ chức bằng cơ chế nào.

TL;DR:

- exo nối các thiết bị sẵn có thành một cụm chạy model lớn hơn bộ nhớ của từng máy; hình dạng "cluster đồng nhất" nhường chỗ cho dàn máy không đồng nhất.
- Discovery tự tổ chức: mỗi thiết bị phát beacon UDP multicast, không cần file cấu hình — thấy rõ trong module Rust của repo.
- Topology của cụm là một đồ thị có hướng; placement chọn "vòng" thiết bị đủ bộ nhớ và chia hết cho sharding, ưu tiên nơi đã tải sẵn weights.
- Master được bầu ngang hàng với timeout ba giây và tie-break tất định — vai điều phối thuộc về cụm, không thuộc một máy.
- Mã vẫn chảy trên main (45 commits kể từ release cuối) nhưng nhịp release thưa dần: 10 bản từ tháng 1 đến tháng 4 rồi dừng (theo GitHub API ngày 2026-09-08).

## Cụm từ những máy đã có, không mua thêm GPU

README mở đầu bằng một câu định vị gọn: "connects all your devices into an AI cluster" (README exo-explore/exo). Khác các serving engine đặt trong datacenter, exo nhắm vào phần cứng cá nhân — Mac là nền chính, kèm app iOS nằm ngay trong repo. Theo README, cụm hỗ trợ RDMA qua Thunderbolt 5 với "99% reduction in latency between devices", và tensor parallelism cho tốc độ gấp 1,8 lần trên hai máy, 3,2 lần trên bốn máy.

Số liệu hiện tại theo GitHub API ngày 2026-09-08:

| Chỉ số | Giá trị |
| --- | --- |
| Stars | 47.308 |
| License | Apache-2.0 |
| Commit gần nhất (pushed) | 2026-08-25 |
| HEAD main | 21a54c5ea023 |

*Source: `gh api repos/exo-explore/exo`, ngày 2026-09-08.*

Điểm đáng học không nằm ở benchmark mà ở cách cụm hình thành: không máy nào được chỉ định vai trước, không danh sách node viết tay. Cả "dàn máy không đồng nhất" ấy tự dựng từ discovery, placement, và bầu vai khi cần.

## Tự khám phá thiết bị: beacon multicast, không file cấu hình

Câu hỏi đầu tiên của một cụm p2p: các node tìm nhau bằng gì? exo trả lời ở tầng Rust — module discovery phát beacon qua UDP multicast trên một địa chỉ nhóm cố định, kèm ba byte nhận diện:

```rust
const GROUP: Ipv6Addr = Ipv6Addr::new(0xff12, 0, 0, 0, 0, 0, 0xe0a1, 0xde89);
const MAGIC: [u8; 3] = *b"EXO";
```

*Source: `rust/networking/src/discovery.rs` @ `21a54c5ea023`, theo GitHub API ngày 2026-09-08 — [github.com/exo-explore/exo/blob/21a54c5ea023/rust/networking/src/discovery.rs](https://github.com/exo-explore/exo/blob/21a54c5ea023/rust/networking/src/discovery.rs)*

Cùng file đó dùng thư viện `netwatcher` theo dõi network interface: nối mạng là beacon bật, rời mạng là tắt. README tóm tắt trải nghiệm đúng theo cơ chế này: "Devices running exo automatically discover each other - no manual configuration". Không có bước "thêm node vào cluster" — mỗi thiết bị chỉ cần chạy exo trên cùng mạng, phần còn lại do beacon lo.

Cách nhìn system-design: cụm chuyển độ phức tạp cấu hình sang tầng mạng (multicast, namespace tách cụm) — một đánh đổi tường minh mà exo chọn nhất quán.

## Topology là đồ thị, placement là bài toán chọn vòng

Sau discovery, cụm cần một hình dạng. exo biểu diễn topology như một đồ thị có hướng: mỗi node là một thiết bị, mỗi cạnh là kết nối socket hoặc RDMA thật giữa hai máy:

```python
@dataclass
class Topology:
    _graph: rx.PyDiGraph[NodeId, SocketConnection | RDMAConnection] = field(
        init=False, default_factory=rx.PyDiGraph
    )
```

*Source: `src/exo/shared/topology.py` @ `21a54c5ea023` — [github.com/exo-explore/exo/blob/21a54c5ea023/src/exo/shared/topology.py](https://github.com/exo-explore/exo/blob/21a54c5ea023/src/exo/shared/topology.py)*

Khi một model cần chạy, bài toán phân mảnh quy về chọn "cycle" — vòng đi qua nhiều node — trong đồ thị đó:

```python
cycles = topology.get_cycles()
candidate_cycles = list(filter(lambda it: len(it) >= command.min_nodes, cycles))
cycles_with_sufficient_memory = filter_cycles_by_memory(
    candidate_cycles, node_memory, command.model_card.storage_size
)
```

*Source: `src/exo/master/placement.py` @ `21a54c5ea023` — [github.com/exo-explore/exo/blob/21a54c5ea023/src/exo/master/placement.py](https://github.com/exo-explore/exo/blob/21a54c5ea023/src/exo/master/placement.py)*

Pipeline đầy đủ trong `place_instance`: giữ vòng đủ số node → lọc vòng có tổng bộ nhớ chứa nổi model → với tensor parallelism, kiểm tra hidden_size và số kv_heads chia hết cho số node → chấm điểm vòng theo `_cycle_download_score`, tổng tỉ lệ weights từng node đã tải xong. Vòng nào giữ sẵn weights thì thắng: tải model nhiều gigabyte là chi phí lớn nhất khi dựng cụm. README tóm tắt đúng tinh thần: "figures out the best way to split your model across all available devices".

```
Topology (5 node — cạnh là kết nối thật):
   A <-> B <-> C
   |           |
   +-- D <-> E-+

place_instance chọn vòng chạy model:
   1. giữ vòng có đủ min_nodes node
   2. lọc vòng có tổng bộ nhớ >= storage_size của model
   3. tensor-parallel: hidden_size, kv_heads chia hết số node
   4. chấm điểm: ưu tiên vòng giữ sẵn weights (download score)
```

*Source: sơ đồ theo `place_instance` trong `src/exo/master/placement.py` @ `21a54c5ea023`, ngày 2026-09-08.*

## Master bầu ngang hàng: election ba giây, tie-break tất định

Cụm không máy chủ điều phối thì ai ra quyết định? exo bầu "master" tại runtime: mỗi node gửi ElectionMessage, ai cao hơn theo một thứ tự so sánh tất định thì thắng:

```python
DEFAULT_ELECTION_TIMEOUT = 3.0

class ElectionMessage(FrozenModel):
    clock: int
    seniority: int
    proposed_session: SessionId
    commands_seen: int
```

*Source: `src/exo/shared/election.py` @ `21a54c5ea023` — [github.com/exo-explore/exo/blob/21a54c5ea023/src/exo/shared/election.py](https://github.com/exo-explore/exo/blob/21a54c5ea023/src/exo/shared/election.py)*

Thứ tự so sánh nằm ngay trong `__lt__` của message: trước là clock (tinh thần Lamport clock — ai thấy nhiều sự kiện hơn đi trước), rồi seniority, rồi số lệnh đã thấy, cuối cùng là id của node để cuộc hòa nào cũng tất định. Timeout ba giây có ý nghĩa vận hành rõ: master biến mất thì cụm tự khôi phục vai trong vài giây thay vì treo chờ người thao tác. Đây là peer coordination đúng nghĩa — vai điều phối được bầu lại từ trong cụm, không cài đặt từ ngoài.

## Nhịp phát hành: mã chảy đều, release thưa dần

Mười bản gần nhất theo GitHub API ngày 2026-09-08:

| Tag | Ngày phát hành |
| --- | --- |
| v1.0.71 | 2026-04-23 |
| v1.0.70 | 2026-04-17 |
| v1.0.69 | 2026-03-27 |
| v1.0.68 | 2026-02-25 |
| v1.0.67 | 2026-01-28 |

*Source: `gh api "repos/exo-explore/exo/releases?per_page=10"`, ngày 2026-09-08.*

Mười bản gọn trong ba tháng rưỡi; sau đó không còn release mới tính đến ngày research, nhưng main vẫn chảy — 45 commits kể từ v1.0.71, gần nhất 2026-08-25. Đọc thẳng: dự án còn hoạt động nhưng nhịp phát hành dày đã lùi. Repo giữ giấy phép Apache-2.0, kèm dashboard quản lý cụm (localhost:52415 theo README).

Wakii không chia model ra nhiều máy, nhưng bài toán nền thì giống: nhiều session agent chạy song song cần phối hợp mà không giành tài nguyên của nhau — khung điều phối idea → plan → SF → gates của Wakii nằm trong [docs story-workflow](/vi/docs/story-workflow/).

## Wakii học được gì

- **ADOPT — tự đăng ký thay vì cấu hình tay cho multi-session.** Beacon "chạy exo là thấy nhau" khớp đúng zero-setup Wakii đã chọn ở lần chạy đầu (kit tự cài, idempotent — [docs getting started](/vi/docs/getting-started/)). Bề mặt kế tiếp nên đi tiếp: session multi-worktree hiện tự nhận port bằng cơ chế "bị chiếm thì nhảy port", chưa có bước tự giới thiệu giữa các session — self-registration khi mở session mới sẽ bỏ nốt chỗ cấu hình tay còn lại.
- **DIRECTION — chấm điểm theo thứ đã có sẵn khi xếp việc.** `_cycle_download_score` của exo ưu tiên node giữ sẵn weights; Wakii đã có cùng bản năng khi resume executor session thay vì chạy lại từ đầu (giữ ngữ cảnh), nhưng chưa thành tiêu chí tường minh khi dispatch SF — đáng ghi thành quy tắc: việc có sẵn session với ngữ cảnh thì xếp vào đó trước.
- **WATCH — cụm chịu lỗi khi node rời mạng.** Election ba giây và topology đồ thị của exo là mô hình cho trường hợp Wakii chạy đa máy: một máy rớt thì vai được bầu lại, việc được xếp lại. Wakii hiện có tầng relay tín hiệu giữa các máy (đã mổ trong [bài kiến trúc relay cloud](/vi/blog/arch-relay-cloud/)) nhưng chưa có kịch bản tự khôi phục vai khi một máy mất — điều kiện chuyển thành DIRECTION: khi tính năng đa máy ra khỏi phạm vi một máy duy nhất.
- **N/A — tầng vận chuyển RDMA và kernel tensor-parallel.** Tối ưu băng thông Thunderbolt, shard KV heads: ngoài product surface của Wakii, vốn không tự chạy model.

Nếu bạn muốn một đội agent có kỷ luật thay vì một cụm máy tự phát, tải Wakii và đọc [docs getting-started](/vi/docs/getting-started/) — story đầu tiên chỉ mất vài phút.
