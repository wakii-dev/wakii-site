# ADOPT draft — FoundationAgents/MetaGPT (batch-3, matrix #25, SF-4/FI-387)

> Draft theo style-guide §10 — SF-6 file tập trung sau review (KHÔNG tự file
> issue từ SF). Grade nguồn: bài `deep-dive-foundationagents-metagpt` section
> "Wakii học được gì".

## 1. Pattern

**Handoff giữa các vai qua artifact có cấu trúc, schema của artifact là code.**
MetaGPT (70.263 stars, MIT, theo GitHub API ngày 2026-09-08) mô phỏng công ty
phần mềm theo triết lý `Code = SOP(Team)`: mỗi vai (PM, architect, project
manager, engineer, QA) xuất đúng một loại artifact, và từng trường của artifact
được khai báo kiểu + instruction + ví dụ bằng ActionNode — vai sau tiêu thụ
message theo kiểu (subscribe), không chat tự do với vai trước.

## 2. Evidence inline

Trích ActionNode — schema khai kiểu cho từng trường PRD, từ
`metagpt/actions/write_prd_an.py` @ commit `11cdf466d042aece04fc6cfd13b28e1a70341b1f`:

```python
PRODUCT_GOALS = ActionNode(
    key="Product Goals",
    expected_type=List[str],
    instruction="Provide up to three clear, orthogonal product goals.",
    example=[
        "Create an engaging user experience",
        "Improve accessibility, be responsive",
        "More beautiful UI",
    ],
)
```

- Nguồn: theo GitHub API ngày 2026-09-08 —
  https://github.com/FoundationAgents/MetaGPT/blob/11cdf466d042aece04fc6cfd13b28e1a70341b1f/metagpt/actions/write_prd_an.py
- Bổ sung: cơ chế subscribe ở `metagpt/roles/product_manager.py` @ cùng commit —
  `self._watch([UserRequirement, PrepareDocuments])` — vai nhận việc theo kiểu
  message: https://github.com/FoundationAgents/MetaGPT/blob/11cdf466d042aece04fc6cfd13b28e1a70341b1f/metagpt/roles/product_manager.py
- Triết lý README: "It provides the entire process of a software company along
  with carefully orchestrated SOPs" — https://github.com/FoundationAgents/MetaGPT

## 3. Đề xuất Wakii

- **Surface áp dụng:** chuỗi handoff spec → plan → task giữa 9 agents của
  story-workflow. Wakii ĐÃ áp cùng nguyên tắc ở tầng quy trình (agent sau chỉ
  tiêu thụ artifact của agent trước, có critic kiểm biên); draft này củng cố
  nguyên tắc, không phải cơ chế mới.
- **Đề xuất tiếp theo:** schema hoá từng trường then chốt của spec/plan như
  ActionNode — thêm trường máy-parse được (kiểu + ví dụ) cho các mục quan
  trọng trong template, để spec-critic/plan-critic nhận input đồng nhất thay
  vì văn xuôi tự do. Kỳ vọng hành vi: critic check được cấu trúc từng mục
  trước khi đọc nội dung; rủi ro chính là schema cứng quá làm mất linh hoạt
  của spec dạng văn — chỉ schema hoá mục ổn định (ví dụ: tier map, danh sách
  acceptance criteria).
- **Lưu ý phụ:** khung gốc đã chậm (release cuối 2025-03-09, commit cuối
  2026-01-21, theo GitHub API ngày 2026-09-08) — pattern học được, không
  phụ thuộc framework.

## 4. Upstream links

- Repo: https://github.com/FoundationAgents/MetaGPT
- Commit đọc code: https://github.com/FoundationAgents/MetaGPT/commit/11cdf466d042aece04fc6cfd13b28e1a70341b1f
- `write_prd_an.py`: https://github.com/FoundationAgents/MetaGPT/blob/11cdf466d042aece04fc6cfd13b28e1a70341b1f/metagpt/actions/write_prd_an.py
- `product_manager.py`: https://github.com/FoundationAgents/MetaGPT/blob/11cdf466d042aece04fc6cfd13b28e1a70341b1f/metagpt/roles/product_manager.py
- Blog post public (sau khi story merge): `/blog/deep-dive-foundationagents-metagpt/`
