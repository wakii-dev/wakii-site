# Writer runbook — per-post checklist (story FI-359)

> Áp cho MỖI bài mới của SF-2/3/4 (19 bài trong `topic-matrix.md`). Đi đúng 8 bước,
> không bỏ bước. Chuẩn kỹ thuật chi tiết ở `style-guide.md`; bằng chứng ở
> `evidence-pack.md`; claim được phép ở `claims-registry.md`.

## Checklist 8 bước / bài

1. **Đọc matrix row** — lấy slug · category · pubDate (CỨNG, không tự chọn) ·
   evidence chính · docs-link · tags · angle. Angle = bắt buộc: bài phải có
   **≥2 H2 mà KHÔNG seed nào có** — nếu không thấy được góc khác biệt, DỪNG và
   nói (không viết cho có).
2. **Đọc evidence-pack + snapshot D8** — mọi con số dùng trong bài truy được về
   `evidence-pack.md` §Numbers snapshot; cần số mới thì re-extract lệnh nguồn và
   GHI NGUỒN + NGÀY vào bài. KHÔNG tin số nhớ-cache không nguồn (D8).
3. **Outline** — liệt kê H2 (3-5), đánh dấu ≥2 H2 mới so seed, mỗi section ghi
   trước 1 evidence block định dùng (ASCII diagram / transcript / bảng / artifact
   quote — vật liệu từ evidence-pack, KHÔNG bịa).
4. **VI draft trong band** — 900-1400 từ theo thuật toán D1 (prose, bỏ fenced);
   frontmatter theo template `style-guide.md` §4; tone như seed (kỹ sản, câu ngắn).
5. **EN mirror CÙNG COMMIT** — cùng cấu trúc, cùng ngày/category/tags; ≥800 từ;
   dịch nghĩa chứ không dịch word-by-word; H2 EN không cần giống chữ VI (chỉ cần
   cùng trật tự ý). VI và EN trong MỘT commit — không bao giờ tách locale ra commit
   riêng (parity gate sẽ chặn nửa-cặp ở build, nhưng kỷ luật commit giữ review sạch).
6. **Self-lint** — `node scripts/check-blog-content.mjs` phải exit 0 (hoặc chỉ
   warn >1400 — tự trim trước khi commit). Lint fail nêu đúng file → sửa ở bước
   này, không đẩy qua SF-5.
7. **Self-claims-check vs registry** — rà từng claim: có trong `## ALLOWED`?
   Con số có trong snapshot D8? KHÔNG có trong `## FORBIDDEN` kể cả paraphrase
   (đọc cả section variants review-only). Claim không rõ → hỏi coordinator, đừng đoán.
8. **Cross-link ≥1 bài ĐÃ TỒN TẠI** — link blog sang 1 bài đã có trên nhánh
   (seed hoặc bài đã commit) theo đúng locale (D4). KHÔNG link mù sang bài chưa
   chắc có. Link docs theo quy tắc `style-guide.md` §6 — chỉ tới TRANG, không
   `#anchor` cross-file.

Rồi: `pnpm build` phải xanh toàn chain (parity → content lint → astro build) →
commit: 1 bài = 1 commit, message nêu slug.

## D4 — link docs đúng locale (pin)

- VI posts → `/vi/docs/<slug>/` · EN posts → `/docs/<slug>/`. `<slug>` ∈ 5
  DOC_SLUGS (getting-started · superpowers-panel · story-workflow · agents-and-kit · faq).
- Seeds KHÔNG đụng (seed VI đang link `/docs/` — flag FI-341 epic comment lo).

## D7 — draft fallback (chỉ khi SF trễ)

- Cho phép tạm `draft: true` nhưng **flip CẢ HAI locale cùng slug MỘT LƯỢT**
  (tránh hreflang half-pair + RSS lệch locale).
- Lint với `draft: true`: in `skipped-draft`, bỏ qua band + docs-link; VẪN kiểm
  frontmatter / kebab / forbidden-phrase (claim bẩn bị chặn bất kể draft).
- Draft KHÔNG được merge ở trạng thái đó: PR phải 30/30 live, hoặc user sign-off
  rõ ràng. Flip ngược `draft: false` = coordinator fix commit trên nhánh đích.

## Với bài case-study / deep-dive (matrix #8, #10, #11, #12, #13, #15, #16, #17, #18, #20)

- Đọc CODE THẬT / ARTIFACT THẬT làm evidence — không paraphrase từ trí nhớ.
- Link artifact GitHub hub-store (public — verified trong evidence-pack) **kèm
  TRÍCH DẪN thật ngay trong bài** (chống link-chết). fi338 bracket local-only
  (chưa lên GitHub main) → trỏ spec đã có trên main, xem evidence-pack.
- Nhóm này qua **claims double-pass** ở SF-4 — chuẩn bị câu trả lời cho từng
  con số/citation trong bài.
