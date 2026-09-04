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
