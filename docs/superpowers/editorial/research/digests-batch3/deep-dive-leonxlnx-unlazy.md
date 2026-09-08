# Leonxlnx/unlazy — research digest (batch-3, matrix #50)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: Leonxlnx/unlazy
- facet: misc
- stars @ 2026-09-08: 3166 (probe SF-1) — re-probe cùng ngày bởi SF-5: 3168 (hai số đều thật, cùng ngày; bài cite 3.168)
- license (GitHub API 2026-09-08): MIT
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh` + `gh api` trực tiếp của SF-5)

## ⚠ KẾT LUẬN GROUND-TRUTH — matrix title SAI, bài viết theo sự thật

- Matrix #50 ghi title hint "unlazy: tối ưu lazy-load ảnh" — **SAI so với repo
  thật**. GitHub API ngày 2026-09-08: description repo = "Anti-laziness skill
  for AI agents. Core: the Depth Tree method … Grounded in 2025-2026 research
  on model laziness, underthinking and premature completion"; topics:
  ai-agents, claude, claude-code, llm, productivity, prompt-engineering, skill.
- Có một thư viện JS cùng tên "unlazy" cho lazy-load ảnh (khác repo này) —
  nhiều khả năng nguồn nhầm lẫn của matrix. Slug/pubDate/category GIỮ NGUYÊN
  theo matrix (contract), title bài viết theo SỰ THẬT: skill kỷ luật hoàn
  thành cho agent. Đã ghi rõ sự lệch này trong bài (đó là một phần giá trị
  learn-in-public).
- Cụm skills-as-content của pack ÁP ĐƯỢC cho repo này theo hướng ĐÚNG hơn:
  đây là skill dạng "engineering discipline" — không phải lib ảnh, không phải
  bộ skill đa mục như ASu-skills.

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

### README notes (probe 2026-09-08)

- "Completion discipline for substantial AI-agent work, backed by runnable
  gates." — viết acceptance ledger TRƯỚC, chạy check đã duyệt, re-verify công
  việc trả về, chỉ báo cáo thứ mà bằng chứng chống đỡ được.
- 3.168★ / 210 fork, MIT, JavaScript; created 2026-08-09, pushed 2026-09-03
  (theo GitHub API ngày 2026-09-08). Zero third-party runtime packages (Node ≥16).
- Cài qua skills CLI của vercel-labs (`npx skills add Leonxlnx/unlazy`) hoặc
  clone vào `~/.claude/skills/unlazy` / `~/.codex/skills/unlazy`.

### Kiến trúc cơ chế (SKILL.md + README + CHANGELOG, probe 2026-09-08)

- Ledger `GATES.md` viết TRƯỚC khi làm: mỗi gate 1 kết quả quan sát được +
  `CHECK:` (lệnh) + `EXPECT:` (marker thành công) + `EVIDENCE:`. Gate chạy
  được chỉ PASS khi exit 0 VÀ `EXPECT:` khớp output gộp.
- **Definition-digest binding**: evidence do checker ghi mang versioned full
  SHA-256 digest của `CHECK:`/`EXPECT:`/`CWD:` đã parse — đổi định nghĩa gate
  ⇒ evidence cũ stale-unmet. README tự giới hạn: binding không key phát hiện
  structural drift, KHÔNG chống giả mạo ledger ("anyone who can edit a ledger
  can forge canonical-looking evidence").
- Phân tầng mode: solo (1 GATES.md) / orchestrated (PLAN.md + ledger từng leaf
  + branch) / parallel (leases `OWNS:`, wave dispatch, `dispatch.json`) —
  Depth Tree: chia việc N tầng, mỗi leaf có ledger riêng, branch có integration
  gates. Tier `judgment`/`mechanical` là planner metadata, KHÔNG đảm bảo
  routing model.
- 4 lớp verify: leaf self-check → parent `--reverify` (chạy lại CẢ gate đã
  pass; CHANGELOG: "removes completion when the oracle no longer passes") →
  branch integration → Stop hook tùy chọn (Claude Code `decision: "block"`
  khi còn gate unmet/wave mở; progress guard nhả sau 6 block không tiến triển —
  không wedge). Chỉ lớp parent + branch độc lập với leaf.
- Approval = consent, không phải sandbox: approval records ở `~/.unlazy/approved`
  (ngoài repo, fail-closed với symlink), bind TOÀN BỘ ledger/gate/lệnh/EXPECT/
  CWD/shell/timeout/limit/platform/PATH — đổi input nào cũng phải duyệt lại.
- `ABANDON: <id> <lý do>` = handoff terminal, checker exit 1 "HANDOFF REQUIRED"
  — bỏ việc là trung thực nhưng KHÔNG BAO GIỜ là hoàn thành.
- `gate-lint.mjs`: lint ledger lúc SOẠN (warning: lệnh output-cố-định, từ
  thành công yếu, title "activity", số manual chưa đo); `--strict` fail.
- Chống bằng chứng vòng: "measure supplied figures instead of copying them
  into `EXPECT:`". Proportionality: "Do not create gates for a trivial edit".
- **Trung thực về bằng chứng của chính nó**: research/validation-protocol.md
  tuyên bố comparison 6-run lịch sử (2 task × 3 điều kiện no-skill/tree-3/
  tree-6) KHÔNG tái lập được từ source (không lưu transcript/log token) —
  "design provenance only", cấm mô tả là bằng chứng unlazy gây ra cải thiện
  cụ thể; kèm protocol tối thiểu để chạy lại được (pre-register, isolate,
  archive). Commit gần nhất 09-03 "fix: bind gate evidence and harden Windows
  identity".

### Releases

- KHÔNG có release/tag (probe `releases?per_page=5` 2026-09-08: rỗng). Source
  nhắm 2.1.0 CHƯA release — README khuyên pin exact commit khi cần cài bất
  biến. Tác giả chính 1 người + 1 PR docs ngoài (#29).

### Wakii grading (được dùng trong bài)

- DIRECTION — definition-digest evidence binding: evidence mang digest của
  định nghĩa gate; đổi CHECK/EXPECT/CWD ⇒ evidence cũ tự stale. Wakii có
  re-verify full-sweep lúc convergence nhưng "evidence của định nghĩa CŨ" chưa
  bị đánh dấu rõ khi plan task đổi giữa chừng (hiện chỉ re-review scoped bắt).
- DIRECTION — abandonment as typed terminal state: `ABANDON` + lý do ⇒ exit 1
  HANDOFF REQUIRED, gate cha không nhận con abandoned làm ALL MET. Wakii có
  BLOCKED + rollback-fixer; biến "bỏ việc" thành state có kiểu trong bracket
  (không thể bị nuốt thành Done) là phiên bản sắc hơn.
- N/A — Depth Tree leases/waves/rolling dispatch + tier judgment/mechanical:
  Wakii đã chạy hình thế tương đương (bracket tiers + wave dispatch + slot
  spacing) — hội tụ độc lập, khác bề mặt không phải bản chất.
- WATCH — 1 maintainer, 2.1.0 chưa release (pin commit), tự tuyên bố bằng
  chứng so sánh của mình không tái lập được: độ chín và mức adoption cần theo
  thêm trước khi mang cơ chế chi tiết về sản phẩm.
