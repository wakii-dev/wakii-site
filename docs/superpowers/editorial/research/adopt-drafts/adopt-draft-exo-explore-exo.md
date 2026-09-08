# ADOPT draft — exo-explore/exo (batch-3, matrix #29, SF-4/FI-387)

> Draft theo style-guide §10 — SF-6 file tập trung sau review (KHÔNG tự file
> issue từ SF). Grade nguồn: bài `deep-dive-exo-explore-exo` section
> "Wakii học được gì".

## 1. Pattern

**Tự đăng ký thay vì cấu hình tay (self-registration).** exo (47.308 stars,
Apache-2.0, theo GitHub API ngày 2026-09-08) để mỗi thiết bị tự phát beacon
UDP multicast khi tham gia mạng: node "chạy exo là thấy nhau", cụm hình thành
không cần danh sách node hay file cấu hình — độ phức tạp cấu hình chuyển sang
tầng mạng một cách tường minh.

## 2. Evidence inline

Trích hằng định danh beacon trong module discovery (nhóm multicast cố định +
magic byte nhận diện):

```rust
const GROUP: Ipv6Addr = Ipv6Addr::new(0xff12, 0, 0, 0, 0, 0, 0xe0a1, 0xde89);
const MAGIC: [u8; 3] = *b"EXO";
```

- Nguồn: `rust/networking/src/discovery.rs` @ commit `21a54c5ea023`, theo
  GitHub API ngày 2026-09-08.
- Bổ sung: cùng file đăng ký `netwatcher` theo dõi interface — vào mạng thì
  beacon bật, rời mạng thì tắt. README: "Devices running exo automatically
  discover each other - no manual configuration" (≤25 từ, attribution README
  exo-explore/exo).

## 3. Đề xuất Wakii

- **Surface áp dụng:** multi-session (một session một worktree). Hiện session
  tự nhận port dev bằng cơ chế "bị chiếm thì nhảy port kế tiếp" — hoạt động
  được nhưng thụ động, và chưa có bước các session tự giới thiệu lẫn nhau.
- **Wakii đã áp cùng hướng:** zero-setup ở lần chạy đầu — kit tự cài vào
  `~/.claude/` (skills + agent definitions + story-* CLIs), idempotent, không
  đụng config sẵn.
- **Đề xuất tiếp theo:** khi mở session mới, session phát một "beacon" ứng
  dụng cấp cao (danh tính worktree + phạm vi port + trạng thái) vào kênh dùng
  chung của workspace, để panel/list session tự hiện thành viên thay vì đợi
  quét port. Kỳ vọng hành vi: mở session thứ hai là thấy cả hai trong panel
  ngay, kể cả khi session đầu chưa mở dev server; rủi ro chính là beacon treo
  khi session chết đột ngột — cần TTL/hết hạn giống cơ chế interface-watch của
  exo (beacon gắn với vòng đời interface), không thêm file state cần dọn tay.

## 4. Upstream links

- Repo: https://github.com/exo-explore/exo
- Commit đọc code: https://github.com/exo-explore/exo/commit/21a54c5ea023
- `discovery.rs`: https://github.com/exo-explore/exo/blob/21a54c5ea023/rust/networking/src/discovery.rs
- `placement.py` (evidence phụ, grade DIRECTION cùng bài): https://github.com/exo-explore/exo/blob/21a54c5ea023/src/exo/master/placement.py
- Blog post public (sau khi story merge): `/blog/deep-dive-exo-explore-exo/`
