---
title: "Skill /frontend-design: taste có nguyên tắc"
description: "Skill /frontend-design biến thẩm mỹ thành chuỗi quyết định có lý do: bám vào thế giới của chủ đề, chọn typography và bảng màu theo brief, và cho phép đúng một rủi ro thẩm mỹ — miễn giải thích được."
pubDate: "2026-09-11"
category: "tech"
tags: ["skills", "design", "workflow"]
draft: false
heroImage: "/blog/heroes/skill-frontend-design.png"
---

Agent dựng UI nhanh: chức năng chạy, responsive có, form validate đủ. Nhưng nếu kết quả nhìn giống một trang đã xem hàng chục lần, vấn đề không còn nằm ở kỹ thuật — nó nằm ở thẩm mỹ. Skill /frontend-design của kit Wakii đảm nhận đúng chỗ đó với một cách tiếp cận khá cứng đầu: thẩm mỹ không phải sở thích, nó là chuỗi quyết định — và mỗi quyết định phải có lý do truy được. Bài này đọc source thật của skill (khoảng 55 dòng) và đối chiếu với một ví dụ đang sống thật: chính site Wakii.

TL;DR:

- Skill tiếp cận mỗi brief như design lead của một studio nhỏ: palette, typography, layout phải cụ thể cho brief này — kèm một rủi ro thẩm mỹ có lý do.
- Sự khác biệt không nằm ở gu cá nhân; nó nằm ở thế giới riêng của chủ đề — vật liệu, công cụ, ngôn ngữ riêng của chủ đề đó.
- Typography và bảng màu được đối xử như quyết định thiết kế thật: hero là luận đề, cấu trúc mã hoá thông tin, trang trí vô việc thì bị cắt.
- Ví dụ cuối bài là direction doc thật của site Wakii ("Modern Bento Premium") và tokens.css — nơi từng token truy được về một quyết định có lý do.

## UI chạy được chưa đủ — nó phải có chủ đích

Agent nhận brief "làm landing page cho X" mà không định hướng thiết kế sẽ đi theo xác suất: bố cục phổ biến nhất, bảng màu an toàn nhất, font quen thuộc nhất — đúng là landing page, nhưng đặt cạnh hai mươi sản phẩm khác, không ai chỉ ra cái nào là của bạn. Skill này mở đầu bằng việc gán vai trước khi cho phép nghĩ về giao diện:

```
Approach this as the design lead at a small studio known for giving
every client a visual identity that could not be mistaken for anyone
else's. This client has already rejected proposals that felt templated,
and is paying for a distinctive point of view: make deliberate,
opinionated choices about palette, typography, and layout that are
specific to this brief, and take one real aesthetic risk you can
justify.
```

*Nguồn: ~/.claude/skills/frontend-design/SKILL.md (đoạn mở đầu), lấy 2026-09-08.*

Ba từ khoá nằm ngay trong đoạn đó: deliberate, opinionated, specific to this brief. Vai design lead không phải để màu mè — nó đổi tiêu chí đánh giá, từ "trang này có chạy được không" sang "trang này có thể bị nhầm với trang nào khác không". Skill cũng tự ghi điều kiện load: dùng khi dựng UI mới hoặc làm lại UI có sẵn — chi phí context chỉ trả đúng lúc cần.

## Bám vào thế giới riêng của chủ đề

Phần "Ground it in the subject" mở bằng một yêu cầu tự vệ: nếu brief không ghim chủ đề, skill phải tự ghim trước — nêu một chủ đề cụ thể, audience, và trang này làm đúng một việc gì — rồi công bố lựa chọn đó. Sau đó mới đến câu định nghĩa sự khác biệt nằm ở đâu:

```
The subject's own world, its materials, instruments, artifacts, and
vernacular, is where distinctive choices come from. Build with the
brief's real content and subject matter throughout.
```

*Nguồn: ~/.claude/skills/frontend-design/SKILL.md (mục Ground it in the subject), lấy 2026-09-08.*

Đây là chỗ skill tách khỏi khái niệm "gu". Gu là thứ bạn mang theo giữa các project — nó giống nhau ở mọi brief. Thế giới của chủ đề thì đổi theo từng brief: trang cho công cụ dòng lệnh có vật chất riêng (terminal, log, monospace), trang cho app di động có riêng cử chỉ và màn hình nhỏ. Chọn màu vì "xanh này thuộc về thế giới của chủ đề" là quyết định có lý do; chọn vì "mình thấy đẹp" là sở thích. Skill chấp nhận loại thứ nhất, cấm loại thứ hai.

## Typography và bảng màu là quyết định, không trang trí

Phần "Design principles" biến tư duy đó thành mệnh lệnh cụ thể. Hero là luận đề của trang: mở bằng thứ đặc trưng nhất trong thế giới của chủ đề — và skill gọi thẳng tên đáp án khuôn mẫu cần né: một con số lớn với nhãn nhỏ, vài stat hỗ trợ, gradient accent. Typography "carries the personality of the page": cặp display/body chọn có chủ đích, type scale rõ ràng, weight và spacing có ý — chữ là phần đáng nhớ của thiết kế, không phải phương tiện trung tính. Cấu trúc là thông tin: đánh số 01/02/03 chỉ hợp lệ khi nội dung thật sự là một chuỗi có trật tự.

Quy trình biến các nguyên tắc ấy thành việc đúng thứ tự — brainstorm một token system trước khi viết dòng code nào:

```
Color     4-6 giá trị hex có tên, mô tả trọn bảng màu
Type      2+ vai: display có cá tính (dùng tiết chế),
          body bổ trợ, utility cho caption/data nếu cần
Layout    một concept, ideate bằng ASCII wireframe để so hướng
Signature MỘT element duy nhất mà trang này sẽ được nhớ vì nó
```

*Nguồn: bảng dựng từ ~/.claude/skills/frontend-design/SKILL.md (mục Process), lấy 2026-09-08.*

Bước kế tiếp mới là phần khó: review plan ngược lại với brief — nếu phần nào đọc lên giống cái bạn sẽ sinh ra cho bất kỳ trang tương tự nào, sửa phần đó và nói rõ đã đổi gì vì sao. Chỉ khi plan qua được bài kiểm tra "không phải mặc định" thì code mới được viết, và từng quyết định màu, chữ phải dẫn ra từ plan.

## Một rủi ro thẩm mỹ, nhưng phải giải thích được

Yêu cầu "một aesthetic risk" đi cùng điều kiện chi tiêu khá chặt:

```
Spend your boldness in one place. Let the signature element be the one
memorable thing, keep everything around it quiet and disciplined, and
cut any decoration that does not serve the brief. Not taking a risk can
be a risk itself! Build to a quality floor without announcing it:
responsive down to mobile, visible keyboard focus, reduced motion
respected.
```

*Nguồn: ~/.claude/skills/frontend-design/SKILL.md (mục Restraint and self-critique), lấy 2026-09-08.*

Đọc kỹ: rủi ro được phép — đúng một — nhưng mọi thứ quanh nó phải yên tĩnh và kỷ luật. Chất lượng cơ bản là sàn chứ không phải điểm nhấn: responsive tới mobile, focus bàn phím nhìn thấy, reduced-motion được tôn trọng — làm mà không cần tuyên bố. Skill còn mượn câu của Chanel: trước khi ra khỏi nhà, nhìn gương và bỏ bớt một phụ kiện. "Có lý do" ở đây nghĩa là: nếu bị hỏi "vì sao chỗ này lệch chuẩn?", câu trả lời phải là một mệnh đề về brief — không phải "vì nhìn đẹp".

## Ví dụ thật: aesthetic direction của chính site Wakii

Quy trình ấy không chỉ nằm trong file skill. Site Wakii đi qua một lần redesign (story FI-349) và để lại đúng loại artifact skill đòi hỏi: một direction doc ghim hướng bằng tên và nguồn gốc quyết định:

```
# SF-1 Design Direction — "Modern Bento Premium"
  (D3 — user chọn 2026-09-04, thay thế v1 Terminal Mono)

> v2 BINDING (2026-09-04): thay thế hoàn toàn v1.
```

*Nguồn: docs/superpowers/designs/sf1-direction.md (header), lấy 2026-09-08.*

Doc đi tiếp bằng bảng token, mỗi giá trị kèm vai trò: JetBrains Mono cho headings và labels, Inter cho body, nền near-black `#0A0E0D`, accent phosphor mint `#45E0A8`. Và một dòng quyết định radius với lý do tường minh:

```
Radius: 8–12px bento cells (vượt v1 0–4px — bento cần mềm hơn), buttons 6px.
```

*Nguồn: docs/superpowers/designs/sf1-direction.md (mục Tokens), lấy 2026-09-08.*

Đây là ví dụ của "một rủi ro có lý do": lệch khỏi phiên bản trước, lý do viết ngay trong ngoặc — bento cần mềm hơn. Quyết định cũng không dừng ở doc: nó được thực thi xuống design system của site. Grep file tokens.css:

```
$ grep -n "radius-cell" src/styles/tokens.css
37:  --radius-cell: 12px; /* bento cells (hand-off: 8–12px) */
```

*Nguồn: grep trên src/styles/tokens.css, lấy 2026-09-08.*

Chuỗi truy hoàn chỉnh: quyết định thẩm mỹ ("bento cần mềm hơn") ghi trong doc, đổ thành con số (8–12px), thực thi thành token (`--radius-cell: 12px`), và mọi bento cell trên site đang render theo token đó. Đó chính là ranh giới giữa taste và sở thích: taste để lại dấu vết truy được từ quyết định xuống giá trị trong code; sở thích thì để lại một màu không ai giải thích nổi vì sao nó ở đó.

/frontend-design là một trong các kỹ năng public của kit Wakii — kit load on-demand, mỗi skill là một file `SKILL.md` mà agent mở đúng lúc cần; toàn bộ catalog được [đi tour trong một bài trước](/vi/blog/skills-catalog-tour/). Vị trí của skill trong đội agent — ai load gì, lúc nào, ai kiểm kết quả — nằm trong trang docs [agents and kit](/vi/docs/agents-and-kit/).

Wakii là agentic IDE với đội superpowers dựng sẵn — skill trong bài đi kèm kit và tự cài vào `~/.claude/` ở lần chạy đầu. Đang có một UI mới cần định hình? Hãy để agent đọc brief theo skill này, rồi chốt hướng thẩm mỹ qua decision gate — [cơ chế gates](/vi/blog/decision-gates-safe-ai-agents/) đã có bài riêng kể phần máy móc bên dưới.
