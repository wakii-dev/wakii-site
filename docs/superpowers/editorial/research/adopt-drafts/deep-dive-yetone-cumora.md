# ADOPT draft — deep-dive-yetone-cumora (matrix #49, FI-388)

> SF-6 file tập trung sau review — KHÔNG tự file issue. Label dự kiến: `enhancement` trên `wakii-dev/wakii`.

1. **Pattern** — "Cơ chế định sẵn thắng jitter ngẫu nhiên trong fan-out/retry" (deterministic spacing over probabilistic jitter), học từ `yetone/cumora` — 3.524★, MIT, theo GitHub API ngày 2026-09-08. Cumora bỏ random jitter cho agent spawn (4 wake cùng lúc vẫn có thể cùng roll thấp → vẫn đâm burst) và thay bằng interval cứng 500ms + AdaptivePacer (nhân đôi khi gặp rate-limit, cap 8s, giảm nửa sau 5 lượt sạch).

2. **Evidence inline** — `docs/COORDINATION.md` (blob @ `7eec2be`, probe 2026-09-08): `MIN_SPAWN_INTERVAL_MS` (env `CUMORA_BYOA_MIN_SPAWN_INTERVAL_MS`, default 500ms) — "random jitter is probabilistic, so 4 simultaneous wakes can all roll low values and still hit the provider in lockstep; the interval gate makes the burst rate a hard 1/interval by construction." Kèm số thất bại thật: không cap, 7 agent sinh 130 rate-limit hit trong 17 phút. Theo GitHub API ngày 2026-09-08.

3. **Đề xuất Wakii** — coordinator đã va cùng hình dạng bài toán khi dispatch task-executor dồn trong batch-2 (429 đợt lớn → stagger ≤3 slot). Chuẩn hóa thành quy tắc config: (a) mọi fan-out/retry của coordinator dùng spacing cố định khai được, không dùng jitter ngẫu nhiên; (b) mọi nhóm spawn chia chung một budget (cùng provider/cùng CLI pool) phải cap từng lớp — bài học "don't cap one layer without the other" của cumora. Kỳ vọng hành vi: burst rate là hằng số định trước, không phụ thuộc may rủi. Rủi ro chính: spacing cứng tăng latency đuôi khi fan-out lớn — cần pacer thích ứng như tham chiếu, không chỉ interval tĩnh.

4. **Upstream links** — repo: https://github.com/yetone/cumora · docs: https://github.com/yetone/cumora/blob/7eec2be2d97388106967a037b4937f447bc2544f/docs/COORDINATION.md · code: https://github.com/yetone/cumora/blob/7dba7d55665ccba28fb0ff94286ce75b5e46a691/server/src/agents/glance-protocol.ts · bài will-be-live: "bài sẽ live tại /blog/deep-dive-yetone-cumora/ sau khi story merge" (build-in-public đã duyệt 2026-09-07).
