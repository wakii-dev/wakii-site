---
title: "Skill /mock-prototype: prototype trước một dòng code"
description: "Ba hướng HTML tự chứa, đăng thành link mở thẳng trong browser, bạn chọn một hướng rồi mới hoàn thiện — mock không vào codebase, thứ sang bên build là direction doc."
pubDate: "2026-09-13"
category: "tech"
tags: ["skills", "design", "workflow"]
draft: false
heroImage: "/blog/heroes/skill-mock-prototype.png"
---

Bạn mô tả trang landing mơ hồ bằng một câu: "tối giản, hiện đại, có chất terminal". Agent build thật đẹp, bạn mở lên nhìn và biết ngay: không phải cái này. Vấn đề không nằm ở chỗ agent build tệ — nằm ở chỗ một quyết định thị giác vừa được chốt bằng lời, mà lời thì mỗi người hiểu một kiểu. Skill /mock-prototype trong kit của Wakii dời điểm chốt đó về trước: thay vì chọn từ mô tả, bạn chọn từ ba thứ nhìn được — trước khi một dòng code production nào tồn tại.

TL;DR:

- /mock-prototype biến một ý tưởng UI thành ba hướng prototype HTML tự chứa, khác biệt thật — không phải ba biến thể màu.
- Mỗi hướng được đăng thành một link unlisted, mở thẳng trong browser, không cần file trên máy bạn.
- Bạn chọn A/B/C — skill bị cấm tự chọn hộ và cấm trộn ba hướng làm một.
- Thứ đi tiếp sang code thật không phải diff của mock, mà là một direction doc: tokens, cấu trúc, behavior, out-of-scope.
- Quy trình này có artifact thật ngay trong repo của site bạn đang đọc — hai direction doc từ story trước.

## Mô tả bằng lời thua nhìn bằng mắt

Một câu mô tả UI nén một không gian quyết định rất lớn vào vài từ. "Hiện đại" có ít nhất chục cách hiểu thị giác; "chất terminal" thì mỗi người hình dung một kiểu. Giao tiếp bằng lời ổn ở chỗ truyền ý định, nhưng tệ ở chỗ chốt hình ảnh — và UI là chuyện hình ảnh. Nên bước đầu tiên của skill không phải vẽ, mà là hỏi: tối đa ba câu, gom một lượt — mục tiêu, đối tượng, cảm xúc mong muốn, kích thước (web hay pixel nào?). Câu quy tắc trong source đặt đúng trọng tâm: "Chưa rõ thì hỏi — KHÔNG tự đoán taste."

Vì sao ba hướng chứ không phải một? Một mock duy nhất vẫn đẩy bạn vào lựa chọn nhị phân: duyệt, hoặc làm lại từ đầu. Ba hướng khác biệt thật biến việc quyết thành một phép so sánh — bạn thấy ranh giới giữa các hướng, và chỉ tay vào một. Source yêu cầu rõ mức khác biệt đó: "mỗi hướng khác biệt thật (không phải 3 biến thể màu)".

Hai cách chốt một quyết định thị giác, đặt cạnh nhau:

```ascii
chốt bằng lời:  ý tưởng → mô tả → build → "không phải ý tôi" → build lại
chốt bằng mắt:  ý tưởng → 3 hướng HTML → bạn chỉ tay → build đúng 1 hướng
```

*Nguồn: ~/.claude/skills/mock-prototype/SKILL.md (bước 1 CLARIFY + yêu cầu 3 hướng), lấy 2026-09-08.*

## Pipeline: ba file HTML, ba link, một lựa chọn

Pipeline đầy đủ gồm năm bước, mỗi bước có quy tắc cứng; bước một là CLARIFY ở trên. Bước hai, skill gọi huashu-design dựng ba hướng — mỗi hướng một file HTML tự chứa: single-file, assets base64 inline, không phụ thuộc ngoài ngoài CDN font nếu cần, đặt tại `docs/superpowers/prototypes/<slug>/{a,b,c}.html`. Single-file là yêu cầu kỹ thuật của artifact share, không phải để đẹp: "Single-file HTML bắt buộc cho artifact share (assets base64 inline — artifacts render từ cloud, file rời sẽ vỡ)."

Bước ba, đăng từng hướng lên artifact share bằng ba lệnh riêng:

```bash
orca artifacts share docs/superpowers/prototypes/<slug>/a.html --json
orca artifacts share docs/superpowers/prototypes/<slug>/b.html --json
orca artifacts share docs/superpowers/prototypes/<slug>/c.html --json
```

*Nguồn: ~/.claude/skills/mock-prototype/SKILL.md (bước 3), lấy 2026-09-08.*

Mỗi lệnh trả về một URL — đó là "link unlisted" mà bài này nhắc: trang hosted mở trực tiếp trong browser, không cần clone repo, không cần mở file local. Unlisted ≠ private — ai có link đều xem được, nên source có quy tắc đi kèm: không share nội bộ nhạy cảm.

Bước bốn là gate: trình ba link kèm mô tả một dòng mỗi hướng, theo đúng khuôn trong source:

```
3 hướng prototype:
  A: <link-a> — <concept ngắn>
  B: <link-b> — <concept ngắn>
  C: <link-c> — <concept ngắn>
Chọn hướng (A/B/C) hoặc yêu cầu đổi gì?
```

Hai câu ngay dưới khuôn đó được in đậm trong source: "KHÔNG tự chọn. KHÔNG merge 3 thành 1." Agent không được chọn hộ bạn, và không được trộn "lấy cái này của A cộng cái kia của B" — vì kết quả trộn không còn là thứ bạn đã nhìn lúc chọn.

Vì sao pipeline không đụng repo app? Cả ba file nằm ở `docs/superpowers/prototypes/` — tài liệu, không phải source; lệnh share đưa bản copy lên cloud artifacts, cây source của app không đổi byte nào.

## Zero code production: biên giữa mock và app thật

Mock dừng lại ở một biên được vẽ từ trước, và thứ duy nhất đi qua biên là một spec. Sau khi bạn chọn, skill hoàn thiện hướng đó, đăng lại artifact cuối và viết hand-off: file `docs/superpowers/designs/<slug>-direction.md` — tokens / structure / behavior / out-of-scope — kèm link artifact cuối. Câu báo hoàn thành trong source: "DIRECTION-FINAL: <link> — hand-off tại <path>".

Việc tách biên có lý do kỹ thuật, không phải nghi lễ. Prototype tối ưu cho tốc độ bị đánh giá: nó được phép bỏ i18n, bỏ responsive, bỏ accessibility, bỏ data thật. App thật tối ưu cho cái ngược lại. Nếu mock vào codebase dạng diff, mọi quyết định bỏ qua của prototype trở thành nợ kỹ thuật ngay từ ngày đầu. Vì thế hand-off là spec, không phải diff: người build đọc direction doc rồi implement chuẩn production, không copy-paste cái đã được phép cẩu thả.

Và gate cuối không bỏ được, kể cả khi agent chạy autonomous: "User gate không bỏ kể cả autonomous mode (đúng designer protocol)". Agent có thể tự chủ mọi đoạn khác của pipeline; đúng điểm cần mắt người thì dừng.

```ascii
docs/superpowers/prototypes/<slug>/{a,b,c}.html   (mock — nằm ngoài src/)
        │  user chọn 1 hướng → hoàn thiện hướng đó
        ▼
docs/superpowers/designs/<slug>-direction.md      (hand-off = spec)
   tokens · structure · behavior · out-of-scope
        │
        ▼
build app thật — code production bắt đầu từ đây
```

*Nguồn: ~/.claude/skills/mock-prototype/SKILL.md (bước 5 + mục Quy tắc), lấy 2026-09-08.*

## Direction doc: quy trình cùng họ đã chạy trong repo này

Nói đúng phạm vi của bằng chứng: /mock-prototype là skill gói pipeline "ba hướng draft → user chọn → direction doc chốt → build theo doc" thành một quy trình gọi được bằng một lệnh. Còn các direction doc trong repo của site này là artifact của quy trình cùng họ, chạy trong story trước — không phải kết quả của việc gọi skill này. Điểm chung nằm ở cấu trúc artifact, và cấu trúc đó đọc được nguyên văn.

File `sf1-direction.md` — direction của redesign landing — mở đầu bằng:

```
# SF-1 Design Direction — "Modern Bento Premium"
  (D3 — user chọn 2026-09-04, thay thế v1 Terminal Mono)

> v2 BINDING (2026-09-04): thay thế hoàn toàn v1. Nguồn duyệt:
> docs/superpowers/designs/direction-d3-bento.html (implement theo
> file này + file nguồn, không tự biến đổi hướng).
```

*Nguồn: docs/superpowers/designs/sf1-direction.md, lấy 2026-09-08.*

Một direction doc đã chốt có đúng ba thứ bạn thấy ở đó: hướng nào thắng (D3, chọn ngày 2026-09-04), nguồn duyệt là một file HTML nhìn được chứ không phải một đoạn chat, và người implement bị trói tay ("không tự biến đổi hướng"). Section "Cấm" cuối file liệt kê cả thứ không được xuất hiện: "Gradient tím/xanh AI-slop, glow bóng đổ lớn, stock illustration, emoji UI" — một hand-off spec không chỉ nói làm gì, mà cả đừng làm gì.

Direction doc thứ hai, `sf-downloads-direction.md` của trang downloads, ghi điều đó rõ ngay dòng đầu: "USER-PICK-APPROVED 2026-09-04 (chat: "a" → đổi sang "b")". Người dùng chọn a rồi đổi sang b — gate hoạt động thật nghĩa là được phép đổi ý, và quy trình ghi lại vết thay đổi thay vì xoá nó. Cùng dòng đó có "Source of truth visual: /tmp/story/fi300/design/sf-dl-b.html (tham chiếu — /tmp không sống theo repo, hand-off này là binding)": file HTML được chọn vẫn là nguồn thật cho phần thị giác, doc là nguồn ràng buộc cho phần build.

*Nguồn: docs/superpowers/designs/sf-downloads-direction.md, lấy 2026-09-08.*

mock-prototype là một trong 13 skill public của kit — kit có 20 tổng / 13 public, tại thời điểm viết, 2026-09-08. Cơ chế kit và cách cài vào ~/.claude/ có bảng đầy đủ trong [tài liệu agents-and-kit](/vi/docs/agents-and-kit/). Muốn bức tranh toàn cảnh trước khi mở từng cuốn, bài [tour kỹ năng public](/vi/blog/skills-catalog-tour/) đi qua cả ba nhóm skill. Còn khi hướng đã được chọn và đến lúc build thật, việc chuyển sang skill khác trong cùng nhóm design: [frontend-design](/vi/blog/skill-frontend-design/) giữ phần taste có nguyên tắc phía code production.

Wakii là IDE agentic với đội superpowers dựng sẵn — pipeline ba hướng là một kỹ năng agent load khi bạn nói "làm mock cho tôi". Tải Wakii, mô tả ý tưởng, và lần này hãy để mắt chọn trước khi bàn phím bắt đầu.
