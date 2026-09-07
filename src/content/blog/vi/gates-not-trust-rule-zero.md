---
title: "Gates, not trust — và Rule 0"
description: "Mỗi sub-feature phải vượt năm gates tool-enforced và sáu cổng B0–B5 trước khi được tính Done — và Rule 0 đòi mở browser nhìn thấy kết quả. Bài này đi vào cơ chế: từng gate kiểm gì, verdict nào quyết định story, và case thật khi flow-check bắt preview server phục vụ nội dung cũ."
pubDate: "2026-08-22"
category: "tech"
tags: ["gates", "guardrails", "story-workflow"]
draft: false
---

Trong báo cáo tiến độ của bất kỳ agent nào, câu nguy hiểm nhất là "nó chạy
rồi". Không phải vì agent nói dối — mà vì đó là lời khẳng định, không phải
bằng chứng; và một story tin vào lời khẳng định sẽ gom hết lỗi ở câu cuối.
Bài [decision gates](/vi/blog/decision-gates-safe-ai-agents/) đã kể tầng
con người của cơ chế này — những ngã rẽ mà agent dừng lại chờ bạn chọn;
bài này là tầng máy: thay lời hứa bằng cổng, những cổng mà chính workflow
dựng lên để kiểm story trước khi được gọi là xong. Công việc phải vượt các
gate — máy kiểm, không phải người tin — trước khi được tính Done. Bài này
đi vào từng tầng cổng: năm gates chạy trên mỗi sub-feature, sáu cổng B0–B5
kiểm trên cả story, năm verdict kết luận, và Rule 0 — cổng đòi mở browser
nhìn thấy kết quả.

TL;DR:

- Năm gates tool-enforced chạy trên mọi sub-feature: preflight, diff
  review, test, environment snapshot, post-merge.
- Sáu cổng B0–B5 kiểm story so với definition-of-done — từ browser test
  thật đến Linear Done.
- Verifier chốt mỗi story bằng đúng một trong năm verdict: COMPLETE,
  READY-TO-DONE, INCOMPLETE, VIOLATION, NOT-LAUNCHED.
- Rule 0: verify browser thật ba tầng (DOM, screenshot, flow) — "agent nói
  nó chạy" không phải bằng chứng.

## Gate là hợp đồng, không là niềm tin

Docs story workflow đặt tên nguyên tắc này không sai một chữ: gates thay
vì niềm tin. Phần mở đầu của nguyên tắc 3:

> Năm gates tool-enforced chạy trên mọi sub-feature — preflight, diff
> review, test, environment snapshot, post-merge — cộng **Rule 0**: verify
> browser thật ba tầng (cấu trúc DOM, screenshot trực quan, đi trọn flow
> bằng click).

*Nguồn: `src/content/docs/vi/story-workflow.md` nguyên tắc 3 "Gates thay vì niềm tin", lấy 2026-09-07.*

Năm gates xếp thành một pipeline — mỗi gate chắn một loại rủi ro khác nhau
trên đường từ task đến Done:

```ascii
sub-feature bắt đầu
   │
   ├─[1] preflight ────────────── điều kiện vào việc
   ├─[2] diff review ──────────── mắt khác đọc từng diff
   ├─[3] test ─────────────────── bộ test phải xanh
   ├─[4] environment snapshot ─── trạng thái môi trường được ghi lại
   ├─[5] post-merge ───────────── kiểm tra sau khi merge
   │
   ▼
sub-feature được tính xong
```

*Nguồn: sơ đồ tự vẽ theo `src/content/docs/vi/story-workflow.md` nguyên tắc 3, lấy 2026-09-07.*

Điểm quan trọng không phải con số năm mà ở hai chữ tool-enforced: gate
không dựa vào việc ai đó nhớ phải kiểm. Gate chạy bằng công cụ, trên
artifact thật — diff thật, log test thật, snapshot thật. Và khi gate không
thỏa, docs viết sẵn câu trả lời trung thực: "tôi không verify được điều
này" — không bao giờ là lượt pass lặng lẽ. Câu đó nghe như chi tiết nhỏ,
nhưng nó là một quy ước văn hoá: thất bại được khai báo thì story còn được
cứu; thất bại bị che thì story chết ở một chỗ không ai đang nhìn.

## Sáu cổng B0–B5 và năm verdict

Năm gates trên chạy trong lúc một sub-feature đang chạy. Tầng kế kiểm trên
cả story: Story Ops gates — sáu cổng B0–B5, mỗi cổng một dòng trong
definition-of-done:

| Gate | Kiểm tra |
|---|---|
| **B0** | Browser test — agent đã thực sự mở app và đi trọn flow |
| **B1** | Code + tests xanh |
| **B2** | Checkbox trong plan đã tick đủ |
| **B3** | Review độc lập xong |
| **B4** | Branch đã merge vào story branch |
| **B5** | Linear issue chuyển Done |

*Nguồn: `src/content/docs/vi/superpowers-panel.md` §"Story Ops gates", lấy 2026-09-07.*

Chạy hết sáu cổng, verifier phát verdict — đúng một trong năm: `COMPLETE`,
`READY-TO-DONE`, `INCOMPLETE`, `VIOLATION`, hoặc `NOT-LAUNCHED`. Làm xong
thật, sạch để chốt, chưa đủ, vi phạm, chưa chạy — mỗi verdict là một trạng
thái có thể kiểm lại, không có mức nào tên là "có lẽ ổn". COMPLETE là
đích: docs viết rõ, khi mọi sub-feature đã pass gates và story verify
COMPLETE, toàn bộ công việc về một PR sạch. Bốn verdict còn lại là những
cách nói không của hệ thống — và sự tồn tại của chúng quan trọng không kém
COMPLETE: một workflow chỉ có hai trạng thái "xong" và "chưa xong" sẽ chịu
áp lực kéo mọi thứ về "xong". Năm verdict chia độ chưa-xong thành các mức
có thể nói được.

## Rule 0: nhìn thấy rồi mới nói xong

B0 là cổng khó giả mạo nhất, và Rule 0 là nguyên tắc đứng sau nó: verify
browser thật, ba tầng — cấu trúc DOM, screenshot trực quan, đi trọn flow
bằng click. Ba tầng không phải để trông kỹ càng; mỗi tầng bắt một loại lỡ
mà hai tầng kia không thấy. DOM sweep khẳng định cấu trúc đúng; screenshot
cho thấy thứ người dùng thật sự nhìn; flow click-through đi đúng đường
người dùng sẽ đi. Docs kể một case mà chỉ tầng ba bắt được:

> *Ví dụ: một trang docs pass vòng quét DOM nhưng flow check phát hiện
> preview server đang phục vụ nội dung cũ từ tiến trình khác. Phát hiện
> đến từ việc nhìn, không phải từ việc tin các dấu kiểm xanh.*

*Nguồn: `src/content/docs/vi/story-workflow.md` nguyên tắc 3, lấy 2026-09-07.*

Case đáng đọc chậm. Trang thật sự pass DOM sweep — mọi assertion cấu trúc
đều xanh. Lỗi không nằm trong trang; lỗi nằm ở thế giới xung quanh trang:
preview server đang phục vụ một phiên bản cũ từ một tiến trình khác. Hai
tầng đầu không thể nhìn ra, vì chúng kiểm đúng thứ được giao kiểm. Flow
check đi trọn lượt người dùng — và vấp nội dung cũ ngay trên đường. Bài
học của Rule 0 không phải "thêm một tầng test nữa": bằng chứng phải sinh
ra từ việc nhìn sản phẩm vận hành, không phải từ việc đọc báo cáo về sản
phẩm.

Đầy đủ quy trình — từ epic chia sub-feature đến gates và watchdog — nằm
trong docs [story workflow](/vi/docs/story-workflow/). Đội người chạy bên
trong các cổng này là chủ đề của bài
[chín agent, quyền hạn tách rời](/vi/blog/nine-agents-separated-powers/).
Muốn tự thấy gates vận hành: mở Wakii, chạy một story, và đọc verdict ở
tab 🌳 Story.
