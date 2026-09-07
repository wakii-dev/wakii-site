# SF-5 Context Pack (FI-359 longform) — Convergence QA — 30 posts release-ready

> Đọc file này THAY VÌ tự tổng hợp từ bracket + epic + comments.
> Epic spec: `docs/superpowers/specs/2026-09-07-blog-longform-20-posts-spec.md`
> Bracket: `docs/superpowers/brackets/fi359-blog-longform-20.md`
> SF-5 KHÔNG viết content — QA hội tụ trên nhánh đích sau khi SF-2/3/4 merge.

## Spec slice (chỉ SF-5 chịu trách nhiệm)

Mỗi check = lệnh + tiêu chí pass cụ thể. FAIL bất kỳ → ghi rõ bài + lỗi, chuyển Dev
SF tương ứng fix (QA không tự sửa content — tester không fix).

1. **Build + parity + lint green (30)** — `pnpm build` trên nhánh đích: parity
   15 slug × 2, lint 0 fail; đúng 60 file blog.
2. **Band sweep 20 bài mới** — thuật toán D1 (prose, bỏ fenced code): VI
   900-1470 (hard-fail ngoài band; 1400-1470 = warn + phải có lý do), EN ≥800;
   in bảng số từ từng bài.
3. **Claims sweep vs SNAPSHOT D8** — đối chiếu từng bài với
   `claims-registry.md` + `evidence-pack.md` numbers snapshot (ngày chụp + giá trị
   + output lệnh); KHÔNG fail vì nguồn drift SAU snapshot — drift tại QA → ghi
   chú trong báo cáo. Forbidden-phrase grep 0 hit cả 2 locale.
4. **Links resolve locale e2e, không anchor chết** — mọi internal link trong 60
   file: `/docs/<slug>/` (EN bài) · `/vi/docs/<slug>/` (VI bài) · cross-link
   `/blog/…`/`/vi/blog/…` · `/skills/` · `/download/` — phải có route thật trong
   `dist/`. KHÔNG có link cross-file kèm `#fragment`. Link GitHub artifact
   (hub-store): QUOTE kèm trong bài là điều kiện CỨNG; spot-check `gh api` HEAD
   200 trên 3 link mẫu — 404 khi có quote = ghi chú (không fail), fix link sau
   merge = coordinator fix commit trên nhánh đích (SF đã đóng, QA không tự sửa).
5. **RSS expected-live contract** — build → `dist/rss.xml`: đúng expected-live
   items (30 nếu không có draft fallback; ít hơn thì phải khớp danh sách
   skipped-draft được flag), mỗi item `<guid>` absolute đúng locale, KHÔNG
   `<language>`, pubDate khớp frontmatter. (Contract FI-339 SF-1 pinned.)
   Nếu sign-off đòi 30/30 live: flip `draft:false` = coordinator fix commit
   (không phải việc của QA-content).
6. **Sitemap + hreflang + OG regression @15 slug** — `dist/sitemap-*.xml` đủ URL
   posts live + listings; 3 slug mẫu × 2 locale: hreflang pair đủ 2 chiều +
   x-default, canonical đúng; **grep dist 3 bài mới**: `og:type` article +
   `og:published_time` khớp pubDate (contract FI-339 rev 2 — backdate D2 ăn thẳng
   vào meta).
7. **Listing render live-count + frontmatter-vs-matrix** — `dist/blog/index.html`
   + `dist/vi/blog/index.html`: đúng số bài live, pubDate desc, badge + ngày đúng
   frontmatter, không trùng, không draft lộ; **đối chiếu 20 bài mới vs
   `topic-matrix.md`: slug + category + pubDate khớp 20/20** (D2/D6 gate máy —
   sai 1 hàng = fail).
8. **Browser walkthrough Rule 0 (EN + VI)** — serve `dist/` → listing → 3 bài mẫu
   (pilot + 1 mỗi series) → TOC anchor jump → cross-link sang bài khác → về
   listing. DOM + FLOW phải thấy, không tự kết luận từ code.
9. **Independent review verdict** — reviewer độc lập trên diff toàn story (40 md +
   lint + wiring): ngoài bug/thể thức, phán định risk #4 (mỗi bài angle ≥2 H2 mới
   so seed — matrix cột angle là đầu vào; rationale per-post) → APPROVED mới qua.
10. **Release readiness** — tổng hợp mọi gate + danh sách skipped-draft (nếu có) +
    build smoke cuối → verdict READY-FOR-PR lên epic. KHÔNG deploy, KHÔNG merge main.
    (Flip draft còn lại = coordinator fix commit — D7.)

## Touch map (SF-5 sở hữu gì)

- KHÔNG sở hữu file content. Sở hữu: audit output (Linear comments + epic comment
  tổng hợp). Script audit phụ (nếu cần) → `scripts/audit-blog-convergence.mjs` MỚI.
- READ-ONLY: 60 file blog, editorial kit, dist/, scripts, bare `sf-N.md` packs.

## ACCEPTANCE (user-visible)

- `pnpm build` trên nhánh đích: xanh một lượt — parity 15×2 + lint 30/30 pass.
- Listing EN + VI: đủ bài live, 08-20 → 09-07 xen kẽ 10 seed tự nhiên, không ngày
  tương lai, không draft lộ.
- 3 bài mẫu đọc mượt: TOC chạy, evidence thật, link docs đúng locale, link GitHub
  hub-store mở được (spot-check 200).
- Epic có 1 comment tổng hợp QA: bảng 10 check × kết quả + verdict.

## Boundary (KHÔNG làm)

- KHÔNG sửa content/kit — fail chuyển Dev SF tương ứng, re-check sau fix.
- KHÔNG đụng redesign FI-349 (taxonomy/heroImage/JSON-LD — story riêng đang chạy).
- KHÔNG deploy prod, KHÔNG merge main; PR là bước CLOSE theo playbook, không phải
  của SF-5.
- B1 WARN = 0 test là BÌNH THƯỜNG (site static, không unit test) — đừng thêm test
  framework chỉ để hết WARN.
