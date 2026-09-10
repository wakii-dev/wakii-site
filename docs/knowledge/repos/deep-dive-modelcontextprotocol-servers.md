# modelcontextprotocol/servers — research digest (batch-3, matrix #9)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: modelcontextprotocol/servers
- facet: mcp
- stars @ 2026-09-08: 90157 (probe SF-2 khi viết bài; skeleton SF-1 ghi 90153 cùng ngày — drift trong ngày, dùng số probe của SF-2 kèm ngày)
- license (GitHub API 2026-09-08): NOASSERTION († — gọi "công khai trên GitHub", KHÔNG "open-source"). Note thật: tệp LICENSE trong repo @ d73f99e ghi rõ đang chuyển đổi MIT → Apache-2.0 (docs CC-BY-4.0) — GitHub trả NOASSERTION vì licensing pha trộn trong transition.
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh` + `gh api` riêng của SF-2, exit 0)
- forks @ 2026-09-08: 11592 · created 2024-11-19 · pushed 2026-09-03

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## README notes

- Repo = "collection of reference implementations" cho MCP + refs tới community servers. Phạm vi NARROW rõ: "housing just the small number of reference servers maintained by the MCP steering group"; người tìm danh sách server được hướng sang MCP Registry (registry.modelcontextprotocol.io).
- 7 reference servers: Everything (test server: prompts/resources/tools), Fetch, Filesystem, Git, Memory (knowledge graph), Sequential Thinking, Time.
- 13 server ARCHIVED → repo `servers-archived`: AWS KB Retrieval, Brave Search (→ server chính thức của Brave), EverArt, GitHub, GitLab, Google Drive, Google Maps, PostgreSQL, Puppeteer, Redis, Sentry, Slack (→ Zencoder), SQLite. Mỗi mục archived ghi rõ người thay — deprecation có địa chỉ.
- Warning block: server "meant to serve as educational examples... not as production-ready solutions".
- Điểm khác cốt lõi vs awesome-list (#8): đây là mẫu chuẩn do bên phát hành giao thức chọn — cái được chọn làm reference nói lên giao thức nghĩ gì quan trọng; archival/lifecycle được vận hành công khai.
- Clone @ d73f99e (HEAD 2026-09-02/03): commit `d73f99efbfd40c3aa1b61e88728b3d49fb52608f` "fix(memory): serialize graph mutations to prevent concurrent write race (#4555)".

## Architecture

- Đa ngôn ngữ có chủ ý: 4 TypeScript (everything, filesystem, memory, sequentialthinking — chạy `npx`) + 3 Python (fetch, git, time — chạy `uvx`/`pip`). README liệt kê 10 SDK chính thức (C#, Go, Java, Kotlin, PHP, Python, Ruby, Rust, Swift, TypeScript).
- `src/filesystem/path-validation.ts` (86 dòng): chặn null-byte → normalize → resolve → bắt buộc absolute → so allowlist; có `__tests__`. filesystem đăng ký 14 tool (`registerTool(` đếm trong index.ts @ d73f99e).
- `src/memory/index.ts` (745 dòng): 9 tool; fix #4555 @ d73f99e thêm `mutationQueue` + `withLock` — serialize mọi read-modify-write qua 1 Promise-queue, queue tự phục hồi sau failure (comment cite #1819: "whichever write lands last silently overwrites the other's changes"). Đợt 2026-09-02→03: 11+ commit, đa số `fix(memory)` (skip dupes, validate entries khi load, constrain query length, reject dangling relations...).
- `src/sequentialthinking`: đúng 1 tool (`registerTool(` ×1) — cả server là một tool tư duy.
- `src/everything`: thư mục tools/ ~16 file case (elicitation, logging, long-running op, structured content, tiny-image...).

## Releases

- CalVer (bảng từ `gh api releases?per_page=10`, ngày 2026-09-08): 2026.8.31 · 2026.8.18 · 2026.7.10 · 2026.7.4 · 2026.1.26 · 2026.1.14 · 2025.12.18 · 2025.11.25 · 2025.9.25 · 2025.8.4.
- GAP: 2026-01-26 → 2026-07-04 (~5 tháng không release); sau đó 4 release / 2 tháng. Lý do gap không có trong release notes — KHÔNG suy đoán trong bài.
- Commit: 30 commit trong 30 ngày (API `commits?since=2026-08-09`, per_page 100 — trả đúng 30, dưới cap nên số chính xác).
- RELEASING.md: publish từ CI bằng OIDC trusted publishing, không registry token.

## Wakii grading (đã viết trong bài, tóm tắt)

- ADOPT — hàng đợi mutation cho state dùng chung (fix #4555): Wakii có cùng class state (gate state, tiến độ SF, memory story, các SF song song; nguyên tắc 8 "defensive by design" đã ghi nhận shared-notes-file conflict).
- DIRECTION — deprecation có địa chỉ: 13/13 archived entry ghi người thay; áp cho lifecycle catalog skills khi lớn hơn 20.
- WATCH — MCP làm integration surface: docs Wakii chưa có client MCP; flip DIRECTION khi roadmap có MCP client; bộ 7 reference = bộ test tương thích đầu tiên.
- N/A — showcase đa SDK: công việc của protocol steward, Wakii single-stack không có người tiêu thụ.
