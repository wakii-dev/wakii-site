---
title: "CI gates: chất lượng tự kiểm trước gate người"
description: "Trước khi một gate người nhìn vào bất cứ thứ gì, chuỗi gate máy đã tự chạy: bài này đọc hai chuỗi thật — build chain của chính site này và pipeline release của product — cùng một chỗ workflow từ chối hứa hẹn: deploy chỉ chạy khi điều kiện đủ, không thì no-op."
pubDate: "2026-09-29"
category: "tech"
tags: ["architecture", "qa", "workflow"]
draft: false
---

Quy trình story của Wakii được kể nhiều về các gate người — những điểm dừng độc lập trước khi một việc được tính xong. Ít được kể hơn là tầng nằm dưới các gate đó: gate máy, tự chạy, tự loại, không cần ai nhớ gọi. Bài này đọc tầng đó trực tiếp từ file, trên hai repo: build chain của chính site bạn đang đọc, và pipeline cut release của product. Bài cũng chỉ một chỗ hiếm gặp trong file CI — nơi workflow ghi rõ điều nó không làm, thay vì để người đọc tự đoán.

TL;DR:

- Build chain của site ghép bốn gate trong một dòng lệnh: parity → blog-utils → content lint → astro build; một mắt xích đỏ là cả chuỗi đỏ.
- CI của site có đúng một job — "Build & check" — chạy lại đúng chuỗi đó trên mỗi push main và mỗi pull request.
- Ở product, pipeline cut release là chuỗi job nối bằng `needs`: gates chặn chạy trước, artifact build sau, publish cuối, E2E dispatch ngay sau publish.
- Deploy không được hứa hẹn: workflow deploy ghi rõ điều kiện secret, chưa đủ thì no-op — production là hành động có chủ ý của con người.

## Một dòng lệnh, bốn gate

Toàn bộ chuỗi chất lượng của site nằm gọn trong một dòng `build` của `package.json`:

```json
"build": "node scripts/check-blog-slug-parity.mjs && node scripts/check-blog-utils.mjs && node scripts/check-blog-content.mjs && astro build",
```

*Nguồn: `package.json`, repo công khai `wakii-dev/wakii-site`, lấy 2026-09-08.*

Bốn mắt xích, mỗi cái chắn một loại lỗi: parity gate kiểm mỗi bài có đủ cặp locale VI+EN — thiếu nửa cặp là đỏ; blog-utils kiểm các tiện ích blog còn khớp với nội dung thật; content lint kiểm band từ, frontmatter, và các cụm từ cấm trong claims registry; `astro build` — mắt xích đắt nhất — chỉ chạy khi cả ba cái trên xanh. Thứ tự không phải trang trí: rẻ nhất chạy trước, đắt nhất chạy sau, để một bài gõ sai frontmatter không phải chờ cả site dựng xong mới bị đuổi. Bài [case study: chính blog này là một story](/vi/blog/blog-story-case-study/) đã mổ từng lớp gate nằm ở đâu trong code.

Một điểm đáng chú ý: chuỗi này không phải di sản bất biến. Nó lớn lên khi có gate mới đáng chắn — tại thời điểm viết là bốn mắt xích, trong khi các bài batch-1 từng trích ba. Bài viết bạn đang đọc cũng phải qua đúng cửa này trước khi được tính.

## CI chạy lại đúng chuỗi đó, trên máy khác

File workflow của site — `.github/workflows/ci.yml` — mỏng đến mức trích gần hết cũng không tốn mấy dòng:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    name: Build & check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Build site
        run: pnpm build
```

*Nguồn: `.github/workflows/ci.yml`, repo `wakii-site`, lấy 2026-09-08.*

Cấu trúc đáng nói vì nó mỏng: một job duy nhất, không có bước test riêng, không có chuẩn chất lượng nào được định nghĩa trong YAML — CI chỉ chạy lại đúng `pnpm build`, tức chuỗi bốn gate của repo, trên một máy sạch với lockfile đóng băng. Chuẩn nằm ở repo, CI chỉ là nó được chạy lại nơi không có cache và không có lý do địa phương để tha thứ.

Một chi tiết trong file kể chuyện gate người đã bắt được gì:

```yaml
          # ≥22.18 — check-blog-utils.mjs imports src/utils/blog.ts and node
          # strips TS types natively only from 22.18 (23.6 unflagged). Pin 20
          # failed with ERR_UNKNOWN_FILE_EXTENSION (SF-1 FI-355 review P0).
          node-version: 22
```

*Nguồn: `.github/workflows/ci.yml`, lấy 2026-09-08.*

Comment này là biên bản của một lỗi đã bị chặn: từng có một bản pin Node 20 làm chuỗi kiểm gãy với lỗi extension lạ, review độc lập bắt được, và giờ lý do nằm ngay tại dòng cấu hình — để không ai "dọn dẹp" nó về phiên bản gọn hơn rồi làm gãy lại. Gate máy giữ chuẩn; comment giữ lý do của chuẩn.

## Ở product: một release là một chuỗi job có thứ tự

Workflow cut release của product lớn hơn đáng kể: file `release-cut.yml` dài hơn 2.200 dòng, và độ dài đó không phải rườm rà — nó là các job nối nhau bằng `needs`, mỗi job một cổng:

```ascii
cut ──► create-release
  ├──► terminal-rendering-golden ───────────┐
  ├──► skill-sharing-release-gate ──────────┼──► release-preflight
  └──► skill-sharing-linux-floor-release-gate ──────┘           │
                                                build + build-mac
                                                       │
                                                publish-release
                                                       │
                                    post-release-e2e · docs · homebrew
```

*Nguồn: `.github/workflows/release-cut.yml` (product repo), các cạnh `needs:` của từng job, lấy 2026-09-08.*

Đọc theo `needs`: ba job gate — golden rendering và hai release gate — phải success thì `release-preflight` mới được chạy; chính job này in dòng chốt trước khi artifact được dựng:

> All blocking release gates passed; artifact builds may start.

*Nguồn: `.github/workflows/release-cut.yml`, step "Confirm blocking release gates passed" trong job `release-preflight`, lấy 2026-09-08.*

Chỉ sau preflight, `build` và `build-mac` mới dựng artifact, và `publish-release` mới đứng sau chúng trong chuỗi. Hai chi tiết cho thấy pipeline được thiết kế fail-closed. Một: comment ngay trên `release-preflight` viết — "failure cannot create signing requests that can never be published" — cổng chặn phải đứng trước chỗ phát sinh yêu cầu ký, không phải sau. Hai: registry verify-shipped gắn nhãn SHIPPED cho computer-use native kèm commit `787766bfcf` với nội dung "CI full chain with computer-use, DMG to release" — chính chuỗi kiểu này là thứ đưa DMG đến release, không phải thao tác tay lúc cuối.

Còn một tầng nữa nằm sau publish: job `post-release-e2e` dispatch lại bộ E2E theo đúng tag vừa phát hành. Release xong không phải điểm cuối của việc kiểm — nó là đầu vào của một lượt kiểm khác.

## Chỗ workflow từ chối hứa hẹn

Workflow deploy của site mở đầu bằng một comment hiếm thấy trong file CI:

> Production deploy on push to main. Requires the repo secret VERCEL_TOKEN (create at https://vercel.com/account/settings/tokens with scope to the wakii-site project). Until the secret is set, the job no-ops cleanly.

*Nguồn: `.github/workflows/deploy.yml`, repo `wakii-site`, lấy 2026-09-08.*

Và file giữ đúng lời đó: step đầu kiểm tra secret, chưa có thì ghi `enabled=false`, còn mọi step sau — cài CLI, pull environment, build, deploy — đều bọc trong điều kiện `if: steps.check.outputs.enabled == 'true'`. Vì thế bài này không thể nói "CI tự deploy production", và cũng không cần: điều file chứng minh là trung thực ngược chiều — workflow ghi rõ điều kiện của nó, và khi điều kiện chưa đủ, nó bỏ qua theo đúng nghĩa được định nghĩa sẵn trong file. Production, tại thời điểm viết, là hành động chủ ý của con người; ranh giới giữa máy và người nằm thẳng trong YAML thay vì trong đầu ai đó.

## Xếp lớp: máy trước, người sau

Đặt hai repo cạnh nhau, hình dạng chung hiện ra:

```ascii
commit ──► CI gates (máy tự chạy)
              │   parity · lint · build · release gates
              ▼
        build xanh / artifact sẵn sàng
              │
              ▼
        story gates B0–B5 (người + verifier độc lập)
              │
              ▼
        Done — release notes ghi lại điều đó
```

*Nguồn: sơ đồ tổng hợp từ `package.json`, `ci.yml`, `release-cut.yml` và release notes v1.4.198, lấy 2026-09-08.*

Tầng người của hệ thống này đã có bài [gates, not trust — và Rule 0](/vi/blog/gates-not-trust-rule-zero/) đi từng cổng B0–B5 và từng verdict; ở đây chỉ cần một trích từ chính release notes v1.4.198, section "Quality gates" — chỗ bản release tự khai tầng nào đã chốt nó:

> Every sub-feature cleared the six story gates: B0 browser walkthrough · B1 code + tests · B2 plan ticked · B3 independent review · B4 merged · B5 issue done. Verdict from an independent verifier — self-reports don't count.

*Nguồn: `gh release view v1.4.198 --repo wakii-dev/wakii`, lấy 2026-09-08.*

Khi một bản release nói "đã qua gates", câu đó đứng trên hai tầng bằng chứng: chuỗi CI đã xanh, và verifier độc lập đã chốt. Hai tầng bắt hai loại lỗi khác nhau — máy bắt cái sai về cấu trúc: chuỗi build gãy, gate chặn, manifest lệch; người bắt cái sai về ý định: tính năng dựng đúng cách nhưng không phải cái cần dựng. Thiếu tầng dưới, tầng trên chất review trên nguyên liệu chưa dựng nổi; thiếu tầng trên, tầng dưới chỉ chứng minh code chạy, không chứng minh nó đúng việc.

Full quy trình từ idea đến release — gồm chỗ CI dừng và chỗ gates người tiếp — nằm trong docs [story workflow](/vi/docs/story-workflow/). Muốn thấy tầng máy vận hành trước mắt: mở một pull request vào repo này, và đọc CI nói trước khi bất kỳ ai kịp bình luận.
