---
title: "Per-workspace env: mỗi worktree một môi trường"
description: "Nhiều agent trên một máy mà chung môi trường là giành nhau biến môi trường, dependencies và credentials. Wakii gắn môi trường vào workspace: recipe khai báo trong orca.yaml, runtime on-demand disposable tạo mới cho từng workspace, snapshot base và auth dùng lại được."
pubDate: "2026-09-18"
category: "tech"
tags: ["features", "worktree", "cli"]
draft: false
---

Bài trước trong loạt này đã chặn một nửa của bài toán song song: hai agent đứng
ở hai worktree thì không còn file nào để giành. Nhưng file chỉ là một nửa — biến
môi trường, dependencies, credentials vẫn nằm chung ở đúng một chỗ: trên máy.
Agent A export một biến, agent B kế thừa mà không hay; A nâng dependency, build
của B gãy dù B không đổi gì. Nhiễu chéo này không cần ai làm sai — chỉ cần chung
một máy. Per-workspace environment là lời giải cho nửa còn lại: môi trường gắn
với workspace, không gắn với máy.

TL;DR:

- Worktree isolation tách file; per-workspace environment tách phần còn lại:
  biến môi trường, dependencies, credentials — mỗi workspace một bộ riêng.
- Môi trường khai báo thành recipe trong `orca.yaml` (khóa `environmentRecipes`);
  runtime on-demand, disposable tạo mới cho từng workspace — cloud sandbox, VM,
  hoặc local.
- Setup lần đầu trả một lần: provider prerequisites, base snapshot dùng lại
  được, coding-agent auth snapshot, credentials, state — workspace sau khởi động
  từ snapshot.
- Toggle nằm trong settings (component `EphemeralVmsExperimentalSetting`), có
  mặt từ bản v1.4.130; commit #7908 căn layout hàng toggle, templates của skill
  đã qua một vòng sửa sau dùng thật (#7485).
- Recipe có thể hỏng — vì thế `orca vm recipe doctor` tồn tại: kiểm tra tĩnh
  miễn phí, trước khi đụng provider.

## File đã tách, môi trường thì chưa

Worktree isolation trong bài trước giải đúng một loại tranh chấp: hai agent ghi
vào cùng một đường dẫn file. Cho hai agent đứng ở hai worktree khác nhau, tranh
chấp file không còn chỗ xảy ra. Nhưng hai agent ấy vẫn dùng chung một thứ: môi
trường của máy. Biến export trong một phiên lọt sang phiên khác; dependencies
cài chung một nơi; token đăng nhập nằm trong một file cả hai cùng đọc và cùng
ghi. Môi trường là một tài nguyên chia sẻ ngầm — đúng loại tài nguyên mà
isolation lớp file không chạm tới:

```ascii
một máy, nhiều workspace — môi trường là tài nguyên chia sẻ ngầm

  máy
  ├── workspace A ──┐
  ├── workspace B ──┼──► chung một môi trường
  └── workspace C ──┘    (env var, dependencies, credentials)

  A export biến mới   → B kế thừa mà không hay
  A nâng dependencies → build của C gãy, C không đổi gì
  A ghi token         → B đọc thấy token của A
```

*Nguồn: sơ đồ khái niệm minh họa tình huống mà per-workspace environment sinh ra
để chặn; lấy 2026-09-08.*

Đây là bài toán cũ của máy dev: nhiều dự án trên một máy là chia sẻ env với
nhau. Bài toán mới: "nhiều dự án" thành "nhiều workspace của cùng một repo",
chạy bởi các agent không biết về sự tồn tại của nhau.

## Recipe trong orca.yaml, runtime tạo mới mỗi workspace

Workspace trong Wakii cầm một worktree — bài trước cấp cho mỗi worktree một
branch riêng; per-workspace environment cấp cho mỗi workspace một môi trường
riêng theo đúng logic đó. Mô tả của skill `orca-per-workspace-env` gọi thẳng
tên từng thành phần, trích nguyên văn:

> "on-demand, disposable runtimes (cloud sandboxes, VMs, or local) created fresh
> for each workspace. Covers first-time setup (provider prerequisites, the
> reusable base snapshot, the coding-agent auth snapshot, credentials, and state),
> not just the per-workspace lifecycle scripts."

*Nguồn: skills/orca-per-workspace-env/SKILL.md, phần mô tả skill, lấy
2026-09-08.*

Đọc chậm hai cụm. "created fresh for each workspace": runtime tạo mới cho từng
workspace — workspace nào giữ runtime của nó, không mượn của hàng xóm.
"disposable": xong việc thì bỏ — runtime không đọng lại thành state trên máy.
Chỗ sống của runtime theo provider: cloud sandbox, VM, hoặc local. Recipe là
nơi khai báo tất cả những điều đó, một lần:

```ascii
một máy → N workspace → mỗi workspace một môi trường tạo từ recipe

  orca.yaml
  └── environmentRecipes: recipe khai báo một lần
        │
        ├─► workspace A → runtime on-demand, tạo mới từ recipe
        ├─► workspace B → runtime on-demand, tạo mới từ recipe (bản sao riêng)
        └─► workspace C → runtime on-demand, tạo mới từ recipe (bản sao riêng)

  lần đầu:   provider prerequisites + base snapshot + coding-agent auth snapshot
  lần sau:   workspace mới khởi động từ snapshot có sẵn, không dựng lại từ đầu
  xong việc: runtime disposable — bỏ đi, máy về trạng thái ban đầu
```

*Nguồn: dựng từ skills/orca-per-workspace-env/SKILL.md — khóa `environmentRecipes`
trong `orca.yaml`, base snapshot và coding-agent auth snapshot dùng lại được; lấy
2026-09-08.*

Hai snapshot là chỗ thiết kế tiết kiệm nhất: base snapshot giữ phần dựng nặng
(provider prerequisites, dependencies), auth snapshot giữ trạng thái đăng nhập
của coding-agent — cả hai dùng lại giữa các workspace, phần tốn thời gian chỉ
cần làm một lần.

## Toggle trong settings và một vòng dogfood thật

Feature không chỉ sống trong CLI — toggle per-workspace environment nằm trong
settings của app, trong một component có tên nói thẳng:
`EphemeralVmsExperimentalSetting` (experimental setting cho ephemeral VMs).
Commit #7908 đụng đúng hàng toggle đó:

```bash
$ git show 24d7f6b790 -- src/renderer/src/components/settings/EphemeralVmsExperimentalSetting.tsx
-      <div className="flex items-start justify-between gap-4">
+      <div className="flex max-w-3xl items-start justify-between gap-4">
```

*Nguồn: commit 24d7f6b790 "Align per-workspace environment toggle (#7908)" trong
repo orca, lấy 2026-09-08.*

Diff một dòng, và cần đọc cho đúng: #7908 không thêm tính năng — nó căn layout
hàng toggle, chặn chiều rộng khối mô tả bằng `max-w-3xl` để hàng settings không
giãn trên màn hình rộng. Commit polishing nhỏ, nhưng chứng thực hai điều: toggle
đã tồn tại trong settings từ trước, và vẫn còn người chăm nó. Toggle này có mặt
trong bản phát hành từ v1.4.130.

Cùng giai đoạn, templates của skill nhận một vòng sửa sau khi được dùng thật.
Subject commit, trích nguyên văn:

> "fix(skill): fix 6 dogfood bugs in orca-per-workspace-env templates (#7485)"

*Nguồn: commit 45370a5987 trong repo orca, lấy 2026-09-08.*

Đọc đúng ý: đây không phải lời buộc tội chất lượng. Nội dung commit cho thấy lỗi
lộ ra khi có người dựng một per-workspace env local Docker SSH từ đầu đến cuối —
bước kiểm tra đăng nhập của agent in kết quả ra stderr, grep chỉ đọc stdout báo
sai "chưa đăng nhập"; hoặc OAuth gắn vào callback port loopback không với tới
được và treo trên VM headless. Templates được sửa vì có người dùng thật tới chỗ
chúng gãy — vòng lặp đó là dấu hiệu feature đang sống, không phải nằm trên kệ.

## Giới hạn thật: recipe có thể hỏng, doctor là chỗ kiểm

Feature không có lệnh kiểm tra lỗi thường là feature chưa ai dùng đủ lâu để thấy
nó hỏng. `orca vm recipe doctor` tồn tại nghĩa là điều ngược lại: recipe có thể
hỏng — thiếu provider prerequisites, snapshot cũ, lifecycle script gãy — và
Orca để sẵn một chỗ kiểm trước khi hỏng hóc lan sang workspace khác. Lệnh xuất
hiện trong SKILL.md, trích nguyên văn:

```bash
ORCA vm recipe doctor <recipe-id> --repo-path <repo> --json
```

*Nguồn: skills/orca-per-workspace-env/SKILL.md, trích nguyên văn; lấy
2026-09-08. `ORCA` là placeholder — SKILL.md yêu cầu thay bằng lệnh thật
(`orca`, `orca-dev`, `orca-ide`) trước khi chạy.*

SKILL.md gọi doctor là "the free static check" — kiểm tra tĩnh, không tốn gì —
và dựng cạnh đó một hàng rào, trích nguyên văn: "Never add `--provision` without
the user's explicit approval because it creates provider resources and may spend
money." Giới hạn ghi hai lần trong một file là giới hạn thật: runtime
per-workspace sống trên provider — tài nguyên thật, có thể tốn tiền thật. Câu
chốt của skill cũng thẳng như vậy: "you never own the user's cloud account,
billing, images, or credentials, and never spend money without an explicit user
OK."

Còn một chi tiết thiết kế: SKILL.md là stub khám phá, cố tình không chứa hướng
dẫn đầy đủ — phần đó do binary phát ra qua `skills get orca-per-workspace-env`,
vì "kept out of this file on purpose so it can never drift from the binary that
will actually run your commands" (trích nguyên văn).

Quay lại toàn cảnh: [song song bằng worktree
isolation](/vi/blog/parallel-worktrees-isolation/) tách file giữa các agent;
per-workspace environment tách môi trường — hai lớp isolation bọc lấy nhau, lớp
dưới giữ đĩa sạch, lớp trên giữ env sạch. Recipe khai báo trong `orca.yaml`,
toggle nằm trong settings, doctor kiểm miễn phí trước khi đụng provider — điểm
khởi đầu là trang [getting started](/vi/docs/getting-started/).

Muốn tự thấy: mở settings của Wakii, tìm hàng per-workspace environment; hoặc
khẽ hơn — chạy `orca vm recipe doctor` với một recipe đang dùng, đọc báo cáo
tĩnh trước khi workspace tiếp theo được tạo.
