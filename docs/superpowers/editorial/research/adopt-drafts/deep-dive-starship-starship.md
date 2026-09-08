# ADOPT draft — broken config degrades, never crashes (starship/starship)

> Draft từ bài `deep-dive-starship-starship` (matrix #40, FI-388 SF-5).
> SF-6 file tập trung sau review — KHÔNG file issue từ SF.

## 1. Pattern

Config hỏng phải degrade về default kèm cảnh báo, không bao giờ làm sập
component: lỗi parse là một nhánh xử lý có chủ đích, không phải panic.
Học từ **starship/starship** — 59.816 sao, license ISC (theo GitHub API ngày
2026-09-08). Trait `ModuleConfig` trong `src/config.rs`: `load()` bắt lỗi
TOML → `log::warn!("Failed to load config value: {e}")` → `Self::default()`
— prompt chạy hàng chục lần mỗi phút vẫn render đúng dù user gõ sai config.

## 2. Evidence inline

- Code (theo GitHub API ngày 2026-09-08, @ commit 864500b26904cd3cc01fc2a19d3ad068bd1517a2):
  `fn load<V: Into<ValueRef<'a>>>(config: V) -> Self { match Self::from_config(config) { Ok(config) => config, Err(e) => { log::warn!("Failed to load config value: {e}"); Self::default() } } }`
  — xem tại https://github.com/starship/starship/blob/864500b26904cd3cc01fc2a19d3ad068bd1517a2/src/config.rs
- Bổ trợ: `try_load(config: Option<V>)` — config vắng mặt cũng về default,
  tức mọi đường đi của config đều kết thúc ở một giá trị dùng được.
- Ý nghĩa: với component chạy trước mặt người dùng (prompt, CLI, panel),
  "prompt lỗi thời tốt hơn prompt biến mất" là mức ưu tiên đúng.

## 3. Đề xuất Wakii

- **Surface**: mọi chỗ load config trong kit Wakii (story-* CLI đọc config
  TOML/JSON, cấu hình skill) và app (config workspace).
- **Hành vi kỳ vọng**: config sai kiểu/thiếu field/parse fail → log warn
  với nguyên nhân cụ thể → chạy tiếp với default; không có đường nào để
  một file config hỏng chặn được workflow hay crash CLI.
- **Rủi ro chính**: warn dễ bị bỏ qua nếu không nổi bật — cần chuẩn hoá
  format cảnh báo config ở một chỗ duy nhất; và default phải thực sự an toàn
  (nếu default của một hành vi nguy hiểm, fallback sai còn tệ hơn crash).

## 4. Upstream links

- Repo: https://github.com/starship/starship
- src/config.rs @ HEAD probe: https://github.com/starship/starship/blob/864500b26904cd3cc01fc2a19d3ad068bd1517a2/src/config.rs
- Tree tại commit probe: https://github.com/starship/starship/tree/864500b26904cd3cc01fc2a19d3ad068bd1517a2
- Bài blog sẽ live tại /blog/deep-dive-starship-starship/ sau khi story merge.
