# Aider-AI/aider — research digest (batch-3, matrix #16)

> Skeleton FI-383 SF-1 — SF sở hữu ĐIỀN các TODO dưới đây trước khi viết bài
> (research thật: đọc README + code, không dùng trí nhớ). Tên file = slug bài.
> KHÔNG bịa số không probe; mọi số third-party cite kèm ngày lấy
> (claims-registry §Third-party claims — batch-3).

- repo: Aider-AI/aider
- facet: harness
- stars @ 2026-09-08: 48827
- license (GitHub API 2026-09-08): Apache-2.0
- probe-date: 2026-09-08 (`bash scripts/probe-repos.sh`)
- probe bổ sung (gh api @ 2026-09-08): pushed 2026-05-22 · archived false · forks 4933 · open issues 1855 · HEAD `5dc9490bb35f9729ef2c95d00a19ccd30c26339c`

## TODO — điền khi research (SF sở hữu)

- [x] README notes — "AI Pair Programming in Your Terminal": pair program với
  LLM để bắt đầu project mới hoặc build trên codebase có sẵn. Điểm khác biệt
  cốt lõi theo README (ngày probe 2026-09-08): repo map của cả codebase,
  git integration tự động commit, 100+ ngôn ngữ, watch mode chạy trong IDE
  (nhắc việc bằng comment), lint + test sau mỗi thay đổi, voice-to-code,
  copy/paste web chat. Badge tự công bố (sinh bằng cog script
  `scripts/homepage.py`, đọc @ 2026-09-08): 6,8M installs PyPI · 15B
  tokens/week · Top 20 OpenRouter · "Singularity 88%" = phần trăm code mới
  của release cuối do chính aider viết.
- [x] Architecture — đọc code thật @ HEAD `5dc9490`:
  - `aider/coders/` — mỗi edit format một class: `editblock_coder.py`
    (SEARCH/REPLACE block), `wholefile_coder.py` (cả file), `udiff_coder.py`
    (unified diff), `patch_coder.py`, `architect_coder.py` (2 bước: model
    architect đề xuất, model editor viết code), cùng biến thể editor/ask/help.
    `search_replace.py` + `apply_edits` (base_coder.py line 2428) biến text
    model phát ra thành edit trên đĩa. Prompt chặn chặt format:
    "All changes to files must use this *SEARCH/REPLACE block* format.
    ONLY EVER RETURN CODE IN A *SEARCH/REPLACE BLOCK*!"
    (aider/coders/editblock_prompts.py).
  - `aider/repomap.py` — `RepoMap`, `map_tokens=1024` mặc định; tree-sitter
    tags qua grep-ast (Tag = rel_fname/fname/line/name/kind), cache diskcache
    `.aider.tags.cache.v4`; xếp hạng bằng `nx.pagerank(G, weight="weight",
    **pers_args)` trên MultiDiGraph file → định nghĩa → identifier, với
    personalization cộng trọng số cho file được nhắc trong chat (line 525;
    fallback không-personalization khi ZeroDivisionError — issue #1536).
  - `aider/coders/base_coder.py` — `check_for_dirty_commit` (line 2175):
    file sắp sửa đang dirty → commit trạng thái cũ TRƯỚC khi áp edit, log
    "Committing <path> before applying edits."; lý do trong comment nguồn:
    "We need a committed copy of the file in order to /undo".
    `auto_commit` (line 2375): sau mỗi vòng chat gọi
    `repo.commit(fnames=edited, context=context, aider_edits=True,
    coder=self)` — commit message do LLM viết từ lịch sử hội thoại, cờ
    `aider_edits` đánh dấu commit của AI.
- [x] Releases — cadence + release gần nhất (gh api releases per_page=6,
  ngày probe 2026-09-08; ngày = published_at UTC):
  v0.86.0 2025-08-09 · v0.85.0 2025-06-27 · v0.84.0 2025-05-30 ·
  v0.83.0 2025-05-09 · v0.82.0 2025-04-14 · v0.81.0 2025-04-04.
  Cadence ~1 release/tháng từ 04 tới 08-2025 rồi DỪNG — 13 tháng không
  release tính tới ngày probe. Default branch vẫn nhận commit bảo trì nhỏ:
  5 commit gần nhất trong cửa sổ 2026-04-23 → 2026-05-22 (thêm tree-sitter
  tags cho bash phục vụ repo map — PR #5132; mở rộng ANTHROPIC_MODELS —
  PR #5173). pushed_at 2026-05-22, archived false → phát triển chậm hẳn
  (maintenance), không phải abandoned chính thức.
- [x] Wakii grading — (style-guide §8; đối chiếu docs/en/story-workflow.md +
  docs/en/agents-and-kit.md):
  - **ADOPT** — snapshot-commit trước khi agent áp edit vào worktree dirty
    (`check_for_dirty_commit`): executor Wakii mở task trên worktree có thay
    đổi dở (resume giữa chừng, phiên trước để lại) nên snapshot-commit có
    nhãn máy đọc được đầu task sẽ cho rollback-fixer revert đúng phạm vi.
    Đề xuất cụ thể trong adopt-draft-Aider-AI-aider.md.
  - **DIRECTION** — repo map tính được (tree-sitter + PageRank personalized)
    cho phase0-impact-analyst khi đụng repo lạ; chưa áp ngay vì context pack
    viết tay ở epic level đã phủ case chính, map thuật toán cần đầu tư
    cache + parser theo ngôn ngữ như aider.
  - **WATCH** — edit format như hợp đồng riêng theo model; harness Wakii đã
    ép output cấu trúc ở tầng workflow (gate choice/free-text, lint máy);
    đổi grade khi Wakii chạy executor trên model không theo tool-call chuẩn.
