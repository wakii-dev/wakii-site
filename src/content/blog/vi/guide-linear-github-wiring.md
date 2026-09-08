---
title: "Nối Linear và GitHub: từ issue đến worktree, từ worktree đến PR"
description: "Hai phép nối trong Settings → Integrations: tạo worktree từ issue với tên tự điền và branch name do Linear đề xuất, status sync opt-in theo team, và để agent đọc Linear qua orca linear."
pubDate: "2026-09-23"
category: "tutorial"
tags: ["guide", "linear", "workflow"]
draft: false
---

Việc của bạn nằm ở ba nơi: issue trên Linear, review trên GitHub, code trong
worktree. Không có cầu nối thì chính bạn là người đồng bộ — chép tên issue
sang tên branch, dán link PR ngược về issue, tự đi mở tab CI xem xanh chưa.
Wakii nối cả hai nguồn đó vào worktree: tạo worktree từ một issue là nó đã
biết mình đang làm việc cho issue nào, và PR quay về đúng chỗ đó. Bài này đi
qua từng phép nối và những chỗ hay vấp: token, scopes, rate limit.

TL;DR:

- GitHub và Linear nối trong Settings → Integrations; review, checks, Actions
  hiện ngay trong worktree.
- Tạo worktree từ issue: composer tự điền tên và gắn issue ID; Linear có
  branch name gợi ý thì dùng luôn tên đó.
- Status sync (issue tự chuyển In Progress khi tạo worktree) là opt-in theo
  team — không bật thì agent không tự đổi state thay bạn.
- Agent đọc và ghi Linear qua `orca linear`; gắn link PR lên issue là một
  lệnh.
- Token hết hạn hay rate limit có bộ lệnh kiểm tra trong nửa phút.

## Nối GitHub: review, checks và Actions nằm ngay trong worktree

Mục tiêu của phép nối này không phải "hiện thông báo" — nó là đưa toàn bộ
trạng thái review vào nơi bạn đang nhìn code. Docs mô tả thẳng:

> "Hosted code review is a first-class part of the worktree. Orca links
> worktrees to their pull requests or merge requests, surfaces review state
> inline, and lets you triage issues without leaving the app."

*Nguồn: docs "Hosted reviews, issues & Actions", truy 2026-09-08.*

Cách nối: mở Settings → Integrations và kết nối provider mà repo của bạn
dùng — GitHub có phần Actions và issue sâu nhất. Sau khi nối, ba thứ xảy ra
ngay trong worktree. Checks, reviews và comments của GitHub mở inline trong
tab PR. Khi một check Actions thất bại, docs ghi:

> "Failed GitHub Actions checks show up as a red chip on the worktree. Click
> through to see the failing job logs inline."

Và khi bạn không muốn tự sửa check lỗi, action **Fix broken checks** trong
PR view đưa tên và link các check thất bại vào tay agent — việc còn lại là
của nó.

*Nguồn: hai trích đoạn trên cùng từ docs "Hosted reviews, issues & Actions",
truy 2026-09-08.*

## Nối Linear: một API token, chọn team

Phép nối thứ hai gồm đúng ba bước, docs liệt kê nguyên văn:

> "1. Open Settings → Integrations → Linear.
> 2. Paste a personal API token from Linear → Settings → API.
> 3. Pick the team(s) you want to see."

*Nguồn: docs "Linear items drawer", mục Setup, truy 2026-09-08.*

Token cá nhân lấy từ trang API settings của chính Linear
(linear.app/settings/api) — Wakii chỉ dùng nó để đọc và ghi. Chọn đúng team
thì task drawer mới hiện đúng nhóm issue — drawer gộp issue GitHub và Linear
vào một view chung.

## Từ issue sang worktree: composer tự điền, Linear đặt tên branch

Đây là bước tiết kiệm nhiều thao tác nhất. Bấm tạo worktree từ một issue —
không phải form trắng. Docs viết:

> "Creating a worktree from a Linear issue opens the interactive workspace
> composer (same path as GitHub items) so issue-command automation, SSH, and
> folder workspaces apply. Orca pre-fills the name and attaches the issue ID.
> When Linear exposes a branch name for the issue, Orca uses that as the
> worktree branch (same naming Linear would suggest), not only a slug of the
> title. The issue detail menu can **Copy suggested branch name**."

*Nguồn: docs "Linear items drawer", truy 2026-09-08.*

Điểm đáng dừng lại là câu về branch name: nếu Linear đã có branch name cho
issue, Wakii dùng đúng tên đó — cùng cách đặt tên mà Linear sẽ đề xuất — thay
vì tự băm tiêu đề thành slug. Tên branch trong git và branch gợi ý trong
Linear không có chỗ để lệch nhau, kể từ giây phút tạo.

Tạo xong vẫn đổi hoặc gỡ được, không cần tạo lại worktree:

> "After create, open **Edit Worktree Details** on the workspace card and use
> the **Issue** field with the **Linear** chip (or paste a Linear URL) to link
> or change the issue without recreating the worktree. GitHub and Linear share
> that one field — saving a new link replaces the previous provider link."

*Nguồn: docs "Linear items drawer", truy 2026-09-08.*

Một field `Issue` duy nhất phục vụ cả GitHub và Linear — link mới thay link
cũ, không bao giờ link đôi. Về phía nhánh, vì sao một việc nên có đúng một
branch và một PR thì bài [one branch, one PR](/vi/blog/one-branch-one-pr/) đã
chứng minh từ góc quy trình — phép nối issue-sang-worktree ở đây chính là nửa
đầu của quy tắc đó được tự động hóa.

## Status sync là opt-in: agent không tự đổi state thay bạn

Docs đặt một callout ngay trong trang Linear, trích nguyên văn:

> "Linear status sync (moving an issue to 'In Progress' when a worktree is
> created) is opt-in per team."

*Nguồn: docs "Linear items drawer", truy 2026-09-08.*

Nghĩa là mặc định việc tạo worktree không âm thầm đổi state của issue. Trong
quy trình story của Wakii đây là chủ đích: issue chuyển In Progress khi SF
thật sự bắt đầu, Done khi đã merge và verify — trạng thái là phần của kỷ
luật, không phải hiệu ứng phụ. Bạn muốn bật sync cho team thì bật trong phần
Linear của Integrations; muốn đổi state tường minh thì có lệnh riêng —
`orca linear status set --to <state>` là một hành động khai báo.

## Cho agent đọc Linear: `orca linear`

Agent không đọc Linear qua màn hình — chúng có bề mặt CLI riêng. Docs ghi:

> "Agents can read and write Linear through `orca linear` (and the
> `orca-linear` skill). That surface includes MCP-compatible create/update
> and list filters (`save-issue`, `list-issues`, relation add/remove) plus
> issue context flags such as `--activity` and `--full`."

*Nguồn: docs "Linear items drawer", mục Agents and CLI, truy 2026-09-08.*

Lệnh mình dùng nhiều nhất khi viết chính bài này — đọc context của issue đang
dở, lọc JSON lấy ba trường cần:

```bash
$ orca linear issue FI-377 --json | python3 -c "import sys,json; i=json.load(sys.stdin)['result']['issue']; print(i['identifier'], '|', i['title'], '|', i['state']['name'])"
FI-377 | [SF-4] Series Guides — 10 bài — Blog batch 2 (FI-373) | In Progress
```

*Nguồn: lệnh chạy thật trên máy viết bài, lấy 2026-09-08.*

Cờ `--current` cho agent lấy issue đang gắn với worktree hiện tại — agent
làm việc trong worktree không cần bạn dán ID vào prompt. Chiều ngược lại cũng
một lệnh: `orca linear attach <id> --url <link-PR>` gắn link PR lên issue,
nên vòng đời khép kín ở đúng nơi cả đội đang nhìn. Vì sao Linear được chọn
làm "nơi nhớ chung" của đội agent thì bài [Linear as external
memory](/vi/blog/linear-as-external-memory/) đã lập luận — các lệnh trên chỉ
là cách agent nói chuyện với nơi nhớ đó.

## Khi nối rớt: token, scopes và rate limit

Ba hỏng hóc thường gặp, theo thứ tự gặp nhiều nhất.

Linear không hiện issue nào: token hết hạn hoặc bị thu hồi. Paste lại token
mới từ linear.app/settings/api vào Settings → Integrations → Linear — thay
token là xong, không phải nối lại gì khác.

PR panel hay checks không refresh: đa số là rate limit GitHub hoặc `gh` auth
có vấn đề. Docs có bộ quick-check ba lệnh, trích nguyên văn:

```bash
gh auth status -h github.com
gh api user
gh api rate_limit --jq '.resources.core'
```

*Nguồn: docs Troubleshooting & FAQ, mục GitHub errors, truy 2026-09-08.*

Lệnh cuối trên máy viết bài trả về:

```json
{"limit":5000,"remaining":5000,"reset":1788845034,"used":0}
```

*Nguồn: `gh api rate_limit --jq '.resources.core'` chạy thật, lấy
2026-09-08.*

`remaining` sát `limit` nghĩa là chưa đụng trần; `remaining` về gần 0 là lý
do panel nghỉ refresh — đợi đến mốc `reset`.

Toàn bộ vòng đời — issue → worktree → review → PR — được quy về một trang
duy nhất trong [story workflow](/vi/docs/story-workflow/), nơi Linear giữ vai
trò nơi plan được publish và mọi SF là một issue.

Mở Settings → Integrations, nối GitHub và Linear trong vài phút, rồi thử tạo
worktree đầu tiên từ một issue thật — tên tự điền, branch name có sẵn, PR
quay về đúng chỗ.
