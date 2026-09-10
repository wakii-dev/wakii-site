---
title: "ADR-0003: License claims scoped FORBIDDEN — NOASSERTION ≠ open-source"
date: 2026-09-10
updated: 2026-09-10
status: accepted
visibility: internal
confidence: high
sources: [docs/superpowers/editorial/2026-blog-longform/claims-registry.md, docs/superpowers/editorial/2026-blog-longform/runbook.md, docs/superpowers/editorial/research/digests-batch3/README.md]
tags: [claims, license, scoped-forbidden, dagger]
type: adr
---

# ADR-0003: License claims scoped FORBIDDEN — NOASSERTION ≠ open-source

## Status

accepted

## Date

2026-09-10

## Bối cảnh (Context)

Batch 3 viết 50 bài về repo người khác. Probe GitHub API ngày 2026-09-08 thấy
một số repo nổi có license `none` hoặc `NOASSERTION` — tức GitHub không xác
nhận được license open-source chuẩn nào. Gọi các repo đó là "open-source" hay
"mã nguồn mở" là claim sai sự thật về bên thứ ba, rủi ro pháp lý + uy tín
public. Nhưng cũng không thể cấm hai cụm đó trên TOÀN blog — phần lớn repo
khác có license thật (MIT/Apache…) và gọi đúng là chính xác.

## Quyết định (Decision)

Cấm gọi "open-source"/"mã nguồn mở" **chỉ scoped trên đúng 6 slug †** có
license `none`/`NOASSERTION` (pin trong claims-registry `## FORBIDDEN`, 2 dòng
scoped): `deep-dive-anthropics-claude-code` †, `deep-dive-modelcontextprotocol-servers` †,
`deep-dive-modelcontextprotocol-registry` †, `deep-dive-zed-industries-zed` †,
`deep-dive-tabbyml-tabby` †, `deep-dive-janhq-jan` †. Bài của repo † gọi là
**"công khai trên GitHub"**. Bài khác (batch-1/2 + 44 slug batch-3 còn lại)
dùng hai cụm này tự do. Enforcement máy: lint + audit T3(a) cùng parser, cùng
FAIL — cụm cấm grep case-insensitive trên TOÀN file (claim có thể nằm trong
title/description). Nguyên tắc bổ sung: mã của repo † vẫn trích được (repo
public) — chỉ cách GỌI TÊN license bị giới hạn, không phải cấm nói về repo.

## Hệ quả (Consequences)

- 6 slug † mang quy ước dagger trong toàn KB: mỗi lần nhắc phải kèm † để
  writer/agent biết slug này có ràng buộc license riêng (xem
  [README — quy ước †](../README.md#7-quy-ước--dagger--license-claims-scoped)).
- Probe 2026-09-08 thấy thêm `charmbracelet/crush` + `neovim/neovim` =
  NOASSERTION NGOÀI scope 6 †: bài 2 slug này vẫn viết license-safe
  (review-enforced), chờ coordinator ACK mở scope trước khi enforce máy.
- Thêm/bớt slug † = sửa claims-registry (2 dòng scoped) qua coordinator —
  editorial kit FROZEN, KB không tự quyết.

## Nguồn pin

- `docs/superpowers/editorial/2026-blog-longform/claims-registry.md` — section
  `## FORBIDDEN` 2 dòng scoped `— scope: <6 slug>` (dòng 51-56, ghi rõ "CHỈ
  áp cho 6 slug † (license none/NOASSERTION)… gọi 'công khai trên GitHub',
  KHÔNG 'open-source'/'mã nguồn mở'") + §Third-party claims rule 2 (license-safe,
  scoped enforcement chỉ 6 slug † pin D8, crush + neovim ngoài scope) + rule 4
  (mã repo † vẫn trích được — chỉ cách gọi tên license bị giới hạn).
- `docs/superpowers/editorial/2026-blog-longform/runbook.md` — "Lint gates MỚI
  cho batch-3": Scoped FORBIDDEN FAIL ở cả lint lẫn audit T3(a), hai script
  cùng parser.
- `docs/superpowers/editorial/research/digests-batch3/README.md` — convention 3
  (license-safe + lưu ý crush/neovim ngoài 6 †).
