# ADOPT draft — tự đo surface bằng script có ranh giới khai báo rõ

> Draft FI-383 (SF-4, matrix #28 `deep-dive-hkuds-nanobot`) — SF-6 file issue
> tập trung sau review, label `enhancement` trên `wakii-dev/wakii`.
> KHÔNG link path nội bộ site repo (rubric §10) — dẫn chứng bằng bài post public.

## 1. Pattern

Repo **HKUDS/nanobot** (47.883 sao, license MIT — theo GitHub API ngày
2026-09-08) giữ một script `core_agent_lines.sh` ngay trong root: script
**định nghĩa trước ranh giới "core"** (5 package: agent/bus/config/cron/session)
rồi mới đếm dòng, tách các phần mở rộng thành bucket riêng (tools, skills,
api, cli, channels, utils). Nhờ vậy con số "core 17749 dòng / extra 93018
dòng" (chạy tại commit `104917a`, ngày 2026-09-08) có nghĩa kiểm chứng được —
không phải cảm nhận.

## 2. Evidence inline

Output chạy `core_agent_lines.sh` trên tarball tại commit `104917a`
(2026-09-08), abridged:

```text
Core runtime
------------
  agent/             9597 lines
  bus/                718 lines
  config/            1356 lines
  cron/              1380 lines
  session/           4698 lines

Totals
------
  core total        17749 lines
  extra total       93018 lines
```

Script tự ghi chú phương pháp: "agent/ only counts top-level Python files
under nanobot/agent" — ranh giới đếm là khai báo, không phải cấu hình ngầm.
README gọi core là "a small, readable core" — con số trên là bằng chứng đo
được cho claim đó (repo HKUDS/nanobot, theo GitHub API ngày 2026-09-08).

## 3. Đề xuất Wakii

- **Surface áp dụng**: cách đếm surface kit (skills / agents / story-* CLIs).
  Hiện trạng: số skills từng bị đếm sai 21/14 do grep whole-file dính thêm
  dòng khai báo interface + comment header (pattern đã ghi trong claims
  registry drift-note của dự án); số đúng là 20 tổng / 13 public khi đếm
  TRONG mảng catalog (tại thời điểm viết, 2026-09-08).
- **Hành vi kỳ vọng**: một lệnh `check` duy nhất (kiểu script nhỏ trong kit)
  in ra số skill/agent/CLI đếm từ NGUỒN CHUẨN (trong mảng/catalog, không grep
  whole-file), kèm ranh giới "cái gì được tính" khai báo ngay trong script —
  giống cách `core_agent_lines.sh` liệt kê package trước khi đếm. Mọi tài
  liệu/blog cite số surface kit lấy từ lệnh này thay vì đếm tay.
- **Rủi ro chính**: script mới phải được chạy định kỳ thì mới chống drift —
  nếu chỉ viết rồi bỏ, quay lại đúng vấn đề ban đầu; cân nhắc gắn vào CI/audit
  hiện có.

## 4. Upstream links

- Repo: https://github.com/HKUDS/nanobot (MIT)
- Script đo core:
  https://github.com/HKUDS/nanobot/blob/104917aaec8b351edcbbc87a64fa6b71eb6e096b/core_agent_lines.sh
- Commit lấy evidence: `104917aaec8b351edcbbc87a64fa6b71eb6e096b`
  (2026-09-08T08:13:26Z)
- Bài deep-dive tương ứng: sẽ live tại `/blog/deep-dive-hkuds-nanobot/` (VI:
  `/vi/blog/deep-dive-hkuds-nanobot/`) sau khi story FI-383 merge.
