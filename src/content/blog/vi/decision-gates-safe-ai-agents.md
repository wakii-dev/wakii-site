---
title: "Decision gates: vì sao AI agents của Wakii luôn dừng hỏi"
description: "Bên trong decision gates: pending guard chặn resolve sai với mã lỗi rõ ràng, notification báo gate-open và gate-closed, và vì sao supervised vẫn thắng autonomous."
pubDate: "2026-09-03"
category: "tech"
tags: ["gates", "guardrails", "supervised"]
draft: false
---

Câu hỏi chúng tôi nghe nhiều nhất: "Sao không để agent tự chạy hết luôn cho nhanh?" Câu trả lời của Wakii: agent tự chạy hết phần việc — nhưng những quyết định có hệ quả thì dừng ở gate. Bài này mổ xẻ cơ chế đứng sau chữ "dừng" đó.

## Gate là gì

Decision gate là điểm dừng có cấu trúc giữa agent và con người, không phải một cú interrupt ngẫu nhiên. Một gate gồm: ngữ cảnh gọn (agent đang ở đâu, vì sao cần quyết), câu hỏi cụ thể, và các phương án chọn sẵn — hoặc ô free-text khi không phương án nào khớp. Gate pending thì story đứng đúng tại đó; agent không tự đoán, không tự đi tiếp.

## Pending guard: không ai resolve hai lần

Mọi lệnh resolve đi qua một lớp guard trước khi chạm vào state của story:

- `gate_not_pending` — gate không ở trạng thái chờ (đã resolve rồi, hoặc đã đóng): lệnh bị từ chối thay vì áp đặt trùng.
- `gate_not_found` — id gate không tồn tại: trả lỗi ngay, không âm thầm no-op.
- `invalid_resolution` — câu trả lời sai định dạng hoặc không nằm trong các phương án hợp lệ: agent được yêu cầu gửi lại đúng dạng.

Nguyên tắc chung: lỗi phải ồn ào. Một resolve thất bại mà im lặng thì agent sẽ tin mình đã có quyết định — nguy hiểm hơn nhiều so với việc dừng lại hỏi lại.

## Notification: gate-open và gate-closed

Cửa gate mở, bạn nhận notification; cửa đóng, bạn cũng nhận. Không cần poll, không cần F5: story progress cập nhật đúng tại thời điểm hệ thống đổi trạng thái. Kết hợp với bản mobile, vòng lặp trở thành: notification → đọc ngữ cảnh → resolve → notification xác nhận. Ba mươi giây, không rời điện thoại.

## Supervised vẫn thắng autonomous

Agent autonomous trông ấn tượng trong demo và tốn kém trong production: một quyết định sai ở bước 3 được nhân lên ở bước 30. Supervised đảo lại phép tính: agent giỏi phần làm, con người giữ phần chịu trách nhiệm — và chi phí duyệt ba mươi giây ở gate rẻ hơn debug ba mươi phút sau merge.

Trong thực tế chạy story workflow, gate không trải dày: chúng chỉ xuất hiện ở các ngã rẽ thật. Phần lớn thời gian agent tự chạy — đó chính là ý của supervised.

Cấu hình và vị trí gates trong giao diện nằm ở [Superpowers panel docs](/docs/superpowers-panel/); triết lý đầy đủ của workflow nằm trong [story workflow docs](/docs/story-workflow/).
