# Story: FI-294 — Wakii Site — content depth & engagement (skills · triết lý · download · roadmap · motion)

Destination: story/fi294-site-content-depth

## SF-1 Content foundation + shared motion
Tier: 0
linear:
Design: none
What: nền nội dung dùng chung cho cả story — data modules đủ 20 skills + roadmap + TOÀN BỘ i18n keys mới ×2 locales, motion util reveal/stagger tách từ Landing + componentize landing sections (SF-3/4 không cùng sửa 1 file), Lighthouse baseline trước mọi trang mới, Nav/Footer có Skills+Roadmap links, số liệu kit đồng bộ 20/24 toàn site
Depends on: —
Tasks: skills-triage-gate-list-ghi-notes / skills-data-en-đủ-20-từ-kit-frontmatter / skills-data-vi / roadmap-data-en-vi-theo-nội-dung-đã-duyệt / philosophy-copy-en / philosophy-copy-vi / i18n-keys-pre-add-đầy-đủ-philosophy-workflow-getwakii / motion-util-extract-từ-Landing / landing-sections-componentize / nav-footer-links-skills-roadmap / kit-counts-sync-17-23-thành-20-24 / lighthouse-baseline-đo-trước-tren-và-vi

## SF-2 Skills catalog page
Tier: 1
linear:
Design: mock-prototype
What: người vào /skills (và /vi/skills) thấy skills đã triage nhóm theo category kiểu aihero, mỗi skill đọc được mô tả + cách làm việc, install strip dẫn sang getting-started, trang có entrance animation
Depends on: SF-1
Tasks: design-3-hướng-html / design-user-pick-gate / catalog-route-en / catalog-route-vi / category-grouping-theo-taxonomy-SF-1 / card-expanded-content-mô-tả-cách-làm-việc / install-strip-link-getting-started / entrance-animations-qua-util / seo-meta-hreflang-route-mới / cross-link-agents-and-kit-sang-catalog / responsive-pass

## SF-3 Download + Roadmap
Tier: 1
linear:
Design: mock-prototype
What: landing có section Get Wakii thay quickstart (clone + make + repo link qua REPO_URL + requirements), /roadmap + /vi/roadmap hiện Now/Next/Later đúng nội dung đã duyệt
Depends on: SF-1
Tasks: design-3-hướng-html / design-user-pick-gate / get-wakii-component-thay-quickstart-wiring-keys-từ-SF-1 / placeholder-mode-repo-link-qua-REPO_URL-constant / nav-cta-decision-note-ghi-epic / roadmap-route-en / roadmap-route-vi / roadmap-entrance-qua-util / seo-meta-hreflang-route-mới / responsive-pass

## SF-4 Philosophy + landing deepening
Tier: 1
linear:
Design: none
What: landing có philosophy section 8 trụ cột dạng card rút gọn + link heading-anchor sang story-workflow.md; section #workflow hiện có giải thích rõ cách 9 agents + gates B0-B5 làm việc
Depends on: SF-1
Tasks: philosophy-section-structure-8-pillar-cards / philosophy-copy-wiring-en / philosophy-copy-wiring-vi / pillar-heading-anchor-trong-docs / workflow-deepen-en-9-agents-gates / workflow-deepen-vi / entrance-animations-qua-util / responsive-pass

## SF-5 Animation pass + convergence QA
Tier: 2
linear:
Design: none
What: site motion hoàn thiện — landing sâu (scroll-triggered reveals, stagger upgrade), docs nhẹ (reveal tinh tế), reduced-motion tắt sạch mọi thứ mới, perf ≥ baseline SF-1; copy mới EN+VI user-reviewed; links/hreflang/locales toàn site sạch
Depends on: SF-2, SF-3, SF-4
Tasks: copy-review-gate-en-vi-trước-tất-cả / landing-motion-deep-pass / docs-light-reveals / motion-util-extend-duy-nhất-SF-này / reduced-motion-audit-toàn-site / perf-audit-từ-baseline-SF-1 / link-integrity-hreflang-audit-full-site / locale-e2e-trang-mới / release-readiness-build-preview-smoke
