---
title: "ADR-0010: Learn-in-public — third-party số kèm ngày probe"
date: 2026-09-10
updated: 2026-09-10
status: accepted
visibility: internal
confidence: high
sources: [docs/superpowers/editorial/2026-blog-longform/claims-registry.md, docs/knowledge/repos/README.md, docs/superpowers/editorial/2026-blog-longform/style-guide.md]
tags: [learn-in-public, third-party, claims, dated-source, grading]
type: adr
---

# ADR-0010: Learn-in-public — third-party số kèm ngày probe

## Status

accepted

## Date

2026-09-10

## Bối cảnh (Context)

Blog deep-dive về repo người khác thì số liệu (stars, forks, releases, commit
counts, benchmark) đổi từng ngày. Một bài ghi "42k★" không ngày lấy thì sau
một tuần không ai (kể cả chính tác giả) kiểm lại được là sai hay đúng — và
nếu sai, không có cách nào phân biệt "bịa" với "đúng thời điểm viết". Tinh
thần learn-in-public đòi hỏi ngược lại: học công khai thì bằng chứng cũng
phải kiểm chứng được công khai.

## Quyết định (Decision)

Hai nửa gắn chặt nhau:

1. **Learn-in-public là nội dung**: mỗi bài batch-3 kết bằng section grading
   `## Wakii học được gì` / `## What Wakii learns` — ADOPT/DIRECTION/WATCH/N/A
   so với product surface thật của Wakii, mỗi grade ≥1 lý do (ADR-0002);
   grade ADOPT có kỷ luật, seeding ADOPT issue theo rubric — pattern +
   evidence inline + đề xuất + upstream links, issue tự đứng được khi link
   chết.
2. **Mọi số third-party PHẢI kèm mốc lấy**: "theo GitHub API ngày N" — N là
   ngày research THẬT (probe bằng `bash scripts/probe-repos.sh`; ngày ghi
   trong digest của repo tại `docs/knowledge/repos/<slug>.md`).
   Không ngày = không đăng (cùng tinh thần snapshot D8 cho số về Wakii). Quote
   nguyên văn ≤25 từ có attribution + link; trích code ngắn có mục đích phân
   tích kèm link commit/tree ngay cạnh.

## Hệ quả (Consequences)

- Con số trở thành snapshot có mốc — audit/đọc giả re-probe được cùng lệnh,
  cùng cách.
- ADOPT issues trên `wakii-dev/wakii` (#14-#23) là đầu ra product của grading:
  learn-in-public không dừng ở lời khen, nó kết thúc bằng đề xuất có dẫn chứng.
- Digest research là nơi chứa số kèm ngày, không phải bài blog — blog chỉ
  snapshot đúng digest.

## Nguồn pin

- `docs/superpowers/editorial/2026-blog-longform/claims-registry.md` —
  §Third-party claims — batch-3 (rule 1: mọi số third-party PHẢI kèm "theo
  GitHub API ngày N", N là ngày research thật, probe `scripts/probe-repos.sh`,
  ngày ghi trong digest của repo; không ngày = không đăng; rule 3: quote ≤25
  từ attribution; rule 4: trích code kèm link commit/tree).
- `docs/knowledge/repos/README.md` — convention 2
  (mọi số kèm ngày, re-probe `probe-repos.sh`) + convention 4 (grading ADOPT/
  DIRECTION/WATCH/N/A theo style-guide §8) + convention 6 (digest là research
  nội bộ, không build vào site).
- `docs/superpowers/editorial/2026-blog-longform/style-guide.md` — §8 (grading
  là NỘI DUNG bài) + §10 (ADOPT issue body rubric — pattern + evidence inline
  + đề xuất + upstream links).
