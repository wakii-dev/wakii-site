# Plan — SF-2 Skills catalog page (FI-296, epic FI-294)

Worktree: `sf-2-skills` (base `story/fi294-site-content-depth`). Tier: Standard.
Spec slice: `docs/superpowers/contexts/fi294-sf-2.md` · Design binding (1:1, user-picked b):
`docs/superpowers/designs/sf2-direction.md`. Dev draft VI copy → copy gate riêng ở SF-5.

Meta-steps (KHÔNG dùng checkbox): code pass → verify Phase 5 từng dòng ACCEPTANCE →
Rule 0 browser verify 3 tầng → code-reviewer APPROVED (literal verdict) → merge no-ff
vào đích → story-verify sf-2 sạch → FI-296 Done.

## Tasks

Execution shape (plan-critic P0-2): tasks 3-11 chạm cùng 2 page files → MỘT
task-executor duy nhất, serial theo thứ tự dưới (không parallel workers).

- [x] 1. design-3-hướng-html — DONE pre-launch (designer phase, 3 HTML prototypes
      `/tmp/story/fi294/design/sf2-*.html`). Evidence: hand-off `sf2-direction.md` §1.
- [x] 2. design-user-pick-gate — DONE pre-launch (user chọn b — Bento Catalog,
      comment DESIGN-PICK trên epic). Evidence: hand-off header "user-selected: B".
- [x] 3. catalog-route-en — `src/pages/skills.astro`: Base + Nav/Footer sẵn; hero
      (kicker `## skills`, h1 + `.hl` 13 skills derive từ data, sub với inline
      `<code>`, hero-stats 3 ô derive: count/categories/MIT).
      **Token mapping PIN (plan-critic P0):** prototype name → tokens.css thật,
      ưu tiên VALUE-FIDELITY với prototype user-picked:
      `--bg-raise`(card)→`--bg-card` · term body→`--bg-raised` · `--line`→`--border` ·
      `--line-strong`→`--border-strong` · pill/inline-code bg (prototype rgba(69,224,168,.1))
      →`--accent-soft` — KHÔNG BAO GIỜ dùng `--accent-dim` (#2A6B52 solid, khác value) ·
      `--panel`/`--text-faint`/`--accent` giữ nguyên tên · literal chỉ khi không có token
      khớp value prototype. Card radius = `--radius-cell` (12px — deviation 14px ghi nhận).
      Exit: build green + 13 card + hero stats khớp số render thực (§7.1).
- [ ] 4. catalog-route-vi — `src/pages/vi/skills.astro`: song song EN, copy VI draft
      (skill name + command giữ EN); title VI; VI copy flag gate SF-5.
- [x] 5. category-grouping-theo-taxonomy-SF-1 — filter `public === true` (13),
      group workflow(4) → design(6) → reference(3), thứ tự section cứng; section-head
      copy EN/VI theo hand-off §3; category `platform` (5 skills) + 2 workflow
      internal (`public:false`) không render.
- [x] 6. card-expanded-content — bento 12-col span map hand-off §3 (w1 flagship
      `bx-big` + pill "flagship"); card anatomy `.bx-label`(command ▸ + pill) /
      `.bx-body`(h3 name, desc, bx-how dashed "how it works" + how_*); VI dùng
      desc_vi/how_vi.
- [ ] 7. install-strip-link-getting-started — terminal mockup id="install": term-bar
      3 dots + title `wakii — install`; command dựng từ `REPO_URL` (config.ts),
      format giống landing; link `→ full guide: /docs/getting-started/` (trailing
      slash, KHÔNG `#get-wakii`).
- [ ] 8. entrance-animations-qua-util — `initMotion()` đúng 1 lần (script page);
      `data-reveal` trên terminal + `.section-head` + outer `.bx` (KHÔNG trên
      `.bx-in`); KHÔNG IO/script riêng, KHÔNG data-tilt/parallax; hover lift CSS
      thuần bọc `@media (hover:hover) and (pointer:fine)`.
- [ ] 9. seo-meta-hreflang-route-mới — title `skills — wakii` / VI tương ứng
      (tránh double suffix); verify view-source canonical + hreflang en/vi/
      x-default cho cả 2 route (Base math đã agnostic — chỉ verify, không sửa);
      lang-switcher round-trip 2 chiều (ACCEPTANCE 4); regression hreflang 1
      trang docs cũ. NOTE (plan-critic): Base.astro KHÔNG có og: meta (memory
      cũ sai) — OG ngoài scope SF-2, flag lên epic cho SF-5.
- [ ] 10. cross-link-agents-and-kit — thêm link `/skills` vào
      `src/content/docs/en/agents-and-kit.md` + `vi/` (trailing slash).
- [ ] 11. responsive-pass — breakpoints hand-off §6 (>980 / ≤980 / ≤620); @390
      no horizontal overflow (iframe probe scrollWidth=390); command dài wrap
      an toàn (mono, overflow-wrap).

## ACCEPTANCE (từ context pack — verify từng dòng ở Phase 5)
1. /skills + /vi/skills từ nav: 13 skills nhóm theo category, desc + how-it-works
   đúng locale.
2. Install strip: lệnh build-from-source từ REPO_URL, click → /docs/getting-started/.
3. Cards reveal mượt khi scroll; prefers-reduced-motion (+ tắt JS) → tắt sạch,
   không card kẹt opacity 0.
4. Lang switcher EN↔VI map 2 chiều trên /skills.
5. View-source canonical + hreflang en/vi đúng cho /skills và /vi/skills.

Boundary: KHÔNG detail pages, KHÔNG sửa skills.ts/tokens.css/motion.ts/landing/
docs collection/DOC_SLUGS, KHÔNG motion cho pages khác.
