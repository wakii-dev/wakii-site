# Adopt draft — deepseek-ai/deepseek-harness (batch-3 matrix #1, FI-383 SF-2)

> Draft theo rubric style-guide §10 — SF-6 chọn lọc + file tập trung sau review.
> Repo: deepseek-ai/deepseek-harness — 215.800 stars, license MIT
> (theo GitHub API ngày 2026-09-08; repo tạo 2026-08-13). Clone probe @ `c389f96`.

## 1. Pattern

**Advisory guard — canh gác vòng lặp agent bằng cách NHẮC, không chặn.**
Học từ `guard/repeat-tool-reminder` của DeepSeek Harness: một plugin đếm số lần
model gọi lặp liên tiếp cùng một tool; chạm ngưỡng (mặc định 3, 5, 8) thì
inject một reminder CÓ NHÃN NGUỒN vào context của request kế tiếp — không veto,
không viết lại lệnh gọi nào. Sai cấu hình thì fail loud lúc load ("never a
silent fall-back" theo comment gốc).

## 2. Evidence inline (nguyên văn + số kèm ngày, NGAY TRONG file)

Excerpt từ `packages/guard/repeat-tool-reminder/src/index.ts` @ `c389f96`
(trích ngắn phục vụ phân tích):

```ts
export interface Config {
  /** Consecutive-repeat counts that trigger a reminder (default `[3, 5, 8]`). */
  thresholds?: number[]
}

const PLUGIN_SOURCE: MessageSource = { kind: 'plugin', plugin: 'repeat-tool-reminder' }
```

Comment gốc trong file: nhãn nguồn là "load-bearing (an unlabeled context would
render as a user prompt in derived history)" — reminder không bị lẫn thành user
prompt trong lịch sử phái sinh.

Docstring của package: "Advisory per-agent repeat-call detector. It enriches
post-execute decisions with logged model context without vetoing or rewriting
calls." (nguyên văn, ≤25 từ mỗi quote).

Số liệu repo: 215.800 stars, MIT (theo GitHub API ngày 2026-09-08); invariant
kèm theo trong docs: "Anything that reaches a model request must be
reconstructable from the log" (docs/architecture.md @ `c389f96`).

## 3. Đề xuất Wakii

- **Áp vào**: `story-watchdog` (stall detection) + loop caps của task-executor.
- **Hành vi kỳ vọng**: trước khi kết luận một agent stall, đếm consecutive
  same-tool calls từ transcript; chạm ngưỡng → inject cảnh báo vào context của
  agent ("bạn đã gọi X N lần liên tiếp") và CHO AGENT CHẠY TIẾP một nhịp; chỉ
  khi vẫn lặp sau nhắc mới chuyển sang resume/rollback. Giảm nhầm "đang chạy
  dài" (watchdog phải bỏ qua — bài học FI-289/FI-359) với "kẹt thật".
- **Rủi ro chính**: đọc transcript phải rẻ (batch-2 đã có pattern grep
  transcript cho review — chi phí chấp nhận được); ngưỡng sai sẽ làm agent bị
  nhắc oan — giữ advisory (nhắc, không chặn) nên rủi ro thấp hơn resume sai.

## 4. Upstream links

- Repo: https://github.com/deepseek-ai/deepseek-harness
- Guard: https://github.com/deepseek-ai/deepseek-harness/blob/c389f96/packages/guard/repeat-tool-reminder/src/index.ts
- Architecture (invariant): https://github.com/deepseek-ai/deepseek-harness/blob/c389f96/docs/architecture.md
- AGENTS.md (coverage gate, benchmarks): https://github.com/deepseek-ai/deepseek-harness/blob/c389f96/AGENTS.md
- Bài deep-dive: sẽ live tại `/blog/deep-dive-deepseek-ai-deepseek-harness/` sau khi story merge (build-in-public đã duyệt 2026-09-07).
