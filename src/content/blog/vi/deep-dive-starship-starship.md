---
title: "Starship: prompt shell nhanh và đa shell"
description: "Bóc cơ chế Starship — một binary Rust cho mười shell, hơn 100 module tín hiệu, config TOML degrade an toàn — và prompt như tín hiệu trạng thái workspace trong workflow nhiều worktree."
pubDate: "2026-10-20"
category: "tech"
tags: ["terminal", "cli", "workflow"]
draft: false
---

Prompt shell là dòng chữ bạn nhìn nhiều nhất trong ngày làm việc — và cũng là tín hiệu rẻ nhất để trả lời câu hỏi lập đi lập lại: "mình đang ở repo nào, nhánh nào, cây có bẩn không". Trong workflow chạy nhiều worktree song song, câu hỏi đó thành "mình đang ở worktree của SF nào" — nhầm worktree là sửa nhầm nhánh. Starship trả lời bằng chính dòng prompt: 59.816 sao, 2.654 fork, license ISC (theo GitHub API ngày 2026-09-08), README tự mô tả — "The minimal, blazing-fast, and infinitely customizable prompt for any shell!" ([starship/starship](https://github.com/starship/starship), GitHub API ngày 2026-09-08). Đằng sau dòng quảng cáo là một kiến trúc đáng học về cách phân phối một binary lên nhiều môi trường và cách xử lý config của người dùng.

## TL;DR

- Một binary Rust duy nhất, mười shell được ghép qua init scripts mỏng trong `src/init/` — bash, zsh, fish, PowerShell, nushell…
- Prompt được ghép từ hơn 100 module độc lập: git branch, git status, docker context, thời gian lệnh, thậm chí context window của agent.
- Config TOML hỏng không làm sập prompt — `ModuleConfig::load` bắt lỗi, warn rồi về giá trị mặc định.
- git_status tính diff trong tiến trình qua gitoxide, hiển thị 10 trạng thái repo bằng symbol.
- Wakii học được hai điều ngay: config degrade an toàn, và tín hiệu ambient về trạng thái workspace.

## Một binary, mười shell

Cách Starship hỗ trợ "any shell" là bài học về ranh giới. Toàn bộ logic — chạy module, khớp regex, render ANSI — nằm trong một binary Rust duy nhất. Mười shell chỉ cần một thứ: một script init mỏng bảo shell "trước khi in prompt, gọi starship". Thư mục `src/init/` (probe GitHub API ngày 2026-09-08) chứa đúng mười script:

```
src/init/
├── starship.bash    ├── starship.ps1     (PowerShell)
├── starship.zsh     ├── starship.nu      (Nushell)
├── starship.fish    ├── starship.tcsh
├── starship.elv     ├── starship.ion
├── starship.lua     └── starship.xsh     (Xonsh)
```

(nguồn: [thư mục src/init @ commit 864500b](https://github.com/starship/starship/tree/864500b26904cd3cc01fc2a19d3ad068bd1517a2/src/init), probe 2026-09-08)

Mỗi script chỉ làm cầu nối: hook prompt của shell đó, gọi binary, nhận chuỗi đã render. Delta tích hợp được giữ ở mức tối thiểu — thêm shell mới không đụng vào 100+ module, viết thêm một script mỏng là xong. Đây là cách một sản phẩm single-binary phủ được nhiều môi trường mà không phình thành mười codebase.

## Hơn 100 module: mỗi tín hiệu một module

Prompt của Starship được ghép từ các module độc lập. File `src/module.rs` khai const `ALL_MODULES` — một danh sách dài hơn 100 tên: `aws`, `docker_context`, `git_branch`, `git_commit`, `git_metrics`, `git_state`, `git_status`, `cmd_duration`, `directory`… ([src/module.rs @ commit 864500b](https://github.com/starship/starship/blob/864500b26904cd3cc01fc2a19d3ad068bd1517a2/src/module.rs), probe 2026-09-08). Mỗi module một file trong `src/modules/`, hàm trả `Option<Module>` — không áp dụng cho ngữ cảnh hiện tại thì trả None và tự biến mất khỏi prompt; không module nào biết module nào tồn tại.

Đúng khối tín hiệu đắt giá nhất cho workflow worktree là `git_status`. Doc comment của nó liệt kê trọn bộ trạng thái repo bằng symbol: `=` merge conflict, `⇡` ahead, `⇣` behind, `?` untracked, `!` modified, `+` staged, `✘` deleted ([src/modules/git_status.rs @ commit 864500b](https://github.com/starship/starship/blob/864500b26904cd3cc01fc2a19d3ad068bd1517a2/src/modules/git_status.rs), probe 2026-09-08). Cơ chế bên dưới dùng gitoxide — cùng thư viện git Rust mà bat dùng — tính trạng thái trong tiến trình, kèm thread pool rayon để giữ thời gian render prompt ở mức không thấy được. Kết quả: nhảy giữa sáu worktree, dòng prompt tự khai báo nhánh và độ bẩn của từng cây — không cần gõ `git status` một lần nào.

## Config TOML và nguyên tắc không bao giờ sập

Cấu hình Starship là một file `starship.toml`: mỗi module có section riêng, đổi symbol, style, ngưỡng hiển thị. Phần đáng học nằm ở cách code xử lý config sai. Trait `ModuleConfig` trong `src/config.rs` parse TOML qua serde, và hàm `load` có hành vi cố ý:

```rust
fn load<V: Into<ValueRef<'a>>>(config: V) -> Self {
    match Self::from_config(config) {
        Ok(config) => config,
        Err(e) => {
            log::warn!("Failed to load config value: {e}");
            Self::default()
        }
    }
}
```

(nguồn: [src/config.rs @ commit 864500b](https://github.com/starship/starship/blob/864500b26904cd3cc01fc2a19d3ad068bd1517a2/src/config.rs), probe 2026-09-08)

Config hỏng — thiếu field, sai kiểu, TOML gõ tay lệch dấu phẩy — không crash, không prompt trắng: log một cảnh báo rồi về giá trị mặc định. Với một component chạy hàng chục lần mỗi phút trước mặt người dùng, đây là đúng mức ưu tiên: prompt lỗi thời tốt hơn prompt biến mất.

## Prompt trở thành bề mặt giám sát agent

Danh sách module của Starship có một nhóm đáng chú ý: `claude_context`, `claude_cost`, `claude_model`. Module `claude_context` đọc dữ liệu Claude Code từ context — kích thước context window và phần trăm đã dùng — rồi chọn style hiển thị theo ngưỡng (`display` với `threshold`), đúng kiểu indicator pin còn dung lượng: càng gần đầy càng đổi màu ([src/modules/claude_context.rs @ commit 864500b](https://github.com/starship/starship/blob/864500b26904cd3cc01fc2a19d3ad068bd1517a2/src/modules/claude_context.rs), probe 2026-09-08). Prompt — nơi rẻ nhất để nhìn — giờ khai báo luôn tình trạng của agent đang chạy trong thư mục đó. Tín hiệu ambient là đúng thứ một workflow nhiều agent cần: Wakii tập trung trạng thái vào story view và kiểm ba lớp qua watchdog — quy trình nằm trong [docs superpowers-panel](/vi/docs/superpowers-panel/) — còn kinh nghiệm chia worktree để các agent không giẫm chân nhau đã kể trong bài [worktree song song để cô lập thay đổi](/vi/blog/parallel-worktrees-isolation/); Starship bổ sung tầng rẻ nhất: dòng prompt ngay dưới tay bạn.

## Wakii học được gì

- **ADOPT** — config lỗi degrade, không crash: `ModuleConfig::load` của Starship bắt lỗi TOML, warn rồi về default; prompt vẫn render. Đề xuất cụ thể: mọi chỗ load config trong kit và app Wakii (config TOML/JSON của người dùng, config skill) theo cùng hợp đồng — warn + default, không bao giờ chặn workflow vì config xấu.
- **DIRECTION** — tín hiệu ambient về trạng thái agent: module claude_context đưa context window % lên prompt theo ngưỡng màu. Wakii đã có story view tập trung; hướng đáng đi là tín hiệu nhẹ ở bề mặt phụ (terminal title, notification) cho agent đang chạy — cần thiết kế surface nên chưa làm ngay.
- **WATCH** — một binary + init mỏng cho N host: logic nặng một chỗ, mỗi shell chỉ một script cầu nối. Nếu CLI kit của Wakii phải phủ nhiều môi trường (macOS, Linux, SSH host), đây là pattern giữ chi phí tích hợp rẻ — theo dõi trước khi cần.

Wakii là agentic IDE với một đội agent có sẵn, cài xong là chạy — nếu bạn muốn xem tổng thể bộ công cụ, [docs agents-and-kit](/vi/docs/agents-and-kit/) là chỗ bắt đầu.
