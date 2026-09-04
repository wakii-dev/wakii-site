# SF-3 Download + Roadmap — Plan (FI-297, story FI-294)

Spec: docs/superpowers/contexts/fi294-sf-3.md + docs/superpowers/designs/sf3-direction.md (BINDING — user-picked B "Bento Composer").
Base: story/fi294-site-content-depth · Worktree: sf-3-roadmap · Tier: Standard.
Design phase (tasks 1-2) hoàn thành PRE-LAUNCH — hand-off commit 5547901 là bằng chứng.

## Tasks

- [x] 1. design-3-hướng-html — DONE pre-launch: 3 hướng `/tmp/story/fi294/design/sf3-{a,b,c}.html` (commit 5547901 docs hand-off)
- [x] 2. design-user-pick-gate — DONE: user chọn **b — Bento Composer** (comment DESIGN-PICK trên epic FI-294)
- [x] 3. get-wakii-component-thay-quickstart — rewrite `GetWakii.astro`: bento 12-col (steps 1/9×row1/3 + req 9/13 + cta 9/13), keys `getWakii` verbatim, tilt `data-tilt` trên bx-in, reveal qua motion util, anchor `id="get-wakii"`, Nav.astro `#quickstart`→`#get-wakii`; DROP req-note + cta-sub (không có key trong binding table)
- [x] 4. placeholder-mode-repo-link-qua-REPO_URL — import `REPO_URL` từ `src/config.ts`; interpolate vào `steps[].cmd` (thay literal `<repo-url>`) + href btn-primary; zero hardcoded github URL
- [ ] 5. nav-cta-decision-note-ghi-epic — comment lên epic FI-294: giữ "get wakii" → `/docs/getting-started/` tới khi REPO_URL thật (publish checklist story 1)
- [x] 6. roadmap-route-en — `src/pages/roadmap.astro`: 3 lane now/next/later từ `roadmap.ts` verbatim (card count 2/3/3), lane-foot + tag + chrome EN, kicker "roadmap", entrance `.reveal` + `initMotion()`
- [x] 7. roadmap-route-vi — `src/pages/vi/roadmap.astro`: label_vi + desc_vi; h2/sub VI authored (FLAG: qua copy-review gate SF-5); chrome EN giữ nguyên
- [x] 8. roadmap-entrance-qua-util — consumed in 6/7 (motion.css import + initMotion, no new primitives)
- [x] 9. seo-meta-hreflang-route-mới — Base.astro tự sinh canonical/hreflang từ pathname; verify /roadmap ↔ /vi/roadmap + lang switcher 2 chiều
- [x] 10. responsive-pass — ≤980 (steps full, req+cta span 6, lanes stack), ≤720 (all full, stp 1col, pad 20px), @390 zero horizontal scroll (iframe probe scrollWidth)

## Meta-steps (numbered, không checkbox)

1. Build pass + browser verify 3 tầng (DOM / screenshot vs prototype / flow nav→get-wakii→repo-link→roadmap→lang-switch)
2. code-reviewer độc lập trên diff SF → verdict literal lên FI-297
3. Merge no-ff → story/fi294-site-content-depth + audit comment merge-hash
4. `~/.claude/bin/story-verify sf-3` sạch
5. FI-297 → Done

## Notes / decisions

- Tokens: design doc tên prototype (`--bg-raise/--panel/--line`) map sang tokens.css thật (`--bg-raised/--bg-card/--border`) — tokens.css SF-1 thắng.
- Later-lane: cards `opacity .72`, title `--text-dim`, border `--border-strong`; now lane blink `●` 1.4s steps(1); next lane `--warn`.
- Ghost guide btn: reuse `hero.ctaGhost`, href `/docs/getting-started/` (trailing slash bắt buộc, prefix `/vi` cho VI).
- req-note: DROP — key không tồn tại trong `getWakii` binding; note key đã phủ thông điệp qua gw-note.
- cmd `white-space: nowrap; overflow-x: auto` (scroll nội bộ @390).
