# Writer runbook — per-post checklist (stories FI-359 + FI-373)

> Áp cho MỖI bài mới non-seed: **114 slug** = 20 batch-1 (`topic-matrix.md`)
> + 44 batch-2 (`topic-matrix-batch2.md`) + 50 batch-3
> (`topic-matrix-batch3.md`, story FI-383) — lint + audit parse CẢ BA file.
> Đi đúng 8 bước, không bỏ bước (batch-3 có thêm section riêng ở dưới).
> Chuẩn kỹ thuật chi tiết ở `style-guide.md`; bằng chứng ở `evidence-pack.md`;
> claim được phép ở `claims-registry.md`.

## Checklist 8 bước / bài

1. **Đọc matrix row** (file tương ứng batch của mình) — lấy slug · category ·
   pubDate (CỨNG, không tự chọn; ngày tương lai hợp lệ khi khớp đúng dòng
   matrix — policy a) ·
   evidence chính · docs-link · tags · angle. Angle = bắt buộc: bài phải có
   **≥2 H2 mà KHÔNG bài nào cùng facet đã có** — nếu không thấy được góc khác
   biệt, DỪNG và nói (không viết cho có).
2. **Đọc evidence-pack + snapshot D8** — mọi con số dùng trong bài truy được về
   `evidence-pack.md` §Numbers snapshot (lần chụp **2026-09-08**: skills
   **20 tổng / 13 public** — giá trị 21/14 của lần chụp 2026-09-07 là ĐẾM SAI
   grep whole-file, xem `claims-registry.md` `## Drift-note`); cần số mới thì
   re-extract lệnh nguồn và GHI NGUỒN + NGÀY vào bài. KHÔNG tin số nhớ-cache
   không nguồn (D8).
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

Rồi: `pnpm build` phải xanh toàn chain (parity → blog-utils → content lint →
astro build) → commit: 1 bài = 1 commit (1 cặp VI+EN), message nêu slug.

## Outside-matrix — nghĩa và cách xử lý (batch-2 lint, DEC-4)

Lint scope giờ **manifest all-non-seed**: mọi file `.md` trong
`src/content/blog/{en,vi}/` KHÔNG phải seed đều phải nằm trong một trong hai
matrix file. File lạ xuất hiện → lint vẫn exit 0 nhưng in:

```
⚠ outside-matrix (reported, not enforced): en/<slug>.md
```

và đếm trong dòng summary. **Nghĩa:** file không seed và không có row matrix
nào. **Xử lý:** KHÔNG tự thêm row matrix, KHÔNG tự xoá file — editorial docs
(full theo nhóm matrix) **FROZEN** kể từ spec FI-373; slug mới chỉ thêm qua
coordinator (spec mới / amend epic). Audit tương tự: slug ngoài matrix bị báo
trong phần outside của summary. Báo coordinator ngay khi thấy dòng này.

## Bài features (#14-21) — claim CHỈ theo nhãn Verify-shipped

8 bài features (SF-3) KHÔNG được tự verify hay nhớ-cache claim: mở
`claims-registry.md` `## Verify-shipped — batch-2 features`, tìm dòng
`- feature-<tên>`. Chỉ được viết khi dòng có nhãn **SHIPPED / MAIN-ONLY /
ROADMAP**; trong bài claim ĐÚNG theo nhãn đó (SHIPPED = có code + trong release
≤ v1.4.199; MAIN-ONLY = code trên main chưa release; ROADMAP = chưa có).
`PENDING-VERIFY` = chưa verify — KHÔNG viết bài đó. Audit T3 đọc lại section
này: sai nhãn canonical = FAIL.

## Hero wiring (flagship `hero: yes` — batch-2 + batch-3)

Pipeline `scripts/render-blog-heroes.mjs` ĐỌC frontmatter: bài khai
`heroImage: "/blog/heroes/<slug>.png"` (khớp đúng slug của chính nó) sẽ được
render. Vì vậy **render CHỈ sau khi bài tồn tại** — script quét các bài
đang có trong tree, nên bài chưa commit chỉ là CHƯA được render (không lỗi);
chạy khi không bài nào có heroImage → script exit 1 (không render gì một cách
âm thầm).

**CẢ EN VÀ VI đều khai `heroImage`, CÙNG MỘT GIÁ TRỊ** (VI share hero EN).
Parity gate `scripts/check-blog-slug-parity.mjs` (FI-349 SF-1) đòi presence
+ value khớp 1:1 giữa hai locale — khai một locale duy nhất → build FAIL
("heroImage declared in en only"); hai giá trị khác nhau → FAIL
("heroImage differs … VI shares the EN hero").
⚠ Note cũ "VI KHÔNG khai heroImage" là SAI — mâu thuẫn parity gate, đã bị
flag 4 lần trong batch-2 (SF-2/3/4/5) và được sửa tại đây (FI-384).
Sau render: commit CẢ file PNG + SVG của slug đó cùng commit bài (hero thuộc
bài). --check để xác nhận 1200×630 mà không re-render.

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

## Batch 3 — 50 bài deep-dive repo (story FI-383, Linear FI-384)

Quy trình 1 bài (SF-2/FI-385 · SF-3/FI-386 · SF-4/FI-387 · SF-5/FI-388 —
owner range theo header matrix `topic-matrix-batch3.md`):

1. **Research** — điền skeleton
   `docs/superpowers/editorial/research/digests-batch3/<slug>.md` (SF-1 đã
   tạo sẵn: repo/facet/stars/license từ probe GitHub API 2026-09-08): đọc
   README + code thật, release cadence — KHÔNG bịa số không probe. Cần số
   mới: `bash scripts/probe-repos.sh` (bảng aligned 50 repo: repo | stars |
   pushed | license | archived) — ngày chạy = ngày N trong bài.
2. **VI draft 900-1400 từ** + **EN mirror CÙNG COMMIT** — đúng checklist 8
   bước ở đầu runbook (evidence block mỗi H2, docs link đúng locale, 1 cặp
   VI+EN = 1 commit).
3. **Section marker bắt buộc** (cuối bài, trước CTA): VI heading
   `## Wakii học được gì` / EN `## What Wakii learns` — level `##` exact;
   grading ADOPT/DIRECTION/WATCH/N/A so product surface thật, mỗi grade ≥1
   lý do (style-guide §8).
4. **Claims third-party** — mọi số kèm "theo GitHub API ngày N"; quote
   ngắn (≤25 từ) có attribution + link; trích code kèm link commit/tree;
   license none/NOASSERTION → gọi "công khai trên GitHub", KHÔNG
   "open-source"/"mã nguồn mở" — 8 repo thật (probe 09-08); machine-chặn
   scoped trên 6 slug † pin, crush + neovim license-safe review-enforced
   (claims-registry §Third-party claims — batch-3, rule 2).
5. **ADOPT draft** (khi grade ADOPT) vào
   `docs/superpowers/editorial/research/adopt-drafts/` theo rubric
   style-guide §10 — KHÔNG tự file issue; SF-6 file tập trung sau review.

### Lint gates MỚI cho batch-3 (scoped theo matrix origin — batch-1/2 miễn)

- **Marker scoped** (`check-blog-content.mjs`): bài matrix batch-3 thiếu
  `## Wakii học được gì` / `## What Wakii learns` → lint exit 1 (draft cũng
  bị — structural check).
- **pubDate-vs-matrix**: frontmatter pubDate ≠ pubDate của row matrix →
  FAIL `frontmatter: pubDate "X" != matrix row "Y"`.
- **Scoped FORBIDDEN**: "open-source"/"mã nguồn mở" trên đúng 6 slug † →
  FAIL ở CẢ lint lẫn audit T3(a) (hai script cùng parser — cùng kết quả);
  bài khác dùng hai cụm này tự do.

### Audit batch-3 (`audit-blog-convergence.mjs`)

- T3(c): 2 family `seed-posts=10` / `clis=24` bỏ qua slug batch-3
  (preBatch3) — số "10" trong date "2026-10-01" cạnh "bài" không còn sinh
  claim giả.
- T7: matrix batch-3 rows thiếu file = pendingRows NOTE kèm owner đúng
  (SF-2..5) — KHÔNG FAIL giữa chừng; strict coverage (0 pending) là việc
  SF-6. Wants pin: batch-1 20 + batch-2 44 + batch-3 50 = 114.
