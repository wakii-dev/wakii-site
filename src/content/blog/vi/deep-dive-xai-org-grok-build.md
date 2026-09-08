---
title: "grok-build: khi xAI tự viết harness cho model mình"
description: "Đọc grok-build như một data point của pattern nhà model tự viết harness: mirror một chiều từ monorepo, crate đọc session của Claude Code và Codex, và cổng ACP ra editor ngoài."
pubDate: "2026-10-10"
category: "tech"
tags: ["agents", "architecture", "cli"]
draft: false
---

Cuộc đua agent CLI năm 2026 lặp lại một quy luật: nhà model nào đủ lớn cũng tự viết harness cho model của mình. Anthropic có Claude Code, Google có Gemini CLI, và xAI có grok-build — công khai trên GitHub từ giữa tháng 7 năm nay. Bài này đọc grok-build như một điểm dữ liệu của pattern trên, qua ba câu hỏi: repo tổ chức code ra sao, gắn chặt những gì vào model nhà, và mở cổng nào ra bên ngoài.

TL;DR:

- grok-build là harness TUI viết bằng Rust của xAI cho model Grok: chạy interactive, headless cho CI, hoặc nhúng vào editor qua Agent Client Protocol (ACP) — theo GitHub API ngày 2026-09-08.
- Repo là mirror một chiều: 8 commit gần nhất đều mang message "Synced from monorepo", không nhận contribution ngoài, không có GitHub Releases hay tag.
- Điểm dữ liệu hiếm: một crate đọc metadata session của Claude Code, Codex và Cursor trên máy bạn — có giới hạn chặt (50 session mỗi tool, 30 ngày).
- Với Wakii, pattern "nhà model tự đóng gói harness" là thứ cần theo dõi chứ không phải thứ bắt chước vội — grading WATCH ở cuối bài.

## Một điểm dữ liệu của pattern nhà model tự viết harness

Harness độc lập như aider hay goose sinh ra để nối nhiều model vào terminal của bạn. Harness nhà model vì mục đích khác: đóng gói model của chính mình thành sản phẩm đầu-cuối, kiểm soát từ system prompt đến cách edit file. Bảng dưới tóm tắt grok-build tại thời điểm probe:

| Thuộc tính | Giá trị (theo GitHub API ngày 2026-09-08) |
|---|---|
| Stars | 26.563 |
| Forks | 4.991 |
| Ngôn ngữ | Rust |
| License | Apache-2.0 |
| Tạo repo | 2026-07-14 |
| Push gần nhất | 2026-09-01 |

Hai con số nói nhiều: 26.563 sao chỉ sau gần 8 tuần kể từ 2026-07-14 cho thấy nhu cầu thật, còn mốc push 2026-09-01 cách ngày probe 7 ngày cho thấy nhịp sync đều. Về kiến trúc, README grok-build mô tả repo chứa "the Rust source for the `grok` CLI/TUI and its agent runtime" — khoảng 75 crate trong workspace, chia thành các lớp rõ: TUI (xai-grok-pager), agent runtime (xai-grok-shell), tool implementations (xai-grok-tools), và lớp workspace làm việc với filesystem, VCS, checkpoint (xai-grok-workspace).

Sơ đồ so sánh hai họ harness:

```text
  NHÀ MODEL                            HARNESS ĐỘC LẬP
  ┌─────────────────────┐              ┌─────────────────────┐
  │  model (Grok)       │              │  aider / goose /    │
  │  + harness (grok)   │              │  OpenHands          │
  │  — cùng một nhà     │              │  —model-agnostic,   │
  │  — sync một chiều   │              │   cộng đồng đóng góp│
  └─────────────────────┘              └─────────────────────┘
```

## Mirror một chiều: sync từ monorepo, không nhận PR

README grok-build ghi rõ repo được "synced periodically from the SpaceXAI monorepo" (README grok-build, [github.com/xai-org/grok-build](https://github.com/xai-org/grok-build)). Cụ thể: một file nhỏ tên `SOURCE_REV` ở gốc repo lưu SHA của commit monorepo nội bộ tương ứng với bản code đang công khai — tại thời điểm probe, giá trị là `a549186d…` (full SHA trong `SOURCE_REV`, ghi nguyên bản ở digest).

Lịch sử commit xác nhận cơ chế này. 8 commit gần nhất, probe bằng GitHub API ngày 2026-09-08:

| SHA | Ngày | Message |
|---|---|---|
| 72a6125 | 2026-09-01 | Synced from monorepo |
| bb7f39d | 2026-08-31 | Synced from monorepo |
| bc7f02e | 2026-08-28 | Synced from monorepo |
| 9684fa3 | 2026-08-27 | Synced from monorepo |
| 77cd7eb | 2026-08-25 | Synced from monorepo |
| c2ad97f | 2026-08-24 | Synced from monorepo |
| 07b2f71 | 2026-08-23 | Synced from monorepo |
| 19d42e3 | 2026-08-19 | Synced from monorepo |

Không một commit nào mang tên tác giả ngoài, không một feature branch. Nhịp sync khoảng 1-3 ngày một lần trong khoảng 19/08 đến 01/09. Contributing cũng chặn từ đầu: "External contributions are not accepted" (README grok-build, [github.com/xai-org/grok-build](https://github.com/xai-org/grok-build)). GitHub Releases của repo là con số 0, tag cũng 0 theo GitHub API ngày 2026-09-08 — binary chính thức phân phối qua install script tại x.ai/cli, changelog nằm ngoài GitHub. Lựa chọn thiết kế ở đây: công khai code để minh bạch, nhưng giữ toàn quyền ghi trong monorepo nội bộ.

## Crate đọc session của Claude Code, Codex và Cursor

Phát hiện thú vị nhất nằm ở crate `xai-grok-foreign-sessions`. Tài liệu trong code tự mô tả đây là "Bounded, metadata-only listing of foreign coding-agent sessions" (xai-grok-foreign-sessions, [github.com/xai-org/grok-build](https://github.com/xai-org/grok-build)). Danh sách "foreign" ở đây là harness của các nhà khác:

```rust
pub enum ForeignSessionTool {
    Claude,
    Codex,
    Cursor,
}
```

(Trích từ [`src/lib.rs` của crate `xai-grok-foreign-sessions`, commit 72a6125](https://github.com/xai-org/grok-build/blob/72a61251fcffb464bcc687aeb5a998e5a98ec0c9/crates/codegen/xai-grok-foreign-sessions/src/lib.rs))

Với Claude Code, crate scan thư mục `~/.claude` (hoặc đường dẫn trong biến môi trường `CLAUDE_CONFIG_DIR` nếu có) — đoạn sau là điểm vào của scanner:

```rust
pub(super) fn scan(cwd: &Path, now: SystemTime) -> Vec<ForeignSessionSummary> {
    let Some(config_dir) = std::env::var_os("CLAUDE_CONFIG_DIR")
        .map(PathBuf::from)
        .or_else(|| xai_dirs::home_dir().map(|home| home.join(".claude")))
    else {
        return Vec::new();
    };
    scan_in_config_dir(&config_dir, cwd, now)
}
```

(Cùng file và commit như trên)

Kỷ luật đọc là phần đáng học nhất. Các hằng số trong cùng file đặt trần cứng: tối đa 50 session mỗi tool (`MAX_SESSIONS_PER_TOOL`), chỉ xét session trong 30 ngày (`MAX_SESSION_AGE`), title cắt ở 200 ký tự. Đọc chỉ dừng ở metadata (tên, đường dẫn dự án, thời gian cập nhật, branch) — module ghi chú rõ các SQLite store của tool khác chỉ được mở ở chế độ read-only, và đường dẫn phải qua kiểm tra `ApprovedRoot` trước khi chạm.

Động cơ dễ đoán: nhận diện harness cũ trên máy để người chuyển sang grok không phải bắt đầu từ con số không.

## Cổng mở ra ngoài: ACP, MCP, hooks

Gắn chặt model không có nghĩa đóng kín biên giới. grok-build mở ba loại cổng, mỗi loại một hướng. Cổng thứ nhất là ACP — Agent Client Protocol: README giới thiệu grok chạy được "embedded in editors via the Agent Client Protocol (ACP)" (README grok-build, [github.com/xai-org/grok-build](https://github.com/xai-org/grok-build)). Trong code, crate `xai-acp-lib` chứa gateway hai chiều giữa grok và client ngoài, trực tiếp dùng crate `agent_client_protocol`:

```rust
use agent_client_protocol as acp;
```

(Trích từ [`src/gateway.rs` của crate `xai-acp-lib`, cùng commit 72a6125](https://github.com/xai-org/grok-build/blob/72a61251fcffb464bcc687aeb5a998e5a98ec0c9/crates/codegen/xai-acp-lib/src/gateway.rs))

Cổng thứ hai là MCP: crate `xai-grok-mcp` (client MCP với elicitation, credentials, liveness). Cổng thứ ba là hệ hooks và plugin: crate `xai-grok-hooks` có dispatcher, matcher, runner cho cả lệnh shell lẫn HTTP, kèm cơ chế trust; phía plugin thì có marketplace, cài qua git, và registry tin cậy riêng. Cần nói thẳng: ACP và MCP là cổng ra duy nhất theo hướng model-agnostic; README không cho thấy cơ chế cấu hình provider nào khác ngoài grok.

Từ vựng cũng đáng để ý: hooks, marketplace, sandbox, subagent — các harness lớn đang hội tụ về cùng một tập khái niệm, học một lần dùng ở nhiều nơi.

## Wakii học được gì

- **WATCH** — pattern nhà model tự viết harness: Wakii định vị là agentic IDE với team 9 agent hoạt động độc lập với model phía dưới (xem agents and kit), trong khi grok-build cùng Claude Code và Gemini CLI cho thấy nhà model đang biến harness thành sản phẩm first-class gắn với model mình. Nếu trend tiếp tục, câu so sánh chuyển từ "harness nào tốt" sang "harness gắn model nào hợp với bạn" — ảnh hưởng trực tiếp định vị của một IDE model-agnostic. Điều kiện đổi grade: khi ACP trưởng thành đủ để Wakii nhúng agent nhà khác như client, hoặc một nhà model lớn thứ tư xác nhận pattern — khi đó thành quyết định epic, không quyết trong bài.
- **WATCH** — kỷ luật bounded metadata-only của foreign-sessions (cap 50/tool, 30 ngày, `ApprovedRoot` trước khi đọc): nguyên tắc dùng được nếu Wakii sau này cần đọc state của harness bên ngoài. Watchdog của Wakii hiện đọc recent commits, terminal output và Linear state của story mình — bài toán khác bản chất, nhưng tinh thần "có trần, metadata-first" là chung.
- **N/A** — mô hình mirror một chiều không nhận contribution: phù hợp nhà model giữ monorepo nội bộ; Wakii phát triển trên repo public (wakii-dev/wakii, MIT) với quy trình story có review riêng — không cùng ràng buộc.

Đội 9 agent, bộ skills và 24 story CLI của Wakii được mô tả đầy đủ trong trang [agents and kit](/vi/docs/agents-and-kit/). Muốn đặt grok-build vào bức tranh lớn hơn — 50 project quanh agentic coding tính đến tháng 9/2026 — đọc [bản đồ landscape](/vi/blog/agentic-landscape-50-projects/). Wakii là agentic IDE với sẵn một team agent có kỷ luật — tải về, để team chạy, bạn giữ quyền quyết.
