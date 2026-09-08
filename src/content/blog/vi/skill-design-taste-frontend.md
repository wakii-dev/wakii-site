---
title: "Skill /design-taste-frontend: soi UI đã build trước khi ship"
description: "Skill audit-first chỉ load sau khi UI đã build: đọc brief suy ý định trước, soi các dấu hiệu slop bằng danh mục có tên, rồi chặn ở pre-flight trước khi ship."
pubDate: "2026-09-12"
category: "tech"
tags: ["skills", "design"]
draft: false
---

UI xấu nhất không lộ diện lúc đang mock. Lúc đó mọi hướng còn mở, chưa cái nào đáng tiếc. UI xấu lộ diện ở bước cuối: trang đã build xong, tests xanh, và ai đó nhìn thấy hàng ba card y hệt, tiêu đề to như hét, tên khách hàng trong testimonial là "John Doe". `/design-taste-frontend` sinh ra cho đúng thời điểm đó: một skill audit-first trong kit design của Wakii, không tham gia lúc dựng, chỉ lên sân khấu khi trang đã tồn tại và cần bị soi.

TL;DR:

- Skill khai báo điều kiện load ngay trong frontmatter: chỉ load khi UX review sau implement (slot P8.6) hoặc user gọi "anti-slop review"; không load khi build hay mocking ban đầu.
- Trước khi phán xét UI, skill đọc brief: đọc 6 nhóm tín hiệu rồi phát một dòng "Design Read" khai rõ cách hiểu trang, không đoán mò.
- Slop được đặt tên: ba card bằng nhau, số liệu giả hoàn hảo, fake dashboard dựng bằng div, em-dash — mỗi dấu hiệu là một mục cấm trong source.
- Cửa cuối là FINAL PRE-FLIGHT CHECK: 62 ô kiểm; thiếu một ô là trang chưa xong.

## Hai thời điểm của thẩm mỹ: lúc mock và khi đã build

Trong nhóm design của kit, mỗi skill nhận một thời điểm. Lúc chọn hướng trước khi có code, việc thuộc về mock-prototype: dựng prototype HTML để bạn duyệt. Lúc build mới từ trang trắng, việc thuộc về frontend-design: định hình UI có chủ đích ngay từ đầu. `/design-taste-frontend` nhận phần còn lại của vòng đời: trang đã dựng xong rồi, giờ soi nó. Sự phân ca này không phải quy ước văn hóa mà là contract kỹ thuật, viết thẳng vào frontmatter của skill:

```
description: Anti-slop frontend review — LOAD ONLY khi story-workflow Principle 8 bước 6 (UX review sau implement) hoặc user nói "anti-slop review", "design review sau khi làm". KHÔNG load cho việc build/mocking ban đầu (dùng huashu/mock-prototype cho việc đó). Audit-first trên redesigns đã build, strict pre-flight check trước ship.
```

*Nguồn: ~/.claude/skills/design-taste-frontend/SKILL.md (frontmatter), lấy 2026-09-08.*

Contract đó có địa chỉ trả về. File SKILL.md của skill workflow trong kit (`orca-superpowers-workflow`) chứa đúng slot mà frontmatter nhắc tới: F8 trong Principle 8, xếp ở bước 6, tức sau khi implement xong:

```
- **F8. UX review (P8.6)** — 3 lớp chạy như TASK trong plan (không phải
  gợi ý), so implementation lại Intent:
  · `web-design-guidelines` — 105 rules cụ thể trên CODE (a11y/focus/
    forms/animation/keyboard) — bắt lỗi ảnh không thấy được
  · `gpt-taste` + `design-taste-frontend` — thẩm mỹ + anti-slop
  · `frontend-design` — chủ đích: signature, copy-as-design, calibration
    chống 3 "AI default looks"
```

*Nguồn: ~/.claude/skills/orca-superpowers-workflow/SKILL.md, lấy 2026-09-08.*

Chi tiết đáng chú ý nhất nằm ở dòng đầu: UX review "chạy như TASK trong plan (không phải gợi ý)". Đó là vòng review có chỗ trong kế hoạch, có chủ, có kết quả phải nộp — không phải lời khuyên thẩm mỹ lúc agent rảnh. Story redesign blog của site này chạy đúng trật tự hai thời điểm đó: hướng thiết kế được chốt trước bằng một direction doc (`docs/superpowers/designs/sf1-direction.md`, còn nguyên trong repo), code dựng theo hướng đã chốt, và lớp audit thẩm mỹ chỉ được load ở vòng review sau build — đúng như chữ LOAD ONLY trong contract. Mock chọn hướng; audit bắt slop. Hai việc, hai thời điểm, không trộn.

## Đọc brief trước khi soi UI

Section đầu tiên của skill không phải danh mục slop, mà là đọc ngữ cảnh. Nó mở đầu bằng một nhận định thẳng về nguồn gốc UI xấu:

```
Before touching code or tweaking dials, **infer what the user actually wants**. Most LLM design output is bad because the model jumps to a default aesthetic instead of reading the room.
```

*Nguồn: ~/.claude/skills/design-taste-frontend/SKILL.md §0, lấy 2026-09-08.*

Trước khi soi, skill đọc 6 nhóm tín hiệu: loại trang (landing, portfolio, redesign, editorial), từ khóa vibe user dùng, tham chiếu user nêu ra (URL, screenshot, sản phẩm), audience, brand assets đã có sẵn, và các ràng buộc thầm như accessibility-first hay public-sector. Sau đó phát đúng một dòng "Design Read" theo format cố định:

```
Before any code, state in one line: **"Reading this as: \<page kind> for \<audience>, with a \<vibe> language, leaning toward \<design system or aesthetic family>."**
```

*Nguồn: ~/.claude/skills/design-taste-frontend/SKILL.md §0.B, lấy 2026-09-08.*

Ví dụ trong source, một dòng đọc hết cách hiểu cả trang:

```
- *"Reading this as: B2B SaaS landing for technical buyers, with a Linear-style minimalist language, leaning toward Tailwind utilities + Geist + restrained motion."*
```

*Nguồn: ~/.claude/skills/design-taste-frontend/SKILL.md §0.B (example reads), lấy 2026-09-08.*

Với một vòng audit, thứ tự đó quyết định chất lượng phán xét. Một trang tối, dày đặc, chuyển động nhiều có thể là đúng với brief "premium consumer" mà sai với brief "trust-first public-sector" — hai brief này nằm ở hai hàng khác nhau trong bảng dials của skill. Soi UI mà không có brief trong đầu thì soi sai chỗ: thứ trông an toàn với một audience là thứ nhàm chán với audience khác. Luật xử lý mơ hồ cũng rõ: nếu design read thật sự phân vân, hỏi đúng một câu, không dồn nhiều câu; còn nếu đủ tự tin suy từ ngữ cảnh thì không hỏi.

## Slop nhìn như thế nào: những dấu hiệu có tên

Section 9 của skill mang tiêu đề "AI TELLS (Forbidden Patterns)" — các chữ ký của UI do LLM sinh ra, chia thành 7 nhóm từ 9.A (visual/CSS) đến 9.G (em-dash). Nguyên tắc của cả section gói trong một câu: "Avoid these signatures unless the brief explicitly asks for them." Bốn mục đại diện, trích nguyên văn:

```
* **NO 3-column equal feature cards.** The generic "three identical cards horizontally" feature row is banned. Use 2-column zig-zag, asymmetric grid, scroll-pinned, or horizontal-scroll alternative.

* **NO fake-perfect numbers.** Avoid `99.99%`, `50%`, `1234567`. Use organic, messy data (`47.2%`, `+1 (312) 847-1928`).

* **NO div-based fake product UI in the hero** (fake task list, fake terminal, fake dashboard built from styled divs). It is the #1 LLM-design Tell. Use a real screenshot, a generated image, a real component preview, or none at all.
```

*Nguồn: ~/.claude/skills/design-taste-frontend/SKILL.md §9.C, §9.D, §9.F, lấy 2026-09-08.*

Rồi mục bị coi là vi phạm nhiều nhất, được hẳn một section riêng mang tên "EM-DASH BAN (the single most-violated Tell)":

```
**Em-dash (`—`) is COMPLETELY banned.** It is the LLM's signature stylistic crutch and it is the #1 visual Tell in production tests. There is no "limited use" allowance, no "natural language frequency" allowance, no "in body copy is fine" allowance. None.
```

*Nguồn: ~/.claude/skills/design-taste-frontend/SKILL.md §9.G, lấy 2026-09-08.*

Điểm chung của các mục này: đều kiểm được trong vài giây, bằng mắt thường hoặc bằng một lệnh grep. Đếm số card trong một hàng; nhìn số liệu trong dashboard có quá hoàn hảo không; hỏi xem hero đang chứa sản phẩm thật hay một cái dashboard giả dựng từ các thẻ div; đếm ký tự em-dash. Đó là lựa chọn thiết kế của chính skill: thẩm mỹ không giữ dạng cảm nhận "thấy chưa đúng mà nói không ra lời", mà được dịch thành các dấu hiệu có tên — để agent chạy lại được cùng một phép kiểm, không phụ thuộc người có gu ngồi cạnh.

Cũng cần đọc đúng phạm vi: đây là các tell của bản UI đã dựng. Câu nguyên tắc trích ở trên mở ngoại lệ rõ ràng — nếu brief của user thật sự yêu cầu (một trang cố ý brutalist, ví dụ), các mục được phép mở.

## Pre-flight: 62 ô kiểm ở cửa cuối

Cuối file, sau 15 section đánh số từ 0 đến 14 trong hơn 1.200 dòng (wc -l và đếm section trên file nguồn, lấy 2026-09-08), là Section 14: "FINAL PRE-FLIGHT CHECK" — ma trận 62 ô kiểm (đếm dòng `- [ ]` trong section, lấy 2026-09-08) chạy trước khi giao code. Hai câu viền section định mức độ của nó:

```
**THIS IS NOT OPTIONAL. Run every box. If any box fails, the output is not done.**
```

*Nguồn: ~/.claude/skills/design-taste-frontend/SKILL.md §14 (mở đầu), lấy 2026-09-08.*

```
If a single checkbox cannot be honestly ticked, the page is not done. Fix it before delivering.
```

*Nguồn: ~/.claude/skills/design-taste-frontend/SKILL.md §14 (kết section), lấy 2026-09-08.*

Ba ô ví dụ, thấy ngay tính chất máy móc của phép kiểm:

```
- [ ] **ZERO em-dashes (`—`) anywhere on the page.** Headlines, eyebrows, pills, body, quotes, attribution, captions, buttons, alt text. Zero. (Section 9.G - non-negotiable.)
- [ ] **EYEBROW COUNT (mechanical)**: count instances of `uppercase tracking` micro-labels above section headlines across all components. Count ≤ ceil(sectionCount / 3)? Hero counts as 1.
- [ ] **No Duplicate CTA Intent**: no two CTAs with the same intent ("Get in touch" + "Let's talk" both on page = Fail)?
```

*Nguồn: ~/.claude/skills/design-taste-frontend/SKILL.md §14, lấy 2026-09-08.*

Đọc ba ô trên và bản chất của pre-flight hiện ra: hầu hết là phép đếm hoặc phép so. Đếm micro-label theo số section; so chữ CTA với nền theo chuẩn tương phản WCAG AA 4.5:1; kiểm tra nhãn nút có xuống hai dòng ở desktop hay không. Skill dịch phần thẩm mỹ có thể kiểm thành 62 phép kiểm mà một agent chạy lại được, kết quả đúng sai không phải bàn cãi. Phần không đếm được thì skill không giả vờ đếm được: dòng cuối của section đẩy trách nhiệm về tính trung thực — tick được hay không là do người chạy tự hỏi lại từng ô, và câu trả lời dối ở một ô thì cả trang tính là chưa xong.

Đó cũng là cách đọc câu "máy kiểm được, mắt thẩm mỹ là chuyện khác" cho đúng: skill không thay mắt người. Nó hạ phần tranh cãi xuống những con số chạy lại được, để mắt người giữ lại cho quyết định thật.

Kit design của Wakii gồm sáu skill phủ hết vòng đời UI, và bài này chỉ mở một cuốn trong kệ. Bài [tour kỹ năng public](/vi/blog/skills-catalog-tour/) đi qua cả catalog; riêng bước diễn ra trước audit — hỏi ý định trước khi build — bài [skill /brainstorm](/vi/blog/skill-brainstorm/) kể từ đầu câu chuyện. Muốn đọc vị đội agent load những skill này, trang docs [agents and kit](/vi/docs/agents-and-kit/) liệt kê đủ.

Mọi skill public trong kit là một file SKILL.md nằm trong repo MIT `github.com/wakii-dev/wakii`, kể cả file hơn 1.200 dòng đã trích trong bài này. Tải Wakii, để agent build xong trang của bạn, rồi đọc nguyên tắc soi của skill trước khi nhấn ship.
