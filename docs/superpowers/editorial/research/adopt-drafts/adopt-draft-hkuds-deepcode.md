# ADOPT draft — nhật ký kỹ thuật theo merge ngay trong README

> Draft FI-383 (SF-4, matrix #35 `deep-dive-hkuds-deepcode`) — SF-6 file issue
> tập trung sau review, label `enhancement` trên `wakii-dev/wakii`.
> KHÔNG link path nội bộ site repo (rubric §10) — dẫn chứng bằng bài post public.

## 1. Pattern

Repo **HKUDS/DeepCode** (16.499 sao, license MIT — theo GitHub API ngày
2026-09-08) duy trì mục **News** ngay đầu README: mỗi đợt merge có một entry
đặt tên release, nêu số PR, mô tả THAY ĐỔI HÀNH VI (không liệt kê file đổi),
và — điểm hiếm gặp — nêu luôn QUY TẮC KIỂM CHỨNG đi kèm. Entry không chỉ ghi
"đã merge X" mà trả lời "làm sao tin X đúng". Repo cập nhật mục này như một
bước của quy trình phát hành: commit `3fab4561` (2026-09-06) "docs(readme):
news for the 2026-09-06 merges, in both languages" — nhật ký là một phần của
release, không phải việc viết sau.

## 2. Evidence inline

Hai trích dẫn nguyên văn từ README của repo (theo GitHub API ngày 2026-09-08,
tại commit HEAD `949c688b13c86b1d0b27fe96cfb6cbee41ad961e`):

- Entry 2026-08-19 về session resume: "A test makes the rule executable" —
  bất biến "every request a run sends must be rebuildable from the session
  file alone" được mã hoá thành test chạy được, kèm ngay trong entry mô tả
  bất biến đó.
- Entry 2026-09-06 (v2.2.0) về memory: "Compaction leaves a note in memory,
  and memory notes cannot escape their boundary." — entry nêu cơ chế (bọc
  nội dung memory trong `<untrusted-data>` với thẻ đóng bị escape), số PR
  (#204), và hành vi phòng ngừa (note nhiễm độc không forge được instruction).

Cả hai entry đều ≤ vài câu, có số PR, và người đọc xác minh được bằng cách
mở PR tương ứng.

## 3. Đề xuất Wakii

- **Surface áp dụng**: README của `wakii-dev/wakii` + nội dung release notes
  khi phát hành phiên bản mới. Wakii đã có release notes theo version
  (v1.4.198/v1.4.199), nhưng README chưa có lớp nhật ký theo merge.
- **Hành vi kỳ vọng**: mỗi đợt merge đáng chú ý (feature mới, gate mới, fix
  bảo mật) sinh một entry 1-3 câu trong mục News: số PR + hành vi trước/sau +
  quy tắc kiểm chứng ("test nào chứng minh điều này"). Khi release, gom các
  entry mới vào release notes thay vì viết notes từ đầu. Đây là surface docs
  thuần — không đổi code sản phẩm, chi phí duy trì thấp, tăng giá trị kênh
  build-in-public mà dự án đã cam kết.
- **Rủi ro chính**: entry kiểu này tốn kỷ luật viết hơn changelog tự sinh từ
  commit messages; nếu ai cũng "để sau" sẽ mục được bỏ bê giữa hai release —
  nên gắn bước cập nhật News vào checklist phát hành hiện có thay vì coi là
  việc tự nguyện.

## 4. Upstream links

- Repo: https://github.com/HKUDS/DeepCode (MIT)
- README (mục News):
  https://github.com/HKUDS/DeepCode/blob/949c688b13c86b1d0b27fe96cfb6cbee41ad961e/README.md
- Commit cập nhật News: `3fab4561` (2026-09-06T08:56:26Z)
- Bài deep-dive tương ứng: sẽ live tại `/blog/deep-dive-hkuds-deepcode/` (VI:
  `/vi/blog/deep-dive-hkuds-deepcode/`) sau khi story FI-383 merge.
