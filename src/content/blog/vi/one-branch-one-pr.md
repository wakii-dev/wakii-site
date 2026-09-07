---
title: "Một nhánh đích, một PR: nơi story hội tụ"
description: "Story dài để lại hàng chục commit rải rác trên nhiều nhánh — duyệt cái gì, và duyệt ở đâu? Bài này đi vào kỷ luật hội tụ của story workflow: mọi sub-feature về một nhánh đích story/<epic>-<slug>, cả story khép lại bằng một PR, và merge commit là mốc tra ngược được."
pubDate: "2026-08-31"
category: "tech"
tags: ["git", "story-workflow", "workflow"]
draft: false
---

Một story dài không phải công việc của một agent: bracket chia nó thành các
sub-feature chạy song song, mỗi cái một worktree, một branch, một agent — và
mỗi agent để lại commit trên nhánh của mình. Đến lúc khép story, người duyệt
đứng trước hàng chục commit rải rác trên nhiều nhánh: đọc tuần tự thì không
biết cái nào thuộc phần việc nào, đọc theo nhánh thì mất toàn cảnh. Vấn đề
không phải là thiếu thứ để review — là thiếu một đơn vị review. Story workflow
xử lý vấn đề này bằng cấu trúc, không bằng kỷ luật cá nhân: cả story hội tụ về
một nhánh đích, và nhánh đích khép lại bằng đúng một PR.

TL;DR:

- Chạy song song không đồng nghĩa lịch sử phân tán: mỗi biên tier là một điểm
  merge vào một nhánh đích duy nhất — `story/<epic>-<slug>`, mainline riêng của
  story.
- Cả story khép lại bằng đúng một PR: một diff có tự sự để duyệt, thay vì
  hàng chục commit rải rác.
- PR là bằng chứng tổng: tiêu đề của hai PR thật trong bài — ở hai repo khác
  nhau — tự kể đủ story đã giao gì mà chưa cần mở diff.
- Merge commit là mốc bất biến: từ SHA trên main, một lệnh `gh pr view` trả
  ngược về PR, branch và story sinh ra nó.
- Agents dừng ở PR: merge về mainline thật là human gate — không gì không hoàn
  tác được xảy ra khi chưa có người gật đầu.

## Chục nhánh vào, một nhánh ra

Song song ở cấp sub-feature chỉ là nửa câu chuyện — nửa còn lại là điểm hội
tụ. Bracket xếp sub-feature theo tier và thứ tự merge đi theo đúng bản đồ đó
(bản đồ tier đã là bài riêng:
[bracket và tier: bản đồ cho dự án dài](/vi/blog/long-tasks-bracket-tiers/)).
Giữ lại đúng một luật: các nhánh làm việc không tự toả về bốn phương — chúng
gặp nhau tại một điểm, và docs gọi tên điểm đó bằng câu nguyên văn:

> "Mỗi biên tier là một điểm merge vào một nhánh đích duy nhất —
> `story/<epic>-<slug>` — đóng vai mainline riêng của story."

*Nguồn: src/content/docs/vi/story-workflow.md, mục "5. Tier và một nhánh đích
duy nhất", lấy 2026-09-07.*

Vẽ lại toàn bộ khối nhánh của một story theo luật đó:

```ascii
sf-1 ●───┐
sf-2 ●───┤     merge tại biên tier
sf-3 ●───┼───► story/<epic>-<slug> ───► 1 PR ───► main
sf-4 ●───┘       nhánh đích của story      một PR    mainline thật

  chục nhánh làm việc vào ─── một nhánh đích ra ─── một PR chốt
```

*Nguồn: sơ đồ khái niệm dựng theo luật nhánh đích trong
src/content/docs/vi/story-workflow.md, lấy 2026-09-07.*

Đọc từ trái sang phải: nhiều nhánh làm việc — mỗi agent một nhánh; một nhánh
đích ở giữa; và ở cuối, đúng một pull request nối nhánh đích với mainline
thật. Không có mũi tên nào đi tắt từ nhánh sub-feature sang main: công việc
của một agent vào mainline qua nhánh đích, và nhánh đích vào main qua PR.

## PR là bằng chứng tổng

"Một PR cho mỗi story" nghe như quy tắc hình thức — cho đến khi đặt nó cạnh
cách con người thực sự review. Duyệt ba mươi commit rải rác là duyệt ba mươi
mảnh chưa ghép; duyệt một PR là duyệt một diff duy nhất, kèm bản tự sự ở
description. Docs không nói "một PR cho gọn" mà nói "một PR cho bằng chứng" —
trích nguyên văn:

> "Khi mọi sub-feature đã pass gates và story verify `COMPLETE`, toàn bộ công
> việc về **một PR sạch** — không phải chục branch cài răng lược."

*Nguồn: src/content/docs/vi/story-workflow.md, mục "7. Một PR cho mỗi story",
lấy 2026-09-07.*

Hai PR thật của hai repo đang chạy workflow này cho thấy "bằng chứng tổng" trông
như thế nào. Trên repo site của Wakii:

```bash
$ gh pr list --repo wakii-dev/wakii-site --state merged
2	FI-349 Blog redesign — layout, category taxonomy, SEO depth, multi content type	story/fi349-blog-redesign	MERGED	2026-09-07 16:13:51 +0000 UTC
1	FI-339: Blog features — tutorials, tech notes, build logs (en/vi)	story/fi339-blog-features	MERGED	2026-09-07 09:17:48 +0000 UTC
```

*Nguồn: `gh pr list --repo wakii-dev/wakii-site --state merged`, lấy
2026-09-07.*

Dòng PR #1 tự kể: story FI-339 đã giao cho blog ba dạng nội dung — tutorial,
tech note, build log — trên hai ngôn ngữ. Chưa cần mở diff, người duyệt đã biết
story giao gì; mở diff, cả story nằm trong một khối duy nhất. Danh sách chụp
tại thời điểm viết; bài này đọc dòng PR #1 — story đã dựng nền cho chính blog
bạn đang đọc.

Và trên repo thứ hai — hub-store, một dự án production chạy cùng workflow:

```bash
$ gh pr list --repo wakii-dev/hub-store --state merged
1	FI-326: BFF API docs Swagger (OpenAPI) — 84 REST endpoints / 12 tags	story/fi326-api-docs-swagger	MERGED	2026-09-06 10:46:00 +0000 UTC
```

*Nguồn: `gh pr list --repo wakii-dev/hub-store --state merged`, lấy
2026-09-07.*

Hai repo này khác nhau tận gốc: một site marketing, một hệ thống production.
Nhưng đọc hai transcript, dạng mốc khép story giống hệt nhau: một story
(FI-339 / FI-326), một branch theo quy ước `story/<epic>-<slug>`, một PR khép
lại toàn bộ. Story có thể dài, sub-feature có thể toả ra thành nhiều nhánh —
điểm duyệt cuối vẫn là một PR sạch.

## Merge-ngược an toàn

PR merge xong để lại trên main một merge commit — và giá trị thật của mốc này
nằm ở phía sau: lúc cần tra ngược. "Đoạn thay đổi này vào main lúc nào, từ
story nào?" là câu hỏi lặp lại trong mọi dự án. Kỷ luật một-PR biến câu trả
lời từ chuyện hồi tưởng thành một lệnh:

```bash
$ gh pr view 1 --repo wakii-dev/wakii-site --json number,title,headRefName,state,mergedAt,mergeCommit
{"headRefName":"story/fi339-blog-features","mergeCommit":{"oid":"3d9a7c3255f6c80cc7e6dceed4ba208380470172"},"mergedAt":"2026-09-07T11:50:15Z","number":1,"state":"MERGED","title":"FI-339: Blog features — tutorials, tech notes, build logs (en/vi)"}
```

*Nguồn: `gh pr view 1 --repo wakii-dev/wakii-site --json
number,title,headRefName,state,mergedAt,mergeCommit`, lấy 2026-09-07.*

Đọc ngược từ trường `mergeCommit`: SHA `3d9a7c3…` là merge commit nằm trên
main; `headRefName` trả về branch nguồn `story/fi339-blog-features`; và tên
branch trả về story FI-339. Ba bước — từ một commit trên main đến story sinh
ra nó — không cần lục chat log, không cần hỏi ai. Repo thứ hai trả lời cùng
một dạng:

```bash
$ gh pr view 1 --repo wakii-dev/hub-store --json number,title,headRefName,state,mergedAt,mergeCommit
{"headRefName":"story/fi326-api-docs-swagger","mergeCommit":{"oid":"0144d8018c1c26bc66bc79009e1e121741adef5f"},"mergedAt":"2026-09-06T10:53:07Z","number":1,"state":"MERGED","title":"FI-326: BFF API docs Swagger (OpenAPI) — 84 REST endpoints / 12 tags"}
```

*Nguồn: `gh pr view 1 --repo wakii-dev/hub-store --json
number,title,headRefName,state,mergedAt,mergeCommit`, lấy 2026-09-07.*

"An toàn" ở đây không phải cảm tính: nó dựa trên ba thứ không đổi — SHA của
merge commit không bao giờ đổi, PR giữ số định danh vĩnh viễn, và branch nguồn
đặt tên theo quy ước `story/<epic>-<slug>`. Trong lúc story chạy, trạng thái
sống ở nơi khác — Linear giữ vai bộ nhớ ngoài của đội agent, như bài trước đã
mổ xẻ ([Linear là bộ nhớ ngoài của đội
agent](/vi/blog/linear-as-external-memory/)). Sau khi story kết thúc, bộ nhớ
nằm ngay trên main: mỗi story để lại đúng một merge commit, tra ngược được
bằng lệnh.

## Cửa duy nhất cho người duyệt

Một hệ quả ít được nói tới hơn của "một PR cho mỗi story": nó tạo ra đúng một
điểm dừng cho con người. Bước cuối của tự động hoá không phải merge — là
"sẵn sàng để merge". Docs viết nguyên văn:

> "Agents đưa nhánh đích đến trạng thái sạch, đã verify — một PR cho mỗi
> story — rồi DỪNG. Không gì không hoàn tác được xảy ra khi chưa có người
> gật đầu."

*Nguồn: src/content/docs/vi/story-workflow.md, mục "4. Human gates — người nắm
thứ không hoàn tác được", lấy 2026-09-07.*

Chữ "DỪNG" là phần quan trọng nhất của luật. Trước PR, agents tự quyết được
nhiều thứ: chia tier, chạy song song, pass gate, sửa theo review. Sau PR, mọi
thứ thuộc về người: đọc một diff, đọc một description, gật một lần. Một PR cho
mỗi story là một quyết định cho mỗi story — với một bằng chứng tổng, thay vì
ba mươi quyết định nhỏ rải khắp lịch sử.

Cả vòng đời — bracket chia sub-feature, tier xếp thứ tự, gates chốt chất lượng,
một PR khép story — được tài liệu hoá trên trang
[story workflow](/vi/docs/story-workflow/).

Nếu repo của bạn đang giữ nhiều nhánh story cùng sống, thử đặt lại đúng hai
điều kiện: một nhánh đích cho mỗi story, một PR để khép story. Rồi chạy
`gh pr list --state merged` trên main và tự đọc tiêu đề các PR — tiêu đề có tự
kể được story không, đó là bài kiểm tra cho kỷ luật nhánh.
