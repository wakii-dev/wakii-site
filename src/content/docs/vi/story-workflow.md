---
title: Story workflow
description: Từ một dòng idea đến PR đã merge — impact analysis, planning, sub-feature song song, gates, watchdog, và triết lý đứng sau tất cả.
order: 2
---

Story workflow của Wakii biến một dòng mô tả feature thành code đã merge,
đã verify — với đội agent làm việc và các gates giữ cho họ trung thực.

## Pipeline

```
idea → impact → plan → epic + SF bracket → parallel SFs → gates → 1 PR per story
```

### 1. Idea → impact analysis

Bạn mô tả feature. Một **phase-0 impact analyst** vẽ sơ đồ blast radius
trước: touch map, hệ quả cấp hai trên nhiều chiều, và các phương án —
trước khi có bất kỳ code nào.

### 2. Plan

Plan được bẻ thành task nhỏ và publish lên **Linear** dưới dạng subtask,
nên tiến độ cả team nhìn thấy — không chôn trong chat log.

### 3. Epic + SF bracket

Feature lớn thành một **story**: một epic với các sub-feature (SF) sắp
theo tier phụ thuộc. Bracket canvas trong [Superpowers panel](/vi/docs/superpowers-panel/)
vẽ đồ thị này trực tiếp — epic trên đỉnh, các tier bên dưới, cạnh thể hiện
quan hệ phụ thuộc.

### 4. Thực thi song song

Các sub-feature độc lập chạy **song song**, mỗi cái một worktree và branch
riêng biệt. Một dev executor implement từng task; reviewer soi diff trước
khi task được tính là xong.

### 5. Gates

Mỗi sub-feature phải pass các [Story Ops gates](/vi/docs/superpowers-panel/#story-ops-gates)
(B0–B5): code + tests xanh, plan tick đủ, review độc lập, đã merge, issue
Done — và một lượt đi thật trên browser để xem kết quả. Gate mà chỉ tự
duyệt thì không phải gate; các bước kiểm được thiết kế adversarial từ đầu.

### 6. Watchdog

Story hay stall — agent gặp ngõ cụt, review loop mãi, merge conflict.
**Watchdog** phát hiện sub-feature bị stall và tự resume từ trạng thái
tốt cuối cùng, nên story dài không cần ai ngồi canh.

### 7. Một PR cho mỗi story

Khi mọi sub-feature đã pass gates và story verify `COMPLETE`, toàn bộ công
việc về **một PR sạch** — không phải chục branch cài răng lược.

## Triết lý

Pipeline ở trên là cơ chế. Tám nguyên tắc dưới đây là lý do nó được xây
như vậy — đó mới là điều story workflow thực sự muốn nói.

### 1. Phân tích một lần, kế thừa mãi

Phân tích sâu tốn kém, nên nó chạy đúng một lần — ở cấp epic. Mọi
sub-feature kế thừa kết quả qua **context pack**: quyết định design, số
liệu inventory, ranh giới. Sub-feature chỉ chạy plan → execute → verify;
không bao giờ re-analyze và không hỏi lại câu đã có lời đáp. *Ví dụ:
story tài liệu này kế thừa toàn bộ design từ story landing — không vòng
designer lặp lại, không tranh luận lại font hay tokens. Trang docs chỉ
cần đọc design document binding và build theo nó.*

### 2. Team model tách bạch ba vai

Ba vai trò, cố tình tách rời: **PM** điều phối và viết spec nhưng không
bao giờ code; **developer** implement nhưng không tự duyệt việc mình làm;
**tester** chỉ săn lỗi nhưng không fix. Developer tự review code mình là
mâu thuẫn lợi ích — bug sống sót chính là những bug nó không nhìn thấy.
*Ví dụ: khi executor báo một task đã xong, code reviewer riêng biệt vẫn
bắt được một rule scoped-style chết và một lỗi escape mà executor đã tự
đạt qua. Mắt khác, phát hiện khác.*

### 3. Gates thay vì niềm tin

Năm gates tool-enforced chạy trên mọi sub-feature — preflight, diff
review, test, environment snapshot, post-merge — cộng **Rule 0**: verify
browser thật ba tầng (cấu trúc DOM, screenshot trực quan, đi trọn flow
bằng click). "Agent nói nó chạy" không phải bằng chứng; gate đòi bằng
chứng. Nếu gate không thỏa được, câu trả lời trung thực là "tôi không
verify được điều này" — không bao giờ là lượt pass lặng lẽ. *Ví dụ: một
trang docs pass vòng quét DOM nhưng flow check phát hiện preview server
đang phục vụ nội dung cũ từ tiến trình khác. Phát hiện đến từ việc nhìn,
không phải từ việc tin các dấu kiểm xanh.*

### 4. Human gates — người nắm thứ không hoàn tác được

Quyết định kiến trúc và việc merge về branch thật là **human gates**.
Agents đưa nhánh đích đến trạng thái sạch, đã verify — một PR cho mỗi
story — rồi DỪNG. Không gì không hoàn tác được xảy ra khi chưa có người
gật đầu. *Ví dụ: sau khi mọi gate sub-feature pass, nhánh story nằm sẵn
ở trạng thái chờ; merge vào mainline và mô tả PR là của bạn để duyệt,
không phải của máy.*

### 5. Tier và một nhánh đích duy nhất

Độ sâu phụ thuộc được hiện thức hóa thành **tier**: một sub-feature chỉ
bắt đầu khi mọi thứ ở tier trước đã merge. Mỗi biên tier là một điểm
merge vào một nhánh đích duy nhất — `story/<epic>-<slug>` — đóng vai
mainline riêng của story. Tính song song không bao giờ đồng nghĩa lịch sử
phân tán; tích hợp diễn ra liên tục tại các điểm đã biết. *Ví dụ: một
story website chạy các sub-feature landing, docs, QA — docs xây trên
design tokens của landing nên nằm thấp hơn một tier và merge sau, không
phải song song.*

### 6. Watchdog: idle không đồng nghĩa chết

Agent im lặng chưa chắc đã kẹt — có thể nó đang chạy một bản build dài.
**Watchdog** kiểm tra ba tầng (commit gần đây, trạng thái terminal, tiến
độ Linear) trước khi kết luận stall, và việc phục hồi nghĩa là *đánh thức
bằng input*, không phải khởi động lại và mất công. Từ đó nó chạy vòng
self-check không giới hạn tới khi story verify hoàn tất. *Thực tế: một
sub-feature im lặng trong bản build native dài đã được để yên; một cái
thật sự kẹt ở gate fail đã được resume từ commit tốt cuối cùng thay vì
từ đầu.*

### 7. Bộ nhớ và vòng học hỏi

Mỗi task kết thúc bằng **post-task ritual** có chủ đích: gì đã sai, cái
gì đã fix được, pattern nào nên giữ. Bài học được lưu vào story memory
kèm nguồn gốc — task nào, fix nào — nên sub-feature kế tiếp khởi động
thông minh hơn thay vì dẫm lại cùng một cái bẫy. *Ví dụ: story đầu tiên
học được rằng một CLI flag đã bị đổi tên giữa chừng release; ghi chú đó
cứu mọi story sau khỏi vấp lại.*

### 8. Phòng thủ từ thiết kế

Workflow giả định **chính nó sẽ là người mắc lỗi** — nên nó làm cho việc
sai trở nên rẻ và dễ quan sát. Không gì bị xóa (mọi thứ đều revert
được), điều chưa biết bị cờ lên thay vì bịa, và lệnh mới phải dry-test
trước khi được tin ("tài liệu nói nó chạy" ≠ "nó chạy"). *Ví dụ: khi
merge conflict xuất hiện trong một file notes chung, lời giải giữ cả hai
bên thay vì bỏ một bên — cái giá của việc đoán sai dòng nào quan trọng
đắt hơn việc giữ cả hai.*

### Case study: chính story này

Tài liệu bạn đang đọc được xây bởi chính chủ đề của nó. Story FI-289
(website Wakii) đã đi qua mọi nguyên tắc ở trên:

- **Rework có kiểm soát** — design trực quan đổi giữa chừng (direction
  v1 → Bento Premium v2). Thay vì vá lên trên, sub-feature revert về
  trạng thái tốt cuối và thực thi lại theo design binding mới — rework
  được review như một đơn vị sạch.
- **Watchdog đúng nghĩa** — khi một sub-feature stall, watchdog phát
  hiện qua kiểm tra ba tầng và tự điều phối phần việc còn lại mà không
  cần con người can thiệp.
- **Reviewer bắt thứ executor bỏ lỡ** — review độc lập tìm ra các lỗi P0
  thật (style chết, lỗi escape) *trước khi* merge — đúng mode thất bại
  mà nguyên tắc 2 tồn tại để chặn.
- **Gates thay vì dấu kiểm xanh** — trang getting-started không được viết
  từ tưởng tượng: từng bước được thực thi trong bản clone sạch của repo —
  install, build, launch, mở panel — và tài liệu mô tả những gì thực sự
  xảy ra, gồm một bước build bị giới hạn môi trường được báo thẳng thắn
  thay vì bàn tay che.

## Mọi thứ nằm ở đâu

- Launch và theo dõi run ở tab ⚡ Workflow.
- Xem bracket, gates, và watchdog ở tab 🌳 Story.
- Đội 9 agent đứng sau được giới thiệu ở [Agents & kit](/vi/docs/agents-and-kit/).
