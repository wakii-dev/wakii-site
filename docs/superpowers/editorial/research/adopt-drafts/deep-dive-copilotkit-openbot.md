# ADOPT draft — deep-dive-copilotkit-openbot (matrix #47, FI-388)

> SF-6 file tập trung sau review — KHÔNG tự file issue. Label dự kiến: `enhancement` trên `wakii-dev/wakii`.

1. **Pattern** — "Mọi refusal của agent phải nêu đúng rule gây chặn" (refusal-with-rule-identity), học từ `CopilotKit/OpenBot` — 4.453★, MIT, theo GitHub API ngày 2026-09-08. Gateway của OpenBot trả `ActionRefusedError` mang field `rule`, để UI hiển thị chính xác rule nào đã từ chối hành động, không chỉ báo "bị chặn".

2. **Evidence inline** — `server/src/computer/gateway.ts` (blob @ `2e1b352`, probe 2026-09-08):

   ```text
   export class ActionRefusedError extends Error {
     /** The rule that refused it, so the surface can show which one
         and an operator can find it. */
     readonly rule: string | null;
   ```

   Header comment cùng file: "A gateway that decides on a label supplied by the model is theatre" — kèm "an action that was not recorded did not happen" (audit row ghi TRƯỚC khi act). Theo GitHub API ngày 2026-09-08.

3. **Đề xuất Wakii** — Wakii đã có guard codes ở decision gates (FI-341: resolve trùng/gate đóng bị chặn với mã lỗi rõ ràng, không nuốt im lặng). Mở rộng nguyên tắc sang mọi refusal surface khác của agent trong panel — tool bị từ chối, file không cho ghi, lệnh bị chặn — mỗi thông báo refusal kèm định danh rule/điều kiện chặn + chỗ tra cứu. Kỳ vọng hành vi: người điều phối nhìn thông báo là biết phải đổi gì để đi tiếp, không phải đoán. Rủi ro chính: leak chi tiết policy nhạy cảm trong thông báo — cần map rule-id → mô tả an toàn, không dump nguyên điều kiện.

4. **Upstream links** — repo: https://github.com/CopilotKit/OpenBot · code: https://github.com/CopilotKit/OpenBot/blob/2e1b352e9a0e7be6235d641b787aab8da10b64db/server/src/computer/gateway.ts · bài will-be-live: "bài sẽ live tại /blog/deep-dive-copilotkit-openbot/ sau khi story merge" (build-in-public đã duyệt 2026-09-07).
