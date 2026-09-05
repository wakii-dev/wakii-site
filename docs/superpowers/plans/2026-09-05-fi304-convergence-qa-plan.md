# Plan — FI-304 SF-4 Convergence QA (story FI-300, SF cuối)

Worktree: sf-4-qa (branch VuHoi/sf-4-qa @ 0a72af7) · Linear: FI-304 · Mode: **QA — không refactor; fix nhỏ trong scope QA; bug lớn → flag epic FI-300.**
Docs nguồn: spec `2026-09-04-site-downloads-mobile.md` (G-A..G-I) · context pack `fi300-sf-4.md` · **AS-BUILT** `sf-downloads-direction.md` · `lighthouse-baseline-fi300.md`.

## Tasks (thứ tự thực thi tối ưu; số = mục checklist launch prompt)

- [x] T2 URL-confirm: pattern `releases/latest/download/<asset>` — grep version constant toàn repo; releases URL hardcode trong docs getting-started md EN+VI khớp pattern (SF-1 reviewer P2); REPO_URL + SITE_URL đúng trong config.ts.
- [x] T5 Dead-link sweep toàn site (mọi internal link trỏ route/anchor tồn tại; nav/footer/logo trailing slash đúng).
- [x] T4 VI gate G-D: copy VI cả 2 biến thể flag (downloads.ts + landing dl.page head G-D drafts + guide line + chrome EN-only) — inventory EN+VI; draft mới → flag vào audit comment chờ user duyệt, KHÔNG tự claim APPROVED.
- [x] T1 Flag matrix mock-flip 4 combos (D×M) × 2 locales — /download ×2, landing GetWakii, roadmap, nav-cta: 0 dead-link + 0 dead-claim mọi combo; QR chỉ khi MOBILE_LIVE + store URL; mock-flip REVERT, KHÔNG commit flag flip.
- [x] T3 Cross-surface consistency (audit theo AS-BUILT): radius landing 14px vs /download `--radius-cell` 12px → quyết thống nhất (task riêng); cell language bx-label/bx-in/bx-foot đồng bộ; tokens chỉ từ tokens.css.
- [x] T6 A11y + Lighthouse: so baseline (landing 99/96; /download a11y 90/perf 88); heading order mọi trang; P2 epic đã biết (OG meta, nav active-link, iOS cell logo rỗng, "iOS" ×2, fonts render-blocking + contrast) → LIỆT KÊ, KHÔNG fix systemic.
- [x] T7 RULE 0 browser-verify 3 tầng DOM/VISUAL/FLOW — evidence thật (cache-bust ?v=N sau rebuild; stale dist → tin dist + grep inline `<style>`).
- [x] T8 CODE-REVIEWER agent riêng, scope `git log 0a72af7..HEAD` — verdict literal `VERDICT: APPROVED`; commit sau review-start → addendum re-review scoped.
- [x] T9 Fixes từ audit (nếu có) + improvements-log.md append learned.

## Meta (quy trình — plain list, không checkbox)

1. Merge no-ff → đích `story/fi300-downloads-mobile` (merge-ngược playbook: merge đích vào sf-branch trước, update-ref FULL refname + guards; conflict improvements-log giữ CẢ HAI).
2. `~/.claude/bin/story-verify sf-4` sạch (B1-B4).
3. SAU ĐÓ `orca linear status set --id FI-304 --to Done` — Linear Done TRƯỚC merge = INCOMPLETE.
4. Audit comment FI-304 (--body-file, đọc raw): commit map + evidence + verdict + danh sách P2/flag cho epic.

## Gotchas nhắc lại

- KHÔNG commit package-lock.json (pnpm repo); KHÔNG thêm key vào `src/i18n/downloads.ts` (key store SF-1 — thiếu → flag epic).
- Build ~2-6 phút (fonts); 19 pages xanh = PASS.
- /tmp không bền — bằng chứng chính = Linear comment.
- Block ≥2 bước liên tiếp cùng nguyên nhân → post FI-300 + dừng.
