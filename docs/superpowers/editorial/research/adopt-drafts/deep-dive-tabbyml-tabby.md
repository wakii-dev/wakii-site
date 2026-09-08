# ADOPT draft — local data-directory hygiene (TabbyML/tabby)

> Draft theo rubric style-guide §10 — SF-5 (FI-388) KHÔNG tự file issue;
> SF-6 file tập trung trên `wakii-dev/wakii`, label `enhancement`, sau review.
> License note: repo † NOASSERTION — draft này gọi "công khai trên GitHub",
> không dùng "open-source"/"mã nguồn mở".

## 1. Pattern

Data-directory hygiene: server khóa thư mục gốc dữ liệu cục bộ (chứa model
và index) còn lại mỗi owner (chmod 0o700) ngay khi khởi động, trước khi
ghi bất cứ thứ gì. Học từ `TabbyML/tabby` — trợ lý code tự host công khai
trên GitHub (33,869 stars, GitHub API báo license NOASSERTION, theo GitHub
API ngày 2026-09-08).

## 2. Evidence inline

Điểm vào của binary set permission cho thư mục dữ liệu trước mọi thao tác
khác (trích rút gọn, `crates/tabby/src/main.rs`, theo GitHub API ngày
2026-09-08):

```rust
let root = tabby_common::path::tabby_root();
std::fs::create_dir_all(&root).expect("Must be able to create tabby root");
let mut permissions = std::fs::metadata(&root).unwrap().permissions();
permissions.set_mode(0o700);
std::fs::set_permissions(&root, permissions).unwrap();
```

Nguồn:
https://github.com/TabbyML/tabby/blob/21b29048d7bcf6b94f9f482f2d0fd05efadfd19f/crates/tabby/src/main.rs

## 3. Đề xuất Wakii

Áp vào các thư mục state cục bộ mà Wakii tạo trên máy người dùng: thư mục
pairing/story state, thư mục index/cache của agent, và bất kỳ thư mục nào
chứa token hoặc dữ liệu phiên. Đề xuất: khởi tạo các thư mục đó với quyền
0o700 (hoặc rà + thu hẹp quyền nếu đã tạo rộng hơn) ngay trong setup
idempotent của kit — hành vi kỳ vọng: user khác trên cùng máy không đọc
được state/story/token; rủi ro chính: thấp (chỉ siết quyền, không đổi
chức năng), cần kiểm tra trường hợp thư mục state được mount/chia sẻ chủ
động bởi user trước khi siết.

## 4. Upstream links

- Repo: https://github.com/TabbyML/tabby
- File evidence: https://github.com/TabbyML/tabby/blob/21b29048d7bcf6b94f9f482f2d0fd05efadfd19f/crates/tabby/src/main.rs
- LICENSE (bối cảnh †): https://github.com/TabbyML/tabby/blob/21b29048d7bcf6b94f9f482f2d0fd05efadfd19f/LICENSE
- Bài deep-dive sẽ live tại `/blog/deep-dive-tabbyml-tabby/` (EN) và
  `/vi/blog/deep-dive-tabbyml-tabby/` (VI) sau khi story merge
  (build-in-public đã được user duyệt 2026-09-07).
