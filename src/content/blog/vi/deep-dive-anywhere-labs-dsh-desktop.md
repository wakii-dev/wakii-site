---
title: "DSH Desktop: desktop plugin-first cho agent harness"
description: "DSH Desktop bọc DeepSeek Harness trong một Electron host mỏng, nơi chính desktop shell cũng là một plugin không đặc quyền — pin upstream, kênh stable/beta phân bằng giao thức fail-closed, và PR do agent soạn."
pubDate: "2026-10-23"
category: "tech"
tags: ["architecture", "electron", "agents", "workflow"]
draft: false
---

Một repo tạo ngày 13-08-2026 đã đạt 24.444 sao theo GitHub API ngày 2026-09-08 — chưa đầy một tháng. Điều đáng đọc không phải con số, mà là câu trả lời cho một câu hỏi mà mọi đội xây sản phẩm trên nền agent đều gặp: khi nền tảng bạn bọc liên tục nhích, làm sao mở rộng mà không biến thành một bản fork cứng, xa rời upstream chỉ sau vài tháng? Câu trả lời của DSH Desktop nằm gọn trong mô tả repo: 「万物皆插件」 ([mô tả repo](https://github.com/anywhere-labs/dsh-desktop), probe 2026-09-08) — mọi thứ đều là plugin, và chính desktop cũng là một plugin.

## TL;DR

- DSH Desktop là desktop client (Windows/macOS) bọc DeepSeek Harness (DSH): một Electron host mỏng khởi động Host chính thức của upstream, Web UI chạy qua carrier HTTP/WebSocket mặc định chỉ lắng nghe loopback — không tự chế hệ plugin renderer IPC, không expose Electron API ra trang web.
- Desktop shell là một plugin bình thường trong chính hệ plugin Cordis của upstream — đi cùng đường compose với plugin thứ ba, không có đặc quyền nào.
- Upstream được pin nguyên vẹn: submodule vendored không bao giờ bị sửa; kênh stable/beta phân bằng giao thức cập nhật fail-closed — server phải echo đúng channel và version, lệch là client từ chối.
- Repo phát triển kiểu agent-first: nhánh PR đặt tên `codex/*`, quyết định kiến trúc ghi thành ADR có ngày trong `.agents/notes/`, bốn bản stable trong hai tuần.

## Desktop mỏng bọc harness — đúng nghĩa "host"

DeepSeek Harness (DSH) là harness agent có sẵn ba mảnh: Web UI chạy local, dịch vụ Host, và hệ thống plugin. DSH Desktop không viết lại mảnh nào; nó đưa cả ba vào một ứng dụng desktop — tự khởi động và quản lý dịch vụ Harness local, tích hợp tray hệ thống và cửa sổ, không cần cài Node.js hay gõ lệnh (diễn giải từ README, probe 2026-09-08). Điểm đáng học là điều repo khẳng định KHÔNG làm trong tài liệu kiến trúc: desktop không tạo thêm hệ plugin IPC renderer riêng và không đưa Electron API tới trang web — cửa sổ chỉ là khung nhìn cho carrier web của Host.

| Chỉ số | Giá trị |
| --- | --- |
| Sao / fork | 24.444 / 1.182 — theo GitHub API ngày 2026-09-08 |
| License | MIT |
| Tạo / đẩy code gần nhất | 2026-08-13 / 2026-09-08 |
| Stable release gần nhất | v2.0.5 ngày 2026-09-03 (kèm v2.0.5-beta.1 cùng ngày) |
| Nền | TypeScript, Electron host + carrier HTTP/WebSocket loopback |

Cũng trong phần đầu README, repo tự khai minh bạch về nguồn gốc: đây là dự án cộng đồng độc lập, không thuộc về cũng như không được công ty DeepSeek ủy quyền hay chứng thực, và những contributor hiển thị trên GitHub đến từ lịch sử fork-inherit và sync commit — một lời dặn thẳng cho người đọc bảng Contributors trước khi suy diễn "ai đứng sau repo này".

## "Mọi thứ là plugin" — kể cả desktop shell

Tài liệu plugin-ecosystem của repo gọi desktop shell là "范例 đầu tiên" (mẫu) của chính triết lý plugin: nó là một DSH plugin bình thường, đi cùng một đường compose với plugin chính thức và plugin bên thứ ba, không có đặc quyền nào — thay vì "sửa tay nguồn upstream để làm một cái vỏ cố định". Ba nguyên tắc điều phối hệ sinh thái được nêu rõ: 组合优先 (compose qua slot, service và patch chính thức, không giả định hay ghi đè nội bộ plugin khác), 声明清晰 (khai báo phụ thuộc service/slot, không dựa vào trùng hợp runtime), và 兼容优先 (nâng cấp giữ tương thích ngược).

— docs/plugin-ecosystem.md, [anywhere-labs/dsh-desktop](https://github.com/anywhere-labs/dsh-desktop/blob/main/docs/plugin-ecosystem.md) (probe 2026-09-08)

Ở tầng app, kiến trúc mô tả vòng đời "generation" — mỗi lần đổi profile hay mode, generation hiện tại bị dispose toàn bộ, không gì được cache sang generation mới: không service reference, không window object, không subprocess handle. Tài liệu còn tự chặn chính nó khi nói về bảo mật: bản draft Community Fabric hiện chỉ là tài liệu, capability chỉ dùng cho kiểm tra tương thích, xác nhận người dùng và audit — "không giả vờ rằng JavaScript cùng tiến trình là một sandbox an toàn" ([docs/plugin-ecosystem.md](https://github.com/anywhere-labs/dsh-desktop/blob/main/docs/plugin-ecosystem.md), probe 2026-09-08).

## Pin upstream — và giao thức kênh fail-closed

Upstream được pin theo nghĩa cứng nhất: submodule `deepseek-harness/` vendored giữ nguyên pnpm workspace của upstream, cả kênh stable lẫn beta đều không sửa submodule; file `upstream.json` ghi version upstream, commit và manifest runtime vendored cho cả hai kênh. Kênh stable và beta thậm chí không phân bằng nhánh git — chúng là hai npm package vật lý và hai ứng dụng riêng.

Phần đáng đóng khung: giao thức cập nhật, viết như hợp đồng fail-closed giữa client và server:

```text
check      :  kèm header X-DSH-Desktop-Channel: stable|beta + version hiện tại
download   :  kèm X-DSH-Desktop-Target-Version
hợp đồng  :  server PHẢI trả đúng channel + version được yêu cầu
              → lệch         ⇒ client coi response là VÔ HIỆU
              → thiếu header  ⇒ xử là stable (an toàn mặc định)
stable chỉ nhận SemVer chính thức  ·  beta chỉ nhận "-beta.N"
```

— tổng hợp từ docs/architecture.md, [anywhere-labs/dsh-desktop](https://github.com/anywhere-labs/dsh-desktop/blob/main/docs/architecture.md) (probe 2026-09-08)

Không có đường nào tải chéo kênh im lặng: beta tự cập nhật chỉ hỏi kênh beta, còn "chuyển sang stable" là thao tác tách biệt, cho phép cài phiên bản thấp hơn bên cạnh bản beta. Gánh nặng xác thực đặt trọn ở server: nếu server chưa hỗ trợ quy tắc echo, client coi response là rác thay vì đoán.

## Repo do agent đóng góp — và tự ghi lại mọi quyết định

Nhịp phát triển cũng là một tín hiệu. Bốn bản stable (v2.0.2 → v2.0.5) ra trong hai tuần cuối tháng 08; sáng ngày probe 08-09, repo vừa merge PR #879 chuẩn bị release 2.0.6. Đáng chú ý hơn là ai soạn PR: các nhánh đề xuất đặt tên `codex/*` — do agent Codex soạn rồi maintainer duyệt, phủ đủ loại việc từ race condition trên trang Discover (#883) đến "recover blank and unresponsive runtime pages" (#880) — một watchdog cho trang runtime bị treo trắng.

| PR / commit (08-09-2026) | Nội dung |
| --- | --- |
| #883 `codex/fix-market-discover-race` | sửa race khi tải trang Discover của market |
| #881 `codex/move-data-directory-path-hint` | dời hint đường dẫn data sang bước xác nhận |
| #880 `codex/813-runtime-blank-watchdog` | phục hồi trang runtime treo trắng, không phản hồi |
| #879 `codex/release-2.0.6` | chuẩn bị release kế tiếp |

Quyết định kiến trúc lớn đều được ghi thành ghi chú có ngày trong `.agents/notes/implemented/` — ví dụ "pinned upstream and isolated Yarn workspace" (15-08-2026) hay "native shell generation and platform adapters" (19-08-2026). Một repo viết bởi agent mà vẫn giữ sổ ADR là minh chứng rằng kỷ luật tài liệu và tốc độ agent không đánh đổi nhau.

Chính sự kết hợp "pin upstream + mọi mở rộng đi qua cơ chế plugin + agent được giám sát duyệt PR" là cách Wakii tổ chức công việc của mình dưới một hình dạng khác — story chạy qua [docs story-workflow](/vi/docs/story-workflow/), còn kỷ luật giữ nhịp với upstream kể trong bài [oss-upstream-sync](/vi/blog/oss-upstream-sync/).

## Wakii học được gì

- **DIRECTION** — pin-and-wrap thay cho fork-and-merge: bọc upstream bằng submodule vendored không bao giờ bị sửa, xây mọi giá trị gia tăng qua chính cơ chế plugin của upstream, kèm sổ ADR có ngày. Wakii fork Orca theo merge-sync; nếu ma sát upstream tăng, đây là hình thế đối xứng đáng đưa lên bảng hướng đi.
- **DIRECTION** — giao thức kênh fail-closed cho cập nhật: server phải echo đúng channel + version được yêu cầu, lệch là response vô hiệu, không bao giờ tải chéo kênh im lặng. Wakii không vận hành server cập nhật riêng (feed đọc GitHub releases) nên chưa áp trực tiếp được — nhưng khuôn "client từ chối response không khớp" đáng giữ cho mọi claim kênh phân phối trong tương lai.
- **WATCH** — repo chưa đầy một tháng tuổi (tạo 13-08-2026), 4 stable trong hai tuần là nhịp đang dò; plugin market và contract Fabric mới dừng ở mức tài liệu, mobile remote còn badge "sắp ra". Quay lại khi contract thành chuẩn chạy được.
- **N/A** — dàn sponsor và các API-aggregator quảng cáo trong README: bài toán thương mại hóa hệ sinh thái, không đụng tới bề mặt sản phẩm Wakii.

Wakii là agentic IDE với một đội superpowers có sẵn — 9 agent tách quyền, mỗi việc đi qua gates trước khi đến tay bạn. [Tải Wakii](/vi/docs/getting-started/) và chạy một story thử.
