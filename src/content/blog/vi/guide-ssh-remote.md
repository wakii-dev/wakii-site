---
title: "SSH worktree: laptop giữ runtime, máy khỏe chạy việc"
description: "Thêm SSH target, tạo worktree trên máy xa và giữ trải nghiệm như local: sync file events, chip trạng thái, session sống qua ngắt nối, forward port và xử lý máy xa thiếu toolchain."
pubDate: "2026-09-21"
category: "tutorial"
tags: ["guide", "cli", "worktree"]
draft: false
---

Máy bạn đang gõ không phải lúc nào cũng là nơi đúng để chạy việc: build bốn
mươi phút, dataset cỡ lớn, toolchain chỉ cài trên một con máy riêng. SSH
worktree giải theo hướng ngược trực giác — runtime Wakii vẫn nằm trên laptop
của bạn, UI vẫn là UI bạn quen; chỉ phần việc nặng chạy sang máy kia qua SSH.
Và đây là tính năng đã ship, không phải roadmap: dòng highlights của bản
1.4.198 ghi rõ "SSH worktrees". Bài này đi từng bước từ thêm host đến xử lý
máy xa thiếu toolchain.

TL;DR:

- SSH worktrees đã ship từ bản 1.4.198 — dòng highlights của release notes.
- Thêm host: Settings → SSH → Add Target, điền tay hoặc chọn sẵn từ OpenSSH
  config, Test rồi Save.
- Tạo worktree chọn SSH target thay vì Local: worktree và agent nằm trên máy
  xa, editor vẫn cảm giác local nhờ sync file events.
- Ngắt nối không giết agent — session được lease qua relay; port trên máy xa
  forward về laptop qua tab Ports.

## SSH target giải quyết gì

Có hai cách đưa việc sang máy khác. Cách thứ nhất dời cả runtime: app chạy
trên máy kia, laptop chỉ là màn hình — bạn đánh đổi cả môi trường quen thuộc
chỉ để dùng một con máy mạnh hơn. Cách thứ hai giữ runtime lại và chỉ dời
việc:

```ascii
laptop của bạn                        máy xa (SSH host)
┌───────────────────────┐             ┌───────────────────────┐
│ Wakii runtime         │             │ git worktree          │
│ editor · diff · UI    │ ◄── SSH ───►│ agent chạy ở đây      │
│ chip trạng thái       │  file sync  │ toolchain của host    │
└───────────────────────┘             └───────────────────────┘
```

*Nguồn: sơ đồ vẽ theo cơ chế trong docs SSH worktrees, mục "Use a target",
truy 2026-09-08.*

Vế hai là SSH worktree: laptop của bạn giữ runtime và toàn bộ trải nghiệm;
máy xa giữ worktree, terminal và agent. Về mặt sản phẩm, đây không phải hứa
hẹn — release notes v1.4.198 liệt kê nó cạnh những tính năng lớn nhất của bản,
trích nguyên văn:

> "GitHub & Linear native, SSH worktrees, mobile companion"

*Nguồn: release notes v1.4.198, GitHub Releases wakii-dev/wakii, lấy
2026-09-08.*

## Thêm host: Settings → SSH → Add Target

Mở Settings → SSH và bấm Add Target — form mở trong modal, nên dù danh sách
host dài, các nút Host, Advanced và Save vẫn nằm trong tầm nhìn. Các trường
cần điền:

| Trường | Ghi chú |
|---|---|
| Host | hostname hoặc IP của máy xa |
| User · Port | tài khoản SSH và port nếu khác mặc định |
| Identity file | tùy chọn — key có passphrase thì app hỏi ở lần nối đầu |
| OpenSSH config picker | tìm trong `~/.ssh/config` (kể cả file `Include`), chọn một host là form tự điền |

*Nguồn: docs SSH worktrees, mục "Add an SSH target", truy 2026-09-08.*

Docs viết nguyên văn về cách điền nhanh:

> "Fill in host, user, port, and optional identity file — or open the
> **OpenSSH config** picker in the same dialog to search `~/.ssh/config`
> (including `Include`d files), pick one host, and prefill the form."

và về hai nút cuối: "Click **Test** to verify connectivity, then **Save**."
Host nào đã có sẵn trong app sẽ hiện badge báo hiệu — để bạn khỏi thêm trùng.

*Nguồn: docs SSH worktrees, mục "Add an SSH target", truy 2026-09-08.*

Bên CLI, khái niệm "máy có thể nhắm tới" cũng có tên riêng — lệnh `host list`
liệt kê chúng cùng cách gọi trong tham số:

```bash
$ orca host list
local       this machine  ->  --host local
```

*Nguồn: `orca host list` trên máy viết bài, lấy 2026-09-08 — máy này chưa
thêm host nào, `local` là chính nó.*

## Tạo worktree trên host: chọn SSH target thay vì Local

Luồng tạo worktree y như bạn vẫn làm với repo đã có. Điểm khác biệt duy nhất
nằm ở một lựa chọn, docs viết thẳng:

> "When creating a worktree, choose an SSH target instead of Local."

Chọn xong, ba việc xảy ra trên máy xa — trích nguyên văn từng dòng:

> "Create the git worktree on the remote host.
> Run agents remotely through the SSH connection.
> Sync file events so the editor, diff, and browser still feel local."

*Nguồn: docs SSH worktrees, mục "Use a target", truy 2026-09-08.*

Cơ chế bên dưới không phải ma thuật mới: worktree là tính năng git thuần, một
repo nhiều thư mục làm việc. Bài [real parallelism through worktree
isolation](/vi/blog/parallel-worktrees-isolation/) đã chứng minh vì sao mỗi
worktree một branch là đơn vị tách biệt an toàn — ở đây cùng cơ chế đó, cộng
thêm một trục: thư mục làm việc nằm trên một máy khác.

## Vẫn cảm giác local: chip trạng thái và ngắt nối không giết agent

Ba màu chip cho biết sức khỏe của nối SSH, trích docs nguyên văn: "green
connected, yellow reconnecting, red disconnected" — xanh đã nối, vàng đang nối
lại, đỏ mất nối. Vàng và đỏ không phải báo động đỏ: câu quan trọng nhất của
cả trang docs là câu này:

> "Disconnects don't kill running agents."

Khi nối quay lại, app tự nối lại và gắn lại vào session, trả lại cả scrollback
đang dở. Session remote còn sống cả qua việc đóng app trên laptop: chúng được
lease qua relay chạy trên máy xa, và mặc định giữ sống đến khi bạn tự kết thúc
("Keep terminals alive until reset"). Hệ quả tư duy đáng nhớ, trích nguyên
văn:

> "Losing contact with a host is not evidence that its work stopped."

*Nguồn: ba trích đoạn từ docs SSH worktrees — mục Status và "Sessions across
app close", truy 2026-09-08.*

Đó chính là nguyên lý của watchdog mà bài [watchdog: idle is not
dead](/vi/blog/watchdog-idle-is-not-dead/) đã nói từ phía story — im lặng
không phải bằng chứng của cái chết, và mất dấu không cho phép bạn kết luận
mất việc.

## Forward port: tab Ports (Cmd+Shift+I)

Dev server chạy trên máy xa, trình duyệt mở trên laptop — mảnh nối thiếu duy
nhất là port. Với worktree SSH, sidebar phải có tab Ports (bật tắt bằng
`Cmd+Shift+I`): app quét `/proc/net/tcp` trên máy xa và liệt kê các port đang
lắng nghe ở mục Detected — một click là forward về máy bạn. Thêm tay, sửa, xóa
forward đều làm được trong cùng tab.

Hai chi tiết đáng nhớ, trích docs: forward "persist across app restarts and
SSH reconnects" — sống qua lần đóng mở app và cả ngắt nối; và port privileged
trên máy xa được tự remap khi forward về, ví dụ gốc ghi "remote 80 → local
10080" — bạn không cần quyền root để dùng port 80 của host.

*Nguồn: docs SSH worktrees, mục "Port forwarding", truy 2026-09-08.*

## Máy xa không có toolchain: node-pty cần make, g++, python3

Một vấp cuối cùng, hay gặp đúng lúc bạn tưởng mọi thứ đã xong. Lần nối đầu,
app cài lên máy xa một relay nhỏ; remote terminal cần module native node-pty,
và trên Linux nó thường được compile ngay tại đó. Thiếu make, trình dịch C++
hoặc python3 thì sao? Files, git và editor vẫn chạy — chỉ terminal xa không
mở. Lệnh cài theo từng họ distro, trích nguyên văn từ docs:

```bash
sudo apt-get install -y build-essential python3     # Debian/Ubuntu
sudo dnf install -y make gcc gcc-c++ python3        # Fedora/RHEL
sudo apk add build-base python3                     # Alpine
sudo pacman -S --needed base-devel python           # Arch
```

*Nguồn: docs SSH worktrees, mục "Linux hosts without a C/C++ toolchain", truy
2026-09-08.*

Và bước dễ bị bỏ qua nhất, docs ghi rõ: "Install the tools, then reconnect so
the relay can install native modules." — cài xong phải KẾT NỐI LẠI, relay mới
cài được native module. Terminal vẫn không mở sau khi cài? Chín trên mười là
bạn chưa nối lại.

Toàn bộ quy trình — từ thêm host đến tạo worktree đầu trên máy xa — đứng cạnh
các bước cài nền tảng trong trang [getting started](/vi/docs/getting-started/).

Mở Settings → SSH, thêm máy kia, tạo worktree đầu tiên với target không phải
Local — và để phần việc nặng ở nơi có toolchain, phần quyết định ở nơi có
bạn.
