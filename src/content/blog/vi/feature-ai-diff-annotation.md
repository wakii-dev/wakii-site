---
title: "AI diff annotation: review đọc được lý do"
description: "Ghim ghi chú review ngay lên dòng diff rồi gửi thẳng về phiên agent đang chạy. Bài này mổ xẻ cơ chế đã ship trong v1.4.199 — popover soạn ghi chú, card ghim trên diff, comment GitHub gắn lại trang PR — đọc trực tiếp từ code."
pubDate: "2026-09-17"
category: "tech"
tags: ["features", "qa"]
draft: false
---

Agent sửa xong code, người review mở diff và để lại vài comment — rồi vòng đời
tiếp diễn theo thói quen cũ: comment nằm lại trong trình duyệt, agent chạy tiếp
mà không hề đọc. Lý do của từng thay đổi — vì sao dòng này phải sửa, tiêu chí
nào chưa đạt — nằm ở đúng nơi agent không nhìn thấy. Wakii nhắm thẳng vào chỗ
gãy đó: ghi chú review được ghim ngay lên dòng diff, soạn với placeholder
"Add note for the AI", rồi gửi ngược về phiên agent. Bài này đọc cơ chế đó
trực tiếp từ code, sau khi nó đã ship trong v1.4.199.

TL;DR:

- Ghi chú review không nằm trong một tab riêng — nó là dữ liệu gắn với file và
  dòng code: soạn bằng popover, hiển thị bằng card ghim trong view zone của
  Monaco, ngay dưới dòng được chú thích.
- Nút "This note" định dạng ghi chú thành prompt và gửi về phiên agent; ghi chú
  đã gửi bị loại khỏi lần gửi sau ("Note already sent").
- Trên trang PR, comment review của GitHub được ghim về đúng dòng hiện tại của
  code; thread outdated bị loại khỏi hàng inline để không gắn nhầm dòng.
- Phạm vi nói thẳng: đây là cơ chế đưa lý do quay lại phía agent — card không
  tự sửa code và không gọi model nào.

## Comment nằm ngoài đầu agent

Vòng review mặc định có một lỗ hổng cấu trúc, không phải lỗi làm ẩu. Phần diff
nằm trong tool của agent; phần comment nằm trong trình duyệt. Hai nửa này
không gặp nhau: agent nhận việc sửa mới mà không mang theo lý do của việc sửa
trước, người review thì phải gõ lại ngữ cảnh trong từng prompt mới:

```ascii
vòng review hở — lý do nằm ở nơi agent không đọc

  agent sửa code → diff mở ra → người review đọc
                                    │ comment ghi vào trình duyệt / GitHub
                                    ▼
  agent chạy việc mới ◄── prompt mới không mang theo comment
                          → sửa được việc, mất lý do
```

*Nguồn: sơ đồ khái niệm minh họa khoảng hở mà caption của feature-wall tile-08
gọi tên ("ship them back to the agent"), lấy 2026-09-08.*

Hệ quả không dừng ở bất tiện. Một comment review thiếu ngữ cảnh buộc agent đoán
ý đồ, và mỗi lần đoán là một vòng diff mới cần review lại. Muốn cắt vòng lặp
đó, lý do phải nằm cùng chỗ với code — đó là điều hai section tiếp theo mô tả
bằng code thật.

## Ghim ghi chú lên đúng dòng diff

Soạn và hiển thị là hai component trong cùng thư mục
`src/renderer/src/components/diff-comments/`. Phần soạn là
`DiffCommentPopover`: một overlay DOM cạnh editor (chủ đích của tác giả ghi
trong comment đầu file — để sở hữu textarea React tự giãn thay vì widget nội
bộ của Monaco). Placeholder và nhãn nút là mặc định của props, không phải
chữ trang trí:

```bash
# src/renderer/src/components/diff-comments/DiffCommentPopover.tsx, mặc định props
  placeholder = 'Add note for the AI',
  submitLabel = 'Add note',
```

*Nguồn: src/renderer/src/components/diff-comments/DiffCommentPopover.tsx,
dòng 42-43, tag v1.4.199, lấy 2026-09-08.*

Tiêu đề popover tính từ dòng được chọn: "Line 42", hoặc "Lines 40-42" khi
chọn một vùng (`startLine` khác `lineNumber`). Enter gửi, Shift+Enter xuống
dòng, Escape hủy; click ra ngoài chỉ đóng khi draft trống — draft có chữ thì
popover ở lại. Phần hiển thị là `DiffCommentCard`, và vị trí của nó là điểm
chính của cả cơ chế: card không mở trong panel bên mà nằm ngay trong view zone
của Monaco, tại đúng dòng được chú thích:

```bash
# src/renderer/src/components/diff-comments/DiffCommentCard.tsx, comment đầu file
// the saved-note card lives inside a Monaco view zone's DOM node.
// useDiffCommentDecorator creates a React root per zone and renders this
// component into it so we can use normal lucide icons and JSX ...
```

*Nguồn: src/renderer/src/components/diff-comments/DiffCommentCard.tsx, dòng
8-11, tag v1.4.199, lấy 2026-09-08.*

Trên card, khối quote hiển thị đoạn code mà ghi chú gắn vào — người đọc thấy
ngay ngữ cảnh không cần cuộn lên. Dòng meta ghép tác giả (mặc định "Note"),
nhãn dòng, và trạng thái "sent" nếu ghi chú đã gửi. Card cũng tự đồng bộ chiều
cao zone qua ResizeObserver để không đè lên dòng bên dưới khi chữ xuống dòng
trong pane hẹp. Một chi tiết đặt tên đáng chú ý: copy người dùng dùng chữ
"Note" thay vì "Comment" — chính tác giả ghi lý do là để không lẫn với comment
review GitHub mà một số mặt diff cũng render.

## Trên trang PR, comment GitHub gắn về dòng hiện tại

Nửa còn lại của cơ chế nằm ở trang PR. Hàm `buildInlineReviewComments` trong
`src/renderer/src/components/pull-request-page/files/inline-comments.ts` nhận
danh sách comment GitHub của một PR và trả về `DecoratedDiffComment` — loại dữ
liệu mà card hiểu được: `filePath` lấy từ `comment.path`, dòng ghim là
`comment.line`, cạnh `side: 'modified'`. Ba loại comment bị loại khỏi hàng
inline, và lý do nằm ngay trong comment code:

```bash
# src/renderer/src/components/pull-request-page/files/inline-comments.ts
// Why: outdated threads keep originalLine for the sidebar, but rendering it
// inline can attach the comment to unrelated current code.
if (comment.isOutdated || !comment.path || typeof comment.line !== 'number') {
  return []
}
```

*Nguồn: src/renderer/src/components/pull-request-page/files/inline-comments.ts,
tag v1.4.199, lấy 2026-09-08.*

Đọc kỹ dòng `Why` đó: thread outdated vẫn giữ số dòng gốc cho sidebar, nhưng
nếu render inline thì comment có thể gắn vào code hiện tại không liên quan gì
đến nó. Đây là lựa chọn đúng đắn về review: một comment gắn sai dòng tệ hơn
một comment không hiển thị — người đọc sẽ tin một ngữ cảnh sai. Các comment
GitHub này cũng là chỉ đọc: chúng được dựng với `canDelete: false` và
`canEdit: false`, còn card chỉ render nút Edit/Delete khi callback tồn tại —
không callback thì không nút; muốn sửa phải mở GitHub qua nút "Open".

## Tile-08 và vòng lặp khép về phía agent

Registry feature wall của app ghi đích ý đồ này thành một tile:

```bash
$ grep -n "Inline review" src/shared/feature-wall-tiles.ts
144:    title: 'Inline review, back to the agent',
```

*Nguồn: src/shared/feature-wall-tiles.ts, tile-08 (kind "media", owner
"diff-review"), caption nguyên văn: "Drop markdown comments on any diff line,
batch them, ship them back to the agent. Inspect CI, resolve conflicts, open
PRs - all in-app.", lấy 2026-09-08.*

Cụm "back to the agent" không phải khẩu hiệu — nó có nút thật. Trong
`diff-comment-zone-card.tsx`, hàng nút trên card nhận `headerActions` là một
`NotesSendMenu` khi ghi chú là ghi chú local (tác giả chưa xác định), với scope
"This note": định dạng ghi chú thành prompt rồi gửi về phiên agent của
worktree đang chạy. Ghi chú có `sentAt` bị loại khỏi lần gửi sau — tooltip
trạng thái là "Note already sent" — và sau khi gửi thành công,
`clearDeliveredDiffComments` dọn ghi chú đã chuyển giao khỏi diff:

```ascii
vòng review khép về phía agent

  agent sửa code
       │ diff mới
       ▼
  ghi chú ghim trên dòng diff ◄── người review soạn "Add note for the AI"
       │ nút "This note" → prompt
       ▼
  phiên agent nhận prompt → sửa theo lý do → diff mới + ghi chú mới
```

*Nguồn: dựng từ
src/renderer/src/components/diff-comments/diff-comment-zone-card.tsx
(NotesSendMenu, formatCommentPrompt, clearDeliveredDiffComments), lấy
2026-09-08.*

Khác biệt so với vòng hở ở đầu bài nằm ở một chỗ: lý do không phải được gõ lại
trong prompt mới — nó đi cùng diff, dưới dạng ghi chú ghim trên dòng, và agent
nhận đúng văn bản đó.

## Giới hạn nói thẳng

- Không có model nào xuất hiện trong các file này, và bài không gọi tên model
  nào: card không tự sửa code, không sinh patch. Nó đưa lý do về phía agent;
  việc sửa vẫn là việc của agent, và verdict vẫn thuộc về người review độc lập
  — bài [Gates, not trust — và Rule 0](/vi/blog/gates-not-trust-rule-zero/) đã
  nói vì sao không nên tin chữ ký xanh mà không mở kết quả ra xem.
- Trên trang PR, comment GitHub là chỉ đọc trong app: không Edit, không Delete,
  chỉ nút "Open" dẫn về GitHub.
- Thread outdated không render inline — giữ ở sidebar; phạm vi inline chỉ là
  comment gắn được về dòng hiện tại của code.
- Phạm vi bài này là tầng component đã đọc: card, popover, hàm dựng inline
  comment trên trang PR, và tile registry. Trạng thái gửi nằm ở store slice
  `diffComments` (kiểu `DiffCommentDeliverySnapshot`) — bài không đi sâu hơn.

Câu hỏi về vòng review, gates và các cơ chế qa khác gom ở trang
[FAQ](/vi/docs/faq/).

Muốn tự thấy vòng lặp: mở một diff trong Wakii, bấm vào một dòng, gõ ghi chú
cho AI, bấm "This note" — và đọc phần agent nhận lại lý do của bạn ngay trong
phiên đang chạy.
