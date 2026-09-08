---
title: "Continue: trợ lý AI gắn vào IDE có sẵn — config hub cho agent"
description: "Đọc cách Continue nhúng trợ lý AI vào VS Code và JetBrains bằng một file config duy nhất — và bài học vận hành từ một dự án 35 nghìn sao chuyển sang read-only."
pubDate: "2026-10-22"
category: "tech"
tags: ["agents", "workflow", "architecture"]
draft: false
---

Khi cả thị trường đua nhau dựng IDE mới, Continue chọn chiều ngược lại: giữ nguyên VS Code hoặc JetBrains của bạn, rồi gắn trợ lý AI vào đúng editor đó. Cách họ làm việc đó — gom models, rules, context và công cụ MCP vào một file config — vẫn đáng đọc hôm nay, kể cả sau khi dự án dừng. Vì theo GitHub API ngày 2026-09-08, repo 35.833 sao này đã chuyển sang read-only, và cách một dự án lớn khép lại tử tế cũng là bài học không kém phần kỹ thuật.

- Continue là coding agent chạy dưới ba hình thức: CLI, extension VS Code, plugin JetBrains — bạn giữ editor cũ, thêm tầng AI vào.
- Toàn bộ cấu hình nằm trong một file config: models, rules, context, MCP server — mỗi thứ một block.
- Rules là dữ liệu có cấu trúc (globs, alwaysApply, invokable), không phải đoạn văn mô tả mơ hồ.
- Dự án đã dừng theo đúng nghĩa: README ghi rõ repo read-only, bản cuối v2.1.0-vscode phát hành 19-06-2026.
- Với Wakii: assistant trong IDE và orchestration ngoài IDE là hai lớp khác nhau — Continue dạy về lớp trong, story-workflow của Wakii sống ở lớp ngoài.

## Một file config thay cho cài đặt rải rác

Điểm khác của Continue so với các trợ lý cùng thế hệ không nằm ở popup chat trong editor. Nó nằm ở chỗ cấu hình tập trung: bạn khai model nào được dùng, rule nào được áp, context nào được nạp, tool nào được phép — tất cả trong một file `config.yaml`. Hệ quả thực dụng: hành vi của agent trở thành thứ có thể review. Một pull request đổi file config là thấy ngay agent sẽ khác đi ở đâu, ai duyệt thay đổi đó, và quay lại được nếu sai.

Ba field của một rule cho thấy mức độ nghiêm túc của thiết kế này. Đoạn code chuyển đổi trong loader chính thức:

```ts
export function convertYamlRuleToContinueRule(rule: Rule): RuleWithSource {
  if (typeof rule === "string") {
    return { rule: rule, source: "rules-block" };
  }
  return {
    source: "rules-block",
    rule: rule.rule,
    globs: rule.globs,
    name: rule.name,
    description: rule.description,
    alwaysApply: rule.alwaysApply,
    invokable: rule.invokable ?? false,
  };
}
```

(trích rút gọn từ `core/config/yaml/yamlToContinueConfig.ts` — nguồn: github.com/continuedev/continue/blob/5522c6f44ca0ac3528b37244818fbfa39b5af470/core/config/yaml/yamlToContinueConfig.ts, theo GitHub API ngày 2026-09-08)

Một rule có `globs` — phạm vi file nó áp dụng; có `alwaysApply` — bật sẵn hay phải gọi mới chạy; có `invokable` — có được coi là một hành động hay chỉ là ngữ cảnh. Đây là ranh giới giữa "rule thật sự" và "ghi chú mong muốn": rule không khai phạm vi thì không có quyền phủ lên code nào. Phần lớn công cụ agent hiện nay mô tả rule bằng văn xuôi; Continue ép rule vào schema, và nhờ thế máy đọc được — kiểm tra, lint, diff.

## MCP trong cùng một schema: stdio và HTTP/SSE

Tool cũng là entry của config, không phải lệnh cài riêng lẻ. Một MCP server cục bộ khai qua stdio với `command`, `args`, `cwd`, `env`; một MCP từ xa khai qua HTTP hoặc SSE với `url` và `apiKey`. Cùng một cấu trúc cho cả hai loại nối:

```ts
// Stdio
if ("command" in config) {
  const { args, command, cwd, env, type } = config;
  // ...
}
// HTTP/SSE
const { type, url, apiKey, requestOptions } = config;
```

(cùng file trên, rút gọn — nguồn: github.com/continuedev/continue/blob/5522c6f44ca0ac3528b37244818fbfa39b5af470/core/config/yaml/yamlToContinueConfig.ts)

Chi tiết đáng học ở đây: agent gọi tool theo tên và không cần biết phía sau là một process con trên máy hay một endpoint HTTPS. Ranh giới cục bộ/xa dần chỉ còn là chuyện vận hành — ai chạy nó, ở đâu — chứ không đòi sửa cách agent nghĩ. Khi một tool đổi hình thức triển khai, chỉ entry config đổi; phần còn lại của quy trình giữ nguyên.

## Dogfood: config của chính dự án nằm trong repo

Dấu hiệu sức khỏe của pattern này nằm ngay ở repo gốc: Continue khai thư mục `.continue/` — chính là thư mục config mà công cụ đọc khi chạy — trong chính repo của nó, với `agents/`, `checks/`, `prompts/`, `rules/` và `environment.json`:

```
.continue/
├── agents/
├── checks/
├── environment.json
├── prompts/
└── rules/
```

(nguồn: cây thư mục gốc repo, theo GitHub API ngày 2026-09-08 — github.com/continuedev/continue/tree/main/.continue)

Việc tự dùng đúng cấu trúc mình phát minh cho workflow của chính mình có hai hệ quả. Một: mọi thay đổi hành vi agent của dự án đi qua pull request — có diff, có người duyệt, có lịch sử. Hai: schema config bị kiểm thử liên tục bởi người dùng khó tính nhất — chính đội phát triển. Công cụ khai agent bằng file mà không tự sống trên file đó thì đang bán thứ mình không dùng.

## Khi một dự án 35.833 sao khép lại tử tế

README không giấu chuyện này. Ngay phần giới thiệu có ghi chú nguyên văn: "The continuedev/continue repository is no longer actively maintained and is read-only for all users." (nguồn: README của continuedev/continue — github.com/continuedev/continue#what-is-continue). Họ tự giới thiệu là "Pioneering open-source coding agent", và khép lại bằng một bản phát hành cuối cùng cho cả ba hình thức: gỡ telemetry ẩn danh, tháo phần xác thực, sửa lỗi còn lại — rồi dừng.

Danh sách release gần nhất lúc probe:

```
v2.1.0-vscode   2026-06-19
v2.0.0-vscode   2026-06-19
v1.3.40-vscode  2026-06-15
v1.2.24-vscode  2026-06-15
v1.2.23-vscode  2026-06-15
```

(nguồn: GitHub API repos/continuedev/continue/releases, ngày 2026-09-08 — github.com/continuedev/continue/releases)

Ba mốc release dồn về hai ngày cuối cùng là kiểu đóng cửa tử tế: phát hành bản chốt, không để repo lơ lửng giữa chừng. README kết bằng một câu nhường lại cộng đồng: "We hope this codebase continues to serve as a foundation for others." (nguồn: README của continuedev/continue — github.com/continuedev/continue#readme) Với một fork như Wakii — fork của orca — tình huống upstream dừng không phải giả định lý thuyết; kỷ luật giữ nhánh upstream rõ ràng và sync có nhịp chính là ván cứu sinh lúc đó, như bài [sống chung với upstream](/vi/blog/oss-upstream-sync/) đã ghi lại từng bước.

## Hai lớp: trong IDE và ngoài IDE

Nối lại với product của chúng ta: lớp trong-IDE mà Continue xây và lớp orchestration mà Wakii chọn không thay thế nhau. Assistant trong editor giải quyết khoảnh khắc gõ code; story-workflow của Wakii giải quyết chuỗi công việc dài — idea, impact, plan, các SF chạy song song, gate, review, merge — nơi agent cần chạy tự do ngoài một editor cụ thể. Chi tiết quy trình đó nằm trong [story workflow](/vi/docs/story-workflow/); Continue bổ sung góc nhìn cho lớp mỏng gần bàn phím nhất, và hai lớp này gặp nhau ở một điểm chung: cả hai đều muốn hành vi của agent được khai tường minh bằng dữ liệu thay vì cấu hình ẩn.

## Wakii học được gì

- **ADOPT** — rules-as-data-blocks: mỗi rule khai `globs` + `alwaysApply` + `invokable` thay vì prose. Áp vào story-workflow: các rule phạm vi file trong context pack (nhóm nào được sửa file nào, rule nào luôn bật) nên chuyển thành block có schema để guard và reviewer lint máy được — hiện tại phần lớn đang là văn xuôi. Đề xuất cụ thể đã ghi ở adopt draft.
- **DIRECTION** — consumer ngoài desktop: Wakii mobile đã chứng minh pattern consumer xa — đọc gates từ phone; một extension editor mỏng đọc cùng nguồn gate là hướng đi tự nhiên tiếp theo, nhưng chưa có yêu cầu thực tế nào nên chưa thể ADOPT.
- **WATCH** — vòng đời read-only: theo dõi xem ecosystem fork Continue thế nào; nếu xuất hiện một fork khỏe duy trì schema config, cân nhắc lại grade cho pattern đó với nguồn mới.

Wakii là agentic IDE với một đội superpowers có sẵn — nếu bạn muốn agent có kỷ luật hơn là có nhiều tính năng, [tải về](/vi/docs/getting-started/) và chạy thử một story đầu tiên.
