# hangwin/mcp-chrome — research digest (batch-3, matrix #21)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: hangwin/mcp-chrome
- facet: mcp
- stars @ 2026-09-08: 12393
- license (GitHub API 2026-09-08): MIT
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`)
- pushed @ 2026-09-08: 2026-01-06 · archived: false
- HEAD @ probe: `f48e71751e00bc09725c7e173423cff4f2ccd12a`

## README notes

- Repo làm gì: Chrome extension đóng vai MCP server — expose Chrome đang mở của
  user cho AI client qua MCP (Streamable HTTP `127.0.0.1:12306/mcp`, hoặc stdio
  qua `mcp-server-stdio.js`). README: "Chrome MCP Server directly uses your
  daily Chrome browser, leveraging existing user habits, configurations, and
  login states". Model-agnostic (client AI bất kỳ). README quảng bá 20+ tool
  (screenshot, interaction, keyboard, network capture, history, bookmark,
  vector search…), Node >= 20.
- Cho ai: người muốn agent automation trên browser THẬT của mình — tái dùng
  đăng nhập/cookie/profile thay vì browser headless riêng (so sánh thẳng với
  Playwright-based MCP trong README).
- Khác biệt cốt lõi: "browser của user" vs "browser của agent" — session reuse
  là giá trị cốt; cái giá là agent hành động với tư cách user (cookie/phiên),
  ranh giới tin cậy đổi hẳn.
- Flag nhỏ: README còn ghi "The project is still in its early stages and is
  under intensive development" — KHÔNG còn đúng tại ngày probe (xem Releases).

## Architecture

Ba chặng (đọc từ cây source @ `f48e717`):

1. **MCP client → native server**: Streamable HTTP tới `127.0.0.1:12306/mcp`
   (khuyến nghị README) hoặc stdio. Native server = gói npm toàn cục
   `mcp-chrome-bridge`; tool registration ở
   `app/native-server/src/mcp/register-tools.ts` (ListTools = TOOL_SCHEMAS tĩnh
   + flow tools động; CallTool → gửi qua native messaging).
2. **Native server → extension**: Chrome native messaging; phía extension ở
   `app/chrome-extension/entrypoints/background/native-host.ts` — auto-connect
   + reconnect: base 500ms, trần 60s, 8 lần thử nhanh (lũy thừa + jitter), sau
   đó cooldown 5 phút (`RECONNECT_*` constants); service worker MV3 giữ sống
   bằng keepalive (`keepalive-manager`, comment "keep SW alive").
3. **Extension → tab thật**: `tools/browser/` gồm 30 module file (bookmark,
   computer, console, dialog, download, element-picker, gif-recorder, history,
   inject-script, interaction, javascript, keyboard, network-capture*, network-
   request, performance, read-page, screenshot, userscript, vector-search,
   web-fetcher, window…); `tools/index.ts` tra Map tool → `tool.execute(args)`.
   `computer.ts` gom action chuột/bàn phím kiểu computer-use (left_click, type,
   key…) kèm coordinate scaling + CDP session + auto-capture frame mỗi action
   (gif-recorder) — evidence-of-action pattern.

Pattern đáng học nhất — **flow → tool động** (`register-tools.ts`):
`const name = \`flow.${item.slug}\`` — server hỏi extension danh sách flow đã
ghi, dựng inputSchema tự động từ biến flow (label/type/enum/default/required)
+ 4 run option (tabTarget, refresh, captureNetwork, returnLogs). "Bản ghi thao
thành API": phần cứng (selector, thứ tự) đóng băng trong flow, phần mềm (giá
trị) mở thành schema.

## Releases

Probe `gh api "repos/hangwin/mcp-chrome/releases?per_page=6"` ngày 2026-09-08,
exit 0:

| Tag | published_at (UTC) |
|---|---|
| v1.0.0 | 2025-12-29 |
| v0.0.6 | 2025-07-09 |
| v0.0.5 | 2025-06-23 |
| v0.0.4 | 2025-06-22 |
| v0.0.3 | 2025-06-16 |
| v0.0.2 | 2025-06-11 |

Cadence: 5 release trong <1 tháng (06-2025) → gap ~5.5 tháng → v1.0.0
2025-12-29 → commit cuối nhánh chính = merge PR #272 (element-annotations)
2026-01-06. **~8 tháng không commit** tính tới ngày probe 2026-09-08. README
vẫn claim "under intensive development" — stale so với thực tế. Đọc editorial:
12.393 sao xác nhận nhu cầu "agent dùng browser thật của user"; maintenance
dừng — pattern đáng học, phụ thuộc sống thì rủi (cần kế hoạch fork). Lý do dừng
chưa có thông tin công khai hai chiều — bài viết trung thực ghi "chưa có dấu
hiệu nào hai chiều", KHÔNG suy diễn.

## Wakii grading

- **DIRECTION** — "browser của user" thành chế độ tùy chọn của browser nhúng
  Wakii: B0 browser test hiện chạy trên browser của agent (embedded browser,
  docs superpowers-panel + bài feature-design-mode); luồng cần đăng nhập thì
  chế độ tái dùng phiên user (tường minh + consent từng lần) mở lớp bài toán
  browser sạch không chạm tới. Chưa áp ngay: agent hành động với cookie user →
  cần thiết kế consent + scope trước.
- **WATCH** — pattern flow→tool động: hợp với ý tưởng "probe ghi 1 lần,
  verifier chạy lại nhiều lần" nhưng Wakii chưa có surface record-replay;
  điều kiện nâng: browser nhúng có cơ chế ghi kịch bản.
- **WATCH** — maintenance stalled ~8 tháng (probe 2026-09-08): pattern đọc
  được, phụ thuộc sống rủi; điều kiện đổi grade: upstream chạy lại hoặc fork
  được cộng đồng nhận.
- **N/A** — không grade. Không ADOPT: không có pattern mới áp được NGAY vào
  surface Wakii hiện có (computer-use đã có verification-evidence tốt hơn —
  stamp unverified + reason; see feature-computer-use-native).

→ Không viết adopt-draft (không grade ADOPT).
