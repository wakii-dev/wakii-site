---
title: "Skill /graph-engineering: hệ thống phức tạp thành đồ thị"
description: "Graph engineering gồm hai nửa: knowledge graph trả lời agent nhớ gì, task graph trả lời agent phối hợp thế nào — đi qua pipeline 9 stage, diamond pattern, và đọc đội 9 agent của kit như một task graph đang chạy thật."
pubDate: "2026-09-14"
category: "tech"
tags: ["skills", "architecture", "design"]
draft: false
---

Agent có hai điểm yếu kinh điển: quên thế giới của bạn ngay ngoài cửa sổ ngữ cảnh, và lúng túng khi việc lớn phải chia nhiều tay. Hai vấn đề nghe như một nhưng khác loại, và giải bằng hai cấu trúc dữ liệu khác nhau. Skill `/graph-engineering` của kit Wakii mở đầu đúng bằng sự phân biệt đó: knowledge graph cho câu hỏi "agent nhớ gì", task graph cho câu hỏi "agent phối hợp thế nào". Bài này đi qua hai nửa theo đúng thứ tự skill dạy, rồi đọc ngược một story thật để thấy nửa thứ hai không phải lý thuyết.

TL;DR:

- Graph engineering là môn thiết kế cấu trúc agent làm việc qua, không phải môn viết prompt: một nửa bộ nhớ, một nửa điều phối.
- Nửa knowledge là pipeline 9 stage: ontology trước khi trích xuất, fusion trước khi lưu, serve cho LLM ở cuối. Hai stage cấm bỏ: ontology và fusion.
- Nửa task là DAG: việc độc lập chạy song song theo hình thoi (diamond), verifier ở context riêng, human gate đặt ở cạnh khó hoàn tác.
- Đội 9 agent của kit là một task graph chạy thật; story FI-359 của site này để lại 5 plan file — 5 node của một diamond.

## Hai loại đồ thị, hai câu hỏi khác nhau

Skill định nghĩa hai nửa bằng một cặp định nghĩa đối xứng. Knowledge graph: node là thực thể và sự kiện, cạnh là quan hệ mang thời gian và nguồn gốc (provenance). Task graph: node là việc, cạnh là phụ thuộc thực thi. Cùng chữ "graph", hai câu hỏi khác loại: truy nhiều bước qua mối quan hệ, và sắp việc — cái gì song song, cái gì chặn.

```ascii
  KNOWLEDGE GRAPH: nhớ gì?              TASK GRAPH: phối hợp thế nào?
  node = thực thể, sự kiện              node = job (việc giao một tay)
  edge = quan hệ (động từ)              edge = phụ thuộc thực thi
         + thời gian + nguồn gốc

  (B)─[MUA VÀO, 2024]→(A)              plan ─┬→ worker 1 ─┐
  (C)─[LÀM VIỆC VỚI]→(A)                     ├→ worker 2 ─┼→ verify → merge
                                             └→ worker 3 ─┘
  câu hỏi: truy nhiều bước              câu hỏi: ai chặn ai,
  (multi-hop) qua các mối quan hệ                cái gì chạy song song
```

*Nguồn: dựng theo định nghĩa hai nửa trong ~/.claude/skills/graph-engineering/SKILL.md và references/task-graphs.md, lấy 2026-09-08.*

Nhầm hai loại là chọn sai công cụ: lịch sử hội thoại nhét vào database đồ thị không giải được bài toán phối hợp, nhiều agent không tự sinh ra bộ nhớ dài hạn.

## Nửa knowledge: ontology trước, trích xuất sau

Trích nguyên văn mô hình trung tâm: knowledge graph là "a product with a schema, not a pile of triples" — chất lượng đến từ thứ tự pipeline. Pipeline 9 stage:

| Stage | Làm gì |
|---|---|
| 1. Scope & value test | Đồ thị có đáng hơn bảng không — tra một bước thì dừng |
| 2. Hình thức biểu diễn | Property graph, RDF, hay typed edges trong JSON |
| 3. Ontology | Loại thực thể + loại quan hệ, đặt trước khi trích xuất |
| 4. Trích xuất thực thể | Từ điển hoặc LLM kèm ontology trong prompt |
| 5. Trích xuất quan hệ | Chặn cạnh hai đầu sai kiểu (domain/range) |
| 6. Trích xuất sự kiện | Sự kiện là node hạng nhất, mang thời gian |
| 7. Quality gate | Precision từ 90% trên mẫu 50 mục trước khi fuse |
| 8. Fusion | Gộp trùng thực thể: "SEU" = "Southeast University" |
| 9. Serve cho LLM | GraphRAG, graph-as-memory, suy luận trên đường đi |

*Nguồn: bảng rút từ mục "The 9-Stage Pipeline" trong ~/.claude/skills/graph-engineering/SKILL.md, lấy 2026-09-08.*

Hai stage skill cấm bỏ là 3 và 8 — nguyên văn: "they are where real-world graphs fail". Ontology bắt đầu tối giản: 5-15 loại thực thể, 10-30 loại quan hệ, mỗi quan hệ một động từ chính xác (`ACQUIRED` thay vì `RELATED_TO`). Fusion gộp các dạng tên khác của cùng một thực thể — bỏ nó là nguyên nhân số một của đồ thị vô dụng. Kèm quy tắc provenance: mỗi node và cạnh lưu nguồn, thời điểm trích, độ tin. Đến stage 9, đồ thị thành context cho agent: GraphRAG kéo subgraph vào prompt, graph-as-memory cho agent ghi fact ngược trở lại.

Một chi tiết dễ bỏ sót: skill có teaching mode — khi muốn học thay vì xây, nó dạy theo pipeline, mỗi stage neo vào domain bạn đưa ra, kèm bài tập và diagram tự sinh (mermaid, một trang HTML), vì "concepts in this discipline are shapes; show them".

## Nửa task: tách verifier, đặt gate đúng chỗ

Nửa task nằm trong một reference file riêng. Node là job; chỉ vẽ cạnh khi việc sau cần kết quả việc trước. Đây là DAG — pattern hạ tầng dữ liệu dùng hàng chục năm, giờ áp cho agent. Bước tối ưu đầu tiên: soi từng "and then"; bước sau không đọc kết quả bước trước là cạnh giả — xoá đi, hai việc chạy song song.

Hình dáng mà reference gọi là "the shape serious systems converge to":

```ascii
        ┌─ worker 1 ─┐
plan ───┼─ worker 2 ─┼─→ verify ─→ merge ─→ result
        └─ worker 3 ─┘
```

*Nguồn: mục "The diamond pattern", ~/.claude/skills/graph-engineering/references/task-graphs.md, lấy 2026-09-08.*

Verify node không phải tùy chọn: "a model grading its own work in its own context misses most of its own mistakes". Reference trích nghiên cứu Google DeepMind × MIT (180 cấu hình có kiểm soát): đội phối hợp thắng agent đơn lẻ khoảng 80% trên việc tách được thành mảnh; mọi cấu hình nhiều agent thua trên việc tuần tự, giảm 39-70%; agent không phối hợp khuếch đại lỗi 17.2 lần, một coordinator nắm merge hạ còn 4.4 lần. Kết luận: "More agents is not a strategy. The shape of the work decides."

Con người cũng là một node — qua human gate, đặt ở cạnh khó hoàn tác (gửi, công bố, xoá, deploy) chứ không ở mọi bước: "A gate on everything makes the human the bottleneck; a gate on nothing means nobody is watching." Bốn guardrail caps khép lại: trần round cho vòng lặp, một writer mỗi file, routing viết ra văn bản, trần cứng số agent.

## Task graph trong đời thật: một story và đội chín agent

Đọc đội 9 agent của kit theo đúng khung đồ thị trên — chỉ giữ khung, không giảng lại vai từng người:

| Khung task graph | Ở đội Wakii | Mô tả docs |
|---|---|---|
| worker node | task-executor | "Implements tasks in isolated worktrees, commits atomically" |
| verify node, context riêng | code-reviewer, verifier | "Independent pass/fail verdict on the finished work — self-reports don't count" |
| node soi chính cái đồ thị | plan-critic | "Adversarial review of the plan and its task dependency graph" |
| human gate | designer | "Produces high-fidelity design drafts for user review before UI gets built" |
| cạnh quay ngược an toàn | rollback-fixer | "Reverts safely to the last known-good state when something diverges" |

*Nguồn: bảng rút từ src/content/docs/en/agents-and-kit.md §"The 9-agent story team", lấy 2026-09-08.*

Gates B0–B5 của story workflow là các human gate của pipeline (docs story-workflow): duyệt trước khi có code, duyệt trước khi merge — đúng quy tắc đặt gate ở điểm đắt hoàn tác.

Ví dụ DAG thật gần nhất: story FI-359 — 20 bài blog longform của site này — chia 5 SF để lại 5 plan file trong `docs/superpowers/plans/`. SF-1 dựng kit editorial; ba series A/B/C là ba nhánh worker tiêu thụ đúng kit đó; SF-5 convergence QA audit toàn bộ, đứng sau tất cả:

```ascii
FI-359 — 5 plan file, một diamond

  sf1 editorial foundation ──┬→ sf2 series A ─┐
                             ├→ sf3 series B ─┼→ sf5 convergence QA
                             └→ sf4 series C ─┘   (verify + merge)

  mỗi SF = một plan file + một worktree riêng
```

*Nguồn: 5 file FI-359 trong docs/superpowers/plans/ (tổng thư mục có nhiều hơn), cả năm đều mang số Linear (FI-360…FI-364) — FI-362 và FI-363 nằm ngay trong tên file, lấy 2026-09-08.*

Đội chín agent đến từ đâu, kit tự cài thế nào: docs [agents & kit](/vi/docs/agents-and-kit/). Muốn đọc chín vai ở góc quyền hạn, bài [Chín agent, quyền hạn tách rời](/vi/blog/nine-agents-separated-powers/) đã mổ xẻ; toàn cảnh catalog kỹ năng có trong [bài tour kỹ năng](/vi/blog/skills-catalog-tour/); cách plan file viết cho người không có ngữ cảnh nằm ở [bài viết plan cho Linear](/vi/blog/skill-writing-plans-linear/).

Skill `/graph-engineering` đi kèm kit Wakii, đọc được nguyên văn trong source. Muốn học nửa knowledge, bảo agent dạy theo pipeline với domain của bạn làm ví dụ; muốn thiết kế nửa task, vẽ hình thoi với việc của bạn làm node. Wakii là IDE agentic với đội superpowers dựng sẵn — tải về và để đồ thị làm phần việc của nó.
