# ADOPT draft — ollama/ollama (batch-3, matrix #3, SF-2/FI-385)

> Draft cho SF-6 file issue TẬP TRUNG sau review (style-guide §10; label
> `enhancement` trên wakii-dev/wakii). KHÔNG link path nội bộ — dẫn chứng
> bằng bài post public: "bài sẽ live tại /blog/deep-dive-ollama-ollama/ sau
> khi story merge" (build-in-public đã user duyệt 2026-09-07).

## Pattern

**"Report the real number — return 0 when unsure."** Học từ [ollama/ollama](https://github.com/ollama/ollama) (180.451★, license MIT, theo GitHub API ngày 2026-09-08): khi cần biết context window, Ollama không đọc số lý thuyết trên model card mà hỏi server đang chạy về giá trị được cấp phát thực tế; không xác định được thì trả về 0 — không đoán, không fill số đẹp.

## Evidence inline

`cmd/launch/context_window.go` (clone @ `83ed7d9`, 2026-09-08) — doc comment của `LoadedContextWindow`, lõi ý:

> "the size the scheduler actually allocated, which VRAM fit or server configuration may hold below the model's trained maximum"

Hàm trả giá trị theo process list của server đang chạy (không phải số lý thuyết trên model card) và **"Returns 0 when it cannot be determined"** — không đoán khi không chắc.

Ngược lại, biến `numCtxAuto` trong `server/sched.go` ghi nhận khi context window đến từ "Ollama's automatic VRAM-tier default" — phân biệt rõ giá trị tự động và giá trị người dùng chỉ định. Số repo: 180.451★, pushed 2026-09-07, MIT (theo GitHub API ngày 2026-09-08).

## Đề xuất Wakii

Áp vào **báo cáo gate + verifier (gates B0–B5, Rule 0)**: khi gate/verifier không đo được chỉ số (build fail giữa chừng, screenshot bỏ lỡ, probe timeout), báo cáo ghi rõ **"không xác định được — vì sao"** như một kết quả hợp lệ thay vì fill giá trị kỳ vọng hoặc bỏ trống im lặng. Kỳ vọng hành vi: verifier output luôn phân biệt 3 trạng thái (đo-được + giá trị thật / không-đo-được + lý do / không-áp-dụng), giống cách `numCtxAuto` phân biệt auto vs explicit. Rủi ro chính: gate report dài hơn — giữ gọn bằng format 1 dòng mỗi chỉ số.

Lưu ý: Wakii đã có tinh thần này ở Rule 0 (verifier đo dist thật, "I could not verify this" thay vì quiet pass) — pattern này là **củng cố + chuẩn hóa cách ghi "không biết"**, không phải tính năng mới.

## Upstream links

- Repo: https://github.com/ollama/ollama
- Code: https://github.com/ollama/ollama/blob/83ed7d9/cmd/launch/context_window.go · https://github.com/ollama/ollama/blob/83ed7d9/server/sched.go
- Docs: https://docs.ollama.com/api
- Bài deep-dive: sẽ live tại /blog/deep-dive-ollama-ollama/ sau khi story merge
