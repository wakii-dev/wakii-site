# ADOPT draft — gate máy chạy song song với phần việc chính và fail nhanh (tripwire)

> Draft FI-383 (SF-4, matrix #31 `deep-dive-openai-openai-agents-python`) —
> SF-6 file issue tập trung sau review, label `enhancement` trên
> `wakii-dev/wakii`. KHÔNG link path nội bộ site repo (rubric §10) — dẫn
> chứng bằng bài post public.

## 1. Pattern

Repo **openai/openai-agents-python** (29,267 sao, license MIT — theo GitHub
API ngày 2026-09-08) đặt guardrail chạy **SONG SONG với lệnh gọi model**, không
trước hay sau: docstring của field `input_guardrails` ghi "A list of checks
that run in parallel to the agent's execution, before generating a response".
Khi guardrail phát hiện vi phạm, SDK **raise tripwire và huỷ ngay task model
đang chạy** — bằng chứng là hàm `should_cancel_parallel_model_task_on_input_guardrail_trip`
trong `run.py`: báo hỏng ngay khi phát hiện, không đợi chuỗi chạy hết.

## 2. Evidence inline

Hai mảnh evidence cùng lấy tại commit `544b8b0` (2026-09-08):

```python
input_guardrails: list[InputGuardrail[TContext]] = field(default_factory=list)
"""A list of checks that run in parallel to the agent's execution, before
generating a response. Runs only if the agent is the first agent in the chain.
"""
```

— từ `src/agents/agent.py` (docstring, trích nguyên đoạn; link ở §4).

Tên hàm trong `src/agents/run.py` (cùng commit) nói cơ chế huỷ:
`should_cancel_parallel_model_task_on_input_guardrail_trip` — khi input
guardrail nổ tripwire (`InputGuardrailTripwireTriggered` từ `guardrail.py`),
task model chạy song song bị cancel thay vì để chạy tiếp. Repo còn hoạt động
dày: 10 releases từ v0.19.0 (27-07) tới v0.22.1 (08-09), theo GitHub API ngày
2026-09-08.

## 3. Đề xuất Wakii

- **Surface áp dụng**: tầng gate máy của story pipeline (lint + test +
  claims-check trước khi gate người mở). Hiện trạng: các check máy chạy trước
  gate người nhưng theo trật tự tuần tự; một check nổ ở cuối chuỗi phải chờ
  các check trước chạy xong mới được báo.
- **Hành vi kỳ vọng**: nhóm gate máy chạy đồng thời (parallel) thay vì tuần
  tự; một check nổ là hủy các check còn lại và đóng gate với kết quả tổng hợp
  ngay — reviewer nhận thông tin hỏng sớm nhất có thể, không review một bài
  đã gãy. Tinh thần: kiểm máy rẻ vì song song, không nằm trên đường găng
  tuần tự.
- **Rủi ro chính**: chạy song song làm log kết quả đến lệch thứ tự — cần
  tổng hợp kết quả theo ID check, không theo thứ tự đến, nếu không QA đọc log
  dễ kết luận sai; huỷ sớm cũng phải giữ đủ evidence của phần đã chạy để
  truy vết sau.

## 4. Upstream links

- Repo: https://github.com/openai/openai-agents-python (MIT)
- Định nghĩa Agent + docstring guardrails:
  https://github.com/openai/openai-agents-python/blob/544b8b03b8cf95e62c7f5ebb89adfc4bd66c9d1f/src/agents/agent.py
- Cơ chế cancel-on-tripwire:
  https://github.com/openai/openai-agents-python/blob/544b8b03b8cf95e62c7f5ebb89adfc4bd66c9d1f/src/agents/run.py
- Commit lấy evidence: `544b8b03b8cf95e62c7f5ebb89adfc4bd66c9d1f`
  (2026-09-08T11:33:50Z)
- Bài deep-dive tương ứng: sẽ live tại `/blog/deep-dive-openai-openai-agents-python/`
  (VI: `/vi/blog/deep-dive-openai-openai-agents-python/`) sau khi story FI-383 merge.
