# ADOPT draft — crewAIInc/crewAI (batch-3, matrix #27, SF-4/FI-387)

> Draft theo rubric style-guide §10 — SF-6 file tập trung sau review, label
> `enhancement` trên wakii-dev/wakii. KHÔNG file issue từ SF.

## 1. Pattern

Declarative role cards: mỗi agent là dữ liệu khai báo — `role`/`goal`/
`backstory` là typed field của một Pydantic model — và được **nội suy đầu vào
từng run** trước khi vào prompt (crewAI giữ bản gốc `_original_*` rồi
`interpolate_only(...)` cho từng field). Học từ crewAIInc/crewAI (58.233 sao,
MIT — theo GitHub API ngày 2026-09-08). Wakii đã áp lớp nền của pattern này:
đội 9 agent khai báo theo bảng vai trong docs agents-and-kit, mỗi vai một việc
hẹp — đề xuất ở đây là lớp nội suy, chưa có.

## 2. Evidence inline

```python
role: str = Field(description="Role of the agent")
goal: str = Field(description="Objective of the agent")
backstory: str = Field(description="Backstory of the agent")
```

Và nội suy trước mỗi run (có lược bớt):

```python
self._original_role = self.role
...
self.role = interpolate_only(
    input_string=self._original_role, inputs=inputs
)
```

Trích `lib/crewai/src/crewai/agents/agent_builder/base_agent.py`, HEAD main
`34199c21b724d805608b59745cdb94006c8fdcd2`, đọc ngày 2026-09-08. Lớp `Agent`
cùng package cũng khai `guardrail` — "Function or string description of a
guardrail to validate agent output" — với `guardrail_max_retries` default 3
(`lib/crewai/src/crewai/agent/core.py`, cùng commit).

## 3. Đề xuất Wakii

- **Surface**: story-team-kit agent definitions (kit Wakii cài vào
  `~/.claude/`) + dispatch logic giữa các agent trong 1 story run.
- **Kỳ vọng hành vi**: role card nhận biến ngữ cảnh run (repo path, story/SF
  id, danh sách gates đang mở) qua placeholder nội suy tại lúc dispatch —
  agent thấy đúng bối cảnh mà dispatcher không phải chèn tự do vào prompt;
  role text vẫn diff được như dữ liệu thuần trong PR đổi kit.
- **Rủi ro chính**: role text động làm hành vi agent đổi theo input — cần
  fixture/snapshot test cho role card trước khi bật; drift khi kit re-sync
  (bài học batch-2: plan transcripts stale khi kit re-sync — executor phải
  re-run live).

## 4. Upstream links

- Repo: https://github.com/crewAIInc/crewAI (MIT, 58.233 sao — theo GitHub API
  ngày 2026-09-08)
- base_agent.py:
  https://github.com/crewAIInc/crewAI/blob/34199c21b724d805608b59745cdb94006c8fdcd2/lib/crewai/src/crewai/agents/agent_builder/base_agent.py
- agent/core.py:
  https://github.com/crewAIInc/crewAI/blob/34199c21b724d805608b59745cdb94006c8fdcd2/lib/crewai/src/crewai/agent/core.py
- README:
  https://github.com/crewAIInc/crewAI/blob/34199c21b724d805608b59745cdb94006c8fdcd2/README.md
- Bài sẽ live tại `/blog/deep-dive-crewaiinc-crewai/` (VI:
  `/vi/blog/deep-dive-crewaiinc-crewai/`) sau khi story merge (build-in-public
  đã được user duyệt 2026-09-07).
