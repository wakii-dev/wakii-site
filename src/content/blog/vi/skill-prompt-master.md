---
title: "Skill /prompt-master: prompt là một sản phẩm"
description: "prompt-master biến ý tưởng thô thành một prompt production-ready: rút intent trước, nhận diện tool đích, khóa format output từ đầu — một prompt duy nhất, dùng được ngay lần dán đầu tiên."
pubDate: "2026-09-15"
category: "tech"
tags: ["skills", "workflow"]
draft: false
---

Bạn viết prompt mỗi ngày — cho chatbot, cho IDE, cho generator ảnh — và đa số lần nó ra đời theo cảm hứng: vài câu mông lung — gửi, lệch, viết lại, lệch tiếp. Kit kỹ năng của Wakii có một skill nhìn việc này khác đi. prompt-master — một trong 13 kỹ năng public của kit, tại thời điểm viết 2026-09-08 — tuyên bố gọn một dòng: prompt không phải câu hỏi lặp theo cảm hứng, mà là sản phẩm có spec: intent đã rút, tool đích đã định, format output khóa từ đầu. Bài này đọc thẳng source của skill để xem tuyên bố đó được thi hành thế nào.

TL;DR:

- Prompt tệ không ngẫu nhiên: nó rơi vào sáu nhóm failure nhận diện được, và skill có sẵn checklist quét rồi sửa âm thầm.
- Trước khi viết một chữ, skill rút chín chiều intent; thiếu chiều tới hạn thì hỏi lại — nhưng tối đa ba câu hỏi.
- Mỗi tool đích một chuẩn: cùng ý định, model reasoning, IDE agent và generator ảnh cần ba cấu trúc khác nhau.
- Output contract: đúng một prompt duy nhất, khóa vai và format, không kèm giải thích — thước đo duy nhất là chạy ngay lần dán đầu tiên.
- Skill tự chặn phạm vi: chỉ bật khi bạn yêu cầu rõ ràng việc viết hay sửa prompt.

## Sáu nhóm failure của một prompt tệ

Section Diagnostic Checklist của source liệt kê sáu nhóm lỗi lặp lại — task, context, format, scope, reasoning, agentic — với quy tắc: quét mọi prompt thô qua danh sách này, "fix silently" — sửa thẳng, chỉ báo ra khi lời sửa làm lệch ý định của bạn. Ba mẫu tiêu biểu, trích nguyên văn:

```ascii
- Two tasks in one prompt → split, deliver as Prompt 1 and Prompt 2
- Implicit length ("write a summary") → add word or sentence count
- Vague aesthetic ("make it professional") → translate to concrete measurable specs
```

*Nguồn: ~/.claude/skills/prompt-master/SKILL.md (section Diagnostic Checklist), lấy 2026-09-08.*

Đọc chúng như đọc lỗi biên dịch: mỗi dòng một dấu hiệu kèm cách sửa. Nhóm agentic đáng chú ý nhất với ai chạy coding agent: agent không điểm dừng được xếp là lỗi scope; phép sửa là thêm stop condition kèm mốc hỏi con người trước thao tác không hồi.

## Rút intent trước khi viết: chín chiều, tối đa ba câu hỏi

Trước khi sinh một chữ nào, skill rút intent theo một bảng chín chiều cố định — làm "silently":

| Chiều | Trích ra gì | Bắt buộc khi |
|---|---|---|
| Task | hành động cụ thể — đổi động từ mơ hồ thành thao tác chính xác | luôn |
| Target tool | hệ AI nào nhận prompt này | luôn |
| Output format | hình dạng, độ dài, cấu trúc của kết quả | luôn |
| Constraints | điều bắt buộc và điều cấm, ranh giới phạm vi | việc phức tạp |
| Input | bạn cung cấp gì kèm theo prompt | nếu có |
| Context | domain, trạng thái dự án, quyết định trước đó | session có lịch sử |
| Audience | ai đọc output, trình độ kỹ thuật của họ | output cho người thật |
| Success criteria | biết thành công thế nào — nhị phân nếu được | việc phức tạp |
| Examples | cặp input/output mẫu để khóa pattern | format là then chốt |

*Nguồn: ~/.claude/skills/prompt-master/SKILL.md (bảng Intent Extraction), lấy 2026-09-08.*

Ba chiều đầu luôn bắt buộc: làm gì, cho tool nào, ra dạng gì. Bảy chiều còn lại bật theo tình huống. Câu hỏi làm rõ chỉ dành cho chiều tới hạn còn thiếu, và source chặn trần bằng một rule cứng: "Do not ask more than 3 clarifying questions before producing a prompt". Hỏi lại ít, hỏi đúng — đó là ranh giới giữa skill rút intent và trợ lý hỏi ngược năm vòng vẫn chưa chịu viết. Cùng động tác hỏi-trước-viết-sau với [skill brainstorm](/vi/blog/skill-brainstorm/) ở tầng story.

## Nhận diện tool đích: mỗi tool một chuẩn

Intent xong, skill định tuyến theo tool đích — giả định ngầm: không tồn tại "prompt tốt chung". Cùng loại việc, ba loại tool cần ba cấu trúc khác nhau:

```ascii
tool                  chuẩn prompt trong source
────────────────────────────────────────────────────────────────────
o3 / DeepSeek-R1      "SHORT clean instructions ONLY" — nêu mục tiêu và
(model reasoning)     done trông ra sao. Không CoT: model tự nghĩ nội
                      bộ, thêm "think step by step" làm output tệ đi.

Cursor / Windsurf     file path + tên hàm + hành vi hiện tại + thay đổi
(IDE agent)           mong muốn + danh sách không-được-đụng + ngôn ngữ
                      và version. "Done when:" là bắt buộc — đó là điểm
                      dừng của agent.

Midjourney            descriptor tách bằng dấu phẩy, KHÔNG prose. Chủ thể
(generator ảnh)       trước, style/mood/ánh sáng/bố cục sau, tham số cuối:
                      --ar 16:9 --v 6 --style raw
```

*Nguồn: ~/.claude/skills/prompt-master/SKILL.md (section Tool Routing), lấy 2026-09-08.*

Quy tắc này thành hard rule ngay đầu source: "Do not add Chain of Thought to reasoning-native models (o3, o4-mini, DeepSeek-R1, Qwen3 thinking mode)". Đó là ví dụ sạch nhất cho luận điểm của bài: một kỹ thuật được ca ngợi ở nơi này lại gây hại ở nơi kia. Prompt không có chuẩn tuyệt đối — nó có chuẩn của tool nhận nó. Source liệt kê hơn hai mươi nhóm tool, từ Claude, ChatGPT tới ComfyUI, video AI và agent điều khiển browser; tool lạ xếp vào nhóm gần nhất.

## Một prompt duy nhất, output contract khóa từ đầu

Output format của source yêu cầu đúng ba mục; mục một là "A single copyable prompt block ready to paste into the target tool" — một block duy nhất, copy-dán được. Không ba phương án để bạn chọn, không lựa chọn đuôi "nếu bạn muốn thì". Vì sao "một" là con số đúng? Câu trả lời nằm ở phần Success criteria cuối tài liệu: "The user pastes the prompt into their target tool. It works on the first try. Zero re-prompts needed. That is the only metric." Ba phương án đẩy việc chọn về lại cho bạn — nghĩa là việc chưa xong; một prompt chạy ngay lần đầu mới là sản phẩm hoàn tất.

Trước khi trả kết quả, skill tự chạy một loạt câu verify. Hai câu đáng nhớ nhất: ràng buộc tới hạn có nằm trong 30% đầu của prompt chưa — để sống sót qua attention decay của model — và "Does every instruction use the strongest signal word? MUST over should. NEVER over avoid." Kèm cấm padding: "Do not pad output with explanations the user did not request" — mỗi câu phải load-bearing, không tính từ mập mờ, format tường minh, phạm vi có chặn.

Ví dụ từ story thật: launch prompt của FI-373 — chuỗi 44 bài batch 2 này — viết theo đúng tinh thần đó. Cấu trúc, tự vẽ lại dạng outline:

```ascii
cấu trúc launch prompt story FI-373 (SF-2), lấy 2026-09-08 — outline tự vẽ

ROLE         task-executor — một SF, một worktree, phạm vi file chốt trước
WHY          SF tồn tại vì sao: facet skills là khối còn thiếu; evidence =
             source skill thật, không paraphrase docs
LOAD         skill bắt buộc load trước khi chạy
READ         docs phải đọc ĐÚNG THỨ TỰ đánh số: context pack → bracket → spec
TEAM         9 agent, mỗi agent một report format — thiếu verdict coi như
             chưa chạy
CREATIVITY   khung cứng: matrix chốt slug/ngày/category · band 900-1400 từ ·
             claims registry giới hạn được nói gì · docs-link bắt buộc
RUN          checklist đánh số 1→5, "KHÔNG dừng trước bước 4"; Done chỉ set
             sau khi merge
```

*Nguồn: cấu trúc launch prompt của story FI-373, lấy 2026-09-08.*

Đó là prompt được thiết kế như một sản phẩm: role, ràng buộc, output contract, checkpoint dừng — không phải một câu "viết 13 bài blog đi".

## Kích hoạt có chủ đích: chỉ khi việc của bạn là prompt

Phần ít kỹ thuật nhất của source nói nhiều nhất về triết lý của kit: ranh giới kích hoạt. Frontmatter khai báo phạm vi hoạt động ngay từ dòng description:

```yaml
Activates only when the user explicitly asks to write, fix, improve, or adapt
a prompt for a specific AI tool (LLM, Cursor, Midjourney, image AI, video AI,
coding agents, etc.). Does not activate for general conversation, coding
tasks, document writing, or other non-prompt-engineering work.
```

*Nguồn: ~/.claude/skills/prompt-master/SKILL.md (frontmatter, version 1.7.0), lấy 2026-09-08.*

Skill không tự dậy khi bạn đang viết code hay soạn tài liệu — nó chỉ hoạt động khi việc của bạn đúng là prompt. Đây là trigger contract: skill phạm vi hẹp, bật đúng lúc, mạnh hơn skill "biết mọi thứ" không biết lúc nào nên im. Kit đang có 20 kỹ năng tại thời điểm viết 2026-09-08; lựa chọn đó áp cho từng skill.

Khi nào nên gọi: trước khi dán một prompt dài vào IDE agent; khi chuyển một prompt đã có sang tool khác — source gọi chế độ này là Prompt Decompiler; khi prompt hỏng lặp cùng một chỗ và bạn cần ai quét lỗi thay vì đoán. Còn lại — đừng gọi. Đó chính là điều làm nó đáng tin khi được gọi.

prompt-master là một kỹ năng đi kèm đội agent dựng sẵn của Wakii: vai chín agent và cách kỹ năng gắn vào team nằm ở trang [agents and kit](/vi/docs/agents-and-kit/); toàn cảnh cả kệ thì bài [Tour kỹ năng public của Wakii](/vi/blog/skills-catalog-tour/) đã đi qua.

Wakii là IDE agentic với đội superpowers dựng sẵn. Lần tới bạn chuẩn bị gõ prompt thứ ba cho cùng một việc, thử dừng lại và viết nó như một sản phẩm: intent nào, tool nào, format gì — hoặc để prompt-master viết hộ.
