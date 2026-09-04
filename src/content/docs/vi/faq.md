---
title: FAQ
description: Wakii là gì, khác gì so với Orca upstream, cần gì để build, và Superpowers panel nằm ở đâu.
order: 4
---

### Wakii là gì?

Wakii là một agentic IDE — môi trường desktop nơi một đội AI agent lập
kế hoạch, build, review, và verify phần mềm song song, dưới các gate nghiêm
ngặt. Wakii là fork của [Orca](https://github.com/stablyai/orca) (MIT) với
superpowers workflow kit bundle sẵn bên trên.

### Khác gì so với Orca upstream?

Orca cho bạn parallel agentic development workspaces và orchestration.
Wakii thêm vào **story workflow**: impact analysis trước khi code, spec và
plan publish lên Linear, đội 9 agent với các review gate adversarial,
watchdog tự resume sub-feature bị stall, và một PR sạch cho mỗi story.

### Cần gì để build từ source?

Node 24 và pnpm 12, cộng git. Sau đó chỉ là `pnpm install` và `pnpm dev` —
walkthrough đầy đủ nằm ở [Bắt đầu](/vi/docs/getting-started/).

### Superpowers panel ở đâu?

Trong app, bấm icon ⚡ ở activity bar bên phải cửa sổ. Nếu sidebar đang
ẩn, `Cmd/Ctrl + L` để bật. Panel đi kèm bundled và bật sẵn mặc định —
không cần cài. Chi tiết ở [Superpowers panel](/vi/docs/superpowers-panel/).

### Có cần cấu hình gì trước run đầu tiên không?

Không. Workflow kit — skills, định nghĩa agent, và các công cụ dòng lệnh
`story-*` — tự cài vào `~/.claude/` ở lần đầu app chạy, và giữ đồng bộ từ
đó về sau.

### Tài liệu có tiếng Việt không?

Có — dùng bộ chuyển **EN | VI** trong phần điều hướng docs. Mọi trang đều
có cả hai ngôn ngữ.

### Giấy phép là gì?

Wakii theo giấy phép MIT, tương tự superpowers kit bundle sẵn của Jesse
Vincent ([obra/superpowers](https://github.com/obra/superpowers)). Orca
upstream cũng là MIT — credit nằm ở footer của site.
