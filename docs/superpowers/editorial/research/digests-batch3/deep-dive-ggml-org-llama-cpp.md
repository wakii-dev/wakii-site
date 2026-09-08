# ggml-org/llama.cpp — research digest (batch-3, matrix #6)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: ggml-org/llama.cpp
- facet: inference
- stars @ 2026-09-08: 127477 (probe lại trong SF-2; skeleton cũ ghi 127469 — drift 8★ giữa hai lần probe cùng ngày, dùng số SF-2)
- license (GitHub API 2026-09-08): MIT
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`; SF-2 probe lại bằng `gh api repos/ggml-org/llama.cpp` exit 0)
- pushed @ 2026-09-08: 2026-09-08T11:36:37Z · created 2023-03-10 · desc "LLM inference in C/C++"
- clone SHA cho blob links: `1744c6b` (master, clone 2026-09-08)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## README notes

- Mục tiêu README: LLM (và VLM) inference "with minimal setup and state-of-the-art
  performance on a wide range of hardware - locally and in the cloud" (quote ≤25 từ
  kèm link blob @ 1744c6b).
- Cho ai: ai muốn chạy model local/VLM trên phần cứng đa dạng — CPU x86 (AVX/AVX2/
  AVX512/AMX), Apple Silicon (ARM NEON + Accelerate + Metal, "first-class citizen"),
  RISC-V (RVV), NVIDIA (CUDA kernel riêng), AMD (HIP), Moore Threads (MUSA), Vulkan,
  SYCL, WebGPU.
- Điểm khác biệt cốt lõi: thuần C/C++ không dependency; quantization integer
  1.5→8-bit; CPU+GPU hybrid cho model vượt tổng VRAM; xây trên thư viện ggml
  (repo riêng ggml-org/ggml).
- Quick start: `llama cli -hf ggml-org/Qwen3.5-0.8B-GGUF` (tải từ Hugging Face) và
  `llama serve -hf ...` (server OpenAI-compatible).

## Architecture (code @ clone 1744c6b, 2026-09-08)

- Cấu trúc: `src/` = logic model (llama-arch, llama-context 4.330 dòng,
  llama-kv-cache-*, llama-batch...); `ggml/` = tensor library + mọi backend;
  `tools/` = cli, server, quantize, imatrix, perplexity, llama-bench, mtmd, rpc, ui;
  `gguf-py/` + `convert_hf_to_gguf.py` = conversion tooling.
- Backend registry: `ggml/src/ggml-backend-reg.cpp` quét thư mục → `dl_load_library`
  → đọc symbol `ggml_backend_score` → chọn best score (trích đoạn trong bài, blob
  link @ 1744c6b). 18 thư mục backend trong `ggml/src/` (cpu, metal, cuda, vulkan,
  webgpu, opencl, sycl, hip, musa, zdnn, zendnn, hexagon, cann, rpc, blas, openvino,
  virtgpu, et); bảng README "Supported backends" liệt kê 17 dòng (clone 08-09).
- Quantization: `ggml/include/ggml.h` enum — grep đếm 56 match `GGML_TYPE_`
  (Q8_0=8, Q4_K=12, IQ1_S=19, IQ1_M=29; comment GGML_PREC_Q4 nhắc MXFP4, NVFP4).
  Kernel trong `ggml/src/ggml-quants.c` = 5.667 dòng; `ggml.c` = 8.139 dòng.
- GGUF: `ggml/include/gguf.h` = 211 dòng API; docs/models.md: "requires the model
  to be stored in the GGUF file format" — format khác phải convert bằng script
  Python trong repo.
- Agent-native bits: `AGENTS.md` ở gốc tree (AI policy: "AI-generated code is
  allowed. What is not allowed is submitting code you do not understand" —
  100% responsible; "a simpler change that does 90% of the job is often preferable
  to a complex one that does 100%"); `skills/add-new-model/SKILL.md` (cấm viết hộ
  PR description/commit message; bắt disclosure; `Assisted-by:` thay
  `Co-authored-by:`; bắt đọc `git log` ≥3 PR gần nhất — "shows current convention
  more reliably than the docs, which can lag behind"); `CLAUDE.md` trỏ về AGENTS.md.

## Releases (GitHub API 2026-09-08, exit 0)

- Cadence: nightly build b-numbered gần như theo merge — 12 release b10835 (09-07
  08:08 UTC) → b10857 (09-08 11:36 UTC) = 12 builds / ~27,5 giờ.
- Stable: v0.4.0 ngày 2026-09-04 — bản đánh số DUY NHẤT trong 100 release gần nhất
  (fetch per_page=100, filter v*).
- Badge README: "Nightly" filter `b*`, "Release" filter `v*` — hai kênh tách bạch
  trong chính badge.

## Wakii grading (bài đã viết — src/content/blog/{vi,en}/deep-dive-ggml-org-llama-cpp.md)

- ADOPT — người chịu trách nhiệm cuối: AGENTS.md "100% responsible" ↔ Wakii
  "Humans own the irreversibles" (merge = human gate).
- ADOPT — convention từ dữ liệu thật: add-new-model đọc git log thay vì tin docs ↔
  Wakii Rule 0 verifier đo dist thật.
- DIRECTION — repo tự ship skill onboarding đóng góp (add-new-model) → Wakii có thể
  ship skill "thêm agent/skill mới vào kit" cho repo sản phẩm.
- WATCH — inference xuống edge (Hexagon/Snapdragon, WebGPU, 1-bit) → điều kiện lên
  DIRECTION: model local chạy trọn một story nhiều gate.
- N/A — kernel quantization + backend dispatch: hạ tầng tensor, Wakii không chạy
  model in-process.

## Phân định góc vs bài cùng SF (chống trùng)

- Ollama (#3, 2026-10-02) = tầng trải nghiệm: 1-lệnh, scheduler fit VRAM, launchpad
  agent (`ollama launch claude`), REST API. llama.cpp (#6, 2026-10-03) = tầng
  engine: ggml + backend registry score-based + quantization 1→8-bit + GGUF + nhịp
  nightly + AI contribution policy. Bài #6 chỉ nhắc ollama làm backend ở hook + CTA
  cross-link — không mổ scheduler/API.
- agentic-landscape-50 (#98-100 table): llama.cpp được nhãn "the original runtime" /
  "runtime gốc" — bài dùng đúng nhãn này khi cross-link.
