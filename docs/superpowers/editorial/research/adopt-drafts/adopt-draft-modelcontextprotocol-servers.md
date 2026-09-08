# Adopt draft — mutation queue cho shared-state writes

> Draft ADOPT cho SF-6 file TẬP TRUNG sau review (style-guide §10 rubric).
> Nguồn: matrix #9 — modelcontextprotocol/servers, bài deep-dive
> `deep-dive-modelcontextprotocol-servers` (bài sẽ live tại
> /blog/deep-dive-modelcontextprotocol-servers/ sau khi story merge).

## 1. Pattern

Serialize mọi read-modify-write vào state dùng chung sau MỘT hàng đợi tuần tự,
với hàng đợi tự phục hồi sau failure — học từ **modelcontextprotocol/servers**
(90.157★, license NOASSERTION trên GitHub API tại ngày probe 2026-09-08), fix
#4555 của server memory (commit `d73f99e`).

## 2. Evidence inline

Server memory của MCP giữ knowledge graph trong file, mở 9 tool cho LLM gọi.
Bug #1819: nhiều tool call dispatched trong cùng một lượt LLM mỗi cái tự load
graph, tự sửa bản sao riêng, ghi lại — "whichever write lands last silently
overwrites the other's changes" (comment trong src/memory/index.ts, commit
`d73f99e`, theo GitHub API ngày 2026-09-08). Fix serialize mọi mutation qua một
Promise-queue và không để một operation fail làm kẹt queue vĩnh viễn:

```ts
private mutationQueue: Promise<unknown> = Promise.resolve();

private async withLock<T>(operation: () => Promise<T>): Promise<T> {
  const result = this.mutationQueue.then(operation, operation);
  // single failed mutation doesn't permanently wedge every call after it
  this.mutationQueue = result.then(() => undefined, () => undefined);
  return result;
}
```

(condensed; blob: https://github.com/modelcontextprotocol/servers/blob/d73f99e/src/memory/index.ts)

## 3. Đề xuất Wakii

- **Surface**: các write read-modify-write vào file state dùng chung của
  story-team-kit — gate state, tiến độ SF, memory story — đặc biệt khi nhiều
  agent/SF chạy song song.
- **Kỳ vọng hành vi**: hết class lỗi write-last-wins trên state dùng chung
  (kịch bản shared-notes-file conflict mà nguyên tắc "defensive by design" của
  story workflow đã ghi nhận); một mutation fail không wedge các lần ghi sau.
- **Rủi ro chính**: tuần tự hoá khi writes vốn đã tách process/worktree là
  chi phí không cần thiết — chỉ áp cho file state THẬT SỰ dùng chung; cần đo
  trước khi bọc hết.

## 4. Upstream links

- Repo: https://github.com/modelcontextprotocol/servers
- Fix commit: https://github.com/modelcontextprotocol/servers/commit/d73f99efbfd40c3aa1b61e88728b3d49fb52608f (#4555)
- File: https://github.com/modelcontextprotocol/servers/blob/d73f99e/src/memory/index.ts
- Vấn đề gốc được cite trong comment code: #1819
- Bài deep-dive đầy đủ: /blog/deep-dive-modelcontextprotocol-servers/ (live sau story merge)
