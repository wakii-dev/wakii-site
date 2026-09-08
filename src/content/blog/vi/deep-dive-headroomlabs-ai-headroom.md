---
title: "Headroom: lớp nén ngữ cảnh cho agent code"
description: "Headroom nén tool output, log và lịch sử hội thoại của agent trước khi chúng tới model — cùng câu trả lời, một phần token. Bên trong: kiến trúc, hai bất biến an toàn, một bản tự audit công khai."
pubDate: "2026-10-07"
category: "tech"
tags: ["agents", "memory", "features"]
draft: false
---

Agent code tốn tiền không chỉ vì model đắt, mà vì ngữ cảnh bẩn. Một lệnh search trả về trăm kết quả JSON; một log dump nặng vài chục nghìn token; phần lớn là nhiễu lặp lại. Model đọc cả, bạn trả tiền cho cả — và đôi khi vẫn bỏ sót đúng dòng FATAL giữa đống nhiễu. Headroom đánh vào đúng điểm đó: nén mọi thứ agent đọc trước khi chúng tới model, ngay trên máy bạn.

TL;DR:

- Agent trả tiền cho ngữ cảnh, không chỉ cho câu trả lời — tool output thô là kẻ chiếm chỗ lớn nhất trong window.
- Headroom: một router nhận diện loại nội dung, ba bộ nén chuyên dụng (JSON, code, prose) và kho bản gốc để lấy lại khi cần.
- Hai bất biến giữ an toàn: tool_use và tool_result được xử lý như một cặp; dòng chứa từ khoá lỗi được bảo toàn nguyên văn.
- Ba MCP tool — headroom_compress, headroom_retrieve, headroom_stats — mở lớp nén cho MCP client.
- Repo 70.491 sao, Apache-2.0 (theo GitHub API ngày 2026-09-08), tự audit mình công khai và viết lại theo kế hoạch 9 phase.

## Kinh tế học của context window

Một turn của agent mang toàn bộ ngữ cảnh tới provider: system prompt, định nghĩa tool, lịch sử, kết quả tool. Phần phình nhanh nhất là tool output thô — log, kết quả search, dump JSON. Chúng vào window một lần rồi ở đó suốt phiên, và mỗi turn sau vẫn trả tiền vận chuyển.

```
  window của một turn agent
  +--------------------------------------------+
  | system prompt + tools        | ổn định     |
  | lịch sử hội thoại            | phình dần   |
  | tool output (log, JSON)      | <<< kẻ chiếm chỗ
  | câu hỏi hiện tại             | nhỏ         |
  +--------------------------------------------+
```

README của repo tóm gọn phạm vi: "Headroom compresses everything your AI agent reads — tool outputs, logs, RAG chunks, files, and conversation history — before it reaches the LLM." (README của headroomlabs-ai/headroom: [github.com/headroomlabs-ai/headroom](https://github.com/headroomlabs-ai/headroom)). Cụm "everything your agent reads" là đích của thiết kế: đối tượng nén là toàn bộ dòng tiếp liệu vào context.

Chi phí còn mặt thứ hai: phần model viết ra — README ghi output đắt gấp 5 lần input trên model cỡ Opus, và một phần là ceremony: câu mở đầu lịch sự, code in lại nguyên văn.

## Router, ba bộ nén và kho bản gốc

Kiến trúc lõi là một đường ống: ContentRouter nhận diện loại nội dung rồi chọn bộ nén — SmartCrusher cho JSON, CodeCompressor cho code qua AST, Kompress-v2-base (model nhỏ chạy local) cho prose. Trước router, CacheAligner đánh dấu nội dung hay đổi — phần sẽ làm vỡ KV-cache prefix của provider; nó không sửa prompt.

Đầu thú vị nhất là CCR: bản gốc của mọi nội dung đã nén được lưu cục bộ, model gọi headroom_retrieve để lấy lại khi cần. Nén theo thiết kế này không phải mất thông tin — mà là dời thời điểm đọc sang lúc thật cần.

Số tiết kiệm do chính repo công bố, từ README truy ngày 2026-09-08 (benchmark seed offline, đo bằng tokenizer của provider, chạy lại được bằng lệnh họ cấp):

| Kịch bản | Trước | Sau | Tiết kiệm |
|---|---:|---:|---:|
| Code search (100 kết quả) | 17.199 | 13.597 | 21% |
| Debug sự cố SRE | 55.957 | 24.340 | 57% |
| Khám phá codebase | 58.801 | 33.895 | 42% |
| Phân loại GitHub issue | 46.067 | 32.429 | 30% |

Độ trễ: 0,21 ms p50 với JSON 10K token, 1,4 ms ở 100K (README). Mức tiết kiệm phụ thuộc độ lặp: JSON và log lặp nhiều vượt 90%, prose đậm đặc gần như không nén được — khai báo trung thực hiếm thấy trong một danh mục tính năng.

## Nén mà không phá hội thoại: hai bất biến

Nén ngữ cảnh agent dễ hỏng theo cách tinh vi hơn mất chữ: hỏng giao thức. Core Rust của headroom giữ hai bất biến đáng học.

Bất biến thứ nhất: cặp tool_use — tool_result là một đơn vị. Comment của module safety.rs ghi lý do: "compressing one but not the other desynchronizes the conversation and a re-replay of the tool response will mismatch the call id" ([safety.rs @ e67b3c8](https://github.com/headroomlabs-ai/headroom/blob/e67b3c8a29443a60d6b0018fb22f525c5cd7e709/crates/headroom-core/src/transforms/safety.rs)). Nén một nửa bỏ nửa kia, request sau trả 400 upstream. Mã hoá ý đó chỉ là một bảng bấm id:

```rust
pub struct ToolPair {
    pub assistant_index: usize,
    pub response_index: usize,
}
```

Bất biến thứ hai: dòng lỗi được bảo toàn. Module error_keywords.rs định nghĩa đúng 12 từ khoá — error, exception, failed, failure, critical, fatal, crash, panic, abort, timeout, denied, rejected — và mọi item chứa chúng được giữ nguyên trước khi phần còn lại bị nén. Lý do nằm ngay trong comment: "better to over-preserve than to drop a real error item" ([error_keywords.rs @ e67b3c8](https://github.com/headroomlabs-ai/headroom/blob/e67b3c8a29443a60d6b0018fb22f525c5cd7e709/crates/headroom-core/src/transforms/smart_crusher/error_keywords.rs)). Triết lý này giải thích demo đầu README: log 10.144 token nén còn 1.260, và dòng FATAL sống sót nguyên văn.

```rust
pub const ERROR_KEYWORDS: &[&str] = &[
    "error", "exception", "failed", "failure",
    "critical", "fatal", "crash", "panic",
    "abort", "timeout", "denied", "rejected",
];
```

## Bên MCP: ba tool của một lớp cung ứng

Headroom phân phối qua bốn mode — library, proxy, wrap agent, MCP server — nhưng mode MCP lộ bài toán rõ nhất. Docstring của server.py gọi thẳng: tool output của MCP là "the PERFECT use case for Headroom" — dữ liệu lớn, có cấu trúc, phần lớn là nhiễu với ít item quan trọng ([server.py @ e67b3c8](https://github.com/headroomlabs-ai/headroom/blob/e67b3c8a29443a60d6b0018fb22f525c5cd7e709/headroom/integrations/mcp/server.py)).

Server mở ra ba tool: headroom_compress nén tool result trước khi vào context; headroom_retrieve lấy lại bản gốc từ kho CCR; headroom_stats thống kê tiết kiệm. Host app bọc transport của MCP client; kết quả từ server khác — database, Slack, GitHub — đi qua lớp nén trước khi chạm context. Cùng tầng này, repo thử ý lớn hơn: cross-agent memory — một kho chia sẻ cho nhiều CLI (Claude, Codex, Gemini, Grok) kèm dedup tự động, thay vì mỗi agent một hòn đảo ngữ cảnh.

## Một repo tự audit mình công khai

Điều hiếm nhất của repo không phải con số sao, mà là thư mục REALIGNMENT ngay gốc: bản tự audit công khai kết luận chính sản phẩm đang xây trên mental model sai. Model cũ coi nén là chọn cái gì bỏ khỏi lịch sử; audit chỉ ra nó làm vỡ prompt cache của khách, liệt kê 5 bug hạng nặng, khoảng 10.000 dòng thừa, rồi đề ra kế hoạch 9 phase, 40 PR. Model mới gói trong một câu: "passthrough is sacred; compress only the live zone, type-aware, hash-keyed, position-preserving, with side-channel metadata" ([REALIGNMENT/00-overview.md @ e67b3c8](https://github.com/headroomlabs-ai/headroom/blob/e67b3c8a29443a60d6b0018fb22f525c5cd7e709/REALIGNMENT/00-overview.md)).

Nhịp ship tương xứng: 6 release trong tuần 2026-08-21 đến 2026-08-27 (v0.36.1 → v0.37.0); lần push gần nhất 2026-09-07 (theo GitHub API ngày 2026-09-08).

## Wakii học được gì

- **ADOPT — bảo toàn lỗi nguyên văn trong story memory.** Nguyên tắc over-preserve ở section hai bất biến áp thẳng vào post-task ritual: mục "what went wrong" nên chép nguyên văn dòng lỗi và lệnh gây lỗi thay vì paraphrase — SF kế tiếp cần chuỗi chính xác để tra cứu, tái hiện. Biên độ hẹp: một dòng lỗi, một lệnh mỗi entry.
- **DIRECTION — cấu trúc stable-prefix/live-tail cho context pack.** Wakii đã có context pack (analyze once, inherit many); Headroom thêm một trục: phần ổn định của ngữ cảnh không bị biến đổi, chỉ nén phần đầu hay đổi — tool dump. Áp thử khi pack kèm output lớn; điều kiện lên ADOPT: đo được chi phí token trước và sau.
- **WATCH — nén chiều output và cross-agent memory.** Output shaping phụ thuộc tham số provider đang đổi nhanh; memory dùng chung giữa nhiều agent vượt phạm vi một phiên. Lên DIRECTION khi cơ chế ổn trên ít nhất hai provider mà không vỡ cache prefix.

Workflow của Wakii chạm cùng bài toán từ phía tuyển chọn: context pack quyết định cái gì vào ngữ cảnh của từng SF, Headroom quyết định mỗi thứ nặng bao nhiêu token — hai đầu một bài toán khan hiếm. Đọc cách workflow này tổ chức ngữ cảnh trong [story workflow](/vi/docs/story-workflow/), và xem một vòng lặp tương tự — học từ session lỗi rồi ghi lại — trong [story memory và learning loop](/vi/blog/story-memory-learning-loop/). Wakii là agentic IDE với đội superpowers có sẵn: tải về, để agent chạy với ngữ cảnh đúng.
