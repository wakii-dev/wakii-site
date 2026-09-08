# ADOPT draft — reject-reason log trong audit summary (camel-ai/camel)

> Draft theo rubric style-guide §10 (FI-383 D5) — SF-6 file tập trung sau
> review, label `enhancement` trên `wakii-dev/wakii`. KHÔNG tự file issue.

1. **Pattern**

   Mọi đầu ra do máy sinh phải qua bộ lọc công khai đặt trước kho, và mỗi lần
   bị chặn phải để lại log lý do đọc được. Học từ `camel-ai/camel`
   (17.685 sao, Apache-2.0, theo GitHub API ngày 2026-09-08):
   `SelfInstructPipeline` sinh instruction trong vòng lặp có filter-chain
   (length, keyword, punctuation, non_english, rouge_similarity) — instruction
   fail thì `logger.warning("Instruction failed filters. Skipping
   instruction: …")` rồi bỏ, dataset không chứa item nào chưa qua filter.

2. **Evidence inline**

   `camel/datagen/self_instruct/self_instruct.py` @ HEAD `8c791b7b9cf7`:

   ```python
   if self.instruction_filter.filter(prompt, instruction):
       ...
   else:
       logger.warning(
           f"Instruction failed filters. Skipping instruction: "
           f"{instruction}"
       )
   ```

   (theo GitHub API ngày 2026-09-08 — blob:
   `github.com/camel-ai/camel/blob/8c791b7b9cf7deab56cb5a92818c34499af9097f/camel/datagen/self_instruct/self_instruct.py`)
   Bài post sẽ live tại `/blog/deep-dive-camel-ai-camel/` sau khi story merge
   (build-in-public đã được user duyệt 2026-09-07).

3. **Đề xuất Wakii**

   Wakii đã áp phần "filter trước kho": convergence QA chỉ cho bài vào pool sau
   lint + audit machine gates. Completion đề xuất: **audit summary ghi
   reject-reason từng lượt** — khi một slug fail lint/audit, phần NOTE/SKIPPED
   liệt kê filter cụ thể bị chặn (band? marker? claims? parity?) thay vì chỉ
   đếm số. Kỳ vọng hành vi: chạy `audit-blog-convergence.mjs` thấy ngay "slug X
   skip vì Y", đỡ phải mở lint log riêng; rủi ro chính: summary dài hơn — giữ
   mỗi reject 1 dòng.

4. **Upstream links**

   - Repo: `github.com/camel-ai/camel` (Apache-2.0)
   - Code: `github.com/camel-ai/camel/blob/8c791b7b9cf7deab56cb5a92818c34499af9097f/camel/datagen/self_instruct/self_instruct.py`
   - README (Synthetic Datasets): `github.com/camel-ai/camel#synthetic-datasets`
