---
title: "MetaGPT: công ty phần mềm mô phỏng bằng agent theo SOP"
description: "MetaGPT thay hội thoại tự do giữa các agent bằng SOP đóng gói: vai nào cũng trao đổi qua artifact có cấu trúc — PRD, thiết kế API, task, test — với schema là code thật. Bên trong khung 70.263 stars đã chậm lại là bài học về hợp đồng artifact cho quy trình đa agent."
pubDate: "2026-10-13"
category: "tech"
tags: ["agents", "workflow"]
draft: false
---

Đa agent dễ sa vào một hình thức: một phòng chat, nhiều AI, câu hỏi qua lại liên miên, và không ai chỉ ra được đâu là sản phẩm cuối. MetaGPT — dự án 70.263 stars, license MIT (theo GitHub API ngày 2026-09-08) — đi lối khác: mô phỏng một công ty phần mềm với đầy đủ product manager, architect, project manager, engineer và QA. Điều đáng học là hội thoại trong công ty đó gần như bị cấm: mỗi vai chỉ trao đổi với vai kia qua artifact có cấu trúc, đóng vai trò hợp đồng giữa các bộ phận. Cách chuẩn hoá handoff này còn giá trị cả khi dự án gốc đã chậm lại.

TL;DR:

- Triết lý MetaGPT gói trong một công thức từ README: `Code = SOP(Team)` — quy trình công ty được hiện thực hoá thành SOP, không phải nhét vào prompt của từng agent.
- Mỗi vai xuất đúng một loại artifact: PRD, thiết kế API, danh sách task, code, test — handoff đi qua document, không qua chat tự do.
- Schema của artifact là code thật: ActionNode khai từng trường của PRD với tên, kiểu dữ liệu, instruction và ví dụ.
- Vai nhận việc bằng subscribe: Engineer theo dõi message kiểu task mà không cần biết ai viết ra nó.
- Hoạt động đã chậm rõ: release cuối v0.8.2 tháng 03-2025, commit cuối 21-01-2026 (theo GitHub API ngày 2026-09-08).

## SOP là hợp đồng, không phải khẩu hiệu

README của MetaGPT mô tả nó là khung "The Multi-Agent Framework", với câu định vị:

> "It provides the entire process of a software company along with carefully orchestrated SOPs" — README của MetaGPT, [github.com/FoundationAgents/MetaGPT](https://github.com/FoundationAgents/MetaGPT)

Ngay bên dưới là công thức triết lý: `Code = SOP(Team)` — mã nguồn tốt là sản phẩm phụ của quy trình chuẩn, và quy trình đó được áp cho một đội cùng LLM. Bản đồ vai → artifact đọc thẳng từ cấu trúc thư mục `metagpt/roles/` và `metagpt/actions/`:

| Vai | Artifact xuất ra | Action tương ứng |
| --- | --- | --- |
| ProductManager | PRD | WritePRD |
| Architect | thiết kế API + cấu trúc dữ liệu | design_api |
| ProjectManager | danh sách task | project_management |
| Engineer | code + self-review | write_code, write_code_review |
| QAEngineer | bộ test | write_test |

*Source: cấu trúc `metagpt/roles/` + `metagpt/actions/` @ commit `11cdf466`, theo GitHub API ngày 2026-09-08.*

Điểm khác biệt nằm ở biên giao tiếp. Khi handoff bắt buộc qua document, "xong việc" có định nghĩa kiểm được: PRD phải đủ các trường, bản thiết kế phải nêu cấu trúc dữ liệu và luồng gọi. Chất lượng hợp tác bớt phụ thuộc vào vai nào nói nhiều hơn hay lễ phép hơn — thứ được bảo vệ là hình dạng của artifact, không phải phong cách trò chuyện.

## Schema của artifact là code, không phải lời dặn

Điểm yếu quen thuộc của quy trình do LLM điều hành là chỗ "viết cho có cấu trúc": gợi ý trong prompt, kết quả trôi tự do. MetaGPT đẩy schema xuống tầng code. Mỗi trường của PRD là một ActionNode khai báo tên, kiểu dữ liệu, instruction và ví dụ — trích từ `metagpt/actions/write_prd_an.py` @ commit `11cdf466`:

```python
PRODUCT_GOALS = ActionNode(
    key="Product Goals",
    expected_type=List[str],
    instruction="Provide up to three clear, orthogonal product goals.",
    example=[
        "Create an engaging user experience",
        "Improve accessibility, be responsive",
        "More beautiful UI",
    ],
)
```

*Source: `metagpt/actions/write_prd_an.py` @ commit `11cdf466d042aece04fc6cfd13b28e1a70341b1f`, theo GitHub API ngày 2026-09-08 — [github.com/FoundationAgents/MetaGPT/blob/11cdf466d042aece04fc6cfd13b28e1a70341b1f/metagpt/actions/write_prd_an.py](https://github.com/FoundationAgents/MetaGPT/blob/11cdf466d042aece04fc6cfd13b28e1a70341b1f/metagpt/actions/write_prd_an.py)*

Output của vai PM bị ép vào khung các node này thay vì để văn xuôi trôi. Vai architect dùng cách làm tương tự: file `design_api_an.py` định nghĩa node "Data Structures and Interfaces" và "Program call flow" — bản thiết kế không thể thiếu đúng hai mục hợp đồng mà engineer sẽ tiêu thụ. Khi handoff là schema, vai sau đọc được cấu trúc đã chuẩn hoá thay vì đoán ý; đây là chỗ MetaGPT tách khỏi các khung để prompt tự do tự quy định đầu ra.

## Handoff là subscribe, không phải gọi điện

Cơ chế nối vai cũng bỏ hội thoại trực tiếp. Trong `metagpt/roles/product_manager.py` @ commit `11cdf466`:

```python
self.set_actions([PrepareDocuments(send_to=any_to_str(self)), WritePRD])
self._watch([UserRequirement, PrepareDocuments])
self.rc.react_mode = RoleReactMode.BY_ORDER
```

*Source: `metagpt/roles/product_manager.py` @ commit `11cdf466d042aece04fc6cfd13b28e1a70341b1f`, theo GitHub API ngày 2026-09-08 — [github.com/FoundationAgents/MetaGPT/blob/11cdf466d042aece04fc6cfd13b28e1a70341b1f/metagpt/roles/product_manager.py](https://github.com/FoundationAgents/MetaGPT/blob/11cdf466d042aece04fc6cfd13b28e1a70341b1f/metagpt/roles/product_manager.py)*

Mỗi vai đăng ký các loại message mình quan tâm qua `_watch` và xuất artifact bằng action đã set. Ghép các vai lại với một requirement đầu vào, chuỗi chạy như sơ đồ:

```
requirement (một dòng)
   │
   ▼
ProductManager ──► PRD (schema ActionNode)
   │
   ▼
Architect ──► thiết kế API + cấu trúc dữ liệu
   │
   ▼
ProjectManager ──► danh sách task
   │
   ▼
Engineer ──► code + self-review
   │
   ▼
QAEngineer ──► test
```

*Source: sơ đồ tổng hợp từ cấu trúc `metagpt/actions/` @ commit `11cdf466`, theo GitHub API ngày 2026-09-08.*

Engineer không cần biết PM tên gì: nó chỉ tiêu thụ message kiểu task. Một số khung multi-agent chọn hội thoại nhóm để các vai "thảo luận"; MetaGPT chọn làm việc im theo SOP — trật tự nằm trong artifact, không nằm trong kỹ năng đàm phán của model.

## Dự án chậm lại — và điều đó nói lên điều gì

Số liệu hiện tại theo GitHub API ngày 2026-09-08:

| Chỉ số | Giá trị |
| --- | --- |
| Stars | 70.263 |
| License | MIT |
| Release gần nhất | v0.8.2 — 09-03-2025 |
| Commit gần nhất | 21-01-2026 |
| Tổ chức | đã chuyển từ geekan/MetaGPT sang FoundationAgents/MetaGPT |

*Source: `gh api repos/FoundationAgents/MetaGPT` + `releases` + `commits`, theo GitHub API ngày 2026-09-08.*

Nhịp phát hành cho thấy giai đoạn sôi động đã lùi xa:

| Tag | Ngày phát hành |
| --- | --- |
| v0.8.2 | 2025-03-09 |
| v0.8.1 | 2024-04-22 |
| v0.8.0 | 2024-03-29 |
| v0.7.0 | 2024-02-09 |

*Source: `gh api "repos/FoundationAgents/MetaGPT/releases?per_page=10"`, theo GitHub API ngày 2026-09-08.*

Từ v0.8.2 tới ngày research chưa có release nào — khoảng 18 tháng. Commit gần nhất là merge PR #1897 (thích ứng Windows Terminal) ngày 21-01-2026, cách ngày research gần 8 tháng; các commit trước đó cũng thưa dần qua 2025. Repo đã chuyển tổ chức, link cũ vẫn sống nhờ redirect của GitHub, nhưng phần cài đặt trong README còn nguyên dòng trỏ `git+https://github.com/geekan/MetaGPT.git` — dấu hiệu bảo trì lỏng. News trong README cho thấy năng lượng nhóm chuyển sang sản phẩm MGX (MetaGPT X), ra mắt 19-02-2025 và đạt #1 Product of the Week trên ProductHunt đầu tháng 03-2025 (nguồn: README của repo). Đọc trung thực: đây là hiện vật tiêu biểu của thời SOP đại chúng, nhưng activity hiện tại thấp — số stars nói về quá khứ được nhiều hơn tương lai.

Chính cấu trúc trên Wakii đang dùng ở tầng khác. Quy trình idea → impact → plan → epic + SF → gates cũng là chuỗi artifact contract: spec bị spec-critic mổ trước khi vào plan, plan bị plan-critic kiểm trước khi chia task, task-executor chỉ tiêu thụ plan đã duyệt. Mô tả đầy đủ nằm trong [docs story-workflow](/vi/docs/story-workflow/).

## Wakii học được gì

- **ADOPT — handoff giữa vai bằng artifact có cấu trúc.** Wakii đã áp cùng nguyên tắc: spec, plan, task là hợp đồng giữa 9 agents tách quyền — agent sau chỉ tiêu thụ artifact của agent trước, không chat tự do; cơ chế tách quyền được mổ trong [bài Chín agent, quyền hạn tách rời](/vi/blog/nine-agents-separated-powers/). MetaGPT xác nhận hướng này ở quy mô công ty mô phỏng.
- **DIRECTION — schema hoá từng trường của artifact.** ActionNode khai kiểu + instruction + ví dụ cho từng trường PRD. Wakii đã có lint kiểm cấu trúc (heading bắt buộc, pubDate khớp matrix) nhưng template spec/plan phần lớn là văn xuôi; hướng đáng cân nhắc là thêm trường máy-parse được cho các mục then chốt để critic nhận input đồng nhất; [bài Bracket và tier](/vi/blog/long-tasks-bracket-tiers/) là chỗ hợp để thử.
- **WATCH — khung mã nguồn mở đã chậm.** Release cuối 03-2025, commit cuối 01-2026 (theo GitHub API ngày 2026-09-08): nếu cần khung orchestration đa vai làm điểm tham chiếu, không nên mặc định tín nhiệm số stars. Điều kiện đổi thành DIRECTION: một release mới hoặc activity commit khôi phục đều.
- **N/A — mô phỏng "công ty phần mềm" trọn gói từ một dòng yêu cầu.** Product surface của Wakii là điều phối agent có người giữ gates và evidence, không phải sinh nguyên một repo từ requirement.

Muốn thử quy trình đa agent với gates và evidence rõ ràng? [Docs getting-started](/vi/docs/getting-started/) có hướng dẫn chạy story đầu tiên.
