# janhq/jan — research digest (batch-3, matrix #30)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: janhq/jan
- facet: inference
- stars @ 2026-09-08: 44380
- license (GitHub API 2026-09-08): NOASSERTION († — gọi "công khai trên GitHub", KHÔNG "open-source")
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — Jan = desktop app chạy LLM trên máy người dùng: tải model
  (Llama, Gemma, Qwen, GPT-oss…) từ Hugging Face, cloud (OpenAI/Anthropic/Mistral/
  Groq/MiniMax) là lựa chọn bổ sung; "Privacy First: Everything runs locally when
  you want it to"; server OpenAI-compatible tại `localhost:1337` cho app khác;
  MCP integration. Phân phối: Windows (exe + Microsoft Store) · macOS dmg
  universal · Linux deb/AppImage/Flathub + hướng dẫn arm64. Build từ source cần
  Rust "(for Tauri)". ⚠ README dòng đầu chứa cụm cấm † — KHÔNG quote dòng đó.
- [x] Architecture — provider abstraction: `AIEngine` (abstract, khai báo
  `abstract readonly provider: string`, tự `registerEngine()` vào
  `EngineManager.instance()`) → `OAIEngine` → `LocalOAIEngine`/`RemoteOAIEngine`
  (remote chỉ override headers gắn API key); `EngineManager.engines =
  Map<string, AIEngine>` keyed theo provider, `get(provider)`; interface suy luận
  `InferenceInterface` đúng 1 method `inference(data: MessageRequest)`. Engine =
  extension package riêng (`extensions/llamacpp-extension`, `mlx-extension`, cạnh
  download/rag/vector-db/assistant/conversational); llamacpp-extension gọi engine
  native qua `invoke`/`listen` của `@tauri-apps/api` (engine chạy như Tauri
  plugin). Trích @ HEAD main `dc40d7c273e74a7d079f4635d93472b7fdb4ce2b` (09-08).
- [x] Releases — 10 bản gần nhất 2025-12-08 (v0.7.5) → 2026-07-23 (v0.8.4);
  cụm v0.8.0→v0.8.3 gói 22-05 → 24-06-2026 (4 bản ~1 tháng). Release cuối cách
  ngày research >6 tuần nhưng commit mới nhất trên main đúng 2026-09-08
  (06:50 UTC) — main đi trước release, phát triển không nghỉ giữa hai bản.
- [x] Wakii grading — **ADOPT** privacy-as-default là quyết định kiến trúc (khớp
  local-first của Wakii: kit cài ~/.claude/, worktree cục bộ — đề xuất đưa vào
  checklist review tính năng mới) · **DIRECTION** registry provider theo tên
  (EngineManager pattern — cân nhắc khi Wakii cần backend thứ hai) · **WATCH**
  Tauri như phương án đóng gói thay Electron (điều kiện: footprint thành điểm
  đau đo được) · **N/A** tự maintain engine suy luận (bindings/GPU offload).

## Ghi chú license † (probe riêng 2026-09-08)

Tree có file LICENSE với văn bản "Licensed under the Apache License, Version
2.0 (the \"License\");" nhưng **GitHub API không nhận diện chuẩn — hiển thị
NOASSERTION** (header file sửa tên dự án, detector không map). Bài ghi ĐÚNG
công thức: NOASSERTION kèm ngày probe + gọi "công khai trên GitHub" — KHÔNG
tự gán nhãn Apache. Ghi thêm observation file LICENSE (quote ≤25 từ + blob
link) — factual, không phải gán nhãn.
