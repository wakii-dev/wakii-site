---
title: "OpenHands: từ dự án nghiên cứu thành nền tảng agent tự vận hành"
description: "Mổ xẻ kiến trúc OpenHands: runtime agent chạy như service trong sandbox, ba cửa vào GUI, API, CLI cùng điều khiển một runtime, và những test chặn vi phạm kiến trúc ngay trong CI."
pubDate: "2026-10-07"
category: "tech"
tags: ["agents", "architecture", "oss"]
draft: false
---

Ngày 13-03-2024, OpenHands xuất hiện trên GitHub như một dự án nghiên cứu về agent lập trình tự trị. Hai năm rưỡi sau, repo này — 86.809 sao theo GitHub API ngày 2026-09-08 — đã đổi vai thành Agent Canvas: một control center self-hosted, nơi bạn điều hành không chỉ agent của nó mà cả Claude Code, Codex hay Gemini CLI. Điều đáng học không nằm ở con số sao, mà ở cách dự án tách runtime agent khỏi mặt điều khiển: agent chạy như một service có địa chỉ riêng, còn ba cửa vào — GUI, API, CLI — cùng ngó xuống đúng một runtime. Bài này mổ xẻ kiến trúc đó bằng code thật trên main, số liệu ghi kèm ngày lấy.

TL;DR:

- OpenHands rời vai agent nghiên cứu để thành Agent Canvas: control center điều hành nhiều agent, kể cả agent bên thứ ba qua ACP.
- Runtime tách khỏi giao diện: agent-server chạy như một service riêng (container có địa chỉ), frontend chỉ là một khách kết nối tới.
- GUI, API, CLI là ba cửa vào cùng một runtime — đổi backend không phải học lại cách điều khiển.
- Kiến trúc được bảo vệ bằng test: một test CI quét source và chặn mọi lối tắt HTTP ngoài client chính tắc.

## Từ dự án nghiên cứu tới control center

OpenHands khởi đầu là OpenDevin — dòng nghiên cứu về agent làm việc trong sandbox và sửa code thật. README ngày nay tả repo bằng một câu: "OpenHands Agent Canvas turns your coding agents into a self-hosted, always-on engineering team" (README của OpenHands/OpenHands, [github.com/OpenHands/OpenHands](https://github.com/OpenHands/OpenHands)). Đó là bước ngoặt: sản phẩm không còn bán một agent duy nhất, mà bán chỗ điều hành cho nhiều agent — của mình lẫn bên thứ ba.

Số liệu chụp theo GitHub API ngày 2026-09-08:

| Chỉ số | Giá trị |
|---|---|
| Stars | 86.809 |
| Forks | 11.376 |
| License | MIT |
| Ngày tạo repo | 2024-03-13 |
| Push gần nhất | 2026-09-08 |
| Release gần nhất | v1.16.0 — 2026-08-27 |

Nhịp release dày: 6 bản từ v1.11.0 đến v1.16.0 trong 20 ngày (07-08 đến 27-08, hai bản cùng ngày 07-08 — theo GitHub API ngày 2026-09-08). README đeo badge beta nhưng main được push hằng ngày — nền tảng đang xây công khai, không ngưng đọng.

## GUI, API, CLI — ba cửa vào một runtime

Điểm điều khiển đáng chú ý nhất của Agent Canvas: một runtime agent duy nhất, nhiều mặt tiếp xúc. Lệnh `agent-canvas` khởi chạy cả local stack; tách riêng được từng mảnh bằng `--frontend-only` (giao diện + ingress) hoặc `--backend-only` (agent server + automation backend) — theo README.

Frontend chỉ là một khách: trỏ biến `VITE_BACKEND_BASE_URL` tới agent-server bất kỳ là giao diện kết nối theo. Backend registry phía client nhớ backend đang hoạt động, kiểm tra health, chuyển giữa backend cục bộ hoặc từ xa. Một quy tắc nhỏ trong spec của repo chốt trải nghiệm đó: "Switching backends shall redirect to the same section but on the new backend" (specs/backend-management.md, [github.com/OpenHands/OpenHands/blob/f7fb0c4b21f5ed726edbba8a6309634ef434b004/specs/backend-management.md](https://github.com/OpenHands/OpenHands/blob/f7fb0c4b21f5ed726edbba8a6309634ef434b004/specs/backend-management.md)). Đổi backend mà không rời trang, không thấy dữ liệu cũ — chi tiết nhỏ nhưng quyết định control center có xứng đáng gọi là "center" hay không.

Cùng runtime ấy phục vụ automation: một backend riêng cho agent chạy theo lịch hoặc webhook, tích Slack, GitHub, Linear.

```
        GUI (Agent Canvas)      CLI (agent-canvas)      Automations
                 \                     |                     /
                  \                    |                    /
                   v                   v                   v
                +-------------------------------------------+
                |        ingress — một origin duy nhất       |
                +---------------------+---------------------+
                                      |
                   +------------------+------------------+
                   |       agent-server — service agent  |
                   |  conversations · events · tools     |
                   +------------------+------------------+
                                      |
                            sandbox (Docker / VM / cloud)
```

## Sandbox runtime: agent như một service có địa chỉ

Điểm quan trọng nhất trong kiến trúc này: agent không chạy trong tab browser. File AGENTS.md của chính repo vẽ rõ đường biên — agent-server là một thành phần riêng, nắm "Python SDK, Agent Server, agent/tool behavior, conversations, workspaces, events" (AGENTS.md của OpenHands/OpenHands, [github.com/OpenHands/OpenHands/blob/f7fb0c4b21f5ed726edbba8a6309634ef434b004/AGENTS.md](https://github.com/OpenHands/OpenHands/blob/f7fb0c4b21f5ed726edbba8a6309634ef434b004/AGENTS.md)). Frontend chỉ render và gọi API; phần chạy lệnh, giữ workspace, ghi event nằm ở service kia.

Ví dụ chuẩn: `examples/acp-docker`. Một lệnh `docker compose up` bật container `ghcr.io/openhands/agent-server` tại `localhost:8010` — agent server như một service có địa chỉ, vẫn còn trong sandbox container, không đụng filesystem máy chủ. Container mới không có login host, credentials do người dùng nhập qua Canvas UI; muốn tái lập bản build, pin image từ một file cấu hình duy nhất (`config/defaults.json`) — hai người chạy ra cùng một image.

Đường biên còn được viết thành văn bản. Tài liệu kiến trúc liệt kê thẳng những gì Agent Canvas **không** làm: không chạy hành động agent trực tiếp, không cung cấp sandbox hay isolation, không giữ LLM credentials ngoài backend (docs/architecture.md, [github.com/OpenHands/OpenHands/blob/f7fb0c4b21f5ed726edbba8a6309634ef434b004/docs/architecture.md](https://github.com/OpenHands/OpenHands/blob/f7fb0c4b21f5ed726edbba8a6309634ef434b004/docs/architecture.md)). Control center biết nói "cái này không phải việc tôi" là control center không phình thành runtime.

## Kiến trúc được thi hành bằng test, không bằng niềm tin

Viết đường biên ra docs là nửa việc; nửa còn lại là bắt ai đó vi phạm thì có thứ gì đổ. OpenHands chọn cách ít khoan nhượng nhất: một test trong CI quét toàn bộ `src/`, tìm mọi lối gọi HTTP thẳng tới agent-server ngoài client chính tắc. Tên test tự nói đủ câu chuyện: "uses typed @openhands/typescript-client access instead of ad-hoc HTTP" (src/api/no-direct-agent-server-calls.test.ts, [github.com/OpenHands/OpenHands/blob/f7fb0c4b21f5ed726edbba8a6309634ef434b004/src/api/no-direct-agent-server-calls.test.ts](https://github.com/OpenHands/OpenHands/blob/f7fb0c4b21f5ed726edbba8a6309634ef434b004/src/api/no-direct-agent-server-calls.test.ts)):

```ts
const violations = collectSourceFiles(SRC_ROOT).flatMap((relPath) => {
  const source = readFileSync(join(SRC_ROOT, relPath), "utf8");
```

Ba file trong allow-list công khai — muốn đi lối tắt phải ghi tên file vào danh sách, tức để lại dấu vết có người review.

Cơ chế thứ hai: automation UI của host không tự giữ dữ liệu nào. Mọi thứ — navigation, endpoint, bản chất trang — đến từ một manifest do package `@openhands/extensions` phát hành; manifest không có hoặc không qua admission, routes trả 404 và navigation không render (src/manifests/automation-interface.ts, [github.com/OpenHands/OpenHands/blob/f7fb0c4b21f5ed726edbba8a6309634ef434b004/src/manifests/automation-interface.ts](https://github.com/OpenHands/OpenHands/blob/f7fb0c4b21f5ed726edbba8a6309634ef434b004/src/manifests/automation-interface.ts)). Một nhóm tính năng nguyên cụm có thể xuất hiện hoặc biến mất theo manifest — host không phải sửa code.

Và cách repo quản quyết định kiến trúc: các spec dạng quy tắc đánh số có ID ổn định, mỗi quy tắc một dòng acceptance kiểm được:

```
### BM-002: Switching backends keeps the user on the same page
- [x] Switching backends shall redirect to the same section but on the new backend.
```

Ba quy tắc BM-001 đến BM-003, mỗi cái một hành vi quan sát được, không prose trang trí (specs/backend-management.md, link ở section trên). Quy tắc có ID thì review có thể trỏ, gate có thể check, drift có thể bắt.

## Wakii học được gì

- **ADOPT** — mục "không phụ trách" viết thẳng trong docs kiến trúc (phần trên): Wakii đang tả từng agent bằng "job" nó làm ([Agents & kit](/vi/docs/agents-and-kit/) liệt kê 9 agent kèm nhiệm vụ), nhưng chưa tả công khai việc gì agent đó **không** làm — "task-executor không tự duyệt code", "verifier không sửa lỗi". Thêm một dòng boundary cho từng role trong docs và trong định nghĩa agent của kit là biến nguyên tắc "quyền lực tách biệt" thành hợp đồng đọc được.
- **DIRECTION** — control center đa backend với registry + health check: runtime agent của Wakii hiện chạy cục bộ; mô hình "agent-server như service có địa chỉ, frontend là khách" là hướng đi tự nhiên cho việc chạy story từ xa (hướng relay-cloud), chưa áp ngay vì cần backend service trước.
- **WATCH** — hai thứ: tương thích ACP (chạy Claude Code, Codex, Gemini trong cùng control center) là quyết định chiến lược, chờ epic quyết; automation backend chạy agent theo lịch/webhook — watchdog của Wakii mới hoạt động trong phiên, chạy theo lịch cần hạ tầng relay.
- **N/A** — self-host quy mô đội (helm, k8s) và phát hành UI thành npm library để nhúng: Wakii là IDE desktop cho một người, không đối đầu tầng vận hành cluster.

Ba cửa vào một runtime của Agent Canvas đối chiếu ngược với cách Wakii chẻ quyền lực cho chín agent thay vì ba mặt giao diện — đọc trong [chín agent, quyền lực tách biệt](/vi/blog/nine-agents-separated-powers/), và cả đội được cài sẵn trong [zero-setup agent team](/vi/blog/zero-setup-agent-team/). Kit đầy đủ nằm trong [Agents & kit](/vi/docs/agents-and-kit/). Tải Wakii, để agent chạy — những quyết định có hệ quả vẫn thuộc về bạn.
