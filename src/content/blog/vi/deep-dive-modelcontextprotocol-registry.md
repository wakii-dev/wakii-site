---
title: "MCP registry: danh bạ trung tâm của server MCP"
description: "Đọc code thật của modelcontextprotocol/registry: server.json tự khai phiên bản schema, tên server reverse-DNS phải chứng minh quyền sở hữu, và mô hình metaregistry trỏ tới package thay vì chứa code."
pubDate: "2026-10-11"
category: "tech"
tags: ["oss", "architecture", "license"]
draft: false
---

Hệ sinh thái MCP đang nở nhanh: hàng nghìn server do tác giả không quen biết nhau viết, và mỗi MCP client phải trả lời cùng một câu hỏi — tin đâu mà cài? Repo modelcontextprotocol/registry là câu trả lời chính thức của hệ sinh thái: một danh bạ trung tâm, nơi client tra được server này là gì, có phiên bản nào, cài từ đâu, và ai sở hữu cái tên đó. README của repo gọi ngắn gọn: *"app store for MCP servers"* (nguồn: [README](https://github.com/modelcontextprotocol/registry/blob/739b70e8bc1bea203c5a35ab699f1df51d091568/README.md)). Số liệu chụp ngày 2026-09-08: 7.227 stars, lần push gần nhất 2026-09-05; repo công khai trên GitHub, GitHub API ghi license NOASSERTION nên điều kiện sử dụng theo LICENSE trong repo (theo GitHub API ngày 2026-09-08). Bài này không tả theo trí nhớ — nó đọc README, code Go và API thật của registry.

TL;DR:

- Registry là danh bạ metadata cho server MCP — không chứa code, chỉ trỏ tới npm, PyPI, OCI và các registry package khác.
- server.json tự khai phiên bản schema qua trường `$schema`; validator nạp đúng bộ rule theo ngày phiên bản, nên dữ liệu cũ không bị phá khi format tiến hóa.
- Tên server theo reverse-DNS: sở hữu namespace phải chứng minh bằng GitHub OAuth/OIDC hoặc DNS/HTTP challenge — tự khai không được tính.
- `Repository.ID` do forge cấp giúp phát hiện "resurrection attack": repo bị xóa rồi tạo lại cùng tên thì ID đổi, danh tính giả lộ ngay.
- API đã freeze v0.1 từ 2025-10-24; bản spec cho phép bất kỳ ai vận hành registry riêng của mình.

## server.json tự khai phiên bản schema

Điểm thú vị nhất trong code nằm ở cách registry chống phá vỡ dữ liệu cũ. Mỗi server.json bắt buộc khai trường `$schema` — một URL trỏ tới phiên bản schema mà tài liệu đó tuân theo. Validator phía registry đọc URL này, trích số phiên bản, rồi nạp đúng file schema được nhúng sẵn theo đúng phiên bản đó:

```go
// extractVersionFromSchemaURL extracts the version identifier from a schema URL
// e.g., "https://static.modelcontextprotocol.io/schemas/2025-10-17/server.schema.json" -> "2025-10-17"
re := regexp.MustCompile(`/schemas/([A-Za-z0-9_~.-]+)/server\.schema\.json`)
```

(đoạn trích từ [`internal/validators/schema.go`](https://github.com/modelcontextprotocol/registry/blob/739b70e8bc1bea203c5a35ab699f1df51d091568/internal/validators/schema.go); comment trong code ghi rõ *"Empty/missing schema always produces an error"* — thiếu `$schema` thì bị từ chối luôn.)

Thư mục `internal/validators/schemas/` chứa các file schema đánh ngày: `2025-07-09.json`, `2025-09-16.json`, `2025-09-29.json`, `2025-10-11.json` (cây repo, theo GitHub API ngày 2026-09-08). Hằng số hiện hành trong [`pkg/model/constants.go`](https://github.com/modelcontextprotocol/registry/blob/739b70e8bc1bea203c5a35ab699f1df51d091568/pkg/model/constants.go) pin ở `CurrentSchemaVersion = "2025-12-11"`. Nghĩa là: tài liệu đăng hôm nay được kiểm theo rule ngày 2025-12-11, còn tài liệu đăng từ tháng 7/2025 vẫn được đọc bằng rule của ngày nó ra đời — registry không viết lại lịch sử dữ liệu.

Cơ chế này đang chạy thật, không chỉ nằm trong code: bản ghi đầu tiên trong trang đầu mình lấy từ API công khai có tên `ac.inference.sh/mcp`, `$schema` trỏ đúng `schemas/2025-12-11/server.schema.json` (theo registry.modelcontextprotocol.io ngày 2026-09-08). Namespace theo miền riêng — không chỉ GitHub — là chuyện bình thường ngoài thực tế.

## Danh tính namespace: chứng minh chứ không tự khai

Hệ sinh thái nở rộng nghĩa là ai cũng muốn một cái tên hay. Registry xử lý bài toán sở hữu tên bằng cách ép tên server theo reverse-DNS, rồi gắn việc chứng minh quyền sở hữu vào đúng namespace đó. Trường `Name` trong định nghĩa ServerJSON:

```go
Name string `json:"name" minLength:"3" maxLength:"200" pattern:"^[a-zA-Z0-9.-]+/[a-zA-Z0-9._-]+$" doc:"Server name in reverse-DNS format. Must contain exactly one forward slash separating namespace from server name." example:"io.github.user/weather"`
```

(trích [`pkg/api/v0/types.go`](https://github.com/modelcontextprotocol/registry/blob/739b70e8bc1bea203c5a35ab699f1df51d091568/pkg/api/v0/types.go), theo GitHub API ngày 2026-09-08)

Muốn đăng `io.github.<tên-bạn>/...`, bạn phải đăng nhập GitHub đúng tài khoản đó — hoặc publish từ GitHub Actions trong repo của bạn (GitHub OIDC). Muốn đăng `<miền-của-bạn>/...`, bạn phải chứng minh sở hữu miền qua DNS hoặc HTTP challenge (README, ngày probe 2026-09-08). Đủ bốn phương thức xác thực: GitHub OAuth, GitHub OIDC, DNS verification, HTTP verification.

Một chi tiết tinh tế nữa nằm ở trường `Repository.ID` — định danh do forge (GitHub, GitLab) cấp. Doc comment ghi chú nó dùng để phát hiện "resurrection attack": repo bị xóa rồi tạo lại cùng tên thì ID thay đổi, và danh tính giả bị lộ ngay. Trích nguyên văn: *"Should remain stable across repository renames and may be used to detect repository resurrection attacks"* ([pkg/model/types.go](https://github.com/modelcontextprotocol/registry/blob/739b70e8bc1bea203c5a35ab699f1df51d091568/pkg/model/types.go)).

## Metaregistry: trỏ tới chứ không chứa

Registry MCP không thay thế npm hay PyPI — nó đứng trên chúng. Tài liệu thiết kế trong repo gọi loại này là *metaregistry*, trích nguyên văn: *"They host metadata about packages, but not the package code or binaries"* (nguồn: [docs/design/ecosystem-vision.md](https://github.com/modelcontextprotocol/registry/blob/739b70e8bc1bea203c5a35ab699f1df51d091568/docs/design/ecosystem-vision.md)).

```
client ──tra cứu──▶ MCP registry   "weather-server v1.2.0 nằm ở npm:weather-mcp"
                        │ chỉ đường
                        ▼
              npm / PyPI / OCI / NuGet / Cargo  ← code thật nằm ở đây
```

Registry nhận metadata cho 6 loại package: `npm`, `pypi`, `oci`, `nuget`, `mcpb`, `cargo` ([pkg/model/constants.go](https://github.com/modelcontextprotocol/registry/blob/739b70e8bc1bea203c5a35ab699f1df51d091568/pkg/model/constants.go)). Đáng học nhất là kỷ luật phiên bản: trường `Version` của package từ chối dạng khoảng — doc comment ghi rõ *"Version ranges are rejected"* với ví dụ `^1.2.3`, `~1.2.3`, `>=1.2.3`, `1.x` ([pkg/model/types.go](https://github.com/modelcontextprotocol/registry/blob/739b70e8bc1bea203c5a35ab699f1df51d091568/pkg/model/types.go)). Danh bạ muốn được tin cậy thì không được phép trả lời "phiên bản nào cũng được". Vòng đời bản ghi cũng có sẵn trong schema: `active`, `deprecated`, `deleted`, kèm cờ `isLatest` do registry quản ([pkg/api/v0/types.go](https://github.com/modelcontextprotocol/registry/blob/739b70e8bc1bea203c5a35ab699f1df51d091568/pkg/api/v0/types.go)).

## Một spec, nhiều registry

Registry không chỉ là một dịch vụ — nó là một spec cộng một bản triển khai chính thức. README ghi nhận API vào trạng thái freeze v0.1 từ 2025-10-24 để integrator triển khai mà không sợ breaking change; bản preview ra mắt trước đó, 2025-09-08. Working group gồm 4 người đến từ 4 tổ chức khác nhau: Stacklok (lead), PulseMCP, TeamSpark, Ravenmail (README, theo GitHub API ngày 2026-09-08). Nhịp release gần nhất:

| Tag | Ngày phát hành (UTC) |
|---|---|
| v1.8.1 | 2026-08-06 |
| v1.8.0 | 2026-07-13 |
| v1.7.9 | 2026-05-12 |
| v1.7.8 | 2026-05-05 |
| v1.7.7 | 2026-05-04 |
| v1.7.6 | 2026-04-30 |

(theo GitHub API ngày 2026-09-08 — đợt đầu tháng 5/2026 dày đặc với 3 bản trong 12 ngày, sau đó thưa dần)

Tài liệu ecosystem-vision gọi bản chính thức là *"the authoritative repository for publicly-available MCP servers"* ([link](https://github.com/modelcontextprotocol/registry/blob/739b70e8bc1bea203c5a35ab699f1df51d091568/docs/design/ecosystem-vision.md)) — và mô tả thêm tầng subregistry: các registry con có thể curate, thêm metadata riêng, mà không đụng vào nguồn chuẩn.

## Wakii học được gì

- **DIRECTION — danh tính namespace kèm chứng minh quyền sở hữu.** Wakii hiện ship kit kèm app nên chưa cần cơ chế này; nhưng nếu catalog skill mở ra nhận đóng góp từ bên ngoài, khuôn reverse-DNS + GitHub OIDC của registry là mẫu sẵn để làm nguyên tắc "tên ai, người đó giữ" (evidence: mục Danh tính namespace).
- **DIRECTION — hợp đồng dữ liệu tự khai phiên bản.** Pattern `$schema` + validator chọn rule theo ngày giúp format tiến hóa mà không phá dữ liệu cũ — áp dụng được cho manifest hoặc catalog của Wakii nếu cấu trúc skill đổi theo phiên bản app (evidence: mục server.json).
- **WATCH — metaregistry và hệ sinh thái MCP.** Wakii là MCP consumer tiềm năng; khi nhu cầu kết nối server MCP xuất hiện, discovery qua registry chuẩn là lối đi tự nhiên (evidence: mục Một spec, nhiều registry). Điều kiện nâng cấp lên DIRECTION: lộ trình Wakii chạm vào MCP client.

Wakii chọn hướng phân phối khác: kit tự cài ở lần chạy đầu, đồng bộ theo phiên bản app, không cần trung gian — xem [agents and kit docs](/vi/docs/agents-and-kit/). Cách một dự án fork giữ vững chính mình khi hệ sinh thái dịch chuyển có trong [vì sao fork giữ MIT](/vi/blog/oss-why-fork-mit/); tư duy catalog — danh sách có chủ đích thay vì kho không chọn lọc — đã có chuyến tham quan riêng ở [skills catalog tour](/vi/blog/skills-catalog-tour/).

Đang xây MCP server? Đọc spec của server.json rồi kiểm chứng giả định bằng API công khai — cách học nhanh nhất từ repo này. Wakii là agentic IDE với đội superpowers có sẵn — tải về và để agent chạy.
