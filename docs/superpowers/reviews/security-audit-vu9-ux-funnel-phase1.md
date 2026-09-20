# Security Audit — VU-9 ux-funnel Phase 1 checkpoint

- **Date**: 2026-09-20 ~18:00
- **Scope**: `git diff main...HEAD` @ `97ab27a` (nhánh đích `story/vu9-ux-funnel`) — SF-1 key store + SF-2 landing understand-layer/CTA + SF-3 download upgrade. 20 files, +4226/−260. Astro static site.
- **Verdict**: FINDINGS — P0: 0 · P1: 0 · P2: 3 → **CLEAN cho phase checkpoint** (P2 hardening only, không chặn).
- **Auditor**: security-audit agent (độc lập với SF devs), dispatched bởi coordinator.

## Tóm tắt điều hành
**Mức rủi ro tổng thể**: THẤP · **Findings**: 3 (0 Critical, 0 High, 3 P2-hardening)

Sửa tiền đề quan trọng: SF-3 fetch GitHub API là **BUILD-TIME** (`src/utils/release.ts:97`, frontmatter `await`, memoized 1 call/process) — KHÔNG phải client-side. Toàn bộ `dist/` có 0 tham chiếu tới `api.github.com`; dữ liệu API đóng băng vào HTML tĩnh lúc build, client không gọi API nào. Surface runtime mới = 1 script PE OS-detect tĩnh.

## P2 findings

| ID | Vấn đề | Vị trí | Conf | Fix gợi ý |
|----|-------|----------|------|-----------|
| P2-1 | Thiếu allowlist host/scheme cho URL từ API data (`browser_download_url`/tag URL nguyên văn từ API, không assert prefix `https://github.com/wakii-dev/wakii/releases/download/`; khả dụng THẤP — cần quyền ghi repo) | `src/utils/release.ts:122-131` + `DownloadPage.astro` `latestTagUrl` | high | `resolveAsset`: `hit.startsWith(prefix)` sai → `pinAsset(key)`; assert `tag` khớp `/^v[0-9.]+$/` |
| P2-2 | Rate-limit GitHub API chưa xác thực (60/h) khi build song song → im lặng rơi về pin (availability, không phải lỗ hổng; log `[release] github fetch failed` đã đủ) | `src/utils/release.ts:96-101` | med | Chấp nhận, hoặc cache `release-meta.json` build trước làm fallback thứ 2 |
| P2-3 | `API_URL` suy ra bằng string-replace — host lạ thì replace no-op → fetch vào URL HTML → fail-closed (vô hại, khó debug) | `src/utils/release.ts:83` | high | Hằng số API tường minh hoặc assert host sau replace |

## Kết luận theo mục

1. **SF-3 GitHub API fetch — PASS.** URL từ hằng config (không user input → không SSRF), `AbortSignal.timeout(3000)`, kiểm kiểu từng trường, payload hỏng → throw → pin toàn phần; asset thiếu → pin theo target; cả hai thiếu → `source:'none'` → ẩn nút. Lỗi log build-side. Artifact `dist/release-meta.json` chỉ chứa dữ liệu release công khai. OS-detect PE: `querySelector` union cố định + `classList.add`/`aria-current` — **0 innerHTML/eval/document.write trong toàn bộ diff** (grep xác nhận). QR encode resolved lúc build (dep `qrcode@^1.5.4` có từ trước, lockfile không đổi).
2. **SF-2 landing understand-layer + hero CTA — PASS.** `Understand.astro` markup tĩnh 100%, `{}` chỉ chuỗi key i18n (Astro auto-escape). Href nội bộ từ prefix + `REPO_URL` hằng. Reveal qua `initMotion()` dùng chung.
3. **Repo hygiene — ĐẠT.** Secrets grep (sk-/AKIA/PRIVATE KEY/ghp_/pat/xox/password/api_key/Bearer/JWT) → 0 matches; không `.env*`/`.pem`/`.key`; exec-bit: chỉ `create mode 100644`; package.json + pnpm-lock không trong diff; không file debug/probe lạ; 3 prototype HTML trong `docs/superpowers/prototypes/` là design artifact, KHÔNG deploy (dist đã verify không chứa). URL hardcode chỉ github.com/api.github.com công khai.
4. **i18n/keys config — ĐẠT.** `src/config.ts` thêm `LATEST_RELEASE`/`RELEASE_ASSET_FILES`/`RELEASE_PIN_URLS` — URL release công khai; flags không đổi; keys landing/downloads EN=VI song song, không key dạng secret.

## Checklist bảo mật
- [x] Input validation — không user input vào luồng dữ liệu mới (GitHub API + build-time)
- [x] Output encoding — Astro auto-escape mọi `{}`; 0 XSS sinks trong diff
- [x] Parameterized queries — n/a (không DB)
- [x] AuthN/AuthZ — không đổi
- [x] Sensitive data — 0 secrets trong diff/artifact
- [x] HTTPS — mọi URL remote là `https://`
- [x] Security headers — không đổi trong phạm vi (Base.astro ngoài diff)
- [x] Logs — build log chỉ chứa lỗi fetch công khai
- [x] Dependencies — không đổi

## Khuyến nghị
1. **Ngay (P2, cheap)**: P2-1 allowlist URL release trong `release.ts` (~3 dòng) — có thể làm qua fix-task trong SF-4 hoặc coordinator fix-task.
2. **Ngắn hạn**: P2-3 hằng API tường minh; P2-2 chấp nhận hoặc cache.
3. **SF-4 convergence**: giữ các cổng accuracy (G-I warn trên mọi CTA) — không regression trong diff.

**Duyệt để triển khai: ✅ CÓ — 0 P0/P1; 3 P2 hardening, không chặn phase checkpoint.**
