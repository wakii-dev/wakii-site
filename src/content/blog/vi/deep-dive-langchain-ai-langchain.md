---
title: "LangChain: từ thư viện chains tới hệ sinh thái agent"
description: "LangChain 145.927 sao, license MIT: bản 1.x tách toàn bộ chains cũ sang langchain-classic và giữ lại đúng agent runtime — create_agent, middleware, LangGraph, LangSmith. Một bài học kiến trúc về cách framework tự cắt bớt chính mình."
pubDate: "2026-10-02"
category: "tech"
tags: ["agents", "architecture", "oss", "workflow"]
draft: false
heroImage: "/blog/heroes/deep-dive-langchain-ai-langchain.png"
---

Ít dự án mã nguồn mở nào bị phán xét nhiều như LangChain: sinh ra năm 2022 như bộ glue nối LLM với dữ liệu, dính tiếng xấu "wrapper dày", rồi bốn năm sau vẫn đứng đó với 145.927 sao và license MIT — theo GitHub API ngày 2026-09-08. Điều đáng đọc không phải con số sao, mà là cấu trúc thư mục của repo hôm nay: nó tự kể chuyện một thư viện chains đã tự cắt bớt chính mình để thành nền tảng agent. Nhánh chính đẩy commit đúng ngày probe (08-09-2026) — đây không phải hiện trường bỏ hoang. Bài này đọc LangChain như một tài liệu kiến trúc sống, và ghi lại những gì Wakii học được.

TL;DR:

- `langchain-ai/langchain`: 145.927 sao, 24.372 forks, MIT, 458 issue mở — theo GitHub API ngày 2026-09-08; repo tạo 17-10-2022 và vẫn đẩy commit đều.
- Bản 1.4.0: package `langchain` chỉ còn agent runtime — `agents`, `chat_models`, `embeddings`, `mcp`, `tools`; toàn bộ chains cũ tách sang package `langchain-classic`.
- `create_agent` là API trung tâm: một hàm dựng, dựng trên StateGraph của LangGraph, trace qua LangSmith.
- 24 module middleware biến hành vi agent — human-in-the-loop, summarization, retry, PII — thành tầng lắp ghép, không hard-code trong lõi.
- Nhịp release kiểu monorepo: mỗi package một version riêng; `langchain` đi từ 1.3.16 tới 1.4.0 trong 14 ngày.

## Cấu trúc repo nói thay lời

Mở thư mục `libs/` của repo ở commit `e670c7a`, bạn thấy ngay sự phân định mà nhiều dự án chỉ nói trong changelog:

```
libs/
├── core/            → langchain-core: schema message, runnables, agents.py cũ
├── langchain_v1/    → package "langchain" 1.4.0 — agent runtime
├── langchain/       → package "langchain-classic" 1.0.8 — chains cũ
├── partners/        → integration theo từng provider
├── text-splitters/  → tiện ích chia văn bản
├── model-profiles/  → profile năng lực từng model
└── standard-tests/  → bộ test chuẩn cho mọi integration
```

Dòng quan trọng nhất nằm trong hai file `pyproject.toml`. Thư mục `libs/langchain_v1` khai báo `name = "langchain"` — version 1.4.0, chỉ gồm bảy module: `agents`, `chat_models`, `embeddings`, `mcp`, `messages`, `rate_limiters`, `tools`. Còn thư mục `libs/langchain` đã đổi thành `langchain-classic` 1.0.8, nơi toàn bộ chains thời đầu được gom lại ([pyproject của langchain v1](https://github.com/langchain-ai/langchain/blob/e670c7a/libs/langchain_v1/pyproject.toml), [pyproject của classic](https://github.com/langchain-ai/langchain/blob/e670c7a/libs/langchain/pyproject.toml) — theo tree ngày 2026-09-08).

Nghĩa là: tên package `langchain` trên PyPI hôm nay không còn chứa chains. Cú cắt thậm chí được ghi ngay trong code cũ — file `agents.py` của `langchain-core` mở đầu bằng cảnh báo rằng schema ở đó chỉ để giữ tương thích ngược, và trích nguyên văn: "New agents should be built using the `langchain` library" ([langchain-core/agents.py](https://github.com/langchain-ai/langchain/blob/e670c7a/libs/core/langchain_core/agents.py)). Người duy trì repo không âm thầm bỏ rơi đường cũ; họ đánh dấu rõ đường cũ và chuyển hướng API chính thức.

## create_agent — một hàm dựng trên LangGraph

Surface của agent API bản 1.x đủ nhỏ để đọc hết trong một cái liếc: file `__init__.py` của module `agents` chỉ export đúng hai tên — `create_agent` và `AgentState` ([agents/__init__.py](https://github.com/langchain-ai/langchain/blob/e670c7a/libs/langchain_v1/langchain/agents/__init__.py), tree ngày 2026-09-08).

Phần chi tiết nằm trong `factory.py`, và những dòng import cho biết ai đang gánh phần nặng:

```python
from langgraph.graph.state import StateGraph
from langgraph.prebuilt.tool_node import ToolNode
from langsmith import traceable
from langchain.chat_models import init_chat_model
```

([agents/factory.py](https://github.com/langchain-ai/langchain/blob/e670c7a/libs/langchain_v1/langchain/agents/factory.py) — trích ngắn phục vụ phân tích, tree ngày 2026-09-08)

`create_agent` không tự chế runtime: nó dựng graph state trên LangGraph, dùng ToolNode có sẵn để chạy tool, và bọc trace qua decorator `traceable` của LangSmith. Ba sản phẩm, ba vai — runtime, observability, interface — thay vì nhồi vào một monolith. README của repo gọi bản thân bằng đúng bốn từ: "The agent engineering platform." (LangChain README, [github.com/langchain-ai/langchain](https://github.com/langchain-ai/langchain)) — và cấu trúc trên là thứ hậu thuẫn câu tagline đó.

## Middleware — hành vi agent là tầng lắp ghép

Thư mục `agents/middleware/` chứa 24 module, mỗi module một hành vi, xếp quanh lõi agent như những lớp tùy chọn ([agents/middleware/](https://github.com/langchain-ai/langchain/blob/e670c7a/libs/langchain_v1/langchain/agents/middleware/) — tree ngày 2026-09-08):

| Nhóm | Middleware |
|---|---|
| Điều phối model | `model_retry`, `model_fallback`, `model_call_limit`, `provider_tool_search` |
| Giữ ngữ cảnh | `summarization`, `context_editing`, `todo`, `file_search` |
| Chặn và hỏi người | `human_in_the_loop`, `tool_error`, `tool_retry`, `pii`, `shell_tool` |
| Giới hạn chi phí | `tool_call_limit`, `tool_selection`, `tool_emulator` |

Ví dụ rõ nhất là `human_in_the_loop`: middleware này import `interrupt` từ LangGraph — cơ chế dừng graph giữa chừng để chờ input — và định nghĩa `ActionRequest` gồm ba trường: `name`, `args`, `description` ([human_in_the_loop.py](https://github.com/langchain-ai/langchain/blob/e670c7a/libs/langchain_v1/langchain/agents/middleware/human_in_the_loop.py)). Trước mỗi tool call rủi ro, agent dừng, đưa ra yêu cầu hành động có cấu trúc, và chỉ chạy tiếp sau khi người duyệt. Đó chính là một decision gate — nhưng đặt đúng chỗ: một middleware tháo lắp được, không phải điều kiện `if` chôn trong lõi agent.

Cách cắt này có hậu quả kiến trúc rõ: lõi agent gọn và ít đổi; hành vi nằm ở rìa, hoán đổi được, test riêng được. Một middleware hỏng là một file hỏng, không phải cả runtime.

## Hệ sinh thái quanh runtime và nhịp release

README liệt kê vòng sản phẩm quanh runtime: Deep Agents — package cấp cao cho agent có sẵn planning, subagents, truy cập file system; LangGraph — orchestration cấp thấp; LangSmith — evals, observability, debug; cùng LangSmith Deployment để chạy agent stateful lâu dài (README, [github.com/langchain-ai/langchain](https://github.com/langchain-ai/langchain), ngày 2026-09-08). Lớp model thì `init_chat_model("openai:gpt-5.5")` nói hộ: đổi provider là đổi một chuỗi, không đổi kiến trúc.

Nhịp release cũng mang hình dạng monorepo. Theo GitHub API ngày 2026-09-08, mười lăm release gần nhất cho thấy `langchain` đi từ 1.3.16 (2026-08-20) qua 1.3.17, 1.3.18, bốn bản alpha 1.4.0 (2026-08-27 tới 2026-09-02) tới 1.4.0 chính thức (2026-09-03); `langchain-core` nhả 1.6.2 ngày 2026-09-04. Mỗi package version riêng, patch mỗi vài ngày, chu kỳ alpha gần như hằng ngày trước bản lớn — đây là repo được bảo trì như một hệ sinh thái nhiều sản phẩm, không phải một thư viện đơn.

Wakii cũng đi trên nguyên tắc "hành vi nằm ở rìa": đội 9 agent và các gate của [story workflow](/vi/docs/story-workflow/) hoạt động nhờ những skill được nạp theo nhu cầu từ kit, thay vì một lõi phình to ([agents-and-kit](/vi/docs/agents-and-kit/)). Cách LangChain v1 tổ chức code là một lời xác nhận từ một codebase lớn hơn rất nhiều.

## Wakii học được gì

- **ADOPT** — dừng có cấu trúc để chờ người: middleware `human_in_the_loop` dừng agent trước tool call rủi ro bằng `interrupt` kèm `ActionRequest` (tên action + args + mô tả). Wakii đã áp cùng nguyên tắc ở tầng quy trình: gates B0–B5 của story workflow dừng agent tại điểm cần quyết, gate dạng choice/free-text kèm đủ ngữ cảnh. Đề xuất cụ thể: lấy shape `ActionRequest` làm schema tham chiếu cho payload gate trong kit, để mọi executor trả ngữ cảnh quyết định theo một dạng thống nhất.
- **DIRECTION** — hoán đổi model qua interface chuẩn: `init_chat_model` nhận provider bằng một chuỗi, và các middleware `model_retry`/`model_fallback` xử lý lỗi cấp model ở rìa. Kit Wakii hiện ghép chặt một agent runtime; hướng đáng cân nhắc là tách lớp gọi model để kit không phải viết lại khi cần chạy đa provider.
- **WATCH** — cắt legacy thành package riêng (`langchain-classic` 1.0.8): cách giữ tương thích mà vẫn tiến tới v1. Nếu `langchain-classic` ổn định quanh 1.0.x, bài học "cắt để tiến" đáng đưa vào quy hoạch kit. Theo dõi thêm Deep Agents — agent có sẵn planning và subagents — vì nó đụng đúng tầng mà story team của Wakii đang chiếm.

Gate của Wakii vốn dừng để chờ người giống middleware của LangChain — tải Wakii và bắt đầu từ [getting started](/vi/docs/getting-started/) để thấy đội 9 agent chạy trong khi bạn giữ mọi quyết định.
