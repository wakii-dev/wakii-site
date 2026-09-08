# ADOPT draft — pydantic/pydantic-ai → Wakii (batch-3, matrix #32)

> Draft theo style-guide §10 (FI-383 D5). SF-4/FI-387 đề xuất — SF-6 file tập
> trung sau review. KHÔNG file issue từ draft này tự động.

## 1. Pattern

**Output contract giữa agent với agent (schema-validated hand-back):** khi một
agent ủy việc cho agent khác, kết quả trả về phải đi qua một validator kiểu —
người nhận parse máy được, thiếu field hoặc sai kiểu bị chặn tại biên thay vì đọc
prose rồi đoán. Học từ `pydantic/pydantic-ai` (19.794 sao, MIT — theo GitHub API
ngày 2026-09-08): mọi run của agent khai `output_type` là model pydantic; run chỉ
hoàn tất khi kết quả qua validator, và kết quả delegation giữa các agent cũng đi
cùng con đường đó.

## 2. Evidence inline

- README @ commit `62f1e830` (probe 2026-09-08): "arguments are validated before
  your code runs, and the run is guaranteed to return a `Sentiment`" — ví dụ
  `Sentiment(BaseModel)` với `output_type=Sentiment`.
  https://github.com/pydantic/pydantic-ai/blob/62f1e8302a356d09962c55117f41a282cf1eb243/README.md
- `pydantic_ai_slim/pydantic_ai/tool_manager.py` @ `62f1e830`, `_validate_tool_args`:
  `args_dict = validator.validate_json(raw_args or '{}', ...)` — args bị chặn ở
  biên trước khi tool chạy; lỗi → `_wrap_error_as_retry` → `RetryPromptPart`
  (message đưa về phía sinh ra lỗi để tự sửa).
  https://github.com/pydantic/pydantic-ai/blob/62f1e8302a356d09962c55117f41a282cf1eb243/pydantic_ai_slim/pydantic_ai/tool_manager.py
- `pydantic_ai_slim/pydantic_ai/_function_schema.py` @ `62f1e830`: `FunctionSchema`
  — mỗi tool mang `validator: SchemaValidator` + `json_schema: ObjectJsonSchema`.
  https://github.com/pydantic/pydantic-ai/blob/62f1e8302a356d09962c55117f41a282cf1eb243/pydantic_ai_slim/pydantic_ai/_function_schema.py
- Wakii hiện trạng (surface thật, batch-3): report DONE/BLOCKED của task-executor
  là markdown theo format thoả thuận (`DONE <task-id>: … / commit / files / tests /
  notes`) — có shape nhưng đọc bằng mắt, chưa parse máy; coordinator tự tick plan
  thủ công.

## 3. Đề xuất Wakii

- **Áp vào:** biên task-executor → coordinator (report cuối task) — báo cáo
  DONE/BLOCKED thêm một block máy-đọc được (frontmatter-mini hoặc JSON fenced) với
  field bắt buộc: task-id, status, commit hash, files touched. Coordinator validate
  trước khi tick plan/resolve gate.
- **Kỳ vọng hành vi:** report thiếu field hoặc sai format bị coordinator từ chối
  ngay tại biên (giống validator chặn args sai trước tool chạy) kèm thông báo chỉ
  đích danh field thiếu — executor tự sửa và gửi lại trong retry budget, thay vì
  coordinator dò lỗi bằng mắt giữa chừng story.
- **Rủi ro chính:** cứng hoá quá làm chậm report ngắn (bài BLOCKED cần tự do mô tả
  symptom); pattern pydantic-ai xử lý bằng cách tách phần typed (fields bắt buộc)
  khỏi phần free-text (notes) — đề xuất Wakii giữ nguyên tỉ lệ đó, chỉ schema hoá
  phần máy cần đọc.

## 4. Upstream links

- Repo: https://github.com/pydantic/pydantic-ai
- README (output contract): https://github.com/pydantic/pydantic-ai/blob/62f1e8302a356d09962c55117f41a282cf1eb243/README.md
- tool_manager.py (biên validation + retry): https://github.com/pydantic/pydantic-ai/blob/62f1e8302a356d09962c55117f41a282cf1eb243/pydantic_ai_slim/pydantic_ai/tool_manager.py
- Multi-agent docs (delegation trả output qua validator): https://github.com/pydantic/pydantic-ai/blob/62f1e8302a356d09962c55117f41a282cf1eb243/docs/multi-agent-applications.md
- Bài blog public: "bài sẽ live tại /blog/deep-dive-pydantic-pydantic-ai/ sau khi
  story merge" (build-in-public đã được user duyệt 2026-09-07).
