---
title: "Xây Wakii ra công khai — log 4"
description: "Log thứ tư của chuỗi xây Wakii công khai: hai mươi bài longform được viết bằng bộ khung editorial của chính chúng — matrix khóa trước khi viết, lint đếm từ, claims registry — khép bằng PR #3, rồi một lượt integration sau merge."
pubDate: "2026-09-30"
category: "build-log"
tags: ["build-log", "wakii", "evidence"]
draft: false
---

[Log 3](/vi/blog/building-wakii-in-the-open-log-3/) kể về cái khung: FI-349 dựng lại blog và khép bằng PR #2. Log này kể về thứ nằm trong khung — hai mươi bài longform của story FI-359, mỗi bài một bản VI một bản EN. Phần thú vị không phải con số 20. Phần thú vị là bộ khung editorial được dựng cùng lúc để bảo đảm hai mươi bài ấy không nói dối: một matrix khóa trước khi viết, một lint đếm từ không chịu nuốt cho ai, và một danh sách cấm chạy cùng build. Story khép bằng PR #3 — và phần việc chưa hết: sau merge còn một lượt integration đáng kể chi tiết.

TL;DR:

- 20 chủ đề có slug, ngày đăng, category khóa trong matrix trước khi dòng đầu tiên được viết; phân bổ 3 tutorial / 13 tech / 4 build-log.
- Band từ là điều kiện build, không phải khuyến nghị: VI 900-1400 (fail từ 1470), EN sàn 800 — chữ trong fenced code block không được đếm.
- Claims registry là nguồn sự thật duy nhất của các cụm từ cấm: lint đọc registry lúc chạy, không sao chép danh sách vào script.
- PR #3 merged 00:32 UTC ngày 2026-09-08; sau merge, chuỗi build thêm một gate — và bài học là build xanh phải chứng minh trên bản hợp nhất trước khi tuyên bố xong.

## Hai mươi chủ đề, một matrix khóa trước khi viết

Quyết định sớm nhất của FI-359 không phải "viết cái gì" mà là "chốt hết từ trước": hai mươi chủ đề, mỗi chủ đề có slug, ngày đăng và category cố định trong một bảng matrix, commit vào repo trước khi bài đầu tiên mở file. Đếm phân bổ theo category là một lệnh grep trên chính bảng đó:

```bash
$ grep -o '| tutorial |\|| tech |\|| build-log |' \
    docs/superpowers/editorial/2026-blog-longform/topic-matrix.md \
  | sort | uniq -c
   4 | build-log |
  13 | tech |
   3 | tutorial |
```

*Nguồn: grep trên topic-matrix.md, repo công khai wakii-dev/wakii-site, chạy 2026-09-08.*

Bốn cộng mười ba cộng ba bằng hai mươi — khớp số dòng của matrix. Viết theo matrix nghĩa là những quyết định dễ bị lảng tránh đã bị khóa: không bài nào tự dời ngày đăng, không slug nào đổi theo cảm hứng giữa chừng. Cái giá của sự cứng nhắc ấy được trả bằng một thứ lặp lại được: ai mở matrix đều biết chính xác blog sẽ có gì, trước khi blog có nó.

## Lint band từ: thuật toán đếm không chiều lòng ai

Mọi bài dài đều dễ mắc một bệnh: độn chữ cho đủ độ dài. Lint của chuỗi này chặn bệnh đó bằng một thuật toán đếm công khai, đặt tên D1 trong style guide: lấy phần thân sau frontmatter, bỏ toàn bộ fenced code block, rồi đếm từ trên phần còn lại. Việc bỏ fenced block là quyết định then chốt — một ASCII diagram hay transcript lệnh không được phép tính vào band, nếu không mọi bài sẽ "đủ 900 từ" bằng hình vẽ. Các hằng số nằm thẳng trong script:

```js
/* scripts/check-blog-content.mjs — word band, decision D1 */
const VI_MIN = 900;
const VI_WARN = 1400;
const VI_HARD = 1470;
const EN_MIN = 800;
```

*Nguồn: scripts/check-blog-content.mjs, repo công khai wakii-dev/wakii-site, lấy 2026-09-08.*

VI dưới 900 từ là fail; vượt 1400 nhận cảnh báo; vượt 1470 — trần cứng — là fail. EN sàn 800. Bản VI và bản EN của mỗi bài cùng cấu trúc, cùng ngày, cùng category; chênh lệch độ dài giữa hai ngôn ngữ được chấp nhận, còn thiếu nửa cặp locale thì không — gate parity đứng trước đó đã lo việc ấy.

## Claims registry: danh sách cấm chạy cùng build

Con số có nguồn mới là một nửa của "không nói dối". Nửa còn lại là những cụm từ sản phẩm không được phép xuất hiện trong bài. Thay vì trông chờ vào trí nhớ của người viết, story dựng một claims registry: một file markdown ghi phần ALLOWED — những gì đã verify kèm nguồn — và phần FORBIDDEN, mỗi dòng một cụm literal. Lint đọc đúng section FORBIDDEN ấy lúc chạy và grep nguyên file, kể cả title và description, không phân biệt hoa thường. Chú thích trong script tự nó là một tuyên ngôn:

```js
/* The forbidden list is parsed from the registry at run time — the registry
   is the single source of truth, the script never duplicates it. */
```

*Nguồn: scripts/check-blog-content.mjs, repo công khai wakii-dev/wakii-site, lấy 2026-09-08.*

Nghĩa là một claim chưa verify không cần ai "nhớ" để né: nó nằm trong registry một lần, và mọi bài viết sau đó tự bị chặn lúc build. Cặp bài [done means evidence](/vi/blog/done-means-evidence/) đã mổ nguyên tắc này ở tầng story; registry và evidence pack — snapshot các con số kèm lệnh nguồn và ngày lấy — là phiên bản của nguyên tắc ấy cho văn phong.

## PR #3 và lượt integration sau merge

FI-359 khép đúng hình dạng của chuỗi: hội tụ về một nhánh, một PR. Transcript của PR, chạy đúng hôm log này viết:

```bash
$ gh pr view 3 --repo wakii-dev/wakii-site --json state,mergedAt,title
{"mergedAt":"2026-09-08T00:32:26Z","state":"MERGED","title":"FI-359: Blog longform — 20 bài viết dài làm nổi bật tính năng Wakii (30 posts en/vi)"}
```

*Nguồn: gh pr view, repo wakii-dev/wakii-site, chạy 2026-09-08.*

Merge xanh không phải điểm kết. Ngay sau merge là lượt integration trên nhánh đích: khi bề mặt blog mới của FI-349 gặp 40 file bài viết mới, chuỗi build cần thêm một cửa kiểm trước khi astro build. Dòng build sau integration là bốn lệnh nối nhau bằng && — một lệnh đỏ, cả chuỗi dừng:

```json
"build": "node scripts/check-blog-slug-parity.mjs && node scripts/check-blog-utils.mjs && node scripts/check-blog-content.mjs && astro build",
```

*Nguồn: package.json, repo công khai wakii-dev/wakii-site, lấy 2026-09-08.*

Log 2 [đã chụp dòng build ba lệnh](/vi/blog/building-wakii-in-the-open-log-2/); giờ nó là bốn, và khác biệt đó là vết tích có nguồn của một lượt integration thật: gate utility mới được ghép vào sau khi hai story gặp nhau, không phải trước. Bài học vận hành nằm ở đó — merge sạch trên nhánh story không chứng minh gì về tích hợp; build xanh phải được chứng minh trên kết quả hợp nhất trước khi tuyên bố xong.

## Đối chiếu lời hứa của log 2

Log 2 khép bằng một hẹn: các con số sẽ được chụp lại và đối chiếu — cái nào nhích, cái nào đứng yên. Đến snapshot 2026-09-08, kết quả như sau:

| Con số | Log 2 (2026-09-07) | Snapshot 2026-09-08 | Trạng thái |
| --- | --- | --- | --- |
| Release desktop | v1.4.199 + v1.4.198, cùng ngày 2026-09-05 | re-verify: GIỐNG HỆT | đứng yên |
| Android | mobile-android-v0.0.48 (Pre-release) | GIỐNG HỆT | đứng yên |
| Blog | 10 → 30 bài (kế hoạch) | 25 slug × 2 locale = 50 file | đã hạ cánh |
| Kế hoạch kế tiếp | — | +44 slug → 69 × 2 = 138 trang | công khai trong matrix |

*Nguồn: evidence-pack story FI-359, §Numbers snapshot (rows 2+7), chụp và re-verify 2026-09-08; topic-matrix-batch2.md commit trong repo, lấy 2026-09-08.*

Số liệu kit — skills 20 tổng / 13 public và 24 story-CLI — log 2 [đã chụp kèm lệnh nguồn](/vi/blog/building-wakii-in-the-open-log-2/); lần re-verify 2026-09-08 cho kết quả không đổi, nên log này không tái bản bảng ấy. Còn 138 là kế hoạch công khai nằm trong matrix commit trên repo — một danh sách chủ đề, không phải trạng thái làm việc. Chuỗi log chỉ kể những gì đã khép, hẹn kể tiếp những gì sắp khép — và chuỗi này tiếp tục.

Muốn dựng bộ khung editorial tương tự cho dự án của bạn, trang [getting started](/vi/docs/getting-started/) là điểm khởi đầu: cài kit, mở Superpowers panel, và chạy story đầu tiên của riêng bạn.
