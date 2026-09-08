---
title: "Aider: pair programming AI gắn vào git trong terminal"
description: "Aider biến mỗi thay đổi của AI thành commit git diff và revert được, nén cả codebase vào repo map khoảng 1.000 token và ép model trả code theo format cố định — ba cơ chế đáng học cho bất kỳ harness agent nào."
pubDate: "2026-10-08"
category: "tech"
tags: ["cli", "git", "agents"]
draft: false
---

Trước khi hàng chục agent coding sinh ra rồi biến mất, đã có aider: công cụ pair programming với LLM chạy thẳng trong terminal, vượt mốc 48.827 stars theo GitHub API ngày 2026-09-08. Repo này còn công bố một chỉ số hiếm tool nào dám ghi lên mặt chữ: badge "Singularity 88%" trên README — phần trăm code mới của release cuối được viết bởi chính aider. Nhưng lý do đáng đọc về aider hôm nay không phải vị thế, mà là cách repo thiết kế harness: aider không để model đụng vào codebase như khách lạ. Nó nhét toàn bộ vòng đời chỉnh sửa vào mô hình git mà dev nào cũng biết — commit, diff, undo.

TL;DR:

- Mỗi vòng edit của aider kết thúc bằng một commit riêng, message do LLM viết từ lịch sử chat, đánh dấu là commit của AI — diff và revert bằng git tool thường.
- Trước khi áp edit, aider commit trạng thái dở của file trước — vì lệnh /undo cần một điểm neo đã commit.
- Repo map nén cả codebase thành bản đồ khoảng 1.000 token: tree-sitter tags + PageRank, nghiêng về file bạn đang nhắc trong chat.
- Edit format (SEARCH/REPLACE block, udiff, whole file) là hợp đồng output ép model tuân theo, chọn theo sức của từng model.
- Nhịp phát triển đã chậm hẳn: release cuối tháng 08-2025, commit nhỏ cuối cùng 22-05-2026 (theo GitHub API ngày 2026-09-08).

## Mỗi thay đổi của AI là một commit riêng

Cơ chế trung tâm nằm trong `base_coder.py`: sau mỗi vòng chat, hàm `auto_commit` gom các file vừa bị model sửa và gọi `self.repo.commit(fnames=edited, context=context, aider_edits=True, coder=self)` — commit message do một LLM viết từ lịch sử hội thoại, còn cờ `aider_edits` đánh dấu đây là commit của AI, tách khỏi commit của người (xem [base_coder.py @ 5dc9490](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/coders/base_coder.py)).

Chi tiết hay hơn nằm ở phía trước lần edit đầu tiên. `check_for_dirty_commit` kiểm tra từng file sắp bị sửa: nếu file có thay đổi chưa commit, aider commit trạng thái cũ trước khi model đụng tay, kèm log "Committing <path> before applying edits." Lý do nằm ngay trong comment nguồn:

```python
def check_for_dirty_commit(self, path):
    ...
    if not self.repo.is_dirty(path):
        return
    # We need a committed copy of the file in order to /undo, so skip this
    ...
    self.io.tool_output(f"Committing {path} before applying edits.")
    self.need_commit_before_edits.add(path)
```

(aider/coders/base_coder.py, trích theo tree tại commit `5dc9490`, ngày probe 2026-09-08 — [link](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/coders/base_coder.py))

README tự tóm tắt đúng tinh thần này: "Aider automatically commits changes with sensible commit messages. Use familiar git tools to easily diff, manage and undo AI changes." (README của Aider-AI/aider, [nguồn](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/README.md)). Hợp đồng này đổi luôn câu hỏi review: thay vì hỏi "AI có sửa đúng không", bạn hỏi "AI đã sửa gì so với commit trước" — và `git diff` trả lời được, vì điểm neo đã tồn tại.

## Repo map: nén cả codebase còn khoảng 1.000 token

Context window hữu hạn, codebase thì không. Cách giải của aider là `RepoMap` — một class trong `repomap.py`, mặc định `map_tokens=1024`:

```text
các file nguồn
   |  tree-sitter tags (định nghĩa + tham chiếu)
   v
MultiDiGraph: file -> định nghĩa -> identifier
   |  personalization: file được nhắc trong chat được cộng trọng số
   v
nx.pagerank(G, weight="weight")
   |  cắt theo map_tokens (mặc định 1024)
   v
repo map ghép vào prompt
```

Dòng quyết định xếp hạng:

```python
ranked = nx.pagerank(G, weight="weight", **pers_args)
```

(aider/repomap.py, trích theo tree tại commit `5dc9490` — [link](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/repomap.py))

Ba chi tiết đáng chú ý. Một: tags đến từ tree-sitter qua thư viện grep-ast, cache trên đĩa ở `.aider.tags.cache.v4` nên lần chạy sau không quét lại từ đầu. Hai: graph có hướng — định nghĩa trỏ tới identifier nó dùng, nên file được nhiều file quan trọng tham chiếu sẽ nổi lên trên bản đồ. Ba: `pers_args` là personalization — file xuất hiện trong hội thoại hoặc trùng identifier được nhắc nhận trọng số khởi đầu cao hơn, bản đồ nghiêng về phía bạn đang làm. Ngữ cảnh, theo cách aider, không phải là đổ cả repo vào prompt mà là một bảng xếp hạng có tín hiệu từ chat hiện tại.

## Edit format là hợp đồng output của model

Aider không để model tự do chọn cách trả code. Mỗi cách trả là một class riêng trong `aider/coders/`: `editblock_coder.py` (SEARCH/REPLACE block), `wholefile_coder.py` (viết lại cả file), `udiff_coder.py` (unified diff), `patch_coder.py`, và `architect_coder.py` — mô hình hai bước, một model đề xuất hướng sửa, model khác viết code. Prompt của format phổ biến nhất nói thẳng yêu cầu:

"All changes to files must use this *SEARCH/REPLACE block* format. ONLY EVER RETURN CODE IN A *SEARCH/REPLACE BLOCK*!" — prompt của aider trong `editblock_prompts.py` ([nguồn](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/coders/editblock_prompts.py)).

Ví dụ format nằm ngay trong prompt đó:

```text
mathweb/flask/app.py
<<<<<<< SEARCH
from flask import Flask
=======
import math
from flask import Flask
>>>>>>> REPLACE
```

(trích `example_messages` trong editblock_prompts.py tại commit `5dc9490` — [link](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/coders/editblock_prompts.py))

Phần biến text thành edit thật nằm ở `search_replace.py` và hàm `apply_edits` trong `base_coder.py`. Điểm đáng học ở tầng thiết kế: output format là API surface của model. Model nào yếu theo format nào thì đổi format cho model đó — toàn bộ hệ sinh thái coder class tồn tại để phục vụ chuyện đó, thay vì đổ lỗi cho model "hay quên format".

## Cadence thật: chậm hẳn từ cuối 2025

Số liệu theo GitHub API ngày 2026-09-08: 48.827 stars, 4.933 forks, license Apache-2.0, archived false. Sáu release gần nhất:

| Release | Phát hành (UTC) |
|---------|-----------------|
| v0.86.0 | 2025-08-09 |
| v0.85.0 | 2025-06-27 |
| v0.84.0 | 2025-05-30 |
| v0.83.0 | 2025-05-09 |
| v0.82.0 | 2025-04-14 |
| v0.81.0 | 2025-04-04 |

(nguồn: GitHub API `repos/Aider-AI/aider/releases`, ngày probe 2026-09-08)

Nhịp khá đều, khoảng một release mỗi tháng từ tháng 04 tới tháng 08-2025 — rồi dừng. Tính tới ngày probe, đã 13 tháng không có release nào. Branch chính vẫn thở, nhưng bằng hơi thở bảo trì: 5 commit gần nhất rơi trong cửa sổ 2026-04-23 tới 2026-05-22, toàn PR nhỏ — thêm tree-sitter tags cho bash phục vụ repo map, mở rộng danh sách model Anthropic (theo GitHub API ngày 2026-09-08).

Đây là fact cần nói thẳng khi học từ repo: 48.827 stars không tự động đồng nghĩa với maintained. Trước khi lấy một repo làm chuẩn tham chiếu, kiểm tra ngày push gần nhất cạnh số stars — trường hợp của aider là minh chứng: kiến trúc vẫn đáng học, nhưng trạng thái phát triển phải đọc từ lịch sử commit, không phải từ độ nổi tiếng.

## Wakii học được gì

- **ADOPT** — Snapshot-commit trước khi agent áp edit vào worktree có sẵn thay đổi. Evidence là `check_for_dirty_commit` ở section một: aider neo điểm /undo bằng commit trước khi model đụng tay. Docs của Wakii ghi task-executor "commits atomically" trong worktree riêng, nhưng chưa nêu cơ chế snapshot các thay đổi dở có sẵn trước edit đầu tiên; đề xuất cụ thể: executor mở task bằng một snapshot-commit có nhãn máy đọc được nếu worktree đang dirty, để rollback-fixer revert đúng phạm vi theo nhãn thay vì đếm commit thủ công. Nhược điểm là thêm commit nhiễu lịch sử — nhịp convergence của Wakii, mọi SF hội về một nhánh đích và một PR mỗi story như bài [one destination branch, one PR](/vi/blog/one-branch-one-pr/), đã hấp thụ được phần nhiễu đó.
- **DIRECTION** — Repo map tính được ở section hai: phase0-impact-analyst hiện dựng touch map bằng cách đọc code; một bản đồ kiểu PageRank có personalization sẽ cho điểm khởi đầu có thứ hạng khi đụng repo lạ. Chưa áp ngay vì context pack viết tay ở epic level — analyze once, inherit many theo [story workflow](/vi/docs/story-workflow/) — đã phủ case chính, còn map thuật toán cần đầu tư cache và parser theo từng ngôn ngữ như aider đã làm.
- **WATCH** — Edit format như hợp đồng riêng theo model ở section ba: harness của Wakii đã ép output vào cấu trúc máy đọc được ở tầng workflow (gate dạng choice/free-text, lint machine-check), còn aider chọn format ở tầng nội dung code model phát ra. Điều kiện đổi grade: khi Wakii chạy executor trên model không theo tool-call chuẩn, lúc đó học cách aider ép format và xử lý lỗi format.

Ba cơ chế của aider — commit làm điểm neo, ngữ cảnh làm bảng xếp hạng, output làm hợp đồng — chung một nguyên tắc: đặt rào ở nơi model không thể tự vượt.

Muốn thấy tư duy guardrail tương tự vận hành trên một sản phẩm thật — gate, watchdog, review độc lập — bắt đầu từ [getting started](/vi/docs/getting-started/). Wakii là agentic IDE với một đội superpowers có sẵn: tải về, để agent chạy trong rào, bạn giữ quyền quyết.
