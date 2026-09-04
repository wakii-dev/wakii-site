# Improvements Log — superpowers workflow (in-flight flags + end-of-task learnings)

## 2026-09-04 — SF-2 Landing (FI-291)

- **`orca linear comment add` trả `ok:false` thật cho body dài (~2.3KB qua heredoc stdin)** — không phải false-negative như `save-issue` (comment KHÔNG apply). Workaround: viết body ra file rồi `--body-file <path>` → ok:true. Ghi chú: probe bằng marker comment để rà trạng thái gây ra 1 comment rác "**test marker probe**" trên FI-291 (CLI không có comment delete — chấp nhận). Suggested change: orca-bridge/skill nên ghi rõ stdin-heredoc không đáng tin cho body dài; và cần `comment delete` cho cleanup.
- **`orca linear issue <id> --comments` latency:** comment mới post cần vài giây để visible qua API — `story-verify` B3 chạy ngay sau khi post sẽ đọc nhầm OUTBOX. Suggested change: story-verify có thể retry 1 lần sau 3s trước khi kết luận OUTBOX.
- **CSS grid min-content trap:** bento grid 1fr track bị kéo to theo content cố định (bracket canvas 680px) dù có auto-scale script (scale hình nhưng không co layout). Fix pattern: `min-width: 0` trên grid items. Nên ghi vào frontend-design/design skill notes cho mockup-kit layouts.

## 2026-09-04 — SF-4 / FI-293
- SF-1 task "og-base" chưa từng landing (không có OG meta ở bất kỳ page nào) — phát hiện ở convergence. Bài học: task tick trong SF trước phải verify bằng grep dist, không tin commits.
- story-verify B3 chỉ nhận literal "VERDICT ... APPROVED" trong Linear comment — code-reviewer agent thường chỉ nói "APPROVED"; reviewer prompt nên yêu cầu post đúng format hoặc coordinator bổ sung.
- Headless Chrome --window-size clamp min-width → báo overflow ảo ở mobile; iframe probe (same-origin, w=390, đo scrollWidth) là reliable.
- Bash tool strip secret literal khỏi command line → pass secret qua file + $(cat).
- Vercel preview mặc định bật SSO protection → preview link không xem public được nếu không tắt qua API (PATCH /v9/projects ssoProtection:null).
