# Security-audit Phase-2 VU-5 (diff 13c1763..story/vu5-link-preview @ 1901b18)

- P0: 0 — none
- P1: 0 — none
- P2: 1 — src/pages/rss.xml.js:media:content không assert on-origin như check-og (heroImage absolute-URL pass-through, editor-trusted + evidence 240/240 on-origin — hardening note, không exploit)

VERDICT: CLEAN

## Tóm tắt audit (full report từ security-audit agent 2026-09-20)

1. **check-og.mjs / crawler-probe.mjs — exec/injection surface**: Không `child_process`, không `eval`, không shell — thuần `node:fs` walk + `fetch`. Path scan dist an toàn: `og:image` pathname qua `new URL()` (normalizer `..`; `%2e2e` giữ nguyên percent-encoding → literal path dưới dist → `existsSync` fail, không đọc ra ngoài). `--url` crawler-probe là CLI operator-controlled dev-tool; reviewer-P1 no-arg guard đã verify trong code (`argv.indexOf('--url')` + fallback `!argUrl.startsWith('-')`). `--live` fetch chỉ tới origin từ `src/config.ts` — không user input. Regex quote-aware → không ReDoS.
2. **Secrets**: Không `.env*`/`.pem`/`.key`; grep pattern (sk-, AKIA, PRIVATE KEY, password=, ghp_, VERCEL_TOKEN, Bearer) — hit duy nhất là prose "CLI token **với** được" (không phải key). Evidence log chỉ chứa HTTP status + build output; runbook chứa team slug `1foxglobal` (không phải credential).
3. **Exec-bit/symlink/submodule**: 5× `create mode 100644`, không 755/symlink/submodule (crawler-probe shebang nhưng 644 — chạy qua `node scripts/…`, đúng).
4. **Deps**: package.json chỉ đụng `scripts` (wire `astro build && node scripts/check-og.mjs` + `check:og`); pnpm-lock không đổi → không CVE-review surface.
5. **RSS media:content**: absolute URL đúng (`new URL(heroImage ?? '/og-default.png', site).href`); không XML breakout (WHATWG URL serializer percent-encode quote trong path) — xem P2-1 cho gap origin-assert.
6. **.gitignore**: sạch, không violation.
7. **File lạ**: 11 file đều thuộc SF-3. Không đụng astro.config/.github.

### Approved: YES — không blocker, SF-3 convergence duyệt qua checkpoint

---
Audit chạy bởi security-audit agent 2026-09-20, verdict ghi bởi coordinator (agent bị deny Write).
Checkpoint Phase-2 = CLOSE: build dest exit 0 + check:og PASS + audit CLEAN → story COMPLETE.
