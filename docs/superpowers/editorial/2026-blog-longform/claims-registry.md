# Claims registry — blog longform (story FI-359)

> **Máy + người cùng đọc.** `scripts/check-blog-content.mjs` grep section
> `## FORBIDDEN` (literal, case-insensitive) trên 20 slug mới — seed được miễn.
> Writer tự check bài của mình vs cả hai section trước khi commit (runbook bước 6).
>
> **Section contract (PIN — plan-critic 2026-09-07):** dòng greppable = chính xác
> các dòng `- ...` trong `## FORBIDDEN` bên dưới (mỗi dòng 1 cụm literal; parse
> dừng ở heading `##` kế tiếp). Biến thể rộng nằm ở `## FORBIDDEN — variants
> (review-only)` — lint BỎ QUA heading này; SF-5 claims sweep + review bắt nốt.

## ALLOWED

- 9 agents đủ tên: **phase0-impact-analyst, spec-critic, plan-critic, task-executor, designer, code-reviewer, verifier, security-audit, rollback-fixer** — nguồn: `src/content/docs/en/agents-and-kit.md` ("The 9-agent story team").
- Skills kit: **20 tổng / 13 public** theo snapshot D8 ngày 2026-09-08 (`src/data/skills.ts`, `public: true` ×13 — đếm TRONG mảng `export const skills`, không grep whole-file) — bài viết PHẢI ghi kèm "tại thời điểm viết"; con số KHÔNG pin vào contract, quy tắc đọc-tại-thời-điểm là pin. ⚠ Snapshot FI-359 (21/14 @ 2026-09-07) là ĐẾM SAI pattern, không phải content đổi — phân tích gốc ở `## Drift-note — skills 21/14 → 20/13` bên dưới.
- **24 story-* CLIs** trong kit (`~/.claude/bin/story-*`) — verified `ls ~/.claude/bin | grep '^story-'` ngày 2026-09-07 (25 match − 1 file .html).
- Zero-setup: kit tự cài lần đầu vào `~/.claude/` (skills + agent definitions + story-* CLIs), **idempotent**, không đụng config sẵn — nguồn: docs getting-started §5 "First run — nothing to set up".
- Superpowers panel đúng 2 tab: **⚡ Workflow** + **🌳 Story** — nguồn: docs superpowers-panel.
- **Bracket canvas** — live SVG graph của story (epic node + SF nodes theo tier) — nguồn: docs superpowers-panel §Story tab.
- **Gates B0–B5** — code + tests green, plan ticked, independent review, merged, issue done — nguồn: docs story-workflow.
- **Watchdog 3-layer check**: recent commits / terminal output / Linear state — nguồn: docs story-workflow §"Watchdog: idle is not dead".
- Pipeline: **idea → impact → plan → epic + SF → parallel SFs → gates → 1 PR** — nguồn: docs story-workflow.
- **8 principles** — nguồn: docs story-workflow §"The eight principles" (liệt kê tên được từng principle).
- **QR pairing từ desktop** (desktop hiện QR, phone quét) — claim mobile đã verify, FI-341 review APPROVED.
- **Story view trên mobile: SF tiers + progress từng SF** — claim mobile đã verify, FI-341.
- **Gates trên mobile: choice + free-text + confirm trước khi gửi** — claim mobile đã verify, FI-341.
- **Notification open/closed** (gate-closed xác nhận vòng chờ khép) — claim mobile đã verify, FI-341.
- **Guard codes**: resolve trùng hoặc gate đã đóng bị guard chặn với mã lỗi rõ ràng, không nuốt im lặng — claim mobile đã verify, FI-341.
- **Dark-only** theme (không có light toggle) — nguồn: as-built `src/styles/global.css` (`color-scheme: dark`), user confirm.
- Repo public **`github.com/wakii-dev/wakii` (MIT)**, fork của Orca (MIT) — nguồn: `src/config.ts` REPO_URL + footer credit.
- **Releases version-named assets** (URL pin đúng version) — nguồn: `src/config.ts` DOWNLOAD_URLS comment + `gh release list`.
- **v1.4.198 + v1.4.199 cùng ngày 2026-09-05** + pre-release Android `mobile-android-v0.0.48` cùng ngày; **KHÔNG có v1.4.197** trên public repo — nguồn: `gh release list --repo wakii-dev/wakii` (snapshot D8 2026-09-07).
- Blog hiện có **10 seed posts (5 slug × 2 locale)** từ FI-341 — nguồn: `src/content/blog/{en,vi}/`.

## FORBIDDEN

<!-- Lint grep các dòng `- ...` bên dưới — literal, case-insensitive. -->

- stories tab — mọi biến thể tên tab trong bài MỚI; dùng "story view" (seeds grandfathered FI-341)
- pairing persist — claim pairing sống qua phiên/thiết bị chưa verify (FI-341 P1)
- mọi state — claim "đồng bộ mọi state sang phone" chưa verify (FI-341 P1)
- every state — bản EN của claim trên (FI-341 P1)
- worktree from your phone — claim mở/spawn worktree từ phone chưa verify (FI-341 P1)
- worktrees from your phone — số nhiều của claim trên (plan-critic P1 plural pin)
- worktree từ phone — bản VI (FI-341 P1)
- worktrees từ phone — số nhiều bản VI (plan-critic P1 plural pin)

## FORBIDDEN — variants (review-only)

> Lint KHÔNG grep heading này. SF-5 claims sweep + reviewer đọc.

- Mọi biến thể claim mobile CHƯA verify theo FI-341: những gì được phép nói về
  mobile CHỈ là 5 claim APPROVED ở `## ALLOWED` (QR pairing từ desktop · story view
  SF tiers/progress · gates choice/free-text+confirm · notification open/closed ·
  guard codes). Ngoài 5 claim đó, KHÔNG claim gì thêm về mobile — kể cả paraphrase:
  "sync state across devices" / "state persists across sessions" / "pick up where
  you left off on your phone" / "mở worktree trên điện thoại" / "chạy agent từ
  phone" / "sync mọi thứ sang phone" / "tiến độ tự động cập nhật cả hai máy".
- "Stories tab" biến thể: "tab Stories" / "the Stories view" trong danh từ chỉ UI
  mobile — dùng "story view" thay thế. (Tag `stories` trong frontmatter VẪN dùng
  được — cấm là cụm prose, không phải tag.)
- Số liệu không nguồn: mọi con số (số skills, số CLIs, số release, số posts, số
  agents) phải truy được về `evidence-pack.md` §Numbers snapshot (D8) — không tin
  số nhớ-cache không nguồn.
- KHÔNG claim v1.4.197 tồn tại; KHÔNG claim release chung chung "hàng tuần" —
  cadence chỉ nói từ case 09-05 đã verify.
- KHÔNG bịa screenshot/transcript: ASCII diagram + transcript phải đi từ vật liệu
  thật trong `evidence-pack.md`.

## Verify-shipped — batch-2 features (2026-09-08)

> DEC-8: 8 bài features (SF-3) CHỈ được claim theo NHÃN dưới đây. Đối chiếu
> code orca local (READ-ONLY) + release v1.4.199 (`gh release view`).
> Nhãn: **SHIPPED** = có code + nằm trong release notes ≤ v1.4.199 ·
> **MAIN-ONLY** = code trên main orca nhưng chưa nằm release nào ·
> **ROADMAP** = không tìm thấy code/notes. Audit T3 parse section này
> (dòng `- feature-<tên> — <NHÃN> — ...`); `PENDING-VERIFY` = placeholder
> chưa verify — bài features KHÔNG ĐƯỢC viết khi còn placeholder.

- feature-terminal-splits — PENDING-VERIFY
- feature-ssh-worktrees — PENDING-VERIFY
- feature-design-mode — PENDING-VERIFY
- feature-ai-diff-annotation — PENDING-VERIFY
- feature-emulator-android — PENDING-VERIFY
- feature-computer-use-native — PENDING-VERIFY
- feature-per-workspace-env — PENDING-VERIFY
- feature-notification-keyboard — PENDING-VERIFY

## Quy tắc snapshot D8 (pin từ epic spec)

Số liệu trong bài **re-extract ĐỐI CHIẾU SNAPSHOT** (`evidence-pack.md`
§Numbers snapshot) — không tin số nhớ-cache không nguồn. Nếu nguồn thật đã drift
so với snapshot tại thời điểm viết: ghi số theo SNAPSHOT + ngày chụp trong bài
("tại thời điểm viết"). Drift phát hiện ở QA (SF-5) = ghi chú, không fail.
Mỗi evidence block trong bài ghi nguồn + ngày lấy.
