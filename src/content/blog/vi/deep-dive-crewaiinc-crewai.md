---
title: "crewAI: đội agent theo vai trò — role/goal/backstory thành dữ liệu"
description: "crewAI tách vai agent thành ba field khai báo và cấp hai runtime: Crew tự điều phối, Flow điều khiển tuần tự. Đọc code thật để thấy vì sao vai-trò-là-dữ liệu hạ giá thành đọc-hiểu."
pubDate: "2026-10-14"
category: "tech"
tags: ["agents", "workflow"]
draft: false
---

Framework multi-agent thường hỏng theo một trong hai kiểu: agent là đống prompt tự do mà không ai review nổi, hoặc pipeline cứng đến mức không diễn đạt nổi một phán đoán giữa chừng. crewAI — 58.233 sao, license MIT, theo GitHub API ngày 2026-09-08 — chọn lối khác: vai của agent là dữ liệu khai báo, và bài toán điều phối tách làm hai runtime. Crew cho phần muốn tự chủ, Flow cho phần cần thứ tự. Bài này đọc thẳng code trong `lib/crewai/src/crewai` (main tại commit `34199c2`, ngày 2026-09-08) để xem cách họ cắt bài toán — và vì sao cách cắt đó hạ giá thành đọc-hiểu.

TL;DR:

- Agent trong crewAI khai báo bằng ba field: role, goal, backstory — dữ liệu có kiểu, serialize được, diff được.
- Crew là runtime "ai làm gì": khai tasks và agents, framework tự đi tuyến; mode hierarchical buộc khai manager LLM tường minh.
- Flow là runtime "chạy theo thứ tự nào": `@start`/`@listen` dựng event graph, ghép điều kiện bằng `or_`/`and_`.
- Guardrail gắn tại từng Agent, số lần chạy lại có trần — rào chắn output ngay biên agent.
- Vai declarative trả trước chi phí hiểu: review được như hồ sơ nhân sự, không cần chạy mới biết ai làm gì.

## Role, goal, backstory: ba field dữ liệu, không phải đoạn prompt

Điểm khởi đầu của crewAI không phải là một prompt khổng lồ mà là một class Pydantic. `BaseAgent` — lớp mọi agent kế thừa — khai báo đúng ba field mang tính hồ sơ nhân sự:

```python
role: str = Field(description="Role of the agent")
goal: str = Field(description="Objective of the agent")
backstory: str = Field(description="Backstory of the agent")
```

Trích `lib/crewai/src/crewai/agents/agent_builder/base_agent.py` tại [commit 34199c2](https://github.com/crewAIInc/crewAI/blob/34199c21b724d805608b59745cdb94006c8fdcd2/lib/crewai/src/crewai/agents/agent_builder/base_agent.py).

Vì agent là `BaseModel`, ba chuỗi này không chỉ là văn bản chèn vào prompt: chúng được validate khi khởi tạo, serialize ra JSON được, và hiện trong diff Git như dòng văn bản thường — PR đổi vai đọc được mà không cần hiểu code điều phối. Đáng chú ý hơn, crewAI giữ bản gốc của cả ba field và nội suy biến đầu vào vào chúng trước mỗi lần chạy:

```python
self._original_role = self.role
...
self.role = interpolate_only(
    input_string=self._original_role, inputs=inputs
)
```

Trích cùng file `base_agent.py` (phương thức nội suy đầu vào, có lược bớt).

Nghĩa là role card có thể chứa biến ngữ cảnh — chủ đề, tên repo, người nhận — mà người viết không phải dựng chuỗi thủ công. Dữ liệu vai phục vụ hai reader: LLM đọc để nhập vai, con người đọc để trả lời "công ty này tuyển những ai, giao việc gì".

## Crew: khai báo ai làm gì, runtime tự đi tuyến

Crew là chế độ thứ nhất, dành cho nhóm việc lặp lại theo quy trình. Bạn khai tasks, agents, và một quy trình:

```python
class Crew(FlowTrackable, BaseModel):
    ...
    tasks: list[Task] = Field(default_factory=list)
    ...
    process: Process = Field(default=Process.sequential)
```

Trích `lib/crewai/src/crewai/crew.py` tại [commit 34199c2](https://github.com/crewAIInc/crewAI/blob/34199c21b724d805608b59745cdb94006c8fdcd2/lib/crewai/src/crewai/crew.py).

Quy trình là một enum đúng hai giá trị:

```python
class Process(str, Enum):
    sequential = "sequential"
    hierarchical = "hierarchical"
    # TODO: consensual = 'consensual'
```

Trích `lib/crewai/src/crewai/process.py` tại [commit 34199c2](https://github.com/crewAIInc/crewAI/blob/34199c21b724d805608b59745cdb94006c8fdcd2/lib/crewai/src/crewai/process.py).

`sequential` chạy task theo trật tự khai báo. `hierarchical` chuyển quyền phân việc cho một manager LLM — và framework buộc bạn khai báo điều đó tường minh: validator của Crew từ chối khởi tạo với thông báo "Attribute `manager_llm` or `manager_agent` is required when using hierarchical process" (trích `crew.py`, cùng commit). Câu bắt lỗi đó là tài liệu: ai quyết định việc phân chia nằm ngay trong dòng lỗi. Dòng TODO `consensual` còn lại cho thấy họ đã cân nhắc mode thứ ba — quy trình của crewAI là một không gian thiết kế, không phải mặc định vô thức. Nhịp bảo trì của repo cũng mạnh: 10 releases từ 05-08 đến 04-09-2026 (1.15.11 đến 1.15.20, hai release cùng ngày 04-09, theo GitHub API ngày 2026-09-08).

## Flow: event graph khi bài toán cần thứ tự và điều kiện

Có những bước không nên giao tự chủ: gọi API thanh toán, ghi ledger, dựng báo cáo theo mẫu. crewAI cấp runtime thứ hai cho nhóm việc này. README tóm gọn một câu: "autonomous agent collaboration through Crews and precise, event-driven control through Flows" ([README.md, commit 34199c2](https://github.com/crewAIInc/crewAI/blob/34199c21b724d805608b59745cdb94006c8fdcd2/README.md)).

Trong code, Flow là lớp công khai của một DSL điều khiển:

```python
from crewai.flow.dsl import and_, listen, or_, router, start

class Flow(_ConversationalMixin, RuntimeFlow[T]):
    """Public Flow class with conversational extension behavior."""
```

Trích `lib/crewai/src/crewai/flow/flow.py` tại [commit 34199c2](https://github.com/crewAIInc/crewAI/blob/34199c21b724d805608b59745cdb94006c8fdcd2/lib/crewai/src/crewai/flow/flow.py).

Cú pháp: `@start` đánh dấu điểm vào — "Marks a method as a flow's starting point" (docstring, trích `flow/dsl/_start.py`, cùng commit); `@listen` dựng phản ứng — "Creates a listener that executes when specified conditions are met" (trích `flow/dsl/_listen.py`, cùng commit). Điều kiện phức ghép bằng `or_`/`and_`, rẽ nhánh bằng `@router`:

```
@start ──▶ fetch_data ──▶ @listen(fetch_data) ──▶ analyze
                              │
                              ▼
                          @router ──▶ nhánh A / nhánh B
```

Chi tiết đáng học nhất nằm ở file định nghĩa: nó tự giới thiệu là "Flow Definition: the serializable, declarative Flow contract" ([flow_definition.py, commit 34199c2](https://github.com/crewAIInc/crewAI/blob/34199c21b724d805608b59745cdb94006c8fdcd2/lib/crewai/src/crewai/flow/flow_definition.py)). Đồ thị điều khiển serialize được — nghĩa là vẽ được, diff được, và kiểm được trước khi chạy, thay vì chỉ tồn tại trong runtime.

## Guardrail gắn tại từng Agent, retry có trần

Rào chắn chất lượng của crewAI không đứng ở ranh giới pipeline mà ở ranh giới từng agent:

```python
guardrail: Annotated[
    GuardrailType | None, ...
] = Field(
    default=None,
    description="Function or string description of a guardrail to validate agent output",
)
guardrail_max_retries: int = Field(
    default=3, description="Maximum number of retries when guardrail fails"
)
```

Trích `lib/crewai/src/crewai/agent/core.py` tại [commit 34199c2](https://github.com/crewAIInc/crewAI/blob/34199c21b724d805608b59745cdb94006c8fdcd2/lib/crewai/src/crewai/agent/core.py).

Mỗi agent mang theo hàm kiểm output của chính nó — hàm Python hoặc mô tả dạng chuỗi — trước khi bàn giao kết quả, và số lần chạy lại có trần (mặc định 3) để thất bại lặp không xoay vô hạn. Rào ở biên agent nghĩa là trách nhiệm chất lượng nằm gần nguồn tạo ra kết quả.

## Vì sao vai-trò-là-dữ liệu hạ giá thành đọc-hiểu

Chi phí lớn nhất của một framework multi-agent là thời gian hiểu, không phải thời gian chạy: người mới phải trả lời được "ai làm gì, thứ tự ra sao, ai chặn sai" trước khi viết dòng code đầu. Vai declarative trả trước cả ba khoản — mỗi câu hỏi một chỗ khai báo tường minh:

| Câu hỏi | Crew trả lời ở đâu | Flow trả lời ở đâu |
|---|---|---|
| Ai làm gì | danh sách agents + role/goal/backstory | từng method + state có kiểu |
| Thứ tự ra sao | process: sequential / hierarchical | event graph `@start`/`@listen` |
| Ai chặn sai | guardrail từng agent | `@router` + điều kiện `or_`/`and_` |

Có một chi tiết nhỏ nói nhiều về mô hình tinh thần: README dẫn ví dụ mẫu mang tên "Write Job Descriptions" — bạn viết bản mô tả công việc, không phải viết kịch bản diễn xuất. Chọn Crew hay Flow là một tín hiệu đọc được: đúng chế độ là biết ngay phần nào được phép tự chủ, phần nào bị chèn cứng. crewAI không phát minh lập trình theo vai, nhưng chứng minh mô hình này sống ở quy mô cộng đồng lớn — và đó là hình dạng Wakii chọn: đội 9 agent mô tả trong một bảng vai, và bài [nine agents, separated powers](/vi/blog/nine-agents-separated-powers/) đã phân tích vì sao tách vai hẹp tạo ra kiểm chéo thay vì tập quyền.

Cách Wakii dựng đội agent theo vai — mỗi vai một việc hẹp, kiểm chéo qua gates — nằm trọn trong một trang: [agents-and-kit](/vi/docs/agents-and-kit/).

## Wakii học được gì

- **ADOPT** — đội agent theo vai declarative: Wakii đã áp ở đúng surface này — 9 agent (phase0-impact-analyst, spec-critic, plan-critic, task-executor, designer, code-reviewer, verifier, security-audit, rollback-fixer) mô tả bằng bảng "Agent | Job" trong docs agents-and-kit, mỗi vai một việc hẹp. crewAI xác nhận hướng đi ở quy mô cộng đồng 58.233 sao. Đề xuất cụ thể kế tiếp: nội suy đầu vào từng run vào role card như `interpolate_only` làm với role/goal/backstory — agent definition nhận biến ngữ cảnh (repo, story, danh sách gates) khi dispatch, thay vì giữ vai tĩnh.
- **DIRECTION** — guardrail per-agent có trần retry: gates B0–B5 của Wakii đứng ở ranh giới giai đoạn story; crewAI đặt thêm rào ở biên từng agent — validate output trước khi bàn giao, tối đa 3 lần chạy lại. Ứng viên đầu tiên: task-executor tự rà lint/test trước khi mở review. Chưa áp ngay vì gates story-level đang đủ chặn; thêm lớp cần cân chi phí trễ.
- **WATCH** — hierarchical manager LLM tự phân việc: Wakii phân việc bằng DAG tĩnh trong plan; manager_llm của crewAI phân động theo mô tả task. Theo dõi đến khi xuất hiện nhu cầu tái phân việc giữa chừng mà không muốn sửa plan — khi đó dispatch động trở thành ứng viên DIRECTION.

Muốn thử đội 9 agent này trên repo của bạn? Tải Wakii và chạy story đầu tiên — pipeline từ impact analysis đến review đã nằm sẵn trong kit.
