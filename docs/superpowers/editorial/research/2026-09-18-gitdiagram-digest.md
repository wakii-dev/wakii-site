# Digest 2026-09-18 — ahmedkhaleel2004/gitdiagram

Retrieval date: 2026-09-18 (số liệu lấy trực tiếp qua `gh api` tại thời điểm viết).

## Repo

| | |
|---|---|
| Repo | https://github.com/ahmedkhaleel2004/gitdiagram |
| Stars | 16,280 (2026-09-18) |
| Tuổi | created 2024-12-15 (~21 tháng) |
| Cadence | **0 release, 0 tag** — cadence đo bằng commit: 42 commits/30 ngày, push cả hôm nay |
| License | MIT |
| Ngôn ngữ | TypeScript (Next.js 16 App Router, React 19, Tailwind, Radix) |
| Maintainer | 1 người chiếm 359/377 contributions (~95%), dependabot 17 |
| Hạ tầng | Vercel (Bun runtime) + Cloudflare R2 + Upstash Redis; Docker/Rayon chỉ là cold-recovery recipe |

## Bảng stars trong category repo→diagram/wiki

| Stars | Repo | Created | Ghi chú |
|---|---|---|---|
| 18,004 | AsyncFuncAI/deepwiki-open | 2025-04-30 | self-host wiki generator, lấn sân GitLab/Bitbucket |
| 16,280 | **ahmedkhaleel2004/gitdiagram** | 2024-12-15 | hosted-first, diagram, solo maintainer |
| 3,594 | AIDotNet/OpenDeepWiki | 2025-04-27 | bản open của DeepWiki thương mại |
| 3,019 | sopaco/deepwiki-rs | 2025-09-05 | Rust, nhấn "AI-ready context" |
| 1,388 | regenrek/deepwiki-mcp | 2025-04-28 | MCP wrapper đọc deepwiki.com |

## Là gì

Paste URL GitHub repo → interactive architecture diagram (Mermaid render, click node
mở file thật trên GitHub). Trick viral: thay `hub` bằng `diagram` trong mọi GitHub URL.
Free tier có quota (Upstash), private repo bằng fine-grained PAT nhập tại browser.

## Kiến trúc đáng học

- **LLM propose, deterministic chấm**: 1 request model duy nhất sinh strict graph →
  server validate identifier, connectivity, limits, và **từng path liên kết so với repo
  thật** → invalid thì retry kèm focused feedback → compiler deterministic convert ra
  Mermaid. Model không được tự do vẽ.
- **Fail-before-model**: tree bị truncate hoặc input quá to bị chặn **trước** khi gọi
  model; excerpts có integrity check, chọn module runtime quan trọng, dàn đều file dài.
- **Parser đầy đủ chỉ sống ở test suite** làm contract test, không load vào prod bundle —
  giữ bundle nhỏ mà không yếu đi validation.
- **Chi phí là product surface**: `/api/generate/cost` estimate trước, quota trong Redis,
  cancel token phân tán, slow request bị cancel trước khi replacement start mà **partial
  usage vẫn tính vào cost**. Commit hôm nay: "Restore Luna generation to contain public
  API costs" — cost/latency/quality là mối bận tâm từng commit, không phải afterthought.
- **Cache artifact theo repo** (R2) — mở lại diagram không tốn thêm model call.

## Post angles

1. **"16k stars, 0 release"** — distribution hosted-first: cadence bằng commit, không
   bằng tag; đối trọng deepwiki-open (18k★) đi hướng self-host. Post về 2 mô hình
   phân phối của AI tool consumer 2025–2026. Evidence: releases/tags API rỗng +
   commit count, retrieval 2026-09-18.
2. **"Model vẽ, compiler chấm"** — trust boundary: LLM đề xuất graph, deterministic
   validator đối chiếu path với Git thật mới cho render. Nối trực tiếp digest cùng ngày
   (alibaba/open-code-review): cùng doctrine LLM-propose/deterministic-verify ở 2 sản
   phẩm khác nhau — đang thành pattern chung của category.
3. **Solo maintainer fight cost** — 95% contributions là 1 người, commit log hôm nay
   đọc như nhật ký đấu tranh latency/cost/quality (4 commits liên tiếp về Luna latency,
   cost containment, compact output). Post về chi phí thật của AI feature consumer-grade.
