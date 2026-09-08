# QwenLM/Qwen-Agent — research digest (batch-3, matrix #33)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: QwenLM/Qwen-Agent
- facet: multi-agent
- stars @ 2026-09-08: 17076 (probe trực tiếp khi viết bài T11; SF-1 probe cùng ngày ghi 17073 — drift 3 star trong ngày, bình thường)
- license (GitHub API 2026-09-08): Apache-2.0
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh` + probe lại qua gh api lúc viết)
- pushed @ 2026-09-08: 2026-03-04 — main im lặng ~6 tháng trước ngày probe
- HEAD main lúc viết: `31a4d36d123688581a9e9744427272b33ce940e0`

## README notes (điền 2026-09-08)

- Framework cho LLM application dựa trên instruction following, tool usage,
  planning, memory của Qwen — KHÔNG định vị đa model.
- Tự khai: "Now Qwen-Agent plays as the backend of Qwen Chat" (README,
  probe 2026-09-08) — coupling với stack Qwen là sản phẩm thật, không chỉ
  định hướng.
- Example apps: Browser Assistant (BrowserQwen), Code Interpreter, Custom
  Assistant. Cài: `pip install qwen-agent[gui,rag,code_interpreter,mcp]`.
- Model service: DashScope HOẶC OpenAI-compatible tự host (vLLM/Ollama) —
  nhưng khuyến nghị parse tool-call CHOT THEO TỪNG DÒNG MODEL (xem below).
- Claim tự khai về scale: FAQ RAG "needle-in-the-haystack ... 1M-token
  contexts" kèm blog qwenlm.github.io/blog/qwen-agent-2405/ — KHÔNG có
  claim 500k-token trong README (đã tìm, không thấy → không dùng 500k).
- Code interpreter = Docker container local; disclaimer README tự nhận
  "basic sandbox isolation", khuyên cẩn trọng production.

## Architecture (code thật @ sha 31a4d36d1236, probe 2026-09-08)

- `qwen_agent/llm/function_calling.py` — `BaseFnCallModel.__init__` chọn
  template qua `generate_cfg['fncall_prompt_type']`, default `'nous'`
  (NousFnCallPrompt), còn `'qwen'` → QwenFnCallPrompt.
- `qwen_agent/llm/fncall_prompts/` — đúng 2 template + base: cả hai cùng
  kỹ thuật "Change function_call responses to plaintext responses":
  NousFnCallPrompt serialize `<tool_call>\n{json}\n</tool_call>`;
  QwenFnCallPrompt dùng marker `FN_NAME/FN_ARGS/FN_RESULT/FN_EXIT`.
  → history replay đúng shape chat-template model được train.
- `use_raw_api: True` = bypass preprocessing, nhường parse cho server
  (vLLM built-in) — README FAQ: Qwen3/QwQ để Qwen-Agent tự parse (KHÔNG
  bật `--enable-auto-tool-choice --tool-call-parser hermes` trên vLLM);
  Qwen3-Coder thì bật cả hai + `use_raw_api`.
- `function_choice: 'none'` → `_remove_fncall_messages` viết lại lịch sử
  tool thành text user để model không tự ý gọi.
- `validate_num_fncall_results` — ép 1:1 function_call ↔ function result,
  sai thứ tự/tên → ValueError.
- `qwen_agent/tools/base.py` — `TOOL_REGISTRY = {}` + decorator
  `register_tool(name, allow_overwrite=False)`: trùng tên → ValueError
  trừ khi bật overwrite tường minh; `is_tool_schema` kiểm schema
  {name, description, parameters} kiểu OpenAI.
- Tools built-in (contents API): code_interpreter, python_executor,
  web_search, web_extractor, doc_parser, simple_doc_parser, retrieval,
  image_gen, image_search, image_zoom_in_qwen3vl, amap_weather, storage,
  extract_doc_vocabulary + mcp_manager (MCP ngoài) + search_tools/.
- GUI Gradio (WebUI), agents cao tầng: Assistant (FnCallAgent),
  ReActChat.

## Releases (gh api releases?per_page=10, ngày 2026-09-08)

- Release gần nhất: v0.0.26 @ 2025-05-29.
- 10 release gần nhất dồn trong 2025-03-18 → 2025-05-29 (v0.0.16 →
  v0.0.26, nhịp ~tuần trong cửa sổ đó), sau đó KHÔNG release mới.
- Phát triển tiếp qua main: News README mới nhất 2026-02-16 (Qwen3.5);
  lần push cuối 2026-03-04. → cadence release ≠ nhịp phát triển thật;
  đo nhiệt độ phải nhìn pushed_at.

## Wakii grading (xem bài để lý do đầy đủ)

- ADOPT — catalog tự khai + chặn trùng tên lúc đăng ký (register_tool →
  ValueError): skills catalog của Wakii nên fail cứng khi trùng id thay
  vì overwrite/nhầm im lặng (draft ở adopt-drafts/).
- DIRECTION — format-fit: framework học thuộc format từng model; kit
  Wakii nhắm đúng harness Claude Code — biến "fit harness" thành đặc tả
  tường minh của mỗi skill/prompt.
- WATCH — stack coupling: gắn 1 hệ là tính năng khi hệ đó là gốc sản
  phẩm (backend của Qwen Chat); đổi điều kiện: cần đa harness thì
  coupling thành nợ.
- N/A — 1M-token RAG claim: Wakii không có surface RAG tài liệu dài.
