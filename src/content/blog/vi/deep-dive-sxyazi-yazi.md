---
title: "Yazi: file manager terminal viết bằng Rust"
description: "Bóc kiến trúc Yazi — workspace 31 crate, scheduler async có priority, đàm phán protocol xem ảnh với chuỗi fallback, plugin Lua kèm package manager — bài học TUI hiện đại."
pubDate: "2026-10-21"
category: "tech"
tags: ["terminal", "architecture", "cli"]
draft: false
---

File manager terminal nghe như một công cụ của quá khứ, cho tới khi bạn mở một thư mục vài chục nghìn file trên màn hình 4K và muốn xem ảnh, xem video, lọc tên file mà không rời tay khỏi bàn phím. Yazi — tên nghĩa là "vịt" — của sxyazi là file manager hiện đại theo đúng nghĩa đó: 42.043 sao, 1.009 fork, license MIT (theo GitHub API ngày 2026-09-08), mô tả chính thức — "Blazing fast terminal file manager written in Rust, based on async I/O" ([sxyazi/yazi](https://github.com/sxyazi/yazi), GitHub API ngày 2026-09-08). Điều đáng học không phải tốc độ, mà cách repo tổ chức một ứng dụng TUI phức tạp: nhìn vào workspace của nó là thấy một bản đồ kiến trúc hoàn chỉnh.

## TL;DR

- Workspace gồm 31 crate `yazi-*` — mỗi concern một crate: core, scheduler, plugin, adapter, dds, vfs, watcher…
- I/O async toàn phần; scheduler nền phân loại task và có 3 mức priority, progress real-time, cancel được.
- Xem ảnh trong terminal bằng đàm phán protocol: Kitty placeholders, iTerm2 inline, Sixel — fallback về Überzug++ rồi Chafa ASCII.
- Plugin là "just some pieces of Lua" — chạm tới cả UI/theme — kèm package manager cài 1 lệnh, pin được version.
- Wakii học được hướng scheduler nền có priority và pattern degrade có chủ đích trên môi trường khác nhau.

## Ba mươi mốt crate, một workspace

Mở thư mục gốc của repo là thấy quyết định kiến trúc lớn nhất: không phải một crate lớn chia module, mà là 31 crate `yazi-*` (probe GitHub API ngày 2026-09-08). Mỗi concern một crate với ranh giới compile rõ ràng:

| crate nhóm | vai trò |
|---|---|
| `yazi-core`, `yazi-fm` | lõi điều hướng + giao diện file manager |
| `yazi-scheduler` | hàng đợi task nền: preload, preview, fetch… |
| `yazi-plugin` + `yazi-binding` | runtime Lua cho plugin |
| `yazi-adapter`, `yazi-term`, `yazi-tty` | giao tiếp terminal + protocol xem ảnh |
| `yazi-dds` | pub-sub chéo instance |
| `yazi-vfs`, `yazi-sftp`, `yazi-watcher` | virtual filesystem, remote, theo dõi file |

(nguồn: [thư mục gốc repo @ commit 8c2b5f8](https://github.com/sxyazi/yazi/tree/8c2b5f8cad4a5a97cfe924419f6f3ec0cd88b609), probe 2026-09-08 — còn adapter/emulator/parser/proxy/widgets…)

Ranh giới này ép mọi phụ thuộc đi qua điểm khai báo: crate scheduler không thể import trực tiếp crate UI để "vẽ tiện tay". Với một TUI làm việc nền liên tục — đếm file, giải mã ảnh, chạy plugin — việc tách bạch đó là điều kiện để hiệu năng đo được và regression khoanh vùng được.

## Async mọi cấp: scheduler có priority

README của Yazi khẳng định toàn bộ I/O là async, CPU task dàn trên nhiều thread, và hệ thống task có "real-time progress updates, task cancellation, and internal task priority assignment" ([Yazi README](https://github.com/sxyazi/yazi#readme), truy cập 2026-09-08). Code xác nhận mức độ nghiêm túc đó. `yazi-scheduler/src/lib.rs` @ HEAD khai ba mức priority từ config:

```rust
const LOW: u8 = yazi_config::Priority::Low as u8;
const NORMAL: u8 = yazi_config::Priority::Normal as u8;
const HIGH: u8 = yazi_config::Priority::High as u8;
```

(nguồn: [yazi-scheduler/src/lib.rs @ commit 8c2b5f8](https://github.com/sxyazi/yazi/blob/8c2b5f8cad4a5a97cfe924419f6f3ec0cd88b609/yazi-scheduler/src/lib.rs), probe 2026-09-08)

Task được phân loại theo đúng việc nó làm — `custom fetch file hook plugin preload process size` — mỗi loại một hàng đợi riêng với worker, progress, trạng thái ongoing. Trong thực tế dùng: mở một thư mục lớn, việc đếm file (HIGH) không phải xếp hàng sau việc giải mã ảnh preview (thấp hơn), và một task treo có thể cancel mà không kẹt các task khác. Scheduler không phải chi tiết phụ của file manager — nó là trái tim của trải nghiệm "blazing fast".

## Xem ảnh: đàm phán protocol với chuỗi fallback

Xem ảnh trong terminal là bài toán không có một câu trả lời duy nhất: mỗi terminal hỗ trợ một protocol đồ họa khác nhau. Yazi giải bằng một bảng đàm phán công khai ngay trong README: kitty, Ghostty, Rio qua Kitty unicode placeholders; iTerm2, WezTerm, Warp, Tabby, thậm chí VS Code qua inline images protocol; Konsole qua Kitty old protocol; foot và Windows Terminal qua Sixel ([Yazi README — Image Preview](https://github.com/sxyazi/yazi#image-preview), truy cập 2026-09-08).

```
detect terminal
   ├─ kitty/Ghostty/Rio   → Kitty unicode placeholders
   ├─ iTerm2/WezTerm/VSCode → inline images protocol
   ├─ foot/Windows Terminal → Sixel
   ├─ X11/Wayland          → Überzug++  (cần cài thêm)
   └─ mọi thứ còn lại      → Chafa ASCII art (cần cài thêm)
```

Cấu trúc của giải pháp đáng học hơn danh sách: crate `yazi-adapter` giữ drivers theo protocol (README link thẳng tới `yazi-adapter/src/drivers/kgp_old.rs`), phát hiện môi trường rồi chọn đường tốt nhất, và hai tầng fallback cuối được khai báo thành tính năng thay vì báo lỗi. Người dùng terminal lạ vẫn thấy preview — xấu đi một chút, nhưng vẫn thấy. Degrade có chủ đích, không fail trắng màn.

## Plugin là Lua, phân phối như package

Lớp mở rộng của Yazi cũng có quan điểm rõ: plugin là "just some pieces of Lua" ([Yazi README](https://github.com/sxyazi/yazi#readme), truy cập 2026-09-08) — nhưng Lua nhúng này chạm được xa hơn mức lọc file: bề mặt từ [`yazi-plugin/src/lib.rs` @ 8c2b5f8](https://github.com/sxyazi/yazi/blob/8c2b5f8cad4a5a97cfe924419f6f3ec0cd88b609/yazi-plugin/src/lib.rs) gồm `fs`, `keymap`, `pubsub`, `tasks`, `theme`, `ui` — plugin có thể rewrite phần lớn UI. Phân phối đi kèm: package manager cài plugin/theme một lệnh, cập nhật hoặc pin phiên bản cụ thể. Riêng `yazi-dds` giải bài toán giao tiếp giữa các instance yazi đang mở: client-server nhưng không cần process server thêm, pub-sub trên nền Lua, cho phép state persistence. Một file manager độc lập xử lý nghiêm túc bài toán multi-instance — thường chỉ thấy ở IDE.

Trong Wakii, terminal không phải công cụ phụ: panel có terminal splits, agent chạy trong terminal đó, và bạn điều hướng giữa nhiều worktree mỗi ngày — trải nghiệm tổng thể nằm trong [docs agents-and-kit](/vi/docs/agents-and-kit/). Góc nhìn cách một ứng dụng desktop tổ chức tiến trình và IPC đã mổ xẻ trong bài [mô hình tiến trình Electron của Wakii](/vi/blog/arch-electron-process-model/); Yazi cho thấy cùng tư duy đó ở phiên bản TUI thuần.

## Wakii học được gì

- **DIRECTION** — scheduler nền có priority + progress + cancel: `yazi-scheduler` phân loại task (preload/preview/fetch), 3 mức priority, progress real-time — đúng hình dạng cho các việc nền của IDE Wakii (render, sync, index) khi chúng nhiều lên. Hướng kiến trúc, chưa phải việc ngay.
- **WATCH** — đàm phán năng lực + chuỗi fallback: image adapter detect terminal rồi degrade có chủ đích (protocol → Überzug++ → Chafa) thay vì báo lỗi. Theo dõi cho kit/app Wakii trên môi trường đa dạng (SSH host, terminal khác nhau): detect rồi degrade, không fail cứng.
- **WATCH** — capability là content + pin phiên bản: plugin Yazi là file Lua nhỏ, package manager hỗ trợ pin version. Wakii kit đã theo skills-as-content; điểm đáng theo là cơ chế pin để update skill không làm gãy story đang chạy.

Wakii là agentic IDE với một đội agent có sẵn, cài xong là chạy — nếu bạn muốn bắt đầu, [docs getting-started](/vi/docs/getting-started/) dẫn từ cài đặt tới panel đầu tiên.
