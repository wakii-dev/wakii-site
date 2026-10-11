---
title: Design mode
description: Bấm vào bất kỳ element nào trong cửa sổ Chromium thật để gửi HTML, CSS, và screenshot Crop thẳng vào prompt của agent.
order: 12
---

**Design mode** mở cửa sổ Chromium thật trong Wakii. Bấm vào bất kỳ element
nào trên trang, Wakii capture HTML, computed CSS, và một screenshot crop —
rồi đưa cả ba vào prompt của agent kèm chú thích của bạn.

## Vì sao hơn screenshot

Screenshot chỉ cho thấy trang *trông như thế nào*. Design mode đưa cho agent
**trang *được làm từ gì*** — class name chính xác, computed style, cấu trúc
DOM — để agent sửa đúng component thay vì đoán.

## Dùng design mode

1. Mở pane **Browser** và điều hướng tới app của bạn.
2. Bật **Design mode** (icon đũa thần hoặc `Ctrl+Shift+D`).
3. Bấm element cần sửa — nó highlight.
4. Gõ yêu cầu: *"cho card này dùng dark theme tokens"*.
5. Gửi — agent nhận HTML, CSS, screenshot của element kèm instruction.

## Mẹo

- Kết hợp **Annotate AI diffs** — bấm trong design mode, rồi comment trên
  diff sinh ra.
- Hoạt động với `localhost` dev server lẫn URL deployed.
- Agent nhìn thấy cùng trang với bạn — hết cảnh "máy tôi chạy được".
