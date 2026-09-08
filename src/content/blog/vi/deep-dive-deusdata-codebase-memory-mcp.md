---
title: "codebase-memory-mcp: trí nhớ dài hạn cho agent đọc code"
description: "MCP server viết bằng C thuần nén codebase thành knowledge graph SQLite; watcher theo dõi git để re-index đúng chỗ và memory không stale. Bài đọc code thật: storage, watcher, artifact chia sẻ."
pubDate: "2026-10-09"
category: "tech"
tags: ["memory", "agents", "evidence"]
draft: false
---

Agent đọc code bằng cách mở file từng cái một — và mỗi phiên lại mở lại từ đầu. Trên một repo lớn, cách đó không giữ được gì: hôm nay agent biết hàm nào gọi `ProcessOrder`, phiên sau hỏi lại như chưa từng có ngày hôm qua. DeusData/codebase-memory-mcp chọn hướng khác: một MCP server viết bằng C thuần, nén codebase thành knowledge graph SQLite tồn tại qua các phiên — 42.644 sao theo GitHub API ngày 2026-09-08, chưa đầy bảy tháng sau ngày tạo repo (2026-02-24). Bài này đọc code thật của repo để trả lời ba câu hỏi: memory giữ gì, làm sao nó không stale, và nó đi theo team ra sao.

TL;DR:

- Memory là graph có kiểu — node Function/Class/Route, edge CALLS/IMPORTS/HTTP_CALLS — trong SQLite, kèm file ADR ghi quyết định kiến trúc ngay cạnh source.
- Chống stale: watcher nền poll git (HEAD dịch hoặc working tree dirty) với interval thích ứng 5–60 giây; re-index thất bại thì baseline giữ nguyên, thay đổi không bị bỏ.
- Incremental indexing: so mtime+size với hash đã lưu, chỉ parse lại file đổi.
- Memory chia sẻ qua một file zstd commit theo repo — clone là có — kèm cảnh báo phình git history.
- Wakii: ADOPT stamp freshness cho context pack · DIRECTION repo map một lượt gọi · WATCH artifact nhị phân trong git.

## Memory giữ gì: graph có kiểu, không phải ghi chú tự do

Trái tim của repo là một store SQLite với schema node–edge, bọc trong `src/store/store.h`. Node mang định danh đầy đủ — nhãn loại, tên qualified, file, dòng bắt đầu và kết thúc:

```c
typedef struct {
    int64_t id;
    const char *project;
    const char *label;          /* Function, Class, Method, Module, File, ... */
    const char *name;           /* short name */
    const char *qualified_name; /* full dotted path */
    const char *file_path;      /* relative file path */
    int start_line;
    int end_line;
    /* … properties_json … */
} cbm_node_t;
```

([nguồn](https://github.com/DeusData/codebase-memory-mcp/blob/161df2bdb1f4e28734f326a73f6e7989418f1288/src/store/store.h))

Edge có type phân biệt nghĩa liên kết: `CALLS`, `IMPORTS`, `HTTP_CALLS`, `DATA_FLOWS`, `SEMANTICALLY_RELATED` — theo README đọc ngày 2026-09-08. Nhờ vậy truy vấn là structural: ai gọi hàm này, route HTTP nào chạm service kia — chứ không phải tìm chuỗi. Toàn bộ truy cập đi qua 17 tool khai trong bảng `TOOL_ANNOTATIONS` của `src/mcp/mcp.c` ([đọc tại HEAD ngày 2026-09-08](https://github.com/DeusData/codebase-memory-mcp/blob/161df2bdb1f4e28734f326a73f6e7989418f1288/src/mcp/mcp.c)); thú vị là README quảng cáo "15 MCP tools" — tài liệu đi sau code một nhịp, lý do nữa để truy nguồn bảng annotation thay vì tin số liệu quảng cáo. Comment trong chính file này còn phân loại từng tool read-only hay destructive, với cam kết rõ: truy vấn read-only gặp DB hỏng thì "a corrupt database is reported and left in place, never quarantined or rebuilt" — dữ liệu người dùng không bao giờ bị xử lý âm thầm.

Lớp memory thứ hai nằm ngoài graph: tool `manage_adr` quản lý ADR — "Outline an ADR by default; get reads it; update replaces it" (bảng TOOLS trong `mcp.c`, link trên). File ADR nằm tại `.codebase-memory/adr.md` trong chính repo — hàm `project_has_adr` kiểm tra đường dẫn này trực tiếp — nghĩa là quyết định kiến trúc được persist ngay cạnh source. `get_graph_schema` trả thêm cờ `adr_present` kèm hint nhắc agent dùng `manage_adr` khi chưa có ADR: memory tự bán hàng cho chính nó.

Sơ đồ tổng thể:

```
agent (MCP client) ──MCP/JSON-RPC──▶ codebase-memory-mcp (C thuần, 1 binary)
                                       │  tool: search_graph · trace_path
                                       │        get_architecture · detect_changes
                                       │        manage_adr · …
                                       ▼
             SQLite knowledge graph (~/.cache/codebase-memory-mcp/)
             nodes: Function/Class/Route…   edges: CALLS/IMPORTS/HTTP_CALLS…
                                       ▲
             watcher nền: poll git (HEAD move / dirty tree) → re-index phần đổi
```

## Chống stale: watcher coi git là chân lý

Cache memory nhanh hỏng: code đổi mỗi ngày, graph sinh hôm qua là sai hôm nay. Repo này xử lý bằng một watcher chạy nền — đọc trực tiếp header `src/watcher/watcher.h`:

```
Polls indexed projects for git changes (HEAD movement or dirty working tree)
and triggers re-indexing via a callback. Uses adaptive polling intervals
based on project size (5s base + 1s per 500 files, capped at 60s).
```

([nguồn](https://github.com/DeusData/codebase-memory-mcp/blob/161df2bdb1f4e28734f326a73f6e7989418f1288/src/watcher/watcher.h))

Ba chi tiết đáng học trong đoạn này. Một: nguồn thay đổi là git — HEAD dịch hoặc working tree dirty — không phải quét mtime từng file. Hai: interval thích ứng theo kích thước project, từ 5 giây tới trần 60 giây. Ba: baseline chỉ ghi khi re-index thành công — "a skipped or failed reindex keeps the change pending so it is retried, never silently lost" (#937, cùng file). Thất bại không xóa kiến thức cũ; nó hoãn cập nhật.

Kỷ luật còn rõ hơn ở nhánh dọn dẹp: khi project gốc biến mất, code phân loại errno trước khi prune — chỉ `ENOENT`/`ENOTDIR` mới được tính; `EACCES`, `EIO` hay macOS thu hồi quyền (TCC) thì không, vì như comment viết: "the cached DB holds user-authored data and is unrecoverable once pruned". Một lần lỗi permission tạm thời không được phép xóa memory của người dùng — đó là kỷ luật đáng copy cho bất kỳ hệ cache nào.

Nhánh re-index cũng chọn lọc thay vì vét cạn. Header `src/pipeline/pipeline_incremental.c` mô tả: "Compares file mtime+size against stored hashes to classify changed/unchanged" — xóa node của file đổi (edge cascade theo ràng buộc DB), parse lại riêng chúng qua các pass, rồi merge vào DB. Không full reindex chỉ vì vài file sửa.

## Memory đi theo repo: một file zstd thay cho reindex

Memory thường là chuyện cá nhân — cache nằm trong `~/.cache` của từng máy. Repo này đẩy nó thành tài sản team: "Commit a single compressed file to your repo and your teammates skip the reindex." (README, đọc ngày 2026-09-08). Artifact `.codebase-memory/graph.db.zst` là snapshot zstd của graph, hai tier: Best (`zstd -9`, strip index, `VACUUM INTO`) ghi khi index chủ động; Fast (`zstd -3`) ghi từ watcher cho cập nhật nhanh. Teammate clone về thì import artifact trước, rồi chạy incremental cho phần local diff — chi phí full index đầu tiên biến mất.

Điểm chịu thử nằm ở git. File nhị phân bị rewritten mỗi lần index, và git lưu mỗi lần một blob mới — README kể thẳng: "one team reached ~6 GB across ~350 commits of this single path", rồi khuyên chọn cadence (một release, một milestone, một job nightly) thay vì commit mỗi lần lưu; muốn theo mỗi commit thì lên Git LFS từ `.gitattributes` gốc. Còn conflict merge giữa hai nhánh cùng sửa artifact? Một dòng `merge=ours` tự sinh trong `.codebase-memory/.gitattributes` — file nhị phân không có merge hợp lý, nên ghi đè có kiểm soát là lựa chọn trung thực hơn.

Release cadence cũng nói lên mức sống của repo: release mới nhất là v0.10.8 ra ngày 2026-08-19, và sáu release liên tiếp từ 13 đến 19-08-2026 (theo GitHub API ngày 2026-09-08) — nhịp gần hằng ngày cho một dự án viết bằng C thuần.

## Wakii học được gì

- **ADOPT** — stamp freshness cho context pack. Context pack của story workflow sinh một lần ở epic rồi các SF kế thừa, nhưng pack không tự biết mình đã cũ khi nhánh đích nhích. Pattern của codebase-memory-mcp — baseline chỉ ghi khi rebuild thành công, và phải đối chiếu nguồn trước khi tin cache — áp được thành quy ước nhỏ: pack lưu kèm commit sha của nhánh đích lúc sinh; trước khi executor đọc pack, so sha, lệch thì yêu cầu re-sync thay vì tin mù. Đây là bản mở rộng của merge guard (`git merge-base --is-ancestor`) mà story FI-373 đã dùng cho nhánh đích, áp sang tài liệu.
- **DIRECTION** — repo map một lượt gọi. `get_architecture` trả về entry points, routes, hotspots, boundaries trong một call thay cho hàng chục lần grep — Phase 0 impact analyst của Wakii đang tự dò repo bằng grep và mở file; một bản đồ repo sinh sẵn kiểu này có thể làm input seed cho impact analysis. Chưa áp ngay vì cần chọn tool ngoài, chi phí duy trì index, và khớp output với format pack hiện có.
- **WATCH** — artifact nhị phân trong git. Hứa hẹn "clone là có memory" hấp dẫn cho các artifact sinh sẵn của Wakii (ví dụ research digest), nhưng chính README cảnh báo history phình 6 GB sau 350 commit — chỉ theo dõi cho tới khi có cadence commit rõ ràng. Cùng trạng thái với cơ chế install tự sửa config 45 client surface (theo README ngày 2026-09-08): Wakii theo nguyên tắc zero-setup idempotent không đụng config sẵn, nên chỉ quan sát cách họ quản lý xung đột config.

Memory trong workflow Wakii nằm ở chỗ khác: context pack, improvements-log ghi bài học có nguồn, và Linear làm external memory — [story workflow docs](/vi/docs/story-workflow/) mô tả nguyên tắc "analyze once, inherit many" hoạt động ra sao. Đọc thêm [skill story-workflow](/vi/blog/skill-story-workflow/) về kỹ năng điều phối và [Linear như external memory](/vi/blog/linear-as-external-memory/) về ghi nhớ qua issue. Nếu bạn đang để agent đọc code mỗi ngày, hãy tải Wakii, mở một story — và xem việc giữ ngữ cảnh giữa các phiên tiết kiệm được bao nhiêu lần hỏi lại.
