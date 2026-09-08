---
title: "Skill /story-workflow: cả câu chuyện trong một lệnh"
description: "Gõ /story-workflow là một feature lớn chạy thành story: một epic, nhiều sub-feature song song, một nhánh đích. Bài này đọc source skill thật — rubric vào cửa, định dạng bracket, context pack kế thừa phân tích, watchdog ba tầng."
pubDate: "2026-09-10"
category: "tech"
tags: ["skills", "story-workflow", "workflow"]
draft: false
heroImage: "/blog/heroes/skill-story-workflow.png"
---

Trong [tour kỹ năng public của Wakii](/vi/blog/skills-catalog-tour/), có một skill
được nhắc tên mà chưa được giải mã: story-workflow — "chạy tính năng lớn dưới dạng
story". Vậy cụm "tính năng lớn" được machine hóa tới mức nào? Bài này mở thẳng file
source của skill — ~/.claude/skills/story-workflow/SKILL.md — để trả lời bốn câu
hỏi: feature nào đủ lớn để thành story, bracket file có dạng gì, các sub-feature
kế thừa phân tích epic bằng cơ chế nào, và làm sao biết một agent đang chạy thay
vì đã chết. Ví dụ xuyên suốt là một story đang chạy thật — chính story đang sản
xuất bài này.

TL;DR:

- /story-workflow biến một feature thành story: một epic trên Linear, nhiều
  sub-feature (SF) chạy song song, một nhánh đích gom tất cả.
- Rubric vào cửa nằm nguyên văn trong source: tách story khi feature vượt quá
  3 sub-features hoặc 10 tasks.
- Bracket file là bản vẽ dọc mà panel Story parse trực tiếp: mỗi SF một khối
  với Tier, linear, What, Depends on, Tasks.
- Context pack vật thể hóa nguyên tắc "analyze once, inherit many": SF đọc pack
  của mình thay vì tự tổng hợp lại phân tích epic.
- Watchdog chẩn đoán ba tầng trước khi kết luận agent chết — có story thật từng
  tưởng 4 SF chết qua đêm, hóa ra 0 cái chết thật.

## Feature nào đủ lớn để thành story? Có rubric

Mở đầu file skill là phần mô tả, và điều kiện kích hoạt được viết như một con số
cụ thể chứ không phải cảm tính:

```text
or when a feature is large enough to need multiple parallel
workflows (rubric: >3 sub-features or >10 tasks)
```

*Nguồn: ~/.claude/skills/story-workflow/SKILL.md (frontmatter), lấy 2026-09-08.*

Rubric trả lời đúng câu hỏi mà người làm phần mềm nào cũng gặp: đến bao giờ nên
chia nhỏ? Dưới ngưỡng — một workflow đơn lẻ đủ dùng. Vượt ngưỡng — feature tách
thành epic + SF: mỗi SF là một sub-issue Linear riêng, một worktree riêng, một
agent riêng. Skill còn đặt rubric ngược cho từng SF để chống chia quá mảnh: mục
tiêu mỗi SF là 8-15 tasks, SF dưới 6 tasks thì gộp với SF gần nhất cùng loại việc.
Chia cũng không chỉ dựa vào kích thước: bộ rubric C1-C5/V1-V3 hỏi mỗi ứng viên SF
ba câu — nó có kết quả riêng không, touch map có đè lên SF khác không, giao diện
giữa chúng đã chốt chưa. Và trước khi đề xuất danh sách SF, skill bắt đọc source
code thật: touch map phải đến từ code, không từ trí nhớ.

## Bracket file: bản vẽ dọc mà máy parse được

Story bắt đầu bằng một file. Sau ba bước phân tích — impact, spec, plan — kết quả
được đổ vào bracket file theo định dạng mà skill gọi là STRICT:

```text
Bracket file format (STRICT — the Story tab parser reads this)

## SF-1 Types + Contract
Tier: 0
linear: MY-144
What: shared carrier types + BE contract
Depends on: —
Tasks: response-types / payload-types / enums
```

*Nguồn: ~/.claude/skills/story-workflow/SKILL.md, lấy 2026-09-08.*

Chữ STRICT không phải cảnh cáo vô thừa nhận: chính file này được panel Story parse
trực tiếp để vẽ graph — epic ở đỉnh, các node SF xếp theo tier. Mỗi trường là một
câu trả lời máy đọc được: Tier 0 nghĩa là không chờ ai; Depends on vẽ cạnh phụ
thuộc; linear nối node với issue trên Linear. Hai quy tắc viết cho thấy bracket
được thiết kế để sống cả epic: What ghi theo behavior đầu-cuối demo được khi SF
xong, không ghi theo layer kiến trúc; và không ghi file path hay số dòng, vì
"bracket sống cả epic, path chết sau 1 refactor" — nguyên văn trong source. Dòng
Destination: story/<epic-id>-<slug> ngay đầu file chốt nhánh đích duy nhất mà mọi
SF fork từ đó và merge về. Bản chất tier và nhánh đích đã có
[bài riêng bàn kỹ](/vi/blog/long-tasks-bracket-tiers/) — bài này chỉ ghi nhận cơ
chế file: một bracket là một bản vẽ dọc mà cả người và DAG orchestrator cùng đọc.

## Context pack: phân tích một lần, SF nào cũng kế thừa

Cốt lõi của skill là một dòng in đậm ngay đầu file:

```text
Core principle: analyze once, inherit many times. Phase 0-2 quality
happens ONCE at epic level with ALL principles at maximum strictness;
each SF (sub-feature) then runs only Phase 3-5 (plan-detail, execute,
verify), reading the epic spec.
```

*Nguồn: ~/.claude/skills/story-workflow/SKILL.md, lấy 2026-09-08.*

Để nguyên tắc đó không nằm trên giấy, skill bắt viết context pack cho từng SF ngay
lúc CREATE: file docs/superpowers/contexts/sf-<n>.md, định dạng 4 section bắt
buộc — Spec slice, Touch map, ACCEPTANCE user-visible, Boundary. Chi tiết vận hành
quan trọng nhất là vị trí: pack nằm trong repo chính, nên khi SF fork worktree từ
nhánh đích, pack đi theo git — không phụ thuộc session nào còn sống. SKILL.md viết
thẳng mục đích: "SF agent đọc file này THAY VÌ tự tổng hợp từ bracket + epic +
comments".

Đây là ví dụ thật — dòng mở đầu của context pack của SF-2, series skills mà bài
này thuộc về:

```text
> Đọc file này THAY VÌ tự tổng hợp. Epic spec:
> docs/superpowers/specs/2026-09-08-blog-batch2-design.md (rev 3).
> Bracket: docs/superpowers/brackets/fi373-blog-batch2.md.
```

*Nguồn: docs/superpowers/contexts/fi373-sf-2.md, lấy 2026-09-08.*

Agent viết bài này nhận đúng file đó, đọc đúng phần spec slice của mình, và không
phải đặt lại một câu hỏi nào epic đã trả lời. Phân tích chạy một lần ở cấp epic —
chi phí trả một lần, mười ba bài chỉ việc kế thừa.

## Watchdog: agent im lặng chưa chắc đã chết

Story chạy qua đêm, sáng ra một SF vẫn treo vàng — nó đã chết hay đang chạy? Skill
dành hẳn một section stall detection, và nguyên tắc số 5 mang tên đúng tinh thần
đó: "Idle ≠ chết". Một Claude session idle vẫn giữ nguyên todo-list và context;
resume là gửi input mới đánh thức, không dựng lại worktree từ đầu. Trước khi kết
luận, chạy chẩn đoán ba tầng:

```text
1. git log trong worktree SF — có commit mới không?
   (có = agent đang chạy, chỉ chậm)
2. terminal list — symbol ⠂ (running) hay ✳ (idle)?
3. Chỉ khi cả hai tĩnh hoàn toàn → RESUME
```

*Nguồn: ~/.claude/skills/story-workflow/SKILL.md (mục Stall detection), lấy
2026-09-08.*

Ba tầng này tương ứng với thứ mà [docs story workflow](/vi/docs/story-workflow/)
gọi là watchdog 3-layer check: recent commits, terminal output, Linear state. Phần
đáng giá nhất là bài học đi kèm, trích nguyên văn: "Bài học FI-151: 4 SF tưởng
'chết qua đêm' — 2 đang tự chạy, 2 idle-sống; 0 cái thật sự chết." Kết luận vội
không chỉ sai — nó tốn tiền: worktree tạo trùng, state đứt ngang, tier sau chờ
thêm một đêm nữa. Watchdog vì thế không phải công cụ giám sát để trấn an; nó là
điều kiện để chia việc thành các agent chạy dài qua đêm mà không cần ai thức canh.

## Câu chuyện thật: bracket của chính bài này

Toàn bộ cơ chế trên đang chạy ngay lúc bạn đọc. Story FI-373 — 44 bài blog — được
quản bởi một bracket thật nằm trong repo:

```text
# Story: FI-373 — Blog batch 2 — hoàn thiện mọi facet: 44 bài mới (skills · features · guides · arch · logs)

Destination: story/fi373-blog-batch2

## SF-2 Series Skills — 13 bài
Tier: 1
linear: FI-375
Depends on: SF-1
```

*Nguồn: docs/superpowers/brackets/fi373-blog-batch2.md (trường What và Tasks của
SF-2 đã lược), lấy 2026-09-08.*

Sáu SF của story xếp thành ba tier — vẽ lại từ các trường Depends on:

```ascii
FI-373 — đích: story/fi373-blog-batch2

tier 2        SF-6 Convergence QA (FI-379)
               ↑      ↑        ↑      ↑
tier 1  SF-2 Skills  SF-3 Features  SF-4 Guides  SF-5 Arch+OSS+Logs
        (FI-375)     (FI-376)       (FI-377)     (FI-378)
               ↑
tier 0        SF-1 Editorial infra (FI-374)
```

*Nguồn: docs/superpowers/brackets/fi373-blog-batch2.md, lấy 2026-09-08.*

Đọc theo luật bracket: SF-1 — hạ tầng editorial (manifest lint, claims registry,
hero pipeline) — là tier 0, đã merge về nhánh đích ngày 08-09-2026. Bốn series nội
dung chạy song song ở tier 1; bài bạn đang đọc là một trong 13 task của SF-2. SF-6
hội tụ ở tier 2, chỉ bắt đầu khi cả bốn series đã nằm về nhánh đích. Bracket còn
là nơi thứ tự được ràng buộc bằng văn bản: spec của story chốt "Editorial docs
(registry/matrix/style-guide/evidence-pack) FROZEN sau SF-1 — thêm mục qua
coordinator" — nền đóng băng trước khi các tầng trên bắt đầu xây, để 13 bài đang
viết không thay đổi sàn dưới chân nhau. Một epic, sáu SF, một nhánh đích: đúng bản
vẽ ở các mục trên, đang chạy.

Vòng đời đầy đủ của một story — từ lúc chốt bracket đến lúc PR mở — được kể trong
[story workflow: từ ý tưởng đến PR](/vi/blog/story-workflow-idea-to-release/); cơ
chế gates B0-B5, tám principles và merge topology nằm trong
[tài liệu story workflow](/vi/docs/story-workflow/). Wakii là agentic IDE với đội
superpowers dựng sẵn — tải về, mô tả ý tưởng bằng một dòng, và để bracket lo phần
còn lại.
