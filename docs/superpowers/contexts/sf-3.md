# Context Pack — SF-3 Docs 5 trang × 2 locales (FI-292)

## Spec slice
Docs pages qua Content Collections (locale subdirs — mapping SF-1 đã khóa) +
sidebar + prev/next. 5 trang: getting-started, superpowers-panel, story-workflow,
agents-and-kit, faq. EN authored, VI agent-dịch. Getting-started được VALIDATE
bằng thực thi từng bước trong clean clone/worktree của fork orca (không
docs-by-inference). Số liệu agents/skills/CLIs lấy từ inventory re-confirmed
cuối SF-1 (ghi trong docs/superpowers/notes/). Pass accuracy guard mọi trang.

## Touch map
- `src/content/docs/{en,vi}/*.mdx` + sidebar/prev-next components
- CONSUME SF-1 layout + slugs — KHÔNG sửa layout/i18n config/tokens

## ACCEPTANCE (user-visible)
1. 5 trang × 2 locales render trong docs layout (sidebar + prev/next + lang switch)
2. Getting-started: mỗi bước thực thi thành công trong clean clone (bằng chứng log/commit ghi vào issue)
3. agents-and-kit số liệu khớp inventory re-confirmed; accuracy guard pass (không Stories tab, chỉ bundled install story)
4. VI pages đầy đủ; UI terms kỹ thuật giữ EN khi dịch tự nhiên hơn
5. Internal links giữa docs pages không chết (link integrity toàn docs)

## UPDATE 2026-09-04 (PM — user yêu cầu): story-workflow page phải truyền tải TOÀN BỘ triết lý

Trang `/docs/story-workflow` không chỉ là how-to — cần section **Philosophy** đầy đủ
(dài nhất site, là trang "linh hồn" sản phẩm), phủ 8 trụ cột:

1. **Analyze once, inherit many** — phân tích sâu chạy 1 lần ở epic, SF kế thừa qua
   context pack; SF chỉ chạy plan/execute/verify, không re-analyze, không re-ask
2. **Team model tách bạch** — PM (điều phối, KHÔNG code) / Developer (implement,
   KHÔNG tự duyệt) / Tester độc lập (chỉ tìm lỗi, KHÔNG fix); dev không review code
   mình = bug thật mới bị bắt
3. **Gates thay vì niềm tin** — 5 gates tool-enforced mỗi SF (preflight, diff-review,
   test, snapshot, post-merge); Rule 0 browser verify 3 tầng (DOM/VISUAL/FLOW —
   không tự kết luận khi chưa thấy); gate FAIL = không tiếp tục
4. **Human gates** — quyết định kiến trúc + merge về main là quyền người; agents
   đưa nhánh đích tới trạng thái sạch rồi DỪNG (1 PR/story, merge là human gate cuối)
5. **Tier & bracket topology** — tier = dependency depth; tier boundary = merge point;
   nhánh đích duy nhất `story/<epic>-<slug>` là "main của story"
6. **Watchdog & stall detection** — idle ≠ chết: check 3 tầng (commits, terminal
   state, Linear) trước khi kết luận; unlimited self-check loop tới STORY-COMPLETE;
   resume = đánh thức bằng input, KHÔNG khởi lại
7. **Memory & learning loop** — post-task-ritual chốt bài học sau mỗi task; story-memory
   lưu pattern có provenance cho run sau tái sử dụng
8. **Defensive patterns** — thiết kế cho việc mình sẽ SAI; làm sai lầm rẻ và observable
   (không xóa gì, mọi thứ revert-able); giấy ≠ chạy được (verify-first: lệnh mới phải
   dry-test trước khi tin)

Copy: mỗi trụ cột 1 đoạn ngắn + ví dụ cụ thể. Case study: dùng chính story FI-289
(story này tự minh họa triết lý — design đổi giữa chừng → rework có kiểm soát;
watchdog tự điều phối; reviewer bắt P0 trước merge). VI dịch đầy đủ.

## Boundary
- KHÔNG đụng landing (SF-2), tokens/layout (SF-1), QA (SF-4)
