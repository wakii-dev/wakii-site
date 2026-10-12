# SF-5 Context Pack — Convergence QA + release checkpoint

> Đọc file này THAY VÌ tự tổng hợp từ bracket+epic+comments.
> Epic spec: docs/superpowers/specs/2026-10-12-article-reading-redesign.md
> Epic Linear: FI-63 · Story dest: `story-fi63-article-reading`
> **Tier 2 — dep SF-2+SF-3+SF-4 (tất cả đã merged vào nhánh đích). Chạy TRÊN nhánh đích.**

## Spec slice (chỉ phần SF-5 chịu trách nhiệm)

1. Cross-SF walkthrough browser flow THẬT (Rule 0 — 3 tầng DOM/screenshot/
   flow) cả EN + VI: mở bài dài → đọc → scrollspy highlight → copy code →
   anchor section → follow block → pager prev/next. Screenshot BEFORE/AFTER.
2. Mobile 375px sweep + short-viewport (~700px cao) rail overflow check:
   không 2 TOC cùng lúc; bảng rộng cuộn trong cột; rail không che
   recent-posts/lang.
3. A11y audit: keyboard-only pass toàn bộ affordances mới; reduced-motion
   pass (không animation trang trí); SR labels (aria-current, aria-live
   copy feedback, landmark phân biệt).
4. Perf check BINARY: tổng client JS thêm ≤120 dòng đếm được QUA CẢ 2
   module (code-enhancements + reading-nav); CLS ≤ 0.02 before/after trên
   1 bài dài (Lighthouse hoặc đo layout shift).
5. Build checks: `npm run build` (parity → utils → content → astro build
   → og) xanh toàn bộ.
6. **`npm run check:jsonld` chạy RÕ RIỆT** (script riêng, KHÔNG nằm trong
   build chain — P1 plan-critic) + sitemap verify thủ công: dist
   `sitemap-*.xml` tồn tại và có blog URLs.
7. Coexistence check post-merge: 3 enhancement load cùng lúc không lỗi
   console; không duplicate landmark (aria-label vẫn phân biệt); JS ≤120
   dòng cross-module.
8. Region-integrity diff: story branch vs từng SF branch — xác nhận rule
   additive-only của SF-1 giữ nguyên vẹn (không ai sửa declaration SF-1,
   không ai đụng Base/motion.ts).
9. Security-audit checkpoint (OWASP surface + repo-hygiene: secrets/.env
   trong diff, exec-bit mới, permissions, lockfile-deps). Phase không
   checkpoint nếu còn P0/P1.
10. Release checkpoint (phase-gate): mọi SF tier 1 merged + story-verify
    sạch → visual sign-off (coordinator visual review checklist EN+VI
    desktop+mobile qua Orca browser) → báo sẵn sàng CLOSE (push dest + PR).

## Touch map (files SF-5 tạo/sở hữu)

```
KHÔNG code production. SF-5 = verify + audit + checkpoint.
Có thể sửa: lỗi integration nhỏ tìm thấy (theo task-executor fix flow,
commit riêng, ghi rõ trong Linear). Lỗi lớn hơn → trả về SF owner.
Đọc: toàn bộ src/layouts/BlogDetailLayout.astro, src/components/BlogToc.astro,
src/components/blog/FollowBlock.astro, 2 client modules, dist/ artifacts.
```

## ACCEPTANCE (user-visible)

- Một người thật mở bài trên cả EN + VI, desktop + mobile 375px: đọc được
  bài đẹp (measure/typography/bảng), theo dõi được vị trí (TOC highlight +
  progress + back-to-top), copy được code + link section, thấy khối follow
  cuối bài — LIỀN MẠCH, không xung đột giữa các affordances.
- Keyboard-only + reduced-motion đi được toàn bộ flow trên.
- `npm run build` + `npm run check:jsonld` xanh; sitemap có blog URLs.
- Không console error khi cả 3 enhancement chạy cùng lúc.
- Không secrets/exec-bit/lockfile rác trong diff story (audit sạch P0/P1).

## Boundary (KHÔNG làm)

- KHÔNG refactor code của SF khác ("nhân tiện đẹp hơn") — chỉ fix bug
  integration, commit riêng.
- KHÔNG merge vào primary / KHÔNG tạo PR (CLOSE là việc coordinator;
  SF-5 báo READY).
- KHÔNG đổi scope (không thêm affordance mới phát sinh — flag user).
- KHÔNG đụng Base.astro/motion.ts kể cả để "sửa lỗi" — lỗi đó là blocker
  escalate, không patch chui.
