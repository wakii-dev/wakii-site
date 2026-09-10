# DeusData/codebase-memory-mcp — research digest (batch-3, matrix #17)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: DeusData/codebase-memory-mcp
- facet: mcp
- stars @ 2026-09-08: 42644 (re-probe trực tiếp `gh api repos/DeusData/...` lúc viết bài — skeleton SF-1 ghi 42634, cùng ngày; repo tăng nhanh, số trong bài theo lần probe CUỐI)
- license (GitHub API 2026-09-08): MIT
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh` + re-probe `gh api` trực tiếp)
- forks: 3483 · created: 2026-02-24 · pushed: 2026-09-08 · archived: false · language: C
- HEAD sha (để link blob): `161df2bdb1f4e28734f326a73f6e7989418f1288`

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## README notes

- Repo làm gì: MCP server code-intelligence — index codebase thành persistent
  knowledge graph (SQLite) gồm node (Function/Class/Route…) + edge có kiểu
  (CALLS/IMPORTS/HTTP_CALLS/DATA_FLOWS/SEMANTICALLY_RELATED); agent truy vấn qua
  MCP thay vì grep từng file. Pure C, single static binary, không cần runtime/API
  key; vendored tree-sitter grammars; Hybrid LSP cho ~14 ngôn ngữ phổ biến.
- Cho ai: người dùng coding agent (README liệt kê claude-code, cursor, windsurf,
  codex… trong topics + "45 supported automatic/conditional client surfaces").
- Điểm khác biệt cốt lõi: (1) tốc độ — README claim Linux kernel 28M LOC/75K
  files index trong 3 phút, query <1ms (README claim, đọc 2026-09-08, KHÔNG tự
  benchmark); (2) zero-dependency C binary + release process nổi bật
  (VirusTotal per-release, SLSA 3, OpenSSF Scorecard); (3) có arXiv preprint
  2603.27277 kèm eval 31 repos (83% answer quality, 10× fewer tokens — claim
  của preprint, cite đúng nguồn).
- ⚠ Drift nhỏ phát hiện khi research: README quảng cáo "15 MCP tools" nhưng
  bảng `TOOL_ANNOTATIONS` trong `src/mcp/mcp.c` tại HEAD liệt kê 17 — bài viết
  truy nguồn code, ghi chú drift 1 câu (evidence-honesty).

## Architecture (đọc code thật @ HEAD `161df2bd`)

- `src/store/store.h` — SQLite graph store opaque; struct `cbm_node_t` (id,
  project, label, name, qualified_name, file_path, start/end line,
  properties_json) + `cbm_edge_t` (source_id, target_id, type, properties_json).
- `src/mcp/mcp.c` (782KB) — bảng TOOLS + TOOL_ANNOTATIONS 17 entry với flag
  read_only/destructive/idempotent; comment cam kết read-only path "a corrupt
  database is reported and left in place, never quarantined or rebuilt" (chỉ
  write-side mới được quarantine/rebuild). ADR: `manage_adr`; file ADR tại
  `.codebase-memory/adr.md` (hàm `project_has_adr` kiểm tra path trực tiếp);
  `handle_get_graph_schema` trả `adr_present` + hint nhắc dùng manage_adr.
- `src/watcher/watcher.h` — anti-stale: poll "git changes (HEAD movement or
  dirty working tree)", adaptive interval 5s + 1s/500 files cap 60s; baseline
  CHỈ ghi khi re-index thành công — "a skipped or failed reindex keeps the
  change pending so it is retried, never silently lost" (#937); prune cache
  phải qua errno classification (chỉ ENOENT/ENOTDIR count; EACCES/EIO/TCC
  không — "the cached DB holds user-authored data and is unrecoverable once
  pruned").
- `src/pipeline/pipeline_incremental.c` — incremental re-index: "Compares file
  mtime+size against stored hashes to classify changed/unchanged", xóa node
  file đổi (edge cascade ON DELETE CASCADE), parse lại riêng, merge vào DB.
- Team-shared artifact: `.codebase-memory/graph.db.zst` — 2 tier (Best zstd -9
  strip index VACUUM INTO khi index chủ động / Fast zstd -3 từ watcher);
  bootstrap import artifact trước rồi incremental cho local diff;
  `merge=ours` tự sinh trong `.codebase-memory/.gitattributes`; README cảnh báo
  history phình — "one team reached ~6 GB across ~350 commits of this single
  path" — khuyên cadence commit hoặc Git LFS.
- Session Coordination Daemon: daemon dùng chung per-account cho watcher/index
  jobs/UI; admission barrier theo exact build + cache root.
- src/ layout: foundation (66) · pipeline (43, 20+ pass_*.c) · daemon (25) ·
  cli (22) · mcp (8) · watcher (3) · store (3) · cypher (3)…

## Releases

- Release gần nhất: **v0.10.8 — 2026-08-19** (theo GitHub API ngày 2026-09-08).
- Cadence: 6 release liên tiếp 2026-08-13 → 2026-08-19 (v0.10.3 → v0.10.8) —
  gần hằng ngày trong cửa sổ đó. Sau 19-08 chưa có release mới tới ngày probe
  (repo vẫn pushed 2026-09-08 — main có commit chưa thành release).

## Wakii grading (đã viết trong bài, §Wakii học được gì)

- **ADOPT** — stamp freshness cho context pack: pack lưu `base-sha` của dest
  lúc sinh; executor so sha trước khi dùng, lệch → re-sync (mở rộng merge
  guard `merge-base --is-ancestor` từ nhánh sang tài liệu). Lý do: watcher.h
  baseline-on-success + đối chiếu nguồn trước khi tin cache.
- **DIRECTION** — repo map một lượt gọi (`get_architecture`): seed cho Phase 0
  impact analyst thay hàng chục grep; chưa áp ngay vì tool ngoài + chi phí
  duy trì + khớp format pack.
- **WATCH** — artifact nhị phân trong git (6GB/350-commit war story — cần
  cadence rõ trước khi cân nhắc) + install tự sửa config 45 surfaces (Wakii
  zero-setup không đụng config sẵn).
- **N/A** — không dùng.
