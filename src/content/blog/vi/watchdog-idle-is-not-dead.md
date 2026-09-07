---
title: "Watchdog: im lặng không phải là chết"
description: "Một agent im lặng chưa chắc đã kẹt — có thể nó đang chạy build dài. Watchdog kiểm ba tầng (commit, terminal, Linear) trước khi kết luận stall: im-lành thì để yên, im-hỏng thì resume từ commit xanh cuối. Bài này kể cả hai case thật và cơ chế resume không mất công."
pubDate: "2026-08-23"
category: "tech"
tags: ["story-workflow", "workflow", "guardrails"]
draft: false
---

Canh một story dài, câu hỏi lặp lại nhiều nhất không phải là "làm đến đâu"
mà là "nó còn sống không". Process của agent im lặng mười phút — nó đang
nghĩ, đang build, hay đã kẹt ở ngõ cụt từ giờ trước? Đoán theo cảm tính
sai theo cả hai hướng: can thiệp quá sớm là gián đoạn một bản build đang
chạy ngon; can thiệp quá muộn là bỏ mặc một sub-feature đã chết từ lâu.
Story workflow cấm kiểu đoán này: một **watchdog** phải kiểm chứng cứ qua
ba tầng mới được kết luận stall — và hai case thật trong bài này cho thấy
vì sao "im lặng" không phải là một chẩn đoán.

TL;DR:

- Agent im lặng chưa chắc đã kẹt — im-lành (build dài) và im-hỏng (kẹt ở
  gate fail) là hai tình huống khác nhau, phân biệt trước rồi mới can thiệp.
- Watchdog kiểm ba tầng trước khi kết luận stall: commit gần đây, trạng
  thái terminal, tiến độ Linear.
- Phục hồi là đánh thức bằng input: resume từ commit xanh cuối cùng,
  không restart từ đầu và mất phần việc đã làm.
- Commit atomic là đơn vị của resume — mỗi commit là một trạng thái đã
  xanh mà story có thể đứng dậy từ đó.

## Ba lớp kiểm một SF

Nguyên tắc thứ sáu trong tám nguyên tắc của story workflow mở đầu đúng
bằng sự phân biệt này:

> Agent im lặng chưa chắc đã kẹt — có thể nó đang chạy một bản build dài.
> **Watchdog** kiểm tra ba tầng (commit gần đây, trạng thái terminal,
> tiến độ Linear) trước khi kết luận stall, và việc phục hồi nghĩa là
> *đánh thức bằng input*, không phải khởi động lại và mất công.

*Nguồn: `src/content/docs/vi/story-workflow.md` nguyên tắc 6 "Watchdog: idle không đồng nghĩa chết", lấy 2026-09-07.*

Ba tầng không phải để trông cẩn thận; mỗi tầng trả lời một câu hỏi mà hai
tầng kia không thấy. Commit gần đây cho biết artifact công việc có nhích
không. Trạng thái terminal cho biết process còn sống không và có đang viết
gì ra không. Tiến độ Linear cho biết task có nhích trên bảng chung không.
Chỉ khi cả ba tầng cùng im lặng mới đủ bằng chứng để kết luận stall:

```ascii
agent im lặng
   │
   ├─ Lớp 1 — commit gần đây?
   │     └─ có commit mới ───────────→ đang làm ──→ để yên
   ├─ Lớp 2 — trạng thái terminal?
   │     └─ build/log còn tiến triển ─→ đang làm ──→ để yên
   ├─ Lớp 3 — tiến độ Linear?
   │     └─ task còn nhích ──────────→ đang làm ──→ để yên
   │
   └─ cả ba tầng cùng im ──→ kết luận stall ──→ can thiệp
```

*Nguồn: sơ đồ tự vẽ theo `src/content/docs/vi/story-workflow.md` nguyên tắc 6, lấy 2026-09-07.*

Thứ tự kiểm cũng là thứ tự độ trễ: hai tầng đầu rẻ và cập nhật liên tục,
tầng cuối chậm hơn nhưng phản ánh đúng thứ người đọc story quan tâm —
công việc có đi tới đâu trên bảng hay không. Watchdog đi qua từng lớp
theo trình tự ấy, và verdict chỉ được phép ra ở cuối: để yên, hoặc can
thiệp. Không lớp nào được phép kết luận thay cả ba.

## Im-lành và im-hỏng: hai case thật

Docs không dừng ở cơ chế — nguyên tắc 6 kể luôn hai case đã xảy ra:

> *Thực tế: một sub-feature im lặng trong bản build native dài đã được
> để yên; một cái thật sự kẹt ở gate fail đã được resume từ commit tốt
> cuối cùng thay vì từ đầu.*

*Nguồn: `src/content/docs/vi/story-workflow.md` nguyên tắc 6, lấy 2026-09-07.*

Case thứ nhất là im-lành. Sub-feature im lặng vì nó đang chạy một bản
build native dài — loại việc không viết gì ra chat, không sinh commit mới
trong một lúc, nhưng process vẫn sống và làm đúng việc của nó. Can thiệp
ở đây là phá hoại: restart giữa build là vứt bỏ đúng phần việc tốn thời
gian nhất. Watchdog đọc các tầng kiểm, thấy dấu hiệu sống, và chọn để
yên — quyết định đúng nhất trong case này là quyết định không làm gì.

Case thứ hai là im-hỏng. Sub-feature kẹt thật, ở một gate fail — nó sẽ
không tự nhích nữa, cứ để thêm bao lâu cũng vậy. Hai tình huống có triệu
chứng bề ngoài giống nhau (đều im lặng) nhưng cách xử lý đối lập nhau;
đó là lý do cơ chế ba tầng tồn tại: phân biệt trước, can thiệp sau. Bài
[gates, not trust](/vi/blog/gates-not-trust-rule-zero/) đã kể các cổng mà
một sub-feature phải vượt — case này là mặt còn lại: khi chính cổng đó là
nơi sub-feature kẹt lại.

## Resume từ commit xanh cuối

Nguyên tắc 6 gọi đúng tên hành động phục hồi: *đánh thức bằng input*,
không phải khởi động lại và mất công. Khác biệt nằm ở điểm xuất phát của
lần chạy kế tiếp. Restart từ đầu vứt mọi commit đã xanh; đánh thức bằng
input đặt agent về đúng trạng thái tốt cuối cùng và đưa cho nó thứ nó
thiếu — đầu vào mới, thông tin về cái đã fail — để nó tiếp tục từ đó.

```ascii
c1 ──→ c2 ──→ c3 ──→ c4 (xanh) ──╳── stall ở gate
                       │
                       ▼
          resume từ c4 — không từ đầu
                       │
                       ▼
                  c5 ──→ c6 ──→ …
```

*Nguồn: sơ đồ tự vẽ theo `src/content/docs/vi/story-workflow.md` nguyên tắc 6, lấy 2026-09-07.*

Cơ chế này khả thi nhờ một quy ước được đặt từ khâu viết code: commit
atomic. Mỗi commit tự đứng vững một mình — không có commit "một nửa" phải
chờ commit sau mới chạy được. Nhờ vậy "commit xanh cuối" là một trạng
thái đáng tin, và resume từ đó không phải vá víu: nó là tiếp tục một chuỗi
đã xanh. Không có commit atomic, khái niệm trạng thái tốt cuối cùng chỉ
còn là hy vọng.

Nguyên tắc đầy đủ — ba tầng kiểm, phục hồi bằng input, hai case thật —
nằm trong docs [story workflow](/vi/docs/story-workflow/). Bài
[gates, not trust](/vi/blog/gates-not-trust-rule-zero/) là mảnh ghép còn
lại: gate là nơi một sub-feature có thể kẹt lại, và watchdog là cơ chế
nhận ra điều đó kịp thời. Còn nếu bạn chạy story dài qua đêm: watchdog là
phần workflow bạn không nhìn thấy nhưng nhờ đó được ngủ.
