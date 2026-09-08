---
title: "Kiến trúc computer-use: từ intent tới UI action"
description: "Bài mổ pipeline computer-use của Wakii trong repo công khai: agent quyết định một action, ai validate tham số, native module nào của hệ điều hành thực thi, và kết quả được chứng minh ra sao trước khi báo lại cho agent."
pubDate: "2026-09-25"
category: "tech"
tags: ["architecture", "agents", "electron"]
draft: false
---

Khi một agent quyết định "click nút X" trên desktop của bạn, cái quyết định đó không phải là một cú click. Giữa ý định và pixel là cả một pipeline: tham số phải qua validation, một provider phải được chọn theo hệ điều hành, một native module phải thực thi trong tiến trình của nó, và kết quả phải được chứng minh trước khi báo về. Bài này đi qua pipeline đó bằng code thật trong repo công khai `wakii-dev/wakii` — thư mục `src/main/computer/` và `native/` — để bạn thấy chính xác ranh giới nào nằm ở đâu.

TL;DR:

- Mọi action đi qua một lớp validation tham số trước khi chạm UI: click cần `elementIndex` hoặc cặp `x`/`y`, không được đưa cả `windowId` lẫn `windowIndex`.
- Provider được chọn theo hệ điều hành: Swift trên macOS 14 trở lên, PowerShell dùng UIAutomation trên Windows, Python dùng AT-SPI trên Linux.
- Native module chạy tách tiến trình và nói chuyện qua Unix socket kèm token — main process của app không tự đụng API accessibility của hệ điều hành.
- Kết quả action luôn mang nhãn verification: `verified` khi đọc lại được chứng cứ, hoặc `unverified` kèm lý do cụ thể.

## Lớp validation đầu tiên

Điểm vào của pipeline không phải là API hệ điều hành mà là một hàm thuần TypeScript. `validateComputerProviderActionParams` trong `src/main/computer/computer-provider-action-validation.ts` nhận method và một dict tham số thô, và từ chối trả về nếu thiếu gì đó. Luật của nó cụ thể đến từng case:

| Method | Validation bắt buộc |
| --- | --- |
| `click`, `scroll` | có `elementIndex` hoặc đủ cặp `x`/`y` — không chấp nhận một nửa |
| `typeText` | `text` là chuỗi không rỗng |
| `pasteText` | nội dung paste qua kiểm tra riêng (`computer-clipboard-paste-validation.ts`) |
| `pressKey`, `hotkey` | tổ hợp phím hợp lệ theo key spec dùng chung |
| `setValue` | `elementIndex` ≥ 0 và `value` là chuỗi (cho phép rỗng) |
| mọi method | không được đưa cả `windowId` lẫn `windowIndex` cùng lúc |

*Nguồn: src/main/computer/computer-provider-action-validation.ts, repo công khai wakii-dev/wakii, lấy 2026-09-08.*

Lỗi không ném ra dạng exception chung chung mà là `RuntimeClientError` với code `invalid_argument` và thông báo nói rõ case nào vi phạm. Đặt validation ở đầu pipeline có một hệ quả thiết kế: provider phía dưới không cần tự phòng thủ tham số rác, và agent phía trên nhận lỗi có cấu trúc mà nó đọc được để tự sửa intent.

## Chọn provider theo hệ điều hành

Tiếp theo, `ComputerProviderLifecycle` quyết định ai thực thi. Logic chọn nằm gọn trong một hàm availability:

```ts
export function shouldUseMacOSNativeProvider(): boolean {
  return (
    process.platform === 'darwin' &&
    isMacOS14OrNewer() &&
    resolveMacOSComputerUseExecutablePath() !== null
  )
}
```

*Nguồn: src/main/computer/macos-native-provider-availability.ts, lấy 2026-09-08.*

macOS native chỉ bật khi cả ba điều kiện cùng đúng: đang chạy trên darwin, hệ điều hành từ macOS 14 trở lên (darwin major ≥ 23), và helper executable có chữ ký tồn tại ở nơi đã biết. Không đáp ứng — hoặc trên Linux/Windows — lifecycle rơi xuống desktop-script provider. Provider một khi được tạo thì được cache, và `shutdown()` dọn cả hai luồng khi app tắt.

## Ranh giới process: sidecar và Unix socket

Đây là phần quyết định kiến trúc. Native module không chạy trong main process của app Electron — nó là một tiến trình riêng, nói chuyện qua giao diện có kiểm soát:

```ascii
agent quyết định action (intent: click / hotkey / setValue …)
   │  method + params
   ▼
main process — src/main/computer/
   validation: computer-provider-action-validation.ts
   chọn provider: computer-provider-lifecycle.ts
   ▼
ranh giới tiến trình
   macOS:  spawn helper Swift → Unix socket trong thư mục 0o700
           + token file 0o600 (macos-native-provider-transport.ts)
   Linux:  sidecar Node (sidecar-entry.ts) → runtime.py (AT-SPI)
   Windows: runtime.ps1 (UIAutomation)
   ▼
native/computer-use-<os>/ thực thi trên UI thật
   ▼
kết quả kèm nhãn verification → normalize → trả về agent
```

*Nguồn: src/main/computer/ và native/, lấy 2026-09-08.*

Trên macOS, transport tự mở cổng hẹp một cách đáng chú ý: thư mục socket tạo bằng `mkdtempSync` với quyền `0o700`, token ngẫu nhiên ghi vào file `0o600`, kết nối có hạn 10 giây, và dữ liệu chạy theo giao thức từng dòng — một dòng JSON một request. Có cả một comment trong code giải thích vì sao helper phải là executable có chữ ký riêng: nếu khởi động helper qua LaunchServices, hệ TCC của macOS sẽ quy trách nhiệm cho Orca.app; còn helper tự ký sở hữu grant Accessibility của chính nó.

Trên Linux, file `runtime.py` tự mô tả đúng một câu trong docstring: tiến trình này là một adapter AT-SPI nhỏ, đọc một file JSON operation, thực thi trong desktop session của người dùng, in một JSON response. `sidecar-entry.ts` là process Node con nhận request dạng `{id, method, params}` và dispatch tới provider hiện tại — kèm hook dọn dẹp trên `SIGTERM`, `SIGINT`, `beforeExit`.

## Verification: hành động được chứng minh thế nào

Kết quả của một action không chỉ là "xong" hay "lỗi". Mỗi metadata action mang một trường `verification`, và nội dung của nó do một bộ quy tắc quyết định:

| Hoàn cảnh | Nhãn verification |
| --- | --- |
| `setValue` và đọc lại giá trị element khớp | `verified`, kèm `property: 'value'`, giá trị kỳ vọng và preview thực tế |
| `typeText`, `pressKey`, `hotkey` | `unverified`, lý do `synthetic_input` |
| `pasteText` | `unverified`, lý do `clipboard_paste` |
| action qua đường accessibility | `unverified`, lý do `accessibility_action_unasserted` |

*Nguồn: src/main/computer/desktop-script-action.ts (`verifyDesktopAction`) và computer-action-verification-normalization.ts, lấy 2026-09-08.*

Đọc bảng theo hướng trung thực: chỉ `setValue` mới có chứng cứ trực tiếp — sau khi set, pipeline refresh snapshot và đọc lại giá trị của đúng element đó để đối chiếu. Các input tổng hợp không có cách đọc ngược tin cậy, nên chúng được gán nhãn `unverified` kèm lý do thay vì giả vờ đã kiểm chứng. `normalizeComputerActionResult` bảo đảm lý do không bị bỏ sót: nếu kết quả về tới mà thiếu verification trong khi đường đi thuộc nhóm đã biết, nó tự gắn nhãn phù hợp. Agent nhận về một mạch kín: intent → kết quả → bằng chứng (hoặc lời thừa nhận không có bằng chứng).

## Vì sao native module riêng cho mỗi OS

Ba API accessibility của ba hệ điều hành không giống nhau ở mức "đổi tên hàm" — chúng khác mô hình. macOS dùng AX API với quyền TCC và helper có chữ ký; Windows dùng UIAutomation cùng Win32 qua `Add-Type` trong `runtime.ps1`; Linux dùng AT-SPI qua GObject introspection trong `runtime.py`. Gói cả ba vào một lớp JS thuần sẽ vừa mất quyền hệ thống, vừa tạo một abstraction rò rỉ.

```text
native/
  computer-use-macos/     Package.swift — Swift
                          Sources/OrcaComputerUseMacOSCore/
                          (ActionArgumentValidation, KeyboardInputSafety,
                           UnixSocketPathSafety, SyntheticMouseClickDelivery …)
  computer-use-windows/   runtime.ps1 — PowerShell + UIAutomation
  computer-use-linux/     runtime.py — Python + AT-SPI
  keyboard-layout-macos/  main.swift
  notification-status-macos/ main.swift
```

*Nguồn: native/ trong repo công khai wakii-dev/wakii, lấy 2026-09-08.*

Mỗi native module nhỏ, độc lập, và khai báo năng lực của chính nó: qua handshake, provider trả về `ComputerProviderCapabilities` — một cấu trúc `supports` cho biết action nào làm được — và main process kiểm tra capability trước mỗi lần gọi (`assertMacOSProviderCapability` trong `macos-native-provider-contract.ts`). Module mới không cần đợi ai cho phép: nó chỉ cần trả đúng contract.

Feature này đã ở trong bản phát hành: release notes v1.4.198 ghi rõ macOS arm64 đang được build lại để kèm computer-use native module, và toàn bộ `src/main/computer/` nằm trên repo công khai. Về phía agent ra quyết định, cấu trúc tách vai của kit — agent nào quyết định, agent nào kiểm — đã có trong bài [chín agents, quyền tách bạch](/vi/blog/nine-agents-separated-powers/); còn triết lý phòng thủ tại ranh giới, phản xuyên suốt pipeline này, nằm trong bài [defensive by design](/vi/blog/defensive-by-design/).

## Kết

Trang [agents and kit](/vi/docs/agents-and-kit/) mô tả bộ kit agent mà pipeline trên phục vụ: agent quyết intent, phần còn lại của hệ thống chặn, thực thi và chứng minh. Toàn bộ đường dẫn nêu trong bài nằm trên repo `wakii-dev/wakii` (MIT) — nếu bạn muốn thấy ranh giới bằng chính mắt mình, mở `src/main/computer/` rồi đi theo một method từ validation tới native module. Và nếu bạn muốn agent tự tay làm việc trên desktop của bạn, tải Wakii và thử computer use trong phiên agent đầu tiên.
