---
title: "Đội agent đầu tiên của bạn không có bước cài đặt"
description: "Mở Wakii lần đầu, kit superpowers tự cài vào ~/.claude/ — skills, chín agent, và các công cụ story-* — không đụng đến config sẵn có. Bài này mổ xẻ cơ chế zero-setup đó: có gì bên trong kit, vì sao chạy lại không hỏng gì, và cách tự kiểm chứng bằng lệnh thật."
pubDate: "2026-08-20"
category: "tutorial"
tags: ["workflow", "agents", "autonomy"]
draft: false
---

Công cụ cho developer thường mở đầu bằng một README ba màn hình: cài dependency
này, chạy init script kia, nhớ export biến môi trường nọ. Wakii chọn chiều ngược
lại — lần đầu bạn mở app, bộ máy agent đã được lắp sẵn và tự cài phần còn lại
vào máy bạn. Không wizard, không bước xác nhận, không file cấu hình phải sửa.
Bài này đi sâu vào cơ chế đó: kit nào được cài, nằm ở đâu trên đĩa, và vì sao
cứ chạy lại bao nhiêu lần cũng không làm hỏng config sẵn có của bạn.

TL;DR:

- Lần chạy đầu, workflow kit tự cài vào `~/.claude/` — không có bước nào cho bạn làm.
- Kit gồm ba lớp: skills (agent load theo nhu cầu), định nghĩa 9 agent, và các
  công cụ dòng lệnh `story-*`.
- Kit idempotent: chạy lại không nhân đôi gì, và luôn sync theo phiên bản app.
- Mọi mệnh đề trong bài đều có lệnh kiểm chứng kèm — bạn tự chạy lại được trên máy mình.

## Cài lần đầu mà không có bước cài

Quy trình được tài liệu hóa trong [getting started](/vi/docs/getting-started/)
gồm đúng các bước: tải app, mở app, nhìn sang activity bar bên phải và bấm icon
⚡. Đến phần "first run", tài liệu viết đúng một câu đáng nhớ: "There's no step
5, really." Không phải vì tài liệu lười — vì không còn gì để hướng dẫn nữa.

Cụ thể: lúc đầu tiên bạn chạy Wakii, workflow kit — gồm skills, định nghĩa agent,
và các công cụ dòng lệnh `story-*` — tự lắp vào `~/.claude/` trên máy bạn. Bạn
không cần cấp quyền thêm, không cần chạy script tay, không cần chỉnh PATH. Đến
bước mở panel ⚡ Superpowers thì mọi thứ đã ở đúng vị trí: tab ⚡ Workflow để
chạy một lượt làm việc, tab 🌳 Story để theo dõi các dự án lớn.

Ai từng onboarding một công cụ nội bộ thì biết phần "cài môi trường" thường
ngốn buổi chiều đầu tiên. Phần đó ở đây được đẩy vào lúc app tự khởi động lần
đầu — và quan trọng hơn, nó chạy cùng một mã nguồn với app, nên không có khoảng
lệch giữa "tài liệu viết" và "máy bạn có".

Với cả đội, hệ quả rõ hơn: mọi máy thành viên nhận cùng một bộ kit cùng phiên
bản. Không có câu "máy anh chạy được mà máy em không" do kit lệch phiên bản —
hoặc có thì nguyên nhân nằm chỗ khác, dễ tìm hơn nhiều.

## Bên trong kit tự cài

Kit chia thành ba lớp, mỗi lớp phục vụ một loại công việc:

```ascii
~/.claude/
├── skills/        ← kiến thức agent load on-demand (quy trình, checklist)
├── agents/        ← định nghĩa 9 agent chuyên trách
└── bin/story-*    ← 24 công cụ dòng lệnh cho vòng đời story
```

Lớp skills là những tài liệu quy trình mà agent đọc khi cần — không nạp sẵn vào
mọi phiên, chỉ load đúng lúc việc đó xuất hiện. Lớp agent là chín vai trò chuyên
trách, từ phân tích tác động đến review code — mỗi vai một quyền hạn, tách rời
nhau có chủ đích. Lớp dòng lệnh là các công cụ `story-*`: dựng worktree, tạo
gate, kiểm tra story còn sống hay đã stall — những thao tác mà cả người lẫn agent
cùng dùng.

Bạn không phải tin lời bài viết. Trên máy đã cài Wakii, chạy lệnh sau là thấy
toàn bộ công cụ dòng lệnh của kit (output thật, tại thời điểm viết 2026-09-07):

```bash
$ ls ~/.claude/bin | grep '^story-' | head -8
story-attempt
story-compact-recovery
story-dashboard-server
story-dashboard.html
story-diff-review
story-launch
story-memory
story-memory-fuse
```

Hai mươi bốn dòng lệnh là con số tại thời điểm viết — con số này tăng theo tính
năng mới của app, nên quy tắc đọc là đọc-tại-thời-điểm, đừng nhớ số. Chi tiết
từng vai agent có bảng đầy đủ trong [agents & kit](/vi/docs/agents-and-kit/).

## Idempotent nghĩa là gì trong thực tế

"Idempotent" trong tài liệu kỹ thuật hay bị đọc lướt. Ở đây nó có nghĩa cụ thể:
chạy lại lần thứ hai, lần thứ mười, lần thứ một trăm — trạng thái cuối vẫn y
như chạy một lần. Ba hệ quả thực dụng:

Một, bạn không sợ làm hỏng gì bằng cách khởi động lại. Config sẵn có của bạn
trong `~/.claude/` — nếu có — không bị ghi đè bừa; kit "không nhân đôi config
local của bạn" đúng như getting started đã viết.

Hai, khi app cập nhật, kit đi theo. Không có bước "upgrade kit" riêng — bộ máy
và app luôn cùng một phiên bản, vì chúng được phân phối và sync như một. Không
có tình trạng tài liệu mô tả lệnh mà máy bạn còn giữ lệnh cũ.

Ba, debug đỡ một lớp. Rất nhiều bug "không hiểu sao nó chạy sai" trong công cụ
dev đến từ trạng thái cài đặt lệch giữa các máy. Ở đây trạng thái cài đặt là
hàm của phiên bản app — cùng phiên bản thì cùng trạng thái, giữa máy này và máy
khác.

## Chín agent, một panel

Kit tự cài chỉ là phần đế. Phần trên là cách nó hiện ra trong app: panel ⚡
Superpowers với đúng hai tab. Tab ⚡ Workflow cho việc chạy một lượt từ ý tưởng
đến code. Tab 🌳 Story cho dự án lớn — chia sub-feature, xếp tier, chạy song
song, chốt bằng gate.

Nếu bạn muốn thấy bộ máy này vận hành trong một dự án thật từ đầu đến cuối, bài
[story workflow: từ ý tưởng đến release](/vi/blog/story-workflow-idea-to-release/)
kể lại đúng quy trình đó trên một tính năng sống. Còn để tự tay trải nghiệm:
mở Wakii, bấm ⚡, và bắt đầu từ một dòng mô tả ý tưởng.

Toàn bộ quy trình từ cài đến agent đầu tiên nằm trong
[getting started](/vi/docs/getting-started/) — và như đã nói, phần "cài" ngắn
nhất trong bài: nó không tồn tại.
