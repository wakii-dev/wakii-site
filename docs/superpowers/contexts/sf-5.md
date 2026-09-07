# SF-5 Context Pack — Convergence QA — 30 posts release-ready

> Đọc file này THAY VÌ tự tổng hợp từ bracket + epic + comments.
> Epic spec: `docs/superpowers/specs/2026-09-07-blog-longform-20-posts-spec.md`
> Bracket: `docs/superpowers/brackets/fi349-blog-longform-20.md`
> SF-5 KHÔNG viết content — QA hội tụ trên nhánh đích sau khi SF-2/3/4 merge.

## Spec slice (chỉ SF-5 chịu trách nhiệm)

Mỗi check dưới đây = lệnh + tiêu chí pass cụ thể. FAIL bất kỳ → ghi rõ bài + lỗi,
chuyển Dev SF tương ứng fix (QA không tự sửa content — tester không fix).

1. **Build + parity + lint green (toàn 30)** — `pnpm build` trên nhánh đích:
   parity 15 slug × 2, lint content 0 fail. Số file blog phải đúng 60.
2. **Band sweep 20 bài mới** — VI mỗi bài 900-1500 (warn 1400+), EN ≥800; in bảng
   số từ từng bài; bài ngoài band = fail (chuyển Dev fix, ±5% duyệt được nếu lý
   do rõ).
3. **Claims sweep toàn bộ 20 bài mới** — đối chiếu từng bài với
   `docs/superpowers/editorial/2026-blog-longform/claims-registry.md` + re-extract
   số liệu TẠI THỜI ĐIỂM QA (skills.ts, `gh release list`, 5 docs): con số trong
   bài lệch nguồn tại ngày QA = fail. Forbidden-phrase grep 0 hit cả 2 locale.
4. **Links resolve locale e2e** — quét mọi internal link trong 60 file:
   `/docs/<slug>/` từ EN bài + `/vi/docs/<slug>/` từ VI bài + cross-link
   `/blog/…`/`/vi/blog/…` + `/skills/` + `/download/` — tất cả phải có route thật
   trong `dist/` (check thư mục, không cần server). Link mù sang bài không tồn
   tại = fail.
5. **RSS contract @30** — build → đọc `dist/rss.xml`: đúng 30 items, mỗi item có
   `<guid>` absolute URL đúng locale, KHÔNG có `<language>`, pubDate khớp
   frontmatter. (Contract FI-339 SF-1 pinned.)
6. **Sitemap + hreflang @15 slug** — `dist/sitemap-*.xml` chứa 30 URL posts + mọi
   listing; với 1 slug bất kỳ: HTML EN + VI có hreflang pair đủ 2 chiều + x-default,
   canonical đúng (Base.astro sinh tự động — kiểm 3 slug mẫu × 2 locale).
7. **Listing render 30** — `dist/blog/index.html` + `dist/vi/blog/index.html`:
   đúng 15 item mỗi listing, thứ tự pubDate desc, badge category + ngày hiển thị
   đúng frontmatter, không item trùng, không draft lộ.
8. **Browser walkthrough Rule 0 (EN + VI)** — serve `dist/` → mở listing → bấm
   3 bài mẫu (1 mỗi series + pilot) → TOC anchor jump đúng → cross-link sang bài
   khác → quay lại listing. DOM + FLOW đều phải thấy, không tự kết luận từ code.
9. **Independent review verdict** — dispatch reviewer độc lập trên diff toàn story
   (40 file + lint + wiring) — APPROVED mới qua bước 10.
10. **Release readiness** — tổng hợp: mọi gate trên xanh + ghi chú fallback
    draft:true (nếu có SF nào phải ẩn bài trễ) + build smoke lần cuối → verdict
    READY-FOR-PR lên epic. KHÔNG deploy, KHÔNG merge main.

## Touch map (SF-5 sở hữu gì)

- KHÔNG sở hữu file content nào. Sở hữu: audit output (Linear comments + epic
  comment tổng hợp). Nếu cần script audit phụ → `scripts/` file MỚI tên
  `audit-blog-convergence.mjs` (duy nhất nếu thật cần — không bắt buộc).
- READ-ONLY: toàn bộ 60 file blog, editorial kit, dist/, scripts.

## ACCEPTANCE (user-visible)

- Người dùng chạy đúng 1 lượt `pnpm build` trên nhánh đích: xanh, parity 15×2 +
  lint in ra 30/30 pass.
- Mở listing EN + VI: 15 bài mỗi ngôn ngữ, ngày 08-20 → 09-07 xen kẽ 10 seed tự
  nhiên, không bài ngày tương lai, không draft lộ.
- Đọc 3 bài mẫu: TOC chạy, evidence thật, link docs đúng locale, không claim sai
  (sweep 0 hit).
- Epic có 1 comment tổng hợp QA: bảng 10 check × kết quả + verdict.

## Boundary (KHÔNG làm)

- KHÔNG sửa content/kit — fail thì chuyển Dev SF tương ứng, re-check sau fix.
- KHÔNG đụng redesign (taxonomy/heroImage/JSON-LD — spec riêng chờ approve).
- KHÔNG deploy prod, KHÔNG merge main, KHÔNG tạo PR hộ user ngoài đúng playbook
  story CLOSE (PR là bước của CLOSE, không phải của SF-5).
- B1 WARN = 0 test là BÌNH THƯỜNG (site static không có unit test) — đừng thêm
  test framework chỉ để hết WARN.
