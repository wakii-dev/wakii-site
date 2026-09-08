---
title: "Gemini CLI: agent terminal của Google"
description: "Deep-dive Gemini CLI — 106.867★, Apache-2.0: một harness lớn mở toàn bộ code ngay khi đứng sau model của chính Google, đọc từ policy engine tới các bot tự vận hành repo."
pubDate: "2026-10-04"
category: "tech"
tags: ["agents", "cli", "terminal", "architecture"]
draft: false
heroImage: "/blog/heroes/deep-dive-google-gemini-gemini-cli.png"
---

Có ba cách làm một agent terminal. Cách thứ nhất: bán model, giấu code, công bố kiến trúc qua changelog — kiểu Claude Code mà chúng tôi đã đọc ở [bài trước](/vi/blog/deep-dive-anthropics-claude-code/). Cách thứ hai: làm vỏ trung tính cho mọi model — kiểu OpenCode. Google chọn cách thứ ba, ít người để ý hơn: viết harness sinh ra cho model nhà mình, rồi mở toàn bộ code kèm license Apache-2.0, cho cả thế giới đọc từng điểm kiểm quyền. Gemini CLI đạt 106.867★ và 14.542 forks theo GitHub API ngày 2026-09-08 — chỉ 17 tháng sau khi repo mở (17-04-2025). Bài này bóc xem một vendor lớn xử lý chuyện gì khi harness đứng sau model của chính mình, đọc thẳng từ source.

TL;DR — bạn sẽ đọc được gì:

- Monorepo 7 packages công khai trọn vẹn, từ terminal UI tới SDK nhúng — không có tầng đóng gói nào giấu logic
- Quyền chạy tool là luật trong code: enum PolicyDecision với ba giá trị ALLOW/DENY/ASK_USER và priority rules, không phải lời dặn trong prompt
- Skill là một tool (activate_skill) mà model phải gọi tên; extension là dữ liệu khai báo nạp từ loader
- Google tự dùng nó ngay trên repo của mình: 7 trên 47 workflow GitHub chạy run-gemini-cli để triage issue, dedup, soạn release notes
- Ba kênh phát hành công khai: nightly mỗi đêm, preview và stable mỗi thứ Ba — trong 14 đêm cuối chỉ thiếu đúng một nightly

## Mở đến đâu khi harness đứng sau model nhà mình

README tự giới thiệu: "An open-source AI agent that brings the power of Gemini directly into your terminal" (nguồn: [README của google-gemini/gemini-cli @ 85aca16](https://github.com/google-gemini/gemini-cli/blob/85aca16/README.md), lấy ngày 2026-09-08). License là Apache-2.0 theo GitHub API ngày 2026-09-08 — và không phải license treo cho đẹp: logic điều hành tool, bộ policy, cơ chế sandbox, lẫn bot vận hành đều nằm trong repo. Khác biệt với Claude Code nằm ở một điểm: bạn build được tool từ chính repo này, không cài qua installer đóng gói.

Tại commit 85aca16, thư mục packages/ có đúng 7 mục — mô tả lấy từ chính GEMINI.md của repo:

```
google-gemini/gemini-cli @ 85aca16 — packages/
├── cli                   terminal UI (React + Ink)
├── core                  vòng lặp agent: tools, policy, mcp, skills
├── a2a-server            Agent-to-Agent server (experimental)
├── sdk                   SDK nhúng Gemini CLI vào app khác
├── devtools              Network/Console inspector tích hợp
├── vscode-ide-companion  extension VS Code ghép với CLI
└── test-utils            test rig dùng chung
```

(sơ đồ từ [GEMINI.md @ 85aca16](https://github.com/google-gemini/gemini-cli/blob/85aca16/GEMINI.md), đọc ngày 2026-09-08)

README còn một câu thẳng thắn đáng ngạc nhiên về quan hệ harness–model: "the most direct path from your prompt to our model" — chữ "our model" không phải ngẫu nhiên ([README @ 85aca16](https://github.com/google-gemini/gemini-cli/blob/85aca16/README.md)). Harness này không giả vờ trung lập như OpenCode với catalog model độc lập vendor; nó phục vụ Gemini trước hết. Nhưng cái giá của sự phục vụ đó thì mở hết: toàn bộ điểm quyết định hành vi — policy, sandbox, safety, routing — nằm trong packages/core/src để ai cũng đọc. Kênh phát hành công khai cùng mức: README cam kết nightly mỗi đêm 00:00 UTC từ nhánh main, preview mỗi thứ Ba 23:59 UTC, stable mỗi thứ Ba 20:00 UTC — và dữ liệu release khớp: v0.58.0 phát hành 20:51 UTC đúng thứ Ba 01-09, 13 nightly trong 14 đêm cuối (theo GitHub API ngày 2026-09-08).

## Quyền chạy tool là luật trong code, không trong lời dặn

Đây là phần đáng học nhất với ai đang xây hệ agent. Mọi lời gọi tool đi qua một policy engine, và mỗi quyết định là một giá trị enum — không phải một đoạn hội thoại:

```ts
// packages/core/src/policy/types.ts
export enum PolicyDecision {
  ALLOW = 'allow',
  DENY = 'deny',
  ASK_USER = 'ask_user',
}
```

(nguồn: [policy/types.ts @ 85aca16](https://github.com/google-gemini/gemini-cli/blob/85aca16/packages/core/src/policy/types.ts))

Engine giữ các rule có độ ưu tiên và ghi đè theo luật tường minh. Log nội bộ của policy-engine.ts cho thấy các nhánh: lệnh git trong workspace không tin cậy thì "Forcing ASK_USER"; lệnh nguy hiểm khi chế độ tự động YOLO đang bật thì "Preserving decision"; lệnh git an toàn đã biết thì "overriding ASK_USER to ALLOW" (nguồn: [policy-engine.ts @ 85aca16](https://github.com/google-gemini/gemini-cli/blob/85aca16/packages/core/src/policy/policy-engine.ts)). Đáng chú ý nhất là nhánh thứ hai: ngay cả khi chạy ở chế độ tự động nhất, engine không tự tay chấm lại lệnh nguy hiểm — nó giữ nguyên quyết định của luật. Xác nhận với người dùng đi qua một confirmation-bus riêng (thư mục confirmation-bus với message-bus.ts), tách khỏi vòng lặp tool thay vì trộn vào hội thoại.

Đó là khác biệt căn bản so với kiểu "guardrail" nhiều harness hay làm: không phải đoạn system prompt van xin model hãy cẩn thận, mà là dữ liệu luật được máy chấm trước khi lệnh chạy. Một enum thì model không thuyết phục được.

## Skill là một tool, extension là dữ liệu

Hai cơ chế mở rộng của Gemini CLI đều được thiết kế theo hướng quan sát được. Skills không phải văn bản chèn lén vào context — nó là một tool mà model phải gọi tên:

```ts
// packages/core/src/tools/activate-skill.ts
export interface ActivateSkillToolParams {
  /** The name of the skill to activate */
  name: string;
}
```

(nguồn: [tools/activate-skill.ts @ 85aca16](https://github.com/google-gemini/gemini-cli/blob/85aca16/packages/core/src/tools/activate-skill.ts))

Khi model gọi activate_skill, phần mô tả trả về lấy từ SkillManager; mỗi lần kích hoạt vì thế để dấu vết trong transcript như mọi tool-call khác — thấy được skill nào bật lúc nào, thay vì phép trá hình kiểu prompt-template. Thư mục skills/ có loader và manager riêng kèm builtin skills. Extensions thì nạp từ config/extensions qua extensionLoader — dữ liệu khai báo, không phải patch code (nguồn: [utils/extensionLoader.ts @ 85aca16](https://github.com/google-gemini/gemini-cli/blob/85aca16/packages/core/src/utils/extensionLoader.ts)). MCP là công dân hạng nhất: mcp-client, mcp-client-manager, list-mcp-resources nằm ngay trong tools/. Và chi tiết vui ở gốc repo: có GEMINI.md — chính cơ chế context-file mà tool quảng bá cho người dùng, được dùng cho chính source của nó, từ hướng build tới sơ đồ kiến trúc.

## Google tự dùng nó ngay trên repo của mình

Bằng chứng tốt nhất rằng "harness này dùng được thật" không phải benchmark — mà là .github/workflows/ của chính repo. 7 trên 47 workflow chạy run-gemini-cli, GitHub Action chính thức của dự án, ngay trên repo này:

```
gemini-automated-issue-triage.yml   triage issue tự động
gemini-scheduled-issue-triage.yml   triage issue định kỳ
gemini-automated-issue-dedup.yml    gộp issue trùng tự động
gemini-scheduled-issue-dedup.yml    dedup issue định kỳ
release-notes.yml                   soạn release notes
docs-audit.yml                      rà soát docs
community-report.yml                báo cáo cộng đồng
```

(7/47 workflow tại [.github/workflows @ 85aca16](https://github.com/google-gemini/gemini-cli/tree/85aca16/.github/workflows), grep "run-gemini-cli" ngày 2026-09-08)

Đó là dogfooding ở tầng vận hành: agent xử lý chính hàng đợi issue của repo agent — có lịch, công khai, ai cũng xem được kết quả từng lần chạy. README ghi free tier 60 request/phút và 1.000 request/ngày với tài khoản Google cá nhân. Hai mảnh ghép nhau: Google trao quota model nhà mình để bạn chạy harness nhà mình, và tự chứng minh nó đủ bền cho việc vận hành thật ngay trước mắt bạn. Mô hình mở và mô hình kinh doanh ở đây không mâu thuẫn — harness mở miễn phí, model là chỗ thu tiền.

Cách Wakii làm khác ở chỗ đặt workflow lên trước: một story đi qua đội 9 agent chuyên biệt với gates B0–B5 chặn từng mốc, người thật chốt quyết định không thể hoàn tác — xem [story workflow](/vi/docs/story-workflow/) và [đội agent kèm kit](/vi/docs/agents-and-kit/).

## Wakii học được gì

- **ADOPT** — luật quyền là dữ liệu được máy chấm trước khi chạy: cặp PolicyDecision + priority rules trong policy engine là mẫu cho tầng gate của Wakii — story-preflight có thể mã hóa các điều kiện cứng thành ruleset có độ ưu tiên (chặn-executor, cảnh-báo, cho-qua) thay vì checklist văn xuôi, để gate khó bị nuốt im lặng hơn nữa.
- **DIRECTION** — dogfooding vận hành công khai: 7 workflow agent tự triage và dedup issue trên repo của chính nó là pattern Wakii có thể áp cho wakii-dev/wakii, nơi các issue research đang mở dần; chưa làm ngay vì cần bộ triage rule chín trước khi để agent tự cầm queue.
- **WATCH** — a2a-server: GEMINI.md tự gắn nhãn experimental, khớp với đánh giá "A2A còn sớm" Wakii đã ghi trong research; đổi thành DIRECTION khi xuất hiện client editor-agentic dùng thật ngoài demo.
- **N/A** — free tier 1.000 request/ngày: thế mạnh của vendor sở hữu model; Wakii là IDE cho người dùng mang model của họ theo, không có quota model để trao đi.

Nếu bạn muốn thấy workflow đó vận hành trên một story thật, tải Wakii, mở ⚡ Superpowers panel và để đội agent chạy từ đầu — các gate sẽ hỏi đúng chỗ cần bạn.
