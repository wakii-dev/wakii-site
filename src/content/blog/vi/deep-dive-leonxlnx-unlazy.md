---
title: "unlazy: kỷ luật hoàn thành cho agent — gates chạy được trước khi làm"
description: "unlazy không phải thư viện lazy-load ảnh mà brief matrix đoán — GitHub API xác nhận đây là skill chống 'lười' cho AI agent: viết acceptance gates trước khi làm, re-verify mọi thứ đã pass, và dám từ chối chính bằng chứng so sánh của mình."
pubDate: "2026-10-25"
category: "tech"
tags: ["gates", "evidence", "agents", "qa"]
draft: false
---

Mở đầu bằng một chỉnh sai: tên "unlazy" nghe như một thư viện tối ưu lazy-load ảnh — đề bài gốc của bài này cũng đoán vậy. GitHub API ngày 2026-09-08 nói ngược lại: Leonxlnx/unlazy là "Anti-laziness skill for AI agents" ([mô tả repo](https://github.com/Leonxlnx/unlazy)) — một skill chống bệnh "lười" của AI agent, 3.168 sao, MIT, tạo ngày 09-08-2026. Chủ đề "lười" ở đây không phải lazy-load ảnh mà là thói quen kết thúc sớm: agent báo cáo "xong" trong khi việc chưa xong. Repo này phản lại đúng thói quen đó bằng máy móc: gates chạy được viết trước khi làm, và bằng chứng thay cho lời khẳng định tự tin.

## TL;DR

- unlazy ép agent viết acceptance ledger (`GATES.md`) TRƯỚC khi triển khai: mỗi gate một kết quả quan sát được, kèm lệnh `CHECK:` và marker `EXPECT:` — gate chỉ pass khi exit code bằng 0 VÀ output khớp marker.
- Evidence do checker ghi mang digest SHA-256 của chính định nghĩa gate: đổi lệnh hay kỳ vọng là bằng chứng cũ tự thành stale-unmet — không có chuyện định nghĩa đổi mà tick cũ vẫn tính.
- Bỏ việc được đối xử trung thực: `ABANDON` kèm lý do là handoff terminal, checker exit 1 — bỏ việc không bao giờ được tính là hoàn thành.
- Đáng nể nhất là tính trung thực với chính mình: repo tuyên bố so sánh 6-run lịch sử của nó KHÔNG tái lập được và cấm dùng như bằng chứng hiệu quả.

## Repo thật là gì — và nó bán thứ gì

Sản phẩm của repo là một skill (một file `SKILL.md` cộng vài script Node, không phụ thuộc package nào) cài vào `~/.claude/skills/unlazy` hay `~/.codex/skills/unlazy`, hoặc qua skills CLI: `npx skills add Leonxlnx/unlazy`. Tác giả chính là một người, cộng một PR docs từ ngoài; pushed gần nhất 03-09-2026. Ngôn ngữ stats là JavaScript vì các script checker, không phải vì đây là một library runtime.

| Chỉ số | Giá trị |
| --- | --- |
| Sao / fork | 3.168 / 210 — theo GitHub API ngày 2026-09-08 |
| License | MIT |
| Tạo / đẩy code gần nhất | 2026-08-09 / 2026-09-03 |
| Release | không có tag nào — README khuyên pin exact commit |
| Thành phần | SKILL.md + script Node thuần (gate-check, gate-lint, stop-hook) |

Câu hỏi vì sao một repo như vậy có 3k★ trong chưa đầy một tháng có câu trả lời nằm ngoài repo: mọi người dùng agent đều đã gặp "công việc nửa vời được báo cáo đầy tự tin" — và đây là một trong những repo phổ biến nhất biến câu đó thành bài toán có máy chặn.

## Gates viết trước — bằng chứng mang digest của định nghĩa

Dòng thời gian của skill là: trước khi đụng vào việc, viết `GATES.md` từ template — mỗi gate một kết quả quan sát được. Cụ thể:

```markdown
# Gates: pricing behavior

- [ ] G1: pricing fixtures render the expected tiers
  CHECK: node scripts/verify-pricing.mjs
  EXPECT: pricing verification passed
  EVIDENCE: pending

- [ ] G2: checkout integration succeeds from its package
  CHECK: node scripts/verify-checkout.mjs
  EXPECT: checkout verification succeeded
  CWD: packages/checkout
  EVIDENCE: pending
```

— templates/gates-leaf.md, [Leonxlnx/unlazy](https://github.com/Leonxlnx/unlazy/blob/main/templates/gates-leaf.md) (probe 2026-09-08)

Gate chạy được chỉ được tính pass khi lệnh exit 0 và output khớp `EXPECT:` — cả hai điều kiện, không cái nào thay thế cái nào. Lớp thú vị hơn nằm ở evidence: checker ghi kèm digest SHA-256 versioned của chính bộ `CHECK:`/`EXPECT:`/`CWD:` đã parse; đổi bất kỳ thành phần nào của định nghĩa gate là bằng chứng cũ tự chuyển stale-unmet, phải chạy lại với định nghĩa mới. README cũng tự giới hạn đúng chỗ yếu: binding không key này phát hiện structural drift chứ không chống giả mạo — ai sửa được ledger thì giả được evidence trông đúng khuôn; ranh giới thật sự là bước approval. Phép duyệt cũng ràng buộc tổng thể: bản ghi approval ở `~/.unlazy/approved` khóa ledger, gate, lệnh, kỳ vọng, CWD, shell, timeout, platform và cả PATH — đổi input nào phải duyệt lại input đó. Câu chốt của README ([blob](https://github.com/Leonxlnx/unlazy/blob/main/README.md)) đáng ghi lại: "Approval is consent, not a sandbox."

## Bỏ việc là trung thực — nhưng không được tính là xong

Hai cơ chế hoàn chỉnh triết lý này. Thứ nhất, `--reverify` chạy lại TẤT CẢ gate chạy được, kể cả gate đã pass trước đó — CHANGELOG gọi thẳng mục đích: xóa trạng thái hoàn thành khi oracle không còn pass. Lớp verify có bốn tầng: leaf tự check, parent re-verify, branch tích hợp, và một Stop hook tùy chọn trả `decision: "block"` cho Claude Code khi còn gate unmet hay wave đang mở — hook có progress guard nhả ra sau sáu lần block không tiến triển.

Thứ hai, việc bỏ dở có một state riêng có kiểu: `ABANDON: <id> <lý do>` ghi vào ledger:

```text
- [ ] G3: old export path cleaned up
  ABANDON: G3 upstream still owns this path — needs an owner decision

checker : exit 1 · "HANDOFF REQUIRED"
parent  : không thể nhận một leaf có gate ABANDON làm ALL MET
```

— khuôn từ README.md (mục "The gate contract"), [Leonxlnx/unlazy](https://github.com/Leonxlnx/unlazy/blob/main/README.md) (probe 2026-09-08)

Bỏ việc trở thành bàn giao có handoff — trung thực, nhưng không bao giờ là thành công. Kèm theo là gate-lint: lint ledger NGAY LÚC SOẠN để bắt những gate không thể thua (lệnh luôn in cùng output, từ ngữ thành công mơ hồ, số liệu manual chưa đo) — "một oracle không thể thất bại phải bị phát hiện lúc soạn, không phải lúc chứng nhận". Và nguyên tắc chống bằng chứng vòng: đo số liệu độc lập, không copy số được cung cấp vào `EXPECT:` làm bằng chứng cho chính nó.

Toàn bộ khối này là phiên bản "gates, không phải niềm tin" mà Wakii chạy qua B-gates — xem [docs story-workflow](/vi/docs/story-workflow/) và bài [gates, not trust — và Rule 0](/vi/blog/gates-not-trust-rule-zero/) — được một tác giả độc lập tái phát minh dưới dạng skill di động. Sự hội tụ đó là tín hiệu: kỷ luật hoàn thành đang chuẩn hóa thành kỹ thuật agent chung.

## Repo dám từ chối bằng chứng của chính nó

Phần khiến repo này xứng đáng học nhất không phải code. File [`research/validation-protocol.md`](https://github.com/Leonxlnx/unlazy/blob/main/research/validation-protocol.md) khai luôn: so sánh 6-run lịch sử (2 task × 3 điều kiện: không skill / tree 3 / tree 6) từng được nhắc trong các bản README cũ là nguồn cảm hứng thiết kế v2 — nhưng repo KHÔNG lưu transcript, log token, hay mã tính toán của 6 lần chạy đó, nên "các con số đã báo cáo không thể tái lập hay audit từ source". Kết luận của chính file: coi đây là design provenance, quá nhỏ cho bất kỳ claim mô hình nào, và "không được mô tả như bằng chứng rằng unlazy gây ra một cải thiện hay mức chi phí cụ thể" ([cùng file](https://github.com/Leonxlnx/unlazy/blob/main/research/validation-protocol.md)). File tiếp tục đưa protocol tối thiểu để ai đó chạy lại đúng science: pre-register điều kiện, isolate từng run, archive toàn bộ transcript.

Một repo bán kỷ luật bằng chứng mà tự chịu thiệt vì trung thực về bằng chứng của mình — đó là learn-in-public thật.

## Wakii học được gì

- **DIRECTION** — definition-digest evidence binding: bằng chứng của một gate mang digest của chính định nghĩa gate, định nghĩa đổi là bằng chứng cũ tự stale-unmet. Wakii re-verify full-sweep lúc convergence, nhưng khi một plan task đổi giữa chừng thì "PASS của định nghĩa cũ" chưa bị đánh dấu rõ ràng — digest pin là cách làm cho drift đó hiện lên trong audit thay vì nhờ re-review scoped tình cờ bắt được.
- **DIRECTION** — abandonment as a typed terminal state: `ABANDON` + lý do bắt buộc, exit 1 HANDOFF REQUIRED, gate cha không nhận con abandoned làm ALL MET. Wakii có báo cáo BLOCKED và rollback-fixer; đưa "bỏ việc có lý do" thành state có kiểu trong bracket — không thể bị nuốt thành Done — là phiên bản sắc hơn của cùng ý.
- **N/A** — Depth Tree với leases, waves, rolling dispatch và tier judgment/mechanical: Wakii đã chạy hình thế tương đương (bracket tiers, wave dispatch, slot spacing) — hai thiết kế hội tụ độc lập; khác biệt là bề mặt, không phải bản chất.
- **WATCH** — một maintainer, version 2.1.0 chưa release (README khuyên pin commit), bằng chứng so sánh tự tuyên bố không tái lập được: theo thêm độ chín và mức adoption trước khi mang cơ chế chi tiết vào sản phẩm.

Wakii là agentic IDE với một đội superpowers có sẵn — gates trước, bằng chứng sau, 9 agent tách quyền. [Tải Wakii](/vi/docs/getting-started/) và chạy một story mà không phải tin lời "đã xong" của ai.
