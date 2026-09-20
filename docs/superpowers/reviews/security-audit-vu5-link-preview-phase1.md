# Security-audit Phase-1 VU-5 (diff main..story/vu5-link-preview @ 13c1763b603ff3b4b0d95b67a012568fe02dc24f)

- P0: 0 — none
- P1: 0 — none
- P2: 1 — scripts/render-blog-heroes.mjs: hardcoded CHROME path /Applications/Google Chrome.app (macOS-only dev dependency, portability note — không phải security)

VERDICT: CLEAN

## Security Audit Report — VU-5 Phase-1 checkpoint

### Executive Summary
**Overall Risk**: Low
**Vulnerabilities Found**: 0 (0 Critical, 0 High, 1 P2 note)

### Medium/Low Findings

| ID | Issue | Location | Conf | Recommendation | Evidence |
|----|-------|----------|------|----------------|----------|
| P2-1 | Hardcoded absolute Chrome path — script chỉ chạy trên máy dev macOS có Chrome tại path đó | `scripts/render-blog-heroes.mjs:21` | high | Cho phép override qua env (`process.env.CHROME_BIN ?? default`) | `const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';` |

### Checklist
- [x] Input validation / escaping — `esc()` + Astro auto-escape trên mọi meta interpolation
- [x] Parameterized/exec an toàn — `execFileSync` array-form, không shell
- [x] Không secret/.env trong diff; evidence logs sạch
- [x] Exec-bit: 192/192 file mới 100644, không symlink/submodule
- [x] Deps: lockfile không đổi, không dep mới
- [x] public/ hygiene: 122 PNG/ICO ≤39KB, tổng 3.9MB, không file lạ
- [x] Không .gitignore violation
- [x] SVG mới (96 file) không chứa script/foreignObject/ENTITY

### Security Checklist
- [x] No sensitive data in logs
- [x] No new dependencies (no CVE surface)
- [x] Output encoding (Astro expression escaping, SVG text escaping)
- [x] Injection surface clean (no eval/exec-string/network in new script)
- [x] No secrets in diff

### Approved for Production: YES (không blocker)

---
Audit chạy bởi security-audit agent 2026-09-20, verdict ghi bởi coordinator (agent bị deny Write).
Checkpoint Phase-1: build dest exit 0 (267 pages) + audit CLEAN → PASS, SF-3 launch tiếp.
