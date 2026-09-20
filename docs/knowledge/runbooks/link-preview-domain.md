---
title: Runbook — bật domain wakii.xyz cho social unfurl card
date: 2026-09-20
updated: 2026-09-20
status: active
visibility: internal
confidence: high
sources: [docs/superpowers/specs/2026-09-20-link-preview-design.md, docs/superpowers/contexts/link-preview-sf-3.md, scripts/check-og.mjs]
tags: [runbook, domain, og, link-preview, vercel, crawler-cache]
type: runbook
---

# Runbook — bật domain wakii.xyz cho social unfurl card

**Cho ai:** owner Wakii (quyền dashboard Vercel team đang chứa project `wakii-site`).
**Thời gian:** ~5 phút cho bước 1-2; bước 3-4 tuỳ crawler cache.
**Tại sao:** code đã xong (meta contract + hero tile toàn bộ post — story VU-5
SF-1/SF-2), nhưng `https://wakii.xyz` đang trả **404 `DEPLOYMENT_NOT_FOUND`**
— DNS đã trỏ Vercel, domain **không thuộc team nào** CLI token với được
(`vercel domains ls` = 0 dưới cả `1foxglobal` lẫn `vuhois-projects`), nên chỉ
owner add được qua dashboard. Cho tới khi domain sống, mọi link share ra
social để crawler fetch trang 404 → không có card.

## Bước 1 — Add domain vào project (dashboard, ~2 phút)

1. Mở https://vercel.com → team chứa project `wakii-site` → project
   **wakii-site** → **Settings → Domains**.
2. **Add** cả hai:
   - `wakii.xyz` (apex — khớp `SITE_URL` trong `src/config.ts`, giữ nguyên);
   - `www.wakii.xyz` — chọn **Redirect to `wakii.xyz`** (308) để canonical
     một nguồn.
3. Vercel tự nhận DNS đã trỏ (domain hiện DNS-trỏ-Vercel sẵn). Nếu dashboard
   hỏi verify TXT, làm theo gợi ý trên màn hình — không đụng cấu hình khác.

## Bước 2 — Verify bằng probe (không cần mở dashboard lại)

```bash
node scripts/check-og.mjs --live
```

- Trước khi add domain: `WARN 404` × 3 URL (hiện trạng 2026-09-20 — probe
  **không bao giờ** đỏ build).
- Sau khi add: kỳ vọng `PASS 200` × 3 (`/`, `/og-default.png`, 1 post mẫu).
  3/3 PASS 200 = domain phục vụ thật, sang bước 3.

## Bước 2b — Flip OG_BASE_URL (sau khi domain live)

Image URLs (og:image, twitter:image, RSS media) đang resolve trên
`OG_BASE_URL = https://wakii-site.vercel.app` (fallback host — config.ts).
Domain sống rồi thì flip 1 dòng về canonical:

```
src/config.ts:  export const OG_BASE_URL = 'https://wakii.xyz';
```

Build + `npm run check:og` (og:image chấp nhận cả 2 origin nên flip không
vỡ gate) → deploy. Bỏ qua bước này nếu muốn giữ vercel.app làm image host
(crawlers không đòi hỏi og:image cùng origin với og:url).

## Bước 3 — Đuổi cache crawler (sau khi domain live)

Crawler cache card theo URL; phần lớn share cũ là fetch-fail (host 404) nên
cache lỗi ngắn hạn, nhưng chủ động re-scrape cho sạch:

| Crawler | Cách purge |
|---|---|
| Facebook | https://developers.facebook.com/tools/debug/ — dán URL → **Scrape Again** (lặp 1-2 lần) |
| X/Twitter | https://cards-dev.twitter.com/validator đã retired — bot fetch lại khi share; nếu cần, share kèm query `?v=2` một lần |
| Zalo | Thủ công — gửi lại link trong chat Zalo; Zalo không có purge API công khai. Card cũ cứng đầu: cache-bust `?v=` trên **link share** (chỉ khi cần — tránh phá ổn định định danh ảnh) |
| Slack / Telegram / Discord | Fetch live khi share, không cache dai — không cần purge |

Kiểm chứng nhanh sau purge: `node scripts/crawler-probe.mjs --url https://wakii.xyz`
(5 crawler UA × bảng meta từng con thấy).

## Bước 4 — Card mẫu test thật

Share 1 link thật ra từng nền tảng và nhìn card:
`https://wakii.xyz/blog/<slug-bất-ky>/` — kỳ vọng: ảnh hero riêng của post
(1200×630 PNG), title `… — wakii`, description riêng (không phải tagline
fallback), locale đúng. Trang chủ dùng `og-default.png`.

## Notes

- **KHÔNG** flip `SITE_URL` — wakii.xyz là canonical chốt bởi owner 09-07.
- Build xanh độc lập domain: `pnpm build` chạy `check:og` trên dist local,
  không đụng mạng; `--live` là bước chủ động sau khi domain lên.
- Trạng thái ghi tại 2026-09-20 (story VU-5 SF-3). Domain lên xong có thể
  xoá mục "hiện trạng" — giữ các bước 1-4 như quy trình chuẩn.
