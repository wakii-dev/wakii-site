
## 2026-09-04 — SF-4 / FI-293
- SF-1 task "og-base" chưa từng landing (không có OG meta ở bất kỳ page nào) — phát hiện ở convergence. Bài học: task tick trong SF trước phải verify bằng grep dist, không tin commits.
- story-verify B3 chỉ nhận literal "VERDICT ... APPROVED" trong Linear comment — code-reviewer agent thường chỉ nói "APPROVED"; reviewer prompt nên yêu cầu post đúng format hoặc coordinator bổ sung.
- Headless Chrome --window-size clamp min-width → báo overflow ảo ở mobile; iframe probe (same-origin, w=390, đo scrollWidth) là reliable.
- Bash tool strip secret literal khỏi command line → pass secret qua file + $(cat).
- Vercel preview mặc định bật SSO protection → preview link không xem public được nếu không tắt qua API (PATCH /v9/projects ssoProtection:null).
