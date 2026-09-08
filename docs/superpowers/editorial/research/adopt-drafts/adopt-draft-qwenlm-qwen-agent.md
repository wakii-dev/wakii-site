# ADOPT draft — catalog tự khai chặn trùng tên lúc đăng ký (từ QwenLM/Qwen-Agent)

> Draft theo rubric style-guide §10 (FI-383 D5) — SF-4/FI-387 soạn, SF-6 file
> tập trung sau review. KHÔNG tự file issue.

## 1. Pattern

Catalog khai báo tường minh mà chặn xung đột ngay lúc đăng ký: tên trùng
sinh lỗi cứng thay vì ghi đè im lặng, schema kiểm trước khi vào registry.
Học từ **QwenLM/Qwen-Agent** (~17,076 star, Apache-2.0, theo GitHub API
ngày 2026-09-08).

## 2. Evidence inline

`register_tool` trong `qwen_agent/tools/base.py` (HEAD main
`31a4d36d1236`, ngày 2026-09-08):

```python
if name in TOOL_REGISTRY:
    if allow_overwrite:
        logger.warning(f'Tool `{name}` already exists! Overwriting with class {cls}.')
    else:
        raise ValueError(f'Tool `{name}` already exists! Please ensure that the tool name is unique.')
cls.name = name
TOOL_REGISTRY[name] = cls
```

Trùng tên mà không bật `allow_overwrite` tường minh → ValueError ngay lúc
đăng ký; `is_tool_schema` kiểm schema `{name, description, parameters}`
theo shape OpenAI trước khi tool vào registry. Link: phần "Catalog tool
tự khai" của bài deep-dive — sẽ live tại `/blog/deep-dive-qwenlm-qwen-agent/`
sau khi story merge.

## 3. Đề xuất Wakii

- **Surface:** skills catalog của Wakii (bối cảnh: bài skills catalog tour
  đã live tại `/blog/skills-catalog-tour/`).
- **Hành vi kỳ vọng:** khi nạp catalog (lúc build/lint), hai skill trùng
  id → FAIL cứng kèm tên id, không nuốt, không ghi đè, không render
  nhầm. Hiện catalog là mảng khai báo tường minh — kiểm trùng id là mở
  rộng nhỏ: một assert/lint pass, không đổi schema skill.
- **Rủi ro chính:** gần như không có hành vi runtime thay đổi; rủi ro
  duy nhất là FAIL mới xuất hiện nếu thật sự tồn tại id trùng trong dữ
  liệu hiện tại — cần chạy 1 lần để xác nhận sạch trước khi bật fail cứng.

## 4. Upstream links

- Repo: https://github.com/QwenLM/Qwen-Agent (Apache-2.0)
- Code: https://github.com/QwenLM/Qwen-Agent/blob/31a4d36d123688581a9e9744427272b33ce940e0/qwen_agent/tools/base.py
- README (mục FAQ + News): https://github.com/QwenLM/Qwen-Agent#readme
