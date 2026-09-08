---
title: "fzf: fuzzy finder định hình dòng lệnh hiện đại"
description: "Bên trong fzf, utility nhỏ sống gần 13 năm: biến thể Smith-Waterman, matcher song song theo số CPU, kiến trúc ba goroutine — và bài học packaging một binary duy nhất."
pubDate: "2026-10-06"
category: "tech"
tags: ["terminal", "cli", "oss", "architecture"]
draft: false
heroImage: "/blog/heroes/deep-dive-junegunn-fzf.png"
---

Làm việc trong terminal là làm việc với các danh sách: chọn một file giữa hàng nghìn, một lệnh trong history, một nhánh git. Mỗi lần chọn là một lần dừng tay hoặc gõ mò đường dẫn. fzf giải đúng điểm nghẽn đó bằng một thao tác duy nhất — gõ vài ký tự, danh sách thu hẹp theo thời gian thực, Enter để chốt. Nghe như một tiện ích nhỏ, nhưng sau gần 13 năm (repo tạo ngày 23-10-2013), fzf vẫn đạt 82.868★, license MIT, lần cuối nhận code ngày 06-09-2026 (theo GitHub API ngày 2026-09-08). Bài này mổ xẻ repo để trả lời chính câu đó.

TL;DR:

- fzf tự định vị là "a general-purpose command-line fuzzy finder and an interactive terminal toolkit" — một binary Go duy nhất, mã nguồn mở MIT.
- Ra đời 2013 bằng Ruby; Go rewrite đổi cả kênh phân phối: binary tự chứa, không dependency.
- Lõi tốc độ: biến thể Smith-Waterman trong `src/algo/` và matcher song song khởi tạo theo `runtime.NumCPU`.
- Kiến trúc ba luồng reader → matcher → terminal giao tiếp qua event box.
- Wakii học được: triết lý batteries-included đã áp; fuzzy picker cho story-* CLI là hướng đi đáng làm; SIMD hand-tuning là N/A.

## Một binary, gần mười ba năm

Câu mở đầu README khẳng định vị trí: "fzf is a general-purpose command-line fuzzy finder and an interactive terminal toolkit" ([README, clone 2026-09-08](https://github.com/junegunn/fzf/blob/ad151d8/README.md)). Hai nửa câu đó giải thích tuổi thọ: fuzzy finder là vấn đề vĩnh cửu của dòng lệnh — đâu có danh sách là đó cần lọc; còn "toolkit" là lý do nó không bị nuốt chửng bởi một tính năng của shell: khối gạch để xây menu, preview, workflow.

Cuối năm 2013, fzf là script Ruby. Bản Go rewrite mang lại thứ quan trọng hơn ngôn ngữ: binary tự chứa, không runtime, không phụ thuộc. README liệt kê hơn 20 kênh cài đặt — Homebrew, apt, dnf, pacman, nix, Chocolatey, Winget — và đặt "Portable // Distributed as a single binary for easy installation" lên đầu danh sách ưu điểm (README, cùng link trên). Utility nhỏ muốn sống lâu thì phân phối phải đơn giản.

Nhịp phát hành (10 bản gần nhất, theo GitHub API ngày 2026-09-08):

| Tag | Ngày phát hành |
|---|---|
| v0.74.3 | 2026-08-17 |
| v0.74.2 | 2026-08-01 |
| v0.74.1 | 2026-07-18 |
| v0.74.0 | 2026-07-06 |
| v0.73.1 | 2026-05-25 |
| v0.73.0 | 2026-05-23 |
| v0.72.0 | 2026-04-26 |
| v0.71.0 | 2026-04-04 |
| v0.70.0 | 2026-03-02 |
| v0.68.0 | 2026-02-20 |

Mười bản trong khoảng 6 tháng — mỗi 2-3 tuần một bản, đều như infra chứ không phải dự án sở thích. Nhánh master đã mở sẵn mục CHANGELOG cho 0.74.4 ([CHANGELOG](https://github.com/junegunn/fzf/blob/ad151d8/CHANGELOG.md)): notes soạn ngay trên cây source, release chỉ là sự kiện công bố.

## Ba goroutine và một event box

Đọc cây `src/` thấy ngay một terminal app thật: riêng tầng lõi `src/*.go` đã khoảng 21.700 dòng Go (chưa tính package con algo, tui, util), file lớn nhất là `terminal.go` với 8.850 dòng. Kiến trúc trung tâm: ba luồng chạy song song, gặp nhau ở một hộp thư sự kiện.

```
stdin / danh sách file
   │
   ▼  reader goroutine — stream dữ liệu vào chunklist
[chunk][chunk][chunk]…
   │
   ▼  matcher — chấm điểm song song, mỗi worker nhận một chunk
worker₁  worker₂  …  workerₙ   (n = min(NumCPU, số chunk))
   │  resultChan gom kết quả cục bộ
   ▼
merger hợp nhất, sort — terminal goroutine vẽ TUI, nhận query mới
   │
   ▼  util.EventBox: hộp thư chung cho cả ba luồng
```

Trong `core.go`, hộp thư đó chỉ là một dòng: `eventBox := util.NewEventBox()` ([core.go, ad151d8](https://github.com/junegunn/fzf/blob/ad151d8/src/core.go)) — ba luồng không gọi thẳng vào nhau mà đăng ký và phát sự kiện qua hộp này. Query đổi, nguồn đổi, tiến trình ngoài trả kết quả: tất cả đi qua một cơ chế — đúng nghĩa "event-driven architecture" mà README nhắc.

Độ song song nằm ở matcher ([matcher.go, ad151d8](https://github.com/junegunn/fzf/blob/ad151d8/src/matcher.go)):

```go
partitions := runtime.NumCPU()
...
numWorkers := min(m.partitions, numChunks)
var nextChunk atomic.Int32
resultChan := make(chan partialResult, numWorkers)
```

Số worker theo số CPU, việc chia theo chunk, mỗi worker bốc chunk kế tiếp bằng bộ đếm atomic — không ai chờ ai. Với danh sách hàng triệu dòng, đây là khác biệt giữa "nhìn thấy kết quả" và "chờ máy đơ".

## Thuật toán: Smith-Waterman bản biến thể

Chấm điểm fuzzy không phải "tìm chuỗi con cho vui". Bình luận trong `src/algo/algo.go` nói thẳng: FuzzyMatchV2 cài đặt "a modified version of Smith-Waterman algorithm to find the optimal solution (highest score) according to the scoring criteria" ([algo.go, ad151d8](https://github.com/junegunn/fzf/blob/ad151d8/src/algo/algo.go)) — thuật toán pairwise alignment kinh điển của sinh tin học, sửa theo luật riêng của fzf: không cho phép bỏ sót ký tự của pattern. Có đường nhanh V1 cho trường hợp xuất hiện đầu tiên, cùng file assembly amd64/arm64 tối ưu phép tìm ký tự ASCII ở tầng thấp nhất (`src/algo/SIMD.md` ghi lại thiết kế).

Hiệu năng với fzf là tính năng được bảo trì liên tục. Bản v0.74.3 (17-08-2026) ghi trong CHANGELOG: "ASCII queries are up to 16x faster", query không-ASCII nhanh tới 12x, đọc input Latin có dấu nhanh hơn 37%, bộ nhớ cho input CJK giảm tới 29% ([CHANGELOG, ad151d8](https://github.com/junegunn/fzf/blob/ad151d8/CHANGELOG.md)). Bốn con số, bốn lớp tối ưu — score, path, reader, memory — dồn vào một bản phát hành hàng ngày thường.

## Lớp shell: batteries-included nằm ngoài binary

Phần khiến fzf "dùng được ngay" lại không nằm trong Go. Thư mục `shell/` chứa 10 file key-bindings và fuzzy completion cho 4 shell, cùng một script update ([shell/, ad151d8](https://github.com/junegunn/fzf/tree/ad151d8/shell)):

| Shell | Key bindings | Fuzzy completion |
|---|---|---|
| bash | `key-bindings.bash` | `completion.bash` |
| zsh | `key-bindings.zsh` | `completion.zsh` |
| fish | `key-bindings.fish` | `completion.fish` |
| nushell | `key-bindings.nu` | `completion.nu` |

CTRL-T hiện cây file, CTRL-R lọc history — cả hai là script mỏng gọi binary, không phải logic nhét vào executable. Đây là mô hình phân phối hai lớp đáng học: lõi chặt trong một binary, lớp "sống chung với hệ sinh thái" là script mỏng đi kèm, cập nhật độc lập. Vim và Neovim có plugin riêng theo đúng cách đó.

## Vì sao một utility nhỏ sống được mười ba năm

Ghép các mảnh lại, tuổi thọ của fzf không bí ẩn. Một, vấn đề không lỗi thời: chọn từ danh sách là thao tác gốc của dòng lệnh. Hai, composable tuyệt đối — lọc stdin ra stdout, không chiếm pipeline của ai; ripgrep | fzf | vim là chuỗi tự nhiên, và các tool khác "mượn" fzf làm UI chọn thay vì viết lại:

```
ripgrep ──▶ fzf ──▶ Enter ──▶ vim / cd / git checkout
(mọi tool đưa danh sách vào, nhận đúng một lựa chọn ra)
```

Ba, kỷ luật phạm vi: không daemon, không hệ config riêng — CHANGELOG gần nhất toàn bản sửa tinh tế, kiểu tool coi sự ổn định là tính năng. Trong bản đồ 50 project agentic tháng 9-2026, nhóm terminal tooling — ripgrep, bat, starship, yazi — sống theo cùng logic này ([xem landscape post](/vi/blog/agentic-landscape-50-projects/)).

Wakii cũng có nhiều "danh sách cần chọn": story đang chạy, gate pending, worktree đang mở — chỉ khác, đội 9 agent là người xử lý chứ không phải bạn gõ tay. Bộ kit gồm 9 agent và 24 story-* CLI — mô tả trong [agents and kit](/vi/docs/agents-and-kit/).

## Wakii học được gì

- **ADOPT — batteries-included, tự cài, idempotent.** fzf phân phối một binary cùng 10 script shell để "sống chung" với 4 shell ngay sau cài; Wakii kit cũng tự cài vào `~/.claude/` ngay lần chạy đầu, không đụng config sẵn (docs agents-and-kit). Pattern xác nhận từ 2013: cài xong dùng được ngay, không có bước setup hai.
- **DIRECTION — fuzzy picker cho story-* CLI.** 24 story-* CLI trong kit (tại thời điểm viết) nhận tham số trực tiếp; các lệnh chọn mục tiêu — story, gate, worktree — có thể pipe danh sách qua fuzzy filter khi chạy tương tác (gọi fzf nếu máy có, fallback danh sách đánh số). Chưa áp ngay vì CLI trong kit phục vụ agent và gate trước; thêm chế độ tương tác cần thiết kế UX riêng.
- **WATCH — fzf server mode (`--listen`).** Mục 0.74.4 đang soạn trong CHANGELOG đụng tới status payload của `--listen` — finder có API điều khiển từ ngoài là pattern đáng theo dõi. Điều kiện chuyển thành DIRECTION: khi Wakii có terminal surface thật cho bracket và gates.
- **N/A — SIMD hand-tuning.** Các file assembly amd64/arm64 trong `src/algo/` phục vụ chấm điểm ở quy mô hàng triệu dòng. Stack Wakii (Electron + orchestration agent) không có hot path tương đương đáng trả cái giá phức tạp này.

Muốn thấy đội 9 agent chạy story end-to-end trong khi bạn giữ mọi quyền quyết? Bắt đầu từ [getting started](/vi/docs/getting-started/) — và đọc thêm cơ chế gates trong [story workflow](/vi/docs/story-workflow/).
