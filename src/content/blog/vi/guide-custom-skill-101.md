---
title: "Viết skill custom đầu tiên: SKILL.md, thử ngay và chia sẻ"
description: "Tạo một skill agent của riêng bạn — một thư mục, một file SKILL.md — rồi chạy thử với orca skills installed, sửa không cần build, và chia sẻ qua một link unlisted revoke được."
pubDate: "2026-09-21"
category: "tutorial"
tags: ["guide", "skills"]
draft: false
---

Agent của bạn biết chuẩn commit của team, nhưng mỗi phiên vẫn phải nhắc lại.
Hoặc nó viết test đúng quy ước, chỉ khi bạn dán quy ước đó vào prompt. Đó là
lúc một skill custom ra việc: đóng gói tri thức lặp lại thành một file
Markdown, để agent tự đọc và tự dùng vào đúng lúc. Kit đi kèm Wakii đã làm
sẵn phần lớn việc này — 20 skill tổng, trong đó 13 public trong catalog tại
thời điểm viết (snapshot 2026-09-08) — nhưng phần thú vị nhất là bạn tự viết
được ngay, không cần code. Bài này đi trọn một vòng: viết, đặt đúng chỗ, thử,
chia sẻ.

TL;DR:

- Skill = một thư mục chứa `SKILL.md`: frontmatter `name` + `description`,
  thân file là hướng dẫn.
- Bỏ vào `~/.claude/skills/<tên>/` là agent nhận — UI quét sẵn các skill home.
- Kiểm tra bằng `orca skills installed`; sửa file là có tác dụng, không có
  bước build.
- Chia sẻ cho máy khác bằng `orca skills share` — một link unlisted, revoke
  được, coi như credential.

## Skill là gì: một thư mục, một file SKILL.md

Skill không phải plugin, không cần manifest hay bước biên dịch. Nó là một
thư mục, bên trong có đúng một file quan trọng: `SKILL.md`. Frontmatter khai
`name` và `description`; phần thân Markdown là nội dung agent sẽ đọc khi skill
được kích hoạt:

```ascii
~/.claude/skills/
└── commit-style/            ← tên thư mục
    └── SKILL.md             ← file duy nhất bắt buộc
        ---
        name: commit-style   ← định danh agent gọi theo
        description: ...     ← KHI NÀO dùng — agent đọc để quyết định
        ---
        (thân Markdown: quy tắc, ví dụ, checklist)
```

*Nguồn: sơ đồ vẽ theo cấu trúc SKILL.md trong docs skills của sản phẩm, truy
2026-09-08.*

Trọng số lớn nhất nằm ở `description`: đó là câu agent dùng để quyết định
khi nào đọc skill. Bài [skills catalog tour](/vi/blog/skills-catalog-tour/)
đã đi qua từng skill có sẵn; chạy `orca skills list` là thấy ngay khuôn mô
tả này — mỗi skill nền tảng đi kèm CLI là một dòng `tên: khi nào dùng`
(rút gọn):

```bash
$ orca skills list                   # (rút gọn: cắt bớt phần mô tả)
computer-use: Use Orca's computer-use CLI for OS/window-level inspection …
orca-cli: Use the public `orca` CLI to operate Orca-managed worktrees …
orca-linear: Use Orca's Linear CLI through `orca linear ...` commands …
(8 guide đi kèm CLI tại thời điểm chạy — còn lại: linear-tickets,
orca-emulator, orca-emulator-android, orca-per-workspace-env, orchestration)
```

*Nguồn: `orca skills list`, lấy 2026-09-08.*

## Đặt ở đâu để agent nhận

Vị trí chuẩn cho Claude Code là `~/.claude/skills/<tên>/`. Docs sản phẩm mô
tả đúng cơ chế nhận dạng, nguyên văn:

> "Orca's skill UI scans installed skill homes for Claude, Codex, Agent
> Skills, and OMP (`~/.omp/agent/skills`), so skills placed there show up
> without a manual symlink."

*Nguồn: docs skills, mục "Discovery sources", truy 2026-09-08.*

Nghĩa là bạn bỏ file vào một thư mục home mà UI đã quét sẵn — không đăng ký,
không symlink. Trên máy có Wakii, thư mục này thường đã có người ở trước
bạn: kit tự cài vào `~/.claude/` ngay lần chạy đầu của app, idempotent, không
đụng config có sẵn — cơ chế đó đã có bài riêng về zero setup.

## Viết skill đầu tiên trong ba mươi giây

Ví dụ nhỏ, dùng được thật: một skill giữ chuẩn commit message cho repo. Ba
bước — tạo thư mục, viết file, lưu:

```markdown
---
name: commit-style
description: Use when writing or reviewing a git commit message in this repo —
  enforces subject under 72 chars, imperative mood, and a body that explains
  why the change exists.
---

# Commit style

- Subject: imperative mood, max 72 characters, no trailing period.
- Body (when needed): explain WHY, not WHAT — the diff already shows what.
- Reference the issue id in the subject when one exists.
```

Hai điểm dễ vấp. Một, `description` nên viết theo dạng "Use when…" và nêu
điều kiện cụ thể — nó là câu agent khớp với việc đang làm, viết mơ hồ là
skill sống chờ đợi. Hai, thân file là chỗ đặt quy tắc thật, kèm ví dụ đúng —
sai: mổ xẻ sai sót luôn hữu ích hơn liệt kê dàn ý.

## Thử ngay: installed, gọi trong agent, sửa rồi chạy lại

Lệnh kiểm tra nhanh nhất: `orca skills installed` — liệt kê mọi skill UI quét
được trên máy, kèm nơi đặt (đây là listing trên máy viết bài, gồm cả skill
cá nhân và plugin — không phải con số catalog):

```bash
$ orca skills installed              # (rút gọn: cắt bớt phần mô tả)
brainstorm (943fa2a3004dab96)
  Claude home
bridge-router (3e4ef046fcbc33a4)
  Claude home
computer-use (2a6e81ddac38c33a)
  Agent skills home
```

*Nguồn: `orca skills installed`, lấy 2026-09-08. Thư mục thật trong
`~/.claude/skills/` trên máy này: brainstorm, bridge-router, computer-use,
frontend-design, orchestration, prompt-master… (rút gọn).*

Sau khi lưu `SKILL.md`, mở phiên agent và yêu cầu trực tiếp: "dùng skill
commit-style để review commit vừa viết". Agent đọc `description`, khớp việc
đang làm, rồi nạp thân skill vào ngữ cảnh. Muốn sửa? Skill là Markdown thuần
— lưu file là lần gọi sau dùng bản mới, không build, không khởi động lại.

## Chia sẻ cho máy khác: một link unlisted, revoke được

Docs có hẳn một mục cho nhu cầu này, "Share private skills between hosts":
mở Skills → Share skills để công bố một skill hoặc một bundle sau một link
unlisted, revoke được. Công bố cần tài khoản; mỗi bản đã công bố là bất biến
— sửa local sau đó không âm thầm đổi bản mà người nhận cài về. Ai có link
đang hoạt động đều xem và cài được mà không cần đăng nhập, nên docs kết bằng
đúng một câu: treat the link like a credential.

Qua CLI, lệnh dạng sau (cần bật trước quyền mặc định-tắt trong Settings →
Share Skills):

```bash
$ orca skills share --help           # (trích)
Usage: orca skills share --skill <selector> [--skill <selector> ...] --bundle-name <name> [--json]
Examples:
  $ orca skills share --skill frontend --skill testing --bundle-name "Team Toolkit" --json
```

*Nguồn: `orca skills share --help`, lấy 2026-09-08.*

Bên nhận chọn toàn bộ hoặc một phần bundle, chọn scope global hay theo
workspace, rồi cài lên máy này, một runtime đã pair, WSL hoặc host SSH.
Revoke link chặn truy cập tương lai nhưng không gỡ các bản đã cài — quản lý
bản cài qua Skills → Manage installs, copy và revoke link qua Settings →
Share Skills.

## Skill không hiện: bốn nguyên nhân hay gặp

| Triệu chứng | Nguyên nhân thường | Cách xử lý |
|---|---|---|
| Skill không có trong `orca skills installed` | Sai vị trí — thiếu thư mục cha hoặc lồng sai cấp | Đúng khuôn `~/.claude/skills/<tên>/SKILL.md` |
| Agent không bao giờ kích hoạt | `description` mơ hồ, không nói được khi nào dùng | Viết lại dạng "Use when…", nêu điều kiện cụ thể |
| Đổi tên thư mục nhưng agent vẫn gọi tên cũ | Định danh là trường `name`, không phải tên thư mục | Đổi `name` trong frontmatter |
| Skill nằm trong repo riêng của team | Repo có `skills/<tên>/SKILL.md` thì cài bằng lệnh riêng | `npx skills add <repo> --skill <tên> --global` |

*Nguồn: tổng hợp từ docs skills (mục "Discovery sources", "Add your own
skills") và `orca skills --help`, truy 2026-09-08.*

Đội chín agent và số skill trong kit được mô tả trên trang
[agents & kit](/vi/docs/agents-and-kit/); phần public của catalog nằm trên
trang Skills của site. Giờ thì thử: tạo một skill cho quy tắc team bạn lặp
lại mỗi tuần — ba mươi giây cho file đầu, và agent sẽ tự tìm đúng lúc nó cần.
