# ADOPT draft — junegunn/fzf (batch-3, matrix #11, SF-2/FI-385)

> Draft cho SF-6 file issue TẬP TRUNG sau review (style-guide §10; label
> `enhancement` trên wakii-dev/wakii). KHÔNG link path nội bộ — dẫn chứng
> bằng bài post public: "bài sẽ live tại /blog/deep-dive-junegunn-fzf/
> sau khi story merge" (build-in-public đã user duyệt 2026-09-07).
>
> Grading trong bài: 1 ADOPT (batteries-included — Wakii ĐÃ áp, chỉ là xác
> nhận từ repo 13 năm tuổi, không cần issue mới) + 1 DIRECTION (fuzzy picker
> cho story-* CLI — đây là draft issue thực sự, bên dưới) + 1 WATCH
> (`--listen` server mode — chưa đủ điều kiện) + 1 N/A (SIMD).

## Pattern

**"Interactive picking trong CLI = fuzzy filter, không phải menu lồng tầng."** Học từ [junegunn/fzf](https://github.com/junegunn/fzf) (82.868★, license MIT, theo GitHub API ngày 2026-09-08): fzf sống 13 năm nhờ một hợp đồng duy nhất — lọc stdin ra stdout theo thời gian thực — và mọi tool khác "mượn" nó làm UI chọn thay vì viết lại picker của mình.

## Evidence inline

README (clone @ `ad151d8`, 2026-09-08) định vị repo:

> "fzf is a general-purpose command-line fuzzy finder and an interactive terminal toolkit"

Và độ song song là thiết kế, không phải tình cờ — `src/matcher.go` (cùng clone, "theo GitHub API ngày 2026-09-08"):

```go
partitions := runtime.NumCPU()
...
numWorkers := min(m.partitions, numChunks)
var nextChunk atomic.Int32
resultChan := make(chan partialResult, numWorkers)
```

Lớp tích hợp tách khỏi lõi: `shell/` chứa 10 file key-bindings + fuzzy completion cho bash/zsh/fish/nushell — script mỏng gọi binary, cập nhật độc lập. Số repo: 82.868★, pushed 2026-09-06, MIT (theo GitHub API ngày 2026-09-08).

## Đề xuất Wakii

Áp vào **story-* CLI trong kit** (24 CLI cài vào `~/.claude/bin/`, tại thời điểm viết):

1. Các lệnh chọn mục tiêu — chọn story đang mở, gate pending, worktree — khi chạy TƯƠNG TÁC pipe danh sách qua fuzzy filter: gọi `fzf` nếu máy có (tôn trọng binary user đã cài), fallback danh sách đánh số khi không có. Khi chạy NON-interactive (agent gọi, CI, gate) giữ nguyên tham số trực tiếp — agent không cần UI.
2. Hợp đồng I/O theo fzf: đầu vào 1 mục/dòng, đầu ra 1 lựa chọn — không thêm format riêng.
3. Không bundle fzf vào kit:kit idempotent không đụng config sẵn có; fzf chỉ là dependency mềm có fallback.

Kỳ vọng hành vi: người chạy `story-*` tương tác tìm đúng mục tiêu trong vài ký tự thay vì nhớ ID chính xác; agent-path không đổi. Rủi ro chính: hai code-path (interactive/non-interactive) phải cho kết quả giống hệt nhau — cần test cả hai nhánh trước khi coi là ship.

## Upstream links

- Repo: https://github.com/junegunn/fzf
- README: https://github.com/junegunn/fzf/blob/ad151d8/README.md
- Matcher (song song theo NumCPU): https://github.com/junegunn/fzf/blob/ad151d8/src/matcher.go
- Thuật toán (Smith-Waterman modified): https://github.com/junegunn/fzf/blob/ad151d8/src/algo/algo.go
- Lớp shell integration: https://github.com/junegunn/fzf/tree/ad151d8/shell
- Bài deep-dive: sẽ live tại /blog/deep-dive-junegunn-fzf/ sau khi story merge
