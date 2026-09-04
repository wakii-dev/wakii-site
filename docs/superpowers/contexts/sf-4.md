# Context Pack — SF-4 Convergence QA + pre-publish (FI-293)

## Spec slice
Convergence trên nhánh đích story/fi289-wakii-site. VI user-review gate là task
ĐẦU TIÊN (copy fixes sau đó mới chạy Lighthouse/link/responsive). Pre-publish
checklist cuối: REPO_URL trỏ repo công khai thật + CTA click-through 2 locales,
OG image, hreflang, 404. Human gates: (2) VI review, (3) REPO_URL confirm.

## Touch map
- Kiểm toàn site trên build preview; fix-polish nhỏ (tokens/copy typos) cho phép
- Post-Merge đúng merge-playbook về nhánh đích

## ACCEPTANCE (user-visible)
1. VI copy được user duyệt (comment xác nhận trên FI-293)
2. Lighthouse landing: Performance + SEO ≥ 90 (bằng chứng report)
3. E2E cả 2 locales: nav, lang switch, docs sidebar, CTA không chết
4. Link integrity toàn site sạch; responsive mobile OK; 404 có
5. Pre-publish checklist tick đủ + REPO_URL confirmed bởi user
6. Preview deploy cuối cùng xanh, site release-ready

## Boundary
- KHÔNG thêm feature mới; polish-only. Vi phạm scope → flag, không tự mở
