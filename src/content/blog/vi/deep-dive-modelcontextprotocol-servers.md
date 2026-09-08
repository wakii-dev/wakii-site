---
title: "MCP servers chính thức: bản đặc tả sống của giao thức"
description: "Đọc bộ bảy server tham chiếu của modelcontextprotocol/servers như một đặc tả chạy được: giao thức chọn chuẩn hoá điều gì, kiến trúc từng server chặn rủi ro thế nào, và deprecation được vận hành ra sao."
pubDate: "2026-10-05"
category: "tech"
tags: ["agents", "workflow", "architecture", "evidence"]
draft: false
heroImage: "/blog/heroes/deep-dive-modelcontextprotocol-servers.png"
---

Một giao thức chỉ trưởng thành khi đám phát hành nó chịu chọn: cái gì được làm mẫu, cái gì bị đưa ra rìa. modelcontextprotocol/servers — 90.157★, công khai trên GitHub, lần push cuối 2026-09-03 (theo GitHub API ngày 2026-09-08) — là nơi bên phát hành Model Context Protocol giữ bộ server tham chiếu. Đây không phải danh bạ: bài trước đã đếm [3.862 server cộng đồng trong awesome-mcp-servers](/vi/blog/deep-dive-punkpeye-awesome-mcp-servers/, đếm ngày 2026-09-08); repo này chỉ giữ một số nhỏ mẫu chuẩn. Đọc nó như một bản đặc tả sống: mỗi server trả lời câu hỏi — nếu giao thức nghĩ tính năng này quan trọng, nó chuẩn hoá thành code thế nào.

TL;DR:

- Repo chỉ giữ **7 server tham chiếu**; 13 server cũ chuyển sang repo archived — mỗi mục ghi rõ ai thay thế.
- Bộ server đa ngôn ngữ có chủ ý: 4 TypeScript, 3 Python, minh hoạ cho 10 SDK chính thức của giao thức.
- Filesystem chặn mọi đường dẫn ở một cổng duy nhất: từ chối null-byte, chuẩn hoá, rồi mới so allowlist.
- Server memory vừa vá lỗi đặc trưng cho agent: nhiều lệnh gọi tool đồng thời ghi đè lẫn nhau im lặng — fix bằng một hàng đợi mutation.
- Release đánh số theo lịch ngày (CalVer), có quãng nghỉ 5 tháng, rồi quay lại bằng đợt bảo trì dồn hai ngày.

## Bảy server giữ lại, mười ba server chuyển kho

README chốt phạm vi: phần "important" hướng người tìm danh sách server sang MCP Registry, phần thân tuyên bố repo chỉ dành để chứa "the small number of reference servers maintained by the MCP steering group" (README của modelcontextprotocol/servers, [README @ d73f99e](https://github.com/modelcontextprotocol/servers/blob/d73f99e/README.md), ngày 2026-09-08). Bảy mẫu chuẩn đó:

| Server | Vai |
|---|---|
| Everything | server kiểm thử: prompts, resources, tools |
| Fetch | tải nội dung web, chuyển đổi cho LLM |
| Filesystem | thao tác file có kiểm soát truy cập |
| Git | đọc, tìm, thao tác repository |
| Memory | trí nhớ dài hạn dạng knowledge graph |
| Sequential Thinking | giải bài toán qua chuỗi suy nghĩ |
| Time | thời gian và múi giờ |

Cạnh 7 server còn hoạt động là 13 server đã chuyển kho sang `servers-archived` — gồm cả những tên từng rất nổi: GitHub, GitLab, Slack, PostgreSQL, Puppeteer, Brave Search (theo README @ d73f99e). Đáng học là cách cho nghỉ: Brave Search ghi rõ đã thay bằng server chính thức của Brave; Slack ghi rõ Zencoder nhận bảo trì. Deprecation có địa chỉ — đọc archived và biết đường đi tiếp.

Phần đầu README còn cảnh báo thẳng: các server "meant to serve as educational examples for developers building their own MCP servers, not as production-ready solutions" (README @ d73f99e). Repo 90k★ tự mô tả là ví dụ học tập, không phải giải pháp production — định vị thẳng như vậy là phần khó viết nhất của tài liệu kỹ thuật.

## Mỗi server là một bài học SDK

Không server nào là bản dịch của cái kia. Bốn cái TypeScript (everything, filesystem, memory, sequentialthinking) chạy bằng `npx`; ba cái Python (fetch, git, time) chạy bằng `uvx` hay `pip`. Song song đó, README liệt kê 10 SDK chính thức: C#, Go, Java, Kotlin, PHP, Python, Ruby, Rust, Swift, TypeScript.

Đây là quyết định của riêng bên phát hành giao thức: reference không viết một ngôn ngữ cho gọn, mà chứng minh giao thức ánh xạ sạch qua các hệ type khác nhau. Server `everything` tiêu biểu nhất — thư mục `tools/` của nó là dàn case nhỏ: elicitation request, logging levels, long-running operation, structured content ([src/everything/tools/ @ d73f99e](https://github.com/modelcontextprotocol/servers/blob/d73f99e/src/everything/tools/)). Muốn viết server MCP, đây là bảng chú giải chính tắc — chạy được, không phải tài liệu tả chung chung.

## Filesystem: mọi đường dẫn bị chặn ở cửa

Filesystem là mẫu chuẩn thú vị nhất về bảo mật: cho mô hình đọc ghi file thật, nhưng trong chuồng. Server đăng ký 14 tool (đếm trong `index.ts` @ d73f99e) và tất cả đi qua một cổng duy nhất — `path-validation.ts`, đúng 86 dòng:

```ts
// Reject null bytes (forbidden in paths)
if (absolutePath.includes('\x00')) {
  return false;
}
// Normalize the input path
normalizedPath = path.resolve(path.normalize(absolutePath));
```

(trích từ [src/filesystem/path-validation.ts @ d73f99e](https://github.com/modelcontextprotocol/servers/blob/d73f99e/src/filesystem/path-validation.ts))

Trình tự: chặn null-byte trước, normalize rồi resolve, bắt buộc đường dẫn tuyệt đối, cuối cùng so với danh sách thư mục cho phép. Không phải câu cảnh báo trong README — là một module riêng, có `__tests__` đi kèm. Bảo mật nằm ở chỗ dữ liệu không thể đi đường tắt.

## Memory: khi một lệnh gọi tool đè lên lệnh khác

Server memory giữ knowledge graph trong file và mở 9 tool (đếm @ d73f99e). Đầu tháng 9 nó nhận đợt vá dày đặc nhất repo: tính từ 2026-08-09, GitHub API đếm 30 commit trong 30 ngày; riêng ngày 2026-09-03 có sáu commit `fix(memory)`. Lỗi lớn nhất nằm ngay trong comment code: nhiều mutation dispatched từ cùng một lượt LLM "each independently load the graph, mutate their own copy, and write it back — so whichever write lands last silently overwrites the other's changes" (comment trong [src/memory/index.ts @ d73f99e](https://github.com/modelcontextprotocol/servers/blob/d73f99e/src/memory/index.ts), fix #1819).

Cách vá đáng học: mọi read-modify-write bị tuần tự hoá sau một hàng đợi duy nhất, và hàng đợi phải tự phục hồi sau failure:

```ts
private mutationQueue: Promise<unknown> = Promise.resolve();

private async withLock<T>(operation: () => Promise<T>): Promise<T> {
  const result = this.mutationQueue.then(operation, operation);
  // single failed mutation doesn't permanently wedge every call after it
  this.mutationQueue = result.then(() => undefined, () => undefined);
  return result;
}
```

(trích rút gọn từ [src/memory/index.ts @ d73f99e](https://github.com/modelcontextprotocol/servers/blob/d73f99e/src/memory/index.ts), commit `d73f99e` #4555)

Đây là class bug của riêng phần mềm cho agent dùng: agent không gọi tool tuần tự như con người — nhiều lệnh gọi trong một lượt là đường thường, và whichever-write-lands-last không hiện ra trong test đơn lẻ.

## Nhịp release: ngày làm số phiên bản

Phiên bản đánh số theo lịch ngày (CalVer) — nhìn bảng release là nhìn lịch sử bảo trì:

| Release | Ngày |
|---|---|
| 2026.8.31 | 2026-08-31 |
| 2026.8.18 | 2026-08-18 |
| 2026.7.10 | 2026-07-10 |
| 2026.7.4 | 2026-07-04 |
| 2026.1.26 | 2026-01-26 |

(theo GitHub API ngày 2026-09-08; 10 release gần nhất, bảng rút 5 dòng)

Hai chi tiết lộ vận hành. Một: giữa 2026-01-26 và 2026-07-04 không có release nào — nghỉ gần 5 tháng — rồi repo quay lại với 4 release trong 2 tháng và đợt bảo trì dồn ngày 09-03; lý do quãng nghỉ không có trong release notes nên bài không suy đoán. Hai: README dẫn sang `RELEASING.md` — publish từ CI bằng OIDC trusted publishing, không giữ registry token ([RELEASING.md @ d73f99e](https://github.com/modelcontextprotocol/servers/blob/d73f99e/RELEASING.md)). Trong [bản đồ 50 dự án agentic tháng 9](/vi/blog/agentic-landscape-50-projects/), nhận xét là "cadence phản chiếu quy trình" — đây là mặt dưới của câu đó.

Cùng tư duy đó: tài liệu khớp code thật, bằng chứng thay lời hứa — nguyên tắc Wakii xây trên [story workflow](/vi/docs/story-workflow/) với gates thay self-report.

## Wakii học được gì

- **ADOPT** — hàng đợi mutation cho state dùng chung: fix #4555 của server memory serialize mọi read-modify-write qua một queue, và queue không bị wedge bởi một operation fail. Wakii có đúng class state này — gate state, tiến độ SF, memory story của các SF chạy song song; nguyên tắc "defensive by design" trong story workflow đã ghi nhận kịch bản file ghi chú dùng chung bị conflict. Áp cụ thể: write read-modify-write vào file state dùng chung của kit đi qua một hàng đợi tuần tự.
- **DIRECTION** — deprecation có địa chỉ: 13 server archived đều ghi rõ người thay (Brave → server chính thức của Brave; Slack → Zencoder). Catalog skills của Wakii (20 skill tại thời điểm viết) sẽ cần retirement khi lớn lên — mẫu đáng đưa vào quy trình: giữ entry, trỏ người thay, không xoá im lặng.
- **WATCH** — MCP làm integration surface: docs Wakii hiện chưa có client MCP (kit đi theo release, không phải marketplace). Bộ 7 server tham chiếu là bộ test tương thích đầu tiên đáng chạy nếu surface đó vào lộ trình; chuyển thành DIRECTION khi roadmap có MCP client.
- **N/A** — showcase đa SDK (10 SDK, 2 ngôn ngữ trong 7 server): công việc của bên phát hành giao thức, có cả hệ sinh thái tiêu thụ. Wakii là sản phẩm một stack — tham chiếu đa ngôn ngữ chỉ thêm bề mặt maintain.

Bạn đang nối agent vào file, git hay memory thật và muốn quy trình có gates thay vì lời đảm bảo? Wakii là agentic IDE với đội agent có sẵn — bắt đầu từ [getting started](/vi/docs/getting-started/).
