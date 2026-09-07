---
title: "Rework có kiểm soát — revert là tính năng"
description: "Spec đổi giữa chừng là chuyện bình thường; vá chồng vá mới là điều đáng sợ. Bài này kể cơ chế rework có kiểm soát: revert về commit xanh cuối rồi re-execute như một đơn vị review được — qua case thật khi landing đổi hướng v1 Terminal Mono sang v2 Bento Premium."
pubDate: "2026-08-26"
category: "tech"
tags: ["story-workflow", "git", "workflow"]
draft: false
---

Spec đổi giữa chừng là chuyện bình thường của dự án thật: người dùng
nhìn thấy bản đầu tiên và nhận ra mình muốn thứ khác, một giả định ban
đầu sụp đổ, môi trường thay đổi. Chuyện bất thường không phải là đổi —
mà là phản xạ sửa theo kiểu vá: một lớp style đè lên lớp style cũ, một
điều kiện bọc ngoài điều kiện cũ, và mỗi lớp vá là một quyết định chưa
từng được review một mình. Vài lớp vá sau, không ai còn nói được hình
dạng ban đầu của quyết định nữa. Story workflow có một cơ chế cho đúng
khoảnh khắc này: revert về commit xanh cuối rồi re-execute — bài này kể
cơ chế đó qua case thật khi trang landing của chính website này đổi
hướng visual từ v1 Terminal Mono sang v2 Bento Premium.

TL;DR:

- Spec đổi giữa chừng là bình thường; phản xạ nguy hiểm là vá chồng vá —
  mỗi lớp vá một quyết định chưa review.
- Commit xanh cuối là điểm quay: revert về đó, không reset --hard —
  lịch sử giữ nguyên, gồm cả phần bị bỏ.
- Case thật: landing đổi hướng v1 Terminal Mono → v2 Bento Premium giữa
  story — quyết định của người dùng, ghi thành design binding mới.
- Re-execute là một đơn vị review: người review đọc một diff sạch thay
  vì bác từng lớp vá một.

## Last-green là điểm quay

Khái niệm trung tâm là trạng thái tốt cuối cùng — commit xanh cuối cùng
trước khi hướng đổi. Đó là điểm mà tại đó mọi thứ đã từng đúng: build
xanh, đã qua review, working tree sạch. Khi một quyết định lớn hơn cải
tiến nhỏ xuất hiện, workflow không thử vá quyết định cũ bằng các lớp
quyết định mới — nó quay về điểm đã từng xanh và làm lại từ đó. Khác
biệt nằm ở động từ: revert, không phải reset --hard. Revert ghi một
commit mới lên đầu lịch sử; reset xoá lịch sử cho tới checkpoint. Kết
quả bề mặt trông giống nhau — working tree trở về trạng thái cũ — nhưng
revert để lại vết của chính cuộc quay:

```ascii
c1 ──→ c2 ──→ c3 ──┐   v1 — c3: commit xanh cuối theo hướng cũ
                    ▼
       REVERT tại đây — lịch sử giữ nguyên, không reset --hard
                    │
                    ▼
       c4 ──→ c5 ──→ c6     re-execute theo design binding mới
                    │
                    ▼
        review c4→c6 như MỘT đơn vị — không phải ba lớp vá
```

*Nguồn: sơ đồ tự vẽ theo case study trong `src/content/docs/vi/story-workflow.md`, lấy 2026-09-07.*

Vết của cuộc quay không phải là rác cần dọn — đó là một dòng ghi chép
sống trong lịch sử: "từ đây, hướng cũ bị bỏ theo quyết định X". Ai đọc
lịch sử sau này thấy đúng chỗ hướng đổi, thay vì một lịch sử đã được
dọn cho như chưa từng có hướng cũ.

## Đổi hướng không mất lịch sử

Cơ chế này đã chạy thật ở story FI-289 — story dựng chính website Wakii
này. Giữa story, hướng visual của landing đổi từ v1 Terminal Mono sang
v2 Bento Premium. Đoạn mở đầu của design document mới (file nằm trong
repo này, trích nguyên văn, lược chỗ được đánh dấu):

```text
# SF-1 Design Direction — "Modern Bento Premium" (D3 — user chọn 2026-09-04, thay thế v1 Terminal Mono)

> **v2 BINDING** (2026-09-04): thay thế hoàn toàn v1. […]
> DNA v1 (mono/mint/near-black) GIỮ làm nền identity; v1 direction-c.html
> chỉ còn giá trị tham chiếu terminal boot log.
```

*Nguồn: `docs/superpowers/designs/sf1-direction.md`, lấy 2026-09-07.*

Ba chi tiết trong đoạn trích kể trọn câu chuyện. Thứ nhất, quyết định
đổi hướng là của người dùng — dòng tiêu đề ghi rõ "user chọn", đúng
tinh thần human gates: quyết định kiến trúc không phải thứ agent tự
quyết. Thứ hai, v2 là binding: không phải một hướng mới để cân nhắc
thêm, mà là hợp đồng thay thế hoàn toàn v1 — sub-feature không được giữ
nửa v1 nửa v2 tùy tiện. Thứ ba — và đây là chỗ ít người ngờ — DNA của
v1 (mono/mint/near-black) GIỮ làm nền identity. Đổi hướng không đồng
nghĩa xoá sổ những gì đã đúng: lớp nhận diện của hướng cũ vẫn sống
trong hướng mới. Cái bị bỏ là layout theo hướng cũ, không phải toàn bộ
tài sản đã làm.

## Re-execute như một đơn vị review được

Docs story workflow kể lại chính case này trong case study của nó:

> **Rework có kiểm soát** — design trực quan đổi giữa chừng (direction
> v1 → Bento Premium v2). Thay vì vá lên trên, sub-feature revert về
> trạng thái tốt cuối và thực thi lại theo design binding mới — rework
> được review như một đơn vị sạch.

*Nguồn: `src/content/docs/vi/story-workflow.md` case study "chính story này", lấy 2026-09-07.*

Cụm "một đơn vị sạch" là phần làm cơ chế này hơn hẳn cách vá. Người
review đứng trước hai công việc đọc rất khác nhau. Với vá chồng vá: một
diff loang lổ, mỗi hunk là quyết định của một lớp khác nhau, và người
review phải tái dựng trong đầu lịch sử các lớp để phán từng lớp — một
lớp sai có thể trốn đàng hoàng dưới lớp vá đè lên nó. Với re-execute:
một diff duy nhất, từ trạng thái xanh cũ tới trạng thái mới, viết toàn
bộ theo design binding hiện hành. Người review đọc nó như đọc một
feature thật: mỗi dòng nói cùng một ngôn ngữ, không lớp nào phải bị
phán vì thừa kế của lớp trước. Cái giá phải trả là làm lại phần việc
vẫn dùng được — giá cố định, biết trước — đổi lấy một diff mà một mắt
thường đọc hết được.

Toàn bộ cơ chế — last-green, revert thay vì reset, re-execute theo
design binding — nằm trong docs
[story workflow](/vi/docs/story-workflow/). Bài
[phòng thủ từ thiết kế](/vi/blog/defensive-by-design/) là nửa kia của
cùng một tư duy: không xoá gì và mọi thứ revert được là hai mặt của một
lời hứa. Còn vì sao một trạng thái được gọi là "xanh" trước khi trở
thành điểm quay: bài
[gates, not trust](/vi/blog/gates-not-trust-rule-zero/) kể các cổng mà
một commit phải qua để được gọi như vậy. Muốn mang tư duy này đi nơi
khác: lần tới định vá lớp thứ ba lên hai lớp vá cũ — hỏi xem quay về
điểm xanh cuối rồi làm lại một lượt có rẻ hơn không.
