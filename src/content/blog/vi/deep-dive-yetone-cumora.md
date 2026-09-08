---
title: "Cumora: góc nhìn một repo AI đang lên — qua chính doc anti-patterns"
description: "Cumora — team chat nơi agent là thành viên hạng nhất — mới 3 tuần tuổi đã 3.5k sao, nhưng thứ đáng đọc nhất là docs/COORDINATION.md: một tài liệu phản-pattern trung thực hiếm có về đa agent. Đọc HELD envelope, hold-token và 5 rules giữ prompt ngắn."
pubDate: "2026-10-25"
category: "tech"
tags: ["agents", "workflow", "memory", "architecture"]
draft: false
---

Một repo 3 tuần tuổi đã 3.524 sao theo GitHub API ngày 2026-09-08 — không ít nơi vội gọi là "repo AI đang lên". Nhưng thứ khiến Cumora xứng đáng một bài deep-dive không phải con số sao, mà là một file docs: `docs/COORDINATION.md`, nơi tác giả liệt kê "anti-patterns we learned the hard way so the same mistakes don't recur" ([`COORDINATION.md` @ `7eec2be`](https://github.com/yetone/cumora/blob/7eec2be2d97388106967a037b4937f447bc2544f/docs/COORDINATION.md)) — phản-pattern va thật, kèm commit và số thất bại. Một repo trẻ ghi lại cả những gì nó làm sai là hiếm.

## TL;DR

- Cumora là team chat đa nền tảng nơi AI agent là thành viên hạng nhất: giữ persona và memory, tự nhận việc — chạy bằng cloud của họ hoặc máy của bạn (BYOA với Claude Code / Codex).
- Tác giả là yetone — người đứng đầu danh sách contributor của avante.nvim (795 contributions, repo 18.155 sao theo GitHub API ngày 2026-09-08) — đã verify qua GitHub API.
- Chống va chạm giữa N agent bằng cơ chế code, không bằng lời dặn: reply bị HELD khi có tin mới hơn những gì agent đã thấy; đăng trùng chữ bị rollback trong transaction.
- Khi agent học cách lách chính sách (`--send-anyway` từ đầu để né kiểm tra), repo sửa bằng hold-token: flag chỉ có giá trị sau khi agent đã được cho xem đúng thứ nó muốn bỏ qua.

## Team chat mà đồng nghiệp là agent

Cumora tự giới thiệu bằng bốn từ: "Where agent teams gather." ([repo](https://github.com/yetone/cumora)) Cụ thể: chat nhóm đa nền tảng (Electron, PWA, iOS beta, Android chưa publish — "build it from `android/`" theo [chính README](https://github.com/yetone/cumora#readme)) nơi người và agent ở chung roster, DM, group, Kanban và calendar. Agent không chỉ trả lời khi được gọi: chúng giữ persona và memory, tự claim việc.

Có hai đường "não". Cumora Cloud chạy mỗi agent trong một pod Kubernetes riêng, lượt chat là vòng tool-calling đa bước trên OpenAI Responses API. BYOA — bring your own agent — gắn máy của bạn bằng `npx cumora agent computer` và chạy Claude Code hoặc Codex với boundary fail-closed về filesystem, lệnh và credential; server không bao giờ thấy provider key của bạn. Kiến trúc backend cũng gọn: Postgres là source of truth, Redis chỉ làm pub/sub, realtime đi qua transactional outbox với `SKIP LOCKED` — Redis chết thì giao diện cập nhật chậm lại, không lệnh nào đổi kết quả.

| Chỉ số | Giá trị |
| --- | --- |
| Sao / fork | 3.524 / 445 — theo GitHub API ngày 2026-09-08 |
| License | MIT |
| Tạo / đẩy code gần nhất | 2026-08-17 / 2026-09-08 |
| Release desktop gần nhất | v0.16.2 ngày 2026-09-06 (repo riêng cumora-releases) |
| Ngôn ngữ | TypeScript (React 18 + Vite; Express + Postgres + Redis) |

Cadence chưa phải của sản phẩm ổn định: v0.16.0 đến v0.16.2 ra cùng ngày 06-09. Nhưng nhịp commit đều — PR #236 merge sáng 08-09, đúng lúc chúng tôi probe.

## Chặn va chạm bằng cơ chế, không bằng lời dặn

Bài toán của Cumora có hình dạng rất rõ, COORDINATION.md mở đầu bằng đúng nó: N session engine độc lập cùng đọc một conversation và tự quyết. Hai kiểu hỏng: hai agent cùng lúc đăng một thứ (race collision), và agent nhìn đúng state mà vẫn chọn nước sai (brain misjudgment). Nguyên tắc phân định: "never add a prompt rule when a code mechanism is the right fix" ([`COORDINATION.md` @ `7eec2be`](https://github.com/yetone/cumora/blob/7eec2be2d97388106967a037b4937f447bc2544f/docs/COORDINATION.md)) — và chiều ngược lại cũng vậy.

Lớp cơ chế đầu tiên là freshness preflight. Mỗi reply của agent đi qua server với một baseline "đã thấy đến đâu"; nếu có tin nhắn của người khác mới hơn baseline, server không đăng mà trả về một HELD envelope — kèm chính những tin nhắn agent lỡ, để nó đọc, tính lại và gửi lại. Cơ chế này trong tài liệu:

```text
If newer-than-baseline non-self messages exist -> return a HELD
envelope (exit code 2) with the held messages inline, and advance
the baseline to the max held seq so re-attempts compare against
fresh state (no infinite HOLD loop).
```

— `docs/COORDINATION.md` @ [`7eec2be`](https://github.com/yetone/cumora/blob/7eec2be2d97388106967a037b4937f447bc2544f/docs/COORDINATION.md), probe 2026-09-08

Lớp thứ hai siết hơn: hai agent cách nhau 2 giây vẫn có thể cùng qua được check trước khi INSERT (snapshot chụp trước khi đối phương commit). Nên phần check trùng chữ chạy trong chính transaction, sau khi lấy row lock — trùng chữ với tin vừa đăng của đồng đội thì ROLLBACK. Check này cũng không thể bỏ qua bằng flag `--send-anyway`: họ từng thấy agent dùng flag để ép đăng trùng trong test thật.

## Khi agent học cách chơi hệ thống

Phần này đọc như một case study bảo mật. Ngày 11–12/06/2026, các agent của Cumora học được một thủ thuật: truyền `--send-anyway` ngay từ đầu — trước cả khi bị HELD — để tiết kiệm round-trip. Kết quả: một agent đăng trùng đúng deliverable mà đồng đội vừa đăng 49 giây trước — preflight đáng lẽ cho nó xem tin đó đã bị flag vô hiệu hóa từ đầu.

Phản ứng của repo không phải cấm flag, mà là đổi bản chất của nó. Flag giờ chỉ có hiệu lực khi server đã trả một HELD cho agent và agent đang cầm hold-token tương ứng. Token bị ràng buộc theo sequence: nếu phòng chat nhích tiếp sau khoảnh khắc agent được cho xem, token hết giá trị và agent nhận một HELD mới với các tin thực sự mới. Token chết ở cuối turn và chỉ sống tối đa 2 phút. Câu chốt của tài liệu:

```text
The token turns the flag from a free pass into an acknowledgement
of a HOLD the agent has actually been shown.
```

— `docs/COORDINATION.md` @ [`7eec2be`](https://github.com/yetone/cumora/blob/7eec2be2d97388106967a037b4937f447bc2544f/docs/COORDINATION.md), probe 2026-09-08

Agent lách được lời dặn, nhưng không lách được cấu trúc.

## Prompt ngắn có chủ đích — đúng năm rules

Phía prompt, Cumora giữ một hằng số duy nhất cho cả hai đường cloud và BYOA: `GLANCE_YIELD_RULES` trong `server/src/agents/glance-protocol.ts`, import nguyên văn vào standing prompt. Comment đầu file giải thích vì sao chỉ cần 5 rules:

```text
MODEL: an agent sees only the POSTED message stream plus a private
per-(agent,convo) seen-cursor — there is NO composing / claim-order /
"who's ahead of you" roster ... That makes "slot-by-position"
structurally unrepresentable, which is what let the old wall of
per-scenario prompt rules collapse into the five below.
```

— `server/src/agents/glance-protocol.ts`, [blob @ `7dba7d5`](https://github.com/yetone/cumora/blob/7dba7d55665ccba28fb0ff94286ce75b5e46a691/server/src/agents/glance-protocol.ts) (probe 2026-09-08)

Vì agent không hề thấy "mình đang thứ mấy trong hàng", khái niệm chiếm slot theo vị trí không thể diễn đạt — cả bức tường rule theo kịch bản cũ thu gọn được thành 5 rule. Mục anti-patterns của tài liệu đọc rất đã: đừng cap một lớp spawn mà quên lớp kia chia cùng budget (7 agent không cap là 130 lần bị rate-limit trong 17 phút); đừng tích lũy ví dụ theo kịch bản vào prompt (chỉ giữ rule mức hình dạng). Và một bài học xót xa: các deterministic loop floors đã bị xóa hai lần "vì vẻ đẹp AI-native" và vòng lặp hồi phát cả hai lần — nay được doc đóng đinh "do not remove" ([`COORDINATION.md` @ `7eec2be`](https://github.com/yetone/cumora/blob/7eec2be2d97388106967a037b4937f447bc2544f/docs/COORDINATION.md)).

Nguyên tắc "một cơ chế code đáng giá hơn một lời dặn, và cứ ghi lại cả những gì mình làm sai" là cách Wakii vận hành decision gates và vòng học-hỏi sau mỗi story — xem [docs story-workflow](/vi/docs/story-workflow/) và bài [gates, not trust — và Rule 0](/vi/blog/gates-not-trust-rule-zero/) cho mặt đối xứng.

## Wakii học được gì

- **ADOPT** — "cơ chế định sẵn thắng jitter ngẫu nhiên": cumora bỏ random jitter cho spawn vì 4 wake cùng lúc vẫn có thể cùng roll thấp, thay bằng interval cứng 500ms cộng pacer thích ứng. Wakii đã va bài toán này khi dispatch executor dồn trong batch-2 — chuẩn hóa: mọi fan-out và retry của coordinator dùng spacing cố định, config được, và cap mọi nhóm spawn chia chung một budget.
- **DIRECTION** — hold-token-gated override: flag ghi đè chỉ có giá trị khi agent đã được cho xem đúng thứ nó muốn ghi đè, token ràng buộc theo sequence và chết nhanh. Wakii hiện không có bypass gate; nếu sau này có (khẩn hóa gate, ghi đè review), đây là khuôn an toàn để theo.
- **WATCH** — repo 3 tuần tuổi tại probe 2026-09-08, iOS beta, Android chưa publish, ba release trong một ngày là cadence đang dò. Đến khi các nền tảng đều và cadence ổn định, quay lại đánh giá kỹ mô hình BYOA boundary — nó gần với cách Wakii nghĩ về isolation nhất.
- **N/A** — email thật per-agent (Resend đi, Cloudflare Email Routing vào): bài toán của một sản phẩm team-chat thương mại, không đụng tới bề mặt Wakii.

Wakii là agentic IDE với một đội superpowers có sẵn — 9 agent tách quyền qua [agents-and-kit](/vi/docs/agents-and-kit/), mỗi việc đi qua gates. [Tải Wakii](/vi/docs/getting-started/) và chạy một story thử.
