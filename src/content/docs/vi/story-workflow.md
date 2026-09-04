---
title: Story workflow
description: Từ một dòng idea đến PR đã merge — impact analysis, planning, sub-feature song song, gates, và watchdog.
order: 2
---

Story workflow của Wakii biến một dòng mô tả feature thành code đã merge,
đã verify — với đội agent làm việc và các gates giữ cho họ trung thực.

## Pipeline

```
idea → impact → plan → epic + SF bracket → parallel SFs → gates → 1 PR per story
```

### 1. Idea → impact analysis

Bạn mô tả feature. Một **phase-0 impact analyst** vẽ sơ đồ blast radius
trước: touch map, hệ quả cấp hai trên nhiều chiều, và các phương án —
trước khi có bất kỳ code nào.

### 2. Plan

Plan được bẻ thành task nhỏ và publish lên **Linear** dưới dạng subtask,
nên tiến độ cả team nhìn thấy — không chôn trong chat log.

### 3. Epic + SF bracket

Feature lớn thành một **story**: một epic với các sub-feature (SF) sắp
theo tier phụ thuộc. Bracket canvas trong [Superpowers panel](/vi/docs/superpowers-panel/)
vẽ đồ thị này trực tiếp — epic trên đỉnh, các tier bên dưới, cạnh thể hiện
quan hệ phụ thuộc.

### 4. Thực thi song song

Các sub-feature độc lập chạy **song song**, mỗi cái một worktree và branch
riêng biệt. Một dev executor implement từng task; reviewer soi diff trước
khi task được tính là xong.

### 5. Gates

Mỗi sub-feature phải pass các [Story Ops gates](/vi/docs/superpowers-panel/#story-ops-gates)
(B0–B5): code + tests xanh, plan tick đủ, review độc lập, đã merge, issue
Done — và một lượt đi thật trên browser để xem kết quả. Gate mà chỉ tự
duyệt thì không phải gate; các bước kiểm được thiết kế adversarial từ đầu.

### 6. Watchdog

Story hay stall — agent gặp ngõ cụt, review loop mãi, merge conflict.
**Watchdog** phát hiện sub-feature bị stall và tự resume từ trạng thái
tốt cuối cùng, nên story dài không cần ai ngồi canh.

### 7. Một PR cho mỗi story

Khi mọi sub-feature đã pass gates và story verify `COMPLETE`, toàn bộ công
việc về **một PR sạch** — không phải chục branch cài răng lược.

## Mọi thứ nằm ở đâu

- Launch và theo dõi run ở tab ⚡ Workflow.
- Xem bracket, gates, và watchdog ở tab 🌳 Story.
- Đội 9 agent đứng sau được giới thiệu ở [Agents & kit](/vi/docs/agents-and-kit/).
