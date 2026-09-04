---
title: Bắt đầu
description: Build Wakii từ source và gặp đội agent của bạn — từ clone đến panel ⚡ Superpowers trong vài phút.
order: 0
---

Wakii là ứng dụng desktop. Hướng dẫn này đưa bạn từ một thư mục trống đến
app đang chạy với **Superpowers panel** mở — không cần cấu hình gì trên
đường đi. Mỗi bước dưới đây đều đã được thực thi nguyên văn trên một
checkout sạch trước khi viết vào docs.

## Yêu cầu trước

- **Node.js 24** — [nodejs.org](https://nodejs.org) hoặc version manager bạn dùng
- **pnpm 12** — `corepack enable` có sẵn, hoặc `npm install -g pnpm`
- **git**

Kiểm tra version:

```bash
node --version   # v24.x
pnpm --version   # 12.x
```

## 1. Lấy source

Clone repository và vào thư mục:

```bash
git clone <repo-url> wakii
cd wakii
```

URL repo là link **github** ở [footer của site](/vi/) — trỏ đến fork
Wakii trên GitHub.

## 2. Cài dependencies

```bash
pnpm install
```

Lệnh này tải JavaScript dependencies và build các native module cho máy
bạn (terminal emulation, file watching). Lần đầu chạy mất vài phút; các
lần sau nhanh hơn nhiều.

## 3. Chạy app

Hai lựa chọn:

```bash
pnpm dev         # development — hot reload, cách nhanh nhất để nhìn quanh
```

hoặc bản production:

```bash
pnpm build       # compile app + các phần native
pnpm start       # khởi chạy desktop app đã build
```

Cửa sổ Wakii mở ra.

## 4. Mở Superpowers panel

Trong **activity bar ở bên phải cửa sổ**, bấm vào icon **⚡ (zap)**. Đó là
Superpowers panel — trung tâm điều khiển đội agent của bạn, đi kèm sẵn
trong app và bật mặc định.

Nếu right sidebar đang bị ẩn, `Cmd/Ctrl + L` để bật lại.

Bạn sẽ thấy đúng hai tab:

- **⚡ Workflow** — khởi chạy một run: chọn intent, tinh chỉnh modes, và
  start coding agent với prompt đã được lắp sẵn.
- **🌳 Story** — theo dõi feature lớn dưới dạng story: bracket canvas,
  Story Ops gates, và watchdog.

## 5. Lần chạy đầu — không cần setup gì

Thật ra không có bước 5. Lần launch đầu tiên, workflow kit — các skills,
định nghĩa agent, và công cụ dòng lệnh `story-*` — tự cài vào `~/.claude/`.
Kit tự đồng bộ với app và không bao giờ ghi đè config local của bạn.

Đi tiếp đâu?

- [Superpowers panel](/vi/docs/superpowers-panel/) — từng tab và toggle dùng thế nào
- [Story workflow](/vi/docs/story-workflow/) — pipeline đầy đủ từ idea đến PR
- [Agents & kit](/vi/docs/agents-and-kit/) — gặp 9 chuyên gia
