# rules/ — ECC coding rules cho wakii-site (load on-demand)

Rule ECC nguồn [`affaan-m/ECC`](https://github.com/affaan-m/ECC) (MIT), cấu trúc NGUYÊN BẢN — không sửa file gốc, dễ update upstream.
Lớp phủ fork Wakii: [`wakii-overlay.md`](./wakii-overlay.md) — áp cho MỌI file.
Sync từ orca repo `rules/` ngày 07/11/2026.

## Quy tắc load

**Agent đụng file nào → đọc rule có glob khớp TRƯỚC khi sửa.** Load on-demand theo tờ khai báo
[`wakii-site.json`](./wakii-site.json) (applicable: `common`, `web`) — KHÔNG nhét cả 18 file vào
context; chỉ đọc `common/` của chủ đề tương ứng, `web/` khi đụng CSS/HTML/Astro UI, và `wakii-overlay.md`.

## Bảng glob → rule

| Glob khớp file đang sửa | Đọc rule |
|---|---|
| `*.astro`, UI components, layout | [`web/`](./web/) |
| `*.css` `*.scss` `*.html` | [`web/`](./web/) |
| Mọi file (`.ts` `.md` config, nội dung blog/docs) | [`common/`](./common/) + [`wakii-overlay.md`](./wakii-overlay.md) |

Frontmatter `paths:` của từng file là nguồn thật của glob — grep khi phân vân:

```sh
grep -A6 '^paths:' rules/web/coding-style.md
```

`common/` gồm 10 file nền: `agents` · `code-review` · `coding-style` · `development-workflow` ·
`git-workflow` · `hooks` · `patterns` · `performance` · `security` · `testing`.
`web/` gồm 7 file: `coding-style` · `design-quality` · `hooks` · `patterns` · `performance` ·
`security` · `testing`.

## Update upstream

Copy lại từ orca repo `rules/common/`, `rules/web/`, `rules/projects/wakii-site.json`,
`rules/wakii-overlay.md` (giữ LF/UTF-8 nguyên bản), cập nhật ngày sync ở trên.
