---
title: "Skill /figma-orientation: đọc Figma như agent"
description: "Router skill đọc ý định Figma trước khi agent gọi tool: lỗi kinh điển nó chặn, cây quyết định nó đi, và những trường hợp project không cần tới nó."
pubDate: "2026-09-14"
category: "tech"
tags: ["skills", "design"]
draft: false
---

Agent có trong tay tool Figma không có nghĩa là agent biết bắt đầu từ đâu. Trước khi vẽ được node đầu tiên, nó phải trả lời một câu hỏi thấp hơn: tác vụ này thuộc loại nào — đọc canvas, ghi canvas, dịch design thành code, hay dựng diagram? Chọn sai loại là gọi sai tool, và một số cú gọi sai không báo lỗi tại chỗ mà để lại hậu quả khó truy về sau. Skill `/figma-orientation` trong kit Wakii được viết cho đúng khoảnh khắc đó: một lớp mỏng đứng trước tác vụ Figma, đọc ý định, rồi mới trỏ đường.

TL;DR:

- `/figma-orientation` là router skill: không làm việc thay, chỉ map ý định của bạn tới đúng skill Figma chính thức hoặc lệnh MCP gọi trực tiếp.
- Nó chặn một failure class có tên: gọi `use_figma` khi chưa load `figma-use` — tài liệu của router gọi đây là lỗi khó debug số một.
- Cơ chế định tuyến là một cây 10 câu hỏi, kèm bảng các thao tác đọc gọi trực tiếp không cần skill.
- Ở tầm workflow, Principle 8 của `orca-superpowers-workflow` mở pipeline Figma bằng chính router này khi description chứa URL figma.com.
- Bài cũng nói chiều ngược lại: khi project không đi qua Figma — như chính site bạn đang đọc — router nằm im; bài chỉ rõ điều kiện kích hoạt thay vì kể chuyện dùng.

## Lỗi kinh điển: gọi tool khi chưa biết đường

Bộ tool Figma MCP có hai lớp dễ lẫn cho người mới: tool gọi thẳng (`use_figma`, `generate_diagram`) và skill đồng hành (`figma-use`, `figma-generate-diagram`) nạp ngữ cảnh điều khiển trước khi gọi. Lỗi kinh điển là nhảy qua lớp hai. Router tự khai lý do tồn tại ngay ở frontmatter — nó được viết để ngăn "calling use_figma without figma-use (common hard-to-debug failure)".

Khó debug vì sao? Vì cú gọi vẫn chạy, canvas vẫn thay đổi. Lỗi không nằm ở dòng gọi, mà nằm ở phần kiến thức điều khiển lẽ ra được nạp trước đó; tới lúc phát hiện thì canvas đã lệch và lịch sử chỉnh sửa đã dài. Mục "Hard rules" của router gọi thẳng tên ba cú gọi cấm:

```text
1. `use_figma` REQUIRES `figma-use` loaded first. No exceptions.
   This is the #1 Figma failure mode.
2. `generate_diagram` REQUIRES `figma-generate-diagram` loaded first.
   Routes to type-specific guidance.
3. Do NOT call write tools (use_figma, create_new_file, upload_assets)
   without confirming target file + scope with the user — writes are
   visible to teammates and hard to undo silently.
```

*Nguồn: ~/.claude/skills/figma-orientation/SKILL.md, mục "Hard rules", lấy 2026-09-08.*

Quy tắc 3 mở rộng phạm vi của pattern. Không chỉ đúng skill, mà đúng trình tự xin phép: ghi lên canvas là hành động đồng đội của bạn nhìn thấy, nên "confirm target file + scope với user" được viết thành hard rule chứ không phải lịch sự. Router không làm gì cả ngoài việc nhắc ba dòng đó trước khi tay đã đặt lên nút.

## Router đọc ý định trước, tool gọi sau

Toàn bộ cơ chế định tuyến nằm gọn trong một cây quyết định 10 câu hỏi (Q1–Q10), mỗi câu bám một loại ý định. Q1: tác vụ có phải ghi canvas — tạo, sửa node, tokens, component? Có: load `figma-use` trước, rồi mới gọi `use_figma`; và theo loại việc, router ghép thêm skill dạy "cái gì" — `figma-generate-design` khi dịch một trang app thành layout Figma, `figma-generate-library` khi dựng design system, `figma-use-figjam` cho FigJam. Q2: FIGMA → CODE, tức implement một design thành code? → `figma-implement-design`. Q3: chiều ngược lại, CODE → FIGMA? → `figma-generate-design` + `figma-use`. Q4: diagram kiến trúc, ERD, flowchart? → `figma-generate-diagram`. Cứ vậy tới Code Connect, SwiftUI, motion, slides.

Rồi một lớp thứ ba người mới hay bỏ qua: thao tác đọc không cần skill nào. `whoami`, `get_metadata`, `get_design_context` — cái sau được router gọi là "primary design-read tool" — cùng `get_screenshot` và `get_variable_defs` (đọc design tokens trả về dạng CSS variables) gọi trực tiếp, an toàn vì không chạm write-path. "Đường" trong bài này vì thế gồm ba làn: skill bắt buộc, skill ghép thêm, và tool đọc tự do. Thẻ tóm tắt của router vẽ đúng ba làn đó:

```text
READ Figma         → get_metadata / get_design_context / get_screenshot  (no skill)
WRITE Figma canvas → figma-use  (MANDATORY)  [+ figma-generate-* for composed tasks]
FIGMA → CODE       → figma-implement-design  [+ image-to-code for elite quality]
CODE → FIGMA       → figma-generate-design  + figma-use
DIAGRAM            → figma-generate-diagram  (MANDATORY before generate_diagram)
```

*Nguồn: ~/.claude/skills/figma-orientation/SKILL.md, mục "Quick reference card" (trích 5/12 dòng), lấy 2026-09-08.*

Dòng đáng chú ý với team frontend: `[+ image-to-code for elite quality]`. Router biết kit của bạn có gì, và ở nhánh FIGMA → CODE nó ghép chéo sang một skill khác của chính kit — bài [image-to-code](/vi/blog/skill-image-to-code/) đi sâu nửa đó.

## Vì sao một lớp định hướng mỏng đáng có

Chi phí của cú gọi sai không nằm ở một lần retry. Router dành hẳn một mục "Common confusions" cho các trực giác sai lặp lại — hai hàng trong đó nói đúng hai giống lỗi:

```text
"I'll just call use_figma to read this node"
  → Use get_design_context or get_metadata directly — no skill needed for reads
"I want to push my React component to Figma"
  → That's CODE→FIGMA → figma-generate-design (+ figma-use),
    NOT figma-implement-design (that's the other direction).
```

*Nguồn: ~/.claude/skills/figma-orientation/SKILL.md, mục "Common confusions" (trích 2/5 hàng), lấy 2026-09-08.*

Giống thứ nhất là sai làn: đọc node mà đòi đường write — tốn một lượt gọi thừa và hình thành thói quen đi qua write-path khi không cần. Giống thứ hai là sai chiều: `figma-implement-design` và `figma-generate-design` cùng dịch giữa design và code nhưng ngược hướng nhau; gọi nhầm thì agent chạy trọn một quy trình cho đúng động từ, sai phương hướng. Cả hai giống đều không crash — chúng trôi êm, và bạn trả giá ở bước review.

Nâng lên tầm workflow, "đi qua router" ở đây không còn là khẩu vị cá nhân. Principle 8 của `orca-superpowers-workflow` viết nó thành điều kiện bắt đầu pipeline:

```text
## Principle 8: Figma Pipeline (auto-triggers khi description chứa figma.com URL)

Kích hoạt: description có `figma.com/(design|file|proto|board)/` URL
HOẶC bracket ghi `Design: figma`. Bắt đầu bằng `figma-orientation` (router).
```

*Nguồn: ~/.claude/skills/orca-superpowers-workflow/SKILL.md, Principle 8 "Figma Pipeline", lấy 2026-09-08.*

Chính principle này ghi lại hoá đơn của một story trả giá thật: trước khi gộp thành một pipeline, Figma vào story qua bảy mảnh rải rác — review bằng mắt agent, diff số liệu mù, capture để nơi chết theo session — và kết quả là "app khớp text-spec mà SAI design: thiếu sidebar 48px + header + row 80px". Một lớp mỏng đứng trước không làm việc thay tầng dưới; nó làm cho tầng dưới không phải làm lại từ đầu vì đi nhầm làn từ giây thứ nhất.

## Khi nào router lên sân khấu — và khi nào project không cần nó

Điều kiện kích hoạt viết rõ như trích ở trên: description chứa URL `figma.com/(design|file|proto|board)/`, hoặc bracket ghi `Design: figma`. Không có một trong hai, pipeline Figma không chạy — và router không được gọi. Đây là bản chất của skill loại reference: nó sống theo điều kiện, không sống theo mặc định.

Và sự thật từ chính repo bạn đang đọc: site này chưa đi qua Figma lần nào. Toàn bộ design direction — từ đợt redesign Bento tới trang downloads — nằm trong `docs/superpowers/designs/` dưới dạng file HTML và markdown:

```text
$ ls docs/superpowers/designs/
direction-a.html            direction-b.html           direction-c.html
direction-c1-tilt.html      direction-c2-scene.html    direction-c3-webgl.html
direction-d1-cinematic.html direction-d2-tour.html     direction-d3-bento.html
fi349-sf3-direction.md      sf-downloads-direction.md  sf1-direction.md
```

*Nguồn: ls docs/superpowers/designs/ (repo wakii-site), lấy 2026-09-08.*

Vì thế bài này khẳng định thẳng: chưa có story nào của site này chạy `/figma-orientation`, và bài không bịa kịch bản dùng. Điều bài giữ lại là điều kiện kích hoạt. Khi team design bắt đầu giao file Figma, khi URL figma.com xuất hiện trong description — đúng lúc đó, lượt thao tác đầu tiên của agent không phải `use_figma` hay `get_screenshot`, mà là mở router. Prototype bằng HTML là một đường hợp lệ khác; router nằm im cho tới khi Figma thật sự vào vòng đời, và đó là lý do nó thuộc nhóm reference chứ không phải workflow.

`/figma-orientation` nằm trong nhóm reference của kit — cùng nhóm với `graph-engineering` và `prompt-master`, ba trong số 13 kỹ năng public tại thời điểm viết, 2026-09-08 (nguồn: `src/data/skills.ts`). Muốn nhìn cả kệ trước khi mở từng cuốn, bài [tour kỹ năng public](/vi/blog/skills-catalog-tour/) đi qua trang `/skills/` và file dữ liệu sinh ra nó. Đội agent nào load những skill này và kit cài vào máy thế nào nằm trong [agents-and-kit](/vi/docs/agents-and-kit/).

Wakii là IDE agentic với kit superpowers dựng sẵn — tải về, và để agent mở đúng cuốn sách trước khi chạy theo nó.
