# Claims registry — blog longform (story FI-359)

> **Máy + người cùng đọc.** `scripts/check-blog-content.mjs` grep section
> `## FORBIDDEN` (literal, case-insensitive) trên 20 slug mới — seed được miễn.
> Writer tự check bài của mình vs cả hai section trước khi commit (runbook bước 6).
>
> **Section contract (PIN — plan-critic 2026-09-07; scoped mở rộng FI-383):**
> dòng greppable = chính xác các dòng `- ...` trong `## FORBIDDEN` bên dưới
> (mỗi dòng 1 cụm literal; parse dừng ở heading `##` kế tiếp). Dòng có đuôi
> `— scope: <slugs>` = **scoped FORBIDDEN** — chỉ grep trên slug trong list
> (parser GIỐNG NHAU ở `check-blog-content.mjs` lẫn `audit-blog-convergence.mjs`:
> cùng tree ⇒ cùng kết quả). Biến thể rộng nằm ở `## FORBIDDEN — variants
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

<!-- FI-383 batch-3: 2 dòng scoped dưới đây CHỈ áp cho 6 slug † (license
     none/NOASSERTION) — bài của repo † gọi "công khai trên GitHub", KHÔNG
     "open-source"/"mã nguồn mở". Bài khác (batch-1/2 + 44 slug batch-3 còn
     lại) dùng hai cụm này tự do. Xem §Third-party claims — batch-3. -->
- "open-source" — scope: deep-dive-anthropics-claude-code,deep-dive-modelcontextprotocol-servers,deep-dive-modelcontextprotocol-registry,deep-dive-zed-industries-zed,deep-dive-tabbyml-tabby,deep-dive-janhq-jan
- "mã nguồn mở" — scope: deep-dive-anthropics-claude-code,deep-dive-modelcontextprotocol-servers,deep-dive-modelcontextprotocol-registry,deep-dive-zed-industries-zed,deep-dive-tabbyml-tabby,deep-dive-janhq-jan

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

- feature-terminal-splits — SHIPPED — evidence: orca commit `c558d7e083` (#17601, trong tag v1.4.198 + v1.4.199) + v1.4.198 notes "Everything new from stablyai/orca — parallel worktrees, terminal splits, …"
- feature-ssh-worktrees — SHIPPED — evidence: orca commit `278f9ee876` (#17946 ssh MFA, trong tag v1.4.198 + v1.4.199) + v1.4.198 notes "GitHub & Linear native, SSH worktrees, mobile companion"
- feature-design-mode — SHIPPED — evidence: orca `docs/site/content/docs/browser/design-mode.mdx` (docs trang riêng) + feature-wall tile-05 "Embedded browser + Design Mode" + commit `216cabb9f0` (#463 — từ v1.4.0, nằm trong tag v1.4.198/v1.4.199 qua upstream sync)
- feature-ai-diff-annotation — SHIPPED — evidence: orca `src/renderer/src/components/diff-comments/DiffCommentCard.tsx` + `pull-request-page/files/inline-comments.ts` (nằm trong tag v1.4.199) + feature-wall tile-08 "Inline review, back to the agent"
- feature-emulator-android — SHIPPED — evidence: tag v1.4.199 chứa `skills/orca-emulator-android/SKILL.md` + `mobile/scripts/start-emulator.mjs` + `docs/assets/orca-mobile-emulator.gif`; desktop backend `src/main/emulator/android-emulator-backend.ts` trên main SAU v1.4.199 (bài chỉ được claim phần skill + emulator runtime đã ship)
- feature-computer-use-native — SHIPPED — evidence: v1.4.198 notes "macOS arm64 is being rebuilt … to include the computer-use native module" + orca module `src/main/computer/` + commit `787766bfcf` (CI "full chain with computer-use, DMG to release") + commit `66dfdc456f` (từ v1.4.186)
- feature-per-workspace-env — SHIPPED — evidence: orca commit `24d7f6b790` (#7908 "Align per-workspace environment toggle", từ v1.4.130) + `45370a5987` (skill `orca-per-workspace-env`) — cả hai trong tag v1.4.198/v1.4.199
- feature-notification-keyboard — SHIPPED — evidence: v1.4.199 notes "Notification routing: gate-open/gate-closed đủ routing fields, tap → đúng màn" (FI-305/309) + orca commit `7b9529da22` (#16271 keyboard shortcut, từ v1.4.193, trong tag v1.4.198/v1.4.199)

## Quy tắc snapshot D8 (pin từ epic spec)

Số liệu trong bài **re-extract ĐỐI CHIẾU SNAPSHOT** (`evidence-pack.md`
§Numbers snapshot) — không tin số nhớ-cache không nguồn. Nếu nguồn thật đã drift
so với snapshot tại thời điểm viết: ghi số theo SNAPSHOT + ngày chụp trong bài
("tại thời điểm viết"). Drift phát hiện ở QA (SF-5) = ghi chú, không fail.
Mỗi evidence block trong bài ghi nguồn + ngày lấy.

## Third-party claims — batch-3 (FI-383)

> Áp cho 50 bài deep-dive repo batch-3 (matrix `topic-matrix-batch3.md`).
> Bài batch-3 viết về repo NGƯỜI KHÁC — mọi claim về repo đó là third-party
> claim, chuẩn khác claim sản phẩm Wakii (snapshot D8 ở trên vẫn áp cho số
> về Wakii).

1. **Mọi số third-party** (stars, forks, releases, commit counts, benchmark)
   PHẢI kèm mốc lấy: "theo GitHub API ngày N" — N là ngày research THẬT
   (probe bằng `bash scripts/probe-repos.sh`, ngày ghi trong digest của repo
   tại `docs/superpowers/editorial/research/digests-batch3/<slug>.md`).
   Không ngày = không đăng (giống tinh thần D8).
2. **License-safe**: repo có license `none`/`NOASSERTION` → gọi **"công khai
   trên GitHub"** — KHÔNG được gọi "open-source" hay "mã nguồn mở". Scoped
   enforcement (lint + audit cùng FAIL) CHỈ trên đúng 6 slug † pin D8 ở trên;
   probe 2026-09-08 thấy thêm `charmbracelet/crush` + `neovim/neovim` =
   NOASSERTION NGOÀI scope — bài của 2 slug này vẫn viết license-safe
   (review-enforced), chờ coordinator ACK mở scope trước khi enforce máy.
3. **Paraphrase license-safe**: tả cơ chế/kiến trúc bằng lời của mình; quote
   nguyên văn (README/docs/release notes) chỉ nên ngắn (**≤25 từ**), PHẢI có
   attribution (tên repo/người nói) + link nguồn. Không dịch ngược quote để
   né attribution.
4. **Trích code**: chỉ đoạn ngắn có mục đích phân tích, kèm link commit/tree
   (URL `github.com/<owner>/<repo>/blob/<sha>/...`) ngay cạnh — trích thô
   không link = không đăng. Mã của repo † vẫn trích được (public) — chỉ cách
   GỌI TÊN license bị giới hạn.

## Drift-note — skills 21/14 → 20/13 (FI-373 SF-1, probe 2026-09-08)

**Ground truth: 20 tổng / 13 public.** Đếm chuẩn = TRONG mảng `export const
skills` của `src/data/skills.ts` (dòng 30–251): `id: '` ×20, `public: true`
×13. Header của chính file (dòng 3) cũng ghi "the 20 skills".

**Gốc vấn đề: PATTERN ĐẾM SAI, không phải content đổi.** `src/data/skills.ts`
chỉ có 1 commit nội dung (`7dcdef9`, nhánh FI-359 — `178d12e` cùng change);
20/13 không bao giờ là 21/14. Hai grep whole-file sinh đúng cặp số sai:

- Pattern sinh **21**: `grep -c 'id:' src/data/skills.ts` → 21 match, vì dính
  thêm dòng **`src/data/skills.ts:16`** — `  id: string;` (khai báo field của
  interface `Skill`, không phải entry).
- Pattern sinh **14**: `grep -c 'public: true'` (hoặc `grep -ci`) whole-file →
  14 match, vì dính thêm dòng **`src/data/skills.ts:8`** — comment header
  `` * `public: true` = catalog-worthy; … `` chứa literal y hệt pattern.

Snapshot D8 lần chụp 2026-09-07 dùng pattern whole-file như trên → ghi 21/14.
Các bài batch-1 đã viết đúng theo nguồn (cite 20/13 kèm "tại thời điểm viết")
— chỉ snapshot và audit `SNAPSHOT` object bị lệch; cả hai đã refresh
2026-09-08. `src/data/roadmap.ts` không góp số nào (0 match `id:`/`public`).

**Flag (ngoài scope SF-1):** `README.md` đang stale — dòng 29 "21 built-in
skills, 13 documented", dòng 67 "skills.ts (21-skill catalog)", dòng 81–82
"13 of 21". Cần fix "21" → "20" ở 3 chỗ — qua coordinator, KHÔNG sửa trong
SF-1.
