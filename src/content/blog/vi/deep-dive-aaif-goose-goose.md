---
title: "Goose: agent tự động hoá việc dev trên máy bạn"
description: "goose chạy thẳng trên máy bạn — desktop app, CLI, API — biến việc dev lặp lại thành recipe YAML có thể lập lịch và mở rộng qua extension MCP. Deep-dive kiến trúc và bài học cho agentic IDE."
pubDate: "2026-10-08"
category: "tech"
tags: ["agents", "cli", "workflow"]
draft: false
---

Phần lớn agent dev sống trong editor: mở IDE, gõ prompt, đọc kết quả ngay tại đó. goose chọn hướng khác — nó là một tiến trình chạy trên máy bạn, có desktop app, CLI và API riêng, và công việc không bó trong việc code. Repo đang ở 54.022 sao theo GitHub API ngày 2026-09-08, vẫn push trong đúng ngày hôm đó, và thuộc Agentic AI Foundation tại Linux Foundation. Điều đáng học không phải con số sao, mà là ba cơ chế: việc lặp lại được đóng thành recipe YAML, scheduler lộ ra cho agent như một extension bình thường, và goose dùng chính nó làm reviewer trong CI của chính nó.

TL;DR:

- goose là agent đa dụng chạy trên máy bạn — desktop app, CLI, API — không gắn vào một editor cụ thể.
- Việc dev lặp lại đóng thành recipe: YAML khai tham số, extension và prompt template, kiểm bằng máy trước khi chạy.
- Scheduler là một "platform extension": agent tự tạo, pause, resume các run định kỳ qua cùng tool surface với MCP server ngoài.
- goose review PR của chính goose trong CI, với ghi chú cảnh báo prompt-injection viết ngay đầu workflow.
- Với Wakii: ghi rõ injection boundary, thiết kế scheduled maintenance có gate, và theo dõi local inference.

## Agent chạy trên máy bạn, không trong editor

README gọi goose bằng một dòng: "your native open source AI agent — desktop app, CLI, and API — for code, workflows, and everything in between" (README của aaif-goose/goose, [github.com/aaif-goose/goose](https://github.com/aaif-goose/goose)). Đó không phải mô tả một trợ lý viết code trong IDE: research, automation, data analysis đều là việc của nó. Thân app viết bằng Rust, chạy trên macOS, Linux và Windows.

Bức ảnh toàn cảnh theo GitHub API ngày 2026-09-08:

| Chỉ số | Giá trị |
|---|---|
| Stars | 54.022 |
| License | Apache-2.0 |
| Push gần nhất | 2026-09-08 |
| Archived | false |
| Release mới nhất | v1.49.0 — 2026-09-03 |

Nhịp release dày — sáu phiên bản minor trong sáu tuần, theo GitHub API ngày 2026-09-08:

```
v1.49.0  2026-09-03
v1.48.0  2026-08-27
v1.47.0  2026-08-21
v1.46.0  2026-08-12
v1.45.0  2026-07-29
v1.44.0  2026-07-23
```

Một dự án ship đều ở tốc độ đó không phải thử nghiệm bỏ đi; đó là cơ sở hạ tầng mà người khác đang dựa vào.

## Việc dev lặp lại đóng thành recipe YAML

Cơ chế trung tâm của goose cho automation là recipe: một file YAML khai version, tham số, extension cần gắn và prompt template. Đây là recipe goose dùng để review chính code của goose — hai tham số bắt buộc, một extension builtin và một MCP server chạy bằng uv ([.github/recipes/code-review.yaml](https://github.com/aaif-goose/goose/blob/5e90925962f05acf8e255032de44d16c4a7768a2/.github/recipes/code-review.yaml)):

```yaml
version: "1.0.0"
title: GitHub PR Code Review
parameters:
  - key: pr_directory
    input_type: string
    requirement: required
  - key: instructions
    input_type: string
    requirement: required
extensions:
  - type: builtin
    name: developer
  - type: stdio
    name: code_review
    cmd: uv
    args: ["run", "{{ recipe_dir }}/../scripts/pr-review-mcp.py"]
```

Một recipe là artifact: chia sẻ được, tham số hoá được, và quan trọng nhất — kiểm bằng máy được trước khi chạy. goose-cli còn tải recipe từ một repo GitHub về chạy trực tiếp (hàm `retrieve_recipe_from_github` trong [crates/goose-cli/src/recipes/github_recipe.rs](https://github.com/aaif-goose/goose/blob/5e90925962f05acf8e255032de44d16c4a7768a2/crates/goose-cli/src/recipes/github_recipe.rs)). Việc dev lặp lại — review PR, tổng hợp log, chạy bộ kiểm thử — biến thành file config thay vì một chuỗi prompt phải nhớ trong đầu.

## Scheduler là một extension, không phải đặc quyền

Điểm kiến trúc đáng học nhất: scheduler — tính năng của chính goose — được implement đúng như một extension ngoài. File [crates/goose/src/agents/platform_extensions/scheduler.rs](https://github.com/aaif-goose/goose/blob/5e90925962f05acf8e255032de44d16c4a7768a2/crates/goose/src/agents/platform_extensions/scheduler.rs) đặt `EXTENSION_NAME = "scheduler"` và mô tả công việc trong chính instructions của tool: "Create, list, update, pause, resume, and remove scheduled recipe runs, and inspect the sessions they produced." Agent tạo lịch chạy recipe bằng đúng protocol nó dùng để gọi MCP server:

```
model ─── một tool surface duy nhất ───┬─► MCP server ngoài
                                       ├─► builtin developer
                                       └─► scheduler (nội bộ, cùng protocol)
```

Việc nhận lịch cũng không tin tưởng mù. `read_schedule_recipe` trong [crates/goose/src/agents/schedule_tool.rs](https://github.com/aaif-goose/goose/blob/5e90925962f05acf8e255032de44d16c4a7768a2/crates/goose/src/agents/schedule_tool.rs) canonicalize đường dẫn, chặn file lạ, giới hạn kích thước recipe ở đúng 1.048.576 byte rồi mới validate template:

```rust
if opened_metadata.len() > MAX_SCHEDULE_RECIPE_BYTES {
    return Err(recipe_file_error(
        "Recipe file exceeds the 1048576 byte limit",
    ));
}
```

Run định kỳ bằng agent là dạng việc dễ gãy — recipe hỏng, model đổi hành vi — nên goose chặn ngay ở cửa nhận lịch: artifact phải là file thường, đúng giới hạn, hợp lệ trước khi được hẹn giờ.

## goose review PR của chính goose

Hai cơ chế trên gặp nhau trong CI của goose. Workflow [goose-pr-reviewer.yml](https://github.com/aaif-goose/goose/blob/5e90925962f05acf8e255032de44d16c4a7768a2/.github/workflows/goose-pr-reviewer.yml) kích hoạt khi ai đó comment "/goose" kèm tuỳ chọn trên một PR (chỉ OWNER/MEMBER), nhét một recipe review vào env và để agent chạy. Phần đáng chú ý nhất nằm ở mấy dòng comment đầu file:

```
# Security:
#   - PR content could prompt-inject the agent; only trigger on PRs you trust.
#   - Do not add workflow_dispatch: API calls fetch mutable data, enabling TOCTOU attacks.
```

Đó là văn hoá, không phải giấy tờ: entry point tự động hoá nạp nội dung bên ngoài thì phải ghi rõ biên độ tin cậy — ai được kích hoạt, dữ liệu nào là untrusted, vì sao một trigger tiện lợi khác bị từ chối. Điều kiện để dám bật automation là những điều này được viết ra.

## Máy cấu hình của bạn: providers, extension, foundation

Theo README (lấy ngày 2026-09-08), goose hỗ trợ hơn 15 provider — Anthropic, OpenAI, Google, Ollama, OpenRouter, Azure, Bedrock — và dùng subscription Claude, ChatGPT hay Gemini sẵn có qua ACP; phía tool, README ghi kết nối hơn 70 extension qua MCP. Cây source tại commit 5e909259 (probe ngày 2026-09-08) tách rõ từng lớp: `goose-mcp` cho protocol, `goose-local-inference` cho model chạy local, `goose-providers` cho lớp provider, `goose-acp-macros` cho ACP.

Vấn đề sở hữu cũng đã đổi lớp. Gọi GitHub API `repos/block/goose` ngày 2026-09-08, hệ thống trả về định danh mới `aaif-goose/goose` — redirect chuẩn mà GitHub cấp cho repo đã chuyển org; README và GOVERNANCE.md đều ghi goose thuộc Agentic AI Foundation tại Linux Foundation, với ba vai trò Contributors, Maintainers, Core Maintainers. Tên "block/goose" vẫn còn quen trong cộng đồng, nhưng chứng chỉ sở hữu ngày nay nằm ở một foundation, không phải một công ty.

## Wakii học được gì

- **ADOPT** — ghi rõ injection boundary tại mọi entry point tự động. goose viết thẳng vào CI workflow rằng nội dung PR có thể prompt-inject agent, và từ chối `workflow_dispatch` vì TOCTOU (mục goose review PR). Wakii có các entry tương tự nạp nội dung bên ngoài — code-reviewer đọc diff từ PR, watchdog tự resume dựa trên state Linear — và các skill, agent definition trong kit nên có chú thích boundary tương tự: dữ liệu nào là untrusted, ai được kích hoạt.
- **DIRECTION** — scheduled maintenance như một surface hạng nhất. `scheduler__manage_schedule` cho agent tạo, pause, resume run định kỳ từ recipe đã validate (mục scheduler); tab ⚡ Workflow của Wakii hiện launch run theo lượt người dùng. Khoảng cách không nằm ở kỹ thuật mà ở gate cho run unattended — principle "Humans own the irreversibles" cần một thiết kế gate riêng trước khi lịch chạy không người ra đời.
- **WATCH** — local inference. goose có crate riêng `goose-local-inference` và provider Ollama để chạy model trên máy (mục providers); Wakii đi trên Claude Code harness. Chuyển sang DIRECTION khi harness mở provider local hoặc nhu cầu privacy trở nên cụ thể.
- **N/A** — foundation governance và custom distro. AAIF/Linux Foundation và white-labelling là mô hình của dự án OSS đa tổ chức; Wakii là sản phẩm của một team, không cạnh tranh ở tầng sở hữu đó.

Kiến trúc goose và story workflow của Wakii trả lời cùng một câu hỏi: làm sao để agent chạy việc thật trên máy bạn mà vẫn kiểm soát được. Muốn thấy bức tranh lớn hơn của hệ sinh thái, đọc [agentic landscape — 50 dự án](/vi/blog/agentic-landscape-50-projects/); muốn hiểu Wakii đặt gate quanh tự động hoá thế nào, đọc [decision gates cho AI agent an toàn](/vi/blog/decision-gates-safe-ai-agents/). Bộ agent team của Wakii cài sẵn kèm app — bắt đầu từ [getting started](/vi/docs/getting-started/), để agent chạy, phần quyết định vẫn thuộc về bạn.
