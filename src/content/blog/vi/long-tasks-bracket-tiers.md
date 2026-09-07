---
title: "Bracket và tier: bản đồ cho dự án dài"
description: "Dự án dài không chết vì thiếu việc — nó chết vì mất bản đồ. Bài này đặt hai bracket thật cạnh nhau — 3 SF và 28 SF — để thấy cùng một dạng khung: epic ở đỉnh, tier bên dưới, cạnh phụ thuộc nối chúng."
pubDate: "2026-08-27"
category: "tech"
tags: ["story-workflow", "workflow", "linear"]
draft: false
---

Một dự án dài hiếm khi chết vì thiếu việc làm — nó chết vì không ai còn nhớ dự
án đang ở đâu. Phần đã xong nhìn rất khả quan; phần còn lại không ai dám đụng,
vì không rõ nó phụ thuộc vào cái nào, và đụng vào có làm vỡ chỗ khác hay không.
Danh sách task trong issue tracker trả lời được câu "còn gì phải làm", nhưng
không trả lời được câu quan trọng hơn: "cái này bắt đầu được chưa, hay vẫn phải
chờ?". Bracket trong Wakii được dựng để trả lời đúng câu đó: một file duy nhất
chia dự án thành sub-feature, xếp từng sub-feature vào tier, và ghi rõ cạnh phụ
thuộc. Bài này đặt hai bracket thật cạnh nhau — một bracket nhỏ ba SF, một
bracket lớn hai mươi tám SF — để thấy quy mô đổi nhưng dạng khung thì không.

TL;DR:

- Bracket là file bản đồ của dự án dài: epic ở đỉnh, sub-feature (SF) xếp theo
  tier, mỗi SF ghi tier, issue Linear, phụ thuộc và danh sách task.
- Tier trả lời câu "khi nào được bắt đầu": SF chỉ khởi động khi mọi thứ ở tier
  trước đã merge.
- Hai bracket thật được so cạnh nhau: FI-339 — story đã dựng nền cho chính blog
  bạn đang đọc (3 SF, 3 tier) — và fi245-postgres-production của hub-store
  (28 SF, nhiều tier). Cùng dạng khung.
- Mọi tier merge về một nhánh đích duy nhất `story/<epic>-<slug>`, nên chạy
  song song không đồng nghĩa lịch sử git phân tán.

## Bracket là bản đồ dự án dài

Trong Wakii, plan không phải file chết nằm trong thư mục docs. Sau ba bước —
phân tích tác động, spec, plan — kết quả được tháo ra thành bracket: một file
liệt kê toàn bộ sub-feature của story, mỗi sub-feature là một khối vài dòng.
Đọc một khối là biết ngay sub-feature đó là gì, nằm tier nào, đang đợi ai, và
xong đến đâu là được tính là xong.

Đây là khối SF-1 của một bracket thật — bracket FI-339, story đã dựng nền SEO,
bề mặt TOC và mười bài seed cho chính blog bạn đang đọc. Các trường cốt lõi của
một khối SF gồm Tier, linear, What, Depends on và Tasks (trường `What` mô tả
kết quả cuối nên đã lược cho gọn):

```text
## SF-1 SEO surface + TOC + assets
Tier: 0
linear: FI-340
Depends on: —
Tasks: base-og-contract / rss-feed-contract / og-default-asset / …
```

*Nguồn: docs/superpowers/brackets/fi339-blog-features.md, lấy 2026-09-07.*

Từng dòng là một câu trả lời. `Tier: 0` nghĩa là không phải chờ ai — khởi động
ngay khi story bật đèn xanh. `linear: FI-340` nối khối này với issue trên
Linear, nên tiến độ trên tracker và bản đồ không phải hai sự thật riêng biệt.
`Depends on: —` là cạnh rỗng: không ai chặn nó. `Tasks` là checklist đủ chi
tiết để một agent nhận việc và tự chạy đến khi xong.

Điểm quan trọng hơn cả các trường: bracket không phải tài liệu mô tả — nó là
cấu trúc điều phối. Orchestrator đọc bracket, dựng DAG từ các cạnh `Depends
on`, và xếp lịch chạy từ đồ thị đó. Khi có bản đồ, không còn tình trạng phải
hỏi từng người "giờ làm gì tiếp".

## Ba tier trong bracket FI-339

Bracket nhỏ của ví dụ này gồm đúng ba SF, xếp thành ba tier:

```ascii
FI-339 blog features — đích: story/fi339-blog-features

tier 2   SF-3 Convergence QA toàn site   (FI-342)  ← merge cuối, chốt story
              ↑
tier 1   SF-2 Seed content 10 posts      (FI-341)  ← cần bề mặt của SF-1
              ↑
tier 0   SF-1 SEO surface + TOC + assets (FI-340)  ← không phụ thuộc gì
```

*Nguồn: docs/superpowers/brackets/fi339-blog-features.md, lấy 2026-09-07.*

Vì sao xếp thế này mà không phải thế khác? SF-1 là tier 0 vì mọi phần sau đều
cần nó: bài viết cần OG image để chia sẻ lên social ra đúng card, cần RSS để
feed reader subscribe được, cần TOC cho bài dài. SF-2 — gieo mười bài seed trên
hai locale — chỉ có nghĩa khi bề mặt đó đã merge, nên nó là tier 1. SF-3 là QA
toàn site: nó chỉ dồn về một điểm khi mọi thứ còn lại đã ngừng di chuyển, nên
nó đứng tier 2 và phụ thuộc SF-2.

Ba tier là ba điểm merge. SF-1 merge trước; SF-2 bắt đầu sau khi SF-1 đã nằm
trên nhánh đích; SF-3 chờ cả hai. Mỗi SF có agent riêng trong worktree riêng.
Bracket lớn hơn có thể chứa nhiều SF trong cùng một tier để chạy song song —
nhưng không SF nào được bắt đầu trước khi tier bên dưới đã merge.

## So quy mô hai bracket thật

Bracket nhỏ vừa rồi đến từ một story blog. Để kiểm tra dạng khung có giữ nguyên
khi quy mô phóng lên hay không, hãy đặt cạnh nó một bracket từ một dự án
production khác: [bracket fi245-postgres-production](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/fi245-postgres-production.md)
trong repo công khai hub-store — hai mươi tám SF, từ hạ tầng Postgres đến ứng
dụng mobile. Hai mốc đầu của nó, trích nguyên văn:

```text
## SF-1 Postgres infra + seed pipeline
Tier: 0
linear: FI-246
Depends on: —
Tasks: compose-postgres / initdb-2-databases / healthcheck-wiring / …

## SF-2 Orders Java → Postgres
Tier: 1
Depends on: SF-1
```

*Nguồn: raw.githubusercontent.com/wakii-dev/hub-store —
docs/superpowers/brackets/fi245-postgres-production.md, lấy 2026-09-07. Dòng
`Tasks` đầy đủ của SF-1 gồm 12 task, từ dựng container Postgres hai database
đến healthcheck và seed pipeline.*

Vẽ hai bracket cạnh nhau theo cùng một khung:

```ascii
        FI-339 blog features              fi245-postgres-production
        (bracket nhỏ)                     (bracket lớn)
        3 SF · 3 tier                     28 SF · nhiều tier

epic ►  blog features                     postgres production
                                              ▲
        tier 2  SF-3 QA convergence       …
        tier 1  SF-2 seed 10 posts        tier 1  SF-2 Orders Java → Postgres
        tier 0  SF-1 SEO surface + TOC    tier 0  SF-1 Postgres infra + seed

        cùng khung: epic ở đỉnh, SF xếp tier, cạnh "Depends on" nối SF
        khác quy mô: 3 dòng so với 28 dòng — số tier và số cạnh tăng theo
```

Đọc theo hàng ngang: cùng dạng khung — epic ở đỉnh, SF xếp theo tier, cạnh phụ
thuộc nối SF này sang SF kia. Đọc theo cột: khác quy mô — ba dòng so với hai
mươi tám dòng, ba tier so với nhiều tier hơn. Và một chi tiết đáng chú ý: SF-1
của cả hai bracket đều là tier 0, đều có `Depends on: —`, và đều là hạ tầng
nền — vì ở mọi quy mô, thứ không phải chờ ai luôn là thứ phải làm trước.

Đó là điểm mấu chốt: bracket không có "chế độ nhỏ" và "chế độ lớn". Cùng một
bộ trường, cùng luật tier, cùng một dạng nhánh đích. Dự án phóng to thì bản đồ
thêm dòng và thêm tier — chứ không đổi hình.

## Tier là luật merge, không phải lời khuyên

Tier dễ bị đọc thành gợi ý sắp lịch: "nên làm sau". Trong workflow, nó là điều
kiện bắt đầu, viết thành luật trong docs — trích nguyên văn:

> "một sub-feature chỉ bắt đầu khi mọi thứ ở tier trước đã merge"

Và điểm đến của mỗi lần merge không phải "nhánh của mỗi người" — docs gọi tên
trực tiếp:

> "nhánh đích duy nhất — `story/<epic>-<slug>`"

*Nguồn: src/content/docs/vi/story-workflow.md, mục "5. Tier và một nhánh đích
duy nhất", lấy 2026-09-07.*

Hai câu này biến tier thành luật có máy kiểm. SF ở tier 1 không "nên" đợi SF
tier 0 — nó không thể bắt đầu, vì pipeline chỉ mở tier tiếp theo khi tier trước
đã merge vào nhánh đích. Song song vì thế không biến thành các lịch sử git phân
tán rồi phải thống nhất khổ sở về sau: tích hợp diễn ra liên tục, tại các điểm
đã biết từ lúc bracket được viết.

Cả vòng đời — từ lúc bracket chốt đến lúc PR mở — được kể lại trên một tính
năng sống trong bài [story workflow: từ ý tưởng đến release](/vi/blog/story-workflow-idea-to-release/).

Tier, nhánh đích và các gate B0–B5 chốt chất lượng đều được tài liệu hóa trong
trang [story workflow](/vi/docs/story-workflow/) — đó là nguồn chuẩn khi bracket
của dự án bạn khác các ví dụ trong bài.

Muốn tự vẽ bản đồ cho dự án dài của mình: mở Wakii, mô tả ý tưởng bằng một
dòng, và đọc bracket trước khi dòng code đầu tiên được viết.
