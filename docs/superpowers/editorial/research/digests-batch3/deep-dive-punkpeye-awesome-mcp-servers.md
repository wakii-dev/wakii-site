# punkpeye/awesome-mcp-servers — research digest (batch-3, matrix #8)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: punkpeye/awesome-mcp-servers
- facet: mcp
- stars @ 2026-09-08: 94608 (probe SF-1) → **94614 (re-probe 2026-09-08, bài dùng 94.614)**
- license (GitHub API 2026-09-08): **MIT** → bài ĐƯỢC dùng "open-source" (không thuộc 6 slug †)
- forks: 15881 · created: 2024-11-30 · pushed: 2026-09-07T23:11:49Z (GitHub API 2026-09-08)
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh` + `gh api` trực tiếp, exit 0)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## README notes

- AWESOME LIST (không phải codebase): danh bạ cộng đồng server MCP. Cho ai: người
  dựng agent cần tìm server theo nhu cầu. Khác biệt cốt lõi: quy mô (94.6k★ — lớn
  nhất nhóm MCP trong landscape 50) + tự mô tả bằng hệ icon 4 nhóm + badge điểm
  tự động glama.ai gắn trên từng mục.
- Quote sạch (21 từ, không emoji, dùng trong bài):
  "MCP is an open protocol that enables AI models to securely interact with local
  and remote resources through standardized server implementations."
  — [README @ a62cced](https://github.com/punkpeye/awesome-mcp-servers/blob/a62cced/README.md)

## Architecture (cấu trúc list, không phải code)

- HEAD clone ngày 2026-09-08: **a62cced** (commit 2026-09-07T17:11:49-06:00).
- README 1.615.864 byte (~1,6 MB). Cấu trúc: intro (What is MCP? · Clients ·
  Tutorials · Community · Legend) → `## Server Implementations` (59 heading `###`
  = 58 category duy nhất — E-Commerce LẶP 2 LẦN: block 1 có 33 mục, block 2 có 1
  mục) → `## Frameworks` → `## Tips and Tricks` → `## Star History`. Tổng 60
  heading `###` cả file (59 + 1 heading Tips).
- Mục entry: `- [Tên](link) [glama badge] icons - mô tả 1 câu`. Đếm **3.862 mục**
  (`grep -c '^- \['`, ngày 2026-09-08, README @ a62cced) — mục đầu ở dòng 136
  (không lẫn mục ngoài Server Implementations).
- Top 10 category (đếm per-category, awk theo heading, 2026-09-08): Developer
  Tools 483 · Finance & Fintech 431 · Knowledge & Memory 317 · Search & Data
  Extraction 229 · Security 215 · Other Tools 202 · Communication 149 · Databases
  132 · Aggregators 126 · Cloud Platforms 121 (top 10 = 2.405 mục = 62%).
- Icon trên dòng mục (2026-09-08): 📇 TS ×2129 (55%) · 🐍 Python ×1272 (33%) ·
  🏎️ Go ×185 · 🦀 Rust ×115 · 🎖️ official ×332. Badge glama.ai ×2493 (65%).
- Cơ chế vận hành đáng học: legend 4 trục (official · ngôn ngữ · scope ☁️🏠📟 ·
  OS 🍎🪟🐧) + badge điểm tự động từ dịch vụ ngoài (glama.ai) nhúng SVG.

## Releases → KHÔNG có — thay bằng nhịp cập nhật list

- Repo không dùng GitHub Releases (awesome list). Nhịp cập nhật từ commit history:
- **1.247 commit trong 30 ngày** (2026-08-08 → 2026-09-08, `gh api --paginate
  commits?since=...`, đếm 2026-09-08).
- 30 commit gần nhất đều trong 21:43–23:11 UTC ngày 2026-09-07 (~88 phút) —
  merge theo đợt, dáng vẻ tự động hoá.
- Tốc độ sinh mục: README @ 165f838 (2026-08-08T21:10:20Z) = **3.371 mục / 58
  heading `###`** → README @ a62cced (2026-09-07) = 3.862 mục / 60 heading =
  **+491 mục (+14,6%) / 30 ngày** (~16 mục/ngày). (README Aug lấy bằng
  `gh api -H "Accept: application/vnd.github.raw" contents/README.md?ref=...`
  — contents API JSON path trả rỗng với file >1MB, gotcha ghi improvements-log.)

## Wakii grading (đã viết trong bài, tóm tắt)

- **ADOPT** — quy ước legend 4-trục-1-bảng: áp cho catalog skills Wakii (13
  public tại thời điểm viết) — nhãn scope đọc/ghi vs chạy lệnh + legend đầu trang.
- **DIRECTION** — badge điểm tự động dạng tín hiệu chất lượng cho catalog
  skills/agents; điều kiện: thiết kế tín hiệu trung thực trước khi hiển thị.
- **WATCH** — tốc độ +16 mục/ngày của hệ sinh thái MCP; đổi grade khi Wakii có
  surface kết nối MCP bên ngoài trên lộ trình.
- **N/A** — nhịp merge-bot 1.247 commit/30 ngày không áp cho repo product
  (release Wakii đi qua human gates).
