---
title: "Upstream sync: sống cùng dự án mẹ"
description: "Bộ ba remote, cặp nhánh mirror và nhánh dev, hai lệnh đếm phân kỳ — bài này mổ cơ chế Wakii sống cùng upstream stablyai/orca bằng output git thật, có sơ đồ timeline và bảng lớp xung đột hay gặp."
pubDate: "2026-09-28"
category: "tech"
tags: ["oss", "upstream", "git"]
draft: false
---

Một fork là một con tàu rời cảng — và upstream không bao giờ chờ nó. Dự án mẹ vẫn commit mỗi ngày, vẫn đổi API, vẫn refactor chỗ bạn vừa xây. "Sống cùng dự án mẹ" vì thế không phải một trạng thái mà là một động từ, lặp lại mãi: kéo, gộp, giải va chạm, lặp lại. Bài trước trong blog này đã kể chiến lược giữ nhịp ở tầm nguyên tắc; bài này đi xuống tầng cơ khí — remote nào, nhánh nào, đo phân kỳ bằng lệnh nào, và xung đột thường tích ở lớp nào. Toàn bộ output git trong bài là thật, chụp trên bản clone cục bộ của repo sản phẩm, và bạn chạy lại được từng lệnh trên fork của chính mình.

TL;DR:

- Ba remote, ba vai trò: `origin` (mirror cá nhân), `upstream` (dự án mẹ stablyai/orca), `wakii-dev` (nhà công khai của fork) — cấu hình đọc được từ một lệnh `git remote -v`.
- Hai nhánh với hai hợp đồng khác nhau: `main` là bản mirror thụ động của upstream, `wakii-dev` là nhánh sống nơi mọi commit riêng của Wakii hạ cánh.
- Trạng thái sync là con số đo được, không phải cảm giác: hai lệnh `git rev-list --count` + một lệnh `git merge-base --is-ancestor` trả lời hết.
- Xung đột tích ở lớp mỏng — file fork chạm thường xuyên nhất là file va upstream sớm nhất.

## Ba remote, ba vai trò

Cấu hình đầu tiên cần nhìn là bản đồ remote của bản clone cục bộ:

```text
$ git remote -v
origin      https://github.com/VuHoi/orca-1.git (fetch)
origin      https://github.com/VuHoi/orca-1.git (push)
upstream    https://github.com/stablyai/orca.git (fetch)
upstream    https://github.com/stablyai/orca.git (push)
wakii-dev   https://github.com/wakii-dev/wakii.git (fetch)
wakii-dev   https://github.com/wakii-dev/wakii.git (push)
```

*Nguồn: `git remote -v`, bản clone cục bộ của repo `wakii-dev/wakii`, lấy 2026-09-08.*

Ba remote, ba vai trò không chồng nhau. `upstream` là nguồn — nơi mọi cải tiến của dự án mẹ đổ về. `wakii-dev` là nhà công khai — nơi người dùng clone Wakii về. `origin` là mirror cá nhân cho máy dev, nơi các nhánh thử nghiệm được sao lưu trước khi đủ điều kiện lên nhà công khai. Tách ba vai trò này ngay từ đầu cắt được một lớp nhầm lẫn kinh điển của người mới fork: đẩy nhánh thí nghiệm thẳng lên repo người dùng nhìn thấy. Với bản đồ này, chuyện đó không thể xảy ra vô tình.

## Hai nhánh, hai hợp đồng

Trong một repo, hai nhánh chính mang hai hợp đồng khác nhau — README của fork ghi rõ:

```text
| Branch      | Purpose                                        |
| ----------- | ---------------------------------------------- |
| wakii-dev   | default — Wakii development happens here       |
| main        | mirrors stablyai/orca main, auto-synced daily  |
|             | by GitHub Action                               |
```

*Nguồn: `README.md`, mục Branches, repo `wakii-dev/wakii`, lấy 2026-09-08.*

`main` có hợp đồng thụ động: nó chỉ phản chiếu upstream, không nhận commit riêng. `wakii-dev` có hợp đồng chủ động: mọi việc của Wakii diễn ra ở đây, kể cả các commit thương hiệu như đổi tên app hay icon. Hợp đồng hai nhánh cho phép một sơ đồ dòng chảy đơn giản:

```ascii
stablyai/orca main
      │  auto-sync (daily)
      ▼
wakii-dev/wakii main ────── mirror thụ động
      │  merge khi muốn nhận cải tiến
      ▼
wakii-dev/wakii wakii-dev ─ nhánh sống
      │  tách nhánh story / tính năng
      ▼
story branches ── sống ngắn, hợp về wakii-dev
```

*Nguồn: sơ đồ tổng hợp từ bảng Branches trong README (nguồn ở trên) và lịch sử commit của nhánh `wakii-dev`, lấy 2026-09-08.*

Nhánh story sống ngắn trên `wakii-dev` cũng chính là cách [một nhánh, một PR](/vi/blog/one-branch-one-pr/) vận hành trong dự án thật — nhánh tổng hợp upstream không bao giờ là nơi tính năng sinh ra.

## Phân kỳ là con số, không phải cảm giác

Câu hỏi "fork của tôi còn gần upstream không?" thường được trả lời bằng cảm giác. Nó nên được trả lời bằng hai con số. Tại thời điểm chụp trên bản clone cục bộ:

```text
$ git rev-list --count refs/remotes/upstream/main..refs/heads/wakii-dev
164
$ git rev-list --count refs/heads/wakii-dev..refs/remotes/upstream/main
0
$ git merge-base --is-ancestor refs/remotes/upstream/main refs/heads/wakii-dev
$ echo $?
0
```

*Nguồn: ba lệnh git chạy trên bản clone cục bộ của `wakii-dev/wakii`, ref local chụp 2026-09-08.*

Đọc ba dòng kết quả như một báo cáo: nhánh `wakii-dev` vượt upstream 164 commit — đó là toàn bộ công việc riêng của Wakii (workflow kit, thương hiệu, sửa lỗi kit). Ngược lại, upstream không có commit nào mà fork chưa chứa: đầu của upstream/main là tổ tiên trực tiếp của `wakii-dev` tại thời điểm ref local được nạp. Số thứ hai phụ thuộc lần `git fetch` gần nhất trên máy — đây là lý do bài ghi kèm "ref local chụp 2026-09-08": ref remote-tracking chỉ mới bằng lần fetch cuối, lệnh không tự ra internet. Con số với nguồn và ngày — đúng luật chung của blog này.

Một chi tiết kỹ thuật đáng ghi: khi repo có cả nhánh local lẫn remote-tracking trùng tên (ở đây `wakii-dev` vừa là tên remote vừa là tên nhánh), `git rev-list wakii-dev` sẽ báo `refname 'wakii-dev' is ambiguous` và tự chọn theo thứ tự ưu tiên. Dùng refspec đầy đủ `refs/heads/...` và `refs/remotes/...` như trên là cách nói dứt khoát — script sync nên viết vậy để kết quả không phụ thuộc cấu hình từng máy.

## Xung đột tích ở lớp mỏng

Khi merge upstream vào, xung đột không rải đều — chúng dồn ở những file mà fork chạm tay nhiều nhất. Lịch sử commit của fork tự chỉ ra các lớp đó. Ba commit gần nhất trên `wakii-dev` tại thời điểm chụp:

```text
$ git log --oneline -8
60edfd99da feat(mobile): Story mode toggle on session input — ...
0668f1cf99 fix(kit): ORCA_BIN fallback probe command -v orca ...
5a82167b46 fix(plugins): inject ORCA_BIN vào env plugin worker ...
07d1f11cd4 ci: xóa các workflow trigger pull_request trên fork ...
5a5e85adab docs(AGENTS): story PRs target wakii-dev, never main
7800bb7dd9 docs: README download table — re-pin to v1.4.199
96e3bc5862 ci: codify fork release — fork-release-cut ...
ecc798c655 ci: cut mac + windows build uploads to v1.4.199
```

*Nguồn: `git log --oneline -8` trên nhánh `wakii-dev`, lấy 2026-09-08.*

Đọc danh sách như một bảng lớp rủi ro. `README.md` bị fork chạm để re-pin bảng download (`7800bb7dd9`) — mà upstream cũng thường xuyên đụng tới README, nên đây là lớp va đầu tiên. `package.json` là lớp hai: fork thêm script riêng, upstream đổi script của nó, một file hai chủ. `pnpm-lock` là lớp ba — file khóa phụ thuộc sinh xung đột ồn ào nhưng giải máy móc: lấy bản của bên nào thắng trong `package.json`, chạy lại lệnh cài để tái sinh. Lớp bốn là CI workflow: fork xóa các trigger không cần (`07d1f11cd4`) trong khi upstream liên tục thêm workflow mới — xung đột ở đây thường chỉ là "giữ cả hai, tắt đúng phần".

Trade-off còn lại của sync không nằm ở công cụ mà ở thời điểm. Merge upstream giữa lúc một story tính năng đang chạy nghĩa là đẩy xung đột vào giữa công việc đang dở — sửa xong phần fork, xung đột đổi mặt. Thứ tự rẻ hơn: nhận upstream vào `wakii-dev` trước khi tách nhánh story mới, để mỗi story sinh ra trên nền mới nhất và không phải va upstream trong lúc sống. Nhánh story sống ngắn là phần còn lại của lời giải — càng ngắn, xác suất upstream đổi dưới chân nó càng thấp.

Đây là toàn bộ cơ khí của việc sống cùng một dự án mẹ: ba remote có tên vai trò, hai nhánh có hợp đồng, phân kỳ đo bằng lệnh, và xung đột xếp lớp theo mức độ fork chạm tay. Quy trình story của Wakii — từ idea đến release — chạy trên nền cơ khí này; đọc [story workflow](/vi/docs/story-workflow/) để xem tầng quy trình trên nó, hoặc đọc lại bài [fork một IDE mà giữ nhịp upstream](/vi/blog/forking-an-ide-keeping-current-with-upstream/) cho tầng nguyên tắc.

Tự fork một dự án đang sống và thử bộ ba lệnh đo phân kỳ ở trên — hai con số đầu tiên sẽ kể bạn nghe con tàu của bạn đang ở đâu trên biển.
