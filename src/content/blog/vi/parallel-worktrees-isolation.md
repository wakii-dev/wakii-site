---
title: "Song song bằng worktree isolation"
description: "Chạy nhiều agent trên một repo mà chung thư mục là giành file và ghi đè lịch sử commit. Bài này mổ xẻ cơ chế isolation của Wakii — mỗi SF một worktree, mỗi worktree một branch — kèm transcript git thật, và chỉ ra vì sao commit atomic là đơn vị rollback."
pubDate: "2026-08-28"
category: "tech"
tags: ["worktree", "git", "agents"]
draft: false
---

Cho hai agent chạy song song trên cùng một dự án mà không tách không gian làm
việc, bạn nhận được thứ song song trên danh nghĩa thôi. Agent A đang sửa dở một
file thì agent B commit luôn — kèm theo nửa cái thay đổi chưa xong của A. Agent
B ghi đè lên phần A vừa viết; A chạy lại build và không hiểu vì sao test đỏ.
Trên đĩa chỉ có một tập file, nhưng có hai bàn tay cùng chạm vào nó cùng lúc.
Wakii giải bài toán này bằng một cơ chế có sẵn của git chứ không phải của
framework: worktree isolation.

TL;DR:

- Worktree cho phép cùng một repo nằm ở nhiều thư mục, mỗi thư mục checkout một
  branch riêng — sự song song bắt đầu từ đĩa, không phải từ lời hứa.
- Mỗi sub-feature (SF) của một story nhận một worktree và một branch riêng, nên
  hai agent không thể giành file của nhau: chúng đứng trong hai cây thư mục
  khác nhau.
- Commit atomic là đơn vị rollback: một cặp bài VI+EN là một commit — revert
  một commit không kéo theo bài khác.
- Toàn bộ transcript trong bài lấy trực tiếp bằng `git worktree list` và `git
  log` trên máy thật, ngày 2026-09-07.

## Chung một thư mục, song song chỉ là danh nghĩa

Mô hình "chia việc cho nhiều agent" hay bị hiểu thành "mở nhiều agent trong
cùng một thư mục dự án". Khác nhau ở đó: chia việc là chia danh sách task, còn
không gian ghi file vẫn chỉ là một. Khi hai agent cùng ghi vào một cây thư mục,
kết quả phụ thuộc thứ tự xảy ra — ai ghi sau thì thắng, và lịch sử commit trộn
lẫn công việc của cả hai:

```ascii
một thư mục dùng chung — ai ghi sau đè lên ai ghi trước

  /project/                        agent A: sửa navigation.ts (dở dang)
    ├── navigation.ts   ◄── A      agent B: sửa navigation.ts (dở dang)
    ├── config.ts       ◄── B        → cùng một file, hai bản dở
    └── …                            → commit của B lôi theo phần dở của A
                                     → revert commit của B mất luôn phần A
```

*Nguồn: sơ đồ khái niệm minh họa tình huống mà luật "mỗi SF một worktree" trong
src/content/docs/vi/story-workflow.md sinh ra để chặn, lấy 2026-09-07.*

Vấn đề không nằm ở việc agent làm ẩu — nó nằm ở cấu trúc: một không gian ghi
chung không cho phép tách trách nhiệm. Muốn tách, phải chia không gian trước,
rồi mới chạy song song. Đó chính là điều hai section sau làm.

## Mỗi SF một worktree

Worktree là tính năng gốc của git: cùng một repo có thể có nhiều thư mục làm
việc, mỗi thư mục nằm trên một branch khác nhau. Không copy repo, không
submodule — chỉ là git mở thêm một cái cửa vào cùng kho lịch sử. Wakii lấy
chính cơ chế này làm đơn vị isolation của story: bracket chia story thành các
SF, và mỗi SF được cấp một worktree với một branch riêng.

Trên máy đang viết loạt bài này, danh sách worktree tại thời điểm chụp gồm bốn
dòng:

```bash
$ git worktree list
/Users/hoivu/Desktop/projects/wakii-site                           73d0e55 [main]
/Users/hoivu/orca/workspaces/wakii-site/sf-2-series-a-self-working acfa59b [wakii-dev/sf-2-series-a-self-working]
/Users/hoivu/orca/workspaces/wakii-site/sf-3-series-b-long-tasks   1462b45 [wakii-dev/sf-3-series-b-long-tasks]
/Users/hoivu/orca/workspaces/wakii-site/sf-4-series-c-evidence     0f92761 [wakii-dev/sf-4-series-c-evidence]
```

*Nguồn: `git worktree list`, lấy 2026-09-07.*

Đọc theo cột: mỗi dòng là một thư mục trên đĩa, cột giữa là commit đang
checkout, cột trong ngoặc vuông là branch. Dòng đầu là checkout chính trên
`main`. Ba dòng còn lại là ba SF của một story blog đang chạy thật — Series A,
Series B (worktree chứa bài bạn đang đọc) và Series C — mỗi SF một thư mục, một
branch, một agent. Trong ngày 2026-09-07, danh sách này từng dài hơn: một story
blog redesign khác cũng đang chạy ba worktree song song trên cùng repo.
Worktree sinh ra khi SF khởi động và rời danh sách khi việc của nó đã merge.

Luật này nằm trong docs, viết đúng một câu — trích nguyên văn:

> "Các sub-feature độc lập chạy **song song**, mỗi cái một worktree và branch
> riêng biệt."

*Nguồn: src/content/docs/vi/story-workflow.md, mục "4. Thực thi song song", lấy
2026-09-07.*

Và đây là câu trả lời cho câu hỏi "vì sao hai agent không thể giành file của
nhau": giành file đòi hỏi cùng một đường dẫn, mà hai agent đứng ở hai đường dẫn
gốc khác nhau. Agent của SF-2 ghi file dưới thư mục của SF-2; agent của SF-3
ghi dưới thư mục của SF-3. Không có file chung nào trên đĩa — xung đột không
bị "xử lý", nó không có chỗ xảy ra.

## Hai worktree cạnh nhau trên đĩa

```ascii
một repo — hai worktree — hai agent viết hai tập file khác nhau

~/Desktop/projects/wakii-site/         branch: main (checkout chính)
orca/workspaces/wakii-site/
  ├── sf-2-series-a-self-working/      branch: wakii-dev/sf-2-series-a-self-working
  │    agent SF-2 → chỉ ghi bài Series A trong thư mục này
  └── sf-3-series-b-long-tasks/        branch: wakii-dev/sf-3-series-b-long-tasks
       agent SF-3 → chỉ ghi bài Series B trong thư mục này

  hai thư mục khác nhau → không đường dẫn chung → không file nào để giành
  hai branch khác nhau  → hai lịch sử commit tách rời đến điểm hợp nhất
  điểm hợp nhất         → cả hai merge về cùng nhánh đích story/<epic>-<slug>
```

*Nguồn: dựng từ output `git worktree list` phía trên; luật nhánh đích trong
src/content/docs/vi/story-workflow.md, lấy 2026-09-07.*

Cơ chế hợp nhất về nhánh đích giữ nhẹ ở đây — nó là chủ đề của một bài khác
trong loạt này. Điều cần thấy ở mức vật lý: sự tách bạch xảy ra ngay từ hệ
thống file, trước cả khi git có việc gì phải làm giữa hai agent.

## Commit atomic là đơn vị rollback

Isolation giải tranh chấp trên đĩa. Commit atomic giải tranh chấp trong lịch sử.
Nguyên tắc: mỗi commit chứa đúng một đơn vị công việc trọn vẹn — không gom nhiều
ý vào một commit, không để một ý vắt qua hai commit. Trên nhánh đang viết bài
này, sáu commit gần nhất là một transcript sống của nguyên tắc đó:

```bash
$ git log --oneline -6
1462b45 docs(plan): tick T1 long-tasks-bracket-tiers @480d058 (VI 1227 / EN 1141 từ, lint xanh)
480d058 feat(blog): long-tasks-bracket-tiers EN+VI (T1 — matrix #8)
eff8fc7 docs(plan): sf-3 series-b 8 tasks (7 post + consistency-pass) — plan-critic FIX-P0-FIRST resolved (T3 field thật fi245/fi339 + 3 P1 + 2 P2)
e99cdd0 fix(review): P1 code-reviewer — plan ACCEPTANCE đọc đúng hướng sort DESC (pilot cuối list) + VI pilot quote nguyên văn docs VI
62f5f69 feat(blog): pilot zero-setup-agent-team EN+VI đi hết pipeline (T8 — matrix #1)
9ce442c docs(editorial): writer runbook (T7 — checklist 8 bước per-post, D4 link locale, D7 draft fallback, case-study double-pass)
```

*Nguồn: `git log` trên nhánh story, lấy 2026-09-07.*

Đọc từng dòng: `480d058` chứa đúng một cặp bài — bản VI và bản EN của bài trước
trong loạt — không lẫn gì khác. `62f5f69` là cặp pilot. Các dòng `docs(plan)` và
`docs(editorial)` là thay đổi tài liệu, tách rời khỏi bài viết. Hệ quả rollback:
muốn gỡ bài trước mà giữ nguyên pilot, revert đúng `480d058` — một lệnh, không
đụng đến dòng nào khác. Trong mô hình chung thư mục, commit thường gom tất cả
những gì đang nằm trong working directory — kể cả nửa thay đổi của agent khác —
nên revert một ý tưởng kéo theo cả nửa ý tưởng còn lại.

Quy tắc này không phải sở thích cá nhân của người viết — nó là trách nhiệm được
ghi trong bảng vai của kit, trích nguyên văn:

> "Implement task trong worktree biệt lập, commit atomic"

*Nguồn: src/content/docs/vi/agents-and-kit.md, hàng task-executor trong bảng
vai, lấy 2026-09-07.*

Hai quy tắc trong bài — mỗi SF một worktree, mỗi đơn vị việc một commit — là hai
nửa của cùng một lời hứa: chạy song song mà không phải trả giá bằng sự hỗn loạn.
Bài trước trong loạt, [bracket và tier: bản đồ cho dự án dài](/vi/blog/long-tasks-bracket-tiers/),
đã vẽ bracket và tier ở mức bản đồ; bài này hạ xuống mức vật lý: thư mục trên
đĩa, branch, commit. Trách nhiệm từng vai — trong đó task-executor giữ cả hai
quy tắc trên — liệt kê đủ trong trang [agents & kit](/vi/docs/agents-and-kit/),
còn toàn bộ vòng đời story nằm ở trang [story workflow](/vi/docs/story-workflow/).

Muốn tự thấy sự khác nhau: mở Wakii, mô tả ý tưởng bằng một dòng — pipeline tự
tách story thành các SF, chạy chúng song song trong worktree riêng, rồi gom về
một nhánh đích khi xong. Hoặc đơn giản hơn: chạy `git worktree list` trên một
repo đang có nhiều agent làm việc, và đếm xem bao nhiêu dòng đang cùng chia sẻ
một kho lịch sử mà không chạm vào file của nhau.
