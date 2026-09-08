# ADOPT draft — zed-industries/zed (batch-3, matrix #10)

> Draft theo rubric §10 (style-guide). SF-6 file TẬP TRUNG sau review —
> draft này chỉ là seeding; KHÔNG tạo issue từ SF-2.

1. **Pattern** — Kênh `-pre` đi trước mỗi bản stable vài giờ đến vài ngày,
   xuất bản dày (6 stable trong 17 ngày). Học từ zed-industries/zed
   (89,941★, license NOASSERTION — repo công khai trên GitHub, theo GitHub
   API ngày 2026-09-08).

2. **Evidence inline** — Chuỗi release theo GitHub API ngày 2026-09-08:
   v1.16.1 (2026-08-19) → v1.16.2 (08-24) → v1.16.3 (08-26) → v1.17.2 (08-26)
   → v1.18.0 (09-02) → v1.18.1 (09-04); xen kẽ `-pre`: v1.17.2-pre (08-25)
   trước v1.17.2 (08-26); v1.18.0-pre (08-26) trước v1.18.0 (09-02).
   Upstream: `github.com/zed-industries/zed/releases`.
   Phân tích đầy đủ trong bài deep-dive (bài sẽ live tại
   `/blog/deep-dive-zed-industries-zed/` sau khi story merge).

3. **Đề xuất Wakii** — Thêm kênh `-pre` cho desktop build: xuất bản `-pre`
   trước mỗi đợt thay đổi UI lớn (panel, layout), ổn định vài ngày rồi promote
   thành stable. Kỳ vọng hành vi: regression UI bị người dùng sớm bắt (pre
   channel tự chọn), bản stable ít bất ngờ hơn; rủi ro chính là phân mảnh
   phiên bản + chi phí hỗ trợ song song hai kênh — giảm bằng cách chỉ gắn
   `-pre` vào đợt rủi ro cao, không bật mặc định.

4. **Upstream links** —
   - Repo: https://github.com/zed-industries/zed
   - Releases: https://github.com/zed-industries/zed/releases
