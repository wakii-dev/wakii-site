# Improvements Log — superpowers workflow (in-flight flags + end-of-task learnings)

## 2026-09-04 — SF-2 Landing (FI-291)

- **`orca linear comment add` trả `ok:false` thật cho body dài (~2.3KB qua heredoc stdin)** — không phải false-negative như `save-issue` (comment KHÔNG apply). Workaround: viết body ra file rồi `--body-file <path>` → ok:true. Ghi chú: probe bằng marker comment để rà trạng thái gây ra 1 comment rác "**test marker probe**" trên FI-291 (CLI không có comment delete — chấp nhận). Suggested change: orca-bridge/skill nên ghi rõ stdin-heredoc không đáng tin cho body dài; và cần `comment delete` cho cleanup.
- **`orca linear issue <id> --comments` latency:** comment mới post cần vài giây để visible qua API — `story-verify` B3 chạy ngay sau khi post sẽ đọc nhầm OUTBOX. Suggested change: story-verify có thể retry 1 lần sau 3s trước khi kết luận OUTBOX.
- **CSS grid min-content trap:** bento grid 1fr track bị kéo to theo content cố định (bracket canvas 680px) dù có auto-scale script (scale hình nhưng không co layout). Fix pattern: `min-width: 0` trên grid items. Nên ghi vào frontend-design/design skill notes cho mockup-kit layouts.

## 2026-09-04 — SF-3 (FI-297)
- **Stale browser cache sau rebuild (astro preview)**: Orca embedded browser phục vụ HTML cũ sau khi `astro build` ghi lại dist — computed-style measurement (h2 21.75px) mâu thuẫn với screenshot (đã styled) và khiến code-reviewer round 1 báo P1 mechanism-sai. Fix quy trình: cache-bust (`?v=N`) hoặc reload trước khi đo; khi browser measurement mâu thuẫn dist artifacts → tin dist (deterministic) + re-measure cache-busted. (Liên quan: reviewer có thể "live-verify" trên stale state — brief reviewer về cache gotcha.)
- **Astro `inlineStylesheets: auto`**: CSS bundle nhỏ được inline vào HTML head — grep dist/_astro/*.css KHÔNG đủ để kết luận "thiếu styles"; phải grep cả inline `<style>` trong dist/**/*.html.
- **Anchor click + `scroll-behavior: smooth`** trong embedded browser: hash đổi nhưng không scroll (browser thật OK). Đã flag epic cho SF-5; nếu cần verify anchor trong embed → set `scrollBehavior='auto'` tạm rồi click.
- **em-dash split off-by-one**: `indexOf(' — ')` + `slice(i+1)` giữ lại em-dash → dùng `split(' — ')`. Bug thật ("— —" trên landing note), bắt được nhờ Rule 0 flow walkthrough.

## 2026-09-04 — SF-5 Convergence (FI-298)
- **Reduced-motion mid-session P2**: nếu user bật `prefers-reduced-motion` SAU khi trang đã load với motion ON, `.anim` đã add → `.anim [data-reveal] {opacity:0}` giữ elements ẩn (initMotion đã chạy, observer vẫn reveal khi scroll nên thực tế self-heal trên scroll; chỉ ảnh hưởng elements ngoài viewport đầu chưa intersect). Suggested hardening: trong global.css RM media query thêm `.anim .reveal, .anim [data-reveal] { opacity: 1 !important; }`.
- **Canonical swap per locale (verdict b)**: Base.astro canonical cũ build từ `canonicalPath` prop → dễ lệch thật-URL. Đổi sang self-referencing `new URL(pathname || '/', Astro.site)` — mỗi locale tự canonical (Google guidance cho hreflang cluster). Verdict pinned trong plan Task 4; verify script phải so trailing-slash (không `/index.html`).
- **LangSwitcher hash preserve**: anchor hash EN (`#philosophy`) KHÔNG map slug VI nhưng giữ vẫn better-than-drop (browser đứng top thay vì chết link). Verdict pinned trong plan Task 5; e2e xác nhận hash sống qua switch.
- **`npm install` tạo `package-lock.json` untracked** trong repo dùng `pnpm-lock.yaml` — KHÔNG commit (sẽ phá lockfile contract). Nếu cần build trong worktree, xóa lockfile sau hoặc dùng `npm ci --no-save`.

## 2026-09-04 — Story 3 SF-1 (FI-301)
- **story-verify chọn nhầm bracket sau khi app rename Orca→Wakii**: script hardcode `/opt/homebrew/bin/orca` + probe `ORCA_USER_DATA_PATH` (orca-dev/orca) — trên máy hiện tại CLI thật là shim `/usr/local/bin/orca` (Wakii.app), override data path khiến `ok:false` → `WT_META` rỗng → rơi về bracket glob alphabet-first → B3/B4/B5 đọc nhầm story FI-289 (review:FI-290, dest:fi289) dù orca metadata đúng (linkedLinearIssue FI-301). Fix đã patch vào `~/.claude/bin/story-verify`: ưu tiên shim, gọi TRỰC không override data path. Suggested: các script story-* khác (watchdog/resume) nếu có cùng pattern ORCA_BIN/data-path thì patch tương tự.
- **`orca worktree set --linear-issue` nên chạy NGAY khi vào SF** (trước cả code) — metadata là nguồn bracket-resolution của story-verify; set muộn = gate đọc nhầm story (gặp ở run này).
- **eval qua `orca exec` (agent-browser): 3 bẫy spacing** (mở rộng gotcha SF-2 cũ): ngoài tách theo space + strip double-quotes, arrow **block body** `()=>{...; x}` trả undefined (phải expression body hoặc statement cuối là call), và `let x`/`return x` đều chứa space → dùng expression thuần: `eval Array.from(...).flatMap(...).map(...).join(...)`.

## 2026-09-05 — Story 3 SF-3 (FI-303)
- **iframe probe @width: tab `about:blank`/`data:` URL = opaque origin** → iframe trỏ localhost là CROSS-ORIGIN, `contentDocument` ném SecurityError → `orca exec eval` trả output RỖNG (không phải JSON error). Fix: host trang probe cùng-origin trong `dist/__probe.html` (preview server serve tĩnh) rồi mở tab đó — eval trên tab probe đo `window.f.contentDocument` bình thường. Bổ sung cho gotcha iframe-probe FI-298.
- **Headless shell screenshot full-page dọc**: `--window-size=1280,6800` render cả trang nhưng `.reveal` ngoài viewport đầu giữ opacity 0 (IntersectionObserver không fire khi không scroll) — không phải bug layout, là reveal contract; visual tầng chỉ đáng tin trên browser thật có scroll (Orca tab) hoặc sau khi reveal đã chạy.
- **Screenshot flag-state ảo sau rebuild**: tab Orca trỏ URL cũ (?v cũ) vẫn hiện state trước rebuild nếu không cache-bust — mọi lần rebuild xong mở tab `?v=<số mới>` (đã có trong gotcha FI-297, tái xác nhận lại ở SF này khi mock-flip 2 lượt).
