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

## Boundary
- KHÔNG đụng landing (SF-2), tokens/layout (SF-1), QA (SF-4)
