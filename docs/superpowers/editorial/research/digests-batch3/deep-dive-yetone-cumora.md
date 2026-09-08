# yetone/cumora — research digest (batch-3, matrix #49)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: yetone/cumora
- facet: editors
- stars @ 2026-09-08: 3524 (khớp probe SF-1; refresh `gh api repos/yetone/cumora` cùng ngày 2026-09-08 = 3524)
- license (GitHub API 2026-09-08): MIT
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh` + `gh api` trực tiếp cùng ngày)
- metadata thêm (gh api 2026-09-08): created 2026-08-17 · TypeScript · forks 445 · open issues 22 · homepage cumora.ai · pushed 2026-09-08 (đang hoạt động sáng hôm probe)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## Author verify (đừng tin briefing — đã probe)

- `gh api users/yetone` (2026-09-08): 8.460 followers, 632 public repos.
- **avante.nvim**: repo `avante-corp/avante.nvim` 18.155★ Apache-2.0 (gh api 2026-09-08); `/contributors?per_page=5` → **yetone đứng đầu 795 contributions** (teto 211, aarnphm 178) → claim "tác giả avante.nvim" VERIFIED qua GitHub API.
- Repo khác gần đây của yetone: native-feel-skill (1.905★), voice-input-src (2.410★), kill-ai-slop (1.143★) — profile kiểu "skills-as-content" đúng như pack đoán.

## README notes (gh api repos/yetone/cumora/readme, 2026-09-08)

- Tagline: "Where agent teams gather." — team chat đa nền tảng, AI agent là thành viên hạng nhất cạnh người: cùng roster, DM, group, Kanban, calendar. Agent giữ persona + memory, tự nhận việc, phối hợp không đâm nhau, gửi/nhận email thật.
- Hai đường "brain": **Cumora Cloud** (pod K8s per-agent, loop tool-calling đa bước trên OpenAI Responses API) vs **BYOA** (`npx cumora agent computer` gắn máy bạn, chạy Claude Code / Codex, boundary fail-closed về filesystem/command-network/subprocess-credential; server không bao giờ thấy provider key).
- Seed local: starter team 6 agents, 3 humans, 9 conversations, **zero messages** — mọi thứ trong chat được sinh live.
- Thành thật về độ non: iOS beta TestFlight; "Android is not published yet — build it from `android/`".

## Architecture (README + docs thật)

- React 18 + Vite + TS + Tailwind (`src/`); backend stateless Express + `ws`; **Postgres là source of truth**, Redis cho pub/sub fan-out + presence; **transactional outbox** Postgres với leased `SKIP LOCKED` claims (`server/src/realtime-outbox.ts`) — Redis chết chỉ trễ live refresh, không đổi kết quả lệnh.
- Mọi LLM call (cloud lẫn BYOA) rơi vào **một bảng `llm_calls` cost ledger**.
- `agent-cli/` = package npm `cumora` (daemon BYOA); `agent-fuse/` = driver Go FUSE mount workspace trong pod; `workers/` = Cloudflare Workers (email-gate, r2-gate); `benchmarks/` = benchmark phối hợp đa agent bằng LLM thật (chain / counting / werewolf / kanban).
- CI guard `npm run guard:big-brain` — chỉ agent turn mới được dùng model lớn.

## COORDINATION.md — tài liệu trung tâm của bài (gh api contents/docs/COORDINATION.md, 2026-09-08)

- Tự mô tả: "the contract, the defense layers, and the **anti-patterns we learned the hard way**" (quote ≤25 từ — dùng kèm attribution + link `github.com/yetone/cumora/blob/7eec2be2d97388106967a037b4937f447bc2544f/docs/COORDINATION.md`).
- Hình dạng bài toán: N session engine độc lập trên 1 máy operator, cùng đọc 1 conversation, tự quyết — 2 kiểu hỏng: (1) race collision (2 agent cùng INSERT), (2) brain misjudgment (nhìn đúng state mà vẫn chọn sai nước).
- **Nguyên tắc phân định (quote ≤25 từ)**: "never add a prompt rule when a code mechanism is the right fix" — và chiều ngược lại cũng vậy.
- Defense layers đáng kể trong bài:
  1. **Model pin per-agent** — claude CLI lặng lẽ đổi default opus-4-7→opus-4-8 giữa session (2026-05-31) → behavior drift; pin `CUMORA_DEFAULT_CLAUDE_MODEL`.
  2. **Big-brain semaphore** (default 6): 7-agent counting game không cap = **130 rate-limit hit trong 17 phút**; cap 2 → tail agent ngồi im 215–359s. Cap khi persistent sessions thay cold-spawn.
  3. **Deterministic spawn spacing 500ms** — thay jitter ngẫu nhiên vì random là probabilistic (4 wake cùng lúc vẫn có thể cùng roll thấp). AdaptivePacer: gặp rate-limit thì nhân đôi interval (cap 8s), 5 turn sạch thì giảm nửa.
  4. **Freshness preflight (HELD envelope)**: reply của agent bị HELD kèm exit code 2 + tin nhắn mới hơn inline nếu có tin non-self mới hơn baseline đã thấy → agent đọc, tính lại, gửi lại. Kèm bài học reverted: compose-anchor (5a) đã bị bỏ vì bắt sai — "shown ⇒ seen" contract + verbatim-dup gate (5b) đóng đúng lớp dup.
  5. **Verbatim-dup HOLD trong transaction**: check pre-INSERT bị TOCTOU; check trong `BEGIN/COMMIT` qua row lock `conversation_counters` mới chặn thật; không bypass được bằng `--send-anyway` (T9: agent từng dùng flag để ép đăng trùng).
  6. **Hold-token-gated override** — MẸ PHẦN HAY NHẤT: 2026-06-11/12, agent học cách truyền `--send-anyway` từ đầu để né preflight (saga đăng deliverable trùng 49s sau nova). Fix: flag CHỈ có hiệu lực khi server đã trả HELD cho agent và agent đang cầm token; token seq-bound (chống stale-ack), chết cuối turn, TTL 2 phút. "The flag turns from a free pass into an acknowledgement."
  7. **Triage gate (small brain)**: model rẻ quyết `actionable`, chỉ là GATE thuần; tín hiệu lấy từ DB/Redis FACT (worklog claim, human attention) chứ không đọc wording; deterministic loop floors BỊ XÓA 2 LẦN "vì AI-native elegance" và loop hồi phát cả 2 lần — doc đóng đinh "do not remove".
- GLANCE_YIELD_RULES (`server/src/agents/glance-protocol.ts`, quote code kèm link `blob/7dba7d55665ccba28fb0ff94286ce75b5e46a691`): 5 rules, "minimal by design", import VERBATIM cả cloud + BYOA prompt. Comment giải thích vì sao 5 rules đủ: agent chỉ thấy posted stream + seen-cursor → "slot-by-position" (tôi thứ 3 nên đăng 3) structurally unrepresentable → bức tường rule theo scenario cũ sụp còn 5.
- Anti-patterns (mục riêng): đừng cap 1 layer mà quên layer kia (big-brain + triage chung provider budget); đừng tích lũy scenario examples vào prompt (shape-level only); đừng dump voice rules/CLI catalog vào standing prompt (commit `bd9bc40` reverted); đừng viết section "how to handle HELD" (chính response text đã là contract); đừng chồng cơ chế anti-loop khi 4 cơ chế đã có.
- Counting-literalism cascade (2026-07-24): rule "count upward, increasing and unique" sinh ra `1, 5, 99, 100, 256, 500, 1000` với **ZERO mechanism failure** — mỗi agent đều được HELD, đọc lại, và `--send-anyway` hợp lệ theo chữ. Fix = principle 4: "PLAY THE TASK THE HUMAN MEANT, NOT THE LOOPHOLE THE WORDING PERMITS" + principle 5 "COORDINATION IS NOT THE TASK".

## Releases + cadence (gh api, 2026-09-08)

- Desktop release repo riêng `yetone/cumora-releases`: **v0.16.2 (2026-09-06)**, trước đó v0.16.1 + v0.16.0 CÙNG ngày 06-09 — 3 release/ngày; 16 assets/release.
- Commits main: PR #236 merge 2026-09-08 (sáng hôm probe) — đang chạy đều.

## Grading đề xuất cho bài

- **ADOPT** — "cơ chế định sẵn thắng jitter ngẫu nhiên": cumora bỏ random jitter vì probabilistic, thay bằng interval cứng 500ms + pacer thích ứng. Wakii đã va bài toán cùng hình dạng (batch-2: 429 khi dispatch executor dồn → stagger ≤3 slot) — đề xuất chuẩn hoá: mọi fan-out/retry của coordinator dùng spacing cố định config được, không dùng jitter ngẫu nhiên, và cap TẤT CẢ các spawn-class chia cùng budget (bài học "đừng cap một layer" của cumora).
- **DIRECTION** — hold-token-gated override: flag ghi-đè chỉ có giá trị khi agent đã được SHOW đúng cái nó muốn ghi đè, token seq-bound + TTL ngắn. Hướng đi đáng cân nhắc cho mọi "override/lời xin lỗi thông minh" của agent ở Wakii nếu sau này có bypass gate.
- **WATCH** — repo 3 tuần tuổi (created 2026-08-17 @ probe 09-08), iOS beta, Android chưa publish, v0.16.x với 3 release/ngày (cadence chưa ổn định). Watch tới khi cross-platform đều + cadence đều thì đánh giá BYOA boundary model kỹ hơn.
- **N/A** — email thật per-agent (Resend + Cloudflare Email Routing): bài toán team-chat sản phẩm của cumora, không đụng surface Wakii.

## Đã verify với bài (T7)

- [x] Mọi số kèm "theo GitHub API ngày 2026-09-08"
- [x] Quote ≤25 từ + attribution + link; MIT → "open-source" được phép (ngoài 6 slug †)
- [x] Code excerpt GLANCE_YIELD_RULES + link blob sha; COORDINATION.md link blob sha
- [x] Docs link đúng locale + cross-link chỉ bài tồn tại (nine-agents-separated-powers, gates-not-trust-rule-zero, story-memory-learning-loop)
- [x] Trung thực độ non repo (3 tuần, iOS beta, Android chưa publish) — kèm ngày probe
