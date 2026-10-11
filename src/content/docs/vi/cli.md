---
title: Orca CLI
description: Toàn bộ workflow dạng script — worktree, terminal, browser, snapshot — bề mặt Orca đầy đủ dạng lệnh ghép được.
order: 17
---

**`orca` CLI** biến toàn bộ app thành script: tạo worktree, chạy terminal,
điều khiển browser nhúng, chụp snapshot, gửi prompt — mọi workflow bạn
bấm, dưới dạng lệnh ghép được.

## Agent dùng CLI thế nào

Orca CLI là cách **agent điều khiển ngược lại app**. Agent có shell access
có thể:

```bash
# tạo worktree và chạy trong đó
orca worktree create --name fix-api --agent claude \
  --prompt "Fix the API timeout"

# điều khiển browser nhúng
orca snapshot            # accessibility tree của trang đang mở
orca click --ref btn-save
orca fill --ref input-email "test@example.com"

# báo cho người
orca notify --title "Agent xong" --body "PR ready for review"
```

Agent không chỉ chạy **trong** app — chúng **vận hành** app, biến IDE
thành bề mặt công cụ của mình.

## Lệnh thường dùng

| Lệnh | Tác dụng |
| ---- | -------- |
| `orca worktree create` | Worktree cách ly mới + agent |
| `orca snapshot` | Accessibility tree của trang browser đang mở |
| `orca click` / `orca fill` | Tương tác browser theo element ref |
| `orca terminal list` / `send` | Xem và điều khiển terminal |
| `orca notify` | Desktop notification |
| `orca tab create` / `close` | Tab browser nhúng |

## Pattern viết script

- **Fan out**: vòng lặp `worktree create` qua N agent, rồi diff các
  worktree.
- **Verify**: `snapshot` → assert UI state mong đợi → `notify` kết quả.
- **Hand off**: agent A tạo worktree; agent B (CLI khác) làm trong đó;
  agent C review.

## Mẹo

- Mọi lệnh hỗ trợ `--json` cho output scriptable.
- `orca --help` liệt kê tất cả; mỗi subcommand có `--help` riêng.
- CLI nói chuyện với app đang chạy — mở Wakii trước.
