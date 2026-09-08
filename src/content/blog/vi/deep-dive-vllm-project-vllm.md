---
title: "vLLM: serving LLM thông lượng cao — khi bộ nhớ là nút cổ chai"
description: "PagedAttention quản lý KV-cache như page-table của hệ điều hành. Bên trong vLLM: vì sao throughput của LLM serving là bài toán bộ nhớ, nhịp 8 release trong 90 ngày, và lộ trình từ paper SOSP 2023 tới serving engine 91k stars."
pubDate: "2026-10-12"
category: "tech"
tags: ["architecture", "oss"]
draft: false
---

Khi một LLM phải phục vụ nhiều request cùng lúc, GPU thường không thiếu phép tính — nó thiếu chỗ chứa. Mỗi token được sinh ra kéo theo KV-cache — "tâm trí" của chuỗi trước đó, nằm trên VRAM đắt đỏ. Serving thế hệ trước cấp phát vùng nhớ này theo kiểu đặt trước cả vùng tối đa rồi bỏ phí phần chưa dùng. vLLM, khởi nguồn từ Sky Computing Lab của UC Berkeley, giải bài này bằng cách mượn lại kỹ thuật hệ điều hành đã kiểm chứng: phân trang bộ nhớ.

TL;DR:

- Nút cổ chai của serving LLM không phải FLOPs của GPU mà là VRAM cho KV-cache — cách quản lý bộ nhớ quyết định bao nhiêu request chạy song song.
- PagedAttention chia KV-cache thành block nhỏ cấp phát theo nhu cầu, giống page-table của OS: theo paper SOSP 2023, throughput gấp 2-4 lần các hệ thống cùng thời với waste bộ nhớ gần bằng không.
- Trong code ngày nay vẫn thấy rõ hai kỹ thuật mượn từ OS: free_block_queue sắp theo thứ tự eviction và watermark chống preemption.
- Nhịp phát hành dày và đều: 8 releases trong 90 ngày, bản sửa v0.27.1 ra sau v0.27.0 khoảng nửa ngày (theo GitHub API ngày 2026-09-08).
- Từ một bài báo SOSP 2023 tới engine 91.238 stars: một case paper-to-production mẫu mực.

## Throughput là bài toán bộ nhớ, không phải compute

Decode sinh token tuần tự: mỗi request phải giữ KV của mọi token đã xử lý, vùng nhớ phình theo độ dài context. Chạy một request trên máy cá nhân ít khi đụng trần; bài toán xuất hiện khi serving nhiều request — điểm tách bài này khỏi công cụ chạy LLM local một người dùng. Thế hệ serving trước yêu cầu mỗi request đặt trước một vùng nhớ liền theo độ dài tối đa cho phép. Độ dài thật thường ngắn hơn nhiều, phần chênh thành nhớ chết; cộng phân mảnh khi request vào ra không đều, dung lượng dùng được cho batch giảm mạnh — batch nhỏ nghĩa là throughput thấp. Paper gốc gọi thẳng nguyên nhân: bộ nhớ bị lãng phí bởi phân mảnh và nhân bản dư thừa.

> KV cache memory could be significantly wasted by fragmentation and redundant duplication — abstract của paper PagedAttention, [arxiv.org/abs/2309.06180](https://arxiv.org/abs/2309.06180)

Hai kiểu cấp phát đặt cạnh nhau:

```
Preallocation: mỗi request giữ nguyên vùng max_length
  req A  [██████████░░░░░░░]  dùng 10/17 — 7 slot chết
  req B  [████░░░░░░░░░░░░░]  dùng 4/17 — 13 slot chết

PagedAttention: cấp phát theo block khi cần
  req A  [b0][b1][b2]
  req B  [b3][b4]
  req C  [b5][b6][b7][b8]
  block rảnh về free queue, reuse chéo giữa các request
```

*Source: sơ đồ theo paper SOSP 2023 (arXiv 2309.06180), đối chiếu code vLLM ngày 2026-09-08.*

## PagedAttention: mượn page-table của OS cho KV-cache

Virtual memory của hệ điều hành cho phép mỗi tiến trình thấy địa chỉ liên tục trong khi dữ liệu thật nằm rải trên các page vật lý. PagedAttention làm y hệt với KV-cache: chuỗi token của request nhìn như liền mạch, nhưng dữ liệu nằm rải trong các block vật lý, nối với nhau qua bảng ánh xạ block. Hệ quả trực tiếp: block được cấp phát khi token thật cần, và nhiều sequence có thể cùng trỏ vào một block chứa prompt chung thay vì nhân bản.

Trong code ngày nay, phần quản lý này nằm ở `vllm/v1/core/block_pool.py` — một docstring ngắn nói đủ cách vận hành:

```python
"""BlockPool that manages KVCacheBlocks.
It provides methods to allocate, free and cache the kv cache blocks. The
free_block_queue stores the free blocks in eviction order to enable
allocation, free, and cache eviction."""
```

*Source: `vllm/v1/core/block_pool.py` @ commit `13cf9e0`, theo GitHub API ngày 2026-09-08 — [github.com/vllm-project/vllm/blob/13cf9e05c1eda0bfe5cbfb9344343ca2737d0723/vllm/v1/core/block_pool.py](https://github.com/vllm-project/vllm/blob/13cf9e05c1eda0bfe5cbfb9344343ca2737d0723/vllm/v1/core/block_pool.py)*

Ai từng đọc source của một allocator nhận ra ngay cấu trúc này: free list + bảng băm + thứ tự eviction — không ngẫu nhiên, vì bài báo gốc viết theo khung "một hệ điều hành cho LLM serving" và code giữ nguyên khung đó.

## Hai kỹ thuật nữa mượn từ OS: prefix cache và watermark

Cặp tiếp theo nằm trong `vllm/v1/core/kv_cache_manager.py`. Thứ nhất, prefix cache: engine tìm đoạn dài nhất của prompt đã có KV trong cache, lấy theo block-aligned — giống page cache hit của OS. Các request chia sẻ một system prompt dài dùng lại phần chung thay vì tính lại. Note trong code cho thấy ranh giới cơ chế:

```python
# NOTE: When all tokens hit the cache, we must recompute the last token
# to obtain logits. Thus, set max_cache_hit_length to prompt_length - 1.
```

*Source: `vllm/v1/core/kv_cache_manager.py` @ commit `13cf9e0`, theo GitHub API ngày 2026-09-08 — [github.com/vllm-project/vllm/blob/13cf9e05c1eda0bfe5cbfb9344343ca2737d0723/vllm/v1/core/kv_cache_manager.py](https://github.com/vllm-project/vllm/blob/13cf9e05c1eda0bfe5cbfb9344343ca2737d0723/vllm/v1/core/kv_cache_manager.py)*

Thứ hai, watermark: khi nhận thêm request, manager giữ một số lượng block trống tối thiểu. Ý đồ ghi ngay trong comment:

```python
# Watermark: minimum number of KV cache blocks to keep free when
# admitting waiting/preempted requests, to avoid frequent preemptions.
```

*Source: như link trên, cùng file.*

Không có mức trống này, hệ thống nhận thêm request rồi thu hồi block giữa chừng liên tục — thrashing, điều kernel tránh khi quản lý free pages. Hai chi tiết nhỏ, một nguồn gốc: kỷ luật tài nguyên của hệ điều hành.

## Nhịp release: 8 bản trong 90 ngày

Dự án lớn dễ sa vào nhịp release thưa; vLLM đi ngược lại — 15 bản gần nhất từ v0.19.1 (18-04) tới v0.28.0 (26-08), trong đó 8 release nằm gọn trong 90 ngày, trung bình hơn một bản mỗi hai tuần:

| Tag | Ngày phát hành |
| --- | --- |
| v0.28.0 | 2026-08-26 |
| v0.27.1 | 2026-08-11 |
| v0.27.0 | 2026-08-10 |
| v0.26.0 | 2026-07-27 |
| v0.25.1 | 2026-07-14 |
| v0.25.0 | 2026-07-11 |
| v0.24.0 | 2026-06-29 |
| v0.23.0 | 2026-06-15 |

*Source: `gh api "repos/vllm-project/vllm/releases?per_page=15"`, theo GitHub API ngày 2026-09-08.*

Chi tiết đáng chú ý hơn số lượng: v0.27.1 ra sau v0.27.0 khoảng nửa ngày — bản sửa cắt ngay khi phát hiện lỗi, không chờ đợt kế. Wakii theo cùng triết lý nhỏ-nhanh: hai bản desktop 1.4.198 và 1.4.199 cùng ngày 05-09, mỗi bản gắn một tập tính năng có kiểm chứng — inventory release của Wakii rà từng dòng đã có [bài riêng](/vi/blog/oss-release-roundup-14x/).

## Từ paper SOSP 2023 tới serving engine 91k stars

Paper PagedAttention công bố tại SOSP 2023, và citation của nó nằm ngay trong README — dòng dự án hiếm: ý tưởng học thuật thành hạ tầng mà ecosystem dựng trên đó. Sức sống hiện tại theo GitHub API ngày 2026-09-08:

| Chỉ số | Giá trị |
| --- | --- |
| Stars | 91.238 |
| License | Apache-2.0 |
| Contributors | hơn 2.000 (theo README) |
| Model architectures hỗ trợ | hơn 200 (theo README) |
| Commit gần nhất | 2026-09-08 — đúng ngày research |

*Source: `gh api repos/vllm-project/vllm` + README, theo GitHub API ngày 2026-09-08.*

README mở đầu bằng câu định vị gọn: "Easy, fast, and cheap LLM serving for everyone" ([repo vllm-project/vllm](https://github.com/vllm-project/vllm)). API tương thích OpenAI khiến client viết theo chuẩn OpenAI kết nối được ngay — lý do một engine thành lựa chọn mặc định thường là chỗ dựa hệ sinh thái, không phải một benchmark đơn lẻ.

Wakii không chạy GPU cũng không serving model, nhưng bài học tổ chức thì gần: quy trình idea → plan → epic → SF → gates cũng được thiết kế quanh một nguồn lực khan hiếm — context của agent — với kiểm chứng ở mỗi bước, mô tả trong [docs story-workflow](/vi/docs/story-workflow/).

## Wakii học được gì

- **ADOPT — mượn abstraction đã kiểm chứng thay vì phát minh từ đầu.** vLLM lấy page-table của OS làm khung cho KV-cache; Wakii đã đi cùng hướng khi mượn gates từ CI (đọc thêm [bài phân tích CI gates](/vi/blog/arch-ci-gates/)) và worktree từ git cho story-workflow. Đề xuất: khi thiết kế cơ chế mới, quét trước pattern cổ điển của hệ điều hành/cơ sở dữ liệu (refcount, idempotency log, watermark) — mỗi pattern là câu trả lời có sẵn cho một lớp bài toán đã xảy ra.
- **DIRECTION — kỷ luật cadence có lịch và hotfix nhanh.** vLLM giữ nhịp hơn một bản mỗi hai tuần và cắt bản sửa sau khoảng nửa ngày; Wakii đã phát hành hai bản trong một ngày nhưng nhịp giữa các đợt chưa đều — đáng cân nhắc chốt nhịp tối thiểu cho dòng release desktop + mobile thay vì theo đợt tính năng.
- **WATCH — vLLM là lựa chọn mặc định nếu Wakii cần local inference đa session.** vLLM mạnh ở serving đồng thời; Wakii hiện điều phối agent qua API cloud nên chưa chạm tới. Điều kiện chuyển thành DIRECTION: có tính năng chạy model local với nhiều session cùng lúc.
- **N/A — tối ưu tầng kernel.** CUDA kernel, quantization, CUDA graph: ngoài product surface của Wakii, vốn không tự viết hạ tầng GPU.

Nếu bạn đang tìm một cách điều phối agent AI có gates, evidence và quy trình rõ ràng, thử Wakii — hoặc đọc [docs getting-started](/vi/docs/getting-started/) để chạy story đầu tiên.
