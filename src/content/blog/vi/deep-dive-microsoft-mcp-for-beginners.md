---
title: "MCP for Beginners: kho học liệu chính thống về MCP"
description: "Đọc curriculum 13 module của Microsoft như một artifact: thứ tự dạy gì, một bài học được thiết kế ra sao, và điều đó nói lên độ chín của hệ sinh thái MCP."
pubDate: "2026-10-10"
category: "tech"
tags: ["guide", "agents", "workflow"]
draft: false
---

Khi Microsoft dựng hẳn curriculum 13 module chỉ để dạy Model Context Protocol (MCP), tín hiệu lớn hơn nội dung: MCP đủ chín để có giáo trình chuẩn. Repo microsoft/mcp-for-beginners đạt 17.170 sao (theo GitHub API ngày 2026-09-08) không phải vì chứa code hiếm — toàn bộ là học liệu — mà vì nó là câu trả lời chính thống cho câu hỏi "học MCP bắt đầu từ đâu". Bài này đọc curriculum như một artifact: thứ tự dạy gì, bài học thiết kế ra sao, và cái đó nói lên điều gì về độ chín của hệ sinh thái.

TL;DR:

- Curriculum gồm 13 module xếp theo bốn phase — foundation, building, growing, mastery; bảo mật là module 02, đứng trước cả bài dựng server đầu tiên.
- Mỗi khái niệm có code chạy được song song ở 6 ngôn ngữ; cây thư mục HEAD chứa 45 file manifest project (theo GitHub API ngày 2026-09-08).
- Repo không phát hành release nào: cập nhật chảy qua changelog 17 entry có ngày và một bài riêng dạy spec release candidate 2026-07-28.
- Grading cho Wakii: ADOPT kỷ luật "baseline ổn định + callout tại chỗ" khi docs thay đổi cơ chế; WATCH bản dịch tự động 55 locale.

## Một curriculum là một artifact: 13 module, bốn phase

Một repo học liệu dễ bị đọc lướt như danh mục link. Curriculum này thì không: 13 module đánh số 00 tới 12, xếp theo bốn phase có tên riêng, mỗi module mở bằng README liệt kê bài con (theo GitHub API ngày 2026-09-08). Repo tạo 2025-04-04, changelog có entry đầu ngày 2025-04-15 — cấu trúc giảng dạy được định hình ngay từ đầu, không cộng dồn ngẫu hứng.

```text
Foundation   00-Introduction · 01-CoreConcepts · 02-Security
Building     03-GettingStarted              — 15 bài: server → client → deploy
Growing      04-PracticalImplementation · 05-AdvancedTopics — 17 chủ đề nâng cao
Mastery      06-CommunityContributions … 11-MCPServerHandsOnLabs — 13 hands-on labs
Tooling      12-tooling
```

(nguồn: cấu trúc thư mục tại commit `422055c`, theo GitHub API ngày 2026-09-08)

Bốn phase có chủ đích: foundation giải thích bằng mô phỏng, building bắt tay code, growing đi vào triển khai, mastery mở ra cộng đồng và 13 lab PostgreSQL. Thứ tự là bản đồ ưu tiên của ecosystem: cái dạy trước là cái được coi là nền. Về tầm vóc: thư mục translations chứa 55 thư mục ngôn ngữ (kể cả tiếng Anh), sinh tự động qua GitHub Action như README mô tả (theo GitHub API ngày 2026-09-08).

## Bảo mật được dạy trước hello world

Trong 13 module, bất ngờ nhất ở vị trí thứ ba: sau introduction và core concepts, trước cả bài dựng server đầu tiên, là 02-Security.

| Thứ tự | Module | Vai trò |
|--------|--------|---------|
| 00 | Introduction to MCP | MCP là gì, vì sao tồn tại |
| 01 | Core Concepts | các khái niệm nền của giao thức |
| 02 | Security in MCP | mối đe dọa và best practices bảo mật |
| 03 | Getting Started | dựng server và client đầu tiên |

(nguồn: bảng curriculum trong README tại commit `422055c`, theo GitHub API ngày 2026-09-08)

Quyết định này đọc ra một nhận định: giao thức vào môi trường doanh nghiệp thì bảo mật không phải phụ lục. Xu hướng tiếp tục ở spec kế tiếp — bài dạy release candidate 2026-07-28 (202 dòng, theo GitHub API ngày 2026-09-08) liệt kê sáu SEP hardening authorization theo OAuth 2.0 / OIDC, và tóm tắt thay đổi lớn nhất:

"The headline change: MCP becomes stateless at the protocol layer." — bài "What's Changing in MCP: The 2026-07-28 Release Candidate" ([nguồn](https://github.com/microsoft/mcp-for-beginners/blob/422055c27bf1e0fc3b932e87c437a2bfa0cd17ae/01-CoreConcepts/mcp-2026-07-28-release-candidate.md))

Giao thức stateless ở tầng transport là giao thức chuẩn bị cho scale ngang — và bài này vào giáo trình cho người mới chỉ sáu tuần sau khi RC công bố (2026-05-21).

## Sáu ngôn ngữ, một khái niệm: 45 project chạy được

Nguyên tắc lặp suốt curriculum: không khái niệm nào chỉ được giải thích — phải có code chạy được, ở ngôn ngữ của bạn. Ba mẫu calculator cơ bản có song song ở 6 ngôn ngữ; đếm trên cây HEAD, repo chứa 45 file manifest project:

| Loại manifest | Số file | Ngôn ngữ |
|---------------|---------|----------|
| package.json | 16 | JavaScript, TypeScript |
| .csproj | 10 | C# |
| pom.xml | 8 | Java |
| Cargo.toml | 6 | Rust |
| requirements.txt + pyproject.toml | 5 | Python |

(nguồn: đếm từ git tree HEAD, theo GitHub API ngày 2026-09-08)

Chi phí duy trì không nhỏ — mỗi lần spec đổi, sáu bộ sample đổi theo. Định vị hiện rõ: MCP nhắm tới kỹ năng phổ thông, không phải sở hữu của một cộng đồng ngôn ngữ.

Từng bài cũng chuẩn trường học hơn blog: bài "first server" dài 1.376 dòng (theo GitHub API ngày 2026-09-08), mở bằng TL;DR, tiếp theo là learning objectives theo mẫu "By the end of this lesson, you will be able to:", rồi mới tới code. Giọng dạy ở khái niệm trung tâm:

"Think of MCP like a USB-C port for AI applications" — bài Getting Started with MCP, first server ([nguồn](https://github.com/microsoft/mcp-for-beginners/blob/422055c27bf1e0fc3b932e87c437a2bfa0cd17ae/03-GettingStarted/01-first-server/README.md))

Server đầu tiên bạn dựng cũng chạy thật, không phải pseudo-code:

```typescript
const server = new McpServer({
  name: "Demo",
  version: "1.0.0"
});

// Add an addition tool
server.tool("add",
  { a: z.number(), b: z.number() },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }]
  })
);
```

(03-GettingStarted/01-first-server/README.md, trích theo tree tại commit `422055c` — [link](https://github.com/microsoft/mcp-for-beginners/blob/422055c27bf1e0fc3b932e87c437a2bfa0cd17ae/03-GettingStarted/01-first-server/README.md))

## Không release, chỉ changelog: học liệu sống cùng spec

Khoản mục quen thuộc nhất của repo phần mềm — releases — vắng mặt: API releases lẫn tags đều trả về rỗng. Curriculum không đánh phiên bản; nó cập nhật liên tục trên main, ghi vết bằng changelog.md 732 dòng với 17 entry có ngày, từ 2025-04-15 tới 2026-07-29 (theo GitHub API ngày 2026-09-08).

Hai entry gần nhất kể đủ chuyện đồng bộ spec. Ngày 2026-07-02, curriculum thêm bài dạy RC 2026-07-28 — bỏ session ở tầng transport, extensions thành cơ chế first-class — và cập nhật khoảng 11 bài cũ bằng callout trỏ tới bài mới. Ngày 2026-07-29, một ngày sau ngày spec dự kiến phát hành, changelog gọi bài companion mới là "aligned with the final `2026-07-28` specification" (changelog.md của microsoft/mcp-for-beginners, [nguồn](https://github.com/microsoft/mcp-for-beginners/blob/422055c27bf1e0fc3b932e87c437a2bfa0cd17ae/changelog.md)). Baseline không bị viết đè — README khẳng định: "This curriculum is aligned with MCP Specification 2025-11-25 (the latest stable release)" ([nguồn](https://github.com/microsoft/mcp-for-beginners/blob/422055c27bf1e0fc3b932e87c437a2bfa0cd17ae/README.md)).

Đó là kỷ luật docs đáng học: baseline giữ ổn định, thay đổi lớn dạy ở một bài riêng, bài cũ chỉ gắn callout ngắn trỏ nguồn, mọi mốc ghi ngày vào changelog.

## Wakii học được gì

- **ADOPT** — Kỷ luật docs khi cơ chế thay đổi (section bốn): giữ baseline ổn định, dạy thay đổi trong một trang riêng, gắn callout có ngày ở chỗ cũ, ghi entry có ngày vào changelog. Surface thật: 5 trang docs Wakii đổi theo release (gates, story view, pairing) nhưng sửa tại chỗ không vết. Đề xuất: mỗi lần docs đổi cơ chế, thêm entry có ngày vào changelog ngắn của docs kèm callout tại đoạn bị ảnh hưởng. Rủi ro: changelog bỏ bê vài release sẽ gây nhiễu hơn việc không có.
- **DIRECTION** — Anatomy bài học (section ba): TL;DR → learning objectives → code chạy được trong phút đầu. Bài tutorial Wakii đã có TL;DR và transcript thật, nhưng chưa có khối objectives chuẩn để người đọc tự kiểm; đáng chuẩn hóa cho category tutorial các batch sau.
- **WATCH** — Bản dịch tự động 55 locale qua GitHub Action (section một): Wakii dịch tay hai locale, chất lượng vẫn ưu tiên hơn độ phủ; khi docs mở thêm ngôn ngữ, dịch tự động kèm review mới là ứng viên.
- **N/A** — Nội dung dạy fundamentals MCP: docs Wakii không có trang nào dạy MCP (faq lẫn agents-and-kit không nhắc MCP) và không cần biến docs thành lớp học giao thức — việc của curriculum này, không phải của Wakii.

Curriculum chính thống là tín hiệu maturity: một giao thức có đủ người học để cần giáo trình, đủ tình huống sản xuất để dạy security trước hello world. Nếu bạn đang cân nhắc agentic IDE cho công việc hằng ngày: [faq](/vi/docs/faq/) gom các câu hỏi thường gặp về vận hành đội agent, đội 9 agent trong kit mô tả ở [agents-and-kit](/vi/docs/agents-and-kit/). Catalog kiến thức theo cách Wakii xem ở [skills-catalog-tour](/vi/blog/skills-catalog-tour/); viết bài học cho chính mình thì bắt đầu từ [guide-custom-skill-101](/vi/blog/guide-custom-skill-101/). Wakii là agentic IDE với một đội superpowers có sẵn — tải về, để agent chạy, bạn giữ quyền quyết.
