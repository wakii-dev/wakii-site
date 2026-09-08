# Topic matrix batch 2 — 44 bài blog longform (story FI-373)

> **Tài sản dùng chung của toàn story.** SF-2/3/4/5 ĐỌC file này trước khi viết bất
> kỳ bài nào. Nguồn: epic spec `docs/superpowers/specs/2026-09-08-blog-batch2-design.md`
> §MATRIX 44 SLUG — slug · category · pubDate · hero là **CHỐT CỨNG (DEC-1/2/5/6)**:
> KHÔNG đổi slug, KHÔNG đổi ngày, KHÔNG đổi category. Cột `title hướng`, `docs-link`,
> `tags` là định hướng viết — được nới theo tiến triển thật NHƯNG slug/ngày/category
> không bao giờ đổi. Bảng batch 1 (20 bài) nằm ở `topic-matrix.md` — lint + audit
> parse CẢ HAI file, tổng 64 slug non-seed.
>
> Quy tắc ngày (DEC-6): đúng 2 bài/ngày, liên tục **2026-09-09 → 2026-09-30**
> (22 ngày × 2 bài). pubDate trong tương lai là HỢP LỆ khi khớp đúng dòng matrix
> này (policy a — bài "lịch đăng" hiện đầu listing sort desc).
> Phân bổ category (DEC-2): **32 tech (13 skills + 8 features + 11 arch/oss) ·
> 10 tutorial (guides) · 2 build-log (logs)**.
> Hero (DEC-5): đúng **10 flagship** đánh dấu `yes` — render do content SF sở hữu
> thực hiện SAU khi bài tồn tại (pipeline đọc frontmatter `heroImage`).

## Ma trận 44 bài

| # | slug | cat | pubDate | facet | hero | Title hướng (VI) | Docs-link | Tags đề xuất |
|---|------|-----|---------|-------|------|------------------|-----------|--------------|
| 1 | `skill-brainstorm` | tech | 2026-09-09 | skill | yes | Skill /brainstorm: từ ý tưởng thô tới spec đã kiểm chứng | `/docs/agents-and-kit/` | skills, workflow, agents |
| 2 | `skill-writing-plans-linear` | tech | 2026-09-09 | skill | no | Skill /writing-plans-linear: kế hoạch sống trên Linear | `/docs/story-workflow/` | skills, linear, workflow |
| 3 | `skill-story-workflow` | tech | 2026-09-10 | skill | yes | Skill /story-workflow: cả câu chuyện trong một lệnh | `/docs/story-workflow/` | skills, story-workflow, workflow |
| 4 | `skill-orca-superpowers-workflow` | tech | 2026-09-10 | skill | yes | Skill /orca-superpowers-workflow: cầu nối workflow và app | `/docs/story-workflow/` | skills, story-workflow, agents |
| 5 | `skill-frontend-design` | tech | 2026-09-11 | skill | yes | Skill /frontend-design: taste có nguyên tắc | `/docs/agents-and-kit/` | skills, design, workflow |
| 6 | `skill-gpt-taste` | tech | 2026-09-11 | skill | no | Skill /gpt-taste: đánh giá giao diện bằng máy | `/docs/agents-and-kit/` | skills, design |
| 7 | `skill-design-taste-frontend` | tech | 2026-09-12 | skill | no | Skill /design-taste-frontend: chuẩn thiết kế cho agent | `/docs/agents-and-kit/` | skills, design |
| 8 | `skill-image-to-code` | tech | 2026-09-12 | skill | no | Skill /image-to-code: từ ảnh chụp tới component | `/docs/agents-and-kit/` | skills, design, features |
| 9 | `skill-mock-prototype` | tech | 2026-09-13 | skill | yes | Skill /mock-prototype: prototype trước một dòng code | `/docs/agents-and-kit/` | skills, design, workflow |
| 10 | `skill-web-design-guidelines` | tech | 2026-09-13 | skill | no | Skill /web-design-guidelines: bộ quy tắc web trong tầm tay | `/docs/agents-and-kit/` | skills, design |
| 11 | `skill-figma-orientation` | tech | 2026-09-14 | skill | no | Skill /figma-orientation: đọc Figma như agent | `/docs/agents-and-kit/` | skills, design |
| 12 | `skill-graph-engineering` | tech | 2026-09-14 | skill | no | Skill /graph-engineering: hệ thống phức tạp thành đồ thị | `/docs/agents-and-kit/` | skills, architecture, design |
| 13 | `skill-prompt-master` | tech | 2026-09-15 | skill | no | Skill /prompt-master: prompt là một sản phẩm | `/docs/agents-and-kit/` | skills, workflow |
| 14 | `feature-terminal-splits` | tech | 2026-09-15 | feature | yes | Terminal splits: nhiều phiên, một cửa sổ | `/docs/getting-started/` | features, terminal, wakii |
| 15 | `feature-ssh-worktrees` | tech | 2026-09-16 | feature | no | SSH worktrees: code từ xa, môi trường riêng | `/docs/getting-started/` | features, cli, worktree |
| 16 | `feature-design-mode` | tech | 2026-09-16 | feature | no | Design mode: chỉnh UI mà không phá code | `/docs/faq/` | features, design |
| 17 | `feature-ai-diff-annotation` | tech | 2026-09-17 | feature | no | AI diff annotation: review đọc được lý do | `/docs/faq/` | features, qa |
| 18 | `feature-emulator-android` | tech | 2026-09-17 | feature | no | Android emulator: mobile ngay trong app | `/docs/getting-started/` | features, android, mobile |
| 19 | `feature-computer-use-native` | tech | 2026-09-18 | feature | yes | Computer use native: agent chạm được vào desktop | `/docs/agents-and-kit/` | features, agents, workflow |
| 20 | `feature-per-workspace-env` | tech | 2026-09-18 | feature | no | Per-workspace env: mỗi worktree một môi trường | `/docs/getting-started/` | features, worktree, cli |
| 21 | `feature-notification-keyboard` | tech | 2026-09-19 | feature | no | Notification và phím tắt: vòng chờ không tắt máy | `/docs/faq/` | features, mobile |
| 22 | `guide-install-update` | tutorial | 2026-09-19 | guide | no | Guide: cài đặt và cập nhật Wakii từ đầu | `/docs/getting-started/` | guide, release, wakii |
| 23 | `guide-first-story-end-to-end` | tutorial | 2026-09-20 | guide | yes | Guide: story đầu tiên từ ý tưởng tới PR | `/docs/story-workflow/` | guide, story-workflow, workflow |
| 24 | `guide-mobile-pairing` | tutorial | 2026-09-20 | guide | no | Guide: ghép đôi điện thoại với desktop | `/docs/getting-started/` | guide, mobile |
| 25 | `guide-ssh-remote` | tutorial | 2026-09-21 | guide | no | Guide: làm việc từ xa qua SSH | `/docs/getting-started/` | guide, cli, worktree |
| 26 | `guide-custom-skill-101` | tutorial | 2026-09-21 | guide | no | Guide: viết skill custom đầu tiên | `/docs/agents-and-kit/` | guide, skills |
| 27 | `guide-cloud-relay` | tutorial | 2026-09-22 | guide | no | Guide: relay cloud — điều phối qua cloud | `/docs/faq/` | guide, architecture |
| 28 | `guide-worktree-workflow` | tutorial | 2026-09-22 | guide | no | Guide: worktree workflow cho dự án thật | `/docs/story-workflow/` | guide, worktree, git |
| 29 | `guide-linear-github-wiring` | tutorial | 2026-09-23 | guide | no | Guide: nối Linear và GitHub vào workflow | `/docs/story-workflow/` | guide, linear, workflow |
| 30 | `guide-multi-session-ports` | tutorial | 2026-09-23 | guide | no | Guide: chạy nhiều session song song | `/docs/getting-started/` | guide, cli |
| 31 | `guide-troubleshooting` | tutorial | 2026-09-24 | guide | no | Guide: chẩn đoán lỗi thường gặp | `/docs/faq/` | guide, wakii |
| 32 | `arch-electron-process-model` | tech | 2026-09-24 | arch | yes | Mô hình process Electron của Wakii | `/docs/faq/` | architecture, electron |
| 33 | `arch-relay-cloud` | tech | 2026-09-25 | arch | no | Kiến trúc relay cloud: tín hiệu giữa các máy | `/docs/faq/` | architecture, agents |
| 34 | `arch-native-computer-use` | tech | 2026-09-25 | arch | no | Kiến trúc computer-use: từ intent tới UI action | `/docs/agents-and-kit/` | architecture, agents, electron |
| 35 | `arch-site-bento-tokens` | tech | 2026-09-26 | arch | no | Site Wakii: bento layout và design tokens | `/docs/faq/` | architecture, design, wakii |
| 36 | `arch-site-motion-i18n` | tech | 2026-09-26 | arch | no | Site Wakii: motion và i18n hai locale | `/docs/faq/` | architecture, wakii |
| 37 | `arch-auto-update-feed` | tech | 2026-09-27 | arch | no | Auto-update feed: từ release tới máy người dùng | `/docs/getting-started/` | architecture, release |
| 38 | `oss-why-fork-mit` | tech | 2026-09-27 | oss | no | Vì sao fork MIT: open source có chủ đích | `/docs/faq/` | oss, license, fork |
| 39 | `oss-upstream-sync` | tech | 2026-09-28 | oss | no | Upstream sync: sống cùng dự án mẹ | `/docs/story-workflow/` | oss, upstream, git |
| 40 | `oss-brand-monogram` | tech | 2026-09-28 | oss | no | Brand monogram w.: một icon, hai repo | `/docs/faq/` | oss, design, wakii |
| 41 | `oss-release-roundup-14x` | tech | 2026-09-29 | oss | no | Release roundup 1.4.x: những gì đã ship | `/docs/getting-started/` | oss, release |
| 42 | `arch-ci-gates` | tech | 2026-09-29 | arch | no | CI gates: chất lượng tự kiểm trước gate người | `/docs/story-workflow/` | architecture, qa, workflow |
| 43 | `building-wakii-in-the-open-log-3` | build-log | 2026-09-30 | log | yes | Xây Wakii ra công khai — log 3 | `/docs/getting-started/` | build-log, wakii, release |
| 44 | `building-wakii-in-the-open-log-4` | build-log | 2026-09-30 | log | no | Xây Wakii ra công khai — log 4 | `/docs/getting-started/` | build-log, wakii, evidence |

## Quy tắc tiêu thụ matrix (cho SF-2/3/4/5)

1. **Thứ tự viết theo facet** (spec): skills #1-13 (SF-2) → features #14-21 (SF-3,
   CHỈ viết sau verify-shipped — claims-registry `## Verify-shipped`) → guides
   #22-31 (SF-4) → arch/oss #32-42 + logs #43-44 (SF-5). Trong facet, giữ thứ tự
   # tăng dần (đúng thứ tự category: 4 workflow → 6 design → 3 reference với skills).
2. **Angle là bắt buộc, không là gợi ý** — mỗi bài phải có ≥2 H2 mà không bài nào
   cùng facet đã có (runbook bước outline kiểm). Title trong matrix là ĐỊNH HƯỚNG.
3. **Features #14-21 chỉ được claim theo NHÃN** ghi trong `claims-registry.md`
   `## Verify-shipped` (SHIPPED / MAIN-ONLY / ROADMAP) — không nhãn = không viết.
4. **Tags** — đề xuất trong matrix là mặc định; thay được bằng vocab trong
   `style-guide.md` §Tags (đã mở rộng cho batch 2), không tự chế từ ngoài vocab.
5. **Docs-link** — cột này là link tối thiểu ≥1/bài, đúng locale (D4: VI
   `/vi/docs/`, EN `/docs/`). Thêm link thứ 2 được, phải cùng ràng buộc.
6. KHÔNG link cross-file kèm `#anchor`; link docs chỉ tới trang.
7. **Hero `yes`** — sau khi bài tồn tại: thêm frontmatter `heroImage:
   "/blog/heroes/<slug>.png"` CẢ HAI locale (VI share hero EN) rồi chạy
   `node scripts/render-blog-heroes.mjs` (SF sở hữu bài tự render — không render
   trước khi bài tồn tại, pipeline đọc frontmatter sẽ ENOENT).
