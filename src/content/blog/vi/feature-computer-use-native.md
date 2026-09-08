---
title: "Computer use native: agent chạm được vào desktop"
description: "Wakii cho agent chạm vào desktop thật: module src/main/computer/ chọn provider theo nền tảng, kiểm tham số trước khi thực thi và gắn verification tường minh cho từng hành động. Kèm hành trình ship qua CI macOS và quyết định xóa fallback click trái âm thầm."
pubDate: "2026-09-18"
category: "tech"
tags: ["features", "agents", "workflow"]
draft: false
heroImage: "/blog/heroes/feature-computer-use-native.png"
---

Agent của Wakii đọc code, chạy lệnh, mở pull request — nhưng tất cả diễn ra
trong terminal và IDE. Đặt cho nó việc chạm vào một app desktop thật — bấm
nút, điền form, kéo thanh trượt — thì không có công cụ nào đảm nhiệm. Computer
use native là mảnh ghép đó: một module nằm ngay trong app, cho agent thao tác
máy như một người dùng thật, và quan trọng không kém, buộc mỗi thao tác phải
tự báo cáo mình đã làm gì. Bài này mổ xẻ module tại `src/main/computer/`,
hành trình ship ra DMG qua CI, và một quyết định đáng nhớ: xóa hẳn fallback
click trái âm thầm.

TL;DR:

- Vấn đề: agent sống trong terminal và IDE; UI desktop là một thế giới mà
  không công cụ nào của nó chạm tới được.
- Cách làm: `src/main/computer/` tách thành các lớp — chọn provider theo nền
  tảng, kiểm tham số trước khi thực thi, chặn paste vượt giới hạn, gắn
  verification tường minh cho từng kết quả hành động.
- Ship: CI trên GitHub-hosted runner chạy đủ chuỗi build kể cả
  `build:computer-macos`, DMG đổi tên rồi upload thẳng vào release v1.4.198.
- Honesty: PR #14721 xóa silent left-click fallback trên macOS — hành động
  làm việc khác rồi báo thành công là lỗi thiết kế, không phải tính năng.
- Toàn bộ đường dẫn, commit và trích dẫn trong bài lấy từ repo sản phẩm thật,
  ngày 2026-09-08.

## Agent bị nhốt trong terminal

Công cụ của agent phủ dày phía trong máy phát triển: đọc và ghi file, chạy
shell, chạy test, mở pull request. Phía ngoài biên đó là thế giới người dùng
sống trong đó mỗi ngày — app native, menu, dialog hệ thống, ô nhập liệu không
thuộc terminal nào. Hai thế giới này không có điểm chạm:

```ascii
hai thế giới làm việc — agent ở một bên, desktop ở bên kia

  thế giới agent                    thế giới desktop
  ├── đọc / ghi file                ├── app native, menu, dialog
  ├── chạy shell, chạy test         ├── ô nhập liệu, nút bấm
  └── mở PR, viết docs              └── điều khiển bằng chuột + bàn phím

  giữa hai bên: không có công cụ chung nào
  → agent không thể "làm như người dùng"
```

*Nguồn: sơ đồ khái niệm minh họa khoảng trống mà module `src/main/computer/`
tồn tại để lấp, lấy 2026-09-08.*

Khoảng trống này không phải do agent kém — nó là ranh giới của công cụ. Một
team chín agent chia việc cho nhau tới tận cùng thì vẫn còn một loại việc
không ai nhận: phần việc "chạm vào UI". Computer use native sinh ra để phần
việc đó có chủ.

## Bên trong module: mỗi lớp một trách nhiệm

`src/main/computer/` không phải một file lớn mà là các lớp nhỏ. Sáu file mang
tiền tố `computer-` và không phải test — năm file là các lớp bài này đi theo,
file thứ sáu (`computer-sidecar-paste-validation.ts`) thuộc nhóm sidecar:

```bash
$ ls src/main/computer/ | grep '^computer-' | grep -v '\.test\.'
computer-action-verification-normalization.ts
computer-clipboard-paste-validation.ts
computer-provider-action-validation.ts
computer-provider-lifecycle.ts
computer-provider-unavailable-message.ts
computer-sidecar-paste-validation.ts
```

*Nguồn: `ls src/main/computer/ | grep '^computer-' | grep -v '\.test\.'`,
lấy 2026-09-08; cùng thư mục còn các nhóm `desktop-script-*`,
`macos-native-provider-*` và `sidecar-*`.*

Đọc vai trò từng lớp từ code. `computer-provider-lifecycle.ts` chọn provider
theo nền tảng: trên macOS ưu tiên provider native nếu khả dụng, không thì rơi
về desktop-script provider; instance được cache và shutdown dọn sạch.
`computer-provider-action-validation.ts` đứng trước provider: chín nhóm hành
động được liệt kê tường minh trong switch — click, performSecondaryAction,
scroll, drag, typeText, pressKey, hotkey, pasteText, setValue — còn tham số
sai kiểu, thiếu cặp tọa độ, hay dùng cả windowId lẫn windowIndex đều bị chặn
bằng `invalid_argument` trước khi bất cứ gì chạm vào máy.
`computer-clipboard-paste-validation.ts` chặn paste văn bản vượt giới hạn;
payload lớn được đo theo kiểu yield để không độc chiếm main process — comment
trong code nói thẳng điều đó. `computer-action-verification-normalization.ts`
đóng lời hứa cuối: kết quả hành động mà thiếu verification thì được gắn state
`unverified` kèm lý do theo đường thực thi (`synthetic_input`,
`clipboard_paste` hay `accessibility_action_unasserted`).
`computer-provider-unavailable-message.ts` là lớp lỗi nói thẳng: không có
provider thì báo đúng nguyên nhân kèm cách sửa local.

Chuỗi dữ liệu đi qua module theo một chiều:

```ascii
intent agent → action validation → provider → verification

  agent quyết định       validateComputerProviderActionParams()
  "click nút X"    ───►  chặn trước: tham số sai → invalid_argument,
                            không gì chạm vào máy
                          ↓
                    provider do lifecycle chọn
                    (native macOS hoặc desktop-script)
                          ↓
                    normalizeComputerActionResult()
                    gắn state verification tường minh
                    (mặc định: unverified + lý do)
```

*Nguồn: dựng từ `computer-provider-action-validation.ts`,
`computer-provider-lifecycle.ts` và
`computer-action-verification-normalization.ts` trong `src/main/computer/`,
lấy 2026-09-08.*

## Ship: CI đủ chuỗi, DMG bay vào release

Module native cho macOS viết bằng Swift, cần bộ công cụ Swift 6 tức là cần
Xcode 16 — môi trường build local không phải lúc nào cũng có. Commit
`787766bfcf` thêm workflow `.github/workflows/macos-build.yml` (71 dòng) chạy
trên runner macos-15 của GitHub, chọn Xcode 16, rồi chạy đủ chuỗi:

```bash
# Full chain — INCLUDING build:computer-macos (needs Swift 6 tools = Xcode 16)
pnpm run build:desktop
pnpm run build:computer-macos
pnpm run build:keyboard-layout-macos
pnpm run build:notification-status-macos
pnpm run ensure:electron-runtime
node config/scripts/build-mac-local.mjs
```

*Nguồn: commit 787766bfcf, `.github/workflows/macos-build.yml`, bước "Build
native helpers + app", lấy 2026-09-08.*

Các bước sau đó gom artifact, đổi tên `orca-macos-arm64.dmg` thành
`Wakii-1.4.198-arm64.dmg` rồi `gh release upload v1.4.198 … --clobber` — DMG
thay thế tại chỗ. Release notes của v1.4.198 ghi đúng chuyện này, trích
nguyên văn:

> **macOS arm64 is being rebuilt on a GitHub-hosted runner (Xcode 16)** to
> include the computer-use native module — the DMG will be replaced in place
> when it finishes.

*Nguồn: release notes v1.4.198, repo wakii-dev/wakii, lấy 2026-09-08.*

## Bỏ fallback âm thầm: honesty là một quyết định thiết kế

Commit `66dfdc456f` (PR #14721, có mặt từ v1.4.186 và nằm trong tag
v1.4.198/v1.4.199) là ví dụ chuẩn cho nguyên tắc "giới hạn nói thẳng". Trên
macOS, lệnh `click --mouse-button middle` trước đây đọc chuỗi tham số thô
không kiểm, rơi vào đường accessibility, thực thi thành một cú click trái —
rồi báo thành công kèm `path: "accessibility"`. Cả bản sửa nằm gọn trong một
dòng diff:

```bash
-        let button = params["mouseButton"]?.string ?? "left"
+        let button = try mouseButton(params["mouseButton"]?.string)
```

*Nguồn: commit 66dfdc456f, diff
`native/computer-use-macos/Sources/OrcaComputerUseMacOS/main.swift`, lấy
2026-09-08.*

Vì sao fallback âm thầm là lỗi thiết kế chứ không phải thiếu tính năng:
agent suy luận từ những gì công cụ báo lại. Một hành động làm khác đi nhưng
báo thành công là ground truth sai từ tầng dưới cùng — các tầng phía trên tin
vào một thế giới không tồn tại. Cách sửa khớp đúng triết lý của module: lớp
normalize gắn state `unverified` thay vì giả định thành công; lớp validation
chặn sớm thay vì nuốt lỗi; còn fallback âm thầm thì bị xóa, không được "cải
thiện". Test trong chính commit đó viết rõ: "An unvalidated raw string
reaches AXPress and reports a left click as success."

Giới hạn hiện tại nói thẳng: bằng chứng trong bài tập trung ở nền tảng macOS
— notes v1.4.198 nói rõ việc rebuild arm64 là để kèm module native; máy
darwin thiếu app native nhận thông báo lỗi tường minh, trích nguyên văn:
"computer-use has no native provider for darwin because Orca Computer Use.app
was not found or this macOS version is unsupported. For local development,
run pnpm build:computer-macos and restart Orca from this worktree."; và
middle click trên macOS đi qua họ sự kiện `otherMouseDown`/`otherMouseUp` vì
macOS không có họ sự kiện middle riêng.

Chạm được desktop không làm thay team chín agent trong [Chín agent, quyền
hạn tách rời](/vi/blog/nine-agents-separated-powers/) — nó đưa cho team thêm
một đôi tay cho phần thế giới nằm ngoài trình soạn thảo. Vai trò từng thành
phần của kit liệt kê ở trang [agents & kit](/vi/docs/agents-and-kit/).

Muốn tự thấy: mở Wakii, giao cho team một việc đụng tới UI desktop, rồi đọc
kết quả hành động trả về — có cả state verification. Hoặc đọc diff của
`66dfdc456f` để xem một chuỗi `?? "left"` phải trả giá gì, và vì sao nó phải
đi.
