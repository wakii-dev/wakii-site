---
title: "Release roundup 1.4.x: những gì đã ship"
description: "Kê khai những gì dòng release 1.4.x của Wakii thực sự ship: hai bản desktop và một pre-release Android, đọc trực tiếp từ release notes công khai — mỗi tính năng kèm dòng notes hoặc commit để bạn tự đối chiếu, và cả chỗ trống được ghi rõ."
pubDate: "2026-09-29"
category: "tech"
tags: ["oss", "release"]
draft: false
---

Release notes là tài liệu công khai nhất của một dự án: ai cũng đọc được, và chính vì thế cũng là chỗ dễ nhất để phóng đại — tính năng được kể theo hướng đẹp nhất, con số trôi qua mà không ai kiểm. Bài này làm chiều ngược lại với dòng release 1.4.x của Wakii: kê khai inventory những gì thực sự ra, mỗi mục gắn về một dòng notes nguyên văn, một commit, hoặc một lệnh bạn gõ lại được. Bài không kể nhịp phát hành — chuyện đó đã có bài [riêng](/vi/blog/shipping-cadence-two-releases-one-day/). Bài này kể nội dung: cái nào thuộc bản nào, lấy từ đâu, và cái nào không tồn tại.

TL;DR:

- Tại thời điểm viết (2026-09-08), repo công khai `wakii-dev/wakii` có đúng ba release: v1.4.199 (Latest), v1.4.198, và pre-release Android `mobile-android-v0.0.48` — không có v1.4.197.
- v1.4.198 là bản đầu tiên mang thương hiệu Wakii, đồng bộ upstream `stablyai/orca` main cộng 651 commits: parallel worktrees, terminal splits, SSH worktrees, computer-use native.
- v1.4.199 đưa Superpowers lên Android: story view theo SF tiers và tiến độ, resolve gate bằng choice hoặc free-text kèm confirm, notification routing `gate-open`/`gate-closed`.
- Mỗi claim trong bài truy ngược về nguồn kiểm được: lệnh `gh`, dòng notes nguyên văn, hoặc commit ghi trong registry verify-shipped của bộ editorial.

## Ba dòng trong danh sách — và một khe trống

Điểm xuất phát là danh sách đầy đủ, không trích chọn:

```bash
$ gh release list --repo wakii-dev/wakii --limit 10
Wakii 1.4.199	Latest	v1.4.199	2026-09-05T19:07:31Z
Wakii 1.4.198		v1.4.198	2026-09-05T12:47:15Z
Orca Mobile Android mobile-android-v0.0.48	Pre-release	mobile-android-v0.0.48	2026-09-05T13:00:31Z
```

*Nguồn: `gh release list --repo wakii-dev/wakii --limit 10`, lấy 2026-09-08.*

Lệnh xin mười dòng mà chỉ nhận ba — nghĩa là tại thời điểm lấy, ba dòng đó là toàn bộ release công khai của repo; inventory không nằm rải ở đâu khác. Đọc kỹ dãy tag còn thấy một khe: từ v1.4.198 nhảy thẳng lên v1.4.199, không có v1.4.197 trên public repo. Ghi rõ chỗ trống này không phải để kể chuyện — nó để ai tra số đó trên trang releases khỏi tìm hoài, và để bài này tự ràng buộc: phần còn lại chỉ được nói về thứ nằm trong ba dòng trên. Nhịp và timestamp của ba dòng đó đã có bài kia phân tích; ở đây chúng chỉ là danh mục để kê.

## v1.4.198: bản đầu mang thương hiệu, 651 commits từ upstream

Dòng mở đầu của notes v1.4.198 tự định vị bản này:

> first Wakii-branded release, cut from `wakii-dev` and synced with upstream **stablyai/orca** `main` (+651 commits)

*Nguồn: `gh release view v1.4.198 --repo wakii-dev/wakii --json name,publishedAt,body`, lấy 2026-09-08.*

Hàng highlights của notes liệt kê phần kế thừa từ upstream:

> Everything new from stablyai/orca — parallel worktrees, terminal splits, GitHub & Linear native, SSH worktrees, mobile companion.

*Nguồn: như trên, lấy 2026-09-08.*

Các mục trong câu đó không dừng ở mức liệt kê: registry verify-shipped của bộ editorial — nơi một feature chỉ được gắn nhãn SHIPPED khi có code thật và nằm trong release notes — đối chiếu được từng cái một với commit cụ thể:

| Nhãn trong registry | Evidence kèm theo |
| --- | --- |
| feature-terminal-splits — SHIPPED | commit `c558d7e083` (#17601), nằm trong tag v1.4.198 + v1.4.199 |
| feature-ssh-worktrees — SHIPPED | commit `278f9ee876` (#17946 ssh MFA), nằm trong tag v1.4.198 + v1.4.199 |
| feature-computer-use-native — SHIPPED | notes v1.4.198 + module `src/main/computer/` + commit `787766bfcf` |
| feature-per-workspace-env — SHIPPED | commit `24d7f6b790` (#7908), nằm trong tag v1.4.198 + v1.4.199 |

*Nguồn: `docs/superpowers/editorial/2026-blog-longform/claims-registry.md`, section "Verify-shipped — batch-2 features", đối chiếu 2026-09-08.*

Chi tiết đáng đọc nhất trong notes v1.4.198 lại là một ghi chú về thứ chưa xong:

> **macOS arm64 is being rebuilt on a GitHub-hosted runner (Xcode 16)** to include the computer-use native module — the DMG will be replaced in place when it finishes.

*Nguồn: `gh release view v1.4.198`, lấy 2026-09-08.*

Notes không giấu một bản dựng đang dở: nó nói rõ bản DMG sẽ được thay tại chỗ khi build xong. Vì sao một module cần build riêng, và nó nằm ở tầng nào của app — bài [kiến trúc computer-use](/vi/blog/arch-native-computer-use/) đã mổ riêng; còn vì sao dự án này fork và giữ giấy phép mở, bài [fork MIT](/vi/blog/oss-why-fork-mit/) là chương mở đầu của chuỗi.

## v1.4.199: Superpowers lên Android

Notes v1.4.199 đặt hàng đầu highlights:

> Superpowers on Android (FI-305): Mở app là thấy story list group theo worktree, vào story xem SF tiers + tiến độ; pending gates hiện rõ, resolve bằng choice buttons hoặc free-text + confirm; notification `gate-open`/`gate-closed` tap deep-link nhảy đúng màn story/gate

*Nguồn: `gh release view v1.4.199 --repo wakii-dev/wakii`, lấy 2026-09-08.*

Section Mobile của notes chốt lại phần routing:

> Notification routing: `gate-open`/`gate-closed` đủ routing fields, tap → đúng màn; old-build hiển thị an toàn

*Nguồn: như trên, lấy 2026-09-08.*

Bài này cố tình dừng đúng những gì notes viết: story view hiển thị SF tiers và tiến độ, gate resolve bằng choice hoặc free-text kèm confirm, notification hai trạng thái mở/đóng gate. Những câu hỏi mở rộng hơn — pairing có sống qua phiên không, dữ liệu có đồng bộ giữa các thiết bị không — notes không nói, và bài này không nói thay. Trong một dự án đặt tắc "claim không vượt bằng chứng", ranh giới của bài là ranh giới của notes.

v1.4.199 còn một mục ngoài mobile, đáng nhắc vì nó đổi chỗ làm việc của người review: tính năng annotate diff. Registry gắn nhãn SHIPPED với evidence là component `DiffCommentCard.tsx` cùng các file inline-comments nằm trong tag v1.4.199 — ghi chú review nằm ngay trên diff, quay về phía agent thay vì nằm rải trong một UI riêng. Section Fixes của notes cũng ghi một sửa an ninh đúng kiểu đáng tin: "`resolveFocusedWorktreePath` tách host-internal — workspace docs không lộ path qua facade".

## Bảng kê khai

Gom lại, dòng 1.4.x tại thời điểm viết ship những thứ sau — mỗi hàng có nguồn riêng:

| Bản | Những gì ship | Nguồn |
| --- | --- | --- |
| v1.4.198 | Bản đầu mang thương hiệu Wakii + upstream sync +651 commits | notes nguyên văn |
| v1.4.198 | Terminal splits · SSH worktrees · computer-use native · per-workspace env | 4 nhãn SHIPPED trong registry, kèm commit |
| v1.4.199 | Superpowers on Android: story view, gate resolve, notification routing | notes nguyên văn |
| v1.4.199 | Diff annotation (`DiffCommentCard.tsx`) nằm trong tag | registry SHIPPED + tag v1.4.199 |
| mobile-android-v0.0.48 | Pre-release Android đi tag riêng | `gh release list` |

*Nguồn: các nguồn nêu trong bảng, tất cả lấy 2026-09-08.*

Điều kiện để một hàng vào bảng: có dòng notes nguyên văn, hoặc commit kèm tag, hoặc nhãn SHIPPED trong registry. Không có hàng nào tên "sắp ship" — inventory dừng ở biên giới chứng cứ, phần còn lại là chuyện của trang releases khi nó cập nhật. Cách kê khai này cũng là cách đọc đề xuất cho bạn: thay vì tin dòng mô tả, mở notes, chỉ vào từng bullet, hỏi nó truy về commit nào.

Nội dung dòng 1.4.x chạy trong app tải về từ trang download; docs [getting started](/vi/docs/getting-started/) là chỗ bắt đầu: tải bản cho hệ điều hành của bạn, mở Superpowers panel, chạy story đầu tiên. Còn nếu bạn muốn tự kê khai lại như bài này đã làm — hai lệnh `gh` ở đầu bài là toàn bộ công cụ cần.
