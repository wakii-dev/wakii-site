---
title: "Done nghĩa là có bằng chứng, không là lời tự báo xong"
description: "Agent báo done nghe rất thuyết phục — và vẫn vỡ ngay lần dùng đầu. Bài này định nghĩa lại chữ done: self-report không counts, một vai verifier độc lập chạy lại từ đầu với rubric đo được rồi mới ra verdict."
pubDate: "2026-08-31"
category: "tech"
tags: ["qa", "evidence", "story-workflow"]
draft: false
---

Một agent làm việc nhanh và báo kết quả còn nhanh hơn: "task xong, đã tự kiểm."
Câu báo cáo nghe rất thuyết phục — cho đến lần đầu tiên bạn tin nó và nhận lại
thứ vỡ ngay khi chạm vào. Lịch sử dự án đầy những task từng được báo "xong" theo
cách đó; chúng có chung một điểm yếu: chữ "done" được đặt bởi chính vai có lợi
ích khi nó xong. Story workflow của Wakii xử lý bằng cách định nghĩa lại chữ đó:
done không phải cảm nhận của người viết, mà là kết luận của một vai khác — chạy
lại từ đầu, với tiêu chí đo được, tự rút verdict. Bài này mổ xẻ định nghĩa đó
qua docs, một rubric thật và một story QA thật.

TL;DR:

- Self-report không counts: executor tự kiểm là cần thiết, nhưng tự báo xong thì
  không ăn.
- Verifier là vai riêng: dựng lại tiêu chí acceptance, chạy từng dòng trên sản
  phẩm thật, tự rút verdict.
- Rubric viết trước khi chạy QA: severity có định nghĩa đo được — verdict là
  phép đối chiếu, không là cảm giác.
- Case thật: QA tier của story FI-342 chạy lại toàn bộ tiêu chí FI-339 — 7/7
  PASS, 0 fix commit, story-verify exit 0.

## Self-report không counts

Bước tự kiểm của executor là bắt buộc — không ai nộp code chưa từng chạy thử —
nhưng nó không đủ để đặt chữ done. Lý do nằm ở cấu trúc, không phải thiện chí:
executor kiểm bằng chính hiểu biết đã sinh ra bug, nên phần mù của nó là phần
không bao giờ được kiểm. Tài liệu agents & kit dành riêng một vai cho việc chấm
xong, và mô tả vai verifier trong đúng một dòng:

> "Verdict pass/fail độc lập cho sản phẩm hoàn thành — tự báo xong thì không ăn"

*Nguồn: src/content/docs/vi/agents-and-kit.md, bảng "Đội 9 agent", lấy
2026-09-07.*

Câu ấy có hai vế, và cả hai đều là yêu cầu kỹ thuật chứ không phải khẩu hiệu.
"Độc lập" nghĩa là vai không trùng với vai implement — không dùng lại kế hoạch
kiểm của người viết. "Tự báo xong thì không ăn" nghĩa là kênh báo cáo của
executor không có quyền ghi vào trạng thái cuối; nó chỉ có quyền đề xuất.
Nguyên tắc tách ba vai trong docs nói thẳng vì sao phải vậy:

> "**developer** implement nhưng không tự duyệt việc mình làm"

*Nguồn: src/content/docs/vi/story-workflow.md, mục "Team model tách bạch ba
vai", lấy 2026-09-07.*

và phần giải thích đi kèm: bug sống sót qua một lượt tự review chính là những
bug người viết không nhìn thấy được. Ba vai trong sơ đồ kiểm của một task vì
thế xếp nhau thế này:

```ascii
executor  ──► "task xong, đã tự kiểm"   ← cần thiết, chưa đủ
reviewer  ──► soi diff theo checklist riêng
verifier  ──► chạy lại tiêu chí acceptance từ đầu
story     ──► Done chỉ sau verdict độc lập + merge
```

*Nguồn: sơ đồ khái niệm dựng theo bảng vai trong
src/content/docs/vi/agents-and-kit.md, lấy 2026-09-07.*

## Verifier làm lại từ đầu

"Độc lập" trong mô tả vai có nghĩa cụ thể: verifier không đọc bản tóm tắt của
executor rồi gật. Nó dựng lại tiêu chí từ plan và phần ACCEPTANCE — bộ tiêu chí
viết ra trước khi có code — rồi tự chạy từng dòng trên sản phẩm thật và ghi kết
quả từng dòng. Điểm bắt đầu của vai này là thứ executor không cung cấp: trạng
thái của phép đo, không phải trạng thái của cảm nhận. Docs story-workflow chốt
lý do bằng một câu:

> "Agent nói nó chạy" không phải bằng chứng; gate đòi bằng chứng.

*Nguồn: src/content/docs/vi/story-workflow.md, mục "3. Gates thay vì niềm tin",
lấy 2026-09-07.*

Cùng trang docs, phần gates của pipeline đi thêm nửa câu ít được đọc kỹ:

> "Gate mà chỉ tự duyệt thì không phải gate; các bước kiểm được thiết kế adversarial từ đầu."

*Nguồn: src/content/docs/vi/story-workflow.md, mục "5. Gates", lấy 2026-09-07.*

Chữ "adversarial" là phần quan trọng: các bước kiểm được viết để bắt sót, không
để xác nhận. Giả định mặc định là người tự kiểm sẽ bỏ lỡ điều gì đó — nên phép
kiểm được thiết kế ngược lại với người đã làm việc.

Cần tách rõ gate này khỏi một loại gate khác cũng trong workflow: decision gate
dừng lại hỏi người một quyết định — cơ chế đó đã có bài riêng
([decision gates: vì sao AI agents của Wakii luôn dừng hỏi](/vi/blog/decision-gates-safe-ai-agents/)).
Gate do-verifier giữ ở đây không hỏi ai cả; nó đối chiếu bằng chứng máy đọc
được: kết quả chạy, số liệu so với rubric, exit code. Người vẫn nắm quyết định
cuối ở bước merge — nhưng thứ họ nhận được là một verdict có thể kiểm lại, thay
vì một lời khẳng định phải tin mù.

## Rubric viết trước, verdict sau

Phép đối chiếu chỉ có nghĩa khi tiêu chí tồn tại trước kết quả. Nếu tiêu chí
viết sau, nó thành tấm lưới đo may theo cái đã bắt được — và "xong" quay lại
thành cảm nhận. Vì thế trong workflow thật, bước QA bắt đầu bằng file rubric,
không phải bằng lệnh test. Rubric QA của một story regression thật trên repo
hub-store mở đầu bằng đúng hai dòng này:

> # QA RUBRIC — hub-store regression story (FI-280)
>
> **GROUND TRUTH cho SF-2..7**

*Nguồn: [docs/superpowers/qa-rubric.md](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/qa-rubric.md)
— github.com/wakii-dev/hub-store, lấy 2026-09-07.*

"Ground truth" là từ khoá: tiêu chí cố định trước, kết quả của mọi SF phía sau
đối chiếu vào đó. Rubric đo được tới mức severity được định nghĩa bằng hệ quả
cụ thể, không bằng cảm giác:

> **P0** — chặn flow chính hoàn toàn (không login được, không tạo order, data mất)

Và nó có luật cho chính quy trình QA: khi phát hiện nhiều hơn mức quy trình chịu
được, lệnh là dừng — không là cố hết sức:

> 1 SF tìm > 8 bug P2 → STOP fix, log hết lên epic + escalate coordinator trước khi fix tiếp

*Nguồn: hai trích trên cùng từ qa-rubric.md —
[github.com/wakii-dev/hub-store](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/qa-rubric.md),
lấy 2026-09-07.*

Với rubric như vậy, chữ "xong" của một SF là kết quả của phép đối chiếu: từng
dòng tiêu chí, từng kết quả, từng mức severity — ai đọc verdict đều có thể mở
rubric và kiểm lại từng ô. Verdict phải trace được về ô rubric của nó; ô chưa có
dữ liệu thì kết luận là chưa verify, không phải là ổn.

## Xong thật trông thế nào

Định nghĩa dễ nói; case thật cho thấy hình dạng của nó. Story FI-339 — story
dựng nền tảng blog bạn đang đọc — kết thúc bằng một tier QA riêng (FI-342), nơi
vai không viết code chạy lại toàn bộ tiêu chí của story. Kết quả:

```ascii
story FI-339 — QA convergence (FI-342)
  tiêu chí đối chiếu : 7/7 criteria PASS
  fix phải làm       : 0 fix commit
  story-verify       : exit 0
```

*Nguồn: Linear FI-342 verdict, trích qua evidence-pack story FI-359, lấy
2026-09-07.*

Ba dòng số nói đúng điều bài này muốn định nghĩa lại. "7/7" nghĩa là từng tiêu
chí viết ra từ đầu story đều được chạy lại và đối chiếu. "0 fix commit" không
nghĩa là "không có gì để kiểm" — nó là kết quả của phép đối chiếu: chạy hết
bảng, không phát hiện ô nào phải sửa. "exit 0" là con số của công cụ, không của
người — story-verify là CLI đọc gates và trả về mã kết thúc, một chữ "xong" mà
script khác cũng đọc được. Đó là dạng duy nhất của chữ done mà workflow chấp
nhận: xong thật trông giống một bảng kết quả, không giống một lời khẳng định tự
tin.

Toàn bộ chuỗi vai — executor, reviewer, verifier — và các gates B0–B5 gắn với
từng bước được tài liệu hoá trên trang
[story workflow](/vi/docs/story-workflow/); bảng vai đầy đủ của đội chín agent
nằm ở [agents & kit](/vi/docs/agents-and-kit/).

Nếu đội bạn đang chạy agent, thử một phép kiểm nhỏ: lấy task "xong" gần nhất và
hỏi xem có vai nào ngoài người viết đã chạy lại nó với tiêu chí được viết ra
trước chưa. Nếu câu trả lời là không, chữ done đó đang đứng trên một lời tự
báo. Quy trình của Wakii là một tham chiếu để so — tải Wakii, mở story workflow,
và bắt đầu yêu cầu bằng chứng thay vì báo cáo.
