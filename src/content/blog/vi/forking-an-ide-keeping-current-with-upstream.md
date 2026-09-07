---
title: "Fork một IDE mà vẫn giữ nhịp với upstream: bài học từ Wakii"
description: "Wakii fork từ Orca: main là dòng release được fork-sync ff-only mỗi ngày, các story branch chạy song song upstream — và chiến lược khi xung đột nổ ra."
pubDate: "2026-09-02"
category: "tech"
tags: ["git", "fork", "upstream"]
draft: false
heroImage: "/blog/heroes/forking-an-ide-keeping-current-with-upstream.png"
---

Wakii xây trên Orca — một agentic IDE mã nguồn mở. Fork là quyết định dễ; giữ cho fork không trở thành một bản sao bỏ đi sau sáu tháng mới là phần khó. Bài này chia sẻ cách chúng tôi giữ nhịp với upstream mà vẫn phát triển hướng riêng không ngừng.

## Vì sao fork thay vì chờ upstream

Upstream có tốc độ và ưu tiên của upstream. Chúng tôi cần bộ nhận diện riêng, story workflow xây cho team, và nhịp release của riêng mình — nhưng không muốn đánh mất những bug fix và cải tiến mà upstream đang làm mỗi tuần. Fork kèm kỷ luật sync là câu trả lời cho cả hai.

## Hai dòng chảy: main và wakii-dev

Repo của Wakii giữ hai dòng tách bạch. `main` là dòng release: chỉ nhận release-merge, và được đồng bộ từ upstream hằng ngày. `wakii-dev` là dòng sống: mọi tính năng của Wakii bắt đầu như story branch tách từ đây, sống song song với upstream mà không tranh chấp nhánh nào.

Cách chia này cắt sạch câu hỏi "đang code trên nhánh nào": tính năng nằm ở story branch, release nằm ở main, và không dòng nào tự ý lai ghép.

## Fork-sync ff-only mỗi ngày

Mỗi ngày, main được sync từ upstream theo kiểu fast-forward only. Upstream không có gì mới: no-op. Có commit mới và lịch sử thẳng: fast-forward gọn gàng. Hai dòng đã phân kỳ: dừng lại và để con người xử lý — tuyệt đối không auto-merge băm thêm commit bẩn vào dòng release.

Hệ quả: `main` luôn là một hàm thuần của upstream cộng các release-merge — không gì khác. Ai nhìn vào main tại bất cứ thời điểm nào cũng biết chính xác nó là gì.

## Khi xung đột nổ ra

Xung đột, khi có, xuất hiện ở story branch — không bao giờ ở main, vì main không nhận chỉnh sửa lẻ tẻ. Chiến lược của chúng tôi, theo thứ tự:

1. **Tách ngay từ đầu.** Nội dung thương hiệu và cấu hình riêng nằm ở file riêng. File dùng chung ít đi thì mặt va chạm nhỏ đi.
2. **Sync sớm, sync thường.** Conflict tích sau ba tuần là một dự án; conflict phát hiện sau một ngày là việc ba phút.
3. **Giải trên story branch.** Khi upstream đổi thật sự va vào tính năng đang làm, merge upstream vào story branch, xử lý xong, rồi mới nói chuyện PR.

Kết quả sau nhiều tháng: upstream vẫn là tài sản, không phải gánh nặng. Muốn hiểu Wakii khác Orca ở những điểm nào, xem [FAQ](/docs/faq/); muốn tự build từ source, bắt đầu ở [getting started](/docs/getting-started/).
