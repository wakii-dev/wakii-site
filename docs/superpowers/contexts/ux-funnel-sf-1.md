# SF-1 Context Pack — Design direction + key store

> Đọc file này THAY VÌ tự tổng hợp từ bracket + epic + comments.
> Epic spec: `docs/superpowers/specs/2026-09-20-ux-funnel-design.md` (rev 2).
> Bracket: `docs/superpowers/brackets/vu9-ux-funnel.md` (epic VU-9).
> SF này là DESIGN-FIRST: chạy designer agent trước, KHÔNG code production.

## Spec slice (chỉ phần SF-1 chịu trách nhiệm)

1. **Designer flow (D11)** — designer agent (huashu-design): MỘT pass 3 hướng × 2 surfaces (landing understand-layer + /download restructure, cùng visual language) → đăng prototypes → **USER GATE chọn hướng (bắt buộc, không bỏ)** → hand-off `docs/superpowers/designs/ux-funnel-direction.md` (tokens/structure/behavior/section order) = BINDING cho SF-2/SF-3 + **ghi tường minh trong hand-off: SUPERSEDES `docs/superpowers/designs/sf-downloads-direction.md` cho các /download surfaces** (SF-3 sẽ cập nhật 2 code comments trỏ sang).
2. **Brief designer (đầu vào bắt buộc)**: brand terminal-mono (bg #0A0E0D, accent #45E0A8, JetBrains Mono/Inter, bento anatomy `.bx/.bx-in/.bx-label/.bx-body/.bx-foot`, `--radius-cell`, nút prefix `> `, grid-bg hero mask) — CẤM generic SaaS look. Section understand trả lời 4 câu (D1): Wakii là gì / mở app lên thấy gì / dành cho ai / thử gì đầu. /download restructure quanh 1 primary action + version thật + strip 3 bước đầu. Slots cho screenshots (2-4, chưa có — frame trống预留).
3. **Keys landing.ts (SF-1 sở hữu)**: group mới `understand` (4 câu + visual captions, EN source + VI mirror) + hero CTA split keys ADD-THÊM (ctaPrimary mới → /download + microcopy "free · open source · unsigned build"; **`hero.ctaGhost` GIỮ NGUYÊN** — consumer ẩn GetWakii:117 reuse). Cập nhật PLACEHOLDER note (landing.ts:3) ghi rõ vùng owned vs còn placeholder.
4. **Keys downloads.ts**: additions version (pill, date), first-run strip (3 steps → getting-started), os-detect chip ("→ cho máy bạn"), arch buttons (Apple silicon / Intel) — pattern `live`/`notLive` song song khi flag-driven. KEY-OWNERSHIP: components SF-2/SF-3 KHÔNG hardcode.
5. **VI rule (D7 — MỘT rule)**: draft EN+VI song song render tại merge; **exit criteria của vi-draft-ack = "VI draft + ACK-request ĐÃ POST lên epic" (KHÔNG bao giờ chờ ACK trong SF — non-blocking)**; ACK ghi tại Phase-1 RELEASE CHECKPOINT; owner im lặng → ship draft; từ chối → SF-1 revise text-only.
6. **quickstart orphan cleanup**: vị trí đã verify — landing.ts interface `:87`, EN `:274`, VI `:472`; consumer grep = 0 (chỉ comment refs trong skills.astro). Exit: xóa đối xứng 3 vị trí + grep consumer = 0. Nếu designer muốn repurpose → decision tường minh trong hand-off.
7. **Thứ tự nội bộ PIN**: keys-landing + keys-downloads chạy SAU hand-off-doc (tên keys derive từ hướng được chọn). Sau SF-1, **SF-3 KHÔNG được tự thêm keys downloads.ts** (ownership header downloads.ts:5-8) — key cần thêm mới → loop về SF-1/coordinator.
8. **Copy direction**: plain-for-devs — ngôn ngữ phẳng NHƯNG không dễ hóa (dev audience); accuracy guards: "story view" không "Stories tab", zero-setup OK, không发明 version/claims, iOS honest.

## Touch map (files SF-1 tạo/sở hữu)

```
docs/superpowers/designs/ux-funnel-direction.md  — NEW (hand-off binding)
src/i18n/landing.ts                              — EDIT (understand group + hero keys + placeholder note + quickstart cleanup)
src/i18n/downloads.ts                            — EDIT (version/first-run/os-detect additions)
```
READ-ONLY: mọi components (SF-2/SF-3 sở hữu việc implement), config.ts (SF-3).

## ACCEPTANCE (user-visible)

- 3 hướng prototypes đăng được cho user xem (artifacts links), user chọn 1 — gate có bằng chứng lựa chọn.
- Hand-off doc tồn tại: section order, tokens, structure, behavior cho CẢ landing section + /download — SF-2/SF-3 implement được KHÔNG cần hỏi lại design.
- Keys mới EN+VI đầy đủ trong 2 file i18n; `hero.ctaGhost` còn nguyên; quickstart sạch (grep 0 consumer); PLACEHOLDER note phản ánh đúng thực trạng.
- VI draft comment trên epic có link; ack-rule ghi rõ.
- Site build vẫn xanh (keys mới chưa consume → không đổi look).

## Boundary (KHÔNG làm)

- KHÔNG code production components (SF-2/SF-3 làm) — designer chỉ prototype/hand-off.
- KHÔNG đụng Hero.astro/DownloadPage.astro/Landing.astro (SF-2/SF-3).
- KHÔNG đụng config.ts (SF-3: version resolution).
- KHÔNG tự merge VI khi chưa tới checkpoint; KHÔNG convert toàn bộ copy placeholder (D4 surgical).
- KHÔNG thêm analytics; KHÔNG đụng docs/getting-started.
