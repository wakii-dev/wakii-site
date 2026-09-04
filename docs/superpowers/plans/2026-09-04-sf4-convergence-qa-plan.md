# Plan — SF-4 Convergence QA + pre-publish (FI-293)

Tier: Standard · Branch: sf-4-qa (base story/fi289-wakii-site @ 9f97d64) · Linear: FI-293

## Phase 0 (abbreviated — Standard tier)

**Touch map:** toàn site trên build preview (13 pages: / + /vi/ + 5 doc slugs × 2 locales).
Fix-polish nhỏ cho phép: copy typos VI/EN, link trailing slash, meta/OG nhỏ. KHÔNG tokens/layout trừ bug thật.
Biên merge: story/fi289-wakii-site (no-ff, merge-playbook).

**Risks:**
- VI copy chưa user-review → mọi QA final trên VI phải chờ sau gate (human gate 1).
- REPO_URL + SITE_URL là placeholder → human gate 2 (user confirm) trước khi public.
- Stale preview server có thể serve content cũ → luôn kill + rebuild trước verify.
- Site không có unit-test infra → QA dựa trên build xanh + browser Rule 0 + link crawler.

## Tasks (thứ tự bắt buộc — VI gate đầu tiên)

- [ ] **Task 1 — vi-user-review-gate-trước-tất-cả:** build + preview local, post comment preview URL + danh sách 6 trang VI (/vi/, /vi/docs/{5 slugs}/) lên FI-293, VERIFY-FAIL-WAIT chờ user duyệt. Trong lúc chờ: QA scaffold không phụ thuộc VI copy.
  - Build xanh 13 trang, preview :4321 sống (EN+VI 200). Comment gate: https://linear.app/my-app-hoivu/issue/FI-293/sf-4-convergence-qa-pre-publish-wakii-website#comment-4062441f
  - Rule 0 visual check: VI landing + VI getting-started render đúng (screenshots /tmp/sf4-vi-*.png). ĐANG CHỜ user phản hồi.
- [ ] **Task 2 — accuracy-guard-final-pass:** đối chiếu mọi claim/copy với nguồn đã verify (kit-license verdict, inventory 6 features, footer credit, không "Stories tab").
- [ ] **Task 3 — lighthouse-landing-90:** Lighthouse landing EN+VI, Performance + SEO ≥ 90, lưu bằng chứng report.
- [ ] **Task 4 — locale-e2e-cả-2-ngôn-ngữ:** Rule 0 flow: nav, lang switch, docs sidebar, prev-next, CTA click-through cả 2 locales.
- [ ] **Task 5 — link-integrity-full-site:** crawl toàn bộ internal links (trailing slash contract `/docs/<slug>/`), không 404 internal.
- [ ] **Task 6 — responsive-audit:** mobile viewport audit các key pages (Rule 0 visual).
- [ ] **Task 7 — pre-publish-checklist:** REPO_URL confirm (human gate — user), OG image, hreflang, 404 page, sitemap/robots.
- [ ] **Task 8 — deploy-verify-preview-xanh:** preview deploy cuối cùng xanh, site release-ready.

## Done criteria (ACCEPTANCE — context pack sf-4.md)

1. VI copy được user duyệt (comment trên FI-293) · 2. Lighthouse Perf+SEO ≥ 90 (bằng chứng) · 3. E2E 2 locales sạch · 4. Link integrity sạch + responsive OK + 404 có · 5. Checklist tick đủ + REPO_URL confirmed · 6. Preview xanh, release-ready.

## Quy trình DONE

Rule 0 browser 3 tầng → code-reviewer độc lập trên diff → merge no-ff → story-verify sf-4 sạch → FI-293 Done (theo đúng thứ tự, không đảo).
