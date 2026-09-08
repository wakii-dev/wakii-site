---
title: "CAMEL: nghiên cứu agent cộng tác quy mô lớn"
description: "CAMEL biến hội thoại hai agent thành pipeline sinh dữ liệu có bộ lọc máy và benchmark chuẩn hoá — synthetic data là sản phẩm, chất lượng được đo bằng gate chứ không bằng cảm giác."
pubDate: "2026-10-17"
category: "tech"
tags: ["agents", "qa"]
draft: false
---

Hầu hết framework multi-agent trả lời cùng một câu hỏi: làm sao để nhiều agent phối hợp hoàn thành công việc. CAMEL hỏi một câu khác: làm sao để agent sinh ra dữ liệu đủ sạch để dùng cho nghiên cứu. Repo camel-ai/camel — 17.685 sao theo GitHub API ngày 2026-09-08, giấy phép Apache-2.0 — xuất phát từ một paper về role-playing giữa hai agent, rồi lớn thành hạ tầng sinh dữ liệu và benchmark cho nghiên cứu agent quy mô lớn. Bài này đi qua ba tầng trong code thật của repo: phiên hội thoại, bộ lọc dữ liệu, benchmark — để xem một repo nghiên cứu đo chất lượng bằng cái gì, thay vì tin cảm giác.

TL;DR:

- `RolePlaying` là lõi của repo: hai agent mang hai tên vai cộng tác trong một phiên hội thoại có task-specify và critic tuỳ chọn — hội thoại là phương pháp sinh dữ liệu, không phải demo.
- `camel/datagen` chứa 5 pipeline sinh dữ liệu; instruction máy sinh phải qua bộ lọc chuẩn (độ dài, keyword, rouge) trước khi vào dataset.
- `camel/benchmarks` đóng gói benchmark nghiên cứu (GAIA, BrowseComp, RAGBench) ngay trong thư viện — bộ đo nằm cạnh code thay vì nằm ngoài notebook.
- Dataset thành phẩm phát hành công khai trên Hugging Face theo 6 nhóm chủ đề — sản phẩm là dữ liệu, không chỉ thư viện.

## Từ hai vai trò tới một dataset

File `camel/societies/role_playing.py` — 853 dòng tại commit HEAD ngày 2026-09-08 — định nghĩa lớp `RolePlaying`, cỗ máy mở đầu toàn bộ câu chuyện. Signature của nó nói nhiều điều:

```python
class RolePlaying:
    r"""Role playing between two agents."""

    def __init__(
        self,
        assistant_role_name: str,
        user_role_name: str,
        *,
        critic_role_name: str = "critic",
        task_prompt: str = "",
        with_task_specify: bool = True,
        with_task_planner: bool = False,
        with_critic_in_the_loop: bool = False,
        task_type: TaskType = TaskType.AI_SOCIETY,
        ...
```

Nguồn: [camel/societies/role_playing.py](https://github.com/camel-ai/camel/blob/8c791b7b9cf7deab56cb5a92818c34499af9097f/camel/societies/role_playing.py), HEAD ngày 2026-09-08.

Hai tham số bắt buộc là hai chuỗi tên vai. Đây không phải thiết kế "khai báo vai để chia việc" như các framework hướng ứng dụng — nó là một khuôn quay: chọn hai vai, một task prompt, và khuôn quay ra một phiên hội thoại có kiểm soát để thu thập. Ba công tắc cho thấy mức can thiệp điều chỉnh được: `with_task_specify` (mặc định bật — một agent phụ viết lại task chung chung thành task cụ thể trước khi hội thoại bắt đầu), `with_task_planner`, và `with_critic_in_the_loop` (một agent phê bình chen vào giữa hai vai). Giá trị mặc định `task_type: TaskType.AI_SOCIETY` trùng tên với dataset AI Society mà repo phát hành công khai — hội thoại được sinh ra để trở thành dữ liệu ngay từ thiết kế, không phải sau đó.

Luồng dữ liệu qua ba tầng của repo:

```
task prompt
   |
   v
[task specify agent]  viet lai task thanh cu the
   |
   v
assistant <----> user     (role-playing loop, step() tung luot)
   |
   v
transcript hoi thoai
   |
   v
camel/datagen/*  -->  filters  -->  dataset (Hugging Face)
                         |
                         v
               camel/benchmarks   (do chat luong pipeline)
```

README của repo mô tả demo gốc là hai agent đóng vai "a python programmer and a stock trader collaborating on developing a trading bot" — một lập trình viên và một nhà giao dịch cùng dựng bot giao dịch ([README](https://github.com/camel-ai/camel#quick-start), ngày 2026-09-08). Hai vai, một phiên hội thoại, cái để lại là transcript có cấu trúc — nguyên liệu thô của mọi thứ còn lại.

## Bộ lọc máy chặn trước khi dữ liệu vào kho

Sinh dữ liệu quy mô lớn va ngay một vấn đề: nếu nhận mọi thứ model sinh ra, dataset thành bãi hỗn hợp. `SelfInstructPipeline` trong `camel/datagen/self_instruct/` giải quyết bằng vòng lặp có cửa kiểm. Bộ lọc mặc định của pipeline:

```python
default_config: Dict[str, Dict[str, Any]] = {
    "length": {},
    "keyword": {},
    "punctuation": {},
    "non_english": {},
    "rouge_similarity": {},
}
```

Nguồn: [camel/datagen/self_instruct/self_instruct.py](https://github.com/camel-ai/camel/blob/8c791b7b9cf7deab56cb5a92818c34499af9097f/camel/datagen/self_instruct/self_instruct.py), HEAD ngày 2026-09-08.

Năm filter — length, keyword, punctuation, non_english, rouge_similarity. Cái cuối so tương đồng giữa instruction mới với các instruction đã có để chặn trùng lặp. Vòng sinh chính chạy như sau:

```python
while len(self.machine_tasks) < self.num_machine_instructions:
    prompt, instruction = self.generate_machine_instruction()
    ...
    if self.instruction_filter.filter(prompt, instruction):
        ...
    else:
        logger.warning(
            f"Instruction failed filters. Skipping instruction: "
            f"{instruction}"
        )
```

Instruction mới được sinh, đưa qua chuỗi filter; đạt thì nhận vào kho, không đạt thì ghi log lý do rồi bỏ — "Instruction failed filters. Skipping instruction" là dòng log của chính pipeline, không phải câu cửa miệng. Tham số `human_to_machine_ratio` mặc định (6, 2) trộn instruction người viết với instruction máy sinh làm nguyên liệu mở rộng. Điểm đáng học: vị trí của bộ lọc — ngay trong vòng sinh, trước kho. Chất lượng ở đây là thuộc tính đo được — mỗi instruction đi qua gate định lượng, không ai "cảm thấy" nó ổn.

## Benchmark nằm trong thư viện, không nằm ngoài notebook

Tầng thứ ba là `camel/benchmarks` — module cùng cấp với `agents` và `societies` trong cây code. Bên trong có `gaia.py`, `browsecomp.py`, `ragbench.py`, `apibank.py`, `apibench.py`, `nexus.py` ([cây code](https://github.com/camel-ai/camel/tree/8c791b7b9cf7deab56cb5a92818c34499af9097f/camel/benchmarks), ngày 2026-09-08). Lớp nền chuẩn hoá mọi bộ đo:

```python
class BaseBenchmark(ABC):
    r"""Base class for benchmarks."""

    def __init__(
        self, name: str, data_dir: str, save_to: str, processes: int = 1
    ):
```

Nguồn: [camel/benchmarks/base.py](https://github.com/camel-ai/camel/blob/8c791b7b9cf7deab56cb5a92818c34499af9097f/camel/benchmarks/base.py), HEAD ngày 2026-09-08.

Bốn thuộc tính: tên, thư mục dữ liệu, nơi ghi kết quả, số process song song. Một benchmark mới chỉ cần cắm vào khuôn này. Với một repo mà sản phẩm là dữ liệu sinh ra, benchmark chính là đồng hồ đo của dây chuyền: pipeline mới phải đối chiếu số trên bộ đo chuẩn, không tự chấm. README gọi rõ mục tiêu của cộng đồng là "finding the scaling laws of agents" — tìm định luật scale của agent ([README](https://github.com/camel-ai/camel), ngày 2026-09-08) — mục tiêu như vậy buộc mọi thí nghiệm phải đo được trên cùng một thước.

## Dataset là sản phẩm, phát hành ra công chúng

README liệt kê 6 nhóm dataset phát hành trên Hugging Face (ngày 2026-09-08):

| Dataset | Chat format | Instruction format | Bản dịch |
|---|---|---|---|
| AI Society | có | có | có |
| Code | có | có | — |
| Math | có | — | — |
| Physics | có | — | — |
| Chemistry | có | — | — |
| Biology | có | — | — |

Đây là điểm phân biệt CAMEL với các framework thuần dựng agent: đầu ra không chỉ là API cho bạn dựng agent, mà là dataset bạn tải về huấn luyện mô hình. Repo còn dẫn ra các dự án nghiên cứu rẽ nhánh — OWL, OASIS, CRAB, Agent Trust, Loong — theo README ngày 2026-09-08.

Về nhịp phát hành: release gần nhất là v0.2.91a7 ngày 2026-09-03 — trong đúng ngày đó có hai lần bump alpha liên tiếp (a6 lúc 05:12, a7 lúc 05:28 UTC). Trước đó là v0.2.91a5 ngày 2026-07-13 — nhịp release thưa, không đều, gắn cột mốc hơn là gắn lịch (theo GitHub API ngày 2026-09-08). Trong khi đó nhánh master được push lần cuối 2026-09-07: code chạy hằng ngày, release chờ cột mốc.

CAMEL phục vụ nghiên cứu ở quy mô README mô tả là hàng triệu agent; Wakii vận hành workflow cho một developer, agent thật đứng ở vòng lặp review. Hai bài toán khác cấp, nhưng bài học về đo chất lượng bằng máy thì áp nguyên xi: pipeline gate B0–B5 của Wakii trong [docs story-workflow](/vi/docs/story-workflow/) là cùng một tư duy — chất lượng qua gate định lượng, không qua cảm giác của một reviewer. Bài [convergence QA last tier](/vi/blog/convergence-qa-last-tier/) kể cách các tầng kiểm này xếp lớp trong quy trình.

## Wakii học được gì

- **ADOPT** — chất lượng là bộ lọc máy đặt trước kho, không phải cảm giác: SelfInstruct chặn instruction không qua filter ngay trong vòng sinh và log lý do từng cái bị bỏ. Wakii đã áp cùng nguyên tắc ở convergence QA — bài chỉ vào pool sau lint + audit machine gates; audit ghi pendingRows cho bài chưa xong. Bước hoàn thiện nhỏ còn lại: log lý do reject từng lượt (bài bị chặn vì filter nào) vào phần NOTE của audit.
- **DIRECTION** — benchmark thành module tái chạy được: BaseBenchmark chuẩn hoá name/data_dir/save_to cho mọi bộ đo. Wakii có thể đóng gói một suite kịch bản story-workflow cố định — fixture là transcript thật đã lưu trong repo — để replay mỗi lần sửa workflow. Hôm nay convergence QA chạy theo từng story, chưa có suite cố định replay độc lập.
- **WATCH** — synthetic traces để test quy mô: CAMEL dùng hội thoại role-play làm nguyên liệu; hướng tương ứng là sinh transcript giả lập user-agent để test story-workflow trước khi dính story thật. Đổi thành DIRECTION khi nhu cầu regression nhanh hơn real-run xuất hiện thật, không phải khi mới nghe thấy hay.
- **N/A** — "finding the scaling laws of agents" và mô phỏng tới hàng triệu agent là câu hỏi nghiên cứu khác cấp; Wakii chạy workflow cho một dev, không đo luật scale.

Nếu bạn đang dựng workflow agent và muốn thấy gate máy vận hành trên sản phẩm thật, tải Wakii và bắt đầu từ [docs getting-started](/vi/docs/getting-started/) — mỗi gate đều kèm evidence.
