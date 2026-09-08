---
title: "Skill /writing-plans-linear: kế hoạch sống trên Linear"
description: "Biến spec thành kế hoạch viết cho người không có ngữ cảnh: task nhỏ vừa một lần ngồi, hai mode Write và Publish, bản plan nằm trên Linear để ai đến sau cũng đọc được."
pubDate: "2026-09-09"
category: "tech"
tags: ["skills", "linear", "workflow"]
draft: false
---

Giao một tính năng cho ai đó — engineer mới, một agent chưa từng thấy repo, hay chính bạn sáu tuần sau — bằng vài câu nói miệng, kết quả gần như luôn lệch khỏi những gì bạn hình dung. Không phải người nhận kém: thông tin quyết định nằm ở những gì bạn cho là hiển nhiên, và không cái nào được viết ra. Skill `/writing-plans-linear` trong kit của Wakii xử lý đúng chỗ đó — biến spec thành kế hoạch cho người đọc không có ngữ cảnh nào, rồi đặt bản kế hoạch lên Linear. Bài này đi vào nội tại của skill, kèm hai plan file thật trong repo Wakii.

TL;DR:

- Plan viết cho người lạ: giả định zero-context là điểm khác biệt — không gì "ai cũng biết" để mặc định.
- Task nhỏ vừa một lần ngồi: Files cụ thể, steps đánh số 2-5 phút, lệnh test kèm kết quả mong đợi.
- Hai mode: Write im lặng ra file; Publish lên Linear sau review duyệt — mỗi milestone một subtask tự đủ.
- Plan là bộ nhớ ngoài của agent: context bị nén, bản plan trên đĩa và trên Linear còn nguyên.
- Dẫn chứng thật: hai plan file của story blog trong `docs/superpowers/plans/` của repo công khai.

## Người đến sau là người đọc mặc định

Kế hoạch thất bại ở đúng chỗ không ai viết ra: quy ước, thứ tự đụng file, cách chạy test — những thứ người viết cho là "ai cũng biết". Skill chọn trục ngược: người đến sau là người đọc mặc định, và không được giả định biết gì. Nguyên văn mở đầu:

> "Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste. Document everything they need to know: which files to touch for each task, code, testing, docs they might need to check, how to test it. Give them the whole plan as bite-sized tasks."

*Nguồn: ~/.claude/skills/writing-plans-linear/SKILL.md, mục Overview, lấy 2026-09-08.*

"Questionable taste" không phải khách khí: cả gu của người đọc cũng phải nằm trong chữ viết. Hệ quả lớn: cùng một văn bản chạy cho cả người và agent — agent là "người lạ" đúng nghĩa, nên plan đủ cho agent thì đủ cho người.

Pipeline từ ý định đến việc làm gọn trong ba tầng:

```ascii
spec — ý định: làm gì, vì sao
  |  /writing-plans-linear
plan file — task nhỏ, code thật, lệnh test thật       (Write)
  |  review duyệt
subtask Linear — mỗi milestone một task, tự đủ        (Publish)
  |
engineer / agent mới: mở task, làm theo thứ tự, tick
```

*Nguồn: sơ đồ dựng từ SKILL.md (Overview + Write vs Publish + Self-Contained Subtask Format), 2026-09-08.*

## Nhỏ đến mức một lần ngồi viết xong

Kích thước việc chia hai tầng với hai sàn khác nhau. Tầng task có sàn dưới — quá nhỏ thì gộp:

> "Each task MUST represent at least 1 hour of work. Tasks smaller than this should be merged into a larger cohesive task."

*Nguồn: SKILL.md, Minimum Task Size, 2026-09-08.*

Dấu hiệu quá nhỏ so với chuẩn:

| Dấu hiệu quá nhỏ | Kích thước chuẩn |
|---|---|
| Dưới 4 bước | 4-8 bước chính |
| Dưới 50 dòng code | 100-200 dòng code |
| Chỉ một lát mỏng: chỉ CSS, chỉ HTML | Tiến bộ dọc test độc lập được (UI + behavior + tests) |

*Nguồn: bảng dựng từ SKILL.md, Task Scope Guidelines, 2026-09-08.*

Tầng step thì ngược lại — chia hết mức, mỗi step đúng một hành động:

```text
Each step is one action (2-5 minutes):
- "Write the failing test" - step
- "Run it to make sure it fails" - step
- "Implement the minimal code to make the test pass" - step
- "Run the tests and make sure they pass" - step
- "Commit" - step
```

*Nguồn: SKILL.md, Bite-Sized Task Granularity, 2026-09-08.*

Step nhỏ để trạng thái việc luôn rõ — test viết xong là phải đỏ, code vào là phải xanh; task đủ lớn để xong thì có thứ chạy được thật. Skill chốt ba dòng Remember: "Exact file paths always" · "Complete code in every step — if a step changes code, show the code" · "Exact commands with expected output".

## Hai mode: Write im lặng, Publish lên Linear

Skill không đăng gì lên Linear ngay: lần gọi đầu chỉ viết file; chế độ chỉ đổi sau khi review duyệt hoặc lệnh tường minh:

| Thời điểm | Mode | Việc Linear |
|---|---|---|
| Lần gọi đầu | Write | Không — chỉ ghi file |
| Reviewer duyệt xong | Publish | Tạo subtask + đăng comment tóm tắt |

*Nguồn: bảng Mode Switching trong SKILL.md, 2026-09-08.*

Trình tự ấy đặt review đúng chỗ: bản nháp bị chê thoải mái khi còn là file; Linear chỉ nhận kế hoạch đã qua mắt người khác — và Publish kèm ràng buộc ngược lên nội dung subtask:

> "each subtask MUST be self-contained — the developer should be able to complete it from Linear alone, without opening the plan file or any external resource."

Danh sách cấm trong thân subtask:

```text
- "See plan file for full code"
- "Reference: docs/specs/..."
- "See Task N for similar implementation"
```

*Nguồn: SKILL.md, Self-Contained Subtask Format, 2026-09-08.*

"See Task N" bị cấm vì người nhận có thể đọc task không theo thứ tự — tham chiếu mù phá tính tự chứa. Nếu không dò được issue nào, skill hạ chế độ tường minh: "No Linear issue found. Plan will be saved to file only." — file vẫn ra, Linear bỏ qua.

*Nguồn: SKILL.md, Linear Integration (script tự dò issue), 2026-09-08.*

## Context bị nén, bản plan còn nguyên

Một phiên viết plan dài: nạp spec, đọc code — context window đầy, hệ thống nén bớt nội dung cũ; cái gì không nằm trên đĩa mờ dần trong bản tóm tắt. Skill ghi plan ra file ngay khi viết, trước cả khi ai thực thi. Hai dòng khép vòng đó: "Write plan to local file (always — source of truth)" và "Keep local file as backup".

*Nguồn: SKILL.md, Recommended Approach + Remember, 2026-09-08.*

Đọc lại không cần phiên cũ: plan file nằm trong repo, subtask nằm trên Linear — hai bản sao, không bản nào thuộc context của ai. Bài [Linear là bộ nhớ ngoài của đội agent](/vi/blog/linear-as-external-memory/) nói tầng state của đội — task nào đang ở đâu; tầng này là văn bản kế hoạch, tồn tại trước khi có state nào. Hai tầng gặp nhau ở Publish: kế hoạch thành subtask, vừa là tài liệu vừa là state.

## Mở một plan file thật trong repo này

Story blog bạn đang đọc chạy bằng đúng những plan file đó: 20 bài × 2 locale = 40 file chia 5 SF, orchestration hoàn tất 5/5 task. Mở plan SF-1 — nền editorial cho 19 bài sau — root cause viết thẳng rủi ro ra trang:

> "Không có lớp nền dùng chung thì mỗi SF tự chế: format frontmatter, cách đếm từ, cụm claim được phép, target link docs — drift mù"

Và mục Problem chốt hệ quả:

> "19 bài viết còn lại của epic sẽ nhờ bộ máy soạn thảo dùng chung này — SF-1 sai thì 19 bài sau sai theo. Ai mở `pnpm build` phải thấy bài lệch chuẩn bị chặn bằng máy, không phải bằng mắt."

*Nguồn: docs/superpowers/plans/2026-09-07-fi359-sf1-editorial-foundation-plan.md, mục 0 + mục 1, 2026-09-08.*

Ai nhận SF-2 mà không đọc thêm gì vẫn hiểu vì sao SF-1 phải đi trước — zero-context làm thấy được, không phải chỉ nói. Plan SF-2 — viết ngày 2026-09-08, của chính story này — mang cùng cấu trúc: header ghi Date, Linear issue, worktree, nhánh đích; mục 0 root cause; bảng 13 hàng, mỗi hàng một bài với slug, ngày đăng, angle riêng, ví dụ story thật. Dòng team cho thấy plan viết cho cả một đội:

> "Team: task-executor ×13 (viết) + code-reviewer (rolling theo wave) + verifier + security-audit (claims/links/evidence) + rollback-fixer (khi cần)."

Mục 0 cùng file chốt chuẩn evidence: "Mỗi bài có đúng một evidence chuẩn: source skill thật trong kit (~/.claude/skills/<name>/SKILL.md) — paraphrase docs là FAIL."

*Nguồn: docs/superpowers/plans/2026-09-08-fi373-sf-2-series-skills-plan.md, mục 0 + bảng §2, 2026-09-08.*

Bài bạn đang đọc là hàng số 2 của bảng đó — một agent đọc một hàng và viết ra, không ai truyền miệng gì.

Plan chỉ là một mắt trong cơ chế: sau khi plan thành subtask, gates B0-B5 chốt chất lượng từng phần việc, watchdog gọi dậy story stall, đội chín agent chia nhau vai. Cơ chế tổng thể nằm ở trang [story workflow](/vi/docs/story-workflow/); đội agent đã là bài riêng: [Chín agent, quyền hạn tách riêng](/vi/blog/nine-agents-separated-powers/).

Wakii là agentic IDE với một đội superpowers có sẵn — kit tự cài lần đầu chạy, không cấu hình. Thử với việc nhỏ nhất của bạn: viết một plan theo skill này cho task kế tiếp, rồi đọc lại sau một tuần.
