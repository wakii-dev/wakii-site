# UX funnel design hand-off — "Terminal Conveyor" (hướng A) — VU-9

USER-PICK-APPROVED 2026-09-20 (SF-1 USER GATE: owner chọn **A — isometric pipeline** qua coordinator; gate comment + 3 links đã đăng epic VU-9 `301ff758`). Source of truth visual: `docs/superpowers/prototypes/ux-funnel-vu9/a.html` (trong repo, commit `762f041`). Style authority: `src/styles/tokens.css` — **BIND TOKEN TỪ tokens.css THẬT, KHÔNG copy value từ prototype** (lesson FI-296; prototype đã bind đúng giá trị nhưng tokens.css là authority khi lệch).

> **SUPERSEDES**: hand-off này **SUPERSEDES `docs/superpowers/designs/sf-downloads-direction.md` (FI-300, "Bento Dispatch") CHO CÁC /download SURFACES** — tức `DownloadPage.astro`, `MobileConnect.astro`, và phần download của `GetWakii.astro` (gw-a/gw-b/gw-c data wiring). File FI-300 giữ giá trị lịch sử + as-built section của nó cho đến khi SF-3 rewire xong; SF-3 task `contract-amend` cập nhật 2 design-binding comments trong code (DownloadPage header + accuracy-gates list) trỏ sang hand-off này. Visual language chung (bento anatomy, buttons, chrome) KHÔNG đổi — cái supersede là STRUCTURE trang /download (primary-spine + version + first-run) và copy surface.

## Design language — "Terminal Conveyor" (roulette #16 · Terminal-Core Soft-Futurism, structure only; brand palette pinned)

1. **Mono-as-protagonist**: JetBrains Mono mang headlines/labels/commands; Inter chỉ body auxiliary (đúng phân bổ brand hiện có, đẩy mạnh hơn).
2. **Terminal-window foreground chrome**: các cell "command" dùng terminal panel thật (title bar + 3 traffic dots đỏ/hổ phách/mint bằng brand tokens + prompt `$` mint + string argument màu warn).
3. **Isometric-cube pipeline** (SIGNATURE của direction này): SVG 2.5D 4 khối `01 idea → 02 team ×9 → 03 gates b0–b5 → 04 1 pr`, 3 khối đầu brand-neutral (#1E2A26/#0D1310/#101614, stroke #2B4234), khối PR cuối fill mint #45E0A8. Dashed connectors, mũi tên cuối accent-dim.
4. **Numbered rails**: section opener dùng rail line (border-top + mono uppercase label trái, meta phải 2 dòng) — chỉ dùng 1 lần mỗi surface, không thay section-head pattern của các section khác.
5. **Hairline discipline**: bento giữ nguyên anatomy `.bx/.bx-in/.bx-label/.bx-body/.bx-foot`; label meta uppercase tracking; fname mono nhỏ dưới mỗi download button.

**Cấm**: generic SaaS, gradient slop, icon slop, fake app UI trong screenshot slots, GitHub-dark #0D1117 + neon xanh dương, glow ngoài hover lift.

---

## Surface 1 — Landing understand-layer (SF-2 implement)

### Insert position (BINDING)

Section mới chèn **ngay sau `<Hero/>`, trước `<Bento/>`** trong `src/components/Landing.astro`. Section order mới:

```
Hero → Understand (MỚI) → Bento → ZeroSetup → Workflow → Philosophy → GetWakii → Faq
```

Anchor `#get-wakii` không dời (G-F). Section mới id gợi ý `id="understand"` (không có nav trỏ — ngoài scope).

### Structure (4 câu D1 nằm trong copy)

| Khối | Nội dung | Keys (`landing.ts` → `understand.*`) |
|---|---|---|
| Q1 opener | qk mono `// q1 — what is wakii?` (prefix `//` accent) → h2 lớn (highlight em mint giữa câu) → lead (với `~/.claude` inline mono) | `q1Kicker`, `titleBefore/Highlight/After`, `leadBefore/leadCode/leadAfter` |
| Stats bar | 3 facts dạng rail ngang có border: **9 agents / 0 setup steps / 1 PR per story** | **REUSE `hero.stats`** — KHÔNG add keys mới |
| Q2 cell (sp7) | label `▸ q2 — open the app: what do you see first?` + meta `team = online`; body copy; **slot screenshot ⚡ superpowers panel** (slot-lg); foot amber-lead | `q2Label/q2Meta/q2Body/q2SlotName/q2SlotHint/q2Foot` |
| Q3 cell (sp5) | label `▸ q3 — who is wakii for?` + meta `delegate, don't drive`; body (bold em "one clean, verified PR"); **isometric SVG pipeline** (signature, static, aria-label); slot bracket canvas (slot-sm); foot | `q3Label/q3Meta/q3BodyBefore/Em/After/q3SlotName/q3SlotHint/q3Foot` |
| Q4 cell (sp12) | label `▸ q4 — what should i try first?` + meta `one command`; **2-col**: terminal panel (title `wakii — first run`, cmd `/superpowers "<your idea, one line>"` — string màu warn, comment line, output line) + copy phải (bold `/superpowers` inline + dim line + inline-link getting-started); foot | `q4Label/q4Meta/q4TermTitle/q4Cmd/q4Comment/q4Out/q4BodyBefore/BodyCmd/BodyAfter/q4Dim/q4Link/q4Foot` |
| **Đọc tiếp** (USER ADD-ON 2026-09-20 — owner yêu cầu bổ sung /docs + /blog vào funnel) | cuối cột copy phải của Q4, sau `q4Link`: 1 dòng mono nhỏ `moreLabel:` + 2 inline-links — `moreDocs` → `/docs/` (hướng dẫn sử dụng wakii), `moreBlog` → `/blog/` (công nghệ mới từ github). KHÔNG tạo page mới, KHÔNG đụng nội dung docs/blog (owner chốt scope "liên kết trong funnel") | `moreLabel/moreDocs/moreBlog` |

`bx-foot` convention giữ as-built FI-303: bold-lead amber khi key chứa separator ` — ` (split lần đầu).

### Screenshot slots (GAP SF-2 — fallback mockup KHÔNG label screenshot)

3 slots trên 2 surfaces, frame dashed + grid-bg 28px + caption `slot-name` (mint) + `slot-hint` (dim) + dòng `screenshot — placeholder frame`:

1. `⚡ superpowers panel` — "9 agents online · watchdog active · zero-setup state" (slot-lg, Q2)
2. `bracket canvas` — "every story leaves a readable bracket — open it in the story view" (slot-sm, Q3)
3. `main window` — ở /download, "what you'll see right after install — project open, team online" (slot-lg, right rail)

Ảnh thật (owner cấp): PNG ≥1600px ngang, dark theme app, full window không dữ liệu cá nhân, 16:10 khuyên dùng — mount vào đúng slot, giữ explicit width/height + lazy + ≤2 ảnh đầu section (D3).

### Motion & a11y

- Reveal: `data-reveal` trên từng cell ngoài (motion util có sẵn — KHÔNG script mới; re-verify FI-304 rule).
- Isometric SVG: `role="img"` + aria-label mô tả pipeline; static, không animate.
- Terminal: text thật trong DOM (không image); contrast giữ ≥4.5:1 body.
- Slots: khi trống vẫn có text caption (không rỗng trục trặc với screen reader).

---

## Surface 2 — /download restructure (SF-3 implement — SPINE task chạy đầu)

### Page head

- Kicker `## get-wakii` + h2 `Get Wakii.` + lead — keys MỚI `downloads.ts → upgrade.head.*` (title/lead/micro). **Keys cũ `page.h2/page.live.sub` KHÔNG sửa value** (tránh đổi look trước SF-3); SF-3 swap component sang keys mới và bỏ render keys cũ ở head.
- `dl-meta` phải-trên: **vpill** `v{RESOLVED} · latest` (dot mint glow) + `published {date}` + micro `free · open source · unsigned build` — version/date từ **resolution module (D5)**, KHÔNG hardcode.

### Grid layout (asymmetric, primary-spine)

| Cell | Span | Nội dung | Keys (`upgrade.*`) |
|---|---|---|---|
| **macOS — PRIMARY** | sp8 | label `▸ macos — primary download` + **chip OS-detect** trong meta; `btn-xl` mint `get wakii — apple silicon` + tag `recommended · most macs`; divider `or`; ghost block `mac with intel`; `fname` dưới mỗi nút; note "Not sure which chip? …"; foot warn unsigned Open Anyway | `primary.label/btnArm64/tagArm64/btnX64/or/note/foot` + `osChip` + `archYours` |
| **version** | sp4 (stack trên) | label `▸ version` + meta `latest`; `ver-big` `v{RESOLVED}` (30px mono bold) + `published {date}` + inline-link release notes; foot "tracks the latest release, not a pinned one" | `version.label/pillSuffix/publishedLabel/notesLink/foot` |
| **main window slot** | sp4 (stack dưới) | slot-lg screenshot (xem Surface 1 slots) | `mainWindowSlot.name/hint` |
| **windows** | sp4 | ghost block + fname `orca-windows-setup.exe` (giữ tên orca — accuracy) + orca-note; foot SmartScreen | `windows.label/btn/orcaNote/foot` + `osChip` |
| **linux** | sp4 | body "No packaged Linux binary yet…" + ghost `build from source` → REPO_URL; foot "no installer — source only (for now)" | `linux.label/meta/body/btn/foot` |
| **mobile** | sp4 (soon-cell dashed) | body honest "…No store links yet — this cell is the honest placeholder, not a teaser."; btn-soon `app stores — soon`; foot apk note | `mobile.label/meta/body/btn/apkFoot` — **notLive wording; MOBILE_LIVE=true → dùng keys `mobile.*` hiện có (store links), đúng pattern live/notLive tách key** |
| **first-run strip** | sp12 | label `▸ first run — three steps after install` + meta `→ /docs/getting-started/` (locale-aware khi render); 3 steps nối mũi tên: `01 open a project` → `02 kit auto-installs` → `03 describe your first idea`; ghost `read getting-started` → getting-started (không sửa docs); foot `~/.claude` | `firstRun.label/meta/steps[3].n/title/desc/cta/foot` |
| **nightly** (GIỮ — existing content) | sp12, đặt CUỐI trang sau first-run | giữ nguyên cell nightly hiện có (keys `desktop.nightly.*`) — power-user feature, không thuộc primary spine | keys cũ, không đổi |

### Behavior contracts (D5/D6 binding)

- **Version**: mọi version/date/URL download render từ RESOLVED data (build-time fetch + per-asset validation + fallback pin; artifact `release-meta.json`). Fallback pin cũng render pill + published (fetch-fail vẫn có version thật — pin). Asset thiếu → ẩn nút đó + honest soon; không bao giờ advertise 404.
- **OS-detect = PE highlight-only**: no-JS → chip `display:none`, CẢ HAI nút arch render đầy đủ. JS: macOS → `os-hit` border highlight card mac + chip on; Windows → card win + chip on; Linux/unknown → KHÔNG chip KHÔNG highlight. Arch refine: chỉ khi `navigator.userAgentData.getHighEntropyValues(['architecture'])` có sẵn và trả `x86` → đổi tag arm64 sang `archYours`; fail-silent, mặc định arm64. Không ẩn nút, không đổi thứ tự, không arch-detect ngoài API này (D6).
- **Chip cue non-color**: `aria-hidden` không cần — chip là text `→ for your machine`; card highlight PHẢI kèm chip (non-color cue enforce).
- **Motion**: `data-reveal` mỗi cell; initMotion() duy nhất (contract hiện tại giữ nguyên).
- **Responsive** (breakpoints REPO 980/720 — prototype dùng 680, quy về 720): @980 sp8/sp4-stack → full; sp4 → span 6; @720 tất cả full width, gap 12, steps stack dọc (arrow xoay 90°), dl-head stack. Verify @390 iframe probe.
- **Buttons**: `> ` prefix; primary mint (`btn-xl` chỉ cho arm64); ghost; soon dashed `◦ ` prefix — đúng tokens.css.

### GetWakii (landing, SF-3 consumers-rewire — KHÔNG redesign)

Cấu trúc gw-a/gw-b/gw-c giữ nguyên as-built FI-300 (kể cả `.bx-in` 14px radius landing). Chỉ đổi: (a) gw-a data + link sang resolution module (version-consistency AC8); (b) gw-b ghost **tiếp tục dùng `hero.ctaGhost`** ("read the guide") — KHÔNG đổi; hero ghost MỚI ("build from source") là việc SF-2 ở Hero.astro. G-I warn gw-a giữ keys `desktop.live.warnMacos/warnWindows` hiện có.

---

## Keys store — SF-1 pre-add (tên keys BINDING, components không hardcode)

### `landing.ts` — ADD group `understand` + hero ADD-thêm

- `hero.ctaDownload` (`download wakii` → /download), `hero.ctaBuild` (`build from source` → REPO_URL), `hero.ctaMicro` (`free · open source · unsigned build`) — **ADD MỚI; `hero.ctaPrimary` GIỮ NGUYÊN trong store** (sẽ orphan sau khi SF-2 retarget Hero — cleanup candidate sau SF-2, đã flag); **`hero.ctaGhost` GIỮ NGUYÊN** (consumer GetWakii:117 — cấm đụng).
- Group `understand`: keys đúng bảng Surface 1 (`q1Kicker, titleBefore, titleHighlight, titleAfter, leadBefore, leadCode, leadAfter, q2Label, q2Meta, q2Body, q2SlotName, q2SlotHint, q2Foot, q3Label, q3Meta, q3BodyBefore, q3BodyEm, q3BodyAfter, q3SlotName, q3SlotHint, q3Foot, q4Label, q4Meta, q4TermTitle, q4Cmd, q4Comment, q4Out, q4BodyBefore, q4BodyCmd, q4BodyAfter, q4Dim, q4Link, q4Foot, moreLabel, moreDocs, moreBlog` — 3 keys cuối = USER ADD-ON docs/blog links 2026-09-20; href = `/docs/` + `/blog/` locale-aware, SF-2 set).
- Interface + EN + VI đối xứng; VI draft (ACK tại Phase-1 checkpoint, im lặng → ship).

### `downloads.ts` — ADD group `upgrade`

`head.title/head.lead/head.micro` · `version.label/pillSuffix/publishedLabel/notesLink/foot` · `primary.label/btnArm64/tagArm64/btnX64/or/note/foot` · `windows.label/btn/orcaNote/foot` · `linux.label/meta/body/btn/foot` · `mobile.label/meta/body/btn/apkFoot` · `firstRun.label/meta/steps[3]{n,title,desc}/cta/foot` · `osChip` · `archYours` · `mainWindowSlot.name/mainWindowSlot.hint`.

KHÔNG sửa value keys hiện có; KHÔNG xóa keys hiện có ( kể cả `desktop.*` notLive wording). Ownership header downloads.ts cập nhật ghi rõ: sau SF-1, SF-2/SF-3 KHÔNG thêm keys — thiếu key loop về SF-1/coordinator (rule cũ giữ nguyên).

---

## Quickstart cleanup (decision: XÓA, không repurpose)

Designer KHÔNG repurpose quickstart (nội dung stale `git clone wakii && make` — getWakii đã thay vai trò). Xóa đối xứng 3 vị trí landing.ts: interface `:87`, EN `:274`, VI `:472` — grep consumer = 0 (verified 2026-09-20: chỉ 2 comment refs trong `src/pages/skills.astro:18` + `vi/skills.astro:15` dạng "same format as the landing quickstart" — comment-only, không phải consumer; stale sau xóa nhưng vô hại — SF-2/coordinator có thể dọn opportunistically, không blocking).

## Accuracy guards (copy phải giữ)

"story view" không "Stories tab" · zero-setup OK · không bịa version/size/checksum (version = resolved data) · `orca-windows-setup.exe` giữ tên orca có note · unsigned warn kèm MỌI download CTA · iOS/Android honest soon, không store link · microcopy CTA "free · open source · unsigned build" · credits footer nguyên.

## Out-of-scope (nhắc lại boundary)

Không code production components (SF-2/SF-3) · không đụng Hero.astro/DownloadPage.astro/Landing.astro/GetWakii.astro/MobileConnect.astro · không đụng config.ts · không analytics · không sửa docs/getting-started · không convert toàn bộ copy placeholder (D4).
