---
title: "code-server: VS Code trên server từ xa"
description: "Bóc kiến trúc code-server — VS Code vendored thành submodule, HTTP và WebSocket tách kênh, heartbeat file cho liveness — và bài học editor chạy cạnh worktree."
pubDate: "2026-10-19"
category: "tech"
tags: ["architecture", "worktree", "oss"]
draft: false
---

Một repo nằm trên máy công ty, một trên VPS, một trên laptop cá nhân — cách làm quen thuộc là kéo code về từng máy, dựng lại môi trường ở mỗi nơi, rồi hy sinh cuối tuần cho lệch phiên bản. code-server của Coder chọn chiều ngược lại: code đứng yên trên server, còn VS Code được đưa tới trình duyệt. Với 79.234 sao, 6.844 fork và license MIT (theo GitHub API ngày 2026-09-08), đây không phải dự án experiment — và kiến trúc của nó đáng đọc hơn cả con số sao.

## TL;DR

- code-server bọc VS Code thành web service: trình duyệt chỉ là màn hình, phần nặng chạy trên server nơi code sống.
- VS Code được vendor nguyên khối bằng git submodule, cộng một lớp patch `.diff` có tên — mỗi patch một concern.
- Lớp server TypeScript mỏng: HTTP trả UI, WebSocket mang protocol, một file heartbeat báo liveness.
- Release mỗi tuần một minor: v4.131 → v4.135 chỉ trong bốn tuần (theo GitHub API ngày 2026-09-08).
- Bài học cho Wakii: delta fork nhỏ và có tên để sync upstream rẻ; editor chạy cạnh worktree là một hướng đi tự nhiên.

## Đảo chiều editor: code đứng yên, editor di chuyển

Mô hình quen thuộc đặt editor trên máy bạn và kéo code về. Đổi máy là dựng lại môi trường; máy yếu là chịu chậm khi biên dịch. code-server đảo chiều đó: repo nằm trên server, editor cũng nằm trên server, trình duyệt chỉ nhận giao diện và gửi thao tác. README của repo gọi gọn: "Run VS Code on any machine anywhere and access it in the browser" ([coder/code-server README](https://github.com/coder/code-server#readme), truy cập 2026-09-08).

Yêu cầu phần cứng trong README xác nhận mô hình: một máy Linux bật WebSocket, 1 GB RAM và 2 vCPU là đủ chạy — vì việc nặng như biên dịch, chạy test, tải dependency xảy ra phía server, trình duyệt chỉ render. Đó là lý do một laptop mỏng có thể làm việc với codebase lớn như thể nó đứng cạnh server.

```
trình duyệt (bất kỳ)          server nơi code sống
┌───────────────────┐        ┌───────────────────────────────┐
│ UI shell VS Code  │◄──HTTP──│ express router → UI tĩnh      │
│ WebSocket client  │◄──WS───►│ wsRouter → protocol editor    │
└───────────────────┘        │ extension + filesystem + shell │
                             └───────────────────────────────┘
```

Hai kênh không trộn nhau: HTTP một chiều trả phần tĩnh, WebSocket kênh thời gian thực mang thao tác đi và kéo render về. Filesystem và terminal mà bạn thao tác là của server — chính xác nơi worktree nằm.

## Bên trong: hai router và một file heartbeat

Lớp server của code-server là TypeScript mỏng bọc quanh VS Code. Điểm vào `src/node/app.ts` khai rõ hai kênh bằng interface `App`:

```ts
export interface App extends Disposable {
  /** Handles regular HTTP requests. */
  router: Express
  /** Handles websocket requests. */
  wsRouter: Express
  /** The underlying HTTP server. */
  server: http.Server
  /** Handles requests to the editor session management API. */
  editorSessionManagerServer: http.Server
}
```

(nguồn: [src/node/app.ts @ commit 62284ed](https://github.com/coder/code-server/blob/62284ed549bc41236d62c789a071120aea206a78/src/node/app.ts), probe 2026-09-08)

Câu hỏi còn lại của một service dài hạn là biết phiên còn sống hay đã chết. code-server trả lời bằng một file heartbeat. Class `Heart` trong `src/node/heart.ts` có comment nguyên văn: "Provides a heartbeat using a local file to indicate activity" ([src/node/heart.ts @ commit 62284ed](https://github.com/coder/code-server/blob/62284ed549bc41236d62c789a071120aea206a78/src/node/heart.ts)). Mỗi 60.000 ms một nhịp được ghi ra file; trạng thái đi qua ba nấc `alive | expired | unknown`; bất kỳ tiến trình ngoài nào — supervisor, script dọn dẹp — chỉ cần đọc file là biết phiên còn hoạt động, không cần bắn probe vào service.

## Vendoring VS Code: submodule cộng lớp patch có tên

VS Code không có chế độ nhúng chính thức cho việc này. code-server chọn vendor nguyên khối: `.gitmodules` khai báo submodule `lib/vscode` trỏ thẳng `https://github.com/microsoft/vscode`. Trên nền đó, thư mục `patches/` chứa các `.diff` được đặt tên theo concern — đọc tên file là biết nó sửa gì:

| patch | concern |
|---|---|
| `app-name.diff` | đổi tên hiển thị |
| `base-path.diff` | chạy dưới sub-path |
| `keepalive.diff` | giữ kết nối dài |
| `csp-hashes.diff` | cho phép script theo CSP |
| `disable-builtin-ext-update.diff` | chặn extension tự cập nhật |

(nguồn: [thư mục patches @ commit 62284ed](https://github.com/coder/code-server/blob/62284ed549bc41236d62c789a071120aea206a78/patches), probe 2026-09-08 — còn ít nhất 10 file khác cùng kiểu)

Mỗi patch một concern, không patch nào ôm nhiều việc. Khi upstream phát phiên bản mới, công việc sync là re-apply từng diff lên code mới: xung đột bị khoanh vùng ngay tại patch nào đụng API nào, thay vì khảo cổ cả một nhánh sửa đổi. Đây là cơ chế sống của một distribution bám upstream phát hành dồn dập.

## Nhịp release tuần và cái giá của lớp patch

Năm release gần nhất (theo GitHub API ngày 2026-09-08): v4.135.0 ngày 27-08, v4.134.0 ngày 24-08, v4.133.0 ngày 17-08, v4.132.0 ngày 10-08, v4.131.0 ngày 30-07 — khoảng cách 3 đến 11 ngày, trung bình gần đúng một tuần một minor. Repo có push mới nhất ngày 06-09-2026.

Nhịp tuần chỉ khả thi vì lớp patch nhỏ và có tên. Nếu delta fork là một khối sửa lớn vô danh, mỗi upstream sync sẽ là một dự án; khi delta được chia nhỏ thành các diff độc lập, sync thành dây chuyền: apply, build, chạy test, lặp. Sự tương phản đáng nhớ: sao tăng đều là hệ quả, còn kiến trúc delta mới là nguyên nhân.

Wakii cũng đi theo hướng tách môi trường khỏi máy cá nhân: mỗi SF trong story chạy trong worktree riêng, agent làm việc trên nhánh của nó, merge qua gate — quy trình được mô tả trong [docs story-workflow](/vi/docs/story-workflow/) và chi tiết isolation trong bài [worktree song song để cô lập thay đổi](/vi/blog/parallel-worktrees-isolation/). code-server bổ sung nửa còn lại của bức tranh: phần editor cũng có thể trỏ tới host nơi worktree sống.

## Wakii học được gì

- **ADOPT** — kỷ luật "một concern một patch có tên": lớp `patches/` của code-server cho thấy delta fork giữ được giá rẻ khi từng mảnh nhỏ, có tên tự tả và độc lập nhau. Wakii là fork của Orca; đề xuất cụ thể: duy trì một inventory delta fork theo concern (tên + lý do + file đụng) trong repo, dùng làm checklist re-validate từng mục mỗi lần sync upstream — thay vì đối chiếu cả đống commit lẫn lộn.
- **DIRECTION** — editor chạy cạnh worktree: Wakii đã có SSH worktrees (desktop) và story view trên mobile; mô hình code-server gợi ý bước đủ: IDE trỏ thẳng vào host nơi worktree và agent đang sống. Chưa làm ngay vì đây là thay đổi surface lớn, cần decision riêng.
- **WATCH** — heartbeat file cho liveness: một marker file ghi nhịp 60s rẻ hơn việc poll nhiều nguồn; watchdog của Wakii hiện kiểm ba lớp (commits gần đây, terminal output, trạng thái Linear). Xem lại pattern này khi session agent chạy trên remote host, nơi poll terminal trở nên đắt.

Wakii là agentic IDE với một đội agent có sẵn, cài xong là chạy — nếu bạn muốn xem đội đó chia việc ra sao, [docs agents-and-kit](/vi/docs/agents-and-kit/) là điểm bắt đầu tốt.
