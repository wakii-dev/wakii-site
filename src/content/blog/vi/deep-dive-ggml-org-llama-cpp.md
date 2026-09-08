---
title: "llama.cpp: inference LLM tối ưu từ CPU tới edge"
description: "Mổ xẻ engine inference C/C++ gốc của làng LLM local: quantization từ 1-bit tới 8-bit, 17 backend từ CPU x86 tới điện thoại, và chính sách AI contribution khắt khe của repo 127k★ này."
pubDate: "2026-10-03"
category: "tech"
tags: ["architecture", "oss", "release"]
draft: false
heroImage: "/blog/heroes/deep-dive-ggml-org-llama-cpp.png"
---

Chạy một LLM nghe như bài toán của GPU trạm workstation — nhưng phần lớn lần chạy thật diễn ra nơi không GPU nào: laptop CPU-only, máy Mac, chiếc điện thoại trong túi bạn. Engine được gọi tên nhiều nhất nơi đó là llama.cpp: thuần C/C++, không phụ thuộc — 127.477★, license MIT (theo GitHub API ngày 2026-09-08). Bài Ollama trong cùng loạt đã mổ xẻ tầng trải nghiệm một-lệnh vốn lấy llama.cpp làm backend; bài này xuống tầng engine: backend hoán đổi, quantization, nhịp nightly.

TL;DR:

- llama.cpp là engine inference thuần C/C++ trên thư viện ggml, nhắm hiệu năng trên "wide range of hardware" — x86, Apple Silicon tới NPU điện thoại.
- Quantization là lõi triết lý: enum trong `ggml.h` liệt kê từ 1-bit (IQ1_S/M), 4-bit (Q4_K, MXFP4) tới 8-bit (Q8_0) — 56 định nghĩa kiểu trong một header.
- Backend không gắn cứng: registry trong `ggml/src/` tự quét, tự load library rồi chọn backend điểm số cao nhất trong 18 backend.
- Nhịp ship: release ổn định v0.4.0 ngày 04-09-2026, nhưng 12 nightly build b108xx đổ ra chỉ trong ~27 giờ (theo GitHub API ngày 2026-09-08).
- Repo quản AI contribution bằng chính sách "chịu 100% trách nhiệm từng dòng" và tự ship skill hướng dẫn đóng góp ngay trong tree.

## Một engine, 17 backend — chọn bằng điểm số

README nêu mục tiêu ngay dòng đầu: LLM (và VLM) inference "with minimal setup and state-of-the-art performance on a wide range of hardware" ([README của llama.cpp](https://github.com/ggml-org/llama.cpp/blob/1744c6b/README.md)). Vì sao C/C++ không phụ thuộc lại ăn được trên đủ loại máy? Kiến trúc hai lớp: thư viện [ggml](https://github.com/ggml-org/ggml) định nghĩa phép toán tensor, còn phần thực thi tách thành các backend hoán đổi cho nhau.

```
model GGUF (weights da quant hoa)
   |
ggml: dung graph tensor -> dispatch tung phep toan
   |
[cpu] [metal] [cuda] [vulkan] [hip] [sycl] [opencl] [webgpu] [rpc] ...
   |
thiet bi thuc: x86, Apple Silicon, GPU NVIDIA/AMD/Intel,
NPU Snapdragon, trinh duyet WebGPU
```

Bảng "Supported backends" trong README liệt kê 17 backend (clone ngày 08-09-2026) — từ CUDA, Metal, Vulkan, HIP tới Hexagon cho Snapdragon, WebGPU cho trình duyệt và cả IBM zDNN. Thư mục `ggml/src/` chứa 18 thư mục backend tương ứng. Điểm đáng học là cách backend được tìm thấy lúc chạy: `ggml-backend-reg.cpp` quét thư mục, load từng shared library rồi đọc symbol `ggml_backend_score` để chấm điểm:

```cpp
auto score_fn = (ggml_backend_score_t) dl_get_sym(handle.get(), "ggml_backend_score");
if (score_fn) {
    int s = score_fn();
    if (s > best_score) {
        best_score = s;
        best_path = entry.path();
    }
}
```

(đoạn trích từ [ggml-backend-reg.cpp @ 1744c6b](https://github.com/ggml-org/llama.cpp/blob/1744c6b/ggml/src/ggml-backend-reg.cpp))

Backend nào khai điểm cao hơn thì thắng — backend khai báo năng lực của chính nó trong cùng một header, phần dispatch chỉ tin vào con số đó. Model lớn hơn tổng VRAM thì README mô tả chế độ hybrid: một phần GPU, phần còn lại CPU gánh tiếp.

## Quantization: nén model từ 1-bit tới 8-bit

Nửa kia của triết lý hiệu năng là nén model. README liệt kê sẵn dải integer quantization từ 1.5-bit tới 8-bit "for faster inference and reduced memory use" ([README của llama.cpp](https://github.com/ggml-org/llama.cpp/blob/1744c6b/README.md)). Không phải khẩu hiệu — các kiểu nằm ngay trong enum công khai của header thư viện:

```c
GGML_TYPE_Q8_0    = 8,
GGML_TYPE_Q4_K    = 12,
GGML_TYPE_IQ1_S   = 19,
GGML_TYPE_IQ1_M   = 29,
```

(đoạn trích từ [ggml.h @ 1744c6b](https://github.com/ggml-org/llama.cpp/blob/1744c6b/ggml/include/ggml.h) — grep đếm 56 định nghĩa `GGML_TYPE_*` trong file này tại clone ngày 08-09-2026, gồm cả kiểu 4-bit floating mới MXFP4 và NVFP4)

Đáng chú ý nhất là IQ1_S/IQ1_M — quantization 1-bit kiểu siêu khối (super-block): mỗi weight còn khoảng một bit thông tin và model vẫn sinh token được. Toàn bộ kernel nén/giải nén nằm trong `ggml-quants.c` — 5.667 dòng C (clone 08-09-2026). Kèm theo là bộ công cụ đo đạc: `tools/quantize` để nén, `tools/imatrix` đo ma trận quan trọng trước khi nén, `tools/perplexity` và `tools/llama-bench` kiểm chứng chất lượng sau nén — nén xong phải đo lại, không nén rồi tin.

Định dạng model cũng do engine này định: GGUF. Tài liệu models nói thẳng: "requires the model to be stored in the GGUF file format" — định dạng khác phải convert bằng script Python kèm trong repo ([docs/models.md @ 1744c6b](https://github.com/ggml-org/llama.cpp/blob/1744c6b/docs/models.md)). Cấu trúc key-value gọn đến mức chỉ 211 dòng khai báo API trong `gguf.h` — một chuẩn đọc hết trong một buổi.

## Nhịp nightly: 12 builds trong 27 giờ

Repo hạ tầng sống khác repo ứng dụng: release ổn định gần nhất v0.4.0 ngày 04-09-2026 cũng là bản đánh số duy nhất trong 100 release gần nhất (theo GitHub API ngày 2026-09-08); phần còn lại là nightly build b108xx đổ ra theo merge:

| Tag | Ngày phát hành (UTC) |
|---|---|
| b10857 | 2026-09-08 11:36 |
| b10856 | 2026-09-08 10:49 |
| b10855 | 2026-09-08 10:03 |
| b10853 | 2026-09-08 03:58 |
| b10852 | 2026-09-08 00:40 |
| b10850 | 2026-09-07 20:03 |
| b10844 | 2026-09-07 19:28 |
| b10842 | 2026-09-07 18:13 |
| b10840 | 2026-09-07 14:31 |
| b10839 | 2026-09-07 11:14 |
| b10837 | 2026-09-07 08:35 |
| b10835 | 2026-09-07 08:08 |

12 builds trong ~27,5 giờ (theo GitHub API ngày 2026-09-08); `pushed_at` của repo cũng đúng khung giờ đó — 11:36:37 UTC ngày 08-09-2026. Hệ quả tự nhiên của backend hoán đổi: mỗi merge có thể đụng một trong 18 backend, nên pipeline build liên tục để ai trên phần cứng nào cũng có binary mới. Repo công khai từ 10-03-2023 và nhịp này giữ qua hơn ba năm.

## Repo agent-native: AGENTS.md và skill đóng góp riêng

Điều bất ngờ nhất: gốc tree có `AGENTS.md` — không phải hướng dẫn cho agent, mà là giới hạn cho người dùng agent. Nguyên tắc đầu: "AI-generated code is allowed. What is **not** allowed is submitting code you do not understand" ([AGENTS.md @ 1744c6b](https://github.com/ggml-org/llama.cpp/blob/1744c6b/AGENTS.md)). Người đóng góp chịu 100% trách nhiệm từng dòng, dù do ai gõ — vì mỗi dòng merged được đội maintainer nhỏ maintain vô hạn trên ma trận platform-backend khổng lồ, nên "a simpler change that does 90% of the job is often preferable to a complex one that does 100%" (vẫn AGENTS.md).

Repo còn tự ship skill cho agent đóng góp: `skills/add-new-model/SKILL.md` dẫn từng bước thêm kiến trúc model mới, kèm ràng buộc đáng nhớ — cấm viết hộ PR description và commit message, bắt disclosure mọi đóng góp có AI, ký `Assisted-by:` thay vì `Co-authored-by:`. Skill yêu cầu đọc `git log` của ít nhất 3 PR thêm model gần nhất, vì log đó "shows current convention more reliably than the docs, which can lag behind" ([SKILL.md @ 1744c6b](https://github.com/ggml-org/llama.cpp/blob/1744c6b/skills/add-new-model/SKILL.md)). Repo 127k★ không tin tài liệu tả convention — nó trỏ agent vào dữ liệu thật.

Sự ngần ngại tin lời agent này không xa lạ gì Wakii: kit 9-agent cũng tách ba quyền PM–developer–tester để không ai tự duyệt việc của mình, như mô tả trong [agents and kit](/vi/docs/agents-and-kit/).

## Wakii học được gì

- **ADOPT — người chịu trách nhiệm cuối, không ai sign hộ**: llama.cpp cấm code "bạn không hiểu được" thay vì cấm AI sinh code; Wakii đã áp cùng nguyên tắc ở "Humans own the irreversibles" — agent đưa story tới trạng thái sạch rồi dừng, merge là gate người thật. Chính sách của repo 127k★ xác nhận tách quyền không phải bảo thủ — người hiểu code là rào chắn duy nhất.
- **ADOPT — convention lấy từ dữ liệu thật, không từ tài liệu**: skill `add-new-model` bắt đọc `git log` của 3 PR gần nhất vì docs lag behind; Wakii Rule 0 cùng tinh thần — verifier đo dist thật thay vì tin lời kể. Checklist review nên trỏ tới ví dụ đã merged gần nhất, không trỏ tới mô tả trong doc.
- **DIRECTION — repo tự ship skill onboarding đóng góp**: `skills/add-new-model` biến convention của repo thành skill agent đọc được. Wakii có thể làm tương tự cho repo sản phẩm: skill "thêm agent/skill mới vào kit" theo convention hiện hành. Chưa làm ngay vì kit phục vụ runtime; contributor ngoài chưa phải use-case chính.
- **WATCH — inference xuống thiết bị edge**: Hexagon cho Snapdragon, WebGPU cho trình duyệt, quant 1-bit — inference giờ tới nổi không GPU. Lên DIRECTION khi một model local chạy trọn một story nhiều gate trên phần cứng ấy — khi đó bài toán đội agent offline mở lại.
- **N/A — kernel quantization và dispatch backend**: score-based selection, super-block 1-bit, hybrid CPU+GPU là hạ tầng tensor; Wakii không chạy model trong tiến trình — đội agent gọi API frontier — nên lớp này không đụng orchestration.

Muốn thấy llama.cpp đứng ở đâu trên bản đồ hệ sinh thái? [Bài tổng quan 50 dự án agentic](/vi/blog/agentic-landscape-50-projects/) xếp nó là "runtime gốc" của local inference, cạnh [Ollama](/vi/blog/deep-dive-ollama-ollama/) ở tầng trải nghiệm. Muốn đội 9-agent chạy thật trên máy bạn, bắt đầu từ [getting started](/vi/docs/getting-started/).
