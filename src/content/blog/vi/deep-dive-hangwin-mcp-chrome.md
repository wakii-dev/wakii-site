---
title: "mcp-chrome: khi agent dùng đúng Chrome của bạn"
description: "mcp-chrome biến Chrome thật của bạn thành một MCP server — agent tái dùng tab, cookie và đăng nhập sẵn có thay vì browser riêng. Bài mổ xẻ kiến trúc extension + native host và đọc tình trạng phát triển theo GitHub API ngày 2026-09-08."
pubDate: "2026-10-11"
category: "tech"
tags: ["features", "agents", "workflow"]
draft: false
---

Phần lớn công cụ browser automation cho agent đi cùng một con đường: khởi động browser riêng, sạch bong, thường headless. Nhưng đó là browser của agent — không có đăng nhập của bạn, không có cookie phiên. hangwin/mcp-chrome chọn phía đối diện: thay vì cấp agent một browser mới, nó mở đúng Chrome bạn đang dùng ra cho agent điều khiển. Bài này mổ xẻ ba mảnh làm nên điều đó — extension, native host, MCP — và đọc một con số khó bỏ qua: 12.393 sao trên một repo có nhánh chính im lặng từ 2026-01-06 (theo GitHub API ngày 2026-09-08).

TL;DR:

- mcp-chrome là một Chrome extension kiêm MCP server: client AI nối qua Streamable HTTP tới `127.0.0.1:12306/mcp` và điều khiển đúng Chrome đang mở, tái dùng đăng nhập cùng cấu hình sẵn có.
- Kiến trúc gồm ba chặng: client nói MCP với native server (gói `mcp-chrome-bridge`), native server nói native messaging với extension, extension gọi Chrome API trên tab thật.
- Pattern đáng học nhất: flow tự ghi lại biến thành tool động `flow.<slug>` với input schema sinh tự động — bản ghi thao tác trở thành công cụ agent gọi được.
- Nhịp phát triển thật: năm release trong tháng 06-2025, rồi v1.0.0 ngày 2025-12-29, commit cuối 2026-01-06 — tính tới ngày probe là khoảng 8 tháng không commit mới.
- Wakii đi hướng ngược — browser nhúng là của agent — nhưng bài học về phiên đăng nhập và bằng chứng hành động vẫn áp trực tiếp.

## Browser của bạn, không phải browser của agent

README của repo định nghĩa gọn sự khác biệt: "Chrome MCP Server directly uses your daily Chrome browser, leveraging existing user habits, configurations, and login states" (hangwin/mcp-chrome, [README](https://github.com/hangwin/mcp-chrome#readme)). Dịch sang cơ chế: extension chạy bên trong Chrome của bạn, nên những gì Chrome đã có — phiên đăng nhập, cookie, profile — sẵn dùng cho agent, không cần đăng nhập lại.

So với đường Playwright quen thuộc, khác biệt nằm ở ba chiều:

| Chiều | Browser riêng (kiểu Playwright) | Chrome của user (mcp-chrome) |
|---|---|---|
| Tiến trình | Lên browser process mới, tải binary riêng | Dùng đúng Chrome đang mở |
| Phiên đăng nhập | Đăng nhập lại trong môi trường sạch | Tái dùng cookie và phiên sẵn có |
| Khởi động | Chờ process bật xong | Bật extension là có |

*Nguồn: paraphrase bảng so sánh trong README hangwin/mcp-chrome, lấy ngày 2026-09-08.*

Cái giá của sự tiện ấy nằm ngay trong thiết kế: agent hành động với tư cách bạn — cookie của bạn, phiên của bạn. Ranh giới tin cậy không còn là "browser của agent" mà là "browser của user", và mọi câu hỏi bảo mật theo đó mà đổi tính chất. Số liệu probe: 12.393 sao, license MIT, chưa archive, nhánh chính push lần cuối 2026-01-06 — tất cả theo GitHub API ngày 2026-09-08.

## Ba chặng nối từ client tới tab Chrome

Chuỗi nối đọc được thẳng từ cây source, và nó dài đúng ba chặng:

```text
MCP client (AI bất kỳ)     native server                Chrome extension
  "click nút X"  ────────►  gói mcp-chrome-bridge  ───►  background script
   Streamable HTTP           (Node >= 20)                 native-host.ts
   127.0.0.1:12306/mcp          │                              │
                                └──── native messaging ────────┘
                                                               ▼
                                                  chrome.* APIs trên tab thật
                                                  tools/browser/* (30 module)
```

*Nguồn: dựng từ README và cây source hangwin/mcp-chrome tại commit f48e717, lấy ngày 2026-09-08.*

Client nói MCP qua Streamable HTTP (hoặc stdio nếu client chỉ hỗ trợ đường đó); phần native server là một gói npm cài toàn cục tên `mcp-chrome-bridge`; tới extension thì background script nhận lệnh, tra bảng tool rồi gọi Chrome API trên tab thật — thư mục `tools/browser/` chứa 30 module (screenshot, interaction, keyboard, network capture, vector search…), trong khi README quảng bá hơn 20 tool (tính tới 2026-09-08).

Chi tiết đáng chú ý ở chặng giữa: extension nền không nằm im chờ lệnh. Code giữ kết nối native port với cơ chế tự nối lại có nhịp:

```ts
const RECONNECT_BASE_DELAY_MS = 500;
const RECONNECT_MAX_DELAY_MS = 60_000;
const RECONNECT_MAX_FAST_ATTEMPTS = 8;
const RECONNECT_COOLDOWN_DELAY_MS = 5 * 60_000;
```

*Trích [`native-host.ts` (chrome-extension background script), commit f48e717](https://github.com/hangwin/mcp-chrome/blob/f48e71751e00bc09725c7e173423cff4f2ccd12a/app/chrome-extension/entrypoints/background/native-host.ts)*

Nghĩa là tám lần thử nhanh với backoff lũy thừa từ 500ms, trần 60 giây, có jitter để tránh các kết nối dẫm nhịp nhau, rồi rơi vào cooldown 5 phút. Riêng service worker của extension (Manifest V3) còn được giữ sống bằng keepalive — comment trong code gọi thẳng mục đích: "keep SW alive". Một bài học vận hành gọn trong bốn hằng số.

## Flow ghi lại biến thành tool cho agent

Phần thú vị nhất nằm ở `register-tools.ts` — nơi native server trả lời yêu cầu liệt kê tool. Ngoài bộ tool tĩnh, server hỏi ngược extension danh sách flow đã ghi và biến mỗi flow thành một tool MCP:

```ts
const name = `flow.${item.slug}`;
```

*Trích [`register-tools.ts` (native server MCP), commit f48e717](https://github.com/hangwin/mcp-chrome/blob/f48e71751e00bc09725c7e173423cff4f2ccd12a/app/native-server/src/mcp/register-tools.ts)*

Schema của tool không viết tay. Code đọc danh sách biến của flow — label, kiểu string/number/boolean/enum/array, giá trị mặc định, bắt buộc hay không — rồi dựng inputSchema tương ứng, cộng thêm bốn tùy chọn chạy chung (tabTarget, refresh, captureNetwork, returnLogs). Một quy trình bạn ghi lại một lần — điền form, bấm nút, chờ kết quả — trở thành công cụ agent gọi được bằng tên, với tham số có kiểm soát.

Đây là pattern "bản ghi thao tác thành API": phần khó của automation (đúng selector, đúng thứ tự) bị đóng băng trong flow; phần linh hoạt (giá trị đầu vào) được mở thành schema.

## 12.393 sao và tám tháng im lặng

Dòng thời gian release kể một câu chuyện rõ (toàn bộ theo GitHub API ngày 2026-09-08):

| Tag | Ngày phát hành |
|---|---|
| v0.0.2 | 2025-06-11 |
| v0.0.3 | 2025-06-16 |
| v0.0.4 | 2025-06-22 |
| v0.0.5 | 2025-06-23 |
| v0.0.6 | 2025-07-09 |
| v1.0.0 | 2025-12-29 |

Năm release trong chưa đầy một tháng (06-2025) — đúng nhịp README tự tả: "The project is still in its early stages and is under intensive development" (hangwin/mcp-chrome, [README](https://github.com/hangwin/mcp-chrome#readme)). Rồi nhịp ấy tắt: sau đó 5 tháng mới có v1.0.0, và commit cuối trên nhánh chính là merge PR #272 ngày 2026-01-06 — tính tới ngày probe 2026-09-08 là khoảng 8 tháng.

Con số đáng đọc là tỉ lệ: 12.393 sao đi với 8 tháng dừng. Nhu cầu thì thị trường đã xác nhận — "để agent dùng browser thật của tôi" là điều nhiều người muốn; phần bảo trì thì chưa thấy ai gánh tiếp tại repo gốc. Với ai định dựng lên đó: pattern trong code vẫn đáng học; nhưng phụ thuộc vận hành vào một repo ngừng chạy thì nên tính sẵn phương án fork. Câu hỏi mở tính tới ngày probe: trạng thái này là nghỉ giữa chừng hay đã dừng hẳn — chưa có dấu hiệu nào hai chiều.

## Wakii học được gì

- **DIRECTION** — "browser của user" thành một chế độ tùy chọn của browser nhúng. B0 browser test hiện chạy trên browser của agent (browser nhúng trong Wakii, như bài Design Mode đã tả); với luồng cần đăng nhập, một chế độ "tái dùng phiên của user" — bật tường minh, xác nhận từng lần — sẽ mở lớp bài toán mà browser sạch không chạm tới. Chưa áp ngay vì bán kính rủi ro đổi hẳn: agent hành động với cookie của user, cần thiết kế consent và giới hạn phạm vi trước.
- **WATCH** — pattern "bản ghi thao tác thành tool" (`flow.<slug>` với schema sinh tự động): hợp bản chất với ý tưởng probe browser ghi một lần rồi verifier chạy lại nhiều lần, nhưng Wakii chưa có surface record-replay; điều kiện nâng cấp thành DIRECTION/ADOPT: khi browser nhúng có cơ chế ghi kịch bản.
- **WATCH** — trạng thái bảo trì: 8 tháng không commit (theo GitHub API ngày 2026-09-08) — pattern thì đọc được, phụ thuộc sống thì rủi; điều kiện đổi grade: repo gốc chạy lại nhịp phát triển hoặc xuất hiện fork được cộng đồng nhận rõ ràng.

Chiến lược browser của Wakii — browser nhúng, Design Mode và gate B0 — nằm trong [Superpowers panel docs](/vi/docs/superpowers-panel/). Đọc thêm cách Wakii cho agent chạm tới desktop thật trong [native computer use](/vi/blog/feature-computer-use-native/), và cách một cú click trên UI trở thành ngữ cảnh cho agent trong [Design Mode](/vi/blog/feature-design-mode/). Wakii là agentic IDE với một đội superpowers có sẵn — tải về, để agent chạy, bạn giữ quyền quyết.
