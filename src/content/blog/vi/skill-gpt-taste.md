---
title: "Skill /gpt-taste: phá mặc định thống kê của AI"
description: "Vì sao UI do AI dựng nhìn như nhau: heading 6 dòng, layout trái-phải lặp, meta-label rẻ tiền. Skill /gpt-taste phá các mặc định thống kê đó bằng randomization có script và bộ luật cứng kiểm được."
pubDate: "2026-09-11"
category: "tech"
tags: ["skills", "design"]
draft: false
---

Cho ba agent cùng dựng một landing page, bạn nhận lại ba trang nhìn như một. Không phải chúng trùng ý tưởng — chúng trùng thiên kiến: heading dài sáu dòng nằm chật trong container hẹp, bố cục trái-phải lặp hết trang này sang trang khác, nhãn kiểu "SECTION 01" mọc dưới từng section. Đó không phải gu thẩm mỹ kém; đó là mặc định thống kê của mô hình ngôn ngữ. Trong kit của Wakii có một skill dựng riêng để chống lại chính xác điều đó: /gpt-taste — và bài này đọc source của nó để xem nó cấm gì, cũng như nó được lên sân khấu lúc nào.

TL;DR:

- UI do AI sinh ra giống nhau vì năm thiên kiến thống kê mà chính skill tự gọi tên ngay phần mở đầu: heading 6 dòng, bento hở ô, meta-label rẻ tiền, chữ button tàng hình, layout trái-phải lặp.
- /gpt-taste phá bằng randomization có ràng buộc: trước dòng UI code đầu tiên, agent phải mô phỏng script Python để chọn layout, font, component, animation từ menu đóng — rồi bám theo đúng kết quả.
- Bộ luật cứng, kiểm bằng mắt được: H1 tối đa 2-3 dòng, bento không ô chết, meta-label cấm hẳn, section lớn cách nhau bằng padding `py-32`.
- Skill này không load lúc dựng mock ban đầu: trong story workflow của kit, nó giữ đúng một slot — F8 UX review (P8.6), sau khi implementation đã tồn tại.

## Nhìn ba trang AI dựng: vì sao chúng giống nhau

Một mô hình ngôn ngữ sinh văn bản bằng xác suất: đoạn tiếp theo là đoạn hay xuất hiện nhất sau các đoạn trước. Yêu cầu "dựng landing page" cho ra hình dạng trung bình của xác suất — và chính skill gọi thẳng tên hình dạng đó ngay dòng đầu:

```
Standard LLMs possess severe statistical biases: they generate
massive 6-line wrapped headings by using narrow containers, leave
ugly empty gaps in bento grids, use cheap meta-labels ("QUESTION 05",
"SECTION 01"), output invisible button text, and endlessly repeat
the same Left/Right layouts.
```

*Nguồn: ~/.claude/skills/gpt-taste/SKILL.md (mục CORE DIRECTIVE), lấy 2026-09-08.*

Năm bias, đếm đủ: heading 6 dòng do container hẹp; bento grid hở ô chết; meta-label kiểu "QUESTION 05", "SECTION 01"; chữ button không đủ tương phản để đọc; layout trái-phải lặp vô tận. Chi tiết đáng chú ý là thứ tự: skill gọi tên kẻ thù trước khi dạy luật đầu tiên — bias là mặc định, và một lời kêu "hãy sáng tạo" không đủ thắng xác suất. Muốn thắng, phải đưa việc chọn ra khỏi tay của xác suất; đó là việc của mục sau.

## Randomization thật, không phải random cảm tính

Mục 1 của skill chẩn đoán đúng chỗ gãy của các lời khuyên "be creative":

```
## 1. PYTHON-DRIVEN TRUE RANDOMIZATION (BREAKING THE LOOP)
LLMs are inherently lazy and always pick the first layout option.
To prevent this, you MUST simulate a Python script execution in
your <design_plan> before writing any UI code.
```

*Nguồn: ~/.claude/skills/gpt-taste/SKILL.md (mục 1), lấy 2026-09-08.*

Cơ chế: trước dòng UI code đầu tiên, agent bắt buộc mô phỏng một script Python trong khối `<design_plan>`; seed là deterministic — số ký tự của prompt đem chia lấy dư — để mô phỏng `random.choice()` rút từ menu đóng:

```
<design_plan> — bắt buộc trước dòng UI code đầu tiên

seed = độ dài prompt → phép chia lấy dư   (deterministic, không cảm tính)
chọn 1 hero layout      trong 3           (mục 3 của skill)
chọn 1 typography stack trong 4            (Satoshi, Cabinet Grotesk,
                                            Outfit, Geist — Inter nằm ngoài menu)
chọn 3 component        từ arsenal 4 món   (mục 6)
chọn 2 GSAP paradigm    trong 5 kỹ thuật   (mục 5)
```

*Nguồn: ~/.claude/skills/gpt-taste/SKILL.md (mục 1, 3, 5, 6), lấy 2026-09-08.*

Ba điểm làm chỗ này khác một câu thần chú "đổi đi cho khác". Một: selection đến từ menu đóng — rút thăm trong danh sách đã tuyển. Hai: luật chống lặp — "You are forbidden from defaulting to the same UI twice". Ba: phép random có biên bản — `<design_plan>` phải in ba dòng mock Python output làm bằng chứng, và agent bám theo đúng kết quả; random cho có rồi vẫn dùng layout quen là vi phạm chính luật vừa đặt. Seed deterministic còn một hệ quả phụ: cùng prompt cho cùng selection — mục đích không phải quay số, mà là buộc lựa chọn thoát khỏi "option đầu tiên" mà model chọn theo lười.

## Những luật cứng: cấu trúc, typography, bento, motion

Nửa còn lại của file là các luật enforcing. Tóm lược theo đúng thứ tự mục trong source:

| Luật | Nội dung | Nơi quy định |
|---|---|---|
| Cấu trúc AIDA | nav → Attention (hero) → Interest (bento) → Desire (GSAP) → Action (footer) | mục 2 |
| Spacing | `py-32 md:py-48` giữa các section lớn — mỗi section là một chương riêng | mục 2 |
| H1 hai dòng | H1 không quá 2-3 dòng; 4, 5, 6 dòng là "catastrophic failure"; container `max-w-5xl` / `max-w-6xl` | mục 3 |
| Hero sạch | cấm stamp/badge icon nổi trên chữ, pill-tag dưới hero, số liệu thô trong hero | mục 3 |
| Bento khít mép | `grid-flow-dense` bắt buộc; chứng minh toán học col-span/row-span khít, không ô chết | mục 4 |
| Tiết chế card | 3-5 card có chủ đích tốt hơn 8 card lộn xộn | mục 4 |
| Motion nghiêm ngặt | GSAP thật: pin section, image scale 0.8→1.0, scrub chữ 0.1→1.0, card stacking | mục 5 |
| Cấm meta-label | "SECTION 01", "QUESTION 05", "ABOUT US" — "BANNED FOREVER" | mục 7 |
| Pre-flight | khối `<design_plan>` 5 mục kiểm trước khi xuất code | mục 8 |

*Nguồn: ~/.claude/skills/gpt-taste/SKILL.md (mục 2-8), lấy 2026-09-08.*

Đặc điểm chung của bảng: mỗi luật đi kèm cách verify. "Không ô chết" là phép cộng col-span/row-span phải khít từng ô, không phải cảm nhận. "H1 hai dòng" là phép đo container, không phải khẩu vị. Mục 8 khóa cuối: pre-flight `<design_plan>` bắt buộc năm mục kiểm — Python RNG, AIDA check, hero math, bento density, label sweep cùng button contrast — xong đủ năm, code mới được xuất.

Tư duy "thẩm mỹ thành ràng buộc có số đo" này không xa lạ với chính site bạn đang đọc: direction thẩm mỹ của landing Wakii, chọn trong redesign FI-349, ghi thông số grid và spacing thành con số cứng:

```
# SF-1 Design Direction — "Modern Bento Premium" (D3 — user chọn 2026-09-04)

Structure (landing — bento bất đối xứng 12-col theo direction-d3-bento.html)
Spacing nhịp 8px; section padding 96–128px; bento gap 16–20px.
```

*Nguồn: docs/superpowers/designs/sf1-direction.md, lấy 2026-09-08.*

Bento bất đối xứng 12 cột, gap 16-20px, section padding 96-128px — giống /gpt-taste ở một điểm cốt lõi: thẩm mỹ được viết thành thông số kiểm được, không phải cảm hứng tra hỏi sau.

## Khi nào skill này lên sân khấu

Biết nó cấm gì mới là một nửa; nửa còn lại là nó chạy lúc nào. Câu trả lời nằm trong quy trình story của kit: grep tên gpt-taste trong file orca-superpowers-workflow — tài liệu pipeline của kit — tên này chỉ hiện ở hai chỗ. Chỗ thứ nhất là slot F8, UX review (P8.6):

```
- **F8. UX review (P8.6)** — 3 lớp chạy như TASK trong plan (không phải
  gợi ý), so implementation lại Intent:
  · `web-design-guidelines` — 105 rules cụ thể trên CODE (a11y/focus/
    forms/animation/keyboard) — bắt lỗi ảnh không thấy được
  · `gpt-taste` + `design-taste-frontend` — thẩm mỹ + anti-slop
  · `frontend-design` — chủ đích: signature, copy-as-design, calibration
    chống 3 "AI default looks"
```

*Nguồn: ~/.claude/skills/orca-superpowers-workflow/SKILL.md (mục F8. UX review — P8.6), lấy 2026-09-08.*

Chỗ thứ hai là một ghi chú xếp nó vào nhóm skill conditional: nếu thiếu, workflow vẫn hoàn thành — flag phần kiểm bị bỏ qua thay vì dừng cả story. Cả hai chỗ cùng nói một thứ tự: UX review chạy sau implement — skill không load lúc dựng mock ban đầu. Bộ luật anti-slop chỉ có đối tượng để soi khi đã có một implementation cụ thể; cùng triết lý với lớp web-design-guidelines ngay trên — một lớp kiểm code, một lớp soi thẩm mỹ, đều cần thứ đã dựng xong để kiểm.

Dùng kit ngoài story workflow, thời điểm tương đương là: trang đã dựng xong và bạn muốn nó thoát khỏi vẻ ngoài mặc định của AI, hoặc muốn một anti-slop review trước khi ship. Lúc ý tưởng còn ở mức khung, các skill khác trong nhóm design lo phần của họ — bản đồ ngắn của cả catalog nằm trong bài [tour kỹ năng public của Wakii](/vi/blog/skills-catalog-tour/), còn pha trước code là chủ đề của [skill /brainstorm: từ ý tưởng thô tới spec đã kiểm chứng](/vi/blog/skill-brainstorm/).

gpt-taste là một trong sáu skill nhóm design public của kit — 20 skill tổng, 13 public, tại thời điểm viết (2026-09-08). Agent nào load skill nào ở pha nào, kể cả slot UX review ở trên, mô tả đủ trong [agents and kit](/vi/docs/agents-and-kit/).

Wakii là agentic IDE với bộ superpowers dựng sẵn. Tải về, chạy một story có UX review, và mở nguyên văn bộ luật trên — source skill là file text, không ai giấu bạn nổi.
