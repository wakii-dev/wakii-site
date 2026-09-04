# Wakii Site — Content Depth & Engagement (Story 2)

Date: 2026-09-04
Status: spec-critic PASS (2026-09-04) · plan-critic pending
Story branch: `story/fi294-site-content-depth` (created at APPROVE, fork từ main
SAU khi FI-289 close — SF-4 convergence QA merge xong)
Reference: https://www.aihero.dev/ (content pattern — KHÔNG visual pattern; visual
authority vẫn là docs/superpowers/designs/sf1-direction.md v2 Bento Premium)

## 1. Problem

Site hiện là showcase (bento mockups, terminal boot) nhưng chưa SELL và chưa TEACH:
- Triết lý 8 trụ cột chỉ nằm chìm trong `story-workflow.md` (:59-148) — không ai
  tình cờ thấy được; landing không nhắc.
- Skills: chỉ 1 bullet mơ hồ "17 skills, 23 story-* CLIs" trong `agents-and-kit.md`
  — không giải thích từng skill là gì, làm việc thế nào. Kit thật: **20 skills +
  24 story-* CLIs** (đếm từ `~/.claude/skills` + `~/.claude/bin` 2026-09-04) —
  docs đang lệch số.
- Animation chỉ tập trung ở landing bento; docs 100% static; tổng thể "còn ít".
- Không có chỗ download/cài đặt rõ ràng (chỉ build-from-source chìm trong docs +
  quickstart teaser).
- Không có roadmap.

## 2. Goals / Non-goals

**Goals**
1. Trang **Skills catalog** (`/skills` ×2 locales) — nhóm theo category theo mẫu
   aihero.dev; mỗi skill = card mở rộng: tên + slash-command + mô tả + cách làm
   việc (2-3 câu) + vai trò trong workflow.
2. **Download/Get Wakii** — section riêng trên landing: build-from-source (git
   clone + make) + repo link + requirements. Không hứa binary.
3. **Roadmap** (`/roadmap` ×2 locales) — static Now/Next/Later + milestones có
   ngày, KHÔNG changelog versioned (chưa có release cadence).
4. **Philosophy + cách làm việc** — section trên landing: 8 trụ cột dạng card
   rút gọn, link sâu sang `story-workflow.md` cho bản đầy đủ (DRY: full copy vẫn
   chỉ ở docs); đồng thời **deepen section #workflow hiện có** (stage strip đã
   tồn tại) để giải thích rõ cách team 9 agents + gates B0-B5 làm việc (9 agents
   là số đã verify — bảng trong `agents-and-kit.md`).
5. **Animation pass** — landing sâu hơn (scroll-triggered section reveals, stagger
   upgrades) + docs nhẹ (reveal tinh tế), tất cả qua `prefers-reduced-motion`
   kill-switch (`global.css:65`).
6. Cập nhật accuracy: số liệu kit (20 skills / 24 CLIs) đồng bộ mọi nơi nhắc.

**Non-goals**
- 17-20 trang detail riêng cho từng skill (+34 URL ×2 locales — user đã chốt
  catalog + card sâu, không trang riêng).
- Binary releases / download artifacts (chưa có release pipeline).
- Changelog versioned (aihero "What changed recently") — chỉ khi có releases.
- Unlock `DOC_SLUGS` (LOCKED, 5 slugs giữ nguyên — trang mới đi route riêng).
- Đổi visual direction (sf1-direction.md vẫn là binding).
- i18n ngoài EN/VI; backend; CMS; blog.

## 3. User decisions (chốt 2026-09-04, AskUserQuestion 4/4 theo đề xuất)

| Decision | Value |
|---|---|
| Skills scope | Catalog 1 trang + card sâu (không trang detail riêng) |
| Download | Build-from-source + repo link; không binary |
| Roadmap | Static Now/Next/Later, không changelog |
| Animation | Landing sâu + docs nhẹ |

## 4. Content architecture

### Routes mới (KHÔNG đụng DOC_SLUGS)
- `/skills` + `/vi/skills` — catalog. Data: typed module `src/data/skills.ts`
  (mang cả EN+VI: mỗi skill {id, name, command, category, desc_en, desc_vi,
  how_en, how_vi} — pattern tương tự `landing.ts`), nguồn: frontmatter thật của
  kit trong `~/.claude/skills` (20 skills), nhóm category theo đúng kit
  (process/workflow · design/visual · orca/platform · teaching/reference — chốt
  lúc implement theo data thật).
- `/roadmap` + `/vi/roadmap` — Now/Next/Later. Data: `src/data/roadmap.ts`.
- Landing: thêm philosophy section + nâng cấp quickstart thành **Get Wakii /
  download section** (thay thế, không thêm trùng).
- Tên skill + slash-command giữ nguyên tiếng Anh (không dịch); mô tả + how-it-
  works dịch VI.

### Copy & accuracy
- Số liệu kit đồng bộ: 20 skills / 24 story-* CLIs (fix `agents-and-kit.md` EN+VI
  + mọi chỗ nhắc "17/23"). Quy ước duy nhất: số CHÍNH XẠC ở các mặt đếm được đã
  verify (skills/CLIs/agents), generic ở chỗ dễ trôi.
- Accuracy guards cũ giữ nguyên: không "Stories tab" claim; zero-setup claim OK;
  footer credit orca + superpowers (Jesse Vincent, MIT).
- **Skills triage (SF-1):** duyệt 20 skills — loại skills không public được
  (platform-specific / internal) khỏi catalog; list chốt được ghi notes SF-1 và
  PM xác nhận TRƯỚC khi SF-2 build (gate điều phối: SF-1 xong → coordinator
  escalate xin confirm; **không có confirm thì SF-2 KHÔNG start**).
  Acceptance catalog = số cards == số skills đã triaged, không cứng "20".
- VI: EN là source of truth; VI do agent dịch, **user-review gate ở SF-5
  convergence cho TOÀN BỘ copy mới** (kế thừa gate SF-4 của story 1).

### Motion boundary (chống duplicate — rành mạch)
- SF-2/3/4 tiêu thụ motion util của SF-1 NGUYÊN TRẠNG (data-attribute contract
  có sẵn) — không tự viết reveal primitive mới, không hand-roll.
- SF-5 là SF DUY NHẤT được mở rộng util + thêm motion mới (landing deep pass +
  docs reveals).

### Nav / Footer
- Nav (desktop): thêm **Skills + Roadmap**; ≤900px cả hai theo collapse hiện có;
  Footer mirror cả hai link.
- Nav-cta "get wakii": giữ `/docs/getting-started` đến khi REPO_URL thật (giữ
  nguyên câu hỏi mở SF-4 story 1 — khi repo public thì chuyển sang REPO_URL
  hoặc #get-wakii; SF-3 story này ghi decision point, không guess).

### Shared motion infra + landing componentization (tier 0 — chống duplicate & conflict)
- Extract reveal/stagger logic từ `Landing.astro` thành util dùng chung (script
  module hoặc data-attribute contract). SF-2/3/4/5 TIÊU THỤ, không tự viết lại
  reveal riêng. Mockup kit (`src/components/mockups/*`) không rewrite.
- **SF-1 componentize landing sections** (hero/bento/zero-setup/workflow/
  get-wakii/faq thành `src/components/landing/*.astro`, Landing.astro thành
  shell render thuần) — SF-3 và SF-4 (chạy song song) KHÔNG cùng sửa 1 file:
  SF-3 sở hữu component get-wakii, SF-4 sở hữu philosophy/workflow components.
- **SF-1 pre-add TOÀN BỘ i18n keys mới** (philosophy + workflow-deepen +
  get-wakii, EN+VI) vào landing.ts — SF-3/4 chỉ wiring markup trong component
  riêng, không sửa landing.ts → hết conflict song song trên file copy.
- **Lighthouse baseline đo ở SF-1** trên `/` + `/vi/` (trước mọi trang mới) —
  đây là baseline của acceptance #5.
- **Triage/data sequencing**: SF-1 build data modules ĐỦ 20 skills; triage list
  (subset public) ghi notes; SF-2 render THEO TRIAGED SUBSET. Confirm PM là gate
  cho SF-2 START, không phải gate cho SF-1 exit.
- **Review gate SF-5 = EN + VI** cho toàn bộ copy mới (VI là trọng tâm vì khối
  lượng dịch; EN review cùng lượt).
- SF-5 release readiness = build xanh + preview serve + smoke — KHÔNG claim
  deploy (không có deploy target trong scope).

### Roadmap content (source of truth — P0 fix)
Draft items user duyệt LÚC APPROVE bracket (sửa thoải mái trước đó; sau approve
đây là nội dung ship, không SF nào tự chế thêm):

- **Now** (đang làm): content depth story này (skills catalog, roadmap, triết lý,
  download); chuẩn bị public repo (LICENSE file, REPO_URL thật).
- **Next** (hướng đã biết, chưa có ngày): GitHub Releases + binaries + changelog;
  per-skill detail pages nếu có nhu cầu; VI review pass đầy đủ.
- **Later** (tầm nhìn, không ngày): blog/field notes; locales mới (nếu có nhu
  cầu); plugin marketplace hướng plugin-agent.
- Format: milestones theo QUÝ/khung thời gian mơ hồ ("Q4 2026", "2027") — không
  ngày cụ thể quá xa (spec Non-goals: không có release cadence).

## 5. SF split (vertical, rubric C1-C5/V1-V3)

| SF | Tier | What (demo được khi xong) | Deps | ~Tasks |
|---|---|---|---|---|
| SF-1 Content foundation + shared motion | 0 | Data modules đủ 20 skills + roadmap + TOÀN BỘ i18n keys mới ×2 locales; motion util + landing componentize + Lighthouse baseline; Nav/Footer links; kit counts đồng bộ | — | 12 |
| SF-2 Skills catalog | 1 | Người vào /skills (cả VI) thấy skills TRIAGED SUBSET nhóm theo category, mỗi skill đọc được mô tả + cách làm việc; install strip link → /docs/getting-started/; entrance animation qua util | SF-1 (+PM confirm triage) | 11 |
| SF-3 Download + Roadmap | 1 | Landing có section Get Wakii (clone + make + repo link); /roadmap ×2 locales thấy Now/Next/Later theo nội dung đã duyệt | SF-1 | 10 |
| SF-4 Philosophy + landing deepening | 1 | Landing có philosophy section 8 pillars (card rút gọn + link heading-anchor docs); #workflow hiện có giải thích rõ 9 agents + gates B0-B5 | SF-1 | 8 |
| SF-5 Animation pass + convergence QA | 2 | Site motion mượt (landing sâu, docs nhẹ), reduced-motion tắt sạch, Lighthouse perf ≥ baseline SF-1; copy mới EN+VI user-reviewed; links/locales pass toàn site | SF-2, SF-3, SF-4 | 10 |

Chống duplicate: reveal/motion chỉ viết 1 lần ở SF-1 (util), SF-2..5 tiêu thụ
nguyên trạng (SF-5 duy nhất được mở rộng); i18n keys mới SF-1 pre-add hết —
SF-3/4 không cùng sửa landing.ts; design gate (mock-prototype) là process gate
SF-2/SF-3, không phải code task.
Placeholder-mode (REPO_URL chưa thật): link repo PHẢI đi qua `REPO_URL`
constant; acceptance đo "href == constant" + steps text-verified khớp
`getting-started.md`, KHÔNG đòi clone thật từ URL placeholder — resolution thật
thuộc publish checklist (story 1 SF-4 kế thừa). hreflang/canonical verify cho
route mới nằm ở SF build trang đó (SF-2, SF-3) + audit lại ở SF-5.

## 6. Acceptance (epic level)

1. `/skills` + `/vi/skills`: cards == số skills đã triage (SF-1); nhóm category
   có tên ghi trong notes SF-1; mỗi card có mô tả + cách làm việc; VI đọc được.
2. Landing có #get-wakii: steps build-from-source text-verified khớp
   `getting-started.md`; repo link href == `REPO_URL` constant (placeholder-mode
   — không đòi URL thật trước publish).
3. `/roadmap` + `/vi/roadmap`: Now/Next/Later đúng NỘI DUNG đã duyệt ở §4
   (Roadmap content), format milestones khung thời gian mơ hồ.
4. Landing có philosophy section 8 pillars + link sang heading anchor của
   `story-workflow.md` (không link theo số dòng); #workflow deepen 9 agents +
   gates B0-B5.
5. Mọi animation mới bị `prefers-reduced-motion` tắt sạch; anim mới chỉ
   transform/opacity; Lighthouse perf ≥ baseline đo ở **SF-1** (tier 0 — trước
   mọi trang/section mới, tránh hấp thụ regression SF-2/3/4).
6. Copy mới (EN+VI) qua user review (gate SF-5); kit counts đồng bộ toàn site
   (20/24 ở mặt đếm được).
7. Build xanh; hreflang/canonical đúng cho route mới (verify tại SF-2/SF-3,
   audit SF-5); nav/footer Skills+Roadmap hoạt động cả 2 locales.

## 7. Risks / notes

- Fork từ main SAU FI-289 close — SF-4 (story 1) đang sửa landing.ts/Nav.astro,
  story này sẽ conflict nếu fork sớm.
- REPO_URL placeholder: mọi link repo phải đi qua constant, ready khi URL thật
  (placeholder-mode acceptance đã định nghĩa ở §6.2).
- Skill descriptions là maintenance surface — static hand-written (S1); SF-1
  triage gate quyết định danh sách public; drift-check với kit là nice-to-have.
- Roadmap static là cam kết editorial tối thiểu — nội dung duyệt lúc APPROVE,
  cập nhật khi epic lớn xong.
- Pillar deep-link nhắm heading anchor trong `story-workflow.md` (id tồn tại
  kiểm lúc SF-4 implement; nếu chưa có anchor thì thêm id vào heading — không
  link số dòng).
