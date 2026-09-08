# ADOPT draft — microsoft/autogen → Wakii (batch-3, matrix #26)

> Draft theo style-guide §10 (FI-383 D5). SF-4/FI-387 đề xuất — SF-6 file tập
> trung sau review. KHÔNG file issue từ draft này tự động.

## 1. Pattern

**Bounded rewrite (rewrite có ranh giới):** khi thay thế mô hình lõi của một hệ đang
chạy thật, giữ tài sản tên/đường dẫn cũ làm cổng dẫn sang kiến trúc mới kèm migration
guide, thay vì cắt im hoặc ship shim dịch lệnh cũ. Học từ `microsoft/autogen`
(60,866 sao, license root CC-BY-4.0 / code package MIT — theo GitHub API ngày
2026-09-08): package `pyautogen` v0.10.0 là proxy trỏ thẳng về API mới
(`autogen-agentchat>=0.6.4`), v0.2 code pin tay `~=0.2.0`, không có shim tự động.

## 2. Evidence inline

- README của `pyautogen` (probe 2026-09-08 @ commit `027ecf0a`): "This is a proxy
  package for the latest version of autogen-agentchat. If you are looking for the
  0.2.x version, please pin to `pyautogen~=0.2.0`."
  https://github.com/microsoft/autogen/blob/027ecf0a379bcc1d09956d46d12d44a3ad9cee14/python/packages/pyautogen/README.md
- `python/packages/pyautogen/pyproject.toml` @ `027ecf0a`: `description = "A
  programming framework for agentic AI. Proxy package for autogen-agentchat."`,
  `dependencies = ["autogen-agentchat>=0.6.4"]`.
  https://github.com/microsoft/autogen/blob/027ecf0a379bcc1d09956d46d12d44a3ad9cee14/python/packages/pyautogen/pyproject.toml
- README root @ `027ecf0a`: "AutoGen is now in maintenance mode. It will not receive
  new features or enhancements and is community managed going forward." + migration
  guide link (v0.2→v0.4: microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/migration-guide.html;
  AutoGen→MAF: learn.microsoft.com/en-us/agent-framework/migration-guide/from-autogen/).
- Cadence (theo GitHub API ngày 2026-09-08): release cuối `python-v0.7.5`
  2025-09-30; v0.7.1 2025-07-28 → v0.7.4 2025-08-19 → v0.7.5 2025-09-30 (khoảng cách
  nới dần).

## 3. Đề xuất Wakii

- **Áp vào:** mọi thay đổi surface công khai của Wakii — layout page, tên trang,
  contract gate, tên CLI trong kit.
- **Kỳ vọng hành vi:** khi đổi một surface, (a) đường dẫn/tên cũ còn tồn tại như một
  cổng dẫn sang cái mới (redirect, alias, hoặc ghi chú tại chỗ cũ), (b) kèm migration
  note ngắn trong docs nêu cái gì đổi và cách chuyển, (c) code cũ không bị nuốt im
  — giống seeds posts đã grandfathered khi đổi copy.
- **Rủi ro chính:** giữ cổng vĩnh viễn sinh nợ (AutoGen cũng phải chọn sunset hẳn —
  maintenance mode + successor MAF). Wakii nên kèm quy định tuổi thọ của cổng
  (vd: cổng sống tối thiểu một chu kỳ story, gỡ khi audit không còn traffic/refs).

## 4. Upstream links

- Repo: https://github.com/microsoft/autogen
- Proxy package README: https://github.com/microsoft/autogen/blob/027ecf0a379bcc1d09956d46d12d44a3ad9cee14/python/packages/pyautogen/README.md
- Migration guide v0.2→v0.4: https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/migration-guide.html
- Successor: https://github.com/microsoft/agent-framework
- Bài blog public: "bài sẽ live tại /blog/deep-dive-microsoft-autogen/ sau khi story
  merge" (build-in-public đã được user duyệt 2026-09-07).
