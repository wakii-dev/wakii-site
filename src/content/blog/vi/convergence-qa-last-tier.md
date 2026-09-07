---
title: "Convergence QA — tier cuối hội tụ"
description: "Tier cuối của một story không thêm tính năng — nó chứng minh mọi thứ đã xây vẫn đứng vững. Bài này mổ xẻ một convergence QA thật: lắp trên vùng đóng băng, đo regression theo baseline nhóm tag, và yêu cầu mọi diff phải truy được nguồn."
pubDate: "2026-09-01"
category: "tech"
tags: ["qa", "story-workflow", "workflow"]
draft: false
---

Dự án dài có một nỗi sợ đặc trưng của đoạn cuối: càng gần đích, càng không ai
dám đụng vào. Sửa một chỗ, vỡ mười chỗ khác — và không ai dám cam đoan tính
năng đã chạy ổn định mấy tuần trước vẫn còn chạy. Cách phản ứng quen thuộc là
thêm lệnh cấm: "đừng đụng khu đó", "hỏi anh X trước khi sửa". Workflow của
Wakii chọn hướng ngược lại: thay vì cấm đụng, nó dành riêng tier cuối của mỗi
story cho việc đụng một cách an toàn — một tier không thêm tính năng nào, chỉ
có đúng một nhiệm vụ: chứng minh mọi thứ đã xây không vỡ. Đó là convergence
QA, và bài này đọc nó qua một spec thật.

TL;DR:

- Tier cuối của story là convergence QA: không thêm năng lực mới, chỉ chứng
  minh tổ hợp đã merge vẫn đúng.
- Nó làm việc trên vùng đóng băng: contract của tier trước được niêm
  READ-ONLY, việc mới chỉ lắp lên trên.
- "Không vỡ" đo bằng baseline chụp trước story, diff theo nhóm tag: nhóm phải
  bất biến tách khỏi nhóm được thay đổi.
- Diff ngoài nhóm expected không được nuốt — explained diff phải truy được về
  một thay đổi có chủ đích.
- Vùng đóng băng được kiểm bằng test cũ: spec cũ stay green, không sửa.

## Tier cuối không viết gì mới

Tên "convergence QA" dễ bị đọc thành "bước test cuối" — một lượt chạy thêm cho
đủ thủ tục. Thực chất nó là một loại công việc khác hẳn các tier trước: tier
giữa thêm năng lực — SEO surface, nội dung, hạ tầng — còn tier cuối không thêm
gì cả. Nó lấy tổ hợp đã merge trên nhánh đích và hỏi đúng một câu: khi tất cả
đứng cạnh nhau, cái từng chạy riêng có còn chạy không?

Một convergence story thật trong repo công khai hub-store — spec mang tiêu đề
nguyên văn "SF-11 FE Convergence — Audit viewer + Export UI + Mobile +
Harmonize — Design"
([link](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/specs/2026-09-03-sf11-fe-convergence-design.md))
— định nghĩa tư thế của tier này ngay câu chốt phần problem:

> "Đây là công việc FE lắp ráp + hội tụ trên contracts BE ĐÓNG BĂNG
> (READ-ONLY services/**)."

*Nguồn: [spec SF-11 FE Convergence](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/specs/2026-09-03-sf11-fe-convergence-design.md)
— github.com/wakii-dev/hub-store, lấy 2026-09-07.*

Hai từ làm nên bản chất của tier cuối nằm ngay trong câu đó: "lắp ráp" và
"hội tụ" — và cả hai diễn ra trên "contracts BE ĐÓNG BĂNG". Việc mới của tier
này — audit viewer, nút export, responsive mobile — không được phép định nghĩa
lại thứ gì; nó chỉ lắp lên những phần đã niêm. Spec chốt boundary theo đúng
hướng đó:

> "KHÔNG đổi business logic / API shape / proto / compose / realm JSON
> (services/** READ-ONLY)."

*Nguồn: cùng spec SF-11, mục "Out (boundary)", lấy 2026-09-07.*

Boundary này không phải thủ tục hành chính. Nếu tier cuối được sửa contract,
nó không còn đang chứng minh cái đã xây — nó đang xây thêm, và phép kiểm mất
đối tượng.

## Baseline chụp trước story, regression đo theo nhóm tag

"Chứng minh không vỡ" cần một phép so. So với cái gì? So với kỳ vọng trong
đầu thì kết quả cũng nằm trong đầu. Convergence QA so bằng baseline: một
snapshot trạng thái sản phẩm chụp từ nhánh chính trước khi story bắt đầu, rồi
diff trạng thái sau story trên đúng snapshot đó.

Task list của tier QA trong bracket FI-339 — story đã dựng nên blog bạn đang
đọc — viết yêu cầu này thành task đích danh:

```text
Tasks: baseline-dist-từ-main-trước-story / regression-canonical-hreflang-noindex (landing /+/vi/, download /+vi/, docs sample, 404 — og:*/rss additions là expected diff, chỉ canonical/hreflang/noindex phải bất biến) / …
```

*Nguồn: docs/superpowers/brackets/fi339-blog-features.md, mục SF-3, lấy
2026-09-07.*

Diff toàn site là rất nhiều thay đổi; liệt kê từng dòng thì không ai đọc nổi.
Nên phép so được chia theo nhóm tag — mỗi nhóm một luật riêng:

```ascii
baseline (main, trước story)       dist sau story        luật theo nhóm
────────────────────────────      ─────────────────    ──────────────────
canonical   = A                    canonical   = A      bất biến
hreflang    = B                    hreflang    = B      bất biến
noindex     = C                    noindex     = C      bất biến
(og:* / rss   chưa có)             og:image …  = NEW    expected diff
                                   rss link    = NEW    expected diff
```

*Nguồn: sơ đồ dựng theo task list SF-3 trong bracket FI-339 (trích ở trên),
lấy 2026-09-07.*

Baseline theo nhóm tag biến một câu cảm tính — "không vỡ gì chứ?" — thành hai
câu máy trả lời được: nhóm bất biến có còn giống từng byte không, và mọi thay
đổi còn lại có nằm trong nhóm expected không. Không nhóm nào cần ai "cảm thấy
ổn".

## Explained diff cũng phải giải thích

Nhóm expected diff không có nghĩa là "không cần giải thích". Nó nghĩa là lời
giải thích đã tồn tại trước diff: từng thay đổi phải truy được về một nguồn có
chủ đích — một commit, một task ghi sẵn trong bracket, một quyết định đã ghi
lại. Diff nằm ngoài các nhóm đó không được nuốt; diff thuộc nhóm expected mà
không truy được nguồn cũng không được nuốt.

Case thật từ QA của story FI-339: baseline diff hiện ra một thay đổi chạm toàn
site — domain wakii.dev đổi thành wakii.xyz. Nhìn bằng mắt, đây đúng dạng "sửa
một chỗ vỡ mười chỗ": canonical, og:url, sitemap, RSS đều đổi theo. Nhưng nó
không phải regression — là owner đổi SITE_URL có chủ đích, gọn trong một
commit có tên:

```ascii
diff phát hiện                    verdict      giải thích truy về nguồn
───────────────────────────      ─────────    ─────────────────────────
og:*/rss additions                expected     SF-1 thêm có chủ đích
canonical/hreflang/noindex        bất biến     regression check PASS
domain wakii.dev → wakii.xyz      explained    commit 9d4d460 — owner confirm
```

*Nguồn: evidence-pack story FI-359 §#13 + Linear FI-342 verdict, lấy
2026-09-07.*

Regression là diff không ai nhận nuôi — nó xuất hiện mà không ai gọi nó.
Explained diff là diff có tên tuổi: một commit có chủ đích, một dòng task viết
ra trước khi code tồn tại. Quy ước này đổi luôn tâm lý của review: người
review không sợ diff — diff là nguyên liệu làm việc của QA. Người review sợ
diff mồ côi.

## Vùng đóng băng được đo bằng test cũ

Cách mạnh nhất để chứng minh "chưa đụng vỡ gì" không phải là nhìn — mà là để
chính test của cái cũ phán. Spec SF-11 viết phần E2E theo đúng cấu trúc đó:

> "specs MỚI cho audit-viewer + export (users/dashboard/realtime specs đã có
> từ SF-8/9/10 — chỉ verify xanh); toàn bộ 15 specs hiện hữu stay green
> KHÔNG sửa."

và chốt thẳng vào boundary:

> "KHÔNG sửa specs E2E cũ (kể cả `03-audit.spec.ts` — là i18n-audit, không
> liên quan activity log)."

*Nguồn: cả hai trích từ [spec SF-11](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/specs/2026-09-03-sf11-fe-convergence-design.md),
lấy 2026-09-07.*

Quy tắc "không sửa spec cũ" quan trọng hơn vẻ ngoài của nó: spec cũ chính là
baseline hành vi của vùng đóng băng. Nếu nó fail mà được nới lỏng cho pass,
phép kiểm hội tụ tự triệt tiêu — bạn vừa cho người chứng nghỉ việc đúng lúc
cần người chứng nhất. Vì thế spec cấm đích danh, kể cả file tưởng không liên
quan.

```ascii
specs hiện hữu : stay green, không sửa      ← baseline hành vi của vùng đóng băng
specs mới      : thêm cho audit + export    ← chỉ lắp thêm, không đụng cái cũ
```

*Nguồn: sơ đồ dựng theo phần E2E và Out (boundary) của spec SF-11 (trích ở trên),
lấy 2026-09-07.*

Cơ chế này không phải thói quen của một dự án — docs của workflow chốt thành
luật chung:

> "Tính song song không bao giờ đồng nghĩa lịch sử phân tán; tích hợp diễn ra
> liên tục tại các điểm đã biết."

*Nguồn: src/content/docs/vi/story-workflow.md, mục "5. Tier và một nhánh đích
duy nhất", lấy 2026-09-07.*

Tier cuối là điểm đã biết cuối cùng của story — nơi mọi đường hội tụ trước khi
story được tính là đóng. Cấu trúc bracket và tier đã có bài riêng mổ xẻ
([bracket và tier: bản đồ cho dự án dài](/vi/blog/long-tasks-bracket-tiers/));
bài [done nghĩa là có bằng chứng](/vi/blog/done-means-evidence/) trả lời nửa
còn lại của lần đóng: ai chấm verdict, bằng phép đo nào. Vòng đời đầy đủ —
tier, nhánh đích, gates B0–B5 — nằm trên trang
[story workflow](/vi/docs/story-workflow/).

Nếu đội bạn sắp vào cuối một dự án dài, thử ba quy tắc của tier này: dự trù
một tier chỉ để chứng minh, chụp baseline trước khi ai đó đụng vào, và không
nuốt diff nào không có chủ. Wakii dựng sẵn cấu trúc đó — tải app, mô tả ý
tưởng bằng một dòng, và để tier cuối làm đúng việc của nó.
