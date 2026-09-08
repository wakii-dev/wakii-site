---
title: "Chạy nhiều session song song: split pane và port theo từng worktree"
description: "Xem nhiều agent cùng lúc bằng split pane lồng nhau, giữ port dev riêng cho từng worktree, điều khiển session bằng CLI và dọn sạch khi xong."
pubDate: "2026-09-23"
category: "tutorial"
tags: ["guide", "cli"]
draft: false
---

Một agent làm việc thì màn hình rộng dư dùng. Chạy song song ba agent — ba
worktree, ba terminal, ba diff đang mở — là lúc màn hình hết chỗ và những
câu hỏi thật bắt đầu: xem chúng làm việc cạnh nhau bằng cách nào, dev server
của worktree này có cướp port của worktree kia không, và khi một agent xong
việc thì thu hồi chỗ ngồi cho nó thế nào. Bài này đi qua cả ba: chia màn
hình, tách port, và dọn dẹp.

TL;DR:

- Mỗi session gắn một worktree — mỗi agent một thư mục riêng, không giành
  file với nhau.
- Kéo tab vào mép pane là split; split lồng nhiều tầng được; layout nhớ theo
  từng worktree.
- Dev server chạy trong terminal của từng worktree nên port không xung đột;
  server máy xa forward về qua tab Ports.
- `orca terminal list|create|split|switch|close` điều khiển session bằng
  CLI; `orca worktree ps` cho tổng quan mọi worktree đang sống.
- Worktree không còn việc nên đóng — mỗi worktree giữ file watcher của riêng
  nó.

## Một session là một worktree: mỗi agent một thư mục

Đơn vị của song song trong Wakii không phải "tab" — là worktree. Mỗi agent
được giao một worktree, nghĩa là một thư mục làm việc riêng của một repo
chung:

```ascii
repo wakii-site — một .git chung, nhiều thư mục làm việc
├── ~/orca/workspaces/wakii-site/sf-2-blog-skills  → agent viết bài skills
├── ~/orca/workspaces/wakii-site/sf-4-blog-guides  → agent viết bài guides
└── ~/orca/workspaces/wakii-site/sf-5-blog-arch    → agent viết bài arch
```

*Nguồn: danh sách worktree thật từ `orca worktree ps` trên máy viết bài, lấy
2026-09-08 — ba SF của cùng một story đang chạy song song.*

Không agent nào sửa file của agent nào: mỗi thư mục một nhánh, một index,
một server. Vì sao mỗi worktree một branch là đơn vị tách biệt an toàn thì
bài [parallel worktrees isolation](/vi/blog/parallel-worktrees-isolation/)
đã chứng minh bằng thí nghiệm — bài này giả sử bạn đã có nhiều worktree và
lo phần nhìn chúng làm việc.

## Xem nhiều agent cùng lúc: kéo tab vào mép để split

Cách chia màn hình nằm ở thao tác kéo thả, docs mô tả đúng hai hướng:

> "Drag a tab to the edge of a pane to create a split: **Right edge** —
> splits left/right (horizontal split). **Bottom edge** — splits top/bottom
> (vertical split)."

Và split lồng được nhiều tầng, ví dụ gốc ghi:

> "Splits nest. You can have an agent terminal on the left, a diff view on
> the top-right, and a browser tab on the bottom-right — all at once."

*Nguồn: docs "Tabs, panes & split layouts", truy 2026-09-08.*

Hai chi tiết giữ layout sống lâu với bạn. Thứ nhất, biên pane đứng yên:
"Pane boundaries stay where you put them" — thu phóng cửa sổ không xáo trộn
bố cục, và vị trí biên được lưu theo từng worktree. Thứ hai, mỗi worktree
sở hữu layout riêng — docs viết:

> "Each worktree owns its own tab layout. Switching worktrees swaps the
> entire pane tree — your browser tab, terminal, and diff reappear exactly
> as you left them."

*Nguồn: docs "Tabs, panes & split layouts", các mục Pinned boundaries và Tab
groups across worktrees, truy 2026-09-08.*

Di chuyển giữa các tab không cần chuột:

| Hành động | macOS | Linux / Windows |
|---|---|---|
| Tab kế / trước | `Cmd+Shift+]` / `Cmd+Shift+[` | `Ctrl+Shift+]` / `Ctrl+Shift+[` |
| Tab kế / trước (cùng loại) | `Cmd+Option+]` / `Cmd+Option+[` | `Ctrl+Alt+]` / `Ctrl+Alt+[` |

*Nguồn: bảng phím tắt mặc định cho bản cài mới, docs "Tabs, panes & split
layouts", truy 2026-09-08.*

## Mỗi worktree một port dev: server tự nhảy, không giành nhau

Ba worktree thường nghĩa là ba dev server chạy đồng thời. Chúng không đụng
nhau vì mỗi server chạy trong terminal của worktree nó — tức trong thư mục
của nó. Dev server phổ biến (Vite, Astro, Next) khi thấy port mặc định bị
chiếm sẽ tự chọn port kế tiếp, nên sơ đồ thực tế luôn ra thế này:

```ascii
worktree sf-2: astro dev  → port 4321
worktree sf-4: astro dev  → 4321 đã có người ngồi → 4322
worktree sf-5: astro dev  → 4322 đã có người ngồi → 4323
```

*Sơ đồ minh họa cơ chế "port bị chiếm thì nhảy port kế tiếp" của dev server
— mở URL server in ra trong terminal của đúng worktree đó.*

Điều cần nhớ: mở preview từ worktree nào thì mở port của đúng worktree ấy —
URL in ngay trong terminal của nó. Worktree trên máy xa thì qua một tầng
nữa: tab Ports (`Cmd+Shift+I`) phát hiện các port đang lắng nghe trên host
và forward về máy bạn — cách dùng chi tiết đã có trong bài [SSH
worktree](/vi/blog/guide-ssh-remote/).

## CLI điều khiển session: năm lệnh terminal và một lệnh tổng quan

Bàn phím chia màn hình chỉ là một nửa; nửa kia là CLI, để script được. Năm
lệnh terminal của `orca --help`:

```text
terminal list       List live Orca-managed terminals
terminal create     Create a terminal session in a worktree
terminal split      Split an existing terminal pane
terminal switch     Bring a terminal tab to the foreground
terminal close      Close one terminal, its whole tab with --tab, or all in a worktree
```

*Nguồn: trích `orca --help`, truy 2026-09-08.*

Còn muốn nhìn toàn cảnh các worktree đang sống trên máy — cái nào có
terminal đang chạy, đang ở nhánh nào — thì `orca worktree ps`:

```text
$ orca worktree ps --limit 3          # (rút gọn: bỏ cột preview)
wakii-site refs/heads/wakii-dev/sf-2-blog-skills  host=local  live:1  pty:yes  unread:yes
~/orca/workspaces/wakii-site/sf-2-blog-skills
wakii-site refs/heads/wakii-dev/sf-4-blog-guides  host=local  live:1  pty:yes  unread:yes
~/orca/workspaces/wakii-site/sf-4-blog-guides

scope: local
truncated: showing 3 of 11
```

*Nguồn: `orca worktree ps --limit 3` chạy thật trên máy viết bài, lấy
2026-09-08 — cắt bớt cột preview và một worktree.*

Một dòng một worktree: nhánh, host, số terminal đang sống (`live:1`), có
pty hay không. Đây là lệnh "giờ đang chạy gì trên máy này" — chạy trước khi
quyết đóng gì đó. Vòng đời tạo → ship → thu hồi worktree thì bài [worktree
workflow](/vi/blog/guide-worktree-workflow/) đã đi từng bước.

## Dọn session: tab hết việc thì đóng, worktree xong việc thì thu hồi

Split nhiều tầng là con ăn RAM to nhất trong app, docs nói thẳng trong mục
performance:

> "Close worktrees you're not actively using. Each worktree keeps file
> watchers alive. Split layouts with many browser tabs are the biggest RAM
> users — close browsers you don't need."

*Nguồn: docs Troubleshooting & FAQ, mục Performance & memory, truy
2026-09-08.*

Thứ tự dọn hợp lý: đóng tab browser không còn xem trước, rồi đến terminal —
`orca terminal close` với `--tab` đóng cả tab, không có flag thì chỉ đóng
một terminal. Cuối cùng mới là worktree: SF đã merge, branch đã về đích thì
worktree của nó không còn việc gì giữ file watcher nữa. Máy hết ì sau một
buổi chạy song song thường là nhờ đúng hai việc này, không phải khởi động
lại app.

Cấu hình app từ đầu — repo đầu tiên, terminal đầu tiên — nằm ở trang
[getting started](/vi/docs/getting-started/).

Mở ba worktree của dự án bạn, kéo tab sang phải và xuống dưới, mở ba dev
server cùng lúc — rồi để mắt xem port thứ hai nhảy sang số nào.
