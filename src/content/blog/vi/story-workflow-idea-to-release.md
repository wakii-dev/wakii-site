---
title: "Story workflow: từ một dòng ý tưởng đến PR được merge"
description: "Giải phẫu story workflow của Wakii: bracket chia tier, DAG điều phối các SF agents chạy song song, decision gates giữ nhịp con người, merge về story branch rồi mở một PR duy nhất."
pubDate: "2026-09-04"
category: "tech"
tags: ["story-workflow", "agents", "workflow"]
draft: false
heroImage: "/blog/heroes/story-workflow-idea-to-release.png"
---

Mỗi feature lớn của Wakii được chạy như một story: bắt đầu từ một dòng ý tưởng, kết thúc bằng một PR được merge. Không phải ẩn dụ đẹp — đây là pipeline thật với bracket, tier, DAG, agent riêng từng phần và gate ở những ngã rẽ thật. Bài này đi hết con đường đó.

## Bracket: chia để trị

Ý tưởng một dòng đi qua ba bước: impact analysis (đụng đâu, lan ra đâu), spec (hợp đồng rõ ràng về output), rồi plan. Plan trong Wakii không phải file chết nằm trong docs — nó trở thành bracket: bảng task chia theo sub-feature (SF), mỗi SF xếp vào một tier.

Bracket của chính story blog này là ví dụ sống: SF-1 (SEO surface — OG, RSS, TOC) ở tier 0 vì mọi bài viết đều nhờ nó; SF-2 (seed mười bài viết) ở tier 1 vì cần surface đã sẵn sàng; SF-3 (QA toàn site) ở tier 2 vì chỉ hội tụ khi mọi thứ khác đã nằm yên.

## Tier và DAG: cái gì chạy trước

Tier vẽ ra DAG một cách tự nhiên: mỗi SF là một node, dependency là cạnh. Node nào không có cạnh đi vào thì chạy ngay. Orchestrator đọc DAG và điều phối — song song là trạng thái mặc định, thứ tự chỉ xuất hiện khi thật sự có phụ thuộc. Không ai phải xếp lịch tay, và không có hai agent nào giành chung một file.

## SF agents làm việc song song

Mỗi SF được giao cho một agent, chạy trong một git worktree riêng: nhánh riêng, đĩa riêng, commit atomic theo từng task. Agent đọc đúng phần spec của mình, hiện thực, chạy build, rồi tự đối chiếu acceptance trước khi báo hoàn thành. Một agent gặp sự cố không kéo sập các agent khác — isolation là điều kiện để song song là thật.

## Gates, merge và PR

Ở những ngã rẽ thật sự, workflow đặt decision gate: agent dừng, đưa ngữ cảnh và các lựa chọn, chờ con người resolve — từ desktop hoặc ngay trên điện thoại. Gate là nơi chất lượng được bảo hộ, không phải nơi tốc độ bị giết: trong thực tế một story chỉ gặp vài gate, đúng ở các điểm quyết thật sự.

SF xong được review rồi merge về story branch — nhánh đích gom cả story. Khi mọi SF đã nằm về một nhánh và verification sạch, story branch mở một PR duy nhất: reviewer nhìn một diff có tự sự thay vì ba mươi commit rải rác.

Toàn bộ quy trình được mô tả chi tiết trong [story workflow docs](/docs/story-workflow/); đội 9 agents đứng sau nó liệt kê trong [agents and kit](/docs/agents-and-kit/). Và phần hay nhất: Wakii tự xây chính mình bằng đúng quy trình này.
