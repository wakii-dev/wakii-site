---
title: "Skill /brainstorm: từ ý tưởng thô tới spec đã kiểm chứng"
description: "/brainstorm khai thác một ý tưởng bằng câu hỏi trước khi cho phép viết code: một câu hỏi một lần, spec sáu section sống trong repo, hai ba hướng tiếp cận kèm trade-off — mổ xẻ cơ chế bên trong kèm ví dụ thật."
pubDate: "2026-09-09"
category: "tech"
tags: ["skills", "workflow", "agents"]
draft: false
heroImage: "/blog/heroes/skill-brainstorm.png"
---

Phần lớn tính năng hỏng không phải vì code tệ, mà vì hai bên bắt tay làm khi chưa hình dung cùng một sản phẩm. Kit Wakii có một skill chuyên chặn đúng khoảnh khắc đó: `/brainstorm` — nó từ chối viết code cho tới khi ý tưởng đã chịu một loạt câu hỏi, đóng thành spec có cấu trúc, và được bạn duyệt. Bài này mổ xẻ cơ chế bên trong của skill đó: vì sao mỗi lần chỉ hỏi đúng một câu, spec ghi lại những gì, khi nào thì không nên dùng, và một ví dụ thật nơi câu trả lời mơ hồ nhất vẫn ra thứ dùng được.

TL;DR:

- `/brainstorm` chạy theo một flow cố định: brainstorm → spec → bạn duyệt → plan → subagent verify độc lập → tuỳ chọn đăng Linear kèm worktree.
- Câu hỏi rõ ràng, một lần một câu, ưu tiên dạng chọn; bám ba trục: mục đích, ràng buộc, tiêu chí thành công.
- Spec là sản phẩm thật: sáu section, lưu trong repo, kèm rule số một "No code until spec approved".
- Skill tự ghi nhận lúc nào nên skip: plan quá nhỏ hoặc bạn bảo "nhanh đi" — quy trình phục vụ người, không phải ngược lại.
- Ví dụ thật: epic "viết thêm bài cho blog" đi qua quy trình này và ra matrix 44 slug chốt cứng cùng chín quyết định đánh số.

## Trước câu hỏi đầu tiên là việc đọc

Gõ `/brainstorm` kèm ý tưởng, việc đầu tiên nó làm không phải hỏi bạn — mà là đọc project. Toàn bộ flow được vẽ sẵn trong source skill:

```
/brainstorm "idea"
    ↓
[Phase 1] Brainstorming → spec file → user approve
    ↓
[Phase 2] Writing plan → plan file (Linear-ready format)
    ↓
[Rethink] Subagent verify → PASS / CONCERNS → fix nếu cần
    ↓
[Gate] "Publish lên Linear?"
  [Không] → Done
  [Có]   → hỏi worktree preference
         → tạo issue (description = plan + worktree info)
         → tạo worktree linked to issue (nếu chọn tạo mới)
```

*Nguồn: ~/.claude/skills/brainstorm/SKILL.md, mục Flow — lấy 2026-09-08.*

Bước một của Phase 1 là explore project context, và source viết yêu cầu này ở chế độ nghiêm: "PHẢI đọc thực tế, KHÔNG được giả định" — files liên quan, git log gần đây, architecture hiện tại; kèm dòng "Nếu không chắc về behavior → đọc code, không đoán". Skill còn chỉ định bộ công cụ cho việc đó: codegraph để query symbol, xem call paths và đo impact trước khi đề xuất hướng. Logic đằng sau đơn giản: câu hỏi hay chỉ sinh ra trên ngữ cảnh thật. Một agent hỏi "bạn muốn thêm trang ở đâu" mà chưa mở router là đang phí thời gian của bạn — hỏi thứ mà nó tự đọc được.

## Một câu hỏi một lần

Khi đã có ngữ cảnh, Phase 1 bước hai mới bắt đầu hỏi. Cơ chế nằm gọn trong đúng ba dòng của source:

```
### 2. Ask clarifying questions
One per message. Multiple choice preferred. Focus: purpose,
constraints, success criteria.
```

*Nguồn: ~/.claude/skills/brainstorm/SKILL.md, Phase 1 bước 2 — lấy 2026-09-08.*

"One per message" không phải bày vẽ kiên nhẫn — nó là ràng buộc chất lượng. Hỏi loạt mười câu một lượt thì câu bảy tới câu mười đã bị viết trước khi câu một có lời đáp; trong khi mỗi câu trả lời thật lại đổi ngữ cảnh cho câu kế tiếp. Hỏi từng câu một buộc hội thoại đi theo câu trả lời, không theo kịch bản viết sẵn. Multiple choice giảm chi phí trả lời: bạn chọn thay vì soạn, nhưng vẫn phải cam kết một phương án. Ba trục focus — purpose, constraints, success criteria — là chỗ dừng: đủ để chốt scope mà không quấy rầy. Rules của skill chốt thêm hai đầu:

```
1. **No code until spec approved**
2. **One question per message**
3. **Respect "không"** — stop that branch immediately
```

*Nguồn: ~/.claude/skills/brainstorm/SKILL.md, mục Rules — lấy 2026-09-08.*

Dòng ba đáng đọc kỹ: bạn trả lời "không" là nhánh đó dừng ngay — agent không năn nỉ, không hỏi lại theo cách khác.

## Spec là sản phẩm: sáu section sống trong repo

Kết thúc vòng hỏi là một file, không phải một đoạn chat. Spec được ghi vào `docs/superpowers/specs/` theo ngày và chủ đề, với cấu trúc cố định:

```
## Goal
<1-2 sentences>

## Context
<current state, why this feature>

## Scope
<what's included>

## Non-goals
<what's excluded>

## Design
<approach chosen>

## Acceptance Criteria
- [ ] ...
```

*Nguồn: ~/.claude/skills/brainstorm/SKILL.md, Phase 1 bước 5 — lấy 2026-09-08.*

Sáu section này được thiết kế để trả lời những câu hỏi hay bị quên. Non-goals là màng chắn scope creep: những gì không làm nằm ngay cạnh những gì làm. Acceptance Criteria là checklist từng dòng — cùng cấu trúc "Done When" mà plan dùng ở phase sau. Context giữ lại lý do: ba tháng sau, ai mở file cũng thấy vì sao hướng này được chọn. Trước khi tới tay bạn, agent tự review một lượt ("fix placeholders, contradictions, ambiguity inline"); bạn duyệt xong Phase 1 mới khép — nguyên văn: "Proceed only after approved." Spec được commit thẳng vào repo, nên sản phẩm của buổi brainstorm không nằm trong scroll-back của một phiên chat; nó là tài liệu có lịch sử git.

Trước khi sang plan, vòng spec còn một lớp: propose 2-3 approaches kèm trade-offs và một đề xuất — để bạn quyết trên các phương án được so sánh, không phải trên phương án duy nhất.

## Khi nào không nên dùng

Quy trình hay chết vì được áp nơi không cần. Bugfix một dòng, yêu cầu đã có spec chốt sẵn, thay đổi trivial — mở brainstorm cho những việc này là nghi lễ cho có: tốn công trả lời những câu mà câu trả lời ai cũng biết từ đầu. Điểm đáng quý là chính skill ghi nhận giới hạn của mình. Sau khi viết plan nó spawn một subagent verify độc lập, nhưng mục "Khi nào SKIP rethink" nói thẳng:

```
### Khi nào SKIP rethink:
- Plan ≤ 2 tasks (quá nhỏ, overhead > value)
- User nói "skip review" / "nhanh đi"
```

*Nguồn: ~/.claude/skills/brainstorm/SKILL.md, mục Rethink — lấy 2026-09-08.*

"Overhead > value" là phép tính đúng cho cả lệnh `/brainstorm`, không chỉ bước rethink. Tín hiệu bạn nên gọi nó: cùng một câu mô tả mà hai người hình dung ra hai sản phẩm khác nhau; scope còn lờ mờ; hoặc quyết định sắp tới đắt đến mức một vòng hỏi chi tiết đáng giá. Ngược lại, ý tưởng đã rõ và việc còn lại chỉ là gõ code thì đi thẳng — không ai cần một cuộc phỏng vấn cho thứ đã chốt.

## Từ "viết thêm bài" tới matrix 44 slug

Epic blog batch 2 — story mà bài này là một phần — đi qua đúng quy trình đó. Ngày 2026-09-07, nó mở đầu bằng ý tưởng mơ hồ nhất có thể: "viết thêm bài cho blog". Ở vòng câu hỏi, câu trả lời nhận được cho "hướng nào" là "All of above" — chọn tất cả. Câu trả lời kiểu này dễ bị diễn giải tùy hứng; ở đây nó bị ép qua impact analysis thành các quyết định đánh số trong spec. Đến rev 3, matrix 44 slug được chốt cứng — không còn dấu "~" nào — cùng chín quyết định DEC-1 đến DEC-9. Ba dòng trong bảng DECISIONS:

```
| DEC-1 | Matrix | **44 slug CHỐT CỨNG** (bảng dưới) — không "~55" (P0: facets cộng tối đa 44) |
| DEC-2 | Category enum | **Giữ 3 giá trị** (tutorial/tech/build-log) — skills/features/arch phân vào `tech`, guides vào `tutorial`, logs vào `build-log`; chấp nhận tech chiếm đa số (honest cho dev tool) |
| DEC-6 | Cadence + future-date policy | **Giữ 2 bài/ngày**, pubDate 09-09 → 09-30 pre-assigned. … |
```

*Nguồn: docs/superpowers/specs/2026-09-08-blog-batch2-design.md, bảng DECISIONS (trích, dòng DEC-6 cắt) — lấy 2026-09-08.*

Đây là điểm của cả bài: "All of above" là câu trả lời mơ hồ nhất, nhưng vì quy trình yêu cầu spec có cấu trúc, nó không thể trôi qua dưới dạng lời hứa chung chung — nó phải trở thành 44 dòng cụ thể, số lượng cố định, lịch đăng từng ngày. Quyết định được ghi lại thì kiểm lại được: hôm nay ai thắc mắc "sao lại 44" chỉ cần mở DEC-1.

Bài bạn đang đọc là slug số một trong matrix đó. Phần sau của hành trình — một epic chia sub-feature, chạy song song, về đích một PR — là chuyện của `/story-workflow`, kể trong bài [story workflow: từ ý tưởng tới release](/vi/blog/story-workflow-idea-to-release/). Muốn nhìn cả kệ skills trước khi mở từng cuốn, đọc [tour kỹ năng public của Wakii](/vi/blog/skills-catalog-tour/).

Đội chín agent chạy sau buổi brainstorm — ai đứng ở phase nào, kiểm chéo nhau ra sao — được tài liệu hoá ở trang [agents and kit](/vi/docs/agents-and-kit/).

Wakii là agentic IDE với kit superpowers cài sẵn, `/brainstorm` nằm trong đó. Ý tưởng trong đầu bạn đáng một vòng hỏi từng câu hơn là một lệnh "làm đi" vội — tải về, gõ lệnh, trả lời.
