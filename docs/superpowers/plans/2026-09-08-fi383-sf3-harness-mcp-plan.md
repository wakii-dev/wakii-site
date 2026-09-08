# Plan — FI-383 SF-3: Harness + MCP remainder — 10 bài (FI-386)

> Spec: `docs/superpowers/specs/2026-09-08-blog-batch3-repos-design.md` (rev 3) ·
> Bracket: `docs/superpowers/brackets/fi383-blog-batch3.md` (SF-3) · Context pack:
> `docs/superpowers/contexts/fi383-sf-3.md` · Linear: FI-386. Tier Full (12 tasks).
> ⚠ Launch prompt nhận được là bản batch-2 stale (FI-376) — đã verify `orca linear
> issue` title + worktree `sf-3-blog-b3-harness-mcp` → task thật = FI-386 (pattern
> improvements-log §SF-1 FI-384: "không tin ID trong prompt khi story sinh từ
> template cũ").

## Phase 0-mini (impact — SF level; epic Phase 0 đã chạy ở story level)

- **Problem**: facet harness+MCP remainder (matrix rows 13-22) chưa có bài — 10
  repo third-party cần deep-dive learn-in-public: research probe thật → VI+EN →
  grading `## Wakii học được gì` → ADOPT draft. Claims third-party phải kèm ngày
  probe; license none/NOASSERTION gọi "công khai trên GitHub".
- **Touch map (W)**: `src/content/blog/{en,vi}/deep-dive-<10 slug>.md` (20 file) ·
  `docs/superpowers/editorial/research/digests-batch3/<10 slug>.md` (điền skeleton
  có sẵn) · `docs/superpowers/editorial/research/adopt-drafts/adopt-draft-*.md`
  (chỉ bài grade ADOPT). **(R)**: scripts/ (frozen), editorial docs (frozen),
  matrix (frozen), sibling orca không cần (evidence = repo GitHub công khai).
- **Path note (conflict resolved)**: pack ghi `digests-batch3/adopt-draft-*.md`
  nhưng runbook batch-3 bước 5 + style-guide §10 + digests README #5 (3 frozen
  docs, mới hơn) cùng pin `research/adopt-drafts/` → theo frozen docs, flag
  coordinator unifies ở SF-6 (SF-2 pack vẫn ghi path cũ — SF-6 glob cả hai).
- **Second-order**: listing/RSS/JSON-LD/sitemap tự mở rộng +20 trang (mong muốn);
  lint partial-tolerant — T7 pendingRows NOTE giữa batch EXPECTED; pubDate tương
  lai 10-07→10-11 ∈ matrix = policy a PASS; cross-link CHỈ vào 70 slug tồn tại +
  10 bài của SF này (KHÔNG link sang slug SF-2/4/5 chưa merge); dest di chuyển
  khi sibling merge → merge ancestor-guard CAS + re-verify integrated tree.
- **Direction**: theo matrix CHỐT CỨNG — không fork hướng. Risk chính: (1) số
  third-party thiếu ngày probe (lint/registry rule 1); (2) scoped-FORBIDDEN trên
  `deep-dive-modelcontextprotocol-registry` (machine) + crush NOASSERTION
  (review-enforced); (3) angle trùng giữa 10 bài cùng facet (mỗi bài ≥2 H2 riêng);
  (4) fan-out 429 (stagger ≤3 slot — bài học batch-2 SF-5).
- **Alternatives**: viết tuần tự inline (chậm, context coordinator phình) vs
  task-executor per-article waves ≤3 + coordinator commit (chọn — chống git-race,
  đúng team contract prompt).
- **Gates**: story-preflight skip (worktree sẵn, tree clean @c214dfa); browser
  Rule 0 3 tầng (iframe-probe dist — orca browser block localhost) trước merge;
  code-reviewer rolling 2 nhóm (T1-T5, T6-T10); security-audit 1 lần cuối SF
  (surface: frontmatter claims, links, evidence citation); verifier Phase 5;
  story-verify sf-3 trước Done.

## Tasks (12 — T0 tuần tự → T1-T10 waves ≤3 → T11 tổng)

- [ ] T0 probe + install: `pnpm install` (background) + `bash
      scripts/probe-repos.sh` 1 lần — capture exit code đúng (improvements-log:
      không đo `$?` sau pipe) → số stars/pushed/license ngày 2026-09-08 cho brief
      từng agent.
- [ ] T1 `deep-dive-openhands-openhands` EN+VI — matrix #13, pubDate 2026-10-07,
      harness, tags [agents, architecture, oss], docs agents-and-kit, cross-link
      zero-setup-agent-team. Angle: agent platform tự vận hành — event/runtime
      kiến trúc (OpenDevin → OpenHands).
- [ ] T2 `deep-dive-headroomlabs-ai-headroom` EN+VI — #14, 2026-10-07, mcp, tags
      [agents, memory, features], docs story-workflow, cross-link
      story-memory-learning-loop. Angle: context supply layer cho agent code.
- [ ] T3 `deep-dive-aaif-goose-goose` EN+VI — #15, 2026-10-08, harness, tags
      [agents, cli, workflow], docs getting-started, cross-link
      agentic-landscape-50-projects. Angle: local-first automation ngoài IDE.
- [ ] T4 `deep-dive-aider-ai-aider` EN+VI — #16, 2026-10-08, harness, tags
      [cli, git, agents], docs getting-started, cross-link one-branch-one-pr.
      Angle: git-native editing — mỗi thay đổi một commit + repo map.
- [ ] T5 `deep-dive-deusdata-codebase-memory-mcp` EN+VI — #17, 2026-10-09, mcp,
      tags [memory, agents, evidence], docs story-workflow, cross-link
      skill-story-workflow. Angle: trí nhớ dài hạn khi agent đọc code — so
      context packs/memory của Wakii.
- [ ] T6 `deep-dive-charmbracelet-crush` EN+VI — #18, 2026-10-09, harness, tags
      [terminal, cli, design], docs agents-and-kit, cross-link
      feature-terminal-splits. Angle: TUI-first agent UX (ecosystem Charm).
      ⚠ license NOASSERTION (ngoài scope pin): "công khai trên GitHub" — không
      "open-source"/"mã nguồn mở" (review-enforced).
- [ ] T7 `deep-dive-xai-org-grok-build` EN+VI — #19, 2026-10-10, harness, tags
      [agents, architecture, cli], docs agents-and-kit, cross-link
      agentic-landscape-50-projects. Angle: model-house harness pattern (so
      claude-code/gemini-cli) — strategic WATCH.
- [ ] T8 `deep-dive-microsoft-mcp-for-beginners` EN+VI — #20, 2026-10-10, mcp,
      tags [guide, agents, workflow], docs faq, cross-link skills-catalog-tour.
      Angle: curriculum chính thống = tín hiệu MCP mainstream.
- [ ] T9 `deep-dive-hangwin-mcp-chrome` EN+VI — #21, 2026-10-11, mcp, tags
      [features, agents, workflow], docs superpowers-panel, cross-link
      feature-computer-use-native. Angle: browser-in-the-loop — so browser
      native/design-mode của Wakii.
- [ ] T10 `deep-dive-modelcontextprotocol-registry` EN+VI — #22, 2026-10-11,
      mcp, tags [oss, architecture, license], docs agents-and-kit, cross-link
      oss-why-fork-mit. Angle: hạ tầng phân phối — naming/discovery/trust.
      ⚠ † scoped-FORBIDDEN machine: KHÔNG "open-source"/"mã nguồn mở" ở BẤT KỲ
      đâu trong file (kể cả title/description).
- [ ] T11 series-harness-mcp-consistency-pass — lint full · cross-link resolve
      grep · claims sentence-check vs registry §Third-party · digests 10/10 điền
      · adopt drafts đủ bài ADOPT (rubric §10) · `pnpm build` xanh · code-reviewer
      2 nhóm + re-review · security-audit · browser Rule 0 3 tầng (DOM listing ·
      screenshot · flow đọc→related→lang-switch EN↔VI) · merge đích
      ancestor-guard + audit comment merge-hash lên FI-386 · story-verify sf-3 ·
      verifier.

## Contract mỗi bài (tóm tắt — chi tiết brief từng agent)

- Band: VI 900-1400 (hard 1470), EN ≥800 — đếm prose bỏ fenced (D1 lint).
- Cấu trúc: hook → TL;DR (3-5 bullet) → 3-5 H2 (≥1 evidence block/section, nguồn
  + ngày) → `## Wakii học được gì` (grading ADOPT/DIRECTION/WATCH/N/A, mỗi grade
  ≥1 lý do trỏ evidence, cuối bài TRƯỚC CTA) → đoạn docs-link → CTA nhẹ.
- Frontmatter 6 field schema LOCKED; VI+EN cùng nghĩa, cùng ngày/category/tags;
  1 bài = 1 commit cặp VI+EN `feat(blog): <slug> EN+VI` (executor viết, coordinator
  commit — chống git-race).
- Claims third-party: MỌI số kèm "theo GitHub API ngày 2026-09-08"; quote nguyên
  văn ≤25 từ + attribution + link; trích code ngắn kèm link blob/<sha>;
  paraphrase license-safe. FORBIDDEN registry (lint case-insensitive, cả
  frontmatter).
- Links: docs đúng locale (`/docs/` | `/vi/docs/`, 5 DOC_SLUGS, không anchor);
  cross-link blog đúng locale (`/blog/` | `/vi/blog/`) CHỈ bài tồn tại.
- Angle: ≥2 H2 chưa bài nào cùng facet có — skeleton phân bổ trong brief
  (không trùng batch-1/2, không trùng nhau).

## ACCEPTANCE (từ context pack — verifier đối chiếu từng dòng)

1. 10 bài đọc được EN+VI đúng template (section grading rõ, evidence trích nguồn
   + ngày; tone/structure khớp style-guide — pilot SF-2 song song chưa merge,
   consistency cross-SF do SF-6 re-check).
2. ADOPT drafts đủ 10? — chỉ bài grade ADOPT cần draft (rubric SF-1 §10); pack
   ghi "ADOPT drafts đủ 10" hiểu là "draft cho MỌI grade ADOPT phát sinh" (grade
   ADOPT có kỷ luật — style-guide §8; nếu <10 bài ADOPT thì drafts <10 là đúng).
3. Lint green (partial-tolerant); cross-links ∈ matrix/existing; mobile 390
   no-overflow; story-verify sf-3 sạch trước Done.
