# Plan — UX funnel SF-2: Landing understand-layer + CTA funnel (VU-11)

Spec: `docs/superpowers/contexts/ux-funnel-sf-2.md` (story SF — pack = spec)
Design (BINDING): `docs/superpowers/designs/ux-funnel-direction.md` — direction A "Terminal Conveyor", owner-picked qua gate.
Base: `story/vu9-ux-funnel` @ `88c8f31` (SF-1 merged: keys understand 36 + hero cta-trio).

## Tasks

### Task 1 — Section component `Understand.astro` (NEW)
- `src/components/landing/Understand.astro` — bento anatomy (`.bx/.bx-in/.bx-label/.bx-body/.bx-foot`) theo GetWakii as-built (bg-card, radius-cell).
- Q1 opener (qk `//` accent → h2 em mint → lead + `~/.claude` inline code) · stats rail REUSE `hero.stats` (role=list) · Q2 sp7 (slot-lg ⚡ superpowers panel) · Q3 sp5 (isometric SVG token-bound + slot-sm bracket canvas) · Q4 sp12 (terminal chrome 3 dots brand + copy phải + q4Link + more docs/blog).
- Isometric SVG: fills/strokes qua class bind tokens.css (KHÔNG copy hex prototype); role="img" + aria-label; static.
- SVG labels + aria-label: inline EN+VI parallel (thiếu keys — precedent GetWakii:39, flag SF-4 copy gate).
- Slots: dashed frame + grid-bg 28 + caption; empty theo hand-off ("khi trống vẫn có text caption"); KHÔNG label mockup thành screenshot.
- Motion: `data-reveal` trên cell ngoài (initMotion tự dọn class+attr — FI-304); a11y: terminal text thật trong DOM, contrast body ≥4.5.
- Breakpoints 980 (Q2/Q3 full) / 720 (Q4 stack, padding reduce).

### Task 2 — Hero CTA split
- Primary MỚI: `ctaDownload` → `${prefix}/download` + micro `ctaMicro` (1 dòng mono uppercase).
- Ghost MỚI: `ctaBuild` → `REPO_URL`.
- Guide cũ (`ctaGhost`) hạ cấp text-link nhỏ trong dòng micro (→ getting-started) — key KHÔNG xóa (gw-b GetWakii:117 vẫn consume).
- `ctaPrimary` KHÔNG xóa khỏi store (hand-off: orphan cleanup candidate sau SF-2).

### Task 3 — Insert + anchors
- `Landing.astro`: import + `<Understand strings={strings} />` ngay sau `<Hero/>`, trước `<Bento/>` (binding); ownership comment + Understand → SF-2.
- Anchor `#get-wakii` verbatim; section id `understand` (không nav trỏ).

### Task 4 — Build + tests
- `pnpm build` (267 pages, exit 0) + `astro check` nếu có script. Repo không có unit test cho components — báo explicitly (B1 WARN 0 tests = bình thường).

### Task 5 — Verify (checklist user bước 2/2b/2c)
- ACCEPTANCE từng dòng trong pack (4 câu content-inspection, ≤1 click hero→/download, anchors, EN/VI structure, mobile-390, a11y, không mislabel ảnh).
- Browser verify 3 tầng: DOM → VISUAL (screenshot section + hero) → FLOW (landing → /download ≤1 click; mobile-390 trọn).
- code-reviewer độc lập trên diff → APPROVED mới merge.

### Task 6 — Merge + gate + Done
- Merge no-ff vào `story/vu9-ux-funnel` (conflict improvements-log → giữ CẢ HAI) + audit comment merge-hash lên VU-11 (kèm literal VERDICT của reviewer).
- `story-verify sf-2` sạch → VU-11 Done + cleanup worktree.
