---
title: "Skill /orca-superpowers-workflow: cầu nối workflow và app"
description: "Một lệnh bọc trọn pipeline sáu phase, từ ý tưởng đến Linear Done — và tại các điểm chuyển tiếp, skill tự gọi bridge nối sang Linear, worktree, task DAG và gates. Bài đọc source skill để mổ xẻ cơ chế đó."
pubDate: "2026-09-10"
category: "tech"
tags: ["skills", "story-workflow", "agents"]
draft: false
heroImage: "/blog/heroes/skill-orca-superpowers-workflow.png"
---

Kit kỹ năng của Wakii có các mảnh rời: brainstorm viết spec, writing-plans-linear viết plan, orchestration chia task và đặt gate. Dùng rời, bạn là người lắp — và lệch một mảnh là hạ tầng đứng im trong khi code đã chạy. Skill `/orca-superpowers-workflow` gom chuỗi đó thành một lệnh. Bài này đọc thẳng file SKILL.md của nó: bọc gì, kích hoạt ở đâu, cái gì ngăn nó chạy vòng tròn.

TL;DR:

- Một lệnh thay chuỗi gọi tay brainstorming + writing-plans + orchestration — đủ sáu phase, từ impact analysis đến Done.
- Bốn bridge đánh số, kích hoạt tại năm điểm chuyển tiếp: Linear issue, worktree, task DAG, gates, sync Done.
- Loop caps có ngưỡng: verify fail cùng nguyên nhân 2 lần thì dừng, task retry tối đa 3, gate bị reject 3 lần thì ngừng nộp lại.
- Principles có precedence stack tường minh: Prime Directive "do not guess" đứng trên cả sơ đồ phase.
- Ví dụ thật: một SF bị reviewer trả lại ba lần ở ba nhóm; một merge race bị guard chặn.

## Một lệnh thay năm skill

Vấn đề không phải thiếu mảnh, mà là ghép tay. Năm thao tác phải nhớ gọi tay — brainstorming, writing-plans-linear, và ba thao tác orchestration: execute, gate, worker-start — được thay bằng một chuỗi định tuyến sẵn, sáu phase đánh số từ 0 đến 5:

```ascii
ý tưởng (một dòng)
    ↓
[PHASE 0] impact analysis → HARD GATE (duyệt hướng trong chat)
    ↓
[PHASE 1 / BRIDGE 5] tạo Linear issue + "In Progress"
    ↓
[PHASE 2] brainstorming → spec.md → [BRIDGE 1] worktree
    ↓
[PHASE 3] writing-plans-linear → plan → [BRIDGE 3] task DAG (từ 5 bước)
    ↓
[PHASE 4] execute từng task → [BRIDGE 2] gates tại checkpoint
    ↓
[BRIDGE 5] Linear → "Done"
    ↓
post-task-ritual (học lại thành skill)
```

*Nguồn: ~/.claude/skills/orca-superpowers-workflow/SKILL.md §"The Workflow" — chú thích dịch, cấu trúc nguyên văn, lấy 2026-09-08.*

Thứ tự đó không phải quy ước mềm: Phase-Ordering Invariant ghi mỗi run chạy 0→5 đúng thứ tự, không phase bỏ được trừ khi tier cho phép — Quick-fix (một file, dưới 10 dòng) nhảy hẳn phase 0-3, Standard rút gọn phase 0, Full chạy đủ. Dùng khi: feature mới trong dự án Orca quản; bỏ qua khi: quick fix hoặc "skip the workflow". Trong kit — 20 kỹ năng, 13 public tại thời điểm viết (2026-09-08) — skill này thuộc nhóm workflow, cùng story-workflow, brainstorm, writing-plans-linear.

## Năm bridge tại năm điểm chuyển tiếp

Bridge là lệnh gọi hạ tầng Orca chèn đúng lúc chuyển phase. Description liệt kê nguyên văn: "Automatically invokes Bridge 5 (Linear sync), Bridge 1 (worktree), Bridge 3 (task DAG), and Bridge 2 (gates) at key transition points." Bốn bridge đánh số, năm điểm kích hoạt — Bridge 5 bắn hai lần, hai đầu vòng đời:

| Điểm chuyển tiếp | Bridge | Việc hạ tầng |
|---|---|---|
| Hướng đã duyệt (Phase 1) | 5 | Tạo Linear issue, "In Progress" |
| Spec chốt (cuối Phase 2) | 1 | `orca worktree create` |
| Plan xong, nếu từ 5 bước (Phase 3) | 3 | `run-create` + `task-create` với deps |
| Đến checkpoint verification (Phase 4) | 2 | `gate-create` — dừng, chờ quyết định |
| Mọi task xong (Phase 5) | 5 | Set Linear "Done" |

*Nguồn: ~/.claude/skills/orca-superpowers-workflow/SKILL.md — description + các section Phase 1-5, lấy 2026-09-08.*

Bridge không dựng cho hết mức: DAG chỉ tạo khi plan từ 5 bước — plan ngắn dùng TodoWrite thay; deps chặn sâu 4 mức. Nếu Orca CLI gãy, skill chạy tiếp không bridge và nói rõ bridge nào fail — thiếu hạ tầng được nói ra, không nuốt im lặng.

## Gate và loop caps: dừng là tính năng, không phải lỗi

Gate là hợp đồng tool-enforced — [gates, not trust và Rule 0](/vi/blog/gates-not-trust-rule-zero/) đã mổ xẻ từng cổng. Ở đây nhìn gate như một bridge, và nhìn cái gì xảy ra khi vòng lặp không chịu dừng: các mức cap, chung một hình dạng — chạm ngưỡng thì dừng, tổng hợp cái đã thử, hỏi người.

| Vòng lặp | Ngưỡng | Ghi của source |
|---|---|---|
| Verify fail cùng nguyên nhân, cùng task | 2 lần | "2 failures means the cause isn't what you're patching" |
| Retry cùng một task | 3 lần | Lần thứ 4 → STOP + hỏi |
| Gate bị rejected | 3 lần | Ngừng nộp lại, hỏi user |
| Critique lại cùng spec/plan | 2 vòng rework | Lượt critique thứ 3 → STOP |

*Nguồn: ~/.claude/skills/orca-superpowers-workflow/SKILL.md — §"Loop caps", escape hatch Phase 4, rework cap Phase 2/3, lấy 2026-09-08.*

Các cap bấm cả chế độ autonomous — dễ hiểu sai là tưởng nó bỏ gates. Source ghi điều ngược lại: "Phase 4 gates exist in autonomous too — autonomous self-approves after self-adversarial review; it does not delete them." Tự duyệt có kỷ luật: Principle 3 buộc checklist năm bước trước mỗi lần gật — lập luận phản đối, edge case, phương án đã bỏ, đối chiếu codebase, rồi mới quyết. Kèm sổ attempt và nguyên tắc: "A DONE without evidence is not a DONE".

## Principles ràng buộc mọi phase

Skill có bảy principles đánh số (2-8) và hai invariant đứng trên. Khác danh chí vàng treo tường ở hai thứ: thứ tự ưu tiên tường minh, và bản đồ gắn principle vào phase — cái nào bám chặt, cái nào chỉ bật theo token. Thứ tự ưu tiên, nguyên văn:

> Prime Directive > Phase-Ordering Invariant > Principles (2-8) > Workflow phase instructions > Examples/templates.

*Nguồn: ~/.claude/skills/orca-superpowers-workflow/SKILL.md §"Precedence Stack", lấy 2026-09-08.*

Prime Directive đặt lên đỉnh: "Do not guess. If anything is unclear, you MUST stop and resolve it before continuing." Ngay dưới là Phase-Ordering — autonomous cũng không vượt được: nó đổi người duyệt gate, không đổi việc phase có chạy. Năm principle đáng nhớ:

- **Surgical Scope** — chỉ code cái feature cần; code hàng xóm kém thì ghi chú, không tự sửa.
- **Self-Doubt Proactive** — mỗi khẳng định hỏi lại: đã verify phiên này, hay chỉ pattern-match từ trí nhớ.
- **Continuous Improvement Flag** — thấy lỗ hổng của skill giữa task thì flag vào improvements-log, không tự fix.
- **Multi-Dimensional Analysis** — Phase 0 soi nhiều chiều: functional, arch, data, security, UX; bỏ chiều nào phải nêu lý do.
- **Linear Audit Log** — mỗi phase, mỗi task, một comment đủ để người đọc sau tái hiện workflow.

## Một SF đi qua đủ các bridge

Ví dụ lấy từ story FI-359 — 20 bài blog longform của chính site này; SF-3 là series bảy bài. Review không dồn về cuối: theo rolling review mà skill ghi thành luật — chia tasks nhóm bốn-năm việc cùng đường, nhóm nào xong, code-reviewer độc lập soi diff ngay, song song với nhóm kế — series bị trả CHANGES-REQUESTED ba lần ở ba nhóm khác nhau. Mỗi lần: fix, re-review, APPROVED mới được merge. Reviewer tách khỏi executor, và làm đúng việc của nó.

Cũng trong SF đó, nhánh đích từng nhích giữa chừng hai lần — một lần vì một SF khác merge trước, một lần vì một commit docs chạm ref giữa lúc merge và lúc cập nhật. Lần merge sau bị chặn: ancestor-check thấy nhánh đích không còn là tổ tiên của nhánh làm việc — cập nhật bị từ chối thay vì ghi đè. Re-merge nhánh đích, merge lại, loop chạy tiếp sạch. Guard đó thuộc quy trình story — nhưng cùng triết lý: kiểm tra điều kiện trước khi ghi.

Và ví dụ đang chạy: bài này là một task của SF-2, story FI-373 — sinh ra trong worktree riêng, sẽ qua review theo nhóm, rồi merge sau ancestor-guard. Bạn đang đọc một node giữa dòng của chính sơ đồ đó.

```ascii
SF-3 (series 7 bài) trong FI-359:
worktree riêng → viết nhóm 1 → review nhóm 1: CHANGES-REQUESTED
  → fix → re-review APPROVED → viết nhóm 2 → review: CHANGES-REQUESTED
  → fix → re-review APPROVED → viết nhóm 3 → review: CHANGES-REQUESTED
  → fix → re-review APPROVED
nhánh đích nhích giữa chừng → ancestor-check chặn → re-merge → merge sạch
```

*Nguồn: nhật ký Linear FI-359 (sub-issue SF-3) + audit trail story — trace dựng lại định tính từ log, lấy 2026-09-08.*

Quy trình đầy đủ nằm trong docs [story workflow](/vi/docs/story-workflow/). Hai mảnh đã có bài riêng: [gates, not trust và Rule 0](/vi/blog/gates-not-trust-rule-zero/) cho tầng cổng kiểm; [chín agent, quyền hạn tách rời](/vi/blog/nine-agents-separated-powers/) cho đội chạy bên trong các bridge.

Wakii là agentic IDE với đội superpowers dựng sẵn. Muốn thấy pipeline sáu phase chạy thật: mô tả một ý tưởng, để skill điều phối — và dừng ở đúng những chỗ cần bạn quyết.
