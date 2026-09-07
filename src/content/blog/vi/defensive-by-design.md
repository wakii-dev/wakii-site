---
title: "Phòng thủ từ thiết kế"
description: "Workflow của Wakii giả định chính agent sẽ mắc lỗi — nên nó làm cho việc sai trở nên rẻ và dễ quan sát: không xoá gì, điều chưa biết cờ lên thay vì bịa, lệnh mới phải dry-test. Bài này kể ba thói quen đó và case merge conflict giữ cả hai bên."
pubDate: "2026-08-25"
category: "tech"
tags: ["guardrails", "workflow", "agents"]
draft: false
---

Phần lớn phần mềm phòng thủ theo một hướng duy nhất: chống người dùng —
người dùng nhập bậy thì validation chặn, xoá nhầm thì dialog hỏi lại,
lỡ bấm thì có nút undo. Mọi lớp phòng thủ đều đứng ở ranh giới giữa hệ
thống và người ngoài nó. Story workflow của Wakii quay mũi tên theo
hướng ngược lại: thứ hay sai nhất trong quy trình không phải người dùng
mà là chính agent đang chạy quy trình — nên nguyên tắc thứ tám không
viết "hãy cẩn thận", mà viết thẳng giả định lỗi sẽ đến từ bên trong, và
thiết kế để khi lỗi đến, nó rẻ và nhìn thấy được. Bài này đi qua ba
thói quen sinh ra từ giả định đó — không xoá gì, cờ lên thay vì bịa,
dry-test trước khi tin — và một case merge conflict được giải theo cách
ít ai chọn: giữ cả hai bên.

TL;DR:

- Workflow giả định chính agent là người mắc lỗi — phòng thủ đặt quanh
  người viết, không phải người dùng.
- Không gì bị xoá: mọi thứ revert được, và cái bị thay thế được đánh
  dấu rồi giữ lại làm audit trail thay vì vứt đi.
- Điều chưa biết bị cờ lên thay vì bịa; lệnh mới phải dry-test trước
  khi được tin.
- Merge conflict trong file notes chung được giải bằng cách giữ cả hai
  bên — vì giá của đoán sai đắt hơn giữ cả hai.

## Giả định là nợ

Nguyên tắc thứ tám của story workflow gói cả ba thói quen trong một
đoạn ngắn:

> Workflow giả định **chính nó sẽ là người mắc lỗi** — nên nó làm cho việc
> sai trở nên rẻ và dễ quan sát. Không gì bị xóa (mọi thứ đều revert
> được), điều chưa biết bị cờ lên thay vì bịa, và lệnh mới phải dry-test
> trước khi được tin ("tài liệu nói nó chạy" ≠ "nó chạy").

*Nguồn: `src/content/docs/vi/story-workflow.md` nguyên tắc 8 "Phòng thủ từ thiết kế", lấy 2026-09-07.*

Hai vế cuối của đoạn này đáng dừng lại từng vế. "Cờ lên thay vì bịa"
là chuyện nợ tri thức: một chỗ bịa — lấp chỗ chưa biết bằng một câu
nghe hợp lý — là món nợ không có sổ sách; nếu nó sai, phát hiện đến sau
khi mọi thứ đã xây trên nó. Một cờ là món nợ có sổ: nó đứng nguyên văn
ở đúng chỗ phát sinh, ai đi qua cũng thấy, và xoá nó chỉ tốn đúng một
cú sửa. Dry-test là chuyện khoảng cách giữa claim và quan sát: "tài
liệu nói nó chạy" là một lời khẳng định của ai đó; "nó chạy" là một sự
kiện đã xảy ra. Khoảng cách giữa hai câu đó chỉ lấp được bằng một lần
chạy thử vô hại — trước khi lệnh được dùng để ra quyết định thật, không
phải sau.

## Không xoá gì cả

"Không gì bị xóa" nghe như kỷ luật lưu trữ, nhưng giá trị thật nằm ở
phía bên kia của phép so sánh revert và xoá. Xoá là sửa lịch sử cho vết
hỏng biến mất: file được dọn, commit được viết lại, và câu hỏi "chuyện
gì đã xảy ra" mất lời đáp. Revert là thêm một lớp mới đè lên: phần sai
vẫn nằm nguyên trong lịch sử, kèm cả commit ghi rõ vì sao nó bị bỏ. Kết
quả bề mặt giống nhau — code sạch — nhưng một phía còn audit trail và
phía kia không:

```ascii
commit sai
   │
   ├─ xoá / reset --hard ──→ vết hỏng biến mất ──→ không còn gì để đọc lại
   │
   └─ revert + đánh dấu ──→ lịch sử còn ──→ audit trail còn ──→ bài học còn
```

*Nguồn: sơ đồ tự vẽ theo `src/content/docs/vi/story-workflow.md` nguyên tắc 8, lấy 2026-09-07.*

Quy tắc này không nằm trên giấy. Trong hub-store — một dự án production
khác đang chạy bằng chính story workflow này — một story bị hủy bỏ
không bị xoá khỏi repo. Bracket của nó được đặt dòng đánh dấu lên đầu
và giữ lại làm tài liệu:

> SUPERSEDED 2026-08-31 — gộp vào FI-233; file còn là audit trail
> ("File này chỉ còn là audit trail (Linear FI-232 Canceled)")

*Nguồn: `docs/superpowers/editorial/2026-blog-longform/evidence-pack.md` §Hub-store artifacts — bracket `ict-service-support-rebuild`, snapshot 2026-09-07.*

Một story bị đánh dấu superseded và gộp vào story khác — và thay vì
dọn file cho repo gọn gàng, workflow đặt dấu lên đầu file và để nguyên
phần còn lại. File giờ chỉ còn một nhiệm vụ: kể cho ai đọc sau rằng
story này từng tồn tại, đã bị gộp vào đâu. Đó là chữ "dễ quan sát"
trong nguyên tắc 8 ở dạng thuần nhất: cái sai không những không bị
giấu mà còn được biên thành ghi chú, đặt đúng chỗ người sau sẽ tìm tới
trước.

## Giữ CẢ HAI bên khi conflict

Case cuối là loại sự cố nhỏ nhất nhưng lặp lại nhiều nhất: merge
conflict trong một file notes chung — hai sub-feature cùng sửa một file
ghi chú dùng chung, git hỏi giữ nửa nào. Nguyên tắc 8 có ví dụ đúng
trường hợp đó:

> *Ví dụ: khi
> merge conflict xuất hiện trong một file notes chung, lời giải giữ cả hai
> bên thay vì bỏ một bên — cái giá của việc đoán sai dòng nào quan trọng
> đắt hơn việc giữ cả hai.*

*Nguồn: `src/content/docs/vi/story-workflow.md` nguyên tắc 8, lấy 2026-09-07.*

Lời giải này đáng đọc qua bảng chi phí. Giữ cả hai bên: tốn thêm một
lượt đọc — ai đó phải đọc hai đoạn trùng nhau rồi ghép lại sau. Bỏ một
bên: nếu đoán trúng, tiết kiệm được đúng một lượt đọc đó; nếu đoán
trượt, một mẩu ghi chú không bản sao biến mất vĩnh viễn — và không ai
biết nó từng tồn tại. Hai cái giá không cân xứng: một bên biết trước
và nhỏ, một bên không biết trước và có thể không có đáy. Quyết định
phòng thủ chọn phía giá cố định, và phần dọn ghép được hoãn đến khi có
đủ thông tin để làm đúng. (Khác với xung đột fork-sync giữa fork và
upstream — loại thuộc tầng git của cả repo — case này là xung đột nội
bộ giữa hai sub-feature cùng viết một file.)

Cả tám nguyên tắc, trong đó "Phòng thủ từ thiết kế" là nguyên tắc thứ
tám, nằm trong docs [story workflow](/vi/docs/story-workflow/). Và khi
một lỗi đã được giữ lại làm audit trail, nó không đứng yên ở đó: bài
[vòng lặp học của story](/vi/blog/story-memory-learning-loop/) kể tiếp
phần còn lại — sai được ghi lại là nguyên liệu của vòng học. Muốn thấy
ba thói quen này chạy thật: để ý lần tới một lệnh mới xuất hiện trong
quy trình, và xem nó có được chạy thử vô hại một lần trước khi được
tin hay không.
