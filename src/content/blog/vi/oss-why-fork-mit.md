---
title: "Vì sao fork MIT: open source có chủ đích"
description: "Wakii fork Orca công khai dưới MIT: bài này đọc thẳng file LICENSE, dòng credit ở footer và README để chỉ ra fork công khai là một cam kết — người dùng tự build được từ source, và mọi lá cờ credit đều có địa chỉ."
pubDate: "2026-09-27"
category: "tech"
tags: ["oss", "license", "fork"]
draft: false
---

Fork một dự án mã nguồn mở là thao tác ba phút: bấm nút, đổi remote, đẩy code. Phần ít người bàn tới nằm ở giấy phép và ở sự công khai — vì sao chọn MIT, vì sao giữ nguyên dòng credit của dự án mẹ, và vì sao để cả thế giới đọc được lịch sử fork. Với Wakii, đó không phải mục pháp lý để cho có: đó là toàn bộ lời hứa của dự án. Bài này không kể hành động fork — bài trước đó đã kể rồi — mà đọc thẳng các file làm bằng chứng: LICENSE, README, footer của site, và cho bạn thấy open source ở đây là một lựa chọn có chủ đích, chạy được kiểm chứng bằng vài lệnh.

TL;DR:

- MIT cho phép mọi thứ — fork, sửa, bán, đóng cửa — nên giá trị không nằm ở giấy phép mà ở cách dùng nó: Wakii giữ MIT và giữ nguyên attribution của upstream.
- Chuỗi MIT đọc được từ footer của site: superpowers (MIT) → orca (MIT) → wakii (MIT), mỗi mắt xích trỏ đúng repo gốc.
- Repo sản phẩm `wakii-dev/wakii` có file LICENSE thật; repo site `wakii-dev/wakii-site` thì chưa có file LICENSE riêng — bài này nói thẳng điều đó thay vì giả định.
- Fork công khai là cam kết: người dùng có thể tự build từ source, và mọi con số trong blog này kèm lệnh chạy lại được.

## Giấy phép cho phép, attribution định danh

Điểm xuất phát là một file. Repo sản phẩm của Wakii mở đầu bằng đúng các dòng chuẩn của MIT:

```text
MIT License

Copyright (c) 2026 Lovecast Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

*Nguồn: `LICENSE`, repo `wakii-dev/wakii` (bản mirror cục bộ tại `/Users/hoivu/Desktop/projects/orca`, nhánh `wakii-dev`), lấy 2026-09-08.*

MIT ngắn, và sự ngắn ấy là toàn bộ điểm mạnh của nó: nó không cấm ai điều gì. Fork được, sửa được, đóng cửa source cũng được. Nghĩa là giấy phép không thể là thứ làm bản sắc của một fork — ai cũng có thể làm y hệt. Cái làm bản sắc là phần còn lại: bạn giữ gìn gì trong đó. Wakii giữ nguyên dòng bản quyền của Lovecast Inc. trong file LICENSE thay vì xén nó đi, và phần mô tả trong README nói thẳng quan hệ:

```text
Wakii is a fork of Orca (MIT) — the AI orchestrator that runs Codex,
Claude Code, OpenCode, Pi and any other CLI agent side-by-side, each
in its own isolated git worktree.
```

*Nguồn: `README.md`, repo `wakii-dev/wakii`, lấy 2026-09-08.*

Câu mở đầu của README định vị Wakii là fork trước khi nói bất cứ tính năng riêng nào. Thứ tự ấy là có chủ đích: người đọc đầu tiên cần biết dự án này đến từ đâu, không phải đoán.

## Chuỗi MIT: ba mắt xích, đều trỏ được

Attribution không dừng ở một câu trong README. Nó nằm ở nơi mọi người xem cuối mỗi trang — footer của site — và viết thành một chuỗi mắt xích hoàn chỉnh:

```text
wakii. — open-source agentic IDE, forked from
orca (MIT). Superpowers kit: superpowers by
Jesse Vincent (MIT). exit code 0. © Wakii.
```

*Nguồn: `src/components/Footer.astro`, repo `wakii-dev/wakii-site`, lấy 2026-09-08.*

Đọc chuỗi đó theo hướng ngược thời gian, bạn được một gia phả:

```ascii
obra/superpowers (MIT, Jesse Vincent)
        └─ kit "superpowers" đi kèm
stablyai/orca (MIT, Lovecast Inc.)
        └─ platform: AI orchestrator + worktrees
wakii-dev/wakii (MIT)
        └─ Wakii: fork + workflow kit rebrand
```

*Nguồn: `LICENSE` + `README.md` của `wakii-dev/wakii` (mục License: "MIT — same as upstream Orca. The bundled story-team kit originates from superpowers (MIT) by Jesse Vincent."), lấy 2026-09-08.*

Mỗi mắt xích trong gia phả này là một repo thật, trỏ được, đọc được giấy phép thật. MIT ở mắt trên cho phép mắt dưới tồn tại; và mắt dưới trả giá bằng sự tường minh: không ăn cắp dòng lịch sử. Đây là lý do bài này nói fork MIT "có chủ đích": giấy phép cho phép mọi thứ, còn chủ đích nằm ở việc chọn giữ lại đúng những gì nên giữ — dòng credit, file LICENSE gốc, và con đường từ kit đến platform đến fork.

## Hai repo, hai ranh giới

Một dự án như Wakii không sống trong một repo. Có hai, và ranh giới giữa chúng đáng vẽ ra:

```ascii
wakii-dev/wakii          wakii-dev/wakii-site
(sản phẩm: app desktop)  (site: wakii.xyz)
LICENSE: có (MIT)        LICENSE: chưa có file riêng,
REPO_URL trỏ về đây      credit MIT nằm ở Footer.astro
releases + assets        blog, docs, download page
```

*Nguồn: `src/config.ts` (`REPO_URL = 'https://github.com/wakii-dev/wakii'`) và `ls LICENSE*` trên repo site (không có kết quả tại thời điểm lấy), lấy 2026-09-08.*

Repo sản phẩm có file LICENSE — bằng chứng ở phần trước. Repo site thì tại thời điểm viết chưa có file LICENSE riêng; chỗ duy nhất nói về giấy phép của nó là dòng credit trong `Footer.astro`. Bài này ghi đúng trạng thái đó thay vì giả định mọi repo đều đủ giấy phép — cũng giống như mọi con số khác trong blog này, trạng thái giấy phép là thứ phải đọc từ file chứ không phải nhớ từ ý định. Đây cũng là một việc còn treo, được ghi công khai đúng ở đây: repo site cần file LICENSE riêng của nó.

Sự tách hai repo còn phục vụ một mục tiêu thực dụng: người tải app và người đọc blog không cần biết về nhau. Config của site pin đường dẫn tải về repo sản phẩm — `REPO_URL` xuất hiện trong mọi URL download — nên site chỉ là cửa hàng, kho vẫn là kho.

## Công khai là hợp đồng với người dùng

MIT cho người dùng quyền tự build, và một fork công khai phải giữ lời hứa đó khả thi. README của repo sản phẩm ghi rõ bản build phân phối thế nào:

```text
macOS builds ship on GitHub Releases — unsigned, so
right-click → Open on first launch (or allow it in
System Settings → Privacy & Security)
```

*Nguồn: `README.md`, repo `wakii-dev/wakii`, lấy 2026-09-08.*

"Unsigned" là một chi tiết trung thực hiếm thấy: bản dựng không qua ký số, người dùng tự quyết định có mở không, và đường dẫn build từ source tới binary không có bước đen nào. Nếu bạn nghi điều gì trong chuỗi này — file LICENSE kia nằm ở đâu, dòng credit viết thế nào — mọi thứ đều là file trong repo công khai, và lệnh kiểm tra là một cú `cat`.

Sự công khai ấy còn lan sang cả quy trình làm việc: blog bạn đang đọc là sản phẩm của một story workflow chạy công khai, mỗi bài kèm nguồn và ngày lấy cho từng claim. Bài [fork IDE giữ nhịp upstream](/vi/blog/forking-an-ide-keeping-current-with-upstream/) kể hành động fork và cách giữ nhịp; bài này hoàn thiện nửa còn lại — lý do pháp lý và chiến lược đằng sau nó. Đến đây thì ba mắt xích MIT, hai repo và một lời hứa "tự build được" đã nối đủ.

Muốn tự đọc các nguồn trên, mở [FAQ](/vi/docs/faq/) — trang tổng hợp những câu hỏi thường gặp về Wakii và quan hệ với Orca — hoặc thẳng vào repo sản phẩm: file LICENSE nằm ngay gốc repo, đúng chỗ mà một dự án MIT nên để nó.

Tải Wakii từ trang [download](/vi/download/), hoặc clone repo và tự build — MIT nghĩa là cả hai đường đều chính đáng, và dự án này cố giữ cho cả hai đều đi được.
