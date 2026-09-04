---
title: Agents & kit
description: Đội 9 agent, 20 skills bundled, và 24 story CLIs — tất cả tự cài sẵn, không cần setup.
order: 3
---

Wakii bundle sẵn một bộ workflow kit hoàn chỉnh. Kit tự cài ở lần chạy đầu
tiên của app — không setup, bật sẵn mặc định.

## Đội 9 agent

Mỗi story run được phủ bởi chín chuyên gia. Mỗi người một việc hẹp, và cơ
chế kiềm chế chéo giữa họ mới là điều quan trọng:

| Agent | Nhiệm vụ |
|---|---|
| **phase0-impact-analyst** | Vẽ blast radius trước khi có code — touch map, hệ quả cấp hai, các phương án |
| **spec-critic** | Review adversarial cho spec: mơ hồ, thiếu edge case, tiêu chí không verify được |
| **plan-critic** | Review adversarial cho plan và đồ thị phụ thuộc task |
| **task-executor** | Implement task trong worktree biệt lập, commit atomic |
| **designer** | Làm design draft độ cao cho user duyệt trước khi UI được build |
| **code-reviewer** | Soi mọi diff tìm bug, lỗ hổng security, và scope creep |
| **verifier** | Verdict pass/fail độc lập cho sản phẩm hoàn thành — tự báo xong thì không ăn |
| **security-audit** | Audit tập trung OWASP khi thay đổi đụng auth, input, hay secrets |
| **rollback-fixer** | Revert an toàn về trạng thái tốt cuối cùng khi có gì đó lệch hướng |

## Bộ kit

Kit bundled (`story-team-kit`) mang theo toàn bộ máy móc workflow:

- **20 skills** — các skill agent load theo nhu cầu: brainstorming,
  viết plan, thực thi plan, code review, quản lý story, design pipeline,
  và nhiều hơn nữa — kể cả platform skill để điều khiển máy và công cụ
  của bạn (computer use, orchestration, tích hợp Linear).
- **24 CLI `story-*`** — cài vào `~/.claude/bin/`: `story-verify` (kiểm
  tra gates), `story-watchdog` (phát hiện stall), `story-preflight`,
  `story-test`, và cả hộp công cụ story-ops còn lại.

Việc cài đặt diễn ra tự động lần đầu Wakii chạy — kit được chép vào
`~/.claude/` và giữ đồng bộ theo version app. Hoàn toàn idempotent: chạy
lại không bao giờ nhân đôi hay ghi đè config local của bạn.

## License

Kit có nguồn từ dự án open-source
[superpowers](https://github.com/obra/superpowers) của Jesse Vincent,
phát hành theo giấy phép **MIT** — cùng giấy phép với Wakii và Orca
upstream.

## Liên quan

- [Danh mục skills](/vi/skills/) — mọi skill public, giải thích đầy đủ
- [Superpowers panel](/vi/docs/superpowers-panel/) — nơi ra lệnh cho đội
- [Bắt đầu](/vi/docs/getting-started/) — build Wakii và gặp đội
