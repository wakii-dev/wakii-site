# ADOPT draft — microsoft/mcp-for-beginners (batch-3, matrix #20)

> Draft theo rubric style-guide §10 (FI-383 D5). SF-6 file issue tập trung
> sau review — label `enhancement` trên `wakii-dev/wakii`. KHÔNG link path
> nội bộ site repo; dẫn chứng public thay thế.

## 1. Pattern

Docs-discipline khi cơ chế thay đổi: giữ baseline ổn định (không viết đè),
dạy thay đổi lớn trong MỘT trang riêng, gắn callout có ngày tại các đoạn cũ
bị ảnh hưởng, và ghi mọi mốc vào một changelog có ngày. Học từ repo
**microsoft/mcp-for-beginners** — 17.170 stars, license MIT (theo GitHub API
ngày 2026-09-08).

## 2. Evidence inline

- Baseline không bị viết đè khi spec mới đến — README giữ câu:
  "This curriculum is aligned with MCP Specification 2025-11-25 (the latest
  stable release)" (README của microsoft/mcp-for-beginners, theo GitHub API
  ngày 2026-09-08).
- Thay đổi lớn được dạy ở một trang riêng: bài 202 dòng
  `01-CoreConcepts/mcp-2026-07-28-release-candidate.md` dạy release candidate
  2026-07-28 — stateless ở tầng transport, extensions first-class, deprecate
  Roots/Sampling/Logging (theo GitHub API ngày 2026-09-08).
- Bài cũ bị ảnh hưởng được gắn callout trỏ về bài mới: changelog entry ngày
  2026-07-02 ghi rõ việc cập nhật khoảng 11 bài cũ với callout
  "forward-looking" (changelog.md, theo GitHub API ngày 2026-09-08).
- Mọi mốc có ngày trong changelog: 17 entry từ 2025-04-15 tới 2026-07-29;
  entry 2026-07-29 — một ngày sau ngày spec dự kiến phát hành — mô tả bài
  companion mới là "aligned with the final `2026-07-28` specification"
  (changelog.md, theo GitHub API ngày 2026-09-08).

## 3. Đề xuất Wakii

- **Surface**: 5 trang docs công khai của Wakii (getting-started,
  superpowers-panel, story-workflow, agents-and-kit, faq) — hiện đổi nội dung
  theo từng release (gates, story view, pairing) nhưng sửa tại chỗ, không để
  lại vết cho người đọc cũ.
- **Hành vi kỳ vọng**: mỗi lần docs thay đổi một cơ chế — (a) giữ baseline
  của trang, chỉ sửa đúng đoạn liên quan; (b) thêm một entry có ngày vào một
  changelog ngắn của docs (một trang duy nhất, danh sách đảo thời gian, mỗi
  entry 1-3 dòng: ngày + cơ chế đổi + link trang); (c) tại đoạn bị ảnh hưởng,
  gắn callout ngắn có ngày trỏ tới entry changelog khi thay đổi có thể gây
  bất đồng cho người đọc phiên bản cũ.
- **Rủi ro chính**: changelog là tài sản cần kỷ luật — bỏ bê vài release thì
  nó gây nhiễu hơn việc không có; nên giới hạn entry ở thay đổi CƠ CHỈ (không
  entry cho typo/copy) để chi phí duy trì gần bằng 0.

## 4. Upstream links

- Repo: https://github.com/microsoft/mcp-for-beginners
- README (baseline statement): https://github.com/microsoft/mcp-for-beginners/blob/422055c27bf1e0fc3b932e87c437a2bfa0cd17ae/README.md
- Changelog (17 dated entries): https://github.com/microsoft/mcp-for-beginners/blob/422055c27bf1e0fc3b932e87c437a2bfa0cd17ae/changelog.md
- Bài dạy thay đổi spec (one-page "what's changing"):
  https://github.com/microsoft/mcp-for-beginners/blob/422055c27bf1e0fc3b932e87c437a2bfa0cd17ae/01-CoreConcepts/mcp-2026-07-28-release-candidate.md
- Bài public thay dẫn chứng: bài sẽ live tại /blog/deep-dive-microsoft-mcp-for-beginners/ sau khi story merge (build-in-public đã được duyệt 2026-09-07).
