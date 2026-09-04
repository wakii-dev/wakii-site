---
title: Superpowers panel
description: Trung tâm điều khiển đội agent — tab Workflow và Story, bracket canvas, và các Story Ops gates.
order: 1
---

**Superpowers panel** là trung tâm điều khiển đội agent được tích hợp sẵn
của Wakii. Panel đi kèm bundled trong app — không cần setup — và nằm ở
right sidebar.

## Mở panel

Tìm icon **⚡ (zap)** trong **activity bar ở bên phải cửa sổ**. Bấm vào để
mở panel.

Nếu right sidebar đang ẩn, bật lại bằng `Cmd/Ctrl + L`
(**Toggle Right Sidebar**). Panel là bundled plugin, bật sẵn mặc định —
không phải cài gì cả.

## Hai tab

Panel có đúng hai tab: **⚡ Workflow** và **🌳 Story**.

### Tab ⚡ Workflow

Tab Workflow là nơi bạn khởi chạy một run. Nó lắp prompt khởi đầu cho
coding agent từ vài lựa chọn:

- **Intent** — đây là việc gì? *New feature*, *Continue work*, hay
  *Quick fix*. Intent quyết định hình dáng workflow (và bỏ qua các phase
  lập kế hoạch không áp dụng, ví dụ quick fix).
- **Modes** — các toggle định hình run: *Autonomous* (gates tự duyệt sau
  checkpoint), *Refine idea*, *Simplify code*, *Linear audit log* (comment
  tái hiện được trên Linear issue của bạn), *Mindset Browser* (agent làm
  việc browser-first, không phải CLI-first), và *Plan only*.
- **Subagents** — lưới 9 chuyên gia (P0 analyst, Designer, Spec critic,
  Plan critic, Code reviewer, Verifier, Security, Rollback fixer, Dev
  executor). Cả 9 bật sẵn mặc định; tắt bớt nếu muốn đội gọn hơn.
- **Execute (Phase 4)** — cách plan được build: *Delegate* (một worker
  agent mỗi task), *Inline* (agent tự implement trong session của mình),
  hay *Superpowers* (vòng executing-plans).

Bấm **Start** và prompt đã lắp xong được gửi cho coding agent.

### Tab 🌳 Story

Tab Story theo dõi các feature lớn được quản lý thành **story** — một epic
chia thành sub-feature có phụ thuộc:

- **Create story** / **Approve story** / **Launch SFs** — vòng đời story,
  từ bản nháp đến thực thi song song.
- **Bracket canvas** — đồ thị SVG trực tiếp của story: node epic, các
  sub-feature, dependency edges, màu trạng thái từng node, kèm hoạt động
  agent và tiến độ theo thời gian thực.
- **🛠 Story Ops** — dải thao tác vận hành cho story đang chạy: launch
  sub-feature kế tiếp, stats, **watchdog** (tự resume sub-feature bị
  stall), **verify** (chạy kiểm tra gate đầy đủ), và lịch sử attempts.

## Story Ops gates

Story Ops kiểm tra story so với definition-of-done, từng gate một:

| Gate | Kiểm tra |
|---|---|
| **B0** | Browser test — agent đã thực sự mở app và đi trọn flow |
| **B1** | Code + tests xanh |
| **B2** | Checkbox trong plan đã tick đủ |
| **B3** | Review độc lập xong |
| **B4** | Branch đã merge vào story branch |
| **B5** | Linear issue chuyển Done |

Verifier đưa ra một verdict cho mỗi story: `COMPLETE`, `READY-TO-DONE`,
`INCOMPLETE`, `VIOLATION`, hoặc `NOT-LAUNCHED`.

## Tiếp theo

Xem [Story workflow](/vi/docs/story-workflow/) cho luồng đầy đủ từ epic
đến PR, và [Agents & kit](/vi/docs/agents-and-kit/) để biết 9 agent là ai.
