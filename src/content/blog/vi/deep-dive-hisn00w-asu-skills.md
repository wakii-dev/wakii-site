---
title: "ASu-skills: chín skill tìm việc và làn sóng skills-as-content"
description: "ASu-skills đóng gói một workflow tìm việc thành 9 skill AI, phân phối cho 5 harness từ một nguồn duy nhất với registry đối chiếu bằng CI. Bài này mổ xẻ hiện tượng skills-as-content và cơ chế chống drift catalog mà chính Wakii đang cần."
pubDate: "2026-10-24"
category: "tech"
tags: ["skills", "agents", "workflow", "evidence"]
draft: false
---

Một bộ skill cho niche phi-lập-trình — chuẩn bị xin việc tiếng Trung — tạo ngày 12-08-2026 đã đạt 4.025 sao theo GitHub API ngày 2026-09-08, chưa đầy một tháng. Con số đó kể một câu chuyện lớn hơn repo: skill đã trở thành một dạng nội dung phân phối được — ai viết nội dung tốt, người đó có sản phẩm; harness agent chỉ là runtime để chạy nó. ASu-skills của Hisn00w là một mẫu hiện tượng này làm đúng kỷ luật kỹ thuật: một nguồn skill, nhiều harness, và catalog do máy đối chiếu.

## TL;DR

- ASu-skills là một plugin workflow tìm việc tiếng Trung gồm 9 skill độc lập: từ đóng góp open-source thật, làm và nâng CV, đến chuẩn bị phỏng vấn và theo dõi tiến độ ứng tuyển.
- Phân phối đa-harness: một nguồn `skills/` dùng chung, 5 manifest theo harness (Codex, Claude Code, TraeWork, OpenCode, WorkBuddy); `skills.registry.json` là nguồn sự thật duy nhất, CI chạy `--check` để chặn catalog drift.
- Điểm mạnh nhất nằm trong nội dung prompt: "biên sự thật" — phân biệt đã-lên-máy với prototype, đo-thật với ước-lượng, hành động cá nhân với phần AI làm — và một chuỗi bằng chứng 9 đoạn có riêng mục "bằng chứng còn thiếu".
- 4k★ cho skill phi-code là tín hiệu nhu cầu: agent skills không chỉ là chuyện của dân dev.

## Skill là nội dung, harness là runtime

Cách repo tổ chức phân phối chính là định nghĩa hoạt động của skills-as-content. Toàn bộ nội dung sống trong ba thư mục dùng chung — `skills/`, `assets/`, `references/` — và mỗi harness chỉ cần một manifest mỏng trỏ vào đó: `.codex-plugin/` cho Codex, `.claude-plugin/` cho Claude Code, `.trae-plugin/` cho TraeWork, còn `.opencode-plugin/` và `.workbuddy-plugin/` là các bridge cộng đồng nhẹ hơn. Cài lên Claude Code là hai lệnh marketplace quen thuộc: `/plugin marketplace add Hisn00w/ASu-skills` rồi `/plugin install asu-skills@asu`.

Phần chống-drift mới là thứ đáng học. README ghi rõ: danh mục entry lấy `skills.registry.json` ở gốc repo làm "nguồn sự thật duy nhất", do `npm run sync:skills` sinh ra và đối chiếu, còn CI chạy lại với `--check`. Nghĩa là ai thêm một skill mà quên đồng bộ manifest ở năm chỗ thì CI đỏ trước khi merge. Điều này không phải lý thuyết: ngay tháng đầu, một contributor ngoài (qiyu-lu) đã gửi PR #136 "fix/docs-skill-catalog-sync" với lý do rõ ràng là chống trôi catalogs docs — lớp cơ chế này thực sự được người ngoài dùng.

| Thành phần | Vai trò |
| --- | --- |
| `skills/` + `assets/` + `references/` | một nguồn nội dung dùng chung cho mọi harness |
| `.codex-plugin/` … `.workbuddy-plugin/` | 5 manifest mỏng, mỗi harness một cái |
| `skills.registry.json` | nguồn sự thật duy nhất của danh mục entry |
| `npm run sync:skills` + CI `--check` | sinh và đối chiếu registry, chặn drift |

Repo không có release hay tag nào (theo GitHub API ngày 2026-09-08) — version sống trong manifest plugin và phân phối đi bằng marketplace của từng harness. Đó là mô hình phân phối của nội dung, không phải của phần mềm: không cài đặt nhị phân, không kênh cập nhật riêng, chỉ có văn bản được một runtime đọc.

## Chín skill, một workflow

Chín entry không phải chín công cụ rời mà là một pipeline tìm việc có thứ tự. `/contributor` tìm vấn đề open-source phù hợp vị trí mục tiêu, check tín hiệu maintainer và quy tắc đóng góp trước khi đề xuất; `/project-guide` sinh đường đọc source kèm câu hỏi ôn; `/great-resume` và `/make-resume` lo phần CV (18 template HTML chỉnh được, ngôn ngữ stats của repo là HTML cũng vì đây); `/job-match` đối chiếu JD với bằng chứng thật; `/job-apply` điền form qua browser và dừng trước khi submit để người dùng kiểm; `/interview` và `/offer` gói phần phỏng vấn và theo dõi tiến độ.

Chuỗi phối hợp được README viết thành kịch bản: thiếu trải nghiệm thật thì đi `/contributor` trước, kết quả đưa thẳng cho `/great-resume`; có record AI-coding thì `/evidence-recap` tạo chuỗi bằng chứng trước khi quyết định cách kể. Mỗi entry mô tả rõ khi nào KHÔNG dùng nó — ranh giới trách nhiệm giữa các skill được khai báo thay vì để runtime đoán.

## Biên sự thật viết ngay trong prompt

Phần đọc lâu nhất là skill `/evidence-recap`: biến hội thoại lập trình AI và record bàn giao thành một chuỗi bằng chứng chín đoạn, đúng thứ tự:

```text
1 问题背景  (bối cảnh vấn đề)        6 效果证据  (bằng chứng hiệu quả)
2 方案决策  (quyết định phương án)   7 个人边界  (biên trách nhiệm cá nhân)
3 个人动作  (hành động cá nhân)      8 待补证据  (bằng chứng còn thiếu)
4 交付状态  (trạng thái bàn giao)    9 面试追问  (câu hỏi soi phỏng vấn)
5 落地范围  (phạm vi triển khai)
```

— skills/evidence-recap/SKILL.md, [Hisn00w/ASu-skills](https://github.com/Hisn00w/ASu-skills/blob/main/skills/evidence-recap/SKILL.md) (probe 2026-09-08)

Trong đó có những đoạn mà mọi hệ thống ghi nhận thành tích nên học: đoạn bốn buộc gắn nhãn rõ trạng thái — đã lên production, nội bộ, prototype hay chỉ là kế hoạch; đoạn sáu tách bạch kết quả đo thật, kết quả giai đoạn, xác minh kỹ thuật và lợi ích ước lượng; và đoạn tám là một quyết định thiết kế hiếm thấy — một mục riêng cho "bằng chứng còn thiếu", cấm suy diễn cho đầy.

Biên sự thật không dừng ở một skill. `/great-resume` được yêu cầu đánh 【待补】(cần bổ sung) thay vì tự bịa chức danh, công ty hay số liệu. `/contributor` chỉ được dùng ngôn từ mạnh khi GitHub hiển thị PR đã merge — PR chưa merge là "đã submit". Và trước mọi output, skill chạy privacy scrub: mã dự án, token, email, định danh khách hàng, đường dẫn nội bộ bị khái quát hóa hoặc thay thế. Đây là anti-hallucination viết thành quy trình nội dung, không phải lời dặn chung chung "hãy trung thực".

Với Wakii, đây chính là triết lý "xong nghĩa là có bằng chứng" — đã chạy qua gates trong [docs story-workflow](/vi/docs/story-workflow/) — nhìn từ phía nội dung: một bộ skill phi-code tự biện minh cho từng con số trước khi nó vào CV. Và bài học catalog drift của ASu-skills chạm đúng chỗ Wakii đang hở: catalog skill của Wakii kể trong [skills-catalog-tour](/vi/blog/skills-catalog-tour/) sống trong `skills.ts`, nhưng số dẫn xuất viết tay ở nơi khác vẫn trôi.

## Wakii học được gì

- **ADOPT** — registry một nguồn + view dẫn xuất được máy đối chiếu: `skills.registry.json` do script sinh và CI `--check` chặn mọi drift catalog. Wakii đã va đúng bệnh này: README còn ghi "21 skills" trong khi ground truth là 20/13 (tại thời điểm viết), và con số tay sẽ lại trôi ở lần đếm sau. Fix đúng lớp: sinh hoặc lint-check mọi số đếm skills trong README/docs từ `skills.ts`.
- **DIRECTION** — phân phối đa-harness: một nguồn skill, manifest mỏng riêng từng harness, registry đối chiếu tập trung. Kit Wakii hiện nhắm Claude Code; nếu sau này mở thêm harness, đây là layout theo ngay mà không phải viết lại nội dung.
- **DIRECTION** — chuỗi bằng chứng 9 đoạn có mục "bằng chứng còn thiếu" và biên trách nhiệm người/AI: khuôn sắc hơn cho story memory và done-means-evidence — ghi nhận cái mình chưa chứng minh được là một phần của bằng chứng, không phải thất bại cần giấu.
- **WATCH** — 4k★ trong chưa đầy một tháng (tạo 12-08-2026) cho skill phi-code chứng tỏ nhu cầu skills-as-content ngoài dev-tools; nhưng 5-harness coverage còn trẻ (hai bridge "lightweight"), câu chuyện bảo mật đang dựa vào badge của bên thứ ba — theo thêm khi các harness chuẩn hóa marketplace.

Wakii là agentic IDE với một đội superpowers có sẵn — 20 skills (tại thời điểm viết) chia theo vai, mỗi việc đi qua gates. [Tải Wakii](/vi/docs/getting-started/) và xem catalog tự kể câu chuyện của nó.
