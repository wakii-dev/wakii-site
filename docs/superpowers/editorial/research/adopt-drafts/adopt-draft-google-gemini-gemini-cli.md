# ADOPT draft — google-gemini/gemini-cli (batch-3, matrix #7)

> Draft cho SF-6 file ADOPT issue tập trung (rubric §10 style-guide, FI-383 D5).
> Repo tại ngày probe 2026-09-08: 106.867★, license Apache-2.0 (theo GitHub API
> ngày 2026-09-08). Bài deep-dive sẽ live tại `/blog/deep-dive-google-gemini-gemini-cli/`
> sau khi story merge (build-in-public đã được user duyệt 2026-09-07).

## Pattern

Luật quyền chạy tool là dữ liệu có độ ưu tiên, được máy chấm trước khi lệnh
chạy — học từ google-gemini/gemini-cli (106.867★, Apache-2.0 tại ngày probe
2026-09-08): mọi tool-call đi qua policy engine với enum quyết định ba giá trị
và priority rules; kể cả chế độ tự động nhất (YOLO) vẫn giữ quyết định của luật
cho lệnh nguy hiểm thay vì chấm lại.

## Evidence inline

```ts
// packages/core/src/policy/types.ts
export enum PolicyDecision {
  ALLOW = 'allow',
  DENY = 'deny',
  ASK_USER = 'ask_user',
}
```

Log nhánh trong policy-engine.ts: git trong workspace không tin cậy → "Forcing
ASK_USER"; lệnh nguy hiểm khi YOLO bật → "Preserving decision"; git an toàn đã
biết → "overriding ASK_USER to ALLOW". Nguồn đọc tại commit `85aca16` ngày
2026-09-08 (shallow clone), link: https://github.com/google-gemini/gemini-cli/blob/85aca16/packages/core/src/policy/types.ts
và https://github.com/google-gemini/gemini-cli/blob/85aca16/packages/core/src/policy/policy-engine.ts

Evidence phụ (dogfooding — cùng pattern "agent cầm vận hành công khai"): 7/47
workflow GitHub của repo chạy run-gemini-cli cho triage/dedup issue, release
notes, docs audit (grep "run-gemini-cli" trong .github/workflows, ngày
2026-09-08, commit `85aca16`).

## Đề xuất Wakii

- Surface: story-preflight + tầng gate B0–B5 (kit story-* CLI).
- Hành vi kỳ vọng: các điều kiện cứng trước executor (kết quả test, phạm vi
  file chạm, marker lint) mã hóa thành ruleset có độ ưu tiên 3 mức
  (chặn-executor / cảnh-báo / cho-qua) thay vì checklist văn xuôi — máy chấm
  trước, không phụ thuộc cách diễn đạt của prompt, khó bị nuốt im lặng hơn.
- Rủi ro chính: ruleset cứng dễ stale khi workflow đổi — cần đường nâng cấp rõ
  (rule version theo story bracket) và không thay thế gate adversarial (review
  người/agent độc lập vẫn giữ nguyên vai trò).

## Upstream links

- Repo: https://github.com/google-gemini/gemini-cli
- policy/types.ts @ 85aca16: https://github.com/google-gemini/gemini-cli/blob/85aca16/packages/core/src/policy/types.ts
- policy-engine.ts @ 85aca16: https://github.com/google-gemini/gemini-cli/blob/85aca16/packages/core/src/policy/policy-engine.ts
- Dogfooding workflows @ 85aca16: https://github.com/google-gemini/gemini-cli/tree/85aca16/.github/workflows
