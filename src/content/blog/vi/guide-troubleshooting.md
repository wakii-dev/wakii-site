---
title: "Chẩn đoán lỗi trong Wakii: ba lớp, sáu tình huống"
description: "Nguyên tắc chẩn đoán từ orca status tới terminal và logs, rồi sáu hỏng hóc hay gặp: agent không start, worktree tạo lỗi, CLI không thấy, terminal SSH chết, browser no tab, rate limit GitHub."
pubDate: "2026-09-24"
category: "tutorial"
tags: ["guide", "wakii"]
draft: false
---

Agent báo "xong rồi" nhưng thay đổi không có đâu. Terminal mới không mở được
trên máy xa. Lệnh `orca` gõ vào terminal thì "command not found". Những lúc
này câu hỏi không phải "làm sao sửa" mà là "làm sao biết hỏng ở lớp nào" —
vì app, agent CLI, và git là ba tầng khác nhau, mỗi tầng hỏng một kiểu. Bài
này cho bạn một thứ tự chẩn đoán, rồi đi qua sáu tình huống hay gặp nhất kèm
lệnh xử lý từng tình huống.

TL;DR:

- Chẩn đoán theo ba lớp: `orca status` nhìn tổng quan, chạy lệnh thủ công
  trong terminal để tách lỗi app khỏi lỗi CLI, cuối cùng mới mở logs.
- Agent không start hay `command not found`: chạy CLI tay trước, rồi kiểm
  PATH mà app nhìn thấy và shim đã đăng ký; terminal SSH chết trên Linux là
  thiếu toolchain — và cài xong phải kết nối lại.
- Worktree tạo lỗi: thường là thiếu `git fetch origin` hoặc trùng
  branch/thư mục.
- Browser báo `browser_no_tab`: một lệnh `orca tab create` là xong.
- GitHub panel đứng im: kiểm rate limit bằng ba lệnh `gh`.

## Ba lớp chẩn đoán: status, terminal, logs

Thứ tự đúng là từ tổng quan tới chi tiết. Lớp một: `orca status` — một câu
trả lời cho câu hỏi "app còn sống không, runtime còn nối được không":

```text
$ orca status                # (rút gọn — bỏ pid/runtimeId)
appRunning: true
desktopWindowStatus: available
runtimeState: ready
runtimeReachable: true
runtimeConnectionState: connected
graphState: ready
```

*Nguồn: `orca status` chạy thật trên máy viết bài, lấy 2026-09-08.*

Lớp hai: chạy lệnh thủ công trong terminal — nếu lệnh chạy được ngoài app mà
không chạy được trong app thì vấn đề là PATH hoặc cấu hình app nhìn thấy,
không phải CLI hỏng. Lớp ba: logs — dành cho lúc hai lớp đầu chưa chỉ ra gì.

Và một nguyên tắc xuyên suốt: "agent nói xong" không phải bằng chứng rằng
việc chạy được — đó là lý do quy trình story có gates để bạn kiểm bằng chứng
thật. Về phía máy, cùng tinh thần đó: im lặng không phải bằng chứng của cái
chết — bài [watchdog: idle is not
dead](/vi/blog/watchdog-idle-is-not-dead/) đã lập luận cho tầng agent, bài
này dùng cùng nguyên tắc cho tầng CLI.

## Agent không start: chạy tay trước, hỏi PATH sau

Tab agent mở rồi im re? Docs chỉ đúng một bước đầu tiên:

> "Open the terminal and run the agent's CLI manually. If it fails there,
> it's an auth or install problem in the CLI itself — not Orca."

*Nguồn: docs Troubleshooting & FAQ, mục "Agent won't start", truy
2026-09-08.*

Ba bước theo docs: chạy CLI của agent thủ công trong terminal — lỗi ở đó là
lỗi đăng nhập hoặc cài đặt của chính CLI; kiểm CLI có nằm trên `PATH` mà app
nhìn thấy hay không trong Settings → Agents; và bấm chip **Restart** trên
tab để khởi động lại agent mà không cần đóng worktree.

## Tạo worktree lỗi: fetch trước, đặt tên lại sau

Tạo worktree thất bại thường rơi vào một trong hai lý do, docs liệt kê:

> "The start-from ref may not be fetched. Open a terminal in the repo and
> run `git fetch origin`.
> The target directory may already have a worktree for that branch — delete
> it or pick a new branch name."

*Nguồn: docs Troubleshooting & FAQ, mục "Worktree creation fails", truy
2026-09-08.*

Tình huống hai hay gặp khi tạo lại worktree cho cùng một branch sau khi đã
xóa cũ — thư mục mới, nhưng git vẫn nhớ branch đó đã có worktree. Chọn tên
branch khác hoặc xóa worktree cũ thật sạch là xong. Cơ chế chia sẻ file nặng
giữa các worktree — chỗ thường nghi ngờ tiếp theo — đã có trong bài
[worktree workflow](/vi/blog/guide-worktree-workflow/).

## "command not found" và terminal SSH chết: hai lỗi, cùng bản chất

Cả hai tình huống này đều là "có nối mà không có công cụ".

Lệnh `orca` gõ vào terminal báo không tồn tại: shim CLI chưa đăng ký. Docs
chỉ chỗ bấm:

> "Register the CLI under Settings → General → Orca CLI. On macOS it
> installs a shim into `~/.local/bin`; make sure that's on your shell's
> `PATH`."

Terminal SSH nối được, list file được, nhưng terminal không mở: máy xa thiếu
toolchain để compile module native (make, trình dịch C++, python3). Lệnh cài
theo từng họ distro và — chi tiết dễ bỏ sót nhất — docs ghi: "Reconnect
after installing tools so Orca can reinstall native modules." Cài xong phải
KẾT NỐI LẠI; đa số ca "cài rồi mà vẫn không mở" là chưa nối lại.
Đầy đủ hơn về SSH target thì bài [SSH
worktree](/vi/blog/guide-ssh-remote/) đi từ đầu.

*Nguồn: docs Troubleshooting & FAQ, các mục "Orca CLI says command not
found" và "SSH connects but remote terminals fail", truy 2026-09-08.*

## Browser báo no tab: một lệnh tạo tab

Agent gọi browser và nhận về lỗi `browser_no_tab`? Không phải lỗi — là
worktree hiện tại chưa có tab browser nào mở. Docs ghi nguyên văn cách sửa:

> "No tab is open in the current worktree. Open one with `orca tab create
> --url ...` or open the browser pane manually and navigate."

Lệnh thật có hình dạng `orca tab create --url <url>` — tạo tab ngay trong
worktree hiện tại. Agent có thể tự chạy lệnh này; bạn cũng vậy, không cần
bấm gì trong UI.

*Nguồn: docs Troubleshooting & FAQ, mục `browser_no_tab`; cờ lệnh đối chiếu
`orca tab create --help`, truy 2026-09-08.*

## Rate limit GitHub, logs và khi nào cần đưa bằng chứng cho người khác

Panel PR, checks hay Tasks đứng im không refresh — ba nguyên nhân được docs
gộp một dòng: rate limit, `gh` auth hỏng, thiếu scopes. Bộ lệnh kiểm nhanh,
trích nguyên văn:

```bash
gh auth status -h github.com
gh api user
gh api rate_limit --jq '.resources.core'
```

*Nguồn: docs Troubleshooting & FAQ, mục GitHub errors, truy 2026-09-08.*

`remaining` trong kết quả lệnh cuối về gần 0 là thủ phạm — panel đụng trần
API, đợi đến mốc `reset`. Auth hỏng thì `gh auth status` sẽ nói trước.

Còn khi hai lớp đầu không chỉ ra gì, hoặc bạn cần gửi sự cố cho người khác:
Help → Open Logs mở thư mục chứa logs của app — docs nhắn kèm một câu đáng
nhớ: "Attach these when filing a bug". Report kèm logs khác report kèm cảm
nhận ở chỗ này: người nhận tái hiện được lỗi thay vì đoán.

Cài đặt nền tảng và các câu hỏi thường gặp khác nằm gom trong trang
[FAQ](/vi/docs/faq/) — còn bộ cài và bước cập nhật app thì bài [cài đặt và
cập nhật](/vi/blog/guide-install-update/) đã đi từng bước.

Lần tới app làm bạn đứng hình, đừng khởi động lại vội — chạy `orca status`,
chạy một lệnh tay, mở logs. Ba lớp đó trả lời được đa số câu hỏi trước khi
bạn kịp cần đến nút restart.
