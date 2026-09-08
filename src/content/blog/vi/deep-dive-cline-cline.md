---
title: "Cline: agent coding sống trong VS Code"
description: "Mổ xẻ kiến trúc Cline — 67.661★, Apache-2.0: checkpoint mỗi run một ref git riêng, restore transactional, ranh giới Plan/Act chặn ở tầng tool, và một lõi agent chạy từ extension tới CLI, desktop, SDK."
pubDate: "2026-10-06"
category: "tech"
tags: ["agents", "architecture", "git", "oss"]
draft: false
heroImage: "/blog/heroes/deep-dive-cline-cline.png"
---

Phần lớn agent coding chọn terminal làm nhà: claude-code, OpenCode, gemini-cli đều sống trong một tab shell. Cline chọn ngả khác — sống ngay trong editor, nơi code của bạn đang mở. Nghe như chi tiết phân phối, nhưng code nói ngược lại: sống trong editor ép Cline giải ba bài toán agent terminal ít gặp — hoàn tác an toàn trên workspace người dùng, ranh giới giữa lúc bàn và lúc làm, và cách nới năng lực mà không rời IDE. Bài này bóc ba cơ chế đó từ chính code — 67.661★, license Apache-2.0, vẫn push code cùng ngày probe, theo GitHub API ngày 2026-09-08.

TL;DR — bạn sẽ đọc được gì:

- Cline là agent coding mã nguồn mở (Apache-2.0) gốc dạng extension VS Code, nay chạy trên một lõi agent chung phục vụ CLI, desktop app và SDK
- Checkpoint: mỗi lần agent chạy, Cline chụp một ref git riêng theo dạng `refs/cline/checkpoints/<session>/<run>` — hoàn tác theo từng bước mà không đụng git của bạn
- Restore checkpoint là giao dịch: stash cả file untracked trước khi dọn cây, sai thì rollback
- Plan/Act: chế độ Plan chặn lệnh sửa file ngay ở tầng tool — trước cả lúc xin người dùng duyệt

## Sống trong editor, lõi không nằm trong editor

Cline ra đời năm 2024 như một extension VS Code, và extension vẫn là mặt quen nhất. Nhưng mở cây repo tại commit `f5af821` (ngày 2026-09-08), bạn thấy kiến trúc đã đi xa hơn: mã của lõi agent nằm ở `sdk/packages/core`, còn `apps/vscode`, `apps/cli`, `apps/examples/desktop-app` là những mặt xuất phát dùng chung lõi đó. README tự giới thiệu một câu: "The open source coding agent in your IDE and terminal." (nguồn: [README của cline/cline @ f5af821](https://github.com/cline/cline/blob/f5af821/README.md), lấy ngày 2026-09-08).

```
            sdk/packages/core — lõi agent chung
                        │
   ┌──────────────┬─────┴────────┬─────────────┐
   ▼              ▼              ▼             ▼
 VS Code       CLI            desktop        SDK
 extension     cli-v3.0.61    v0.0.23        @cline/sdk
 (apps/vscode)
```

Bốn mặt mở mã, một mặt đóng: JetBrains plugin ghi rõ "Currently we are not open-sourcing JetBrains plugins" — cùng bảng đó. Phần "sống trong IDE" là lớp giao diện; cơ chế — checkpoint, guard, vòng run — đã đẩy xuống lõi chung. Đặt cạnh [bản đồ 50 dự án agentic coding](/vi/blog/agentic-landscape-50-projects/), đây là mẫu hình ngược claude-code: lõi mở, một cánh cửa phân phối đóng.

## Checkpoint: mỗi run một ref git riêng

Trả lời trực tiếp cho câu hỏi "sống trong workspace người dùng thì hoàn tác thế nào?": agent terminal làm việc trong cây riêng, còn agent trong editor sửa đúng cây bạn đang mở, cạnh những thay đổi chưa commit của bạn. Cline giải bằng checkpoint: trước mỗi run, workspace được chụp thành một ref git riêng, không nằm trên nhánh nào. Trong `checkpoint-hooks.ts`, mỗi checkpoint là entry gồm `ref`, `createdAt`, `runCount`, giữ tại:

```
refs/cline/checkpoints/${sessionId}/${entry.runCount}
```

(nguồn: [checkpoint-hooks.ts @ f5af821](https://github.com/cline/cline/blob/f5af821/sdk/packages/core/src/hooks/checkpoint-hooks.ts)). Ref nằm dưới namespace `refs/cline/` — không hiện trong `git branch` của bạn, không chặn gc bình thường, và mỗi session có dải ref riêng theo số run. Hoàn tác nghĩa là lấy lại ref cũ, không phải vá lại lịch sử commit.

Phần khó hơn là restore không phá dữ liệu của người dùng. Cline làm restore thành một giao dịch có commit/rollback — `beginWorktreeRestoreTransaction` trong `checkpoint-restore.ts`. Comment của chính tác giả giải thích vì sao phải vậy: "git stash create omits untracked files, but checkpoint restoration runs git clean -fd" (nguồn: [checkpoint-restore.ts @ f5af821](https://github.com/cline/cline/blob/f5af821/sdk/packages/core/src/session/checkpoint-restore.ts)). Nghĩa là: lệnh stash thông thường bỏ sót file chưa track, trong khi restore lại phải chạy clean — nên Cline dùng `stash push --include-untracked`, đẩy object vào một private ref ngắn hạn, và chỉ "commit" giao dịch khi restore xong. Chi tiết nhỏ nhưng quyết định: "undo chạy được trên demo" khác "undo chạy được trên workspace thật".

## Plan/Act: ranh giới cứng đặt ở tầng tool

Bài toán thứ hai: lúc nào bàn, lúc nào làm. Cline tách hai chế độ toggle — Plan khám phá code, hỏi rõ yêu cầu, dàn chiến lược; Act thi hành, mỗi sửa file hay chạy lệnh vẫn qua duyệt (mô tả trong [README @ f5af821](https://github.com/cline/cline/blob/f5af821/README.md)). Đáng học không phải việc có hai chế độ, mà chỗ đặt ranh giới: không phải lời dặn trong system prompt, mà là hook `beforeTool` chạy trước cả tầng tool policy lẫn tầng xin duyệt:

```ts
if (context.tool.name !== DefaultToolNames.RUN_COMMANDS) {
	return undefined
}
// ...
const blocked = findFileEditingCommand(command)
```

(nguồn: [command-guard-extension.ts @ f5af821](https://github.com/cline/cline/blob/f5af821/sdk/packages/core/src/extensions/tools/command-guard-extension.ts)). `findFileEditingCommand` quét lệnh shell để phát hiện thao tác sửa file; bị chặn thì model nhận chính thông báo plan-mode làm kết quả của tool, và run tiếp tục — header của file gọi rõ tinh thần này: "the user is never asked to approve a command that would only fail". Cùng một hook phục vụ cả tool có sẵn lẫn tool do host thay thế (như terminal của extension) — chính sách chạy một chỗ duy nhất thay vì rải cờ qua từng lớp.

OpenCode — [đã phân tích trước đó](/vi/blog/deep-dive-anomalyco-opencode/) — gắn quyền theo vai agent (build full-access, plan read-only); Cline gắn ràng buộc theo trạng thái của cùng một session: Plan/Act chuyển được giữa chừng mà cả hai nhánh đều an toàn. Cùng nguyên lý: ràng buộc nằm ở code, không ở lời hứa.

## Bốn dòng sản phẩm trong bảy ngày

Nhịp release của repo nói tiếp câu chuyện lõi chung: một lõi thì ship được nhiều mặt cùng lúc. 10 release gần nhất, theo GitHub API ngày 2026-09-08:

| Tag | Ngày phát hành |
|---|---|
| desktop-v0.0.23 | 2026-09-03 |
| desktop-v0.0.23-beta.1 | 2026-09-03 |
| v4.1.17 | 2026-09-02 |
| sdk/sdk/v0.0.82 | 2026-09-02 |
| desktop-v0.0.22 | 2026-09-02 |
| cli-v3.0.61 | 2026-09-02 |
| desktop-v0.0.22-beta.1 | 2026-09-01 |
| desktop-v0.0.21 | 2026-08-31 |
| desktop-v0.0.21-beta.2 | 2026-08-31 |
| desktop-v0.0.20 | 2026-08-28 |

10 release trong bảy ngày (28-08 → 03-09), rải trên bốn dòng tag: desktop, extension, CLI, SDK — trong đó riêng extension nhịp đều hơn: 8 bản từ v4.1.10 đến v4.1.17 trong 20 ngày (14-08 → 02-09). Desktop app vẫn ở 0.0.x với bản beta đi trước mỗi bản chính — đúng pha "extension đang trưởng thành thành sản phẩm riêng" mà bản đồ 50 dự án đã ghi nhận. Repo mở cửa 2024-07-06 (theo GitHub API ngày 2026-09-08); điểm nhảy sau hơn hai năm: cả bốn mặt ship cùng lúc, không phải một mặt.

Wakii tách "lúc bàn — lúc làm — lúc kiểm" trong story dài — plan duyệt trước khi executor chạy, gates B0–B5 chặn trước merge — mô tả trong [story workflow](/vi/docs/story-workflow/); đội 9 agent giữ vai đúng ranh giới trong [agents & kit](/vi/docs/agents-and-kit/).

## Wakii học được gì

- **ADOPT** — Checkpoint per-run với restore transactional. Wakii đã có rollback-fixer và watchdog resume từ "last good state", nhưng granularity là per-task commit; Cline cho thấy có thể chụp từng run vào private ref (`refs/cline/checkpoints/...`) và bọc restore trong giao dịch stash-cả-untracked để hoàn tác không phá file chưa track. Đề xuất cụ thể: preflight của task-executor chụp private ref trước mỗi nhóm thao tác ghi, rollback-fixer restore qua giao dịch kiểu đó. Evidence: đoạn `refs/cline/checkpoints` và comment `stash create`/`clean -fd` ở trên.
- **DIRECTION** — Ranh giới mode cứng ở tầng tool. Wakii đã tách plan/execute ở cấp story (plan-critic duyệt trước khi executor vào việc), nhưng giữa task, executor vẫn có thể tự đổi hướng không qua gate. Guard của Cline gợi ý: khi task đang chờ duyệt plan, mutating tool bị từ chối ngay ở tầng tool với lỗi có tên mode — model đọc lỗi và quay về luồng. Khác permission profile theo vai (ADOPT từ bài OpenCode), đây là ràng buộc theo trạng thái của cùng một agent.
- **WATCH** — Lõi chung nhiều mặt bán kèm một mặt đóng. Cline mở lõi lẫn CLI, desktop, SDK nhưng giữ JetBrains plugin ngoài mã nguồn; xem "open core, distribution closed" có thành mặc định ngành — nếu có, Wakii nên giữ lõi và mặt phân phối cùng mở (9 agent + 20 skills hiện công bố cả hai).
- **N/A** — Scheduled agents và connector Telegram/Slack/Discord. Bài toán chatops của sản phẩm agent độc lập; Wakii giám sát story trong panel và mobile, không cần kênh chat ngoài.

Muốn chạy đội agent có gates và review tách vai kiểu này trên workspace thật của bạn, tải Wakii và bắt đầu từ [getting started](/vi/docs/getting-started/) — để agent làm, bạn giữ quyền quyết.
