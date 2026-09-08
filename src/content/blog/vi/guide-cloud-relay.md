---
title: "Relay cloud: chạy agent trên server, điều khiển từ máy khác"
description: "Ghép đôi hai máy qua Remote Orca Server hoặc orca serve — server giữ runtime, session và agent; client chỉ là UI. Kèm cách trỏ CLI vào runtime xa và các quy tắc an toàn."
pubDate: "2026-09-22"
category: "tutorial"
tags: ["guide", "architecture"]
draft: false
---

Agent chạy lâu nhất thường dừng vì lý do ngớ ngẩn nhất: bạn đóng laptop.
Runtime nằm trên máy bạn đang gõ thì việc và máy đó trói vào nhau — máy ngủ,
việc dừng. Bài này là how-to cho chiều ngược lại: đặt runtime lên một máy
bạn sở hữu, các máy còn lại chỉ làm màn hình, và giữ agent chạy xuyên qua
những giấc ngủ ngắn của laptop. Không phải kiến trúc lý thuyết — từng bước
bấm và từng dòng lệnh, kể cả server không có màn hình.

TL;DR:

- Ba lối đặt việc lên máy khác: SSH target, Remote Orca Server, per-workspace
  environment — khác nhau ở chỗ ai giữ runtime.
- Ghép đôi: server mở Settings → Remote Orca Servers → New Link; client bấm
  Add Server và dán access link.
- Server headless: `orca serve --pairing-address <ip>` — in ra pairing URL
  ngay trong terminal.
- CLI trỏ được vào runtime xa: `--environment <tên>` hoặc biến
  `ORCA_ENVIRONMENT` / `ORCA_PAIRING_CODE`.
- Access link là mật khẩu: giữ trên mạng riêng, không forward port ra
  internet.

## Ba lối đặt agent lên máy khác

Docs sản phẩm có một trang bản đồ, ways to run, và phân định theo đúng một
câu hỏi: ai giữ runtime? Lối một là SSH target — laptop giữ runtime, worktree
và agent chạy trên máy xa. Lối hai là Remote Orca Server — một máy bạn kiểm
soát giữ trọn vẹn runtime, còn laptop, trình duyệt, điện thoại là các client.
Bảng so sánh trong docs, dịch nghĩa:

|  | SSH worktree | Remote Orca Server |
|---|---|---|
| Ai giữ runtime | laptop | máy xa (app desktop hoặc `orca serve`) |
| Khi ngắt nối | agent vẫn chạy trên host; laptop gắn lại | toàn bộ session nằm trên server |
| Nhiều client | một laptop điều khiển host | laptop, web, mobile, automation dùng chung runtime |
| Thiết lập | thêm SSH target, chọn Run on | share app server hoặc chạy `orca serve`, pair bằng URL |

*Nguồn: bảng "SSH vs Remote Orca Server" trong docs ways-to-run, dịch nghĩa,
truy 2026-09-08.*

Lối SSH đã có bài riêng — [guide SSH remote](/vi/blog/guide-ssh-remote/).
Có thêm lối thứ ba, per-workspace environment (VM theo recipe cho từng
worktree), nhưng đó là compute dùng một lần; bài này đi sâu lối giữ session
lâu dài. Một điều docs nói thẳng để tránh hiểu lầm: không có dịch vụ VPS nào
ở đây — các chế độ remote luôn chạy trên máy và tài khoản cloud của bạn.

## Ghép đôi qua access link

Hai đầu nối với nhau qua một đường mạng riêng:

```ascii
máy client · Wakii client              máy server · runtime Wakii
hiện UI, gửi input            ───────► giữ repo và worktree
                              ◄─────── chạy terminal và agent
                       (đường mạng riêng bạn kiểm soát)
```

*Nguồn: sơ đồ vẽ theo mục "What runs where" trong docs remote servers, truy
2026-09-08.*

Lượt server, trên máy sẽ giữ session: mở Settings → Remote Orca Servers,
dưới mục Advertise this app as a server bấm New Link. Chọn Connection
address là địa chỉ Tailscale — thường bắt đầu bằng `100.` — rồi bấm Generate
Access Link và copy link dưới dòng Pair another Orca client. Lượt client:
cùng trang Settings, bấm Add Server, đặt tên dễ nhớ, dán link, Add Server; nếu
hàng server báo Disconnected thì bấm Connect.

Mỗi client được pair nhận một token riêng, revoke độc lập — server liệt kê
chúng dưới Shared Server Access. Bấm thùng rác cạnh một grant là client đang
dùng grant đó bị ngắt ngay lập tức. Sinh link mới sẽ thay thế link cũ chưa
dùng; client đã pair giữ grant của mình cho tới khi bạn chủ động revoke.

> "Keep the access link private. The pairing URL grants access to this Orca
> runtime. Treat it like a password and send it only to the client you intend
> to pair."

*Nguồn: docs remote servers, callout "Keep the access link private", truy
2026-09-08.*

## Server headless: `orca serve` trong một dòng lệnh

Server không màn hình — Linux headless, VM do service quản — dùng `orca
serve`: khởi runtime mà không mở cửa sổ desktop, chạy foreground đến khi bạn
nhấn Ctrl-C, và in ra endpoint cùng một pairing URL để dán vào client. Các
flag chính, trích thẳng từ `--help`:

```bash
$ orca serve --help                  # (trích)
  --port
  --pairing-address
  --mobile-pairing
Notes:
  --pairing-address changes only the client-advertised address; use a reachable LAN,
  Tailscale, SSH-forward, or reverse-proxy endpoint.
  Use --mobile-pairing to print a mobile-scoped pairing QR/link instead of the default
  runtime-environment pairing link.
Examples:
  $ orca serve --port 6768 --pairing-address 100.64.1.20
  $ orca serve --pairing-address 100.64.1.20 --mobile-pairing
```

*Nguồn: `orca serve --help`, lấy 2026-09-08; luồng đầy đủ trong docs remote
servers.*

Ví dụ chuẩn của docs là `orca serve --pairing-address 100.64.1.20` — in
pairing URL, dán vào Settings → Remote Orca Servers → Add Server phía client
là xong. Hai chi tiết hay cần: thêm `--port 6768` khi firewall hoặc tunnel
yêu cầu port cố định; và trên Linux, CLI có tên là `orca-ide` (tên `orca` đã
có trình đọc màn hình GNOME chiếm trước) nên lệnh tương ứng là `orca-ide
serve …`. Cần pair thêm điện thoại? `--mobile-pairing` in ra QR và link
dành riêng cho app mobile — quét hoặc dán.

## Điều khiển runtime xa từ CLI

Không chỉ UI — CLI cũng trỏ vào runtime được pair. Lưu runtime xa một lần,
mọi lệnh sau đó chạy thẳng vào nó:

```bash
$ orca environment list
No saved environments.
```

*Nguồn: `orca environment list` trên máy viết bài, lấy 2026-09-08 — máy sạch,
chưa lưu runtime nào.*

Các lệnh quản và cách chỉ định, trích từ `orca --help`:

```bash
$ orca --help                        # (trích)
Environments:
  environment add           Save a remote Orca runtime from a pairing code
  environment list          List saved remote Orca runtimes
  environment show          Show one saved remote Orca runtime
  environment rm            Remove a saved remote Orca runtime
  --environment <selector>   Connect using a saved environment id or name
Behavior:
  Remote runtime access can also be supplied with ORCA_PAIRING_CODE or
  ORCA_ENVIRONMENT.
```

*Nguồn: `orca --help`, lấy 2026-09-08.*

Cú pháp đầy đủ: `orca environment add --name <tên> --pairing-code <code>`
lưu một runtime từ pairing code; sau đó mỗi lệnh nhận `--environment <tên|id>`,
hoặc bạn đặt biến `ORCA_ENVIRONMENT` cho cả phiên. Đây chính là cách một
automation hoặc một agent chạy trên máy B làm việc với runtime đang sống trên
máy A — không cần UI, không cần đăng nhập lại.

## An toàn: bốn quy tắc trước khi mở relay

Một, access link có quyền truy cập runtime — gửi đúng client định pair, xử
lý như mật khẩu; link lộ vào tay sai người thì revoke grant tương ứng dưới
Shared Server Access. Hai, giữ server và client trên đường mạng riêng bạn
kiểm soát — cùng tailnet Tailscale hoặc LAN. Lưu ý beta ngay đầu trang docs,
trích nguyên văn:

> "Remote Orca Servers are beta. Keep the server and client on a private
> network path you control, such as the same Tailscale tailnet or LAN."

Ba, không forward port Orca thẳng ra internet — docs liệt kê các thay thế:
Tailscale, WireGuard, LAN tin cậy, SSH forwarding, authenticated tunnel. Bốn,
đừng chọn `127.0.0.1` làm địa chỉ cho máy khác — địa chỉ đó chỉ có tác dụng
trên chính server.

*Nguồn: docs "Remote Orca Servers" — callout Beta và mục Access and
security, truy 2026-09-08.*

Phần thưởng của cấu hình này là đúng cảnh mà bài [watchdog](/vi/blog/watchdog-idle-is-not-dead/)
bảo vệ: agent đi vào im lặng vì build dài, không phải vì chết — và khi
runtime nằm trên server, không có chiếc laptop nào ngủ để gián đoạn nó. Câu
hỏi thường gặp về các chế độ chạy được gom trên trang
[FAQ](/vi/docs/faq/).

Một chiếc máy cũ chạy thiếu thứ gì ngoài Tailscale là đủ cho lần thử đầu:
cài app, bấm New Link, pair client — và để agent ngủ trên server thay vì cùng
laptop với bạn.
