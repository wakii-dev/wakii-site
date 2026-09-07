# Context pack — FI-339 SF-2: Seed content 10 posts

Source spec: `docs/superpowers/specs/2026-09-07-blog-features.md` (rev 2). SF-1 đã có: OG contract + RSS contract + TOC component + parity script. Việc này = NỘI DUNG.

## Spec slice
10 posts = 5 topics × en/vi, cùng slug, VI source-first (EN translated). Frontmatter đúng schema (content.config.ts): title, description (bắt buộc — SEO), pubDate (quá khứ thật), category enum `tutorial|tech|build-log`, tags, `draft: false`. Mỗi post link sang ≥1 docs page chính tắc (anti-cannibalization — docs giữ how-to chính tắc, blog giữ trải nghiệm/workflow). ≥2 posts (EN) có ≥3 h2 (TOC render). Tone: kỹ thuật thân thiện, thuật ngữ giữ tiếng Anh, code-first. Voice nhất quán ~/wakii. terminal aesthetic.

**5 topics (slug · category · nội dung cốt):**
1. `review-ai-agents-from-your-phone` · tutorial · mở app → Host → Stories → story detail (SF tiers/progress) → pending gates → resolve (choice/free-text + confirm) → agent tiếp tục; gộp phần pairing (quét QR từ desktop) làm bước 0; material: FI-305 thật, emulator screenshots
2. `story-workflow-idea-to-release` · tech · bracket → tier → DAG → SF agents → gates → merge → PR; tier ladder SVG concept; material: FI-305 end-to-end
3. `decision-gates-safe-ai-agents` · tech · gate là gì, pending guard (`gate_not_pending`/`gate_not_found`/`invalid_resolution`), notification gate-open/closed, tại sao supervised > autonomous
4. `forking-an-ide-keeping-current-with-upstream` · tech · fork-sync ff-only main, story branches song song upstream, xung đột và chiến lược; material: wakii-dev practice thật
5. `building-wakii-in-the-open-log-1` · build-log · log #1: FI-305 shipped (mobile story view + gates + notifications), release 1.4.199, next: blog đang đọc chính nó

Mỗi post: 350-500 từ, ≥1 link `/docs/...` chính tắc, khép bằng CTA download.

## Touch map
- `src/content/blog/vi/<slug>.md` ×5 + `src/content/blog/en/<slug>.md` ×5 — tạo mới (thư mục có thể phải mkdir)
- KHÔNG đụng code (SF-1 đã xong toàn bộ surface); KHÔNG đụng docs content có sẵn

## ACCEPTANCE (grep/browser trên dist sau build)
- `dist/blog/index.html`: 5 posts (đúng title + category badge + date); `dist/vi/blog/index.html`: 5 posts
- `dist/blog/<slug>/index.html` ×5 + `dist/vi/blog/<slug>/index.html` ×5 tồn tại
- `dist/sitemap-0.xml`: đúng 10 URL blog (5×/blog/ + 5×/vi/blog/)
- `dist/rss.xml`: 10 items, guid = URL tuyệt đối (unique 2 locale), không `<language>`
- `dist/blog/story-workflow-idea-to-release/index.html` + `dist/blog/forking-an-ide-.../`: mỗi bài ≥3 `<h2 id=` (TOC render)
- Mỗi post HTML chứa ≥1 link `/docs/`
- Slug parity script green non-vacuous (10/10)

## Boundary
- KHÔNG sửa code/page/styles (bug surface → rollback-fixer, không tự vá trong content task)
- KHÔNG dùng pubDate tương lai (không có scheduler — hiện ngay + sort lên đầu)
- KHÔNG đặt slug mới ngoài 5 slugs đã chốt trong spec (vĩnh viễn)
- KHÔNG viết bài trùng intent hẹp với docs pages
