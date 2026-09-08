# Topic matrix — 20 bài blog longform (story FI-359)

> **Tài sản dùng chung của toàn story.** SF-2/3/4 ĐỌC file này trước khi viết bất
> kỳ bài nào. Nguồn: epic spec `docs/superpowers/specs/2026-09-07-blog-longform-20-posts-spec.md`
> §Ma trận — slug · category · pubDate · evidence chính là **CHỐT CỨNG (D2/D6)**:
> KHÔNG đổi slug, KHÔNG đổi ngày, KHÔNG đổi category. Cột `title hướng`, `docs-link`,
> `tags`, `angle` là định hướng viết — được nới theo tiến triển thật NHƯNG slug/ngày/category
> không bao giờ đổi.
>
> Quy tắc ngày: tối đa 2 bài mới/ngày; double-day **08-31** (#11, #12) và **09-07**
> (#19, #20); thứ tự trong ngày = collection glob order — chấp nhận (cosmetic).
> Phân bổ category (D6): **3 tutorial (#1, #10, #19) · 13 tech · 4 build-log
> (#14, #15, #16, #20)** — tổng site sau story: 4/16/5.

## Ma trận 20 bài

| # | slug | cat | pubDate | Title hướng (VI) | Evidence chính (bắt buộc) | Docs-link | Tags đề xuất | Angle — ≥2 H2 mới so seed |
|---|------|-----|---------|------------------|---------------------------|-----------|--------------|---------------------------|
| 1 | `zero-setup-agent-team` | tutorial | 2026-08-20 | Đội agent đầu tiên của bạn — không có bước cài đặt | Kit tự cài lần đầu chạy: paths thật `~/.claude/bin/story-*`, idempotent (docs getting-started §5) | `/docs/getting-started/` | workflow, agents, autonomy | "Cài lần đầu mà không cài gì" · "Bên trong kit tự cài" — góc nhìn zero-setup + cấu trúc kit, không trùng seed nào |
| 2 | `nine-agents-separated-powers` | tech | 2026-08-21 | Chín agent, quyền hạn tách rời | Bảng 9 agents (docs agents-and-kit); case thật: reviewer bắt scoped-style + escaping P0 sau khi executor sign-off | `/docs/agents-and-kit/` | agents, supervised, workflow | "Chín vai, chín quyền hạn" · "Vì sao người viết không tự duyệt" — tách quyền làm chủ đề, seed không có bảng vai trò |
| 3 | `gates-not-trust-rule-zero` | tech | 2026-08-22 | Gates, not trust — và Rule 0 | 5 gates per SF + B0-B5; case thật: flow check bắt stale preview server dù DOM sweep pass | `/docs/story-workflow/` | gates, guardrails, story-workflow | "Gate là hợp đồng, không là niềm tin" · "Rule 0: nhìn thấy rồi mới nói xong" — KHÁC seed decision-gates: đây là cơ chế gates trong workflow + Rule 0 browser, không phải taxonomy gate mobile |
| 4 | `watchdog-idle-is-not-dead` | tech | 2026-08-23 | Watchdog: im lặng không phải là chết | 3-layer check (commits/terminal/Linear); case thật: SF im lúc build native dài → để yên; SF kẹt gate → resume từ commit tốt | `/docs/story-workflow/` | story-workflow, workflow, guardrails | "Ba lớp kiểm một SF" · "Resume từ commit xanh cuối" — phân biệt im-lành và im-hỏng, seed không có |
| 5 | `story-memory-learning-loop` | tech | 2026-08-24 | Vòng lặp học của story | Post-task ritual; case thật: bài học CLI flag đổi tên giữa 2 release | `/docs/superpowers-panel/` | memory, story-workflow, workflow | "Bài học được ghi ở đâu" · "Từ ritual thành skill mới" — memory loop end-to-end, seed chỉ nhắc qua |
| 6 | `defensive-by-design` | tech | 2026-08-25 | Phòng thủ từ thiết kế | Dry-test lệnh mới, nothing deleted, flag-not-guess; case thật: merge conflict giữ CẢ HAI bên | `/docs/story-workflow/` | guardrails, workflow, agents | "Giả định là nợ" · "Giữ CẢ HAI bên khi conflict" — thói quen phòng thủ của đội agent, seed không có |
| 7 | `controlled-rework-rollback` | tech | 2026-08-26 | Rework có kiểm soát — revert là tính năng | Revert về last-good + re-execute; case thật: FI-289 direction v1 → v2 Bento Premium | `/docs/story-workflow/` | story-workflow, git, workflow | "Last-green là điểm quay" · "Đổi hướng không mất lịch sử" — rollback có chủ đích, seed không có |
| 8 | `long-tasks-bracket-tiers` | tech | 2026-08-27 | Dự án dài: bracket và tier | Bracket THẬT của 2 dự án: FI-339 (repo này) + `fi245-postgres-production.md` hub-store (link GitHub) — diagram ASCII so quy mô | `/docs/story-workflow/` | story-workflow, workflow, linear | "Bracket là bản đồ dự án dài" · "So quy mô hai bracket thật" — 2 bracket thật cạnh nhau, seed chỉ tả pipeline chung |
| 9 | `parallel-worktrees-isolation` | tech | 2026-08-28 | Song song bằng worktree isolation | Worktree per SF, atomic commit per task; transcript: `git worktree list` thật lúc story chạy | `/docs/agents-and-kit/` | worktree, git, agents | "Mỗi SF một worktree" · "Commit atomic là đơn vị rollback" — cơ chế isolation, seed không có transcript thật |
| 10 | `linear-as-external-memory` | tutorial | 2026-08-29 | Linear làm bộ nhớ ngoài | Epic → sub-issues, DAG, audit comment; transcript: body sub-issue thật (Tier/Depends/What/Tasks) từ story hub-store (artifact GitHub) | `/docs/story-workflow/` | linear, story-workflow, workflow | "Bộ nhớ ngoài cho đội agent" · "Audit comment tái tạo được" — Linear như state machine, seed không có |
| 11 | `one-branch-one-pr` | tech | 2026-08-31 | Một nhánh đích, một PR | PR merge thật: wakii-site PR #1 (`story/fi339-blog-features`) + hub-store PR #1 (`story/fi326-api-docs-swagger`, merge commit `0144d80`) | `/docs/story-workflow/` | git, story-workflow, workflow | "PR là bằng chứng tổng" · "Merge-ngược an toàn" — kỷ luật nhánh + 2 PR thật, seed không có |
| 12 | `done-means-evidence` | tech | 2026-08-31 | Done nghĩa là có bằng chứng | Verifier độc lập vs self-report; case thật: FI-342 7/7 PASS + 0 fix commit, verdict exit 0; đối chiếu QA rubric thật `docs/superpowers/qa-rubric.md` hub-store (GitHub) | `/docs/story-workflow/` | qa, evidence, story-workflow | "Self-report không counts" · "Verifier làm lại từ đầu" — định nghĩa done, seed không có case FI-342 |
| 13 | `convergence-qa-last-tier` | tech | 2026-09-01 | Convergence QA — tier cuối hội tụ | Tier cuối hội tụ; case thật: FI-342 explained-diff + hub-store có convergence story thật (`fi245` sf11-fe-convergence spec/plan trên GitHub) | `/docs/story-workflow/` | qa, story-workflow, workflow | "Tier cuối không viết gì mới" · "Explained diff cũng phải giải thích" — hội tụ thay vì thêm tính năng, seed không có |
| 14 | `shipping-cadence-two-releases-one-day` | build-log | 2026-09-02 | Hai release trong một ngày | THẬT + verify `gh release list` wakii-dev/wakii: 2 release cùng một ngày (v1.4.198 + v1.4.199, 09-05) + 1 pre-release Android; assets version-named (config.ts comment). KHÔNG claim v1.4.197 — không có tag/release 197 trên public repo | `/docs/getting-started/` | release, build-log, wakii | "Nhịp ship và giá của nó" · "Assets version-named nghĩa là gì" — cadence thật có số liệu verify, seed không có |
| 15 | `blog-story-case-study` | build-log | 2026-09-03 | Case study: story của chính blog này | Chính story blog: parity gate trong build (file thật `check-blog-slug-parity.mjs`), og contract comment trong code, merge `55e5ae1` | `/docs/story-workflow/` | build-log, story-workflow, evidence | "Parity gate sống trong build" · "Contract đọc được trong code" — case study repo này, seed log-1 không đụng cơ chế gate |
| 16 | `wakii-in-production-hub-store` | build-log | 2026-09-04 | Wakii in production: hub-store | **Case study dự án THẬT**: hub-store — platform vận hành kho (React microfrontends Module Federation + BFF Fastify + gRPC polyglot Java/Go/Python + Postgres/Kafka/Keycloak) chạy bằng story workflow từ rebuild epic → postgres production → minikube/K8s deploy → QA regression → dispatch queue; evidence = link GitHub artifacts thật (brackets · specs · plans) | `/docs/story-workflow/` | build-log, story-workflow, evidence | "Production chạy bằng workflow" · "Artifact công khai, tự kiểm được" — case study dự án ngoài, seed không có |
| 17 | `og-article-contract-anatomy` | tech | 2026-09-05 | Anatomy: OG article contract | Đọc code thật `[slug].astro` + Base.astro: tại sao og absolute qua `new URL(, Astro.site)` | `/docs/faq/` | og, seo, wakii | "Vì sao og:image phải absolute" · "Một dòng `new URL`, cả hệ thống đúng" — deep-dive code thật, seed không có |
| 18 | `rss-bilingual-feed-anatomy` | tech | 2026-09-06 | Anatomy: RSS feed song ngữ | Đọc `rss.xml.js`: 1 feed 2 locale, guid absolute, no language — trade-off | `/docs/faq/` | rss, wakii, workflow | "Một feed, hai ngôn ngữ" · "Trade-off: bỏ `<language>` tag" — deep-dive feed thật, seed không có |
| 19 | `skills-catalog-tour` | tutorial | 2026-09-07 | Tour kỹ năng public của Wakii | Public skills trên /skills/ (data thật `src/data/skills.ts`, số đọc LÚC VIẾT — snapshot D8: 21 tổng / 14 public ngày 2026-09-07), skills = thứ agents load on-demand | `/docs/superpowers-panel/` | skills, agents, wakii | "Skill là thứ agent load on-demand" · "Đọc số liệu lúc viết, đừng nhớ" — tour catalog + quy tắc số liệu, seed không có |
| 20 | `building-wakii-in-the-open-log-2` | build-log | 2026-09-07 | Xây Wakii ra công khai — log 2 | Log-2: blog 10→30, số liệu thật 2 story blog + parity gate; nối log-1 (`building-wakii-in-the-open-log-1`, 09-07) — slug khớp họ log-1 | `/docs/getting-started/` | build-log, wakii, release | "Blog 10 → 30" · "Hai story blog, một parity gate" — tiếp nối log-1 bằng số liệu story này, KHÔNG lặp nội dung log-1 |

## Quy tắc tiêu thụ matrix (cho SF-2/3/4)

1. **Angle là bắt buộc, không là gợi ý** — mỗi bài phải có ≥2 H2 mà KHÔNG seed nào
   có (runbook bước outline kiểm). H2 ghi trong matrix có thể tinh chỉnh wording khi
   viết, nhưng must giữ đúng GÓC NHÌN đã chốt.
2. **Evidence chính là mức tối thiểu** — bài cần thêm evidence phụ thì lấy từ
   `evidence-pack.md` (snapshot D8 + digest hub-store), KHÔNG bịa.
3. **Tags** — đề xuất trong matrix là mặc định; thay được bằng vocab trong
   `style-guide.md` §Tags, không tự chế từ ngoài vocab.
4. **Docs-link** — cột này là link tối thiểu ≥1/bài, đúng locale (D4: VI
   `/vi/docs/`, EN `/docs/`). Thêm link thứ 2 được, phải cùng ràng buộc.
5. KHÔNG link cross-file kèm `#anchor` (heading VI/EN lệch nhau → anchor chết trên
   trang 200); link docs chỉ tới trang.
