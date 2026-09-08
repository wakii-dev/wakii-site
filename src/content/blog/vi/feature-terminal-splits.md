---
title: "Terminal splits: nhiều phiên, một cửa sổ"
description: "Chạy nhiều phiên agent mà chỉ có một terminal là lần lượt đợi từng phiên. Bài này mổ xẻ terminal splits của Wakii từ phía code: split là operation của runtime, layout split sống qua restart, và cả thứ tự kích hoạt cũng được đo bằng benchmark."
pubDate: "2026-09-15"
category: "tech"
tags: ["features", "terminal", "wakii"]
draft: false
heroImage: "/blog/heroes/feature-terminal-splits.png"
---

Agent chạy lâu — mười lăm phút, nửa giờ — và trong lúc đó bạn muốn làm việc
việc khác trong cùng dự án. Nếu app chỉ cho một terminal mỗi cửa sổ, lựa chọn
của bạn là mở thêm cửa sổ rồi tự sắp xếp lại màn hình, hoặc đứng đợi. Terminal
splits giải theo hướng thứ hai không phải là chờ: tách không gian làm việc
thành các pane chạy song song trong một cửa sổ, mỗi pane một phiên riêng. Bài
này đọc tính năng đó từ phía code — split thực sự là gì trong runtime, layout
sống qua restart ra sao, và vì sao thứ tự kích hoạt một pane lại đáng để viết
benchmark.

TL;DR:

- Split không phải hiệu ứng vẽ UI: nó là operation của runtime — tách một leaf
  mới trong tab, gắn PTY riêng cho phiên mới.
- Mỗi pane nhận được `command` và `env` riêng lúc split — hai pane trong cùng
  một tab không phải hai bản sao của cùng một phiên.
- Layout sau split được ghi vào cây layout bền vững, nên split sống qua việc
  rebuild snapshot — có test riêng chặn regression này.
- Thứ tự kích hoạt split trước khi resolve CWD kế thừa là chủ đề của một
  benchmark e2e riêng trong commit #17601.

## Một phiên một cửa sổ, thời gian chờ là thật

Xét thói quen phổ biến khi làm việc với agent: bạn theo dõi phiên chính đang
chạy, đồng thời cần một terminal phụ để kiểm tra thứ gì đó nhanh — xem log,
chạy một lệnh git, peek một file. Với một cửa sổ một phiên, chuỗi thao tác là:
dừng hoặc thu nhỏ phiên chính, mở terminal mới, mất ngữ cảnh trên màn hình,
làm việc phụ, rồi quay lại. Chi phí không nằm ở từng thao tác; nó nằm ở việc
lặp lại chuỗi đó nhiều lần một ngày:

```ascii
một cửa sổ — một phiên — làm việc xen kẽ là chuyển phiên tuần tự

  cần chạy phiên A (dài) và việc phụ B (ngắn)

  tuần tự:   [A chạy ............] [dừng A] [B] [mở lại A] [A chạy ....]
  split:     ┌────────────────────────┬──────────────┐
             │ A chạy liên tục        │ B, khi cần   │
             └────────────────────────┴──────────────┘
```

*Nguồn: sơ đồ khái niệm minh họa tình huống mà terminal splits sinh ra để
giải, dựng khi viết bài, lấy 2026-09-08.*

Worktree isolation — đã có bài
[song song bằng worktree isolation](/vi/blog/parallel-worktrees-isolation/) —
giải việc nhiều agent giành file. Terminal splits giải tầng thấp hơn: nhiều
phiên trong cùng một working space, khi bạn chủ động muốn hai kênh nhìn cùng
lúc. Hai cơ chế này xếp lớp lên nhau chứ không thay thế nhau.

## Split là operation của runtime, không phải vẽ UI

Điểm đáng chú ý nhất khi đọc code: split tồn tại ở tầng runtime, trước cả UI.
Lớp `OrcaRuntimeWithSplitTerminal` trong
`src/main/runtime/orca-runtime-split-terminal.ts` cung cấp một method duy nhất
cho việc này:

```bash
async splitTerminal(handle, opts: {
  direction?: 'horizontal' | 'vertical'
  command?: string
  env?: Record<string, string>
  activate?: boolean
  ...
}): Promise<RuntimeTerminalSplit>
```

*Nguồn: chữ ký `splitTerminal` trong src/main/runtime/orca-runtime-split-terminal.ts,
repo wakii-dev/wakii (fork của orca), lấy 2026-09-08.*

Đọc chữ ký là thấy ba quyết định thiết kế. Một: split nhận `handle` của phiên
gốc và trả về handle mới — phiên mới là một thực thể first-class, có PTY riêng
qua `splitPtyBackedTerminal` chứ không chia sẻ stream với pane gốc. Hai:
`direction` là lựa chọn của caller (mặc định `horizontal`), không phải quyết
định cứng của app. Ba — và đây là phần ít thấy nhất ở tính năng UI: mỗi pane
mới nhận `command` và `env` riêng. Hai pane trong một tab có thể chạy hai lệnh
khác nhau trong hai môi trường khác nhau; chúng chỉ chia sẻ cửa sổ, không chia
sẻ phiên.

## Layout split sống qua restart

Tính năng hay hỏng ở chỗ ít ai ngờ: đóng app rồi mở lại. Một split chỉ cập
nhật snapshot phiên chạy thì sẽ biến mất khi app dựng lại layout từ snapshot
bền vững. Commit lịch sử trong repo ghi đúng case này, ngay trong comment giải
thích:

```bash
// Why: a headless ("Orca server") split only updated the live session
// snapshot, never the persisted workspace-session layout, so a later
// snapshot rebuild re-derived from the stale single-leaf layout and
// collapsed the split. This builds the durable post-split layout so the
// split survives rebuilds.
```

*Nguồn: comment trong src/main/runtime/headless-terminal-split-layout.ts, repo
wakii-dev/wakii, lấy 2026-09-08.*

Nghĩa là sau khi split, cây layout mới được ghi vào `TerminalLayoutSnapshot`
bền vững — rebuild sau đó dựng lại đúng các pane đã split thay vì thu về một
leaf. Hành vi này có test chặn: `headless-terminal-split-layout.test.ts` nằm
cạnh file runtime, còn `persistence-split-pane-incarnation.test.ts` canh ở tầng
trên, trong `src/main/`. Với
một tính năng mà người dùng đánh giá bằng "màn hình của tôi hôm sau còn y
như hôm trước", đây là phần code quyết định trải nghiệm, dù nó không hiện
nào lên màn hình.

## Thứ tự kích hoạt cũng là chủ đề benchmark

Commit #17601 — "Activate terminal splits before inherited CWD resolution" —
là commit đưa splits vào tag release v1.4.198, và nội dung của nó bất ngờ hơn
tên gọi:

```bash
$ git -C <orca-repo> show c558d7e083 --stat --format=''
.../terminal-split-activation-latency-artifact.ts    |  53 ++
.../terminal-split-activation-latency-main-probe.ts | 193 +++++
.../e2e/terminal-split-activation-latency.spec.ts   | 730 ++++++++++++++
43 files changed, 4955 insertions(+), 419 deletions(-)
```

*Nguồn: `git show c558d7e083 --stat`, repo orca, lấy 2026-09-08.*

Vấn đề được giải: split mới phải được kích hoạt (focus, sẵn sàng nhận input)
trước khi CWD kế thừa được resolve và publish — nếu thứ tự đảo lại, pane mới
có thể nhận ngữ cảnh thư mục của một trạng thái chưa chốt. Commit không chỉ
đổi thứ tự; nó kèm một bộ benchmark đo latency kích hoạt split qua nhiều
phase, có e2e spec 730 dòng và artifact ghi kết quả theo schema-v2. Với một
tương tác nhỏ của UI, đây là mức độ kỷ luật hiếm gặp — và nó nói lên điều gì
đó về chỗ nào split nằm trong kiến trúc: không phải trait vẽ thêm, mà là
operation của runtime có timing cần giữ đúng.

Giới hạn cũng nên nói thẳng. Splits chia sẻ cửa sổ và tab — nó không thay cho
isolation: muốn hai agent không đụng file của nhau thì vẫn cần worktree riêng
(theo bài
[song song bằng worktree isolation](/vi/blog/parallel-worktrees-isolation/)).
Và phần benchmark trong #17601 là hạ tầng của đội phát triển — người dùng
không thấy số liệu đó, chỉ thấy hậu quả: pane mới xuất hiện đúng ngữ cảnh,
không nhảy thư mục.

Nếu bạn muốn tự thấy: mở Wakii, cho agent chạy một việc dài, split terminal
ra làm việc phụ trong cùng tab, rồi đóng-mở lại app để kiểm tra layout còn
nguyên. Hướng dẫn cài đặt và các bước đầu tiên nằm ở trang
[getting started](/vi/docs/getting-started/); cách cả hệ thống xếp lớp giữa
isolation file và đa phiên có trong bài
[song song bằng worktree isolation](/vi/blog/parallel-worktrees-isolation/).
