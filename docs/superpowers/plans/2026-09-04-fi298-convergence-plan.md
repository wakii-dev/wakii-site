# SF-5 Animation pass + convergence QA (FI-298) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đóng story FI-294 sạch — copy gate EN+VI (binary, trước tất cả), landing motion deep pass + docs light reveals, reduced-motion/perf/links/locales audit toàn site sau merge SF-1..4.

**Architecture:** Motion qua shared util `src/components/motion.ts` (SF-5 duy nhất được extend — thêm helper `revealChildren` cho docs). Copy là READ-ONLY trừ sửa theo VI gate feedback. Hai fix cosmetic sanctioned (footer wrap, lang-switch hash) theo tier-gate exception. Canonical: quyết định (b) self-referencing per locale — epic FI-294 đã delegate cho SF-5.

**Tech Stack:** Astro 5 static, TypeScript, CSS kill-switch `global.css @media (prefers-reduced-motion: reduce)`.

**Linear Issue:** FI-298 (story FI-294, epic context pack `docs/superpowers/contexts/fi294-sf-5.md`)

**Baseline (SF-1, không đo lại):** Lighthouse perf `/` = 99, `/vi/` = 99 (best-run, đóng tab — noise 86 khi mở tab animated là environmental, không phải regression).

**Boundary recap (context pack):** KHÔNG đổi copy (trừ VI gate feedback) · KHÔNG thêm routes · KHÔNG đụng DOC_SLUGS/REPO_URL/config · KHÔNG đụng mockup kit markup · bug SF-2/3/4 → report epic, trừ cosmetic 1-2 dòng.

---

### Task 1: Copy review gate EN+VI — TRƯỚC TẤT CẢ

**Files:**
- Create: `/tmp/story/fi294/copy-review-sf5.html` (artifact review, không commit)
- Read-only: `src/data/skills.ts`, `src/data/roadmap.ts`, `src/i18n/landing.ts`

- [ ] **Step 1: Trích xuất copy mới của story 2 ×2 locales** — script node đọc 3 data modules + `src/components/RoadmapPage.astro` (h2/sub VI draft SF-3 sống ở đây, không phải data module), render HTML bảng cạnh nhau EN | VI cho: skills (13 public: name/desc/how-it-works), roadmap (lanes Now/Next/Later + items + page h2/sub), philosophy (8 pillars + sub), workflowDeep (agents block + gates B0-B5), getWakii (steps/req/cta/note). Gate do COORDINATOR giữ (AskUserQuestion) — không giao worker.

- [ ] **Step 2: Post epic comment** `orca linear comment add --id FI-294 --body-file -` — link artifact + hướng dẫn view (`open /tmp/story/fi294/copy-review-sf5.html`), ghi rõ "copy gate binary — cần user confirm trước motion pass".

- [ ] **Step 3: USER CONFIRM qua chat (AskUserQuestion)** — Approved → tick + ghi no-changes ở Task 2; có feedback → liệt kê chính xác key/locale cần sửa rồi sang Task 2. KHÔNG tự duyệt thay user.

**Meta (numbered, không checkbox):**
1. Gate binary — user là người duyệt, artifact chỉ là vehicle.
2. VI là trọng tâm (khối lượng dịch); EN review cùng lượt.

### Task 2: Áp dụng copy feedback (hoặc ghi no-changes)

**Files:**
- Modify (CHỈ nếu có feedback): `src/data/skills.ts`, `src/data/roadmap.ts`, `src/i18n/landing.ts`

- [ ] **Step 1:** Nếu có feedback — sửa đúng key/locale user chỉ, KHÔNG mở rộng sang key khác.
- [ ] **Step 2:** `npm run build` — Expected: xanh, 17 pages.
- [ ] **Step 3: Commit** `git add <files> && git commit -m "copy(sf-5): áp feedback copy gate VI/EN (FI-298)"` (hoặc nếu no-changes: không commit, ghi dòng no-changes vào plan + audit comment).

### Task 3: Canonical self-referencing (verdict b) — Base.astro

**Files:**
- Modify: `src/layouts/Base.astro:26-42`

**Quyết định (b) — self-referencing per locale.** Lý do: Google guidance — canonical không self-referencing có thể khiến hreflang cluster bị bỏ qua; hreflang en/vi/x-default đã đúng 2 chiều nên chỉ cần canonical trỏ own URL. Hreflang giữ nguyên.

- [ ] **Step 1: REPLACE dòng 39 (không thêm — tránh duplicate canonical):** giữ `canonicalPath` (dùng cho hreflang EN + x-default), đổi dòng canonical cũ thành:

```astro
<link rel="canonical" href={new URL(pathname || '/', Astro.site)} />
```

- [ ] **Step 2: Build + verify 17 pages** — `npm run build`, rồi grep dist (assert ĐÚNG 1 canonical/page — không dùng head -1):

```bash
for f in $(find dist -name "*.html"); do
  n=$(grep -c '<link rel="canonical"' "$f")
  url=$(grep -o '<link rel="canonical" href="[^"]*"' "$f" | sed 's/.*href="//;s/"//')
  echo "$n | $f -> $url"
done | sort | uniq -c | head; echo "---non-self:"; for f in $(find dist -name "*.html"); do
  url=$(grep -o '<link rel="canonical" href="[^"]*"' "$f" | sed 's/.*href="//;s/"//')
  case "$f" in dist/index.html) own="SITE/";; *) own="SITE${f#dist}";; esac
  [ "${url#SITE}" = "${own}" ] || echo "MISMATCH $f -> $url (own=$own)"
done
```

Expected: count canonical = 1/page; MISMATCH rỗng. (404 page canonical self cũng harmless — noindex.)
- [ ] **Step 3: Verify hreflang cluster nguyên vẹn** — spot-check `/skills/` + `/vi/skills/`: hreflang en → EN URL, vi → VI URL, x-default → EN URL (giữ như cũ).
- [ ] **Step 4: Commit** `git commit -m "seo(sf-5): canonical self-referencing per locale, giữ hreflang cluster (FI-298)"`

### Task 4: Footer `.links` overflow 442px@390 — wrap fix (cosmetic)

**Files:**
- Modify: `src/components/Footer.astro` (`.links` block, ~dòng 60)

- [ ] **Step 1:** Thêm `flex-wrap: wrap;` vào `.links` (gap: 10px hiện có đã áp cả 2 trục khi wrap).

```css
.links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
```

- [ ] **Step 2: Verify iframe probe @390** trên `/` và `/roadmap` — Expected: `document.documentElement.scrollWidth <= 390` (hết overflow 442).
- [ ] **Step 3: Commit** `git commit -m "fix(sf-5): footer .links wrap — hết overflow 442px@390 (FI-298)"`

### Task 5: Lang-switch drop anchor hash — preserve fix (cosmetic)

**Files:**
- Modify: `src/components/LangSwitcher.astro` (thêm script cuối file)

- [ ] **Step 1:** Thêm script preserve hash khi click lang link:

```html
<script>
  // Preserve anchor hash khi chuyển locale (docs deep-link, vd /docs/story-workflow/#philosophy)
  document.querySelectorAll<HTMLAnchorElement>('.lang-switch a').forEach((a) => {
    a.addEventListener('click', () => {
      if (location.hash && !a.href.includes('#')) a.href += location.hash;
    });
  });
</script>
```

- [ ] **Step 2: Verify flow (tiêu chí binary đã pin)** — mở `/docs/story-workflow/#philosophy`, click VI → Expected: URL `/vi/docs/story-workflow/#philosophy`, không 404, không jump sai (hash EN không tồn tại trang VI → browser đứng top — strictly better-than-drop; KHÔNG map slug EN→VI). Verdict pinned: giữ hash mọi trường hợp.
- [ ] **Step 3: Commit** `git commit -m "fix(sf-5): lang-switch giữ anchor hash khi chuyển locale (FI-298)"`

### Task 6: Motion util extend — `revealChildren` helper

**Files:**
- Modify: `src/components/motion.ts` (thêm export cuối file)

- [ ] **Step 1:** Thêm helper — tag direct children của một container với `.reveal` TRƯỚC khi `initMotion()` quét (initMotion query lúc init nên helper phải chạy trước):

```ts
/**
 * SF-5 extension — tag direct children of `container` with `.reveal` so the
 * existing initMotion() IntersectionObserver reveals them per-batch (60ms
 * stagger). Call BEFORE initMotion(). No-op when reduced-motion is on (the
 * .anim gate in motion.css keeps children visible without JS classes).
 */
export function revealChildren(container: ParentNode, selector: string): void {
  container.querySelectorAll(selector).forEach((el) => el.classList.add('reveal'));
}
```

- [ ] **Step 2:** Không đổi hành vi hiện tại — `npm run build` xanh là đủ (helper mới, chưa consumer).
- [ ] **Step 3: Commit** `git commit -m "feat(sf-5): motion util — revealChildren helper cho docs light reveal (FI-298)"`

### Task 7: Landing motion deep pass

**Files:**
- Modify: `src/components/landing/Faq.astro:22-27` (details → data-reveal)
- Modify: `src/components/landing/Workflow.astro:48-56` (gate cards → data-reveal)

Current state đã tốt: section-heads + bento + GetWakii cells + Philosophy pillars + agents/gates blocks đã reveal (SF-2/3/4). Deep pass = lấp gap còn reveal nguyên khối:

- [ ] **Step 1: Faq.astro** — từng `<details>` nhận `data-reveal`:

```astro
{t.faq.items.map((item) => (
  <details data-reveal>
    <summary>{item.q}</summary>
    <div class="ans">{item.a}</div>
  </details>
))}
```

- [ ] **Step 2: Workflow.astro** — từng gate card nhận `data-reveal` (batch stagger 60ms của IO thay vì khối `.gates` reveal một lần):

```astro
{t.workflowDeep.gates.map((gate) => (
  <div class="gate" data-reveal>
```

Giữ `.gates` block reveal cho title/intro. **LƯU Ý nested-reveal (plan-critic P1):** parent `.gates.reveal` + children `.gate[data-reveal]` cùng vào 1 IO batch → fade chồng nhau. Browser check Step 3 quyết: nếu compound fade xấu → fix path đã pre-authorize: bỏ `reveal` khỏi `.gates`, thay bằng `data-reveal` riêng trên `.agents-title`/`.gates-title` + `.gates-intro`/`.agents-intro`.
- [ ] **Step 3: Build + browser check** — scroll landing: FAQ items + gate cards fade-in staggered; reduced-motion: đứng im visible (contract `.anim` gate).
- [ ] **Step 4: Commit** `git commit -m "feat(sf-5): landing deep pass — stagger FAQ items + gate cards (FI-298)"`

### Task 8: Docs light reveals (DocsLayout)

**Files:**
- Modify: `src/layouts/DocsLayout.astro` (import motion.css + script)

- [ ] **Step 1:** Thêm vào DocsLayout:

```astro
import '../styles/motion.css';
```

```html
<script>
  // Docs light reveal — fade-in nhẹ per block khi scroll, giữ đọc là chính.
  // Tag TRƯỚC initMotion() (IO quét lúc init). Reduced-motion: initMotion
  // early-return + .anim gate → static visible.
  import { initMotion, revealChildren } from '../components/motion';
  const article = document.querySelector('.docs-article');
  if (article) {
    revealChildren(article, '.prose > *');
    initMotion();
  }
</script>
```

Và scoped style trong DocsLayout (bxreveal 28px quá mạnh cho prose — override nhẹ hơn, vẫn transform/opacity only, kill-switch RM vẫn thắng vì `animation: none !important`):

```css
.docs-article :global([data-reveal].reveal-in) {
  animation: docsreveal 0.45s ease both;
}
@keyframes docsreveal {
  from {
    opacity: 0;
    transform: translate3d(0, 10px, 0);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
```

- [ ] **Step 2: Verify đọc không bị phá** — docs page scroll chậm: paragraph fade-in tinh tế (0.55s, không translate lớn); bật reduced-motion → đứng im visible ngay.
- [ ] **Step 3: Commit** `git commit -m "feat(sf-5): docs light reveals qua revealChildren + DocsLayout (FI-298)"`

### Task 9: Reduced-motion audit toàn site

**Files:** read-only + evidence `/tmp/story/fi294/sf5-verify/`

- [ ] **Step 1: DOM sim** (contract: no-JS/RM → không `.anim` → opacity 1) — headless probe các pages chính (`/`, `/vi/`, `/skills`, `/roadmap`, docs ×1): remove `.anim` → đo computed opacity của `.reveal`/`[data-reveal]` mẫu. Expected: 1/1.
- [ ] **Step 2: Emulate RM thật** — CDP `Emulation.setEmulatedMedia prefers-reduced-motion: reduce` (hoặc `--force-prefers-reduced-motion`) → screenshot landing + docs. Expected: không element nào opacity 0, không animation chạy.
- [ ] **Step 3: Grep audit** — mọi animation mới SF-2/3/4/5 phải nằm sau kill-switch `global.css:65` (`animation: none !important`) hoặc `.anim` gate. Grep `@keyframes` + `animation:` ngoài motion.css/global.css → từng hit phải gated.

### Task 10: Perf audit từ baseline SF-1

**Files:** read-only

- [ ] **Step 1: Grep layout-thrash** — mọi animate mới chỉ transform/opacity. Grep `@keyframes` trong `src/` → từng keyframe chỉ chứa `transform`/`opacity` (filter các exception hiện có: `blink` steps opacity — đã có từ trước).
- [ ] **Step 2: Lighthouse** — PREREQ: `npm run preview` đang chạy @4321 + Chrome đầy đủ available (không dùng playwright headless shell — screenshot fail im lặng theo memory). Đóng tab, best-run 3 lần:

```bash
npx lighthouse http://localhost:4321/ --only-categories=performance --output=json --quiet --chrome-flags="--headless" 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['categories']['performance']['score']*100)"
```

Expected: ≥ 99 cả hai (baseline). Dưới → SO SÁH từng metric vs SF-1 notes, xác định regression thật hay environmental noise, không tick cho tới khi giải thích được.
- [ ] **Step 3: Ghi số vào audit comment cuối run.**

### Task 11: Link integrity + hreflang audit full site

**Files:** read-only + script `/tmp/story/fi294/link-audit.py`

- [ ] **Step 1: Crawl dist** — script python quét mọi `*.html` trong dist, extract mọi internal `<a href>` + canonical + hreflang → resolve: (a) mọi internal link tồn tại file đích (trailing slash `/docs/<slug>/` contract); (b) không link số dòng; (c) cross-links mới: nav Skills/Roadmap, agents-and-kit → `/skills`, philosophy → anchor `/docs/story-workflow/#philosophy` + `/vi/docs/story-workflow/#triết-lý`. Expected: 0 dead.
- [ ] **Step 2: hreflang/canonical matrix** — 17 pages × (canonical == self [Task 3], hreflang en↔vi đúng cặp, x-default → EN). Expected: sạch toàn matrix.
- [ ] **Step 3: Flag out-of-scope ghi nhận** (không fix): OG meta site-wide (SF-1 Base contract), nav active-link mechanism — post epic trong audit comment cuối.

### Task 12: Locale e2e trang mới (browser, 3 tầng)

**Files:** read-only + screenshots `/tmp/story/fi294/sf5-verify/`

- [ ] **Step 1: FLOW** — đi trọn: nav → landing (scroll qua landing deepen: philosophy stagger, workflow gates stagger, FAQ stagger) → `/skills` expand card → nav Roadmap → `/roadmap` lane-read → docs story-workflow anchor philosophy → lang-switch mỗi trang (2 chiều ×: `/skills↔/vi/skills`, `/roadmap↔/vi/roadmap`, docs) → VI fallback không 404.
- [ ] **Step 2: VISUAL** — screenshot mỗi chặng, so design binding (tokens mint/near-black, bento language).
- [ ] **Step 3: Responsive 390** — iframe probe (không dùng --window-size bị clamp): mọi pages scrollWidth == 390, footer đã wrap (Task 4).
- [ ] **Step 4: scroll-behavior smooth embed quirk** — ghi nhận behavior trong embedded browser (known, browser thật OK); quyết: không đổi (kill-switch `html { scroll-behavior: auto }` đã có cho RM) — ghi verdict vào audit.

### Task 13: Release readiness + smoke

**Files:** read-only

- [ ] **Step 1:** `npm run build` xanh — 17 pages.
- [ ] **Step 2:** Smoke `astro preview` — curl từng route (17) Expected 200, grep content key (`/skills` hero, `/roadmap` lane title, docs anchors).
- [ ] **Step 3:** Vercel preview deploy (hook có sẵn — nếu token còn) + smoke preview URL. Không bắt buộc nếu token hết hạn — ghi rõ.

---

## Meta checklist (numbered — KHÔNG phải task checkbox)

1. **Rule 0 browser verify 3 tầng** — coordinator TỰ làm (Task 12 là khung): DOM eval + screenshots + flow walkthrough. Screenshot fail → nói thật, nhờ user.
2. **Tester ĐỘC LẬP** — dispatch `code-reviewer` trên diff SF (commit list cố định). CHANGES-REQUESTED → fix → re-review scoped commit mới. APPROVED → post comment literal `VERDICT: APPROVED` lên FI-298.
3. **MERGE** — no-ff vào `story/fi294-site-content-depth` (temp worktree nếu cần; conflict improvements-log → giữ CẢ HAI entries) + audit comment merge-hash lên FI-298.
4. **GATE CỨNG** — `~/.claude/bin/story-verify sf-5` sạch (không FAIL/VIOLATION/OUTBOX) → mới qua 5.
5. **Done** — `orca linear status set --id FI-298 --to Done` SAU merge. Linear Done trước merge = INCOMPLETE.

## Flag classification (audit comment cuối run — batch-audit ON)

| Flag | Quyết SF-5 |
|---|---|
| Canonical VI→EN | **OWN** — Task 3, verdict (b) |
| VI copy hero/section/roadmap + EN | **OWN** — Task 1-2 gate |
| Footer 442px@390 | **OWN** — Task 4 (cosmetic exception) |
| Lang-switch drop hash | **OWN** — Task 5 (cosmetic exception) |
| Landing/docs motion | **OWN** — Task 6-8 |
| OG meta site-wide | OUT-OF-SCOPE — Base.astro SF-1 contract, không trong touch map → flag epic |
| Nav active-link mechanism | OUT-OF-SCOPE — feature mới ngoài spec slice → flag epic (đề nghị story 3) |
| Hand-off §6 annotation (stacked vs 2 cột) | NO-ACTION — implement theo prototype 1:1, đúng ý |
| scroll-behavior smooth embed quirk | NO-ACTION — browser thật OK, RM kill-switch có sẵn → ghi verdict |
| Nav-cta → getting-started | NO-ACTION — đã quyết trên epic 14:22 |
| Breakpoint 1024 vs 1020 sibling | NO-ACTION (pinned) — align ngoài cosmetic exception → flag-only |
| LangSwitcher fix ~6 dòng (ngoài "1-2 dòng") | Sanctioned trong convergence lang-switch correctness (acceptance 5) — ghi rõ audit |

## P1/P2 plan-critic đã áp (2026-09-04)
- P0: task-store deps (#2←all, #6←#3#4#5, #5←#1); canonical REPLACE + assert 1/page
- P1: docs keyframe nhẹ hơn scoped trong DocsLayout; Task 5 verdict pinned; Task 7 nested-reveal fix path pre-authorized; Task 10 prereq preview+Chrome
- P2: RoadmapPage.astro vào extraction; 404 canonical harmless note; DOM-sim là evidence chính (screenshot phụ); improvements-log addendum lúc merge; breakpoint flag-only
