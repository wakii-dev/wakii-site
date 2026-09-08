---
title: "DeepSeek Harness: kiến trúc agent bên trong mô hình mở"
description: "Mổ xẻ kiến trúc everything-is-a-plugin của DeepSeek Harness — 55 package Cordis, mười hai release trong 25 ngày — và rút ra những pattern Wakii áp dụng được."
pubDate: "2026-10-01"
category: "tech"
tags: ["agents", "architecture", "oss"]
draft: false
heroImage: "/blog/heroes/deep-dive-deepseek-ai-deepseek-harness.png"
---

Ngày 13-08-2026, DeepSeek AI công khai repo deepseek-harness. Hai mươi sáu ngày sau, repo chạm mốc 215.800 sao theo GitHub API ngày 2026-09-08. Nhưng con số ấy không phải phần đáng đọc nhất. Phần đáng đọc là dòng mô tả của chính repo: "Everything is a Plugin" — toàn bộ agent harness, kể cả vòng lặp agent, tool registry và session log, được dựng thành plugin thay được qua cấu hình, chạy trên microkernel Cordis. Bài này đọc code và tài liệu kiến trúc của repo để chỉ ra thiết kế đó vận hành ra sao, và những ai đang xây agent có thể mượn gì.

**TL;DR**

- Không có lõi đặc quyền: model adapter, tool registry, session log, agent loop đều là plugin; một profile `dsh` chỉ là danh sách bundle xếp lớp, lớp sau patch được lớp trước.
- Invariant "model-visible means logged": mọi thứ chạm tới model request phải tái tạo được từ session log — có assertion runtime giám sát điều đó.
- Guard vận hành kiểu advisory: phát hiện model gọi lặp một tool rồi nhắc trong context, không veto lệnh nào.
- Nhịp shipping: 12 release trong 25 ngày, toàn alpha/rc, chưa có bản stable; đi kèm coverage gate per-file 100% và postmortem công khai.
- Wakii mượn được: guard advisory cho watchdog, invariant log-first làm hướng đi cho bằng chứng.

## Không có lõi đặc quyền — mọi thứ là plugin

Cordis — framework mà dsh vendor thẳng vào repo — cung cấp ba thứ: plugin đóng góp service, typed event, và effect có thể hoàn tác vào một context dùng chung. Tài liệu kiến trúc của repo phát biểu nguyên tắc này một câu: "Every part of the product is a plugin, including the model adapter, the tool registry, the session log, and the agent loop itself" (DeepSeek Harness, [docs/architecture.md](https://github.com/deepseek-ai/deepseek-harness/blob/c389f96/docs/architecture.md)). Không có chỗ nào để patch lõi — vì không có lõi; mở rộng là mount một plugin cạnh các plugin khác, plugin unload thì mọi registration tự hoàn tác.

Cấu hình runtime là cây plugin dựng lúc boot từ các lớp có thứ tự: profile (`web`, `headless`, `sdk`, `sdk-minimal`, `acp`) liệt kê bundle nó xếp lên; bundle tự khai báo trong `package.json` qua trường `dsh`; lớp sau patch theo id vào cấu hình lớp trước. Độ phủ (nguồn: [AGENTS.md](https://github.com/deepseek-ai/deepseek-harness/blob/c389f96/AGENTS.md) @ `c389f96`, theo GitHub API ngày 2026-09-08):

| Nhóm package | Trách nhiệm |
|---|---|
| `core/` — session, system-prompt, tools, agent, agent-loop | trục sản phẩm: log sự kiện, ghép prompt, registry tool, vòng lặp |
| `guard/` | vệ sinh vòng lặp: phát hiện gọi lặp, timeout policy |
| `plan/`, `todo/`, `goal/` | plan mode là trạng thái được log; tool `todo_write`; mục tiêu trong phiên |
| `skill/`, `mcp/`, `acp/` | registry skill; giao thức MCP; server ACP chỉ để tự động hoá |
| `subagent/`, `workflow/`, `jobs/` | phân rã việc cho agent con; workflow nền trên worker-thread |
| `sandbox/`, `fs/`, `shell/` | thế giới thi hành: Landlock native, filesystem policy, bash |

`packages/` chứa 55 entry theo đúng các nhóm đó — mỗi nhóm một seam thay được. Provider swap một lần đổi cả sản phẩm: trỏ filesystem và subprocess về sandbox từ xa, Bash, PTY, LSP theo cùng thế giới thi hành, không fork provider nào.

## Một turn trôi qua những event nào

dsh định nghĩa step là một request tới model cộng với các tool nó gọi; turn gồm không hoặc nhiều step. Vòng đời là chuỗi event có tên — sơ đồ rút gọn từ [tài liệu kiến trúc](https://github.com/deepseek-ai/deepseek-harness/blob/c389f96/docs/architecture.md):

```text
turn/start
  agent/pre-step        # chặn hoặc viết lại message trước khi model thấy
  step/start
    agent/request → llm/stream → agent/assistant-stream
    tool/call → tools/pre-execute → tools/execute → tools/post-execute
  step/end
  agent/turn-stopping   # serial, không có next()
turn/end
```

Ba event `agent/pre-step`, `agent/request`, `llm/stream` là waterfall: listener phải gọi `next()` để nhường tiếp, muốn chặn thì giữ lại. `agent/pre-step` còn có quyền viết lại message trước khi model thấy — đây chính là chỗ đứng của guard ở section sau.

## Model nhìn thấy gì thì log phải có cái đó

Session log append-only; `deriveMessages()` chiếu lịch sử model từ log ra, không có lịch sử riêng nào khác. Invariant được phát biểu một câu trong tài liệu: "Anything that reaches a model request must be reconstructable from the log" — và repo viết assertion runtime để giám sát chính nó ([docs/architecture.md](https://github.com/deepseek-ai/deepseek-harness/blob/c389f96/docs/architecture.md)). Hệ quả thiết kế: muốn thêm một input mới mà model nhìn thấy, bạn phải thêm một session event mới — không có đường tắt.

Dữ liệu session lưu JSONL có phiên bản (`session.vN.jsonl`, nén zstd); generation đã commit không bao giờ bị đổi tên, ghi đè hay xóa — migrate là thêm file successor, không phải sửa file cũ. Văn hóa minh bạch đi kèm: bốn postmortem công khai nằm trong `docs/postmortem/`, ví dụ số 0004 ghi lại lỗi phân loại thất bại của tiến trình con trong sandbox Landlock.

## Guard canh vòng lặp mà không chặn tay

`guard/repeat-tool-reminder` là ví dụ gọn nhất: đếm số lần model gọi lặp liên tiếp một tool, chạm ngưỡng — mặc định 3, rồi 5, rồi 8 — thì chèn reminder vào context request kế tiếp (excerpt phục vụ phân tích, [nguồn @ `c389f96`](https://github.com/deepseek-ai/deepseek-harness/blob/c389f96/packages/guard/repeat-tool-reminder/src/index.ts)):

```ts
export interface Config {
  /** Consecutive-repeat counts that trigger a reminder (default `[3, 5, 8]`). */
  thresholds?: number[]
  /** Tool-name patterns to track; empty means every tool is tracked. */
  include?: string[]
  /** Tool-name patterns transparent to the chain (neither count nor reset). */
  exclude?: string[]
}

const PLUGIN_SOURCE: MessageSource = { kind: 'plugin', plugin: 'repeat-tool-reminder' }
```

Ba chi tiết đáng chú ý. Một: detector chỉ enrich quyết định post-execute — không veto, không viết lại lệnh nào. Hai: reminder mang nhãn nguồn plugin — comment giải thích nhãn là load-bearing, vì context không nhãn sẽ render thành user prompt trong lịch sử phái sinh. Ba: cấu hình sai fail ngay lúc load plugin — "never a silent fall-back", đúng lời comment của tác giả. Canh gác mà không cướp quyền quyết, sai cấu hình thì ồn ào chứ không im lặng.

## Mười hai release trong 25 ngày — và chưa bản nào stable

Repo tạo ngày 13-08; đến 08-09 đã có 12 release theo GitHub API ngày 2026-09-08, dày nhất vào cuối tháng 8:

| Tag | Ngày phát hành |
|---|---|
| `dsh-v0.1.1-rc.1` | 2026-08-21 |
| `dsh-v0.1.2-alpha.1` | 2026-08-27 |
| `dsh-v0.1.2-alpha.3` | 2026-08-31 |
| `dsh-v0.1.2-alpha.5` | 2026-09-01 |
| `dsh-v0.1.2-rc.1` | 2026-09-03 |
| `dsh-v0.1.3-alpha.1` | 2026-09-04 |
| `dsh-v0.1.3-alpha.2` | 2026-09-07 |

Nhận định một dòng: nhịp vài ngày một bản đúng phase developer preview — cả 12 tag đều alpha/rc; endpoint `releases/latest` trả 404 vì chưa có bản non-prerelease nào. README cảnh báo thẳng: sẽ có compatibility-breaking changes.

Nhịp ấy giữ được chất lượng nhờ kỷ luật ghi thẳng trong [AGENTS.md @ `c389f96`](https://github.com/deepseek-ai/deepseek-harness/blob/c389f96/AGENTS.md): CI gate đòi coverage per-file 100% trên mọi package, `benchmarks/` được gọi là performance gates, `.agents/notes` chứa khoảng 100 decision note có ngày kèm i18n. Repo còn ship bộ skill cho chính agent phát triển nó — `dsh-code-review`, `dsh-pre-push-checks`, `dsh-ci-test-reliability` — agent xây harness bằng đúng cơ chế harness phát cho agent. Đây đúng quan sát trong [bản đồ 50 dự án agentic coding](/vi/blog/agentic-landscape-50-projects/): nhịp release phản chiếu quy trình, không phải số commit.

Wakii không dùng microkernel plugin, nhưng cùng nguyên tắc với đội agent của mình: vai nào tách khỏi vai viết code, và mọi gate đòi bằng chứng. Đội chín agent, gates B0–B5 và watchdog được mô tả trong [agents & kit](/vi/docs/agents-and-kit/) và [story workflow](/vi/docs/story-workflow/).

## Wakii học được gì

- **ADOPT — guard advisory kiểu nhắc-thay-vì-chặn.** `repeat-tool-reminder` phát hiện lặp tool (ngưỡng 3-5-8) rồi inject reminder vào context, không veto lệnh nào. Wakii đã có loop caps cho task-executor; đề xuất cụ thể: story-watchdog đếm consecutive same-tool calls từ transcript và inject cảnh báo trước khi kết luận stall — bớt nhầm "đang chạy dài" với "kẹt thật".
- **DIRECTION — invariant "model-visible means logged".** Mọi input tới model phải tái tạo được từ session log, có assertion runtime giám sát. Wakii có evidence-pack và Rule 0 nhưng chưa có invariant tự động dạng "mỗi ngữ cảnh agent nhận phải truy được về artifact" — hướng đi hợp lý cho story-* CLIs thế hệ sau.
- **WATCH — self-modification và agent teams.** Package `self-modification/` cho agent tự mount plugin; seam agent-teams (roster, task board, mailbox) còn opt-in private, và repo tự cảnh báo API sẽ vỡ trong preview — theo dõi tới khi ổn định rồi mới cân nhắc.

Bạn đang xây agent hoặc vận hành đội agent? Đọc deepseek-harness theo đúng cách repo khuyến nghị — cho agent khám phá code — rồi thử đội agent có sẵn của Wakii: cài theo [getting started](/vi/docs/getting-started/) và mở ⚡ Superpowers panel.
