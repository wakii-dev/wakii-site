# Story: FI-300 — Direct downloads + mobile connect

Destination: story/fi300-downloads-mobile

## SF-1 Releases foundation
Tier: 0
linear:
Design: none
What: Visitor thấy mục Download trên nav/footer + roadmap + docs đều nói nhất quán về downloads/mobile theo đúng trạng thái flag — khi chưa có binary thì KHÔNG có link chết nào, chỉ có hướng dẫn build-from-source + follow releases
Depends on: —
Tasks: config-flags-and-urls (DOWNLOAD_URLS/DOWNLOADS_LIVE/MOBILE_STORE_URLS/MOBILE_LIVE default false + runbook comment) / i18n-keys-EN-full-set (download + mobile-connect + teaser, cả 2 biến thể flag) / i18n-keys-VI-full-set (song song EN, draft gate G-D) / roadmap-copy-flag-aware (G-B) / docs-getting-started-note-EN-VI (G-E) / nav-footer-download-link / faq-zerosetup-flag-sync / lighthouse-baseline-record

## SF-2 Download page + mobile connect component
Tier: 1
linear:
Design: mock-prototype
What: Visitor vào /download (EN+VI) thấy đúng nút theo hệ điều hành (flag on) hoặc hướng dẫn build + follow releases (flag off), và thấy block mobile app với badges iOS/Android + QR (flag on) hoặc coming soon (flag off)
Depends on: SF-1
Tasks: route-EN / route-VI / platform-manual-tabs-noJS-fallback / download-buttons-per-platform-flag-aware-warn (G-A, G-I) / mobile-connect-block-component (G-QR, G-C, G-A2) / seo-hreflang-canonical / entrance-animations-qua-util / responsive-pass
Design-note: design phase (3 hướng → user pick → hand-off docs/superpowers/designs/sf-downloads-direction.md) chạy PRE-LAUNCH cover toàn bộ surfaces story; dev tasks ở đây dev-only

## SF-3 Landing Get Wakii upgrade + mobile teaser
Tier: 2
linear:
Design: none
What: Visitor trên landing thấy Get Wakii upgrade — download là primary CTA (theo flag), build-from-source secondary — và teaser mobile app dẫn sang /download; nav-cta trỏ đúng theo flag
Depends on: SF-1, SF-2
Tasks: get-wakii-restructure-download-primary-source-secondary / wire-keys-SF-1 / download-cta-flag-aware (G-A, G-H) / nav-cta-repoint-theo-flag (G-H) / mobile-teaser-placement (reuse component SF-2) / anchor-sync-verify-thực (G-F) / entrance-wire-only / locale-switch-pass / responsive-pass

## SF-4 Convergence QA
Tier: 3
linear:
Design: none
What: Toàn bộ surfaces story sạch khi audit: copy EN+VI duyệt được ở CẢ 2 biến thể flag, mọi URL resolve đúng theo flag, Lighthouse đạt 2 mục tiêu, e2e flow landing → /download → platform → mobile chạy trọn, mock flip cả 2 flags render đúng
Depends on: SF-3
Tasks: vi-copy-gate-cả-2-biến-thể-flag (G-D, chạy trước) / download-link-integrity-cả-2-flag-groups / hreflang-locale-audit / reduced-motion-audit / perf-audit-2-mục-t tiêu (landing ≥ baseline, /download ≥95) / cross-surface-visual-consistency / e2e-flow-full / flag-flip-runbook-drill (mock flip — CHẠY SAU copy-gate)
