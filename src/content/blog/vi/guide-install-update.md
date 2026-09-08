---
title: "Cài đặt và cập nhật Wakii từ đầu"
description: "Từ máy trống tới app chạy: kiểm tra Node 24, pnpm và git, tải bản dựng sẵn theo phiên bản, hiểu gì tự xảy ra ở lần chạy đầu — và luôn biết chính xác mình đang chạy bản nào."
pubDate: "2026-09-19"
category: "tutorial"
tags: ["guide", "release", "wakii"]
draft: false
---

Hướng dẫn cài đặt thường dừng ở "tải về và mở lên". Với một công cụ chạy agent
trên repo thật, phần đáng hỏi nằm sau đó: máy cần gì trước khi cài, bản dựng lấy
ở đâu, lần chạy đầu có gì tự xảy ra, và làm sao biết mình đang chạy bản nào khi
cần so sánh hành vi giữa hai phiên bản. Bài này đi hết các bước đó cho Wakii —
từ kiểm tra môi trường trên một máy trống đến theo dõi bản mới trên GitHub
Releases — kèm lệnh thật để bạn đối chiếu trên máy mình.

TL;DR:

- Trước khi cài: Node.js 24, pnpm và git — kiểm tra bằng hai lệnh, mất mười giây.
- Bản dựng sẵn tải từ trang download hoặc GitHub Releases; tên file asset mang
  đúng phiên bản, ví dụ `Wakii-1.4.199-arm64.dmg`.
- Lần chạy đầu, workflow kit tự cài vào `~/.claude/` — không có bước nào cho bạn gõ.
- Muốn nhìn vào ruột: clone, `pnpm install`, `pnpm dev`. Theo dõi bản mới qua
  Releases; mọi con số trong bài lấy ngày 2026-09-08.

## Kiểm tra trước: ba thứ cần có trên máy

Wakii là ứng dụng desktop, nhưng đường xây từ nguồn cần ba thứ: Node.js 24,
pnpm 12 và git — đúng như trang getting started ghi. Kiểm tra nhanh nhất bằng
hai lệnh:

```bash
$ node --version
v24.10.0
$ pnpm --version
10.19.0
```

*Nguồn: `node --version` và `pnpm --version` chạy trên máy viết bài, lấy
2026-09-08.*

Con số ở trên là của máy viết bài. Máy bạn không cần giống con số — chỉ cần đạt
mốc docs ghi: Node 24, pnpm 12. Cách đạt mốc không quan trọng: cài từ nodejs.org
hoặc dùng version manager bạn đã có. git thường có sẵn trên máy dev;
`git --version` là đủ để xác nhận. Mười giây kiểm tra này rẻ hơn nhiều so với
một buổi chiều debug vì pnpm cũ.

## Cài bản dựng sẵn: asset mang tên phiên bản

Cách nhanh nhất là mở trang download của site — trang này luôn trỏ bản hiện
tại. Muốn xem đầy đủ hơn, kể cả các bản cũ, hãy vào GitHub Releases của repo
`wakii-dev/wakii`. Bản hiện tại tại thời điểm viết là v1.4.199 (nhãn Latest),
với asset tách theo nền tảng:

```bash
$ gh release view v1.4.199 --repo wakii-dev/wakii --json assets --jq '[.assets[].name]'
[
  "app-release.apk",
  "latest-mac.yml",
  "latest.yml",
  "orca-windows-setup.exe",
  "orca-windows-setup.exe.blockmap",
  "Wakii-1.4.199-arm64.dmg",
  "Wakii-1.4.199-x64.dmg"
]
```

(rút gọn — bỏ hai asset `.zip` dành cho macOS)

*Nguồn: `gh release view v1.4.199 --repo wakii-dev/wakii`, lấy 2026-09-08.*

macOS có hai DMG tách theo kiến trúc CPU — arm64 cho Apple Silicon, x64 cho
Intel — và tên file mang đúng phiên bản. Windows dùng `orca-windows-setup.exe`.
Linux chưa có asset dựng sẵn trong bản này — danh sách trên là toàn bộ asset —
nên máy Linux đi đường build từ nguồn ở phần dưới.

Chi tiết đáng nhớ: vì asset mang tên phiên bản, mỗi bản giữ nguyên bộ asset của
riêng nó trên trang Releases. Cần quay lại bản cũ để so sánh hành vi? Link của
bản đó vẫn sống. Trang download thì luôn trỏ bản mới nhất — hai chỗ này phục vụ
hai nhu cầu khác nhau, và biết điều đó tránh được vấp phổ biến nhất lúc cài
(bên dưới có mục riêng).

## Lần chạy đầu: kit tự lắp, bạn không gõ gì

Đây là phần ngắn nhất của bài — vì không có gì để làm. Tài liệu viết nguyên văn:

> "On first launch the workflow kit — the skills, agent definitions, and
> `story-*` command-line tools — installs itself into `~/.claude/` automatically.
> It stays in sync with the app and never duplicates your local config."

*Nguồn: docs getting started (EN), mục "First run — nothing to set up",
truy 2026-09-08.*

Dịch nghĩa: lần chạy đầu, workflow kit — skills, định nghĩa agent, các công cụ
dòng lệnh `story-*` — tự cài vào `~/.claude/`, luôn đi cùng phiên bản app, và
không ghi đè config sẵn có của bạn. Kit idempotent: chạy lại bao nhiêu lần cũng
không nhân đôi hay làm hỏng gì. Cơ chế bên trong của đợt tự cài này đã có một
bài riêng mổ xẻ — [đội agent đầu tiên của bạn không có bước cài
đặt](/vi/blog/zero-setup-agent-team/) — bài này chỉ giữ lại điều bạn cần lúc cài:
không có bước nào cho bạn.

Một ghi chú nhỏ cho macOS: lần mở đầu, hệ điều hành có thể hỏi bạn xác nhận
trước khi chạy app — hành vi thường gặp của ứng dụng Electron, không phải dấu
hiệu có vấn đề.

## Xây từ nguồn: clone, install, dev

Khi nào cần đường này? Ba tình huống: bạn muốn đọc hoặc sửa mã nguồn; nền tảng
của bạn chưa có asset dựng sẵn (Linux với bản hiện tại); hoặc bạn muốn chạy bản
dev có hot reload để theo sát từng thay đổi. Các lệnh trích theo docs getting
started:

```bash
git clone <repo-url> wakii
cd wakii
pnpm install

pnpm dev        # chạy bản dev, có hot reload

pnpm build      # hoặc dựng bản production
pnpm start      # rồi mở app đã build
```

*Nguồn: các lệnh theo docs getting started, bước 1–3, truy 2026-09-08.*

`pnpm install` lần đầu mất vài phút vì nó build cả các module native — phần giả
lập terminal và file watching — cho đúng nền tảng của bạn. Các lần sau nhanh
hơn nhiều. URL repo là link GitHub ở footer của site. Vì sao dự án này build ra
công khai từng bản, kể cả những bản chưa hoàn thiện? Bài [xây Wakii ra công
khai — log 1](/vi/blog/building-wakii-in-the-open-log-1/) kể từ buổi đầu tiên.

## Theo dõi bản mới: Releases là nguồn thật

Trong app, việc kiểm tra bản mới nằm ở Settings → General — nút Check for
Updates kiểm tra khi bạn muốn. Nguồn thật của mọi bản phát hành vẫn là GitHub
Releases, và bạn không cần mở trình duyệt để đọc nó:

```bash
$ gh release list --repo wakii-dev/wakii --limit 5
Wakii 1.4.199	Latest	v1.4.199	2026-09-05T19:07:31Z
Wakii 1.4.198		v1.4.198	2026-09-05T12:47:15Z
Orca Mobile Android mobile-android-v0.0.48	Pre-release	mobile-android-v0.0.48	2026-09-05T13:00:31Z
```

*Nguồn: `gh release list --repo wakii-dev/wakii`, lấy 2026-09-08.*

Đọc bảng trên: cột nhãn cho biết bản nào đang là Latest; ngày phát hành nằm ở
cột cuối. Hai bản desktop cùng ra ngày 2026-09-05 — v1.4.198 lúc 12:47 và
v1.4.199 lúc 19:07, cách nhau vài giờ. Một ngày hai bản không phải chuyện ma
thuật; bài [hai bản phát hành trong một
ngày](/vi/blog/shipping-cadence-two-releases-one-day/) mổ xẻ đúng ngày đó.
Dòng ba là app mobile Android, mang nhãn Pre-release — nhịp phát hành riêng của
dòng app đó, tách khỏi bản desktop.

## Ba vấp thường gặp lúc cài

| Triệu chứng | Nguyên nhân | Xử lý |
|---|---|---|
| Link asset trả 404 | Đường dẫn dạng "latest" yêu cầu khớp đúng tên file, mà tên file mang phiên bản — bản mới ra là link cũ gãy | Lấy link từ trang download, hoặc từ trang release của đúng bản bạn cần |
| Phân vân bản nào là mới nhất | Trang Releases liệt kê cả bản cũ lẫn bản mobile cạnh nhau | Cột nhãn "Latest" là đáp án; app mobile có nhãn Pre-release riêng |
| macOS hỏi xác nhận lần đầu | Hành vi thường gặp của ứng dụng Electron | Xác nhận và tiếp tục |

*Nguồn: tổng hợp từ danh sách asset đã trích ở trên (lấy 2026-09-08) và tài
liệu cài đặt, mục Platform notes — macOS, truy 2026-09-08.*

Vấp thứ nhất đáng giải thích thêm một dòng: tên asset mang phiên bản là tính
năng, không phải bất cẩn — nó giúp mỗi bản tự chứa bộ asset của mình và link
của bản cũ không bị ghi đè. Cái giá là link dạng "bản mới nhất" phải trỏ qua
trang download (do site giữ) thay vì qua một URL có tên file cứng.

Toàn bộ các bước — từ clone đến lần chạy đầu — nằm gọn trong trang [getting
started](/vi/docs/getting-started/). Bài này thêm vào đó phần mà docs lược bớt:
cách đọc Releases, ý nghĩa tên asset mang phiên bản, và những vấp nhỏ lúc bắt
đầu. Các bước lặp lại y nguyên trên từng máy mới — không có bước riêng cho ai.

Tải bản build từ [trang download](/download/), mở Wakii, và bấm icon ⚡ ở
activity bar bên phải — panel Superpowers sẵn sàng cho phiên làm việc đầu tiên.
