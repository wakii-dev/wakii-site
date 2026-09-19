# Digest 2026-09-19 — Graph memory cho agentic systems (KG + GraphRAG + task graph)

Retrieval date: 2026-09-19 (số liệu lấy trực tiếp qua `gh api`/`gh search` tại thời điểm viết).

## Bảng stars — graph memory layer cho AI agents

| Stars | Repo | Tạo | Push | Là gì |
|---|---|---|---|---|
| 65,633 | mem0ai/mem0 | 2023-06-20 | 2026-09-19 | Memory layer drop-in: pipeline 2 pha (extract → LLM quyết ADD/UPDATE/DELETE) |
| 36,029 | microsoft/graphrag | 2024-03-27 | 2026-09-19 | Graph RAG: community detection (Leiden) → tóm tắt phân cấp → local/global search |
| 31,003 | GetZep/graphiti | 2024-08-08 | 2026-09-19 | **Temporal KG real-time cho agents**: edge có valid_at/invalid_at, update tăng dần không batch |
| 30,836 | topoteretes/cognee | 2023-08-16 | 2026-09-19 | AI memory platform: pipeline ECL (Extract-Cognify-Load) vào graph+vector |
| 24,797 | letta-ai/letta | 2023-10-11 | 2026-09-10 | Stateful agents: memory blocks agent tự sửa (self-editing tiers) |
| 4,015 | OSU-NLP-Group/HippoRAG | 2024-05-23 | 2026-09-03 | NeurIPS'24 — retrieval đa bước qua KG bằng Personalized PageRank |

## Cadence

- mem0: **3 release trong 1 ngày 18/09** (v2.1.0, vercel-ai-v3.0.3, ts-v3.2.0) — đa SDK
- graphiti: v0.30.2 (08/09), v0.30.0 (01/09), mcp-v1.1.0 (01/09) — **ship MCP server riêng**
- graphrag, cognee: push cả 19/09

## 4 pattern kiến trúc đáng học (theo đúng 4 gap của Wakii)

1. **Serving/retrieval** — graphiti: hybrid search (semantic + keyword + graph traversal);
   graphrag: community summaries (nén cluster thành context ngắn); HippoRAG: PageRank
   đa bước. Điểm chung: **memory chỉ có giá trị khi được inject vào context đúng lúc**.
2. **Auto-extraction** — mem0 pipeline 2 pha: phase 1 extract candidate từ hội thoại/sự kiện,
   phase 2 LLM quyết ADD/UPDATE/DELETE **có kiểm soát** — đúng doctrine "LLM propose,
   validator chấm".
3. **Temporal validity + fusion** — graphiti: facts mâu thuẫn không bị XOÁ mà bị
   **invalid_at** (append-only, provenance giữ nguyên); sự thật có thời hạn thay vì
   có/không.
4. **Self-editing memory** — letta: agent tự sửa memory blocks của chính nó. Ngược
   doctrine validator-first — nguy hiểm khi không có fuse gate.

## Post angles

1. **"65k★ memory layer vs 1.362 dòng markdown"** — Wakii chạy KG markdown-native
   (1 dòng = 1 record, git-versioned) cạnh các khổng lồ Neo4j-first; bài học: storage
   engine không quan trọng bằng serving discipline. Nối chuỗi landscape digest 18/09.
2. **"Temporal KG: sự thật có hạn sử dụng"** — graphiti invalid_at vs triples.md
   tĩnh của Wakii; pattern áp cho cả task graph (claim hết TTL). Evidence: graphiti
   README + docs, retrieval 2026-09-19.
3. **"Memory layer là hạ tầng, không phải tính năng"** — mem0/graphiti/cognee/letta
   4 repo ~150k★ tổng cùng làm một thứ: state cho agents. Wakii đã có 4/4 mảnh
   (ontology/entities/triples/provenance) mà không gọi nó là "memory product".
