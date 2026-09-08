---
title: "Skill /image-to-code: từ ảnh chụp tới component"
description: "Đọc ảnh tham chiếu như art director: một ảnh lớn cho một section, trích hierarchy – spacing – tokens, rồi code bám ảnh làm chuẩn đối chiếu — kèm biên khi nào không dùng skill này."
pubDate: "2026-09-12"
category: "tech"
tags: ["skills", "design", "features"]
draft: false
---

Bạn có một ảnh thiết kế đẹp — một hero, một form, một card pricing — và muốn nó thành component thật. Cách mặc định của AI là nhìn lướt ảnh rồi code theo trí nhớ về "trang web đẹp", và kết quả thường trượt về một mẫu quen thuộc: gradient tím, card lồng trong card, khoảng cách dồn cục — đúng danh sách "slop" mà skill trong bài này lập ra để chống. `image-to-code` trong kit của Wakii đảo thứ tự đó: ảnh là nguồn, code là bản dịch. Bài này đọc skill như một tài liệu nghề, trích đúng những luật nó lập ra, rồi vẽ ranh giới của nó.

TL;DR:

- `image-to-code` thuộc nhóm design của kit: load đúng khi component phải build mới từ ảnh hoặc design reference — không phải trợ lý UI chạy nền.
- Ảnh đáng đưa cho skill là ảnh lớn của một section, sạch; board nguyên trang thu nhỏ tới mức chữ không đọc được thì không.
- Skill đọc ảnh như art director: hierarchy, spacing, typography, màu — phân tích có luật, cấm phân tích kiểu "vibe".
- Ảnh là fidelity target: code bám ảnh, không bám trí tưởng tượng của model.
- Biên rõ: mock ban đầu, audit sau build, layout tổng là đường của skill khác; repo này còn chạy cả chiều ngược — code sinh ảnh.

## Một ảnh lớn, một section — không phải board nguyên trang

Thứ nhất skill lập ra là đơn vị của ảnh. Trong môi trường có image generation, nó bắt buộc sinh ảnh tham chiếu trước khi viết code — và sinh đủ: một section là một ảnh chính, section phức tạp thêm ảnh detail, section chưa rõ thì sinh lại thành ảnh mới sạch hơn. Luật gốc viết thẳng:

```
- it is better to generate too many clear images than too few compressed images
- it is better to generate one clear image per section than one unreadable board for the whole site
- it is better to create an extra detail image than to guess details later
```

*Nguồn: ~/.claude/skills/image-to-code/SKILL.md, §3 "Generate enough images rule", lấy 2026-09-08.*

Lý do nằm ở độ phân giải phân tích: board ghép nhiều section vào một ảnh thì chữ, spacing và button thu nhỏ dưới ngưỡng đọc được. Cùng bệnh đó với ảnh chụp: crop một vùng nhỏ từ screenshot nguyên trang cho nhanh cũng phá tin cậy theo đúng cách — skill liệt kê những gì crop hay phá: spacing accuracy, type scale relationships, clean margins, layout proportions. Ảnh đáng cho công việc này là ảnh lớn của đúng một section, sạch; phần mô tả của skill tự chốt ưu tiên: "ảnh lớn section-specific, tránh cards-in-cards, hero sạch". Ảnh chứa layout lồng nhiều tầng thì dù to vẫn khó trích thành component, vì chính ảnh không cho thấy biên giữa các lớp nằm đâu.

## Đọc ảnh như art director: hierarchy, spacing, tokens

Bước hai là phân tích, và skill cấm kiểu phân tích lười bằng đúng chữ: "Do not do vague vibe-only analysis. Do not jump too fast from image to code." Nó yêu cầu coi ảnh như một bản đặc tả: "Treat them like a design specification." Chữ đọc được thì trích đúng chữ — headline, subheadline, nhãn CTA; typography phân tích theo quan hệ kích thước và trọng lượng, không dừng ở "đẹp"; màu trích thành palette thật, không thay bằng màu web mặc định. Riêng spacing có câu pin tinh thần:

```
The goal is not exact pixel OCR.
The goal is faithful spacing logic.
```

*Nguồn: ~/.claude/skills/image-to-code/SKILL.md, §23 "Spacing extraction rule", lấy 2026-09-08.*

Kèm một danh sách đọc cụ thể: headline cách subheadline bao xa, text cách button bao xa, các card cách nhau bao nhiêu, gutter hai bên, padding trong card. Đó là chỗ khác biệt nằm: một ảnh nhìn "đẹp" và một ảnh đọc ra hierarchy, spacing logic cùng tokens là hai nguyên liệu khác nhau cho người viết code. Skill đòi vế sau.

## Ảnh là chuẩn đối chiếu, không phải cảm hứng

Failure mode mà skill nhắm tới có tên: design drift — ảnh sinh ra đẹp, code đi vào thì generic. Nguyên tắc ngược lại được viết thành hai mục "goal" đặt cạnh nhau:

```
The goal is not:
- inspired by the image

The goal is:
- visually faithful to the image, translated into real frontend
```

*Nguồn: ~/.claude/skills/image-to-code/SKILL.md, §26 "Design-to-code copy discipline", lấy 2026-09-08.*

Và một câu ngắn hơn ở ngay đầu tài liệu: "The image is the design source. The code is the translation layer." Trong workflow thật của kit, vai trò đó được gọi đúng tên: khi một SF phải dựng component mới từ capture design, workflow trỏ thẳng vào skill này.

```
Component mới: `image-to-code` với capture làm fidelity target.
```

*Nguồn: ~/.claude/skills/orca-superpowers-workflow/SKILL.md (slot F6), lấy 2026-09-08.*

"Fidelity target" là cụm đáng dừng lại: capture không phải cảm hứng mở đầu, mà là chuẩn mà code sau này bị so vào — kiểu test chấp nhận cho giao diện. Chiều kiểm cũng vậy: khác biệt giữa code và ảnh là dữ liệu, không phải giấy phép để người code tự tiện "cải thiện".

## Khi nào KHÔNG gọi image-to-code

Skill tự khai biên ngay trong phần mô tả — nguyên văn:

```
Elite image→code cho component riêng lẻ — LOAD ONLY khi story-workflow
Principle 8 bước 5 (component must-build-new từ ảnh/design reference)
hoặc user chỉ định "từ ảnh này làm component". KHÔNG load cho việc
mock/prototype ban đầu (huashu/mock-prototype lo) hay layout tổng.
Ưu tiên ảnh lớn section-specific, tránh cards-in-cards, hero sạch.
```

*Nguồn: ~/.claude/skills/image-to-code/SKILL.md (frontmatter description), lấy 2026-09-08.*

Đọc theo chiều phủ định ra ba đường lân cận. Cần thử hướng trước khi có code — dựng ba hướng HTML rồi chọn một — là việc của mock-prototype. UI đã build và cần soi trước khi ship là việc của design-taste-frontend, skill audit-first: nó đọc code và bắt lỗi theo checklist, không sinh ảnh (bài [audit đi trước bản build](/vi/blog/skill-design-taste-frontend/) kể riêng góc đó). Build mới từ đầu, chưa có ảnh tham chiếu, cần taste có nguyên tắc là việc của [frontend-design](/vi/blog/skill-frontend-design/). Còn "layout tổng" — phân bổ cả trang thành các section — là câu hỏi khác hẳn một component riêng lẻ, và skill từ chối nó ngay từ dòng mô tả.

## Chiều ngược lại trong repo này: code → ảnh

`image-to-code` đi từ ảnh tới code. Site của Wakii chạy chính pipeline đó theo chiều ngược cho hero tile của blog: một SVG template được render bằng Chrome headless thành PNG chuẩn 1200×630. Header của script tự mô tả:

```js
/**
 * Hero tile pipeline (story FI-349 SF-1; parameterized FI-373 SF-1): SVG
 * template per post → headless Chrome screenshot → public/blog/heroes/<slug>.png
 * (1200×630, brand mint on dark — same DNA as public/og-default.svg).
```

*Nguồn: scripts/render-blog-heroes.mjs (header comment), lấy 2026-09-08.*

Đáng chú ý: tập hero không ai hard-code. Script quét frontmatter của các bài EN, bài nào khai đường dẫn ảnh hero khớp đúng PNG của chính nó thì được render — so khớp giá trị nghiêm ngặt để một đường dẫn copy-paste nhầm không lặng lẽ render nhầm tile. Bài này cố tình không khai dòng đó (matrix chốt bài này không có hero) nên script bỏ qua, không đụng gì. Hai chiều đó soi rõ biên cho nhau: pipeline hero là code → ảnh với output deterministic, render lại ra y hệt; `image-to-code` là ảnh → code, nơi ảnh là chuẩn đối chiếu chứ không phải sản phẩm render. Không ai chụp lại hero tile rồi viết SVG từ screenshot — chiều nào giữ nguồn chuẩn, chiều đó thắng.

`image-to-code` là một trong những skill public đi kèm kit của Wakii, cùng nhóm design với các skill đã ghé ở [tour catalog](/vi/blog/skills-catalog-tour/). Trang [agents-and-kit](/vi/docs/agents-and-kit/) liệt kê đội agent và kit đi kèm để bạn đối chiếu.

Wakii là IDE agentic với đội superpowers dựng sẵn. Lần tới có một ảnh section muốn thành component thật, hãy đưa nó cho agent và để nó đọc ảnh như art director: một ảnh lớn, một bản dịch bám chuẩn.
