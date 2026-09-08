# ADOPT draft — "Not responsible for" boundary section in architecture docs

> Draft theo rubric style-guide §10 (FI-383 D5). SF-3 (FI-386) draft — SF-6
> file tập trung sau review. KHÔNG link path nội bộ site repo.

## Pattern

OpenHands (86.809 stars, MIT, theo GitHub API ngày 2026-09-08) viết thẳng
danh sách "Agent Canvas is not responsible for" vào docs kiến trúc: một control
center tự khai công khai những gì nó KHÔNG làm (không chạy agent trực tiếp,
không cung cấp sandbox/isolation, không giữ LLM credentials ngoài backend).
Biên giới trách nhiệm trở thành nội dung first-class, đọc được, không phải
mặc định ngầm.

## Evidence inline

Quote từ `docs/architecture.md` của repo (danh sách "Agent Canvas is not
responsible for"), probe ngày 2026-09-08:

> "Agent Canvas is not responsible for: Executing agent actions directly.
> Providing the sandbox or workspace isolation layer. Hosting LLM provider
> credentials outside the configured backend."

Nguồn công khai:
https://github.com/OpenHands/OpenHands/blob/f7fb0c4b21f5ed726edbba8a6309634ef434b004/docs/architecture.md
(HEAD @ 2026-09-08). Bài deep-dive kèm phân tích sẽ live tại
`/blog/deep-dive-openhands-openhands/` sau khi story FI-383 merge
(build-in-public đã duyệt 2026-09-07).

## Đề xuất Wakii

- **Surface**: docs sản phẩm (trang Agents & kit + Story workflow) và định
  nghĩa agent trong kit (story-team-kit).
- **Hành vi kỳ vọng**: mỗi agent/role có thêm 1 dòng "not responsible for" —
  ví dụ task-executor "does not approve its own code", verifier "does not fix
  bugs", PM "does not code". Người đọc docs và chính agent load định nghĩa đều
  thấy đường biên là hợp đồng tường minh, thay vì suy ra từ nguyên tắc
  "separated powers".
- **Rủi ro chính**: docs drift khi agent team đổi — giữ boundary list cạnh
  bảng job trong cùng trang để 1 lần sửa thấy cả hai; lượng thêm nhỏ (1 dòng
  mỗi role, 9 role) nên chi phí bảo trì thấp.

## Upstream links

- Repo: https://github.com/OpenHands/OpenHands
- Docs kiến trúc (chứa not-responsible list):
  https://github.com/OpenHands/OpenHands/blob/f7fb0c4b21f5ed726edbba8a6309634ef434b004/docs/architecture.md
- AGENTS.md (multi-repo boundary, cùng pattern):
  https://github.com/OpenHands/OpenHands/blob/f7fb0c4b21f5ed726edbba8a6309634ef434b004/AGENTS.md
