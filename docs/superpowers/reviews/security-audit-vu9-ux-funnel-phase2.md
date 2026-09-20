# Security Audit — VU-9 ux-funnel Phase 2 checkpoint (final release)

- **Date**: 2026-09-20 ~19:25
- **Scope**: `git diff cd0346e..a7b688f` (merge SF-4 funnel convergence QA) — 29 files, +555/−0.
- **Verdict**: FINDINGS — P0: 0 · P1: 0 · P2: 2 → **CLEAN, không block release** (2 P2 hardening trên audit tool, không phải product code).
- **Auditor**: security-audit agent (độc lập), dispatched bởi coordinator.

## Tóm tắt
Overall risk: LOW. 0 vulnerability thật; 2 P2 hardening trên script audit mới.

## P2 findings (scripts/funnel-crawl.mjs)

| ID | Vấn đề | Vị trí | Conf | Ghi chú |
|----|-------|----------|------|---------|
| M-1 | `--out` không path confinement | `scripts/funnel-crawl.mjs:318` | high | Flag do operator tự truyền, tool local 1-lần, không wire vào build, không untrusted input chạm OUT → không exploit path. Fix khuyến nghị: `path.resolve` + assert trong repo root |
| M-2 | `resolveInternal` không chặn `..` trong internal href | `scripts/funnel-crawl.mjs:181` | low | href chỉ từ first-party built HTML; dùng chỉ cho `existsSync` + regex anchor, kết quả vào report local — không exfiltration. Fix 1 dòng: `if (rel.includes('..')) return [false, null];` |

## Kết luận theo mục

1. **funnel-crawl.mjs — PASS.** Không exec/spawn (chỉ `node:fs` + `node:path`), không network call (`SITE` chỉ là chuỗi so sánh), không eval/Function/dynamic import; HTML parse toàn regex → report markdown (GitHub sanitize).
2. **Evidence/docs — PASS.** Grep secret patterns: hit duy nhất "**VERCEL_TOKEN chưa set**" (khẳng định token KHÔNG tồn tại). `1foxglobal`/`login vuhoi` = pre-existing từ `cd0346e` trong docs, team slug không phải credential. URLs toàn public.
3. **Repo hygiene — PASS.** Exec-bit: 28× `create mode 100644` + 1 modify, 0 file 755 mới; deps/lockfile không đổi; 23 PNG evidence ở `docs/superpowers/evidence/` (không phải public asset, không đụng gate 100KB hero).
4. **Scope sản phẩm — PASS.** 0 file `src/**` trong diff — đúng phạm vi QA-only đã reviewer APPROVED; fix sản phẩm (F1 `af5d5b9`) land trước base `cd0346e`.

## Checklist
- [x] Input validation (args operator-controlled) · [x] No exec/spawn/network trong script mới · [x] No secrets · [x] No exec-bit mới/deps đổi · [x] Product src/ untouched · [x] No sensitive data trong logs/evidence

**Approved for Production: YES (0 P0/P1).**
Khuyến nghị ngắn hạn: M-1 confinement `--out`, M-2 chặn `..` — gộp vào sweep sau, không block.
