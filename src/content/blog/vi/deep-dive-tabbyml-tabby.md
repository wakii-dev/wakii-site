---
title: "Tabby: trợ lý code tự host — khi inference chạy trên máy bạn"
description: "Chạy trợ lý code trên hạ tầng của riêng bạn với Tabby: một binary, hai lệnh, model chạy tại chỗ — và cách đọc license khi GitHub API báo NOASSERTION."
pubDate: "2026-10-23"
category: "tech"
tags: ["architecture", "license", "cli"]
draft: false
---

Hầu hết trợ lý code mặc định một hướng di chuyển: code của bạn đi lên API của hãng, gợi ý đi xuống. Tabby đi chiều ngược lại — server chạy trên hạ tầng của bạn, model tải về chạy tại chỗ, gợi ý sinh ra trong mạng nội bộ. Repo công khai trên GitHub với 33.869 sao theo GitHub API ngày 2026-09-08, nhưng chi tiết đáng học nhất lại nằm ở file LICENSE — nơi GitHub API trả về NOASSERTION thay vì một nhãn sạch. Đọc cả hai thứ đó cùng nhau là bài học đầy đủ về một dự án tự host.

- Tabby là trợ lý code tự host: một binary Rust với đúng hai lệnh — serve và download; client VS Code, Vim, IntelliJ nối vào qua API.
- Inference chạy tại chỗ: chọn device cpu/cuda/rocm/metal/vulkan, một model cho completion, một model khác cho chat.
- Server index code của bạn bằng crawler và công cụ tìm tantivy để completion có ngữ cảnh dự án thật.
- License không phải một nhãn: phần ngoài thư mục ee/ theo Apache 2.0, thư mục ee/ theo license riêng — GitHub API vì thế báo NOASSERTION.
- Với Wakii: nơi chạy inference là lựa chọn triển khai của người dùng; tầng orchestration story không đổi theo lựa chọn đó.

## Một binary, hai lệnh, ba client

Workspace Rust của Tabby có 18 crate thành viên, nhưng điểm vào gọn bất ngờ: đúng hai subcommand. Lệnh serve dựng API endpoint, lệnh download tải model về máy. Trích từ điểm vào chính:

```rust
#[derive(Subcommand)]
pub enum Commands {
    /// Starts the api endpoint for IDE / Editor extensions.
    Serve(serve::ServeArgs),

    /// Download the language model for serving.
    Download(download::DownloadArgs),
}

pub enum Device {
    Cpu,
    Cuda,
    Rocm,
    Metal,
    Vulkan,
}
```

(trích rút gọn từ [crates/tabby/src/main.rs @ 21b29048](https://github.com/TabbyML/tabby/blob/21b29048d7bcf6b94f9f482f2d0fd05efadfd19f/crates/tabby/src/main.rs), theo GitHub API ngày 2026-09-08)

Comment trong code tự nói thành phần nào làm gì: "Starts the api endpoint for IDE / Editor extensions". Client VS Code, Vim và IntelliJ — nằm ở thư mục `clients/` — nối vào endpoint đó chứ không nhúng model vào editor. Kiến trúc này tách ba lớp rành mạch: model chạy ở server, giao diện ở editor, hợp đồng giữa hai bên là HTTP.

Một chi tiết nhỏ nhưng nói nhiều về ưu tiên của dự án: hàm main set permission 0o700 cho thư mục gốc dữ liệu trước khi làm bất cứ việc gì. Thư mục đó chứa model và dữ liệu index — khóa nó còn lại mỗi owner là lựa chọn đúng cho một server xử lý code nguồn đóng của doanh nghiệp.

## Tự host nghĩa là gì trên thực tế

README của repo tóm gọn ba tính năng chính, một trong số đó nguyên văn: "Self-contained, with no need for a DBMS or cloud service." (nguồn: README của TabbyML/tabby — github.com/TabbyML/tabby#-tabby). Không database ngoài, không dịch vụ đám mây bắt buộc — toàn bộ trạng thái nằm trong thư mục dữ liệu cục bộ. Hai tính năng còn lại: giao diện OpenAPI để cắm vào hạ tầng sẵn có, và khả năng chạy trên GPU phổ thông.

Lệnh khởi chạy mẫu trong README nói được nhiều hơn mô tả:

```bash
docker run -it \
  --gpus all -p 8080:8080 -v $HOME/.tabby:/data \
  tabbyml/tabby \
  serve --model StarCoder-1B --device cuda --chat-model Qwen2-1.5B-Instruct
```

(nguồn: README của TabbyML/tabby — github.com/TabbyML/tabby#getting-started, trích theo GitHub API ngày 2026-09-08)

Một dòng lệnh là có server completion kèm chat. Đằng sau, file `serve.rs` cho thấy mỗi vai trò một model riêng: `--model` cho completion, `--chat-model` cho chat, và nếu cần, `--chat-device` cho phép chat chạy trên card khác card completion. Completion và chat có cấu hình tài nguyên khác nhau — một cái cần độ trễ thấp, một cái cần cửa sổ ngữ cảnh dài — và Tabby để bạn tinh chỉnh từng cái.

## Context dự án: crawler và index

Gợi ý completion tự host chỉ hữu ích khi nó hiểu codebase. Tabby giải quyết bằng hai crate riêng: `tabby-crawler` đi quét repo được đăng ký, `tabby-index` dựng chỉ mục tìm kiếm — dựa trên tantivy, công cụ tìm kiếm full-text viết bằng Rust. Toàn bộ pipeline ngữ cảnh nằm trong workspace, không phải dịch vụ ngoài:

```
crates/
├── tabby/            # entry: serve + download
├── tabby-crawler/    # quét repo đăng ký
├── tabby-index/      # chỉ mục tìm kiếm (tantivy)
├── tabby-inference/  # completion + chat + embedding
├── llama-cpp-server/ # backend chạy model
└── ...               # 13 crate nữa trong workspace
```

(nguồn: [Cargo.toml workspace @ 21b29048](https://github.com/TabbyML/tabby/blob/21b29048d7bcf6b94f9f482f2d0fd05efadfd19f/Cargo.toml) + cây thư mục crates/, theo GitHub API ngày 2026-09-08)

Server expose đúng các route cần: completions, chat completions, health, setting — tài liệu API tự sinh bằng utoipa kèm Swagger UI. Cấu trúc này cho phép đội vận hành cắm Tabby vào hệ thống sẵn có qua hợp đồng API thay vì phải UI của dự án.

Một quan sát vận hành, ghi kèm ngày cho trung thực: theo GitHub API ngày 2026-09-08, lần push cuối vào nhánh main là 2026-06-30; bản stable gần nhất v0.32.0 phát hành 2026-01-25 và một bản alpha kế tiếp ra 2026-02-09. Nhịp phát triển đã chậm lại rõ rệt so với giai đoạn 2024 — với ai cân nhắc triển khai tự host dài hạn, đây là yếu tố cần đặt lên bàn cân bằng cùng ưu điểm kiểm soát hạ tầng.

## Đọc license khi GitHub báo NOASSERTION

GitHub API trả về nhãn license NOASSERTION cho repo này — tức máy dò không khớp được một chuẩn SPDX duy nhất. Không phải repo không có license; mà là license của nó dài hơn một nhãn. File LICENSE khai rõ kiểu phân chia theo thư mục, trích nguyên văn: 'Content outside of the above mentioned directories or restrictions above is available under the "Apache 2.0" license as defined below' — tức phần ngoài thư mục ee/ theo Apache 2.0, còn thư mục ee/ theo license riêng tại ee/LICENSE.

(nguồn: file [LICENSE @ 21b29048](https://github.com/TabbyML/tabby/blob/21b29048d7bcf6b94f9f482f2d0fd05efadfd19f/LICENSE) của TabbyML/tabby, theo GitHub API ngày 2026-09-08)

Thư mục ee/ đó không phải chi tiết nhỏ: nó chứa tabby-webserver, tabby-db, tabby-schema — các crate phần doanh nghiệp của workspace, và trong code, tính năng này được gate bằng cargo feature riêng. Vì thế cách gọi đúng trong bài này là: dự án công khai trên GitHub, với điều khoản sử dụng phân theo thư mục — không gộp vào một nhãn duy nhất. Bài học khái quát cho bất kỳ ai chọn công cụ theo license: nhãn trên trang repo là phỏng đoán của máy; khi điều khoản ảnh hưởng tới quyết định triển khai, đọc file gốc.

## Nơi inference chạy là quyết định triển khai, không phải ideology

Nối về product của chúng ta: Wakii đứng ở đâu trên trục "code của bạn đi đâu"? Agent chạy cục bộ qua CLI, story state nằm trên máy bạn, và theo mô hình relay, mỗi kết nối đi ra ngoài đều là một đường có kiểm soát duy nhất. Tabby đại diện đầu còn lại của trục này: mọi tầng — inference gồm cả — chạy trong mạng nội bộ. Hai mô hình không loại nhau: cùng một story-workflow có thể chạy với agent dùng API đám mây hôm nay và endpoint nội bộ ngày mai, vì orchestration không quan tâm model nằm đâu. Nếu bạn mới bắt đầu, [getting started](/vi/docs/getting-started/) là chỗ đọc mô hình mặc định trước khi cân nhắc đổi nó.

## Wakii học được gì

- **ADOPT** — vệ sinh thư mục dữ liệu cục bộ: Tabby set permission 0o700 cho thư mục gốc dữ liệu ngay khi khởi động (evidence ở section một). Wakii giữ state cục bộ cho pairing và story — rà lại các thư mục đó để khóa 0o700 theo owner là việc nhỏ, đáng làm, không đổi hành vi nào khác.
- **DIRECTION** — giữ tầng agent tách rời endpoint model: kiến trúc hiện tại của Wakii đã tách orchestration khỏi inference; hướng đi là kiểm chứng một kịch bản endpoint nội bộ (tự host) chạy được end-to-end — chưa có yêu cầu thực tế nên chưa thể ADOPT.
- **WATCH** — nhịp phát triển chậm lại (push cuối 2026-06-30, stable cuối v0.32.0 2026-01-25, theo GitHub API ngày 2026-09-08): theo dõi thêm một chu kỳ nữa; nếu hoạt động quay lại, cân nhắc lại các grade trên với nguồn mới.
- **N/A** — tách license theo thư mục ee/: Wakii giữ một license MIT duy nhất cho toàn bộ repo; pattern phân chia license không áp vào mô hình phát hành của chúng ta.

Wakii là agentic IDE với một đội superpowers có sẵn — agent có kỷ luật, chạy trên máy bạn, mỗi quyết định quan trọng đi qua gate. [Tải về](/vi/docs/getting-started/) và chạy story đầu tiên để thấy quy trình, không chỉ gợi ý code.
