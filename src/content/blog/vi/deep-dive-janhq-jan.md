---
title: "Jan: trợ lý AI chạy local — app desktop tự mang theo engine"
description: "Jan nhúng engine llama.cpp vào app desktop và gọi mọi engine — local lẫn cloud — qua một interface duy nhất. Bài học đóng gói: riêng tư là quyết định kiến trúc, không phải tùy chọn cài đặt."
pubDate: "2026-10-15"
category: "tech"
tags: ["architecture", "cli"]
draft: false
---

Phần lớn ứng dụng chat AI mà bạn cài trên máy thực ra là một cái vỏ: "trí tuệ" nằm ở cloud, mất mạng là mất tính năng, và mỗi câu hỏi rời khỏi máy trước khi được trả lời. Jan đi chiều ngược lại — engine được đóng gói nằm ngay trong app, model tải về nằm trên đĩa của bạn, app vẫn chạy khi không có internet. Dự án này công khai trên GitHub với 44.380 stars (theo GitHub API ngày 2026-09-08), đáng đọc vì hai quyết định kiến trúc bên dưới: app tự host engine của mình, và mọi engine — local lẫn cloud — đi qua cùng một lớp interface.

TL;DR:

- Jan là app desktop chạy model AI trên chính máy người dùng: engine llama.cpp như plugin native, model tải từ Hugging Face nằm trong thư mục dữ liệu của app.
- Lớp provider abstraction là điểm đáng học nhất: mỗi engine tự đăng ký vào registry theo tên provider, UI chỉ gọi tên — đổi engine không phải sửa UI.
- Engine local và provider cloud kế thừa cùng một base class; khác biệt gói lại ở tầng headers và transport.
- "Riêng tư mặc định" là quyết định kiến trúc, không phải toggle trong settings — app đồng thời mở API chuẩn trên `localhost:1337` cho app khác.
- License là bài học phụ: GitHub API không nhận diện chuẩn — hiển thị NOASSERTION (theo GitHub API ngày 2026-09-08) — dù file LICENSE nằm ngay trong tree.

## App desktop tự mang theo engine

Nói "chạy local" thì nhiều công cụ claim được; cái khó là đóng gói. Engine llama.cpp là chương trình native, model là file hàng GB, UI là web — gói cả ba thành một app cài được trên Windows, macOS, Linux — bài toán Jan giải. App dựng trên Tauri: vỏ webview mỏng, lõi Rust lo phần cần tới hệ thống. Engine không bị viết lại mà chạy như plugin native của Tauri, tầng TypeScript giao tiếp với nó qua hai hàm chuẩn:

```typescript
import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/core'
```

*Source: `extensions/llamacpp-extension/src/index.ts` @ commit `dc40d7c`, theo GitHub API ngày 2026-09-08 — [github.com/janhq/jan/blob/dc40d7c273e74a7d079f4635d93472b7fdb4ce2b/extensions/llamacpp-extension/src/index.ts](https://github.com/janhq/jan/blob/dc40d7c273e74a7d079f4635d93472b7fdb4ce2b/extensions/llamacpp-extension/src/index.ts)*

Cả tầng xếp lại như sau:

```
UI chat (webview)
   │  gọi engine theo tên provider — không cần biết engine nằm đâu
   ▼
Extensions TypeScript (llamacpp · mlx · provider cloud)
   │  invoke / listen — ranh giới IPC
   ▼
Core Tauri (Rust) ──► plugin engine native (llama.cpp)
   │
   ▼
File model GGUF trên đĩa — tải từ Hugging Face, nằm trong data folder của app
```

*Source: sơ đồ đối chiếu tree janhq/jan @ commit `dc40d7c`, ngày 2026-09-08.*

Phân phối theo mặt desktop chuẩn: Windows (kênh Microsoft Store), macOS (dmg universal), Linux (deb, AppImage, kênh Flathub) — README liệt kê đủ, kèm hướng dẫn riêng cho Linux arm64. "App tự host engine" có nghĩa thực dụng: không có bước "cài engine riêng" — cài app là có engine, đúng theo bản app đang chạy.

## Một interface cho mọi engine

Điểm đáng học nhất nằm ở tầng types. Mỗi engine kế thừa một base class duy nhất, khai báo tên provider và tự đăng ký vào registry khi load:

```typescript
export abstract class AIEngine extends BaseExtension {
  abstract readonly provider: string
  registerEngine() {
    EngineManager.instance().register(this)
  }
```

Registry là một Map găm theo provider, tiêu dùng chỉ cần nhớ tên:

```typescript
public engines = new Map<string, AIEngine>()
get<T extends AIEngine>(provider: string): T | undefined {
  return this.engines.get(provider) as T | undefined
}
```

*Source: `core/src/browser/extensions/engines/AIEngine.ts` + `EngineManager.ts` @ commit `dc40d7c`, theo GitHub API ngày 2026-09-08 — [github.com/janhq/jan/tree/dc40d7c273e74a7d079f4635d93472b7fdb4ce2b/core/src/browser/extensions/engines](https://github.com/janhq/jan/tree/dc40d7c273e74a7d079f4635d93472b7fdb4ce2b/core/src/browser/extensions/engines)*

Hệ quả của thiết kế: thêm engine mới là thêm một extension mới, không đụng vào UI hay core. Trong tree ngày nay, engine là các package riêng — `llamacpp-extension`, `mlx-extension` — cạnh các extension phi engine như download hay vector-db. Provider cloud cũng đi qua cùng cấu trúc: `RemoteOAIEngine` kế thừa `OAIEngine`, chỉ override phần headers để gắn API key.

```typescript
export abstract class RemoteOAIEngine extends OAIEngine {
```

*Source: `core/src/browser/extensions/engines/RemoteOAIEngine.ts` @ cùng commit `dc40d7c`.*

Với UI, chuyển từ llama.cpp local sang một provider cloud là đổi một chuỗi provider — màn hình và luồng hội thoại không đổi. Interface mà mỗi engine hiện thực cũng gọn đúng một method; docstring tóm tắt vai trò: "Inference extension. Start, stop and inference models." — [`InferenceInterface`, core/src/types/inference/inferenceInterface.ts](https://github.com/janhq/jan/blob/dc40d7c273e74a7d079f4635d93472b7fdb4ce2b/core/src/types/inference/inferenceInterface.ts).

## Riêng tư là mặc định, không phải tùy chọn

README xếp tính năng theo trật tự đáng chú ý: mục đầu là tải và chạy model local từ Hugging Face; nhóm cloud đứng sau như lựa chọn bổ sung; phần privacy kết bằng: "Privacy First: Everything runs locally when you want it to" ([README của janhq/jan](https://github.com/janhq/jan)).

Chi tiết hơn khẩu hiệu: app không giữ khả năng local cho riêng mình. README ghi rõ: "OpenAI-Compatible API: Local server at `localhost:1337` for other applications" (cùng nguồn). Một app desktop đồng thời là một service trên máy: giao diện chat chỉ là client đầu tiên, API chuẩn biến engine trong app thành hạ tầng cho công cụ khác gọi vào. Chỗ đó "riêng tư" thành mặt API: dữ liệu không rời máy, khả năng thì chia sẻ theo giao thức hệ sinh thái đã biết dùng.

## Nhịp release và chiều main đi trước

10 release gần nhất trải từ v0.7.5 (08-12-2025) tới v0.8.4 (23-07-2026): đều nhưng không dồn, riêng cụm v0.8.0 → v0.8.3 gói trong hơn một tháng. Bảng dưới là 5 bản gần nhất:

| Tag | Ngày phát hành |
| --- | --- |
| v0.8.4 | 2026-07-23 |
| v0.8.3 | 2026-06-24 |
| v0.8.2 | 2026-06-01 |
| v0.8.1 | 2026-05-29 |
| v0.8.0 | 2026-05-22 |

*Source: `gh api "repos/janhq/jan/releases?per_page=10"`, theo GitHub API ngày 2026-09-08.*

Release cuối cách ngày research hơn sáu tuần, nhưng commit mới nhất trên main lại đúng ngày research (08-09-2026) — main đi trước release. App desktop phải build đủ ba hệ điều hành mỗi bản phát hành, nên tách "main liên tục / release theo cụm" là lựa chọn có lý: bản phát hành là sự kiện đóng gói và kiểm thử, không phải nhịp viết code.

## Nhãn license và sự thật trong tree

Tree của jan có file LICENSE, phần cấp quyền viết: "Licensed under the Apache License, Version 2.0 (the \"License\");" ([file LICENSE @ commit `dc40d7c`](https://github.com/janhq/jan/blob/dc40d7c273e74a7d079f4635d93472b7fdb4ce2b/LICENSE)). Tuy vậy GitHub API không nhận diện license chuẩn — hiển thị NOASSERTION (theo GitHub API ngày 2026-09-08), nhiều khả năng vì phần đầu file sửa theo tên dự án, khác văn mẫu chuẩn mà detector dò. Bài này vì thế gọi jan là dự án công khai trên GitHub và không tự gán nhãn license thay nền tảng; cách đọc an toàn là tra cả hai nguồn — nhãn của API và văn bản trong tree. Wakii chủ động làm rõ từ đầu: repo public `wakii-dev/wakii` giữ MIT kế thừa từ fork — chuyện khai báo license ở nơi dễ thấy đã có [bài phân tích riêng](/vi/blog/oss-why-fork-mit/).

Tổng kết con số theo GitHub API ngày 2026-09-08:

| Chỉ số | Giá trị |
| --- | --- |
| Stars | 44.380 |
| Forks | 3.012 |
| License (GitHub API) | NOASSERTION — không nhận diện chuẩn |
| Commit main gần nhất | 2026-09-08 — đúng ngày research |

*Source: `gh api repos/janhq/jan`, theo GitHub API ngày 2026-09-08.*

Nếu bạn muốn quy trình làm phần mềm có gates và evidence rõ ràng cho team agent của mình, [docs getting-started của Wakii](/vi/docs/getting-started/) là chỗ bắt đầu.

## Wakii học được gì

- **ADOPT — riêng tư làm mặc định kiến trúc.** Jan giữ engine và dữ liệu hội thoại trong app; Wakii đi cùng nguyên tắc này từ đầu: kit tự cài vào `~/.claude/` lần đầu chạy, story diễn ra trong worktree cục bộ trên máy. Đề xuất cụ thể: ghi "mặc định không rời máy" vào checklist review tính năng mới — tính năng nào cần cloud phải nêu rõ vì sao trong plan.
- **DIRECTION — registry provider theo tên.** EngineManager đăng ký engine theo `provider`, phía tiêu dùng chỉ gọi tên; đổi engine không đụng UI. Wakii hiện chạy một họ backend cho agents; abstraction này đáng đưa vào hướng đi khi có nhu cầu backend thứ hai, để định nghĩa agent và skill không phải sửa khi đổi model.
- **WATCH — Tauri như phương án đóng gói.** Jan dựng vỏ desktop trên Tauri (Rust + webview hệ thống); Wakii desktop dùng Electron — đã có [bài phân tích process model](/vi/blog/arch-electron-process-model/). Điều kiện chuyển thành DIRECTION: khi kích thước bundle hay footprint bộ nhớ của Electron thành điểm đau đo được.
- **N/A — tự maintain engine suy luận.** Bindings llama.cpp, GPU offload, quantization: hạ tầng inference không phải surface của Wakii — Wakii điều phối agent, không tự chạy model.

Muốn team agent có gates, evidence và quy trình kiểm chứng như vậy, thử Wakii — bản cài và hướng dẫn nâng cấp nằm trong [bài hướng dẫn cài đặt và cập nhật](/vi/blog/guide-install-update/).
