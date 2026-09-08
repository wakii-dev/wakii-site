# Plan — FI-373 SF-4: Series Guides — 10 bài tutorial (FI-377)

> Spec slice: `docs/superpowers/contexts/fi373-sf-4.md` · Matrix: `docs/superpowers/editorial/2026-blog-longform/topic-matrix-batch2.md` rows #22-31 · Style: `style-guide.md` + `runbook.md` (8 bước/bài) · Claims: `claims-registry.md`.
> Worktree: `sf-4-blog-guides` @ `wakii-dev/sf-4-blog-guides` (base = story/fi373-blog-batch2 @ 422e86f — verified con trực tiếp).

## Ràng buộc chung (mọi task)

- 1 task = 1 commit = 1 cặp VI+EN. Message: `feat(blog): <slug> EN+VI (T<n> — matrix #<row>)`.
- VI 900-1400 từ prose (bỏ fenced; >1470 FAIL) · EN ≥800 mirror cùng cấu trúc.
- Frontmatter 6 field LOCKED; `category: "tutorial"`; pubDate CỨNG theo matrix; tags từ vocab (matrix đã đề xuất sẵn).
- Docs-link ≥1/bài đúng locale + đúng slug matrix chỉ định (link vào TRANG, không #anchor). Cross-link blog ≥1/bài CHỈ trỏ bài đã tồn tại trên nhánh (seed / batch-1 / guide đã commit TRƯỚC trong SF này). KHÔNG link bài SF-2/3/5 (chưa merge).
- Claims: CHỈ theo claims-registry; số kèm "tại thời điểm viết" + ngày. Mobile: CHỈ 5 nhãn ALLOWED. Cấm literal: "stories tab", "pairing persist", "mọi state", "every state", "worktree(s) từ phone", "worktree(s) from your phone".
- Transcript nhúng trong bài: sanitize `/Users/hoivu` → `~`, rút gọn có ghi chú "(rút gọn)". KHÔNG bịa output.
- Sau mỗi commit: `node scripts/check-blog-content.mjs` exit 0. Build full chain 3 lần (sau wave 1/2/3), không mỗi bài.
- Dry-run: mỗi guide ≥1 lệnh chạy thật kèm transcript — nguồn trong §Transcripts bên dưới; executor được phép chạy thêm lệnh read-only (`orca status`, `orca worktree list`, `gh release list --repo wakii-dev/wakii`, `orca skills list|installed`, `orca host list`, `orca environment list`, `orca linear issue <id> --json`) và nhúng kết quả đã sanitize.

## Nguồn cross-check lệnh (READ-ONLY)

- Site docs: `src/content/docs/en|vi/*.md` (5 DOC_SLUGS — KHÔNG sửa).
- CLI thật: `orca --help`, `orca agent-context` (234 commands, schema v1 — ground truth flag).
- Product docs công khai (repo `wakii-dev/wakii`, tải 2026-09-08 vào `/tmp/wakii-product-docs/`): `install.mdx`, `ssh.mdx`, `remote-servers.mdx`, `mobile.mdx`, `android-apk.mdx`, `troubleshooting.mdx`, `ways-to-run.mdx`, `first-session.mdx`, `recipes/remote-worktrees.mdx`, `recipes/parallel-agents.mdx`, `review/linear.mdx`, `review/github.mdx`, `cli/skills.mdx`, `model/worktrees.mdx`, `model/tabs-panes-splits.mdx`. Lưu ý: các trang này mang branding "Orca" (kế thừa upstream) — guide viết cho Wakii chỉ TRÍCH cơ chế, KHÔNG copy link stablyai/orca/App Store vào bài.

## Tasks

### T1 — guide-post-install-update (matrix #22, pubDate 2026-09-19)
- Docs-link: `/docs/getting-started/` (VI `/vi/docs/getting-started/`). Tags: `["guide", "release", "wakii"]`.
- Góc: từ máy trống tới app chạy + BIẾT bản mình đang chạy (không trùng `zero-setup-agent-team` — bài đó nói cơ chế kit tự cài; bài này là các bước cài/update cụ thể).
- H2 khung: Kiểm tra trước khi cài (node/pnpm/git) · Cài bản dựng sẵn (DMG/EXE version-named v1.4.199 — asset theo phiên bản, link /download/) · Lần chạy đầu (kit tự cài `~/.claude/`, idempotent — claim ALLOWED zero-setup) · Xây từ nguồn (clone → pnpm install → pnpm dev|build+start) · Theo dõi bản mới (GitHub Releases wakii-dev/wakii; releases 09-05: v1.4.199 Latest + v1.4.198 cùng ngày — evidence-pack dòng 2; KHÔNG nhắc v1.4.197) · Troubleshooting ngắn (asset name theo version, trang download vs releases).
- Evidence: transcript §A.1 + §A.2; quote release list kèm "lấy 2026-09-08".
- Cross-link gợi ý: `zero-setup-agent-team` (batch-1), `building-wakii-in-the-open-log-1` (seed).

### T2 — guide-post-first-story-end-to-end (matrix #23, pubDate 2026-09-20, FLAGSHIP hero)
- Docs-link: `/docs/story-workflow/`. Tags: `["guide", "story-workflow", "workflow"]`.
- Góc: walkthrough TAY ĐẦU TIÊN theo pipeline docs (idea → impact → plan → epic+SF → parallel → gates → 1 PR) — khác seed `story-workflow-idea-to-release` (kể chuyện case FI-289) và khác `nine-agents` (giới thiệu đội): bài này là các BƯỚC bấm gì/gõ gì.
- H2 khung: Chuẩn bị 5 phút (app chạy, repo đã add, agent CLI có sẵn) · Bước 1 — nêu ý tưởng (⚡ Workflow tab: intent/modes/start) · Bước 2 — impact + plan lên Linear · Bước 3 — bracket + SF chạy song song (🌳 Story tab canvas) · Bước 4 — gates B0-B5 + watchdog (bạn duyệt gate, agent không tự duyệt) · Bước 5 — merge đích + 1 PR · Kết quả mong đợi.
- Evidence: ASCII pipeline diagram (từ docs story-workflow); transcript §A.3 (`ls ~/.claude/bin | grep story-` rút gọn — 24 CLIs, snapshot 2026-09-08); gates B0-B5 bảng từ docs superpowers-panel (quote).
- Cross-link gợi ý: `story-workflow-idea-to-release` (seed), `linear-as-external-memory` (batch-1).

### T3 — guide-post-mobile-pairing (matrix #24, pubDate 2026-09-20)
- Docs-link: `/docs/getting-started/`. Tags: `["guide", "mobile"]`.
- ⚠ CLAIMS: CHỈ 5 nhãn ALLOWED (QR pairing từ desktop · story view: SF tiers + progress từng SF · gates: choice + free-text + confirm trước khi gửi · notification open/closed · guard codes). KHÔNG: persist/sync claims, "mở worktree từ phone", iOS App Store (site chưa có link iOS — nói "chưa", đừng giải thích thêm).
- H2 khung: Bạn cần gì (desktop chạy + Android phone) · Cài app (APK sideload từ GitHub release `mobile-android-v0.0.48` 09-05 — transcript §A.4; KHÔNG claim store) · Ghép đôi bằng QR (desktop hiện QR, phone quét — 1 lần, desktop là nguồn truth) · Dùng được gì ngay (đúng 5 năng lực trên, viết thành cảnh thực) · Khi pairing rớt (cùng account, code hết hạn → tạo mới, desktop offline → phone mất nối tạm thời).
- Evidence: transcript §A.4; quote release pre-release Android 09-05.
- Cross-link gợi ý: `review-ai-agents-from-your-phone` (seed), `decision-gates-safe-ai-agents` (seed).

### T4 — guide-post-ssh-remote (matrix #25, pubDate 2026-09-21)
- Docs-link: `/docs/getting-started/`. Tags: `["guide", "cli", "worktree"]`.
- Claim đượt: SSH worktrees ĐÃ SHIP (nhãn SHIPPED — v1.4.198 notes "GitHub & Linear native, SSH worktrees, mobile companion", evidence registry dòng feature-ssh-worktrees).
- H2 khung: SSH target giải quyết gì (laptop giữ runtime, máy khỏe chạy việc) · Thêm host (Settings → SSH → Add Target: host/user/port/identity, OpenSSH config picker, Test → Save) · Tạo worktree trên host (chọn SSH target thay Local; git worktree add trên máy xa; agent chạy remote) · Trải nghiệm vẫn "local" thế nào (sync file events, chip trạng thái xanh/vàng/đỏ, disconnect không giết agent — reconnect + lease session) · Forward port (tab Ports `Cmd+Shift+I`, detected ports, remapprivileged) · Máy xa thiếu toolchain (node-pty cần make/g++/python3 — lệnh apt/dnf/apk/pacman) .
- Evidence: transcript §A.5 (`orca host list` — local); trích v1.4.198 release notes kèm nguồn+ngày.
- Cross-link gợi ý: `parallel-worktrees-isolation` (batch-1), `watchdog-idle-is-not-dead` (batch-1).

### T5 — guide-post-custom-skill-101 (matrix #26, pubDate 2026-09-21)
- Docs-link: `/docs/agents-and-kit/`. Tags: `["guide", "skills"]`.
- Số liệu: kit **20 skills tổng / 13 public** tại thời điểm viết (snapshot 2026-09-08 — KHÔNG dùng 21/14).
- H2 khung: Skill là gì (thư mục + `SKILL.md`: frontmatter `name`/`description` + thân Markdown; description = KHI NÀO dùng) · Đặt ở đâu để được nhận (`~/.claude/skills/<tên>/`; UI quét các skill home) · Viết skill đầu tiên (tạo thư mục, viết frontmatter + thân, ví dụ nhỏ) · Thử ngay (`orca skills installed`; gọi skill trong agent; sửa → chạy lại) · Chia sẻ cho máy khác (`orca skills share` — link unlisted, revoke được; treat link like a credential) · Troubleshooting (skill không hiện: sai vị trí/frontmatter; đổi tên thư mục ≠ name).
- Evidence: transcript §A.6 (`orca skills list` rút gọn — platform skills; `orca skills installed` rút gọn); liệt kê file SKILL.md thật trong `~/.claude/skills` (chỉ TÊN, không path tuyệt đối).
- Cross-link gợi ý: `skills-catalog-tour` (batch-1), `zero-setup-agent-team` (batch-1).

### T6 — guide-post-cloud-relay (matrix #27, pubDate 2026-09-22)
- Docs-link: `/docs/faq/`. Tags: `["guide", "architecture"]`.
- Góc: HOW-TO điều phối qua relay cloud; KHÔNG đụng góc kiến trúc sâu của SF-5 (`arch-relay-cloud` — chưa tồn tại, đừng link).
- H2 khung: Ba cách đặt agent lên máy khác (SSH target / Remote Orca Server / `orca serve` — khi nào chọn cái nào, bảng ngắn từ ways-to-run) · Ghép đôi qua relay (Settings → Remote Orca Servers → New Link → Generate Access Link; client Add Server paste link; token RIÊNG mỗi client, revoke được — Shared Server Access) · Server headless bằng CLI (`orca serve --pairing-address <ip> [--port 6768] [--mobile-pairing]` — in pairing URL; CLI Linux = `orca-ide`) · Dùng CLI từ xa cho agent (`orca --environment <tên|id>` / `ORCA_PAIRING_CODE` / `ORCA_ENVIRONMENT` — từ `orca --help` Behavior; `orca environment add|list|show|rm`) · An toàn (access link = mật khẩu; mạng riêng/Tailscale; không expose port công khai).
- Evidence: transcript §A.7 (`orca environment list` — máy sạch: "No saved environments."); quote flag `--pairing-address` từ `orca --help`/docs.
- Cross-link gợi ý: `watchdog-idle-is-not-dead` (batch-1), `guide-ssh-remote` (đã commit T4 — cùng SF).

### T7 — guide-post-worktree-workflow (matrix #28, pubDate 2026-09-22)
- Docs-link: `/docs/story-workflow/`. Tags: `["guide", "worktree", "git"]`.
- Góc: vòng đời THỰC CHIẾN 1 worktree trong dự án thật — khác `parallel-worktrees-isolation` (bài đó chứng minh CƠ CHẾ parallelism an toàn); bài này là thao tác ngày thường.
- H2 khung: Vòng đời 5 bước (create → work → review → ship → archive; create chạy nền, có progress) · Chọn start-from (base ref / branch khác / SHA / remote branch) · Chia sẻ thứ nặng qua các worktree (Shared Paths per repo; `orca.yaml` `worktree.sharedDirectories` — symlink; `.worktreeinclude` — copy file gitignored như `.env`) · Phím tắt CLI (`orca worktree list|current|create|set|rm|ps` — bảng lệnh thường dùng) · Git thuần vẫn sống (`git worktree add` ngoài Orca → hidden worktrees card → Show; `git worktree remove` CLI → Orca dọn state) · Dọn nhà (Resource Manager → Clean up; branch giữ lại khi chưa merge — Review N Branches).
- Evidence: transcript §A.8 (`git worktree list` + `orca worktree current` đã sanitize); YAML + text ví dụ từ docs worktrees (quote đúng).
- Cross-link gợi ý: `parallel-worktrees-isolation` (batch-1), `long-tasks-bracket-tiers` (batch-1).

### T8 — guide-post-linear-github-wiring (matrix #29, pubDate 2026-09-23)
- Docs-link: `/docs/story-workflow/`. Tags: `["guide", "linear", "workflow"]`.
- H2 khung: Nối GitHub (Settings → Integrations; review/checks/Actions inline) · Nối Linear (Settings → Integrations → Linear: API token từ linear.app/settings/api, chọn team) · Từ issue sang worktree (composer pre-fill tên + gắn issue ID; Linear cho branch name → dùng luôn; Edit Worktree Details → field Issue đổi/clear link) · Status sync là opt-in (team bật mới tự chuyển In Progress) · Cho agent: `orca linear` (`orca linear issue --current --full --json`, attach PR URL, skill orca-linear) · Troubleshooting (token hết hạn/scopes, rate limit GitHub — `gh auth status`, `gh api rate_limit`).
- Evidence: transcript §A.9 (`orca linear issue FI-377 --json` rút gọn — identifier/title/state); quote flow từ docs review/linear.
- Cross-link gợi ý: `linear-as-external-memory` (batch-1), `one-branch-one-pr` (batch-1).

### T9 — guide-post-multi-session-ports (matrix #30, pubDate 2026-09-23)
- Docs-link: `/docs/getting-started/`. Tags: `["guide", "cli"]`.
- H2 khung: Một session = một worktree (mỗi agent một thư mục, không giành file) · Xem nhiều agent cùng lúc (kéo tab vào mép pane để split; split lồng nhau; layout per worktree, boundary giữ nguyên) · Mỗi worktree một port dev (dev server tự chọn port kế tiếp khi bị chiếm — bạn luôn mở ĐÚNG port của worktree đó; forward port máy xa ở tab Ports) · CLI điều khiển session (`orca terminal list|create|split|switch|close`; `orca worktree ps` xem tổng quan live) · Dọn session (close tab/terminal; worktree không dùng nên đóng — mỗi worktree giữ file watcher) .
- Evidence: transcript §A.10 (`orca worktree ps` rút gọn cấu trúc: tên nhánh + host + live:N); terminal split flag từ `orca --help`.
- Cross-link gợi ý: `parallel-worktrees-isolation` (batch-1), `guide-worktree-workflow` (T7 đã commit).

### T10 — guide-post-troubleshooting (matrix #31, pubDate 2026-09-24)
- Docs-link: `/docs/faq/`. Tags: `["guide", "wakii"]`.
- H2 khung: Nguyên tắc chẩn đoán (3 lớp: `orca status` → lệnh thủ công trong terminal → logs; "agent nói xong" ≠ chạy được) · Agent không start (chạy CLI thủ công trong terminal; PATH theo Settings → Agents; chip Restart) · Tạo worktree lỗi (`git fetch origin`; trùng branch/thư mục) · CLI "command not found" (đăng ký shim Settings → General → Orca CLI; `~/.local/bin` trên PATH) · SSH nối được nhưng terminal chết (toolchain Linux — cài rồi KẾT NỐI LẠI) · Browser báo no tab (`orca tab create --url ...`) · GitHub rate limit (`gh auth status -h github.com`, `gh api rate_limit`) · Mở logs + hỗ trợ (Help → Open Logs; attach khi report).
- Evidence: transcript §A.11 (`orca status` thật); bảng quick-check `gh` từ docs troubleshooting (quote).
- Cross-link gợi ý: `guide-install-update` (T1 đã commit), `watchdog-idle-is-not-dead` (batch-1).

### T11 — hero-render-flagship-first-story (matrix #23 hero yes)
- Điều kiện: T2 đã commit. Thêm `heroImage: "/blog/heroes/guide-first-story-end-to-end.png"` vào frontmatter **EN** của `guide-first-story-end-to-end.md` (VI KHÔNG khai — share hero EN) trong cùng commit nhỏ `chore(blog): hero wiring guide-first-story (T11)`.
- Chạy `node scripts/render-blog-heroes.mjs` → sinh `public/blog/heroes/guide-first-story-end-to-end.{svg,png}` 1200×630 (script tự assert). Verify thêm: `node scripts/render-blog-heroes.mjs --check`. Commit PNG+SVG CÙNG wiring (hero thuộc bài).

### T12 — series-guides-consistency-pass
- (1) `node scripts/check-blog-content.mjs` exit 0, không outside-matrix mới, không warning >1400 treo. (2) Cross-link sweep: mọi link blog/docs trong 20 file chỉ trỏ slug đã tồn tại trên nhánh, đúng locale (grep-local). (3) Claims sweep: mỗi số trong 10 bài truy được registry/evidence-pack (kèm ngày). (4) `pnpm build` full chain xanh (parity → blog-utils → blog-content → astro). (5) Checklist tone/structure reviewer (hook/TL;DR/H2 evidence/docs paragraph/CTA đủ cả 10 bài × 2 locale). Báo cáo kết quả vào PR description/audit comment.

## Sau T12 (coordinator thực hiện, không phải executor)

1. Rule 0 browser verify 3 tầng (DOM/visual/flow trên `astro preview` — listing 10 guide cards badge tutorial + date + reading-time; mở 1 bài EN ↔ VI lang-switch; mobile 390 no-overflow qua iframe probe).
2. code-reviewer độc lập theo 2 nhóm (T1-T5, T6-T12) → CHANGES-REQUESTED → fix → re-review APPROVED.
3. security-audit: frontmatter claims + links + transcript (path-leak, secret, claim vượt nhãn).
4. verifier: PASS từng dòng ACCEPTANCE context pack.
5. Merge `--no-ff` vào `story/fi373-blog-batch2` (temp worktree ATTACH branch — KHÔNG --detach; conflict `improvements-log.md` giữ CẢ HAI); CAS guard trước push; audit comment kèm merge hash lên FI-377.
6. `~/.claude/bin/story-verify sf-4` sạch → FI-377 Done.

## Transcripts dry-run thật (chụp 2026-09-08, máy làm việc của SF-4; path đã ~-hoá)

### A.1 node/pnpm (T1)
```
$ node --version
v24.10.0
$ pnpm --version
10.19.0
```

### A.2 releases (T1, T3)
```
$ gh release list --repo wakii-dev/wakii --limit 5
Wakii 1.4.199	Latest	v1.4.199	2026-09-05T19:07:31Z
Wakii 1.4.198		v1.4.198	2026-09-05T12:47:15Z
Orca Mobile Android mobile-android-v0.0.48	Pre-release	mobile-android-v0.0.48	2026-09-05T13:00:31Z
```

### A.3 kit CLIs (T2) — đếm chuẩn tại thời điểm viết: 24 story-* (snapshot 2026-09-08)
```
$ ls ~/.claude/bin | grep '^story-' | head -8
story-attempt
story-branch-sync
story-browser-test
story-diff-review
story-preflight
story-ritual
story-snapshot-env
story-verify
```

### A.4 Android APK (T3)
```
$ gh release view mobile-android-v0.0.48 --repo wakii-dev/wakii --json name,isPrerelease,publishedAt
{
  "name": "Orca Mobile Android",
  "isPrerelease": true,
  "publishedAt": "2026-09-05T13:00:31Z"
}
```
(assets chứa `app-release.apk` — sideload qua GitHub Releases.)

### A.5 hosts (T4)
```
$ orca host list
local       this machine  ->  --host local
```

### A.6 skills (T5)
```
$ orca skills list            # platform skills đi kèm CLI (rút gọn)
computer-use …
orca-cli …
orca-linear …
orca-emulator-android …
orchestration …
$ orca skills installed       # skills đã cài trên máy (rút gọn)
brainstorm (943fa2a3004dab96)   Claude home
bridge-router (3e4ef046fcbc33a4) Claude home
```

### A.7 environments (T6)
```
$ orca environment list
No saved environments.
```

### A.8 worktrees (T7)
```
$ git worktree list
~/Desktop/projects/wakii-site                   3eabe17 [main]
~/orca/workspaces/wakii-site/sf-4-blog-guides   422e86f [wakii-dev/sf-4-blog-guides]
(rút gọn — còn 3 worktree SF khác cùng repo)
$ orca worktree current
sf-4-blog-guides → ~/orca/workspaces/wakii-site/sf-4-blog-guides
```

### A.9 Linear (T8)
```
$ orca linear issue FI-377 --json | python3 -c "import sys,json; i=json.load(sys.stdin)['result']['issue']; print(i['identifier'], '|', i['title'], '|', i['state']['name'])"
FI-377 | SF-4: Series Guides — 10 bài tutorial | In Progress
```

### A.10 worktree ps (T9) — chỉ lấy cấu trúc, cắt preview
```
$ orca worktree ps --limit 3          # (rút gọn: bỏ cột preview)
wakii-site refs/heads/wakii-dev/sf-4-blog-guides  host=local  live:1  pty:yes
~/orca/workspaces/wakii-site/sf-4-blog-guides
```

### A.11 status (T10)
```
$ orca status
appRunning: true
runtimeState: ready
runtimeReachable: true
runtimeConnectionState: connected
graphState: ready
(rút gọn — bỏ pid/runtimeId)
```

## Checklist hoàn tất SF (tick khi xong)

- [x] T1 guide-install-update (matrix #22)
- [x] T2 guide-first-story-end-to-end (matrix #23, flagship)
- [x] T3 guide-mobile-pairing (matrix #24)
- [x] T4 guide-ssh-remote (matrix #25)
- [x] T5 guide-custom-skill-101 (matrix #26)
- [x] T6 guide-cloud-relay (matrix #27)
- [x] T7 guide-worktree-workflow (matrix #28)
- [x] T8 guide-linear-github-wiring (matrix #29)
- [x] T9 guide-multi-session-ports (matrix #30)
- [x] T10 guide-troubleshooting (matrix #31)
- [x] T11 hero render flagship
- [x] T12 consistency pass (lint + links + claims + build + tone checklist)
- [x] Rule 0 browser 3 tầng PASS
- [x] code-reviewer APPROVED (2 nhóm)
- [x] security-audit sạch
- [x] verifier PASS từng dòng ACCEPTANCE
- [ ] merge đích + audit comment FI-377
- story-verify sf-4: gate chạy SAU merge — verdict ghi trong audit comment (gate action, không phải task plan).
- FI-377 Done: set sau khi story-verify xanh (Linear state change, không phải task plan).
