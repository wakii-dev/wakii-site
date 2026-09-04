/**
 * Landing strings — PLACEHOLDER copy (direction-c.html), EN is source of truth.
 * SF-2 owns real landing copy; structure here is locked to the approved direction.
 */

export interface LandingStrings {
  lang: 'en' | 'vi';
  hero: {
    termTitle: string;
    boot: string[];
    lastCmd: string;
    kicker: string;
    headlineBefore: string;
    headlineHighlight: string;
    tagline: string;
    taglineCode: string;
    ctaPrimary: string;
    ctaGhost: string;
    stats: { v: string; k: string }[];
  };
  zero: { status: string; title: string; desc: string }[];
  features: {
    kicker: string;
    title: string;
    sub: string;
    items: { id: string; cat: string; name: string; desc: string; flag: string }[];
  };
  workflow: { kicker: string; title: string; stages: string[]; planNote: string; legend: string; note: string };
  quickstart: {
    kicker: string;
    title: string;
    steps: { n: string; comment: string; title: string; desc: string; cmd: string }[];
    more: string;
    moreLink: string;
  };
  faq: { kicker: string; title: string; items: { q: string; a: string }[] };
}

export const en: LandingStrings = {
  lang: 'en',
  hero: {
    termTitle: 'wakii — zsh',
    boot: [
      '› resolving project context … done',
      '› bundled plugin loaded · kit → ~/.claude · team enabled',
      '› 9 agents online · superpowers panel ready',
    ],
    lastCmd: '/superpowers "ship the next feature while I get coffee"',
    kicker: 'agentic ide // open source // fork of orca',
    headlineBefore: 'Your IDE just hired ',
    headlineHighlight: 'a team',
    tagline: 'Wakii is an agentic IDE with a built-in superpowers team — plugin bundled, kit auto-installed to ',
    taglineCode: '~/.claude',
    ctaPrimary: 'get wakii — build from source',
    ctaGhost: 'read the guide',
    stats: [
      { v: '9', k: 'agents, role-gated' },
      { v: '0', k: 'setup steps' },
      { v: '1', k: 'PR per story' },
      { v: 'MIT', k: 'fork of orca' },
    ],
  },
  zero: [
    { status: 'bootstrap 0.0s', title: 'Bundled plugin', desc: 'Superpowers ships inside the app. No marketplace, no version juggling.' },
    { status: 'install ~/.claude', title: 'Kit auto-installs', desc: 'Skills land in ~/.claude on first launch. You never touch a config file.' },
    { status: 'config enabled=true', title: 'Enabled by default', desc: 'The team is on when you open Wakii. Opt out per-project — not opt in.' },
  ],
  features: {
    kicker: 'capabilities',
    title: 'features.sh',
    sub: 'Six systems, one pipeline. Each one exists to move a story from spoken idea to verified pull request.',
    items: [
      { id: 'sf.001', cat: 'core', name: 'Story system', desc: 'Epics decompose into spec slices — SF brackets — each with explicit scope, so nothing ships half-understood.', flag: 'epic → SF bracket' },
      { id: 'sf.002', cat: 'ui', name: 'Bracket canvas panel', desc: 'The whole story map on a live canvas beside your editor — dependencies, status, gates at a glance.', flag: 'visual tracking' },
      { id: 'sf.003', cat: 'team', name: '9-agent team + gates', desc: 'Coordinators, designers, executors, verifiers. Gates between roles mean nothing passes unchecked.', flag: 'role-gated' },
      { id: 'sf.004', cat: 'reliability', name: 'Watchdog auto-complete', desc: 'Catches stalls and unfinished hand-offs, then drives the work to completion on its own.', flag: 'no babysitting' },
      { id: 'sf.005', cat: 'memory', name: 'Memory & learning loop', desc: 'Decisions, verdicts and patterns persist across sessions. The team gets sharper every story.', flag: 'persistent context' },
      { id: 'sf.006', cat: 'design', name: 'Figma-to-verify pipeline', desc: 'Design files in, prototypes out — and verifiers check the build against the source of truth.', flag: 'design-accurate' },
    ],
  },
  workflow: {
    kicker: 'pipeline',
    title: 'cat workflow.md',
    stages: ['idea', 'impact', 'plan', 'parallel SFs', 'verify gates', '1 PR / story'],
    planNote: '(linear subtasks)',
    legend: '▮ highlighted stage = agents executing concurrently',
    note: 'The pipeline runs in the open. Track every slice, gate and verdict live in the Superpowers panel and the bracket canvas — while the watchdog makes sure nothing stalls.',
  },
  quickstart: {
    kicker: 'getting started',
    title: 'quickstart — 3 steps',
    steps: [
      { n: 'step 01', comment: '// build', title: 'Build Wakii', desc: 'Clone and build from source. One command, fully self-contained.', cmd: 'git clone wakii && make' },
      { n: 'step 02', comment: '// open', title: 'Open a project', desc: 'The kit installs itself on first launch. Nothing to configure.', cmd: 'wakii ./your-project' },
      { n: 'step 03', comment: '// delegate', title: 'Describe an idea', desc: 'The team plans, executes in parallel, hands you one verified PR.', cmd: '/superpowers "add dark mode"' },
    ],
    more: 'just the teaser — the',
    moreLink: 'full usage guide',
  },
  faq: {
    kicker: 'faq',
    title: 'frequently asked',
    items: [
      { q: 'Is Wakii really zero-setup?', a: 'Yes. The plugin is bundled in the app and the skills kit installs itself to ~/.claude on first launch, enabled by default. Open Wakii — the team is already there.' },
      { q: 'How is this different from an AI plugin in my editor?', a: 'A plugin gives you a chat window. Wakii gives you a team: nine agents with defined roles, gates between them, a watchdog that completes stalled work, and memory that compounds across sessions.' },
      { q: 'What does "one PR per story" mean?', a: 'Each story — however many agents and spec slices it takes — lands as one clean, reviewable pull request with verification behind it. No PR storms, no half-merged states.' },
      { q: "What is Wakii's relationship to Orca?", a: 'Wakii is an open-source fork of Orca, which is MIT licensed. We credit the upstream project fully and build the superpowers team on top of it.' },
    ],
  },
};

export const vi: LandingStrings = {
  lang: 'vi',
  hero: {
    termTitle: 'wakii — zsh',
    boot: [
      '› đang đọc ngữ cảnh dự án … xong',
      '› plugin đóng gói sẵn đã load · kit → ~/.claude · team đã bật',
      '› 9 agents online · superpowers panel sẵn sàng',
    ],
    lastCmd: '/superpowers "ship tính năng tiếp theo trong lúc tôi pha cà phê"',
    kicker: 'agentic ide // mã nguồn mở // fork của orca',
    headlineBefore: 'IDE của bạn vừa có ',
    headlineHighlight: 'một team',
    tagline: 'Wakii là một agentic IDE với team superpowers tích hợp sẵn — plugin đóng gói sẵn, kit tự cài vào ',
    taglineCode: '~/.claude',
    ctaPrimary: 'get wakii — build từ mã nguồn',
    ctaGhost: 'đọc hướng dẫn',
    stats: [
      { v: '9', k: 'agents, phân vai' },
      { v: '0', k: 'bước cài đặt' },
      { v: '1', k: 'PR mỗi story' },
      { v: 'MIT', k: 'fork của orca' },
    ],
  },
  zero: [
    { status: 'bootstrap 0.0s', title: 'Plugin đóng gói sẵn', desc: 'Superpowers nằm sẵn trong app. Không marketplace, không lo version.' },
    { status: 'install ~/.claude', title: 'Kit tự cài đặt', desc: 'Skills nằm trong ~/.claude ngay lần mở đầu tiên. Bạn không đụng vào config nào.' },
    { status: 'config enabled=true', title: 'Bật sẵn mặc định', desc: 'Team đã bật khi bạn mở Wakii. Tắt theo từng dự án — không phải opt in.' },
  ],
  features: {
    kicker: 'năng lực',
    title: 'features.sh',
    sub: 'Sáu hệ thống, một pipeline. Mỗi hệ thống đưa một story từ ý tưởng nói ra tới pull request đã verify.',
    items: [
      { id: 'sf.001', cat: 'core', name: 'Hệ thống story', desc: 'Epic được tách thành các spec slice — SF bracket — mỗi slice phạm vi rõ ràng, không thứ nào ship nửa vời.', flag: 'epic → SF bracket' },
      { id: 'sf.002', cat: 'ui', name: 'Bracket canvas panel', desc: 'Toàn bộ sơ đồ story trên canvas sống ngay cạnh editor — dependency, trạng thái, gate nhìn một phát hiểu ngay.', flag: 'theo dõi trực quan' },
      { id: 'sf.003', cat: 'team', name: 'Team 9 agents + gates', desc: 'Coordinator, designer, executor, verifier. Gate giữa các vai — không gì lọt qua khi chưa được kiểm.', flag: 'phân vai' },
      { id: 'sf.004', cat: 'reliability', name: 'Watchdog tự hoàn tất', desc: 'Bắt các work stalled và hand-off dở dang, rồi tự đưa tới hoàn thành.', flag: 'không cần trông nom' },
      { id: 'sf.005', cat: 'memory', name: 'Memory & vòng học hỏi', desc: 'Quyết định, verdict và pattern được lưu qua các session. Team càng làm càng sắc.', flag: 'ngữ cảnh bền vững' },
      { id: 'sf.006', cat: 'design', name: 'Pipeline Figma-to-verify', desc: 'File design vào, prototype ra — và verifier đối chiếu build với nguồn chuẩn.', flag: 'đúng design' },
    ],
  },
  workflow: {
    kicker: 'pipeline',
    title: 'cat workflow.md',
    stages: ['ý tưởng', 'tác động', 'kế hoạch', 'SF song song', 'cổng verify', '1 PR / story'],
    planNote: '(subtask linear)',
    legend: '▮ stage nổi bật = các agent chạy đồng thời',
    note: 'Pipeline chạy công khai. Theo dõi từng slice, gate và verdict trực tiếp trong Superpowers panel và bracket canvas — trong khi watchdog đảm bảo không gì bị stall.',
  },
  quickstart: {
    kicker: 'bắt đầu',
    title: 'quickstart — 3 bước',
    steps: [
      { n: 'bước 01', comment: '// build', title: 'Build Wakii', desc: 'Clone và build từ mã nguồn. Một lệnh, tự chứa đầy đủ.', cmd: 'git clone wakii && make' },
      { n: 'bước 02', comment: '// mở', title: 'Mở một dự án', desc: 'Kit tự cài ngay lần mở đầu tiên. Không cần cấu hình gì.', cmd: 'wakii ./your-project' },
      { n: 'bước 03', comment: '// giao việc', title: 'Mô tả ý tưởng', desc: 'Team lên kế hoạch, chạy song song, trao bạn một PR đã verify.', cmd: '/superpowers "thêm dark mode"' },
    ],
    more: 'chỉ là teaser —',
    moreLink: 'toàn bộ hướng dẫn sử dụng',
  },
  faq: {
    kicker: 'faq',
    title: 'câu hỏi thường gặp',
    items: [
      { q: 'Wakii có thật sự zero-setup?', a: 'Có. Plugin được đóng gói sẵn trong app và bộ skills kit tự cài vào ~/.claude ngay lần mở đầu, bật sẵn mặc định. Mở Wakii — team đã ở đó.' },
      { q: 'Khác gì một AI plugin trong editor?', a: 'Plugin cho bạn một cửa sổ chat. Wakii cho bạn một team: chín agent với vai trò rõ ràng, gate giữa chúng, một watchdog hoàn tất work stalled, và memory tích lũy qua các session.' },
      { q: '"Một PR mỗi story" nghĩa là gì?', a: 'Mỗi story — dù cần bao nhiêu agent và spec slice — hạ cánh thành một pull request sạch, review được, có verify phía sau. Không mưa PR, không trạng thái merge dở.' },
      { q: 'Wakii liên quan gì tới Orca?', a: 'Wakii là fork mã nguồn mở của Orca, vốn MIT licensed. Chúng tôi credit đầy đủ dự án upstream và xây team superpowers trên đó.' },
    ],
  },
};
