# Plan — FI-383 SF-5: Editors + terminal + misc — 14 bài (FI-388)

> Worktree `sf-5-blog-b3-editors` · branch `wakii-dev/sf-5-blog-b3-editors` (@ c214dfa).
> Contract: pack `docs/superpowers/contexts/fi383-sf-5.md` + spec rev 3 + bracket.
> ⚠ Launch prompt text stale (ghi FI-378/batch-2) — đã verify worktree linkedLinearIssue
> = FI-388 + pack = editors/terminal/misc; xử lý theo improvements-log §SF-1 (FI-384).
> KHÔNG flagship hero (pack + bracket + matrix hero=no ×14; dòng task spec SF-5
> "fzf heroImage" là remnant stale — fzf thuộc SF-4).

## Tasks — 14 post + 1 consistency pass (mỗi post task = research → digest → VI 900-1400 → EN mirror cùng commit → grading → ADOPT draft nếu ADOPT → lint xanh)

### Wave 1 — editors (review nhóm editors sau khi cả 3 task xong)

- [x] T1 `repo-post-code-server` — #37 `deep-dive-coder-code-server` pubDate 2026-10-19. Angle: editor chạy nơi worktree sống (VS Code trên server); kiến trúc serve IDE qua browser.
- [x] T2 `repo-post-helix` — #41 `deep-dive-helix-editor-helix` pubDate 2026-10-21. Angle: modal editor zero-config, LSP-first; opinionated defaults vs configuration sprawl. License MPL (được gọi open-source).
- [x] T3 `repo-post-lapce` — #43 `deep-dive-lapce-lapce` pubDate 2026-10-22. Angle: editor Rust hướng hiệu năng; plugin WASI isolation.
- [x] T4 `repo-post-continue` — #44 `deep-dive-continuedev-continue` pubDate 2026-10-22. Angle: nhúng AI assistant vào IDE có sẵn (hub models/rules/context) — gần workflow story của Wakii nhất.
- [x] T5 `repo-post-tabby` — #45 `deep-dive-tabbyml-tabby` pubDate 2026-10-23. **† FORBIDDEN "open-source"/"mã nguồn mở"** — "công khai trên GitHub". Angle: self-host inference cho code completion.
- [x] T6 `repo-post-openbot` — #47 `deep-dive-copilotkit-openbot` pubDate 2026-10-24. Angle: agent UX reference (chat/copilot pattern) — research ground truth trước khi viết.
- [x] T7 `repo-post-cumora` — #49 `deep-dive-yetone-cumora` pubDate 2026-10-25. Angle: repo AI đang lên — quan sát learn-in-public; research thật (author yetone).

### Wave 2 — terminal + misc (review nhóm terminal + misc)

- [x] T8 `repo-post-ripgrep` — #38 `deep-dive-burntsushi-ripgrep` pubDate 2026-10-19. Angle: rg trong agent context — search nhanh nuôi ngữ cảnh agent; workflow Wakii dùng.
- [x] T9 `repo-post-bat` — #39 `deep-dive-sharkdp-bat` pubDate 2026-10-20. Angle: pretty-print trong transcript agent; syntax highlight + git integration.
- [x] T10 `repo-post-starship` — #40 `deep-dive-starship-starship` pubDate 2026-10-20. Angle: cross-shell prompt; dev-environment signal.
- [x] T11 `repo-post-yazi` — #42 `deep-dive-sxyazi-yazi` pubDate 2026-10-21. Angle: file manager TUI Rust — kiến trúc async + image preview.
- [x] T12 `repo-post-dsh-desktop` — #46 `deep-dive-anywhere-labs-dsh-desktop` pubDate 2026-10-23. Angle: research digest — điều phối agent trên desktop (pack chỉ định).
- [x] T13 `repo-post-asu-skills` — #48 `deep-dive-hisn00w-asu-skills` pubDate 2026-10-24. Angle: hiện tượng skills-as-content — bộ skill cộng đồng cho agent.
- [x] T14 `repo-post-unlazy` — #50 `deep-dive-leonxlnx-unlazy` pubDate 2026-10-25. Angle: research ground truth trước (pack gợi ý cụm skills-as-content — verify repo thật làm gì rồi mới chốt góc).

### Convergence

- [x] T15 `series-editors-terminal-consistency-pass` — lint xanh toàn tree; khớp template chốt SF-2 (đối chiếu lúc merge); cross-links ∈ 69 slug hiện có + 14 slug nhóm mình; grading distribution summary; Rule 0 browser 3 tầng (DOM/VISUAL/FLOW × 2 locale); security-audit; verifier; merge dest ancestor-guard; story-verify sf-5; batch audit FI-388; FI-388 Done.

## Acceptance (từ pack)

- 14 bài đọc được EN+VI đúng template; góc nội dung không trùng SF-3/4 (editors/terminal/misc riêng).
- Grading có dẫn chứng; mobile 390 no-overflow; lint green partial (T7 đỏ giữa batch EXPECTED).
- Mỗi bài: marker `## Wakii học được gì`/`## What Wakii learns` (## exact, cuối bài trước CTA) + ≥1 docs link đúng locale + số third-party kèm ngày + tabby† license-safe.

## Conventions

- Commit: 1 post = 1 commit (VI+EN+digest+ADOPT draft) — `feat(blog): deep-dive-<name> — <facet> deep-dive VI+EN (matrix #N, FI-388)`. Git add đúng file list; commit lock `/tmp/sf5-gitlock`.
- KHÔNG: build (dist clobber), push, merge, đụng scripts/editorial contracts (frozen), file issue GitHub, đụng bài SF khác.
- Review: nhóm editors (T1-T7) + nhóm terminal (T8-T11) + misc (T12-T14) — code-reviewer độc lập từng nhóm, CHANGES-REQUESTED → fix → re-review APPROVED.
