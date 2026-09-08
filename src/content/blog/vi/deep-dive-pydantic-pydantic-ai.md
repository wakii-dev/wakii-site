---
title: "PydanticAI: agent đánh máy chặt"
description: "PydanticAI mang công thức typing của FastAPI sang agent: tool args và structured output là hợp đồng kiểu pydantic, lỗi bị chặn ở biên thay vì nổ ở runtime xa. Bài mổ cơ chế validation-first, dependency injection và multi-agent theo kiểu delegation."
pubDate: "2026-10-16"
category: "tech"
tags: ["agents", "architecture"]
draft: false
---

Model gọi tool bằng JSON tự do — và thứ làm hỏng production thường không phải logic
agent, mà là một field sai tên hoặc một con số ngoài khoảng mà không ai chặn.
PydanticAI — SDK agent của team đứng sau pydantic, 19.794 sao và MIT theo GitHub API
ngày 2026-09-08 — chọn chiều ngược lại: mọi biên giữa model và code của bạn là một
hợp đồng kiểu. Đó là công thức từng thành công trong web: FastAPI lớn lên nhờ việc
request body được kiểm tra trước khi code handler chạy. Bài này mổ xem nguyên lý
validation-first nằm ở những chỗ nào trong source, dependency injection giúp test
tool ra sao, và multi-agent của repo này xếp loại gì so với các framework hội thoại.

TL;DR:

- Tool args không phải JSON tự do: signature hàm và docstring sinh ra schema
  pydantic; tham số sai bị chặn ngay tại biên, trước khi một dòng nào trong tool chạy.
- Lỗi validation không ném ra ngoài — biến thành RetryPromptPart, một loại message
  first-class đưa lại cho model kèm chi tiết để tự sửa và gọi lại.
- Structured output cùng nguyên lý: khai báo output_type là model pydantic; run chỉ
  hoàn tất khi kết quả qua validator.
- Dependency injection qua RunContext: tool nhận deps truyền vào theo kiểu generic,
  không import biến toàn cục — test tool không cần gọi model.
- Multi-agent ở đây là delegation: agent trong tool của agent khác; nhịp phát hành
  dày — 10 release trong 14 ngày trước mốc probe.

## Signature hàm thành hợp đồng, docstring thành mô tả tool

Ví dụ chuẩn của repo từ README: một agent trích cảm xúc review, khai output là model
pydantic và gắn tool bằng decorator:

```python
class Sentiment(BaseModel):
    label: Literal['positive', 'negative', 'neutral']
    score: float = Field(ge=-1, le=1)


agent = Agent('openai:gpt-5.6-sol', output_type=Sentiment)


@agent.tool
def recent_reviews(ctx: RunContext[None], product: str) -> list[str]:
    """Fetch recent review snippets for a product."""
    return ['The new release fixed everything I complained about!']
```

(Trích README của pydantic/pydantic-ai @ commit `62f1e830` —
[nguồn](https://github.com/pydantic/pydantic-ai/blob/62f1e8302a356d09962c55117f41a282cf1eb243/README.md).)

README tóm nguyên lý trong một câu: "arguments are validated before your code runs,
and the run is guaranteed to return a `Sentiment`" — phần còn lại của signature cùng
docstring trở thành tool schema gửi cho model
([nguồn](https://github.com/pydantic/pydantic-ai/blob/62f1e8302a356d09962c55117f41a282cf1eb243/README.md)).
Đáng chú ý: docstring một dòng của `recent_reviews` không chỉ để người đọc — nó được
harvest thành description trong JSON schema mà model nhìn thấy.

Trong source, hợp đồng đó tồn tại dưới dạng một cấu trúc dữ liệu rõ:

```python
@dataclass(kw_only=True)
class FunctionSchema:
    """Internal information about a function schema."""

    function: Callable[..., Any]
    name: str
    description: str | None
    validator: SchemaValidator
    json_schema: ObjectJsonSchema
```

(Trích `pydantic_ai_slim/pydantic_ai/_function_schema.py` @ `62f1e830` —
[link nguồn](https://github.com/pydantic/pydantic-ai/blob/62f1e8302a356d09962c55117f41a282cf1eb243/pydantic_ai_slim/pydantic_ai/_function_schema.py),
theo GitHub API ngày 2026-09-08.)

Mỗi tool đăng ký với agent không chỉ là một hàm — nó đi kèm `SchemaValidator` để
kiểm args đến, và `json_schema` để mô tả cho model. Hai nửa của một hợp đồng: một
nửa nói cho model cách gọi, một nửa chặn khi gọi sai.

## Lỗi bắt ở biên, thành tín hiệu sửa cho model

Nơi args từ model được kiểm tra, trong module quản lý tool:

```python
raw_args = args_override if args_override is not None else call.args
validator = tool.args_validator
if isinstance(raw_args, str):
    args_dict = validator.validate_json(
        raw_args or '{}', allow_partial=pyd_allow_partial, context=ctx.validation_context
    )
else:
    args_dict = validator.validate_python(
        raw_args or {}, allow_partial=pyd_allow_partial, context=ctx.validation_context
    )
```

(Trích `_validate_tool_args` trong `pydantic_ai_slim/pydantic_ai/tool_manager.py`
@ `62f1e830` —
[link nguồn](https://github.com/pydantic/pydantic-ai/blob/62f1e8302a356d09962c55117f41a282cf1eb243/pydantic_ai_slim/pydantic_ai/tool_manager.py),
theo GitHub API ngày 2026-09-08.)

`validate_json` chạy trước khi tool được đụng đến; args sai thì `ValidationError`
nổi lên ngay ở biên. Nhưng điều khiến cơ chế này hơn một try/except là chỗ xử lý lỗi:

```python
def _wrap_error_as_retry(name: str, call: ToolCallPart, error: ValidationError | ModelRetry) -> ToolRetryError:
    """Convert a ValidationError or ModelRetry to a ToolRetryError with a RetryPromptPart."""
    m = RetryPromptPart.from_error(error, tool_name=name, tool_call_id=call.tool_call_id)
    return ToolRetryError(m)
```

(Trích cùng file @ `62f1e830` —
[link nguồn](https://github.com/pydantic/pydantic-ai/blob/62f1e8302a356d09962c55117f41a282cf1eb243/pydantic_ai_slim/pydantic_ai/tool_manager.py).)

`ValidationError` được bọc thành `RetryPromptPart` — một loại message trong giao thức,
đi ngược về model như bất kỳ tool result nào:

```
   model                 biên (tool_manager)            code của bạn
     |                         |                             |
     |--- tool call (JSON) --->|                             |
     |                   validate_json()                     |
     |                    |-- đúng ----> tool chạy --------->|
     |<-- RetryPromptPart --|-- sai                         |
     |    (field nào sai, kỳ vọng gì)                       |
     |--- gọi lại với args đã sửa -->|                       |
```

Thay vì trả về chuỗi "tool failed" chung chung, model nhận lỗi validation chi tiết —
field nào sai, kỳ vọng kiểu gì — đủ nguyên liệu để tự sửa tham số và gọi lại, trong
budget retry cấu hình được theo từng tool. FastAPI làm đúng điều tương tự cho web:
request body sai nhận 422 kèm chi tiết ở cửa, không phải một TypeError cháy ở tầng
service. PydanticAI chuyển nguyên tắc đó vào agent loop.

## Deps đi qua RunContext, không qua biến toàn cục

Vấn đề kinh điển khi viết tool: hàm cần DB client, HTTP client, config — lấy từ đâu?
Biến toàn cục khiến test dơ và import vòng. PydanticAI đặt câu trả lời vào chữ ký:

```python
@dataclasses.dataclass(repr=False, kw_only=True)
class RunContext(Generic[RunContextAgentDepsT]):
    """Information about the current call."""

    deps: RunContextAgentDepsT
    """Dependencies for the agent."""
```

(Trích `pydantic_ai_slim/pydantic_ai/_run_context.py` @ `62f1e830` —
[link nguồn](https://github.com/pydantic/pydantic-ai/blob/62f1e8302a356d09962c55117f41a282cf1eb243/pydantic_ai_slim/pydantic_ai/_run_context.py),
theo GitHub API ngày 2026-09-08.)

Tool khai `ctx: RunContext[Deps]`, toàn bộ deps được inject lúc gọi
`agent.run(..., deps=...)`. Đổi DB client khi test nghĩa là truyền deps khác — code
tool không đổi; test một tool không cần model: dựng ctx giả, gọi thẳng hàm. Đây cùng
lý do FastAPI tách `Depends` khỏi handler: phụ thuộc hiện ở chữ ký là phụ thuộc kiểm
được, thay vì phụ thuộc giấu trong module-level state.

## Multi-agent là delegation, control quay về caller

Tài liệu repo xếp thang phức tạp năm mức: single agent → agent delegation →
programmatic hand-off → graph → deep agents
([nguồn](https://github.com/pydantic/pydantic-ai/blob/62f1e8302a356d09962c55117f41a282cf1eb243/docs/multi-agent-applications.md),
theo GitHub API ngày 2026-09-08). Mức được dùng nhiều nhất là delegation — tài liệu
định nghĩa: "an agent delegates work to another agent, then takes back control" —
agent con nằm trong một tool của agent cha, chạy xong trả quyền về caller. So phân
vị với hand-off của OpenAI Agents SDK: ở đó quyền hội thoại chuyển hẳn sang agent
đích và không quay lại.

Chi tiết đáng học nhất nằm ở capability SubAgents của Pydantic AI Harness — tài liệu
viết: "Each delegation runs in its own run with its own message history, so a
delegate never sees the parent conversation."
([nguồn](https://github.com/pydantic/pydantic-ai/blob/62f1e8302a356d09962c55117f41a282cf1eb243/docs/multi-agent-applications.md).)
Delegate bị cô lập ngữ cảnh; agent cha chỉ nhận lại output đã qua validator của
output_type. Usage được truyền xuống delegate qua `ctx.usage` để token tiêu trong
delegation vẫn tính vào ngân sách của run cha — biên ngữ cảnh chặt nhưng ngân sách
thì liền mạch.

## Nhịp phát hành: 10 release trong 14 ngày

Lịch release 10 bản gần nhất của repo:

| Tag | Ngày phát hành |
|---|---|
| v2.34.0 | 2026-08-25 |
| v2.35.0 | 2026-08-26 |
| v2.35.1 | 2026-08-27 |
| v2.35.3 | 2026-08-28 |
| v2.36.0 | 2026-08-29 |
| v2.37.0 | 2026-09-01 |
| v2.38.0 | 2026-09-03 |
| v2.39.0 | 2026-09-04 |
| v2.40.0 | 2026-09-05 |
| v2.41.0 | 2026-09-08 |

(Theo GitHub API ngày 2026-09-08; release cuối v2.41.0 phát đúng ngày probe, lần
push gần nhất vào main cũng trong ngày đó.)

Cadence dày không mâu thuẫn với typed-first: hợp đồng kiểu chặn regression ở biên,
README gắn badge coverage 100%, và nhịp này cho thấy lõi đang được xoay nhanh theo
đà phát triển harness — capability, durable execution, realtime voice đều là mặt
mới xuất hiện trong README hiện tại.

Wakii đi hướng tương tự ở tầng của mình: hợp đồng bài viết khóa trong schema
frontmatter, gate máy chặn trước khi commit — cách 9 agent chia quyền trong một
harness có sẵn mô tả ở
[agents-and-kit](/vi/docs/agents-and-kit/).

## Wakii học được gì

- **ADOPT** — "lỗi bắt ở biên" đã là nguyên tắc gate của Wakii: lint content chạy
  ngay lúc viết bài (band từ, pubDate khớp dòng matrix, section grading), parity
  gate chặn nửa-cặp VI/EN lúc build, schema frontmatter khóa 6 field trong
  content.config.ts. Cùng lý do với validator chặn args sai trước khi tool chạy:
  lỗi gần chỗ sinh ra thì rẻ. Các gate đó liệt kê đủ trong
  [arch-ci-gates](/vi/blog/arch-ci-gates/).
- **DIRECTION** — hợp đồng output giữa agent với agent: report DONE/BLOCKED của
  task-executor hiện là markdown theo format thoả thuận nhưng đọc bằng mắt. Một
  output schema nhẹ cho report — giống output_type buộc run qua validator — sẽ cho
  coordinator parse máy được, tự tick plan và phát hiện report thiếu field. Chưa áp
  ngay: quy mô một story vài SF vẫn đọc prose kịp, chi phí duy trì schema chưa trả
  lại.
- **WATCH** — delegation có biên ngữ cảnh: Wakii hiện coordinator-driven, mỗi agent
  nhìn thấy đúng context pack được phát. Nếu orchestration chuyển sang
  peer-delegation, pattern SubAgents (delegate không thấy hội thoại cha, chỉ trả
  output đã validate) là hình dạng biên cần. Điều kiện đổi: sub-agent phải chạy dài
  độc lập hoặc số agent vượt khả năng điều phối tuần tự.

Tải Wakii về và chạy thử một story — mỗi mốc trong đó có gate máy đứng ở biên, thay
vì một vòng dò lỗi ở cuối đường.
