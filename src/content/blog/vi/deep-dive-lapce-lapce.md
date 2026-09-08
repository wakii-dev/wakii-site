---
title: "Lapce: editor Rust hướng hiệu năng"
description: "Kiến trúc của Lapce qua code thật: buffer dạng rope có revision, UI tách tiến trình qua RPC, plugin chạy trong sandbox WASI — cách một editor giữ nhanh khi tính năng phình to."
pubDate: "2026-10-22"
category: "tech"
tags: ["architecture", "features", "oss"]
draft: false
---

Editor viết bằng Rust nào cũng hứa tốc độ; Lapce ghi hẳn "Lightning-fast And Powerful Code Editor" vào README. Slogan thì ai cũng có — cái đáng học nằm ở chuỗi quyết định kiến trúc đằng sau: buffer dạng rope kèm revision, UI tách tiến trình qua RPC, plugin chạy trong sandbox WASI. Với 38.834 sao, license Apache-2.0 và lần push mới nhất cùng ngày probe (theo GitHub API ngày 2026-09-08), dự án vẫn pre-1.0 nhưng kiến trúc đã trưởng thành hơn số phiên bản của nó.

## TL;DR

- Buffer của Lapce là rope kế thừa Rope Science của xi-editor, kèm `rev: u64` — sửa đổi là delta có số hiệu, không phải thay chuỗi.
- Bốn crate: `lapce-app` (UI) — `lapce-rpc` (giao thức) — `lapce-proxy` (fs, terminal, plugin, chạy tiến trình riêng) — `lapce-core`.
- Plugin không vào process: chạy như module WASI trên wasmtime, quyền năng cấp tường minh qua `WasiCtxBuilder`.
- Remote development là tính năng built-in; release stable khoảng hai lần một năm, nightly build liên tục (theo GitHub API ngày 2026-09-08).
- Bài học cho Wakii: tách dữ liệu với quy trình khi xử lý sửa đổi đồng thời; sandbox capability cho phần mở rộng.

## Buffer là rope, revision là hợp đồng

Phần lớn editor giữ văn bản như một chuỗi lớn: sửa một ký tự cũng đụng vùng nhớ khổng lồ, và hai nguồn sửa cùng lúc là cơn ác mộng. Lapce đặt rope ở trung tâm — README mô tả dự án được thiết kế theo "Rope Science" của xi-editor ([lapce/lapce README](https://github.com/lapce/lapce#readme), truy cập 2026-09-08), tức là các bài toán dữ liệu văn bản mà xi-editor đã nghiên cứu công khai.

Trong code, điều đó nhìn thấy ngay ở `lapce-proxy/src/buffer.rs`:

```rust
pub struct Buffer {
    pub language_id: &'static str,
    pub read_only: bool,
    pub id: BufferId,
    pub rope: Rope,
    pub path: PathBuf,
    pub rev: u64,
    pub mod_time: Option<SystemTime>,
}
```

(nguồn: [lapce-proxy/src/buffer.rs @ commit b604d57](https://github.com/lapce/lapce/blob/b604d57de4a820006d335a3be0d7583eb8fab558/lapce-proxy/src/buffer.rs), probe 2026-09-08)

Kiểu `Rope` đến từ `lapce_xi_rope` — rope của xi-editor được fork thẳng vào Lapce; cùng file còn import `RopeDelta`. Nghĩa là thay đổi truyền đi dưới dạng delta: vùng nào thay, nội dung gì — không ai chép lại cả buffer. Còn `rev: u64` là hợp đồng đồng thời: mỗi trạng thái buffer có một số hiệu; UI, language server, plugin khi nói chuyện đều kèm rev theo. Một thay đổi mang rev lạc hậu bị phát hiện ngay, thay vì âm thầm ghi đè người khác. Hiệu ứng phụ đáng giá: language server nhận cập nhật từng phần, highlighting không chạy lại từ đầu, và xung đột sửa đổi có tín hiệu tường minh.

## UI tách tiến trình: lapce-rpc là biên giới

Workspace chia đúng bốn crate, mỗi crate một ranh giới rõ:

| crate | vai trò |
|---|---|
| `lapce-app` | giao diện, dựng trên Floem |
| `lapce-core` | logic editor thuần |
| `lapce-proxy` | fs, terminal, plugin — chạy thành tiến trình riêng (`src/bin/`) |
| `lapce-rpc` | giao thức nối hai bên |

(nguồn: [root directory @ commit b604d57](https://github.com/lapce/lapce/blob/b604d57de4a820006d335a3be0d7583eb8fab558/), probe 2026-09-08)

```
lapce-app (UI, Floem)
   │   lapce-rpc — request/notification, kèm rev
   ▼
lapce-proxy (tiến trình riêng)
   ├── buffer.rs    rope + rev
   ├── terminal.rs
   ├── watcher.rs   theo dõi filesystem
   └── plugin/      host WASI
```

Biên giới RPC buộc mọi thay đổi đi qua delta có rev thay vì chia sẻ trạng thái ngầm — đúng cơ chế kể trên, nhưng nâng lên cấp tiến trình. Hai tính chất kỹ thuật rơi ra theo: UI không đứng chờ hệ thống file hay terminal, và một plugin lỗi nằm ở phía proxy thay vì kéo sập cửa sổ soạn thảo. Với một editor quảng cáo "lightning-fast", đây là phần làm cho lời quảng cáo sống được: tốc độ đến từ việc không bao giờ chặn luồng giao diện.

## Plugin chạy trong WASI, không trong process của bạn

Plugin Lapce viết bằng ngôn ngữ compile ra WASI — README kể tên C, Rust, AssemblyScript. Host nằm ở `lapce-proxy/src/plugin/`: `catalog.rs` khám phá plugin, `lsp.rs` và `dap.rs` bridge language server cùng debug adapter, và `wasi.rs` là runtime. Điểm đáng đọc nhất là imports của `wasi.rs`:

```rust
use wasi_experimental_http_wasmtime::{HttpCtx, HttpState};
use wasmtime_wasi::WasiCtxBuilder;
```

(nguồn: [lapce-proxy/src/plugin/wasi.rs @ commit b604d57](https://github.com/lapce/lapce/blob/b604d57de4a820006d335a3be0d7583eb8fab558/lapce-proxy/src/plugin/wasi.rs), probe 2026-09-08)

`WasiCtxBuilder` là chỗ quyền năng được cấp: plugin không mặc định thấy filesystem hay mạng — host dựng context và cấp từng capability một, theo đúng mẫu capability-based của WASI. Cả HTTP ra ngoài cũng đi qua module experimental của wasmtime thay vì socket thô. Ranh giới tin cậy vì thế nằm ở một chỗ rõ ràng: "code của dự án" và "code người khác cài thêm" cách nhau bởi một sandbox, không phải bởi danh tiếng của tác giả plugin.

## Remote built-in và nhịp pre-1.0

README liệt kê built-in remote development lấy cảm hứng từ VSCode Remote — trải nghiệm "local" trên máy ở xa, kèm Lapdev là dịch vụ quản lý dev environment của chính đội Lapce. Triết lý trùng với code-server (editor chạy nơi code sống) nhưng nằm sẵn trong sản phẩm thay vì là một bản phân phối riêng.

Nhịp phát hành (theo GitHub API ngày 2026-09-08): nightly build mới ngay ngày 08-09-2026; stable gần nhất v0.4.6 ngày 21-01-2026, trước đó v0.4.5 ngày 05-09-2025, v0.4.4 ngày 30-08-2025, v0.4.3 ngày 26-06-2025. Stable khoảng hai lần một năm, nightly gánh kênh "mới" mỗi ngày — sự phân vai giữa chắc và mới được khai báo rõ thay vì để người dùng đoán.

Sự đồng thời mà Lapce giải ở tầng dữ liệu (rope delta + rev), Wakii giải ở tầng quy trình: mỗi agent một worktree riêng, hợp nhất qua gate — quy trình đó nằm trong [docs story-workflow](/vi/docs/story-workflow/), còn chi tiết cô lập từng nhánh được kể trong bài [worktree song song để cô lập thay đổi](/vi/blog/parallel-worktrees-isolation/).

## Wakii học được gì

- **WATCH** — rope + revision làm hợp đồng sửa đổi: Wakii hiện xử lý đồng thời bằng cô lập quy trình (worktree riêng mỗi agent, merge qua gate). Chuyển sang DIRECTION hoặc ADOPT khi xuất hiện nhu cầu nhiều agent cùng chỉnh một surface/buffer thật — ví dụ co-edit chung một file — vì lúc đó cần cấu trúc dữ liệu kiểu delta có rev thay vì chỉ cô lập nhánh.
- **DIRECTION** — sandbox capability kiểu WASI cho phần mở rộng: Wakii hiện mở rộng bằng skills (nội dung, không code bên thứ ba) nên đã né được bài toán này; nhưng nếu kit sau này cần chạy code của bên thứ ba, mô hình quyền cấp tường minh qua capability — thay vì tin theo danh tiếng — là hình mẫu đáng theo.
- **N/A** — wgpu GPU rendering và UI tự viết (Floem): Wakii là Electron (fork của Orca), renderer là Chromium — đổi renderer nằm ngoài khả năng kiểm soát thực tế và chi phí fork không bù nổi lợi ích.

Muốn xem phía quy trình của bài toán tương tự — nhiều agent cùng làm một repo mà không dẫm chân nhau — đọc tiếp docs story-workflow ở link trên rồi thử một story thật với Wakii.
