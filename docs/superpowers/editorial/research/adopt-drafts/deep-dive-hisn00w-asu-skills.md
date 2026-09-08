# ADOPT draft — single-source skills registry, machine-reconciled (từ ASu-skills)

> Draft cho SF-6 file tập trung trên `wakii-dev/wakii`, label `enhancement`.
> KHÔNG file issue từ SF-5. Rubric: style-guide §10. Probe ngày 2026-09-08.

1. **Pattern** — Catalog skill dùng MỘT nguồn sự thật duy nhất; mọi view dẫn
   xuất (manifest từng kênh phân phối, số đếm hiển thị) do script SINH RA từ
   nguồn đó và CI đối chiếu (`--check`) — drift catalog bị máy chặn trước khi
   merge. Học từ **Hisn00w/ASu-skills** (4.025★, MIT, theo GitHub API ngày
   2026-09-08): `skills.registry.json` + `npm run sync:skills` + CI `--check`
   phủ 5 manifest harness từ một nguồn `skills/`.

2. **Evidence inline** — README repo ghi: danh mục entry lấy
   `skills.registry.json` ở gốc repo làm nguồn sự thật duy nhất, do
   `npm run sync:skills` sinh và đối chiếu, CI chạy lại với `--check`
   (theo GitHub API ngày 2026-09-08 — README.md của repo). Cơ chế được người
   ngoài dùng thật: PR #136 "fix/docs-skill-catalog-sync" (contributor
   qiyu-lu, merge 2026-09-08) sửa đúng lớp sync để chống trôi docs catalog.

3. **Đề xuất Wakii** — Áp vào catalog skills của kit: `src/data/skills.ts`
   (20 tổng / 13 public tại thời điểm viết) là nguồn; mọi số đếm hiển thị ở
   README/docs sinh tự động hoặc được lint-check đối chiếu trực tiếp với mảng
   trong `skills.ts` (đếm TRONG mảng `export const skills`, không grep
   whole-file — pattern đếm sai 21/14 đã có phân tích). Kỳ vọng hành vi: sửa
   `skills.ts` mà quên cập nhật số ở README → CI/lint đỏ với diff cụ thể.
   Rủi ro chính: một script sync/kiểm nữa cần bảo trì; chặn ở mức lint nhẹ hơn
   sinh-view để tránh trùng hai nguồn sự thật.

4. **Upstream links** —
   - Repo: https://github.com/Hisn00w/ASu-skills
   - README (mục cài đặt + registry): https://github.com/Hisn00w/ASu-skills/blob/main/README.md
   - PR #136 (chống catalog drift): https://github.com/Hisn00w/ASu-skills/pull/136
   - Bài deep-dive công khai: sẽ live tại `/blog/deep-dive-hisn00w-asu-skills/`
     sau khi story merge (build-in-public đã duyệt 2026-09-07).
