# coder/code-server — research digest (batch-3, matrix #37)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: coder/code-server
- facet: editors
- stars @ 2026-09-08: 79234
- license (GitHub API 2026-09-08): MIT
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## README notes (probe 2026-09-08)

- Tagline (README): "Run VS Code on any machine anywhere and access it in the browser." (12 từ — quote-safe)
- Highlights (README): code on any device với dev environment nhất quán; dùng cloud server để tăng tốc test/compile/download; giữ pin laptop — mọi việc nặng chạy trên server.
- Requirements (README): "Linux machine with WebSockets enabled, 1 GB RAM, and 2 vCPUs" — nhẹ vì browser chỉ là terminal hiển thị.
- Install: script `code-server.dev/install.sh`, dry-run được.
- Metadata gh api 2026-09-08: 79,234★ · 6,844 forks · MIT · TypeScript · pushed 2026-09-06 · không archived · homepage coder.com.

## Architecture (đọc code @ HEAD `62284ed549bc41236d62c789a071120aea206a78`, probe 2026-09-08)

- **Vendored VS Code**: `.gitmodules` khai submodule `lib/vscode` trỏ `https://github.com/microsoft/vscode` — VS Code được vendor nguyên khối, không fork repo riêng.
- **Lớp server TypeScript mỏng** (`src/node/`): `app.ts` (HTTP server + express router), `wsRouter.ts` (WebSocket upgrade), `proxy.ts`, `heart.ts` (liveness), `vscodeSocket.ts` + `EditorSessionManager` (session). Interface `App` @ `src/node/app.ts`: `router: Express` /** Handles regular HTTP requests. */ + `wsRouter: Express` /** Handles websocket requests. */ + `editorSessionManagerServer`.
- **Lớp patch có tên** (`patches/*.diff`, probe 09-08 đếm ≥15 file): `app-name.diff`, `base-path.diff`, `clipboard.diff`, `copilot.diff`, `csp-hashes.diff`, `disable-builtin-ext-update.diff`, `keepalive.diff`, `logout.diff`… — mỗi patch một concern, tên file tự tả.
- **Heartbeat file** (`src/node/heart.ts`): class `Heart`, comment "Provides a heartbeat using a local file to indicate activity."; `heartbeatInterval = 60000`ms; state machine `alive | expired | unknown`; consumer ngoài đọc file heartbeat để biết session còn sống.
- Kiến trúc logic: browser (UI tĩnh + WebSocket client) ↔ HTTP(HTTPS) serve shell VS Code ↔ WebSocket mang protocol VS Code ↔ server chạy extension + FS + terminal thật nơi machine ở.

## Releases (gh api releases?per_page=5, probe 2026-09-08)

- v4.135.0 — 2026-08-27 · v4.134.0 — 2026-08-24 · v4.133.0 — 2026-08-17 · v4.132.0 — 2026-08-10 · v4.131.0 — 2026-07-30
- Cadence: ~mỗi 1 tuần 1 minor (khoảng cách 3-11 ngày trong 5 release gần nhất). Repo pushed 2026-09-06.

## Wakii grading (style-guide §8)

- **ADOPT — kỷ luật patch-fork**: một concern một `.diff` có tên (patches/) giữ delta fork nhỏ, sync upstream rẻ. Wakii là fork của Orca — pattern này áp được cho việc quản lý delta fork (inventory named deltas, re-validate từng cái khi upstream sync). Proposal: duyệt danh sách delta fork có tên theo concern trong repo wakii, dùng làm checklist mỗi lần sync.
- **DIRECTION — editor chạy cạnh worktree**: code-server tách editor khỏi máy local; Wakii đã có SSH worktrees + story view mobile — bước tự nhiên là IDE có thể trỏ vào host nơi worktree sống (cần decision lớn về surface, chưa phải việc ngay).
- **WATCH — heartbeat file liveness**: marker file 60s rẻ hơn poll nhiều nguồn; watchdog Wakii hiện 3-layer (commits/terminal/Linear). Đổi sang ADOPT khi session agent chạy trên remote host mà terminal-poll đắt.
