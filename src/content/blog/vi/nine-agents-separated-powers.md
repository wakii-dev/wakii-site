---
title: "Chín agent, quyền hạn tách rời"
description: "Một story run của Wakii được phủ bởi chín agent — người phân tích không code, người viết không tự duyệt, người kiểm không fix. Bài này mổ xẻ cơ chế tách quyền đó: bảng vai trò đầy đủ, đường thông tin giữa các vai, và một case thật khi reviewer bắt được lỗi mà executor đã sign-off."
pubDate: "2026-08-21"
category: "tech"
tags: ["agents", "supervised", "workflow"]
draft: false
---

Nghe nói "đội AI làm việc thay bạn", hình ảnh hiện ra thường là một agent
rất giỏi: nhận việc, làm hết, tự kiểm, báo xong. Wakii dựng ngược lại. Một
story run không được thực hiện bởi một agent khoẻ mạnh làm tất cả — nó được
phủ bởi chín vai hẹp, mỗi vai một quyền hạn, và các quyền đó cố tình tách
rời. Người phân tích không viết code. Người viết không duyệt việc mình làm.
Người kiểm lỗi không sửa lỗi. Tách quyền không phải chi tiết tổ chức cho
đẹp sơ đồ; nó là cách chất lượng không phải phụ thuộc vào "sự cẩn thận"
của một agent duy nhất. Bài này mổ xẻ cơ chế đó: bảng vai đầy đủ, đường
thông tin giữa các vai, và một case thật khi mắt khác bắt được thứ mà mắt
đầu tiên đã gật đầu qua.

TL;DR:

- Chín agent phủ một story run: ba vai phân tích trước khi có code, hai vai
  làm, bốn vai kiểm — không ai kiêm nhiệm ai.
- Tách quyền chặn mâu thuẫn lợi ích: vai review không bao giờ là tác giả
  của phần việc đang được review.
- Đường thông tin một chiều executor → reviewer → verifier biến mỗi mũi
  tên thành một điểm chặn lỗi trước khi nó lan.
- Case thật: executor đã báo DONE, reviewer độc lập vẫn bắt được một rule
  scoped-style chết và một lỗi escape.

## Chín vai, chín quyền hạn

Docs agents & kit liệt kê đủ chín vai, kèm một chỉ dẫn đọc: mỗi người một
việc hẹp, và cơ chế kiềm chế chéo giữa họ mới là điều quan trọng. Bảng dưới
sao nguyên văn từ docs:

| Agent | Nhiệm vụ |
|---|---|
| **phase0-impact-analyst** | Vẽ blast radius trước khi có code — touch map, hệ quả cấp hai, các phương án |
| **spec-critic** | Review adversarial cho spec: mơ hồ, thiếu edge case, tiêu chí không verify được |
| **plan-critic** | Review adversarial cho plan và đồ thị phụ thuộc task |
| **task-executor** | Implement task trong worktree biệt lập, commit atomic |
| **designer** | Làm design draft độ cao cho user duyệt trước khi UI được build |
| **code-reviewer** | Soi mọi diff tìm bug, lỗ hổng security, và scope creep |
| **verifier** | Verdict pass/fail độc lập cho sản phẩm hoàn thành — tự báo xong thì không ăn |
| **security-audit** | Audit tập trung OWASP khi thay đổi đụng auth, input, hay secrets |
| **rollback-fixer** | Revert an toàn về trạng thái tốt cuối cùng khi có gì đó lệch hướng |

*Nguồn: `src/content/docs/vi/agents-and-kit.md` §"Đội 9 agent", lấy 2026-09-07.*

Đọc bảng theo ba nhóm. Ba vai đầu chưa đụng code: phase0-impact-analyst vẽ
blast radius, spec-critic và plan-critic soi adversarial spec và plan —
quyền của nhóm này là quyền hỏi, và chỉ có quyền đó. Hai vai giữa là nhóm
làm: task-executor implement trong worktree biệt lập, designer làm draft
cho user duyệt trước khi UI được build. Bốn vai cuối là nhóm kiểm:
code-reviewer soi diff, verifier đưa verdict độc lập, security-audit audit
OWASP, rollback-fixer revert khi có gì lệch hướng.

Nhóm kiểm đông nhất — bốn trên chín — và đó không phải trùng hợp. Dòng mô
tả verifier trong bảng nói đúng điều đó: "tự báo xong thì không ăn". Một
hệ thống mà executor tự chấm bài mình thì chỉ mạnh bằng khả năng tự phê
bình của executor; hệ thống này không đặt cược vào khả năng đó.

## Vì sao người viết không tự duyệt

Nguyên tắc 2 trong tám nguyên tắc của story workflow đặt vấn đề thẳng:
developer tự review code mình là mâu thuẫn lợi ích. Bug sống sót sau một
lượt review là chính xác những bug mà tác giả không nhìn thấy — vì tác giả
đọc code bằng ý định, không bằng con mắt lạnh. Lời "tôi đã kiểm rồi" của
tác giả không có giá trị chặn; giá trị chặn nằm ở con mắt thứ hai. Docs kể
một case đúng dạng này:

> *Ví dụ: khi executor báo một task đã xong, code reviewer riêng biệt vẫn
> bắt được một rule scoped-style chết và một lỗi escape mà executor đã tự
> đạt qua. Mắt khác, phát hiện khác.*

*Nguồn: `src/content/docs/vi/story-workflow.md` nguyên tắc 2 "Team model tách bạch ba vai", lấy 2026-09-07.*

Case không phải ví dụ minh hoạ. Theo audit trail của story FI-300 — story
blog features của chính site này — sub-feature đã được executor báo DONE,
và reviewer độc lập vẫn tìm ra một rule scoped-style đã chết cùng một lỗi
escape trong đúng phần việc đó. Hai lỗi nằm ở những chỗ tác giả nhìn mãi
mà không thấy: style nó vừa viết, chuỗi nó vừa escape. Reviewer không giỏi
hơn executor; reviewer chỉ không phải người vừa viết ra đoạn code đang
được đọc.

## Tách quyền không phải là chậm thêm

Nghi ngờ hợp lý: chín vai cho một story — chẳng phải thêm tám vòng thủ
tục? Câu trả lời nằm ở hướng di chuyển của thông tin. Reviewer và verifier
không phải vòng ký duyệt mà executor phải thuyết phục; họ là những điểm
chặn trên một đường truyền một chiều:

```ascii
spec ──→ task-executor ──→ code-reviewer ──→ verifier ──→ merge
              │                  │                │
         commit + diff      soi diff         ACCEPTANCE
         (tác giả)      (không phải tác giả)  (đọc tiêu chí,
                                              không đọc lời kể)
```

*Nguồn: sơ đồ tự vẽ theo pipeline trong `src/content/docs/vi/story-workflow.md` §"Thực thi song song", lấy 2026-09-07.*

Đọc sơ đồ theo hướng thông tin, không theo thứ tự điểm danh. Executor
không kể cho reviewer nghe mình đã làm gì — reviewer nhận diff và đọc
diff. Verifier không đọc tổng kết của executor — verifier nhận bộ tiêu chí
ACCEPTANCE và chạy trên sản phẩm thật. Mỗi mũi tên chỉ truyền một loại
thông tin: kết quả công việc, chưa bao giờ là lời khẳng định về kết quả
công việc. Lời khẳng định là thứ dễ lệch nhất trong toàn chuỗi; tách quyền
nghĩa là không mắt nào buộc phải tin nó.

Chi phí thêm của tách quyền là thời gian của một lượt đọc. Cái nó chặn là
cả lớp bug mà tác giả tự nhiên không thấy được — loại lỗi đắt nhất, vì nó
đã qua tay người tự tin nhất về nó. So với giá của một lỗi đã merge, phép
tính không nghiêng về phía bỏ review.

Bảng vai đầy đủ nằm trong docs [agents & kit](/vi/docs/agents-and-kit/).
Chín agent này đến từ kit nào và kit tự cài vào máy thế nào — bài
[zero-setup](/vi/blog/zero-setup-agent-team/) đã mổ xẻ; bài này nhìn vào
cách đội đó được tổ chức để không ai phải tin ai. Muốn thấy tách quyền
chạy thật: mở Wakii, mô tả một ý tưởng ở tab ⚡ Workflow, và để chín vai ấy
chia việc.
