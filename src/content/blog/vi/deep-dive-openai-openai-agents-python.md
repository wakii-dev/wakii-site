---
title: "OpenAI Agents SDK: agent tối giản theo kiểu OpenAI"
description: "Đọc code OpenAI Agents SDK: một dataclass Agent, handoff là tool có schema, guardrail chạy song song với model, tracing lên hạng sản phẩm riêng. So sánh với cách Wakii đặt gate máy trước gate người."
pubDate: "2026-10-16"
category: "tech"
tags: ["agents", "workflow"]
draft: false
---

Nhiều framework multi-agent giải bài điều phối bằng cách chồng thêm lớp: khai báo vai, runtime actor, hay quy trình chuẩn tài liệu hoá. OpenAI Agents SDK — 29,267 stars, MIT license, theo GitHub API ngày 2026-09-08 — đi theo chiều ngược lại: giữ bề mặt nhỏ nhất có thể. Một agent là một dataclass; một handoff là một tool; một guardrail là một hàm chạy song song; tracing thì được dựng thành hạng mục sản phẩm riêng. Bài này đọc code thật trong `src/agents` (main tại commit `544b8b0`, ngày 2026-09-08) để xem bốn primitive ấy lắp vào nhau ra sao, và Wakii mượn được điều gì về cách đặt gate.

TL;DR:

- Agent là một dataclass duy nhất: instructions, handoffs, guardrails, output_type — bề mặt khái niệm dừng ở đó.
- Handoff không phải cơ chế bí ẩn: nó là một tool có JSON schema; hàm invoke trả về agent kế tiếp.
- Guardrail chạy song song với lệnh gọi model; tripwire nổ là task model bị huỷ ngay tại chỗ.
- Tracing là hạng mục sản phẩm: mỗi primitive có một loại span riêng — trace là dữ liệu có cấu trúc, không phải log text.
- Wakii thấy đúng hình mình ở hai chỗ: gate máy chạy trước gate người, và evidence phải là sản phẩm.

## Agent là một dataclass, không phải một framework

Toàn bộ định nghĩa agent nằm gọn trong một file: `src/agents/agent.py`. Lược bỏ docstring, lớp `Agent` hiện ra như một bản khai báo sáu trường:

```python
class Agent(AgentBase, Generic[TContext]):
    instructions: str | Callable[...] | None = None
    handoffs: list[Agent[Any] | Handoff[TContext, Any]] = field(default_factory=list)
    input_guardrails: list[InputGuardrail[TContext]] = field(default_factory=list)
    output_guardrails: list[OutputGuardrail[TContext]] = field(default_factory=list)
    output_type: type[Any] | AgentOutputSchemaBase | None = None
```

(đoạn rút gọn) — từ `src/agents/agent.py` tại [commit 544b8b0](https://github.com/openai/openai-agents-python/blob/544b8b03b8cf95e62c7f5ebb89adfc4bd66c9d1f/src/agents/agent.py).

Docstring mở đầu chốt luôn triết lý: "An agent is an AI model configured with instructions, tools, guardrails, handoffs and more." (từ `agent.py`, cùng commit). Sáu trường, mỗi trường gắn đúng một loại quan hệ: nói gì với model, ủy quyền cho ai, chặn ở cửa vào và cửa ra, kết quả bắt dạng gì. Không có lớp điều phối nào ở trên: `Runner.run_sync(agent, prompt)` là đủ một run — ví dụ hello-world trong README chỉ dài hai dòng code. Bề mặt nhỏ nhưng không ngừng chuyển động: 10 releases trong khoảng sáu tuần, từ v0.19.0 (27-07) tới v0.22.1 (08-09-2026), theo GitHub API ngày 2026-09-08 — bề mặt nhỏ cùng cadence dày là cặp hiếm, framework càng cập thường càng phình.

## Handoff là tool có schema: điều phối nằm trong tay model

Handoff là cái tên dễ hiểu nhầm nhất trong SDK — nghe như một protocol điều phối riêng, nhưng dưới code nó còn phẳng hơn thế. Docstring của lớp `Handoff` định nghĩa: "A handoff is when an agent delegates a task to another agent." (từ `src/agents/handoffs/__init__.py` tại [commit 544b8b0](https://github.com/openai/openai-agents-python/blob/544b8b03b8cf95e62c7f5ebb89adfc4bd66c9d1f/src/agents/handoffs/__init__.py)). Còn cấu trúc:

```python
@dataclass
class Handoff(Generic[TContext, TAgent]):
    tool_name: str
    tool_description: str
    input_json_schema: dict[str, Any]
    on_invoke_handoff: Callable[[RunContextWrapper[Any], str], Awaitable[TAgent]]
    agent_name: str
    input_filter: HandoffInputFilter | None = None
```

(cùng file, cùng commit)

Một handoff hiện diện trước mắt model như bất kỳ tool nào: có tên, có mô tả, có JSON schema. Khi muốn ủy quyền, model gọi tool này như gọi một function tool; `on_invoke_handoff` trả về agent kế tiếp và Runner chuyển quyền điều phối sang agent đó. Field `handoffs` của `Agent` nói rõ quan hệ: "Handoffs are sub-agents that the agent can delegate to." (từ `agent.py`, cùng commit) — ai quyết định chuyển giao? Model, nhưng chỉ trong danh sách đã khai báo. Ranh giới cuối là `input_filter`: "By default, the new agent sees the entire conversation history." (từ `handoffs/__init__.py`, cùng commit) — muốn cắt bớt lịch sử trước khi bàn giao thì viết filter, không thì mặc định truyền nguyên khối.

Wakii chọn cắt khác: coordinator routing giữa 9 agents là tĩnh theo DAG trong plan — phase0 phân tích xong thì spec-critic vào, plan xong thì task-executor vào — model không tự chọn tổng quát. Cắt tĩnh mất bớt xử lý tình huống ngoài kịch bản, đổi lại ai vào ai đọc được ngay trong plan.

## Guardrail chạy song song: tripwire huỷ run tại chỗ

Guardrail là primitive đáng học nhất vì SDK chọn đúng chỗ đặt nó: cạnh lệnh gọi model, không phải trước hay sau. Docstring field `input_guardrails` nói thẳng: "A list of checks that run in parallel to the agent's execution, before generating a response." (từ `agent.py`, cùng commit):

```
                ┌── lệnh gọi model (task chính) ──▶ final output
input ───┤
                └── input_guardrails (chạy song song)
                          └── tripwire nổ → raise, huỷ task model
```

Bằng chứng cơ chế huỷ nằm ngay trong `src/agents/run.py` — có một hàm tên `should_cancel_parallel_model_task_on_input_guardrail_trip` tại [commit 544b8b0](https://github.com/openai/openai-agents-python/blob/544b8b03b8cf95e62c7f5ebb89adfc4bd66c9d1f/src/agents/run.py). Tên hàm là tài liệu: khi guardrail phát hiện vi phạm, nó raise `InputGuardrailTripwireTriggered` (định nghĩa trong `guardrail.py`) và task model đang chạy song song bị huỷ — không đợi model trả lời xong rồi mới báo lỗi. Giới hạn thiết kế rõ: input guardrails chỉ chạy ở agent đầu chuỗi ("Runs only if the agent is the first agent in the chain" — từ `agent.py`) — kiểm ở cửa, không lặp mỗi mắt xích.

Wakii đặt kiểm máy đúng kiểu đó: lint, test, claims-check chạy tự động và độc lập trước khi gate người (review) mở — nguyên tắc đã phân tích trong bài [gates-not-trust, rule zero](/vi/blog/gates-not-trust-rule-zero/). Hai thiết kế rút ra cùng một hệ quả kinh tế: thêm kiểm máy rẻ, vì nó song song với phần việc chính chứ không nằm trên đường găng tuần tự.

## Tracing first-class: mỗi primitive một loại span

README tách tracing thành một core concept riêng, không phải tính năng kèm: "Built-in tracking of agent runs, allowing you to view, debug and optimize your workflows" (README, tại [commit 544b8b0](https://github.com/openai/openai-agents-python/blob/544b8b03b8cf95e62c7f5ebb89adfc4bd66c9d1f/README.md)). Đọc package `tracing/` thấy chữ "first-class" nằm ở chi tiết nhỏ: module `create.py` dựng hàm factory riêng cho từng loại span:

```
trace (một run)
 ├── agent_span        — mỗi lượt agent
 ├── handoff_span      — mỗi lần chuyển giao
 ├── guardrail_span    — mỗi lượt kiểm
 ├── function_span     — mỗi lượt gọi tool
 └── generation_span   — mỗi lượt gọi model
```

(danh sách hàm thật từ `src/agents/tracing/create.py` tại [commit 544b8b0](https://github.com/openai/openai-agents-python/blob/544b8b03b8cf95e62c7f5ebb89adfc4bd66c9d1f/src/agents/tracing/create.py) — sơ đồ minh hoạ cách nhóm)

`agent_span`, `handoff_span`, `guardrail_span` tồn tại riêng chính là tín hiệu: tracing được thiết kế cùng lúc với ba primitive, không gắn sau khi framework hoàn thiện. Hệ quả: trace là dữ liệu cấu trúc theo loại sự kiện — UI debug và script QA cùng đọc được — thay vì khối log text sàng bằng mắt.

Quy trình Wakii đi theo hình tương tự: pipeline idea → impact → plan → SF → gates → một PR, mỗi bước có gate máy đứng trước gate người — mô tả đầy đủ ở docs [story-workflow](/vi/docs/story-workflow/). Còn vì sao mỗi quyết định trong pipeline phải bám evidence thay vì tin lời agent, đã có bài [decision gates cho AI agents](/vi/blog/decision-gates-safe-ai-agents/).

## Wakii học được gì

- **ADOPT** — gate máy chạy song song và fail nhanh: Wakii đã áp ở đúng vị trí OpenAI đặt guardrail. Lint + test + claims-check chạy tự động trước khi gate người mở; evidence từ bài này cho thấy điểm quý của kiểm máy là báo hỏng ngay khi phát hiện (huỷ task đang chạy) chứ không đợi chuỗi xong — nguyên tắc áp vào story gates B0–B5: gate máy phải chặn trước gate người, và báo kết quả đủ sớm để người không review một bài đã gãy.
- **DIRECTION** — trace có cấu trúc theo loại sự kiện: Wakii giữ evidence dạng văn bản (gate logs, outbox, improvements-log) — người đọc được nhưng máy chưa phân loại được. Hướng đáng đi: log pipeline theo loại bước (phân tích / lập kế hoạch / review / verify — tương ứng agent_span / handoff_span / guardrail_span) để verify-QA đọc lại bằng script. Chưa áp ngay vì story hiện tại đã truy vết được bằng văn bản; cần một chuẩn format chung trước khi máy hoá.
- **WATCH** — `input_filter` lúc chuyển giao: Wakii truyền context pack đầy đủ giữa các agent trong một story. Khi chuỗi SF dài làm pack phình hoặc trùng lặp, lọc lịch sử trước khi bàn giao — như OpenAI để làm lựa chọn mặc định — sẽ thành ứng viên DIRECTION. Điều kiện đổi: một story thực tế phải dựng lại ngữ cảnh vì quá tải.
- **N/A** — realtime, voice và sandbox agents: phần môi trường thời gian thực của SDK không chạm bài toán desktop coding agent của Wakii.

Wakii dựng pipeline theo cùng tinh thần: gate máy trước, gate người sau, done nghĩa là có evidence. Tải Wakii và chạy story đầu tiên của bạn — toàn bộ kit nằm sẵn sau khi cài.
