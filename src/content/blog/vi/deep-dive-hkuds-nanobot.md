---
title: "Nanobot: khi ít code hơn là một quyết định kiến trúc"
description: "Deep-dive HKUDS/nanobot: agent cá nhân điều khiển bằng một file config.json, core đo được vài nghìn dòng, persona là Markdown — bài học về việc giữ surface nhỏ một cách có chủ đích."
pubDate: "2026-10-14"
category: "tech"
tags: ["agents", "cli"]
draft: false
---

Phần lớn framework agent chào mời bạn bằng số lượng: bao nhiêu vai, bao nhiêu pattern orchestration, bao nhiêu abstraction. HKUDS/nanobot đi ngược lại — một agent cá nhân chạy trong WebUI, terminal hay chat app, nhưng gói phần lõi lại rất chặt. README tự giới thiệu đây là "an ultra-lightweight, open-source, self-hosted personal AI agent framework" (repo [HKUDS/nanobot](https://github.com/HKUDS/nanobot), license MIT theo GitHub API ngày 2026-09-08, 47.883 sao theo GitHub API ngày 2026-09-08). Điều đáng học không phải danh sách tính năng, mà cách họ giữ surface nhỏ một cách có chủ đích: cấu hình là dữ liệu, persona là Markdown, và phần mở rộng nằm ngoài core. Bài này mổ xẻ bốn quyết định kiến trúc đó trên code thật tại commit `104917a`.

TL;DR:

- Toàn bộ hành vi agent khai báo trong một file `~/.nanobot/config.json` — validate bằng schema pydantic, secret đẩy ra ngoài qua `${ENV_VAR}`.
- Core runtime đo được 17.749 dòng Python (chạy chính script `core_agent_lines.sh` của repo tại commit `104917a`); tools, skills, channels là bucket riêng bên ngoài core.
- Multi-agent ở quy mô vừa phải: subagent chạy nền trên cùng runtime, mặc định 4 concurrent, status có tên từng phase.
- Persona là Markdown (`SOUL.md`, `USER.md`) do cơ chế "Dream" tự chăm sóc, không phải hằng số nhét trong code.
- Wakii áp được ngay: cách repo tự định nghĩa ranh giới core rồi tự đo nó — cùng tinh thần với việc đếm surface kit từ catalog thay vì grep thiếu chính xác.

## Một file config.json thay cả lớp glue code

Mở `nanobot/config/loader.py`, đường dẫn mặc định nằm gọn trong một hàm (trích từ [loader.py tại commit 104917a](https://github.com/HKUDS/nanobot/blob/104917aaec8b351edcbbc87a64fa6b71eb6e096b/nanobot/config/loader.py)):

```python
def get_config_path() -> Path:
    """Get the configuration file path."""
    if _current_config_path:
        return _current_config_path
    return Path.home() / ".nanobot" / "config.json"
```

Một file, một nguồn thật. Mọi hành vi chạy được — model mặc định, chuỗi fallback, giới hạn tool, số subagent tối đa — là field trong schema pydantic chứ không phải hằng số rải trong code. Secret thì được tách khỏi file cấu hình bằng placeholder `${ENV_VAR}`, giải khi startup (ví dụ thật từ [docs/configuration.md](https://github.com/HKUDS/nanobot/blob/104917aaec8b351edcbbc87a64fa6b71eb6e096b/docs/configuration.md)):

```json
{
  "channels": {
    "telegram": { "token": "${TELEGRAM_TOKEN}" }
  },
  "providers": {
    "groq": { "apiKey": "${GROQ_API_KEY}" }
  }
}
```

Tài liệu hướng dẫn dùng WebUI cho thao tác thường ngày, và chỉ bảo người dùng sửa JSON trực tiếp khi cần field nâng cao, deploy tự động, hoặc — trích nguyên văn — "intentionally manage configuration as code" (docs/configuration.md của nanobot). Đây là điểm nanobot giống nhất với ethos zero-setup mà Wakii đã kể trong bài [zero-setup agent team](/vi/blog/zero-setup-agent-team/): người dùng bình thường không phải học format cấu hình, người dùng nâng cao thì có một ngôn ngữ khai báo duy nhất để nói với runtime.

## Core 17.749 dòng, và nó tự đo chính mình

Gốc repo có một script tên `core_agent_lines.sh`. Nhiệm vụ duy nhất: định nghĩa ranh giới "core" là 5 package cụ thể (agent, bus, config, cron, session), rồi đếm dòng. Kết quả chạy tại commit `104917a` (script gốc của repo, tôi chạy bản tarball cùng commit):

```text
Core runtime
------------
  agent/             9597 lines
  bus/                718 lines
  config/            1356 lines
  cron/              1380 lines
  session/           4698 lines

Separate buckets
----------------
  tools/            12825 lines
  channels/         64193 lines

Totals
------
  core total        17749 lines
  extra total       93018 lines
```

Tổng package Python là 155.253 dòng trong 393 file (đếm tại cùng commit) — core chiếm khoảng 11%. Số đáng chú ý hơn là bucket `channels/`: 64.193 dòng, gấp hơn 3 lần core, là toàn bộ phần tích hợp Telegram, Discord, Slack, email và các kênh khác. Đó chính là quyết định kiến trúc: phần hay thay đổi và hay phình nhất bị đẩy ra ngoài core, phần ít đổi — vòng lặp agent, cấu hình, phiên làm việc — giữ đủ nhỏ để một người đọc hết được. Tài liệu [architecture.md](https://github.com/HKUDS/nanobot/blob/104917aaec8b351edcbbc87a64fa6b71eb6e096b/docs/architecture.md) của repo map từng hành vi runtime về đúng file nguồn — một core nhỏ mới cho phép kiểu tài liệu này tồn tại mà không thành mê cung. "Ít code" ở đây không phải thiếu tính năng; là chọn cái gì được phép lớn.

## Đa agent quy mô nhỏ: bốn subagent chạy nền

Nanobot thuộc facet multi-agent, nhưng đừng hình dung một công ty mô phỏng hay một mạng actor phức tạp — những góc đó các bài MetaGPT và AutoGen trong series này đã đi qua. Ở nanobot, delegation giữ đúng kích thước vấn đề của một trợ lý cá nhân: tool `spawn` tạo subagent chạy nền ("Spawn tool for creating background subagents" — [tools/spawn.py](https://github.com/HKUDS/nanobot/blob/104917aaec8b351edcbbc87a64fa6b71eb6e096b/nanobot/agent/tools/spawn.py)), và số lượng bị chặn ngay trong config mặc định (trích từ [config/schema.py](https://github.com/HKUDS/nanobot/blob/104917aaec8b351edcbbc87a64fa6b71eb6e096b/nanobot/config/schema.py)):

```python
class AgentDefaults(Base):
    """Default agent configuration."""

    workspace: str = "~/.nanobot/workspace"
    model: str = "anthropic/claude-opus-4-5"
    ...
    fallback_models: list[FallbackCandidate] = Field(default_factory=list)
    max_tool_iterations: int = 200
    max_concurrent_subagents: int = Field(default=4, ge=1)
```

Subagent không phải runtime thứ hai — nó chạy lại đúng `AgentRunner` của core trên một scope riêng. Điều tinh tế nằm ở cách họ quan sát nó: status có tên từng phase thay vì một cờ busy/idle (trích từ [agent/subagent.py](https://github.com/HKUDS/nanobot/blob/104917aaec8b351edcbbc87a64fa6b71eb6e096b/nanobot/agent/subagent.py)):

```python
@dataclass(slots=True)
class SubagentStatus:
    """Real-time status of a running subagent."""

    task_id: str
    label: str
    task_description: str
    started_at: float          # time.monotonic()
    # queued | initializing | awaiting_tools | tools_completed | final_response | done | error
    phase: str = "initializing"
    iteration: int = 0
```

Bốn subagent concurrent và bảy phase có tên — đủ cho mục tiêu dài hạn, cron và việc chạy song song của một người, không đủ để mô phỏng một tổ chức. Đó là trade-off được chọn rõ ràng, không phải giới hạn vô tình.

## Persona là Markdown, không phải hằng số trong code

Phần "linh hồn" của agent không nằm trong Python. Core kèm sẵn các template Markdown: `SOUL.md` cho nhân cách, `USER.md` cho ngữ cảnh người dùng, `AGENTS.md`, `HEARTBEAT.md` (thư mục [nanobot/templates](https://github.com/HKUDS/nanobot/blob/104917aaec8b351edcbbc87a64fa6b71eb6e096b/nanobot/templates/SOUL.md)). `SOUL.md` mở đầu bằng nguyên tắc hành động rất ngắn, ví dụ dòng: "Solve by doing, not by describing what I would do." (template SOUL.md của nanobot). Hai file persona này lại do cơ chế bộ nhớ "Dream" tự chăm sóc — template [identity.md](https://github.com/HKUDS/nanobot/blob/104917aaec8b351edcbbc87a64fa6b71eb6e096b/nanobot/templates/agent/identity.md) ghi rõ chúng "automatically managed by Dream — do not edit directly". Persona vì vậy là dữ liệu sống, không phải hằng số biên dịch. Cách render cũng khai báo hết: cùng một template persona, nhưng khách Telegram nhận hướng dẫn "đoạn ngắn, tránh heading", khách email nhận "chia section rõ" — phân nhánh theo kênh ngay trong template. Skills của người dùng đi theo cùng pattern declarative: một thư mục `skills/<tên>/SKILL.md`, đúng mô hình mà bài [hướng dẫn viết skill tùy chỉnh](/vi/blog/guide-custom-skill-101/) đã đi qua ở hệ Wakii.

Nanobot cho thấy một agent hằng ngày không cần cấu hình tay từng phần — đúng tinh thần với cách Wakii setup: kit tự cài lần đầu vào `~/.claude/`, idempotent, không đụng config sẵn có. Nếu bạn mới bắt đầu, trang [getting-started](/vi/docs/getting-started/) đi từ cài đặt tới agent đầu tiên trong vài phút.

## Wakii học được gì

- **ADOPT** — tự đo surface bằng script có ranh giới khai báo rõ. `core_agent_lines.sh` không đếm chung chung: nó định nghĩa trước core là 5 package cụ thể rồi mới đếm, tách tools/channels thành bucket riêng. Wakii áp được ngay ở việc đếm surface kit: catalog skills đếm trong mảng `src/data/skills.ts` (20 tổng / 13 public tại thời điểm viết) thay vì grep whole-file — pattern đếm nhầm 21/14 đã bị ghi lại trong claims-registry của dự án. Một lệnh `check` duy nhất in số skill/agent/CLI từ nguồn chuẩn sẽ chặn sớm mọi drift kiểu này.
- **DIRECTION** — status phase có tên cho agent chạy dài. `SubagentStatus` liệt kê phase bằng tên (`queued`, `initializing`, `awaiting_tools`, `tools_completed`, `final_response`, `done`, lỗi tách riêng) thay vì một cờ busy/idle. Story view của Wakii đã hiện tiến độ theo tier SF; khi worktree và agent chạy lâu hơn, nhãn phase kiểu này đáng cân nhắc để người đọc biết chính xác agent đang ở khâu nào.
- **WATCH** — cái giá của ecosystem tích hợp. Bucket `channels/` lớn 64.193 dòng — hơn 3 lần core 17.749 dòng (chạy script của repo tại commit `104917a`). Core giữ được tối giản vì phần tích hợp Telegram/Discord/Slack nằm hoàn toàn ngoài core. Wakii theo dõi để khi cần thêm kênh giao tiếp mới ngoài phone và desktop hiện có, học cách tách bucket thay vì phình core.

Nếu cách giữ surface nhỏ của nanobot hợp gu bạn, Wakii đi cùng triết lý đó — tải bản desktop hoặc Android và bắt đầu từ getting-started ở trên.
