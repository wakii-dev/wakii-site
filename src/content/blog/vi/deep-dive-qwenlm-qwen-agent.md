---
title: "Qwen-Agent: agent gắn chặt hệ Qwen — khi coupling là tính năng"
description: "Qwen-Agent không hỗ trợ mọi model mà gắn chặt một hệ Qwen: template tool-call khớp format từng model, catalog tool tự khai chặn trùng tên, và làm backend thật của Qwen Chat. Bài học về việc coupling khi nào là tính năng."
pubDate: "2026-10-17"
category: "tech"
tags: ["agents", "oss"]
draft: false
---

Phần lớn framework agent tranh nhau giúp bạn đổi model bằng một dòng config. QwenLM/Qwen-Agent chọn chiều ngược lại: framework chỉ phục một họ model, gắn chặt từ format tool-call tới từng ví dụ chạy. Cược đó không nhỏ — repo ~17 nghìn star (theo GitHub API ngày 2026-09-08) và tự nhận là backend đang chạy thật của Qwen Chat. Bài này mổ cơ chế gắn chặt đó: nó nằm ở dòng code nào, mua được gì, và nên đọc số tự khai của loại repo này ra sao.

TL;DR:

- Qwen-Agent là framework cho hệ Qwen, và theo README, là backend của Qwen Chat — coupling với stack là quyết định sản phẩm, không phải hạn chế kỹ thuật.
- Tool call xử lý bằng text template khớp format từng model: hai template sẵn có, mặc định `nous`, chọn qua config; muốn nhường parse cho server thì bật `use_raw_api`.
- Catalog tool tự khai: decorator `register_tool` chặn trùng tên bằng lỗi cứng, schema kiểm trước khi vào registry.
- Số tự khai đọc được nếu đọc kèm nguồn: claim 1M-token của RAG đi kèm blog benchmark riêng; nhiệt độ repo đo bằng `pushed_at` — lần cuối 2026-03-04.

## Gắn chặt một hệ model là thiết kế, không phải giới hạn

README mô tả thẳng: Qwen-Agent là "framework for developing LLM applications based on the instruction following, tool usage, planning, and memory capabilities of Qwen" (README của repo, truy ngày 2026-09-08). Câu sau còn rõ: "Now Qwen-Agent plays as the backend of Qwen Chat." Framework không phải demo treo cạnh sản phẩm — nó là sản phẩm, chạy sau chat.qwen.ai.

Cách repo theo model cũng nói lên điều đó: mỗi dòng model Qwen mới ra là một ví dụ chạy mới trong repo.

```
2025-03  QwQ-32B — parallel, multi-step, multi-turn tool calls
2025-05  Qwen3 demo + MCP cookbooks
2025-07  Qwen3-Coder demo + tool call qua API native (parser vLLM)
2025-09  Qwen3-VL — zoom ảnh, image search, web search
2026-02  Qwen3.5 — examples/assistant_qwen3.5.py
```

(Trích mục News của README, đọc ngày 2026-09-08.)

Framework đi theo model, không phải model phải chờ framework bắt kịp. Với một repo độc lập, nhịp đuổi trend này đáng lo; với backend thật của một hệ chat đang chạy, đây là mặt trước của việc cải tiến agent mỗi khi có model mới.

## Tool call là format của model, framework replay đúng shape đó

Phần đáng học nhất nằm ở `qwen_agent/llm/function_calling.py`. Qwen-Agent không coi function calling là hộp đen của API: lịch sử hội thoại chứa tool-call được viết lại thành plaintext đúng format mà chat-template của model được train. Template chọn theo cấu hình:

```python
fncall_prompt_type = self.generate_cfg.get('fncall_prompt_type', 'nous')
if fncall_prompt_type == 'qwen':
    self.fncall_prompt = QwenFnCallPrompt()
elif fncall_prompt_type == 'nous':
    self.fncall_prompt = NousFnCallPrompt()
```

(Mạch chọn template — `function_calling.py` @ [commit 31a4d36](https://github.com/QwenLM/Qwen-Agent/blob/31a4d36d123688581a9e9744427272b33ce940e0/qwen_agent/llm/function_calling.py).)

Mặc định là `nous` — `NousFnCallPrompt` serialize lịch sử tool-call thành thẻ văn bản:

```python
fc = {'name': fn_call.name, 'arguments': arguments}
fc = json.dumps(fc, ensure_ascii=False)
fc = f'<tool_call>\n{fc}\n</tool_call>'
```

(`NousFnCallPrompt.preprocess_fncall_messages` @ [nous_fncall_prompt.py](https://github.com/QwenLM/Qwen-Agent/blob/31a4d36d123688581a9e9744427272b33ce940e0/qwen_agent/llm/fncall_prompts/nous_fncall_prompt.py).)

Vì sao phiền vậy? Vì format tool-call sống trong chat-template của model, không sống trong API. Model Qwen được train với thẻ `<tool_call>` trong ngữ cảnh; nếu lịch sử hồi đáp theo shape khác, model mất gốc. Muốn nhường chuyện parse cho server, README ghi khuyến nghị riêng từng dòng model:

| Dòng model (FAQ README) | Khuyến nghị parse |
| --- | --- |
| Qwen3, QwQ-32B | Qwen-Agent tự parse; không bật parser vLLM |
| Qwen3-Coder | bật parser vLLM + `use_raw_api: True` |

Cả hai đường đều là quyết định format-fit — chỉ khác chỗ parse sống: trong framework hay trong server.

## Catalog tool tự khai: trùng tên là lỗi, không là ghi đè

Tool khai báo bằng decorator và dồn về một registry chung trong `qwen_agent/tools/base.py`:

```python
if name in TOOL_REGISTRY:
    if allow_overwrite:
        logger.warning(f'Tool `{name}` already exists! Overwriting with class {cls}.')
    else:
        raise ValueError(f'Tool `{name}` already exists! Please ensure that the tool name is unique.')
cls.name = name
TOOL_REGISTRY[name] = cls
```

(`register_tool` @ [tools/base.py](https://github.com/QwenLM/Qwen-Agent/blob/31a4d36d123688581a9e9744427272b33ce940e0/qwen_agent/tools/base.py).)

Trùng tên mà không bật `allow_overwrite` tường minh thì nổ ngay lúc đăng ký — lỗi hiện ở chỗ khai báo, không lùi xuống lúc chạy. Trước khi vào registry, `is_tool_schema` kiểm schema theo đúng shape OpenAI: `{name, description, parameters}`.

Kho tool built-in phủ đúng nhu cầu một assistant đọc tài liệu và chạy code: `code_interpreter`, `python_executor`, `web_search`, `web_extractor`, `doc_parser`, `retrieval`, `image_search`. Tool ngoài hệ Qwen nối qua `mcp_manager` — MCP là cửa mở, còn tool cốt lõi là hàng nội bộ của stack.

Cách "catalog khai báo tường minh, chặn xung đột sớm" này gần với cách Wakii quản skills catalog — đã mổ kỹ trong [skills catalog tour](/vi/blog/skills-catalog-tour/).

## Đọc số tự khai: 1M-token và nhiệt độ repo

README tự khai về scale một cách có kiểm soát: giải pháp RAG nhanh của họ và agent QA tài liệu song song "perform perfectly in the single-needle 'needle-in-the-haystack' pressure test involving 1M-token contexts" (FAQ README, truy 2026-09-08). Claim đi kèm blog kỹ thuật riêng (qwenlm.github.io/blog/qwen-agent-2405/) — là số dự án tự đo, kèm phương pháp để bạn tự kiểm, không phải số độc lập. Ghi nhận ở mức đó, không hơn.

Nhiệt độ repo thì đo được khách quan hơn. Release dừng ở v0.0.26 (2025-05-29); 10 release gần nhất dồn trong 2025-03-18 đến 2025-05-29 (theo GitHub API ngày 2026-09-08). Nhưng lần push lên main là 2026-03-04 — phát triển đi qua main, release chỉ là mốc cũ. Đo "repo còn sống" bằng nhịp release sẽ chấm sai repo này.

Một chi tiết tự nhận đáng giá khác: code interpreter chạy trong Docker, và disclaimer của README thừa đây là "basic sandbox isolation", khuyên cân nhắc kỹ trước khi dùng production. Framework gắn chặt hệ model vẫn giữ thói quen khai giới hạn — tín hiệu này đáng tin hơn con số marketing.

Phong cách "một hệ model, mọi layer khớp nhau" của Qwen-Agent đối chiếu hay với cách Wakii tổ chức các kỹ năng của agent — xem [Superpowers panel](/vi/docs/superpowers-panel/) để thấy chiều ngược lại: một harness, nhiều skill cùng khớp format.

## Wakii học được gì

- **ADOPT** — Catalog tự khai chặn xung đột lúc đăng ký: `register_tool` nổ ValueError khi trùng tên thay vì ghi đè im lặng. Surface: skills catalog của Wakii — kiểm trùng id nên là fail cứng lúc nạp/lint, không để lọt tới lúc render.
- **DIRECTION** — Format-fit thành đặc tả: Qwen-Agent học thuộc format từng dòng model; kit Wakii viết prompt bám đúng quy ước harness Claude Code — bước tiếp theo hợp lý là ghi rõ "skill này fit harness nào" ngay trong khai báo skill.
- **WATCH** — Stack coupling: gắn một hệ là tính năng khi hệ đó là gốc sản phẩm (Qwen-Agent là backend của Qwen Chat). Kit Wakii gắn một harness cũng vậy; điều kiện đổi: khi cần hỗ trợ đa harness, coupling trở thành nợ cần tách interface.
- **N/A** — Claim 1M-token RAG: Wakii không có surface QA tài liệu dài, không áp số này.

Qwen-Agent là ví dụ hiếm về framework dám nhỏ trong lựa chọn model. Nếu bạn muốn xem hướng ngược lại — harness-first, đa model — Wakii là nơi bắt đầu: [cài Wakii và mở Superpowers panel](/vi/docs/getting-started/).
