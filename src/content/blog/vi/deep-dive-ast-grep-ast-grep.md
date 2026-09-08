---
title: "ast-grep: tìm và sửa code theo AST"
description: "ast-grep tìm và sửa code theo cấu trúc cú pháp: pattern viết như code, rule phức tạp thành file YAML, sg scan chạy trong CI như một gate máy. Bài đọc code thật của repo để xem cơ chế đó hoạt động ra sao."
pubDate: "2026-10-18"
category: "tech"
tags: ["terminal", "cli"]
draft: false
---

grep làm việc trên chữ: đưa một chuỗi, nó trả về các dòng chứa chuỗi đó. Nhưng code không phải chữ thuần — code là cây cú pháp. Đổi tên biến, xuống dòng, thêm ngoặc: ý nghĩa giữ nguyên, kết quả grep đổi. Repo ast-grep/ast-grep — 15.799 sao, license MIT, theo GitHub API ngày 2026-09-08 — đi theo hướng ngược lại: tìm và sửa code theo cấu trúc, bằng pattern trông như chính code cần tìm.

TL;DR:

- Pattern viết như code: `$A && $A()` khớp mọi biểu thức cùng cấu trúc, bất kể format hay tên biến.
- Biến `$A` được lưu vào một environment khi khớp — tái dùng được khi rewrite.
- Rule phức tạp chuyển sang file YAML có severity và fix — rule thành dữ liệu, review được như code.
- `sg scan` đọc thư mục rule, trả ExitCode — hình dạng đúng của một lệnh cài vào CI.
- Wakii chạy cùng nguyên tắc ở blog pipeline: lint máy xanh trước, review người sau.

## Pattern viết như code, khớp theo cấu trúc

README của repo tóm gọn trong một câu: ast-grep là "a CLI tool for code structural search, lint, and rewriting" (ast-grep/ast-grep, [README](https://github.com/ast-grep/ast-grep/blob/fc2b1530db74de49131b725221de98036a552a9f/README.md)). Thứ nó so khớp không phải text mà là node của cây cú pháp do tree-sitter phân tích. Ví dụ chính chủ trong README:

```bash
ast-grep -p '$A && $A()' -l ts -r '$A?.()'
```

Một lệnh: tìm mọi chỗ gọi hai lần cùng một giá trị rồi sửa thành optional call `$A?.()`. Regex chỉ bắt mẫu này gọn khi bạn đoán trước được khoảng trắng và tên biến; pattern AST không cần đoán gì — `$A` khớp một node bất kỳ, và hai lần `$A` trong cùng pattern buộc hai node đó giống hệt nhau.

Cơ chế nằm ở một struct khá nhỏ trong crates/core. Comment của chính repo giải thích cách biến được "gắn" với code thật:

```rust
/// a dictionary that stores metavariable instantiation
/// const a = 123 matched with const a = $A will produce env: $A => 123
pub struct MetaVarEnv<'tree, D: Doc> {
  single_matched: HashMap<MetaVariableID, Node<'tree, D>>,
  multi_matched: HashMap<MetaVariableID, Vec<Node<'tree, D>>>,
  transformed_var: HashMap<MetaVariableID, Underlying<D>>,
}
```

Nguồn: [crates/core/src/meta_var.rs](https://github.com/ast-grep/ast-grep/blob/fc2b1530db74de49131b725221de98036a552a9f/crates/core/src/meta_var.rs), HEAD main ngày 2026-09-08.

Mỗi lần khớp, `$A` được ghi vào `MetaVarEnv` cùng node thật mà nó đại diện — bản ghi này tái dùng khi rewrite, nên phần thay thế biết chính xác phải chèn node nào. Ba dictionary tách bạch ba loại biến: khớp đơn, khớp nhiều node, và biến đã qua transform. Pattern vì thế vừa dễ viết (giống code thường) vừa đủ thông tin để sửa lại code đúng chỗ.

## Rule một dòng chưa đủ: chuyển rule thành file YAML

Pattern một dòng xử lý tốt việc tìm-và-thay đơn giản. Việc cấm một tập mẫu code phức tạp hơn — có điều kiện, có phạm vi — cần chỗ để mô tả rule ngoài lệnh CLI. ast-grep chọn YAML: mỗi rule khai id, ngôn ngữ, điều kiện khớp, severity và fix. Thang severity lấy thẳng từ code:

```rust
pub enum Severity {
  /// Turns off the rule.
  Off,
  #[default]
  /// A kind reminder for code with potential improvement.
  Hint,
  /// A suggestion that code can be improved or optimized.
  Info,
  /// A warning that code might produce bugs or does not follow best practice.
  Warning,
  /// An error that code produces bugs or has logic errors.
  Error,
}
```

Nguồn: [crates/config/src/rule_config.rs](https://github.com/ast-grep/ast-grep/blob/fc2b1530db74de49131b725221de98036a552a9f/crates/config/src/rule_config.rs), HEAD main ngày 2026-09-08.

Năm mức từ Off đến Error — đúng thang một CI gate cần để phân biệt "chỉ nhắc" với "phải sửa". Mô tả từng mức nằm cạnh enum như tài liệu: ai đọc rule cũng hiểu mức nào chặn build, mức nào chỉ gợi ý.

Chiều sâu của hệ rule nằm ở [crates/config/src/rule](https://github.com/ast-grep/ast-grep/tree/fc2b1530db74de49131b725221de98036a552a9f/crates/config/src/rule) (GitHub API ngày 2026-09-08) — thư mục này có các file mang tên cơ chế:

```
relational_rule.rs   rule quan hệ: inside / has
nth_child.rs         vị trí con trong node cha
stop_by.rs           điều kiện dừng khi đi trong cây
referent_rule.rs     rule tham chiếu rule khác
selector.rs          chọn node để rule khác áp lên
```

Rule quan hệ là điểm cộng lớn: một rule có thể nói "tìm mẫu X nằm trong mẫu Y" thay vì cố nhồi cả hai vào một pattern. Rule khi đó là dữ liệu có cấu trúc — đọc, review, version cùng repo như code, thay vì regex nhúng sâu trong script không ai dám sửa.

## `sg scan` trong CI: gate máy trước gate người

CLI mang tên ngắn `sg` (README gọi tool là "ast-grep(sg)"). Lệnh scan có file riêng trong CLI — và chữ ký của nó cho thấy thiết kế hướng CI:

```rust
pub fn run_with_config(arg: ScanArg, project: Result<ProjectConfig>) -> Result<ExitCode>
```

Nguồn: [crates/cli/src/scan.rs](https://github.com/ast-grep/ast-grep/blob/fc2b1530db74de49131b725221de98036a552a9f/crates/cli/src/scan.rs), HEAD main ngày 2026-09-08 — hàm trả `std::process::ExitCode`, tức exit-status của `sg scan` phản ánh kết quả quét, đúng thứ một CI job cần để pass/fail. Tổ chức ast-grep cũng duy trì repo `ast-grep/action` để nhúng bước scan vào GitHub Actions (tồn tại, 12 sao, theo GitHub API ngày 2026-09-08).

Nhịp release cho thấy tool sống đều: 5 trong 10 release gần nhất (theo GitHub API ngày 2026-09-08):

| Tag | Ngày |
|--------|------------|
| 0.45.3 | 2026-08-31 |
| 0.45.2 | 2026-08-23 |
| 0.45.1 | 2026-08-07 |
| 0.45.0 | 2026-07-23 |
| 0.44.1 | 2026-07-04 |

Nhỏ bản vá liên tục, bản minor quanh một tháng một — nhịp của tool đang được dùng thật, không phải repo trưng.

Điểm đáng học không nằm ở ast-grep mà ở hình dạng nó chọn: máy quét trước, người đọc sau. Một rule YAML không hay vẫn còn sửa được khi nó chạy lặng lẽ trong CI; nhưng không rule nào tồn tại nổi nếu mỗi lần vi phạm phải nhờ người dò bằng mắt. Wakii chạy cùng hình dạng cho blog pipeline — bài [CI gates: máy chặn trước, người chốt sau](/vi/blog/arch-ci-gates/) mô tả đúng cách xếp lớp này: lint từ vựng, band từ, parity hai locale chạy trước; review người chỉ nhận phần máy không chấm được.

## Một engine, nhiều mặt

Toàn repo là một workspace Rust chia theo ranh giới đúng: core là engine, config là hệ rule, phần còn lại là mặt cho từng môi trường (theo GitHub API ngày 2026-09-08):

```
crates/core     engine khớp pattern trên cây tree-sitter
crates/config   nạp rule YAML, severity, fix
crates/cli      dòng lệnh sg
crates/language định nghĩa ngôn ngữ
crates/napi     binding Node.js (npm @ast-grep/cli)
crates/wasm     chạy trong trình duyệt (playground online)
crates/lsp      language server cho editor
crates/pyo3     binding Python
```

Nguồn: [crates/](https://github.com/ast-grep/ast-grep/tree/fc2b1530db74de49131b725221de98036a552a9f/crates), GitHub API ngày 2026-09-08.

Tách engine khỏi giao diện là lý do tool này có mặt ở nhiều nơi mà không nhân bản logic: cùng một `MetaVarEnv`, cùng bộ rule YAML, chạy trong terminal, trong npm script, trên trang playground, và trong editor qua LSP. Đây cũng là cách Wakii xếp chồng các lớp kiểm: một lõi rule (manifest matrix + lint script) phục vụ nhiều mặt — lint lúc viết, audit lúc convergence, gate lúc build — thay vì mỗi mặt một bộ rule tự chế.

Nếu bạn muốn xem cách các lớp kiểm đó nằm trong một story thực tế — máy chạy lint ở từng SF, người ra quyết định ở gate — đọc [story workflow: từ idea đến release](/vi/docs/story-workflow/).

## Wakii học được gì

- **ADOPT** — nguyên tắc "gate máy trước gate người" Wakii đã áp và tiếp tục giữ: lint content (band từ, FORBIDDEN, marker grading) và parity hai locale chạy trong build chain trước khi reviewer đọc bài; gates B0-B5 cùng hình dạng đó ở tầng story. Watchdog ba lớp kiểm liveness cũng là một gate máy nữa ([idle is not dead](/vi/blog/watchdog-idle-is-not-dead/)). Bài này xác nhận hướng đi bằng một tool làm đúng nguyên tắc đó ở quy mô ngành.
- **DIRECTION** — kiểm theo AST cho nội dung: lint hiện tại là kiểm theo dòng (đếm band, grep literal, so heading level) và đủ cho rule dạng dữ liệu như FORBIDDEN list. Khi check phức tạp hơn mức dòng — cấu trúc section lồng nhau, schema frontmatter nhiều ràng buộc — hướng AST khả thi về nguyên lý vì tree-sitter có grammar markdown (tree-sitter-grammars/tree-sitter-markdown, MIT, theo GitHub API ngày 2026-09-08). Trung thực với hiện tại: chưa có check nào của blog cần tới AST — đây là hướng, không là việc đáng làm ngay.
- **WATCH** — scanner pattern-level cho script trong site repo: ast-grep hỗ trợ JavaScript sẵn; khi số rule code-level cần cấm trên các script kiểm tra tăng đến mức regex biểu diễn gãy, scanner kiểu `sg scan` với rule YAML thành ứng viên. Điều kiện đổi grade: xuất hiện rule code-level đầu tiên mà regex biểu diễn sai.

ast-grep có playground online để thử pattern không cần cài. Nếu bạn đang dựng pipeline nội dung hoặc workflow agent nhiều gate, tải Wakii và thử một story đầu tiên theo docs.
