/**
 * Skills catalog data — source of truth for /skills (SF-2).
 * Source: frontmatter of the 20 skills in the ~/.claude/skills folders
 * (SKILL.md, counted 2026-09-04). Pattern follows src/i18n/landing.ts: one interface,
 * skill names + commands stay English, desc/how carried in EN + VI.
 *
 * Triage (SF-1, pending PM confirm — gate for SF-2 START):
 * `public: true` = catalog-worthy; false = platform-specific (Orca app
 * control) or internal (agent-facing machinery), excluded from /skills.
 * Data module still carries all 20 so the count stays verifiable.
 */

export type SkillCategory = 'workflow' | 'design' | 'reference' | 'platform';

export interface Skill {
  id: string;
  name: string;
  /** slash-command form */
  command: string;
  category: SkillCategory;
  public: boolean;
  /** one-sentence description */
  desc_en: string;
  desc_vi: string;
  /** how it works, 2-3 sentences */
  how_en: string;
  how_vi: string;
}

export const skills: Skill[] = [
  {
    id: 'brainstorm',
    name: 'brainstorm',
    command: '/brainstorm',
    category: 'workflow',
    public: true,
    desc_en: 'Turns a rough feature idea into a validated spec and implementation plan before any code exists.',
    desc_vi: 'Biến một ý tưởng còn thô thành spec đã kiểm chứng và kế hoạch triển khai trước khi có bất kỳ dòng code nào.',
    how_en: 'Explores intent and requirements through clarifying questions, challenges assumptions, then produces a spec plus a step-by-step plan. Optionally publishes the plan to Linear and sets up an isolated git worktree for the work.',
    how_vi: 'Khám phá ý định và yêu cầu qua các câu hỏi làm rõ, thách thức các giả định, rồi tạo spec kèm kế hoạch từng bước. Có thể đăng plan lên Linear và dựng git worktree cách ly cho việc triển khai.',
  },
  {
    id: 'writing-plans-linear',
    name: 'writing-plans-linear',
    command: '/writing-plans-linear',
    category: 'workflow',
    public: true,
    desc_en: 'Writes implementation plans detailed enough for an engineer with zero context, and publishes them to Linear for team visibility.',
    desc_vi: 'Viết kế hoạch triển khai chi tiết đủ cho một engineer không có ngữ cảnh nào, và đăng lên Linear để cả team cùng thấy.',
    how_en: 'Decomposes the spec into bite-sized tasks — files to touch, code to write, how to test each step — assuming the reader knows nothing. In publish mode it creates one Linear subtask per milestone and syncs progress as work lands.',
    how_vi: 'Tách spec thành các task nhỏ vừa sức — file cần sửa, code cần viết, cách test từng bước — với giả định người đọc không biết gì. Ở chế độ publish, nó tạo một subtask Linear mỗi milestone và đồng bộ tiến độ khi work hạ cánh.',
  },
  {
    id: 'story-workflow',
    name: 'story-workflow',
    command: '/story-workflow',
    category: 'workflow',
    public: true,
    desc_en: 'Runs large features as stories — an epic issue with one sub-feature workflow per slice, structured as a vertical tier bracket.',
    desc_vi: 'Chạy tính năng lớn dưới dạng story — một issue epic với mỗi slice là một workflow sub-feature, cấu trúc theo tier bracket dọc.',
    how_en: 'Analyzes once at epic level with maximum strictness, writes a bracket file of sub-features with dependencies, then launches each sub-feature as an isolated workflow that inherits the analysis. A watchdog resumes stalled slices until the story verifies complete.',
    how_vi: 'Phân tích một lần ở cấp epic với độ nghiêm ngặt tối đa, viết bracket file liệt kê sub-feature kèm dependency, rồi phóng từng sub-feature như một workflow cách ly kế thừa phân tích đó. Watchdog đánh thức slice bị stall cho tới khi story verify hoàn tất.',
  },
  {
    id: 'orca-superpowers-workflow',
    name: 'orca-superpowers-workflow',
    command: '/orca-superpowers-workflow',
    category: 'workflow',
    public: true,
    desc_en: 'The end-to-end feature pipeline: impact analysis, Linear issue, spec, plan, task DAG, execution with gates, and final verification in one flow.',
    desc_vi: 'Pipeline tính năng đầu-cuối: phân tích tác động, issue Linear, spec, plan, task DAG, thực thi kèm gate, và verify cuối — gói trong một luồng.',
    how_en: 'Wraps the full superpowers workflow and automatically activates the Orca bridges at transition points — Linear sync, worktree creation, task DAG as external memory, and decision gates between phases. Replaces juggling five separate skills with one command.',
    how_vi: 'Bọc trọn superpowers workflow và tự kích hoạt các Orca bridge tại điểm chuyển tiếp — đồng bộ Linear, tạo worktree, task DAG làm bộ nhớ ngoài, và gate quyết định giữa các phase. Thay việc xoay năm skill riêng bằng một lệnh duy nhất.',
  },
  {
    id: 'post-task-ritual',
    name: 'post-task-ritual',
    command: '/post-task-ritual',
    category: 'workflow',
    public: false,
    desc_en: 'Internal end-of-task ritual: harvests problems, fixes and patterns from a finished task into skill updates and indexed memory.',
    desc_vi: 'Nghi thức nội bộ cuối task: thu hoạch vấn đề, bản fix và pattern từ task vừa xong thành bản cập nhật skill và memory có index.',
    how_en: 'Walks seven steps after a workflow completes — collect problems, extract solutions, generalize patterns, decide which skill to update, apply, index memory, clear the log. Triggered by the workflow itself, not meant for direct use.',
    how_vi: 'Đi qua bảy bước sau khi workflow hoàn tất — gom vấn đề, rút giải pháp, khái quát pattern, chọn skill cần cập nhật, áp dụng, index memory, dọn log. Được workflow tự kích hoạt, không dành cho dùng trực tiếp.',
  },
  {
    id: 'execute-plan',
    name: 'execute-plan',
    command: '/execute-plan',
    category: 'workflow',
    public: false,
    desc_en: 'Internal executor: implements a dispatched plan task end-to-end inside its isolated worktree.',
    desc_vi: 'Executor nội bộ: triển khai một task plan được điều phối, từ đầu tới cuối, bên trong worktree cách ly của nó.',
    how_en: 'Reads the spec slice, implements it, runs the tests, commits atomically, and reports DONE or BLOCKED with evidence. Spawned by the orchestration coordinator — not a skill you invoke by hand.',
    how_vi: 'Đọc spec slice, triển khai, chạy test, commit nguyên tử, rồi báo DONE hoặc BLOCKED kèm bằng chứng. Được coordinator điều phối sinh ra — không phải skill bạn gọi bằng tay.',
  },
  {
    id: 'frontend-design',
    name: 'frontend-design',
    command: '/frontend-design',
    category: 'design',
    public: true,
    desc_en: 'Design guidance for UI that reads as intentional and distinctive — never templated defaults.',
    desc_vi: 'Hướng dẫn thiết kế cho UI đọc lên là thấy chủ đích và khác biệt — không bao giờ là mặc định khuôn mẫu.',
    how_en: 'Approaches each brief like a design lead: ground the design in the subject\'s own world, make deliberate typography and palette choices, and take one justified aesthetic risk. Loaded whenever new UI is being shaped.',
    how_vi: 'Tiếp cận mỗi brief như một design lead: bám vào thế giới riêng của chủ đề, chọn typography và bảng màu có chủ đích, và chấp nhận một rủi ro thẩm mỹ có lý do. Được load mỗi khi có UI mới cần định hình.',
  },
  {
    id: 'gpt-taste',
    name: 'gpt-taste',
    command: '/gpt-taste',
    category: 'design',
    public: true,
    desc_en: 'Elite UX/UI and GSAP motion engineering rules that break the statistical biases of AI-generated design.',
    desc_vi: 'Bộ quy tắc UX/UI và motion GSAP cấp cao, phá các thiên kiến thống kê của design do AI sinh ra.',
    how_en: 'Enforces true randomization for layout variance, AIDA page structure, wide editorial typography, gapless bento grids, and strict GSAP ScrollTriggers. It exists to counter what LLMs do by default — six-line wrapped headings, cheap meta-labels, repeated left/right layouts.',
    how_vi: 'Ép buộc randomization thật cho biến thể layout, cấu trúc trang AIDA, typography editorial cỡ lớn, bento grid khít mép, và GSAP ScrollTrigger nghiêm ngặt. Sinh ra để chống những gì LLM hay làm mặc định — heading chữ dài 6 dòng, label rẻ tiền, layout trái/phải lặp đi lặp lại.',
  },
  {
    id: 'design-taste-frontend',
    name: 'design-taste-frontend',
    command: '/design-taste-frontend',
    category: 'design',
    public: true,
    desc_en: 'Anti-slop frontend review — an audit-first pass over UI that was already built, before it ships.',
    desc_vi: 'Review frontend chống "slop" — một lượt audit-first lên UI đã build, trước khi ship.',
    how_en: 'Runs after implementation, not during mocking: reads the brief, infers intent, then checks the built UI against taste rules contextually — nothing fires automatically. Strict pre-flight check before shipping.',
    how_vi: 'Chạy sau khi implement, không phải lúc mocking: đọc brief, suy ra ý định, rồi soát UI đã build theo các quy tắc thẩm mỹ có ngữ cảnh — không gì tự kích hoạt máy móc. Là bước pre-flight nghiêm ngặt trước khi ship.',
  },
  {
    id: 'image-to-code',
    name: 'image-to-code',
    command: '/image-to-code',
    category: 'design',
    public: true,
    desc_en: 'Turns a single design reference image into a real, implementation-friendly frontend component.',
    desc_vi: 'Biến một ảnh design tham chiếu thành component frontend thật, sẵn sàng để triển khai.',
    how_en: 'Works image-first: reads the reference as an art director — hierarchy, spacing, tokens — then produces the component code against it as a fidelity target. Best with large section-specific images, not full-page layouts.',
    how_vi: 'Làm việc ảnh-trước: đọc ảnh tham chiếu như một art director — hierarchy, spacing, tokens — rồi sinh code component bám ảnh như chuẩn độ trung thực. Hiệu quả nhất với ảnh lớn theo section, không phải layout nguyên trang.',
  },
  {
    id: 'mock-prototype',
    name: 'mock-prototype',
    command: '/mock-prototype',
    category: 'design',
    public: true,
    desc_en: 'Prototypes an idea as three HTML design directions, published as links you can open and pick from — no production code.',
    desc_vi: 'Dựng prototype ý tưởng thành 3 hướng thiết kế HTML, đăng thành link để bạn mở và chọn — không đụng code production.',
    how_en: 'Runs the huashu-design pipeline: drafts three directions as HTML, hosts each on an unlisted artifact link, waits for your pick, then polishes the chosen direction and hands off a spec to the build phase.',
    how_vi: 'Chạy pipeline huashu-design: phác ba hướng dưới dạng HTML, host từng hướng lên một link artifact riêng, chờ bạn chọn, rồi hoàn thiện hướng được chọn và bàn giao spec cho giai đoạn build.',
  },
  {
    id: 'web-design-guidelines',
    name: 'web-design-guidelines',
    command: '/web-design-guidelines',
    category: 'design',
    public: true,
    desc_en: 'Reviews UI code against 105 concrete web interface rules — accessibility, focus, forms, animation, layout, content.',
    desc_vi: 'Soi code UI qua 105 quy tắc giao diện web cụ thể — accessibility, focus, form, animation, layout, nội dung.',
    how_en: 'A heuristic engine where every rule is checkable in code, not by feel — vendored from vercel-labs/web-interface-guidelines (MIT) so it works offline. Used during review passes alongside visual screenshots.',
    how_vi: 'Một heuristic engine mà mọi quy tắc đều kiểm được bằng code, không bằng cảm tính — vendor từ vercel-labs/web-interface-guidelines (MIT) nên chạy offline được. Dùng trong lượt review song song với screenshot trực quan.',
  },
  {
    id: 'figma-orientation',
    name: 'figma-orientation',
    command: '/figma-orientation',
    category: 'reference',
    public: true,
    desc_en: 'Router for Figma work — maps your intent to the right official Figma skill or MCP call before you guess wrong.',
    desc_vi: 'Router cho việc dùng Figma — đưa ý định của bạn tới đúng skill Figma chính thức hoặc lệnh MCP phù hợp, trước khi bạn chọn sai.',
    how_en: 'Loads first on any Figma task, reads what you actually want (implement a design, extract tokens, generate code), then routes to the correct skill or direct tool call. Prevents the classic failure of calling a tool without its required companion skill.',
    how_vi: 'Được load đầu tiên trong mọi tác vụ Figma, đọc xem bạn thật sự muốn gì (implement design, lấy tokens, sinh code), rồi điều hướng tới đúng skill hoặc lệnh tool. Ngăn lỗi kinh điển là gọi một tool nhưng thiếu skill đồng hành bắt buộc của nó.',
  },
  {
    id: 'graph-engineering',
    name: 'graph-engineering',
    command: '/graph-engineering',
    category: 'reference',
    public: true,
    desc_en: 'Teaches graph engineering — knowledge graphs (what agents remember) and task graphs (how agents orchestrate) — in teaching mode with worked examples.',
    desc_vi: 'Dạy graph engineering — knowledge graph (agent nhớ gì) và task graph (agent điều phối thế nào) — ở chế độ giảng dạy kèm ví dụ từng bước.',
    how_en: 'Covers ontology design, entity and relation extraction, GraphRAG serving, plus the orchestration half: parallel fan-out, verifier separation, and human gates. Ask it to build a knowledge graph or to learn the discipline, and it explains each stage while producing visual diagram artifacts.',
    how_vi: 'Bao phủ thiết kế ontology, trích xuất thực thể và quan hệ, GraphRAG, cộng nửa điều phối: fan-out song song, tách verifier, và gate con người. Nhờ nó xây knowledge graph hoặc học môn này, nó sẽ giải thích từng stage kèm diagram trực quan.',
  },
  {
    id: 'prompt-master',
    name: 'prompt-master',
    command: '/prompt-master',
    category: 'reference',
    public: true,
    desc_en: 'Turns a rough prompt idea into one production-ready prompt, optimized for the specific AI tool you name.',
    desc_vi: 'Biến ý tưởng prompt còn thô thành một prompt production-ready, tối ưu cho đúng công cụ AI bạn nêu tên.',
    how_en: 'Extracts the real intent, identifies the target tool — an LLM, Cursor, Midjourney, a coding agent — and outputs a single prompt with zero wasted tokens, locking identity and output format up front. Only activates when you explicitly ask for prompt work.',
    how_vi: 'Rút ra ý định thật, nhận diện công cụ đích — LLM, Cursor, Midjourney, coding agent — và xuất một prompt duy nhất không lãng phí token, khóa sẵn identity và format output từ đầu. Chỉ kích hoạt khi bạn yêu cầu rõ ràng việc về prompt.',
  },
  {
    id: 'bridge-router',
    name: 'bridge-router',
    command: '/bridge-router',
    category: 'platform',
    public: false,
    desc_en: 'Routes a running workflow moment to the right Orca bridge — worktree+Linear, decision gate, task DAG, review coordination, or status sync.',
    desc_vi: 'Đưa một thời điểm workflow đang chạy tới đúng Orca bridge — worktree+Linear, gate quyết định, task DAG, điều phối review, hoặc đồng bộ trạng thái.',
    how_en: 'The single entry point when a superpowers skill is running and the right Orca mapping is not obvious. Detects the trigger phrase and hands off to the matching bridge skill.',
    how_vi: 'Điểm vào duy nhất khi một superpowers skill đang chạy và ánh xạ Orca phù hợp chưa rõ. Nhận diện câu trigger rồi bàn giao cho bridge skill tương ứng.',
  },
  {
    id: 'orca-cli',
    name: 'orca-cli',
    command: '/orca-cli',
    category: 'platform',
    public: false,
    desc_en: 'Operates the Orca app through its public CLI — worktrees, terminals, artifacts, and the embedded browser.',
    desc_vi: 'Điều khiển app Orca qua CLI công khai — worktree, terminal, artifact, và browser nhúng.',
    how_en: 'Covers Orca-managed state: creating worktrees, spawning agents in them, reading and writing terminals, sharing artifacts and skills. Preferred over raw git or ad-hoc automation whenever the task touches Orca state.',
    how_vi: 'Bao phủ trạng thái Orca: tạo worktree, sinh agent trong đó, đọc ghi terminal, chia sẻ artifact và skill. Được ưu tiên hơn git thuần hay automation thủ công bất cứ khi nào tác vụ chạm vào trạng thái Orca.',
  },
  {
    id: 'orca-bridge',
    name: 'orca-bridge',
    command: '/orca-bridge',
    category: 'platform',
    public: false,
    desc_en: 'Bridges the superpowers workflow skills to the Orca CLI at five high-leverage points.',
    desc_vi: 'Cầu nối các workflow skill superpowers tới Orca CLI tại năm điểm đòn bẩy cao.',
    how_en: 'Activates when triggers like "create worktree", "track tasks", or "sync linear" fire inside a superpowers run, mapping them to worktree linking, task DAGs, gates, and Linear status updates.',
    how_vi: 'Kích hoạt khi các trigger như "create worktree", "track tasks", hay "sync linear" vang lên trong một superpowers run, ánh xạ chúng sang link worktree, task DAG, gate, và cập nhật trạng thái Linear.',
  },
  {
    id: 'orchestration',
    name: 'orchestration',
    command: '/orchestration',
    category: 'platform',
    public: false,
    desc_en: 'Coordinates multiple agents through Orca orchestration — threaded messages, task dispatch, DAGs, and decision gates.',
    desc_vi: 'Điều phối nhiều agent qua Orca orchestration — message theo thread, điều phối task, DAG, và gate quyết định.',
    how_en: 'Handles structured coordination: blocking ask/reply flows, worker completion waits, coordinator loops, and decomposing work across agents. For full ownership handoffs, the lighter orca-cli path is preferred instead.',
    how_vi: 'Xử lý điều phối có cấu trúc: luồng ask/reply chặn, chờ worker hoàn tất, vòng lặp coordinator, và chia việc giữa các agent. Với bàn giao sở hữu trọn vẹn, đường orca-cli nhẹ hơn được ưu tiên hơn.',
  },
  {
    id: 'computer-use',
    name: 'computer-use',
    command: '/computer-use',
    category: 'platform',
    public: false,
    desc_en: 'Inspects and operates local desktop app windows through accessibility trees, screenshots, and safe UI actions.',
    desc_vi: 'Quan sát và điều khiển cửa sổ app desktop cục bộ qua accessibility tree, screenshot, và các thao tác UI an toàn.',
    how_en: 'Lists apps and windows, reads visible UI, and performs clicks, typing, scrolling, and drag actions — including browser windows and the Orca app itself. Used when a task touches desktop UI outside the terminal.',
    how_vi: 'Liệt kê app và cửa sổ, đọc UI hiển thị, và thực hiện click, gõ phím, cuộn, kéo thả — kể cả cửa sổ browser và chính app Orca. Dùng khi tác vụ chạm vào UI desktop ngoài terminal.',
  },
];
