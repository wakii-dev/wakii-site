# modelcontextprotocol/registry — research digest (batch-3, matrix #22)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: modelcontextprotocol/registry
- facet: mcp
- stars @ 2026-09-08: 7227
- license (GitHub API 2026-09-08): NOASSERTION († — gọi "công khai trên GitHub", KHÔNG "open-source")
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`)

## Research notes (điền 2026-09-08 — task T10, SF-3)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
  - Registry = danh bạ trung tâm cho server MCP; README tự gọi "app store for
    MCP servers" ("The MCP registry provides MCP clients with a list of MCP
    servers, like an app store for MCP servers.").
  - 2 phần: (1) spec API — bất kỳ ai implement registry được; (2) Official MCP
    Registry tại registry.modelcontextprotocol.io — bản chính thức. Backed by
    Anthropic, GitHub, PulseMCP, Microsoft (ecosystem-vision.md).
  - Timeline: preview ra mắt 2025-09-08; API freeze v0.1 từ 2025-10-24
    ("no breaking changes" cho integrator trong giai đoạn freeze).
  - Registry Working Group: 4 người / 4 tổ chức — Radoslav Dimitrov (Stacklok,
    WG Lead), Tadas Antanavicius (PulseMCP), Bob Dickinson (TeamSpark), Preeti
    Dewani (Ravenmail).
  - ⚠ Quote-license-safe: quote README/ecosystem-vision KHÔNG được chứa cụm
    "open-source" (1 dòng trong ecosystem-vision có cụm đó — đã tránh, trích
    các câu khác); lint không ngoại lệ quote.
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm
      link commit/tree)
  - Go + PostgreSQL; `cmd/publisher` (CLI mcp-publisher) + `cmd/registry`
    (API server); `internal/{api,auth,database,service,validators}` +
    `pkg/{api/v0,model}`. HEAD @ probe: `739b70e8bc1bea203c5a35ab699f1df51d091568`.
  - **Cơ chế 1 — schema tự khai phiên bản**: server.json bắt buộc `$schema`
    (URL); `internal/validators/schema.go` trích version từ URL
    (regex `/schemas/([A-Za-z0-9_~.-]+)/server\.schema\.json`), nạp file
    schema nhúng theo version (`//go:embed schemas/*.json`; thư mục chứa file
    đánh ngày 2025-07-09 / 2025-09-16 / 2025-09-29 / 2025-10-11); thiếu
    `$schema` luôn lỗi ("Empty/missing schema always produces an error");
    nonCurrentPolicy quyết định cách xử lý version không phải current.
    CurrentSchemaVersion = "2025-12-11" (`pkg/model/constants.go`).
  - **Cơ chế 2 — danh tính namespace**: `Name` reverse-DNS, pattern
    `^[a-zA-Z0-9.-]+/[a-zA-Z0-9._-]+$`, đúng 1 dấu `/`
    (`pkg/api/v0/types.go`). Sở hữu namespace chứng minh bằng: GitHub OAuth
    (login đúng user), GitHub OIDC (publish từ Actions repo đó), DNS / HTTP
    challenge (sở hữu miền) — ví dụ README: `io.github.domdomegg/...` cần
    login as domdomegg; `me.adamjones/...` cần chứng minh adamjones.me.
  - **Cơ chế 3 — chống resurrection attack**: `Repository.ID` do forge cấp,
    doc comment: "Should remain stable across repository renames and may be
    used to detect repository resurrection attacks - if a repository is
    deleted and recreated, the ID should change."
  - **Cơ chế 4 — metaregistry + kỷ luật version**: registry chứa metadata,
    KHÔNG chứa code (trỏ npm/PyPI/OCI/NuGet/Cargo/MCPB); `Version` từ chối
    version range (`^1.2.3`, `~1.2.3`, `>=1.2.3`, `1.x` đều bị reject);
    lifecycle `active`/`deprecated`/`deleted` + `isLatest` registry-managed
    (`pkg/api/v0/types.go` RegistryExtensions).
  - Live API check @ 2026-09-08 (registry.modelcontextprotocol.io/v0/servers):
    phân trang 30 bản ghi/trang; bản ghi đầu trang 1: name
    `ac.inference.sh/mcp`, `$schema` trỏ `schemas/2025-12-11/server.schema.json`
    — namespace theo miền riêng có thật ngoài thực tế.
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày
      probe)
  - Gần nhất: **v1.8.1 @ 2026-08-06**; trước đó v1.8.0 @ 2026-07-13, v1.7.9 @
    2026-05-12, v1.7.8 @ 2026-05-05, v1.7.7 @ 2026-05-04, v1.7.6 @ 2026-04-30
    (per_page=6, theo GitHub API ngày 2026-09-08).
  - Cadence KHÔNG đều: 3 bản trong 12 ngày đầu tháng 5/2026 (05-04, 05-05,
    05-12), sau đó thưa (cách ~1 tháng: 07-13, 08-06). Push gần nhất
    2026-09-05; archived=false.
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do
      (style-guide §8)
  - **DIRECTION — danh tính namespace + ownership proof**: kit Wakii ship kèm
    app nên chưa cần; khi catalog skill mở nhận đóng góp ngoài (hướng
    import/export skill trong research wakii-applicability 2026-09-08),
    reverse-DNS + GitHub OIDC là khuôn sẵn cho "tên ai, người đó giữ".
  - **DIRECTION — hợp đồng dữ liệu tự khai phiên bản**: `$schema` +
    validator-nạp-rule-theo-ngày giúp format tiến hóa không phá dữ liệu cũ —
    áp cho manifest/catalog skill nếu cấu trúc đổi theo phiên bản app.
  - **WATCH — metaregistry + hệ sinh thái MCP**: Wakii là MCP consumer tiềm
    năng; nâng cấp lên DIRECTION khi lộ trình chạm MCP client. Hôm nay Wakii
    phân phối zero-setup không trung gian (kit sync theo app version) nên
    KHÔNG grade ADOPT — pattern registry chưa có surface thật để áp ngay.
  - So sánh surface thật: docs `agents-and-kit` — kit tự cài `~/.claude/`,
    idempotent, sync theo app version; catalog `src/data/skills.ts` 20
    tổng/13 public (snapshot D8 2026-09-08).

## Bài đã viết (link trong repo)

- `src/content/blog/vi/deep-dive-modelcontextprotocol-registry.md`
- `src/content/blog/en/deep-dive-modelcontextprotocol-registry.md`
- Adopt draft: KHÔNG (không grade ADOPT)
