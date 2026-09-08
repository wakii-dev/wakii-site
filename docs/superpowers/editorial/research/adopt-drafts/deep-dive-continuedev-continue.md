# ADOPT draft — rules-as-data-blocks (continuedev/continue)

> Draft theo rubric style-guide §10 — SF-5 (FI-388) KHÔNG tự file issue;
> SF-6 file tập trung trên `wakii-dev/wakii`, label `enhancement`, sau review.

## 1. Pattern

Rules-as-data-blocks: khai rule phạm vi agent bằng field có cấu trúc
(`globs` — phạm vi file, `alwaysApply` — bật sẵn hay phải gọi,
`invokable` — là hành động hay chỉ ngữ cảnh) trong một file config
versioned, thay vì văn xuôi. Học từ `continuedev/continue` — coding agent
nhúng vào VS Code/JetBrains/CLI (35,833 stars, license Apache-2.0, theo
GitHub API ngày 2026-09-08).

## 2. Evidence inline

Loader chính thức chuyển rule YAML thành object có schema (trích rút gọn,
`core/config/yaml/yamlToContinueConfig.ts`, theo GitHub API ngày 2026-09-08):

```ts
return {
  source: "rules-block",
  rule: rule.rule,
  globs: rule.globs,
  name: rule.name,
  alwaysApply: rule.alwaysApply,
  invokable: rule.invokable ?? false,
};
```

Nguồn: https://github.com/continuedev/continue/blob/5522c6f44ca0ac3528b37244818fbfa39b5af470/core/config/yaml/yamlToContinueConfig.ts

Vòng đời dự án: README ghi repo "no longer actively maintained and is
read-only for all users" (theo GitHub API ngày 2026-09-08) — pattern này
cần nguồn sống nếu ADOPT issue escalate (xem WATCH trong bài).

## 3. Đề xuất Wakii

Áp vào story-workflow contract: các rule phạm vi file trong context pack
hiện viết bằng văn xuôi ("nhóm editors chỉ được sửa X", "rule này luôn
bật cho SF backend") nên chuyển thành block có schema — ví dụ mỗi rule
khai `globs` (file nào), `alwaysApply` (bật mặc định hay opt-in),
`invokable` — để (a) guard máy lint được rule violation trước khi reviewer
người đọc, (b) diff thay đổi contract review được như code, (c) executor
đọc máy được thay vì diễn giải văn xuôi. Kỳ vọng hành vi: một context
pack sai phạm vi sẽ bị chặn ở bước guard, không trôi tới review. Rủi ro
chính: hai nguồn thật (prose contract vs data block) nếu chuyển dở dang —
cần chuyển nguyên khối và lint chặn song song trong thời gian cửa sổ.

## 4. Upstream links

- Repo: https://github.com/continuedev/continue
- File evidence: https://github.com/continuedev/continue/blob/5522c6f44ca0ac3528b37244818fbfa39b5af470/core/config/yaml/yamlToContinueConfig.ts
- Dogfood config trong chính repo: https://github.com/continuedev/continue/tree/main/.continue
- Bài deep-dive sẽ live tại `/blog/deep-dive-continuedev-continue/` (EN) và
  `/vi/blog/deep-dive-continuedev-continue/` (VI) sau khi story merge
  (build-in-public đã được user duyệt 2026-09-07).
