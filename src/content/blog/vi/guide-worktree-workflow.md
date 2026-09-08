---
title: "Worktree workflow: vòng đời một worktree trong dự án thật"
description: "Tạo, làm việc, review, ship và dọn dẹp một worktree trong Wakii — chọn start-from đúng, chia sẻ node_modules và .env giữa các worktree, bảng lệnh CLI, và đường về git thuần khi cần."
pubDate: "2026-09-22"
category: "tutorial"
tags: ["guide", "worktree", "git"]
draft: false
---

Mỗi task một worktree là đơn vị tách biệt khiến agent chạy song song an toàn
— bài [parallel worktrees isolation](/vi/blog/parallel-worktrees-isolation/)
đã chứng minh cơ chế. Nhưng cơ chế không trả lời những câu ngày thường: tạo
worktree thì chọn start-from nào, `.env` và `node_modules` lấy đâu ra sau
khi checkout sạch, dọn nhà lúc nào và bằng gì. Bài này là vòng đời thực
chiến — create, work, review, ship, archive — với những lệnh bạn sẽ gõ mỗi
ngày trong dự án thật.

TL;DR:

- Vòng đời 5 bước: create → work → review → ship → archive; create chạy
  nền, có progress, không khóa UI.
- Start-from có bốn loại: base ref, branch local khác, commit SHA, branch
  remote.
- Thứ nặng chia qua ba cơ chế: Worktree Shared Paths (per repo),
  `orca.yaml sharedDirectories` (symlink/share), `.worktreeinclude` (copy).
- CLI đủ sống: `orca worktree list | current | create | set | rm | ps`.
- Git thuần vẫn chạy: worktree ngoài Orca hiện qua hidden worktrees card;
  `git worktree remove` ngoài CLI thì Orca tự dọn state của mình.

## Vòng đời 5 bước, create chạy nền

Toàn bộ tuổi đời của một worktree gói trong năm bước, docs gọi là
"per-feature lifecycle":

```ascii
create ────► work ────► review ────► ship ────► archive
chạy nền,    agent,      diff so       commit,     xóa thư mục
có progress  terminal    start-from    push, PR    + branch
```

*Nguồn: sơ đồ vẽ theo mục "Per-feature lifecycle" trong docs worktrees, truy
2026-09-08.*

Chi tiết đáng nhớ nhất nằm ở đầu vòng đời: create không khóa UI. Submit
dialog xong là dialog đóng ngay — `git fetch` và `git worktree add` chạy
ngầm trong khi bạn vẫn dùng app. Sidebar hiện hàng progress cho worktree
mới, tab của nó hiển thị trạng thái setup cho tới khi checkout xong và chuyển
sang terminal. Create đang bay mà bạn vẫn chuyển sang worktree khác được,
xem progress được, hoặc hủy từ panel trong tab; thất bại thì panel hiện lỗi
kèm nút Retry.

## Chọn start-from: bốn loại điểm khởi đầu

Mỗi repo có một base ref — thường là `origin/main`; mỗi worktree có một
start-from riêng — nơi nó rẽ nhánh. Docs liệt kê đúng bốn loại, nguyên văn:

> "The repo's base ref (the fast path).
> Another local branch — useful for stacking work on top of a PR in review.
> A specific commit SHA.
> An existing remote branch — Orca will fetch and check it out."

*Nguồn: docs worktrees, mục "Start-from picker", truy 2026-09-08.*

Branch name mặc định suy từ tên workspace bạn gõ, hoặc từ item được link
nếu bạn tạo từ GitHub PR / Linear issue — với Linear, Orca dùng luôn branch
name mà Linear đề xuất cho issue đó. Muốn đặt tay, mở Advanced drawer trong
dialog create và điền Branch name. Trong workflow story, một sub-feature
chạy trong worktree riêng với start-from là branch đích của story — kiểu
"branch local khác" ở trên; bài [long tasks và bracket tiers](/vi/blog/long-tasks-bracket-tiers/)
kể về nửa phân phối việc, bài này là nửa thao tác của cùng cơ chế.

## Chia sẻ thứ nặng: ba cơ chế, ba cách chia khác nhau

Worktree mới là checkout sạch — `node_modules`, cache, `.env` đều vắng.
Wakii lấp khoảng trống bằng ba cơ chế bổ sung cho nhau, và ranh giới giữa
chúng là điểm dễ nhầm nhất của cả chủ đề:

Một, **Worktree Shared Paths** — thiết lập per repo trong Settings →
Repository. Path được materialize từ checkout chính sang từng worktree mới
(APFS clone-copy trên macOS khi được, không thì symlink).

Hai, **`worktree.sharedDirectories` trong `orca.yaml`** — danh sách commit
theo repo, dành cho thư mục gitignored, chia bằng symlink/share chứ không
copy. Entry phải tồn tại là thư mục trong checkout chính và phải gitignored;
path bị track hoặc không tồn tại thì bị bỏ qua. Dành cho cây lớn build lại
được:

```yaml
# orca.yaml (repo root)
worktree:
  sharedDirectories:
    - node_modules
    - .cache
```

Ba, **`.worktreeinclude` ở repo root** — danh sách file hoặc thư mục
gitignored được copy (không symlink) vào từng worktree, để mỗi worktree sở
hữu bản riêng. Chỉ hỗ trợ literal path — glob và negation bị bỏ qua kèm cảnh
báo; path bị track, thiếu hoặc không gitignored thì không copy:

```text
# .worktreeinclude (repo root)
.env
.env.local
.vscode/settings.json
```

*Nguồn: hai khối code trích nguyên văn từ docs worktrees, mục "Shared
directories & gitignored files", truy 2026-09-08.*

Quan hệ giữa ba cái: `orca.yaml` cộng vào danh sách Worktree Shared Paths
per-user chứ không thay thế; path đã được share/link thì `.worktreeinclude`
không copy lại. Quy tắc chọn nhanh: thứ khổng lồ build lại được như
`node_modules` → symlink; thứ nhỏ mà mỗi worktree cần bản riêng như `.env`
→ copy.

## Sáu lệnh CLI đủ sống

Bảng lệnh thường dùng — flag trích từ `orca --help`, phần mô tả là tóm lược:

| Lệnh | Việc |
|---|---|
| `orca worktree list` | liệt kê worktree (lọc `--repo`, giới hạn `--limit`, `--json`) |
| `orca worktree current` | worktree đang active trong phiên này |
| `orca worktree create --name <tên>` | tạo mới — nhận `--base-branch <ref>`, `--agent <id>`, `--linear-issue <id>`, `--setup inherit`… |
| `orca worktree set` | đổi tên hiển thị, gắn/gỡ issue trên worktree có sẵn |
| `orca worktree rm` | xóa worktree (`--force` nếu cần; `--run-hooks` để chạy hooks) |
| `orca worktree ps` | tổng quan live: worktree nào đang có terminal chạy |

*Nguồn: flag trích `orca --help`, phần mô tả tóm lược, lấy 2026-09-08.*

## Git thuần vẫn sống

Mọi worktree của Orca đều là git worktree thật — mở terminal trong nó và
`git status`, `git rebase`, `git cherry-pick` chạy như thường; Orca nhận
thay đổi ở lần render sau. Chiều ngược lại cũng đúng: worktree bạn tự tạo
bằng `git worktree add` nằm ngoài Orca cho tới khi bạn cho hiện — sidebar có
thẻ hidden worktrees, mở Non-Orca worktrees rồi chọn Show cho worktree nào
muốn đưa vào. Còn nếu xóa worktree bằng CLI thuần, docs có một callout gọn:

> "If you `git worktree remove` from the CLI, Orca will notice and clean up
> its own state the next time it refreshes that repo."

*Nguồn: docs worktrees, mục "Using plain git", truy 2026-09-08.*

Trạng thái thật trên máy viết bài — hai lệnh, hai phía (rút gọn, path đã
~-hóa):

```bash
$ git worktree list
~/Desktop/projects/wakii-site                   3eabe17 [main]
~/orca/workspaces/wakii-site/sf-4-blog-guides   7f88a9b [wakii-dev/sf-4-blog-guides]
(rút gọn — còn 3 worktree khác của cùng repo)
$ orca worktree current
displayName: sf-4-blog-guides
branch: refs/heads/wakii-dev/sf-4-blog-guides
baseRef: story/fi373-blog-batch2
hostId: local
linkedLinearIssue: FI-377
(rút gọn — bỏ các trường id, path, git)
```

*Nguồn: `git worktree list` và `orca worktree current`, lấy 2026-09-08.*

## Dọn nhà: Resource Manager và branch bị giữ lại

Xóa worktree là xóa cả thư mục lẫn branch, có confirmation. Nhưng khi branch
còn commit chưa merge, git từ chối drop — docs mô tả điều xảy ra sau đó
nguyên văn:

> "If git refuses to drop a local branch because it may contain unmerged
> commits, Orca keeps those branches and shows a toast such as **Review N
> Branches**. Opening it lists the kept branches so you can force-delete some
> and leave others."

*Nguồn: docs worktrees, mục "Preserved branches", truy 2026-09-08.*

Folder đã mất thì không hồi phục, nhưng branch chưa merge không bao giờ bị
nuốt im lặng khi xóa hàng loạt.

Nhiều worktree cần dọn một lúc thì vào Resource Manager → Clean up
workspaces: danh sách gom cả worktree local, main worktree, folder
workspace lẫn worktree trên SSH host đang mất nối — kèm trạng thái, activity
gần đây, kích thước, git state và review được link để bạn quyết trước khi
chọn xóa.

Vòng đời này không đứng một mình: nó là đơn vị thực thi của pipeline story —
ý tưởng thành epic, epic thành các sub-feature song song, mỗi cái một
worktree — được mô tả đủ trên trang [story workflow](/vi/docs/story-workflow/).
Thử ngay với task nhỏ nhất hôm nay: tạo một worktree, đi trọn năm bước, và
để archive chứng minh không gì bị mất.
