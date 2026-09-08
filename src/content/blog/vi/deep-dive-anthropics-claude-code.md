---
title: "Claude Code: agent coding của Anthropic nhìn từ ngoài"
description: "Repo hơn 144.000 sao công khai trên GitHub nhưng không chứa mã của tool và không gắn license chuẩn — changelog 387 phiên bản cùng 13 plugin chính thức vẫn cho đọc vị kiến trúc từ bên ngoài."
pubDate: "2026-10-03"
category: "tech"
tags: ["agents", "cli", "guardrails", "architecture"]
draft: false
heroImage: "/blog/heroes/deep-dive-anthropics-claude-code.png"
---

Claude Code có lẽ là công cụ agent coding được nhắc đến nhiều nhất năm — và cũng là repo khó đọc nhất trong nhóm harness. Trên GitHub nó công khai với 144.420 sao (theo GitHub API ngày 2026-09-08), nhưng repo không chứa mã của tool: bạn cài qua installer chính thức, không build từ mã. Cột license của GitHub API trả về none, còn file LICENSE.md dài đúng một dòng. Vậy hơn một trăm nghìn người theo dõi một repo không lộ mã để đọc gì ở đó? Bài này thử một cách tiếp cận Outside View: coi changelog, plugin và scripts vận hành là các cửa sổ, rồi xem hiện ra bao nhiêu về kiến trúc bên trong.

TL;DR:

- Repo công khai trên GitHub không chứa mã của tool — nó là tháp điều khiển: changelog, 13 plugin, máy triage issue.
- Nhịp phát hành ~1 release/ngày: 30 releases trong 30 ngày cuối (07-08 → 06-09, theo GitHub API ngày 2026-09-08); CHANGELOG.md đã chạm 387 bản ghi phiên bản.
- Changelog là hình thức công bố kiến trúc: budget output cho agent, lệnh đo chi phí context của skills, cả cơ chế prompt-cache của agent teams đều lộ qua các dòng fix.
- plugins/ là nơi duy nhất đọc được "code" thật: một đội review sáu agent chuyên biệt và review bảo mật ba lớp.
- Grading cho Wakii: ADOPT confidence-scoring cho review findings · DIRECTION changelog công bố cơ chế · WATCH mô hình license · N/A máy triage issue quy mô lớn.

## Repo công khai mà không chứa mã của tool

Điều đầu tiên gây bất ngờ là chính cấu trúc repo. Tại commit được đọc ngày 2026-09-08 (`ab9b2cf`), gốc repo gồm các thành phần chính sau:

```
github.com/anthropics/claude-code @ ab9b2cf
├── CHANGELOG.md   387 bản ghi phiên bản, 6.362 dòng
├── LICENSE.md     1 dòng — trỏ sang Commercial Terms of Service
├── README.md      cài đặt + plugin + data usage
├── SECURITY.md
├── examples/      gateway · hooks · mdm · settings
├── plugins/       13 plugin chính thức (markdown + hooks)
├── scripts/       8 script triage issue (auto-close-duplicates.ts…)
└── (không có mã của tool — tool ship qua installer đóng gói)
```

Không có thư mục source, không có mã máy của tool. README hướng dẫn cài qua `curl` script hoặc Homebrew/Winget; npm install bị đánh dấu deprecated — tool được ship như một bản đóng gói hoàn chỉnh, repo chỉ giữ phần "xung quanh": tài liệu, lịch sử phiên bản, hệ plugin. File LICENSE.md toàn bộ nội dung là:

> "© Anthropic PBC. All rights reserved. Use is subject to Anthropic's Commercial Terms of Service."
— LICENSE.md, anthropics/claude-code @ [`ab9b2cf`](https://github.com/anthropics/claude-code/blob/ab9b2cf/LICENSE.md)

Đó là lý do GitHub hiển thị "no license": không phải quên, mà là chủ đích — dùng tool theo điều khoản thương mại, không theo một license chuẩn nào. Khi không đọc được mã, cách duy nhất để hiểu tool là đọc những gì đội ngũ chọn công bố. Và họ công bố nhiều hơn bạn tưởng: trong [bản đồ 50 project agentic coding tháng 9](/vi/blog/agentic-landscape-50-projects/), claude-code được ghi nhận là "fastest shipper" của nhóm harness.

## Một release mỗi ngày, changelog như bản công bố kiến trúc

Nhịp ship là đặc điểm định hình repo này. API trả về đúng 30 release gần nhất trải từ v2.1.224 (07-08) tới v2.1.263 (06-09) — 30 release trong 30 ngày, có ngày hai cái (v2.1.257 và v2.1.258 cùng 01-09), theo GitHub API ngày 2026-09-08:

| Tag | Phát hành (UTC) |
|---|---|
| v2.1.263 | 2026-09-06 |
| v2.1.261 | 2026-09-04 |
| v2.1.260 | 2026-09-03 |
| v2.1.259 | 2026-09-02 |
| v2.1.258 | 2026-09-01 |
| v2.1.257 | 2026-09-01 |

Lịch sử lớn hơn nhiều: CHANGELOG.md tại `ab9b2cf` chứa 387 bản ghi phiên bản trên 6.362 dòng, từ 0.2.x tới 2.1.263. Đáng chú ý không phải số lượng mà mật độ cơ chế trong từng bản ghi. Bản v2.1.263 gọn đúng một dòng "Bug fixes and reliability improvements"; bản v2.1.261 ngay trước đó dài cả trăm dòng, liệt kê từng cơ chế bị chạm tới:

- Setting mới `bashOutputMaxChars` / `taskOutputMaxChars` nâng giới hạn output mà Claude nhận inline cho lệnh shell và background task — tới 128K ký tự trước khi bị ghi ra file. Bài toán budget context của agent, nói thẳng trong changelog.
- Lệnh `/skill-doctor` mới — "to show which loaded skills go unused and what they cost in context, so you can prune them" — CHANGELOG v2.1.261, [bản ghi 2.1.261](https://github.com/anthropics/claude-code/blob/ab9b2cf/CHANGELOG.md). Một công cụ đo chi phí context của skills, công bố như một tính năng.
- Một dòng fix tiết lộ cách agent teams vận hành: teammate gửi lại tool/skill announcements ở turn thứ hai, làm đổi prefix request và đánh mất prompt cache. Không đọc được mã, bạn vẫn biết hệ có prompt cache, có teammate, có announcement — vì dòng fix mô tả cơ chế thật.
- Guardrail cũng đi qua changelog: dangerous-`rm` safety prompt mở rộng bắt thêm `rm -rf` trong tham số vị trí và trong chuỗi `sh -c` trích dẫn kép; auto mode từ chối tự duyệt một link nhồi nội dung vào dịch vụ render diagram công khai vì nó tương đương một upload. Chính sách an toàn agent, ban hành qua dòng changelog.

## plugins/: nơi duy nhất bạn đọc được code thật

13 plugin chính thức nằm ngay trong repo tại `ab9b2cf` — mỗi plugin là một thư mục markdown: `commands/`, `agents/`, `hooks/` và một `plugin.json`. Đây là source thật, đọc được nguyên vẹn, và nó phơi bày cách Anthropic tự dùng hệ plugin của mình.

Đáng học nhất là `pr-review-toolkit` với sáu agent review chuyên biệt: code-reviewer, code-simplifier, comment-analyzer, pr-test-analyzer, type-design-analyzer và silent-failure-hunter. Agent cuối có nguyên tắc đầu trong system prompt thế này:

> "Silent failures are unacceptable - Any error that occurs without proper logging and user feedback is a critical defect"
— silent-failure-hunter, plugins/pr-review-toolkit @ [`ab9b2cf`](https://github.com/anthropics/claude-code/blob/ab9b2cf/plugins/pr-review-toolkit/agents/silent-failure-hunter.md)

Plugin `code-review` chạy 5 agent song song — tuân thủ CLAUDE.md, dò bug, bối cảnh lịch sử, lịch sử PR, comment code — rồi chấm điểm tin cậy từng finding để lọc false positive, theo đúng mô tả trong [plugins/README.md @ ab9b2cf](https://github.com/anthropics/claude-code/blob/ab9b2cf/plugins/README.md). Còn `security-guidance` dựng review bảo mật ba lớp:

```
security-guidance — review bảo mật 3 lớp
Lớp 1  PreToolUse hook   regex ~25 pattern nguy hiểm trên Edit/Write
Lớp 2  cuối mỗi turn     diff gửi cho một lời gọi LLM nhanh;
                         finding severity cao được feed ngược cho agent
Lớp 3  lúc git commit    reviewer dạng SDK đọc file liên quan
                         (Read/Grep/Glob) truy data-flow đa file
```
(đồ hoạ từ README của plugin @ [`ab9b2cf`](https://github.com/anthropics/claude-code/blob/ab9b2cf/plugins/security-guidance/README.md))

Ba lớp đó là triết lý defense-in-depth — thứ khó thấy ở phần core đóng, nhưng ở đây nó nằm ngoài, đọc được, chép theo được.

## 12.654 issue và máy triage công khai

Cửa sổ cuối nhỏ hơn nhưng nói nhiều: 12.654 open issues và 23.069 forks (theo GitHub API ngày 2026-09-08). Repo kèm 8 script vận hành issue — `auto-close-duplicates.ts`, `sweep.ts`, `issue-lifecycle.ts`… — đủ thấy lượng feedback quy mô đó được xử lý bằng công cụ nằm luôn trong repo, công khai cả cách vận hành. README còn chỉ đường ngắn nhất: lệnh `/bug` trong chính Claude Code tạo issue hộ bạn.

Cả 8 script, tại `scripts/` @ `ab9b2cf`:

```
scripts/
├── auto-close-duplicates.ts
├── backfill-duplicate-comments.ts
├── comment-on-duplicates.sh
├── edit-issue-labels.sh
├── gh.sh
├── issue-lifecycle.ts
├── lifecycle-comment.ts
└── sweep.ts
```

(nguồn: [scripts/ @ ab9b2cf](https://github.com/anthropics/claude-code/tree/ab9b2cf/scripts))

Wakii đi chiều ngược lại: toàn bộ đội 9-agent và 20 skills được mô tả công khai trong [agents & kit](/vi/docs/agents-and-kit/). Đặt cạnh nhau, hai cách công bố này là hai cực của cùng một câu hỏi: người dùng agent nên được biết bao nhiêu về cơ chế phía sau.

## Wakii học được gì

- **ADOPT** — Confidence-based scoring cho review findings. Plugin `code-review` của claude-code chấm độ tin cậy từng finding để lọc false positive (plugins/README @ `ab9b2cf`); Wakii đã có code-reviewer và verifier tách vai, nhưng findings tới tay người duyệt gần như đồng đều về trọng số. Đề xuất: mỗi finding kèm confidence, gate chỉ block ở mức high-confidence, phần còn lại thành NOTE — giảm cả nhiễu lẫn chi phí review.
- **DIRECTION** — Changelog công bố cơ chế. Bản v2.1.261 giải thích cả cơ chế prompt-cache của agent teams chỉ qua một dòng fix; release notes của Wakii hiện mô tả tính năng ở mức người dùng. Với 24 story-* CLIs trong kit, thể loại "1-2 dòng cơ chế đã đổi mỗi release" là tài liệu sống rẻ nhất có thể.
- **WATCH** — Mô hình "ToS thay license": core đóng, rìa plugin markdown mở. Theo dõi xem marketplace plugin có trở thành lớp phân phối chuẩn của ngành — Wakii có 20 skills đọc được nhưng chưa có lớp marketplace tương ứng.
- **N/A** — Máy triage issue quy mô 12.654 open. scripts/ của claude-code tồn tại vì cộng đồng cỡ đó; ở quy mô hiện tại của Wakii, bộ auto-close-duplicates là chi phí thừa.

Nếu bạn đang xây agent và muốn xem một đội agent có gates, review tách vai chạy thật, tải Wakii và đọc [story workflow](/vi/docs/story-workflow/). Claude Code dạy qua những gì nó giữ lại — Wakii chọn dạy qua những gì nó mở ra.
