# ADOPT draft — notification focus-aware (từ charmbracelet/crush)

> Draft SF-3/FI-386 — SF-6 file issue TẬP TRUNG sau review (style-guide §10).
> Label đề xuất: `enhancement` trên `wakii-dev/wakii`. KHÔNG file issue từ SF.

## 1. Pattern

Chỉ gửi desktop notification khi cửa sổ ứng dụng KHÔNG còn focus — notification
là cách gọi người trở lại, không phải xác nhận cho người đang nhìn màn hình.
Học từ `charmbracelet/crush` (27.953 sao; GitHub API trả license NOASSERTION —
file LICENSE.md khai báo FSL-1.1-MIT — tại ngày probe 2026-09-08).

## 2. Evidence inline

README của crush, theo GitHub API ngày 2026-09-08:

> "Crush sends desktop notifications when a tool call requires permission and
> when the agent finishes its turn."

Và câu liền sau (cùng nguồn):

> "They're only sent when the terminal window isn't focused _and_ your terminal
> supports reporting the focus state."

Cấu hình: `option notifications` nhận `auto | native | osc | bell | disabled`;
`auto` dùng native notification khi chạy local và OSC notification qua SSH.
Cả hai đoạn trên được trích NGAY TRONG issue này — issue tự đứng được nếu link
chết (rubric §10 mục 2).

## 3. Đề xuất Wakii

- **Surface:** notification routing của Wakii đã ship cho gate-open/gate-closed
  với đủ routing fields và tap-to-navigate (feature-notification-keyboard,
  nhãn SHIPPED trong claims-registry). Bổ sung điều kiện **focus-state phía
  desktop**: khi cửa sổ Wakii đang focus, gate-closed không cần toast — panel
  tự cập nhật; chỉ gửi notification khi user rời cửa sổ.
- **Hành vi kỳ vọng:** giảm noise cho người canh panel trực tiếp (agent xong
  turn, gate đóng liên tục khi story chạy dồn); giữ nguyên toàn bộ notification
  trên mobile — mobile không có khái niệm focus tương đương, luôn gửi.
- **Rủi ro chính:** focus reporting phụ thuộc OS/window manager — cần fallback
  "gửi luôn" khi không đọc được trạng thái focus; và sai số focus (app focus
  nhưng user nhìn màn hình khác) — chấp nhận được vì chi phí thấp hơn spam.
- **Khác biệt tên gọi:** crush nói "terminal window isn't focused"; Wakii là
  desktop app — tương đương "app window unfocused", không cần terminal.

## 4. Upstream links

- Repo: https://github.com/charmbracelet/crush
- README, mục Desktop notifications:
  https://github.com/charmbracelet/crush#desktop-notifications
- Blob pin HEAD tại ngày probe 2026-09-08:
  https://github.com/charmbracelet/crush/blob/563d658bccb56019edc1136c3c262ba0a81ccc99/README.md
- Bài deep-dive sẽ live tại `/blog/deep-dive-charmbracelet-crush/` (EN) và
  `/vi/blog/deep-dive-charmbracelet-crush/` (VI) sau khi story FI-383 merge
  (build-in-public đã được user duyệt 2026-09-07).
