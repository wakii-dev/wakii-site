# ADOPT draft — gate máy trước gate người (học từ ast-grep/ast-grep)

> Draft SF-4/FI-387 (matrix #36) — SF-6 file tập trung sau review. KHÔNG tự
> file issue. Bài post sẽ live tại `/blog/deep-dive-ast-grep-ast-grep/` sau khi
> story merge (build-in-public đã duyệt 2026-09-07).

## 1. Pattern

Tool kiểm tra chạy trong CI với exit-status rõ ràng, quét TOÀN BỘ rule trước
khi con người đọc diff — vi phạm bị máy chặn ở layer giá rẻ, người chỉ nhận
phần máy không chấm được. ast-grep cụ thể hoá bằng: rule thành file YAML
(severity 5 mức + fix), `sg scan` trả `ExitCode`, action nhúng vào GitHub
Actions. Học từ **ast-grep/ast-grep** (15.799 sao, license MIT, theo GitHub
API ngày 2026-09-08).

## 2. Evidence inline

Chữ ký hàm scan trong CLI (theo GitHub API ngày 2026-09-08):

> `pub fn run_with_config(arg: ScanArg, project: Result<ProjectConfig>) -> Result<ExitCode>`

Nguồn: [crates/cli/src/scan.rs @ fc2b153](https://github.com/ast-grep/ast-grep/blob/fc2b1530db74de49131b725221de98036a552a9f/crates/cli/src/scan.rs) —
hàm trả `std::process::ExitCode`, tức `sg scan` thiết kế để CI pass/fail theo
exit-status. Thang severity rule 5 mức (theo GitHub API ngày 2026-09-08):

> `pub enum Severity { Off, Hint, Info, Warning, Error }`

Nguồn: [crates/config/src/rule_config.rs @ fc2b153](https://github.com/ast-grep/ast-grep/blob/fc2b1530db74de49131b725221de98036a552a9f/crates/config/src/rule_config.rs) —
đúng thang phân biệt "chỉ nhắc" với "phải sửa" mà một gate cần.

## 3. Đề xuất Wakii

- **Surface**: build chain blog (`scripts/check-blog-content.mjs` + parity) và
  gates B0-B5 của story workflow — Wakii ĐÃ áp nguyên tắc này (lint xanh trước
  reviewer đọc bài; audit machine-checkable). ADOPT ở đây = xác nhận + giữ
  nguyên tắc khi thêm rule mới.
- **Hành vi kỳ vọng**: mọi rule nội dung mới (từ vựng, schema, claim) phải
  machine-checkable VỚI EXIT-STATUS rõ ràng trước khi vào checklist review
  người — rule không express được bằng máy thì ghi review-only, không giả
  định máy bắt được. Thang severity gợi ý từ ast-grep: phân biệt rõ mức
  "note/nhắc" (không chặn) với mức "fail/chặn build" — hiện lint Wakii phần
  lớn là nhị phân pass/fail, INFO-only (NOTE) đã có ở audit T3/T7; giữ và
  khai thác hai lớp này nhất quán hơn.
- **Rủi ro chính**: rule máy tạo ảo giác an toàn khi chỉ phủ parse được
  (grep literal bắt literal, không bắt paraphrase) — giữ tầng review người
  cho claim ngữ nghĩa; máy chặn hình dạng, người chốt ý nghĩa.

## 4. Upstream links

- Repo: https://github.com/ast-grep/ast-grep
- File evidence (scan): https://github.com/ast-grep/ast-grep/blob/fc2b1530db74de49131b725221de98036a552a9f/crates/cli/src/scan.rs
- File evidence (severity): https://github.com/ast-grep/ast-grep/blob/fc2b1530db74de49131b725221de98036a552a9f/crates/config/src/rule_config.rs
- CI action: https://github.com/ast-grep/action
