---
title: "SSH worktrees: code từ xa, môi trường riêng"
description: "Nhập SSH target thẳng từ ~/.ssh/config, giữ isolate cho repo nằm trên server nội bộ hay máy dev từ xa — và khi clone lỗi, lỗi tự nói rõ mình chạy ở đâu."
pubDate: "2026-09-16"
category: "tech"
tags: ["features", "cli", "worktree"]
draft: false
---

Bài trước trong loạt này kết thúc ở một kết luận vật lý: song song thật bắt đầu từ đĩa — mỗi việc một worktree, mỗi worktree một branch. Nhưng không phải repo nào cũng nằm trên máy của bạn: repo nội bộ sau jump host, box build ở văn phòng khác, máy dùng chung của cả nhóm. Đường quen thuộc là ssh vào rồi clone thủ công vào một thư mục dùng chung — và bài học "ai ghi sau đè ai ghi trước" quay lại nguyên vẹn. Wakii chọn đường khác: lấy SSH target làm điểm xuất phát của worktree, và xử lý phần khó của kết nối như code phải đọc được.

TL;DR:

- Wakii nhập SSH target thẳng từ `~/.ssh/config`: alias, host, port, user, jump host, proxy — target loại `ssh-config` được làm mới từ config ở mỗi lần import, target `manual` thì import không đụng vào.
- Remote PTY lease mang theo `worktreeId` — shell từ xa gắn với một worktree cụ thể; khi target bị xoá, tombstone giữ danh tính để repos/worktrees cũ re-point sang target mới.
- Commit `278f9ee876` — đã ship trong v1.4.198 — sửa ba lỗi của transport SSH: MFA nhiều stage, dial nhầm alias chưa claim, clone lỗi không nói chỗ gãy.
- Toàn bộ transcript lấy thật từ checkout repo sản phẩm, ngày 2026-09-08.

## Repo nằm ở nơi khác, isolate không tự đến

Cơ chế worktree của git không quan tâm repo nằm ở đâu — nhưng việc đưa repo về chỗ làm việc thì quan tâm. Repo công khai thì clone về local là hết chuyện. Repo nội bộ thì đường đi thường là: ssh vào box nhóm, clone vào thư mục home, rồi mọi việc — fix bug, thử ý tưởng — cùng sống trong đúng một cây thư mục:

```ascii
repo sau jump host — đường thủ công: mọi việc chung một thư mục

  laptop ── ssh ──► box nhóm (máy từ xa)
                      └── ~/repo/            ← một clone duy nhất
                            ├── việc A: sửa dở, chưa commit
                            ├── việc B: ghi đè lên phần dở của A
                            └── việc C: checkout sang branch khác, đè cả ba
                          một cây thư mục — ai ghi sau đè ai ghi trước
```

*Nguồn: sơ đồ khái niệm; dạng fail "chung một thư mục" đã được mổ xẻ kèm transcript git thật trong bài [song song bằng worktree isolation](/vi/blog/parallel-worktrees-isolation/), lấy 2026-09-08.*

Chi phí không nằm ở thao tác ssh — nó nằm ở cấu trúc. Thư mục dùng chung không cho phép hai việc ở hai trạng thái dở khác nhau: checkout của việc sau đè việc trước, commit của việc này lôi theo nửa thay đổi của việc kia. Muốn isolate trên máy từ xa, cần đúng cơ chế đã chứng minh trên máy local — nhiều worktree, mỗi worktree một branch — chỉ khác điểm xuất phát là một SSH target.

## Alias từ ssh config — target sinh ra từ cấu hình sẵn có

Wakii không bắt gõ lại host, port, user đã có trong `~/.ssh/config` — nó đọc config đó làm nguồn sinh target. Hai trường trong kiểu `SshTarget` nói rõ điều kiện sống của cơ chế:

```bash
$ grep -n "configHost?:\|source?: 'ssh-config'\|orphaned repos/worktrees\|worktreeId?:" src/shared/ssh-types.ts
19:  configHost?: string
43:  source?: 'ssh-config' | 'manual'
72: *  can re-point orphaned repos/worktrees from the old (deleted) target id to
76:  /** The id the removed target had — what orphaned repos/worktrees still point at. */
191:  supportsFolderDownload?: boolean
208:  worktreeId?: string
```

*Nguồn: `grep` trên src/shared/ssh-types.ts trong checkout repo sản phẩm orca, lấy 2026-09-08.*

Đọc từng dòng. `configHost` là alias — "Host alias to resolve through OpenSSH config" — tên bạn đã đặt trong ssh config. `source` phân hai loại: `ssh-config` được đồng bộ ngược từ config mỗi lần import — đổi port, user, jump host thì target theo kịp; `manual` thì import không đụng vào. Dòng 208 là mối nối với bài trước: remote PTY lease mang `worktreeId` — shell từ xa gắn với một worktree cụ thể.

Hai dòng ở giữa trả lời câu hỏi "target bị xoá thì sao". Comment trong code viết thẳng:

> "Repos store only the target id, so without this record the old workspaces are stranded on a dead id when the target is removed."

*Nguồn: src/shared/ssh-types.ts, comment trên kiểu `RemovedSshTargetTombstone`, lấy 2026-09-08.*

Tombstone ghi lại `oldTargetId` cùng `configHost` — alias, key ổn định nhất — để add lại cùng host, repos/worktrees cũ được re-point sang target mới thay vì nằm chết trên id cũ. Cùng dòng tư duy, mỗi target mang một `generation` chỉ tăng khi tạo, xoá hoặc tái nhận — tên test "never reissues a generation an automation already captured" trong src/shared/ssh-target-generation.test.ts nói đúng mục đích: automation không nhầm target.

## Lỗi phải đọc được: một commit, ba bản sửa

Transport SSH là nơi lỗi hay chuyển thành màn hình đoán: xác thực dở dang, clone hỏng không nói chỗ gãy, connect nhầm nơi. Commit `278f9ee876` — "fix(ssh): answer every MFA stage, stop dialling an unclaimed alias, and say where a clone failed (#17946)" — nhắm thẳng ba dạng đó:

```bash
$ git -C ~/Desktop/projects/orca show 278f9ee876 --stat | tail -13
 src/main/ssh/ssh-config-alias-claim.test.ts        |  80 +++++++
 src/main/ssh/ssh-config-alias-claim.ts             | 103 +++++++++
 src/main/ssh/ssh-config-parser.ts                  |  40 ++++
 src/main/ssh/ssh-connection.ts                     |  10 +-
 .../ssh/ssh-multi-factor-authentication.test.ts    | 251 +++++++++++++++++++++
 src/main/ssh/ssh-multi-key-authentication.test.ts  |  69 +++++-
 src/main/ssh/ssh-private-key-authentication.ts     |  43 +++-
 src/main/ssh/ssh-system-fallback.test.ts           |  46 ++++
 src/main/ssh/system-ssh-args.ts                    |  41 ++++
 src/shared/git-clone-failure-message.test.ts       |  55 +++++
 src/shared/git-clone-failure-message.ts            |  45 ++++
 11 files changed, 770 insertions(+), 13 deletions(-)
```

*Nguồn: `git show` trong checkout repo sản phẩm orca, lấy 2026-09-08; đường dẫn home rút gọn về `~`.*

**MFA nhiều stage.** ssh2 đi một danh sách phương thức xác thực phẳng, đúng một lần — host chạy `AuthenticationMethods keyboard-interactive,keyboard-interactive` cho qua stage đầu rồi hết phương thức, người dùng thấy "All configured authentication methods failed" (issue #8622, #16820). Bản sửa: handler chạy cho mọi target, dựng lại hàng đợi ở mỗi lần host báo partial success — key không bị đưa lại sau publickey, không làm cạn `MaxAuthTries` trước khi câu hỏi MFA kịp hiện. Commit kèm ssh2 server thật dựng kịch bản partial success, phủ bởi bài test 251 dòng.

**Alias chưa ai claim.** Nếu Host block riêng của alias bị đổi tên hoặc xoá, app vẫn dial alias đó nguyên văn — và kết nối bằng user của wildcard tới host của wildcard, âm thầm bỏ endpoint đã lưu (issue #11746). Bản sửa có một quyết định đáng học: hàm kiểm tra claim chỉ đúng theo chiều phủ định — file không đọc được, khối `Match`, hay pattern nào ngoài catch-all đều trả về "claimed", tức "chưa dám chắc". Chỉ khi chứng minh alias không còn ai claim, override Hostname/Port/User mới được phép — và chỉ ghi đúng ba thứ đó, để wildcard vẫn làm đường đi, `%h` vẫn mở rộng đúng ý.

**Clone lỗi phải nói rõ chỗ gãy.** Clone chạy non-interactive: `ssh` với `BatchMode=yes` và `SSH_ASKPASS` rỗng. Trên clone từ xa, đó hiện thành `fatal: Could not read from remote repository.` — trong khi gõ đúng lệnh đó bằng tay trên chính máy đó thì thành công (issue #14533). Bản sửa: `getGitCloneFailureMessage` nối thêm sự thật — clone chạy trên máy khác, bằng key của máy khác, prompt bị tắt chủ đích — và gọi tên hai dạng: publickey bị từ chối (nạp key vào agent trên máy đó), host-key chưa có (ghi vào `known_hosts` của máy đó).

Và đây là bằng chứng ba bản sửa đã tới tay người dùng — commit nằm trong tag phát hành:

```bash
$ git -C ~/Desktop/projects/orca tag --contains 278f9ee876
mobile-android-v0.0.48
v1.4.198
v1.4.199
```

*Nguồn: `git tag --contains` trong checkout repo sản phẩm orca, lấy 2026-09-08.*

v1.4.198 là bản phát hành đầu tiên mang tên Wakii; highlights viết nguyên văn: "Everything new from stablyai/orca — parallel worktrees, terminal splits, GitHub & Linear native, SSH worktrees, mobile companion."

*Nguồn: release notes v1.4.198, repo wakii-dev/wakii trên GitHub, lấy 2026-09-08.*

## Giới hạn thật, đọc từ code

Comment trong commit tự khoanh vùng, nguyên văn: "Scoped to the system-SSH transport and the connection's own command/transport path. Port-forward processes and the ssh2 transport (#11707) are unchanged." Ba bản sửa trên thuộc đường system-SSH; các đường khác không được hứa gì thêm. Comment trong ssh-types.ts khoanh vùng tiếp hai giới hạn:

```ts
/** Whether the host's SSH config explicitly requests GSSAPIAuthentication
 *  (Kerberos). ssh2 has no gssapi-with-mic support, so these targets try the
 *  system OpenSSH transport first. */
gssapiAuthentication?: boolean
```

```ts
/** Folder downloads require ssh2 SFTP and are unavailable on system SSH. */
supportsFolderDownload?: boolean
```

*Nguồn: src/shared/ssh-types.ts, comment trên `SshTarget` và `SshConnectionState`, lấy 2026-09-08.*

Đọc ra ba điều thật. Host muốn Kerberos đi qua system OpenSSH transport vì ssh2 không có gssapi-with-mic. Tải cả thư mục cần SFTP của ssh2, không có trên đường system SSH. Và cơ chế alias phụ thuộc `~/.ssh/config` của máy — không hỏi `ssh -G` thay được vì nó trả lời cả alias không tồn tại, mất tín hiệu "alias còn được claim không". Chưa chắc thì trả lời "claimed" — thiết kế có chủ đích.

## Kết nối là transport, isolate là cấu trúc

Hai bài trong loạt gặp nhau ở một nguyên tắc: isolate là cấu trúc đĩa, không phải lời hứa giao diện — và cấu trúc đĩa cần đường kết nối đáng tin mới có việc để isolate. Worktree local giải nửa trong phòng; SSH worktree giải nửa còn lại: repo ở máy khác vẫn nhận nguyên tắc một việc một thư mục, với tombstone và generation để automation không nhầm target.

Muốn đọc cơ chế worktree local trước: [song song bằng worktree isolation](/vi/blog/parallel-worktrees-isolation/). Muốn kết nối máy từ xa đầu tiên: trang [getting started](/vi/docs/getting-started/) dẫn các bước từ đầu. Hoặc tự thấy ngay: mở `~/.ssh/config`, chọn một alias đang dùng hằng ngày — Wakii nhập nó thành target, và worktree đầu tiên trên máy từ xa chỉ còn một cú add.
