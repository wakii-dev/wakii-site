---
title: "Linear là bộ nhớ ngoài của đội agent"
description: "Chat log là dòng thời gian, không phải trạng thái — hết context là agent mất hết. Bài này đi vào cơ chế khiến Linear đóng vai bộ nhớ ngoài của đội agent: body sub-issue theo một khung field chuẩn, state viết ra để tái tạo được, và audit trail đánh dấu chứ không xoá."
pubDate: "2026-08-29"
category: "tutorial"
tags: ["linear", "story-workflow", "workflow"]
draft: false
---

Agent không có trí nhớ giữa các phiên. Hết context window, mọi thứ nó biết về
story nằm lại trong log phiên cũ — agent kế tiếp phải lục lại từ đầu, hoặc tệ
hơn, làm tiếp mà không biết phần trước dừng ở đâu. Chat log không cứu được tình
thế này, vì nó là dòng thời gian chứ không phải trạng thái: đọc được tuần tự,
nhưng không trả lời trực tiếp câu "team đang ở đâu". Wakii chọn lời giải ở tầng
cấu trúc: state của đội agent không nằm trong não agent nào cả — nó nằm ngoài,
trên Linear, nơi mỗi task là một object sống độc lập với phiên đã tạo ra nó.
Bài này đi vào cơ chế đó.

TL;DR:

- Chat log là dòng thời gian: đọc tuần tự được, nhưng không trả lời trực tiếp
  câu "đang ở đâu" — docs nói thẳng tiến độ phải "không chôn trong chat log".
- Linear là bộ nhớ ngoài của đội agent: mỗi task là một object có state, sống
  độc lập với context window của agent nào.
- Body sub-issue theo một khung field chuẩn — Tier, linear, What, Depends on,
  Tasks — giống nhau trên hai dự án, hai repo khác nhau.
- State viết ra phải tái tạo được: body chứa lệnh verify cụ thể (commit, số
  port, bộ test), không phải mô tả suông.
- Audit trail theo luật "đánh dấu, không xoá": kế hoạch bị bỏ vẫn giữ nguyên
  file với nhãn SUPERSEDED và lý do.

## Chat log là dòng thời gian, không phải trạng thái

Mọi thứ trong cuộc chat xếp theo thời gian: tin nhắn sau nằm dưới tin nhắn
trước, ý nghĩa của một dòng phụ thuộc những dòng trước nó. Muốn biết "giờ đang
ở đâu", bạn phải đọc lại từ chỗ câu chuyện bắt đầu — càng muộn tham gia, càng
đọc nhiều. State thì ngược lại: trả lời thẳng hiện tại là gì, không cần biết đã
đi qua mấy vòng. Docs của workflow nói về chỗ state phải nằm bằng đúng sự phân
biệt đó — trích nguyên văn:

> "Plan được bẻ thành task nhỏ và publish lên **Linear** dưới dạng subtask,
> nên tiến độ cả team nhìn thấy — không chôn trong chat log."

*Nguồn: src/content/docs/vi/story-workflow.md, mục "2. Plan", lấy 2026-09-07.*

Cụm "không chôn trong chat log" không phải để chê công cụ chat — nó phân biệt
hai cấu trúc dữ liệu, sinh ra cho hai câu hỏi khác nhau:

```ascii
chat log                              Linear sub-issue
dòng thời gian, chỉ đọc tuần tự       object có state, tra cứu trực tiếp
"đang ở đâu?" → lục lại từ đầu        "đang ở đâu?" → mở issue, đọc state
hết context → mất hết                 đổi phiên → state vẫn nằm ngoài
```

*Nguồn: sơ đồ khái niệm dựng từ câu nguyên văn của docs trích phía trên, lấy
2026-09-07.*

Chat log trả lời câu "chuyện gì đã xảy ra"; state trả lời câu "bây giờ thế
nào". Bộ nhớ của một đội làm việc cần loại thứ hai — vì agent mới, người mới,
hay chính agent cũ sau khi hết context, đều đến câu hỏi thứ hai trước.

## Bộ nhớ ngoài cho đội agent

State nằm ngoài não từng agent thì nằm ở đâu cụ thể? Trong story workflow:
body của sub-issue trên Linear — và không phải dạng ghi chú tự do, mà là một
khung field cố định. Đây là body thật của một sub-issue trong bracket
[fi245-postgres-production](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/fi245-postgres-production.md)
— dự án production chạy trong repo công khai hub-store:

```text
## SF-1 Postgres infra + seed pipeline
Tier: 0
linear: FI-246
What: compose postgres (2 DB qua initdb, healthcheck, volume) + env wiring cho app services + keycloak block + wait-db.sh dùng chung…
Depends on: —
Tasks: compose-postgres / initdb-2-databases / healthcheck-wiring / app-services-env-wiring / keycloak-service-block / wait-db-script / seed-pipeline-script / reset-db-util / … (12 tasks)
```

*Nguồn: github.com/wakii-dev/hub-store —
docs/superpowers/brackets/fi245-postgres-production.md, lấy 2026-09-07. Dòng
Tasks đầy đủ gồm 12 task; khối trên lược tại dấu …*

Từng field trả lời một loại câu hỏi về trạng thái. `Tier: 0` — "khi nào được
bắt đầu": không chờ ai. `linear: FI-246` — nối body về issue thật trên tracker,
nên state trong file và trên bảng không phải hai sự thật. `What` — đích đến của
sub-feature, gồm cả chi tiết kiểu "2 DB qua initdb" mà agent cần trước khi đụng
code. `Depends on: —` — thứ nó đang chờ; ở đây là không có. `Tasks` — mười hai
đơn vị việc, đủ nhỏ để nhận, đủ rõ để kiểm.

Một agent nhận SF-1 này không phải đoán gì từ ngữ cảnh: nó đọc state trực tiếp
từ body. Và khung này không phải quy ước riêng của một dự án: bracket FI-339 —
story đã dựng nền cho chính blog bạn đang đọc, ở một repo khác — dùng cùng các
field Tier, linear, What, Depends on, Tasks, chỉ thêm trường Design. (Bản đồ
tier của hai bracket đã là bài riêng:
[bracket và tier: bản đồ cho dự án dài](/vi/blog/long-tasks-bracket-tiers/) —
ở đây chỉ nói khung field.) Hai dự án, hai repo, hai epic — cùng một khung
state, nên bộ nhớ ngoài đọc được chéo: đọc được một bracket là đọc được bracket
kế tiếp.

## State phải tái tạo được

Cạm bẫy của "bộ nhớ dự án" là thoái hoá thành mô tả: "hạ tầng đã được kiểm
tra", "test đã chạy". Một tuần sau, không ai tái tạo được "đã kiểm tra" nghĩa là
gì — đó là dấu vết, không phải state. Trong workflow, cái viết vào sub-issue
phải đủ cụ thể để chạy lại được. Một body thật từ bracket QA
[fi280-qa-hub-store-regression](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/fi280-qa-hub-store-regression.md)
của hub-store, tiêu đề "SF-1 Baseline + Rubric (Tier 0)", chứa dòng xác minh
boot nguyên văn:

> "Boot-verify full stack main @ d107f2f 7/7 ports; chạy 25 e2e specs baseline
> đỏ/xanh"

*Nguồn: github.com/wakii-dev/hub-store —
docs/superpowers/brackets/fi280-qa-hub-store-regression.md, lấy 2026-09-07.*

Một dòng, bốn dữ kiện kiểm chứng được: commit chính xác (d107f2f), số port phải
sống (7/7), bộ test (25 e2e specs), cách đọc kết quả (đỏ/xanh làm baseline).
Đưa dòng này cho agent mới, nó biết phải boot gì, đợi gì, chạy gì — không hỏi
lại ai. Đó là ranh giới giữa bộ nhớ và mô tả: bộ nhớ cho tái tạo trạng thái;
mô tả chỉ chứng tỏ đã có ai từng nhìn thấy nó.

## Audit comment tái tạo được

Bộ nhớ ngoài còn phải trả lời câu hỏi khó hơn: khi một phần kế hoạch bị bỏ đi
thì sao? Xoá là mất dấu vết — người đến sau thắc mắc "tại sao không có cái
này", hoặc tệ hơn, dựng lại đúng hướng đã bị chứng minh là sai. Workflow chọn
chiều ngược lại: đánh dấu, không xoá. Bracket
[ict-service-support-rebuild](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/ict-service-support-rebuild.md)
trong hub-store đã bị thay thế toàn bộ — file vẫn còn nguyên, mở ra là gặp ngay
hai dòng này:

> "SUPERSEDED 2026-08-31 — GỘP VÀO MỘT STORY: FI-233"
>
> "File này chỉ còn là audit trail (Linear FI-232 Canceled)"

*Nguồn: github.com/wakii-dev/hub-store —
docs/superpowers/brackets/ict-service-support-rebuild.md, lấy 2026-09-07.*

Hai dòng ngắn tái tạo được trọn tình huống: đây từng là kế hoạch của epic
FI-232, đã bị thay bằng FI-233, vào ngày 2026-08-31, và trạng thái trên tracker
bây giờ là Canceled. Nguyên tắc được viết thành lời trong docs — trích nguyên
văn:

> "Không gì bị xóa (mọi thứ đều revert được), điều chưa biết bị cờ lên thay
> vì bịa"

*Nguồn: src/content/docs/vi/story-workflow.md, mục "8. Phòng thủ từ thiết kế",
lấy 2026-09-07.*

Audit trail vì thế không phải hồ sơ chết — nó là state của quá khứ, giữ đúng
định dạng để tra cứu: người đến sau mở file, đọc hai dòng, biết ngay chuyện gì
đã xảy ra và đi tiếp từ FI-233, thay vì khảo cổ từng commit để đoán.

Ghép các mảnh lại: đội agent vận hành như một máy trạng thái, và Linear là nơi
máy đó lưu state — task có trạng thái, body có khung, audit có dấu. Phần cơ chế
còn lại của vòng đời — bracket chia tier, gate B0–B5 chốt chất lượng, watchdog
gọi dậy story stall — nằm ở trang [story workflow](/vi/docs/story-workflow/);
cách các agent chia không gian ghi trên đĩa để chạy song song đã là bài riêng:
[Song song bằng worktree isolation](/vi/blog/parallel-worktrees-isolation/).

Nếu đội bạn đang dùng chat làm bộ nhớ chung, thử đảo chiều: mô tả ý tưởng bằng
một dòng trong Wakii, và để state sống ở nơi nó thuộc về — issue có khung field,
state viết ra để tái tạo, audit trail đánh dấu chứ không xoá. Đến lúc một agent
hết context, bạn mất đúng một context window — không mất câu chuyện.
