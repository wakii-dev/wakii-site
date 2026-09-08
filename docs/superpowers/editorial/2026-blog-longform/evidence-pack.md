# Evidence pack — blog longform (story FI-359)

> Vật liệu THẬT cho 20 bài. Mọi item ghi: giá trị + nguồn lệnh/file + ngày lấy.
> **D8 rule:** bài viết đối chiếu snapshot bên dưới; KHÔNG tin số nhớ-cache không
> nguồn. Drift nguồn phát hiện ở QA (SF-5) = ghi chú, không fail. Bài ghi số kèm
> "tại thời điểm viết" + ngày snapshot.

## Numbers snapshot (D8) — chụp 2026-09-08 (FI-373 SF-1 refresh; trước đó 2026-09-07)

| # | Số liệu | Giá trị tại snapshot | Nguồn lệnh / file |
|---|---------|----------------------|-------------------|
| 1 | Skills | **20 tổng / 13 public** | `src/data/skills.ts` — đếm TRONG mảng `export const skills`: `id: '` ×20 + `public: true` ×13 (2026-09-08). ⚠ Giá trị 21/14 của lần chụp 2026-09-07 là ĐẾM SAI grep whole-file (dính `Skill` interface + comment) — xem `claims-registry.md` `## Drift-note` |
| 2 | Releases (wakii-dev/wakii) | **v1.4.199** `2026-09-05T19:07:31Z` (Latest) · **v1.4.198** `2026-09-05T12:47:15Z` · **mobile-android-v0.0.48** (Pre-release) `2026-09-05T13:00:31Z` · **KHÔNG có v1.4.197** | `gh release list --repo wakii-dev/wakii --limit 6` (2026-09-08) — output nguyên văn: `Wakii 1.4.199  Latest  v1.4.199  2026-09-05T19:07:31Z` / `Wakii 1.4.198  v1.4.198  2026-09-05T12:47:15Z` / `Orca Mobile Android mobile-android-v0.0.48  Pre-release  mobile-android-v0.0.48  2026-09-05T13:00:31Z` — re-verify 2026-09-08: GIỐNG HỆT lần chụp 2026-09-07 |
| 3 | Agents | **9**: phase0-impact-analyst, spec-critic, plan-critic, task-executor, designer, code-reviewer, verifier, security-audit, rollback-fixer | `src/content/docs/en/agents-and-kit.md` §"The 9-agent story team" (bảng 9 hàng) |
| 4 | story-* CLIs | **24** executable trong `~/.claude/bin/` | `ls ~/.claude/bin \| grep '^story-'\| wc -l` → 25 match − 1 file `story-dashboard.html` = 24 (re-verify 2026-09-08 — kết quả không đổi) |
| 5 | Posts hiện có | **10** (5 slug × 2 locale, FI-341): review-ai-agents-from-your-phone · story-workflow-idea-to-release · decision-gates-safe-ai-agents · forking-an-ide-keeping-current-with-upstream · building-wakii-in-the-open-log-1 | `ls src/content/blog/en/ src/content/blog/vi/` (2026-09-07) |
| 6 | hub-store public | **isPrivate: false**, owner `wakii-dev` | `gh repo view wakii-dev/hub-store --json isPrivate,name,owner` (2026-09-07) |
| 7 | Blog story hiện tại | Đang có **25 slug × 2 locale = 50 file** (FI-341: 5 slug seed + FI-359: 20 slug); batch-2 (FI-373) kế hoạch **+44 slug → 69 slug × 2 = 138 trang bài** | `ls src/content/blog/en/ src/content/blog/vi/` (2026-09-08) + epic spec FI-373 `topic-matrix-batch2.md` |

> Snapshot là **mức đối chiếu**, không phải lời hứa vĩnh viễn. Bài viết sinh sau
> snapshot: re-extract lệnh nguồn nếu nghi ngờ, ghi số theo snapshot + ngày.

### Batch-3 repo snapshot (FI-383) — stars theo GitHub API ngày 2026-09-08

50 repo của `topic-matrix-batch3.md` — số copy từ epic spec §MATRIX (probe
2026-09-08, `/tmp/repos-probe-clean.txt`). Bài batch-3 KHÔNG dùng số này
trực tiếp khi đã muộn hơn: re-probe bằng `bash scripts/probe-repos.sh` và
ghi ngày probe thật của mình ("theo GitHub API ngày N" — claims-registry
§Third-party claims). Bảng theo matrix #:

| # | repo | stars @ 2026-09-08 | license |
|---|------|--------------------|---------|
| 1 | deepseek-ai/deepseek-harness | 215k | probe khi research |
| 2 | anomalyco/opencode | 205k | probe khi research |
| 3 | ollama/ollama | 180k | probe khi research |
| 4 | langchain-ai/langchain | 145k | probe khi research |
| 5 | anthropics/claude-code † | 144k | **none/NOASSERTION** |
| 6 | ggml-org/llama.cpp | 127k | probe khi research |
| 7 | google-gemini/gemini-cli | 106k | probe khi research |
| 8 | punkpeye/awesome-mcp-servers | 94k | probe khi research |
| 9 | modelcontextprotocol/servers † | 90k | **none/NOASSERTION** |
| 10 | zed-industries/zed † | 89k | **none/NOASSERTION** |
| 11 | junegunn/fzf | 82k | probe khi research |
| 12 | cline/cline | 67k | probe khi research |
| 13 | OpenHands/OpenHands | 86k | probe khi research |
| 14 | headroomlabs-ai/headroom | 70k | probe khi research |
| 15 | aaif-goose/goose | 54k | probe khi research |
| 16 | Aider-AI/aider | 48k | probe khi research |
| 17 | DeusData/codebase-memory-mcp | 42k | probe khi research |
| 18 | charmbracelet/crush | 27k | probe khi research |
| 19 | xai-org/grok-build | 26k | probe khi research |
| 20 | microsoft/mcp-for-beginners | 17k | probe khi research |
| 21 | hangwin/mcp-chrome | 12k | probe khi research |
| 22 | modelcontextprotocol/registry † | 7k | **none/NOASSERTION** |
| 23 | neovim/neovim | 102k | probe khi research |
| 24 | vllm-project/vllm | 91k | probe khi research |
| 25 | FoundationAgents/MetaGPT | 70k | probe khi research |
| 26 | microsoft/autogen | 60k | CC-BY-4.0 (spec) |
| 27 | crewAIInc/crewAI | 58k | probe khi research |
| 28 | HKUDS/nanobot | 47k | probe khi research |
| 29 | exo-explore/exo | 47k | probe khi research |
| 30 | janhq/jan † | 44k | **none/NOASSERTION** |
| 31 | openai/openai-agents-python | 29k | probe khi research |
| 32 | pydantic/pydantic-ai | 19k | probe khi research |
| 33 | QwenLM/Qwen-Agent | 17k | probe khi research |
| 34 | camel-ai/camel | 17k | probe khi research |
| 35 | HKUDS/DeepCode | 16k | probe khi research |
| 36 | ast-grep/ast-grep | 15k | probe khi research |
| 37 | coder/code-server | 79k | probe khi research |
| 38 | BurntSushi/ripgrep | 68k | probe khi research |
| 39 | sharkdp/bat | 60k | probe khi research |
| 40 | starship/starship | 59k | probe khi research |
| 41 | helix-editor/helix | 46k | MPL-2.0 (spec) |
| 42 | sxyazi/yazi | 42k | probe khi research |
| 43 | lapce/lapce | 38k | probe khi research |
| 44 | continuedev/continue | 35k | probe khi research |
| 45 | TabbyML/tabby † | 33k | **none/NOASSERTION** |
| 46 | anywhere-labs/dsh-desktop | 24k | probe khi research |
| 47 | CopilotKit/OpenBot | 4k | probe khi research |
| 48 | Hisn00w/ASu-skills | 3.9k | probe khi research |
| 49 | yetone/cumora | 3.5k | probe khi research |
| 50 | Leonxlnx/unlazy | 3.1k | probe khi research |

**License notes — 6 slug †** (`none`/`NOASSERTION` trên GitHub API): bài của
6 slug `deep-dive-anthropics-claude-code` · `deep-dive-modelcontextprotocol-servers`
· `deep-dive-modelcontextprotocol-registry` · `deep-dive-zed-industries-zed` ·
`deep-dive-tabbyml-tabby` · `deep-dive-janhq-jan` gọi "công khai trên GitHub",
KHÔNG "open-source"/"mã nguồn mở" (scoped FORBIDDEN — claims-registry).
Probe 2026-09-08 thấy thêm 2 repo NOASSERTION ngoài 6 † pin:
`charmbracelet/crush` + `neovim/neovim` (tổng 8 none/NOASSERTION) — scoped
FORBIDDEN chỉ enforce 6 slug theo pin D8; bài 2 slug kia VẪN viết
license-safe (review-enforced) đến khi coordinator ACK mở scope.
Hai license đặc biệt khác đã biết từ spec: microsoft/autogen = CC-BY-4.0,
helix-editor/helix = MPL-2.0. Các dòng "probe khi research": SF sở hữu chạy
`bash scripts/probe-repos.sh` và điền license thật + ngày vào digest trước
khi viết bài.

## Hub-store artifacts (D3) — dự án production chạy bằng workflow

Repo public `https://github.com/wakii-dev/hub-store` — verify public 2026-09-07
(`gh repo view`, isPrivate false). Source of truth cho QUOTES = local mirror
`~/Desktop/projects/service-support-clone/docs/superpowers/` (READ-ONLY — repo
sibling, không thuộc worktree này); link trong bài trỏ GitHub, MỖI link kèm trích
dẫn thật trong bài (chống link-chết).

**Đã verify trên GitHub main 2026-09-07:** `docs/superpowers/brackets/` chứa
**6/7** brackets (thiếu `fi338-dispatch-queue.md` — local có, CHƯA push lên main
→ KHÔNG link GitHub cho fi338 bracket; nếu SF-4 cần, dùng spec `2026-09-07-dispatch-queue-design.md`
— đã có trên main). `specs/` = 32 file, `plans/` = 53 file trên main. Nội dung
raw GitHub khớp local mirror (spot-check fi245 2026-09-07).

### 7 brackets (đường dẫn GitHub + quy mô + quote đáng dùng)

| Bracket | GitHub link (main) | SF | Quote tiêu đề SF đáng dùng làm dẫn chứng |
|---------|--------------------|----|------------------------------------------|
| `ict-service-support-rebuild` (FI-232) | `https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/ict-service-support-rebuild.md` | 7 | SUPERSEDED 2026-08-31 — gộp vào FI-233; file còn là audit trail ("File này chỉ còn là audit trail (Linear FI-232 Canceled)") — dẫn chứng cho luật "đánh dấu, không xoá" |
| `fi233-polyglot-grpc-mf` (FI-233) | `https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/fi233-polyglot-grpc-mf.md` | 11 | "SF-1 FE Foundation + Spikes" — spike-first: "KHÔNG SF UI start trước verdict SPIKE 1-3" |
| `fi245-postgres-production` (FI-245) | `https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/fi245-postgres-production.md` | 28 | "SF-1 Postgres infra + seed pipeline" (12 tasks: compose postgres 2 DB initdb, healthcheck, seed pipeline script…); "SF-2 Orders Java → Postgres" |
| `fi272-minikube-deploy` (FI-272) | `https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/fi272-minikube-deploy.md` | 5 | "SF-1 K8s platform foundation + Postgres + Kafka" — Kafka = "KRaft wiring slot (app không dùng)"; preflight khuyến nghị `--memory=6g --cpus=4` |
| `fi280-qa-hub-store-regression` (FI-280) | `https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/fi280-qa-hub-store-regression.md` | 8 | "SF-1 Baseline + Rubric (Tier 0)" — "Boot-verify full stack main @ d107f2f 7/7 ports; chạy 25 e2e specs baseline đỏ/xanh" |
| `fi326-api-docs-swagger` (FI-326) | `https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/brackets/fi326-api-docs-swagger.md` | 9 | "SF-1 Foundation — toolchain, root spec, drift-guard, Swagger UI" — drift-guard vitest chặn thêm/xoá route không sửa spec |
| `fi338-dispatch-queue` (FI-338) | **bracket local-only (chưa lên GitHub main)** — trỏ về spec thay: `https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/specs/2026-09-07-dispatch-queue-design.md` | 6 | "SF-1 Data & contract foundation" — Migration V15 recipient/read_at vào notification_log; permission keys `dispatch.view/assign` |

### Specs / plans nổi bật (dẫn chứng sâu cho bài case-study)

- `https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/specs/2026-09-03-sf11-fe-convergence-design.md`
  — "SF-11 FE Convergence — Audit viewer + Export UI + Mobile + Harmonize — Design"
  (epic FI-245 / SF FI-256) — convergence story THẬT, dẫn chứng cho matrix #13.
- `https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/specs/2026-09-03-sf25-ktv-mobile-design.md`
  — "SF-25 — KTV/CTV Mobile Web App — Design Spec" (FI-270, Tier 5) — tier sâu,
  dẫn chứng cho matrix #8/#10.
- `https://github.com/wakii-dev/hub-store/blob/main/docs/superpowers/qa-rubric.md`
  — QA rubric thật, dẫn chứng cho matrix #12 (done-means-evidence).

## Vật liệu theo bài (bổ sung evidence chính trong matrix)

- **#2 nine-agents**: bảng 9 agents (snapshot D8 dòng 3). Case "reviewer bắt
  P0 sau khi executor sign-off": kể theo audit trail story FI-300 (Linear epic
  FI-300 comment `b3a22407`) — reviewer bắt lỗi scoped-style + escaping ở SF
  đã report DONE. KHÔNG nêu số liệu không có trong audit.
- **#3 gates / #4 watchdog / #5 memory / #6 defensive / #7 rollback**: đọc
  `src/content/docs/en/story-workflow.md` (B0-B5 ở dòng ~44; watchdog 3-layer
  ~122; 8 principles ~61+) — trích nguyên văn khi cần.
- **#7 rollback case FI-289**: direction v1 → v2 Bento Premium — nguồn
  `docs/superpowers/designs/sf1-direction.md` (repo này) + Linear FI-289.
- **#11 one-branch-one-pr**: wakii-site PR #1 "FI-339: Blog features —
  tutorials, tech notes, build logs (en/vi)" merge commit `3d9a7c3`; hub-store
  PR #1 "FI-326: BFF API docs Swagger (OpenAPI) — 84 REST endpoints / 12 tags"
  merge commit `0144d80` ("Merge pull request #1 from wakii-dev/story/fi326-api-docs-swagger")
  — verify `gh pr list --state merged` 2026-09-07.
- **#12/#13 convergence**: FI-342 (QA story blog FI-339) 7/7 criteria PASS,
  0 fix commit, story-verify exit 0; explained diff = domain wakii.dev→wakii.xyz
  (commit `9d4d460`) — nguồn: Linear FI-342 verdict + audit comment epic FI-339.
- **#15 blog-story-case-study**: file thật `scripts/check-blog-slug-parity.mjs`
  (đọc quote header); og contract comment trong `src/pages/blog/[slug].astro` +
  `src/layouts/Base.astro` (`new URL(ogImage, Astro.site)`); merge `55e5ae1`
  (dest FI-339). FI-339 dest branch = `story/fi339-blog-features`.
- **#17 og anatomy**: đọc code thật — `src/layouts/Base.astro` (og:image absolute
  qua `new URL(ogImage, Astro.site)`), `src/pages/blog/[slug].astro` (truyền
  `ogType="article"` + `publishedTime`). KHÔNG sửa file — chỉ đọc làm dẫn chứng.
- **#18 rss anatomy**: đọc `src/pages/rss.xml.js` — 1 feed 2 locale, `<guid>`
  absolute per locale, KHÔNG có `<language>` — tìm comment trade-off trong file.
- **#19 skills tour**: `/skills/` render từ `src/data/skills.ts` (filter
  `public === true`); số = snapshot D8 dòng 1 (21/14, ngày 07-09-2026) — bài PHẢI
  ghi "tại thời điểm viết".
- **#20 log-2**: nối `building-wakii-in-the-open-log-1` (seed, 09-07) — đọc log-1
  trước để KHÔNG lặp; số liệu dùng snapshot D8 (blog 10→30, 2 story blog).
- **Pilot #1 zero-setup**: docs getting-started §5 "First run — nothing to set
  up" (kit tự cài `~/.claude/`, idempotent); paths thật `~/.claude/bin/story-*`
  (24 CLIs — snapshot D8 dòng 4); panel ⚡ 2 tab (docs superpowers-panel).

## Format evidence block trong bài (quy ước)

```
< ASCII diagram / transcript / bảng >
```
kèm 1 dòng: *Nguồn: <lệnh/file/URL>, lấy <ngày>.* — không nguồn = không đăng.
