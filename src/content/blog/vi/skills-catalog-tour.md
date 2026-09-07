---
title: "Tour kỹ năng public của Wakii"
description: "Đi qua trang /skills/ và file skills.ts của chính site này: catalog kỹ năng public chia ba nhóm, mỗi card có command, mô tả và cách hoạt động — kèm transcript grep thật để bạn tự đếm lại số lúc đọc."
pubDate: "2026-09-07"
category: "tutorial"
tags: ["skills", "agents", "wakii"]
draft: false
---

Bài giới thiệu về "AI agent có kỹ năng" thường dừng ở chữ: kể tên vài skill,
chụp vài ảnh màn hình, hết. Wakii chọn hướng kiểm được hơn: toàn bộ kỹ năng
public của kit nằm trên một trang tĩnh [/skills/](/skills/), và nội dung trang
đó sinh thẳng từ một file dữ liệu duy nhất — `src/data/skills.ts` của chính
site này. Bài này đi qua catalog đó: skill thực chất là gì trong kiến trúc
agent, ba nhóm kỹ năng public gồm những gì, và cách tự đếm lại từng con số
bằng hai lệnh grep — vì một con số chỉ đáng tin khi bạn chạy lại được, đúng
lúc đang đọc.

TL;DR:

- Skill là tài liệu quy trình agent load on-demand — không nạp sẵn; mỗi skill
  là một file `SKILL.md`, agent đọc rồi làm theo.
- Trang `/skills/` là mặt public của kho đó, sinh thẳng từ
  `src/data/skills.ts`: một interface duy nhất, mỗi entry có command, desc và
  how song ngữ.
- Tại thời điểm viết (2026-09-07): 20 kỹ năng trong file dữ liệu, 13 public,
  chia ba nhóm — workflow(4), design(6), reference(3).
- 7 entry còn lại là máy nội bộ và kỹ năng platform: nằm trong file, cố ý
  không lên trang, để tổng số vẫn kiểm được.
- Cuối bài là transcript grep thật — quy tắc đọc-số-lúc-viết quan trọng hơn
  con số cụ thể.

## Skill là thứ agent load on-demand

Một skill không phải thư viện được nạp vào runtime khi app khởi động. Nó là
tài liệu quy trình: agent giữ danh mục tên skill, và khi tình huống cần đến —
"cần viết plan cho tính năng này" — nó mở đúng tài liệu đó ra đọc, rồi làm
theo. Load on-demand nghĩa đúng cái đó: chi phí context trả theo lần dùng,
không trả sẵn cho cả kho. Và vì bản chất là tài liệu nên skill kiểm được bằng
mắt thường: mở file, đọc.

File dữ liệu của trang `/skills/` khai báo nguồn của mình ngay ở dòng đầu:

```ts
/**
 * Skills catalog data — source of truth for /skills (SF-2).
 * Source: frontmatter of the 20 skills in the ~/.claude/skills folders
 * (SKILL.md, counted 2026-09-04). Pattern follows src/i18n/landing.ts: one interface,
 * skill names + commands stay English, desc/how carried in EN + VI.
 */
```

*Nguồn: src/data/skills.ts (header comment), lấy 2026-09-07.*

Đọc dòng chú thích: mỗi skill trong kit là một file `SKILL.md` trong
`~/.claude/skills`, và file dữ liệu này chỉ lấy frontmatter của chúng — trang
catalog không ai tóm tắt từ trí nhớ cả. Cấu trúc đó nằm gọn trong một
interface:

```ts
export interface Skill {
  id: string;
  name: string;
  /** slash-command form */
  command: string;
  category: SkillCategory;
  public: boolean;
  /** one-sentence description */
  desc_en: string;
  desc_vi: string;
  /** how it works, 2-3 sentences */
  how_en: string;
  how_vi: string;
}
```

*Nguồn: src/data/skills.ts, lấy 2026-09-07.*

Ba field cuối là ba thứ bạn đọc trên mỗi card của `/skills/`: command dạng
slash (`/story-workflow`), làm gì (desc, một câu), hoạt động thế nào (how,
2-3 câu) — tất cả song ngữ. Còn field `public` là chốt cửa giữa file dữ liệu
và trang — mục sau.

## Ba nhóm, mười ba kỹ năng

Trang `/skills/` không hiển thị cả 20 entry — chỉ lấy phần public, và lựa
chọn đó viết thành comment ngay đầu file trang:

```js
 * Data: src/data/skills.ts (READ-ONLY) — filter public === true → 13 skills,
 * grouped workflow(4) → design(6) → reference(3).
```

*Nguồn: src/pages/skills.astro (header comment), lấy 2026-09-07.*

Phía file dữ liệu, tiêu chí public được định nghĩa từ trước, kèm lý do phần
còn lại vẫn ở trong file:

```ts
 * Triage (SF-1, pending PM confirm — gate for SF-2 START):
 * `public: true` = catalog-worthy; false = platform-specific (Orca app
 * control) or internal (agent-facing machinery), excluded from /skills.
 * Data module still carries all 20 so the count stays verifiable.
```

*Nguồn: src/data/skills.ts (header comment), lấy 2026-09-07.*

Bảng ba nhóm public, liệt kê đủ 13 tên — tại thời điểm viết:

| Nhóm | Số public | Kỹ năng |
|---|---|---|
| workflow | 4 | story-workflow · brainstorm · writing-plans-linear · orca-superpowers-workflow |
| design | 6 | frontend-design · gpt-taste · design-taste-frontend · image-to-code · mock-prototype · web-design-guidelines |
| reference | 3 | figma-orientation · graph-engineering · prompt-master |

*Nguồn: bảng dựng từ src/data/skills.ts, lấy 2026-09-07.*

Con số 13 không phải do ai đếm card bằng mắt — nó là giá trị biến
`publicCount` trang tự tính từ filter, và hero in thẳng ra:

```astro
<h1>The kit, cell by cell.<br /><span class="hl">{publicCount} skills</span>, fully explained</h1>
```

*Nguồn: src/pages/skills.astro (dòng h1), lấy 2026-09-07.*

Tại thời điểm viết, dòng này render thành "13 skills, fully explained". Kit
lớn thêm skill thì con số trên trang tự đi theo file dữ liệu — không ai phải
sửa chữ.

Đi qua từng nhóm bằng một đại diện. Nhóm workflow — `story-workflow`: chạy
tính năng lớn dưới dạng story — một issue epic, mỗi slice là một sub-feature
workflow, cấu trúc theo tier bracket dọc. Cùng nhóm: `brainstorm` biến ý
tưởng thô thành spec đã kiểm chứng và kế hoạch triển khai trước khi có code;
`writing-plans-linear` viết kế hoạch đủ chi tiết cho engineer không có ngữ
cảnh rồi đăng lên Linear; `orca-superpowers-workflow` gói cả pipeline
đầu-cuối thành một luồng.

Nhóm design — `mock-prototype`: dựng prototype thành 3 hướng thiết kế HTML,
đăng thành link để bạn mở và chọn, không đụng code production. Năm skill còn
lại chia nhau vòng đời UI: `frontend-design` định hình UI có chủ đích;
`gpt-taste` phá thiên kiến thống kê của design do AI sinh ra; `image-to-code`
biến ảnh tham chiếu thành component thật; `design-taste-frontend` là lượt
audit-first trước khi ship; `web-design-guidelines` soi code qua 105 quy tắc
giao diện web cụ thể.

Nhóm reference — `prompt-master`: biến ý tưởng prompt thô thành một prompt
production-ready, tối ưu cho đúng công cụ AI bạn nêu tên; `graph-engineering`
dạy graph engineering kèm ví dụ từng bước; `figma-orientation` đưa ý định của
bạn tới đúng skill Figma chính thức hoặc lệnh MCP, trước khi bạn chọn sai.

Phần không lên trang gồm đúng 7 entry, tại thời điểm viết, hai lớp: máy nội
bộ của workflow (`post-task-ritual`, `execute-plan`) và kỹ năng platform điều
khiển app Orca (`bridge-router`, `orca-cli`, `orca-bridge`, `orchestration`,
`computer-use`). Đáng để ý: chúng không bị xoá khỏi file — 20 entry vẫn nằm
nguyên, đúng như dòng "Data module still carries all 20 so the count stays
verifiable" trích ở trên. Ẩn khỏi trang là quyết định trình bày; mất khỏi
file là mất định nghĩa.

## Đọc số liệu lúc viết, đừng nhớ

Con số trong bài kiểu này có hạn dùng. Kit đang lớn: thêm một skill là thêm
một entry, và cả "20" lẫn "13" đều đổi theo. File dữ liệu còn tự ghi ngày
đếm — "counted 2026-09-04" ngay ở header. Vì thế quy tắc mà story nội dung
này tự áp, và bài này khuyên bạn áp cho bài của mình, là: số liệu chạy lại
tại thời điểm viết, không trích ghi chú cũ; con số lên bài phải kèm nguồn và
ngày.

Đây là hai lệnh đếm, chạy thật trên máy lúc viết bài này:

```bash
$ grep -c "id: '" src/data/skills.ts
20
$ grep -A6 "id: '" src/data/skills.ts | grep -c "public: true"
13
```

*Nguồn: grep trên src/data/skills.ts, lấy 2026-09-07.*

Đọc transcript: lệnh đầu đếm dòng `id: '` — đúng một dòng mỗi entry — cho 20.
Lệnh hai lấy 6 dòng sau mỗi dòng `id`, đủ chạm tới dòng `public` của entry vì
giữa chúng chỉ còn `name`, `command`, `category` — rồi đếm entry mang
`public: true`, cho 13. Phép trừ 20 − 13 = 7 khớp đúng hai lớp ngoài trang ở
mục trước. Nếu bạn đọc bài này vào một ngày khác, đừng tin cả số của mình:
chạy lại hai lệnh đó. Điều được pin ở đây là quy tắc đọc-số-lúc-viết, không
phải con số cụ thể — kit tăng, số tăng, quy tắc đứng yên.

## Tự tay xem

Ba đường, tuỳ bạn muốn sâu đến đâu:

```ascii
đường               ở đâu                                  thấy gì
──────────────────────────────────────────────────────────────────────
trang public        wakii.xyz/skills/                      13 card theo 3 nhóm, hero tự đếm
kit (MIT)           github.com/wakii-dev/wakii             mỗi skill là một SKILL.md
file dữ liệu site   src/data/skills.ts (repo site public)  grep như mục trên
```

*Nguồn: tổng hợp từ src/pages/skills.astro + src/config.ts (REPO_URL,
SITE_URL), lấy 2026-09-07.*

Trang `/skills/` tự nói tinh thần đó: "No black boxes: git clone the source,
run make, and read along" (trích src/pages/skills.astro, lấy 2026-09-07).
Kit nằm ở repo public MIT `github.com/wakii-dev/wakii`; `skills.ts` nằm trong
repo của site này, cũng public — cả hai đọc được nguyên văn.

Trong app, catalog nối vào chỗ hoạt động thật: panel Superpowers — icon ⚡ ở
activity bar bên phải — là nơi khởi chạy đội agent, và kỹ năng trong bài là
thứ agent load lúc chạy. Trang [Superpowers panel](/vi/docs/superpowers-panel/)
mô tả panel đó: hai tab ⚡ Workflow và 🌳 Story. Muốn cả kit trên máy, bài
[đội agent đầu tiên của bạn không có bước cài đặt](/vi/blog/zero-setup-agent-team/)
kể phần còn lại: kit tự cài vào `~/.claude/` — đúng thư mục `skills` mà file
dữ liệu lấy frontmatter.

Wakii là IDE agentic với đội superpowers dựng sẵn. Catalog kỹ năng được dựng
công khai vì một lý do đơn giản: trước khi để agent chạy theo một quy trình,
bạn nên đọc được quy trình đó nguyên văn. Trang `/skills/`, file `skills.ts`
và hai lệnh grep ở trên cho bạn đủ ba tầng đó — xem, đếm, tự chạy lại.
