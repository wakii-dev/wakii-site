# Research digests — batch 3 (story FI-383)

50 file `<slug>.md` — mỗi file 1 matrix row của `topic-matrix-batch3.md`
(tên file = slug bài). Skeleton do SF-1 tạo (matrix + probe
2026-09-08); **SF sở hữu điền TODO trước khi viết bài**.

## Convention

1. **Điền vào file skeleton của repo mình** — không tạo file mới, không đổi
   tên; số số liệu phải truy được về probe có ghi ngày.
2. **Mọi số third-party kèm ngày** — "theo GitHub API ngày N" (N = ngày
   research thật). Re-probe khi cần: `bash scripts/probe-repos.sh`
   (in bảng aligned 50 repo: repo | stars | pushed | license | archived).
3. **License-safe**: license `none`/`NOASSERTION` → repo "công khai trên
   GitHub", KHÔNG "open-source"/"mã nguồn mở" — scoped FORBIDDEN trên đúng
   6 slug † của matrix (claims-registry). Lưu ý probe 2026-09-08 thấy thêm
   `charmbracelet/crush` + `neovim/neovim` = NOASSERTION (ngoài 6 † pinned)
   — viết license-safe cho cả hai, flag coordinator quyết scope.
4. **Grading** ADOPT / DIRECTION / WATCH / N/A theo style-guide §8 — mỗi
   grade ≥1 lý do; grading so product surface THẬT của Wakii.
5. **ADOPT draft** (nếu grade ADOPT) ghi vào
   `docs/superpowers/editorial/research/adopt-drafts/` theo rubric
   style-guide §10 — SF-6 file tập trung lên `wakii-dev/wakii` sau review.
6. Digest KHÔNG build vào site (ngoài `src/`) — đây là research nội bộ của
   story, reference từ bài qua ý, không phải link.
