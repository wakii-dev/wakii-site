# exo-explore/exo — research digest (batch-3, matrix #29)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: exo-explore/exo
- facet: inference
- stars @ 2026-09-08: 47306 (probe SF-1) · 47308 (re-probe SF-4, `gh api repos/exo-explore/exo` trực tiếp cùng ngày — drift 2 sao trong ngày, bài dùng 47308)
- license (GitHub API 2026-09-08): Apache-2.0
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`; re-probe SF-4 cùng ngày)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — "exo connects all your devices into an AI cluster": nối
      thiết bị sẵn có thành cụm chạy model vượt bộ nhớ một máy. Feature chính
      theo README (ngày 2026-09-08): automatic device discovery (không config
      tay); RDMA over Thunderbolt 5 (day-0, "99% reduction in latency between
      devices" — claim README); topology-aware auto parallel (chia model theo
      view realtime của topology: tài nguyên + latency/bandwidth từng link);
      tensor parallelism (1.8x trên 2 máy, 3.2x trên 4 máy — claim README);
      backend MLX + MLX distributed; API compat OpenAI/Claude/Ollama; dashboard
      tại localhost:52415. Benchmark README: DeepSeek v3.1 671B (8-bit) trên
      4 × M3 Ultra Mac Studio (nguồn Jeff Geerling). Có app iOS trong repo
      (app/EXO — Thunderbolt bridge detector). macOS first (quick start).
- [x] Architecture — cấu trúc code @ HEAD main `21a54c5ea023` (2026-08-25):
      `rust/networking/src/discovery.rs` = discovery UDP multicast IPv6
      (nhóm ff12::e0a1:de89, magic `b"EXO"`, netwatcher theo dõi interface,
      messaging zenoh); `src/exo/shared/topology.py` = Topology là đồ thị có
      hướng (rustworkx PyDiGraph, cạnh SocketConnection | RDMAConnection,
      get_cycles()); `src/exo/master/placement.py` = place_instance lọc cycle
      (≥ min_nodes → đủ bộ nhớ storage_size → divisibility tensor-parallel
      hidden_size/kv_heads → `_cycle_download_score` ưu tiên weights đã tải
      sẵn); `src/exo/shared/election.py` = bầu master ngang hàng
      (ElectionMessage: clock/seniority/commands_seen, tie-break node id,
      DEFAULT_ELECTION_TIMEOUT = 3.0). Còn: worker/engines/mlx (auto_parallel),
      routing/, app/EXO iOS.
- [x] Releases — theo GitHub API ngày 2026-09-08: mới nhất v1.0.71
      (2026-04-23); 10 bản từ v1.0.62 (2026-01-08) đến v1.0.71 (2026-04-23) =
      ~10 bản/3.5 tháng rồi dừng; sau đó KHÔNG release mới tính đến ngày
      research nhưng main vẫn chảy: 45 commits kể từ v1.0.71 (query
      `commits?since=2026-04-23T15:04:10Z`), pushed_at 2026-08-25. Đọc thẳng:
      dự án còn hoạt động, nhịp release thưa hẳn.
- [x] Wakii grading — ADOPT: tự đăng ký thay vì cấu hình tay (discovery beacon
      ↔ zero-setup Wakii; bề mặt kế tiếp = multi-session self-registration);
      DIRECTION: chấm điểm theo thứ có sẵn (`_cycle_download_score` ↔ resume
      executor giữ context khi dispatch SF); WATCH: cụm chịu lỗi khi node rời
      mạng (election 3s ↔ relay tín hiệu đa máy, chưa có tự khôi phục vai);
      N/A: RDMA/tensor-parallel kernel.
