---
title: Glossary — thuật ngữ EN/VI của dự án
date: 2026-09-10
updated: 2026-09-10
status: active
visibility: internal
confidence: high
sources: [docs/superpowers/specs/2026-09-09-knowledge-base-design.md, docs/superpowers/editorial/2026-blog-longform/claims-registry.md]
tags: [glossary, terminology, kb]
type: glossary
---

# Glossary

Thuật ngữ dùng trong KB, blog, specs và khi trao đổi với agent. Thuật ngữ EN
giữ nguyên (văn hóa repo: VI-first kèm EN) — giải nghĩa bằng VI.

- **ADR** (Architecture Decision Record) — bản ghi một quyết định đã chốt:
  bối cảnh, quyết định, hệ quả, nguồn pin. KB giữ 10 ADR nền tảng trong
  [adr/](adr/0001-lint-scope-all-non-seed.md); hủy quyết định = ADR mới ghi
  superseded, không xóa file cũ.
- **MOC** (Map of Content) — trang bản đồ liên kết: mọi chủ đề truy được từ
  một chỗ, theo chuỗi research → bài → issue → decision. Xem
  [MOC.md](MOC.md).
- **MADR** (Markdown Architectural Decision Records) — khung viết ADR bằng
  markdown: Status / Date / Context / Decision / Consequences. ADR của KB
  theo khung MADR-ish VI (template trong [README](README.md)).
- **Frontmatter** — khối YAML đầu file .md mang metadata (title, date,
  status, visibility…). Schema authority của KB: [frontmatter.md](frontmatter.md).
- **Slug** — tên file/URL dạng kebab-case định danh một bài (vd
  `deep-dive-cline-cline`); một slug = một cặp file EN + VI, hai locale cùng
  slug (parity gate đòi presence 1:1).
- **Digest** — bản ghi research một repo: số liệu kèm ngày probe, đọc
  README/code, nhận xét thô. Batch-3 có 50 digest trong
  `docs/knowledge/repos/` (link từ
  [references.md](references.md)).
- **Landscape (research)** — ảnh chụp bối cảnh hệ sinh thái GitHub tại một
  thời điểm (top repo theo stars, theo category) kèm đánh giá áp dụng cho
  Wakii. 4 artifact landscape: [references.md](references.md).
- **Claims-registry** — hợp đồng claim của blog: phần ALLOWED (được nói gì,
  kèm nguồn) + FORBIDDEN (cấm nói gì, literal để lint grep) + section
  third-party. Nằm trong editorial kit — LINK-only:
  [claims-registry.md](../superpowers/editorial/2026-blog-longform/claims-registry.md).
- **Topic matrix** — bảng CHỐT CỨNG một batch blog: mỗi row = một bài (slug,
  category, pubDate, evidence, angle). Lint/audit derive scope từ matrix
  (ADR-0001, ADR-0006).
- **Visibility** — marker phân loại nội dung trong frontmatter. KB luôn dùng
  `internal` — là marker thông tin, KHÔNG cơ chế bảo vệ vì repo đã public
  ([frontmatter.md](frontmatter.md), D6).
- **Confidence** — độ tin của nội dung (`high`/`medium`/`low`) trong
  frontmatter; tiêu chí ở [frontmatter.md](frontmatter.md).
- **Learn-in-public** — angle nội dung: học từ repo người khác một cách công
  khai kèm grading ADOPT/DIRECTION/WATCH — bằng chứng kiểm chứng được (số kèm
  ngày, ADR-0010).
- **Human gate** — mốc chỉ user được quyết, không agent/máy: VI copy duyệt,
  flag flips, VERDICT APPROVED literal (ADR-0007).
- **Pilot-first** — cấu trúc batch 2 đợt: đợt 1 viết ít bài đại diện để chốt
  template (ACK coordinator), đợt 2 viết phần còn lại theo template (ADR-0008).
- **Lint scope** — phạm vi file mà `scripts/check-blog-content.mjs` áp check:
  all-non-seed, derive từ mọi bảng matrix; file lạ báo `outside-matrix`
  (ADR-0001).
- **† (scoped dagger)** — dấu hiệu một slug thuộc nhóm 6 slug bị scoped
  FORBIDDEN license (none/NOASSERTION → "công khai trên GitHub", không
  "open-source"). 6 slug † liệt kê trong
  [README — quy ước †](README.md#7-quy-ước--dagger--license-claims-scoped).
- **KB** (Knowledge Base) — `docs/knowledge/` nơi giữ tri thức đã kết luận
  (biên với `docs/superpowers/` = in-flight): [README](README.md).
- **SF** (Sub-feature) — một slice công việc của story trong bracket, có
  What/Depends-on/Tier/exit criteria riêng; các SF chạy song song trong
  worktree riêng rồi merge về nhánh đích. Ví dụ: SF-1 của story FI-409.
- **ADOPT / DIRECTION / WATCH (grading)** — thang đánh giá pattern học từ
  repo ngoài: ADOPT = áp được ngay kèm đề xuất cụ thể (seeding issue);
  DIRECTION = hướng đang đi đúng, pushing; WATCH = để mắt, ghi rõ điều kiện
  đổi grade; N/A = không áp được. Contract ở style-guide §8 (editorial kit —
  link-only), đầu ra product: issues #14-#23 trên `wakii-dev/wakii`.
- **Working example** — ví dụ dùng được thật (link resolve, lệnh chạy được),
  không phải ví dụ hư cấu. Chuỗi 4-link trong
  [README — worked example](README.md#4-worked-example--chuỗi-4-link-chuẩn)
  là working example của quy ước tra cứu KB.
