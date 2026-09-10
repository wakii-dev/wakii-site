# TabbyML/tabby — research digest (batch-3, matrix #45)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: TabbyML/tabby
- facet: editors
- stars @ 2026-09-08: 33869 (probe SF-1, khớp re-probe bài viết 2026-09-08)
- license (GitHub API 2026-09-08): NOASSERTION († — gọi "công khai trên GitHub", KHÔNG "open-source")
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`; re-probe `gh api repos/TabbyML/tabby` cùng ngày)
- ngôn ngữ: Rust · default branch: main · pushed_at 2026-06-30T20:38:02Z · archived: false
- HEAD main @ probe: `21b29048d7bcf6b94f9f482f2d0fd05efadfd19f`

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## README notes

- Tự mô tả (GitHub API `description`): "Self-hosted AI coding assistant".
- 3 tính năng README liệt kê: self-contained (không cần DBMS hay cloud
  service) · giao diện OpenAPI để cắm hạ tầng sẵn (vd Cloud IDE) · chạy được
  trên GPU phổ thông (consumer-grade).
- README CÓ chứa cụm "open-source" (câu "…offering an open-source and
  on-premises alternative…") — **KHÔNG quote câu này** vào bài (scoped
  FORBIDDEN trên slug này, cả VI lẫn EN). Chỉ quote câu "Self-contained, with
  no need for a DBMS or cloud service." (10 từ, sạch).
- Getting started README: docker run một lệnh với `--model StarCoder-1B
  --device cuda --chat-model Qwen2-1.5B-Instruct`.
- Clients: vscode / vim / intellij (thư mục `clients/`, dẫn trong OpenAPI info
  của serve.rs).

## Architecture

- Cargo workspace (`Cargo.toml` @ HEAD): 14 crates `crates/` + 4 crates `ee/`
  (tabby-webserver, tabby-db, tabby-db-macros, tabby-schema). Version workspace
  `0.33.0-dev.0`.
- `crates/tabby/src/main.rs` @ `21b29048d7bcf6b94f9f482f2d0fd05efadfd19f`:
  clap CLI ĐÚNG 2 subcommand — `Serve` ("Starts the api endpoint for IDE /
  Editor extensions") và `Download`; enum `Device`: Cpu/Cuda/Rocm/Metal/Vulkan;
  `main()` set permission **0o700** cho `tabby_root()` (data dir khóa
  owner-only) — chi tiết privacy nhỏ, đáng ADOPT.
  https://github.com/TabbyML/tabby/blob/21b29048d7bcf6b94f9f482f2d0fd05efadfd19f/crates/tabby/src/main.rs
- `crates/tabby/src/serve.rs` @ cùng sha: `ServeArgs` có `--model` (completions),
  `--chat-model` (chat), `--device`, `--chat-device`, `--parallelism`; router
  axum với routes log_event/completions/chat_completions/health/setting;
  Swagger UI tự sinh qua utoipa; tính năng ee gate bằng cargo feature
  `#[cfg(feature = "ee")]` + `tabby_webserver`.
- Crates context dự án: `tabby-crawler`, `tabby-index` (search dựa trên
  tantivy — dependency trong Cargo.toml workspace), `tabby-git`.
- Inference tách crate: `tabby-inference` (chat.rs, code.rs, completion.rs,
  decoding.rs, embedding.rs), bindings `llama-cpp-server`, `ollama-api-bindings`,
  `http-api-bindings`, downloader `aim-downloader`.

## License (điểm bài học của bài)

- GitHub API: `NOASSERTION` — detector không khớp một SPDX duy nhất.
- File `LICENSE` (10258 bytes, probe 2026-09-08): nhân kiểu polyform-split —
  mọi nội dung NGOÀI thư mục `ee/` theo "Apache 2.0" (quote được:
  "Content outside of the above mentioned directories or restrictions above
  is available under the "Apache 2.0" license" — 17 từ), thư mục `ee/` theo
  license riêng `ee/LICENSE`.
  https://github.com/TabbyML/tabby/blob/21b29048d7bcf6b94f9f482f2d0fd05efadfd19f/LICENSE
- Cách gọi trong bài: "công khai trên GitHub", điều khoản phân theo thư mục —
  KHÔNG dùng "open-source"/"mã nguồn mở" (lint scoped FAIL toàn bài).

## Releases (gh api releases?per_page=6, ngày probe 2026-09-08)

| tag | published_at |
|-----|--------------|
| nightly | 2023-09-08 |
| next-alpha | 2026-02-09 |
| v0.32.0 | 2026-01-25 |
| v0.32.0-rc.1 | 2026-01-22 |
| v0.32.0-rc.0 | 2026-01-12 |
| v0.31.2 | 2025-09-25 |

- Nhịp quan sát: v0.31.2 (09-2025) → v0.32.0 (01-2026) → next-alpha (02-2026);
  pushed_at 2026-06-30 — trên 2 tháng không push tính tới ngày probe 2026-09-08.
  README "What's New" mục mới nhất (12/12/2025) đã trỏ sang sản phẩm agent
  Pochi của cùng công ty. Ghi trong bài THẬT + KÈM NGÀY, giọng tôn trọng,
  không phán "chết".

## Wakii grading (draft — chốt trong bài)

- **ADOPT** — data-dir hygiene: chmod 0o700 thư mục state local (evidence
  main.rs). Đề xuất: rà thư mục state/pairing/index cục bộ của Wakii khóa
  owner-only — seeding adopt-drafts/deep-dive-tabbyml-tabby.md.
- **DIRECTION** — model-agnostic: giữ tầng agent CLI tách rời endpoint model
  để kịch bản tự host (endpoint nội bộ) vẫn dùng được; chưa có yêu cầu user.
- **WATCH** — nhịp phát triển chậm lại (số kèm ngày): theo dõi, đổi grade nếu
  hoạt động quay lại.
- **N/A** — tách license ee/: Wakii giữ một license MIT duy nhất; pattern
  split-license không áp.
