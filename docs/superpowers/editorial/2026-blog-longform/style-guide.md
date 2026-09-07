# Style guide — blog longform 900-1400 từ (story FI-359)

> Chuẩn viết cho 20 bài mới. Tone mẫu = 10 seed posts (đọc 1 seed trước khi viết:
> `src/content/blog/en/review-ai-agents-from-your-phone.md` + bản VI). Lint máy:
> `scripts/check-blog-content.mjs` — viết xong chạy `node scripts/check-blog-content.mjs`
> trước khi commit.

## 1. Cấu trúc bài (bắt buộc, theo thứ tự)

1. **Hook — 1 đoạn** (3-5 câu): vấn đề thật + vì sao bài này đáng đọc. Không mở
   đầu kiểu "In today's world…". VI nói thẳng, EN tương đương.
2. **TL;DR — list 3-5 bullet**: ý chính của bài, người đọc lướt 10 giây nắm được.
3. **3-5 section H2**: mỗi section đúng 1 ý; **mỗi section ≥1 evidence block**
   (code-block ASCII diagram / transcript thật / bảng / trích dẫn artifact có nguồn).
   H2 wording cụ thể ("Ba lớp kiểm một SF"), không generic ("Overview").
   — ≥3 H2 cũng là ngưỡng BlogToc render (h2-only).
4. **Đoạn nối docs**: 1-2 câu dẫn sang trang docs liên quan + link đúng locale
   (quy tắc §5). Đây là chỗ duy nhất bắt buộc có link docs — thêm chỗ khác được,
   nhưng mỗi link tuân theo §5.
5. **CTA nhẹ** — 1-2 câu: tải Wakii / đọc docs / thử workflow. Không bán hàng ồn.

## 2. Band từ — thuật toán đếm D1 (PIN, epic decision D1)

**Thuật toán (không đổi, lint implement đúng như này):**

```
body        = nội dung SAU frontmatter (sau cặp `---` thứ hai)
body_no_fml = strip MỌI fenced code-block  /```...```/  (diagram, transcript
              KHÔNG đếm từ — chặn độn bằng diagram)
words       = body_no_fml.split(/\s+/).filter(Boolean).length
```

- **VI: 900-1400 từ.** Lint: `< 900` FAIL · `> 1400` WARN (vẫn pass) · `> 1470`
  FAIL (+5% — hard cap QA).
- **EN: ≥800 từ** (mirror cùng cấu trúc, không trần cứng — nhắm ~1400 để cân
  đối VI, đi quá trần mềm là vấn đề review chứ không phải lint).
- Fenced block = dòng mở ``` tới dòng đóng ```; fence LẺ (không đóng) → lint
  báo lỗi rõ ràng (fix chứ không đếm).
- Đếm trong code-block inline (`` `code` ``) vẫn đếm — chỉ fenced bị bỏ.

## 3. Tone & giọng

- Kỹ sản, câu ngắn, chủ ngữ rõ. Như 10 seed: khẳng định bằng cơ chế + bằng chứng,
  không marketing khí. VI dùng đại từ "bạn" / để ngỏ ngữ; thuật ngữ kỹ thuật giữ
  tiếng Anh khi đó là tên riêng (gate, story, worktree, skill, lint) — nhất quán
  trong 1 bài.
- Mỗi claim số liệu phải có nguồn + ngày (registry D8 rule). Không dùng "always /
  never / mọi trường hợp" trừ khi có bằng chứng tổng quát thật.
- Không emoji trong thân bài (icon ⚡/🌳 được vì là TÊN UI của panel).

## 4. Frontmatter template (6 field — schema LOCKED, `src/content.config.ts`)

```yaml
---
title: "Tiêu đề bài — góc nhìn cụ thể, <70 ký tự"
description: "1-2 câu tóm tắt có tính từ hành động — dùng cho listing + meta description."
pubDate: "2026-08-20"          # CỨNG theo topic-matrix.md (D2) — không tự chọn ngày
category: "tutorial"           # tutorial | tech | build-log — CỨNG theo matrix (D6)
tags: ["workflow", "agents"]   # 2-4 tag từ vocab §5 — không tự chế
draft: false                   # fallback D7: true = flip CẢ HAI locale cùng lượt
---
```

- Đủ 6 field, sai kiểu → lint fail (title/description non-empty; pubDate parse
  được; category ∈ enum; tags array-of-strings; draft boolean).
- VI và EN **cùng title/description nghĩa, cùng ngày, cùng category, cùng tags**.

## 5. Tags vocab (dùng TRONG vocab này, không tự chế)

- Có sẵn từ seeds: `story-workflow` `agents` `workflow` `gates` `guardrails`
  `build-log` `release` `wakii` `git` `fork` `upstream` `mobile` `stories`
  `supervised`
- Mới (đã duyệt ở epic spec): `autonomy` `worktree` `linear` `qa` `og` `rss`
  `seo` `memory` `skills` `evidence`
- 2-4 tag/bài; matrix đã đề xuất sẵn — đổi được trong vocab, không ra ngoài.

## 6. Link rules (D4 — bắt buộc)

- **VI posts link `/vi/docs/<slug>/`; EN posts link `/docs/<slug>/`** — áp dụng
  cho MỌI bài mới (seeds không đụng). `<slug>` ∈ 5 DOC_SLUGS: getting-started,
  superpowers-panel, story-workflow, agents-and-kit, faq.
- **KHÔNG link cross-file kèm `#anchor`** — heading VI/EN lệch nhau → anchor chết
  trên trang 200. Link docs chỉ tới TRANG. (Anchor trong chính bài thì được —
  BlogToc tự sinh từ h2.)
- **Cross-link giữa các bài blog**: chỉ link bài ĐÃ TỒN TẠI trên nhánh (runbook
  bước 8) — không link mù sang bài chưa chắc có. Cùng quy tắc locale.
- Link artifact GitHub (hub-store) ghi kèm TRÍCH DẪN thật trong bài (chống
  link-chết) — bắt buộc với bài case-study/deep-dive.

## 7. Nhịp làm việc (tóm tắt — chi tiết trong runbook.md)

VI draft trong band → EN mirror **cùng commit** → `node
scripts/check-blog-content.mjs` xanh → claims-check vs `claims-registry.md` →
`pnpm build` xanh → commit.
