---
title: "OpenCode: agent coding terminal độc lập vendor"
description: "Deep-dive kiến trúc OpenCode — 205.815★, MIT: một lõi chạy với mọi nhà cung cấp mô hình, permission gắn theo từng agent và ngưỡng compaction đo được, đọc thẳng từ code trên GitHub."
pubDate: "2026-10-01"
category: "tech"
tags: ["agents", "terminal", "architecture", "oss"]
draft: false
heroImage: "/blog/heroes/deep-dive-anomalyco-opencode.png"
---

Phần lớn agent coding bạn gặp hôm nay sinh ra để bán một mô hình: harness đi theo vendor, và vendor quyết định bạn được dùng gì. OpenCode đi lối ngược — nó làm phần vỏ, không phải phần mô hình: provider nào cũng cắm được, client nào cũng chạy được, và toàn bộ kiến trúc nằm công khai trên GitHub để đọc. Theo GitHub API ngày 2026-09-08, dự án đứng ở 205.815★, 26.857 forks, license MIT, và vẫn push code cùng ngày probe. Bài này bóc kiến trúc đó từ chính code, không qua press release — góc nhìn một repo cụ thể, khác với [bản đồ 50 dự án](/vi/blog/agentic-landscape-50-projects/) đã viết trước đó.

TL;DR — bạn sẽ đọc được gì:

- OpenCode là coding agent chạy trong terminal, độc lập vendor: catalog mô hình lấy từ models.dev, không khóa một nhà cung cấp nào
- Một lõi agent (TypeScript, monorepo hơn 30 packages) phục vụ ba mặt: TUI terminal, desktop app BETA, và ACP cho editor
- Permission ba mức allow/ask/deny gắn theo từng agent — agent plan mặc định read-only, chặn ngay ở code chứ không phải lời dặn trong prompt
- Context là tài nguyên có ngưỡng: compaction hard-code con số 20.000/40.000 token ngay trong source
- Nhịp ship dày: 10 releases trong 15 ngày, ba ngày trong đó ra hai release

## Một lõi, ba mặt xuất phát

Mở cây repo tại commit d6855b6, thư mục `packages/` liệt kê hơn 30 mục: `tui` (giao diện terminal), `desktop` (app BETA cho macOS/Windows/Linux), `server`, `sdk`, `plugin`, `protocol`, `llm`... Lõi agent thật nằm ở `packages/opencode/src/` — nơi chứa các module quyết định hành vi: `session`, `tool`, `skill`, `permission`, `worktree`, `mcp`, `provider`.

```
                    ┌────────────────────────────┐
                    │     agent core (TS)        │
                    │ session · tool · skill     │
                    │ permission · worktree      │
                    └─────────────┬──────────────┘
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
    TUI (terminal)         desktop app (BETA)        ACP service
    xếp chỗ mặc định       DMG/EXE/AppImage          editor cắm vào
```

Ba mặt, một lõi: cùng một vòng session-tool-permission chạy trong cả terminal lẫn editor. Điểm đáng chú ý là mặt thứ ba — thư mục `acp/` chứa một service Agent Client Protocol hoàn chỉnh (`session.ts`, `permission.ts`, `tool.ts`, `usage.ts`), nghĩa là OpenCode phục vụ được như backend agent cho editor bên ngoài chứ không đóng kín trong TUI của chính nó. Thư mục `worktree/` cũng xuất hiện ngay ở tầng lõi — isolation cây làm việc là công dân hạng nhất, không phải tính năng gắn vào sau.

## Độc lập vendor là quyết định kiến trúc

README tự giới thiệu một câu: "The open source AI coding agent." (nguồn: [README của anomalyco/opencode @ d6855b6](https://github.com/anomalyco/opencode/blob/d6855b6/README.md), lấy ngày 2026-09-08). Câu ngắn, nhưng chữ "open source" ở đây đi cùng license MIT — theo GitHub API ngày 2026-09-08 — nên bạn đọc được mọi tầng, kể cả tầng hay được giấu: cách harness chọn mô hình.

Câu trả lời nằm trong `provider/provider.ts`: catalog mô hình và metadata provider được nạp qua module `ModelsDev` — cơ sở dữ liệu mô hình mở tại models.dev, không thuộc nhà cung cấp nào. Trong file còn thấy comment xử lý chi tiết thực tế như prefix vùng (`us.`, `eu.`) hay cách đặt tên model của từng vendor.

```
// packages/opencode/src/provider/provider.ts
import { ModelsDev } from "@opencode-ai/core/models-dev"
```

(nguồn: [provider/provider.ts @ d6855b6](https://github.com/anomalyco/opencode/blob/d6855b6/packages/opencode/src/provider/provider.ts))

Nói cách khác: việc hỗ trợ một provider mới không phải là viết code riêng trong repo, mà là dữ liệu cập nhật ở catalog chung. Đó là lý do một agent terminal độc lập vendor giữ được tốc độ hỗ trợ mô hình mới mà không phình codebase — và đó cũng là lý do dự án này đứng đầu nhóm harness trong bản đồ 50 dự án.

## Permission gắn theo agent, không theo lời dặn

Đây là phần thú vị nhất với ai đang xây hệ agent. Mỗi agent trong OpenCode là một cấu trúc dữ liệu có field `permission` kiểu `PermissionV1.Ruleset` — quy tắc truy cập nằm cạnh định nghĩa agent, trong cùng file, được máy đọc trước khi agent chạy.

Hai agent có sẵn (theo README): **build** — full-access cho việc dev, và **plan** — read-only, phải xin phép trước lệnh shell. Agent phụ **general** lo việc tìm kiếm nhiều bước, gọi bằng `@general` trong hội thoại. Phần read-only của plan không phải lời dặn mềm trong system prompt; nó là ruleset cứng trong `agent/agent.ts`:

```
const readonlyExternalDirectory = {
  "*": "ask",
  ...Object.fromEntries(whitelistedDirs.map((dir) => [dir, "allow"])),
} satisfies Record<string, "allow" | "ask" | "deny">
```

(nguồn: [agent/agent.ts @ d6855b6](https://github.com/anomalyco/opencode/blob/d6855b6/packages/opencode/src/agent/agent.ts)). Ba mức allow/ask/deny: mọi thư mục ngoài mặc định "ask", riêng các vùng whitelist — thư mục skill, thư mục temp, glob của tool truncate — được "allow" sẵn. Vai nào đó cần ghi code thì cấp thêm; vai chỉ đọc thì chặn ở tầng permission, trước khi LLM kịp "quên".

| Agent | Quyền mặc định | Dùng cho |
|---|---|---|
| build | full access | viết code, chạy lệnh |
| plan | read-only, "ask" cho shell | phân tích, khám phá codebase |
| general | subagent | tìm kiếm nhiều bước |

## Context là tài nguyên có ngưỡng

Session agent kéo dài thì context đầy — phần hay bị xử lý theo cảm tính ("khi nào tràn thì tóm lại"), OpenCode hard-code con số ngay trong `session/compaction.ts`:

```
export const PRUNE_MINIMUM = 20_000
export const PRUNE_PROTECT = 40_000
const TOOL_OUTPUT_MAX_CHARS = 2_000
const PRUNE_PROTECTED_TOOLS = ["skill"]
```

(nguồn: [session/compaction.ts @ d6855b6](https://github.com/anomalyco/opencode/blob/d6855b6/packages/opencode/src/session/compaction.ts)). Đọc trực tiếp: khi prune, giữ tối thiểu 20.000 token; vùng bảo vệ 40.000 token; output của tool bị cắt ở 2.000 ký tự; riêng output của tool skill được miễn prune. Chính sách compaction trở thành thứ có thể review, tranh luận, và regression-test — chứ không phải hành vi emergent của một prompt dài.

## Nhịp ship: 10 release trong 15 ngày

Cadence release nói nhiều về quy trình bên trong hơn bất kỳ tuyên bố nào. Danh sách 10 release gần nhất, theo GitHub API ngày 2026-09-08:

| Tag | Ngày phát hành |
|---|---|
| v1.18.29 | 2026-09-04 |
| v1.18.28 | 2026-09-04 |
| v1.18.27 | 2026-09-02 |
| v1.18.26 | 2026-09-01 |
| v1.18.25 | 2026-08-28 |
| v1.18.24 | 2026-08-28 |
| v1.18.23 | 2026-08-25 |
| v1.18.22 | 2026-08-24 |
| v1.18.21 | 2026-08-21 |
| v1.18.20 | 2026-08-21 |

10 release từ 21-08 đến 04-09, trong đó ba ngày (21-08, 28-08, 04-09) có tới hai release. Với một repo 205.815★ (ngày 2026-09-08), nhịp này nghĩa là quy trình phát hành đã tự động hoá tới mức cho ra bản mới gần như mỗi ngày làm việc — cùng họ cadence với claude-code ở đầu bảng, và ngược hẳn với aider đứng đóng băng cuối bảng.

Phần phân quyền agent trong kit của Wakii nằm trong [agents & kit](/vi/docs/agents-and-kit/); cơ chế story dài và watchdog nằm trong [story workflow](/vi/docs/story-workflow/).

## Wakii học được gì

- **ADOPT** — permission profile tường minh theo agent. Wakii đã có worktree isolation và nguyên tắc "người làm không tự duyệt" trong đội 9 agent; đề xuất cụ thể: khai permission profile cạnh định nghĩa từng agent trong kit (code-reviewer và verifier: deny edit; task-executor: allow trong phạm vi worktree) để phân quyền được kiểm tra bằng máy, không chỉ trông vào system prompt. Evidence: bảng build/plan và ruleset `readonlyExternalDirectory` ở trên.
- **DIRECTION** — compaction có ngưỡng đo được. Watchdog của Wakii auto-resume story dài từ last good state; khi story nhiều ngày thành phổ biến hơn, chính sách context kiểu 20.000/40.000 token tường minh là hướng đáng đưa vào kit thay vì để mỗi agent tự xử lý.
- **WATCH** — ACP (Agent Client Protocol). OpenCode ship một ACP service hoàn chỉnh để editor bên ngoài cắm vào; đây là quyết định strategic đang theo dõi. Điều kiện đổi: khi ACP phủ đủ tầng editor, đánh giá lại việc chuẩn hoá lớp agent-editor.
- **N/A** — desktop app BETA và README 22 ngôn ngữ (ngày 2026-09-08): bài toán phân phối đa nền tảng của một dự án 205.815★, chưa phải bài toán của Wakii ở giai đoạn này.

Muốn chạy quy trình tách quyền làm–quyết kiểu này trên máy của bạn, tải Wakii và bắt đầu từ [getting started](/vi/docs/getting-started/) — để agent chạy, bạn giữ quyền quyết.
