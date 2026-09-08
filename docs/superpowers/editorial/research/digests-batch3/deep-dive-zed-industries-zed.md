# zed-industries/zed — research digest (batch-3, matrix #10)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: zed-industries/zed
- facet: editors
- stars @ 2026-09-08: 89941 (probe lại 09-08: 89941 — skeleton chụp 89931, drift +10 sao giữa hai lần probe cùng ngày)
- license (GitHub API 2026-09-08): NOASSERTION († — gọi "công khai trên GitHub", KHÔNG "open-source")
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## Research notes (SF-2, probe + clone 2026-09-08)

**Probe GitHub API 2026-09-08**: stars 89,941 · forks 10,501 · license
NOASSERTION · pushed 2026-09-08T12:28:38Z · created 2021-02-20. Description:
"Code at the speed of thought – Zed is a high-performance, multiplayer code
editor from the creators of Atom and Tree-sitter."

**README** (raw API, không dính gotcha >1MB): "high-performance, multiplayer
code editor from the creators of Atom and Tree-sitter". ⚠ License section của
README chứa cụm cấm "open source licenses" (câu về cargo-about) — KHÔNG quote
câu đó; quote câu GPL thay thế (13 từ, sạch): "Zed source code is licensed
primarily under GPL-3.0-or-later, with Apache-2.0 components where marked."

**Architecture** (clone `--depth 1` @ sha `e2534d2`, ngày 2026-09-08):
- 244 crate trong `crates/`, 1,873 file `.rs`.
- `gpui` (Apache-2.0): README crate — "GPUI is a hybrid immediate and retained
  mode, GPU accelerated, UI framework for Rust"; pre-1.0, breaking changes;
  macOS = Metal, Linux = wayland/x11.
- `sum_tree` (Apache-2.0): B-tree tổng hợp; node con trong `ArrayVec`
  (heapless), `TREE_BASE = 6` (non-test), duyệt song song bằng rayon.
- `text` (GPL-3.0-or-later): `Operation = Edit | Undo`;
  `EditOperation { timestamp: clock::Lamport, version: clock::Global, .. }` —
  CRDT dạng operation ở tầng lõi buffer.
- `clock`: `Lamport { value: Seq, replica_id: ReplicaId }` + `Global`
  (version vector, SmallVec<[u32; 4]>).
- `collab` (GPL-3.0-or-later): server collaboration (rpc, db, services).
- Crate chính `zed` (GPL-3.0-or-later). Agent crates: `acp_thread`,
  `acp_tools` trong `crates/`; `agent` phụ thuộc `acp_thread`.
- License files ở root: `LICENSE-GPL` (GPLv3) + `LICENSE-APACHE` (Apache-2.0,
  "Copyright 2022 - 2025 Zed Industries, Inc."). Phân chia có chủ đích:
  tầng nền (gpui, sum_tree) = Apache; tầng sản phẩm (text, collab, zed) = GPL.

**Releases** (API `releases?per_page=12` 2026-09-08): stable chain
v1.16.1 (08-19) → v1.16.2 (08-24) → v1.16.3 (08-26) → v1.17.2 (08-26) →
v1.18.0 (09-02) → v1.18.1 (09-04) = 6 bản stable trong 17 ngày; xen kẽ
`-pre` (v1.17.0-pre 08-19, v1.17.1-pre 08-24, v1.17.2-pre 08-25,
v1.18.0-pre 08-26, v1.19.0-pre 09-02, v1.19.1-pre 09-04). Pattern: pre đi
trước stable vài giờ → vài ngày. Không có v1.17.0/v1.17.1 stable.

**Wakii grading** (style-guide §8, so surface thật):
- **ADOPT** — kênh `-pre` trước stable (bảng release ở trên; Wakii hiện chỉ
  có desktop stable + Android pre riêng) → đề xuất desktop `-pre` build.
- **DIRECTION** — policy thành gate CI (README Zed: dependency thiếu license
  metadata → CI fail; Wakii đã có lint claims cho blog → mở rộng sang kit).
- **WATCH** — ACP (acp_thread/acp_tools trong lõi; epic quyết MCP trước —
  issue #5; nâng cấp khi MCP server story-workflow lên).
- **N/A** — GPUI + CRDT buffer (Wakii trên Electron; agent tránh xung đột
  bằng worktree riêng, không merge real-time trên 1 buffer).

**Bài đã viết**: `src/content/blog/{vi,en}/deep-dive-zed-industries-zed.md`
(pubDate 2026-10-05, tech, hero yes — heroImage cả hai locale).
