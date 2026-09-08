# microsoft/mcp-for-beginners — research digest (batch-3, matrix #20)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: microsoft/mcp-for-beginners
- facet: mcp
- stars @ 2026-09-08: 17170 (probe riêng của SF-3 lúc viết bài; skeleton SF-1 ghi 17169 — stars drift trong cùng ngày, lấy số probe lần sau cùng)
- license (GitHub API 2026-09-08): MIT
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh` + `gh api` riêng)
- pushed @ 2026-09-08: 2026-09-03 · archived: false · created: 2025-04-04
- HEAD sha @ 2026-09-08: `422055c27bf1e0fc3b932e87c437a2bfa0cd17ae` (commit 2026-08-26)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

### README notes (probe 2026-09-08)

- Repo học liệu chính thống: "This open-source curriculum introduces the
  fundamentals of Model Context Protocol (MCP) through real-world,
  cross-language examples in .NET, Java, TypeScript, JavaScript, Rust and
  Python" (mô tả repo, GitHub API 2026-09-08). License MIT → gọi open-source
  được (slug KHÔNG nằm trong 6 slug † scoped FORBIDDEN).
- Cho developer mới học MCP; dạy bằng analogy đời thường ("Think of MCP like
  a USB-C port for AI applications" — 03-GettingStarted/01-first-server/README.md).
- Baseline spec: "This curriculum is aligned with MCP Specification
  2025-11-25 (the latest stable release)" (README @ `422055c`).
- Điểm khác biệt cốt lõi: curriculum có CẤU TRÚC sư phạm thật — 4 phase, bài
  học theo mẫu trường học (TL;DR → learning objectives → code chạy được),
  mỗi khái niệm có sample song song 6 ngôn ngữ, dịch tự động 55 locale qua
  GitHub Action (co-op translator).

### Architecture (= cấu trúc curriculum, probe 2026-09-08)

- 13 module đánh số 00-12 theo 4 phase của README: Foundation (0-2) ·
  Building (3, 15 bài) · Growing (4-5, 17 chủ đề nâng cao) · Mastery (6-11,
  trong đó module 11 = 13 hands-on labs PostgreSQL) · tooling (12).
- **Bảo mật là module 02 — dạy TRƯỚC 03-GettingStarted** (bài server đầu
  tiên). Tín hiệu: security không phải phụ lục của protocol doanh nghiệp.
- 45 file manifest project trên cây HEAD: package.json ×16, .csproj ×10,
  pom.xml ×8, Cargo.toml ×6, requirements.txt ×3, pyproject.toml ×2 —
  6 ngôn ngữ (C#, Java, JS, TS, Python, Rust).
- Bài học chuẩn mẫu: 03-GettingStarted/01-first-server/README.md = 1.376
  dòng; code sample dùng `@modelcontextprotocol/sdk` chạy thật.
- Curriculum dạy cả FUTURE của spec: bài riêng
  `01-CoreConcepts/mcp-2026-07-28-release-candidate.md` (202 dòng) — RC
  2026-07-28 stateless ở transport, extensions first-class, deprecate
  Roots/Sampling/Logging, 6 SEP authorization (OAuth 2.0/OIDC); quote:
  "The headline change: MCP becomes stateless at the protocol layer."

### Releases / updates cadence (probe 2026-09-08)

- **Không có releases, không có tags** (API trả mảng rỗng) — repo học liệu
  không đánh phiên bản. Thay thế bằng cadence thực qua changelog + commits.
- changelog.md: 732 dòng, 17 entry có ngày, 2025-04-15 → 2026-07-29.
- Entry 2026-07-02: thêm bài dạy RC 2026-07-28 + cập nhật ~11 bài cũ bằng
  callout forward-looking.
- Entry 2026-07-29 (1 ngày sau ngày spec dự kiến ship): mô tả bài companion
  mới "aligned with the final `2026-07-28` specification".
- Commit gần nhất trên main: 2026-08-26; repo nhận push tới 2026-09-03.
  Commit stream hoạt động: dependabot PRs, docs updates, nhánh
  `copilot/mcp-spec-conformance-fixes` (chính repo dùng Copilot agent trong
  workflow của mình — màu phụ, đã bỏ khỏi bài).

### Wakii grading (style-guide §8)

- **ADOPT** — kỷ luật docs khi cơ chế thay đổi: baseline ổn định + một trang
  "what's changing" riêng + callout có ngày tại chỗ cũ + changelog ghi ngày.
  Áp vào 5 trang docs công khai của Wakii (đổi theo release, sửa tại chỗ
  không vết). Rủi ro: changelog bỏ bê thì gây nhiễu.
- **DIRECTION** — anatomy bài học TL;DR → objectives → code chạy được trong
  phút đầu, cho category tutorial của blog Wakii (đã có TL;DR, chưa có
  khối objectives chuẩn).
- **WATCH** — dịch tự động 55 locale qua GitHub Action; Wakii dịch tay 2
  locale, chất lượng > độ phủ; đảo grade khi docs mở thêm ngôn ngữ.
- **N/A** — dạy fundamentals MCP: docs Wakii không nhắc MCP (grep faq +
  agents-and-kit = 0 match, 2026-09-08); không biến docs thành lớp học
  giao thức.

### File bài

- `src/content/blog/vi/deep-dive-microsoft-mcp-for-beginners.md` (1372 từ @ lint D1)
- `src/content/blog/en/deep-dive-microsoft-mcp-for-beginners.md` (1333 từ)
- ADOPT draft: `docs/superpowers/editorial/research/adopt-drafts/adopt-draft-microsoft-mcp-for-beginners.md`
- lint: `check-blog-content.mjs` PASS toàn manifest 144 files (2026-09-08)
