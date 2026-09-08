---
title: "OpenBot: chat bot mã mẫu của CopilotKit — mọi hành động qua một cổng"
description: "CopilotKit thả OpenBot — template AI coworker chạy trên máy bạn: mỗi bot một máy riêng, mọi hành động đi qua một gateway chặn trước và ghi sau. Bài này mổ xẻ gateway, take-the-wheel và generative UI để học cách nhúng agent."
pubDate: "2026-10-24"
category: "tech"
tags: ["agents", "gates", "supervised", "evidence"]
draft: false
---

CopilotKit nổi tiếng với bộ công cụ nhúng copilot UI vào app React. Nhưng OpenBot — repo họ công khai từ ngày 17-08-2026 — không phải một framework nữa. Đây là một template hoàn chỉnh: một đội "AI coworker", mỗi con có máy tính riêng, chạy trên hạ tầng của bạn, và — điều đáng đọc nhất — không một hành động nào tới được máy đó nếu không đi qua một gateway duy nhất quyết định và ghi lại. Với đội xây Wakii, giá trị của repo này không nằm ở chat bot mẫu, mà ở cách nó chặn tay agent.

## TL;DR

- OpenBot là template open-source giấy phép MIT, 4.453 sao theo GitHub API ngày 2026-09-08 — badge Alpha, chưa 1 tháng tuổi tính từ commit đầu, chủ đích để bạn clone về sửa chứ không phải sản phẩm vận hành hộ.
- Mọi hành động browser/file/shell của bot đi qua một gateway duy nhất: resolve đích từ snapshot phía server, hỏi policy (deny thắng allow), ghi audit row rồi mới act. Thiếu policy thì không được phép gì cả.
- Take the wheel: bot kẹt login wall hay 2FA thì người cầm lái thay, toàn bộ bàn giao được ghi event; trong lúc người điều khiển, hành động của bot bị từ chối chứ không xếp hàng.
- Agent trả lời bằng component React được duyệt trước thay vì văn xuôi tự do — mỗi lần render phải hỏi server component đó có tồn tại, đã publish và không bị tước quyền với bot này.

## Template, không phải sản phẩm — và sao điều đó quan trọng

Mô tả repo trên GitHub gọi OpenBot là "Open-source AI coworkers that each get a computer of their own" ([mô tả repo](https://github.com/CopilotKit/OpenBot)) — một đội đồng nghiệp AI, mỗi con một máy. Nhưng đọc README thì câu định vị rõ nhất là "A template, not a product" ([README](https://github.com/CopilotKit/OpenBot#readme)): không có bản hosted để đăng ký, không có package nào để `npm install`, mọi workspace trong repo đều là private. Bạn lấy repo, thay tenant package mẫu trong `examples/` bằng coworker, channel và skill của mình, rồi tự chạy.

Điểm kỹ thuật đáng chú ý: một "bot" chỉ là bất kỳ endpoint nào nói [AG-UI](https://github.com/ag-ui-protocol/ag-ui) — protocol mở cho tương tác agent-người-dùng. Bot viết bằng LangGraph, Mastra, CrewAI, Pydantic AI, Google ADK hay thuần tay đều vào theo cùng một cách, và phần governance bám vào protocol chứ không bám vào framework. Ba coworker mẫu (General Assistant, Knowledge, Risk Analyst) là cấu hình trong `agents.yaml`, không phải code.

| Chỉ số | Giá trị |
| --- | --- |
| Sao / fork | 4.453 / 549 — theo GitHub API ngày 2026-09-08 |
| License | MIT |
| Tạo / đẩy code gần nhất | 2026-08-17 / 2026-09-07 |
| Release gần nhất | v0.0.8 ngày 2026-09-06 |
| Ngôn ngữ | TypeScript (Bun + Hono + React/Vite + PostgreSQL/pgvector) |

Năm release đầu tiên (v0.0.4 đến v0.0.8) dồn trong ba tuần, và 10 commit gần nhất mà chúng tôi probe ngày 2026-09-08 đều trong một ngày — 06-09. Đây là repo đang chạy nhanh và thô; badge Alpha của chính repo cảnh báo "expect rough edges" ([README](https://github.com/CopilotKit/OpenBot#readme)). Cứ đọc nó như bản thiết kế, đừng đóng gói vào production.

## Mọi hành động đi qua một cổng duy nhất

Trái tim của OpenBot là `server/src/computer/gateway.ts`, tự giới thiệu: "The only way an action reaches a Bot's computer." ([`gateway.ts` @ `2e1b352`](https://github.com/CopilotKit/OpenBot/blob/2e1b352e9a0e7be6235d641b787aab8da10b64db/server/src/computer/gateway.ts)) Gateway làm ba việc, đúng thứ tự. Một: resolve cái ref caller gửi thành element nó thực sự trỏ tới, dựa trên snapshot mà server tự fetch — không bao giờ dựa vào label mà model nói nó đang click. Hai: hỏi policy — deny được đánh giá trước allow, thiếu policy thì không có gì được phép, rule hỏng thì từ chối chứ không mở. Ba: ghi audit row theo đúng quyết định đã ra, rồi mới act.

Chính comment đầu file nêu rõ vì sao bước resolve là thứ dễ bỏ qua mà bỏ qua là chết:

```text
A gateway that decides on a label supplied by the model is theatre:
'never click Submit' is evaded by sending {ref: "e13", name: "Continue"}.
The refs are opaque to the caller precisely so that the server holds
the mapping.
```

— `server/src/computer/gateway.ts`, [blob @ `2e1b352`](https://github.com/CopilotKit/OpenBot/blob/2e1b352e9a0e7be6235d641b787aab8da10b64db/server/src/computer/gateway.ts) (probe 2026-09-08)

Tức là rule "không bấm nút Submit" của bạn vô nghĩa nếu model được tự khai nó bấm cái gì. OpenBot giữ refs mờ đục với caller đúng để ánh xạ nằm ở server. Cùng comment đầu file, câu sau còn đắt hơn: "an action that was not recorded did not happen" ([cùng file](https://github.com/CopilotKit/OpenBot/blob/2e1b352e9a0e7be6235d641b787aab8da10b64db/server/src/computer/gateway.ts)) — không tồn tại đường nào act mà không ghi row trước. Mỗi refusal đi kèm đúng rule gây từ chối (`ActionRefusedError` mang theo `rule`), nên màn admin thấy được vì sao bị chặn chứ không chỉ thấy bị chặn.

## Take the wheel — UX bàn giao điều khiển

Số hai đáng học của OpenBot là cách nó xử lý điểm bot không được tự quyết. Gặp login wall hoặc prompt 2FA, bot không cố vượt — nó xin giúp. Việc bàn giao diễn ra trong cùng panel, ghi thành event có tên:

```text
Bot gặp login wall / 2FA
  └─▶ computer.help_requested     (bot xin người tham gia)
        └─▶ computer.control_taken     (người cầm lái trong cùng panel)
              └─▶ người xong việc
                    └─▶ computer.control_released  (trả lại bot)
Trong lúc người cầm lái: mọi hành động bot REFUSE, không xếp hàng đợi.
```

Nguồn: [README mục Features](https://github.com/CopilotKit/OpenBot#features), probe 2026-09-08. Chi tiết nhỏ mà có duyên: khi người đang điều khiển, hành động của bot bị từ chối ngay chứ không được xếp hàng để tự chạy sau khi người buông tay — hết bàn giao thì mới có bàn giao, không có cửa sau. Đi kèm là màn hình theo dõi: bạn thấy bot đang nhìn trang nào, tab Activity liệt kê nó chạy/lưu những gì kèm output, file đã lưu hiện path và kích thước chứ không hiện nội dung. Secret không bao giờ vào transcript — trail chỉ ghi rằng có một secret được xin và dài bao nhiêu.

## Trả lời bằng component, không phải văn xuôi

Generative UI của OpenBot không phải "để model sinh JSX rồi render". Component React nằm trong gallery của app; bản sandbox soạn trong `/admin/playground` và publish không cần deploy. Mỗi lần bot muốn trả lời bằng component, server kiểm tra ba thứ trước khi render:

```text
component tồn tại?  ─▶ đã publish?  ─▶ không bị withhold với bot này?
        └─ data function của component được grant riêng per-component
```

Nguồn: [README mục Features](https://github.com/CopilotKit/OpenBot#features), probe 2026-09-08. Cùng triết lý ấy chạy xuống tới skill: README viết "Skills are instructions, not capabilities" ([README](https://github.com/CopilotKit/OpenBot#features)) — skill cá nhân chỉ gắn vào bot mà tác giả sở hữu, skill deployment thuộc admin, và bot được cấp skill `skill-creator` chỉ lưu skill mới khi bạn bấm nút trên card. Ngôn ngữ tự do là nơi agent làm loạn; OpenBot siết cả ba lớp — hành động qua gateway, giao diện qua component gallery, khả năng qua skill grant.

Nguyên tắc "hành động qua cổng, refusal nêu rõ rule" chính là thứ Wakii xây quanh decision gates — đọc [docs story-workflow](/vi/docs/story-workflow/) để thấy mặt đối xứng: agent tự chủ phần làm, con người giữ điểm quyết. Bài [decision gates — vì sao agent luôn dừng hỏi](/vi/blog/decision-gates-safe-ai-agents/) kể chi tiết cơ chế đó.

## Wakii học được gì

- **ADOPT** — "refusal phải nêu tên rule": `ActionRefusedError` của OpenBot mang đúng rule gây chặn để UI hiển thị. Wakii đã làm điều này với guard codes ở decision gates (FI-341: resolve trùng hoặc gate đóng bị chặn với mã lỗi rõ ràng) — OpenBot xác nhận pattern và gợi ý mở rộng: mọi refusal của agent, kể cả ngoài gate (tool bị từ chối, file không cho ghi), đều nên trả kèm định danh rule thay vì thông báo vô hồn.
- **DIRECTION** — generative UI có grant: component được duyệt trước, render phải hỏi server từng lần, data function grant per-component. Nếu Wakii muốn agent render trạng thái workflow ngay trong panel thay vì prose, đây là hình mẫu an toàn để nghiên cứu.
- **WATCH** — repo 3 tuần tuổi (tính tới probe 2026-09-08), badge Alpha, và threads/memory phụ thuộc CopilotKit Intelligence — service ngoài repo. Theo dõi tới khi phần phụ thuộc này có đường self-host mượt hoặc bề mặt API ổn định thì đánh giá lại.
- **N/A** — routines chạy lịch (sàn 15 phút, cap 20, tự tắt sau 10 fail) và SSO SAML/OIDC theo email domain: đúng bài toán doanh nghiệp của một template deployment, không đụng tới surface Wakii hiện tại.

Wakii là agentic IDE với một đội superpowers có sẵn — nếu bạn muốn agent tự chủ mà vẫn có cổng chặn đúng chỗ, [tải Wakii](/vi/docs/getting-started/) và đọc [Superpowers panel](/vi/docs/superpowers-panel/) trước khi tự viết gateway cho riêng mình.
