# Plan — SF-2 Series A: Tự làm việc (6 bài + pilot tích hợp) — story FI-359

- **Linear:** FI-361 · **Dest branch:** `story/fi359-blog-longform-20` · **Worktree:** `sf-2-series-a-self-working`
- **Spec:** `docs/superpowers/contexts/fi359-longform-sf-2.md` (slice đã spec-critic ở epic CREATE — binding)
- **Kit:** `docs/superpowers/editorial/2026-blog-longform/` (topic-matrix · style-guide · claims-registry · evidence-pack · runbook)
- **Pilot mẫu (không sửa):** `src/content/blog/vi/zero-setup-agent-team.md` + EN twin
- **Tier:** Full · **Design:** none (không designer) · **Thứ tự task: tuần tự** (cross-link chỉ trỏ bài đã commit)

## Scope

- IN: 6 slug × 2 locale (12 file mới) theo matrix #2–#7 + series consistency pass.
- OUT: seeds, pilot, editorial kit, lint script, pages, config, bare `contexts/sf-N.md` (FI-349).
- CỨNG theo matrix: slug · pubDate · category. KHÔNG đổi. Boundary khác trong context pack §Boundary.

## Touch map

```
src/content/blog/en/{six slugs}.md   (6 MỚI)
src/content/blog/vi/{six slugs}.md   (6 MỚI)
```

Regression surface (không sửa, chỉ phải không phá): parity gate trong build (11→17 slug × 2) · content lint (scope đã có 6 slug) · listing sort DESC pubDate · RSS/hreflang.

## Chuẩn chung mỗi bài (binding — chi tiết ở style-guide + runbook)

1. Cấu trúc: Hook 1 đoạn → TL;DR 3–5 bullet → 3–5 H2 (mỗi H2 ≥1 evidence block có dòng
   *Nguồn: …, lấy 2026-09-07.*) → đoạn nối docs (link duy nhất bắt buộc) → CTA nhẹ 1–2 câu.
2. Band D1 (prose sau frontmatter, bỏ fenced): **VI 900–1400** (nhắm 950–1250; >1400 warn,
   >1470 fail) · **EN ≥800** (nhắm 850–1050). fenced không đếm → diagram thoải mái, prose mới là band.
3. Frontmatter 6 field đúng template style-guide §4; VI/EN cùng nghĩa, cùng ngày/category/tags.
4. Link: docs-link đúng locale — VI `](/vi/docs/<slug>/)` · EN `](/docs/<slug>/)`, slug ∈
   DOC_SLUGS, KHÔNG `#anchor` cross-file. Cross-link blog: EN `](/blog/<slug>/)` ·
   VI `](/vi/blog/<slug>/)` — chỉ trỏ bài ĐÃ tồn tại trên cây.
5. Claims: đối chiếu claims-registry (cả FORBIDDEN variants) + evidence-pack snapshot D8
   TRƯỚC commit. Quote docs VI lấy nguyên văn từ `src/content/docs/vi/*.md`; quote EN từ
   `src/content/docs/en/*.md`. **Quote chép từ FILE nguồn, không chép từ plan** (plan chỉ trỏ
   vị trí — xuống dòng trong file phải được nối đúng); giữ lead kiểu "*Ví dụ:*" khi trích
   đoạn dẫn chứng. Không số ngoài snapshot; không bịa transcript.
6. Tự kiểm mỗi bài trước commit: `node scripts/check-blog-content.mjs` exit 0 (chỉ warn
   >1400 được phép, tự trim) → rồi `pnpm build` xanh ở mốc nhóm.
7. Commit: **1 commit = 1 cặp VI+EN của 1 slug**, message `feat(blog): <slug> VI+EN (SF-2 T<n>)`
   kèm 1 dòng angle. Stage tay đúng 2 file (zsh: không glob `[slug]`).

## Tasks (7 — tuần tự theo thứ tự matrix; mỗi task xong tick checkbox + commit riêng)

Progress (tick sau mỗi task, coordinator commit tick):

- [x] T1 nine-agents-separated-powers (commit `cd1dda7`)
- [x] T2 gates-not-trust-rule-zero (commit `51ca77f`)
- [x] T3 watchdog-idle-is-not-dead (commit `d5001e8`)
- [x] T4 story-memory-learning-loop (commit `cb81b45`)
- [x] T5 defensive-by-design (commit `9d8e816`)
- [x] T6 controlled-rework-rollback (commit `08af8af`)
- [x] T7 series-a-consistency-pass (commits `32a274b`,`74e13a7`,`efb3b36`)

### Task 1 — `nine-agents-separated-powers` (tech · 2026-08-21 · tags `agents, supervised, workflow`)

- Title VI: "Chín agent, quyền hạn tách rời" · EN: "Nine agents, separated powers".
- Angle bắt buộc (≥2 H2 mới so seeds): bảng vai trò đầy đủ + cơ chế tách quyền PM/dev/tester.
  KHÔNG lặp seed `story-workflow-idea-to-release` (kể pipeline chung) — bài này đi vào BẢNG VAI
  và VÌ SAO tách.
- Outline:
  1. Hook: đội agent không phải một agent khoẻ mạnh làm tất cả — chín vai hẹp, quyền tách rời;
     tách để chất lượng không phụ thuộc "sự cẩn thận" của một agent.
  2. TL;DR 4 bullet.
  3. H2 **"Chín vai, chín quyền hạn"** [H2 mới] — evidence: bảng 9 agent (3 nhóm: phân tích trước
     code / làm / kiểm) — quote bảng từ `src/content/docs/vi/agents-and-kit.md` §"Đội 9 agent"
     (EN: `src/content/docs/en/agents-and-kit.md` §"The 9-agent story team"). Nguồn ghi kèm.
  4. H2 **"Vì sao người viết không tự duyệt"** [H2 mới] — mâu thuẫn lợi ích; case thật: executor
     report DONE, reviewer riêng vẫn bắt scoped-style chết + lỗi escape. Evidence: quote nguyên văn
     ví dụ principle 2 docs VI (`story-workflow.md`: "khi executor báo một task đã xong, code
     reviewer riêng biệt vẫn bắt được một rule scoped-style chết và một lỗi escape mà executor đã
     tự đạt qua. Mắt khác, phát hiện khác.").
  5. H2 "Tách quyền không phải là chậm thêm" — reviewer/verifier không phải vòng thủ tục: đường
     thông tin một chiều executor → reviewer → verifier, mỗi mũi tên là điểm chặn lỗi trước khi
     lan. Evidence: ASCII diagram tự vẽ theo pipeline docs (spec → executor → review → verify →
     merge), ghi nguồn docs story-workflow.
  6. Docs-link: `agents-and-kit` (VI `/vi/docs/agents-and-kit/`, EN `/docs/agents-and-kit/`).
     Cross-link: pilot `zero-setup-agent-team` (EN `/blog/zero-setup-agent-team/`,
     VI `/vi/blog/zero-setup-agent-team/`) — "chín agent này đến từ kit nào".

### Task 2 — `gates-not-trust-rule-zero` (tech · 2026-08-22 · tags `gates, guardrails, story-workflow`)

- Title VI: "Gates, not trust — và Rule 0" · EN: "Gates, not trust — and Rule 0".
- Angle bắt buộc: CƠ CHẾ gates trong story workflow (5 gates per SF + B0–B5 + verdict) + Rule 0.
  **Khác seed `decision-gates-safe-ai-agents`** (bài đó: decision gate con người ở ngã rẽ, pending
  guards, notification) — bài này là gates MÁY kiểm story trước khi được tính Done. Nêu rõ sự khác
  này 1 câu trong bài + link seed như "bài kia đã kể tầng con người".
- Outline:
  1. Hook: "agent nói nó chạy" không phải bằng chứng — workflow thay lời hứa bằng cổng.
  2. TL;DR 4 bullet.
  3. H2 **"Gate là hợp đồng, không là niềm tin"** [H2 mới] — 5 gates tool-enforced per SF:
     preflight, diff review, test, environment snapshot, post-merge. Evidence: ASCII pipeline 5
     gates + quote nguyên văn docs VI principle 3 ("Năm gates tool-enforced chạy trên mọi
     sub-feature — preflight, diff review, test, environment snapshot, post-merge — cộng Rule 0…").
  4. H2 **"Sáu cổng B0–B5 và năm verdict"** [H2 mới] — bảng B0–B5 (browser test / code+tests /
     plan tick / review độc lập / merge / Done) + verdict COMPLETE · READY-TO-DONE · INCOMPLETE ·
     VIOLATION · NOT-LAUNCHED. Evidence: quote bảng từ `src/content/docs/vi/superpowers-panel.md`
     §"Story Ops gates" (EN twin tương ứng).
  5. H2 "Rule 0: nhìn thấy rồi mới nói xong" — 3 tầng (DOM → screenshot → flow click-through);
     case thật: flow-check bắt stale preview server dù DOM sweep pass. Evidence: quote nguyên văn
     ví dụ principle 3 docs VI ("một trang docs pass vòng quét DOM nhưng flow check phát hiện
     preview server đang phục vụ nội dung cũ từ tiến trình khác…").
  6. Docs-link: `story-workflow`. Cross-link: Task 1 `nine-agents-separated-powers` + seed
     `decision-gates-safe-ai-agents` (phân biệt).

### Task 3 — `watchdog-idle-is-not-dead` (tech · 2026-08-23 · tags `story-workflow, workflow, guardrails`)

- Title VI: "Watchdog: im lặng không phải là chết" · EN: "Watchdog: idle is not dead".
- Angle bắt buộc: 3-layer check trước khi kết luận chết; phân biệt im-lành / im-hỏng — seeds
  không có góc này.
- Outline:
  1. Hook: canh story dài mà chỉ nhìn process im lặng thì đoán mò — watchdog cấm đoán.
  2. TL;DR 4 bullet.
  3. H2 **"Ba lớp kiểm một SF"** [H2 mới] — commit gần đây / trạng thái terminal / tiến độ
     Linear. Evidence: ASCII decision-flow (im lặng → từng lớp → verdict để yên hay can thiệp) +
     quote nguyên văn docs VI principle 6 ("**Watchdog** kiểm tra ba tầng (commit gần đây, trạng
     thái terminal, tiến độ Linear) trước khi kết luận stall").
  4. H2 **"Im-lành và im-hỏng: hai case thật"** [H2 mới] — case 1: SF im trong build native dài
     → để yên; case 2: SF kẹt gate fail → resume từ commit tốt cuối. Evidence: quote nguyên văn
     câu "*Thực tế:*" principle 6 docs VI (EN twin).
  5. H2 "Resume từ commit xanh cuối" — phục hồi = đánh thức bằng input, không restart mất công;
     commit atomic là đơn vị resume. Evidence: ASCII timeline (commits xanh → stall → resume từ
     last-good), nguồn docs principle 6 + case study story-workflow.
  6. Docs-link: `story-workflow`. Cross-link: Task 2 `gates-not-trust-rule-zero`.

### Task 4 — `story-memory-learning-loop` (tech · 2026-08-24 · tags `memory, story-workflow, workflow`)

- Title VI: "Vòng lặp học của story" · EN: "The story learning loop".
- Angle bắt buộc: post-task ritual + story memory CÓ PROVENANCE; case CLI flag đổi tên giữa
  release cứu mọi story sau — seeds chỉ nhắc qua.
- Outline:
  1. Hook: story sau biết điều mà story đầu từng trả giá để học — nhờ vòng lặp, không nhờ trí nhớ.
  2. TL;DR 4 bullet.
  3. H2 **"Bài học được ghi ở đâu"** [H2 mới] — story memory kèm nguồn gốc (task nào, fix nào) —
     không phải chat log chết. Evidence: quote nguyên văn nửa đầu principle 7 docs VI.
  4. H2 **"Ritual: ba câu hỏi cuối mỗi task"** [H2 mới] — gì đã sai / cái gì fix được / pattern
     nào giữ. Evidence: ASCII vòng lặp (task xong → ritual → memory + provenance → SF kế khởi
     động thông minh hơn), nguồn docs principle 7.
  5. H2 "Từ ghi chú thành tài sản dùng chung" — case CLI flag đổi tên (quote nguyên văn ví dụ
     principle 7) + dẫn chứng thật trong repo này: `docs/superpowers/improvements-log.md` —
     quote 1 entry thật (vd entry 2026-09-04 về `orca linear comment add` body dài →
     `--body-file`), nguồn ghi file + ngày.
  6. Docs-link: `superpowers-panel` (matrix chỉ định) + được thêm `story-workflow`. Cross-link:
     Task 3 `watchdog-idle-is-not-dead`.

### Task 5 — `defensive-by-design` (tech · 2026-08-25 · tags `guardrails, workflow, agents`)

- Title VI: "Phòng thủ từ thiết kế" · EN: "Defensive by design".
- Angle bắt buộc: thiết kế cho việc MÌNH sẽ sai: dry-test lệnh mới · nothing deleted ·
  flag-not-guess; case merge conflict giữ CẢ HAI bên — seeds không có.
- Outline:
  1. Hook: hệ thống thường phòng thủ với người dùng sai; workflow này phòng thủ với chính agent
     nó — giả định người mắc lỗi là mình.
  2. TL;DR 4 bullet.
  3. H2 **"Giả định là nợ"** [H2 mới] — flag-not-guess + dry-test lệnh mới ("tài liệu nói nó chạy"
     ≠ "nó chạy"). Evidence: quote nguyên văn principle 8 docs VI.
  4. H2 **"Không xoá gì cả"** [H2 mới] — mọi thứ revert được; audit trail là ghi chú, không là
     rác (dẫn chứng: bracket SUPERSEDED được giữ lại làm audit trail — từ evidence-pack §brackets,
     quote 1 dòng + nguồn GitHub hub-store `ict-service-support-rebuild.md`).
  5. H2 "Giữ CẢ HAI bên khi conflict" — case merge conflict file notes chung. Evidence: quote
     nguyên văn ví dụ principle 8 docs VI ("…lời giải giữ cả hai bên thay vì bỏ một bên…").
  6. Docs-link: `story-workflow`. Cross-link: Task 4 `story-memory-learning-loop` (sai được ghi
     lại = nguyên liệu của vòng học).

### Task 6 — `controlled-rework-rollback` (tech · 2026-08-26 · tags `story-workflow, git, workflow`)

- Title VI: "Rework có kiểm soát — revert là tính năng" · EN: "Controlled rework — revert is a
  feature".
- Angle bắt buộc: spec đổi giữa chừng → revert last-good + re-execute như MỘT đơn vị review được;
  case FI-289 direction v1 Terminal Mono → v2 Bento Premium — seeds không có.
- Outline:
  1. Hook: spec đổi giữa chừng là bình thường; bất thường là vá chồng vá. Revert đúng chỗ biến
     rework thành một đơn vị sạch.
  2. TL;DR 4 bullet.
  3. H2 **"Last-green là điểm quay"** [H2 mới] — last known-good commit là checkpoint; revert giữ
     lịch sử (không reset --hard). Evidence: ASCII timeline (v1 commits → điểm revert → khối
     re-execute → review 1 đơn vị).
  4. H2 **"Đổi hướng không mất lịch sử"** [H2 mới] — case FI-289. Evidence: quote NGUYÊN VĂN
     từng dòng blockquote của `docs/superpowers/designs/sf1-direction.md` (file trong repo này,
     đọc file — không chép từ plan): dòng tiêu đề `"Modern Bento Premium" (D3 — user chọn
     2026-09-04, thay thế v1 Terminal Mono)` + dòng `**v2 BINDING** (2026-09-04): thay thế hoàn
     toàn v1` + dòng `DNA v1 (mono/mint/near-black) GIỮ làm nền identity` — các dòng không liền
     kề nhau, lược bớt chỗ nào ghi rõ `[…]`. Nguồn ghi file + ngày.
  5. H2 "Re-execute như một đơn vị review được" — quote nguyên văn bullet case study docs VI
     ("Rework có kiểm soát — design trực quan đổi giữa chừng (direction v1 → Bento Premium v2).
     Thay vì vá lên trên, sub-feature revert về trạng thái tốt cuối và thực thi lại theo design
     binding mới — rework được review như một đơn vị sạch.").
  6. Docs-link: `story-workflow`. Cross-link: Task 5 `defensive-by-design` + Task 2
     `gates-not-trust-rule-zero`.

### Task 7 — series-a-consistency-pass (không file mới — pass đọc chéo + fix nhỏ)

- Đọc chéo 7 bài (6 mới + pilot — pilot chỉ ĐỌC):
  - [ ] Mỗi bài (6 mới) có ≥1 cross-link cùng series (chuỗi: bài sau → bài trước; pilot là head
        qua Task 1) và đúng locale.
  - [ ] Không 2 bài nào dùng cùng evidence block CHÍNH (bảng 9 agents chỉ ở Task 1, bảng B0–B5
        chỉ ở Task 2, v.v. — trùng chủ đề được, trùng khối evidence không).
  - [ ] Mỗi bài đối chiếu lại matrix: đúng slug/ngày/category/tags + ≥2 H2 mới so 5 seeds
        (pilot KHÔNG tính là seed — nhưng T1 vẫn phân biệt với pilot bằng element pilot không
        có: BẢNG vai đầy đủ; pilot chỉ có 1 panel đoạn văn).
  - [ ] Tone nhất quán 7 bài (kỹ sản, câu ngắn, không marketing); thuật ngữ thống nhất
        (gate/SF/story/worktree giữ tiếng Anh).
  - [ ] `node scripts/check-blog-content.mjs` + `pnpm build` xanh toàn cây (parity ≥17 slug × 2
        — lớn hơn nếu series khác đã merge trước).
- Fix nhỏ phát hiện được (sai cross-link, lệch tone 1-2 câu) → commit riêng per slug
  `fix(blog): <slug> consistency pass (SF-2 T7)`. Lớn hơn → báo coordinator, không tự tiện.

## Verification (SF-level, sau Task 7)

1. `pnpm build` xanh: parity **≥17** slug × 2 (10 seed + pilot + 6 mới; số lớn hơn nếu
   series khác đã merge trước — parity pass là điều kiện, không cứng số) + lint pass toàn bộ
   (12 file mới: 0 error, 0 warning band).
2. Rule 0 browser 3 tầng trên preview `dist` — **mở TỪNG bài, không lấy mẫu** (ACCEPTANCE
   "Mở từng bài 2 locale"):
   - **Tầng 1 DOM (eval):** listing EN + VI — đếm đủ 6 bài mới, đọc TỪNG hàng listing:
     pubDate 08-21→08-26, badge category, description khớp frontmatter. Trên TỪNG trang bài
     (6 slug × 2 locale = 12 trang): TOC render (≥3 H2), meta (title/description), link docs
     đúng locale không `#anchor`, ≥1 cross-link blog trỏ bài tồn tại.
   - **Tầng 2 VISUAL (screenshot — headless Chrome cho pixel evidence; tab background của
     orca browser không screenshot được):** listing EN + VI + 12 trang bài — 14 ảnh lưu
     /tmp làm audit trail; so nhanh layout (TOC hiện, band đọc được, diagram trong fence
     render).
   - **Tầng 3 FLOW (click-through, cả hai locale):** `/blog/` → mở bài mới → TOC anchor jump
     → cross-link sang bài TỒN TẠI → về listing; lặp `/vi/blog/`.
   - Screenshot fail → NÓI THẬT "chưa xác nhận được" + nhờ user; KHÔNG fallback DOM thay
     visual.
   - Sanity RSS/hreflang (assert artifact build, không cần browser): `dist/rss.xml` chứa
     12 item mới (6 slug × 2 locale); sitemap + hreflang pair đủ cho 12 URL mới.
3. Verifier độc lập: PASS/PARTIAL/FAIL theo TỪNG dòng ACCEPTANCE context pack §ACCEPTANCE.
4. Code-reviewer độc lập trên diff SF → verdict APPROVED / CHANGES-REQUESTED (fix → re-review).
5. Security-audit mặt cuối (không secrets, path handling trong 12 file .md).
6. Merge về `story/fi359-blog-longform-20` (no-ff, merge-ngược an toàn) → story-verify sf-2 →
   FI-361 Done.
