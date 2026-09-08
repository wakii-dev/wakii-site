# Hisn00w/ASu-skills — research digest (batch-3, matrix #48)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: Hisn00w/ASu-skills
- facet: misc
- stars @ 2026-09-08: 4004 (probe SF-1) — re-probe cùng ngày bởi SF-5: 4025 (hai số đều thật, cùng ngày; bài cite 4.025)
- license (GitHub API 2026-09-08): MIT
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh` + `gh api` trực tiếp của SF-5)

## Ghi chú ground-truth so với briefing

- Briefing "bộ skill cộng đồng cho agent" — ĐÚNG, nhưng cụ thể hơn: là **plugin
  workflow tìm việc (job-hunting) tiếng Trung** — 9 skill: contributor,
  evidence-recap, project-guide, great-resume, make-resume, job-match,
  job-apply, interview, offer. Góc bài: skills-as-content — skill là nội dung
  phân phối được cho NHIỀU harness, registry là nguồn sự thật duy nhất, và
  "biên sự thật" được viết ngay trong prompt.
- Ngôn ngữ GitHub stats = HTML (do 18 template resume HTML trong assets), không
  phải skill viết bằng HTML.
- Không có release/tag; phân phối qua plugin marketplace của từng harness.

## TODO — điền khi research (SF sở hữu)

- [x] README notes — repo làm gì, cho ai, điểm khác biệt cốt lõi
- [x] Architecture — cấu trúc code, cơ chế đáng học (đọc code thật, trích kèm link commit/tree)
- [x] Releases — cadence + release gần nhất (gh release list / API, kèm ngày probe)
- [x] Wakii grading — ADOPT / DIRECTION / WATCH / N/A, mỗi grade ≥1 lý do (style-guide §8)

### README notes (probe 2026-09-08)

- "中文求职工作流插件" — plugin workflow tìm việc tiếng Trung, 9 entry độc lập:
  /contributor (đóng góp OSS thật), /project-guide (đọc-source +面经), /great-resume
  (nâng CV), /make-resume (làm CV), /evidence-recap (chuỗi bằng chứng 9 đoạn),
  /interview (chuẩn bị phỏng vấn), /offer (quản lý tiến độ), /job-match, /job-apply.
- MIT; tạo 2026-08-12; pushed 2026-09-08; 4.025★ / 243 fork @ 2026-09-08;
  badge Trendshift (#139058) + badge bảo mật/cài đặt của bên thứ ba (dsh.so).

### Kiến trúc phân phối — skills-as-content (probe 2026-09-08)

- Một nguồn `skills/` + `assets/` + `references/` dùng chung, 5 manifest theo
  harness: `.codex-plugin/` (Codex), `.claude-plugin/` (Claude Code),
  `.trae-plugin/` (TraeWork), `.opencode-plugin/` + `.workbuddy-plugin/` (bridge
  cộng đồng "lightweight"). Cài Claude Code: `/plugin marketplace add
  Hisn00w/ASu-skills` + `/plugin install asu-skills@asu`.
- **`skills.registry.json` là nguồn sự thật duy nhất**, sinh + đối chiếu bằng
  `npm run sync:skills`, CI chạy `--check` — máy chặn catalog drift (PR #136
  "fix/docs-skill-catalog-sync" của contributor ngoài qiyu-lu sửa đúng lớp này).
- SKILL.md của evidence-recap: chuỗi bằng chứng 9 ĐOẠN theo thứ tự — 问题背景/
  方案决策/个人动作/交付状态/落地范围/效果证据/个人边界/待补证据/面试追问
  (bối cảnh, quyết định, hành động cá nhân, trạng thái bàn giao, phạm vi,
  bằng chứng hiệu quả, biên trách nhiệm cá nhân, bằng chứng CÒN THIẾU, câu hỏi
  theo đời phỏng vấn). Biên sự thật: phân biệt rõ đã-lên-máy/điểm/prototype/kế
  hoạch, đo-thật/ước-lượng; không bịa số; privacy scrub TRƯỚC khi output.
- /contributor: check tín hiệu maintainer + quy tắc đóng góp + trạng thái
  issue/PR + rủi ro trùng TRƯỚC khi đề xuất; PR chưa merge chỉ được ghi "đã
  submit", chỉ "merged" trên GitHub mới cho ngôn từ mạnh hơn. /great-resume:
  đánh 【待补】 thay vì bịa title/công ty/số liệu.
- Community: PR ngoài trong tháng đầu (garlic9912 #127, liang0417 #133,
  qiyu-lu #136); commit bằng tiếng Trung, nhịp đều.

### Releases

- Không có release/tag — phân phối bằng plugin marketplace từng harness; version
  sống trong manifest plugin. (Đã probe `releases?per_page=5` 2026-09-08: rỗng.)

### Wakii grading (được dùng trong bài)

- ADOPT — registry một nguồn + sinh view dẫn xuất + CI `--check`: Wakii giữ
  catalog skills trong `src/data/skills.ts` nhưng số dẫn xuất trong README/docs
  vẫn drift bằng tay (README còn "21 skills" trong khi thật 20/13 — flag mở từ
  batch-2). Máy-so-sánh số dẫn xuất với mảng gốc là fix đúng lớp: sinh hoặc
  lint-check mọi số đếm skills trong docs/README.
- DIRECTION — phân phối đa-harness: một nguồn skills/, manifest riêng từng
  harness, registry đối chiếu — nếu kit Wakii mở ra ngoài Claude Code, đây là
  layout theo ngay.
- DIRECTION — chuỗi bằng chứng 9 đoạn của evidence-recap (đoạn riêng cho "bằng
  chứng còn thiếu" + biên trách nhiệm người/AI): khuôn sắc hơn cho story-memory
  / done-means-evidence của Wakii.
- WATCH — 4k★ < 1 tháng cho skill PHI-code (tìm việc tiếng Trung): nhu cầu
  skills-as-content ra ngoài dev-tools là có thật; nhưng 5-harness coverage còn
  trẻ (2 bridge "lightweight"), câu chuyện bảo mật dựa badge bên thứ ba.
