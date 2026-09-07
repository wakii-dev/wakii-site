---
title: "Xây Wakii công khai — log 2"
description: "Log thứ hai của chuỗi xây Wakii công khai: blog lớn từ 10 lên 30 bài qua hai story chạy chung một parity gate, cùng bảng số liệu tại ngày viết — release, skill, story CLI — mỗi con số kèm nguồn để bạn tự chạy lại."
pubDate: "2026-09-07"
category: "build-log"
tags: ["build-log", "wakii", "release"]
draft: false
---

Log #1 kết thúc bằng lời hứa: chuỗi này tiếp tục. Log thứ hai giữ lời đó theo đúng tinh thần của chuỗi: kể cái đang chạy, và gắn mỗi con số vào một lệnh bạn tự chạy lại được. Lần này không kể tính năng mới. Lần này kể các con số của chính story đang viết blog này, một dự án production chạy cùng quy trình ở một repo khác, và bảng số liệu chụp tại ngày viết.

TL;DR:

- Blog đang lớn từ 10 lên 30 bài: 5 slug seed × 2 locale, cộng thêm 20 slug mới × 2 locale từ story đang chạy.
- Hai story blog (FI-339 và FI-359) chảy qua cùng một chuỗi build: parity gate → content lint → astro build; thiếu một nửa cặp locale là build đỏ.
- Quy trình này không chỉ dựng site marketing: hub-store, một nền tảng chạy production, đi qua nó với 7 bracket / 74 SF, artifact công khai trên GitHub.
- Bảng số liệu tại ngày viết: release, skill, story CLI — mỗi dòng kèm lệnh nguồn và ngày chạy.

## Blog 10 → 30

Khi log #1 đăng, blog này có 10 bài: 5 slug × 2 locale — bộ seed gồm chính [log đầu tiên](/vi/blog/building-wakii-in-the-open-log-1/), bài review agents trên phone, bài story workflow từ idea đến release, bài decision gates, và bài fork IDE giữ upstream. Đó là sản phẩm của story FI-341. Story đang chạy lúc bạn đọc những dòng này — FI-359 — viết thêm 20 slug mới × 2 locale: 40 file, đưa blog lên 30 bài khi story khép. Tại thời điểm viết, các bài chưa hạ cánh một lượt: chúng hạ cánh theo sub-feature, mỗi cặp VI+EN một commit, số slug trên nhánh nhích từng bước từ 5 xuất phát đến 25 đích đến.

```ascii
seed (FI-341)     5 slug  × 2 locale = 10 posts
story FI-359     20 slug  × 2 locale = 40 file
khi story khép   25 slug, tính theo bài  = 30 posts (10 + 20)
```

*Nguồn: evidence-pack story FI-359, §Numbers snapshot (rows 5 + 7), lấy 2026-09-07.*

Con số 30 không phải mục tiêu trang trí. Nó là điều kiện của matrix: 20 chủ đề đã khóa slug, ngày đăng, category từ trước khi dòng đầu được viết, và parity gate bạn gặp ở mục kế tiếp không cho phép một nửa cặp tồn tại trên nhánh.

## Hai story blog, một parity gate

Blog này đã qua hai story: FI-339 dựng bộ 10 seed cùng bề mặt SEO (OG card, RSS, TOC cho bài dài), FI-359 — story hiện tại — viết 20 bài longform. Hai story khác phạm vi nhưng chảy qua đúng một chuỗi build. Dòng `build` trong `package.json` của repo:

```json
"build": "node scripts/check-blog-slug-parity.mjs && node scripts/check-blog-content.mjs && astro build",
```

*Nguồn: package.json, repo công khai wakii-dev/wakii-site, lấy 2026-09-07.*

Đọc chuỗi theo thứ tự chạy: parity gate kiểm slug EN và slug VI khớp 1:1 từng bài; content lint kiểm band từ, frontmatter và các cụm từ cấm; chỉ khi cả hai xanh, `astro build` mới được chạy. Nghĩa là một commit thiếu nửa cặp locale, hoặc một bài sai frontmatter, sẽ làm build đỏ — không có cơ chế "đăng trước, sửa sau". Cả 10 bài seed lẫn từng cặp bài mới của story hiện tại đều qua đúng cửa này. Bài [case study: chính blog này là một story](/vi/blog/blog-story-case-study/) đã mổ chi tiết cái máy này — đọc nó nếu muốn thấy từng lớp gate nằm ở đâu trong code.

## Dự án thật, artifact công khai

Một câu hỏi công bằng cho bất kỳ công cụ dev nào: nó có chạy ngoài demo không? Với Wakii, câu trả lời đọc được từ một repo khác. hub-store — nền tảng vận hành kho chạy production — được dựng bằng cùng story workflow, và toàn bộ dấu vết quy trình nằm công khai trên GitHub. Dự án đi qua 7 bracket, cộng lại 74 sub-feature:

| Bracket | SF |
| --- | --- |
| ict-service-support-rebuild | 7 |
| fi233-polyglot-grpc-mf | 11 |
| fi245-postgres-production | 28 |
| fi272-minikube-deploy | 5 |
| fi280-qa-hub-store-regression | 8 |
| fi326-api-docs-swagger | 9 |
| fi338-dispatch-queue (đang chạy) | 6 |

*Nguồn: các bracket công khai trên GitHub main `wakii-dev/hub-store`; riêng hàng fi338 lấy từ evidence-pack story FI-359, lấy 2026-09-07.*

7 + 11 + 28 + 5 + 8 + 9 + 6 = 74 — phép cộng bạn tự làm lại được. Điều đáng nói trong log này không phải con số 74, mà là chỗ các con số nằm: bracket, spec, plan nằm cạnh code, trong repo công khai. Quy trình viết những dòng này cũng là quy trình dựng một hệ thống kho thật. Bài [Wakii in production: hub-store](/vi/blog/wakii-in-production-hub-store/) đi hết hành trình 7 bracket đó, mỗi link GitHub kèm trích dẫn nguyên văn để tự đối chiếu.

## Số liệu tại ngày viết

Luật của bài này: con số phải đi kèm nguồn và ngày — đừng tin số nhớ. Dưới đây là lần re-extract tại lúc viết:

```bash
$ gh release list --repo wakii-dev/wakii --limit 6
Wakii 1.4.199	Latest	v1.4.199	2026-09-05T19:07:31Z
Wakii 1.4.198		v1.4.198	2026-09-05T12:47:15Z
Orca Mobile Android mobile-android-v0.0.48	Pre-release	mobile-android-v0.0.48	2026-09-05T13:00:31Z
```

*Nguồn: gh release list, chạy 2026-09-07.*

Hai bản desktop 1.4.198 và 1.4.199 ra cùng ngày 05-09-2026, kèm bản dựng Android ở tag `mobile-android-v0.0.48` (Pre-release) cũng trong ngày đó. Đây là case đã kiểm bằng lệnh trên; log không suy diễn nhịp phát hành từ một ngày duy nhất.

Sang số liệu của kit, hai lệnh grep đếm trực tiếp trên file nguồn:

```bash
$ grep -c "id: '" src/data/skills.ts
20
$ grep -A6 "id: '" src/data/skills.ts | grep -c "public: true"
13
$ ls ~/.claude/bin | grep '^story-' | wc -l
25
$ ls ~/.claude/bin | grep '^story-' | grep -v '\.html' | wc -l
24
```

*Nguồn: grep trên `src/data/skills.ts` của repo này và `ls ~/.claude/bin` trên máy viết, chạy 2026-09-07.*

Giải thích cặp lệnh cuối: `grep '^story-'` trả 25 match, nhưng một file trong đó là `story-dashboard.html` — trang tài liệu, không phải CLI. Lệnh có bước lọc `.html` là lệnh trung thực: 24 executable. Gom lại thành bảng:

| Số liệu | Giá trị tại 2026-09-07 | Nguồn |
| --- | --- | --- |
| Release mới nhất | v1.4.199 — Latest | `gh release list` |
| Release kề trước | v1.4.198 — cùng ngày 2026-09-05 | `gh release list` |
| Android | mobile-android-v0.0.48 — Pre-release | `gh release list` |
| Skills | 20 tổng / 13 public | `grep src/data/skills.ts` |
| story-* CLI | 24 (25 match − 1 file .html) | `ls ~/.claude/bin` |
| Blog | 10 → 30 posts khi story khép | evidence-pack D8, rows 5+7 |

*Nguồn: các lệnh nêu trong bảng, chạy 2026-09-07; hàng blog lấy từ evidence-pack story FI-359.*

## Log kế tiếp

Phần còn lại của story: QA quét toàn site, hội tụ, và story khép bằng một PR duy nhất — cùng hình dạng với story blog trước. Chuỗi log tiếp tục sau đó; các con số trong log này sẽ được chụp lại và đối chiếu — cái nào nhích, cái nào đứng yên.

```ascii
20 cặp bài        →  QA quét toàn site  →  một PR
(đang hạ cánh)       (convergence)         (story FI-359 khép)
```

*Nguồn: spec story FI-359 (`docs/superpowers/specs/2026-09-07-blog-longform-20-posts-spec.md`), lấy 2026-09-07.*

Muốn quy trình tương tự cho dự án của bạn, trang [getting started](/vi/docs/getting-started/) là điểm khởi đầu: cài kit, mở Superpowers panel, chạy story đầu tiên.
