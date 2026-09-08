---
title: "AutoGen: khung agent đa vai của Microsoft"
description: "AutoGen 60.866 sao đã viết lại toàn bộ lõi ở v0.4: từ điều phối qua hội thoại sang runtime actor event-driven. Bài mổ cơ chế đó, ranh giới của cuộc rewrite, và hai lớp license của repo này."
pubDate: "2026-10-13"
category: "tech"
tags: ["agents", "architecture"]
draft: false
---

AutoGen là một trong những framework agent đa vai nổi nhất của Microsoft — 60.866 sao
theo GitHub API ngày 2026-09-08. Điều đáng đọc không phải con số sao, mà là một quyết
định hiếm: giữa lúc framework có hàng nghìn người dùng thật, team viết lại toàn bộ lõi
ở v0.4 — bỏ điều phối qua hội thoại, dựng lại quanh runtime kiểu actor. Rewrite lớn
trong framework đang chạy thật thường là nước đi đánh đổi: API cũ gãy, nhưng kiến trúc
cũ không còn đỡ được quy mô mới. Bài mổ cơ chế event-driven của v0.4, ranh giới của cuộc rewrite,
và một chi tiết ít người để ý: repo có hai lớp license.

TL;DR:

- V0.2 điều phối agent qua hội thoại luân phiên; v0.4 thay bằng runtime actor: agent
  nhận/gửi message envelope qua một message queue trung tâm.
- Hai lớp: `autogen-core` là runtime event-driven, `autogen-agentchat` là API cao có
  sẵn teams.
- Rewrite có ranh giới rõ: tên cũ `autogen` thành proxy trỏ về API mới; code v0.2 phải
  pin thủ công, không có shim tự động.
- License kép: code các package theo MIT (file `LICENSE-CODE`), root repo khai
  CC-BY-4.0 — GitHub API hiển thị CC-BY-4.0.
- Repo hiện ở maintenance mode; release cuối `python-v0.7.5` ngày 2025-09-30, successor
  là Microsoft Agent Framework.

## Điều phối bằng hội thoại, và điểm gãy khi hệ phình ra

Mô hình v0.2 đặt hội thoại làm trung tâm: vài agent nói chuyện luân phiên trong một
nhóm, logic ứng dụng nằm ở cách bạn điều khiển luồng — ai nói tiếp, dừng khi nào, ai
tổng hợp. Người viết vừa thiết kế vai vừa làm quản trò. Trực quan, dễ demo — chính là
lối "conversation programming" mà tài liệu thời đó gọi tên.

Điểm gãy hiện ra khi số agent và số phiên tăng. Luồng điều khiển nằm rải rác trong nội
dung tin nhắn: test riêng một vai khó vì vai nào cũng gắn phiên chung; thêm vai mới là
sửa kịch bản thay vì thêm một kết nối có ranh giới. README mô tả AutoGen là "framework
for creating multi-agent AI applications"
([nguồn](https://github.com/microsoft/autogen/blob/027ecf0a379bcc1d09956d46d12d44a3ad9cee14/README.md))
— khi "multi" tăng đủ nhiều, hội thoại chung thành điểm nghẽn của chính nó.

Wakii đứng trước cùng bài toán ở quy mô nhỏ và chọn chiều ngược lại: một story được
chín agent hẹp đảm nhiệm, luồng thông tin một chiều thay vì hội thoại tự do — xem
[nine agents, separated powers](/vi/blog/nine-agents-separated-powers/).

## V0.4 viết lại: agent là actor, runtime là trạm chuyển thư

V0.4 thay hội thoại bằng runtime kiểu actor: agent không gọi trực tiếp nhau nữa, chỉ
nhận/gửi message envelope qua một message queue trung tâm. Trong source của
`SingleThreadedAgentRuntime`, ba loại envelope dùng chung một queue:

```python
@dataclass(kw_only=True)
class PublishMessageEnvelope:
    """A message envelope for publishing messages to all agents that can handle
    the message of the type T."""

    message: Any
    cancellation_token: CancellationToken
    sender: AgentId | None
    topic_id: TopicId
```

(Trích `python/packages/autogen-core/src/autogen_core/_single_threaded_agent_runtime.py`
@ commit `027ecf0a` —
[link nguồn](https://github.com/microsoft/autogen/blob/027ecf0a379bcc1d09956d46d12d44a3ad9cee14/python/packages/autogen-core/src/autogen_core/_single_threaded_agent_runtime.py),
theo GitHub API ngày 2026-09-08.)

Publish đi theo mô hình pub-sub: message gắn một `topic_id`, runtime tra subscription
và thả message tới mọi agent đăng ký topic đó — trừ chính người gửi:

```python
recipients = await self._subscription_manager.get_subscribed_recipients(
    message_envelope.topic_id
)
for agent_id in recipients:
    # Avoid sending the message back to the sender
    if message_envelope.sender is not None and agent_id == message_envelope.sender:
        continue
```

(`_process_publish`, cùng file @ `027ecf0a` —
[link nguồn](https://github.com/microsoft/autogen/blob/027ecf0a379bcc1d09956d46d12d44a3ad9cee14/python/packages/autogen-core/src/autogen_core/_single_threaded_agent_runtime.py).)

Cạnh pub-sub là đường RPC: `SendMessageEnvelope` mang theo `Future`, runtime resolves
khi agent nhận phản hồi — caller `await` như gọi hàm thường. Cả hai đường gặp nhau ở
vòng lặp duy nhất `_process_next`, lấy envelope từ queue và dispatch:

```
        publish (topic)                     send (RPC)
             |                                  |
             v                                  v
  +---------------------------------------------+
  |        SingleThreadedAgentRuntime           |
  |  message_queue: [envelope, envelope, ...]   |
  |       _process_next -> dispatch             |
  +---------------------------------------------+
        |              |                |
        v              v                v
   agent A         agent B          agent C
   (topic X)       (topic X)        (đích RPC)
```

Vì sao mô hình này đỡ hơn khi scale? Một: vai tách khỏi phiên — agent chỉ cần đăng ký
đúng loại message. Hai: song song tự nhiên — các handler chạy `asyncio.gather`, thêm
agent không phải viết lại kịch bản. Ba: quan sát được — mọi message đi qua một điểm,
telemetry gắn một lần (OpenTelemetry import thẳng trong file).

## Hai lớp: event-driven dưới đáy, defaults trên mặt

Rewrite v0.4 còn tách sản phẩm thành hai lớp package: `autogen-core` giữ runtime tối
giản; `autogen-agentchat` là API cao dựng trên đó với agents hành vi có sẵn và teams
theo design pattern quen thuộc. README của `autogen-agentchat` phân vai rõ: high-level
cho người mới, lõi `autogen-core` với "event-driven programming model"
([nguồn](https://github.com/microsoft/autogen/blob/027ecf0a379bcc1d09956d46d12d44a3ad9cee14/python/packages/autogen-agentchat/README.md))
cho ai cần kiểm soát sâu hơn.

Cách tách này xử lý một xung đột quen: người mới cần defaults, người chuyên cần kiểm
soát, cùng một repo. Event-driven làm đáy, defaults làm mặt — API cao không chịu giá
kiến trúc thấp, kiến trúc thấp không bị bóp bởi tiện nghi lớp trên.

## Rewrite có ranh giới: tên cũ thành cổng vào tên mới

Rewrite không bỏ rơi user cũ — nhưng cách giữ không phải shim tự động. Package
`pyautogen` trong tree được
[pyproject](https://github.com/microsoft/autogen/blob/027ecf0a379bcc1d09956d46d12d44a3ad9cee14/python/packages/pyautogen/pyproject.toml)
khai là proxy package, dependency duy nhất trỏ thẳng về `autogen-agentchat>=0.6.4`
(theo GitHub API ngày 2026-09-08). README viết:

> This is a proxy package for the latest version of autogen-agentchat. If you are
> looking for the 0.2.x version, please pin to `pyautogen~=0.2.0`.
>
> — README của `pyautogen`
> ([nguồn](https://github.com/microsoft/autogen/blob/027ecf0a379bcc1d09956d46d12d44a3ad9cee14/python/packages/pyautogen/README.md))

Nghĩa là `pip install autogen` ngày nay cài API mới; code v0.2 phải chủ động pin
`~=0.2.0` hoặc theo migration guide. Tên cũ thành cổng dẫn sang kiến trúc mới — không
có shim dịch lệnh cũ. Đó là ranh giới rewrite: giữ tài sản tên và đường cài đặt, đổi
bỏ mô hình lõi.

Lịch sử release cho thấy câu chuyện đi tới đâu — sau v0.4, nhịp vài tuần rồi nới ra:

| Tag | Ngày phát hành |
|---|---|
| `python-v0.6.0` | 2025-06-05 |
| `python-v0.6.4` | 2025-07-09 |
| `python-v0.7.1` | 2025-07-28 |
| `python-v0.7.4` | 2025-08-19 |
| `python-v0.7.5` | 2025-09-30 |

(Tags `python-v0.6.0` → `python-v0.7.5` theo GitHub API ngày 2026-09-08; lần push gần
nhất vào main là 2026-04-15.)

Release cuối `python-v0.7.5` ngày 2025-09-30 — gần một năm trước mốc probe. README
ngày nay bọc repo trong cảnh báo maintenance mode: "AutoGen is now in maintenance
mode. It will not receive new features or enhancements and is community managed going
forward." — và dẫn người mới sang Microsoft Agent Framework kèm migration guide riêng.
Rewrite, compat, rồi sunset — ba đoạn của một vòng đời, repo để lại dấu vết rõ cả ba.

## License kép: code MIT, tài liệu CC-BY-4.0

GitHub API báo license của `microsoft/autogen` là CC-BY-4.0 — đúng, nhưng chỉ cho một
lớp. File `LICENSE` ở root là Creative Commons Attribution 4.0; còn mỗi package code
khai riêng `LICENSE-CODE` theo MIT trong `pyproject.toml`, kèm classifier
"License :: OSI Approved :: MIT License".

| Lớp | File | Giấy phép |
|---|---|---|
| Repo root | `LICENSE` | CC-BY-4.0 |
| Package code (`autogen-core`,…) | `LICENSE-CODE` | MIT |

(Ghi nhận theo GitHub API ngày 2026-09-08; xem
[LICENSE root](https://github.com/microsoft/autogen/blob/027ecf0a379bcc1d09956d46d12d44a3ad9cee14/LICENSE)
và
[LICENSE-CODE của autogen-core](https://github.com/microsoft/autogen/blob/027ecf0a379bcc1d09956d46d12d44a3ad9cee14/python/packages/autogen-core/LICENSE-CODE).)

Cấu trúc này hợp lý cho repo mà sản phẩm vừa là code vừa là tài liệu: code giữ license
phần mềm chuẩn (MIT), tài liệu giữ license nội dung cho phép chia sẻ lại tự do. Điểm
cần nhớ: classifier của GitHub đọc `LICENSE` ở root, nên dashboard hiển thị CC-BY-4.0
— con số đó nói về tài liệu, không về code. Mọi số license copy từ dashboard đều đáng
kiểm tra một lớp.

## Wakii học được gì

- **ADOPT** — "rewrite có ranh giới" như kỷ luật phát hành: khi Wakii đổi surface công
  khai (layout, tên trang, contract gate), giữ đường dẫn/tên cũ làm cổng dẫn sang cái
  mới kèm hướng dẫn migrate — đúng pattern `pyautogen` proxy + migration guide. Tiền
  lệ đã có: seed posts grandfathered khi đổi copy.
- **DIRECTION** — message passing theo topic giữa các agent: đội 9 agent của Wakii
  hiện do coordinator gọi tuần tự, luồng thông tin đi một chiều. Nếu orchestration
  chuyển sang nhiều agent phản ứng theo event (gate-open, review-requested), mô hình
  pub-sub của runtime AutoGen là hình dạng đáng thử — chưa áp ngay vì quy mô
  coordinator-driven hiện tại đã đủ.
- **WATCH** — distributed runtime cho task DAG: AutoGen còn biến thể runtime phân tán
  (cùng interface, nhiều host). Điều kiện đổi sang quan tâm: khi task DAG của Wakii
  vượt một máy, hoặc nhiều worktree session cần phản ứng chung một hàng event.

Wakii đi đường ngắn hơn AutoGen: chín vai hẹp trong một harness có sẵn thay vì tự dựng
runtime — docs [agents-and-kit](/vi/docs/agents-and-kit/) mô tả cách team đó chia
quyền. Nếu bạn đang dựng hệ agent đa vai: tải Wakii, thử story workflow, và bắt đầu từ
lúc nhỏ — trước khi cần runtime actor lúc lớn.
