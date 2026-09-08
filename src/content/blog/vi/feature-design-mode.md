---
title: "Design mode: trỏ vào UI, agent nhận ngay ngữ cảnh"
description: "Bật Design Mode trong browser của Wakii, click đúng element UI đang lỗi, và DOM, computed CSS, screenshot — kể cả dòng file nguồn nếu có source map — đổ thẳng vào chat của agent."
pubDate: "2026-09-16"
category: "tech"
tags: ["features", "design"]
draft: false
---

Bạn nhìn thấy nút bị lệch. Agent đọc code. Giữa hai người là một khoảng trống:
bạn mô tả bằng lời — "cái nút kia bị lệch xuống một chút" — và agent phải tự
đoán element nào, lệch về đâu, do margin hay do flexbox. Mỗi lần chuyển từ pixel
sang lời nói là một lần mất thông tin, và phần bị mất bao nhiêu thì agent tự bù
bằng phỏng đoán. Design Mode của browser Wakii tồn tại để rút ngắn đúng khoảng
trống đó: trỏ vào UI, agent nhận ngay ngữ cảnh.

TL;DR:

- Vấn đề: mô tả UI bằng lời là kênh truyền có nhiễu — element nào, lệch ra sao,
  agent phải đoán từ đầu.
- Design Mode biến browser thành công cụ pointer-to-code: click một element, nó
  rơi vào chat của agent kèm DOM, computed styles và một screenshot.
- Bật bằng một toggle trong browser toolbar — con trỏ biến thành picker, hover
  đến đâu highlight đến đó.
- Giới hạn nói thẳng: dòng file nguồn chỉ có khi dev-mode source map có sẵn;
  đây là công cụ capture ngữ cảnh, không phải visual editor.
- Vòng lặp khép về phía UI: agent sửa source, Orca hot-reload, bạn click lại để
  kiểm chứng.

## Nói bằng mắt, agent nghe bằng gì?

Vấn đề nằm ở kênh truyền, không nằm ở ai cả. Mắt bạn nhận pixel; agent nhận
code. Cầu nối giữa hai đầu thường là một câu mô tả bằng lời — và lời nói là
định dạng có tổn thất:

```ascii
kênh mô tả bằng lời — mỗi mũi tên một lần mất thông tin

  mắt bạn               lời nói                  agent
  nhìn thấy nút  ───►   "cái nút kia   ───►   element nào trong
  Submit lệch           bị lệch xuống         14 nút trên trang?
  xuống một chút        một chút"             lệch bao nhiêu pixel?
                                              do margin hay do flex?
```

*Nguồn: sơ đồ khái niệm minh họa tình huống mà Design Mode trong browser Wakii
sinh ra để xử lý, lấy 2026-09-08.*

Trên một trang thật, "cái nút kia" có thể là một trong chục nút; "lệch một
chút" có thể là 4px hoặc 40px; nguyên nhân có thể nằm ở chính element đó hoặc ở
cha của nó. Agent không có dữ liệu nào để phân biệt — nên nó hỏi lại, hoặc tệ
hơn, đoán rồi sửa nhầm chỗ. Chi phí không nằm ở câu hỏi, mà ở vòng lặp: mỗi
vòng hỏi–đáp, phiên làm việc lại dừng chờ bạn dịch lại cái mình nhìn thấy sang
ngôn ngữ agent đọc được.

## Click một cái, ngữ cảnh đổ vào chat

Design Mode bỏ hẳn bước mô tả. Câu định nghĩa trong docs của tính năng, trích
nguyên văn:

> "Design Mode turns the Orca browser into a pointer-to-code tool. Toggle it
> on, click any UI element on the rendered page, and the element drops into the
> agent chat as rich context — with its DOM, computed styles, and a screenshot."

Bản dịch: Design Mode biến browser thành một công cụ pointer-to-code. Bật lên,
click vào bất kỳ element UI nào trên trang đang render, element đó rơi vào chat
của agent dưới dạng rich context — kèm DOM, computed styles và một screenshot.

Cái gì thực sự nằm trong "rich context" đó? Docs liệt kê đủ bốn mục:

```bash
Click an element. Orca captures:

- The element's HTML (outer and a small neighborhood).
- Its computed CSS — colors, fonts, spacing.
- A cropped screenshot of the element.
- The source file/line if a dev-mode source map is available.
```

*Nguồn: docs/site/content/docs/browser/design-mode.mdx, mục "Drop into chat",
trích nguyên văn, lấy 2026-09-08.*

Đọc theo thứ tự và thấy một đường đi từ pixel về nguồn: HTML outer cùng lân cận
cho agent biết element là gì và nó đứng cạnh gì; computed CSS — màu, font,
spacing — là giá trị đã tính xong sau cascading, đúng thứ đang hiển thị chứ
không phải thứ viết trong file; screenshot crop cho agent thấy đúng thứ bạn đang
thấy; còn dòng cuối — file nguồn — là mục có điều kiện, nói kỹ ở section sau.
Tất cả đi vào terminal của agent như một attachment, và bạn chỉ cần gõ muốn sửa
gì.

```ascii
một click → một attachment trong chat agent

  rendered page                        agent chat
  ┌───────────────────┐
  │  [ Submit ] ◄─click     ┌────────────────────────────────┐
  └───────────────────┘     │ attachment:                    │
        │                   │  • HTML (outer + lân cận)      │
        ▼                   │  • computed CSS: màu, font,    │
     capture                │    spacing                     │
        │                   │  • screenshot (crop element)   │
        └──────────────────►│  • file:line — nếu có          │
                            │    dev-mode source map         │
                            └────────────────────────────────┘
```

*Nguồn: dựng từ danh sách capture trong
docs/site/content/docs/browser/design-mode.mdx, lấy 2026-09-08.*

## Bật bằng một toggle

Không có lệnh cấu hình nào phải nhớ. Docs viết, trích nguyên văn: "Click the
**Design Mode** toggle in the browser toolbar. Your cursor becomes a picker;
hovering highlights the element under it." — Click toggle Design Mode trong
browser toolbar; con trỏ biến thành picker; hover đến đâu, element dưới con trỏ
được highlight đến đó. Đây là chế độ chọn, không phải chế độ vẽ: bạn vẫn nhìn
trang thật; mỗi element giờ có thể được "cầm" lên và đưa vào chat.

```ascii
toolbar:  [ Design Mode ○ ] ──click──►  [ Design Mode ● ]
cursor:   thường          ──────────►  picker
hover:                    ──────────►  element dưới con trỏ highlight
click:                    ──────────►  ngữ cảnh element → chat agent
```

*Nguồn: dựng từ docs/site/content/docs/browser/design-mode.mdx, mục "Turn it
on" và "Drop into chat", lấy 2026-09-08.*

## Giới hạn nói thẳng

Hai giới hạn cần đọc trước khi dùng — cả hai nằm ngay trong docs, không phải
phán đoán.

Một: dòng file nguồn là mục có điều kiện. Bullet thứ tư trong danh sách capture
viết nguyên văn "The source file/line if a dev-mode source map is available" —
chỉ khi dev-mode source map có sẵn. Không có source map, bạn vẫn nhận DOM,
computed CSS và screenshot — đủ để agent hiểu element đang render ra sao — nhưng
không có tọa độ file:line để nhảy thẳng vào nguồn. Hai: đây là pointer-to-code,
không phải visual editor. Bạn không kéo–thả để sửa UI ngay trong browser; bạn
capture ngữ cảnh một element rồi mô tả thay đổi bằng chữ, phần sửa nằm ở source
và do agent làm. Khoảng giữa — từ ngữ cảnh đến thay đổi — vẫn là một lượt chat,
nhưng lượt chat đó giờ đã có đủ dữ liệu.

```ascii
cái gì có ngay, cái gì có điều kiện — sau MỘT click

  HTML (outer + lân cận)    ──►  trong danh sách capture
  computed CSS
  (màu, font, spacing)      ──►  trong danh sách capture
  cropped screenshot        ──►  trong danh sách capture
  file:line của source      ──►  chỉ khi dev-mode source map có sẵn
```

*Nguồn: đọc trực tiếp bốn bullet trong
docs/site/content/docs/browser/design-mode.mdx, mục "Drop into chat", lấy
2026-09-08.*

Điều đáng nói là vòng lặp khép lại về phía UI. Docs viết: "The agent edits the
source, Orca hot-reloads, you click again to verify" — agent sửa source, Orca
hot-reload, bạn click lại để kiểm chứng. Người nhìn UI vẫn là người nghiệm thu
bằng mắt, nhưng lần này bằng một cú click của Design Mode thay vì một câu mô
tả.

## Dấu vết trong sản phẩm

Tính năng này không phải ý tưởng trên giấy — nó có dấu vết kiểm chứng được trong
repo nguồn mở:

```bash
$ grep -n "Design Mode" src/shared/feature-wall-tiles.ts
108:    title: 'Embedded browser + Design Mode',

$ git show 216cabb9f0 --stat
update readme to include new browser design mode feature (#463)
 README.md            |  35 +++++++++++++++++++++++------------
 orca-design-mode.gif | Bin 0 -> 2052927 bytes
 2 files changed, 23 insertions(+), 12 deletions(-)
```

*Nguồn: `grep` trên src/shared/feature-wall-tiles.ts và `git show` trên repo
nguồn mở, lấy 2026-09-08.*

Đọc hai khối: dòng grep là tile "Embedded browser + Design Mode" trên feature
wall — đúng chỗ một người dùng mới gặp tính năng này lần đầu; khối git show là
commit #463 đưa Design Mode vào README kèm một file GIF minh họa. Còn trang docs
riêng của tính năng — nơi cả bốn trích dẫn trong bài này đến từ — nằm tại
docs/site/content/docs/browser/design-mode.mdx.

Vòng kể trên — nhìn bằng mắt, trỏ bằng picker, sửa trong source, nghiệm bằng mắt
— là một hình dạng của câu chuyện lớn hơn: chuyển từ "người chụp màn hình rồi
nói lại" sang "người chỉ tay, agent nhìn theo". Bài
[convergence QA: tầng kiểm cuối](/vi/blog/convergence-qa-last-tier/) viết về đầu
kia của dây chuyền — chỗ nhiều nhánh làm việc song song được kiểm trước khi
gộp; bài này viết về đầu vào — chỗ một element trên màn hình trở thành ngữ cảnh
có thể hành động. Cách Wakii tổ chức vòng đời agent — từ một dòng ý tưởng đến
sản phẩm đã ship — nằm ở trang [FAQ](/vi/docs/faq/).

Muốn tự thấy: mở browser trong Wakii, bật toggle Design Mode trên toolbar, click
đúng cái nút bạn đang định mô tả bằng lời — rồi đọc xem agent nhận được bao
nhiêu so với một câu "nó bị lệch".
