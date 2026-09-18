# Wakii applicability — ahmedkhaleel2004/gitdiagram (2026-09-18)

Đối chiếu với surface hiện tại: kit (kit-verify asserts, manifest-negative tests,
bracket files `docs/superpowers/brackets/*.md` render bởi Wakii Story tab,
code-reviewer def 2.14.1, kb-layer1), Orca agent-status streaming, wakii-site.

| # | Pattern | Level | Landed-ở-đâu (nếu adopt) |
|---|---------|-------|--------------------------|
| 1 | Deterministic validator quanh output có cấu trúc của LLM — validate identifier/connectivity/**path thật** rồi mới chấp nhận, invalid retry kèm focused feedback; parser đầy đủ để riêng ở test suite làm contract test | **ADOPT** | `kit/tests/` — validator cho bracket files: mỗi SF path/issue ID/file reference trong `docs/superpowers/brackets/*.md` phải tồn tại thật (Story tab render trực tiếp, bracket sai = tab sai). Cùng doctrine kit-verify-manifest.mjs (20 asserts) đang dùng cho agent def |
| 2 | Fail-before-model — chặn input quá to/truncated trước khi gọi model | **DIRECTION** | kit 2.14.1 (`7f7a2229df`, branch `feat/kit-2.14.1-review-input-policy`, chưa merge integration) vừa đặt bước đầu: adaptive depth >50 lines + deterministic-first. Bước kế: cap cứng kích thước review input, fail-loud thay vì nén im lặng — `kit/agents/code-reviewer.md` |
| 3 | Cache artifact theo input — mở lại không tốn model call (R2 keyed by repo) | **DIRECTION** | kb-layer1 (kit 2.14.0, `story/gh45-kb-layer1`) đã đi đúng hướng; push tiếp: persist reviewer/verify artifacts keyed by (repo, commit-range) để review lại sau không chạy lại từ đầu |
| 4 | Cost accounting làm product surface — estimate trước, quota, cancellation, partial usage của request bị cancel vẫn tính | **WATCH** | Quyết định product: token/cost budget cho SF workers hiện ở đâu trong Orca — nếu muốn surface cho user thì là app-level, không phải kit config; cần product call |
| 5 | Render an toàn nội dung AI-sinh: Mermaid strict mode + sanitize SVG + link allowlist (3 lớp) | **WATCH** | Wakii Story tab render bracket md; nếu tab bắt đầu render mermaid/HTML do agent sinh → cần tầng sanitize trước. Kiểm tra renderer hiện tại trước khi quyết — không chấm ADOPT từ ngoài |
| 6 | Streaming generation (SSE progress trong lúc model lập graph) | **N/A** | Orca đã có: agent-status store + terminal stream; SF progress không cần thêm kênh |
| 7 | URL-swap distribution trick (`hub`→`diagram` trong mọi GitHub URL) | **N/A** product / angle editorial | Cơ chế viral của họ, không áp vào wakii; dùng làm ví dụ trong post |
| 8 | Solo-maintainer hosted-first, 0 release ở 16k★ | **N/A** | Quan sát phân phối, không phải pattern áp dụng (xem digest angle #1) |

## drift vs lần research trước (file cũ nhất trong folder)

Baseline = `2026-09-18-wakii-applicability.md` (alibaba/open-code-review, viết chiều
cùng ngày). Drift nhanh chưa từng có: **3/3 rows ADOPT của entry đó đã landed trong
vòng vài giờ** — kit 2.14.1 (commit `7f7a2229df`, 20:48 +0700 hôm nay) ship deterministic-first
pass (#2), precision policy (#3), briefing spec+criteria đọc trước diff (#1). Version
kit 2.14.0 → 2.14.1 ngay trong ngày applicability được viết. Bài học: window
"ADOPT → landed" đang tính bằng giờ khi pattern khớp với hướng kit đã đi; entry
gitdiagram này chọn rows cùng đặc điểm đó (validator-first, fail-before-model) vì
khớp 2.14.1 vừa landed.

## Nguồn

- Repo: https://github.com/ahmedkhaleel2004/gitdiagram (MIT) — retrieval 2026-09-18
- README (đọc nguyên văn qua `gh api` cùng ngày): production architecture, generation pipeline, state model
- Stars/cadence: `gh api repos/...` + `gh search repos deepwiki` — retrieval 2026-09-18
- Kit 2.14.1: commit `7f7a2229df` trên orca, branch `feat/kit-2.14.1-review-input-policy`
