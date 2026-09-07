# SF-1 Context Pack (FI-359 longform) — Editorial foundation + pilot

> Đọc file này THAY VÌ tự tổng hợp từ bracket + epic + comments.
> Epic spec: `docs/superpowers/specs/2026-09-07-blog-longform-20-posts-spec.md`
> Bracket: `docs/superpowers/brackets/fi359-blog-longform-20.md`
> LƯU Ý: bare paths `contexts/sf-N.md` thuộc story redesign FI-349 — KHÔNG đụng.
> Story: blog longform 20 bài (10 → 30 posts). CONTENT-ONLY — duy nhất SF-1 được
> đụng code (1 lint script mới + 1 dòng package.json).

## Spec slice (chỉ phần SF-1 chịu trách nhiệm)

1. **Tạo thư mục editorial** `docs/superpowers/editorial/2026-blog-longform/` chứa
   5 file — tài sản dùng chung của toàn story, SF-2/3/4 đọc sau merge:
   `topic-matrix.md` · `claims-registry.md` · `style-guide.md` · `evidence-pack.md`
   · `runbook.md`.
2. **topic-matrix.md** — 20 hàng chốt cứng (slug · title hướng · category · pubDate
   · evidence chính · docs-link target · tags đề xuất · angle ≥2 H2 mới so seed).
   Nguồn: ma trận epic spec §Ma trận — copy nguyên, KHÔNG đổi slug/ngày/category
   (D2/D6 chốt; gồm slug `shipping-cadence-two-releases-one-day` và
   `building-wakii-in-the-open-log-2`).
3. **claims-registry.md** — format GREPPABLE (P1 fix): section `## ALLOWED` và
   `## FORBIDDEN`, mỗi claim/cụm 1 dòng `- ...`. ALLOWED: 9 agents (đủ tên);
   skills kit (số theo snapshot — xem 5); 24 story-* CLIs; zero-setup idempotent;
   panel ⚡ + 🌳; bracket canvas; gates B0-B5; watchdog 3-layer; pipeline
   idea→impact→plan→epic+SF→parallel→gates→1 PR; 8 principles; QR pairing từ
   desktop; story view SF tiers/progress; gates choice/free-text+confirm;
   notification open/closed; guard codes; dark-only; repo public wakii-dev/wakii
   (MIT) fork của Orca; releases version-named. FORBIDDEN (lint grep,
   case-insensitive): "pairing persistence" / "mọi state" / "agent → worktree từ
   phone" / "Stories tab" / mọi biến thể claim mobile chưa verify theo FI-341.
4. **style-guide.md** — cấu trúc bài: hook 1 đoạn → TL;DR list 3-5 bullet → 3-5
   section H2 (mỗi section ≥1 evidence block) → đoạn nối docs → CTA nhẹ.
   **Thuật toán đếm PIN (D1)**: body sau frontmatter, BỎ fenced code-block
   (```...``` — diagram/transcript không đếm, chặn độn), split `/\s+/`.
   VI 900-1400 (lint warn >1400; QA hard-fail >1470), EN ≥800. Tone như 10 seed —
   kỹ sản, câu ngắn, VI trước EN mirror cùng commit. **Quy tắc link**: KHÔNG dùng
   `#anchor` cross-file (heading VI/EN lệch nhau → anchor chết trên trang 200);
   link docs chỉ tới trang.
5. **evidence-pack.md** — vật liệu THẬT (mỗi item verify lại bằng git/gh trước khi
   ghi; format: item + nguồn lệnh + ngày lấy). **Numbers snapshot (D8)** section
   đầu file: ngày chụp + giá trị + output lệnh nguồn cho: skills (đọc
   `src/data/skills.ts`), releases (`gh release list --repo wakii-dev/wakii`),
   agents=9, CLIs=24, số posts. Mọi bài viết đối chiếu snapshot; sweep SF-5 đối
   chiếu snapshot (drift tại QA = ghi chú, không fail).
   **Section "hub-store artifacts" (D3 mới)**: đọc sibling repo
   `~/Desktop/projects/service-support-clone/docs/superpowers/` (READ-ONLY — repo
   KHÔNG nằm trong worktree của mình) và CHẤT DIGEST vào evidence-pack TRONG repo:
   7 brackets (`ict-service-support-rebuild` · `fi233-polyglot-grpc-mf` ·
   `fi245-postgres-production` · `fi272-minikube-deploy` ·
   `fi280-qa-hub-store-regression` · `fi326-api-docs-swagger` ·
   `fi338-dispatch-queue`) + specs/plans nổi bật (vd `sf11-fe-convergence`,
   `sf25-ktv-mobile`) — mỗi item: tên file, đường dẫn GitHub
   (`https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/<loại>/<file>`),
   số SF/tier, 2-3 quote tiêu đề SF đáng dùng làm dẫn chứng. Verify repo public
   bằng `gh repo view wakii-dev/hub-store` trước khi ghi link.
6. **Lint script** `scripts/check-blog-content.mjs` (node ESM, đọc
   `scripts/check-blog-slug-parity.mjs` trước làm mẫu phong cách):
   - **Scope CHỈ 20 slug mới**: danh sách 5 SEED_SLUGS frozen trong script làm
     exclusion (seeds được miễn band/locale-link — band seed 350-500 là chuẩn
     FI-341 đã duyệt); chỉ kiểm slug CÓ TRONG cây → worktree giữa-chừng build
     xanh (partial pass đúng thiết kế); matrix-completeness KHÔNG ở lint — việc
     của SF-5.
   - band theo thuật toán D1 (prose excl. fenced code); `draft:true` → in
     "skipped-draft" + bỏ qua band;
   - ≥1 link `](/docs/<slug>/)` (EN) hoặc `](/vi/docs/<slug>/)` (VI), slug ∈
     DOC_SLUGS (`src/config.ts`);
   - frontmatter đủ 6 field, category ∈ enum, draft boolean, pubDate parse được,
     filename kebab-case;
   - grep FORBIDDEN cụm từ claims-registry (case-insensitive);
   - exit 1 + in đúng file vi phạm; **test cả 2 chiều** — pass + bắt được lỗi
     (tạo bài test sai tạm, chạy, xóa) trước khi báo xong (verify-first).
7. **Wiring** `package.json`: `node scripts/check-blog-slug-parity.mjs && node
   scripts/check-blog-content.mjs && astro build`. Thay đổi code DUY NHẤT của
   SF-1. (Lưu ý: story redesign FI-349 cũng có thể chạm package.json ở SF của nó
   — giữ diff của mình 1 dòng, conflict trivial nếu có.)
8. **D4** — quy ước vào style-guide + runbook + pilot thực hành: bài mới VI link
   `/vi/docs/`, EN link `/docs/`. Seeds KHÔNG đụng.
9. **pubDate** — ngày cứng từng bài trong matrix (max 2 bài mới/ngày; double-day
   08-31 và 09-07; thứ tự trong ngày = glob order, chấp nhận).
10. **Pilot post** — matrix #1 `zero-setup-agent-team` (VI + EN) đi hết pipeline:
    style-guide → frontmatter template → lint xanh → build xanh → listing cả 2
    locale đúng 08-20. Pilot = bài HOÀN CHỈNH giao SF-2 tích hợp (SF-2 không viết
    lại).
11. **runbook.md** — checklist per-post cho SF-2/3/4: đọc matrix row (angle ≥2 H2
    mới) → đọc evidence-pack + snapshot → outline → VI draft (band) → EN mirror
    cùng commit → self-lint → self-claims-check vs registry → cross-link ≥1 bài
    đã tồn tại (KHÔNG link mù sang bài chưa chắc có).
12. **D8 rule** ghi vào registry: số liệu re-extract ĐỐI CHIẾU SNAPSHOT — không
    tin số nhớ-cache không nguồn.

## Touch map (files SF-1 tạo/sở hữu)

```
docs/superpowers/editorial/2026-blog-longform/   (5 file — SF-1 owns)
scripts/check-blog-content.mjs                   (SF-1 owns, MỚI)
package.json                                     (SF-1: đúng 1 dòng build chain)
src/content/blog/en/zero-setup-agent-team.md    (pilot)
src/content/blog/vi/zero-setup-agent-team.md    (pilot)
```

READ-ONLY tuyệt đối: `src/content.config.ts` · `src/pages/**` · `src/layouts/**` ·
`src/content/docs/**` · seeds (trừ 2 pilot mới) · `scripts/check-blog-slug-parity.mjs`
· `src/config.ts` · mọi file `contexts/sf-N.md` bare (của FI-349).

## ACCEPTANCE (user-visible)

- Preview build: /blog/ + /vi/blog/ thấy 11 bài (10 seed + pilot ngày 20-08 đầu
  danh sách), badge + mô tả đúng.
- Mở pilot 2 locale: 900-1400 từ prose (D1), TOC anchors, ASCII diagram, link docs
  đúng locale, tone như seed.
- `pnpm build` xanh (parity + lint mới PASS); bài test sai band/thiếu link/claim
  cấm → lint CHẶN với thông báo đúng file (test xong xóa bài test).
- Thư mục editorial đủ 5 file: registry phân biệt ALLOWED/FORBIDDEN greppable,
  matrix 20 hàng đủ cột có angle, snapshot D8 có output lệnh thật.

## Boundary (KHÔNG làm)

- KHÔNG viết 19 bài còn lại (SF-2/3/4) — chỉ pilot.
- KHÔNG đụng seeds, schema, pages, RSS, sitemap, i18n config, parity script,
  bare `sf-N.md` packs.
- KHÔNG taxonomy/hero/readingTime/JSON-LD (redesign FI-349 lo).
- KHÔNG deploy — story kết thúc ở PR.
- KHÔNG đổi category enum; lint không thêm matrix-completeness (việc SF-5).
