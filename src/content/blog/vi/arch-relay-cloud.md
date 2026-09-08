---
title: "Kiến trúc relay cloud: tín hiệu giữa các máy"
description: "Bài mổ kiến trúc relay cloud của Wakii qua chính code công khai: vì sao điện thoại và desktop không bao giờ nối thẳng, splice state machine ghép hai phiên ra sao, và admission budget cùng close code giữ một cell không sập âm thầm."
pubDate: "2026-09-25"
category: "tech"
tags: ["architecture", "agents"]
draft: false
---

Khi bạn mở app Wakii trên điện thoại để theo dõi một agent đang chạy ở máy nhà, tín hiệu của bạn không bay thẳng từ điện thoại tới desktop. Giữa hai máy là một relay cloud: một tầng server nhận kết nối từ cả hai phía rồi ghép chúng lại với nhau. Điều đáng nói không phải việc có trung gian, mà cách trung gian đó được thiết kế. Cả điện thoại lẫn desktop đều chỉ dial ra ngoài, không bên nào mở port cho bên nào chạm vào. Bài này đi qua relay đó bằng chính code công khai trong repo `wakii-dev/wakii`: từ handshake, máy trạng thái splice, tới admission budget và các workflow vận hành.

TL;DR:

- Điện thoại và desktop không bao giờ nối thẳng: mỗi bên mở đúng một kết nối outbound tới một relay cell; không cần mở port inbound, không cần đi xuyên NAT.
- Desktop host phải chứng minh danh tính bằng một challenge có chữ ký trước khi cell ghép phiên; máy trạng thái splice chín trạng thái chặn việc xác nhận một splice "giả".
- Giới hạn tài nguyên nằm trong contract công khai: hard cap kết nối mỗi cell, băng water-mark cho splice, và sáu close code thay cho việc ngắt kết nối im lặng.
- Vận hành tách vai rõ: một image duy nhất chạy cả director lẫn cell, fence broker giữ độc quyền mutation hạ tầng, và các workflow GitHub mặc định tắt trên repo public.

## Vì sao không nối thẳng

Một desktop sau router gia đình và một điện thoại trên 4G đều đứng sau NAT. Nối thẳng hai máy nghĩa là hole-punching, mở port, hoặc VPN — mỗi cái một nỗi đau vận hành riêng. Relay chọn đường khác: cả hai phía chủ động dial ra một server trung gian, và server đó chỉ làm một việc — ghép hai kết nối đã có vào nhau. Nguyên văn trong README của thư mục `cloud/`:

```text
Phones and desktops never talk to each other directly: each opens an
outbound WebSocket to a relay cell, the relay pairs the two sessions,
and it splices frames between them. A director assigns hosts to cells
and coordinates migrations; cells carry the user connections.
```

*Nguồn: cloud/README.md, repo công khai wakii-dev/wakii, lấy 2026-09-08.*

```ascii
   mobile app                            desktop host
 (điện thoại)                          (máy dev của bạn)
      │                                      │
      │ 1 outbound WSS                       │ 1 outbound WSS
      │ (không mở port vào)                  │ (control channel, Bearer JWT)
      ▼                                      ▼
┌─────────────────────────────────────────────────────┐
│ relay cell — cloud/apps/relay                       │
│ ghép hai phiên, splice frame giữa hai bên           │
│ (wire contract: cloud/packages/relay-contract)      │
└──────────────────────────┬──────────────────────────┘
                           │ heartbeat, inventory
                           ▼
          director + Cloud SQL — phân bổ host vào cell,
          điều phối migration (cloud/infra/terraform)
```

*Nguồn: cloud/README.md và cloud/packages/relay-contract/src/, lấy 2026-09-08.*

Đổi lại một chặng mạng, bạn nhận về ba thứ: không mở đường vào nhà, một điểm đồng nhất để kiểm soát admission, và một chỗ duy nhất để giám sát. Đây là phần dưới nắp của bài [review agents từ điện thoại](/vi/blog/review-ai-agents-from-your-phone/): app trên phone không cần biết desktop ở đâu, chỉ cần tới được một cell.

## Kết nối control và danh tính host

Phía desktop là nơi code nằm public rõ nhất. `src/main/runtime/relay/relay-control-client.ts` mở WebSocket tới cell với đúng một bộ tham số: header `authorization: Bearer <relayJwt>`, tắt nén `perMessageDeflate`, `maxPayload` 64 KB, và một deadline 15 giây cho toàn bộ màn connect. Kèm theo đó là một watchdog im lặng — nếu kênh control không nhận gì quá hạn, socket bị terminate chủ động thay vì treo chết.

Client quản lý kết nối bằng một máy trạng thái nhỏ:

```ts
type RelayControlState =
  | 'idle' | 'opening' | 'proving' | 'active' | 'draining' | 'closed'

const RELAY_CONTROL_CONNECT_DEADLINE_MS = 15_000

// relay-host-proof.ts — chấp nhận lệch giờ NTP thông thường
const RELAY_HOST_PROOF_CLOCK_SKEW_MS = 30_000
const MAX_HOST_PROOF_CHALLENGE_WINDOW_MS = 10_000
```

*Nguồn: src/main/runtime/relay/relay-control-client.ts và relay-host-proof.ts, repo công khai wakii-dev/wakii, lấy 2026-09-08.*

Trạng thái `proving` là phần thú vị: trước khi được coi là `active`, desktop phải trả một challenge. `relay-host-proof.ts` ký transcript bằng HMAC kết hợp NaCl (thư viện `tweetnacl`), với cửa sổ challenge 10 giây và biên độ lệch giờ 30 giây — đủ cho trôi NTP thông thường, không đủ cho replay cũ. Danh tính host không do server cấp tên: host id được derive từ public key của cặp kho E2EE mà desktop tự giữ (`desktop-relay-service.ts` gọi `runtimeRpc.getE2EEKeypair()`). Cell không cần tin lời khai nào; nó kiểm chứng bằng toán.

## Máy trạng thái splice: không xác nhận splice giả

Wire contract dùng chung cho relay, desktop app và mobile app nằm gọn trong một package: `cloud/packages/relay-contract`. Phần lõi của nó là máy trạng thái splice — quy định chặt một phiên ghép được đi qua những trạng thái nào, theo thứ tự nào:

```ts
export const SPLICE_STATE = {
  PRE_AUTH_ADMITTED: 'pre-auth-admitted',
  CREDENTIAL_LEASE_RESERVED: 'credential-lease-reserved',
  HOST_NOTIFIED: 'host-notified',
  ATTACH_PENDING: 'attach-pending',
  HOST_ATTACHED: 'host-attached',
  CLIENT_ACKNOWLEDGED: 'client-acknowledged',
  SPLICED: 'spliced',
  E2EE_CONFIRMABLE: 'e2ee-confirmable',
  TEARDOWN: 'teardown'
} as const
```

*Nguồn: cloud/packages/relay-contract/src/splice-state-machine.ts, lấy 2026-09-08.*

Đọc thứ tự trên như một cuộc bắt tay dài: phiên được nhận vào trước khi xác thực, giữ lease credential, báo cho host, chờ host gắn vào, chờ client xác nhận, rồi mới `spliced`. Từ bất kỳ trạng thái nào cũng chỉ có hai lối ra: tiến một bước, hoặc `teardown`. Không có đường tắt.

Chi tiết tôi thích nhất nằm ở một hàm duy nhất: `mayAcknowledgeClient` chỉ trả về true khi máy đang ở `host-attached` và cả hai forwarding handler đã được cài đặt. Comment trong code nói thẳng lý do: xác nhận thành công trước khi cả hai đầu forwarding tồn tại có thể bỏ lại client trên một splice giả — client tưởng đã nối, trong khi frame đi vào hư không. Đó là dạng bug khó bắt nhất trong hệ thống phân tán, và nó bị chặn bằng bốn dòng.

## Admission budget và close code

Một cell phục vụ nhiều cặp phiên cùng lúc, nên giới hạn tài nguyên phải là số công khai, không phải bản năng của server. Trong `admission-budgets.ts`: hard cap kết nối mỗi cell (mặc định 600, trong dải thiết kế 600–3000), một phần giữ riêng cho host control — socket thường dừng ở ceiling bằng hard-cap trừ phần reserve. Băng splice có water-mark thấp/cao 64 KB / 256 KB; splice kẹt quá 10 giây bị coi là wedged.

Khi một kết nối bị từ chối hoặc cắt, nó không chết im lặng. Sáu close code nói rõ lý do:

| Code | Tên | Tình huống |
| --- | --- | --- |
| 4401 | BAD_OUTER_CREDENTIAL | credential lớp ngoài sai |
| 4404 | HOST_OFFLINE | host không online |
| 4408 | PEER_DROPPED | đầu kia đã ngắt |
| 4409 | WRONG_CELL | host không thuộc cell này |
| 4429 | LIMIT_EXCEEDED | vượt admission budget |
| 4503 | DRAINING | cell đang rút, không nhận thêm |

*Nguồn: cloud/packages/relay-contract/src/admission-budgets.ts và close-codes.ts, lấy 2026-09-08.*

Catalog region chỉ có hai giá trị hợp lệ — `us-central1` (mặc định) và `asia-east2`, ràng buộc bằng schema zod kèm probe origin bắt buộc là URL HTTPS canonical. Bài toán chọn cell gần người dùng tồn tại thật, nhưng không gian giải được khóa trong một mảng hai phần tử.

## Director, fence broker, và các workflow

Cùng một thư mục `cloud/apps/relay` build ra một image duy nhất; image đó chạy vai director hay cell tùy biến môi trường `ORCA_RELAY_ROLE`. Director không mang traffic người dùng — nó phân bổ host vào cell và điều phối migration giữa các cell.

Hai service còn lại tách vai hạ tầng. `relay-fence-broker` là service riêng, chỉ nhận kết nối có IAM; nó giữ lease mutation bền vững và checkout Terraform, còn workflow gọi nó chỉ có quyền đọc và invoke — không bao giờ giữ trực tiếp quyền mutation. `relay-ops` là console vận hành và incident monitor đằng sau các lệnh `pnpm ops:relay` và `pnpm incident:relay`.

Toàn bộ mặt vận hành này lộ ra công khai dưới dạng workflow GitHub, và tên file đã tự kể chuyện:

```text
.github/workflows/
  cloud-deploy-relay-fence-broker.yml    "Deploy Relay Fence Broker"
  cloud-monitor-relay-clock-skew.yml     "Monitor Relay Cell Clock Skew"
  cloud-operate-relay-production-rehome.yml "Operate Relay Production Rehome"
  … (24 workflow cloud-*.yml)
```

*Nguồn: .github/workflows/ và cloud/README.md, lấy 2026-09-08.*

Workflow "Deploy Relay Fence Broker" resolve image theo đúng commit rồi verify revision singleton sẵn sàng; "Monitor Relay Cell Clock Skew" đo lệch Date header của từng cell — số đo mà challenge sign ở phần trên phụ thuộc. Điểm quan trọng nhất: mọi job đều gate trên biến repository `ORCA_CLOUD_OPERATIONS_ENABLED == 'true'`, không set trên repo public, nên khối hạ tầng mặc định nằm im. Riêng "Cloud Verify" không gate — build, typecheck, test và validate Terraform relay trên mọi pull request, kể cả từ fork. Topology đọc được trọn vẹn; hạ tầng thật thì không chạy được bước nào.

## Kết

Câu hỏi thường gặp về cấu hình và vận hành — trong đó có phần relay và ghép đôi thiết bị — được gộp ở trang [FAQ](/vi/docs/faq/). Nếu muốn tự đối chiếu, toàn bộ đường dẫn nêu trong bài nằm trên repo công khai `wakii-dev/wakii` (MIT): mở `cloud/README.md` rồi đi xuống `packages/relay-contract` là thấy đúng những gì bài này kể. Muốn trải nghiệm phần mobile đã nối qua relay này, tải Wakii và mở Superpowers panel — signal của bạn sẽ đi đúng con đường trong sơ đồ trên.
