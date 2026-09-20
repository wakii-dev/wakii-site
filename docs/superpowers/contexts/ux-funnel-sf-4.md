# SF-4 Context Pack — Funnel convergence QA

> Đọc file này THAY VÌ tự tổng hợp từ bracket + epic + comments.
> Epic spec: `docs/superpowers/specs/2026-09-20-ux-funnel-design.md` (rev 2).
> Bracket: `docs/superpowers/brackets/vu9-ux-funnel.md` (epic VU-9).
> Tier 2 convergence — fork từ dest SAU khi SF-2 + SF-3 merged; kiểm output của tier 0-1, KHÔNG code thay SF khác.

## Spec slice (chỉ phần SF-4 chịu trách nhiệm)

1. **Funnel chain audit (AC2/AC8 + AC1)** — đo bằng crawl thật: hero → /download ≤1 click; /download → installer file ≤1 click nữa (tổng ≤2 click tới file); **AC1 content-inspection: 4 câu D1 có câu trả lời trong chính copy section mới**; chain hero→download→first-run→docs liền mạch; version consistency GetWakii ↔ /download (cùng resolved data, không 205 vs 213 lệch nhau).
2. **Anchors + nav audit** — `#get-wakii` verbatim; mọi anchor nav không vỡ sau insert section mới; nav CTA → /download (G-H); footer; blog CTA → /download (sample 5 posts × 2 locale).
3. **VI parity + ACK (AC6)** — VI mirrors đầy đủ keys mới cả 2 pages; ACK rule D7 thực thi: comment epic checkpoint ghi **ACK-or-default** (owner ACK hoặc ship-draft mặc định — KHÔNG BAO GIỜ chờ/block); accuracy guards sweep: "story view", zero-setup, credits, iOS honest, G-I warn, G-QR live-only.
4. **mobile-390 sweep** — landing + download cả 2 locale @390: ALL-PASS (pattern probe iframe same-origin: thả probe HTML vào dist/_probe390/ serve cùng port — gotcha đã biết).
5. **Perf budget (AC7 — protocol PIN)** — baseline = build trên **MAIN (pre-story commit)** và dest, cùng máy + cùng preview port, **median 3 runs mỗi bên**; pass = dest ≥90 VÀ trong ±5 so baseline (chống noise ±8-17); LCP section mới: ảnh lazy + explicit dims verify.
6. **A11y sweep** — không regression (cap ~90 systemic); highlight OS-detect có aria-current + text chip; focus states mới.
7. **Meta/OG consistency** — canonical/hreflang/canonical-descriptions các pages sau thêm section (Base contract pinned — additive only).
8. **Release checklist + report card** — tổng hợp mọi gate xanh; card mẫu cho owner test thật (share/landing/download trên mobile + desktop); checklist deploy tay + owner domain action ghi rõ trong epic comment.

## Touch map (files SF-4 tạo/sở hữu)

```
scripts/ hoặc audit artifacts (funnel-crawl report)  — NEW (audit-only artifacts)
docs/superpowers/evidence/sf-4-*/                     — NEW (evidence logs)
Fixes nhỏ phát hiện bởi audit → fix-task QUA coordinator, KHÔNG tự sửa chéo sf-2/sf-3 scope
```
READ-ONLY: toàn bộ src/ của SF-2/SF-3 (audit only), config.ts, layouts.

## ACCEPTANCE (user-visible)

- Crawl chứng minh: hero → /download ≤1 click; /download → file ≤2 click tổng; không link chết trong chain.
- Version hiển thị NHẤT NHAU trên landing + /download (cùng resolved source).
- Sweep 2 pages × 2 locale × mobile-390: ALL-PASS; Lighthouse trong budget ±5; a11y không tụt.
- VI parity đầy đủ; ACK decision ghi trên epic.
- Release checklist hoàn chỉnh + report card để owner test thật trước deploy.

## Boundary (KHÔNG làm)

- KHÔNG code feature mới — audit + fix-task qua coordinator (sửa chéo scope SF khác = cấm).
- KHÔNG merge nhánh đích vào main (human gate); KHÔNG deploy production (owner manual).
- KHÔNG thêm analytics (D10).
- KHÔNG thêm analytics (D10).
