---
title: "DeepCode: nghiên cứu code đa agent từ HKUDS"
description: "DeepCode biến paper thành code chạy được bằng pipeline bảy agent có cổng chặn plan; bài đọc sức khoẻ repo qua số GitHub API thay vì tin vào số sao."
pubDate: "2026-10-18"
category: "tech"
tags: ["agents", "oss"]
draft: false
---

Một repo nghiên cứu gần 16.500 sao thường kéo theo nghi vấn cố định: cao về
sao, thưa về activity — star đến từ tò mò, commit dừng khi funding cạn. DeepCode
của nhóm HKUDS (Đại học Hong Kong) nằm ở phía ngược lại của nghi vấn đó, và
chính điều đó làm nó đáng đọc. Bài này không kể chuyện repo hay: nó đọc ba lớp
bằng chứng — số health lấy từ GitHub API, kiến trúc pipeline đa agent đọc trong
code, và kỷ luật shipping thấy được ngay trong README. Mọi con số lấy trực tiếp
ngày research 2026-09-08, không dùng trí nhớ.

TL;DR:

- DeepCode: 16.499 sao, license MIT, pushed 2026-09-06 — repo gốc nghiên cứu
  nhưng activity thật (theo GitHub API ngày 2026-09-08).
- Paper2Code: bảy vai trò chuyên trách, một trong số đó là orchestrator trung
  tâm, từ paper/URL tới code có verification.
- Pipeline có cổng chặn cứng: thiếu file plan thì dừng cả pipeline, chưa có
  người duyệt plan thì chưa sang phase viết code.
- README có mục News đọc như nhật ký kỹ thuật theo từng merge — pattern đáng
  mang về repo sản phẩm.

## Sức khoẻ đọc từ số, không từ sao

Đọc health một repo nghiên cứu phải bắt đầu từ metadata, không phải từ cảm
giác về độ nổi tiếng. Probe ngày 2026-09-08 cho thấy:

| Chỉ số | Giá trị (theo GitHub API ngày 2026-09-08) |
| --- | --- |
| Sao | 16.499 |
| Fork | 2.151 |
| License | MIT |
| Pushed gần nhất | 2026-09-06 |
| Tạo repo | 2025-05-14 |
| Tổng releases | 16 (v1.0.0 đến v2.2.0) |

Hai chỉ số cuối mới là phần thú vị. Repo tạo tháng 5-2025 và vẫn pushed hai
ngày trước khi tôi probe. Cadence release đang tăng tốc chứ không phai: v1.3.0
ngày 2026-07-17, v2.0.0 ngày 2026-08-03, v2.1.0 ngày 2026-08-12, v2.2.0 ngày
2026-09-06 — bốn bản trong khoảng bảy tuần (theo GitHub API ngày 2026-09-08),
sau quãng giãn từ tháng 2 sang tháng 7. Commit đầu HEAD cũng là lệnh phát hành:
`949c688b` "release: prepare DeepCode v2.2.0" ngày 2026-09-06.

Vậy nếu bạn dùng khuôn sàng "star cao, activity thấp" cho repo nghiên cứu,
DeepCode là ví dụ nhắc bạn phải đọc số trước khi xếp loại. Không có gì bảo đảm
cadence này kéo dài — nhưng tại thời điểm probe, nghi vấn khởi đầu không được
xác nhận.

## Bảy agent biến paper thành code

Paper2Code là hướng nghiên cứu gốc của DeepCode và vẫn là workflow chuyên trách
riêng bên cạnh agent lập trình tổng quát. Đọc
`workflows/agent_orchestration_engine.py` (2.407 dòng tại commit HEAD) thấy
pipeline chạy qua các phase đánh số rõ:

```
paper / URL / repo tham chiếu
  |
  v
[phan tich yeu cau] -> [workspace] -> [chia doan tai lieu]
  |
  v
[lap ke hoach code] -> [GATE duyet plan] -> [dao tham chieu]
  |
  v
[lay repo lien quan] -> [index ma nguon] -> [hien thuc hoa] -> [verification]
```

Trên tầng pipeline là bảy vai trò chuyên trách do README mô tả: một orchestrator
trung tâm chọn phase kế tiếp, cùng sáu agent hiểu yêu cầu, phân tích tài liệu,
lập kế hoạch code, đào tham chiếu, đánh index mã nguồn, và hiện thực hoá. Bốn
ý tưởng nối chúng: orchestration động (orchestrator được quay lại phase trước
khi bằng chứng thay đổi, thay vì chạy chuỗi prompt cố định), grounding tài liệu
thành yêu cầu hiện thực trước khi viết code, memory kèm CodeRAG (tài liệu dài
và repo tham chiếu được chia đoạn, index rồi truy hồi thành ngữ cảnh có giới
hạn), và verification lặp lấy kết quả chạy thật bơm ngược vào kế hoạch.

README tóm ý tưởng cuối này một câu: mục tiêu "not to generate code that merely
looks correct" (README DeepCode, [hkuds.github.io/DeepCode](https://hkuds.github.io/DeepCode/))
— code phải chạy, kiểm chứng được, và cải tiến tiếp được.

## Cổng chặn giữa kế hoạch và code

Chi tiết tôi đọc kỹ nhất trong code nằm ở phase lập kế hoạch. Sau khi agent
lập kế hoạch chạy xong, pipeline không tin vào trạng thái nội bộ mà kiểm tra
bằng chứng trên đĩa
([workflows/agent_orchestration_engine.py](https://github.com/HKUDS/DeepCode/blob/949c688b13c86b1d0b27fe96cfb6cbee41ad961e/workflows/agent_orchestration_engine.py)):

```python
if not os.path.exists(dir_info["initial_plan_path"]):
    raise RuntimeError(
        "Code planning did not produce initial_plan.txt; aborting the"
        " pipeline before any subsequent phase"
    )
```

Thiếu file plan thì cả pipeline dừng tại đó — không phase nào sau được chạy
nữa. Ngay sau kiểm tra đó là một gate thứ hai dành cho con người:
`run_plan_review_gate` trong
[workflows/plan_review_runtime.py](https://github.com/HKUDS/DeepCode/blob/949c688b13c86b1d0b27fe96cfb6cbee41ad961e/workflows/plan_review_runtime.py)
đưa pipeline vào trạng thái `waiting_for_review` rồi chờ duyệt với ba lựa
chọn: approve, skip, hoặc revise kèm phản hồi; plan sửa lại còn đi qua bước
kiểm tra hợp lệ YAML trước khi được chấp nhận.

Cặp gate này tách rời hai loại rủi ro thường bị trộn: gate máy chặn "không có
bằng chứng artifact", gate người chặn "artifact có nhưng sai hướng". Chạy tự
động được phép, nhưng chỉ sau khi plan đã đi qua cả hai.

## README đọc như nhật ký kỹ thuật

Kỷ luật shipping của DeepCode không nằm ở tần suất release mà nằm ở cách nó
viết về từng release. Mục News trong README có một entry cho mỗi đợt merge:
nêu số PR, mô tả hành vi thay đổi, và — điểm hiếm gặp — nêu luôn quy tắc kiểm
chứng. Entry 2026-08-19 viết về session resume kèm câu "A test makes the rule
executable" (README DeepCode, [github.com/HKUDS/DeepCode](https://github.com/HKUDS/DeepCode)):
bất biến "mọi request phải dựng lại được từ file session" trở thành test chạy
được thay vì lời hứa trong doc.

Entry mới nhất, đi kèm release v2.2.0 ngày 2026-09-06, là ví dụ khác: compaction
để lại ghi chú trong memory, và "memory notes cannot escape their boundary"
(README DeepCode) — nội dung memory được bọc trong thẻ `<untrusted-data>` với
thẻ đóng bị escape, để một ghi chú nhiễm độc không giả mạo được instruction.
Commit `3fab4561` cập nhật News cho cả hai ngôn ngữ cùng lúc.

Về benchmark: README công bố kết quả PaperBench tự báo cáo trong paper nhóm
(arXiv 2512.07921) — 75,9% trên human-expert subset so với baseline 72,4%, và
84,8% trên commercial-agent subset. Đây là số nhóm tự đánh giá trên benchmark
cụ thể, không phải so sánh sản phẩm độc lập; đọc số ở đúng mức đó, không hơn.

Wakii cũng đi theo đường gate và bằng chứng — quy trình workflow xem toàn bộ
qua [trang superpowers panel](/vi/docs/superpowers-panel/). Hai bài đối chiếu
trực tiếp trên blog này: cách đo convergence QA cuối đợt ship ở
[convergence-qa-last-tier](/vi/blog/convergence-qa-last-tier/) và case study
một story thật ở [blog-story-case-study](/vi/blog/blog-story-case-study/).

## Wakii học được gì

- **ADOPT** — nhật ký News trong README: mỗi merge một entry nêu PR, hành vi
  thay đổi và quy tắc kiểm chứng ("test làm bất biến thành cái chạy được").
  Wakii đã có release notes, nhưng pattern entry-theo-merge với PR ref kèm quy
  tắc test đáng áp cho README `wakii-dev/wakii` — surface docs, chi phí thấp,
  tăng độ tin cậy của build-in-public.
- **DIRECTION** — boundary `<untrusted-data>` cho memory note: memory mà agent
  đọc là nguồn injection tiềm năng; bọc nội dung inject với ranh giới có thẻ
  đóng bị escape là biện pháp cụ thể, đáng đưa vào hướng đi cho memory trong
  story workflow. Điều kiện áp: escape hai chiều phải nhất quán giữa lúc ghi
  và lúc đọc.
- **WATCH** — orchestration động cho phép quay lại phase trước khi bằng chứng
  thay đổi. Pipeline story của Wakii cố định theo thiết kế (phase0 → spec →
  plan → execute → verify) với rollback-fixer đảm nhiệm ca diverged; đáng theo
  dõi xem orchestration động có vượt được mô hình cố định + gates về độ tin
  cậy trước khi cân nhắc đổi.
- **N/A** — Paper2Code như tính năng sản phẩm: Wakii không phải công cụ tái
  hiện nghiên cứu, không có use-case paper-to-code thật để áp; học được pattern
  grounding và gate, không học việc bán tính năng.

Nếu bạn đang xây quy trình agent có gate và muốn xem một bản workflow đầy đủ
đang chạy thật, tải Wakii và mở docs — panel hiển thị live từng gate của story
đang chạy.
