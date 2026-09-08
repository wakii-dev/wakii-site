---
title: "Mô hình process Electron của Wakii"
description: "Mổ xẻ ba process của Wakii — main, preload, renderer — qua code thật: cờ sandbox nằm ở đâu, 79 bridge expose cái gì, và vì sao renderer không có Node.js."
pubDate: "2026-09-24"
category: "tech"
tags: ["architecture", "electron"]
draft: false
heroImage: "/blog/heroes/arch-electron-process-model.png"
---

Mỗi ứng dụng Electron là ít nhất ba process chạy song song: một process main giữ quyền với hệ điều hành, một process renderer vẽ giao diện, và một script preload đứng giữa hai bên. Rất nhiều câu chuyện bảo mật Electron bắt đầu từ cùng một sai lầm: renderer được trao quá nhiều quyền. Wakii chọn chiều ngược lại — renderer chạy trong sandbox mà không có Node.js, quyền hạn gom về process main, và lối đi giữa hai bên là một hợp đồng kiểu hoá, đọc được bằng mắt. Bài này đi qua từng ranh giới bằng chính code trong repo công khai `wakii-dev/wakii`; đường dẫn nào trong bài cũng trỏ tới file có thật trên repo đó, bạn có thể mở ra đối chiếu từng dòng.

TL;DR:

- Process main giữ toàn bộ quyền — file, shell, keychain, process con; renderer chỉ là một trang web chạy sandbox.
- Cửa sổ chính được sinh ra với `sandbox: true`; các cửa sổ guest (nội dung web nhúng) khai tường minh đủ bộ contextIsolation, nodeIntegration, sandbox.
- Renderer không import `electron` — nó gọi `window.api`, object mà preload expose qua `contextBridge`, gồm 79 bridge chia theo domain.
- Hai đầu dây IPC dùng chung một bộ kiểu TypeScript ở `src/shared`, và phía preload bị ép khớp bằng `satisfies PreloadApi`.

## Ba process, ba quyền hạn

Process main là chương trình Node.js thật: nó đọc ghi file, spawn process con, nói chuyện với keychain, mở socket, dựng cửa sổ. Renderer là Chromium — về mặt quyền hạn, nó không khác một tab trình duyệt bị khoá trong sandbox: những gì nó chạm được vào hệ thống gần như bằng không. Preload thì đặc biệt: nó là một script chạy trong process renderer, trước trang web, với đúng một quyền hạn hẹp — được gọi vài API của Electron đủ để "phiên dịch", nhưng vẫn không có Node.js.

Hướng di chuyển của lời gọi là một chiều có kiểm soát. Code UI không tự mở file; nó gọi một hàm trên `window.api`, preload chuyển thành tin nhắn IPC, process main nhận, quyết định rồi trả kết quả về qua một Promise.

```ascii
        ┌───────────────────────────────────────────────┐
        │                PROCESS MAIN                   │
        │  Node.js đầy đủ quyền: file · shell ·         │
        │  keychain · spawn process con · network       │
        │  ipcMain.handle("domain:action", ...)         │
        └───────────────────▲───────────────────────────┘
                            │  IPC (invoke / reply)
┌───────────────────────────┴───────────────────────────┐
│                PROCESS RENDERER                       │
│  Chromium sandbox — không có Node.js                  │
│                                                       │
│   code UI ──gọi──▶ window.api ──▶ preload (phiên dịch)│
│              window.api = contextBridge               │
└───────────────────────────────────────────────────────┘
```
*Sơ đồ khái quát theo `src/main/index.ts` (process main) và `src/preload/index.ts` (expose `window.api`) — repo `wakii-dev/wakii`, lấy 2026-09-08.*

Điểm quan trọng nhất của sơ đồ nằm ở hướng mũi tên: từ renderer không có đường nào chạm tới tài nguyên hệ điều hành — file, shell, keychain — mà không đi qua một handler mà process main tự đăng ký. Trang web trong renderer có thể fetch internet như mọi trang web khác, nhưng mở file máy bạn thì phải xin.

## Cửa sổ chính: cờ bảo mật nằm ngay chỗ tạo cửa sổ

File `src/main/window/createMainWindow.ts` là nơi mọi thứ bắt đầu. Phần `webPreferences` của cửa sổ chính, nguyên văn:

```ts
// src/main/window/createMainWindow.ts
webPreferences: {
  preload: join(__dirname, '../preload/index.js'),
  sandbox: true,
  webviewTag: true,
  // Why an argument and not an IPC read: this is the window whose webviews host browser guests,
  // and it has to know that before it interprets its first session snapshot — earlier than any
  // handler registration it could wait on.
  additionalArguments: [formatBrowserClientHostIdArgument(getBrowserClientHostId())]
}
```
*Nguồn: repo công khai `wakii-dev/wakii`, lấy 2026-09-08.*

`sandbox: true` là dòng đáng chú ý nhất. Từ Electron 20, renderer đã được sandbox hoá theo mặc định, và Wakii chạy trên Electron 43 — vậy sao còn ghi tường minh? Vì mặc định là mặc định: một dòng tường minh không phụ thuộc việc default có đổi ở bản Electron sau hay không. Đây cùng tinh thần với "phòng thủ từ thiết kế" mà [một bài trước đã mổ xẻ](/vi/blog/defensive-by-design/).

Ngay dưới khối đó còn một ranh giới thứ cấp đáng học: sau khi cửa sổ tạo xong, code gọi `setTrustedUIRendererWebContentsId`, truyền vào `rendererWebContentsId` của cửa sổ chính — kèm comment gốc "native paste fallback is privileged IPC; only the top-level renderer may request it". Nghĩa là trong số những IPC có đặc quyền, vẫn chia thêm tầng: chỉ webContents của cửa sổ chính — không phải webview con — được phép xin.

Các cửa sổ guest thì khai báo thẳng tay hơn, đủ cả sáu cờ:

```ts
// src/main/browser/browser-manager-types.ts
// Why: Electron applies these before createWindow; feature strings/opener inheritance
// must not relax the child's isolation.
webPreferences: {
  allowRunningInsecureContent: false,
  contextIsolation: true,
  nodeIntegration: false,
  nodeIntegrationInSubFrames: false,
  sandbox: true,
  webviewTag: false
}
```
*Nguồn: repo công khai `wakii-dev/wakii`, lấy 2026-09-08.*

Kể cả thanh origin bar — dải UI vẽ đè lên nội dung popup — cũng có bộ `contextIsolation`, `nodeIntegration`, `sandbox` riêng của nó trong `src/main/browser/popup-origin-bar-window.ts`, để dữ liệu hiển thị của app không chung context với nội dung web tùy ý bên dưới.

## Preload: bản hợp đồng, không phải cửa hậu

Nếu preload chỉ expose nguyên bản `ipcRenderer` thì ranh giới trên chỉ là hình thức. `src/preload/index.ts` không làm vậy: nó lắp `api` từ 79 bridge theo domain (số liệu: `grep -c "from './api/" src/preload/index.ts`, lấy 2026-09-08) — bridge git, bridge Linear, bridge filesystem, bridge update… — rồi expose đúng hai object:

```ts
// src/preload/index.ts (phần cuối file)
} satisfies PreloadApi

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
```
*Nguồn: repo công khai `wakii-dev/wakii`, lấy 2026-09-08.*

Hai chi tiết nhỏ nhưng đắt giá. Thứ nhất, `satisfies PreloadApi`: object `api` bị ép khớp một kiểu tổng hợp định nghĩa trong `src/preload/api-types.ts` — thêm một hàm expose mà chưa khai báo kiểu là gãy lúc compile, chưa kịp chạy. Thứ hai, renderer không hề thấy `ipcRenderer`; nó chỉ thấy những hàm có kiểu, mỗi hàm biến thành một lời invoke có tên. Gõ sai tên hàm là lỗi compile, không phải lỗi runtime lúc nửa đêm.

## Một bộ kiểu dùng chung cho hai đầu dây IPC

IPC về bản chất là chuỗi tin nhắn — không có compiler nào kiểm giúp hai process hiểu nhau, trừ khi hai bên import cùng một file kiểu. Wakii đặt bộ dùng chung đó ở `src/shared`: 1.595 file .ts tại thời điểm viết, gồm cả file test (lệnh đếm: `ls src/shared | grep -c '\.ts$'`, lấy 2026-09-08).

| Hợp đồng | File (trong `src/`) | Đi từ đâu đến đâu |
| --- | --- | --- |
| `UpdateStatus` | `shared/update-status-types.ts` | process main đẩy trạng thái cập nhật → renderer vẽ thẻ |
| `ReleaseChannel` | `shared/release-channel.ts` | main ↔ renderer: chọn kênh stable / rc / hourly / daily / adhoc |
| `PreloadApi` | `preload/api-types.ts` | preload → renderer: kiểu của toàn bộ `window.api` |

*Nguồn: repo công khai `wakii-dev/wakii`, lấy 2026-09-08.*

Hàng đầu tiên của bảng đi hết vòng đời: khi có bản cập nhật, process main gửi một object `UpdateStatus` về renderer; hai bên cùng import type từ đúng một file. Đổi shape của type là cả hai cùng gãy compile — gãy ở đúng chỗ cần gãy. Phía main của dòng cập nhật đó đủ dài để có bài riêng: [auto-update feed, từ release tới máy người dùng](/vi/blog/arch-auto-update-feed/).

## Ngoài ba process: daemon, sidecar, worker

Ba process ở đầu bài chỉ là nền; danh sách entry trong `electron.vite.config.ts` dài hơn nhiều:

```ts
// electron.vite.config.ts (lược bớt)
input: {
  index: resolve('src/main/index.ts'),
  'daemon-entry': resolve('src/main/daemon/daemon-entry.ts'),
  'computer-sidecar': resolve('src/main/computer/sidecar-entry.ts'),
  'stt-worker': resolve('src/main/speech/stt-worker.ts'),
  // Why: forked with ELECTRON_RUN_AS_NODE so @parcel/watcher faults
  // can't take down the main process (issue #7547).
  'parcel-watcher-process-entry': resolve('src/main/ipc/parcel-watcher-process-entry.ts'),
  // Why: a worker thread survives the macOS 26 AppKit main-thread deadlock
  // without paying for another Electron process.
  'main-thread-hang-watchdog-entry': resolve(
    'src/main/hang-watchdog/main-thread-hang-watchdog-entry.ts'
  )
}
```
*Nguồn: repo công khai `wakii-dev/wakii`, lấy 2026-09-08.*

Mỗi entry là lời giải của một bài toán riêng. Daemon được build thành file ngoài app.asar (asar-unpacked) vì `child_process.fork()` của Node không chạy được file nằm trong asar — comment trong config giải thích rõ. parcel-watcher được fork với `ELECTRON_RUN_AS_NODE` để lỗi của thư viện theo dõi file không kéo sập process chính. Hang watchdog chạy trong một worker thread để sống sót qua đúng thứ nó cần phát hiện: event loop của process main bị treo — cơ chế đó đã có [bài riêng](/vi/blog/watchdog-idle-is-not-dead/).

Còn relay — kênh điều khiển từ xa, chủ đề quen của loạt bài này — không phải process riêng nào cả: nó chạy trong process main. `src/main/runtime/runtime-rpc/runtime-rpc-state.ts` import `RelayRevokeOutbox` từ `../relay/relay-revoke-outbox` — module relay tầng runtime dưới `src/main/runtime/relay`, không phải thư mục `src/relay` ở gốc. Chạy trong main nghĩa là relay kế thừa đúng mức quyền của main, và cũng bị chặn sau đúng ranh giới preload/renderer mà bài này vừa đi qua.

Những câu hỏi cấp sản phẩm — Wakii là gì, hỗ trợ nền tảng nào, license ra sao — [FAQ](/vi/docs/faq/) có câu trả lời ngắn. Muốn tự soi danh sách bridge đầy đủ, mở thư mục `src/preload/api/` trên repo công khai — mỗi file là một hợp đồng. Còn để thấy ba process hợp tác ra sao trong một luồng thật, bài [vòng đời auto-update](/vi/blog/arch-auto-update-feed/) đi từ GitHub Releases tới nút relaunch ngay trong app.
