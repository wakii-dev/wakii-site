# Story: FI-289 — Wakii Website — landing + usage guide (song ngữ EN/VI)
Destination: story/fi289-wakii-site

## SF-1 Scaffold + i18n + Design direction + Deploy nền
Tier: 0
linear:
Design: mock-prototype
What: repo Astro chạy được cả 2 locales trên Vercel preview, layout nền theo design direction user đã chọn, mọi claim marketing có nền tảng đã verify (license, inventory, slug contract)
Depends on: —
Tasks: git-remote-vercel-hookup / astro-scaffold-build-green / i18n-routing-content-mapping-lock / doc-slug-contract / repo-url-constant / seo-base-robots-sitemap / 404-hreflang-base / kit-license-verify / inventory-reconfirm / design-3-hướng-html / design-user-pick-gate / tokens-base-layout-nav-footer-langswitcher / logo-outline-subtitle / og-base / first-deploy-proof

## SF-2 Landing EN+VI
Tier: 1
linear:
Design: none
What: landing thuyết phục 6 sections render đúng cả EN/VI theo direction SF-1, CTA hoạt động, teaser link đúng slug contract
Depends on: SF-1
Tasks: hero-cta-build-from-source / zero-setup-strip-claim-theo-license-verify / features-grid-accuracy-guard / workflow-diagram / quickstart-teaser-link-docs / faq-teaser-link-docs / footer-license-credit-orca / seo-meta-landing / vi-translation / responsive-pass

## SF-3 Docs 5 trang × 2 locales
Tier: 1
linear:
Design: none
What: người mới đọc getting-started tự build + chạy được panel (steps đã validate bằng thực thi trong clean clone), 5 trang có sidebar/prev-next cả EN/VI
Depends on: SF-1
Tasks: collection-schema-sidebar-prevnext / getting-started-en / superpowers-panel-en / story-workflow-en / agents-and-kit-en-inventory-reconfirmed / faq-en / vi-translate-batch / getting-started-clean-clone-validation / seo-meta-docs

## SF-4 Convergence QA + pre-publish
Tier: 2
linear:
Design: none
What: site release-ready — VI đã user-review, Lighthouse đạt, mọi link/locale/CTA đúng trên preview deploy thật
Depends on: SF-2, SF-3
Tasks: vi-user-review-gate-trước-tất-cả / accuracy-guard-final-pass / lighthouse-landing-90 / locale-e2e-cả-2-ngôn-ngữ / link-integrity-full-site / responsive-audit / pre-publish-checklist-repourl-og-hreflang-404 / deploy-verify-preview-xanh
