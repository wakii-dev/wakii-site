---
title: "Skill /web-design-guidelines: bộ quy tắc web trong tầm tay"
description: "Review UI code qua 105 quy tắc cụ thể — focus, aria, form, animation: những lỗi mà ảnh chụp không thấy được. Rules vendored từ upstream MIT, chạy offline, output là danh sách file:line."
pubDate: "2026-09-13"
category: "tech"
tags: ["skills", "design"]
draft: false
---

Một trang UI đẹp trong ảnh vẫn có thể sai ở những chỗ camera không chụp được. Focus ring đã bị xoá bằng `outline: none`? Ảnh không thấy, vì ảnh không có focus. Nút icon thiếu `aria-label`? Ảnh vẫn nguyên. Animation trang trí chạy mãi không tắt theo `prefers-reduced-motion`? Ảnh là một khung hình tĩnh. `/web-design-guidelines` — một skill trong nhóm design của kit Wakii — được dựng cho đúng lớp lỗi đó: review code UI qua một danh sách quy tắc cụ thể, mỗi rule kiểm được bằng code, không cần cảm nhận.

TL;DR:

- Skill review UI code qua 105 quy tắc cụ thể (con số kit khai trong SKILL.md): accessibility, focus, forms, animation, keyboard, typography, performance.
- Rules vendored nguyên vẹn từ dự án mở vercel-labs/web-interface-guidelines (MIT) vào thư mục `resources/` của skill — chạy offline, không phụ thuộc mạng.
- Mỗi rule là một dòng kiểm được ngay trên code; đầu ra chuẩn hoá thành danh sách `file:line`, bấm nhảy được trong editor, không phải đoạn văn cảm tính.
- Trong story workflow, nó là một lớp của UX review (P8.6): chạy song song với capture chuẩn và ảnh đối chiếu — "bắt lỗi ảnh không thấy được".

## Ảnh chụp không thấy: focus, aria, reduced motion

Review UI theo thói quen là nhìn ảnh. Ảnh trả lời tốt câu hỏi bố cục: card có đều không, khoảng cách có thở không, màu có đúng brief không. Nhưng lớp lỗi đắt nhất của UI web lại thuộc loại không hiện trong khung hình. Focus ring chỉ xuất hiện khi có bàn phím; screen reader đọc nhãn từ aria attribute chứ không đọc từ pixel; người dùng tắt chuyển động trong cài đặt hệ điều hành thì animation của trang có tôn trọng hay không là chuyện code quyết định. So ảnh hai bên kỹ đến mấy cũng không bắt được lớp này, vì trong ảnh không có bàn phím, không có screen reader, không có cài đặt reduce motion.

Skill tự định nghĩa vai trò của mình đúng ở chỗ đó, ngay trong section "Khi nào chạy":

```
- **F7 visual review** (code-reviewer): sau khi so ảnh 2 bên, chạy rules
  này trên code của screens — bắt lỗi ảnh không thấy (aria, focus, forms,
  keyboard, reduced-motion).
```

*Nguồn: ~/.claude/skills/web-design-guidelines/SKILL.md, lấy 2026-09-08.*

Đọc dòng đó từ cuối lên: aria, focus, forms, keyboard, reduced-motion — năm thứ đều sống trong code chứ không sống trong pixel. "Sau khi so ảnh 2 bên" cũng là một mệnh đề có chủ đích: rules không thay bước nhìn, nó đi sau bước nhìn và soi phần mà bước nhìn không với tới.

## Bộ rules từ đâu tới: vendored từ upstream, chạy offline

Skill không tự chế quy tắc. Toàn bộ rules được vendored nguyên vẹn từ dự án mở vercel-labs/web-interface-guidelines của Vercel — giấy phép MIT, kèm file license upstream ngay trong thư mục:

```
~/.claude/skills/web-design-guidelines/
├── SKILL.md                        # hợp đồng: khi nào chạy, chạy thế nào
└── resources/
    ├── LICENSE-upstream            # MIT, © 2025 Vercel Labs
    └── web-interface-guidelines.md # bản rules vendored — file agent đọc khi review
```

*Nguồn: ls ~/.claude/skills/web-design-guidelines/, lấy 2026-09-08.*

Nguồn gốc được skill ghi rõ ngay trong file, cùng ngày nhập kho:

```
- Upstream: github.com/vercel-labs/web-interface-guidelines (MIT, © 2025
  Vercel Labs) — vendored nguyên vẹn tại `resources/` kèm LICENSE-upstream.
- Vendored vào story-team-kit 2026-08-28 làm engine cho P8 F7/F8.
```

*Nguồn: ~/.claude/skills/web-design-guidelines/SKILL.md §Provenance, lấy 2026-09-08.*

Điểm của vendoring là review không phụ thuộc mạng. SKILL.md viết thẳng điều kiện đó khi mô tả bước đọc rules: "vendored — luôn sẵn, không phụ thuộc mạng; bài học SSL-filter: không fetch bắt buộc". Upstream vẫn chuyển động theo phía Vercel; bản trong máy chụp nguyên một trạng thái, nên review hôm nay và review ba tháng sau đọc cùng một bộ rules. Muốn cập nhật là hành động chủ đích: diff với upstream, rồi ghi ngày thay đổi vào NOTICE — không phải một request mạng âm thầm xảy ra giữa lúc review.

Con số: hai file trong kit cùng gọi bộ rules này là 105. Frontmatter của skill khai "105 concrete Web Interface Guidelines rules"; workflow gọi nó là "105 rules cụ thể trên CODE". Cả bộ xếp trong 17 nhóm chủ đề, đếm được bằng một lệnh:

```bash
$ grep -c '^### ' ~/.claude/skills/web-design-guidelines/resources/web-interface-guidelines.md
17
```

*Nguồn: grep trên resources/web-interface-guidelines.md, lấy 2026-09-08.*

Mười bảy nhóm đi từ Accessibility, Focus States, Forms, Animation, Typography, Performance, Navigation & State, Dark Mode & Theming, cho đến một nhóm đặc biệt tên đúng tính chất của nó: Anti-patterns — các dấu hiệu cần flag ngay khi thấy.

## Đọc một rule: một dòng, kiểm được ngay

Đặc điểm chung của cả bộ: rule viết như chỉ dẫn kiểm, không như nguyên tắc thẩm mỹ. Năm rule đại diện, trích nguyên văn:

```
- Icon-only buttons need `aria-label`
- Interactive elements need visible focus: `focus-visible:ring-*` or equivalent
- Honor `prefers-reduced-motion` (provide reduced variant or disable)
- Use correct `type` (`email`, `tel`, `url`, `number`) and `inputmode`
- Destructive actions need confirmation modal or undo window—never immediate
```

*Nguồn: ~/.claude/skills/web-design-guidelines/resources/web-interface-guidelines.md (§Accessibility, §Focus States, §Animation, §Forms, §Navigation & State), lấy 2026-09-08.*

Mỗi dòng quy về một phép kiểm cụ thể trên code: nút icon có `aria-label` chưa; trạng thái focus có ring nhìn thấy được qua `focus-visible` không; animation có biến thể reduced hay bị tắt hẳn không; input email có đúng `type="email"` kèm `inputmode` cho bàn phím điện thoại không; nút xoá có modal xác nhận hoặc cửa sổ undo hay nhấn một phát là mất. Cách viết đó là lựa chọn có chủ đích của upstream — cả file tối ưu cho việc "check against rules below" từng dòng, như dòng dẫn của chính file ghi.

Đầu ra cũng được chuẩn hoá sẵn trong file rules, theo format `file:line` bấm nhảy được trong VS Code:

```text
## src/Button.tsx

src/Button.tsx:42 - icon button missing aria-label
src/Button.tsx:18 - input lacks label
src/Button.tsx:55 - animation missing prefers-reduced-motion
src/Button.tsx:67 - transition: all → list properties

## src/Card.tsx

✓ pass
```

*Nguồn: ~/.claude/skills/web-design-guidelines/resources/web-interface-guidelines.md §Output Format, lấy 2026-09-08.*

Một finding một dòng, gọn đến mức hy sinh ngữ pháp — "sacrifice grammar for brevity", đúng chữ file dạy. Agent phân loại tiếp: P1 cho a11y blocker, focus thiếu, form sai type; P2 cho phần nice-to-have. Kết quả là một danh sách việc có toạ độ, không phải một đoạn nhận xét phải dịch ngược thành việc.

## Slot trong review: chạy song song với ảnh, không thay thế

Trong story workflow của kit, skill này có chỗ đứng được ghi tên. UX review — bước 6 của Principle 8, chạy sau khi implement xong như một task trong plan — gồm ba lớp, và web-design-guidelines đứng ở lớp kiểm code:

```
  · `web-design-guidelines` — 105 rules cụ thể trên CODE (a11y/focus/
    forms/animation/keyboard) — bắt lỗi ảnh không thấy được
```

*Nguồn: ~/.claude/skills/orca-superpowers-workflow/SKILL.md (F8. UX review), lấy 2026-09-08.*

Chữ "bắt lỗi ảnh không thấy được" là định nghĩa công việc, không phải khẩu hiệu. Hai chữ quan trọng nhất của skill lại nằm ở câu mở đầu: "Dùng cùng (không thay thế) capture chuẩn + ảnh đối chiếu."

```
Đây là lớp HEURISTICS cụ thể cho review UI: mỗi rule kiểm được bằng code,
không cần cảm nhận. Dùng cùng (không thay thế) capture chuẩn + ảnh đối chiếu.
```

*Nguồn: ~/.claude/skills/web-design-guidelines/SKILL.md (câu mở đầu), lấy 2026-09-08.*

Chạy cùng, không thay thế — đó là phân công lao động trong một vòng review. Rule không biết bố cục có cân bằng hay màu có đúng brief; ảnh đối chiếu trả lời câu đó. Ngược lại, ảnh không biết nút icon thiếu label. Lớp thẩm mỹ có ngữ cảnh là việc của các skill khác trong cùng slot: gpt-taste và design-taste-frontend lo thẩm mỹ và chống slop — trong đó design-taste-frontend đọc brief suy ý định rồi mới phán xét; frontend-design lo chủ đích khi build mới. Ba lớp có ba câu hỏi khác nhau: nhìn có đúng không, thẩm mỹ có thoát mẫu máy không, code có sai không — và skill này giữ câu thứ ba.

Ba điều một skill review nên có: nguyên văn đọc được, chạy được offline, kết quả kiểm lại được. web-design-guidelines đáp ứng cả ba — rules là file trong máy, nguồn gốc ghi trong Provenance, mỗi finding có `file:line`. Bản đồ cả catalog nằm trong bài [tour kỹ năng public của Wakii](/vi/blog/skills-catalog-tour/); lớp phán xét thẩm mỹ có ngữ cảnh kể ở bài [skill /design-taste-frontend](/vi/blog/skill-design-taste-frontend/). Muốn đọc vị đội agent load những skill này lúc nào, trang docs [agents and kit](/vi/docs/agents-and-kit/) liệt kê đủ.

Kit nằm ở repo public MIT `github.com/wakii-dev/wakii` — cả SKILL.md lẫn file rules vendored đọc được nguyên văn. Tải Wakii, để agent build UI của bạn, rồi đọc bộ quy tắc đó trước khi nhấn ship: đó là những lỗi mà ảnh chụp không thấy được, giờ có một lớp review chuyên nhiệm.
