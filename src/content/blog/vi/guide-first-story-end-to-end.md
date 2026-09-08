---
title: "Story đầu tiên từ ý tưởng tới PR: bấm gì, gõ gì"
description: "Lần chạy tay đầu tiên, từng bước: nêu ý tưởng trong tab ⚡ Workflow, xem impact và plan lên Linear, theo bracket trên 🌳 Story, trả lời gates B0–B5, và nhận về một PR duy nhất."
pubDate: "2026-09-20"
category: "tutorial"
tags: ["guide", "story-workflow", "workflow"]
draft: false
heroImage: "/blog/heroes/guide-first-story-end-to-end.png"
---

Có hai cách kể về quy trình story của Wakii: kể lại một case đã chạy xong —
như bài [story workflow: từ ý tưởng đến
release](/vi/blog/story-workflow-idea-to-release/) — hoặc ngồi cạnh bạn và bấm
từng nút, từ trang trắng đến PR. Bài này chọn cách thứ hai: đúng các bước của
lần chạy đầu tiên, mỗi bước kèm trích dẫn docs để bạn biết mình đang thấy gì.

TL;DR:

- Chuẩn bị: app chạy, repo đã add, kit `story-*` đã tự cài sẵn từ lần mở đầu.
- Bước 1: nêu ý tưởng trong tab ⚡ Workflow — chọn intent rồi bấm Start.
- Bước 2–3: agent phân tích impact, plan lên Linear, chia SF chạy song song
  trên bracket canvas.
- Bước 4–5: bạn trả lời gates B0–B5, các SF merge về một nhánh đích, story kết
  thúc bằng một PR duy nhất.

## Chuẩn bị 5 phút: app chạy, repo đã add, kit đã nằm sẵn

Ba điều kiện trước khi bắt đầu: app Wakii đang mở, dự án đã được thêm vào
app, agent CLI đã cài trên máy. Chưa có? Bài [cài đặt và cập nhật Wakii từ
đầu](/vi/blog/guide-install-update/) lo từ máy trống. Điều kiện thứ ba đáng
kiểm bằng lệnh: lần mở đầu, workflow kit tự cài vào `~/.claude/`, trong đó có
các công cụ `story-*` mà agent dùng suốt quy trình:

```bash
$ ls ~/.claude/bin | grep '^story-' | head -8
story-attempt
story-compact-recovery
story-dashboard-server
story-dashboard.html
story-diff-review
story-launch
story-memory
story-memory-fuse
```

*Nguồn: `ls ~/.claude/bin` trên máy viết bài, lấy 2026-09-08. 25 dòng khớp
prefix, trừ 1 file `.html` — 24 công cụ `story-*` tại thời điểm viết.*

Bạn không cần biết 24 công cụ này làm gì — agent dùng chúng. Chỉ cần chắc
chúng đã ở đó: sự hiện diện của `story-*` là dấu hiệu kit đã cài đúng.

## Bước 1 — Nêu ý tưởng trong tab ⚡ Workflow

Bấm icon ⚡ ở activity bar bên phải của cửa sổ (sidebar ẩn thì `Cmd/Ctrl + L`
mở lại). Panel Superpowers có đúng hai tab; điểm xuất phát là tab ⚡ Workflow —
nơi ghép prompt khởi đầu cho coding agent. Lựa chọn đầu là intent, trích docs
nguyên văn:

> "Intent — what kind of work is this? *New feature*, *Continue work*, or
> *Quick fix*. The intent picks the workflow shape (and skips planning phases
> that don't apply, e.g. quick fixes)."

*Nguồn: docs superpowers panel (EN), mục ⚡ Workflow tab, truy 2026-09-08.*

Lần đầu: chọn New feature, mô tả ý tưởng vài dòng, giữ mode mặc định, bấm
Start. Riêng mode Autonomous tạm bỏ qua ở lần này — nó bảo gate tự phê sau
checkpoint, còn bạn muốn gate dừng hỏi (lý do ở bước 4). Prompt ghép xong đi
tới coding agent và quy trình bắt đầu tự chạy.

## Bước 2 — Impact và plan: phân tích một lần, đăng lên Linear

Agent đầu tiên chạm vào ý tưởng không phải agent viết code. Docs viết:

> "A **phase-0 impact analyst** maps the blast radius first: touch map,
> second-order effects across multiple dimensions, and alternatives — before
> any code exists."

Tiếp theo, kế hoạch được tách nhỏ và đăng lên Linear:

> "The plan is broken into bite-sized tasks and published to **Linear** as
> subtasks, so progress is visible to the whole team — not buried in a chat
> log."

*Nguồn: hai trích dẫn từ docs story workflow, mục The pipeline (bước 1–2),
truy 2026-09-08.*

Toàn bộ quy trình vừa rồi vừa sắp tới nằm gọn trong một dòng, trích nguyên văn
từ docs:

```
idea → impact → plan → epic + SF bracket → parallel SFs → gates → 1 PR per story
```

*Nguồn: docs story workflow, mục "The pipeline", truy 2026-09-08.*

Phân tích chạy đúng một lần ở cấp story — mọi SF kế thừa kết quả qua context
pack thay vì hỏi lại. Plan sống trên Linear chứ không trong chat log cũng có
bài riêng: [Linear là bộ nhớ ngoài](/vi/blog/linear-as-external-memory/).

## Bước 3 — Bracket và các SF chạy song song

Mở tab 🌳 Story và bạn thấy story của mình dạng đồ thị. Docs mô tả đúng những
gì đang trên màn hình: "a live SVG graph of your story: the epic node, its
sub-features, dependency edges, and per-node status colors, with live agent
activity and progress" — node epic trên đỉnh, các SF xếp theo tier phụ thuộc,
cạnh nối cho biết cái gì chờ cái gì.

Cách các SF chạy là phần đáng nhớ nhất của quy trình, trích nguyên văn:

> "Independent sub-features run **in parallel**, each in its own isolated
> worktree and branch."

*Nguồn: docs story workflow, mục 4. Parallel execution, truy 2026-09-08.*

Dịch ra đĩa: mỗi SF một thư mục, một branch, một agent. Hai SF độc lập không
viết vào cùng một cây file, nên xung đột không có chỗ xảy ra. Một SF chỉ khởi
động khi tier trước đã merge hết — độ sâu phụ thuộc thành thứ tự khởi động.

## Bước 4 — Gates B0–B5: gate hỏi, bạn trả lời

Khi các SF báo xong, phần kiểm mới bắt đầu. Story Ops kiểm story theo định
nghĩa hoàn thành, từng gate một:

| Gate | Kiểm tra gì |
|---|---|
| **B0** | Browser test — agent đã thực sự mở app và đi hết flow |
| **B1** | Code + tests xanh |
| **B2** | Checklist trong plan đã tick |
| **B3** | Independent review đã chạy |
| **B4** | Branch đã merge về story branch |
| **B5** | Linear issue chuyển Done |

*Nguồn: bảng Story Ops gates trong docs superpowers panel (dịch nghĩa từng
dòng), truy 2026-09-08.*

Tinh thần của cả sáu gate nằm trong một câu docs — trích nguyên văn:

> "Gates that only self-approve aren't gates; the checks are adversarial by
> design."

*Nguồn: docs story workflow, mục 5. Gates, truy 2026-09-08.*

Đó là lý do bước 1 bảo giữ mode mặc định: gate dừng hỏi bạn thay vì tự phê.
Còn story im lặng giữa chừng thì watchdog lo trước: "The **watchdog** checks
three layers (recent commits, terminal state, Linear progress) before
declaring a stall" — ba lớp rồi mới nói stall, vì agent im lặng có thể đang
build dài.

## Bước 5 — Một nhánh đích, một PR

Song song không có nghĩa là lịch sử chia năm xả bảy. Mỗi mốc tier là một điểm
merge về cùng một nhánh đích của story, trích nguyên văn:

> "Each tier boundary is a merge point into a single destination branch —
> `story/<epic>-<slug>` — which acts as the story's own mainline."

Và khi mọi SF đã qua gates, phần việc của agent dừng ở một kết quả duy nhất:

> "When every sub-feature's gates pass and the story verifies `COMPLETE`, the
> work lands as **one clean PR** — not a dozen interleaved branches."

*Nguồn: hai trích dẫn từ docs story workflow — mục 5. Tiers and one destination
branch và mục 7. One PR per story, truy 2026-09-08.*

Nốt cuối là của bạn: merge PR vào nhánh thật là human gate — agent đưa story
đến trạng thái sạch rồi dừng. Quyết định không thể đảo ngược thuộc về người.

## Kết quả mong đợi sau lần chạy đầu

Verifier chốt mỗi story bằng một verdict, trích docs nguyên văn:

> "The verifier reports one verdict per story: `COMPLETE`, `READY-TO-DONE`,
> `INCOMPLETE`, `VIOLATION`, or `NOT-LAUNCHED`."

*Nguồn: docs superpowers panel, cuối mục Story Ops gates, truy 2026-09-08.*

Với lần chạy đầu, READY-TO-DONE là kết quả khỏe nên mong đợi: mọi gate đã
pass, chỉ còn quyết định chờ bạn. Về thời gian, bài này không hứa con số — nó
phụ thuộc bề rộng story. Chắc chắn nhờ tier: bạn chờ theo tier chậm nhất,
không cộng dồn từng SF độc lập. Muốn xem quy trình chạy thật, [story workflow:
từ ý tưởng đến release](/vi/blog/story-workflow-idea-to-release/) kể lại từ
phía case study.

Đường đi đầy đủ — kèm tám nguyên tắc phía sau cơ chế — nằm trong trang
[story workflow](/vi/docs/story-workflow/); từng nút của panel nằm trong trang
[superpowers panel](/vi/docs/superpowers-panel/).

Mở Wakii, gõ ý tưởng của bạn trong một dòng, bấm Start — và để các gate hỏi
bạn trước khi bất cứ thứ gì được coi là xong.
