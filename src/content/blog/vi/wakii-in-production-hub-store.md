---
title: "Wakii in production: hub-store"
description: "hub-store — nền tảng vận hành kho — được dựng bằng story workflow của Wakii, và toàn bộ dấu vết quy trình (bracket, spec, plan) nằm công khai trên GitHub. Bài này đi qua hành trình 7 bracket của dự án, mỗi link GitHub kèm trích dẫn nguyên văn để bạn tự đối chiếu với file thật."
pubDate: "2026-09-04"
category: "build-log"
tags: ["build-log", "story-workflow", "evidence"]
draft: false
---

Mọi bài giới thiệu công cụ lập trình đều có một câu quen thuộc: "chúng tôi dùng
nó trong production". Câu đó gần như không bao giờ kiểm được — dự án nào, quy
trình chạy ra sao, artifact nào chứng minh? Bài này chọn hướng ngược lại, với
hub-store — một nền tảng vận hành kho đang chạy thật, được dựng bằng story
workflow của Wakii. Toàn bộ dấu vết quy trình của dự án — bracket, spec, plan —
nằm công khai trên GitHub, trong repo `wakii-dev/hub-store`. Bạn không phải tin
lời ai: mở từng link, đọc đúng đoạn được trích nguyên văn trong bài, tự kết
luận. Một ghi chú trung thực: bài ký ngày 04-09 theo lịch đăng, còn các trích
dẫn và lệnh kiểm dưới đây được thực hiện ngày 07-09 khi bài được viết. Bài đi
qua bốn chặn: dự án là gì, hành trình qua các bracket, quy mô đọc được từ
artifact, và vì sao kiểu dẫn chứng này chịu được thời gian.

TL;DR:

- hub-store là platform vận hành kho: React microfrontends (Module Federation),
  BFF Fastify, gRPC polyglot Java/Go/Python, Postgres/Kafka/Keycloak — trong
  một monorepo Turborepo.
- 7 bracket trong lịch sử dự án cộng lại 74 sub-feature (SF) — con số đếm thẳng
  từ các file công khai, không phải lời kể.
- Mỗi link GitHub trong bài kèm trích dẫn nguyên văn, lấy 2026-09-07: file đổi
  thì lệch thấy ngay.
- Bracket bị hủy không bị xoá — nó thành audit trail ngay trong repo.

## hub-store là gì

hub-store là một nền tảng vận hành kho (warehouse operations) chạy production.
Kiến trúc chia tầng rõ: giao diện ghép từ các React microfrontends dùng Module
Federation; phía sau là một BFF viết bằng Fastify; các dịch vụ nghiệp vụ nói
gRPC với nhau bằng ba ngôn ngữ — Java, Go, Python; dữ liệu nằm trên Postgres,
sự kiện chạy qua Kafka, đăng nhập và phân quyền qua Keycloak. Toàn bộ source
nằm trong một monorepo Turborepo. Vẽ lại thành sơ đồ:

```ascii
React microfrontends (Module Federation)
        │
        ▼
   BFF · Fastify
        │   gRPC — polyglot
   ┌────┼─────┐
   ▼    ▼     ▼
 Java   Go  Python
   │    │     │
   └────┼─────┘
        ▼
Postgres · Kafka · Keycloak

toàn bộ source nằm trong một monorepo Turborepo
```

*Nguồn: evidence-pack story FI-359 (digest hub-store, đối chiếu repo công
khai), lấy 2026-09-07.*

Điều đáng chú ý không phải từng mảnh công nghệ — mỗi mảnh đều phổ biến. Điều
đáng chú ý là cách dự án được dựng: không phải một commit lớn duy nhất, mà qua
7 story, mỗi story có bracket riêng, SF chia tier, gate review độc lập — và mọi
bracket nằm trong repo, nằm cạnh code chứ không trong công cụ riêng tư.

## Hành trình qua các bracket

Trong story workflow, bracket là file khai sinh mỗi story: epic, các
sub-feature (SF) chia theo tier, ranh giới, và điều kiện hoàn thành. hub-store
có 7 bracket dưới `docs/superpowers/brackets/`; sáu file nằm trên GitHub main,
bracket của story đang chạy thì chưa. Đi lần lượt theo dãy số Linear — mỗi link
kèm nguyên văn một đoạn trong file, lấy 2026-09-07:

1. [brackets/ict-service-support-rebuild.md](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/ict-service-support-rebuild.md)
   — story đầu tiên của dự án bị hủy rồi gộp vào story sau. File không bị xoá;
   nó được đánh dấu thẳng:
   "File này chỉ còn là audit trail (Linear FI-232 Canceled)".
   Đây là luật "đánh dấu, không xoá": quyết định đã xảy ra thì để lại vết
   trong repo, kể cả quyết định hủy.

2. [brackets/fi233-polyglot-grpc-mf.md](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/fi233-polyglot-grpc-mf.md)
   — story dựng nền frontend cùng các spike công nghệ. Dòng SF đầu đọc
   "SF-1 FE Foundation + Spikes", kèm rang buộc
   "KHÔNG SF UI start trước verdict SPIKE 1-3" —
   spike-first: chưa có verdict từ các spike thì không SF UI nào được khởi động.

3. [brackets/fi245-postgres-production.md](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/fi245-postgres-production.md)
   — story hạ nền tảng dữ liệu, dày nhất dự án với 28 SF. Dòng SF-1 đọc
   "SF-1 Postgres infra + seed pipeline" —
   hạ tầng và dữ liệu seed trước, dịch vụ nghiệp vụ dịch chuyển sau.

4. [brackets/fi272-minikube-deploy.md](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/fi272-minikube-deploy.md)
   — story lên Kubernetes qua minikube, 5 SF. Dòng SF-1 đọc
   "SF-1 K8s platform foundation + Postgres + Kafka" —
   nền tảng K8s cùng Postgres và Kafka trước, ứng dụng deploy sau.

5. [brackets/fi280-qa-hub-store-regression.md](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/fi280-qa-hub-store-regression.md)
   — story QA regression, tier 0 của mảng chất lượng:
   "Boot-verify full stack main @ d107f2f 7/7 ports; chạy 25 e2e specs baseline đỏ/xanh".
   Mảnh dẫn chứng đắt giá vì quá cụ thể: commit `d107f2f`, 7 trên 7 port, 25
   e2e spec.

6. Story đang chạy là fi338-dispatch-queue. Bracket của nó là file local, chưa
   lên GitHub main — nên bài này không link bracket, mà link spec design đã có
   trên main:
   [specs/2026-09-07-dispatch-queue-design.md](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/specs/2026-09-07-dispatch-queue-design.md),
   với dòng "SF-1 Data & contract foundation" — nền dữ liệu và contract đi
   trước: migration V15 thêm recipient/read_at vào bảng notification_log,
   permission keys `dispatch.view/assign`.

Timeline vẽ lại từ danh sách trên:

```ascii
bracket                         câu chuyện                 SF
──────────────────────────────────────────────────────────────
ict-service-support-rebuild     canceled → audit trail      7
fi233-polyglot-grpc-mf          FE foundation + spikes     11
fi245-postgres-production       data platform              28
fi272-minikube-deploy           K8s trên minikube           5
fi280-qa-hub-store-regression   QA baseline tier 0          8
fi326-api-docs-swagger          OpenAPI + drift-guard       9
fi338-dispatch-queue            đang chạy                   6
                                                    ────────
                                                    74 SF
```

*Nguồn: 6 bracket + 1 spec trên GitHub main `wakii-dev/hub-store`, lấy
2026-09-07.*

## Quy mô đọc được từ artifact

Quy mô dự án không cần tin lời — đếm từ chính các file. Bảng dưới đếm SF trong
từng bracket:

| Bracket | SF |
| --- | --- |
| ict-service-support-rebuild (FI-232) | 7 |
| fi233-polyglot-grpc-mf (FI-233) | 11 |
| fi245-postgres-production (FI-245) | 28 |
| fi272-minikube-deploy (FI-272) | 5 |
| fi280-qa-hub-store-regression (FI-280) | 8 |
| fi326-api-docs-swagger (FI-326) | 9 |
| fi338-dispatch-queue (FI-338, đang chạy) | 6 |

*Nguồn: evidence-pack FI-359 (D3), đối chiếu GitHub main, lấy 2026-09-07.*

Cộng lại: 7+11+28+5+8+9+6 = 74 SF — phép cộng đơn giản, bạn tự làm lại được.
Bracket duy nhất chưa xuất hiện ở mục trước là fi326, và nó viết theo đúng khuôn
mẫu:
[brackets/fi326-api-docs-swagger.md](https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/fi326-api-docs-swagger.md)
mở đầu bằng "SF-1 Foundation — toolchain, root spec, drift-guard, Swagger UI" —
drift-guard chạy vitest, chặn việc thêm hoặc xoá route mà không sửa spec.

Điều kiện để những dẫn chứng trên có nghĩa: repo phải công khai thật. Lệnh kiểm
tra, chạy 2026-09-07:

```bash
$ gh repo view wakii-dev/hub-store --json isPrivate,name,owner
{"isPrivate":false,"name":"hub-store","owner":{"id":"U_kgDOE2KJqw","login":"wakii-dev"}}
```

*Nguồn: gh repo view, chạy 2026-09-07.*

Trên main, tại thời điểm viết, `docs/superpowers/` chứa 32 file spec và 53 file
plan — mỗi story để lại nhiều lớp giấy tờ: bracket, spec, plan — tất cả nằm
cạnh code.

*Nguồn: GitHub API contents/docs/superpowers/specs và /plans, đếm 2026-09-07.*

## Vì sao đây là dẫn chứng thật

Điểm yếu cố hữu của link dẫn chứng: link chết, hoặc file bị sửa sau khi bài
đăng — người đọc mất cách kiểm. Cách chống trong bài này: mỗi link GitHub đều
mang theo trích dẫn nguyên văn ngay trong bài. Bạn mở file trên GitHub và diff
bằng mắt: khớp — lời bài viết đúng; lệch — file đã đổi sau khi viết, và chính
sự lệch đó là thông tin. Không có chỗ nào trong bài bắt bạn tin một "nguồn tin
cậy": từng khẳng định đi kèm một artifact bạn tự mở được trong vài giây.

```ascii
bài viết ── link ──► file trên GitHub main
   │                      │
   └─ trích nguyên văn    │
          trong bài       │
              └──── diff ─┘
        khớp = lời đúng · lệch = file đã đổi
```

*Nguồn: cấu trúc của chính bài này — 7 link GitHub, 7 trích dẫn nguyên văn,
2026-09-07.*

Trên blog này, hai bài đi cùng góc nhìn: [case study: chính blog này là một
story](/vi/blog/blog-story-case-study/) mổ chính blog bằng đúng phương pháp dẫn
chứng, còn [story workflow: từ idea đến release](/vi/blog/story-workflow-idea-to-release/)
kể tổng quan quy trình từ đầu. Chi tiết đầy đủ của quy trình — bracket, tier,
gate, watchdog — nằm trong trang [story workflow](/vi/docs/story-workflow/).

Wakii là IDE agentic với đội superpowers dựng sẵn. Nếu bạn muốn quy trình tương
tự cho dự án của mình: tải Wakii, chạy story đầu tiên — rồi mở repo hub-store
xem một dự án production đi qua quy trình đó trông ra sao.
