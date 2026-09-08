---
title: "Ollama: chạy LLM local trong một lệnh — rồi cả coding agent"
description: "Phía sau lệnh ollama run là một scheduler fit VRAM thật; và từ 2026, ollama launch claude còn wire thẳng Claude Code về model local của bạn."
pubDate: "2026-10-02"
category: "tech"
tags: ["cli", "architecture", "agents", "oss"]
draft: false
heroImage: "/blog/heroes/deep-dive-ollama-ollama.png"
---

Cài một LLM để chạy trên máy mình từng là buổi chiều vật lộn với CUDA driver. Ollama gói phần khó chịu đó còn lại đúng một dòng lệnh — nhưng một lệnh không có nghĩa là một hệ thống đơn giản. Phía sau `ollama run` là một scheduler quyết định model nào vừa VRAM, bao nhiêu model được nạp cùng lúc, và đuổi model nào khi bộ nhớ cạn. Và từ 2026, repo 180.451★ này (theo GitHub API ngày 2026-09-08) làm được việc khác hẳn: launch thẳng coding agent — Claude Code, Codex — chạy trên model local của bạn. Bài này mổ xẻ cả hai tầng đó bằng code thật trong repo.

TL;DR:

- Một lệnh `ollama run <model>` kéo theo cả pipeline: tải manifest + layer từ registry, probe GPU, fit vào VRAM, mở REST API tại 127.0.0.1:11434.
- Scheduler trong `server/sched.go` nạp một model mỗi lần, mặc định 3 model mỗi GPU, và khi load crash vì hết VRAM thì evict toàn bộ rồi thử lại — có chặn chống lặp vô hạn.
- Điểm mới 2026: `ollama launch claude` wire Claude Code vào model local bằng environment variables, route cả ba tier Opus/Sonnet/Haiku về một model duy nhất.
- Nhịp ship rất dày: 10 releases trong 22 ngày (14-08 → 05-09-2026, theo GitHub API ngày 2026-09-08), repo là mã nguồn mở MIT.

## Một lệnh, ba tầng bên dưới

Cài đặt là một dòng: `curl -fsSL https://ollama.com/install.sh | sh`. Sau đó README hứa đúng thứ mà cả bài này kiểm chứng: chạy `ollama` là được "prompted to run a model or connect Ollama to your existing agents" — hoặc gõ thẳng `ollama run gemma4`. Ba chuyện xảy ra dưới mui xe:

```
ollama run gemma4
   |
   |-- pull manifest --> liet ke layer blobs; blob da co tren dia thi dung lai
   |
   |-- discover/ ------> probe GPU: CUDA, AMD, Vulkan, Metal, Jetson + RAM trong
   |
   |-- server/sched.go > fit VRAM --> nap qua backend llama.cpp hoac MLX
   |
   v
REST API tai 127.0.0.1:11434  (ca dialect OpenAI lan Anthropic)
```

Tải model theo manifest nghĩa là layer nào đã nằm trên đĩa thì bỏ qua — logic đó nằm trong `server/images.go` (kèm comment "the blob now exists on disk from the first download" tại [images.go @ 83ed7d9](https://github.com/ollama/ollama/blob/83ed7d9/server/images.go)). Phần cứng được phát hiện bởi thư mục `discover/`: mỗi backend một file (`amd.go`, `vulkan.go`, `gpu_darwin.go` cho Metal), kèm cả nhánh riêng cho Jetson qua biến môi trường `JETSON_JETPACK` — xem [gpu.go @ 83ed7d9](https://github.com/ollama/ollama/blob/83ed7d9/discover/gpu.go). Cổng mặc định 127.0.0.1:11434 được khai trong [envconfig/config.go @ 83ed7d9](https://github.com/ollama/ollama/blob/83ed7d9/envconfig/config.go). Toàn bộ viết bằng Go, repo công khai từ 26-06-2023, commit mới nhất 07-09-2026 (theo GitHub API ngày 2026-09-08).

## Scheduler: vừa VRAM mới được lên

Phần thú vị nhất của repo nằm ở `server/sched.go` — 1.785 dòng điều phối. Nguyên tắc đầu tiên: mỗi GPU chịu tối đa một số model nhỏ:

```go
// Default automatic value for number of models we allow per GPU
// Model will still need to fit in VRAM, but loading many small models
// on a large GPU can cause stalling
var defaultModelsPerGPU = 3
```

(đoạn trích từ [sched.go @ 83ed7d9](https://github.com/ollama/ollama/blob/83ed7d9/server/sched.go) — bình luận gốc của repo)

Mỗi request đi qua struct `LlmRequest`, và scheduler ghi rõ trong code những gì nó tự quyết thay người dùng: `numCtxAuto` là true khi số context window đến từ "Ollama's automatic VRAM-tier default" chứ không phải người dùng chỉ định. Khi một lần nạp model crash vì thiếu bộ nhớ, scheduler đi vào nhánh evict-all-and-retry: xả toàn bộ model đang nạp, thử lại — và cờ `oomRetryAttempted` chặn đúng một lần retry để không rơi vào vòng lặp vô hạn. Hết đường thì thất bại thành tiếng: `ErrMaxQueue` với câu chữ "server busy, please try again. maximum pending requests exceeded" — không có lệnh nào bị nuốt im lặng.

Đó là triết lý của cả repo: máy thật giới hạn bao nhiêu thì báo thật bấy nhiêu, thay vì hứa trước và treo sau.

## 2026: từ model server thành launchpad cho agent

README mô tả repo là "Get up and running with Kimi-K2.6, GLM-5.2, MiniMax, DeepSeek, gpt-oss, Qwen, Gemma and other models" — nhưng phần mới nhất mới đáng chú ý với người làm agent. Lệnh `ollama launch claude` làm hai chuyện: nếu máy chưa có Claude Code, nó hỏi xác nhận rồi tự cài; nếu đã có, nó chỉ set environment variables rồi spawn. Toàn bộ "wire" nằm gọn trong một hàm:

```go
// modelEnvVars returns Claude Code env vars that route all model tiers through Ollama.
func (c *Claude) modelEnvVars(model string) []string {
	env := []string{
		"ANTHROPIC_DEFAULT_OPUS_MODEL=" + model,
		"ANTHROPIC_DEFAULT_SONNET_MODEL=" + model,
		"ANTHROPIC_DEFAULT_HAIKU_MODEL=" + model,
		"CLAUDE_CODE_SUBAGENT_MODEL=" + model,
	}
	// ...
}
```

([claude.go @ 83ed7d9](https://github.com/ollama/ollama/blob/83ed7d9/cmd/launch/claude.go))

Không fork, không patch agent — Claude Code vẫn nguyên bản, chỉ được trỏ `ANTHROPIC_BASE_URL` về server local, và cả ba tier model (Opus/Sonnet/Haiku) lẫn model cho subagent cùng đổ về một model duy nhất của bạn. Thư mục `cmd/launch/` đếm được 18 file integration theo cùng mẫu này (Claude Code, Codex, Copilot, OpenCode, Cline, Droid, DeepSeek Harness, Kimi, Qwen…) tại clone ngày 08-09-2026 — README chính thức liệt kê 6 integration đầu. Server cũng nói được cả tiếng Anthropic API, không chỉ tiếng OpenAI: thư mục `anthropic/` với 1.307 dòng Go ([anthropic.go @ 83ed7d9](https://github.com/ollama/ollama/blob/83ed7d9/anthropic/anthropic.go)).

Một chi tiết nhỏ nhưng đáng nhớ: khi cần biết context window, `ollama launch` không đọc số lý thuyết trên model card mà hỏi thẳng server đang chạy — model đang nạp với context bao nhiêu thì báo bấy nhiêu, vì "VRAM fit or server configuration may hold below the model's trained maximum" ([context_window.go @ 83ed7d9](https://github.com/ollama/ollama/blob/83ed7d9/cmd/launch/context_window.go)). Không xác định được thì trả về 0, không đoán.

## Nhịp ship: 10 releases trong 22 ngày

Repo sống đúng kiểu hạ tầng được chăm hằng ngày. 10 releases gần nhất theo GitHub API ngày 2026-09-08:

| Tag | Ngày phát hành |
|---|---|
| v0.34.0-rc1 | 2026-09-05 |
| v0.33.3 | 2026-09-02 |
| v0.33.2 | 2026-08-27 |
| v0.33.1 | 2026-08-26 |
| v0.33.0 | 2026-08-21 |
| v0.32.15 | 2026-08-19 |
| v0.32.14 | 2026-08-15 |
| v0.32.13 | 2026-08-14 |
| v0.32.12 | 2026-08-14 |
| v0.32.11 | 2026-08-14 |

Ba releases trong đúng một ngày 14-08. Cadence này chỉ trụ được nhờ backend được pin như dependency: file `LLAMA_CPP_VERSION` ghi `b10760`, `MLX_VERSION` ghi một commit hash cụ thể ([tại clone 83ed7d9, 08-09-2026](https://github.com/ollama/ollama/blob/83ed7d9/LLAMA_CPP_VERSION)) — nâng runtime inference được pin rõ ràng rồi test riêng, không phải cơ chế "theo đuôi upstream" tự phát.

Xét cho cùng, những cơ chế trên — fit tài nguyên trước khi hứa, báo số thật thay vì số lý thuyết — chính là tinh thần "gates, not trust" mà [story workflow](/vi/docs/story-workflow/) của Wakii dùng để giữ agent trung thực.

## Wakii học được gì

- **ADOPT — báo số thật, trả 0 khi không chắc**: `context_window.go` hỏi server đang chạy để lấy context window được cấp phát thực tế, và trả về 0 thay vì đoán khi không xác định được. Wakii đã áp cùng tinh thần ở Rule 0 (verifier đo dist thật thay vì tin lời agent); điểm đáng học thêm là cách xử lý "không biết" — ghi không-xác-định thành kết quả hợp lệ trong báo cáo gate, không fill số trông cho đẹp.
- **DIRECTION — wire bằng cấu hình thay vì fork**: `ollama launch claude` không sửa một dòng nào của Claude Code, chỉ route mọi tier qua env vars. Wakii có thể làm tương tự: một lệnh trỏ đội 9-agent (xem [agents & kit](/vi/docs/agents-and-kit/)) về endpoint model tự host (Ollama/vLLM) cho môi trường code nhạy cảm, không cần dựng harness riêng. Chưa làm ngay vì chất lượng agentic của local model chưa đủ tin cho story nhiều gate.
- **WATCH — local inference cho agent loop**: Ollama phát triển runtime agent riêng (thư mục `agent/` với session, skills, compactor, approval — [skills.go @ 83ed7d9](https://github.com/ollama/ollama/blob/83ed7d9/agent/skills.go)) là tín hiệu local models tiến gần workload agent. Điều kiện đổi thành DIRECTION: một model local pass trọn một story-verify đa gate — khi đó bài toán "9-agent chạy offline" mở lại nghiêm túc.
- **N/A — scheduler fit VRAM**: evict-and-retry, giới hạn model mỗi GPU, auto context tier là kỹ thuật hạ tầng inference. Wakii không chạy model trong tiến trình app — đội agent gọi API frontier — nên lớp này không đụng tới orchestration của Wakii.

Muốn thấy Ollama đứng ở đâu trên bản đồ hệ sinh thái? [Bài tổng quan 50 dự án agentic](/vi/blog/agentic-landscape-50-projects/) xếp nó vào nhóm local inference, cạnh llama.cpp và vLLM. Còn muốn đội 9-agent chạy thật trên máy bạn, bắt đầu từ [getting started](/vi/docs/getting-started/).
