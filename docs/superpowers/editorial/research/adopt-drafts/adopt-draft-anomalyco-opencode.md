# ADOPT draft — anomalyco/opencode (batch-3, matrix #2, probe 2026-09-08)

> Draft do SF-2 viết, SF-6 FILE TẬP TRUNG sau review (style-guide §10, FI-383 D5).
> Repo: anomalyco/opencode — 205.815★, MIT, theo GitHub API ngày 2026-09-08.
> Label đề xuất: `enhancement` trên `wakii-dev/wakii`.

## Pattern

Permission profile tường minh theo agent: mỗi định nghĩa agent mang theo một
permission ruleset 3 mức (`allow` / `ask` / `deny`) mà máy đọc trước khi agent
chạy — phân quyền nằm trong dữ liệu khai báo cạnh agent, không phải lời dặn mềm
trong system prompt. Học từ anomalyco/opencode (205.815★, MIT — theo GitHub API
ngày 2026-09-08): agent read-only "plan" bị chặn ghi ở tầng permission qua
ruleset `readonlyExternalDirectory` ("*" → ask, whitelist skill dirs / temp /
truncate glob → allow), KHÔNG phải nhờ prompt "hãy đừng sửa file".

## Evidence inline

Trích `packages/opencode/src/agent/agent.ts` @ commit `d6855b6` (lấy 2026-09-08):

```ts
const readonlyExternalDirectory = {
  "*": "ask",
  ...Object.fromEntries(whitelistedDirs.map((dir) => [dir, "allow"])),
} satisfies Record<string, "allow" | "ask" | "deny">
```

- Hai built-in agents (README, lấy 2026-09-08): "build" = full-access cho dev;
  "plan" = read-only, phải xin phép trước lệnh shell; subagent "general" gọi
  `@general`. Field `permission: PermissionV1.Ruleset` nằm trong schema Agent —
  cùng file với định nghĩa agent.
- "theo GitHub API ngày 2026-09-08": 205.815★ · 26.857 forks · MIT · pushed
  2026-09-08T11:11:55Z.
- Phân tích đầy đủ trong bài deep-dive — sẽ live tại `/blog/deep-dive-anomalyco-opencode/`
  sau khi story merge (build-in-public đã duyệt 2026-09-07).

## Đề xuất Wakii

- **Áp vào đâu**: đội 9 agent trong `story-team-kit` (thành phần kit của Wakii —
  docs công khai: trang "Agents & kit" trên wakii.xyz). Hiện tách quyền
  làm/duyệt (task-executor không tự duyệt; code-reviewer/verifier độc lập) được
  thực thi bằng system prompt + quy trình review, chưa phải ruleset máy đọc.
- **Kỳ vọng hành vi**: khai permission profile cạnh định nghĩa từng agent —
  code-reviewer + verifier: deny edit; phase0-impact-analyst + spec-critic +
  plan-critic: read-only; task-executor: allow trong phạm vi worktree của nó.
  Vi phạm (verifier cố sửa code) bị chặn ở tầng permission với mã lỗi rõ, thay
  vì dựa vào agent "tự biết".
- **Rủi ro chính**: profile quá chặt làm agent không hoàn thành việc hợp lệ
  (vd verifier cần chạy test → cần allow chạy lệnh đọc-만); cần whitelist mức
  "ask" cho ranh giới mờ, và đổi profile phải review như đổi code.

## Upstream links

- Repo: https://github.com/anomalyco/opencode
- Ruleset read-only: https://github.com/anomalyco/opencode/blob/d6855b6/packages/opencode/src/agent/agent.ts
- Docs agents: https://opencode.ai/docs/agents
- README (mục Agents): https://github.com/anomalyco/opencode#agents
