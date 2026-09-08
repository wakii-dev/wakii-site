---
title: "Notification và phím tắt: vòng chờ không tắt máy"
description: "Agent dừng ở gate chờ duyệt nhưng bạn không phải ngồi canh màn hình: bài này mổ xẻ vòng đời notification gate-open → deep-link → resolve → gate-closed bằng nguồn thật, kèm phím tắt ⌘⇧⌫ xoá workspace trên desktop."
pubDate: "2026-09-19"
category: "tech"
tags: ["features", "mobile"]
draft: false
---

Một agent đang chạy dở pipeline thì dừng lại — không phải vì lỗi, mà vì nó đặt
một câu hỏi chỉ có người trả lời được. Quyết định hiếm khi là phần đắt: chọn
một lựa chọn mất vài giây. Phần đắt nằm quanh quyết định — mở app, tìm đúng
story, tìm đúng gate, rồi canh xem có gì mới chưa. Vòng đời notification của
gate được thiết kế để xoá phần việc quanh quyết định đó: `gate-open` đến chỗ
bạn đang ở, tap deep-link là đáp đúng màn, resolve xong thì `gate-closed`
xác nhận vòng chờ đã khép.

TL;DR:

- Decision gate dừng agent cho đến khi có người trả lời — chi phí thật nằm ở
  việc canh màn hình, không phải ở việc quyết định.
- Notification `gate-open` mang đủ routing fields; tap deep-link mở đúng màn
  story/gate, còn bản build cũ không có fields mới vẫn hiển thị an toàn.
- Resolve diễn ra ngay nơi bạn đáp xuống: câu hỏi dạng options thành choice
  buttons, dạng free-form thành ô multiline kèm confirm.
- Resolve lỗi thì màn hình refresh sạch; re-tap không tạo side effect — gate
  đã đóng thì tap tiếp không đổi gì.
- Trên desktop, ⌘⇧⌫ xoá workspace đang hover trong sidebar — thiết kế riêng
  để tránh đụng vào phím tắt split bằng D của terminal pane.

## Gate dừng agent; việc ngồi canh mới là thứ cần xoá

Gate là cơ chế an toàn: agent gặp điểm phải quyết định thì dừng và hỏi, thay
vì tự chọn một hướng rủi ro. Bài [decision gates: phanh an toàn cho AI
agents](/vi/blog/decision-gates-safe-ai-agents/) đã nói vì sao dừng lại để hỏi
là tính năng, không phải trục trặc. Bài này nói phần còn lại của câu chuyện —
khoảng thời gian giữa lúc gate mở và lúc bạn trả lời. Trước khi có routing,
khoảng đó bạn phải tự lấp: giữ app mở, quay lại tab, refresh, dò xem gate nào
đang chờ. Vòng đời đầy đủ giờ trông như sau:

```ascii
vòng đời một gate — từ lúc agent dừng đến lúc vòng chờ khép

  agent chạy ──► đặt câu hỏi chờ duyệt ──► agent dừng
                                                │
                                    notification `gate-open`
                                                │
                                bạn nhận thông báo ──► tap deep-link
                                                │
                                        mở đúng màn story/gate
                                                │
                        resolve (choice buttons / free-text + confirm)
                                                │
                                    notification `gate-closed`
                                                │
                                    vòng chờ khép — agent chạy tiếp
```

*Nguồn: dựng từ phần Mobile của release notes v1.4.199, repo wakii-dev/wakii,
lấy 2026-09-08.*

Chú ý hai đầu của vòng: đầu vào là notification thay cho việc bạn dò màn hình;
đầu ra là `gate-closed` thay cho việc bạn quay lại kiểm tra. Ở giữa là một lần
tap thay cho chuỗi thao tác tìm đường.

## Routing fields: notification biết mình đang nói về gate nào

Một notification gate không phải chỉ là dòng chữ báo "có gate mở". Nó mang
theo định danh để hệ thống và app dùng chung: gate nào, story nào, worktree
nào. Release notes v1.4.199 ghi điều đó đúng một dòng:

```bash
Notification routing: `gate-open`/`gate-closed` đủ routing fields,
tap → đúng màn; old-build hiển thị an toàn
```

*Nguồn: release notes v1.4.199, phần Mobile, repo wakii-dev/wakii, lấy
2026-09-08.*

Trong code nguồn, các fields này xuất hiện đúng như notes mô tả — và được đánh
dấu optional vì một lý do được ghi ngay trên dòng chú thích:

```bash
// Gate routing fields (gate-open/gate-closed); optional so old clients ignore them.
gateId?: string
storyId?: string
```

*Nguồn: src/main/runtime/runtime-mobile-notification-controller.ts, repo
wakii-dev/wakii, lấy 2026-09-08.*

Tên nguồn thông báo cũng được set theo loại transition, không phải do UI tự
đoán:

```bash
source: event.kind === 'open' ? 'gate-open' : 'gate-closed'
```

*Nguồn: src/main/runtime/runtime-gate-transition-notifications.ts, repo
wakii-dev/wakii, lấy 2026-09-08.*

Cụm "old-build hiển thị an toàn" là phần giới hạn cần nói thẳng: routing fields
là thứ thêm mới, bản build cũ không đọc được thì bỏ qua và vẫn hiện
notification bình thường. Đổi lại, hành vi tap → đúng màn chỉ trọn vẹn trên
build mới — đúng như notes ghi, không hơn.

## Resolve tại chỗ: choice buttons, free-text kèm confirm, và phần guard

Đáp đúng màn rồi thì việc còn lại là trả lời. Notes ghi rõ hai dạng câu hỏi
được xử lý khác nhau:

```bash
Gate resolve: options → choice buttons; free-form → multiline + confirm;
lỗi resolve refresh sạch, re-tap không side effect
```

*Nguồn: release notes v1.4.199, phần Mobile, repo wakii-dev/wakii, lấy
2026-09-08.*

Đọc tách từng mệnh đề: câu hỏi dạng options được hiển thị thành các choice
buttons — các lựa chọn nằm sẵn trên màn hình resolve. Câu hỏi free-form mở ô
multiline và yêu cầu confirm trước khi câu trả lời được gửi đi. Hai mệnh đề
sau là phần guard: resolve gặp lỗi thì màn hình refresh sạch, không treo lại
nửa vời; re-tap không tạo side effect — tap nhầm hai lần vào cùng một
notification không resolve trùng, gate đã đóng thì lần tap sau không đổi gì.

Và khi bạn trả lời xong, vòng không im lặng: `gate-closed` đi kèm kết quả.
Trong code, phần body của notification này được lấy từ resolution của gate:

```bash
body: event.kind === 'open' ? '' : (event.gate.resolution ?? '')
```

*Nguồn: src/main/runtime/runtime-gate-transition-notifications.ts, repo
wakii-dev/wakii, lấy 2026-09-08.*

Nghĩa là bạn biết vòng chờ đã khép và nó khép bằng câu trả lời nào — mà không
cần mở lại app để dò.

## Phía desktop: ⌘⇧⌫ xoá workspace đang hover trong sidebar

Notification lo nửa "chờ"; nửa còn lại của bài này là một phím tắt dọn dẹp
phía desktop. Commit nhập tính năng này nói được cả phím lẫn lý do thiết kế —
trích đoạn message:

```bash
$ git show 7b9529da22 -s --format=%B
Add keyboard shortcut for workspace deletion (#16271)

Default Mod+Shift+Backspace (⌘⇧⌫ on Mac) lets users delete the hovered
worktree or folder workspace immediately. The shortcut targets the
sidebar hover state rather than requiring focus, and avoids terminal
pane D-based split shortcuts on all platforms.
```

*Nguồn: commit 7b9529da22 "Add keyboard shortcut for workspace deletion
(#16271)", repo wakii-dev/wakii — nhập từ v1.4.193, có mặt trong tag v1.4.198
và v1.4.199, lấy 2026-09-08.*

Ba chi tiết đáng đọc trong message đó. Thứ nhất, phím mặc định là
Mod+Shift+Backspace — ⌘⇧⌫ trên Mac — tác dụng ngay lên worktree hoặc folder
workspace đang hover. Thứ hai, mục tiêu là hover state của sidebar chứ không
phải focus: mắt bạn đang chỉ vào dòng nào, phím tắt tác dụng lên dòng đó,
không cần chọn trước bằng click. Thứ ba, vì sao không dùng chữ D cho lệnh
xoá: D đã bị các phím tắt split của terminal pane chiếm trên mọi platform —
chọn tổ hợp khác để lệnh xoá không đụng vào phím split. Giới hạn cũng nằm
ngay đó: shortcut bám vào hover state của sidebar, nên nó là công cụ dọn danh
sách workspace, không phải lệnh xoá toàn cục.

Cả hai mảnh trong bài phục vụ cùng một thói quen: bớt thời gian canh hệ
thống, giữ thời gian cho việc ra quyết định. Chi tiết về gate nằm trong
[FAQ](/vi/docs/faq/); vì sao gate tồn tại đã có bài [decision
gates](/vi/blog/decision-gates-safe-ai-agents/). Muốn tự thấy vòng đời này:
để một pipeline chạy tới gate, rời màn hình đi việc khác, và đợi notification
thay vì đợi màn hình — tap vào, trả lời, và nhìn `gate-closed` khép vòng.
