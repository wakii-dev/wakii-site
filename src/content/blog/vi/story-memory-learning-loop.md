---
title: "Vòng lặp học của story"
description: "Story sau nên biết điều mà story đầu từng trả giá để học. Bài này đi qua vòng lặp học của Wakii: post-task ritual ba câu hỏi, story memory ghi kèm nguồn gốc, và cách một ghi chú về lệnh CLI đổi tên đã cứu mọi story sau khỏi vấp lại."
pubDate: "2026-08-24"
category: "tech"
tags: ["memory", "story-workflow", "workflow"]
draft: false
---

Một story sau nên biết những điều mà story đầu tiên phải trả giá mới học
được. Không phải vì agent nào đó có trí nhớ tốt — trí nhớ của một agent
sống hết phiên làm việc rồi tắt — mà vì workflow có một vòng lặp: ghi bài
học tại chỗ phát sinh, gắn kèm nguồn gốc, và trao chúng cho sub-feature
kế tiếp. Không có vòng lặp, mỗi story học lại từ đầu những cái bẫy mà
story trước đã ngã; có vòng lặp, cái giá của mỗi lần ngã được trả đúng
một lần. Bài này đi qua vòng đó: ritual ba câu hỏi cuối mỗi task, story
memory kèm provenance, và một case thật cho thấy vì sao cơ chế này đáng
có.

TL;DR:

- Mỗi task kết thúc bằng post-task ritual ba câu hỏi: gì đã sai, cái gì
  đã fix được, pattern nào nên giữ.
- Bài học không nằm trong chat log chết — nó được lưu vào story memory
  kèm nguồn gốc: task nào, fix nào.
- Provenance biến ghi chú thành kiến thức kiểm lại được: sub-feature kế
  biết bài học đến từ đâu, còn đúng trong ngữ cảnh nào.
- Case thật: ghi chú về một CLI flag đổi tên giữa release cứu mọi story
  sau khỏi vấp lại — và log cải tiến trong repo này vẫn chạy đúng cách đó.

## Bài học được ghi ở đâu

Nguyên tắc thứ bảy của story workflow — "Bộ nhớ và vòng học hỏi" — trả
lời câu hỏi này ngay từ hai câu đầu:

> Mỗi task kết thúc bằng **post-task ritual** có chủ đích: gì đã sai,
> cái gì đã fix được, pattern nào nên giữ. Bài học được lưu vào story
> memory kèm nguồn gốc — task nào, fix nào — nên sub-feature kế tiếp
> khởi động thông minh hơn thay vì dẫm lại cùng một cái bẫy.

*Nguồn: `src/content/docs/vi/story-workflow.md` nguyên tắc 7 "Bộ nhớ và vòng học hỏi", lấy 2026-09-07.*

Đọc kỹ hai chữ "kèm nguồn gốc" — đó là phần làm ghi chú khác với tin đồn.
Một ghi chú không provenance là lời truyền miệng: "lệnh đó hình như hỏng".
Không ai biết nó đến từ task nào, fix nào, và nó còn đúng trong ngữ cảnh
nào. Một ghi chú có provenance là một mệnh đề kiểm lại được: task nào
gặp, fix nào thoát — ai muốn xác nhận có thể mở lại đúng chỗ đó. Story
memory chọn kiểu thứ hai, vì sub-feature kế sẽ dùng ghi chú để ra quyết
định; và một quyết định dựa trên lời truyền miệng thì chỉ mạnh bằng người
kể nó. Cách lưu này cũng khiến story memory không phải hộp đen: mỗi entry
truy ngược được về task sinh ra nó, nên khi một ghi chú hết đúng — công cụ
lại đổi — nó được sửa tại nguồn thay vì bị tin thêm một story nữa.

## Ritual: ba câu hỏi cuối mỗi task

Ritual chỉ ba câu hỏi, và chính độ ngắn làm nên nó: đủ ngắn để không task
nào bỏ qua, đủ rộng để bắt ba lớp giá trị khác nhau. "Gì đã sai" ghi lại
sự kiện. "Cái gì đã fix được" ghi lại giải pháp. "Pattern nào nên giữ"
nâng cả hai thành kiến thức tái sử dụng — câu thứ ba là chỗ một lần vấp
biến thành tài sản. Toàn bộ vòng lặp khép lại như sau:

```ascii
   ┌───────────────────────────────────────────────┐
   │                                               │
   ▼                                               │
task xong ──→ post-task ritual                     │
                ├─ gì đã sai?                      │
                ├─ cái gì đã fix được?             │
                └─ pattern nào nên giữ?            │
                     │                             │
                     ▼                             │
             story memory                          │
             (+ provenance: task nào, fix nào)     │
                     │                             │
                     ▼                             │
        task kế bắt đầu thông minh hơn ────────────┘
```

*Nguồn: sơ đồ tự vẽ theo `src/content/docs/vi/story-workflow.md` nguyên tắc 7, lấy 2026-09-07.*

Chữ "có chủ đích" quan trọng không kém ba câu hỏi. Ritual không phải
"ghi lại những gì nhớ ra cuối ngày" — nó là bước bắt buộc của quy trình,
task nào cũng phải chạy. Trí nhớ tự phát bỏ đúng những lần vấp nhỏ
nhất; ritual hỏi thẳng, nên lần vấp nhỏ cũng có cơ hội được ghi lại trước
khi nó lớn thành chặn đường của story kế.

## Từ ghi chú thành tài sản dùng chung

Nguyên tắc 7 có một ví dụ đúng dạng này:

> *Ví dụ: story đầu tiên học được rằng một CLI flag đã bị đổi tên giữa
> chừng release; ghi chú đó cứu mọi story sau khỏi vấp lại.*

*Nguồn: `src/content/docs/vi/story-workflow.md` nguyên tắc 7, lấy 2026-09-07.*

Cùng dạng đó đang sống trong repo của chính site này:
`docs/superpowers/improvements-log.md` — log cải tiến dùng chung của
workflow, mỗi entry ghi hiện tượng, workaround, và đề xuất thay đổi. Một
entry ngày 2026-09-04:

> **`orca linear comment add` trả `ok:false` thật cho body dài (~2.3KB
> qua heredoc stdin)** — không phải false-negative như `save-issue`
> (comment KHÔNG apply). Workaround: viết body ra file rồi
> `--body-file <path>` → ok:true.

*Nguồn: `docs/superpowers/improvements-log.md`, entry 2026-09-04, lấy 2026-09-07.*

Entry này có đủ giải phẫu của một bài học tốt: hiện tượng quan sát được
(CLI báo ok:false trong khi comment không hề được apply), workaround cụ
thể (viết body ra file, truyền qua `--body-file`), và chi tiết đủ để ai
đó mấy story sau đọc một lần là dùng được ngay — không phải tự va vào rồi
tự mò lại từ đầu. Đó chính là "ghi chú cứu mọi story sau" của nguyên tắc
7, ở dạng đang sống: không phải chat log chết, mà là tài liệu dùng chung
được duy trì qua các story.

Bức tranh tổng thể — bracket, gates, watchdog — hiển thị trong docs
[superpowers panel](/vi/docs/superpowers-panel/); tám nguyên tắc, trong đó
vòng lặp học ở nguyên tắc 7, nằm trong docs
[story workflow](/vi/docs/story-workflow/). Cơ chế canh story trong lúc
vòng lặp này chạy là chủ đề của bài
[watchdog: im lặng không phải là chết](/vi/blog/watchdog-idle-is-not-dead/).
Muốn thấy vòng lặp hoạt động: chạy một story, đọc story memory của nó, và
để ý sub-feature thứ hai khởi động nhẹ hơn thứ nhất.
