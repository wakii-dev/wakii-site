---
title: "Crush: agent terminal đậm chất Charm"
description: "Đọc interaction design của Crush — diff hai cột, câu hỏi có cấu trúc, workspace nhiều client — và những gì một agent sống trong terminal dạy về trải nghiệm làm việc cùng máy."
pubDate: "2026-10-09"
category: "tech"
tags: ["terminal", "cli", "design"]
draft: false
---

Agent coding chạy trong terminal thường bị làm vội: một khung nhập lệnh, output cuộn lên, muốn đọc diff cho rõ thì phải mở editor riêng. Crush đi theo hướng ngược lại. Nó đến từ Charm — nhóm đứng sau bubbletea và lipgloss, những thư viện TUI quen thuộc của hệ sinh thái Go — và mang đúng tiêu chuẩn làm TUI đó vào một công cụ agent. Điều đáng đọc không phải danh sách feature, mà interaction design: diff hiện ra sao, agent hỏi quyền thế nào, và gì thay đổi khi terminal được đối xử như một sản phẩm.

TL;DR:

- Crush là agent coding chạy trong terminal từ nhà Charm (bubbletea/lipgloss); 27.953 sao theo GitHub API ngày 2026-09-08, commit đẩy trong ngày probe.
- Diff hiện side-by-side ngay trong TUI; thuật toán gộp cặp dòng xóa/thêm nằm gọn trong một file Go.
- Agent hỏi quyền bằng dialog có cấu trúc — chọn một, chọn nhiều, form, gõ tự do — và notification chỉ được gửi khi terminal không còn focus.
- Nhiều client ghim vào cùng một workspace qua crush serve, kèm hai tín hiệu presence: IsBusy và AttachedClients.
- License không thuộc chuẩn SPDX phổ biến (repo khai báo FSL-1.1-MIT): mã công khai trên GitHub, điều kiện sử dụng riêng.

## Mặt bằng số: nhịp release nói gì

Charm định vị crush ngắn gọn — README mở đầu bằng câu "Your new coding bestie, now available in your favourite terminal." (nguồn: [README](https://github.com/charmbracelet/crush#readme), theo GitHub API ngày 2026-09-08). Số liệu:

| Chỉ số | Giá trị @ 2026-09-08 |
|---|---|
| Stars | 27.953 (theo GitHub API ngày 2026-09-08) |
| Commit cuối | 2026-09-08 — cùng ngày probe |
| Archived | false |
| License (GitHub API) | NOASSERTION |

Về license: GitHub API trả NOASSERTION — không thuộc định danh SPDX phổ biến; file LICENSE.md trong repo khai báo Functional Source License 1.1 (FSL-1.1-MIT). Gọi an toàn: mã công khai trên GitHub, điều kiện sử dụng riêng — đọc repo trước khi dùng.

Nhịp release là chỉ số sinh động nhất:

| Tag | Ngày phát hành (UTC) |
|---|---|
| nightly | 2026-09-08 |
| v0.92.0 | 2026-08-31 |
| v0.91.2 | 2026-08-26 |
| v0.91.1 | 2026-08-25 |
| v0.91.0 | 2026-08-22 |
| v0.90.0 | 2026-08-19 |

Bốn bản versioned trong 12 ngày, cộng nightly hằng ngày — theo GitHub API ngày 2026-09-08. Version vẫn ở v0.x: nhịp đi nhanh, chưa cam kết ổn định API.

## Diff hai cột: khi terminal đủ rộng cho hai mắt

Cây mã nguồn theo GitHub API ngày 2026-09-08 cho thấy trọng tâm: package `internal/ui` có 144 file không tính test — lớn nhất repo, gấp đôi `internal/agent` (109 file). TUI không phải lớp vỏ của crush; nó là phần thân.

Màn hình đáng học nhất là `internal/ui/diffview`: diff hiện side-by-side, hai cột trước/sau cạnh nhau ngay trong terminal. Lõi thuật toán gộp cặp dòng nằm trong [split.go](https://github.com/charmbracelet/crush/blob/563d658bccb56019edc1136c3c262ba0a81ccc99/internal/ui/diffview/split.go):

```go
type splitLine struct {
	before *udiff.Line
	after  *udiff.Line
}
```

(trích tại commit HEAD ngày 2026-09-08)

Hàm `hunkToSplit` đi qua từng dòng của hunk: dòng xóa được giữ làm cột trước, vòng trong tìm dòng thêm tương ứng để ghép cùng hàng; dòng ngữ cảnh đứng nguyên ở cả hai cột. Kết quả là diff đọc như trong IDE — trong khi cả màn hình chỉ là một grid ký tự.

Điểm mấu chốt không phải side-by-side — IDE nào cũng có — mà là chỗ nó xuất hiện: ngay nơi bạn đang nói chuyện với agent. Đọc diff, quyết, gõ tiếp, không đổi cửa sổ. Đó là nhịp của pair-programming thật.

## Hỏi có cấu trúc, báo đúng lúc

Thư mục `internal/ui/dialog`, rút gọn từ cây repo (theo GitHub API ngày 2026-09-08):

```text
internal/ui/dialog/
  permissions.go        # xin quyền từng tool call
  question_yesno.go     # xác nhận nhanh
  question_single.go    # chọn một
  question_multi.go     # chọn nhiều
  question_freetext.go  # gõ tự do
  question_form.go      # form nhiều trường
  sessions.go           # chọn session
  models.go             # đổi model
```

Agent không hỏi bằng prompt tự do mà bằng dialog đúng dạng. README khẳng định mô hình mặc định: "By default, Crush will ask you for permission before running tool calls." (nguồn: [README](https://github.com/charmbracelet/crush#readme) của crush, theo GitHub API ngày 2026-09-08). Muốn bớt lớp hỏi này có hai lối: liệt kê ngoại lệ bằng `permissions allow`, hoặc `--yolo` — mà README tự cảnh báo: "Be very, very careful with this feature."

Notification cũng bị đặt một điều kiện thú vị. README viết: "Crush sends desktop notifications when a tool call requires permission and when the agent finishes its turn." ([README](https://github.com/charmbracelet/crush#readme)) — và câu liền sau chốt điều kiện: chỉ gửi khi terminal không focus. Bản chất được hiểu đúng: notification là cách gọi người trở lại, không phải xác nhận cho người đang nhìn màn hình.

## Một session, nhiều cửa sổ

Crush tách client khỏi backend: chạy `crush serve` và nhiều TUI có thể trỏ về cùng một workspace — nhóm theo thư mục làm việc (`--cwd`), chia sẻ session list, hàng đợi permission, trạng thái LSP và MCP.

```text
TUI client A ─┐                              ┌─ session list
TUI client B ─┼── crush serve ───────────────┼─ permission queue
TUI client C ─┘   workspace (một --cwd)      └─ LSP, MCP, lịch sử tin nhắn
```

README mô tả hai tín hiệu để nhận một session đang có người: "IsBusy is set while an agent turn is in flight for that session." — kèm `AttachedClients` đếm số client đang xem. Tham gia thì im lặng: trỏ thêm client cùng `--cwd` là vào workspace, nhưng mỗi client bắt đầu bằng session mới — muốn xem phiên đang chạy thì chọn qua session picker. Quyết định cấp workspace theo luật ai đến trước: `--yolo` hay `--debug` của client sau không đổi flag client đầu đã đặt. Workspace sống chừng nào còn một luồng event mở; luồng cuối ngắt là dọn dẹp. (toàn bộ: README mục "Sharing a workspace across clients" — [README](https://github.com/charmbracelet/crush#readme), theo GitHub API ngày 2026-09-08)

## Ngữ cảnh LSP và skill đọc chéo

Thứ nhất, LSP. README giới thiệu đúng một câu: "Crush uses LSPs for additional context, just like you do." Cấu hình cũng theo tinh thần đó — khai bằng lệnh, không bằng JSON:

```bash
lsp add go --command "gopls" --env "GOTOOLCHAIN go1.24.5"
lsp add typescript --command "typescript-language-server" --args --stdio
```

(nguồn: [README](https://github.com/charmbracelet/crush#readme) của crush, theo GitHub API ngày 2026-09-08)

Phía code, [manager.go](https://github.com/charmbracelet/crush/blob/563d658bccb56019edc1136c3c262ba0a81ccc99/internal/lsp/manager.go) khởi tạo client theo kiểu lười — mỗi ngôn ngữ chỉ bật khi cần:

```go
// Manager handles lazy initialization of LSP clients based on file types.
type Manager struct {
	clients     *csync.Map[string, *Client]
	unavailable *csync.Map[string, time.Time]
```

(trích tại commit HEAD ngày 2026-09-08)

Thứ hai, skills. Crush hỗ trợ chuẩn Agent Skills (agentskills.io) và quét skills ở những đường dẫn các công cụ khác đã dùng: `~/.claude/skills/`, `.claude/skills` trong project, `.cursor/skills`. Skill khai `user-invocable: true` lên thẳng commands palette với prefix `user:` hoặc `project:`. Một agent terminal đọc skills của agent khác — tương thích mà không cần ai ký thỏa thuận chung.

## Wakii học được gì

- **ADOPT — notification chỉ khi user rời cửa sổ.** Wakii đã có notification routing cho gate-open/gate-closed, đủ routing fields và tap-to-navigate. Crush thêm điều kiện phía Wakii chưa nói tới: im khi cửa sổ đang focus. Gate đóng lúc bạn đang canh panel thì khỏi toast — panel tự cập nhật; chỉ báo khi bạn rời đi. Rủi ro: focus reporting lệ thuộc OS, cần fallback "gửi luôn" khi đọc không được trạng thái.
- **DIRECTION — presence cho session.** Hai tín hiệu IsBusy và AttachedClients giải đúng bài toán nhiều người nhìn cùng một phiên: story view của Wakii đã có tiến độ từng SF, nhưng chưa có "agent đang chạy turn" và "bao nhiêu client đang xem". Đáng đưa vào hướng đi của story view.
- **DIRECTION — gate dạng chọn nhiều.** Bộ dialog của crush có multi-select và form; gate của Wakii hiện có choice và free-text. Một gate cho phép duyệt nhiều mục một lượt — ví dụ duyệt cả batch kết quả verify — là mở rộng tự nhiên, không đổi mô hình supervised.
- **WATCH — skill đọc chéo giữa các công cụ.** Crush đọc `~/.claude/skills/` và theo chuẩn agentskills.io — cùng hướng với mục skills import/export trên watch list của Wakii. Điều kiện đổi grade: quyết định manifest skills — khi đó kit của Wakii nên tương thích hai chiều với chuẩn.

Số liệu chỉ là bề nổi; cái khiến crush đáng học là mỗi tương tác — diff, câu hỏi, notification, session — được thiết kế như một sản phẩm TUI thật. Cách Wakii tổ chức một đội agent quanh terminal và panel nằm trong [agents & kit docs](/vi/docs/agents-and-kit/); cách chia đôi terminal để làm việc song song đã có trong bài [terminal splits](/vi/blog/feature-terminal-splits/), còn triết lý notification cùng nhà với điều kiện focus ở trên nằm trong bài [notification routing](/vi/blog/feature-notification-keyboard/).

Wakii là agentic IDE với một đội superpowers có sẵn — tải về, để agent chạy, bạn chỉ cần quyết.
