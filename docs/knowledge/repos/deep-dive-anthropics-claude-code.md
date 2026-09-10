# anthropics/claude-code — research digest (batch-3, matrix #5)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: anthropics/claude-code
- facet: harness
- stars @ 2026-09-08: 144420 (re-probe SF-2 cùng ngày; SF-1 probe 144416 — sao trôi trong ngày, bài cite 144.420 + ngày)
- license (GitHub API 2026-09-08): none († — gọi "công khai trên GitHub", KHÔNG "open-source")
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`; re-probe bằng `gh api repos/anthropics/claude-code` — exit 0)

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

## README notes

- Tự mô tả: agentic coding tool sống trong terminal, hiểu codebase, chạy qua natural
  language; dùng được trong terminal, IDE, hoặc tag @claude trên GitHub. Docs chính tắc
  tại code.claude.com/docs/en/overview.
- **npm install DEPRECATED** — cài qua `curl -fsSL https://claude.ai/install.sh | bash`,
  brew cask, winget. Tool ship như bản đóng gói hoàn chỉnh, không build từ repo.
- Repo gồm: hướng dẫn cài đặt, plugins/ (13 plugin chính thức), `/bug` command để báo
  issue trực tiếp trong tool, section "Data collection, usage, and retention" (feedback
  + usage data, policies riêng).
- README @ ab9b2cf KHÔNG chứa cụm cấm † — trích được an toàn.

## Architecture (outside view @ commit ab9b2cf)

- **Repo KHÔNG chứa mã của tool.** Root: CHANGELOG.md (6.362 dòng, 387 bản ghi
  `## <version>`), LICENSE.md (1 dòng), README.md, SECURITY.md, demo.gif, feed.xml,
  examples/ (gateway · hooks · mdm · settings), plugins/ (13), scripts/ (8 file),
  Script/ (1 file PowerShell devcontainer).
- **LICENSE.md toàn văn**: "© Anthropic PBC. All rights reserved. Use is subject to
  Anthropic's Commercial Terms of Service." — GitHub API vì thế trả `license: none`.
  Đây là gốc của quy tắc † cho slug này.
- **plugins/ = source thật duy nhất đọc được** (markdown + hooks):
  - `pr-review-toolkit`: 6 agents — code-reviewer, code-simplifier, comment-analyzer,
    pr-test-analyzer, silent-failure-hunter, type-design-analyzer + command
    `review-pr.md`. silent-failure-hunter system prompt: "Silent failures are
    unacceptable - Any error that occurs without proper logging and user feedback is
    a critical defect" (18 từ — trích được, blob link có).
  - `code-review`: 5 agent song song (CLAUDE.md compliance, bug detection, historical
    context, PR history, code comments) + "confidence-based scoring to filter false
    positives" (plugins/README.md).
  - `security-guidance`: review bảo mật 3 lớp — (1) PreToolUse hook regex ~25 pattern
    nguy hiểm trên Edit/Write; (2) cuối turn gửi diff cho 1 lời gọi LLM nhanh, finding
    severity cao feed ngược; (3) lúc `git commit`, SDK reviewer đọc file liên quan
    (Read/Grep/Glob) truy data-flow đa file (IDOR, auth bypass, cross-file SSRF).
  - `ralph-wiggum`: Stop hook chặn exit để tiếp tục vòng lặp tự động.
- **scripts/ = máy triage issue**: auto-close-duplicates.ts, backfill-duplicate-
  comments.ts, comment-on-duplicates.sh, edit-issue-labels.sh, gh.sh, issue-lifecycle.ts,
  lifecycle-comment.ts, sweep.ts — phục vụ 12.654 open issues (API 2026-09-08).
- **Cơ chế lộ qua CHANGELOG @ ab9b2cf (bản 2.1.261)**: `bashOutputMaxChars` /
  `taskOutputMaxChars` (output inline tới 128K chars trước khi ghi file — budget
  context); `/skill-doctor` ("which loaded skills go unused and what they cost in
  context" — 20 từ, trích được); fix "in-process agent-team teammates re-sending their
  first-turn tool and skill announcements … missed the prompt cache" (cơ chế agent
  teams + prompt cache lộ qua dòng fix); dangerous-`rm` safety prompt bắt thêm
  `rm -rf` trong tham số vị trí / chuỗi `sh -c` trích kép; auto-mode coi link nhồi
  nội dung vào dịch vụ render diagram công khai như upload — không auto-approve.

## Releases (GitHub API 2026-09-08)

- 30 release gần nhất (`releases?per_page=30`): v2.1.224 (2026-08-07T04:00Z) →
  v2.1.263 (2026-09-06T02:54Z) — **30 release trong 30 ngày**, có ngày 2 cái
  (v2.1.257 + v2.1.258 cùng 2026-09-01).
- Mới nhất tại probe: **v2.1.263** @ 2026-09-06 (trùng pushed_at — push đó chính là release).
- Repo tạo 2025-02-22; 387 bản ghi phiên bản trong CHANGELOG @ ab9b2cf (từ 0.2.x).

## Wakii grading (style-guide §8)

- **ADOPT** — confidence-based scoring cho review findings (code-review plugin chấm
  độ tin cậy từng finding để lọc false positive). Wakii có code-reviewer + verifier
  tách vai nhưng findings tới người duyệt đồng đều về trọng số; đề xuất finding kèm
  confidence, gate chỉ block ở high-confidence. → adopt-draft đã ghi.
- **DIRECTION** — changelog công bố cơ chế (mỗi release 1-2 dòng "cơ chế đã đổi";
  v2.1.261 của claude-code giải thích cả prompt-cache của agent teams qua một dòng
  fix). Wakii release notes hiện ở mức tính năng; 24 story-* CLIs trong kit đủ dày
  để hứng thể loại tài liệu sống này.
- **WATCH** — mô hình "ToS thay license" + hệ plugin marketplace: core đóng, rìa
  plugin markdown mở. Theo dõi xem marketplace plugin có thành lớp phân phối chuẩn
  của ngành (Wakii có 20 skills đọc được nhưng chưa có marketplace).
- **N/A** — máy triage issue quy mô 12.654 open: scripts/ tồn tại vì cộng đồng cỡ
  đó; Wakii đang ở quy mô khác, auto-close-duplicates là chi phí thừa.

## Góc bài (khác landscape)

- Landscape (agentic-landscape-50-projects) chỉ ghi claude-code 144.4k★ + "fastest
  shipper" / 3-release-4-ngày. Bài này đi SÂU: Outside View method — 4 cửa sổ công
  khai (changelog / plugins / scripts / license file) và mỗi cửa sổ lộ gì về kiến
  trúc; cadence probe mới dày hơn (30 release/30 ngày).
- Cấm † kiểm tra: README + LICENSE + plugins README + changelog excerpts đã đọc
  KHÔNG chứa cụm cấm trong phần định trích — quote đã chọn sạch.
